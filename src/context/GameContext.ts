import { createContext, useContext } from 'react';
import type { GameState, PlayerSlot } from '@/types/game.types';

// ── Initial / empty GameState ─────────────────────────────────────────────

const emptyPlayer = (slot: PlayerSlot) => ({
  slot,
  x: 0, y: 0, angle: 0,
  speed: 130, turnRate: 2.2,
  bulletsRemaining: 7,
  reloadTimeRemaining: 0,
  magazineSnapshot: null,
});

export const INITIAL_GAME_STATE: GameState = {
  players: {
    player1: emptyPlayer('player1'),
    player2: emptyPlayer('player2'),
  },
  projectiles: [],
  maze: { walls: [] },
  pickups: [],
  activePowerUps: { player1: null, player2: null },
  mines: [],
  decoy: null,
  gravityWell: null,
  phaseBeamLockedSlots: [],
};

// ── Context shape ─────────────────────────────────────────────────────────

export interface GameContextValue {
  gameState: GameState;
  setGameState: (updater: (prev: GameState) => GameState) => void;
}

export const GameContext = createContext<GameContextValue>({
  gameState: INITIAL_GAME_STATE,
  setGameState: () => {},
});

export function useGameContext(): GameContextValue {
  return useContext(GameContext);
}