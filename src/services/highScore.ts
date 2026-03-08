/**
 * highScore.ts — Singleplayer local high-score persistence.
 * Reads / writes { score, level } to localStorage.
 * saveHighScore is called only by ScoreBoard at GAME OVER.
 */

const KEY = 'deadangle_highscore';

export interface HighScore {
  score: number;
  level: number;
}

/** Returns stored best, or null if none exists. */
export function getHighScore(): HighScore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HighScore;
    if (typeof parsed.score !== 'number' || typeof parsed.level !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Writes score + level only if the new score exceeds the current best.
 * Called exclusively by ScoreBoard at GAME OVER.
 */
export function saveHighScore(score: number, level: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getHighScore();
    if (current && current.score >= score) return false;
    localStorage.setItem(KEY, JSON.stringify({ score, level }));
    return true;
  } catch {
    return false;
  }
}