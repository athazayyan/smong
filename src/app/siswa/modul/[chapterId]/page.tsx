import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Route, ShieldCheck } from "lucide-react";
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

const allLessons: LessonNode[] = [...gempaLessonsChapter1, ...gempaLessonsStub];

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapterId } = await params;
  const chapter = gempaChapters.find((c) => c.id === chapterId);
  if (!chapter) notFound();

  const lessons = allLessons.filter((l) => l.chapterId === chapterId);

  return (
    <main className="min-h-screen overflow-hidden bg-cream-50 pb-20">
      <section className="relative px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-20 smong-quiet-field" />
        <div className="mx-auto max-w-4xl">
          <Link
            href="/siswa/modul"
            className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-purple-700/10 bg-white/70 px-4 py-2 font-heading text-sm font-black text-purple-700 shadow-sm transition hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Peta Modul
          </Link>

          <div className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/58 p-6 shadow-[0_22px_70px_rgba(47,23,110,0.08)] md:rounded-[2.75rem] md:p-8">
            <div className="pointer-events-none absolute -right-20 -top-12 h-48 w-[48%] smong-veil bg-lavender-100/36" />
            <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-[58%] smong-river bg-mint-100/28" />
            <div className="pointer-events-none absolute right-8 top-10 hidden h-24 w-56 smong-thread opacity-55 md:block" />
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-lavender-100/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
              <ShieldCheck className="h-4 w-4" />
              Gempa Bumi
            </p>
            <h1 className="max-w-3xl font-heading text-4xl font-black leading-tight text-ink-900 md:text-6xl">
              {chapter.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/72 px-4 py-2 text-sm font-extrabold text-ink-700">
                <Route className="h-4 w-4 text-purple-700" />
                {chapter.contentTopics.length} topik
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/72 px-4 py-2 text-sm font-extrabold text-ink-700">
                {chapter.reward.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ChapterDetail chapter={chapter} lessons={lessons} />
      </div>
    </main>
  );
}
