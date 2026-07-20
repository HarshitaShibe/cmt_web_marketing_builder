import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Site } from "@/lib/schema";
import type { SocialKitConfig, KitVariation } from "@/lib/schema";

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    slug: text("slug").notNull(),
    customDomain: text("custom_domain"),
    domainStatus: text("domain_status").notNull().default("none"),

    name: text("name").notNull().default(""),

    draftLayout: jsonb("draft_layout").$type<Site>().notNull(),
    publishedLayout: jsonb("published_layout").$type<Site>(),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("sites_slug_idx").on(table.slug),
    uniqueIndex("sites_custom_domain_idx").on(table.customDomain),
    index("sites_published_idx").on(table.publishedAt),
  ]
);

export const siteVersions = pgTable(
  "site_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    layout: jsonb("layout").$type<Site>().notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("site_versions_site_idx").on(table.siteId)]
);

export const socialKits = pgTable(
  "social_kits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),

    config: jsonb("config").$type<SocialKitConfig>().notNull(),
    variations: jsonb("variations").$type<KitVariation[]>().notNull().default([]),
    selectedVariationId: text("selected_variation_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("social_kits_site_idx").on(table.siteId)]
);

export type SiteRow = typeof sites.$inferSelect;
export type NewSiteRow = typeof sites.$inferInsert;
export type SocialKitRow = typeof socialKits.$inferSelect;
export type NewSocialKitRow = typeof socialKits.$inferInsert;