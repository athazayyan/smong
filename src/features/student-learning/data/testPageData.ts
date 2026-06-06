import type { LearningTest, ModuleChapter, TestKind, TestQuestion } from "../types";
import { gempaChapters, gempaTestQuestions, gempaTests } from "./mockData";

export type ResolvedLearningTestPageData = {
  chapter: ModuleChapter;
  test: LearningTest;
  questions: TestQuestion[];
};

export function getLearningTestPageData(
  chapterId: string,
  testKind: Extract<TestKind, "pre-test" | "post-test">
): ResolvedLearningTestPageData | undefined {
  const chapter = gempaChapters.find((candidate) => candidate.id === chapterId);
  if (!chapter) return undefined;

  const testId = testKind === "pre-test" ? chapter.preTestId : chapter.postTestId;
  if (!testId) return undefined;

  const test = gempaTests.find((candidate) => candidate.id === testId);
  if (!test) return undefined;

  const questions = test.questionIds
    .map((questionId) => gempaTestQuestions.find((question) => question.id === questionId))
    .filter((question): question is TestQuestion => question !== undefined);

  if (questions.length === 0) return undefined;

  return {
    chapter,
    test,
    questions,
  };
}
