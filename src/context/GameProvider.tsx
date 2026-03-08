'use client';

/**
 * GameProvider.tsx — Dead Angle
 *
 * Provides GameContext to its subtree.
 * The initial state is built via the same initGameState() factory used by
 * useGameLoop, ensuring GameContext and the game-loop ref always agree on
 * the starting shape of GameState.
 *
 * NOTE: useGameLoop owns the authoritative mutable game state in a ref and
 * never reads GameContext during the loop.  GameContext is reserved for
 * cross-component coordination (settings, scores, restart triggers) that
 * may be added in later milestones.
 */

import { useState }  from 'react';
import type { ReactNode } from 'react';
import { GameContext } from './GameContext';
import type { GameState } from '@/types/game.types';
import {
  MAGAZINE_SIZE,
  P1_SPAWN_COL, P1_SPAWN_ROW,
  P2_SPAWN_COL, P2_SPAWN_ROW,
  CELL, TANK_SPEED, TANK_TURN,
} from '@/features/game/constants';

/* ── Initial state factory ───────────────────────────────────── */

function makeInitialState(): GameState {
  return {
    players: {
      player1: {
        slot:                'player1',
        x:                   (P1_SPAWN_COL + 0.5) * CELL,
        y:                   (P1_SPAWN_ROW + 0.5) * CELL,
        angle:               0,
        speed:               TANK_SPEED,
        turnRate:            TANK_TURN,
        bulletsRemaining:    MAGAZINE_SIZE,
        reloadTimeRemaining: 0,
        magazineSnapshot:    null,
      },
      player2: {
        slot:                'player2',
        x:                   (P2_SPAWN_COL + 0.5) * CELL,
        y:                   (P2_SPAWN_ROW + 0.5) * CELL,
        angle:               Math.PI,
        speed:               TANK_SPEED,
        turnRate:            TANK_TURN,
        bulletsRemaining:    MAGAZINE_SIZE,
        reloadTimeRemaining: 0,
        magazineSnapshot:    null,
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
}

/* ── Provider ────────────────────────────────────────────────── */

export function GameProvider({ children }: { children: ReactNode }) {
  // useState lazily evaluates the initialiser — makeInitialState() is
  // called exactly once per mount, not on every render.
  const [state, setState] = useState<GameState>(makeInitialState);

  return (
    <GameContext.Provider value={{ state, setState }}>
      {children}
    </GameContext.Provider>
  );
}