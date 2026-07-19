import { getSiteBySlug, getSiteByDomain } from "@/lib/db/queries";
import type { SiteRow } from "@/lib/db/schema";

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "editor", "wizard", "import",
  "theme", "dashboard", "login", "signup", "settings", "help", "docs",
]);

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

/** Strips port and www, lowercases. */
export function normalizeHost(host: string) {
  return host.split(":")[0].toLowerCase().replace(/^www\./, "");
}

/**
 * Resolves an incoming request to a site.
 * Order: custom domain → subdomain → path slug.
 */
export async function resolveTenant(
  host: string,
  pathSlug?: string
): Promise<SiteRow | null> {
  const clean = normalizeHost(host);
  const root = normalizeHost(ROOT_DOMAIN);

  // Custom domain (icai2027.org)
  if (clean !== root && !clean.endsWith(`.${root}`) && !clean.startsWith("localhost")) {
    return getSiteByDomain(clean);
  }

  // Subdomain (icai2027.conference.greenbit.ai)
  if (clean.endsWith(`.${root}`)) {
    const sub = clean.replace(`.${root}`, "");
    if (!isReservedSlug(sub)) return getSiteBySlug(sub);
  }

  // Path slug (/icai2027)
  if (pathSlug && !isReservedSlug(pathSlug)) {
    return getSiteBySlug(pathSlug);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Cloudflare for SaaS — provisions SSL for a customer's own domain.
// ---------------------------------------------------------------------------

const CF_API = "https://api.cloudflare.com/client/v4";

type CFResult = {
  ok: boolean;
  status?: "pending" | "verified" | "failed";
  records?: { type: string; name: string; value: string }[];
  error?: string;
};

function cfConfigured() {
  return Boolean(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID);
}

/** Registers a custom hostname so Cloudflare issues a certificate for it. */
export async function provisionDomain(domain: string): Promise<CFResult> {
  if (!cfConfigured()) {
    return {
      ok: false,
      error: "Custom domains aren't configured on this deployment yet.",
    };
  }

  const clean = normalizeHost(domain);

  try {
    const res = await fetch(
      `${CF_API}/zones/${process.env.CLOUDFLARE_ZONE_ID}/custom_hostnames`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify({
          hostname: clean,
          ssl: {
            method: "http",
            type: "dv",
            settings: { min_tls_version: "1.2" },
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        ok: false,
        error: data.errors?.[0]?.message ?? "Cloudflare rejected that domain.",
      };
    }

    return {
      ok: true,
      status: "pending",
      records: [
        {
          type: "CNAME",
          name: clean,
          value: `${normalizeHost(ROOT_DOMAIN)}`,
        },
      ],
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not reach Cloudflare.",
    };
  }
}

/** Checks whether the certificate has been issued and DNS points at us. */
export async function checkDomain(domain: string): Promise<CFResult> {
  if (!cfConfigured()) {
    return { ok: false, error: "Custom domains aren't configured yet." };
  }

  const clean = normalizeHost(domain);

  try {
    const res = await fetch(
      `${CF_API}/zones/${process.env.CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${clean}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    const data = await res.json();
    const record = data.result?.[0];

    if (!record) return { ok: false, error: "That domain hasn't been added yet." };

    const sslStatus = record.ssl?.status;
    const verified = record.status === "active" && sslStatus === "active";

    return {
      ok: true,
      status: verified ? "verified" : sslStatus === "failed" ? "failed" : "pending",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not reach Cloudflare.",
    };
  }
}