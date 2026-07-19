import type { ReactNode } from "react";

export function Section({
  children,
  tone = "default",
  id,
}: {
  children: ReactNode;
  tone?: "default" | "muted";
  id?: string;
}) {
  return (
    <section
      id={id}
      style={{
        background: tone === "muted" ? "var(--conf-muted)" : "var(--conf-bg)",
        color: "var(--conf-fg)",
        fontFamily: "var(--conf-font-body)",
      }}
      className="scroll-reveal w-full px-6 py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      style={{ color: "var(--conf-primary)" }}
      className="mb-3 text-xs font-medium uppercase tracking-[0.18em]"
    >
      {children}
    </p>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{ fontFamily: "var(--conf-font-heading)" }}
      className="text-3xl font-medium tracking-tight md:text-4xl"
    >
      {children}
    </h2>
  );
}