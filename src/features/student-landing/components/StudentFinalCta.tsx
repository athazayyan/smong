import React from "react";
import { ArrowRight } from "lucide-react";

export function StudentFinalCta() {
  return (
    <div className="w-full bg-linear-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl shadow-purple-200">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Melanjutkan Misi?</h2>
        <p className="text-purple-100 text-lg mb-8 max-w-lg mx-auto">
          Setiap langkah yang kamu pelajari membuatmu semakin siap dan aman. Ayo selesaikan jalur belajarmu hari ini!
        </p>
        <button className="group px-8 py-4 bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-2xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 mx-auto">
          Mulai Belajar Sekarang
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
