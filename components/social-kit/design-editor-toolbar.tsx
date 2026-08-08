"use client";

import { useRef, useState } from "react";
import { useStore } from "zustand";
import {
  TypeIcon,
  ImageIcon,
  BadgeCheckIcon,
  SquareIcon,
  CircleIcon,
  MinusIcon,
  StarIcon,
  RectangleHorizontalIcon,
  UploadIcon,
  HeartIcon,
  CheckIcon,
  ArrowRightIcon,
  CalendarIcon,
  MapPinIcon,
  AwardIcon,
  UsersIcon,
  GlobeIcon,
  MailIcon,
  MicIcon,
} from "lucide-react";
import type { EditorStore } from "@/lib/social-kit/editor-store";
import {
  createTextElement,
  createImageElement,
  createLogoElement,
  createShapeElement,
  createButtonElement,
  createIconElement,
} from "@/lib/social-kit/element-factories";
import { STARTER_DOCUMENT_OPTIONS, STARTER_DOCUMENT_LABELS, type StarterDocumentOption } from "@/lib/social-kit/design-presets";
import { Section } from "./editor-ui";
import type { ConferenceFacts, Image, KitFields } from "@/lib/schema";

const ICON_CHOICES: { name: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { name: "star", Icon: StarIcon },
  { name: "heart", Icon: HeartIcon },
  { name: "check", Icon: CheckIcon },
  { name: "arrow-right", Icon: ArrowRightIcon },
  { name: "calendar", Icon: CalendarIcon },
  { name: "map-pin", Icon: MapPinIcon },
  { name: "award", Icon: AwardIcon },
  { name: "users", Icon: UsersIcon },
  { name: "globe", Icon: GlobeIcon },
  { name: "mail", Icon: MailIcon },
  { name: "mic", Icon: MicIcon },
];

async function uploadImage(file: File): Promise<Image> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return { url: data.url, alt: file.name.replace(/\.[^.]+$/, "") };
}

export function DesignEditorToolbar({
  store,
  facts,
  fields,
  existingAssets,
  activeTemplate,
  onApplyTemplate,
}: {
  store: EditorStore;
  facts: ConferenceFacts;
  fields: KitFields;
  existingAssets: { label: string; image: Image }[];
  activeTemplate: StarterDocumentOption | null;
  onApplyTemplate: (option: StarterDocumentOption) => void;
}) {
  const document = useStore(store, (s) => s.document);
  const addElement = useStore(store, (s) => s.addElement);

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const cascade = useRef(0);

  function nextCascade() {
    cascade.current += 1;
    return cascade.current;
  }

  async function handleImageFile(file: File) {
    setUploadBusy(true);
    setUploadError("");
    try {
      const img = await uploadImage(file);
      addElement(createImageElement(document, img.url, nextCascade()));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }

  async function handleLogoFile(file: File) {
    setUploadBusy(true);
    setUploadError("");
    try {
      const img = await uploadImage(file);
      addElement(createLogoElement(document, img.url, nextCascade()));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }

  const factInserts: { label: string; value: string; kind: "text" | "button" }[] = [
    { label: "Conference name", value: fields.headline, kind: "text" as const },
    { label: "Theme / tagline", value: fields.subheading, kind: "text" as const },
    { label: "Date", value: fields.dateLine, kind: "text" as const },
    { label: "Venue", value: fields.venueLine, kind: "text" as const },
    ...(facts.organizer ? [{ label: "Institution", value: facts.organizer, kind: "text" as const }] : []),
    { label: "Registration CTA", value: fields.ctaLabel, kind: "button" as const },
  ].filter((f) => f.value);

  return (
    <div className="flex w-[220px] shrink-0 flex-col gap-7 overflow-y-auto border-r border-neutral-100 px-4 py-5">
      <Section icon={<TypeIcon className="h-3.5 w-3.5" />} title="Add">
        <div className="grid grid-cols-3 gap-2">
          <ToolButton label="Text" icon={<TypeIcon className="h-4 w-4" />} onClick={() => addElement(createTextElement(document, nextCascade()))} />
          <ToolButton
            label="Image"
            icon={<ImageIcon className="h-4 w-4" />}
            onClick={() => imageInputRef.current?.click()}
            busy={uploadBusy}
          />
          <ToolButton
            label="Logo"
            icon={<BadgeCheckIcon className="h-4 w-4" />}
            onClick={() => {
              if (existingAssets[0]) {
                addElement(createLogoElement(document, existingAssets[0].image.url, nextCascade()));
              } else {
                logoInputRef.current?.click();
              }
            }}
            busy={uploadBusy}
          />
          <ToolButton label="Rectangle" icon={<SquareIcon className="h-4 w-4" />} onClick={() => addElement(createShapeElement(document, "rectangle", nextCascade()))} />
          <ToolButton label="Ellipse" icon={<CircleIcon className="h-4 w-4" />} onClick={() => addElement(createShapeElement(document, "ellipse", nextCascade()))} />
          <ToolButton label="Line" icon={<MinusIcon className="h-4 w-4" />} onClick={() => addElement(createShapeElement(document, "line", nextCascade()))} />
          <ToolButton label="Icon" icon={<StarIcon className="h-4 w-4" />} onClick={() => setIconPickerOpen((v) => !v)} />
          <ToolButton label="Button" icon={<RectangleHorizontalIcon className="h-4 w-4" />} onClick={() => addElement(createButtonElement(document, nextCascade()))} />
        </div>

        {iconPickerOpen ? (
          <div className="mt-2 grid grid-cols-6 gap-1.5 rounded-lg border border-neutral-200 p-2">
            {ICON_CHOICES.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  addElement(createIconElement(document, name, nextCascade()));
                  setIconPickerOpen(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        ) : null}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageFile(f);
            e.target.value = "";
          }}
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleLogoFile(f);
            e.target.value = "";
          }}
        />

        {existingAssets.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {existingAssets.map((a) => (
              <button
                key={a.label}
                type="button"
                title={`Add ${a.label}`}
                onClick={() => addElement(createLogoElement(document, a.image.url, nextCascade()))}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white transition-colors hover:border-neutral-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image.url} alt={a.label} className="h-full w-full object-contain p-1" />
              </button>
            ))}
            <button
              type="button"
              title="Upload a logo"
              onClick={() => logoInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700"
            >
              <UploadIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
      </Section>

      {factInserts.length > 0 ? (
        <Section icon={<CalendarIcon className="h-3.5 w-3.5" />} title="Conference facts">
          <div className="flex flex-col gap-1.5">
            {factInserts.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() =>
                  addElement(
                    f.kind === "button"
                      ? createButtonElement(document, nextCascade(), f.value)
                      : createTextElement(document, nextCascade(), f.value)
                  )
                }
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2.5 py-2 text-left text-xs text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900"
              >
                <span className="text-neutral-400">+</span>
                <span className="flex-1 truncate">
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">{f.label}</span>
                  <span className="block truncate">{f.value}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>
      ) : null}

      <Section icon={<SquareIcon className="h-3.5 w-3.5" />} title="Templates">
        <div className="flex flex-col gap-1.5">
          {STARTER_DOCUMENT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onApplyTemplate(option)}
              aria-pressed={activeTemplate === option}
              className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                activeTemplate === option
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
              }`}
            >
              {STARTER_DOCUMENT_LABELS[option]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
          Replaces everything on the current platform&apos;s canvas — you can still change or undo it after.
        </p>
      </Section>
    </div>
  );
}

function ToolButton({
  label,
  icon,
  onClick,
  busy,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={label}
      className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 py-2.5 text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
