/**
 * DEV-ONLY verification script for Phase 2. Renders the four starter
 * DesignDocuments (Editorial, Bold, Split, Blank) to standalone .svg files
 * via DesignDocumentRenderer + renderToStaticMarkup, so they can be visually
 * diffed against the old TemplateCanvas output. Not part of the app build.
 *
 * Run with: npx tsx scripts/render-design-docs.tsx
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DesignDocumentRenderer } from "../components/social-kit/design-document-renderer";
import { buildStarterDesignDocument, blankDesignDocument } from "../lib/social-kit/design-presets";
import { getTemplate, getFontPair } from "../lib/theme/presets";
import { KitStyleOverridesSchema, type KitFields, type KitLayout } from "../lib/schema";

const fields: KitFields = {
  headline: "International Conference on AI & Systems 2026",
  subheading: "Three days of research, workshops, and keynotes",
  dateLine: "12–14 Mar 2026",
  venueLine: "Patiala, Punjab, India",
  ctaLabel: "Submit Now",
  image: { url: "https://placehold.co/200x200/1e40af/ffffff.png?text=Logo", alt: "logo" },
};

const template = getTemplate("academic-classic");
const fonts = getFontPair("modern");
const width = 1080;
const height = 1080;

mkdirSync("/tmp/design-doc-render", { recursive: true });

const LAYOUT_STYLE_DEFAULTS: Record<KitLayout, Parameters<typeof KitStyleOverridesSchema.parse>[0]> = {
  editorial: { textAlign: "left", overlay: false },
  bold: { textAlign: "center", overlay: true },
  split: { textAlign: "left", overlay: true },
};

function extractSvg(markup: string) {
  // React 19's renderToStaticMarkup injects a resource-preload <link> before
  // markup containing an <img src>, which isn't valid XML alongside a lone
  // root <svg> node. Strip everything before the actual <svg> tag.
  const start = markup.indexOf("<svg");
  return markup.slice(start);
}

for (const layout of ["editorial", "bold", "split"] as const) {
  const style = KitStyleOverridesSchema.parse(LAYOUT_STYLE_DEFAULTS[layout]);
  const doc = buildStarterDesignDocument(layout, {
    width,
    height,
    colors: template.colors,
    fonts,
    fields,
    style,
  });
  const markup = extractSvg(renderToStaticMarkup(createElement(DesignDocumentRenderer, { document: doc })));
  const wrapped = markup.replace("<svg", `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`);
  writeFileSync(`/tmp/design-doc-render/${layout}.svg`, wrapped);
  console.log(`wrote ${layout}.svg (${doc.elements.length} elements)`);
}

const blank = blankDesignDocument(width, height, "#ffffff");
const blankMarkup = extractSvg(renderToStaticMarkup(createElement(DesignDocumentRenderer, { document: blank })));
const blankWrapped = blankMarkup.replace("<svg", `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`);
writeFileSync("/tmp/design-doc-render/blank.svg", blankWrapped);
console.log(`wrote blank.svg (${blank.elements.length} elements)`);
