'use client';

import { useStartFlow } from '@/features/start/hooks/useStartFlow';
import ModeSelector from '@/features/start/components/ModeSelector/ModeSelector';
import RoomCodeInput from '@/features/start/components/RoomCodeInput/RoomCodeInput';
import styles from './page.module.css';

/**
 * /  — Dead Angle start screen.
 *
 * Cabinet bezel structure (top → bottom):
 *   TOP STRIP    — 1UP · HIGH SCORE · 2UP, anchored absolute to top bezel
 *   MARQUEE ZONE — massive title with chromatic ghost glitch + glow pulse
 *   SEPARATOR    — solid double-line rule, full content width
 *   MASCOT       — CSS tank icon, heartbeat rhythm (dim → blown-out)
 *   PLAY SURFACE — mode buttons, sub-options, room code input
 *   BOTTOM STRIP — attract prompt, anchored absolute to bottom, hard blink
 *
 * Ghost offsets:
 *   data-text on each .titleWord drives ::before (red, left) and
 *   ::after (cyan, right) with mix-blend-mode: screen. Both snap
 *   violently wider every ~4.5s using sub-frame (0.1%) keyframe spacing
 *   with linear timing — functional snap, not interpolated.
 *
 * CRTOverlay mounted once in layout.tsx (scanlines, sweep, edge dark).
 */
export default function StartPage() {
  const flow = useStartFlow();

  const isMultiplayer = flow.mode === 'multiplayer';
  const isJoin = isMultiplayer && flow.subMode === 'join';

  function handleModeButton(mode: 'singleplayer' | 'multiplayer') {
    flow.selectMode(mode);
    if (mode === 'singleplayer') flow.handleSingleplayer();
  }

  function handleSubMode(sub: 'host' | 'join') {
    flow.selectSubMode(sub);
    if (sub === 'host') flow.handleHost();
  }

  return (
    <div className={styles.screen}>

      {/* ── Bezel corner ornaments — stagger around the frame ── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Bezel horizontal rails ── */}
      <span className={`${styles.edgeLine} ${styles.edgeLineTop}`}    aria-hidden="true" />
      <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} aria-hidden="true" />

      {/* ── Bezel vertical rails ── */}
      <span className={`${styles.vline} ${styles.vlineL}`} aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineR}`} aria-hidden="true" />

      {/* ── Top score strip — 1UP / HIGH SCORE / 2UP ── */}
      <div className={styles.topStrip} aria-hidden="true">
        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>1UP</span>
          <span className={styles.scoreLabel}>HIGH SCORE</span>
          <span className={styles.scoreLabel}>2UP</span>
        </div>
        <div className={styles.scoreRow}>
          <span className={`${styles.scoreValue} ${styles.scoreValueP1}`}>00000</span>
          <span className={`${styles.scoreValue} ${styles.scoreValueHi}`}>00000</span>
          <span className={`${styles.scoreValue} ${styles.scoreValueP2}`}>00000</span>
        </div>
      </div>

      {/* ── Main content — vertically centred in the bezel ── */}
      <div className={styles.content}>

        {/* MARQUEE ZONE */}
        <header className={styles.header}>
          <h1 className={styles.title} aria-label="Dead Angle">
            <span className={styles.titleWord} data-text="DEAD">DEAD</span>
            <span className={styles.titleWord} data-text="ANGLE">ANGLE</span>
          </h1>
          <p className={styles.tagline}>NEON MAZE COMBAT</p>
        </header>

        {/* SEPARATOR — double neon rule */}
        <div className={styles.separator} aria-hidden="true">
          <span className={styles.sepLine} />
          <span className={styles.sepLine} />
        </div>

        {/* MASCOT — heartbeat tank */}
        <div className={styles.tankWrap} aria-hidden="true">
          <div className={styles.tank}>
            <div className={styles.tankBarrel} />
            <div className={styles.tankTurret} />
            <div className={styles.tankHull} />
            <div className={styles.tankTrackL} />
            <div className={styles.tankTrackR} />
          </div>
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
        </section>

      </div>

      {/* ── Bottom attract strip — anchored to bezel ── */}
      <div className={styles.bottomStrip}>
        <span className={styles.prompt}>— SELECT MODE TO BEGIN —</span>
      </div>

    </div>
  );
}