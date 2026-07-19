import { notFound } from "next/navigation";
import { SiteEditor } from "@/components/editor/site-editor";
import { getSiteById } from "@/lib/db/queries";
import { SiteSchema } from "@/lib/schema";

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { siteId } = await params;
  const { page } = await searchParams;

  const row = await getSiteById(siteId);
  if (!row) notFound();

  const parsed = SiteSchema.safeParse(row.draftLayout);
  if (!parsed.success) notFound();

  const site = parsed.data;
  const pageId = page ?? site.pages[0]?.id ?? "home";

  return <SiteEditor site={site} siteId={siteId} pageId={pageId} />;
}