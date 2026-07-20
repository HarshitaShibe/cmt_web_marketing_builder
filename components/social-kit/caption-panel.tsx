"use client";

import { useState } from "react";
import { CaptionCard } from "./caption-card";
import { KIT_PLATFORM_LABELS } from "@/lib/social-kit/templates";
import type { KitCaption, KitVariation } from "@/lib/schema";

export function CaptionPanel({
  kitId,
  variation,
  onUpdated,
}: {
  kitId: string | null;
  variation: KitVariation;
  onUpdated: (captions: KitCaption[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function regenerate() {
    if (!kitId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/social-kit/${kitId}/captions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variationId: variation.id }),
      });
      if (res.ok) {
        const body = await res.json();
        onUpdated(body.captions);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Captions</p>
        <button
          type="button"
          onClick={regenerate}
          disabled={loading || !kitId}
          className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-900 disabled:opacity-40"
        >
          {loading ? "Regenerating…" : "✦ Regenerate"}
        </button>
      </div>
      {variation.captions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 p-4 text-xs text-neutral-400">
          No captions yet — save this kit once to generate them.
        </p>
      ) : (
        variation.captions.map((c) => (
          <CaptionCard key={c.platform} caption={c} platformLabel={KIT_PLATFORM_LABELS[c.platform]} />
        ))
      )}
    </div>
  );
}