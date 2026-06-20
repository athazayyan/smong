"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, List, Plus, Square, AlertTriangle, Navigation } from "lucide-react";
import Link from "next/link";

import type { TitikKumpul, MitigaSeeTab, ArMode } from "../types";
import { getAllTitikKumpul, deleteTitikKumpul } from "../lib/storage";
import { findNearestTitik, formatDistance } from "../lib/geo";

import { useGeoWatch } from "../hooks/useGeoWatch";
import { useWebXR } from "../hooks/useWebXR";
import { useArScene } from "../hooks/useArScene";

import { ErrorBoundary } from "./ui/ErrorBoundary";
import { BrowserCompatCheck } from "./ui/BrowserCompatCheck";
import { ArStatusHud } from "./ui/ArStatusHud";
import { BeaconLayer } from "./layers/BeaconLayer";
import { SurfaceArrowLayer } from "./layers/SurfaceArrowLayer";
import { TitikKumpulRegistration } from "./registration/TitikKumpulRegistration";
import { TitikKumpulList } from "./registration/TitikKumpulList";

// Import integrasi Safety Lens
import { standaloneArSafetyLensActivity } from "@/features/student-learning/data/arSafetyLensData";
import { buildArWarnings, createManualDetection, getRiskClassLabel } from "@/features/student-learning/lib/ar/markerRules";
import { CocoSsdDetector } from "@/features/student-learning/lib/ar/cocoDetector";
import { SafetyMarkerOverlay } from "@/features/student-learning/components/activities/ar/SafetyMarkerOverlay";
import { ArRiskToolbar } from "@/features/student-learning/components/activities/ar/ArRiskToolbar";
import { ArAutoDetectionControl } from "@/features/student-learning/components/activities/ar/ArAutoDetectionControl";
import { ArFeedbackPanel } from "@/features/student-learning/components/activities/ar/ArFeedbackPanel";
import type { RiskObjectClass, ObjectDetectionResult, ArDetectorStatus } from "@/features/student-learning/types";

const TAB_ITEMS: { id: MitigaSeeTab; label: string; icon: React.ReactNode }[] = [
  { id: "ar", label: "Mode AR", icon: <Radio className="h-4 w-4" /> },
  { id: "daftar", label: "Daftar Titik", icon: <List className="h-4 w-4" /> },
  { id: "tambah", label: "Tambah Titik", icon: <Plus className="h-4 w-4" /> },
];

export function MitigaSeeArPage() {
  const [activeTab, setActiveTab] = useState<MitigaSeeTab>("ar");
  const [arMode, setArMode] = useState<ArMode>("idle");
  const [titikList, setTitikList] = useState<TitikKumpul[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── State untuk Integrasi Safety Lens ──────────────────────────────────
  const [manualDetections, setManualDetections] = useState<ObjectDetectionResult[]>([]);
  const [modelDetections, setModelDetections] = useState<ObjectDetectionResult[]>([]);
  const [selectedRiskClass, setSelectedRiskClass] = useState<RiskObjectClass>("glass-zone");
  const [isAutoDetectionEnabled, setIsAutoDetectionEnabled] = useState(false);
  const [detectorStatus, setDetectorStatus] = useState<ArDetectorStatus>("idle");
  const [detectorErrorMessage, setDetectorErrorMessage] = useState<string | undefined>(undefined);

  const detectorRef = useRef<CocoSsdDetector | null>(null);
  const boundingBoxCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const markerCounterRef = useRef(0);

  // ── Drag to Look Camera Rotation (Desktop Fallback) ─────────────────────
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const startRotationY = useRef(0);
  const startRotationX = useRef(0);

  // ── Hooks MitigaSee ──────────────────────────────────────────────────────
  const {
    position: userPosition,
    gpsStatus,
    accuracy,
    isLowAccuracy,
    errorMessage: gpsError,
    startWatch,
    stopWatch,
  } = useGeoWatch();

  const { xrStatus, hitInfo, startSession, endSession, updateHitTest } = useWebXR();

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

  // ── Load data awal ───────────────────────────────────────────────────────
  useEffect(() => {
    setTitikList(getAllTitikKumpul());
  }, []);

  // Clean up detector
  useEffect(() => {
    return () => {
      detectorRef.current?.dispose();
      detectorRef.current = null;
    };
  }, []);

  // ── Listener untuk Kompas / Heading Perangkat (Mobile Fallback) ────────────
  useEffect(() => {
    if (!isArActive || typeof window === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Jangan timpa jika user sedang melakukan drag manual
      if (isDragging.current) return;

      const camera = cameraRef.current;
      if (!camera) return;

      // iOS Compass heading
      if ("webkitCompassHeading" in e) {
        const heading = (e as any).webkitCompassHeading;
        if (typeof heading === "number") {
          camera.rotation.y = -((heading * Math.PI) / 180);
        }
      }
      // Android / Standard (alpha)
      else if (e.alpha !== null) {
        // e.alpha bertambah berlawanan arah jarum jam dari utara
        camera.rotation.y = -(((360 - e.alpha) * Math.PI) / 180);
      }
    };

    const win = window as any;
    if ("ondeviceorientationabsolute" in win) {
      win.addEventListener("deviceorientationabsolute", handleOrientation);
    } else {
      win.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      win.removeEventListener("deviceorientationabsolute", handleOrientation);
      win.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isArActive, cameraRef]);


  // ── Safety Lens Warnings Memo ─────────────────────────────────────────────
  const detections = useMemo(
    () => [...manualDetections, ...modelDetections],
    [manualDetections, modelDetections]
  );

  const warnings = useMemo(
    () => buildArWarnings(detections, standaloneArSafetyLensActivity.warningRules),
    [detections]
  );

  // ── Kalkulasi titik terdekat ─────────────────────────────────────────────
  const nearestResult = useMemo(() => {
    return userPosition && titikList.length > 0
      ? findNearestTitik(userPosition, titikList)
      : null;
  }, [userPosition, titikList]);

  // ── Mulai AR ─────────────────────────────────────────────────────────────
  const handleStartAr = useCallback(async () => {
    if (titikList.length === 0) {
      setActiveTab("tambah");
      return;
    }

    setArMode("ar-active");
    startWatch();
    setIsAutoDetectionEnabled(true); // Aktifkan COCO-SSD secara otomatis saat AR dimulai!

    // Minta izin sensor orientasi perangkat di iOS jika dibutuhkan
    if (
      typeof window !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response !== "granted") {
          console.warn("[MitigaSee] Izin sensor orientasi perangkat ditolak");
        }
      } catch (err) {
        console.warn("[MitigaSee] Gagal meminta izin sensor:", err);
      }
    }

    // Inisialisasi Three.js scene
    if (canvasRef.current) {
      initScene();
      startRenderLoop((_delta, frame) => {
        if (frame && rendererRef.current) {
          updateHitTest(frame, rendererRef.current);
        }
      });
    }

    // Mulai kamera untuk video feed + Lapis C
    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });
      } catch {
        console.warn("[MitigaSee] Kamera environment tidak tersedia, fallback kamera default");
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
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
          console.warn("[MitigaSee] video.play() gagal:", playErr);
        }
      }
    } catch (err) {
      console.error("[MitigaSee] Kamera gagal untuk AR:", err);
    }

    // Coba WebXR (Lapis B)
    if (canvasRef.current && rendererRef.current) {
      void startSession(canvasRef.current, rendererRef.current).catch((err) => {
        console.warn("[MitigaSee] WebXR tidak dimulai:", err);
      });
    }
  }, [titikList.length, startWatch, canvasRef, rendererRef, initScene, startRenderLoop, startSession, updateHitTest]);

  // ── Berhenti AR ──────────────────────────────────────────────────────────
  const handleStopAr = useCallback(async () => {
    setArMode("stopped");
    stopWatch();
    stopRenderLoop();
    setIsAutoDetectionEnabled(false);
    setDetectorStatus("idle");
    setManualDetections([]);
    setModelDetections([]);

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

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      void handleStopAr();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper Bounding Boxes dengan Neon Style ────────────────────────────────
  const drawBoundingBoxes = useCallback((
    canvas: HTMLCanvasElement | null,
    video: HTMLVideoElement | null,
    predictions: ObjectDetectionResult[]
  ) => {
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Menghindari ukuran canvas 0
    const width = canvas.clientWidth || video.clientWidth || 640;
    const height = canvas.clientHeight || video.clientHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const det of predictions) {
      if (det.source === "manual" || det.source === "simulated") continue;
      const { xPercent, yPercent, widthPercent, heightPercent } = det.box;
      const sx = xPercent * scaleX;
      const sy = yPercent * scaleY;
      const sw = widthPercent * scaleX;
      const sh = heightPercent * scaleY;

      // Draw glowing neon stroke
      ctx.strokeStyle = "#ff007f";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#ff007f";
      ctx.shadowBlur = 10;
      ctx.strokeRect(sx, sy, sw, sh);

      // Reset shadow untuk teks
      ctx.shadowBlur = 0;

      // Label background
      const label = `${getRiskClassLabel(det.className)} ${Math.round((det.confidence || 1) * 100)}%`;
      ctx.font = "bold 12px sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(127,29,29,0.85)";
      ctx.fillRect(sx, sy - 20, tw + 8, 20);

      // Label text
      ctx.fillStyle = "#fca5a5";
      ctx.fillText(label, sx + 4, sy - 5);
    }
  }, []);

  // ── Auto Detection Loop (COCO-SSD) ────────────────────────────────────────
  const getCocoDetector = useCallback(async () => {
    if (detectorRef.current === null) {
      detectorRef.current = new CocoSsdDetector();
      await detectorRef.current.load();
      setDetectorStatus("ready");
    }
    return detectorRef.current;
  }, []);

  useEffect(() => {
    if (!isAutoDetectionEnabled || arMode !== "ar-active") {
      setModelDetections([]);
      if (boundingBoxCanvasRef.current) {
        const ctx = boundingBoxCanvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, boundingBoxCanvasRef.current.width, boundingBoxCanvasRef.current.height);
      }
      return;
    }

    let isCancelled = false;
    let timeoutId: number | undefined;
    let errorCount = 0;

    async function runDetectionLoop() {
      const video = videoRef.current;
      if (video === null || video.readyState < 2) {
        scheduleNextDetection();
        return;
      }

      try {
        setDetectorStatus((current) => (current === "idle" ? "loading" : current));
        const detector = await getCocoDetector();
        if (isCancelled) return;

        setDetectorStatus("running");
        const nextDetections = await detector.detect(video);
        if (isCancelled) return;

        errorCount = 0;
        setDetectorErrorMessage(undefined);
        setModelDetections(nextDetections);

        drawBoundingBoxes(boundingBoxCanvasRef.current, video, nextDetections);
        scheduleNextDetection();
      } catch (err) {
        if (isCancelled) return;
        errorCount += 1;
        if (errorCount >= 3) {
          setDetectorStatus("disabled");
          setDetectorErrorMessage("Deteksi otomatis dijeda. Kamu tetap bisa tandai risiko manual.");
          setIsAutoDetectionEnabled(false);
          setModelDetections([]);
          return;
        }
        setDetectorStatus("error");
        setDetectorErrorMessage("Model belum bisa membaca kamera. Kamu tetap bisa tandai risiko manual.");
        scheduleNextDetection();
      }
    }

    function scheduleNextDetection() {
      timeoutId = window.setTimeout(runDetectionLoop, 800);
    }

    void runDetectionLoop();

    return () => {
      isCancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [getCocoDetector, isAutoDetectionEnabled, arMode, drawBoundingBoxes]);

  // ── Penanganan Pointer untuk Drag dan Klik ──────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const camera = cameraRef.current;
    if (!camera || (rendererRef.current?.xr.isPresenting)) return;
    isDragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startRotationY.current = camera.rotation.y;
    startRotationX.current = camera.rotation.x;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [cameraRef, rendererRef]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const camera = cameraRef.current;
    if (!camera) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    camera.rotation.y = startRotationY.current - dx * 0.0055;
    camera.rotation.x = Math.max(
      -Math.PI / 2.4,
      Math.min(Math.PI / 2.4, startRotationX.current - dy * 0.0055)
    );
  }, [cameraRef]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const dx = Math.abs(e.clientX - startX.current);
    const dy = Math.abs(e.clientY - startY.current);

    // Clicks trigger (if dragged less than 5 pixels)
    if (dx < 5 && dy < 5) {
      if (!isArActive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const xPercent = Math.min(92, Math.max(8, ((e.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.min(92, Math.max(8, ((e.clientY - rect.top) / rect.height) * 100));
      markerCounterRef.current += 1;

      const detection = createManualDetection({
        id: `risk-marker-${markerCounterRef.current}`,
        className: selectedRiskClass,
        xPercent,
        yPercent,
        source: "manual",
      });

      setManualDetections((current) => [...current, detection]);
    }
  }, [isArActive, selectedRiskClass]);

  const handleRemoveWarning = useCallback((warningId: string) => {
    const detectionId = warningId.replace("warning-", "");
    setManualDetections((current) => current.filter((d) => d.id !== detectionId));
    setModelDetections((current) => current.filter((d) => d.id !== detectionId));
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

  return (
    <ErrorBoundary>
      <BrowserCompatCheck>
        <main
          className="min-h-screen bg-cream-50 text-ink-900 font-sans pb-20 md:pb-10"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* ── Header (Light Dashboard Theme) ── */}
          <header className="sticky top-0 z-40 border-b border-purple-700/8 bg-cream-50/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
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
                  <p className="font-heading text-lg font-black text-purple-900 leading-none">
                    MitigaSee
                  </p>
                  <p className="text-[11px] font-bold text-ink-400">
                    Mata Siaga AR
                  </p>
                </div>
              </div>

              {/* Status GPS */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold shadow-sm border ${
                  gpsStatus === "watching"
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : gpsStatus === "low-accuracy"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : gpsStatus === "denied" || gpsStatus === "unavailable"
                    ? "bg-red-50 border-red-200 text-red-655"
                    : "bg-lavender-50 border-lavender-200 text-purple-700"
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

            {/* Tab Navigation (Consistent design) */}
            <div className="mx-auto flex max-w-5xl gap-1.5 px-4 pb-3">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  id={`tab-${tab.id}`}
                  onClick={() => {
                    void handleStopAr();
                    setActiveTab(tab.id);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition ${
                    activeTab === tab.id
                      ? "bg-purple-900 text-white shadow-sm border border-purple-800/10"
                      : "text-ink-700/80 hover:bg-lavender-100 border border-transparent"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {/* ── Konten Tab ── */}
          <div className="mx-auto max-w-5xl px-4 py-6">
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
                  {/* Error GPS */}
                  {isArActive && gpsError && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-655" />
                        <p className="text-xs font-semibold text-red-800">{gpsError}</p>
                      </div>
                    </div>
                  )}

                  {/* Grid Layout untuk AR + Control Sidebar */}
                  <div className={`grid gap-4 ${isArActive ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"}`}>
                    
                    {/* Layar AR / Video View */}
                    <div 
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="relative overflow-hidden rounded-[2rem] border border-purple-700/10 bg-purple-950 shadow-[0_28px_90px_rgba(25,10,62,0.18)]"
                      style={{ 
                        height: isArActive ? "min(60vh, 480px)" : "min(70vh, 520px)",
                        touchAction: "none"
                      }}
                    >
                      {/* Video feed */}
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video
                        ref={videoRef}
                        playsInline
                        autoPlay
                        muted
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                          isArActive ? "opacity-100" : "opacity-0"
                        }`}
                      />

                      {/* Bounding Box overlay (AI) */}
                      <canvas
                        ref={boundingBoxCanvasRef}
                        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                      />

                      {/* Three.js canvas */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 h-full w-full z-20"
                        style={{ pointerEvents: "none" }}
                      />

                      {/* Safety Marker Overlay (Manual & AI warning signs) */}
                      <SafetyMarkerOverlay
                        warnings={warnings}
                        onRemoveWarning={handleRemoveWarning}
                      />

                      {/* Info panduan drag-to-look desktop */}
                      {isArActive && !rendererRef.current?.xr.isPresenting && (
                        <div className="pointer-events-none absolute left-3 bottom-3 z-30 rounded-xl bg-purple-950/70 border border-white/10 px-3 py-1.5 backdrop-blur-sm">
                          <p className="text-[10px] font-bold text-white/90">
                            🖱️ Geser layar untuk melihat sekeliling (Drag to look)
                          </p>
                        </div>
                      )}

                      {/* Idle state (Matches dashboard card) */}
                      {!isArActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center z-30 bg-gradient-to-b from-purple-950/60 to-purple-950/90 text-white">
                          <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-purple-900/60 text-emerald-400 border border-purple-700/20 shadow-md">
                            <Radio className="h-10 w-10 animate-pulse" />
                          </div>
                          <div>
                            <h2 className="font-heading text-3xl font-black text-white">
                              Mata Siaga AR
                            </h2>
                            <p className="mt-2 text-sm font-semibold text-purple-200">
                              Kombinasi navigasi evakuasi & deteksi bahaya real-time
                            </p>
                          </div>

                          {titikList.length === 0 ? (
                            <div className="rounded-2xl border border-amber-700/30 bg-amber-950/80 px-6 py-4">
                              <p className="text-sm font-semibold text-amber-300">
                                Belum ada titik kumpul terdaftar.
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveTab("tambah")}
                                className="mt-3 rounded-full bg-amber-600 px-5 py-2.5 font-heading text-xs font-black text-white transition hover:bg-amber-500"
                              >
                                Tandai Titik Pertama
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              id="btn-mulai-ar"
                              onClick={handleStartAr}
                              className="flex items-center gap-2 rounded-full bg-purple-900 px-8 py-4 font-heading text-base font-black text-white shadow-[0_6px_0_#20104f] transition active:translate-y-1 active:shadow-[0_3px_0_#20104f] hover:bg-purple-800"
                            >
                              <Radio className="h-5 w-5" />
                              Mulai AR
                            </button>
                          )}
                        </div>
                      )}

                      {/* AR Aktif Layers */}
                      {isArActive && (
                        <>
                          {/* Lapis A: Beacon GPS */}
                          <ErrorBoundary
                            fallback={
                              <div className="pointer-events-none absolute left-3 top-16 z-30 rounded-full bg-red-950/80 border border-red-800/20 px-3 py-1.5 text-xs font-semibold text-red-300">
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

                          {/* Lapis B: Panah Surface-AR / Floating Compass */}
                          <ErrorBoundary
                            fallback={
                              <div className="pointer-events-none absolute left-3 top-24 z-30 rounded-full bg-amber-950/80 border border-amber-800/20 px-3 py-1.5 text-xs font-semibold text-amber-300">
                                ⚠️ Panah AR nonaktif
                              </div>
                            }
                          >
                            <SurfaceArrowLayer
                              sceneRef={sceneRef}
                              cameraRef={cameraRef}
                              xrStatus={xrStatus}
                              hitInfo={hitInfo}
                              userPosition={userPosition}
                              nearestTitik={nearestResult?.titik ?? null}
                              isActive={isArActive}
                            />
                          </ErrorBoundary>

                          {/* HUD Ringkas di Layar */}
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
                            className="absolute right-3 top-3 z-40 flex items-center gap-1.5 rounded-full border border-white/10 bg-purple-950/80 px-4 py-2 font-heading text-xs font-black text-white backdrop-blur-sm transition hover:bg-purple-900/90"
                          >
                            <Square className="h-3 w-3" />
                            Berhenti
                          </button>
                        </>
                      )}
                    </div>

                    {/* Sidebar Kontrol (Consistent Light Theme) */}
                    {isArActive && (
                      <aside className="grid gap-4 lg:content-start">
                        {/* Status Jarak */}
                        <div className="rounded-[1.4rem] border border-purple-700/8 bg-white/70 p-4 backdrop-blur shadow-sm text-ink-900">
                          <p className="text-xs font-black text-purple-700 uppercase tracking-widest leading-none">Rute Evakuasi</p>
                          {nearestResult ? (
                            <div className="mt-2.5">
                              <h4 className="font-heading text-base font-black text-ink-900">{nearestResult.titik.nama}</h4>
                              <p className="mt-1 text-sm text-teal-700 font-bold">Jarak: {formatDistance(nearestResult.distanceM)}</p>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-ink-500">Menghitung jarak ke titik kumpul...</p>
                          )}
                        </div>

                        {/* Deteksi Otomatis AI (COCO-SSD) */}
                        <ArAutoDetectionControl
                          status={detectorStatus}
                          enabled={isAutoDetectionEnabled}
                          disabled={!isArActive}
                          errorMessage={detectorErrorMessage}
                          onToggle={() => setIsAutoDetectionEnabled(!isAutoDetectionEnabled)}
                        />

                        {/* Toolbar Penanda Risiko Manual */}
                        <ArRiskToolbar
                          options={standaloneArSafetyLensActivity.riskOptions}
                          selectedClass={selectedRiskClass}
                          onSelectClass={setSelectedRiskClass}
                          onClearWarnings={() => setManualDetections([])}
                        />

                        {/* Panel Umpan Balik Warnings */}
                        <ArFeedbackPanel
                          warnings={warnings}
                          successFeedback={standaloneArSafetyLensActivity.successFeedback}
                          rewardXp={standaloneArSafetyLensActivity.rewardXp}
                          onComplete={() => {
                            void handleStopAr();
                            alert("Bagus! Kamu berhasil memetakan risiko sekitar demi keselamatan bersama.");
                          }}
                        />
                      </aside>
                    )}
                  </div>

                  {/* Info 3 Lapis (Consistent Light Theme Cards) */}
                  {!isArActive && titikList.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <LayerInfoCard
                        color="emerald"
                        label="Lapis A"
                        title="Beacon GPS"
                        desc="Pilar cahaya neon melayang vertikal di atas tiap titik kumpul. Ukuran berubah dinamis berdasarkan jarak."
                      />
                      <LayerInfoCard
                        color="amber"
                        label="Lapis B"
                        title="Panah AR"
                        desc="Panah penunjuk jalan interaktif. Merekat di lantai pada WebXR, atau berupa kompas 3D mengambang di desktop."
                      />
                      <LayerInfoCard
                        color="indigo"
                        label="Lapis C"
                        title="Deteksi Risiko"
                        desc="Pemindai AI TensorFlow COCO-SSD untuk melacak ancaman sekitar (kursi, meja, benda tinggi) + penanda manual."
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
  emerald: "bg-white/80 border-purple-700/8 text-teal-800 shadow-sm",
  amber: "bg-white/80 border-purple-700/8 text-amber-800 shadow-sm",
  indigo: "bg-white/80 border-purple-700/8 text-purple-900 shadow-sm",
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
      className={`rounded-[1.4rem] border p-4 backdrop-blur-sm ${COLOR_MAP[color]}`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-purple-600/70">
        {label}
      </p>
      <p className="mt-0.5 font-heading text-lg font-black text-ink-900">{title}</p>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-ink-700">{desc}</p>
    </article>
  );
}
