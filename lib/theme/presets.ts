import type { ThemeTokens } from "@/lib/schema";

// ---------------------------------------------------------------------------
// Templates — each is a complete visual identity, not just a colour swap.
// ---------------------------------------------------------------------------

export const TEMPLATE_IDS = [
  "academic-classic",
  "modern-minimal",
  "corporate-summit",
  "innovation-ai",
  "university-heritage",
  "medical-health",
  "creative-vibrant",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type TemplateDef = {
  id: TemplateId;
  name: string;
  tagline: string;
  bestFor: string;
  colors: ThemeTokens["colors"];
  radius: ThemeTokens["radius"];
  spacing: ThemeTokens["spacing"];
  /** Two-colour preview swatch for the picker card. */
  preview: { from: string; to: string; ink: string };
};

export const TEMPLATES: TemplateDef[] = [
  {
    id: "academic-classic",
    name: "Academic Classic",
    tagline: "Clean IEEE and Springer styling with confident blue accents",
    bestFor: "Peer-reviewed conferences, IEEE, ACM, Springer",
    colors: {
      primary: "#1e40af",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#475569",
      accent: "#dbeafe",
      border: "#dde3ec",
    },
    radius: "sm",
    spacing: "normal",
    preview: { from: "#1e40af", to: "#3b82f6", ink: "#ffffff" },
  },

  {
    id: "modern-minimal",
    name: "Modern Minimal",
    tagline: "Generous white space and elegant type for a premium feel",
    bestFor: "Research symposia, invitation-only events",
    colors: {
      primary: "#171717",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0a0a0a",
      muted: "#fafafa",
      mutedForeground: "#737373",
      accent: "#f5f5f5",
      border: "#e5e5e5",
    },
    radius: "none",
    spacing: "airy",
    preview: { from: "#171717", to: "#525252", ink: "#ffffff" },
  },

  {
    id: "corporate-summit",
    name: "Corporate Summit",
    tagline: "Bold layouts and large visuals built for industry events",
    bestFor: "Industry summits, business conferences, trade events",
    colors: {
      primary: "#c2410c",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#1c1917",
      muted: "#fafaf9",
      mutedForeground: "#57534e",
      accent: "#ffedd5",
      border: "#e7e5e4",
    },
    radius: "md",
    spacing: "normal",
    preview: { from: "#c2410c", to: "#f97316", ink: "#ffffff" },
  },

  {
    id: "innovation-ai",
    name: "Innovation & AI",
    tagline: "Dark theme with luminous accents for technical audiences",
    bestFor: "AI, machine learning, cybersecurity, data science",
    colors: {
      primary: "#22d3ee",
      primaryForeground: "#042f2e",
      background: "#0a0e1a",
      foreground: "#e2e8f0",
      muted: "#111827",
      mutedForeground: "#94a3b8",
      accent: "#164e63",
      border: "#1e293b",
    },
    radius: "lg",
    spacing: "airy",
    preview: { from: "#0a0e1a", to: "#22d3ee", ink: "#0a0e1a" },
  },

  {
    id: "university-heritage",
    name: "University Heritage",
    tagline: "Institutional character with a traditional academic voice",
    bestFor: "University-hosted conferences, convocations, FDPs",
    colors: {
      primary: "#7f1d1d",
      primaryForeground: "#ffffff",
      background: "#fffdf9",
      foreground: "#1c1917",
      muted: "#faf7f2",
      mutedForeground: "#57534e",
      accent: "#fef2f2",
      border: "#e8e0d5",
    },
    radius: "sm",
    spacing: "normal",
    preview: { from: "#7f1d1d", to: "#b91c1c", ink: "#ffffff" },
  },

  {
    id: "medical-health",
    name: "Medical & Healthcare",
    tagline: "Calm, clinical structure with clear information hierarchy",
    bestFor: "Medical conferences, clinical research, public health",
    colors: {
      primary: "#047857",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f0fdf9",
      mutedForeground: "#475569",
      accent: "#d1fae5",
      border: "#dcebe5",
    },
    radius: "md",
    spacing: "normal",
    preview: { from: "#047857", to: "#10b981", ink: "#ffffff" },
  },

  {
    id: "creative-vibrant",
    name: "Creative & Vibrant",
    tagline: "Bright, energetic cards for multidisciplinary gatherings",
    bestFor: "Design, media, hackathons, student festivals",
    colors: {
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#1e1b4b",
      muted: "#faf5ff",
      mutedForeground: "#6b7280",
      accent: "#ede9fe",
      border: "#e9e2f5",
    },
    radius: "lg",
    spacing: "airy",
    preview: { from: "#7c3aed", to: "#ec4899", ink: "#ffffff" },
  },
];

export function getTemplate(id: TemplateId): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

// ---------------------------------------------------------------------------
// Font pairs — a heading face and a body face chosen to work together.
// ---------------------------------------------------------------------------

export const FONT_PAIR_IDS = [
  "modern",
  "elegant",
  "academic",
  "professional",
  "minimal",
  "corporate",
] as const;

export type FontPairId = (typeof FONT_PAIR_IDS)[number];

export type FontPairDef = {
  id: FontPairId;
  name: string;
  headingLabel: string;
  bodyLabel: string;
  heading: string;
  body: string;
  note: string;
};

export const FONT_PAIRS: FontPairDef[] = [
  {
    id: "modern",
    name: "Modern",
    headingLabel: "Plus Jakarta Sans",
    bodyLabel: "Inter",
    heading: "var(--font-jakarta), system-ui, sans-serif",
    body: "var(--font-inter), system-ui, sans-serif",
    note: "Contemporary and highly readable",
  },
  {
    id: "elegant",
    name: "Elegant",
    headingLabel: "Playfair Display",
    bodyLabel: "DM Sans",
    heading: "var(--font-playfair), Georgia, serif",
    body: "var(--font-dmsans), system-ui, sans-serif",
    note: "High contrast, formal, memorable",
  },
  {
    id: "academic",
    name: "Academic",
    headingLabel: "Merriweather",
    bodyLabel: "Source Sans 3",
    heading: "var(--font-merriweather), Georgia, serif",
    body: "var(--font-sourcesans), system-ui, sans-serif",
    note: "Traditional scholarly tone",
  },
  {
    id: "professional",
    name: "Professional",
    headingLabel: "IBM Plex Sans",
    bodyLabel: "IBM Plex Serif",
    heading: "var(--font-plexsans), system-ui, sans-serif",
    body: "var(--font-plexserif), Georgia, serif",
    note: "Technical and precise",
  },
  {
    id: "minimal",
    name: "Minimal",
    headingLabel: "Inter Tight",
    bodyLabel: "Inter",
    heading: "var(--font-intertight), system-ui, sans-serif",
    body: "var(--font-inter), system-ui, sans-serif",
    note: "Quiet and unobtrusive",
  },
  {
    id: "corporate",
    name: "Corporate",
    headingLabel: "Manrope",
    bodyLabel: "Lora",
    heading: "var(--font-manrope), system-ui, sans-serif",
    body: "var(--font-lora), Georgia, serif",
    note: "Confident with a warm body face",
  },
];

export function getFontPair(id: FontPairId): FontPairDef {
  return FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0];
}

// ---------------------------------------------------------------------------
// Combine into the ThemeTokens the renderer already consumes.
// ---------------------------------------------------------------------------

export function buildThemeFromTemplate(
  templateId: TemplateId,
  fontPairId: FontPairId
): ThemeTokens {
  const template = getTemplate(templateId);
  const fonts = getFontPair(fontPairId);

  return {
    id: `${template.id}-${fonts.id}`,
    label: `${template.name} · ${fonts.name}`,
    colors: template.colors,
    fonts: { heading: fonts.heading, body: fonts.body },
    radius: template.radius,
    spacing: template.spacing,
  };
}

export const defaultTheme = buildThemeFromTemplate("academic-classic", "modern");

// ---------------------------------------------------------------------------
// Backwards compatibility with the earlier colour/font preset API.
// Lets existing composer code keep working while the wizard moves to templates.
// ---------------------------------------------------------------------------

const LEGACY_COLOR_TO_TEMPLATE: Record<string, TemplateId> = {
  emerald: "medical-health",
  blue: "academic-classic",
  purple: "creative-vibrant",
  maroon: "university-heritage",
  black: "modern-minimal",
};

const LEGACY_FONT_TO_PAIR: Record<string, FontPairId> = {
  inter: "modern",
  poppins: "modern",
  jakarta: "modern",
  merriweather: "academic",
  playfair: "elegant",
};

/** @deprecated Use buildThemeFromTemplate. Kept so older callers still work. */
export function buildTheme(
  colorPreset: string,
  fontPreset: string,
  style?: string
): ThemeTokens {
  const templateId =
    style === "dark"
      ? "innovation-ai"
      : (LEGACY_COLOR_TO_TEMPLATE[colorPreset] ?? "academic-classic");

  return buildThemeFromTemplate(
    templateId,
    LEGACY_FONT_TO_PAIR[fontPreset] ?? "modern"
  );
}