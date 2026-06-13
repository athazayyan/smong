import type { BoardGameEventCard } from "../types";

export const boardGameEventCards = [
  {
    id: "event-tsunami-aceh-2004",
    disasterId: "tsunami",
    title: "Tsunami Aceh 2004",
    factSummary:
      "Gempa besar Samudra Hindia pada 26 Desember 2004 memicu tsunami besar. Tradisi Smong membantu warga Simeulue bergerak cepat ke tempat aman.",
    learningInsight:
      "Jika gempa kuat terasa di pesisir, bergerak ke tempat tinggi tanpa menunggu lama.",
    protectionCardIds: ["mangrove", "early-warning"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 2,
    specialEffect: "none",
    visualAssetKey: "event-tsunami-aceh",
    motionPreset: "wave-rise",
  },
  {
    id: "event-tsunami-palu-2018",
    disasterId: "tsunami",
    title: "Tsunami Palu 2018",
    factSummary:
      "Gempa kuat di Palu pada 28 September 2018 diikuti tsunami lokal yang datang sangat cepat di wilayah teluk.",
    learningInsight:
      "Tsunami lokal bisa datang dalam hitungan menit, jadi jalur evakuasi perlu dipahami sebelum kejadian.",
    protectionCardIds: ["mangrove", "early-warning"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 2,
    specialEffect: "none",
    visualAssetKey: "event-tsunami-palu",
    motionPreset: "wave-rise",
  },
  {
    id: "event-tsunami-pangandaran-2006",
    disasterId: "tsunami",
    title: "Tsunami Pangandaran 2006",
    factSummary:
      "Tsunami terjadi setelah gempa lepas pantai Jawa pada 17 Juli 2006 dan sebagian warga tidak merasakan guncangan besar.",
    learningInsight:
      "Tanda alam seperti laut surut jauh perlu direspons dengan evakuasi, bukan ditonton.",
    protectionCardIds: ["mangrove"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 2,
    specialEffect: "none",
    visualAssetKey: "event-tsunami-pangandaran",
    motionPreset: "wave-rise",
  },
  {
    id: "event-tsunami-flores-1992",
    disasterId: "tsunami",
    title: "Tsunami Flores 1992",
    factSummary:
      "Gempa kuat pada 12 Desember 1992 memicu tsunami yang menghantam wilayah Flores.",
    learningInsight:
      "Vegetasi pesisir dan rute ke tempat tinggi membantu mengurangi risiko.",
    protectionCardIds: ["mangrove", "early-warning"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 2,
    specialEffect: "none",
    visualAssetKey: "event-tsunami-flores",
    motionPreset: "wave-rise",
  },
  {
    id: "event-tsunami-krakatau-2018",
    disasterId: "tsunami",
    title: "Tsunami Krakatau 2018",
    factSummary:
      "Aktivitas Anak Krakatau pada 22 Desember 2018 memicu tsunami di Selat Sunda tanpa pola peringatan gempa biasa.",
    learningInsight:
      "Tidak semua tsunami diawali gempa yang terasa, jadi informasi resmi dan kesiapan rute tetap penting.",
    protectionCardIds: ["mangrove"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 2,
    specialEffect: "none",
    visualAssetKey: "event-tsunami-krakatau",
    motionPreset: "wave-rise",
  },
  {
    id: "event-gempa-cianjur-2022",
    disasterId: "gempa-bumi",
    title: "Gempa Cianjur 2022",
    factSummary:
      "Gempa 21 November 2022 merusak banyak bangunan dan menunjukkan pentingnya respons aman saat guncangan.",
    learningInsight:
      "Saat guncangan berlangsung, lindungi kepala dan berlindung sebelum bergerak.",
    protectionCardIds: ["bangunan-tahan-gempa"],
    bonusCardIds: ["helm-darurat", "escape-route"],
    giliranEvakuasi: 3,
    specialEffect: "none",
    visualAssetKey: "event-gempa-cianjur",
    motionPreset: "ground-pulse",
  },
  {
    id: "event-gempa-yogyakarta-2006",
    disasterId: "gempa-bumi",
    title: "Gempa Yogyakarta 2006",
    factSummary:
      "Gempa di wilayah Yogyakarta dan Bantul pada 27 Mei 2006 menyebabkan banyak kerusakan bangunan.",
    learningInsight:
      "Bangunan yang lebih aman dan latihan respons mengurangi risiko cedera.",
    protectionCardIds: ["bangunan-tahan-gempa"],
    bonusCardIds: ["helm-darurat", "escape-route"],
    giliranEvakuasi: 3,
    specialEffect: "none",
    visualAssetKey: "event-gempa-yogyakarta",
    motionPreset: "ground-pulse",
  },
  {
    id: "event-gempa-lombok-2018",
    disasterId: "gempa-bumi",
    title: "Gempa Lombok 2018",
    factSummary:
      "Rangkaian gempa Lombok pada 2018 diikuti banyak gempa susulan yang membuat kesiapan titik kumpul sangat penting.",
    learningInsight:
      "Setelah gempa utama, tetap waspada gempa susulan dan ikuti titik kumpul aman.",
    protectionCardIds: ["bangunan-tahan-gempa"],
    bonusCardIds: ["helm-darurat", "escape-route"],
    giliranEvakuasi: 3,
    specialEffect: "none",
    visualAssetKey: "event-gempa-lombok",
    motionPreset: "ground-pulse",
  },
  {
    id: "event-gempa-mamuju-2021",
    disasterId: "gempa-bumi",
    title: "Gempa Mamuju-Majene 2021",
    factSummary:
      "Gempa dini hari pada 15 Januari 2021 mengingatkan pentingnya kesiapan keluarga saat malam.",
    learningInsight:
      "Tas siaga dan rencana keluarga perlu mudah dijangkau kapan saja.",
    protectionCardIds: ["bangunan-tahan-gempa"],
    bonusCardIds: ["helm-darurat", "escape-route"],
    giliranEvakuasi: 3,
    specialEffect: "none",
    visualAssetKey: "event-gempa-mamuju",
    motionPreset: "ground-pulse",
  },
  {
    id: "event-gempa-donggala-2018",
    disasterId: "gempa-bumi",
    title: "Gempa Donggala 2018",
    factSummary:
      "Gempa kuat di Sulawesi Tengah pada 28 September 2018 memicu dampak lanjutan seperti tsunami dan likuefaksi.",
    learningInsight:
      "Wilayah pesisir perlu mengingat hubungan gempa kuat dan potensi tsunami.",
    protectionCardIds: ["bangunan-tahan-gempa"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 3,
    specialEffect: "none",
    visualAssetKey: "event-gempa-donggala",
    motionPreset: "ground-pulse",
  },
  {
    id: "event-banjir-demak-2024",
    disasterId: "banjir",
    title: "Banjir Demak 2024",
    factSummary:
      "Banjir besar di Demak pada 2024 menunjukkan pentingnya tanggul, drainase, dan kesiapan evakuasi.",
    learningInsight:
      "Banjir sering memberi waktu persiapan jika informasi dipantau sejak awal.",
    protectionCardIds: ["tanggul", "mangrove"],
    bonusCardIds: ["drainase-bersih", "escape-route"],
    giliranEvakuasi: 4,
    specialEffect: "none",
    visualAssetKey: "event-banjir-demak",
    motionPreset: "water-rise",
  },
  {
    id: "event-banjir-sumbar-2024",
    disasterId: "banjir",
    title: "Banjir Sumatera Barat 2024",
    factSummary:
      "Banjir dan aliran lahar hujan di Sumatera Barat pada 2024 berdampak pada banyak warga.",
    learningInsight:
      "Hindari aliran deras dan ikuti arahan petugas saat hujan ekstrem di wilayah rawan.",
    protectionCardIds: ["mangrove", "tanggul"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 4,
    specialEffect: "none",
    visualAssetKey: "event-banjir-sumbar",
    motionPreset: "water-rise",
  },
  {
    id: "event-banjir-jakarta-2020",
    disasterId: "banjir",
    title: "Banjir Jakarta 2020",
    factSummary:
      "Hujan intens di awal 2020 menyebabkan banjir besar di Jakarta dan sekitarnya.",
    learningInsight:
      "Drainase bersih dan keputusan mematikan listrik dapat mengurangi risiko di rumah.",
    protectionCardIds: ["tanggul"],
    bonusCardIds: ["drainase-bersih", "escape-route"],
    giliranEvakuasi: 4,
    specialEffect: "none",
    visualAssetKey: "event-banjir-jakarta",
    motionPreset: "water-rise",
  },
  {
    id: "event-banjir-wasior-2010",
    disasterId: "banjir",
    title: "Banjir Wasior 2010",
    factSummary:
      "Banjir bandang Wasior pada 2010 menunjukkan risiko tinggi di daerah aliran sungai yang rusak.",
    learningInsight:
      "Hutan dan daerah resapan membantu menahan aliran air.",
    protectionCardIds: ["mangrove"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 4,
    specialEffect: "none",
    visualAssetKey: "event-banjir-wasior",
    motionPreset: "water-rise",
  },
  {
    id: "event-banjir-kalsel-2021",
    disasterId: "banjir",
    title: "Banjir Kalimantan Selatan 2021",
    factSummary:
      "Banjir besar di Kalimantan Selatan pada 2021 berdampak luas pada rumah dan fasilitas umum.",
    learningInsight:
      "Menjaga tutupan lahan dan jalur air adalah bagian dari mitigasi jangka panjang.",
    protectionCardIds: ["mangrove", "tanggul"],
    bonusCardIds: ["drainase-bersih", "escape-route"],
    giliranEvakuasi: 4,
    specialEffect: "none",
    visualAssetKey: "event-banjir-kalsel",
    motionPreset: "water-rise",
  },
  {
    id: "event-cuaca-rancaekek-2024",
    disasterId: "cuaca-ekstrem",
    title: "Angin Kencang Rancaekek 2024",
    factSummary:
      "Angin sangat kuat di wilayah Bandung-Sumedang pada 2024 merusak banyak bangunan.",
    learningInsight:
      "Masuk ke bangunan kokoh dan jauhi kaca saat angin kencang.",
    protectionCardIds: ["pohon-penahan-angin"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 5,
    specialEffect: "damage-one-card",
    visualAssetKey: "event-cuaca-rancaekek",
    motionPreset: "wind-sweep",
  },
  {
    id: "event-cuaca-jateng-2022",
    disasterId: "cuaca-ekstrem",
    title: "Puting Beliung Jawa Tengah 2022",
    factSummary:
      "Serangkaian angin kencang di musim pancaroba berdampak pada beberapa kabupaten.",
    learningInsight:
      "Pantau peringatan cuaca dan amankan benda luar rumah sebelum badai.",
    protectionCardIds: ["pohon-penahan-angin"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 5,
    specialEffect: "move-unprotected-back",
    visualAssetKey: "event-cuaca-jateng",
    motionPreset: "wind-sweep",
  },
  {
    id: "event-cuaca-el-nino-2023",
    disasterId: "cuaca-ekstrem",
    title: "Panas Ekstrem 2023",
    factSummary:
      "Periode panas dan kekeringan dapat meningkatkan risiko kebakaran lahan dan gangguan kesehatan.",
    learningInsight:
      "Cuaca ekstrem juga bisa berupa panas panjang dan kekeringan.",
    protectionCardIds: ["pohon-penahan-angin"],
    bonusCardIds: [],
    giliranEvakuasi: 5,
    specialEffect: "pause-nature-card-bonus",
    visualAssetKey: "event-cuaca-el-nino",
    motionPreset: "wind-sweep",
  },
  {
    id: "event-cuaca-bandung-2023",
    disasterId: "cuaca-ekstrem",
    title: "Hujan Es Bandung 2023",
    factSummary:
      "Hujan es dan angin kencang dapat menjatuhkan ranting, atap ringan, atau benda luar ruangan.",
    learningInsight:
      "Saat hujan es dan petir, cari tempat berlindung yang kokoh.",
    protectionCardIds: ["pohon-penahan-angin"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 5,
    specialEffect: "skip-unprotected-turn",
    visualAssetKey: "event-cuaca-bandung",
    motionPreset: "wind-sweep",
  },
  {
    id: "event-cuaca-seroja-ntt-2021",
    disasterId: "cuaca-ekstrem",
    title: "Siklon Tropis Seroja 2021",
    factSummary:
      "Siklon Seroja membawa hujan ekstrem, angin kencang, banjir, dan longsor di NTT.",
    learningInsight:
      "Cuaca ekstrem dapat memicu bahaya gabungan, jadi peringatan dini perlu dipantau.",
    protectionCardIds: ["pohon-penahan-angin", "tanggul"],
    bonusCardIds: ["escape-route"],
    giliranEvakuasi: 5,
    specialEffect: "damage-all-non-wind-cards",
    visualAssetKey: "event-cuaca-seroja",
    motionPreset: "wind-sweep",
  },
] satisfies BoardGameEventCard[];
