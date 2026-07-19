import { db } from "./lib/db";
import { sites } from "./lib/db/schema";
import { demoSite } from "./lib/demo/demo-site";

async function main() {
  const [row] = await db
    .insert(sites)
    .values({
      slug: demoSite.slug,
      name: demoSite.meta.name,
      draftLayout: demoSite,
    })
    .returning();

  console.log("Seeded site id:", row.id);
  console.log("Editor: /editor/" + row.id);
  process.exit(0);
}

main();