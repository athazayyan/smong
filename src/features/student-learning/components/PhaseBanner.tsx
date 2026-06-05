"use client";

import { motion } from "framer-motion";
import { DisasterPhaseId } from "@/features/student-learning/types";
import { School, ShieldAlert, Users } from "lucide-react";

const PHASE_CONFIG: Record<
  DisasterPhaseId,
  { label: string; goal: string; icon: React.ElementType; bg: string; text: string; accent: string }
> = {
  "pra-bencana": {
    label: "Pra-Bencana",
    goal: "Bangun kesadaran dan siapkan dirimu sebelum gempa",
    icon: School,
    bg: "bg-lavender-200/40",
    text: "text-purple-900",
    accent: "bg-purple-500",
  },
  "saat-bencana": {
    label: "Saat Bencana",
    goal: "Latih respons aman saat guncangan terjadi",
    icon: ShieldAlert,
    bg: "bg-sky-100",
    text: "text-purple-900",
    accent: "bg-teal-500",
  },
  "pascabencana": {
    label: "Pascabencana",
    goal: "Pulihkan diri, ceritakan perasaanmu, bantu sesama",
    icon: Users,
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
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`${config.bg} rounded-2xl px-5 py-3 flex items-center gap-4 w-full border border-white/50 shadow-sm`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${config.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-heading text-sm font-bold ${config.text}`}>{config.label}</p>
        <p className="font-sans text-xs text-ink-700 truncate">{config.goal}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${config.accent} shrink-0`} />
    </motion.div>
  );
}
