"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2, Flame, Lock, MapPinned, PackageCheck, Target, Zap } from "lucide-react";
import type { BadgeId, ModuleProgress } from "@/features/student-learning/types";

const BADGE_META = [
  {
    id: "siaga-gempa",
    label: "Siaga Gempa",
    description: "Selesaikan semua materi Gempa Bumi",
  },
  {
    id: "ahli-evakuasi",
    label: "Ahli Evakuasi",
    description: "Kuasai respons darurat dan simulasi akhir",
  },
  {
    id: "mitigator-muda",
    label: "Mitigator Muda",
    description: "Selesaikan beberapa modul siaga",
  },
  {
    id: "penjelajah-nusantara",
    label: "Penjelajah Nusantara",
    description: "Selesaikan Mitigasi Nusantara",
  },
] satisfies { id: BadgeId; label: string; description: string }[];

export interface ProgressRailProps {
  progress: ModuleProgress;
  totalLessons: number;
}

export function ProgressRail({ progress, totalLessons }: ProgressRailProps) {
  const completedCount = progress.completedLessonIds.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <aside className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden smong-slab-soft border border-purple-700/10 bg-white/66 p-5 text-ink-900 shadow-[0_20px_58px_rgba(47,23,110,0.08)] backdrop-blur"
      >
        <div className="absolute inset-x-4 top-20 h-8 smong-thread opacity-45" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-purple-900 text-white">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-heading text-xl font-black">Mission Backpack</p>
              <p className="text-xs font-bold text-ink-400">Bekal misi hari ini</p>
            </div>
          </div>

          <div className="smong-slab-soft bg-white/62 p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-extrabold text-ink-700">
              <span>Progress modul</span>
              <span className="text-purple-700">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-lavender-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-purple-900"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat icon="xp" label="XP" value={`${progress.xpTotal}`} />
            <MiniStat icon="streak" label="Hari" value={`${progress.streakDays}`} />
            <MiniStat icon="lesson" label="Misi" value={`${completedCount}`} />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-[2rem] border border-lavender-200/70 bg-white/86 p-5 shadow-[0_16px_44px_rgba(47,23,110,0.08)]"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-teal-700">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-base font-black text-ink-900">Misi Harian</p>
            <p className="text-xs font-bold text-ink-400">Selesaikan 1 misi</p>
          </div>
        </div>
        <p className="text-sm font-semibold leading-6 text-ink-700">
          Buka satu node hari ini untuk menjaga ritme belajar siagamu.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-[2rem] border border-lavender-200/70 bg-white/86 p-5 shadow-[0_16px_44px_rgba(47,23,110,0.08)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-heading text-base font-black text-ink-900">Badge Map</p>
          <MapPinned className="h-5 w-5 text-purple-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BADGE_META.map((badge) => {
            const unlocked = progress.unlockedBadgeIds.includes(badge.id);
            return (
              <div key={badge.id} className="rounded-[1.35rem] bg-lavender-100/45 p-3 text-center">
                <div
                  className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white ${
                    unlocked ? "bg-yellow-200 text-yellow-800" : "bg-white text-ink-400"
                  }`}
                >
                  {unlocked ? <Award className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                <p className={`font-heading text-xs font-black leading-tight ${unlocked ? "text-ink-900" : "text-ink-400"}`}>
                  {badge.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </aside>
  );
}

function MiniStat({ icon, label, value }: { icon: "xp" | "streak" | "lesson"; label: string; value: string }) {
  const Icon = icon === "xp" ? Zap : icon === "streak" ? Flame : CheckCircle2;

  return (
    <div className="smong-slab-soft bg-white/56 p-3 text-center">
      <Icon className="mx-auto mb-2 h-4 w-4 text-purple-700" />
      <p className="font-heading text-lg font-black leading-none text-ink-900">{value}</p>
      <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-ink-400">{label}</p>
    </div>
  );
}
