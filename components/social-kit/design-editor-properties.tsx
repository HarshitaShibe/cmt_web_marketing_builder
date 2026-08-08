"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import {
  PaletteIcon,
  LayersIcon,
  TypeIcon,
  ImageIcon,
  ShapesIcon,
  RectangleHorizontalIcon,
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpIcon,
  ChevronsDownIcon,
  CopyIcon,
  Trash2Icon,
  LockIcon,
  UnlockIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import type { EditorStore } from "@/lib/social-kit/editor-store";
import type { DesignElement, DesignElementType } from "@/lib/schema";
import { Section, ControlRow, Field, Seg, ColorField, SliderField, inputClass } from "./editor-ui";

const TYPE_ICON: Record<DesignElementType, React.ComponentType<{ className?: string }>> = {
  text: TypeIcon,
  image: ImageIcon,
  logo: ImageIcon,
  shape: ShapesIcon,
  button: RectangleHorizontalIcon,
  icon: StarIcon,
};

const TYPE_LABEL: Record<DesignElementType, string> = {
  text: "Text",
  image: "Image",
  logo: "Logo",
  shape: "Shape",
  button: "Button",
  icon: "Icon",
};

function elementPreview(el: DesignElement): string {
  if (el.type === "text") return el.content || "Empty text";
  if (el.type === "button") return el.label || "Button";
  if (el.type === "shape") return `${el.shape.charAt(0).toUpperCase()}${el.shape.slice(1)}`;
  if (el.type === "icon") return el.icon;
  return TYPE_LABEL[el.type];
}

export function DesignEditorProperties({
  store,
  focusContentToken,
  onReplaceImage,
}: {
  store: EditorStore;
  focusContentToken: number;
  onReplaceImage: (id: string) => void;
}) {
  const document = useStore(store, (s) => s.document);
  const selectedId = useStore(store, (s) => s.selectedId);
  const select = useStore(store, (s) => s.select);
  const updateElement = useStore(store, (s) => s.updateElement);
  const applyLive = useStore(store, (s) => s.applyLive);
  const beginChange = useStore(store, (s) => s.beginChange);
  const deleteElement = useStore(store, (s) => s.deleteElement);
  const duplicateElement = useStore(store, (s) => s.duplicateElement);
  const reorder = useStore(store, (s) => s.reorder);
  const setBackground = useStore(store, (s) => s.setBackground);

  const selected = document.elements.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-l border-neutral-100 px-5 py-5">
      <div className="flex-1 space-y-7">
        {selected ? (
          <SelectedElementPanel
            key={selected.id}
            element={selected}
            focusContentToken={focusContentToken}
            onLiveChange={(patch) => applyLive(selected.id, patch)}
            onBeginChange={beginChange}
            onCommitChange={(patch) => updateElement(selected.id, patch)}
            onReplaceImage={() => onReplaceImage(selected.id)}
          />
        ) : (
          <>
            <Section icon={<PaletteIcon className="h-3.5 w-3.5" />} title="Design">
              <ColorField label="Background" value={document.background} onChange={setBackground} />
            </Section>
            <Section icon={<ShapesIcon className="h-3.5 w-3.5" />} title="Canvas">
              <p className="text-xs text-neutral-500">
                {document.width} × {document.height}px
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">Select an element to edit it, or use Add on the left.</p>
            </Section>
          </>
        )}

        {selected ? (
          <div className="flex items-center gap-2 border-t border-neutral-100 pt-4">
            <ActionButton icon={<CopyIcon className="h-3.5 w-3.5" />} label="Duplicate" onClick={() => duplicateElement(selected.id)} />
            <ActionButton
              icon={selected.locked ? <UnlockIcon className="h-3.5 w-3.5" /> : <LockIcon className="h-3.5 w-3.5" />}
              label={selected.locked ? "Unlock" : "Lock"}
              onClick={() => updateElement(selected.id, { locked: !selected.locked })}
            />
            <ActionButton
              icon={selected.visible ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
              label={selected.visible ? "Hide" : "Show"}
              onClick={() => updateElement(selected.id, { visible: !selected.visible })}
            />
            <ActionButton icon={<Trash2Icon className="h-3.5 w-3.5" />} label="Delete" onClick={() => deleteElement(selected.id)} danger />
          </div>
        ) : null}
      </div>

      <div className="mt-7 border-t border-neutral-100 pt-5">
        <Section icon={<LayersIcon className="h-3.5 w-3.5" />} title="Layers">
          {document.elements.length === 0 ? (
            <p className="text-xs text-neutral-400">No elements yet.</p>
          ) : (
            <div className="flex flex-col-reverse gap-1">
              {[...document.elements]
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((el) => {
                  const Icon = TYPE_ICON[el.type];
                  const active = el.id === selectedId;
                  return (
                    <div
                      key={el.id}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
                        active ? "border-neutral-900 bg-neutral-50" : "border-transparent hover:border-neutral-200"
                      }`}
                    >
                      <button type="button" onClick={() => select(el.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        <span className={`truncate text-xs ${active ? "font-medium text-neutral-900" : "text-neutral-600"}`}>
                          {elementPreview(el)}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <LayerButton title="Bring to front" onClick={() => reorder(el.id, "front")}>
                          <ChevronsUpIcon className="h-3 w-3" />
                        </LayerButton>
                        <LayerButton title="Bring forward" onClick={() => reorder(el.id, "forward")}>
                          <ChevronUpIcon className="h-3 w-3" />
                        </LayerButton>
                        <LayerButton title="Send backward" onClick={() => reorder(el.id, "backward")}>
                          <ChevronDownIcon className="h-3 w-3" />
                        </LayerButton>
                        <LayerButton title="Send to back" onClick={() => reorder(el.id, "back")}>
                          <ChevronsDownIcon className="h-3 w-3" />
                        </LayerButton>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function LayerButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
    >
      {children}
    </button>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-[10px] font-medium transition-colors ${
        danger
          ? "border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/** Every field here writes through onLiveChange while the user is actively dragging/typing, and only calls onBeginChange() once at the start of a discrete edit — matching the store's "one history entry per gesture" contract. */
function SelectedElementPanel({
  element,
  focusContentToken,
  onLiveChange,
  onBeginChange,
  onCommitChange,
  onReplaceImage,
}: {
  element: DesignElement;
  focusContentToken: number;
  onLiveChange: (patch: Record<string, unknown>) => void;
  onBeginChange: () => void;
  onCommitChange: (patch: Record<string, unknown>) => void;
  onReplaceImage: () => void;
}) {
  const Icon = TYPE_ICON[element.type];
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (element.type === "text" && focusContentToken > 0) {
      contentRef.current?.focus();
      contentRef.current?.select();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusContentToken]);

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-1.5 text-neutral-400">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-xs font-semibold uppercase tracking-[0.12em]">{TYPE_LABEL[element.type]}</p>
      </div>

      {element.type === "text" ? (
        <div className="space-y-3">
          <Field label="Content">
            <textarea
              ref={contentRef}
              value={element.content}
              onFocus={onBeginChange}
              onChange={(e) => onLiveChange({ content: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </Field>
          <SliderField label="Size" value={element.fontSize} min={10} max={140} onChange={(v) => onCommitChange({ fontSize: v })} />
          <ControlRow label="Weight">
            <Seg
              options={["400", "500", "600", "700", "800", "900"] as const}
              value={String(element.fontWeight) as (typeof WEIGHTS)[number]}
              onChange={(v) => onCommitChange({ fontWeight: Number(v) })}
            />
          </ControlRow>
          <ColorField label="Color" value={element.color} onChange={(v) => onCommitChange({ color: v })} />
          <ControlRow label="Align">
            <Seg options={["left", "center", "right"] as const} value={element.textAlign} onChange={(v) => onCommitChange({ textAlign: v })} />
          </ControlRow>
          <SliderField label="Line height" value={element.lineHeight} min={0.8} max={2} step={0.05} onChange={(v) => onCommitChange({ lineHeight: v })} format={(v) => v.toFixed(2)} />
          <SliderField label="Letter spacing" value={element.letterSpacing} min={-2} max={10} step={0.5} onChange={(v) => onCommitChange({ letterSpacing: v })} format={(v) => `${v}px`} />
        </div>
      ) : null}

      {element.type === "image" || element.type === "logo" ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={onReplaceImage}
            className="w-full rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900"
          >
            {element.src ? "Replace image" : "Upload image"}
          </button>
          <ControlRow label="Fit">
            <Seg options={["cover", "contain"] as const} value={element.fit} onChange={(v) => onCommitChange({ fit: v })} />
          </ControlRow>
          <ControlRow label="Position">
            <Seg options={["top", "center", "bottom"] as const} value={element.position} onChange={(v) => onCommitChange({ position: v })} />
          </ControlRow>
          <SliderField label="Opacity" value={Math.round(element.opacity * 100)} min={0} max={100} onChange={(v) => onCommitChange({ opacity: v / 100 })} format={(v) => `${v}%`} />
          <SliderField label="Radius" value={element.radius} min={0} max={Math.min(element.width, element.height) / 2} onChange={(v) => onCommitChange({ radius: v })} />
        </div>
      ) : null}

      {element.type === "shape" ? (
        <div className="space-y-3">
          <ControlRow label="Shape">
            <Seg options={["rectangle", "ellipse", "line"] as const} value={element.shape} onChange={(v) => onCommitChange({ shape: v })} />
          </ControlRow>
          <ColorField label="Fill" value={element.fill} onChange={(v) => onCommitChange({ fill: v })} />
          <ColorField label="Border" value={element.stroke ?? "#000000"} onChange={(v) => onCommitChange({ stroke: v })} />
          <SliderField label="Border width" value={element.strokeWidth} min={0} max={20} onChange={(v) => onCommitChange({ strokeWidth: v })} />
          {element.shape === "rectangle" ? (
            <SliderField label="Radius" value={element.radius} min={0} max={Math.min(element.width, element.height) / 2} onChange={(v) => onCommitChange({ radius: v })} />
          ) : null}
          <SliderField label="Opacity" value={Math.round(element.opacity * 100)} min={0} max={100} onChange={(v) => onCommitChange({ opacity: v / 100 })} format={(v) => `${v}%`} />
        </div>
      ) : null}

      {element.type === "button" ? (
        <div className="space-y-3">
          <Field label="Text">
            <input
              value={element.label}
              onFocus={onBeginChange}
              onChange={(e) => onLiveChange({ label: e.target.value })}
              className={inputClass}
            />
          </Field>
          <SliderField label="Font size" value={element.fontSize} min={10} max={48} onChange={(v) => onCommitChange({ fontSize: v })} />
          <ControlRow label="Weight">
            <Seg
              options={["400", "500", "600", "700", "800", "900"] as const}
              value={String(element.fontWeight) as (typeof WEIGHTS)[number]}
              onChange={(v) => onCommitChange({ fontWeight: Number(v) })}
            />
          </ControlRow>
          <ColorField label="Background" value={element.backgroundColor} onChange={(v) => onCommitChange({ backgroundColor: v })} />
          <ColorField label="Text color" value={element.textColor} onChange={(v) => onCommitChange({ textColor: v })} />
          <SliderField label="Radius" value={element.radius} min={0} max={element.height / 2} onChange={(v) => onCommitChange({ radius: v })} />
        </div>
      ) : null}

      {element.type === "icon" ? (
        <div className="space-y-3">
          <ColorField label="Color" value={element.color} onChange={(v) => onCommitChange({ color: v })} />
          <SliderField label="Stroke width" value={element.strokeWidth} min={0.5} max={4} step={0.25} onChange={(v) => onCommitChange({ strokeWidth: v })} />
          <SliderField label="Opacity" value={Math.round(element.opacity * 100)} min={0} max={100} onChange={(v) => onCommitChange({ opacity: v / 100 })} format={(v) => `${v}%`} />
        </div>
      ) : null}
    </div>
  );
}

const WEIGHTS = ["400", "500", "600", "700", "800", "900"] as const;
