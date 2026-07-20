import postgres from "postgres";
import { readFileSync } from "node:fs";

const url = readFileSync(".env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1];
const sql = postgres(url);

await sql`delete from sites`;

console.log("cleared");

await sql.end();