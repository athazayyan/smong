import Link from "next/link";
import { Map, Lock, ArrowRight } from "lucide-react";
import { earthquakeModule } from "@/features/student-learning/data/mockData";

export default function ModulPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-purple-900">Modul Saya</h1>
        </div>
        <p className="font-sans text-sm text-ink-700">
          Pilih modul untuk melanjutkan petualangan belajarmu.
        </p>
      </div>

      {/* Active module */}
      <div className="mb-6">
        <p className="font-heading text-xs font-semibold text-ink-700 uppercase tracking-widest mb-3">
          Sedang Dipelajari
        </p>
        <Link href="/dashboard/siswa" className="block group">
          <div className="bg-white rounded-3xl p-6 ring-2 ring-purple-500/40 hover:ring-purple-500 transition-colors shadow-[0_4px_16px_rgba(91,59,181,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block font-sans text-xs font-semibold text-purple-700 bg-lavender-200/70 rounded-full px-3 py-0.5 mb-3">
                  MVP Aktif
                </span>
                <h2 className="font-heading text-lg font-bold text-purple-900 mb-1">
                  {earthquakeModule.title}
                </h2>
                <p className="font-sans text-sm text-ink-700 leading-relaxed">
                  Pelajari gempa bumi dari tiga fase: Pra-Bencana, Saat Bencana, dan Pascabencana.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-lavender-200/50 flex items-center justify-center shrink-0 group-hover:bg-purple-700 transition-colors">
                <ArrowRight className="w-5 h-5 text-purple-700 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Coming soon modules */}
      <div>
        <p className="font-heading text-xs font-semibold text-ink-700 uppercase tracking-widest mb-3">
          Segera Hadir
        </p>
        <div className="flex flex-col gap-3">
          {["Banjir", "Tsunami", "Kebakaran"].map((topic) => (
            <div
              key={topic}
              className="bg-white rounded-2xl px-5 py-4 ring-2 ring-lavender-200/40 flex items-center gap-4 opacity-60"
            >
              <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-ink-400" />
              </div>
              <div className="flex-1">
                <p className="font-heading text-sm font-bold text-ink-700">Modul {topic}</p>
                <p className="font-sans text-xs text-ink-400">Akan tersedia di pembaruan berikutnya.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
