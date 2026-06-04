"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockProgress } from "@/features/student-learning/data/mockProgress";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-lavender-200/50 px-4 lg:px-6 h-14 flex items-center gap-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-heading font-bold shrink-0">
        R
      </div>

      {/* XP & Streak */}
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base">⚡</span>
          <span className="font-heading text-sm font-bold text-purple-700">{mockProgress.xpTotal} XP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔥</span>
          <span className="font-heading text-sm font-bold text-coral-500">{mockProgress.streakDays} hari</span>
        </div>
      </div>

      {/* Module progress */}
      <div className="hidden sm:flex flex-col gap-0.5 min-w-[120px]">
        <p className="font-sans text-[10px] text-ink-700">Misi Gempa Bumi</p>
        <ProgressBar
          value={Math.round((mockProgress.completedLessonIds.length / 5) * 100)}
          variant="default"
          size="sm"
        />
      </div>

      {/* Settings */}
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-lavender-200/50 transition-colors text-lg"
        aria-label="Pengaturan"
      >
        ⚙️
      </button>
    </header>
  );
}
