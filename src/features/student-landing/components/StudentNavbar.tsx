"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import {
  Award,
  BookOpen,
  Camera,
  Home,
  KeyRound,
  Map as MapIcon,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import type { SchoolSyncStatus, StudentNavbarItem } from "../types";

interface StudentNavbarProps {
  items: StudentNavbarItem[];
  schoolSyncStatus: SchoolSyncStatus;
  schoolName?: string;
}

export function StudentNavbar({ items, schoolSyncStatus, schoolName }: StudentNavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const visibleItems = useMemo(
    () => getVisibleItems(items, schoolSyncStatus),
    [items, schoolSyncStatus]
  );
  const primaryItems = visibleItems.filter((item) => item.placement === "primary");
  const desktopItems = visibleItems;
  const tabletItems = visibleItems.filter((item) => item.placement === "primary").slice(0, 4);
  const tabletSheetItems = visibleItems.filter(
    (item) => !tabletItems.some((tabletItem) => tabletItem.id === item.id)
  );
  const bottomItems = visibleItems.filter((item) => item.mobileSlot === "bottom").slice(0, 5);
  const mobileSheetItems = visibleItems.filter((item) => item.mobileSlot !== "bottom");

  useEffect(() => {
    if (shouldReduceMotion || !navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-student-nav-shell]",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    }, navRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!isMenuOpen || shouldReduceMotion || !sheetRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-mobile-sheet-panel]",
        { opacity: 0, y: 26, clipPath: "inset(18% 6% 0% 6% round 2rem)" },
        { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 2rem)", duration: 0.34, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-mobile-sheet-item]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.24, stagger: 0.04, ease: "power2.out", delay: 0.05 }
      );
    }, sheetRef);

    return () => ctx.revert();
  }, [isMenuOpen, shouldReduceMotion]);

  return (
    <>
      <nav ref={navRef} className="sticky top-0 z-50 w-full px-3 py-3">
        <DesktopStudentNav
          items={desktopItems}
          pathname={pathname}
          schoolName={schoolName}
          schoolSyncStatus={schoolSyncStatus}
        />
        <TabletStudentNav
          items={tabletItems}
          sheetItems={tabletSheetItems}
          pathname={pathname}
          schoolName={schoolName}
          schoolSyncStatus={schoolSyncStatus}
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen((current) => !current)}
        />
        <MobileStudentTopBar
          schoolName={schoolName}
          schoolSyncStatus={schoolSyncStatus}
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen((current) => !current)}
        />
      </nav>

      <MobileStudentBottomNav items={bottomItems} pathname={pathname} />

      <StudentMobileMenuSheet
        isOpen={isMenuOpen}
        items={mobileSheetItems.length > 0 ? mobileSheetItems : primaryItems}
        pathname={pathname}
        schoolName={schoolName}
        schoolSyncStatus={schoolSyncStatus}
        sheetRef={sheetRef}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}

function DesktopStudentNav({
  items,
  pathname,
  schoolSyncStatus,
  schoolName,
}: {
  items: StudentNavbarItem[];
  pathname: string;
  schoolSyncStatus: SchoolSyncStatus;
  schoolName?: string;
}) {
  return (
    <div data-student-nav-shell className="mx-auto hidden max-w-7xl rounded-full border border-white/75 bg-cream-50/84 px-5 shadow-[0_14px_42px_rgba(47,23,110,0.1)] backdrop-blur-xl lg:block">
      <div className="flex min-h-16 items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-6">
          <BrandLink />
          <div className="flex min-w-0 items-center gap-1">
            {items.map((item) => (
              <NavLinkItem key={item.id} item={item} pathname={pathname} mode="desktop" />
            ))}
          </div>
        </div>
        <StatusChip schoolName={schoolName} schoolSyncStatus={schoolSyncStatus} />
      </div>
    </div>
  );
}

function TabletStudentNav({
  items,
  sheetItems,
  pathname,
  schoolSyncStatus,
  schoolName,
  isMenuOpen,
  onToggleMenu,
}: {
  items: StudentNavbarItem[];
  sheetItems: StudentNavbarItem[];
  pathname: string;
  schoolSyncStatus: SchoolSyncStatus;
  schoolName?: string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <div data-student-nav-shell className="mx-auto hidden max-w-5xl rounded-full border border-white/75 bg-cream-50/86 px-4 shadow-[0_14px_42px_rgba(47,23,110,0.1)] backdrop-blur-xl md:block lg:hidden">
      <div className="flex min-h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <BrandLink compact />
          <div className="flex min-w-0 items-center gap-1">
            {items.map((item) => (
              <NavLinkItem key={item.id} item={item} pathname={pathname} mode="tablet" />
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusChip schoolName={schoolName} schoolSyncStatus={schoolSyncStatus} compact />
          {sheetItems.length > 0 ? (
            <MenuButton isOpen={isMenuOpen} onClick={onToggleMenu} label="Menu siswa" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MobileStudentTopBar({
  schoolSyncStatus,
  schoolName,
  isMenuOpen,
  onToggleMenu,
}: {
  schoolSyncStatus: SchoolSyncStatus;
  schoolName?: string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <div data-student-nav-shell className="mx-auto rounded-[1.7rem] border border-white/75 bg-cream-50/88 px-3 shadow-[0_14px_38px_rgba(47,23,110,0.1)] backdrop-blur-xl md:hidden">
      <div className="flex min-h-14 items-center justify-between gap-3">
        <BrandLink compact />
        <div className="flex min-w-0 items-center gap-2">
          <StatusChip schoolName={schoolName} schoolSyncStatus={schoolSyncStatus} mobile />
          <MenuButton isOpen={isMenuOpen} onClick={onToggleMenu} label="Buka menu siswa" />
        </div>
      </div>
    </div>
  );
}

function MobileStudentBottomNav({ items, pathname }: { items: StudentNavbarItem[]; pathname: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.7rem] border border-white/75 bg-cream-50/92 p-2 shadow-[0_-14px_38px_rgba(47,23,110,0.12)] backdrop-blur-xl">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={`Navigasi ${item.label}`}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1 text-center transition ${
                isActive ? "bg-purple-900 text-white shadow-[0_5px_0_#20104f]" : "text-ink-700/72 hover:bg-white/75"
              }`}
            >
              {renderStudentNavIcon(item.iconName, `h-5 w-5 ${isActive ? "text-white" : "text-ink-400"}`)}
              <span className="max-w-full truncate text-[0.68rem] font-black leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StudentMobileMenuSheet({
  isOpen,
  items,
  pathname,
  schoolSyncStatus,
  schoolName,
  sheetRef,
  onClose,
}: {
  isOpen: boolean;
  items: StudentNavbarItem[];
  pathname: string;
  schoolSyncStatus: SchoolSyncStatus;
  schoolName?: string;
  sheetRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div ref={sheetRef} className="fixed inset-0 z-[60] md:z-50">
      <button
        type="button"
        aria-label="Tutup menu siswa"
        className="absolute inset-0 bg-purple-900/22 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div data-mobile-sheet-panel className="absolute inset-x-3 bottom-24 rounded-[2rem] border border-white/75 bg-cream-50 p-4 shadow-[0_24px_70px_rgba(47,23,110,0.22)] md:bottom-auto md:right-4 md:left-auto md:top-24 md:w-[360px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-heading text-2xl font-black text-ink-900">Menu Siswa</p>
            <p className="text-xs font-bold text-ink-400">{getStatusLabel(schoolSyncStatus, schoolName)}</p>
          </div>
          <button
            type="button"
            aria-label="Tutup menu"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-purple-700 shadow-sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-2">
          {items.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                data-mobile-sheet-item
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`flex min-h-12 items-center gap-3 rounded-[1.2rem] px-4 py-3 transition ${
                  isActive ? "bg-purple-900 text-white" : "bg-white/78 text-ink-700 hover:bg-white"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-[0.9rem] ${isActive ? "bg-white/12" : "bg-lavender-100 text-purple-700"}`}>
                  {renderStudentNavIcon(item.iconName, "h-5 w-5")}
                </span>
                <span className="font-heading text-base font-black">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BrandLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/siswa" className="flex min-h-11 shrink-0 items-center gap-2">
      <div className={`${compact ? "h-9 w-9" : "h-10 w-10"} flex items-center justify-center rounded-full bg-purple-700 text-white shadow-[0_7px_0_#32146f]`}>
        <Shield className="h-5 w-5" />
      </div>
      <span className={`${compact ? "text-xl" : "text-2xl"} font-heading font-black text-purple-900`}>
        Smong
      </span>
    </Link>
  );
}

function NavLinkItem({ item, pathname, mode }: { item: StudentNavbarItem; pathname: string; mode: "desktop" | "tablet" }) {
  const isActive = isNavItemActive(pathname, item.href);
  const showLabel = mode === "desktop" || item.label.length <= 8;

  return (
    <Link
      href={item.href}
      className={`flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-extrabold transition-all duration-200 ${
        isActive
          ? "bg-lavender-100 text-purple-700 shadow-inner"
          : "text-ink-700/70 hover:bg-white/75 hover:text-purple-700"
      }`}
    >
      {renderStudentNavIcon(item.iconName, `h-4 w-4 ${isActive ? "text-purple-600" : "text-ink-400"}`)}
      {showLabel ? <span className="whitespace-nowrap">{item.label}</span> : null}
    </Link>
  );
}

function MenuButton({ isOpen, onClick, label }: { isOpen: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={isOpen}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-900 text-white shadow-[0_6px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_3px_0_#20104f]"
      onClick={onClick}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

function StatusChip({
  schoolSyncStatus,
  schoolName,
  compact = false,
  mobile = false,
}: {
  schoolSyncStatus: SchoolSyncStatus;
  schoolName?: string;
  compact?: boolean;
  mobile?: boolean;
}) {
  if (schoolSyncStatus === "synced" && schoolName) {
    return (
      <div className={`flex min-w-0 items-center gap-2 rounded-full border border-teal-100 bg-mint-100/70 text-teal-700 ${mobile ? "max-w-[128px] px-2 py-1.5" : compact ? "max-w-[160px] px-3 py-2" : "px-3 py-2"}`}>
        <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
        <span className="truncate text-xs font-extrabold">{schoolName}</span>
      </div>
    );
  }

  if (schoolSyncStatus !== "not-synced") return null;

  return (
    <div className={`flex items-center gap-2 rounded-full border border-lavender-200 bg-white/70 text-ink-400 ${mobile ? "px-2 py-1.5" : compact ? "px-3 py-2" : "px-3 py-2"}`}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
      <span className={`${mobile ? "hidden min-[360px]:inline" : ""} whitespace-nowrap text-xs font-extrabold`}>
        {mobile ? "Belum sinkron" : "Belum tersinkron sekolah"}
      </span>
    </div>
  );
}

function getVisibleItems(items: StudentNavbarItem[], schoolSyncStatus: SchoolSyncStatus) {
  return items.filter((item) => {
    if (!item.isVisible) return false;
    if (item.id === "school-code" && schoolSyncStatus === "synced") return false;
    return true;
  });
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/siswa") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getStatusLabel(schoolSyncStatus: SchoolSyncStatus, schoolName?: string) {
  if (schoolSyncStatus === "synced" && schoolName) return schoolName;
  if (schoolSyncStatus === "synced") return "Tersinkron sekolah";
  return "Belum tersinkron sekolah";
}

function renderStudentNavIcon(iconName: StudentNavbarItem["iconName"], className: string) {
  if (iconName === "Home") return <Home className={className} />;
  if (iconName === "BookOpen") return <BookOpen className={className} />;
  if (iconName === "Map") return <MapIcon className={className} />;
  if (iconName === "Award") return <Award className={className} />;
  if (iconName === "Camera") return <Camera className={className} />;
  if (iconName === "KeyRound") return <KeyRound className={className} />;
  return <User className={className} />;
}
