**Implement the Singleplayer Gameplay Screen.**

`CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either.

**Scope — create or complete exactly these files:**
`game/page.tsx`, `game/page.module.css`, `GameCanvas`, `SingleplayerHud`, `PowerUpIndicator`, `PowerUpIcon`, `RoundTransition`, `useGameLoop`, `useKeyboardInput`, `usePowerUpState`, `trajectoryPreview`, `projectileSimulation`, `wallReflection`, `powerUpEffects`, `bot`, `hitDetection`, `mazeGenerator`, `scoring`, `levelProgression`, `powerUpManager`, `drawMaze`, `drawPlayers`, `drawProjectiles`, `drawPowerUps`, `drawPowerUpEffects`, `SingleplayerContext`, `GameContext`, `GameProvider`, `RoomContext`, `highScore`, `game.types.ts`, `powerup.types.ts`.

`PowerUpIcon` is a shared component — it lives at `src/components/PowerUpIcon/`, not inside `features/game/`.

**Navigation:**
- Selecting Singleplayer sets `RoomContext.mode = 'singleplayer'` and navigates to `/game`.
- On GAME OVER (hearts reach 0): navigate to `/summary`. `ScoreBoard` (on the summary screen) is responsible for reading `SingleplayerContext`, calling `highScore.saveHighScore(cumulativeScore, level)` if the new score exceeds the stored best, and showing the personal best banner. The game screen only navigates — it does not call `saveHighScore`.

**Controls:** WASD to move, Q to fire. Arrow keys to move, Space to fire. Both schemes active simultaneously. GatlingSpin requires the fire button to be held for 1s to spin up before the first bullet fires.

**Visual identity — 1984 coin-op CRT:**
- Player tank: `#FF2D78`. CPU tank: `#C8FF00`. Maze walls: `#00F0FF`. Background: `#000000`.
- All HUD text uses `Press Start 2P`, high-contrast, no anti-aliasing. `imageSmoothingEnabled = false` on the canvas context. Tanks are pixel-art sprites, not smooth shapes.
- Before writing any CSS, read `globals.css` in full. Use every relevant existing custom property (colours, font stacks, spacing, animation keyframes) rather than hardcoding values. Do not introduce a new token for anything already defined there.
- The CPU is always called **CPU** — never "bot", "enemy", or "opponent" — in all UI text and code identifiers.

**Types — define before implementing any logic:**
- `game.types.ts`: `Player`, `Projectile` (with `powerUpType: PowerUpType | null`, `generation: number`, `isReturning: boolean`), `MazeWall`, `MazeLayout`, `GameState`, `PlayerSlot`, `DecoyState`, `MineState` (`position`, `placedAt`, `isInvisible`), `GravityWellState` (`position`, `expiresAt`).
- `powerup.types.ts`: `PowerUpType` enum (all 19 values), `PowerUpPickup`, `ActivePowerUp` (`type`, `activatedAt`, `durationMs`, `shotsRemaining?: number` — present and starts at 3 for ShotgunBlast and TripleBarrel; absent for all other types), `POWER_UP_METADATA` (readonly record keyed by `PowerUpType` with `{ projectileCost, durationMs | null }` — the single source of truth for costs and durations consumed by `scoring.ts`, `powerUpManager`, and `PowerUpIndicator`; derive `isZeroCost` as `projectileCost === 0`, do not store it separately).

**useGameLoop — exact per-frame order:**
1. Call `projectileSimulation` — this internally calls `powerUpEffects` for per-type mutations after standard wall-bounce processing; do not call `powerUpEffects` separately at the game loop level
2. Run `bot` tick
3. Run `hitDetection`
4. Run `powerUpManager` tick
5. If player holds RicochetLaser and has not yet fired → call `trajectoryPreview` and store result for rendering
6. Draw in this exact order: `drawMaze` → `drawPowerUps` → `drawPowerUpEffects` → `drawPlayers` → `drawProjectiles`

**Rendering boundaries — strictly enforced:**
- `drawPlayers` draws only the real player and CPU tank tokens, plus per-tank visual overlays (PhaseShift shimmer, ProtectiveShield ring, OrbitalGuard orbit circle, GatlingSpin barrel animation, Swap flash). It never draws the Decoy.
- `drawPowerUpEffects` is the sole renderer of the Decoy ghost token. It also draws: RicochetLaser pre-fire preview line, PhaseShift world-space pulse ring, GravityWell distortion rings, TimeWarp slow-motion overlay, WallBreaker highlight flash, Mine token (visible for 3s then hidden), Swap flash, Boomerang return-path arc, LockOnMissile target reticle.
- `drawPowerUps` renders uncollected pickup tokens using `PowerUpIcon` glyphs via **DOM overlays positioned above the canvas** — not canvas drawing.

**projectileSimulation — per-type lifetimes to enforce:**
Normal bullets 10s; PhaseBeam 4s; LockOnMissile 8s; Boomerang 8s; ShotgunBlast shells 2s; ClusterOrb 4s; OrbitalGuard 6s. RicochetLaser has no time limit — it expires on its 10th wall contact instead.

**useKeyboardInput:**
- Movement input is suppressed for the player while `GameContext.phaseBeamLockedSlots` includes the player's slot (Phase Beam in flight — 4s lock).
- Firing input is suppressed while PhaseShift is active for the player.

**Magazine — implement exactly:**
- 7 bullets → fire last → 3s reload → 7 bullets.
- On power-up pickup: snapshot `{ bulletsRemaining, reloadTimeRemaining }` and freeze both. On power-up spent or expired: restore snapshot and resume. On round end: discard active power-up, reset both player and CPU magazines to 7.

**Projectile counter — critical rule:**
`roundProjectileCount` increments by +1 for every projectile that visibly travels, from **any source without exception** — including every child projectile spawned by power-ups (Cluster Orb children, ShotgunBlast shells, SplitterRound children and grandchildren, etc.).

**Efficiency tiers:** Dead Angle 1–3 (×4), Quick Draw 4–7 (×3), Sustained 8–14 (×2), Suppression 15+ (×1). Displayed live in `SingleplayerHud` as `roundProjectileCount` climbs.

**Scoring:** `100 × level × multiplier`. On every CPU kill: `hitDetection` calls `scoring.ts`, which writes the earned score into `SingleplayerContext` and calls `updateBestEfficiencyTier(tier)`. `bestEfficiencyTierThisRun` tracks the **best** (lowest projectile count) tier achieved across all rounds of the run — Dead Angle beats Quick Draw beats Sustained beats Suppression. On every player hit: `hitDetection` calls `levelProgression.ts`.

**SingleplayerContext — initial values on run start:** `level = 1`, `hearts = 3` (max 6), `totalKills = 0`, `cumulativeScore = 0`, `roundProjectileCount = 0`, `bestEfficiencyTierThisRun = null`, `pendingLevelUp = false`.

**Level-up:** `checkLevelUp(totalKills)` returns true when `totalKills > 0 AND totalKills mod 3 === 0`. On level-up: both the player and the CPU gain movement speed and turning rate; the CPU additionally gains tighter aim (spread cone narrows) and better pathing. The level-up is deferred via `pendingLevelUp` and applied at the next round start — including the +1 heart grant (capped at 6) — even if the player also took a hit that same round.

**Round start — exact sequence:**
1. Apply `pendingLevelUp` if flagged (level +1, hearts +1 capped at 6, `pendingLevelUp = false`)
2. Generate new maze (`mazeGenerator`)
3. Spawn player and CPU at opposite ends
4. Reset `roundProjectileCount` to 0
5. Reset both player and CPU magazines to 7
6. Clear all mines; discard all active power-ups for both player and CPU
7. Schedule first power-up spawn 5–10s from now

**powerUpManager — spawn and lifecycle rules:**
First pickup 5–10s after round start; each subsequent pickup 10–15s after the previous spawn; max 3 uncollected on the map at once; type chosen randomly from all 19 types. Use `POWER_UP_METADATA` for all cost and duration lookups. Neither player nor CPU can collect while already holding one. **Exception:** during Phase Shift the player CAN collect a new pickup to end the shift immediately and replace it with the new power-up. ShotgunBlast and TripleBarrel track remaining trigger pulls via `ActivePowerUp.shotsRemaining` (starts at 3, decremented on each fire; magazine resumes when it reaches 0).

**CPU AI (bot.ts) — scales via `botScalingForLevel(level)` → `{ speedMultiplier, turnRate, aimAccuracy, pathingQuality }`:**
- Pathfinds to the nearest uncollected pickup when not holding one; activates collected power-ups under the same rules as the player.
- When a Decoy is active, retargets to whichever of the real player or the Decoy is currently closer.
- Knows positions of its own placed mines and avoids them.

**SingleplayerHud displays:** level, hearts row (up to 6 icons, filled/empty), cumulative score, live efficiency tier label, ammo count or reload countdown in seconds. Reads from `SingleplayerContext`.

**RoundTransition:** On CPU kill — show score earned, tier label, and level-up banner if triggered. On player hit — show countdown only.

**The aesthetic goal:** A pixel-perfect recreation of a 1984 coin-op machine. Every design decision must be justified by that hardware context — sharp pixels, flicker, hard-edged neon on black.

