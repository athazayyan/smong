"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Heart } from "lucide-react";

export function TrustSafetyNote() {
  return (
    <section className="py-20 bg-cream-50 relative">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white/60 backdrop-blur-sm rounded-[3rem] p-10 md:p-14 border border-lavender-200/50 shadow-sm relative"
        >
          {/* Decorative floating icons */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -left-4 w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center shadow-sm"
          >
            <ShieldCheck className="w-6 h-6 text-teal-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -right-4 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-sm"
          >
            <Heart className="w-7 h-7 text-coral-500" />
          </motion.div>

          <h2 className="font-heading text-2xl md:text-4xl font-bold text-purple-900 mb-6">
            Serius soal Keselamatan, Lembut untuk Anak
          </h2>
          <p className="font-sans text-ink-700 md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Smong mengajarkan kesiapsiagaan tanpa gambar traumatis. Setiap aktivitas diarahkan pada aksi aman, refleksi, dan kepedulian. Karena kami percaya anak yang tangguh bermula dari proses belajar yang menenangkan.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
