import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { SiteRenderer, homePage, findPage } from "@/components/renderer/site-renderer";
import { resolveTenant } from "@/lib/domains/resolve";
import { SiteSchema, type Site } from "@/lib/schema";

export const revalidate = 60;

async function loadPublished(slug: string): Promise<Site | null> {
  const host = (await headers()).get("host") ?? "";
  const row = await resolveTenant(host, slug);
  if (!row?.publishedLayout) return null;

  const parsed = SiteSchema.safeParse(row.publishedLayout);
  return parsed.success ? parsed.data : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadPublished(slug);
  if (!site) return { title: "Not found" };

  const title = site.settings.seo.title ?? site.meta.name;
  const description = site.settings.seo.description ?? site.meta.tagline;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: site.settings.seo.ogImage ? [site.settings.seo.ogImage.url] : undefined,
    },
    icons: site.settings.favicon ? { icon: site.settings.favicon.url } : undefined,
  };
}

export default async function TenantPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { slug } = await params;
  const { p } = await searchParams;

  const site = await loadPublished(slug);
  if (!site) notFound();

  const page = p ? findPage(site, p) : homePage(site);
  if (!page) notFound();

  return <SiteRenderer site={site} page={page} />;
}