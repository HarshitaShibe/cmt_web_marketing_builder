"use client";

import { TEMPLATES, FONT_PAIRS, type TemplateId, type FontPairId } from "@/lib/theme/presets";

export function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={selected}
            className={`overflow-hidden rounded-xl border text-left transition-all ${
              selected
                ? "border-neutral-900 shadow-md ring-1 ring-neutral-900"
                : "border-neutral-200 hover:border-neutral-400 hover:shadow-sm"
            }`}
          >
            {/* Miniature of the hero, drawn from the template's own colours */}
            <div
              className="relative h-32 px-4 py-4"
              style={{ background: t.colors.background }}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${t.preview.from}, ${t.preview.to})`,
                }}
              />
              <div
                className="mt-2 h-1.5 w-10 rounded-full"
                style={{ background: t.colors.primary }}
              />
              <div
                className="mt-2.5 h-3 w-4/5 rounded"
                style={{ background: t.colors.foreground, opacity: 0.85 }}
              />
              <div
                className="mt-1.5 h-2 w-3/5 rounded"
                style={{ background: t.colors.mutedForeground, opacity: 0.5 }}
              />
              <div className="mt-3 flex gap-1.5">
                <div
                  className="h-4 w-14"
                  style={{
                    background: t.colors.primary,
                    borderRadius: t.radius === "none" ? 0 : t.radius === "lg" ? 8 : 4,
                  }}
                />
                <div
                  className="h-4 w-12 border"
                  style={{
                    borderColor: t.colors.border,
                    borderRadius: t.radius === "none" ? 0 : t.radius === "lg" ? 8 : 4,
                  }}
                />
              </div>
            </div>

            <div className="border-t border-neutral-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-neutral-900">{t.name}</span>
                {selected ? (
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white"
                  >
                    ✓
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                {t.tagline}
              </p>
              <p className="mt-2 text-[11px] text-neutral-400">{t.bestFor}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function FontPairPicker({
  value,
  onChange,
}: {
  value: FontPairId;
  onChange: (id: FontPairId) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FONT_PAIRS.map((f) => {
        const selected = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            aria-pressed={selected}
            className={`rounded-xl border p-5 text-left transition-all ${
              selected
                ? "border-neutral-900 bg-neutral-50 shadow-sm"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <p
              className="text-2xl leading-tight tracking-tight text-neutral-900"
              style={{ fontFamily: f.heading }}
            >
              Conference
            </p>
            <p
              className="mt-1.5 text-sm leading-relaxed text-neutral-600"
              style={{ fontFamily: f.body }}
            >
              Submissions open until November.
            </p>

            <div className="mt-4 border-t border-neutral-100 pt-3">
              <p className="text-sm font-medium text-neutral-900">{f.name}</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                {f.headingLabel} · {f.bodyLabel}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}