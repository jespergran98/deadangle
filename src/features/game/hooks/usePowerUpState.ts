/**
 * usePowerUpState.ts — Derives active power-up display data from GameContext.
 * Exposed to PowerUpIndicator and the render pipeline.
 */

import { useGameContext } from '@/context/GameContext';
import type { ActivePowerUp } from '@/types/powerup.types';
import type { PlayerSlot } from '@/types/game.types';

export interface PowerUpDisplay {
  active: ActivePowerUp | null;
  /** Fraction 0→1 of duration remaining (null for non-timed power-ups). */
  fractionRemaining: number | null;
  /** Seconds remaining label (e.g. "2.4s"). */
  secondsLabel: string | null;
}

export function usePowerUpState(slot: PlayerSlot, now: number): PowerUpDisplay {
  const { gameState } = useGameContext();
  const active = gameState.activePowerUps[slot];

  if (!active) return { active: null, fractionRemaining: null, secondsLabel: null };

  if (!active.durationMs) {
    return { active, fractionRemaining: null, secondsLabel: null };
  }

  const elapsed  = now - active.activatedAt;
  const remaining = Math.max(0, active.durationMs - elapsed);
  const fraction  = remaining / active.durationMs;
  const secondsLabel = `${(remaining / 1000).toFixed(1)}s`;

  return { active, fractionRemaining: fraction, secondsLabel };
}