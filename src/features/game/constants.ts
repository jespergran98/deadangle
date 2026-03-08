/**
 * constants.ts — Dead Angle game constants.
 * Single source of truth for canvas, maze, and physics parameters.
 */

export const CANVAS_WIDTH  = 760;
export const CANVAS_HEIGHT = 600;
export const TILE_SIZE     = 40;
export const MAZE_COLS     = 19; // must be odd
export const MAZE_ROWS     = 15; // must be odd

// Tank pixel-art grid (12 col × 7 row, cell = 2px, right-facing)
export const TANK_CELL        = 2;
export const TANK_PIXEL_W     = 12 * TANK_CELL; // 24
export const TANK_PIXEL_H     = 7  * TANK_CELL; // 14
export const TANK_RADIUS      = 9; // collision circle radius (px)
export const TANK_SPEED_BASE  = 130; // px/s
export const TANK_TURN_RATE   = 2.2; // rad/s base

// Bullet
export const BULLET_SPEED  = 320; // px/s
export const BULLET_RADIUS = 3;
export const MAGAZINE_SIZE = 7;
export const RELOAD_MS     = 3000;

// Orbital Guard
export const ORBITAL_GUARD_RADIUS = 22; // px

// Colours (from design tokens)
export const COLOR_BG      = '#000000';
export const COLOR_PLAYER  = '#FF2D78';
export const COLOR_CPU     = '#C8FF00';
export const COLOR_WALL    = '#00F0FF';
export const COLOR_BULLET  = '#FFFFFF';
export const COLOR_PICKUP  = '#FFD700';

// Right-facing tank pixel grid (1 = filled, 0 = empty)
export const TANK_GRID: number[][] = [
  [1,1,1,1,1,1,1,1,1,0,0,0],
  [1,0,0,0,0,0,0,0,1,0,0,0],
  [1,0,1,1,1,1,1,0,0,0,0,0],
  [1,0,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,0,0,0,0,0],
  [1,0,0,0,0,0,0,0,1,0,0,0],
  [1,1,1,1,1,1,1,1,1,0,0,0],
];