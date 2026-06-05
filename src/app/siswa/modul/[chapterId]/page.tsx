import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ChapterDetail } from "@/features/student-learning/components/ChapterDetail";
import {
  gempaChapters,
  gempaLessonsChapter1,
  gempaLessonsStub,
} from "@/features/student-learning/data/mockData";
import type { LessonNode } from "@/features/student-learning/types";

interface ChapterPageProps {
  params: Promise<{ chapterId: string }>;
}

// All lessons across both chapter1 deep and stubs
const allLessons: LessonNode[] = [...gempaLessonsChapter1, ...gempaLessonsStub];

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapterId } = await params;
  const chapter = gempaChapters.find((c) => c.id === chapterId);
  if (!chapter) notFound();

  const lessons = allLessons.filter((l) => l.chapterId === chapterId);

  return (
    <main className="min-h-screen bg-cream-50 pb-16">
      {/* Back nav */}
      <div className="bg-white border-b border-lavender-200/60 px-4 pt-4 pb-3">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/siswa/modul"
            className="inline-flex items-center gap-1.5 text-purple-600 font-sans text-sm font-semibold hover:text-purple-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Peta Modul
          </Link>
        </div>
      </div>

      {/* Chapter header */}
      <div className="bg-white px-4 pt-5 pb-6 border-b border-lavender-200/40">
        <div className="max-w-2xl mx-auto">
          <p className="font-sans text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">
            Gempa Bumi
          </p>
          <h1 className="font-heading text-2xl font-bold text-ink-900">{chapter.title}</h1>
          <p className="font-sans text-sm text-ink-700 mt-1">
            {chapter.contentTopics.length} topik &middot; {chapter.reward.label}
          </p>
        </div>
      </div>

      {/* Chapter detail */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <ChapterDetail chapter={chapter} lessons={lessons} />
      </div>
    </main>
  );
}
