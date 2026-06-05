"use client";

import { motion, Variants } from "framer-motion";
import { Shield, Sparkles, Navigation } from "lucide-react";
import { clsx } from "clsx";

const PROMISES = [
  {
    icon: Shield,
    title: "Pilih Aksi Aman",
    desc: "Bukan hafalan teori. Kamu akan terjun ke skenario kelas dan rumah, lalu memilih tindakan yang paling tepat untuk menyelamatkan diri.",
    color: "bg-mint-100",
    ring: "ring-teal-500/20",
    iconColor: "text-teal-700",
    iconBg: "bg-teal-100",
    offset: "md:mt-0",
  },
  {
    icon: Sparkles,
    title: "Kumpulkan Badge Siaga",
    desc: "Selesaikan setiap misi untuk mendapatkan XP, bintang, dan badge spesial yang membuktikan kemampuanmu sebagai pahlawan evakuasi.",
    color: "bg-yellow-200/40",
    ring: "ring-yellow-500/20",
    iconColor: "text-yellow-700",
    iconBg: "bg-yellow-100",
    offset: "md:mt-12",
  },
  {
    icon: Navigation,
    title: "Belajar Tanpa Takut",
    desc: "Topik serius dibahas dengan gambar dan animasi yang ramah, aman, serta fokus pada kesiapsiagaan, bukan ketakutan.",
    color: "bg-lavender-200/50",
    ring: "ring-purple-500/20",
    iconColor: "text-purple-700",
    iconBg: "bg-white",
    offset: "md:mt-6",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

export function FeaturesSection() {
  return (
    <section id="misi" className="py-24 bg-cream-50 relative overflow-hidden">
      {/* Organic Top Divider */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-cream-50 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-700 mb-4">
            Janji Petualangan
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-purple-900 mb-5 max-w-2xl mx-auto leading-tight drop-shadow-sm">
            Cara Baru Mengenal <br /> Kesiapsiagaan Bencana
          </h2>
        </motion.div>

        {/* 3 Panels */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10"
        >
          {PROMISES.map((promise) => {
            const Icon = promise.icon;
            return (
              <motion.div
                key={promise.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={clsx(
                  "relative rounded-[2rem] p-8 ring-2 transition-all duration-300 shadow-[0_8px_24px_rgba(47,23,110,0.04)]",
                  promise.color,
                  promise.ring,
                  promise.offset
                )}
              >
                {/* Decorative sticker pin */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-lavender-200/50">
                  <div className="w-2 h-2 rounded-full bg-purple-200" />
                </div>

                <div
                  className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
                    promise.iconBg
                  )}
                >
                  <Icon className={clsx("w-7 h-7", promise.iconColor)} />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink-900 mb-3">{promise.title}</h3>
                <p className="font-sans text-base text-ink-700 leading-relaxed font-medium">
                  {promise.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
