/**
 * DEV-ONLY verification script. Renders the existing (untouched)
 * TemplateCanvas for the same 3 layouts, to confirm it still works
 * unmodified after the Phase 2 additions. Not part of the app build.
 *
 * Run with: npx tsx scripts/render-old-template.tsx
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { TemplateCanvas } from "../components/social-kit/template-canvas";
import { getTemplate, getFontPair } from "../lib/theme/presets";
import { KitStyleOverridesSchema, type KitFields, type KitLayout, type KitVariation } from "../lib/schema";

const fields: KitFields = {
  headline: "International Conference on AI & Systems 2026",
  subheading: "Three days of research, workshops, and keynotes",
  dateLine: "12–14 Mar 2026",
  venueLine: "Patiala, Punjab, India",
  ctaLabel: "Submit Now",
  image: { url: "https://placehold.co/200x200/1e40af/ffffff.png?text=Logo", alt: "logo" },
};

const template = getTemplate("academic-classic");

const LAYOUT_STYLE_DEFAULTS: Record<KitLayout, Parameters<typeof KitStyleOverridesSchema.parse>[0]> = {
  editorial: { textAlign: "left", overlay: false },
  bold: { textAlign: "center", overlay: true },
  split: { textAlign: "left", overlay: true },
};

mkdirSync("/tmp/design-doc-render", { recursive: true });

function extractSvg(markup: string) {
  const start = markup.indexOf("<svg");
  return markup.slice(start);
}

for (const layout of ["editorial", "bold", "split"] as const) {
  const variation: KitVariation = {
    id: "test",
    name: "Test",
    styleId: "academic-classic",
    layout,
    recommended: false,
    fields,
    captions: [],
    colors: template.colors,
    style: KitStyleOverridesSchema.parse(LAYOUT_STYLE_DEFAULTS[layout]),
  };
  const markup = extractSvg(
    renderToStaticMarkup(createElement(TemplateCanvas, { variation, platform: "instagram" }))
  );
  const wrapped = markup.replace(
    "<svg",
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`
  );
  writeFileSync(`/tmp/design-doc-render/old_${layout}.svg`, wrapped);
  console.log(`wrote old_${layout}.svg`);
}
