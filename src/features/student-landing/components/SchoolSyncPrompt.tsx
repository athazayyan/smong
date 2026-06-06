"use client";

import React, { useState } from "react";
import { ArrowRight, KeyRound, Link2, Sparkles } from "lucide-react";
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

  const openDialog = () => setIsDialogOpen(true);

  return (
    <>
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-cream-50" />
        <div className="absolute -right-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-cream-50" />
        <div className="relative overflow-hidden rounded-[2rem] border border-yellow-200/80 bg-white/80 p-4 shadow-[0_18px_50px_rgba(47,23,110,0.09)] backdrop-blur md:p-5">
          <div className="absolute inset-y-4 left-[72px] hidden border-l-2 border-dashed border-yellow-200 md:block" />
          <div className="absolute right-8 top-0 h-24 w-24 rounded-full bg-yellow-200/35 blur-2xl" />
          <div className="absolute bottom-0 left-24 h-24 w-28 rounded-full bg-mint-100/45 blur-2xl" />

          <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-2xl bg-yellow-200 p-3 text-yellow-800 shadow-[0_8px_0_rgba(140,102,0,0.14)]">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-lavender-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-purple-700">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                  Sinkron opsional
                </p>
                <h3 className="font-heading text-2xl font-black leading-tight text-ink-900">
                  {title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-ink-700">
                  {body}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openDialog}
              onPointerUp={openDialog}
              className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-purple-700 px-6 py-3 font-heading text-sm font-extrabold text-white shadow-[0_8px_0_#32146f] transition hover:-translate-y-0.5 hover:bg-purple-500 active:translate-y-1 active:shadow-[0_3px_0_#32146f] md:w-auto"
            >
              <Link2 className="h-4 w-4" />
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <SchoolCodeDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}
