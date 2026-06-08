import React from "react";
import { CameraOff, MousePointerClick } from "lucide-react";
import type { ArSafetyLensState } from "@/features/student-learning/types";

interface ArUnsupportedFallbackProps {
  lensState: ArSafetyLensState;
  onStartSimulation: () => void;
}

export function ArUnsupportedFallback({ lensState, onStartSimulation }: ArUnsupportedFallbackProps) {
  const message = getFallbackMessage(lensState);

  if (!message) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-purple-950/72 p-5 backdrop-blur">
      <div className="max-w-sm rounded-[1.6rem] border border-white/18 bg-cream-50 p-5 text-center shadow-[0_22px_70px_rgba(25,10,62,0.28)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-lavender-100 text-purple-700">
          <CameraOff className="h-7 w-7" />
        </div>
        <h2 className="font-heading text-2xl font-black text-ink-900">{message.title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-ink-700">{message.body}</p>
        <button
          type="button"
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-purple-900 px-5 py-3 font-heading text-sm font-black text-white shadow-[0_5px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#20104f]"
          onClick={onStartSimulation}
        >
          <MousePointerClick className="h-4 w-4" />
          Latihan Simulasi
        </button>
      </div>
    </div>
  );
}

type FallbackMessage = {
  title: string;
  body: string;
};

function getFallbackMessage(lensState: ArSafetyLensState): FallbackMessage | undefined {
  if (lensState === "unsupported") {
    return {
      title: "Kamera belum didukung",
      body: "Perangkat atau browser ini belum bisa membuka kamera. Kamu tetap bisa menyelesaikan latihan lewat mode simulasi.",
    };
  }

  if (lensState === "permission-denied") {
    return {
      title: "Kamera belum diizinkan",
      body: "Kamu tetap bisa latihan lewat mode simulasi. Kamera hanya dipakai di layar ini. Gambar tidak disimpan.",
    };
  }

  if (lensState === "camera-error") {
    return {
      title: "Kamera belum siap",
      body: "Perangkatmu mungkin sedang memakai kamera di aplikasi lain. Mode simulasi tetap memberikan latihan yang sama.",
    };
  }

  return undefined;
}
