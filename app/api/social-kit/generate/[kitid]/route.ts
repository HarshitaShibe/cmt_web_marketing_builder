import { NextResponse } from "next/server";
import { z } from "zod";
import { getSocialKitById, saveSocialKit } from "@/lib/db/queries";
import { KitVariationSchema, SocialKitConfigSchema } from "@/lib/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kitId: string }> }
) {
  const { kitId } = await params;

  const row = await getSocialKitById(kitId);
  if (!row) {
    return NextResponse.json({ error: "Kit not found" }, { status: 404 });
  }

  return NextResponse.json({
    kitId: row.id,
    siteId: row.siteId,
    config: row.config,
    variations: row.variations,
    selectedVariationId: row.selectedVariationId,
  });
}

const PatchSchema = z.object({
  config: SocialKitConfigSchema.optional(),
  variations: z.array(KitVariationSchema).optional(),
  selectedVariationId: z.string().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params;
    const body = await request.json();

    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update", detail: parsed.error.message },
        { status: 400 }
      );
    }

    const row = await saveSocialKit(kitId, parsed.data);
    if (!row) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, updatedAt: row.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}