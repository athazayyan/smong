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
  const canStartCamera = lensState === "idle" || lensState === "unsupported" || lensState === "permission-denied" || lensState === "camera-error" || lensState === "simulation";
  const isActive = lensState === "camera-ready" || lensState === "simulation" || lensState === "correct" || lensState === "retry";

  return (
    <div className="absolute inset-x-3 top-3 z-20 rounded-[1.5rem] border border-white/18 bg-purple-950/56 p-4 text-white shadow-[0_18px_50px_rgba(25,10,62,0.26)] backdrop-blur md:inset-x-5 md:top-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.13em] text-yellow-200">
            <ShieldCheck className="h-4 w-4" />
            WebAR Warning Lens
          </p>
          <h1 className="font-heading text-2xl font-black leading-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/82">{prompt}</p>
          {!isActive && (
            <div className="mt-3 grid gap-2 text-xs font-bold text-white/70 md:grid-cols-2">
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
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
          {!isActive ? (
            <>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-yellow-200 px-5 py-3 font-heading text-sm font-black text-yellow-950 shadow-[0_5px_0_#d6a900] transition active:translate-y-0.5 active:shadow-[0_2px_0_#d6a900] disabled:opacity-60"
                onClick={onStartCamera}
                disabled={!canStartCamera}
              >
                <Camera className="h-4 w-4" />
                Mulai Kamera
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/14 px-5 py-3 font-heading text-sm font-black text-white transition hover:bg-white/20"
                onClick={onStartSimulation}
              >
                <MousePointerClick className="h-4 w-4" />
                Mode Simulasi
              </button>
            </>
          ) : (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/14 px-5 py-3 font-heading text-sm font-black text-white transition hover:bg-white/20"
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
