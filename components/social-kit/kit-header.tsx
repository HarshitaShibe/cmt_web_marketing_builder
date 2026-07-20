import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

export function KitHeader({ siteId, siteName }: { siteId: string; siteName: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-3.5 sm:px-10">
      <Link
        href={`/editor/${siteId}`}
        className="flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Editor
      </Link>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
        {siteName} · Social Media Kit
      </span>
    </div>
  );
}