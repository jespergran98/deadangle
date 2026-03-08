'use client';

/**
 * useKeyboardInput.ts — Dead Angle
 *
 * Tracks live keyboard state for both control schemes simultaneously:
 *   WASD + Q          — scheme 1  (left-hand layout)
 *   Arrow keys + Space — scheme 2  (right-hand / one-hand layout)
 *
 * Returns a stable ref — reading it never causes React re-renders.
 * The ref value is mutated directly in keydown/keyup handlers for
 * zero-latency reads inside the requestAnimationFrame loop.
 *
 * Movement suppression:
 *   When `movementLocked` is true the movement axes (forward/back/left/right)
 *   are forced to false on every keydown event, even if the physical key is
 *   held.  `fire` is unaffected.  This supports the Phase Beam power-up which
 *   freezes the player's movement while still allowing them to fire.
 */

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

export interface InputState {
  forward: boolean;
  back:    boolean;
  left:    boolean;
  right:   boolean;
  fire:    boolean;
}

function emptyInput(): InputState {
  return { forward: false, back: false, left: false, right: false, fire: false };
}

/**
 * @param movementLocked  When true, movement axes are suppressed.
 *                        The ref identity is stable; pass a reactive value
 *                        and it will take effect on the next keydown event.
 * @returns  A stable ref whose `.current` value is the live input snapshot.
 */
export function useKeyboardInput(
  movementLocked = false,
): MutableRefObject<InputState> {
  const inputRef  = useRef<InputState>(emptyInput());
  const lockedRef = useRef(movementLocked);

  // Keep lockedRef in sync with the latest prop value without reattaching
  // the DOM event listeners on every render.
  useEffect(() => {
    lockedRef.current = movementLocked;
  }, [movementLocked]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const inp    = inputRef.current;
      const locked = lockedRef.current;

      switch (e.code) {
        case 'KeyW':      case 'ArrowUp':    if (!locked) inp.forward = true; break;
        case 'KeyS':      case 'ArrowDown':  if (!locked) inp.back    = true; break;
        case 'KeyA':      case 'ArrowLeft':  if (!locked) inp.left    = true; break;
        case 'KeyD':      case 'ArrowRight': if (!locked) inp.right   = true; break;
        case 'KeyQ':      case 'Space':      inp.fire = true;                 break;
      }

      // Prevent default browser scroll / page navigation while playing.
      if (
        e.code === 'ArrowUp'   || e.code === 'ArrowDown'  ||
        e.code === 'ArrowLeft' || e.code === 'ArrowRight' ||
        e.code === 'Space'
      ) {
        e.preventDefault();
      }
    }

    function handleKeyUp(e: KeyboardEvent): void {
      const inp = inputRef.current;
      switch (e.code) {
        case 'KeyW':  case 'ArrowUp':    inp.forward = false; break;
        case 'KeyS':  case 'ArrowDown':  inp.back    = false; break;
        case 'KeyA':  case 'ArrowLeft':  inp.left    = false; break;
        case 'KeyD':  case 'ArrowRight': inp.right   = false; break;
        case 'KeyQ':  case 'Space':      inp.fire    = false; break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup',   handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup',   handleKeyUp);
      // Clear all inputs on unmount so no key stays logically held.
      inputRef.current = emptyInput();
    };
  }, []); // Handlers only mount/unmount once; lockedRef is read by reference.

  return inputRef;
}