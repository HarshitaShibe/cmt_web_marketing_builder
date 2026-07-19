import { z } from "zod";
import { callLLM, parseJSON, hasLLM } from "@/lib/ai/client";
import type { ConferenceFacts } from "@/lib/schema";
import type { Template } from "@/lib/templates";

/** Only strings. The model never chooses blocks, order, or layout. */
export const GeneratedCopySchema = z.object({
  heroTagline: z.string().min(10).max(180),
  aboutHeading: z.string().min(4).max(80),
  aboutBody: z.string().min(60).max(1200),
  stats: z
    .array(z.object({ value: z.string().max(12), label: z.string().max(40) }))
    .length(3),
  feeNote: z.string().min(20).max(300),
  speakersHeading: z.string().min(3).max(60),
});

export type GeneratedCopy = z.infer<typeof GeneratedCopySchema>;

const TONE: Record<string, string> = {
  "academic-classic": "formal and precise, suitable for a peer-reviewed venue",
  "modern-minimal": "spare and direct, short sentences, no filler",
  "corporate-summit": "professional and businesslike, outcome-focused",
  "innovation-ai": "sharp and contemporary, technically confident",
  "university-heritage": "measured and institutional, respectful of tradition",
  "medical-health": "clear and clinical, precise without jargon",
  "creative-vibrant": "energetic and welcoming, plain language",
};

const SYSTEM = `You write copy for academic and professional conference websites.

Rules:
- Return ONLY a JSON object. No preamble, no code fences, no commentary.
- Write in British English, plain prose, no marketing clichés ("unlock", "cutting-edge", "game-changing", "dive into").
- Never invent specific facts: no real dates, real names, real institutions, real figures, real prize amounts.
- Where a number is needed but unknown, use a placeholder like "000+" or "00".
- aboutBody must be exactly two paragraphs separated by a single newline character.
- Keep every field within its stated length.`;

function buildPrompt(facts: ConferenceFacts, template: Template, style: string) {
  const known = [
    facts.name && `Name: ${facts.name}`,
    facts.acronym && `Acronym: ${facts.acronym}`,
    facts.tagline && `Organiser's tagline: ${facts.tagline}`,
    facts.organizer && `Organising body: ${facts.organizer}`,
    facts.venue.city && `City: ${facts.venue.city}`,
    facts.startDate && `Starts: ${facts.startDate}`,
    facts.topics.length > 0 && `Topics: ${facts.topics.slice(0, 8).join(", ")}`,
    facts.raw.notes && `Organiser's notes: ${facts.raw.notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Write website copy for this event.

Event type: ${template.label}
Tone: ${TONE[style] ?? TONE["academic-classic"]}

Known details:
${known || "(none provided — write generic copy appropriate to the event type)"}

Return JSON with exactly these keys:
{
  "heroTagline": "one sentence under the conference name, max 180 chars",
  "aboutHeading": "heading for the about section",
  "aboutBody": "two paragraphs separated by \\n",
  "stats": [{"value": "000+", "label": "Expected attendees"}, {"value": "00", "label": "..."}, {"value": "00+", "label": "..."}],
  "feeNote": "one or two sentences explaining what registration includes",
  "speakersHeading": "heading for the speakers section"
}`;
}

/**
 * Returns AI-written copy, or the template's static copy if anything goes wrong:
 * no API key, network failure, timeout, malformed JSON, or failed validation.
 */
export async function rewriteCopy(
  facts: ConferenceFacts,
  template: Template,
  style: string
): Promise<{ copy: Template["copy"]; source: "ai" | "template" }> {
  if (!hasLLM()) return { copy: template.copy, source: "template" };

  const text = await callLLM({
    system: SYSTEM,
    prompt: buildPrompt(facts, template, style),
    maxTokens: 1200,
  });

  const raw = parseJSON<unknown>(text);
  if (!raw) return { copy: template.copy, source: "template" };

  const parsed = GeneratedCopySchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("LLM copy failed validation:", parsed.error.message.slice(0, 200));
    return { copy: template.copy, source: "template" };
  }

  // Merge: AI supplies prose, template keeps structural content (deadlines, tiers).
  return {
    copy: {
      ...template.copy,
      heroTagline: parsed.data.heroTagline,
      aboutHeading: parsed.data.aboutHeading,
      aboutBody: parsed.data.aboutBody,
      stats: parsed.data.stats,
      feeNote: parsed.data.feeNote,
      speakersHeading: parsed.data.speakersHeading,
    },
    source: "ai",
  };
}