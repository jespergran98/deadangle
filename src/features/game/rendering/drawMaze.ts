/**
 * drawMaze.ts — Renders neon cyan maze walls on the canvas.
 */

import type { MazeLayout } from '@/types/game.types';
import { COLOR_BG, COLOR_WALL } from '../constants';

export function drawMaze(ctx: CanvasRenderingContext2D, maze: MazeLayout): void {
  // Clear
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (maze.walls.length === 0) return;

  ctx.save();
  ctx.strokeStyle = COLOR_WALL;
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'square';
  // Neon glow
  ctx.shadowColor = COLOR_WALL;
  ctx.shadowBlur  = 8;

  ctx.beginPath();
  for (const wall of maze.walls) {
    ctx.moveTo(wall.x1, wall.y1);
    ctx.lineTo(wall.x2, wall.y2);
  }
  ctx.stroke();

  // Second pass — brighter core
  ctx.shadowBlur = 2;
  ctx.lineWidth  = 1;
  ctx.strokeStyle = '#80F8FF';
  ctx.beginPath();
  for (const wall of maze.walls) {
    ctx.moveTo(wall.x1, wall.y1);
    ctx.lineTo(wall.x2, wall.y2);
  }
  ctx.stroke();

  ctx.restore();
}