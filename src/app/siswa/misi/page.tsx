import React from "react";
import { StudentPlaceholderPage } from "@/features/student-landing/components/StudentPlaceholderPage";

export default function StudentMissionPage() {
  return (
    <StudentPlaceholderPage
      eyebrow="Misi harian"
      title="Misi siaga sedang disusun"
      body="Halaman ini akan berisi daftar misi pendek, latihan cepat, dan target harian siswa. Untuk sekarang, misi utama sudah bisa dibuka dari modul Gempa Bumi."
      iconName="ListChecks"
      primaryHref="/siswa/modul"
      primaryLabel="Buka Modul"
    />
  );
}
