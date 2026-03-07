Dead Angle is a real-time multiplayer arcade shooter inspired by the classic Tank Trouble. Players navigate a neon maze, firing projectiles that ricochet off walls — the last player standing wins the round.

This is what I want you to ensure is correct:

It features a start screen, lobby screen, game screen and summary screen.

It's max 2 players. singleplayer is against a bot, multiplayer is against a friend through a lobby code.

The score system is purely based on "round wins", rounds are unlimited, when an opponent is hit by a bullet, the round ends, you get 1 point, and it moves on to the next round instantly with new spanws. (Extremely simple logic).

I also want you to ensure the backend and frontend responsibilities are logical and make perfect sense.

Ensure the readme is as clean, simple and well structured as possible, without any assumptions.

---

I'm now going to start on the start screen.

Ensure this prompt is as good as possible:

Yor task is now to create the startscreen of my game "Dead Angle". 

Here is the apps theme:

(update this text to make sense for the simple singleplayer and multiplayer option on the start screen)
Pure 1980s arcade cabinet energy — the kind of game that would have lived next to Pac-Man and Galaga. Black background, neon outlines only. The maze walls are bright single-colour neon lines with no fill. Player tokens are minimal geometric vehicles made of 3-4 rectangles. Projectiles are small bright squares. Iconic, immediately readable, trivially achievable in CSS.

Flat 2D top-down arcade game maze arena. Pure black background. Maze walls are bright neon outlines only — thin glowing lines with no fill, in hot pink or cyan. Players are minimal geometric tank shapes made of 2-3 rectangles in contrasting neon colours, viewed from above. Small bright square projectiles. No textures, no gradients, no 3D. Thick pixel-art style outlines. Style: 1982 arcade cabinet game screen, like Tron or early vector arcade games. Everything flat, bold, minimal

The prompt should be simple, straight to the point and clean.

---

Build the start screen for Dead Angle — a 1980s neon arcade game.

## Visual Style
Pure black background. All UI elements give 1980s arcade cabinet energy.
Colour palette: hot pink and cyan, white pixel text. Glow effects via box-shadow only.
Font: monospace or pixel-style. Style reference: Tron, Galaga, early vector arcade cabinets.
All assets are CSS-only — no images, no SVGs, no icon libraries.

## Layout
Centred vertically and horizontally. From top to bottom:
1. Game title "DEAD ANGLE" — large, hot pink neon glow
2. Two mode buttons: "SINGLEPLAYER" and "MULTIPLAYER" — neon outlined, cyan on hover
3. When MULTIPLAYER is selected, a sub-toggle appears: "HOST" and "JOIN"
   - HOST: no input field. One "CREATE ROOM" button
   - JOIN: a room code input field and a "JOIN ROOM" button

## Behaviour
- SINGLEPLAYER navigates directly to /game
- MULTIPLAYER → HOST: calls POST /rooms, writes response to RoomContext, navigates to /lobby
- MULTIPLAYER → JOIN: calls POST /rooms/{code}/join, writes response to RoomContext, navigates to /game
- All REST calls go through src/services/api.ts
- On success, sessionId, playerSlot, roomCode, and mode are written to RoomContext
- Loading and error states are handled inline — no separate screens

## Constraints
- Next.js App Router — this is src/app/page.tsx
- Components live in src/features/start/components/
- Logic lives in src/features/start/hooks/useStartFlow.ts
- Follow the file structure exactly as specified in the attached filestructure.md
- Follow all game rules and architecture exactly as specified in the attached README.md

(Look at the moodboard images and attached filestructure and CLAUDE.MD, and create a very simple globals.css dfollowing best 2026 practices)