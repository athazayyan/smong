"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { School, ShieldAlert, Users, Rocket, Check, Award } from "lucide-react";

const PHASES = [
  {
    id: "pra-bencana",
    phase: "Fase 1",
    title: "Pra-Bencana",
    icon: School,
    desc: "Kenali gempa, siapkan tas siaga, dan rencanakan langkah aman bersama keluarga.",
    lessons: ["Kenali Gempa", "Tanda & Risiko", "Tas Siaga Mini", "Rencana Aman"],
    color: "bg-lavender-200/60",
    badge: "Siaga Pemula",
    iconColor: "text-purple-700"
  },
  {
    id: "saat-bencana",
    phase: "Fase 2",
    title: "Saat Bencana",
    icon: ShieldAlert,
    desc: "Berlindung, ikuti arahan, dan evakuasi dengan aman saat guncangan terjadi.",
    lessons: ["Berlindung Dulu", "Aksi Aman Cepat", "Jalur Evakuasi", "Ikuti Arahan"],
    color: "bg-sky-100",
    badge: "Penjaga Kepala",
    iconColor: "text-sky-700"
  },
  {
    id: "pascabencana",
    phase: "Fase 3",
    title: "Pascabencana",
    icon: Users,
    desc: "Cek diri dan teman, ceritakan perasaanmu, dan bangun kembali bersama.",
    lessons: ["Cek Diri & Teman", "Cerita Perasaan", "Gotong Royong Pulih"],
    color: "bg-mint-100",
    badge: "Teman Tangguh",
    iconColor: "text-teal-700"
  },
];

export function ModulePreviewSection() {
  return (
    <section id="modul" className="py-24 bg-cream-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 bg-mint-100 rounded-full px-4 py-1.5 mb-4 border border-teal-200">
            <School className="w-4 h-4" /> Modul MVP — Gempa Bumi
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-purple-900 mb-4">
            Tiga Fase Petualangan Kesiapsiagaan
          </h2>
          <p className="font-sans text-ink-700 max-w-xl mx-auto">
            Setiap fase membawamu satu langkah lebih dekat menjadi anak yang siaga dan tangguh.
          </p>
        </motion.div>

        {/* Phase cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PHASES.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`${phase.color} rounded-3xl p-6 ring-2 ring-lavender-200/60 flex flex-col gap-5`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
                    <Icon className={`w-6 h-6 ${phase.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-heading text-xs font-semibold text-ink-700 uppercase tracking-wide">{phase.phase}</p>
                    <h3 className="font-heading text-lg font-bold text-purple-900">{phase.title}</h3>
                  </div>
                </div>

                <p className="font-sans text-sm text-ink-700 leading-relaxed">{phase.desc}</p>

                <ul className="flex flex-col gap-2">
                  {phase.lessons.map((lesson) => (
                    <li key={lesson} className="flex items-start gap-2 text-sm font-sans text-ink-900">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-purple-700" strokeWidth={3} />
                      </div>
                      {lesson}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center gap-3 bg-white/60 rounded-2xl px-4 py-3 border border-white/80">
                  <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-yellow-800" />
                  </div>
                  <p className="font-sans text-xs text-ink-700">
                    Badge: <span className="font-semibold text-ink-900 block mt-0.5">{phase.badge}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/dashboard/siswa"
            className="inline-flex items-center gap-2 bg-purple-700 text-white font-heading font-bold text-base px-8 py-4 rounded-2xl shadow-[0_5px_0_0_#2F176E] hover:bg-purple-500 transition-colors active:shadow-none active:translate-y-1"
          >
            Ayo Mulai Misi Pertama <Rocket className="w-5 h-5 ml-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
