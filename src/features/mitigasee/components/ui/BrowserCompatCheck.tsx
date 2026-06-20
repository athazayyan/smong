"use client";

import { useEffect, useState } from "react";
import type { BrowserCompat } from "../../types";

function detectBrowserCompat(): BrowserCompat {
  const hasGeolocation =
    typeof navigator !== "undefined" && "geolocation" in navigator;
  const hasGetUserMedia =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") ?? canvas.getContext("webgl2")
      );
    } catch {
      return false;
    }
  })();
  const hasWebXR =
    typeof navigator !== "undefined" && "xr" in navigator;

  return {
    hasGeolocation,
    hasGetUserMedia,
    hasWebGL,
    hasWebXR,
    isFullyCompatible:
      hasGeolocation && hasGetUserMedia && hasWebGL,
  };
}

interface BrowserCompatCheckProps {
  children: React.ReactNode;
}

/**
 * Cek kompatibilitas browser SEBELUM user mencoba mengaktifkan fitur AR.
 * Hanya blokir jika API kritis (kamera, WebGL) tidak tersedia.
 * Kekurangan WebXR hanya menampilkan peringatan, bukan blokir.
 */
export function BrowserCompatCheck({ children }: BrowserCompatCheckProps) {
  const [compat, setCompat] = useState<BrowserCompat | null>(null);

  useEffect(() => {
    setCompat(detectBrowserCompat());
  }, []);

  // Masih mengecek
  if (compat === null) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <p className="text-sm font-semibold text-ink-400">
          Memeriksa kompatibilitas perangkat...
        </p>
      </div>
    );
  }

  const criticalMissing = !compat.hasGetUserMedia || !compat.hasWebGL;

  if (criticalMissing) {
    return (
      <div className="mx-auto max-w-lg px-6 py-12 text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-coral-50 text-coral-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-8 w-8"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-heading text-2xl font-black text-ink-900">
          Browser Tidak Kompatibel
        </h2>
        <p className="mt-3 text-sm font-semibold leading-7 text-ink-700">
          Fitur MitigaSee AR membutuhkan akses kamera dan dukungan WebGL,
          yang tidak tersedia di browser ini.
        </p>

        <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm">
          <CompatRow
            label="Akses Kamera"
            ok={compat.hasGetUserMedia}
            required
          />
          <CompatRow label="WebGL (3D)" ok={compat.hasWebGL} required />
          <CompatRow label="GPS / Lokasi" ok={compat.hasGeolocation} />
          <CompatRow label="WebXR (Panah AR)" ok={compat.hasWebXR} />
        </ul>

        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
          <p className="text-xs font-semibold text-sky-800">
            💡 Gunakan <strong>Chrome terbaru</strong> di Android atau desktop
            untuk pengalaman terbaik.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Peringatan non-blokir jika ada fitur yang tidak tersedia */}
      {(!compat.hasGeolocation || !compat.hasWebXR) && (
        <div className="mx-4 mb-3 mt-2 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">
            ⚠️ Beberapa fitur tidak tersedia di browser ini:{" "}
            {!compat.hasGeolocation && "GPS (beacon dinonaktifkan) "}
            {!compat.hasWebXR && "WebXR (panah AR dinonaktifkan)"}. Fitur
            lainnya tetap berjalan.
          </p>
        </div>
      )}
      {children}
    </>
  );
}

function CompatRow({
  label,
  ok,
  required = false,
}: {
  label: string;
  ok: boolean;
  required?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
          ok
            ? "bg-teal-100 text-teal-700"
            : required
            ? "bg-coral-50 text-coral-600"
            : "bg-amber-50 text-amber-600"
        }`}
      >
        {ok ? "✓" : "✗"}
      </span>
      <span className="font-semibold text-ink-700">{label}</span>
      {!ok && required && (
        <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-black text-coral-700">
          Diperlukan
        </span>
      )}
      {!ok && !required && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
          Opsional
        </span>
      )}
    </li>
  );
}
