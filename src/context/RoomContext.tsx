'use client';

/**
 * RoomContext.tsx — Dead Angle
 *
 * Tracks which game room the local player is currently in.
 * Mount RoomProvider once above all routes (e.g. in layout.tsx).
 * Read via useRoom() anywhere in the tree.
 */

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type GameMode   = 'singleplayer' | 'multiplayer';
export type PlayerSlot = 'Player1' | 'Player2';

/** Immutable snapshot of room membership. */
export interface RoomState {
  mode:       GameMode   | null;
  roomCode:   string     | null;
  sessionId:  string     | null;
  playerSlot: PlayerSlot | null;
  /** Replace the entire room snapshot in one call. */
  setRoom: (state: Omit<RoomState, 'setRoom'>) => void;
}

const defaultRoomState: Omit<RoomState, 'setRoom'> = {
  mode:       null,
  roomCode:   null,
  sessionId:  null,
  playerSlot: null,
};

export const RoomContext = createContext<RoomState>({
  ...defaultRoomState,
  setRoom: () => {},
});

/** Read the current room state from anywhere in the tree. */
export function useRoom(): RoomState {
  return useContext(RoomContext);
}

/* ── RoomProvider ─────────────────────────────────────────────
   Wraps the application (or subtree) to provide persistent room
   state across client-side navigation.
   Mount once above all routes.
   ─────────────────────────────────────────────────────────── */
export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomData, setRoomData] =
    useState<Omit<RoomState, 'setRoom'>>(defaultRoomState);

  return (
    <RoomContext.Provider value={{ ...roomData, setRoom: setRoomData }}>
      {children}
    </RoomContext.Provider>
  );
}