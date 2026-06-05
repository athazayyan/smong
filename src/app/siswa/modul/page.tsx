import { ChapterMap } from "@/features/student-learning/components/ChapterMap";
import { ProgressRail } from "@/features/student-learning/components/ProgressRail";
import { gempaChapters, moduleGroups } from "@/features/student-learning/data/mockData";
import { mockStudentProgress } from "@/features/student-learning/data/mockProgress";
import { Lock, Clock } from "lucide-react";

// Total lessons across all Gempa Bumi chapters for progress calculation
const TOTAL_GEMPA_LESSONS = 18; // 3 per chapter × 6 chapters + 2 cert

const COMING_SOON_MODULES = moduleGroups.filter((m) => m.availability === "coming-soon");

export default function ModulPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16">
      {/* Page header */}
      <div className="bg-white border-b border-lavender-200/60 px-4 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <p className="font-sans text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">
            Perjalanan Belajarmu
          </p>
          <h1 className="font-heading text-2xl font-bold text-ink-900">Modul Belajar</h1>
          <p className="font-sans text-sm text-ink-700 mt-1">
            Pilih bab untuk memulai misi siaga bencanamu.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Active Module Map */}
          <div className="flex-1 min-w-0">
            {/* Module label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-purple-700 flex items-center justify-center shrink-0">
                <span className="font-heading text-white font-bold text-sm">GB</span>
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-ink-900">Gempa Bumi</p>
                <p className="font-sans text-xs text-ink-700">7 Bab · SD–SMP</p>
              </div>
              <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full border border-purple-200">
                Aktif
              </span>
            </div>

            <ChapterMap chapters={gempaChapters} />

            {/* Locked modules */}
            <div className="mt-10">
              <p className="font-heading text-base font-bold text-ink-900 mb-4">
                Modul Berikutnya
              </p>
              <div className="flex flex-col gap-3">
                {COMING_SOON_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-lavender-200/60 opacity-70"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-lavender-200/40 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-ink-700/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold text-ink-700/60 truncate">
                        {mod.title}
                      </p>
                      <p className="font-sans text-xs text-ink-700/40 truncate">
                        {mod.description}
                      </p>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 px-3 py-1 bg-lavender-200/40 text-ink-700/50 font-bold text-xs rounded-full">
                      <Clock className="w-3 h-3" />
                      Segera Hadir
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar: Progress */}
          <div className="w-full lg:w-72 shrink-0">
            <ProgressRail
              progress={mockStudentProgress}
              totalLessons={TOTAL_GEMPA_LESSONS}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
