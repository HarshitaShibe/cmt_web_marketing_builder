import { z } from "zod";
import { ThemeTokensSchema } from "./theme";
import { ConferenceFactsSchema, ImageSchema } from "./facts";

export const BLOCK_TYPES = [
  "Hero",
  "AboutSection",
  "ImportantDates",
  "SpeakerGrid",
  "RegistrationFees",
  "Footer",
] as const;

export const BlockTypeSchema = z.enum(BLOCK_TYPES);

export const BlockSchema = z.object({
  type: BlockTypeSchema,
  props: z.object({ id: z.string() }).passthrough(),
});

export const PuckDataSchema = z.object({
  root: z.object({ props: z.record(z.string(), z.unknown()).default({}) }).default({ props: {} }),
  content: z.array(BlockSchema).default([]),
  zones: z.record(z.string(), z.array(BlockSchema)).default({}),
});

export const SeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: ImageSchema.optional(),
});

export const PageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  enabled: z.boolean().default(true),
  order: z.number().default(0),
  seo: SeoSchema.default({}),
  layout: PuckDataSchema,
});

export const NavItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const DomainSchema = z.object({
  slug: z.string(),
  customDomain: z.string().nullable().default(null),
  domainStatus: z.enum(["none", "pending", "verified"]).default("none"),
});

export const SiteSettingsSchema = z.object({
  domain: DomainSchema,
  seo: SeoSchema.default({}),
  favicon: ImageSchema.optional(),
  analyticsId: z.string().optional(),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string() })).default([]),
});

export const SiteSchema = z.object({
  id: z.string(),
  slug: z.string(),
  meta: ConferenceFactsSchema,
  theme: ThemeTokensSchema,
  nav: z.array(NavItemSchema).default([]),
  pages: z.array(PageSchema).default([]),
  settings: SiteSettingsSchema,
  version: z.number().default(1),
});

export type BlockType = z.infer<typeof BlockTypeSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type PuckData = z.infer<typeof PuckDataSchema>;
export type Page = z.infer<typeof PageSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
export type Site = z.infer<typeof SiteSchema>;