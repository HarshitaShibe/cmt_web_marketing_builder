import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

/** PNG only — keeps logos crisp and transparency intact. */
export const ALLOWED_TYPES = ["image/png"] as const;

export const MAX_BYTES = 5 * 1024 * 1024;

export type StoredFile = { url: string; name: string; size: number };

function extensionFor(type: string, fallback: string) {
  const map: Record<string, string> = { "image/png": "png" };
  return map[type] ?? fallback;
}

export async function saveFile(file: File): Promise<StoredFile> {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error("Please upload a PNG image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is larger than 5 MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionFor(file.type, file.name.split(".").pop() ?? "bin");
  const filename = `${randomUUID()}.${ext}`;

  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);

  return {
    url: `/uploads/${filename}`,
    name: file.name,
    size: file.size,
  };
}