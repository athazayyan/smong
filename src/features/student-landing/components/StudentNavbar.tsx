"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Map as MapIcon,
  Award,
  Camera,
  KeyRound,
  User,
  LucideIcon,
} from "lucide-react";
import { StudentNavbarItem } from "../types";

const iconMap: Record<StudentNavbarItem["iconName"], LucideIcon> = {
  Home,
  BookOpen,
  Map: MapIcon,
  Award,
  Camera,
  KeyRound,
  User,
};

interface StudentNavbarProps {
  items: StudentNavbarItem[];
  schoolSyncStatus: "not-synced" | "checking-code" | "synced" | "invalid-code" | "expired-code" | "already-synced";
  schoolName?: string;
}

export function StudentNavbar({ items, schoolSyncStatus, schoolName }: StudentNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-purple-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/siswa" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-indigo-600">
                Smong
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {items.map((item) => {
                if (!item.isVisible) return null;
                // Conditionally hide "Masukkan Kode" if already synced
                if (item.id === "school-code" && schoolSyncStatus === "synced") {
                  return null;
                }

                const Icon = iconMap[item.iconName];
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-purple-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {schoolSyncStatus === "synced" && schoolName ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-mint-50/50 text-teal-700 rounded-full border border-teal-100">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span className="text-xs font-semibold">{schoolName}</span>
              </div>
            ) : null}
            {schoolSyncStatus === "not-synced" ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-200">
                <span className="text-xs font-medium">Belum tersinkron sekolah</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
