import { z } from "zod";
import { callLLM, parseJSON, hasLLM } from "@/lib/ai/client";
import type { ConferenceFacts, KitCaption, KitFields } from "@/lib/schema";

const CaptionSetSchema = z.object({
  instagram: z.object({
    text: z.string().min(20).max(400),
    hashtags: z.array(z.string().max(30)).min(3).max(10),
  }),
  linkedin: z.object({
    text: z.string().min(40).max(700),
    hashtags: z.array(z.string().max(30)).min(2).max(6),
  }),
  twitter: z.object({
    text: z.string().min(20).max(240),
    hashtags: z.array(z.string().max(30)).min(1).max(4),
  }),
});

const SYSTEM = `You write social media captions announcing academic and professional conferences.

Rules:
- Return ONLY a JSON object. No preamble, no code fences, no commentary.
- Sound natural and human, never robotic or generic ("Exciting news!!!").
- Use at most 1-2 tasteful emoji per caption, or none at all.
- Never invent facts you were not given (no fake dates, numbers, speaker names).
- hashtags are plain words without the # symbol — it is added when displayed.
- Instagram: warm, visual, community-oriented, short line breaks are fine.
- LinkedIn: professional, credibility-focused, ties the event to its field.
- X (Twitter): punchy, must fit within 240 characters including hashtags, no line breaks.`;

function buildPrompt(facts: ConferenceFacts, fields: KitFields) {
  const known = [
    facts.name && `Name: ${facts.name}`,
    facts.acronym && `Acronym: ${facts.acronym}`,
    facts.tagline && `Tagline: ${facts.tagline}`,
    fields.dateLine && `Dates: ${fields.dateLine}`,
    fields.venueLine && `Venue: ${fields.venueLine}`,
    facts.topics.length > 0 && `Topics: ${facts.topics.slice(0, 6).join(", ")}`,
    fields.ctaLabel && `Call to action: ${fields.ctaLabel}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Write launch-announcement captions for this conference.

Known details:
${known || "(minimal details provided — write general but credible copy)"}

Return JSON with exactly these keys:
{
  "instagram": {"text": "...", "hashtags": ["...", "..."]},
  "linkedin": {"text": "...", "hashtags": ["...", "..."]},
  "twitter": {"text": "...", "hashtags": ["...", "..."]}
}`;
}

function fallbackCaptions(facts: ConferenceFacts, fields: KitFields): KitCaption[] {
  const name = facts.acronym || facts.name || "our conference";
  const where = [fields.dateLine, fields.venueLine].filter(Boolean).join(" · ");

  return [
    {
      platform: "instagram",
      text: `${name} is coming! ${where ? `Join us ${where}. ` : ""}${fields.ctaLabel} — link in bio.`,
      hashtags: ["conference", "callforpapers", "academia"],
    },
    {
      platform: "linkedin",
      text: `We're pleased to announce ${facts.name || name}.${
        where ? ` Taking place ${where}.` : ""
      } We welcome researchers, practitioners, and students to take part. ${fields.ctaLabel} today.`,
      hashtags: ["conference", "research", "networking"],
    },
    {
      platform: "twitter",
      text: `${name} is here.${where ? ` ${where}.` : ""} ${fields.ctaLabel} now.`,
      hashtags: ["conference"],
    },
  ];
}

/**
 * Returns AI-written captions, or hand-written fallback captions if anything
 * goes wrong: no API key, network failure, timeout, malformed JSON, or
 * failed validation. Same reliability contract as rewriteCopy().
 */
export async function generateCaptions(
  facts: ConferenceFacts,
  fields: KitFields
): Promise<KitCaption[]> {
  if (!hasLLM()) return fallbackCaptions(facts, fields);

  const text = await callLLM({ system: SYSTEM, prompt: buildPrompt(facts, fields), maxTokens: 900 });
  const raw = parseJSON<unknown>(text);
  if (!raw) return fallbackCaptions(facts, fields);

  const parsed = CaptionSetSchema.safeParse(raw);
  if (!parsed.success) return fallbackCaptions(facts, fields);

  return [
    { platform: "instagram", ...parsed.data.instagram },
    { platform: "linkedin", ...parsed.data.linkedin },
    { platform: "twitter", ...parsed.data.twitter },
  ];
}