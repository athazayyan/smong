"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import type { ChapterStatus, ModuleChapter, ModuleProgress } from "@/features/student-learning/types";
import { getChapterMapVisual } from "@/features/student-learning/data/visualConfig";
import { ChapterNode } from "./ChapterNode";

interface ChapterMapProps {
  chapters: ModuleChapter[];
  progress: ModuleProgress;
  onChapterSelect?: (chapterId: string) => void;
}

export function ChapterMap({ chapters, progress, onChapterSelect }: ChapterMapProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || !sectionRef.current) return;

    const root = sectionRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-chapter-node]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.06 }
      );
      gsap.fromTo(
        "[data-map-thread]",
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 1.1, ease: "power3.out", delay: 0.12 }
      );
    }, root);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/62 p-5 shadow-[0_14px_42px_rgba(47,23,110,0.06)] md:p-8"
    >
      <div className="pointer-events-none absolute -right-24 top-16 h-64 w-[48%] smong-river bg-lavender-100/26" />
      <div className="relative mb-8 max-w-2xl">
        <p className="inline-flex rounded-full bg-lavender-100/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
          Peta Misi Gempa
        </p>
        <h2 className="mt-4 font-heading text-4xl font-black leading-tight text-ink-900 md:text-5xl">
          Jalur belajar yang rapi
        </h2>
        <p className="mt-2 text-sm font-semibold leading-7 text-ink-700">
          Selesaikan bab dari atas ke bawah. Setiap fase tetap terlihat, tanpa node yang saling menumpuk.
        </p>
      </div>

      <div className="relative">
        <div data-map-thread className="pointer-events-none absolute bottom-10 left-8 top-6 hidden w-1 rounded-full bg-purple-900/16 md:block" />
        <div className="grid gap-4">
          {chapters.map((chapter, index) => (
            <ChapterNode
              key={chapter.id}
              chapter={chapter}
              displayStatus={getChapterDisplayStatus(chapter, index, progress)}
              index={index}
              visual={getChapterMapVisual(chapter.kind)}
              onClick={onChapterSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getChapterDisplayStatus(
  chapter: ModuleChapter,
  index: number,
  progress: ModuleProgress
): ChapterStatus {
  if (progress.completedChapterIds.includes(chapter.id)) return "completed";
  if (index === progress.completedChapterIds.length) return "active";
  if (index === progress.completedChapterIds.length + 1) return "available";
  return "locked";
}
