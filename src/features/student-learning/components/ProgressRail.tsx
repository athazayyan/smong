"use client";

import { motion } from "framer-motion";
import { Target, Zap, Flame, CheckCircle2, Award, Lock } from "lucide-react";
import type { ModuleProgress, BadgeId } from "@/features/student-learning/types";

const BADGE_META: Record<BadgeId, { label: string; description: string }> = {
  "siaga-gempa": {
    label: "Siaga Gempa",
    description: "Selesaikan semua materi Gempa Bumi",
  },
  "ahli-evakuasi": {
    label: "Ahli Evakuasi",
    description: "Kuasai respons darurat dan simulasi akhir",
  },
  "mitigator-muda": {
    label: "Mitigator Muda",
    description: "Selesaikan beberapa modul siaga",
  },
  "penjelajah-nusantara": {
    label: "Penjelajah Nusantara",
    description: "Selesaikan Mitigasi Nusantara",
  },
};

const ALL_BADGE_IDS: BadgeId[] = [
  "siaga-gempa",
  "ahli-evakuasi",
  "mitigator-muda",
  "penjelajah-nusantara",
];

export interface ProgressRailProps {
  progress: ModuleProgress;
  totalLessons: number;
}

export function ProgressRail({ progress, totalLessons }: ProgressRailProps) {
  const completedCount = progress.completedLessonIds.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Daily mission card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-purple-700 rounded-3xl p-5 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <p className="font-heading text-base font-bold text-white">Misi Harian</p>
        </div>
        <p className="font-sans text-xs text-lavender-200 leading-relaxed">
          Selesaikan 1 misi hari ini untuk menjaga streakmu!
        </p>
        <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="font-sans text-xs text-lavender-200">Progress hari ini</span>
          <span className="font-heading text-sm font-bold text-yellow-200">
            {completedCount}/{totalLessons}
          </span>
        </div>
      </motion.div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-3xl p-5 ring-2 ring-lavender-200/50 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-bold text-ink-900">Progres Modul</p>
          <span className="font-heading text-sm font-bold text-purple-700">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-lavender-200/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-linear-to-r from-purple-500 to-teal-500 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-sans text-ink-700">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            {progress.xpTotal} XP
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
            {progress.streakDays} hari
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            {completedCount} misi
          </div>
        </div>
      </motion.div>

      {/* Badge collection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-3xl p-5 ring-2 ring-lavender-200/50 flex flex-col gap-4"
      >
        <p className="font-heading text-sm font-bold text-ink-900">Koleksi Badge</p>
        <div className="grid grid-cols-2 gap-4">
          {ALL_BADGE_IDS.map((badgeId) => {
            const meta = BADGE_META[badgeId];
            const unlocked = progress.unlockedBadgeIds.includes(badgeId);
            return (
              <div key={badgeId} className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                    unlocked
                      ? "bg-yellow-100 border-yellow-300 shadow-sm"
                      : "bg-lavender-200/30 border-lavender-200"
                  }`}
                >
                  {unlocked ? (
                    <Award className="w-7 h-7 text-yellow-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-ink-700/30" />
                  )}
                </div>
                <p
                  className={`font-sans text-[10px] font-medium text-center leading-tight ${
                    unlocked ? "text-ink-900" : "text-ink-700/40"
                  }`}
                >
                  {meta.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
