/**
 * drawMaze.ts — Dead Angle
 *
 * Renders all MazeWall segments as neon-cyan lines on the game canvas.
 *
 * Performance:
 *   Maze walls never change after generation, so the wall geometry is compiled
 *   into a Path2D object on first call and reused every subsequent frame.
 *   The cache key is the walls array reference — a new maze produces a new
 *   array reference, which automatically invalidates the cache.
 */

import { COLOR_CYAN } from '@/features/game/constants';
import type { MazeWall } from '@/types/game.types';

// ---------------------------------------------------------------------------
// Path2D cache
// ---------------------------------------------------------------------------

/**
 * Keyed by the walls array reference (identity).
 * Automatically GC'd when the maze is replaced (WeakMap won't prevent GC of
 * array objects even though arrays aren't normally weak keys; here we use a
 * plain Map with explicit invalidation via reference change instead).
 *
 * We use a two-slot cache: the previous walls reference and its compiled path.
 * On maze regeneration the old entry is discarded.
 */
let cachedWalls: MazeWall[] | null = null;
let cachedPath:  Path2D     | null = null;

function getOrBuildPath(walls: MazeWall[]): Path2D {
  if (walls === cachedWalls && cachedPath !== null) return cachedPath;

  const path = new Path2D();
  for (const wall of walls) {
    path.moveTo(wall.x1, wall.y1);
    path.lineTo(wall.x2, wall.y2);
  }

  cachedWalls = walls;
  cachedPath  = path;
  return path;
}

// ---------------------------------------------------------------------------
// Draw
// ---------------------------------------------------------------------------

export function drawMaze(
  ctx: CanvasRenderingContext2D,
  walls: MazeWall[],
): void {
  if (walls.length === 0) return;

  ctx.save();
  ctx.strokeStyle = COLOR_CYAN;
  ctx.lineWidth   = 2;
  ctx.shadowColor = COLOR_CYAN;
  ctx.shadowBlur  = 10;
  ctx.lineCap     = 'square';
  ctx.stroke(getOrBuildPath(walls));
  ctx.restore();
}