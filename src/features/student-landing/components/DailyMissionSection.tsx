import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, ShieldAlert, Target, Zap } from "lucide-react";

interface DailyMissionSectionProps {
  activityId: string;
}

export function DailyMissionSection({ activityId }: DailyMissionSectionProps) {
  void activityId;
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/70 p-5 shadow-[0_14px_42px_rgba(47,23,110,0.06)] md:p-6">
      <div className="pointer-events-none absolute -right-16 top-2 h-36 w-[42%] smong-river bg-yellow-200/28" />

      <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-5 md:w-auto">
          <div className="relative">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.25rem] border-4 border-white bg-purple-900 text-white shadow-sm md:h-[4.5rem] md:w-[4.5rem]">
              <Target className="h-9 w-9" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow-200 text-yellow-800 shadow-sm">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-purple-700">
              Misi Harianmu
            </h2>
            <h3 className="font-heading text-3xl font-black leading-tight text-ink-900">
              Pilih Aksi Aman Saat Gempa
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-extrabold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-ink-700">
                <Clock3 className="h-3.5 w-3.5 text-purple-600" />
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
          className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-900 px-8 py-4 font-heading text-base font-extrabold text-white shadow-[0_7px_0_#20104f] transition hover:-translate-y-0.5 hover:bg-purple-700 active:translate-y-1 active:shadow-[0_3px_0_#20104f] md:w-auto"
        >
          Mulai Misi
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
