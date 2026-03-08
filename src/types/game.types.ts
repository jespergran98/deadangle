/**
 * game.types.ts — Dead Angle
 *
 * Shared game-state type definitions.
 * May import from powerup.types.ts; must never be imported by powerup.types.ts.
 *
 * NOTE: RoomContext.ts defines its own `PlayerSlot = 'Player1' | 'Player2'`
 * (PascalCase) for session/REST context. This file's `PlayerSlot` uses
 * lowercase string literals per the game-state spec. Import carefully.
 */

import type { PowerUpType, PowerUpPickup, ActivePowerUp } from './powerup.types';

// ---------------------------------------------------------------------------
// PlayerSlot
// ---------------------------------------------------------------------------

/**
 * Which of the two player positions this entity occupies.
 * 'player1' = host in multiplayer; 'player2' = joiner.
 */
export type PlayerSlot = 'player1' | 'player2';

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------

/**
 * Full per-frame state for a single player tank.
 * Both slots always present in GameState.players — never partially populated.
 */
export interface Player {
  /** Which slot this player occupies. */
  slot: PlayerSlot;

  /** World-space X position of the tank centre (px). */
  x: number;

  /** World-space Y position of the tank centre (px). */
  y: number;

  /**
   * Facing direction in radians, canvas coordinate system
   * (Y-axis points down). 0 = right; increases clockwise on screen.
   * Used for both rendering and projectile spawn angle.
   */
  angle: number;

  /**
   * Movement speed in px/s.
   * Base value set at game start; increases by a fixed increment on each
   * level-up in singleplayer. Static in multiplayer.
   */
  speed: number;

  /**
   * Rotation speed in rad/s.
   * Base value set at game start; increases by a fixed increment on each
   * level-up in singleplayer. Static in multiplayer.
   */
  turnRate: number;

  /**
   * Bullets available to fire. Range: 0–7.
   * Decremented on each fire event. Reaching 0 triggers a 3s reload that
   * restores 7 bullets on completion.
   * Frozen while a power-up is held; the frozen value is preserved in
   * magazineSnapshot and restored when the power-up is spent or expires.
   */
  bulletsRemaining: number;

  /**
   * Milliseconds remaining in the current reload. 0 when not reloading.
   * Frozen alongside bulletsRemaining while a power-up is held; both are
   * stored together in magazineSnapshot.
   */
  reloadTimeRemaining: number;

  /**
   * Frozen magazine state captured the moment a power-up is collected.
   * Non-null only while an active power-up is held.
   * Restored exactly (both fields) when the power-up expires or is spent.
   * Null when no power-up is held — never partially populated.
   */
  magazineSnapshot: { bulletsRemaining: number; reloadTimeRemaining: number } | null;
}

// ---------------------------------------------------------------------------
// Projectile
// ---------------------------------------------------------------------------

/**
 * A single in-flight projectile.
 * Added to GameState.projectiles on fire; removed on hit, expiry,
 * or destruction (e.g. by OrbitalGuard's orbit zone).
 */
export interface Projectile {
  /** Unique identifier. Correlates server events to client state in multiplayer. */
  id: string;

  /** Player slot that fired this projectile. */
  ownedBy: PlayerSlot;

  /** World-space X position (px). Updated every physics tick. */
  x: number;

  /** World-space Y position (px). Updated every physics tick. */
  y: number;

  /** Velocity X-component (px/s). Updated on wall bounce or deflection. */
  vx: number;

  /** Velocity Y-component (px/s). Updated on wall bounce or deflection. */
  vy: number;

  /**
   * Timestamp (ms) when the projectile was created.
   * Used for per-type lifetime enforcement:
   *   standard bullets 10s | PhaseBeam 4s | LockOnMissile + Boomerang 8s
   *   ShotgunBlast shells 2s | ClusterOrb 4s | OrbitalGuard 6s
   *   RicochetLaser — no time limit; expires on 10th wall contact instead.
   */
  firedAt: number;

  /**
   * Null for standard bullets.
   * Set to the originating PowerUpType for every power-up projectile,
   * including all descendants: ClusterOrb children, SplitterRound children
   * and grandchildren, ShotgunBlast shells, etc.
   * Drives per-type physics variant and visual treatment.
   */
  powerUpType: PowerUpType | null;

  /**
   * Split generation. Always 0 for every type except SplitterRound.
   *
   * SplitterRound semantics (only two values ever appear):
   *   0 — original bullet and first-generation children; may split on wall contact.
   *   1 — second-generation grandchildren; must NOT split on wall contact.
   */
  generation: number;

  /**
   * Return phase flag. Always false for every type except Boomerang.
   *
   * Boomerang semantics:
   *   false — outbound; wall-contact waypoints are being appended to pathLog.
   *   true  — return; projectile replays pathLog in reverse toward origin.
   * Flipped to true at the 5th wall contact; pathLog becomes read-only at that point.
   */
  isReturning: boolean;

  /**
   * Cumulative wall-contact count. Increments on every wall bounce.
   *
   * Consumers:
   *   RicochetLaser — expire and remove when this reaches 10.
   *   Boomerang     — set isReturning = true when this reaches 5 (outbound phase only).
   *
   * Always 0 for all other types.
   */
  wallContactCount: number;

  /**
   * Ordered wall-contact waypoints recorded during Boomerang's outbound phase.
   * Each entry is the world-space position at the moment of the nth wall contact.
   * The return phase replays these in reverse order to retrace the exact path.
   *
   * Empty array for all non-Boomerang types.
   * Also empty for a Boomerang in its return phase — pathLog is write-once;
   * reads are allowed, further appends are not once isReturning is true.
   */
  pathLog: Array<{ x: number; y: number }>;
}

// ---------------------------------------------------------------------------
// MazeWall
// ---------------------------------------------------------------------------

/** A single line-segment wall in the maze. */
export interface MazeWall {
  /**
   * Unique identifier.
   * WallBreaker (client) and WallRemovedEvent (server) both reference this
   * id to remove a specific segment from MazeLayout.walls.
   */
  id: string;

  /** World-space start X (px). */
  x1: number;

  /** World-space start Y (px). */
  y1: number;

  /** World-space end X (px). */
  x2: number;

  /** World-space end Y (px). */
  y2: number;
}

// ---------------------------------------------------------------------------
// MazeLayout
// ---------------------------------------------------------------------------

/**
 * Complete set of wall segments for the current round.
 * Generated at round start (server-side in multiplayer, client-side in
 * singleplayer) and treated as static for the round's duration.
 * Static walls are what make deterministic client-side projectile simulation safe.
 */
export interface MazeLayout {
  /**
   * All currently present wall segments.
   * WallBreaker permanently splices individual entries out of this array
   * for the rest of the round. Never re-populated mid-round.
   */
  walls: MazeWall[];
}

// ---------------------------------------------------------------------------
// DecoyState
// ---------------------------------------------------------------------------

/**
 * State for the active Decoy ghost tank.
 * Stored in GameState.decoy; null when none is in play.
 */
export interface DecoyState {
  /** Current world-space position of the ghost tank (px). Updated every tick. */
  position: { x: number; y: number };

  /**
   * Heading in radians (canvas coords, Y-axis down).
   * Set at spawn from the player's last movement direction and never updated.
   * The ghost travels in a straight line; wall collisions are not simulated.
   */
  movementDirection: number;

  /**
   * Timestamp (ms) when the decoy was spawned.
   * Expires at spawnedAt + 15 000 if not destroyed first.
   */
  spawnedAt: number;

  /**
   * True while the decoy is active.
   * Set to false when:
   *   (a) a projectile contacts it — absorbs exactly one hit then vanishes, or
   *   (b) 15s have elapsed since spawnedAt.
   * Both the renderer and hit-detection check this before processing the decoy.
   * The Decoy cannot fire, collect pickups, or trigger mines.
   */
  alive: boolean;
}

// ---------------------------------------------------------------------------
// MineState
// ---------------------------------------------------------------------------

/**
 * State for a single placed mine.
 * Collected in GameState.mines; the entire array is cleared on round start.
 */
export interface MineState {
  /** Unique identifier. */
  id: string;

  /** Player slot that placed this mine. */
  ownedBy: PlayerSlot;

  /**
   * Fixed world-space position (px).
   * Set at placement and never updated — mines do not move.
   */
  position: { x: number; y: number };

  /**
   * Timestamp (ms) when the mine was placed.
   * Becomes invisible at placedAt + 3 000.
   */
  placedAt: number;

  /**
   * False for the first 3s after placement; true once placedAt + 3 000 has elapsed.
   * When true the renderer stops drawing the token.
   * Detonation checks run regardless of this flag — invisible mines are still lethal.
   * Detonates on position overlap with either player (including the placer).
   * The Decoy cannot trigger mines.
   */
  isInvisible: boolean;
}

// ---------------------------------------------------------------------------
// GravityWellState
// ---------------------------------------------------------------------------

/**
 * State for the single active gravity well.
 * Stored in GameState.gravityWell; null when none is active.
 * At most one well exists per round globally across both players.
 */
export interface GravityWellState {
  /**
   * Fixed world-space attractor point (px).
   * Captured from the opponent's position at the moment of activation;
   * never updated after that — the well does not track movement.
   */
  position: { x: number; y: number };

  /**
   * Player slot that placed this well.
   * A new GravityWell activation by either player immediately cancels
   * the current well, regardless of who placed it.
   */
  placedBy: PlayerSlot;

  /**
   * Timestamp (ms) at which the well expires.
   * Always activationTimestamp + 8 000.
   */
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// GameState
// ---------------------------------------------------------------------------

/**
 * Complete live per-frame game state.
 * GameContext wraps this type — `createContext<GameState>`.
 *
 * Singleplayer: updated every frame by the client-side game loop.
 * Multiplayer: authoritative state written from gameTick events;
 *   player positions are interpolated between ticks by interpolation.ts.
 */
export interface GameState {
  /**
   * Full state for both players, keyed by PlayerSlot.
   * Both entries always present — never partially populated.
   */
  players: Record<PlayerSlot, Player>;

  /**
   * All projectiles currently in flight.
   * Entries added on fire; removed on hit, expiry, or OrbitalGuard destruction.
   */
  projectiles: Projectile[];

  /**
   * The maze for the current round.
   * Treated as static for the round; WallBreaker may remove individual
   * segments from maze.walls during play.
   */
  maze: MazeLayout;

  /**
   * All uncollected power-up tokens on the map. At most 3 simultaneously.
   * Entries removed on collection or round start.
   */
  pickups: PowerUpPickup[];

  /**
   * Active power-up for each player slot. null when none is held.
   * Only one power-up per player at a time — collection blocked while non-null,
   * except during PhaseShift (where a new pickup ends the shift and replaces it).
   */
  activePowerUps: Record<PlayerSlot, ActivePowerUp | null>;

  /**
   * All mines currently on the map.
   * Cleared at the start of every round; never carried between rounds.
   */
  mines: MineState[];

  /**
   * The active Decoy ghost, or null when none is in play.
   * At most one decoy active at any time — GameState.decoy is singular.
   */
  decoy: DecoyState | null;

  /**
   * The active gravity well, or null.
   * At most one well per round globally — a new activation immediately
   * cancels the existing one regardless of who placed it.
   */
  gravityWell: GravityWellState | null;

  /**
   * Player slots whose movement input is currently suppressed.
   * A slot is present here while its Phase Beam is in flight (4s lock).
   * Empty when no beams are active.
   *
   * Array (not a single slot) to correctly handle the edge case where both
   * players fire Phase Beams simultaneously.
   * useKeyboardInput checks this list before processing movement input.
   */
  phaseBeamLockedSlots: PlayerSlot[];
}