"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { TitikKumpul, LatLng, WebXrStatus, XrHitInfo } from "../../types";
import { calculateBearing } from "../../lib/geo";

interface SurfaceArrowLayerProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  xrStatus: WebXrStatus;
  hitInfo: XrHitInfo | null;
  userPosition: LatLng | null;
  nearestTitik: TitikKumpul | null;
  isActive: boolean;
}

/**
 * Lapis B — Panah Arah berbasis Surface-AR (WebXR hit-test).
 * Merender panah 3D yang menempel di permukaan terdeteksi,
 * mengarah ke bearing titik kumpul terdekat.
 *
 * Jika WebXR tidak didukung atau permukaan belum ditemukan,
 * komponen ini tidak render apa pun dan TIDAK menyebabkan error.
 */
export function SurfaceArrowLayer({
  sceneRef,
  xrStatus,
  hitInfo,
  userPosition,
  nearestTitik,
  isActive,
}: SurfaceArrowLayerProps) {
  const arrowGroupRef = useRef<THREE.Group | null>(null);

  // ── Inisialisasi objek panah ─────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isActive) return;

    // Hapus panah lama jika ada
    if (arrowGroupRef.current) {
      scene.remove(arrowGroupRef.current);
      disposeGroup(arrowGroupRef.current);
      arrowGroupRef.current = null;
    }

    if (xrStatus === "unsupported" || xrStatus === "idle") return;

    const group = new THREE.Group();

    // Batang panah (cylinder)
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8);
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2; // rebahkan ke sumbu Z
    shaft.position.z = 0.25;
    group.add(shaft);

    // Kepala panah (cone)
    const coneGeo = new THREE.ConeGeometry(0.07, 0.2, 8);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI / 2;
    cone.position.z = 0.6;
    group.add(cone);

    // Lingkaran platform di bawah panah
    const platformGeo = new THREE.CircleGeometry(0.15, 32);
    const platformMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.rotation.x = -Math.PI / 2;
    group.add(platform);

    group.visible = false; // Sembunyikan sampai hit-test berhasil
    scene.add(group);
    arrowGroupRef.current = group;

    return () => {
      scene.remove(group);
      disposeGroup(group);
      arrowGroupRef.current = null;
    };
  }, [sceneRef, xrStatus, isActive]);

  // ── Update posisi & rotasi panah saat hit-test berhasil ──────────────────
  useEffect(() => {
    const arrow = arrowGroupRef.current;
    if (!arrow) return;

    // Jika hit-test belum menemukan permukaan → sembunyikan panah
    if (!hitInfo?.found || !hitInfo.matrix) {
      arrow.visible = false;
      return;
    }

    // Posisikan panah di permukaan terdeteksi
    const matrix = new THREE.Matrix4();
    matrix.fromArray(hitInfo.matrix);
    arrow.position.setFromMatrixPosition(matrix);

    // Rotasikan panah ke bearing titik kumpul terdekat
    if (userPosition && nearestTitik) {
      const bearing = calculateBearing(userPosition, nearestTitik);
      // Konversi bearing (0=Utara, clockwise) ke rotasi Three.js Y (0=+Z, counterclockwise)
      const rotY = -((bearing * Math.PI) / 180);
      arrow.rotation.set(0, rotY, 0);
    }

    arrow.visible = true;
  }, [hitInfo, userPosition, nearestTitik]);

  // ── UI state overlay ──────────────────────────────────────────────────────
  if (!isActive) return null;

  // WebXR tidak didukung → tampilkan pesan graceful
  if (xrStatus === "unsupported") {
    return (
      <div className="pointer-events-none absolute left-4 right-4 top-16 z-20">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-950/60 px-4 py-2.5 backdrop-blur-sm">
          <p className="text-center text-xs font-semibold text-amber-300">
            🔶 Panah arah AR tidak didukung di perangkat ini — beacon GPS &amp; deteksi objek
            tetap berjalan.
          </p>
        </div>
      </div>
    );
  }

  // Hit-test aktif tapi permukaan belum ditemukan → panduan ke user
  if (xrStatus === "active" && !hitInfo?.found) {
    return (
      <div className="pointer-events-none absolute inset-x-4 bottom-32 z-20">
        <div className="rounded-2xl border border-sky-400/30 bg-sky-950/60 px-4 py-3 backdrop-blur-sm">
          <p className="text-center text-sm font-semibold text-sky-300">
            📱 Arahkan kamera ke lantai atau jalan untuk mendeteksi permukaan
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function disposeGroup(group: THREE.Group) {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material?.dispose();
      }
    }
  });
}
