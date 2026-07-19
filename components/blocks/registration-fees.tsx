import type { ComponentConfig } from "@measured/puck";
import { z } from "zod";
import { Section, Eyebrow, Heading } from "./section";

export const RegistrationFeesSchema = z.object({
  id: z.string(),
  eyebrow: z.string().default("Registration"),
  heading: z.string().default("Registration fees"),
  note: z.string().default(""),
  currency: z.string().default("INR"),
  tiers: z
    .array(
      z.object({
        category: z.string(),
        amount: z.string(),
        detail: z.string().optional(),
        featured: z.boolean().optional(),
      })
    )
    .default([]),
  ctaLabel: z.string().default("Register now"),
  ctaHref: z.string().default(""),
});

export type RegistrationFeesProps = z.infer<typeof RegistrationFeesSchema>;

export function RegistrationFees({
  eyebrow,
  heading,
  note,
  currency,
  tiers,
  ctaLabel,
  ctaHref,
}: RegistrationFeesProps) {
  return (
    <Section tone="muted">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading>{heading}</Heading>

      {note ? (
        <p
          style={{ color: "var(--conf-muted-fg)" }}
          className="mt-4 max-w-2xl text-base leading-relaxed"
        >
          {note}
        </p>
      ) : null}

      <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <li
            key={i}
            style={{
              background: "var(--conf-bg)",
              borderColor: t.featured ? "var(--conf-primary)" : "var(--conf-border)",
              borderRadius: "var(--conf-radius)",
            }}
            className="flex flex-col border p-6"
          >
            <p className="text-sm font-medium">{t.category}</p>
            <p
              style={{ fontFamily: "var(--conf-font-heading)" }}
              className="mt-3 text-3xl font-medium tracking-tight"
            >
              <span
                style={{ color: "var(--conf-muted-fg)" }}
                className="mr-1 text-base font-normal"
              >
                {currency}
              </span>
              {t.amount}
            </p>
            {t.detail ? (
              <p
                style={{ color: "var(--conf-muted-fg)" }}
                className="mt-3 text-sm leading-relaxed"
              >
                {t.detail}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {ctaLabel && ctaHref ? (
        <a
          href={ctaHref}
          style={{
            background: "var(--conf-primary)",
            color: "var(--conf-primary-fg)",
            borderRadius: "var(--conf-radius)",
          }}
          className="mt-10 inline-flex items-center px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {ctaLabel}
        </a>
      ) : null}
    </Section>
  );
}

export const RegistrationFeesConfig: ComponentConfig<RegistrationFeesProps> = {
  label: "Registration fees",
  fields: {
    id: { type: "text" },
    eyebrow: { type: "text", label: "Eyebrow" },
    heading: { type: "text", label: "Heading" },
    note: { type: "textarea", label: "Note" },
    currency: { type: "text", label: "Currency" },
    tiers: {
      type: "array",
      label: "Fee tiers",
      arrayFields: {
        category: { type: "text", label: "Category" },
        amount: { type: "text", label: "Amount" },
        detail: { type: "textarea", label: "Detail" },
        featured: {
          type: "radio",
          label: "Highlight",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
      },
      getItemSummary: (item) => item.category || "Tier",
    },
    ctaLabel: { type: "text", label: "Button label" },
    ctaHref: { type: "text", label: "Button link (CMT, EasyChair, payment page)" },
  },
  defaultProps: {
    id: "fees",
    eyebrow: "Registration",
    heading: "Registration fees",
    note: "",
    currency: "INR",
    tiers: [],
    ctaLabel: "Register now",
    ctaHref: "",
  },
  render: RegistrationFees,
};