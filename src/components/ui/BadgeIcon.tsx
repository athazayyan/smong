"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BadgeId } from "@/features/student-learning/types";
import { Star, Shield, Award, Globe } from "lucide-react";

export interface BadgeIconProps {
  badgeId: BadgeId;
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BADGE_CONFIG: Record<
  BadgeId,
  { label: string; icon: React.ElementType; bg: string; ring: string }
> = {
  "siaga-gempa": {
    label: "Siaga Gempa",
    icon: Star,
    bg: "bg-yellow-200",
    ring: "ring-yellow-200",
  },
  "ahli-evakuasi": {
    label: "Ahli Evakuasi",
    icon: Shield,
    bg: "bg-lavender-200",
    ring: "ring-lavender-200",
  },
  "mitigator-muda": {
    label: "Mitigator Muda",
    icon: Award,
    bg: "bg-mint-100",
    ring: "ring-mint-100",
  },
  "penjelajah-nusantara": {
    label: "Penjelajah Nusantara",
    icon: Globe,
    bg: "bg-peach-200",
    ring: "ring-peach-200",
  },
};

const sizes = {
  sm: { outer: "w-10 h-10", icon: "w-5 h-5" },
  md: { outer: "w-14 h-14", icon: "w-7 h-7" },
  lg: { outer: "w-20 h-20", icon: "w-10 h-10" },
};

export function BadgeIcon({
  badgeId,
  unlocked = false,
  size = "md",
  className,
}: BadgeIconProps) {
  const config = BADGE_CONFIG[badgeId];
  const { outer, icon: iconSize } = sizes[size];
  const Icon = config.icon;

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
      <Icon className={cn("text-ink-900", iconSize)} strokeWidth={2.5} />
    </motion.div>
  );
}
