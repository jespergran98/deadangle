/**
 * scoring.ts — Singleplayer scoring logic.
 * Called by hitDetection on every CPU kill.
 */

import type { EfficiencyTier } from '@/context/SingleplayerContext';

export interface TierInfo {
  tier: EfficiencyTier;
  multiplier: number;
  label: string;
}

/**
 * Dead Angle 1–3 (×4) | Quick Draw 4–7 (×3) | Sustained 8–14 (×2) | Suppression 15+ (×1)
 */
export function determineEfficiencyTier(roundProjectileCount: number): TierInfo {
  if (roundProjectileCount <= 3)  return { tier: 'Dead Angle',  multiplier: 4, label: 'DEAD ANGLE ×4'  };
  if (roundProjectileCount <= 7)  return { tier: 'Quick Draw',  multiplier: 3, label: 'QUICK DRAW ×3'  };
  if (roundProjectileCount <= 14) return { tier: 'Sustained',   multiplier: 2, label: 'SUSTAINED ×2'   };
  return                                 { tier: 'Suppression', multiplier: 1, label: 'SUPPRESSION ×1' };
}

/**
 * 100 × level × multiplier
 */
export function calculateKillScore(level: number, multiplier: number): number {
  return 100 * level * multiplier;
}

/**
 * Returns the better tier (lower projectile count wins).
 */
export function betterTier(a: EfficiencyTier | null, b: EfficiencyTier): EfficiencyTier {
  if (!a) return b;
  const rank: Record<EfficiencyTier, number> = {
    'Dead Angle': 0,
    'Quick Draw': 1,
    'Sustained':  2,
    'Suppression': 3,
  };
  return rank[a] <= rank[b] ? a : b;
}