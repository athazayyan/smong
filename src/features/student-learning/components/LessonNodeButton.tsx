"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LessonNode, LessonStatus, DisasterPhaseId } from "@/features/student-learning/types";
import { Lock, Star, Rocket, Check, Trophy } from "lucide-react";

export interface LessonNodeButtonProps {
  node: LessonNode;
  index: number;
  isCheckpoint?: boolean;
}

const STATUS_CONFIG: Record<
  LessonStatus,
  { bg: string; ring: string; icon: React.ElementType; textColor: string }
> = {
  locked: { bg: "bg-lavender-200/40", ring: "ring-lavender-200", icon: Lock, textColor: "text-ink-700/50" },
  available: { bg: "bg-white", ring: "ring-purple-500", icon: Star, textColor: "text-ink-900" },
  active: { bg: "bg-purple-700", ring: "ring-purple-900", icon: Rocket, textColor: "text-white" },
  completed: { bg: "bg-teal-500", ring: "ring-teal-500", icon: Check, textColor: "text-white" },
  mastered: { bg: "bg-yellow-200", ring: "ring-yellow-200", icon: Trophy, textColor: "text-ink-900" },
};

const PHASE_LABEL: Record<DisasterPhaseId, string> = {
  "pra-bencana": "Pra-Bencana",
  "saat-bencana": "Saat Bencana",
  "pascabencana": "Pascabencana",
};

export function LessonNodeButton({ node, index, isCheckpoint = false }: LessonNodeButtonProps) {
  const config = STATUS_CONFIG[node.status];
  const isLocked = node.status === "locked";
  const isActive = node.status === "active";
  const Icon = config.icon;

  const alignRight = index % 2 === 1;

  const nodeContent = (
    <motion.div
      animate={
        isActive
          ? { boxShadow: ["0 0 0 0 rgba(91,59,181,0.4)", "0 0 0 12px rgba(91,59,181,0)", "0 0 0 0 rgba(91,59,181,0)"] }
          : node.status === "available"
          ? { y: [0, -4, 0] }
          : {}
      }
      transition={
        isActive
          ? { duration: 1.8, repeat: Infinity }
          : node.status === "available"
          ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
      className={cn(
        "flex items-center justify-center rounded-full ring-4 shadow-lg transition-colors",
        isCheckpoint ? "w-20 h-20" : "w-16 h-16",
        config.bg,
        config.ring
      )}
    >
      <Icon className={cn(isCheckpoint ? "w-8 h-8" : "w-6 h-6", isLocked ? "text-ink-700/40" : isActive || node.status === "completed" ? "text-white" : "text-ink-900")} />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn("flex flex-col items-center gap-3", alignRight ? "lg:self-end lg:mr-16" : "lg:self-start lg:ml-16")}
    >
      {/* Node button */}
      {isLocked ? (
        <div>{nodeContent}</div>
      ) : (
        <Link href={`/dashboard/siswa/lesson/${node.id}`}>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
            {nodeContent}
          </motion.div>
        </Link>
      )}

      {/* Label */}
      <div className="text-center max-w-[140px] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-lavender-200/50 shadow-sm">
        <p className={cn("font-heading text-xs font-bold leading-tight", config.textColor)}>
          {node.title}
        </p>
        <p className="font-sans text-[10px] text-ink-700 mt-0.5">
          {PHASE_LABEL[node.phaseId]}
        </p>
        {!isLocked && (
          <p className="font-sans text-[10px] text-purple-600 font-bold mt-1">
            {node.reward.label}
          </p>
        )}
      </div>

      {/* Locked tooltip */}
      {isLocked && (
        <p className="font-sans text-[10px] text-ink-700/50 text-center max-w-[100px] leading-tight">
          Selesaikan misi sebelumnya
        </p>
      )}
    </motion.div>
  );
}
