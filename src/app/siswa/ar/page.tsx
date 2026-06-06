import React from "react";
import { StudentPlaceholderPage } from "@/features/student-landing/components/StudentPlaceholderPage";

export default function StudentArPage() {
  return (
    <StudentPlaceholderPage
      eyebrow="AR Safety Lens"
      title="Simulasi kamera disiapkan"
      body="Fitur ini akan menjadi ruang latihan safety lens untuk mengenali benda dan area yang perlu diperhatikan di sekitar sekolah, tetap dalam mode simulasi yang aman untuk siswa."
      iconName="Camera"
      primaryHref="/siswa/modul"
      primaryLabel="Lanjut Belajar Modul"
    />
  );
}
