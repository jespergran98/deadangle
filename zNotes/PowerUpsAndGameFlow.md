# Dead Angle — Design Document

---

## Scoring

**Score per kill = 100 × Level × Efficiency Multiplier**

Efficiency is measured by the total number of projectiles spent this round. The counter starts at zero when the round begins and never resets mid-round. Every projectile from every source counts — core bullets and power-up projectiles alike, no exceptions.

| Tier | Projectiles this round | Multiplier |
|---|---|---|
| **Dead Angle** | 1–3 | ×4 |
| **Quick Draw** | 4–7 | ×3 |
| **Sustained** | 8–14 | ×2 |
| **Suppression** | 15+ | ×1 |

Tier boundaries are anchored to the 7-bullet magazine. **Dead Angle** rewards killing within the first 3 bullets — no more than two misses permitted. **Quick Draw** covers the remaining four bullets of the first magazine. **Sustained** begins the moment the player has crossed into reload territory — the first bullet of the second magazine. **Suppression** opens at the first bullet beyond two full magazines. Every score is a clean integer.

**Reference scores by level:**

| Level | Dead Angle (×4) | Quick Draw (×3) | Sustained (×2) | Suppression (×1) |
|---|---|---|---|---|
| 1 | 400 | 300 | 200 | 100 |
| 3 | 1,200 | 900 | 600 | 300 |
| 5 | 2,000 | 1,500 | 1,000 | 500 |
| 10 | 4,000 | 3,000 | 2,000 | 1,000 |

---

## Level & Hearts

- The run begins at **Level 1** with **3 hearts**
- **Every 3 kills**, the player levels up and gains **+1 heart**, capped at **6**
- Taking a hit costs **1 heart**; reaching **0 hearts** ends the run

Each level-up raises the stakes equally for both sides. The player gains movement speed and turning rate; the bot gains matching speed and turning rate, along with sharper aim and smarter pathing decisions. Score multipliers never change — earning Dead Angle at Level 8 is a fundamentally different challenge than at Level 1, but the reward is the same clean number.

**Timing note:** The +1 heart from a level-up is applied after the round resolves. If the player takes a hit that ends the round on the same kill that triggered a level-up, the heart is granted before the next round begins.

---

## Magazine

- The player holds **7 bullets** at all times
- When the **last bullet is fired**, a **3-second reload** begins; 7 fresh bullets are granted when it completes
- Picking up a power-up **freezes** the magazine — remaining bullets and any active reload countdown both pause
- When the power-up is spent or expires, the magazine **resumes exactly where it was frozen**
- If a round ends while a power-up is active, the power-up is discarded and the magazine resets to **7** for the next round

---

## Power-Ups

The first power-up spawns at a random open tile **5–10 seconds** after a round begins. Subsequent power-ups spawn every **10–15 seconds** thereafter. A maximum of **3 power-ups** can sit on the map simultaneously as uncollected pickups. A player may hold **only one active power-up at a time** — picking up a second while one is active is not permitted. The bot competes for power-ups on exactly the same terms as the player.

Every projectile that visibly travels across the screen costs 1 toward the efficiency counter. This applies to all power-up projectiles without exception.

---

### Ricochet Laser
**Projectile cost: 1**  
**Tier impact:** Dead Angle if combined total this round is 1–3; Quick Draw if combined total is 4–7

Fires a single laser bolt at 10× normal bullet speed. The bolt bounces off walls up to 10 times before fading; however many walls it crosses, it counts as 1 projectile the moment it leaves the barrel. The laser's full trajectory is displayed as a preview line before the trigger is pulled — the one power-up that shows exactly what it will do before committing.

---

### Phase Beam
**Projectile cost: 1**  
**Tier impact:** Dead Angle if combined total this round is 1–3; Quick Draw if combined total is 4–7

Fires a beam that passes through every wall on the map without deflecting, drifting toward the bot over 4 seconds before dissipating. Because it never bounces, its path is entirely predictable — effectiveness depends entirely on knowing roughly where the bot is when the trigger is pulled. One projectile, regardless of how many walls it passes through.

---

### Lock-On Missile
**Projectile cost: 1**  
**Tier impact:** Dead Angle if combined total this round is 1–3; Quick Draw if combined total is 4–7

Fires a missile in the aimed direction. After 1 second of straight travel it begins homing on the nearest player — including the firer if they are closer than the bot at that moment. The missile turns at a fixed radius and carries momentum, so it can be outmaneuvered with sharp directional changes. Expires on wall contact or after 8 seconds. One projectile.

---

### Cluster Orb
**Projectile cost: 9 (1 on launch + 8 on detonation)**  
**Tier impact:** Sustained if 0–5 core bullets spent before firing (9–14 total); Suppression if 6+ core bullets spent before firing (15+ total)

Fires a slow-moving orb in the aimed direction. On wall contact or after 4 seconds, the orb detonates into 8 projectiles spread evenly in all directions. The orb counts as 1 the moment it leaves the barrel; each of the 8 detonation shots counts as 1 when it fires — 9 total. Spending 5 or fewer core bullets before firing keeps the round total at 14 or below (Sustained); a sixth core bullet beforehand pushes the combined total to 15, entering Suppression.

---

### Shotgun Blast
**Projectile cost: 20**  
**Tier impact:** Always Suppression (20 total, regardless of prior shots)

Replaces the magazine with 20 shells, each individually lethal. All shells fire in a tight forward spread, can bounce off walls, and expire after 2 seconds of travel. Each shell counts as 1 toward the efficiency counter the moment it fires, one at a time as they leave the barrel. After all 20 shells are spent, the magazine resumes from its frozen state. Picking up Shotgun Blast guarantees Suppression — even with zero prior shots this round, the total reaches 20.

---

### Triple Barrel
**Projectile cost: 9 (3 shots × 3 bullets per shot)**  
**Tier impact (from zero core bullets spent):** 1 shot fired = 3 total (Dead Angle ceiling); 2 shots fired = 6 total (Quick Draw); 3 shots fired = 9 total (Sustained entry)

Replaces the magazine with 3 shots. Each shot fires 3 bullets in a tight forward fan that all ricochet normally; each bullet counts individually, for 3 per shot and 9 total across all 3 shots. After the 3 shots are spent, the magazine resumes from its frozen state. Strong at mid-range, where the spread can cover a corridor without losing kill potential.

---

### Gatling Spin
**Projectile cost: ~25**  
**Tier impact:** Always Suppression

Hold the fire button for 1 second to spin up, then bullets fire automatically every 200ms until the power-up expires. Each burst carries slight recoil that pushes the tank backward. The exact round count varies but always exceeds the Suppression threshold — treat it as a guaranteed tier drop. Use it to survive a dangerous position; never use it while protecting a Quick Draw or Sustained multiplier.

---

### Wall Breaker
**Projectile cost: 0**  
**Tier impact:** None

No projectile is fired. The wall segment geometrically nearest to the player's tank is permanently removed for the rest of the round, opening a new firing lane or escape route. The chosen segment may not be the intended one — the gap between intention and result is the cost of using it. No effect on the efficiency counter.

---

### Protective Shield
**Projectile cost: 0**  
**Tier impact:** None

Surrounds the player's tank with a reflective barrier for 8 seconds. Any incoming projectile that contacts the shield is deflected at a true reflection angle and continues traveling at full speed — it does not vanish and remains lethal to both players. The shield deflects any number of projectiles during its 8-second window; it expires when the timer elapses or the round ends, whichever comes first. No effect on the efficiency counter.

---

### Splitter Round
**Projectile cost: 3 (1 on fire + 2 on first wall contact)**
**Tier impact:** Dead Angle if combined total is 1–3; Quick Draw if combined total remains 4–7 after all three register

Fires a single bullet that travels and bounces normally. On its first wall contact it splits into two projectiles that continue at symmetric reflection angles from the impact point, each ricocheting independently until expiry. The original bullet costs 1 the moment it leaves the barrel; the two split projectiles each cost 1 the moment they form — 3 total. A round with zero prior shots and a clean kill on the original bullet never reaches the split, costing only 1 (Dead Angle). Waiting for the split to land costs 3 — still Dead Angle ceiling. A miss on all three costs 3 and burns the tier faster than it looks.

---

### Mine
**Projectile cost: 0**  
**Tier impact:** None

Places a mine at the player's current position; up to 3 mines may be active on the map at once from a single player. Each mine becomes invisible 3 seconds after placement. A mine detonates on contact with either player — including the one who placed it — and ends the round exactly as a direct hit would. Mines remain active until triggered or the round ends; they are not carried between rounds. No effect on the efficiency counter.

---

### Decoy
**Projectile cost: 0**
**Tier impact:** None

Spawns a phantom copy of your tank at your current position that moves on autopilot — mirroring your last known movement direction — for 5 seconds or until a projectile hits it. The bot's targeting treats the decoy as a real player for its entire lifespan; it will aim at and navigate toward whichever target is currently closer. The decoy absorbs exactly one projectile hit before vanishing. It cannot fire, collect power-ups, or trigger mines. No effect on the efficiency counter.

---

### Boomerang
**Projectile cost: 1**
**Tier impact:** Dead Angle if combined total this round is 1–3; Quick Draw if combined total is 4–7

Fires a single projectile that travels and bounces normally, but after its 5th wall contact it reverses direction and retraces its exact path back to the origin point. The return trip is the same projectile — no additional counter cost. It expires on bot contact, on returning to the origin, or after 8 seconds total travel time, whichever comes first. The reversal makes the return path completely predictable from the moment of firing, which is both its strength and its tell.

---

### Phase Shift
**Projectile cost: 0**
**Tier impact:** None

Your tank becomes intangible for 3 seconds — all projectiles pass through you without triggering a hit. You cannot fire while the shift is active, and the effect ends immediately if you pick up another power-up. The magazine freezes for the duration exactly as with any other power-up. Phase Shift is a pure survival tool: it buys 3 seconds but costs your ability to press the advantage. No effect on the efficiency counter.

---

### Gravity Well
**Projectile cost: 0**
**Tier impact:** None

Places a fixed attractor point at your current position that bends the trajectory of all projectiles on the map toward it for 8 seconds. The pull is proportional to proximity — bullets that pass close are strongly curved; bullets far away are barely affected. The well affects both players' projectiles equally. It cannot be moved once placed, and a round can only have one active well at a time — placing a second immediately cancels the first. No effect on the efficiency counter.

---

### Swap
**Projectile cost: 0**
**Tier impact:** None

Instantly exchanges your position with the bot's — no travel time, no animation delay. Any projectiles already in flight continue on their existing trajectories; they do not update their targets after the swap. At low levels this is a positional reset; at high levels, where the bot is fast and has often cornered you, trading positions is the fastest way out — and the fastest way into a firing lane the bot just vacated. No effect on the efficiency counter.

---

### Repulsor
**Projectile cost: 0**
**Tier impact:** None

Emits a single outward pulse from your tank that instantly deflects every projectile currently in flight — yours and the bot's — directly away from your position. Deflected projectiles continue traveling at full speed on their new trajectories; they are not destroyed. The pulse is instantaneous with no wind-up. With no projectiles in the air it does nothing. No effect on the efficiency counter.

---

### Orbital Guard
**Projectile cost: 1**
**Tier impact:** Dead Angle if combined total is 1–3; Quick Draw if combined total is 4–7

Fires a single projectile that immediately enters a tight orbit around your tank at a fixed radius, circling continuously. Any other projectile that intersects the orbit path is destroyed on contact — the guard does not deflect, it cancels. The orbit continues for 6 seconds or until the guard bullet collides with the bot, whichever comes first. Moving your tank moves the orbit with it. One projectile cost, regardless of how many enemy bullets it intercepts.

---

### Time Warp
**Projectile cost: 0**
**Tier impact:** None

Reduces the travel speed of every projectile currently on the map — and all projectiles fired during the effect — to 25% of normal for 4 seconds, affecting both players equally. Tank movement speeds are unchanged. A slowed projectile still bounces, still expires on its normal timer, and is still lethal on contact; it is simply far easier to track and step around. Use it to read a cluttered board or to extend the travel time of your own shots into a position the bot hasn't vacated yet. No effect on the efficiency counter.

---

## Singleplayer Game Loop

```
START SCREEN
 └─ Best score displayed (final score + level reached)

ROUND START
 ├─ New maze generated
 ├─ Player and bot spawn at opposite ends
 ├─ Projectile counter resets to 0
 ├─ Player magazine resets to 7
 └─ First power-up spawns at a random open tile 5–10 seconds in
    (subsequent: every 10–15 seconds; max 3 uncollected on map at once)

ROUND ACTIVE
 ├─ Player and bot navigate, aim, and fire
 ├─ Both compete for power-ups on equal terms
 ├─ Counter increments by 1 for every projectile that visibly travels across the screen
 └─ Bot speed, accuracy, and pathing scale with current Level

BOT HIT
 ├─ Score += 100 × Level × Efficiency Multiplier
 ├─ Level-up check: if (total kills) mod 3 == 0 → Level += 1, Hearts = min(Hearts + 1, 6)
 └─ 3-second countdown → ROUND START

PLAYER HIT
 ├─ Hearts -= 1
 ├─ If Hearts == 0 → GAME OVER
 └─ 3-second countdown → ROUND START

GAME OVER
 ├─ Final score
 ├─ Level reached, total kills, best efficiency tier achieved this run
 └─ If score > stored best → overwrite local high score
```