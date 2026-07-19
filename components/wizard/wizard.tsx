"use client";

import { useState } from "react";
import { StepHeader, OptionGrid, OptionCard, ProgressRail } from "@/components/wizard/steps/choice";
import { TemplatePicker, FontPairPicker } from "@/components/wizard/template-picker";
import { ImageUpload, MultiImageUpload } from "@/components/wizard/image-upload";
import {
  CONFERENCE_TYPES,
  SECTION_KEYS,
  WizardInputSchema,
  type ConferenceType,
  type TemplateId,
  type FontPairId,
  type SectionKey,
  type Image,
} from "@/lib/schema";

const TYPE_LABELS: Record<ConferenceType, string> = {
  "international-conference": "International conference",
  "national-conference": "National conference",
  workshop: "Workshop",
  symposium: "Symposium",
  seminar: "Seminar",
  fdp: "Faculty development programme",
  hackathon: "Hackathon",
};

const SECTION_LABELS: Record<SectionKey, { title: string; note: string }> = {
  hero: { title: "Hero banner", note: "Name, dates, logos, buttons" },
  countdown: { title: "Countdown timer", note: "Days until the conference" },
  about: { title: "About", note: "Overview and objectives" },
  "important-dates": { title: "Important dates", note: "Deadline timeline" },
  "call-for-papers": { title: "Call for papers", note: "Scope, tracks, guidelines" },
  publication: { title: "Publication", note: "Journal and indexing details" },
  registration: { title: "Registration", note: "Fee categories and payment" },
  program: { title: "Programme", note: "Day-by-day schedule" },
  speakers: { title: "Speakers", note: "Keynotes and invited talks" },
  committee: { title: "Committee", note: "Chairs and organisers" },
  venue: { title: "Venue", note: "Address, map, travel" },
  sponsors: { title: "Sponsors", note: "Partner logos" },
  history: { title: "History", note: "Previous editions" },
  "hall-of-fame": { title: "Hall of fame", note: "Best papers, awards" },
  hotels: { title: "Hotels", note: "Accommodation nearby" },
  visa: { title: "Visa information", note: "For international delegates" },
  faqs: { title: "FAQs", note: "Common questions" },
  gallery: { title: "Gallery", note: "Photos from past events" },
  contact: { title: "Contact", note: "Email, phone, socials" },
};

const DEFAULT_SECTIONS: SectionKey[] = [
  "hero",
  "countdown",
  "about",
  "important-dates",
  "call-for-papers",
  "registration",
  "speakers",
  "committee",
  "venue",
  "contact",
];

const STEPS = ["Details", "Assets", "Template", "Typography", "Sections"];

export function Wizard() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [type, setType] = useState<ConferenceType>("international-conference");
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [theme, setTheme] = useState("");
  const [publisher, setPublisher] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [conferenceLogo, setConferenceLogo] = useState<Image | undefined>();
  const [organizationLogo, setOrganizationLogo] = useState<Image | undefined>();
  const [sponsorLogos, setSponsorLogos] = useState<Image[]>([]);
  const [heroImage, setHeroImage] = useState<Image | undefined>();

  // Steps 3–5
  const [templateId, setTemplateId] = useState<TemplateId>("academic-classic");
  const [fontPairId, setFontPairId] = useState<FontPairId>("modern");
  const [sections, setSections] = useState<SectionKey[]>(DEFAULT_SECTIONS);


  function toggleSection(key: SectionKey) {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  async function generate() {
    setSubmitting(true);
    setError("");

    try {
      const input = WizardInputSchema.parse({
        conferenceType: type,
        name,
        acronym: acronym || undefined,
        organizer: organizer || undefined,
        theme: theme || undefined,
        publisher: publisher || undefined,
        venueName: venueName || undefined,
        city: city || undefined,
        country: country || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        conferenceLogo,
        organizationLogo,
        sponsorLogos,
        heroImage,
        submissionUrl: submissionUrl || undefined,
        registrationUrl: registrationUrl || undefined,
        email: email || undefined,
        phone: phone || undefined,
        templateId,
        fontPairId,
        sections,
      });

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not generate the site.");
        setSubmitting(false);
        return;
      }

      const { siteId } = await res.json();
      window.location.href = `/editor/${siteId}`;
    } catch {
      setError("Please check the details and try again.");
      setSubmitting(false);
    }
  }

  const canContinue = step !== 0 || name.trim().length > 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <aside className="hidden w-56 shrink-0 border-r bg-white p-6 lg:block">
        <p className="mb-6 text-sm font-medium tracking-tight">New conference site</p>
        <ProgressRail steps={STEPS} current={step} onJump={setStep} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-3xl">
            {/* ---------------- Step 1: details ---------------- */}
            {step === 0 && (
              <>
                <StepHeader
                  step={1}
                  total={5}
                  title="Tell us about your conference"
                  hint="Only the name is required. Everything else can wait."
                />

                <div className="space-y-5">
                  <Field label="Conference name" required>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="International Conference on Applied Artificial Intelligence"
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Acronym">
                      <input
                        value={acronym}
                        onChange={(e) => setAcronym(e.target.value)}
                        placeholder="ICAAI 2027"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Event type">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as ConferenceType)}
                        className={inputClass}
                      >
                        {CONFERENCE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Conference theme">
                    <input
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Ethics, regulation and sustainability in the age of AI"
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Organising institution">
                      <input
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Publication partner">
                      <input
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        placeholder="IEEE, Springer, Elsevier…"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Venue">
                      <input value={venueName} onChange={(e) => setVenueName(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="City">
                      <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Country">
                      <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start date">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="End date">
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                    </Field>
                  </div>

                  <div className="border-t pt-5">
                    <p className="mb-4 text-sm font-medium text-neutral-900">Links</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Submission portal">
                        <input
                          value={submissionUrl}
                          onChange={(e) => setSubmissionUrl(e.target.value)}
                          placeholder="CMT, EasyChair, OpenReview…"
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Registration portal">
                        <input value={registrationUrl} onChange={(e) => setRegistrationUrl(e.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Contact email">
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Phone">
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                      </Field>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------------- Step 2: assets ---------------- */}
            {step === 1 && (
              <>
                <StepHeader
                  step={2}
                  total={5}
                  title="Add your logos and images"
                  hint="All optional — you can upload these later from the editor."
                />

                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <ImageUpload
                      label="Conference logo"
                      hint="Appears in the hero and footer"
                      value={conferenceLogo}
                      onChange={setConferenceLogo}
                    />
                    <ImageUpload
                      label="Organisation logo"
                      hint="Your institution or university"
                      value={organizationLogo}
                      onChange={setOrganizationLogo}
                    />
                  </div>

                  <ImageUpload
                    label="Hero background"
                    hint="A campus or venue photo works well"
                    value={heroImage}
                    onChange={setHeroImage}
                    aspect="wide"
                  />

                  <MultiImageUpload
                    label="Sponsor logos"
                    hint="Add as many as you need"
                    values={sponsorLogos}
                    onChange={setSponsorLogos}
                  />
                </div>
              </>
            )}

            {/* ---------------- Step 3: template ---------------- */}
            {step === 2 && (
              <>
                <StepHeader
                  step={3}
                  total={5}
                  title="Choose a template"
                  hint="Sets the colours, spacing, and overall character. You can change it later."
                />
                <TemplatePicker value={templateId} onChange={setTemplateId} />
              </>
            )}

            {/* ---------------- Step 4: typography ---------------- */}
            {step === 3 && (
              <>
                <StepHeader
                  step={4}
                  total={5}
                  title="Pick your typography"
                  hint="Each pair combines a heading face with a body face that works alongside it."
                />
                <FontPairPicker value={fontPairId} onChange={setFontPairId} />
              </>
            )}

            {/* ---------------- Step 5: sections ---------------- */}
            {step === 4 && (
              <>
                <StepHeader
                  step={5}
                  total={5}
                  title="Which sections do you need?"
                  hint="Switch off anything that doesn't apply. You can add them back in the editor."
                />
                <OptionGrid columns={3}>
                  {SECTION_KEYS.map((s) => (
                    <OptionCard
                      key={s}
                      multi
                      selected={sections.includes(s)}
                      onClick={() => toggleSection(s)}
                      title={SECTION_LABELS[s].title}
                      description={SECTION_LABELS[s].note}
                    />
                  ))}
                </OptionGrid>
                <p className="mt-4 text-sm text-neutral-400">
                  {sections.length} of {SECTION_KEYS.length} selected
                </p>
              </>
            )}

            {error ? (
              <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}

            <div className="mt-10 flex items-center justify-between border-t pt-6">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-lg px-4 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-0"
              >
                Back
              </button>

              {isLast ? (
                <button
                  type="button"
                  onClick={generate}
                  disabled={submitting}
                  className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? "Building your site…" : "Open the editor"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canContinue}
                  className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </main>


      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-neutral-900";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
        {required ? <span className="ml-1 text-neutral-400">*</span> : null}
      </span>
      {children}
    </label>
  );
}