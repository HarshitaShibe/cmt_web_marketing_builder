import type { CSSProperties } from "react";
import type { Site, Page, Block, BlockType } from "@/lib/schema";
import { blockComponents, blockSchemas } from "@/lib/registry";
import { themeToCssVars } from "@/lib/theme/apply";

function RenderBlock({ block }: { block: Block }) {
  const Component = blockComponents[block.type as BlockType] as
    | ((props: Record<string, unknown>) => React.ReactElement | null)
    | undefined;

  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="border border-dashed p-4 text-sm opacity-60">
          Unknown block: {block.type}
        </div>
      );
    }
    return null;
  }

  // Fill in anything the stored JSON predates.
  const schema = blockSchemas[block.type as BlockType];
  let props = block.props as Record<string, unknown>;

  if (schema && typeof schema.safeParse === "function") {
    const parsed = schema.safeParse(block.props);
    if (parsed.success) props = parsed.data as Record<string, unknown>;
  }

  return <Component {...props} />;
}

export function SiteRenderer({
  site,
  page,
}: {
  site: Site;
  page: Page;
}) {
  const themeVars = themeToCssVars(site.theme) as CSSProperties;
  const blocks = page.layout.content ?? [];

  return (
    <div
      style={themeVars}
      data-site={site.slug}
      data-page={page.slug}
      className="min-h-screen"
    >
      {blocks.map((block, i) => (
        <RenderBlock key={block.props.id ?? i} block={block} />
      ))}
    </div>
  );
}

export function findPage(site: Site, slug: string): Page | undefined {
  const normalized = slug.startsWith("/") ? slug : `/${slug}`;
  return site.pages.find((p) => p.slug === normalized && p.enabled);
}

export function homePage(site: Site): Page | undefined {
  return (
    site.pages.find((p) => p.slug === "/" && p.enabled) ??
    site.pages.filter((p) => p.enabled).sort((a, b) => a.order - b.order)[0]
  );
}