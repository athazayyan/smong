"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, List, Plus, Square, AlertTriangle, Navigation } from "lucide-react";
import Link from "next/link";

import type { TitikKumpul, MitigaSeeTab, ArMode } from "../types";
import { getAllTitikKumpul, deleteTitikKumpul } from "../lib/storage";
import { findNearestTitik } from "../lib/geo";

import { useGeoWatch } from "../hooks/useGeoWatch";
import { useWebXR } from "../hooks/useWebXR";
import { useArScene } from "../hooks/useArScene";

import { ErrorBoundary } from "./ui/ErrorBoundary";
import { BrowserCompatCheck } from "./ui/BrowserCompatCheck";
import { ArStatusHud } from "./ui/ArStatusHud";
import { BeaconLayer } from "./layers/BeaconLayer";
import { SurfaceArrowLayer } from "./layers/SurfaceArrowLayer";
import { ObjectDetectionLayer } from "./layers/ObjectDetectionLayer";
import { TitikKumpulRegistration } from "./registration/TitikKumpulRegistration";
import { TitikKumpulList } from "./registration/TitikKumpulList";

const TAB_ITEMS: { id: MitigaSeeTab; label: string; icon: React.ReactNode }[] = [
  { id: "ar", label: "Mode AR", icon: <Radio className="h-4 w-4" /> },
  { id: "daftar", label: "Daftar Titik", icon: <List className="h-4 w-4" /> },
  { id: "tambah", label: "Tambah Titik", icon: <Plus className="h-4 w-4" /> },
];

/**
 * Komponen orkestrasi utama MitigaSee AR.
 * Mengelola 3 lapis AR secara independen — kegagalan satu lapis
 * tidak mempengaruhi lapis lainnya.
 */
export function MitigaSeeArPage() {
  const [activeTab, setActiveTab] = useState<MitigaSeeTab>("ar");
  const [arMode, setArMode] = useState<ArMode>("idle");
  const [titikList, setTitikList] = useState<TitikKumpul[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Hooks ────────────────────────────────────────────────────────────────
  const {
    position: userPosition,
    gpsStatus,
    accuracy,
    isLowAccuracy,
    errorMessage: gpsError,
    startWatch,
    stopWatch,
  } = useGeoWatch();

  const { xrStatus, hitInfo, startSession, endSession } = useWebXR();

  const {
    canvasRef,
    rendererRef,
    sceneRef,
    cameraRef,
    initScene,
    disposeScene,
    startRenderLoop,
    stopRenderLoop,
  } = useArScene();

  const isArActive = arMode === "ar-active";

  // ── Muat titik dari localStorage ────────────────────────────────────────
  useEffect(() => {
    setTitikList(getAllTitikKumpul());
  }, []);

  // ── Kalkulasi titik terdekat ─────────────────────────────────────────────
  const nearestResult =
    userPosition && titikList.length > 0
      ? findNearestTitik(userPosition, titikList)
      : null;

  // ── Mulai AR ─────────────────────────────────────────────────────────────
  const handleStartAr = useCallback(async () => {
    if (titikList.length === 0) {
      setActiveTab("tambah");
      return;
    }

    setArMode("ar-active");
    startWatch();

    // Inisialisasi Three.js scene
    if (canvasRef.current) {
      initScene();
      startRenderLoop();
    }

    // Mulai kamera untuk video feed + Lapis C
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("[MitigaSee] Kamera gagal untuk AR:", err);
      // Lapis A & B tetap bisa berjalan tanpa video feed
    }

    // Coba WebXR (Lapis B) — gagal tidak menghentikan Lapis A & C
    if (canvasRef.current) {
      void startSession(canvasRef.current).catch((err) => {
        console.warn("[MitigaSee] WebXR tidak dimulai:", err);
      });
    }
  }, [titikList.length, startWatch, canvasRef, initScene, startRenderLoop, startSession]);

  // ── Berhenti AR ──────────────────────────────────────────────────────────
  const handleStopAr = useCallback(async () => {
    setArMode("stopped");
    stopWatch();
    stopRenderLoop();

    // Hentikan kamera
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Akhiri sesi WebXR
    await endSession().catch(() => {});

    // Dispose Three.js resources
    disposeScene();
  }, [stopWatch, stopRenderLoop, endSession, disposeScene]);

  // ── Cleanup saat unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      void handleStopAr();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Hapus titik kumpul ───────────────────────────────────────────────────
  function handleDeleteTitik(id: string) {
    deleteTitikKumpul(id);
    setTitikList((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Titik baru ditambahkan ───────────────────────────────────────────────
  function handleTitikSaved(titik: TitikKumpul) {
    setTitikList((prev) => [titik, ...prev]);
    setActiveTab("daftar");
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <BrowserCompatCheck>
        <main
          className="min-h-screen bg-cream-50 text-ink-900"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* ── Header ── */}
          <header className="sticky top-0 z-40 border-b border-purple-700/8 bg-cream-50/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Link
                  href="/siswa"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-700/10 bg-white text-purple-700 shadow-sm transition hover:bg-lavender-100"
                  aria-label="Kembali"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <div>
                  <p className="font-heading text-base font-black text-ink-900 leading-none">
                    MitigaSee
                  </p>
                  <p className="text-[11px] font-semibold text-ink-400">
                    Titik Kumpul AR
                  </p>
                </div>
              </div>

              {/* Status GPS */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                  gpsStatus === "watching"
                    ? "bg-teal-100 text-teal-700"
                    : gpsStatus === "low-accuracy"
                    ? "bg-amber-100 text-amber-700"
                    : gpsStatus === "denied" || gpsStatus === "unavailable"
                    ? "bg-coral-50 text-coral-600"
                    : "bg-lavender-100 text-purple-600"
                }`}
              >
                <Navigation className="h-3 w-3" />
                {gpsStatus === "watching"
                  ? "GPS Aktif"
                  : gpsStatus === "low-accuracy"
                  ? "GPS Lemah"
                  : gpsStatus === "requesting"
                  ? "GPS..."
                  : gpsStatus === "denied"
                  ? "GPS Ditolak"
                  : gpsStatus === "unavailable"
                  ? "GPS N/A"
                  : "GPS Off"}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mx-auto flex max-w-3xl gap-1 px-4 pb-2">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition ${
                    activeTab === tab.id
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-ink-700 hover:bg-lavender-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {/* ── Konten Tab ── */}
          <div className="mx-auto max-w-3xl px-4 py-4">
            <AnimatePresence mode="wait">
              {/* TAB: MODE AR */}
              {activeTab === "ar" && (
                <motion.div
                  key="ar"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Error GPS ketika AR aktif */}
                  {isArActive && gpsError && (
                    <div className="mb-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <p className="text-xs font-semibold text-amber-800">{gpsError}</p>
                      </div>
                    </div>
                  )}

                  {/* Canvas AR + Video feed */}
                  <div className="relative overflow-hidden rounded-[1.8rem] border border-purple-700/10 bg-purple-950 shadow-[0_24px_80px_rgba(25,10,62,0.22)]"
                    style={{ height: "min(70svh, 520px)" }}
                  >
                    {/* Video feed (kamera) */}
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        isArActive ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    {/* Three.js canvas (transparan di atas video) */}
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 h-full w-full"
                      style={{ pointerEvents: "none" }}
                    />

                    {/* Idle state */}
                    {!isArActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-purple-900/60 text-emerald-400">
                          <Radio className="h-10 w-10" />
                        </div>
                        <div>
                          <h2 className="font-heading text-2xl font-black text-white">
                            MitigaSee AR
                          </h2>
                          <p className="mt-2 text-sm font-semibold text-purple-300">
                            Temukan titik kumpul terdekat lewat AR berbasis lokasi
                          </p>
                        </div>

                        {titikList.length === 0 ? (
                          <div className="rounded-2xl border border-amber-400/30 bg-amber-950/60 px-5 py-4">
                            <p className="text-sm font-semibold text-amber-300">
                              Belum ada titik kumpul terdaftar.
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveTab("tambah")}
                              className="mt-3 rounded-full bg-amber-600 px-5 py-2 font-heading text-xs font-black text-white transition hover:bg-amber-500"
                            >
                              Tandai Titik Pertama
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            id="btn-mulai-ar"
                            onClick={handleStartAr}
                            className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 font-heading text-base font-black text-white shadow-[0_6px_0_#14532d] transition active:translate-y-1 active:shadow-[0_3px_0_#14532d]"
                          >
                            <Radio className="h-5 w-5" />
                            Mulai AR
                          </button>
                        )}
                      </div>
                    )}

                    {/* AR Aktif: Layer komponen */}
                    {isArActive && (
                      <>
                        {/* Lapis A: Beacon GPS */}
                        <ErrorBoundary
                          fallback={
                            <div className="pointer-events-none absolute left-3 top-16 z-20 rounded-full bg-red-950/70 px-3 py-1.5 text-xs font-semibold text-red-300">
                              ⚠️ Beacon GPS error
                            </div>
                          }
                        >
                          <BeaconLayer
                            sceneRef={sceneRef}
                            cameraRef={cameraRef}
                            titikKumpulList={titikList}
                            userPosition={userPosition}
                            isActive={isArActive}
                          />
                        </ErrorBoundary>

                        {/* Lapis B: Panah Surface-AR */}
                        <ErrorBoundary
                          fallback={
                            <div className="pointer-events-none absolute left-3 top-24 z-20 rounded-full bg-amber-950/70 px-3 py-1.5 text-xs font-semibold text-amber-300">
                              ⚠️ Panah AR nonaktif
                            </div>
                          }
                        >
                          <SurfaceArrowLayer
                            sceneRef={sceneRef}
                            xrStatus={xrStatus}
                            hitInfo={hitInfo}
                            userPosition={userPosition}
                            nearestTitik={nearestResult?.titik ?? null}
                            isActive={isArActive}
                          />
                        </ErrorBoundary>

                        {/* Lapis C: Deteksi Objek */}
                        <ErrorBoundary
                          fallback={
                            <div className="pointer-events-none absolute left-3 top-32 z-20 rounded-full bg-indigo-950/70 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                              ⚠️ Deteksi objek nonaktif
                            </div>
                          }
                        >
                          <ObjectDetectionLayer
                            videoRef={videoRef}
                            isActive={isArActive}
                          />
                        </ErrorBoundary>

                        {/* HUD */}
                        <ArStatusHud
                          nearestDistanceM={nearestResult?.distanceM ?? null}
                          nearestName={nearestResult?.titik.nama ?? null}
                          gpsStatus={gpsStatus}
                          isLowAccuracy={isLowAccuracy}
                          accuracy={accuracy}
                          isActive={isArActive}
                        />

                        {/* Tombol Stop */}
                        <button
                          type="button"
                          id="btn-stop-ar"
                          onClick={handleStopAr}
                          className="absolute right-3 top-3 z-40 flex items-center gap-1.5 rounded-full border border-white/20 bg-purple-950/70 px-4 py-2 font-heading text-xs font-black text-white backdrop-blur-sm transition hover:bg-purple-950/90"
                        >
                          <Square className="h-3 w-3" />
                          Berhenti
                        </button>
                      </>
                    )}
                  </div>

                  {/* Info singkat 3 lapis */}
                  {!isArActive && titikList.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <LayerInfoCard
                        color="emerald"
                        label="Lapis A"
                        title="Beacon GPS"
                        desc="Pilar cahaya ke tiap titik kumpul"
                      />
                      <LayerInfoCard
                        color="amber"
                        label="Lapis B"
                        title="Panah AR"
                        desc="Panah di permukaan (WebXR)"
                      />
                      <LayerInfoCard
                        color="indigo"
                        label="Lapis C"
                        title="Deteksi Risiko"
                        desc="COCO-SSD: kursi, meja, dll."
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB: DAFTAR TITIK */}
              {activeTab === "daftar" && (
                <motion.div
                  key="daftar"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ErrorBoundary>
                    <TitikKumpulList
                      titikList={titikList}
                      userPosition={userPosition}
                      onDelete={handleDeleteTitik}
                    />
                  </ErrorBoundary>
                </motion.div>
              )}

              {/* TAB: TAMBAH TITIK */}
              {activeTab === "tambah" && (
                <motion.div
                  key="tambah"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ErrorBoundary>
                    <TitikKumpulRegistration onSaved={handleTitikSaved} />
                  </ErrorBoundary>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </BrowserCompatCheck>
    </ErrorBoundary>
  );
}

// ─── Helper: Layer info card ──────────────────────────────────────────────────
type LayerColor = "emerald" | "amber" | "indigo";
const COLOR_MAP: Record<LayerColor, string> = {
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
};

function LayerInfoCard({
  color,
  label,
  title,
  desc,
}: {
  color: LayerColor;
  label: string;
  title: string;
  desc: string;
}) {
  return (
    <article
      className={`rounded-2xl border p-3 ${COLOR_MAP[color]}`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="mt-0.5 font-heading text-sm font-black">{title}</p>
      <p className="mt-1 text-[11px] font-semibold leading-4 opacity-75">{desc}</p>
    </article>
  );
}
