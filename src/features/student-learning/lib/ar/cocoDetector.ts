import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-webgl";
import type { ObjectDetectionResult, RiskObjectClass } from "../../types";

const COCO_TO_RISK_CLASS: Record<string, RiskObjectClass> = {
  chair: "chair",
  "dining table": "table",
  laptop: "monitor",
  tv: "monitor",
  backpack: "backpack",
  bottle: "bottle",
  book: "book",
  car: "car",
  truck: "car",
  dog: "dog",
  cat: "cat",
  boat: "boat",
  bench: "bench",
  person: "person",
};

const MIN_CONFIDENCE = 0.45;

export class CocoSsdDetector {
  private model: cocoSsd.ObjectDetection | null = null;
  private isLoading = false;

  async load(): Promise<void> {
    if (this.model !== null || this.isLoading) return;
    this.isLoading = true;
    this.model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
    this.isLoading = false;
  }

  async detect(video: HTMLVideoElement): Promise<ObjectDetectionResult[]> {
    if (this.model === null) return [];
    if (video.readyState < 2) return [];

    const predictions = await this.model.detect(video);

    return predictions
      .filter((p) => {
        const mapped = COCO_TO_RISK_CLASS[p.class];
        return mapped !== undefined && p.score >= MIN_CONFIDENCE;
      })
      .map((p, i) => {
        const [x, y, w, h] = p.bbox;
        const videoW = video.videoWidth || video.clientWidth;
        const videoH = video.videoHeight || video.clientHeight;

        return {
          id: `coco-${p.class}-${i}-${Date.now()}`,
          className: COCO_TO_RISK_CLASS[p.class] as RiskObjectClass,
          source: "pretrained" as const,
          confidence: p.score,
          box: {
            xPercent: Math.min(92, Math.max(8, (x / videoW) * 100)),
            yPercent: Math.min(92, Math.max(8, (y / videoH) * 100)),
            widthPercent: (w / videoW) * 100,
            heightPercent: (h / videoH) * 100,
          },
        };
      });
  }

  dispose(): void {
    this.model?.dispose();
    this.model = null;
  }
}