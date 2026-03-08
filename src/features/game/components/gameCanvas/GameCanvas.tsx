'use client';

/**
 * GameCanvas.tsx — Dead Angle
 *
 * Renders the game canvas at the correct aspect ratio (7:4 / 560×320) and
 * mounts the singleplayer game loop via useGameLoop.
 *
 * Layout:
 *   canvasOuter            — max-width constrained to 560×320 ratio, centred
 *     canvasWrap           — aspect-ratio box (560/320 = 7/4)
 *       <canvas>           — drawing buffer 560×320 px
 *     hud                  — HUD strip below canvas
 *       hudPanel (P1/pink) — bullet count + reload bar
 *       hudPanel (P2/green)
 *
 * The canvas HTML attributes (width/height) set the internal drawing-buffer
 * resolution.  CSS makes the element scale to its container.
 * All game logic operates in world-space coordinates (0..560, 0..320).
 */

import { useRef, memo } from 'react';
import { WORLD_W, WORLD_H, MAGAZINE_SIZE, RELOAD_MS } from '@/features/game/constants';
import { useGameLoop } from '@/features/game/hooks/useGameLoop';
import styles from './GameCanvas.module.css';

// ---------------------------------------------------------------------------
// Sub-components (memoised — re-render only when props change)
// ---------------------------------------------------------------------------

interface BulletIconsProps {
  count: number;
  isP2:  boolean;
}

const BulletIcons = memo(function BulletIcons({ count, isP2 }: BulletIconsProps) {
  const icons = Array.from({ length: MAGAZINE_SIZE }, (_, i) => {
    const filled = i < count;
    return (
      <svg
        key={i}
        className={`${styles.bullet} ${filled ? styles.bulletFull : styles.bulletEmpty}`}
        viewBox="0 0 8 8"
        aria-hidden="true"
      >
        {filled
          ? <rect x="0" y="0" width="8" height="8" fill="currentColor" />
          : <rect x="1" y="1" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        }
      </svg>
    );
  });

  // P2 icons display right-to-left so the barrel end aligns with the right panel edge.
  return (
    <div className={styles.bulletRow}>
      {isP2 ? [...icons].reverse() : icons}
    </div>
  );
});

interface ReloadBarProps {
  reloadMs: number; // ms remaining in reload (0 → bar full, RELOAD_MS → empty)
  isP2:     boolean;
}

const ReloadBar = memo(function ReloadBar({ reloadMs, isP2 }: ReloadBarProps) {
  // pct = 0 when reload just started, 100 when complete.
  const pct = Math.round(((RELOAD_MS - reloadMs) / RELOAD_MS) * 100);
  return (
    <div className={styles.reloadRow}>
      <div
        className={styles.reloadBar}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${styles.reloadFill} ${isP2 ? styles.reloadFillP2 : styles.reloadFillP1}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.reloadLabel}>RELOAD</span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hud       = useGameLoop(canvasRef);

  return (
    <div className={styles.canvasOuter}>

      {/* ── Game canvas ────────────────────────────────────────── */}
      <div className={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={WORLD_W}
          height={WORLD_H}
          aria-label="Dead Angle game arena"
        />
      </div>

      {/* ── HUD panels below canvas ────────────────────────────── */}
      <div className={styles.hud} aria-label="Game status">

        {/* Player 1 — pink, left-aligned */}
        <div className={`${styles.hudPanel} ${styles.hudPanelP1}`}>
          <span className={styles.hudLabel}>PLAYER</span>
          {hud.p1Reloading
            ? <ReloadBar reloadMs={hud.p1ReloadMs} isP2={false} />
            : <BulletIcons count={hud.p1Bullets}   isP2={false} />
          }
        </div>

        {/* CPU — green, right-aligned */}
        <div className={`${styles.hudPanel} ${styles.hudPanelP2}`}>
          <span className={styles.hudLabel}>CPU</span>
          {hud.p2Reloading
            ? <ReloadBar reloadMs={hud.p2ReloadMs} isP2={true} />
            : <BulletIcons count={hud.p2Bullets}   isP2={true} />
          }
        </div>

      </div>
    </div>
  );
}