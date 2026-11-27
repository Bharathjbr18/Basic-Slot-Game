import { REEL_STRIPS } from '../config/game';
import type { SymbolId } from './types';

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

/** Symbol on a reel at any (possibly negative or out-of-range) strip index. */
export function symbolAt(reel: number, index: number): SymbolId {
  const strip = REEL_STRIPS[reel];
  return strip[mod(index, strip.length)];
}

/** Stop index of the first occurrence of `symbol` on each reel. */
export function stopsForTriple(symbol: SymbolId): number[] {
  return REEL_STRIPS.map((strip, reel) => {
    const stop = strip.indexOf(symbol);
    if (stop < 0) throw new Error(`Reel ${reel} has no ${symbol}`);
    return stop;
  });
}
