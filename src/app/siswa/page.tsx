import React from "react";
import { Metadata } from "next";
import { mockStudentLandingState } from "@/features/student-landing/data/mock-landing";
import {
  studentHeroStats,
} from "@/features/student-landing/data/visual-config";
import type { StudentLandingSection } from "@/features/student-landing/types";

import { StudentHero } from "@/features/student-landing/components/StudentHero";
import { SchoolSyncPrompt } from "@/features/student-landing/components/SchoolSyncPrompt";
import { DailyMissionSection } from "@/features/student-landing/components/DailyMissionSection";
import { StudentModulePathPreview } from "@/features/student-landing/components/StudentModulePathPreview";
import { DisasterModuleCards } from "@/features/student-landing/components/DisasterModuleCards";
import { StudentActivityPreview } from "@/features/student-landing/components/StudentActivityPreview";
import { StudentArPreview } from "@/features/student-landing/components/StudentArPreview";
import { StudentProgressReward } from "@/features/student-landing/components/StudentProgressReward";
import { StudentMascotGuide } from "@/features/student-landing/components/StudentMascotGuide";
import { StudentFinalCta } from "@/features/student-landing/components/StudentFinalCta";

export const metadata: Metadata = {
  title: "Beranda Siswa | Smong",
  description: "Mulai misi siaga bencanamu hari ini bersama Smong.",
};

export default function StudentLandingPage() {
  const state = mockStudentLandingState;
  const heroSection = state.sections.find(
    (section): section is Extract<StudentLandingSection, { type: "hero" }> =>
      section.type === "hero"
  );
  const heroStats = studentHeroStats.map((stat) => {
    if (stat.id === "xp") {
      return { ...stat, value: state.progress.xp.toLocaleString("id-ID") };
    }
    if (stat.id === "streak") {
      return { ...stat, value: `${state.progress.streakDays}` };
    }
    return { ...stat, value: `${state.progress.completedLessons}/${state.progress.totalLessons}` };
  });

  return (
    <main className="relative overflow-hidden pb-24">
      <StudentHero 
        title={heroSection?.title ?? "Mulai Misi Siaga Hari Ini"}
        subtitle={heroSection?.subtitle ?? "Belajar langkah aman lewat jalur misi, pilihan cepat, dan cerita yang mudah dipahami."}
        primaryCtaLabel={heroSection?.primaryCtaLabel ?? "Lanjutkan Misi"}
        secondaryCtaLabel={heroSection?.secondaryCtaLabel ?? "Lihat Modul"}
        stats={heroStats}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:gap-12 sm:px-6 lg:gap-16 lg:px-8">
        {state.schoolSyncStatus === "not-synced" && (
          <SchoolSyncPrompt 
            isVisible={true}
            title="Punya kode dari guru?"
            body="Masukkan kode sekolah agar progresmu tersambung dengan guru. Kamu tetap bisa belajar tanpa kode."
            ctaLabel="Masukkan Kode"
          />
        )}

        <StudentMascotGuide />

        <DailyMissionSection activityId="daily-1" />

        <StudentModulePathPreview moduleGroupId={state.activeModuleId} />

        <DisasterModuleCards moduleGroupIds={["gempa-bumi", "banjir", "tsunami"]} />

        <StudentActivityPreview />

        <StudentArPreview />

        <StudentProgressReward progress={state.progress} />

        <StudentFinalCta />
      </div>
    </main>
  );
}
