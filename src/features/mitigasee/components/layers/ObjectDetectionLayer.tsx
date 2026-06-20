"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-webgl";
import type { DetectedObject, DetectionLayerStatus } from "../../types";

// Kelas objek yang dianggap risiko dalam konteks evakuasi sekolah
const RISK_CLASSES = new Set([
  "chair", "bench", "dining table", "car", "truck", "bus",
  "motorcycle", "bicycle", "person", "dog",
]);

// Label ramah Bahasa Indonesia
const LABEL_MAP: Record<string, string> = {
  chair: "Kursi",
  bench: "Bangku",
  "dining table": "Meja",
  car: "Mobil",
  truck: "Truk",
  bus: "Bus",
  motorcycle: "Motor",
  bicycle: "Sepeda",
  person: "Orang",
  dog: "Anjing",
};

const THROTTLE_MS = 400;
const MIN_CONFIDENCE = 0.42;
const MAX_FRAME_ERRORS = 4;

interface ObjectDetectionLayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
}

/**
 * Lapis C — Deteksi Objek Risiko (COCO-SSD).
 * - Throttle ~400ms per deteksi (tidak setiap frame)
 * - Bounding box overlay 2D di atas video (bukan objek 3D)
 * - Error per-frame dilewati, loop tidak berhenti total
 * - Gagal load model → pesan retry, Lapis A & B tetap berjalan
 */
export function ObjectDetectionLayer({
  videoRef,
  isActive,
}: ObjectDetectionLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const frameErrorCountRef = useRef(0);
  const isCancelledRef = useRef(false);
  const timeoutIdRef = useRef<number | undefined>(undefined);

  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [status, setStatus] = useState<DetectionLayerStatus>("idle");
  const [loadError, setLoadError] = useState(false);

  // ── Load model ────────────────────────────────────────────────────────────
  const loadModel = useCallback(async () => {
    if (modelRef.current) return true;
    setStatus("loading");
    setLoadError(false);
    try {
      modelRef.current = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      setStatus("ready");
      return true;
    } catch (err) {
      console.error("[MitigaSee] COCO-SSD gagal dimuat:", err);
      setStatus("error");
      setLoadError(true);
      return false;
    }
  }, []);

  // ── Loop deteksi ──────────────────────────────────────────────────────────
  const runLoop = useCallback(async () => {
    if (isCancelledRef.current) return;

    const video = videoRef.current;
    const model = modelRef.current;

    if (!video || video.readyState < 2 || !model) {
      timeoutIdRef.current = window.setTimeout(runLoop, THROTTLE_MS);
      return;
    }

    try {
      setStatus("running");
      const predictions = await model.detect(video);
      if (isCancelledRef.current) return;

      const filtered: DetectedObject[] = predictions
        .filter(
          (p) => RISK_CLASSES.has(p.class) && p.score >= MIN_CONFIDENCE
        )
        .map((p, i) => ({
          id: `obj-${i}-${Date.now()}`,
          label: LABEL_MAP[p.class] ?? p.class,
          confidence: p.score,
          box: {
            x: p.bbox[0],
            y: p.bbox[1],
            width: p.bbox[2],
            height: p.bbox[3],
          },
        }));

      frameErrorCountRef.current = 0;
      setDetections(filtered);

      // Update bounding box di canvas overlay
      drawBoxes(canvasRef.current, video, filtered);
    } catch (err) {
      if (isCancelledRef.current) return;
      frameErrorCountRef.current += 1;
      console.warn("[MitigaSee] Frame deteksi error:", err);

      if (frameErrorCountRef.current >= MAX_FRAME_ERRORS) {
        setStatus("error");
        setDetections([]);
        return; // Hentikan loop jika terlalu banyak error berturut-turut
      }
    }

    if (!isCancelledRef.current) {
      timeoutIdRef.current = window.setTimeout(runLoop, THROTTLE_MS);
    }
  }, [videoRef]);

  // ── Kelola aktif/nonaktif ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      isCancelledRef.current = true;
      window.clearTimeout(timeoutIdRef.current);
      setDetections([]);
      setStatus("idle");
      clearCanvas(canvasRef.current);
      return;
    }

    isCancelledRef.current = false;
    frameErrorCountRef.current = 0;

    void (async () => {
      const ok = await loadModel();
      if (ok && !isCancelledRef.current) {
        void runLoop();
      }
    })();

    return () => {
      isCancelledRef.current = true;
      window.clearTimeout(timeoutIdRef.current);
    };
  }, [isActive, loadModel, runLoop]);

  // ── Cleanup total saat unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      window.clearTimeout(timeoutIdRef.current);
      modelRef.current?.dispose();
      modelRef.current = null;
    };
  }, []);

  const handleRetry = () => {
    setLoadError(false);
    setStatus("idle");
    frameErrorCountRef.current = 0;
    isCancelledRef.current = false;
    void (async () => {
      const ok = await loadModel();
      if (ok && !isCancelledRef.current) void runLoop();
    })();
  };

  return (
    <>
      {/* Canvas overlay untuk bounding box */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
      />

      {/* Badge status deteksi */}
      {isActive && !loadError && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-indigo-950/70 px-3 py-1.5 backdrop-blur-sm">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              status === "running"
                ? "animate-pulse bg-indigo-400"
                : status === "loading"
                ? "animate-pulse bg-yellow-400"
                : status === "error"
                ? "bg-red-400"
                : "bg-gray-500"
            }`}
          />
          <span className="text-[11px] font-semibold text-indigo-200">
            {status === "running"
              ? "Memindai risiko sekitar..."
              : status === "loading"
              ? "Memuat model AI..."
              : status === "error"
              ? `Deteksi terganggu (${detections.length} terakhir)`
              : "Deteksi siap"}
          </span>
        </div>
      )}

      {/* Error load model dengan retry */}
      {loadError && isActive && (
        <div className="absolute left-3 right-3 top-3 z-20 rounded-2xl border border-red-400/30 bg-red-950/80 px-4 py-3 backdrop-blur-sm">
          <p className="text-sm font-semibold text-red-300">
            ⚠️ Deteksi risiko tidak dapat dimuat. Periksa koneksi internet kamu.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 rounded-full bg-red-700 px-4 py-1.5 text-xs font-black text-white transition hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </>
  );
}

// ─── Helper: gambar bounding box di canvas ────────────────────────────────────
function drawBoxes(
  canvas: HTMLCanvasElement | null,
  video: HTMLVideoElement,
  detections: DetectedObject[]
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const vw = video.videoWidth || video.clientWidth;
  const vh = video.videoHeight || video.clientHeight;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const scaleX = canvas.width / vw;
  const scaleY = canvas.height / vh;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const det of detections) {
    const { x, y, width, height } = det.box;
    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = width * scaleX;
    const sh = height * scaleY;

    // Kotak bounding
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    // Latar label
    const label = `${det.label} ${Math.round(det.confidence * 100)}%`;
    ctx.font = "bold 12px sans-serif";
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(127,29,29,0.82)";
    ctx.fillRect(sx, sy - 20, tw + 8, 20);

    // Teks label
    ctx.fillStyle = "#fca5a5";
    ctx.fillText(label, sx + 4, sy - 5);
  }
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
}
