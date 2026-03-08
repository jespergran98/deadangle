'use client';

import { useState, useEffect } from 'react';
import { useStartFlow } from '@/features/start/hooks/useStartFlow';
import ModeSelector from '@/features/start/components/ModeSelector/ModeSelector';
import RoomCodeInput from '@/features/start/components/RoomCodeInput/RoomCodeInput';
import styles from './page.module.css';

/**
 * /  — Dead Angle start screen.
 *
 * Layout:
 *   .screen        display:flex; align-items:center; justify-content:center
 *                  Full viewport, vertically + horizontally centred.
 *   .topStrip      position:absolute; top:44px — classic arcade header
 *   .content       max-width min(96vw,760px), padding 120px 32px 100px
 *   .bottomStrip   position:absolute; bottom:44px — prompt + credits
 *
 * Entrance animations (staggered zone reveal from original):
 *   .topStrip      fade-in-flat 1.2s
 *   .header        fade-in-flat 0.55s
 *   .tankWrap      fade-in-flat 0.7s 0.2s
 *   .controls      fade-in-up   0.5s 0.32s
 *   .bottomStrip   fade-in-flat 1.4s 0.8s
 *
 * Score count-up:
 *   useEffect rAF loop, cubic ease-out over 2400ms.
 *
 * Tank pixel grid (TANK_GRID):
 *   12×7 matrix. 0=empty, 1=barrel(cyan), 2=track(green), 3=hull(pink).
 *
 * Falling sparks (SPARK_CONFIG):
 *   12 sparks. Color cycles pink→cyan→green.
 *   animationDuration + animationDelay inline; animationName from styles.spark.
 *
 * Pixel dots (PX_DOT_CONFIG):
 *   6 dots at viewport edges. All inline except animationName.
 *
 * Play button:
 *   Shown when mode==='singleplayer' OR subMode==='host'.
 *   Pink for singleplayer, green for host.
 *
 * CRTOverlay mounted once in layout.tsx.
 */

const PINK  = '#FF2D78';
const CYAN  = '#00F0FF';
const GREEN = '#C8FF00';

/* ── Tank grid ────────────────────────────────────────────── */
const TANK_GRID: number[][] = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [2, 2, 0, 1, 0, 2, 2],
  [2, 0, 0, 1, 0, 0, 2],
  [2, 0, 3, 3, 3, 0, 2],
  [2, 0, 3, 3, 3, 0, 2],
  [2, 0, 3, 3, 3, 0, 2],
  [2, 0, 3, 3, 3, 0, 2],
  [2, 0, 3, 3, 3, 0, 2],
  [2, 0, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 2],
];

const CELL_CLASS: Record<number, string> = {
  1: styles.tankCellBarrel,
  2: styles.tankCellTrack,
  3: styles.tankCellHull,
};

/* ── Falling sparks ───────────────────────────────────────── */
const COLORS = [PINK, CYAN, GREEN];
const SPARK_CONFIG = Array.from({ length: 12 }, (_, i) => ({
  left:  `${8 + i * 7.5}%`,
  delay: `${(i * 0.61).toFixed(2)}s`,
  dur:   `${2.2 + (i % 5) * 0.4}s`,
  color: COLORS[i % 3],
}));

/* ── Scattered pixel dots ─────────────────────────────────── */
const PX_DOT_CONFIG = [
  { top: '15%', left:  '8%', color: CYAN,  delay:  '0s'  },
  { top: '25%', left: '92%', color: PINK,  delay:  '.7s' },
  { top: '55%', left:  '6%', color: GREEN, delay: '1.1s' },
  { top: '70%', left: '94%', color: CYAN,  delay:  '.3s' },
  { top: '42%', left:  '4%', color: PINK,  delay: '1.6s' },
  { top: '80%', left: '89%', color: GREEN, delay:  '.9s' },
];

/* ── Score formatter ──────────────────────────────────────── */
function fmt(n: number): string {
  return String(Math.floor(n)).padStart(5, '0');
}

export default function StartPage() {
  const flow = useStartFlow();

  /* Score count-up — cubic ease-out over 2400ms */
  const [scores, setScores] = useState({ p1: 0, hi: 0, p2: 0 });
  useEffect(() => {
    const targets = { p1: 14200, hi: 99400, p2: 8850 };
    let raf: number;
    let t0: number | null = null;
    const dur = 2400;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setScores({ p1: targets.p1 * e, hi: targets.hi * e, p2: targets.p2 * e });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isMultiplayer = flow.mode === 'multiplayer';
  const isJoin        = isMultiplayer && flow.subMode === 'join';
  const showPlayBtn   = flow.mode === 'singleplayer'
    || (flow.mode === 'multiplayer' && flow.subMode === 'host');

  function handleModeButton(mode: 'singleplayer' | 'multiplayer') {
    flow.selectMode(mode);
  }

  function handleSubMode(sub: 'host' | 'join') {
    flow.selectSubMode(sub);
  }

  function handlePlayButton() {
    if (flow.mode === 'singleplayer') flow.handleSingleplayer();
    else if (flow.subMode === 'host') flow.handleHost();
  }

  return (
    <div className={styles.screen}>

      {/* ── Falling sparks ── */}
      {SPARK_CONFIG.map((s, i) => (
        <span
          key={i}
          className={styles.spark}
          style={{
            left: s.left,
            background: s.color,
            boxShadow: `0 0 6px ${s.color}, 0 0 12px ${s.color}`,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
          aria-hidden="true"
        />
      ))}

      {/* ── Scattered pixel dots ── */}
      {PX_DOT_CONFIG.map((d, i) => (
        <div
          key={i}
          className={styles.pxDot}
          style={{
            top: d.top,
            left: d.left,
            background: d.color,
            boxShadow: `0 0 6px ${d.color}, 0 0 12px ${d.color}`,
            animationDelay: d.delay,
          }}
          aria-hidden="true"
        />
      ))}

      {/* ── Bezel corner diamonds ── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Bezel rails ── */}
      <span className={`${styles.edgeLine} ${styles.edgeLineTop}`}    aria-hidden="true" />
      <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineL}`}            aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineR}`}            aria-hidden="true" />

      {/* ── Top score strip — absolute ── */}
      <div className={styles.topStrip} aria-hidden="true">
        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>1UP</span>
          <span className={styles.scoreLabel}>HIGH SCORE</span>
          <span className={styles.scoreLabel}>2UP</span>
        </div>
        <div className={styles.scoreRow}>
          <span className={`${styles.scoreValue} ${styles.scoreValueP1}`}>{fmt(scores.p1)}</span>
          <span className={`${styles.scoreValue} ${styles.scoreValueHi}`}>{fmt(scores.hi)}</span>
          <span className={`${styles.scoreValue} ${styles.scoreValueP2}`}>{fmt(scores.p2)}</span>
        </div>
      </div>

      {/* ── Main content — centred ── */}
      <div className={styles.content}>

        {/* MARQUEE ZONE */}
        <header className={styles.header}>
          <h1 className={styles.title} aria-label="Dead Angle">
            <span className={styles.titleWord} data-text="DEAD">DEAD</span>
            <span className={styles.titleWord} data-text="ANGLE">ANGLE</span>
          </h1>
          <p className={styles.tagline}>NEON MAZE COMBAT</p>
        </header>

        {/* SEPARATOR */}
        <div className={styles.separator} aria-hidden="true">
          <span className={styles.sepLine} />
          <span className={styles.sepLine} />
        </div>

        {/* MASCOT — pixel-grid tank */}
        <div className={styles.tankWrap} aria-hidden="true">
          <div className={styles.tankGrid}>
            {TANK_GRID.map((row, ri) =>
              row.map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`${styles.tankCell}${cell !== 0 ? ` ${CELL_CLASS[cell]}` : ''}`}
                />
              ))
            )}
          </div>
        </div>

        {/* SEPARATOR */}
        <div className={styles.separator} aria-hidden="true">
          <span className={styles.sepLine} />
          <span className={styles.sepLine} />
        </div>

        {/* PLAY SURFACE */}
        <section className={styles.controls}>
          <ModeSelector
            mode={flow.mode}
            subMode={flow.subMode}
            loading={flow.loading}
            onSelectMode={handleModeButton}
            onSelectSubMode={handleSubMode}
            onHost={flow.handleHost}
          />

          {isMultiplayer && flow.subMode === 'host' && flow.error && (
            <p className={styles.inlineError} role="alert">{flow.error}</p>
          )}

          {isJoin && (
            <div className={styles.joinSection}>
              <RoomCodeInput
                value={flow.roomCode}
                loading={flow.loading}
                error={flow.error}
                onChange={flow.setRoomCode}
                onSubmit={flow.handleJoin}
              />
            </div>
          )}

          {showPlayBtn && (
            <button
              className={`${styles.playBtn} ${
                flow.mode === 'singleplayer' ? styles.playBtnPink : styles.playBtnGreen
              }`}
              onClick={handlePlayButton}
              disabled={flow.loading}
              aria-busy={flow.loading}
            >
              {flow.loading
                ? 'LOADING…'
                : flow.mode === 'singleplayer'
                  ? '▶ START GAME'
                  : '▶ HOST ROOM'}
            </button>
          )}
        </section>

      </div>

      {/* ── Bottom attract strip — absolute ── */}
      <div className={styles.bottomStrip}>
        <span className={styles.prompt}>— INSERT COIN TO CONTINUE —</span>
        <div className={styles.creditsRow} aria-hidden="true">
          <span className={styles.creditItem}>CREDITS</span>
          <span className={styles.creditVal}>00</span>
          <span className={styles.creditItem}>© 1984 DEAD ANGLE SYSTEMS</span>
        </div>
      </div>

    </div>
  );
}