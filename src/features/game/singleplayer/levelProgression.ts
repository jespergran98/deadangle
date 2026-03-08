/**
 * levelProgression.ts — Level / heart state machine and bot scaling curve.
 */

export interface BotScaling {
  speedMultiplier: number;
  turnRate: number;
  aimAccuracy: number;     // 0–1 (1 = perfect aim)
  pathingQuality: number;  // 0–1 (1 = always direct path)
}

/**
 * Returns true when a level-up should be triggered.
 * Guard: totalKills > 0 prevents spurious level-up at game start.
 */
export function checkLevelUp(totalKills: number): boolean {
  return totalKills > 0 && totalKills % 3 === 0;
}

/**
 * Bot scaling curve — each level increases difficulty.
 * Level 1 is gentle; higher levels approach near-perfect play.
 */
export function botScalingForLevel(level: number): BotScaling {
  const clamped = Math.max(1, level);
  // Each level: +5% speed, +3% turn rate, tighter aim, better pathing
  return {
    speedMultiplier: 0.55 + (clamped - 1) * 0.06,
    turnRate:        1.8  + (clamped - 1) * 0.12,
    aimAccuracy:     Math.min(0.95, 0.35 + (clamped - 1) * 0.07),
    pathingQuality:  Math.min(0.98, 0.40 + (clamped - 1) * 0.08),
  };
}