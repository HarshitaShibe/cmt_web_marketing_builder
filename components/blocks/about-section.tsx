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

export const AboutSectionSchema = z
  .object({
    id: z.string(),
    eyebrow: z.string().default("About"),
    heading: z.string().default("About the conference"),
    body: z.string().default(""),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    layout: z.enum(["split", "stacked"]).default("split"),
  })
  .merge(StyleSchema);

export type AboutSectionProps = z.infer<typeof AboutSectionSchema>;

export function AboutSection(props: AboutSectionProps) {
  const { eyebrow, heading, body, stats, layout } = props;
  const paragraphs = body.split("\n").filter((p) => p.trim().length > 0);
  const centred = props.align === "center";

  const header = (
    <div>
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
  );

  const content = (
    <div>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={bodyStyle(props)}
          className="mb-4 text-base leading-relaxed last:mb-0 md:text-lg"
        >
          {p}
        </p>
      ))}

      {stats.length > 0 ? (
        <dl
          style={{ borderColor: "var(--conf-border)" }}
          className={`mt-10 grid grid-cols-2 gap-6 border-t pt-8 sm:grid-cols-3 ${centred ? "justify-items-center" : ""}`}
        >
          {stats.map((s, i) => (
            <div key={i}>
              <dt
                style={{ fontFamily: "var(--conf-font-heading)", color: accent(props) }}
                className="text-3xl font-semibold tracking-tight"
              >
                {s.value}
              </dt>
              <dd style={bodyStyle(props)} className="mt-1 text-sm">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );

  return (
    <Section>
      <div className={alignClass(props)}>
        {layout === "stacked" ? (
          <div className={centred ? "mx-auto max-w-3xl" : "max-w-3xl"}>
            {header}
            <div className="mt-8">{content}</div>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
            {header}
            {content}
          </div>
        )}
      </div>
    </Section>
  );
}

export const AboutSectionConfig: ComponentConfig<AboutSectionProps> = {
  label: "About",
  fields: {
    id: { type: "text" },
    eyebrow: { type: "text", label: "Eyebrow" },
    heading: { type: "text", label: "Heading" },
    body: { type: "textarea", label: "Body (one paragraph per line)" },
    layout: {
      type: "radio",
      label: "Layout",
      options: [
        { label: "Split", value: "split" },
        { label: "Stacked", value: "stacked" },
      ],
    },
    stats: {
      type: "array",
      label: "Stats",
      arrayFields: {
        value: { type: "text", label: "Value" },
        label: { type: "text", label: "Label" },
      },
      getItemSummary: (item) => item.label || "Stat",
    },
    ...STYLE_FIELDS,
  },
  defaultProps: {
    id: "about",
    eyebrow: "About",
    heading: "About the conference",
    body: "",
    stats: [],
    layout: "split",
    ...STYLE_DEFAULTS,
  },
  render: AboutSection,
};