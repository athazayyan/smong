import { mitigationCards } from "../data/mitigationCards";
import type {
  BoardGameDisasterId,
  BoardGameEventCard,
  BoardGamePlayer,
  MitigationCard,
  MitigationCardId,
} from "../types";

export function getMitigationCard(cardId: MitigationCardId) {
  const card = mitigationCards.find((item) => item.id === cardId);
  if (!card) {
    throw new Error(`Missing mitigation card: ${cardId}`);
  }
  return card;
}

export function countCardCopies(player: BoardGamePlayer, cardId: MitigationCardId) {
  return player.cardIds.filter((item) => item === cardId).length;
}

export function canReceiveCard(player: BoardGamePlayer, card: MitigationCard) {
  return countCardCopies(player, card.id) < card.maxCopies;
}

export function playerHasCard(player: BoardGamePlayer, cardId: MitigationCardId) {
  return player.cardIds.includes(cardId);
}

export function playerHasFullProtection(player: BoardGamePlayer, eventCard: BoardGameEventCard) {
  return eventCard.protectionCardIds.some((cardId) => playerHasCard(player, cardId));
}

export function getProtectedDisasterLabels(card: MitigationCard) {
  return card.protects.map(getDisasterLabel).join(", ");
}

export function getDisasterLabel(disasterId: BoardGameDisasterId) {
  if (disasterId === "tsunami") return "Tsunami";
  if (disasterId === "gempa-bumi") return "Gempa Bumi";
  if (disasterId === "banjir") return "Banjir";
  return "Cuaca Ekstrem";
}
