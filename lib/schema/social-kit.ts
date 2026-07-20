import { z } from "zod";
import { ImageSchema } from "./facts";
import { ThemeColorsSchema } from "./theme";
import { FONT_PAIR_IDS } from "./wizard";

export const KIT_STYLE_IDS = [
  "academic-classic",
  "modern-minimal",
  "corporate-summit",
  "innovation-ai",
  "university-heritage",
  "medical-health",
  "creative-vibrant",
] as const;

export const KitStyleIdSchema = z.enum(KIT_STYLE_IDS);

export const KIT_PLATFORMS = ["instagram", "linkedin", "twitter"] as const;
export const KitPlatformSchema = z.enum(KIT_PLATFORMS);

export const KIT_BRANDING_SOURCES = ["auto", "institution", "conference", "custom"] as const;
export const KitBrandingSourceSchema = z.enum(KIT_BRANDING_SOURCES);

/** The 3 visually distinct poster archetypes every kit draws from. */
export const KIT_LAYOUTS = ["editorial", "bold", "split"] as const;
export const KitLayoutSchema = z.enum(KIT_LAYOUTS);
export type KitLayout = z.infer<typeof KitLayoutSchema>;

export const SocialKitConfigSchema = z.object({
  platforms: z.array(KitPlatformSchema).default([...KIT_PLATFORMS]),
  styleId: KitStyleIdSchema.default("academic-classic"),
  brandingSource: KitBrandingSourceSchema.default("auto"),
  customColors: ThemeColorsSchema.partial().optional(),
});

export const KitCaptionSchema = z.object({
  platform: KitPlatformSchema,
  text: z.string().default(""),
  hashtags: z.array(z.string()).default([]),
});

export const KitFieldsSchema = z.object({
  headline: z.string().default(""),
  subheading: z.string().default(""),
  dateLine: z.string().default(""),
  venueLine: z.string().default(""),
  ctaLabel: z.string().default("Register Now"),
  image: ImageSchema.optional(),
});

// ---------------------------------------------------------------------------
// Curated, bounded presentation controls. Every option here is a small enum
// so the editor stays a handful of clean choices — never an open canvas.
// fontPairId reuses the website builder's own curated font system rather
// than inventing a second one.
// ---------------------------------------------------------------------------

export const KIT_HEADLINE_WEIGHTS = ["medium", "semibold", "bold", "black"] as const;
export const KIT_HEADLINE_SIZES = ["sm", "md", "lg"] as const;
export const KIT_TEXT_ALIGNS = ["left", "center"] as const;
export const KIT_IMAGE_FITS = ["cover", "contain"] as const;
export const KIT_IMAGE_POSITIONS = ["top", "center", "bottom"] as const;
export const KIT_LOGO_SIZES = ["sm", "md", "lg"] as const;
export const KIT_PADDINGS = ["compact", "normal", "airy"] as const;
export const KIT_RADII = ["none", "sm", "md", "lg", "full"] as const;

export const KitHeadlineWeightSchema = z.enum(KIT_HEADLINE_WEIGHTS);
export const KitHeadlineSizeSchema = z.enum(KIT_HEADLINE_SIZES);
export const KitTextAlignSchema = z.enum(KIT_TEXT_ALIGNS);
export const KitImageFitSchema = z.enum(KIT_IMAGE_FITS);
export const KitImagePositionSchema = z.enum(KIT_IMAGE_POSITIONS);
export const KitLogoSizeSchema = z.enum(KIT_LOGO_SIZES);
export const KitPaddingSchema = z.enum(KIT_PADDINGS);
export const KitRadiusSchema = z.enum(KIT_RADII);

export const KitStyleOverridesSchema = z.object({
  fontPairId: z.enum(FONT_PAIR_IDS).default("modern"),
  headlineWeight: KitHeadlineWeightSchema.default("bold"),
  headlineSize: KitHeadlineSizeSchema.default("md"),
  textAlign: KitTextAlignSchema.default("left"),
  ctaVisible: z.boolean().default(true),
  imageFit: KitImageFitSchema.default("cover"),
  imagePosition: KitImagePositionSchema.default("center"),
  logoSize: KitLogoSizeSchema.default("md"),
  radius: KitRadiusSchema.default("md"),
  padding: KitPaddingSchema.default("normal"),
  overlay: z.boolean().default(true),
});

export type KitHeadlineWeight = z.infer<typeof KitHeadlineWeightSchema>;
export type KitHeadlineSize = z.infer<typeof KitHeadlineSizeSchema>;
export type KitTextAlign = z.infer<typeof KitTextAlignSchema>;
export type KitImageFit = z.infer<typeof KitImageFitSchema>;
export type KitImagePosition = z.infer<typeof KitImagePositionSchema>;
export type KitLogoSize = z.infer<typeof KitLogoSizeSchema>;
export type KitPadding = z.infer<typeof KitPaddingSchema>;
export type KitRadius = z.infer<typeof KitRadiusSchema>;
export type KitStyleOverrides = z.infer<typeof KitStyleOverridesSchema>;

export const KitVariationSchema = z.object({
  id: z.string(),
  name: z.string().default("Variation"),
  styleId: KitStyleIdSchema,
  layout: KitLayoutSchema.default("editorial"),
  recommended: z.boolean().default(false),
  fields: KitFieldsSchema,
  captions: z.array(KitCaptionSchema).default([]),
  colors: ThemeColorsSchema.optional(),
  style: KitStyleOverridesSchema.default({}),
});

export const SocialKitSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  config: SocialKitConfigSchema,
  variations: z.array(KitVariationSchema).default([]),
  selectedVariationId: z.string().optional(),
  version: z.number().default(1),
});

export type KitStyleId = z.infer<typeof KitStyleIdSchema>;
export type KitPlatform = z.infer<typeof KitPlatformSchema>;
export type KitBrandingSource = z.infer<typeof KitBrandingSourceSchema>;
export type SocialKitConfig = z.infer<typeof SocialKitConfigSchema>;
export type KitCaption = z.infer<typeof KitCaptionSchema>;
export type KitFields = z.infer<typeof KitFieldsSchema>;
export type KitVariation = z.infer<typeof KitVariationSchema>;
export type SocialKit = z.infer<typeof SocialKitSchema>;

export const emptySocialKitConfig = (): SocialKitConfig => SocialKitConfigSchema.parse({});