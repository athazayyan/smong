import { Clock, Lock, MapPinned, ShieldCheck, Waves } from "lucide-react";
import type { LearningModuleGroup } from "@/features/student-learning/types";
import { lockedModuleIslandLabels } from "@/features/student-learning/data/visualConfig";

interface LockedModuleIslandsProps {
  modules: LearningModuleGroup[];
}

export function LockedModuleIslands({ modules }: LockedModuleIslandsProps) {
  return (
    <section className="mt-10">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-500">Dunia berikutnya</p>
        <h2 className="font-heading text-3xl font-black text-ink-900">Modul Berikutnya</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {modules.map((moduleGroup) => (
          <LockedIsland key={moduleGroup.id} moduleGroup={moduleGroup} />
        ))}
      </div>
    </section>
  );
}

function LockedIsland({ moduleGroup }: { moduleGroup: LearningModuleGroup }) {
  const meta = lockedModuleIslandLabels.find((item) => item.moduleGroupId === moduleGroup.id);
  const Icon = moduleGroup.id === "banjir" ? Waves : moduleGroup.id === "tsunami" ? MapPinned : ShieldCheck;
  const toneClassName = getToneClassName(meta?.tone ?? "purple");

  return (
    <article className="relative min-h-[200px] overflow-hidden rounded-[1.7rem] border border-purple-700/8 bg-white/62 p-5 shadow-sm">
      <div className={`pointer-events-none absolute -right-12 top-0 h-28 w-36 smong-river ${toneClassName.accent}`} />
      <div className="relative flex h-full flex-col">
        <div className="mb-6 flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${toneClassName.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-100 text-ink-400">
            <Lock className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-500">
          {meta?.eyebrow ?? "Segera hadir"}
        </p>
        <h3 className="mt-2 font-heading text-xl font-black text-ink-900">{moduleGroup.title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-ink-700">{moduleGroup.description}</p>
        <p className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-lavender-100 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-ink-400">
          <Clock className="h-3.5 w-3.5" />
          Segera hadir
        </p>
      </div>
    </article>
  );
}

function getToneClassName(tone: "sky" | "teal" | "purple") {
  if (tone === "sky") {
    return {
      icon: "bg-sky-100 text-purple-700",
      accent: "bg-sky-100/40",
    };
  }
  if (tone === "teal") {
    return {
      icon: "bg-mint-100 text-teal-700",
      accent: "bg-mint-100/44",
    };
  }
  return {
    icon: "bg-lavender-100 text-purple-700",
    accent: "bg-lavender-100/44",
  };
}
