import type { TitikKumpul } from "../types";

const STORAGE_PREFIX = "mitigasee:titik:";
const INDEX_KEY = "mitigasee:index";
/** Ukuran maksimum foto sebelum simpan (px) */
const MAX_PHOTO_PX = 800;
/** Kualitas JPEG untuk kompresi (0–1) */
const JPEG_QUALITY = 0.72;

// ─── ID generator (nano-lite, tanpa dependency) ─────────────────────────────
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Kompresi foto ───────────────────────────────────────────────────────────
/**
 * Resize dan kompres dataURL gambar ke ukuran maksimum.
 * Berjalan di browser saja (membutuhkan canvas API).
 */
export async function compressImage(
  dataUrl: string,
  maxPx: number = MAX_PHOTO_PX
): Promise<string> {
  // Jika bukan data URL yang valid, kembalikan apa adanya
  if (!dataUrl || !dataUrl.startsWith("data:")) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      // Jika sudah cukup kecil, tidak perlu kompres
      if (w <= maxPx && h <= maxPx) {
        resolve(dataUrl);
        return;
      }
      const scale = Math.min(1, maxPx / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Context tidak tersedia — fallback ke original
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        // canvas.toDataURL bisa gagal jika canvas tainted (cross-origin)
        const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(compressed);
      } catch (err) {
        console.warn("[MitigaSee] Canvas tainted, skip kompresi:", err);
        resolve(dataUrl);
      }
    };
    img.onerror = (err) => {
      console.warn("[MitigaSee] Gagal load gambar untuk kompresi, skip:", err);
      // Graceful fallback — kembalikan dataUrl asli tanpa crash
      resolve(dataUrl);
    };
    // Penting: set crossOrigin SEBELUM src untuk menghindari tainted canvas
    img.crossOrigin = "anonymous";
    img.src = dataUrl;
  });
}

// ─── Index helpers (daftar ID yang tersimpan) ────────────────────────────────
function readIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/**
 * Simpan titik kumpul. Otomatis kompres foto jika quota exceeded.
 * @throws {Error} jika storage penuh meski setelah kompresi
 */
export async function saveTitikKumpul(titik: TitikKumpul): Promise<void> {
  const key = `${STORAGE_PREFIX}${titik.id}`;
  const raw = JSON.stringify(titik);

  // Coba simpan langsung
  try {
    localStorage.setItem(key, raw);
    const ids = readIndex();
    if (!ids.includes(titik.id)) {
      writeIndex([...ids, titik.id]);
    }
    return;
  } catch (err) {
    if (!isQuotaError(err)) throw err;
  }

  // Quota exceeded → coba kompres foto lebih kecil
  try {
    const compressed = await compressImage(titik.fotoBase64, 480);
    const titikCompressed: TitikKumpul = { ...titik, fotoBase64: compressed };
    localStorage.setItem(key, JSON.stringify(titikCompressed));
    const ids = readIndex();
    if (!ids.includes(titik.id)) {
      writeIndex([...ids, titik.id]);
    }
  } catch (err2) {
    if (isQuotaError(err2)) {
      throw new Error(
        "Penyimpanan penuh. Hapus beberapa titik lama untuk menambah yang baru."
      );
    }
    throw err2;
  }
}

/** Ambil semua titik kumpul tersimpan. Selalu kembalikan array (tidak pernah throw). */
export function getAllTitikKumpul(): TitikKumpul[] {
  const ids = readIndex();
  const result: TitikKumpul[] = [];

  for (const id of ids) {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (!raw) continue;
      result.push(JSON.parse(raw) as TitikKumpul);
    } catch {
      console.error(`[MitigaSee] Gagal parse titik ${id}, dilewati.`);
    }
  }

  return result.sort((a, b) => b.timestamp - a.timestamp);
}

/** Hapus titik kumpul berdasarkan ID. */
export function deleteTitikKumpul(id: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    const ids = readIndex().filter((i) => i !== id);
    writeIndex(ids);
  } catch (err) {
    console.error("[MitigaSee] Gagal menghapus titik:", err);
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function isQuotaError(err: unknown): boolean {
  if (!(err instanceof DOMException)) return false;
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}
