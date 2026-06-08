"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import type { ArSafetyLensActivity as ArSafetyLensActivityData } from "@/features/student-learning/types";
import { ArSafetyLensActivity } from "./ArSafetyLensActivity";

interface StandaloneArSafetyLensPageProps {
  activity: ArSafetyLensActivityData;
}

export function StandaloneArSafetyLensPage({ activity }: StandaloneArSafetyLensPageProps) {
  const [earnedXp, setEarnedXp] = useState<number | undefined>(undefined);

  if (earnedXp !== undefined) {
    return (
      <main className="min-h-screen bg-cream-50 px-4 pb-28 pt-8 text-ink-900 md:pb-16">
        <section className="mx-auto flex min-h-[68svh] max-w-2xl flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-yellow-200 text-yellow-900 shadow-sm">
            <Trophy className="h-10 w-10" />
          </div>
          <p className="mb-3 inline-flex rounded-full bg-lavender-100 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
            Safety Lens selesai
          </p>
          <h1 className="font-heading text-4xl font-black leading-tight text-ink-900 md:text-6xl">
            Peringatan Terbaca
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-ink-700">
            Kamu berhasil menandai risiko sekitar lewat WebAR Warning Lens. Saat keadaan nyata, tetap ikuti jalur evakuasi resmi sekolah dan arahan guru.
          </p>
          <p className="mt-5 font-heading text-2xl font-black text-yellow-700">+{earnedXp} XP</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 font-heading text-sm font-black text-purple-700 shadow-sm transition hover:bg-lavender-100"
              onClick={() => setEarnedXp(undefined)}
            >
              Ulangi Safety Lens
            </button>
            <Link
              href="/siswa/modul"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-purple-900 px-6 py-3 font-heading text-sm font-black text-white shadow-[0_6px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_3px_0_#20104f]"
            >
              Lanjut ke Modul
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <ArSafetyLensActivity
      activity={activity}
      backHref="/siswa"
      onComplete={(xp) => setEarnedXp(xp)}
    />
  );
}
