import { Activity, LessonNode, Module } from "../types";

export const earthquakeModule = {
  id: "gempa-bumi-mvp",
  title: "Misi Gempa Bumi",
  disasterTopic: "gempa-bumi",
  targetAudience: "sd-smp",
  phaseIds: ["pra-bencana", "saat-bencana", "pascabencana"],
  activeLessonId: "kenali-gempa",
} satisfies Module;

export const lessonNodes: LessonNode[] = [
  // PRA-BENCANA (2 Activities)
  {
    id: "kenali-gempa",
    phaseId: "pra-bencana",
    title: "Kenali Gempa",
    shortDescription: "Cari tahu apa itu gempa bumi.",
    status: "active",
    activityIds: ["quiz-kenali-gempa"],
    reward: {
      id: "reward-kenali-gempa",
      type: "xp",
      label: "20 XP",
      xpAmount: 20,
    },
    motionPreset: "active-pulse",
  },
  {
    id: "tas-siaga-mini",
    phaseId: "pra-bencana",
    title: "Tas Siaga Mini",
    shortDescription: "Pilih barang penting untuk tas siaga.",
    status: "available",
    activityIds: ["drag-tas-siaga"],
    reward: {
      id: "reward-tas-siaga",
      type: "badge",
      label: "Badge Siaga",
      xpAmount: 25,
      badgeId: "siaga-pemula",
    },
    motionPreset: "node-bounce",
  },

  // SAAT BENCANA (2 Activities)
  {
    id: "berlindung-dulu",
    phaseId: "saat-bencana",
    title: "Berlindung Dulu",
    shortDescription: "Apa yang harus dilakukan saat berguncang?",
    status: "locked",
    activityIds: ["sim-berlindung"],
    reward: {
      id: "reward-berlindung",
      type: "xp",
      label: "25 XP",
      xpAmount: 25,
    },
    motionPreset: "locked-wiggle",
  },
  {
    id: "ikuti-arahan",
    phaseId: "saat-bencana",
    title: "Ikuti Arahan",
    shortDescription: "Dengarkan instruksi guru dengan tenang.",
    status: "locked",
    activityIds: ["check-arahan"],
    reward: {
      id: "reward-ikuti-arahan",
      type: "badge",
      label: "Penjaga Kepala",
      xpAmount: 30,
      badgeId: "penjaga-kepala",
    },
    motionPreset: "locked-wiggle",
  },

  // PASCABENCANA (1 Activity)
  {
    id: "cerita-perasaan",
    phaseId: "pascabencana",
    title: "Cerita Perasaan",
    shortDescription: "Berbagi ceritamu dengan aman.",
    status: "locked",
    activityIds: ["reflect-perasaan"],
    reward: {
      id: "reward-cerita",
      type: "badge",
      label: "Pahlawan Evakuasi",
      xpAmount: 50,
      badgeId: "pahlawan-evakuasi",
    },
    motionPreset: "locked-wiggle",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "quiz-kenali-gempa",
    type: "visual-quiz",
    lessonId: "kenali-gempa",
    prompt: "Apa yang membuat tanah bergoyang saat gempa bumi?",
    options: [
      {
        id: "opt1",
        label: "Angin kencang",
        imageAlt: "Angin",
        isCorrect: false,
      },
      {
        id: "opt2",
        label: "Pergerakan lempeng bumi",
        imageAlt: "Lempeng bumi",
        isCorrect: true,
      },
    ],
    successFeedback: "Bagus! Gempa bumi terjadi karena pergerakan lempeng di bawah tanah.",
    retryFeedback: "Coba lagi. Ini bukan karena cuaca di langit, tapi dari bawah tanah.",
  },
  {
    id: "drag-tas-siaga",
    type: "drag-and-drop",
    lessonId: "tas-siaga-mini",
    prompt: "Bantu Raka memilih isi tas siaga.",
    dropZoneLabel: "Tas Siaga",
    draggableItems: [
      { id: "item1", label: "Senter & Baterai", belongsInDropZone: true },
      { id: "item2", label: "Mainan besar", belongsInDropZone: false },
      { id: "item3", label: "Kotak P3K", belongsInDropZone: true },
      { id: "item4", label: "Botol Air", belongsInDropZone: true },
    ],
    successFeedback: "Hebat! Tas siaga sudah siap dengan barang-barang penting.",
    retryFeedback: "Coba lagi. Pilih barang yang paling berguna saat darurat.",
  },
  {
    id: "sim-berlindung",
    type: "decision-simulation",
    lessonId: "berlindung-dulu",
    prompt: "Guncangan terasa di kelas. Pilih aksi pertamamu.",
    options: [
      {
        id: "sim1",
        label: "Berlari keluar kelas sambil berteriak",
        isCorrect: false,
        explanation: "Berlari saat guncangan bisa membuatmu terjatuh atau terkena puing.",
      },
      {
        id: "sim2",
        label: "Berlindung di bawah meja dan pegang erat kakinya",
        isCorrect: true,
        explanation: "Benar! Meja akan melindungi kepalamu dari benda jatuh.",
      },
    ],
    successFeedback: "Bagus! Berlindung di bawah meja membantu melindungi kepala dari benda jatuh.",
    retryFeedback: "Coba lagi. Saat guncangan masih terasa, kita berlindung dulu sebelum keluar.",
  },
  {
    id: "check-arahan",
    type: "checklist",
    lessonId: "ikuti-arahan",
    prompt: "Setelah guncangan berhenti, apa yang harus kamu lakukan?",
    items: [
      { id: "chk1", label: "Dengarkan instruksi guru" },
      { id: "chk2", label: "Keluar kelas dengan tertib" },
      { id: "chk3", label: "Gunakan tas untuk melindungi kepala" },
    ],
    successFeedback: "Hebat! Kamu tahu langkah evakuasi yang benar.",
    retryFeedback: "Pastikan kamu memeriksa semua langkah penting.",
  },
  {
    id: "reflect-perasaan",
    type: "reflection-choice",
    lessonId: "cerita-perasaan",
    prompt: "Temanmu terlihat bingung dan takut setelah latihan gempa. Apa yang bisa kamu katakan?",
    options: [
      { id: "ref1", label: "'Jangan takut, kita sudah berlatih jadi kita tahu harus apa.'" },
      { id: "ref2", label: "'Aku juga kaget tadi, ayo kita cerita sama Ibu Guru.'" },
    ],
    successFeedback: "Luar biasa! Berbagi perasaan dan menenangkan teman membuat kita semua lebih tangguh.",
    retryFeedback: "Pilih jawaban yang membuat teman merasa aman dan didukung.",
  }
];
