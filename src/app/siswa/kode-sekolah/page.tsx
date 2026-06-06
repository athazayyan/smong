import React from "react";
import { SchoolSyncPrompt } from "@/features/student-landing/components/SchoolSyncPrompt";
import { StudentPlaceholderPage } from "@/features/student-landing/components/StudentPlaceholderPage";

export default function StudentSchoolCodePage() {
  return (
    <StudentPlaceholderPage
      eyebrow="Sinkron sekolah"
      title="Masukkan kode dari guru"
      body="Kode sekolah bersifat opsional. Jika siswa mengisinya, progres belajar bisa tersambung ke guru dan sekolah. Jika dilewati, siswa tetap bisa belajar."
      iconName="KeyRound"
      primaryHref="/siswa/modul"
      primaryLabel="Belajar Tanpa Kode"
    >
      <SchoolSyncPrompt
        isVisible={true}
        title="Punya kode dari guru?"
        body="Masukkan kode sekolah agar progresmu tersambung dengan guru. Kamu tetap bisa belajar tanpa kode."
        ctaLabel="Masukkan Kode"
      />
    </StudentPlaceholderPage>
  );
}
