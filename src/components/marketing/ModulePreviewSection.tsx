"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Backpack,
  CheckCircle2,
  HeartHandshake,
  Route,
  School,
  Shield,
} from "lucide-react";
import { clsx } from "clsx";

type PathNodeStatus = "completed" | "active" | "locked";

type PathNode = {
  id: string;
  label: string;
  status: PathNodeStatus;
  phase: string;
  desktopPosition: string;
  labelPosition: "right" | "left" | "top" | "bottom";
  icon: LucideIcon;
};

const PATH_NODES = [
  {
    id: "kenali",
    label: "Kenali Gempa",
    status: "completed",
    phase: "Pra-Bencana",
    desktopPosition: "left-[8%] top-[46%]",
    labelPosition: "right",
    icon: CheckCircle2,
  },
  {
    id: "tas",
    label: "Tas Siaga",
    status: "completed",
    phase: "Pra-Bencana",
    desktopPosition: "left-[27%] top-[20%]",
    labelPosition: "right",
    icon: Backpack,
  },
  {
    id: "lindung",
    label: "Berlindung Dulu",
    status: "active",
    phase: "Saat Bencana",
    desktopPosition: "left-[46%] top-[56%]",
    labelPosition: "bottom",
    icon: Shield,
  },
  {
    id: "evakuasi",
    label: "Jalur Evakuasi",
    status: "locked",
    phase: "Saat Bencana",
    desktopPosition: "right-[17%] top-[26%]",
    labelPosition: "right",
    icon: Route,
  },
  {
    id: "pulih",
    label: "Gotong Royong",
    status: "locked",
    phase: "Pascabencana",
    desktopPosition: "right-[8%] top-[62%]",
    labelPosition: "top",
    icon: HeartHandshake,
  },
] satisfies PathNode[];

function nodeClasses(status: PathNodeStatus) {
  if (status === "completed") {
    return "bg-teal-500 border-white text-white";
  }

  if (status === "active") {
    return "bg-purple-700 border-yellow-200 text-white scale-110";
  }

  return "bg-lavender-200 border-white text-ink-400";
}

export function ModulePreviewSection() {
  return (
    <section id="modul" className="relative -mt-8 overflow-hidden bg-cream-50 px-6 py-24">
      <div className="absolute left-1/2 top-4 h-[86%] w-[1200px] max-w-[118vw] -translate-x-1/2 rounded-[42%_58%_50%_50%/12%_16%_84%_88%] bg-sky-100" />
      <div className="absolute left-[-12vw] top-28 h-48 w-72 rounded-full bg-lavender-200/55 blur-3xl" />
      <div className="absolute right-[-10vw] bottom-16 h-56 w-80 rounded-full bg-mint-100/70 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl pt-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/50 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-700 shadow-sm backdrop-blur-sm">
            <School className="h-4 w-4" /> Modul Gempa Bumi
          </span>
          <h2 className="mb-5 font-heading text-3xl font-bold text-purple-900 drop-shadow-sm md:text-5xl">
            Jalur Belajar Petualangan
          </h2>
          <p className="mx-auto max-w-xl rounded-3xl bg-white/55 p-4 font-sans font-medium text-ink-700 backdrop-blur-sm md:text-lg">
            Siswa belajar melewati jalur seru, membuka checkpoint, dan mengumpulkan badge.
          </p>
        </motion.div>

        <div className="relative mx-auto mb-14 hidden min-h-[620px] max-w-5xl md:block">
          <div className="absolute inset-8 rounded-[44%_56%_53%_47%/20%_28%_72%_80%] bg-white/45 shadow-[inset_0_0_70px_rgba(124,91,219,0.12)]" />
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 900 560" fill="none" aria-hidden="true">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              d="M80 335 C160 185 270 190 335 292 C400 392 510 390 560 250 C622 88 760 150 820 286"
              fill="none"
              stroke="#7C5BDB"
              strokeWidth="26"
              strokeLinecap="round"
              className="drop-shadow-sm"
              opacity="0.42"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.8, ease: "easeInOut", delay: 0.08 }}
              d="M80 335 C160 185 270 190 335 292 C400 392 510 390 560 250 C622 88 760 150 820 286"
              fill="none"
              stroke="#5B3BB5"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="18 18"
            />
          </svg>

          {PATH_NODES.map((node, i) => {
            const Icon = node.icon;
            const isActive = node.status === "active";
            const isLocked = node.status === "locked";

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 1, scale: 0.94, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 240, damping: 20 }}
                className={clsx(
                  "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-4",
                  node.labelPosition === "left" && "flex-row-reverse",
                  node.labelPosition === "top" && "flex-col-reverse",
                  node.labelPosition === "bottom" && "flex-col",
                  node.desktopPosition,
                )}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.45, 1], opacity: [0.45, 0, 0.45] }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-yellow-200 blur-md"
                    />
                  )}
                  <div className={clsx("relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-lg", nodeClasses(node.status))}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <div className={clsx("relative z-20 w-48 rounded-3xl border-2 bg-white/94 px-5 py-4 shadow-sm backdrop-blur-md", isActive ? "border-purple-500 shadow-[0_16px_32px_rgba(91,59,181,0.16)]" : "border-white")}>
                  <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-widest text-purple-600">
                    {node.phase}
                  </p>
                  <p className={clsx("font-heading text-lg font-bold leading-tight", isLocked ? "text-ink-400" : "text-ink-900")}>
                    {node.label}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-16 right-[24%] max-w-xs rounded-[2rem] bg-white/90 px-5 py-4 text-sm font-semibold text-ink-700 shadow-sm"
          >
            Buka checkpoint untuk lanjut ke misi berikutnya.
          </motion.div>
        </div>

        <div className="relative mx-auto mb-12 flex max-w-md flex-col gap-8 rounded-[3rem] bg-white/45 p-6 md:hidden">
          <div className="absolute bottom-12 left-14 top-12 w-2 rounded-full bg-purple-500/30" />
          {PATH_NODES.map((node, i) => {
            const Icon = node.icon;
            const isActive = node.status === "active";
            const isLocked = node.status === "locked";

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex items-center gap-4"
              >
                <div className={clsx("flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 shadow-md", nodeClasses(node.status))}>
                  <Icon className="h-7 w-7" />
                </div>
                <div className={clsx("flex-1 rounded-3xl bg-white/95 px-5 py-4 shadow-sm", isActive ? "ring-2 ring-purple-500" : "")}>
                  <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-widest text-purple-600">{node.phase}</p>
                  <p className={clsx("font-heading text-base font-bold", isLocked ? "text-ink-400" : "text-ink-900")}>{node.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-20 text-center"
        >
          <Link
            href="/dashboard/siswa"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-700 px-10 py-4 font-heading text-base font-bold text-white shadow-[0_6px_0_0_#2F176E] transition-all hover:-translate-y-1 hover:bg-purple-500 active:translate-y-1.5 active:shadow-none"
          >
            Mulai Belajar Sekarang <ArrowRight className="ml-1 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
