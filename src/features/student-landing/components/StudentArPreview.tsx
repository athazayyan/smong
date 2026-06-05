import React from "react";
import { Camera, Scan, Sparkles } from "lucide-react";

export function StudentArPreview() {
  return (
    <div className="w-full relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-300 font-bold text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Eksplorasi Baru
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            AR Safety Lens
          </h2>
          
          <p className="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed">
            Latihan kamera untuk mengenali benda dan area yang perlu diwaspadai di sekitarmu.
          </p>
          
          <button className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mx-auto md:mx-0">
            <Camera className="w-5 h-5" />
            Coba Kamera Simulasi
          </button>
        </div>
        
        <div className="flex-1 flex justify-center">
          {/* Mock Camera Viewfinder */}
          <div className="w-64 h-64 relative rounded-2xl border-2 border-white/20 overflow-hidden bg-slate-800 flex items-center justify-center">
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
            
            {/* Center target */}
            <div className="w-32 h-32 border border-white/30 rounded-full flex items-center justify-center animate-pulse">
              <Scan className="w-10 h-10 text-white/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
