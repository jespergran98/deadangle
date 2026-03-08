'use client';

import { useEffect, useState, useRef } from 'react';
import { useSingleplayerContext } from '@/context/SingleplayerContext';
import styles from './RoundTransition.module.css';

interface RoundTransitionProps {
  /** Seconds remaining in transition (3→0). */
  secondsRemaining: number;
  visible: boolean;
}

export default function RoundTransition({ secondsRemaining, visible }: RoundTransitionProps) {
  const { spState } = useSingleplayerContext();
  const result = spState.lastRoundResult;

  if (!visible) return null;

  const countNum = Math.ceil(secondsRemaining);

  return (
    <div className={styles.overlay} role="status" aria-live="assertive">
      <div className={styles.panel}>

        {result?.type === 'cpu_kill' && (
          <>
            <p className={styles.killLine}>CPU ELIMINATED</p>
            {result.scoreEarned !== undefined && (
              <p className={styles.scoreLine}>
                +{result.scoreEarned}
              </p>
            )}
            {result.tierLabel && (
              <p className={styles.tierLine}>{result.tierLabel.toUpperCase()}</p>
            )}
            {result.levelUp && (
              <p className={styles.levelUp}>▲ LEVEL UP</p>
            )}
          </>
        )}

        {result?.type === 'player_hit' && (
          <p className={styles.hitLine}>HIT!</p>
        )}

        <div className={styles.countdown} aria-label={`${countNum} seconds`}>
          {countNum}
        </div>

      </div>
    </div>
  );
}