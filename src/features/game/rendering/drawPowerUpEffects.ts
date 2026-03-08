/**
 * drawPowerUpEffects.ts — World-space overlay effects for active power-ups.
 * Sole renderer of: Decoy ghost, RicochetLaser preview, PhaseShift pulse ring,
 * GravityWell distortion, TimeWarp overlay, Mine token, Swap flash,
 * Boomerang return arc, LockOnMissile reticle, WallBreaker flash.
 */

import type { GameState } from '@/types/game.types';
import { PowerUpType } from '@/types/powerup.types';
import type { TrajectorySegment } from '../physics/trajectoryPreview';
import { TANK_PIXEL_W, TANK_PIXEL_H, TANK_CELL, TANK_GRID, COLOR_PLAYER, TANK_RADIUS } from '../constants';

export interface EffectsDrawData {
  trajectorySegments?: TrajectorySegment[];
}

export function drawPowerUpEffects(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  now: number,
  data: EffectsDrawData = {}
): void {
  // ── RicochetLaser pre-fire trajectory ──────────────────────────────────
  if (data.trajectorySegments && data.trajectorySegments.length > 0) {
    ctx.save();
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth   = 1;
    ctx.shadowColor = '#00BFFF';
    ctx.shadowBlur  = 6;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const segs = data.trajectorySegments;
    ctx.moveTo(segs[0].x1, segs[0].y1);
    for (const seg of segs) {
      ctx.lineTo(seg.x2, seg.y2);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── Decoy ghost tank ──────────────────────────────────────────────────
  if (state.decoy?.alive) {
    const { position, movementDirection } = state.decoy;
    ctx.save();
    ctx.globalAlpha = 0.45 + 0.15 * Math.sin(now * 0.006);
    ctx.translate(position.x, position.y);
    ctx.rotate(movementDirection);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = COLOR_PLAYER;
    // Draw ghost tank (same grid as player)
    for (let row = 0; row < TANK_GRID.length; row++) {
      for (let col = 0; col < TANK_GRID[row].length; col++) {
        if (TANK_GRID[row][col]) {
          ctx.fillRect(
            col * TANK_CELL - TANK_PIXEL_W / 2,
            row * TANK_CELL - TANK_PIXEL_H / 2,
            TANK_CELL, TANK_CELL
          );
        }
      }
    }
    ctx.restore();
  }

  // ── PhaseShift pulse ring ─────────────────────────────────────────────
  for (const slot of ['player1', 'player2'] as const) {
    const active = state.activePowerUps[slot];
    if (active?.type !== PowerUpType.PhaseShift) continue;
    const player = state.players[slot];
    const age    = now - active.activatedAt;
    const frac   = age / (active.durationMs ?? 3000);
    const r      = TANK_RADIUS + frac * 60;
    ctx.save();
    ctx.strokeStyle = '#FF2D78';
    ctx.lineWidth   = 2;
    ctx.globalAlpha = (1 - frac) * 0.7;
    ctx.shadowColor = '#FF2D78';
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── GravityWell distortion rings ──────────────────────────────────────
  if (state.gravityWell) {
    const { position, expiresAt } = state.gravityWell;
    const remaining = expiresAt - now;
    if (remaining > 0) {
      const frac    = (remaining / 8000) % 1;
      const nRings  = 3;
      ctx.save();
      for (let i = 0; i < nRings; i++) {
        const phase = ((i / nRings) + (1 - frac)) % 1;
        const r     = phase * 50;
        const alpha = (1 - phase) * 0.6;
        ctx.strokeStyle = '#C8FF00';
        ctx.lineWidth   = 1.5;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = '#C8FF00';
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.arc(position.x, position.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ── TimeWarp screen overlay ───────────────────────────────────────────
  for (const slot of ['player1', 'player2'] as const) {
    const active = state.activePowerUps[slot];
    if (active?.type !== PowerUpType.TimeWarp) continue;
    const age  = now - active.activatedAt;
    const frac = 1 - age / 10_000;
    ctx.save();
    ctx.fillStyle   = `rgba(0, 100, 255, ${frac * 0.08})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    break; // Only one TimeWarp
  }

  // ── Mine tokens ───────────────────────────────────────────────────────
  for (const mine of state.mines) {
    if (mine.isInvisible) continue;
    ctx.save();
    ctx.fillStyle   = mine.ownedBy === 'player1' ? '#FF2D78' : '#C8FF00';
    ctx.strokeStyle = ctx.fillStyle;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.arc(mine.position.x, mine.position.y, 5, 0, Math.PI * 2);
    ctx.fill();
    // X mark
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mine.position.x - 3, mine.position.y - 3);
    ctx.lineTo(mine.position.x + 3, mine.position.y + 3);
    ctx.moveTo(mine.position.x + 3, mine.position.y - 3);
    ctx.lineTo(mine.position.x - 3, mine.position.y + 3);
    ctx.stroke();
    ctx.restore();
  }

  // ── Boomerang return-path arc ─────────────────────────────────────────
  for (const proj of state.projectiles) {
    if (proj.powerUpType !== PowerUpType.Boomerang || !proj.isReturning) continue;
    if (proj.pathLog.length < 2) continue;
    ctx.save();
    ctx.strokeStyle = '#7CFC00';
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 5]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(proj.x, proj.y);
    for (const pt of [...proj.pathLog].reverse()) {
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── LockOnMissile target reticle ──────────────────────────────────────
  for (const proj of state.projectiles) {
    if (proj.powerUpType !== PowerUpType.LockOnMissile) continue;
    const age = now - proj.firedAt;
    if (age < 4000) continue; // Not in homing phase yet
    // Find target
    const p1 = state.players.player1;
    const p2 = state.players.player2;
    const d1 = Math.hypot(p1.x - proj.x, p1.y - proj.y);
    const d2 = Math.hypot(p2.x - proj.x, p2.y - proj.y);
    const target = d1 < d2 ? p1 : p2;
    const blink  = Math.floor(now / 200) % 2;
    if (blink) {
      ctx.save();
      ctx.strokeStyle = '#FF6600';
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = '#FF6600';
      ctx.shadowBlur  = 8;
      const r = 18;
      ctx.beginPath();
      ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.moveTo(target.x - r - 4, target.y);
      ctx.lineTo(target.x + r + 4, target.y);
      ctx.moveTo(target.x, target.y - r - 4);
      ctx.lineTo(target.x, target.y + r + 4);
      ctx.stroke();
      ctx.restore();
    }
  }
}