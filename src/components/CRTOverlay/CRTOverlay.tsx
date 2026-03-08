import styles from './CRTOverlay.module.css';

/**
 * CRTOverlay
 *
 * Fixed full-viewport shell mounted once in layout.tsx.
 * Four layered CSS effects simulate a phosphor CRT tube:
 *
 *   .overlay    — edge darkening via 4-directional inset box-shadow.
 *                 border-radius suggests curved CRT glass.
 *                 Phosphor flicker: crt-flicker animation.
 *
 *   .scanlines  — dark bands drifting downward continuously.
 *                 repeating-linear-gradient scrolled via translateY.
 *                 One pitch (6px) per cycle — seamless loop.
 *
 *   .sweep      — bright 280px feathered band drifting top → bottom,
 *                 10s loop. Clearly visible as it passes.
 *
 *   .glitchBar  — 2px solid cyan horizontal tear. Snaps to three
 *                 vertical positions on an ~8s cycle using linear
 *                 timing. The bar sweeps briefly into view then
 *                 vanishes at the adjacent keyframe, modelling a
 *                 real horizontal sync artefact on aging hardware.
 *
 * pointer-events:none on all elements — never intercepts input.
 * Pure CSS — no canvas, no JS, no animation libraries.
 * aria-hidden:true — decorative, invisible to screen readers.
 */
export default function CRTOverlay() {
  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.scanlines} />
      <div className={styles.sweep} />
      <div className={styles.glitchBar} />
    </div>
  );
}