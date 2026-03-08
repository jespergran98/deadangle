/**
 * PowerUpIcon.tsx — CSS-only icon for a given PowerUpType.
 * Shared component: used by PowerUpIndicator (HUD) and drawPowerUps (pickup overlays).
 */

import { PowerUpType } from '@/types/powerup.types';
import styles from './PowerUpIcon.module.css';

interface PowerUpIconProps {
  type: PowerUpType;
  size?: number;
  dimmed?: boolean;
}

const CLASS_MAP: Record<PowerUpType, string> = {
  [PowerUpType.RicochetLaser]:    styles.ricochetLaser,
  [PowerUpType.PhaseBeam]:        styles.phaseBeam,
  [PowerUpType.LockOnMissile]:    styles.lockOnMissile,
  [PowerUpType.ClusterOrb]:       styles.clusterOrb,
  [PowerUpType.ShotgunBlast]:     styles.shotgunBlast,
  [PowerUpType.TripleBarrel]:     styles.tripleBarrel,
  [PowerUpType.GatlingSpin]:      styles.gatlingSpin,
  [PowerUpType.SplitterRound]:    styles.splitterRound,
  [PowerUpType.Boomerang]:        styles.boomerang,
  [PowerUpType.OrbitalGuard]:     styles.orbitalGuard,
  [PowerUpType.WallBreaker]:      styles.wallBreaker,
  [PowerUpType.Mine]:             styles.mine,
  [PowerUpType.Decoy]:            styles.decoy,
  [PowerUpType.PhaseShift]:       styles.phaseShift,
  [PowerUpType.Swap]:             styles.swap,
  [PowerUpType.ProtectiveShield]: styles.protectiveShield,
  [PowerUpType.GravityWell]:      styles.gravityWell,
  [PowerUpType.Repulsor]:         styles.repulsor,
  [PowerUpType.TimeWarp]:         styles.timeWarp,
};

export default function PowerUpIcon({ type, size = 28, dimmed = false }: PowerUpIconProps) {
  const cls = [
    styles.icon,
    CLASS_MAP[type],
    dimmed ? styles.dimmed : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}