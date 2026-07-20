"use client";

import { KitHeader } from "./kit-header";
import { VariationCard } from "./variation-card";
import type { KitPlatform, KitVariation } from "@/lib/schema";

export function ResultsScreen({
  siteId,
  siteName,
  variations,
  platforms,
  onEdit,
  onRegenerate,
}: {
  siteId: string;
  siteName: string;
  variations: KitVariation[];
  platforms: KitPlatform[];
  onEdit: (variationId: string) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="min-h-screen bg-white">
      <KitHeader siteId={siteId} siteName={siteName} />
      <div className="mx-auto max-w-5xl animate-[fadein_0.25s_ease-out] px-6 py-12 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Social media kit
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
          Your kit is ready
        </h1>
        <p className="mt-2 text-[15px] text-neutral-500">
          Download any variation as-is, or edit one first.
        </p>

        <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {variations.map((variation) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              platforms={platforms}
              onEdit={() => onEdit(variation.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          className="mt-8 text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
        >
          Not quite right? Generate 3 more
        </button>
      </div>
    </div>
  );
}