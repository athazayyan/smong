import type { ObjectDetectionResult, RiskObjectClass } from "@/features/student-learning/types";

type OrtModule = typeof import("onnxruntime-web/wasm");
type OrtSession = import("onnxruntime-web/wasm").InferenceSession;

export type YoloDetectorConfig = {
  modelPath: string;
  inputSize: number;
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
};

type YoloCandidate = {
  classId: number;
  confidence: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};

type RiskCandidate = {
  className: RiskObjectClass;
  confidence: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
};

const DEFAULT_CONFIG = {
  modelPath: "/models/yolo/yolov8m.onnx",
  inputSize: 640,
  confidenceThreshold: 0.42,
  iouThreshold: 0.45,
  maxDetections: 8,
} satisfies YoloDetectorConfig;

const PERSON_CLASS_ID = 0;
const BACKPACK_CLASS_ID = 24;
const HANDBAG_CLASS_ID = 26;
const SUITCASE_CLASS_ID = 28;
const BOTTLE_CLASS_ID = 39;
const CHAIR_CLASS_ID = 56;
const TABLE_CLASS_ID = 60;
const BOOK_CLASS_ID = 73;

const FLOOR_ITEM_CLASS_IDS = [
  BACKPACK_CLASS_ID,
  HANDBAG_CLASS_ID,
  SUITCASE_CLASS_ID,
  BOTTLE_CLASS_ID,
  BOOK_CLASS_ID,
] as const;

const BLOCKING_OBJECT_CLASS_IDS = [CHAIR_CLASS_ID, TABLE_CLASS_ID] as const;

export class YoloObjectDetector {
  private readonly config: YoloDetectorConfig;
  private session: OrtSession | undefined;
  private ort: OrtModule | undefined;
  private canvas: HTMLCanvasElement | undefined;
  private context: CanvasRenderingContext2D | undefined;

  constructor(config: Partial<YoloDetectorConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  async load() {
    if (this.session !== undefined) return;

    const ort = await import("onnxruntime-web/wasm");
    ort.env.wasm.numThreads = 1;

    this.ort = ort;
    this.session = await ort.InferenceSession.create(this.config.modelPath, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
  }

  async detect(video: HTMLVideoElement): Promise<ObjectDetectionResult[]> {
    if (this.session === undefined || this.ort === undefined) {
      throw new Error("YOLO detector has not been loaded.");
    }

    const input = this.createInputTensor(video, this.ort);
    const inputName = this.getRequiredName(this.session.inputNames, "input");
    const outputName = this.getRequiredName(this.session.outputNames, "output");
    const result = await this.session.run({ [inputName]: input }, [outputName]);
    const output = result[outputName];

    if (output === undefined || output.type !== "float32" || !(output.data instanceof Float32Array)) {
      throw new Error("YOLO model returned an unsupported output tensor.");
    }

    return this.toRiskDetections(output.data, output.dims);
  }

  dispose() {
    this.session = undefined;
    this.ort = undefined;
    this.canvas = undefined;
    this.context = undefined;
  }

  private createInputTensor(video: HTMLVideoElement, ort: OrtModule) {
    const context = this.getCanvasContext();
    const size = this.config.inputSize;
    context.drawImage(video, 0, 0, size, size);

    const imageData = context.getImageData(0, 0, size, size);
    const pixels = imageData.data;
    const channelSize = size * size;
    const input = new Float32Array(3 * channelSize);

    for (let pixelIndex = 0; pixelIndex < channelSize; pixelIndex += 1) {
      const sourceIndex = pixelIndex * 4;
      input[pixelIndex] = pixels[sourceIndex] / 255;
      input[channelSize + pixelIndex] = pixels[sourceIndex + 1] / 255;
      input[channelSize * 2 + pixelIndex] = pixels[sourceIndex + 2] / 255;
    }

    return new ort.Tensor("float32", input, [1, 3, size, size]);
  }

  private getCanvasContext() {
    if (this.canvas !== undefined && this.context !== undefined) {
      return this.context;
    }

    const canvas = document.createElement("canvas");
    canvas.width = this.config.inputSize;
    canvas.height = this.config.inputSize;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (context === null) {
      throw new Error("Canvas 2D context is unavailable.");
    }

    this.canvas = canvas;
    this.context = context;
    return context;
  }

  private getRequiredName(names: readonly string[], label: "input" | "output") {
    const name = names[0];
    if (name === undefined) {
      throw new Error(`YOLO model has no ${label} name.`);
    }
    return name;
  }

  private toRiskDetections(data: Float32Array, dims: readonly number[]) {
    const classCount = this.getClassCount(dims);
    const boxCount = this.getBoxCount(dims);
    const candidates = this.extractCandidates(data, classCount, boxCount);
    const selected = this.applyNms(candidates);
    const riskCandidates = this.mapCandidatesToRisks(selected);

    return riskCandidates.slice(0, this.config.maxDetections).map((candidate, index) => ({
      id: `yolo-${candidate.className}-${index}`,
      className: candidate.className,
      source: "pretrained",
      confidence: candidate.confidence,
      box: {
        xPercent: candidate.xPercent,
        yPercent: candidate.yPercent,
        widthPercent: candidate.widthPercent,
        heightPercent: candidate.heightPercent,
      },
    } satisfies ObjectDetectionResult));
  }

  private getClassCount(dims: readonly number[]) {
    const channelCount = dims[1];
    if (channelCount === undefined || channelCount < 5) {
      throw new Error("YOLO output has an invalid channel count.");
    }
    return channelCount - 4;
  }

  private getBoxCount(dims: readonly number[]) {
    const boxCount = dims[2];
    if (boxCount === undefined || boxCount < 1) {
      throw new Error("YOLO output has an invalid box count.");
    }
    return boxCount;
  }

  private extractCandidates(data: Float32Array, classCount: number, boxCount: number) {
    const candidates: YoloCandidate[] = [];

    for (let boxIndex = 0; boxIndex < boxCount; boxIndex += 1) {
      const centerX = data[boxIndex];
      const centerY = data[boxCount + boxIndex];
      const width = data[boxCount * 2 + boxIndex];
      const height = data[boxCount * 3 + boxIndex];

      if (centerX === undefined || centerY === undefined || width === undefined || height === undefined) {
        continue;
      }

      let bestClassId = 0;
      let bestScore = 0;

      for (let classOffset = 0; classOffset < classCount; classOffset += 1) {
        const score = data[boxCount * (4 + classOffset) + boxIndex];
        if (score !== undefined && score > bestScore) {
          bestScore = score;
          bestClassId = classOffset;
        }
      }

      if (bestScore >= this.config.confidenceThreshold) {
        candidates.push({
          classId: bestClassId,
          confidence: bestScore,
          centerX,
          centerY,
          width,
          height,
        });
      }
    }

    return candidates;
  }

  private applyNms(candidates: YoloCandidate[]) {
    const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);
    const selected: YoloCandidate[] = [];

    for (const candidate of sorted) {
      const overlaps = selected.some((item) => item.classId === candidate.classId && this.calculateIou(item, candidate) > this.config.iouThreshold);
      if (!overlaps) {
        selected.push(candidate);
      }
    }

    return selected;
  }

  private mapCandidatesToRisks(candidates: YoloCandidate[]) {
    const risks: RiskCandidate[] = [];
    const people = candidates.filter((candidate) => candidate.classId === PERSON_CLASS_ID);

    if (people.length >= 3) {
      risks.push(this.createCrowdedAreaRisk(people));
    }

    for (const candidate of candidates) {
      if (this.includesClass(FLOOR_ITEM_CLASS_IDS, candidate.classId) && this.getYPercent(candidate) >= 42) {
        risks.push(this.createRiskCandidate(candidate, "floor-item"));
      }

      if (this.includesClass(BLOCKING_OBJECT_CLASS_IDS, candidate.classId) && this.getYPercent(candidate) >= 34) {
        risks.push(this.createRiskCandidate(candidate, "blocked-path"));
      }
    }

    return risks.sort((a, b) => b.confidence - a.confidence);
  }

  private createCrowdedAreaRisk(people: YoloCandidate[]) {
    const bounds = this.mergeBounds(people);
    return {
      className: "crowded-area",
      confidence: Math.min(1, people.reduce((total, item) => total + item.confidence, 0) / people.length),
      xPercent: bounds.xPercent,
      yPercent: bounds.yPercent,
      widthPercent: bounds.widthPercent,
      heightPercent: bounds.heightPercent,
    } satisfies RiskCandidate;
  }

  private createRiskCandidate(candidate: YoloCandidate, className: RiskObjectClass) {
    return {
      className,
      confidence: candidate.confidence,
      xPercent: this.getXPercent(candidate),
      yPercent: this.getYPercent(candidate),
      widthPercent: this.getWidthPercent(candidate),
      heightPercent: this.getHeightPercent(candidate),
    } satisfies RiskCandidate;
  }

  private mergeBounds(candidates: YoloCandidate[]) {
    let left = 100;
    let top = 100;
    let right = 0;
    let bottom = 0;

    for (const candidate of candidates) {
      left = Math.min(left, this.getXPercent(candidate));
      top = Math.min(top, this.getYPercent(candidate));
      right = Math.max(right, this.getXPercent(candidate) + this.getWidthPercent(candidate));
      bottom = Math.max(bottom, this.getYPercent(candidate) + this.getHeightPercent(candidate));
    }

    return {
      xPercent: clampPercent(left),
      yPercent: clampPercent(top),
      widthPercent: clampSizePercent(right - left),
      heightPercent: clampSizePercent(bottom - top),
    };
  }

  private calculateIou(a: YoloCandidate, b: YoloCandidate) {
    const aLeft = a.centerX - a.width / 2;
    const aTop = a.centerY - a.height / 2;
    const aRight = a.centerX + a.width / 2;
    const aBottom = a.centerY + a.height / 2;
    const bLeft = b.centerX - b.width / 2;
    const bTop = b.centerY - b.height / 2;
    const bRight = b.centerX + b.width / 2;
    const bBottom = b.centerY + b.height / 2;

    const intersectionWidth = Math.max(0, Math.min(aRight, bRight) - Math.max(aLeft, bLeft));
    const intersectionHeight = Math.max(0, Math.min(aBottom, bBottom) - Math.max(aTop, bTop));
    const intersectionArea = intersectionWidth * intersectionHeight;
    const unionArea = a.width * a.height + b.width * b.height - intersectionArea;

    if (unionArea <= 0) return 0;
    return intersectionArea / unionArea;
  }

  private includesClass(classIds: readonly number[], classId: number) {
    return classIds.includes(classId);
  }

  private getXPercent(candidate: YoloCandidate) {
    return clampPercent(((candidate.centerX - candidate.width / 2) / this.config.inputSize) * 100);
  }

  private getYPercent(candidate: YoloCandidate) {
    return clampPercent(((candidate.centerY - candidate.height / 2) / this.config.inputSize) * 100);
  }

  private getWidthPercent(candidate: YoloCandidate) {
    return clampSizePercent((candidate.width / this.config.inputSize) * 100);
  }

  private getHeightPercent(candidate: YoloCandidate) {
    return clampSizePercent((candidate.height / this.config.inputSize) * 100);
  }
}

function clampPercent(value: number) {
  return Math.min(96, Math.max(0, value));
}

function clampSizePercent(value: number) {
  return Math.min(100, Math.max(2, value));
}
