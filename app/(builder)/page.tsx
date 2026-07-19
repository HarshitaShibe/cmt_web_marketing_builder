import Link from "next/link";

export const metadata = {
  title: "Create a conference website",
};

export default function StartPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-4xl">
        <header className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Conference websites
          </p>
          <h1 className="mt-3 text-4xl font-medium leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
            Build your conference website in minutes
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-500">
            Start from a brochure you already have, or answer eight quick
            questions. Either way you get a complete site you can edit and
            publish.
          </p>
        </header>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <DoorCard
            href="/import"
            eyebrow="Fastest"
            title="I have a brochure"
            description="Upload your PDF, Word document, or paste a link to last year's site. We read the dates, committee, fees, and topics, then build the site around them."
            meta="PDF · DOCX · Website link"
          />

          <DoorCard
            href="/wizard"
            eyebrow="No files needed"
            title="Start from scratch"
            description="Answer eight questions — all taps, no typing required. Pick your conference type, colours, and pages, and we'll fill in the rest."
            meta="About 2 minutes"
          />
        </div>

        <p className="mt-10 text-sm text-neutral-400">
          Not sure? Start from scratch — you can always add your brochure
          details later in the editor.
        </p>
      </div>
    </main>
  );
}

function DoorCard({
  href,
  eyebrow,
  title,
  description,
  meta,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-neutral-200 p-7 transition-all hover:border-neutral-900 hover:shadow-sm"
    >
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
        {eyebrow}
      </span>

      <h2 className="mt-3 text-xl font-medium tracking-tight text-neutral-900">
        {title}
      </h2>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
        <span className="text-xs text-neutral-400">{meta}</span>
        <span
          aria-hidden
          className="text-sm text-neutral-900 transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}