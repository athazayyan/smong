// ─── MitigaSee AR — Shared Types ───────────────────────────────────────────

/** Data titik kumpul/evakuasi yang tersimpan di localStorage */
export interface TitikKumpul {
  id: string;
  nama: string;
  lat: number;
  lng: number;
  fotoBase64: string;
  timestamp: number;
  /** Akurasi GPS saat pendaftaran (meter), opsional */
  accuracy?: number;
}

/** Koordinat GPS sederhana */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Status GPS watch */
export type GpsStatus =
  | "idle"
  | "requesting"
  | "watching"
  | "denied"
  | "unavailable"
  | "timeout"
  | "low-accuracy";

/** Status sesi WebXR */
export type WebXrStatus =
  | "idle"
  | "checking"
  | "supported"
  | "unsupported"
  | "starting"
  | "active"
  | "error"
  | "ended";

/** Status tiap lapis AR */
export type ArLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "unsupported"
  | "disabled";

/** Status deteksi objek (Lapis C) */
export type DetectionLayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "running"
  | "error"
  | "disabled";

/** State mode AR utama */
export type ArMode = "idle" | "ar-active" | "stopped";

/** State tab navigasi halaman MitigaSee */
export type MitigaSeeTab = "ar" | "daftar" | "tambah";

/** Hasil deteksi objek per frame */
export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/** Info kompatibilitas browser */
export interface BrowserCompat {
  hasGeolocation: boolean;
  hasGetUserMedia: boolean;
  hasWebGL: boolean;
  hasWebXR: boolean;
  isFullyCompatible: boolean;
}

/** Informasi hit-test WebXR */
export interface XrHitInfo {
  matrix: Float32Array;
  found: boolean;
}
