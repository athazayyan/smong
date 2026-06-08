import React from "react";
import { StudentPlaceholderPage } from "@/features/student-landing/components/StudentPlaceholderPage";

export default function StudentProfilePage() {
  return (
    <StudentPlaceholderPage
      eyebrow="Profil siswa"
      title="Profil belajar Smong"
      body="Halaman profil akan menampilkan nama siswa, level SD/SMP, status sinkron sekolah, dan ringkasan progress. Untuk MVP frontend, data masih memakai mock typed data."
      iconName="User"
      primaryHref="/siswa"
      primaryLabel="Kembali ke Beranda"
    />
  );
}
