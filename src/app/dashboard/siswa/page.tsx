import { ModulePath } from "@/features/student-learning/components/ModulePath";
import { ProgressRail } from "@/features/student-learning/components/ProgressRail";
import { MascotGuide } from "@/components/ui/MascotGuide";
import { lessonNodes, earthquakeModule } from "@/features/student-learning/data/mockData";
import { mockProgress } from "@/features/student-learning/data/mockProgress";

export default function StudentDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
      {/* Header greeting */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-purple-900">
          Halo, Raka! 👋
        </h1>
        <p className="font-sans text-sm text-ink-700 mt-1">
          Lanjutkan petualangan kesiapsiagaanmu hari ini.
        </p>
      </div>

      {/* Mobile mascot */}
      <div className="lg:hidden mb-6">
        <MascotGuide
          message="Ayo mulai misi pertamamu. Kamu bisa!"
          mood="guide"
          size="md"
        />
      </div>

      {/* 3-column layout: spacer | path | rail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px_300px] xl:grid-cols-[1fr_420px_320px] gap-6 lg:gap-8">
        {/* Left spacer on desktop (decorative) */}
        <div className="hidden lg:flex flex-col gap-4 pt-4">
          <div className="bg-white rounded-3xl p-5 ring-2 ring-lavender-200/50">
            <p className="font-heading text-sm font-bold text-ink-900 mb-3">Tentang Modul</p>
            <p className="font-sans text-xs text-ink-700 leading-relaxed mb-4">
              {earthquakeModule.title} — Modul pertama Smong untuk siswa SD–SMP. Pelajari gempa bumi dari tiga fase penting.
            </p>
            <div className="flex flex-col gap-2">
              {(["pra-bencana", "saat-bencana", "pascabencana"] as const).map((phase) => {
                const phaseLabels = {
                  "pra-bencana": { label: "Pra-Bencana", emoji: "🏫" },
                  "saat-bencana": { label: "Saat Bencana", emoji: "🛡️" },
                  "pascabencana": { label: "Pascabencana", emoji: "🤝" },
                };
                const phaseNodes = lessonNodes.filter((n) => n.phaseId === phase);
                const DONE_STATUSES = ["completed", "mastered"] as const;
                const completed = phaseNodes.filter((n) =>
                  (DONE_STATUSES as readonly string[]).includes(n.status)
                ).length;
                return (
                  <div key={phase} className="flex items-center justify-between text-xs font-sans">
                    <span className="flex items-center gap-1.5 text-ink-700">
                      <span>{phaseLabels[phase].emoji}</span>
                      {phaseLabels[phase].label}
                    </span>
                    <span className="font-semibold text-purple-700">
                      {completed}/{phaseNodes.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Learning Path */}
        <div className="flex flex-col">
          <div className="sticky top-[56px] z-10 bg-cream-50/80 backdrop-blur-sm pb-3 mb-2">
            <h2 className="font-heading text-base font-bold text-purple-900">
              🗺️ Jalur Gempa Bumi MVP
            </h2>
            <p className="font-sans text-xs text-ink-700">
              {lessonNodes.length} misi • Tiga fase bencana
            </p>
          </div>
          <ModulePath nodes={lessonNodes} />
        </div>

        {/* Right: Progress Rail */}
        <div className="lg:sticky lg:top-[56px] lg:h-fit">
          <ProgressRail
            progress={mockProgress}
            totalLessons={lessonNodes.length}
          />
        </div>
      </div>
    </div>
  );
}
