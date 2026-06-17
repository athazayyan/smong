"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronDown, ShieldAlert, Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArWarning } from "@/features/student-learning/types";
import { getRiskLevelLabel } from "@/features/student-learning/lib/ar/markerRules";

interface ArFeedbackPanelProps {
  warnings: ArWarning[];
  successFeedback: string;
  rewardXp: number;
  onComplete: () => void;
  /** Mobile mode: renders as bottom sheet */
  isMobileSheet?: boolean;
}

export function ArFeedbackPanel({
  warnings,
  successFeedback,
  rewardXp,
  onComplete,
  isMobileSheet = false,
}: ArFeedbackPanelProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (isMobileSheet) {
    return (
      <>
        {/* Floating badge — muncul saat ada warning dan sheet tertutup */}
        <AnimatePresence>
          {warnings.length > 0 && !isSheetOpen && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-24 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-yellow-200 px-4 py-2.5 font-heading text-xs font-black text-yellow-950 shadow-[0_4px_0_#d6a900]"
              onClick={() => setIsSheetOpen(true)}
            >
              <ShieldAlert className="h-4 w-4" />
              {warnings.length} peringatan
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bottom sheet */}
        <AnimatePresence>
          {isSheetOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-[1.8rem] border-t border-white/20 bg-cream-50/96 backdrop-blur"
              style={{ maxHeight: "45svh" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3">
                <div className="h-1 w-10 rounded-full bg-ink-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <h2 className="font-heading text-lg font-black text-ink-900">
                  {warnings.length} Peringatan Aktif
                </h2>
                <button
                  type="button"
                  aria-label="Tutup panel peringatan"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-700"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Warning list */}
              <div
                className="overflow-y-auto px-4 pb-3"
                style={{ maxHeight: "calc(45svh - 140px)" }}
              >
                <div className="grid gap-2">
                  {warnings.map((warning) => (
                    <article key={warning.id} className="rounded-[1rem] bg-white/80 p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-heading text-sm font-black text-ink-900">
                          {warning.title}
                        </h3>
                        <span className="rounded-full bg-lavender-100 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.1em] text-purple-700">
                          {getRiskLevelLabel(warning.riskLevel)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-5 text-ink-700">
                        {warning.message}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              {/* Complete button */}
              <div className="border-t border-ink-100 px-4 py-3">
                <button
                  type="button"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-900 px-5 py-3 font-heading text-sm font-black text-white shadow-[0_4px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#20104f] disabled:opacity-60"
                  onClick={onComplete}
                  disabled={warnings.length === 0}
                >
                  <Trophy className="h-4 w-4" />
                  Selesai +{rewardXp} XP
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chevron hint saat tidak ada warning */}
        {warnings.length === 0 && (
          <div className="absolute bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/14 backdrop-blur">
            <ChevronDown className="h-5 w-5 text-white/60" />
          </div>
        )}
      </>
    );
  }

  // Desktop: sidebar panel (existing behavior)
  return (
    <div className="rounded-[1.5rem] border border-white/20 bg-cream-50/94 p-4 text-ink-900 shadow-[0_18px_54px_rgba(25,10,62,0.22)] backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-black text-ink-900">Warning aktif</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-ink-700">
            {warnings.length > 0
              ? successFeedback
              : "Tandai area di kamera untuk melihat peringatan keselamatan."}
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
                <h3 className="font-heading text-base font-black text-ink-900">
                  {warning.title}
                </h3>
                <span className="rounded-full bg-lavender-100 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-purple-700">
                  {getRiskLevelLabel(warning.riskLevel)}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-5 text-ink-700">
                {warning.message}
              </p>
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