/**
 * game.types.ts — Dead Angle
 *
 * Shared game-state type definitions.
 * Kept lean for the MVP singleplayer loop; ready to grow for multiplayer.
 */

// ---------------------------------------------------------------------------
// PlayerSlot
// ---------------------------------------------------------------------------

export type PlayerSlot = 'player1' | 'player2';

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------

export interface Player {
  slot: PlayerSlot;

  /** World-space tank centre X (px). */
  x: number;

  /** World-space tank centre Y (px). */
  y: number;

  /**
   * Facing direction in radians (Y-axis points down).
   * 0 = right; increases clockwise on screen.
   */
  angle: number;

  /** Movement speed in px/s. */
  speed: number;

  /** Rotation speed in rad/s. */
  turnRate: number;

  /** Bullets available to fire (0–MAGAZINE_SIZE). */
  bulletsRemaining: number;

  /** Ms remaining in the current reload. 0 when not reloading. */
  reloadTimeRemaining: number;

  /**
   * Frozen magazine snapshot captured when a power-up is collected.
   * null when no power-up is held.
   */
  magazineSnapshot: { bulletsRemaining: number; reloadTimeRemaining: number } | null;
}

// ---------------------------------------------------------------------------
// Projectile
// ---------------------------------------------------------------------------

export type PowerUpType = null; // Expand when power-ups are added

export interface Projectile {
  id: string;
  ownedBy: PlayerSlot;
  x: number;
  y: number;
  vx: number;
  vy: number;

  /** performance.now() timestamp when fired. */
  firedAt: number;

  powerUpType: PowerUpType;
  generation: number;
  isReturning: boolean;
  wallContactCount: number;
  pathLog: Array<{ x: number; y: number }>;
}

// ---------------------------------------------------------------------------
// Maze
// ---------------------------------------------------------------------------

export interface MazeWall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MazeLayout {
  walls: MazeWall[];
}

// ---------------------------------------------------------------------------
// GameState
// ---------------------------------------------------------------------------

export interface GameState {
  players: Record<PlayerSlot, Player>;
  projectiles: Projectile[];
  maze: MazeLayout;

  /* Power-ups, mines, decoy etc. — stubs for MVP */
  pickups: never[];
  activePowerUps: Record<PlayerSlot, null>;
  mines: never[];
  decoy: null;
  gravityWell: null;
  phaseBeamLockedSlots: PlayerSlot[];
}