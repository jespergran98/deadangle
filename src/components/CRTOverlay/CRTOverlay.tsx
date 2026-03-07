import styles from './CRTOverlay.module.css';

/**
 * CRTOverlay
 *
 * Fixed full-viewport div mounted once in layout.tsx.
 * Layers three CSS effects to simulate a real phosphor CRT tube:
 *   1. Horizontal scanlines (repeating-linear-gradient)
 *   2. Screen vignette (radial-gradient via ::before)
 *   3. Vertical sync sweep line (animated ::after)
 *
 * pointer-events: none — never intercepts any input.
 * Pure CSS — no canvas, no JS, no animation libraries.
 * aria-hidden: true — purely decorative, invisible to screen readers.
 */
export default function CRTOverlay() {
  return <div className={styles.overlay} aria-hidden="true" />;
}