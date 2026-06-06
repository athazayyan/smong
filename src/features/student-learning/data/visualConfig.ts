import type { ChapterKind, ChapterMapVisual, LearningModuleGroup } from "../types";

export const chapterMapVisuals = [
  {
    chapterKind: "knowledge",
    phase: "pra-bencana",
    phaseLabel: "Pra-Bencana",
    desktopClassName: "left-[9%] top-[58%]",
    mobileOrder: 1,
    tone: "teal",
  },
  {
    chapterKind: "cause",
    phase: "pra-bencana",
    phaseLabel: "Pra-Bencana",
    desktopClassName: "left-[24%] top-[31%]",
    mobileOrder: 2,
    tone: "yellow",
  },
  {
    chapterKind: "preparedness",
    phase: "pra-bencana",
    phaseLabel: "Pra-Bencana",
    desktopClassName: "left-[38%] top-[62%]",
    mobileOrder: 3,
    tone: "teal",
  },
  {
    chapterKind: "during-disaster",
    phase: "saat-bencana",
    phaseLabel: "Saat Bencana",
    desktopClassName: "left-[52%] top-[42%]",
    mobileOrder: 4,
    tone: "purple",
  },
  {
    chapterKind: "after-disaster",
    phase: "pascabencana",
    phaseLabel: "Pascabencana",
    desktopClassName: "left-[66%] top-[63%]",
    mobileOrder: 5,
    tone: "peach",
  },
  {
    chapterKind: "impact-and-reflection",
    phase: "pascabencana",
    phaseLabel: "Pascabencana",
    desktopClassName: "left-[80%] top-[36%]",
    mobileOrder: 6,
    tone: "sky",
  },
  {
    chapterKind: "certification",
    phase: "sertifikasi",
    phaseLabel: "Sertifikasi",
    desktopClassName: "left-[91%] top-[56%]",
    mobileOrder: 7,
    tone: "yellow",
  },
] satisfies ChapterMapVisual[];

export const lockedModuleIslandLabels = [
  {
    moduleGroupId: "banjir",
    eyebrow: "Pulau berikutnya",
    tone: "sky",
  },
  {
    moduleGroupId: "tsunami",
    eyebrow: "Zona pesisir",
    tone: "teal",
  },
  {
    moduleGroupId: "mitigasi-nusantara",
    eyebrow: "Eksplorasi budaya",
    tone: "purple",
  },
] satisfies {
  moduleGroupId: LearningModuleGroup["id"];
  eyebrow: string;
  tone: "sky" | "teal" | "purple";
}[];

export function getChapterMapVisual(chapterKind: ChapterKind) {
  return (
    chapterMapVisuals.find((visual) => visual.chapterKind === chapterKind) ??
    chapterMapVisuals[0]
  );
}
