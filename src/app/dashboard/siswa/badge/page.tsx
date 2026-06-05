import { Medal, Lock } from "lucide-react";
import { Badge } from "@/features/student-learning/types";
import { mockProgress } from "@/features/student-learning/data/mockProgress";
import { BadgeIcon } from "@/components/ui/BadgeIcon";

const ALL_BADGES: Badge[] = [
  {
    id: "siaga-pemula",
    label: "Siaga Pemula",
    description: "Selesaikan seluruh misi fase Pra-Bencana untuk membuka badge ini.",
    unlocked: false,
  },
  {
    id: "penjaga-kepala",
    label: "Penjaga Kepala",
    description: "Selesaikan seluruh misi fase Saat Bencana untuk membuka badge ini.",
    unlocked: false,
  },
  {
    id: "teman-tangguh",
    label: "Teman Tangguh",
    description: "Selesaikan seluruh misi fase Pascabencana untuk membuka badge ini.",
    unlocked: false,
  },
  {
    id: "pahlawan-evakuasi",
    label: "Pahlawan Evakuasi",
    description: "Selesaikan seluruh modul Gempa Bumi untuk membuka badge ini.",
    unlocked: false,
  },
];

export default function BadgePage() {
  const badgesWithState: Badge[] = ALL_BADGES.map((b) => ({
    ...b,
    unlocked: mockProgress.unlockedBadgeIds.includes(b.id),
  }));

  const unlockedCount = badgesWithState.filter((b) => b.unlocked).length;

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-200 flex items-center justify-center">
            <Medal className="w-5 h-5 text-yellow-800" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-purple-900">Koleksi Badge</h1>
        </div>
        <p className="font-sans text-sm text-ink-700">
          Kamu memiliki{" "}
          <span className="font-bold text-purple-700">{unlockedCount}</span> dari{" "}
          <span className="font-bold text-ink-900">{badgesWithState.length}</span> badge.
        </p>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badgesWithState.map((badge) => (
          <div
            key={badge.id}
            className={`bg-white rounded-3xl p-6 ring-2 transition-colors ${
              badge.unlocked ? "ring-yellow-200 shadow-[0_4px_16px_rgba(255,232,154,0.3)]" : "ring-lavender-200/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <BadgeIcon badgeId={badge.id} unlocked={badge.unlocked} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-heading text-base font-bold text-ink-900">{badge.label}</p>
                  {!badge.unlocked && <Lock className="w-3.5 h-3.5 text-ink-400 shrink-0" />}
                </div>
                <p className="font-sans text-xs text-ink-700 leading-relaxed">{badge.description}</p>
                {badge.unlocked && (
                  <span className="inline-block mt-2 text-[10px] font-semibold font-sans text-teal-600 bg-mint-100 px-2 py-0.5 rounded-full">
                    Terbuka
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement */}
      <div className="mt-8 bg-lavender-200/40 rounded-3xl px-6 py-5 border border-lavender-200">
        <p className="font-heading text-sm font-bold text-purple-900 mb-1">
          Cara mendapatkan badge
        </p>
        <p className="font-sans text-xs text-ink-700 leading-relaxed">
          Selesaikan setiap misi di jalur pembelajaran Gempa Bumi. Badge akan terbuka
          otomatis setelah kamu menyelesaikan semua misi di setiap fase.
        </p>
      </div>
    </div>
  );
}
