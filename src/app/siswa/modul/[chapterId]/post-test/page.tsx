import { notFound } from "next/navigation";
import { LearningTestRunner } from "@/features/student-learning/components/LearningTestRunner";
import { getLearningTestPageData } from "@/features/student-learning/data/testPageData";

interface PostTestPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function PostTestPage({ params }: PostTestPageProps) {
  const { chapterId } = await params;
  const pageData = getLearningTestPageData(chapterId, "post-test");

  if (!pageData) notFound();

  return (
    <LearningTestRunner
      chapter={pageData.chapter}
      test={pageData.test}
      questions={pageData.questions}
    />
  );
}
