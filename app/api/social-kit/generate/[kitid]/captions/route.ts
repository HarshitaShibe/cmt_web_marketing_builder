import { NextResponse } from "next/server";
import { z } from "zod";
import { getSocialKitById, getSiteById, saveSocialKit } from "@/lib/db/queries";
import { SiteSchema } from "@/lib/schema";
import { generateCaptions } from "@/lib/social-kit/captions";

const BodySchema = z.object({ variationId: z.string() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params;
    const body = BodySchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "variationId is required" }, { status: 400 });
    }

    const kit = await getSocialKitById(kitId);
    if (!kit) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    const variation = kit.variations.find((v) => v.id === body.data.variationId);
    if (!variation) {
      return NextResponse.json({ error: "Variation not found" }, { status: 404 });
    }

    const siteRow = await getSiteById(kit.siteId);
    const site = siteRow ? SiteSchema.safeParse(siteRow.draftLayout) : null;
    if (!site?.success) {
      return NextResponse.json({ error: "Could not load conference details" }, { status: 500 });
    }

    const captions = await generateCaptions(site.data.meta, variation.fields);

    const nextVariations = kit.variations.map((v) => (v.id === variation.id ? { ...v, captions } : v));
    await saveSocialKit(kitId, { variations: nextVariations });

    return NextResponse.json({ captions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not regenerate captions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}