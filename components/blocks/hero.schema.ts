import { z } from "zod";

/**
 * Kept out of hero.tsx because that file is a client component.
 * Server code (the composer, validateBlock) needs this schema, and
 * non-component exports from "use client" modules aren't reliably
 * available across the boundary.
 */
export const HeroSchema = z.object({
  id: z.string(),
  acronym: z.string().default(""),
  heading: z.string().default("Conference name"),
  tagline: z.string().default(""),
  dateLine: z.string().default(""),
  venueLine: z.string().default(""),
  ctaLabel: z.string().default("Register"),
  ctaHref: z.string().default("#registration"),
  secondaryLabel: z.string().default(""),
  secondaryHref: z.string().default(""),
  backgroundImage: z.string().default(""),
  overlayStrength: z.enum(["light", "medium", "strong"]).default("medium"),
  conferenceLogo: z.string().default(""),
  organizationLogo: z.string().default(""),
  sponsorLogos: z
    .array(z.object({ url: z.string(), alt: z.string() }))
    .default([]),
  showCountdown: z.boolean().default(true),
  countdownTo: z.string().default(""),
  align: z.enum(["left", "center"]).default("left"),
});

export type HeroProps = z.infer<typeof HeroSchema>;