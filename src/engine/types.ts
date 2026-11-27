export type SymbolId = 'seven' | 'bar' | 'bell' | 'cherry';
/** Returns a float in [0, 1). */
export type Rng = () => number;

export interface SpinResult {
  /** Stop index per reel (the symbol on the centre line). */
  readonly stops: readonly number[];
  /** Symbols on the centre line, left to right. */
  readonly line: readonly SymbolId[];
  /** Indices of reels that take part in the win. */
  readonly winningReels: readonly number[];
  readonly multiplier: number;
  readonly win: number;
}
