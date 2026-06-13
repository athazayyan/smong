import { boardGameTiles } from "../data/boardTiles";
import { boardGameEventCards } from "../data/eventCards";
import { boardGameTriviaCards } from "../data/triviaCards";
import {
  canReceiveCard,
  countCardCopies,
  getMitigationCard,
  playerHasCard,
  playerHasFullProtection,
} from "./cardRules";
import { createInitialBoardGameState, createStartedBoardGameState } from "./gameSetup";
import { didPassStart, getNextBoardPosition, getStepsTowardEscapeBuilding, isAtEscapeBuilding } from "./movement";
import { createWinnerSummary } from "./scoring";
import type {
  BoardGameAction,
  BoardGameEventCard,
  BoardGamePlayer,
  BoardGameState,
  BoardGameTile,
  BoardGameTriviaCard,
  MitigationCardId,
} from "../types";

type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export function boardGameReducer(state: BoardGameState, action: BoardGameAction): BoardGameState {
  if (action.type === "start-game") {
    return createStartedBoardGameState(action.playerCount, action.mode);
  }

  if (action.type === "restart-game") {
    return createInitialBoardGameState();
  }

  if (action.type === "roll-dice") {
    return rollDice(state, action.value);
  }

  if (action.type === "buy-card") {
    return buyCard(state, action.playerId, action.cardId);
  }

  if (action.type === "answer-trivia") {
    return answerTrivia(state, action.playerId, action.triviaCardId, action.selectedOptionId);
  }

  if (action.type === "resolve-mission") {
    return resolveMission(state, action.playerId, action.value);
  }

  if (action.type === "use-escape-route-help") {
    return applyEscapeRouteHelp(state, action.helperPlayerId, action.targetPlayerId);
  }

  if (action.type === "continue-event") {
    return continueEvent(state);
  }

  if (action.type === "advance-turn") {
    return advanceTurnAfterAction(state);
  }

  return state;
}

function rollDice(state: BoardGameState, value: DiceValue): BoardGameState {
  if (state.phase !== "player-turn" && state.phase !== "event-active") return state;

  const player = state.players[state.currentPlayerIndex];
  if (!player || player.status !== "aktif") {
    return advanceTurnWithoutEventTick({
      ...state,
      lastDiceValue: value,
      actionLog: addLog(state, "system", "Giliran dilewati", "Pemain ini tidak sedang aktif."),
    });
  }

  if (player.skipTurns > 0) {
    const players = state.players.map((item) =>
      item.id === player.id ? { ...item, skipTurns: item.skipTurns - 1 } : item
    );
    return endTurn({
      ...state,
      players,
      lastDiceValue: value,
      actionLog: addLog(
        state,
        player.id,
        "Drop Cover",
        `${player.displayName} menahan posisi aman satu giliran.`,
      ),
    });
  }

  const movedState = movePlayerBySteps(state, player.id, value, `${player.displayName} bergerak ${value} langkah.`);
  const movedPlayer = getPlayerById(movedState.players, player.id);
  const tile = getTileByPosition(movedPlayer.position);

  return resolveLandingTile({
    ...movedState,
    lastDiceValue: value,
  }, movedPlayer, tile);
}

function resolveLandingTile(state: BoardGameState, player: BoardGamePlayer, tile: BoardGameTile): BoardGameState {
  if (tile.type === "safe-zone") {
    const players = state.players.map((item) =>
      item.id === player.id && state.activeEvent
        ? { ...item, status: "selamat", isProtectedThisEvent: true, reachedSafeZoneAtTurn: state.turnNumber }
        : item
    );
    return endTurn({
      ...state,
      players,
      phase: state.activeEvent ? "event-active" : "player-turn",
      actionLog: addLog(state, player.id, "Zona aman", `${player.displayName} mencapai Escape Building.`),
    });
  }

  if (tile.type === "event" && !state.activeEvent) {
    return startEventFromTile(state, player);
  }

  if (tile.type === "trivia") {
    const triviaCard = drawTriviaCard(state.triviaDeck);
    const triviaDeck = removeTriviaCardFromDeck(state.triviaDeck, triviaCard.id);
    return {
      ...state,
      triviaDeck,
      phase: "trivia",
      panel: {
        type: "trivia",
        playerId: player.id,
        triviaCard,
      },
      actionLog: addLog(state, player.id, "Trivia", `${player.displayName} mendapat pertanyaan kesiapsiagaan.`),
    };
  }

  if (tile.type === "market") {
    return {
      ...state,
      phase: "market",
      panel: {
        type: "market",
        playerId: player.id,
      },
      actionLog: addLog(state, player.id, "Market", `${player.displayName} membuka toko kartu mitigasi.`),
    };
  }

  if (tile.type === "mission") {
    return {
      ...state,
      phase: "mission",
      panel: {
        type: "mission",
        playerId: player.id,
      },
      actionLog: addLog(state, player.id, "Misi komunitas", `${player.displayName} mencoba misi bantuan warga.`),
    };
  }

  if (tile.type === "free-mitigation" && tile.mitigationCardId) {
    const card = getMitigationCard(tile.mitigationCardId);
    const canAdd = canReceiveCard(player, card);
    const players = state.players.map((item) => {
      if (item.id !== player.id) return item;
      if (canAdd) return { ...item, cardIds: [...item.cardIds, card.id] };
      return { ...item, coins: item.coins + 1 };
    });
    return endTurn({
      ...state,
      players,
      actionLog: addLog(
        state,
        player.id,
        canAdd ? "Kartu mitigasi" : "Bonus Koin",
        canAdd
          ? `${player.displayName} mendapat kartu ${card.name}.`
          : `${player.displayName} sudah mencapai batas kartu ${card.name} dan mendapat 1 Koin.`,
      ),
    });
  }

  if (tile.type === "special-story") {
    const players = state.players.map((item) =>
      item.id === player.id ? { ...item, coins: item.coins + 1 } : item
    );
    return {
      ...state,
      players,
      phase: "story",
      panel: {
        type: "story",
        playerId: player.id,
        title: "Cerita Smong Simeulue",
        body: "Smong adalah kearifan lokal Simeulue yang mengingatkan warga untuk bergerak ke tempat tinggi setelah tanda tsunami muncul.",
      },
      actionLog: addLog(state, player.id, "Cerita Smong", `${player.displayName} mendapat 1 Koin dari cerita lokal.`),
    };
  }

  return endTurn({
    ...state,
    actionLog: addLog(state, player.id, tile.name, `${player.displayName} berhenti sejenak dan menyiapkan strategi.`),
  });
}

function startEventFromTile(state: BoardGameState, player: BoardGamePlayer): BoardGameState {
  const eventCard = drawEventCard(state.eventDeck, state.mode);
  const eventDeck = removeEventCardFromDeck(state.eventDeck, eventCard.id);
  const preparedPlayers = applyEventStartRules(state.players, eventCard, state.turnNumber);
  const countdown = createEventCountdown(preparedPlayers, eventCard);

  return {
    ...state,
    players: preparedPlayers,
    activeEvent: eventCard,
    eventCountdown: countdown,
    eventDeck,
    phase: "event-reveal",
    panel: {
      type: "event",
      eventCard,
      triggeredByPlayerId: player.id,
    },
    actionLog: addLog(state, player.id, "Event bencana", `${player.displayName} membuka ${eventCard.title}.`),
  };
}

function buyCard(state: BoardGameState, playerId: string, cardId: MitigationCardId): BoardGameState {
  if (state.panel.type !== "market" || state.panel.playerId !== playerId) return state;

  const card = getMitigationCard(cardId);
  const player = getPlayerById(state.players, playerId);
  if (player.coins < card.price || !canReceiveCard(player, card)) return state;

  const players = state.players.map((item) =>
    item.id === playerId
      ? {
          ...item,
          coins: item.coins - card.price,
          cardIds: [...item.cardIds, card.id],
        }
      : item
  );

  return {
    ...state,
    players,
    actionLog: addLog(state, playerId, "Beli kartu", `${player.displayName} membeli ${card.name}.`),
  };
}

function answerTrivia(
  state: BoardGameState,
  playerId: string,
  triviaCardId: string,
  selectedOptionId: string,
): BoardGameState {
  if (state.panel.type !== "trivia" || state.panel.playerId !== playerId) return state;
  if (state.panel.triviaCard.id !== triviaCardId) return state;
  if (state.panel.selectedOptionId) return state;

  const triviaCard = state.panel.triviaCard;
  const isCorrect = selectedOptionId === triviaCard.correctOptionId;
  const reward = isCorrect ? triviaCard.rewardCorrectCoins : triviaCard.rewardWrongCoins;
  const player = getPlayerById(state.players, playerId);
  const players = state.players.map((item) =>
    item.id === playerId ? { ...item, coins: item.coins + reward } : item
  );

  return {
    ...state,
    players,
    panel: {
      ...state.panel,
      selectedOptionId,
      isCorrect,
    },
    actionLog: addLog(
      state,
      playerId,
      isCorrect ? "Trivia benar" : "Trivia dicoba",
      `${player.displayName} mendapat ${reward} Koin.`,
    ),
  };
}

function resolveMission(state: BoardGameState, playerId: string, value: DiceValue): BoardGameState {
  if (state.panel.type !== "mission" || state.panel.playerId !== playerId) return state;
  if (state.panel.missionRoll) return state;

  const player = getPlayerById(state.players, playerId);
  if (value < 4) {
    return {
      ...state,
      panel: {
        type: "mission",
        playerId,
        missionRoll: value,
        didMove: false,
      },
      actionLog: addLog(state, playerId, "Misi selesai", `${player.displayName} tetap di posisi dan mendapat arahan baru.`),
    };
  }

  const movedState = movePlayerBySteps(state, playerId, value, `${player.displayName} menyelesaikan misi dan maju ${value} langkah.`);
  const movedPlayer = getPlayerById(movedState.players, playerId);
  const tile = getTileByPosition(movedPlayer.position);

  return resolveLandingTile({
    ...movedState,
    panel: {
      type: "mission",
      playerId,
      missionRoll: value,
      didMove: true,
    },
  }, movedPlayer, tile);
}

function applyEscapeRouteHelp(
  state: BoardGameState,
  helperPlayerId: string,
  targetPlayerId: string,
): BoardGameState {
  if (!state.activeEvent) return state;

  const helper = getPlayerById(state.players, helperPlayerId);
  const target = getPlayerById(state.players, targetPlayerId);
  if (!playerHasCard(helper, "escape-route") || helper.escapeRouteUsedInEvent || target.status !== "aktif") return state;

  const steps = getStepsTowardEscapeBuilding(target.position, 3);
  if (steps === 0) return state;

  const players = state.players.map((player) => {
    if (player.id === helperPlayerId) return { ...player, escapeRouteUsedInEvent: true };
    if (player.id === targetPlayerId) {
      const nextPosition = getNextBoardPosition(player.position, steps);
      return {
        ...player,
        position: nextPosition,
        status: isAtEscapeBuilding(nextPosition) ? "selamat" : player.status,
        reachedSafeZoneAtTurn: isAtEscapeBuilding(nextPosition) ? state.turnNumber : player.reachedSafeZoneAtTurn,
      };
    }
    return player;
  });

  return {
    ...state,
    players,
    actionLog: addLog(state, helperPlayerId, "Escape Route", `${helper.displayName} membantu ${target.displayName} bergerak menuju zona aman.`),
  };
}

function continueEvent(state: BoardGameState): BoardGameState {
  if (!state.activeEvent || state.phase !== "event-reveal") return state;
  if (areAllPlayersResolved(state.players)) {
    return finalizeEvent(state, state.players, state.activeEvent);
  }
  return advanceTurnWithoutEventTick({
    ...state,
    phase: "event-active",
    panel: { type: "none" },
  });
}

function advanceTurnAfterAction(state: BoardGameState): BoardGameState {
  if (state.panel.type === "event") return continueEvent(state);
  return endTurn({
    ...state,
    panel: { type: "none" },
    phase: state.activeEvent ? "event-active" : "player-turn",
  });
}

function endTurn(state: BoardGameState): BoardGameState {
  if (!state.activeEvent) return advanceTurnWithoutEventTick({ ...state, phase: "player-turn", panel: { type: "none" } });

  if (areAllPlayersResolved(state.players)) {
    return finalizeEvent(state, state.players, state.activeEvent);
  }

  const nextCountdown = state.eventCountdown - 1;
  if (nextCountdown <= 0) {
    const players = state.players.map((player) => {
      if (player.status !== "aktif") return player;
      if (isAtEscapeBuilding(player.position) || player.isProtectedThisEvent) {
        return { ...player, status: "selamat", reachedSafeZoneAtTurn: state.turnNumber };
      }
      return { ...player, status: "tersingkir" };
    });
    return finalizeEvent({ ...state, eventCountdown: 0 }, players, state.activeEvent);
  }

  return advanceTurnWithoutEventTick({
    ...state,
    eventCountdown: nextCountdown,
    phase: "event-active",
    panel: { type: "none" },
  });
}

function finalizeEvent(
  state: BoardGameState,
  players: BoardGamePlayer[],
  activeEvent: BoardGameEventCard,
): BoardGameState {
  const resolvedPlayers = players.map((player) => {
    if (player.status !== "aktif") return player;
    if (isAtEscapeBuilding(player.position) || player.isProtectedThisEvent) {
      return { ...player, status: "selamat", reachedSafeZoneAtTurn: state.turnNumber };
    }
    return { ...player, status: "tersingkir" };
  });

  return {
    ...state,
    players: resolvedPlayers,
    activeEvent: undefined,
    eventCountdown: 0,
    eventHistory: [...state.eventHistory, activeEvent],
    phase: "final-recap",
    panel: { type: "none" },
    winnerSummary: createWinnerSummary(activeEvent.id, resolvedPlayers),
    actionLog: addLog(state, "system", "Event selesai", "Lihat recap untuk membahas pilihan aman."),
  };
}

function advanceTurnWithoutEventTick(state: BoardGameState): BoardGameState {
  const nextPlayerIndex = getNextActivePlayerIndex(state.players, state.currentPlayerIndex);
  return {
    ...state,
    currentPlayerIndex: nextPlayerIndex,
    turnNumber: state.turnNumber + 1,
  };
}

function movePlayerBySteps(
  state: BoardGameState,
  playerId: string,
  steps: number,
  detail: string,
): BoardGameState {
  const player = getPlayerById(state.players, playerId);
  const nextPosition = getNextBoardPosition(player.position, steps);
  const passedStart = didPassStart(player.position, steps);
  const players = state.players.map((item) => {
    if (item.id !== playerId) return item;
    return {
      ...item,
      position: nextPosition,
      coins: item.coins + (passedStart ? 2 : 0),
      status: state.activeEvent && isAtEscapeBuilding(nextPosition) ? "selamat" : item.status,
      reachedSafeZoneAtTurn: state.activeEvent && isAtEscapeBuilding(nextPosition) ? state.turnNumber : item.reachedSafeZoneAtTurn,
    };
  });

  return {
    ...state,
    players,
    actionLog: addLog(
      state,
      playerId,
      "Bergerak",
      passedStart ? `${detail} Melewati START dan mendapat 2 Koin.` : detail,
    ),
  };
}

function applyEventStartRules(
  players: BoardGamePlayer[],
  eventCard: BoardGameEventCard,
  turnNumber: number,
): BoardGamePlayer[] {
  const afterEarlyWarning = players.map((player) => {
    if (
      player.status !== "aktif" ||
      !playerHasCard(player, "early-warning") ||
      (eventCard.disasterId !== "tsunami" && eventCard.disasterId !== "gempa-bumi")
    ) {
      return player;
    }

    const steps = getStepsTowardEscapeBuilding(player.position, 2);
    const nextPosition = getNextBoardPosition(player.position, steps);
    return {
      ...player,
      position: nextPosition,
      status: isAtEscapeBuilding(nextPosition) ? "selamat" : player.status,
      reachedSafeZoneAtTurn: isAtEscapeBuilding(nextPosition) ? turnNumber : player.reachedSafeZoneAtTurn,
    };
  });

  const afterProtection = afterEarlyWarning.map((player) => {
    if (player.status !== "aktif") return player;
    if (playerHasFullProtection(player, eventCard)) {
      return {
        ...player,
        status: "selamat",
        isProtectedThisEvent: true,
        reachedSafeZoneAtTurn: turnNumber,
      };
    }
    if (isAtEscapeBuilding(player.position)) {
      return {
        ...player,
        status: "selamat",
        reachedSafeZoneAtTurn: turnNumber,
      };
    }
    return player;
  });

  const afterGempa = eventCard.disasterId === "gempa-bumi"
    ? afterProtection.map((player) => {
        if (player.status !== "aktif" || playerHasCard(player, "helm-darurat")) return player;
        return { ...player, skipTurns: player.skipTurns + 1 };
      })
    : afterProtection;

  return applySpecialEventEffect(afterGempa, eventCard);
}

function applySpecialEventEffect(players: BoardGamePlayer[], eventCard: BoardGameEventCard): BoardGamePlayer[] {
  if (eventCard.specialEffect === "none") return players;

  if (eventCard.specialEffect === "move-unprotected-back") {
    return players.map((player) => {
      if (player.status !== "aktif" || playerHasCard(player, "pohon-penahan-angin")) return player;
      return { ...player, position: getPreviousBoardPosition(player.position, 2) };
    });
  }

  if (eventCard.specialEffect === "skip-unprotected-turn") {
    return players.map((player) => {
      if (player.status !== "aktif" || playerHasCard(player, "pohon-penahan-angin")) return player;
      return { ...player, skipTurns: player.skipTurns + 1 };
    });
  }

  if (eventCard.specialEffect === "damage-one-card") {
    return players.map((player) => {
      if (player.status !== "aktif" || playerHasCard(player, "pohon-penahan-angin")) return player;
      return { ...player, cardIds: removeOneDamageableCard(player.cardIds) };
    });
  }

  if (eventCard.specialEffect === "damage-all-non-wind-cards") {
    return players.map((player) => {
      if (player.status !== "aktif" || playerHasCard(player, "pohon-penahan-angin")) return player;
      return { ...player, cardIds: player.cardIds.filter((cardId) => cardId === "pohon-penahan-angin") };
    });
  }

  return players;
}

function createEventCountdown(players: BoardGamePlayer[], eventCard: BoardGameEventCard) {
  const hasDrainageBonus = eventCard.disasterId === "banjir" && players.some((player) => playerHasCard(player, "drainase-bersih"));
  const hasDoubleMangroveBonus = (
    eventCard.disasterId === "banjir" ||
    eventCard.disasterId === "tsunami"
  ) && players.some((player) => countCardCopies(player, "mangrove") >= 2);

  return eventCard.giliranEvakuasi + (hasDrainageBonus ? 1 : 0) + (hasDoubleMangroveBonus ? 1 : 0);
}

function drawEventCard(deck: BoardGameEventCard[], mode: BoardGameState["mode"]) {
  const firstCard = deck[0];
  if (firstCard) return firstCard;
  const fallback = mode === "random"
    ? boardGameEventCards[0]
    : boardGameEventCards.find((card) => card.disasterId === mode);
  if (!fallback) throw new Error("Event deck is empty.");
  return fallback;
}

function drawTriviaCard(deck: BoardGameTriviaCard[]) {
  const firstCard = deck[0];
  if (firstCard) return firstCard;
  const fallback = boardGameTriviaCards[0];
  if (!fallback) throw new Error("Trivia deck is empty.");
  return fallback;
}

function removeEventCardFromDeck(deck: BoardGameEventCard[], eventCardId: string) {
  return deck.filter((card) => card.id !== eventCardId);
}

function removeTriviaCardFromDeck(deck: BoardGameTriviaCard[], triviaCardId: string) {
  return deck.filter((card) => card.id !== triviaCardId);
}

function getPlayerById(players: BoardGamePlayer[], playerId: string) {
  const player = players.find((item) => item.id === playerId);
  if (!player) throw new Error(`Missing player: ${playerId}`);
  return player;
}

function getTileByPosition(position: number) {
  const tile = boardGameTiles.find((item) => item.position === position);
  if (!tile) throw new Error(`Missing tile at position: ${position}`);
  return tile;
}

function getNextActivePlayerIndex(players: BoardGamePlayer[], currentPlayerIndex: number) {
  for (let offset = 1; offset <= players.length; offset += 1) {
    const candidateIndex = (currentPlayerIndex + offset) % players.length;
    const candidate = players[candidateIndex];
    if (candidate?.status === "aktif") return candidateIndex;
  }
  return currentPlayerIndex;
}

function areAllPlayersResolved(players: BoardGamePlayer[]) {
  return players.every((player) => player.status !== "aktif");
}

function getPreviousBoardPosition(position: number, steps: number) {
  return ((position - 1 - steps + 40) % 40) + 1;
}

function removeOneDamageableCard(cardIds: MitigationCardId[]) {
  const damageIndex = cardIds.findIndex((cardId) => cardId !== "pohon-penahan-angin");
  if (damageIndex < 0) return cardIds;
  return cardIds.filter((cardId, index) => index !== damageIndex);
}

function addLog(
  state: BoardGameState,
  playerId: string,
  label: string,
  detail: string,
) {
  const labelKey = createLogKeyPart(label);
  const detailKey = createLogKeyPart(detail).slice(0, 48);
  const matchingPreviousItems = state.actionLog.filter(
    (item) => item.turnNumber === state.turnNumber && item.playerId === playerId && item.label === label && item.detail === detail,
  ).length;

  return [
    {
      id: `log-${state.turnNumber}-${state.actionLog.length + 1}-${matchingPreviousItems + 1}-${playerId}-${labelKey}-${detailKey}`,
      turnNumber: state.turnNumber,
      playerId,
      label,
      detail,
    },
    ...state.actionLog,
  ].slice(0, 8);
}

function createLogKeyPart(value: string) {
  const fallback = "item";
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : fallback;
}
