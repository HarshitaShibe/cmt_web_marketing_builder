import type { ExtractedDoc } from "@/lib/extract/pdf";

const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

/** Pulls title and meta descriptions, which often carry the key details. */
function extractMeta(html: string): string {
  const parts: string[] = [];

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (title) parts.push(title.trim());

  const metaPatterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i,
  ];

  for (const pattern of metaPatterns) {
    const value = html.match(pattern)?.[1];
    if (value && !parts.includes(value.trim())) parts.push(value.trim());
  }

  return parts.join("\n");
}

/** Strips scripts, styles, and markup, leaving readable text. */
function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|br|td)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    throw new Error("That doesn't look like a valid web address.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https addresses are supported.");
  }

  const host = url.hostname.toLowerCase();
  if (
    BLOCKED_HOSTS.includes(host) ||
    host.endsWith(".local") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host)
  ) {
    throw new Error("That address can't be fetched.");
  }

  return url;
}

export async function extractFromUrl(rawUrl: string): Promise<ExtractedDoc> {
  const url = assertSafeUrl(rawUrl);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ConferenceSiteBuilder/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      throw new Error(`The page returned ${res.status}. Check the address and try again.`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html") && !contentType.includes("text")) {
      throw new Error("That address isn't a web page. Upload the file directly instead.");
    }

    const html = await res.text();
    const meta = extractMeta(html);
    const body = htmlToText(html);
    const text = [meta, body].filter(Boolean).join("\n\n");

    return {
      text,
      pages: 1,
      chars: text.length,
      source: "url",
      warning:
        text.length < 400
          ? "Very little text found. The site may load its content with JavaScript."
          : undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("That page took too long to respond.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}