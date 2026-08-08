"use client";

export const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

export function Section({ icon, title, children, action }: { icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-neutral-400">
          {icon}
          <p className="text-xs font-semibold uppercase tracking-[0.12em]">{title}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-xs text-neutral-500">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export function Seg<T extends string>({
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

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-xs text-neutral-500">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 shrink-0 cursor-pointer rounded-md border border-neutral-200 p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 rounded-lg border border-neutral-200 px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-900"
        />
      </div>
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className="text-xs font-medium text-neutral-700">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-neutral-900"
      />
    </div>
  );
}

export function IconButton({
  onClick,
  title,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
      }`}
    >
      {children}
    </button>
  );
}
