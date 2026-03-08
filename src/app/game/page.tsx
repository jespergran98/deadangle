'use client';

/**
 * /game — Dead Angle singleplayer game screen.
 *
 * Mounts GameCanvas (canvas + HUD) inside the full-viewport wrapper.
 * GameProvider wraps the subtree so hooks can write GameContext if needed.
 * All game logic lives in useGameLoop; this page is intentionally thin.
 */

import GameCanvas    from '@/features/game/components/gameCanvas/GameCanvas';
import { GameProvider } from '@/context/GameProvider';
import styles from './page.module.css';

export default function GamePage() {
  return (
    <GameProvider>
      <div className={styles.screen}>
        <GameCanvas />
      </div>
    </GameProvider>
  );
}