/**
 * drawProjectiles.ts — Renders all in-flight projectiles with per-type visuals.
 */

import type { GameState, Projectile } from '@/types/game.types';
import { PowerUpType } from '@/types/powerup.types';
import { COLOR_PLAYER, COLOR_CPU, BULLET_RADIUS, ORBITAL_GUARD_RADIUS } from '../constants';

const TYPE_COLOR: Partial<Record<PowerUpType, string>> = {
  [PowerUpType.RicochetLaser]:  '#00BFFF',
  [PowerUpType.PhaseBeam]:      '#00F0FF',
  [PowerUpType.LockOnMissile]:  '#FF6600',
  [PowerUpType.ClusterOrb]:     '#FF00FF',
  [PowerUpType.ShotgunBlast]:   '#FFA500',
  [PowerUpType.TripleBarrel]:   '#FFFF00',
  [PowerUpType.GatlingSpin]:    '#FF2D78',
  [PowerUpType.SplitterRound]:  '#FF4500',
  [PowerUpType.Boomerang]:      '#7CFC00',
  [PowerUpType.OrbitalGuard]:   '#00FF7F',
};

function projectileColor(proj: Projectile): string {
  if (proj.powerUpType !== null && TYPE_COLOR[proj.powerUpType]) {
    return TYPE_COLOR[proj.powerUpType]!;
  }
  return proj.ownedBy === 'player1' ? COLOR_PLAYER : COLOR_CPU;
}

function projectileRadius(proj: Projectile): number {
  switch (proj.powerUpType) {
    case PowerUpType.ClusterOrb:    return 5;
    case PowerUpType.ShotgunBlast:  return 2;
    case PowerUpType.LockOnMissile: return 4;
    default: return BULLET_RADIUS;
  }
}

export function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  now: number
): void {
  const timeWarp = !!Object.values(state.activePowerUps).find(
    ap => ap?.type === PowerUpType.TimeWarp
  );

  for (const proj of state.projectiles) {
    const color  = projectileColor(proj);
    const radius = projectileRadius(proj);

    ctx.save();

    // TimeWarp: blue-tinted projectiles
    const drawColor = timeWarp ? '#4466FF' : color;

    ctx.fillStyle   = drawColor;
    ctx.shadowColor = drawColor;
    ctx.shadowBlur  = 8;

    // Phase Beam: elongated line
    if (proj.powerUpType === PowerUpType.PhaseBeam) {
      const spd = Math.hypot(proj.vx, proj.vy);
      if (spd > 0) {
        const dx = (proj.vx / spd) * 14;
        const dy = (proj.vy / spd) * 14;
        ctx.strokeStyle = drawColor;
        ctx.lineWidth   = 3;
        ctx.shadowBlur  = 14;
        ctx.beginPath();
        ctx.moveTo(proj.x - dx, proj.y - dy);
        ctx.lineTo(proj.x + dx, proj.y + dy);
        ctx.stroke();
        ctx.restore();
        continue;
      }
    }

    // RicochetLaser: bright short line
    if (proj.powerUpType === PowerUpType.RicochetLaser) {
      const spd = Math.hypot(proj.vx, proj.vy);
      if (spd > 0) {
        const len = 10;
        const dx = (proj.vx / spd) * len;
        const dy = (proj.vy / spd) * len;
        ctx.strokeStyle = drawColor;
        ctx.lineWidth   = 2;
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.moveTo(proj.x - dx, proj.y - dy);
        ctx.lineTo(proj.x, proj.y);
        ctx.stroke();
        ctx.restore();
        continue;
      }
    }

    // LockOnMissile: pointed diamond
    if (proj.powerUpType === PowerUpType.LockOnMissile) {
      const a = Math.atan2(proj.vy, proj.vx);
      ctx.translate(proj.x, proj.y);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(0, 3);
      ctx.lineTo(-4, 0);
      ctx.lineTo(0, -3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }

    // Standard circle
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}