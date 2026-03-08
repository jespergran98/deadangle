/**
 * drawProjectiles.ts — Dead Angle
 *
 * Renders each in-flight projectile as a glowing 4×4 px square.
 *   Player-1 bullets: pink  (#FF2D78)
 *   Player-2 bullets: green (#C8FF00)
 *
 * ── Batching ─────────────────────────────────────────────────────────────
 * ctx.save() + ctx.restore() are relatively expensive state-machine calls.
 * The naïve approach calls them once per bullet (up to 14 per frame with two
 * 7-round magazines in flight simultaneously).
 *
 * Fix: two passes — one per colour — so context state is set up exactly once
 * per colour group regardless of how many bullets are in flight.
 * ctx.save() + ctx.restore() drops from 2 × N calls to 2 calls per frame.
 *
 * ── Integer rendering ────────────────────────────────────────────────────
 * Physics state stores float coordinates.  Positions are rounded here to
 * integer pixels so bullets snap cleanly to the raster without blurring.
 * Rounding inside the simulation would drift trajectories; rounding at
 * draw time is free of side-effects.
 */

import { BULLET_RADIUS, COLOR_PINK, COLOR_GREEN } from '@/features/game/constants';
import type { Projectile } from '@/types/game.types';

const SIZE = BULLET_RADIUS * 2; // 4 px rendered square

export function drawProjectiles(
  ctx:         CanvasRenderingContext2D,
  projectiles: Projectile[],
): void {
  if (projectiles.length === 0) return; // fast path — avoid any state changes

  // Two passes: pink (player1) then green (player2).
  // Using a for-of over a small literal tuple avoids building a temporary array.
  for (const [color, owner] of [
    [COLOR_PINK,  'player1'],
    [COLOR_GREEN, 'player2'],
  ] as const) {
    // Check if any bullet of this colour exists before paying save/restore cost.
    const hasBullet = projectiles.some(p => p.ownedBy === owner);
    if (!hasBullet) continue;

    ctx.save();
    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;

    for (const proj of projectiles) {
      if (proj.ownedBy !== owner) continue;
      // Round to integer pixel so the 4×4 square aligns to the canvas raster.
      const rx = Math.round(proj.x) - BULLET_RADIUS;
      const ry = Math.round(proj.y) - BULLET_RADIUS;
      ctx.fillRect(rx, ry, SIZE, SIZE);
    }

    ctx.restore();
  }
}