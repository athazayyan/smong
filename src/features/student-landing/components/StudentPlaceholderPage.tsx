import Link from "next/link";
import React from "react";
import {
  ArrowRight,
  Award,
  Camera,
  KeyRound,
  ListChecks,
  User,
} from "lucide-react";

type StudentPlaceholderIconName = "ListChecks" | "Award" | "Camera" | "KeyRound" | "User";

interface StudentPlaceholderPageProps {
  eyebrow: string;
  title: string;
  body: string;
  iconName: StudentPlaceholderIconName;
  primaryHref: string;
  primaryLabel: string;
  children?: React.ReactNode;
}

export function StudentPlaceholderPage({
  eyebrow,
  title,
  body,
  iconName,
  primaryHref,
  primaryLabel,
  children,
}: StudentPlaceholderPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream-50 px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20 smong-quiet-field" />
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[420px] w-[86vw] max-w-5xl -translate-x-1/2 smong-veil bg-white/42" />

      <section className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-purple-700/8 bg-white/64 p-7 shadow-[0_28px_80px_rgba(47,23,110,0.08)] md:p-10">
          <div className="pointer-events-none absolute -right-16 top-10 h-56 w-[48%] smong-river bg-lavender-100/42" />
          <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-[54%] smong-veil bg-mint-100/34" />

          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_280px] md:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-lavender-100/76 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
                {renderPlaceholderIcon(iconName, "h-4 w-4")}
                {eyebrow}
              </p>
              <h1 className="max-w-3xl font-heading text-4xl font-black leading-tight text-ink-900 md:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-ink-700 md:text-lg">
                {body}
              </p>
              <Link
                href={primaryHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-purple-900 px-7 py-4 font-heading text-base font-extrabold text-white shadow-[0_8px_0_#20104f] transition hover:-translate-y-0.5 hover:bg-purple-700 active:translate-y-1 active:shadow-[0_3px_0_#20104f]"
              >
                {primaryLabel}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-[2.2rem] border border-white/80 bg-linear-to-br from-white via-lavender-100/58 to-mint-100/58 shadow-[0_22px_55px_rgba(47,23,110,0.1)]">
              <div className="absolute inset-x-8 top-1/2 h-8 -translate-y-1/2 smong-thread opacity-60" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-purple-900 text-white shadow-[0_10px_0_#20104f]">
                {renderPlaceholderIcon(iconName, "h-14 w-14")}
              </div>
            </div>
          </div>
        </div>

        {children ? <div className="mt-10">{children}</div> : null}
      </section>
    </main>
  );
}

function renderPlaceholderIcon(iconName: StudentPlaceholderIconName, className: string) {
  if (iconName === "Award") return <Award className={className} />;
  if (iconName === "Camera") return <Camera className={className} />;
  if (iconName === "KeyRound") return <KeyRound className={className} />;
  if (iconName === "User") return <User className={className} />;
  return <ListChecks className={className} />;
}
