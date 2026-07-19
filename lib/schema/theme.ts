import { z } from "zod";

export const HexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a hex color like #10b981");

export const ThemeColorsSchema = z.object({
  primary: HexColor,
  primaryForeground: HexColor,
  background: HexColor,
  foreground: HexColor,
  muted: HexColor,
  mutedForeground: HexColor,
  accent: HexColor,
  border: HexColor,
});

export const ThemeFontsSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const ThemeTokensSchema = z.object({
  id: z.string(),
  label: z.string(),
  colors: ThemeColorsSchema,
  fonts: ThemeFontsSchema,
  radius: z.enum(["none", "sm", "md", "lg", "full"]).default("md"),
  spacing: z.enum(["compact", "normal", "airy"]).default("normal"),
});

export type ThemeColors = z.infer<typeof ThemeColorsSchema>;
export type ThemeFonts = z.infer<typeof ThemeFontsSchema>;
export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;