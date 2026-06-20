"use client";

import { useEffect, useRef, useState } from "react";
import type { GpsStatus } from "../../types";
import { formatDistance } from "../../lib/geo";

interface ArStatusHudProps {
  nearestDistanceM: number | null;
  nearestName: string | null;
  gpsStatus: GpsStatus;
  isLowAccuracy: boolean;
  accuracy: number | null;
  isActive: boolean;
}

const LOW_FPS_THRESHOLD = 15;
const LOW_FPS_DURATION_S = 3;

/**
 * HUD (Heads-Up Display) status AR:
 * - Jarak ke titik kumpul terdekat (update real-time)
 * - FPS counter (pojok kanan bawah, untuk testing/demo)
 * - Peringatan FPS rendah (non-blocking)
 * - Indikator akurasi GPS rendah
 */
export function ArStatusHud({
  nearestDistanceM,
  nearestName,
  gpsStatus,
  isLowAccuracy,
  accuracy,
  isActive,
}: ArStatusHudProps) {
  const [fps, setFps] = useState<number>(0);
  const [showLowFpsWarning, setShowLowFpsWarning] = useState(false);

  const frameTimesRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lowFpsCountRef = useRef(0);

  // ── FPS Counter ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setFps(0);
      setShowLowFpsWarning(false);
      lowFpsCountRef.current = 0;
      return;
    }

    let lastTime = performance.now();

    function countFrame(now: number) {
      frameTimesRef.current.push(now);
      // Jaga window terakhir 1 detik
      frameTimesRef.current = frameTimesRef.current.filter(
        (t) => now - t < 1000
      );
      const currentFps = frameTimesRef.current.length;
      setFps(currentFps);

      // Cek FPS rendah berkelanjutan
      if (currentFps < LOW_FPS_THRESHOLD) {
        lowFpsCountRef.current += (now - lastTime) / 1000;
        if (lowFpsCountRef.current >= LOW_FPS_DURATION_S) {
          setShowLowFpsWarning(true);
        }
      } else {
        lowFpsCountRef.current = 0;
        setShowLowFpsWarning(false);
      }

      lastTime = now;
      rafIdRef.current = requestAnimationFrame(countFrame);
    }

    rafIdRef.current = requestAnimationFrame(countFrame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* ── Jarak ke titik terdekat ── */}
      <div className="pointer-events-none absolute left-3 bottom-20 z-30 rounded-2xl bg-emerald-950/80 px-4 py-3 backdrop-blur-sm">
        {nearestDistanceM !== null ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              Titik Terdekat
            </p>
            <p className="font-heading text-2xl font-black text-emerald-300">
              {formatDistance(nearestDistanceM)}
            </p>
            {nearestName && (
              <p className="text-xs font-semibold text-emerald-400/80">
                {nearestName}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Titik Terdekat
            </p>
            <p className="text-xs font-semibold text-emerald-500">
              {gpsStatus === "denied" || gpsStatus === "unavailable"
                ? "GPS tidak aktif"
                : "Menunggu GPS..."}
            </p>
          </>
        )}
      </div>

      {/* ── Indikator akurasi GPS rendah ── */}
      {isLowAccuracy && (
        <div className="pointer-events-none absolute right-3 bottom-20 z-30 rounded-full bg-amber-950/70 px-3 py-1.5 backdrop-blur-sm">
          <p className="text-[11px] font-semibold text-amber-300">
            📍 Akurasi rendah {accuracy !== null ? `(±${Math.round(accuracy)}m)` : ""}
          </p>
        </div>
      )}

      {/* ── FPS counter (pojok kanan atas) ── */}
      <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
        <p
          className={`font-mono text-[11px] font-bold ${
            fps >= LOW_FPS_THRESHOLD ? "text-green-400" : "text-red-400"
          }`}
        >
          {fps} fps
        </p>
      </div>

      {/* ── Peringatan FPS rendah (non-blocking) ── */}
      {showLowFpsWarning && (
        <div className="pointer-events-none absolute inset-x-4 top-14 z-30 rounded-2xl border border-orange-400/30 bg-orange-950/80 px-4 py-3 backdrop-blur-sm">
          <p className="text-center text-xs font-semibold text-orange-300">
            ⚡ Performa menurun — coba kurangi jumlah titik aktif atau tutup aplikasi lain.
          </p>
        </div>
      )}
    </>
  );
}
