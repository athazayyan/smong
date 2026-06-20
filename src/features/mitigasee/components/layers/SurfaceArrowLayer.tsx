"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { TitikKumpul, LatLng, WebXrStatus, XrHitInfo } from "../../types";
import { calculateBearing } from "../../lib/geo";

interface SurfaceArrowLayerProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
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
 * Jika WebXR tidak didukung (seperti di desktop), panah ini merender
 * sebagai panah kompas 3D mengambang di depan kamera, sehingga tetap berfungsi.
 */
export function SurfaceArrowLayer({
  sceneRef,
  cameraRef,
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

    const group = new THREE.Group();

    // Batang panah (cylinder) - warna oranye neon terang
    const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12);
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.9,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2; // rebahkan ke sumbu Z
    shaft.position.z = 0.175;
    group.add(shaft);

    // Kepala panah (cone)
    const coneGeo = new THREE.ConeGeometry(0.045, 0.12, 12);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xff9900 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI / 2;
    cone.position.z = 0.41;
    group.add(cone);

    // Lingkaran platform bercahaya
    const platformGeo = new THREE.RingGeometry(0.07, 0.09, 32);
    const platformMat = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.rotation.x = -Math.PI / 2;
    group.add(platform);

    group.visible = false; // Sembunyikan sampai hit-test atau kamera siap
    scene.add(group);
    arrowGroupRef.current = group;

    return () => {
      scene.remove(group);
      disposeGroup(group);
      arrowGroupRef.current = null;
    };
  }, [sceneRef, isActive]);

  // ── Update posisi & rotasi panah (real-time loop) ─────────────────────────
  useEffect(() => {
    if (!isActive) return;

    let animFrameId: number;

    const tick = () => {
      const arrow = arrowGroupRef.current;
      const camera = cameraRef.current;
      if (!arrow || !camera) {
        animFrameId = requestAnimationFrame(tick);
        return;
      }

      // Animasi perlahan berputar/berdenyut pada platform
      const time = performance.now() * 0.001;
      const pulse = 0.8 + 0.2 * Math.sin(time * 5);
      arrow.scale.set(pulse, pulse, pulse);

      // KASUS A: WebXR Aktif & Hit Test Berhasil
      if (xrStatus === "active" && hitInfo?.found && hitInfo.matrix) {
        const matrix = new THREE.Matrix4();
        matrix.fromArray(hitInfo.matrix);
        arrow.position.setFromMatrixPosition(matrix);

        if (userPosition && nearestTitik) {
          const bearing = calculateBearing(userPosition, nearestTitik);
          const rotY = -((bearing * Math.PI) / 180);
          arrow.rotation.set(0, rotY, 0);
        }
        arrow.visible = true;
      }
      // KASUS B: Desktop / Non-WebXR Fallback (Kompas Mengambang)
      else if (userPosition && nearestTitik) {
        // Ambil arah depan kamera
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        
        // Posisikan panah 1.2 meter di depan kamera, sedikit lebih rendah (0.4m di bawah mata)
        arrow.position.copy(camera.position).addScaledVector(dir, 1.2);
        arrow.position.y -= 0.35;

        // Rotasikan panah ke bearing sasaran
        const bearing = calculateBearing(userPosition, nearestTitik);
        const rotY = -((bearing * Math.PI) / 180);
        arrow.rotation.set(0, rotY, 0);
        arrow.visible = true;
      } else {
        arrow.visible = false;
      }

      animFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [xrStatus, hitInfo, userPosition, nearestTitik, cameraRef, isActive]);

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
