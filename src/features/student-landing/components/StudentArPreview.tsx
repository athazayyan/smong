import React from "react";
import Link from "next/link";
import { Scan, ShieldCheck, Sparkles } from "lucide-react";

export function StudentArPreview() {
  return (
    <section className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-purple-900 via-[#202852] to-teal-700 p-6 shadow-[0_30px_80px_rgba(47,23,110,0.2)] md:p-10">
      <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-mint-100/25 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-purple-500/35 blur-3xl" />
      <div className="absolute left-[16%] top-[18%] h-24 w-24 rounded-full bg-yellow-200/10 blur-2xl" />

      <div className="relative z-10 grid items-center gap-10 md:grid-cols-[1fr_360px]">
        <div className="text-center text-white md:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-extrabold text-mint-100">
            <Sparkles className="h-4 w-4" />
            Bonus Safety Lens
          </div>

          <h2 className="font-heading text-4xl font-black leading-tight md:text-5xl">
            AR Safety Lens
          </h2>

          <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-lavender-100 md:text-lg">
            Latihan kamera simulasi untuk mengenali benda, pintu, dan area yang perlu diperhatikan di sekitar sekolah.
          </p>

          <Link
            href="/siswa/ar"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-teal-500 px-7 py-4 font-heading text-base font-extrabold text-purple-900 shadow-[0_8px_0_#157761] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_4px_0_#157761]"
          >
            <ShieldCheck className="h-5 w-5" />
            Coba Safety Lens
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-white/8 blur-xl" />
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.7rem] border border-teal-100/25 bg-linear-to-br from-white/10 to-purple-900/25">
              <div className="absolute inset-6 rounded-[1.4rem] border border-white/10" />
              <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-teal-500" />
              <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-teal-500" />
              <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-teal-500" />
              <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-teal-500" />

              <div className="absolute left-[18%] top-[26%] rounded-full border border-teal-300/50 bg-teal-500/20 px-3 py-1.5 text-xs font-black text-mint-100">
                Pintu aman
              </div>
              <div className="absolute bottom-[23%] right-[13%] rounded-full border border-yellow-200/50 bg-yellow-200/20 px-3 py-1.5 text-xs font-black text-yellow-200">
                Tas siaga
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/8">
                <Scan className="h-9 w-9 text-white/60" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-extrabold text-white">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-300" />
                Mode simulasi
              </span>
              <span className="text-teal-200">Siap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
