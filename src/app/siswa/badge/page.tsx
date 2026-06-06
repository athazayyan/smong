import React from "react";
import { StudentPlaceholderPage } from "@/features/student-landing/components/StudentPlaceholderPage";

export default function StudentBadgePage() {
  return (
    <StudentPlaceholderPage
      eyebrow="Koleksi badge"
      title="Rak badge segera hadir"
      body="Nanti siswa bisa melihat badge, sertifikat, dan hadiah belajar yang berhasil dikumpulkan dari setiap modul kesiapsiagaan."
      iconName="Award"
      primaryHref="/siswa"
      primaryLabel="Kembali ke Beranda"
    />
  );
}
