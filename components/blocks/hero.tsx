"use client";

import { useEffect, useState } from "react";
import type { ComponentConfig } from "@measured/puck";
import { HeroSchema, type HeroProps } from "./hero.schema";

export { HeroSchema, type HeroProps } from "./hero.schema";

const OVERLAY: Record<HeroProps["overlayStrength"], [number, number]> = {
  light: [0.55, 0.75],
  medium: [0.78, 0.9],
  strong: [0.9, 0.97],
};

function useCountdown(target: string) {
  const [parts, setParts] = useState<{ d: number; h: number; m: number; s: number } | null>(
    null
  );

  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    if (Number.isNaN(end)) return;

    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) return setParts({ d: 0, h: 0, m: 0, s: 0 });
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return parts;
}

export function Hero(props: Partial<HeroProps> & { id: string }) {
  // Sites saved under an earlier schema won't have every field, so each one
  // falls back rather than throwing.
  const {
    acronym = "",
    heading = "",
    tagline = "",
    dateLine = "",
    venueLine = "",
    ctaLabel = "",
    ctaHref = "#registration",
    secondaryLabel = "",
    secondaryHref = "",
    backgroundImage = "",
    overlayStrength = "medium",
    conferenceLogo = "",
    organizationLogo = "",
    sponsorLogos = [],
    showCountdown = false,
    countdownTo = "",
    align = "left",
  } = props;

  const countdown = useCountdown(countdownTo);
  const [from, to] = OVERLAY[overlayStrength] ?? OVERLAY.medium;
  const centered = align === "center";

  return (
    <section
      style={{
        background: "var(--conf-bg)",
        color: "var(--conf-fg)",
        fontFamily: "var(--conf-font-body)",
      }}
      className="relative w-full overflow-hidden"
    >
      {backgroundImage ? (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, var(--conf-bg) ${from * 100}%, transparent), color-mix(in srgb, var(--conf-bg) ${to * 100}%, transparent)), url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-8 md:pb-24 md:pt-10">
        {/* Institution bar */}
        {conferenceLogo || organizationLogo ? (
          <div
            style={{ borderColor: "var(--conf-border)" }}
            className={`flex items-center gap-6 border-b pb-6 ${centered ? "justify-center" : "justify-between"}`}
          >
            {organizationLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organizationLogo}
                alt="Organising institution"
                className="h-12 w-auto object-contain md:h-14"
              />
            ) : (
              <span />
            )}
            {conferenceLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conferenceLogo}
                alt="Conference logo"
                className="h-12 w-auto object-contain md:h-16"
              />
            ) : null}
          </div>
        ) : null}

        <div
          className={`pt-14 md:pt-20 ${centered ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}`}
        >
          {acronym ? (
            <p
              style={{ color: "var(--conf-primary)" }}
              className="animate-reveal text-xs font-semibold uppercase tracking-[0.28em] md:text-sm"
            >
              {acronym}
            </p>
          ) : null}

          <h1
            style={{ fontFamily: "var(--conf-font-heading)" }}
            className="animate-reveal animate-delay-1 mt-5 text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.02em] md:text-6xl lg:text-7xl"
          >
            {heading}
          </h1>

          {tagline ? (
            <p
              style={{ color: "var(--conf-muted-fg)" }}
              className={`animate-reveal animate-delay-2 mt-6 text-lg leading-relaxed md:text-xl ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
            >
              {tagline}
            </p>
          ) : null}

          {dateLine || venueLine ? (
            <dl
              style={{ borderColor: "var(--conf-border)" }}
              className={`animate-reveal animate-delay-3 mt-10 flex flex-wrap gap-x-14 gap-y-5 border-t pt-7 ${centered ? "justify-center" : ""}`}
            >
              {dateLine ? (
                <div>
                  <dt
                    style={{ color: "var(--conf-muted-fg)" }}
                    className="text-[11px] font-medium uppercase tracking-[0.16em]"
                  >
                    Dates
                  </dt>
                  <dd
                    style={{ fontFamily: "var(--conf-font-heading)" }}
                    className="mt-1.5 text-lg font-medium"
                  >
                    {dateLine}
                  </dd>
                </div>
              ) : null}
              {venueLine ? (
                <div>
                  <dt
                    style={{ color: "var(--conf-muted-fg)" }}
                    className="text-[11px] font-medium uppercase tracking-[0.16em]"
                  >
                    Venue
                  </dt>
                  <dd
                    style={{ fontFamily: "var(--conf-font-heading)" }}
                    className="mt-1.5 text-lg font-medium"
                  >
                    {venueLine}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {showCountdown && countdown ? (
            <div
              className={`animate-reveal animate-delay-4 mt-9 flex gap-3 ${centered ? "justify-center" : ""}`}
            >
              {[
                { v: countdown.d, l: "Days" },
                { v: countdown.h, l: "Hours" },
                { v: countdown.m, l: "Minutes" },
                { v: countdown.s, l: "Seconds" },
              ].map((unit) => (
                <div
                  key={unit.l}
                  style={{
                    background: "var(--conf-muted)",
                    borderColor: "var(--conf-border)",
                    borderRadius: "var(--conf-radius)",
                  }}
                  className="min-w-[74px] border px-3 py-3 text-center"
                >
                  <p
                    style={{ fontFamily: "var(--conf-font-heading)", color: "var(--conf-primary)" }}
                    className="text-2xl font-semibold tabular-nums md:text-3xl"
                  >
                    {String(unit.v).padStart(2, "0")}
                  </p>
                  <p
                    style={{ color: "var(--conf-muted-fg)" }}
                    className="mt-1 text-[10px] uppercase tracking-[0.14em]"
                  >
                    {unit.l}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <div className={`animate-reveal animate-delay-5 mt-11 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
            {ctaLabel ? (
              <a
                href={ctaHref}
                style={{
                  background: "var(--conf-primary)",
                  color: "var(--conf-primary-fg)",
                  borderRadius: "var(--conf-radius)",
                }}
                className="inline-flex items-center px-8 py-3.5 text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {ctaLabel}
              </a>
            ) : null}
            {secondaryLabel ? (
              <a
                href={secondaryHref}
                style={{
                  borderColor: "var(--conf-primary)",
                  color: "var(--conf-primary)",
                  borderRadius: "var(--conf-radius)",
                }}
                className="inline-flex items-center border px-8 py-3.5 text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        </div>

        {sponsorLogos.length > 0 ? (
          <div
            style={{ borderColor: "var(--conf-border)" }}
            className="mt-16 border-t pt-7 md:mt-20"
          >
            <p
              style={{ color: "var(--conf-muted-fg)" }}
              className={`text-[10px] font-medium uppercase tracking-[0.2em] ${centered ? "text-center" : ""}`}
            >
              In association with
            </p>
            <div
              className={`mt-5 flex flex-wrap items-center gap-x-10 gap-y-5 ${centered ? "justify-center" : ""}`}
            >
              {sponsorLogos.map((logo, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={logo.url}
                  alt={logo.alt}
                  className="h-9 w-auto object-contain opacity-70 transition-opacity hover:opacity-100 md:h-11"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export const HeroConfig: ComponentConfig<HeroProps> = {
  label: "Hero",
  fields: {
    id: { type: "text" },
    acronym: { type: "text", label: "Acronym" },
    heading: { type: "text", label: "Conference name" },
    tagline: { type: "textarea", label: "Theme or tagline" },
    dateLine: { type: "text", label: "Dates" },
    venueLine: { type: "text", label: "Venue" },
    align: {
      type: "radio",
      label: "Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Centred", value: "center" },
      ],
    },
    ctaLabel: { type: "text", label: "Primary button" },
    ctaHref: { type: "text", label: "Primary link" },
    secondaryLabel: { type: "text", label: "Secondary button" },
    secondaryHref: { type: "text", label: "Secondary link" },
    showCountdown: {
      type: "radio",
      label: "Countdown",
      options: [
        { label: "Show", value: true },
        { label: "Hide", value: false },
      ],
    },
    countdownTo: { type: "text", label: "Counting down to (YYYY-MM-DD)" },
    conferenceLogo: { type: "text", label: "Conference logo URL" },
    organizationLogo: { type: "text", label: "Organisation logo URL" },
    backgroundImage: { type: "text", label: "Background image URL" },
    overlayStrength: {
      type: "select",
      label: "Image overlay",
      options: [
        { label: "Light — image most visible", value: "light" },
        { label: "Medium", value: "medium" },
        { label: "Strong — text most readable", value: "strong" },
      ],
    },
    sponsorLogos: {
      type: "array",
      label: "Sponsor logos",
      arrayFields: {
        url: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Name" },
      },
      getItemSummary: (item) => item.alt || "Sponsor",
    },
  },
  defaultProps: {
    id: "hero",
    acronym: "",
    heading: "Conference name",
    tagline: "",
    dateLine: "",
    venueLine: "",
    ctaLabel: "Register",
    ctaHref: "#registration",
    secondaryLabel: "",
    secondaryHref: "",
    backgroundImage: "",
    overlayStrength: "medium",
    conferenceLogo: "",
    organizationLogo: "",
    sponsorLogos: [],
    showCountdown: true,
    countdownTo: "",
    align: "left",
  },
  render: Hero,
};