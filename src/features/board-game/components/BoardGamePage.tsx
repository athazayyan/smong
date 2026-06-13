"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Award,
  CircleHelp,
  Construction,
  Dice5,
  Droplets,
  Flag,
  Gamepad2,
  HardHat,
  HeartHandshake,
  House,
  Leaf,
  MapPin,
  Radio,
  RefreshCcw,
  Route,
  ShieldCheck,
  ShieldPlus,
  Store,
  Trees,
  TriangleAlert,
  Waves,
  X,
} from "lucide-react";
import { boardGameTiles } from "../data/boardTiles";
import { mitigationCards } from "../data/mitigationCards";
import { boardGameReducer } from "../lib/reducer";
import { createInitialBoardGameState } from "../lib/gameSetup";
import { canReceiveCard, getDisasterLabel, getMitigationCard, getProtectedDisasterLabels } from "../lib/cardRules";
import { sortPlayersForLeaderboard } from "../lib/scoring";
import type {
  BoardGameDisasterId,
  BoardGameMode,
  BoardGamePanel,
  BoardGamePlayer,
  BoardGameState,
  BoardGameTile,
  BoardGameTileIconName,
  BoardGameTokenColor,
  MitigationCardIconName,
  MitigationCardId,
} from "../types";

type PlayerCount = 2 | 3 | 4 | 5 | 6;
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export function BoardGamePage() {
  const [state, dispatch] = useReducer(boardGameReducer, undefined, createInitialBoardGameState);
  const [playerCount, setPlayerCount] = useState<PlayerCount>(4);
  const [mode, setMode] = useState<BoardGameMode>("random");
  const shouldReduceMotion = useReducedMotion();
  const currentPlayer = state.players[state.currentPlayerIndex] ?? state.players[0];
  const currentTile = currentPlayer ? getTile(currentPlayer.position) : boardGameTiles[0];
  const canRoll =
    currentPlayer &&
    currentPlayer.status === "aktif" &&
    (state.phase === "player-turn" || state.phase === "event-active") &&
    state.panel.type === "none";

  if (state.phase === "setup") {
    return (
      <BoardGameSetup
        playerCount={playerCount}
        mode={mode}
        onChangePlayerCount={setPlayerCount}
        onChangeMode={setMode}
        onStart={() => dispatch({ type: "start-game", playerCount, mode })}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream-50 pb-10 pt-4 text-ink-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(124,91,219,0.12),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(34,185,154,0.11),transparent_26%),radial-gradient(circle_at_52%_88%,rgba(255,214,184,0.35),transparent_32%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
        <BoardGameHeader state={state} onRestart={() => dispatch({ type: "restart-game" })} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <BoardMap state={state} currentTile={currentTile} shouldReduceMotion={shouldReduceMotion} />
            <ActiveTilePanel tile={currentTile} currentPlayer={currentPlayer} state={state} />
          </div>

          <aside className="space-y-4">
            <TurnPanel
              state={state}
              currentPlayer={currentPlayer}
              canRoll={Boolean(canRoll)}
              onRoll={() => dispatch({ type: "roll-dice", value: createDiceValue() })}
              onUseEscapeRoute={(targetPlayerId) =>
                currentPlayer &&
                dispatch({
                  type: "use-escape-route-help",
                  helperPlayerId: currentPlayer.id,
                  targetPlayerId,
                })
              }
            />
            <PlayerStatusRail players={state.players} />
            <PlayerHand player={currentPlayer} />
            <ActionLog state={state} />
          </aside>
        </section>
      </div>

      <AnimatePresence>
        {state.panel.type !== "none" ? (
          <GamePanel
            panel={state.panel}
            state={state}
            onBuyCard={(playerId, cardId) => dispatch({ type: "buy-card", playerId, cardId })}
            onAnswerTrivia={(playerId, triviaCardId, selectedOptionId) =>
              dispatch({ type: "answer-trivia", playerId, triviaCardId, selectedOptionId })
            }
            onResolveMission={(playerId) =>
              dispatch({ type: "resolve-mission", playerId, value: createDiceValue() })
            }
            onContinueEvent={() => dispatch({ type: "continue-event" })}
            onAdvanceTurn={() => dispatch({ type: "advance-turn" })}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {state.phase === "final-recap" ? (
          <FinalRecap state={state} onRestart={() => dispatch({ type: "restart-game" })} />
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function BoardGameSetup({
  playerCount,
  mode,
  onChangePlayerCount,
  onChangeMode,
  onStart,
}: {
  playerCount: PlayerCount;
  mode: BoardGameMode;
  onChangePlayerCount: (count: PlayerCount) => void;
  onChangeMode: (mode: BoardGameMode) => void;
  onStart: () => void;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream-50 px-4 pb-16 pt-6 text-ink-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(91,59,181,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(34,185,154,0.12),transparent_28%),linear-gradient(180deg,rgba(255,248,240,0),rgba(251,239,227,0.78))]" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-7">
          <Link
            href="/siswa/games"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lavender-200 bg-white/80 px-4 text-sm font-extrabold text-purple-700 shadow-sm"
          >
            <Gamepad2 className="h-4 w-4" />
            Games Smong
          </Link>

          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-teal-700">Board Game Kesiapsiagaan</p>
            <h1 className="font-heading text-5xl font-black leading-[0.95] text-purple-900 sm:text-6xl lg:text-7xl">
              Jelajahi Papan Siaga Nusantara
            </h1>
            <p className="max-w-2xl text-base font-semibold leading-8 text-ink-700 sm:text-lg">
              Kumpulkan Koin, pilih kartu mitigasi, jawab trivia, lalu hadapi satu event bencana besar dengan strategi yang tenang.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SetupFeature iconName="MapPin" title="40 Petak" body="Pesisir, sungai, gunung, hutan, dan desa kearifan lokal." />
            <SetupFeature iconName="ShieldPlus" title="8 Kartu" body="Bangun strategi dari Mangrove sampai Early Warning." />
            <SetupFeature iconName="TriangleAlert" title="4 Bencana" body="Tsunami, Gempa Bumi, Banjir, dan Cuaca Ekstrem." />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-[0_22px_70px_rgba(47,23,110,0.14)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.6rem] bg-lavender-100">
              <Image
                src="/assets/mascot/mascot-smong.png"
                alt="Mascot Smong"
                width={80}
                height={80}
                sizes="80px"
                className="h-full w-full object-contain p-2"
                priority
              />
            </div>
            <div>
              <p className="font-heading text-2xl font-black text-purple-900">Siapkan sesi</p>
              <p className="text-sm font-bold leading-6 text-ink-700">Pilih jumlah pemain dan mode bencana.</p>
            </div>
          </div>

          <div className="space-y-5">
            <fieldset className="space-y-3">
              <legend className="text-sm font-black text-ink-900">Jumlah pemain</legend>
              <div className="grid grid-cols-5 gap-2">
                {([2, 3, 4, 5, 6] satisfies PlayerCount[]).map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`min-h-12 rounded-2xl border text-base font-black transition ${
                      playerCount === count
                        ? "border-purple-700 bg-purple-700 text-white shadow-[0_5px_0_#2F176E]"
                        : "border-lavender-200 bg-cream-50 text-ink-700 hover:bg-lavender-100"
                    }`}
                    onClick={() => onChangePlayerCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-black text-ink-900">Mode bencana</legend>
              <div className="grid gap-2">
                {getModeOptions().map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 text-left transition ${
                      mode === option.id
                        ? "border-purple-700 bg-lavender-100 text-purple-900"
                        : "border-lavender-200 bg-cream-50 text-ink-700 hover:bg-white"
                    }`}
                    onClick={() => onChangeMode(option.id)}
                  >
                    <span className="font-heading text-base font-black">{option.label}</span>
                    <span className="text-xs font-extrabold text-ink-400">{option.helper}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-6 font-heading text-lg font-black text-white shadow-[0_7px_0_#2F176E] transition hover:bg-purple-500 active:translate-y-1 active:shadow-none"
              onClick={onStart}
            >
              <Dice5 className="h-5 w-5" />
              Mulai Board Game
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function SetupFeature({ iconName, title, body }: { iconName: BoardGameTileIconName; title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/80 bg-white/72 p-4 shadow-[0_14px_40px_rgba(47,23,110,0.08)]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender-100 text-purple-700">
        {renderTileIcon(iconName, "h-5 w-5")}
      </div>
      <p className="font-heading text-lg font-black text-purple-900">{title}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-ink-700">{body}</p>
    </div>
  );
}

function BoardGameHeader({ state, onRestart }: { state: BoardGameState; onRestart: () => void }) {
  return (
    <header className="rounded-[2rem] border border-white/80 bg-white/78 p-4 shadow-[0_16px_48px_rgba(47,23,110,0.1)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-lavender-100 px-3 text-xs font-black text-purple-700">
              <Gamepad2 className="h-4 w-4" />
              Board Game
            </span>
            <span className="inline-flex min-h-8 items-center rounded-full bg-mint-100 px-3 text-xs font-black text-teal-700">
              Mode {getModeLabel(state.mode)}
            </span>
            {state.activeEvent ? (
              <span className="inline-flex min-h-8 items-center rounded-full bg-coral-50 px-3 text-xs font-black text-coral-700">
                Evakuasi {state.eventCountdown} giliran
              </span>
            ) : null}
          </div>
          <h1 className="font-heading text-3xl font-black text-purple-900 sm:text-4xl">
            Smong Archipelago Board
          </h1>
          <p className="mt-1 text-sm font-bold text-ink-700">
            Kumpulkan resource, pilih kartu mitigasi, lalu cari jalan aman saat event muncul.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-lavender-200 bg-cream-50 px-4 text-sm font-black text-purple-700 transition hover:bg-white"
          onClick={onRestart}
        >
          <RefreshCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </header>
  );
}

function BoardMap({
  state,
  currentTile,
  shouldReduceMotion,
}: {
  state: BoardGameState;
  currentTile: BoardGameTile;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/72 p-3 shadow-[0_22px_70px_rgba(47,23,110,0.12)] backdrop-blur-xl sm:p-5">
      <div className="relative mx-auto aspect-square w-full max-w-[760px] rounded-[1.7rem] bg-[linear-gradient(135deg,#FFF8F0,#EEE8FF_42%,#D7F7E7)] p-2 shadow-inner sm:p-3">
        <div className="pointer-events-none absolute inset-[14%] rounded-[35%_20%_35%_18%/22%_35%_18%_28%] bg-[radial-gradient(circle_at_30%_28%,rgba(255,232,154,0.6),transparent_30%),radial-gradient(circle_at_68%_62%,rgba(34,185,154,0.22),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.74),rgba(216,241,255,0.38))] shadow-[inset_0_0_60px_rgba(91,59,181,0.08)]" />
        <div className="grid h-full w-full grid-cols-11 grid-rows-11 gap-1 sm:gap-1.5">
          {boardGameTiles.map((tile) => (
            <BoardTileView
              key={tile.id}
              tile={tile}
              players={state.players.filter((player) => player.position === tile.position)}
              isActive={tile.position === currentTile.position}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-[31%] hidden items-center justify-center rounded-[2rem] border border-white/60 bg-cream-50/70 text-center shadow-sm backdrop-blur-sm sm:flex">
          <div className="px-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">Papan Siaga</p>
            <p className="font-heading text-2xl font-black leading-tight text-purple-900">Nusantara Aman</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BoardTileView({
  tile,
  players,
  isActive,
  shouldReduceMotion,
}: {
  tile: BoardGameTile;
  players: BoardGamePlayer[];
  isActive: boolean;
  shouldReduceMotion: boolean | null;
}) {
  const gridPosition = getTileGridPosition(tile.position);
  const Wrapper = shouldReduceMotion ? "div" : motion.div;
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: isActive ? 1.04 : 1 },
        transition: { duration: 0.22 },
      };

  return (
    <Wrapper
      {...motionProps}
      className={`relative flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-[0.65rem] border p-1.5 shadow-sm sm:rounded-[0.85rem] sm:p-2 ${getTileClass(tile, isActive)}`}
      style={{
        gridColumn: gridPosition.column,
        gridRow: gridPosition.row,
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[0.62rem] font-black leading-none text-current sm:text-[0.68rem]">{tile.position}</span>
        <span className="hidden shrink-0 sm:inline-flex">{renderTileIcon(tile.iconName, "h-3.5 w-3.5")}</span>
      </div>
      <p className="hidden truncate text-[0.54rem] font-black leading-none sm:block">{tile.name}</p>
      {players.length > 0 ? (
        <div className="absolute bottom-1 right-1 flex -space-x-1">
          {players.map((player) => (
            <span
              key={player.id}
              className={`h-3.5 w-3.5 rounded-full border border-white shadow-sm sm:h-4 sm:w-4 ${getTokenClass(player.tokenColor)}`}
              title={player.displayName}
            />
          ))}
        </div>
      ) : null}
    </Wrapper>
  );
}

function ActiveTilePanel({
  tile,
  currentPlayer,
  state,
}: {
  tile: BoardGameTile;
  currentPlayer?: BoardGamePlayer;
  state: BoardGameState;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/80 bg-white/76 p-4 shadow-[0_14px_44px_rgba(47,23,110,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-400">Petak aktif</p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lavender-100 text-purple-700">
              {renderTileIcon(tile.iconName, "h-5 w-5")}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-xl font-black text-purple-900">{tile.name}</p>
              <p className="line-clamp-2 text-sm font-semibold leading-6 text-ink-700">{tile.description}</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="rounded-full bg-cream-100 px-3 py-2 text-xs font-black text-ink-700">
            Giliran {state.turnNumber}
          </span>
          {currentPlayer ? (
            <span className="rounded-full bg-mint-100 px-3 py-2 text-xs font-black text-teal-700">
              {currentPlayer.displayName}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function TurnPanel({
  state,
  currentPlayer,
  canRoll,
  onRoll,
  onUseEscapeRoute,
}: {
  state: BoardGameState;
  currentPlayer?: BoardGamePlayer;
  canRoll: boolean;
  onRoll: () => void;
  onUseEscapeRoute: (targetPlayerId: string) => void;
}) {
  const helpTargets = currentPlayer && state.activeEvent && currentPlayer.cardIds.includes("escape-route") && !currentPlayer.escapeRouteUsedInEvent
    ? state.players.filter((player) => player.id !== currentPlayer.id && player.status === "aktif")
    : [];

  return (
    <section className="rounded-[1.7rem] border border-white/80 bg-white/80 p-4 shadow-[0_16px_48px_rgba(47,23,110,0.1)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-400">Giliran</p>
          <p className="font-heading text-2xl font-black text-purple-900">
            {currentPlayer?.displayName ?? "Pemain"}
          </p>
        </div>
        {currentPlayer ? (
          <span className={`h-12 w-12 rounded-2xl border-4 border-white shadow-md ${getTokenClass(currentPlayer.tokenColor)}`} />
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <StatusStat label="Posisi" value={currentPlayer ? `${currentPlayer.position}` : "-"} />
        <StatusStat label="Koin" value={currentPlayer ? `${currentPlayer.coins}` : "-"} />
        <StatusStat label="Kartu" value={currentPlayer ? `${currentPlayer.cardIds.length}` : "-"} />
      </div>

      {state.activeEvent ? (
        <div className="mt-4 rounded-2xl border border-coral-200 bg-coral-50 p-3">
          <p className="text-xs font-black text-coral-700">Event aktif</p>
          <p className="font-heading text-lg font-black text-purple-900">{state.activeEvent.title}</p>
          <p className="mt-1 text-sm font-bold text-ink-700">
            Sisa {state.eventCountdown} giliran untuk menuju Escape Building atau memakai proteksi.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-5 font-heading text-lg font-black text-white shadow-[0_7px_0_#2F176E] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-lavender-200 disabled:text-ink-400 disabled:shadow-none"
        disabled={!canRoll}
        onClick={onRoll}
      >
        <Dice5 className="h-5 w-5" />
        Lempar Dadu
      </button>

      {state.lastDiceValue ? (
        <p className="mt-3 rounded-2xl bg-lavender-100 px-3 py-2 text-center text-sm font-black text-purple-700">
          Dadu terakhir: {state.lastDiceValue}
        </p>
      ) : null}

      {helpTargets.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-2xl border border-teal-100 bg-mint-100/60 p-3">
          <p className="text-xs font-black text-teal-700">Escape Route siap membantu</p>
          {helpTargets.map((player) => (
            <button
              key={player.id}
              type="button"
              className="flex min-h-10 w-full items-center justify-between rounded-xl bg-white/78 px-3 text-sm font-black text-ink-700"
              onClick={() => onUseEscapeRoute(player.id)}
            >
              <span>{player.displayName}</span>
              <Route className="h-4 w-4 text-teal-700" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StatusStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream-100 px-2 py-3">
      <p className="text-[0.66rem] font-black uppercase tracking-wider text-ink-400">{label}</p>
      <p className="font-heading text-xl font-black text-purple-900">{value}</p>
    </div>
  );
}

function PlayerStatusRail({ players }: { players: BoardGamePlayer[] }) {
  return (
    <section className="rounded-[1.7rem] border border-white/80 bg-white/78 p-4 shadow-[0_16px_48px_rgba(47,23,110,0.08)] backdrop-blur-xl">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-ink-400">Pemain</p>
      <div className="grid gap-2">
        {players.map((player) => (
          <div key={player.id} className="flex min-h-12 items-center gap-3 rounded-2xl bg-cream-50 px-3">
            <span className={`h-8 w-8 rounded-xl border-2 border-white shadow-sm ${getTokenClass(player.tokenColor)}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-base font-black text-purple-900">{player.displayName}</p>
              <p className="text-xs font-bold text-ink-400">Petak {player.position} · {getPlayerStatusLabel(player.status)}</p>
            </div>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-ink-700">{player.coins}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlayerHand({ player }: { player?: BoardGamePlayer }) {
  if (!player) return null;
  const cards = player.cardIds.map(getMitigationCard);

  return (
    <section className="rounded-[1.7rem] border border-white/80 bg-white/78 p-4 shadow-[0_16px_48px_rgba(47,23,110,0.08)] backdrop-blur-xl">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-ink-400">Kartu {player.displayName}</p>
      {cards.length === 0 ? (
        <p className="rounded-2xl bg-cream-100 p-3 text-sm font-bold leading-6 text-ink-700">
          Belum ada kartu. Cari Market atau petak Mitigasi Gratis.
        </p>
      ) : (
        <div className="grid gap-2">
          {cards.map((card, index) => (
            <div key={`${card.id}-${index}`} className="rounded-2xl border border-lavender-200 bg-cream-50 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender-100 text-purple-700">
                  {renderMitigationIcon(card.iconName, "h-4 w-4")}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-black text-purple-900">{card.name}</p>
                  <p className="text-xs font-bold text-teal-700">{getProtectedDisasterLabels(card)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ActionLog({ state }: { state: BoardGameState }) {
  return (
    <section className="rounded-[1.7rem] border border-white/80 bg-white/78 p-4 shadow-[0_16px_48px_rgba(47,23,110,0.08)] backdrop-blur-xl">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-ink-400">Log</p>
      <div className="space-y-2">
        {state.actionLog.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-2xl bg-cream-50 p-3">
            <p className="text-sm font-black text-purple-900">{item.label}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-ink-700">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GamePanel({
  panel,
  state,
  onBuyCard,
  onAnswerTrivia,
  onResolveMission,
  onContinueEvent,
  onAdvanceTurn,
}: {
  panel: Exclude<BoardGamePanel, { type: "none" }>;
  state: BoardGameState;
  onBuyCard: (playerId: string, cardId: MitigationCardId) => void;
  onAnswerTrivia: (playerId: string, triviaCardId: string, selectedOptionId: string) => void;
  onResolveMission: (playerId: string) => void;
  onContinueEvent: () => void;
  onAdvanceTurn: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end bg-purple-900/24 p-3 backdrop-blur-[2px] sm:items-center sm:justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="max-h-[88vh] w-full overflow-y-auto rounded-[2rem] border border-white/80 bg-cream-50 p-4 shadow-[0_24px_80px_rgba(47,23,110,0.26)] sm:max-w-2xl sm:p-6"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-heading text-2xl font-black text-purple-900">{getPanelTitle(panel)}</p>
          {panel.type !== "event" ? (
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-purple-700 shadow-sm"
              aria-label="Tutup panel"
              onClick={onAdvanceTurn}
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {panel.type === "market" ? (
          <MarketPanel state={state} playerId={panel.playerId} onBuyCard={onBuyCard} onAdvanceTurn={onAdvanceTurn} />
        ) : null}
        {panel.type === "trivia" ? (
          <TriviaPanel panel={panel} onAnswerTrivia={onAnswerTrivia} onAdvanceTurn={onAdvanceTurn} />
        ) : null}
        {panel.type === "event" ? (
          <EventPanel panel={panel} onContinueEvent={onContinueEvent} />
        ) : null}
        {panel.type === "mission" ? (
          <MissionPanel panel={panel} onResolveMission={onResolveMission} onAdvanceTurn={onAdvanceTurn} />
        ) : null}
        {panel.type === "story" ? (
          <StoryPanel panel={panel} onAdvanceTurn={onAdvanceTurn} />
        ) : null}
      </motion.section>
    </motion.div>
  );
}

function MarketPanel({
  state,
  playerId,
  onBuyCard,
  onAdvanceTurn,
}: {
  state: BoardGameState;
  playerId: string;
  onBuyCard: (playerId: string, cardId: MitigationCardId) => void;
  onAdvanceTurn: () => void;
}) {
  const player = getPlayer(state, playerId);

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold leading-6 text-ink-700">
        Koin {player.displayName}: <span className="font-black text-purple-900">{player.coins}</span>. Beli kartu yang masih tersedia untuk memperkuat strategi.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {mitigationCards.map((card) => {
          const canBuy = player.coins >= card.price && canReceiveCard(player, card);
          return (
            <div key={card.id} className="rounded-[1.4rem] border border-lavender-200 bg-white p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lavender-100 text-purple-700">
                  {renderMitigationIcon(card.iconName, "h-5 w-5")}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-lg font-black leading-tight text-purple-900">{card.name}</p>
                  <p className="mt-1 text-xs font-black text-teal-700">{getProtectedDisasterLabels(card)}</p>
                </div>
              </div>
              <p className="min-h-12 text-sm font-semibold leading-6 text-ink-700">{card.description}</p>
              <button
                type="button"
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-4 text-sm font-black text-white shadow-[0_5px_0_#2F176E] transition disabled:bg-lavender-200 disabled:text-ink-400 disabled:shadow-none"
                disabled={!canBuy}
                onClick={() => onBuyCard(playerId, card.id)}
              >
                <Store className="h-4 w-4" />
                Beli {card.price} Koin
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-teal-500 px-4 font-heading text-base font-black text-white shadow-[0_5px_0_#1A9278]"
        onClick={onAdvanceTurn}
      >
        Selesai Belanja
      </button>
    </div>
  );
}

function TriviaPanel({
  panel,
  onAnswerTrivia,
  onAdvanceTurn,
}: {
  panel: Extract<BoardGamePanel, { type: "trivia" }>;
  onAnswerTrivia: (playerId: string, triviaCardId: string, selectedOptionId: string) => void;
  onAdvanceTurn: () => void;
}) {
  const selectedOption = panel.selectedOptionId
    ? panel.triviaCard.options.find((option) => option.id === panel.selectedOptionId)
    : undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.4rem] border border-lavender-200 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">Pertanyaan</p>
        <h2 className="mt-2 font-heading text-2xl font-black leading-tight text-purple-900">
          {panel.triviaCard.question}
        </h2>
      </div>
      <div className="grid gap-2">
        {panel.triviaCard.options.map((option) => {
          const isSelected = panel.selectedOptionId === option.id;
          const isCorrect = option.id === panel.triviaCard.correctOptionId;
          return (
            <button
              key={option.id}
              type="button"
              className={`min-h-12 rounded-2xl border px-4 text-left text-sm font-black transition ${
                isSelected
                  ? isCorrect
                    ? "border-teal-500 bg-mint-100 text-teal-700"
                    : "border-coral-500 bg-coral-50 text-coral-700"
                  : "border-lavender-200 bg-white text-ink-700 hover:bg-lavender-100"
              }`}
              disabled={Boolean(panel.selectedOptionId)}
              onClick={() => onAnswerTrivia(panel.playerId, panel.triviaCard.id, option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {selectedOption ? (
        <div className="rounded-[1.4rem] border border-lavender-200 bg-white p-4">
          <p className={`font-heading text-xl font-black ${panel.isCorrect ? "text-teal-700" : "text-coral-700"}`}>
            {panel.isCorrect ? "Jawaban aman" : "Coba pahami lagi"}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-700">{selectedOption.feedback}</p>
          <p className="mt-2 text-sm font-bold leading-6 text-purple-900">{panel.triviaCard.explanation}</p>
          <button
            type="button"
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-purple-700 px-4 font-heading text-base font-black text-white shadow-[0_5px_0_#2F176E]"
            onClick={onAdvanceTurn}
          >
            Lanjutkan
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EventPanel({
  panel,
  onContinueEvent,
}: {
  panel: Extract<BoardGamePanel, { type: "event" }>;
  onContinueEvent: () => void;
}) {
  const eventCard = panel.eventCard;
  return (
    <div className="space-y-4">
      <div className={`rounded-[1.8rem] border p-5 ${getEventToneClass(eventCard.disasterId)}`}>
        <p className="text-xs font-black uppercase tracking-[0.2em]">{getDisasterLabel(eventCard.disasterId)}</p>
        <h2 className="mt-2 font-heading text-3xl font-black leading-tight text-purple-900">{eventCard.title}</h2>
        <p className="mt-3 text-sm font-semibold leading-7 text-ink-700">{eventCard.factSummary}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.4rem] bg-white p-4">
          <p className="text-xs font-black text-ink-400">Waktu evakuasi</p>
          <p className="font-heading text-3xl font-black text-purple-900">{eventCard.giliranEvakuasi} giliran</p>
        </div>
        <div className="rounded-[1.4rem] bg-white p-4">
          <p className="text-xs font-black text-ink-400">Kartu yang membantu</p>
          <p className="mt-1 text-sm font-black leading-6 text-teal-700">
            {[...eventCard.protectionCardIds, ...eventCard.bonusCardIds].map((cardId) => getMitigationCard(cardId).shortName).join(", ")}
          </p>
        </div>
      </div>
      <div className="rounded-[1.4rem] border border-lavender-200 bg-white p-4">
        <p className="text-xs font-black text-ink-400">Pelajaran</p>
        <p className="mt-1 text-sm font-bold leading-6 text-ink-700">{eventCard.learningInsight}</p>
      </div>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-coral-500 px-4 font-heading text-base font-black text-white shadow-[0_5px_0_#C43A4A]"
        onClick={onContinueEvent}
      >
        Mulai Evakuasi
      </button>
    </div>
  );
}

function MissionPanel({
  panel,
  onResolveMission,
  onAdvanceTurn,
}: {
  panel: Extract<BoardGamePanel, { type: "mission" }>;
  onResolveMission: (playerId: string) => void;
  onAdvanceTurn: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-lavender-200 bg-white p-5">
        <p className="text-sm font-bold leading-7 text-ink-700">
          Lempar dadu misi. Hasil 4 sampai 6 membantu pemain maju ekstra sebagai tanda misi komunitas berhasil.
        </p>
      </div>
      {panel.missionRoll ? (
        <div className="rounded-[1.5rem] bg-mint-100 p-4 text-center">
          <p className="text-sm font-black text-teal-700">Hasil misi</p>
          <p className="font-heading text-4xl font-black text-purple-900">{panel.missionRoll}</p>
          <p className="text-sm font-bold text-ink-700">
            {panel.didMove ? "Pemain maju mengikuti hasil misi." : "Pemain tetap di posisi dan melanjutkan giliran berikutnya."}
          </p>
        </div>
      ) : null}
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-4 font-heading text-base font-black text-white shadow-[0_5px_0_#2F176E]"
        onClick={panel.missionRoll ? onAdvanceTurn : () => onResolveMission(panel.playerId)}
      >
        <Dice5 className="h-4 w-4" />
        {panel.missionRoll ? "Lanjutkan" : "Lempar Dadu Misi"}
      </button>
    </div>
  );
}

function StoryPanel({
  panel,
  onAdvanceTurn,
}: {
  panel: Extract<BoardGamePanel, { type: "story" }>;
  onAdvanceTurn: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-[1.7rem] bg-lavender-100">
          <Image
            src="/assets/mascot/mascot-smong.png"
            alt="Mascot Smong"
            width={112}
            height={112}
            sizes="112px"
            className="h-full w-full object-contain p-2"
          />
        </div>
        <div className="rounded-[1.5rem] border border-lavender-200 bg-white p-5">
          <h2 className="font-heading text-2xl font-black text-purple-900">{panel.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-7 text-ink-700">{panel.body}</p>
        </div>
      </div>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-purple-700 px-4 font-heading text-base font-black text-white shadow-[0_5px_0_#2F176E]"
        onClick={onAdvanceTurn}
      >
        Lanjutkan
      </button>
    </div>
  );
}

function FinalRecap({ state, onRestart }: { state: BoardGameState; onRestart: () => void }) {
  const leaderboard = useMemo(() => sortPlayersForLeaderboard(state.players), [state.players]);
  const eventCard = state.eventHistory[state.eventHistory.length - 1];

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto bg-cream-50/96 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <section className="mx-auto max-w-5xl space-y-5 py-6">
        <div className="rounded-[2rem] border border-white/80 bg-white p-6 text-center shadow-[0_24px_80px_rgba(47,23,110,0.16)]">
          <Award className="mx-auto mb-3 h-12 w-12 text-yellow-700" />
          <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-700">Recap Board Game</p>
          <h2 className="mt-2 font-heading text-4xl font-black text-purple-900">Misi Siaga Selesai</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-700">
            Bahas pilihan yang membantu pemain selamat, lalu coba sesi baru dengan deck yang berbeda.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[2rem] border border-white/80 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-ink-400">Leaderboard</p>
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <div key={player.id} className="flex min-h-14 items-center gap-3 rounded-2xl bg-cream-50 px-4">
                  <span className="font-heading text-xl font-black text-purple-900">{index + 1}</span>
                  <span className={`h-9 w-9 rounded-xl border-2 border-white shadow-sm ${getTokenClass(player.tokenColor)}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-lg font-black text-purple-900">{player.displayName}</p>
                    <p className="text-xs font-bold text-ink-400">{getPlayerStatusLabel(player.status)} · {player.coins} Koin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {eventCard ? (
              <div className="rounded-[2rem] border border-white/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-400">Event</p>
                <p className="mt-2 font-heading text-2xl font-black text-purple-900">{eventCard.title}</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-ink-700">{eventCard.learningInsight}</p>
              </div>
            ) : null}
            <div className="rounded-[2rem] border border-white/80 bg-mint-100 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">Diskusi guru</p>
              <p className="mt-2 text-sm font-black leading-7 text-ink-900">
                {state.winnerSummary?.discussionPrompt ?? "Apa tindakan aman yang bisa kita latih bersama?"}
              </p>
            </div>
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-5 font-heading text-base font-black text-white shadow-[0_5px_0_#2F176E]"
              onClick={onRestart}
            >
              <RefreshCcw className="h-4 w-4" />
              Main Lagi
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function getTile(position: number) {
  const tile = boardGameTiles.find((item) => item.position === position);
  if (!tile) throw new Error(`Missing board tile: ${position}`);
  return tile;
}

function getPlayer(state: BoardGameState, playerId: string) {
  const player = state.players.find((item) => item.id === playerId);
  if (!player) throw new Error(`Missing player: ${playerId}`);
  return player;
}

function createDiceValue(): DiceValue {
  const value = Math.floor(Math.random() * 6) + 1;
  if (value === 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  if (value === 5) return 5;
  return 6;
}

function getModeOptions() {
  return [
    { id: "random", label: "Random", helper: "Semua bencana" },
    { id: "gempa-bumi", label: "Gempa Bumi", helper: "Drop Cover" },
    { id: "tsunami", label: "Tsunami", helper: "Tempat tinggi" },
    { id: "banjir", label: "Banjir", helper: "Air naik" },
    { id: "cuaca-ekstrem", label: "Cuaca Ekstrem", helper: "Angin dan hujan" },
  ] satisfies { id: BoardGameMode; label: string; helper: string }[];
}

function getModeLabel(mode: BoardGameMode) {
  if (mode === "random") return "Random";
  return getDisasterLabel(mode);
}

function getTileGridPosition(position: number) {
  if (position <= 11) {
    return { row: 11, column: position };
  }
  if (position <= 21) {
    return { row: 22 - position, column: 11 };
  }
  if (position <= 31) {
    return { row: 1, column: 32 - position };
  }
  return { row: position - 30, column: 1 };
}

function getTileClass(tile: BoardGameTile, isActive: boolean) {
  const active = isActive ? "ring-4 ring-yellow-200 ring-offset-1 ring-offset-cream-50" : "";
  if (tile.type === "event") return `${active} border-coral-200 bg-coral-50 text-coral-700`;
  if (tile.type === "safe-zone") return `${active} border-teal-100 bg-mint-100 text-teal-700`;
  if (tile.type === "trivia") return `${active} border-sky-100 bg-sky-100 text-purple-900`;
  if (tile.type === "market") return `${active} border-yellow-200 bg-yellow-200/70 text-yellow-800`;
  if (tile.type === "mission") return `${active} border-peach-200 bg-peach-200/70 text-ink-900`;
  if (tile.type === "free-mitigation") return `${active} border-lavender-200 bg-lavender-100 text-purple-700`;
  if (tile.type === "special-story") return `${active} border-teal-100 bg-white text-teal-700`;
  if (tile.type === "start") return `${active} border-purple-500 bg-purple-700 text-white`;
  return `${active} border-white/80 bg-white/80 text-ink-700`;
}

function getTokenClass(color: BoardGameTokenColor) {
  if (color === "purple") return "bg-purple-700";
  if (color === "teal") return "bg-teal-500";
  if (color === "coral") return "bg-coral-500";
  if (color === "yellow") return "bg-yellow-500";
  if (color === "sky") return "bg-sky-100";
  return "bg-peach-300";
}

function getPlayerStatusLabel(status: BoardGamePlayer["status"]) {
  if (status === "selamat") return "Selamat";
  if (status === "tersingkir") return "Perlu evaluasi";
  return "Aktif";
}

function getPanelTitle(panel: Exclude<BoardGamePanel, { type: "none" }>) {
  if (panel.type === "market") return "Market Kartu";
  if (panel.type === "trivia") return "ASK ME";
  if (panel.type === "event") return "WATCH YOUR STEP";
  if (panel.type === "mission") return "Misi Komunitas";
  return "Cerita Smong";
}

function getEventToneClass(disasterId: BoardGameDisasterId) {
  if (disasterId === "tsunami") return "border-sky-100 bg-sky-100/78";
  if (disasterId === "gempa-bumi") return "border-peach-200 bg-peach-200/62";
  if (disasterId === "banjir") return "border-teal-100 bg-mint-100/72";
  return "border-coral-200 bg-coral-50";
}

function renderTileIcon(iconName: BoardGameTileIconName, className: string) {
  if (iconName === "Flag") return <Flag className={className} />;
  if (iconName === "ShieldCheck") return <ShieldCheck className={className} />;
  if (iconName === "TriangleAlert") return <TriangleAlert className={className} />;
  if (iconName === "CircleHelp") return <CircleHelp className={className} />;
  if (iconName === "Store") return <Store className={className} />;
  if (iconName === "HeartHandshake") return <HeartHandshake className={className} />;
  if (iconName === "ShieldPlus") return <ShieldPlus className={className} />;
  if (iconName === "Waves") return <Waves className={className} />;
  return <MapPin className={className} />;
}

function renderMitigationIcon(iconName: MitigationCardIconName, className: string) {
  if (iconName === "Leaf") return <Leaf className={className} />;
  if (iconName === "Construction") return <Construction className={className} />;
  if (iconName === "Route") return <Route className={className} />;
  if (iconName === "Radio") return <Radio className={className} />;
  if (iconName === "HardHat") return <HardHat className={className} />;
  if (iconName === "House") return <House className={className} />;
  if (iconName === "Trees") return <Trees className={className} />;
  return <Droplets className={className} />;
}
