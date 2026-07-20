import { notFound } from "next/navigation";
import { getSiteById, getSocialKitBySiteId } from "@/lib/db/queries";
import { SiteSchema } from "@/lib/schema";
import { SocialKitApp } from "@/components/social-kit/social-kit-app";

export const metadata = {
  title: "Social media kit",
};

export default async function SocialKitPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const row = await getSiteById(siteId);
  if (!row) notFound();

  const parsed = SiteSchema.safeParse(row.draftLayout);
  if (!parsed.success) notFound();

  const kitRow = await getSocialKitBySiteId(siteId);

  return (
    <SocialKitApp
      site={parsed.data}
      siteId={siteId}
      isPublished={Boolean(row.publishedAt)}
      initialKit={
        kitRow
          ? { kitId: kitRow.id, config: kitRow.config, variations: kitRow.variations }
          : null
      }
    />
  );
}