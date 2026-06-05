import React from "react";
import { Zap, Flame, Award, ChevronRight } from "lucide-react";
import { ModuleProgress } from "../types";

interface StudentProgressRewardProps {
  progress: ModuleProgress;
}

export function StudentProgressReward({ progress }: StudentProgressRewardProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">Progresmu</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 fill-blue-600" />
            </div>
            <span className="font-bold text-slate-600 uppercase text-sm tracking-wider">Total XP</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{progress.xp.toLocaleString()}</div>
        </div>

        {/* Streak Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
            <span className="font-bold text-slate-600 uppercase text-sm tracking-wider">Beruntun</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{progress.streakDays} <span className="text-lg text-slate-400 font-medium">Hari</span></div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:col-span-2 lg:col-span-2">
           <div className="flex items-center justify-between mb-4">
             <span className="font-bold text-slate-600 uppercase text-sm tracking-wider">Pelajaran Selesai</span>
             <span className="text-sm font-bold text-purple-600">{progress.completedLessons} / {progress.totalLessons}</span>
           </div>
           
           <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-auto mb-2">
             <div 
                className="h-full bg-linear-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((progress.completedLessons / progress.totalLessons) * 100)}%` }}
             />
           </div>
        </div>
      </div>

      {/* Badges Preview */}
      <div className="mt-6 bg-cream-50 rounded-3xl p-6 border border-cream-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Koleksi Badge
          </h3>
          <button className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {progress.earnedBadges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-2 w-24">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-yellow-200 shadow-sm flex items-center justify-center">
                {/* Fallback icon for badge */}
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
              <span className="text-xs font-bold text-slate-600 text-center leading-tight">{badge.name}</span>
            </div>
          ))}
          {/* Empty slot placeholder */}
          <div className="flex flex-col items-center gap-2 w-24 opacity-50">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-300">?</span>
            </div>
            <span className="text-xs font-bold text-slate-400 text-center">Terkunci</span>
          </div>
        </div>
      </div>
    </div>
  );
}
