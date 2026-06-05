"use client";

import React, { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { RotateCw, CheckCircle2 } from "lucide-react";
import type { FlashcardActivity } from "@/features/student-learning/types";

interface FlashcardProps {
  activity: FlashcardActivity;
  onComplete: (xp: number) => void;
}

export function Flashcard({ activity, onComplete }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const cardVariants: Variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  const handleFlip = () => {
    if (!isDone) setIsFlipped((prev) => !prev);
  };

  const handleDone = () => {
    setIsDone(true);
    onComplete(0); // flashcards don't award XP directly, parent handles it
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <p className="font-sans text-sm text-ink-700 text-center">{activity.prompt}</p>

      {/* Card */}
      <div
        className="relative w-full h-56 cursor-pointer"
        style={{ perspective: 1000 }}
        onClick={handleFlip}
      >
        <motion.div
          variants={cardVariants}
          animate={isFlipped ? "back" : "front"}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full h-full"
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 bg-white rounded-3xl ring-2 ring-lavender-200 shadow-lg flex flex-col items-center justify-center gap-4 p-6"
          >
            <p className="font-heading text-xl font-bold text-ink-900 text-center leading-snug">
              {activity.front}
            </p>
            <div className="flex items-center gap-2 text-purple-500 text-xs font-sans font-semibold">
              <RotateCw className="w-4 h-4" />
              Ketuk untuk membalik
            </div>
          </div>

          {/* Back */}
          <div
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 bg-purple-700 rounded-3xl shadow-lg flex items-center justify-center p-6"
          >
            <p className="font-sans text-base text-white text-center leading-relaxed">
              {activity.back}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Feedback & Done */}
      {isFlipped && !isDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <p className="font-sans text-sm text-teal-700 text-center">{activity.successFeedback}</p>
          <button
            onClick={handleDone}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            Mengerti, Lanjut
          </button>
        </motion.div>
      )}

      {isDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-teal-600 font-bold text-sm"
        >
          <CheckCircle2 className="w-5 h-5" />
          Selesai dipelajari
        </motion.div>
      )}
    </div>
  );
}
