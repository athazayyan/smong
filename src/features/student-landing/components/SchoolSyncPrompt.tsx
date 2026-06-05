"use client";

import React, { useState } from "react";
import { KeyRound, Sparkles } from "lucide-react";
import { SchoolCodeDialog } from "./SchoolCodeDialog";

interface SchoolSyncPromptProps {
  isVisible: boolean;
  title: string;
  body: string;
  ctaLabel: string;
}

export function SchoolSyncPrompt({ isVisible, title, body, ctaLabel }: SchoolSyncPromptProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      <div className="relative overflow-hidden bg-linear-to-br from-cream-50 to-purple-50 rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-yellow-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-8 -translate-x-8 w-40 h-40 bg-teal-100/40 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-purple-100 flex items-center justify-center text-yellow-500">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {title}
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h3>
              <p className="mt-2 text-slate-600 max-w-xl leading-relaxed">
                {body}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsDialogOpen(true)}
            className="shrink-0 px-6 py-3 bg-white text-purple-700 font-bold rounded-xl shadow-sm border border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-300 active:scale-95"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      <SchoolCodeDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}
