import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Route, ShieldCheck, Sparkles } from "lucide-react";
import type { ModuleChapter, ModuleProgress } from "@/features/student-learning/types";

interface ModuleWorldHeroProps {
  title: string;
  description: string;
  chapters: ModuleChapter[];
  progress: ModuleProgress;
}

export function ModuleWorldHero({ title, description, chapters, progress }: ModuleWorldHeroProps) {
  const completedChapters = progress.completedChapterIds.length;
  const totalChapters = chapters.length;
  const activeChapter = chapters[completedChapters] ?? chapters[0];
  const percent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">
      <div className="pointer-events-none absolute inset-0 -z-20 smong-quiet-field" />
      <div className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[360px] w-[86vw] max-w-6xl -translate-x-1/2 smong-veil bg-white/36" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1fr_360px] lg:min-h-[520px] lg:grid-cols-[1fr_480px] lg:gap-10">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-700/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-yellow-700" />
            Perjalanan Belajarmu
          </p>
          <h1 className="font-heading text-5xl font-black leading-[0.96] text-ink-900 sm:text-6xl md:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-ink-700 md:text-lg">
            {description}
          </p>

          <div className="mt-7 flex flex-col gap-3 min-[460px]:flex-row">
            <Link
              href={`/siswa/modul/${activeChapter.id}`}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-purple-900 px-7 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_0_#20104f] transition hover:-translate-y-0.5 hover:bg-purple-700 active:translate-y-1 active:shadow-[0_3px_0_#20104f]"
            >
              Lanjutkan Bab
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <div className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-purple-700/10 bg-white/72 px-5 py-4 font-heading text-base font-black text-ink-900 shadow-sm">
              <BookOpen className="h-5 w-5 text-purple-700" />
              {totalChapters} Bab - SD/SMP
            </div>
          </div>
        </div>

        <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px]">
          <div className="pointer-events-none absolute left-4 right-0 top-1/2 h-24 -translate-y-1/2 smong-thread opacity-75" />
          <div className="pointer-events-none absolute left-[6%] top-[12%] h-64 w-[82%] smong-river bg-purple-900/8" />
          <div className="pointer-events-none absolute bottom-[6%] right-[2%] h-56 w-[70%] smong-veil bg-mint-100/52" />

          <div className="absolute left-[2%] top-[26%] max-w-[230px] smong-slab border border-purple-700/10 bg-white/76 p-4 shadow-[0_20px_54px_rgba(47,23,110,0.1)] backdrop-blur sm:left-[8%] sm:p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-purple-900 text-white">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="font-heading text-2xl font-black text-ink-900">{activeChapter.shortLabel}</p>
            <p className="mt-1 text-sm font-bold text-ink-400">Bab aktif</p>
          </div>

          <div className="absolute right-[1%] top-[12%] w-32 smong-slab-soft border border-purple-700/10 bg-white/70 p-3 text-center shadow-sm backdrop-blur sm:right-[8%] sm:top-[18%] sm:w-40 sm:p-4">
            <CheckCircle2 className="mx-auto h-7 w-7 text-teal-700" />
            <p className="mt-2 font-heading text-2xl font-black text-ink-900">{percent}%</p>
            <p className="text-xs font-bold text-ink-400">Progress</p>
          </div>

          <div className="absolute bottom-[6%] left-[34%] w-44 smong-slab-soft border border-purple-700/10 bg-white/66 p-3 shadow-sm backdrop-blur sm:bottom-[14%] sm:left-[40%] sm:w-52 sm:p-4">
            <Route className="mb-3 h-6 w-6 text-purple-700" />
            <div className="h-2 overflow-hidden rounded-full bg-lavender-100">
              <div className="h-full rounded-full bg-purple-900" style={{ width: `${Math.max(percent, 8)}%` }} />
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-ink-700">Buka checkpoint lewat pre-test, misi, dan post-test.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
