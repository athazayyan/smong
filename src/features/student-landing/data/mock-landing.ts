import {
  StudentLandingState,
  StudentNavbarItem,
  ModuleProgress,
} from "../types";

export const studentNavbarItems = [
  {
    id: "home",
    label: "Beranda",
    href: "/siswa",
    iconName: "Home",
    isVisible: true,
  },
  {
    id: "modules",
    label: "Modul",
    href: "/siswa/modul",
    iconName: "BookOpen",
    isVisible: true,
  },
  {
    id: "missions",
    label: "Misi",
    href: "/siswa/misi",
    iconName: "Map",
    isVisible: true,
  },
  {
    id: "badges",
    label: "Badge",
    href: "/siswa/badge",
    iconName: "Award",
    isVisible: true,
  },
  {
    id: "ar-lens",
    label: "AR Safety Lens",
    href: "/siswa/ar",
    iconName: "Camera",
    isVisible: true,
  },
  {
    id: "school-code",
    label: "Masukkan Kode",
    href: "/siswa/kode-sekolah",
    iconName: "KeyRound",
    isVisible: true, // Will be controlled conditionally based on state later
  },
  {
    id: "profile",
    label: "Profil",
    href: "/siswa/profil",
    iconName: "User",
    isVisible: true,
  },
] satisfies StudentNavbarItem[];

export const mockStudentGempaProgress: ModuleProgress = {
  xp: 1250,
  streakDays: 3,
  completedLessons: 4,
  totalLessons: 12,
  earnedBadges: [
    { id: "badge-gempa-1", name: "Pendeteksi Gempa" },
    { id: "badge-gempa-2", name: "Siap Sedia" },
  ],
};

export const mockStudentLandingState: StudentLandingState = {
  userId: "student-001",
  role: "student",
  displayName: "Rina",
  level: "sd",
  schoolSyncStatus: "not-synced",
  activeModuleId: "gempa-bumi",
  nextAction: {
    type: "continue-module",
    moduleGroupId: "gempa-bumi",
    lessonId: "gempa-kenali-gempa",
    label: "Lanjutkan Misi",
  },
  progress: mockStudentGempaProgress,
  navbarItems: studentNavbarItems,
  sections: [
    {
      type: "hero",
      title: "Mulai Misi Siaga Hari Ini",
      subtitle:
        "Belajar langkah aman lewat jalur misi, pilihan cepat, dan cerita yang mudah dipahami.",
      primaryCtaLabel: "Lanjutkan Misi",
      secondaryCtaLabel: "Lihat Modul",
    },
    {
      type: "school-sync-prompt",
      isVisible: true,
      title: "Punya kode dari guru?",
      body: "Masukkan kode sekolah agar progresmu tersambung dengan guru. Kamu tetap bisa belajar tanpa kode.",
      ctaLabel: "Masukkan Kode",
    },
    {
      type: "daily-mission",
      activityId: "mission-daily-1",
    },
    {
      type: "module-path",
      moduleGroupId: "gempa-bumi",
    },
    {
      type: "module-cards",
      moduleGroupIds: ["gempa-bumi", "banjir", "tsunami"],
    },
    {
      type: "progress-reward",
      moduleGroupId: "gempa-bumi",
    },
  ],
};
