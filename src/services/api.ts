/**
 * api.ts
 * HTTP client for Dead Angle room management.
 * Called once during the start flow — before SignalR opens.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export interface CreateRoomResponse {
  sessionId:  string;
  playerSlot: 'Player1';
  roomCode:   string;
}

export interface JoinRoomResponse {
  sessionId:  string;
  playerSlot: 'Player2';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.message === 'string') message = body.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

/** POST /rooms — create a new room. */
export function createRoom(): Promise<CreateRoomResponse> {
  return request<CreateRoomResponse>('/rooms', { method: 'POST' });
}

/** POST /rooms/{code}/join — join an existing room. */
export function joinRoom(code: string): Promise<JoinRoomResponse> {
  return request<JoinRoomResponse>(
    `/rooms/${encodeURIComponent(code)}/join`,
    { method: 'POST' }
  );
}