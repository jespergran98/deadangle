# Dead Angle

Dead Angle is a real-time two-player arcade shooter inspired by Tank Trouble. Players navigate a neon maze, firing projectiles that ricochet off walls. Hit your opponent to win the round.

**Frontend:** Next.js (React) — game rendering, UI, real-time state  
**Backend:** C# (.NET) — multiplayer only; single source of truth for all game outcomes, physics validation, and session state

---

## Table of Contents

- [Overview](#overview)
- [Game Screens](#game-screens)
- [Gameplay](#gameplay)
- [Scoring](#scoring)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Backend Responsibilities](#backend-responsibilities)
- [Frontend Responsibilities](#frontend-responsibilities)

---

## Overview

Dead Angle supports two modes:

- **Singleplayer** — play as Player 1 against a bot, runs entirely client-side. No backend involvement during gameplay
- **Multiplayer** — Player 1 creates a room and shares the code, Player 2 joins. No login or identity required

---

## Game Screens

| Screen | Description |
|---|---|
| Start | Choose singleplayer or multiplayer |
| Lobby | Multiplayer only — Player 1 shares a room code, Player 2 joins |
| Game | Live maze arena — the core experience |
| Summary | Final scores shown after the session ends |

---

## Gameplay

- Both players move around the maze using keyboard controls (WASD + Q, or Arrow keys + Space)
- Each player has 7 projectiles. Each projectile expires after 10 seconds. When the last projectile is fired, a 3-second reload begins before 7 new projectiles are granted
- Projectiles bounce off walls at a true reflection angle
- A round ends 3 seconds after a player is hit — the new maze generates in the background during this window and is ready the moment the transition ends

---

## Scoring

- Hitting your opponent awards 1 point
- A 3-second transition begins immediately — the new maze generates in the background
- Both players respawn at new positions when the new maze loads
- Rounds are unlimited; the session ends when a player quits

---

## Architecture

### Singleplayer

Runs entirely in the browser. The bot, physics, hit detection, maze generation, and scoring are all client-side. The backend is not contacted.

### Multiplayer — game authority model

The backend is the authoritative source for all game **outcomes** — hit detection, scoring, round resolution, and session state. The frontend is the authoritative source for **rendering**.

Projectile movement is handled by **deterministic client-side simulation**:

1. When a projectile is fired, the server emits a `projectileFired` event containing the projectile's id, owner, start position, angle, velocity, and server timestamp
2. Both clients simulate the projectile locally using identical deterministic physics — the maze layout is fixed for the duration of a round, so both clients and server always agree on wall positions
3. The server independently simulates the same projectile for hit detection only
4. When the server detects a hit, it emits `roundEnded` — the only authoritative signal. Clients never report hits

Player positions are server-authoritative. Clients send input each frame; the server updates positions at ~20Hz and broadcasts the result. Clients interpolate between received positions for smooth rendering.

The maze is generated server-side at the start of each round and sent to both clients once as a static wall grid.

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

---

## Backend Responsibilities

*(Multiplayer only — the backend is not involved in singleplayer)*

- Server-side game loop and tick rate (~20Hz)
- Player position updates from client input
- Projectile simulation for authoritative hit detection
- Round resolution and scoring
- Maze generation — runs async during the 3-second round transition
- Room creation and join flow
- Anonymous session ID assignment (Player 1 / Player 2)
- Emitting all game events to clients via SignalR
- Outbound Discord webhook on session end

---

## Frontend Responsibilities

**Both modes**
- Rendering the maze, players, and projectiles on Canvas each frame
- Deterministic local projectile simulation for smooth 60fps rendering
- Capturing keyboard input

**Singleplayer only**
- Bot movement and firing logic
- Hit detection and scoring
- Maze generation between rounds

**Multiplayer only**
- Sending keyboard input to the backend via SignalR
- Receiving and applying all authoritative game events from the backend
- Interpolating player positions between server ticks