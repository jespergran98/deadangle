Dead Angle is a real-time multiplayer arcade shooter inspired by the classic Tank Trouble. Players navigate a neon maze, firing projectiles that ricochet off walls — the last player standing wins the round.

This is what I want you to ensure is correct:

It features a start screen, lobby screen, game screen and summary screen.

It's max 2 players. singleplayer is against a bot, multiplayer is against a friend through a lobby code.

The score system is purely based on "round wins", rounds are unlimited, when an opponent is hit by a bullet, the round ends, you get 1 point, and it moves on to the next round instantly with new spanws. (Extremely simple logic).

I also want you to ensure the backend and frontend responsibilities are logical and make perfect sense.

Ensure the readme is as clean, simple and well structured as possible, without any assumptions.

---

I'm now going to start on the start screen.

Ensure this prompt is as good as possible.

Here is the apps theme:
(update this text to make sense for the simple singleplayer and multiplayer option on the start screen)
Pure 1980s arcade cabinet energy — the kind of game that would have lived next to Pac-Man and Galaga. Black background, neon outlines only. The maze walls are bright single-colour neon lines with no fill. Player tokens are minimal geometric vehicles made of 3-4 rectangles. Projectiles are small bright squares. Iconic, immediately readable, trivially achievable in CSS.
Flat 2D top-down arcade game maze arena. Pure black background. Maze walls are bright neon outlines only — thin glowing lines with no fill, in hot pink or cyan. Players are minimal geometric tank shapes made of 2-3 rectangles in contrasting neon colours, viewed from above. Small bright square projectiles. No textures, no gradients, no 3D. Thick pixel-art style outlines. Style: 1982 arcade cabinet game screen, like Tron or early vector arcade games. Everything flat, bold, minimal

The prompt should be simple, straight to the point and clean.

improve this prompt that will be attached with the CLAUDE.md, filestructure and moodboard images:

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

(Look at the moodboard images and attached filestructure and CLAUDE.MD, and create a very simple globals.css following best 2026 practices)

---

Create a prompt I can start in a new conversation with a single job of scrutinizing the CLAUDE.md and filestructure, and find the cleanest and best solution for all features and update the filestructure and CLAUDE.md accordingly. I will keep pasting the prompt you give together with the filestructure.md and CLAUDE.md over 10 times, until it has analyzed and caught every issue. The prompt should be short, clean straight to the point and follow best 2026 standards.'

---

You are a senior full-stack architect reviewing a game project called Dead Angle.

Your only job is to read the attached CLAUDE.md and filestructure.md, understand the project deeply, then produce updated versions of both files that are simpler and more correct than what you received.

Guiding principle: the simplest solution that is fully correct beats a complex solution that is also correct. If something can be removed, merged, or replaced with a simpler approach without losing any feature — do it.

Ask yourself for every file, every decision, every system:
- Is this the simplest way to achieve this?
- Is this logic on the right side of the client/server boundary?
- Does this file exist because the project needs it, or because it seemed like good practice?
- Can two things become one thing?

Deliver:
1. Updated CLAUDE.md
2. Updated filestructure.md
3. Changelog — every change with what it was, what it is now, and why it is simpler or more correct

If you find nothing to improve, say so. Do not invent complexity. Do not add files or systems that aren't justified by a concrete feature need.

---------------------------------------------------------

# Dead Angle — Start Screen

Build the start screen (`src/app/page.tsx`), `globals.css`, and the `CRTOverlay` component for Dead Angle.
Reference the attached `CLAUDE.md` and `filestructure.md` for architecture and file placement rules.

---

## globals.css

Create `src/app/globals.css` first. It must contain:
- CSS reset (box-sizing, margin, padding, body)
- Design tokens as CSS custom properties: background colour, neon colours (hot pink, cyan, white), glow intensities, font stack, base font size, border widths
- `@keyframes` for all reusable animations: neon pulse glow, CRT flicker, any shared transitions
- It must follow all best 2026 practices, and act as the source of all design tokens meeting best 2026 practices for development.

No component styles. Everything else goes in a `.module.css` file.

---

## CRTOverlay

Create `src/components/CRTOverlay/CRTOverlay.tsx` and `CRTOverlay.module.css`.

This component renders a fixed full-viewport div that sits above all page content on every screen. It is mounted once in `src/app/layout.tsx` and never touched again.

**What it does:**
- Horizontal scanlines across the full screen — `repeating-linear-gradient` of alternating fully transparent and semi-transparent black bands, 2–4px apart
- Subtle screen vignette — `radial-gradient` darkening toward the edges
- Optional slow CRT flicker — a low-opacity `@keyframes` brightness pulse, defined in `globals.css`, applied here. Keep it subtle: just enough to feel like a CRT tube, not enough to be distracting or cause discomfort

**Hard constraints:**
- `pointer-events: none` — must never intercept clicks, keyboard, or any input
- `position: fixed`, `inset: 0`, `z-index` above all page content
- Pure CSS — no canvas, no JS, no animation libraries
- No impact on layout of any element beneath it

---

## Visual style

1980s arcade cabinet. The start screen is a title screen — think the attract mode of Galaga or Tron.

- **Background:** pure black (`#000`)
- **Palette:** hot pink (`#FF2D78`), cyan (`#00F0FF`), white for body text
- **Glow:** `box-shadow` and `text-shadow` only — no images, no SVGs, no external fonts
- **Font:** monospace system font or a CSS `@font-face` pixel font if one is already in `/public` — do not import from Google Fonts or any CDN
- **Borders:** neon outlines only, no fills on interactive elements
- **No gradients, no textures, no 3D transforms**

Specific elements:
- **Title "DEAD ANGLE"** — large, hot pink, heavy `text-shadow` glow. Static or slow pulse using the `@keyframes` from `globals.css`
- **Mode buttons** ("SINGLEPLAYER", "MULTIPLAYER") — neon outlined rectangles, no fill. Cyan on hover/active, with glow. Uppercase, letter-spaced
- **Sub-options** ("HOST", "JOIN") — same outline style, smaller than mode buttons. JOIN is active/highlighted by default
- **Room code input** — neon outlined, black background, cyan caret, monospace text, no browser default styling
- **"JOIN ROOM" button** — same style as mode buttons

The CRTOverlay is already active on this screen via `layout.tsx` — do not add it here.

---

## Layout

Centred vertically and horizontally. Single column. Top to bottom:

1. "DEAD ANGLE" title
2. SINGLEPLAYER / MULTIPLAYER mode buttons
3. *(MULTIPLAYER only)* HOST and JOIN sub-options — JOIN is active by default
4. *(JOIN, default)* Room code input + "JOIN ROOM" button
5. *(HOST)* No additional UI — clicking HOST is the action itself

---

## Behaviour

- **SINGLEPLAYER** → `router.push('/game')`
- **MULTIPLAYER → HOST** — clicking HOST immediately calls `POST /rooms` via `api.ts` → write `sessionId`, `playerSlot`, `roomCode`, `mode` to `RoomContext` → `router.push('/lobby')`
- **MULTIPLAYER → JOIN** — clicking "JOIN ROOM" calls `POST /rooms/{code}/join` via `api.ts` → write `sessionId`, `playerSlot`, `mode` to `RoomContext` → `router.push('/lobby')`
- Loading state: disable the active button and change its label (e.g. "CONNECTING…") — no spinner
- Error state: short error message below the button in hot pink — no modal, no separate screen
- All logic lives in `src/features/start/hooks/useStartFlow.ts`

---

## File placement

```
src/app/globals.css
src/app/layout.tsx                              ← add <CRTOverlay /> here
src/app/page.tsx
src/app/page.module.css
src/components/
  CRTOverlay/
    CRTOverlay.tsx
    CRTOverlay.module.css
src/features/start/
  components/
    ModeSelector/
      ModeSelector.tsx
      ModeSelector.module.css
    RoomCodeInput/
      RoomCodeInput.tsx
      RoomCodeInput.module.css
  hooks/
    useStartFlow.ts
```

---

Analyze the attached Start Screen implementation guide, Claude.md, filestructure.md and the moodboard images. Deliver the new files following best 2026 practices with clean, refactored, streamlined and perfect code.