# Dead Angle

Dead Angle is a real-time two-player arcade shooter inspired by Tank Trouble. Players navigate a neon maze, firing projectiles that ricochet off walls. Hit your opponent to win the round.

**Frontend:** Next.js (React) — game rendering, UI, real-time state  
**Backend:** C# (.NET) — multiplayer only; single source of truth for all game outcomes, physics validation, and session state

---

## Table of Contents

- [Overview](#overview)
- [Player Flow](#player-flow)
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

- **Singleplayer** — play as Player 1 against a bot, runs entirely client-side. The backend is not contacted
- **Multiplayer** — no account or login required. Player 1 creates a room and shares the code. Player 2 enters the code and joins. The server assigns each connection an anonymous session ID used solely to identify the two slots — this is not authentication

---

## Player Flow

**Player 1 (multiplayer)**
1. Choose Multiplayer → Create Room
2. Server returns a room code and session ID
3. Wait in the lobby — the room code is displayed
4. Game starts automatically when Player 2 joins

**Player 2 (multiplayer)**
1. Choose Multiplayer → enter room code → Join
2. Server returns a session ID
3. Game starts immediately — Player 2 skips the lobby entirely

---

## Game Screens

| Screen | Who sees it | Description |
|---|---|---|
| Start | Both | Choose singleplayer or multiplayer; enter room code to join |
| Lobby | Player 1 only | Displays room code; waits for Player 2 to join |
| Game | Both | Live maze arena — the core experience |
| Summary | Both | Final scores shown after the session ends |

---

## Gameplay

- Both players move around the maze using keyboard controls (WASD + Q, or Arrow keys + Space)
- Each player has 7 projectiles. Each projectile expires after 10 seconds. When the last projectile is fired, a 3-second reload begins before 7 new projectiles are granted
- Projectiles bounce off walls at a true reflection angle
- A round ends when a player is hit. A 3-second countdown plays, then the next round begins with a new maze and fresh spawn positions

---

## Scoring

- Hitting your opponent awards 1 point
- After a 3-second countdown, the next round begins immediately with a new maze
- Rounds are unlimited; the session ends when a player quits

---

## Architecture

### Singleplayer

Runs entirely in the browser. The bot, physics, hit detection, maze generation, and scoring are all client-side. The backend is not contacted.

### Multiplayer — authority model

The backend is the authoritative source for all game **outcomes** — hit detection, scoring, round resolution, and session state. The frontend is the authoritative source for **rendering**.

**Projectiles — deterministic client simulation**

Simulating projectiles server-side at 60fps would be expensive and unnecessary. Instead:

1. When a player fires, the server emits `projectileFired` with the projectile's id, owner, start position, angle, velocity, and server timestamp
2. Both clients simulate the projectile locally using identical deterministic physics — the maze is static for the duration of a round, so both clients and the server always agree on wall positions
3. The server runs the same simulation independently, solely for hit detection
4. When the server detects a hit, it emits `roundEnded` — the only authoritative signal. Clients never report hits

**Player positions — server-authoritative**

Clients send their input direction each frame. The server updates positions at ~20Hz and broadcasts the result. Clients interpolate between ticks for smooth rendering.

**Maze**

Generated server-side when a round starts. Sent to both clients in the `gameStarted` event (first round) and the `roundEnded` event (subsequent rounds). Static for the duration of each round.

**Session identity**

When Player 1 calls `POST /rooms`, the server returns a `sessionId` and assigns them the `Player1` slot. When Player 2 calls `POST /rooms/{code}/join`, the same happens for `Player2`. The `sessionId` is passed as a query parameter when establishing the SignalR connection — `GameHub` maps it to the correct room and slot in `OnConnectedAsync`.

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

- Room creation and join flow; anonymous session ID assignment
- Mapping SignalR connections to player slots via session ID in `OnConnectedAsync`
- Server-side game loop at ~20Hz
- Player position updates from client input
- Projectile simulation for authoritative hit detection
- Round resolution, scoring, and new maze generation on round end
- Detecting player disconnection and ending the session
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
- REST calls to create or join a room
- Sending keyboard input to the backend via SignalR
- Receiving and applying all authoritative game events from the backend
- Interpolating player positions between server ticks