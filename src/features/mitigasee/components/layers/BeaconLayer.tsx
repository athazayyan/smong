"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { TitikKumpul, LatLng } from "../../types";
import {
  gpsToRelativeXZ,
  beaconScaleFromDistance,
  formatDistance,
} from "../../lib/geo";

interface BeaconLayerProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  titikKumpulList: TitikKumpul[];
  userPosition: LatLng | null;
  isActive: boolean;
}

/** Tinggi visual beacon dalam unit Three.js (bukan meter nyata, murni visual) */
const BEACON_VISUAL_HEIGHT = 8;
const BEACON_RADIUS = 0.08;

/**
 * Lapis A — Beacon GPS.
 * Merender pilar cahaya vertikal untuk setiap titik kumpul tersimpan.
 * Posisi & skala diperbarui setiap kali userPosition berubah.
 */
export function BeaconLayer({
  sceneRef,
  cameraRef,
  titikKumpulList,
  userPosition,
  isActive,
}: BeaconLayerProps) {
  /** Map: titikId → { group: THREE.Group, ring: THREE.Mesh } */
  const beaconMapRef = useRef<
    Map<string, { group: THREE.Group; pillar: THREE.Mesh; ring: THREE.Mesh }>
  >(new Map());

  // ── Buat / hapus beacon saat daftar titik berubah ─────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isActive) return;

    const existingIds = new Set(beaconMapRef.current.keys());
    const newIds = new Set(titikKumpulList.map((t) => t.id));

    // Hapus beacon yang sudah tidak ada di daftar
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        const entry = beaconMapRef.current.get(id);
        if (entry) {
          scene.remove(entry.group);
          entry.pillar.geometry.dispose();
          (entry.pillar.material as THREE.Material).dispose();
          entry.ring.geometry.dispose();
          (entry.ring.material as THREE.Material).dispose();
          beaconMapRef.current.delete(id);
        }
      }
    }

    // Tambah beacon baru
    for (const titik of titikKumpulList) {
      if (beaconMapRef.current.has(titik.id)) continue;

      const group = new THREE.Group();

      // Pilar utama: silinder tipis bercahaya
      const pillarGeo = new THREE.CylinderGeometry(
        BEACON_RADIUS,
        BEACON_RADIUS * 1.5,
        BEACON_VISUAL_HEIGHT,
        8,
        1,
        true
      );
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.y = BEACON_VISUAL_HEIGHT / 2;
      group.add(pillar);

      // Lingkaran bercahaya di dasar beacon
      const ringGeo = new THREE.RingGeometry(0.4, 0.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      group.add(ring);

      // Bola di puncak beacon
      const topGeo = new THREE.SphereGeometry(BEACON_RADIUS * 2.5, 8, 8);
      const topMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = BEACON_VISUAL_HEIGHT;
      group.add(top);

      scene.add(group);
      beaconMapRef.current.set(titik.id, { group, pillar, ring });
    }
  }, [titikKumpulList, sceneRef, isActive]);

  // ── Update posisi beacon saat GPS user berubah ────────────────────────────
  useEffect(() => {
    if (!userPosition || !isActive) return;

    const camera = cameraRef.current;
    if (!camera) return;

    for (const titik of titikKumpulList) {
      const entry = beaconMapRef.current.get(titik.id);
      if (!entry) continue;

      const { x, z, distanceM } = gpsToRelativeXZ(userPosition, titik);

      // Normalisasi posisi: tampilkan beacon di jarak visual maksimum 25m
      const visualScale = Math.min(25, distanceM) / Math.max(distanceM, 0.01);
      const visualX = x * visualScale;
      const visualZ = -z * visualScale; // Three.js Z negatif = ke depan (utara)

      entry.group.position.set(
        camera.position.x + visualX,
        0,
        camera.position.z + visualZ
      );

      // Skala berdasarkan jarak nyata (lebih dekat = lebih besar)
      const scale = beaconScaleFromDistance(distanceM);
      entry.group.scale.setScalar(scale);

      // Animasi pulse untuk ring (opacity berdenyut)
      const pulse = 0.4 + 0.3 * Math.sin(Date.now() * 0.003);
      (entry.ring.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  }, [userPosition, titikKumpulList, cameraRef, isActive]);

  // ── Label overlay HTML ────────────────────────────────────────────────────
  // Label ditampilkan sebagai overlay HTML/CSS di atas canvas,
  // bukan sebagai objek 3D (lebih ringan dan mudah dibaca)
  if (!isActive || !userPosition) return null;

  return (
    <>
      {titikKumpulList.map((titik) => {
        const { distanceM } = gpsToRelativeXZ(userPosition, titik);
        return (
          <div
            key={titik.id}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2"
            style={{ transform: `translateX(-50%) translateY(-${60 + distanceM / 10}%)` }}
          >
            <div className="rounded-full bg-emerald-950/80 px-3 py-1 text-center backdrop-blur-sm">
              <p className="font-heading text-xs font-black text-emerald-300">
                {titik.nama}
              </p>
              <p className="text-[10px] font-bold text-emerald-400/80">
                {formatDistance(distanceM)}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}
