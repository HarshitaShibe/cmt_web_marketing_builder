"use client";

import type { ReactNode } from "react";

export function StepHeader({
  step,
  total,
  title,
  hint,
}: {
  step: number;
  total: number;
  title: string;
  hint?: string;
}) {
  return (
    <header className="mb-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
        Step {step} of {total}
      </p>
      <h2 className="mt-2 text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
        {title}
      </h2>
      {hint ? <p className="mt-2 text-sm text-neutral-500">{hint}</p> : null}
    </header>
  );
}

export function OptionGrid({
  columns = 3,
  children,
}: {
  columns?: 2 | 3 | 4;
  children: ReactNode;
}) {
  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return <div className={`grid grid-cols-1 gap-3 ${cols}`}>{children}</div>;
}

export function OptionCard({
  selected,
  onClick,
  title,
  description,
  visual,
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  visual?: ReactNode;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-neutral-900 bg-neutral-50 shadow-sm"
          : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      {multi ? (
        <span
          aria-hidden
          className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${
            selected
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300"
          }`}
        >
          {selected ? "✓" : ""}
        </span>
      ) : null}

      {visual ? <div className="mb-3">{visual}</div> : null}

      <span className="block pr-6 text-sm font-medium text-neutral-900">{title}</span>
      {description ? (
        <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
          {description}
        </span>
      ) : null}
    </button>
  );
}

export function LayoutThumb({ variant }: { variant: string }) {
  const bars: Record<string, ReactNode> = {
    classic: (
      <>
        <div className="h-6 w-full rounded bg-neutral-300" />
        <div className="h-2 w-3/4 rounded bg-neutral-200" />
        <div className="h-2 w-1/2 rounded bg-neutral-200" />
      </>
    ),
    split: (
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-full rounded bg-neutral-300" />
          <div className="h-2 w-2/3 rounded bg-neutral-200" />
        </div>
        <div className="h-10 w-12 rounded bg-neutral-200" />
      </div>
    ),
    centered: (
      <>
        <div className="mx-auto h-5 w-2/3 rounded bg-neutral-300" />
        <div className="mx-auto h-2 w-1/2 rounded bg-neutral-200" />
        <div className="mx-auto h-2 w-1/3 rounded bg-neutral-200" />
      </>
    ),
    banner: (
      <>
        <div className="h-10 w-full rounded bg-neutral-300" />
        <div className="h-2 w-2/3 rounded bg-neutral-200" />
      </>
    ),
    compact: (
      <>
        <div className="h-3 w-full rounded bg-neutral-300" />
        <div className="h-2 w-full rounded bg-neutral-200" />
        <div className="h-2 w-full rounded bg-neutral-200" />
        <div className="h-2 w-2/3 rounded bg-neutral-200" />
      </>
    ),
  };

  return (
    <div className="space-y-1.5 rounded-lg bg-neutral-100 p-3">
      {bars[variant] ?? bars.classic}
    </div>
  );
}

export function ProgressRail({
  steps,
  current,
  onJump,
}: {
  steps: string[];
  current: number;
  onJump: (i: number) => void;
}) {
  return (
    <ol className="space-y-1">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => onJump(i)}
              disabled={i > current}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? "bg-neutral-900 text-white"
                  : done
                    ? "text-neutral-700 hover:bg-neutral-100"
                    : "text-neutral-400"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  active
                    ? "bg-white text-neutral-900"
                    : done
                      ? "bg-neutral-900 text-white"
                      : "border border-neutral-300"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}