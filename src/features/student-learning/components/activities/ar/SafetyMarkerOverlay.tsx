import React from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import type { ArWarning } from "@/features/student-learning/types";

interface SafetyMarkerOverlayProps {
  warnings: ArWarning[];
  onRemoveWarning: (warningId: string) => void;
  onSelectWarning?: (warning: ArWarning) => void;
}

export function SafetyMarkerOverlay({ warnings, onRemoveWarning, onSelectWarning }: SafetyMarkerOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {warnings.map((warning) => {
        const tone = getWarningTone(warning.riskLevel);
        return (
          <div
            key={warning.id}
            onClick={() => onSelectWarning?.(warning)}
            className={`pointer-events-auto absolute min-h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 rounded-[1.15rem] border-2 px-3 py-2 text-left shadow-[0_12px_30px_rgba(25,10,62,0.22)] backdrop-blur ${
              onSelectWarning ? "cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-200" : ""
            } ${tone.shell}`}
            style={{
              left: `${warning.xPercent}%`,
              top: `${warning.yPercent}%`,
            }}
          >
            <div className="flex items-start gap-2">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
                {warning.riskLevel === "high" ? <AlertTriangle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </span>
              <div className="hidden max-w-[170px] sm:block">
                <p className="font-heading text-sm font-black leading-none">{warning.title}</p>
                <p className="mt-1 text-[0.68rem] font-bold leading-tight opacity-80">{warning.actionLabel}</p>
              </div>
              <button
                type="button"
                aria-label={`Hapus warning ${warning.title}`}
                className={`ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.close}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveWarning(warning.id);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getWarningTone(riskLevel: ArWarning["riskLevel"]) {
  if (riskLevel === "high") {
    return {
      shell: "border-yellow-200 bg-yellow-200/92 text-yellow-950",
      icon: "bg-white text-yellow-800",
      close: "bg-white/70 text-yellow-900",
    };
  }

  if (riskLevel === "medium") {
    return {
      shell: "border-mint-100 bg-teal-700/88 text-white",
      icon: "bg-mint-100 text-teal-800",
      close: "bg-white/14 text-white",
    };
  }

  return {
    shell: "border-lavender-100 bg-white/88 text-purple-900",
    icon: "bg-lavender-100 text-purple-700",
    close: "bg-lavender-100 text-purple-700",
  };
}
