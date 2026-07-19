import postgres from "postgres";
import { readFileSync } from "node:fs";

const url = readFileSync(".env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1];
const sql = postgres(url);

const rows = await sql`
  select slug, name, published_at, created_at
  from sites
  order by created_at desc
  limit 10
`;

for (const r of rows) {
  console.log(
    `${r.published_at ? "LIVE " : "draft"}  /${r.slug.padEnd(28)} ${r.name.slice(0, 40)}`
  );
}

await sql.end();


// clear-sites.mjs
import postgres from "postgres";
import { readFileSync } from "node:fs";
const url = readFileSync(".env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1];
const sql = postgres(url);
await sql`delete from sites`;
console.log("cleared");
await sql.end();