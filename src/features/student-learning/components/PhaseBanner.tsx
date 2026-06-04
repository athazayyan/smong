"use client";

import { motion } from "framer-motion";
import { DisasterPhaseId } from "@/features/student-learning/types";

const PHASE_CONFIG: Record<
  DisasterPhaseId,
  { label: string; goal: string; emoji: string; bg: string; text: string; accent: string }
> = {
  "pra-bencana": {
    label: "Pra-Bencana",
    goal: "Bangun kesadaran dan siapkan dirimu sebelum gempa",
    emoji: "🏫",
    bg: "bg-lavender-200/40",
    text: "text-purple-900",
    accent: "bg-purple-500",
  },
  "saat-bencana": {
    label: "Saat Bencana",
    goal: "Latih respons aman saat guncangan terjadi",
    emoji: "🛡️",
    bg: "bg-sky-100",
    text: "text-purple-900",
    accent: "bg-teal-500",
  },
  "pascabencana": {
    label: "Pascabencana",
    goal: "Pulihkan diri, ceritakan perasaanmu, bantu sesama",
    emoji: "🤝",
    bg: "bg-mint-100",
    text: "text-purple-900",
    accent: "bg-teal-500",
  },
};

export interface PhaseBannerProps {
  phaseId: DisasterPhaseId;
}

export function PhaseBanner({ phaseId }: PhaseBannerProps) {
  const config = PHASE_CONFIG[phaseId];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`${config.bg} rounded-2xl px-5 py-3 flex items-center gap-3 w-full`}
    >
      <span className="text-2xl shrink-0">{config.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-heading text-sm font-bold ${config.text}`}>{config.label}</p>
        <p className="font-sans text-xs text-ink-700 truncate">{config.goal}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${config.accent} shrink-0`} />
    </motion.div>
  );
}
