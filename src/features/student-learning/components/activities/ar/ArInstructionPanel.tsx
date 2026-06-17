// ArInstructionPanel.tsx

import React from "react";
import { Camera, Info, MousePointerClick, ShieldCheck } from "lucide-react";
import type { ArSafetyLensState } from "@/features/student-learning/types";

interface ArInstructionPanelProps {
  title: string;
  prompt: string;
  safetyDisclaimer: string;
  cameraPurposeCopy: string;
  lensState: ArSafetyLensState;
  onStartCamera: () => void;
  onStartSimulation: () => void;
  onStop: () => void;
}

export function ArInstructionPanel({
  title,
  prompt,
  safetyDisclaimer,
  cameraPurposeCopy,
  lensState,
  onStartCamera,
  onStartSimulation,
  onStop,
}: ArInstructionPanelProps) {
  const canStartCamera =
    lensState === "idle" ||
    lensState === "unsupported" ||
    lensState === "permission-denied" ||
    lensState === "camera-error" ||
    lensState === "simulation";

  const isActive =
    lensState === "camera-ready" ||
    lensState === "simulation" ||
    lensState === "correct" ||
    lensState === "retry";

  return (
    <div className="absolute inset-x-3 top-3 z-20 rounded-[1.25rem] border border-white/18 bg-purple-950/56 p-3 text-white shadow-[0_18px_50px_rgba(25,10,62,0.26)] backdrop-blur md:inset-x-5 md:top-5 md:rounded-[1.5rem] md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="min-w-0 flex-1">
          {/* Badge — lebih kecil di mobile */}
          <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-yellow-200 md:mb-2 md:px-3 md:py-1.5 md:text-xs">
            <ShieldCheck className="h-3 w-3 md:h-4 md:w-4" />
            WebAR Warning Lens
          </p>

          {/* Judul — lebih kecil di mobile */}
          <h1 className="font-heading text-lg font-black leading-tight md:text-4xl">
            {title}
          </h1>

          {/* Prompt — sembunyikan di mobile saat belum aktif supaya tidak terlalu padat */}
          <p className="mt-1 hidden text-sm font-semibold leading-6 text-white/82 md:mt-2 md:block">
            {prompt}
          </p>

          {/* Info cards — hanya desktop */}
          {!isActive && (
            <div className="mt-3 hidden gap-2 text-xs font-bold text-white/70 md:grid md:grid-cols-2">
              <p className="flex gap-2 rounded-[1rem] bg-white/10 px-3 py-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-mint-100" />
                {cameraPurposeCopy}
              </p>
              <p className="flex gap-2 rounded-[1rem] bg-white/10 px-3 py-2">
                <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-yellow-200" />
                {safetyDisclaimer}
              </p>
            </div>
          )}

          {/* Disclaimer singkat di mobile saja — saat idle */}
          {!isActive && (
            <p className="mt-1.5 text-[11px] font-semibold leading-5 text-white/60 md:hidden">
              {cameraPurposeCopy}
            </p>
          )}
        </div>

        {/* Tombol aksi */}
        <div className="flex shrink-0 flex-row gap-2 md:flex-col">
          {!isActive ? (
            <>
              <button
                type="button"
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-yellow-200 px-4 py-2.5 font-heading text-xs font-black text-yellow-950 shadow-[0_4px_0_#d6a900] transition active:translate-y-0.5 active:shadow-[0_2px_0_#d6a900] disabled:opacity-60 md:min-h-11 md:px-5 md:py-3 md:text-sm"
                onClick={onStartCamera}
                disabled={!canStartCamera}
              >
                <Camera className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="md:inline">Mulai Kamera</span>
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/14 px-4 py-2.5 font-heading text-xs font-black text-white transition hover:bg-white/20 md:min-h-11 md:px-5 md:py-3 md:text-sm"
                onClick={onStartSimulation}
              >
                <MousePointerClick className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>Simulasi</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-white/14 px-4 py-2.5 font-heading text-xs font-black text-white transition hover:bg-white/20 md:min-h-11 md:px-5 md:py-3 md:text-sm"
              onClick={onStop}
            >
              Berhenti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}