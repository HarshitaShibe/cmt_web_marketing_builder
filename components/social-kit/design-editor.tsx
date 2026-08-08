"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import {
  ArrowLeftIcon,
  Undo2Icon,
  Redo2Icon,
  EyeIcon,
  DownloadIcon,
  MinusIcon,
  PlusIcon,
  MaximizeIcon,
  XIcon,
  CheckIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { createEditorStore, type EditorStore } from "@/lib/social-kit/editor-store";
import { getOrBuildPlatformDocument, buildStarterOption, type StarterDocumentOption } from "@/lib/social-kit/design-presets";
import { getFontPair } from "@/lib/theme/presets";
import { PLATFORM_DIMENSIONS, KIT_PLATFORM_LABELS } from "@/lib/social-kit/templates";
import { fitDimensions } from "@/lib/social-kit/fit-dimensions";
import { downloadSvgElement } from "@/lib/social-kit/download";
import { exportDocumentAsPng } from "@/lib/social-kit/png-export";
import { DesignEditorCanvas } from "./design-editor-canvas";
import { DesignEditorToolbar } from "./design-editor-toolbar";
import { DesignEditorProperties } from "./design-editor-properties";
import { DesignDocumentRenderer } from "./design-document-renderer";
import type { ConferenceFacts, DesignDocument, Image, KitPlatform, KitVariation } from "@/lib/schema";

const MIN_ZOOM = 25;
const MAX_ZOOM = 200;
const NUDGE = 2;
const NUDGE_BIG = 20;

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

const DEFAULT_COLORS = {
  primary: "#171717",
  primaryForeground: "#ffffff",
  background: "#ffffff",
  foreground: "#171717",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  accent: "#e5e5e5",
  border: "#e5e5e5",
};

/**
 * The Phase 3 editor shell. Owns one EditorStore per platform (created
 * lazily, cached for the session so switching tabs keeps each platform's
 * own undo history), and everything else — toolbar, canvas, properties —
 * is a dumb consumer of whichever store is currently active.
 */
export function DesignEditor({
  kitId,
  variation,
  platforms,
  existingAssets,
  facts,
  onBack,
  onSave,
}: {
  kitId: string | null;
  variation: KitVariation;
  platforms: KitPlatform[];
  existingAssets: { label: string; image: Image }[];
  facts: ConferenceFacts;
  onBack: () => void;
  onSave: (updated: KitVariation) => Promise<void>;
}) {
  const platformList = platforms.length > 0 ? platforms : (["instagram"] as KitPlatform[]);
  const [activePlatform, setActivePlatform] = useState<KitPlatform>(platformList[0]);
  const storesRef = useRef<Partial<Record<KitPlatform, EditorStore>>>({});
  const variationRef = useRef(variation);
  variationRef.current = variation;

  function getStore(platform: KitPlatform): EditorStore {
    let store = storesRef.current[platform];
    if (!store) {
      store = createEditorStore(getOrBuildPlatformDocument(variationRef.current, platform));
      storesRef.current[platform] = store;
    }
    return store;
  }

  const activeStore = getStore(activePlatform);
  const document = useStore(activeStore, (s) => s.document);
  const selectedId = useStore(activeStore, (s) => s.selectedId);
  const selectedElement = document.elements.find((e) => e.id === selectedId) ?? null;
  const dirty = useStore(activeStore, (s) => s.dirty);
  const canUndo = useStore(activeStore, (s) => s.past.length > 0);
  const canRedo = useStore(activeStore, (s) => s.future.length > 0);
  const undo = useStore(activeStore, (s) => s.undo);
  const redo = useStore(activeStore, (s) => s.redo);
  const select = useStore(activeStore, (s) => s.select);
  const deleteElement = useStore(activeStore, (s) => s.deleteElement);
  const duplicateElement = useStore(activeStore, (s) => s.duplicateElement);
  const applyLive = useStore(activeStore, (s) => s.applyLive);
  const beginChange = useStore(activeStore, (s) => s.beginChange);
  const loadDocument = useStore(activeStore, (s) => s.loadDocument);

  const [appliedTemplate, setAppliedTemplate] = useState<StarterDocumentOption | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [preview, setPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [focusContentToken, setFocusContentToken] = useState(0);
  const [downloadBusy, setDownloadBusy] = useState<"png" | null>(null);
  const [downloadError, setDownloadError] = useState("");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceSize, setWorkspaceSize] = useState({ width: 900, height: 640 });

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWorkspaceSize({ width: entry.contentRect.width - 64, height: entry.contentRect.height - 64 });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fitted = fitDimensions(document.width, document.height, Math.max(workspaceSize.width, 200), Math.max(workspaceSize.height, 200));
  const scale = (fitted.width / document.width) * (zoomPct / 100);
  const boxWidth = Math.round(document.width * scale);
  const boxHeight = Math.round(document.height * scale);

  // --- Autosave -------------------------------------------------------------
  const collectVariation = useCallback((): KitVariation => {
    const documents: Partial<Record<KitPlatform, DesignDocument>> = { ...variationRef.current.documents };
    for (const platform of platformList) {
      const store = storesRef.current[platform];
      if (store) documents[platform] = store.getState().document;
    }
    return { ...variationRef.current, documents: documents as KitVariation["documents"] };
  }, [platformList]);

  useEffect(() => {
    if (!dirty) return;
    setSaveStatus("saving");
    const t = setTimeout(async () => {
      const updated = collectVariation();
      variationRef.current = updated;
      await onSave(updated);
      for (const platform of platformList) {
        storesRef.current[platform]?.getState().markSaved();
      }
      setSaveStatus("saved");
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, document]);

  useEffect(() => {
    return () => {
      // Flush-on-unmount: if the debounced autosave above hasn't fired yet
      // (user clicked back right after an edit), don't lose that last edit.
      const anyDirty = platformList.some((p) => storesRef.current[p]?.getState().dirty);
      if (anyDirty) {
        const updated = collectVariation();
        void onSave(updated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Keyboard shortcuts -----------------------------------------------------
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedId) duplicateElement(selectedId);
        return;
      }
      if (!selectedId) return;

      if (e.key === "Escape") {
        select(null);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteElement(selectedId);
        return;
      }
      const step = e.shiftKey ? NUDGE_BIG : NUDGE;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (!selectedElement || selectedElement.locked) return;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        beginChange();
        applyLive(selectedId, { x: selectedElement.x + dx, y: selectedElement.y + dy });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, selectedElement, undo, redo, select, deleteElement, duplicateElement, beginChange, applyLive]);

  // --- Templates --------------------------------------------------------------
  function applyTemplate(option: StarterDocumentOption) {
    const colors = variation.colors ?? DEFAULT_COLORS;
    const fonts = getFontPair(variation.style.fontPairId);
    const dims = PLATFORM_DIMENSIONS[activePlatform];
    const doc = buildStarterOption(option, dims.width, dims.height, {
      colors,
      fonts,
      fields: variation.fields,
      style: variation.style,
    });
    loadDocument(doc);
    setAppliedTemplate(option);
  }

  // --- Export -------------------------------------------------------------
  async function handleDownloadPng() {
    if (!svgRef.current) return;
    setDownloadError("");
    setDownloadBusy("png");
    try {
      await exportDocumentAsPng(svgRef.current, document.width, document.height, `${activePlatform}-${variation.name}.png`);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Could not export PNG.");
    } finally {
      setDownloadBusy(null);
    }
  }

  function handleDownloadSvg() {
    if (!svgRef.current) return;
    downloadSvgElement(svgRef.current, `${activePlatform}-${variation.name}.svg`);
  }

  const dims = PLATFORM_DIMENSIONS[activePlatform];

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Social Media Kit
          </button>
          <span className="h-5 w-px bg-neutral-200" />
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
            {platformList.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePlatform(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activePlatform === p ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {KIT_PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => undo()}
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd+Z)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"
          >
            <Undo2Icon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => redo()}
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd+Shift+Z)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"
          >
            <Redo2Icon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            {saveStatus === "saving" ? (
              <>
                <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" /> Saving…
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CheckIcon className="h-3.5 w-3.5" /> Saved
              </>
            ) : (
              "Autosaves as you edit"
            )}
          </span>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-400"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Preview
          </button>
          <div>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloadBusy !== null}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              {downloadBusy === "png" ? "Exporting…" : "Download PNG"}
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="mt-1 block w-full text-center text-[11px] text-neutral-400 underline decoration-dotted hover:text-neutral-700"
            >
              or download SVG
            </button>
          </div>
        </div>
      </header>

      {downloadError ? (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-center text-xs text-red-700">{downloadError}</div>
      ) : null}

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <DesignEditorToolbar
          store={activeStore}
          facts={facts}
          fields={variation.fields}
          existingAssets={existingAssets}
          activeTemplate={appliedTemplate}
          onApplyTemplate={applyTemplate}
        />

        <div ref={workspaceRef} className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-4 overflow-auto p-8">
          <DesignEditorCanvas
            store={activeStore}
            scale={scale}
            boxWidth={boxWidth}
            boxHeight={boxHeight}
            svgRef={svgRef}
            onEditText={(id) => {
              select(id);
              setFocusContentToken((t) => t + 1);
            }}
          />

          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 shadow-sm">
            <button
              type="button"
              onClick={() => setZoomPct((z) => Math.max(MIN_ZOOM, z - 10))}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center tabular-nums">{zoomPct}%</span>
            <button
              type="button"
              onClick={() => setZoomPct((z) => Math.min(MAX_ZOOM, z + 10))}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="mx-1 h-4 w-px bg-neutral-200" />
            <button
              type="button"
              onClick={() => setZoomPct(100)}
              title="Fit to screen"
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100"
            >
              <MaximizeIcon className="h-3.5 w-3.5" />
            </button>
            <span className="ml-1 text-neutral-400">
              {dims.width} × {dims.height}
            </span>
          </div>
        </div>

        <DesignEditorProperties
          store={activeStore}
          focusContentToken={focusContentToken}
          onReplaceImage={(id) => {
            const input = window.document.createElement("input");
            input.type = "file";
            input.accept = "image/png";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append("file", file);
              const res = await fetch("/api/upload", { method: "POST", body: fd });
              const data = await res.json();
              if (res.ok) {
                beginChange();
                applyLive(id, { src: data.url });
              }
            };
            input.click();
          }}
        />
      </div>

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8" onClick={() => setPreview(false)}>
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <div
            style={fitDimensions(
              document.width,
              document.height,
              typeof window !== "undefined" ? window.innerWidth - 120 : 900,
              typeof window !== "undefined" ? window.innerHeight - 120 : 640
            )}
            className="overflow-hidden rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <DesignDocumentRenderer document={document} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
