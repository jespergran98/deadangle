import { createContext, useContext } from 'react';
import type { GameState } from '@/types/game.types';

/**
 * GameContext.ts — Dead Angle
 *
 * React context for game state. The default value is an inert placeholder
 * used only when a component is rendered outside a GameProvider subtree.
 * In normal use GameProvider supplies the real state and setter.
 */

/* ── Placeholder default (never used in production) ─────────── */
const placeholderState: GameState = {
  players: {
    player1: {
      slot: 'player1', x: 0, y: 0, angle: 0,
      speed: 0, turnRate: 0,
      bulletsRemaining: 7, reloadTimeRemaining: 0,
      magazineSnapshot: null,
    },
    player2: {
      slot: 'player2', x: 0, y: 0, angle: 0,
      speed: 0, turnRate: 0,
      bulletsRemaining: 7, reloadTimeRemaining: 0,
      magazineSnapshot: null,
    },
  },
  projectiles:          [],
  maze:                 { walls: [] },
  pickups:              [],
  activePowerUps:       { player1: null, player2: null },
  mines:                [],
  decoy:                null,
  gravityWell:          null,
  phaseBeamLockedSlots: [],
};

export interface GameContextValue {
  state:    GameState;
  setState: (s: GameState | ((prev: GameState) => GameState)) => void;
}

export const GameContext = createContext<GameContextValue>({
  state:    placeholderState,
  setState: () => {},
});

export function useGame(): GameContextValue {
  return useContext(GameContext);
}