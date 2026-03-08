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

---

Here was the original prompt I gave you, I will start a new chat and attach all the files you created, the new prompt will be to analyze the attached files, and ensure all the files you've created are as visually stunning, impressive, performant, and follow all 2026 practices. Provide an improved version of the prompt that I'll attach with the newly created files, CLAUDE.md and filestructure.md.

---

Here's your prompt:

---

**Analyze all attached files — CLAUDE.md, filestructure.md, and every source file — then deliver a complete, production-ready overhaul of the Dead Angle start screen.**

The single goal: a start screen that looks and feels like a real 1980s arcade cabinet attract mode. Not inspired by one. Indistinguishable from one.

**Non-negotiable standards:**

- **CRT simulation** — visible fisheye corner darkening, horizontal scanlines, a slow vertical sweep line, and a power-on boot sequence (bright horizontal line expands to fill screen).
- **Chromatic aberration** — the title "DEAD ANGLE" must have permanently offset red/cyan ghost copies (CSS `::before`/`::after` + `content: attr(data-text)` + `mix-blend-mode: screen`), with a periodic glitch burst. Offset must be large enough to see without looking for it.
- **Animations that land** — every value must be visually perceptible. Nothing subtle to the point of invisible. Power-on plays once on mount. Title breathes. Tank pulses. Footer blinks. Buttons have phosphor persistence (fast in, slow out).
- **Neon green** (`#C8FF00`) introduced as the third palette colour alongside hot pink and cyan — used on the tank token and anywhere a third accent is needed.
- **Zero regressions** — all existing logic (useStartFlow, RoomContext, api.ts, ModeSelector, RoomCodeInput) must be preserved exactly. Only visual and animation files change.

Deliver: `globals.css`, `layout.module.css`, `CRTOverlay.tsx`, `CRTOverlay.module.css`, `page.tsx`, `page.module.css`, `ModeSelector.module.css`. Nothing else.

----------------------------------------------

Here is the improved prompt with the issues corrected and precise technical specification for each effect:

---

**Analyze all attached files and deliver a complete, production-ready overhaul of the Dead Angle start screen.**

The single goal: a start screen that looks and feels like a real 1980s arcade cabinet attract mode. Not inspired by one. Indistinguishable from one.

---

**CRITICAL: READ THIS BEFORE WRITING A SINGLE LINE OF CODE**

Every animation and visual effect must be *immediately perceptible* at normal viewing distance without looking for it. If you have to squint or inspect the element to notice it, the value is wrong — double it. Do not write "subtle" or "slight" effects. This is a neon arcade cabinet. It screams.

---

### 1. CRT Simulation — Three Mandatory Layers

**Layer A: Barrel distortion / curved glass (NOT a vignette)**

A real 1980s CRT screen is a convex curved glass tube. The image is projected onto the inside of a curve, so the whole picture appears to bulge slightly outward like a fishbowl. What this looks like in practice:

- The corners of the screen appear very slightly compressed inward, as if the glass is pulling the image toward the center
- The edges of the screen appear darker not because of an overlay gradient but because the electron beam arrives at a shallower angle to the phosphor at the extremes, reducing emission efficiency

**Layer B: Horizontal scanlines — animated, not static**

Scanlines must not be a static `repeating-linear-gradient`. A real CRT's electron beam is always moving — the image is redrawn 60 times per second. Simulate this with a `@keyframes` that very slowly shifts the `background-position-y` of the scanline gradient by one full pitch (3px), creating a slow perpetual downward scroll of the scan pattern. Cycle time: ~0.5s, `linear`, `infinite`. Opacity of the dark scanline bands: `rgba(0,0,0,0.40)` — fully visible, not subtle. DO THIS WHILE ALSO ENSURING PERFECT PERFORMANCE.

**Layer C: Vertical sync sweep line**

A slowly drifting horizontal bright band (200px tall, feathered) from top to bottom of the viewport. The band must be white at `0.05` opacity at the brightest point — clearly a visible shimmer as it passes. Cycle time: 10s, `linear`.

---

### 2. CRT Startup Roll — Plays Once on Mount, Zero Delay

When a real CRT TV is switched on, the horizontal and vertical deflection circuits take ~0.5–1.5 seconds to lock to the sync signal. During that window, before the raster fills properly, you see **diagonal rolling bands** — bright scan lines sweeping across the screen at an angle (typically 15–25° off horizontal) because the H-sync and V-sync are not yet phase-locked. This is distinct from the "line expands" boot concept — it is a desync roll that happens while the image is already trying to display..

---

### 3. Chromatic Aberration on the Title

`DEAD` and `ANGLE` must each render three layers:

- **Real text (pink):** z-index 1, `text-shadow: var(--title-shadow)`, pulsing
- **Red ghost (`::before`):** `content: attr(data-text)`, `color: #FF2200`, `mix-blend-mode: screen`, permanently at `transform: translate(-5px, 2px)`. On the black background `mix-blend-mode: screen` will show the pure red. Over the pink title, it screen-blends toward saturated red-white. Opacity: `0.85`.
- **Cyan ghost (`::after`):** `content: attr(data-text)`, `color: #00EEFF`, `mix-blend-mode: screen`, permanently at `transform: translate(5px, -2px)`. Opacity: `0.85`.

Both ghosts are **permanently offset** — visible at all times without any animation needed to notice them. Additionally: every 8–10s a `@keyframes` burst snaps both ghosts to `translate(±18px, ±4px)` with a `skewX(±4deg)` for 3 frames (≈50ms), then snaps back. This is the glitch burst. The resting offset of 5px is the baseline; the glitch burst is the exclamation point.

Both `page.tsx` title `<span>` elements must carry `data-text="DEAD"` and `data-text="ANGLE"` so `content: attr(data-text)` resolves correctly.

---

### 4. Title, Tank, and Footer — Perceptible Animation Values

**Title pulse (`neon-pulse-title`):** The `text-shadow` must visibly throb. At minimum the glow spread values must change by 2× between the dim and bright keyframes. Cycle: 3s. The difference between resting and pulsed state must be obvious.

**Tank pulse (`tank-pulse`):** The tank must visibly flash brighter and dimmer. `filter: brightness(1)` to `filter: brightness(1.5)` with `drop-shadow` values going from `0 0 4px` to `0 0 20px`. The pulse should feel like a heartbeat, not a fade. Cycle: 2s.

**Footer blink (`blink-slow`):** Must go from `opacity: 1` to `opacity: 0` (full off, not just dim). A real attract-mode INSERT COIN prompt is either fully on or fully off.

**Corner diamonds:** Scale from `1.0` to `1.2` as well as opacity change.

---

### 5. Phosphor Persistence on Buttons

Real phosphor screens retain a fading afterglow after the electron beam moves on. Simulate with asymmetric CSS transitions:

- Hover **on**: `transition: all 40ms ease` (instant strike)
- Hover **off**: `transition: all 320ms ease` (slow phosphor decay)

In CSS, the transition defined on the *hovered state* governs the in-direction, and the transition on the base state governs the out-direction. Use this: define `transition: ... 320ms ease` on the base `.modeBtn` selector, and override with `transition: ... 40ms ease` inside the `.modeBtn:hover` selector.

---

### 6. Zero Regressions

`useStartFlow`, `RoomContext`, `api.ts`, `ModeSelector.tsx`, `RoomCodeInput.tsx`, `RoomCodeInput.module.css`, and `layout.tsx` must not be touched. Every interface, prop, and export from those files stays exactly as-is.

---

### Deliverables

Exactly these 7 files, nothing else:

`globals.css` — updated `@keyframes` (add `chroma-r`, `chroma-c`, `startup-roll`, `scanline-scroll`, update `tank-pulse` and `blink-slow` to perceptible values)  
`layout.module.css` — unchanged  
`CRTOverlay.tsx` — add startup roll: `useState(true)` mounted for 1200ms, render `.startup` div only while true  
`CRTOverlay.module.css` — barrel distortion via `border-radius` + inset `box-shadow` on `.overlay`; animated scanlines; `.startup` + `.startupLine` classes  
`page.tsx` — add `data-text` attributes to both `.titleWord` spans, no other changes  
`page.module.css` — chromatic aberration `::before`/`::after` on `.titleWord`; updated animation values  
`ModeSelector.module.css` — phosphor persistence asymmetric transition

---

Okay, you added way too many complexities that had no visual impact, I also think there might be an import/animation issue because nothing is actually animating on my screen, the diagonal line animation on startups look completely off because it doesn't actually affect the real lines being drawn, and overall there are a lot of issues. Your task is no longer to update the files, but provide a clean version of this preompt without all the complexities. I only want a major improvement of the start screen, but don't mention specifics.

--------------------------------------------------

Here's a clean, direct version of the prompt:

---

**Overhaul the Dead Angle start screen to look and feel like a real 1980s arcade cabinet attract mode.**

Read all attached files before writing any code. Deliver exactly these 7 files: `globals.css`, `layout.module.css` (unchanged), `CRTOverlay.tsx`, `CRTOverlay.module.css`, `page.tsx`, `page.module.css`, `ModeSelector.module.css`.

Do not touch `useStartFlow.ts`, `RoomContext.ts`, `api.ts`, `ModeSelector.tsx`, `RoomCodeInput.tsx`, `RoomCodeInput.module.css`, or `layout.tsx`.

---

**Every visual effect must be immediately obvious at normal viewing distance. If you have to look for it, double the value. This is a neon arcade cabinet — it screams.**

---

**CRT overlay** — Three layers, all in CSS, `pointer-events: none`, `position: fixed`:
- Animated horizontal scanlines (dark bands visible at full opacity, slowly drifting downward via `background-position` animation — not static)
- A curved-screen edge darkening effect (inset `box-shadow`, not a vignette gradient)
- A slow bright horizontal band drifting top-to-bottom (the vertical sync sweep shimmer)

**CRT startup** — On mount, play a one-shot diagonal banding effect for ~1200ms that simulates a CRT locking to sync. Use `useState` in `CRTOverlay.tsx` to unmount it after the animation completes.

**Title chromatic aberration** — Each title word (`DEAD`, `ANGLE`) must have a red ghost and a cyan ghost permanently offset a few pixels in opposite directions using `::before`/`::after` with `mix-blend-mode: screen`. Add `data-text` attributes to both `<span>` elements in `page.tsx` so `content: attr(data-text)` works. Every few seconds, both ghosts should snap wider for a brief glitch burst.

**Animation values must be perceptible:**
- Title glow pulse: shadow spreads must change by at least 2× between dim and bright states
- Tank pulse: `brightness(1)` to `brightness(1.5)`, glow from tight to wide — a visible flash, not a fade
- Footer blink: `opacity: 1` to `opacity: 0` — fully off, not dim

**Button hover — phosphor persistence:** Define `transition: 320ms ease` on the base button state (slow decay on mouse-out) and override with `transition: 40ms ease` inside the `:hover` selector (instant strike on mouse-in).

--------------

Your task is no longer to update the files, but provide a clean version of this prompt without all the complexities. I only want a major improvement of the start screen, but don't mention specifics. I do not want the animation that goes on mount anymore, it looks ugly and weird, and the overall prompt needs to be way shorter and straight to the point. Also if any CSS is specific to only one component, that component should have the animations inside it. But the global css file should have base animations that eventually can be used by multiple components, not specific animations specific to each feature. Please just create a prompt that will analyze the current project and provide perfect solutions and a overhauled startscreen with better layout and design:

---

**Rebuild the Dead Angle start screen from the ground up. The goal: indistinguishable from a real 1980s arcade cabinet attract mode. Not inspired by one — indistinguishable from one.**

Read every attached file before writing a single line. Deliver exactly these 7 files: `globals.css`, `layout.module.css` (unchanged), `CRTOverlay.tsx`, `CRTOverlay.module.css`, `page.tsx`, `page.module.css`, `ModeSelector.module.css`. Do not touch `useStartFlow.ts`, `RoomContext.ts`, `api.ts`, `ModeSelector.tsx`, `RoomCodeInput.tsx`, `RoomCodeInput.module.css`, or `layout.tsx`.

---

**The cardinal rule: if you have to look for an effect, the value is wrong — double it. This screen should feel loud, alive, and slightly unstable. Like real phosphor glass under voltage.**

---

**CRT Hardware Simulation**

Every layer is CSS only, `pointer-events: none`, `position: fixed`, above all content.

Scanlines must be animated — dark bands visibly drifting downward via `background-position` keyframes, not a static gradient. Full opacity, not subtle. The screen should look like it's being redrawn.

The edges of the screen darken from the inside using inset `box-shadow` — this simulates the electron beam losing efficiency at shallow angles toward the glass edge, which is distinct from a vignette. Combine this with a slight `border-radius` to suggest curved glass.

A bright horizontal band drifts slowly from top to bottom — the vertical sync sweep. It should be clearly visible as it passes, like a real phosphor shimmer.

On mount, play a one-shot startup desync effect for roughly 1200ms — diagonal banding across the full screen, as if the H/V sync circuits haven't locked yet. Use `useState` in `CRTOverlay.tsx` to unmount the startup layer once it finishes. Zero delay — it plays the instant the page loads.

**Chromatic Aberration on the Title**

Add `data-text="DEAD"` and `data-text="ANGLE"` to the two title spans in `page.tsx`. Using `::before` and `::after` with `content: attr(data-text)` and `mix-blend-mode: screen`, render a red ghost and a cyan ghost permanently offset a few pixels in opposite directions. They are always visible — resting offset is the baseline. Every several seconds, both ghosts snap violently wider with a brief skew for a glitch burst, then snap back instantly.

**Everything Must Throb**

The title glow pulses between a dim and a blazing state — shadow spreads at least double between keyframes. The difference must be obvious across the room.

The tank flashes between dim and painfully bright on a heartbeat rhythm — `brightness(1)` to `brightness(1.5)`, drop-shadow from tight to blown-out. It should look like it's surging with power.

The footer prompt blinks fully on and fully off — `opacity: 1` to `opacity: 0`. No dimming. A real arcade INSERT COIN text is either lit or it isn't.

Corner diamonds scale up as well as change opacity — they should visibly pop on every pulse.

**Phosphor Persistence on Buttons**

On mouse-in: transition completes in 40ms — instant phosphor strike. On mouse-out: transition takes 320ms — slow afterglow decay. Achieve this by defining the slow transition on the base selector and overriding with the fast one inside `:hover`. This is a real physical behavior, not a style choice.

**Overall Aesthetic**

Push the design further than the current files suggest. The color palette — hot pink, cyan, neon green on pure black — should feel maximalist, not tasteful. Rethink spacing, scale, fonts and layout rhythm if needed to make the screen feel like a cabinet bezel, not a webpage. Every element should earn its place by contributing to the illusion.

-----------------------------------------

# Dead Angle — Start Screen Overhaul

Read every attached file before writing a single line. Understand the full project — design tokens, component structure, existing CSS, the flow hooks — then redesign the start screen from scratch.

Deliver exactly these 7 files: `globals.css`, `layout.module.css` (unchanged), `CRTOverlay.tsx`, `CRTOverlay.module.css`, `page.tsx`, `page.module.css`, `ModeSelector.module.css`. Do not modify any other file.

---

## CSS Architecture Rule

**CSS Modules scope `animation-name` values locally.** A `.module.css` file cannot reference `@keyframes` declared in `globals.css` — the browser will silently fail to find them. Therefore:

- `globals.css` defines only **shared base animations** that are candidates for reuse across multiple components (e.g. `blink`, `fade-in`, `cursor-blink`)
- Every `.module.css` file **declares its own `@keyframes` locally** for any animation specific to that component
- Never rely on a global keyframe inside a module file

---

## Goal

The screen should feel like a real 1980s arcade cabinet attract mode — loud, maximalist, slightly unstable. Hot pink, cyan, neon green on pure black. Every element should earn its place by contributing to the illusion.

---

## CRT Overlay

CSS only — `pointer-events: none`, `position: fixed`, above all content.

- **Scanlines**: animated dark bands drifting downward. Use a child `<div>` with a `repeating-linear-gradient` scrolled via `translateY` — one pitch per cycle for a seamless loop. Not subtle; the screen should look like it's being redrawn
- **Edge darkening**: inset `box-shadow` layers simulate electron beam falloff at screen edges. Add a slight `border-radius` to suggest curved glass. This is not a vignette — it's edge-specific
- **Sweep line**: a bright horizontal band drifts from top to bottom on a slow loop, clearly visible as it passes

No startup/mount animation.

---

## Title

Add `data-text="DEAD"` and `data-text="ANGLE"` to the title spans in `page.tsx`. Use `::before` / `::after` with `content: attr(data-text)` and `mix-blend-mode: screen` to render permanent red and cyan ghost offsets. Every few seconds, both ghosts snap violently wider with a brief skew, then snap back instantly.

The title glow pulses — shadow spread at least doubles between resting and peak states. The difference should be obvious.

---

## Everything Throbs

- Tank: heartbeat rhythm, `brightness` swings from dim to painfully bright, drop-shadow from tight to blown-out
- Footer prompt: fully on / fully off — `opacity: 1` to `opacity: 0`, no dimming
- Corner diamonds: scale up and change opacity on each pulse — a visible pop, not a fade

---

## Phosphor Persistence on Buttons

Mouse-in: 40ms (instant phosphor strike). Mouse-out: 320ms (slow afterglow decay). Define the slow transition on the base selector; override with the fast one inside `:hover`.

---

## Layout and Design

Rethink the layout — scale, spacing, and rhythm should feel like a cabinet bezel, not a webpage. Push further than the current files suggest.

--------

1UP / 2UP — the final round counts from the last completed session (e.g. 00007 / 00004). In singleplayer, 2UP stays zeroed. These come from the sessionEnded event payload which already contains finalScores, so no extra backend work is needed.
HIGH SCORE — the highest single-session score across all games on this device, stored in localStorage. Just one number, one key — trivial to implement.

That's not it, I want the design of the tank to be pixel based, and not be rounded corners, here is the exact design:

a 3x5 base square, around this square is a 1 pixel gap (5x7 are missing), followed by a 7x9 square that is 1 pixel wide. In the petruding/cannon part, the outer 7x9 pixels are missing. Also update the font to a pixel font.

---

Perfect, I now want you to slightly improve this prompt, and also make it shorter, with the main goal being that this start screen truly is as impressive and cool as possible, don't say any specific implementations, but let the AI I give the prompt to be creative:

---

# Dead Angle — Start Screen Overhaul

Read every attached file before writing a single line. Understand the full project — design tokens, component structure, existing CSS, the flow hooks — then redesign the start screen from scratch.

Deliver exactly these 7 files: `globals.css`, `layout.module.css` (unchanged), `CRTOverlay.tsx`, `CRTOverlay.module.css`, `page.tsx`, `page.module.css`, `ModeSelector.module.css`. Do not modify any other file.

---

## CSS Architecture Rule

**CSS Modules scope `animation-name` values locally.** A `.module.css` file cannot reference `@keyframes` declared in `globals.css` — the browser will silently fail to find them. Therefore:

- `globals.css` defines only **shared base animations** reusable across multiple components
- Every `.module.css` file **declares its own `@keyframes` locally**
- Never rely on a global keyframe inside a module file

---

## Goal

Build the most visually stunning 1980s arcade cabinet attract screen possible. Hot pink, cyan, neon green on pure black. Loud, maximalist, slightly unstable. Every element must feel alive — nothing static, nothing that reads as a webpage.

Before writing anything, audit every existing animation and style critically. Ask: is this timing right? Is this glow spread convincing? Does this throb, or does it merely shift? Improve whatever falls short. The bar is a real phosphor cabinet in a dark arcade, not a CSS demo.

The layout should feel like a physical bezel — consider the full structure of a real arcade screen. Scale, spacing, and rhythm should be monumental.

---

## Hard Requirements

**CRT Overlay** — CSS only, `pointer-events: none`, `position: fixed`. Simulate a real phosphor tube: drifting scanlines (visible enough to look like active redraw, not a texture), edge-specific darkening with `inset box-shadow` (not a radial vignette), a clearly visible sweep line. No startup animation.

**Title** — Add `data-text="DEAD"` and `data-text="ANGLE"` to the title spans. Use `::before` / `::after` with `content: attr(data-text)` and `mix-blend-mode: screen` for permanent chromatic ghost offsets. Every few seconds both ghosts snap violently wider with a skew, then snap back instantly — use `animation-timing-function: linear` with sub-frame keyframe intervals (not `step-end`) so the snap fires at the correct moment. Title glow spread must at least double between resting and peak — the difference should be immediately obvious.

**Buttons** — Phosphor persistence: 40ms transition on mouse-in (instant strike), 320ms on mouse-out (afterglow decay). Define the slow transition on the base selector; override with the fast one inside `:hover`.

**Everything throbs** — heartbeats, blinks, pulses should feel visceral and physical. `opacity: 0` to `opacity: 1` with no in-between. Glow should bloom noticeably, not drift. Corner ornaments should pop in scale, not fade.

---

Now update this prompt. I will deliver this prompt to a new AI in a new conversation with the attached files, with the goal of ensuring this start screen now is truly visually amazing, leave the visual updates up to the creativity of the AI:

Update the visual design of this 1980s inspired startscreen.

Build the most visually stunning 1980s arcade cabinet attract screen possible. Hot pink, cyan, neon green on pure black. Loud, maximalist, slightly unstable. Every element must feel alive — nothing static, nothing that reads as a webpage.

The layout should feel like a physical bezel — consider the full structure of a real arcade screen. Scale, spacing, and rhythm should be monumental. This game would have competed with Tetris and PacMan.

---

Here's the updated prompt:

---

Update the visual design of this 1980s arcade cabinet attract screen.

The goal is a pixel-perfect recreation of what a 1984 coin-op machine would have looked like in a dark arcade — competing directly with Pac-Man, Donkey Kong, and Galaga for a player's quarter. Every design decision should be justified by that context.

**Palette:** `#FF2D78` pink · `#00F0FF` cyan · `#C8FF00` green on pure `#000000`. No other colors. No gradients between hues — real arcade hardware couldn't render them.

**Non-negotiables:**
- The screen must fit entirely within the viewport with zero scrolling — `height: 100dvh; overflow: hidden` is a hard requirement
- The DEAD ANGLE title must have clear vertical separation between the two stacked words — no overlap
- The design must not shift when different menues are opened (It currently shift up when 2 players are selected because a 3rd row appears with host room/ join room)
- All blinking and state-change animations must use `step-end` timing — real CRT hardware had no easing.
- Nothing should feel static.

**What to push creatively:** The visual treatment of every layer — the bezel geometry, the title rendering, the mascot, the ambient atmosphere, the structural rhythm between zones. Make bold choices. Reference real arcade attract screens: the score strip, the INSERT COIN blink, the scrolling ticker, the corner diamonds. Make them feel physical, not decorative.

The code quality matters as much as the visuals. Deliver a single clean `page.module.css` and updated `page.tsx`. All `@keyframes` declared locally in the CSS module. No dead rules. Sections clearly commented. Color values as hex literals inside keyframes (CSS variables don't interpolate reliably in all `@keyframes` contexts).