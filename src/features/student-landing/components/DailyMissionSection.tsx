import React from "react";
import { Target, Play, Star } from "lucide-react";

interface DailyMissionSectionProps {
  activityId: string;
}

export function DailyMissionSection({ activityId }: DailyMissionSectionProps) {
  return (
    <div className="w-full relative bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400 rounded-full blur animate-pulse opacity-50" />
            <div className="relative w-16 h-16 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">
              Misi Harianmu
            </h2>
            <h3 className="text-xl font-bold text-slate-800">
              Pilih Aksi Aman Saat Gempa
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Selesaikan misi ini untuk mendapatkan +50 XP
            </p>
          </div>
        </div>

        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 group">
          Mulai Misi
          <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform fill-white" />
        </button>

      </div>
    </div>
  );
}
