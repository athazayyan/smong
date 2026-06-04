"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Rocket } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-purple-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-lavender-200/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-lavender-200/30 mb-2">
            <Shield className="w-10 h-10 text-lavender-200" />
          </div>
          
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Siap Jadi Anak Siaga?
          </h2>
          <p className="font-sans text-lavender-200 max-w-md text-lg">
            Mulai misi pertamamu sekarang. Pelajari gempa bumi lewat petualangan yang seru, aman, dan bermakna.
          </p>
          <Link
            href="/dashboard/siswa"
            className="inline-flex items-center gap-3 bg-yellow-200 text-purple-900 font-heading font-bold text-lg px-10 py-4 rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,0.2)] hover:bg-yellow-200/90 transition-colors active:shadow-none active:translate-y-1 mt-4"
          >
            Mulai Misi Sekarang <Rocket className="w-5 h-5" />
          </Link>
          <p className="font-sans text-sm text-lavender-200/60 mt-2">
            Gratis. Tidak perlu daftar untuk mulai belajar.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
