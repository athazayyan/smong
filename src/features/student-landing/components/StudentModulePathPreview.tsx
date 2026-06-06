"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import {
  Award,
  BookOpen,
  Check,
  HeartHandshake,
  Lock,
  Map as MapIcon,
  MousePointerClick,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { studentModulePreviewNodes } from "../data/visual-config";
import type { ModuleGroupId, StudentModulePreviewNode } from "../types";

interface StudentModulePathPreviewProps {
  moduleGroupId: ModuleGroupId;
}

export function StudentModulePathPreview({ moduleGroupId }: StudentModulePathPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const title = moduleGroupId === "gempa-bumi" ? "Jalur Belajar: Gempa Bumi" : "Jalur Belajar";

  useEffect(() => {
    if (shouldReduceMotion || !sectionRef.current) return;

    const root = sectionRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-path-line]", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 1, ease: "power3.out" });
      gsap.fromTo("[data-preview-node]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" });
    }, root);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-[2rem] border border-purple-700/8 bg-white/58 p-6 shadow-[0_24px_70px_rgba(47,23,110,0.08)] md:rounded-[2.75rem] md:p-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-white/70 via-lavender-100/30 to-mint-100/34" />
      <div className="pointer-events-none absolute -left-20 top-20 h-52 w-[48%] smong-veil bg-mint-100/34" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-60 w-[54%] smong-river bg-lavender-100/34" />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-purple-700/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
          <MapIcon className="h-4 w-4" />
          Modul aktif
        </p>
        <h2 className="mt-4 font-heading text-4xl font-black leading-tight text-ink-900 md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-7 text-ink-700">
          Jalur dibuat pendek dan berurutan, supaya siswa tahu langkah berikutnya tanpa visual yang menumpuk.
        </p>
      </div>

      <div className="relative mt-10">
        <div data-path-line className="pointer-events-none absolute left-6 right-6 top-10 hidden h-1 rounded-full bg-purple-900/18 md:block" />
        <div className="grid gap-3 md:grid-cols-5">
          {[...studentModulePreviewNodes]
            .sort((a, b) => a.mobileOrder - b.mobileOrder)
            .map((node) => (
              <PreviewNode key={node.id} node={node} />
            ))}
        </div>
      </div>

      <div className="relative mt-8 flex justify-center">
        <Link
          href="/siswa/modul"
          className="group inline-flex items-center gap-2 rounded-full bg-purple-900 px-7 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_0_#20104f] transition hover:-translate-y-0.5 hover:bg-purple-700 active:translate-y-1 active:shadow-[0_3px_0_#20104f]"
        >
          Buka Jalur Lengkap
          <MapIcon className="h-5 w-5 transition group-hover:rotate-6" />
        </Link>
      </div>
    </section>
  );
}

function PreviewNode({ node }: { node: StudentModulePreviewNode }) {
  return (
    <div data-preview-node className="relative z-10 smong-slab-soft border border-purple-700/8 bg-white/68 p-4 text-center shadow-sm backdrop-blur">
      <NodeButton node={node} />
      <p className="mt-4 text-[0.62rem] font-black uppercase tracking-[0.14em] text-purple-700">
        {node.phaseLabel}
      </p>
      <p className="mt-1 font-heading text-lg font-black leading-tight text-ink-900">{node.label}</p>
    </div>
  );
}

function NodeButton({ node }: { node: StudentModulePreviewNode }) {
  const statusClassName =
    node.status === "completed"
      ? "bg-purple-900 text-white"
      : node.status === "active"
        ? "bg-purple-900 text-white shadow-[0_7px_0_#20104f]"
        : "bg-lavender-100 text-ink-400";

  return (
    <div
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-[1rem] ${statusClassName}`}
      aria-label={node.label}
    >
      {node.status === "completed" ? <Check className="h-6 w-6" /> : node.status === "locked" ? <Lock className="h-5 w-5" /> : renderPreviewIcon(node.iconName)}
    </div>
  );
}

function renderPreviewIcon(iconName: StudentModulePreviewNode["iconName"]) {
  if (iconName === "BookOpen") return <BookOpen className="h-6 w-6" />;
  if (iconName === "ShieldCheck") return <ShieldCheck className="h-6 w-6" />;
  if (iconName === "PackageCheck") return <PackageCheck className="h-6 w-6" />;
  if (iconName === "MousePointerClick") return <MousePointerClick className="h-6 w-6" />;
  if (iconName === "HeartHandshake") return <HeartHandshake className="h-6 w-6" />;
  return <Award className="h-6 w-6" />;
}
