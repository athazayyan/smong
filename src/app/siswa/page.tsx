"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  GraduationCap, 
  ShieldAlert, 
  Award, 
  BookOpen, 
  Zap, 
  Calendar, 
  KeyRound, 
  Plus, 
  X, 
  Check, 
  Settings, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { mockStudentLandingState } from "@/features/student-landing/data/mock-landing";
import { studentHeroStats } from "@/features/student-landing/data/visual-config";
import type { SchoolSyncStatus, StudentLandingSection } from "@/features/student-landing/types";

import { StudentHero } from "@/features/student-landing/components/StudentHero";
import { StudentMascotGuide } from "@/features/student-landing/components/StudentMascotGuide";
import { DailyMissionSection } from "@/features/student-landing/components/DailyMissionSection";
import { StudentModulePathPreview } from "@/features/student-landing/components/StudentModulePathPreview";
import { DisasterModuleCards } from "@/features/student-landing/components/DisasterModuleCards";
import { StudentArPreview } from "@/features/student-landing/components/StudentArPreview";
import { StudentProgressReward } from "@/features/student-landing/components/StudentProgressReward";

type DashboardRole = "student" | "teacher" | "expert";

interface BmkgAlertData {
  disaster: "gempa" | "banjir" | "tsunami" | "none";
  level: "waspada" | "siaga" | "awas" | "aman";
  title: string;
  description: string;
  actionGuide: string;
}

const DEFAULT_ALERT: BmkgAlertData = {
  disaster: "gempa",
  level: "siaga",
  title: "Peringatan Dini Gempa Bumi",
  description: "Aktivitas subduksi lempeng terdeteksi di Barat Daya Sumatra. Potensi getaran sedang dirasakan di pesisir.",
  actionGuide: "1. Tetap tenang dan jangan panik.\n2. Masuk ke bawah meja kokoh jika guncangan terjadi.\n3. Jauhi kaca, cermin, dan benda gantung yang rentan jatuh.\n4. Siapkan tas siaga bencana di dekat pintu keluar."
};

export default function CombinedStudentHomeDashboard() {
  const state = mockStudentLandingState;
  
  // States
  const [activeRole, setActiveRole] = useState<DashboardRole>("student");
  const [displayName, setDisplayName] = useState("Rina");
  const [gradeLevel, setGradeLevel] = useState("sd");
  const [schoolSync, setSchoolSync] = useState<SchoolSyncStatus>("not-synced");
  const [schoolName, setSchoolName] = useState("SD Negeri 01 Banda Aceh");
  const [schoolCodeInput, setSchoolCodeInput] = useState("");
  const [isSyncSuccess, setIsSyncSuccess] = useState(false);
  const [xp, setXp] = useState(1250);
  const [streak, setStreak] = useState(3);
  
  const [bmkgAlert, setBmkgAlert] = useState<BmkgAlertData>(DEFAULT_ALERT);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState(false);

  const [mounted, setMounted] = useState(false);

  // Load states on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedAlert = localStorage.getItem("bmkg_alert");
      if (storedAlert) {
        try {
          setBmkgAlert(JSON.parse(storedAlert));
        } catch (e) {
          console.error("Failed to parse stored alert", e);
        }
      } else {
        localStorage.setItem("bmkg_alert", JSON.stringify(DEFAULT_ALERT));
      }
      
      const storedName = localStorage.getItem("student_display_name") || "Rina";
      setDisplayName(storedName);
      const storedGrade = localStorage.getItem("student_grade_level") || "sd";
      setGradeLevel(storedGrade);
      const storedSync = localStorage.getItem("student_school_sync") as SchoolSyncStatus || "not-synced";
      setSchoolSync(storedSync);
      const storedSchoolName = localStorage.getItem("student_school_name") || "SD Negeri 01 Banda Aceh";
      setSchoolName(storedSchoolName);
    }
  }, []);

  // Expert alert publish
  const handleDispatchAlert = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("bmkg_alert", JSON.stringify(bmkgAlert));
    setAlertSuccessMsg(true);
    setTimeout(() => setAlertSuccessMsg(false), 3000);
  };

  // Profile save
  const handleSaveProfile = () => {
    localStorage.setItem("student_display_name", displayName);
    localStorage.setItem("student_grade_level", gradeLevel);
    alert("Profil berhasil diperbarui!");
  };

  // Class connection sync
  const handleSyncSchool = () => {
    if (schoolCodeInput.trim().toUpperCase() === "SMG-7K2P") {
      setSchoolSync("synced");
      setSchoolName("SD Negeri 01 Banda Aceh");
      localStorage.setItem("student_school_sync", "synced");
      localStorage.setItem("student_school_name", "SD Negeri 01 Banda Aceh");
      setIsSyncSuccess(true);
      setTimeout(() => setIsSyncSuccess(false), 3000);
    } else {
      alert("Kode sekolah tidak valid! Gunakan kode: SMG-7K2P");
    }
  };

  const handleDisconnectSchool = () => {
    setSchoolSync("not-synced");
    localStorage.setItem("student_school_sync", "not-synced");
    setSchoolCodeInput("");
  };

  const heroStats = studentHeroStats.map((stat) => {
    if (stat.id === "xp") {
      return { ...stat, value: xp.toLocaleString("id-ID") };
    }
    if (stat.id === "streak") {
      return { ...stat, value: `${streak}` };
    }
    return { ...stat, value: "4/12" };
  });

  if (!mounted) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-purple-900 border-t-transparent animate-spin" />
          <p className="text-xs font-black text-purple-900 uppercase tracking-widest">Loading MitigaKids...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden pb-28 bg-cream-50 font-sans">
      
      {/* 1. HERO SECTION */}
      <StudentHero 
        title={`Halo, ${displayName}! Siap Jadi Pahlawan Misi?`}
        subtitle="Belajar langkah aman lewat jalur misi, simulasi gempa, dan cerita yang mudah dipahami."
        primaryCtaLabel="Lanjutkan Misi"
        secondaryCtaLabel="Lihat Modul"
        stats={heroStats}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:gap-12 sm:px-6 lg:gap-16 lg:px-8 mt-6">
        
        {/* MASCOT & INSTRUCTION GUIDES */}
        <StudentMascotGuide />

        {/* DAILY MISSION */}
        <DailyMissionSection activityId="daily-1" />

        {/* MODULE PATH PREVIEW */}
        <StudentModulePathPreview moduleGroupId={state.activeModuleId} />

        {/* DISASTER SELECTION CARDS */}
        <DisasterModuleCards moduleGroupIds={["gempa-bumi", "banjir", "tsunami"]} />

        {/* WEB AR PREVIEW CARD */}
        <StudentArPreview />

        {/* PROGRESS REWARD SUMMARY */}
        <StudentProgressReward progress={state.progress} />

        {/* ─── DOCKABLE INTEGRATED DASHBOARD PANEL ─── */}
        <div className="border-t-4 border-dashed border-purple-200 pt-10 flex flex-col gap-6" id="beranda-section">
          
          {/* Beranda Header & Role Switcher */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-purple-950/5 p-6 rounded-[2rem] border border-purple-700/8 shadow-sm">
            <div>
              <h2 className="font-heading text-2xl font-black text-purple-900 leading-tight">Pengaturan Sekolah & Profil Beranda</h2>
              <p className="text-xs font-semibold text-ink-700 mt-1">
                Ganti peran ke Guru untuk memantau nilai kelas, atau Ahli Bencana untuk mengirim info peringatan.
              </p>
            </div>
            
            <div className="flex gap-1 bg-white/90 p-1.5 rounded-full border border-purple-200 shadow-sm shrink-0">
              {(["student", "teacher", "expert"] as const).map((r) => {
                const label = r === "student" ? "Siswa" : r === "teacher" ? "Guru" : "Ahli Bencana";
                const Icon = r === "student" ? User : r === "teacher" ? GraduationCap : ShieldCheck;
                const isActive = activeRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => setActiveRole(r)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition-all ${
                      isActive
                        ? "bg-purple-900 text-white shadow-sm"
                        : "text-ink-700 hover:bg-lavender-100/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE PANEL CONTENT */}
          <div className="transition-all duration-300">
            
            {/* ROLE 1: STUDENT VIEW */}
            {activeRole === "student" && (
              <div className="grid gap-6 md:grid-cols-[1fr_320px] grid-cols-1">
                
                {/* Badge Achievements */}
                <div className="flex flex-col gap-6">
                  <div className="rounded-[2rem] border border-purple-700/8 bg-white p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)] flex flex-col gap-4">
                    <h3 className="font-heading text-lg font-black text-purple-900 flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-700" />
                      Badge Mitigasi Pencapaian Siswa
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <BadgeCard id="siaga-gempa" name="Pendeteksi Gempa" desc="Selesai Bab Siap Sebelum" unlocked />
                      <BadgeCard id="ahli-evakuasi" name="Ahli Evakuasi" desc="Selesai Bab Saat Gempa" unlocked />
                      <BadgeCard id="mitigator-muda" name="Mitigator Muda" desc="Menyelesaikan Sertifikasi" unlocked={false} />
                      <BadgeCard id="penjelajah" name="Nusantara Ranger" desc="Menyelesaikan Kearifan Lokal" unlocked={false} />
                    </div>
                  </div>

                  {/* BMKG Warning Box */}
                  <div className="rounded-[2rem] border border-orange-200 bg-orange-50/50 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-650 animate-bounce" />
                      <h3 className="font-heading text-lg font-black text-orange-950">Info Siaga BMKG Terkini</h3>
                    </div>
                    
                    <div className={`p-4 rounded-2xl border ${
                      bmkgAlert.level === "awas"
                        ? "bg-red-50 border-red-200 text-red-900"
                        : bmkgAlert.level === "siaga"
                        ? "bg-orange-50 border-orange-200 text-orange-900"
                        : bmkgAlert.level === "waspada"
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-emerald-50 border-emerald-250 text-emerald-900"
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-heading text-sm font-black uppercase tracking-wider">{bmkgAlert.title}</h4>
                          <p className="text-xs font-semibold mt-1 leading-relaxed">{bmkgAlert.description}</p>
                          
                          {bmkgAlert.actionGuide && (
                            <div className="mt-3 pt-3 border-t border-purple-200/10">
                              <p className="text-xs font-bold uppercase tracking-widest text-purple-900">Petunjuk Tindakan:</p>
                              <pre className="mt-1 font-sans text-xs font-semibold whitespace-pre-wrap leading-relaxed text-ink-800">
                                {bmkgAlert.actionGuide}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Sync Module */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-[2rem] border border-purple-700/8 bg-white p-5 shadow-sm">
                    <h4 className="font-heading text-sm font-black text-purple-900 flex items-center gap-1.5 mb-3">
                      <KeyRound className="h-4 w-4 text-purple-700" />
                      Koneksi Kelas Guru
                    </h4>
                    
                    {schoolSync === "synced" ? (
                      <div className="flex flex-col gap-3">
                        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                          <span>Tersambung Kelas Guru</span>
                        </div>
                        <p className="text-[11px] font-semibold text-ink-700">
                          Progres belajarmu dipantau oleh guru di sekolah **{schoolName}**.
                        </p>
                        <button
                          onClick={handleDisconnectSchool}
                          className="mt-1 w-full text-center text-xs font-bold text-red-650 hover:underline"
                        >
                          Putuskan Koneksi
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold text-ink-700">
                          Masukkan kode kelas dari gurumu untuk memantau progres tugas sekolah.
                        </p>
                        <input
                          type="text"
                          placeholder="Kode: SMG-7K2P"
                          value={schoolCodeInput}
                          onChange={(e) => setSchoolCodeInput(e.target.value)}
                          className="rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-xs font-bold text-ink-900 uppercase tracking-widest outline-none focus:border-purple-750"
                        />
                        <button
                          onClick={handleSyncSchool}
                          className="w-full bg-purple-900 hover:bg-purple-800 text-white rounded-full py-2.5 text-xs font-black shadow transition"
                        >
                          Hubungkan Sekarang
                        </button>
                        {isSyncSuccess && (
                          <div className="p-2 rounded-lg bg-teal-50 text-teal-850 text-[10px] font-bold text-center border border-teal-150">
                            Sinkronisasi Berhasil!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ROLE 2: TEACHER VIEW */}
            {activeRole === "teacher" && (
              <div className="rounded-[2.5rem] border border-purple-700/8 bg-white p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)] flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-lavender-100/50 p-5 rounded-2xl border border-purple-100">
                  <div>
                    <h3 className="font-heading text-lg font-black text-purple-900">Laporan Hasil Belajar Guru</h3>
                    <p className="text-xs font-bold text-ink-400 mt-0.5">Sekolah: {schoolName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-ink-400">Kode Sinkron Kelas</p>
                      <p className="text-lg font-heading font-black text-purple-900 tracking-wider">SMG-7K2P</p>
                    </div>
                    <button
                      onClick={() => alert("Kode kelas baru berhasil dibuat: SMG-8X9Y")}
                      className="rounded-lg border border-purple-200 bg-white p-2 hover:bg-lavender-50 transition"
                      title="Generate kode baru"
                    >
                      <KeyRound className="h-4 w-4 text-purple-700" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <TeacherStatCard label="Total Siswa Aktif" value="12 Siswa" trend="+2 minggu ini" />
                  <TeacherStatCard label="Rata-rata Bab Selesai" value="4.2 / 7" trend="Optimal" />
                  <TeacherStatCard label="Misi Harian Selesai" value="84%" trend="Tinggi" />
                  <TeacherStatCard label="Siswa Lolos Pre-Test" value="92%" trend="Sangat Bagus" />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-heading text-base font-black text-purple-900">Progress Belajar Individu Siswa</h4>
                    <button 
                      onClick={() => alert("Mengunduh laporan PDF kelas...")}
                      className="text-xs font-black text-purple-700 uppercase tracking-wider hover:underline"
                    >
                      Unduh Laporan PDF
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto rounded-2xl border border-purple-100">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-lavender-50/50 border-b border-purple-100 text-purple-950 font-heading font-black">
                          <th className="p-3">Nama Siswa</th>
                          <th className="p-3">Level Kategori</th>
                          <th className="p-3">Tingkatan XP</th>
                          <th className="p-3">Bab Diselesaikan</th>
                          <th className="p-3">Streak Harian</th>
                          <th className="p-3">Status Evaluasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100 font-semibold text-ink-700">
                        <TeacherTableRow name="Rina (Anda)" grade="SD" xp="1250" chapters="4 / 7" streak="3 Hari" status="Siaga Gempa" />
                        <TeacherTableRow name="Budi Laksono" grade="SD" xp="950" chapters="2 / 7" streak="1 Hari" status="Pemula Siaga" />
                        <TeacherTableRow name="Sinta Ramadhani" grade="SD" xp="1480" chapters="6 / 7" streak="5 Hari" status="Ahli Evakuasi" />
                        <TeacherTableRow name="Ahmad Danu" grade="SMP" xp="1120" chapters="3 / 7" streak="2 Hari" status="Siaga Gempa" />
                        <TeacherTableRow name="Citra Kirana" grade="SD" xp="850" chapters="2 / 7" streak="0 Hari" status="Pemula Siaga" />
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ROLE 3: EXPERT VIEW */}
            {activeRole === "expert" && (
              <div className="rounded-[2.5rem] border border-purple-700/8 bg-white p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)] flex flex-col gap-5">
                <div>
                  <h3 className="font-heading text-lg font-black text-purple-900">BMKG Early Warning Broadcast Control</h3>
                  <p className="text-xs font-semibold text-ink-700 mt-1">
                    Panel Kontrol Ahli Kebencanaan untuk mempublikasikan simulasi status peringatan dini secara real-time ke modul belajar siswa.
                  </p>
                </div>

                <form onSubmit={handleDispatchAlert} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-purple-700">Jenis Bencana</label>
                      <select
                        value={bmkgAlert.disaster}
                        onChange={(e) => setBmkgAlert({ ...bmkgAlert, disaster: e.target.value as any })}
                        className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-3 text-xs font-bold text-ink-900 outline-none focus:border-purple-750"
                      >
                        <option value="gempa">Gempa Bumi</option>
                        <option value="banjir">Banjir</option>
                        <option value="tsunami">Tsunami</option>
                        <option value="none">Aman</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-purple-700">Level Siaga BMKG</label>
                      <select
                        value={bmkgAlert.level}
                        onChange={(e) => setBmkgAlert({ ...bmkgAlert, level: e.target.value as any })}
                        className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-3 text-xs font-bold text-ink-900 outline-none focus:border-purple-750"
                      >
                        <option value="waspada">Waspada</option>
                        <option value="siaga">Siaga</option>
                        <option value="awas">Awas</option>
                        <option value="aman">Aman</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-purple-700">Judul Peringatan</label>
                    <input
                      type="text"
                      value={bmkgAlert.title}
                      onChange={(e) => setBmkgAlert({ ...bmkgAlert, title: e.target.value })}
                      className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-3 text-xs font-bold text-ink-900 outline-none focus:border-purple-750"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-purple-700">Detail Laporan Analisis Bencana</label>
                    <textarea
                      value={bmkgAlert.description}
                      onChange={(e) => setBmkgAlert({ ...bmkgAlert, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-3 text-xs font-semibold text-ink-900 outline-none focus:border-purple-750"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-purple-700">Panduan Aksi Siaga untuk Siswa</label>
                    <textarea
                      value={bmkgAlert.actionGuide}
                      onChange={(e) => setBmkgAlert({ ...bmkgAlert, actionGuide: e.target.value })}
                      rows={4}
                      className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-3 text-xs font-semibold text-ink-900 outline-none focus:border-purple-750"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-900 hover:bg-purple-800 text-white rounded-full py-3.5 font-heading text-sm font-black shadow transition active:translate-y-0.5"
                  >
                    Kirim & Publikasikan Peringatan Dini
                  </button>

                  {alertSuccessMsg && (
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black text-center">
                      Peringatan Dini BMKG Berhasil Dipublikasikan ke Modul!
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* PROFILE & EDUCATION ACCOUNT MANAGEMENT */}
          <div className="rounded-[2.5rem] border border-purple-700/8 bg-white p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)] flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
              <Settings className="h-5 w-5 text-purple-700" />
              <h3 className="font-heading text-lg font-black text-purple-900">Manajemen Akun & Pengaturan Profil</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-purple-700">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-3 text-xs font-semibold text-ink-900 outline-none focus:border-purple-750"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-purple-700">Tingkat Pendidikan</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-3 text-xs font-bold text-ink-900 outline-none focus:border-purple-750"
                >
                  <option value="sd">SD (MitigaKids - Gamified)</option>
                  <option value="smp">SMP (MitigaTeen - Interactive)</option>
                  <option value="sma">SMA (MitigaPro - Expert Analytics)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-purple-900 hover:bg-purple-800 text-white rounded-full py-3 text-xs font-black shadow transition active:translate-y-0.5"
              >
                Simpan Perubahan
              </button>
              
              <button
                onClick={() => alert("Tautan pengaturan ganti kata sandi telah dikirim ke email terdaftar.")}
                className="flex-1 border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 rounded-full py-3 text-xs font-black transition"
              >
                Ganti Password Akun
              </button>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

// UI HELPERS

function TeacherStatCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="border border-purple-100 bg-lavender-50/20 rounded-2xl p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase text-ink-400">{label}</p>
      <p className="text-xl font-heading font-black text-purple-900 mt-1">{value}</p>
      <p className="text-[10px] font-bold text-teal-650 mt-1 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        {trend}
      </p>
    </div>
  );
}

function TeacherTableRow({ 
  name, 
  grade, 
  xp, 
  chapters, 
  streak, 
  status 
}: { 
  name: string; 
  grade: string; 
  xp: string; 
  chapters: string; 
  streak: string; 
  status: string; 
}) {
  return (
    <tr className="hover:bg-purple-50/25 transition">
      <td className="p-3 font-bold text-purple-950">{name}</td>
      <td className="p-3">
        <span className="bg-purple-50 border border-purple-100 text-[10px] px-2 py-0.5 rounded font-black text-purple-800">
          {grade}
        </span>
      </td>
      <td className="p-3 font-heading font-extrabold text-purple-900">{xp} XP</td>
      <td className="p-3">{chapters}</td>
      <td className="p-3 text-teal-700">{streak}</td>
      <td className="p-3">
        <span className="bg-teal-50 border border-teal-100 text-[10px] px-2 py-0.5 rounded font-bold text-teal-850">
          {status}
        </span>
      </td>
    </tr>
  );
}

function BadgeCard({ id, name, desc, unlocked }: { id: string; name: string; desc: string; unlocked: boolean }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <div className={`border p-4 rounded-2xl text-center flex flex-col items-center gap-2 shadow-inner transition ${
        unlocked 
          ? "bg-purple-50/70 border-purple-100 text-purple-900 cursor-pointer hover:scale-[1.03]" 
          : "bg-ink-50/40 border-purple-700/5 text-ink-300 opacity-60"
      }`}
      onClick={() => unlocked && setIsShareModalOpen(true)}
      title={unlocked ? "Klik untuk membagikan badge ke IG Story!" : undefined}
      >
        <div className={`h-12 w-12 rounded-full flex items-center justify-center border shadow-sm ${
          unlocked 
            ? "bg-purple-900 border-purple-700 text-white" 
            : "bg-ink-100 border-ink-200 text-ink-400"
        }`}>
          {unlocked ? <Sparkles className="h-6 w-6 text-yellow-300" /> : <Settings className="h-6 w-6" />}
        </div>
        <div>
          <p className="font-heading text-xs font-black leading-tight">{name}</p>
          <p className="text-[9px] font-semibold text-ink-700 mt-1 leading-normal">{desc}</p>
          {unlocked && (
            <span className="text-[8px] font-bold text-purple-700 hover:underline mt-1 block">
              Bagikan 🔗
            </span>
          )}
        </div>
      </div>

      {/* SHARE INSTAGRAM STORY MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-[2.5rem] border border-purple-700/10 p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
            
            {/* Header info */}
            <div className="flex justify-between items-center w-full border-b border-purple-100 pb-2">
              <span className="font-heading text-sm font-black text-purple-900">Share to Instagram Story</span>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="h-8 w-8 rounded-full bg-lavender-100 flex items-center justify-center text-purple-700 font-bold hover:bg-lavender-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Story Mockup (9:16 Canvas) */}
            <div className="relative w-full aspect-[9/16] rounded-2xl bg-gradient-to-tr from-purple-950 via-purple-900 to-indigo-950 border border-purple-500/40 p-6 flex flex-col justify-between items-center text-white overflow-hidden shadow-inner">
              
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
              <div className="absolute top-1/4 -left-1/4 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
              <div className="absolute bottom-1/4 -right-1/4 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl" />

              {/* Header */}
              <div className="flex flex-col items-center text-center mt-6 z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-350">MitigaKids Champion</span>
                <h4 className="font-heading text-xl font-black mt-1">SIAP SIAGA BENCANA!</h4>
              </div>

              {/* Badge Icon Visual */}
              <div className="flex flex-col items-center gap-3 z-10 my-auto">
                <div className="h-28 w-28 rounded-full bg-white/10 backdrop-blur-md border-2 border-yellow-350 flex items-center justify-center shadow-lg relative">
                  <Sparkles className="h-14 w-14 text-yellow-300 animate-pulse" />
                  <div className="absolute -top-1 -right-1 bg-yellow-350 text-purple-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-white">
                    UNLOCKED
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="font-heading text-lg font-black text-yellow-305">{name}</p>
                  <p className="text-[11px] text-purple-200 mt-1 italic">"{desc}"</p>
                </div>
              </div>

              {/* Bottom Brand Stamp */}
              <div className="flex flex-col items-center text-center mb-6 z-10">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                  <img src="/assets/logo-mitigakids.png" alt="logo" className="h-4.5 w-4.5 rounded-full" />
                  <span className="text-[9px] font-black tracking-widest uppercase">mitigakids.org</span>
                </div>
                <p className="text-[9px] font-bold text-purple-300 mt-1">Ayo belajar tangguh kebencanaan sejak dini!</p>
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => {
                  alert("Gambar IG Story berhasil diunduh ke galeri perangkat!");
                  setIsShareModalOpen(false);
                }}
                className="flex-1 bg-purple-900 hover:bg-purple-800 text-white rounded-full py-2.5 text-xs font-black shadow transition active:translate-y-0.5"
              >
                Unduh Gambar Story
              </button>
              <button
                onClick={() => {
                  alert("Membuka aplikasi Instagram...");
                  setIsShareModalOpen(false);
                }}
                className="flex-1 border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 rounded-full py-2.5 text-xs font-black transition"
              >
                Bagikan ke IG Story
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
