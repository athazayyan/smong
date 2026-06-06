import { Clock, Lock, MapPinned, ShieldCheck, Waves } from "lucide-react";
import type { LearningModuleGroup } from "@/features/student-learning/types";
import { lockedModuleIslandLabels } from "@/features/student-learning/data/visualConfig";

interface LockedModuleIslandsProps {
  modules: LearningModuleGroup[];
}

export function LockedModuleIslands({ modules }: LockedModuleIslandsProps) {
  return (
    <section className="mt-12">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-500">Dunia berikutnya</p>
        <h2 className="font-heading text-3xl font-black text-ink-900">Modul Berikutnya</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
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
    <article className="relative min-h-[220px] overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/76 p-5 shadow-[0_18px_48px_rgba(47,23,110,0.08)]">
      <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full ${toneClassName.orb}`} />
      <div className={`absolute -bottom-12 left-1/2 h-28 w-[84%] -translate-x-1/2 rounded-[50%] ${toneClassName.ground}`} />
      <div className="relative flex h-full flex-col">
        <div className="mb-8 flex items-start justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${toneClassName.icon}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-100 text-ink-400">
            <Lock className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-500">
          {meta?.eyebrow ?? "Segera hadir"}
        </p>
        <h3 className="mt-2 font-heading text-2xl font-black text-ink-900">{moduleGroup.title}</h3>
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
      orb: "bg-sky-100/80 blur-2xl",
      ground: "bg-sky-100/42 blur-xl",
    };
  }
  if (tone === "teal") {
    return {
      icon: "bg-mint-100 text-teal-700",
      orb: "bg-mint-100/85 blur-2xl",
      ground: "bg-mint-100/42 blur-xl",
    };
  }
  return {
    icon: "bg-lavender-100 text-purple-700",
    orb: "bg-lavender-100/85 blur-2xl",
    ground: "bg-lavender-100/42 blur-xl",
  };
}
