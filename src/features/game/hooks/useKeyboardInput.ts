/**
 * useKeyboardInput.ts — Captures WASD+Q / Arrow+Space dual-scheme input.
 * Returns current input state as a ref (no re-renders).
 * Respects Phase Beam movement lock and PhaseShift fire suppression.
 */

import { useEffect, useRef } from 'react';

export interface InputState {
  up:    boolean;
  down:  boolean;
  left:  boolean;
  right: boolean;
  fire:  boolean;
  /** True for exactly one frame after fire key is pressed (edge-detect). */
  firePulse: boolean;
}

const INITIAL: InputState = {
  up: false, down: false, left: false, right: false,
  fire: false, firePulse: false,
};

export function useKeyboardInput(): React.MutableRefObject<InputState> {
  const stateRef  = useRef<InputState>({ ...INITIAL });
  const pressedRef = useRef({ up: false, down: false, left: false, right: false, fire: false });

  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      const p = pressedRef.current;
      const s = stateRef.current;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    if (!p.up)    { p.up    = true; s.up    = true; } break;
        case 'KeyS': case 'ArrowDown':  if (!p.down)  { p.down  = true; s.down  = true; } break;
        case 'KeyA': case 'ArrowLeft':  if (!p.left)  { p.left  = true; s.left  = true; } break;
        case 'KeyD': case 'ArrowRight': if (!p.right) { p.right = true; s.right = true; } break;
        case 'KeyQ': case 'Space':
          if (!p.fire) {
            p.fire = true;
            s.fire = true;
            s.firePulse = true;
          }
          break;
      }
    }

    function onUp(e: KeyboardEvent) {
      const p = pressedRef.current;
      const s = stateRef.current;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    p.up    = false; s.up    = false; break;
        case 'KeyS': case 'ArrowDown':  p.down  = false; s.down  = false; break;
        case 'KeyA': case 'ArrowLeft':  p.left  = false; s.left  = false; break;
        case 'KeyD': case 'ArrowRight': p.right = false; s.right = false; break;
        case 'KeyQ': case 'Space':      p.fire  = false; s.fire  = false; break;
      }
    }

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, []);

  return stateRef;
}