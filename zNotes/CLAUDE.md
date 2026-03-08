# Dead Angle

Dead Angle is a real-time two-player arcade shooter inspired by Tank Trouble. Players navigate a neon maze, firing projectiles that ricochet off walls. Hit your opponent to win the round.

**Frontend:** Next.js (React) — game rendering, UI, real-time state  
**Backend:** C# (.NET) — multiplayer only; single source of truth for all game outcomes, physics validation, and session state

---

## Overview

Dead Angle supports two modes:

- **Singleplayer** — play against a bot, runs entirely client-side. The backend is not contacted
- **Multiplayer** — no account or login required. Player 1 creates a room; Player 2 joins with the room code. Both wait in the lobby until the host clicks Start

---

## Player Flow

**Player 1 / Host (multiplayer)**
1. Choose Multiplayer → Host
2. Server returns a room code and session ID; player goes directly to the lobby
3. Share the room code with Player 2
4. Click START when Player 2 has joined — game begins for both players

**Player 2 (multiplayer)**
1. Choose Multiplayer → enter room code → Join
2. Server returns a session ID; player goes to the lobby
3. Wait for the host to click START

---

## Game Screens

| Screen | Description |
|---|---|
| Start | Mode selection; local high score (best score + level reached) displayed |
| Lobby | Room code shown; host has a START button; both players wait here |
| Game | Live maze arena — the core experience |
| Summary | Final results shown after a run ends (singleplayer) or a player quits (multiplayer) |

---

## Gameplay

Both players move around the maze using keyboard controls (WASD + Q, or Arrow keys + Space). Projectiles bounce off walls at a true reflection angle. A round ends the moment a player is hit — by a projectile, or by a mine. A 3-second countdown plays, then the next round begins with a newly generated maze and fresh spawn positions at opposite ends.

### Magazine

Each player holds 7 bullets. When the last bullet is fired, a 3-second reload begins and 7 fresh bullets are granted when it completes. Picking up a power-up freezes the magazine — the remaining bullet count and any active reload countdown are both paused. When the power-up is spent or expires naturally, the magazine resumes exactly from where it was frozen. If a round ends while a power-up is active, the power-up is discarded and the magazine resets to 7 for the next round.

### Power-Ups

Power-up pickups spawn on random open tiles throughout the round. The first pickup appears 5–10 seconds after a round begins; each subsequent pickup appears 10–15 seconds after the previous one. At most 3 uncollected pickups may sit on the map simultaneously. A player may hold only one active power-up at a time — collecting a second while one is held is blocked. In singleplayer, the bot competes for pickups on the same terms as the player: it pathfinds to the nearest pickup when none is held and activates collected power-ups using the same rules.

There are **19 power-up types**, grouped below by their core mechanic:

**Projectile power-ups** replace or augment the player's shots. The magazine is frozen while they are active and resumes when they are spent:

| Power-up | Projectile cost | Notes |
|---|---|---|
| Ricochet Laser | 1 | 10× speed; up to 10 wall bounces before fading; full trajectory shown as a preview line before firing — the only power-up with a pre-fire visual |
| Phase Beam | 1 | Passes through every wall without deflecting; bends slightly toward the opponent if they are near the beam. Lasts 4 seconds 4s then dissipates, player can not move while the power-up is active |
| Lock-On Missile | 1 | Travels straight for 4s, then homes on the nearest player — including the firer if they are closer than the opponent at that moment; fixed-radius turn; expires on wall contact or after 8s |
| Cluster Orb | 9 (1 on launch + 8 on detonation) | Slow orb that detonates after 4s into 8 projectiles spread evenly at 45° intervals; each child costs +1 when it spawns; guarantees Suppression if 6 or more core bullets were fired before launch (6 + 9 = 15+); stays within Sustained if 5 or fewer core bullets preceded it (5 + 9 = 14) |
| Shotgun Blast | 10(x3) | Replaces magazine with 3x10 shells in a tight forward spread; each bounces off walls; each expires after 2s of travel; after all 30 shells are spent the magazine resumes from its frozen state |
| Triple Barrel | 9 (3 shots × 3 bullets) | 3 shots available; each fires 3 bullets in a tight forward fan, all ricocheting normally; after all 3 shots are spent the magazine resumes from its frozen state |
| Gatling Spin | 25 | Hold fire for 1s to spin up; then auto-fires every 200ms; each burst pushes the tank backward slightly |
| Splitter Round | (1 on fire + 2 on first wall contact + 2 on additional wall contacts) | Normal bullet until first wall contact, then splits into 2 at symmetric reflection angles, these bullets can also split again on impact; if the original kills before wall contact, no split occurs and cost is 1 |
| Boomerang | 1 | Normal bounce until 5th wall contact; path is recorded; at the 5th contact the projectile retraces the exact recorded path in reverse to the origin; expires on opponent contact, reaching origin, or after 8s |
| Orbital Guard | 1 | Single bullet enters a tight orbit at a fixed radius around the tank, moving with it; any enemy projectile that intersects the orbit is destroyed (not deflected), if the orbiting projectile hits the opponents tank they die, ends after 6s or when the guard bullet reaches the opponent |

**Tactical power-ups** affect position, the maze, or player state. They cost 0 projectiles and do not touch the efficiency counter:

| Power-up | Notes |
|---|---|
| Wall Breaker | Permanently removes the wall segment geometrically nearest to the player's tank when fired for the rest of the round; the nearest segment may not be the intended one |
| Mine | Places a mine at the player's current position when activated; becomes invisible 3s after placement; detonates on contact with either player (including the placer) and ends the round as a direct hit would; Decoy can trigger mines; mines are cleared on round start and never carried between rounds |
| Decoy | Spawns a ghost copy of the player's tank that moves on autopilot for 15s or until one projectile hits it; the bot treats the decoy as a real player and targets whichever is closer; the decoy fire decoy bullets, collect pickups, and trigger mines |
| Phase Shift | Tank becomes intangible for 3s — all projectiles pass through without triggering a hit; player cannot fire during the shift; uniquely, the player CAN collect a new pickup while Phase Shift is active — doing so ends the shift immediately and replaces it with the new power-up |
| Swap | Instantly exchanges positions with the opponent; no animation delay; in-flight projectiles continue on their existing trajectories |

**Field power-ups** alter the physics environment. They cost 0 projectiles and do not touch the efficiency counter:

| Power-up | Notes |
|---|---|
| Protective Shield | Reflective barrier at fixed radius for 8s; incoming projectiles are deflected at a true reflection angle and continue at full speed — they are not destroyed and remain lethal to both players; deflects unlimited projectiles |
| Gravity Well | Places a fixed attractor at the opponent's current position for 8s; bends every in-flight projectile from both players toward it, proportional to proximity; only one well can exist per round across both players — any new placement by either player immediately cancels the existing one |
| Repulsor | Instantaneous pulse that deflects every in-flight projectile (both players') directly away from the player's position at full speed; no wind-up; harmless if no projectiles are in flight |
| Time Warp | Reduces all projectile speeds to 25% of normal for 10s; applies to new projectiles fired during the window; tank movement speeds are unchanged; affects both players equally |

---

## Singleplayer — Scoring and Progression

Singleplayer has a full scoring and progression system. **The backend is never contacted.** All logic lives client-side in `scoring.ts`, `levelProgression.ts`, `powerUpManager.ts`, and `SingleplayerContext`.

### Efficiency tiers

The projectile counter resets to 0 at the start of each round and never resets mid-round. Every projectile that visibly travels across the screen counts +1, from any source, including every power-up projectile, without exception. The counter determines the efficiency tier for the round:

| Tier | Projectiles this round | Multiplier |
|---|---|---|
| Dead Angle | 1–3 | ×4 |
| Quick Draw | 4–7 | ×3 |
| Sustained | 8–14 | ×2 |
| Suppression | 15+ | ×1 |

The tier is displayed live in `SingleplayerHud` as the counter climbs during the round.

The tier boundaries are anchored to the 7-bullet magazine. Dead Angle rewards a kill within the first 3 bullets — no more than 2 misses. Quick Draw covers the remaining 4 bullets of the first magazine (bullets 4–7). Sustained begins at the first bullet of the reload — bullet 8, the start of the second magazine. Suppression opens at bullet 15, the first bullet beyond two full magazines. Understanding this anchoring prevents off-by-one errors when counting power-up projectile costs against tier thresholds.

### Kill score

**Score per kill = 100 × Level × Efficiency Multiplier**

The result is always a clean integer. The multiplier is determined by the round's projectile count at the moment the kill lands. Reference scores by level:

| Level | Dead Angle (×4) | Quick Draw (×3) | Sustained (×2) | Suppression (×1) |
|---|---|---|---|---|
| 1 | 400 | 300 | 200 | 100 |
| 3 | 1,200 | 900 | 600 | 300 |
| 5 | 2,000 | 1,500 | 1,000 | 500 |
| 10 | 4,000 | 3,000 | 2,000 | 1,000 |

### Level and hearts

The run begins at Level 1 with 3 hearts. Every 3 kills the player levels up and gains +1 heart, capped at 6. Taking a hit costs 1 heart. Reaching 0 hearts ends the run.

Each level-up raises the stakes for both sides. The player gains movement speed and turning rate; the bot gains matching speed and turning rate along with tighter aim and better pathing. The score multipliers never change — earning Dead Angle at Level 8 is a fundamentally harder challenge than at Level 1, but the reward formula is the same.

**Heart grant timing:** The +1 heart from a level-up is deferred until round resolution. If the player takes a hit on the same tick that a bot kill triggers a level-up, the round ends with the heart loss, but the level-up is applied (level +1, heart +1 capped at 6) before the next round begins. This is tracked via the `pendingLevelUp` flag in `SingleplayerContext`.

### High score

On GAME OVER, if the final score exceeds the stored local best, `highScore.ts` overwrites it with the new score and level reached. The start screen reads this value via `ModeSelector` and displays it. The summary screen (`ScoreBoard`) shows: final score, level reached, total kills, and the best efficiency tier achieved across all rounds of the run.

### Singleplayer game loop

```
START SCREEN
 └─ Best score displayed (final score + level reached from localStorage)

ROUND START
 ├─ Pending level-up applied if flagged (level +1, hearts +1 capped at 6)
 ├─ New maze generated (mazeGenerator.ts)
 ├─ Player and bot spawn at opposite ends
 ├─ roundProjectileCount resets to 0
 ├─ Player magazine resets to 7
 ├─ All mines cleared; active power-ups discarded
 └─ First power-up spawns 5–10s in
    (subsequent: every 10–15s; max 3 uncollected on map at once)

ROUND ACTIVE
 ├─ Player and bot navigate, aim, and fire
 ├─ Both compete for power-ups on equal terms
 ├─ roundProjectileCount increments by 1 for every projectile that visibly travels
 └─ Bot speed, accuracy, and pathing scale with current level

BOT HIT
 ├─ cumulativeScore += 100 × level × efficiencyMultiplier(roundProjectileCount)
 ├─ totalKills += 1
 ├─ If totalKills mod 3 === 0 → set pendingLevelUp = true
 └─ 3-second countdown → ROUND START

PLAYER HIT
 ├─ hearts -= 1
 ├─ If hearts === 0 → GAME OVER
 └─ 3-second countdown → ROUND START
    (pendingLevelUp still applied at round start even if player was also hit this round)

GAME OVER
 ├─ Final score, level reached, total kills, best efficiency tier this run
 └─ If cumulativeScore > storedBest → highScore.ts overwrites localStorage
```

---

## Multiplayer — Scoring

Multiplayer scoring is strictly **1 point per kill**. There are no efficiency tiers, no multipliers, no levels, and no hearts in multiplayer. The backend tracks only the integer kill count per player in `Room.cs`. `ScoreHud` displays live kill counts during the session; `ScoreBoard` shows final kill totals on the summary screen. Rounds are unlimited; the session ends when a player disconnects.

---

## Architecture

### Singleplayer

Runs entirely in the browser. The bot, physics, hit detection, maze generation, power-up management, and scoring are all client-side. The backend is not contacted.

`SingleplayerContext` holds all run state that persists across rounds: level, hearts, totalKills, cumulativeScore, roundProjectileCount, bestEfficiencyTierThisRun, and the pendingLevelUp flag. `GameContext` holds the live per-frame state shared with the multiplayer rendering pipeline: player positions, projectiles, maze, pickups, active power-ups, mine states, decoy state, and gravity well state.

`powerUpManager.ts` owns the full singleplayer power-up lifecycle — spawn scheduling, pickup placement, collection enforcement, magazine freeze/resume, mine timers, and round-end cleanup. `scoring.ts` owns tier lookup and score calculation; it is called by `hitDetection.ts` on every bot kill and writes into `SingleplayerContext`. `levelProgression.ts` owns the level-up check, heart management, bot scaling curve, and the deferred heart-grant logic for the same-tick edge case.

### Multiplayer — communication channels

Two channels serve distinct roles:

- **REST** (`POST /rooms`, `POST /rooms/{code}/join`) — one-time room setup only, called before the real-time connection opens; returns the `sessionId` and slot assignment
- **SignalR (WebSocket)** — all real-time traffic after that; the `sessionId` is passed as a query parameter when opening the connection so `GameHub` can map it to the correct room and player slot in `OnConnectedAsync`

### Multiplayer — authority model

The backend is the authoritative source for all game **outcomes**: hit detection, scoring, round resolution, session state, and all power-up effects. The frontend is the authoritative source for **rendering**.

**Projectiles — deterministic client simulation**

1. When a player fires, the server emits `projectileFired` with the projectile's id, owner, start position, angle, velocity, server timestamp, and `powerUpType` (if applicable) so clients can apply the correct physics variant and visual treatment
2. Both clients simulate the projectile locally using identical deterministic physics; the maze is static for the duration of a round so both clients and the server always agree on wall positions
3. The server runs the same simulation in `ProjectileSimulator.cs` + `PowerUpPhysics.cs`, solely for hit detection
4. When the server detects a hit, it emits `roundEnded` — the only authoritative signal; clients never self-report hits

**Player positions — server-authoritative**

Clients send `playerInput` each frame. The server updates positions at ~20Hz and broadcasts via `gameTick`. `gameTick` also carries each player's current ammo state, active power-up, uncollected pickup list, and mine states so clients remain in sync. Clients interpolate between ticks via `interpolation.ts` for smooth 60fps rendering.

**Power-ups — server-authoritative in multiplayer**

`PowerUpService` owns all power-up state. Spawn timing, placement, and collection detection are server-side. When a player collects a pickup, the server emits `powerUpCollected`; when they activate it, the server emits the appropriate event. Power-up types with effects the server must broadcast authoritatively each have a dedicated event:

| Effect | Event | Key detail |
|---|---|---|
| Shield deflection / Repulsor pulse | `projectilesDeflected` | New velocity per affected projectile; projectiles continue at full speed and remain lethal to both players |
| Positional swap | `swapExecuted` | Authoritative new positions for both players; in-flight projectiles do not retarget |
| Gravity well placed | `gravityWellPlaced` | Fixed attractor position; both clients apply bending each tick; at most one well exists globally per round — any new placement by either player cancels the current one |
| Decoy spawned | `decoySpawned` | Position and initial movement direction; decoy absorbs one hit then vanishes; cannot fire, collect, or trigger mines |
| Mine placed | `minePlaced` | Position and owner; clients render token for 3s then hide it; server continues detonation checks |
| Cluster orb detonated | `clusterOrbDetonated` | Explicit sync point; server follows with 8 individual `projectileFired` events for child projectiles |
| Wall removed | `wallRemoved` | WallId; clients remove segment from their local MazeLayout |
| Self-contained timed effects | `powerUpActivated` | Covers: ProtectiveShield (8s), PhaseShift (3s intangibility — player cannot fire; player CAN collect a new pickup to end it early), OrbitalGuard (6s), TimeWarp (4s at 25% speed), GatlingSpin (auto-fire sequence) |
| Any timed effect ends | `powerUpExpired` | Clients clean up all associated visual state |

**Physics parity**

`powerUpEffects.ts` (client) and `PowerUpPhysics.cs` (server) must remain logically identical. `wallReflection.ts` (client) and `WallReflection.cs` (server) must remain logically identical. Any change to either must be applied to both counterparts simultaneously.

**Maze**

Generated server-side at game start and after each round. Sent to both clients in `gameStarted` (first round) and `roundEnded` (subsequent rounds). Static for the duration of each round — both clients and the server always agree on wall positions, which is what makes deterministic projectile simulation safe.

**Session identity**

`POST /rooms` assigns the Player1 slot; `POST /rooms/{code}/join` assigns Player2. Both return a `sessionId` that is passed as a query parameter when opening the SignalR connection — `GameHub` maps it to the correct room and slot in `OnConnectedAsync`.

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- HTML Canvas — game rendering
- SignalR client — multiplayer real-time state

**Backend** *(multiplayer only)*
- ASP.NET Core
- SignalR hub — player input, game events, state sync
- REST API — room management

**Integrations**
- Discord webhook — on multiplayer session end, the .NET backend sends an outbound POST to a Discord webhook URL with a formatted match summary