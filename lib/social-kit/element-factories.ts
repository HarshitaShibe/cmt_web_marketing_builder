import type { DesignDocument, DesignElement } from "@/lib/schema";

function newId() {
  // Client-side only (this module is only imported by "use client" editor
  // components) — the Web Crypto API is available in every evergreen
  // browser, no dependency needed.
  return crypto.randomUUID();
}

/** Places a new element roughly centered on the canvas, with a slight cascade offset so repeated adds don't stack exactly on top of each other. */
function centerOn(doc: DesignDocument, width: number, height: number, offsetIndex = 0): { x: number; y: number } {
  const jitter = (offsetIndex % 6) * 18;
  return {
    x: doc.width / 2 - width / 2 + jitter,
    y: doc.height / 2 - height / 2 + jitter,
  };
}

const BASE = {
  rotation: 0,
  opacity: 1,
  zIndex: 0,
  locked: false,
  visible: true,
};

function nextZIndex(doc: DesignDocument) {
  return doc.elements.reduce((max, el) => Math.max(max, el.zIndex), 0) + 1;
}

export function createTextElement(doc: DesignDocument, cascade = 0, content = "Add your text"): DesignElement {
  const width = Math.min(doc.width * 0.6, 480);
  const height = 64;
  return {
    ...BASE,
    id: newId(),
    type: "text",
    ...centerOn(doc, width, height, cascade),
    width,
    height,
    zIndex: nextZIndex(doc),
    content,
    fontFamily: "system-ui, sans-serif",
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: 0,
    color: "#0a0a0a",
    textAlign: "left",
  };
}

export function createImageElement(doc: DesignDocument, src: string | undefined, cascade = 0): DesignElement {
  const size = Math.min(doc.width, doc.height) * 0.4;
  return {
    ...BASE,
    id: newId(),
    type: "image",
    ...centerOn(doc, size, size, cascade),
    width: size,
    height: size,
    zIndex: nextZIndex(doc),
    src,
    fit: "cover",
    position: "center",
    radius: 0,
  };
}

export function createLogoElement(doc: DesignDocument, src: string | undefined, cascade = 0): DesignElement {
  const size = Math.min(doc.width, doc.height) * 0.16;
  return {
    ...BASE,
    id: newId(),
    type: "logo",
    x: doc.width * 0.06,
    y: doc.width * 0.06,
    width: size,
    height: size,
    zIndex: nextZIndex(doc),
    src,
    fit: "contain",
    position: "center",
    radius: 0,
  };
}

export function createShapeElement(
  doc: DesignDocument,
  shape: "rectangle" | "ellipse" | "line",
  cascade = 0
): DesignElement {
  const width = doc.width * 0.3;
  const height = shape === "line" ? 4 : doc.width * 0.3;
  return {
    ...BASE,
    id: newId(),
    type: "shape",
    ...centerOn(doc, width, height, cascade),
    width,
    height,
    zIndex: nextZIndex(doc),
    shape,
    fill: "#171717",
    strokeWidth: 0,
    radius: shape === "rectangle" ? 8 : 0,
  };
}

export function createButtonElement(doc: DesignDocument, cascade = 0, label = "Learn more"): DesignElement {
  const width = 200;
  const height = 52;
  return {
    ...BASE,
    id: newId(),
    type: "button",
    ...centerOn(doc, width, height, cascade),
    width,
    height,
    zIndex: nextZIndex(doc),
    label,
    backgroundColor: "#171717",
    textColor: "#ffffff",
    fontSize: 16,
    fontWeight: 600,
    radius: 999,
  };
}

export function createIconElement(doc: DesignDocument, icon: string, cascade = 0): DesignElement {
  const size = Math.min(doc.width, doc.height) * 0.1;
  return {
    ...BASE,
    id: newId(),
    type: "icon",
    ...centerOn(doc, size, size, cascade),
    width: size,
    height: size,
    zIndex: nextZIndex(doc),
    icon,
    color: "#171717",
    strokeWidth: 2,
  };
}

/** Deep-clones an element with a fresh id, offset slightly so it's visibly a copy — used by Duplicate. */
export function duplicateElement(element: DesignElement): DesignElement {
  return { ...structuredClone(element), id: newId(), x: element.x + 16, y: element.y + 16, zIndex: element.zIndex + 1 };
}
