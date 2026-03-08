'use client';

import { useState, useEffect } from 'react';
import { useStartFlow } from '@/features/start/hooks/useStartFlow';
import ModeSelector from '@/features/start/components/ModeSelector/ModeSelector';
import RoomCodeInput from '@/features/start/components/RoomCodeInput/RoomCodeInput';
import styles from './page.module.css';

/**
 * /  — Dead Angle start screen.
 *
 * Layout (flex column, NOT vertically centred):
 *   SCREEN           flex column, noise ::before texture
 *   TOP STRIP        position:relative — flows above content
 *   CONTENT          flex:1
 *     HEADER         title (flex ROW) + tagline
 *     SEPARATOR      double cyan rule
 *     TANK           7×12 pixel grid, heartbeat
 *     SEPARATOR      second rule
 *     CONTROLS       ModeSelector + play button
 *   BOTTOM STRIP     absolute, bottom:28px — prompt + credits
 *
 * SCORE COUNT-UP:
 *   useEffect drives a rAF loop that eases scores from 0 to
 *   targets over 2400ms using a cubic ease-out curve.
 *
 * TANK PIXEL GRID:
 *   TANK_GRID is a 12×7 number matrix:
 *     0 = empty   (transparent)
 *     1 = barrel  (cyan  — .tankCellBarrel)
 *     2 = track   (green — .tankCellTrack)
 *     3 = hull    (pink  — .tankCellHull)
 *
 * FALLING SPARKS (SPARK_CONFIG):
 *   12 sparks. Color cycles pink → cyan → green.
 *   Spacing: left = 8 + i × 7.5%. Duration staggered by i % 5.
 *   animationDuration + animationDelay set inline; animationName
 *   comes from styles.spark (CSS Modules scoped).
 *
 * PIXEL DOTS (PX_DOT_CONFIG):
 *   6 dots scattered at viewport edges. Color + boxShadow inline.
 *   animationDelay inline; animationName from styles.pxDot.
 *
 * CORNER ACCENTS (CORNER_ACCENT_CONFIG):
 *   4 small pixel accents near the corner L-brackets.
 *   animationDelay inline; animationName from styles.cornerAccent.
 *
 * PLAY BUTTON:
 *   Shown when mode === 'singleplayer' OR subMode === 'host'.
 *   Does NOT auto-navigate — user must press the play button.
 *   Pink variant for singleplayer, green for host.
 *
 * CRTOverlay mounted once in layout.tsx (scanlines, sweep, glitch bar).
 */

/* ── Colour constants (used in inline styles) ─────────────── */
const PINK  = '#FF2D78';
const CYAN  = '#00F0FF';
const GREEN = '#C8FF00';

/* ── Tank pixel grid ──────────────────────────────────────── */
// 0=empty | 1=barrel(cyan) | 2=track(green) | 3=hull(pink)
const TANK_GRID: number[][] = [
  [0, 0, 0, 1, 0, 0, 0],   // Row  0 — Barrel top
  [0, 0, 0, 1, 0, 0, 0],   // Row  1
  [0, 0, 0, 1, 0, 0, 0],   // Row  2
  [2, 2, 0, 1, 0, 2, 2],   // Row  3 — Track top border
  [2, 0, 0, 1, 0, 0, 2],   // Row  4 — Gap row
  [2, 0, 3, 3, 3, 0, 2],   // Row  5 — Hull start
  [2, 0, 3, 3, 3, 0, 2],   // Row  6
  [2, 0, 3, 3, 3, 0, 2],   // Row  7
  [2, 0, 3, 3, 3, 0, 2],   // Row  8
  [2, 0, 3, 3, 3, 0, 2],   // Row  9
  [2, 0, 0, 0, 0, 0, 2],   // Row 10 — Gap row
  [2, 2, 2, 2, 2, 2, 2],   // Row 11 — Track bottom border
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
const PX_DOT_CONFIG: Array<{
  top: string; left: string; color: string; delay: string;
}> = [
  { top: '15%', left:  '8%', color: CYAN,  delay:  '0s'  },
  { top: '25%', left: '92%', color: PINK,  delay:  '.7s' },
  { top: '55%', left:  '6%', color: GREEN, delay: '1.1s' },
  { top: '70%', left: '94%', color: CYAN,  delay:  '.3s' },
  { top: '42%', left:  '4%', color: PINK,  delay: '1.6s' },
  { top: '80%', left: '89%', color: GREEN, delay:  '.9s' },
];

/* ── Corner accent pixels ─────────────────────────────────── */
// Four small pixels placed just outside the corner L-brackets.
const CORNER_ACCENT_CONFIG: Array<{
  top?: number; bottom?: number;
  left?: number; right?: number;
  color: string; delay: string;
}> = [
  { top:  18, left:  62, color: CYAN,  delay:  '0s'  },
  { top:  62, left:  18, color: CYAN,  delay: '0.35s' },
  { top:  18, right: 62, color: PINK,  delay: '0.70s' },
  { top:  62, right: 18, color: PINK,  delay: '1.05s' },
];

/* ── Score number formatter ───────────────────────────────── */
function fmt(n: number): string {
  return String(Math.floor(n)).padStart(6, '0');
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
    const run = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setScores({
        p1: targets.p1 * e,
        hi: targets.hi * e,
        p2: targets.p2 * e,
      });
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isMultiplayer = flow.mode === 'multiplayer';
  const isJoin        = isMultiplayer && flow.subMode === 'join';
  const showPlayBtn   = flow.mode === 'singleplayer'
    || (flow.mode === 'multiplayer' && flow.subMode === 'host');

  /* Selecting a mode no longer auto-navigates.
     The play button is the explicit action trigger. */
  function handleModeButton(mode: 'singleplayer' | 'multiplayer') {
    flow.selectMode(mode);
  }

  function handleSubMode(sub: 'host' | 'join') {
    flow.selectSubMode(sub);
    /* No auto-trigger for host — play button handles it */
  }

  function handlePlayButton() {
    if (flow.mode === 'singleplayer') {
      flow.handleSingleplayer();
    } else if (flow.subMode === 'host') {
      flow.handleHost();
    }
  }

  return (
    <div className={styles.screen}>

      {/* ── Falling sparks — behind all bezel chrome ── */}
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

      {/* ── Scattered pixel dots at viewport edges ── */}
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

      {/* ── Corner L-brackets ── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Corner accent pixels (4 small dots near brackets) ── */}
      {CORNER_ACCENT_CONFIG.map((d, i) => (
        <div
          key={i}
          className={styles.cornerAccent}
          style={{
            top:    d.top,
            bottom: d.bottom,
            left:   d.left,
            right:  d.right,
            background: d.color,
            boxShadow: `0 0 6px ${d.color}`,
            animationDelay: d.delay,
          }}
          aria-hidden="true"
        />
      ))}

      {/* ── Bezel horizontal rails (both CYAN) ── */}
      <span className={`${styles.edgeLine} ${styles.edgeLineTop}`}    aria-hidden="true" />
      <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} aria-hidden="true" />

      {/* ── Bezel vertical rails (both PINK) ── */}
      <span className={`${styles.vline} ${styles.vlineL}`} aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineR}`} aria-hidden="true" />

      {/* ── Top score strip — flows in flex column (relative) ── */}
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

      {/* ── Main content column — flex:1 ── */}
      <div className={styles.content}>

        {/* MARQUEE ZONE */}
        <header className={styles.header}>
          {/* h1: DEAD and ANGLE side by side (flex row) */}
          <h1 className={styles.title} aria-label="Dead Angle">
            <span className={styles.titleWord} data-text="DEAD">DEAD</span>
            <span className={styles.titleWord} data-text="ANGLE">ANGLE</span>
          </h1>
          <p className={styles.tagline}>NEON MAZE COMBAT</p>
        </header>

        {/* SEPARATOR — first double rule */}
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

        {/* SEPARATOR — second double rule */}
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

          {/* Host inline error */}
          {isMultiplayer && flow.subMode === 'host' && flow.error && (
            <p className={styles.inlineError} role="alert">{flow.error}</p>
          )}

          {/* Room code input (join mode) */}
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

          {/* Play / Host button — explicit action trigger */}
          {showPlayBtn && (
            <button
              className={`${styles.playBtn} ${
                flow.mode === 'singleplayer'
                  ? styles.playBtnPink
                  : styles.playBtnGreen
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