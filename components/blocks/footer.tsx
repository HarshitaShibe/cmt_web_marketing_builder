import type { ComponentConfig } from "@measured/puck";
import { z } from "zod";

export const FooterSchema = z.object({
  id: z.string(),
  organizer: z.string().default(""),
  conferenceName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  address: z.string().default(""),
  links: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .default([]),
  copyright: z.string().default(""),
});

export type FooterProps = z.infer<typeof FooterSchema>;

export function Footer({
  organizer,
  conferenceName,
  email,
  phone,
  address,
  links,
  copyright,
}: FooterProps) {
  return (
    <footer
      style={{
        background: "var(--conf-bg)",
        color: "var(--conf-fg)",
        borderColor: "var(--conf-border)",
        fontFamily: "var(--conf-font-body)",
      }}
      className="w-full border-t px-6 py-16"
    >
      <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-3">
        <div>
          {conferenceName ? (
            <p
              style={{ fontFamily: "var(--conf-font-heading)" }}
              className="text-lg font-medium tracking-tight"
            >
              {conferenceName}
            </p>
          ) : null}
          {organizer ? (
            <p style={{ color: "var(--conf-muted-fg)" }} className="mt-2 text-sm">
              {organizer}
            </p>
          ) : null}
          {address ? (
            <p
              style={{ color: "var(--conf-muted-fg)" }}
              className="mt-3 max-w-xs text-sm leading-relaxed"
            >
              {address}
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--conf-muted-fg)" }}>
            Contact
          </p>
          {email ? (
            <p className="mt-3 text-sm">
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            </p>
          ) : null}
          {phone ? (
            <p className="mt-1 text-sm">
              <a href={`tel:${phone}`} className="hover:underline">
                {phone}
              </a>
            </p>
          ) : null}
        </div>

        {links.length > 0 ? (
          <nav>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--conf-muted-fg)" }}
            >
              Links
            </p>
            <ul className="mt-3 space-y-1.5">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l.href} className="text-sm hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      {copyright ? (
        <div
          style={{ borderColor: "var(--conf-border)", color: "var(--conf-muted-fg)" }}
          className="mx-auto mt-12 w-full max-w-5xl border-t pt-6 text-xs"
        >
          {copyright}
        </div>
      ) : null}
    </footer>
  );
}

export const FooterConfig: ComponentConfig<FooterProps> = {
  label: "Footer",
  fields: {
    id: { type: "text" },
    conferenceName: { type: "text", label: "Conference name" },
    organizer: { type: "text", label: "Organizer" },
    email: { type: "text", label: "Email" },
    phone: { type: "text", label: "Phone" },
    address: { type: "textarea", label: "Address" },
    links: {
      type: "array",
      label: "Links",
      arrayFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "URL" },
      },
      getItemSummary: (item) => item.label || "Link",
    },
    copyright: { type: "text", label: "Copyright line" },
  },
  defaultProps: {
    id: "footer",
    conferenceName: "",
    organizer: "",
    email: "",
    phone: "",
    address: "",
    links: [],
    copyright: "",
  },
  render: Footer,
};