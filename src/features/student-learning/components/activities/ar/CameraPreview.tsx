import React from "react";
import { Camera, MonitorPlay } from "lucide-react";
import type { ArSafetyLensState } from "@/features/student-learning/types";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  lensState: ArSafetyLensState;
  isSimulationMode: boolean;
}

export function CameraPreview({ videoRef, lensState, isSimulationMode }: CameraPreviewProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-purple-950">
      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-500 ${isSimulationMode ? "opacity-0" : "opacity-100"}`}
        playsInline
        muted
      />

      <div className={`absolute inset-0 transition-opacity duration-500 ${isSimulationMode ? "opacity-100" : "opacity-0"}`}>
        <SimulatedClassroomScene />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,rgba(41,15,97,0.08),rgba(25,10,62,0.36))]" />

      {lensState === "requesting-camera" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-950/76 backdrop-blur">
          <div className="rounded-[1.5rem] border border-white/14 bg-white/10 px-5 py-4 text-center text-white">
            <Camera className="mx-auto mb-3 h-8 w-8 text-yellow-200" />
            <p className="font-heading text-lg font-black">Membuka kamera</p>
            <p className="mt-1 text-sm font-semibold text-white/72">Gambar tidak disimpan.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SimulatedClassroomScene() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-cream-50 via-sky-100 to-lavender-100">
      <div className="absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-br from-lavender-200 via-cream-100 to-mint-100/60" />
      <div className="absolute left-[8%] top-[18%] h-[18%] w-[26%] rounded-[1.5rem] border-[10px] border-white/80 bg-sky-100 shadow-sm" />
      <div className="absolute right-[9%] top-[18%] h-[20%] w-[28%] rounded-[1.5rem] border-[10px] border-white/80 bg-mint-100 shadow-sm" />
      <div className="absolute left-[12%] bottom-[20%] h-[14%] w-[32%] rounded-[40%_60%_30%_70%] bg-purple-900/10" />
      <div className="absolute right-[14%] bottom-[24%] h-[14%] w-[26%] rounded-[45%_55%_65%_35%] bg-teal-500/15" />
      <div className="absolute left-[42%] bottom-[24%] h-[32%] w-[14%] rounded-t-[1.5rem] bg-white/76 shadow-sm" />
      <div className="absolute left-[45%] bottom-[27%] h-[5%] w-[5%] rounded-full bg-yellow-300" />
      <div className="absolute left-[10%] bottom-[15%] flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-black text-purple-800 shadow-sm">
        <MonitorPlay className="h-4 w-4" />
        Mode simulasi
      </div>
    </div>
  );
}
