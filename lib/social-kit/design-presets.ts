import type {
  DesignDocument,
  DesignElement,
  KitFields,
  KitLayout,
  KitPlatform,
  KitStyleOverrides,
  KitVariation,
  ThemeTokens,
} from "@/lib/schema";
import { PADDING_RATIO, HEADLINE_SIZE_RATIO, LOGO_SIZE_RATIO, RADIUS_PX, PLATFORM_DIMENSIONS } from "./templates";
import { getFontPair } from "@/lib/theme/presets";

type Colors = ThemeTokens["colors"];
type Fonts = { heading: string; body: string };

type PresetArgs = {
  width: number;
  height: number;
  colors: Colors;
  fonts: Fonts;
  fields: KitFields;
  style: KitStyleOverrides;
};

function id() {
  return `element-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * A DesignDocument with nothing on it but the canvas itself — the "start
 * from scratch" option. Templates below are optional starting points, not
 * required; a blank canvas is just a DesignDocument with an empty elements
 * array.
 */
export function blankDesignDocument(width: number, height: number, background = "#ffffff"): DesignDocument {
  return { width, height, background, elements: [] };
}

/** Mirrors EditorialLayout: top accent bar, optional corner blob, logo + date pill, left rule + headline/subheading, footer venue + CTA. */
export function editorialDesignDocument({ width, height, colors, fonts, fields, style }: PresetArgs): DesignDocument {
  const pad = width * PADDING_RATIO[style.padding];
  const logoSize = Math.min(width, height) * LOGO_SIZE_RATIO[style.logoSize];
  const headlineSize = width * HEADLINE_SIZE_RATIO[style.headlineSize];
  const radius = RADIUS_PX[style.radius];

  const elements: DesignElement[] = [];

  if (style.overlay) {
    elements.push({
      id: id(),
      type: "shape",
      shape: "ellipse",
      x: width - width * 0.18 - width * 0.55,
      y: -width * 0.18,
      width: width * 0.55,
      height: width * 0.55,
      rotation: 0,
      opacity: 0.6,
      zIndex: 0,
      locked: false,
      visible: true,
      fill: colors.accent,
      strokeWidth: 0,
      radius: 999,
    });
  }

  elements.push({
    id: id(),
    type: "shape",
    shape: "rectangle",
    x: 0,
    y: 0,
    width,
    height: pad * 0.18,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    locked: false,
    visible: true,
    fill: colors.primary,
    strokeWidth: 0,
    radius: 0,
  });

  if (fields.image?.url) {
    elements.push({
      id: id(),
      type: "logo",
      src: fields.image.url,
      x: pad,
      y: pad,
      width: logoSize,
      height: logoSize,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fit: style.imageFit,
      position: style.imagePosition,
      radius,
    });
  }

  if (fields.dateLine) {
    elements.push({
      id: id(),
      type: "text",
      content: fields.dateLine,
      x: width - pad - width * 0.28,
      y: pad,
      width: width * 0.28,
      height: headlineSize * 0.5,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.22,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 0,
      color: colors.primary,
      textAlign: "right",
    });
  }

  const midY = height * 0.42;
  elements.push({
    id: id(),
    type: "text",
    content: fields.headline,
    x: pad + (style.textAlign === "left" ? 20 : 0),
    y: midY,
    width: width - pad * 2 - (style.textAlign === "left" ? 20 : 0),
    height: headlineSize * 2.4,
    rotation: 0,
    opacity: 1,
    zIndex: 2,
    locked: false,
    visible: true,
    fontFamily: fonts.heading,
    fontSize: headlineSize,
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: 0,
    color: colors.foreground,
    textAlign: style.textAlign,
  });

  if (fields.subheading) {
    elements.push({
      id: id(),
      type: "text",
      content: fields.subheading,
      x: pad + (style.textAlign === "left" ? 20 : 0),
      y: midY + headlineSize * 2.5,
      width: width - pad * 2 - (style.textAlign === "left" ? 20 : 0),
      height: headlineSize * 1.2,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.32,
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
      color: colors.mutedForeground,
      textAlign: style.textAlign,
    });
  }

  if (fields.venueLine) {
    elements.push({
      id: id(),
      type: "text",
      content: fields.venueLine,
      x: pad,
      y: height - pad - headlineSize * 0.4,
      width: width * 0.55,
      height: headlineSize * 0.4,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.24,
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: 0,
      color: colors.foreground,
      textAlign: "left",
    });
  }

  if (style.ctaVisible) {
    elements.push({
      id: id(),
      type: "button",
      label: fields.ctaLabel,
      x: width - pad - width * 0.24,
      y: height - pad - headlineSize * 0.6,
      width: width * 0.24,
      height: headlineSize * 0.6,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      backgroundColor: colors.primary,
      textColor: colors.primaryForeground,
      fontSize: headlineSize * 0.26,
      fontWeight: 600,
      radius,
    });
  }

  return { width, height, background: colors.background, elements };
}

/** Mirrors BoldLayout: centered stack — logo, date pill, headline, subheading, venue, CTA. */
export function boldDesignDocument({ width, height, colors, fonts, fields, style }: PresetArgs): DesignDocument {
  const pad = width * PADDING_RATIO[style.padding];
  const logoSize = Math.min(width, height) * LOGO_SIZE_RATIO[style.logoSize];
  const headlineSize = width * HEADLINE_SIZE_RATIO[style.headlineSize] * 1.05;
  const radius = RADIUS_PX[style.radius];
  const centerX = width / 2;

  const elements: DesignElement[] = [];

  if (style.overlay) {
    elements.push({
      id: id(),
      type: "shape",
      shape: "ellipse",
      x: centerX - width * 0.475,
      y: height * 0.4 - width * 0.475,
      width: width * 0.95,
      height: width * 0.95,
      rotation: 0,
      opacity: 0.5,
      zIndex: 0,
      locked: false,
      visible: true,
      fill: colors.primary,
      strokeWidth: 0,
      radius: 999,
    });
  }

  let cursorY = height * 0.16;

  if (fields.image?.url) {
    elements.push({
      id: id(),
      type: "logo",
      src: fields.image.url,
      x: centerX - logoSize / 2,
      y: cursorY,
      width: logoSize,
      height: logoSize,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fit: style.imageFit,
      position: style.imagePosition,
      radius,
    });
    cursorY += logoSize + pad * 0.35;
  }

  if (fields.dateLine) {
    const w = width * 0.32;
    elements.push({
      id: id(),
      type: "text",
      content: fields.dateLine,
      x: centerX - w / 2,
      y: cursorY,
      width: w,
      height: headlineSize * 0.5,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.22,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 1,
      color: colors.primary,
      textAlign: "center",
    });
    cursorY += headlineSize * 0.6 + pad * 0.3;
  }

  const headlineW = width * 0.9;
  elements.push({
    id: id(),
    type: "text",
    content: fields.headline,
    x: centerX - headlineW / 2,
    y: cursorY,
    width: headlineW,
    height: headlineSize * 3,
    rotation: 0,
    opacity: 1,
    zIndex: 2,
    locked: false,
    visible: true,
    fontFamily: fonts.heading,
    fontSize: headlineSize,
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: 0,
    color: colors.foreground,
    textAlign: "center",
  });
  cursorY += headlineSize * 3.1;

  if (fields.subheading) {
    const w = width * 0.8;
    elements.push({
      id: id(),
      type: "text",
      content: fields.subheading,
      x: centerX - w / 2,
      y: cursorY,
      width: w,
      height: headlineSize * 0.8,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.3,
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
      color: colors.mutedForeground,
      textAlign: "center",
    });
    cursorY += headlineSize * 0.9;
  }

  if (fields.venueLine) {
    elements.push({
      id: id(),
      type: "text",
      content: fields.venueLine,
      x: centerX - width * 0.4,
      y: cursorY,
      width: width * 0.8,
      height: headlineSize * 0.4,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.24,
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: 0,
      color: colors.foreground,
      textAlign: "center",
    });
    cursorY += headlineSize * 0.55;
  }

  if (style.ctaVisible) {
    const w = width * 0.26;
    elements.push({
      id: id(),
      type: "button",
      label: fields.ctaLabel,
      x: centerX - w / 2,
      y: cursorY,
      width: w,
      height: headlineSize * 0.65,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      backgroundColor: colors.primary,
      textColor: colors.primaryForeground,
      fontSize: headlineSize * 0.28,
      fontWeight: 600,
      radius,
    });
  }

  return { width, height, background: colors.background, elements };
}

/** Mirrors SplitLayout: diagonal colour block on the left third, logo + rotated date on it, content stacked in the remaining space. */
export function splitDesignDocument({ width, height, colors, fonts, fields, style }: PresetArgs): DesignDocument {
  const pad = width * PADDING_RATIO[style.padding];
  const logoSize = Math.min(width, height) * LOGO_SIZE_RATIO[style.logoSize];
  const headlineSize = width * HEADLINE_SIZE_RATIO[style.headlineSize];
  const radius = RADIUS_PX[style.radius];
  const blockWidth = width * 0.42;
  const contentX = width * 0.42 + pad * 0.6;

  const elements: DesignElement[] = [
    {
      id: id(),
      type: "shape",
      shape: "rectangle",
      x: 0,
      y: 0,
      width: blockWidth,
      height,
      rotation: 0,
      opacity: 1,
      zIndex: 0,
      locked: false,
      visible: true,
      fill: colors.primary,
      strokeWidth: 0,
      radius: 0,
    },
  ];

  if (fields.image?.url) {
    elements.push({
      id: id(),
      type: "logo",
      src: fields.image.url,
      x: pad,
      y: pad,
      width: logoSize,
      height: logoSize,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fit: style.imageFit,
      position: style.imagePosition,
      radius,
    });
  }

  if (fields.dateLine) {
    elements.push({
      id: id(),
      type: "text",
      content: fields.dateLine,
      x: pad * 0.4,
      y: height - pad - headlineSize * 1.5,
      width: headlineSize * 1.5,
      height: headlineSize * 0.4,
      rotation: -90,
      opacity: 0.9,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.22,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 0,
      color: colors.primaryForeground,
      textAlign: "left",
    });
  }

  const contentWidth = width - contentX - pad;
  const midY = height * 0.4;

  elements.push({
    id: id(),
    type: "text",
    content: fields.headline,
    x: contentX,
    y: midY,
    width: contentWidth,
    height: headlineSize * 3,
    rotation: 0,
    opacity: 1,
    zIndex: 2,
    locked: false,
    visible: true,
    fontFamily: fonts.heading,
    fontSize: headlineSize,
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: 0,
    color: colors.foreground,
    textAlign: "left",
  });

  let cursorY = midY + headlineSize * 3.1;

  if (fields.subheading) {
    elements.push({
      id: id(),
      type: "text",
      content: fields.subheading,
      x: contentX,
      y: cursorY,
      width: contentWidth,
      height: headlineSize * 0.9,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.3,
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
      color: colors.mutedForeground,
      textAlign: "left",
    });
    cursorY += headlineSize;
  }

  if (fields.venueLine) {
    elements.push({
      id: id(),
      type: "text",
      content: fields.venueLine,
      x: contentX,
      y: cursorY,
      width: contentWidth,
      height: headlineSize * 0.4,
      rotation: 0,
      opacity: 0.75,
      zIndex: 2,
      locked: false,
      visible: true,
      fontFamily: fonts.body,
      fontSize: headlineSize * 0.24,
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: 0,
      color: colors.foreground,
      textAlign: "left",
    });
    cursorY += headlineSize * 0.6;
  }

  if (style.ctaVisible) {
    const w = Math.min(contentWidth, width * 0.26);
    elements.push({
      id: id(),
      type: "button",
      label: fields.ctaLabel,
      x: contentX,
      y: cursorY,
      width: w,
      height: headlineSize * 0.6,
      rotation: 0,
      opacity: 1,
      zIndex: 2,
      locked: false,
      visible: true,
      backgroundColor: colors.primary,
      textColor: colors.primaryForeground,
      fontSize: headlineSize * 0.26,
      fontWeight: 600,
      radius,
    });
  }

  return { width, height, background: colors.background, elements };
}

const BUILDERS: Record<KitLayout, (args: PresetArgs) => DesignDocument> = {
  editorial: editorialDesignDocument,
  bold: boldDesignDocument,
  split: splitDesignDocument,
};

/** Dispatches to the right starter-document builder for a given layout archetype. */
export function buildStarterDesignDocument(layout: KitLayout, args: PresetArgs): DesignDocument {
  return BUILDERS[layout](args);
}

/**
 * Every starter option the editor's Templates panel offers, keyed the same
 * way for every platform: "blank" plus the three layout archetypes. Always
 * builds fresh (new ids, new object) — nothing here is ever handed out as a
 * shared/mutable reference.
 */
export const STARTER_DOCUMENT_OPTIONS = ["blank", "editorial", "bold", "split"] as const;
export type StarterDocumentOption = (typeof STARTER_DOCUMENT_OPTIONS)[number];

export const STARTER_DOCUMENT_LABELS: Record<StarterDocumentOption, string> = {
  blank: "Blank canvas",
  editorial: "Academic",
  bold: "Modern",
  split: "Split / Research",
};

export function buildStarterOption(
  option: StarterDocumentOption,
  width: number,
  height: number,
  args: Omit<PresetArgs, "width" | "height">
): DesignDocument {
  if (option === "blank") return blankDesignDocument(width, height, args.colors.background);
  return buildStarterDesignDocument(option, { ...args, width, height });
}

/**
 * Resolves the DesignDocument to show for a given platform: the persisted
 * one if the variation already has it, or a freshly synthesized one
 * (fields/style/layout scaled to that platform's real dimensions) if not —
 * which is exactly what keeps pre-Phase-3 rows from crashing the editor.
 * Every call returns a brand-new object; nothing here is ever a shared
 * reference back into `variation`.
 */
export function getOrBuildPlatformDocument(variation: KitVariation, platform: KitPlatform): DesignDocument {
  const existing = variation.documents?.[platform];
  if (existing) return structuredClone(existing);

  const dims = PLATFORM_DIMENSIONS[platform];
  const fonts = getFontPair(variation.style.fontPairId);
  const colors = variation.colors ?? {
    primary: "#171717",
    primaryForeground: "#ffffff",
    background: "#ffffff",
    foreground: "#171717",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
    accent: "#e5e5e5",
    border: "#e5e5e5",
  };

  return buildStarterDesignDocument(variation.layout, {
    width: dims.width,
    height: dims.height,
    colors,
    fonts,
    fields: variation.fields,
    style: variation.style,
  });
}
