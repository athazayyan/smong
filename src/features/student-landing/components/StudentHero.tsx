"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { BookOpen, ChevronRight, Flame, Route, ShieldCheck, Sparkles, Zap } from "lucide-react";
import gsap from "gsap";
import type { StudentHeroStat } from "../types";

interface StudentHeroProps {
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  stats: StudentHeroStat[];
}

export function StudentHero({
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  stats,
}: StudentHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || !sectionRef.current) return;

    const root = sectionRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-abstract-thread]",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 1.1, ease: "power3.out", delay: 0.2 }
      );
      gsap.to("[data-abstract-float]", {
        y: -9,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.28,
      });
    }, root);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20 smong-quiet-field" />
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[440px] w-[88vw] max-w-6xl -translate-x-1/2 smong-veil bg-white/42 blur-[1px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[620px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative z-10 max-w-2xl text-center lg:text-left">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-700/10 bg-white/70 px-4 py-2 text-sm font-extrabold text-purple-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Petualangan Siaga Hari Ini
          </p>

          <h1 className="font-heading text-[3.2rem] font-black leading-[0.92] tracking-normal text-ink-900 sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base font-semibold leading-8 text-ink-700 lg:mx-0">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/siswa/modul"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-purple-900 px-7 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_0_#20104f] transition hover:-translate-y-0.5 hover:bg-purple-700 active:translate-y-1 active:shadow-[0_3px_0_#20104f]"
            >
              {primaryCtaLabel}
              <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/siswa/modul"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-purple-700/12 bg-white/72 px-7 py-4 font-heading text-base font-extrabold text-purple-900 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <BookOpen className="h-5 w-5 text-purple-700" />
              {secondaryCtaLabel}
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div key={stat.id} className="smong-slab-soft border border-purple-700/8 bg-white/62 px-4 py-4 text-center shadow-sm backdrop-blur">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center text-purple-700">
                  <HeroStatIcon iconName={stat.iconName} />
                </div>
                <p className="font-heading text-2xl font-black leading-none text-ink-900">{stat.value}</p>
                <p className="mt-1 text-[0.64rem] font-black uppercase tracking-[0.12em] text-ink-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[360px] lg:min-h-[540px]">
          <div className="pointer-events-none absolute inset-x-4 top-1/2 h-28 -translate-y-1/2 smong-thread opacity-80" data-abstract-thread />
          <div className="pointer-events-none absolute left-[8%] top-[16%] h-64 w-[78%] smong-river bg-purple-900/8" />
          <div className="pointer-events-none absolute bottom-[12%] right-[4%] h-56 w-[72%] smong-veil bg-mint-100/55" />

          <div data-abstract-float className="absolute left-[10%] top-[35%] smong-slab border border-purple-700/10 bg-white/78 p-5 shadow-[0_20px_50px_rgba(47,23,110,0.1)] backdrop-blur">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-purple-900 text-white">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="font-heading text-2xl font-black text-ink-900">Jalur aman</p>
            <p className="mt-2 max-w-[220px] text-sm font-semibold leading-6 text-ink-700">Pilih misi, ikuti langkah, buka checkpoint baru.</p>
          </div>

          <div data-abstract-float className="absolute right-[6%] top-[18%] w-44 smong-slab-soft border border-purple-700/10 bg-white/70 p-4 text-center shadow-sm backdrop-blur">
            <Zap className="mx-auto h-7 w-7 text-yellow-700" />
            <p className="mt-2 font-heading text-xl font-black text-ink-900">+50 XP</p>
            <p className="text-xs font-bold text-ink-400">Misi harian</p>
          </div>

          <div data-abstract-float className="absolute bottom-[18%] left-[42%] w-52 smong-slab-soft border border-teal-700/10 bg-white/64 p-4 shadow-sm backdrop-blur">
            <Route className="mb-3 h-6 w-6 text-teal-700" />
            <p className="font-heading text-lg font-black text-ink-900">Pra, Saat, Pasca</p>
            <p className="mt-1 text-xs font-bold leading-5 text-ink-700">Belajar bencana lewat alur yang pendek dan aman.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStatIcon({ iconName }: { iconName: StudentHeroStat["iconName"] }) {
  if (iconName === "Zap") return <Zap className="h-4 w-4" />;
  if (iconName === "Flame") return <Flame className="h-4 w-4" />;
  return <Route className="h-4 w-4" />;
}
