"use client";

import React, { type KeyboardEvent, useState } from "react";
import { motion } from "framer-motion";
import { RotateCw, CheckCircle2 } from "lucide-react";
import type { FlashcardActivity } from "@/features/student-learning/types";

interface FlashcardProps {
  activity: FlashcardActivity;
  onComplete: (xp: number) => void;
}

export function Flashcard({ activity, onComplete }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleFlip = () => {
    if (!isDone) setIsFlipped((prev) => !prev);
  };

  const handleDone = () => {
    setIsDone(true);
    onComplete(0); // flashcards don't award XP directly, parent handles it
  };

  const handleFlipKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleFlip();
  };

  const handleDoneKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleDone();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <p className="font-sans text-sm text-ink-700 text-center">{activity.prompt}</p>

      {/* Card */}
      <button
        type="button"
        className={`relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl p-6 text-center shadow-lg ring-2 transition ${
          isFlipped
            ? "bg-purple-700 text-white ring-purple-500"
            : "bg-white text-ink-900 ring-lavender-200"
        }`}
        onClick={handleFlip}
        onKeyDown={handleFlipKeyDown}
      >
        <p className={`font-heading text-xl font-bold leading-snug ${isFlipped ? "text-white" : "text-ink-900"}`}>
          {isFlipped ? activity.back : activity.front}
        </p>
        <div className={`flex items-center gap-2 text-xs font-sans font-semibold ${isFlipped ? "text-lavender-100" : "text-purple-500"}`}>
          <RotateCw className="w-4 h-4" />
          {isFlipped ? "Ketuk untuk melihat pertanyaan" : "Ketuk untuk membalik"}
        </div>
      </button>

      {/* Feedback & Done */}
      {isFlipped && !isDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <p className="font-sans text-sm text-teal-700 text-center">{activity.successFeedback}</p>
          <button
            type="button"
            onClick={handleDone}
            onKeyDown={handleDoneKeyDown}
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
