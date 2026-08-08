import { randomUUID } from "node:crypto";
import {
  KIT_STYLE_IDS,
  KIT_LAYOUTS,
  KIT_PLATFORMS,
  KitFieldsSchema,
  KitStyleOverridesSchema,
  KitVariationSchema,
  type ConferenceFacts,
  type ThemeTokens,
  type SocialKitConfig,
  type KitStyleId,
  type KitLayout,
  type KitFields,
  type KitVariation,
  type KitPlatform,
  type DesignDocument,
} from "@/lib/schema";
import { TEMPLATES, getTemplate, getFontPair } from "@/lib/theme/presets";
import { formatDateRange } from "@/lib/composer";
import { buildStarterDesignDocument } from "./design-presets";
import { PLATFORM_DIMENSIONS } from "./templates";

const VARIATION_NAMES: Partial<Record<KitStyleId, string>> = {
  "academic-classic": "Academic",
  "modern-minimal": "Minimal",
  "corporate-summit": "Corporate",
  "innovation-ai": "Premium Dark",
  "university-heritage": "Heritage",
  "medical-health": "Clinical",
  "creative-vibrant": "Vibrant",
};

const TYPE_TO_STYLE: Partial<Record<ConferenceFacts["type"], KitStyleId>> = {
  "international-conference": "academic-classic",
  "national-conference": "academic-classic",
  workshop: "modern-minimal",
  symposium: "modern-minimal",
  seminar: "university-heritage",
  fdp: "university-heritage",
  hackathon: "creative-vibrant",
};

/** Layout-appropriate presentation defaults — the user can change any of these in the editor. */
const LAYOUT_DEFAULTS: Record<KitLayout, Partial<{ textAlign: "left" | "center"; overlay: boolean }>> = {
  editorial: { textAlign: "left", overlay: false },
  bold: { textAlign: "center", overlay: true },
  split: { textAlign: "left", overlay: true },
};

export function recommendStyleId(theme: ThemeTokens, facts: ConferenceFacts): KitStyleId {
  const matched = TEMPLATES.find((t) => t.colors.primary === theme.colors.primary);
  if (matched) return matched.id;
  return TYPE_TO_STYLE[facts.type] ?? "academic-classic";
}

function pickAlternateStyles(exclude: KitStyleId[], count: number): KitStyleId[] {
  const others = KIT_STYLE_IDS.filter((id) => !exclude.includes(id));
  return others.slice(0, count);
}

/**
 * Style presets already bundle colour+radius+spacing as one visual identity,
 * exactly like the website builder does. "Custom" branding is the one case
 * where colour is allowed to diverge from the chosen style's own palette.
 */
function resolveColors(styleId: KitStyleId, config: SocialKitConfig) {
  const base = getTemplate(styleId).colors;
  if (config.brandingSource === "custom" && config.customColors) {
    return { ...base, ...config.customColors };
  }
  return base;
}

function fieldsFromFacts(facts: ConferenceFacts): KitFields {
  return KitFieldsSchema.parse({
    headline: facts.acronym || facts.name || "Your conference",
    subheading: facts.tagline || facts.name,
    dateLine: formatDateRange(facts.startDate, facts.endDate),
    venueLine: [facts.venue.city, facts.venue.country].filter(Boolean).join(", "),
    ctaLabel: facts.submission.platform !== "none" ? "Submit Now" : "Register Now",
    image: facts.banner ?? facts.logo,
  });
}

/**
 * Builds the 3 named variations for the Results screen. Each gets a
 * different layout archetype (editorial/bold/split) by position, so the
 * three results are always visually distinct in structure, not just colour.
 */
export function composeSocialKit(
  facts: ConferenceFacts,
  theme: ThemeTokens,
  config: SocialKitConfig
): KitVariation[] {
  const recommended = recommendStyleId(theme, facts);
  const chosen = Array.from(new Set([config.styleId, recommended]));
  const styles = [...chosen, ...pickAlternateStyles(chosen, 3 - chosen.length)].slice(0, 3);

  const fields = fieldsFromFacts(facts);

  return styles.map((styleId, index) => {
    const layout = KIT_LAYOUTS[index % KIT_LAYOUTS.length];
    const style = KitStyleOverridesSchema.parse(LAYOUT_DEFAULTS[layout]);
    const colors = resolveColors(styleId, config);
    const fonts = getFontPair(style.fontPairId);

    // One DesignDocument per platform, each at that platform's real pixel
    // dimensions — not one document forced to fit every aspect ratio.
    const documents: Partial<Record<KitPlatform, DesignDocument>> = {};
    for (const platform of KIT_PLATFORMS) {
      const dims = PLATFORM_DIMENSIONS[platform];
      documents[platform] = buildStarterDesignDocument(layout, {
        width: dims.width,
        height: dims.height,
        colors,
        fonts,
        fields,
        style,
      });
    }

    return KitVariationSchema.parse({
      id: randomUUID(),
      name: VARIATION_NAMES[styleId] ?? getTemplate(styleId).name,
      styleId,
      layout,
      recommended: styleId === recommended,
      fields,
      captions: [],
      colors,
      style,
      documents,
    });
  });
}