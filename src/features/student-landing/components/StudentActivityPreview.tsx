import React from "react";
import { CircleHelp, ListChecks, MousePointerClick, PackageCheck } from "lucide-react";
import { studentActivityPreviewItems } from "../data/visual-config";
import type { StudentActivityPreviewItem } from "../types";

export function StudentActivityPreview() {
  return (
    <section className="relative overflow-hidden rounded-[3rem] bg-white/70 p-6 shadow-[0_24px_70px_rgba(47,23,110,0.08)] md:p-8">
      <div className="absolute -left-16 top-6 h-44 w-44 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-mint-100/55 blur-3xl" />

      <div className="relative mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Mini activities</p>
          <h2 className="font-heading text-4xl font-black leading-tight text-ink-900">Belajar dengan aksi kecil</h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-ink-700">
          Tiap aktivitas dibuat singkat: pilih, susun, cek, lalu langsung dapat feedback.
        </p>
      </div>

      <div className="relative grid gap-4 md:grid-cols-3">
        {studentActivityPreviewItems.map((item, index) => (
          <ActivityTile key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function ActivityTile({ item, index }: { item: StudentActivityPreviewItem; index: number }) {
  const toneClassName = getActivityToneClassName(item.tone);

  return (
    <article
      className={`relative overflow-hidden rounded-[2rem] border border-white bg-white/82 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(47,23,110,0.1)] ${
        index === 1 ? "md:mt-8" : ""
      }`}
    >
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${toneClassName.orb}`} />
      <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${toneClassName.icon}`}>
        {renderActivityIcon(item.iconName)}
      </div>
      <h3 className="font-heading text-2xl font-black text-ink-900">{item.title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink-700">{item.description}</p>
      <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-purple-600">
        <MousePointerClick className="h-3.5 w-3.5" />
        Interaktif
      </div>
    </article>
  );
}

function renderActivityIcon(iconName: StudentActivityPreviewItem["iconName"]) {
  if (iconName === "CircleHelp") return <CircleHelp className="h-7 w-7" />;
  if (iconName === "PackageCheck") return <PackageCheck className="h-7 w-7" />;
  return <ListChecks className="h-7 w-7" />;
}

function getActivityToneClassName(tone: StudentActivityPreviewItem["tone"]) {
  if (tone === "peach") {
    return {
      icon: "bg-peach-200 text-coral-700",
      orb: "bg-peach-200/70 blur-2xl",
    };
  }
  if (tone === "mint") {
    return {
      icon: "bg-mint-100 text-teal-700",
      orb: "bg-mint-100/75 blur-2xl",
    };
  }
  return {
    icon: "bg-sky-100 text-purple-700",
    orb: "bg-sky-100/75 blur-2xl",
  };
}
