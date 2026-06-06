import { ChapterMap } from "@/features/student-learning/components/ChapterMap";
import { LockedModuleIslands } from "@/features/student-learning/components/LockedModuleIslands";
import { ModuleWorldHero } from "@/features/student-learning/components/ModuleWorldHero";
import { ProgressRail } from "@/features/student-learning/components/ProgressRail";
import { gempaChapters, moduleGroups } from "@/features/student-learning/data/mockData";
import { mockStudentProgress } from "@/features/student-learning/data/mockProgress";

const TOTAL_GEMPA_LESSONS = 18;

const activeModule = moduleGroups.find((moduleGroup) => moduleGroup.id === "gempa-bumi") ?? moduleGroups[0];
const comingSoonModules = moduleGroups.filter((moduleGroup) => moduleGroup.availability === "coming-soon");

export default function ModulPage() {
  return (
    <main className="overflow-hidden bg-cream-50 pb-20">
      <ModuleWorldHero
        title={activeModule.title}
        description={activeModule.description}
        chapters={gempaChapters}
        progress={mockStudentProgress}
      />

      <section className="relative mx-auto -mt-2 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className="min-w-0">
          <ChapterMap chapters={gempaChapters} progress={mockStudentProgress} />
          <LockedModuleIslands modules={comingSoonModules} />
        </div>

        <div className="w-full lg:sticky lg:top-28 lg:self-start">
          <ProgressRail progress={mockStudentProgress} totalLessons={TOTAL_GEMPA_LESSONS} />
        </div>
      </section>
    </main>
  );
}
