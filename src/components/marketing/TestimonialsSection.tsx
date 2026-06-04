"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Sekarang aku tahu harus sembunyi di mana kalau gempa. Misinya seru!",
    name: "Rina",
    role: "Siswa SD kelas 5",
    emoji: "🎒",
    color: "bg-lavender-200/50",
  },
  {
    quote: "Anakku jadi lebih percaya diri soal kesiapsiagaan. Materinya tepat sasaran.",
    name: "Pak Rudi",
    role: "Guru SD Negeri",
    emoji: "📚",
    color: "bg-mint-100",
  },
  {
    quote: "Lebih seru dari buku teks biasa. Aku dapat badge Penjaga Kepala!",
    name: "Bagas",
    role: "Siswa SMP kelas 7",
    emoji: "🏅",
    color: "bg-peach-200/50",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-purple-700 bg-lavender-200/60 rounded-full px-4 py-1.5 mb-4">
            💬 Kata Mereka
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-purple-900">
            Siap Bersama Smong
          </h2>
        </motion.div>

        {/* Cloud bubbles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`${t.color} rounded-3xl rounded-tl-none p-6 ring-2 ring-lavender-200/40 flex flex-col gap-4`}
            >
              <span className="text-3xl">{t.emoji}</span>
              <p className="font-sans text-ink-900 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-auto">
                <p className="font-heading font-bold text-ink-900 text-sm">{t.name}</p>
                <p className="font-sans text-xs text-ink-700">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
