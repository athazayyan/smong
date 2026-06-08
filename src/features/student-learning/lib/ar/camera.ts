export type CameraRequestResult =
  | {
      status: "ready";
      stream: MediaStream;
    }
  | {
      status: "unsupported";
    }
  | {
      status: "denied";
    };

export function isCameraSupported() {
  return typeof navigator !== "undefined" && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined;
}

export async function requestSafetyLensCamera(): Promise<CameraRequestResult> {
  if (!isCameraSupported()) {
    return { status: "unsupported" };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: { ideal: "environment" },
      },
      audio: false,
    });

    return { status: "ready", stream };
  } catch {
    return { status: "denied" };
  }
}

export function stopCameraStream(stream: MediaStream | null) {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
  });
}
