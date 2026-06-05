import React from "react";
import { Metadata } from "next";
import { mockStudentLandingState } from "@/features/student-landing/data/mock-landing";

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

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* 1. Hero Section */}
      <StudentHero 
        title={state.sections[0].type === "hero" ? state.sections[0].title : "Mulai Misi Siaga Hari Ini"}
        subtitle={state.sections[0].type === "hero" ? state.sections[0].subtitle : ""}
        primaryCtaLabel={state.sections[0].type === "hero" ? state.sections[0].primaryCtaLabel : "Lanjutkan Misi"}
        secondaryCtaLabel={state.sections[0].type === "hero" ? state.sections[0].secondaryCtaLabel : "Lihat Modul"}
      />

      {/* 2. Optional School Sync Prompt */}
      {state.schoolSyncStatus === "not-synced" && (
        <SchoolSyncPrompt 
          isVisible={true}
          title="Punya kode dari guru?"
          body="Masukkan kode sekolah agar progresmu tersambung dengan guru. Kamu tetap bisa belajar tanpa kode."
          ctaLabel="Masukkan Kode"
        />
      )}

      {/* 3. Mascot Guide */}
      <StudentMascotGuide />

      {/* 4. Daily Mission */}
      <DailyMissionSection activityId="daily-1" />

      {/* 5. Active Module Learning Path */}
      <StudentModulePathPreview moduleGroupId={state.activeModuleId} />

      {/* 6. Disaster Module Cards */}
      <DisasterModuleCards moduleGroupIds={["gempa-bumi", "banjir", "tsunami"]} />

      {/* 7. Activity Preview */}
      <StudentActivityPreview />

      {/* 8. AR Safety Lens Preview */}
      <StudentArPreview />

      {/* 9. Progress & Rewards */}
      <StudentProgressReward progress={state.progress} />

      {/* 10. Final CTA */}
      <StudentFinalCta />
    </div>
  );
}
