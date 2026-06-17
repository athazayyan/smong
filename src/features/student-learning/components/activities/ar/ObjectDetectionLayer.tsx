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
          className="absolute rounded-[1rem] border-[2px] border-mint-100/90 bg-teal-900/10 shadow-[0_0_24px_rgba(109,232,207,0.2)] md:border-[1.5px]"
          style={{
            left: `${detection.box.xPercent}%`,
            top: `${detection.box.yPercent}%`,
            width: `${detection.box.widthPercent}%`,
            height: `${detection.box.heightPercent}%`,
          }}
        >
          <div className="absolute -top-8 left-0 inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-1 shadow-sm md:-top-9 md:px-3 md:py-1.5">
            <ScanSearch className="h-3 w-3 text-teal-900 md:h-3.5 md:w-3.5" />
            <span className="text-[10px] font-black text-teal-900 md:text-xs">
              {getRiskClassLabel(detection.className)}
            </span>
            {/* Confidence hanya di desktop */}
            <span className="hidden text-[10px] font-black text-teal-900 md:inline">
              {Math.round(detection.confidence * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}