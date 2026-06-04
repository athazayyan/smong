export type DisasterPhaseId =
  | "pra-bencana"
  | "saat-bencana"
  | "pascabencana";

export type LessonStatus =
  | "locked"
  | "available"
  | "active"
  | "completed"
  | "mastered";

export type ActivityType =
  | "visual-quiz"
  | "tap-to-identify"
  | "drag-and-drop"
  | "decision-simulation"
  | "quick-response"
  | "checklist"
  | "reflection-choice";

export type RewardType = "xp" | "star" | "badge" | "unlock";

export type MotionPreset =
  | "node-bounce"
  | "active-pulse"
  | "locked-wiggle"
  | "path-glow"
  | "answer-pop"
  | "retry-shake"
  | "badge-burst"
  | "mascot-idle"
  | "ribbon-transition";

export type MascotMood =
  | "guide"
  | "happy"
  | "thinking"
  | "encouraging"
  | "celebrating";

export type BadgeId =
  | "siaga-pemula"
  | "penjaga-kepala"
  | "teman-tangguh"
  | "pahlawan-evakuasi";

export type Reward = {
  id: string;
  type: RewardType;
  label: string;
  xpAmount: number;
  badgeId?: BadgeId;
};

export type LessonNode = {
  id: string;
  phaseId: DisasterPhaseId;
  title: string;
  shortDescription: string;
  status: LessonStatus;
  activityIds: string[];
  reward: Reward;
  motionPreset: MotionPreset;
};

export type ModulePhase = {
  id: DisasterPhaseId;
  title: string;
  goal: string;
  lessonIds: string[];
  checkpointBadgeId: BadgeId;
};

export type Module = {
  id: string;
  title: string;
  disasterTopic: "gempa-bumi";
  targetAudience: "sd-smp";
  phaseIds: DisasterPhaseId[];
  activeLessonId: string;
};

export type Badge = {
  id: BadgeId;
  label: string;
  description: string;
  unlocked: boolean;
};

export type StudentProgress = {
  studentId: string;
  moduleId: string;
  completedLessonIds: string[];
  unlockedBadgeIds: BadgeId[];
  xpTotal: number;
  streakDays: number;
};

export type VisualQuizActivity = {
  id: string;
  type: "visual-quiz";
  lessonId: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    imageAlt: string;
    isCorrect: boolean;
  }[];
  successFeedback: string;
  retryFeedback: string;
};

export type DecisionSimulationActivity = {
  id: string;
  type: "decision-simulation";
  lessonId: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  successFeedback: string;
  retryFeedback: string;
};

export type DragAndDropActivity = {
  id: string;
  type: "drag-and-drop";
  lessonId: string;
  prompt: string;
  draggableItems: {
    id: string;
    label: string;
    belongsInDropZone: boolean;
  }[];
  dropZoneLabel: string;
  successFeedback: string;
  retryFeedback: string;
};

export type ChecklistActivity = {
  id: string;
  type: "checklist";
  lessonId: string;
  prompt: string;
  items: {
    id: string;
    label: string;
  }[];
  successFeedback: string;
  retryFeedback: string;
};

export type ReflectionChoiceActivity = {
  id: string;
  type: "reflection-choice";
  lessonId: string;
  prompt: string;
  options: {
    id: string;
    label: string;
  }[];
  successFeedback: string;
  retryFeedback: string;
};

export type Activity = 
  | VisualQuizActivity 
  | DecisionSimulationActivity 
  | DragAndDropActivity 
  | ChecklistActivity
  | ReflectionChoiceActivity;
