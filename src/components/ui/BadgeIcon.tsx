"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BadgeId } from "@/features/student-learning/types";

export interface BadgeIconProps {
  badgeId: BadgeId;
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BADGE_CONFIG: Record<
  BadgeId,
  { label: string; emoji: string; bg: string; ring: string }
> = {
  "siaga-pemula": {
    label: "Siaga Pemula",
    emoji: "⭐",
    bg: "bg-yellow-200",
    ring: "ring-yellow-200",
  },
  "penjaga-kepala": {
    label: "Penjaga Kepala",
    emoji: "🛡️",
    bg: "bg-lavender-200",
    ring: "ring-lavender-200",
  },
  "teman-tangguh": {
    label: "Teman Tangguh",
    emoji: "🤝",
    bg: "bg-mint-100",
    ring: "ring-mint-100",
  },
  "pahlawan-evakuasi": {
    label: "Pahlawan Evakuasi",
    emoji: "🏆",
    bg: "bg-peach-200",
    ring: "ring-peach-200",
  },
};

const sizes = {
  sm: { outer: "w-10 h-10", emoji: "text-xl" },
  md: { outer: "w-14 h-14", emoji: "text-3xl" },
  lg: { outer: "w-20 h-20", emoji: "text-4xl" },
};

export function BadgeIcon({
  badgeId,
  unlocked = false,
  size = "md",
  className,
}: BadgeIconProps) {
  const config = BADGE_CONFIG[badgeId];
  const { outer, emoji } = sizes[size];

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "rounded-full flex items-center justify-center ring-4 shadow-md",
        outer,
        unlocked ? config.bg : "bg-ink-700/10",
        unlocked ? config.ring : "ring-ink-700/10",
        !unlocked && "grayscale opacity-40",
        className
      )}
      title={config.label}
    >
      <span className={emoji}>{config.emoji}</span>
    </motion.div>
  );
}
