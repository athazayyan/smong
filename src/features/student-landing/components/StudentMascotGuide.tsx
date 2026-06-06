"use client";

import Image from "next/image";
import React from "react";
import { MessageCircle, Route, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { studentMascotAsset } from "../data/visual-config";

export function StudentMascotGuide() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full">
      <div className="absolute left-1/2 top-8 -z-10 h-44 w-[84%] -translate-x-1/2 rounded-[50%] bg-sky-100/55 blur-2xl" />
      <div className="mx-auto grid max-w-5xl items-center gap-4 rounded-[3rem] border border-white/70 bg-linear-to-br from-white/88 via-cream-50 to-mint-100/50 p-5 shadow-[0_24px_70px_rgba(47,23,110,0.1)] backdrop-blur md:grid-cols-[220px_1fr] md:p-7">
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto h-40 w-40 md:h-52 md:w-52"
        >
          <Image
            src={studentMascotAsset.src}
            alt={studentMascotAsset.alt}
            width={studentMascotAsset.width}
            height={studentMascotAsset.height}
            sizes={studentMascotAsset.sizes}
            className="h-full w-full object-contain drop-shadow-[0_24px_34px_rgba(91,59,181,0.18)]"
          />
        </motion.div>

        <div className="relative rounded-[2rem] border border-lavender-200/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(47,23,110,0.08)]">
          <div className="absolute top-1/2 -left-3 hidden h-6 w-6 -translate-y-1/2 rotate-45 border-b border-l border-lavender-200/70 bg-white md:block" />
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-l border-t border-lavender-200/70 bg-white md:hidden" />

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lavender-100 text-purple-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-xl font-black text-ink-900">Smong menunggu di jalur berikutnya</p>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-ink-700">
                Mulai dari misi kecil: cek tas siaga, pilih aksi aman, lalu buka checkpoint baru. Belajarnya singkat, tapi setiap langkah punya arti.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3 py-2 text-xs font-extrabold text-teal-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Aman untuk belajar
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-200/70 px-3 py-2 text-xs font-extrabold text-yellow-800">
                  <Route className="h-3.5 w-3.5" />
                  Jalur misi aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
