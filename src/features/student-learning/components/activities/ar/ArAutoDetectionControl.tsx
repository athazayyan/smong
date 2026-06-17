"use client";

import React from "react";
import { Bot, Cpu, LoaderCircle, Radar, ScanLine, TriangleAlert } from "lucide-react";
import type { ArDetectorStatus } from "@/features/student-learning/types";

interface ArAutoDetectionControlProps {
  status: ArDetectorStatus;
  enabled: boolean;
  disabled: boolean;
  errorMessage: string | undefined;
  onToggle: () => void;
  /** Mobile mode: renders as compact icon button */
  isMobileIcon?: boolean;
}

export function ArAutoDetectionControl({
  status,
  enabled,
  disabled,
  errorMessage,
  onToggle,
  isMobileIcon = false,
}: ArAutoDetectionControlProps) {
  if (isMobileIcon) {
    return (
      <button
        type="button"
        aria-label={enabled ? "Nonaktifkan deteksi otomatis" : "Aktifkan deteksi otomatis"}
        aria-pressed={enabled}
        disabled={disabled}
        onClick={onToggle}
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 backdrop-blur transition active:scale-95 disabled:opacity-40 ${
          enabled
            ? "animate-pulse border-mint-100 bg-teal-700/80 text-mint-100"
            : "border-white/20 bg-purple-950/60 text-white/70"
        }`}
      >
        {enabled ? (
          <ScanLine className="h-5 w-5" />
        ) : (
          <Cpu className="h-5 w-5" />
        )}
      </button>
    );
  }

  // Desktop: full card (existing behavior)
  const statusCopy = getStatusCopy(status, enabled, disabled, errorMessage);

  return (
    <section className="rounded-[1.4rem] border border-white/18 bg-white/90 p-4 text-ink-900 shadow-[0_18px_50px_rgba(25,10,62,0.18)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-lavender-100 px-3 py-1.5 font-heading text-xs font-black uppercase tracking-[0.12em] text-purple-700">
            <Bot className="h-4 w-4" />
            YOLO Browser
          </p>
          <h2 className="mt-3 font-heading text-xl font-black text-ink-900">
            Deteksi Otomatis
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-ink-700">{statusCopy}</p>
        </div>
        <button
          type="button"
          className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 py-2 font-heading text-xs font-black transition ${
            enabled
              ? "bg-purple-900 text-white shadow-[0_4px_0_#20104f]"
              : "bg-lavender-100 text-purple-800"
          } disabled:cursor-not-allowed disabled:opacity-55`}
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={enabled}
        >
          {enabled ? "Aktif" : "Nyalakan"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[1rem] bg-cream-50 px-3 py-2 text-sm font-bold text-ink-700">
        {renderStatusIcon(status)}
        <span>{getStatusLabel(status)}</span>
      </div>
    </section>
  );
}

function renderStatusIcon(status: ArDetectorStatus) {
  if (status === "loading" || status === "running") {
    return <LoaderCircle className="h-4 w-4 animate-spin text-purple-700" />;
  }
  if (status === "error" || status === "disabled") {
    return <TriangleAlert className="h-4 w-4 text-yellow-700" />;
  }
  return <Radar className="h-4 w-4 text-teal-700" />;
}

function getStatusLabel(status: ArDetectorStatus) {
  if (status === "loading") return "Memuat model";
  if (status === "ready") return "Model siap";
  if (status === "running") return "Deteksi aktif";
  if (status === "error") return "Model gagal dimuat";
  if (status === "disabled") return "Deteksi dijeda";
  return "Menunggu kamera";
}

function getStatusCopy(
  status: ArDetectorStatus,
  enabled: boolean,
  disabled: boolean,
  errorMessage: string | undefined
) {
  if (disabled) return "Mulai kamera terlebih dahulu untuk memakai deteksi otomatis.";
  if (status === "error") return errorMessage ?? "Model belum bisa dimuat. Kamu tetap bisa tandai risiko manual.";
  if (status === "disabled") return "Deteksi otomatis dijeda. Kamu tetap bisa tandai risiko manual.";
  if (status === "loading") return "Smong sedang menyiapkan model di browser.";
  if (status === "running") return "Smong membaca objek umum dan mengubahnya menjadi warning belajar.";
  if (enabled) return "Model siap membaca objek umum seperti orang, tas, kursi, meja, botol, dan buku.";
  return "Nyalakan saat kamera aktif. Gambar tetap diproses di perangkat ini.";
}