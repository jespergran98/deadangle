# Dead Angle

Dead Angle is a real-time two-player arcade shooter inspired by Tank Trouble. Players navigate a neon maze, firing projectiles that ricochet off walls. Hit your opponent to win the round.

**Frontend:** Next.js (React) — game rendering, UI, real-time state  
**Backend:** C# (.NET) — single source of truth for all game logic, physics, and real-time state

---

## Table of Contents

- [Overview](#overview)
- [Game Screens](#game-screens)
- [Gameplay](#gameplay)
- [Scoring](#scoring)
- [Tech Stack](#tech-stack)
- [Backend Responsibilities](#backend-responsibilities)
- [Frontend Responsibilities](#frontend-responsibilities)

---

## Overview

Dead Angle supports two modes:

- **Singleplayer** — play against a bot
- **Multiplayer** — play against friends using a room code

Rounds are unlimited and continue until either player quits.

---

## Game Screens

| Screen | Description |
|---|---|
| Start | Choose singleplayer or multiplayer |
| Lobby | Host shares a room code, opponent joins, it starts |
| Game | Live maze arena — the core experience |
| Summary | Final scores shown after the session ends |

---

## Gameplay

- Both players move around the maze using keyboard controls (Either WASD + Q or Arrow keys + Space)
- The user has 7 Projectiles, each projectile lasts last 10 seconds. When the final projectile is fired, there is a 3 second "reload" before 7 new bullets are granted.
- Projectiles bounce off walls at a true reflection angle
- A round ends 3 seconds after a player is hit, during this 3 second period the new map generates performantly in the background, instantly putting the players on the map when the 3 second timer is over.

---

## Scoring

- Hitting your opponent awards 1 point
- Both players respawn instantly at new positions when the new map loads after 3 seconds.
- The next round begins after 3 seconds - no intermission screen
- Rounds are unlimited; the session ends when a player quits

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- HTML Canvas — game rendering
- SignalR client — real-time game state

**Backend**
- ASP.NET Core
- SignalR hub — player input, game events, state sync
- REST API — room management, session handling

**Integrations**
- GitHub OAuth — player authentication
- Discord webhook — when a session ends, the .NET backend sends an outbound POST to a Discord webhook URL with a formatted match summary

---

## Backend Responsibilities

- Server-side game loop and tick rate
- Projectile physics and wall collision detection
- Hit detection and round resolution
- Bot logic for singleplayer mode
- Room creation and join flow
- Emitting game state to clients via SignalR

---

## Frontend Responsibilities

- Rendering the maze, players, and projectiles on Canvas each frame
- Capturing and sending keyboard input to the backend via SignalR
- Receiving and applying game state updates from the backend
- All UI outside the canvas — start, lobby, and summary screens