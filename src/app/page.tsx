'use client';

import { useState, useEffect } from 'react';
import { useStartFlow } from '@/features/start/hooks/useStartFlow';
import ModeSelector from '@/features/start/components/ModeSelector/ModeSelector';
import RoomCodeInput from '@/features/start/components/RoomCodeInput/RoomCodeInput';
import styles from './page.module.css';

/**
 * /  — Dead Angle start screen.
 *
 * Tank geometry — original 7×12 grid rotated 90° CW then mirrored:
 *
 *   Original (7 col × 12 row, barrel pointing UP at col 3):
 *     Rows  0–2: [0,0,0,1,0,0,0]   barrel tip
 *     Row   3:   [2,2,0,1,0,2,2]   track corners + barrel
 *     Row   4:   [2,0,0,1,0,0,2]
 *     Rows  5–9: [2,0,3,3,3,0,2]   hull (3×5 block)
 *     Row  10:   [2,0,0,0,0,0,2]
 *     Row  11:   [2,2,2,2,2,2,2]   bottom track
 *
 *   Right-facing (90° CW, 12 col × 7 row, barrel points RIGHT at row 3):
 *     Row 0: [1,1,1,1,1,1,1,1,1,0,0,0]
 *     Row 1: [1,0,0,0,0,0,0,0,1,0,0,0]
 *     Row 2: [1,0,1,1,1,1,1,0,0,0,0,0]
 *     Row 3: [1,0,1,1,1,1,1,1,1,1,1,1]  ← barrel extends right
 *     Row 4: [1,0,1,1,1,1,1,0,0,0,0,0]
 *     Row 5: [1,0,0,0,0,0,0,0,1,0,0,0]
 *     Row 6: [1,1,1,1,1,1,1,1,1,0,0,0]
 *
 *   Left-facing (horizontal mirror, 12 col × 7 row, barrel points LEFT):
 *     Row 0: [0,0,0,1,1,1,1,1,1,1,1,1]
 *     Row 1: [0,0,0,1,0,0,0,0,0,0,0,1]
 *     Row 2: [0,0,0,0,0,1,1,1,1,1,0,1]
 *     Row 3: [1,1,1,1,1,1,1,1,1,1,0,1]  ← barrel extends left
 *     Row 4: [0,0,0,0,0,1,1,1,1,1,0,1]
 *     Row 5: [0,0,0,1,0,0,0,0,0,0,0,1]
 *     Row 6: [0,0,0,1,1,1,1,1,1,1,1,1]
 *
 *   Cell: 5px, gap: 1px → tank = 71px × 41px
 *   All filled pixels are a single flat colour per tank.
 */

const PINK  = '#FF2D78';
const CYAN  = '#00F0FF';
const GREEN = '#C8FF00';

/* ── P1 tank — faces RIGHT — all filled pixels = pink ── */
const PINK_TANK: number[][] = [
  [1,1,1,1,1,1,1,1,1,0,0,0],
  [1,0,0,0,0,0,0,0,1,0,0,0],
  [1,0,1,1,1,1,1,0,0,0,0,0],
  [1,0,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,0,0,0,0,0],
  [1,0,0,0,0,0,0,0,1,0,0,0],
  [1,1,1,1,1,1,1,1,1,0,0,0],
];

/* ── P2 tank — faces LEFT — all filled pixels = green ── */
const GREEN_TANK: number[][] = [
  [0,0,0,1,1,1,1,1,1,1,1,1],
  [0,0,0,1,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,0,1],
  [0,0,0,0,0,1,1,1,1,1,0,1],
  [0,0,0,1,0,0,0,0,0,0,0,1],
  [0,0,0,1,1,1,1,1,1,1,1,1],
];

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

/* ── Attract ticker — doubled for seamless loop ───────────── */
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

      {/* ── Bezel corner L-brackets ── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Bezel rails ── */}
      <span className={`${styles.edgeLine} ${styles.edgeLineTop}`}    aria-hidden="true" />
      <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineL}`}            aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineR}`}            aria-hidden="true" />

      {/* ── Top score strip ── */}
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
        <div className={styles.scoreRule} />
      </div>

      {/* ── Attract marquee ticker ── */}
      <div className={styles.marqueeBand} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          <span className={styles.marqueeText}>{TICKER}</span>
          <span className={styles.marqueeText}>{TICKER}</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={styles.content}>

        {/* TITLE */}
        <header className={styles.header}>
          <h1 className={styles.title} aria-label="Dead Angle">
            <span className={styles.titleWord} data-text="DEAD">DEAD</span>
            <span className={styles.titleWord} data-text="ANGLE">ANGLE</span>
          </h1>
          <p className={styles.tagline}>NEON MAZE COMBAT</p>
        </header>

        {/* BATTLE ARENA
            Top double cyan rule
            Left: P1 pink tank (barrel facing right)
            Centre: bullet channel — single bullet alternates directions
            Right: P2 green tank (barrel facing left)
            Bottom double cyan rule                                      */}
        <div className={styles.arenaWrap} aria-hidden="true">

          <div className={styles.arenaRule} />

          <div className={styles.arenaField}>

            {/* P1 — pink, 12 col × 7 row, barrel pointing right */}
            <div className={styles.tankLeft}>
              <div className={styles.tankGrid}>
                {PINK_TANK.map((row, ri) =>
                  row.map((filled, ci) => (
                    <div
                      key={`p${ri}-${ci}`}
                      className={filled ? `${styles.cell} ${styles.pink}` : styles.cell}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Bullet channel — single element, bullet-duel animates L↔R */}
            <div className={styles.bulletTrack}>
              <div className={styles.bullet} />
            </div>

            {/* P2 — green, 12 col × 7 row, barrel pointing left */}
            <div className={styles.tankRight}>
              <div className={styles.tankGrid}>
                {GREEN_TANK.map((row, ri) =>
                  row.map((filled, ci) => (
                    <div
                      key={`g${ri}-${ci}`}
                      className={filled ? `${styles.cell} ${styles.green}` : styles.cell}
                    />
                  ))
                )}
              </div>
            </div>

          </div>

          <div className={styles.arenaRule} />

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

      {/* ── Bottom attract strip ── */}
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