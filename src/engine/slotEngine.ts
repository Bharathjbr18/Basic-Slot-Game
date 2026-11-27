import { REEL_STRIPS } from '../config/game';
import { payoutMultiplier, winningReels } from './evaluator';
import { stopsForTriple } from './reels';
import type { Rng, SpinResult, SymbolId } from './types';

/**
 * Resolves a complete spin before any animation runs. The presentation layer
 * only plays the result back, the same split regulated slot games use.
 * `forced` is a debug hook that lands a triple of the given symbol.
 */

export function resolveSpin(bet: number, rng: Rng, forced?: SymbolId | null): SpinResult {
  const stops = forced ? stopsForTriple(forced) : REEL_STRIPS.map((strip) => Math.floor(rng() * strip.length));
  const line = stops.map((stop, reel) => REEL_STRIPS[reel][stop]);
  const multiplier = payoutMultiplier(line);
  return { stops, line, winningReels: winningReels(line), multiplier, win: multiplier * bet };
}
