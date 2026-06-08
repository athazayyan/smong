import type {
  ArWarning,
  ArWarningRule,
  ObjectDetectionResult,
  RiskLevel,
  RiskObjectClass,
} from "@/features/student-learning/types";

export function buildArWarnings(detections: ObjectDetectionResult[], rules: ArWarningRule[]) {
  return detections
    .map((detection) => buildWarningForDetection(detection, rules))
    .filter((warning): warning is ArWarning => warning !== undefined);
}

export function createManualDetection({
  id,
  className,
  xPercent,
  yPercent,
  source,
}: {
  id: string;
  className: RiskObjectClass;
  xPercent: number;
  yPercent: number;
  source: "manual" | "simulated";
}): ObjectDetectionResult {
  return {
    id,
    className,
    source,
    confidence: 1,
    box: {
      xPercent,
      yPercent,
      widthPercent: 10,
      heightPercent: 10,
    },
  };
}

export function getRiskLevelLabel(riskLevel: RiskLevel) {
  if (riskLevel === "high") return "Risiko tinggi";
  if (riskLevel === "medium") return "Perlu perhatian";
  return "Perhatian ringan";
}

export function getRiskClassLabel(className: RiskObjectClass) {
  if (className === "glass-zone") return "Kaca";
  if (className === "tall-object") return "Rak/Benda Tinggi";
  if (className === "blocked-path") return "Jalur Terhalang";
  if (className === "crowded-area") return "Area Ramai";
  if (className === "floor-item") return "Barang di Lantai";
  if (className === "backpack") return "Tas";
  if (className === "person") return "Orang";
  if (className === "table") return "Meja";
  if (className === "chair") return "Kursi";
  if (className === "monitor") return "Monitor";
  if (className === "door") return "Pintu";
  if (className === "window") return "Jendela";
  if (className === "stairs") return "Tangga";
  if (className === "shelf") return "Rak";
  if (className === "exit-sign") return "Rambu Keluar";
  if (className === "bottle") return "Botol";
  if (className === "book") return "Buku";
  return "Objek";
}

function buildWarningForDetection(detection: ObjectDetectionResult, rules: ArWarningRule[]) {
  const rule = rules.find((item) => item.targetClass === detection.className);
  if (!rule) return undefined;

  return {
    id: `warning-${detection.id}`,
    ruleId: rule.id,
    riskClass: detection.className,
    riskLevel: rule.riskLevel,
    title: rule.title,
    message: rule.message,
    actionLabel: rule.actionLabel,
    xPercent: detection.box.xPercent + detection.box.widthPercent / 2,
    yPercent: detection.box.yPercent + detection.box.heightPercent / 2,
    source: detection.source,
  } satisfies ArWarning;
}
