"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ChevronRight, BookOpen } from "lucide-react";

interface StudentHeroProps {
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

export function StudentHero({
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
}: StudentHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="relative w-full rounded-[2.5rem] overflow-hidden bg-linear-to-b from-cream-100 to-white pt-16 pb-24 px-6 md:px-12 border border-slate-100 shadow-sm mt-6">
      {/* Background Parallax Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={shouldReduceMotion ? {} : { 
            y: [0, -10, 0],
            rotate: [0, 2, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl"
        />
        <motion.div 
          animate={shouldReduceMotion ? {} : { 
            y: [0, 15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-mint-200/40 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Text Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 text-center md:text-left"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm mb-6 shadow-sm border border-yellow-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
            </span>
            Misi Baru Tersedia!
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight mb-6">
            {title}
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-slate-600 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
            {subtitle}
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <button className="group w-full sm:w-auto px-8 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 transition-all active:scale-95 flex items-center justify-center gap-3">
              {primaryCtaLabel}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-200 hover:border-purple-200 hover:bg-purple-50 transition-all active:scale-95 flex items-center justify-center gap-3">
              <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
              {secondaryCtaLabel}
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Visual Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full relative"
        >
          <div className="aspect-square max-w-md mx-auto relative rounded-3xl bg-linear-to-br from-purple-50 to-cream-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
             {/* Note: Real implementation uses next/image with full illustration */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="text-center p-8 relative z-10">
               <div className="w-24 h-24 mx-auto bg-purple-200 rounded-full mb-4 flex items-center justify-center shadow-inner">
                  <span className="text-4xl">🎒</span>
               </div>
               <p className="text-purple-800 font-bold text-xl">Ilustrasi Smong</p>
               <p className="text-purple-600/70 text-sm font-medium mt-2">(Jalur misi yang aman)</p>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
