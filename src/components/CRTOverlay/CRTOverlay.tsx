import styles from './CRTOverlay.module.css';

/**
 * CRTOverlay
 *
 * Fixed full-viewport shell mounted once in layout.tsx.
 * Three layered CSS effects simulate a phosphor CRT tube:
 *
 *   .overlay    — edge darkening via inset box-shadow (4 directions,
 *                 not a radial vignette). border-radius suggests the
 *                 curved glass of a CRT cabinet monitor. Phosphor
 *                 flicker via crt-flicker animation.
 *
 *   .scanlines  — dark bands drifting downward continuously.
 *                 repeating-linear-gradient scrolled via translateY.
 *                 One pitch (6px) per cycle for seamless loop.
 *                 Opacity is intentionally high — looks like active redraw.
 *
 *   .sweep      — bright 280px feathered band drifting top → bottom
 *                 on a slow 10s loop. Clearly visible as it passes.
 *
 * pointer-events: none on all elements — never intercepts input.
 * Pure CSS — no canvas, no JS, no animation libraries.
 * aria-hidden: true — decorative, invisible to screen readers.
 * No startup / mount animation.
 */
export default function CRTOverlay() {
  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.scanlines} />
      <div className={styles.sweep} />
    </div>
  );
}