import { z } from "zod";
import type { CSSProperties } from "react";

// ---------------------------------------------------------------------------
// A shared set of typography controls any block can opt into.
// Spread STYLE_SCHEMA into a block's Zod object and STYLE_FIELDS into its
// Puck fields, then call textStyle() to turn the values into inline CSS.
// ---------------------------------------------------------------------------

export const FONT_SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"] as const;
export const ALIGNMENTS = ["left", "center", "right"] as const;
export const WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;

export const SIZE_REM: Record<(typeof FONT_SIZES)[number], string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.375rem",
  "2xl": "1.75rem",
  "3xl": "2.25rem",
  "4xl": "3rem",
  "5xl": "3.75rem",
  "6xl": "4.5rem",
};

export const WEIGHT_VALUE: Record<(typeof WEIGHTS)[number], number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const StyleSchema = z.object({
  headingSize: z.enum(FONT_SIZES).optional(),
  headingWeight: z.enum(WEIGHTS).optional(),
  headingItalic: z.boolean().optional(),
  bodySize: z.enum(FONT_SIZES).optional(),
  bodyItalic: z.boolean().optional(),
  align: z.enum(ALIGNMENTS).optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
});

export type StyleProps = z.infer<typeof StyleSchema>;

const sizeOptions = FONT_SIZES.map((s) => ({
  label: `${s} — ${SIZE_REM[s]}`,
  value: s,
}));

/** Spread into a block's Puck `fields`. Everything is optional. */
export const STYLE_FIELDS = {
  headingSize: { type: "select" as const, label: "Heading size", options: sizeOptions },
  headingWeight: {
    type: "select" as const,
    label: "Heading weight",
    options: WEIGHTS.map((w) => ({ label: w, value: w })),
  },
  headingItalic: {
    type: "radio" as const,
    label: "Heading italic",
    options: [
      { label: "No", value: false },
      { label: "Yes", value: true },
    ],
  },
  bodySize: { type: "select" as const, label: "Body size", options: sizeOptions },
  bodyItalic: {
    type: "radio" as const,
    label: "Body italic",
    options: [
      { label: "No", value: false },
      { label: "Yes", value: true },
    ],
  },
  align: {
    type: "radio" as const,
    label: "Alignment",
    options: [
      { label: "Left", value: "left" },
      { label: "Centre", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  textColor: { type: "text" as const, label: "Text colour (hex, blank = theme)" },
  accentColor: { type: "text" as const, label: "Accent colour (hex, blank = theme)" },
};

const isHex = (v?: string) => Boolean(v && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v));

/** Inline styles for a heading element. */
export function headingStyle(p: StyleProps, fallbackSize?: string): CSSProperties {
  return {
    fontFamily: "var(--conf-font-heading)",
    ...(p.headingSize ? { fontSize: SIZE_REM[p.headingSize] } : fallbackSize ? { fontSize: fallbackSize } : {}),
    ...(p.headingWeight ? { fontWeight: WEIGHT_VALUE[p.headingWeight] } : {}),
    ...(p.headingItalic ? { fontStyle: "italic" } : {}),
    ...(isHex(p.textColor) ? { color: p.textColor } : {}),
  };
}

/** Inline styles for body copy. */
export function bodyStyle(p: StyleProps, muted = true): CSSProperties {
  return {
    ...(p.bodySize ? { fontSize: SIZE_REM[p.bodySize] } : {}),
    ...(p.bodyItalic ? { fontStyle: "italic" } : {}),
    color: isHex(p.textColor)
      ? p.textColor
      : muted
        ? "var(--conf-muted-fg)"
        : "var(--conf-fg)",
  };
}

/** Accent colour with theme fallback — for eyebrows, dots, buttons. */
export function accent(p: StyleProps): string {
  return isHex(p.accentColor) ? p.accentColor! : "var(--conf-primary)";
}

/** Alignment classes for the section wrapper. */
export function alignClass(p: StyleProps): string {
  switch (p.align) {
    case "center":
      return "text-center [&_dl]:justify-center [&_.cta-row]:justify-center mx-auto";
    case "right":
      return "text-right [&_dl]:justify-end [&_.cta-row]:justify-end ml-auto";
    default:
      return "text-left";
  }
}

export const STYLE_DEFAULTS: StyleProps = {
  headingSize: undefined,
  headingWeight: undefined,
  headingItalic: false,
  bodySize: undefined,
  bodyItalic: false,
  align: "left",
  textColor: "",
  accentColor: "",
};