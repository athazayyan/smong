import React from "react";
import { BookOpen, Lock } from "lucide-react";
import { ModuleGroupId } from "../types";

interface DisasterModuleCardsProps {
  moduleGroupIds: ModuleGroupId[];
}

export function DisasterModuleCards({ moduleGroupIds }: DisasterModuleCardsProps) {
  void moduleGroupIds;
  // Mock data for available modules
  const modules = [
    {
      id: "gempa-bumi",
      title: "Gempa Bumi",
      description: "Kenali tanda gempa dan cara berlindung dengan aman.",
      status: "active",
      color: "from-purple-500 to-indigo-500",
      bgClass: "bg-purple-50",
    },
    {
      id: "banjir",
      title: "Banjir",
      description: "Amankan barang penting dan cari tempat tinggi.",
      status: "locked",
      color: "from-blue-400 to-cyan-500",
      bgClass: "bg-slate-50",
    },
    {
      id: "tsunami",
      title: "Tsunami",
      description: "Pahami jalur evakuasi dan rambu keselamatan pesisir.",
      status: "locked",
      color: "from-teal-400 to-emerald-500",
      bgClass: "bg-slate-50",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-500" />
          Pilihan Modul
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id}
            className={`relative rounded-3xl p-6 border transition-all duration-300 ${
              mod.status === "active" 
                ? "border-purple-200 bg-white shadow-lg shadow-purple-100 hover:-translate-y-1 cursor-pointer" 
                : "border-slate-200 bg-slate-50 opacity-80 cursor-not-allowed"
            }`}
          >
            {mod.status === "locked" && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${mod.color} flex items-center justify-center mb-4 shadow-sm`}>
              {/* Icon placeholder based on module */}
              <span className="text-2xl text-white font-bold">{mod.title.charAt(0)}</span>
            </div>
            
            <h3 className={`text-xl font-bold mb-2 ${mod.status === "active" ? "text-slate-800" : "text-slate-600"}`}>
              {mod.title}
            </h3>
            
            <p className="text-slate-500 text-sm leading-relaxed">
              {mod.description}
            </p>

            {mod.status === "active" && (
              <div className="mt-6 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-yellow-400 to-orange-400 w-1/3 rounded-full" />
              </div>
            )}
            {mod.status === "locked" && (
              <div className="mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Segera Hadir
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
