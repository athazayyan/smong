"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function MascotIntroSection() {
  return (
    <section className="py-24 bg-cream-100 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/40 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-10 md:gap-20">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-lg text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-200/50 border border-yellow-300 text-yellow-800 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4" /> Pemandu Setiamu
            </div>
            
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-purple-900 leading-tight mb-5 drop-shadow-sm">
              Kenalan dengan Teman Misimu
            </h2>
            
            <p className="font-sans text-lg text-ink-700 leading-relaxed font-medium mb-8">
              Smong akan memberi petunjuk singkat, merayakan progressmu, dan mengingatkan aksi aman tanpa membuatmu takut. Belajar kesiapsiagaan kini terasa seperti memiliki teman yang selalu siap sedia!
            </p>
          </motion.div>

          {/* Mascot Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex-1 relative flex justify-center md:justify-end"
          >
            {/* Organic soft panel behind mascot */}
            <motion.div
              animate={{ rotate: [0, 5, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-96 aspect-square bg-gradient-to-br from-lavender-200 to-purple-200 rounded-[4rem] rotate-12 -z-10 shadow-inner"
            />
            
            <div className="relative w-80 md:w-[450px] aspect-square">
              <Image
                src="/assets/landing/mascot-smong-landing-guide.png"
                alt="Maskot Smong yang ramah dan siap membantu"
                fill
                sizes="(max-width: 768px) 320px, 450px"
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
