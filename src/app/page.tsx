'use client';

import { useStartFlow } from '@/features/start/hooks/useStartFlow';
import ModeSelector from '@/features/start/components/ModeSelector/ModeSelector';
import RoomCodeInput from '@/features/start/components/RoomCodeInput/RoomCodeInput';
import styles from './page.module.css';

/**
 * /  — Dead Angle start screen.
 *
 * 1980s arcade cabinet attract-mode.
 *
 * Title: data-text attributes drive ::before (red ghost, left) and
 * ::after (cyan ghost, right) pseudo-elements with mix-blend-mode: screen.
 * Both ghosts rest at a small offset; every few seconds they snap
 * violently wider with a brief skew, then snap back instantly.
 *
 * Decorative additions vs previous version:
 *   - Vertical side lines (vlineL / vlineR) flanking the content
 *   - Corner diamonds at 24px with a scale-pop animation
 *   - Tank heartbeat (dim → painfully bright → dim)
 *   - Footer prompt fully on / fully off (no dimming, step-end)
 *
 * CRTOverlay already active via layout.tsx.
 */
export default function StartPage() {
  const flow = useStartFlow();

  const isMultiplayer = flow.mode === 'multiplayer';
  const isJoin = isMultiplayer && flow.subMode === 'join';

  function handleModeButton(mode: 'singleplayer' | 'multiplayer') {
    flow.selectMode(mode);
    if (mode === 'singleplayer') {
      flow.handleSingleplayer();
    }
  }

  function handleSubMode(sub: 'host' | 'join') {
    flow.selectSubMode(sub);
    if (sub === 'host') {
      flow.handleHost();
    }
  }

  return (
    <div className={styles.screen}>

      {/* ── Corner ornaments — 24px diamonds, alternating pink/cyan ── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Horizontal edge lines — top + bottom ── */}
      <span className={`${styles.edgeLine} ${styles.edgeLineTop}`}    aria-hidden="true" />
      <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} aria-hidden="true" />

      {/* ── Vertical side lines — left + right ── */}
      <span className={`${styles.vline} ${styles.vlineL}`} aria-hidden="true" />
      <span className={`${styles.vline} ${styles.vlineR}`} aria-hidden="true" />

      <div className={styles.content}>

        {/* ── Title block ── */}
        <header className={styles.header}>
          {/*
            data-text is consumed by ::before (red ghost, left offset)
            and ::after (cyan ghost, right offset) in page.module.css.
            Every few seconds both ghosts snap violently wider with a
            brief skew, then snap back instantly.
          */}
          <h1 className={styles.title} aria-label="Dead Angle">
            <span className={styles.titleWord} data-text="DEAD">DEAD</span>
            <span className={styles.titleWord} data-text="ANGLE">ANGLE</span>
          </h1>
          <p className={styles.tagline}>NEON MAZE COMBAT</p>
        </header>

        {/* ── Decorative horizontal rule ── */}
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerDiamond} />
          <span className={styles.dividerLine} />
        </div>

        {/* ── CSS tank token — neon green, heartbeat rhythm ── */}
        <div className={styles.tankWrap} aria-hidden="true">
          <div className={styles.tank}>
            {/* barrel */}
            <div className={styles.tankBarrel} />
            {/* turret */}
            <div className={styles.tankTurret} />
            {/* hull */}
            <div className={styles.tankHull} />
            {/* tracks */}
            <div className={styles.tankTrackL} />
            <div className={styles.tankTrackR} />
          </div>
        </div>

        {/* ── Mode selector ── */}
        <section className={styles.controls}>
          <ModeSelector
            mode={flow.mode}
            subMode={flow.subMode}
            loading={flow.loading}
            onSelectMode={handleModeButton}
            onSelectSubMode={handleSubMode}
            onHost={flow.handleHost}
          />

          {/* HOST error feedback */}
          {isMultiplayer && flow.subMode === 'host' && flow.error && (
            <p className={styles.inlineError} role="alert">{flow.error}</p>
          )}

          {/* JOIN flow */}
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

        {/* ── Footer attract prompt — fully on/off blink ── */}
        <footer className={styles.footer}>
          <span className={styles.prompt}>— SELECT MODE TO BEGIN —</span>
        </footer>

      </div>
    </div>
  );
}