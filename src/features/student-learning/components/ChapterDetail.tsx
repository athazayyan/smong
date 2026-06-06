import React from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronRight, Clock, FileCheck2, Lock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleChapter, LessonNode } from "@/features/student-learning/types";

interface ChapterDetailProps {
  chapter: ModuleChapter;
  lessons: LessonNode[];
}

export function ChapterDetail({ chapter, lessons }: ChapterDetailProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
      <section className="smong-slab-soft h-fit border border-purple-700/8 bg-white/58 p-6 shadow-sm backdrop-blur">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
          <Target className="h-4 w-4" />
          Tujuan
        </p>
        <ul className="grid gap-4">
          {chapter.learningGoals.map((goal) => (
            <li key={goal} className="flex items-start gap-3 text-sm font-semibold leading-7 text-ink-700">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-purple-700" />
              {goal}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        {chapter.preTestId ? (
          <TestGate
            title="Pre-Test"
            body="Cek pengetahuan awal sebelum masuk misi."
            href={`/siswa/modul/${chapter.id}/pre-test`}
            actionLabel="Mulai"
            state="ready"
          />
        ) : null}

        <div>
          <p className="mb-4 font-heading text-2xl font-black text-ink-900">Misi dalam bab ini</p>
          <div className="grid gap-3">
            {lessons.map((lesson, index) => (
              <LessonRow key={lesson.id} lesson={lesson} chapterId={chapter.id} index={index} />
            ))}
          </div>
        </div>

        {chapter.postTestId ? (
          <TestGate
            title="Post-Test"
            body="Uji pemahamanmu setelah semua misi selesai."
            actionLabel="Selesaikan misi dulu"
            state="locked"
          />
        ) : null}
      </section>
    </div>
  );
}

function LessonRow({ lesson, chapterId, index }: { lesson: LessonNode; chapterId: string; index: number }) {
  const isLocked = lesson.status === "locked";
  const isActive = lesson.status === "active";

  const content = (
    <div
      className={cn(
        "group grid items-center gap-4 border bg-white/66 p-4 shadow-sm backdrop-blur transition md:grid-cols-[56px_1fr_auto]",
        "smong-slab-soft",
        isActive ? "border-purple-700/20" : "border-purple-700/8",
        isLocked ? "opacity-55" : "hover:bg-white/86"
      )}
    >
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-[1rem]", isLocked ? "bg-lavender-100 text-ink-400" : "bg-purple-900 text-white")}>
        {isLocked ? <Lock className="h-5 w-5" /> : <span className="font-heading text-lg font-black">{index + 1}</span>}
      </div>

      <div className="min-w-0">
        <p className={cn("font-heading text-xl font-black leading-tight", isLocked ? "text-ink-400" : "text-ink-900")}>
          {lesson.title}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-extrabold text-ink-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {lesson.estimatedMinutes} menit
          </span>
          <span>{lesson.reward.label}</span>
        </div>
      </div>

      {!isLocked ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-purple-900 text-white transition group-hover:translate-x-0.5">
          <ChevronRight className="h-5 w-5" />
        </span>
      ) : null}
    </div>
  );

  if (isLocked) return content;

  return (
    <Link href={`/siswa/modul/${chapterId}/${lesson.id}`} className="block">
      {content}
    </Link>
  );
}

function TestGate({
  title,
  body,
  href,
  actionLabel,
  state,
}: {
  title: string;
  body: string;
  href?: string;
  actionLabel: string;
  state: "ready" | "locked";
}) {
  const content = (
    <div
      className={cn(
        "smong-slab-soft flex flex-col gap-4 border bg-white/62 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between",
        state === "ready" ? "border-purple-700/14" : "border-teal-700/14 opacity-82"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem]", state === "ready" ? "bg-purple-900 text-white" : "bg-mint-100 text-teal-700")}>
          {state === "ready" ? <BookOpen className="h-5 w-5" /> : <FileCheck2 className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-heading text-xl font-black text-ink-900">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-ink-700">{body}</p>
        </div>
      </div>
      <span className={cn("inline-flex justify-center rounded-full px-5 py-3 font-heading text-sm font-black", state === "ready" ? "bg-purple-900 text-white" : "bg-mint-100 text-teal-700")}>
        {actionLabel}
      </span>
    </div>
  );

  if (!href || state === "locked") return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
