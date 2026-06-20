"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

interface UseArSceneReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
  sceneRef: React.RefObject<THREE.Scene | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  initScene: () => void;
  disposeScene: () => void;
  startRenderLoop: (onFrame?: (delta: number) => void) => void;
  stopRenderLoop: () => void;
}

/**
 * Hook untuk mengelola siklus hidup Three.js renderer, scene, dan camera.
 * Semua resource dibersihkan saat unmount untuk mencegah memory leak.
 */
export function useArScene(): UseArSceneReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const stopRenderLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const disposeScene = useCallback(() => {
    stopRenderLoop();

    // Hapus semua objek dari scene
    if (sceneRef.current) {
      sceneRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      sceneRef.current.clear();
    }

    rendererRef.current?.dispose();
    rendererRef.current = null;
    sceneRef.current = null;
    cameraRef.current = null;
  }, [stopRenderLoop]);

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    disposeScene();

    try {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,        // transparan agar video terlihat di belakang
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.setClearColor(0x000000, 0); // clear transparan

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.01,
        1000
      );
      camera.position.set(0, 1.6, 0); // Tinggi mata rata-rata (1.6m)

      // Pencahayaan ambient agar beacon tidak gelap total
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(1, 3, 2);
      scene.add(dirLight);

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      clockRef.current = new THREE.Clock();
    } catch (err) {
      console.error("[MitigaSee] Gagal inisialisasi Three.js renderer:", err);
    }
  }, [disposeScene]);

  const startRenderLoop = useCallback(
    (onFrame?: (delta: number) => void) => {
      stopRenderLoop();

      function loop() {
        rafIdRef.current = requestAnimationFrame(loop);

        const delta = clockRef.current.getDelta();
        onFrame?.(delta);

        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (renderer && scene && camera) {
          // Resize responsif
          const canvas = renderer.domElement;
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (canvas.width !== w || canvas.height !== h) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
          renderer.render(scene, camera);
        }
      }

      loop();
    },
    [stopRenderLoop]
  );

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      disposeScene();
    };
  }, [disposeScene]);

  return {
    canvasRef,
    rendererRef,
    sceneRef,
    cameraRef,
    initScene,
    disposeScene,
    startRenderLoop,
    stopRenderLoop,
  };
}
