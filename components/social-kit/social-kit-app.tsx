"use client";

import { useMemo, useState } from "react";
import { ConfigurationScreen } from "./configuration-screen";
import { ResultsScreen } from "./results-screen";
import { DesignEditor } from "./design-editor";
import { recommendStyleId } from "@/lib/social-kit/compose";
import { emptySocialKitConfig } from "@/lib/schema";
import type { Image, Site, SocialKitConfig, KitVariation } from "@/lib/schema";

type Screen = "configure" | "generating" | "results" | "editing";

export function SocialKitApp({
  site,
  siteId,
  isPublished,
  initialKit,
}: {
  site: Site;
  siteId: string;
  isPublished: boolean;
  initialKit?: { kitId: string; config: SocialKitConfig; variations: KitVariation[] } | null;
}) {
  const recommended = useMemo(
    () => recommendStyleId(site.theme, site.meta),
    [site.theme, site.meta]
  );

  const existingAssets = useMemo(() => {
    const list: { label: string; image: Image }[] = [];
    if (site.meta.logo) list.push({ label: "Conference logo", image: site.meta.logo });
    if (site.meta.organizationLogo) list.push({ label: "Organisation logo", image: site.meta.organizationLogo });
    if (site.meta.banner) list.push({ label: "Website banner", image: site.meta.banner });
    return list;
  }, [site.meta]);

  const [screen, setScreen] = useState<Screen>(initialKit ? "results" : "configure");
  const [config, setConfig] = useState<SocialKitConfig>(
    initialKit?.config ?? { ...emptySocialKitConfig(), styleId: recommended }
  );
  const [kitId, setKitId] = useState<string | null>(initialKit?.kitId ?? null);
  const [variations, setVariations] = useState<KitVariation[]>(initialKit?.variations ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function generate(nextConfig: SocialKitConfig) {
    setConfig(nextConfig);
    setScreen("generating");
    setError("");

    try {
      const res = await fetch("/api/social-kit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, config: nextConfig }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not generate the kit.");
        setScreen("configure");
        return;
      }

      const body = await res.json();
      setKitId(body.kitId);
      setVariations(body.variations);
      setScreen("results");
    } catch {
      setError("Something went wrong. Please try again.");
      setScreen("configure");
    }
  }

  async function saveVariation(updated: KitVariation) {
    const next = variations.map((v) => (v.id === updated.id ? updated : v));
    setVariations(next);

    if (!kitId) return;
    // Note: the route lives at /api/social-kit/generate/[kitid] (kit
    // creation and per-kit mutation share the same dynamic segment) — not
    // /api/social-kit/[kitId], which doesn't exist.
    await fetch(`/api/social-kit/generate/${kitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variations: next }),
    });
  }

  if (screen === "configure") {
    return (
      <ConfigurationScreen
        siteId={siteId}
        siteName={site.meta.acronym || site.meta.name || site.slug}
        config={config}
        recommendedStyleId={recommended}
        hasOrganizationLogo={Boolean(site.meta.organizationLogo?.url)}
        hasConferenceLogo={Boolean(site.meta.logo?.url)}
        isPublished={isPublished}
        error={error}
        onGenerate={generate}
      />
    );
  }

  if (screen === "generating") {
    return <GeneratingState />;
  }

  if (screen === "editing" && editingId) {
    const variation = variations.find((v) => v.id === editingId);
    if (variation) {
      return (
        <DesignEditor
          kitId={kitId}
          variation={variation}
          platforms={config.platforms}
          existingAssets={existingAssets}
          facts={site.meta}
          onBack={() => setScreen("results")}
          onSave={saveVariation}
        />
      );
    }
  }

  return (
    <ResultsScreen
      siteId={siteId}
      siteName={site.meta.acronym || site.meta.name || site.slug}
      variations={variations}
      platforms={config.platforms}
      onEdit={(id) => {
        setEditingId(id);
        setScreen("editing");
      }}
      onRegenerate={() => generate(config)}
    />
  );
}

function GeneratingState() {
  const steps = [
    "Reading conference details",
    "Applying selected design style",
    "Matching brand colors",
    "Designing layouts",
    "Preparing your kit",
  ];

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <ul className="space-y-3">
          {steps.map((step) => (
            <li key={step} className="flex items-center gap-3 text-sm text-neutral-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white">
                ✓
              </span>
              {step}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-neutral-400">
          This usually takes about 20 seconds.
        </p>
      </div>
    </div>
  );
}