import { StudentProgress, BadgeId } from "../types";

export const mockProgress: StudentProgress = {
  studentId: "student-raka-001",
  moduleId: "gempa-bumi-mvp",
  completedLessonIds: [],
  unlockedBadgeIds: [] as BadgeId[],
  xpTotal: 0,
  streakDays: 3,
};
