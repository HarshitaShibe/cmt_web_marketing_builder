import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { sites, siteVersions, type SiteRow } from "@/lib/db/schema";
import { SiteSchema, type Site, type PuckData } from "@/lib/schema";

export async function getSiteBySlug(slug: string): Promise<SiteRow | null> {
  const [row] = await db.select().from(sites).where(eq(sites.slug, slug)).limit(1);
  return row ?? null;
}

export async function getSiteById(id: string): Promise<SiteRow | null> {
  const [row] = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
  return row ?? null;
}

export async function getSiteByDomain(domain: string): Promise<SiteRow | null> {
  const [row] = await db
    .select()
    .from(sites)
    .where(eq(sites.customDomain, domain))
    .limit(1);
  return row ?? null;
}

/** Only ever returns the published copy — this is what visitors see. */
export async function getPublishedSite(slug: string): Promise<Site | null> {
  const row = await getSiteBySlug(slug);
  if (!row?.publishedLayout) return null;
  const parsed = SiteSchema.safeParse(row.publishedLayout);
  return parsed.success ? parsed.data : null;
}

export async function createSite(site: Site): Promise<SiteRow> {
  const [row] = await db
    .insert(sites)
    .values({
      slug: site.slug,
      name: site.meta.name,
      draftLayout: site,
      customDomain: site.settings.domain.customDomain,
      domainStatus: site.settings.domain.domainStatus,
    })
    .returning();
  return row;
}

export async function saveDraft(siteId: string, site: Site): Promise<SiteRow> {
  const [row] = await db
    .update(sites)
    .set({
      draftLayout: site,
      name: site.meta.name,
      updatedAt: new Date(),
    })
    .where(eq(sites.id, siteId))
    .returning();
  return row;
}

/** Update a single page's layout inside the draft, leaving everything else intact. */
export async function saveDraftPage(
  siteId: string,
  pageId: string,
  layout: PuckData
): Promise<SiteRow | null> {
  const row = await getSiteById(siteId);
  if (!row) return null;

  const draft = row.draftLayout;
  const next: Site = {
    ...draft,
    pages: draft.pages.map((p) => (p.id === pageId ? { ...p, layout } : p)),
  };

  const parsed = SiteSchema.safeParse(next);
  if (!parsed.success) throw new Error(`Invalid site: ${parsed.error.message}`);

  return saveDraft(siteId, parsed.data);
}

/** Copy draft to published. This is the entire publish operation. */
export async function publishSite(siteId: string): Promise<SiteRow | null> {
  const row = await getSiteById(siteId);
  if (!row) return null;

  if (row.publishedLayout) {
    await db.insert(siteVersions).values({
      siteId,
      layout: row.publishedLayout,
      label: `Replaced ${new Date().toISOString()}`,
    });
  }

  const [updated] = await db
    .update(sites)
    .set({
      publishedLayout: row.draftLayout,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sites.id, siteId))
    .returning();

  return updated;
}

export async function listVersions(siteId: string, limit = 20) {
  return db
    .select()
    .from(siteVersions)
    .where(eq(siteVersions.siteId, siteId))
    .orderBy(desc(siteVersions.createdAt))
    .limit(limit);
}