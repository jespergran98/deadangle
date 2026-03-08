/**
 * projectileSimulation.ts — Deterministic per-frame projectile physics.
 * Steps all in-flight projectiles, handles wall reflections and per-type lifetimes.
 * Calls powerUpEffects internally — do not call powerUpEffects separately in the game loop.
 */

import type { GameState, Projectile, PlayerSlot } from '@/types/game.types';
import { PowerUpType } from '@/types/powerup.types';
import { BULLET_SPEED, BULLET_RADIUS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { reflectProjectile } from './wallReflection';
import {
  applyPowerUpEffect,
  applyGravityWell,
  applyTimeWarp,
} from './powerUpEffects';

// Per-type lifetime in ms (null = no time limit)
const LIFETIME: Partial<Record<PowerUpType, number>> = {
  [PowerUpType.PhaseBeam]:     4000,
  [PowerUpType.LockOnMissile]: 8000,
  [PowerUpType.Boomerang]:     8000,
  [PowerUpType.ShotgunBlast]:  2000,
  [PowerUpType.ClusterOrb]:    4000,
  [PowerUpType.OrbitalGuard]:  6000,
};
const NORMAL_BULLET_LIFETIME = 10_000;

export interface SimulationResult {
  /** Updated projectile list (dead ones removed). */
  projectiles: Projectile[];
  /** IDs of projectiles that expired this tick (caller handles ClusterOrb detonation). */
  expired: Array<{ id: string; type: PowerUpType | null; x: number; y: number }>;
  /** Projectile-slot pairs where a wall bounce incremented wallContactCount. */
  wallBounces: Array<{ id: string }>;
  /** New child projectiles spawned this tick (SplitterRound). */
  newProjectiles: Projectile[];
}

export function stepProjectiles(state: GameState, dt: number, now: number): SimulationResult {
  const surviving: Projectile[] = [];
  const expired:  SimulationResult['expired'] = [];
  const wallBounces: Array<{ id: string }> = [];
  const newProjectiles: Projectile[] = [];

  const timeWarpActive = !!Object.values(state.activePowerUps).find(
    ap => ap?.type === PowerUpType.TimeWarp
  );

  for (const proj of state.projectiles) {
    let p: Projectile = { ...proj };
    const age = now - p.firedAt;

    // ── Lifetime check ────────────────────────────────────────────────────
    const lifetime = p.powerUpType === null
      ? NORMAL_BULLET_LIFETIME
      : LIFETIME[p.powerUpType] ?? null;

    if (lifetime !== null && age >= lifetime) {
      expired.push({ id: p.id, type: p.powerUpType, x: p.x, y: p.y });
      continue;
    }

    // ── OrbitalGuard: position set by powerUpEffects (skip normal advance) ─
    if (p.powerUpType === PowerUpType.OrbitalGuard) {
      const shouldRemove = applyPowerUpEffect(p, state, now, dt, p.ownedBy);
      if (shouldRemove) {
        expired.push({ id: p.id, type: p.powerUpType, x: p.x, y: p.y });
      } else {
        surviving.push(p);
      }
      continue;
    }

    // ── PhaseBeam: skip wall reflection ───────────────────────────────────
    if (p.powerUpType === PowerUpType.PhaseBeam) {
      applyPowerUpEffect(p, state, now, dt, p.ownedBy);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      surviving.push(p);
      continue;
    }

    // ── TimeWarp scaling ─────────────────────────────────────────────────
    let stepDt = dt;
    if (timeWarpActive) {
      stepDt = dt; // apply warp to velocity instead
      applyTimeWarp(p, dt);
    }

    // ── Boomerang: override velocity when returning ───────────────────────
    if (p.powerUpType === PowerUpType.Boomerang) {
      applyPowerUpEffect(p, state, now, dt, p.ownedBy);
      if (p.isReturning) {
        p.x += p.vx * stepDt;
        p.y += p.vy * stepDt;
        surviving.push(p);
        continue;
      }
    }

    // ── GravityWell influence ────────────────────────────────────────────
    if (state.gravityWell && now < state.gravityWell.expiresAt) {
      applyGravityWell(p, state.gravityWell.position.x, state.gravityWell.position.y, stepDt);
    }

    // ── Standard movement + wall reflection ───────────────────────────────
    const nx = p.x + p.vx * stepDt;
    const ny = p.y + p.vy * stepDt;

    const reflect = reflectProjectile(nx, ny, p.vx, p.vy, BULLET_RADIUS, state.maze.walls);
    if (reflect.hit) {
      p.wallContactCount++;
      p.vx = reflect.vx;
      p.vy = reflect.vy;
      wallBounces.push({ id: p.id });

      // RicochetLaser expire at 10th wall contact
      if (p.powerUpType === PowerUpType.RicochetLaser && p.wallContactCount >= 10) {
        expired.push({ id: p.id, type: p.powerUpType, x: p.x, y: p.y });
        continue;
      }

      // Boomerang: start returning at 5th wall contact
      if (p.powerUpType === PowerUpType.Boomerang && !p.isReturning && p.wallContactCount === 5) {
        p.isReturning = true;
      } else if (p.powerUpType === PowerUpType.Boomerang && !p.isReturning) {
        p.pathLog = [...p.pathLog, { x: p.x, y: p.y }];
      }

      // SplitterRound: split on first wall contact (generation 0 only)
      if (p.powerUpType === PowerUpType.SplitterRound && p.generation === 0 && p.wallContactCount === 1) {
        const angle = Math.atan2(p.vy, p.vx);
        const spd = Math.hypot(p.vx, p.vy);
        const offset = 0.35; // rad
        for (const delta of [-offset, offset]) {
          const child: Projectile = {
            id: `${p.id}_c${delta > 0 ? 'r' : 'l'}`,
            ownedBy: p.ownedBy,
            x: p.x, y: p.y,
            vx: Math.cos(angle + delta) * spd,
            vy: Math.sin(angle + delta) * spd,
            firedAt: now,
            powerUpType: PowerUpType.SplitterRound,
            generation: 1,
            isReturning: false,
            wallContactCount: 0,
            pathLog: [],
          };
          newProjectiles.push(child);
        }
        expired.push({ id: p.id, type: p.powerUpType, x: p.x, y: p.y });
        continue;
      }
    }

    p.x = nx;
    p.y = ny;

    // ── Other power-up effects ────────────────────────────────────────────
    const shouldRemove = applyPowerUpEffect(p, state, now, dt, p.ownedBy);
    if (shouldRemove) {
      expired.push({ id: p.id, type: p.powerUpType, x: p.x, y: p.y });
      continue;
    }

    surviving.push(p);
  }

  return {
    projectiles: [...surviving, ...newProjectiles],
    expired,
    wallBounces,
    newProjectiles,
  };
}