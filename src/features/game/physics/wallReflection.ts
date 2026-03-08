/**
 * wallReflection.ts — Dead Angle
 *
 * Two collision routines:
 *
 *  1. resolveCircleWalls  — pushes a circular tank body out of any maze walls
 *     it overlaps.  Called once per frame per player after position update.
 *
 *  2. reflectProjectileStep — sweeps a point-sized bullet along its velocity
 *     vector for one frame, detects every axis-aligned wall crossing in order,
 *     and reflects the trajectory at each one (up to 4 bounces per frame).
 *     Multiple reflections per call are required to correctly handle corner
 *     clips — see the function's own docblock for a full explanation.
 *
 * All maze walls are axis-aligned (horizontal or vertical), which allows the
 * fast dot-product-free reflection: flip vy on a horizontal wall, flip vx on
 * a vertical wall.
 *
 * Must stay logically identical to WallReflection.cs on the multiplayer server.
 */

import type { MazeWall } from '@/types/game.types';

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Closest point on segment AB to point P, with the parametric t ∈ [0,1]. */
export function closestPointOnSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
): { x: number; y: number; t: number } {
  const dx    = x2 - x1;
  const dy    = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { x: x1, y: y1, t: 0 };
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return { x: x1 + t * dx, y: y1 + t * dy, t };
}

/** Returns the unit normal of a wall, pointing into the cell interior. */
export function wallNormal(wall: MazeWall): { nx: number; ny: number } {
  const dx  = wall.x2 - wall.x1;
  const dy  = wall.y2 - wall.y1;
  const len = Math.hypot(dx, dy) || 1;
  return { nx: -dy / len, ny: dx / len };
}

// ---------------------------------------------------------------------------
// Tank–wall collision (circle vs segment)
// ---------------------------------------------------------------------------

export interface CircleOverlapResult {
  overlap:  boolean;
  closestX: number;
  closestY: number;
  dist:     number;
}

/** Returns overlap data for a circle (cx,cy,radius) against one wall segment. */
export function circleOverlapsWall(
  cx: number, cy: number, radius: number,
  wall: MazeWall,
): CircleOverlapResult {
  const cp   = closestPointOnSegment(cx, cy, wall.x1, wall.y1, wall.x2, wall.y2);
  const ddx  = cx - cp.x;
  const ddy  = cy - cp.y;
  const dist = Math.hypot(ddx, ddy);
  return { overlap: dist < radius, closestX: cp.x, closestY: cp.y, dist };
}

/**
 * Push a circle out of all walls it currently overlaps.
 *
 * Two passes resolve corner penetrations where the single-pass result would
 * leave the circle overlapping a perpendicular wall.  Beyond two passes the
 * marginal gain is negligible at TANK_SPEED / 60 ≈ 2 px/frame.
 */
export function resolveCircleWalls(
  cx: number, cy: number, radius: number,
  walls: MazeWall[],
  passes = 2,
): { x: number; y: number } {
  let x = cx;
  let y = cy;

  for (let p = 0; p < passes; p++) {
    for (const wall of walls) {
      const r = circleOverlapsWall(x, y, radius, wall);
      if (!r.overlap) continue;

      // Push direction: from closest point toward circle centre.
      // Guard against divide-by-zero when the centre is exactly on the wall.
      const d    = r.dist > 0 ? r.dist : 0.001;
      const pen  = radius - r.dist;
      x += ((x - r.closestX) / d) * pen;
      y += ((y - r.closestY) / d) * pen;
    }
  }

  return { x, y };
}

// ---------------------------------------------------------------------------
// Projectile–wall reflection
// ---------------------------------------------------------------------------

/**
 * True if the wall is axis-aligned horizontal (y1 ≈ y2).
 * All maze walls are axis-aligned; this is the fast dispatch test.
 */
export function isHorizontalWall(wall: MazeWall): boolean {
  return Math.abs(wall.y2 - wall.y1) < 0.5;
}

/** True if the wall is axis-aligned vertical (x1 ≈ x2). */
export function isVerticalWall(wall: MazeWall): boolean {
  return Math.abs(wall.x2 - wall.x1) < 0.5;
}

export interface ReflectResult {
  /** Position after travelling dt seconds (with up to MAX_BOUNCES reflections). */
  x: number;
  y: number;
  /** Post-reflection velocity x. */
  vx: number;
  /** Post-reflection velocity y. */
  vy: number;
  /** True if at least one wall crossing was detected and reflected. */
  reflected: boolean;
}

/**
 * Advance a point-projectile from (ox,oy) by (vx,vy)×dt seconds, reflecting
 * off any axis-aligned maze walls the path crosses.
 *
 * ── Why a loop, not a single reflection ────────────────────────────────────
 * The original single-reflection implementation had three compounding bugs that
 * caused bullets to pass through walls:
 *
 *   Bug 1 — Corner clips (primary tunneling cause):
 *     A bullet travelling near a corner where a horizontal and a vertical wall
 *     meet can cross BOTH walls within a single frame step.  At BULLET_SPEED=100
 *     px/s the step is ≈1.67 px/frame at 60 fps.  Any bullet within ~1.18 px of
 *     a corner at 45° needs two reflections in one frame.  The old code handled
 *     only the first crossing and silently discarded the second, letting the
 *     bullet tunnel through the perpendicular wall.
 *
 *   Bug 2 — Floating-point re-sticking:
 *     After a reflection the bullet's final position was placed exactly at
 *     crossX/crossY (on the wall line) plus a tiny remaining step.  With
 *     floating-point arithmetic, the next frame's straddle check
 *     (y − wy) × (ny − wy) could evaluate to exactly 0 rather than < 0,
 *     suppressing the reflection and allowing the bullet to pass through.
 *
 *   Bug 3 — Missing MIN_T guard:
 *     Without a lower bound on t, a reflection at t ≈ 0 could re-detect the
 *     wall the bullet was just departing from (the wall it bounced off on the
 *     previous frame), triggering a spurious second reflection immediately.
 *
 * ── Fix ────────────────────────────────────────────────────────────────────
 * The loop runs up to MAX_BOUNCES (4) sub-steps per frame.  Each iteration:
 *   1. Scans all walls for the nearest crossing (smallest t ∈ (MIN_T, 1]).
 *   2. Travels to the crossing point.
 *   3. Reflects velocity (flip vx on vertical wall, flip vy on horizontal).
 *   4. Pushes the bullet PUSH_PX (0.01 px) away from the wall so the next
 *      iteration's straddle check never starts with (y − wy) = 0.
 *   5. Consumes the remaining sub-frame time and repeats.
 *
 * At BULLET_SPEED = 100 px/s the worst-case step is 5 px (dt cap = 50 ms).
 * A 5 px diagonal step can cross at most TWO axis-aligned walls (the two walls
 * of a corner).  MAX_BOUNCES = 4 gives a 2× safety margin with negligible cost.
 *
 * EPS = 0.5 px endpoint tolerance prevents bullets grazing wall endpoints from
 * slipping through the gap at a T-junction or near-miss corner.
 */
export function reflectProjectileStep(
  ox: number, oy: number,
  vx: number, vy: number,
  dt: number,
  walls: MazeWall[],
): ReflectResult {
  const EPS        = 0.5;   // px — wall-endpoint slop
  const PUSH_PX    = 0.01;  // px — post-bounce push off the wall surface
  const MIN_T      = 1e-6;  // exclude t ≈ 0 to avoid re-hitting the wall just left
  const MAX_BOUNCES = 4;    // upper bound; ≤ 2 crossings physically possible per step

  let x   = ox,  y   = oy;
  let cvx = vx,  cvy = vy;
  let remainingDt  = dt;
  let anyReflected = false;

  for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    if (remainingDt < 1e-10) break; // time budget exhausted

    const nx = x + cvx * remainingDt;
    const ny = y + cvy * remainingDt;

    // ── Find the nearest wall crossing in the remaining sub-step ──────────
    let bestT    = Infinity;
    let hitHoriz = false; // horizontal wall hit → flip cvy
    let hitVert  = false; // vertical wall hit   → flip cvx

    for (const wall of walls) {
      if (isHorizontalWall(wall) && Math.abs(cvy) > 0.001) {
        const wy  = wall.y1;
        const wx1 = Math.min(wall.x1, wall.x2);
        const wx2 = Math.max(wall.x1, wall.x2);

        // Straddle check: does the path cross the wall's y-line?
        if ((y - wy) * (ny - wy) < 0) {
          const t      = (wy - y) / (ny - y); // parametric t ∈ (0, 1)
          const xCross = x + t * (nx - x);
          if (t > MIN_T && t < bestT && xCross >= wx1 - EPS && xCross <= wx2 + EPS) {
            bestT    = t;
            hitHoriz = true;
            hitVert  = false;
          }
        }
      } else if (isVerticalWall(wall) && Math.abs(cvx) > 0.001) {
        const wx  = wall.x1;
        const wy1 = Math.min(wall.y1, wall.y2);
        const wy2 = Math.max(wall.y1, wall.y2);

        // Straddle check: does the path cross the wall's x-line?
        if ((x - wx) * (nx - wx) < 0) {
          const t      = (wx - x) / (nx - x); // parametric t ∈ (0, 1)
          const yCross = y + t * (ny - y);
          if (t > MIN_T && t < bestT && yCross >= wy1 - EPS && yCross <= wy2 + EPS) {
            bestT    = t;
            hitHoriz = false;
            hitVert  = true;
          }
        }
      }
    }

    if (bestT === Infinity) {
      // No crossing in the remaining sub-step — travel to final position.
      x = nx;
      y = ny;
      break;
    }

    // ── Travel to the crossing point ──────────────────────────────────────
    const crossX = x + cvx * remainingDt * bestT;
    const crossY = y + cvy * remainingDt * bestT;

    // ── Reflect velocity (axis-aligned: flip one component only) ─────────
    const rvx = hitVert  ? -cvx : cvx;
    const rvy = hitHoriz ? -cvy : cvy;

    // ── Push bullet off the wall surface ─────────────────────────────────
    // Places the start of the next sub-step strictly away from the wall so
    // the next iteration's straddle check never evaluates to exactly 0.
    x = crossX + (hitVert  ? Math.sign(rvx) * PUSH_PX : 0);
    y = crossY + (hitHoriz ? Math.sign(rvy) * PUSH_PX : 0);

    cvx          = rvx;
    cvy          = rvy;
    remainingDt  = (1 - bestT) * remainingDt;
    anyReflected = true;
  }

  return { x, y, vx: cvx, vy: cvy, reflected: anyReflected };
}