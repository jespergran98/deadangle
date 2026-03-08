/**
 * hitDetection.ts — Dead Angle singleplayer
 *
 * Circle–circle overlap: projectile hit-box vs the opposing tank hit-box.
 *
 * MVP behaviour: log the hit to the console and remove the projectile.
 * No health tracking, round-end logic, or respawning yet — those land in the
 * next milestone once the score / round-state machine is designed.
 *
 * Hit distance threshold = TANK_RADIUS + BULLET_RADIUS (sum of radii).
 * A bullet owned by player1 can only hit player2, and vice-versa, so
 * friendly-fire is impossible by design.
 */

import { TANK_RADIUS, BULLET_RADIUS } from '@/features/game/constants';
import type { Projectile, Player } from '@/types/game.types';

const HIT_DIST_SQ = (TANK_RADIUS + BULLET_RADIUS) ** 2;

/**
 * Filters the projectile array, removing bullets that have struck their target.
 * Each hit is logged to the console.
 *
 * @param projectiles   In-flight projectiles (not mutated; returns a new array).
 * @param player1       Player-controlled tank (world position for this frame).
 * @param player2       Bot tank (world position for this frame).
 */
export function detectHits(
  projectiles: Projectile[],
  player1: Player,
  player2: Player,
): Projectile[] {
  if (projectiles.length === 0) return projectiles; // fast path

  return projectiles.filter(proj => {
    const target = proj.ownedBy === 'player1' ? player2 : player1;

    const dx = proj.x - target.x;
    const dy = proj.y - target.y;

    // Squared-distance comparison avoids an expensive Math.hypot.
    if (dx * dx + dy * dy < HIT_DIST_SQ) {
      const who = proj.ownedBy === 'player1' ? 'CPU' : 'PLAYER';
      // eslint-disable-next-line no-console
      console.log(`HIT: ${who} struck by ${proj.ownedBy} bullet #${proj.id}`);
      return false; // remove projectile
    }

    return true;
  });
}