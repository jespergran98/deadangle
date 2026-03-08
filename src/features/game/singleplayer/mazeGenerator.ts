/**
 * mazeGenerator.ts — Dead Angle
 *
 * Generates a landscape maze using the iterative recursive-backtracker (DFS).
 *
 * Grid:  MAZE_COLS × MAZE_ROWS (14 × 8).
 * Cell:  CELL × CELL px (40 × 40) in world-space.
 *
 * ── Organic silhouette ──────────────────────────────────────────────────────
 * Cells near the perimeter are randomly removed before generation to produce
 * a unique jagged silhouette on every run.  Removal probability by distance
 * from the nearest edge:
 *
 *   ring 0 (boundary)      → 52 %
 *   ring 1 (one step in)   → 20 %
 *   ring 2 (two steps in)  →  5 %
 *   ring 3+                →  0 %
 *
 * Spawn cells and their immediate 8-neighbours are always protected.
 *
 * ── Connectivity guarantee ──────────────────────────────────────────────────
 * The DFS starts from the grid centre and only visits active cells.
 * After carving, any active cell the DFS never reached is promoted to removed,
 * so every cell in the final maze is reachable from every other cell.
 *
 * ── Wall thinning ───────────────────────────────────────────────────────────
 * After the perfect-maze DFS, ~28 % of internal walls (those shared by two
 * active cells) are randomly deleted.  This introduces loops and shortcuts
 * throughout the map, improving flow and making every run feel distinct.
 * Perimeter walls (boundary of the active play area) are never thinned so
 * players cannot walk off the map edge.
 *
 * ── Wall representation ─────────────────────────────────────────────────────
 * hWall[r][c] — horizontal wall at y = r·CELL, spanning x = c·CELL…(c+1)·CELL
 * vWall[r][c] — vertical wall   at x = c·CELL, spanning y = r·CELL…(r+1)·CELL
 * All walls start present (true).  Carving clears the shared wall to false.
 *
 * A segment is exported only when at least one of its two bordering cells is
 * active — walls between two removed cells are never drawn.
 */

import {
  MAZE_COLS, MAZE_ROWS, CELL,
  P1_SPAWN_COL, P1_SPAWN_ROW,
  P2_SPAWN_COL, P2_SPAWN_ROW,
} from '@/features/game/constants';
import type { MazeLayout, MazeWall } from '@/types/game.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < MAZE_COLS && row >= 0 && row < MAZE_ROWS;
}

function isActive(col: number, row: number, removed: ReadonlySet<string>): boolean {
  return inBounds(col, row) && !removed.has(cellKey(col, row));
}

/** Fisher-Yates shuffle — returns a new shuffled copy. */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Organic boundary removal
// ---------------------------------------------------------------------------

function buildRemovedCells(): Set<string> {
  const removed = new Set<string>();

  // Cells that must never be removed: spawn cells and all 8-neighbours.
  const protected_ = new Set<string>();
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      protected_.add(cellKey(P1_SPAWN_COL + dc, P1_SPAWN_ROW + dr));
      protected_.add(cellKey(P2_SPAWN_COL + dc, P2_SPAWN_ROW + dr));
    }
  }

  // Removal probability by ring distance from nearest edge.
  const PROB: Record<number, number> = { 0: 0.52, 1: 0.20, 2: 0.05 };

  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (protected_.has(cellKey(c, r))) continue;

      const ring = Math.min(c, r, MAZE_COLS - 1 - c, MAZE_ROWS - 1 - r);
      const prob = PROB[ring] ?? 0;

      if (prob > 0 && Math.random() < prob) {
        removed.add(cellKey(c, r));
      }
    }
  }

  return removed;
}

// ---------------------------------------------------------------------------
// Wall-grid types and initialisation
// ---------------------------------------------------------------------------

type HWallGrid = boolean[][]; // [row 0..MAZE_ROWS  ][col 0..MAZE_COLS-1]
type VWallGrid = boolean[][]; // [row 0..MAZE_ROWS-1][col 0..MAZE_COLS  ]

function makeHWall(): HWallGrid {
  return Array.from({ length: MAZE_ROWS + 1 }, () => Array(MAZE_COLS).fill(true));
}

function makeVWall(): VWallGrid {
  return Array.from({ length: MAZE_ROWS }, () => Array(MAZE_COLS + 1).fill(true));
}

// ---------------------------------------------------------------------------
// Recursive backtracker (iterative DFS)
// ---------------------------------------------------------------------------

const DIRECTIONS = [
  { dc:  0, dr: -1, wall: 'N' },
  { dc:  1, dr:  0, wall: 'E' },
  { dc:  0, dr:  1, wall: 'S' },
  { dc: -1, dr:  0, wall: 'W' },
] as const;

/**
 * Carve passages through all active cells reachable from the grid centre.
 * Returns the visited set so the caller can detect isolated active cells.
 */
function carve(
  hWall: HWallGrid,
  vWall: VWallGrid,
  removed: ReadonlySet<string>,
): Set<string> {
  const visited = new Set<string>();
  const stack: [col: number, row: number][] = [];

  // Start from a guaranteed-active cell near the centre.
  const cx = Math.floor(MAZE_COLS / 2);
  const cy = Math.floor(MAZE_ROWS / 2);
  let startCol = cx;
  let startRow = cy;

  outer:
  for (let radius = 0; radius <= Math.max(MAZE_COLS, MAZE_ROWS); radius++) {
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        const c = cx + dc;
        const r = cy + dr;
        if (isActive(c, r, removed)) {
          startCol = c;
          startRow = r;
          break outer;
        }
      }
    }
  }

  stack.push([startCol, startRow]);
  visited.add(cellKey(startCol, startRow));

  while (stack.length > 0) {
    const [col, row] = stack[stack.length - 1];
    const dirs = shuffle(DIRECTIONS);
    let moved = false;

    for (const { dc, dr, wall } of dirs) {
      const nc = col + dc;
      const nr = row + dr;
      if (!isActive(nc, nr, removed) || visited.has(cellKey(nc, nr))) continue;

      // Remove the wall shared between (col,row) and (nc,nr).
      switch (wall) {
        case 'N': hWall[row][col]     = false; break;
        case 'S': hWall[row + 1][col] = false; break;
        case 'W': vWall[row][col]     = false; break;
        case 'E': vWall[row][col + 1] = false; break;
      }

      visited.add(cellKey(nc, nr));
      stack.push([nc, nr]);
      moved = true;
      break;
    }

    if (!moved) stack.pop();
  }

  return visited;
}

// ---------------------------------------------------------------------------
// Wall thinning — introduces loops and shortcuts throughout the map
// ---------------------------------------------------------------------------

/**
 * Randomly delete a fraction of internal walls shared by two active cells.
 *
 * Only internal walls (not boundary walls touching removed or out-of-bounds
 * cells) are candidates, so players always stay inside the active play area.
 * Each run produces a different, non-trivial layout.
 *
 * @param prob  Probability that any eligible internal wall is removed (0–1).
 */
function thinWalls(
  hWall: HWallGrid,
  vWall: VWallGrid,
  removed: ReadonlySet<string>,
  prob = 0.28,
): void {
  // Internal horizontal walls: row index 1..MAZE_ROWS-1
  // (rows 0 and MAZE_ROWS are top/bottom world edges — never thin those).
  for (let r = 1; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (!hWall[r][c]) continue; // already open
      // Only thin walls between two active cells — never create openings
      // into removed (solid) areas.
      if (!isActive(c, r - 1, removed) || !isActive(c, r, removed)) continue;
      if (Math.random() < prob) hWall[r][c] = false;
    }
  }

  // Internal vertical walls: col index 1..MAZE_COLS-1
  // (cols 0 and MAZE_COLS are left/right world edges — never thin those).
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 1; c < MAZE_COLS; c++) {
      if (!vWall[r][c]) continue; // already open
      if (!isActive(c - 1, r, removed) || !isActive(c, r, removed)) continue;
      if (Math.random() < prob) vWall[r][c] = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Convert boolean wall grids → flat MazeWall segment list
// ---------------------------------------------------------------------------

/**
 * A wall segment is emitted only when at least one of its bordering cells is
 * active.  Walls buried inside removed-cell areas are never emitted, so the
 * canvas displays an organic outline matching the active play area only.
 */
function buildWallSegments(
  hWall: HWallGrid,
  vWall: VWallGrid,
  removed: ReadonlySet<string>,
): MazeWall[] {
  const walls: MazeWall[] = [];
  let id = 0;

  // Horizontal walls: y = r·CELL, x = c·CELL … (c+1)·CELL
  for (let r = 0; r <= MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (!hWall[r][c]) continue;
      if (!isActive(c, r - 1, removed) && !isActive(c, r, removed)) continue;
      walls.push({ id: `h${++id}`, x1: c * CELL, y1: r * CELL, x2: (c + 1) * CELL, y2: r * CELL });
    }
  }

  // Vertical walls: x = c·CELL, y = r·CELL … (r+1)·CELL
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c <= MAZE_COLS; c++) {
      if (!vWall[r][c]) continue;
      if (!isActive(c - 1, r, removed) && !isActive(c, r, removed)) continue;
      walls.push({ id: `v${++id}`, x1: c * CELL, y1: r * CELL, x2: c * CELL, y2: (r + 1) * CELL });
    }
  }

  return walls;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateMaze(): MazeLayout {
  const removed = buildRemovedCells();
  const hWall   = makeHWall();
  const vWall   = makeVWall();

  const visited = carve(hWall, vWall, removed);

  // Connectivity guarantee: any active cell the DFS never reached is isolated
  // (surrounded by removed cells after random boundary removal).
  // Promote those cells to removed so the final map has zero dead pockets.
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (!removed.has(cellKey(c, r)) && !visited.has(cellKey(c, r))) {
        removed.add(cellKey(c, r));
      }
    }
  }

  // After the removed set is finalised, thin internal walls to create loops.
  thinWalls(hWall, vWall, removed);

  return { walls: buildWallSegments(hWall, vWall, removed) };
}

/**
 * World-space centre of cell (col, row).
 * Useful for spawn positions and bot pathfinding targets.
 */
export function cellCentre(col: number, row: number): { x: number; y: number } {
  return { x: (col + 0.5) * CELL, y: (row + 0.5) * CELL };
}