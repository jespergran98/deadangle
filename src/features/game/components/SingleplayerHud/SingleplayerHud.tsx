'use client';

import React from 'react';
import { useSingleplayerContext } from '@/context/SingleplayerContext';
import { determineEfficiencyTier } from '@/features/game/singleplayer/scoring';
import PowerUpIndicator from '../PowerUpIndicator/PowerUpIndicator';
import styles from './SingleplayerHud.module.css';

const MAX_HEARTS = 6;

export default function SingleplayerHud() {
  const { spState } = useSingleplayerContext();
  const {
    level, hearts, cumulativeScore,
    roundProjectileCount, bulletsRemaining, reloadTimeRemaining,
  } = spState;

  const tierInfo   = determineEfficiencyTier(roundProjectileCount);
  const reloadSecs = (reloadTimeRemaining / 1000).toFixed(1);

  return (
    <div className={styles.hud} role="status" aria-live="polite">

      {/* Level */}
      <div className={styles.row}>
        <span className={styles.label}>LVL</span>
        <span className={styles.valueGreen}>{String(level).padStart(2, '0')}</span>
      </div>

      {/* Hearts row */}
      <div className={styles.row}>
        <span className={styles.label}>♥</span>
        <div className={styles.hearts} aria-label={`${hearts} of ${MAX_HEARTS} lives`}>
          {Array.from({ length: MAX_HEARTS }, (_, i) => (
            <span
              key={i}
              className={i < hearts ? styles.heartFull : styles.heartEmpty}
              aria-hidden="true"
            >
              ♥
            </span>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className={styles.row}>
        <span className={styles.label}>PTS</span>
        <span className={styles.valuePink}>
          {String(cumulativeScore).padStart(6, '0')}
        </span>
      </div>

      {/* Efficiency tier */}
      <div className={styles.tierRow}>
        <span className={styles.tierLabel}>{tierInfo.label}</span>
      </div>

      {/* Ammo */}
      <div className={styles.row}>
        <span className={styles.label}>AMO</span>
        {reloadTimeRemaining > 0
          ? <span className={styles.reload}>RLOAD {reloadSecs}s</span>
          : <span className={styles.ammo}>
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className={i < bulletsRemaining ? styles.bulletFull : styles.bulletEmpty}
                  aria-hidden="true"
                >
                  ▮
                </span>
              ))}
            </span>
        }
      </div>

      {/* Power-up slot */}
      <div className={styles.powerUpRow}>
        <PowerUpIndicator slot="player1" />
      </div>

    </div>
  );
}