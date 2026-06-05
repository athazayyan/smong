"use client";

import { motion } from "framer-motion";
import { LessonNode, DisasterPhaseId } from "@/features/student-learning/types";
import { LessonNodeButton } from "./LessonNodeButton";
import { PhaseBanner } from "./PhaseBanner";
import { Trophy } from "lucide-react";

export interface ModulePathProps {
  nodes: LessonNode[];
}

// Group consecutive nodes by phase, inserting banners at phase transitions
function groupNodesByPhase(nodes: LessonNode[]): Array<{ type: "banner"; phaseId: DisasterPhaseId } | { type: "node"; node: LessonNode; index: number }> {
  const result: Array<{ type: "banner"; phaseId: DisasterPhaseId } | { type: "node"; node: LessonNode; index: number }> = [];
  let lastPhase: DisasterPhaseId | null = null;

  nodes.forEach((node, i) => {
    if (node.phaseId !== lastPhase) {
      result.push({ type: "banner", phaseId: node.phaseId });
      lastPhase = node.phaseId;
    }
    result.push({ type: "node", node, index: i });
  });

  return result;
}

// Connector line SVG between nodes
function PathConnector({ index }: { index: number }) {
  const flip = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.08 }}
      className="flex justify-center w-full"
    >
      <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className={flip ? "scale-x-[-1]" : ""}>
        <path
          d="M 10 5 Q 40 5 40 20 Q 40 35 70 35"
          stroke="#DDD2FF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 4"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}

export function ModulePath({ nodes }: ModulePathProps) {
  const items = groupNodesByPhase(nodes);

  return (
    <div className="relative flex flex-col items-center gap-4 w-full max-w-sm mx-auto py-4 px-2">
      {items.map((item, i) => {
        if (item.type === "banner") {
          return (
            <div key={`banner-${item.phaseId}`} className="w-full mt-4 first:mt-0">
              <PhaseBanner phaseId={item.phaseId} />
            </div>
          );
        }

        const isLast = i === items.length - 1;
        const isCheckpoint =
          item.node.reward.type === "badge" &&
          item.node.reward.badgeId !== undefined;

        return (
          <div key={item.node.id} className="flex flex-col items-center w-full">
            <LessonNodeButton
              node={item.node}
              index={item.index}
              isCheckpoint={isCheckpoint}
            />
            {!isLast && items[i + 1]?.type === "node" && (
              <PathConnector index={item.index} />
            )}
          </div>
        );
      })}

      {/* End of path marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: nodes.length * 0.1 + 0.3 }}
        className="flex flex-col items-center gap-3 mt-6"
      >
        <div className="w-14 h-14 rounded-full bg-yellow-200/40 ring-4 ring-yellow-200 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-yellow-700" />
        </div>
        <p className="font-sans text-xs font-semibold text-ink-700/60 text-center max-w-[150px]">
          Selesaikan semua misi untuk badge Pahlawan Evakuasi!
        </p>
      </motion.div>
    </div>
  );
}
