import { notFound } from "next/navigation";
import Link from "next/link";
import { LessonActivityRunner } from "@/features/student-learning/components/LessonActivityRunner";
import {
  gempaChapters,
  gempaLessonsChapter1,
  gempaLessonsStub,
  gempaActivitiesChapter1,
  gempaActivitiesChapter2to7,
} from "@/features/student-learning/data/mockData";
import type { LessonNode, Activity } from "@/features/student-learning/types";

interface LessonPageProps {
  params: Promise<{ chapterId: string; lessonId: string }>;
}

const allLessons: LessonNode[] = [...gempaLessonsChapter1, ...gempaLessonsStub];
const allActivities: Activity[] = [...gempaActivitiesChapter1, ...gempaActivitiesChapter2to7];

export default async function LessonPage({ params }: LessonPageProps) {
  const { chapterId, lessonId } = await params;

  const chapter = gempaChapters.find((c) => c.id === chapterId);
  const lesson = allLessons.find((l) => l.id === lessonId);

  if (!chapter || !lesson) {
    notFound();
  }

  // Resolve activities for this lesson
  const lessonActivities = lesson.activityIds
    .map((aId) => allActivities.find((a) => a.id === aId))
    .filter((a): a is Activity => a !== undefined);

  if (lessonActivities.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream-50 p-8">
        <p className="font-sans text-ink-700 text-center">Misi ini belum tersedia.</p>
        <Link href={`/siswa/modul/${chapterId}`} className="text-purple-600 font-bold text-sm">
          Kembali ke Bab
        </Link>
      </main>
    );
  }

  return (
    <LessonActivityRunner
      chapterId={chapterId}
      chapterShortLabel={chapter.shortLabel}
      lessonTitle={lesson.title}
      lessonShortDescription={lesson.shortDescription}
      activities={lessonActivities}
    />
  );
}
