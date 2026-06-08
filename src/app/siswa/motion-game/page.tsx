"use client";

import dynamic from "next/dynamic";
import { Activity } from "lucide-react";
import { StudentPlaceholderPage } from "@/features/student-landing/components/StudentPlaceholderPage";


const MotionGameContainer = dynamic(
  () => import("@/components/game/MotionGameContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[80vh] items-center justify-center bg-cream-50 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <Activity className="h-10 w-10 animate-pulse text-purple-700" />
          <p className="font-heading text-lg font-bold text-purple-900">
            Memuat Modul AI &amp; Kamera…
          </p>
          <p className="text-sm font-medium text-ink-400">
            Mohon tunggu, model detektor pose sedang disiapkan.
          </p>
        </div>
      </div>
    ),
  }
);

export default function MotionGamePage() {
  return <MotionGameContainer />;
}
