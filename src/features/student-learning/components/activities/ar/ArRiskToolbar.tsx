"use client";

import React from "react";
import { Footprints, Layers3, PackageOpen, ShieldAlert, UsersRound } from "lucide-react";
import type { RiskMarkerOption, RiskObjectClass } from "@/features/student-learning/types";

interface ArRiskToolbarProps {
  options: RiskMarkerOption[];
  selectedClass: RiskObjectClass;
  onSelectClass: (className: RiskObjectClass) => void;
  onClearWarnings: () => void;
  /** Mobile mode: renders as horizontal scrollable strip */
  isMobileStrip?: boolean;
}

export function ArRiskToolbar({
  options,
  selectedClass,
  onSelectClass,
  onClearWarnings,
  isMobileStrip = false,
}: ArRiskToolbarProps) {
  if (isMobileStrip) {
    return (
      <div className="relative">
        {/* Gradient fade kiri-kanan supaya keliatan scrollable */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-6 bg-gradient-to-r from-purple-950/60 to-transparent z-10" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-6 bg-gradient-to-l from-purple-950/60 to-transparent z-10" />

        <div
          className="flex gap-2 overflow-x-auto px-3 py-2"
          style={{ scrollbarWidth: "none" }}
        >
          <style>{`.ar-strip::-webkit-scrollbar { display: none; }`}</style>

          {options.map((option) => {
            const isActive = option.className === selectedClass;
            return (
              <button
                key={option.className}
                type="button"
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3 font-heading text-xs font-black transition active:scale-95 ${
                  isActive
                    ? "bg-yellow-200 text-yellow-950 shadow-sm"
                    : "bg-white/14 text-white backdrop-blur"
                }`}
                onClick={() => onSelectClass(option.className)}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isActive ? "bg-white/60" : "bg-white/14"}`}>
                  {renderRiskIcon(option.className, "h-3.5 w-3.5")}
                </span>
                <span className="max-w-[72px] truncate">{option.label}</span>
              </button>
            );
          })}

          {/* Reset pill di ujung */}
          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 font-heading text-xs font-black text-white/70 backdrop-blur transition active:scale-95"
            onClick={onClearWarnings}
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  // Desktop: vertical list (existing behavior)
  return (
    <div className="rounded-[1.4rem] border border-white/18 bg-purple-950/62 p-3 text-white shadow-[0_18px_50px_rgba(25,10,62,0.24)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-heading text-lg font-black leading-none">Tandai Risiko</p>
          <p className="mt-1 text-xs font-bold text-white/66">
            Pilih jenis risiko, lalu tap area kamera.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-white/12 px-4 py-2 font-heading text-xs font-black text-white transition hover:bg-white/18"
          onClick={onClearWarnings}
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => {
          const isActive = option.className === selectedClass;
          return (
            <button
              key={option.className}
              type="button"
              className={`flex min-h-12 items-center gap-2 rounded-[1rem] px-3 py-2 text-left transition ${
                isActive
                  ? "bg-yellow-200 text-yellow-950 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/16"
              }`}
              onClick={() => onSelectClass(option.className)}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] ${isActive ? "bg-white/70" : "bg-white/10"}`}>
                {renderRiskIcon(option.className, "h-5 w-5")}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-sm font-black">
                  {option.label}
                </span>
                <span className={`text-[0.68rem] font-bold leading-tight ${isActive ? "text-yellow-950/68" : "text-white/58"}`}>
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

function renderRiskIcon(className: RiskObjectClass, size = "h-5 w-5") {
  if (className === "glass-zone") return <ShieldAlert className={size} />;
  if (className === "tall-object") return <Layers3 className={size} />;
  if (className === "blocked-path") return <Footprints className={size} />;
  if (className === "crowded-area") return <UsersRound className={size} />;
  return <PackageOpen className={size} />;
}