import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import { getSiteById, getSiteByDomain } from "@/lib/db/queries";
import { provisionDomain, checkDomain, normalizeHost } from "@/lib/domains/resolve";

/** Attach a custom domain to a site. */
export async function POST(request: Request) {
  try {
    const { siteId, domain } = (await request.json()) ?? {};

    if (!siteId || !domain) {
      return NextResponse.json(
        { error: "siteId and domain are required." },
        { status: 400 }
      );
    }

    const clean = normalizeHost(String(domain));

    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(clean)) {
      return NextResponse.json(
        { error: "That doesn't look like a valid domain." },
        { status: 400 }
      );
    }

    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }

    const taken = await getSiteByDomain(clean);
    if (taken && taken.id !== siteId) {
      return NextResponse.json(
        { error: "That domain is already connected to another site." },
        { status: 409 }
      );
    }

    const result = await provisionDomain(clean);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await db
      .update(sites)
      .set({ customDomain: clean, domainStatus: "pending", updatedAt: new Date() })
      .where(eq(sites.id, siteId));

    return NextResponse.json({
      ok: true,
      domain: clean,
      status: "pending",
      records: result.records,
      instructions:
        "Add this record at your domain registrar. Certificates usually issue within a few minutes.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add that domain.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Poll verification status. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId." }, { status: 400 });
  }

  const site = await getSiteById(siteId);
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404 });
  }

  if (!site.customDomain) {
    return NextResponse.json({ domain: null, status: "none" });
  }

  const result = await checkDomain(site.customDomain);

  if (result.ok && result.status && result.status !== site.domainStatus) {
    await db
      .update(sites)
      .set({ domainStatus: result.status, updatedAt: new Date() })
      .where(eq(sites.id, siteId));
  }

  return NextResponse.json({
    domain: site.customDomain,
    status: result.status ?? site.domainStatus,
    error: result.error,
  });
}

/** Detach a custom domain. */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId." }, { status: 400 });
  }

  await db
    .update(sites)
    .set({ customDomain: null, domainStatus: "none", updatedAt: new Date() })
    .where(eq(sites.id, siteId));

  return NextResponse.json({ ok: true });
}