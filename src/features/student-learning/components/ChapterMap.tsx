"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { ModuleChapter } from "@/features/student-learning/types";
import { ChapterNode } from "./ChapterNode";

interface ChapterMapProps {
  chapters: ModuleChapter[];
}

// Wavy path connector between nodes
function PathConnector({ index }: { index: number }) {
  const flip = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 + index * 0.07 }}
      className="flex justify-center w-full my-1"
    >
      <svg
        width="96"
        height="40"
        viewBox="0 0 96 40"
        fill="none"
        className={flip ? "scale-x-[-1]" : ""}
      >
        <path
          d="M 8 5 Q 48 5 48 20 Q 48 35 88 35"
          stroke="#DDD2FF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 4"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}

export function ChapterMap({ chapters }: ChapterMapProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm mx-auto py-6 px-2 gap-2">
      {chapters.map((chapter, i) => (
        <React.Fragment key={chapter.id}>
          <ChapterNode chapter={chapter} index={i} />
          {i < chapters.length - 1 && <PathConnector index={i} />}
        </React.Fragment>
      ))}

      {/* End of path — Certificate node visual indicator */}
      <motion.div
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: chapters.length * 0.08 + 0.3 }}
        className="flex flex-col items-center gap-3 mt-6"
      >
        <div className="w-16 h-16 rounded-full bg-yellow-200/40 ring-4 ring-yellow-200 flex items-center justify-center shadow-sm">
          <Trophy className="w-8 h-8 text-yellow-700" />
        </div>
        <p className="font-sans text-xs font-semibold text-ink-700/60 text-center max-w-[160px]">
          Selesaikan semua bab untuk meraih Sertifikat Siaga Gempa
        </p>
      </motion.div>
    </div>
  );
}
