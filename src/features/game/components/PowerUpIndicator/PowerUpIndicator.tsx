'use client';

import { useEffect, useRef, useState } from 'react';
import PowerUpIcon from '@/components/PowerUpIcon/PowerUpIcon';
import { usePowerUpState } from '@/features/game/hooks/usePowerUpState';
import { POWERUP_LABEL } from '@/features/game/rendering/drawPowerUps';
import type { PlayerSlot } from '@/types/game.types';
import styles from './PowerUpIndicator.module.css';

interface PowerUpIndicatorProps {
  slot: PlayerSlot;
}

const SIZE   = 48;
const RADIUS = 20;
const CIRC   = 2 * Math.PI * RADIUS;

export default function PowerUpIndicator({ slot }: PowerUpIndicatorProps) {
  const [now, setNow] = useState(() => Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => { setNow(Date.now()); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const { active, fractionRemaining, secondsLabel } = usePowerUpState(slot, now);

  if (!active) {
    return (
      <div className={styles.container} aria-label="No power-up">
        <div className={styles.emptySlot}>
          <span className={styles.emptyGlyph}>—</span>
        </div>
        <span className={styles.emptyLabel}>EMPTY</span>
      </div>
    );
  }

  const label = POWERUP_LABEL[active.type] ?? 'POWER-UP';
  const dashOffset = fractionRemaining !== null
    ? CIRC * (1 - fractionRemaining)
    : CIRC;

  const shotsStr = active.shotsRemaining !== undefined
    ? `${active.shotsRemaining}×`
    : null;

  return (
    <div className={styles.container} aria-label={`Active power-up: ${label}`}>
      <div className={styles.iconWrap}>
        {/* Countdown ring — only for timed power-ups */}
        {fractionRemaining !== null && (
          <svg
            className={styles.ring}
            width={SIZE + 8}
            height={SIZE + 8}
            viewBox={`0 0 ${SIZE + 8} ${SIZE + 8}`}
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx={(SIZE + 8) / 2}
              cy={(SIZE + 8) / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="3"
            />
            {/* Progress */}
            <circle
              cx={(SIZE + 8) / 2}
              cy={(SIZE + 8) / 2}
              r={RADIUS}
              fill="none"
              stroke="#FF2D78"
              strokeWidth="3"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              strokeLinecap="square"
              transform={`rotate(-90 ${(SIZE + 8) / 2} ${(SIZE + 8) / 2})`}
            />
          </svg>
        )}

        <div className={styles.iconInner}>
          <PowerUpIcon type={active.type} size={28} />
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.label}>{label}</span>
        {secondsLabel && <span className={styles.timer}>{secondsLabel}</span>}
        {shotsStr     && <span className={styles.timer}>{shotsStr}</span>}
      </div>
    </div>
  );
}