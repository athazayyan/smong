"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Map, Sparkles } from "lucide-react";

export function HeroSection() {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 150]);
  const opacityText = useTransform(scrollY, [0, 340], [1, 0]);

  return (
    <section className="relative flex min-h-[92dvh] items-start overflow-hidden bg-cream-50 pt-28 md:min-h-[860px] md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,232,154,0.55),transparent_26%),linear-gradient(180deg,#FFF8F0_0%,#FBEFE3_62%,#FFF8F0_100%)]" />
      <div className="absolute -left-24 bottom-8 h-56 w-[58vw] rounded-[55%_45%_42%_58%/58%_48%_52%_42%] bg-lavender-200/65 blur-[2px]" />
      <div className="absolute right-[-12vw] bottom-10 h-72 w-[72vw] rounded-[48%_52%_40%_60%/55%_42%_58%_45%] bg-purple-500/15 blur-[1px]" />

      <motion.div
        style={{ y: yBg }}
        className="absolute right-[-18vw] top-24 z-0 h-[min(96vw,760px)] w-[min(96vw,760px)] sm:right-[-10vw] md:right-[-4vw] md:top-8 md:h-[780px] md:w-[780px]"
      >
        <Image
          src="/assets/landing/hero-smong-world-desktop.png"
          alt="Dunia Smong yang aman dan menyenangkan"
          fill
          sizes="(max-width: 640px) 96vw, (max-width: 1024px) 760px, 780px"
          className="object-contain object-center opacity-95"
          priority
        />
      </motion.div>

      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-cream-50 via-cream-50/86 to-cream-50/10" />
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <motion.div
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-14 -left-20 h-44 w-[520px] rounded-full bg-white/70 blur-2xl"
        />
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-24 -right-10 h-72 w-[620px] rounded-full bg-cream-100/80 blur-3xl"
        />
        <div className="absolute -bottom-20 left-1/2 h-40 w-[120vw] -translate-x-1/2 rounded-[50%_50%_0_0/100%_100%_0_0] bg-cream-50" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <motion.div
          style={{ opacity: opacityText }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl md:mt-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-xs font-bold text-purple-700 shadow-sm backdrop-blur-md md:bg-lavender-200/80 md:text-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" /> Petualangan Kesiapsiagaan
          </div>

          <h1 className="mb-5 font-heading text-4xl font-bold leading-[1.1] text-purple-900 drop-shadow-sm sm:text-5xl lg:text-6xl">
            Jadi Anak Siaga Lewat <span className="text-purple-600">Misi Seru</span>
          </h1>

          <p className="mb-8 max-w-md font-sans text-base font-medium leading-relaxed text-ink-900 md:text-lg md:text-ink-700">
            Belajar gempa bumi lewat pilihan aman, aktivitas singkat, dan petualangan bersama Smong.
          </p>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <Link
              href="/dashboard/siswa"
              className="flex items-center justify-center gap-2 rounded-full bg-purple-700 px-8 py-3.5 font-heading text-base font-bold text-white shadow-[0_6px_0_0_#2F176E] transition-all hover:-translate-y-1 hover:bg-purple-500 active:translate-y-1.5 active:shadow-none"
            >
              Mulai Misi Gempa <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#modul"
              className="flex items-center justify-center gap-2 rounded-full bg-white/85 px-8 py-3.5 font-heading text-base font-bold text-purple-900 shadow-[0_6px_0_0_#DDD2FF] backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white active:translate-y-1.5 active:shadow-none"
            >
              Lihat Jalur Belajar <Map className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
