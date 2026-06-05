import React from "react";
import { MousePointerClick, HelpCircle, CheckSquare } from "lucide-react";

export function StudentActivityPreview() {
  const activities = [
    {
      id: "quiz",
      icon: HelpCircle,
      title: "Kuis Cepat",
      desc: "Uji pengetahuan siagamu dengan kuis seru.",
      color: "text-blue-500 bg-blue-100",
    },
    {
      id: "tap",
      icon: MousePointerClick,
      title: "Pilih Barang",
      desc: "Latih insting memilih barang darurat.",
      color: "text-orange-500 bg-orange-100",
    },
    {
      id: "checklist",
      icon: CheckSquare,
      title: "Ceklis Aman",
      desc: "Pastikan semua tindakan aman sudah dilakukan.",
      color: "text-emerald-500 bg-emerald-100",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">Berbagai Cara Belajar</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
              <act.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">{act.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{act.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
