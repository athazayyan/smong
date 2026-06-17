import { boardGameEventCards } from "../data/eventCards";
import { boardGameMockPlayers } from "../data/mockPlayers";
import { boardGameTriviaCards } from "../data/triviaCards";
import type {
  BoardGameEventCard,
  BoardGameMode,
  BoardGamePlayer,
  BoardGameState,
  BoardGameTriviaCard,
} from "../types";

type PlayerCount = 2 | 3 | 4 | 5 | 6;

export function createInitialBoardGameState(): BoardGameState {
  return {
    phase: "setup",
    players: boardGameMockPlayers.slice(0, 2).map(resetPlayer),
    currentPlayerIndex: 0,
    turnNumber: 1,
    mode: "random",
    eventCountdown: 0,
    eventHistory: [],
    eventDeck: createEventDeck("random"),
    triviaDeck: createTriviaDeck(),
    actionLog: [],
    panel: { type: "none" },
    allPlayersCompletedFirstLap: false,
  };
}

export function createStartedBoardGameState(
  playerCount: PlayerCount,
  mode: BoardGameMode,
  playerNames?: string[]
): BoardGameState {
  return {
    phase: "player-turn",
    players: boardGameMockPlayers.slice(0, playerCount).map((player, idx) => {
      const customName = playerNames?.[idx]?.trim();
      return resetPlayer({
        ...player,
        displayName: customName || player.displayName,
      });
    }),
    currentPlayerIndex: 0,
    turnNumber: 1,
    mode,
    eventCountdown: 0,
    eventHistory: [],
    eventDeck: createEventDeck(mode),
    triviaDeck: createTriviaDeck(),
    actionLog: [
      {
        id: "log-start",
        turnNumber: 1,
        playerId: "system",
        label: "Game dimulai",
        detail: "Kumpulkan Koin dan kartu. Bencana aktif setelah semua pemain satu putaran!",
      },
    ],
    panel: { type: "none" },
    allPlayersCompletedFirstLap: false,
  };
}

export function createEventDeck(mode: BoardGameMode) {
  const filtered = mode === "random"
    ? boardGameEventCards
    : boardGameEventCards.filter((card) => card.disasterId === mode);
  return shuffleEventCards(filtered);
}

export function createTriviaDeck() {
  return shuffleTriviaCards(boardGameTriviaCards);
}

function resetPlayer(player: BoardGamePlayer): BoardGamePlayer {
  return {
    ...player,
    position: 1,
    coins: 5,
    cardIds: [],
    status: "aktif",
    skipTurns: 0,
    isProtectedThisEvent: false,
    reachedSafeZoneAtTurn: undefined,
    escapeRouteUsedInEvent: false,
    lapsCompleted: 0,
  };
}

function shuffleEventCards(cards: BoardGameEventCard[]) {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    const swapped = result[swapIndex];
    result[index] = swapped;
    result[swapIndex] = current;
  }
  return result;
}

function shuffleTriviaCards(cards: BoardGameTriviaCard[]) {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    const swapped = result[swapIndex];
    result[index] = swapped;
    result[swapIndex] = current;
  }
  return result;
}
