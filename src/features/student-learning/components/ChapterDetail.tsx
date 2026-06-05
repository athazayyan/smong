import React from "react";
import Link from "next/link";
import { Lock, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleChapter, LessonNode, ChapterStatus } from "@/features/student-learning/types";

interface ChapterDetailProps {
  chapter: ModuleChapter;
  lessons: LessonNode[];
}

const STATUS_DOT: Record<ChapterStatus, string> = {
  locked: "bg-lavender-200",
  available: "bg-purple-400",
  active: "bg-purple-700",
  completed: "bg-teal-500",
};

export function ChapterDetail({ chapter, lessons }: ChapterDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Chapter Header */}
      <div className="bg-white rounded-3xl ring-2 ring-lavender-200/60 p-6 shadow-sm">
        <p className="font-sans text-xs font-bold text-purple-500 uppercase tracking-wider mb-2">
          Tujuan Pembelajaran
        </p>
        <ul className="flex flex-col gap-2">
          {chapter.learningGoals.map((goal) => (
            <li key={goal} className="flex items-start gap-2 font-sans text-sm text-ink-700">
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              {goal}
            </li>
          ))}
        </ul>
      </div>

      {/* Pre-test entry — if chapter has one */}
      {chapter.preTestId && (
        <div className="bg-sky-100 rounded-2xl p-4 border border-sky-200 flex items-center justify-between">
          <div>
            <p className="font-heading text-sm font-bold text-ink-900">Pre-Test</p>
            <p className="font-sans text-xs text-ink-700 mt-0.5">
              Ukur pengetahuan awalmu sebelum belajar
            </p>
          </div>
          <Link
            href={`/siswa/modul/${chapter.id}/pre-test`}
            className="px-4 py-2 bg-purple-700 text-white font-bold text-sm rounded-xl shadow hover:bg-purple-600 transition-colors"
          >
            Mulai
          </Link>
        </div>
      )}

      {/* Lessons */}
      <div className="flex flex-col gap-3">
        <p className="font-heading text-base font-bold text-ink-900 px-1">Misi dalam Bab Ini</p>
        {lessons.map((lesson, i) => {
          const isLocked = lesson.status === "locked";
          const isActive = lesson.status === "active";
          return (
            <div
              key={lesson.id}
              className={cn(
                "flex items-center gap-4 bg-white rounded-2xl p-4 border transition-all",
                isLocked
                  ? "border-lavender-200/60 opacity-70"
                  : "border-lavender-200 shadow-sm hover:shadow-md"
              )}
            >
              {/* Node number */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-sm",
                  isLocked
                    ? "bg-lavender-200/40 text-ink-700/40"
                    : isActive
                    ? "bg-purple-700 text-white"
                    : "bg-teal-500 text-white"
                )}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : i + 1}
              </div>

              {/* Lesson info */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-heading text-sm font-bold truncate",
                    isLocked ? "text-ink-700/50" : "text-ink-900"
                  )}
                >
                  {lesson.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1 font-sans text-[10px] text-ink-700/60">
                    <Clock className="w-3 h-3" />
                    {lesson.estimatedMinutes} menit
                  </div>
                  <div className="flex items-center gap-1 font-sans text-[10px] font-semibold text-purple-600">
                    <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[lesson.status])} />
                    {lesson.reward.label}
                  </div>
                </div>
              </div>

              {/* Action */}
              {!isLocked && (
                <Link
                  href={`/siswa/modul/${chapter.id}/${lesson.id}`}
                  className={cn(
                    "shrink-0 p-2 rounded-xl transition-colors",
                    isActive
                      ? "bg-purple-700 text-white hover:bg-purple-600"
                      : "bg-lavender-200/40 text-purple-600 hover:bg-lavender-200"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Post-test entry */}
      {chapter.postTestId && (
        <div className="bg-mint-100 rounded-2xl p-4 border border-teal-200 flex items-center justify-between">
          <div>
            <p className="font-heading text-sm font-bold text-ink-900">Post-Test</p>
            <p className="font-sans text-xs text-ink-700 mt-0.5">
              Uji pemahamanmu setelah menyelesaikan semua misi
            </p>
          </div>
          <div className="px-4 py-2 bg-teal-200/60 text-teal-700 font-bold text-sm rounded-xl border border-teal-300">
            Selesaikan misi dulu
          </div>
        </div>
      )}
    </div>
  );
}
