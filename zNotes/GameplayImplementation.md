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

---

Without the power-ups:

**Implement the Singleplayer Gameplay Screen.**

`CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either.

**Scope — create or complete exactly these files:**
`game/page.tsx`, `game/page.module.css`, `GameCanvas`, `SingleplayerHud`, `RoundTransition`, `useGameLoop`, `useKeyboardInput`, `bot`, `hitDetection`, `mazeGenerator`, `scoring`, `levelProgression`, `projectileSimulation`, `wallReflection`, `drawMaze`, `drawPlayers`, `drawProjectiles`, `SingleplayerContext`, `GameContext`, `GameProvider`, `RoomContext`, `highScore`, `game.types.ts`.

**Navigation:**
- Selecting Singleplayer sets `RoomContext.mode = 'singleplayer'` and navigates to `/game`.
- On GAME OVER (hearts reach 0): navigate to `/summary`. `ScoreBoard` (on the summary screen) is responsible for reading `SingleplayerContext`, calling `highScore.saveHighScore(cumulativeScore, level)` if the new score exceeds the stored best, and showing the personal best banner. The game screen only navigates — it does not call `saveHighScore`.

**Controls:** WASD to move, Q to fire. Arrow keys to move, Space to fire. Both schemes active simultaneously.

**Visual identity — 1984 coin-op CRT:**
- Player tank: `#FF2D78`. CPU tank: `#C8FF00`. Maze walls: `#00F0FF`. Background: `#000000`.
- All HUD text uses `Press Start 2P`, high-contrast, no anti-aliasing. `imageSmoothingEnabled = false` on the canvas context. Tanks are pixel-art sprites, not smooth shapes.
- Before writing any CSS, read `globals.css` in full. Use every relevant existing custom property (colours, font stacks, spacing, animation keyframes) rather than hardcoding values. Do not introduce a new token for anything already defined there.
- The CPU is always called **CPU** — never "bot", "enemy", or "opponent" — in all UI text and code identifiers.

**Types — define before implementing any logic:**
- `game.types.ts`: `Player`, `Projectile`, `MazeWall`, `MazeLayout`, `GameState`, `PlayerSlot`.

**useGameLoop — exact per-frame order:**
1. Call `projectileSimulation`
2. Run `bot` tick
3. Run `hitDetection`
4. Draw in this exact order: `drawMaze` → `drawPlayers` → `drawProjectiles`

**projectileSimulation — per-type lifetimes to enforce:**
Normal bullets: 10s.

**Magazine — implement exactly:**
- 7 bullets → fire last → 3s reload → 7 bullets.
- On round end: reset both player and CPU magazines to 7.

**Projectile counter — critical rule:**
`roundProjectileCount` increments by +1 for every projectile that visibly travels, from **any source without exception**.

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

**CPU AI (bot.ts) — scales via `botScalingForLevel(level)` → `{ speedMultiplier, turnRate, aimAccuracy, pathingQuality }`.**

**SingleplayerHud displays:** level, hearts row (up to 6 icons, filled/empty), cumulative score, live efficiency tier label, ammo count or reload countdown in seconds. Reads from `SingleplayerContext`.

**RoundTransition:** On CPU kill — show score earned, tier label, and level-up banner if triggered. On player hit — show countdown only.

**The aesthetic goal:** A pixel-perfect recreation of a 1984 coin-op machine. Every design decision must be justified by that hardware context — sharp pixels, flicker, hard-edged neon on black.

-----------------------------------------------------------------------------------------------------------------

**Define the shared type system**

`CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either.

**Scope — create exactly these two files:**
`src/types/game.types.ts`, `src/types/powerup.types.ts`.

No logic. No implementations. No hooks, no components, no context files. Types only. Every other file in the project will import from these two files — they must be complete and final before any other task begins.

---

**`game.types.ts`**

Define the following. Inline comments explaining each field's purpose are required — they are the contract that Tasks 2 and 3 implement against.

- `PlayerSlot`: `'player1' | 'player2'`

- `Player`: position (`x`, `y`), angle (radians), speed, slot (`PlayerSlot`), `bulletsRemaining` (0–7), `reloadTimeRemaining` (ms, 0 when not reloading), `magazineSnapshot: { bulletsRemaining: number; reloadTimeRemaining: number } | null` (non-null only while a power-up is active; stores the frozen magazine state to restore on power-up expiry).

- `Projectile`: `id` (string), `ownedBy` (`PlayerSlot`), position (`x`, `y`), velocity (`vx`, `vy`), `firedAt` (timestamp ms), `powerUpType: PowerUpType | null` (null for standard bullets; set to the originating power-up type for every projectile spawned by a power-up, including child projectiles), `generation: number` (always 0 except for SplitterRound — 0 for the original bullet and first-generation children, 1 for second-generation grandchildren; controls whether this projectile is eligible to split on its next wall contact; grandchildren at generation 1 do not split), `isReturning: boolean` (always false except for Boomerang — set to true at the 5th wall contact when the projectile reverses and begins retracing its recorded path; false for all other types), `wallContactCount: number` (increments on each wall bounce; used by RicochetLaser expiry at 10 contacts and by Boomerang reversal at 5), `pathLog: Array<{ x: number; y: number }>` (populated only by Boomerang during its outbound phase — records each waypoint in order so the return trip can replay them in reverse; empty array for all other types).

- `MazeWall`: `id` (string), `x1`, `y1`, `x2`, `y2` (world-space endpoints).

- `MazeLayout`: `walls: MazeWall[]`.

- `GameState`: `players: Record<PlayerSlot, Player>`, `projectiles: Projectile[]`, `maze: MazeLayout`.

- `DecoyState`: `position: { x: number; y: number }`, `movementDirection: number` (radians), `spawnedAt: number` (timestamp ms), `alive: boolean` (set to false when the decoy absorbs its one projectile hit or after 15s).

- `MineState`: `id` (string), `ownedBy` (`PlayerSlot`), `position: { x: number; y: number }`, `placedAt: number` (timestamp ms), `isInvisible: boolean` (false for the first 3s after placement, then set to true; renderer stops drawing the token once true but detonation checks continue).

- `GravityWellState`: `position: { x: number; y: number }` (fixed at the opponent's world-space coordinates at the moment of activation — never updated after that), `placedBy` (`PlayerSlot`), `activatedAt: number` (timestamp ms), `expiresAt: number` (timestamp ms, always `activatedAt + 8000`).

---

**`powerup.types.ts`**

- `PowerUpType` enum — exactly these 19 values in this order:
  `RicochetLaser`, `PhaseBeam`, `LockOnMissile`, `ClusterOrb`, `ShotgunBlast`, `TripleBarrel`, `GatlingSpin`, `WallBreaker`, `ProtectiveShield`, `SplitterRound`, `Mine`, `Decoy`, `Boomerang`, `PhaseShift`, `GravityWell`, `Swap`, `Repulsor`, `OrbitalGuard`, `TimeWarp`.

- `PowerUpPickup`: `id` (string), `type` (`PowerUpType`), `position: { x: number; y: number }`.

- `ActivePowerUp`: `type` (`PowerUpType`), `activatedAt` (timestamp ms), `durationMs: number | null` (null for instant or shot-tracked types that have no wall-clock duration: WallBreaker, Mine, Swap, Repulsor, RicochetLaser, ShotgunBlast, TripleBarrel, GatlingSpin, SplitterRound, ClusterOrb, Boomerang, LockOnMissile, OrbitalGuard — these expire on a condition, not a timer; non-null for timed types: PhaseBeam 4000, PhaseShift 3000, ProtectiveShield 8000, GravityWell 8000, OrbitalGuard 6000, TimeWarp 10000), `shotsRemaining?: number` (present and starts at 3 for ShotgunBlast and TripleBarrel only; decremented on each trigger pull; when it reaches 0 the power-up is spent and the magazine resumes from its snapshot; absent — not undefined, genuinely absent — for all other types).

- `POWER_UP_METADATA`: a `readonly` record keyed by `PowerUpType`, where each entry contains `{ projectileCost: number; durationMs: number | null }`. This is the single source of truth for costs and durations — `scoring.ts`, `powerUpManager`, and `PowerUpIndicator` all read from here; do not duplicate these values anywhere else. Do not add an `isZeroCost` field — derive it inline as `projectileCost === 0` at call sites. Values:

  | Type | projectileCost | durationMs |
  |---|---|---|
  | RicochetLaser | 1 | null |
  | PhaseBeam | 1 | 4000 |
  | LockOnMissile | 1 | null |
  | ClusterOrb | 9 | null |
  | ShotgunBlast | 10 | null |
  | TripleBarrel | 9 | null |
  | GatlingSpin | 25 | null |
  | WallBreaker | 0 | null |
  | ProtectiveShield | 0 | 8000 |
  | SplitterRound | 1 | null |
  | Mine | 0 | null |
  | Decoy | 0 | null |
  | Boomerang | 1 | null |
  | PhaseShift | 0 | 3000 |
  | GravityWell | 0 | 8000 |
  | Swap | 0 | null |
  | Repulsor | 0 | null |
  | OrbitalGuard | 1 | 6000 |
  | TimeWarp | 0 | 10000 |

  ---

  **Define the shared type system. — no logic, no implementations.**

`CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either.

**Scope — create exactly these two files:**
`src/types/game.types.ts`, `src/types/powerup.types.ts`.

Every other file in the project imports from these two. They must be complete and final before any other task begins.

**Output rules:**
- Use TypeScript `interface` for all object types.
- Use `enum` for `PowerUpType`.
- Use `as const satisfies Record<PowerUpType, ...>` for `POWER_UP_METADATA`.
- No `any`. Strict TypeScript throughout.
- `game.types.ts` may import from `powerup.types.ts`. `powerup.types.ts` must never import from `game.types.ts`.
- Every field must carry a JSDoc comment explaining its purpose and any invariants (e.g. always-false-except-for cases).

---

## `game.types.ts`

### `PlayerSlot`

```ts
type PlayerSlot = 'player1' | 'player2';
```

---

### `Player`

| Field | Type | Notes |
|---|---|---|
| `slot` | `PlayerSlot` | Which slot this player occupies |
| `x` | `number` | World-space position |
| `y` | `number` | World-space position |
| `angle` | `number` | Facing direction in radians |
| `speed` | `number` | Movement speed in px/s; increases on every level-up |
| `turnRate` | `number` | Rotation speed in radians/s; increases on every level-up |
| `bulletsRemaining` | `number` | 0–7; decrements on fire; triggers reload at 0 |
| `reloadTimeRemaining` | `number` | ms remaining in current reload; 0 when not reloading |
| `magazineSnapshot` | `{ bulletsRemaining: number; reloadTimeRemaining: number } \| null` | Non-null only while a power-up is active. Stores the frozen magazine state so it can be restored exactly when the power-up expires or is spent. Null when no power-up is held. |

---

### `Projectile`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique identifier |
| `ownedBy` | `PlayerSlot` | The player who fired this projectile |
| `x` | `number` | World-space position |
| `y` | `number` | World-space position |
| `vx` | `number` | Velocity x-component (px/s) |
| `vy` | `number` | Velocity y-component (px/s) |
| `firedAt` | `number` | Timestamp (ms) when the projectile was created; used for lifetime expiry |
| `powerUpType` | `PowerUpType \| null` | Null for standard bullets. Set to the originating power-up type for every projectile spawned by a power-up, including all child projectiles (Cluster Orb children, SplitterRound children and grandchildren, ShotgunBlast shells, etc.) |
| `generation` | `number` | Always 0 for all types except SplitterRound. For SplitterRound: 0 for the original bullet and its first-generation children; 1 for second-generation grandchildren. A projectile with generation 1 does not split on wall contact. |
| `isReturning` | `boolean` | Always false for all types except Boomerang. For Boomerang: false during the outbound phase; set to true at the 5th wall contact when the projectile reverses and begins retracing its recorded path. |
| `wallContactCount` | `number` | Increments on every wall bounce. Used by RicochetLaser (expires at 10 contacts) and Boomerang (reverses at 5 contacts). Always 0 for types that are not wall-contact-sensitive. |
| `pathLog` | `Array<{ x: number; y: number }>` | Populated only by Boomerang during its outbound phase — records each wall-contact waypoint in order so the return trip can replay them in reverse. Empty array for all other types. |

---

### `MazeWall`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique identifier; used by WallBreaker to remove a specific segment |
| `x1` | `number` | World-space start point |
| `y1` | `number` | World-space start point |
| `x2` | `number` | World-space end point |
| `y2` | `number` | World-space end point |

---

### `MazeLayout`

| Field | Type | Notes |
|---|---|---|
| `walls` | `MazeWall[]` | All wall segments for the current round. WallBreaker removes entries from this array permanently for the rest of the round. |

---

### `DecoyState`

| Field | Type | Notes |
|---|---|---|
| `position` | `{ x: number; y: number }` | Current world-space position of the autopilot ghost |
| `movementDirection` | `number` | Heading in radians; set at spawn from the player's last known movement direction |
| `spawnedAt` | `number` | Timestamp (ms); decoy expires at `spawnedAt + 15000` if not hit first |
| `alive` | `boolean` | Set to false when the decoy absorbs its one projectile hit, or when 15s have elapsed. Renderer and hit detection both check this flag. |

---

### `MineState`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique identifier |
| `ownedBy` | `PlayerSlot` | The player who placed this mine |
| `position` | `{ x: number; y: number }` | Fixed world-space position; set at placement and never updated |
| `placedAt` | `number` | Timestamp (ms); mine becomes invisible at `placedAt + 3000` |
| `isInvisible` | `boolean` | False for the first 3s after placement, then set to true. The renderer stops drawing the token once true; detonation checks continue regardless. |

---

### `GravityWellState`

| Field | Type | Notes |
|---|---|---|
| `position` | `{ x: number; y: number }` | Fixed world-space attractor — set to the opponent's position at the moment of activation and never updated after that |
| `placedBy` | `PlayerSlot` | The player who placed this well; a new placement by either player immediately cancels the current well regardless of who placed it |
| `expiresAt` | `number` | Timestamp (ms); always `activationTimestamp + 8000` |

---

### `GameState`

The complete live per-frame state. `GameContext` wraps this type — `createContext<GameState>`.

| Field | Type | Notes |
|---|---|---|
| `players` | `Record<PlayerSlot, Player>` | Both players' full state every frame |
| `projectiles` | `Projectile[]` | All in-flight projectiles |
| `maze` | `MazeLayout` | Current round's wall layout; static for the duration of a round |
| `pickups` | `PowerUpPickup[]` | All uncollected power-up pickups on the map; max 3 simultaneously |
| `activePowerUps` | `Record<PlayerSlot, ActivePowerUp \| null>` | The active power-up for each player; null when none is held |
| `mines` | `MineState[]` | All mines currently on the map; cleared on round start |
| `decoy` | `DecoyState \| null` | Active decoy, or null when none is in play |
| `gravityWell` | `GravityWellState \| null` | Active gravity well, or null; at most one per round globally |
| `phaseBeamLockedSlots` | `PlayerSlot[]` | Slots whose movement input is currently suppressed because their Phase Beam is in flight (4s lock). Empty when no beams are active. An array — not a single slot — to handle the edge case where both players fire Phase Beams simultaneously. |

---

## `powerup.types.ts`

### `PowerUpType`

Enum — exactly these 19 values in this order:

```ts
enum PowerUpType {
  RicochetLaser,
  PhaseBeam,
  LockOnMissile,
  ClusterOrb,
  ShotgunBlast,
  TripleBarrel,
  GatlingSpin,
  WallBreaker,
  ProtectiveShield,
  SplitterRound,
  Mine,
  Decoy,
  Boomerang,
  PhaseShift,
  GravityWell,
  Swap,
  Repulsor,
  OrbitalGuard,
  TimeWarp,
}
```

---

### `PowerUpPickup`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique identifier; used to remove the pickup on collection |
| `type` | `PowerUpType` | Which power-up this token grants |
| `position` | `{ x: number; y: number }` | World-space tile position |

---

### `ActivePowerUp`

| Field | Type | Notes |
|---|---|---|
| `type` | `PowerUpType` | The held power-up type |
| `activatedAt` | `number` | Timestamp (ms) when the player collected this pickup |
| `durationMs` | `number \| null` | Copied from `POWER_UP_METADATA[type].durationMs` at collection time. Null when the type expires on a condition rather than a wall-clock timer. Non-null for timed types. `PowerUpIndicator` renders a countdown ring only when this is non-null. |
| `shotsRemaining` | `number` *(optional)* | Present only for `ShotgunBlast` (starts at 3) and `TripleBarrel` (starts at 3). Decremented by 1 on each trigger pull. When it reaches 0 the power-up is spent and the magazine resumes from `Player.magazineSnapshot`. Absent — not `undefined`, genuinely absent — for all other types. Use `?:` not `| undefined`. |

---

### `POWER_UP_METADATA`

The single source of truth for projectile costs and durations. `scoring.ts`, `powerUpManager`, and `PowerUpIndicator` all read from here — do not duplicate these values anywhere else. Derive `isZeroCost` inline as `projectileCost === 0`; do not store it as a field.

| Type | `projectileCost` | `durationMs` | Notes |
|---|---|---|---|
| `RicochetLaser` | 1 | null | Expires on 10th wall contact |
| `PhaseBeam` | 1 | 4000 | |
| `LockOnMissile` | 1 | null | Expires on wall contact or after 8s total |
| `ClusterOrb` | 9 | null | 1 on launch + 8 children on detonation; cost here is the total |
| `ShotgunBlast` | 10 | null | Per-shot cost — 10 shells × 3 trigger pulls = 30 shells total; cost here is per-shot |
| `TripleBarrel` | 9 | null | 3 bullets × 3 trigger pulls = 9 total; cost here is the full activation total |
| `GatlingSpin` | 25 | null | Expires after exactly 25 bullets fired |
| `WallBreaker` | 0 | null | Instant; removes nearest wall segment |
| `ProtectiveShield` | 0 | 8000 | |
| `SplitterRound` | 1 | null | Up to 7 total projectiles if all generations split; cost here is the base launch cost |
| `Mine` | 0 | null | Instant placement; power-up slot freed immediately after placing |
| `Decoy` | 0 | null | Expires after 15s or on first hit |
| `Boomerang` | 1 | null | Expires on opponent contact, reaching origin, or after 8s |
| `PhaseShift` | 0 | 3000 | |
| `GravityWell` | 0 | 8000 | |
| `Swap` | 0 | null | Instant position exchange |
| `Repulsor` | 0 | null | Instant outward pulse |
| `OrbitalGuard` | 1 | 6000 | Can end early if guard bullet reaches opponent |
| `TimeWarp` | 0 | 10000 | |

---

## Completion check

The output is correct when:
- `game.types.ts` exports exactly: `PlayerSlot`, `Player`, `Projectile`, `MazeWall`, `MazeLayout`, `DecoyState`, `MineState`, `GravityWellState`, `GameState`.
- `powerup.types.ts` exports exactly: `PowerUpType`, `PowerUpPickup`, `ActivePowerUp`, `POWER_UP_METADATA`.
- `powerup.types.ts` has zero imports from `game.types.ts`.
- `POWER_UP_METADATA` is typed `as const satisfies Record<PowerUpType, { projectileCost: number; durationMs: number | null }>` and has exactly 19 entries.
- `ActivePowerUp.shotsRemaining` uses `?:` (optional property), not `| undefined`.
- TypeScript compiles with no errors under `strict: true`.