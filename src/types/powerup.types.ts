/**
 * powerup.types.ts — Dead Angle
 *
 * Dependency leaf: zero imports from game.types.ts.
 * All other files that need power-up types import from here.
 */

// ---------------------------------------------------------------------------
// PowerUpType
// ---------------------------------------------------------------------------

/**
 * All 19 power-up variants. Order is canonical — do not reorder.
 *
 * Projectile power-ups — freeze the magazine while active; resume on spend/expiry:
 *   RicochetLaser, PhaseBeam, LockOnMissile, ClusterOrb, ShotgunBlast,
 *   TripleBarrel, GatlingSpin, SplitterRound, Boomerang, OrbitalGuard
 *
 * Tactical power-ups — zero projectile cost; do not affect efficiency tier:
 *   WallBreaker, Mine, Decoy, PhaseShift, Swap
 *
 * Field power-ups — zero projectile cost; alter the physics environment:
 *   ProtectiveShield, GravityWell, Repulsor, TimeWarp
 */
export enum PowerUpType {
  // ── Projectile ────────────────────────────────────────────────────────────
  RicochetLaser,    // 10× speed; expires on 10th wall contact; pre-fire preview line shown
  PhaseBeam,        // Passes through walls; bends toward opponent; 4s; firer movement-locked
  LockOnMissile,    // Straight for 4s then homes; expires on wall contact or after 8s total
  ClusterOrb,       // Slow orb; detonates after 4s into 8 children at 45° intervals
  ShotgunBlast,     // 10 shells per shot × 3 shots; each shell expires after 2s
  TripleBarrel,     // 3 bullets per shot × 3 shots; all ricochet normally
  GatlingSpin,      // 1s spin-up then auto-fires 1 bullet/200ms; expires after 25 bullets
  SplitterRound,    // Splits into 2 on first wall contact; children split once more (gen 0→1)
  Boomerang,        // Records path; reverses at 5th wall contact; retraces in reverse
  OrbitalGuard,     // Guard bullet orbits tank; destroys crossing projectiles; 6s or kill

  // ── Tactical ──────────────────────────────────────────────────────────────
  WallBreaker,      // Removes nearest wall segment instantly; slot freed immediately
  Mine,             // Places mine at current position; slot freed immediately; up to 3 active
  Decoy,            // Ghost tank autopilots 15s or until first hit; bot retargets to closer
  PhaseShift,       // 3s intangibility; cannot fire; collecting a pickup ends it early
  Swap,             // Instantly exchanges positions; in-flight projectiles do not retarget

  // ── Field ─────────────────────────────────────────────────────────────────
  ProtectiveShield, // Reflective barrier 8s; deflected projectiles stay lethal at full speed
  GravityWell,      // Fixed attractor at opponent's position for 8s; at most one per round
  Repulsor,         // Instant outward pulse deflecting all in-flight projectiles
  TimeWarp,         // All projectiles at 25% speed for 10s; tank movement unchanged
}

// ---------------------------------------------------------------------------
// PowerUpPickup
// ---------------------------------------------------------------------------

/** An uncollected power-up token on the map. At most 3 in GameState.pickups simultaneously. */
export interface PowerUpPickup {
  /** Unique identifier; entry removed from GameState.pickups on collection. */
  id: string;

  /** Power-up type this token grants. */
  type: PowerUpType;

  /** World-space tile position. */
  position: { x: number; y: number };
}

// ---------------------------------------------------------------------------
// ActivePowerUp
// ---------------------------------------------------------------------------

/**
 * The power-up currently held by one player.
 * Stored in GameState.activePowerUps[slot]; null when none is held.
 */
export interface ActivePowerUp {
  /** The held power-up type. */
  type: PowerUpType;

  /**
   * Timestamp (ms) when this pickup was collected.
   * In Dead Angle, collecting = activating — there is no deferred use step.
   * Used with durationMs to compute time-remaining for PowerUpIndicator's
   * countdown ring.
   */
  activatedAt: number;

  /**
   * Wall-clock lifetime (ms) copied from POWER_UP_METADATA[type].durationMs
   * at collection time.
   *
   * Non-null for timed types:
   *   PhaseBeam 4 000 | PhaseShift 3 000 | ProtectiveShield 8 000
   *   OrbitalGuard 6 000 | GravityWell 8 000 | TimeWarp 10 000
   *
   * Null when expiry is condition-based (wall contacts, bullet count, etc.).
   * PowerUpIndicator renders a countdown ring only when this is non-null.
   */
  durationMs: number | null;

  /**
   * Trigger-pulls remaining.
   * Present only for ShotgunBlast (starts at 3) and TripleBarrel (starts at 3).
   * Decremented by 1 on each trigger pull; reaching 0 spends the power-up
   * and resumes the magazine from Player.magazineSnapshot.
   * Absent — not undefined, genuinely absent — for all other types.
   * Use `?:` not `| undefined`.
   */
  shotsRemaining?: number;
}

// ---------------------------------------------------------------------------
// POWER_UP_METADATA
// ---------------------------------------------------------------------------

/**
 * Single source of truth for projectile cost and wall-clock duration.
 * Consumed by scoring.ts, powerUpManager.ts, and PowerUpIndicator.
 * Do not duplicate these values elsewhere.
 *
 * projectileCost interpretation varies by type — read per-entry notes:
 *   ClusterOrb    combined total (1 launch + 8 children on detonation)
 *   ShotgunBlast  per trigger pull — 10 shells × 3 pulls = 30 total
 *   TripleBarrel  full activation total — 3 bullets × 3 pulls = 9
 *   GatlingSpin   total bullets until expiry (25)
 *   SplitterRound base launch cost only; child costs (+2 per split) billed at runtime
 *   zero-cost     tactical/field types — do not increment the efficiency counter
 *
 * Derive zero-cost inline as `projectileCost === 0`; do not store it as a field.
 * durationMs null → expiry is condition-based, not wall-clock.
 */
export const POWER_UP_METADATA = {
  // ── Projectile ────────────────────────────────────────────────────────────

  // Expires on 10th wall contact; no time limit.
  [PowerUpType.RicochetLaser]:    { projectileCost: 1,  durationMs: null  },

  // durationMs = beam lifetime and firer's movement lock duration.
  [PowerUpType.PhaseBeam]:        { projectileCost: 1,  durationMs: 4000  },

  // Expires on wall contact or after 8s total; homing begins at t=4s.
  [PowerUpType.LockOnMissile]:    { projectileCost: 1,  durationMs: null  },

  // Cost is combined total (1 launch + 8 children); detonation timer-based only.
  [PowerUpType.ClusterOrb]:       { projectileCost: 9,  durationMs: null  },

  // Cost is per trigger pull (10 shells); shotsRemaining tracks the 3 pulls.
  [PowerUpType.ShotgunBlast]:     { projectileCost: 10, durationMs: null  },

  // Cost is full activation total (9); shotsRemaining tracks the 3 pulls.
  [PowerUpType.TripleBarrel]:     { projectileCost: 9,  durationMs: null  },

  // Cost is total bullets until expiry (25); no time limit.
  [PowerUpType.GatlingSpin]:      { projectileCost: 25, durationMs: null  },

  // Cost is base launch (1); child costs billed at runtime (+2 per split generation).
  [PowerUpType.SplitterRound]:    { projectileCost: 1,  durationMs: null  },

  // Expires on opponent contact, reaching origin, or after 8s.
  [PowerUpType.Boomerang]:        { projectileCost: 1,  durationMs: null  },

  // durationMs = orbit lifetime; can end early on kill contact with opponent.
  [PowerUpType.OrbitalGuard]:     { projectileCost: 1,  durationMs: 6000  },

  // ── Tactical ──────────────────────────────────────────────────────────────

  // Instant removal of nearest wall; slot freed immediately after activation.
  [PowerUpType.WallBreaker]:      { projectileCost: 0,  durationMs: null  },

  // Instant placement; slot freed immediately, allowing up to 3 simultaneous mines.
  [PowerUpType.Mine]:             { projectileCost: 0,  durationMs: null  },

  // Lifetime tracked in DecoyState (15s or first projectile hit).
  [PowerUpType.Decoy]:            { projectileCost: 0,  durationMs: null  },

  // durationMs = intangibility window; collecting a pickup ends it early.
  [PowerUpType.PhaseShift]:       { projectileCost: 0,  durationMs: 3000  },

  // Instant position exchange; no ongoing effect.
  [PowerUpType.Swap]:             { projectileCost: 0,  durationMs: null  },

  // ── Field ─────────────────────────────────────────────────────────────────

  // durationMs = reflective barrier lifetime.
  [PowerUpType.ProtectiveShield]: { projectileCost: 0,  durationMs: 8000  },

  // durationMs = attractor lifetime; a new placement by either player cancels current.
  [PowerUpType.GravityWell]:      { projectileCost: 0,  durationMs: 8000  },

  // Instant pulse; no ongoing effect.
  [PowerUpType.Repulsor]:         { projectileCost: 0,  durationMs: null  },

  // durationMs = slow-motion window; affects all projectiles from both players.
  [PowerUpType.TimeWarp]:         { projectileCost: 0,  durationMs: 10000 },
} as const satisfies Record<PowerUpType, { projectileCost: number; durationMs: number | null }>;