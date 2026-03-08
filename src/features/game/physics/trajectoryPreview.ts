/**
 * trajectoryPreview.ts — RicochetLaser pre-fire trajectory ray-cast.
 * Called each frame while RicochetLaser is held and trigger not yet pulled.
 * Returns an ordered array of line segments representing the full projected path.
 */

import type { MazeWall } from '@/types/game.types';
import { reflectProjectile } from './wallReflection';
import { BULLET_RADIUS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export interface TrajectorySegment {
  x1: number; y1: number;
  x2: number; y2: number;
}

const MAX_BOUNCES = 10;
const RAY_STEP    = 6; // px per ray step

/**
 * Compute the RicochetLaser trajectory from a given position and angle.
 * Simulates up to 10 wall contacts using wallReflection.
 */
export function computeTrajectory(
  startX: number,
  startY: number,
  angle: number,
  walls: MazeWall[]
): TrajectorySegment[] {
  const segments: TrajectorySegment[] = [];

  const SPEED = 1; // normalised direction
  let x  = startX;
  let y  = startY;
  let vx = Math.cos(angle) * SPEED;
  let vy = Math.sin(angle) * SPEED;

  let bounces = 0;
  const maxDist = (CANVAS_WIDTH + CANVAS_HEIGHT) * 2;
  let dist = 0;

  while (bounces < MAX_BOUNCES && dist < maxDist) {
    // Step forward to find next wall collision
    let stepX = x + vx * RAY_STEP;
    let stepY = y + vy * RAY_STEP;

    const result = reflectProjectile(stepX, stepY, vx, vy, BULLET_RADIUS, walls);

    if (result.hit) {
      // Find the exact hit point (approximate: midpoint before bounce)
      segments.push({ x1: x, y1: y, x2: stepX, y2: stepY });
      x  = stepX;
      y  = stepY;
      vx = result.vx;
      vy = result.vy;
      bounces++;
    } else {
      // Continue to edge of canvas or max distance
      const nextX = x + vx * RAY_STEP;
      const nextY = y + vy * RAY_STEP;
      segments.push({ x1: x, y1: y, x2: nextX, y2: nextY });
      x = nextX;
      y = nextY;
      dist += RAY_STEP;

      // Stop if out of canvas
      if (x < 0 || x > CANVAS_WIDTH || y < 0 || y > CANVAS_HEIGHT) break;
    }
  }

  return segments;
}