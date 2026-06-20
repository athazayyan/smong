import type { Metadata } from "next";
import { MitigaSeeArPage } from "@/features/mitigasee/components/MitigaSeeArPage";

export const metadata: Metadata = {
  title: "MitigaSee AR — Temukan Titik Kumpul | MitigaKids",
  description:
    "Temukan titik kumpul dan jalur evakuasi terdekat menggunakan augmented reality berbasis lokasi. Fitur MitigaSee dari platform MitigaKids untuk siswa SD–SMA.",
};

// Halaman ini menggunakan GPS dan kamera — selalu render secara dinamis
export const dynamic = "force-dynamic";

export default function MitigaSeeArRoute() {
  return <MitigaSeeArPage />;
}
