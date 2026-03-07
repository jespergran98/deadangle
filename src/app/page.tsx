'use client';

import { useStartFlow } from '@/features/start/hooks/useStartFlow';
import ModeSelector from '@/features/start/components/ModeSelector/ModeSelector';
import RoomCodeInput from '@/features/start/components/RoomCodeInput/RoomCodeInput';
import styles from './page.module.css';

/**
 * /  — Dead Angle start screen.
 *
 * 1980s arcade attract-mode.
 * Title: hot pink with hard cyan offset drop-shadow (moodboard spec).
 * Decorative CSS tank token in neon green below title.
 * Corner diamond ornaments in alternating pink / cyan.
 * CRTOverlay already active via layout.tsx.
 *
 * Layout (top → bottom):
 *   Title block  →  decorative divider  →  tank icon
 *   →  mode selector  →  (multiplayer) sub-options
 *   →  (join) room code input  →  footer prompt
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

      {/* ── Corner ornaments ── */}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      {/* ── Horizontal edge lines (top + bottom decoration) ── */}
      <span className={`${styles.edgeLine} ${styles.edgeLineTop}`}    aria-hidden="true" />
      <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} aria-hidden="true" />

      <div className={styles.content}>

        {/* ── Title block ── */}
        <header className={styles.header}>
          <h1 className={styles.title} aria-label="Dead Angle">
            <span className={styles.titleWord}>DEAD</span>
            <span className={styles.titleWord}>ANGLE</span>
          </h1>
          <p className={styles.tagline}>NEON MAZE COMBAT</p>
        </header>

        {/* ── Decorative horizontal rule ── */}
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerDiamond} />
          <span className={styles.dividerLine} />
        </div>

        {/* ── CSS tank token — decorative, neon green ── */}
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

        {/* ── Footer attract prompt ── */}
        <footer className={styles.footer}>
          <span className={styles.prompt}>— SELECT MODE TO BEGIN —</span>
        </footer>

      </div>
    </div>
  );
}