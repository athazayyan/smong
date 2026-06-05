"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Map, Sparkles } from "lucide-react";

export function HeroSection() {
  const { scrollY } = useScroll();
  const yScene = useTransform(scrollY, [0, 900], [0, 170]);
  const scaleScene = useTransform(scrollY, [0, 900], [1.08, 1.18]);
  const yText = useTransform(scrollY, [0, 640], [0, 92]);
  const opacityText = useTransform(scrollY, [0, 460], [1, 0]);

  return (
    <section className="relative flex min-h-[94dvh] items-start overflow-hidden bg-cream-50 px-6 pt-28 md:min-h-[900px] md:pt-36 lg:pt-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,232,154,0.5),transparent_30%),linear-gradient(180deg,#FFF8F0_0%,#FBEFE3_72%,#FFF8F0_100%)]" />

      <motion.div
        style={{ y: yScene, scale: scaleScene }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/assets/landing/hero-smong-world-desktop.png"
          alt="Dunia Smong yang aman dan menyenangkan"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-95"
          priority
        />
      </motion.div>

      <div className="absolute inset-0 z-1 bg-[radial-gradient(circle_at_50%_42%,rgba(255,248,240,0.78),rgba(255,248,240,0.42)_34%,rgba(255,248,240,0.18)_60%,rgba(255,248,240,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-2 h-1/2 bg-linear-to-t from-cream-50 via-cream-50/55 to-transparent" />
      <div className="absolute inset-x-0 top-0 z-2 h-48 bg-linear-to-b from-cream-50/75 to-transparent" />
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

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <motion.div
          style={{ opacity: opacityText, y: yText }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/82 px-4 py-1.5 text-xs font-bold text-purple-700 shadow-sm backdrop-blur-md md:bg-lavender-200/80 md:text-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" /> Petualangan Kesiapsiagaan
          </div>

          <h1 className="mb-5 font-heading text-4xl font-bold leading-[1.06] text-purple-900 drop-shadow-[0_3px_0_rgba(255,255,255,0.8)] sm:text-6xl lg:text-7xl">
            Jadi Anak Siaga Lewat <span className="text-purple-600">Misi Seru</span>
          </h1>

          <p className="mb-8 max-w-xl font-sans text-base font-semibold leading-relaxed text-ink-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] md:text-lg">
            Belajar gempa bumi lewat pilihan aman, aktivitas singkat, dan petualangan bersama Smong.
          </p>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/siswa"
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
