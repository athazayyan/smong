"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  CircleHelp,
  Construction,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
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
import { getNextBoardPosition } from "../lib/movement";
import {
  canReceiveCard,
  getDisasterLabel,
  getMitigationCard,
  getProtectedDisasterLabels,
} from "../lib/cardRules";
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

// ─── Dice Rolling Hook ────────────────────────────────────────────────────────

function useDiceRoller(onComplete: (val: DiceValue) => void) {
  const [rolling, setRolling] = useState(false);
  const [val1, setVal1] = useState<DiceValue>(1);
  const [val2, setVal2] = useState<DiceValue>(6);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const max = 16;
    const final1 = (Math.floor(Math.random() * 6) + 1) as DiceValue;
    const final2 = (Math.floor(Math.random() * 6) + 1) as DiceValue;
    const tick = () => {
      ticks++;
      setVal1((Math.floor(Math.random() * 6) + 1) as DiceValue);
      setVal2((Math.floor(Math.random() * 6) + 1) as DiceValue);
      if (ticks < max) {
        timer.current = setTimeout(tick, 50 + ticks * 10);
      } else {
        setVal1(final1);
        setVal2(final2);
        setRolling(false);
        // Use only first dice value for movement (1–6)
        onComplete(final1);
      }
    };
    tick();
  }, [rolling, onComplete]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return { roll, rolling, val1, val2 };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function BoardGamePage() {
  const [state, dispatch] = useReducer(boardGameReducer, undefined, createInitialBoardGameState);
  const [playerCount, setPlayerCount] = useState<PlayerCount>(4);
  const [mode, setMode] = useState<BoardGameMode>("random");
  
  // Custom player names
  const [playerNames, setPlayerNames] = useState<string[]>(["Rina", "Bima", "Sari", "Dika", "Maya", "Ardi"]);

  // Visual walking states
  const [playerVisualPositions, setPlayerVisualPositions] = useState<Record<string, number>>({});
  const [isWalking, setIsWalking] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const currentPlayer = state.players[state.currentPlayerIndex] ?? state.players[0];
  const canRoll =
    currentPlayer &&
    currentPlayer.status === "aktif" &&
    (state.phase === "player-turn" || state.phase === "event-active") &&
    state.panel.type === "none" &&
    !isWalking;

  // Sync player visual positions when NOT walking (e.g. game start or help cards)
  useEffect(() => {
    if (!isWalking) {
      const positions: Record<string, number> = {};
      state.players.forEach((p) => {
        positions[p.id] = p.position;
      });
      setPlayerVisualPositions(positions);
    }
  }, [state.players, isWalking]);

  // Sync page state with global navbar visibility
  useEffect(() => {
    if (state.phase !== "setup") {
      document.body.classList.add("gameplay-active");
    } else {
      document.body.classList.remove("gameplay-active");
    }
    return () => {
      document.body.classList.remove("gameplay-active");
    };
  }, [state.phase]);

  // Handle dice roll completion with step-by-step visual walk and delayed dispatch
  const handleRollComplete = useCallback(
    (value: DiceValue) => {
      if (!currentPlayer) return;
      setIsWalking(true);

      let stepsTaken = 0;
      let currentPos = currentPlayer.position;

      const intervalId = setInterval(() => {
        stepsTaken++;
        currentPos = getNextBoardPosition(currentPos, 1);
        
        setPlayerVisualPositions((prev) => ({
          ...prev,
          [currentPlayer.id]: currentPos,
        }));

        if (stepsTaken >= value) {
          clearInterval(intervalId);
          
          // Wait 1.2 seconds before executing final landing card & panel resolution
          setTimeout(() => {
            dispatch({ type: "roll-dice", value });
            setIsWalking(false);
          }, 1200);
        }
      }, 300); // 300ms per block walk transition
    },
    [currentPlayer]
  );

  const { roll, rolling, val1, val2 } = useDiceRoller(handleRollComplete);

  if (state.phase === "setup") {
    return (
      <SetupScreen
        playerCount={playerCount}
        mode={mode}
        playerNames={playerNames}
        onChangePlayerCount={setPlayerCount}
        onChangeMode={setMode}
        onChangePlayerNames={setPlayerNames}
        onStart={() => dispatch({ type: "start-game", playerCount, mode, playerNames: playerNames.slice(0, playerCount) })}
      />
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 text-ink-900 relative overflow-hidden">
      {/* Decorative quiet field backgrounds */}
      <div className="pointer-events-none absolute inset-0 -z-20 smong-quiet-field" />
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[440px] w-[88vw] max-w-6xl -translate-x-1/2 smong-veil bg-white/40 blur-[1px]" />

      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-purple-700/10 bg-white/80 px-4 py-2.5 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
            <Gamepad2 className="h-3.5 w-3.5" />
            SMONG Board
          </span>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">
            {getModeLabel(state.mode)}
          </span>
          {state.activeEvent && (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1 rounded-full bg-coral-100 px-3 py-1 text-xs font-black text-coral-700"
            >
              <TriangleAlert className="h-3 w-3" />
              Evakuasi! {state.eventCountdown} giliran
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-purple-700/10 bg-white/50 px-3 py-1.5 text-xs font-black text-ink-700 transition hover:bg-purple-50 cursor-pointer"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            Panduan
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "restart-game" })}
            className="flex items-center gap-1.5 rounded-full border border-purple-700/10 bg-white/50 px-3 py-1.5 text-xs font-black text-ink-700 transition hover:bg-purple-50 cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-49px)] flex-col lg:flex-row">
        {/* Board area */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-3 sm:p-5">
          <BoardMap
            state={state}
            playerVisualPositions={playerVisualPositions}
            rolling={rolling}
            val1={val1}
            val2={val2}
            canRoll={Boolean(canRoll)}
            onRoll={roll}
          />
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-3 overflow-y-auto border-t border-purple-700/10 bg-white/40 p-3 lg:w-72 lg:border-l lg:border-t-0 lg:p-4 xl:w-80 backdrop-blur-md">
          <TurnInfo state={state} currentPlayer={currentPlayer} />
          <PlayerList players={state.players} />
          <PlayerHand player={currentPlayer} />
          <ActionLog state={state} />
        </aside>
      </div>

      {/* Modal panels */}
      <AnimatePresence>
        {state.panel.type !== "none" && (
          <GamePanel
            panel={state.panel}
            state={state}
            onBuyCard={(pid, cid) => dispatch({ type: "buy-card", playerId: pid, cardId: cid })}
            onAnswerTrivia={(pid, tid, oid) => dispatch({ type: "answer-trivia", playerId: pid, triviaCardId: tid, selectedOptionId: oid })}
            onResolveMission={(pid) => dispatch({ type: "resolve-mission", playerId: pid, value: rng6() })}
            onContinueEvent={() => dispatch({ type: "continue-event" })}
            onAdvanceTurn={() => dispatch({ type: "advance-turn" })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.phase === "final-recap" && (
          <FinalRecap state={state} onRestart={() => dispatch({ type: "restart-game" })} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRulesOpen && (
          <RulesModal onClose={() => setIsRulesOpen(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── Board Map ────────────────────────────────────────────────────────────────

function BoardMap({
  state,
  playerVisualPositions,
  rolling,
  val1,
  val2,
  canRoll,
  onRoll,
}: {
  state: BoardGameState;
  playerVisualPositions: Record<string, number>;
  rolling: boolean;
  val1: DiceValue;
  val2: DiceValue;
  canRoll: boolean;
  onRoll: () => void;
}) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const [hoveredTile, setHoveredTile] = useState<BoardGameTile | null>(null);

  return (
    <div
      className="relative aspect-square w-full max-w-[min(90vw,680px)] overflow-hidden rounded-[24px] border border-purple-700/15 bg-white/80 backdrop-blur-md shadow-[0_32px_80px_rgba(47,23,110,0.12)] p-2.5"
    >
      {/* 7×8 grid of tiles */}
      <div className="grid h-full w-full grid-cols-7 grid-rows-8 gap-1.5 sm:gap-2">
        {boardGameTiles.map((tile) => {
          const gp = tileGridPos(tile.position);
          
          // Use current visual position for layout walks
          const playersOnTile = state.players.map(p => ({
            ...p,
            position: playerVisualPositions[p.id] ?? p.position
          })).filter((p) => p.position === tile.position);
          
          const isActive = currentPlayer ? currentPlayer.position === tile.position : false;
          return (
            <Tile
              key={tile.id}
              tile={tile}
              players={playersOnTile}
              isActive={isActive}
              col={gp.col}
              row={gp.row}
              onHover={setHoveredTile}
            />
          );
        })}
      </div>

      {/* Center panel with dice + status + dynamic hovered tile details */}
      <div className="absolute left-[15.5%] right-[15.5%] top-[13.5%] bottom-[13.5%] flex flex-col items-center justify-center rounded-[20px] border border-purple-700/15 bg-white/98 backdrop-blur-md shadow-lg p-4 transition-all duration-300">
        <AnimatePresence mode="wait">
          {hoveredTile ? (
            <motion.div
              key={`hover-${hoveredTile.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="text-center flex flex-col items-center justify-center h-full w-full"
            >
              <span className={`p-2.5 rounded-2xl shadow-sm ${getTypeStyles(hoveredTile.type).bg} ${getTypeStyles(hoveredTile.type).textColor} mb-2`}>
                {tileIcon(hoveredTile.iconName, "h-5 w-5 sm:h-7 sm:w-7")}
              </span>
              <h3 className="font-heading text-xs sm:text-base font-black text-purple-900 leading-tight truncate max-w-full">
                {hoveredTile.name}
              </h3>
              <span className="text-[7px] sm:text-[9px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full mt-1 border border-teal-100 tracking-wider">
                {hoveredTile.zone.replace("-", " ")} · {hoveredTile.type.replace("-", " ")}
              </span>
              <p className="text-[9px] sm:text-xs text-ink-700 font-semibold leading-normal mt-2 max-w-[95%] text-pretty">
                {hoveredTile.description}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="game-status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="text-center flex flex-col items-center justify-center h-full w-full gap-2"
            >
              {/* Current Player Banner */}
              {currentPlayer && (
                <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 shadow-sm mb-1">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${tokenBg(currentPlayer.tokenColor)} animate-pulse`} />
                  <span className="text-[9px] font-black text-purple-800 tracking-wide uppercase">
                    {currentPlayer.displayName}
                  </span>
                </div>
              )}

              {/* Dice */}
              <div className="flex gap-3 justify-center items-center">
                <DiceBlock value={val1} rolling={rolling} delay={0} />
              </div>

              {/* Roll button */}
              <button
                type="button"
                disabled={!canRoll}
                onClick={onRoll}
                className="mt-1 rounded-full bg-purple-900 px-6 py-2 text-xs font-black text-white shadow-[0_4px_0_#20104f] transition hover:bg-purple-800 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:bg-purple-100 disabled:text-purple-300 disabled:shadow-none cursor-pointer"
              >
                {rolling ? "Menggelinding…" : "Lempar Dadu"}
              </button>

             

              <p className="text-[7px] sm:text-[9px] font-bold text-ink-400 mt-1 uppercase tracking-wider hidden sm:block">
                Sorot petak untuk detail info
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 3D Dice Block ────────────────────────────────────────────────────────────

function DiceBlock({ value, rolling, delay }: { value: DiceValue; rolling: boolean; delay: number }) {
  return (
    <motion.div
      animate={
        rolling
          ? { rotate: [0, 20, -20, 15, -15, 8, -8, 0], y: [0, -8, 0, -5, 0], scale: [1, 1.15, 0.95, 1.1, 1] }
          : { rotate: 0, y: 0, scale: 1 }
      }
      transition={{ duration: 0.7, delay, ease: "easeInOut" }}
      className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-purple-200 bg-white shadow-[0_4px_0_rgba(47,23,110,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] sm:h-14 sm:w-14"
      style={{ color: "#2f176e" }}
    >
      {renderDice(value, "h-8 w-8 sm:h-10 sm:w-10")}
    </motion.div>
  );
}

// ─── Single Tile ──────────────────────────────────────────────────────────────

function Tile({
  tile,
  players,
  isActive,
  col,
  row,
  onHover,
}: {
  tile: BoardGameTile;
  players: BoardGamePlayer[];
  isActive: boolean;
  col: number;
  row: number;
  onHover: (tile: BoardGameTile | null) => void;
}) {
  const styles = getTypeStyles(tile.type);

  return (
    <div
      onMouseEnter={() => onHover(tile)}
      onMouseLeave={() => onHover(null)}
      className={`group relative flex min-h-0 min-w-0 flex-col justify-between p-1 overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer select-none
        ${styles.bg} ${styles.border} ${isActive ? "ring-2 ring-purple-650 ring-offset-2 scale-[1.02] z-10 shadow-md" : "hover:scale-[1.03] hover:z-10 hover:shadow-sm"}
      `}
      style={{ gridColumn: col, gridRow: row }}
    >
      {/* Position and Zone Badge */}
      <div className="flex items-center justify-between w-full">
        <span className={`flex h-3.5 w-3.5 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[7px] sm:text-xs font-black shadow-inner ${styles.badgeBg} ${styles.badgeText}`}>
          {tile.position}
        </span>
        <span className="text-[6px] sm:text-[8px] font-black uppercase opacity-60 tracking-wider hidden sm:inline">
          {tile.zone === "pesisir" && "🌊"}
          {tile.zone === "sungai-kota" && "🏢"}
          {tile.zone === "gunung-hutan" && "🌲"}
          {tile.zone === "desa-kearifan" && "🏡"}
        </span>
      </div>

      {/* Icon and short name centered */}
      <div className="flex flex-1 flex-col items-center justify-center py-0.5">
        <span className={`transition-transform duration-200 group-hover:scale-105 ${styles.iconColor}`}>
          {tileIcon(tile.iconName, "h-3.5 w-3.5 sm:h-5 sm:w-5")}
        </span>
        
        {/* Shortened Label */}
        <span className={`text-[6px] sm:text-[8px] font-black uppercase mt-0.5 leading-tight text-center tracking-wide block max-w-full truncate px-0.5 ${styles.textColor}`}>
          {getTileShortName(tile)}
        </span>
      </div>

      {/* Tokens Container */}
      <div className="min-h-5 w-full flex items-center justify-center mt-auto">
        {players.length > 0 && (
          <div className="flex -space-x-1 hover:-space-x-0.5 transition-all duration-250 justify-center">
            {players.map((p) => (
              <motion.div
                key={p.id}
                layoutId={`tok-${p.id}`}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border border-white flex items-center justify-center font-heading text-[8px] sm:text-[10px] font-black text-white shadow-[0_1.5px_3px_rgba(0,0,0,0.15)] cursor-help shrink-0 ${tokenBg(p.tokenColor)}`}
                title={p.displayName}
              >
                {p.displayName.charAt(0).toUpperCase()}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar: Turn Info ───────────────────────────────────────────────────────

function TurnInfo({ state, currentPlayer }: { state: BoardGameState; currentPlayer?: BoardGamePlayer }) {
  return (
    <div className="rounded-2xl border border-purple-700/8 bg-white/80 p-3 shadow-sm">
      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-ink-400">Giliran</p>
      <div className="flex items-center justify-between gap-2">
        <p className="font-heading text-lg font-black text-ink-900">{currentPlayer?.displayName ?? "—"}</p>
        {currentPlayer && (
          <span className={`h-9 w-9 rounded-xl border-2 border-white shadow-sm flex items-center justify-center font-heading text-sm font-black text-white ${tokenBg(currentPlayer.tokenColor)}`}>
            {currentPlayer.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
        {[
          { label: "Petak", val: currentPlayer?.position ?? "—" },
          { label: "Koin", val: currentPlayer?.coins ?? "—" },
          { label: "Kartu", val: currentPlayer?.cardIds.length ?? "—" },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-xl bg-cream-50 border border-purple-700/5 py-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-ink-400">{label}</p>
            <p className="font-heading text-base font-black text-ink-900">{val}</p>
          </div>
        ))}
      </div>
      {state.activeEvent && (
        <div className="mt-2.5 rounded-xl border border-coral-200 bg-coral-50 p-2.5">
          <p className="text-[9px] font-black uppercase tracking-wider text-coral-700">Event aktif</p>
          <p className="mt-0.5 text-xs font-black text-ink-900">{state.activeEvent.title}</p>
          <p className="text-[10px] font-bold text-ink-700">Sisa {state.eventCountdown} giliran</p>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar: Player List ─────────────────────────────────────────────────────

function PlayerList({ players }: { players: BoardGamePlayer[] }) {
  return (
    <div className="rounded-2xl border border-purple-700/8 bg-white/80 p-3 shadow-sm">
      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-ink-400">Pemain</p>
      <div className="space-y-1.5">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-xl bg-cream-50 border border-purple-700/5 px-2.5 py-2">
            <span className={`h-6 w-6 shrink-0 rounded-full border border-white shadow-sm flex items-center justify-center font-heading text-[10px] font-black text-white ${tokenBg(p.tokenColor)}`}>
              {p.displayName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-ink-900">{p.displayName}</p>
              <p className="text-[9px] font-bold text-ink-400">#{p.position} · {statusLabel(p.status)}</p>
            </div>
            <span className="text-xs font-black text-yellow-750">{p.coins} Koin</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar: Player Hand ─────────────────────────────────────────────────────

function PlayerHand({ player }: { player?: BoardGamePlayer }) {
  if (!player || player.cardIds.length === 0) return null;
  return (
    <div className="rounded-2xl border border-purple-700/8 bg-white/80 p-3 shadow-sm">
      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-ink-400">Kartu {player.displayName}</p>
      <div className="grid gap-1 sm:grid-cols-2">
        {player.cardIds.map((cid, i) => {
          const card = getMitigationCard(cid);
          return (
            <div key={`${cid}-${i}`} className="flex items-center gap-1.5 rounded-xl border border-purple-700/5 bg-cream-50 px-2 py-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                {mitigationIcon(card.iconName, "h-3 w-3")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black text-ink-900">{card.shortName}</p>
                <p className="text-[8px] font-bold text-teal-700">{getProtectedDisasterLabels(card)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sidebar: Action Log ──────────────────────────────────────────────────────

function ActionLog({ state }: { state: BoardGameState }) {
  const logs = state.actionLog.slice(0, 5);
  if (logs.length === 0) return null;
  return (
    <div className="rounded-2xl border border-purple-700/8 bg-white/80 p-3 shadow-sm">
      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-ink-400">Log</p>
      <div className="space-y-1.5">
        {logs.map((item, i) => (
          <div key={item.id} className={`rounded-lg p-2 border border-purple-700/5 ${i === 0 ? "bg-purple-50" : "bg-cream-50"}`}>
            <p className="text-[10px] font-black text-ink-900">{item.label}</p>
            <p className="text-[9px] font-semibold leading-4 text-ink-700">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function getPlayerColor(index: number): BoardGameTokenColor {
  const colors: BoardGameTokenColor[] = ["purple", "teal", "coral", "yellow", "sky", "peach"];
  return colors[index % colors.length];
}

function SetupScreen({
  playerCount,
  mode,
  playerNames,
  onChangePlayerCount,
  onChangeMode,
  onChangePlayerNames,
  onStart,
}: {
  playerCount: PlayerCount;
  mode: BoardGameMode;
  playerNames: string[];
  onChangePlayerCount: (c: PlayerCount) => void;
  onChangeMode: (m: BoardGameMode) => void;
  onChangePlayerNames: (names: string[]) => void;
  onStart: () => void;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream-50 px-4 pb-16 pt-6 text-ink-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(124,58,237,0.06),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(34,185,154,0.04),transparent_55%)]" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Link
            href="/siswa/games"
            className="inline-flex items-center gap-2 rounded-full border border-purple-700/10 bg-white/50 px-4 py-2 text-sm font-black text-purple-700 hover:bg-purple-50 transition"
          >
            <Gamepad2 className="h-4 w-4" />
            Games Smong
          </Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">Board Game Kesiapsiagaan</p>
            <h1 className="mt-2 font-heading text-5xl font-black leading-[0.92] text-ink-900 sm:text-6xl lg:text-7xl">
              Jelajahi<br />Papan Siaga<br />
              <span className="text-purple-700">Nusantara</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-ink-700">
              Kumpulkan Koin, pilih kartu mitigasi, jawab trivia, lalu hadapi event bencana dengan strategi.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "40 Petak", sub: "Pesisir, sungai, gunung, hutan" },
              { label: "8 Kartu", sub: "Mangrove sampai Early Warning" },
              { label: "4 Bencana", sub: "Tsunami, Gempa, Banjir, Cuaca" },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-2xl border border-purple-700/10 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
                <p className="font-heading text-lg font-black text-ink-900">{label}</p>
                <p className="mt-1 text-xs font-semibold text-ink-700">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-purple-700/10 bg-white/80 p-5 backdrop-blur-xl shadow-md space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-purple-100">
              <Image src="/assets/mascot/mascot-smong.png" alt="Smong" width={64} height={64} className="h-full w-full object-contain p-1.5" priority />
            </div>
            <div>
              <p className="font-heading text-xl font-black text-ink-900">Siapkan sesi</p>
              <p className="text-xs font-bold text-ink-700">Pilih pemain dan mode bencana.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Player count selector */}
            <fieldset>
              <legend className="mb-2 text-xs font-black text-ink-700/60 uppercase tracking-wider">Jumlah pemain</legend>
              <div className="grid grid-cols-5 gap-2">
                {([2, 3, 4, 5, 6] satisfies PlayerCount[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChangePlayerCount(c)}
                    className={`min-h-11 rounded-xl border text-sm font-black transition ${
                      playerCount === c
                        ? "border-purple-900 bg-purple-700 text-white shadow-[0_4px_0_#2f176e]"
                        : "border-purple-700/10 bg-white/50 text-ink-700 hover:bg-purple-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Custom player names inputs */}
            <div className="space-y-2.5">
              <p className="text-xs font-black text-ink-700/60 uppercase tracking-wider">Nama Pemain</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`h-6 w-6 rounded-lg border border-purple-700/10 shrink-0 ${tokenBg(getPlayerColor(i))}`} />
                    <input
                      type="text"
                      value={playerNames[i] || ""}
                      onChange={(e) => {
                        const next = [...playerNames];
                        next[i] = e.target.value;
                        onChangePlayerNames(next);
                      }}
                      placeholder={`Pemain ${i + 1}`}
                      className="flex-1 min-h-10 px-3 py-1 text-sm font-black rounded-xl border border-purple-700/10 bg-white/70 text-ink-900 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-ink-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mode selector */}
            <fieldset>
              <legend className="mb-2 text-xs font-black text-ink-700/60 uppercase tracking-wider">Mode bencana</legend>
              <div className="space-y-1.5">
                {getModeOpts().map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeMode(opt.id)}
                    className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-4 text-left transition ${
                      mode === opt.id
                        ? "border-purple-700 bg-purple-100 text-purple-900"
                        : "border-purple-700/10 bg-white/50 text-ink-700 hover:bg-purple-50"
                    }`}
                  >
                    <span className="text-sm font-black">{opt.label}</span>
                    <span className="text-xs text-ink-400">{opt.helper}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={onStart}
              className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-purple-700 font-heading text-base font-black text-white shadow-[0_6px_0_#2f176e] transition hover:bg-purple-600 active:translate-y-1 active:shadow-none cursor-pointer"
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

// ─── Game Panel (modal) ───────────────────────────────────────────────────────

function GamePanel({
  panel, state, onBuyCard, onAnswerTrivia, onResolveMission, onContinueEvent, onAdvanceTurn,
}: {
  panel: Exclude<BoardGamePanel, { type: "none" }>;
  state: BoardGameState;
  onBuyCard: (pid: string, cid: MitigationCardId) => void;
  onAnswerTrivia: (pid: string, tid: string, oid: string) => void;
  onResolveMission: (pid: string) => void;
  onContinueEvent: () => void;
  onAdvanceTurn: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end bg-purple-900/20 p-3 backdrop-blur-md sm:items-center sm:justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="max-h-[90vh] w-full overflow-y-auto rounded-[2rem] border border-purple-700/10 bg-white p-4 shadow-[0_30px_80px_rgba(47,23,110,0.15)] sm:max-w-xl sm:p-6 text-ink-900"
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-heading text-xl font-black text-ink-900">{panelTitle(panel)}</p>
          {panel.type !== "event" && (
            <button
              type="button"
              onClick={onAdvanceTurn}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {panel.type === "market" && <MarketPanel state={state} playerId={panel.playerId} onBuyCard={onBuyCard} onDone={onAdvanceTurn} />}
        {panel.type === "trivia" && <TriviaPanel panel={panel} onAnswer={onAnswerTrivia} onDone={onAdvanceTurn} />}
        {panel.type === "event" && <EventPanel panel={panel} onContinue={onContinueEvent} />}
        {panel.type === "mission" && <MissionPanel panel={panel} onResolve={onResolveMission} onDone={onAdvanceTurn} />}
        {panel.type === "story" && <StoryPanel panel={panel} onDone={onAdvanceTurn} />}
      </motion.section>
    </motion.div>
  );
}

function MarketPanel({ state, playerId, onBuyCard, onDone }: {
  state: BoardGameState; playerId: string;
  onBuyCard: (pid: string, cid: MitigationCardId) => void; onDone: () => void;
}) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-ink-700">Koin Kamu: <span className="font-black text-yellow-600">{player.coins} Koin</span></p>
      <div className="grid gap-2 sm:grid-cols-2">
        {mitigationCards.map((card) => {
          const ok = player.coins >= card.price && canReceiveCard(player, card);
          return (
            <div key={card.id} className="rounded-xl border border-purple-700/10 bg-cream-50/50 p-3">
              <div className="mb-2 flex items-start gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 shadow-sm">
                  {mitigationIcon(card.iconName, "h-4 w-4")}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-ink-900">{card.name}</p>
                  <p className="text-[10px] font-bold text-teal-700">{getProtectedDisasterLabels(card)}</p>
                </div>
              </div>
              <p className="mb-2 text-xs text-ink-700">{card.description}</p>
              <button
                type="button"
                disabled={!ok}
                onClick={() => onBuyCard(playerId, card.id)}
                className="flex min-h-9 w-full items-center justify-center gap-1 rounded-full bg-purple-700 text-xs font-black text-white shadow-[0_3px_0_#20104f] transition hover:bg-purple-650 disabled:bg-purple-100 disabled:text-purple-300 disabled:shadow-none"
              >
                <Store className="h-3.5 w-3.5" /> Beli {card.price} Koin
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={onDone} className="flex min-h-10 w-full items-center justify-center rounded-full bg-teal-650 text-sm font-black text-white shadow-[0_3px_0_#147864] hover:bg-teal-600">
        Selesai Belanja
      </button>
    </div>
  );
}

function TriviaPanel({ panel, onAnswer, onDone }: {
  panel: Extract<BoardGamePanel, { type: "trivia" }>;
  onAnswer: (pid: string, tid: string, oid: string) => void;
  onDone: () => void;
}) {
  const sel = panel.selectedOptionId ? panel.triviaCard.options.find((o) => o.id === panel.selectedOptionId) : undefined;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-purple-700/10 bg-cream-50 p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-teal-700">Pertanyaan</p>
        <h2 className="mt-1.5 font-heading text-xl font-black leading-tight text-ink-900">{panel.triviaCard.question}</h2>
      </div>
      <div className="grid gap-2">
        {panel.triviaCard.options.map((opt) => {
          const isSel = panel.selectedOptionId === opt.id;
          const isCorr = opt.id === panel.triviaCard.correctOptionId;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={Boolean(panel.selectedOptionId)}
              onClick={() => onAnswer(panel.playerId, panel.triviaCard.id, opt.id)}
              className={`min-h-11 rounded-xl border px-4 text-left text-sm font-black transition ${
                isSel ? (isCorr ? "border-teal-500 bg-teal-50 text-teal-700" : "border-coral-500 bg-coral-50 text-coral-700")
                : "border-purple-700/10 bg-white text-ink-900 hover:bg-purple-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {sel && (
        <div className="rounded-xl border border-purple-700/10 bg-cream-50 p-4">
          <p className={`font-heading text-lg font-black ${panel.isCorrect ? "text-teal-700" : "text-coral-700"}`}>
            {panel.isCorrect ? "✓ Benar! +3 Koin" : "✗ Kurang Tepat, tetap dapat +1 Koin"}
          </p>
          <p className="mt-1 text-sm text-ink-750">{sel.feedback}</p>
          <p className="mt-1 text-sm font-bold text-ink-900">{panel.triviaCard.explanation}</p>
          <button type="button" onClick={onDone} className="mt-3 flex min-h-10 w-full items-center justify-center rounded-full bg-purple-700 text-sm font-black text-white shadow-[0_3px_0_#20104f] hover:bg-purple-650">
            Lanjutkan
          </button>
        </div>
      )}
    </div>
  );
}

function EventPanel({ panel, onContinue }: {
  panel: Extract<BoardGamePanel, { type: "event" }>; onContinue: () => void;
}) {
  const ev = panel.eventCard;
  return (
    <div className="space-y-3">
      <div className={`rounded-xl border p-4 ${eventTone(ev.disasterId)}`}>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{getDisasterLabel(ev.disasterId)}</p>
        <h2 className="mt-1.5 font-heading text-2xl font-black text-ink-900">{ev.title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-ink-850">{ev.factSummary}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-cream-50 border border-purple-700/5 p-3">
          <p className="text-[9px] font-black text-ink-400">Waktu evakuasi</p>
          <p className="font-heading text-2xl font-black text-ink-900">{ev.giliranEvakuasi} giliran</p>
        </div>
        <div className="rounded-xl bg-cream-50 border border-purple-700/5 p-3">
          <p className="text-[9px] font-black text-ink-400">Kartu yang membantu</p>
          <p className="mt-1 text-xs font-black text-teal-700">
            {[...ev.protectionCardIds, ...ev.bonusCardIds].map((c) => getMitigationCard(c).shortName).join(", ")}
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-cream-50 border border-purple-700/5 p-3">
        <p className="text-[9px] font-black text-ink-400">Pelajaran</p>
        <p className="mt-1 text-sm font-semibold text-ink-750">{ev.learningInsight}</p>
      </div>
      <button type="button" onClick={onContinue} className="flex min-h-11 w-full items-center justify-center rounded-full bg-coral-600 text-sm font-black text-white shadow-[0_3px_0_#991b1b] hover:bg-coral-550 transition">
        Mulai Evakuasi
      </button>
    </div>
  );
}

function MissionPanel({ panel, onResolve, onDone }: {
  panel: Extract<BoardGamePanel, { type: "mission" }>; onResolve: (pid: string) => void; onDone: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-purple-700/10 bg-cream-50 p-4">
        <p className="text-sm font-semibold text-ink-700">Lempar dadu misi. Hasil 4–6 membantu pemain maju ekstra.</p>
      </div>
      {panel.missionRoll && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 text-center">
          <p className="text-xs font-black text-teal-700">Hasil</p>
          <p className="font-heading text-5xl font-black text-teal-800">{panel.missionRoll}</p>
          <p className="text-sm text-teal-700 font-bold">{panel.didMove ? "Pemain maju!" : "Pemain tetap di posisi."}</p>
        </div>
      )}
      <button
        type="button"
        onClick={panel.missionRoll ? onDone : () => onResolve(panel.playerId)}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-700 text-sm font-black text-white shadow-[0_3px_0_#20104f] hover:bg-purple-650 transition"
      >
        <Dice5 className="h-4 w-4" />
        {panel.missionRoll ? "Lanjutkan" : "Lempar Dadu Misi"}
      </button>
    </div>
  );
}

function StoryPanel({ panel, onDone }: {
  panel: Extract<BoardGamePanel, { type: "story" }>; onDone: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-purple-100 shadow-sm border border-purple-200">
          <Image src="/assets/mascot/mascot-smong.png" alt="Smong" width={80} height={80} className="h-full w-full object-contain p-2" />
        </div>
        <div className="rounded-xl border border-purple-700/10 bg-cream-50 p-4 flex-1">
          <h2 className="font-heading text-lg font-black text-ink-900">{panel.title}</h2>
          <p className="mt-1 text-sm font-semibold text-ink-700">{panel.body}</p>
        </div>
      </div>
      <button type="button" onClick={onDone} className="flex min-h-11 w-full items-center justify-center rounded-full bg-purple-700 text-sm font-black text-white shadow-[0_3px_0_#20104f] hover:bg-purple-650 transition">
        Lanjutkan
      </button>
    </div>
  );
}

// ─── Final Recap ──────────────────────────────────────────────────────────────

function FinalRecap({ state, onRestart }: { state: BoardGameState; onRestart: () => void }) {
  const board = useMemo(() => sortPlayersForLeaderboard(state.players), [state.players]);
  const lastEvent = state.eventHistory[state.eventHistory.length - 1];

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto bg-cream-50/95 p-4 backdrop-blur-md text-ink-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <section className="mx-auto max-w-3xl space-y-4 py-8">
        <div className="rounded-[2rem] border border-purple-700/10 bg-white p-6 text-center shadow-sm">
          <Award className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
          <p className="text-[9px] font-black uppercase tracking-widest text-teal-700">Recap</p>
          <h2 className="mt-1.5 font-heading text-4xl font-black text-ink-900">Misi Siaga Selesai</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-700">Bahas pilihan yang membantu pemain selamat, lalu coba sesi baru.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
          <div className="rounded-[2rem] border border-purple-700/10 bg-white p-5 shadow-sm">
            <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-ink-400">Leaderboard</p>
            <div className="space-y-2">
              {board.map((p, i) => (
                <div key={p.id} className="flex min-h-12 items-center gap-3 rounded-xl bg-cream-50 border border-purple-700/5 px-3">
                  <span className="font-heading text-xl font-black text-ink-400">{i + 1}</span>
                  <span className={`h-8 w-8 rounded-xl border border-white shadow-sm shrink-0 ${tokenBg(p.tokenColor)}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-ink-900">{p.displayName}</p>
                    <p className="text-[9px] font-bold text-ink-500">{statusLabel(p.status)} · {p.coins} Koin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {lastEvent && (
              <div className="rounded-[2rem] border border-purple-700/10 bg-white p-4 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-ink-400">Event</p>
                <p className="mt-1.5 font-heading text-lg font-black text-ink-900">{lastEvent.title}</p>
                <p className="mt-1 text-xs text-ink-700">{lastEvent.learningInsight}</p>
              </div>
            )}
            <div className="rounded-[2rem] border border-teal-200 bg-teal-50 p-4 shadow-sm text-teal-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-teal-700">Diskusi guru</p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed">
                {state.winnerSummary?.discussionPrompt ?? "Apa tindakan aman yang bisa kita latih bersama?"}
              </p>
            </div>
            <button type="button" onClick={onRestart} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-700 font-heading text-sm font-black text-white shadow-[0_4px_0_#20104f] hover:bg-purple-650 transition">
              <RefreshCcw className="h-4 w-4" /> Main Lagi
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function rng6(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

function getModeOpts() {
  return [
    { id: "random" as BoardGameMode, label: "Random", helper: "Semua bencana" },
    { id: "gempa-bumi" as BoardGameMode, label: "Gempa Bumi", helper: "Drop Cover" },
    { id: "tsunami" as BoardGameMode, label: "Tsunami", helper: "Tempat tinggi" },
    { id: "banjir" as BoardGameMode, label: "Banjir", helper: "Air naik" },
    { id: "cuaca-ekstrem" as BoardGameMode, label: "Cuaca Ekstrem", helper: "Angin & hujan" },
  ];
}

function getModeLabel(mode: BoardGameMode) {
  if (mode === "random") return "Random";
  return getDisasterLabel(mode);
}

function tileGridPos(pos: number) {
  if (pos <= 7) return { col: pos, row: 8 };
  if (pos <= 14) return { col: 7, row: 15 - pos };
  if (pos <= 20) return { col: 21 - pos, row: 1 };
  return { col: 1, row: pos - 19 };
}

function tileColors(tile: BoardGameTile): string {
  if (tile.type === "start")          return "border-purple-350 bg-purple-100 text-purple-800 shadow-sm font-black";
  if (tile.type === "event")          return "border-coral-200 bg-coral-50/90 text-coral-800 font-black";
  if (tile.type === "safe-zone")      return "border-teal-200 bg-teal-50/90 text-teal-800 font-black";
  if (tile.type === "trivia")         return "border-sky-200 bg-sky-50/90 text-sky-850 font-black";
  if (tile.type === "market")         return "border-yellow-300 bg-yellow-50/90 text-yellow-800 font-black";
  if (tile.type === "mission")        return "border-peach-300 bg-peach-50/90 text-peach-800 font-black";
  if (tile.type === "free-mitigation") return "border-purple-200 bg-purple-50/90 text-purple-850 font-black";
  if (tile.type === "special-story")  return "border-teal-200 bg-teal-50/90 text-teal-850 font-black";
  return "border-purple-700/5 bg-white/40 text-ink-400";
}

function tokenBg(color: BoardGameTokenColor): string {
  if (color === "purple") return "bg-purple-600";
  if (color === "teal")   return "bg-teal-500";
  if (color === "coral")  return "bg-coral-500";
  if (color === "yellow") return "bg-yellow-500";
  if (color === "sky")    return "bg-sky-400";
  return "bg-peach-400";
}

function statusLabel(s: BoardGamePlayer["status"]): string {
  if (s === "selamat")    return "Selamat ✓";
  if (s === "tersingkir") return "Perlu evaluasi";
  return "Aktif";
}

function panelTitle(panel: Exclude<BoardGamePanel, { type: "none" }>): string {
  if (panel.type === "market")  return "🛒 Market Kartu";
  if (panel.type === "trivia")  return "❓ ASK ME";
  if (panel.type === "event")   return "⚠️ WATCH YOUR STEP";
  if (panel.type === "mission") return "🤝 Misi Komunitas";
  return "🌊 Cerita Smong";
}

function eventTone(id: BoardGameDisasterId): string {
  if (id === "tsunami")      return "border-sky-200 bg-sky-50 text-sky-900";
  if (id === "gempa-bumi")   return "border-peach-200 bg-peach-50 text-peach-900";
  if (id === "banjir")       return "border-teal-200 bg-teal-50 text-teal-900";
  return "border-coral-200 bg-coral-50 text-coral-900";
}

function renderDice(v: DiceValue, cls: string) {
  if (v === 1) return <Dice1 className={cls} />;
  if (v === 2) return <Dice2 className={cls} />;
  if (v === 3) return <Dice3 className={cls} />;
  if (v === 4) return <Dice4 className={cls} />;
  if (v === 5) return <Dice5 className={cls} />;
  return <Dice6 className={cls} />;
}

function tileIcon(name: BoardGameTileIconName, cls: string) {
  if (name === "Flag")           return <Flag className={cls} />;
  if (name === "ShieldCheck")    return <ShieldCheck className={cls} />;
  if (name === "TriangleAlert")  return <TriangleAlert className={cls} />;
  if (name === "CircleHelp")     return <CircleHelp className={cls} />;
  if (name === "Store")          return <Store className={cls} />;
  if (name === "HeartHandshake") return <HeartHandshake className={cls} />;
  if (name === "ShieldPlus")     return <ShieldPlus className={cls} />;
  if (name === "Waves")          return <Waves className={cls} />;
  return <MapPin className={cls} />;
}

function getTileShortName(tile: BoardGameTile): string {
  if (tile.type === "start") return "START";
  if (tile.type === "safe-zone") return "SAFE";
  if (tile.type === "event") return "BAHAYA";
  if (tile.type === "trivia") return "TRIVIA";
  if (tile.type === "market") return "MARKET";
  if (tile.type === "mission") return "MISI";
  if (tile.type === "free-mitigation") {
    if (tile.mitigationCardId === "mangrove") return "MANGROVE";
    if (tile.mitigationCardId === "tanggul") return "TANGGUL";
    if (tile.mitigationCardId === "bangunan-tahan-gempa") return "RT GEMPA";
    if (tile.mitigationCardId === "early-warning") return "EARLY WARN";
    return "MITIGASI";
  }
  if (tile.type === "special-story") return "CERITA";
  return "JALUR";
}

function getTypeStyles(type: BoardGameTile["type"]) {
  switch (type) {
    case "start":
      return {
        bg: "bg-purple-100 hover:bg-purple-200/90",
        border: "border-purple-300",
        badgeBg: "bg-purple-600",
        badgeText: "text-white",
        iconColor: "text-purple-700",
        textColor: "text-purple-800",
      };
    case "safe-zone":
      return {
        bg: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100/30",
        border: "border-teal-500",
        badgeBg: "bg-white",
        badgeText: "text-teal-700",
        iconColor: "text-white",
        textColor: "text-white",
      };
    case "event":
      return {
        bg: "bg-coral-50 hover:bg-coral-100/95",
        border: "border-coral-300",
        badgeBg: "bg-coral-600",
        badgeText: "text-white",
        iconColor: "text-coral-600",
        textColor: "text-coral-700",
      };
    case "trivia":
      return {
        bg: "bg-sky-50 hover:bg-sky-100/95",
        border: "border-sky-300",
        badgeBg: "bg-sky-600",
        badgeText: "text-white",
        iconColor: "text-sky-600",
        textColor: "text-sky-700",
      };
    case "market":
      return {
        bg: "bg-yellow-50 hover:bg-yellow-100/95",
        border: "border-yellow-300",
        badgeBg: "bg-yellow-500",
        badgeText: "text-white",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-850",
      };
    case "mission":
      return {
        bg: "bg-peach-100 hover:bg-peach-200/95",
        border: "border-peach-350",
        badgeBg: "bg-peach-500",
        badgeText: "text-white",
        iconColor: "text-peach-600",
        textColor: "text-peach-850",
      };
    case "free-mitigation":
      return {
        bg: "bg-lavender-100 hover:bg-lavender-200/95",
        border: "border-lavender-350",
        badgeBg: "bg-purple-500",
        badgeText: "text-white",
        iconColor: "text-purple-650",
        textColor: "text-purple-850",
      };
    case "special-story":
      return {
        bg: "bg-mint-100 hover:bg-mint-200/95",
        border: "border-teal-200",
        badgeBg: "bg-teal-600",
        badgeText: "text-white",
        iconColor: "text-teal-650",
        textColor: "text-teal-800",
      };
    default:
      return {
        bg: "bg-white/60 hover:bg-white/80",
        border: "border-purple-200/40",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-700",
        iconColor: "text-purple-300",
        textColor: "text-purple-400",
      };
  }
}

function mitigationIcon(name: MitigationCardIconName, cls: string) {
  if (name === "Leaf")         return <Leaf className={cls} />;
  if (name === "Construction") return <Construction className={cls} />;
  if (name === "Route")        return <Route className={cls} />;
  if (name === "Radio")        return <Radio className={cls} />;
  if (name === "HardHat")      return <HardHat className={cls} />;
  if (name === "House")        return <House className={cls} />;
  if (name === "Trees")        return <Trees className={cls} />;
  return <Droplets className={cls} />;
}

// ─── Rules and Icons Guide Popup Modal ───────────────────────────────────────

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-purple-900/20 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-purple-700/10 bg-white p-6 shadow-[0_30px_80px_rgba(47,23,110,0.15)] text-ink-900"
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <CircleHelp className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-black leading-none text-ink-900">Panduan & Aturan Bermain</h2>
              <p className="text-xs text-ink-500 font-bold mt-1 font-sans">Pelajari cara bermain dan arti petak papan SMONG</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Cara Bermain */}
          <div>
            <h3 className="font-heading text-lg font-black text-purple-700 mb-2">🎮 Cara Bermain</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-ink-700 font-semibold leading-relaxed font-sans">
              <li>Pemain bergantian melemparkan dadu untuk memutari papan 25 petak.</li>
              <li>Kumpulkan <strong>Koin</strong> dengan melewati petak <strong>START (+2 Koin)</strong> atau menjawab trivia kesiapsiagaan di petak <strong>ASK ME!</strong>.</li>
              <li>Gunakan koin di petak <strong>MARKET</strong> untuk membeli <strong>Kartu Mitigasi</strong> yang melindungi dari bencana.</li>
              <li>Di <strong>putaran pertama</strong>, event bencana belum aktif agar pemain bisa bersiap-siap.</li>
              <li>Mulai putaran kedua, jika ada pemain mendarat di petak <strong>WATCH YOUR STEP</strong>, bencana alam akan terjadi!</li>
              <li>Semua pemain harus segera mengungsi ke <strong>ESCAPE BUILDING</strong> sebelum waktu evakuasi habis, kecuali jika memiliki kartu mitigasi pelindung penuh yang sesuai.</li>
              <li>Jika ada lebih dari satu pemain yang selamat, permainan dilanjutkan kembali di papan sampai tersisa <strong>hanya satu pemenang utama</strong>!</li>
            </ol>
          </div>

          {/* Arti Petak & Simbol */}
          <div>
            <h3 className="font-heading text-lg font-black text-purple-700 mb-2">🗺️ Arti Petak & Simbol Papan</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: "🚩", type: "START", desc: "Petak awal. Setiap melewatinya mendapat bonus 2 Koin." },
                { icon: "❓", type: "ASK ME!", desc: "Pertanyaan trivia. Benar mendapat +3 Koin, salah mendapat +1 Koin." },
                { icon: "🛒", type: "MARKET", desc: "Toko mitigasi. Beli kartu dengan koin untuk persiapan menghadapi bencana." },
                { icon: "🛡️", type: "ESCAPE BUILDING", desc: "Zona aman. Pemain yang berada di sini otomatis selamat dari bencana aktif." },
                { icon: "⚠️", type: "WATCH YOUR STEP", desc: "Petak bahaya. Membuka kartu event bencana secara acak untuk seluruh pemain." },
                { icon: "🏗️", type: "MITIGASI GRATIS", desc: "Mendarat di petak mitigasi memberi kartu mitigasi gratis (Mangrove, Tanggul, dll)." },
                { icon: "🌊", type: "LOCAL KNOWLEDGE", desc: "Mendengar cerita kebudayaan mitigasi bencana Nusantara dan mendapat +1 Koin." },
                { icon: "📍", type: "JALAN BIASA", desc: "Petak normal kosong tanpa memicu aksi atau kejadian apa pun." },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2.5 rounded-xl border border-purple-700/5 bg-cream-50/50 p-3">
                  <span className="text-2xl shrink-0 select-none">{item.icon}</span>
                  <div>
                    <h4 className="font-heading text-sm font-black text-ink-900">{item.type}</h4>
                    <p className="text-xs text-ink-700 leading-normal mt-0.5 font-sans">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-full bg-purple-700 font-heading text-base font-black text-white shadow-[0_4px_0_#20104f] hover:bg-purple-650 transition cursor-pointer"
        >
          Saya Mengerti, Mulai Main!
        </button>
      </motion.section>
    </motion.div>
  );
}
