"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { VisualQuizActivity } from "@/features/student-learning/types";
import { CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";

export interface VisualQuizProps {
  activity: VisualQuizActivity;
  onComplete: (xp: number) => void;
}

type AnswerState = "idle" | "correct" | "retry";

export function VisualQuiz({ activity, onComplete }: VisualQuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");

  function handleSelect(optionId: string) {
    if (answerState === "correct") return;
    const option = activity.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelected(optionId);
    setAnswerState(option.isCorrect ? "correct" : "retry");
  }

  function handleRetry() {
    setSelected(null);
    setAnswerState("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <p className="font-heading text-lg font-bold text-ink-900 leading-snug">
        {activity.prompt}
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {activity.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrectOption = opt.isCorrect;

          let optStyle = "bg-white ring-lavender-200/60 text-ink-900 hover:ring-purple-500";
          if (isSelected && answerState === "correct") optStyle = "bg-mint-100 ring-teal-500 text-teal-700";
          else if (isSelected && answerState === "retry") optStyle = "bg-coral-500/10 ring-coral-500 text-coral-700";

          return (
            <motion.button
              key={opt.id}
              whileHover={answerState !== "correct" ? { scale: 1.02 } : {}}
              whileTap={answerState !== "correct" ? { scale: 0.98 } : {}}
              animate={
                isSelected && answerState === "retry"
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : {}
              }
              transition={{ duration: 0.35 }}
              onClick={() => handleSelect(opt.id)}
              disabled={answerState === "correct"}
              className={cn(
                "w-full text-left rounded-2xl px-5 py-4 ring-2 transition-colors font-sans text-base font-semibold",
                optStyle
              )}
            >
              <span className="flex items-center gap-3">
                {isSelected && answerState === "correct" && <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />}
                {isSelected && answerState === "retry" && <RotateCcw className="w-5 h-5 text-coral-600 shrink-0" />}
                {opt.label}
              </span>
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
            className="bg-mint-100 rounded-2xl px-5 py-4 flex flex-col gap-4 border border-teal-200/50"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <p className="font-heading text-sm font-bold text-teal-700">
                Jawaban Tepat!
              </p>
            </div>
            <p className="font-sans text-sm text-ink-800">{activity.successFeedback}</p>
            <Button variant="secondary" size="md" onClick={() => onComplete(20)} className="self-start gap-2">
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
            className="bg-coral-50 rounded-2xl px-5 py-4 flex flex-col gap-4 border border-coral-200/50"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-coral-600" />
              <p className="font-heading text-sm font-bold text-coral-700">
                Coba Lagi
              </p>
            </div>
            <p className="font-sans text-sm text-ink-800">{activity.retryFeedback}</p>
            <Button variant="ghost" size="sm" onClick={handleRetry} className="self-start px-0 hover:bg-transparent text-coral-700">
              <RotateCcw className="w-4 h-4 mr-2" /> Ulangi Pertanyaan
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
