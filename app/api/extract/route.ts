import { NextResponse } from "next/server";
import { extractDocument, type ExtractedDoc } from "@/lib/extract/pdf";
import { extractFromUrl } from "@/lib/extract/url";
import { extractFacts } from "@/lib/extract/to-facts";
import { composeFromFacts } from "@/lib/composer";
import { createSite, getSiteBySlug } from "@/lib/db/queries";
import type { ColorPreset, FontPreset, DesignStyle } from "@/lib/schema";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let doc: ExtractedDoc;
    let choices: {
      colorPreset?: ColorPreset;
      fontPreset?: FontPreset;
      designStyle?: DesignStyle;
    } = {};

    // ---- Input: JSON body with a URL, or multipart with a file ----
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (!body?.url) {
        return NextResponse.json(
          { error: "Provide a web address to import from." },
          { status: 400 }
        );
      }
      doc = await extractFromUrl(String(body.url));
      choices = {
        colorPreset: body.colorPreset,
        fontPreset: body.fontPreset,
        designStyle: body.designStyle,
      };
    } else {
      const formData = await request.formData();
      const file = formData.get("file");
      const url = formData.get("url");

      if (file instanceof File) {
        doc = await extractDocument(file);
      } else if (typeof url === "string" && url.trim()) {
        doc = await extractFromUrl(url.trim());
      } else {
        return NextResponse.json(
          { error: "Upload a PDF or Word document, or paste a web address." },
          { status: 400 }
        );
      }

      choices = {
        colorPreset: (formData.get("colorPreset") as ColorPreset) ?? undefined,
        fontPreset: (formData.get("fontPreset") as FontPreset) ?? undefined,
        designStyle: (formData.get("designStyle") as DesignStyle) ?? undefined,
      };
    }

    // ---- Guard: did we get usable text? ----
    if (doc.chars < 100) {
      return NextResponse.json(
        {
          error:
            doc.warning ??
            "We couldn't read any text from that source. If it's a scanned PDF, try the wizard instead.",
          source: doc.source,
        },
        { status: 422 }
      );
    }

    // ---- Text to structured facts ----
    const result = await extractFacts(doc.text);
    if (result.confidence === "none") {
      return NextResponse.json(
        {
          error:
            result.note ??
            "We couldn't find conference details in that source. Try the wizard instead.",
          source: doc.source,
          pages: doc.pages,
        },
        { status: 422 }
      );
    }

    // ---- Facts to site: same composer as the wizard door ----
    const site = composeFromFacts(result.facts, choices);

    let slug = site.slug;
    let attempt = 1;
    while (await getSiteBySlug(slug)) {
      attempt += 1;
      slug = `${site.slug}-${attempt}`;
      if (attempt > 20) break;
    }

    const row = await createSite({
      ...site,
      slug,
      settings: { ...site.settings, domain: { ...site.settings.domain, slug } },
    });

    return NextResponse.json({
      siteId: row.id,
      slug: row.slug,
      editorUrl: `/editor/${row.id}`,
      source: doc.source,
      confidence: result.confidence,
      found: result.found,
      missing: result.missing,
      pages: doc.pages,
      chars: doc.chars,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not process that source.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}