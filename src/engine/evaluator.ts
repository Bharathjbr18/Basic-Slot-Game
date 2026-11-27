import { CHERRY_PAIR_PAYOUT, PAYTABLE } from '../config/game';
import type { SymbolId } from './types';

const isTriple = (line: readonly SymbolId[]): boolean => line.every((s) => s === line[0]);
const isCherryPair = (line: readonly SymbolId[]): boolean => line[0] === 'cherry' && line[1] === 'cherry';

/** Payout multiplier (x bet) for the three symbols on the centre line. */
export function payoutMultiplier(line: readonly SymbolId[]): number {
  if (isTriple(line)) return PAYTABLE[line[0]];
  return isCherryPair(line) ? CHERRY_PAIR_PAYOUT : 0;
}

/** Which reels should be highlighted for a winning line. */
export function winningReels(line: readonly SymbolId[]): number[] {
  if (isTriple(line)) return line.map((_, i) => i);
  return isCherryPair(line) ? [0, 1] : [];
}
