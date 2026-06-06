export type UserRole = "student" | "teacher";

export type StudentLevel = "sd" | "smp";

export type SchoolSyncStatus =
  | "not-synced"
  | "checking-code"
  | "synced"
  | "invalid-code"
  | "expired-code"
  | "already-synced";

export type SchoolSummary = {
  id: string;
  name: string;
  city: string;
  province: string;
};

export type ModuleGroupId = "gempa-bumi" | "banjir" | "tsunami" | "mitigasi-nusantara";

export type StudentNavbarItem = {
  id: string;
  label: string;
  href: string;
  iconName: "Home" | "BookOpen" | "Map" | "Award" | "Camera" | "KeyRound" | "User";
  isVisible: boolean;
  placement: "primary" | "secondary" | "status-action";
  mobileSlot: "bottom" | "sheet" | "hidden-when-synced";
};

export type StudentNextAction =
  | {
      type: "continue-module";
      moduleGroupId: ModuleGroupId;
      lessonId: string;
      label: string;
    }
  | {
      type: "enter-school-code";
      label: string;
    }
  | {
      type: "open-ar-safety-lens";
      activityId: string;
      label: string;
    };

export type ModuleProgress = {
  xp: number;
  streakDays: number;
  completedLessons: number;
  totalLessons: number;
  earnedBadges: { id: string; name: string; iconUrl?: string }[];
};

export type StudentLandingSection =
  | {
      type: "hero";
      title: string;
      subtitle: string;
      primaryCtaLabel: string;
      secondaryCtaLabel: string;
    }
  | {
      type: "school-sync-prompt";
      isVisible: boolean;
      title: string;
      body: string;
      ctaLabel: string;
    }
  | {
      type: "daily-mission";
      activityId: string;
    }
  | {
      type: "module-path";
      moduleGroupId: ModuleGroupId;
    }
  | {
      type: "module-cards";
      moduleGroupIds: ModuleGroupId[];
    }
  | {
      type: "progress-reward";
      moduleGroupId: ModuleGroupId;
    };

export type StudentLandingState = {
  userId: string;
  role: "student";
  displayName: string;
  level: StudentLevel;
  school?: SchoolSummary;
  schoolSyncStatus: SchoolSyncStatus;
  activeModuleId: ModuleGroupId;
  nextAction: StudentNextAction;
  progress: ModuleProgress;
  navbarItems: StudentNavbarItem[];
  sections: StudentLandingSection[];
};

export type StudentVisualAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
};

export type StudentHeroStat = {
  id: "xp" | "streak" | "lessons";
  label: string;
  value: string;
  iconName: "Zap" | "Flame" | "Route";
};

export type StudentPreviewNodeStatus = "completed" | "active" | "locked";

export type StudentPreviewNodeKind =
  | "intro"
  | "pre-test"
  | "lesson"
  | "activity"
  | "checkpoint"
  | "post-test";

export type StudentModulePreviewNode = {
  id: string;
  label: string;
  phaseLabel: "Pra-Bencana" | "Saat Bencana" | "Pascabencana";
  kind: StudentPreviewNodeKind;
  status: StudentPreviewNodeStatus;
  iconName: "BookOpen" | "ShieldCheck" | "PackageCheck" | "MousePointerClick" | "HeartHandshake" | "Award";
  desktopClassName: string;
  mobileOrder: number;
};

export type StudentDisasterModuleCard = {
  id: ModuleGroupId;
  title: string;
  description: string;
  status: "active" | "coming-soon";
  iconName: "ShieldCheck" | "Waves" | "MapPinned" | "Lock";
  tone: "purple" | "sky" | "teal" | "yellow";
  progressPercent: number;
};

export type StudentActivityPreviewItem = {
  id: "quick-quiz" | "sort-bag" | "safe-check";
  title: string;
  description: string;
  iconName: "CircleHelp" | "PackageCheck" | "ListChecks";
  tone: "sky" | "peach" | "mint";
};

export type StudentRewardShelfItem = {
  id: "xp" | "streak" | "lesson-progress";
  label: string;
  value: string;
  helper: string;
  iconName: "Zap" | "Flame" | "ChartNoAxesColumnIncreasing";
  tone: "sky" | "peach" | "purple";
};
