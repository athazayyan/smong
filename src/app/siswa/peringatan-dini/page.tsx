"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  AlertTriangle, 
  Search, 
  Activity, 
  Wind, 
  Waves, 
  Droplet, 
  Info, 
  Compass, 
  ArrowRight,
  RefreshCw,
  MapPin,
  ExternalLink,
  Layers
} from "lucide-react";

type DisasterCategory = "gempa" | "tsunami" | "banjir" | "cuaca_ekstrem";

interface BmkgEarthquake {
  tanggal: string;
  jam: string;
  magnitude: string;
  kedalaman: string;
  wilayah: string;
  dirasakan?: string;
  potensi?: string;
}

interface BmkgApiData {
  latest: {
    datetime: string;
    tanggal: string;
    jam: string;
    magnitude: string;
    kedalaman: string;
    koordinat: string;
    wilayah: string;
    potensi: string;
    dirasakan: string;
    shakemap: string | null;
  };
  dirasakan: BmkgEarthquake[];
  terkini: BmkgEarthquake[];
}

interface InariskService {
  name: string;
  type: string;
}

export default function EarlyWarningPage() {
  const [activeCategory, setActiveCategory] = useState<DisasterCategory>("gempa");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveData, setLiveData] = useState<BmkgApiData | null>(null);
  const [inariskServices, setInariskServices] = useState<InariskService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchSource, setFetchSource] = useState("");
  
  // Sub-tab selection for earthquake lists
  const [gempaSubTab, setGempaSubTab] = useState<"terbaru" | "dirasakan" | "m5">("terbaru");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch BMKG
      const bmkgRes = await fetch("/api/bmkg");
      if (bmkgRes.ok) {
        const json = await bmkgRes.json();
        if (json.success) {
          setLiveData(json);
          setFetchSource(json.source);
        }
      }
      
      // 2. Fetch Inarisk
      const inariskRes = await fetch("/api/inarisk");
      if (inariskRes.ok) {
        const json = await inariskRes.json();
        if (json.success) {
          setInariskServices(json.services);
        }
      }
    } catch (e) {
      console.error("Failed to load early warning data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Action Guidelines definitions
  const actionGuides = {
    gempa: [
      { step: 1, text: "Segera berlindung di kolong meja kayu yang kuat untuk menghindari serpihan langit-langit." },
      { step: 2, text: "Jauhi jendela kaca, cermin, rak lemari tinggi, dan lampu gantung besar." },
      { step: 3, text: "Setelah guncangan berhenti, keluar dari gedung secara tertib menggunakan jalur evakuasi." },
      { step: 4, text: "Gunakan tas atau tangan di atas kepala untuk melindunginya dari benda yang mungkin jatuh." }
    ],
    tsunami: [
      { step: 1, text: "Jika merasakan gempa besar di pesisir pantai, segera lari menuju daerah bukit yang tinggi." },
      { step: 2, text: "Perhatikan air laut. Apabila air surut secara tiba-tiba dan ikan terdampar, itu adalah tanda bahaya utama!" },
      { step: 3, text: "Jangan menunggu sirene atau peringatan resmi berbunyi jika tanda-tanda laut surut sudah terlihat." },
      { step: 4, text: "Bertahanlah di tempat tinggi selama minimal 2 jam setelah gempa karena tsunami datang dalam beberapa gelombang." }
    ],
    banjir: [
      { step: 1, text: "Pindahkan barang-barang elektronik dan dokumen berharga ke lantai atas rumah." },
      { step: 2, text: "Segera matikan sekring listrik utama untuk menghindari sengatan listrik di dalam air." },
      { step: 3, text: "Hindari berjalan atau berkendara melewati aliran banjir deras, air setinggi lutut bisa menghanyutkan mobil." },
      { step: 4, text: "Siapkan kantong darurat dan ikuti instruksi evakuasi petugas menuju posko banjir terdekat." }
    ],
    cuaca_ekstrem: [
      { step: 1, text: "Tetap di dalam rumah dan tutup semua jendela serta pintu rapat-rapat saat angin kencang." },
      { step: 2, text: "Hindari berlindung di bawah pohon besar, papan reklame, atau tiang listrik luar ruangan." },
      { step: 3, text: "Cabut perangkat elektronik dari colokan untuk mengamankannya dari sambaran petir." },
      { step: 4, text: "Jika berkendara saat hujan lebat, kurangi kecepatan dan segera menepi jika jarak pandang sangat pendek." }
    ]
  };

  // Mock Alerts database for weather, floods, and tsunami
  const mockAlerts = {
    tsunami: {
      status: "aman",
      title: "Status Tsunami Nusantara",
      description: "Tidak terdeteksi potensi tsunami di seluruh perairan wilayah Indonesia dalam 24 jam terakhir.",
      level: "aman"
    },
    banjir: {
      status: "waspada",
      title: "Peringatan Genangan & Banjir Luap",
      description: "Potensi genangan air tinggi di kawasan dataran rendah sekitar bantaran sungai pesisir utara Jawa akibat hujan lebat.",
      level: "waspada"
    },
    cuaca_ekstrem: {
      status: "siaga",
      title: "Siklon Tropis & Angin Monsun",
      description: "Hujan intensitas sedang-lebat disertai petir dan angin kencang berdurasi singkat di sebagian besar wilayah Sumatra bagian selatan dan barat.",
      level: "siaga"
    }
  };

  const getFilteredGuides = () => {
    const activeList = actionGuides[activeCategory];
    if (!searchQuery) return activeList;
    return activeList.filter(item => 
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Filter BNPB Inarisk GIS Map Layers based on active category keywords
  const getFilteredInariskServices = () => {
    if (activeCategory === "tsunami") {
      return inariskServices.filter(s => 
        s.name.toLowerCase().includes("tsunami") || 
        s.name.toLowerCase().includes("evakuasi") || 
        s.name.toLowerCase().includes("fault")
      );
    }
    if (activeCategory === "banjir") {
      return inariskServices.filter(s => 
        s.name.toLowerCase().includes("banjir") || 
        s.name.toLowerCase().includes("hidromet") || 
        s.name.toLowerCase().includes("das")
      );
    }
    if (activeCategory === "cuaca_ekstrem") {
      return inariskServices.filter(s => 
        s.name.toLowerCase().includes("cuaca") || 
        s.name.toLowerCase().includes("karhutla") || 
        s.name.toLowerCase().includes("kekeringan")
      );
    }
    // For general earthquakes
    return inariskServices.filter(s => 
      s.name.toLowerCase().includes("gempa") || 
      s.name.toLowerCase().includes("likuefaksi")
    );
  };

  return (
    <main className="min-h-screen bg-cream-50 font-sans pb-28 pt-6 px-4 md:px-6 max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-purple-700/8 pb-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-purple-900 leading-tight flex items-center gap-2">
            <Bell className="h-7 w-7 text-purple-700 animate-pulse" />
            Siaga BMKG & Pusat Peringatan Dini
          </h1>
          <p className="text-sm font-semibold text-ink-700 leading-relaxed">
            Pantau status kebencanaan real-time dan pelajari langkah perlindungan diri yang tepat.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full bg-white border border-purple-200 px-4 py-2 text-xs font-black text-purple-900 shadow-sm hover:bg-lavender-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Perbarui Data
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-ink-400" />
        </span>
        <input
          type="text"
          placeholder="Cari panduan keselamatan (contoh: 'meja', 'pantai', 'listrik')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-purple-200 bg-white pl-11 pr-4 py-3.5 text-xs font-semibold text-ink-900 outline-none focus:border-purple-750 focus:ring-2 focus:ring-purple-100 transition shadow-sm"
        />
      </div>

      {/* DISASTER CATEGORY TABS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(["gempa", "tsunami", "banjir", "cuaca_ekstrem"] as const).map((cat) => {
          const isActive = activeCategory === cat;
          const label = cat === "gempa" ? "Gempa Bumi" : cat === "tsunami" ? "Tsunami" : cat === "banjir" ? "Banjir" : "Cuaca Ekstrem";
          const Icon = cat === "gempa" ? Activity : cat === "tsunami" ? Waves : cat === "banjir" ? Droplet : Wind;
          
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery("");
              }}
              className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 px-3 border text-xs font-black transition ${
                isActive
                  ? "bg-purple-900 border-purple-800 text-white shadow-md"
                  : "bg-white border-purple-700/8 text-purple-900 hover:bg-lavender-50"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* DETAILED CONTENT AREA */}
      <div className="grid gap-6 md:grid-cols-[1fr_360px] grid-cols-1">
        
        {/* LEFT COLUMN: REAL-TIME INCOMING FEEDS */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[2.5rem] border border-purple-700/8 bg-white p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)]">
            <h3 className="font-heading text-lg font-black text-purple-900 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-purple-700" />
              Laporan Kebencanaan Real-time
            </h3>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2.5">
                <RefreshCw className="h-8 w-8 text-purple-700 animate-spin" />
                <p className="text-xs font-black text-purple-900 uppercase tracking-widest animate-pulse">Menghubungi Server BMKG...</p>
              </div>
            ) : activeCategory === "gempa" ? (
              liveData?.latest ? (
                <div className="flex flex-col gap-5">
                  
                  {/* Earthquake sub-tab selectors */}
                  <div className="flex gap-2 border-b border-purple-100 pb-2">
                    <button 
                      onClick={() => setGempaSubTab("terbaru")}
                      className={`text-xs font-black pb-1.5 px-1 transition-all ${
                        gempaSubTab === "terbaru" ? "border-b-2 border-purple-900 text-purple-900" : "text-ink-400 hover:text-purple-700"
                      }`}
                    >
                      Gempa Terbaru
                    </button>
                    <button 
                      onClick={() => setGempaSubTab("dirasakan")}
                      className={`text-xs font-black pb-1.5 px-1 transition-all ${
                        gempaSubTab === "dirasakan" ? "border-b-2 border-purple-900 text-purple-900" : "text-ink-400 hover:text-purple-700"
                      }`}
                    >
                      15 Gempa Dirasakan
                    </button>
                    <button 
                      onClick={() => setGempaSubTab("m5")}
                      className={`text-xs font-black pb-1.5 px-1 transition-all ${
                        gempaSubTab === "m5" ? "border-b-2 border-purple-900 text-purple-900" : "text-ink-400 hover:text-purple-700"
                      }`}
                    >
                      15 Gempa M 5.0+
                    </button>
                  </div>

                  {/* SUB-TAB 1: LATEST EARTHQUAKE DETAILS */}
                  {gempaSubTab === "terbaru" && (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 flex items-start gap-3">
                        <span className="h-10 w-10 bg-orange-200 text-orange-700 border border-orange-300 rounded-full flex items-center justify-center font-heading font-black shrink-0">
                          {liveData.latest.magnitude}
                        </span>
                        <div>
                          <h4 className="font-heading text-base font-black text-orange-950 uppercase tracking-wide">
                            Gempabumi M {liveData.latest.magnitude} SR
                          </h4>
                          <p className="text-xs font-bold text-orange-900 mt-0.5">
                            Episenter: {liveData.latest.wilayah}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-orange-200/50 text-orange-900 border border-orange-200">
                            {liveData.latest.potensi}
                          </span>
                        </div>
                      </div>

                      {/* Telemetry info fields */}
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="bg-lavender-50/30 border border-purple-100 rounded-xl p-3">
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 block">Waktu Terjadi</span>
                          <span className="text-xs font-bold text-ink-900">{liveData.latest.tanggal} | {liveData.latest.jam}</span>
                        </div>
                        <div className="bg-lavender-50/30 border border-purple-100 rounded-xl p-3">
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 block">Kedalaman</span>
                          <span className="text-xs font-bold text-ink-900">{liveData.latest.kedalaman}</span>
                        </div>
                        <div className="bg-lavender-50/30 border border-purple-100 rounded-xl p-3">
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 block">Koordinat</span>
                          <span className="text-xs font-bold text-ink-900">{liveData.latest.koordinat}</span>
                        </div>
                        <div className="bg-lavender-50/30 border border-purple-100 rounded-xl p-3">
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 block">Felt Scale (MMI)</span>
                          <span className="text-xs font-bold text-ink-900 line-clamp-1">{liveData.latest.dirasakan || "Tidak dirasakan"}</span>
                        </div>
                      </div>

                      {/* Shakemap Visual */}
                      {liveData.latest.shakemap && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-purple-100 shadow-sm">
                          <p className="bg-lavender-50 border-b border-purple-100 px-3 py-2 text-[10px] font-black uppercase text-purple-900 tracking-wider">
                            Peta Guncangan (Shakemap) BMKG
                          </p>
                          <img 
                            src={liveData.latest.shakemap} 
                            alt="BMKG Shakemap" 
                            className="w-full h-auto object-cover max-h-64"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 2: 15 FELT EARTHQUAKES LIST */}
                  {gempaSubTab === "dirasakan" && (
                    <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                      {liveData.dirasakan.map((gempa, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-purple-100 bg-lavender-50/20">
                          <span className="h-8 w-8 bg-purple-100 border border-purple-250 text-purple-900 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                            {gempa.magnitude}
                          </span>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-bold text-ink-900 line-clamp-1">{gempa.wilayah}</p>
                            <p className="text-[10px] text-ink-500 mt-0.5">{gempa.tanggal} | {gempa.jam} • Kedalaman: {gempa.kedalaman}</p>
                            <p className="text-[10px] font-black text-purple-700 mt-1 uppercase">Dirasakan: {gempa.dirasakan}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SUB-TAB 3: 15 M 5.0+ EARTHQUAKES LIST */}
                  {gempaSubTab === "m5" && (
                    <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                      {liveData.terkini.map((gempa, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-purple-100 bg-lavender-50/20">
                          <span className="h-8 w-8 bg-orange-100 border border-orange-250 text-orange-950 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                            {gempa.magnitude}
                          </span>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-bold text-ink-900 line-clamp-1">{gempa.wilayah}</p>
                            <p className="text-[10px] text-ink-500 mt-0.5">{gempa.tanggal} | {gempa.jam} • Kedalaman: {gempa.kedalaman}</p>
                            <span className="inline-block text-[9px] font-black uppercase text-teal-650 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded mt-1.5">
                              {gempa.potensi}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] font-bold text-ink-400 mt-2 text-right block leading-relaxed">
                    Atribusi Wajib: Sumber data terintegrasi penuh dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
                  </span>
                </div>
              ) : (
                <p className="text-xs font-semibold text-ink-700 text-center py-6">Pemantauan gempa tidak tersedia.</p>
              )
            ) : (
              // Other categories (Tsunami, Flood, Weather) mock warnings
              <div className="flex flex-col gap-4">
                {(() => {
                  const alertData = mockAlerts[activeCategory as keyof typeof mockAlerts];
                  const isAman = alertData.level === "aman";
                  
                  return (
                    <div className={`p-5 rounded-2xl border ${
                      isAman 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                        : alertData.level === "waspada"
                        ? "bg-amber-50 border-amber-200 text-amber-950"
                        : "bg-orange-50 border-orange-200 text-orange-950"
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className={`h-11 w-11 rounded-full border flex items-center justify-center shrink-0 ${
                          isAman 
                            ? "bg-emerald-200 border-emerald-300 text-emerald-700" 
                            : alertData.level === "waspada"
                            ? "bg-amber-200 border-amber-300 text-amber-700"
                            : "bg-orange-200 border-orange-300 text-orange-700"
                        }`}>
                          <AlertTriangle className="h-5.5 w-5.5" />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-heading text-base font-black uppercase tracking-wide">{alertData.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              isAman 
                                ? "bg-emerald-900 border-emerald-800 text-white" 
                                : alertData.level === "waspada"
                                ? "bg-amber-900 border-amber-800 text-ink-900"
                                : "bg-orange-900 border-orange-800 text-white"
                            }`}>
                              {alertData.level}
                            </span>
                          </div>
                          <p className="text-xs font-semibold mt-2.5 leading-relaxed">{alertData.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <span className="text-[10px] font-bold text-ink-400 mt-2 text-right block">
                  Pusat Peringatan Real-time MitigaKids
                </span>
              </div>
            )}
          </div>

          {/* DYNAMIC BNPB INARISK LAYER DIRECTORY SECTION */}
          {getFilteredInariskServices().length > 0 && (
            <div className="rounded-[2.5rem] border border-purple-700/8 bg-white p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)]">
              <h3 className="font-heading text-lg font-black text-purple-900 flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-purple-700" />
                BNPB Inarisk GIS Map Layers
              </h3>
              <p className="text-xs font-semibold text-ink-700 mb-4 leading-normal">
                Daftar peta spasial aktif dari InaRISK BNPB (Badan Nasional Penanggulangan Bencana) untuk wilayah pemantauan Anda:
              </p>

              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {getFilteredInariskServices().map((service, idx) => {
                  const serviceEndpoint = `https://gis.bnpb.go.id/server/rest/services/${service.name}/${service.type}`;
                  const folder = service.name.includes("/") ? service.name.split("/")[0] : "inarisk";
                  const rawName = service.name.includes("/") ? service.name.split("/").pop() || "" : service.name;
                  const cleanName = rawName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  const isImageServer = service.type === "ImageServer";

                  return (
                    <div key={idx} className="p-3.5 border border-purple-100 bg-lavender-50/15 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-left">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${isImageServer ? "bg-emerald-500" : "bg-purple-600"}`}></span>
                          <p className="text-xs font-black text-purple-950 truncate">{cleanName}</p>
                        </div>
                        <p className="text-[9px] font-bold text-ink-400 mt-1">
                          Folder: {folder} • Jenis: <span className="text-purple-700">{service.type}</span>
                        </p>
                      </div>
                      <a 
                        href={serviceEndpoint} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 bg-white border border-purple-200 hover:bg-lavender-50 text-purple-900 px-3.5 py-1.5 rounded-full text-[10px] font-black shadow-sm transition shrink-0"
                      >
                        Akses REST API
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
              
              <span className="text-[9px] font-bold text-ink-400 mt-3 text-right block">
                Sumber Data Spasial: BNPB InaRISK GIS Directory
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTION GUIDES FOR THE CATEGORY */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[2.5rem] border border-purple-700/8 bg-white p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)] flex flex-col gap-4">
            <h3 className="font-heading text-lg font-black text-purple-900 flex items-center gap-1.5">
              <Compass className="h-5 w-5 text-purple-700" />
              Panduan Aksi Darurat
            </h3>
            <p className="text-xs font-semibold text-ink-700 leading-normal">
              Langkah-langkah penyelamatan yang direkomendasikan ahli mitigasi untuk siswa:
            </p>

            <div className="flex flex-col gap-3.5 mt-2">
              {getFilteredGuides().length > 0 ? (
                getFilteredGuides().map((item) => (
                  <div key={item.step} className="flex gap-3 items-start border-b border-purple-100/50 pb-3 last:border-b-0 last:pb-0">
                    <span className="h-6 w-6 rounded-full bg-purple-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <p className="text-xs font-semibold leading-relaxed text-ink-800">
                      {item.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-ink-400">
                  <Info className="h-8 w-8 mx-auto mb-2 text-ink-300" />
                  <p className="text-xs font-bold">Panduan tidak ditemukan.</p>
                </div>
              )}
            </div>

            {/* Quick Link to Simulator */}
            <a
              href="/siswa/modul"
              className="mt-2 w-full bg-purple-900 hover:bg-purple-800 text-white text-center rounded-full py-3 text-xs font-black shadow transition flex items-center justify-center gap-1.5 active:translate-y-0.5"
            >
              Simulasikan Misi Sekarang
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

      </div>

    </main>
  );
}
