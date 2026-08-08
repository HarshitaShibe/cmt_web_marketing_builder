"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { DesignDocument, DesignElement } from "@/lib/schema";
import { duplicateElement as cloneElement } from "./element-factories";

const MAX_HISTORY = 50;

type ReorderDirection = "front" | "back" | "forward" | "backward";

type EditorState = {
  document: DesignDocument;
  selectedId: string | null;
  past: DesignDocument[];
  future: DesignDocument[];
  /** True once the document has changed since the last markSaved() call — drives the autosave debounce and the unsaved-changes indicator. */
  dirty: boolean;

  /** Swaps in a whole new document (platform switch, template applied) — resets selection and history, since undoing across an unrelated document swap isn't meaningful. */
  loadDocument: (doc: DesignDocument) => void;
  select: (id: string | null) => void;

  /** Snapshots the current document onto the undo stack. Call once at the *start* of a drag/resize/rotate gesture, or immediately before any discrete property change — never on every intermediate pointermove. */
  beginChange: () => void;
  /** Mutates one element in place without touching history — for the continuous updates during an active gesture (after beginChange() already ran). */
  applyLive: (id: string, patch: Record<string, unknown>) => void;
  /** Snapshot + patch in one call, for discrete single-shot edits (a select/toggle/click in the properties panel). */
  updateElement: (id: string, patch: Record<string, unknown>) => void;

  addElement: (element: DesignElement) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  reorder: (id: string, direction: ReorderDirection) => void;
  setBackground: (color: string) => void;

  undo: () => void;
  redo: () => void;
  markSaved: () => void;
};

export function createEditorStore(initialDocument: DesignDocument) {
  return create<EditorState>()(
    immer((set, get) => ({
      document: initialDocument,
      selectedId: null,
      past: [],
      future: [],
      dirty: false,

      loadDocument: (doc) =>
        set((s) => {
          s.document = doc;
          s.selectedId = null;
          s.past = [];
          s.future = [];
          s.dirty = false;
        }),

      select: (id) =>
        set((s) => {
          s.selectedId = id;
        }),

      beginChange: () => {
        const snapshot = structuredClone(get().document);

        set((s) => {
          s.past.push(snapshot);
          if (s.past.length > MAX_HISTORY) s.past.shift();
          s.future = [];
          s.dirty = true;
        });
      },

      applyLive: (id, patch) =>
        set((s) => {
          const el = s.document.elements.find((e) => e.id === id);
          if (!el) return;
          Object.assign(el, patch);
        }),

      updateElement: (id, patch) => {
        get().beginChange();
        get().applyLive(id, patch);
      },

      addElement: (element) => {
        get().beginChange();
        set((s) => {
          s.document.elements.push(element as never);
          s.selectedId = element.id;
        });
      },

      deleteElement: (id) => {
        get().beginChange();
        set((s) => {
          s.document.elements = s.document.elements.filter((e) => e.id !== id) as never;
          if (s.selectedId === id) s.selectedId = null;
        });
      },

      duplicateElement: (id) => {
        const el = get().document.elements.find((e) => e.id === id);
        if (!el) return;
        const copy = cloneElement(el);
        get().beginChange();
        set((s) => {
          s.document.elements.push(copy as never);
          s.selectedId = copy.id;
        });
      },

      reorder: (id, direction) => {
        get().beginChange();
        set((s) => {
          const elements = s.document.elements;
          const el = elements.find((e) => e.id === id);
          if (!el) return;
          const zIndexes = elements.map((e) => e.zIndex);
          const maxZ = Math.max(0, ...zIndexes);
          const minZ = Math.min(0, ...zIndexes);
          if (direction === "front") {
            el.zIndex = maxZ + 1;
          } else if (direction === "back") {
            el.zIndex = minZ - 1;
          } else {
            const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
            const idx = sorted.findIndex((e) => e.id === id);
            const swapWith = direction === "forward" ? sorted[idx + 1] : sorted[idx - 1];
            if (swapWith) {
              const tmp = swapWith.zIndex;
              const target = elements.find((e) => e.id === swapWith.id)!;
              target.zIndex = el.zIndex;
              el.zIndex = tmp;
            }
          }
        });
      },

      setBackground: (color) => {
        get().beginChange();
        set((s) => {
          s.document.background = color as never;
        });
      },

      undo: () => {
        const current = structuredClone(get().document);
        const prev = get().past[get().past.length - 1];

        if (!prev) return;

        set((s) => {
          s.past.pop();
          s.future.unshift(current);
          s.document = prev;
          s.selectedId = null;
        });
      },

      redo: () => {
        const current = structuredClone(get().document);
        const next = get().future[0];

        if (!next) return;

        set((s) => {
          s.future.shift();
          s.past.push(current);
          s.document = next;
          s.selectedId = null;
        });
      },

      markSaved: () =>
        set((s) => {
          s.dirty = false;
        }),
    }))
  );
}

export type EditorStore = ReturnType<typeof createEditorStore>;
