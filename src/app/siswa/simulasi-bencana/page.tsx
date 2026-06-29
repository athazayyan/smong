"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves,
  Activity,
  Droplet,
  Flame,
  Wind,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  MapPin,
  Clock,
  Users,
  Building2,
  Trees,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type DisasterType = "tsunami" | "gempa" | "banjir" | "kebakaran" | "cuaca";

interface SimulationResults {
  casualties: number;
  damagePercent: number;
  evacuationTime: number;
  affectedArea: number;
  mitigationEffectiveness: number;
  riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis";
  reasoning: {
    casualties: string;
    damage: string;
    evacuation: string;
    area: string;
    mitigation: string;
  };
}

// ─────────────────────────────────────────────────────────────
// BASELINE DATA — Sourced from real Indonesian disaster data
// ─────────────────────────────────────────────────────────────

/**
 * Tsunami baseline: derived from Indian Ocean Tsunami 2004 (Aceh),
 * Palu 2018, and Mentawai 2010 data from BNPB & NOAA.
 *
 * References:
 * - BNPB (2004): ~170.000 korban dari ~1.2 juta populasi terdampak (14% mortality rate)
 * - Danielsen et al. (2005), Science: mangrove reduces tsunami wave energy by ~30%
 * - JICA Vertical Shelter Study (2012): shelter access reduces fatalities by ~65%
 * - NOAA PMEL: wave height vs inundation power-law correlation
 */
const TSUNAMI_BASELINE = {
  populationExposed: { rendah: 2_500, sedang: 8_000, tinggi: 25_000 },
  mortalityRateNoMitigation: 0.14,
  mangroveReductionFactor: { sedikit: 0.0, sedang: 0.18, banyak: 0.30 },
  escBuildingReductionFactor: 0.65,
  waveHeightDamageCurve: (h: number) => Math.min(1, Math.pow(h / 15, 1.4)),
  magAreaFactor: (mag: number, waveH: number) =>
    Math.round(((mag - 6.5) * 3.2 + waveH * 1.6) * 10) / 10,
  evacSpeedKmPerMin: 0.08,
  source: "BNPB 2004-2024, NOAA Tsunami Database, Danielsen et al. (2005)",
};

/**
 * Gempa baseline: derived from Yogyakarta 2006 (M6.3, 5.749 deaths),
 * Padang 2009 (M7.6, 1.115 deaths), Lombok 2018, Cianjur 2022.
 *
 * References:
 * - BNPB historical earthquake casualty data 2004-2024
 * - SNI 1726:2019 — Standar perencanaan ketahanan gempa bangunan Indonesia
 * - Coburn & Spence (2002): earthquake casualty estimation methodology
 * - USGS ShakeMap intensity-damage correlation
 */
const GEMPA_BASELINE = {
  populationExposed: { rendah: 3_000, sedang: 12_000, tinggi: 40_000 },
  collapseRateBySoilAndStructure: (
    struct: string,
    soil: string,
    mag: number,
    depth: number
  ) => {
    const structFrag = struct === "sederhana" ? 0.85 : struct === "campuran" ? 0.40 : 0.08;
    const soilAmp = soil === "lunak" ? 1.5 : soil === "sedang" ? 1.0 : 0.6;
    const magIntensity = Math.pow(10, (mag - 5) * 0.5) / Math.sqrt(depth);
    return Math.min(1, structFrag * soilAmp * magIntensity * 0.25);
  },
  trappedMortalityRate: 0.12,
  source: "BNPB 2006-2024, SNI 1726:2019, Coburn & Spence (2002)",
};

/**
 * Banjir baseline: derived from Jakarta floods (2007, 2013, 2020),
 * Semarang, Medan recurring floods.
 *
 * References:
 * - BNPB Banjir Jakarta 2007: 80 korban jiwa, 500.000+ pengungsi
 * - Kementerian PUPR: kapasitas drainase Jakarta analisis
 * - Studi BAPPENAS: RTH menurunkan limpasan 15-30%
 */
const BANJIR_BASELINE = {
  populationAtRisk: 15_000,
  floodDepthModel: (rain: string, drain: string, rth: string, garbage: string, elev: string) => {
    const rainMM = rain === "rendah" ? 15 : rain === "sedang" ? 40 : rain === "tinggi" ? 80 : 150;
    const drainCapacity = drain === "buruk" ? 10 : drain === "kurang" ? 30 : drain === "normal" ? 60 : 90;
    const rthAbsorption = rth === "sedikit" ? 5 : rth === "sedang" ? 20 : 40;
    const garbageBlock = garbage === "tinggi" ? 0.4 : garbage === "sedang" ? 0.15 : 0;
    const elevFactor = elev === "dataran-rendah" ? 1.0 : elev === "lereng" ? 0.4 : 0.05;
    const effectiveRain = rainMM * elevFactor;
    const totalDrain = (drainCapacity * (1 - garbageBlock)) + rthAbsorption;
    return Math.max(0, (effectiveRain - totalDrain) / effectiveRain);
  },
  mortalityPerFloodLevel: 0.003,
  source: "BNPB 2007-2024, PUPR Drainage Study, BAPPENAS RTH Analysis",
};

/**
 * Kebakaran Hutan baseline: Kalimantan & Sumatera 2015, 2019.
 *
 * References:
 * - BNPB 2015: 2.6 juta hektar terbakar, 24 korban jiwa langsung
 * - KLHK Fire Danger Rating System (FDRS)
 * - Canadian Forest Fire Weather Index adapted for Indonesia (BMKG)
 */
const KEBAKARAN_BASELINE = {
  maxAreaHektar: 500,
  fireWeatherIndex: (temp: number, wind: number, humidity: number) => {
    const tempFactor = (temp - 20) / 25;
    const windFactor = wind / 60;
    const droughtFactor = 1 - (humidity - 10) / 80;
    return Math.min(1, (tempFactor * 0.35 + droughtFactor * 0.45 + windFactor * 0.20));
  },
  firebreakEffectiveness: { "tidak-ada": 0, jarang: 0.35, rapat: 0.70 },
  responseEffectiveness: { lambat: 0.05, sedang: 0.35, cepat: 0.75 },
  casualtyRate: 0.008,
  source: "BNPB 2015-2024, KLHK FDRS, BMKG Fire Weather Index",
};

/**
 * Cuaca Ekstrem baseline: Puting Beliung di Jawa & Sulawesi,
 * Siklon Seroja (NTT, 2021).
 *
 * References:
 * - BNPB Siklon Seroja 2021: 181 korban meninggal, 47 kabupaten terdampak
 * - BMKG klasifikasi kecepatan angin Beaufort scale
 * - Studi PUPR: ketahanan atap seng vs beton terhadap tekanan angin
 */
const CUACA_BASELINE = {
  populationExposed: 8_000,
  roofVulnerability: { seng: 0.85, sedang: 0.30, beton: 0.05 },
  warningReduction: 0.80,
  windDamageCurve: (wind: number, duration: number) => {
    const normalized = Math.pow((wind - 40) / 150, 1.6);
    const durationMult = 0.6 + 0.4 * (duration / 12);
    return Math.min(1, normalized * durationMult);
  },
  source: "BNPB Siklon Seroja 2021, BMKG Beaufort Scale, PUPR Wind Study",
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function DisasterSimulatorPage() {
  const [activeDisaster, setActiveDisaster] = useState<DisasterType>("tsunami");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showSources, setShowSources] = useState(false);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Parameter States ---
  // Tsunami
  const [tsunamiMag, setTsunamiMag] = useState<number>(8.5);
  const [tsunamiWaveHeight, setTsunamiWaveHeight] = useState<number>(10);
  const [tsunamiMangrove, setTsunamiMangrove] = useState<string>("sedikit");
  const [tsunamiEscapeBuilding, setTsunamiEscapeBuilding] = useState<boolean>(false);
  const [tsunamiDensity, setTsunamiDensity] = useState<string>("sedang");

  // Gempa
  const [gempaMag, setGempaMag] = useState<number>(7.2);
  const [gempaDepth, setGempaDepth] = useState<number>(20);
  const [gempaStructure, setGempaStructure] = useState<string>("sederhana");
  const [gempaDensity, setGempaDensity] = useState<string>("sedang");
  const [gempaSoil, setGempaSoil] = useState<string>("sedang");

  // Banjir
  const [banjirRain, setBanjirRain] = useState<string>("tinggi");
  const [banjirDrainage, setBanjirDrainage] = useState<string>("kurang");
  const [banjirRth, setBanjirRth] = useState<string>("sedikit");
  const [banjirGarbage, setBanjirGarbage] = useState<string>("tinggi");
  const [banjirElevation, setBanjirElevation] = useState<string>("dataran-rendah");

  // Kebakaran Hutan
  const [kebakaranTemp, setKebakaranTemp] = useState<number>(35);
  const [kebakaranWindSpeed, setKebakaranWindSpeed] = useState<number>(25);
  const [kebakaranHumidity, setKebakaranHumidity] = useState<number>(30);
  const [kebakaranFirebreak, setKebakaranFirebreak] = useState<string>("tidak-ada");
  const [kebakaranResponse, setKebakaranResponse] = useState<string>("lambat");

  // Cuaca Ekstrem
  const [cuacaWind, setCuacaWind] = useState<number>(90);
  const [cuacaDuration, setCuacaDuration] = useState<number>(4);
  const [cuacaRoof, setCuacaRoof] = useState<string>("seng");
  const [cuacaWarning, setCuacaWarning] = useState<boolean>(false);
  const [cuacaTrees, setCuacaTrees] = useState<string>("jarang");

  // Reset simulation when changing disaster type
  useEffect(() => {
    stopSimulation();
    setSimProgress(0);
    setIsPlaying(false);
    setExpandedCards({});
  }, [activeDisaster]);

  // Redraw canvas when anything changes
  useEffect(() => {
    drawSimulation();
  });

  // Toggle reasoning card
  const toggleCard = (key: string) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ─────────────────────────────────────────────────────────────
  // CALCULATION ENGINE with transparent reasoning
  // ─────────────────────────────────────────────────────────────
  const calculateMetrics = (
    type: DisasterType,
    scenario: "current" | "baseline" | "optimal"
  ): SimulationResults => {
    if (type === "tsunami") {
      let mag = tsunamiMag;
      let wave = tsunamiWaveHeight;
      let mangrove = tsunamiMangrove;
      let escape = tsunamiEscapeBuilding;
      let density = tsunamiDensity;

      if (scenario === "baseline") {
        mag = 9.1; wave = 15; mangrove = "sedikit"; escape = false; density = "tinggi";
      } else if (scenario === "optimal") {
        mag = 7.5; wave = 4; mangrove = "banyak"; escape = true; density = "rendah";
      }

      const B = TSUNAMI_BASELINE;
      const pop = B.populationExposed[density as keyof typeof B.populationExposed] || 8_000;
      const waveDamage = B.waveHeightDamageCurve(wave);
      const mangroveReduce = B.mangroveReductionFactor[mangrove as keyof typeof B.mangroveReductionFactor] || 0;
      const escapeReduce = escape ? B.escBuildingReductionFactor : 0;

      // Mortality = populasi × base mortality × wave damage × (1 - mangrove) × (1 - escape)
      const effectiveMortality = B.mortalityRateNoMitigation * waveDamage * (1 - mangroveReduce) * (1 - escapeReduce);
      const casualties = Math.round(pop * effectiveMortality);
      const damagePercent = Math.round(waveDamage * (1 - mangroveReduce * 0.4) * 100);
      const mitigationEffectiveness = Math.round(((mangroveReduce + escapeReduce) / (0.30 + 0.65)) * 100);

      // Evacuation = distance / speed + congestion
      const baseEvac = escape ? 8 : 25;
      const congestion = density === "tinggi" ? 15 : density === "sedang" ? 8 : 3;
      const evacuationTime = Math.round(baseEvac + congestion);

      const affectedArea = B.magAreaFactor(mag, wave);

      const score = casualties + damagePercent * 10;
      const riskLevel = score > 800 ? "Kritis" : score > 450 ? "Tinggi" : score > 120 ? "Sedang" : "Rendah";

      const popLabel = pop.toLocaleString("id-ID");
      const mortalityPct = (B.mortalityRateNoMitigation * 100).toFixed(0);
      const waveDmgPct = (waveDamage * 100).toFixed(0);
      const mangrovePct = (mangroveReduce * 100).toFixed(0);
      const escapePct = escape ? (B.escBuildingReductionFactor * 100).toFixed(0) : "0";

      return {
        casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness,
        riskLevel: riskLevel as SimulationResults["riskLevel"],
        reasoning: {
          casualties: `${popLabel} penduduk di pantai × ${mortalityPct}% angka kematian dasar (data Tsunami Aceh 2004, BNPB) × ${waveDmgPct}% kekuatan gelombang ${wave}m × pengurangan mangrove ${mangrovePct}% × pengurangan gedung evakuasi ${escapePct}% = ${casualties.toLocaleString("id-ID")} orang terdampak.`,
          damage: `Gelombang setinggi ${wave} meter punya daya hancur ${waveDmgPct}% terhadap bangunan biasa (kurva kerusakan NOAA). Pohon bakau mengurangi ${mangrovePct}% dampak → kerusakan akhir ${damagePercent}%.`,
          evacuation: `${escape ? "Dengan gedung evakuasi, warga butuh ~8 menit naik ke lantai atas" : "Tanpa gedung evakuasi, warga harus lari ke bukit (~25 menit)"}. Kepadatan penduduk ${density} menambah ${congestion} menit kemacetan → total ${evacuationTime} menit.`,
          area: `Gempa M${mag.toFixed(1)} + gelombang ${wave}m menyebar ke area ~${affectedArea} km² berdasarkan model inundasi NOAA.`,
          mitigation: `Mangrove (maks 30%) + gedung evakuasi (maks 65%) → kamu sekarang di ${mitigationEffectiveness}% dari perlindungan maksimal.`,
        },
      };
    }

    if (type === "gempa") {
      let mag = gempaMag;
      let depth = gempaDepth;
      let struct = gempaStructure;
      let density = gempaDensity;
      let soil = gempaSoil;

      if (scenario === "baseline") {
        mag = 8.5; depth = 10; struct = "sederhana"; density = "tinggi"; soil = "lunak";
      } else if (scenario === "optimal") {
        mag = 5.5; depth = 80; struct = "tahan-gempa"; density = "rendah"; soil = "keras";
      }

      const B = GEMPA_BASELINE;
      const pop = B.populationExposed[density as keyof typeof B.populationExposed] || 12_000;
      const collapseRate = B.collapseRateBySoilAndStructure(struct, soil, mag, depth);
      const trapped = pop * collapseRate;
      const casualties = Math.round(trapped * B.trappedMortalityRate);
      const damagePercent = Math.round(collapseRate * 100);

      const structLabel = struct === "tahan-gempa" ? "tahan gempa (SNI)" : struct === "campuran" ? "campuran" : "sederhana";
      const soilLabel = soil === "lunak" ? "lunak (amplifikasi 1.5×)" : soil === "sedang" ? "sedang" : "keras (redam getaran)";
      const structMitigation = struct === "tahan-gempa" ? 0.85 : struct === "campuran" ? 0.45 : 0;
      const soilMitigation = soil === "keras" ? 0.35 : soil === "sedang" ? 0.15 : 0;
      const mitigationEffectiveness = Math.round(((structMitigation + soilMitigation) / 1.20) * 100);

      const baseEvac = struct === "tahan-gempa" ? 5 : 18;
      const congestion = density === "tinggi" ? 20 : density === "sedang" ? 10 : 4;
      const evacuationTime = Math.round(baseEvac + congestion);

      const affectedArea = Math.round((Math.pow(10, (mag - 5) * 0.6) / Math.sqrt(depth)) * 10) / 10 + 2;

      const score = casualties + damagePercent * 10;
      const riskLevel = score > 900 ? "Kritis" : score > 500 ? "Tinggi" : score > 150 ? "Sedang" : "Rendah";

      return {
        casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness,
        riskLevel: riskLevel as SimulationResults["riskLevel"],
        reasoning: {
          casualties: `Dari ${pop.toLocaleString("id-ID")} penduduk, M${mag.toFixed(1)} di kedalaman ${depth}km pada tanah ${soilLabel} menyebabkan ${(collapseRate * 100).toFixed(0)}% bangunan ${structLabel} roboh. ${Math.round(trapped).toLocaleString("id-ID")} orang tertimpa × ${(B.trappedMortalityRate * 100).toFixed(0)}% tingkat kematian tertimpa (Coburn & Spence, 2002) = ${casualties.toLocaleString("id-ID")} korban.`,
          damage: `Bangunan ${structLabel} punya tingkat kerentanan ${struct === "sederhana" ? "tinggi (85%)" : struct === "campuran" ? "menengah (40%)" : "rendah (8%)"}. Tanah ${soilLabel} ${soil === "lunak" ? "memperbesar" : "meredam"} getaran. Hasil: ${damagePercent}% bangunan rusak.`,
          evacuation: `Bangunan ${structLabel} ${struct === "tahan-gempa" ? "tidak roboh → evakuasi cepat (5 mnt)" : "berisiko roboh → evakuasi darurat (18 mnt)"}. Kemacetan kepadatan ${density}: +${congestion} menit.`,
          area: `M${mag.toFixed(1)} di kedalaman ${depth}km menyebar getaran kuat ke ~${affectedArea} km² (model USGS ShakeMap).`,
          mitigation: `Struktur ${structLabel} (maks 85% proteksi) + tanah ${soil} (maks 35% redam) → ${mitigationEffectiveness}% efektivitas total (SNI 1726:2019).`,
        },
      };
    }

    if (type === "banjir") {
      let rain = banjirRain;
      let drain = banjirDrainage;
      let rth = banjirRth;
      let garbage = banjirGarbage;
      let elevation = banjirElevation;

      if (scenario === "baseline") {
        rain = "ekstrem"; drain = "buruk"; rth = "sedikit"; garbage = "tinggi"; elevation = "dataran-rendah";
      } else if (scenario === "optimal") {
        rain = "rendah"; drain = "optimal"; rth = "banyak"; garbage = "rendah"; elevation = "dataran-tinggi";
      }

      const B = BANJIR_BASELINE;
      const floodLevel = B.floodDepthModel(rain, drain, rth, garbage, elevation);
      const pop = B.populationAtRisk;
      const casualties = Math.round(pop * floodLevel * B.mortalityPerFloodLevel);
      const damagePercent = Math.round(floodLevel * 100);

      const drainLabel = drain === "buruk" ? "tersumbat" : drain === "kurang" ? "kurang lancar" : drain === "normal" ? "normal" : "optimal";
      const rthLabel = rth === "sedikit" ? "sedikit (banyak beton)" : rth === "sedang" ? "sedang" : "banyak (daerah resapan)";
      const garbageLabel = garbage === "tinggi" ? "banyak sampah" : garbage === "sedang" ? "ada sampah" : "bersih";
      const rainLabel = rain === "rendah" ? "<20mm" : rain === "sedang" ? "20-50mm" : rain === "tinggi" ? "50-100mm" : ">100mm";

      const drainMit = drain === "optimal" ? 0.40 : drain === "normal" ? 0.25 : drain === "kurang" ? 0.10 : 0;
      const rthMit = rth === "banyak" ? 0.30 : rth === "sedang" ? 0.15 : 0;
      const garbageMit = garbage === "rendah" ? 0.30 : garbage === "sedang" ? 0.15 : 0;
      const mitigationEffectiveness = Math.round(((drainMit + rthMit + garbageMit) / 1.0) * 100);

      const evacBase = floodLevel > 0.6 ? 35 : floodLevel > 0.3 ? 20 : 10;
      const drainDelay = drain === "buruk" ? 1.5 : drain === "kurang" ? 1.2 : 1.0;
      const evacuationTime = Math.round(evacBase * drainDelay);

      const affectedArea = Math.round(floodLevel * 45 * 10) / 10;

      const score = casualties + damagePercent * 8;
      const riskLevel = score > 600 ? "Kritis" : score > 350 ? "Tinggi" : score > 100 ? "Sedang" : "Rendah";

      return {
        casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness,
        riskLevel: riskLevel as SimulationResults["riskLevel"],
        reasoning: {
          casualties: `Hujan ${rainLabel}/hari di ${elevation.replace("-", " ")} dengan drainase ${drainLabel} & RTH ${rthLabel} → genangan ${(floodLevel * 100).toFixed(0)}%. Dari ${pop.toLocaleString("id-ID")} warga × 0.3% risiko kematian per level banjir (BNPB Jakarta 2007-2020) = ${casualties.toLocaleString("id-ID")} korban.`,
          damage: `Air hujan ${rainLabel} masuk lebih cepat daripada kemampuan drainase ${drainLabel} mengeluarkan. Sungai ${garbageLabel} ${garbage === "tinggi" ? "menghambat aliran 40%" : ""}. Genangan merendam ${damagePercent}% area.`,
          evacuation: `Level genangan ${(floodLevel * 100).toFixed(0)}% → waktu dasar ${evacBase} mnt. Drainase ${drainLabel} ${drain === "buruk" ? "memperlambat 50%" : ""} → total ${evacuationTime} menit.`,
          area: `Genangan menyebar ke ~${affectedArea} km² berdasarkan proporsi limpasan × topografi wilayah.`,
          mitigation: `Drainase (maks 40%) + RTH (maks 30%) + kebersihan sungai (maks 30%) → total ${mitigationEffectiveness}% perlindungan (PUPR & BAPPENAS).`,
        },
      };
    }

    if (type === "kebakaran") {
      let temp = kebakaranTemp;
      let wind = kebakaranWindSpeed;
      let hum = kebakaranHumidity;
      let fbreak = kebakaranFirebreak;
      let resp = kebakaranResponse;

      if (scenario === "baseline") {
        temp = 42; wind = 50; hum = 12; fbreak = "tidak-ada"; resp = "lambat";
      } else if (scenario === "optimal") {
        temp = 22; wind = 5; hum = 80; fbreak = "rapat"; resp = "cepat";
      }

      const B = KEBAKARAN_BASELINE;
      const fwi = B.fireWeatherIndex(temp, wind, hum);
      const fbreakEff = B.firebreakEffectiveness[fbreak as keyof typeof B.firebreakEffectiveness] || 0;
      const respEff = B.responseEffectiveness[resp as keyof typeof B.responseEffectiveness] || 0.05;

      const spreadFactor = fwi * (1 - fbreakEff) * (1 - respEff);
      const burnedArea = Math.round(B.maxAreaHektar * spreadFactor);
      const damagePercent = Math.round(spreadFactor * 100);
      const casualties = Math.round(burnedArea * B.casualtyRate);
      const mitigationEffectiveness = Math.round(((fbreakEff + respEff) / 1.45) * 100);
      const evacuationTime = Math.round(15 + (wind / 60) * 25 * (1 - respEff * 0.5));
      const affectedArea = Math.round(burnedArea * 0.01 * 10) / 10;

      const score = casualties + damagePercent * 9;
      const riskLevel = score > 700 ? "Kritis" : score > 400 ? "Tinggi" : score > 100 ? "Sedang" : "Rendah";

      return {
        casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness,
        riskLevel: riskLevel as SimulationResults["riskLevel"],
        reasoning: {
          casualties: `Indeks Cuaca Api (FWI): suhu ${temp}°C, kelembapan ${hum}%, angin ${wind}km/h → potensi penyebaran ${(fwi * 100).toFixed(0)}%. Sekat bakar kurangi ${(fbreakEff * 100).toFixed(0)}%, pemadam kurangi ${(respEff * 100).toFixed(0)}% → ${burnedArea} hektar terbakar × 0.8% risiko korban (BNPB Karhutla 2015) = ${casualties} orang.`,
          damage: `FWI ${(fwi * 100).toFixed(0)}% menunjukkan ${fwi > 0.7 ? "bahaya ekstrem" : fwi > 0.4 ? "bahaya tinggi" : "bahaya sedang"}. Setelah mitigasi, ${damagePercent}% area hutan terbakar.`,
          evacuation: `Angin ${wind}km/h mempercepat api → evakuasi ${evacuationTime} menit. Respons ${resp} ${resp === "cepat" ? "memangkas waktu separuh" : "lambat bereaksi"}.`,
          area: `Dari ${B.maxAreaHektar} hektar lahan, ${burnedArea} hektar (${affectedArea} km²) terbakar berdasarkan model KLHK FDRS.`,
          mitigation: `Sekat bakar ${fbreak} (maks 70%) + respon pemadam ${resp} (maks 75%) → total ${mitigationEffectiveness}% proteksi.`,
        },
      };
    }

    // Cuaca Ekstrem
    let wind = cuacaWind;
    let dur = cuacaDuration;
    let roof = cuacaRoof;
    let warn = cuacaWarning;
    let trees = cuacaTrees;

    if (scenario === "baseline") {
      wind = 170; dur = 10; roof = "seng"; warn = false; trees = "jarang";
    } else if (scenario === "optimal") {
      wind = 55; dur = 1; roof = "beton"; warn = true; trees = "rapat";
    }

    const B = CUACA_BASELINE;
    const windDmg = B.windDamageCurve(wind, dur);
    const roofVuln = B.roofVulnerability[roof as keyof typeof B.roofVulnerability] || 0.85;
    const warnReduce = warn ? B.warningReduction : 0;
    const treesReduce = trees === "rapat" ? 0.15 : trees === "cukup" ? 0.08 : 0;

    const damagePercent = Math.round(windDmg * roofVuln * (1 - treesReduce) * 100);
    const casualties = Math.round(B.populationExposed * windDmg * roofVuln * (1 - warnReduce) * 0.02);
    const mitigationEffectiveness = Math.round(((warnReduce * 0.6 + (1 - roofVuln) * 0.3 + treesReduce * 0.1) / 1.0) * 100);
    const evacuationTime = warn ? 10 : 40;
    const affectedArea = Math.round(windDmg * 30 * 10) / 10;

    const score = casualties + damagePercent * 7;
    const riskLevel = score > 600 ? "Kritis" : score > 350 ? "Tinggi" : score > 90 ? "Sedang" : "Rendah";

    return {
      casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness,
      riskLevel: riskLevel as SimulationResults["riskLevel"],
      reasoning: {
        casualties: `Angin ${wind}km/h selama ${dur} jam → daya rusak ${(windDmg * 100).toFixed(0)}%. Atap ${roof} kerentanan ${(roofVuln * 100).toFixed(0)}% (PUPR). ${warn ? "Peringatan dini kurangi 80% korban (BMKG Seroja 2021)." : "Tanpa peringatan dini, warga tidak siap."} Total: ${casualties} korban dari ${B.populationExposed.toLocaleString("id-ID")} penduduk.`,
        damage: `Kecepatan ${wind}km/h ${wind > 120 ? "(setara badai tropis)" : wind > 80 ? "(angin kencang)" : "(angin sedang)"}. Atap ${roof} ${roof === "seng" ? "sangat rentan terbang (85%)" : roof === "sedang" ? "cukup tahan (30%)" : "sangat kuat (5%)"}. Kerusakan: ${damagePercent}%.`,
        evacuation: `${warn ? "Peringatan dini memberi waktu ~10 menit untuk berlindung" : "Tanpa peringatan, warga panik butuh ~40 menit evakuasi"}.`,
        area: `Angin ${wind}km/h menyapu area ~${affectedArea} km² berdasarkan skala Beaufort (BMKG).`,
        mitigation: `Peringatan dini (60%) + kekuatan atap (30%) + pohon pelindung (10%) → ${mitigationEffectiveness}% proteksi total.`,
      },
    };
  };

  const results = calculateMetrics(activeDisaster, "current");
  const baselineResults = calculateMetrics(activeDisaster, "baseline");
  const optimalResults = calculateMetrics(activeDisaster, "optimal");

  // ─────────────────────────────────────────────────────────────
  // NOTEBOOK DOODLE CANVAS RENDERER
  // ─────────────────────────────────────────────────────────────

  // Seeded random for consistent frame-to-frame jitter
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  };

  // Sketchy line helper — gives hand-drawn wobble effect
  const sketchyLine = (
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    seed: number
  ) => {
    const jitter = 2;
    const midX = (x1 + x2) / 2 + (seededRandom(seed) - 0.5) * jitter * 2;
    const midY = (y1 + y2) / 2 + (seededRandom(seed + 1) - 0.5) * jitter * 2;
    ctx.beginPath();
    ctx.moveTo(x1 + (seededRandom(seed + 2) - 0.5) * jitter, y1 + (seededRandom(seed + 3) - 0.5) * jitter);
    ctx.quadraticCurveTo(midX, midY, x2 + (seededRandom(seed + 4) - 0.5) * jitter, y2 + (seededRandom(seed + 5) - 0.5) * jitter);
    ctx.stroke();
  };

  // Sketchy rectangle — hand-drawn box
  const sketchyRect = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    seed: number
  ) => {
    sketchyLine(ctx, x, y, x + w, y, seed);
    sketchyLine(ctx, x + w, y, x + w, y + h, seed + 10);
    sketchyLine(ctx, x + w, y + h, x, y + h, seed + 20);
    sketchyLine(ctx, x, y + h, x, y, seed + 30);
  };

  // Draw a doodle cloud
  const drawCloud = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
    ctx.arc(cx - size * 0.5, cy + size * 0.15, size * 0.45, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.5, cy + size * 0.1, size * 0.5, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.2, cy - size * 0.25, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  // Draw a cute stick figure with emoji-like head
  const drawPerson = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    state: "running" | "safe" | "danger" | "standing",
    t: number,
    seed: number
  ) => {
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // Head circle
    ctx.beginPath();
    ctx.arc(x, y - 14, 5, 0, Math.PI * 2);
    if (state === "danger") {
      ctx.fillStyle = "#FCA5A5";
      ctx.strokeStyle = "#DC2626";
    } else if (state === "safe") {
      ctx.fillStyle = "#BBF7D0";
      ctx.strokeStyle = "#16A34A";
    } else {
      ctx.fillStyle = "#FEF3C7";
      ctx.strokeStyle = "#92400E";
    }
    ctx.fill();
    ctx.stroke();

    // Eyes (dots)
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(x - 1.5, y - 15, 0.8, 0, Math.PI * 2);
    ctx.arc(x + 1.5, y - 15, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (state === "danger") {
      // Open mouth scared
      ctx.arc(x, y - 11.5, 2, 0, Math.PI);
    } else if (state === "safe") {
      // Smile
      ctx.arc(x, y - 13, 2, 0.1 * Math.PI, 0.9 * Math.PI);
    } else {
      // Neutral
      ctx.moveTo(x - 1.5, y - 12);
      ctx.lineTo(x + 1.5, y - 12);
    }
    ctx.stroke();

    // Body
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    if (state === "running") {
      ctx.moveTo(x - 5, y - 5 + Math.sin(t * 12 + seed) * 2);
      ctx.lineTo(x, y - 7);
      ctx.lineTo(x + 5, y - 5 - Math.sin(t * 12 + seed) * 2);
    } else if (state === "danger") {
      // Arms up!
      ctx.moveTo(x - 5, y - 12);
      ctx.lineTo(x, y - 7);
      ctx.lineTo(x + 5, y - 12);
    } else {
      ctx.moveTo(x - 4, y - 4);
      ctx.lineTo(x, y - 7);
      ctx.lineTo(x + 4, y - 4);
    }
    ctx.stroke();

    // Legs
    ctx.beginPath();
    if (state === "running") {
      const legSwing = Math.sin(t * 15 + seed) * 4;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3 + legSwing, y + 8);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 3 - legSwing, y + 8);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + 8);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 3, y + 8);
    }
    ctx.stroke();
  };

  // Draw a doodle house
  const drawHouse = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    roofColor: string,
    wallColor: string,
    damaged: boolean,
    seed: number
  ) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#475569";

    // Wall
    ctx.fillStyle = damaged ? "#FECACA" : wallColor;
    ctx.fillRect(x, y, w, h);
    sketchyRect(ctx, x, y, w, h, seed);

    // Roof
    ctx.fillStyle = damaged ? "#991B1B" : roofColor;
    ctx.beginPath();
    const roofPeak = y - h * 0.45;
    ctx.moveTo(x - 4 + (seededRandom(seed + 40) - 0.5) * 2, y + (seededRandom(seed + 41) - 0.5) * 1);
    ctx.lineTo(x + w / 2 + (seededRandom(seed + 42) - 0.5) * 2, roofPeak + (seededRandom(seed + 43) - 0.5) * 1);
    ctx.lineTo(x + w + 4 + (seededRandom(seed + 44) - 0.5) * 2, y + (seededRandom(seed + 45) - 0.5) * 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Window
    if (w > 15) {
      ctx.fillStyle = damaged ? "#FCA5A5" : "#BFDBFE";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      const winW = Math.min(w * 0.3, 10);
      const winH = Math.min(h * 0.35, 10);
      ctx.fillRect(x + w / 2 - winW / 2, y + h * 0.25, winW, winH);
      sketchyRect(ctx, x + w / 2 - winW / 2, y + h * 0.25, winW, winH, seed + 50);

      // Window cross
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h * 0.25);
      ctx.lineTo(x + w / 2, y + h * 0.25 + winH);
      ctx.moveTo(x + w / 2 - winW / 2, y + h * 0.25 + winH / 2);
      ctx.lineTo(x + w / 2 + winW / 2, y + h * 0.25 + winH / 2);
      ctx.stroke();
    }

    // Door
    ctx.fillStyle = damaged ? "#7F1D1D" : "#92400E";
    const doorW = Math.min(w * 0.25, 8);
    const doorH = h * 0.5;
    ctx.fillRect(x + w / 2 - doorW / 2, y + h - doorH, doorW, doorH);

    // Damage cracks
    if (damaged) {
      ctx.strokeStyle = "#450A0A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.3, y + h * 0.2);
      ctx.lineTo(x + w * 0.5, y + h * 0.5);
      ctx.lineTo(x + w * 0.4, y + h * 0.8);
      ctx.stroke();
    }
  };

  // Draw a doodle tree (mangrove / regular)
  const drawTree = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    type: "mangrove" | "pine" | "palm",
    seed: number,
    burnt?: boolean
  ) => {
    ctx.lineWidth = 2;

    // Trunk
    ctx.strokeStyle = burnt ? "#1E293B" : "#78350F";
    ctx.fillStyle = burnt ? "#1E293B" : "#78350F";
    ctx.fillRect(x - 2, y - 12, 4, 14);

    if (burnt) {
      // Charred stub
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.arc(x, y - 14, 5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (type === "mangrove") {
      // Roots
      ctx.strokeStyle = "#78350F";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 2);
      ctx.quadraticCurveTo(x - 3, y - 3, x, y - 2);
      ctx.moveTo(x + 6, y + 2);
      ctx.quadraticCurveTo(x + 3, y - 3, x, y - 2);
      ctx.stroke();

      // Canopy (multiple circles)
      ctx.fillStyle = "#15803D";
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y - 18, 7 + seededRandom(seed) * 2, 0, Math.PI * 2);
      ctx.arc(x - 5, y - 14, 5, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 14, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === "pine") {
      // Triangle pine
      ctx.fillStyle = "#166534";
      ctx.strokeStyle = "#14532D";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 26 + (seededRandom(seed) - 0.5) * 2);
      ctx.lineTo(x - 8 + (seededRandom(seed + 1) - 0.5) * 2, y - 10);
      ctx.lineTo(x + 8 + (seededRandom(seed + 2) - 0.5) * 2, y - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Palm tree
      ctx.fillStyle = "#22C55E";
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.ellipse(
          x + Math.cos(angle) * 8,
          y - 20 + Math.sin(angle) * 4,
          10, 3,
          angle + Math.PI / 4, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  // Draw notebook paper background
  const drawNotebookBg = (ctx: CanvasRenderingContext2D, w: number, h: number, tint?: string) => {
    // Paper color
    ctx.fillStyle = tint || "#FFFEF7";
    ctx.fillRect(0, 0, w, h);

    // Horizontal lines (like a notebook)
    ctx.strokeStyle = "rgba(186, 210, 240, 0.35)";
    ctx.lineWidth = 1;
    for (let y = 25; y < h; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Left margin line (red)
    ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, h);
    ctx.stroke();
  };

  // Draw grass tufts
  const drawGrass = (ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) => {
    ctx.strokeStyle = "#22C55E";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 3, y);
      ctx.quadraticCurveTo(
        x + i * 3 + (seededRandom(seed + i) - 0.5) * 4,
        y - 6 - seededRandom(seed + i + 10) * 4,
        x + i * 3 + (seededRandom(seed + i + 5) - 0.5) * 3,
        y - 8 - seededRandom(seed + i + 20) * 3
      );
      ctx.stroke();
    }
  };

  // ─── MAIN DRAW ───────────────────────────────────────────────
  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const t = simProgress / 100;

    // === NOTEBOOK PAPER BACKGROUND ===
    let tint = "#FFFEF7";
    if (activeDisaster === "kebakaran") tint = "#FFF8F0";
    else if (activeDisaster === "cuaca") tint = "#F5F5FA";
    else if (activeDisaster === "banjir") tint = "#F5FAFF";
    drawNotebookBg(ctx, W, H, tint);

    // Ground
    const groundY = 230;
    ctx.fillStyle = "#E8DFC9";
    ctx.strokeStyle = "#C4B99A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    // Wavy ground line (hand-drawn)
    for (let gx = 0; gx <= W; gx += 20) {
      ctx.lineTo(gx, groundY + Math.sin(gx * 0.03 + 1) * 3 + (seededRandom(gx) - 0.5) * 2);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Grass tufts
    for (let gx = 60; gx < W - 20; gx += 35) {
      drawGrass(ctx, gx, groundY - 1, gx * 7);
    }

    // Clouds
    drawCloud(ctx, 120, 55, 22);
    drawCloud(ctx, 340, 40, 18);
    drawCloud(ctx, 520, 65, 20);

    // ════════════════════════════════════════════
    // 1. TSUNAMI SCENE
    // ════════════════════════════════════════════
    if (activeDisaster === "tsunami") {
      // Mangrove trees
      const mangroveCount = tsunamiMangrove === "sedikit" ? 2 : tsunamiMangrove === "sedang" ? 5 : 10;
      for (let i = 0; i < mangroveCount; i++) {
        drawTree(ctx, 90 + i * 22, groundY, "mangrove", i * 100);
      }

      // Houses
      const housePositions = [
        { x: 350, y: groundY - 28, w: 35, h: 28 },
        { x: 420, y: groundY - 24, w: 30, h: 24 },
      ];
      housePositions.forEach((hp, i) => {
        const hitTime = 0.45 + i * 0.15;
        const isDamaged = t > hitTime && tsunamiMangrove !== "banyak";
        let drawY = hp.y;
        if (isDamaged) {
          drawY += Math.sin((t - hitTime) * 8) * 4;
        }
        drawHouse(ctx, hp.x, drawY, hp.w, hp.h, "#DC2626", "#FDE68A", isDamaged, i * 200);
      });

      // Escape Building
      if (tsunamiEscapeBuilding) {
        ctx.fillStyle = "#94A3B8";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.fillRect(500, groundY - 85, 55, 85);
        sketchyRect(ctx, 500, groundY - 85, 55, 85, 500);

        // Green rooftop
        ctx.fillStyle = "#22C55E";
        ctx.fillRect(498, groundY - 88, 59, 5);

        // Windows
        ctx.fillStyle = "#BFDBFE";
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 3; c++) {
            ctx.fillRect(507 + c * 14, groundY - 80 + r * 18, 8, 10);
          }
        }

        // Flag
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(525, groundY - 100, 2, 15);
        ctx.beginPath();
        ctx.moveTo(527, groundY - 100);
        ctx.lineTo(540, groundY - 95);
        ctx.lineTo(527, groundY - 90);
        ctx.fill();

        // Label
        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 7px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SHELTER", 527, groundY - 55);
        ctx.textAlign = "start";
      }

      // People
      const popCount = tsunamiDensity === "rendah" ? 4 : tsunamiDensity === "sedang" ? 8 : 16;
      const waveX = t * (W + 50);
      for (let i = 0; i < popCount; i++) {
        let px = 280 + i * 18;
        let py = groundY - 8;
        let state: "running" | "safe" | "danger" | "standing" = "standing";

        if (t > 0.1) {
          // Running
          px += t * 120;
          state = "running";
        }

        if (waveX > px) {
          if (tsunamiEscapeBuilding && i % 3 === 0) {
            px = 505 + (i % 3) * 14;
            py = groundY - 95;
            state = "safe";
          } else if (tsunamiMangrove === "banyak" && i % 4 === 0) {
            px = 180 + (i % 2) * 15;
            py = groundY - 8;
            state = "safe";
          } else {
            state = "danger";
            py = groundY - 15 - Math.sin(t * 5) * 6;
          }
        }

        drawPerson(ctx, px, py, state, t, i * 50);
      }

      // TSUNAMI WAVE
      const maxWaveH = tsunamiWaveHeight * 5.5;
      let waveReduction = 1.0;
      if (tsunamiMangrove === "sedang") waveReduction = 0.8;
      if (tsunamiMangrove === "banyak") waveReduction = 0.55;

      const waveFront = t * (W + 100);

      // Water body
      ctx.fillStyle = "rgba(14, 165, 233, 0.75)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, groundY - maxWaveH);
      // Curving wave
      ctx.bezierCurveTo(
        waveFront * 0.3, groundY - maxWaveH,
        waveFront * 0.7, groundY - maxWaveH * waveReduction,
        Math.min(waveFront, W), groundY
      );
      ctx.lineTo(Math.min(waveFront, W), H);
      ctx.closePath();
      ctx.fill();

      // Wave crest (white foam) — sketchy
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const foamX = Math.min(waveFront, W);
      ctx.moveTo(foamX, groundY);
      for (let fx = foamX; fx > foamX - 60 && fx > 0; fx -= 5) {
        ctx.lineTo(
          fx,
          groundY - maxWaveH * waveReduction * (1 - (foamX - fx) / 60) + (seededRandom(fx * 3) - 0.5) * 6
        );
      }
      ctx.stroke();

      // Wave curl detail
      if (waveFront > 20) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(foamX - 5, groundY - maxWaveH * waveReduction * 0.7, 12, -Math.PI * 0.3, Math.PI * 0.8);
        ctx.stroke();
      }
    }

    // ════════════════════════════════════════════
    // 2. GEMPA SCENE
    // ════════════════════════════════════════════
    else if (activeDisaster === "gempa") {
      ctx.save();

      // Shaking
      if (isPlaying && t > 0.1 && t < 0.9) {
        const shakeAmp = (gempaMag - 4) * 2.5 * (80 / gempaDepth);
        ctx.translate(
          Math.sin(t * 120) * shakeAmp * (seededRandom(Math.floor(t * 60)) - 0.5),
          Math.cos(t * 80) * shakeAmp * 0.5 * (seededRandom(Math.floor(t * 60) + 1) - 0.5)
        );
      }

      // Ground cracks
      if (t > 0.25) {
        ctx.strokeStyle = "#451A03";
        ctx.lineWidth = 2 + (gempaMag > 7.5 ? 2 : 0);
        ctx.beginPath();
        ctx.moveTo(80, groundY);
        ctx.lineTo(140 + t * 30, groundY - 3 + Math.sin(t * 8) * 5);
        ctx.lineTo(220 + t * 60, groundY + 2 - Math.cos(t * 6) * 4);
        ctx.lineTo(350 + t * 120, groundY - 2 + Math.sin(t * 10) * 6);
        ctx.lineTo(500 + t * 80, groundY + 1);
        ctx.stroke();
      }

      // Buildings (3 types)
      const buildings = [
        { x: 100, w: 50, h: 70, type: gempaStructure, color: gempaStructure === "sederhana" ? "#F87171" : "#FB923C" },
        { x: 240, w: 60, h: 90, type: "campuran", color: "#FBBF24" },
        { x: 400, w: 70, h: 110, type: "tahan-gempa", color: "#34D399" },
      ];

      buildings.forEach((b, i) => {
        const isTahanGempa = b.type === "tahan-gempa";
        const isSederhana = b.type === "sederhana";
        const isCollapsed = !isTahanGempa && t > 0.5 && gempaMag > 6.5;

        if (isCollapsed) {
          // Rubble pile
          ctx.fillStyle = "#7F1D1D";
          ctx.beginPath();
          ctx.moveTo(b.x - 10, groundY);
          ctx.lineTo(b.x + b.w / 2, groundY - b.h * 0.3);
          ctx.lineTo(b.x + b.w + 10, groundY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#450A0A";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Dust clouds
          ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
          ctx.beginPath();
          ctx.arc(b.x + b.w / 2, groundY - b.h * 0.3 - 10, 18, 0, Math.PI * 2);
          ctx.arc(b.x + b.w / 2 - 15, groundY - b.h * 0.2, 14, 0, Math.PI * 2);
          ctx.arc(b.x + b.w / 2 + 15, groundY - b.h * 0.2, 14, 0, Math.PI * 2);
          ctx.fill();

          // Label
          ctx.fillStyle = "#DC2626";
          ctx.font = "bold 8px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("ROBOH!", b.x + b.w / 2, groundY - b.h * 0.3 - 30);
          ctx.textAlign = "start";
        } else {
          // Standing building
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          sketchyRect(ctx, b.x, groundY - b.h, b.w, b.h, i * 300);

          // Top bar
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(b.x, groundY - b.h, b.w, 4);

          // Windows
          ctx.fillStyle = "#FFF";
          const rows = Math.floor(b.h / 28);
          const cols = Math.floor(b.w / 18);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              ctx.fillRect(b.x + 6 + c * 16, groundY - b.h + 12 + r * 24, 9, 12);
            }
          }

          // Cracks on simple buildings
          if (isSederhana && t > 0.35 && gempaMag > 5.5) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(b.x + b.w * 0.3, groundY - b.h * 0.6);
            ctx.lineTo(b.x + b.w * 0.5, groundY - b.h * 0.3);
            ctx.lineTo(b.x + b.w * 0.35, groundY - b.h * 0.1);
            ctx.stroke();
          }

          // Label
          ctx.fillStyle = "#1E293B";
          ctx.font = "bold 7px sans-serif";
          ctx.textAlign = "center";
          const label = isTahanGempa ? "TAHAN GEMPA" : isSederhana ? "SEDERHANA" : "CAMPURAN";
          ctx.fillText(label, b.x + b.w / 2, groundY + 14);
          ctx.textAlign = "start";
        }
      });

      // People
      const popCount = gempaDensity === "rendah" ? 4 : gempaDensity === "sedang" ? 10 : 18;
      for (let i = 0; i < popCount; i++) {
        let px = 70 + i * 28;
        let py = groundY - 8;
        let state: "running" | "safe" | "danger" | "standing" = "standing";

        if (t > 0.15) state = "running";
        if (t > 0.5 && px > 80 && px < 170 && gempaMag > 6.8) {
          state = "danger";
        }
        if (t > 0.3 && px > 380) {
          state = "safe";
        }

        drawPerson(ctx, px, py, state, t, i * 70);
      }

      ctx.restore();
    }

    // ════════════════════════════════════════════
    // 3. BANJIR SCENE
    // ════════════════════════════════════════════
    else if (activeDisaster === "banjir") {
      // Rain
      const rainIntensity = banjirRain === "rendah" ? 15 : banjirRain === "sedang" ? 40 : banjirRain === "tinggi" ? 80 : 150;
      ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
      ctx.lineWidth = 1;
      for (let i = 0; i < rainIntensity; i++) {
        const rx = seededRandom(i * 31) * W;
        const ry = ((i * 28 + (isPlaying ? t * 350 : 0)) % (H - 20));
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 1.5, ry + 12);
        ctx.stroke();
      }

      // River (left)
      ctx.fillStyle = "#0284C7";
      ctx.fillRect(0, groundY - 30, 70, H - groundY + 30);

      // Drain pipe
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(70, groundY - 15, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Garbage in drain
      if (banjirGarbage === "tinggi" || banjirGarbage === "sedang") {
        ctx.fillStyle = "#A16207";
        const garbageCount = banjirGarbage === "tinggi" ? 5 : 2;
        for (let g = 0; g < garbageCount; g++) {
          ctx.fillRect(62 + seededRandom(g * 7) * 16, groundY - 22 + g * 5, 6 + seededRandom(g * 11) * 4, 5);
        }
      }

      // Green space (RTH)
      const greenWidth = banjirRth === "sedikit" ? 30 : banjirRth === "sedang" ? 100 : 200;
      ctx.fillStyle = "rgba(34, 197, 94, 0.4)";
      ctx.fillRect(75, groundY - 6, greenWidth, 6);
      ctx.fillStyle = "#22C55E";
      ctx.font = "bold 7px sans-serif";
      ctx.fillText("RTH", 80, groundY - 8);

      // Houses
      const houseXPositions = [200, 340, 480];
      const floodH = results.damagePercent * 0.55;
      const currentFlood = isPlaying ? t * floodH : floodH;

      houseXPositions.forEach((hx, i) => {
        drawHouse(ctx, hx, groundY - 25, 35, 25, "#EA580C", "#FDE68A", currentFlood > 15, i * 150);
      });

      // People on roofs
      const popCount = 6;
      for (let i = 0; i < popCount; i++) {
        let px = 150 + i * 55;
        let py = groundY - 8;
        let state: "running" | "safe" | "danger" | "standing" = "standing";

        if (currentFlood > 8) {
          // Climb to roof
          const houseIdx = Math.floor(i / 2);
          px = houseXPositions[Math.min(houseIdx, 2)] + 10 + (i % 2) * 12;
          py = groundY - 32;
          state = currentFlood > 15 ? "danger" : "safe";
        }

        drawPerson(ctx, px, py, state, t, i * 90);
      }

      // Flood water
      ctx.fillStyle = "rgba(14, 165, 233, 0.6)";
      ctx.fillRect(0, groundY - currentFlood, W, H - groundY + currentFlood);

      // Waves on surface
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let wx = 0; wx < W; wx += 15) {
        const wy = groundY - currentFlood + Math.sin((isPlaying ? t : 1) * 8 + wx * 0.08) * 2;
        if (wx === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }

    // ════════════════════════════════════════════
    // 4. KEBAKARAN SCENE
    // ════════════════════════════════════════════
    else if (activeDisaster === "kebakaran") {
      // Tree grid
      const rows = 3;
      const cols = 14;
      const cellW = 38;
      const cellH = 30;

      const firebreakCol = kebakaranFirebreak === "tidak-ada" ? -1 : kebakaranFirebreak === "jarang" ? 7 : 6;
      const isFirebreakRapat = kebakaranFirebreak === "rapat";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tx = 55 + c * cellW + (r % 2) * 10;
          const ty = 135 + r * cellH;

          // Firebreak path
          if (c === firebreakCol || (isFirebreakRapat && (c === 5 || c === 10))) {
            ctx.fillStyle = "#D4A76A";
            ctx.fillRect(tx - 2, ty - 20, cellW - 4, cellH + 8);
            // Label
            if (r === 0) {
              ctx.fillStyle = "#92400E";
              ctx.font = "bold 6px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("SEKAT", tx + cellW / 2 - 2, ty - 22);
              ctx.textAlign = "start";
            }
            continue;
          }

          // Fire spread
          const maxSpreadCol = Math.round(results.damagePercent / 7);
          let isBurnt = false;
          let isOnFire = false;

          if (isPlaying) {
            const currentSpread = t * maxSpreadCol;
            if (c < currentSpread) {
              isBurnt = currentSpread - c > 1.5;
              isOnFire = !isBurnt;
            }
          } else {
            if (c < maxSpreadCol - 1) isBurnt = true;
            else if (c === maxSpreadCol - 1) isOnFire = true;
          }

          // Fire stopped by response
          if (isOnFire && kebakaranResponse === "cepat" && c > 3 && t > 0.3) {
            isOnFire = false;
            isBurnt = true;
            // Water spray
            ctx.strokeStyle = "#38BDF8";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tx + 30, ty - 15);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }

          drawTree(ctx, tx + 8, ty, "pine", c * 100 + r * 50, isBurnt);

          // Fire animation on burning trees
          if (isOnFire) {
            ctx.fillStyle = "#EF4444";
            ctx.beginPath();
            ctx.moveTo(tx + 4, ty - 14);
            ctx.lineTo(tx + 8, ty - 30 + Math.sin(t * 60 + c) * 4);
            ctx.lineTo(tx + 12, ty - 14);
            ctx.closePath();
            ctx.fill();

            // Sparks
            ctx.fillStyle = "#FCD34D";
            ctx.beginPath();
            ctx.arc(tx + 8 + Math.sin(t * 40 + c * 3) * 5, ty - 28 - seededRandom(c) * 8, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Wind particles
      if (kebakaranWindSpeed > 10) {
        ctx.strokeStyle = "rgba(251, 146, 60, 0.25)";
        ctx.lineWidth = 1.5;
        const windCount = Math.round(kebakaranWindSpeed / 5);
        for (let i = 0; i < windCount; i++) {
          const wx = (i * 50 + t * 400) % W;
          const wy = 80 + (i % 4) * 35;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + 25, wy + 1);
          ctx.stroke();
        }
      }

      // Smoke
      if (t > 0.1) {
        ctx.fillStyle = "rgba(100, 116, 139, 0.15)";
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          ctx.arc(
            100 + t * 150 + s * 40,
            80 - t * 30 - s * 10,
            15 + s * 5 + t * 10,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // ════════════════════════════════════════════
    // 5. CUACA EKSTREM SCENE
    // ════════════════════════════════════════════
    else {
      // Dark sky overlay
      ctx.fillStyle = "rgba(71, 85, 105, 0.2)";
      ctx.fillRect(0, 0, W, groundY);

      // Wind streaks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const wx = (i * 80 + t * cuacaWind * 3) % W;
        const wy = 30 + (i % 5) * 40;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 40, wy);
        ctx.stroke();
      }

      // Bending trees
      const treeCount = cuacaTrees === "jarang" ? 2 : cuacaTrees === "cukup" ? 5 : 8;
      for (let i = 0; i < treeCount; i++) {
        const tx = 80 + i * 55;
        ctx.save();
        ctx.translate(tx, groundY);
        ctx.rotate((cuacaWind / 180 * 18 * Math.PI) / 180);
        ctx.translate(-tx, -groundY);
        drawTree(ctx, tx, groundY, "palm", i * 120);
        ctx.restore();
      }

      // Houses with flying roofs
      const housePositions = [{ x: 220, y: groundY - 30 }, { x: 420, y: groundY - 30 }];
      const isWeakRoof = cuacaRoof === "seng";

      housePositions.forEach((hp, i) => {
        // Wall
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(hp.x, hp.y, 45, 30);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        sketchyRect(ctx, hp.x, hp.y, 45, 30, i * 400);

        // Door
        ctx.fillStyle = "#334155";
        ctx.fillRect(hp.x + 17, hp.y + 12, 11, 18);

        // Roof
        ctx.save();
        if (isPlaying && t > 0.4 && isWeakRoof) {
          const rp = (t - 0.4) / 0.6;
          ctx.translate(hp.x + 22 + rp * 120, hp.y - 5 - rp * 90);
          ctx.rotate(rp * 0.8);
          ctx.fillStyle = "#94A3B8";
          ctx.beginPath();
          ctx.moveTo(-25, 0);
          ctx.lineTo(0, -18);
          ctx.lineTo(25, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#475569";
          ctx.stroke();
        } else {
          ctx.fillStyle = cuacaRoof === "beton" ? "#475569" : cuacaRoof === "sedang" ? "#EA580C" : "#94A3B8";
          ctx.beginPath();
          ctx.moveTo(hp.x - 5, hp.y);
          ctx.lineTo(hp.x + 22, hp.y - 18);
          ctx.lineTo(hp.x + 50, hp.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      });

      // Warning tower
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(340, groundY);
      ctx.lineTo(340, groundY - 60);
      ctx.moveTo(330, groundY);
      ctx.lineTo(340, groundY - 30);
      ctx.moveTo(350, groundY);
      ctx.lineTo(340, groundY - 30);
      ctx.stroke();

      // Speaker
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.arc(340, groundY - 60, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(340, groundY - 60);
      ctx.lineTo(350, groundY - 65);
      ctx.lineTo(350, groundY - 55);
      ctx.closePath();
      ctx.fill();

      if (cuacaWarning) {
        // Sound waves
        const flash = isPlaying && Math.floor(t * 12) % 2 === 0;
        ctx.strokeStyle = flash ? "#EF4444" : "#EAB308";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(353, groundY - 60, 8, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(353, groundY - 60, 14, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }

      // Tornado funnel
      if (isPlaying || cuacaWind > 100) {
        const tx = isPlaying ? 50 + t * 450 : 300;
        ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
        ctx.beginPath();
        ctx.moveTo(tx - 30, 50);
        ctx.bezierCurveTo(tx - 25, 100, tx - 8, 150, tx - 4, groundY - 10);
        ctx.lineTo(tx + 4, groundY - 10);
        ctx.bezierCurveTo(tx + 8, 150, tx + 25, 100, tx + 30, 50);
        ctx.closePath();
        ctx.fill();

        // Top cloud
        ctx.beginPath();
        ctx.ellipse(tx, 50, 35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // People
      for (let i = 0; i < 5; i++) {
        let px = 150 + i * 70;
        let py = groundY - 8;
        let state: "running" | "safe" | "danger" | "standing" = "standing";

        if (cuacaWarning) state = "running";
        if (isPlaying && t > 0.3 && !cuacaWarning) state = "danger";
        if (cuacaWarning && t > 0.3) state = "safe";

        drawPerson(ctx, px, py, state, t, i * 60);
      }
    }

    // ═══════ HEATMAP OVERLAY ═══════
    if (showHeatmap) {
      const cellW2 = W / 10;
      const cellH2 = H / 5;

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) {
          let localRisk = 0;

          if (activeDisaster === "tsunami") {
            const dist = 1 - c / 10;
            const magB = (tsunamiMag - 7) / 2.5;
            const waveB = tsunamiWaveHeight / 20;
            const prot = (tsunamiMangrove === "banyak" ? 0.35 : tsunamiMangrove === "sedang" ? 0.18 : 0) +
                         (tsunamiEscapeBuilding && c >= 8 ? 0.6 : 0);
            localRisk = Math.max(0, Math.min(1, (dist * 0.8 + magB * 0.1 + waveB * 0.1) - prot));
          } else if (activeDisaster === "gempa") {
            const dist = Math.abs(c - 4) / 5;
            const mf = (gempaMag - 5) / 4;
            const sf = gempaSoil === "lunak" ? 0.3 : gempaSoil === "sedang" ? 0.1 : 0;
            const sb = gempaStructure === "tahan-gempa" ? 0.4 : 0;
            localRisk = Math.max(0, Math.min(1, ((1 - dist) * 0.7 + mf * 0.3 + sf) - sb));
          } else if (activeDisaster === "banjir") {
            const bf = r / 5;
            const rf = banjirRain === "ekstrem" ? 0.8 : banjirRain === "tinggi" ? 0.6 : 0.3;
            const eb = banjirElevation === "dataran-tinggi" ? 0.5 : banjirElevation === "lereng" ? 0.25 : 0;
            const dr = (banjirDrainage === "optimal" ? 0.4 : banjirDrainage === "normal" ? 0.2 : 0) +
                       (banjirRth === "banyak" ? 0.2 : 0);
            localRisk = Math.max(0, Math.min(1, (bf * 0.5 + rf * 0.5 - eb) - dr));
          } else if (activeDisaster === "kebakaran") {
            const ps = results.damagePercent / 100;
            const wi = (kebakaranWindSpeed / 60) * 0.2;
            const fp = kebakaranFirebreak === "rapat" && c > 5 ? 0.4 : (kebakaranFirebreak === "jarang" && c > 7 ? 0.2 : 0);
            localRisk = Math.max(0, Math.min(1, ((1 - c / 10) * 0.7 + ps * 0.3 + wi) - fp));
          } else {
            const wp = cuacaWarning ? 0.4 : 0;
            const rq = cuacaRoof === "beton" ? 0.4 : cuacaRoof === "sedang" ? 0.1 : 0;
            localRisk = Math.max(0, Math.min(1, ((cuacaWind / 180) * 0.8 + (cuacaDuration / 12) * 0.2) - (wp + rq)));
          }

          let fill = "rgba(34, 197, 94, 0.22)";
          if (localRisk > 0.75) fill = "rgba(239, 68, 68, 0.35)";
          else if (localRisk > 0.45) fill = "rgba(249, 115, 22, 0.30)";
          else if (localRisk > 0.18) fill = "rgba(234, 179, 8, 0.25)";

          ctx.fillStyle = fill;
          ctx.fillRect(c * cellW2, r * cellH2, cellW2 - 1, cellH2 - 1);
        }
      }
    }
  }, [
    activeDisaster, simProgress, showHeatmap, isPlaying,
    tsunamiMag, tsunamiWaveHeight, tsunamiMangrove, tsunamiEscapeBuilding, tsunamiDensity,
    gempaMag, gempaDepth, gempaStructure, gempaDensity, gempaSoil,
    banjirRain, banjirDrainage, banjirRth, banjirGarbage, banjirElevation,
    kebakaranTemp, kebakaranWindSpeed, kebakaranHumidity, kebakaranFirebreak, kebakaranResponse,
    cuacaWind, cuacaDuration, cuacaRoof, cuacaWarning, cuacaTrees,
    results.damagePercent,
  ]);

  // Run simulation animation
  const runSimulation = () => {
    setIsPlaying(true);
    setSimProgress(0);
    const duration = 5000;
    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setSimProgress(progress);
      if (progress < 100) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        setIsPlaying(false);
      }
    };
    animationRef.current = requestAnimationFrame(frame);
  };

  const stopSimulation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  // ─────────────────────────────────────────────────────────────
  // RECOMMENDATION ENGINE — kid-friendly tone
  // ─────────────────────────────────────────────────────────────
  const getMitigationRecommendation = (): { summary: string; tips: string[] } => {
    if (activeDisaster === "tsunami") {
      if (tsunamiMangrove === "banyak" && tsunamiEscapeBuilding) {
        return {
          summary: "Keren banget! 🎉 Pohon bakau yang banyak + gedung evakuasi bikin warga pesisir jauh lebih aman. Gelombang tsunami diperlambat oleh bakau, dan warga bisa naik ke gedung tinggi sebelum air sampai.",
          tips: [
            "Pohon bakau (mangrove) itu kayak tembok alami — akarnya yang kuat bisa memperlambat gelombang tsunami sampai 30%! (Sumber: Danielsen dkk., 2005)",
            "Gedung evakuasi vertikal bisa menyelamatkan sampai 65% warga karena mereka nggak perlu lari jauh, cukup naik ke atas! (Sumber: Studi JICA)",
            "Coba ajak teman-teman ikut simulasi tsunami (tsunami drill) di sekolah — latihan ini penting banget biar nggak panik saat beneran!",
          ],
        };
      } else if (!tsunamiEscapeBuilding && tsunamiMangrove === "sedikit") {
        return {
          summary: "Wah, bahaya banget nih! 😰 Tanpa pohon bakau dan tanpa gedung evakuasi, gelombang tsunami langsung menghantam pemukiman. Nggak ada yang bisa memperlambat atau tempat berlindung.",
          tips: [
            "Langkah pertama: tanam pohon bakau! Walau kecil, bakau yang tumbuh bisa jadi pelindung alami dalam beberapa tahun. Setiap pohon berarti!",
            "Minta pemerintah desa/kecamatan untuk bikin jalur evakuasi yang jelas + rambu arah ke bukit atau gedung tinggi terdekat.",
            "Kalau tinggal di pantai, selalu ingat: kalau laut tiba-tiba surut jauh, itu tanda tsunami! Segera lari ke tempat tinggi!",
          ],
        };
      } else {
        return {
          summary: "Lumayan, tapi masih bisa ditingkatkan! 🤔 Beberapa perlindungan sudah ada, tapi belum cukup untuk melindungi semua warga.",
          tips: [
            "Tingkatkan jumlah pohon bakau — dari 'sedang' ke 'banyak' bisa menambah perlindungan dari 18% jadi 30%!",
            "Kalau belum ada gedung evakuasi, cari tahu bukit atau bangunan tinggi terdekat yang bisa jadi tempat mengungsi.",
          ],
        };
      }
    }

    if (activeDisaster === "gempa") {
      if (gempaStructure === "tahan-gempa" && gempaSoil === "keras") {
        return {
          summary: "Mantap! 💪 Bangunan tahan gempa di tanah keras itu kombinasi paling aman. Getaran gempa diredam tanah keras, dan bangunan SNI nggak mudah roboh.",
          tips: [
            "Bangunan tahan gempa punya rangka baja/beton khusus yang bisa 'bergoyang' tanpa patah — kayak pohon bambu yang lentur saat angin kencang! (Standar SNI 1726:2019)",
            "Tanah keras itu kayak bantalan kuat — getaran gempa nggak diperbesar. Beda dengan tanah lunak yang bikin getaran makin parah (amplifikasi).",
            "Di rumah, taruh barang berat di bawah dan jangan di atas lemari. Saat gempa, langsung DROP (jongkok), COVER (lindungi kepala), HOLD ON (pegang kuat)!",
          ],
        };
      } else if (gempaStructure === "sederhana" || gempaSoil === "lunak") {
        return {
          summary: "Waduh, ini risiko tinggi! 😟 Bangunan biasa di tanah lunak sangat rentan roboh. Tanah lunak bisa bergerak kayak air (likuifaksi) saat gempa besar.",
          tips: [
            "Minta orang tua cek fondasi rumah — rumah tanpa kolom beton berisiko roboh saat gempa M6+ (Data: Gempa Yogya 2006, 5.749 korban, BNPB).",
            "Kalau tanah di sekitar rumah lembek/berlumpur, hati-hati! Saat gempa, tanah bisa jadi seperti cairan. Ini namanya 'likuifaksi'.",
            "Siapkan tas siaga (emergency kit) berisi air, makanan, obat, senter, dan peluit — taruh di dekat pintu keluar!",
          ],
        };
      } else {
        return {
          summary: "Cukup aman, tapi masih bisa diperbaiki! 🔧 Beberapa bangunan perlu diperkuat agar lebih tahan guncangan.",
          tips: [
            "Ganti bangunan campuran secara bertahap ke struktur beton bertulang standar SNI.",
            "Latih keluarga teknik DROP-COVER-HOLD ON saat guncangan. Jangan lari keluar saat gempa masih berlangsung!",
          ],
        };
      }
    }

    if (activeDisaster === "banjir") {
      if (banjirDrainage === "optimal" && banjirRth === "banyak" && banjirGarbage === "rendah") {
        return {
          summary: "Top markotop! 🌿 Drainase lancar + banyak taman resapan + sungai bersih = air hujan langsung tersalurkan tanpa menggenang!",
          tips: [
            "Taman dan area hijau (RTH) itu kayak spons raksasa — menyerap air hujan langsung ke tanah, jadi nggak mengalir ke jalan! (Studi BAPPENAS)",
            "Sungai yang bersih bisa menampung air 40% lebih banyak daripada yang penuh sampah. Makanya jangan buang sampah ke sungai ya!",
            "Buat biopori di halaman rumah — lubang kecil yang bikin air hujan meresap ke tanah, bukan menggenang di permukaan!",
          ],
        };
      } else {
        return {
          summary: "Awas banjir! 🌧️ Drainase tersumbat dan kurang daerah resapan bikin air cepat naik ke pemukiman.",
          tips: [
            "Mulai dari hal kecil: jangan buang sampah ke selokan! Sampah menyumbat aliran air sampai 40% (Data: PUPR).",
            "Ajak teman-teman kerja bakti bersihkan got/selokan di sekitar sekolah minimal sebulan sekali.",
            "Tinggikan stop kontak dan barang elektronik di rumah — kalau banjir datang, ini bisa menyelamatkan dari kesetrum!",
          ],
        };
      }
    }

    if (activeDisaster === "kebakaran") {
      if (kebakaranFirebreak !== "tidak-ada" && kebakaranResponse === "cepat") {
        return {
          summary: "Berhasil dilokalisir! 🚒 Sekat bakar memutus jalur api, dan tim pemadam yang cepat langsung padamkan titik api awal.",
          tips: [
            "Sekat bakar itu jalur tanah kosong yang memutus 'makanan' api — tanpa ranting dan daun kering, api nggak bisa menyebar! (Metode KLHK)",
            "Waktu respon pemadam itu krusial — kalau datang dalam 30 menit, api bisa dipadamkan sebelum menyebar luas.",
            "Jangan pernah bakar sampah sembarangan di musim kemarau — satu percikan kecil bisa jadi kebakaran besar!",
          ],
        };
      } else {
        return {
          summary: "Api menyebar nggak terkendali! 🔥 Tanpa sekat bakar dan respon lambat, api terus menjalar mengikuti arah angin.",
          tips: [
            "Hutan kering + angin kencang + nggak ada sekat = api bisa menyebar 10× lebih cepat! (Data: Karhutla Kalimantan 2015, BNPB)",
            "Buat jalur sekat bakar minimal lebar 5-10 meter antara hutan dan pemukiman.",
            "Kalau melihat asap atau titik api di hutan, langsung lapor ke 113 (nomor pemadam kebakaran)!",
          ],
        };
      }
    }

    // Cuaca Ekstrem
    if (cuacaWarning && cuacaRoof === "beton") {
      return {
        summary: "Siap siaga! 📢 Peringatan dini + bangunan kokoh = warga punya waktu berlindung sebelum badai menghantam.",
        tips: [
          "Peringatan dini (sirene/SMS dari BMKG) memberi waktu 10-30 menit yang sangat berharga untuk berlindung. Ini bisa mengurangi korban sampai 80%! (Data: Siklon Seroja 2021)",
          "Atap beton bertulang tahan terhadap tekanan angin sampai 200 km/h, sedangkan seng bisa terbang di 80 km/h! (Studi PUPR)",
          "Saat badai berlangsung, jauhi jendela kaca dan berlindung di ruangan tanpa jendela di tengah rumah.",
        ],
      };
    } else {
      return {
        summary: "Berbahaya! 💨 Atap seng mudah terbang diterjang angin kencang, apalagi tanpa peringatan dini — warga nggak sempat berlindung!",
        tips: [
          "Atap seng tanpa penguat bisa terbang saat angin 80+ km/h — pasang baut pengikat ekstra di setiap sambungan! (Standar PUPR)",
          "Minta orang tua install aplikasi BMKG di HP — notifikasi cuaca ekstrem bisa jadi penyelamat jiwa!",
          "Saat badai: jauhi pohon besar, papan reklame, dan tiang listrik. Berlindung di dalam bangunan kokoh!",
        ],
      };
    }
  };

  const recommendation = getMitigationRecommendation();

  // Source data for the methodology section
  const getSourceData = () => {
    const sources: Record<DisasterType, { title: string; items: { name: string; desc: string; ref: string }[] }> = {
      tsunami: {
        title: "Sumber Data Model Tsunami",
        items: [
          { name: "Angka Kematian Dasar (14%)", desc: "Diambil dari perbandingan korban jiwa vs populasi terdampak Tsunami Aceh 2004", ref: "BNPB (Badan Nasional Penanggulangan Bencana), Laporan 2004" },
          { name: "Efek Mangrove (30% peredaman)", desc: "Studi menunjukkan mangrove mengurangi energi gelombang tsunami hingga 30%", ref: "Danielsen et al., The Asian Tsunami: A Protective Role for Coastal Vegetation, Science (2005)" },
          { name: "Efek Gedung Evakuasi (65%)", desc: "Shelter vertikal menyelamatkan ~65% populasi yang mengakses dalam waktu 10 menit", ref: "JICA (Japan International Cooperation Agency), Tsunami Shelter Design Study (2012)" },
          { name: "Kurva Kerusakan Gelombang", desc: "Hubungan power-law antara tinggi gelombang dan tingkat kerusakan bangunan", ref: "NOAA PMEL (Pacific Marine Environmental Laboratory), Tsunami Damage Assessment Methodology" },
        ],
      },
      gempa: {
        title: "Sumber Data Model Gempa Bumi",
        items: [
          { name: "Populasi Referensi", desc: "Berdasarkan kepadatan penduduk wilayah rawan gempa di Indonesia", ref: "BPS (Badan Pusat Statistik) & BNPB Peta Rawan Gempa 2024" },
          { name: "Tingkat Keruntuhan Bangunan", desc: "Model kerentanan bangunan berdasarkan tipe struktur dan kondisi tanah", ref: "Coburn & Spence, Earthquake Protection, Cambridge University Press (2002)" },
          { name: "Standar Bangunan Tahan Gempa", desc: "SNI 1726:2019 mengatur desain bangunan tahan guncangan di Indonesia", ref: "Badan Standardisasi Nasional (BSN), SNI 1726:2019" },
          { name: "Amplifikasi Tanah", desc: "Tanah lunak memperbesar getaran gempa 1.5-2× dibanding tanah keras", ref: "USGS ShakeMap, Site Amplification Methodology" },
        ],
      },
      banjir: {
        title: "Sumber Data Model Banjir",
        items: [
          { name: "Kasus Referensi: Jakarta 2007", desc: "80 korban jiwa, 500.000+ pengungsi dari banjir besar Jakarta", ref: "BNPB Laporan Banjir Jakarta 2007" },
          { name: "Kapasitas Drainase", desc: "Analisis kemampuan sistem drainase kota mengeluarkan air hujan", ref: "Kementerian PUPR, Studi Sistem Drainase Perkotaan" },
          { name: "Pengaruh RTH (15-30%)", desc: "Ruang Terbuka Hijau menyerap air hujan dan mengurangi limpasan permukaan", ref: "BAPPENAS, Studi Pengaruh RTH terhadap Pengendalian Banjir" },
          { name: "Dampak Sampah (40% penyumbatan)", desc: "Sampah di saluran air mengurangi kapasitas tampung hingga 40%", ref: "Kementerian PUPR, Audit Saluran Drainase 2020" },
        ],
      },
      kebakaran: {
        title: "Sumber Data Model Kebakaran Hutan",
        items: [
          { name: "Kasus Referensi: Karhutla 2015", desc: "2.6 juta hektar terbakar, 24 korban jiwa langsung, kerugian triliunan", ref: "BNPB & KLHK (Kementerian Lingkungan Hidup dan Kehutanan) 2015" },
          { name: "Indeks Cuaca Api (FWI)", desc: "Sistem penilaian risiko kebakaran berdasarkan suhu, kelembapan, dan angin", ref: "BMKG Fire Weather Index, adaptasi Canadian Forest FWI" },
          { name: "Efektivitas Sekat Bakar (70%)", desc: "Jalur pemutus api yang terstruktur bisa menghentikan 70% penyebaran", ref: "KLHK, Fire Danger Rating System (FDRS)" },
        ],
      },
      cuaca: {
        title: "Sumber Data Model Cuaca Ekstrem",
        items: [
          { name: "Kasus Referensi: Siklon Seroja 2021", desc: "181 korban meninggal, 47 kabupaten terdampak di NTT", ref: "BNPB Laporan Siklon Tropis Seroja, April 2021" },
          { name: "Kerentanan Atap", desc: "Pengujian daya tahan berbagai jenis atap terhadap tekanan angin", ref: "Kementerian PUPR, Standar Konstruksi Tahan Angin" },
          { name: "Efektivitas Peringatan Dini (80%)", desc: "Sistem peringatan dini mengurangi korban jiwa hingga 80%", ref: "BMKG & BNPB, Evaluasi Sistem Peringatan Dini Seroja" },
          { name: "Skala Beaufort", desc: "Klasifikasi kecepatan angin dan dampaknya terhadap lingkungan", ref: "BMKG, Adaptasi Skala Beaufort untuk Indonesia" },
        ],
      },
    };
    return sources[activeDisaster];
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header — SMP friendly */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-3xl font-black text-ink-900 md:text-4xl flex items-center gap-3">
            <span className="text-4xl"></span>
            Lab Simulasi Bencana
          </h1>
          <p className="mt-2 font-sans text-sm font-medium text-ink-700 md:text-base">
            Geser tombol di bawah untuk lihat apa yang terjadi kalau bencana datang! Setiap angka punya penjelasan ilmiah — klik{" "}
            <span className="inline-flex items-center gap-1 rounded-lg bg-purple-100 px-1.5 py-0.5 text-xs font-black text-purple-700">
              <HelpCircle className="h-3 w-3" /> Kenapa?
            </span>{" "}
            untuk tahu dari mana datanya 
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 font-heading text-sm font-extrabold shadow-sm transition ${
              showHeatmap
                ? "bg-purple-700 text-white border-purple-900"
                : "bg-white text-ink-700 hover:bg-lavender-100/50 border-lavender-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            {showHeatmap ? "Sembunyikan Peta Risiko" : "Tampilkan Peta Risiko "}
          </button>
        </div>
      </div>

      {/* Disaster Selector Tabs */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(
          [
            { id: "tsunami", name: "Tsunami 🌊", icon: Waves, color: "text-sky-600 bg-sky-100 hover:bg-sky-200/50" },
            { id: "gempa", name: "Gempa Bumi 💥", icon: Activity, color: "text-coral-600 bg-coral-50 hover:bg-coral-200/50" },
            { id: "banjir", name: "Banjir 🌧️", icon: Droplet, color: "text-teal-600 bg-teal-100 hover:bg-teal-200/50" },
            { id: "kebakaran", name: "Kebakaran 🔥", icon: Flame, color: "text-amber-600 bg-amber-50 hover:bg-amber-200/50" },
            { id: "cuaca", name: "Cuaca Ekstrem 💨", icon: Wind, color: "text-purple-700 bg-lavender-100 hover:bg-lavender-200/50" },
          ] as const
        ).map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeDisaster === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDisaster(tab.id)}
              className={`flex items-center justify-center gap-2.5 rounded-2xl p-4 font-heading text-sm font-black transition-all ${
                isActive
                  ? "bg-purple-900 text-white shadow-lg scale-102"
                  : `${tab.color} text-ink-700`
              }`}
            >
              <IconComponent className="h-5 w-5 shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Core Interface Workspace */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl border-2 border-lavender-200/60 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b-2 border-lavender-100 pb-3">
              <h2 className="font-heading text-lg font-black text-ink-900 flex items-center gap-2">
                 Atur Kondisi
              </h2>
              <span className="rounded-full bg-lavender-100 px-2.5 py-1 text-xs font-black text-purple-700 uppercase">
                {activeDisaster}
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {/* ── TSUNAMI CONTROLS ── */}
              {activeDisaster === "tsunami" && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="tsunami-mag">Kekuatan Gempa (Magnitudo)</label>
                      <span className="font-black text-purple-700">{tsunamiMag.toFixed(1)} SR</span>
                    </div>
                    <input id="tsunami-mag" type="range" min="7.0" max="9.5" step="0.1" value={tsunamiMag}
                      onChange={(e) => setTsunamiMag(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>7.0 (Kuat)</span><span>9.5 (Super Dahsyat!)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="tsunami-height">Tinggi Gelombang</label>
                      <span className="font-black text-purple-700">{tsunamiWaveHeight} meter</span>
                    </div>
                    <input id="tsunami-height" type="range" min="2" max="20" step="1" value={tsunamiWaveHeight}
                      onChange={(e) => setTsunamiWaveHeight(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>2m (Setinggi orang dewasa)</span><span>20m (Setinggi gedung 6 lantai!)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tsunami-mangrove" className="text-sm font-bold text-ink-700">🌳 Berapa banyak pohon bakau di pantai?</label>
                    <select id="tsunami-mangrove" value={tsunamiMangrove} onChange={(e) => setTsunamiMangrove(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700">
                      <option value="sedikit">Sedikit (Hampir nggak ada)</option>
                      <option value="sedang">Sedang (Ada beberapa)</option>
                      <option value="banyak">Banyak (Hutan bakau lebat)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-lavender-100/40 p-3">
                    <div>
                      <span className="block text-sm font-bold text-ink-700">🏢 Ada gedung tinggi untuk mengungsi?</span>
                      <span className="text-[10px] text-ink-400 font-semibold">Gedung kokoh minimal 4 lantai di dekat pantai</span>
                    </div>
                    <button onClick={() => setTsunamiEscapeBuilding(!tsunamiEscapeBuilding)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${tsunamiEscapeBuilding ? "bg-teal-500" : "bg-lavender-200"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${tsunamiEscapeBuilding ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tsunami-density" className="text-sm font-bold text-ink-700">👥 Berapa banyak orang tinggal di pantai?</label>
                    <select id="tsunami-density" value={tsunamiDensity} onChange={(e) => setTsunamiDensity(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700">
                      <option value="rendah">Sedikit (~2.500 orang)</option>
                      <option value="sedang">Sedang (~8.000 orang)</option>
                      <option value="tinggi">Padat banget (~25.000 orang)</option>
                    </select>
                  </div>
                </>
              )}

              {/* ── GEMPA CONTROLS ── */}
              {activeDisaster === "gempa" && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="gempa-mag">Kekuatan Gempa (Magnitudo)</label>
                      <span className="font-black text-purple-700">{gempaMag.toFixed(1)} SR</span>
                    </div>
                    <input id="gempa-mag" type="range" min="5.0" max="9.0" step="0.1" value={gempaMag}
                      onChange={(e) => setGempaMag(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>5.0 (Terasa goyang)</span><span>9.0 (Sangat merusak!)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="gempa-depth">Kedalaman Pusat Gempa</label>
                      <span className="font-black text-purple-700">{gempaDepth} km</span>
                    </div>
                    <input id="gempa-depth" type="range" min="10" max="100" step="5" value={gempaDepth}
                      onChange={(e) => setGempaDepth(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>10 km (Dangkal = lebih merusak)</span><span>100 km (Dalam = lebih lemah)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gempa-struct" className="text-sm font-bold text-ink-700">🏗️ Jenis bangunan di area ini?</label>
                    <select id="gempa-struct" value={gempaStructure} onChange={(e) => setGempaStructure(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700">
                      <option value="sederhana">Sederhana (Kayu/batu biasa)</option>
                      <option value="campuran">Campuran (Sebagian beton)</option>
                      <option value="tahan-gempa">Tahan Gempa (Standar SNI)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gempa-soil" className="text-sm font-bold text-ink-700">🪨 Jenis tanah di bawah rumah?</label>
                    <select id="gempa-soil" value={gempaSoil} onChange={(e) => setGempaSoil(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700">
                      <option value="keras">Tanah keras / batu (aman)</option>
                      <option value="sedang">Tanah biasa</option>
                      <option value="lunak">Tanah lunak / berlumpur (bahaya!)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gempa-density" className="text-sm font-bold text-ink-700">👥 Kepadatan penduduk?</label>
                    <select id="gempa-density" value={gempaDensity} onChange={(e) => setGempaDensity(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700">
                      <option value="rendah">Pedesaan (~3.000 orang)</option>
                      <option value="sedang">Pinggiran kota (~12.000 orang)</option>
                      <option value="tinggi">Kota padat (~40.000 orang)</option>
                    </select>
                  </div>
                </>
              )}

              {/* ── BANJIR CONTROLS ── */}
              {activeDisaster === "banjir" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-rain" className="text-sm font-bold text-ink-700">🌧️ Seberapa deras hujannya?</label>
                    <select id="banjir-rain" value={banjirRain} onChange={(e) => setBanjirRain(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="rendah">Gerimis (&lt; 20 mm/hari)</option>
                      <option value="sedang">Lumayan deras (20-50 mm)</option>
                      <option value="tinggi">Deras banget (50-100 mm)</option>
                      <option value="ekstrem">Hujan super lebat (&gt; 100 mm)!</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-drain" className="text-sm font-bold text-ink-700">🕳️ Kondisi selokan/drainase?</label>
                    <select id="banjir-drain" value={banjirDrainage} onChange={(e) => setBanjirDrainage(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="buruk">Tersumbat total</option>
                      <option value="kurang">Kurang lancar</option>
                      <option value="normal">Lancar normal</option>
                      <option value="optimal">Super lancar & terintegrasi</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-rth" className="text-sm font-bold text-ink-700">🌿 Ada taman/area hijau?</label>
                    <select id="banjir-rth" value={banjirRth} onChange={(e) => setBanjirRth(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="sedikit">Hampir nggak ada (semua beton)</option>
                      <option value="sedang">Ada beberapa taman</option>
                      <option value="banyak">Banyak! (Taman kota & hutan)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-garbage" className="text-sm font-bold text-ink-700">🗑️ Sampah di sungai/selokan?</label>
                    <select id="banjir-garbage" value={banjirGarbage} onChange={(e) => setBanjirGarbage(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="tinggi">Banyak banget (sungai tersumbat)</option>
                      <option value="sedang">Ada beberapa</option>
                      <option value="rendah">Bersih! 🧹</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-elev" className="text-sm font-bold text-ink-700">⛰️ Posisi rumah warga?</label>
                    <select id="banjir-elev" value={banjirElevation} onChange={(e) => setBanjirElevation(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="dataran-rendah">Di pinggir sungai (dataran rendah)</option>
                      <option value="lereng">Di lereng bukit</option>
                      <option value="dataran-tinggi">Di dataran tinggi</option>
                    </select>
                  </div>
                </>
              )}

              {/* ── KEBAKARAN CONTROLS ── */}
              {activeDisaster === "kebakaran" && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="fire-temp">🌡️ Suhu udara</label>
                      <span className="font-black text-purple-700">{kebakaranTemp}°C</span>
                    </div>
                    <input id="fire-temp" type="range" min="20" max="45" step="1" value={kebakaranTemp}
                      onChange={(e) => setKebakaranTemp(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>20°C (Sejuk)</span><span>45°C (Panas banget!)</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="fire-wind">💨 Kecepatan angin</label>
                      <span className="font-black text-purple-700">{kebakaranWindSpeed} km/h</span>
                    </div>
                    <input id="fire-wind" type="range" min="0" max="60" step="5" value={kebakaranWindSpeed}
                      onChange={(e) => setKebakaranWindSpeed(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>Tenang</span><span>Kencang (menyebarkan api!)</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="fire-humid">💧 Kelembapan udara</label>
                      <span className="font-black text-purple-700">{kebakaranHumidity}%</span>
                    </div>
                    <input id="fire-humid" type="range" min="10" max="90" step="5" value={kebakaranHumidity}
                      onChange={(e) => setKebakaranHumidity(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>10% (Super kering = mudah terbakar)</span><span>90% (Basah = aman)</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fire-break" className="text-sm font-bold text-ink-700">🛤️ Ada sekat pemutus api?</label>
                    <select id="fire-break" value={kebakaranFirebreak} onChange={(e) => setKebakaranFirebreak(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="tidak-ada">Nggak ada sekat</option>
                      <option value="jarang">Ada sedikit (jalur tanah 5m)</option>
                      <option value="rapat">Terstruktur rapi (banyak sekat)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fire-response" className="text-sm font-bold text-ink-700">🚒 Berapa cepat pemadam datang?</label>
                    <select id="fire-response" value={kebakaranResponse} onChange={(e) => setKebakaranResponse(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="lambat">Lambat (&gt; 3 jam)</option>
                      <option value="sedang">Lumayan (1-3 jam)</option>
                      <option value="cepat">Cepat (&lt; 30 menit)</option>
                    </select>
                  </div>
                </>
              )}

              {/* ── CUACA EKSTREM CONTROLS ── */}
              {activeDisaster === "cuaca" && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="weather-wind">🌪️ Kecepatan angin badai</label>
                      <span className="font-black text-purple-700">{cuacaWind} km/h</span>
                    </div>
                    <input id="weather-wind" type="range" min="50" max="180" step="10" value={cuacaWind}
                      onChange={(e) => setCuacaWind(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>50 km/h (Angin kencang)</span><span>180 km/h (Topan dahsyat!)</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="weather-dur">⏱️ Berapa lama badainya?</label>
                      <span className="font-black text-purple-700">{cuacaDuration} Jam</span>
                    </div>
                    <input id="weather-dur" type="range" min="1" max="12" step="1" value={cuacaDuration}
                      onChange={(e) => setCuacaDuration(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700" />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>1 Jam (Sebentar)</span><span>12 Jam (Lama banget!)</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="weather-roof" className="text-sm font-bold text-ink-700">🏠 Jenis atap rumah warga?</label>
                    <select id="weather-roof" value={cuacaRoof} onChange={(e) => setCuacaRoof(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="seng">Seng tipis (gampang terbang)</option>
                      <option value="sedang">Genteng kayu (lumayan kuat)</option>
                      <option value="beton">Beton cor (super kuat)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-lavender-100/40 p-3">
                    <div>
                      <span className="block text-sm font-bold text-ink-700">📢 Sistem peringatan dini aktif?</span>
                      <span className="text-[10px] text-ink-400 font-semibold">Sirene & notifikasi HP dari BMKG</span>
                    </div>
                    <button onClick={() => setCuacaWarning(!cuacaWarning)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${cuacaWarning ? "bg-teal-500" : "bg-lavender-200"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${cuacaWarning ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="weather-trees" className="text-sm font-bold text-ink-700">🌴 Pohon pelindung di sekitar?</label>
                    <select id="weather-trees" value={cuacaTrees} onChange={(e) => setCuacaTrees(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700">
                      <option value="jarang">Jarang (mudah terhempas)</option>
                      <option value="cukup">Cukup (menahan angin sedikit)</option>
                      <option value="rapat">Rapat (penghalang alami)</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visualizer & Output Stats */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* 2D Animation Screen */}
          <div className="overflow-hidden rounded-3xl border-2 border-lavender-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-lavender-100 bg-cream-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                <span className="font-heading text-sm font-black text-ink-900">
                   Layar Simulasi
                </span>
              </div>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-ink-700">
                {isPlaying ? "⏳ Lagi berjalan..." : " Siap mulai!"}
              </span>
            </div>

            <div className="relative bg-amber-50/30">
              <canvas ref={canvasRef} width="640" height="320" className="w-full aspect-[2/1] object-cover" />
              {showHeatmap && (
                <div className="absolute top-4 right-4 rounded-xl bg-purple-900/90 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-sm shadow-md">
                   Peta Risiko Aktif
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-lavender-100/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <button onClick={runSimulation} disabled={isPlaying}
                  className="flex items-center gap-2 rounded-2xl bg-purple-700 px-5 py-3 font-heading text-sm font-black text-white shadow-md transition hover:bg-purple-900 hover:scale-102 active:scale-98 disabled:opacity-50">
                  <Play className="h-4 w-4" /> Mulai! ▶️
                </button>
                <button onClick={() => { stopSimulation(); setSimProgress(0); setIsPlaying(false); }}
                  className="flex items-center gap-2 rounded-2xl bg-white border-2 border-lavender-200 px-4 py-3 font-heading text-sm font-extrabold text-ink-700 transition hover:bg-lavender-100/50">
                  <RotateCcw className="h-4 w-4" /> Ulang
                </button>
              </div>
              <div className="flex flex-1 items-center gap-3 min-w-[200px]">
                <div className="h-2 w-full overflow-hidden rounded-full bg-lavender-200">
                  <div className="h-full bg-purple-700 transition-all duration-75" style={{ width: `${simProgress}%` }} />
                </div>
                <span className="font-heading text-xs font-black text-ink-700">{Math.round(simProgress)}%</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              OUTPUT STATS WITH REASONING CARDS
              ══════════════════════════════════════════ */}
          <div>
            <h3 className="mb-4 font-heading text-xl font-black text-ink-900 flex items-center gap-2">
               Hasil Simulasi
              <span className="text-xs font-semibold text-ink-400 font-sans">(klik &quot;Kenapa?&quot; untuk penjelasan)</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Warga Terdampak */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Perkiraan Warga Terdampak</span>
                  <Users className="h-5 w-5 text-red-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">{results.casualties.toLocaleString("id-ID")}</span>
                  <span className="text-xs font-medium text-ink-400">orang</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-black uppercase ${
                    results.riskLevel === "Kritis" ? "bg-rose-100 text-rose-700" :
                    results.riskLevel === "Tinggi" ? "bg-amber-100 text-amber-700" :
                    results.riskLevel === "Sedang" ? "bg-yellow-100 text-yellow-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {results.riskLevel === "Kritis" ? "🔴" : results.riskLevel === "Tinggi" ? "🟠" : results.riskLevel === "Sedang" ? "🟡" : "🟢"} {results.riskLevel}
                  </span>
                  <button onClick={() => toggleCard("casualties")} className="flex items-center gap-1 text-[10px] font-black text-purple-700 hover:text-purple-900 transition">
                    <HelpCircle className="h-3.5 w-3.5" /> Kenapa?
                  </button>
                </div>
                <AnimatePresence>
                  {expandedCards.casualties && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-3 rounded-xl bg-purple-50 p-3 text-[11px] font-medium text-ink-700 leading-relaxed border border-purple-100">
                        <Lightbulb className="inline h-3.5 w-3.5 text-purple-700 mr-1" />
                        {results.reasoning.casualties}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card 2: Tingkat Kerusakan */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Tingkat Kerusakan</span>
                  <Building2 className="h-5 w-5 text-orange-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">{results.damagePercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-lavender-100">
                  <div className={`h-full rounded-full transition-all duration-300 ${results.damagePercent > 70 ? "bg-rose-500" : results.damagePercent > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${results.damagePercent}%` }} />
                </div>
                <div className="mt-2 flex justify-end">
                  <button onClick={() => toggleCard("damage")} className="flex items-center gap-1 text-[10px] font-black text-purple-700 hover:text-purple-900 transition">
                    <HelpCircle className="h-3.5 w-3.5" /> Kenapa?
                  </button>
                </div>
                <AnimatePresence>
                  {expandedCards.damage && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-2 rounded-xl bg-purple-50 p-3 text-[11px] font-medium text-ink-700 leading-relaxed border border-purple-100">
                        <Lightbulb className="inline h-3.5 w-3.5 text-purple-700 mr-1" />
                        {results.reasoning.damage}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card 3: Waktu Evakuasi */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Waktu Evakuasi</span>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">{results.evacuationTime}</span>
                  <span className="text-xs font-medium text-ink-400">Menit</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-bold text-ink-400">
                  {results.evacuationTime < 15 ? (
                    <span className="text-emerald-600">⚡ Cepat & Aman</span>
                  ) : results.evacuationTime < 30 ? (
                    <span className="text-amber-600">⏳ Agak Lambat</span>
                  ) : (
                    <span className="text-rose-600">🚨 Bahaya! Terlalu Lama</span>
                  )}
                  <button onClick={() => toggleCard("evacuation")} className="flex items-center gap-1 text-[10px] font-black text-purple-700 hover:text-purple-900 transition">
                    <HelpCircle className="h-3.5 w-3.5" /> Kenapa?
                  </button>
                </div>
                <AnimatePresence>
                  {expandedCards.evacuation && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-2 rounded-xl bg-purple-50 p-3 text-[11px] font-medium text-ink-700 leading-relaxed border border-purple-100">
                        <Lightbulb className="inline h-3.5 w-3.5 text-purple-700 mr-1" />
                        {results.reasoning.evacuation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card 4: Area Terdampak */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Area Terdampak</span>
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">{results.affectedArea}</span>
                  <span className="text-xs font-medium text-ink-400">km²</span>
                </div>
                <div className="mt-2 flex justify-end">
                  <button onClick={() => toggleCard("area")} className="flex items-center gap-1 text-[10px] font-black text-purple-700 hover:text-purple-900 transition">
                    <HelpCircle className="h-3.5 w-3.5" /> Kenapa?
                  </button>
                </div>
                <AnimatePresence>
                  {expandedCards.area && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-2 rounded-xl bg-purple-50 p-3 text-[11px] font-medium text-ink-700 leading-relaxed border border-purple-100">
                        <Lightbulb className="inline h-3.5 w-3.5 text-purple-700 mr-1" />
                        {results.reasoning.area}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card 5: Seberapa Siap Kita? */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Seberapa Siap Kita? 🛡️</span>
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">{results.mitigationEffectiveness}%</span>
                  <span className="text-xs font-medium text-ink-400">dari perlindungan maksimal</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-lavender-100">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${results.mitigationEffectiveness}%` }} />
                </div>
                <div className="mt-2 flex justify-end">
                  <button onClick={() => toggleCard("mitigation")} className="flex items-center gap-1 text-[10px] font-black text-purple-700 hover:text-purple-900 transition">
                    <HelpCircle className="h-3.5 w-3.5" /> Kenapa?
                  </button>
                </div>
                <AnimatePresence>
                  {expandedCards.mitigation && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-2 rounded-xl bg-purple-50 p-3 text-[11px] font-medium text-ink-700 leading-relaxed border border-purple-100">
                        <Lightbulb className="inline h-3.5 w-3.5 text-purple-700 mr-1" />
                        {results.reasoning.mitigation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SCENARIO COMPARISON
          ══════════════════════════════════════════ */}
      <div className="mt-12 rounded-3xl border-2 border-lavender-200/60 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-6 font-heading text-2xl font-black text-ink-900">
           Bandingkan 3 Skenario
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Baseline (Worst) */}
          <div className="rounded-2xl bg-rose-50/50 border-2 border-rose-100 p-5">
            <h4 className="font-heading text-base font-black text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Skenario Terburuk 😱
            </h4>
            <p className="mt-1.5 text-xs font-medium text-ink-700 leading-relaxed">
              Kalau nggak ada persiapan sama sekali dan bencananya sangat besar.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Kesiapan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-rose-200 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${baselineResults.mitigationEffectiveness}%` }} />
                  </div>
                  <span className="text-xs font-black text-rose-700">{baselineResults.mitigationEffectiveness}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Kerusakan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-rose-200 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${baselineResults.damagePercent}%` }} />
                  </div>
                  <span className="text-xs font-black text-rose-700">{baselineResults.damagePercent}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Warga Terdampak</span>
                <p className="font-heading text-lg font-black text-rose-700">{baselineResults.casualties.toLocaleString("id-ID")} orang</p>
              </div>
            </div>
          </div>

          {/* Current */}
          <div className="rounded-2xl bg-purple-50/40 border-2 border-purple-200 p-5 shadow-inner scale-102">
            <h4 className="font-heading text-base font-black text-purple-900 flex items-center gap-2">
              <Info className="h-5 w-5 shrink-0 text-purple-700" />
              Pengaturan Kamu ⚙️
            </h4>
            <p className="mt-1.5 text-xs font-medium text-ink-700 leading-relaxed">
              Hasil berdasarkan tombol yang kamu atur di sebelah kiri.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Kesiapan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-purple-200 overflow-hidden">
                    <div className="h-full bg-purple-700" style={{ width: `${results.mitigationEffectiveness}%` }} />
                  </div>
                  <span className="text-xs font-black text-purple-900">{results.mitigationEffectiveness}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Kerusakan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-purple-200 overflow-hidden">
                    <div className="h-full bg-purple-700" style={{ width: `${results.damagePercent}%` }} />
                  </div>
                  <span className="text-xs font-black text-purple-900">{results.damagePercent}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Warga Terdampak</span>
                <p className="font-heading text-lg font-black text-purple-900">{results.casualties.toLocaleString("id-ID")} orang</p>
              </div>
            </div>
          </div>

          {/* Optimal */}
          <div className="rounded-2xl bg-teal-50/50 border-2 border-teal-100 p-5">
            <h4 className="font-heading text-base font-black text-teal-700 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              Skenario Paling Siap 💪
            </h4>
            <p className="mt-1.5 text-xs font-medium text-ink-700 leading-relaxed">
              Kalau semua perlindungan dipakai dan bencananya lebih kecil.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Kesiapan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-teal-200 overflow-hidden">
                    <div className="h-full bg-teal-600" style={{ width: `${optimalResults.mitigationEffectiveness}%` }} />
                  </div>
                  <span className="text-xs font-black text-teal-700">{optimalResults.mitigationEffectiveness}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Kerusakan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-teal-200 overflow-hidden">
                    <div className="h-full bg-teal-600" style={{ width: `${optimalResults.damagePercent}%` }} />
                  </div>
                  <span className="text-xs font-black text-teal-700">{optimalResults.damagePercent}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Warga Terdampak</span>
                <p className="font-heading text-lg font-black text-teal-700">{optimalResults.casualties.toLocaleString("id-ID")} orang</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RECOMMENDATIONS
          ══════════════════════════════════════════ */}
      <div className="mt-8 rounded-3xl border-2 border-lavender-200 bg-cream-50 p-6 sm:p-8">
        <h3 className="font-heading text-xl font-black text-ink-900 flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-purple-700" />
          Apa yang Bisa Kita Lakukan? 🤔
        </h3>

        <p className="mt-3 font-sans text-sm font-semibold text-ink-700 leading-relaxed">
          {recommendation.summary}
        </p>

        <div className="mt-6 border-t border-lavender-200 pt-6">
          <h4 className="font-heading text-sm font-black text-ink-900 uppercase tracking-wide">
            💡 Tips Siaga:
          </h4>
          <ul className="mt-3 flex flex-col gap-3">
            {recommendation.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 font-heading text-[10px] font-black text-white">
                  {idx + 1}
                </span>
                <p className="font-sans text-sm font-semibold text-ink-700">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DATA SOURCES / METHODOLOGY
          ══════════════════════════════════════════ */}
      <div className="mt-8 rounded-3xl border-2 border-lavender-200/60 bg-white overflow-hidden">
        <button
          onClick={() => setShowSources(!showSources)}
          className="w-full flex items-center justify-between px-6 py-5 font-heading text-base font-black text-ink-900 hover:bg-lavender-50/50 transition"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-700" />
            📚 Dari Mana Data Ini? (Sumber & Metodologi)
          </span>
          {showSources ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        <AnimatePresence>
          {showSources && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2">
                <p className="text-sm font-medium text-ink-700 leading-relaxed mb-5">
                  Semua angka di simulasi ini dihitung menggunakan data dan rumus dari lembaga resmi Indonesia dan internasional.
                  Ini bukan angka asal-asalan — setiap perhitungan punya dasarnya! 🔬
                </p>

                {(() => {
                  const src = getSourceData();
                  return (
                    <div>
                      <h4 className="font-heading text-sm font-black text-purple-900 mb-3">{src.title}</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {src.items.map((item, i) => (
                          <div key={i} className="rounded-xl border border-lavender-200 bg-lavender-50/30 p-4">
                            <h5 className="font-heading text-xs font-black text-ink-900">{item.name}</h5>
                            <p className="mt-1 text-[11px] font-medium text-ink-700 leading-relaxed">{item.desc}</p>
                            <p className="mt-2 text-[10px] font-bold text-purple-700 flex items-start gap-1">
                              <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" />
                              {item.ref}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                    ⚠️ <strong>Catatan Penting:</strong> Simulasi ini adalah model sederhana untuk tujuan edukasi.
                    Angka-angka yang muncul adalah <em>perkiraan</em> berdasarkan data historis dan rumus ilmiah,
                    bukan prediksi pasti kejadian nyata. Untuk perencanaan kesiapsiagaan resmi, selalu ikuti arahan BNPB dan BMKG.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
