import { createElement, forwardRef, memo } from "react";
import type { CSSProperties, ReactNode } from "react";
import * as LucideIcons from "lucide-react";
import { CircleIcon } from "lucide-react";
import type {
  DesignDocument,
  DesignElement,
  TextElement,
  ImageElement,
  LogoElement,
  ShapeElement,
  ButtonElement,
  IconElement,
} from "@/lib/schema";

/**
 * DesignDocument -> SVG. This is the Phase 2 static renderer: it proves the
 * new freeform element model can be rendered, but has no selection, drag,
 * resize, or editing behaviour. It lives alongside TemplateCanvas (which
 * keeps rendering the existing Editorial/Bold/Split archetypes from
 * fields/style/layout) — nothing here replaces that yet.
 *
 * Reuses TemplateCanvas's own pattern: one outer <svg viewBox>, HTML content
 * placed via <foreignObject> so flexbox/text-wrap/object-fit work without
 * hand-computed SVG geometry. Pure-vector element types (shape, icon) are
 * rendered as plain SVG instead, since they don't need HTML layout.
 */

function pascalCase(name: string) {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}

/**
 * `<div xmlns="...">` inside a <foreignObject> is required for the HTML
 * content to render (same convention TemplateCanvas already uses at
 * template-canvas.tsx:468) — but the DOM typings for a plain JSX <div> don't
 * know about the `xmlns` attribute, so we go through `createElement` with a
 * loosely-typed props bag instead of fighting the JSX intrinsic types.
 */
function XhtmlDiv({ style, children }: { style?: CSSProperties; children?: ReactNode }) {
  const props: Record<string, unknown> = { xmlns: "http://www.w3.org/1999/xhtml", style };
  return createElement("div", props, children);
}

/** Every element is positioned/rotated/faded the same way regardless of type — wraps children in a <g> at (x,y), rotating around the element's own center. */
function ElementFrame({
  element,
  children,
}: {
  element: DesignElement;
  children: React.ReactNode;
}) {
  if (!element.visible) return null;
  const cx = element.width / 2;
  const cy = element.height / 2;
  const transform = `translate(${element.x} ${element.y}) rotate(${element.rotation} ${cx} ${cy})`;
  return (
    <g transform={transform} opacity={element.opacity}>
      {children}
    </g>
  );
}

function TextNode({ element }: { element: TextElement }) {
  const style: CSSProperties = {
    width: element.width,
    height: element.height,
    fontFamily: element.fontFamily,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    lineHeight: element.lineHeight,
    letterSpacing: element.letterSpacing,
    color: element.color,
    textAlign: element.textAlign,
    display: "flex",
    alignItems: "flex-start",
    justifyContent:
      element.textAlign === "center" ? "center" : element.textAlign === "right" ? "flex-end" : "flex-start",
    overflow: "hidden",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  };
  return (
    <foreignObject x={0} y={0} width={element.width} height={element.height}>
      <XhtmlDiv style={style}>{element.content}</XhtmlDiv>
    </foreignObject>
  );
}

function ImageNode({ element }: { element: ImageElement | LogoElement }) {
  const radius = element.radius;
  if (!element.src) {
    // Placeholder frame so empty image/logo slots (e.g. on a blank canvas
    // or a template before the user picks an asset) are still visible and
    // selectable-looking, matching Canva's "drop an image here" affordance.
    return (
      <foreignObject x={0} y={0} width={element.width} height={element.height}>
        <XhtmlDiv
          style={{
            width: element.width,
            height: element.height,
            borderRadius: radius,
            border: "1.5px dashed rgba(0,0,0,0.25)",
            background: "rgba(0,0,0,0.04)",
            boxSizing: "border-box",
          }}
        />
      </foreignObject>
    );
  }
  return (
    <foreignObject x={0} y={0} width={element.width} height={element.height}>
      <XhtmlDiv
        style={{
          width: element.width,
          height: element.height,
          borderRadius: radius,
          overflow: "hidden",
          background: element.type === "logo" ? element.background ?? "transparent" : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={element.src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: element.fit, objectPosition: element.position }}
        />
      </XhtmlDiv>
    </foreignObject>
  );
}

function ShapeNode({ element }: { element: ShapeElement }) {
  const strokeProps = element.strokeWidth > 0 ? { stroke: element.stroke, strokeWidth: element.strokeWidth } : {};
  if (element.shape === "ellipse") {
    return (
      <ellipse
        cx={element.width / 2}
        cy={element.height / 2}
        rx={element.width / 2}
        ry={element.height / 2}
        fill={element.fill}
        {...strokeProps}
      />
    );
  }
  if (element.shape === "line") {
    return (
      <line
        x1={0}
        y1={element.height / 2}
        x2={element.width}
        y2={element.height / 2}
        stroke={element.stroke ?? element.fill}
        strokeWidth={element.strokeWidth || 2}
      />
    );
  }
  return (
    <rect
      x={0}
      y={0}
      width={element.width}
      height={element.height}
      rx={element.radius}
      ry={element.radius}
      fill={element.fill}
      {...strokeProps}
    />
  );
}

function ButtonNode({ element }: { element: ButtonElement }) {
  return (
    <foreignObject x={0} y={0} width={element.width} height={element.height}>
      <XhtmlDiv
        style={{
          width: element.width,
          height: element.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: element.backgroundColor,
          color: element.textColor,
          borderRadius: element.radius,
          fontWeight: element.fontWeight,
          fontSize: element.fontSize,
          boxSizing: "border-box",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {element.label}
      </XhtmlDiv>
    </foreignObject>
  );
}

function IconNode({ element }: { element: IconElement }) {
  const Icon =
    (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>>)[
      pascalCase(element.icon)
    ] ?? CircleIcon;
  return <Icon size={Math.min(element.width, element.height)} color={element.color} strokeWidth={element.strokeWidth} />;
}

function ElementNode({ element }: { element: DesignElement }) {
  switch (element.type) {
    case "text":
      return <TextNode element={element} />;
    case "image":
    case "logo":
      return <ImageNode element={element} />;
    case "shape":
      return <ShapeNode element={element} />;
    case "button":
      return <ButtonNode element={element} />;
    case "icon":
      return <IconNode element={element} />;
    default:
      return null;
  }
}

/**
 * Renders a full DesignDocument. Fills its parent completely (width="100%"
 * height="100%" as SVG attributes, same convention as TemplateCanvas) — the
 * caller gives the parent an exact pixel box, e.g. via fitDimensions().
 */
export const DesignDocumentRenderer = memo(
  forwardRef<SVGSVGElement, { document: DesignDocument; className?: string }>(function DesignDocumentRenderer(
    { document, className },
    ref
  ) {
    const { width, height, background, elements } = document;
    // zIndex is the only stacking signal — sort ascending so higher zIndex
    // paints last (on top), same convention as CSS/most design tools.
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
        className={className}
        role="img"
      >
        <rect x={0} y={0} width={width} height={height} fill={background} />
        {ordered.map((element) => (
          <ElementFrame key={element.id} element={element}>
            <ElementNode element={element} />
          </ElementFrame>
        ))}
      </svg>
    );
  })
);

DesignDocumentRenderer.displayName = "DesignDocumentRenderer";
