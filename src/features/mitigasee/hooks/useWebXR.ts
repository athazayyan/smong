"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WebXrStatus, XrHitInfo } from "../types";

interface UseWebXRReturn {
  xrStatus: WebXrStatus;
  hitInfo: XrHitInfo | null;
  isHitFound: boolean;
  startSession: (canvas: HTMLCanvasElement) => Promise<void>;
  endSession: () => Promise<void>;
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
  const rafIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const endSession = useCallback(async () => {
    if (rafIdRef.current !== null) {
      xrSessionRef.current?.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
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
    async (canvas: HTMLCanvasElement) => {
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
        const gl =
          (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
          (canvas.getContext("webgl") as WebGLRenderingContext | null);

        if (!gl) {
          throw new Error("WebGL tidak tersedia di canvas ini");
        }

        // 3. Buat sesi WebXR
        const session = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
        });

        xrSessionRef.current = session;
        xrGlRef.current = gl;

        // Ikat GL ke sesi XR
        const xrGlLayer = new XRWebGLLayer(session, gl);
        await session.updateRenderState({ baseLayer: xrGlLayer });

        // 4. Reference space
        const refSpace = await session.requestReferenceSpace("local");

        // 5. Hit-test source (viewer space)
        const viewerSpace = await session.requestReferenceSpace("viewer");
        const hitTestSource = await session.requestHitTestSource?.({
          space: viewerSpace,
        });
        hitTestSourceRef.current = hitTestSource ?? null;

        setXrStatus("active");

        // 6. Loop frame
        function onXrFrame(_time: number, frame: XRFrame) {
          if (!xrSessionRef.current || !isMountedRef.current) return;

          rafIdRef.current = xrSessionRef.current.requestAnimationFrame(onXrFrame);

          if (hitTestSourceRef.current) {
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
          }
        }

        rafIdRef.current = session.requestAnimationFrame(onXrFrame);

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
    xrSessionRef,
    xrGlRef,
  };
}
