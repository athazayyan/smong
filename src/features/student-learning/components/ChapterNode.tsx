"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Heart,
  Lock,
  Shield,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ChapterMapVisual,
  ChapterStatus,
  ModuleChapter,
} from "@/features/student-learning/types";

interface ChapterNodeProps {
  chapter: ModuleChapter;
  displayStatus: ChapterStatus;
  index: number;
  visual: ChapterMapVisual;
}

export function ChapterNode({ chapter, displayStatus, index, visual }: ChapterNodeProps) {
  const shouldReduceMotion = useReducedMotion();
  const isLocked = displayStatus === "locked";
  const isActive = displayStatus === "active";

  const content = (
    <motion.div
      animate={isActive && !shouldReduceMotion ? { x: [0, 3, 0] } : {}}
      transition={isActive ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : {}}
      className={cn(
        "group relative grid items-center gap-4 border bg-white/68 p-4 shadow-sm backdrop-blur transition md:grid-cols-[72px_1fr_auto]",
        "smong-slab-soft",
        isActive ? "border-purple-700/22" : "border-purple-700/8",
        isLocked ? "opacity-58" : "hover:bg-white/86"
      )}
    >
      <div className="relative flex items-center gap-3 md:block">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/80",
            getNodeClassName(displayStatus, visual.tone)
          )}
        >
          {displayStatus === "completed" ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : isLocked ? (
            <Lock className="h-6 w-6" />
          ) : (
            renderChapterIcon(chapter.kind)
          )}
        </div>
        <span className="absolute -right-1 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white font-heading text-xs font-black text-purple-700 shadow-sm md:flex">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-purple-700">
            {visual.phaseLabel}
          </p>
          {chapter.preTestId ? <TinyFlag label="Pre-test" /> : null}
          {chapter.postTestId ? <TinyFlag label="Post-test" /> : null}
        </div>
        <p className={cn("font-heading text-2xl font-black leading-tight", isLocked ? "text-ink-400" : "text-ink-900")}>
          {chapter.shortLabel}
        </p>
        <p className={cn("mt-1 text-sm font-semibold leading-6", isLocked ? "text-ink-400" : "text-ink-700")}>
          {getChapterActionText(chapter, displayStatus)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <p className={cn("font-heading text-sm font-black", isLocked ? "text-ink-400" : "text-purple-700")}>
          {chapter.reward.label}
        </p>
        {!isLocked ? (
          <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-purple-900 text-white transition group-hover:translate-x-0.5">
            <BookOpen className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </motion.div>
  );

  if (isLocked) {
    return <div data-chapter-node>{content}</div>;
  }

  return (
    <Link data-chapter-node href={`/siswa/modul/${chapter.id}`} className="block">
      {content}
    </Link>
  );
}

function TinyFlag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-lavender-100/72 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-purple-700">
      {label}
    </span>
  );
}

function renderChapterIcon(kind: ModuleChapter["kind"]) {
  const className = "h-7 w-7";
  if (kind === "knowledge") return <BookOpen className={className} />;
  if (kind === "cause") return <Zap className={className} />;
  if (kind === "preparedness") return <Shield className={className} />;
  if (kind === "during-disaster") return <Shield className={className} />;
  if (kind === "after-disaster") return <Heart className={className} />;
  if (kind === "impact-and-reflection") return <BarChart2 className={className} />;
  if (kind === "certification") return <Trophy className={className} />;
  return <Award className={className} />;
}

function getNodeClassName(status: ChapterStatus, tone: ChapterMapVisual["tone"]) {
  if (status === "completed") return "bg-purple-900 text-white";
  if (status === "active") return "bg-purple-900 text-white shadow-[0_8px_0_#20104f]";
  if (status === "available") return tone === "teal" ? "bg-mint-100 text-teal-700" : "bg-lavender-100 text-purple-700";
  return "bg-lavender-100/70 text-ink-400";
}

function getChapterActionText(chapter: ModuleChapter, status: ChapterStatus) {
  if (status === "completed") return "Selesai dan tersimpan di progressmu.";
  if (status === "active" && chapter.preTestId) return "Mulai dengan cek awal, lalu lanjut ke misi pendek.";
  if (status === "active") return "Bab aktif. Pilih misi pertama untuk lanjut.";
  if (status === "available") return "Sudah bisa dibuka setelah bab aktif selesai.";
  return "Selesaikan jalur sebelumnya untuk membuka bab ini.";
}
