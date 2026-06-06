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
}

export function ChapterMap({ chapters, progress }: ChapterMapProps) {
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
      className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/58 p-5 shadow-[0_28px_80px_rgba(47,23,110,0.08)] md:rounded-[2.75rem] md:p-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-white/70 via-lavender-100/30 to-mint-100/36" />
      <div className="pointer-events-none absolute -right-20 top-16 h-64 w-[52%] smong-veil bg-mint-100/35" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-[60%] smong-river bg-lavender-100/32" />
      <div className="relative mb-8 max-w-2xl">
        <p className="inline-flex rounded-full border border-purple-700/10 bg-white/72 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
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
