"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockProgress } from "@/features/student-learning/data/mockProgress";
import { Zap, Flame, Settings } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-lavender-200/50 px-4 lg:px-6 h-14 flex items-center gap-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-heading font-bold shrink-0">
        R
      </div>

      {/* XP & Streak */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-heading text-sm font-bold text-ink-900">{mockProgress.xpTotal} XP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-coral-500 fill-coral-500" />
          <span className="font-heading text-sm font-bold text-ink-900">{mockProgress.streakDays} hari</span>
        </div>
      </div>

      {/* Module progress */}
      <div className="hidden sm:flex flex-col gap-1 min-w-[140px]">
        <p className="font-sans text-[10px] font-semibold text-ink-700 uppercase tracking-wide">Misi Gempa Bumi</p>
        <ProgressBar
          value={Math.round((mockProgress.completedLessonIds.length / 5) * 100)}
          variant="default"
          size="sm"
        />
      </div>

      {/* Settings */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-lavender-200/50 transition-colors text-ink-700 ml-2"
        aria-label="Pengaturan"
      >
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
}
