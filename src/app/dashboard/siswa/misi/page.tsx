import { Target, Lock, CheckCircle2 } from "lucide-react";
import { lessonNodes } from "@/features/student-learning/data/mockData";
import { mockProgress } from "@/features/student-learning/data/mockProgress";
import Link from "next/link";

export default function MisiPage() {
  const completedCount = mockProgress.completedLessonIds.length;
  const totalCount = lessonNodes.length;

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-purple-900">Semua Misi</h1>
        </div>
        <p className="font-sans text-sm text-ink-700">
          <span className="font-bold text-teal-600">{completedCount}</span> dari{" "}
          <span className="font-bold text-ink-900">{totalCount}</span> misi selesai.
        </p>
      </div>

      {/* Mission list */}
      <div className="flex flex-col gap-3">
        {lessonNodes.map((node, i) => {
          const isLocked = node.status === "locked";
          const isCompleted = node.status === "completed" || node.status === "mastered";
          const isAvailableOrActive = node.status === "available" || node.status === "active";

          const phaseLabel =
            node.phaseId === "pra-bencana"
              ? "Pra-Bencana"
              : node.phaseId === "saat-bencana"
              ? "Saat Bencana"
              : "Pascabencana";

          return (
            <div
              key={node.id}
              className={`bg-white rounded-2xl px-5 py-4 ring-2 flex items-center gap-4 transition-colors ${
                isCompleted
                  ? "ring-teal-500/30"
                  : isAvailableOrActive
                  ? "ring-purple-500/40"
                  : "ring-lavender-200/50"
              }`}
            >
              {/* Order */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-heading text-sm font-bold ${
                  isCompleted
                    ? "bg-teal-500 text-white"
                    : isAvailableOrActive
                    ? "bg-purple-700 text-white"
                    : "bg-lavender-200 text-ink-700"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-heading text-sm font-bold ${
                    isLocked ? "text-ink-400" : "text-ink-900"
                  }`}
                >
                  {node.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-sans text-[10px] font-semibold text-ink-700 bg-lavender-100 px-2 py-0.5 rounded-full">
                    {phaseLabel}
                  </span>
                  <span className="font-sans text-[10px] text-ink-700">{node.shortDescription}</span>
                </div>
              </div>

              {/* Reward + action */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="font-sans text-[10px] font-bold text-purple-600">
                  {node.reward.label}
                </span>
                {isAvailableOrActive && (
                  <Link
                    href={`/dashboard/siswa/lesson/${node.id}`}
                    className="font-heading text-[10px] font-bold text-white bg-purple-700 px-3 py-1 rounded-full hover:bg-purple-500 transition-colors"
                  >
                    Mulai
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
