"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ReflectionChoiceActivity } from "@/features/student-learning/types";
import { HeartHandshake, Star, Trophy } from "lucide-react";

export interface ReflectionChoiceProps {
  activity: ReflectionChoiceActivity;
  onComplete: (xp: number) => void;
}

export function ReflectionChoice({ activity, onComplete }: ReflectionChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleSelect(id: string) {
    if (confirmed) return;
    setSelected(id);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Warm framing */}
      <div className="bg-peach-200/50 rounded-2xl px-5 py-4 flex items-start gap-4 border border-peach-200">
        <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center shrink-0">
          <HeartHandshake className="w-5 h-5 text-coral-600" />
        </div>
        <p className="font-sans text-sm text-ink-900 leading-relaxed font-medium mt-1">
          {activity.prompt}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        <p className="font-heading text-xs font-semibold text-ink-700 uppercase tracking-wide">
          Pilih yang terasa paling tepat:
        </p>
        {activity.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileHover={!confirmed ? { scale: 1.02 } : {}}
              whileTap={!confirmed ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(opt.id)}
              disabled={confirmed}
              className={`w-full text-left rounded-2xl px-5 py-4 ring-2 font-sans text-sm leading-relaxed transition-colors ${
                isSelected
                  ? "bg-purple-700 ring-purple-900 text-white font-semibold"
                  : "bg-white ring-lavender-200/60 text-ink-900 hover:ring-purple-500"
              }`}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>

      {/* Confirm */}
      {!confirmed && selected && (
        <Button
          variant="primary"
          size="md"
          onClick={() => setConfirmed(true)}
          className="self-start"
        >
          Pilih Ini
        </Button>
      )}

      {/* Feedback — all choices are "right" in reflection */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-peach-200/60 rounded-2xl px-5 py-4 flex flex-col gap-4 border border-peach-300/50"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600 fill-yellow-500" />
              <p className="font-heading text-sm font-bold text-ink-900">
                Terima kasih sudah berbagi!
              </p>
            </div>
            <p className="font-sans text-sm text-ink-800">{activity.successFeedback}</p>
            <Button variant="reward" size="md" onClick={() => onComplete(20)} className="self-start gap-2">
              Selesaikan Misi <Trophy className="w-4 h-4 text-ink-900" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
