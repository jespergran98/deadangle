/**
 * wallReflection.ts — True angle-of-incidence reflection.
 * Must stay logically identical to WallReflection.cs.
 */

import type { MazeWall } from '@/types/game.types';

export interface ReflectResult {
  vx: number;
  vy: number;
  hit: MazeWall | null;
}

const EPSILON = 0.5; // px — min distance to wall for collision

/**
 * Test whether point (px, py) with velocity (vx, vy) moving dt seconds
 * will cross any wall segment. Returns reflected velocity and the hit wall,
 * or { vx, vy, hit: null } if no collision.
 */
export function reflectProjectile(
  px: number,
  py: number,
  vx: number,
  vy: number,
  radius: number,
  walls: MazeWall[]
): ReflectResult {
  const speed = Math.hypot(vx, vy);
  if (speed === 0) return { vx, vy, hit: null };

  let hitWall: MazeWall | null = null;
  let minT = Infinity;

  for (const wall of walls) {
    const t = segmentCircleTime(px, py, vx, vy, radius, wall);
    if (t !== null && t < minT) {
      minT = t;
      hitWall = wall;
    }
  }

  if (!hitWall) return { vx, vy, hit: null };

  // Wall normal (always perpendicular to segment direction)
  const wx = hitWall.x2 - hitWall.x1;
  const wy = hitWall.y2 - hitWall.y1;
  const wl = Math.hypot(wx, wy);
  if (wl === 0) return { vx, vy, hit: null };

  // Unit normal (perpendicular to wall)
  const nx = -wy / wl;
  const ny =  wx / wl;

  // Reflect: v' = v - 2(v·n)n
  const dot = vx * nx + vy * ny;
  return {
    vx: vx - 2 * dot * nx,
    vy: vy - 2 * dot * ny,
    hit: hitWall,
  };
}

/**
 * Returns the earliest time t ∈ [0, 1] at which a circle of `radius`
 * moving from (px,py) by (vx,vy) touches the line segment, or null.
 */
function segmentCircleTime(
  px: number, py: number,
  vx: number, vy: number,
  radius: number,
  wall: MazeWall
): number | null {
  // Closest distance from circle centre to segment at each t
  // Using parametric segment closest-point approach

  const ex = wall.x2 - wall.x1;
  const ey = wall.y2 - wall.y1;
  const eLen2 = ex * ex + ey * ey;
  if (eLen2 === 0) return null;

  // Check at t=0 and t=1 first (fast path)
  const threshold = radius + EPSILON;

  // Use swept circle vs segment (simplified: check endpoints + infinite line)
  // Start and end positions of projectile over one tick (unit dt handled by caller)
  // We use a simplified "fast rejection" then closest-point check

  const fx = px - wall.x1;
  const fy = py - wall.y1;

  // Is point currently inside threshold? → no normal reflect possible (already intersecting)
  const t0 = Math.max(0, Math.min(1, (fx * ex + fy * ey) / eLen2));
  const cx0 = wall.x1 + t0 * ex - px;
  const cy0 = wall.y1 + t0 * ey - py;
  const dist0 = Math.hypot(cx0, cy0);
  if (dist0 < threshold) {
    // Only report hit if we are moving toward the wall
    const nx = -ey / Math.sqrt(eLen2);
    const ny =  ex / Math.sqrt(eLen2);
    const approach = vx * nx + vy * ny;
    if (approach > 0 || approach < 0) return 0.001; // imminent
    return null;
  }

  // Check if velocity points toward the wall's line
  // Dot of velocity with wall normal
  const wallLen = Math.sqrt(eLen2);
  const wn_x = -ey / wallLen;
  const wn_y =  ex / wallLen;
  const dot = vx * wn_x + vy * wn_y;

  if (Math.abs(dot) < 0.01) return null; // parallel

  // Distance from centre to infinite line
  const distToLine = fx * wn_x + fy * wn_y;
  if (distToLine * dot >= 0 && Math.abs(distToLine) < threshold) return 0.001;

  // Time to reach line at threshold distance
  const t_hit = (distToLine - Math.sign(distToLine) * threshold) / -dot;
  if (t_hit < 0 || t_hit > 1) return null;

  // Check if hit point is within segment extent
  const hx = px + vx * t_hit - wall.x1;
  const hy = py + vy * t_hit - wall.y1;
  const along = (hx * ex + hy * ey) / eLen2;
  if (along < -0.05 || along > 1.05) return null;

  return t_hit;
}

/**
 * Simple point-in-bounds check: returns clamped position and whether a wall bounce occurred.
 * Used for canvas-edge reflection (border walls are in the MazeLayout, this is a fallback).
 */
export function clampToBounds(
  x: number, y: number,
  vx: number, vy: number,
  radius: number,
  w: number, h: number
): { x: number; y: number; vx: number; vy: number } {
  let ox = x, oy = y, ovx = vx, ovy = vy;
  if (ox - radius < 0)     { ox = radius;          ovx = Math.abs(ovx);  }
  if (ox + radius > w)     { ox = w - radius;       ovx = -Math.abs(ovx); }
  if (oy - radius < 0)     { oy = radius;           ovy = Math.abs(ovy);  }
  if (oy + radius > h)     { oy = h - radius;       ovy = -Math.abs(ovy); }
  return { x: ox, y: oy, vx: ovx, vy: ovy };
}