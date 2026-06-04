"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DragAndDropActivity } from "@/features/student-learning/types";
import { CheckCircle2, Circle, ArrowRight, RotateCcw } from "lucide-react";

export interface DragAndDropProps {
  activity: DragAndDropActivity;
  onComplete: (xp: number) => void;
}

export function DragAndDrop({ activity, onComplete }: DragAndDropProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function toggleItem(id: string) {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit() {
    const correctIds = new Set(
      activity.draggableItems.filter((i) => i.belongsInDropZone).map((i) => i.id)
    );
    const correct =
      correctIds.size === selected.size &&
      [...correctIds].every((id) => selected.has(id));
    setIsCorrect(correct);
    setSubmitted(true);
  }

  function handleRetry() {
    setSelected(new Set());
    setSubmitted(false);
    setIsCorrect(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-heading text-lg font-bold text-ink-900">{activity.prompt}</p>

      {/* Item tray */}
      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs font-semibold text-ink-700 uppercase tracking-wide">
          Pilih barang yang masuk ke tas:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {activity.draggableItems.map((item) => {
            const isChosen = selected.has(item.id);
            return (
              <motion.button
                key={item.id}
                whileHover={!submitted ? { scale: 1.03 } : {}}
                whileTap={!submitted ? { scale: 0.97 } : {}}
                onClick={() => toggleItem(item.id)}
                disabled={submitted}
                className={cn(
                  "rounded-2xl px-4 py-3 ring-2 flex items-center gap-3 text-left font-sans text-sm font-semibold transition-colors",
                  isChosen
                    ? "bg-purple-700 ring-purple-900 text-white"
                    : "bg-white ring-lavender-200/60 text-ink-900 hover:ring-purple-500"
                )}
              >
                {isChosen ? <CheckCircle2 className="w-5 h-5 text-white shrink-0" /> : <Circle className="w-5 h-5 text-ink-400 shrink-0" />}
                {item.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Drop zone preview */}
      <div
        className={cn(
          "rounded-2xl border-2 border-dashed px-5 py-4 min-h-[80px] transition-colors",
          selected.size > 0 ? "border-purple-500 bg-lavender-200/30" : "border-lavender-200"
        )}
      >
        <p className="font-sans text-xs text-ink-700 mb-2">{activity.dropZoneLabel}:</p>
        <div className="flex flex-wrap gap-2">
          {[...selected].map((id) => {
            const item = activity.draggableItems.find((i) => i.id === id);
            return item ? (
              <span key={id} className="bg-purple-700 text-white text-xs rounded-full px-3 py-1 font-sans font-semibold">
                {item.label}
              </span>
            ) : null;
          })}
          {selected.size === 0 && (
            <p className="font-sans text-xs text-ink-700/50">Belum ada barang dipilih</p>
          )}
        </div>
      </div>

      {/* Submit */}
      {!submitted && (
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={selected.size === 0}
          className="self-start"
        >
          Cek Tas Siaga
        </Button>
      )}

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {submitted && isCorrect && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-mint-100 rounded-2xl px-5 py-4 flex flex-col gap-4 border border-teal-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <p className="font-heading text-sm font-bold text-teal-700">Tas Siaga Siap!</p>
            </div>
            <p className="font-sans text-sm text-ink-800">{activity.successFeedback}</p>
            <Button variant="secondary" size="md" onClick={() => onComplete(25)} className="self-start gap-2">
              Lanjut <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
        {submitted && !isCorrect && (
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
            <p className="font-sans text-sm text-ink-800">{activity.retryFeedback}</p>
            <Button variant="ghost" size="sm" onClick={handleRetry} className="self-start px-0 text-coral-700 hover:bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" /> Ulangi Pilihan
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
