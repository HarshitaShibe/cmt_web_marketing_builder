import { randomUUID } from "node:crypto";
import {
  SiteSchema,
  ConferenceFactsSchema,
  type Site,
  type Page,
  type Block,
  type ConferenceFacts,
  type WizardInput,
  type SectionKey,
  type PageKey,
  WizardInputSchema,
} from "@/lib/schema";
import { buildThemeFromTemplate } from "@/lib/theme/presets";
import { templateFor, type Template } from "@/lib/templates";
import { validateBlock } from "@/lib/registry";
import { rewriteCopy } from "@/lib/ai/rewrite-copy";

const PAGE_TITLES: Record<PageKey, string> = {
  home: "Home",
  about: "About",
  "call-for-papers": "Call for papers",
  publication: "Publication",
  registration: "Registration",
  program: "Programme",
  speakers: "Speakers",
  committee: "Committee",
  venue: "Venue",
  sponsors: "Sponsors",
  history: "History",
  hotels: "Hotels",
  visa: "Visa",
  faqs: "FAQs",
  gallery: "Gallery",
  contact: "Contact",
};

const PAGE_SLUGS: Record<PageKey, string> = {
  home: "/",
  about: "/about",
  "call-for-papers": "/call-for-papers",
  publication: "/publication",
  registration: "/registration",
  program: "/programme",
  speakers: "/speakers",
  committee: "/committee",
  venue: "/venue",
  sponsors: "/sponsors",
  history: "/history",
  hotels: "/hotels",
  visa: "/visa",
  faqs: "/faqs",
  gallery: "/gallery",
  contact: "/contact",
};

/** Sections that map onto a page of their own. */
const SECTION_TO_PAGE: Partial<Record<SectionKey, PageKey>> = {
  about: "about",
  "call-for-papers": "call-for-papers",
  publication: "publication",
  registration: "registration",
  program: "program",
  speakers: "speakers",
  committee: "committee",
  venue: "venue",
  sponsors: "sponsors",
  history: "history",
  hotels: "hotels",
  visa: "visa",
  faqs: "faqs",
  gallery: "gallery",
  contact: "contact",
};

function slugify(input: string, fallback: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return base || fallback;
}

function formatDateRange(start?: string, end?: string) {
  if (!start) return "";
  const fmt = (d: string, withYear = true) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  if (!end || end === start) return fmt(start);
  return `${fmt(start, false)} – ${fmt(end)}`;
}

function detectPlatform(url?: string): ConferenceFacts["submission"]["platform"] {
  if (!url) return "none";
  const u = url.toLowerCase();
  if (u.includes("cmt3") || u.includes("cmt.research")) return "cmt";
  if (u.includes("easychair")) return "easychair";
  if (u.includes("openreview")) return "openreview";
  return "other";
}

/** Wizard answers become the same ConferenceFacts the brochure door produces. */
export function factsFromWizard(input: WizardInput): ConferenceFacts {
  return ConferenceFactsSchema.parse({
    name: input.name,
    acronym: input.acronym,
    tagline: input.theme,
    type: input.conferenceType,
    organizer: input.organizer,
    logo: input.conferenceLogo,
    organizationLogo: input.organizationLogo,
    banner: input.heroImage,
    startDate: input.startDate,
    endDate: input.endDate,
    deadlines: input.deadlines ?? [],
    venue: {
      name: input.venueName,
      city: input.city,
      country: input.country,
    },
    sponsors: input.sponsorLogos.map((logo) => ({ name: logo.alt, logo })),
    submission: {
      platform: detectPlatform(input.submissionUrl),
      url: input.submissionUrl,
      label: "Submit your paper",
    },
    contact: { email: input.email, phone: input.phone },
    raw: input.notes ? { notes: input.notes } : {},
  });
}

type BuildContext = {
  facts: ConferenceFacts;
  template: Template;
  dateLine: string;
  venueLine: string;
  registrationUrl?: string;
};

/** Section keys that currently have a matching block. Others are skipped. */
const SECTION_BUILDERS: Partial<Record<SectionKey, (ctx: BuildContext) => Block>> = {
  hero: ({ facts, template, dateLine, venueLine }) => ({
    type: "Hero",
    props: {
      id: "hero",
      acronym: facts.acronym ?? "",
      heading: facts.name || template.label,
      tagline: facts.tagline || template.copy.heroTagline,
      dateLine,
      venueLine,
      align: "left",
      ctaLabel: "Register",
      ctaHref: "#registration",
      secondaryLabel: facts.submission.platform !== "none" ? facts.submission.label : "",
      secondaryHref: facts.submission.url ?? "",
      backgroundImage: facts.banner?.url ?? "",
      overlayStrength: "medium",
      conferenceLogo: facts.logo?.url ?? "",
      organizationLogo: facts.organizationLogo?.url ?? "",
      sponsorLogos: facts.sponsors
        .filter((s) => s.logo?.url)
        .map((s) => ({ url: s.logo!.url, alt: s.name })),
      showCountdown: true,
      countdownTo: facts.startDate ?? "",
    },
  }),

  about: ({ facts, template }) => ({
    type: "AboutSection",
    props: {
      id: "about",
      eyebrow: "About",
      heading: template.copy.aboutHeading,
      body: facts.raw.about || template.copy.aboutBody,
      stats: template.copy.stats,
    },
  }),

  "important-dates": ({ facts, template }) => ({
    type: "ImportantDates",
    props: {
      id: "important-dates",
      eyebrow: "Deadlines",
      heading: "Important dates",
      items:
        facts.deadlines.length > 0
          ? facts.deadlines.map((d) => ({ label: d.label, date: d.date }))
          : template.copy.deadlines,
    },
  }),

  speakers: ({ facts, template }) => ({
    type: "SpeakerGrid",
    props: {
      id: "speakers",
      eyebrow: "Speakers",
      heading: template.copy.speakersHeading,
      columns: "3",
      speakers:
        facts.speakers.length > 0
          ? facts.speakers.map((s) => ({
              name: s.name,
              title: s.role ?? "",
              affiliation: s.affiliation ?? "",
              photo: s.photo?.url ?? "",
            }))
          : [
              { name: "Speaker name", title: "Designation", affiliation: "Institution", photo: "" },
              { name: "Speaker name", title: "Designation", affiliation: "Institution", photo: "" },
              { name: "Speaker name", title: "Designation", affiliation: "Institution", photo: "" },
            ],
    },
  }),

  registration: ({ facts, template, registrationUrl }) => ({
    type: "RegistrationFees",
    props: {
      id: "registration",
      eyebrow: "Registration",
      heading: "Registration fees",
      note: template.copy.feeNote,
      currency: facts.fees[0]?.currency ?? "INR",
      tiers:
        facts.fees.length > 0
          ? facts.fees.map((f) => ({
              category: f.category,
              amount: f.amount.toLocaleString("en-IN"),
              detail: f.note ?? "",
            }))
          : template.copy.tiers,
      ctaLabel: "Register now",
      ctaHref: registrationUrl ?? facts.submission.url ?? "",
    },
  }),
};

function buildFooter(facts: ConferenceFacts, pages: PageKey[]): Block {
  return {
    type: "Footer",
    props: {
      id: "footer",
      conferenceName: facts.acronym || facts.name || "",
      organizer: facts.organizer ?? "",
      email: facts.contact.email ?? "",
      phone: facts.contact.phone ?? "",
      address: [facts.venue.name, facts.venue.address, facts.venue.city]
        .filter(Boolean)
        .join(", "),
      links: pages
        .filter((p) => p !== "home")
        .slice(0, 5)
        .map((p) => ({ label: PAGE_TITLES[p], href: PAGE_SLUGS[p] })),
      copyright: `© ${new Date().getFullYear()} ${facts.acronym || facts.name || "Conference"}. All rights reserved.`,
    },
  };
}

function keepValid(blocks: Block[]): Block[] {
  return blocks.filter((b) => {
    const result = validateBlock(b.type, b.props);
    if (!result.ok && process.env.NODE_ENV !== "production") {
      console.warn(`Dropped invalid block ${b.type}: ${result.error}`);
    }
    return result.ok;
  });
}

function makePage(key: PageKey, order: number, blocks: Block[], facts: ConferenceFacts): Page {
  return {
    id: key,
    slug: PAGE_SLUGS[key],
    title: PAGE_TITLES[key],
    enabled: true,
    order,
    seo: {
      title: `${PAGE_TITLES[key]} · ${facts.acronym || facts.name || "Conference"}`.trim(),
      description: facts.tagline,
    },
    layout: { root: { props: {} }, content: blocks, zones: {} },
  };
}

/** Canonical order for the homepage, regardless of click order. */
const SECTION_ORDER: SectionKey[] = [
  "hero",
  "countdown",
  "about",
  "important-dates",
  "call-for-papers",
  "publication",
  "speakers",
  "program",
  "registration",
  "committee",
  "venue",
  "hotels",
  "visa",
  "sponsors",
  "history",
  "hall-of-fame",
  "gallery",
  "faqs",
  "contact",
];

export function compose(input: WizardInput, copyOverride?: Template["copy"]): Site {
  const facts = factsFromWizard(input);
  const base = templateFor(input.conferenceType);
  const template: Template = copyOverride ? { ...base, copy: copyOverride } : base;
  const theme = buildThemeFromTemplate(input.templateId, input.fontPairId);

  const ctx: BuildContext = {
    facts,
    template,
    dateLine: formatDateRange(facts.startDate, facts.endDate),
    venueLine: [facts.venue.city, facts.venue.country].filter(Boolean).join(", "),
    registrationUrl: input.registrationUrl,
  };

  // Pages follow from the chosen sections.
  const pages: PageKey[] = [
    "home",
    ...input.sections
      .map((s) => SECTION_TO_PAGE[s])
      .filter((p): p is PageKey => Boolean(p) && p !== "home"),
  ];

  const uniquePages = Array.from(new Set(pages));

  // Homepage: chosen sections in canonical order.
  const ordered = SECTION_ORDER.filter((s) => input.sections.includes(s));
  const homeBlocks = keepValid(
    ordered.map((s) => SECTION_BUILDERS[s]?.(ctx)).filter((b): b is Block => Boolean(b))
  );
  homeBlocks.push(buildFooter(facts, uniquePages));

  const builtPages: Page[] = [makePage("home", 0, homeBlocks, facts)];

  uniquePages
    .filter((p) => p !== "home")
    .forEach((p, i) => {
      const sectionKey = (Object.entries(SECTION_TO_PAGE).find(
        ([, page]) => page === p
      )?.[0] ?? null) as SectionKey | null;

      const builder = sectionKey ? SECTION_BUILDERS[sectionKey] : undefined;
      const blocks = keepValid(builder ? [builder(ctx)] : []);
      blocks.push(buildFooter(facts, uniquePages));
      builtPages.push(makePage(p, i + 1, blocks, facts));
    });

  const slug = slugify(
    facts.acronym || facts.name,
    `conference-${randomUUID().slice(0, 6)}`
  );

  return SiteSchema.parse({
    id: randomUUID(),
    slug,
    version: 1,
    meta: facts,
    theme,
    nav: uniquePages
      .filter((p) => p !== "home")
      .map((p) => ({ label: PAGE_TITLES[p], href: PAGE_SLUGS[p] })),
    pages: builtPages,
    settings: {
      domain: { slug, customDomain: null, domainStatus: "none" },
      seo: {
        title: facts.name || template.label,
        description: facts.tagline || template.copy.heroTagline,
      },
      socialLinks: [],
    },
  });
}

/**
 * Same as compose(), but asks the model to rewrite the prose first.
 * Falls back to template copy on any failure.
 */
export async function composeWithAI(
  input: WizardInput
): Promise<{ site: Site; copySource: "ai" | "template" }> {
  const facts = factsFromWizard(input);
  const template = templateFor(input.conferenceType);

  const { copy, source } = await rewriteCopy(facts, template, input.templateId);

  return { site: compose(input, copy), copySource: source };
}

/**
 * Door B: build a site from extracted brochure facts.
 * Content comes from the document; look and structure from the chosen template.
 */
export function composeFromFacts(
  facts: ConferenceFacts,
  choices: Partial<WizardInput> = {}
): Site {
  const input = WizardInputSchema.parse({
    conferenceType: facts.type,
    name: facts.name,
    acronym: facts.acronym,
    theme: facts.tagline,
    organizer: facts.organizer,
    startDate: facts.startDate,
    endDate: facts.endDate,
    venueName: facts.venue.name,
    city: facts.venue.city,
    country: facts.venue.country,
    conferenceLogo: facts.logo,
    heroImage: facts.banner,
    submissionUrl: facts.submission.url,
    email: facts.contact.email,
    phone: facts.contact.phone,
    deadlines: facts.deadlines,
    templateId: choices.templateId ?? "academic-classic",
    fontPairId: choices.fontPairId ?? "modern",
    sections: choices.sections ?? undefined,
  });

  // compose() builds the shell; then swap in the richer extracted facts
  // (committee, speakers, fees) that the wizard path cannot supply.
  const site = compose(input);

  return SiteSchema.parse({
    ...site,
    meta: facts,
    pages: site.pages.map((page) =>
      page.slug === "/"
        ? {
            ...page,
            layout: {
              ...page.layout,
              content: rebuildWithFacts(page.layout.content, facts, input),
            },
          }
        : page
    ),
  });
}

function rebuildWithFacts(
  blocks: Block[],
  facts: ConferenceFacts,
  input: WizardInput
): Block[] {
  const template = templateFor(facts.type);
  const ctx: BuildContext = {
    facts,
    template,
    dateLine: formatDateRange(facts.startDate, facts.endDate),
    venueLine: [facts.venue.city, facts.venue.country].filter(Boolean).join(", "),
    registrationUrl: input.registrationUrl,
  };

  const BLOCK_TO_SECTION: Record<string, SectionKey> = {
    Hero: "hero",
    AboutSection: "about",
    ImportantDates: "important-dates",
    SpeakerGrid: "speakers",
    RegistrationFees: "registration",
  };

  return blocks.map((block) => {
    if (block.type === "Footer") {
      return buildFooter(facts, ["home", "about", "speakers", "registration", "contact"]);
    }
    const key = BLOCK_TO_SECTION[block.type];
    const builder = key ? SECTION_BUILDERS[key] : undefined;
    return builder ? builder(ctx) : block;
  });
}