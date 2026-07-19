import type { ComponentConfig } from "@measured/puck";
import { z } from "zod";
import { Section } from "./section";
import {
  StyleSchema,
  STYLE_FIELDS,
  STYLE_DEFAULTS,
  headingStyle,
  bodyStyle,
  accent,
  alignClass,
} from "@/lib/blocks/style";

export const ImportantDatesSchema = z
  .object({
  id: z.string(),
  eyebrow: z.string().default("Deadlines"),
  heading: z.string().default("Important dates"),
  items: z
    .array(
      z.object({
        label: z.string(),
        date: z.string(),
        note: z.string().optional(),
        passed: z.boolean().optional(),
      })
    )
    .default([]),
  })
  .merge(StyleSchema);

export type ImportantDatesProps = z.infer<typeof ImportantDatesSchema>;

export function ImportantDates(props: ImportantDatesProps) {
  const { eyebrow, heading, items } = props;
  return (
    <Section tone="muted">
      <div className={alignClass(props)}>
        {eyebrow ? (
          <p
            style={{ color: accent(props) }}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          style={headingStyle(props)}
          className="text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {heading}
        </h2>
      </div>

      <ol className="relative mt-12">
        <div
          aria-hidden
          style={{ background: "var(--conf-border)" }}
          className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px"
        />

        {items.map((item, i) => (
          <li key={i} className="relative flex gap-6 pb-9 pl-8 last:pb-0">
            <span
              aria-hidden
              style={{
                background: item.passed ? "var(--conf-border)" : accent(props),
              }}
              className="absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p
                  className="text-base font-medium"
                  style={{
                    color: item.passed ? "var(--conf-muted-fg)" : "var(--conf-fg)",
                    textDecoration: item.passed ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--conf-font-heading)",
                    color: item.passed ? "var(--conf-muted-fg)" : accent(props),
                  }}
                  className="text-sm font-medium tabular-nums"
                >
                  {item.date}
                </p>
              </div>
              {item.note ? (
                <p style={bodyStyle(props)} className="mt-1 text-sm">
                  {item.note}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export const ImportantDatesConfig: ComponentConfig<ImportantDatesProps> = {
  label: "Important dates",
  fields: {
    id: { type: "text" },
    eyebrow: { type: "text", label: "Eyebrow" },
    heading: { type: "text", label: "Heading" },
    items: {
      type: "array",
      label: "Dates",
      arrayFields: {
        label: { type: "text", label: "Milestone" },
        date: { type: "text", label: "Date" },
        note: { type: "text", label: "Note" },
        passed: {
          type: "radio",
          label: "Passed",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
      },
      getItemSummary: (item) => item.label || "Date",
    },
    ...STYLE_FIELDS,
  },
  defaultProps: {
    id: "dates",
    eyebrow: "Deadlines",
    heading: "Important dates",
    items: [],
    ...STYLE_DEFAULTS,
  },
  render: ImportantDates,
};