import type { SymbolId } from '../engine/types';

/** Lets reviewers force the next spin to land a triple, without touching engine internals. */
export class DebugState {
  private forced: SymbolId | null = null;

  force(symbol: SymbolId | null): void { this.forced = symbol; }

  /** Returns the forced symbol (if any) and clears it so it applies to one spin only. */
  take(): SymbolId | null {
    const symbol = this.forced;
    this.forced = null;
    return symbol;
  }
}
