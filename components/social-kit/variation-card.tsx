"use client";

import { useRef, useState } from "react";
import { EyeIcon, PencilIcon, DownloadIcon, XIcon, SparklesIcon } from "lucide-react";
import { TemplateCanvas } from "./template-canvas";
import { downloadSvgElement } from "@/lib/social-kit/download";
import { KIT_PLATFORM_LABELS, PLATFORM_DIMENSIONS } from "@/lib/social-kit/templates";
import { fitDimensions } from "@/lib/social-kit/fit-dimensions";
import type { KitPlatform, KitVariation } from "@/lib/schema";

export function VariationCard({
  variation,
  platforms,
  onEdit,
}: {
  variation: KitVariation;
  platforms: KitPlatform[];
  onEdit: () => void;
}) {
  const [platform, setPlatform] = useState<KitPlatform>(platforms[0] ?? "instagram");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const dims = PLATFORM_DIMENSIONS[platform];
  const lightboxBox = fitDimensions(dims.width, dims.height, 640, 560);

  function download() {
    if (!svgRef.current) return;
    const filename = `${variation.name.toLowerCase().replace(/\s+/g, "-")}-${platform}.svg`;
    downloadSvgElement(svgRef.current, filename);
  }

  function openPreview() {
    setPreviewOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setPreviewVisible(true)));
  }

  function closePreview() {
    setPreviewVisible(false);
    setTimeout(() => setPreviewOpen(false), 180);
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">{variation.name}</span>
        {variation.recommended ? (
          <span className="flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-medium text-white">
            <SparklesIcon className="h-3 w-3" />
            Recommended
          </span>
        ) : null}
      </div>

      {platforms.length > 1 ? (
        <div className="flex gap-1 border-b border-neutral-100 px-3 pt-2">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-t-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                platform === p
                  ? "border-b-2 border-neutral-900 text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {KIT_PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>
      ) : null}

      <button type="button" onClick={openPreview} className="block w-full bg-neutral-100 p-5">
        <div
          className="relative w-full overflow-hidden rounded-lg shadow-sm"
          style={{ paddingBottom: `${(dims.height / dims.width) * 100}%` }}
        >
          <div className="absolute inset-0">
            <TemplateCanvas ref={svgRef} variation={variation} platform={platform} className="h-full w-full" />
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={openPreview}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
        >
          <EyeIcon className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={download}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Download
        </button>
      </div>

      {previewOpen ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-6 backdrop-blur-sm transition-opacity duration-200 ${
            previewVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closePreview}
        >
          <div
            className={`w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
              previewVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
              <span className="text-sm font-medium text-neutral-900">
                {variation.name} · {KIT_PLATFORM_LABELS[platform]}
              </span>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Close preview"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-neutral-50 p-6">
              <div style={{ width: lightboxBox.width, height: lightboxBox.height }} className="overflow-hidden rounded-lg shadow-sm">
                <TemplateCanvas variation={variation} platform={platform} className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}