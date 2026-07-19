import type { ComponentConfig } from "@measured/puck";
import { z } from "zod";
import { Section, Eyebrow, Heading } from "./section";

export const SpeakerGridSchema = z.object({
  id: z.string(),
  eyebrow: z.string().default("Speakers"),
  heading: z.string().default("Keynote speakers"),
  columns: z.enum(["2", "3", "4"]).default("3"),
  speakers: z
    .array(
      z.object({
        name: z.string(),
        title: z.string().optional(),
        affiliation: z.string().optional(),
        photo: z.string().optional(),
      })
    )
    .default([]),
});

export type SpeakerGridProps = z.infer<typeof SpeakerGridSchema>;

const colClass: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export function SpeakerGrid({ eyebrow, heading, columns, speakers }: SpeakerGridProps) {
  return (
    <Section>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading>{heading}</Heading>

      <ul className={`mt-12 grid grid-cols-1 gap-x-8 gap-y-12 ${colClass[columns]}`}>
        {speakers.map((s, i) => (
          <li key={i}>
            <div
              style={{
                background: "var(--conf-muted)",
                borderRadius: "var(--conf-radius)",
              }}
              className="aspect[4/5] w-full overflow-hidden"
            >
              {s.photo ? (
                <img
                  src={s.photo}
                  alt={s.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>

            <p className="mt-4 text-base font-medium">{s.name}</p>
            {s.title ? (
              <p style={{ color: "var(--conf-muted-fg)" }} className="mt-0.5 text-sm">
                {s.title}
              </p>
            ) : null}
            {s.affiliation ? (
              <p style={{ color: "var(--conf-primary)" }} className="mt-0.5 text-sm">
                {s.affiliation}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export const SpeakerGridConfig: ComponentConfig<SpeakerGridProps> = {
  label: "Speakers",
  fields: {
    id: { type: "text" },
    eyebrow: { type: "text", label: "Eyebrow" },
    heading: { type: "text", label: "Heading" },
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "Two", value: "2" },
        { label: "Three", value: "3" },
        { label: "Four", value: "4" },
      ],
    },
    speakers: {
      type: "array",
      label: "Speakers",
      arrayFields: {
        name: { type: "text", label: "Name" },
        title: { type: "text", label: "Title" },
        affiliation: { type: "text", label: "Affiliation" },
        photo: { type: "text", label: "Photo URL" },
      },
      getItemSummary: (item) => item.name || "Speaker",
    },
  },
  defaultProps: {
    id: "speakers",
    eyebrow: "Speakers",
    heading: "Keynote speakers",
    columns: "3",
    speakers: [],
  },
  render: SpeakerGrid,
};