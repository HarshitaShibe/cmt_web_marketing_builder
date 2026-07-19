import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { publishSite } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const { siteId } = (await request.json()) ?? {};

    if (!siteId) {
      return NextResponse.json({ error: "siteId is required" }, { status: 400 });
    }

    const row = await publishSite(siteId);
    if (!row) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    revalidatePath(`/${row.slug}`);
    if (row.customDomain) revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true,
      slug: row.slug,
      publishedAt: row.publishedAt,
      url: row.customDomain ? `https://${row.customDomain}` : `/${row.slug}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}