import type { ThemeTokens } from "@/lib/schema";

const RADIUS_MAP: Record<ThemeTokens["radius"], string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

const SPACING_MAP: Record<ThemeTokens["spacing"], string> = {
  compact: "0.85",
  normal: "1",
  airy: "1.25",
};

export function themeToCssVars(theme: ThemeTokens): Record<string, string> {
  return {
    "--conf-primary": theme.colors.primary,
    "--conf-primary-fg": theme.colors.primaryForeground,
    "--conf-bg": theme.colors.background,
    "--conf-fg": theme.colors.foreground,
    "--conf-muted": theme.colors.muted,
    "--conf-muted-fg": theme.colors.mutedForeground,
    "--conf-accent": theme.colors.accent,
    "--conf-border": theme.colors.border,
    "--conf-font-heading": theme.fonts.heading,
    "--conf-font-body": theme.fonts.body,
    "--conf-radius": RADIUS_MAP[theme.radius],
    "--conf-scale": SPACING_MAP[theme.spacing],
  };
}

export function themeToCssText(theme: ThemeTokens, selector = ":root"): string {
  const vars = themeToCssVars(theme);
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}