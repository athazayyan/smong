"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { TrueFalseActivity } from "@/features/student-learning/types";

interface TrueFalseProps {
  activity: TrueFalseActivity;
  onComplete: (xp: number) => void;
}

type AnswerState = "idle" | "correct" | "wrong";

export function TrueFalse({ activity, onComplete }: TrueFalseProps) {
  const [answerState, setAnswerState] = useState<AnswerState>("idle");

  const handleAnswer = (answer: boolean) => {
    if (answerState !== "idle") return;
    if (answer === activity.isTrue) {
      setAnswerState("correct");
      onComplete(0);
    } else {
      setAnswerState("wrong");
    }
  };

  const handleRetry = () => {
    setAnswerState("idle");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <p className="font-sans text-xs font-bold text-ink-700/60 uppercase tracking-wider">
        {activity.prompt}
      </p>

      <div className="w-full bg-white rounded-3xl ring-2 ring-lavender-200 shadow-sm p-6">
        <p className="font-heading text-lg font-bold text-ink-900 text-center leading-snug">
          {activity.statement}
        </p>
      </div>

      {/* Buttons */}
      {answerState === "idle" && (
        <div className="flex gap-4 w-full">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleAnswer(true)}
            className="flex-1 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Benar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleAnswer(false)}
            className="flex-1 py-4 bg-coral-500 hover:bg-red-500 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Salah
          </motion.button>
        </div>
      )}

      {/* Feedback */}
      {answerState === "correct" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-mint-100 border border-teal-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-teal-800">{activity.successFeedback}</p>
        </motion.div>
      )}

      {answerState === "wrong" && (
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
          transition={{ duration: 0.4 }}
          className="w-full flex flex-col gap-3"
        >
          <div className="bg-peach-200/60 border border-coral-500/30 rounded-2xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-coral-500 shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-ink-900">{activity.retryFeedback}</p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-white border-2 border-lavender-200 hover:border-purple-400 text-purple-700 font-bold rounded-2xl transition-colors"
          >
            Coba Lagi
          </button>
        </motion.div>
      )}
    </div>
  );
}
