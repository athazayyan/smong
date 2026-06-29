"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, List, Plus, Square, AlertTriangle, Navigation, Camera, Layers, Map, Clock, ArrowLeft, Building2, Check, X, ShieldAlert, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { TitikKumpul, MitigaSeeTab, ArMode, LatLng } from "../types";
import { getAllTitikKumpul, deleteTitikKumpul, saveTitikKumpul } from "../lib/storage";
import { findNearestTitik, formatDistance, calculateDistance } from "../lib/geo";

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
import type { RiskObjectClass, ObjectDetectionResult, ArDetectorStatus, ArWarning } from "@/features/student-learning/types";

// TAB ITEMS untuk halaman navigasi
const TAB_ITEMS = [
  {
    id: "ar" as MitigaSeeTab,
    label: "Mode AR",
    icon: <Camera className="h-3.5 w-3.5" />,
  },
  {
    id: "daftar" as MitigaSeeTab,
    label: "Daftar Titik",
    icon: <List className="h-3.5 w-3.5" />,
  },
  {
    id: "tambah" as MitigaSeeTab,
    label: "Tambah Titik",
    icon: <Plus className="h-3.5 w-3.5" />,
  },
];

// MOCK SVG untuk palang tanda titik kumpul darurat
const MOCK_SIGN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="400" height="480"><rect width="100" height="120" rx="10" fill="%23047857"/><rect x="5" y="5" width="90" height="110" rx="8" fill="none" stroke="%23ffffff" stroke-width="2"/><path d="M 15 15 L 35 35 M 35 35 L 25 35 M 35 35 L 35 25" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M 85 15 L 65 35 M 65 35 L 75 35 M 65 35 L 65 25" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M 15 85 L 35 65 M 35 65 L 25 65 M 35 65 L 35 75" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M 85 85 L 65 65 M 65 65 L 75 65 M 65 65 L 65 75" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="43" cy="46" r="3.5" fill="%23ffffff"/><path d="M 43 50 L 43 62 M 40 53 L 46 53 M 41 62 L 41 72 M 45 62 L 45 72" stroke="%23ffffff" stroke-width="3" stroke-linecap="round"/><circle cx="57" cy="46" r="3.5" fill="%23ffffff"/><path d="M 57 50 L 57 62 M 54 53 L 60 53 M 55 62 L 55 72 M 59 62 L 59 72" stroke="%23ffffff" stroke-width="3" stroke-linecap="round"/><text x="50" y="98" fill="%23ffffff" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">TITIK KUMPUL DARURAT</text><text x="50" y="107" fill="%23ffffff" font-family="sans-serif" font-size="5" font-weight="bold" text-anchor="middle">EMERGENCY ASSEMBLY POINT</text></svg>`;

export function MitigaSeeArPage() {
  const [activeTab, setActiveTab] = useState<MitigaSeeTab>("ar");
  const [arMode, setArMode] = useState<ArMode>("idle");
  const [titikList, setTitikList] = useState<TitikKumpul[]>([]);

  // ── States Tambahan untuk Rute, Foto, dan Edukasi Bencana ──────
  const [selectedTitik, setSelectedTitik] = useState<TitikKumpul | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [selectedWarning, setSelectedWarning] = useState<ArWarning | null>(null);

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
  const initialDistanceRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

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

  // ── Inisialisasi data titik kumpul default & localStorage ──────────────────
  useEffect(() => {
    if (initializedRef.current) return;
    let saved = getAllTitikKumpul();
    if (saved.length === 0) {
      const baseLat = userPosition?.lat ?? -6.2088;
      const baseLng = userPosition?.lng ?? 106.8456;
      const points: TitikKumpul[] = [
        {
          id: "default-lapangan-utama",
          nama: "Lapangan Utama Sekolah",
          lat: baseLat + 0.00035,
          lng: baseLng + 0.00025,
          fotoBase64: MOCK_SIGN_SVG,
          timestamp: Date.now() - 86400000,
          accuracy: 5,
        },
        {
          id: "default-parkir-depan",
          nama: "Area Parkir Depan",
          lat: baseLat - 0.00030,
          lng: baseLng - 0.00035,
          fotoBase64: MOCK_SIGN_SVG,
          timestamp: Date.now() - 43200000,
          accuracy: 7,
        },
        {
          id: "default-lapangan-basket",
          nama: "Lapangan Olahraga Belakang",
          lat: baseLat + 0.00015,
          lng: baseLng - 0.00020,
          fotoBase64: MOCK_SIGN_SVG,
          timestamp: Date.now() - 7200000,
          accuracy: 6,
        }
      ];
      points.forEach(p => {
        try {
          saveTitikKumpul(p);
        } catch(e) {
          console.error(e);
        }
      });
      saved = points;
      initializedRef.current = true;
    } else {
      initializedRef.current = true;
    }
    setTitikList(saved);
    if (saved.length > 0 && !selectedTitik) {
      setSelectedTitik(saved[0]);
    }
  }, [userPosition, selectedTitik]);

  useEffect(() => {
    if (isArActive) {
      document.body.classList.add("gameplay-active");
    } else {
      document.body.classList.remove("gameplay-active");
    }
    return () => {
      document.body.classList.remove("gameplay-active");
    };
  }, [isArActive]);

  useEffect(() => {
    if (titikList.length > 0 && !selectedTitik) {
      setSelectedTitik(titikList[0]);
    }
  }, [titikList, selectedTitik]);

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

  // ── Kalkulasi Jarak & ETA Berdasarkan Titik Pilihan ─────────────────────────
  const activeDistance = useMemo(() => {
    if (!userPosition || !selectedTitik) return null;
    return calculateDistance(userPosition, selectedTitik);
  }, [userPosition, selectedTitik]);

  useEffect(() => {
    if (activeDistance !== null && initialDistanceRef.current === null) {
      initialDistanceRef.current = activeDistance;
    }
  }, [activeDistance]);

  const etaMinutes = useMemo(() => {
    if (activeDistance === null) return 5;
    return Math.max(1, Math.ceil(activeDistance / (1.2 * 60)));
  }, [activeDistance]);

  // ── Mulai AR ─────────────────────────────────────────────────────────────
  const handleStartAr = useCallback(async () => {
    if (titikList.length === 0) {
      setActiveTab("tambah");
      return;
    }

    setArMode("ar-active");
    startWatch();
    setIsAutoDetectionEnabled(true);

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

    if (canvasRef.current) {
      initScene();
      startRenderLoop((_delta, frame) => {
        if (frame && rendererRef.current) {
          updateHitTest(frame, rendererRef.current);
        }
      });
    }

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
    setSelectedWarning(null);
    initialDistanceRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    await endSession().catch(() => {});
    disposeScene();
  }, [stopWatch, stopRenderLoop, endSession, disposeScene]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      void handleStopAr();
    };
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

      // Glowing neon stroke
      ctx.strokeStyle = "#ff0055"; // Pink-red neon matching branding colors
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ff0055";
      ctx.shadowBlur = 8;
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.shadowBlur = 0;

      // Label background
      const label = `${getRiskClassLabel(det.className)} ${Math.round((det.confidence || 1) * 100)}%`;
      ctx.font = "bold 11px sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(47, 23, 110, 0.88)"; // Brand purple-900 background
      ctx.fillRect(sx, sy - 18, tw + 8, 18);

      // Label text
      ctx.fillStyle = "#e8dfff";
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

  const handleSelectWarning = useCallback((warning: ArWarning) => {
    setSelectedWarning(warning);
  }, []);

  // ── Hapus titik kumpul ───────────────────────────────────────────────────
  function handleDeleteTitik(id: string) {
    deleteTitikKumpul(id);
    setTitikList((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (selectedTitik?.id === id) {
        setSelectedTitik(next[0] || null);
        initialDistanceRef.current = null;
      }
      return next;
    });
  }

  // ── Titik baru ditambahkan ───────────────────────────────────────────────
  function handleTitikSaved(titik: TitikKumpul) {
    setTitikList((prev) => [titik, ...prev]);
    setSelectedTitik(titik);
    initialDistanceRef.current = null;
    setActiveTab("daftar");
  }

  const handleSelectTarget = (id: string) => {
    const target = titikList.find(t => t.id === id);
    if (target) {
      setSelectedTitik(target);
      initialDistanceRef.current = null;
    }
  };

  return (
    <ErrorBoundary>
      <BrowserCompatCheck>
        <main
          className={`bg-cream-50 text-ink-900 font-sans ${isArActive ? "h-screen w-screen overflow-hidden p-0 m-0" : "min-h-screen pb-20 md:pb-10"}`}
          style={isArActive ? {} : { paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* Header */}
          {!isArActive && (
            <header className="sticky top-0 z-40 border-b border-purple-700/8 bg-cream-50/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Link
                  href="/siswa"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-700/10 bg-white text-purple-700 shadow-sm transition hover:bg-lavender-100"
                  aria-label="Kembali"
                >
                  <ArrowLeft className="h-4 w-4" />
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
                    ? "bg-red-50 border-red-250 text-red-700"
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

            {/* Tab Navigation */}
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
          )}

          {/* Konten Halaman */}
          <div className={isArActive ? "w-full h-full" : "mx-auto max-w-5xl px-4 py-6"}>
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
                  {/* GPS Warning */}
                  {isArActive && gpsError && (
                    <div className="mb-4 rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral-750" />
                        <p className="text-xs font-semibold text-coral-700">{gpsError}</p>
                      </div>
                    </div>
                  )}

                  {/* KASUS A: LAYAR SEBELUM AR (Dashboard Navigasi) */}
                  {!isArActive && (
                    <div className="grid gap-6 lg:grid-cols-[1fr_360px] grid-cols-1">
                      
                      {/* Status Evakuasi Card */}
                      <div className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/80 p-8 shadow-sm flex flex-col gap-5 text-ink-900 items-center justify-center text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-[2.2rem] bg-lavender-100 text-purple-700 border border-lavender-200 shadow-inner">
                          <Navigation className="h-12 w-12 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-heading text-2xl font-black text-purple-900">
                            Navigasi Evakuasi Siaga
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-ink-700 leading-relaxed max-w-sm">
                            Kamera AR akan memproyeksikan lintasan pemandu di atas lantai menuju ke titik kumpul pilihan secara real-time.
                          </p>
                        </div>
                        
                        <div className="w-full max-w-sm rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3.5 flex items-start gap-2.5 text-left text-teal-850 text-xs font-semibold leading-relaxed">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                          <p>
                            Pergi ke tempat terbuka dan lapang. Selalu ikuti instruksi resmi guru di sekolah dan prioritaskan keselamatan bersama saat terjadi bencana nyata.
                          </p>
                        </div>
                      </div>

                      {/* Detail Panel & Navigasi Launcher */}
                      <div className="flex flex-col gap-4">
                        {/* Target Point Selector Card */}
                        <div className="rounded-[2rem] border border-purple-700/8 bg-white/80 p-5 shadow-sm flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-purple-700 mb-2">PILIH TITIK KUMPUL TUJUAN</label>
                            {titikList.length === 0 ? (
                              <div className="p-3 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                                Belum ada titik terdaftar.
                              </div>
                            ) : (
                              <div className="relative">
                                <select
                                  id="target-titik-select"
                                  value={selectedTitik?.id || ""}
                                  onChange={(e) => handleSelectTarget(e.target.value)}
                                  className="w-full appearance-none rounded-xl border border-purple-200 bg-white px-4 py-3 text-xs font-bold text-ink-900 outline-none focus:border-purple-500 pr-10"
                                >
                                  {titikList.map(t => (
                                    <option key={t.id} value={t.id}>{t.nama}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400">
                                  <ChevronRight className="h-4 w-4 rotate-90" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Selected Destination Details */}
                          {selectedTitik && (
                            <div className="rounded-2xl border border-purple-700/5 bg-lavender-100/50 p-4 flex flex-col gap-2.5 text-ink-900">
                              <h4 className="font-heading text-sm font-black text-purple-900">{selectedTitik.nama}</h4>
                              <div className="flex flex-col gap-1.5 text-xs text-ink-700">
                                <div className="flex justify-between">
                                  <span>Koordinat:</span>
                                  <span className="font-bold text-purple-900">{selectedTitik.lat.toFixed(5)}, {selectedTitik.lng.toFixed(5)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Jarak Evakuasi:</span>
                                  <span className="font-bold text-teal-700">{activeDistance !== null ? formatDistance(activeDistance) : "Mendapatkan lokasi..."}</span>
                                </div>
                              </div>
                              
                              {/* Photo Confirmation Trigger */}
                              <button
                                type="button"
                                onClick={() => setShowPhotoModal(true)}
                                className="mt-2 text-[11px] font-black uppercase tracking-wider text-purple-700 flex items-center justify-center gap-1.5 hover:text-purple-900 transition"
                              >
                                <Camera className="h-3.5 w-3.5" />
                                Lihat Foto Palang Titik Kumpul
                              </button>
                            </div>
                          )}

                          {/* Start AR Action */}
                          {titikList.length > 0 ? (
                            <button
                              type="button"
                              id="btn-mulai-ar"
                              onClick={handleStartAr}
                              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-purple-900 hover:bg-purple-800 py-3.5 font-heading text-sm font-black text-white shadow transition active:translate-y-0.5"
                            >
                              <Camera className="h-4.5 w-4.5" />
                              MASUK NAVIGASI AR
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTab("tambah")}
                              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-500 py-3.5 font-heading text-sm font-black text-white shadow transition"
                            >
                              <Plus className="h-4.5 w-4.5" />
                              TANDAI TITIK KUMPUL PERTAMA
                            </button>
                          )}
                        </div>

                        {/* Layer Info Cards */}
                        <div className="grid grid-cols-1 gap-3">
                          <LayerInfoCard
                            color="indigo"
                            label="Lapis Evakuasi"
                            title="Panduan Jalur Kamera AR"
                            desc="Lintasan 3D neon biru-putih dan panah meluncur akan diproyeksikan langsung pada feed kamera untuk memandu rute evakuasi."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KASUS B: LAYAR AR AKTIF (Kamera Navigation View) */}
                  {isArActive && (
                    <div className="overflow-hidden bg-slate-950 shadow-[0_25px_60px_-15px_rgba(47,23,110,0.18)] md:relative md:w-full md:aspect-[4/3] md:rounded-[2rem] md:border-4 md:border-purple-900 fixed inset-0 z-[60] w-screen h-screen rounded-none border-0 flex flex-col justify-between">
                      
                      {/* Video Feed */}
                      <video
                        ref={videoRef}
                        playsInline
                        autoPlay
                        muted
                        className={`absolute inset-0 h-full w-full object-cover z-0 ${xrStatus === "active" ? "opacity-0" : "opacity-100"}`}
                      />

                      {/* Canvas 2D untuk Bounding Box COCO-SSD */}
                      <canvas
                        ref={boundingBoxCanvasRef}
                        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                      />

                      {/* Canvas 3D untuk Three.js Navigation Layer */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 h-full w-full z-20 pointer-events-none"
                      />

                      {/* Safety Marker Overlay (Detected Warning Icons) */}
                      <SafetyMarkerOverlay
                        warnings={warnings}
                        onRemoveWarning={handleRemoveWarning}
                        onSelectWarning={handleSelectWarning}
                      />

                      {/* HUD: Navigation Instruction Badge di Tengah Atas */}
                      <div className="pointer-events-none absolute left-1/2 top-4 z-35 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-purple-950/85 border border-purple-500/30 px-4 py-2 shadow-lg backdrop-blur-sm">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-cyan-300">FOLLOW THE WAY ⬆️</span>
                      </div>

                      {/* HUD: Estimated Time di Kanan Bawah */}
                      <div className="pointer-events-none absolute right-3 bottom-3 z-30 rounded-xl bg-purple-950/85 border border-purple-800/30 px-3 py-2 shadow backdrop-blur-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <div className="text-left">
                          <p className="text-[9px] font-bold text-purple-300 uppercase leading-none">SISA WAKTU</p>
                          <p className="font-heading text-xs font-black text-emerald-400 leading-tight mt-0.5">{etaMinutes} MINS ({activeDistance !== null ? formatDistance(activeDistance) : "..."})</p>
                        </div>
                      </div>

                      {/* Back/Stop Button di Pojok Kanan Atas */}
                      <button
                        type="button"
                        id="btn-stop-ar"
                        onClick={handleStopAr}
                        className="absolute right-3 top-3 z-45 flex items-center gap-1.5 rounded-full border border-purple-800/30 bg-purple-950/85 px-4.5 py-2 font-heading text-xs font-black text-white backdrop-blur-sm transition hover:bg-purple-900"
                      >
                        <Square className="h-3 w-3 text-red-500 fill-red-500" />
                        Keluar
                      </button>

                      {/* Drag to look instructions (Desktop fallback) */}
                      {!rendererRef.current?.xr.isPresenting && (
                        <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-purple-950/70 px-3 py-1 backdrop-blur-sm">
                          <p className="text-[10px] font-bold text-purple-200">
                            🖱️ Geser layar untuk melihat sekeliling (Drag to look)
                          </p>
                        </div>
                      )}

                      {/* 3D Layers */}
                      <ErrorBoundary>
                        <BeaconLayer
                          sceneRef={sceneRef}
                          cameraRef={cameraRef}
                          titikKumpulList={titikList}
                          userPosition={userPosition}
                          isActive={isArActive}
                        />
                      </ErrorBoundary>

                      <ErrorBoundary>
                        <SurfaceArrowLayer
                          sceneRef={sceneRef}
                          cameraRef={cameraRef}
                          xrStatus={xrStatus}
                          hitInfo={hitInfo}
                          userPosition={userPosition}
                          nearestTitik={selectedTitik}
                          isActive={isArActive}
                        />
                      </ErrorBoundary>

                      {/* HUD status default */}
                      <ArStatusHud
                        nearestDistanceM={activeDistance}
                        nearestName={selectedTitik?.nama ?? null}
                        gpsStatus={gpsStatus}
                        isLowAccuracy={isLowAccuracy}
                        accuracy={accuracy}
                        isActive={isArActive}
                      />

                      {/* Drawer untuk Deteksi Bahaya AI (COCO-SSD) dan Photo Confirmation */}
                      <div className="absolute right-3 top-16 z-30 flex flex-col gap-2">
                        {/* Auto-detection control */}
                        <div className="pointer-events-auto bg-purple-950/85 border border-purple-800/30 rounded-xl p-1 shadow-lg backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={() => setIsAutoDetectionEnabled(!isAutoDetectionEnabled)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              isAutoDetectionEnabled ? "bg-purple-700 text-white" : "text-purple-300 hover:bg-purple-900"
                            }`}
                            title={isAutoDetectionEnabled ? "Matikan AI" : "Aktifkan AI"}
                          >
                            <Camera className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        {/* Toggle sign photo confirmation */}
                        {selectedTitik && (
                          <div className="pointer-events-auto bg-purple-950/85 border border-purple-800/30 rounded-xl p-1 shadow-lg backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => setShowPhotoModal(true)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-purple-300 hover:bg-purple-900 hover:text-purple-400 transition"
                              title="Lihat Foto Palang"
                            >
                              <Layers className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Modal Edukasi Warning Bencana (Tapped Warning Details) */}
                      <AnimatePresence>
                        {selectedWarning && (
                          <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute inset-x-3 bottom-16 z-50 rounded-[2rem] border border-purple-500/30 bg-purple-950/95 p-5 text-white shadow-2xl backdrop-blur-md pointer-events-auto max-w-sm mx-auto"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-950/50 border border-red-800/30 text-red-400">
                                <AlertTriangle className="h-6 w-6" />
                              </span>
                              <div className="flex-1 text-left">
                                <h4 className="font-heading text-base font-black text-white">{selectedWarning.title}</h4>
                                <p className="mt-2 text-xs leading-relaxed text-slate-350">{selectedWarning.message}</p>
                                <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-purple-900/50 border border-purple-800/25 px-3 py-2 text-[10px] font-semibold text-purple-200">
                                  <span className="font-black text-cyan-400">Solusi:</span>
                                  <span>{selectedWarning.actionLabel}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedWarning(null)}
                                className="text-purple-300 hover:text-white"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedWarning(null)}
                              className="mt-4 w-full rounded-xl bg-purple-750 hover:bg-purple-700 py-2.5 font-heading text-xs font-black text-white transition"
                            >
                              Mengerti & Siaga
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  )}

                  {/* Manual Detection Toolbar & feedback (AR Active Drawer) */}
                  {isArActive && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          alert("Luar biasa! Kamu berhasil memetakan rintangan evakuasi di sekolah secara presisi.");
                        }}
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

          {/* Modal Konfirmasi Foto Palang Titik Kumpul */}
          <AnimatePresence>
            {showPhotoModal && selectedTitik && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowPhotoModal(false)}
                  className="absolute inset-0 bg-purple-950/40 backdrop-blur-sm pointer-events-auto"
                />
                
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-purple-700/10 bg-white p-6 text-center shadow-xl pointer-events-auto text-ink-900"
                >
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(false)}
                    className="absolute right-4 top-4 text-ink-400 hover:text-ink-900 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <h3 className="font-heading text-lg font-black text-purple-900 flex items-center justify-center gap-2 mb-4">
                    <Camera className="h-5 w-5 text-purple-700" />
                    Foto Palang Titik Kumpul
                  </h3>

                  {selectedTitik.fotoBase64 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-purple-100 h-64 bg-lavender-50">
                      <img
                        src={selectedTitik.fotoBase64}
                        alt={`Foto palang ${selectedTitik.nama}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-lavender-50/50 text-ink-400 text-xs font-semibold">
                      Tidak ada foto terdaftar.
                    </div>
                  )}

                  <p className="mt-4 text-xs font-bold text-ink-700">
                    Lokasi: <span className="text-purple-900 font-extrabold">{selectedTitik.nama}</span>
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(false)}
                    className="mt-5 w-full rounded-xl bg-purple-900 hover:bg-purple-800 py-3 text-xs font-black text-white transition shadow-sm"
                  >
                    Tutup Foto
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </main>
      </BrowserCompatCheck>
    </ErrorBoundary>
  );
}

// ─── Helper: Layer info card ──────────────────────────────────────────────────
type LayerColor = "emerald" | "amber" | "indigo";
const COLOR_MAP: Record<LayerColor, string> = {
  emerald: "bg-white border-purple-700/8 text-teal-700 shadow-sm",
  amber: "bg-white border-purple-700/8 text-amber-700 shadow-sm",
  indigo: "bg-white border-purple-700/8 text-purple-900 shadow-sm",
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
      <p className="text-[10px] font-black uppercase tracking-widest text-ink-400">
        {label}
      </p>
      <p className="mt-0.5 font-heading text-sm font-black text-ink-900">{title}</p>
      <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink-700">{desc}</p>
    </article>
  );
}

