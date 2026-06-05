"use client";

import React from "react";
import { Check, Lock, Map as MapIcon } from "lucide-react";
import { ModuleGroupId } from "../types";

interface StudentModulePathPreviewProps {
  moduleGroupId: ModuleGroupId;
}

export function StudentModulePathPreview({ moduleGroupId }: StudentModulePathPreviewProps) {
  void moduleGroupId;
  // Mock nodes for visual preview
  const nodes = [
    { id: 1, status: "completed", type: "lesson", label: "Kenali Gempa" },
    { id: 2, status: "completed", type: "activity", label: "Tas Siaga" },
    { id: 3, status: "active", type: "lesson", label: "Saat Berlindung" },
    { id: 4, status: "locked", type: "activity", label: "Simulasi Cepat" },
    { id: 5, status: "locked", type: "checkpoint", label: "Checkpoint 1" },
  ];

  return (
    <div className="w-full bg-cream-50 rounded-3xl p-8 border border-cream-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-purple-500" />
            Jalur Belajar: Gempa Bumi
          </h2>
          <p className="text-slate-500 mt-1">Selesaikan tiap misi untuk membuka jalur berikutnya.</p>
        </div>
      </div>

      <div className="relative py-12 flex flex-col items-center">
        {/* Wavy Path Background SVG (Simplified visual representation) */}
        <div className="absolute top-0 bottom-0 w-4 bg-purple-100 rounded-full" />
        
        {/* Nodes */}
        <div className="relative z-10 flex flex-col gap-12 w-full max-w-sm">
          {nodes.map((node, index) => {
            const isLeft = index % 2 === 0;
            
            return (
              <div 
                key={node.id} 
                className={`flex items-center justify-center relative ${
                  isLeft ? "-ml-16 sm:-ml-24" : "ml-16 sm:ml-24"
                }`}
              >
                {/* Node Status Styles */}
                <button className={`
                  relative group flex items-center justify-center w-20 h-20 rounded-full shadow-lg border-4 transition-transform
                  ${node.status === "completed" ? "bg-yellow-400 border-yellow-200 hover:scale-105" : ""}
                  ${node.status === "active" ? "bg-purple-500 border-purple-300 shadow-purple-300 animate-pulse-soft hover:scale-105" : ""}
                  ${node.status === "locked" ? "bg-slate-200 border-slate-100 shadow-none cursor-not-allowed" : ""}
                `}>
                  {node.status === "completed" && <Check className="w-8 h-8 text-white" />}
                  {node.status === "active" && <span className="w-4 h-4 bg-white rounded-full animate-ping" />}
                  {node.status === "locked" && <Lock className="w-6 h-6 text-slate-400" />}

                  {/* Tooltip / Label */}
                  <div className={`absolute top-full mt-3 px-3 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap opacity-100
                    ${node.status === "active" ? "bg-purple-600 text-white" : "bg-white text-slate-600 border border-slate-200"}
                  `}>
                    {node.label}
                    <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45
                      ${node.status === "active" ? "bg-purple-600" : "bg-white border-l border-t border-slate-200"}
                    `} />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
