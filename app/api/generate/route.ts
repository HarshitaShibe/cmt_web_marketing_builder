import { NextResponse } from "next/server";
import { WizardInputSchema } from "@/lib/schema";
import { composeWithAI } from "@/lib/composer";
import { createSite, getSiteBySlug } from "@/lib/db/queries";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = WizardInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Those answers weren't valid.", detail: parsed.error.message },
        { status: 400 }
      );
    }

    const { site, copySource } = await composeWithAI(parsed.data);

    let slug = site.slug;
    let attempt = 1;
    while (await getSiteBySlug(slug)) {
      attempt += 1;
      slug = `${site.slug}-${attempt}`;
      if (attempt > 20) break;
    }

    const finalSite = {
      ...site,
      slug,
      settings: { ...site.settings, domain: { ...site.settings.domain, slug } },
    };

    const row = await createSite(finalSite);

    return NextResponse.json({
      siteId: row.id,
      slug: row.slug,
      editorUrl: `/editor/${row.id}`,
      pages: finalSite.pages.length,
      copySource,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate the site.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}