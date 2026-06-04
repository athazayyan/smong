"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MascotMood } from "@/features/student-learning/types";

export interface MascotGuideProps {
  message: string;
  mood?: MascotMood;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MOOD_CONFIG: Record<MascotMood, { emoji: string; bubble: string }> = {
  guide: { emoji: "🌊", bubble: "bg-sky-100 border-sky-100" },
  happy: { emoji: "✨", bubble: "bg-yellow-200/60 border-yellow-200" },
  thinking: { emoji: "💭", bubble: "bg-lavender-200/70 border-lavender-200" },
  encouraging: { emoji: "💪", bubble: "bg-mint-100 border-mint-100" },
  celebrating: { emoji: "🎉", bubble: "bg-peach-200/70 border-peach-200" },
};

const SIZES = {
  sm: { mascot: "text-3xl", bubble: "text-xs px-3 py-2", gap: "gap-2" },
  md: { mascot: "text-4xl", bubble: "text-sm px-4 py-3", gap: "gap-3" },
  lg: { mascot: "text-5xl", bubble: "text-base px-5 py-3", gap: "gap-4" },
};

export function MascotGuide({ message, mood = "guide", size = "md", className }: MascotGuideProps) {
  const { emoji, bubble } = MOOD_CONFIG[mood];
  const sizeStyles = SIZES[size];

  return (
    <div className={cn("flex items-end", sizeStyles.gap, className)}>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="shrink-0 select-none"
      >
        <span className={cn(sizeStyles.mascot)}>🌊</span>
        <span className={cn(sizeStyles.mascot, "-ml-2")}>{emoji}</span>
      </motion.div>
      <div
        className={cn(
          "relative rounded-2xl rounded-bl-none border-2 font-sans text-ink-900 shadow-sm",
          bubble,
          sizeStyles.bubble
        )}
      >
        {message}
      </div>
    </div>
  );
}
