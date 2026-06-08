import type { ArSafetyLensActivity } from "@/features/student-learning/types";

export const standaloneArSafetyLensActivity = {
  id: "ar-safety-lens-evakuasi",
  type: "ar-safety-lens",
  lessonId: "evakuasi-tenang",
  title: "AR Safety Lens: Peringatan Sekitar",
  prompt: "Buka kamera, tandai risiko di sekitarmu, lalu baca peringatan singkat dari Smong.",
  safetyDisclaimer: "Smong hanya memberi peringatan belajar. Saat keadaan nyata, ikuti jalur evakuasi resmi sekolah dan arahan guru.",
  cameraPurposeCopy: "Kamera hanya dipakai di layar ini. Gambar tidak disimpan.",
  mode: "live-warning",
  riskOptions: [
    {
      className: "glass-zone",
      label: "Kaca",
      hint: "Jendela, etalase, atau area yang mudah pecah.",
    },
    {
      className: "tall-object",
      label: "Rak/Benda Tinggi",
      hint: "Rak, lemari, papan tinggi, atau benda yang bisa jatuh.",
    },
    {
      className: "blocked-path",
      label: "Jalur Terhalang",
      hint: "Barang yang menghambat langkah saat keluar.",
    },
    {
      className: "crowded-area",
      label: "Area Ramai",
      hint: "Area yang bisa membuat siswa berdesakan.",
    },
    {
      className: "floor-item",
      label: "Barang di Lantai",
      hint: "Tas, botol, atau benda kecil yang bisa membuat tersandung.",
    },
  ],
  warningRules: [
    {
      id: "warn-glass-zone",
      targetClass: "glass-zone",
      riskLevel: "high",
      title: "Jauhi kaca",
      message: "Area kaca bisa pecah saat gempa atau gempa susulan. Jaga jarak dan lindungi kepala.",
      actionLabel: "Menjauh dari kaca",
    },
    {
      id: "warn-tall-object",
      targetClass: "tall-object",
      riskLevel: "high",
      title: "Waspadai benda tinggi",
      message: "Rak atau lemari tinggi dapat bergeser dan jatuh. Jangan berdiri terlalu dekat.",
      actionLabel: "Cari area lebih lapang",
    },
    {
      id: "warn-blocked-path",
      targetClass: "blocked-path",
      riskLevel: "medium",
      title: "Jalur terhalang",
      message: "Barang di jalur keluar dapat memperlambat evakuasi. Rapikan jika aman dilakukan sebelum bencana.",
      actionLabel: "Buka jalur aman",
    },
    {
      id: "warn-crowded-area",
      targetClass: "crowded-area",
      riskLevel: "medium",
      title: "Area terlalu ramai",
      message: "Berdesakan bisa membuat orang terjatuh. Bergerak tertib dan ikuti arahan guru.",
      actionLabel: "Tetap tertib",
    },
    {
      id: "warn-floor-item",
      targetClass: "floor-item",
      riskLevel: "low",
      title: "Awas tersandung",
      message: "Benda kecil di lantai bisa membuat tersandung saat bergerak cepat.",
      actionLabel: "Perhatikan langkah",
    },
  ],
  simulatedDetections: [
    {
      id: "sim-glass-window",
      className: "glass-zone",
      source: "simulated",
      confidence: 1,
      box: {
        xPercent: 16,
        yPercent: 34,
        widthPercent: 18,
        heightPercent: 12,
      },
    },
    {
      id: "sim-blocked-path",
      className: "blocked-path",
      source: "simulated",
      confidence: 1,
      box: {
        xPercent: 60,
        yPercent: 64,
        widthPercent: 18,
        heightPercent: 12,
      },
    },
  ],
  successFeedback: "Bagus. Kamu sudah melatih mata siaga: kenali risiko sekitar, tetap tenang, dan ikuti arahan guru.",
  fallbackActivityId: "ar-safety-lens-warning-simulation",
  rewardXp: 25,
} satisfies ArSafetyLensActivity;

export const arSafetyLensActivities = [standaloneArSafetyLensActivity] satisfies ArSafetyLensActivity[];
