"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/siswa", icon: "🏠", label: "Beranda" },
  { href: "/dashboard/siswa/modul", icon: "🗺️", label: "Modul" },
  { href: "/dashboard/siswa/badge", icon: "🏅", label: "Badge" },
  { href: "/dashboard/siswa/misi", icon: "🎯", label: "Misi" },
  { href: "/dashboard/siswa/profil", icon: "👤", label: "Profil" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-20 xl:w-56 shrink-0 bg-white border-r-2 border-lavender-200/50 min-h-screen py-6 px-3 xl:px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 px-2">
        <span className="text-2xl">🌊</span>
        <span className="hidden xl:block font-heading text-lg font-bold text-purple-700">Smong</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors font-heading text-sm font-semibold",
                  isActive
                    ? "bg-purple-700 text-white shadow-[0_3px_0_0_#2F176E]"
                    : "text-ink-700 hover:bg-lavender-200/50"
                )}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="hidden xl:block">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Mascot hint at bottom */}
      <div className="hidden xl:flex items-center gap-2 mt-4 p-3 bg-lavender-200/30 rounded-2xl">
        <span className="text-2xl">🌊</span>
        <p className="font-sans text-xs text-ink-700">
          Ayo selesaikan misi harianmu!
        </p>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-lavender-200/50 px-2 py-2 flex items-center justify-around">
      {NAV_ITEMS.slice(0, 4).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-12 h-10 flex items-center justify-center rounded-2xl transition-colors",
                isActive ? "bg-purple-700" : "bg-transparent"
              )}
            >
              <span className="text-xl">{item.icon}</span>
            </motion.div>
            <span
              className={cn(
                "font-sans text-[10px] font-semibold",
                isActive ? "text-purple-700" : "text-ink-700"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
