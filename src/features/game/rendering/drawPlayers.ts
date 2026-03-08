/**
 * drawPlayers.ts — Draws player and CPU tanks (pixel-art sprites + per-tank overlays).
 * Does NOT draw the Decoy — that is exclusively drawPowerUpEffects.
 */

import type { GameState } from '@/types/game.types';
import type { ActivePowerUp } from '@/types/powerup.types';
import { PowerUpType } from '@/types/powerup.types';
import {
  TANK_CELL, TANK_PIXEL_W, TANK_PIXEL_H, TANK_GRID,
  COLOR_PLAYER, COLOR_CPU, ORBITAL_GUARD_RADIUS,
} from '../constants';

// Cached offscreen canvases for each tank sprite
let _playerCanvas: HTMLCanvasElement | null = null;
let _cpuCanvas:    HTMLCanvasElement | null = null;

function buildSprite(color: string): HTMLCanvasElement {
  const oc = document.createElement('canvas');
  oc.width  = TANK_PIXEL_W;
  oc.height = TANK_PIXEL_H;
  const ctx = oc.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < TANK_GRID.length; row++) {
    for (let col = 0; col < TANK_GRID[row].length; col++) {
      if (TANK_GRID[row][col]) {
        ctx.fillStyle = color;
        ctx.fillRect(col * TANK_CELL, row * TANK_CELL, TANK_CELL, TANK_CELL);
      }
    }
  }
  return oc;
}

function getSprite(isPlayer: boolean): HTMLCanvasElement {
  if (isPlayer) {
    if (!_playerCanvas) _playerCanvas = buildSprite(COLOR_PLAYER);
    return _playerCanvas;
  } else {
    if (!_cpuCanvas) _cpuCanvas = buildSprite(COLOR_CPU);
    return _cpuCanvas;
  }
}

function drawTank(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  isPlayer: boolean,
  activePowerUp: ActivePowerUp | null,
  now: number
): void {
  const sprite = getSprite(isPlayer);
  const color  = isPlayer ? COLOR_PLAYER : COLOR_CPU;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.imageSmoothingEnabled = false;

  // PhaseShift: shimmer / reduced opacity
  if (activePowerUp?.type === PowerUpType.PhaseShift) {
    ctx.globalAlpha = 0.3 + 0.25 * Math.sin(now * 0.012);
  }

  // GatlingSpin: spinning barrel indicator (extra pixel line at front)
  if (activePowerUp?.type === PowerUpType.GatlingSpin) {
    const spinAge    = now - activePowerUp.activatedAt;
    const spinAngle  = spinAge * 0.015;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(8, 0, 5, spinAngle, spinAngle + Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();
  }

  ctx.drawImage(
    sprite,
    -TANK_PIXEL_W / 2,
    -TANK_PIXEL_H / 2,
    TANK_PIXEL_W,
    TANK_PIXEL_H
  );

  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Tank-attached overlays ────────────────────────────────────────────

  // ProtectiveShield ring
  if (activePowerUp?.type === PowerUpType.ProtectiveShield) {
    const r = 22;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // OrbitalGuard orbit circle
  if (activePowerUp?.type === PowerUpType.OrbitalGuard) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 4]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(x, y, ORBITAL_GUARD_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Neon glow dot (tank centre indicator)
  ctx.save();
  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 12;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  now: number
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.restore();

  drawTank(
    ctx,
    state.players.player1.x,
    state.players.player1.y,
    state.players.player1.angle,
    true,
    state.activePowerUps.player1,
    now
  );

  drawTank(
    ctx,
    state.players.player2.x,
    state.players.player2.y,
    state.players.player2.angle,
    false,
    state.activePowerUps.player2,
    now
  );
}