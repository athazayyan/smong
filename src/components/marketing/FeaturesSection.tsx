"use client";

import { motion } from "framer-motion";
import { Map, Gamepad2, Medal, ShieldCheck, MapPin, LineChart } from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Jalur Belajar Petualangan",
    desc: "Ikuti jalur seperti peta misi. Setiap titik adalah pelajaran baru tentang gempa bumi.",
    color: "bg-lavender-200/60",
    ring: "ring-purple-500/20",
    iconColor: "text-purple-700"
  },
  {
    icon: Gamepad2,
    title: "Aktivitas Interaktif",
    desc: "Pilih aksi aman, seret barang ke tas siaga, atau refleksi bersama teman.",
    color: "bg-mint-100",
    ring: "ring-teal-500/20",
    iconColor: "text-teal-700"
  },
  {
    icon: Medal,
    title: "Reward & Badge",
    desc: "Kumpulkan XP, bintang, dan badge untuk setiap misi yang kamu selesaikan.",
    color: "bg-yellow-200/60",
    ring: "ring-yellow-200",
    iconColor: "text-yellow-700"
  },
  {
    icon: ShieldCheck,
    title: "Aman & Ramah Anak",
    desc: "Konten tanpa gambar menakutkan. Bencana diajarkan lewat aksi aman dan pemulihan.",
    color: "bg-sky-100",
    ring: "ring-teal-500/20",
    iconColor: "text-sky-700"
  },
  {
    icon: MapPin,
    title: "Konteks Indonesia",
    desc: "Skenario berbasis sekolah dan keluarga Indonesia. Relevan dengan kehidupan sehari-hari.",
    color: "bg-peach-200/60",
    ring: "ring-coral-500/20",
    iconColor: "text-coral-700"
  },
  {
    icon: LineChart,
    title: "Pantau Progres",
    desc: "Lihat perkembanganmu lewat dashboard yang menyenangkan, bukan tabel data.",
    color: "bg-lavender-200/60",
    ring: "ring-purple-500/20",
    iconColor: "text-purple-700"
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section id="fitur" className="py-24 bg-cream-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-purple-700 bg-lavender-200/60 rounded-full px-4 py-1.5 mb-4">
            Kenapa Smong?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-purple-900 mb-4">
            Belajar yang Seru, Materi yang Serius
          </h2>
          <p className="font-sans text-ink-700 max-w-xl mx-auto">
            Smong mengubah pendidikan kebencanaan menjadi petualangan kesiapsiagaan yang tidak terlupakan.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={itemVariants}
                className={`rounded-3xl p-6 ring-2 ${feat.ring} ${feat.color} flex flex-col gap-4`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                </div>
                <h3 className="font-heading text-lg font-bold text-ink-900">{feat.title}</h3>
                <p className="font-sans text-sm text-ink-700 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
