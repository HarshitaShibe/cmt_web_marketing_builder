import { forwardRef, memo, useMemo } from "react";
import type { CSSProperties } from "react";
import {
  PLATFORM_DIMENSIONS,
  RADIUS_PX,
  HEADLINE_WEIGHT_CSS,
  HEADLINE_SIZE_RATIO,
  LOGO_SIZE_RATIO,
  PADDING_RATIO,
} from "@/lib/social-kit/templates";
import { getFontPair } from "@/lib/theme/presets";
import type { KitFields, KitPlatform, KitStyleOverrides, KitVariation, ThemeTokens } from "@/lib/schema";

function fitFontSize(text: string, base: number, softLimit: number, minRatio = 0.55) {
  if (!text || text.length <= softLimit) return base;
  return base * Math.max(minRatio, softLimit / text.length);
}

function clampBox(lines: number): CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-word",
  };
}

type Colors = ThemeTokens["colors"];

type LayoutProps = {
  width: number;
  height: number;
  colors: Colors;
  fonts: { heading: string; body: string };
  fields: KitFields;
  style: KitStyleOverrides;
  pad: number;
  radius: number;
  logoSize: number;
  headlineSize: number;
};

function Logo({
  url,
  size,
  radius,
  fit,
  position,
}: {
  url?: string;
  size: number;
  radius: number;
  fit: KitStyleOverrides["imageFit"];
  position: KitStyleOverrides["imagePosition"];
}) {
  if (!url) return null;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        background: "rgba(255,255,255,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: position }}
      />
    </div>
  );
}

function CtaButton({
  label,
  bg,
  fg,
  radius,
  fontSize,
}: {
  label: string;
  bg: string;
  fg: string;
  radius: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: fg,
        borderRadius: radius,
        padding: `${fontSize * 0.7}px ${fontSize * 1.6}px`,
        fontWeight: 600,
        fontSize,
        boxShadow: `0 ${fontSize * 0.5}px ${fontSize * 1.2}px -${fontSize * 0.3}px ${bg}77`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

/** Clean, left-aligned editorial poster — accent bar, soft corner blob, divider footer. */
function EditorialLayout({ width, colors, fonts, fields, style, pad, radius, logoSize, headlineSize }: LayoutProps) {
  const centered = style.textAlign === "center";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: colors.background, overflow: "hidden", fontFamily: fonts.body }}>
      {style.overlay ? (
        <div
          style={{
            position: "absolute",
            right: -width * 0.18,
            top: -width * 0.18,
            width: width * 0.55,
            height: width * 0.55,
            borderRadius: "50%",
            background: colors.accent,
            opacity: 0.6,
          }}
        />
      ) : null}
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: pad * 0.18, background: colors.primary }} />

      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: pad,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo url={fields.image?.url} size={logoSize} radius={radius} fit={style.imageFit} position={style.imagePosition} />
          {fields.dateLine ? (
            <div
              style={{
                background: colors.accent,
                color: colors.primary,
                borderRadius: 999,
                padding: `${headlineSize * 0.16}px ${headlineSize * 0.42}px`,
                fontSize: headlineSize * 0.22,
                fontWeight: 600,
              }}
            >
              {fields.dateLine}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: centered ? "column" : "row",
            alignItems: centered ? "center" : "flex-start",
            textAlign: style.textAlign,
            gap: pad * 0.4,
          }}
        >
          {!centered ? (
            <div style={{ width: 5, alignSelf: "stretch", background: colors.primary, borderRadius: 3, minHeight: headlineSize * 2.2 }} />
          ) : null}
          <div style={{ width: centered ? "100%" : undefined, flex: centered ? undefined : 1 }}>
            <div
              style={{
                fontFamily: fonts.heading,
                fontWeight: HEADLINE_WEIGHT_CSS[style.headlineWeight],
                fontSize: headlineSize,
                lineHeight: 1.1,
                color: colors.foreground,
                ...clampBox(2),
              }}
            >
              {fields.headline}
            </div>
            {fields.subheading ? (
              <div
                style={{
                  marginTop: headlineSize * 0.3,
                  fontSize: headlineSize * 0.32,
                  lineHeight: 1.4,
                  color: colors.mutedForeground,
                  ...clampBox(2),
                }}
              >
                {fields.subheading}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${colors.border}`, paddingTop: pad * 0.4 }}>
          <div
            style={{
              fontSize: headlineSize * 0.24,
              color: colors.foreground,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "58%",
            }}
          >
            {fields.venueLine}
          </div>
          {style.ctaVisible ? (
            <CtaButton label={fields.ctaLabel} bg={colors.primary} fg={colors.primaryForeground} radius={radius} fontSize={headlineSize * 0.26} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Centered hero with a soft radial glow — built for bold/dark, high-impact posts. */
function BoldLayout({ width, colors, fonts, fields, style, pad, radius, logoSize, headlineSize }: LayoutProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: colors.background, overflow: "hidden", fontFamily: fonts.body }}>
      {style.overlay ? (
        <>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "40%",
              transform: "translate(-50%, -50%)",
              width: width * 0.95,
              height: width * 0.95,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors.primary}55 0%, transparent 70%)`,
            }}
          />
          <div style={{ position: "absolute", left: pad * 0.6, bottom: pad * 0.6, width: headlineSize * 0.5, height: headlineSize * 0.5, borderRadius: "50%", border: `2px solid ${colors.primary}`, opacity: 0.5 }} />
          <div style={{ position: "absolute", right: pad * 0.7, bottom: pad * 1.1, width: headlineSize * 0.26, height: headlineSize * 0.26, background: colors.primary, opacity: 0.5, borderRadius: 6 }} />
        </>
      ) : null}

      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: pad,
          boxSizing: "border-box",
          gap: pad * 0.35,
        }}
      >
        <Logo url={fields.image?.url} size={logoSize} radius={radius} fit={style.imageFit} position={style.imagePosition} />

        {fields.dateLine ? (
          <div
            style={{
              display: "inline-block",
              border: `1px solid ${colors.primary}`,
              color: colors.primary,
              borderRadius: 999,
              padding: `${headlineSize * 0.14}px ${headlineSize * 0.42}px`,
              fontSize: headlineSize * 0.22,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {fields.dateLine}
          </div>
        ) : null}

        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: HEADLINE_WEIGHT_CSS[style.headlineWeight],
            fontSize: headlineSize * 1.05,
            lineHeight: 1.08,
            color: colors.foreground,
            maxWidth: "90%",
            ...clampBox(3),
          }}
        >
          {fields.headline}
        </div>

        {fields.subheading ? (
          <div style={{ fontSize: headlineSize * 0.3, lineHeight: 1.4, color: colors.mutedForeground, maxWidth: "80%", ...clampBox(2) }}>
            {fields.subheading}
          </div>
        ) : null}

        {fields.venueLine ? (
          <div style={{ fontSize: headlineSize * 0.24, color: colors.foreground, opacity: 0.8 }}>{fields.venueLine}</div>
        ) : null}

        {style.ctaVisible ? (
          <div style={{ marginTop: pad * 0.1 }}>
            <CtaButton label={fields.ctaLabel} bg={colors.primary} fg={colors.primaryForeground} radius={radius} fontSize={headlineSize * 0.28} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Diagonal colour block on one side, content on the other — bold, editorial-poster energy. */
function SplitLayout({ colors, fonts, fields, style, pad, radius, logoSize, headlineSize }: LayoutProps) {
  const blockBg = style.overlay ? `linear-gradient(160deg, ${colors.primary}, ${colors.accent})` : colors.primary;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: colors.background, overflow: "hidden", fontFamily: fonts.body, display: "flex" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "42%",
          height: "100%",
          background: blockBg,
          clipPath: "polygon(0 0, 100% 0, 78% 100%, 0% 100%)",
        }}
      />
      <div style={{ position: "relative", width: "36%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: pad, boxSizing: "border-box" }}>
        <Logo url={fields.image?.url} size={logoSize} radius={radius} fit={style.imageFit} position={style.imagePosition} />
        {fields.dateLine ? (
          <div
            style={{
              color: colors.primaryForeground,
              fontSize: headlineSize * 0.22,
              fontWeight: 600,
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              opacity: 0.9,
            }}
          >
            {fields.dateLine}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: pad,
          paddingLeft: pad * 0.6,
          boxSizing: "border-box",
          gap: pad * 0.3,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: HEADLINE_WEIGHT_CSS[style.headlineWeight],
            fontSize: headlineSize,
            lineHeight: 1.1,
            color: colors.foreground,
            ...clampBox(3),
          }}
        >
          {fields.headline}
        </div>
        {fields.subheading ? (
          <div style={{ fontSize: headlineSize * 0.3, lineHeight: 1.4, color: colors.mutedForeground, ...clampBox(2) }}>
            {fields.subheading}
          </div>
        ) : null}
        {fields.venueLine ? (
          <div style={{ fontSize: headlineSize * 0.24, color: colors.foreground, opacity: 0.75 }}>{fields.venueLine}</div>
        ) : null}
        {style.ctaVisible ? (
          <div>
            <CtaButton label={fields.ctaLabel} bg={colors.primary} fg={colors.primaryForeground} radius={radius} fontSize={headlineSize * 0.26} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Renders one variation for one platform. Still the "fixed template, small
 * set of known fields" surface from the UX spec — the layout archetype and
 * every value here come from variation.layout/fields/style, none of it is
 * freeform. Built with one HTML <div> in a <foreignObject> rather than raw
 * SVG shapes, which is what makes gradients, flexbox, and text wrapping
 * possible without hand-computing SVG path geometry.
 */
const FALLBACK_COLORS: Colors = {
  primary: "#171717",
  primaryForeground: "#ffffff",
  background: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#fafafa",
  mutedForeground: "#737373",
  accent: "#f5f5f5",
  border: "#e5e5e5",
};

/**
 * Renders one variation for one platform. Fills its parent completely
 * (width="100%" height="100%" as SVG attributes, no CSS aspect-ratio) — the
 * caller is responsible for giving that parent an exact pixel box via
 * fitDimensions(), which is what removes the layout-resolution ambiguity
 * that caused the preview flicker.
 *
 * Wrapped in memo() so it only re-renders when variation/platform actually
 * change — switching tabs elsewhere in the editor no longer touches this.
 */
export const TemplateCanvas = memo(
  forwardRef<SVGSVGElement, { variation: KitVariation; platform: KitPlatform; className?: string }>(
    function TemplateCanvas({ variation, platform, className }, ref) {
      const { width, height } = PLATFORM_DIMENSIONS[platform];
      const colors = variation.colors ?? FALLBACK_COLORS;
      const fonts = getFontPair(variation.style.fontPairId);

      const layoutProps = useMemo<LayoutProps>(() => {
        const pad = width * PADDING_RATIO[variation.style.padding];
        const radius = RADIUS_PX[variation.style.radius];
        const logoSize = Math.min(width, height) * LOGO_SIZE_RATIO[variation.style.logoSize];
        const headlineSize = fitFontSize(
          variation.fields.headline,
          width * HEADLINE_SIZE_RATIO[variation.style.headlineSize],
          30
        );
        return {
          width,
          height,
          colors,
          fonts,
          fields: variation.fields,
          style: variation.style,
          pad,
          radius,
          logoSize,
          headlineSize,
        };
      }, [width, height, colors, fonts, variation.fields, variation.style]);

      return (
        <svg
          ref={ref}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          style={{ display: "block" }}
          className={className}
          role="img"
          aria-label={`${variation.name} — ${variation.fields.headline}`}
        >
          <foreignObject x={0} y={0} width={width} height={height}>
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width, height }}>
              {variation.layout === "bold" ? (
                <BoldLayout {...layoutProps} />
              ) : variation.layout === "split" ? (
                <SplitLayout {...layoutProps} />
              ) : (
                <EditorialLayout {...layoutProps} />
              )}
            </div>
          </foreignObject>
        </svg>
      );
    }
  )
);

TemplateCanvas.displayName = "TemplateCanvas";