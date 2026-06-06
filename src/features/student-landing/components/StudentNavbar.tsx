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
  Shield,
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
    <nav className="sticky top-0 z-50 w-full px-3 py-3">
      <div className="mx-auto max-w-7xl rounded-full border border-white/75 bg-cream-50/82 px-3 shadow-[0_14px_42px_rgba(47,23,110,0.1)] backdrop-blur-xl sm:px-5">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <Link href="/siswa" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-white shadow-[0_7px_0_#32146f]">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-heading text-2xl font-black text-purple-900">
                Smong
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {items.map((item) => {
                if (!item.isVisible) return null;
                if (item.id === "school-code" && schoolSyncStatus === "synced") {
                  return null;
                }

                const Icon = iconMap[item.iconName];
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-extrabold transition-all duration-200 ${
                      isActive
                        ? "bg-lavender-100 text-purple-700 shadow-inner"
                        : "text-ink-700/70 hover:bg-white/75 hover:text-purple-700"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-purple-600" : "text-ink-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {schoolSyncStatus === "synced" && schoolName ? (
              <div className="hidden items-center gap-2 rounded-full border border-teal-100 bg-mint-100/70 px-3 py-2 text-teal-700 sm:flex">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="text-xs font-extrabold">{schoolName}</span>
              </div>
            ) : null}
            {schoolSyncStatus === "not-synced" ? (
              <div className="hidden items-center gap-2 rounded-full border border-lavender-200 bg-white/70 px-3 py-2 text-ink-400 sm:flex">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-xs font-extrabold">Belum tersinkron sekolah</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
