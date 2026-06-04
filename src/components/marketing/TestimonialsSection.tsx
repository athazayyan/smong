"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { clsx } from "clsx";

const TESTIMONIALS = [
  {
    quote: "Sekarang aku tahu harus berlindung dulu saat latihan gempa. Misinya seru.",
    name: "Rina",
    role: "Siswa",
    yOffset: "md:-translate-y-6",
    delay: 0,
  },
  {
    quote: "Anak-anak lebih mudah mengingat langkah aman karena langsung mencoba.",
    name: "Pak Rudi",
    role: "Guru",
    yOffset: "md:translate-y-12",
    delay: 0.15,
  },
  {
    quote: "Lebih seru dari buku teks biasa. Aku dapat badge Penjaga Kepala.",
    name: "Bagas",
    role: "Siswa",
    yOffset: "md:translate-y-2",
    delay: 0.3,
  },
];

export function TestimonialsSection() {
  return (
    <section id="cerita" className="relative -mt-8 overflow-hidden bg-cream-50 py-28">
      <div className="absolute left-1/2 top-10 h-[82%] w-[1160px] max-w-[116vw] -translate-x-1/2 rounded-[45%_55%_50%_50%/18%_18%_82%_82%] bg-sky-100" />
      <div className="pointer-events-none absolute left-10 top-16 h-[300px] w-[400px] rounded-full bg-white/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-10 h-[360px] w-[500px] rounded-full bg-white/40 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="font-heading text-3xl font-bold text-purple-900 drop-shadow-sm md:text-5xl">
              Suara Siaga
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: t.delay, type: "spring", stiffness: 200, damping: 20 }}
              className={clsx("relative", t.yOffset)}
            >
              <div className="relative mx-auto flex min-h-[260px] max-w-sm flex-col justify-center rounded-[42%_58%_54%_46%/28%_28%_72%_72%] bg-white px-10 pb-12 pt-10 text-center shadow-[0_18px_40px_rgba(47,23,110,0.07)]">
                <div className="absolute -bottom-3 left-12 h-8 w-8 rounded-full bg-white shadow-sm" />
                <div className="absolute -bottom-8 left-20 h-5 w-5 rounded-full bg-white shadow-sm" />
                <div className="absolute right-8 top-10 h-3 w-3 rounded-full bg-yellow-200" />
                <Quote className="mx-auto mb-4 h-9 w-9 text-lavender-200" />
                <p className="font-sans text-base font-medium leading-relaxed text-ink-900">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="mt-6 flex flex-col items-center gap-1">
                  <p className="font-heading text-sm font-bold text-purple-900">{t.name}</p>
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-ink-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
