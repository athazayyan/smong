import React from "react";
import { Footprints, Layers3, PackageOpen, ShieldAlert, UsersRound } from "lucide-react";
import type { RiskMarkerOption, RiskObjectClass } from "@/features/student-learning/types";

interface ArRiskToolbarProps {
  options: RiskMarkerOption[];
  selectedClass: RiskObjectClass;
  onSelectClass: (className: RiskObjectClass) => void;
  onClearWarnings: () => void;
}

export function ArRiskToolbar({ options, selectedClass, onSelectClass, onClearWarnings }: ArRiskToolbarProps) {
  return (
    <div className="rounded-[1.4rem] border border-white/18 bg-purple-950/62 p-3 text-white shadow-[0_18px_50px_rgba(25,10,62,0.24)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-heading text-lg font-black leading-none">Tandai Risiko</p>
          <p className="mt-1 text-xs font-bold text-white/66">Pilih jenis risiko, lalu tap area kamera.</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-white/12 px-4 py-2 font-heading text-xs font-black text-white transition hover:bg-white/18"
          onClick={onClearWarnings}
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {options.map((option) => {
          const isActive = option.className === selectedClass;
          return (
            <button
              key={option.className}
              type="button"
              className={`flex min-h-12 items-center gap-2 rounded-[1rem] px-3 py-2 text-left transition ${
                isActive ? "bg-yellow-200 text-yellow-950 shadow-sm" : "bg-white/10 text-white hover:bg-white/16"
              }`}
              onClick={() => onSelectClass(option.className)}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] ${isActive ? "bg-white/70" : "bg-white/10"}`}>
                {renderRiskIcon(option.className)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-sm font-black">{option.label}</span>
                <span className={`hidden text-[0.68rem] font-bold leading-tight lg:block ${isActive ? "text-yellow-950/68" : "text-white/58"}`}>
                  {option.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function renderRiskIcon(className: RiskObjectClass) {
  if (className === "glass-zone") return <ShieldAlert className="h-5 w-5" />;
  if (className === "tall-object") return <Layers3 className="h-5 w-5" />;
  if (className === "blocked-path") return <Footprints className="h-5 w-5" />;
  if (className === "crowded-area") return <UsersRound className="h-5 w-5" />;
  return <PackageOpen className="h-5 w-5" />;
}
