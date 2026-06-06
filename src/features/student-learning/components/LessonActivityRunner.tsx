"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { ActivityRenderer } from "@/features/student-learning/components/ActivityRenderer";
import type { Activity } from "@/features/student-learning/types";

interface LessonActivityRunnerProps {
  chapterId: string;
  chapterShortLabel: string;
  lessonTitle: string;
  lessonShortDescription: string;
  activities: Activity[];
}

export function LessonActivityRunner({
  chapterId,
  chapterShortLabel,
  lessonTitle,
  lessonShortDescription,
  activities,
}: LessonActivityRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const currentActivity = activities[currentIndex];
  const isLast = currentIndex === activities.length - 1;

  const handleComplete = (xp: number) => {
    setXpEarned((prev) => prev + xp);
    if (isLast) {
      setIsDone(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-cream-50 pb-28 md:pb-16">
      <div className="sticky top-[82px] z-40 border-b border-lavender-200/60 bg-white/92 px-4 pb-3 pt-3 backdrop-blur md:top-0 md:pt-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link
            href={`/siswa/modul/${chapterId}`}
            className="inline-flex min-h-11 items-center gap-1.5 font-sans text-sm font-semibold text-purple-600 transition-colors hover:text-purple-800"
          >
            <ChevronLeft className="h-4 w-4" />
            {chapterShortLabel}
          </Link>
          <span className="font-sans text-xs text-ink-700/60">
            {currentIndex + 1} / {activities.length}
          </span>
        </div>
        <div className="mx-auto mt-3 max-w-lg">
          <div className="h-2 w-full overflow-hidden rounded-full bg-lavender-200/40">
            <div
              className="h-full rounded-full bg-linear-to-r from-purple-500 to-teal-500 transition-all duration-500"
              style={{
                width: `${Math.round(((currentIndex + (isDone ? 1 : 0)) / activities.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-4 pt-5 sm:pt-6">
        <h1 className="font-heading text-xl font-bold leading-tight text-ink-900 sm:text-2xl">{lessonTitle}</h1>
        <p className="mt-1 font-sans text-sm text-ink-700">{lessonShortDescription}</p>
      </div>

      <div className="mx-auto max-w-lg px-4">
        {!isDone && currentActivity ? (
          <div className="rounded-3xl bg-cream-50">
            <ActivityRenderer
              key={currentActivity.id}
              activity={currentActivity}
              onComplete={handleComplete}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 ring-4 ring-teal-200">
              <Zap className="h-10 w-10 text-teal-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink-900">Misi Selesai!</h2>
              <p className="mt-2 font-sans text-sm text-ink-700">
                Kamu berhasil menyelesaikan &ldquo;{lessonTitle}&rdquo;.
              </p>
              {xpEarned > 0 ? (
                <p className="mt-2 font-heading text-lg font-bold text-yellow-600">
                  +{xpEarned} XP
                </p>
              ) : null}
            </div>
            <Link
              href={`/siswa/modul/${chapterId}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-purple-700 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-purple-600"
            >
              Lanjut ke Bab
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
