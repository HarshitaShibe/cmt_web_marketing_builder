"use client";

import { useMemo, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  DownloadIcon,
  SlidersHorizontalIcon,
  MessageSquareTextIcon,
  TypeIcon,
  ImageIcon,
  PaletteIcon,
  LayoutTemplateIcon,
} from "lucide-react";
import { TemplateCanvas } from "./template-canvas";
import { CaptionPanel } from "./caption-panel";
import { ImageUpload } from "@/components/wizard/image-upload";
import { downloadSvgElement } from "@/lib/social-kit/download";
import { KIT_PLATFORM_LABELS, PLATFORM_DIMENSIONS } from "@/lib/social-kit/templates";
import { fitDimensions } from "@/lib/social-kit/fit-dimensions";
import { TEMPLATES, FONT_PAIRS, getTemplate } from "@/lib/theme/presets";
import {
  KIT_LAYOUTS,
  KIT_HEADLINE_WEIGHTS,
  KIT_HEADLINE_SIZES,
  KIT_TEXT_ALIGNS,
  KIT_IMAGE_FITS,
  KIT_IMAGE_POSITIONS,
  KIT_LOGO_SIZES,
  KIT_PADDINGS,
  KIT_RADII,
} from "@/lib/schema";
import type {
  Image,
  KitCaption,
  KitFields,
  KitLayout,
  KitPlatform,
  KitStyleId,
  KitStyleOverrides,
  KitVariation,
} from "@/lib/schema";

const LAYOUT_LABELS: Record<KitLayout, string> = { editorial: "Editorial", bold: "Bold", split: "Split" };

export function KitEditor({
  kitId,
  variation,
  platforms,
  existingAssets,
  onBack,
  onSave,
}: {
  kitId: string | null;
  variation: KitVariation;
  platforms: KitPlatform[];
  existingAssets: { label: string; image: Image }[];
  onBack: () => void;
  onSave: (updated: KitVariation) => Promise<void>;
}) {
  const [fields, setFields] = useState<KitFields>(variation.fields);
  const [style, setStyle] = useState<KitStyleOverrides>(variation.style);
  const [styleId, setStyleId] = useState<KitStyleId>(variation.styleId);
  const [layout, setLayout] = useState<KitLayout>(variation.layout);
  const [colors, setColors] = useState(variation.colors);
  const [captions, setCaptions] = useState<KitCaption[]>(variation.captions);
  const [platform, setPlatform] = useState<KitPlatform>(platforms[0] ?? "instagram");
  const [panelTab, setPanelTab] = useState<"design" | "captions">("design");
  const [saving, setSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Memoized so unrelated re-renders (e.g. switching tabs) don't create a new
  // object reference and defeat TemplateCanvas's memo().
  const preview = useMemo<KitVariation>(
    () => ({ ...variation, fields, style, styleId, layout, colors, captions }),
    [variation, fields, style, styleId, layout, colors, captions]
  );

  const dims = PLATFORM_DIMENSIONS[platform];
  const canvasBox = useMemo(() => fitDimensions(dims.width, dims.height, 600, 520), [dims.width, dims.height]);

  function updateField<K extends keyof KitFields>(key: K, value: KitFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function updateStyle<K extends keyof KitStyleOverrides>(key: K, value: KitStyleOverrides[K]) {
    setStyle((prev) => ({ ...prev, [key]: value }));
  }

  function switchStyle(id: KitStyleId) {
    setStyleId(id);
    setColors(getTemplate(id).colors);
  }

  async function save() {
    setSaving(true);
    await onSave(preview);
    setSaving(false);
  }

  function download() {
    if (!svgRef.current) return;
    const filename = `${variation.name.toLowerCase().replace(/\s+/g, "-")}-${platform}.svg`;
    downloadSvgElement(svgRef.current, filename);
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-3.5 sm:px-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Results
        </button>
        <span className="text-sm font-semibold tracking-tight text-neutral-900">{variation.name}</span>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save & close"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas — 65% */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-auto bg-gradient-to-b from-neutral-50 to-neutral-100 p-8">
          {platforms.length > 1 ? (
            <div className="flex gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    platform === p ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {KIT_PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          ) : null}

          <div
            style={{ width: canvasBox.width, height: canvasBox.height }}
            className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5"
          >
            <TemplateCanvas ref={svgRef} variation={preview} platform={platform} className="h-full w-full" />
          </div>

          <button
            type="button"
            onClick={download}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Download {KIT_PLATFORM_LABELS[platform]}
          </button>
        </div>

        {/* Right panel — 35% */}
        <div className="flex w-[400px] shrink-0 flex-col border-l border-neutral-100">
          <div className="flex gap-1 p-3">
            <TabButton active={panelTab === "design"} onClick={() => setPanelTab("design")} icon={<SlidersHorizontalIcon className="h-3.5 w-3.5" />}>
              Design
            </TabButton>
            <TabButton active={panelTab === "captions"} onClick={() => setPanelTab("captions")} icon={<MessageSquareTextIcon className="h-3.5 w-3.5" />}>
              Captions
            </TabButton>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8">
            {panelTab === "captions" ? (
              <CaptionPanel kitId={kitId} variation={preview} onUpdated={setCaptions} />
            ) : (
              <div className="space-y-7">
                <Section icon={<LayoutTemplateIcon className="h-3.5 w-3.5" />} title="Style">
                  <div className="flex flex-wrap gap-2.5">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => switchStyle(t.id)}
                        title={t.name}
                        aria-pressed={styleId === t.id}
                        className={`h-8 w-8 rounded-full transition-all duration-150 ${
                          styleId === t.id ? "ring-2 ring-neutral-900 ring-offset-2" : "hover:scale-110 hover:shadow-md"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${t.preview.from}, ${t.preview.to})` }}
                      />
                    ))}
                  </div>
                  <Seg options={KIT_LAYOUTS} value={layout} onChange={setLayout} labels={LAYOUT_LABELS} className="mt-3" />
                </Section>

                <Section icon={<TypeIcon className="h-3.5 w-3.5" />} title="Content">
                  <div className="space-y-3">
                    <Field label="Headline">
                      <input value={fields.headline} onChange={(e) => updateField("headline", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subheading">
                      <input value={fields.subheading} onChange={(e) => updateField("subheading", e.target.value)} className={inputClass} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Date">
                        <input value={fields.dateLine} onChange={(e) => updateField("dateLine", e.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Venue">
                        <input value={fields.venueLine} onChange={(e) => updateField("venueLine", e.target.value)} className={inputClass} />
                      </Field>
                    </div>
                    <Field label="CTA text">
                      <input value={fields.ctaLabel} onChange={(e) => updateField("ctaLabel", e.target.value)} className={inputClass} />
                    </Field>
                    <Toggle
                      label="Show CTA button"
                      checked={style.ctaVisible}
                      onChange={(v) => updateStyle("ctaVisible", v)}
                    />
                  </div>
                </Section>

                <Section icon={<TypeIcon className="h-3.5 w-3.5" />} title="Typography">
                  <div className="space-y-3">
                    <select
                      value={style.fontPairId}
                      onChange={(e) => updateStyle("fontPairId", e.target.value as KitStyleOverrides["fontPairId"])}
                      className={inputClass}
                    >
                      {FONT_PAIRS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} — {f.headingLabel} / {f.bodyLabel}
                        </option>
                      ))}
                    </select>
                    <ControlRow label="Weight">
                      <Seg options={KIT_HEADLINE_WEIGHTS} value={style.headlineWeight} onChange={(v) => updateStyle("headlineWeight", v)} />
                    </ControlRow>
                    <ControlRow label="Size">
                      <Seg options={KIT_HEADLINE_SIZES} value={style.headlineSize} onChange={(v) => updateStyle("headlineSize", v)} />
                    </ControlRow>
                    <ControlRow label="Align">
                      <Seg options={KIT_TEXT_ALIGNS} value={style.textAlign} onChange={(v) => updateStyle("textAlign", v)} />
                    </ControlRow>
                  </div>
                </Section>

                <Section icon={<ImageIcon className="h-3.5 w-3.5" />} title="Image">
                  <div className="space-y-3">
                    {existingAssets.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {existingAssets.map((a) => (
                          <button
                            key={a.label}
                            type="button"
                            onClick={() => updateField("image", a.image)}
                            title={a.label}
                            className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border bg-white transition-all ${
                              fields.image?.url === a.image.url
                                ? "border-neutral-900 ring-1 ring-neutral-900"
                                : "border-neutral-200 hover:border-neutral-400"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.image.url} alt={a.label} className="h-full w-full object-contain p-1" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <ImageUpload label="Upload a different image" hint="PNG only" value={fields.image} onChange={(img) => updateField("image", img)} />
                    <ControlRow label="Fit">
                      <Seg options={KIT_IMAGE_FITS} value={style.imageFit} onChange={(v) => updateStyle("imageFit", v)} />
                    </ControlRow>
                    <ControlRow label="Position">
                      <Seg options={KIT_IMAGE_POSITIONS} value={style.imagePosition} onChange={(v) => updateStyle("imagePosition", v)} />
                    </ControlRow>
                    <ControlRow label="Logo size">
                      <Seg options={KIT_LOGO_SIZES} value={style.logoSize} onChange={(v) => updateStyle("logoSize", v)} />
                    </ControlRow>
                  </div>
                </Section>

                <Section icon={<PaletteIcon className="h-3.5 w-3.5" />} title="Appearance">
                  <div className="space-y-3">
                    <ControlRow label="Corners">
                      <Seg options={KIT_RADII} value={style.radius} onChange={(v) => updateStyle("radius", v)} />
                    </ControlRow>
                    <ControlRow label="Padding">
                      <Seg options={KIT_PADDINGS} value={style.padding} onChange={(v) => updateStyle("padding", v)} />
                    </ControlRow>
                    <Toggle label="Background accent" checked={style.overlay} onChange={(v) => updateStyle("overlay", v)} />
                  </div>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
        active ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5 text-neutral-400">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.12em]">{title}</p>
      </div>
      {children}
    </section>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-xs text-neutral-500">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 transition-colors hover:border-neutral-300"
    >
      <span className="text-sm text-neutral-700">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-neutral-900" : "bg-neutral-200"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Seg<T extends string>({
  options,
  value,
  onChange,
  labels,
  className = "",
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Partial<Record<T, string>>;
  className?: string;
}) {
  return (
    <div className={`flex gap-1 rounded-lg bg-neutral-100 p-1 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-all ${
            value === opt ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}