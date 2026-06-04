"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ChecklistActivity } from "@/features/student-learning/types";
import { Check, CheckCircle2, ArrowRight } from "lucide-react";

export interface ChecklistProps {
  activity: ChecklistActivity;
  onComplete: (xp: number) => void;
}

export function Checklist({ activity, onComplete }: ChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const allChecked = checked.size === activity.items.length;

  function toggleItem(id: string) {
    if (submitted) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-heading text-lg font-bold text-ink-900">{activity.prompt}</p>

      {/* Checklist items */}
      <div className="flex flex-col gap-3">
        {activity.items.map((item, i) => {
          const isChecked = checked.has(item.id);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => toggleItem(item.id)}
              disabled={submitted}
              className={cn(
                "flex items-center gap-4 w-full text-left rounded-2xl px-5 py-4 ring-2 transition-colors font-sans text-sm font-semibold",
                isChecked
                  ? "bg-mint-100 ring-teal-500 text-teal-700"
                  : "bg-white ring-lavender-200/60 text-ink-900 hover:ring-purple-500"
              )}
            >
              <motion.div
                animate={{ scale: isChecked ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0",
                  isChecked ? "bg-teal-500 border-teal-500 text-white" : "border-lavender-200"
                )}
              >
                {isChecked && <Check className="w-4 h-4" strokeWidth={3} />}
              </motion.div>
              {item.label}
            </motion.button>
          );
        })}
      </div>

      {/* Progress feedback */}
      <p className="font-sans text-xs text-ink-700 font-medium">
        {checked.size}/{activity.items.length} langkah dicentang
      </p>

      {/* Submit */}
      {!submitted && (
        <Button
          variant="primary"
          size="md"
          onClick={() => setSubmitted(true)}
          disabled={!allChecked}
          className="self-start"
        >
          Selesai Memeriksa
        </Button>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-mint-100 rounded-2xl px-5 py-4 flex flex-col gap-4 border border-teal-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <p className="font-heading text-sm font-bold text-teal-700">Daftar Lengkap!</p>
            </div>
            <p className="font-sans text-sm text-ink-800">{activity.successFeedback}</p>
            <Button variant="secondary" size="md" onClick={() => onComplete(30)} className="self-start gap-2">
              Lanjut <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
