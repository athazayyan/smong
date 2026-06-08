import React from "react";
import { CircleHelp, ListChecks, MousePointerClick, PackageCheck } from "lucide-react";
import { studentActivityPreviewItems } from "../data/visual-config";
import type { StudentActivityPreviewItem } from "../types";

export function StudentActivityPreview() {
  return (
    <section className="rounded-[2rem] border border-purple-700/8 bg-white/62 p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-700">Mini activities</p>
          <h2 className="font-heading text-3xl font-black leading-tight text-ink-900">Aksi kecil, feedback cepat</h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-ink-700">
          Pilih, susun, cek, lalu langsung tahu langkah amannya.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {studentActivityPreviewItems.map((item, index) => (
          <ActivityTile key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function ActivityTile({ item, index }: { item: StudentActivityPreviewItem; index: number }) {
  const toneClassName = getActivityToneClassName(item.tone);
  void index;

  return (
    <article
      className="rounded-[1.5rem] border border-purple-700/8 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[1rem] ${toneClassName.icon}`}>
        {renderActivityIcon(item.iconName)}
      </div>
      <h3 className="font-heading text-xl font-black text-ink-900">{item.title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink-700">{item.description}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-purple-600">
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
      icon: "bg-yellow-200 text-yellow-800",
    };
  }
  if (tone === "mint") {
    return {
      icon: "bg-mint-100 text-teal-700",
    };
  }
  return {
    icon: "bg-lavender-100 text-purple-700",
  };
}
