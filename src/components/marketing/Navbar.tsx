"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-cream-50/90 backdrop-blur-md border-b border-lavender-200 shadow-sm py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-2xl font-bold text-purple-900 group-hover:text-purple-700 transition-colors">
            Smong
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 font-sans font-bold text-sm text-ink-700">
          <Link href="#misi" className="hover:text-purple-700 transition-colors">
            Fitur
          </Link>
          <Link href="#modul" className="hover:text-purple-700 transition-colors">
            Modul
          </Link>
          <Link href="#cerita" className="hover:text-purple-700 transition-colors">
            Cerita
          </Link>
        </div>

        {/* CTA */}
        <Link
          href="/siswa"
          className="bg-purple-700 text-white font-heading font-bold text-sm px-6 py-2.5 rounded-full shadow-[0_4px_0_0_#2F176E] hover:bg-purple-500 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
        >
          Mulai Misi
        </Link>
      </nav>
    </motion.header>
  );
}
