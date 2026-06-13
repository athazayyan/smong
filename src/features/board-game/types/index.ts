export type BoardGameDisasterId =
  | "tsunami"
  | "gempa-bumi"
  | "banjir"
  | "cuaca-ekstrem";

export type BoardGameMode = BoardGameDisasterId | "random";

export type BoardGameTileType =
  | "start"
  | "safe-zone"
  | "event"
  | "trivia"
  | "market"
  | "mission"
  | "free-mitigation"
  | "special-story"
  | "normal";

export type BoardGameZone =
  | "pesisir"
  | "sungai-kota"
  | "gunung-hutan"
  | "desa-kearifan";

export type BoardGamePlayerStatus = "aktif" | "selamat" | "tersingkir";

export type BoardGamePhase =
  | "setup"
  | "player-turn"
  | "moving-token"
  | "market"
  | "trivia"
  | "event-reveal"
  | "event-active"
  | "mission"
  | "story"
  | "final-recap";

export type BoardGameTileIconName =
  | "Flag"
  | "ShieldCheck"
  | "TriangleAlert"
  | "CircleHelp"
  | "Store"
  | "HeartHandshake"
  | "ShieldPlus"
  | "Waves"
  | "MapPin";

export type BoardGameTile = {
  id: string;
  position: number;
  name: string;
  type: BoardGameTileType;
  zone: BoardGameZone;
  description: string;
  mitigationCardId?: MitigationCardId;
  iconName: BoardGameTileIconName;
  assetKey?: string;
};

export type MitigationCardId =
  | "mangrove"
  | "tanggul"
  | "escape-route"
  | "early-warning"
  | "helm-darurat"
  | "bangunan-tahan-gempa"
  | "pohon-penahan-angin"
  | "drainase-bersih";

export type MitigationEffectKind =
  | "full-protection"
  | "movement-bonus"
  | "preparation-action"
  | "skip-penalty"
  | "extra-evacuation-turn"
  | "protect-cards";

export type MitigationCardIconName =
  | "Leaf"
  | "Construction"
  | "Route"
  | "Radio"
  | "HardHat"
  | "House"
  | "Trees"
  | "Droplets";

export type MitigationCard = {
  id: MitigationCardId;
  name: string;
  shortName: string;
  price: number;
  maxCopies: number;
  freeTilePosition?: number;
  protects: BoardGameDisasterId[];
  effectKind: MitigationEffectKind;
  effectValue?: number;
  description: string;
  comboNote?: string;
  iconName: MitigationCardIconName;
  assetKey: string;
};

export type BoardGameEventSpecialEffect =
  | "none"
  | "damage-one-card"
  | "move-unprotected-back"
  | "pause-nature-card-bonus"
  | "skip-unprotected-turn"
  | "damage-all-non-wind-cards";

export type BoardGameMotionPreset =
  | "wave-rise"
  | "ground-pulse"
  | "water-rise"
  | "wind-sweep";

export type BoardGameEventCard = {
  id: string;
  disasterId: BoardGameDisasterId;
  title: string;
  factSummary: string;
  learningInsight: string;
  protectionCardIds: MitigationCardId[];
  bonusCardIds: MitigationCardId[];
  giliranEvakuasi: number;
  specialEffect: BoardGameEventSpecialEffect;
  visualAssetKey: string;
  motionPreset: BoardGameMotionPreset;
};

export type BoardGameTriviaCategory =
  | BoardGameDisasterId
  | "mitigasi-umum"
  | "kearifan-lokal";

export type BoardGameTriviaOption = {
  id: string;
  label: string;
  feedback: string;
};

export type BoardGameTriviaCard = {
  id: string;
  category: BoardGameTriviaCategory;
  question: string;
  options: [
    BoardGameTriviaOption,
    BoardGameTriviaOption,
    BoardGameTriviaOption,
    BoardGameTriviaOption,
  ];
  correctOptionId: string;
  explanation: string;
  rewardCorrectCoins: number;
  rewardWrongCoins: number;
};

export type BoardGameTokenColor =
  | "purple"
  | "teal"
  | "coral"
  | "yellow"
  | "sky"
  | "peach";

export type BoardGamePlayer = {
  id: string;
  displayName: string;
  tokenColor: BoardGameTokenColor;
  position: number;
  coins: number;
  cardIds: MitigationCardId[];
  status: BoardGamePlayerStatus;
  skipTurns: number;
  isProtectedThisEvent: boolean;
  reachedSafeZoneAtTurn?: number;
  escapeRouteUsedInEvent: boolean;
};

export type BoardGameActionLogItem = {
  id: string;
  turnNumber: number;
  playerId: string;
  label: string;
  detail: string;
};

export type BoardGameWinnerSummary = {
  eventCardId: string;
  safePlayerIds: string[];
  eliminatedPlayerIds: string[];
  bestCardIds: MitigationCardId[];
  discussionPrompt: string;
};

export type BoardGamePanel =
  | {
      type: "none";
    }
  | {
      type: "market";
      playerId: string;
    }
  | {
      type: "trivia";
      playerId: string;
      triviaCard: BoardGameTriviaCard;
      selectedOptionId?: string;
      isCorrect?: boolean;
    }
  | {
      type: "event";
      eventCard: BoardGameEventCard;
      triggeredByPlayerId: string;
    }
  | {
      type: "mission";
      playerId: string;
      missionRoll?: 1 | 2 | 3 | 4 | 5 | 6;
      didMove?: boolean;
    }
  | {
      type: "story";
      playerId: string;
      title: string;
      body: string;
    };

export type BoardGameState = {
  phase: BoardGamePhase;
  players: BoardGamePlayer[];
  currentPlayerIndex: number;
  turnNumber: number;
  mode: BoardGameMode;
  activeEvent?: BoardGameEventCard;
  eventCountdown: number;
  eventHistory: BoardGameEventCard[];
  eventDeck: BoardGameEventCard[];
  triviaDeck: BoardGameTriviaCard[];
  actionLog: BoardGameActionLogItem[];
  winnerSummary?: BoardGameWinnerSummary;
  lastDiceValue?: 1 | 2 | 3 | 4 | 5 | 6;
  panel: BoardGamePanel;
};

export type BoardGameAction =
  | {
      type: "start-game";
      playerCount: 2 | 3 | 4 | 5 | 6;
      mode: BoardGameMode;
    }
  | {
      type: "roll-dice";
      value: 1 | 2 | 3 | 4 | 5 | 6;
    }
  | {
      type: "buy-card";
      playerId: string;
      cardId: MitigationCardId;
    }
  | {
      type: "answer-trivia";
      playerId: string;
      triviaCardId: string;
      selectedOptionId: string;
    }
  | {
      type: "resolve-mission";
      playerId: string;
      value: 1 | 2 | 3 | 4 | 5 | 6;
    }
  | {
      type: "use-escape-route-help";
      helperPlayerId: string;
      targetPlayerId: string;
    }
  | {
      type: "continue-event";
    }
  | {
      type: "advance-turn";
    }
  | {
      type: "restart-game";
    };
