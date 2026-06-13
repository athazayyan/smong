import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowRight, Gamepad2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Games | Smong",
  description: "Pilih game Smong untuk melatih kesiapsiagaan secara interaktif.",
};

export default function SiswaGamesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream-50 px-4 pb-16 pt-6 text-ink-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(91,59,181,0.14),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(34,185,154,0.12),transparent_28%),linear-gradient(180deg,rgba(255,248,240,0),rgba(251,239,227,0.82))]" />
      <section className="relative z-10 mx-auto max-w-7xl">
        <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-7">
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex min-h-9 items-center gap-2 rounded-full bg-lavender-100 px-4 text-sm font-black text-purple-700">
                <Gamepad2 className="h-4 w-4" />
                Games Smong
              </p>
              <h1 className="font-heading text-5xl font-black leading-[0.95] text-purple-900 sm:text-6xl lg:text-7xl">
                Pilih Misi Game Kesiapsiagaan
              </h1>
              <p className="max-w-2xl text-base font-semibold leading-8 text-ink-700 sm:text-lg">
                Board Game dan Motion Game adalah dua pengalaman berbeda. Pilih game yang sesuai dengan sesi belajarmu hari ini.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <GameCard
                href="/siswa/games/board"
                icon="board"
                title="Board Game"
                body="Main pass-and-play dengan 40 petak, Koin, kartu mitigasi, trivia, dan event bencana."
                cta="Main Board Game"
              />
              <GameCard
                href="/siswa/motion-game"
                icon="motion"
                title="Motion Game"
                body="Ikuti instruksi gerakan mitigasi lewat kamera dan pelajari respons aman secara aktif."
                cta="Buka Motion Game"
              />
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/80 bg-white/78 p-6 shadow-[0_24px_70px_rgba(47,23,110,0.14)] backdrop-blur-xl">
            <div className="relative mx-auto mb-5 h-40 w-40 overflow-hidden rounded-[2rem] bg-lavender-100">
              <Image
                src="/assets/mascot/mascot-smong.png"
                alt="Mascot Smong"
                width={160}
                height={160}
                sizes="160px"
                className="h-full w-full object-contain p-3"
                priority
              />
            </div>
            <p className="font-heading text-2xl font-black text-purple-900">Dua mode, satu tujuan</p>
            <p className="mt-2 text-sm font-semibold leading-7 text-ink-700">
              Board Game melatih strategi dan keputusan. Motion Game melatih gerakan respons aman. Keduanya tetap frontend-first dan tidak memakai backend.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function GameCard({
  href,
  icon,
  title,
  body,
  cta,
}: {
  href: string;
  icon: "board" | "motion";
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_18px_54px_rgba(47,23,110,0.1)] transition hover:-translate-y-1 hover:bg-white"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-700 text-white shadow-[0_6px_0_#2F176E]">
        {icon === "board" ? <ShieldCheck className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
      </span>
      <h2 className="mt-5 font-heading text-3xl font-black text-purple-900">{title}</h2>
      <p className="mt-2 min-h-20 text-sm font-semibold leading-7 text-ink-700">{body}</p>
      <span className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-lavender-100 px-4 text-sm font-black text-purple-700 group-hover:bg-purple-700 group-hover:text-white">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
