import type {
  StudentActivityPreviewItem,
  StudentDisasterModuleCard,
  StudentHeroStat,
  StudentModulePreviewNode,
  StudentRewardShelfItem,
  StudentVisualAsset,
} from "../types";

export const studentMascotAsset = {
  src: "/assets/landing/mascot-smong-landing-guide.png",
  alt: "Maskot Smong memberi arahan misi siaga",
  width: 1024,
  height: 1024,
  sizes: "(min-width: 768px) 220px, 180px",
} satisfies StudentVisualAsset;

export const studentHeroStats = [
  {
    id: "xp",
    label: "XP terkumpul",
    value: "1.250",
    iconName: "Zap",
  },
  {
    id: "streak",
    label: "Hari beruntun",
    value: "3",
    iconName: "Flame",
  },
  {
    id: "lessons",
    label: "Misi selesai",
    value: "4/12",
    iconName: "Route",
  },
] satisfies StudentHeroStat[];

export const studentModulePreviewNodes = [
  {
    id: "kenali-gempa",
    label: "Kenali Gempa",
    phaseLabel: "Pra-Bencana",
    kind: "intro",
    status: "completed",
    iconName: "BookOpen",
    desktopClassName: "left-[12%] top-[58%]",
    mobileOrder: 1,
  },
  {
    id: "tas-siaga",
    label: "Tas Siaga",
    phaseLabel: "Pra-Bencana",
    kind: "activity",
    status: "completed",
    iconName: "PackageCheck",
    desktopClassName: "left-[31%] top-[33%]",
    mobileOrder: 2,
  },
  {
    id: "berlindung",
    label: "Berlindung Dulu",
    phaseLabel: "Saat Bencana",
    kind: "lesson",
    status: "active",
    iconName: "ShieldCheck",
    desktopClassName: "left-[50%] top-[57%]",
    mobileOrder: 3,
  },
  {
    id: "simulasi-cepat",
    label: "Simulasi Cepat",
    phaseLabel: "Saat Bencana",
    kind: "pre-test",
    status: "locked",
    iconName: "MousePointerClick",
    desktopClassName: "left-[67%] top-[35%]",
    mobileOrder: 4,
  },
  {
    id: "gotong-royong",
    label: "Gotong Royong",
    phaseLabel: "Pascabencana",
    kind: "post-test",
    status: "locked",
    iconName: "HeartHandshake",
    desktopClassName: "left-[82%] top-[61%]",
    mobileOrder: 5,
  },
] satisfies StudentModulePreviewNode[];

export const studentDisasterModuleCards = [
  {
    id: "gempa-bumi",
    title: "Gempa Bumi",
    description: "Kenali tanda gempa, cara berlindung, dan pulih bersama.",
    status: "active",
    iconName: "ShieldCheck",
    tone: "purple",
    progressPercent: 35,
  },
  {
    id: "banjir",
    title: "Banjir",
    description: "Siapkan barang penting dan cari tempat aman saat air naik.",
    status: "coming-soon",
    iconName: "Waves",
    tone: "sky",
    progressPercent: 0,
  },
  {
    id: "tsunami",
    title: "Tsunami",
    description: "Pelajari tanda alam, rambu pesisir, dan jalur ke tempat tinggi.",
    status: "coming-soon",
    iconName: "MapPinned",
    tone: "teal",
    progressPercent: 0,
  },
] satisfies StudentDisasterModuleCard[];

export const studentActivityPreviewItems = [
  {
    id: "quick-quiz",
    title: "Kuis Cepat",
    description: "Jawab pertanyaan pendek dengan feedback langsung.",
    iconName: "CircleHelp",
    tone: "sky",
  },
  {
    id: "sort-bag",
    title: "Pilih Barang",
    description: "Susun isi tas siaga lewat interaksi singkat.",
    iconName: "PackageCheck",
    tone: "peach",
  },
  {
    id: "safe-check",
    title: "Cek Aman",
    description: "Tandai aksi yang perlu dilakukan setelah latihan.",
    iconName: "ListChecks",
    tone: "mint",
  },
] satisfies StudentActivityPreviewItem[];

export const studentRewardShelfItems = [
  {
    id: "xp",
    label: "Total XP",
    value: "1.250",
    helper: "Dari misi yang selesai",
    iconName: "Zap",
    tone: "sky",
  },
  {
    id: "streak",
    label: "Beruntun",
    value: "3 Hari",
    helper: "Belajar tanpa putus",
    iconName: "Flame",
    tone: "peach",
  },
  {
    id: "lesson-progress",
    label: "Pelajaran",
    value: "4/12",
    helper: "Menuju sertifikat",
    iconName: "ChartNoAxesColumnIncreasing",
    tone: "purple",
  },
] satisfies StudentRewardShelfItem[];
