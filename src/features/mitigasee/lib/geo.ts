import type { LatLng } from "../types";

const EARTH_RADIUS_M = 6_371_000;

// ─── Konversi sudut ──────────────────────────────────────────────────────────
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Haversine: jarak antara dua titik GPS (meter) ───────────────────────────
export function calculateDistance(from: LatLng, to: LatLng): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Bearing dari titik A ke B (derajat, 0–360 clockwise dari utara) ─────────
export function calculateBearing(from: LatLng, to: LatLng): number {
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Konversi posisi GPS target ke offset XZ Three.js relatif terhadap user.
 * X = timur (+) / barat (-)
 * Z = selatan (+) / utara (-)
 * Skala: 1 unit Three.js = 1 meter (sebelum normalisasi visual)
 */
export function gpsToRelativeXZ(
  userPos: LatLng,
  targetPos: LatLng
): { x: number; z: number; distanceM: number } {
  const distanceM = calculateDistance(userPos, targetPos);
  const bearingRad = toRad(calculateBearing(userPos, targetPos));
  return {
    x: distanceM * Math.sin(bearingRad),
    z: distanceM * Math.cos(bearingRad),
    distanceM,
  };
}

/**
 * Skala beacon berdasarkan jarak.
 * - Dekat (<50m) → skala besar (1.0)
 * - Jauh (>500m) → skala kecil (0.25)
 * - Di atas 200m → beacon mulai menyusut
 */
export function beaconScaleFromDistance(distanceM: number): number {
  const clamped = Math.max(10, Math.min(500, distanceM));
  return 1.0 - (clamped - 10) * (0.75 / 490);
}

/** Format jarak ke string yang mudah dibaca (m atau km) */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Temukan titik kumpul terdekat dari posisi user */
export function findNearestTitik<T extends LatLng>(
  userPos: LatLng,
  titikList: T[]
): { titik: T; distanceM: number } | null {
  if (titikList.length === 0) return null;

  let nearest: T = titikList[0];
  let minDist = calculateDistance(userPos, titikList[0]);

  for (let i = 1; i < titikList.length; i++) {
    const d = calculateDistance(userPos, titikList[i]);
    if (d < minDist) {
      minDist = d;
      nearest = titikList[i];
    }
  }

  return { titik: nearest, distanceM: minDist };
}
