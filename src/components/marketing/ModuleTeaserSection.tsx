"use client";

import { motion } from "framer-motion";
import { Cloud, ShieldCheck, HeartHandshake } from "lucide-react";
import { clsx } from "clsx";

const ZONES = [
  {
    phase: "Fase 1",
    title: "Pra-Bencana",
    desc: "Persiapan sebelum bumi berguncang.",
    icon: Cloud,
    color: "bg-lavender-200/50",
    iconColor: "text-purple-700",
  },
  {
    phase: "Fase 2",
    title: "Saat Bencana",
    desc: "Aksi cepat dan aman saat terjadi gempa.",
    icon: ShieldCheck,
    color: "bg-mint-100",
    iconColor: "text-teal-700",
  },
  {
    phase: "Fase 3",
    title: "Pascabencana",
    desc: "Pemulihan dan saling menjaga setelahnya.",
    icon: HeartHandshake,
    color: "bg-peach-200/50",
    iconColor: "text-coral-700",
  },
];

export function ModuleTeaserSection() {
  return (
    <section className="py-24 bg-cream-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-purple-900 mb-4 drop-shadow-sm">
              Tiga Zona Cerita
            </h2>
            <p className="font-sans text-ink-700 md:text-lg max-w-xl mx-auto font-medium">
              Jelajahi dunia Smong dan pelajari setiap langkah dengan aman.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector Line behind circles */}
          <div className="hidden md:block absolute top-1/2 left-20 right-20 h-2 bg-lavender-200/50 -translate-y-1/2 z-0 rounded-full" />

          {ZONES.map((zone, i) => {
            const Icon = zone.icon;
            return (
              <motion.div
                key={zone.title}
                initial={{ opacity: 1, y: 12, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Cloud Window */}
                <div
                  className={clsx(
                    "w-48 h-48 rounded-full mb-6 flex items-center justify-center border-8 border-white shadow-[0_8px_30px_rgba(47,23,110,0.06)] relative",
                    zone.color
                  )}
                >
                  {/* Decorative internal blob */}
                  <div className="absolute inset-4 bg-white/40 rounded-full blur-md" />
                  <Icon className={clsx("w-16 h-16 relative z-10", zone.iconColor)} />
                </div>
                
                <span className="font-heading text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
                  {zone.phase}
                </span>
                <h3 className="font-heading text-2xl font-bold text-purple-900 mb-2">
                  {zone.title}
                </h3>
                <p className="font-sans text-ink-700 max-w-[200px] leading-relaxed text-sm">
                  {zone.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
