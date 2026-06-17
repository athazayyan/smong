"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Activity,
  Info,
  Shield,
  Trophy,
  Waves,
  BookOpen,
  Camera,
  Star,
  Zap,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type MotionId =
  | "jongkok"
  | "tangan_di_kepala"
  | "lari_di_tempat"
  | "silang_tangan"
  | "tunjuk_arah";

type Phase =
  | "MODE_SELECTION"
  | "WAITING_FOR_PLAYER"
  | "COUNTDOWN"
  | "TASK_SHOW"
  | "ACTION"
  | "SNAP"
  | "FINAL_RESULT";

interface Scenario {
  id: string;
  title: string;
  situation: string;
  instructions: string;
  targetMotionId: MotionId;
  feedback: string;
  smong?: string;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface RoundScore {
  p1: number;
  p2: number;
  scenario: Scenario;
}

// ─── Scenario Pool (20 skenario, 5 dipilih acak per game) ─────────────────────

const SCENARIO_POOL: Scenario[] = [
  {
    id: "s1",
    title: "Gempa di Kelas",
    situation: "Lantai bergetar keras saat pelajaran! Benda-benda berjatuhan dari rak buku.",
    instructions: "Drop, Cover, Hold! (Jongkok Rendah)",
    targetMotionId: "jongkok",
    feedback: "Merendahkan tubuh (Drop) melindungimu dari guncangan utama dan serpihan langit-langit yang runtuh.",
  },
  {
    id: "s2",
    title: "Gempa di Rumah",
    situation: "Plafon kamarmu retak-retak dan serpihan mulai jatuh akibat gempa!",
    instructions: "Lindungi Kepala! (Tangan di atas kepala)",
    targetMotionId: "tangan_di_kepala",
    feedback: "Tangan di kepala melindungi bagian paling vital dari benturan benda keras yang jatuh.",
  },
  {
    id: "s3",
    title: "Peringatan Tsunami",
    situation: "Setelah gempa kuat, air laut mendadak surut jauh. Bau amis menyengat dari pantai!",
    instructions: "Lari ke Tempat Tinggi! (Gerakan lari)",
    targetMotionId: "lari_di_tempat",
    feedback: "Ingat Smong: gempa kuat + laut surut = tanda tsunami! Lari ke bukit tanpa menunggu siapapun.",
    smong: "Smong adalah kearifan lokal Simeulue, Aceh — syair nenek moyang tentang tanda-tanda tsunami yang menyelamatkan ribuan jiwa di tahun 2004.",
  },
  {
    id: "s4",
    title: "Banjir Bandang",
    situation: "Arus banjir deras mengalir deras di jalanan kampung. Warga banyak yang coba menerobos!",
    instructions: "Jangan Masuk Arus! (Silang tangan)",
    targetMotionId: "silang_tangan",
    feedback: "Arus banjir setinggi lutut pun bisa menyeret orang dewasa. Jangan pernah mencoba menerobosnya!",
  },
  {
    id: "s5",
    title: "Kebakaran Gedung",
    situation: "Alarm berbunyi keras! Asap mengepul dari koridor bawah gedung bertingkat.",
    instructions: "Tunjuk Jalur Evakuasi! (Tunjuk arah)",
    targetMotionId: "tunjuk_arah",
    feedback: "Selalu ikuti rambu EXIT berwarna hijau. Jangan panik dan jangan gunakan lift saat kebakaran!",
  },
  {
    id: "s6",
    title: "Gempa Saat Tidur",
    situation: "Tengah malam, gempa mengguncang keras saat semua sedang tidur!",
    instructions: "Drop, Cover, Hold! (Jongkok rendah)",
    targetMotionId: "jongkok",
    feedback: "Dalam kondisi apapun, merendahkan badan dan berlindung di bawah meja atau kasur adalah langkah pertama yang benar.",
  },
  {
    id: "s7",
    title: "Longsor di Jalan",
    situation: "Tiba-tiba tanah bergerak dan pohon-pohon besar tumbang di depanmu!",
    instructions: "Lindungi Kepala! (Tangan di atas kepala)",
    targetMotionId: "tangan_di_kepala",
    feedback: "Saat longsor, kepala adalah bagian tubuh yang paling rentan tertimpa material. Lindungi selalu!",
  },
  {
    id: "s8",
    title: "Gempa di Mal",
    situation: "Saat berbelanja, mal tiba-tiba berguncang. Orang-orang berlarian panik ke semua arah!",
    instructions: "Drop di Tempat! (Jongkok rendah)",
    targetMotionId: "jongkok",
    feedback: "Jangan berlari saat gempa terjadi. Drop, Cover, Hold di tempat kamu berdiri sampai guncangan berhenti.",
  },
  {
    id: "s9",
    title: "Banjir di Rumah",
    situation: "Air mulai masuk ke dalam rumah akibat hujan deras. Aliran semakin deras!",
    instructions: "Jangan Masuk Arus! (Silang tangan)",
    targetMotionId: "silang_tangan",
    feedback: "Matikan listrik terlebih dahulu lalu evakuasi. Jangan pernah berjalan di dalam air banjir yang mengalir deras.",
  },
  {
    id: "s10",
    title: "Kebakaran di Dapur",
    situation: "Api dari kompor membesar dan mulai merambat ke dinding dapur!",
    instructions: "Tunjuk Pintu Keluar! (Tunjuk arah)",
    targetMotionId: "tunjuk_arah",
    feedback: "Pastikan semua anggota keluarga tahu letak pintu keluar. Jangan buang waktu mengambil barang — prioritaskan keselamatan jiwa!",
  },
  {
    id: "s11",
    title: "Gempa di Jalan Raya",
    situation: "Gempa mengguncang saat kamu berjalan di trotoar. Gedung-gedung di sekitar bergoyang!",
    instructions: "Lindungi Kepala! (Tangan di atas kepala)",
    targetMotionId: "tangan_di_kepala",
    feedback: "Di luar ruangan, lindungi kepala dan jauh dari gedung, tiang listrik, atau pohon besar yang bisa roboh.",
  },
  {
    id: "s12",
    title: "Evakuasi Tsunami",
    situation: "Sirine peringatan tsunami berbunyi di pesisir pantai. Semua warga harus segera bergerak!",
    instructions: "Lari ke Tempat Tinggi! (Gerakan lari)",
    targetMotionId: "lari_di_tempat",
    feedback: "Saat sirine berbunyi, tidak ada waktu untuk ragu. Jalur evakuasi telah ditandai — ikuti dan lari ke titik kumpul di ketinggian!",
    smong: "Di Simeulue, anak-anak diajari syair Smong sejak kecil. Pengetahuan turun-temurun ini terbukti menyelamatkan nyawa saat bencana datang tanpa peringatan teknologi.",
  },
  {
    id: "s13",
    title: "Gunung Meletus (Awan Panas)",
    situation: "Terdengar gemuruh dahsyat dari puncak gunung api dan kepulan awan panas bergulung turun!",
    instructions: "Lindungi Pernapasan! (Silangkan tangan di dada/muka)",
    targetMotionId: "silang_tangan",
    feedback: "Gunakan masker atau kain basah, silangkan tangan menutupi muka untuk menghalau abu vulkanik panas masuk ke paru-paru.",
  },
  {
    id: "s14",
    title: "Angin Puting Beliung",
    situation: "Pusaran angin raksasa terlihat mendekati sekolahmu. Seng atap mulai berhamburan!",
    instructions: "Rendahkan Posisi! (Jongkok di dekat dinding)",
    targetMotionId: "jongkok",
    feedback: "Jauhi jendela kaca dan dinding luar. Jongkok serendah mungkin di sudut dalam ruangan yang kokoh untuk menghindari puing terbang.",
  },
  {
    id: "s15",
    title: "Kebakaran Sekolah (Asap Tebal)",
    situation: "Sekolah mengalami kebakaran dan koridor dipenuhi asap hitam tebal di bagian atas!",
    instructions: "Merangkak Menghindar Asap! (Jongkok sangat rendah)",
    targetMotionId: "jongkok",
    feedback: "Udara bersih berada di bawah dekat lantai. Merangkak atau jongkok rendah membantu Anda bernapas saat evakuasi.",
  },
  {
    id: "s16",
    title: "Gempa di Tepi Pantai",
    situation: "Gempa mengguncang sangat keras saat kamu sedang bermain pasir di pantai wisata!",
    instructions: "Lari ke Arah Bukit! (Gerakan lari)",
    targetMotionId: "lari_di_tempat",
    feedback: "Jangan menunggu alarm. Berlari secepat mungkin menjauhi garis pantai menuju dataran tinggi untuk menghindari potensi tsunami.",
  },
  {
    id: "s17",
    title: "Banjir Luapan Sungai",
    situation: "Tanggul sungai jebol dan air setinggi pinggang mulai menggenangi area perumahan!",
    instructions: "Tunjuk Rute Aman Terdekat! (Tunjuk arah)",
    targetMotionId: "tunjuk_arah",
    feedback: "Tunjuk dan pandu orang lain ke arah jalan yang lebih tinggi dan kering untuk evakuasi bersama.",
  },
  {
    id: "s18",
    title: "Puting Beliung di Lapangan",
    situation: "Angin kencang berputar kencang di tengah lapangan terbuka, tiada bangunan terdekat!",
    instructions: "Tiarap di Cekungan! (Jongkok sedalam mungkin)",
    targetMotionId: "jongkok",
    feedback: "Jika terjebak di luar ruangan, tiaraplah di parit atau cekungan tanah sambil melindungi kepala untuk menghindari angin badai.",
  },
  {
    id: "s19",
    title: "Letusan Gunung (Hujan Abu)",
    situation: "Abu vulkanik pekat dan kerikil mulai berjatuhan dari langit di sekitar pemukiman!",
    instructions: "Lindungi Kepala & Wajah! (Tangan di atas kepala)",
    targetMotionId: "tangan_di_kepala",
    feedback: "Lindungi kepala dari jatuhan kerikil panas dengan tangan atau benda keras seperti helm/papan kayu.",
  },
  {
    id: "s20",
    title: "Tanah Longsor Bukit",
    situation: "Terdengar suara dentuman tanah dan terlihat longsoran lumpur mulai turun dari lereng bukit!",
    instructions: "Lari Tegak Lurus Aliran! (Gerakan lari)",
    targetMotionId: "lari_di_tempat",
    feedback: "Segera lari tegak lurus menjauhi arah runtuhan material tanah. Jangan lari searah dengan luncuran tanah longsor.",
  },
];

// Fisher-Yates (Knuth) Shuffle untuk pengacakan soal yang merata
function pickScenarios(pool: Scenario[], count = 5): Scenario[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled.slice(0, count);
}

// ─── Stickman Pose Preview Component ──────────────────────────────────────────
export function StickmanPreview({ motionId, className = "h-20 w-20" }: { motionId: MotionId; className?: string }) {
  let head = { cx: 50, cy: 25, r: 8 };
  let neck = { x: 50, y: 33 };
  let spine = { x1: 50, y1: 33, x2: 50, y2: 60 };
  let lShoulder = { x: 40, y: 36 };
  let rShoulder = { x: 60, y: 36 };
  let lHip = { x: 45, y: 60 };
  let rHip = { x: 55, y: 60 };

  let lArm = { e: { x: 30, y: 45 }, w: { x: 20, y: 55 } }; 
  let rArm = { e: { x: 70, y: 45 }, w: { x: 80, y: 55 } }; 
  let lLeg = { k: { x: 45, y: 75 }, a: { x: 45, y: 90 } }; 
  let rLeg = { k: { x: 55, y: 75 }, a: { x: 55, y: 90 } }; 

  if (motionId === "jongkok") {
    head = { cx: 50, cy: 50, r: 8 };
    neck = { x: 50, y: 58 };
    spine = { x1: 50, y1: 58, x2: 50, y2: 75 };
    lShoulder = { x: 42, y: 60 };
    rShoulder = { x: 58, y: 60 };
    lHip = { x: 45, y: 75 };
    rHip = { x: 55, y: 75 };
    lArm = { e: { x: 38, y: 42 }, w: { x: 46, y: 46 } };
    rArm = { e: { x: 62, y: 42 }, w: { x: 54, y: 46 } };
    lLeg = { k: { x: 30, y: 80 }, a: { x: 42, y: 90 } };
    rLeg = { k: { x: 70, y: 80 }, a: { x: 58, y: 90 } };
  } else if (motionId === "tangan_di_kepala") {
    lArm = { e: { x: 35, y: 22 }, w: { x: 45, y: 20 } };
    rArm = { e: { x: 65, y: 22 }, w: { x: 55, y: 20 } };
  } else if (motionId === "lari_di_tempat") {
    lArm = { e: { x: 32, y: 44 }, w: { x: 26, y: 35 } }; 
    rArm = { e: { x: 68, y: 48 }, w: { x: 72, y: 58 } }; 
    lLeg = { k: { x: 32, y: 70 }, a: { x: 32, y: 82 } };
    rLeg = { k: { x: 58, y: 75 }, a: { x: 58, y: 90 } };
  } else if (motionId === "silang_tangan") {
    lArm = { e: { x: 40, y: 44 }, w: { x: 56, y: 40 } }; 
    rArm = { e: { x: 60, y: 44 }, w: { x: 44, y: 40 } }; 
  } else if (motionId === "tunjuk_arah") {
    lArm = { e: { x: 30, y: 45 }, w: { x: 20, y: 55 } }; 
    rArm = { e: { x: 72, y: 36 }, w: { x: 88, y: 36 } }; 
  }

  return (
    <svg viewBox="0 0 100 100" className={`${className} overflow-visible`} aria-hidden="true">
      <defs>
        <filter id="stickman-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={head.cx} cy={head.cy} r={head.r} className="stroke-purple-700 fill-purple-100" strokeWidth="4" />
      <line x1={spine.x1} y1={spine.y1} x2={spine.x2} y2={spine.y2} className="stroke-purple-700" strokeWidth="4.5" strokeLinecap="round" />
      <line x1={lShoulder.x} y1={lShoulder.y} x2={rShoulder.x} y2={rShoulder.y} className="stroke-purple-700" strokeWidth="4.5" strokeLinecap="round" />
      <path d={`M ${lShoulder.x} ${lShoulder.y} L ${lArm.e.x} ${lArm.e.y} L ${lArm.w.x} ${lArm.w.y}`} className="stroke-purple-700 fill-none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${rShoulder.x} ${rShoulder.y} L ${rArm.e.x} ${rArm.e.y} L ${rArm.w.x} ${rArm.w.y}`} className="stroke-purple-700 fill-none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={lHip.x} y1={lHip.y} x2={rHip.x} y2={rHip.y} className="stroke-purple-700" strokeWidth="4.5" strokeLinecap="round" />
      <path d={`M ${lHip.x} ${lHip.y} L ${lLeg.k.x} ${lLeg.k.y} L ${lLeg.a.x} ${lLeg.a.y}`} className="stroke-purple-700 fill-none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${rHip.x} ${rHip.y} L ${rLeg.k.x} ${rLeg.k.y} L ${rLeg.a.x} ${rLeg.a.y}`} className="stroke-purple-700 fill-none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Skeleton Connections (MediaPipe 33-point) ────────────────────────────────

const CONNECTIONS: [number, number][] = [
  [11, 12], [11, 23], [12, 24], [23, 24],
  [11, 13], [13, 15], [12, 14], [14, 16],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [0, 11], [0, 12],
];

const PLAYER_COLORS = ["#10B981", "#06B6D4"] as const;
const TOTAL_ROUNDS = 5;

// ─── Heuristic Pose Checker ───────────────────────────────────────────────────

interface KneeState {
  leftPrevY: number;
  rightPrevY: number;
  steps: number;
}

function getAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (magAB === 0 || magCB === 0) return 180;
  const cos = dot / (magAB * magCB);
  const angleRad = Math.acos(Math.max(-1, Math.min(1, cos)));
  return (angleRad * 180) / Math.PI;
}

function checkPose(lms: Landmark[], motionId: MotionId, kneeState?: KneeState): number {
  if (!lms || lms.length < 29) return 0;
  const lm = (i: number) => lms[i];
  const ok = (i: number) => (lms[i]?.visibility ?? 1) > 0.35;

  const torsoHeight = Math.hypot(
    (lm(11).x + lm(12).x)/2 - (lm(23).x + lm(24).x)/2,
    (lm(11).y + lm(12).y)/2 - (lm(23).y + lm(24).y)/2
  ) || 0.3;

  const shoulderWidth = Math.hypot(
    lm(11).x - lm(12).x,
    lm(11).y - lm(12).y
  ) || 0.25;

  switch (motionId) {
    case "jongkok": {
      if (!ok(23) || !ok(24) || !ok(25) || !ok(26)) return 0;
      const lKneeAngle = ok(27) ? getAngle(lm(23), lm(25), lm(27)) : 180;
      const rKneeAngle = ok(28) ? getAngle(lm(24), lm(26), lm(28)) : 180;
      const avgKneeAngle = (lKneeAngle + rKneeAngle) / 2;
      const squatScoreKnee = avgKneeAngle < 130
        ? Math.max(0, Math.min(100, ((130 - avgKneeAngle) / 50) * 100))
        : Math.max(0, Math.min(40, ((160 - avgKneeAngle) / 80) * 40));
      
      let squatScoreHeight = 0;
      if (ok(27) && ok(28)) {
        const avgHipY = (lm(23).y + lm(24).y) / 2;
        const avgAnkleY = (lm(27).y + lm(28).y) / 2;
        const hipAnkleDist = avgAnkleY - avgHipY;
        const normalizedDist = hipAnkleDist / torsoHeight;
        squatScoreHeight = Math.max(0, Math.min(100, ((0.85 - normalizedDist) / 0.5) * 100));
      } else {
        squatScoreHeight = squatScoreKnee;
      }
      return Math.round(Math.max(squatScoreKnee, squatScoreHeight));
    }
    case "tangan_di_kepala": {
      if (!ok(0) || !ok(15) || !ok(16)) return 0;
      const noseY = lm(0).y;
      const lDist = (noseY - lm(15).y) / torsoHeight;
      const rDist = (noseY - lm(16).y) / torsoHeight;
      const lScore = Math.max(0, Math.min(100, ((lDist + 0.1) / 0.3) * 100));
      const rScore = Math.max(0, Math.min(100, ((rDist + 0.1) / 0.3) * 100));
      return Math.round((lScore + rScore) / 2);
    }
    case "lari_di_tempat": {
      if (!kneeState || !ok(25) || !ok(26)) return 0;
      const lDelta = kneeState.leftPrevY - lm(25).y;
      const rDelta = kneeState.rightPrevY - lm(26).y;
      kneeState.leftPrevY = lm(25).y;
      kneeState.rightPrevY = lm(26).y;
      const stepThreshold = torsoHeight * 0.12;
      if (lDelta > stepThreshold || rDelta > stepThreshold) {
        kneeState.steps = Math.min(kneeState.steps + 1, 10);
      }
      return Math.round((kneeState.steps / 7) * 100);
    }
    case "silang_tangan": {
      if (!ok(11) || !ok(12) || !ok(15) || !ok(16) || !ok(23) || !ok(24)) return 0;
      const crossed = lm(16).x - lm(15).x;
      const crossScore = Math.max(0, Math.min(100, ((crossed / shoulderWidth) + 0.2) / 0.5 * 100));
      const midShoulderY = (lm(11).y + lm(12).y) / 2;
      const midHipY = (lm(23).y + lm(24).y) / 2;
      const inChest =
        lm(15).y > midShoulderY - torsoHeight * 0.15 && lm(15).y < midHipY + torsoHeight * 0.15 &&
        lm(16).y > midShoulderY - torsoHeight * 0.15 && lm(16).y < midHipY + torsoHeight * 0.15;
      return Math.round(crossScore * (inChest ? 1.0 : 0.45));
    }
    case "tunjuk_arah": {
      if (!ok(11) || !ok(12) || !ok(15) || !ok(16)) return 0;
      const lExt = Math.max(0, Math.min(100, ((lm(15).x - lm(11).x) / shoulderWidth) * 100));
      const lAlign = Math.max(0, 1 - Math.abs(lm(15).y - lm(11).y) / (torsoHeight * 0.45));
      const rExt = Math.max(0, Math.min(100, ((lm(12).x - lm(16).x) / shoulderWidth) * 100));
      const rAlign = Math.max(0, 1 - Math.abs(lm(16).y - lm(12).y) / (torsoHeight * 0.45));
      return Math.round(Math.max(lExt * lAlign, rExt * rAlign));
    }
    default: return 0;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MotionGameContainer() {
  const [phase, setPhase] = useState<Phase>("MODE_SELECTION");
  const [playerMode, setPlayerMode] = useState<1 | 2>(1);
  const [rounds, setRounds] = useState<Scenario[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [actionTimer, setActionTimer] = useState(4);
  const [liveAccuracy, setLiveAccuracy] = useState<[number, number]>([0, 0]);
  const [peakAccuracy, setPeakAccuracy] = useState<[number, number]>([0, 0]);
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [snapScore, setSnapScore] = useState<[number, number]>([0, 0]);
  const [isFlash, setIsFlash] = useState(false);
  const [cameraOk, setCameraOk] = useState<boolean | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [detectedCount, setDetectedCount] = useState(0);
  const [taskShowTimer, setTaskShowTimer] = useState(3);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const kneeRef = useRef<[KneeState, KneeState]>([
    { leftPrevY: 0.7, rightPrevY: 0.7, steps: 0 },
    { leftPrevY: 0.7, rightPrevY: 0.7, steps: 0 },
  ]);

  // Use refs for values accessed inside the RAF loop to avoid stale closures
  const currentMotionRef = useRef<MotionId>("jongkok");
  const peakRef = useRef<[number, number]>([0, 0]);
  const isDetectingRef = useRef(false);
  const phaseRef = useRef<Phase>("MODE_SELECTION");
  const playerModeRef = useRef<1 | 2>(1);
  const detectedCountRef = useRef(0);
  const stableFramesRef = useRef(0);

  const currentScenario = rounds[roundIndex];

  // Sync state to refs
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Handle navbar visibility during gameplay
  useEffect(() => {
    const isGameplay = phase !== "MODE_SELECTION" && phase !== "FINAL_RESULT";
    if (isGameplay) {
      document.body.classList.add("gameplay-active");
    } else {
      document.body.classList.remove("gameplay-active");
    }
    return () => {
      document.body.classList.remove("gameplay-active");
    };
  }, [phase]);

  useEffect(() => {
    playerModeRef.current = playerMode;
  }, [playerMode]);

  // ─── Load MediaPipe ──────────────────────────────────────────────────────────
  useEffect(() => {
    let done = false;
    async function load() {
      try {
        setLoadPct(15);
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        if (done) return;
        setLoadPct(45);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );
        if (done) return;
        setLoadPct(70);
        const det = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/pose_landmarker_full.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 2,
        });
        if (done) return;
        detectorRef.current = det;
        setLoadPct(100);
        setModelLoaded(true);
      } catch (e) {
        console.error("MediaPipe error:", e);
        setLoadPct(100);
        setModelLoaded(true);
      }
    }
    load();
    return () => { done = true; };
  }, []);

  // ─── Camera — START ONCE, KEEP RUNNING ───────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (videoRef.current?.srcObject) return; // already running
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await new Promise<void>((res) => {
        if (!videoRef.current) { res(); return; }
        videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); res(); };
      });
      setCameraOk(true);
    } catch {
      setCameraOk(false);
    }
  }, []);

  const stopCameraFully = useCallback(() => {
    isDetectingRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const vid = videoRef.current;
    if (vid?.srcObject) {
      (vid.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      vid.srcObject = null;
    }
    setCameraOk(null);
  }, []);

  // ─── Draw Skeleton ────────────────────────────────────────────────────────────
  const drawSkeleton = useCallback(
    (ctx: CanvasRenderingContext2D, sets: Landmark[][], w: number, h: number) => {
      ctx.clearRect(0, 0, w, h);
      sets.forEach((lms, pi) => {
        if (!lms?.length) return;
        const c = PLAYER_COLORS[pi] ?? PLAYER_COLORS[0];
        ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.shadowColor = c; ctx.shadowBlur = 10;
        for (const [a, b] of CONNECTIONS) {
          const pa = lms[a]; const pb = lms[b];
          if (!pa || !pb) continue;
          if ((pa.visibility ?? 1) < 0.3 || (pb.visibility ?? 1) < 0.3) continue;
          ctx.beginPath();
          ctx.moveTo(pa.x * w, pa.y * h);
          ctx.lineTo(pb.x * w, pb.y * h);
          ctx.stroke();
        }
        ctx.fillStyle = c; ctx.shadowBlur = 6;
        [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(i => {
          const lm = lms[i];
          if (!lm || (lm.visibility ?? 1) < 0.3) return;
          ctx.beginPath();
          ctx.arc(lm.x * w, lm.y * h, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }, []
  );

  // ─── Detection RAF Loop ───────────────────────────────────────────────────────
  const startDetection = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !detectorRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    isDetectingRef.current = true;

    const loop = () => {
      if (!isDetectingRef.current) return;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        rafRef.current = requestAnimationFrame(loop); return;
      }
      lastVideoTimeRef.current = video.currentTime;

      try {
        const result = detectorRef.current.detectForVideo(video, performance.now());
        let ordered: Landmark[][] = [...(result.landmarks ?? [])];

        if (ordered.length === 2) {
          const avgX = (lms: Landmark[]) =>
            lms[23] && lms[24] ? (lms[23].x + lms[24].x) / 2 : lms[0]?.x ?? 0.5;
          ordered.sort((a, b) => avgX(b) - avgX(a)); // descending X → P1 left on mirrored screen
        }

        drawSkeleton(ctx, ordered, W, H);

        const detectedNum = ordered.length;
        if (detectedCountRef.current !== detectedNum) {
          detectedCountRef.current = detectedNum;
          setDetectedCount(detectedNum);
        }

        // WAITING FOR PLAYER state transition logic (15 stable frames)
        if (phaseRef.current === "WAITING_FOR_PLAYER") {
          const mode = playerModeRef.current;
          if (ordered.length >= mode) {
            stableFramesRef.current += 1;
            if (stableFramesRef.current >= 15) {
              stableFramesRef.current = 0;
              setTimeout(() => {
                setPhase("COUNTDOWN");
              }, 10);
            }
          } else {
            stableFramesRef.current = 0;
          }
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        const motionId = currentMotionRef.current;
        const live: [number, number] = [0, 0];
        ordered.forEach((lms, i) => {
          if (i > 1 || !lms?.length) return;
          live[i] = checkPose(lms, motionId,
            motionId === "lari_di_tempat" ? kneeRef.current[i] : undefined
          );
        });

        setLiveAccuracy([...live] as [number, number]);
        const newPeak: [number, number] = [
          Math.max(peakRef.current[0], live[0]),
          Math.max(peakRef.current[1], live[1]),
        ];
        peakRef.current = newPeak;
        setPeakAccuracy([...newPeak]);
      } catch { /* ignore frame errors */ }

      rafRef.current = requestAnimationFrame(loop);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [drawSkeleton]);

  const stopDetection = useCallback(() => {
    isDetectingRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  // ─── Round Reset ──────────────────────────────────────────────────────────────
  const resetRound = useCallback((motionId: MotionId) => {
    peakRef.current = [0, 0];
    setPeakAccuracy([0, 0]);
    setLiveAccuracy([0, 0]);
    currentMotionRef.current = motionId;
    kneeRef.current = [
      { leftPrevY: 0.7, rightPrevY: 0.7, steps: 0 },
      { leftPrevY: 0.7, rightPrevY: 0.7, steps: 0 },
    ];
  }, []);

  // ─── Phase Transitions ────────────────────────────────────────────────────────

  // WAITING_FOR_PLAYER phase
  useEffect(() => {
    if (phase !== "WAITING_FOR_PLAYER") return;
    stableFramesRef.current = 0;
    startCamera();
    startDetection();
  }, [phase, startCamera, startDetection]);

  // Self-healing: trigger startDetection when camera is ready and model is loaded
  useEffect(() => {
    if (cameraOk && modelLoaded && (phase === "WAITING_FOR_PLAYER" || phase === "COUNTDOWN" || phase === "TASK_SHOW" || phase === "ACTION")) {
      startDetection();
    }
  }, [cameraOk, modelLoaded, phase, startDetection]);

  // COUNTDOWN phase
  useEffect(() => {
    if (phase !== "COUNTDOWN") return;
    setCountdown(4);
    startCamera(); // idempotent
    startDetection(); // draw skeleton during countdown

    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(id); setPhase("TASK_SHOW"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, startCamera, startDetection]);

  // TASK_SHOW phase
  useEffect(() => {
    if (phase !== "TASK_SHOW") return;
    setTaskShowTimer(3);

    const id = setInterval(() => {
      setTaskShowTimer(t => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("ACTION");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ACTION phase
  useEffect(() => {
    if (phase !== "ACTION") return;
    setActionTimer(4);

    const id = setInterval(() => {
      setActionTimer(t => {
        if (t <= 1) {
          clearInterval(id);
          // SNAP: freeze score, flash effect, and auto-advance
          const finalScore = peakRef.current;
          setSnapScore([...finalScore] as [number, number]);
          stopDetection(); // Freeze canvas skeleton drawing!
          setIsFlash(true);
          setTimeout(() => setIsFlash(false), 400);
          setPhase("SNAP");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, stopDetection]);

  // SNAP phase — auto-advance after 2.8s
  useEffect(() => {
    if (phase !== "SNAP" || !currentScenario) return;

    const timer = setTimeout(() => {
      // Save score
      setRoundScores(prev => [
        ...prev,
        { p1: snapScore[0], p2: snapScore[1], scenario: currentScenario },
      ]);

      if (roundIndex + 1 >= TOTAL_ROUNDS) {
        stopCameraFully();
        setPhase("FINAL_RESULT");
      } else {
        const nextIndex = roundIndex + 1;
        setRoundIndex(nextIndex);
        resetRound(rounds[nextIndex]?.targetMotionId ?? "jongkok");
        setPhase("COUNTDOWN"); // Skip narrative screen entirely!
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [phase, roundIndex, currentScenario, rounds, resetRound, stopCameraFully, snapScore]);

  // ─── Game Start ───────────────────────────────────────────────────────────────
  const startGame = useCallback((mode: 1 | 2) => {
    setPlayerMode(mode);
    const selected = pickScenarios(SCENARIO_POOL, TOTAL_ROUNDS);
    setRounds(selected);
    setRoundIndex(0);
    setRoundScores([]);
    resetRound(selected[0].targetMotionId);
    setPhase("WAITING_FOR_PLAYER"); // Go to calibration phase first!
    startCamera();
  }, [resetRound, startCamera]);

  const restartGame = useCallback(() => {
    stopCameraFully();
    setPhase("MODE_SELECTION");
  }, [stopCameraFully]);

  // ─── Styling Helper ──────────────────────────────────────────────────────────
  const motionHint: Record<MotionId, string> = {
    jongkok: "Tekuk lutut, rendahkan badan sejauh mungkin ke depan kamera.",
    tangan_di_kepala: "Angkat kedua tangan ke atas kepala, lebih tinggi dari hidung.",
    lari_di_tempat: "Angkat lutut kiri-kanan bergantian cepat, seperti lari di tempat.",
    silang_tangan: "Silangkan pergelangan tangan di depan dada — kiri di atas kanan.",
    tunjuk_arah: "Luruskan satu tangan ke samping, sejajar dengan bahu.",
  };

  const scoreColor = (s: number) =>
    s >= 75 ? "text-emerald-700 font-extrabold" : s >= 60 ? "text-amber-700 font-extrabold" : "text-rose-700 font-extrabold";

  const scoreBg = (s: number) =>
    s >= 75
      ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-[inset_0_2px_4px_rgba(16,185,129,0.05)]"
      : s >= 60
        ? "bg-amber-50 border-amber-200 text-amber-800 shadow-[inset_0_2px_4px_rgba(245,158,11,0.05)]"
        : "bg-rose-50 border-rose-200 text-rose-800 shadow-[inset_0_2px_4px_rgba(239,68,68,0.05)]";

  const totalP1 = roundScores.reduce((a, r) => a + r.p1, 0);
  const totalP2 = roundScores.reduce((a, r) => a + r.p2, 0);

  const isActiveGameplay =
    phase === "WAITING_FOR_PLAYER" ||
    phase === "COUNTDOWN" ||
    phase === "TASK_SHOW" ||
    phase === "ACTION" ||
    phase === "SNAP";

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-cream-50 text-ink-900 font-sans overflow-x-hidden relative flex flex-col justify-between ${isActiveGameplay ? "md:min-h-screen" : ""}`}>
      {/* Decorative bg blobs matching light theme */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-lavender-200/40 blur-3xl animate-pulse" style={{ animationDuration: "15s" }} />
        <div className="absolute bottom-0 right-0 h-[40rem] w-[40rem] rounded-full bg-teal-100/20 blur-3xl animate-pulse" style={{ animationDuration: "18s" }} />
        <div className="absolute top-1/2 left-1/2 h-72 w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/30 blur-3xl" />
      </div>

      {/* Camera flash overlay */}
      <AnimatePresence>
        {isFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-[100] bg-white"
          />
        )}
      </AnimatePresence>


      <main className={`mx-auto w-full max-w-6xl flex-1 flex flex-col justify-center ${isActiveGameplay ? "p-0 md:px-6 md:py-10" : "px-4 py-8 md:px-6 md:py-10"}`}>

        {/* ─── LOADING ──────────────────────────────────────────────────────── */}
        {!modelLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-sm rounded-[2rem] border border-lavender-200 bg-white/95 p-10 text-center shadow-[0_20px_50px_rgba(47,23,110,0.05)] backdrop-blur-md"
          >
            <Activity className="mx-auto mb-4 h-12 w-12 animate-pulse text-purple-700" />
            <h3 className="mb-2 font-heading text-xl font-bold text-purple-900">Memuat Detektor AI</h3>
            <p className="mb-5 text-sm font-medium text-ink-700">
              Mengunduh model MediaPipe Pose Landmarker…
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-lavender-200">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-teal-400"
                style={{ width: `${loadPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-mono font-bold text-ink-400">{loadPct}%</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {/* ─── MODE SELECTION ───────────────────────────────────────────────── */}
          {modelLoaded && phase === "MODE_SELECTION" && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="space-y-8 max-w-4xl mx-auto w-full"
            >
              <div className="text-center">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-100/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-700">
                  <BookOpen className="h-3.5 w-3.5" /> {TOTAL_ROUNDS} Ronde · Edukasi Mitigasi Bencana
                </span>
                <h1 className="font-heading text-4xl font-extrabold text-purple-900 drop-shadow-sm md:text-5xl">
                  Pilih Mode Bermain
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm md:text-base font-medium leading-relaxed text-ink-700">
                  Mainkan {TOTAL_ROUNDS} skenario darurat kebencanaan berbasis gerakan tubuh. AI akan mendeteksi keaktifan dan merekam akurasi pose terbaik Anda!
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Solo */}
                <motion.button
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame(1)}
                  className="group relative overflow-hidden rounded-[2rem] border-2 border-teal-200/80 bg-gradient-to-br from-teal-50/50 to-white p-8 text-left shadow-[0_12px_36px_rgba(26,146,120,0.06)] hover:border-teal-400 hover:shadow-lg transition-all"
                >
                  <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-teal-200 bg-white shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                  </div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-[0_4px_0_0_#15803D] transition-transform group-hover:-translate-y-1">
                    <User className="h-7 w-7" />
                  </div>
                  <h3 className="mb-1 font-heading text-2xl font-bold text-ink-900">1 Player</h3>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-700">Solo Challenge</p>
                  <p className="text-sm font-medium leading-relaxed text-ink-600">
                    Latih respon tanggap darurat sendirian. AI memotret pose terbaikmu pada hitungan detik terakhir di setiap skenario.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-teal-700">
                    Mulai Bermain <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>

                {/* Duel */}
                <motion.button
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame(2)}
                  className="group relative overflow-hidden rounded-[2rem] border-2 border-purple-200/80 bg-gradient-to-br from-purple-50/50 to-white p-8 text-left shadow-[0_12px_36px_rgba(126,34,206,0.06)] hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-purple-200 bg-white shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                  </div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-700 text-white shadow-[0_4px_0_0_#6B21A8] transition-transform group-hover:-translate-y-1">
                    <Users className="h-7 w-7" />
                  </div>
                  <h3 className="mb-1 font-heading text-2xl font-bold text-ink-900">2 Players</h3>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-purple-700">Survival Duel</p>
                  <p className="text-sm font-medium leading-relaxed text-ink-600">
                    Bermain berdua berdampingan. AI akan mendeteksi kedua pose sekaligus — siapa yang bertindak paling sigap dan berakurasi paling tinggi?
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-purple-700">
                    Mulai Duel <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              </div>

              {/* Pool Scenarios Preview */}
              <div className="rounded-[1.5rem] border border-lavender-200 bg-white/75 px-6 py-4 shadow-sm backdrop-blur-md">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-purple-700">
                  {SCENARIO_POOL.length} Skenario Darurat Kebencanaan Tersedia:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SCENARIO_POOL.map(s => (
                    <span key={s.id} className="rounded-full border border-lavender-200 bg-lavender-50 px-3 py-1 text-xs font-semibold text-ink-700">
                      {s.title}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ACTIVE GAME LAYOUT (Kamera Penuh Tanpa Unmount & Kalibrasi Awal) ────── */}
          {(phase === "WAITING_FOR_PLAYER" || phase === "COUNTDOWN" || phase === "TASK_SHOW" || phase === "ACTION" || phase === "SNAP") && (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl mx-auto flex flex-col items-center md:gap-6 gap-0"
            >
              {/* Camera view container with deep purple frame - responsive fullscreen on mobile */}
              <div className="overflow-hidden bg-slate-950 shadow-[0_25px_60px_-15px_rgba(47,23,110,0.18)] md:relative md:w-full md:aspect-[4/3] md:rounded-[2rem] md:border-4 md:border-purple-900 fixed inset-0 z-40 w-screen h-screen rounded-none border-0">
                {/* Live Video */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                  muted
                />

                {/* Skeleton Canvas overlay */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />

                {/* HUD Top-bottom safety gradients */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/65 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                {/* Camera access error */}
                {cameraOk === false && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/95 p-6 text-center z-20">
                    <AlertTriangle className="h-12 w-12 text-rose-500 animate-bounce" />
                    <p className="font-heading text-lg font-bold text-white">Kamera Tidak Bisa Diakses</p>
                    <p className="max-w-xs text-sm text-slate-400">Izinkan akses kamera pada browser Anda agar AI dapat melacak pose tubuh Anda.</p>
                    <button onClick={startCamera} className="mt-3 rounded-full bg-purple-700 hover:bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md">
                      Coba Lagi
                    </button>
                  </div>
                )}

                {/* 1. HUD - Top Left: Scenario Info (Unified white glass card) */}
                {phase === "ACTION" && currentScenario && (
                  <div className="absolute left-6 top-6 flex flex-col gap-1.5 max-w-[70%] pointer-events-none z-10 bg-white/90 border border-lavender-200 px-4 py-3 rounded-2xl shadow-md backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-700 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
                        Ronde {roundIndex + 1} / {TOTAL_ROUNDS}
                      </span>
                      {playerMode === 2 && (
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-bold uppercase text-cyan-700 border border-cyan-200">
                          Mode Duel
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-heading text-lg md:text-2xl font-bold text-purple-950 leading-tight">
                        {currentScenario.title}
                      </h2>
                      <p className="text-[11px] font-medium text-ink-700 mt-1 leading-snug">
                        "{currentScenario.situation}"
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. HUD - Top Right: State/Timer Badge */}
                <div className="absolute right-3 top-3 md:right-6 md:top-6 pointer-events-none z-10">
                  {phase === "ACTION" && (
                    <div className="flex items-center gap-1.5 md:gap-2 rounded-2xl bg-coral-500 border border-coral-400 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-white shadow-lg animate-pulse">
                      <Activity className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="font-mono text-base md:text-lg font-black tracking-tight">{actionTimer}s</span>
                    </div>
                  )}
                  {phase === "COUNTDOWN" && (
                    <div className="flex items-center gap-1.5 md:gap-2 rounded-2xl bg-amber-400 border border-amber-300 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-slate-900 shadow-lg">
                      <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 animate-bounce" />
                      <span className="tracking-wide uppercase font-extrabold text-[10px] md:text-xs">PERSIAPAN</span>
                    </div>
                  )}
                  {phase === "TASK_SHOW" && (
                    <div className="flex items-center gap-1.5 md:gap-2 rounded-2xl bg-purple-600 border border-purple-500 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-white shadow-lg animate-pulse">
                      <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="tracking-wide uppercase font-extrabold text-[10px] md:text-xs">SKENARIO</span>
                    </div>
                  )}
                  {phase === "WAITING_FOR_PLAYER" && (
                    <div className="flex items-center gap-1.5 md:gap-2 rounded-2xl bg-purple-600 border border-purple-500 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-white shadow-lg">
                      <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-white" />
                      </span>
                      <span className="tracking-wide uppercase font-extrabold text-[10px] md:text-xs">DETEKSI AI</span>
                    </div>
                  )}
                  {phase === "SNAP" && (
                    <div className="flex items-center gap-1.5 md:gap-2 rounded-2xl bg-teal-500 border border-teal-400 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold text-white shadow-lg">
                      <Camera className="h-3.5 w-3.5 md:h-4 md:w-4 animate-pulse" />
                      <span className="text-[10px] md:text-xs font-bold">TERFOTO</span>
                    </div>
                  )}
                </div>

                {/* 3. HUD - Bottom Center: Action Instruction & Stickman Peraga */}
                {phase === "ACTION" && currentScenario && (
                  <div className="absolute left-3 right-3 bottom-3 md:left-6 md:right-6 md:bottom-6 flex flex-col gap-2 pointer-events-none items-center text-center z-10">
                    <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50/98 px-4 py-2.5 shadow-md backdrop-blur-sm max-w-xl w-full text-left">
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-teal-700">TINDAKAN MITIGASI</p>
                        <p className="font-heading text-sm md:text-lg font-black text-purple-950 leading-tight">
                          {currentScenario.instructions}
                        </p>
                        <p className="text-[10px] md:text-xs font-medium text-ink-600 mt-1 truncate">
                          {motionHint[currentScenario.targetMotionId]}
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col items-center gap-0.5 bg-white border border-purple-200 rounded-xl p-1 md:p-1.5 shadow-xs">
                        <span className="text-[7px] font-bold text-purple-700 uppercase tracking-widest leading-none mb-0.5">Peraga</span>
                        <StickmanPreview motionId={currentScenario.targetMotionId} className="h-10 w-10 md:h-12 md:w-12" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. HUD - Player Position Guides (2 Players Mode) */}
                {playerMode === 2 && phase === "ACTION" && (
                  <div className="absolute inset-x-0 bottom-28 flex justify-between px-6 pointer-events-none z-10">
                    <span className="rounded-full border border-teal-200 bg-white/90 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-teal-700 shadow-md">
                      ← Pemain 1 (Hijau)
                    </span>
                    <span className="rounded-full border border-cyan-200 bg-white/90 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-cyan-700 shadow-md">
                      Pemain 2 (Biru) →
                    </span>
                  </div>
                )}

                {/* 5. WAITING FOR PLAYER (Calibration & Player Presence Check) */}
                <AnimatePresence>
                  {phase === "WAITING_FOR_PLAYER" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs z-15"
                    >
                      <div className="max-w-md w-full mx-auto p-6 rounded-2xl bg-white border border-lavender-200 shadow-xl text-center flex flex-col items-center gap-4">
                        {/* Pulsing radar */}
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 border border-purple-200 text-purple-700">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-20" />
                          <Camera className="h-6 w-6" />
                        </div>

                        <div>
                          <h3 className="font-heading text-xl font-bold text-purple-900 leading-none">
                            Mendeteksi Posisi Pemain
                          </h3>
                          <p className="text-xs font-semibold text-ink-600 mt-2 leading-relaxed">
                            {playerMode === 1
                              ? "Silakan berdiri di depan kamera. Menunggu Anda bersiap..."
                              : "Harap berdiri berdampingan. Menunggu kedua pemain bersiap..."}
                          </p>
                        </div>

                        {/* Status bar */}
                        <div className="w-full bg-lavender-50 border border-lavender-100 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                          {detectedCount >= playerMode ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-bounce" />
                              <span className="text-xs font-extrabold text-emerald-700">
                                Pose Terdeteksi! Bersiaplah...
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-600" />
                              </span>
                              <span className="text-xs font-bold text-purple-700 animate-pulse">
                                {playerMode === 1
                                  ? "Mencari Pemain..."
                                  : `Mencari Pemain (${detectedCount}/2 Terdeteksi)...`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 6. COUNTDOWN OVERLAY */}
                <AnimatePresence>
                  {phase === "COUNTDOWN" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs z-15"
                    >
                      <motion.span
                        key={countdown}
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 450, damping: 15 }}
                        className="font-heading text-[10rem] font-black leading-none text-purple-900"
                        style={{ textShadow: "0 0 45px rgba(109, 40, 217, 0.4)" }}
                      >
                        {countdown}
                      </motion.span>
                      <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-purple-900">
                        Lakukan Posisi Mitigasi!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 6.5 TASK SHOW OVERLAY */}
                <AnimatePresence>
                  {phase === "TASK_SHOW" && currentScenario && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs z-15"
                    >
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
                        className="w-full max-w-sm md:max-w-md bg-white/95 border border-lavender-200 p-5 md:p-6 rounded-2xl shadow-xl text-center backdrop-blur-md text-ink-900 animate-fade-in"
                      >
                        <span className="rounded-full bg-purple-100 border border-purple-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-purple-700">
                          RONDE {roundIndex + 1}
                        </span>
                        <h3 className="font-heading text-xl md:text-2xl font-bold text-purple-900 mt-2">
                          {currentScenario.title}
                        </h3>
                        <p className="text-xs font-semibold text-ink-600 mt-2 bg-lavender-50/50 p-2.5 md:p-3 rounded-xl border border-lavender-100/50">
                          "{currentScenario.situation}"
                        </p>

                        <div className="mt-4 border-t border-dashed border-lavender-200 pt-4 flex flex-col items-center">
                          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">TINDAKAN ANDA</p>
                          <p className="font-heading text-base md:text-lg font-black text-purple-955 mt-1 leading-tight">
                            {currentScenario.instructions}
                          </p>
                          
                          {/* Large Stickman Preview */}
                          <div className="my-3 flex flex-col items-center justify-center bg-purple-50/50 border border-purple-100 rounded-2xl p-3 shadow-inner">
                            <StickmanPreview motionId={currentScenario.targetMotionId} className="h-24 w-24 md:h-28 md:w-28 bg-white border border-purple-200 rounded-xl p-2 shadow-sm" />
                            <span className="text-[9px] font-bold text-purple-700 mt-1.5 uppercase tracking-widest">Contoh Peragaan</span>
                          </div>

                          <p className="text-[11px] text-ink-500 italic font-medium">
                            Siapkan gerakan ini sekarang!
                          </p>
                        </div>

                        {/* 3s preview progress line */}
                        <div className="mt-5 flex items-center justify-between text-[10px] font-bold text-purple-700">
                          <span>Bersiap...</span>
                          <span className="font-mono">{taskShowTimer}s</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-lavender-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: 0 }}
                            transition={{ duration: 3.0, ease: "linear" }}
                            className="h-full bg-purple-600"
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 7. SNAPSHOT OVERLAY (Polaroid Card) */}
                <AnimatePresence>
                  {phase === "SNAP" && currentScenario && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs z-15"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.15, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
                        className="w-full max-w-sm bg-white p-5 pb-8 rounded-lg shadow-[0_25px_60px_rgba(47,23,110,0.3)] border-[10px] border-white text-slate-900"
                      >
                        {/* Polaroid header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-purple-700">
                            <Camera className="h-4 w-4" /> Snapshot Gerakan
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            Ronde {roundIndex + 1}/{TOTAL_ROUNDS}
                          </span>
                        </div>

                        <div className="text-center">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Pertanyaan</p>
                          <h3 className="font-heading text-lg font-bold text-slate-800 mb-4 leading-tight">
                            {currentScenario.title}
                          </h3>

                          {playerMode === 1 ? (
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-[10px] font-bold text-purple-900 uppercase tracking-widest">Akurasi Pose Terbaik</p>
                              <div className={`inline-flex items-center gap-2.5 rounded-full border-2 px-6 py-2.5 ${scoreBg(snapScore[0])}`}>
                                {snapScore[0] >= 60 ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600 animate-bounce" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-rose-600" />
                                )}
                                <span className={`font-mono text-3xl font-black tracking-tight ${scoreColor(snapScore[0])}`}>
                                  {snapScore[0]}%
                                </span>
                              </div>
                              <p className={`font-heading text-sm font-black mt-2 ${snapScore[0] >= 60 ? "text-emerald-700" : "text-rose-700"}`}>
                                {snapScore[0] >= 75 ? "Sangat Sigap! 🎉" : snapScore[0] >= 60 ? "Cukup Tanggap! 👍" : "Kurang Tepat 😅"}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold text-purple-900 uppercase tracking-widest">Akurasi Pose Terbaik</p>
                              <div className="grid grid-cols-2 gap-4">
                                {([0, 1] as const).map(pi => (
                                  <div key={pi} className={`rounded-xl border-2 p-3 ${scoreBg(snapScore[pi])}`}>
                                    <div className="mb-1 flex items-center justify-center gap-1.5">
                                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLAYER_COLORS[pi] }} />
                                      <span className="text-[10px] font-bold text-slate-700">Pemain {pi + 1}</span>
                                    </div>
                                    <p className={`font-mono text-2xl font-black tracking-tight ${scoreColor(snapScore[pi])}`}>
                                      {snapScore[pi]}%
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mitigasi Feedback */}
                          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-3 text-left">
                            <p className="text-xs font-semibold leading-relaxed text-slate-600">
                              <span className="font-extrabold text-purple-700">💡 Info Edukasi: </span>
                              {currentScenario.feedback}
                            </p>
                          </div>
                        </div>

                        {/* Ticking load bar */}
                        <div className="mt-5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.8, ease: "linear" }}
                            className="h-full bg-purple-600"
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ─── FINAL RESULT ─────────────────────────────────────────────────── */}
          {phase === "FINAL_RESULT" && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="mx-auto max-w-2xl space-y-6 w-full"
            >
              {/* Trophy layout */}
              <div className="relative overflow-hidden rounded-[2rem] border border-lavender-200 bg-white/80 p-8 text-center shadow-[0_15px_45px_rgba(47,23,110,0.05)] backdrop-blur-md">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -top-12 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
                </div>
                <div className="relative z-10 animate-fade-in">
                  <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-500" />
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink-400">
                    Hasil Akhir · {TOTAL_ROUNDS} Ronde Selesai
                  </p>
                  <h2 className="font-heading text-3xl font-bold text-purple-900 md:text-4xl">
                    Papan Skor Kebencanaan
                  </h2>

                  {playerMode === 2 && (
                    <div className="mt-6 flex items-center justify-center gap-8 border-t border-b border-lavender-200/60 py-5">
                      <div className="text-center">
                        <p className="font-mono text-4xl font-black tracking-tight" style={{ color: PLAYER_COLORS[0] }}>
                          {Math.round(totalP1 / TOTAL_ROUNDS)}%
                        </p>
                        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-1">Pemain 1 (Rata)</p>
                      </div>
                      <div className="text-center text-xl font-bold text-lavender-300">VS</div>
                      <div className="text-center">
                        <p className="font-mono text-4xl font-black tracking-tight" style={{ color: PLAYER_COLORS[1] }}>
                          {Math.round(totalP2 / TOTAL_ROUNDS)}%
                        </p>
                        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-1">Pemain 2 (Rata)</p>
                      </div>
                    </div>
                  )}

                  {playerMode === 2 && (
                    <div className="mt-5">
                      {totalP1 > totalP2 ? (
                        <span className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-heading text-base font-bold text-white shadow-lg" style={{ backgroundColor: PLAYER_COLORS[0], boxShadow: `0 4px 15px ${PLAYER_COLORS[0]}33` }}>
                          <Trophy className="h-4 w-4" /> Pemain 1 Lebih Tanggap!
                        </span>
                      ) : totalP2 > totalP1 ? (
                        <span className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-heading text-base font-bold text-white shadow-lg" style={{ backgroundColor: PLAYER_COLORS[1], boxShadow: `0 4px 15px ${PLAYER_COLORS[1]}33` }}>
                          <Trophy className="h-4 w-4" /> Pemain 2 Lebih Tanggap!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-lavender-100 border border-lavender-200 px-6 py-2.5 font-heading text-base font-bold text-purple-700 shadow-md">
                          🤝 Hasil Seri! Keduanya Sigap!
                        </span>
                      )}
                    </div>
                  )}

                  {playerMode === 1 && (
                    <div className="mt-6 py-4 bg-lavender-50/50 rounded-2xl border border-lavender-100 max-w-xs mx-auto">
                      <p className="font-mono text-5xl font-black tracking-tight text-teal-600">
                        {Math.round(totalP1 / TOTAL_ROUNDS)}%
                      </p>
                      <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-1.5">Rata-rata Akurasi Aksi</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Per-round detailed list */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Analisis Per Ronde</p>
                {roundScores.map((rs, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-4 rounded-2xl border px-5 py-4 bg-white/70 border-lavender-200 hover:bg-white/95 transition-colors`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender-100 font-heading text-sm font-black text-purple-700 border border-lavender-200">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-bold text-purple-900">{rs.scenario.title}</p>
                      <p className="truncate text-[10px] font-semibold text-ink-400">{rs.scenario.instructions}</p>
                    </div>
                    {playerMode === 1 ? (
                      <div className="flex items-center gap-2 bg-lavender-50 px-3 py-1.5 rounded-xl border border-lavender-100">
                        {rs.p1 >= 60 ? (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500" />
                        )}
                        <span className={`font-mono text-sm font-black ${rs.p1 >= 75 ? "text-emerald-600" : rs.p1 >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                          {rs.p1}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-lavender-50 px-3 py-1.5 rounded-xl border border-lavender-100">
                        <span className="font-mono text-sm font-black" style={{ color: PLAYER_COLORS[0] }}>{rs.p1}%</span>
                        <span className="text-xs text-ink-300 font-bold">vs</span>
                        <span className="font-mono text-sm font-black" style={{ color: PLAYER_COLORS[1] }}>{rs.p2}%</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Local knowledge: Smong Simeulue */}
              {roundScores.some(r => r.scenario.smong) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative overflow-hidden rounded-[2rem] border border-lavender-200 bg-white/70 p-6 shadow-sm backdrop-blur-md"
                >
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-200/20 blur-2xl" />
                  <div className="relative z-10">
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-700">
                      <Waves className="h-3.5 w-3.5" /> Kearifan Lokal: Smong Simeulue
                    </p>
                    <p className="text-xs md:text-sm font-medium leading-relaxed text-ink-700">
                      {roundScores.find(r => r.scenario.smong)?.scenario.smong}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Replay action */}
              <button
                onClick={restartGame}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-700 hover:bg-purple-600 py-4 font-heading text-base font-bold text-white shadow-[0_5px_0_0_#2F176E] transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
              >
                <RotateCcw className="h-4 w-4" /> Main Lagi
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {!isActiveGameplay && (
        <footer className="border-t border-lavender-200/70 py-5 text-center text-xs font-semibold text-ink-400 bg-white/30 backdrop-blur-sm">
          <span className="text-purple-700">SMONG</span> · Platform Edukasi Kesiapsiagaan Bencana · AI Pose Detection by MediaPipe
        </footer>
      )}
    </div>
  );
}
