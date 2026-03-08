/**
 * mazeGenerator.ts — Procedural maze via recursive backtracking.
 * Returns a MazeLayout with guaranteed open corridors between spawn points.
 */

import type { MazeLayout, MazeWall } from '@/types/game.types';
import { MAZE_COLS, MAZE_ROWS, TILE_SIZE } from '../constants';

interface Cell { col: number; row: number; }

function cellIndex(col: number, row: number): number {
  return row * MAZE_COLS + col;
}

const DIRS: Array<{ dc: number; dr: number; wall: 'N'|'S'|'E'|'W'; opp: 'N'|'S'|'E'|'W' }> = [
  { dc:  0, dr: -2, wall: 'N', opp: 'S' },
  { dc:  0, dr:  2, wall: 'S', opp: 'N' },
  { dc:  2, dr:  0, wall: 'E', opp: 'W' },
  { dc: -2, dr:  0, wall: 'W', opp: 'E' },
];

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a full cell-grid maze (recursive backtracking on a half-step grid).
 * MAZE_COLS and MAZE_ROWS must both be odd for a clean border-walled maze.
 *
 * The maze is represented as a boolean grid:
 *   open[row][col] = true  → this (possibly fractional) cell is a corridor
 *   open[row][col] = false → this cell is a wall
 */
function buildMazeCells(): boolean[][] {
  const open: boolean[][] = Array.from({ length: MAZE_ROWS }, () =>
    Array(MAZE_COLS).fill(false)
  );
  const visited = new Set<number>();

  function carve(col: number, row: number) {
    visited.add(cellIndex(col, row));
    open[row][col] = true;

    const dirs = shuffle([...DIRS]);
    for (const d of dirs) {
      const nc = col + d.dc;
      const nr = row + d.dr;
      if (nc < 0 || nr < 0 || nc >= MAZE_COLS || nr >= MAZE_ROWS) continue;
      if (visited.has(cellIndex(nc, nr))) continue;
      // carve the passage cell between
      const pc = col + d.dc / 2;
      const pr = row + d.dr / 2;
      open[pr][pc] = true;
      carve(nc, nr);
    }
  }

  // Start from top-left passage cell (always at 0,0)
  carve(0, 0);
  return open;
}

/**
 * Convert the open-cell grid into MazeWall line segments.
 * A wall segment is drawn on each edge of any closed cell that borders an open cell or the boundary.
 * We emit each wall once to avoid duplicates by only drawing south and east edges
 * of wall cells, plus the outer border.
 */
function cellsToWalls(open: boolean[][]): MazeWall[] {
  const walls: MazeWall[] = [];
  let id = 0;
  const W = TILE_SIZE;

  const addWall = (x1: number, y1: number, x2: number, y2: number) => {
    walls.push({ id: `w${id++}`, x1, y1, x2, y2 });
  };

  // Horizontal walls (top edge of each closed row transition)
  for (let row = 0; row <= MAZE_ROWS; row++) {
    let start: number | null = null;
    for (let col = 0; col <= MAZE_COLS; col++) {
      const above = row > 0 && col < MAZE_COLS ? open[row - 1][col] : false;
      const below = row < MAZE_ROWS && col < MAZE_COLS ? open[row][col] : false;
      const boundary = row === 0 || row === MAZE_ROWS;
      const needsWall = boundary || (above !== below);
      if (needsWall) {
        if (start === null) start = col;
      } else {
        if (start !== null) {
          addWall(start * W, row * W, col * W, row * W);
          start = null;
        }
      }
    }
    if (start !== null) {
      addWall(start * W, row * W, MAZE_COLS * W, row * W);
    }
  }

  // Vertical walls (left edge of each closed col transition)
  for (let col = 0; col <= MAZE_COLS; col++) {
    let start: number | null = null;
    for (let row = 0; row <= MAZE_ROWS; row++) {
      const left  = col > 0 && row < MAZE_ROWS ? open[row][col - 1] : false;
      const right = col < MAZE_COLS && row < MAZE_ROWS ? open[row][col] : false;
      const boundary = col === 0 || col === MAZE_COLS;
      const needsWall = boundary || (left !== right);
      if (needsWall) {
        if (start === null) start = row;
      } else {
        if (start !== null) {
          addWall(col * W, start * W, col * W, row * W);
          start = null;
        }
      }
    }
    if (start !== null) {
      addWall(col * W, start * W, col * W, MAZE_ROWS * W);
    }
  }

  return walls;
}

/**
 * Returns the world-space centre of the first open corridor cell
 * that is nearest to the given world position.
 */
export function nearestOpenCentre(
  open: boolean[][],
  wx: number,
  wy: number
): { x: number; y: number } {
  const W = TILE_SIZE;
  let best = { x: W / 2, y: W / 2 };
  let bestDist = Infinity;
  for (let row = 0; row < MAZE_ROWS; row++) {
    for (let col = 0; col < MAZE_COLS; col++) {
      if (!open[row][col]) continue;
      const cx = col * W + W / 2;
      const cy = row * W + W / 2;
      const d  = (cx - wx) ** 2 + (cy - wy) ** 2;
      if (d < bestDist) { bestDist = d; best = { x: cx, y: cy }; }
    }
  }
  return best;
}

export interface MazeData {
  layout: MazeLayout;
  /** Raw open-cell grid — used by powerUpManager for spawn placement. */
  open: boolean[][];
  /** Player 1 spawn position (world px). */
  p1Spawn: { x: number; y: number };
  /** Player 2 (CPU) spawn position (world px). */
  p2Spawn: { x: number; y: number };
  /** All open corridor tile centres — used for pickup placement. */
  openCentres: Array<{ x: number; y: number }>;
}

/** Generate a new maze for a round. */
export function generateMaze(): MazeData {
  const open = buildMazeCells();
  const walls = cellsToWalls(open);

  // Collect open centres
  const openCentres: Array<{ x: number; y: number }> = [];
  const W = TILE_SIZE;
  for (let row = 0; row < MAZE_ROWS; row++) {
    for (let col = 0; col < MAZE_COLS; col++) {
      if (open[row][col]) {
        openCentres.push({ x: col * W + W / 2, y: row * W + W / 2 });
      }
    }
  }

  // Spawns: player1 at top-left region, player2 at bottom-right region
  const p1Spawn = nearestOpenCentre(open, W, W);
  const p2Spawn = nearestOpenCentre(
    open,
    (MAZE_COLS - 2) * W,
    (MAZE_ROWS - 2) * W
  );

  return { layout: { walls }, open, p1Spawn, p2Spawn, openCentres };
}