/**
 * powerUpEffects.ts — Per-tick physics mutations for all power-up projectile types.
 * Called by projectileSimulation after standard wall-bounce processing.
 * Must stay logically identical to PowerUpPhysics.cs.
 */

import type { GameState, Projectile, PlayerSlot } from '@/types/game.types';
import { PowerUpType } from '@/types/powerup.types';
import {
  BULLET_SPEED,
  ORBITAL_GUARD_RADIUS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../constants';
import { reflectProjectile } from './wallReflection';

const RICOCHET_SPEED_MULT = 10;
const GRAVITY_WELL_STRENGTH = 18_000; // px² / s

/**
 * Apply per-type physics mutations to a single projectile.
 * Mutates the projectile in place; returns true if it should be removed.
 */
export function applyPowerUpEffect(
  proj: Projectile,
  state: GameState,
  now: number,
  dt: number,
  ownerId: PlayerSlot
): boolean {
  if (proj.powerUpType === null) return false;

  switch (proj.powerUpType) {
    // ── RicochetLaser ─────────────────────────────────────────────────────
    case PowerUpType.RicochetLaser: {
      // Travels at 10× normal speed (velocity already set at spawn)
      // Expire on 10th wall contact (tracked by wallContactCount in projectileSimulation)
      if (proj.wallContactCount >= 10) return true;
      return false;
    }

    // ── PhaseBeam ─────────────────────────────────────────────────────────
    case PowerUpType.PhaseBeam: {
      // Passes through walls (handled by skipping wallReflection in projectileSimulation)
      // Bends gently toward opponent when close
      const opponent = state.players[ownerId === 'player1' ? 'player2' : 'player1'];
      const dx = opponent.x - proj.x;
      const dy = opponent.y - proj.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < 200) {
        const strength = 40 * dt;
        proj.vx += (dx / dist) * strength;
        proj.vy += (dy / dist) * strength;
        // Re-normalise to original speed
        const spd = Math.hypot(proj.vx, proj.vy);
        if (spd > 0) {
          const targetSpd = BULLET_SPEED;
          proj.vx = (proj.vx / spd) * targetSpd;
          proj.vy = (proj.vy / spd) * targetSpd;
        }
      }
      return false;
    }

    // ── LockOnMissile ─────────────────────────────────────────────────────
    case PowerUpType.LockOnMissile: {
      const age = now - proj.firedAt;
      if (age > 4000) {
        // Homing phase — find closest target (player or bot)
        const p1 = state.players.player1;
        const p2 = state.players.player2;
        const d1 = Math.hypot(p1.x - proj.x, p1.y - proj.y);
        const d2 = Math.hypot(p2.x - proj.x, p2.y - proj.y);
        const target = d1 < d2 ? p1 : p2;

        const dx = target.x - proj.x;
        const dy = target.y - proj.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
          const turnRate = 2.5 * dt;
          const desVx = (dx / dist) * BULLET_SPEED;
          const desVy = (dy / dist) * BULLET_SPEED;
          proj.vx += (desVx - proj.vx) * turnRate;
          proj.vy += (desVy - proj.vy) * turnRate;
          // Re-normalise
          const spd = Math.hypot(proj.vx, proj.vy);
          if (spd > 0) {
            proj.vx = (proj.vx / spd) * BULLET_SPEED;
            proj.vy = (proj.vy / spd) * BULLET_SPEED;
          }
        }
      }
      return false;
    }

    // ── ClusterOrb ────────────────────────────────────────────────────────
    case PowerUpType.ClusterOrb: {
      // Travels at half bullet speed; lifetime handled in projectileSimulation (4s → detonation)
      return false;
    }

    // ── Boomerang ─────────────────────────────────────────────────────────
    case PowerUpType.Boomerang: {
      if (proj.isReturning && proj.pathLog.length > 0) {
        // Replay path in reverse — find next waypoint
        const last = proj.pathLog[proj.pathLog.length - 1];
        const dx = last.x - proj.x;
        const dy = last.y - proj.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) {
          proj.pathLog.pop();
        } else {
          proj.vx = (dx / dist) * BULLET_SPEED;
          proj.vy = (dy / dist) * BULLET_SPEED;
        }
      }
      return false;
    }

    // ── OrbitalGuard ─────────────────────────────────────────────────────
    case PowerUpType.OrbitalGuard: {
      // Orbit around owner tank
      const owner = state.players[ownerId];
      const angle = now * 0.004; // rad (angular velocity)
      proj.x = owner.x + Math.cos(angle) * ORBITAL_GUARD_RADIUS;
      proj.y = owner.y + Math.sin(angle) * ORBITAL_GUARD_RADIUS;
      proj.vx = 0; proj.vy = 0; // position is set directly
      return false;
    }

    // ── GravityWell influence ─────────────────────────────────────────────
    // Applied globally (not per-projectile type) in projectileSimulation
    default:
      return false;
  }
}

/**
 * Apply GravityWell pull to a single projectile.
 * Called from projectileSimulation for ALL in-flight projectiles when a well is active.
 */
export function applyGravityWell(
  proj: Projectile,
  wx: number,
  wy: number,
  dt: number
): void {
  const dx = wx - proj.x;
  const dy = wy - proj.y;
  const dist2 = dx * dx + dy * dy;
  if (dist2 < 1) return;
  const dist = Math.sqrt(dist2);
  const force = (GRAVITY_WELL_STRENGTH / dist2) * dt;
  proj.vx += (dx / dist) * force;
  proj.vy += (dy / dist) * force;
}

/**
 * Apply TimeWarp scaling to projectile velocity.
 * Target: 25% of normal speed.
 */
export function applyTimeWarp(proj: Projectile, dt: number): void {
  const targetFraction = 0.25;
  const currentSpeed = Math.hypot(proj.vx, proj.vy);
  if (currentSpeed === 0) return;
  const targetSpeed = currentSpeed * targetFraction;
  // Blend toward target speed
  const blendedSpeed = currentSpeed + (targetSpeed - currentSpeed) * Math.min(dt * 10, 1);
  proj.vx = (proj.vx / currentSpeed) * blendedSpeed;
  proj.vy = (proj.vy / currentSpeed) * blendedSpeed;
}