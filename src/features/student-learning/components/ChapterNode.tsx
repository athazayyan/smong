"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Lock,
  BookOpen,
  Shield,
  Zap,
  Heart,
  BarChart2,
  Award,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleChapter, ChapterStatus } from "@/features/student-learning/types";

interface ChapterNodeProps {
  chapter: ModuleChapter;
  index: number;
}

const KIND_ICON: Record<ModuleChapter["kind"], React.ElementType> = {
  knowledge: BookOpen,
  cause: Zap,
  preparedness: Shield,
  "during-disaster": Shield,
  "after-disaster": Heart,
  "impact-and-reflection": BarChart2,
  certification: Trophy,
  "regional-exploration": Award,
};

const STATUS_STYLES: Record<
  ChapterStatus,
  { bg: string; ring: string; text: string; labelText: string }
> = {
  locked: {
    bg: "bg-lavender-200/40",
    ring: "ring-2 ring-lavender-200",
    text: "text-ink-700/40",
    labelText: "text-ink-700/50",
  },
  available: {
    bg: "bg-white",
    ring: "ring-2 ring-purple-400",
    text: "text-purple-600",
    labelText: "text-ink-900",
  },
  active: {
    bg: "bg-purple-700",
    ring: "ring-4 ring-purple-300",
    text: "text-white",
    labelText: "text-ink-900",
  },
  completed: {
    bg: "bg-teal-500",
    ring: "ring-2 ring-teal-300",
    text: "text-white",
    labelText: "text-ink-900",
  },
};

export function ChapterNode({ chapter, index }: ChapterNodeProps) {
  const shouldReduceMotion = useReducedMotion();
  const styles = STATUS_STYLES[chapter.status];
  const Icon = chapter.status === "completed" ? CheckCircle2 : KIND_ICON[chapter.kind];
  const isLocked = chapter.status === "locked";
  const isActive = chapter.status === "active";
  const isCertification = chapter.kind === "certification";

  // Alternate left/right for storybook path feel
  const alignRight = index % 2 === 1;

  const nodeSize = isCertification ? "w-24 h-24" : "w-18 h-18";
  const iconSize = isCertification ? "w-10 h-10" : "w-7 h-7";

  const nodeEl = (
    <motion.div
      animate={
        isActive && !shouldReduceMotion
          ? {
              boxShadow: [
                "0 0 0 0px rgba(91,59,181,0.4)",
                "0 0 0 14px rgba(91,59,181,0)",
                "0 0 0 0px rgba(91,59,181,0)",
              ],
            }
          : {}
      }
      transition={isActive ? { duration: 2, repeat: Infinity } : {}}
      className={cn(
        "flex items-center justify-center rounded-full shadow-lg transition-colors",
        nodeSize,
        styles.bg,
        styles.ring
      )}
    >
      <Icon className={cn(iconSize, styles.text)} />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={cn(
        "flex flex-col items-center gap-3",
        alignRight ? "lg:self-end lg:mr-12" : "lg:self-start lg:ml-12"
      )}
    >
      {/* Number badge */}
      <div className="w-6 h-6 rounded-full bg-lavender-200 flex items-center justify-center">
        <span className="font-heading text-xs font-bold text-purple-700">{index + 1}</span>
      </div>

      {/* Node — locked = div, others = Link */}
      {isLocked ? (
        <div>{nodeEl}</div>
      ) : (
        <Link href={`/siswa/modul/${chapter.id}`}>
          <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
            {nodeEl}
          </motion.div>
        </Link>
      )}

      {/* Label */}
      <div className="text-center max-w-[160px] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-lavender-200/60 shadow-sm">
        <p className={cn("font-heading text-xs font-bold leading-tight", styles.labelText)}>
          {chapter.shortLabel}
        </p>
        {!isLocked && (
          <p className="font-sans text-[10px] text-purple-600 font-semibold mt-0.5">
            {chapter.reward.label}
          </p>
        )}
        {isLocked && (
          <p className="font-sans text-[10px] text-ink-700/40 flex items-center justify-center gap-1 mt-0.5">
            <Lock className="w-2.5 h-2.5" />
            Terkunci
          </p>
        )}
      </div>
    </motion.div>
  );
}
