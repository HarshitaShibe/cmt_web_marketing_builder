/**
 * Pure math for the canvas's drag/resize/rotate gestures. No React, no
 * store — just vectors, so it's easy to reason about and unit-test in
 * isolation. Kept separate from design-editor-canvas.tsx because the
 * rotation-aware resize solve is the one genuinely fiddly part of the whole
 * editor and deserves to be readable on its own.
 */

export type Point = { x: number; y: number };
export type ElementRect = { x: number; y: number; width: number; height: number; rotation: number };

const DEG2RAD = Math.PI / 180;

/** Rotates a vector by `deg` degrees (matches SVG's clockwise-positive convention). */
export function rotateVector(v: Point, deg: number): Point {
  const rad = deg * DEG2RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
}

/**
 * Maps a point in an element's own local (unrotated, 0..width x 0..height)
 * space to document space, using the exact same transform the renderer
 * applies: translate(x,y) then rotate around the element's own center.
 */
export function localToDoc(rect: ElementRect, local: Point): Point {
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const rotated = rotateVector({ x: local.x - cx, y: local.y - cy }, rect.rotation);
  return { x: rect.x + cx + rotated.x, y: rect.y + cy + rotated.y };
}

/** Center of an element in document space. */
export function elementCenter(rect: ElementRect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export type HandleId = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** Where each resize handle sits (as a 0..1 fraction of width/height) and which is the fixed opposite anchor. */
export const RESIZE_HANDLES: { id: HandleId; drag: Point; anchor: Point }[] = [
  { id: "nw", drag: { x: 0, y: 0 }, anchor: { x: 1, y: 1 } },
  { id: "n", drag: { x: 0.5, y: 0 }, anchor: { x: 0.5, y: 1 } },
  { id: "ne", drag: { x: 1, y: 0 }, anchor: { x: 0, y: 1 } },
  { id: "e", drag: { x: 1, y: 0.5 }, anchor: { x: 0, y: 0.5 } },
  { id: "se", drag: { x: 1, y: 1 }, anchor: { x: 0, y: 0 } },
  { id: "s", drag: { x: 0.5, y: 1 }, anchor: { x: 0.5, y: 0 } },
  { id: "sw", drag: { x: 0, y: 1 }, anchor: { x: 1, y: 0 } },
  { id: "w", drag: { x: 0, y: 0.5 }, anchor: { x: 1, y: 0.5 } },
];

export const MIN_ELEMENT_SIZE = 16;

/**
 * Resizes a (possibly rotated) rect by dragging one handle, keeping the
 * opposite handle fixed in document space. `lockAspect` forces width/height
 * to move together (used for corner-drags on image/logo/icon elements).
 */
export function resizeRect(
  start: ElementRect,
  handle: HandleId,
  pointerStartDoc: Point,
  pointerNowDoc: Point,
  lockAspect: boolean
): { x: number; y: number; width: number; height: number } {
  const def = RESIZE_HANDLES.find((h) => h.id === handle)!;
  const anchorDoc = localToDoc(start, { x: def.anchor.x * start.width, y: def.anchor.y * start.height });

  // Vector from the fixed anchor to the pointer, un-rotated into the
  // element's own local axes so width/height math is simple addition again.
  const vDoc = { x: pointerNowDoc.x - anchorDoc.x, y: pointerNowDoc.y - anchorDoc.y };
  const vLocal = rotateVector(vDoc, -start.rotation);

  const signX = def.drag.x - def.anchor.x; // -1, 0, or 1
  const signY = def.drag.y - def.anchor.y;

  let width = signX !== 0 ? Math.max(MIN_ELEMENT_SIZE, signX * vLocal.x) : start.width;
  let height = signY !== 0 ? Math.max(MIN_ELEMENT_SIZE, signY * vLocal.y) : start.height;

  if (lockAspect && signX !== 0 && signY !== 0 && start.width > 0 && start.height > 0) {
    const aspect = start.width / start.height;
    // Follow whichever axis the pointer moved further along.
    if (Math.abs(vLocal.x) >= Math.abs(vLocal.y)) {
      height = width / aspect;
    } else {
      width = height * aspect;
    }
    width = Math.max(MIN_ELEMENT_SIZE, width);
    height = Math.max(MIN_ELEMENT_SIZE, height);
  }

  // Re-derive x,y so the anchor point (computed with the NEW size) lands
  // back on anchorDoc — this is what keeps the opposite corner visually
  // pinned even though the element is rotated.
  const cx = width / 2;
  const cy = height / 2;
  const anchorLocalOffset = { x: def.anchor.x * width - cx, y: def.anchor.y * height - cy };
  const rotatedOffset = rotateVector(anchorLocalOffset, start.rotation);
  const centerDoc = { x: anchorDoc.x - rotatedOffset.x, y: anchorDoc.y - rotatedOffset.y };

  return { x: centerDoc.x - cx, y: centerDoc.y - cy, width, height };
}

/** Angle (degrees, SVG clockwise-positive) from an element's center to a document-space point. */
export function angleFromCenter(rect: ElementRect, point: Point): number {
  const c = elementCenter(rect);
  return (Math.atan2(point.y - c.y, point.x - c.x) * 180) / Math.PI;
}

/** Snaps to the nearest multiple of `step` degrees — used when the user holds Shift while rotating. */
export function snapAngle(deg: number, step = 15): number {
  return Math.round(deg / step) * step;
}
