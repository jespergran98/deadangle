/**
 * constants.ts — Dead Angle game constants.
 *
 * WORLD_W × WORLD_H is the canvas drawing-buffer resolution.
 * All physics and coordinate maths operate in world-space (px).
 * The CSS layer handles visual scaling — nothing here is a screen pixel size.
 *
 * Key relationships:
 *   MAZE_COLS × CELL = WORLD_W   →  14 × 40 = 560  ✓
 *   MAZE_ROWS × CELL = WORLD_H   →   8 × 40 = 320  ✓
 */

/* ── World / canvas drawing buffer ─────────────────────────── */
export const WORLD_W   = 560;
export const WORLD_H   = 320;

/* ── Maze grid ──────────────────────────────────────────────── */
export const MAZE_COLS = 14;
export const MAZE_ROWS = 8;
export const CELL      = 40; // px  (WORLD_W / MAZE_COLS = WORLD_H / MAZE_ROWS = 40)

/* ── Physics ────────────────────────────────────────────────── */
export const TANK_RADIUS = 7;    // px — circular hit-box radius
export const TANK_SPEED  = 70;   // px/s  (~8 s to cross the 560 px world)
export const TANK_TURN   = 5;    // rad/s  (~1.26 s per full rotation)

/*
 * BULLET_SPEED must stay safely below CELL / (1/60) ≈ 2 400 px/s to guarantee
 * at most two maze-wall crossings per frame (a corner clip at 45°).
 * 100 px/s (~1.67 px/frame at 60 fps, 5 px/frame at the 50 ms dt cap) is
 * 1.43× TANK_SPEED and leaves a factor-of-24 margin below the hard limit.
 * reflectProjectileStep handles up to 4 bounces per frame, giving ample
 * headroom above the 2 crossings physically possible in one step.
 */
export const BULLET_SPEED       = 100;   // px/s
export const BULLET_RADIUS      = 2;     // px — hit-box + render half-size
export const BULLET_LIFETIME_MS = 8_000; // ms

/*
 * BARREL_TIP_OFFSET — how far ahead of the tank centre to spawn a new bullet.
 *
 * The tank sprite's barrel tip sits 12 px ahead of the pivot (GRID_W / 2).
 * Using TANK_RADIUS − 1 = 6 px gives a visually plausible exit point while
 * guaranteeing the bullet never spawns exactly on or past a maze wall:
 *
 *   • resolveCircleWalls always keeps the tank centre ≥ TANK_RADIUS (7 px)
 *     from every wall in every direction.
 *   • An offset of 6 therefore leaves at least 1 px of clearance between the
 *     bullet origin and the nearest possible wall.
 *   • reflectProjectileStep's straddle check  (oy−wy)·(ny−wy) < 0  requires
 *     strict inequality, so the bullet must start STRICTLY off the wall line.
 *     That 1 px gap ensures the condition is always satisfied on the first frame
 *     even when the tank is pressed hard against a wall and fires directly into it.
 */
export const BARREL_TIP_OFFSET = TANK_RADIUS - 1; // 6 px

/* ── Magazine ───────────────────────────────────────────────── */
export const MAGAZINE_SIZE = 7;
export const RELOAD_MS     = 3_000;

/* ── Spawn cells (col, row) ─────────────────────────────────── */
// Vertically centred, well inside the active play area.
// Both are protected from organic boundary removal.
export const P1_SPAWN_COL = 2;
export const P1_SPAWN_ROW = Math.floor(MAZE_ROWS / 2); // 4
export const P2_SPAWN_COL = MAZE_COLS - 3;             // 11
export const P2_SPAWN_ROW = Math.floor(MAZE_ROWS / 2); // 4

/* ── Tank pixel-art grid (12 col × 7 row, barrel pointing RIGHT)
   At TANK_CELL = 2 px/cell the sprite is 24 × 14 px.
   Pivot = (12, 7) — the visual and physical centre.               */
export const TANK_GRID: readonly (readonly number[])[] = [
  [1,1,1,1,1,1,1,1,1,0,0,0],
  [1,0,0,0,0,0,0,0,1,0,0,0],
  [1,0,1,1,1,1,1,0,0,0,0,0],
  [1,0,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,0,0,0,0,0],
  [1,0,0,0,0,0,0,0,1,0,0,0],
  [1,1,1,1,1,1,1,1,1,0,0,0],
] as const;
export const TANK_CELL = 2; // px per grid cell → 24 × 14 px rendered sprite

/* ── Colours (mirror of globals.css custom properties) ──────── */
export const COLOR_PINK  = '#FF2D78';
export const COLOR_CYAN  = '#00F0FF';
export const COLOR_GREEN = '#C8FF00';