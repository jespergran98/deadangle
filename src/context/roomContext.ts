import { createContext, useContext } from 'react';

export type GameMode   = 'singleplayer' | 'multiplayer';
export type PlayerSlot = 'Player1' | 'Player2';

export interface RoomState {
  mode:       GameMode   | null;
  roomCode:   string     | null;
  sessionId:  string     | null;
  playerSlot: PlayerSlot | null;
  setRoom: (state: Omit<RoomState, 'setRoom'>) => void;
}

export const RoomContext = createContext<RoomState>({
  mode:       null,
  roomCode:   null,
  sessionId:  null,
  playerSlot: null,
  setRoom:    () => {},
});

export function useRoom(): RoomState {
  return useContext(RoomContext);
}