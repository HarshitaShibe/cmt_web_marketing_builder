import mammoth from "mammoth";

export const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export const MAX_DOC_BYTES = 15 * 1024 * 1024;

export type ExtractedDoc = {
  text: string;
  pages: number;
  chars: number;
  source: "pdf" | "docx" | "txt" | "url";
  warning?: string;
};

/** Collapses whitespace and drops repeated page furniture. */
function clean(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}

async function fromPDF(buffer: Buffer): Promise<ExtractedDoc> {
  const { extractText, getDocumentProxy } = await import("unpdf");

  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  const merged = clean(Array.isArray(text) ? text.join("\n") : text);

  return {
    text: merged,
    pages: totalPages,
    chars: merged.length,
    source: "pdf",
    warning:
      merged.length < 200
        ? "Very little text found. This PDF may be scanned images rather than text."
        : undefined,
  };
}

async function fromDOCX(buffer: Buffer): Promise<ExtractedDoc> {
  const { value } = await mammoth.extractRawText({ buffer });
  const text = clean(value);

  return {
    text,
    pages: 1,
    chars: text.length,
    source: "docx",
    warning: text.length < 200 ? "Very little text found in this document." : undefined,
  };
}

export async function extractDocument(file: File): Promise<ExtractedDoc> {
  if (file.size > MAX_DOC_BYTES) {
    throw new Error("File is larger than 15 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return fromPDF(buffer);
  }

  if (name.endsWith(".docx")) {
    return fromDOCX(buffer);
  }

  if (file.type === "text/plain" || name.endsWith(".txt")) {
    const text = clean(buffer.toString("utf8"));
    return { text, pages: 1, chars: text.length, source: "txt" };
  }

  throw new Error("Upload a PDF, DOCX, or TXT file.");
}

/** Keeps prompts bounded. Brochures front-load the useful details. */
export function truncateForModel(text: string, maxChars = 24000): string {
  if (text.length <= maxChars) return text;
  const head = text.slice(0, Math.floor(maxChars * 0.75));
  const tail = text.slice(-Math.floor(maxChars * 0.25));
  return `${head}\n\n[…document truncated…]\n\n${tail}`;
}