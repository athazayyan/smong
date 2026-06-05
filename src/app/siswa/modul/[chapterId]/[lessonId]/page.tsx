"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { ActivityRenderer } from "@/features/student-learning/components/ActivityRenderer";
import {
  gempaChapters,
  gempaLessonsChapter1,
  gempaLessonsStub,
  gempaActivitiesChapter1,
  gempaActivitiesChapter2to7,
} from "@/features/student-learning/data/mockData";
import type { LessonNode, Activity } from "@/features/student-learning/types";

// Must be client because of useState for activity progression
// params resolved synchronously for client pages via use()
import { use } from "react";

interface LessonPageProps {
  params: Promise<{ chapterId: string; lessonId: string }>;
}

const allLessons: LessonNode[] = [...gempaLessonsChapter1, ...gempaLessonsStub];
const allActivities: Activity[] = [...gempaActivitiesChapter1, ...gempaActivitiesChapter2to7];

export default function LessonPage({ params }: LessonPageProps) {
  const { chapterId, lessonId } = use(params);

  const chapter = gempaChapters.find((c) => c.id === chapterId);
  const lesson = allLessons.find((l) => l.id === lessonId);

  if (!chapter || !lesson) {
    notFound();
  }

  // Resolve activities for this lesson
  const lessonActivities = lesson.activityIds
    .map((aId) => allActivities.find((a) => a.id === aId))
    .filter((a): a is Activity => a !== undefined);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const currentActivity = lessonActivities[currentIndex];
  const isLast = currentIndex === lessonActivities.length - 1;

  const handleComplete = (xp: number) => {
    setXpEarned((prev) => prev + xp);
    if (isLast) {
      setIsDone(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (lessonActivities.length === 0) {
    return (
      <main className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-8 gap-6">
        <p className="font-sans text-ink-700 text-center">Misi ini belum tersedia.</p>
        <Link href={`/siswa/modul/${chapterId}`} className="text-purple-600 font-bold text-sm">
          Kembali ke Bab
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 pb-16">
      {/* Top nav */}
      <div className="bg-white border-b border-lavender-200/60 px-4 pt-4 pb-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href={`/siswa/modul/${chapterId}`}
            className="inline-flex items-center gap-1.5 text-purple-600 font-sans text-sm font-semibold hover:text-purple-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {chapter.shortLabel}
          </Link>
          <span className="font-sans text-xs text-ink-700/60">
            {currentIndex + 1} / {lessonActivities.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-3">
          <div className="w-full h-2 bg-lavender-200/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(((currentIndex + (isDone ? 1 : 0)) / lessonActivities.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Lesson title */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <h1 className="font-heading text-xl font-bold text-ink-900">{lesson.title}</h1>
        <p className="font-sans text-sm text-ink-700 mt-1">{lesson.shortDescription}</p>
      </div>

      {/* Activity */}
      <div className="max-w-lg mx-auto px-4">
        {!isDone && currentActivity ? (
          <div className="bg-cream-50 rounded-3xl">
            <ActivityRenderer
              key={currentActivity.id}
              activity={currentActivity}
              onComplete={handleComplete}
            />
          </div>
        ) : (
          /* Completion screen */
          <div className="flex flex-col items-center gap-6 text-center py-12">
            <div className="w-20 h-20 rounded-full bg-teal-100 ring-4 ring-teal-200 flex items-center justify-center">
              <Zap className="w-10 h-10 text-teal-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink-900">Misi Selesai!</h2>
              <p className="font-sans text-sm text-ink-700 mt-2">
                Kamu berhasil menyelesaikan &ldquo;{lesson.title}&rdquo;.
              </p>
              {xpEarned > 0 && (
                <p className="font-heading text-lg font-bold text-yellow-600 mt-2">
                  +{xpEarned} XP
                </p>
              )}
            </div>
            <Link
              href={`/siswa/modul/${chapterId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-2xl shadow-md transition-colors"
            >
              Lanjut ke Bab
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
