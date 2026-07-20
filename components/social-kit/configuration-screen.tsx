"use client";

import { useState } from "react";
import { ImageIcon, BriefcaseIcon, AtSignIcon, CheckIcon, SparklesIcon } from "lucide-react";
import { TEMPLATES } from "@/lib/theme/presets";
import { KIT_PLATFORMS, KIT_BRANDING_SOURCES } from "@/lib/schema";
import { KIT_PLATFORM_LABELS } from "@/lib/social-kit/templates";
import { KitHeader } from "./kit-header";
import type { KitBrandingSource, KitPlatform, KitStyleId, SocialKitConfig } from "@/lib/schema";

const BRANDING_LABELS: Record<KitBrandingSource, { title: string; note: string }> = {
  auto: { title: "Auto Detect", note: "Uses the colours already on your website." },
  institution: { title: "Institution Branding", note: "Uses your organisation logo's colours." },
  conference: { title: "Conference Branding", note: "Uses your conference logo's colours." },
  custom: { title: "Custom", note: "Pick your own colours." },
};

// lucide-react ships no brand/logo icons (Instagram/LinkedIn/X were removed
// from the core set upstream some time ago) — these are the closest honest
// generic stand-ins: a photo icon for a visual platform, a briefcase for a
// professional network, an @ for a handle-based one.
const PLATFORM_ICONS: Record<KitPlatform, React.ReactNode> = {
  instagram: <ImageIcon className="h-5 w-5" />,
  linkedin: <BriefcaseIcon className="h-5 w-5" />,
  twitter: <AtSignIcon className="h-5 w-5" />,
};

export function ConfigurationScreen({
  siteId,
  siteName,
  config,
  recommendedStyleId,
  hasOrganizationLogo,
  hasConferenceLogo,
  isPublished,
  error,
  onGenerate,
}: {
  siteId: string;
  siteName: string;
  config: SocialKitConfig;
  recommendedStyleId: KitStyleId;
  hasOrganizationLogo: boolean;
  hasConferenceLogo: boolean;
  isPublished: boolean;
  error?: string;
  onGenerate: (config: SocialKitConfig) => void;
}) {
  const [platforms, setPlatforms] = useState<KitPlatform[]>(config.platforms);
  const [styleId, setStyleId] = useState<KitStyleId>(config.styleId);
  const [brandingSource, setBrandingSource] = useState<KitBrandingSource>(config.brandingSource);
  const [customColors, setCustomColors] = useState(config.customColors);
  const [changed, setChanged] = useState(false);

  function togglePlatform(p: KitPlatform) {
    setChanged(true);
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function resetToRecommended() {
    setPlatforms([...KIT_PLATFORMS]);
    setStyleId(recommendedStyleId);
    setBrandingSource("auto");
    setCustomColors(undefined);
    setChanged(false);
  }

  function brandingDisabled(source: KitBrandingSource) {
    if (source === "institution") return !hasOrganizationLogo;
    if (source === "conference") return !hasConferenceLogo;
    return false;
  }

  const summary = [
    platforms.map((p) => KIT_PLATFORM_LABELS[p]).join(", ") || "No platforms",
    TEMPLATES.find((t) => t.id === styleId)?.name ?? styleId,
    BRANDING_LABELS[brandingSource].title,
  ].join(" · ");

  return (
    <div className="flex h-screen flex-col bg-white">
      <KitHeader siteId={siteId} siteName={siteName} />
      <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Social media kit</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">Ready when you are, {siteName}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
            Everything below is pre-selected with our best recommendation. Change anything you like, or just hit Generate.
          </p>
          {!isPublished ? (
            <p className="mt-2 text-sm text-neutral-400">
              Your website doesn't need to be published first — this uses the details already saved in your draft.
            </p>
          ) : null}

          {/* Section A — Platforms */}
          <section className="mt-12">
            <h2 className="text-sm font-semibold text-neutral-900">Platforms</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {KIT_PLATFORMS.map((p) => {
                const selected = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    aria-pressed={selected}
                    className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150 ${
                      selected
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                        : "border-neutral-200 text-neutral-900 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
                    }`}
                  >
                    <span className={selected ? "text-white" : "text-neutral-400 transition-colors group-hover:text-neutral-600"}>
                      {PLATFORM_ICONS[p]}
                    </span>
                    <span className="text-sm font-medium">{KIT_PLATFORM_LABELS[p]}</span>
                    {selected ? (
                      <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section B — Design Style */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold text-neutral-900">Design style</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((t) => {
                const selected = t.id === styleId;
                const isRecommended = t.id === recommendedStyleId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setChanged(true);
                      setStyleId(t.id);
                    }}
                    aria-pressed={selected}
                    className={`group overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                      selected
                        ? "border-neutral-900 shadow-lg ring-1 ring-neutral-900"
                        : "border-neutral-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg"
                    }`}
                  >
                    <div className="relative h-24 px-4 py-3" style={{ background: t.colors.background }}>
                      <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-1.5"
                        style={{ background: `linear-gradient(90deg, ${t.preview.from}, ${t.preview.to})` }}
                      />
                      <div className="mt-3 h-1.5 w-8 rounded-full transition-all duration-200 group-hover:w-12" style={{ background: t.colors.primary }} />
                      <div className="mt-2.5 h-2.5 w-3/4 rounded" style={{ background: t.colors.foreground, opacity: 0.85 }} />
                      <div className="mt-1.5 h-2 w-1/2 rounded" style={{ background: t.colors.mutedForeground, opacity: 0.6 }} />
                      {isRecommended ? (
                        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-900 shadow-sm backdrop-blur">
                          <SparklesIcon className="h-3 w-3" />
                          Recommended
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-neutral-100 p-3.5">
                      <span className="text-sm font-medium text-neutral-900">{t.name}</span>
                      {selected ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-white">
                          <CheckIcon className="h-2.5 w-2.5" />
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section C — Brand Colors */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold text-neutral-900">Brand colors</h2>
            <div className="mt-4 space-y-2">
              {KIT_BRANDING_SOURCES.map((source) => {
                const selected = brandingSource === source;
                const disabled = brandingDisabled(source);
                return (
                  <div key={source}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setChanged(true);
                        setBrandingSource(source);
                      }}
                      aria-pressed={selected}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${
                        disabled
                          ? "cursor-not-allowed border-neutral-100 opacity-50"
                          : selected
                            ? "border-neutral-900 bg-neutral-50 shadow-sm"
                            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-medium text-neutral-900">{BRANDING_LABELS[source].title}</span>
                        <span className="block text-xs text-neutral-500">
                          {disabled ? "Add a logo in the wizard to unlock this" : BRANDING_LABELS[source].note}
                        </span>
                      </span>
                      {selected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                      ) : null}
                    </button>

                    {selected && source === "custom" ? (
                      <div className="mt-2 flex items-center gap-5 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3.5">
                        <label className="flex items-center gap-2 text-xs text-neutral-600">
                          Primary
                          <input
                            type="color"
                            value={customColors?.primary ?? "#1e40af"}
                            onChange={(e) => {
                              setChanged(true);
                              setCustomColors((prev) => ({ ...prev, primary: e.target.value }));
                            }}
                            className="h-7 w-10 cursor-pointer rounded border border-neutral-200"
                          />
                        </label>
                        <label className="flex items-center gap-2 text-xs text-neutral-600">
                          Accent
                          <input
                            type="color"
                            value={customColors?.accent ?? "#dbeafe"}
                            onChange={(e) => {
                              setChanged(true);
                              setCustomColors((prev) => ({ ...prev, accent: e.target.value }));
                            }}
                            className="h-7 w-10 cursor-pointer rounded border border-neutral-200"
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {error ? (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
        </div>
      </main>

      {/* Sticky Generate Bar */}
      <div className="border-t border-neutral-100 bg-white/80 px-6 py-4 backdrop-blur sm:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs text-neutral-400">{summary}</p>
            {changed ? (
              <button
                type="button"
                onClick={resetToRecommended}
                className="mt-0.5 text-xs text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
              >
                Reset to recommended
              </button>
            ) : null}
          </div>
          <button
            type="button"
            disabled={platforms.length === 0}
            onClick={() => onGenerate({ platforms, styleId, brandingSource, customColors })}
            className="shrink-0 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          >
            Generate Social Media Kit
          </button>
        </div>
      </div>
    </div>
  );
}