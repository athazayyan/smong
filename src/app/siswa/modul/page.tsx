"use client";

import React, { useState, useEffect } from "react";
import { ChapterMap } from "@/features/student-learning/components/ChapterMap";
import { LockedModuleIslands } from "@/features/student-learning/components/LockedModuleIslands";
import { ModuleWorldHero } from "@/features/student-learning/components/ModuleWorldHero";
import { ProgressRail, ProgressSummaryStrip } from "@/features/student-learning/components/ProgressRail";
import { gempaChapters, moduleGroups } from "@/features/student-learning/data/mockData";
import { mockStudentProgress } from "@/features/student-learning/data/mockProgress";
import { 
  Map, 
  BookOpen, 
  Bell, 
  Award, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  ArrowRight, 
  Zap,
  Volume2,
  Tv,
  Compass,
  Smile,
  X,
  Share2
} from "lucide-react";

const TOTAL_GEMPA_LESSONS = 18;
const activeModule = moduleGroups.find((moduleGroup) => moduleGroup.id === "gempa-bumi") ?? moduleGroups[0];
const comingSoonModules = moduleGroups.filter((moduleGroup) => moduleGroup.availability === "coming-soon");

export default function UnifiedModulPage() {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  // Learning Flow Slides states
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [selectedStoryChoice, setSelectedStoryChoice] = useState<string | null>(null);
  const [storyScore, setStoryScore] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // JS Shake Simulator states (embedded in flow)
  const [magnitude, setMagnitude] = useState(5.0);
  const [isLabsShaking, setIsLabsShaking] = useState(false);

  // Classroom scan preview hotspots (embedded in flow)
  const [activeScanHotspot, setActiveScanHotspot] = useState<string | null>(null);

  // Chapter select click handler
  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setActiveSlideIdx(0);
    setSelectedStoryChoice(null);
    setStoryScore(0);
  };

  const closeLessonModal = () => {
    setSelectedChapterId(null);
  };

  // Storyline slide structure with custom generated local images
  const storylineSlides = [
    {
      type: "comic",
      title: "Guncangan Tiba-tiba di Kelas!",
      mascotText: "Halo! Aku Kiki maskot siagamu. Hari ini kita akan menemani Koko belajar di kelas. Tiba-tiba saja lantai kelas bergetar dan lampu gantung bergoyang perlahan! Gempa terjadi!",
      imageSrc: "/assets/landing/story_gempa_kelas.png",
      choices: [
        { id: "s0_a", label: "Ayo cari tahu apa yang harus Koko lakukan!", isCorrect: true, feedback: "Bagus! Tetap tenang dan bersiap mengikuti panduan keselamatan." }
      ]
    },
    {
      type: "comic",
      title: "Berlindung dengan Cepat",
      mascotText: "Koko panik sekali! Dia melihat teman-temannya bingung. Apa tindakan pertama yang paling aman untuk Koko lakukan sekarang?",
      imageSrc: "/assets/landing/story_gempa_meja.png",
      choices: [
        { id: "s1_a", label: "Segera berlari berebut pintu keluar kelas", isCorrect: false, feedback: "Oh tidak! Berlari saat gempa sangat berbahaya karena guncangan tanah bisa membuat Koko terjatuh atau tertimpa reruntuhan." },
        { id: "s1_b", label: "Masuk ke bawah meja kokoh dan lindungi kepala", isCorrect: true, feedback: "Tepat sekali! Berlindung di bawah meja melindungi Koko dari reruntuhan plafon kelas yang jatuh." }
      ]
    },
    {
      type: "comic",
      title: "Guncangan Mereda, Saatnya Evakuasi",
      mascotText: "Hore, guncangan gempa sudah berhenti! Sekarang saatnya keluar kelas menuju area terbuka di sekolah (lapangan). Bagaimana cara evakuasi yang benar?",
      imageSrc: "/assets/landing/story_gempa_lapangan.png",
      choices: [
        { id: "s2_a", label: "Jalan cepat, lindungi kepala dengan tas, dan antre tertib", isCorrect: true, feedback: "Hebat! Evakuasi harus tertib agar tidak ada siswa yang saling dorong dan terjepit di pintu." },
        { id: "s2_b", label: "Kembali merapikan buku dan mengunci laci kelas", isCorrect: false, feedback: "Jangan! Keselamatan jiwa adalah utama. Tinggalkan barang yang tidak penting saat evakuasi." }
      ]
    },
    {
      type: "infographic",
      title: "Infografis Tindakan Siaga Bencana di Sekolah",
      mascotText: "Berikut adalah rangkuman visual tindakan penyelamatan diri saat terjadi gempa bumi di lingkungan sekolah. Pelajari dan ingat baik-baik!",
      guides: [
        { title: "1. DROP!", desc: "Segera berlutut di lantai agar tidak terjatuh akibat getaran gempa." },
        { title: "2. COVER!", desc: "Lindungi kepala dan leher menggunakan tas sekolah atau tangan." },
        { title: "3. HOLD ON!", desc: "Masuk ke kolong meja kayu yang kokoh dan pegang erat kaki meja." }
      ]
    },
    {
      type: "simulator",
      title: "Uji Kekuatan Struktur Bangunan Sekolah",
      mascotText: "Simulasikan kekuatan getaran gempa menggunakan JS Shake Simulator. Atur Magnitudo lalu klik 'Mulai Getaran' untuk melihat efek goncangannya."
    },
    {
      type: "complete",
      title: "Selamat! Misi Belajar Selesai!",
      mascotText: "Kamu luar biasa! Telah berhasil menyelesaikan simulasi pembelajaran mitigasi kebencanaan MitigaKids. Nilai XP dan lencana barumu telah tersimpan."
    }
  ];

  const handleStoryChoice = (choiceId: string, isCorrect: boolean) => {
    setSelectedStoryChoice(choiceId);
    if (isCorrect) {
      setStoryScore((prev) => prev + 15);
    }
  };

  const handleNextSlide = () => {
    setSelectedStoryChoice(null);
    if (activeSlideIdx < storylineSlides.length - 1) {
      setActiveSlideIdx((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    setSelectedStoryChoice(null);
    if (activeSlideIdx > 0) {
      setActiveSlideIdx((prev) => prev - 1);
    }
  };

  // Shake Intensity Styles
  const shakeIntensity = magnitude > 7 ? "8px" : magnitude > 4 ? "3px" : "1.2px";
  const shakeDuration = magnitude > 7 ? "0.07s" : magnitude > 4 ? "0.14s" : "0.22s";

  return (
    <main className="overflow-hidden bg-cream-50 pb-20">
      
      {/* SHAKE STYLE INJECTOR */}
      <style>{`
        @keyframes custom-shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -1.5px) rotate(-0.5deg); }
          20% { transform: translate(-${shakeIntensity}, 0px) rotate(0.5deg); }
          30% { transform: translate(0px, ${shakeIntensity}) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(0.5deg); }
          50% { transform: translate(-1px, ${shakeIntensity}) rotate(-0.5deg); }
          60% { transform: translate(-${shakeIntensity}, 1px) rotate(0deg); }
          70% { transform: translate(1.5px, 1px) rotate(-0.5deg); }
          80% { transform: translate(-1px, -1px) rotate(0.5deg); }
          90% { transform: translate(1px, ${shakeIntensity}) rotate(0deg); }
          100% { transform: translate(1px, -1.5px) rotate(-0.5deg); }
        }
        .labs-shake-active {
          animation: custom-shake ${shakeDuration} infinite;
        }
      `}</style>

      {/* HEADER HERO */}
      <ModuleWorldHero
        title={activeModule.title}
        description={activeModule.description}
        chapters={gempaChapters}
        progress={mockStudentProgress}
      />

      <section className="relative mx-auto mt-8 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-8">
        
        {/* LEFT COLUMN: CHAPTER PATH MAP */}
        <div className="min-w-0 flex flex-col gap-6">
          <div className="lg:hidden">
            <ProgressSummaryStrip progress={mockStudentProgress} totalLessons={TOTAL_GEMPA_LESSONS} />
          </div>
          
          {/* Chapter map rendering with click callback interceptor */}
          <ChapterMap 
            chapters={gempaChapters} 
            progress={mockStudentProgress} 
            onChapterSelect={handleChapterSelect}
          />
          
          <LockedModuleIslands modules={comingSoonModules} />
        </div>

        {/* RIGHT COLUMN: PROGRESS TRACKING RAIL */}
        <div className="hidden w-full lg:sticky lg:top-28 lg:block lg:self-start">
          <ProgressRail progress={mockStudentProgress} totalLessons={TOTAL_GEMPA_LESSONS} />
        </div>

      </section>

      {/* ─── GAMIFIED MULTIMODAL LESSON OVERLAY MODAL ─── */}
      {selectedChapterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-purple-700/8 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
            
            {/* Modal Top Header */}
            <div className="flex justify-between items-center bg-lavender-50/50 border-b border-purple-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-700" />
                <span className="font-heading text-sm font-black text-purple-900">
                  Misi Belajar: {gempaChapters.find(c => c.id === selectedChapterId)?.title}
                </span>
              </div>
              <button 
                onClick={closeLessonModal}
                className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-purple-700 shadow-sm font-bold hover:bg-lavender-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Slide Body */}
            <div className="p-6 flex-1 flex flex-col gap-5">
              
              {/* Slide Indicator Bar */}
              <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden flex">
                {storylineSlides.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`flex-1 h-full border-r border-white last:border-0 transition-colors ${
                      idx <= activeSlideIdx ? "bg-purple-900" : "bg-purple-100"
                    }`}
                  />
                ))}
              </div>

              <div className="text-center font-heading text-lg font-black text-purple-900 mt-2">
                {storylineSlides[activeSlideIdx].title}
              </div>

              {/* SLIDE CONTENT RENDERING */}

              {/* 1. COMIC ILLUST SLIDES */}
              {storylineSlides[activeSlideIdx].type === "comic" && (
                <div className="flex flex-col gap-4">
                  {storylineSlides[activeSlideIdx].imageSrc && (
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-purple-100 shadow-sm bg-lavender-50">
                      <img 
                        src={storylineSlides[activeSlideIdx].imageSrc} 
                        alt="Comic Scene"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Dialogue mascots card */}
                  <div className="flex gap-4 items-start bg-lavender-50/40 p-4 rounded-xl border border-purple-100/50">
                    <span className="text-3xl shrink-0">🦸‍♂️</span>
                    <div className="flex-1 text-left">
                      <p className="text-[10px] font-black uppercase text-purple-700 mb-0.5">Kiki Siaga:</p>
                      <p className="text-xs font-semibold leading-relaxed text-ink-800">
                        {storylineSlides[activeSlideIdx].mascotText}
                      </p>
                    </div>
                  </div>

                  {/* Feedback window */}
                  {selectedStoryChoice && (
                    <div className={`p-4 rounded-xl border text-xs font-semibold leading-normal text-left ${
                      storylineSlides[activeSlideIdx].choices?.find(c => c.id === selectedStoryChoice)?.isCorrect
                        ? "bg-teal-50 border-teal-200 text-teal-850"
                        : "bg-red-50 border-red-200 text-red-850"
                    }`}>
                      {storylineSlides[activeSlideIdx].choices?.find(c => c.id === selectedStoryChoice)?.feedback}
                    </div>
                  )}

                  {/* Choice Buttons */}
                  <div className="flex flex-col gap-2">
                    {storylineSlides[activeSlideIdx].choices?.map((choice) => (
                      <button
                        key={choice.id}
                        disabled={selectedStoryChoice !== null}
                        onClick={() => handleStoryChoice(choice.id, choice.isCorrect)}
                        className={`w-full text-left rounded-xl p-3.5 text-xs font-bold border transition ${
                          selectedStoryChoice === choice.id
                            ? choice.isCorrect
                              ? "bg-teal-900 border-teal-850 text-white shadow"
                              : "bg-red-900 border-red-850 text-white shadow"
                            : "bg-white border-purple-100 text-ink-800 hover:bg-lavender-50"
                        } disabled:cursor-not-allowed`}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. INFOGRAPHIC ACTION CARD SLIDES */}
              {storylineSlides[activeSlideIdx].type === "infographic" && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-start bg-lavender-50/40 p-4 rounded-xl border border-purple-100/50 mb-1">
                    <span className="text-3xl shrink-0">📖</span>
                    <div className="flex-1 text-left">
                      <p className="text-[10px] font-black uppercase text-purple-700 mb-0.5">Kiki Siaga:</p>
                      <p className="text-xs font-semibold leading-relaxed text-ink-800">
                        {storylineSlides[activeSlideIdx].mascotText}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {storylineSlides[activeSlideIdx].guides?.map((guide, idx) => (
                      <div key={idx} className="border border-purple-100 bg-lavender-50/20 rounded-xl p-4 text-left shadow-sm">
                        <span className="bg-purple-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full inline-block mb-2">
                          Langkah {idx + 1}
                        </span>
                        <h4 className="font-heading text-sm font-black text-purple-900 leading-tight">{guide.title}</h4>
                        <p className="text-[11px] font-semibold text-ink-700 mt-1 leading-normal">{guide.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. JS SHAKE SIMULATOR SLIDE */}
              {storylineSlides[activeSlideIdx].type === "simulator" && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-start bg-lavender-50/40 p-4 rounded-xl border border-purple-100/50">
                    <span className="text-3xl shrink-0">🌋</span>
                    <div className="flex-1 text-left">
                      <p className="text-[10px] font-black uppercase text-purple-700 mb-0.5">Kiki Siaga:</p>
                      <p className="text-xs font-semibold leading-relaxed text-ink-800">
                        {storylineSlides[activeSlideIdx].mascotText}
                      </p>
                    </div>
                  </div>

                  {/* Earthquake Structural sandbox */}
                  <div className={`w-full border border-purple-150 rounded-2xl p-6 bg-lavender-50/20 text-center flex flex-col items-center gap-4 transition ${
                    isLabsShaking ? "labs-shake-active" : ""
                  }`}>
                    <div>
                      <p className="text-3xl font-heading font-black text-purple-900">{magnitude.toFixed(1)} SR</p>
                      <p className="text-[10px] font-black uppercase text-ink-400 mt-1">
                        {magnitude >= 7.0 ? "Guncangan Dahsyat! Struktur Rusak!" :
                         magnitude >= 4.0 ? "Guncangan Sedang - Benda Bergoyang" :
                         "Guncangan Ringan - Getaran Halus"}
                      </p>
                    </div>

                    <input 
                      type="range"
                      min="1.0"
                      max="9.0"
                      step="0.5"
                      value={magnitude}
                      onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-900"
                    />

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => setIsLabsShaking(true)}
                        disabled={isLabsShaking}
                        className="flex-1 bg-purple-900 hover:bg-purple-800 disabled:opacity-50 text-white rounded-full py-2 text-xs font-black shadow transition"
                      >
                        Mulai Getaran
                      </button>
                      {isLabsShaking && (
                        <button
                          onClick={() => setIsLabsShaking(false)}
                          className="flex-1 border border-purple-200 bg-white text-purple-700 rounded-full py-2 text-xs font-black transition"
                        >
                          Redakan Guncangan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. COMPLETE SLIDE AND INSTAGRAM STORY SHARE */}
              {storylineSlides[activeSlideIdx].type === "complete" && (
                <div className="flex flex-col items-center gap-4 text-center py-4">
                  <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 ring-4 ring-teal-50 animate-bounce">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-black text-purple-900">Misi Berhasil Diselesaikan!</h4>
                    <p className="text-xs font-semibold text-ink-700 mt-2 leading-relaxed">
                      Luar biasa! Kamu telah menguasai pengetahuan taktis menghadapi gempa bumi.
                    </p>
                    <p className="text-sm font-heading font-black text-yellow-600 mt-2">
                      +50 XP Diperoleh & Badge "Pendeteksi Gempa" Berhasil Didapatkan!
                    </p>
                  </div>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white px-6 py-3 rounded-full text-xs font-black shadow transition transform hover:scale-[1.02] active:translate-y-0.5"
                  >
                    <Share2 className="h-4 w-4 text-yellow-300" />
                    Share Lencana ke Instagram Story!
                  </button>
                </div>
              )}

            </div>

            {/* Modal Bottom Buttons Footer */}
            <div className="border-t border-purple-100 px-6 py-4 bg-lavender-50/20 flex justify-between items-center">
              <button
                onClick={handlePrevSlide}
                disabled={activeSlideIdx === 0}
                className="rounded-full border border-purple-200 bg-white hover:bg-lavender-50 px-4 py-2 text-xs font-black text-purple-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Kembali
              </button>

              {activeSlideIdx < storylineSlides.length - 1 ? (
                <button
                  onClick={handleNextSlide}
                  disabled={storylineSlides[activeSlideIdx].type === "comic" && selectedStoryChoice === null}
                  className="rounded-full bg-purple-900 hover:bg-purple-800 px-5 py-2.5 text-xs font-black text-white shadow disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  Lanjut
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={closeLessonModal}
                  className="rounded-full bg-purple-900 hover:bg-purple-800 px-5 py-2.5 text-xs font-black text-white shadow transition"
                >
                  Selesai
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* INSTAGRAM SHARE MODAL MOCKUP */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-purple-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] border border-purple-700/10 p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
            
            <div className="flex justify-between items-center w-full border-b border-purple-100 pb-2">
              <span className="font-heading text-sm font-black text-purple-900">Share to Instagram Story</span>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="h-8 w-8 rounded-full bg-lavender-100 flex items-center justify-center text-purple-700 font-bold hover:bg-lavender-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Story Mockup (9:16 aspect ratio) */}
            <div className="relative w-full aspect-[9/16] rounded-2xl bg-gradient-to-tr from-purple-950 via-purple-900 to-indigo-950 border border-purple-500/40 p-6 flex flex-col justify-between items-center text-white overflow-hidden shadow-inner">
              
              {/* Overlay elements */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
              <div className="absolute top-1/4 -left-1/4 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
              <div className="absolute bottom-1/4 -right-1/4 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl" />

              <div className="flex flex-col items-center text-center mt-6 z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-355">MitigaKids Champion</span>
                <h4 className="font-heading text-xl font-black mt-1">SIAP SIAGA BENCANA!</h4>
              </div>

              {/* Badge Visual representation */}
              <div className="flex flex-col items-center gap-3 z-10 my-auto">
                <div className="h-28 w-28 rounded-full bg-white/10 backdrop-blur-md border-2 border-yellow-350 flex items-center justify-center shadow-lg relative">
                  <Sparkles className="h-14 w-14 text-yellow-300 animate-pulse" />
                  <div className="absolute -top-1 -right-1 bg-yellow-350 text-purple-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-white">
                    UNLOCKED
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="font-heading text-lg font-black text-yellow-305">Pendeteksi Gempa</p>
                  <p className="text-[11px] text-purple-200 mt-1 italic">"Selesai Bab Siap Sebelum"</p>
                </div>
              </div>

              {/* Bottom Stamp */}
              <div className="flex flex-col items-center text-center mb-6 z-10">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                  <img src="/assets/logo-mitigakids.png" alt="logo" className="h-4.5 w-4.5 rounded-full" />
                  <span className="text-[9px] font-black tracking-widest uppercase">mitigakids.org</span>
                </div>
                <p className="text-[9px] font-bold text-purple-300 mt-1">Ayo belajar tangguh kebencanaan sejak dini!</p>
              </div>

            </div>

            {/* Action options */}
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => {
                  alert("Gambar IG Story berhasil diunduh ke galeri perangkat!");
                  setIsShareModalOpen(false);
                }}
                className="flex-1 bg-purple-900 hover:bg-purple-800 text-white rounded-full py-2.5 text-xs font-black shadow transition active:translate-y-0.5"
              >
                Unduh Gambar
              </button>
              <button
                onClick={() => {
                  alert("Membuka aplikasi Instagram...");
                  setIsShareModalOpen(false);
                }}
                className="flex-1 border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 rounded-full py-2.5 text-xs font-black transition"
              >
                Bagikan
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
