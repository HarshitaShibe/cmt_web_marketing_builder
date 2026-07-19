import type { Config } from "@measured/puck";
import type { ZodTypeAny } from "zod";

import { HeroConfig, Hero } from "@/components/blocks/hero";
import { HeroSchema } from "@/components/blocks/hero.schema";
import {
  AboutSectionConfig,
  AboutSectionSchema,
  AboutSection,
} from "@/components/blocks/about-section";
import {
  ImportantDatesConfig,
  ImportantDatesSchema,
  ImportantDates,
} from "@/components/blocks/important-dates";
import {
  SpeakerGridConfig,
  SpeakerGridSchema,
  SpeakerGrid,
} from "@/components/blocks/speaker-grid";
import {
  RegistrationFeesConfig,
  RegistrationFeesSchema,
  RegistrationFees,
} from "@/components/blocks/registration-fees";
import { FooterConfig, FooterSchema, Footer } from "@/components/blocks/footer";

import type { BlockType } from "@/lib/schema";

export const blockSchemas: Record<BlockType, ZodTypeAny> = {
  Hero: HeroSchema,
  AboutSection: AboutSectionSchema,
  ImportantDates: ImportantDatesSchema,
  SpeakerGrid: SpeakerGridSchema,
  RegistrationFees: RegistrationFeesSchema,
  Footer: FooterSchema,
};

export const blockComponents = {
  Hero,
  AboutSection,
  ImportantDates,
  SpeakerGrid,
  RegistrationFees,
  Footer,
} as const;

export const puckConfig: Config = {
  components: {
    Hero: HeroConfig,
    AboutSection: AboutSectionConfig,
    ImportantDates: ImportantDatesConfig,
    SpeakerGrid: SpeakerGridConfig,
    RegistrationFees: RegistrationFeesConfig,
    Footer: FooterConfig,
  },
  categories: {
    header: { title: "Header", components: ["Hero"] },
    content: {
      title: "Content",
      components: ["AboutSection", "ImportantDates", "SpeakerGrid", "RegistrationFees"],
    },
    footer: { title: "Footer", components: ["Footer"] },
  },
} as Config;

export function validateBlock(type: BlockType, props: unknown) {
  const schema = blockSchemas[type];

  if (!schema || typeof schema.safeParse !== "function") {
    return {
      ok: false as const,
      error: `No usable schema for block "${type}". If its component is a client component, move the schema into a separate non-client file.`,
    };
  }

  const result = schema.safeParse(props);
  return result.success
    ? { ok: true as const, props: result.data }
    : { ok: false as const, error: result.error.message };
}

export function defaultPropsFor(type: BlockType) {
  return puckConfig.components[type]?.defaultProps ?? { id: type.toLowerCase() };
}