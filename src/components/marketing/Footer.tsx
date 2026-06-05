import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-purple-900 border-t border-purple-700/50 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-lavender-200" />
          <span className="font-heading text-lg font-bold text-white tracking-wide">Smong</span>
        </div>
        <p className="font-sans text-sm text-lavender-200/60 text-center">
          Platform Pembelajaran Mitigasi Bencana Berbasis Sekolah.{" "}
          <span className="text-lavender-200">Belajar Hari Ini, Siaga Esok Hari.</span>
        </p>
        <nav className="flex items-center gap-6 text-sm font-sans font-medium text-lavender-200/60">
          <Link href="#fitur" className="hover:text-lavender-200 transition-colors">Fitur</Link>
          <Link href="#modul" className="hover:text-lavender-200 transition-colors">Modul</Link>
          <Link href="/dashboard/siswa" className="hover:text-lavender-200 transition-colors">Dashboard</Link>
        </nav>
      </div>
    </footer>
  );
}
