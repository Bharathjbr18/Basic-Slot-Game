import { REEL_STRIPS } from '../config/game';
import { payoutMultiplier } from './evaluator';
import { createRng } from './rng';
import { resolveSpin } from './slotEngine';

export interface Stats { rtp: number; hitFrequency: number; }
export interface ExactStats extends Stats { combinations: number; }

/** Exact RTP and hit frequency by enumerating every stop combination. */
export function exactStats(): ExactStats {
  const [a, b, c] = REEL_STRIPS;
  let totalPayout = 0;
  let hits = 0;
  for (const x of a) for (const y of b) for (const z of c) {
    const multiplier = payoutMultiplier([x, y, z]);
    totalPayout += multiplier;
    if (multiplier > 0) hits++;
  }
  const combinations = a.length * b.length * c.length;
  return { combinations, rtp: totalPayout / combinations, hitFrequency: hits / combinations };
}

/** Monte-Carlo estimate with a flat 1-credit bet; used to cross-check exactStats(). */
export function simulate(spins: number, seed: number): Stats {
  const rng = createRng(seed);
  let totalWin = 0;
  let hits = 0;
  for (let i = 0; i < spins; i++) {
    const { win } = resolveSpin(1, rng);
    totalWin += win;
    if (win > 0) hits++;
  }
  return { rtp: totalWin / spins, hitFrequency: hits / spins };
}
