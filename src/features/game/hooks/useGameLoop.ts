'use client';

/**
 * useGameLoop.ts — Dead Angle singleplayer
 *
 * requestAnimationFrame loop.  Each frame (dt capped at 50 ms):
 *
 *   1. Move player1        — apply keyboard input, push out of walls, clamp to world
 *   2. Fire latch          — create one projectile per key-press, decrement magazine
 *   3. Reload timer        — count down; restore magazine on completion
 *   4. simulateProjectiles — advance all bullets, reflect off maze walls + world edges
 *   5. tickBot             — CPU turn (no-op stub for MVP)
 *   6. detectHits          — remove bullets on tank contact, log hit to console
 *   7. Commit state        — write new GameState to the mutable ref
 *   8. Draw                — clearRect → drawMaze → drawProjectiles → drawPlayers
 *   9. HUD update          — throttled to ~10 Hz; the only React setState in this hook
 *
 * All game state lives in a mutable ref and never triggers React re-renders.
 * The throttled HUD snapshot is the only piece of React state.
 */

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  WORLD_W, WORLD_H, CELL,
  TANK_RADIUS, TANK_SPEED, TANK_TURN,
  MAGAZINE_SIZE, RELOAD_MS,
  BARREL_TIP_OFFSET,
  P1_SPAWN_COL, P1_SPAWN_ROW,
  P2_SPAWN_COL, P2_SPAWN_ROW,
} from '@/features/game/constants';
import type { GameState, Player } from '@/types/game.types';
import { generateMaze }       from '@/features/game/singleplayer/mazeGenerator';
import { resolveCircleWalls } from '@/features/game/physics/wallReflection';
import {
  createProjectile,
  simulateProjectiles,
}                             from '@/features/game/physics/projectileSimulation';
import { tickBot }            from '@/features/game/singleplayer/bot';
import { detectHits }         from '@/features/game/singleplayer/hitDetection';
import { drawMaze }           from '@/features/game/rendering/drawMaze';
import { drawPlayers }        from '@/features/game/rendering/drawPlayers';
import { drawProjectiles }    from '@/features/game/rendering/drawProjectiles';
import { useKeyboardInput }   from './useKeyboardInput';

// ---------------------------------------------------------------------------
// State factory
// ---------------------------------------------------------------------------

function makePlayer(
  slot:  'player1' | 'player2',
  col:   number,
  row:   number,
  angle: number,
): Player {
  return {
    slot,
    x:                   (col + 0.5) * CELL,
    y:                   (row + 0.5) * CELL,
    angle,
    speed:               TANK_SPEED,
    turnRate:            TANK_TURN,
    bulletsRemaining:    MAGAZINE_SIZE,
    reloadTimeRemaining: 0,
    magazineSnapshot:    null,
  };
}

function initGameState(): GameState {
  return {
    players: {
      player1: makePlayer('player1', P1_SPAWN_COL, P1_SPAWN_ROW, 0),
      player2: makePlayer('player2', P2_SPAWN_COL, P2_SPAWN_ROW, Math.PI),
    },
    projectiles:          [],
    maze:                 generateMaze(),
    pickups:              [],
    activePowerUps:       { player1: null, player2: null },
    mines:                [],
    decoy:                null,
    gravityWell:          null,
    phaseBeamLockedSlots: [],
  };
}

// ---------------------------------------------------------------------------
// Player movement — pure function, returns a new Player object
// ---------------------------------------------------------------------------

interface InputSnapshot {
  forward: boolean;
  back:    boolean;
  left:    boolean;
  right:   boolean;
}

function advancePlayer(
  p:     Player,
  input: InputSnapshot,
  dt:    number,
  walls: GameState['maze']['walls'],
): Player {
  // Rotation is applied before movement so the velocity vector uses the
  // updated heading — identical to the behaviour the player perceives.
  let angle = p.angle;
  if (input.left)  angle -= p.turnRate * dt;
  if (input.right) angle += p.turnRate * dt;

  let dx = 0;
  let dy = 0;
  if (input.forward) { dx += Math.cos(angle) * p.speed * dt; dy += Math.sin(angle) * p.speed * dt; }
  if (input.back)    { dx -= Math.cos(angle) * p.speed * dt; dy -= Math.sin(angle) * p.speed * dt; }

  // Push out of any wall the candidate position overlaps (2 passes for corners).
  const resolved = resolveCircleWalls(p.x + dx, p.y + dy, TANK_RADIUS, walls);

  // Hard-clamp to world boundaries as a last resort (walls on every edge
  // already prevent this in a correctly generated maze, but safety first).
  const x = Math.max(TANK_RADIUS, Math.min(WORLD_W - TANK_RADIUS, resolved.x));
  const y = Math.max(TANK_RADIUS, Math.min(WORLD_H - TANK_RADIUS, resolved.y));

  return { ...p, x, y, angle };
}

// ---------------------------------------------------------------------------
// HUD state exposed to React
// ---------------------------------------------------------------------------

export interface HudState {
  p1Bullets:   number;
  p1Reloading: boolean;
  p1ReloadMs:  number;  // ms remaining in reload
  p2Bullets:   number;
  p2Reloading: boolean;
  p2ReloadMs:  number;  // ms remaining in reload
}

const INITIAL_HUD: HudState = {
  p1Bullets:   MAGAZINE_SIZE,
  p1Reloading: false,
  p1ReloadMs:  0,
  p2Bullets:   MAGAZINE_SIZE,
  p2Reloading: false,
  p2ReloadMs:  0,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): HudState {
  const inputRef = useKeyboardInput();

  // ── Lazy game-state ref ────────────────────────────────────────────────
  // Do NOT write `useRef(initGameState())`.  React evaluates the argument
  // on EVERY render even though useRef only consumes it on the first mount.
  // That would call generateMaze() (non-trivial BFS + DFS work) on each
  // re-render triggered by the HUD setState, discarding the result immediately.
  //
  // Instead: initialise once inside the render function with an explicit
  // null-guard — reads on subsequent renders hit the early return instantly.
  const stateRef = useRef<GameState | null>(null);
  if (stateRef.current === null) {
    stateRef.current = initGameState();
  }

  // ── Cached 2-D context ─────────────────────────────────────────────────
  // Calling canvas.getContext('2d') every frame is an avoidable lookup.
  // We cache it once after mount (inside the effect) and reuse it.
  // imageSmoothingEnabled = false is also set once here, not each frame.
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Per-frame fire latch — holding the key fires only one bullet per press.
  const fireLatchRef  = useRef(false);

  // Throttled HUD snapshot (~10 Hz) — the only React state in this hook.
  const lastHudTsRef  = useRef(0);
  const [hudState, setHudState] = useState<HudState>(INITIAL_HUD);

  const prevTsRef = useRef<number | null>(null);

  useEffect(() => {
    // Cache the 2-D context once — getContext returns the same object every
    // call but the look-up itself is an avoidable cost per frame.
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false; // set once; never changes
        ctxRef.current = ctx;
      }
    }

    let rafId: number;

    function tick(timestamp: number): void {
      // ── Delta time ────────────────────────────────────────────────────
      // Cap at 50 ms so a tab-switch never causes a physics explosion.
      const prev = prevTsRef.current ?? timestamp;
      const dt   = Math.min((timestamp - prev) / 1000, 0.05);
      prevTsRef.current = timestamp;

      // Snapshot the mutable state ref and input ref for this frame.
      const gs    = stateRef.current!;
      const input = inputRef.current;

      // ── 1. Move player1 ───────────────────────────────────────────────
      let p1 = advancePlayer(gs.players.player1, input, dt, gs.maze.walls);

      // ── 2. Fire ───────────────────────────────────────────────────────
      let projs = gs.projectiles;

      if (input.fire) {
        if (!fireLatchRef.current) {
          fireLatchRef.current = true;
          if (p1.bulletsRemaining > 0 && p1.reloadTimeRemaining === 0) {
            // Spawn bullet at barrel tip, not tank centre.
            //
            // BARREL_TIP_OFFSET (= TANK_RADIUS − 1 = 6 px) places the origin
            // 6 px ahead of the centre in the facing direction.
            // Because resolveCircleWalls guarantees the centre is always
            // ≥ TANK_RADIUS (7 px) from any wall, the bullet starts at least
            // 1 px clear of every wall — ensuring reflectProjectileStep's
            // strict-inequality straddle check fires correctly on frame 1.
            const bx = p1.x + Math.cos(p1.angle) * BARREL_TIP_OFFSET;
            const by = p1.y + Math.sin(p1.angle) * BARREL_TIP_OFFSET;
            projs = [...projs, createProjectile('player1', bx, by, p1.angle)];
            const after = p1.bulletsRemaining - 1;
            p1 = {
              ...p1,
              bulletsRemaining:    after,
              // Auto-reload when the last bullet is fired.
              reloadTimeRemaining: after === 0 ? RELOAD_MS : 0,
            };
          }
        }
      } else {
        fireLatchRef.current = false;
      }

      // ── 3. Reload timer ───────────────────────────────────────────────
      if (p1.reloadTimeRemaining > 0) {
        const remaining = Math.max(0, p1.reloadTimeRemaining - dt * 1000);
        p1 = {
          ...p1,
          reloadTimeRemaining: remaining,
          // Restore full magazine the instant the timer reaches zero.
          bulletsRemaining: remaining === 0 ? MAGAZINE_SIZE : p1.bulletsRemaining,
        };
      }

      // ── 4. Simulate projectiles ───────────────────────────────────────
      projs = simulateProjectiles(projs, dt, gs.maze.walls);

      // ── 5. Tick bot ───────────────────────────────────────────────────
      const { bot: p2, newBullets } = tickBot(gs.players.player2, p1, gs.maze, dt);
      if (newBullets.length > 0) projs = [...projs, ...newBullets];

      // ── 6. Hit detection ──────────────────────────────────────────────
      projs = detectHits(projs, p1, p2);

      // ── 7. Commit state ───────────────────────────────────────────────
      stateRef.current = {
        ...gs,
        players:     { player1: p1, player2: p2 },
        projectiles: projs,
      };

      // ── 8. Draw ───────────────────────────────────────────────────────
      const ctx = ctxRef.current;
      if (ctx) {
        // clearRect leaves every pixel transparent so the page background
        // colour shows through removed/inactive maze cells without any fill.
        ctx.clearRect(0, 0, WORLD_W, WORLD_H);
        drawMaze(ctx, stateRef.current.maze.walls); // walls are immutable; Path2D cache keyed on reference
        drawProjectiles(ctx, projs);                 // use local var: already latest after detectHits
        drawPlayers(ctx, stateRef.current.players);
      }

      // ── 9. HUD update (~10 Hz) ────────────────────────────────────────
      if (timestamp - lastHudTsRef.current >= 100) {
        lastHudTsRef.current = timestamp;
        const fp1 = stateRef.current.players.player1;
        const fp2 = stateRef.current.players.player2;
        setHudState({
          p1Bullets:   fp1.bulletsRemaining,
          p1Reloading: fp1.reloadTimeRemaining > 0,
          p1ReloadMs:  fp1.reloadTimeRemaining,
          p2Bullets:   fp2.bulletsRemaining,
          p2Reloading: fp2.reloadTimeRemaining > 0,
          p2ReloadMs:  fp2.reloadTimeRemaining,
        });
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      // Reset timestamp so the next mount starts with dt = 0 rather than
      // inheriting the stale prev value from a previous mount.
      prevTsRef.current = null;
    };
    // canvasRef is a stable ref object — including it in the dep array would
    // cause the effect to re-run if the ref wrapper itself were replaced,
    // which React never does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hudState;
}