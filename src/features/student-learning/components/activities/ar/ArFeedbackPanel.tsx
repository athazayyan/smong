import React from "react";
import { ArrowRight, ShieldAlert, Trophy } from "lucide-react";
import type { ArWarning } from "@/features/student-learning/types";
import { getRiskLevelLabel } from "@/features/student-learning/lib/ar/markerRules";

interface ArFeedbackPanelProps {
  warnings: ArWarning[];
  successFeedback: string;
  rewardXp: number;
  onComplete: () => void;
}

export function ArFeedbackPanel({ warnings, successFeedback, rewardXp, onComplete }: ArFeedbackPanelProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/20 bg-cream-50/94 p-4 text-ink-900 shadow-[0_18px_54px_rgba(25,10,62,0.22)] backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-black text-ink-900">Warning aktif</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-ink-700">
            {warnings.length > 0 ? successFeedback : "Tandai area di kamera untuk melihat peringatan keselamatan."}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-lavender-100 text-purple-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
      </div>

      <div className="grid max-h-40 gap-2 overflow-auto pr-1">
        {warnings.length > 0 ? (
          warnings.map((warning) => (
            <article key={warning.id} className="rounded-[1rem] bg-white/78 p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading text-base font-black text-ink-900">{warning.title}</h3>
                <span className="rounded-full bg-lavender-100 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-purple-700">
                  {getRiskLevelLabel(warning.riskLevel)}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-5 text-ink-700">{warning.message}</p>
            </article>
          ))
        ) : (
          <div className="rounded-[1rem] bg-white/70 p-3 text-sm font-semibold leading-6 text-ink-500">
            Pilih jenis risiko, lalu tap area kamera atau mode simulasi.
          </div>
        )}
      </div>

      <button
        type="button"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-900 px-5 py-3 font-heading text-sm font-black text-white shadow-[0_5px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#20104f] disabled:opacity-60"
        onClick={onComplete}
        disabled={warnings.length === 0}
      >
        <Trophy className="h-4 w-4" />
        Selesai +{rewardXp} XP
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
