"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Skull,
  Building2,
  Trees,
  CheckCircle,
  XCircle,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";

// Types for Disaster
type DisasterType = "tsunami" | "gempa" | "banjir" | "kebakaran" | "cuaca";

interface SimulationResults {
  casualties: number;
  damagePercent: number;
  evacuationTime: number;
  affectedArea: number;
  mitigationEffectiveness: number;
  riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis";
}

export default function DisasterSimulatorPage() {
  const [activeDisaster, setActiveDisaster] = useState<DisasterType>("tsunami");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0); // 0 to 100
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Parameter States ---
  // Tsunami Parameters
  const [tsunamiMag, setTsunamiMag] = useState<number>(8.5); // 7.0 - 9.5
  const [tsunamiWaveHeight, setTsunamiWaveHeight] = useState<number>(10); // 2 - 20
  const [tsunamiMangrove, setTsunamiMangrove] = useState<string>("sedikit"); // sedikit, sedang, banyak
  const [tsunamiEscapeBuilding, setTsunamiEscapeBuilding] = useState<boolean>(false);
  const [tsunamiDensity, setTsunamiDensity] = useState<string>("sedang"); // rendah, sedang, tinggi

  // Gempa Parameters
  const [gempaMag, setGempaMag] = useState<number>(7.2); // 5.0 - 9.0
  const [gempaDepth, setGempaDepth] = useState<number>(20); // 10 - 100 km
  const [gempaStructure, setGempaStructure] = useState<string>("sederhana"); // sederhana, campuran, tahan-gempa
  const [gempaDensity, setGempaDensity] = useState<string>("sedang"); // rendah, sedang, tinggi
  const [gempaSoil, setGempaSoil] = useState<string>("sedang"); // keras, sedang, lunak

  // Banjir Parameters
  const [banjirRain, setBanjirRain] = useState<string>("tinggi"); // rendah, sedang, tinggi, ekstrem
  const [banjirDrainage, setBanjirDrainage] = useState<string>("kurang"); // buruk, kurang, normal, optimal
  const [banjirRth, setBanjirRth] = useState<string>("sedikit"); // sedikit, sedang, banyak
  const [banjirGarbage, setBanjirGarbage] = useState<string>("tinggi"); // tinggi, sedang, rendah
  const [banjirElevation, setBanjirElevation] = useState<string>("dataran-rendah"); // dataran-rendah, lereng, dataran-tinggi

  // Kebakaran Hutan Parameters
  const [kebakaranTemp, setKebakaranTemp] = useState<number>(35); // 20 - 45 C
  const [kebakaranWindSpeed, setKebakaranWindSpeed] = useState<number>(25); // 0 - 60 km/h
  const [kebakaranHumidity, setKebakaranHumidity] = useState<number>(30); // 10% - 90%
  const [kebakaranFirebreak, setKebakaranFirebreak] = useState<string>("tidak-ada"); // tidak-ada, jarang, rapat
  const [kebakaranResponse, setKebakaranResponse] = useState<string>("lambat"); // lambat, sedang, cepat

  // Cuaca Ekstrem Parameters
  const [cuacaWind, setCuacaWind] = useState<number>(90); // 50 - 180 km/h
  const [cuacaDuration, setCuacaDuration] = useState<number>(4); // 1 - 12 jam
  const [cuacaRoof, setCuacaRoof] = useState<string>("seng"); // seng, sedang, beton
  const [cuacaWarning, setCuacaWarning] = useState<boolean>(false);
  const [cuacaTrees, setCuacaTrees] = useState<string>("jarang"); // jarang, cukup, rapat

  // Reset simulation animation when changing active disaster
  useEffect(() => {
    stopSimulation();
    setSimProgress(0);
    setIsPlaying(false);
  }, [activeDisaster]);

  // Handle live canvas redrawing when parameters change or simulation moves
  useEffect(() => {
    drawSimulation();
  }, [
    activeDisaster,
    simProgress,
    showHeatmap,
    tsunamiMag,
    tsunamiWaveHeight,
    tsunamiMangrove,
    tsunamiEscapeBuilding,
    tsunamiDensity,
    gempaMag,
    gempaDepth,
    gempaStructure,
    gempaDensity,
    gempaSoil,
    banjirRain,
    banjirDrainage,
    banjirRth,
    banjirGarbage,
    banjirElevation,
    kebakaranTemp,
    kebakaranWindSpeed,
    kebakaranHumidity,
    kebakaranFirebreak,
    kebakaranResponse,
    cuacaWind,
    cuacaDuration,
    cuacaRoof,
    cuacaWarning,
    cuacaTrees,
  ]);

  // --- Formula Parametrik ML Heuristic Engine ---
  const calculateMetrics = (
    type: DisasterType,
    scenario: "current" | "baseline" | "optimal"
  ): SimulationResults => {
    // Helper to calculate variables
    if (type === "tsunami") {
      let mag = tsunamiMag;
      let wave = tsunamiWaveHeight;
      let mangrove = tsunamiMangrove;
      let escape = tsunamiEscapeBuilding;
      let density = tsunamiDensity;

      if (scenario === "baseline") {
        mag = 9.5;
        wave = 20;
        mangrove = "sedikit";
        escape = false;
        density = "tinggi";
      } else if (scenario === "optimal") {
        mag = 7.5;
        wave = 5;
        mangrove = "banyak";
        escape = true;
        density = "rendah";
      }

      const magFactor = (mag - 7) / (9.5 - 7);
      const waveFactor = (wave - 2) / (20 - 2);
      const densityVal = density === "rendah" ? 0.2 : density === "sedang" ? 0.6 : 1.0;
      const mangroveVal = mangrove === "sedikit" ? 0.0 : mangrove === "sedang" ? 0.5 : 1.0;
      const escapeVal = escape ? 1.0 : 0.0;

      // Calculations
      const hazardScore = magFactor * 0.45 + waveFactor * 0.55;
      const mitigationEffectiveness = Math.round((mangroveVal * 0.4 + escapeVal * 0.6) * 100);
      
      const damageReduction = mangroveVal * 0.35;
      const damagePercent = Math.max(0, Math.min(100, Math.round((hazardScore * (1 - damageReduction)) * 100)));
      
      const evacBase = escape ? 8 : 25;
      const evacCongestion = densityVal * 15;
      const evacuationTime = Math.round(evacBase + evacCongestion);

      const affectedArea = Math.round((wave * 1.8 + mag * 1.5) * 10) / 10;
      
      const casualtyRate = Math.max(0, hazardScore * (1 - (mangroveVal * 0.3 + escapeVal * 0.65)));
      const casualties = Math.round(casualtyRate * densityVal * 3500);

      // Risk level threshold
      const score = casualties + (damagePercent * 10);
      let riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis" = "Rendah";
      if (score > 850) riskLevel = "Kritis";
      else if (score > 500) riskLevel = "Tinggi";
      else if (score > 150) riskLevel = "Sedang";

      return { casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness, riskLevel };
    }

    if (type === "gempa") {
      let mag = gempaMag;
      let depth = gempaDepth;
      let struct = gempaStructure;
      let density = gempaDensity;
      let soil = gempaSoil;

      if (scenario === "baseline") {
        mag = 9.0;
        depth = 10;
        struct = "sederhana";
        density = "tinggi";
        soil = "lunak";
      } else if (scenario === "optimal") {
        mag = 5.5;
        depth = 80;
        struct = "tahan-gempa";
        density = "rendah";
        soil = "keras";
      }

      const magFactor = (mag - 5) / (9.0 - 5);
      const depthFactor = 1 - (depth - 10) / (100 - 10); // shallow is worse
      const densityVal = density === "rendah" ? 0.2 : density === "sedang" ? 0.6 : 1.0;
      const structVal = struct === "sederhana" ? 0.0 : struct === "campuran" ? 0.4 : 1.0;
      const soilVal = soil === "keras" ? 0.0 : soil === "sedang" ? 0.5 : 1.0;

      const hazardScore = magFactor * 0.6 + depthFactor * 0.4;
      const mitigationEffectiveness = Math.round((structVal * 0.7 + (1 - soilVal) * 0.3) * 100);

      const structuralVulnerability = struct === "sederhana" ? 1.0 : struct === "campuran" ? 0.5 : 0.15;
      const soilAmplification = 1 + soilVal * 0.4;
      const damagePercent = Math.max(0, Math.min(100, Math.round(hazardScore * structuralVulnerability * soilAmplification * 100)));

      const evacBase = struct === "tahan-gempa" ? 5 : 18;
      const evacCongestion = densityVal * 20;
      const evacuationTime = Math.round(evacBase + evacCongestion);

      const affectedArea = Math.round((Math.pow(10, mag - 5) / depth) * 10) / 10 + 2;

      const casualtyRate = Math.max(0, hazardScore * structuralVulnerability * soilAmplification * 0.85);
      const casualties = Math.round(casualtyRate * densityVal * 4200);

      const score = casualties + (damagePercent * 10);
      let riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis" = "Rendah";
      if (score > 900) riskLevel = "Kritis";
      else if (score > 550) riskLevel = "Tinggi";
      else if (score > 180) riskLevel = "Sedang";

      return { casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness, riskLevel };
    }

    if (type === "banjir") {
      let rain = banjirRain;
      let drain = banjirDrainage;
      let rth = banjirRth;
      let garbage = banjirGarbage;
      let elevation = banjirElevation;

      if (scenario === "baseline") {
        rain = "ekstrem";
        drain = "buruk";
        rth = "sedikit";
        garbage = "tinggi";
        elevation = "dataran-rendah";
      } else if (scenario === "optimal") {
        rain = "rendah";
        drain = "optimal";
        rth = "banyak";
        garbage = "rendah";
        elevation = "dataran-tinggi";
      }

      const rainVal = rain === "rendah" ? 0.1 : rain === "sedang" ? 0.4 : rain === "tinggi" ? 0.75 : 1.0;
      const drainVal = drain === "buruk" ? 0.0 : drain === "kurang" ? 0.3 : drain === "normal" ? 0.75 : 1.0;
      const rthVal = rth === "sedikit" ? 0.0 : rth === "sedang" ? 0.5 : 1.0;
      const garbageVal = garbage === "tinggi" ? 0.0 : garbage === "sedang" ? 0.5 : 1.0;
      const elevationVal = elevation === "dataran-rendah" ? 1.0 : elevation === "lereng" ? 0.5 : 0.05;

      const waterInflow = rainVal * 1.2 * elevationVal;
      const waterDrain = drainVal * 0.5 + rthVal * 0.3 + garbageVal * 0.2;
      const floodingLevel = Math.max(0, waterInflow - waterDrain);

      const mitigationEffectiveness = Math.round(((drainVal * 0.4) + (rthVal * 0.3) + (garbageVal * 0.3)) * 100);
      const damagePercent = Math.max(0, Math.min(100, Math.round(floodingLevel * 100)));

      const evacBase = floodingLevel > 0.6 ? 35 : floodingLevel > 0.3 ? 20 : 10;
      const evacuationTime = Math.round(evacBase * (1.5 - drainVal * 0.5));

      const affectedArea = Math.round(floodingLevel * 45 * 10) / 10;
      const casualties = Math.round(floodingLevel * 1200 * elevationVal);

      const score = casualties + (damagePercent * 8);
      let riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis" = "Rendah";
      if (score > 700) riskLevel = "Kritis";
      else if (score > 400) riskLevel = "Tinggi";
      else if (score > 120) riskLevel = "Sedang";

      return { casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness, riskLevel };
    }

    if (type === "kebakaran") {
      let temp = kebakaranTemp;
      let wind = kebakaranWindSpeed;
      let hum = kebakaranHumidity;
      let fbreak = kebakaranFirebreak;
      let resp = kebakaranResponse;

      if (scenario === "baseline") {
        temp = 45;
        wind = 60;
        hum = 10;
        fbreak = "tidak-ada";
        resp = "lambat";
      } else if (scenario === "optimal") {
        temp = 20;
        wind = 0;
        hum = 90;
        fbreak = "rapat";
        resp = "cepat";
      }

      const tempFactor = (temp - 20) / (45 - 20);
      const windFactor = wind / 60;
      const humFactor = 1 - (hum - 10) / (90 - 10); // dry is worse
      const fbreakVal = fbreak === "tidak-ada" ? 0.0 : fbreak === "jarang" ? 0.5 : 1.0;
      const respVal = resp === "lambat" ? 0.0 : resp === "sedang" ? 0.5 : 1.0;

      const fireIgnitionPotential = tempFactor * 0.4 + humFactor * 0.6;
      const spreadSpeed = fireIgnitionPotential * (1 + windFactor * 0.8);
      const controlFactor = fbreakVal * 0.45 + respVal * 0.55;

      const finalBurnScore = Math.max(0, spreadSpeed * (1 - controlFactor));

      const mitigationEffectiveness = Math.round(controlFactor * 100);
      const damagePercent = Math.max(0, Math.min(100, Math.round(finalBurnScore * 100)));

      const evacuationTime = Math.round(15 + windFactor * 25 * (1 - respVal * 0.5));
      const affectedArea = Math.round(finalBurnScore * 75 * 10) / 10;
      const casualties = Math.round(finalBurnScore * 450 * (1 - respVal * 0.7));

      const score = casualties + (damagePercent * 9);
      let riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis" = "Rendah";
      if (score > 800) riskLevel = "Kritis";
      else if (score > 450) riskLevel = "Tinggi";
      else if (score > 130) riskLevel = "Sedang";

      return { casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness, riskLevel };
    }

    // Default to Cuaca Ekstrem
    let wind = cuacaWind;
    let dur = cuacaDuration;
    let roof = cuacaRoof;
    let warn = cuacaWarning;
    let trees = cuacaTrees;

    if (scenario === "baseline") {
      wind = 180;
      dur = 12;
      roof = "seng";
      warn = false;
      trees = "jarang";
    } else if (scenario === "optimal") {
      wind = 50;
      dur = 1;
      roof = "beton";
      warn = true;
      trees = "rapat";
    }

    const windFactor = (wind - 50) / (180 - 50);
    const durFactor = (dur - 1) / (12 - 1);
    const roofVal = roof === "seng" ? 1.0 : roof === "sedang" ? 0.4 : 0.1;
    const warnVal = warn ? 1.0 : 0.0;
    const treesVal = trees === "jarang" ? 0.1 : trees === "cukup" ? 0.6 : 1.0;

    const stormIntensity = windFactor * 0.7 + durFactor * 0.3;
    const damagePercent = Math.max(0, Math.min(100, Math.round(stormIntensity * roofVal * 1.3 * 100)));

    const mitigationEffectiveness = Math.round((warnVal * 0.6 + (1 - roofVal) * 0.3 + (treesVal * 0.1)) * 100);
    const evacuationTime = warn ? 8 : 35; // warning gives headstart
    const affectedArea = Math.round(windFactor * 32 * 10) / 10;
    
    const casualtyRate = Math.max(0, stormIntensity * (1 - warnVal * 0.85) * roofVal);
    const casualties = Math.round(casualtyRate * 900);

    const score = casualties + (damagePercent * 7);
    let riskLevel: "Rendah" | "Sedang" | "Tinggi" | "Kritis" = "Rendah";
    if (score > 750) riskLevel = "Kritis";
    else if (score > 400) riskLevel = "Tinggi";
    else if (score > 110) riskLevel = "Sedang";

    return { casualties, damagePercent, evacuationTime, affectedArea, mitigationEffectiveness, riskLevel };
  };

  const results = calculateMetrics(activeDisaster, "current");
  const baselineResults = calculateMetrics(activeDisaster, "baseline");
  const optimalResults = calculateMetrics(activeDisaster, "optimal");

  // --- HTML5 Canvas Simulation Renderer ---
  const drawSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky/background based on disaster
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (activeDisaster === "tsunami") {
      bgGrad.addColorStop(0, "#BAE6FD"); // sky blue
      bgGrad.addColorStop(1, "#F0F9FF");
    } else if (activeDisaster === "gempa") {
      bgGrad.addColorStop(0, "#FDBA74"); // warm dusty orange
      bgGrad.addColorStop(1, "#FFF7ED");
    } else if (activeDisaster === "banjir") {
      bgGrad.addColorStop(0, "#94A3B8"); // dark grey clouds
      bgGrad.addColorStop(1, "#E2E8F0");
    } else if (activeDisaster === "kebakaran") {
      bgGrad.addColorStop(0, "#FECDD3"); // smoky orange-red
      bgGrad.addColorStop(1, "#FFF1F2");
    } else {
      bgGrad.addColorStop(0, "#475569"); // storm dark blue
      bgGrad.addColorStop(1, "#94A3B8");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw landscape ground
    ctx.fillStyle = "#EAE2CF"; // ground brown-yellow
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 220);
    ctx.quadraticCurveTo(300, 200, canvas.width, 220);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    const t = simProgress / 100; // time factor for animations

    // 1. Render Tsunami Scene
    if (activeDisaster === "tsunami") {
      // Draw Mangroves
      const count = tsunamiMangrove === "sedikit" ? 2 : tsunamiMangrove === "sedang" ? 6 : 12;
      ctx.fillStyle = "#15803D"; // mangrove green
      for (let i = 0; i < count; i++) {
        const x = 120 + i * 20;
        const y = 205 + Math.sin(i * 3) * 5;
        // Trunk
        ctx.fillStyle = "#78350F";
        ctx.fillRect(x + 4, y, 4, 15);
        // Foliage
        ctx.fillStyle = "#15803D";
        ctx.beginPath();
        ctx.arc(x + 6, y - 5, 8, 0, Math.PI * 2);
        ctx.arc(x + 12, y - 2, 7, 0, Math.PI * 2);
        ctx.arc(x, y - 2, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw houses
      const houseX = [400, 480];
      const countHouses = 2;
      for (let i = 0; i < countHouses; i++) {
        const x = houseX[i];
        let y = 200;
        let isSwept = false;
        
        // If simulation is running and wave hits them
        const hitTrigger = 0.5 + i * 0.15;
        if (t > hitTrigger) {
          isSwept = true;
          // Shaking and floating
          const progressAfterHit = (t - hitTrigger) / (1 - hitTrigger);
          y = 200 - Math.sin(progressAfterHit * Math.PI) * 25 + (tsunamiMangrove === "banyak" ? -5 : 0);
        }

        ctx.save();
        if (isSwept) {
          ctx.translate(x + 15, y + 10);
          ctx.rotate((t * 20 * Math.PI) / 180);
          ctx.translate(-(x + 15), -(y + 10));
          ctx.fillStyle = "#FECACA"; // damaged color
        } else {
          ctx.fillStyle = "#F59E0B"; // bright orange
        }

        // Body
        ctx.fillRect(x, y, 30, 20);
        // Roof
        ctx.fillStyle = "#DC2626";
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 15, y - 12);
        ctx.lineTo(x + 35, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Draw Escape Building
      if (tsunamiEscapeBuilding) {
        ctx.fillStyle = "#94A3B8"; // Concrete gray
        ctx.fillRect(520, 140, 50, 80);
        // Roof top garden / safety zone
        ctx.fillStyle = "#22C55E";
        ctx.fillRect(520, 137, 50, 3);
        // Windows
        ctx.fillStyle = "#FFF";
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 3; c++) {
            ctx.fillRect(527 + c * 12, 148 + r * 15, 6, 8);
          }
        }
      }

      // Draw People running
      const popCount = tsunamiDensity === "rendah" ? 4 : tsunamiDensity === "sedang" ? 10 : 20;
      ctx.fillStyle = "#1E293B"; // Ink color for stick figures
      for (let i = 0; i < popCount; i++) {
        let x = 320 + (i * 12);
        let y = 208 + (i % 3) * 2;
        let isSwept = false;

        const waveHitX = 80 + t * 450; // approximate wave front
        if (waveHitX > x) {
          // Mangroves absorb impact and save some people from floating
          if (tsunamiEscapeBuilding && x > 480) {
            // Safe on the building roof!
            x = 525 + (i % 3) * 12;
            y = 133;
          } else if (tsunamiMangrove === "banyak" && i % 3 === 0) {
            // Saved behind mangroves
            x = 220 + (i % 3) * 10;
            y = 208;
          } else {
            isSwept = true;
            y = 190 - Math.sin(t * Math.PI) * 10;
            x = waveHitX - 20;
          }
        } else {
          // Run to safety
          x += t * 120;
        }

        ctx.beginPath();
        if (isSwept) {
          // Draw floating stick figure
          ctx.arc(x, y - 10, 3, 0, Math.PI * 2);
          ctx.moveTo(x - 5, y - 5);
          ctx.lineTo(x + 5, y - 2);
        } else {
          // Run stick figure
          ctx.arc(x, y - 10, 3, 0, Math.PI * 2); // head
          ctx.moveTo(x, y - 7);
          ctx.lineTo(x, y); // spine
          ctx.moveTo(x - 4, y - 4);
          ctx.lineTo(x + 4, y - 4); // arms
          ctx.moveTo(x, y);
          ctx.lineTo(x - 3 + Math.sin(t * 15 + i) * 3, y + 6); // left leg
          ctx.moveTo(x, y);
          ctx.lineTo(x + 3 - Math.sin(t * 15 + i) * 3, y + 6); // right leg
        }
        ctx.stroke();
      }

      // Draw Tsunami Wave
      // Height scale based on parameters
      const maxWaveH = tsunamiWaveHeight * 6; // 12px to 120px
      // Mangroves dampen the wave size in canvas as it goes right
      let waveReduction = 1.0;
      if (tsunamiMangrove === "sedang") waveReduction = 0.8;
      if (tsunamiMangrove === "banyak") waveReduction = 0.5;

      ctx.fillStyle = "rgba(14, 165, 233, 0.85)"; // Transparent ocean blue
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      const waveX = t * 650;
      ctx.lineTo(0, 220 - maxWaveH);
      ctx.bezierCurveTo(
        waveX * 0.4, 220 - maxWaveH,
        waveX * 0.8, 220 - maxWaveH * waveReduction,
        waveX, 220
      );
      ctx.lineTo(waveX, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Foam edge
      ctx.strokeStyle = "#FFF";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(waveX, 220);
      ctx.bezierCurveTo(
        waveX * 0.8, 220 - maxWaveH * waveReduction,
        waveX * 0.4, 220 - maxWaveH,
        0, 220 - maxWaveH
      );
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // 2. Render Gempa Bumi Scene
    else if (activeDisaster === "gempa") {
      // Episentrum line / ground cracking
      const crackIntensity = gempaMag > 7.5 ? 3 : gempaMag > 6.5 ? 2 : 1;
      
      ctx.save();
      // Shaking effect based on Mag and depth
      if (isPlaying && t > 0.1 && t < 0.9) {
        const shakeAmp = (gempaMag - 4) * 3 * (100 / gempaDepth);
        ctx.translate((Math.random() - 0.5) * shakeAmp, (Math.random() - 0.5) * shakeAmp);
      }

      // Ground Cracks
      if (t > 0.3) {
        ctx.strokeStyle = "#451A03"; // dark soil crack color
        ctx.lineWidth = 3 + crackIntensity;
        ctx.beginPath();
        ctx.moveTo(100, 215);
        ctx.lineTo(150 + t * 40, 212 + Math.sin(t * 10) * 8);
        ctx.lineTo(210 + t * 80, 215 - Math.cos(t * 12) * 5);
        ctx.lineTo(320 + t * 150, 210 + Math.sin(t * 8) * 12);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      // Draw Buildings
      // Building 1: Traditional (Left)
      // Building 2: Mid quality (Center)
      // Building 3: Tahan Gempa (Right)
      const bTypes = [gempaStructure, "campuran", "tahan-gempa"];
      const bColor = ["#F43F5E", "#F59E0B", "#10B981"];
      const bX = [100, 250, 420];
      const bW = [60, 70, 85];
      const bH = [100, 120, 140];

      for (let i = 0; i < 3; i++) {
        const x = bX[i];
        const w = bW[i];
        let h = bH[i];
        const isTahanGempa = bTypes[i] === "tahan-gempa";
        const isSederhana = bTypes[i] === "sederhana";
        
        ctx.save();
        let shake = 0;
        let isCollapsed = false;

        if (isPlaying && t > 0.2) {
          // Amplified by soil type
          const soilMult = gempaSoil === "lunak" ? 1.6 : gempaSoil === "sedang" ? 1.0 : 0.5;
          shake = Math.sin(t * 80) * (gempaMag - 4) * 1.5 * soilMult;
          
          if (!isTahanGempa && t > 0.5 && gempaMag > 6.5) {
            isCollapsed = true;
          }
        }

        if (isCollapsed) {
          // Draw rubble pile
          ctx.fillStyle = "#7F1D1D"; // Dark rubble color
          ctx.beginPath();
          ctx.moveTo(x - 10, 220);
          ctx.lineTo(x + w/2, 220 - h * 0.35);
          ctx.lineTo(x + w + 10, 220);
          ctx.closePath();
          ctx.fill();

          // Dust cloud rising
          ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
          ctx.beginPath();
          ctx.arc(x + w/2, 200, 25, 0, Math.PI * 2);
          ctx.arc(x + w/2 - 15, 205, 20, 0, Math.PI * 2);
          ctx.arc(x + w/2 + 15, 205, 20, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Shaking structure
          ctx.translate(x + w/2, 220);
          if (isTahanGempa) {
            // Swaying slightly
            ctx.rotate((shake * 0.25 * Math.PI) / 180);
          } else {
            ctx.translate(shake, 0);
          }
          ctx.translate(-(x + w/2), -220);

          ctx.fillStyle = bColor[i];
          ctx.fillRect(x, 220 - h, w, h);

          // Roof top banner
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(x, 220 - h, w, 5);

          // Windows
          ctx.fillStyle = "#FFF";
          const rows = Math.floor(h / 30);
          const cols = Math.floor(w / 20);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              ctx.fillRect(x + 8 + c * 18, 220 - h + 15 + r * 28, 10, 14);
            }
          }

          // If simple structures crack
          if (isSederhana && t > 0.4 && gempaMag > 5.5) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + w/2, 220 - h/2);
            ctx.lineTo(x + w/2 + 10, 220 - h/2 + 20);
            ctx.lineTo(x + w/2 - 5, 220 - h/2 + 40);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // People running out
      const popCount = gempaDensity === "rendah" ? 5 : gempaDensity === "sedang" ? 12 : 22;
      ctx.fillStyle = "#1E293B";
      ctx.strokeStyle = "#1E293B";
      for (let i = 0; i < popCount; i++) {
        let x = 60 + i * 22;
        let y = 210 + (i % 3) * 2;
        let isInjured = false;

        if (t > 0.5) {
          // If they were near the collapsing building
          if (x > 80 && x < 185 && gempaMag > 6.8) {
            isInjured = true;
          }
        }

        ctx.beginPath();
        if (isInjured) {
          ctx.arc(x, y + 4, 3, 0, Math.PI * 2);
          ctx.moveTo(x - 5, y + 8);
          ctx.lineTo(x + 5, y + 8);
        } else {
          // Shaking run animation
          ctx.arc(x, y - 10, 3, 0, Math.PI * 2);
          ctx.moveTo(x, y - 7);
          ctx.lineTo(x, y);
          ctx.moveTo(x - 4, y - 4);
          ctx.lineTo(x + 4, y - 4);
          ctx.moveTo(x, y);
          ctx.lineTo(x - 3 + Math.sin(t * 22 + i) * 3, y + 6);
          ctx.moveTo(x, y);
          ctx.lineTo(x + 3 - Math.sin(t * 22 + i) * 3, y + 6);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Render Banjir Scene
    else if (activeDisaster === "banjir") {
      // Draw rain particles
      const rainCount = banjirRain === "rendah" ? 20 : banjirRain === "sedang" ? 50 : banjirRain === "tinggi" ? 100 : 200;
      ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < rainCount; i++) {
        const rx = (Math.sin(i * 1928) * 0.5 + 0.5) * canvas.width;
        const ry = ((i * 30 + (isPlaying ? t * 400 : 0)) % canvas.height);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 15);
        ctx.stroke();
      }

      // River & Drainage Pipe (left side)
      ctx.fillStyle = "#0284C7"; // water color
      ctx.fillRect(0, 200, 80, 120);

      // Drain Pipe Outlet
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(80, 205, 12, 0, Math.PI * 2);
      ctx.fill();

      // Clogged indicator (garbage pieces floating inside/outside pipe)
      if (banjirGarbage === "tinggi" || banjirGarbage === "sedang") {
        ctx.fillStyle = "#A16207"; // Brown garbage
        ctx.fillRect(72, 200, 8, 8);
        ctx.fillRect(82, 205, 6, 6);
        ctx.fillRect(66, 196, 7, 7);
      }

      // Green space (RTH) representation
      const greenSpaceWidth = banjirRth === "sedikit" ? 40 : banjirRth === "sedang" ? 120 : 240;
      ctx.fillStyle = "#22C55E";
      ctx.fillRect(80, 215, greenSpaceWidth, 8);

      // Houses
      const houseX = [220, 360, 480];
      const floodRise = results.damagePercent * 0.6; // rise up to 60px max
      const currentFloodH = isPlaying ? t * floodRise : floodRise;

      for (let i = 0; i < 3; i++) {
        const x = houseX[i];
        const y = 200;

        ctx.fillStyle = "#38BDF8"; // house body
        ctx.fillRect(x, y, 32, 20);

        // Roof
        ctx.fillStyle = "#EA580C";
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 16, y - 12);
        ctx.lineTo(x + 37, y);
        ctx.fill();

        // Water level line inside house
        if (currentFloodH > 15) {
          ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
          ctx.fillRect(x, y, 32, 20);
        }
      }

      // Draw People seeking shelter (climbing onto roofs)
      ctx.fillStyle = "#1E293B";
      ctx.strokeStyle = "#1E293B";
      const popCount = 8;
      for (let i = 0; i < popCount; i++) {
        let x = 120 + i * 50;
        let y = 208;
        let onRoof = false;

        if (currentFloodH > 10) {
          // Escape to the nearest roof or high ground
          onRoof = true;
          if (i < 3) {
            x = 230 + i * 5;
            y = 186;
          } else if (i < 6) {
            x = 370 + (i - 3) * 5;
            y = 186;
          } else {
            x = 490 + (i - 6) * 5;
            y = 186;
          }
        }

        ctx.beginPath();
        ctx.arc(x, y - 8, 2.5, 0, Math.PI * 2);
        ctx.moveTo(x, y - 5.5);
        ctx.lineTo(x, y);
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y - 3);
        if (!onRoof) {
          ctx.moveTo(x, y);
          ctx.lineTo(x - 2, y + 4);
          ctx.moveTo(x, y);
          ctx.lineTo(x + 2, y + 4);
        }
        ctx.stroke();
      }

      // Water body cover
      ctx.fillStyle = "rgba(14, 165, 233, 0.7)";
      ctx.fillRect(0, 220 - currentFloodH, canvas.width, 100 + currentFloodH);

      // Waves on water top
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let wx = 0; wx < canvas.width; wx += 20) {
        ctx.moveTo(wx, 220 - currentFloodH + Math.sin((isPlaying ? t : 1) * 10 + wx * 0.1) * 2);
        ctx.quadraticCurveTo(
          wx + 10, 220 - currentFloodH + Math.sin((isPlaying ? t : 1) * 10 + wx * 0.1) * 2 - 3,
          wx + 20, 220 - currentFloodH + Math.sin((isPlaying ? t : 1) * 10 + (wx + 20) * 0.1) * 2
        );
      }
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // 4. Render Kebakaran Hutan Scene
    else if (activeDisaster === "kebakaran") {
      // Tree Grid drawing
      const rows = 4;
      const cols = 15;
      const cellW = 35;
      const cellH = 25;

      const firebreakCol = kebakaranFirebreak === "tidak-ada" ? -1 : kebakaranFirebreak === "jarang" ? 7 : 6;
      const isFirebreakOptimal = kebakaranFirebreak === "rapat";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tx = 50 + c * cellW + (r % 2) * 8;
          const ty = 120 + r * cellH;

          // If this column is a firebreak path
          if (c === firebreakCol || (isFirebreakOptimal && (c === 5 || c === 10))) {
            // Dirt road
            ctx.fillStyle = "#A16207";
            ctx.fillRect(tx, ty - 10, cellW, cellH + 5);
            continue;
          }

          // Fire calculation logic for trees
          let isBurnt = false;
          let isOnFire = false;

          const distanceScore = c / cols;
          // Determine how far fire spreads
          const maxSpreadCol = Math.round(results.damagePercent / 6.5);
          
          if (isPlaying) {
            const currentSpreadLimit = t * maxSpreadCol;
            if (c < currentSpreadLimit) {
              if (currentSpreadLimit - c < 1.8) {
                isOnFire = true;
              } else {
                isBurnt = true;
              }
            }
          } else {
            // Static completed representation or idle
            if (c < maxSpreadCol - 1) {
              isBurnt = true;
            } else if (c === maxSpreadCol - 1) {
              isOnFire = true;
            }
          }

          // Draw fire truck putting it out if response is fast
          if (isOnFire && kebakaranResponse === "cepat" && c > 4 && t > 0.4) {
            isOnFire = false;
            isBurnt = true; // stopped
            // Draw water sprays
            ctx.strokeStyle = "#38BDF8";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tx + 50, ty - 20);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.lineWidth = 1;
          }

          if (isBurnt) {
            // Charcoal trunk
            ctx.fillStyle = "#1E293B";
            ctx.fillRect(tx + 6, ty, 3, 10);
            ctx.beginPath();
            ctx.arc(tx + 7, ty - 2, 4, 0, Math.PI*2);
            ctx.fill();
          } else {
            // Pine tree trunk
            ctx.fillStyle = "#78350F";
            ctx.fillRect(tx + 6, ty, 3, 10);
            
            // Foliage
            ctx.fillStyle = isOnFire ? "#EF4444" : "#166534";
            ctx.beginPath();
            ctx.moveTo(tx + 7, ty - 15);
            ctx.lineTo(tx - 2, ty);
            ctx.lineTo(tx + 16, ty);
            ctx.closePath();
            ctx.fill();

            if (isOnFire) {
              // Draw small flame sparks
              ctx.fillStyle = "#F59E0B";
              ctx.beginPath();
              ctx.moveTo(tx + 4, ty - 8);
              ctx.lineTo(tx + 7, ty - 22 + Math.sin(t * 100) * 4);
              ctx.lineTo(tx + 10, ty - 8);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // Wind blowing direction particles (from left to right)
      if (kebakaranWindSpeed > 10) {
        ctx.strokeStyle = "rgba(251, 146, 60, 0.3)";
        ctx.lineWidth = 2;
        const windCount = Math.round(kebakaranWindSpeed / 4);
        for (let i = 0; i < windCount; i++) {
          const wx = ((i * 45 + t * 500) % canvas.width);
          const wy = 80 + (i % 3) * 35;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + 30, wy + 2);
          ctx.stroke();
        }
        ctx.lineWidth = 1;
      }
    }

    // 5. Render Cuaca Ekstrem Scene
    else {
      // Wind particles zooming across screen
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      const windSpeed = cuacaWind;
      for (let i = 0; i < 15; i++) {
        const wx = ((i * 90 + t * windSpeed * 4) % canvas.width);
        const wy = 40 + (i % 4) * 45;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 45, wy);
        ctx.stroke();
      }

      // Draw bending trees
      const countTrees = cuacaTrees === "jarang" ? 2 : cuacaTrees === "cukup" ? 5 : 9;
      ctx.fillStyle = "#1E293B";
      for (let i = 0; i < countTrees; i++) {
        const tx = 100 + i * 50;
        const ty = 205;
        const bend = (windSpeed / 180) * 15; // amount tree bends to the right

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate((bend * Math.PI) / 180);

        // Trunk
        ctx.fillStyle = "#78350F";
        ctx.fillRect(-2, -20, 4, 20);
        // Foliage
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.arc(0, -28, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Draw houses (Roof Flying off animation)
      const houseX = [220, 420];
      const isWeakRoof = cuacaRoof === "seng";
      const isSlightlyWeak = cuacaRoof === "sedang";

      for (let i = 0; i < 2; i++) {
        const hx = houseX[i];
        const hy = 195;

        // Base building
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(hx, hy, 40, 25);
        ctx.fillStyle = "#334155";
        ctx.fillRect(hx + 15, hy + 10, 10, 15); // Door

        ctx.save();
        // Roof
        if (isPlaying && t > 0.4 && isWeakRoof) {
          // Roof flies away
          const roofProgress = (t - 0.4) / 0.6;
          ctx.translate(hx + 20 + roofProgress * 100, hy - 5 - roofProgress * 80);
          ctx.rotate((roofProgress * 45 * Math.PI) / 180);
          ctx.fillStyle = "#94A3B8";
        } else if (isPlaying && t > 0.6 && isSlightlyWeak && windSpeed > 120) {
          // Roof tilts / semi-loose
          ctx.translate(hx + 20, hy);
          ctx.rotate((12 * Math.PI) / 180);
          ctx.translate(-(hx + 20), -hy);
          ctx.fillStyle = "#EA580C";
        } else {
          ctx.fillStyle = cuacaRoof === "beton" ? "#475569" : "#EA580C";
        }

        ctx.beginPath();
        ctx.moveTo(-6 + (isPlaying && t > 0.4 && isWeakRoof ? 0 : hx), (isPlaying && t > 0.4 && isWeakRoof ? 0 : hy));
        ctx.lineTo(20 + (isPlaying && t > 0.4 && isWeakRoof ? 0 : hx), -15 + (isPlaying && t > 0.4 && isWeakRoof ? 0 : hy));
        ctx.lineTo(46 + (isPlaying && t > 0.4 && isWeakRoof ? 0 : hx), (isPlaying && t > 0.4 && isWeakRoof ? 0 : hy));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Draw Early Warning System tower
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(350, 220);
      ctx.lineTo(350, 160);
      ctx.moveTo(340, 220);
      ctx.lineTo(350, 190);
      ctx.moveTo(360, 220);
      ctx.lineTo(350, 190);
      ctx.stroke();

      // Horn speaker
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.arc(350, 160, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(350, 160);
      ctx.lineTo(362, 153);
      ctx.lineTo(362, 167);
      ctx.closePath();
      ctx.fill();

      if (cuacaWarning) {
        // Siren sound waves (flashing warning lines)
        ctx.strokeStyle = isPlaying && Math.floor(t * 15) % 2 === 0 ? "#EF4444" : "#EAB308";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(365, 160, 8, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(365, 160, 14, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }

      // Draw tornado funnel moving across screen
      if (isPlaying || windSpeed > 100) {
        const tx = isPlaying ? 50 + t * 450 : 300;
        const ty = 60;
        ctx.fillStyle = "rgba(100, 116, 139, 0.75)";
        ctx.beginPath();
        ctx.moveTo(tx - 35, ty);
        ctx.bezierCurveTo(tx - 30, ty + 50, tx - 10, ty + 100, tx - 5, ty + 150);
        ctx.lineTo(tx + 5, ty + 150);
        ctx.bezierCurveTo(tx + 10, ty + 100, tx + 30, ty + 50, tx + 35, ty);
        ctx.closePath();
        ctx.fill();

        // Spin clouds on top
        ctx.beginPath();
        ctx.ellipse(tx, ty, 40, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- Heatmap Risiko Wilayah Overlay ---
    if (showHeatmap) {
      const cellW = canvas.width / 10;
      const cellH = canvas.height / 5;

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) {
          // Calculate localized risk factor
          // In tsunami, left is shore (high risk), right is high ground (low risk)
          // structures reduce local risk
          let localRisk = 0; // 0 to 1

          if (activeDisaster === "tsunami") {
            const distanceFactor = 1 - c / 10; // Shore is left (0) to right (10)
            const magnitudeBonus = (tsunamiMag - 7) / 2.5;
            const waveBonus = tsunamiWaveHeight / 20;
            const protection = (tsunamiMangrove === "banyak" ? 0.35 : tsunamiMangrove === "sedang" ? 0.18 : 0) +
                               (tsunamiEscapeBuilding && c >= 8 ? 0.6 : 0);

            localRisk = Math.max(0, Math.min(1, (distanceFactor * 0.8 + magnitudeBonus * 0.1 + waveBonus * 0.1) - protection));
          } else if (activeDisaster === "gempa") {
            // Center is epicenter
            const centerDistance = Math.abs(c - 4) / 5; // column 4 has highest crack
            const magFactor = (gempaMag - 5) / 4;
            const soilFactor = gempaSoil === "lunak" ? 0.3 : gempaSoil === "sedang" ? 0.1 : 0;
            const structureBonus = gempaStructure === "tahan-gempa" ? 0.4 : 0;

            localRisk = Math.max(0, Math.min(1, ((1 - centerDistance) * 0.7 + magFactor * 0.3 + soilFactor) - structureBonus));
          } else if (activeDisaster === "banjir") {
            // elevation: bottom row is lower, dataran-rendah gets full risk
            const bottomFactor = r / 5;
            const rainFactor = banjirRain === "ekstrem" ? 0.8 : banjirRain === "tinggi" ? 0.6 : 0.3;
            const elevationBonus = banjirElevation === "dataran-tinggi" ? 0.5 : banjirElevation === "lereng" ? 0.25 : 0;
            const drainageReduction = (banjirDrainage === "optimal" ? 0.4 : banjirDrainage === "normal" ? 0.2 : 0) +
                                      (banjirRth === "banyak" ? 0.2 : 0);

            localRisk = Math.max(0, Math.min(1, (bottomFactor * 0.5 + rainFactor * 0.5 - elevationBonus) - drainageReduction));
          } else if (activeDisaster === "kebakaran") {
            // fire starts left (c=0) spreads right
            const progressSpread = results.damagePercent / 100;
            const windInfluence = (kebakaranWindSpeed / 60) * 0.2;
            const fbreakProtect = kebakaranFirebreak === "rapat" && c > 5 ? 0.4 : (kebakaranFirebreak === "jarang" && c > 7 ? 0.2 : 0);

            localRisk = Math.max(0, Math.min(1, ((1 - c/10) * 0.7 + progressSpread * 0.3 + windInfluence) - fbreakProtect));
          } else {
            // storm wind sweeps path
            const warnProtection = cuacaWarning ? 0.4 : 0;
            const roofQuality = cuacaRoof === "beton" ? 0.4 : cuacaRoof === "sedang" ? 0.1 : 0;
            localRisk = Math.max(0, Math.min(1, ((cuacaWind / 180) * 0.8 + (cuacaDuration / 12) * 0.2) - (warnProtection + roofQuality)));
          }

          // Convert risk score to transparent color
          let fillStyle = "rgba(34, 197, 94, 0.28)"; // Safe Green
          if (localRisk > 0.75) {
            fillStyle = "rgba(239, 68, 68, 0.42)"; // Critical Red
          } else if (localRisk > 0.45) {
            fillStyle = "rgba(249, 115, 22, 0.38)"; // Orange Risk
          } else if (localRisk > 0.18) {
            fillStyle = "rgba(234, 179, 8, 0.32)"; // Yellow Risk
          }

          ctx.fillStyle = fillStyle;
          ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
        }
      }
    }
  };

  // Run the simulation frames
  const runSimulation = () => {
    setIsPlaying(true);
    setSimProgress(0);

    const duration = 5000; // 5 seconds
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
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // --- Education analysis messages ---
  const getMitigationRecommendation = (): { summary: string; tips: string[] } => {
    if (activeDisaster === "tsunami") {
      if (tsunamiMangrove === "banyak" && tsunamiEscapeBuilding) {
        return {
          summary: "Kerja Bagus! Penggabungan vegetasi pantai (mangrove) dan fasilitas evakuasi buatan (escape building) berhasil menekan korban jiwa hingga titik terendah. Kecepatan evakuasi berjalan sangat baik.",
          tips: [
            "Hutan mangrove bertindak sebagai peredam alami gelombang tsunami, mengurangi tinggi dan laju air.",
            "Escape building menyediakan tempat aman vertikal yang cepat dijangkau saat waktu evakuasi terbatas.",
            "Terapkan tata ruang zonasi pantai agar pemukiman berjarak aman dari garis pasang laut."
          ]
        };
      } else if (!tsunamiEscapeBuilding && tsunamiMangrove === "sedikit") {
        return {
          summary: "Bahaya! Ketiadaan mitigasi di daerah padat menyebabkan kehancuran total. Gelombang menyapu pemukiman tanpa ada perlambatan vegetasi maupun lokasi pengungsian vertikal.",
          tips: [
            "Segera rencanakan penanaman bibit mangrove secara bertahap di sepanjang garis pantai.",
            "Pemerintah/komunitas perlu menetapkan jalur evakuasi yang jelas dan shelter vertikal di area pesisir.",
            "Adakan simulasi tanggap tsunami (tsunami drill) secara berkala bagi masyarakat sekitar."
          ]
        };
      } else {
        return {
          summary: "Mitigasi Parsial. Beberapa elemen mitigasi berfungsi membatasi korban, namun potensi bahaya masih cukup tinggi bagi sebagian warga pesisir.",
          tips: [
            "Tingkatkan tutupan vegetasi mangrove dari 'sedang' menjadi 'banyak' untuk efektivitas pemecah ombak optimal.",
            "Jika escape building belum memadai, petakan bukit terdekat sebagai alternatif evakuasi vertikal utama."
          ]
        };
      }
    }

    if (activeDisaster === "gempa") {
      if (gempaStructure === "tahan-gempa" && gempaSoil === "keras") {
        return {
          summary: "Mitigasi Luar Biasa! Penggunaan standar konstruksi tahan gempa (retrofitting) di tanah yang keras meminimalkan kerusakan fisik bangunan secara signifikan, menyelamatkan hampir semua jiwa.",
          tips: [
            "Struktur tahan gempa memiliki balok kolom fleksibel yang menyerap energi getaran tanpa runtuh.",
            "Tanah keras meredam guncangan gempa dibanding tanah lunak yang memperbesar amplitudo gelombang seismik.",
            "Lakukan penataan interior ruangan agar barang berat tidak mudah jatuh menghalangi pintu keluar."
          ]
        };
      } else if (gempaStructure === "sederhana" || gempaSoil === "lunak") {
        return {
          summary: "Tingkat Risiko Tinggi. Bangunan konvensional non-engineered sangat rentan roboh. Kondisi tanah lunak juga berisiko memicu likuifaksi (tanah bergerak seperti cairan).",
          tips: [
            "Lakukan penguatan (retrofitting) pada fondasi bangunan sekolah dan rumah tinggal.",
            "Hindari mendirikan bangunan permanen di zona likuifaksi tanah lunak berdasarkan peta geologi.",
            "Selalu siapkan tas siaga bencana (emergency kit) di dekat pintu keluar."
          ]
        };
      } else {
        return {
          summary: "Perlindungan Menengah. Kerusakan dapat ditekan sebagian, namun perbaikan struktural masih diperlukan.",
          tips: [
            "Ganti secara bertahap material bangunan campuran dengan struktur baja ringan atau beton bertulang terstandar.",
            "Edukasi keluarga tentang teknik merunduk, berlindung, dan bertahan (drop, cover, hold on) saat guncangan terjadi."
          ]
        };
      }
    }

    if (activeDisaster === "banjir") {
      if (banjirDrainage === "optimal" && banjirRth === "banyak" && banjirGarbage === "rendah") {
        return {
          summary: "Sistem Drainase Berjalan Sempurna! Kombinasi kapasitas serapan tanah (RTH), drainase yang bersih dari sampah, dan penataan saluran pembuangan efektif meminimalkan genangan air.",
          tips: [
            "Ruang Terbuka Hijau (RTH) menyerap air hujan langsung ke tanah (infiltrasi), mengurangi limpasan permukaan.",
            "Menjaga sungai bebas dari sampah menjaga kapasitas tampung debit air tetap maksimal saat curah hujan ekstrem.",
            "Buat sumur resapan atau biopori di pekarangan rumah untuk membantu penyerapan air lokal."
          ]
        };
      } else {
        return {
          summary: "Risiko Banjir Tinggi. Penyumbatan akibat penumpukan sampah dan minimnya daerah resapan hijau menyebabkan genangan air naik sangat cepat ke pemukiman warga.",
          tips: [
            "Mulailah gerakan kerja bakti berkala untuk membersihkan selokan dan sungai dari tumpukan sampah.",
            "Konversi lahan semen/beton kosong menjadi taman hijau atau paving block berpori.",
            "Tinggikan instalasi listrik dan barang berharga di rumah untuk mengantisipasi kenaikan air."
          ]
        };
      }
    }

    if (activeDisaster === "kebakaran") {
      if (kebakaranFirebreak !== "tidak-ada" && kebakaranResponse === "cepat") {
        return {
          summary: "Kebakaran Berhasil Terlokalisir! Keberadaan sekat bakar (firebreak) menghentikan jalur perambatan api, didukung aksi cepat tim pemadam kebakaran yang memadamkan titik api awal.",
          tips: [
            "Sekat bakar (jalur bersih tanaman) memutus pasokan bahan bakar kering yang dibutuhkan api untuk menjalar.",
            "Pemantauan dini cuaca panas dan kering membantu mendeteksi hotspot sebelum menjadi kebakaran skala besar.",
            "Hindari aktivitas membakar sampah atau lahan secara sembarangan selama musim kemarau dan angin kencang."
          ]
        };
      } else {
        return {
          summary: "Penyebaran Api Tidak Terkendali. Hutan yang kering, tiupan angin kencang, ketiadaan sekat pemutus api, dan respon pemadam yang lambat memperluas area terbakar secara eksponensial.",
          tips: [
            "Buat sekat bakar permanen selebar minimal 5-10 meter di batas hutan dan pemukiman.",
            "Bentuk kelompok relawan pemadam kebakaran hutan berbasis masyarakat untuk tindakan darurat awal.",
            "Sosialisasikan larangan membuat api unggun di kawasan rawan tanpa pengawasan ketat."
          ]
        };
      }
    }

    // Cuaca Ekstrem
    if (cuacaWarning && cuacaRoof === "beton") {
      return {
        summary: "Kesiapsiagaan Sempurna! Peringatan dini yang aktif memberikan waktu bagi warga untuk mengungsi ke shelter beton kokoh sebelum angin kencang merusak fasilitas umum.",
        tips: [
          "Sistem peringatan dini (sirene/SMS) sangat krusial dalam menyelamatkan jiwa dengan hitungan menit yang berharga.",
          "Atap beton bertulang tahan terhadap gaya angkat aerodinamis angin puting beliung dibandingkan seng ringan.",
          "Pangkas dahan pohon yang rimbun dan lapuk di sekitar rumah secara rutin agar tidak tumbang menimpa bangunan."
        ]
      };
    } else {
      return {
        summary: "Bahaya Angin Kencang! Atap seng ringan mudah terhempas angin kencang dan membahayakan warga yang panik karena tidak menerima peringatan dini terlebih dahulu.",
        tips: [
          "Pasang angkur/baut pengikat tambahan pada konstruksi atap seng agar lebih kokoh menahan hembusan angin.",
          "Bangun fasilitas peringatan dini berbasis radio komunitas atau pengeras suara tempat ibadah.",
          "Saat badai berlangsung, hindari berlindung di bawah papan reklame, tiang listrik, atau pohon besar."
        ]
      };
    }
  };

  const recommendation = getMitigationRecommendation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-3xl font-black text-ink-900 md:text-4xl">
            Simulasi Bencana Interaktif
          </h1>
          <p className="mt-2 font-sans text-sm font-medium text-ink-700 md:text-base">
            Ubah parameter mitigasi secara real-time dan pahami dampaknya secara ilmiah untuk membangun ketangguhan bencana.
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
            {showHeatmap ? "Sembunyikan Heatmap Risiko" : "Tampilkan Heatmap Risiko"}
          </button>
        </div>
      </div>

      {/* Disaster Selector Tabs */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(
          [
            { id: "tsunami", name: "Tsunami", icon: Waves, color: "text-sky-600 bg-sky-100 hover:bg-sky-200/50" },
            { id: "gempa", name: "Gempa Bumi", icon: Activity, color: "text-coral-600 bg-coral-50 hover:bg-coral-200/50" },
            { id: "banjir", name: "Banjir", icon: Droplet, color: "text-teal-600 bg-teal-100 hover:bg-teal-200/50" },
            { id: "kebakaran", name: "Kebakaran Hutan", icon: Flame, color: "text-amber-600 bg-amber-50 hover:bg-amber-200/50" },
            { id: "cuaca", name: "Cuaca Ekstrem", icon: Wind, color: "text-purple-700 bg-lavender-100 hover:bg-lavender-200/50" },
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
        {/* Left Column: Parameter Control Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl border-2 border-lavender-200/60 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b-2 border-lavender-100 pb-3">
              <h2 className="font-heading text-lg font-black text-ink-900">
                Atur Parameter
              </h2>
              <span className="rounded-full bg-lavender-100 px-2.5 py-1 text-xs font-black text-purple-700 uppercase">
                {activeDisaster}
              </span>
            </div>

            {/* Render inputs dynamically based on selected disaster */}
            <div className="flex flex-col gap-5">
              {activeDisaster === "tsunami" && (
                <>
                  {/* Tsunami controls */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="tsunami-mag">Magnitudo Gempa</label>
                      <span className="font-black text-purple-700">{tsunamiMag.toFixed(1)} SR</span>
                    </div>
                    <input
                      id="tsunami-mag"
                      type="range"
                      min="7.0"
                      max="9.5"
                      step="0.1"
                      value={tsunamiMag}
                      onChange={(e) => setTsunamiMag(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>7.0 (Sedang)</span>
                      <span>9.5 (Sangat Tinggi)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="tsunami-height">Tinggi Gelombang</label>
                      <span className="font-black text-purple-700">{tsunamiWaveHeight} meter</span>
                    </div>
                    <input
                      id="tsunami-height"
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={tsunamiWaveHeight}
                      onChange={(e) => setTsunamiWaveHeight(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>2m (Rendah)</span>
                      <span>20m (Katastrofik)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tsunami-mangrove" className="text-sm font-bold text-ink-700">Kepadatan Mangrove</label>
                    <select
                      id="tsunami-mangrove"
                      value={tsunamiMangrove}
                      onChange={(e) => setTsunamiMangrove(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700"
                    >
                      <option value="sedikit">Sedikit (Kurang Proteksi)</option>
                      <option value="sedang">Sedang (Proteksi Menengah)</option>
                      <option value="banyak">Banyak (Proteksi Maksimal)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-lavender-100/40 p-3">
                    <div>
                      <span className="block text-sm font-bold text-ink-700">Gedung Evakuasi (Escape Building)</span>
                      <span className="text-[10px] text-ink-400 font-semibold">Tersedia gedung vertical shelter kokoh</span>
                    </div>
                    <button
                      onClick={() => setTsunamiEscapeBuilding(!tsunamiEscapeBuilding)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        tsunamiEscapeBuilding ? "bg-teal-500" : "bg-lavender-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          tsunamiEscapeBuilding ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tsunami-density" className="text-sm font-bold text-ink-700">Kepadatan Penduduk Pesisir</label>
                    <select
                      id="tsunami-density"
                      value={tsunamiDensity}
                      onChange={(e) => setTsunamiDensity(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700"
                    >
                      <option value="rendah">Rendah (Sedikit Warga)</option>
                      <option value="sedang">Sedang (Rata-rata)</option>
                      <option value="tinggi">Tinggi (Sangat Padat)</option>
                    </select>
                  </div>
                </>
              )}

              {activeDisaster === "gempa" && (
                <>
                  {/* Gempa controls */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="gempa-mag">Magnitudo Gempa</label>
                      <span className="font-black text-purple-700">{gempaMag.toFixed(1)} SR</span>
                    </div>
                    <input
                      id="gempa-mag"
                      type="range"
                      min="5.0"
                      max="9.0"
                      step="0.1"
                      value={gempaMag}
                      onChange={(e) => setGempaMag(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>5.0 (Ringan)</span>
                      <span>9.0 (Katastrofik)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="gempa-depth">Kedalaman Pusat Gempa</label>
                      <span className="font-black text-purple-700">{gempaDepth} km</span>
                    </div>
                    <input
                      id="gempa-depth"
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={gempaDepth}
                      onChange={(e) => setGempaDepth(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>10 km (Dangkal - Merusak)</span>
                      <span>100 km (Dalam - Lemah)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gempa-struct" className="text-sm font-bold text-ink-700">Struktur Bangunan</label>
                    <select
                      id="gempa-struct"
                      value={gempaStructure}
                      onChange={(e) => setGempaStructure(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700"
                    >
                      <option value="sederhana">Sederhana (Non-engineered)</option>
                      <option value="campuran">Campuran (Semi-kokoh)</option>
                      <option value="tahan-gempa">Tahan Gempa (SNI Standard)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gempa-soil" className="text-sm font-bold text-ink-700">Jenis Tanah Pemukiman</label>
                    <select
                      id="gempa-soil"
                      value={gempaSoil}
                      onChange={(e) => setGempaSoil(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700"
                    >
                      <option value="keras">Tanah Keras / Batuan</option>
                      <option value="sedang">Tanah Sedang</option>
                      <option value="lunak">Tanah Lunak (Rentan Likuifaksi)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gempa-density" className="text-sm font-bold text-ink-700">Kepadatan Penduduk</label>
                    <select
                      id="gempa-density"
                      value={gempaDensity}
                      onChange={(e) => setGempaDensity(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-purple-700"
                    >
                      <option value="rendah">Rendah (Pedalaman/Pedesaan)</option>
                      <option value="sedang">Sedang (Sub-urban)</option>
                      <option value="tinggi">Tinggi (Perkotaan Padat)</option>
                    </select>
                  </div>
                </>
              )}

              {activeDisaster === "banjir" && (
                <>
                  {/* Banjir controls */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-rain" className="text-sm font-bold text-ink-700">Intensitas Curah Hujan</label>
                    <select
                      id="banjir-rain"
                      value={banjirRain}
                      onChange={(e) => setBanjirRain(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="rendah">Rendah (&lt; 20 mm/hari)</option>
                      <option value="sedang">Sedang (20-50 mm/hari)</option>
                      <option value="tinggi">Tinggi (50-100 mm/hari)</option>
                      <option value="ekstrem">Ekstrem (&gt; 100 mm/hari)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-drain" className="text-sm font-bold text-ink-700">Kapasitas Drainase Kota</label>
                    <select
                      id="banjir-drain"
                      value={banjirDrainage}
                      onChange={(e) => setBanjirDrainage(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="buruk">Sangat Buruk / Tersumbat</option>
                      <option value="kurang">Kurang Memadai</option>
                      <option value="normal">Normal / Berfungsi Baik</option>
                      <option value="optimal">Optimal / Terintegrasi</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-rth" className="text-sm font-bold text-ink-700">Ruang Terbuka Hijau (RTH)</label>
                    <select
                      id="banjir-rth"
                      value={banjirRth}
                      onChange={(e) => setBanjirRth(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="sedikit">Sedikit (Didominasi Beton)</option>
                      <option value="sedang">Sedang (Taman Seimbang)</option>
                      <option value="banyak">Banyak (Hutan Kota / Daerah Resapan)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-garbage" className="text-sm font-bold text-ink-700">Kepadatan Sampah di Sungai</label>
                    <select
                      id="banjir-garbage"
                      value={banjirGarbage}
                      onChange={(e) => setBanjirGarbage(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="tinggi">Tinggi (Sungai Tersumbat Sampah)</option>
                      <option value="sedang">Sedang (Ada Sampah Berserakan)</option>
                      <option value="rendah">Rendah (Sungai Bersih & Lancar)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="banjir-elev" className="text-sm font-bold text-ink-700">Elevasi Wilayah Pemukiman</label>
                    <select
                      id="banjir-elev"
                      value={banjirElevation}
                      onChange={(e) => setBanjirElevation(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="dataran-rendah">Dataran Rendah (Bantaran Sungai)</option>
                      <option value="lereng">Lereng Bukit</option>
                      <option value="dataran-tinggi">Dataran Tinggi</option>
                    </select>
                  </div>
                </>
              )}

              {activeDisaster === "kebakaran" && (
                <>
                  {/* Kebakaran controls */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="fire-temp">Suhu Udara Rata-Rata</label>
                      <span className="font-black text-purple-700">{kebakaranTemp}°C</span>
                    </div>
                    <input
                      id="fire-temp"
                      type="range"
                      min="20"
                      max="45"
                      step="1"
                      value={kebakaranTemp}
                      onChange={(e) => setKebakaranTemp(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>20°C (Sejuk)</span>
                      <span>45°C (Ekstrem Panas)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="fire-wind">Kecepatan Angin</label>
                      <span className="font-black text-purple-700">{kebakaranWindSpeed} km/h</span>
                    </div>
                    <input
                      id="fire-wind"
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={kebakaranWindSpeed}
                      onChange={(e) => setKebakaranWindSpeed(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>Tenang (0 km/h)</span>
                      <span>Kencang (60 km/h)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="fire-humid">Kelembapan Udara</label>
                      <span className="font-black text-purple-700">{kebakaranHumidity}%</span>
                    </div>
                    <input
                      id="fire-humid"
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={kebakaranHumidity}
                      onChange={(e) => setKebakaranHumidity(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>10% (Sangat Kering)</span>
                      <span>90% (Sangat Basah)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fire-break" className="text-sm font-bold text-ink-700">Sekat Bakar (Firebreak)</label>
                    <select
                      id="fire-break"
                      value={kebakaranFirebreak}
                      onChange={(e) => setKebakaranFirebreak(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="tidak-ada">Tidak Ada Sekat</option>
                      <option value="jarang">Jarang (Jalur Tanah 5m)</option>
                      <option value="rapat">Rapat (Sistem Sekat Hutan Terstruktur)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fire-response" className="text-sm font-bold text-ink-700">Waktu Respon Pemadam</label>
                    <select
                      id="fire-response"
                      value={kebakaranResponse}
                      onChange={(e) => setKebakaranResponse(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="lambat">Lambat (&gt; 3 Jam)</option>
                      <option value="sedang">Sedang (1 - 3 Jam)</option>
                      <option value="cepat">Cepat (&lt; 30 Menit)</option>
                    </select>
                  </div>
                </>
              )}

              {activeDisaster === "cuaca" && (
                <>
                  {/* Cuaca Ekstrem controls */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="weather-wind">Kecepatan Angin Badai</label>
                      <span className="font-black text-purple-700">{cuacaWind} km/h</span>
                    </div>
                    <input
                      id="weather-wind"
                      type="range"
                      min="50"
                      max="180"
                      step="10"
                      value={cuacaWind}
                      onChange={(e) => setCuacaWind(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>50 km/h (Angin Puyuh)</span>
                      <span>180 km/h (Topan Dahsyat)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-ink-700">
                      <label htmlFor="weather-dur">Durasi Badai</label>
                      <span className="font-black text-purple-700">{cuacaDuration} Jam</span>
                    </div>
                    <input
                      id="weather-dur"
                      type="range"
                      min="1"
                      max="12"
                      step="1"
                      value={cuacaDuration}
                      onChange={(e) => setCuacaDuration(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-lavender-200 accent-purple-700"
                    />
                    <div className="flex justify-between text-[10px] font-semibold text-ink-400">
                      <span>1 Jam (Sesaat)</span>
                      <span>12 Jam (Berkepanjangan)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="weather-roof" className="text-sm font-bold text-ink-700">Konstruksi Atap Pemukiman</label>
                    <select
                      id="weather-roof"
                      value={cuacaRoof}
                      onChange={(e) => setCuacaRoof(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="seng">Atap Seng / Genteng Ringan</option>
                      <option value="sedang">Atap Kayu & Genteng Presisi</option>
                      <option value="beton">Atap Beton Cor / Struktur Baja</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-lavender-100/40 p-3">
                    <div>
                      <span className="block text-sm font-bold text-ink-700">Sistem Peringatan Dini</span>
                      <span className="text-[10px] text-ink-400 font-semibold">Aktif menginfokan lewat alarm & HP</span>
                    </div>
                    <button
                      onClick={() => setCuacaWarning(!cuacaWarning)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        cuacaWarning ? "bg-teal-500" : "bg-lavender-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          cuacaWarning ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="weather-trees" className="text-sm font-bold text-ink-700">Kepadatan Pohon Pelindung</label>
                    <select
                      id="weather-trees"
                      value={cuacaTrees}
                      onChange={(e) => setCuacaTrees(e.target.value)}
                      className="rounded-xl border border-lavender-200 bg-white p-2.5 text-sm font-bold text-ink-700"
                    >
                      <option value="jarang">Jarang (Mudah Terhempas)</option>
                      <option value="cukup">Cukup (Menghambat Laju Angin)</option>
                      <option value="rapat">Rapat (Barier Alam Kokoh)</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visualizer & Output Stats (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* 2D Animation Screen */}
          <div className="overflow-hidden rounded-3xl border-2 border-lavender-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-lavender-100 bg-cream-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-heading text-sm font-black text-ink-900">
                  Layar Simulasi Real-Time
                </span>
              </div>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-ink-700">
                {isPlaying ? "Sedang Berjalan..." : "Siap Mulai"}
              </span>
            </div>

            {/* Canvas Frame */}
            <div className="relative bg-sky-100">
              <canvas
                ref={canvasRef}
                width="640"
                height="320"
                className="w-full aspect-[2/1] object-cover"
              />
              {/* Overlay elements */}
              {showHeatmap && (
                <div className="absolute top-4 right-4 rounded-xl bg-purple-900/90 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-sm shadow-md">
                  Overlay Risiko Wilayah Aktif
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-lavender-100/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={runSimulation}
                  disabled={isPlaying}
                  className="flex items-center gap-2 rounded-2xl bg-purple-700 px-5 py-3 font-heading text-sm font-black text-white shadow-md transition hover:bg-purple-900 hover:scale-102 active:scale-98 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  Mulai Simulasi
                </button>
                <button
                  onClick={() => {
                    stopSimulation();
                    setSimProgress(0);
                    setIsPlaying(false);
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-white border-2 border-lavender-200 px-4 py-3 font-heading text-sm font-extrabold text-ink-700 transition hover:bg-lavender-100/50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex flex-1 items-center gap-3 min-w-[200px]">
                <div className="h-2 w-full overflow-hidden rounded-full bg-lavender-200">
                  <div
                    className="h-full bg-purple-700 transition-all duration-75"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>
                <span className="font-heading text-xs font-black text-ink-700">
                  {Math.round(simProgress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Simulation Output Stats */}
          <div>
            <h3 className="mb-4 font-heading text-xl font-black text-ink-900">
              Hasil Kalkulasi Model Parametrik
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Output Card 1: Estimated Casualties */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Estimasi Korban Jiwa</span>
                  <Skull className="h-5 w-5 text-red-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">
                    {results.casualties.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs font-medium text-ink-400">Jiwa</span>
                </div>
                <div className="mt-3">
                  <span
                    className={`inline-block rounded-lg px-2.5 py-1 text-xs font-black uppercase ${
                      results.riskLevel === "Kritis"
                        ? "bg-rose-100 text-rose-700"
                        : results.riskLevel === "Tinggi"
                        ? "bg-amber-100 text-amber-700"
                        : results.riskLevel === "Sedang"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    Risiko {results.riskLevel}
                  </span>
                </div>
              </div>

              {/* Output Card 2: Damage percent */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Tingkat Kerusakan</span>
                  <Building2 className="h-5 w-5 text-orange-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">
                    {results.damagePercent}%
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-lavender-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      results.damagePercent > 70
                        ? "bg-rose-500"
                        : results.damagePercent > 40
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${results.damagePercent}%` }}
                  />
                </div>
              </div>

              {/* Output Card 3: Evacuation Time */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Waktu Evakuasi</span>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">
                    {results.evacuationTime}
                  </span>
                  <span className="text-xs font-medium text-ink-400">Menit</span>
                </div>
                <div className="mt-3 text-xs font-bold text-ink-400">
                  {results.evacuationTime < 15 ? (
                    <span className="text-emerald-600">Sangat Cepat & Aman</span>
                  ) : results.evacuationTime < 30 ? (
                    <span className="text-amber-600">Sedikit Terhambat</span>
                  ) : (
                    <span className="text-rose-600">Berbahaya / Macet</span>
                  )}
                </div>
              </div>

              {/* Output Card 4: Affected Area */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Area Terdampak</span>
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">
                    {results.affectedArea}
                  </span>
                  <span className="text-xs font-medium text-ink-400">km²</span>
                </div>
                <div className="mt-3 text-xs font-semibold text-ink-400">
                  Radius sebaran kerusakan fisik
                </div>
              </div>

              {/* Output Card 5: Mitigation Effectiveness */}
              <div className="rounded-2xl border-2 border-lavender-200/50 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-sm font-bold">Efektivitas Mitigasi</span>
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-black text-ink-900">
                    {results.mitigationEffectiveness}%
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-lavender-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${results.mitigationEffectiveness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Baseline vs Current vs Optimal Scenario Comparison Panel */}
      <div className="mt-12 rounded-3xl border-2 border-lavender-200/60 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-6 font-heading text-2xl font-black text-ink-900">
          Perbandingan Skenario (Baseline vs Kamu vs Optimal)
        </h3>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Scenario A: Baseline */}
          <div className="rounded-2xl bg-rose-50/50 border-2 border-rose-100 p-5">
            <h4 className="font-heading text-base font-black text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Skenario Baseline
            </h4>
            <p className="mt-1.5 text-xs font-medium text-ink-700 leading-relaxed">
              Curah bahaya tinggi tanpa perlindungan mitigasi buatan maupun alam.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Efektivitas Mitigasi</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-rose-200 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${baselineResults.mitigationEffectiveness}%` }} />
                  </div>
                  <span className="text-xs font-black text-rose-700">{baselineResults.mitigationEffectiveness}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Tingkat Kerusakan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-rose-200 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${baselineResults.damagePercent}%` }} />
                  </div>
                  <span className="text-xs font-black text-rose-700">{baselineResults.damagePercent}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Estimasi Korban</span>
                <p className="font-heading text-lg font-black text-rose-700">{baselineResults.casualties.toLocaleString("id-ID")} Jiwa</p>
              </div>
            </div>
          </div>

          {/* Scenario B: Current Selection */}
          <div className="rounded-2xl bg-purple-50/40 border-2 border-purple-200 p-5 shadow-inner scale-102">
            <h4 className="font-heading text-base font-black text-purple-900 flex items-center gap-2">
              <Info className="h-5 w-5 shrink-0 text-purple-700" />
              Parameter Kamu (Saat Ini)
            </h4>
            <p className="mt-1.5 text-xs font-medium text-ink-700 leading-relaxed">
              Hasil simulasi berdasarkan pengaturan tombol geser yang kamu sesuaikan.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Efektivitas Mitigasi</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-purple-200 overflow-hidden">
                    <div className="h-full bg-purple-700" style={{ width: `${results.mitigationEffectiveness}%` }} />
                  </div>
                  <span className="text-xs font-black text-purple-900">{results.mitigationEffectiveness}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Tingkat Kerusakan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-purple-200 overflow-hidden">
                    <div className="h-full bg-purple-700" style={{ width: `${results.damagePercent}%` }} />
                  </div>
                  <span className="text-xs font-black text-purple-900">{results.damagePercent}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Estimasi Korban</span>
                <p className="font-heading text-lg font-black text-purple-900">{results.casualties.toLocaleString("id-ID")} Jiwa</p>
              </div>
            </div>
          </div>

          {/* Scenario C: Optimal */}
          <div className="rounded-2xl bg-teal-50/50 border-2 border-teal-100 p-5">
            <h4 className="font-heading text-base font-black text-teal-700 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              Skenario Optimal
            </h4>
            <p className="mt-1.5 text-xs font-medium text-ink-700 leading-relaxed">
              Kondisi kesiapsiagaan maksimum dengan mitigasi tata ruang ideal.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Efektivitas Mitigasi</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-teal-200 overflow-hidden">
                    <div className="h-full bg-teal-600" style={{ width: `${optimalResults.mitigationEffectiveness}%` }} />
                  </div>
                  <span className="text-xs font-black text-teal-700">{optimalResults.mitigationEffectiveness}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Tingkat Kerusakan</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-teal-200 overflow-hidden">
                    <div className="h-full bg-teal-600" style={{ width: `${optimalResults.damagePercent}%` }} />
                  </div>
                  <span className="text-xs font-black text-teal-700">{optimalResults.damagePercent}%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-ink-400">Estimasi Korban</span>
                <p className="font-heading text-lg font-black text-teal-700">{optimalResults.casualties.toLocaleString("id-ID")} Jiwa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <div className="mt-8 rounded-3xl border-2 border-lavender-200 bg-cream-50 p-6 sm:p-8">
        <h3 className="font-heading text-xl font-black text-ink-900 flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-purple-700" />
          Rekomendasi & Analisis Mitigasi
        </h3>
        
        <p className="mt-3 font-sans text-sm font-semibold text-ink-700 leading-relaxed">
          {recommendation.summary}
        </p>

        <div className="mt-6 border-t border-lavender-200 pt-6">
          <h4 className="font-heading text-sm font-black text-ink-900 uppercase tracking-wide">
            Langkah Siaga Bagi Warga:
          </h4>
          <ul className="mt-3 flex flex-col gap-3">
            {recommendation.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 font-heading text-[10px] font-black text-white">
                  {idx + 1}
                </span>
                <p className="font-sans text-sm font-semibold text-ink-700">
                  {tip}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
