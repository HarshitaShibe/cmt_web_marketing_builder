"use client";

import { useRef, useState } from "react";
import type { Image } from "@/lib/schema";

const ACCEPT = "image/png";

async function upload(file: File): Promise<Image> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return { url: data.url, alt: file.name.replace(/\.[^.]+$/, "") };
}

export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  aspect = "square",
}: {
  label: string;
  hint?: string;
  value?: Image;
  onChange: (image: Image | undefined) => void;
  aspect?: "square" | "wide";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(file: File) {
    setBusy(true);
    setError("");
    try {
      onChange(await upload(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-neutral-700">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-neutral-400">{hint}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f && !busy) handle(f);
        }}
        className={`mt-2 flex items-center gap-3 rounded-lg border border-dashed p-3 transition-colors ${
          value ? "border-neutral-300 bg-white" : "border-neutral-200 bg-neutral-50/60"
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded bg-neutral-100 ${
            aspect === "wide" ? "h-12 w-20" : "h-12 w-12"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt={value.alt} className="h-full w-full object-contain" />
          ) : (
            <span aria-hidden className="text-lg text-neutral-300">
              ▨
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-neutral-500">
            {busy ? "Uploading…" : value ? value.alt : "PNG only"}
          </p>
          {error ? <p className="mt-0.5 text-xs text-red-600">{error}</p> : null}
        </div>

        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs transition-colors hover:border-neutral-400 disabled:opacity-50"
          >
            {value ? "Replace" : "Upload"}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="rounded-md px-2 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-900"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MultiImageUpload({
  label,
  hint,
  values,
  onChange,
}: {
  label: string;
  hint?: string;
  values: Image[];
  onChange: (images: Image[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(files: FileList) {
    setBusy(true);
    setError("");
    try {
      const uploaded = await Promise.all(Array.from(files).map(upload));
      onChange([...values, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-neutral-700">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-neutral-400">{hint}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handle(e.target.files);
        }}
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {values.map((img, i) => (
          <div
            key={i}
            className="group relative flex h-12 w-20 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} className="h-full w-full object-contain p-1" />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-12 w-20 items-center justify-center rounded border border-dashed border-neutral-300 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700 disabled:opacity-50"
        >
          {busy ? "…" : "+ Add"}
        </button>
      </div>

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}