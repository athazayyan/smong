"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DecisionSimulationActivity } from "@/features/student-learning/types";
import { School, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";

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
      <div className="bg-sky-100 rounded-2xl px-5 py-4 flex items-start gap-4 border border-sky-200">
        <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center shrink-0">
          <School className="w-5 h-5 text-sky-700" />
        </div>
        <p className="font-sans text-sm text-ink-900 leading-relaxed font-semibold mt-1">
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

          let optStyle = "bg-white ring-lavender-200/60 hover:ring-purple-500 text-ink-900";
          if (isSelected && answerState === "correct") optStyle = "bg-mint-100 ring-teal-500 text-teal-700";
          else if (isSelected && answerState === "retry") optStyle = "bg-coral-50 ring-coral-400 text-coral-700";

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
                "w-full text-left flex items-start gap-3 rounded-2xl px-5 py-4 ring-2 transition-colors font-sans text-sm font-semibold leading-snug",
                optStyle
              )}
            >
              {isSelected && answerState === "correct" && <CheckCircle2 className="w-5 h-5 shrink-0 text-teal-600" />}
              {isSelected && answerState === "retry" && <RotateCcw className="w-5 h-5 shrink-0 text-coral-500" />}
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
            className="bg-mint-100 rounded-2xl px-5 py-4 flex flex-col gap-4 border border-teal-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <p className="font-heading text-sm font-bold text-teal-700">Pilihan Tepat!</p>
            </div>
            <p className="font-sans text-sm text-ink-800 font-semibold">{explanation}</p>
            <p className="font-sans text-sm text-ink-700">{activity.successFeedback}</p>
            <Button variant="secondary" size="md" onClick={() => onComplete(25)} className="self-start gap-2">
              Lanjut <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
        {answerState === "retry" && (
          <motion.div
            key="retry"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-coral-50 rounded-2xl px-5 py-4 flex flex-col gap-4 border border-coral-200"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-coral-600" />
              <p className="font-heading text-sm font-bold text-coral-700">Coba Lagi</p>
            </div>
            <p className="font-sans text-sm text-ink-800 font-semibold">{explanation}</p>
            <p className="font-sans text-sm text-ink-700">{activity.retryFeedback}</p>
            <Button variant="ghost" size="sm" onClick={handleRetry} className="self-start px-0 text-coral-700 hover:bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" /> Ulangi Pilihan
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
