'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import styles from './GameCanvas.module.css';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/features/game/constants';

interface GameCanvasProps {
  canvasRef:  RefObject<HTMLCanvasElement | null>;
  overlayRef: RefObject<HTMLDivElement   | null>;
}

export default function GameCanvas({ canvasRef, overlayRef }: GameCanvasProps) {
  return (
    <div className={styles.wrapper} style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
      {/* Power-up DOM overlays — positioned absolute over the canvas */}
      <div
        ref={overlayRef}
        className={styles.pickupOverlay}
        aria-hidden="true"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={styles.canvas}
        aria-label="Game arena"
      />
    </div>
  );
}