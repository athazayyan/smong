import { mitigationCards } from "../data/mitigationCards";
import type { BoardGamePlayer, BoardGameWinnerSummary, MitigationCardId } from "../types";

export function sortPlayersForLeaderboard(players: BoardGamePlayer[]) {
  return [...players].sort((first, second) => {
    const firstStatusScore = getStatusScore(first);
    const secondStatusScore = getStatusScore(second);
    if (firstStatusScore !== secondStatusScore) return secondStatusScore - firstStatusScore;

    const firstSafeTurn = first.reachedSafeZoneAtTurn ?? 999;
    const secondSafeTurn = second.reachedSafeZoneAtTurn ?? 999;
    if (firstSafeTurn !== secondSafeTurn) return firstSafeTurn - secondSafeTurn;

    if (first.coins !== second.coins) return second.coins - first.coins;
    if (first.cardIds.length !== second.cardIds.length) return second.cardIds.length - first.cardIds.length;

    return first.displayName.localeCompare(second.displayName);
  });
}

export function createBestCardIds(players: BoardGamePlayer[]) {
  const ownedCards = mitigationCards
    .filter((card) => players.some((player) => player.cardIds.includes(card.id)))
    .map((card) => card.id);

  return ownedCards.slice(0, 3) satisfies MitigationCardId[];
}

export function createWinnerSummary(
  eventCardId: string,
  players: BoardGamePlayer[],
): BoardGameWinnerSummary {
  return {
    id: `summary-${eventCardId}`,
    eventCardId,
    safePlayerIds: players.filter((player) => player.status === "selamat").map((player) => player.id),
    eliminatedPlayerIds: players.filter((player) => player.status === "tersingkir").map((player) => player.id),
    bestCardIds: createBestCardIds(players),
    discussionPrompt: "Apa satu tindakan aman yang bisa kita latih di sekolah minggu ini?",
  };
}

function getStatusScore(player: BoardGamePlayer) {
  if (player.status === "selamat") return 2;
  if (player.status === "aktif") return 1;
  return 0;
}
