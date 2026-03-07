'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, joinRoom } from '@/services/api';
import { useRoom } from '@/context/RoomContext';

export type StartMode = 'singleplayer' | 'multiplayer';
export type MultiplayerSubMode = 'host' | 'join';

export interface StartFlowState {
  mode: StartMode;
  subMode: MultiplayerSubMode;
  roomCode: string;
  loading: boolean;
  error: string | null;
  selectMode: (m: StartMode) => void;
  selectSubMode: (s: MultiplayerSubMode) => void;
  setRoomCode: (v: string) => void;
  handleSingleplayer: () => void;
  handleHost: () => Promise<void>;
  handleJoin: () => Promise<void>;
}

export function useStartFlow(): StartFlowState {
  const router = useRouter();
  const { setRoom } = useRoom();

  const [mode, setMode] = useState<StartMode>('singleplayer');
  const [subMode, setSubMode] = useState<MultiplayerSubMode>('join');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const selectMode = useCallback((m: StartMode) => {
    setMode(m);
    clearError();
  }, []);

  const selectSubMode = useCallback((s: MultiplayerSubMode) => {
    setSubMode(s);
    clearError();
  }, []);

  const handleRoomCodeChange = useCallback((v: string) => {
    setRoomCode(v.toUpperCase());
    clearError();
  }, []);

  const handleSingleplayer = useCallback(() => {
    setRoom({ mode: 'singleplayer', roomCode: null, sessionId: null, playerSlot: null });
    router.push('/game');
  }, [router, setRoom]);

  const handleHost = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      const data = await createRoom();
      setRoom({
        mode: 'multiplayer',
        roomCode: data.roomCode,
        sessionId: data.sessionId,
        playerSlot: data.playerSlot,
      });
      router.push('/lobby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'FAILED TO CREATE ROOM');
    } finally {
      setLoading(false);
    }
  }, [router, setRoom]);

  const handleJoin = useCallback(async () => {
    const trimmed = roomCode.trim();
    if (!trimmed) {
      setError('ENTER A ROOM CODE');
      return;
    }
    setLoading(true);
    clearError();
    try {
      const data = await joinRoom(trimmed);
      setRoom({
        mode: 'multiplayer',
        roomCode: trimmed,
        sessionId: data.sessionId,
        playerSlot: data.playerSlot,
      });
      router.push('/lobby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ROOM NOT FOUND');
    } finally {
      setLoading(false);
    }
  }, [roomCode, router, setRoom]);

  return {
    mode,
    subMode,
    roomCode,
    loading,
    error,
    selectMode,
    selectSubMode,
    setRoomCode: handleRoomCodeChange,
    handleSingleplayer,
    handleHost,
    handleJoin,
  };
}