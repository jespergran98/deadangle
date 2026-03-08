/**
 * bot.ts — CPU AI state machine.
 * Scales with level via botScalingForLevel().
 * Always called "CPU" in UI; variables use `cpu` internally.
 */

import type { GameState, Player, Projectile, PlayerSlot } from '@/types/game.types';
import type { PowerUpPickup } from '@/types/powerup.types';
import { PowerUpType, POWER_UP_METADATA } from '@/types/powerup.types';
import { TANK_RADIUS, BULLET_SPEED, BULLET_RADIUS, MAGAZINE_SIZE, RELOAD_MS } from '../constants';
import { botScalingForLevel } from './levelProgression';
import { addPhaseBeamLock, spendShot } from './powerUpManager';

type BotMode = 'seek_player' | 'seek_pickup' | 'wander';

// Internal bot state (persists across ticks)
let _mode: BotMode          = 'seek_player';
let _wanderAngle: number    = Math.random() * Math.PI * 2;
let _wanderTimer: number    = 0;
let _gatlingSpinStart: number = 0;
let _lastShotAt: number     = 0;

export function resetBotState(): void {
  _mode        = 'seek_player';
  _wanderAngle = Math.random() * Math.PI * 2;
  _wanderTimer = 0;
}

export interface BotTickResult {
  state: GameState;
  firedProjectile: Projectile | null;
}

export function tickBot(
  state: GameState,
  level: number,
  now: number,
  dt: number
): BotTickResult {
  const scaling   = botScalingForLevel(level);
  let s           = state;
  let cpu         = { ...s.players.player2 };
  const player    = s.players.player1;
  const active    = s.activePowerUps.player2;

  // Determine target: player or decoy (whichever is closer when decoy is alive)
  let targetX = player.x;
  let targetY = player.y;
  if (s.decoy?.alive) {
    const dPlayer = Math.hypot(player.x - cpu.x, player.y - cpu.y);
    const dDecoy  = Math.hypot(s.decoy.position.x - cpu.x, s.decoy.position.y - cpu.y);
    if (dDecoy < dPlayer) {
      targetX = s.decoy.position.x;
      targetY = s.decoy.position.y;
    }
  }

  // Decide mode
  const nearestPickup = pickupToSeek(s, cpu);
  if (!active && nearestPickup && Math.random() < scaling.pathingQuality) {
    _mode = 'seek_pickup';
  } else {
    _mode = Math.random() < scaling.pathingQuality ? 'seek_player' : 'wander';
  }

  // Movement speed
  const spd = cpu.speed * scaling.speedMultiplier;

  // Phase Beam lock: suppress movement
  const isMovementLocked = s.phaseBeamLockedSlots.includes('player2');

  let newAngle = cpu.angle;
  if (!isMovementLocked) {
    const destX = _mode === 'seek_pickup' && nearestPickup
      ? nearestPickup.position.x
      : _mode === 'seek_player'
        ? targetX
        : cpu.x + Math.cos(_wanderAngle) * 40;

    const destY = _mode === 'seek_pickup' && nearestPickup
      ? nearestPickup.position.y
      : _mode === 'seek_player'
        ? targetY
        : cpu.y + Math.sin(_wanderAngle) * 40;

    // Turn toward destination
    const desired = Math.atan2(destY - cpu.y, destX - cpu.x);
    const angleDiff = normaliseAngle(desired - cpu.angle);
    const turnAmt   = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), scaling.turnRate * dt);
    newAngle = cpu.angle + turnAmt;

    // Advance position (simple, no pathfinding grid — wander avoids walls naturally via bouncing)
    const newX = cpu.x + Math.cos(newAngle) * spd * dt;
    const newY = cpu.y + Math.sin(newAngle) * spd * dt;

    // Avoid own mines
    let blocked = false;
    for (const mine of s.mines) {
      if (mine.ownedBy !== 'player2') continue;
      if (Math.hypot(mine.position.x - newX, mine.position.y - newY) < TANK_RADIUS + 10) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      cpu.x = Math.max(TANK_RADIUS, Math.min(/* CANVAS_WIDTH */ 760 - TANK_RADIUS, newX));
      cpu.y = Math.max(TANK_RADIUS, Math.min(/* CANVAS_HEIGHT */ 600 - TANK_RADIUS, newY));
    } else {
      // Steer away
      newAngle = cpu.angle + Math.PI * 0.4;
    }
    cpu.angle = newAngle;

    // Wander timer
    _wanderTimer -= dt;
    if (_wanderTimer <= 0) {
      _wanderAngle = Math.random() * Math.PI * 2;
      _wanderTimer = 1 + Math.random() * 2;
    }
  }

  // ── Magazine tick ─────────────────────────────────────────────────────
  if (!active && cpu.reloadTimeRemaining > 0) {
    cpu.reloadTimeRemaining = Math.max(0, cpu.reloadTimeRemaining - dt * 1000);
    if (cpu.reloadTimeRemaining === 0) cpu.bulletsRemaining = MAGAZINE_SIZE;
  }

  s = { ...s, players: { ...s.players, player2: cpu } };

  // ── Firing logic ─────────────────────────────────────────────────────
  let firedProjectile: Projectile | null = null;
  const canFire = !s.phaseBeamLockedSlots.includes('player2') &&
    active?.type !== PowerUpType.PhaseShift;

  if (canFire) {
    const distToTarget = Math.hypot(targetX - cpu.x, targetY - cpu.y);
    const aimAngle = aimAtTarget(cpu.x, cpu.y, targetX, targetY, scaling.aimAccuracy);

    // Decide to fire: probabilistic, scaled by aim accuracy
    const shouldFire = distToTarget < 350 &&
      now - _lastShotAt > 600 &&
      Math.random() < scaling.aimAccuracy * dt * 5;

    if (shouldFire) {
      const result = fireCpuBullet(s, cpu, aimAngle, active, now, dt);
      if (result) {
        s = result.state;
        firedProjectile = result.projectile;
        _lastShotAt = now;
      }
    }
  }

  return { state: s, firedProjectile };
}

function aimAtTarget(
  fromX: number, fromY: number,
  toX: number, toY: number,
  accuracy: number
): number {
  const base = Math.atan2(toY - fromY, toX - fromX);
  const spread = (1 - accuracy) * 0.6; // max 0.6 rad spread at accuracy=0
  return base + (Math.random() - 0.5) * spread * 2;
}

function pickupToSeek(state: GameState, cpu: Player): PowerUpPickup | null {
  if (state.pickups.length === 0) return null;
  let best: PowerUpPickup | null = null;
  let bestDist = Infinity;
  for (const pu of state.pickups) {
    const d = Math.hypot(pu.position.x - cpu.x, pu.position.y - cpu.y);
    if (d < bestDist) { bestDist = d; best = pu; }
  }
  return best;
}

function fireCpuBullet(
  state: GameState,
  cpu: Player,
  angle: number,
  active: typeof state.activePowerUps.player2,
  now: number,
  dt: number
): { state: GameState; projectile: Projectile } | null {
  if (!active) {
    // Normal bullet
    if (cpu.bulletsRemaining <= 0) return null;
    const proj: Projectile = makeProjectile('player2', cpu.x, cpu.y, angle, null, now);
    const newCpu = {
      ...cpu,
      bulletsRemaining: cpu.bulletsRemaining - 1,
      reloadTimeRemaining: cpu.bulletsRemaining - 1 === 0 ? RELOAD_MS : cpu.reloadTimeRemaining,
    };
    return {
      state: {
        ...state,
        players: { ...state.players, player2: newCpu },
        projectiles: [...state.projectiles, proj],
      },
      projectile: proj,
    };
  }

  // Power-up fire
  switch (active.type) {
    case PowerUpType.ShotgunBlast: {
      const shells: Projectile[] = [];
      for (let i = 0; i < 10; i++) {
        const spread = (i - 4.5) * 0.06;
        shells.push(makeProjectile('player2', cpu.x, cpu.y, angle + spread, active.type, now));
      }
      const { state: s2, spent } = spendShot(state, 'player2');
      return { state: { ...s2, projectiles: [...s2.projectiles, ...shells] }, projectile: shells[0] };
    }
    case PowerUpType.TripleBarrel: {
      const bullets = [-0.15, 0, 0.15].map(offset =>
        makeProjectile('player2', cpu.x, cpu.y, angle + offset, active.type, now)
      );
      const { state: s2 } = spendShot(state, 'player2');
      return { state: { ...s2, projectiles: [...s2.projectiles, ...bullets] }, projectile: bullets[1] };
    }
    case PowerUpType.RicochetLaser: {
      const proj = makeProjectile('player2', cpu.x, cpu.y, angle, active.type, now, BULLET_SPEED * 10);
      return {
        state: {
          ...state,
          projectiles: [...state.projectiles, proj],
          activePowerUps: { ...state.activePowerUps, player2: null },
        },
        projectile: proj,
      };
    }
    default: {
      const proj = makeProjectile('player2', cpu.x, cpu.y, angle, active.type, now);
      return {
        state: { ...state, projectiles: [...state.projectiles, proj] },
        projectile: proj,
      };
    }
  }
}

export function makeProjectile(
  ownedBy: PlayerSlot,
  x: number, y: number,
  angle: number,
  type: PowerUpType | null,
  now: number,
  speed: number = BULLET_SPEED
): Projectile {
  return {
    id: `${ownedBy}_${now}_${Math.random().toString(36).slice(2)}`,
    ownedBy,
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    firedAt: now,
    powerUpType: type,
    generation: 0,
    isReturning: false,
    wallContactCount: 0,
    pathLog: [],
  };
}

function normaliseAngle(a: number): number {
  while (a >  Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}