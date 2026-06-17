"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Cpu, ScanLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type {
  ArSafetyLensActivity as ArSafetyLensActivityData,
  ArDetectorStatus,
  ArSafetyLensState,
  ObjectDetectionResult,
  RiskObjectClass,
} from "@/features/student-learning/types";
import {
  requestSafetyLensCamera,
  stopCameraStream,
} from "@/features/student-learning/lib/ar/camera";
import type { CameraFacingMode } from "@/features/student-learning/lib/ar/camera";
import { buildArWarnings, createManualDetection } from "@/features/student-learning/lib/ar/markerRules";
import { CocoSsdDetector } from "@/features/student-learning/lib/ar/cocoDetector";
import { useArImmersive } from "@/features/student-learning/hooks/useArImmersive";
import { CameraPreview } from "./CameraPreview";
import { ObjectDetectionLayer } from "./ObjectDetectionLayer";
import { SafetyMarkerOverlay } from "./SafetyMarkerOverlay";
import { ArInstructionPanel } from "./ArInstructionPanel";
import { ArFeedbackPanel } from "./ArFeedbackPanel";
import { ArUnsupportedFallback } from "./ArUnsupportedFallback";
import { ArRiskToolbar } from "./ArRiskToolbar";
import { ArAutoDetectionControl } from "./ArAutoDetectionControl";

interface ArSafetyLensActivityProps {
  activity: ArSafetyLensActivityData;
  onComplete: (xp: number) => void;
  backHref?: string;
}

export function ArSafetyLensActivity({
  activity,
  onComplete,
  backHref,
}: ArSafetyLensActivityProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const markerCounterRef = useRef(0);
  const detectorRef = useRef<CocoSsdDetector | null>(null);
  const inferenceErrorCountRef = useRef(0);

  const [lensState, setLensState] = useState<ArSafetyLensState>("idle");
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [iosFallbackToast, setIosFallbackToast] = useState(false);
  const [manualDetections, setManualDetections] = useState<ObjectDetectionResult[]>([]);
  const [modelDetections, setModelDetections] = useState<ObjectDetectionResult[]>([]);
  const [selectedRiskClass, setSelectedRiskClass] = useState<RiskObjectClass>(
    activity.riskOptions[0]?.className ?? "glass-zone"
  );
  const [isDetectionVisible, setIsDetectionVisible] = useState(false);
  const [isAutoDetectionEnabled, setIsAutoDetectionEnabled] = useState(false);
  const [detectorStatus, setDetectorStatus] = useState<ArDetectorStatus>("idle");
  const [detectorErrorMessage, setDetectorErrorMessage] = useState<string | undefined>(undefined);
  const shouldReduceMotion = useReducedMotion();

  const isArSessionActive =
    lensState === "camera-ready" || lensState === "simulation";

  const { isMobile, isImmersive } = useArImmersive(isArSessionActive);

  const detections = useMemo(
    () => [...manualDetections, ...modelDetections],
    [manualDetections, modelDetections]
  );

  const warnings = useMemo(
    () => buildArWarnings(detections, activity.warningRules),
    [activity.warningRules, detections]
  );

  const isSimulationMode =
    lensState === "simulation" ||
    lensState === "unsupported" ||
    lensState === "permission-denied" ||
    lensState === "camera-error";

  const isMarkingActive = lensState === "camera-ready" || lensState === "simulation";
  const isAutoDetectionDisabled = lensState !== "camera-ready";

  const getCocoDetector = useCallback(async () => {
    if (detectorRef.current === null) {
      detectorRef.current = new CocoSsdDetector();
      await detectorRef.current.load();
      setDetectorStatus("ready");
    }
    return detectorRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
      detectorRef.current?.dispose();
      detectorRef.current = null;
    };
  }, []);

  // iOS fallback toast auto-dismiss
  useEffect(() => {
    if (!iosFallbackToast) return;
    const id = window.setTimeout(() => setIosFallbackToast(false), 4000);
    return () => window.clearTimeout(id);
  }, [iosFallbackToast]);

  // Detection loop
  useEffect(() => {
    if (!isAutoDetectionEnabled || lensState !== "camera-ready") return;

    let isCancelled = false;
    let timeoutId: number | undefined;

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

        inferenceErrorCountRef.current = 0;
        setDetectorErrorMessage(undefined);
        setModelDetections(nextDetections);
        setIsDetectionVisible(true);
        scheduleNextDetection();
      } catch {
        if (isCancelled) return;

        inferenceErrorCountRef.current += 1;
        if (inferenceErrorCountRef.current >= 3) {
          setDetectorStatus("disabled");
          setDetectorErrorMessage(
            "Deteksi otomatis dijeda. Kamu tetap bisa tandai risiko manual."
          );
          setIsAutoDetectionEnabled(false);
          setModelDetections([]);
          return;
        }

        setDetectorStatus("error");
        setDetectorErrorMessage(
          "Model belum bisa membaca kamera. Kamu tetap bisa tandai risiko manual."
        );
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
  }, [getCocoDetector, isAutoDetectionEnabled, lensState]);

  async function handleStartCamera(mode: CameraFacingMode = facingMode) {
    setManualDetections([]);
    setModelDetections([]);
    setDetectorErrorMessage(undefined);
    setDetectorStatus("idle");
    setIsDetectionVisible(false);
    setLensState("requesting-camera");

    const result = await requestSafetyLensCamera(mode);

    if (result.status === "unsupported") {
      setLensState("unsupported");
      return;
    }

    if (result.status === "denied") {
      setLensState("permission-denied");
      return;
    }

    // iOS Safari fallback detection
    if (mode === "environment" && result.actualFacingMode === "user") {
      setFacingMode("user");
      setIosFallbackToast(true);
    }

    stopCameraStream(streamRef.current);
    streamRef.current = result.stream;

    if (videoRef.current) {
      videoRef.current.srcObject = result.stream;
      try {
        await videoRef.current.play();
      } catch {
        stopCameraStream(result.stream);
        streamRef.current = null;
        videoRef.current.srcObject = null;
        setLensState("camera-error");
        return;
      }
    }

    setLensState("camera-ready");
    setIsDetectionVisible(true);
  }

  async function handleFlipCamera() {
    const nextMode: CameraFacingMode =
      facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    setIsAutoDetectionEnabled(false);
    setModelDetections([]);

    stopCameraStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    await handleStartCamera(nextMode);
  }

  function handleStartSimulation() {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    setIsAutoDetectionEnabled(false);
    setDetectorStatus("idle");
    setManualDetections([]);
    setModelDetections(activity.simulatedDetections);
    setIsDetectionVisible(true);
    setLensState("simulation");
  }

  function handleComplete() {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setIsAutoDetectionEnabled(false);
    onComplete(activity.rewardXp);
  }

  function handleStop() {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    setIsAutoDetectionEnabled(false);
    setDetectorStatus("idle");
    setDetectorErrorMessage(undefined);
    setManualDetections([]);
    setModelDetections([]);
    setIsDetectionVisible(false);
    setLensState("idle");
  }

  function handlePlaceRiskMarker(event: React.MouseEvent<HTMLButtonElement>) {
    if (!isMarkingActive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const xPercent = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    const yPercent = clampPercent(((event.clientY - rect.top) / rect.height) * 100);
    markerCounterRef.current += 1;

    const detection = createManualDetection({
      id: `risk-marker-${markerCounterRef.current}`,
      className: selectedRiskClass,
      xPercent,
      yPercent,
      source: lensState === "camera-ready" ? "manual" : "simulated",
    });

    setManualDetections((current) => [...current, detection]);
    setIsDetectionVisible(true);
  }

  function handleRemoveWarning(warningId: string) {
    const detectionId = warningId.replace("warning-", "");
    setManualDetections((current) =>
      current.filter((d) => d.id !== detectionId)
    );
    setModelDetections((current) =>
      current.filter((d) => d.id !== detectionId)
    );
  }

  function handleClearWarnings() {
    setManualDetections([]);
    setModelDetections([]);
  }

  function handleToggleAutoDetection() {
    if (isAutoDetectionDisabled) return;

    if (isAutoDetectionEnabled) {
      setIsAutoDetectionEnabled(false);
      setDetectorStatus("disabled");
      setModelDetections([]);
      return;
    }

    inferenceErrorCountRef.current = 0;
    setDetectorErrorMessage(undefined);
    setDetectorStatus("loading");
    setIsAutoDetectionEnabled(true);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  // Camera container style — fullscreen on mobile when active
  const cameraContainerStyle: React.CSSProperties = isImmersive
    ? { position: "fixed", inset: 0, zIndex: 50, borderRadius: 0 }
    : { height: "min(720px, calc(100svh - 148px))", minHeight: "clamp(420px, 70svh, 620px)" };

  return (
    <main className="min-h-screen bg-cream-50 pb-28 text-ink-900 md:pb-12">
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-4 sm:px-6 lg:px-8">

        {/* Back button + info cards — hidden when immersive */}
        {!isImmersive && (
          <>
            {backHref ? (
              <Link
                href={backHref}
                className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-purple-700/10 bg-white/74 px-4 py-2 font-heading text-sm font-black text-purple-700 shadow-sm transition hover:bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>
            ) : null}

            <div className="mb-4 hidden gap-3 md:grid md:grid-cols-3">
              <InfoCard icon="shield" title="WebAR warning" body="Memberi peringatan, bukan menentukan rute." />
              <InfoCard icon="scan" title="Manual-assisted" body="Tandai kaca, rak, kerumunan, atau jalur terhalang." />
              <InfoCard icon="cpu" title="Ramah perangkat" body="Tidak membutuhkan Python atau GPU." />
            </div>
          </>
        )}

        <div className={`grid gap-4 ${isImmersive ? "" : "lg:grid-cols-[1fr_360px]"}`}>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative overflow-hidden border border-purple-700/10 bg-purple-950 shadow-[0_28px_90px_rgba(25,10,62,0.22)]"
            style={{
              ...cameraContainerStyle,
              borderRadius: isImmersive ? 0 : "clamp(1.5rem, 3vw, 2.5rem)",
            }}
          >
            <CameraPreview
              videoRef={videoRef}
              lensState={lensState}
              isSimulationMode={isSimulationMode}
              facingMode={facingMode}
            />

            {/* Tap-to-mark overlay */}
            <button
              type="button"
              aria-label="Tandai area risiko"
              className={`absolute inset-0 z-10 ${isMarkingActive ? "cursor-crosshair" : "cursor-default"}`}
              onClick={handlePlaceRiskMarker}
              disabled={!isMarkingActive}
            >
              <span className="sr-only">Tandai area risiko</span>
            </button>

            <ObjectDetectionLayer
              detections={detections}
              isVisible={isDetectionVisible && isMarkingActive}
            />

            <SafetyMarkerOverlay
              warnings={warnings}
              onRemoveWarning={handleRemoveWarning}
            />

            {/* ── Mobile immersive overlay controls ── */}
            {isImmersive && (
              <>
                {/* Top-left: back button */}
                {backHref ? (
                  <Link
                    href={backHref}
                    className="absolute left-4 top-4 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-purple-950/60 px-4 font-heading text-sm font-black text-white backdrop-blur"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="absolute left-4 top-4 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-purple-950/60 px-4 font-heading text-sm font-black text-white backdrop-blur"
                    onClick={handleStop}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                  </button>
                )}

                {/* Top-right: flip + auto detect */}
                <div className="absolute right-4 top-4 z-40 flex flex-col gap-2">
                  {lensState === "camera-ready" && (
                    <button
                      type="button"
                      aria-label={`Ganti ke kamera ${facingMode === "environment" ? "depan" : "belakang"}`}
                      onClick={handleFlipCamera}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-purple-950/60 text-white backdrop-blur transition active:scale-95"
                    >
                      {/* Flip icon inline SVG */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                        <path d="M20 7H4M4 7l4-4M4 7l4 4M4 17h16M16 17l4 4M16 17l4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}

                  <ArAutoDetectionControl
                    status={detectorStatus}
                    enabled={isAutoDetectionEnabled}
                    disabled={isAutoDetectionDisabled}
                    errorMessage={detectorErrorMessage}
                    onToggle={handleToggleAutoDetection}
                    isMobileIcon
                  />
                </div>

                {/* Bottom: horizontal risk strip */}
                <div className="absolute inset-x-0 bottom-0 z-40 pb-safe">
                  <ArRiskToolbar
                    options={activity.riskOptions}
                    selectedClass={selectedRiskClass}
                    onSelectClass={setSelectedRiskClass}
                    onClearWarnings={handleClearWarnings}
                    isMobileStrip
                  />
                </div>

                {/* Mobile feedback bottom sheet */}
                <ArFeedbackPanel
                  warnings={warnings}
                  successFeedback={activity.successFeedback}
                  rewardXp={activity.rewardXp}
                  onComplete={handleComplete}
                  isMobileSheet
                />
              </>
            )}

            {/* ── Desktop toolbar (inside camera, bottom) ── */}
            {!isImmersive && (
              <div className="absolute inset-x-3 bottom-3 z-40 lg:hidden">
                <ArRiskToolbar
                  options={activity.riskOptions}
                  selectedClass={selectedRiskClass}
                  onSelectClass={setSelectedRiskClass}
                  onClearWarnings={handleClearWarnings}
                  isMobileStrip
                />
              </div>
            )}

            {/* Instruction panel — idle state only on mobile */}
            {(!isMobile || lensState === "idle") && (
              <ArInstructionPanel
                title={activity.title}
                prompt={activity.prompt}
                safetyDisclaimer={activity.safetyDisclaimer}
                cameraPurposeCopy={activity.cameraPurposeCopy}
                lensState={lensState}
                onStartCamera={() => handleStartCamera()}
                onStartSimulation={handleStartSimulation}
                onStop={handleStop}
              />
            )}

            <ArUnsupportedFallback
              lensState={lensState}
              onStartSimulation={handleStartSimulation}
            />

            {/* iOS fallback toast */}
            {iosFallbackToast && (
              <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-yellow-200 px-4 py-2 text-xs font-black text-yellow-950 shadow-sm">
                Kamera belakang tidak tersedia, menggunakan kamera depan.
              </div>
            )}
          </motion.div>

          {/* ── Desktop sidebar ── */}
          {!isImmersive && (
            <aside className="hidden gap-4 lg:grid lg:content-start">
              <ArAutoDetectionControl
                status={detectorStatus}
                enabled={isAutoDetectionEnabled}
                disabled={isAutoDetectionDisabled}
                errorMessage={detectorErrorMessage}
                onToggle={handleToggleAutoDetection}
              />
              <ArRiskToolbar
                options={activity.riskOptions}
                selectedClass={selectedRiskClass}
                onSelectClass={setSelectedRiskClass}
                onClearWarnings={handleClearWarnings}
              />
              <ArFeedbackPanel
                warnings={warnings}
                successFeedback={activity.successFeedback}
                rewardXp={activity.rewardXp}
                onComplete={handleComplete}
              />
            </aside>
          )}
        </div>
      </section>
    </main>
  );
}

type InfoCardIcon = "shield" | "scan" | "cpu";

function InfoCard({ icon, title, body }: { icon: InfoCardIcon; title: string; body: string }) {
  return (
    <article className="rounded-[1.4rem] border border-purple-700/8 bg-white/68 p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-lavender-100 text-purple-700">
        {renderInfoIcon(icon)}
      </div>
      <h2 className="font-heading text-lg font-black text-ink-900">{title}</h2>
      <p className="mt-1 text-sm font-semibold leading-6 text-ink-700">{body}</p>
    </article>
  );
}

function renderInfoIcon(icon: InfoCardIcon) {
  if (icon === "shield") return <ShieldCheck className="h-5 w-5" />;
  if (icon === "scan") return <ScanLine className="h-5 w-5" />;
  return <Cpu className="h-5 w-5" />;
}

function clampPercent(value: number) {
  return Math.min(92, Math.max(8, value));
}