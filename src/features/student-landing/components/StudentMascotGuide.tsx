"use client";

import Image from "next/image";
import React from "react";
import { MessageCircle, Route, ShieldCheck } from "lucide-react";
import { studentMascotAsset } from "../data/visual-config";

export function StudentMascotGuide() {
  return (
    <section className="relative w-full">
      <div className="mx-auto grid max-w-5xl items-center gap-4 rounded-[2rem] border border-purple-700/8 bg-white/64 p-5 shadow-sm backdrop-blur md:grid-cols-[200px_1fr] md:p-6">
        <div className="relative mx-auto h-36 w-36 md:h-48 md:w-48">
          <Image
            src={studentMascotAsset.src}
            alt={studentMascotAsset.alt}
            width={studentMascotAsset.width}
            height={studentMascotAsset.height}
            sizes={studentMascotAsset.sizes}
            className="h-full w-full object-contain drop-shadow-[0_24px_34px_rgba(91,59,181,0.18)]"
          />
        </div>

        <div className="relative rounded-[1.6rem] border border-lavender-200/60 bg-white/82 p-5 shadow-sm">
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
