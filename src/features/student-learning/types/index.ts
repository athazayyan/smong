// ─────────────────────────────────────────────────────────────────────────────
// SMONG: Student Learning Module Types (V2)
// Source of truth: scripts/MODUL.md Section 18
// Rules: No any, unknown, object, {}, Function, or unsafe casts.
//        Prefer discriminated unions and literal types.
// ─────────────────────────────────────────────────────────────────────────────

// ─── User & School ───────────────────────────────────────────────────────────

export type UserRole = "student" | "teacher";

export type SchoolCodeStatus = "active" | "expired" | "disabled";

export type SchoolSyncStatus =
  | "not-synced"
  | "checking"
  | "synced"
  | "invalid-code"
  | "expired-code"
  | "already-synced";

export type SchoolCode = {
  id: string;
  code: string;
  schoolId: string;
  generatedByTeacherId: string;
  status: SchoolCodeStatus;
  usedCount: number;
  maxUses?: number;
  expiresAtClientMs?: number;
};

export type StudentSchoolMembership = {
  id: string;
  studentId: string;
  schoolId: string;
  sourceCodeId: string;
  joinedAtClientMs: number;
  status: "active" | "left";
};

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
  displayName: string;
  schoolMembershipId?: string;
};

export type SchoolSummary = {
  id: string;
  name: string;
  city: string;
  province: string;
};

// ─── Module Group ─────────────────────────────────────────────────────────────

export type DisasterTopicId = "gempa-bumi" | "banjir" | "tsunami";

export type ModuleGroupId = DisasterTopicId | "mitigasi-nusantara";

export type ModuleAvailability = "active" | "locked" | "coming-soon";

export type TargetAudience = "sd" | "smp" | "sd-smp";

export type LearningModuleGroup = {
  id: ModuleGroupId;
  title: string;
  description: string;
  availability: ModuleAvailability;
  targetAudience: TargetAudience;
  chapterIds: string[];
  rewardBadgeIds: BadgeId[];
};

// ─── Chapter ─────────────────────────────────────────────────────────────────

export type ChapterKind =
  | "knowledge"
  | "cause"
  | "preparedness"
  | "during-disaster"
  | "after-disaster"
  | "impact-and-reflection"
  | "certification"
  | "regional-exploration";

export type ChapterStatus = "locked" | "available" | "active" | "completed";

export type ModuleChapter = {
  id: string;
  moduleGroupId: ModuleGroupId;
  kind: ChapterKind;
  title: string;
  shortLabel: string;
  learningGoals: string[];
  contentTopics: string[];
  lessonIds: string[];
  preTestId?: string;
  postTestId?: string;
  requiredScore?: number;
  status: ChapterStatus;
  reward: Reward;
};

// ─── Lesson ───────────────────────────────────────────────────────────────────

export type LessonNode = {
  id: string;
  chapterId: string;
  moduleGroupId: ModuleGroupId;
  title: string;
  shortDescription: string;
  activityIds: string[];
  status: ChapterStatus;
  estimatedMinutes: number;
  reward: Reward;
  mascotPrompt: string;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

export type TestKind = "pre-test" | "post-test" | "final-quiz";

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "drag-and-drop"
  | "scenario-choice"
  | "sequencing";

export type TestStatus = "not-started" | "in-progress" | "passed" | "needs-retry";

export type LearningTest = {
  id: string;
  moduleGroupId: ModuleGroupId;
  chapterId?: string;
  kind: TestKind;
  title: string;
  requiredScore?: number;
  questionIds: string[];
};

export type TestQuestion = {
  id: string;
  testId: string;
  type: QuestionType;
  prompt: string;
  points: number;
  explanation: string;
};

// ─── Activities ───────────────────────────────────────────────────────────────

export type ActivityType =
  | "flashcard"
  | "infographic-carousel"
  | "visual-quiz"
  | "true-false"
  | "drag-and-drop"
  | "tap-to-identify"
  | "checklist"
  | "decision-simulation"
  | "branching-decision"
  | "sequencing"
  | "matching"
  | "reflection-choice"
  | "animated-simulation"
  | "ar-safety-lens";

// ── Flashcard ────────────────────────────────────────────────────────────────

export type FlashcardActivity = {
  id: string;
  type: "flashcard";
  lessonId: string;
  prompt: string;
  front: string;
  back: string;
  successFeedback: string;
};

// ── True/False ───────────────────────────────────────────────────────────────

export type TrueFalseActivity = {
  id: string;
  type: "true-false";
  lessonId: string;
  prompt: string;
  statement: string;
  isTrue: boolean;
  successFeedback: string;
  retryFeedback: string;
};

// ── Visual Quiz ───────────────────────────────────────────────────────────────

export type VisualQuizOption = {
  id: string;
  label: string;
  imageAlt: string;
  isCorrect: boolean;
};

export type VisualQuizActivity = {
  id: string;
  type: "visual-quiz";
  lessonId: string;
  prompt: string;
  options: VisualQuizOption[];
  successFeedback: string;
  retryFeedback: string;
};

// ── Decision Simulation ───────────────────────────────────────────────────────

export type DecisionOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
};

export type DecisionSimulationActivity = {
  id: string;
  type: "decision-simulation";
  lessonId: string;
  prompt: string;
  options: DecisionOption[];
  successFeedback: string;
  retryFeedback: string;
};

// ── Drag and Drop ─────────────────────────────────────────────────────────────

export type DraggableItem = {
  id: string;
  label: string;
  belongsInDropZone: boolean;
};

export type DragAndDropActivity = {
  id: string;
  type: "drag-and-drop";
  lessonId: string;
  prompt: string;
  draggableItems: DraggableItem[];
  dropZoneLabel: string;
  successFeedback: string;
  retryFeedback: string;
};

// ── Checklist ─────────────────────────────────────────────────────────────────

export type ChecklistItem = {
  id: string;
  label: string;
};

export type ChecklistActivity = {
  id: string;
  type: "checklist";
  lessonId: string;
  prompt: string;
  items: ChecklistItem[];
  successFeedback: string;
  retryFeedback: string;
};

// ── Reflection Choice ─────────────────────────────────────────────────────────

export type ReflectionOption = {
  id: string;
  label: string;
};

export type ReflectionChoiceActivity = {
  id: string;
  type: "reflection-choice";
  lessonId: string;
  prompt: string;
  options: ReflectionOption[];
  successFeedback: string;
  retryFeedback: string;
};

// ── Activity Discriminated Union ──────────────────────────────────────────────

export type Activity =
  | FlashcardActivity
  | TrueFalseActivity
  | VisualQuizActivity
  | DecisionSimulationActivity
  | DragAndDropActivity
  | ChecklistActivity
  | ReflectionChoiceActivity;

// ─── Rewards ─────────────────────────────────────────────────────────────────

export type BadgeId =
  | "siaga-gempa"
  | "ahli-evakuasi"
  | "mitigator-muda"
  | "penjelajah-nusantara";

export type RewardType = "xp" | "star" | "badge" | "certificate-preview" | "unlock";

export type Reward = {
  id: string;
  type: RewardType;
  label: string;
  xpAmount: number;
  badgeId?: BadgeId;
};

// ─── Progress ─────────────────────────────────────────────────────────────────

export type CertificateStatus = "locked" | "eligible-preview" | "issued";

export type TestResult = {
  testId: string;
  kind: TestKind;
  score: number;
  status: TestStatus;
  completedAtClientMs?: number;
};

export type ModuleProgress = {
  studentId: string;
  moduleGroupId: ModuleGroupId;
  completedChapterIds: string[];
  completedLessonIds: string[];
  completedActivityIds: string[];
  testResults: TestResult[];
  unlockedBadgeIds: BadgeId[];
  xpTotal: number;
  streakDays: number;
  level: number;
  certificateStatus: CertificateStatus;
};

// ─── Motion & UI Presets (non-data, purely UI) ────────────────────────────────

export type MotionPreset =
  | "chapter-reveal"
  | "active-glow"
  | "node-pop"
  | "locked-soft"
  | "reward-burst"
  | "badge-unlock"
  | "cert-reveal"
  | "progress-fill"
  | "mascot-idle"
  | "flashcard-flip"
  | "drag-snap"
  | "answer-pop"
  | "retry-nudge";

export type MascotMood =
  | "guide"
  | "happy"
  | "thinking"
  | "encouraging"
  | "celebrating";

export type ChapterMapPhase = "pra-bencana" | "saat-bencana" | "pascabencana" | "sertifikasi";

export type ChapterMapTone = "teal" | "yellow" | "purple" | "peach" | "sky";

export type ChapterMapVisual = {
  chapterKind: ChapterKind;
  phase: ChapterMapPhase;
  phaseLabel: "Pra-Bencana" | "Saat Bencana" | "Pascabencana" | "Sertifikasi";
  desktopClassName: string;
  mobileOrder: number;
  tone: ChapterMapTone;
};
