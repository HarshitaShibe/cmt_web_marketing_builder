import { z } from "zod";
import { ImageSchema } from "./facts";
import { ThemeColorsSchema, HexColor } from "./theme";
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

// ---------------------------------------------------------------------------
// DesignDocument — the long-term public visual model for the Canva-like
// editor. An independent, freeform layer model: unlike KitFields/KitLayout
// above (fixed named slots + enum knobs), a DesignDocument is a flat array
// of independently positioned/sized/rotated DesignElements. This is additive
// for now — KitVariation gets a `document` field alongside the existing
// fields/style/layout, which keep working unchanged until the editor itself
// is rewritten to read/write `document` instead.
// ---------------------------------------------------------------------------

export const DESIGN_ELEMENT_TYPES = ["text", "image", "logo", "shape", "button", "icon"] as const;
export const DesignElementTypeSchema = z.enum(DESIGN_ELEMENT_TYPES);
export type DesignElementType = z.infer<typeof DesignElementTypeSchema>;

/** Properties every element has regardless of type — this is what makes elements independently draggable/resizable/stackable. */
const DesignElementBaseSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  zIndex: z.number().default(0),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
});

export const TextElementSchema = DesignElementBaseSchema.extend({
  type: z.literal("text"),
  content: z.string().default(""),
  fontFamily: z.string().default("system-ui, sans-serif"),
  fontSize: z.number().default(32),
  fontWeight: z.number().default(700),
  lineHeight: z.number().default(1.15),
  letterSpacing: z.number().default(0),
  color: HexColor.default("#0a0a0a"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
});

export const ImageElementSchema = DesignElementBaseSchema.extend({
  type: z.literal("image"),
  src: z.string().optional(),
  fit: z.enum(["cover", "contain"]).default("cover"),
  position: z.enum(["top", "center", "bottom"]).default("center"),
  radius: z.number().default(0),
});

export const LogoElementSchema = DesignElementBaseSchema.extend({
  type: z.literal("logo"),
  src: z.string().optional(),
  fit: z.enum(["cover", "contain"]).default("contain"),
  position: z.enum(["top", "center", "bottom"]).default("center"),
  radius: z.number().default(0),
  background: HexColor.optional(),
});

export const ShapeElementSchema = DesignElementBaseSchema.extend({
  type: z.literal("shape"),
  shape: z.enum(["rectangle", "ellipse", "line"]).default("rectangle"),
  fill: z.string().default("#171717"),
  stroke: z.string().optional(),
  strokeWidth: z.number().default(0),
  radius: z.number().default(0),
});

export const ButtonElementSchema = DesignElementBaseSchema.extend({
  type: z.literal("button"),
  label: z.string().default("Learn more"),
  backgroundColor: HexColor.default("#171717"),
  textColor: HexColor.default("#ffffff"),
  fontSize: z.number().default(16),
  fontWeight: z.number().default(600),
  radius: z.number().default(999),
});

export const IconElementSchema = DesignElementBaseSchema.extend({
  type: z.literal("icon"),
  icon: z.string().default("star"),
  color: HexColor.default("#171717"),
  strokeWidth: z.number().default(2),
});

export const DesignElementSchema = z.discriminatedUnion("type", [
  TextElementSchema,
  ImageElementSchema,
  LogoElementSchema,
  ShapeElementSchema,
  ButtonElementSchema,
  IconElementSchema,
]);

export const DesignDocumentSchema = z.object({
  width: z.number(),
  height: z.number(),
  background: HexColor.default("#ffffff"),
  elements: z.array(DesignElementSchema).default([]),
});

export type TextElement = z.infer<typeof TextElementSchema>;
export type ImageElement = z.infer<typeof ImageElementSchema>;
export type LogoElement = z.infer<typeof LogoElementSchema>;
export type ShapeElement = z.infer<typeof ShapeElementSchema>;
export type ButtonElement = z.infer<typeof ButtonElementSchema>;
export type IconElement = z.infer<typeof IconElementSchema>;
export type DesignElement = z.infer<typeof DesignElementSchema>;
export type DesignDocument = z.infer<typeof DesignDocumentSchema>;

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
  /**
   * The freeform Canva-like document, now per-platform (Phase 3): each
   * selected platform gets its own DesignDocument at that platform's exact
   * pixel dimensions, rather than one document forced to fit every aspect
   * ratio. Keyed by KitPlatform. Optional — old rows won't have it, and the
   * editor falls back to synthesizing one on the fly from fields/style/layout
   * (see lib/social-kit/design-presets.ts) so old data never crashes.
   */
  documents: z.record(KitPlatformSchema, DesignDocumentSchema).optional(),
  /**
   * @deprecated Phase 1/2 leftover — a single fixed-size document. Superseded
   * by `documents` (per-platform) in Phase 3. Kept only so already-persisted
   * rows from that window still parse; nothing new writes to this anymore.
   */
  document: DesignDocumentSchema.optional(),
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