"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative -mt-10 overflow-hidden bg-purple-900 pb-28 pt-32">
      <div className="absolute inset-x-[-8vw] top-[-5.5rem] z-0 h-28 rounded-[0_0_48%_52%/0_0_100%_100%] bg-cream-50 md:h-36" />
      <div className="absolute left-1/2 top-1/2 z-0 h-72 w-[145vw] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[48%_52%_44%_56%/42%_48%_52%_58%] bg-purple-600 shadow-[0_30px_90px_rgba(47,23,110,0.35)] md:h-96" />
      <div className="absolute left-[-18vw] top-[38%] z-0 h-52 w-[84vw] rotate-[-20deg] rounded-full bg-lavender-200/45 blur-sm" />
      <div className="absolute bottom-[-7rem] right-[-16vw] z-0 h-72 w-[88vw] rotate-[10deg] rounded-full bg-purple-950" />

      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[20%] top-20 h-4 w-4 rotate-45 rounded-sm bg-yellow-200"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-[25%] h-6 w-6 rotate-12 rounded-lg bg-mint-100"
        />
      </div>

      <div className="relative z-20 mx-auto max-w-3xl px-6 pb-14 pt-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-purple-950/35 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-yellow-300" /> Siap Berpetualang?
          </div>

          <h2 className="font-heading text-4xl font-bold text-white drop-shadow-md md:text-6xl">
            Mulai Misi Pertamamu
          </h2>

          <p className="mx-auto mb-4 max-w-md font-sans font-medium leading-relaxed text-lavender-100 md:text-lg">
            Bantu kelasmu jadi lebih siap lewat jalur belajar Gempa Bumi yang seru dan bermakna.
          </p>

          <Link
            href="/dashboard/siswa"
            className="inline-flex items-center gap-3 rounded-full bg-yellow-200 px-10 py-4 font-heading text-lg font-bold text-purple-900 shadow-[0_6px_0_0_#6B4E00] transition-all hover:-translate-y-1 hover:bg-yellow-200/90 active:translate-y-1.5 active:shadow-none"
          >
            Masuk ke Dashboard Siswa <ArrowRight className="h-6 w-6" />
          </Link>

          <p className="mt-4 font-sans text-xs font-medium text-purple-100/70">
            Gratis. Tanpa instalasi. Langsung main.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
