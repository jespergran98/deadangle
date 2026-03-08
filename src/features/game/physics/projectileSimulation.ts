/**
 * projectileSimulation.ts — Dead Angle
 *
 * Deterministic, frame-rate-independent projectile advancement.
 * Used in singleplayer; must stay logically identical to
 * ProjectileSimulator.cs on the server for multiplayer parity.
 *
 * Each tick:
 *   1. Expire the projectile if BULLET_LIFETIME_MS has elapsed.
 *   2. Advance position by velocity × dt.
 *   3. Reflect off the first maze wall the path crosses (via wallReflection).
 *   4. Clamp to world boundary and reflect off edges (treat as invisible walls).
 *
 * IMPORTANT — integer rendering:
 *   Position coordinates stay as floats in the physics state.  Rounding to
 *   integer pixels happens only in the draw functions, not here.  Rounding
 *   inside the simulation would introduce up to 0.5 px of velocity drift per
 *   frame, causing bullets to gradually deviate from their true trajectory.
 */

import {
  BULLET_RADIUS,
  BULLET_LIFETIME_MS,
  BULLET_SPEED,
  WORLD_W,
  WORLD_H,
} from '@/features/game/constants';
import type { Projectile, MazeWall } from '@/types/game.types';
import { reflectProjectileStep } from '@/features/game/physics/wallReflection';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let projIdCounter = 0;

export function createProjectile(
  ownedBy: 'player1' | 'player2',
  x: number,
  y: number,
  angle: number,
): Projectile {
  return {
    id:               `proj-${++projIdCounter}`,
    ownedBy,
    x,
    y,
    vx:               Math.cos(angle) * BULLET_SPEED,
    vy:               Math.sin(angle) * BULLET_SPEED,
    firedAt:          performance.now(),
    powerUpType:      null,
    generation:       0,
    isReturning:      false,
    wallContactCount: 0,
    pathLog:          [],
  };
}

// ---------------------------------------------------------------------------
// Per-projectile tick
// ---------------------------------------------------------------------------

/**
 * Advance one projectile by dt seconds.
 * Returns null when the projectile should be removed (lifetime expired).
 * Does NOT round position — callers should round at draw time only.
 */
function tickProjectile(
  proj: Projectile,
  dt: number,
  walls: MazeWall[],
  now: number,
): Projectile | null {
  // Lifetime check — reuse the `now` value from the batch caller to avoid
  // repeated performance.now() syscalls inside the inner loop.
  if (now - proj.firedAt > BULLET_LIFETIME_MS) return null;

  // Advance position and reflect off maze walls.
  const result = reflectProjectileStep(
    proj.x, proj.y,
    proj.vx, proj.vy,
    dt,
    walls,
  );

  let { x, y, vx, vy } = result;
  let contacts = proj.wallContactCount + (result.reflected ? 1 : 0);

  // World-boundary bounce — edges act as invisible walls.
  if (x - BULLET_RADIUS < 0) {
    x  = BULLET_RADIUS;
    vx = Math.abs(vx);
    contacts++;
  } else if (x + BULLET_RADIUS > WORLD_W) {
    x  = WORLD_W - BULLET_RADIUS;
    vx = -Math.abs(vx);
    contacts++;
  }

  if (y - BULLET_RADIUS < 0) {
    y  = BULLET_RADIUS;
    vy = Math.abs(vy);
    contacts++;
  } else if (y + BULLET_RADIUS > WORLD_H) {
    y  = WORLD_H - BULLET_RADIUS;
    vy = -Math.abs(vy);
    contacts++;
  }

  // Store exact float coordinates in state; rounding happens at draw time.
  return {
    ...proj,
    x,
    y,
    vx,
    vy,
    wallContactCount: contacts,
  };
}

// ---------------------------------------------------------------------------
// Batch tick
// ---------------------------------------------------------------------------

/**
 * Advance all projectiles by dt seconds.
 * Expired projectiles are filtered out.  Returns a new array; never mutates.
 */
export function simulateProjectiles(
  projectiles: Projectile[],
  dt: number,
  walls: MazeWall[],
): Projectile[] {
  if (projectiles.length === 0) return projectiles; // fast path — avoid allocation

  const now  = performance.now();
  const next: Projectile[] = [];
  for (const proj of projectiles) {
    const advanced = tickProjectile(proj, dt, walls, now);
    if (advanced !== null) next.push(advanced);
  }
  return next;
}