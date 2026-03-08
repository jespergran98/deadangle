/**
 * drawPowerUps.ts — Manages DOM overlay elements for uncollected pickup tokens.
 * Pickup icons are rendered as DOM elements (not canvas drawing) positioned over the canvas.
 */

import type { GameState } from '@/types/game.types';
import type { PowerUpPickup } from '@/types/powerup.types';
import { PowerUpType } from '@/types/powerup.types';

// CSS class names for each PowerUpType (matches PowerUpIcon.module.css)
export const POWERUP_CLASS: Record<PowerUpType, string> = {
  [PowerUpType.RicochetLaser]:    'ricochetLaser',
  [PowerUpType.PhaseBeam]:        'phaseBeam',
  [PowerUpType.LockOnMissile]:    'lockOnMissile',
  [PowerUpType.ClusterOrb]:       'clusterOrb',
  [PowerUpType.ShotgunBlast]:     'shotgunBlast',
  [PowerUpType.TripleBarrel]:     'tripleBarrel',
  [PowerUpType.GatlingSpin]:      'gatlingSpin',
  [PowerUpType.SplitterRound]:    'splitterRound',
  [PowerUpType.Boomerang]:        'boomerang',
  [PowerUpType.OrbitalGuard]:     'orbitalGuard',
  [PowerUpType.WallBreaker]:      'wallBreaker',
  [PowerUpType.Mine]:             'mine',
  [PowerUpType.Decoy]:            'decoy',
  [PowerUpType.PhaseShift]:       'phaseShift',
  [PowerUpType.Swap]:             'swap',
  [PowerUpType.ProtectiveShield]: 'protectiveShield',
  [PowerUpType.GravityWell]:      'gravityWell',
  [PowerUpType.Repulsor]:         'repulsor',
  [PowerUpType.TimeWarp]:         'timeWarp',
};

export const POWERUP_LABEL: Record<PowerUpType, string> = {
  [PowerUpType.RicochetLaser]:    'RICOCHET',
  [PowerUpType.PhaseBeam]:        'PHASE BEAM',
  [PowerUpType.LockOnMissile]:    'MISSILE',
  [PowerUpType.ClusterOrb]:       'CLUSTER',
  [PowerUpType.ShotgunBlast]:     'SHOTGUN',
  [PowerUpType.TripleBarrel]:     'TRIPLE',
  [PowerUpType.GatlingSpin]:      'GATLING',
  [PowerUpType.SplitterRound]:    'SPLITTER',
  [PowerUpType.Boomerang]:        'BOOMERANG',
  [PowerUpType.OrbitalGuard]:     'ORBITAL',
  [PowerUpType.WallBreaker]:      'BREAKER',
  [PowerUpType.Mine]:             'MINE',
  [PowerUpType.Decoy]:            'DECOY',
  [PowerUpType.PhaseShift]:       'PHASE SHIFT',
  [PowerUpType.Swap]:             'SWAP',
  [PowerUpType.ProtectiveShield]: 'SHIELD',
  [PowerUpType.GravityWell]:      'GRAVITY',
  [PowerUpType.Repulsor]:         'REPULSOR',
  [PowerUpType.TimeWarp]:         'TIME WARP',
};

const SIZE = 20; // px

/**
 * Syncs DOM overlay elements for pickup tokens.
 * container should be a div positioned absolutely over the canvas.
 */
export function syncPickupOverlays(
  container: HTMLElement,
  pickups: PowerUpPickup[]
): void {
  const existing = new Map<string, HTMLElement>();
  for (const child of Array.from(container.children) as HTMLElement[]) {
    const id = child.dataset.pickupId;
    if (id) existing.set(id, child);
  }

  const seen = new Set<string>();
  for (const pickup of pickups) {
    seen.add(pickup.id);
    let el = existing.get(pickup.id);
    if (!el) {
      el = document.createElement('div');
      el.dataset.pickupId = pickup.id;
      el.className = `pickup-overlay pickup-${POWERUP_CLASS[pickup.type]}`;
      el.title = POWERUP_LABEL[pickup.type];
      el.style.cssText = `
        position: absolute;
        width: ${SIZE}px;
        height: ${SIZE}px;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #fff;
        text-shadow: 0 0 4px #FFD700, 0 0 8px #FFD700;
        border: 1px solid #FFD700;
        border-radius: 2px;
        background: rgba(0,0,0,0.7);
        font-family: 'Press Start 2P', monospace;
        box-shadow: 0 0 6px #FFD700, 0 0 12px rgba(255,215,0,0.5);
        animation: pu-pulse 1.5s ease-in-out infinite alternate;
      `;
      el.textContent = getGlyph(pickup.type);
      container.appendChild(el);
    }
    el.style.left = `${pickup.position.x - SIZE / 2}px`;
    el.style.top  = `${pickup.position.y - SIZE / 2}px`;
  }

  // Remove stale
  for (const [id, el] of existing) {
    if (!seen.has(id)) el.remove();
  }
}

function getGlyph(type: PowerUpType): string {
  const glyphs: Partial<Record<PowerUpType, string>> = {
    [PowerUpType.RicochetLaser]:    '⚡',
    [PowerUpType.PhaseBeam]:        '≋',
    [PowerUpType.LockOnMissile]:    '◎',
    [PowerUpType.ClusterOrb]:       '✸',
    [PowerUpType.ShotgunBlast]:     '≣',
    [PowerUpType.TripleBarrel]:     '∴',
    [PowerUpType.GatlingSpin]:      '⊕',
    [PowerUpType.SplitterRound]:    'Y',
    [PowerUpType.Boomerang]:        '↩',
    [PowerUpType.OrbitalGuard]:     '⊙',
    [PowerUpType.WallBreaker]:      '▣',
    [PowerUpType.Mine]:             '◈',
    [PowerUpType.Decoy]:            '⬡',
    [PowerUpType.PhaseShift]:       '◌',
    [PowerUpType.Swap]:             '⇄',
    [PowerUpType.ProtectiveShield]: '⬟',
    [PowerUpType.GravityWell]:      '◉',
    [PowerUpType.Repulsor]:         '⊛',
    [PowerUpType.TimeWarp]:         '⏱',
  };
  return glyphs[type] ?? '?';
}

/** Not actually used for canvas drawing (DOM overlay approach) */
export function drawPowerUps(_ctx: CanvasRenderingContext2D, _state: GameState): void {
  // Pickup tokens are rendered via DOM overlays by syncPickupOverlays.
  // This function is a no-op — kept for call-site symmetry.
}