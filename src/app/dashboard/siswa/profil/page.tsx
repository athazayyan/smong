import { User, Zap, Flame, Star } from "lucide-react";
import { mockProgress } from "@/features/student-learning/data/mockProgress";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { lessonNodes } from "@/features/student-learning/data/mockData";

export default function ProfilPage() {
  const completedCount = mockProgress.completedLessonIds.length;
  const totalCount = lessonNodes.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
      {/* Avatar card */}
      <div className="bg-white rounded-3xl p-6 ring-2 ring-lavender-200/50 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-purple-700 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-purple-900">Raka</h1>
            <p className="font-sans text-sm text-ink-700 mt-0.5">Siswa SD — Gempa Bumi MVP</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-200/50 rounded-2xl p-4 flex flex-col items-center gap-1 ring-2 ring-yellow-200/60">
          <Zap className="w-6 h-6 text-yellow-700 fill-yellow-500" />
          <p className="font-heading text-xl font-bold text-ink-900">{mockProgress.xpTotal}</p>
          <p className="font-sans text-xs text-ink-700">Total XP</p>
        </div>
        <div className="bg-coral-50 rounded-2xl p-4 flex flex-col items-center gap-1 ring-2 ring-coral-200/60">
          <Flame className="w-6 h-6 text-coral-500 fill-coral-500" />
          <p className="font-heading text-xl font-bold text-ink-900">{mockProgress.streakDays}</p>
          <p className="font-sans text-xs text-ink-700">Hari Berturut</p>
        </div>
        <div className="bg-mint-100 rounded-2xl p-4 flex flex-col items-center gap-1 ring-2 ring-teal-500/20">
          <Star className="w-6 h-6 text-teal-600 fill-teal-400" />
          <p className="font-heading text-xl font-bold text-ink-900">{completedCount}</p>
          <p className="font-sans text-xs text-ink-700">Misi Selesai</p>
        </div>
      </div>

      {/* Module progress */}
      <div className="bg-white rounded-3xl p-6 ring-2 ring-lavender-200/50">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading text-base font-bold text-ink-900">Progres Modul Gempa Bumi</p>
          <span className="font-heading text-sm font-bold text-purple-700">{pct}%</span>
        </div>
        <ProgressBar value={pct} variant="default" size="md" />
        <p className="font-sans text-xs text-ink-700 mt-3">
          {completedCount} dari {totalCount} misi telah diselesaikan.
          {completedCount < totalCount && " Lanjutkan petualanganmu!"}
          {completedCount === totalCount && " Semua misi selesai. Luar biasa!"}
        </p>
      </div>
    </div>
  );
}
