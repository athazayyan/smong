"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MascotMood } from "@/features/student-learning/types";

export interface MascotGuideProps {
  message: string;
  mood?: MascotMood;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MOOD_CONFIG: Record<MascotMood, { bubble: string }> = {
  guide: { bubble: "bg-sky-100 border-sky-100" },
  happy: { bubble: "bg-yellow-200/60 border-yellow-200" },
  thinking: { bubble: "bg-lavender-200/70 border-lavender-200" },
  encouraging: { bubble: "bg-mint-100 border-mint-100" },
  celebrating: { bubble: "bg-peach-200/70 border-peach-200" },
};

const SIZES = {
  sm: { mascot: "w-10 h-10", bubble: "text-xs px-3 py-2", gap: "gap-2" },
  md: { mascot: "w-14 h-14", bubble: "text-sm px-4 py-3", gap: "gap-3" },
  lg: { mascot: "w-20 h-20", bubble: "text-base px-5 py-3", gap: "gap-4" },
};

export function MascotGuide({ message, mood = "guide", size = "md", className }: MascotGuideProps) {
  const { bubble } = MOOD_CONFIG[mood];
  const sizeStyles = SIZES[size];

  return (
    <div className={cn("flex items-end", sizeStyles.gap, className)}>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="shrink-0 select-none relative"
      >
        <div className={cn("relative", sizeStyles.mascot)}>
          <Image
            src="/assets/mascot/mascot-smong.png"
            alt="Mascot Smong"
            fill
            className="object-contain"
          />
        </div>
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
