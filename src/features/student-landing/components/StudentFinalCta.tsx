import Link from "next/link";
import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function StudentFinalCta() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-purple-900 px-6 py-20 text-center text-white shadow-[0_28px_70px_rgba(47,23,110,0.16)]">
      <div className="pointer-events-none absolute inset-x-8 top-16 h-12 smong-thread opacity-25" />
      <div className="pointer-events-none absolute left-[12%] top-[18%] h-48 w-[76%] smong-river bg-white/8" />
      <div className="pointer-events-none absolute bottom-[8%] right-[8%] h-36 w-[48%] smong-veil bg-white/7" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-yellow-200 backdrop-blur">
          <Sparkles className="h-4 w-4" />
          Siap lanjut?
        </p>
        <h2 className="font-heading text-4xl font-black leading-tight md:text-6xl">Siap Melanjutkan Misi?</h2>
        <p className="mx-auto mt-4 max-w-lg text-base font-semibold leading-8 text-lavender-100 md:text-lg">
          Setiap langkah yang kamu pelajari membuatmu semakin siap dan aman.
        </p>
        <Link
          href="/siswa/modul"
          className="group mx-auto mt-8 flex w-fit items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-heading text-base font-extrabold text-purple-900 shadow-[0_8px_0_rgba(255,255,255,0.24)] transition hover:-translate-y-0.5 active:translate-y-1"
        >
          Mulai Belajar Sekarang
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
