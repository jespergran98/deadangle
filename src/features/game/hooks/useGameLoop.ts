/**
 * useGameLoop.ts — Singleplayer requestAnimationFrame game loop.
 *
 * Per-frame order (strictly enforced):
 * 1. projectileSimulation (calls powerUpEffects internally)
 * 2. bot tick
 * 3. hitDetection
 * 4. powerUpManager tick
 * 5. trajectoryPreview (if player holds RicochetLaser, hasn't fired)
 * 6. Draw: drawMaze → drawPowerUps → drawPowerUpEffects → drawPlayers → drawProjectiles
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import type { GameState, Player, Projectile } from '@/types/game.types';
import { PowerUpType, POWER_UP_METADATA } from '@/types/powerup.types';

import { useGameContext, INITIAL_GAME_STATE }       from '@/context/GameContext';
import { useSingleplayerContext, INITIAL_SP_STATE } from '@/context/SingleplayerContext';
import type { SingleplayerState }                   from '@/context/SingleplayerContext';

import { stepProjectiles }           from '../physics/projectileSimulation';
import { computeTrajectory }         from '../physics/trajectoryPreview';
import type { TrajectorySegment }    from '../physics/trajectoryPreview';

import { tickBot, makeProjectile, resetBotState } from '../singleplayer/bot';
import { runHitDetection }                         from '../singleplayer/hitDetection';
import {
  initPowerUpManager,
  tickPowerUpManager,
  roundEndCleanup,
  addPhaseBeamLock,
  spendShot,
} from '../singleplayer/powerUpManager';
import { generateMaze }     from '../singleplayer/mazeGenerator';
import { betterTier }       from '../singleplayer/scoring';

import { drawMaze }                      from '../rendering/drawMaze';
import { drawPowerUps, syncPickupOverlays } from '../rendering/drawPowerUps';
import { drawPowerUpEffects }            from '../rendering/drawPowerUpEffects';
import { drawPlayers }                   from '../rendering/drawPlayers';
import { drawProjectiles }               from '../rendering/drawProjectiles';

import type { InputState } from './useKeyboardInput';
import {
  TANK_RADIUS, BULLET_SPEED, MAGAZINE_SIZE, RELOAD_MS,
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../constants';

// GatlingSpin: 1s spin-up, then 1 bullet / 200ms, max 25
const GATLING_SPINUP_MS  = 1000;
const GATLING_INTERVAL   = 200;

let _gatlingLastFire = 0;
let _gatlingBulletsFired = 0;

export interface UseGameLoopOptions {
  canvasRef:    RefObject<HTMLCanvasElement | null>;
  overlayRef:   RefObject<HTMLDivElement   | null>;
  inputRef:     RefObject<InputState>;
  onGameOver:   () => void;
}

export function useGameLoop({ canvasRef, overlayRef, inputRef, onGameOver }: UseGameLoopOptions): void {
  const { setGameState } = useGameContext();
  const { setSpState }   = useSingleplayerContext();

  // Mutable refs — source of truth for the game loop (not React state)
  const gsRef   = useRef<GameState>({ ...INITIAL_GAME_STATE });
  const spRef   = useRef<SingleplayerState>({ ...INITIAL_SP_STATE });
  const openRef = useRef<boolean[][]>([]);
  const centresRef = useRef<Array<{ x: number; y: number }>>([]);
  const phaseRef = useRef<'playing' | 'transition' | 'gameover'>('playing');
  const transitionTimerRef = useRef(0);
  const roundRef = useRef(0);
  const trajRef  = useRef<TrajectorySegment[]>([]);

  // ── Round initialisation ────────────────────────────────────────────────
  const startRound = useCallback((now: number) => {
    const sp = spRef.current;

    // 1. Apply pendingLevelUp
    if (sp.pendingLevelUp) {
      sp.level++;
      sp.hearts = Math.min(6, sp.hearts + 1);
      sp.pendingLevelUp = false;
    }

    // 2. Generate new maze
    const mazeData = generateMaze();
    openRef.current   = mazeData.open;
    centresRef.current = mazeData.openCentres;

    // 3. Spawn player and CPU at opposite ends
    const gs   = gsRef.current;
    const basePlayer: Partial<Player> = {
      bulletsRemaining: MAGAZINE_SIZE,
      reloadTimeRemaining: 0,
      magazineSnapshot: null,
    };

    const newGs = roundEndCleanup({
      ...gs,
      maze: mazeData.layout,
      players: {
        player1: {
          ...gs.players.player1,
          ...basePlayer,
          x: mazeData.p1Spawn.x,
          y: mazeData.p1Spawn.y,
          angle: 0,
          speed: 130 + (sp.level - 1) * 8,
          turnRate: 2.2,
        },
        player2: {
          ...gs.players.player2,
          ...basePlayer,
          x: mazeData.p2Spawn.x,
          y: mazeData.p2Spawn.y,
          angle: Math.PI,
          speed: 130 + (sp.level - 1) * 8,
          turnRate: 2.2,
        },
      },
    });

    gsRef.current = newGs;
    spRef.current = {
      ...sp,
      roundProjectileCount: 0,
      lastRoundResult: null,
      bulletsRemaining: MAGAZINE_SIZE,
      reloadTimeRemaining: 0,
    };

    resetBotState();
    initPowerUpManager(now);
    phaseRef.current = 'playing';
    roundRef.current++;
    _gatlingLastFire    = 0;
    _gatlingBulletsFired = 0;
  }, []);

  // ── Main loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    // Init first round
    const now0 = performance.now();
    spRef.current = { ...INITIAL_SP_STATE };
    startRound(now0);

    let animId:   number;
    let lastTime: number | null = null;

    const loop = (timestamp: number) => {
      const now = timestamp;
      const dt  = lastTime !== null ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime  = now;

      // ── Transition phase ─────────────────────────────────────────────
      if (phaseRef.current === 'transition') {
        transitionTimerRef.current -= dt;
        if (transitionTimerRef.current <= 0) {
          // Check game over
          if (spRef.current.hearts <= 0) {
            phaseRef.current = 'gameover';
            // Sync final state to React
            setSpState(() => ({ ...spRef.current }));
            onGameOver();
            return;
          }
          startRound(now);
        }
        animId = requestAnimationFrame(loop);
        return;
      }
      if (phaseRef.current === 'gameover') return;

      // ────────────────────────────────────────────────────────────────
      // STEP 1: projectileSimulation
      // ────────────────────────────────────────────────────────────────
      let gs = gsRef.current;
      const { projectiles: newProjs, expired, newProjectiles } = stepProjectiles(gs, dt, now);

      // Handle ClusterOrb detonations
      let extra: Projectile[] = [...newProjs];
      for (const e of expired) {
        if (e.type === PowerUpType.ClusterOrb) {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            extra.push(makeProjectile(
              gs.projectiles.find(p => p.id === e.id)?.ownedBy ?? 'player1',
              e.x, e.y, angle, PowerUpType.ClusterOrb, now
            ));
          }
        }
      }

      // Count new projectiles for roundProjectileCount
      const newProjCount = newProjectiles.length;

      gs = { ...gs, projectiles: extra };

      // ────────────────────────────────────────────────────────────────
      // STEP 2: bot tick
      // ────────────────────────────────────────────────────────────────
      const botResult = tickBot(gs, spRef.current.level, now, dt);
      gs = botResult.state;
      if (botResult.firedProjectile) {
        spRef.current.roundProjectileCount++;
      }

      // Count SplitterRound children for projectile count
      if (newProjCount > 0) {
        spRef.current.roundProjectileCount += newProjCount;
      }

      // ────────────────────────────────────────────────────────────────
      // STEP 3: hitDetection
      // ────────────────────────────────────────────────────────────────
      const hit = runHitDetection(gs, spRef.current);

      // Remove orbital-destroyed projectiles
      if (hit.orbitalDestroyedIds.length > 0) {
        gs = { ...gs, projectiles: gs.projectiles.filter(p => !hit.orbitalDestroyedIds.includes(p.id)) };
      }

      // Handle decoy hit
      if (hit.decoyHit && gs.decoy?.alive) {
        gs = { ...gs, decoy: { ...gs.decoy!, alive: false } };
      }

      if (hit.type !== 'none') {
        const sp = spRef.current;
        if (hit.type === 'cpu_kill') {
          const newKills = sp.totalKills + 1;
          const newScore = sp.cumulativeScore + hit.scoreEarned;
          const bestTier = betterTier(sp.bestEfficiencyTierThisRun, hit.tier!);
          spRef.current = {
            ...sp,
            totalKills: newKills,
            cumulativeScore: newScore,
            bestEfficiencyTierThisRun: bestTier,
            pendingLevelUp: sp.pendingLevelUp || hit.levelUp,
            lastRoundResult: {
              type: 'cpu_kill',
              scoreEarned: hit.scoreEarned,
              tierLabel: hit.tier ?? undefined,
              levelUp: hit.levelUp,
            },
          };
        } else {
          const newHearts = sp.hearts - 1;
          spRef.current = {
            ...sp,
            hearts: newHearts,
            lastRoundResult: { type: 'player_hit' },
          };
        }
        gsRef.current = gs;
        phaseRef.current = 'transition';
        transitionTimerRef.current = 3.0;
        setSpState(() => ({ ...spRef.current }));
        setGameState(() => ({ ...gsRef.current }));
        animId = requestAnimationFrame(loop);
        return;
      }

      // ────────────────────────────────────────────────────────────────
      // STEP 4: powerUpManager tick
      // ────────────────────────────────────────────────────────────────
      const pmResult = tickPowerUpManager(gs, now, centresRef.current);
      gs = pmResult.state;

      // ────────────────────────────────────────────────────────────────
      // Player movement & firing
      // ────────────────────────────────────────────────────────────────
      const input = inputRef.current;
      const player = { ...gs.players.player1 };
      const moveLocked = gs.phaseBeamLockedSlots.includes('player1');
      const fireLocked = gs.activePowerUps.player1?.type === PowerUpType.PhaseShift;

      if (!moveLocked) {
        if (input.left)  player.angle -= player.turnRate * dt;
        if (input.right) player.angle += player.turnRate * dt;
        if (input.up) {
          player.x += Math.cos(player.angle) * player.speed * dt;
          player.y += Math.sin(player.angle) * player.speed * dt;
        }
        if (input.down) {
          player.x -= Math.cos(player.angle) * player.speed * dt;
          player.y -= Math.sin(player.angle) * player.speed * dt;
        }
        // Clamp to canvas
        player.x = Math.max(TANK_RADIUS, Math.min(CANVAS_WIDTH  - TANK_RADIUS, player.x));
        player.y = Math.max(TANK_RADIUS, Math.min(CANVAS_HEIGHT - TANK_RADIUS, player.y));
      }

      // Magazine reload tick
      const active1 = gs.activePowerUps.player1;
      if (!active1 && player.reloadTimeRemaining > 0) {
        player.reloadTimeRemaining = Math.max(0, player.reloadTimeRemaining - dt * 1000);
        if (player.reloadTimeRemaining === 0) player.bulletsRemaining = MAGAZINE_SIZE;
      }

      gs = { ...gs, players: { ...gs.players, player1: player } };

      // ── Player fire ───────────────────────────────────────────────────
      if (!fireLocked && input.firePulse) {
        input.firePulse = false; // consume pulse
        gs = handlePlayerFire(gs, player, now);
      }

      // GatlingSpin auto-fire
      if (active1?.type === PowerUpType.GatlingSpin) {
        const age = now - active1.activatedAt;
        if (age >= GATLING_SPINUP_MS) {
          if (now - _gatlingLastFire >= GATLING_INTERVAL) {
            if (_gatlingBulletsFired < 25) {
              const proj = makeProjectile('player1', player.x, player.y, player.angle, PowerUpType.GatlingSpin, now);
              gs = { ...gs, projectiles: [...gs.projectiles, proj] };
              spRef.current.roundProjectileCount++;
              _gatlingLastFire = now;
              _gatlingBulletsFired++;
              // Recoil
              const newX = player.x - Math.cos(player.angle) * 4;
              const newY = player.y - Math.sin(player.angle) * 4;
              gs = {
                ...gs,
                players: {
                  ...gs.players,
                  player1: {
                    ...gs.players.player1,
                    x: Math.max(TANK_RADIUS, Math.min(CANVAS_WIDTH  - TANK_RADIUS, newX)),
                    y: Math.max(TANK_RADIUS, Math.min(CANVAS_HEIGHT - TANK_RADIUS, newY)),
                  },
                },
              };
            }
            if (_gatlingBulletsFired >= 25) {
              // Expire GatlingSpin
              gs = { ...gs, activePowerUps: { ...gs.activePowerUps, player1: null } };
            }
          }
        }
      }

      // Decoy movement
      if (gs.decoy?.alive) {
        const d    = gs.decoy;
        const spd  = 80;
        const newX = d.position.x + Math.cos(d.movementDirection) * spd * dt;
        const newY = d.position.y + Math.sin(d.movementDirection) * spd * dt;
        gs = {
          ...gs,
          decoy: {
            ...d,
            position: {
              x: Math.max(TANK_RADIUS, Math.min(CANVAS_WIDTH  - TANK_RADIUS, newX)),
              y: Math.max(TANK_RADIUS, Math.min(CANVAS_HEIGHT - TANK_RADIUS, newY)),
            },
          },
        };
      }

      gsRef.current = gs;
      spRef.current.bulletsRemaining     = gs.players.player1.bulletsRemaining;
      spRef.current.reloadTimeRemaining  = gs.players.player1.reloadTimeRemaining;

      // ────────────────────────────────────────────────────────────────
      // STEP 5: trajectoryPreview (RicochetLaser pre-fire)
      // ────────────────────────────────────────────────────────────────
      if (gs.activePowerUps.player1?.type === PowerUpType.RicochetLaser) {
        trajRef.current = computeTrajectory(
          gs.players.player1.x,
          gs.players.player1.y,
          gs.players.player1.angle,
          gs.maze.walls
        );
      } else {
        trajRef.current = [];
      }

      // ────────────────────────────────────────────────────────────────
      // STEP 6: Draw
      // ────────────────────────────────────────────────────────────────
      drawMaze(ctx, gs.maze);
      drawPowerUps(ctx, gs);
      drawPowerUpEffects(ctx, gs, now, { trajectorySegments: trajRef.current });
      drawPlayers(ctx, gs, now);
      drawProjectiles(ctx, gs, now);

      // Sync DOM overlays
      if (overlayRef.current) {
        syncPickupOverlays(overlayRef.current, gs.pickups);
      }

      // ── Sync React state for HUD (throttled to avoid excess renders) ──
      // Only sync on meaningful change
      setSpState(prev => {
        const sp = spRef.current;
        if (
          prev.roundProjectileCount !== sp.roundProjectileCount ||
          prev.bulletsRemaining     !== sp.bulletsRemaining     ||
          prev.reloadTimeRemaining  !== sp.reloadTimeRemaining  ||
          prev.cumulativeScore      !== sp.cumulativeScore      ||
          prev.hearts               !== sp.hearts               ||
          prev.level                !== sp.level
        ) {
          return { ...sp };
        }
        return prev;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ── Player fire helper ─────────────────────────────────────────────────────

function handlePlayerFire(gs: GameState, player: Player, now: number): GameState {
  const active = gs.activePowerUps.player1;

  if (!active) {
    // Normal fire
    if (player.bulletsRemaining <= 0 || player.reloadTimeRemaining > 0) return gs;
    const proj = makeProjectile('player1', player.x, player.y, player.angle, null, now);
    const newBullets = player.bulletsRemaining - 1;
    return {
      ...gs,
      projectiles: [...gs.projectiles, proj],
      players: {
        ...gs.players,
        player1: {
          ...player,
          bulletsRemaining: newBullets,
          reloadTimeRemaining: newBullets === 0 ? RELOAD_MS : 0,
        },
      },
    };
  }

  // Power-up fire
  switch (active.type) {
    case PowerUpType.RicochetLaser: {
      const proj = makeProjectile('player1', player.x, player.y, player.angle, active.type, now, BULLET_SPEED * 10);
      return {
        ...gs,
        projectiles: [...gs.projectiles, proj],
        activePowerUps: { ...gs.activePowerUps, player1: null },
      };
    }
    case PowerUpType.ShotgunBlast: {
      const shells: Projectile[] = [];
      for (let i = 0; i < 10; i++) {
        const spread = (i - 4.5) * 0.06;
        shells.push(makeProjectile('player1', player.x, player.y, player.angle + spread, active.type, now));
      }
      const { state: s2 } = spendShot(gs, 'player1');
      return { ...s2, projectiles: [...s2.projectiles, ...shells] };
    }
    case PowerUpType.TripleBarrel: {
      const bullets = [-0.15, 0, 0.15].map(offset =>
        makeProjectile('player1', player.x, player.y, player.angle + offset, active.type, now)
      );
      const { state: s2 } = spendShot(gs, 'player1');
      return { ...s2, projectiles: [...s2.projectiles, ...bullets] };
    }
    case PowerUpType.PhaseBeam: {
      const proj = makeProjectile('player1', player.x, player.y, player.angle, active.type, now);
      return addPhaseBeamLock(
        { ...gs, projectiles: [...gs.projectiles, proj] },
        'player1'
      );
    }
    case PowerUpType.ClusterOrb: {
      const proj = makeProjectile('player1', player.x, player.y, player.angle, active.type, now, BULLET_SPEED * 0.4);
      return {
        ...gs,
        projectiles: [...gs.projectiles, proj],
        activePowerUps: { ...gs.activePowerUps, player1: null },
      };
    }
    case PowerUpType.LockOnMissile:
    case PowerUpType.Boomerang:
    case PowerUpType.OrbitalGuard:
    case PowerUpType.SplitterRound: {
      const proj = makeProjectile('player1', player.x, player.y, player.angle, active.type, now);
      return {
        ...gs,
        projectiles: [...gs.projectiles, proj],
        activePowerUps: { ...gs.activePowerUps, player1: null },
      };
    }
    default:
      return gs;
  }
}