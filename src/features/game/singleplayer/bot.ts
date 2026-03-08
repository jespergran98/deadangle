/**
 * bot.ts — Dead Angle singleplayer
 *
 * MVP stub: the CPU tank sits at its spawn position and never moves or fires.
 *
 * `tickBot` is a pure no-op that returns the bot state unchanged and an empty
 * bullet list.  It exists so useGameLoop can call a stable API that will later
 * be replaced by the full AI (pathfinding, aim prediction, power-up usage)
 * without changing any call sites.
 */

import type { Player, Projectile, MazeLayout } from '@/types/game.types';

export interface BotTickResult {
  /** Updated bot state (identical to input for this stub). */
  bot:        Player;
  /** Any bullets the bot fired this tick (always empty for this stub). */
  newBullets: Projectile[];
}

/**
 * Advance the bot by one tick.
 *
 * Parameters are intentionally unused by the stub but form the contract
 * that the full AI implementation will fulfil:
 * @param bot     Current bot state.
 * @param _player Current player state (will drive targeting & retreat logic).
 * @param _maze   Maze layout (will drive pathfinding / line-of-sight).
 * @param _dt     Frame delta in seconds (will drive all timed behaviour).
 */
export function tickBot(
  bot: Player,
  _player: Player,
  _maze: MazeLayout,
  _dt: number,
): BotTickResult {
  return { bot, newBullets: [] };
}