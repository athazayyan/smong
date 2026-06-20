"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, MapPin, X, Check } from "lucide-react";
import type { TitikKumpul } from "../../types";
import { generateId, saveTitikKumpul, compressImage } from "../../lib/storage";

type RegistrationStep =
  | "idle"
  | "getting-gps"
  | "requesting-camera"
  | "capturing"
  | "naming"
  | "saving"
  | "done"
  | "error";

interface TitikKumpulRegistrationProps {
  onSaved: (titik: TitikKumpul) => void;
}

/**
 * Form pendaftaran titik kumpul/evakuasi baru dengan tema gelap premium.
 * Alur: GPS → Kamera → Ambil Foto → Beri Nama → Simpan localStorage
 */
export function TitikKumpulRegistration({
  onSaved,
}: TitikKumpulRegistrationProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<RegistrationStep>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [namaInput, setNamaInput] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // ── 1. Ambil GPS ─────────────────────────────────────────────────────────
  async function handleStart() {
    setStep("getting-gps");
    setErrorMsg(null);
    setCapturedPhoto(null);
    setGpsCoords(null);
    setNamaInput("");

    if (!navigator.geolocation) {
      setErrorMsg(
        "GPS tidak tersedia di perangkat ini. Pastikan kamu menggunakan browser modern."
      );
      setStep("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        await startCamera();
      },
      (err) => {
        let msg = "Gagal mendapatkan lokasi. ";
        if (err.code === 1)
          msg += "Izin lokasi ditolak — aktifkan di pengaturan browser.";
        else if (err.code === 2)
          msg += "Sinyal GPS tidak tersedia. Coba di tempat terbuka.";
        else msg += "Waktu tunggu habis. Coba lagi.";
        setErrorMsg(msg);
        setStep("error");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  // ── 2. Akses kamera ───────────────────────────────────────────────────────
  async function startCamera() {
    setStep("requesting-camera");
    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });
      } catch {
        console.warn("[MitigaSee] facingMode environment gagal, fallback ke kamera default");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 } },
          audio: false,
        });
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        try {
          await video.play();
        } catch (playErr) {
          console.warn("[MitigaSee] video.play() gagal, coba tanpa await:", playErr);
        }
      }
      setStep("capturing");
    } catch (err) {
      const e = err as DOMException;
      let msg = "Gagal mengakses kamera. ";
      if (e.name === "NotAllowedError")
        msg += "Izin kamera ditolak — aktifkan di pengaturan browser lalu muat ulang halaman.";
      else if (e.name === "NotFoundError")
        msg += "Tidak ada kamera ditemukan di perangkat ini.";
      else if (e.name === "NotReadableError")
        msg += "Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain lalu coba lagi.";
      else if (e.name === "OverconstrainedError")
        msg += "Konfigurasi kamera tidak didukung perangkat ini.";
      else msg += `${e.name}: ${e.message}`;
      setErrorMsg(msg);
      setStep("error");
    }
  }

  // ── 3. Capture foto ───────────────────────────────────────────────────────
  async function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    let dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    dataUrl = await compressImage(dataUrl, 800);

    stopStream();
    setCapturedPhoto(dataUrl);
    setStep("naming");
  }

  // ── 4. Simpan ke localStorage ─────────────────────────────────────────────
  async function handleSave() {
    if (!namaInput.trim() || !capturedPhoto || !gpsCoords) return;
    setStep("saving");

    const titik: TitikKumpul = {
      id: generateId(),
      nama: namaInput.trim(),
      lat: gpsCoords.lat,
      lng: gpsCoords.lng,
      fotoBase64: capturedPhoto,
      timestamp: Date.now(),
      accuracy: gpsCoords.accuracy,
    };

    try {
      await saveTitikKumpul(titik);
      onSaved(titik);
      setStep("done");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan. Coba hapus beberapa titik lama.";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  function handleReset() {
    stopStream();
    setStep("idle");
    setErrorMsg(null);
    setCapturedPhoto(null);
    setGpsCoords(null);
    setNamaInput("");
  }

  return (
    <div className="rounded-[1.4rem] border border-purple-800/30 bg-purple-950/60 p-5 shadow-lg backdrop-blur-md">
      <h3 className="mb-4 font-heading text-lg font-black text-white">
        Tandai Titik Kumpul Baru
      </h3>

      {/* IDLE */}
      {step === "idle" && (
        <div className="text-center py-4">
          <p className="mb-5 text-sm font-semibold text-purple-200">
            Pergi ke lokasi titik kumpul (lapangan, koridor, dll.), lalu tekan
            tombol di bawah.
          </p>
          <button
            type="button"
            id="btn-tandai-titik"
            onClick={handleStart}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-heading text-sm font-black text-white shadow-[0_4px_0_#115e59] transition active:translate-y-0.5 active:shadow-[0_2px_0_#115e59] hover:bg-teal-500"
          >
            <MapPin className="h-4 w-4" />
            Tandai Titik Ini
          </button>
        </div>
      )}

      {/* GETTING GPS */}
      {step === "getting-gps" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-900 border-t-teal-400" />
          <p className="text-sm font-semibold text-purple-200">
            Mendapatkan koordinat GPS...
          </p>
          <p className="text-xs text-purple-400/80">Arahkan ke langit terbuka untuk akurasi terbaik</p>
        </div>
      )}

      {/* REQUESTING CAMERA */}
      {step === "requesting-camera" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-900 border-t-purple-500" />
          <p className="text-sm font-semibold text-purple-200">
            Meminta akses kamera...
          </p>
        </div>
      )}

      {/* CAPTURING */}
      {step === "capturing" && (
        <div className="flex flex-col items-center gap-4">
          {gpsCoords && (
            <div className="w-full rounded-xl bg-teal-950/50 border border-teal-850/30 px-3 py-2.5 text-xs font-semibold text-teal-300">
              📍 GPS: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}{" "}
              (±{Math.round(gpsCoords.accuracy)}m)
            </div>
          )}
          <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-purple-800/20">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-56 w-full object-cover"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <button
            type="button"
            onClick={handleCapture}
            className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-heading text-sm font-black text-white shadow-[0_4px_0_#4c1d95] transition active:translate-y-0.5 active:shadow-[0_2px_0_#4c1d95] hover:bg-purple-500"
          >
            <Camera className="h-4 w-4" />
            Ambil Foto
          </button>
        </div>
      )}

      {/* NAMING */}
      {step === "naming" && (
        <div className="flex flex-col gap-4">
          {capturedPhoto && (
            <div className="relative overflow-hidden rounded-2xl border border-purple-800/30 h-40">
              <img
                src={capturedPhoto}
                alt="Foto lokasi"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="nama-titik-input"
              className="mb-1.5 block text-xs font-black uppercase tracking-widest text-purple-400"
            >
              Nama Titik Kumpul
            </label>
            <input
              id="nama-titik-input"
              type="text"
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              placeholder='Contoh: "Lapangan Sekolah"'
              maxLength={60}
              className="w-full rounded-2xl border border-purple-800/30 bg-purple-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-900/40"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-purple-800/30 bg-purple-900/30 font-heading text-sm font-black text-purple-300 transition hover:bg-purple-900/50"
            >
              <X className="h-4 w-4" />
              Ulangi
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!namaInput.trim()}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-teal-650 font-heading text-sm font-black text-white shadow-[0_4px_0_#115e59] transition active:translate-y-0.5 active:shadow-[0_2px_0_#115e59] disabled:opacity-50 hover:bg-teal-555"
            >
              <Check className="h-4 w-4" />
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* SAVING */}
      {step === "saving" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-900 border-t-teal-400" />
          <p className="text-sm font-semibold text-purple-200">Menyimpan titik...</p>
        </div>
      )}

      {/* DONE */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-950/60 border border-teal-800/40 text-teal-400">
            <Check className="h-7 w-7" />
          </div>
          <p className="font-heading text-lg font-black text-teal-400">
            Titik Berhasil Disimpan!
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 rounded-full border border-purple-800/30 bg-purple-900/30 px-5 py-2.5 font-heading text-sm font-black text-purple-300 transition hover:bg-purple-900/50"
          >
            Tandai Titik Lain
          </button>
        </div>
      )}

      {/* ERROR */}
      {step === "error" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-red-800/30 bg-red-950/60 px-4 py-3">
            <p className="text-sm font-semibold text-red-300">
              ⚠️ {errorMsg ?? "Terjadi kesalahan yang tidak diketahui."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full bg-purple-600 px-5 py-2.5 font-heading text-sm font-black text-white shadow-[0_4px_0_#4c1d95] transition active:translate-y-0.5 hover:bg-purple-500"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}
