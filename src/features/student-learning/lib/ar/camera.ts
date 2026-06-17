export type CameraFacingMode = "environment" | "user";

export type CameraRequestResult =
  | { status: "ready"; stream: MediaStream; actualFacingMode: CameraFacingMode }
  | { status: "unsupported" }
  | { status: "denied" };

export function isCameraSupported() {
  return (
    typeof navigator !== "undefined" &&
    navigator.mediaDevices !== undefined &&
    navigator.mediaDevices.getUserMedia !== undefined
  );
}

export async function requestSafetyLensCamera(
  facingMode: CameraFacingMode = "environment"
): Promise<CameraRequestResult> {
  if (!isCameraSupported()) {
    return { status: "unsupported" };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: { ideal: facingMode },
      },
      audio: false,
    });

    // Detect actual facing mode (iOS Safari may ignore the constraint)
    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack?.getSettings();
    const actualFacingMode: CameraFacingMode =
      settings?.facingMode === "user" ? "user" : "environment";

    return { status: "ready", stream, actualFacingMode };
  } catch {
    return { status: "denied" };
  }
}

export function stopCameraStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}