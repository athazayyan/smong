import React from "react";
import {
  Award,
  ChartNoAxesColumnIncreasing,
  Flame,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { studentRewardShelfItems } from "../data/visual-config";
import type { ModuleProgress, StudentRewardShelfItem } from "../types";

interface StudentProgressRewardProps {
  progress: ModuleProgress;
}

export function StudentProgressReward({ progress }: StudentProgressRewardProps) {
  const progressPercent = Math.round((progress.completedLessons / progress.totalLessons) * 100);

  return (
    <section className="relative overflow-hidden rounded-[3rem] border border-yellow-200/60 bg-linear-to-br from-cream-100 via-white to-yellow-200/35 p-6 shadow-[0_26px_80px_rgba(47,23,110,0.1)] md:p-8">
      <div className="absolute -right-16 top-2 h-56 w-56 rounded-full bg-yellow-200/55 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-lavender-100/70 blur-3xl" />

      <div className="relative mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-yellow-800">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Rak hadiahmu
          </p>
          <h2 className="mt-4 font-heading text-4xl font-black leading-tight text-ink-900">Progress yang kelihatan</h2>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-7 text-ink-700">
            Siswa melihat langkah yang sudah terbuka, badge yang didapat, dan jarak menuju sertifikat.
          </p>
        </div>
        <div className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 font-heading text-sm font-black text-purple-700 shadow-sm">
          Ringkasan badge
        </div>
      </div>

      <div className="relative grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {studentRewardShelfItems.map((item) => (
            <RewardMetric key={item.id} item={item} progress={progress} />
          ))}
        </div>

        <div className="rounded-[2.2rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_50px_rgba(47,23,110,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-2xl font-black text-ink-900">Koleksi Badge</h3>
              <p className="text-sm font-semibold text-ink-700">Buka badge saat misi selesai.</p>
            </div>
            <div className="rounded-full bg-lavender-100 px-3 py-1.5 font-heading text-sm font-black text-purple-700">
              {progressPercent}%
            </div>
          </div>

          <div className="mb-6 h-3 overflow-hidden rounded-full bg-lavender-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-purple-500 via-yellow-500 to-teal-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {progress.earnedBadges.map((badge) => (
              <div key={badge.id} className="rounded-[1.6rem] bg-yellow-200/50 p-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-yellow-200 text-yellow-800 shadow-sm">
                  <Award className="h-8 w-8" />
                </div>
                <p className="font-heading text-sm font-black leading-tight text-ink-900">{badge.name}</p>
              </div>
            ))}
            <div className="rounded-[1.6rem] border border-dashed border-lavender-200 bg-lavender-100/45 p-4 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-ink-400 shadow-sm">
                <Lock className="h-7 w-7" />
              </div>
              <p className="font-heading text-sm font-black leading-tight text-ink-400">Badge Berikutnya</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RewardMetric({ item, progress }: { item: StudentRewardShelfItem; progress: ModuleProgress }) {
  const toneClassName = getRewardToneClassName(item.tone);
  const value = getRewardValue(item.id, progress);

  return (
    <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClassName}`}>
          {renderRewardIcon(item.iconName)}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-ink-400">{item.label}</p>
          <p className="font-heading text-3xl font-black leading-none text-ink-900">{value}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-ink-700">{item.helper}</p>
    </div>
  );
}

function getRewardValue(itemId: StudentRewardShelfItem["id"], progress: ModuleProgress) {
  if (itemId === "xp") return progress.xp.toLocaleString("id-ID");
  if (itemId === "streak") return `${progress.streakDays} Hari`;
  return `${progress.completedLessons}/${progress.totalLessons}`;
}

function renderRewardIcon(iconName: StudentRewardShelfItem["iconName"]) {
  if (iconName === "Zap") return <Zap className="h-6 w-6" />;
  if (iconName === "Flame") return <Flame className="h-6 w-6" />;
  return <ChartNoAxesColumnIncreasing className="h-6 w-6" />;
}

function getRewardToneClassName(tone: StudentRewardShelfItem["tone"]) {
  if (tone === "peach") return "bg-peach-200 text-coral-700";
  if (tone === "purple") return "bg-lavender-100 text-purple-700";
  return "bg-sky-100 text-purple-700";
}
