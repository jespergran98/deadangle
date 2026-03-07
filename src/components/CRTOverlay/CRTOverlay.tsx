import styles from './CRTOverlay.module.css';

/**
 * CRTOverlay
 *
 * Fixed full-viewport wrapper mounted once in layout.tsx.
 * Three child layers simulate a real phosphor CRT tube:
 *   1. .overlay wrapper — edge darkening via inset box-shadow
 *      + border-radius to suggest curved glass + phosphor flicker
 *   2. .scanlines child — animated dark bands drifting downward
 *      via repeating-linear-gradient + translateY loop
 *   3. .sweep child — bright horizontal band drifting top → bottom
 *
 * pointer-events: none on all layers — never intercepts any input.
 * Pure CSS — no canvas, no JS, no animation libraries.
 * aria-hidden: true — purely decorative, invisible to screen readers.
 * No startup or mount animation.
 */
export default function CRTOverlay() {
  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.scanlines} />
      <div className={styles.sweep} />
    </div>
  );
}