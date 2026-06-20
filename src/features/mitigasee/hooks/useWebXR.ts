"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { WebXrStatus, XrHitInfo } from "../types";

interface UseWebXRReturn {
  xrStatus: WebXrStatus;
  hitInfo: XrHitInfo | null;
  isHitFound: boolean;
  startSession: (canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer) => Promise<void>;
  endSession: () => Promise<void>;
  updateHitTest: (frame: XRFrame, renderer: THREE.WebGLRenderer) => void;
  xrSessionRef: React.MutableRefObject<XRSession | null>;
  xrGlRef: React.MutableRefObject<WebGLRenderingContext | WebGL2RenderingContext | null>;
}

/**
 * Hook untuk mengelola sesi WebXR immersive-ar dengan hit-test.
 * Mengecek dukungan browser sebelum memulai sesi.
 * Semua error ditangani secara graceful — gagal tidak merusak Lapis A & C.
 */
export function useWebXR(): UseWebXRReturn {
  const [xrStatus, setXrStatus] = useState<WebXrStatus>("idle");
  const [hitInfo, setHitInfo] = useState<XrHitInfo | null>(null);

  const xrSessionRef = useRef<XRSession | null>(null);
  const xrGlRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null);
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const endSession = useCallback(async () => {
    hitTestSourceRef.current?.cancel();
    hitTestSourceRef.current = null;

    try {
      if (xrSessionRef.current) {
        await xrSessionRef.current.end();
      }
    } catch {
      // Session mungkin sudah berakhir sendiri
    }
    xrSessionRef.current = null;

    if (isMountedRef.current) {
      setXrStatus("ended");
      setHitInfo(null);
    }
  }, []);

  const startSession = useCallback(
    async (canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer) => {
      // 1. Feature detection
      if (!("xr" in navigator) || !navigator.xr) {
        setXrStatus("unsupported");
        return;
      }

      setXrStatus("checking");

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        if (!supported) {
          setXrStatus("unsupported");
          return;
        }
      } catch (err) {
        console.error("[MitigaSee] WebXR support check gagal:", err);
        setXrStatus("unsupported");
        return;
      }

      setXrStatus("starting");

      try {
        // 2. Dapatkan konteks WebGL yang kompatibel dengan XR
        const gl = renderer.getContext();
        if (!gl) {
          throw new Error("WebGL context tidak tersedia");
        }
        xrGlRef.current = gl;

        // 3. Buat sesi WebXR dengan DOM Overlay (agar elemen HTML UI terlihat)
        const session = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: document.body }, // Tampilkan UI di atas layar AR
        });

        xrSessionRef.current = session;

        // 4. Hubungkan sesi XR ke Three.js renderer
        renderer.xr.enabled = true;
        await renderer.xr.setSession(session);

        // 5. Hit-test source (viewer space)
        const viewerSpace = await session.requestReferenceSpace("viewer");
        const hitTestSource = await session.requestHitTestSource?.({
          space: viewerSpace,
        });
        hitTestSourceRef.current = hitTestSource ?? null;

        setXrStatus("active");

        // Tangani sesi yang berakhir dari luar (mis. tombol back perangkat)
        session.addEventListener("end", () => {
          if (isMountedRef.current) {
            setXrStatus("ended");
            setHitInfo(null);
          }
        });
      } catch (err) {
        console.error("[MitigaSee] WebXR session error:", err);
        if (isMountedRef.current) {
          setXrStatus("error");
        }
        await endSession();
      }
    },
    [endSession]
  );

  // 6. Lakukan hit-test menggunakan frame dari main animation loop Three.js
  const updateHitTest = useCallback((frame: XRFrame, renderer: THREE.WebGLRenderer) => {
    if (!xrSessionRef.current || !hitTestSourceRef.current || !isMountedRef.current) return;

    const refSpace = renderer.xr.getReferenceSpace();
    if (!refSpace) return;

    const results = frame.getHitTestResults(hitTestSourceRef.current);
    if (results.length > 0) {
      const pose = results[0].getPose(refSpace);
      if (pose) {
        setHitInfo({
          matrix: new Float32Array(pose.transform.matrix),
          found: true,
        });
      }
    } else {
      setHitInfo((prev) => (prev?.found ? { ...prev, found: false } : prev));
    }
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      void endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    xrStatus,
    hitInfo,
    isHitFound: hitInfo?.found === true,
    startSession,
    endSession,
    updateHitTest,
    xrSessionRef,
    xrGlRef,
  };
}
