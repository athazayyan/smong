"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-cream-50 via-cream-100 to-lavender-200/30 pt-16">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-24 w-[480px] h-[480px] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[240px] rounded-full bg-yellow-200/30 blur-2xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: text */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {/* Badge pill */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 bg-lavender-200/60 rounded-full px-4 py-1.5">
              <span>✨</span> Platform Belajar Mitigasi Bencana
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-purple-900 leading-tight"
          >
            Belajar Hari Ini,{" "}
            <span className="text-purple-500 relative">
              Siaga Esok Hari
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6 C40 2, 80 7, 120 4 C160 1, 185 6, 198 4"
                  stroke="#7C5BDB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            className="font-sans text-lg text-ink-700 max-w-md leading-relaxed"
          >
            Jadilah anak siaga lewat misi seru, pilihan cerdas, dan petualangan belajar yang tidak biasa. Gempa bumi bukan untuk ditakuti, tapi dihadapi dengan siap!
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/siswa"
              className="inline-flex items-center gap-2 bg-purple-700 text-white font-heading font-bold text-base px-7 py-3.5 rounded-2xl shadow-[0_5px_0_0_#2F176E] hover:bg-purple-500 transition-colors active:shadow-none active:translate-y-1"
            >
              <span>🚀</span> Mulai Misi Gempa
            </Link>
            <Link
              href="#modul"
              className="inline-flex items-center gap-2 text-purple-700 font-heading font-bold text-base px-6 py-3.5 rounded-2xl border-2 border-lavender-200 hover:border-purple-500 hover:bg-lavender-200/30 transition-colors"
            >
              Lihat Modul <span>→</span>
            </Link>
          </motion.div>

          {/* Social proof stats */}
          <motion.div variants={fadeUp} className="flex items-center gap-6 pt-2">
            {[
              { label: "Modul", value: "3 Fase" },
              { label: "Aktivitas", value: "5 Misi" },
              { label: "Untuk", value: "SD–SMP" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-xl font-bold text-purple-700">{stat.value}</p>
                <p className="font-sans text-xs text-ink-700">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: hero illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative flex justify-center"
        >
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[400px] h-[400px] rounded-full bg-lavender-200/40 blur-xl" />
          </div>

          <div className="relative z-10 w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(47,23,110,0.15)] border-4 border-white">
            <Image
              src="/assets/hero/hero-smong-earthquake.png"
              alt="Anak-anak belajar kesiapsiagaan gempa bumi bersama maskot Smong"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-2 lg:right-4 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-yellow-200 flex items-center gap-2"
          >
            <span className="text-xl">⭐</span>
            <div>
              <p className="font-heading text-xs font-bold text-ink-900">Badge Baru!</p>
              <p className="font-sans text-xs text-ink-700">Siaga Pemula</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute -bottom-4 -left-2 lg:left-4 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-teal-500/30 flex items-center gap-2"
          >
            <span className="text-xl">🎯</span>
            <div>
              <p className="font-heading text-xs font-bold text-ink-900">+20 XP</p>
              <p className="font-sans text-xs text-teal-500">Misi Selesai!</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-xs text-ink-700 font-sans">Scroll untuk lihat lebih</p>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-purple-500 text-lg"
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
