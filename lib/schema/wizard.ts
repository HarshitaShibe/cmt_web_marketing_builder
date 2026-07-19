import { z } from "zod";
import {
  ConferenceTypeSchema,
  ImageSchema,
  DeadlineSchema,
  VenueSchema,
  SubmissionSchema,
} from "./facts";

export const TEMPLATE_IDS = [
  "academic-classic",
  "modern-minimal",
  "corporate-summit",
  "innovation-ai",
  "university-heritage",
  "medical-health",
  "creative-vibrant",
] as const;

export const FONT_PAIR_IDS = [
  "modern",
  "elegant",
  "academic",
  "professional",
  "minimal",
  "corporate",
] as const;

/** Everything the organiser can switch on or off before entering the editor. */
export const SECTION_KEYS = [
  "hero",
  "countdown",
  "about",
  "important-dates",
  "call-for-papers",
  "publication",
  "registration",
  "program",
  "speakers",
  "committee",
  "venue",
  "sponsors",
  "history",
  "hall-of-fame",
  "hotels",
  "visa",
  "faqs",
  "gallery",
  "contact",
] as const;

export const PAGE_KEYS = [
  "home",
  "about",
  "call-for-papers",
  "publication",
  "registration",
  "program",
  "speakers",
  "committee",
  "venue",
  "sponsors",
  "history",
  "hotels",
  "visa",
  "faqs",
  "gallery",
  "contact",
] as const;

export const WizardInputSchema = z.object({
  // ---- Step 1: basic details ----
  conferenceType: ConferenceTypeSchema.default("international-conference"),
  name: z.string().default(""),
  acronym: z.string().optional(),
  organizer: z.string().optional(),
  theme: z.string().optional(),
  publisher: z.string().optional(),
  venueName: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  // ---- Step 1: assets ----
  conferenceLogo: ImageSchema.optional(),
  organizationLogo: ImageSchema.optional(),
  sponsorLogos: z.array(ImageSchema).default([]),
  heroImage: ImageSchema.optional(),
  venueImages: z.array(ImageSchema).default([]),

  // ---- Step 1: links ----
  submissionUrl: z.string().optional(),
  registrationUrl: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),

  // ---- Step 2 & 3: look ----
  templateId: z.enum(TEMPLATE_IDS).default("academic-classic"),
  fontPairId: z.enum(FONT_PAIR_IDS).default("modern"),

  // ---- Step 4: structure ----
  sections: z
    .array(z.enum(SECTION_KEYS))
    .default([
      "hero",
      "countdown",
      "about",
      "important-dates",
      "call-for-papers",
      "registration",
      "speakers",
      "committee",
      "venue",
      "contact",
    ]),
  pages: z.array(z.enum(PAGE_KEYS)).default(["home"]),

  // ---- Optional extras ----
  deadlines: z.array(DeadlineSchema).default([]),
  venue: VenueSchema.optional(),
  submission: SubmissionSchema.optional(),
  notes: z.string().optional(),
});

export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type FontPairId = (typeof FONT_PAIR_IDS)[number];
export type SectionKey = (typeof SECTION_KEYS)[number];
export type PageKey = (typeof PAGE_KEYS)[number];
export type WizardInput = z.infer<typeof WizardInputSchema>;