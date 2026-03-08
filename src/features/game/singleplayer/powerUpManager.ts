/**
 * powerUpManager.ts — Full singleplayer power-up lifecycle.
 * Owns spawn scheduling, collection, magazine freeze/resume,
 * Phase Beam movement lock, mine timers, and round-end cleanup.
 */

import type { GameState, Player, PlayerSlot } from '@/types/game.types';
import type { PowerUpPickup, ActivePowerUp } from '@/types/powerup.types';
import { PowerUpType, POWER_UP_METADATA } from '@/types/powerup.types';
import { POWER_UP_METADATA as META } from '@/types/powerup.types';
import { TANK_RADIUS } from '../constants';

let _nextSpawnAt  = 0;
let _roundStartAt = 0;
const MAX_PICKUPS  = 3;
const ALL_TYPES    = Object.values(PowerUpType).filter(v => typeof v === 'number') as PowerUpType[];

// ── Spawn scheduling ─────────────────────────────────────────────────────

export function initPowerUpManager(now: number): void {
  _roundStartAt = now;
  // First spawn: 5–10 s after round start
  _nextSpawnAt  = now + 5000 + Math.random() * 5000;
}

function scheduleNextSpawn(now: number): void {
  _nextSpawnAt = now + 10_000 + Math.random() * 5000;
}

function randomType(): PowerUpType {
  return ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
}

function randomPickupPosition(openCentres: Array<{ x: number; y: number }>): { x: number; y: number } {
  const idx = Math.floor(Math.random() * openCentres.length);
  return { ...openCentres[idx] };
}

// ── Collection detection ─────────────────────────────────────────────────

function canCollect(slot: PlayerSlot, state: GameState): boolean {
  const active = state.activePowerUps[slot];
  if (!active) return true;
  // Exception: during Phase Shift the player CAN collect to end it early
  if (active.type === PowerUpType.PhaseShift && slot === 'player1') return true;
  return false;
}

function tryCollect(
  slot: PlayerSlot,
  state: GameState,
  now: number
): { pickup: PowerUpPickup | null; newState: GameState } {
  if (!canCollect(slot, state)) return { pickup: null, newState: state };

  const player = state.players[slot];
  for (const pickup of state.pickups) {
    const dist = Math.hypot(pickup.position.x - player.x, pickup.position.y - player.y);
    if (dist > TANK_RADIUS + 12) continue;

    // Collect this pickup
    const meta = POWER_UP_METADATA[pickup.type];
    const active: ActivePowerUp = {
      type: pickup.type,
      activatedAt: now,
      durationMs: meta.durationMs,
      ...(pickup.type === PowerUpType.ShotgunBlast || pickup.type === PowerUpType.TripleBarrel
        ? { shotsRemaining: 3 }
        : {}),
    };

    // Snapshot magazine
    const p = state.players[slot];
    const snapshot = { bulletsRemaining: p.bulletsRemaining, reloadTimeRemaining: p.reloadTimeRemaining };

    const newPlayers = {
      ...state.players,
      [slot]: { ...p, magazineSnapshot: snapshot } as Player,
    };

    // Remove pickup; add active power-up; handle Phase Shift early-end
    let newActivePowerUps = { ...state.activePowerUps, [slot]: active };

    // If Phase Shift was active, end it
    if (state.activePowerUps[slot]?.type === PowerUpType.PhaseShift) {
      // Just replace
    }

    const newState: GameState = {
      ...state,
      players: newPlayers,
      pickups: state.pickups.filter(pk => pk.id !== pickup.id),
      activePowerUps: newActivePowerUps,
    };

    // Instant power-ups: resolve immediately
    const resolved = resolveInstantPowerUp(slot, newState, pickup.type, now);

    return { pickup, newState: resolved };
  }
  return { pickup: null, newState: state };
}

function resolveInstantPowerUp(
  slot: PlayerSlot,
  state: GameState,
  type: PowerUpType,
  now: number
): GameState {
  switch (type) {
    case PowerUpType.WallBreaker: {
      // Remove the nearest wall segment
      const player = state.players[slot];
      let nearestId = '';
      let minDist = Infinity;
      for (const wall of state.maze.walls) {
        const cx = (wall.x1 + wall.x2) / 2;
        const cy = (wall.y1 + wall.y2) / 2;
        const d = Math.hypot(cx - player.x, cy - player.y);
        if (d < minDist) { minDist = d; nearestId = wall.id; }
      }
      const newState = {
        ...state,
        maze: { walls: state.maze.walls.filter(w => w.id !== nearestId) },
        activePowerUps: { ...state.activePowerUps, [slot]: null },
      };
      // Restore magazine
      return restoreMagazine(slot, newState);
    }
    case PowerUpType.Swap: {
      const p1 = state.players.player1;
      const p2 = state.players.player2;
      return {
        ...state,
        players: {
          player1: { ...p1, x: p2.x, y: p2.y },
          player2: { ...p2, x: p1.x, y: p1.y },
        },
        activePowerUps: { ...state.activePowerUps, [slot]: null },
      };
    }
    case PowerUpType.Mine: {
      const player = state.players[slot];
      const mine = {
        id: `mine_${now}_${slot}`,
        ownedBy: slot,
        position: { x: player.x, y: player.y },
        placedAt: now,
        isInvisible: false,
      };
      return {
        ...state,
        mines: [...state.mines, mine],
        activePowerUps: { ...state.activePowerUps, [slot]: null },
      };
    }
    case PowerUpType.Decoy: {
      const player = state.players[slot];
      return {
        ...state,
        decoy: {
          position: { x: player.x, y: player.y },
          movementDirection: player.angle,
          spawnedAt: now,
          alive: true,
        },
        activePowerUps: { ...state.activePowerUps, [slot]: null },
      };
    }
    case PowerUpType.Repulsor: {
      // Instantly deflect all projectiles outward
      const player = state.players[slot];
      const newProjectiles = state.projectiles.map(proj => {
        const dx = proj.x - player.x;
        const dy = proj.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return proj;
        const spd = Math.hypot(proj.vx, proj.vy) || 300;
        return { ...proj, vx: (dx / dist) * spd, vy: (dy / dist) * spd };
      });
      return {
        ...state,
        projectiles: newProjectiles,
        activePowerUps: { ...state.activePowerUps, [slot]: null },
      };
    }
    case PowerUpType.GravityWell: {
      const opponent = state.players[slot === 'player1' ? 'player2' : 'player1'];
      return {
        ...state,
        gravityWell: {
          position: { x: opponent.x, y: opponent.y },
          placedBy: slot,
          expiresAt: now + 8000,
        },
        activePowerUps: { ...state.activePowerUps, [slot]: null },
      };
    }
    default:
      return state;
  }
}

function restoreMagazine(slot: PlayerSlot, state: GameState): GameState {
  const p = state.players[slot];
  if (!p.magazineSnapshot) return state;
  return {
    ...state,
    players: {
      ...state.players,
      [slot]: {
        ...p,
        bulletsRemaining: p.magazineSnapshot.bulletsRemaining,
        reloadTimeRemaining: p.magazineSnapshot.reloadTimeRemaining,
        magazineSnapshot: null,
      },
    },
  };
}

// ── Tick ─────────────────────────────────────────────────────────────────

export interface PowerUpManagerTickResult {
  state: GameState;
  spawnedPickup: boolean;
}

export function tickPowerUpManager(
  state: GameState,
  now: number,
  openCentres: Array<{ x: number; y: number }>
): PowerUpManagerTickResult {
  let s = { ...state };
  let spawnedPickup = false;

  // ── Spawn new pickup ─────────────────────────────────────────────────
  if (now >= _nextSpawnAt && s.pickups.length < MAX_PICKUPS) {
    const id = `pu_${now}_${Math.random().toString(36).slice(2)}`;
    const type = randomType();
    const position = randomPickupPosition(openCentres);
    s = {
      ...s,
      pickups: [...s.pickups, { id, type, position }],
    };
    scheduleNextSpawn(now);
    spawnedPickup = true;
  }

  // ── Collection: player1 ──────────────────────────────────────────────
  const { newState: afterP1 } = tryCollect('player1', s, now);
  s = afterP1;

  // ── Collection: player2 (CPU) ────────────────────────────────────────
  const { newState: afterP2 } = tryCollect('player2', s, now);
  s = afterP2;

  // ── Timed expiry ─────────────────────────────────────────────────────
  for (const slot of ['player1', 'player2'] as const) {
    const active = s.activePowerUps[slot];
    if (!active) continue;

    const elapsed = now - active.activatedAt;
    const expired = active.durationMs !== null && elapsed >= active.durationMs;

    if (expired) {
      // Phase Beam: remove movement lock
      if (active.type === PowerUpType.PhaseBeam) {
        s = {
          ...s,
          phaseBeamLockedSlots: s.phaseBeamLockedSlots.filter(sl => sl !== slot),
        };
      }
      s = restoreMagazine(slot, { ...s, activePowerUps: { ...s.activePowerUps, [slot]: null } });
    }
  }

  // ── Mine visibility update ───────────────────────────────────────────
  s = {
    ...s,
    mines: s.mines.map(mine => ({
      ...mine,
      isInvisible: mine.isInvisible || (now - mine.placedAt >= 3000),
    })),
  };

  // ── Decoy lifetime ───────────────────────────────────────────────────
  if (s.decoy?.alive && now - s.decoy.spawnedAt >= 15_000) {
    s = { ...s, decoy: s.decoy ? { ...s.decoy, alive: false } : null };
  }

  // ── Gravity well expiry ──────────────────────────────────────────────
  if (s.gravityWell && now >= s.gravityWell.expiresAt) {
    s = { ...s, gravityWell: null };
  }

  return { state: s, spawnedPickup };
}

/**
 * Add Phase Beam movement lock for a slot.
 * Called when a PhaseBeam projectile is fired.
 */
export function addPhaseBeamLock(state: GameState, slot: PlayerSlot): GameState {
  if (state.phaseBeamLockedSlots.includes(slot)) return state;
  return {
    ...state,
    phaseBeamLockedSlots: [...state.phaseBeamLockedSlots, slot],
  };
}

/**
 * Spend one shot of a multi-shot power-up (ShotgunBlast / TripleBarrel).
 * Returns the updated state and whether the power-up was fully spent.
 */
export function spendShot(state: GameState, slot: PlayerSlot): { state: GameState; spent: boolean } {
  const active = state.activePowerUps[slot];
  if (!active || active.shotsRemaining === undefined) return { state, spent: false };

  const newShots = active.shotsRemaining - 1;
  if (newShots <= 0) {
    const newState = restoreMagazine(slot, {
      ...state,
      activePowerUps: { ...state.activePowerUps, [slot]: null },
    });
    return { state: newState, spent: true };
  }
  return {
    state: {
      ...state,
      activePowerUps: {
        ...state.activePowerUps,
        [slot]: { ...active, shotsRemaining: newShots },
      },
    },
    spent: false,
  };
}

/** Round-end cleanup: discard all active power-ups, reset magazines to 7. */
export function roundEndCleanup(state: GameState): GameState {
  const resetPlayer = (slot: PlayerSlot) => ({
    ...state.players[slot],
    bulletsRemaining: 7,
    reloadTimeRemaining: 0,
    magazineSnapshot: null,
  });
  return {
    ...state,
    projectiles: [],
    activePowerUps: { player1: null, player2: null },
    phaseBeamLockedSlots: [],
    mines: [],
    decoy: null,
    gravityWell: null,
    players: {
      player1: resetPlayer('player1'),
      player2: resetPlayer('player2'),
    },
  };
}