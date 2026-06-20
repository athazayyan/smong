"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GpsStatus, LatLng } from "../types";

const LOW_ACCURACY_THRESHOLD_M = 50;
const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 2000,
  timeout: 10000,
};

interface UseGeoWatchReturn {
  position: LatLng | null;
  accuracy: number | null;
  gpsStatus: GpsStatus;
  isLowAccuracy: boolean;
  errorMessage: string | null;
  startWatch: () => void;
  stopWatch: () => void;
}

/**
 * Hook untuk memantau posisi GPS user secara real-time via watchPosition.
 * Menangani semua skenario error: PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT.
 */
export function useGeoWatch(): UseGeoWatchReturn {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsStatus((prev) =>
      prev === "watching" || prev === "low-accuracy" ? "idle" : prev
    );
  }, []);

  const startWatch = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("unavailable");
      setErrorMessage(
        "Perangkat ini tidak mendukung layanan lokasi. Fitur beacon GPS tidak dapat digunakan."
      );
      return;
    }

    // Batalkan watch sebelumnya jika ada
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setGpsStatus("requesting");
    setErrorMessage(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setAccuracy(acc);

        if (acc > LOW_ACCURACY_THRESHOLD_M) {
          setGpsStatus("low-accuracy");
        } else {
          setGpsStatus("watching");
        }
        setErrorMessage(null);
      },
      (err) => {
        console.error("[MitigaSee] GPS error:", err.code, err.message);

        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            setGpsStatus("denied");
            setErrorMessage(
              "Izin lokasi ditolak. Aktifkan lokasi di pengaturan browser, lalu coba lagi."
            );
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            setGpsStatus("unavailable");
            setErrorMessage(
              "Sinyal GPS tidak tersedia saat ini. Pastikan kamu berada di area terbuka."
            );
            break;
          case GeolocationPositionError.TIMEOUT:
            setGpsStatus("timeout");
            setErrorMessage(
              "Menunggu sinyal GPS terlalu lama. Coba lagi di lokasi dengan langit terbuka."
            );
            break;
          default:
            setGpsStatus("unavailable");
            setErrorMessage("Terjadi kesalahan tak dikenal saat mengakses lokasi.");
        }
      },
      WATCH_OPTIONS
    );
  }, []);

  // Cleanup otomatis saat komponen unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const isLowAccuracy =
    gpsStatus === "low-accuracy" ||
    (accuracy !== null && accuracy > LOW_ACCURACY_THRESHOLD_M);

  return {
    position,
    accuracy,
    gpsStatus,
    isLowAccuracy,
    errorMessage,
    startWatch,
    stopWatch,
  };
}
