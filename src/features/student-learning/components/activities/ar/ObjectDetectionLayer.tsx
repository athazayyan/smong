import React from "react";
import { ScanSearch } from "lucide-react";
import type { ObjectDetectionResult } from "@/features/student-learning/types";
import { getRiskClassLabel } from "@/features/student-learning/lib/ar/markerRules";

interface ObjectDetectionLayerProps {
  detections: ObjectDetectionResult[];
  isVisible: boolean;
}

export function ObjectDetectionLayer({ detections, isVisible }: ObjectDetectionLayerProps) {
  if (!isVisible) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {detections.map((detection) => (
        <div
          key={detection.id}
          className="absolute rounded-[1rem] border-2 border-mint-100/90 bg-teal-900/10 shadow-[0_0_24px_rgba(109,232,207,0.2)]"
          style={{
            left: `${detection.box.xPercent}%`,
            top: `${detection.box.yPercent}%`,
            width: `${detection.box.widthPercent}%`,
            height: `${detection.box.heightPercent}%`,
          }}
        >
          <div className="absolute -top-9 left-0 inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-1.5 text-xs font-black text-teal-900 shadow-sm">
            <ScanSearch className="h-3.5 w-3.5" />
            {getDetectionLabel(detection)}
          </div>
        </div>
      ))}
    </div>
  );
}

function getDetectionLabel(detection: ObjectDetectionResult) {
  const percent = Math.round(detection.confidence * 100);
  return `${getRiskClassLabel(detection.className)} ${percent}%`;
}
