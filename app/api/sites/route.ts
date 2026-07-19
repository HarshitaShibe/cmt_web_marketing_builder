import { NextResponse } from "next/server";
import { saveDraftPage, getSiteById } from "@/lib/db/queries";
import { PuckDataSchema } from "@/lib/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing site id" }, { status: 400 });
  }

  const row = await getSiteById(id);
  if (!row) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({ site: row.draftLayout, publishedAt: row.publishedAt });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { siteId, pageId, layout } = body ?? {};

    if (!siteId || !pageId) {
      return NextResponse.json(
        { error: "siteId and pageId are required" },
        { status: 400 }
      );
    }

    const parsed = PuckDataSchema.safeParse(layout);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid layout", detail: parsed.error.message },
        { status: 400 }
      );
    }

    const row = await saveDraftPage(siteId, pageId, parsed.data);
    if (!row) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, updatedAt: row.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}