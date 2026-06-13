import type { Metadata } from "next";
import { BoardGamePage } from "@/features/board-game/components/BoardGamePage";

export const metadata: Metadata = {
  title: "Board Game | Smong",
  description: "Mainkan board game kesiapsiagaan Smong dengan kartu mitigasi dan event bencana.",
};

export default function SiswaBoardGamePage() {
  return <BoardGamePage />;
}
