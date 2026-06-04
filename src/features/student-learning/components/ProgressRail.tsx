"use client";

import { motion } from "framer-motion";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MascotGuide } from "@/components/ui/MascotGuide";
import { StudentProgress, Badge } from "@/features/student-learning/types";

const ALL_BADGES: Badge[] = [
  { id: "siaga-pemula", label: "Siaga Pemula", description: "Selesaikan fase Pra-Bencana", unlocked: false },
  { id: "penjaga-kepala", label: "Penjaga Kepala", description: "Selesaikan fase Saat Bencana", unlocked: false },
  { id: "teman-tangguh", label: "Teman Tangguh", description: "Selesaikan fase Pascabencana", unlocked: false },
  { id: "pahlawan-evakuasi", label: "Pahlawan Evakuasi", description: "Selesaikan seluruh modul", unlocked: false },
];

export interface ProgressRailProps {
  progress: StudentProgress;
  totalLessons: number;
}

export function ProgressRail({ progress, totalLessons }: ProgressRailProps) {
  const completedCount = progress.completedLessonIds.length;
  const pct = Math.round((completedCount / totalLessons) * 100);

  const badgesWithState: Badge[] = ALL_BADGES.map((b) => ({
    ...b,
    unlocked: progress.unlockedBadgeIds.includes(b.id),
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Daily mission card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-purple-700 rounded-3xl p-5 flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <p className="font-heading text-sm font-bold text-white">Misi Harian</p>
        </div>
        <p className="font-sans text-xs text-lavender-200 leading-relaxed">
          Selesaikan 1 misi hari ini untuk menjaga streakmu!
        </p>
        <div className="bg-white/10 rounded-2xl px-4 py-2 flex items-center justify-between">
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
        className="bg-white rounded-3xl p-5 ring-2 ring-lavender-200/50 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-bold text-ink-900">Progres Modul</p>
          <span className="font-heading text-sm font-bold text-purple-700">{pct}%</span>
        </div>
        <ProgressBar value={pct} variant="default" size="md" />
        <div className="flex items-center gap-3 text-xs font-sans text-ink-700">
          <span>⚡ {progress.xpTotal} XP</span>
          <span>🔥 {progress.streakDays} hari</span>
          <span>✅ {completedCount} misi</span>
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
        <div className="grid grid-cols-2 gap-3">
          {badgesWithState.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-1.5">
              <BadgeIcon badgeId={badge.id} unlocked={badge.unlocked} size="md" />
              <p className="font-sans text-[10px] text-ink-700 text-center leading-tight">
                {badge.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mascot prompt */}
      <MascotGuide
        message="Ayo selesaikan misi berikutnya. Kamu hampir sampai!"
        mood="encouraging"
        size="sm"
      />
    </div>
  );
}
