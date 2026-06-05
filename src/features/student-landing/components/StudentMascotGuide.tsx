"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function StudentMascotGuide() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full flex justify-center py-8">
      <div className="relative flex flex-col md:flex-row items-center gap-6 max-w-2xl bg-cream-50 rounded-[2.5rem] p-6 border border-yellow-100 shadow-sm">
        
        {/* Mascot Avatar Placeholder */}
        <motion.div 
          animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 shrink-0 bg-yellow-200 rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl"
        >
          🦊
        </motion.div>

        {/* Speech Bubble */}
        <div className="relative bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 hidden md:block w-6 h-6 bg-white border-l border-b border-slate-100 transform rotate-45" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 md:hidden w-6 h-6 bg-white border-t border-l border-slate-100 transform rotate-45" />
          
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
            <div>
              <p className="text-slate-700 font-medium leading-relaxed">
                Halo! Aku Smong. Siap untuk misi hari ini? Jangan lupa cek tas siagamu dan pelajari jalur evakuasi. Ayo mulai!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
