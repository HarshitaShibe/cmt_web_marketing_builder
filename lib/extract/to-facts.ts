import { z } from "zod";
import { callLLM, parseJSON, hasLLM } from "@/lib/ai/client";
import {
  ConferenceFactsSchema,
  CONFERENCE_TYPES,
  type ConferenceFacts,
} from "@/lib/schema";
import { truncateForModel } from "@/lib/extract/pdf";

/** What we ask the model for. Deliberately flat and forgiving. */
const ExtractedSchema = z.object({
  name: z.string().default(""),
  acronym: z.string().default(""),
  tagline: z.string().default(""),
  type: z.enum(CONFERENCE_TYPES).default("international-conference"),
  organizer: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  deadlines: z
    .array(z.object({ label: z.string(), date: z.string() }))
    .default([]),
  venue: z
    .object({
      name: z.string().default(""),
      address: z.string().default(""),
      city: z.string().default(""),
      country: z.string().default(""),
    })
    .default({ name: "", address: "", city: "", country: "" }),
  committee: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().default(""),
        affiliation: z.string().default(""),
      })
    )
    .default([]),
  speakers: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().default(""),
        affiliation: z.string().default(""),
      })
    )
    .default([]),
  topics: z.array(z.string()).default([]),
  fees: z
    .array(
      z.object({
        category: z.string(),
        amount: z.number(),
        currency: z.string().default("INR"),
        note: z.string().default(""),
      })
    )
    .default([]),
  submissionUrl: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  about: z.string().default(""),
});

export type ExtractionResult = {
  facts: ConferenceFacts;
  confidence: "high" | "partial" | "none";
  found: string[];
  missing: string[];
  note?: string;
};

const SYSTEM = `You extract structured data from conference brochures and calls for papers.

Rules:
- Return ONLY a JSON object. No preamble, no code fences.
- Extract only what the document actually states. Never guess or invent.
- If a field is absent, use "" for strings, [] for arrays. Do not fill gaps with plausible values.
- Dates: use ISO format YYYY-MM-DD where a full date is given; otherwise copy the text as written.
- Fees: amount must be a number with no separators (e.g. 3500, not "3,500").
- Copy names and affiliations exactly as printed, including titles.`;

function detectPlatform(url: string): ConferenceFacts["submission"]["platform"] {
  const u = url.toLowerCase();
  if (u.includes("cmt3") || u.includes("cmt.research")) return "cmt";
  if (u.includes("easychair")) return "easychair";
  if (u.includes("openreview")) return "openreview";
  return url ? "other" : "none";
}

export async function extractFacts(text: string): Promise<ExtractionResult> {
  const empty = ConferenceFactsSchema.parse({});

  if (!hasLLM()) {
    return {
      facts: empty,
      confidence: "none",
      found: [],
      missing: ["everything"],
      note: "No model configured, so nothing could be extracted from the document.",
    };
  }

  const response = await callLLM({
    system: SYSTEM,
    maxTokens: 3000,
    timeoutMs: 45000,
    prompt: `Extract the conference details from this document.

Return JSON with these keys:
{
  "name": "", "acronym": "", "tagline": "", "type": "international-conference|national-conference|workshop|symposium|seminar|fdp|hackathon",
  "organizer": "", "startDate": "", "endDate": "",
  "deadlines": [{"label": "Paper submission", "date": "2027-01-15"}],
  "venue": {"name": "", "address": "", "city": "", "country": ""},
  "committee": [{"name": "", "role": "", "affiliation": ""}],
  "speakers": [{"name": "", "role": "", "affiliation": ""}],
  "topics": [],
  "fees": [{"category": "Student", "amount": 3500, "currency": "INR", "note": ""}],
  "submissionUrl": "", "email": "", "phone": "",
  "about": "the descriptive paragraphs about the conference, copied from the document"
}

DOCUMENT:
${truncateForModel(text)}`,
  });

  const raw = parseJSON<unknown>(response);
  if (!raw) {
    return {
      facts: empty,
      confidence: "none",
      found: [],
      missing: ["everything"],
      note: "The document could not be read. You can still build the site from the wizard.",
    };
  }

  const parsed = ExtractedSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      facts: empty,
      confidence: "none",
      found: [],
      missing: ["everything"],
      note: "The extracted data did not match the expected shape.",
    };
  }

  const d = parsed.data;

  const facts = ConferenceFactsSchema.parse({
    name: d.name,
    acronym: d.acronym || undefined,
    tagline: d.tagline || undefined,
    type: d.type,
    organizer: d.organizer || undefined,
    startDate: d.startDate || undefined,
    endDate: d.endDate || undefined,
    deadlines: d.deadlines,
    venue: {
      name: d.venue.name || undefined,
      address: d.venue.address || undefined,
      city: d.venue.city || undefined,
      country: d.venue.country || undefined,
    },
    committee: d.committee.map((c) => ({
      name: c.name,
      role: c.role || undefined,
      affiliation: c.affiliation || undefined,
    })),
    speakers: d.speakers.map((s) => ({
      name: s.name,
      role: s.role || undefined,
      affiliation: s.affiliation || undefined,
    })),
    topics: d.topics,
    fees: d.fees.map((f) => ({
      category: f.category,
      amount: f.amount,
      currency: f.currency,
      note: f.note || undefined,
    })),
    submission: {
      platform: detectPlatform(d.submissionUrl),
      url: d.submissionUrl || undefined,
      label: "Submit your paper",
    },
    contact: { email: d.email || undefined, phone: d.phone || undefined },
    raw: d.about ? { about: d.about } : {},
  });

  // Report what was actually found, so the UI can be honest about it.
  const checks: [string, boolean][] = [
    ["name", Boolean(facts.name)],
    ["dates", Boolean(facts.startDate) || facts.deadlines.length > 0],
    ["venue", Boolean(facts.venue.city || facts.venue.name)],
    ["committee", facts.committee.length > 0],
    ["speakers", facts.speakers.length > 0],
    ["topics", facts.topics.length > 0],
    ["fees", facts.fees.length > 0],
    ["contact", Boolean(facts.contact.email)],
    ["about text", Boolean(facts.raw.about)],
  ];

  const found = checks.filter(([, ok]) => ok).map(([k]) => k);
  const missing = checks.filter(([, ok]) => !ok).map(([k]) => k);

  return {
    facts,
    confidence: found.length >= 6 ? "high" : found.length >= 2 ? "partial" : "none",
    found,
    missing,
  };
}