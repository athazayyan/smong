"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DecisionSimulationActivity } from "@/features/student-learning/types";

export interface DecisionSimulationProps {
  activity: DecisionSimulationActivity;
  onComplete: (xp: number) => void;
}

type AnswerState = "idle" | "correct" | "retry";

export function DecisionSimulation({ activity, onComplete }: DecisionSimulationProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [explanation, setExplanation] = useState<string | null>(null);

  function handleSelect(optionId: string) {
    if (answerState === "correct") return;
    const option = activity.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelected(optionId);
    setAnswerState(option.isCorrect ? "correct" : "retry");
    setExplanation(option.explanation);
  }

  function handleRetry() {
    setSelected(null);
    setAnswerState("idle");
    setExplanation(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Scenario hook box */}
      <div className="bg-sky-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">🏫</span>
        <p className="font-sans text-sm text-ink-900 leading-relaxed font-semibold">
          {activity.prompt}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        <p className="font-heading text-xs font-semibold text-ink-700 uppercase tracking-wide">
          Pilih tindakanmu:
        </p>
        {activity.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrectOption = opt.isCorrect;

          let optStyle = "bg-white ring-lavender-200/60 hover:ring-purple-500 text-ink-900";
          if (isSelected && answerState === "correct") optStyle = "bg-mint-100 ring-teal-500 text-teal-500";
          else if (isSelected && answerState === "retry") optStyle = "bg-coral-500/10 ring-coral-500 text-coral-500";

          return (
            <motion.button
              key={opt.id}
              whileHover={answerState !== "correct" ? { scale: 1.02 } : {}}
              whileTap={answerState !== "correct" ? { scale: 0.97 } : {}}
              animate={isSelected && answerState === "retry" ? { x: [0, -5, 5, -3, 3, 0] } : {}}
              transition={{ duration: 0.3 }}
              onClick={() => handleSelect(opt.id)}
              disabled={answerState === "correct"}
              className={cn(
                "w-full text-left rounded-2xl px-5 py-4 ring-2 transition-colors font-sans text-sm font-semibold leading-snug",
                optStyle
              )}
            >
              {isSelected && answerState === "correct" && "✅ "}
              {isSelected && answerState === "retry" && "↩️ "}
              {opt.label}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {answerState === "correct" && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-mint-100 rounded-2xl px-5 py-4 flex flex-col gap-3"
          >
            <p className="font-heading text-sm font-bold text-teal-500">✅ Pilihan Tepat!</p>
            <p className="font-sans text-sm text-ink-700">{explanation}</p>
            <p className="font-sans text-sm text-ink-700">{activity.successFeedback}</p>
            <Button variant="secondary" size="md" onClick={() => onComplete(25)} className="self-start">
              Lanjut →
            </Button>
          </motion.div>
        )}
        {answerState === "retry" && (
          <motion.div
            key="retry"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-coral-500/10 rounded-2xl px-5 py-4 flex flex-col gap-3"
          >
            <p className="font-heading text-sm font-bold text-coral-500">↩️ Coba Lagi</p>
            <p className="font-sans text-sm text-ink-700">{explanation}</p>
            <p className="font-sans text-sm text-ink-700">{activity.retryFeedback}</p>
            <Button variant="ghost" size="sm" onClick={handleRetry} className="self-start">
              Coba Lagi
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
