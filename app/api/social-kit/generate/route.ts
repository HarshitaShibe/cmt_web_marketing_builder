import { NextResponse } from "next/server";
import {
  getSiteById,
  getSocialKitBySiteId,
  createSocialKit,
  saveSocialKit,
} from "@/lib/db/queries";
import { SiteSchema, SocialKitConfigSchema } from "@/lib/schema";
import { composeSocialKit } from "@/lib/social-kit/compose";
import { generateCaptions } from "@/lib/social-kit/captions";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { siteId } = body ?? {};

    if (!siteId) {
      return NextResponse.json({ error: "siteId is required" }, { status: 400 });
    }

    const siteRow = await getSiteById(siteId);
    if (!siteRow) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const site = SiteSchema.safeParse(siteRow.draftLayout);
    if (!site.success) {
      return NextResponse.json(
        { error: "This site's data looks corrupted." },
        { status: 500 }
      );
    }

    const parsedConfig = SocialKitConfigSchema.safeParse(body.config ?? {});
    if (!parsedConfig.success) {
      return NextResponse.json(
        { error: "Those settings weren't valid.", detail: parsedConfig.error.message },
        { status: 400 }
      );
    }

    const variations = composeSocialKit(site.data.meta, site.data.theme, parsedConfig.data);

    // Captions are generated once per variation right after composing —
    // same layering as compose() -> rewriteCopy() in the website builder:
    // the structure is built first, then enriched with AI copy.
    const withCaptions = await Promise.all(
      variations.map(async (variation) => ({
        ...variation,
        captions: await generateCaptions(site.data.meta, variation.fields),
      }))
    );

    // One kit per site — "Generate 3 more" replaces the existing draft
    // rather than accumulating rows, the same relationship a site has to
    // its own single draftLayout.
    const existing = await getSocialKitBySiteId(siteId);
    const kitRow = existing
      ? await saveSocialKit(existing.id, {
          config: parsedConfig.data,
          variations: withCaptions,
          selectedVariationId: null,
        })
      : await createSocialKit(siteId, parsedConfig.data, withCaptions);

    if (!kitRow) {
      return NextResponse.json({ error: "Could not save the kit." }, { status: 500 });
    }

    return NextResponse.json({
      kitId: kitRow.id,
      config: kitRow.config,
      variations: kitRow.variations,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate the kit.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}