/**
 * drawPlayers.ts — Dead Angle
 *
 * Renders both tanks using the 12×7 pixel-art grid defined in constants.ts.
 *
 * ── Why OffscreenCanvas? ──────────────────────────────────────────────────
 * Drawing individual fillRect calls on a rotated context works at axis-
 * aligned angles (0°, 90°, …) but introduces sub-pixel anti-aliasing at
 * every other heading: each rect's corners land at non-integer device pixels
 * after the rotation transform, causing the pixel grid to blur and the sprite
 * silhouette to appear to "melt" or change shape as the tank turns.
 *
 * Fix:
 *   1. Pre-render the sprite once into an OffscreenCanvas at exact integer
 *      pixel positions with no transform — this is always crisp.
 *   2. Rotate the main context and stamp the offscreen image with
 *      imageSmoothingEnabled = false (nearest-neighbour).
 *
 * The nearest-neighbour stamp snaps each sprite texel to the closest screen
 * pixel after rotation, preserving the hard-edge look of the pixel art.
 * One OffscreenCanvas is cached per colour (two tanks → two canvases, built
 * once and reused every frame).
 *
 * ── Position precision ────────────────────────────────────────────────────
 * Player positions are stored as floats in physics state and used directly —
 * no integer snapping at the centre coordinate.  Snapping the pivot to an
 * integer pixel while also rotating causes a 1-px "hop" each time the
 * rounded value crosses an integer, producing a choppy appearance when
 * turning.  Sub-pixel pivot placement is imperceptible at game scale.
 */

import { TANK_GRID, TANK_CELL, COLOR_PINK, COLOR_GREEN } from '@/features/game/constants';
import type { Player, PlayerSlot } from '@/types/game.types';

// ---------------------------------------------------------------------------
// Sprite dimensions
// ---------------------------------------------------------------------------

const GRID_COLS = TANK_GRID[0].length;   // 12
const GRID_ROWS = TANK_GRID.length;      // 7
const GRID_W    = GRID_COLS * TANK_CELL; // 24 px
const GRID_H    = GRID_ROWS * TANK_CELL; // 14 px

// Rotation pivot: centre of the sprite in sprite-local coordinates.
const ORIGIN_X = Math.round(GRID_W / 2); // 12 px
const ORIGIN_Y = Math.floor(GRID_H / 2); // 7 px

// ---------------------------------------------------------------------------
// Sprite cache  (colour → pre-rendered OffscreenCanvas)
// ---------------------------------------------------------------------------

const spriteCache = new Map<string, OffscreenCanvas>();

/**
 * Returns (and lazily creates) an OffscreenCanvas containing the tank sprite
 * in the requested colour with no rotation transform applied.
 * Only TANK_GRID cells with value 1 are filled; everything else is transparent
 * so the stamp composes correctly over any background.
 */
function getSprite(color: string): OffscreenCanvas {
  const cached = spriteCache.get(color);
  if (cached) return cached;

  const oc  = new OffscreenCanvas(GRID_W, GRID_H);
  const ctx = oc.getContext('2d')!;

  ctx.fillStyle = color;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (TANK_GRID[r][c]) {
        ctx.fillRect(c * TANK_CELL, r * TANK_CELL, TANK_CELL, TANK_CELL);
      }
    }
  }

  spriteCache.set(color, oc);
  return oc;
}

// ---------------------------------------------------------------------------
// Per-tank draw
// ---------------------------------------------------------------------------

function drawTank(
  ctx: CanvasRenderingContext2D,
  player: Player,
  color: string,
): void {
  const sprite = getSprite(color);

  ctx.save();

  // Move origin to the tank's world-space centre, then rotate.
  // Float coordinates give smooth rotation without pivot-snapping artefacts.
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  // Nearest-neighbour sampling preserves the hard-edge pixel-art look
  // after the rotation transform is applied to the drawImage call.
  ctx.imageSmoothingEnabled = false;

  // Glow — canvas shadow applies to drawImage identically to fillRect.
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;

  // Stamp the pre-rendered sprite so its centre pivot aligns with the origin.
  ctx.drawImage(sprite, -ORIGIN_X, -ORIGIN_Y);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  players: Record<PlayerSlot, Player>,
): void {
  drawTank(ctx, players.player1, COLOR_PINK);
  drawTank(ctx, players.player2, COLOR_GREEN);
}