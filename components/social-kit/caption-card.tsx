"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import type { KitCaption } from "@/lib/schema";

export function CaptionCard({ caption, platformLabel }: { caption: KitCaption; platformLabel: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const full = [caption.text, caption.hashtags.map((h) => `#${h}`).join(" ")].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">{platformLabel}</span>
        <button
          type="button"
          onClick={copy}
          className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
            copied ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-800">{caption.text || "—"}</p>
      {caption.hashtags.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {caption.hashtags.map((h) => (
            <span key={h} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
              #{h}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}