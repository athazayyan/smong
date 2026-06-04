"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityRenderer } from "@/features/student-learning/components/ActivityRenderer";
import { MascotGuide } from "@/components/ui/MascotGuide";
import { lessonNodes, mockActivities } from "@/features/student-learning/data/mockData";
import { LessonNode, Activity } from "@/features/student-learning/types";

type Screen = "intro" | "activity" | "reward";

interface RewardScreenProps {
  xpEarned: number;
  node: LessonNode;
}

function RewardScreen({ xpEarned, node }: RewardScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 text-center py-10"
    >
      <motion.span
        animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-6xl"
      >
        🎉
      </motion.span>
      <div>
        <h2 className="font-heading text-2xl font-bold text-purple-900 mb-2">
          Misi Selesai!
        </h2>
        <p className="font-sans text-ink-700 text-sm">
          {`Kamu berhasil menyelesaikan "${node.title}".`}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-yellow-200 rounded-2xl px-5 py-3 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div className="text-left">
            <p className="font-heading text-xs text-ink-700">XP Diperoleh</p>
            <p className="font-heading text-xl font-bold text-purple-900">+{xpEarned} XP</p>
          </div>
        </div>
        <div className="bg-mint-100 rounded-2xl px-5 py-3 flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div className="text-left">
            <p className="font-heading text-xs text-ink-700">Bintang</p>
            <p className="font-heading text-xl font-bold text-teal-500">+1</p>
          </div>
        </div>
      </div>
      {node.reward.type === "badge" && node.reward.badgeId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-lavender-200/50 ring-2 ring-lavender-200 rounded-3xl px-6 py-4 flex flex-col items-center gap-2"
        >
          <span className="text-4xl">🏅</span>
          <p className="font-heading text-sm font-bold text-purple-900">Badge Baru Terbuka!</p>
          <p className="font-sans text-xs text-ink-700">{node.reward.label}</p>
        </motion.div>
      )}
      <Link
        href="/dashboard/siswa"
        className="inline-flex items-center gap-2 bg-purple-700 text-white font-heading font-bold text-base px-8 py-4 rounded-2xl shadow-[0_5px_0_0_#2F176E] hover:bg-purple-500 transition-colors active:shadow-none active:translate-y-1 mt-2"
      >
        Kembali ke Jalur →
      </Link>
    </motion.div>
  );
}

interface LessonClientProps {
  node: LessonNode;
  activity: Activity;
}

export function LessonClient({ node, activity }: LessonClientProps) {
  const [screen, setScreen] = useState<Screen>("intro");
  const [xpEarned, setXpEarned] = useState(0);

  function handleActivityComplete(xp: number) {
    setXpEarned(xp);
    setScreen("reward");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/dashboard/siswa"
        className="inline-flex items-center gap-1 font-sans text-sm text-ink-700 hover:text-purple-700 transition-colors mb-6"
      >
        ← Jalur Gempa
      </Link>

      <AnimatePresence mode="wait">
        {screen === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col gap-6"
          >
            {/* Phase badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-700 bg-lavender-200/60 rounded-full px-3 py-1 font-sans">
                {node.phaseId === "pra-bencana" ? "🏫 Pra-Bencana" : node.phaseId === "saat-bencana" ? "🛡️ Saat Bencana" : "🤝 Pascabencana"}
              </span>
            </div>

            <div>
              <h1 className="font-heading text-3xl font-bold text-purple-900 mb-2">{node.title}</h1>
              <p className="font-sans text-ink-700">{node.shortDescription}</p>
            </div>

            {/* Reward preview */}
            <div className="flex items-center gap-3 bg-yellow-200/40 rounded-2xl px-5 py-3">
              <span className="text-xl">⚡</span>
              <p className="font-sans text-sm text-ink-900">
                Selesaikan misi ini dan dapatkan{" "}
                <span className="font-bold text-purple-700">{node.reward.label}</span>
              </p>
            </div>

            {/* Mascot */}
            <MascotGuide
              message={`Siap? Ayo mulai misi "${node.title}". Kamu pasti bisa!`}
              mood="guide"
              size="md"
            />

            <button
              onClick={() => setScreen("activity")}
              className="inline-flex items-center gap-2 bg-purple-700 text-white font-heading font-bold text-base px-8 py-4 rounded-2xl shadow-[0_5px_0_0_#2F176E] hover:bg-purple-500 transition-colors active:shadow-none active:translate-y-1 self-start"
            >
              🚀 Mulai Misi
            </button>
          </motion.div>
        )}

        {screen === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-purple-900">{node.title}</h2>
              <span className="font-sans text-xs text-ink-700 bg-lavender-200/50 rounded-full px-3 py-1">
                {activity.type === "visual-quiz" ? "Kuis Visual" : activity.type === "decision-simulation" ? "Simulasi Keputusan" : activity.type === "drag-and-drop" ? "Susun Barang" : activity.type === "checklist" ? "Daftar Periksa" : "Refleksi"}
              </span>
            </div>
            <ActivityRenderer activity={activity} onComplete={handleActivityComplete} />
          </motion.div>
        )}

        {screen === "reward" && (
          <motion.div
            key="reward"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RewardScreen xpEarned={xpEarned} node={node} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
