import React from "react";
import { ArrowRight, BookOpen, Lock, MapPinned, ShieldCheck, Waves } from "lucide-react";
import { studentDisasterModuleCards } from "../data/visual-config";
import type { ModuleGroupId, StudentDisasterModuleCard } from "../types";

interface DisasterModuleCardsProps {
  moduleGroupIds: ModuleGroupId[];
}

export function DisasterModuleCards({ moduleGroupIds }: DisasterModuleCardsProps) {
  const modules = studentDisasterModuleCards.filter((moduleCard) =>
    moduleGroupIds.includes(moduleCard.id)
  );

  return (
    <section className="relative">
      <div className="mb-7 flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-500">Pilih dunia belajar</p>
          <h2 className="font-heading text-4xl font-black leading-tight text-ink-900">Modul Siaga</h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-ink-700">
          Gempa Bumi aktif lebih dulu. Modul lain disiapkan sebagai pulau belajar berikutnya.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {modules.map((moduleCard) => (
          <ModuleCard key={moduleCard.id} moduleCard={moduleCard} />
        ))}
      </div>
    </section>
  );
}

function ModuleCard({ moduleCard }: { moduleCard: StudentDisasterModuleCard }) {
  const active = moduleCard.status === "active";
  const toneClassName = getToneClassName(moduleCard.tone);

  return (
    <article
      className={`group relative min-h-[280px] overflow-hidden rounded-[2.2rem] border p-6 transition ${
        active
          ? "border-purple-200 bg-white shadow-[0_24px_60px_rgba(91,59,181,0.13)] hover:-translate-y-1"
          : "border-white/80 bg-white/65 opacity-85 shadow-[0_18px_44px_rgba(47,23,110,0.07)]"
      }`}
    >
      <div className={`absolute -right-16 -top-14 h-44 w-44 rounded-full ${toneClassName.orb}`} />
      <div className={`absolute -bottom-16 left-1/2 h-36 w-[86%] -translate-x-1/2 rounded-[50%] ${toneClassName.ground}`} />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div className={`flex h-16 w-16 items-center justify-center rounded-[1.4rem] ${toneClassName.icon}`}>
            {renderModuleIcon(moduleCard.iconName)}
          </div>
          {active ? (
            <span className="rounded-full bg-yellow-200 px-3 py-1.5 text-xs font-black text-yellow-800">
              Aktif
            </span>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-100 text-ink-400">
              <Lock className="h-4 w-4" />
            </span>
          )}
        </div>

        <div className="mt-9">
          <h3 className="font-heading text-3xl font-black leading-tight text-ink-900">{moduleCard.title}</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink-700">{moduleCard.description}</p>
        </div>

        <div className="mt-auto pt-7">
          {active ? (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-purple-600">
                <span>Progress</span>
                <span>{moduleCard.progressPercent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-lavender-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-yellow-500 via-peach-300 to-teal-500"
                  style={{ width: `${moduleCard.progressPercent}%` }}
                />
              </div>
              <div className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-black text-purple-700">
                Buka modul
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          ) : (
            <p className="inline-flex items-center gap-2 rounded-full bg-lavender-100 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-ink-400">
              <Lock className="h-3.5 w-3.5" />
              Segera hadir
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function renderModuleIcon(iconName: StudentDisasterModuleCard["iconName"]) {
  if (iconName === "ShieldCheck") return <ShieldCheck className="h-8 w-8" />;
  if (iconName === "Waves") return <Waves className="h-8 w-8" />;
  if (iconName === "MapPinned") return <MapPinned className="h-8 w-8" />;
  return <BookOpen className="h-8 w-8" />;
}

function getToneClassName(tone: StudentDisasterModuleCard["tone"]) {
  if (tone === "sky") {
    return {
      icon: "bg-sky-100 text-purple-700",
      orb: "bg-sky-100/85 blur-2xl",
      ground: "bg-sky-100/45 blur-xl",
    };
  }
  if (tone === "teal") {
    return {
      icon: "bg-mint-100 text-teal-700",
      orb: "bg-mint-100/85 blur-2xl",
      ground: "bg-mint-100/45 blur-xl",
    };
  }
  if (tone === "yellow") {
    return {
      icon: "bg-yellow-200 text-yellow-800",
      orb: "bg-yellow-200/75 blur-2xl",
      ground: "bg-yellow-200/40 blur-xl",
    };
  }
  return {
    icon: "bg-lavender-100 text-purple-700",
    orb: "bg-lavender-100/85 blur-2xl",
    ground: "bg-lavender-100/45 blur-xl",
  };
}
