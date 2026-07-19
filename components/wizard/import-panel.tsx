"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

type Mode = "file" | "url";
type Status = "idle" | "reading" | "extracting" | "building" | "done" | "error";

type Result = {
  siteId: string;
  slug: string;
  editorUrl: string;
  source: string;
  confidence: "high" | "partial";
  found: string[];
  missing: string[];
  pages: number;
  chars: number;
};

const ACCEPT = ".pdf,.docx,.txt";

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  reading: "Reading your document…",
  extracting: "Finding conference details…",
  building: "Building your site…",
  done: "Done",
  error: "",
};

export function ImportPanel() {
  const [mode, setMode] = useState<Mode>("file");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = status === "reading" || status === "extracting" || status === "building";

  const run = useCallback(async (body: FormData | string) => {
    setError("");
    setResult(null);
    setStatus("reading");

    // Advance the label so long extractions don't look stalled.
    const t1 = setTimeout(() => setStatus("extracting"), 1200);
    const t2 = setTimeout(() => setStatus("building"), 6000);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        ...(typeof body === "string"
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: body }),
            }
          : { body }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "That didn't work. Try another file or the wizard.");
        return;
      }

      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  }, []);

  function handleFile(file: File) {
    setFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    run(fd);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
        >
          ← Back
        </Link>

        <h1 className="mt-6 text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
          Import your conference
        </h1>
        <p className="mt-3 text-neutral-500">
          We&apos;ll read the dates, committee, fees, and topics, then build a
          site around them. You can change everything afterwards.
        </p>

        {/* ---- Tabs ---- */}
        <div className="mt-10 inline-flex rounded-lg border border-neutral-200 p-1">
          {(["file", "url"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              disabled={busy}
              className={`rounded-md px-4 py-2 text-sm transition-colors ${
                mode === m
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {m === "file" ? "Upload a file" : "From a website"}
            </button>
          ))}
        </div>

        {/* ---- File drop zone ---- */}
        {mode === "file" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f && !busy) handleFile(f);
            }}
            className={`mt-6 rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
              dragging
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 bg-neutral-50/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            <p className="text-sm font-medium text-neutral-900">
              {fileName || "Drop your brochure here"}
            </p>
            <p className="mt-1.5 text-sm text-neutral-500">
              PDF, Word document, or plain text — up to 15 MB
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="mt-5 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Choose a file
            </button>
          </div>
        )}

        {/* ---- URL input ---- */}
        {mode === "url" && (
          <div className="mt-6 rounded-2xl border border-neutral-200 p-8">
            <label className="block">
              <span className="text-sm font-medium text-neutral-900">
                Link to last year&apos;s conference site
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://icai2026.example.edu"
                disabled={busy}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 disabled:opacity-50"
              />
            </label>

            <p className="mt-2 text-xs text-neutral-400">
              Works best with pages that show the details as text rather than
              images.
            </p>

            <button
              type="button"
              onClick={() => url.trim() && run(url.trim())}
              disabled={busy || !url.trim()}
              className="mt-5 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Import from this page
            </button>
          </div>
        )}

        {/* ---- Progress ---- */}
        {busy && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-3.5">
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"
            />
            <span className="text-sm text-neutral-700">{STATUS_TEXT[status]}</span>
          </div>
        )}

        {/* ---- Error ---- */}
        {status === "error" && error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-4">
            <p className="text-sm text-red-800">{error}</p>
            <Link
              href="/wizard"
              className="mt-2 inline-block text-sm font-medium text-red-900 underline underline-offset-2"
            >
              Build it from the wizard instead
            </Link>
          </div>
        )}

        {/* ---- Result ---- */}
        {status === "done" && result && (
          <div className="mt-6 rounded-2xl border border-neutral-200 p-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
              {result.confidence === "high" ? "Looking good" : "Partly imported"}
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-tight text-neutral-900">
              Your site is ready to edit
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Read {result.chars.toLocaleString()} characters
              {result.pages > 1 ? ` across ${result.pages} pages` : ""}.
            </p>

            <dl className="mt-6 space-y-3 border-t border-neutral-100 pt-5 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-neutral-400">Found</dt>
                <dd className="text-neutral-900">{result.found.join(", ")}</dd>
              </div>
              {result.missing.length > 0 && (
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-neutral-400">Add later</dt>
                  <dd className="text-neutral-500">{result.missing.join(", ")}</dd>
                </div>
              )}
            </dl>

            <a
              href={result.editorUrl}
              className="mt-7 inline-flex rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Open the editor
            </a>
          </div>
        )}
      </div>
    </main>
  );
}