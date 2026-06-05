"use client";

import { Activity } from "@/features/student-learning/types";
import { VisualQuiz } from "./activities/VisualQuiz";
import { DecisionSimulation } from "./activities/DecisionSimulation";
import { DragAndDrop } from "./activities/DragAndDrop";
import { Checklist } from "./activities/Checklist";
import { ReflectionChoice } from "./activities/ReflectionChoice";

export interface ActivityRendererProps {
  activity: Activity;
  onComplete: (xp: number) => void;
}

export function ActivityRenderer({ activity, onComplete }: ActivityRendererProps) {
  switch (activity.type) {
    case "visual-quiz":
      return <VisualQuiz activity={activity} onComplete={onComplete} />;
    case "decision-simulation":
      return <DecisionSimulation activity={activity} onComplete={onComplete} />;
    case "drag-and-drop":
      return <DragAndDrop activity={activity} onComplete={onComplete} />;
    case "checklist":
      return <Checklist activity={activity} onComplete={onComplete} />;
    case "reflection-choice":
      return <ReflectionChoice activity={activity} onComplete={onComplete} />;
    default: {
      // exhaustive type check
      const _never: never = activity;
      return (
        <div className="font-sans text-sm text-coral-500 p-4 bg-coral-500/10 rounded-2xl">
          Aktivitas tidak dikenal. Silakan hubungi admin.
        </div>
      );
    }
  }
}
