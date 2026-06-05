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

export type ModuleGroupId = "gempa-bumi" | "banjir" | "tsunami" | "mitigasi-nusantara" | string;

export type StudentNavbarItem = {
  id: string;
  label: string;
  href: string;
  iconName: "Home" | "BookOpen" | "Map" | "Award" | "Camera" | "KeyRound" | "User";
  isVisible: boolean;
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
