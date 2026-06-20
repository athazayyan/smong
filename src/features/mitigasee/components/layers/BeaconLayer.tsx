"use client";

import { useEffect, useRef, useState } from "react";
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
 * Merender pilar cahaya vertikal futuristik untuk setiap titik kumpul tersimpan.
 * Posisi & skala diperbarui setiap kali userPosition berubah.
 * Menggunakan proyeksi 3D ke 2D (camera.project) untuk peletakan label HTML secara presisi.
 */
export function BeaconLayer({
  sceneRef,
  cameraRef,
  titikKumpulList,
  userPosition,
  isActive,
}: BeaconLayerProps) {
  /** Map: titikId → THREE group and animated meshes */
  const beaconMapRef = useRef<
    Map<
      string,
      {
        group: THREE.Group;
        pillarCore: THREE.Mesh;
        pillarGlow: THREE.Mesh;
        ringBase: THREE.Mesh;
        ringInner: THREE.Mesh;
        ringPulse: THREE.Mesh;
        topMesh: THREE.Mesh;
      }
    >
  >(new Map());

  const [labelCoords, setLabelCoords] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});

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
          entry.pillarCore.geometry.dispose();
          (entry.pillarCore.material as THREE.Material).dispose();
          entry.pillarGlow.geometry.dispose();
          (entry.pillarGlow.material as THREE.Material).dispose();
          entry.ringBase.geometry.dispose();
          (entry.ringBase.material as THREE.Material).dispose();
          entry.ringInner.geometry.dispose();
          (entry.ringInner.material as THREE.Material).dispose();
          entry.ringPulse.geometry.dispose();
          (entry.ringPulse.material as THREE.Material).dispose();
          entry.topMesh.geometry.dispose();
          (entry.topMesh.material as THREE.Material).dispose();
          beaconMapRef.current.delete(id);
        }
      }
    }

    // Tambah beacon baru
    for (const titik of titikKumpulList) {
      if (beaconMapRef.current.has(titik.id)) continue;

      const group = new THREE.Group();

      // 1. Pilar Utama Core (Putih Terang) - Segments ditingkatkan ke 16 agar mulus
      const coreGeo = new THREE.CylinderGeometry(
        BEACON_RADIUS * 0.4,
        BEACON_RADIUS * 0.5,
        BEACON_VISUAL_HEIGHT,
        16,
        1,
        true
      );
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });
      const pillarCore = new THREE.Mesh(coreGeo, coreMat);
      pillarCore.position.y = BEACON_VISUAL_HEIGHT / 2;
      group.add(pillarCore);

      // 2. Pilar Outer Glow (Neon Cyan/Teal)
      const glowGeo = new THREE.CylinderGeometry(
        BEACON_RADIUS * 1.3,
        BEACON_RADIUS * 1.9,
        BEACON_VISUAL_HEIGHT,
        16,
        1,
        true
      );
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const pillarGlow = new THREE.Mesh(glowGeo, glowMat);
      pillarGlow.position.y = BEACON_VISUAL_HEIGHT / 2;
      group.add(pillarGlow);

      // 3. Ring Base Statis (Teal)
      const ringBaseGeo = new THREE.RingGeometry(0.3, 0.45, 32);
      const ringBaseMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ringBase = new THREE.Mesh(ringBaseGeo, ringBaseMat);
      ringBase.rotation.x = -Math.PI / 2;
      ringBase.position.y = 0.01;
      group.add(ringBase);

      // 4. Ring Inner (Berputar berlawanan arah jarum jam)
      const ringInnerGeo = new THREE.RingGeometry(0.12, 0.22, 32);
      const ringInnerMat = new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
      ringInner.rotation.x = -Math.PI / 2;
      ringInner.position.y = 0.015;
      group.add(ringInner);

      // 5. Ring Pulse (Merenggang keluar)
      const ringPulseGeo = new THREE.RingGeometry(0.1, 0.5, 32);
      const ringPulseMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6, // Ungu neon
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const ringPulse = new THREE.Mesh(ringPulseGeo, ringPulseMat);
      ringPulse.rotation.x = -Math.PI / 2;
      ringPulse.position.y = 0.02;
      group.add(ringPulse);

      // 6. Puncak Oktahedron Emas Berputar
      const topGeo = new THREE.OctahedronGeometry(BEACON_RADIUS * 3.5, 0);
      const topMat = new THREE.MeshBasicMaterial({
        color: 0xffd700, // Warna emas premium
        wireframe: false,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = BEACON_VISUAL_HEIGHT;
      group.add(topMesh);

      scene.add(group);
      beaconMapRef.current.set(titik.id, {
        group,
        pillarCore,
        pillarGlow,
        ringBase,
        ringInner,
        ringPulse,
        topMesh,
      });
    }
  }, [titikKumpulList, sceneRef, isActive]);

  // ── Update posisi beacon berdasarkan koordinat nyata GPS ──────────────────
  useEffect(() => {
    if (!userPosition || !isActive) return;

    const camera = cameraRef.current;
    if (!camera) return;

    for (const titik of titikKumpulList) {
      const entry = beaconMapRef.current.get(titik.id);
      if (!entry) continue;

      const { x, z, distanceM } = gpsToRelativeXZ(userPosition, titik);

      // Logarithmic/Clamped visual scaling agar tidak menumpuk aneh di kejauhan
      const maxDistance = 40;
      const minDistance = 2;
      const visualDistance = Math.max(
        minDistance,
        Math.min(maxDistance, distanceM)
      );
      const visualScale = visualDistance / Math.max(distanceM, 0.01);

      const visualX = x * visualScale;
      const visualZ = -z * visualScale; // Z negatif = depan (utara)

      entry.group.position.set(
        camera.position.x + visualX,
        0,
        camera.position.z + visualZ
      );

      // Sizing pilar berdasarkan kedekatan
      const scale = beaconScaleFromDistance(distanceM);
      entry.group.scale.setScalar(scale);
    }
  }, [userPosition, titikKumpulList, cameraRef, isActive]);

  // ── Animasi Mesh & Proyeksi 3D-ke-2D untuk Label HTML ──────────────────────
  useEffect(() => {
    if (!isActive || !userPosition) return;

    let animFrameId: number;
    const tempV = new THREE.Vector3();

    const tick = () => {
      const camera = cameraRef.current;
      if (!camera) {
        animFrameId = requestAnimationFrame(tick);
        return;
      }

      const time = performance.now() * 0.001;
      const coords: Record<string, { x: number; y: number; visible: boolean }> = {};

      for (const titik of titikKumpulList) {
        const entry = beaconMapRef.current.get(titik.id);
        if (!entry) continue;

        // 1. Putar Oktahedron di puncak
        entry.topMesh.rotation.y = time * 1.6;
        entry.topMesh.rotation.x = time * 0.9;

        // 2. Putar Ring Inner
        entry.ringInner.rotation.z = -time * 0.8;

        // 3. Efek denyut Ring Pulse di dasar
        const pulseCycle = (time * 1.1) % 1.0;
        const pulseScale = 0.5 + pulseCycle * 2.8;
        entry.ringPulse.scale.set(pulseScale, pulseScale, 1);
        (entry.ringPulse.material as THREE.MeshBasicMaterial).opacity =
          0.6 * (1.0 - pulseCycle);

        // 4. Proyeksikan posisi 3D pilar ke 2D layar
        tempV.setFromMatrixPosition(entry.group.matrixWorld);
        // Arahkan sedikit di atas oktahedron
        tempV.y += BEACON_VISUAL_HEIGHT + 0.8;

        tempV.project(camera);

        const isBehind = tempV.z > 1;
        const x = (tempV.x * 0.5 + 0.5) * 100;
        const y = (-(tempV.y * 0.5) + 0.5) * 100;

        // Sembunyikan label jika di belakang kamera atau jauh di luar layar
        const visible = !isBehind && x >= -15 && x <= 115 && y >= -15 && y <= 115;

        coords[titik.id] = { x, y, visible };
      }

      setLabelCoords(coords);
      animFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [userPosition, titikKumpulList, cameraRef, isActive]);

  if (!isActive || !userPosition) return null;

  return (
    <>
      {titikKumpulList.map((titik) => {
        const coords = labelCoords[titik.id];
        if (!coords || !coords.visible) return null;

        const { distanceM } = gpsToRelativeXZ(userPosition, titik);

        return (
          <div
            key={titik.id}
            className="pointer-events-none absolute z-30 flex flex-col items-center animate-fade-in"
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {/* Glowing neon HUD card */}
            <div className="flex flex-col items-center rounded-2xl border border-purple-500/30 bg-purple-900/90 px-4 py-2.5 text-center shadow-[0_10px_30px_rgba(139,92,246,0.3)] backdrop-blur-md transition-all duration-300">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400 mb-1.5" />
              <p className="font-heading text-xs font-black tracking-widest text-emerald-300 uppercase">
                {titik.nama}
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-white/90">
                {formatDistance(distanceM)}
              </p>
            </div>
            {/* Pointer segitiga kecil di bawah card */}
            <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-purple-900/90" />
          </div>
        );
      })}
    </>
  );
}
