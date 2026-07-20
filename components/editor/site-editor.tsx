"use client";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";

import { puckConfig } from "@/lib/registry";
import { themeToCssVars } from "@/lib/theme/apply";
import type { Site } from "@/lib/schema";

type SaveState = "idle" | "saving" | "saved" | "published" | "error";

export function SiteEditor({
  site,
  siteId,
  pageId,
}: {
  site: Site;
  siteId: string;
  pageId: string;
}) {
  const page = site.pages.find((p) => p.id === pageId) ?? site.pages[0];
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  const themeVars = useMemo(
    () => themeToCssVars(site.theme) as React.CSSProperties,
    [site.theme]
  );

  const initialData = useMemo(
    () =>
      ({
        root: page?.layout.root ?? { props: {} },
        content: page?.layout.content ?? [],
        zones: page?.layout.zones ?? {},
      }) as Data,
    [page]
  );

  const saveDraft = useCallback(
    async (data: Data) => {
      if (!page) return false;
      setState("saving");
      setMessage("");

      const res = await fetch("/api/sites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, pageId: page.id, layout: data }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setState("error");
        setMessage(body.error ?? "Could not save");
        return false;
      }

      setState("saved");
      setTimeout(() => setState("idle"), 2000);
      return true;
    },
    [siteId, page]
  );

  const publish = useCallback(
    async (data: Data) => {
      const saved = await saveDraft(data);
      if (!saved) return;

      setState("saving");
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setState("error");
        setMessage(body.error ?? "Could not publish");
        return;
      }

      const body = await res.json();
      setState("published");
      setMessage(body.url ?? "");
      setTimeout(() => setState("idle"), 4000);
    },
    [saveDraft, siteId]
  );

  if (!page) {
    return (
      <div className="p-8 text-sm text-neutral-600">
        This site has no pages yet.
      </div>
    );
  }

  return (
    <div style={themeVars} className="h-screen">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={publish}
        headerTitle={site.meta.name || site.slug}
        headerPath={page.slug}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <span className="mr-3 self-center text-xs text-neutral-500">
                {state === "saving" && "Saving…"}
                {state === "saved" && "Draft saved"}
                {state === "published" && `Published ${message}`}
                {state === "error" && message}
              </span>
              <Link
                href={`/social-kit/${siteId}`}
                className="mr-3 self-center rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Social Media Kit
              </Link>
              {children}
            </>
          ),
        }}
      />
    </div>
  );
}