"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-lavender-200/50">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-700" />
          <span className="font-heading text-xl font-bold text-purple-700">Smong</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-ink-700">
          <Link href="#fitur" className="hover:text-purple-700 transition-colors">Fitur</Link>
          <Link href="#modul" className="hover:text-purple-700 transition-colors">Modul</Link>
          <Link href="#tentang" className="hover:text-purple-700 transition-colors">Tentang</Link>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/siswa"
          className="bg-purple-700 text-white font-heading font-bold text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_0_0_#2F176E] hover:bg-purple-500 transition-colors active:shadow-none active:translate-y-0.5"
        >
          Mulai Belajar
        </Link>
      </nav>
    </header>
  );
}
