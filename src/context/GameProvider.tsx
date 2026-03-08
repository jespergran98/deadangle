'use client';

import { useState, type ReactNode } from 'react';
import { GameContext, INITIAL_GAME_STATE } from './GameContext';
import { SingleplayerContext, INITIAL_SP_STATE } from './SingleplayerContext';
import type { GameState } from '@/types/game.types';
import type { SingleplayerState } from './SingleplayerContext';

interface GameProviderProps {
  children: ReactNode;
}

export default function GameProvider({ children }: GameProviderProps) {
  const [gameState, setGameStateRaw] = useState<GameState>(INITIAL_GAME_STATE);
  const [spState,   setSpStateRaw]   = useState<SingleplayerState>(INITIAL_SP_STATE);

  function setGameState(updater: (prev: GameState) => GameState) {
    setGameStateRaw(updater);
  }
  function setSpState(updater: (prev: SingleplayerState) => SingleplayerState) {
    setSpStateRaw(updater);
  }

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      <SingleplayerContext.Provider value={{ spState, setSpState }}>
        {children}
      </SingleplayerContext.Provider>
    </GameContext.Provider>
  );
}