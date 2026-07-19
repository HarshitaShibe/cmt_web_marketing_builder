import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "editor",
  "wizard",
  "dashboard",
]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url = request.nextUrl;

  const isRootDomain =
    host === ROOT_DOMAIN ||
    host === `www.${ROOT_DOMAIN}` ||
    host.startsWith("localhost");

  if (isRootDomain) return NextResponse.next();

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.replace(`.${ROOT_DOMAIN}`, "");
    if (RESERVED.has(sub)) return NextResponse.next();
    return NextResponse.rewrite(new URL(`/${sub}${url.pathname}`, request.url));
  }

  // Anything else is a custom domain; [slug] resolves it against custom_domain.
  return NextResponse.rewrite(new URL(`/${host}${url.pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!api|_next|_static|uploads|favicon.ico).*)"],
};