import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, ShieldAlert, Target, Zap } from "lucide-react";

interface DailyMissionSectionProps {
  activityId: string;
}

export function DailyMissionSection({ activityId }: DailyMissionSectionProps) {
  void activityId;
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-peach-200/80 bg-linear-to-r from-white via-[#fff1e8] to-yellow-200/35 p-5 shadow-[0_22px_70px_rgba(255,187,138,0.18)] md:p-7">
      <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-yellow-200/60 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-20 w-[74%] -translate-x-1/2 rounded-[50%] bg-white/55 blur-xl" />

      <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-5 md:w-auto">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-coral-500 opacity-30 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.7rem] border-4 border-white bg-linear-to-br from-coral-500 to-yellow-500 text-white shadow-[0_12px_0_rgba(196,58,74,0.2)]">
              <Target className="h-9 w-9" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-mint-100 text-teal-700 shadow-sm">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-coral-600">
              Misi Harianmu
            </h2>
            <h3 className="font-heading text-3xl font-black leading-tight text-ink-900">
              Pilih Aksi Aman Saat Gempa
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-extrabold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-ink-700">
                <Clock3 className="h-3.5 w-3.5 text-coral-500" />
                3 menit
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-ink-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                +50 XP
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-ink-700">
                <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
                Saat bencana
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/siswa/modul/gempa-ketika-terjadi"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral-600 px-8 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_0_#c43a4a] transition hover:-translate-y-0.5 hover:bg-coral-500 active:translate-y-1 active:shadow-[0_3px_0_#c43a4a] md:w-auto"
        >
          Mulai Misi
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
