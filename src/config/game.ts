import type { SymbolId } from '../engine/types';

/** Reel strip shared by all reels; each reel uses it rotated by STRIP_OFFSETS[i]. */
const BASE_STRIP: readonly SymbolId[] = [
  'cherry', 'bell', 'cherry', 'bar', 'cherry', 'bell', 'seven', 'cherry',
  'bell', 'cherry', 'bar', 'bell', 'cherry', 'bell', 'bar', 'cherry',
];

const STRIP_OFFSETS = [0, 5, 11] as const;

const rotate = <T>(items: readonly T[], by: number): T[] => items.map((_, i) => items[(i + by) % items.length]);

export const REEL_STRIPS: readonly (readonly SymbolId[])[] = STRIP_OFFSETS.map((o) => rotate(BASE_STRIP, o));
export const STRIP_LENGTH = BASE_STRIP.length;

/** Payout multipliers (x bet) for three matching symbols on the centre line. */
export const PAYTABLE: Readonly<Record<SymbolId, number>> = { seven: 150, bar: 25, bell: 9, cherry: 4 };

/** Payout for cherries on reels 1 and 2 when reel 3 is not a cherry. */
export const CHERRY_PAIR_PAYOUT = 1;

export const SYMBOL_LABEL: Readonly<Record<SymbolId, string>> = { seven: '7', bar: 'BAR', bell: 'Bell', cherry: 'Cherry' };
export const SYMBOL_IDS = Object.keys(PAYTABLE) as SymbolId[];

export const BETS = [1, 5, 10, 25] as const;
export const DEFAULT_BET_INDEX = 1;
export const STARTING_CREDITS = 1000;

/** Wins at or above this multiplier get the "big win" treatment. */
export const BIG_WIN_MULTIPLIER = 25;
