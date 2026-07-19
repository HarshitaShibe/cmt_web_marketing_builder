import { z } from "zod";

export const CONFERENCE_TYPES = [
  "international-conference",
  "national-conference",
  "workshop",
  "symposium",
  "seminar",
  "fdp",
  "hackathon",
] as const;

export const ConferenceTypeSchema = z.enum(CONFERENCE_TYPES);

export const ImageSchema = z.object({
  url: z.string(),
  alt: z.string().default(""),
});

export const DeadlineSchema = z.object({
  label: z.string(),
  date: z.string(),
});

export const PersonSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  affiliation: z.string().optional(),
  bio: z.string().optional(),
  photo: ImageSchema.optional(),
});

export const FeeSchema = z.object({
  category: z.string(),
  amount: z.number(),
  currency: z.string().default("INR"),
  note: z.string().optional(),
});

export const VenueSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  mapUrl: z.string().optional(),
});

export const SubmissionSchema = z.object({
  platform: z
    .enum(["cmt", "easychair", "openreview", "internal", "other", "none"])
    .default("none"),
  url: z.string().optional(),
  label: z.string().default("Submit your paper"),
});

export const ConferenceFactsSchema = z.object({
  name: z.string().default(""),
  acronym: z.string().optional(),
  tagline: z.string().optional(),
  type: ConferenceTypeSchema.default("international-conference"),
  organizer: z.string().optional(),
  logo: ImageSchema.optional(),
  organizationLogo: ImageSchema.optional(),
  banner: ImageSchema.optional(),

  startDate: z.string().optional(),
  endDate: z.string().optional(),
  deadlines: z.array(DeadlineSchema).default([]),

  venue: VenueSchema.default({}),
  committee: z.array(PersonSchema).default([]),
  speakers: z.array(PersonSchema).default([]),
  topics: z.array(z.string()).default([]),
  fees: z.array(FeeSchema).default([]),
  sponsors: z.array(z.object({ name: z.string(), logo: ImageSchema.optional() })).default([]),

  submission: SubmissionSchema.prefault({}),

  contact: z
    .object({ email: z.string().optional(), phone: z.string().optional() })
    .default({}),

  raw: z.record(z.string(), z.string()).default({}),
});

export type Image = z.infer<typeof ImageSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Fee = z.infer<typeof FeeSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type ConferenceType = z.infer<typeof ConferenceTypeSchema>;
export type ConferenceFacts = z.infer<typeof ConferenceFactsSchema>;

export const emptyFacts = (): ConferenceFacts => ConferenceFactsSchema.parse({});