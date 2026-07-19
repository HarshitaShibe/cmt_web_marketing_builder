import type { ConferenceType, PageKey, SectionKey } from "@/lib/schema";

export type Template = {
  type: ConferenceType;
  label: string;
  pages: PageKey[];
  sections: SectionKey[];
  copy: {
    heroTagline: string;
    aboutHeading: string;
    aboutBody: string;
    stats: { value: string; label: string }[];
    deadlines: { label: string; date: string; note?: string }[];
    feeNote: string;
    tiers: { category: string; amount: string; detail: string; featured?: boolean }[];
    speakersHeading: string;
  };
};

const ACADEMIC_DEADLINES = [
  { label: "Call for papers opens", date: "To be announced" },
  { label: "Paper submission deadline", date: "To be announced", note: "Full papers via the submission portal" },
  { label: "Notification of acceptance", date: "To be announced" },
  { label: "Camera-ready submission", date: "To be announced" },
  { label: "Conference dates", date: "To be announced" },
];

const ACADEMIC_TIERS = [
  { category: "Student", amount: "0,000", detail: "Valid student ID required at registration.", featured: true },
  { category: "Academic", amount: "0,000", detail: "Faculty and postdoctoral researchers." },
  { category: "Industry", amount: "0,000", detail: "Corporate and non-academic delegates." },
];

export const TEMPLATES: Record<ConferenceType, Template> = {
  "international-conference": {
    type: "international-conference",
    label: "International conference",
    pages: ["home", "about", "committee", "speakers", "call-for-papers", "registration", "venue", "contact"],
    sections: ["hero", "about", "important-dates", "speakers", "registration", "contact"],
    copy: {
      heroTagline: "Bringing together researchers and practitioners from around the world.",
      aboutHeading: "About the conference",
      aboutBody:
        "This conference brings together researchers, practitioners, and students to share recent advances and discuss open problems in the field.\nThe programme includes peer-reviewed paper sessions, invited keynote talks, and focused workshops across all major tracks.",
      stats: [
        { value: "000+", label: "Expected attendees" },
        { value: "00", label: "Technical tracks" },
        { value: "00+", label: "Institutions" },
      ],
      deadlines: ACADEMIC_DEADLINES,
      feeNote: "Early-bird rates apply until the stated deadline. Fees include proceedings, lunch, and refreshments.",
      tiers: ACADEMIC_TIERS,
      speakersHeading: "Keynote speakers",
    },
  },

  "national-conference": {
    type: "national-conference",
    label: "National conference",
    pages: ["home", "about", "committee", "speakers", "call-for-papers", "registration", "contact"],
    sections: ["hero", "about", "important-dates", "speakers", "registration", "contact"],
    copy: {
      heroTagline: "A national forum for research, teaching, and industry collaboration.",
      aboutHeading: "About the conference",
      aboutBody:
        "This national conference provides a platform for academics, research scholars, and industry professionals to present their work and exchange ideas.\nSessions span contributed papers, invited talks, and panel discussions on current challenges in the discipline.",
      stats: [
        { value: "000+", label: "Delegates" },
        { value: "00", label: "Sessions" },
        { value: "00+", label: "Institutions" },
      ],
      deadlines: ACADEMIC_DEADLINES,
      feeNote: "Registration includes conference kit, proceedings, and refreshments.",
      tiers: ACADEMIC_TIERS,
      speakersHeading: "Invited speakers",
    },
  },

  workshop: {
    type: "workshop",
    label: "Workshop",
    pages: ["home", "about", "speakers", "program", "registration", "contact"],
    sections: ["hero", "about", "important-dates", "speakers", "registration", "contact"],
    copy: {
      heroTagline: "A hands-on workshop for practitioners who want to build, not just listen.",
      aboutHeading: "About the workshop",
      aboutBody:
        "This workshop is a practical, hands-on session designed for participants who want working knowledge they can apply immediately.\nPlaces are limited so that every participant gets individual attention from the instructors.",
      stats: [
        { value: "00", label: "Places available" },
        { value: "0", label: "Days" },
        { value: "00", label: "Hands-on hours" },
      ],
      deadlines: [
        { label: "Registration opens", date: "To be announced" },
        { label: "Registration closes", date: "To be announced", note: "Places are limited" },
        { label: "Workshop dates", date: "To be announced" },
      ],
      feeNote: "Fee covers materials, software access, and refreshments for the full duration.",
      tiers: [
        { category: "Student", amount: "0,000", detail: "Valid student ID required.", featured: true },
        { category: "Professional", amount: "0,000", detail: "Working professionals and faculty." },
      ],
      speakersHeading: "Instructors",
    },
  },

  symposium: {
    type: "symposium",
    label: "Symposium",
    pages: ["home", "about", "speakers", "program", "registration", "contact"],
    sections: ["hero", "about", "important-dates", "speakers", "registration", "contact"],
    copy: {
      heroTagline: "Invited talks and focused discussion on a specialist theme.",
      aboutHeading: "About the symposium",
      aboutBody:
        "This symposium gathers a small group of invited speakers for in-depth discussion on a focused theme.\nThe format favours extended talks and open discussion over short contributed sessions.",
      stats: [
        { value: "00", label: "Invited talks" },
        { value: "0", label: "Days" },
        { value: "00+", label: "Participants" },
      ],
      deadlines: [
        { label: "Registration opens", date: "To be announced" },
        { label: "Registration closes", date: "To be announced" },
        { label: "Symposium dates", date: "To be announced" },
      ],
      feeNote: "Registration includes all sessions, lunch, and the evening reception.",
      tiers: ACADEMIC_TIERS,
      speakersHeading: "Invited speakers",
    },
  },

  seminar: {
    type: "seminar",
    label: "Seminar",
    pages: ["home", "about", "speakers", "registration", "contact"],
    sections: ["hero", "about", "speakers", "contact"],
    copy: {
      heroTagline: "A single-session talk open to students, faculty, and visitors.",
      aboutHeading: "About the seminar",
      aboutBody:
        "This seminar presents current work in an accessible format, followed by an open question and answer session.\nAll students, faculty, and interested visitors are welcome to attend.",
      stats: [
        { value: "00", label: "Minutes" },
        { value: "00+", label: "Expected attendees" },
        { value: "1", label: "Session" },
      ],
      deadlines: [
        { label: "Registration opens", date: "To be announced" },
        { label: "Seminar date", date: "To be announced" },
      ],
      feeNote: "Attendance is free, but registration is required for seating.",
      tiers: [{ category: "All attendees", amount: "Free", detail: "Registration required.", featured: true }],
      speakersHeading: "Speaker",
    },
  },

  fdp: {
    type: "fdp",
    label: "Faculty development programme",
    pages: ["home", "about", "program", "registration", "contact"],
    sections: ["hero", "about", "important-dates", "speakers", "registration", "contact"],
    copy: {
      heroTagline: "A structured training programme for teaching faculty.",
      aboutHeading: "About the programme",
      aboutBody:
        "This faculty development programme is designed to strengthen teaching practice and subject knowledge through structured sessions and guided activities.\nParticipants who complete the programme receive a certificate from the organising institute.",
      stats: [
        { value: "0", label: "Days" },
        { value: "00", label: "Sessions" },
        { value: "00", label: "Participants" },
      ],
      deadlines: [
        { label: "Registration opens", date: "To be announced" },
        { label: "Registration closes", date: "To be announced" },
        { label: "Programme dates", date: "To be announced" },
        { label: "Certificate distribution", date: "To be announced" },
      ],
      feeNote: "Fee includes course materials, certificate, and refreshments.",
      tiers: [
        { category: "Faculty", amount: "0,000", detail: "Teaching staff from any institution.", featured: true },
        { category: "Research scholar", amount: "0,000", detail: "Registered research scholars." },
      ],
      speakersHeading: "Resource persons",
    },
  },

  hackathon: {
    type: "hackathon",
    label: "Hackathon",
    pages: ["home", "about", "program", "sponsors", "registration", "contact"],
    sections: ["hero", "about", "important-dates", "speakers", "registration", "contact"],
    copy: {
      heroTagline: "Build something real in 36 hours. Teams welcome from any institution.",
      aboutHeading: "About the hackathon",
      aboutBody:
        "Teams work through the weekend to build a working prototype against a set of open problem statements.\nMentors are on hand throughout, and projects are judged by a panel from industry and academia.",
      stats: [
        { value: "36", label: "Hours" },
        { value: "00", label: "Teams" },
        { value: "0,00,000", label: "Prize pool" },
      ],
      deadlines: [
        { label: "Registration opens", date: "To be announced" },
        { label: "Team registration closes", date: "To be announced", note: "Teams of up to four" },
        { label: "Problem statements released", date: "To be announced" },
        { label: "Hackathon dates", date: "To be announced" },
        { label: "Results announced", date: "To be announced" },
      ],
      feeNote: "Registration is per team and includes meals and workspace for the full duration.",
      tiers: [
        { category: "Student team", amount: "0,000", detail: "Up to four members, any institution.", featured: true },
        { category: "Open team", amount: "0,000", detail: "Professionals and mixed teams." },
      ],
      speakersHeading: "Mentors and judges",
    },
  },
};

export function templateFor(type: ConferenceType): Template {
  return TEMPLATES[type] ?? TEMPLATES["international-conference"];
}