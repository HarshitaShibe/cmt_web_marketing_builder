"use client";

import { useCallback, useMemo, useRef } from "react";
import { useStore } from "zustand";
import type { EditorStore } from "@/lib/social-kit/editor-store";
import { DesignDocumentRenderer } from "./design-document-renderer";
import {
  RESIZE_HANDLES,
  angleFromCenter,
  resizeRect,
  snapAngle,
  type HandleId,
  type ElementRect,
} from "@/lib/social-kit/editor-geometry";
import type { DesignElement } from "@/lib/schema";

const ASPECT_LOCK_TYPES = new Set(["image", "logo", "icon"]);

/**
 * The middle 65% of the workspace: the actual poster plus click-to-select,
 * drag-to-move, resize handles, and a rotation handle — all hand-rolled on
 * top of the same coordinate system DesignDocumentRenderer already uses
 * (an SVG viewBox equal to the document's real pixel size), rather than a
 * second overlay library with its own notion of where things are. See the
 * write-up in the Phase 3 summary for why react-moveable wasn't pulled in.
 */
export function DesignEditorCanvas({
  store,
  scale,
  boxWidth,
  boxHeight,
  onEditText,
  svgRef,
}: {
  store: EditorStore;
  scale: number;
  boxWidth: number;
  boxHeight: number;
  onEditText: (id: string) => void;
  svgRef?: React.Ref<SVGSVGElement>;
}) {
  const document = useStore(store, (s) => s.document);
  const selectedId = useStore(store, (s) => s.selectedId);
  const select = useStore(store, (s) => s.select);
  const beginChange = useStore(store, (s) => s.beginChange);
  const applyLive = useStore(store, (s) => s.applyLive);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Screen client coords -> document coords, accounting for the wrapper's
  // on-screen position and the zoom scale — the one place pixel math has to
  // touch the DOM, everything downstream works in pure document units.
  const toDocPoint = useCallback(
    (clientX: number, clientY: number) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
    },
    [scale]
  );

  const selected = useMemo(
    () => document.elements.find((e) => e.id === selectedId) ?? null,
    [document.elements, selectedId]
  );

  const handleBackgroundPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target === e.currentTarget) select(null);
    },
    [select]
  );

  const startMove = useCallback(
    (e: React.PointerEvent, element: DesignElement) => {
      e.stopPropagation();
      e.preventDefault();
      select(element.id);
      if (element.locked) return;
      const start = toDocPoint(e.clientX, e.clientY);
      const originX = element.x;
      const originY = element.y;
      beginChange();
      let moved = false;

      function onMove(ev: PointerEvent) {
        const now = toDocPoint(ev.clientX, ev.clientY);
        moved = true;
        applyLive(element.id, { x: originX + (now.x - start.x), y: originY + (now.y - start.y) });
      }
      function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!moved) {
          // A click with no drag — nothing to commit, but beginChange()
          // already pushed a history entry; harmless no-op undo state, left
          // as-is rather than adding extra bookkeeping to special-case it.
        }
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [applyLive, beginChange, select, toDocPoint]
  );

  const startResize = useCallback(
    (e: React.PointerEvent, element: DesignElement, handle: HandleId) => {
      e.stopPropagation();
      e.preventDefault();
      if (element.locked) return;
      const start: ElementRect = {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
      };
      const pointerStart = toDocPoint(e.clientX, e.clientY);
      const lockAspect = ASPECT_LOCK_TYPES.has(element.type);
      beginChange();

      function onMove(ev: PointerEvent) {
        const now = toDocPoint(ev.clientX, ev.clientY);
        const next = resizeRect(start, handle, pointerStart, now, lockAspect);
        applyLive(element.id, next);
      }
      function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [applyLive, beginChange, toDocPoint]
  );

  const startRotate = useCallback(
    (e: React.PointerEvent, element: DesignElement) => {
      e.stopPropagation();
      e.preventDefault();
      if (element.locked) return;
      const rect: ElementRect = {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
      };
      const startPointerAngle = angleFromCenter(rect, toDocPoint(e.clientX, e.clientY));
      const startRotation = element.rotation;
      beginChange();

      function onMove(ev: PointerEvent) {
        const now = toDocPoint(ev.clientX, ev.clientY);
        const currentAngle = angleFromCenter(rect, now);
        let next = startRotation + (currentAngle - startPointerAngle);
        if (ev.shiftKey) next = snapAngle(next);
        applyLive(element.id, { rotation: Math.round(next * 100) / 100 });
      }
      function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [applyLive, beginChange, toDocPoint]
  );

  return (
    <div
      ref={wrapperRef}
      style={{ width: boxWidth, height: boxHeight, position: "relative" }}
      className="select-none overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
      onPointerDown={handleBackgroundPointerDown}
    >
      <DesignDocumentRenderer ref={svgRef} document={document} />

      {/* Interaction overlay — one invisible hit-rect per element (so click
          order matches paint order / zIndex), plus visible selection chrome
          for whichever element is selected. */}
      <svg
        viewBox={`0 0 ${document.width} ${document.height}`}
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        {[...document.elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <g
              key={el.id}
              transform={`translate(${el.x} ${el.y}) rotate(${el.rotation} ${el.width / 2} ${el.height / 2})`}
              opacity={el.visible ? 1 : 0.3}
            >
              <rect
                width={el.width}
                height={el.height}
                fill="transparent"
                style={{ cursor: el.locked ? "not-allowed" : "move", pointerEvents: el.visible ? "all" : "none" }}
                onPointerDown={(e) => startMove(e, el)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (el.type === "text") onEditText(el.id);
                }}
              />
            </g>
          ))}

        {selected ? (
          <g
            transform={`translate(${selected.x} ${selected.y}) rotate(${selected.rotation} ${selected.width / 2} ${selected.height / 2})`}
          >
            <rect
              width={selected.width}
              height={selected.height}
              fill="none"
              stroke="#171717"
              strokeWidth={1.5 / scale}
              strokeDasharray={selected.locked ? `${4 / scale} ${4 / scale}` : undefined}
              vectorEffect="non-scaling-stroke"
              style={{ pointerEvents: "none" }}
            />

            {!selected.locked &&
              RESIZE_HANDLES.map((h) => {
                const hx = h.drag.x * selected.width;
                const hy = h.drag.y * selected.height;
                const size = 9 / scale;
                const cursor =
                  h.id === "n" || h.id === "s"
                    ? "ns-resize"
                    : h.id === "e" || h.id === "w"
                      ? "ew-resize"
                      : h.id === "ne" || h.id === "sw"
                        ? "nesw-resize"
                        : "nwse-resize";
                return (
                  <rect
                    key={h.id}
                    x={hx - size / 2}
                    y={hy - size / 2}
                    width={size}
                    height={size}
                    fill="#ffffff"
                    stroke="#171717"
                    strokeWidth={1.25 / scale}
                    style={{ cursor }}
                    onPointerDown={(e) => startResize(e, selected, h.id)}
                  />
                );
              })}

            {!selected.locked ? (
              <>
                <line
                  x1={selected.width / 2}
                  y1={0}
                  x2={selected.width / 2}
                  y2={-28 / scale}
                  stroke="#171717"
                  strokeWidth={1.25 / scale}
                  style={{ pointerEvents: "none" }}
                />
                <circle
                  cx={selected.width / 2}
                  cy={-28 / scale}
                  r={7 / scale}
                  fill="#ffffff"
                  stroke="#171717"
                  strokeWidth={1.25 / scale}
                  style={{ cursor: "grab" }}
                  onPointerDown={(e) => startRotate(e, selected)}
                />
              </>
            ) : null}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
