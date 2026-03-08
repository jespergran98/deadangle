'use client';

import { useState, useEffect } from 'react';
import { useStartFlow } from '@/features/start/hooks/useStartFlow';
import ModeSelector from '@/features/start/components/ModeSelector/ModeSelector';
import RoomCodeInput from '@/features/start/components/RoomCodeInput/RoomCodeInput';
import styles from './page.module.css';

/**
 * /  — Dead Angle start screen.
 *
 * Layout (all absolute strips clear .content padding):
 *   .screen        height:100dvh, overflow:hidden — hard viewport lock
 *   .bgGrid        fixed phosphor-dot matrix background texture
 *   .topStrip      absolute top:42px — score header (3-col grid + double-rule)
 *   .marqueeBand   absolute top:96px — seamless coin-op attract ticker
 *   .content       flex-column centred, clamp padding clears strips
 *   .bottomStrip   absolute bottom:42px — INSERT COIN blink + credits
 *
 * Score strip (3-column grid):
 *   .scorePanel    grid-template-columns: 1fr 1px 1.3fr 1px 1fr
 *   .scoreSep      1px vertical hairlines between columns
 *   .scoreRule     double-channel horizontal bar (physical glass-etch line)
 *
 * Seamless marquee:
 *   .marqueeTrack  inline-flex, text duplicated — animation translateX(0→-50%)
 *
 * No-layout-shift guarantee:
 *   .controls      min-height:200px hard reserve — see CSS comment for math.
 *
 * Bezel corners: L-bracket (2-sided border) + vertex diamond (::before).
 * Bezel rails: 10px height for tick marks via repeating-gradient + comet.
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

/* ── Attract ticker text — duplicated for seamless loop ───── */
const TICKER =
  '◆ DEAD ANGLE \u00B7 NEON MAZE COMBAT \u00B7 © 1984 DEAD ANGLE SYSTEMS \u00B7 ' +
  'INSERT COIN TO START \u00B7 P1 VS P2 \u00B7 DEFEAT ALL ENEMIES \u00B7 ' +
  'HI-SCORE 99400 \u00B7 CREDITS 00 \u00B7 BEWARE THE DEAD ANGLE \u00B7 ';

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

      {/* ── Phosphor-dot background matrix ── */}
      <div className={styles.bgGrid} aria-hidden="true" />

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

      {/* ── Bezel corner L-brackets + vertex diamonds ── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Bezel rails with tick marks ── */}
      <span className={`${styles.edgeLine} ${styles.edgeLineTop}`}    aria-hidden="true" />
      <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineL}`}            aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineR}`}            aria-hidden="true" />

      {/* ── Top score strip — 3-column with dividers ── */}
      <div className={styles.topStrip} aria-hidden="true">
        <div className={styles.scorePanel}>

          <div className={styles.scoreCol}>
            <span className={`${styles.scoreLabel} ${styles.scoreLabelP1}`}>1UP</span>
            <span className={`${styles.scoreValue} ${styles.scoreValueP1}`}>{fmt(scores.p1)}</span>
          </div>

          <div className={styles.scoreSep} />

          <div className={styles.scoreCol}>
            <span className={`${styles.scoreLabel} ${styles.scoreLabelHi}`}>HI-SCORE</span>
            <span className={`${styles.scoreValue} ${styles.scoreValueHi}`}>{fmt(scores.hi)}</span>
          </div>

          <div className={styles.scoreSep} />

          <div className={styles.scoreCol}>
            <span className={`${styles.scoreLabel} ${styles.scoreLabelP2}`}>2UP</span>
            <span className={`${styles.scoreValue} ${styles.scoreValueP2}`}>{fmt(scores.p2)}</span>
          </div>

        </div>
        {/* Double-channel glass-etch line below score block */}
        <div className={styles.scoreRule} />
      </div>

      {/* ── Attract marquee ticker — text doubled for seamless loop ── */}
      <div className={styles.marqueeBand} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          <span className={styles.marqueeText}>{TICKER}</span>
          <span className={styles.marqueeText}>{TICKER}</span>
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
          <span className={styles.sepStar}>✦</span>
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
          <span className={styles.sepStar}>✦</span>
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