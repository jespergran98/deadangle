/**
 * hitDetection.ts — Singleplayer collision checks per tick.
 * Checks: projectile-vs-player, projectile-vs-CPU, projectile-vs-decoy,
 *         projectile-vs-OrbitalGuard, player-vs-mine, CPU-vs-mine.
 * On kill calls scoring/levelProgression and signals round resolution.
 */

import type { GameState, Projectile, MineState } from '@/types/game.types';
import { PowerUpType } from '@/types/powerup.types';
import type { SingleplayerState, EfficiencyTier } from '@/context/SingleplayerContext';
import { TANK_RADIUS, BULLET_RADIUS, ORBITAL_GUARD_RADIUS } from '../constants';
import { determineEfficiencyTier, calculateKillScore, betterTier } from './scoring';
import { checkLevelUp } from './levelProgression';

export type HitType = 'cpu_kill' | 'player_hit' | 'none';

export interface HitResult {
  type: HitType;
  scoreEarned: number;
  tierLabel: string;
  tier: EfficiencyTier | null;
  levelUp: boolean;
  /** Projectiles destroyed by OrbitalGuard this tick */
  orbitalDestroyedIds: string[];
  /** Decoy hit flag */
  decoyHit: boolean;
  /** Updated mines (after detonations) */
  mines: MineState[];
}

function circleOverlap(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number
): boolean {
  const d = Math.hypot(ax - bx, ay - by);
  return d < ar + br;
}

export function runHitDetection(
  state: GameState,
  spState: SingleplayerState
): HitResult {
  const player = state.players.player1;
  const cpu    = state.players.player2;

  const playerPhaseShift = state.activePowerUps.player1?.type === PowerUpType.PhaseShift;
  const playerShield     = state.activePowerUps.player1?.type === PowerUpType.ProtectiveShield;
  const cpuShield        = state.activePowerUps.player2?.type === PowerUpType.ProtectiveShield;

  // OrbitalGuard — check player/cpu orbit vs enemy projectiles
  const orbitalDestroyedIds: string[] = [];

  const playerOrbital = state.activePowerUps.player1?.type === PowerUpType.OrbitalGuard;
  const cpuOrbital    = state.activePowerUps.player2?.type === PowerUpType.OrbitalGuard;

  for (const proj of state.projectiles) {
    if (playerOrbital && proj.ownedBy === 'player2') {
      const dist = Math.hypot(proj.x - player.x, proj.y - player.y);
      if (Math.abs(dist - ORBITAL_GUARD_RADIUS) < BULLET_RADIUS + 2) {
        orbitalDestroyedIds.push(proj.id);
      }
    }
    if (cpuOrbital && proj.ownedBy === 'player1') {
      const dist = Math.hypot(proj.x - cpu.x, proj.y - cpu.y);
      if (Math.abs(dist - ORBITAL_GUARD_RADIUS) < BULLET_RADIUS + 2) {
        orbitalDestroyedIds.push(proj.id);
      }
    }
  }

  // Check decoy hit
  let decoyHit = false;
  if (state.decoy?.alive) {
    for (const proj of state.projectiles) {
      if (circleOverlap(proj.x, proj.y, BULLET_RADIUS, state.decoy.position.x, state.decoy.position.y, TANK_RADIUS)) {
        decoyHit = true;
        break;
      }
    }
  }

  // Projectile vs player
  if (!playerPhaseShift) {
    for (const proj of state.projectiles) {
      if (proj.ownedBy === 'player1') continue; // own bullet can't self-hit
      if (orbitalDestroyedIds.includes(proj.id)) continue;
      if (circleOverlap(proj.x, proj.y, BULLET_RADIUS, player.x, player.y, TANK_RADIUS)) {
        return {
          type: 'player_hit',
          scoreEarned: 0,
          tierLabel: '',
          tier: null,
          levelUp: false,
          orbitalDestroyedIds,
          decoyHit,
          mines: state.mines,
        };
      }
    }
  }

  // Projectile vs CPU
  for (const proj of state.projectiles) {
    if (proj.ownedBy === 'player2') continue;
    if (orbitalDestroyedIds.includes(proj.id)) continue;

    // OrbitalGuard kill check
    if (proj.powerUpType === PowerUpType.OrbitalGuard) {
      const dist = Math.hypot(proj.x - cpu.x, proj.y - cpu.y);
      if (dist < TANK_RADIUS) {
        const { tier, multiplier, label } = determineEfficiencyTier(spState.roundProjectileCount);
        const score = calculateKillScore(spState.level, multiplier);
        const newKills = spState.totalKills + 1;
        return {
          type: 'cpu_kill',
          scoreEarned: score,
          tierLabel: label,
          tier,
          levelUp: checkLevelUp(newKills),
          orbitalDestroyedIds,
          decoyHit,
          mines: state.mines,
        };
      }
      continue;
    }

    if (circleOverlap(proj.x, proj.y, BULLET_RADIUS, cpu.x, cpu.y, TANK_RADIUS)) {
      const { tier, multiplier, label } = determineEfficiencyTier(spState.roundProjectileCount);
      const score = calculateKillScore(spState.level, multiplier);
      const newKills = spState.totalKills + 1;
      return {
        type: 'cpu_kill',
        scoreEarned: score,
        tierLabel: label,
        tier,
        levelUp: checkLevelUp(newKills),
        orbitalDestroyedIds,
        decoyHit,
        mines: state.mines,
      };
    }
  }

  // Mine vs player / CPU
  const now = Date.now();
  let updatedMines = state.mines;
  for (const mine of state.mines) {
    if (circleOverlap(mine.position.x, mine.position.y, 6, player.x, player.y, TANK_RADIUS)) {
      return {
        type: 'player_hit',
        scoreEarned: 0,
        tierLabel: '',
        tier: null,
        levelUp: false,
        orbitalDestroyedIds,
        decoyHit,
        mines: updatedMines,
      };
    }
    if (circleOverlap(mine.position.x, mine.position.y, 6, cpu.x, cpu.y, TANK_RADIUS)) {
      const { tier, multiplier, label } = determineEfficiencyTier(spState.roundProjectileCount);
      const score = calculateKillScore(spState.level, multiplier);
      const newKills = spState.totalKills + 1;
      return {
        type: 'cpu_kill',
        scoreEarned: score,
        tierLabel: label,
        tier,
        levelUp: checkLevelUp(newKills),
        orbitalDestroyedIds,
        decoyHit,
        mines: updatedMines,
      };
    }
  }

  return {
    type: 'none',
    scoreEarned: 0,
    tierLabel: '',
    tier: null,
    levelUp: false,
    orbitalDestroyedIds,
    decoyHit,
    mines: updatedMines,
  };
}