import { createContext, useContext } from 'react';

// ── Efficiency tier ───────────────────────────────────────────────────────

export type EfficiencyTier =
  | 'Dead Angle'
  | 'Quick Draw'
  | 'Sustained'
  | 'Suppression';

// ── Round result (drives RoundTransition display) ─────────────────────────

export interface RoundResult {
  type: 'cpu_kill' | 'player_hit';
  scoreEarned?: number;
  tierLabel?: EfficiencyTier;
  levelUp?: boolean;
}

// ── Singleplayer run state ────────────────────────────────────────────────

export interface SingleplayerState {
  /** Current level — starts at 1. */
  level: number;
  /** Remaining lives — starts at 3, max 6. */
  hearts: number;
  /** Cumulative kills across all rounds. */
  totalKills: number;
  /** Cumulative score across all rounds. */
  cumulativeScore: number;
  /** Projectile count for the current round (resets each round). */
  roundProjectileCount: number;
  /**
   * Best (lowest-count) efficiency tier reached across the run.
   * null until the first kill of the run.
   */
  bestEfficiencyTierThisRun: EfficiencyTier | null;
  /**
   * Set when a kill triggers a level-up; applied at next round start.
   */
  pendingLevelUp: boolean;
  /** Set by hitDetection after round resolution; consumed by RoundTransition. */
  lastRoundResult: RoundResult | null;
  /** Ammo state for HUD display (mirrors player.bulletsRemaining / reload). */
  bulletsRemaining: number;
  reloadTimeRemaining: number;
}

export const INITIAL_SP_STATE: SingleplayerState = {
  level: 1,
  hearts: 3,
  totalKills: 0,
  cumulativeScore: 0,
  roundProjectileCount: 0,
  bestEfficiencyTierThisRun: null,
  pendingLevelUp: false,
  lastRoundResult: null,
  bulletsRemaining: 7,
  reloadTimeRemaining: 0,
};

// ── Context shape ─────────────────────────────────────────────────────────

export interface SingleplayerContextValue {
  spState: SingleplayerState;
  setSpState: (updater: (prev: SingleplayerState) => SingleplayerState) => void;
}

export const SingleplayerContext = createContext<SingleplayerContextValue>({
  spState: INITIAL_SP_STATE,
  setSpState: () => {},
});

export function useSingleplayerContext(): SingleplayerContextValue {
  return useContext(SingleplayerContext);
}