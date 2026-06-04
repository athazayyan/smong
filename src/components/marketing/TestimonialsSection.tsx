"use client";

import { motion } from "framer-motion";
import { MessageCircle, Backpack, BookOpen, Medal } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Sekarang aku tahu harus sembunyi di mana kalau gempa. Misinya seru!",
    name: "Rina",
    role: "Siswa SD kelas 5",
    icon: Backpack,
    color: "bg-lavender-200/50",
    iconColor: "text-purple-700"
  },
  {
    quote: "Anakku jadi lebih percaya diri soal kesiapsiagaan. Materinya tepat sasaran.",
    name: "Pak Rudi",
    role: "Guru SD Negeri",
    icon: BookOpen,
    color: "bg-mint-100",
    iconColor: "text-teal-700"
  },
  {
    quote: "Lebih seru dari buku teks biasa. Aku dapat badge Penjaga Kepala!",
    name: "Bagas",
    role: "Siswa SMP kelas 7",
    icon: Medal,
    color: "bg-peach-200/50",
    iconColor: "text-coral-700"
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
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 bg-lavender-200/60 rounded-full px-4 py-1.5 mb-4">
            <MessageCircle className="w-4 h-4" /> Kata Mereka
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-purple-900">
            Siap Bersama Smong
          </h2>
        </motion.div>

        {/* Cloud bubbles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`${t.color} rounded-3xl rounded-tl-none p-8 ring-2 ring-lavender-200/40 flex flex-col gap-6`}
              >
                <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${t.iconColor}`} />
                </div>
                <p className="font-sans text-ink-900 leading-relaxed italic text-lg">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto pt-4 border-t border-ink-900/10">
                  <p className="font-heading font-bold text-ink-900 text-sm">{t.name}</p>
                  <p className="font-sans text-xs text-ink-700 mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
