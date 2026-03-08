'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas    from '@/features/game/components/GameCanvas/GameCanvas';
import SingleplayerHud from '@/features/game/components/SingleplayerHud/SingleplayerHud';
import RoundTransition  from '@/features/game/components/RoundTransition/RoundTransition';
import GameProvider     from '@/context/GameProvider';
import { useGameLoop }  from '@/features/game/hooks/useGameLoop';
import { useKeyboardInput } from '@/features/game/hooks/useKeyboardInput';
import styles from './page.module.css';

// ── Inner component (inside providers) ───────────────────────────────────

function GameScreen() {
  const router      = useRouter();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useKeyboardInput();

  const [transVisible, setTransVisible] = useState(false);
  const [transTimer,   setTransTimer]   = useState(0);
  const timerRef = useRef(0);

  // Track transition externally so RoundTransition can read it
  const showTransition = (secs: number) => {
    setTransTimer(secs);
    setTransVisible(true);
  };

  // Countdown ticking for RoundTransition display
  useEffect(() => {
    if (!transVisible) return;
    const id = setInterval(() => {
      setTransTimer(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(id);
          setTransVisible(false);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [transVisible]);

  function handleGameOver() {
    router.push('/summary');
  }

  useGameLoop({
    canvasRef,
    overlayRef,
    inputRef,
    onGameOver: handleGameOver,
  });

  return (
    <div className={styles.screen}>
      {/* HUD — left panel */}
      <aside className={styles.hudPanel} aria-label="Game status">
        <SingleplayerHud />
      </aside>

      {/* Canvas — centre */}
      <main className={styles.arenaWrap}>
        <div className={styles.arenaInner}>
          <GameCanvas canvasRef={canvasRef} overlayRef={overlayRef} />
          <RoundTransition secondsRemaining={transTimer} visible={transVisible} />
        </div>
      </main>

      {/* Controls legend — right panel */}
      <aside className={styles.controlsPanel} aria-label="Controls">
        <div className={styles.controlsInner}>
          <p className={styles.controlsTitle}>CONTROLS</p>
          <div className={styles.controlsGrid}>
            <span className={styles.key}>W/↑</span><span className={styles.keyDesc}>FORWARD</span>
            <span className={styles.key}>S/↓</span><span className={styles.keyDesc}>REVERSE</span>
            <span className={styles.key}>A/←</span><span className={styles.keyDesc}>TURN L</span>
            <span className={styles.key}>D/→</span><span className={styles.keyDesc}>TURN R</span>
            <span className={styles.key}>Q/SPC</span><span className={styles.keyDesc}>FIRE</span>
          </div>
          <p className={styles.vsLabel}>YOU <span className={styles.vsP}>▮</span> vs CPU <span className={styles.vsC}>▮</span></p>
        </div>
      </aside>
    </div>
  );
}

// ── Page — wraps providers ─────────────────────────────────────────────────

export default function GamePage() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}