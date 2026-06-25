"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { TitikKumpul, LatLng, WebXrStatus, XrHitInfo } from "../../types";
import { gpsToRelativeXZ } from "../../lib/geo";

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
 * Lapis B — Jalur & Panah Evakuasi Proyeksi 3D.
 * Merender jalan ribbon neon biru dan panah segitiga biru besar
 * yang terproyeksi di lantai, meluncur mengarah ke titik kumpul.
 */
export function SurfaceArrowLayer({
  sceneRef,
  cameraRef,
  userPosition,
  nearestTitik,
  isActive,
}: SurfaceArrowLayerProps) {
  const arrowGroupRef = useRef<THREE.Group | null>(null);

  // ── Inisialisasi objek rute jalan & panah segitiga ────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isActive) return;

    // Hapus objek lama jika ada
    if (arrowGroupRef.current) {
      scene.remove(arrowGroupRef.current);
      disposeGroup(arrowGroupRef.current);
      arrowGroupRef.current = null;
    }

    const group = new THREE.Group();

    // 1. Jalur Ribbon Neon Biru Muda
    // Unit plane geometry: lebar 0.35m, panjang 1m. Pivot di (0,0,0) memanjang ke -Z
    const ribbonGeo = new THREE.PlaneGeometry(0.35, 1);
    ribbonGeo.rotateX(-Math.PI / 2); // rebahkan mendatar
    ribbonGeo.translate(0, 0, -0.5); // geser pivot ke belakang agar meregang ke depan

    const ribbonMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff, // Biru neon terang
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    group.add(ribbonMesh);

    // Garis batas samping putih (Border) untuk memperjelas jalan
    const borderLeftGeo = new THREE.PlaneGeometry(0.015, 1);
    borderLeftGeo.rotateX(-Math.PI / 2);
    borderLeftGeo.translate(-0.175, 0.001, -0.5);
    
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const borderLeftMesh = new THREE.Mesh(borderLeftGeo, borderMat);
    group.add(borderLeftMesh);

    const borderRightGeo = new THREE.PlaneGeometry(0.015, 1);
    borderRightGeo.rotateX(-Math.PI / 2);
    borderRightGeo.translate(0.175, 0.001, -0.5);
    const borderRightMesh = new THREE.Mesh(borderRightGeo, borderMat);
    group.add(borderRightMesh);

    // 2. Panah Segitiga Biru Besar (Sliding Navigation)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.35); // Ujung depan
    shape.lineTo(-0.18, -0.15); // Kiri belakang
    shape.lineTo(0.18, -0.15); // Kanan belakang
    shape.lineTo(0, 0.35);
    
    const triangleGeo = new THREE.ShapeGeometry(shape);
    triangleGeo.rotateX(-Math.PI / 2);

    const triangleMat = new THREE.MeshBasicMaterial({
      color: 0x007cff, // Biru solid persis mockup
      side: THREE.DoubleSide,
    });
    const triangleMesh = new THREE.Mesh(triangleGeo, triangleMat);
    group.add(triangleMesh);

    group.visible = false;
    scene.add(group);
    arrowGroupRef.current = group;

    return () => {
      scene.remove(group);
      disposeGroup(group);
      arrowGroupRef.current = null;
    };
  }, [sceneRef, isActive]);

  // ── Update posisi & rotasi secara real-time ──────────────────────────────
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

      const time = performance.now() * 0.001;

      // Ambil mesh anak
      const ribbon = arrow.children[0];
      const bLeft = arrow.children[1];
      const bRight = arrow.children[2];
      const triangle = arrow.children[3];

      if (userPosition && nearestTitik) {
        // Ambil koordinat target 3D relatif terhadap kamera/user
        const { x, z, distanceM } = gpsToRelativeXZ(userPosition, nearestTitik);

        // Skala visual clamping agar rute tidak melar tak terhingga di kejauhan
        const maxDistance = 45;
        const minDistance = 1;
        const visualDistance = Math.max(minDistance, Math.min(maxDistance, distanceM));
        const visualScale = visualDistance / Math.max(distanceM, 0.01);

        const visualX = x * visualScale;
        const visualZ = -z * visualScale; // Z negatif = depan

        // Posisikan group di kaki kamera (tinggi lantai Y = -1.35)
        arrow.position.copy(camera.position);
        arrow.position.y = -1.35;

        // Hadapkan rute ke target koordinat world
        const targetWorldPos = new THREE.Vector3(
          camera.position.x + visualX,
          -1.35,
          camera.position.z + visualZ
        );
        arrow.lookAt(targetWorldPos);

        // Skala panjang jalan/ribbon
        if (ribbon) ribbon.scale.set(1, 1, visualDistance);
        if (bLeft) bLeft.scale.set(1, 1, visualDistance);
        if (bRight) bRight.scale.set(1, 1, visualDistance);

        // Animasikan panah segitiga biru meluncur di sepanjang jalan
        if (triangle) {
          const speed = 2.8; // meter per detik
          const maxSlide = Math.min(visualDistance, 12);
          const progress = (time * speed) % maxSlide;
          
          // Letakkan sedikit di atas jalan agar tidak z-fighting
          triangle.position.set(0, 0.012, -progress);
        }

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
  }, [userPosition, nearestTitik, cameraRef, isActive]);

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
