'use client';

import type { StartMode, MultiplayerSubMode } from '@/features/start/hooks/useStartFlow';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  mode: StartMode;
  subMode: MultiplayerSubMode;
  loading: boolean;
  onSelectMode: (m: StartMode) => void;
  onSelectSubMode: (s: MultiplayerSubMode) => void;
  onHost: () => void;
}

export default function ModeSelector({
  mode,
  subMode,
  loading,
  onSelectMode,
  onSelectSubMode,
}: ModeSelectorProps) {
  const hostLoading = loading && subMode === 'host';

  return (
    <div className={styles.root}>

      {/* ── Primary mode buttons — 1 PLAYER / 2 PLAYER ── */}
      <div className={styles.modeRow} role="group" aria-label="Game mode">
        <button
          className={`${styles.modeBtn} ${mode === 'singleplayer' ? styles.modeBtnActive : ''}`}
          onClick={() => onSelectMode('singleplayer')}
          aria-pressed={mode === 'singleplayer'}
        >
          1 PLAYER
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'multiplayer' ? styles.modeBtnActive : ''}`}
          onClick={() => onSelectMode('multiplayer')}
          aria-pressed={mode === 'multiplayer'}
        >
          2 PLAYER
        </button>
      </div>

      {/* ── Multiplayer sub-options — HOST / JOIN ── */}
      {mode === 'multiplayer' && (
        <div className={styles.subRow} role="group" aria-label="Multiplayer option">
          <button
            className={`${styles.subBtn} ${subMode === 'host' ? styles.subBtnActive : ''}`}
            onClick={() => onSelectSubMode('host')}
            disabled={hostLoading}
            aria-pressed={subMode === 'host'}
            aria-busy={hostLoading}
          >
            {hostLoading ? 'CONNECTING…' : 'HOST'}
          </button>
          <button
            className={`${styles.subBtn} ${subMode === 'join' ? styles.subBtnActive : ''}`}
            onClick={() => onSelectSubMode('join')}
            aria-pressed={subMode === 'join'}
          >
            JOIN
          </button>
        </div>
      )}

    </div>
  );
}