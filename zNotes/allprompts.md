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

---



---

Update the visual design of this 1980s arcade cabinet attract screen.

The goal is a pixel-perfect recreation of what a 1984 coin-op machine would have looked like in a dark arcade — competing directly with Pac-Man, Donkey Kong, and Galaga for a player's quarter. Every design decision should be justified by that context.

The entire 1UP, 2UP and high score display and the outer border design needs a complete overhaul to match the 1980s arcade aesthetic perfectly. The tank itself looks good, but the line above and below need major improvements for that 1980s retro arcade aesthetic, please ensure maximum perfection and clean, streamlined refactored and performant code.

**Palette:** `#FF2D78` pink · `#00F0FF` cyan · `#C8FF00` green on pure `#000000`. No other colors. No gradients between hues — real arcade hardware couldn't render them.

**Non-negotiables:**
- The screen must fit entirely within the viewport with zero scrolling — `height: 100dvh; overflow: hidden` is a hard requirement
- The DEAD ANGLE title must have clear vertical separation between the two stacked words — no overlap
- The design must not shift when different menues are opened (It currently shift up when 2 players are selected because a 3rd row appears with host room/ join room)
- All blinking and state-change animations must use `step-end` timing — real CRT hardware had no easing.
- Nothing should feel static.

**What to push creatively:** The visual treatment of every layer — the bezel geometry, the title rendering, the mascot, the ambient atmosphere, the structural rhythm between zones. Make bold choices. Reference real arcade attract screens: the score strip, the INSERT COIN blink, the scrolling ticker, the corner diamonds. Make them feel physical, not decorative.

The code quality matters as much as the visuals. Deliver a single clean `page.module.css` and updated `page.tsx`. All `@keyframes` declared locally in the CSS module. No dead rules. Sections clearly commented. Color values as hex literals inside keyframes (CSS variables don't interpolate reliably in all `@keyframes` contexts).

---

https://itch.io/game-assets/free/tag-8-bit/tag-sound-effects

---

Update the visual design of this 1980s arcade cabinet attract screen.

The goal is a pixel-perfect recreation of what a 1984 coin-op machine would have looked like in a dark arcade — competing directly with Pac-Man, Donkey Kong, and Galaga for a player's quarter. Every design decision should be justified by that context.

**Palette:** `#FF2D78` pink · `#00F0FF` cyan · `#C8FF00` green on pure `#000000`. No other colors. No gradients between hues — real arcade hardware couldn't render them.

Rework the tank design and the lines appearing above and below it. Instead of one tank aiming upwards with a blue line above and pink line below, it should be two tanks aiming towards each other: A pink tank on the left aiming to the right, and a green tank on the right aiming left. The line above and below needs a major improvement, remove the separate line with an animated star, instead make both lines blue and improve their design with two lines appearing below and above, and remove the fade out in the center, it should be one consecutive line. The design of the lines should fit the 1980s theme perfectly. A square bullet travels in between the two tanks with a trailing animation, the bullet shifts color as it travels between the pink and green tank.

**What to push creatively:** The visual treatment of every layer — the bezel geometry, the title rendering, the mascot, the ambient atmosphere, the structural rhythm between zones. Make bold choices. Reference real arcade attract screens: the score strip, the INSERT COIN blink, the scrolling ticker, the corner diamonds. Make them feel physical, not decorative.

The code quality matters as much as the visuals. Deliver a single clean `page.module.css` and updated `page.tsx`. All `@keyframes` declared locally in the CSS module. No dead rules. Sections clearly commented. Color values as hex literals inside keyframes (CSS variables don't interpolate reliably in all `@keyframes` contexts).

---

I'm making an arcade game inspired by "Tank Trouble" named Dead Angle. The singleplayer mode features a 1v1 against a bot and I want it to feel like that classic arcade game with a high score displayed on the start screen. Your goal is now to think of a cool scoring system that would fit the game, and the gameplay loop, I'm thinking you have 3 hearts, and gain a new heart every time you level up. Here are my very core ideas so far:

Tetris features logic where you have to clear more rows at once for additional score, I'm thinking maybe introducing a similar score system, but you get additional score for killing the opponent within the first bullet, first magazine and 2nd magazine? You also level up every x amount of times you kill the enemy, and the score is multiplied by the level you're in (to match tetris). Random power-ups will also spawn throughout the map such as:
Laser that reflects off walls with extreme velocity
A guided missile that you control after shooting it
An explosive cluster/ disco ball
Shotgun
Gatling Gun (smaller bullets with slight recoil)
triple barrel (Shoot three bullets at once)
Beam that shoots through walls with slight curvature towards the enemy
remove a wall
automatic missile that guides to the nearest

Your goal is now to both improve the names and rules of these power-ups, and deliver a suggested scoring system for the singleplayer mode. I want a perfect overview of powerups, score system and singleplayer game loop before integrating it into the GUIDE.md and file structure. I want crystal clear, straight to the point rules.

-------------------------------------

Good catches. Here's the core problems to fix before rewriting:

---

## 🎯 Revised Scoring System

### Kill Reward
> **Base = 100 × Level**

### Efficiency Tiers — *bullets fired this round before the kill*

| Tier | Condition | Multiplier | Feel |
|---|---|---|---|
| **Dead Angle** | Kill is your very first shot this round | ×4 | Near-impossible without setup |
| **Quick Draw** | Kill within first mag | ×2 | Aggressive early pressure |
| **Sustained** | Kill within second mag | ×1.5 | Normal competent play |
| **Suppression** | 14+ bullets fired | ×1 | You're fighting for survival |

The counter is round-total and never resets — picking up a power-up doesn't restart it. Tempest will burn through your efficiency window fast by design (see below), which is the tradeoff for its power.

### Level System
- Start at **Level 1**, 3 hearts
- Level up every **3 kills**
- Kill reward = **100 × Level** (before efficiency multiplier)
- Gain **+1 heart on level up**, capped at 6
- Hit = lose 1 heart → 0 hearts = Game Over

---

## ⚡ Power-Ups

Split into **ammo-based** and **time-based**. Each spawns on the map 5 seconds into a round at a random open tile. At most one power-up active at a time.

### Ammo-Based — replaces your shots for a limited count, then reverts

| **Phantom** | 1 shot | Fires a razor-thin laser at 10× speed.
| **Buckshot** | 4 shots | Fires a cone of 5 pellets. Pellets do not ricochet. Any pellet is lethal
| **Trifecta** | 3 shots | Fires 3 bullets like a shotgun with three different angles. All three ricochet normally. Each shot counts as 3 bullets toward your round total |
| **Heatseeker** | 1 shot | Fires a self-guiding missile that wall-follows toward the nearest player once it starts guiding 5 seconds after it was fired. Slower than standard bullets. Each shot counts as 1 bullet |

### Time-Based — active for a duration regardless of how much you fire

| **Tempest** | 5 seconds | Fires tiny bullets continuously at high speed (~25 bullets), slight recoil each burst. Every bullet counts toward your round total — using it will collapse your efficiency tier. Trade score for aggression |
| **Viper** | Up to 6 sec | Fires one missile you steer in real-time with WASD or arrow keys. Counts as 1 bullet. High risk, high reward — if it's your first shot, you get Dead Angle |
| **Nova** | 4 sec fuse | Fires one slow orb. Detonates after 4 seconds *or* on wall impact into 8 radial projectiles. Counts as 1 bullet. Set it and reposition |
| **Specter** | 4 sec beam | Fires one continuous beam that passes through all walls. Curves slightly toward the bot every second. Counts as 1 bullet. Rewards map awareness |

### Instant

| **Wrecker** | Removes the single wall segment, your nearest wall segment you aim towards is red, when fired (Q or Space), the wall gets removed. No shot fired.

---

## Scoring × Power-up Interactions — the tradeoffs

| Power-up | Efficiency impact | Strategic read |
|---|---|---|
| **Tempest** | Burns ~25 bullets → guaranteed Suppression tier | Use when you need to survive or you've already lost efficiency |
| **Trifecta** | Each shot costs 3 bullets → tier drops fast | Use early in the round for Quick Draw potential |
| **Viper / Nova / Specter** | 1 bullet each → preserves efficiency | High-ceiling plays — lethal and score-friendly |
| **Buckshot / Phantom / Heatseeker** | 1 bullet per shot → neutral | Reliable kills without trashing your multiplier |
| **Wrecker** | 0 bullets → no impact | Pure tactical tool, never hurts your score |

---

## 🔁 Singleplayer Game Loop

```
START SCREEN
 └─ High score displayed (score + level reached)
 └─ Press to play

ROUND BEGINS
 ├─ New maze generated
 ├─ Both players spawn at random positions
 ├─ Bullet counter resets to 0
 └─ Power-up spawns after 5 seconds at a random tile

ROUND ACTIVE
 ├─ Player and bot navigate and fire
 ├─ Bullet counter increments every shot (all weapon types)
 ├─ Power-up picked up on contact — one at a time
 └─ First hit ends the round

ROUND ENDS (bot hit)
 ├─ Score = 100 × Level × Efficiency Multiplier
 ├─ Check for level-up (every 3 kills) → grant +1 heart if leveled
 └─ 3-second countdown → next round

ROUND ENDS (player hit)
 ├─ Lose 1 heart
 ├─ 0 hearts → GAME OVER
 └─ 3-second countdown → next round

GAME OVER
 └─ Final score, level reached, kills, best efficiency hit
 └─ High score updated if beaten
```

---

The key tension is now clean: **time-based power-ups are powerful but punish your score (Tempest), or are high-stakes single shots that preserve it (Viper, Nova, Specter).** Ammo-based ones are reliable and neutral. Wrecker is pure tactics. Ready to commit this to the files on your say-so.

----------------------------------------------------------------

## 🎯 Scoring System

### Kill Reward
> **Score = 100 × Level × Efficiency Multiplier**

### Efficiency Tiers — total bullets fired this round before the kill

| Tier | Bullets fired | Multiplier |
|---|---|---|
| **Dead Angle** | Kill is your 1st shot this round | ×4 |
| **Quick Draw** | 2–6 bullets fired | ×2 |
| **Sustained** | 7–13 bullets fired | ×1.5 |
| **Suppression** | 14+ bullets fired | ×1 |

The counter is round-total and never resets — picking up a power-up does not restart it. The counter only resets when a new round begins.

### Level System
- Start at **Level 1**, **3 hearts**
- Level up every **3 kills**
- Gain **+1 heart on level up**, capped at **6 hearts**
- Taking a hit costs **1 heart** — 0 hearts ends the run

---

## ⚡ Power-Ups

One power-up spawns per round, 5 seconds in, at a random open tile. One active at a time.

---

**Ricochet Laser**
You fire once. A searing laser launches at 10× bullet speed and bounces off walls up to 8 times before fading. The power-up is spent the moment it fires.

---

**Guided Missile**
You fire once. After launch you take direct control of the missile's direction using your aim input (WASD or arrows) — it steers in real-time for . Detonates on impact. If this is your first shot of the round, Dead Angle is yours.

---

**Cluster Orb**
You fire once. A slow spinning orb drifts across the arena. On wall contact *or* after 4 seconds it detonates into 8 radial projectiles spraying in all directions. Fire it, then reposition. Costs 1 bullet.

---

**Shotgun Blast**
Replaces your magazine with 3 shells. Each shell fires a cone of 3 pellets — Any single pellet is lethal. Nearly unavoidable at close range. Reverts to standard after 4 shots. Each shot costs 1 bullet.

---

**Gatling Spin**
For 8 seconds you can fire stream of smaller, faster bullets. Slight recoil pushes you backward with each burst. Gatling Spin almost guarantees Suppression tier. Use it to survive, not to protect a multiplier.

---

**Triple Barrel**
Replaces your magazine with 3 triple shots. Each shot fires 3 bullets simultaneously in a tight fan — all ricochet normally. Each shot costs 3 bullets toward your round total, so two pulls already exits Quick Draw. Front-loaded power, score tradeoff.

---

**Phase Beam**
You fire once. A beam launches forward and passes through every wall on the map — nothing blocks it. It drifts slightly toward the bot each second, bending its path over 4 seconds before dissipating. Rewards knowing roughly where the enemy is. Costs 1 bullet.

---

**Wall Breaker**
No shot fired. The moment you pick this up, the wall segment nearest to your tank is destroyed for the rest of the round. Opens a new firing lane or escape route instantly.

---

**Lock-On Missile**
You fire once. A missile launches and after 5 seconds autonomously tracks the nearest player (you or the bot) — slower than standard bullets, uses intelligent A* and avoids hitting walls. Lasts for 15 seconds if it doesn't hit an enemy or a wall. Costs 1 bullet.

---

**Mine**
Place a mine on the ground, turns invisible after 3 seconds, if walked over by you or the opponent, it explodes, lasts until the round is over or stepped on.

---

## Scoring × Power-Up Interactions

| Power-up | Bullet cost | Efficiency impact |
|---|---|---|
| **Gatling Spin** | ~25 bullets over 3 sec | Guaranteed Suppression — use to survive |
| **Triple Barrel** | 3 bullets per shot | Tier drops after 2 shots — use early |
| **Guided Missile / Cluster Orb / Phase Beam** | 1 bullet each | Preserves efficiency — high ceiling plays |
| **Ricochet Laser / Shotgun Blast / Lock-On Missile** | 1 bullet per shot | Neutral — reliable without trashing multiplier |
| **Wall Breaker** | 0 bullets | No impact — pure tactical |

---

## 🔁 Singleplayer Game Loop

```
START SCREEN
 └─ High score displayed (score + level reached)

ROUND BEGINS
 ├─ New maze generated
 ├─ Both players spawn at opposite ends
 ├─ Bullet counter resets to 0
 └─ One power-up spawns after 5 seconds at a random tile

ROUND ACTIVE
 ├─ Player and bot navigate, fire, pick up power-up
 └─ Bullet counter increments on every shot (all weapon types)

ROUND ENDS — bot hit
 ├─ Score = 100 × Level × Efficiency Multiplier
 ├─ Level-up check → +1 heart if threshold crossed
 └─ 3-second countdown → next round

ROUND ENDS — player hit
 ├─ Lose 1 heart
 ├─ 0 hearts → GAME OVER
 └─ 3-second countdown → next round

GAME OVER
 └─ Final score, level reached, kill count, best efficiency achieved
 └─ High score saved if beaten
```

----------------------------------------------------------------

---

I'm building a singleplayer arcade game called **Dead Angle** — a Tank Trouble-inspired maze shooter where you face a bot in 1v1 rounds. Projectiles ricochet off walls. You have a 7-bullet magazine with a 3-second reload. A round ends when either player is hit.

I need a complete, flawless design document covering the scoring system, power-up system, and singleplayer game loop. Be rigorous — audit every rule for logical consistency, clean integer math, and arcade-appropriate feel before committing to it.

**Tone and inspiration:** The scoring system should feel like it belongs in a 1980s arcade cabinet — think Galaga, Tetris, Donkey Kong, Centipede, Robotron. That means round numbers, clean multipliers, scores that reward mastery and punish sloppiness, and numbers large enough to feel exciting but legible at a glance. A player should be able to glance at their score and immediately understand how well they're doing. No fractions, no obscure formulas, nothing that requires a manual to understand. The high score on the start screen should feel like a trophy worth chasing.

**Constraints and core ideas to build from:**

- Score per kill = base × level × efficiency multiplier. Efficiency is measured by projectiles fired this round
- 4 efficiency tiers. Thresholds should align with the 7-bullet magazine so boundaries feel natural, not arbitrary. No fractional scores
- Start at Level 1, 3 hearts. Level up every 3 kills, gain +1 heart per level up, capped at 6. Taking a hit costs 1 heart. 0 hearts = game over
- Every level up the bot gets slightly faster, more accurate, and smarter
- One power-up spawns per round at a random tile after 5 seconds. The bot competes for it on equal terms
- Power-ups freeze the core magazine on pickup and resume it on expiry — they never interfere with the 7-bullet count directly
- Every projectile visibly travelling across the screen costs 1 toward the efficiency counter — core bullets and power-up projectiles alike, no exceptions
- Power-ups to include: Ricochet Laser, Guided Missile, Phase Beam, Lock-On Missile, Cluster Orb, Shotgun Blast, Triple Barrel, Gatling Spin, Wall Breaker, Mine

**For each power-up, define:** exact projectile cost, efficiency impact, and a tight one-paragraph description. Think about how a 1980s arcade programmer would have handled the rules — visible, countable, no hidden math.

**Deliverable:** A clean final document with four sections — Scoring, Level & Hearts, Magazine, Power-Ups (individual descriptions + summary table), and the Singleplayer Game Loop. No open questions, no placeholders. Every rule must be complete and unambiguous.

----------------------------------------------------------------

---

## Scoring

**Score = 100 × Level × Efficiency Multiplier**

Efficiency is measured by total projectiles that travelled across the screen this round — core bullets and power-up projectiles both count. The counter resets at the start of each round and never resets mid-round.

| Tier | Projectiles fired | Multiplier |
|---|---|---|
| **Dead Angle** | 1 | ×4 |
| **Quick Draw** | 2–7 | ×3 |
| **Sustained** | 8–14 | ×2 |
| **Suppression** | 15+ | ×1 |

Thresholds align with the 7-bullet magazine. Every score is a clean integer.

---

## Level & Hearts

- Start at **Level 1**, **3 hearts**
- **Level up every 3 kills** → gain **+1 heart**, capped at **6**
- Taking a hit costs 1 heart — **0 hearts ends the run**

Every time you level up, the bot levels up with you — the player is able to move and turn more quickly and the bot also moves and turns faster, aims more accurately, and makes smarter pathing decisions. The score multipliers stay the same, but earning Dead Angle at Level 8 is a fundamentally different challenge than at Level 1.

---

## Magazine

- **7 bullets** per magazine
- When the last bullet is fired, a **3-second reload** begins before 7 fresh bullets are granted
- Picking up a power-up **freezes** the magazine — bullets remaining and reload timer both pause
- When the power-up is spent or expires, the magazine **resumes exactly where it left off**

---

## Power-Ups

One spawns 5-10 seconds into the round, and a new every 10-15 seconds, at a random open tile, with a limit of 2 on the map at once. Only one active at a time. The bot competes for power-ups on equal terms.

Every projectile that visibly travels across the screen costs 1 toward the efficiency counter — no exceptions.

---

**Ricochet Laser** — 1 projectile
Fires a single laser at 10× bullet speed. Bounces off walls up to 8 times before fading. One projectile, however many bounces.

---

**Guided Missile** — 1 projectile
Fires a missile you steer with your aim input for **4 seconds**. After that it holds its last direction for 2 more seconds before expiring. Firing it as your first projectile of the round still earns Dead Angle.

---

**Phase Beam** — 1 projectile
Fires a beam that passes through every wall on the map without stopping. Drifts toward the bot over 4 seconds then dissipates. Rewards knowing roughly where the bot is.

---

**Lock-On Missile** — 1 projectile
Fires a missile in the aimed direction. After 1 second it begins turning toward the nearest player at a fixed turning radius — it has momentum and can be outmaneuvered. Expires on wall contact or after 8 seconds. Can target you if you're closer.

---

**Cluster Orb** — 9 projectiles (1 launch + 8 detonation)
Fires a slow orb in your aimed direction. On wall contact or after 4 seconds it detonates into 8 radial projectiles. The 8 detonation shots all count. Firing it with 6 or more core bullets already spent guarantees Suppression.

---

**Shotgun Blast** — 9 projectiles (3 shells × 3 pellets)
Replaces your magazine with 3 shells. Each shell fires a cone of 3 pellets — any single pellet is lethal. Devastating at close range. Reverts to standard magazine state after all 3 shells are fired.

---

**Triple Barrel** — 9 projectiles (3 shots × 3 bullets)
Replaces your magazine with 3 shots. Each shot fires 3 bullets in a tight forward fan — all ricochet normally. Effective at mid-to-long range. Reverts after all 3 shots are fired. Two shots already exits Quick Draw.

---

**Gatling Spin** — ~25 projectiles
Fires a rapid stream of smaller, faster bullets for 8 seconds. Slight recoil pushes you backward with each burst. Deliberately destroys your efficiency tier — use it to survive, not to protect a multiplier.

---

**Wall Breaker** — 0 projectiles
No shot fired. The wall segment nearest to your tank is permanently destroyed for the rest of the round. Opens a new firing lane or escape route. The nearest segment may not be the one you want — that tension is intentional.

---

**Mine** — 0 projectiles
Places a mine at your current position. Turns invisible after 3 seconds. Detonates on contact by either player — including yourself. Lasts until the round ends or it is triggered.

---

## Power-Up Reference

| Power-Up | Projectile cost | Efficiency impact |
|---|---|---|
| Ricochet Laser | 1 | Neutral |
| Guided Missile | 1 | Neutral |
| Phase Beam | 1 | Neutral |
| Lock-On Missile | 1 | Neutral |
| Cluster Orb | 9 | Dangerous if already spent core bullets |
| Shotgun Blast | 9 | Exits Quick Draw in one use |
| Triple Barrel | 9 | Exits Quick Draw in two shots |
| Gatling Spin | ~25 | Guaranteed Suppression |
| Wall Breaker | 0 | No impact |
| Mine | 0 | No impact |

---

## Singleplayer Game Loop

```
START SCREEN
 └─ High score displayed (score + level reached)

ROUND START
 ├─ New maze generated
 ├─ Player and bot spawn at opposite ends
 ├─ Projectile counter resets to 0
 ├─ Magazine resets to 7
 └─ One power-up spawns at a random open tile after 5 seconds

ROUND ACTIVE
 ├─ Player and bot navigate, fire, and compete for the power-up
 └─ Counter increments on every projectile from any source

BOT HIT
 ├─ Score += 100 × Level × Efficiency Multiplier
 ├─ Level-up check → +1 heart if threshold crossed
 └─ 3-second countdown → next round

PLAYER HIT
 ├─ Lose 1 heart
 ├─ 0 hearts → GAME OVER
 └─ 3-second countdown → next round

GAME OVER
 ├─ Final score, level reached, kill count, best efficiency tier
 └─ High score saved locally if beaten
```

----------------------------------------------------------------------------------------------------------------


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


-------------------------------------------------------------------------------------------------------

Here's a tightened version:

---

I've attached two files — a main game design doc and a file structure. I've also attached a text containing the current singleplayer game loop and scoring system and a new power-up system that will be featured in both multiplayer and singleplayer. Using those as the source of truth, produce a final, clean design document with five sections: **Scoring**, **Level & Hearts**, **Magazine**, **Power-Ups**, and **Singleplayer Game Loop**.

Audit every rule before committing to it: clean integer math, no fractions, no hidden formulas, no contradictions. Every score, threshold, and projectile cost must be visible and countable — the way a 1980s arcade programmer would have done it. Think Galaga, Robotron, Donkey Kong: round numbers, multipliers that reward mastery, scores large enough to feel exciting but legible at a glance.

Each power-up entry must include its exact projectile cost, efficiency tier impact, and a single tight paragraph description. No placeholders, no open questions. Every rule complete and unambiguous.

---

Short, directive, and everything the model needs is in the attached files rather than re-stated in the prompt.

-----------------

Here is the prompt:

---

I am attaching three files: a game design document, a file structure, and a CLAUDE.md project overview. Your job is to produce updated versions of the file structure and CLAUDE.md that fully and cleanly integrate everything described in the design document.

Before writing anything, reason carefully through the following:

**Authority split — read this before touching anything:**
- Power-ups exist in both singleplayer and multiplayer. Any power-up logic, data types, and rendering belong in shared frontend code. The bot does compete for power-ups in singleplayer, but that is bot logic, not power-up logic.
- The scoring system (efficiency tiers, multipliers, level progression, hearts) is singleplayer-only and must never appear in backend models, DTOs, or multiplayer game state.
- In multiplayer, scoring is strictly 1 point per kill. The backend tracks only that integer per player. No tiers, no multipliers, no levels, no hearts.
- The bot, hit detection, maze generation, and all singleplayer game loop logic are client-side only. The backend is never contacted during singleplayer.
- Physics (projectile simulation, wall reflection, interpolation) is shared between modes and must stay in the frontend physics layer.
- All new power-up types must be represented in the shared frontend type definitions. Any power-up that has a server-observable effect in multiplayer (positional swap, projectile deflection, intangibility, orbit, gravity bending, decoy targeting, time warp) must also have a corresponding event or state field in the backend DTOs and SignalR event payloads so the server can broadcast it authoritatively to both clients.

**What to produce:**

1. **Updated file structure** — add every new file and folder that is genuinely required. Do not pad with speculative files. Follow the existing naming and placement conventions exactly: UI components get their own named folder with a `.tsx` and `.module.css`; hooks are flat `.ts` files with no folder; physics, rendering, and singleplayer logic are flat `.ts` files with no folder; types are flat `.ts` files; backend services, models, DTOs, and physics follow the existing C# naming pattern. Annotate every new entry with a concise inline comment describing its role, matching the style of existing comments.

2. **Updated CLAUDE.md** — integrate the power-up system, the singleplayer scoring and progression model, and any architecture changes cleanly into the existing document. Do not rewrite sections that do not need to change. Do not add a dedicated power-ups section unless it fits naturally — instead, extend the existing Gameplay and Architecture sections where the information belongs. The multiplayer scoring rule (1 point per kill, no tiers) must be stated clearly and unambiguously. The document must remain concise and authoritative — the standard a new engineer would use to understand the entire project at a glance.

Do not produce any code. Do not explain your reasoning after the fact. Output only the two updated documents, clearly labelled.

Each of the 18 power-ups requires a unique distinct power-up icon made with css (a base css power-up with unique icons depending on the power-up). Additionally, many power-ups will trigger specific visual modifications for the tank, projectiles, surroundings, trajectories and environment and more. Ensure the file and folder hierarchy accurately reflects this complexity, and verify that Claude.md and filestructure.md provide a flawless implementation strategy.

PROVIDE THE TWO UPDATED FILES.

---

Analyze all the logic and ensure power-ups, overall game flow and scoring system is flawlessly implemented into the file structure and claude.md file (claude.md acts as the source of truth), following the absolute best 2026 practices for backend and frontend. Go through each line one by one, and each power up one by one, and ensure all the correct logic is added. Ensure the file and folder structure is following the perfect feature based design, and follows absolute best practices. Ensure all text is crystal clear, easy to understand and truly perfect and logical.

---

Analyze the CLAUDE.md and filestructure carefully, and analyze all the existing files. Your task is now to create a text prompt I can attach together with the CLAUDE.md and filestructure, the goal is that I should be able to click "Start Game" on the start screen, and the game against the bot is started. The bot should be reffered to as "CPU" in all code and within the game evoking the nostalgia of 80s and 90s cabinet games. This means you have to implement the maze generation logic, singleplayer HUD, player design and opponent design (should match the tank on the start screen, player is pink, CPU is green).

---

Based on the details in `CLAUDE.md`, here is a concise, high-impact prompt you can use to generate the singleplayer gameplay screen:

---

### **Prompt for Singleplayer Implementation**

Implement the **Singleplayer Gameplay Screen** for Dead Angle by strictly following the filestructure.md architecture and mechanics in `CLAUDE.md`.

* **Navigation:** Connect the "Start Game" button to the live maze arena.
* **Theming:** Refer to the opponent exclusively as **CPU** in all code and UI elements to evoke a 1980s/90s arcade aesthetic.
* **Visuals:** Render the Player as a **pink tank** and the CPU as a **green tank** (matching startscreen pixelated layouts).
* **Core Logic:** Implement the `mazeGenerator.ts` for round starts and the 7-bullet magazine system with a 3-second reload.
* **HUD & Scoring:** Build the Singleplayer Hud to display Level, Hearts, and real-time Efficiency Tiers (Dead Angle, Quick Draw, Sustained, Suppression).
* **Progression:** Integrate the Level/Heart scaling and the "100 * Level * Multiplier" scoring formula.

-------------------------------------------------------------------------------------------

### **Prompt for Singleplayer Implementation**

Implement the **Singleplayer Gameplay Screen** for Dead Angle. Use `CLAUDE.md` and the existing codebase as the authoritative source for all logic, scoring formulas, and architectural patterns.

* **Navigation:** Connect the "Start Game" button to the live maze arena.
* **Theming:** Refer to the opponent exclusively as **CPU** to evoke a 1980s arcade aesthetic.
* **Visuals:** Render the Player as a **pink tank** (`#FF2D78`) and the CPU as a **green tank** (`#C8FF00`). Walls should be **cyan** (`#00F0FF`). The tanks should match the pixel logic of the tanks on the start screen.
* **Core Logic:** Implement `mazeGenerator.ts` for round starts and the 7-bullet magazine system with its 3-second reload.
* **HUD & Scoring:** Build the `SingleplayerHud` to display Level, Score, Hearts, and real-time Efficiency Tiers (Dead Angle, Quick Draw, Sustained, Suppression), all with a 1980s arcade
* **Progression:** Integrate `SingleplayerContext` to handle level-ups every 3 kills, the scoring formula, and scaling CPU difficulty.

The goal is a pixel-perfect recreation of what a 1984 coin-op machine would have looked like in a dark arcade — competing directly with Pac-Man, Donkey Kong, and Galaga for a player's quarter. Every design decision should be justified by that context.

Would you like me to generate the **CPU AI logic** for pathfinding and aiming to ensure it provides a challenging arcade experience?

---------------

Improve this prompt I will use to add the gameplay screen for singleplayer, keep it short, concise and straight to the point, ensuring the screen will flawlessly be implemented, the prompt will be attached together with the filestructure.md, CLAUDE.md and all exisatinf project files:

### **Prompt for Singleplayer Implementation**

Implement the **Singleplayer Gameplay Screen** for Dead Angle. Use `CLAUDE.md` and the existing codebase as the authoritative source for all logic, scoring formulas, and architectural patterns.

* **Navigation:** Connect the "Start Game" button to the live maze arena.
* **Theming:** Refer to the opponent exclusively as **CPU** in all code and UI to evoke a 1980s arcade aesthetic.
* **Visuals:** Render the Player as a **pink tank** (`#FF2D78`) and the CPU as a **green tank** (`#C8FF00`) with **cyan** walls (`#00F0FF`). Tanks must strictly match the pixelated layout and mascot design of the start screen.
* **Core Logic:** Implement logic for round starts and the 7-bullet magazine system with its 3-second reload.
* **HUD & Scoring:** Build the Hud to display Level, Score, Hearts using pixelated high-contrast 1984 arcade visual style.
* **Progression:** Integrate `SingleplayerContext` to handle level-ups every 3 kills, the scoring formula, and scaling CPU difficulty (speed, lead-aiming, and pathing).

Analyze the filestructure.md carefully to ensure each 

**The Goal:** A pixel-perfect recreation of a 1984 coin-op machine in a dark arcade—competing with *Pac-Man* and *Galaga*. Every design decision (flicker, sharp pixels, UI placement) should be justified by that hardware context.

---

Here's the improved prompt:

---

**Implement the Singleplayer Gameplay Screen.**

Refer to `CLAUDE.md` as the source of truth for all logic, and `filestructure.md` for every file path, responsibility, and naming convention. Do not deviate from either.

**Scope — create or complete exactly these files:**
`GameCanvas`, `SingleplayerHud`, `PowerUpIndicator`, `RoundTransition`, `useGameLoop`, `useKeyboardInput`, `projectileSimulation`, `wallReflection`, `powerUpEffects`, `bot`, `hitDetection`, `mazeGenerator`, `scoring`, `levelProgression`, `powerUpManager`, `drawMaze`, `drawPlayers`, `drawProjectiles`, `drawPowerUps`, `drawPowerUpEffects`, `SingleplayerContext`, `GameContext`, `GameProvider`.

**Visual identity — 1984 coin-op CRT:**
- Player tank: `#FF2D78` (pink). CPU tank: `#C8FF00` (green). Maze walls: `#00F0FF` (cyan). Background: `#000000`.
- All text and HUD elements use a pixelated bitmap font (e.g. `Press Start 2P`), high-contrast, no anti-aliasing. (import styling from global.css for )
- Canvas rendering: `imageSmoothingEnabled = false`. Tanks are pixel-art sprites, not smooth shapes.
- The CPU is always called **CPU** — never "bot", "enemy", or "opponent" — in UI text and code identifiers.

> **Styling:** Before writing any CSS, read `globals.css` in full. Use every relevant existing custom property (colours, font stacks, spacing, animation keyframes) rather than hardcoding values. Do not introduce a new token for anything already defined there.

**Logic — implement exactly as specified in `CLAUDE.md`:**
- 7-bullet magazine → 3s reload → 7 bullets. Magazine freezes on power-up pickup; resumes on expiry or spend.
- Scoring: `100 × level × efficiencyMultiplier(roundProjectileCount)`. Tier boundaries: Dead Angle 1–3 (×4), Quick Draw 4–7 (×3), Sustained 8–14 (×2), Suppression 15+ (×1).
- Level-up every 3 kills (`totalKills > 0 AND totalKills mod 3 === 0`), +1 heart capped at 6, deferred via `pendingLevelUp`.
- Round start: reset `roundProjectileCount` to 0, both magazines to 7, clear mines and active power-ups, apply pending level-up, generate new maze, spawn at opposite ends.
- `SingleplayerHud` displays: level, hearts (up to 6 icons), cumulative score, live efficiency tier label, ammo count or reload countdown.
- `RoundTransition`: 3s countdown. On bot kill: show score earned + tier label + level-up banner if triggered. On player hit: countdown only.

**CPU AI scales with level** via `botScalingForLevel()`: speed, turn rate, aim accuracy (spread cone), and pathing quality all increase. CPU competes for power-up pickups on equal terms.

------------------------------------------------------------

**Implement the Singleplayer Gameplay Screen.**

`CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either.

**Scope — create or complete exactly these files:**
`game/page.tsx`, `GameCanvas`, `SingleplayerHud`, `PowerUpIndicator`, `PowerUpIcon`, `RoundTransition`, `useGameLoop`, `useKeyboardInput`, `usePowerUpState`, `trajectoryPreview`, `projectileSimulation`, `wallReflection`, `powerUpEffects`, `bot`, `hitDetection`, `mazeGenerator`, `scoring`, `levelProgression`, `powerUpManager`, `drawMaze`, `drawPlayers`, `drawProjectiles`, `drawPowerUps`, `drawPowerUpEffects`, `SingleplayerContext`, `GameContext`, `GameProvider`, `RoomContext`, `highScore`.

**Navigation:**
- Selecting Singleplayer sets `RoomContext.mode = 'singleplayer'` and navigates to `/game`.
- On GAME OVER (hearts reach 0): call `highScore.saveHighScore(cumulativeScore, level)` if the new score exceeds the stored best, then navigate to `/summary`.

**Controls:** WASD to move, Q to fire. Arrow keys to move, Space to fire. Both schemes active simultaneously.

**Visual identity — 1984 coin-op CRT:**
- Player tank: `#FF2D78`. CPU tank: `#C8FF00`. Maze walls: `#00F0FF`. Background: `#000000`.
- All HUD text uses `Press Start 2P`, high-contrast, no anti-aliasing. `imageSmoothingEnabled = false` on the canvas context. Tanks are pixel-art sprites, not smooth shapes. (copy pixel layout of tanks on start screen).
- Before writing any CSS, read `globals.css` in full. Use every relevant existing custom property (colours, font stacks, spacing, animation keyframes) rather than hardcoding values. Do not introduce a new token for anything already defined there.
- The CPU is always called **CPU** — never "bot", "enemy", or "opponent" — in all UI text and code identifiers.

**useGameLoop — exact per-frame order:**
1. Advance physics: `projectileSimulation` → `powerUpEffects`
2. Run `bot` tick
3. Run `hitDetection`
4. Run `powerUpManager` tick
5. If player holds RicochetLaser and has not yet fired → call `trajectoryPreview` and store result for rendering
6. Draw in this exact order: `drawMaze` → `drawPowerUps` → `drawPowerUpEffects` → `drawPlayers` → `drawProjectiles`

**useKeyboardInput:**
- Movement input is suppressed for the player while `GameContext.phaseBeamLockedSlots` includes the player's slot (Phase Beam in flight — 4s lock).
- Firing input is suppressed while PhaseShift is active for the player.

**Magazine — implement exactly:**
- 7 bullets → fire last → 3s reload → 7 bullets.
- On power-up pickup: snapshot `{ bulletsRemaining, reloadTimeRemaining }` and freeze both. On power-up spent or expired: restore snapshot and resume. On round end: discard active power-up, reset both player and CPU magazines to 7.

**Projectile counter — critical rule:**
`roundProjectileCount` increments by +1 for every projectile that visibly travels, from **any source without exception** — including every child projectile spawned by power-ups (Cluster Orb children, ShotgunBlast shells, SplitterRound children and grandchildren, etc.).

**Efficiency tiers:** Dead Angle 1–3 (×4), Quick Draw 4–7 (×3), Sustained 8–14 (×2), Suppression 15+ (×1). Displayed live in `SingleplayerHud` as `roundProjectileCount` climbs.

**Scoring:** `100 × level × multiplier`. On every CPU kill: `hitDetection` calls `scoring.ts`, which writes the earned score into `SingleplayerContext` and calls `updateBestEfficiencyTier(tier)` to keep `bestEfficiencyTierThisRun` current. On every player hit: `hitDetection` calls `levelProgression.ts`.

**Level-up:** `checkLevelUp(totalKills)` returns true when `totalKills > 0 AND totalKills mod 3 === 0`. On level-up: both the player and the CPU gain movement speed and turning rate; the CPU additionally gains tighter aim (spread cone narrows) and better pathing. The level-up is deferred via `pendingLevelUp` and applied at the next round start — including the +1 heart grant (capped at 6) — even if the player also took a hit that same round.

**Round start — exact sequence:**
1. Apply `pendingLevelUp` if flagged (level +1, hearts +1 capped at 6)
2. Generate new maze (`mazeGenerator`)
3. Spawn player and CPU at opposite ends
4. Reset `roundProjectileCount` to 0
5. Reset both player and CPU magazines to 7
6. Clear all mines; discard all active power-ups for both player and CPU
7. Schedule first power-up spawn 5–10s from now

**powerUpManager — spawn rules:**
First pickup 5–10s after round start; each subsequent pickup 10–15s after the previous spawn; max 3 uncollected on the map at once; type chosen randomly from all 19 types. Neither player nor CPU can collect while already holding one. **Exception:** during Phase Shift the player CAN collect a new pickup to end the shift immediately and replace it with the new power-up.

**CPU AI (bot.ts) — scales via `botScalingForLevel(level)` → `{ speedMultiplier, turnRate, aimAccuracy, pathingQuality }`:**
- Pathfinds to the nearest uncollected pickup when not holding one; activates collected power-ups under the same rules as the player.
- When a Decoy is active, retargets to whichever of the real player or the Decoy is currently closer.
- Knows positions of its own placed mines and avoids them.

**SingleplayerHud displays:** level, hearts row (up to 6 icons, filled/empty), cumulative score, live efficiency tier label, ammo count or reload countdown in seconds. Reads from `SingleplayerContext`.

**RoundTransition:** On CPU kill — show score earned, tier label, and level-up banner if triggered. On player hit — show countdown only.

**The aesthetic goal:** A pixel-perfect recreation of a 1984 coin-op machine. Every design decision must be justified by that hardware context — sharp pixels, flicker, hard-edged neon on black.

---------------------------------------------------------------------------------------------

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
- All HUD text uses `Press Start 2P`, high-contrast, no anti-aliasing. `imageSmoothingEnabled = false` on the canvas context. Tanks are pixel-art sprites, not smooth shapes (use the same pixel art layout as the start screen, but with smaller tanks that fit perfectly across all viewports, following best 2026 practices)
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

Implement the **Singleplayer Gameplay Screen** for Dead Angle. `GameplayImplementation.md` is your implementation guide you need to follow, `CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either. All other files are the existing files within the project.

---

Analyze the new files one by one, and ensure all criteria within the GameplayImplementation.md, GUIDE.md and filestructure.md are met following the best 2026 practices for logic and development. Ensure all logic is refactored, streamlined and straight to the point with well made files that seamlessly work. Act as a professional developer and code analyzer. All logic should be as straight forward and perfect as possible.

---

Add the **Shared type system. — no logic, no implementations.** for Dead Angle. `GameplayImplementation.md` is your implementation guide you need to follow, `CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either. All other files are the existing files within the project.

---

I'm about to implement the **Singleplayer Gameplay Screen** for Dead Angle. `CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention, I will attach all files already in the project (including the two new types files). Do not deviate from either. All other files are the existing files within the project. My goal is for this prompt to be as good as possible, it should implement the gameplay screen (without powerups yet):

----------------------------------------------------------------------------

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

---

`CLAUDE.md` is the source of truth for all logic. `filestructure.md` is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either.

Do a major visual overhaul to the gameplay screen, the tank and maze pixel sizes are way too small, and the map is too big, the UI is super small all the way up in the corners. None of the physics are correct and projectiles do not bounce between walls. The maze generator needs to create better, smaller mazes. Ensure all logic and implementations work correctly.

**Visual identity — 1984 coin-op CRT:**
- Player tank: `#FF2D78`. CPU tank: `#C8FF00`. Maze walls: `#00F0FF`. Background: `#000000`.
- All HUD text uses `Press Start 2P`, high-contrast, no anti-aliasing. `imageSmoothingEnabled = false` on the canvas context. Tanks are pixel-art sprites, not smooth shapes.
- Before writing any CSS, read `globals.css` in full. Use every relevant existing custom property (colours, font stacks, spacing, animation keyframes) rather than hardcoding values. Do not introduce a new token for anything already defined there.
- The CPU is always called **CPU** — never "bot", "enemy", or "opponent" — in all UI text and code identifiers.

STREAMLINE AND CLEAN UP THE FILES A LOT.

-----------------------------------------------------------------------------

# Dead Angle — Singleplayer MVP Prompt

`CLAUDE.md` is the source of truth for all logic. The filestructure file is the source of truth for every file path, file responsibility, and naming convention. Do not deviate from either.

---

## Scope

Create or complete exactly these files:

`game/page.tsx`, `game/page.module.css`, `GameCanvas`, `useGameLoop`, `useKeyboardInput`, `projectileSimulation`, `wallReflection`, `hitDetection`, `bot`, `mazeGenerator`, `drawMaze`, `drawPlayers`, `drawProjectiles`, `GameContext`, `GameProvider`, `RoomContext`, `game.types.ts`

**Do not implement** power-ups, scoring, `SingleplayerContext`, `RoundTransition`, `SingleplayerHud`, `PowerUpIndicator`, `PowerUpIcon`, `trajectoryPreview`, `powerUpEffects`, `powerUpManager`, `drawPowerUps`, `drawPowerUpEffects`, `levelProgression`, or `highScore`. These will be layered in separately.

---

## Navigation

Selecting Singleplayer sets `RoomContext.mode = 'singleplayer'` and navigates to `/game`. There is no game-over condition for now — the game runs indefinitely.

---

## Controls

- WASD to move, Q to fire
- Arrow keys to move, Space to fire
- Both schemes active simultaneously

---

## Visual Identity — 1984 Coin-Op CRT

- Player tank: `#FF2D78` — CPU tank: `#C8FF00` — Maze walls: `#00F0FF` — Background: `#000000`
- All text uses `Press Start 2P`
- `imageSmoothingEnabled = false` on every canvas context
- Tanks are pixel-art sprites — hard-edged rectangles with a barrel nub, not smooth shapes
- Before writing any CSS, read `globals.css` in full. Use every relevant existing custom property rather than hardcoding values. Do not introduce a new token for anything already defined there.

---

## Types — `game.types.ts`

Define before implementing any logic. Include only what this MVP needs:

- `Player` — position, angle, speed
- `Projectile` — position, velocity, `bounceCount`, `spawnedAt`
- `MazeWall`, `MazeLayout`, `GameState`, `PlayerSlot`

Do not add `powerUpType`, `generation`, `isReturning`, `DecoyState`, `MineState`, or `GravityWellState` — those will be added when the relevant systems are built.

---

## `mazeGenerator`

Generate a grid-based maze using a recursive-backtracker or equivalent algorithm. Corridors must be wide enough for tanks to navigate. Returns a `MazeLayout` — an array of `MazeWall` segments with world-space coordinates.

---

## `bot` — Static for Now

The CPU does not move and does not fire. It spawns at its starting position and stays there. Export a `tickBot(state: GameState): GameState` function that returns the state unchanged. Real AI will be added in a later pass.

---

## `projectileSimulation`

Standard physics only — no power-up variants. Each frame: advance every projectile by `velocity × deltaTime`. On wall contact, apply `wallReflection` and increment `bounceCount`. Expire projectiles after 10 seconds. No `powerUpEffects` call.

---

## `wallReflection`

Compute the true reflection angle of a projectile off a `MazeWall` segment using standard incidence/reflection geometry. No approximations. Must be logically identical to the server's `WallReflection.cs` when it is eventually written.

---

## `hitDetection`

Check each projectile against both tank hitboxes every frame. On hit: remove the projectile and log `"HIT: player"` or `"HIT: CPU"` to the console. No scoring, no hearts, no round transition — detection only.

---

## `useGameLoop` — Per-Frame Order

1. `projectileSimulation`
2. `tickBot`
3. `hitDetection`
4. Draw: `drawMaze` → `drawPlayers` → `drawProjectiles`

No `drawPowerUps`, `drawPowerUpEffects`, or `trajectoryPreview` calls.

---

## `useKeyboardInput`

Track held keys. Expose `movement` (direction vector) and `firePressed` (boolean, edge-triggered — one projectile per keypress, not per held frame). No suppression logic yet.

---

## Magazine

7 bullets → fire last → 3s reload → 7 bullets. Display ammo count or reload countdown as plain canvas text in the top-left corner using `Press Start 2P`. This is the only HUD element needed for the MVP.

---

## Renderers

- **`drawMaze`** — render `MazeWall` segments as solid `#00F0FF` lines on black
- **`drawPlayers`** — render player (`#FF2D78`) and CPU (`#C8FF00`) as pixel-art rectangles with a barrel nub indicating facing direction
- **`drawProjectiles`** — render each in-flight projectile as a small bright square in the firing player's colour

---

## `GameContext` — Minimal

Hold only: `players` (player + CPU), `projectiles`, `maze`. No power-up fields, no mine states, no decoy, no gravity well, no `phaseBeamLockedSlots`.

## `RoomContext`

Hold `mode: 'singleplayer' | 'multiplayer' | null`. The singleplayer flow sets this before navigating to `/game`.

---

## Aesthetic Goal

A pixel-perfect recreation of a 1984 coin-op machine. Every decision must be justified by that hardware context — sharp pixels, hard-edged neon on black, no gradients, no blur.

-------------------------------------------------------------------------------------------

# Dead Angle — Singleplayer MVP

Implement the singleplayer game loop. Refer to `CLAUDE.md` for all game logic and `filestructure` for all file paths and naming.

---

## Files to create

```
src/app/game/page.tsx
src/app/game/page.module.css
src/features/game/components/GameCanvas/GameCanvas.tsx
src/features/game/components/GameCanvas/GameCanvas.module.css
src/features/game/hooks/useGameLoop.ts
src/features/game/hooks/useKeyboardInput.ts
src/features/game/physics/projectileSimulation.ts
src/features/game/physics/wallReflection.ts
src/features/game/singleplayer/hitDetection.ts
src/features/game/singleplayer/bot.ts
src/features/game/singleplayer/mazeGenerator.ts
src/features/game/rendering/drawMaze.ts
src/features/game/rendering/drawPlayers.ts
src/features/game/rendering/drawProjectiles.ts
src/features/game/constants.ts
src/context/GameContext.ts
src/context/GameProvider.tsx
src/types/game.types.ts
```

Also update `src/context/RoomContext.ts` to export a `RoomProvider` component with working state — the existing `RoomState` interface must stay intact, only add the provider.

---

## What to build

A playable singleplayer canvas game at `/game`. The player controls a tank in a generated maze, fires bouncing projectiles, and a static CPU tank sits at the opposite end. The game runs indefinitely.

---

## Key behaviour

- **Controls:** WASD + Q to fire, Arrow keys + Space to fire. Both schemes active simultaneously
- **Movement:** W/S moves forward/back along facing angle, A/D rotates
- **Magazine:** 7 bullets; firing the last triggers a 3s reload, then restores 7
- **Bot:** Spawns opposite the player, does not move or fire — `tickBot` returns state unchanged
- **Hit detection:** On projectile–tank collision, log `HIT: player` or `HIT: CPU`, remove the projectile — no other effects yet
- **Game loop order:** simulate projectiles → tick bot → detect hits → draw

---

## HUD

Drawn directly on the canvas, top-left, `Press Start 2P`. Show bullet count when loaded, reload countdown (seconds, 1 decimal) when reloading. This is the only UI element for the MVP.

---

## Visual rules

- Colours and fonts are already defined as tokens in `globals.css` — use them, don't hardcode values
- `imageSmoothingEnabled = false` on every canvas context
- Integer pixel coords everywhere (`Math.round`)
- No gradients, no blur — hard neon pixels on black

---

# Dead Angle — Singleplayer MVP

Implement the singleplayer game loop. Refer to `CLAUDE.md` for all game logic and `filestructure` for all file paths and naming.

---

## Files to create

```
src/app/game/page.tsx
src/app/game/page.module.css
src/features/game/components/GameCanvas/GameCanvas.tsx
src/features/game/components/GameCanvas/GameCanvas.module.css
src/features/game/hooks/useGameLoop.ts
src/features/game/hooks/useKeyboardInput.ts
src/features/game/physics/projectileSimulation.ts
src/features/game/physics/wallReflection.ts
src/features/game/singleplayer/hitDetection.ts
src/features/game/singleplayer/bot.ts
src/features/game/singleplayer/mazeGenerator.ts
src/features/game/rendering/drawMaze.ts
src/features/game/rendering/drawPlayers.ts
src/features/game/rendering/drawProjectiles.ts
src/features/game/constants.ts
src/context/GameContext.ts
src/context/GameProvider.tsx
src/types/game.types.ts
```

Also update `src/context/RoomContext.ts` to export a `RoomProvider` component with working state — the existing `RoomState` interface must stay intact, only add the provider.

---

## What to build

A playable singleplayer canvas game at `/game`. The player controls a tank in a generated maze, fires bouncing projectiles, and a static CPU tank sits at the opposite end. The game runs indefinitely.

---

## Key behaviour

- **Controls:** WASD + Q to fire, Arrow keys + Space to fire. Both schemes active simultaneously
- **Movement:** W/S moves forward/back along facing angle, A/D rotates
- **Magazine:** 7 bullets; firing the last triggers a 3s reload, then restores 7
- **Bot:** Spawns opposite the player, does not move or fire — `tickBot` returns state unchanged
- **Hit detection:** On projectile–tank collision, log `HIT: player` or `HIT: CPU`, remove the projectile — no other effects yet
- **Game loop order:** simulate projectiles → tick bot → detect hits → draw

---

## Maze

Recursive backtracker on a landscape grid (wider than tall). Every cell has at least one open passage to a neighbour — no cell is ever fully enclosed. The outer boundary is not a perfect rectangle: a small number of cells are removed from the corners and edges to give the maze an irregular, organic silhouette. Removed cells are treated as solid — they cannot be traversed or spawned into. Returns a `MazeLayout` of world-space `MazeWall` segments including the border walls of the remaining shape.

DO NOT USE HARDCODED PIXEL SIZES FOR ANYTHING, ENSURE IT SCALES PERFECTLY ACROSS VIEWPORTS JUST LIKE THE STARTSCREEN.

---

## HUD

Drawn directly on the canvas using `Press Start 2P`. Styled as a 1980s arcade HUD — two panels, one per tank, positioned in opposite corners of the canvas. The player panel sits underneath the canvas to the left in pink the CPU panel sits underneath the canvas in green. All colours are imported from `globals.css` tokens — nothing hardcoded. Each panel shows only the bullet count (number of bullets remaining) and a reload cooldown animation when reloading. This is the only UI element for the MVP.

---

## Responsive layout

The canvas is landscape (wider than tall). On slim viewports where the viewport width is less than the canvas width, rotate the entire canvas 90° with CSS (`transform: rotate(90deg)`) and swap the width/height constraints so it fills the screen correctly. All gameplay logic, coordinates, and input handling remain completely unchanged — this is a pure CSS visual rotation.

---

## Visual rules

- Colours and fonts are already defined as tokens in `globals.css` — use them, don't hardcode values
- `imageSmoothingEnabled = false` on every canvas context
- Integer pixel coords everywhere (`Math.round`)
- No gradients, no blur — hard neon pixels on black

Feel free to adjust and rework elements within game.types.ts

---

Create a new prompt I can attach with all the new files, with the goal of ensuring all the logic in all new files are as clean, refactored and perfect as possible. The maze size is logical, all collisions and trajectories make sense and work as intended, and all original goals are met: 

---

Review and refactor the attached files for the Dead Angle singleplayer MVP, ensuring all logic is clean, efficient, and perfectly implemented per the original spec in CLAUDE.md and the provided file structure. Focus on eliminating redundancy, optimizing performance, and fixing any bugs or inconsistencies in movement, firing, projectile simulation, wall reflections, hit detection, bot behavior (static), maze generation, rendering, and game loop order (simulate projectiles → tick bot → detect hits → draw). Verify that the maze uses a logical landscape grid size that scales responsively without hardcoded pixels, incorporates an irregular organic silhouette by removing corner/edge cells (treating them as solid), and guarantees no fully enclosed cells with at least one open passage per cell.

Ensure collisions, projectile trajectories, and bounces are physically sensible and work flawlessly, with integer pixel coordinates and no smoothing. Confirm the magazine system (7 bullets, 3s reload), dual control schemes (WASD+Q and arrows+space active simultaneously), HUD rendering (pink/green panels with bullet count and reload animation using Press Start 2P and globals.css tokens), and responsive layout (CSS 90° rotation on slim viewports without altering logic) all meet the original goals. The game should run indefinitely as a playable singleplayer experience at /game, with the bot spawning opposite the player and hit detection logging only (no other effects).

Update src/context/RoomContext.ts to include a working RoomProvider component while keeping the existing RoomState interface intact. Maintain visual rules: neon pixels on black, no gradients/blur, and perfect scaling across viewports like the startscreen. Output refactored versions of all files with improvements, preserving the overall structure and types in game.types.ts.

---

The tank is too big, and the maze is too big generating too complex maps, in corners 3 tiles are unable to be entered, but they're still a part of the map instead of being "chopped out", I don't want these 3 pixels in the sides anymore, I want random removal of random tiles around the entire canvas that are near walls. There has to be much more variation and smaller mazes. Ensure it fits perfectly on the screen (I need to scroll now). Do a major overhaul, while ensuring the code is clean, performant and streamlined.

---

Review and refactor the attached files for the Dead Angle singleplayer MVP, ensuring all logic is clean, efficient, and perfectly implemented per the original spec in CLAUDE.md and the provided file structure. Focus on eliminating redundancy, optimizing performance, and fixing any bugs or inconsistencies in movement, firing, projectile simulation, wall reflections, hit detection, bot behavior (static), maze generation, rendering, and game loop order (simulate projectiles → tick bot → detect hits → draw). Verify that the maze uses a logical landscape grid size that scales responsively without hardcoded pixels, incorporates an irregular organic silhouette by removing corner/edge cells (treating them as solid), and guarantees no fully enclosed cells with at least one open passage per cell.

Remove the effect that pixelizes the tank as it turns.
When a section near the wall is unplayable, do not render it's outer border (currently the full 14x8 area has an outer border, even if the area is not accessible).
Make sure the playable area better fits on the screen, currently it fills almost the entire screen, it should be a bit smaller, and the HUD bigger.
Ensure random wll segments miss throughout the map with clean logic, ensuring easy access and more map creativity and uniqueness.

Ensure collisions, projectile trajectories, and bounces are physically sensible and work flawlessly, with integer pixel coordinates and no smoothing. Confirm the magazine system (7 bullets, 3s reload), dual control schemes (WASD+Q and arrows+space active simultaneously), HUD rendering (pink/green panels with bullet count and reload animation using Press Start 2P and globals.css tokens), and responsive layout (CSS 90° rotation on slim viewports without altering logic) all meet the original goals. The game should run indefinitely as a playable singleplayer experience at /game, with the bot spawning opposite the player and hit detection logging only (no other effects).

---

There is still a slight blue shadow behind the outer 14x8 canvas, instead of treating the outer walls as the now outer walls. (The 14x8 area is filled by a black square with a blue shadow, even though the background already is black and no shadow is needed).

When the tank turns, it should keep the exact TANK_GRID visual design still with no warping or visual changes.

The playable area fills the entire screen, there should be some padding/margins/gaps or whatever is the best that ensures there is a slight gap around the screen. The "Player" and "CPU" HUD underneath the canvas is too small.

---


Review and refactor the attached files for the Dead Angle singleplayer MVP, ensuring all logic is clean, efficient, and perfectly implemented per the original spec in CLAUDE.md and the provided file structure. Focus on eliminating redundancy, optimizing performance, and fixing any bugs or inconsistencies in movement, firing, projectile simulation, wall reflections, hit detection, bot behavior (static), maze generation, rendering, and game loop order (simulate projectiles → tick bot → detect hits → draw). Verify that the maze uses a logical landscape grid size that scales responsively without hardcoded pixels, incorporates an irregular organic silhouette by removing corner/edge cells (treating them as solid), and guarantees no fully enclosed cells with at least one open passage per cell.

Ensure collisions, projectile trajectories, and bounces are physically sensible and work flawlessly, with integer pixel coordinates and no smoothing. Confirm the magazine system (7 bullets, 3s reload), dual control schemes (WASD+Q and arrows+space active simultaneously), HUD rendering (pink/green panels with bullet count and reload animation using Press Start 2P and globals.css tokens), and responsive layout (CSS 90° rotation on slim viewports without altering logic) all meet the original goals. The game should run indefinitely as a playable singleplayer experience at /game, with the bot spawning opposite the player and hit detection logging only (no other effects).

---

Go through all new logic one more time and ensure all logic now is perfectly meeting the criteria:
Review and refactor the attached files for the Dead Angle singleplayer MVP, ensuring all logic is clean, efficient, and perfectly implemented per the original spec in CLAUDE.md and the provided file structure. Focus on eliminating redundancy, optimizing performance, and fixing any bugs or inconsistencies in movement, firing, projectile simulation, wall reflections, hit detection, bot behavior (static), maze generation and rendering. Verify that the maze uses a logical landscape grid size that scales responsively without hardcoded pixels, incorporates an irregular organic silhouette by removing corner/edge cells, and guarantees no fully enclosed cells with at least one open passage per cell.

Ensure collisions, projectile trajectories, and bounces are physically sensible and work flawlessly. Confirm HUD rendering (pink/green panels with bullet count and reload animation) are visually perfect ant stunning with the 1980s retro aestetic, and responsive layout (CSS 90° rotation on slim viewports without altering logic) all meet the original goals. The game should run indefinitely as a playable singleplayer experience at /game, with the bot spawning opposite the player and hit detection logging only (no other effects).

Provide only the files that are in need of improvements, if the changes are small, only do an str_replace.

---

This was the prompt I made to update the visual design of the start screen, create a similar, simple, clean straight to the point prompt that visually enhances the gameplay screen:

Update the visual design of this 1980s arcade cabinet attract screen.

The goal is a pixel-perfect recreation of what a 1984 coin-op machine would have looked like in a dark arcade — competing directly with Pac-Man, Donkey Kong, and Galaga for a player's quarter. Every design decision should be justified by that context.

**Palette:** `#FF2D78` pink · `#00F0FF` cyan · `#C8FF00` green on pure `#000000`. No other colors. No gradients between hues — real arcade hardware couldn't render them.

**What to push creatively:** The visual treatment of every layer — the bezel geometry, the title rendering, the mascot, the ambient atmosphere, the structural rhythm between zones. Make bold choices. Reference real arcade attract screens: the score strip, the INSERT COIN blink, the scrolling ticker, the corner diamonds. Make them feel physical, not decorative.

The code quality matters as much as the visuals. Deliver a single clean `page.module.css` and updated `page.tsx`. All `@keyframes` declared locally in the CSS module. No dead rules. Sections clearly commented. Color values as hex literals inside keyframes (CSS variables don't interpolate reliably in all `@keyframes` contexts).

---

Update the visual design of the Dead Angle gameplay screen.

The goal is a pixel-perfect 1984 coin-op feel during active play — the same dark arcade cabinet context as the attract screen, now with a live game running inside it.

**Palette:** `#FF2D78` pink · `#00F0FF` cyan · `#C8FF00` green on pure `#000000`. No other colors. No gradients.

**What to push creatively:** The HUD strip is the primary canvas — treat it like a real arcade status bar. Player labels, bullet pip icons, and the reload indicator should feel physically printed on the cabinet bezel, not floated over a webpage. Consider scan-line texture, corner accents, and a subtle vignette around the canvas — all period-accurate. The two-player asymmetry (pink left, green right) should be legible at a glance from across a room.

The code quality matters as much as the visuals. Deliver a single clean `GameCanvas.module.css` and updated `GameCanvas.tsx` if markup changes are needed. All `@keyframes` declared locally in the CSS module. No dead rules. Sections clearly commented. Color values as hex literals inside keyframes.

---

Update the visual design of the Dead Angle gameplay screen and update existing files. (look at the attached page.tsx and page.module.css used to style the start screen for inspiration).

The goal is a pixel-perfect 1984 coin-op feel during active play. A CRT overlay (scanlines, flicker, sweep, glitch bar) is already applied globally — do not add any further CRT simulation.

**Palette:** `#FF2D78` pink · `#00F0FF` cyan · `#C8FF00` green on pure `#000000`. No other colors. No gradients between hues.

**What to push creatively:**

The canvas surround — frame the play field like a physical cabinet monitor bezel: a tight cyan border with a layered neon glow that makes the game area read as a phosphor tube burning inside a dark room. Corner accent marks (short L-shaped ticks in cyan) at all four corners of the canvas, as seen on real vector-display cabinets.

The HUD strip below the canvas — treat it as a physical status panel silk-screened onto the bezel, not a floating UI element. Player labels (`PLAYER` left, `CPU` right) in dim uppercase with wide letter-spacing. Bullet pips rendered as solid filled squares when loaded, hollow when spent — arranged horizontally, matching each player's color. The reload progress bar should pulse with a neon glow as it fills. A vertical separator line in the center of the HUD divides the two sides cleanly.

The two-player asymmetry (pink left, green right) must be immediately legible at a glance. Both panels should feel like they belong to the same physical strip, not two independent components.

**Hard constraints:**
- No CRT effects of any kind (no scanlines, no flicker, no sweep, no blur, no vignette — all handled globally).
- No gradients between hues.
- All `@keyframes` declared locally in the CSS module.
- No dead rules. Sections clearly commented.
- Color values as hex literals inside `@keyframes`.
- Deliver `GameCanvas.module.css` and updated `GameCanvas.tsx` only if markup changes are needed.

---

You did the completely wrong things, you added a border around the canvas, even though some of the canvas is not playable, the outer walls of the maze is not always at the canvas edge. You also added absolutely no updates to the HUD under the canvas, or any improvements to the overall canvas. Analyze the original prompt I gave you and update the prompt ,ensuing next time I give the prompt to an AI it flawlessly actually improves the whole design.

-------

Update the visual design of the Dead Angle gameplay screen. Deliver updated `GameCanvas.module.css` and `GameCanvas.tsx` (only if markup changes are needed).

Reference the attached `page.tsx` and `page.module.css` (start screen) for tone, palette usage, and component patterns.

---

## Context you must understand before touching any code

Read `GameCanvas.tsx` and `GameCanvas.module.css` in full before writing anything.

The canvas element (`560×320 px` drawing buffer, CSS-scaled) renders a **procedurally generated maze**. The maze's outer walls are not guaranteed to sit at the canvas edge — organic boundary removal means the active playfield can be inset from the canvas rectangle by one or more cells. **A CSS border, outline, or box-shadow on `.canvasWrap` or `.canvas` will frame empty black space, not the playfield.** Do not add any decoration directly to those two elements.

All decorative framing must be applied to `.canvasOuter` (the sizing wrapper that already exists above `.canvasWrap`) — this is the element you style as the cabinet monitor bezel.

---

## Goal

A pixel-perfect **1984 coin-op arcade** feel during active play. Every element should feel physically manufactured — silk-screened, machined, or phosphor-etched — not rendered by a browser.

A CRT overlay (scanlines, flicker, sweep, glitch bar) is already applied globally. **Do not add any CRT simulation of any kind** (no blur, no vignette, no scanlines, no flicker, no opacity pulse).

---

## Palette

`#FF2D78` pink · `#00F0FF` cyan · `#C8FF00` green on `#000000` black.  
No other colours. No gradients between hues. Opacity variants of these colours are allowed for dim/inactive states. (all styles from the global.css are allowed)

---

## What to design

### 1 — Canvas surround on `.canvasOuter`

Style `.canvasOuter` as a physical **cabinet monitor bezel**:
- A layered `box-shadow` in cyan that reads as a phosphor tube glowing inside a dark room: tight hard edge → mid glow → wide ambient aura.
- Four short **L-shaped corner tick marks** (two-sided borders, ~16×16 px) anchored at the four corners of `.canvasOuter`. Use `position: absolute` children with `::before`/`::after` pseudo-elements or separate `<span>` elements. The ticks must overhang the outer edge slightly (negative offset). Use `filter: drop-shadow` not `box-shadow` on the ticks so the L-shape glows as a silhouette, not a rectangle.
- A thin top-border or inset rule on the HUD strip that reads as the lower bezel lip.

### 2 — HUD strip (`.hud` and children)

The HUD is a **physical status panel silk-screened onto the bezel face**, not a floating browser UI. Redesign it completely:

**Layout:** `.hudPanel` (P1, pink, left-aligned) · `.hudSep` (vertical center divider) · `.hudPanel` (CPU, green, right-aligned). Both panels `flex: 1`, separator is a 1 px vertical line.

**Player labels** (`PLAYER` / `CPU`): very dim (`opacity ≈ 0.40`), widest available letter-spacing, small font — stencil-print aesthetic, not active UI text.

**Bullet pips:** Solid filled squares when loaded (with neon `filter: drop-shadow` glow in the player's colour). Hollow outlined squares when spent (`opacity ≈ 0.15`). Horizontally arranged. P2 pips right-to-left so the "barrel" end aligns with the separator.

**Reload bar:** The progress fill pulses with a breathing neon glow (`@keyframes` — ease-in-out oscillation between a tight and wide `box-shadow`). The trough behind the fill is near-invisible (`rgba` of the fill colour at ~8% opacity). A blinking `RELOAD` label next to the bar.

**Two-player asymmetry must be immediately legible at a glance.** Pink on the left, green on the right. The separator makes clear it is one unified panel, not two independent widgets.

---

## Hard constraints

- **No decoration on `.canvasWrap` or `.canvas`** — these must remain visually untouched (the maze borders the active area, not the DOM element).
- No CRT effects of any kind.
- No gradients between hues.
- All `@keyframes` declared locally in the CSS module (not sourced from `globals.css`).
- Hex literals (not CSS variables) inside every `@keyframes` block.
- No dead rules. Every rule must be used. Sections clearly commented.
- Portrait media query (`max-aspect-ratio: 5/4`) must be preserved exactly — do not alter the rotation geometry or the `--hud-height: 0px` override.