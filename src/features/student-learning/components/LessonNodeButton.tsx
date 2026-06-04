"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LessonNode, LessonStatus, DisasterPhaseId } from "@/features/student-learning/types";

export interface LessonNodeButtonProps {
  node: LessonNode;
  index: number;
  isCheckpoint?: boolean;
}

const STATUS_CONFIG: Record<
  LessonStatus,
  { bg: string; ring: string; icon: string; textColor: string }
> = {
  locked: {
    bg: "bg-lavender-200/40",
    ring: "ring-lavender-200",
    icon: "🔒",
    textColor: "text-ink-700/50",
  },
  available: {
    bg: "bg-white",
    ring: "ring-purple-500",
    icon: "⭐",
    textColor: "text-ink-900",
  },
  active: {
    bg: "bg-purple-700",
    ring: "ring-purple-900",
    icon: "🚀",
    textColor: "text-white",
  },
  completed: {
    bg: "bg-teal-500",
    ring: "ring-teal-500",
    icon: "✅",
    textColor: "text-white",
  },
  mastered: {
    bg: "bg-yellow-200",
    ring: "ring-yellow-200",
    icon: "👑",
    textColor: "text-ink-900",
  },
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


  // Alternate alignment for winding path feel
  const alignRight = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn("flex flex-col items-center gap-2", alignRight ? "lg:self-end lg:mr-16" : "lg:self-start lg:ml-16")}
    >
      {/* Node button */}
      {isLocked ? (
        <div>
          <motion.div
            animate={{}}
            className={cn(
              "flex items-center justify-center rounded-full ring-4 shadow-lg transition-colors",
              isCheckpoint ? "w-20 h-20" : "w-16 h-16",
              config.bg,
              config.ring
            )}
          >
            <span className={cn("select-none", isCheckpoint ? "text-3xl" : "text-2xl")}>
              {config.icon}
            </span>
          </motion.div>
        </div>
      ) : (
        <Link href={`/dashboard/siswa/lesson/${node.id}`}>
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
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
              "flex items-center justify-center rounded-full ring-4 shadow-lg transition-colors cursor-pointer",
              isCheckpoint ? "w-20 h-20" : "w-16 h-16",
              config.bg,
              config.ring
            )}
          >
            <span className={cn("select-none", isCheckpoint ? "text-3xl" : "text-2xl")}>
              {config.icon}
            </span>
          </motion.div>
        </Link>
      )}

      {/* Label */}
      <div className="text-center max-w-[120px]">
        <p className={cn("font-heading text-xs font-bold leading-tight", config.textColor)}>
          {node.title}
        </p>
        <p className="font-sans text-[10px] text-ink-700/60 mt-0.5">
          {PHASE_LABEL[node.phaseId]}
        </p>
        {!isLocked && (
          <p className="font-sans text-[10px] text-purple-500 font-semibold mt-0.5">
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
