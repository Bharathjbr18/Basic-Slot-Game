import { describe, expect, it } from 'vitest';
import { BETS, PAYTABLE, REEL_STRIPS, STARTING_CREDITS } from '../config/game';
import { payoutMultiplier, winningReels } from './evaluator';
import { createRng } from './rng';
import { mod, symbolAt } from './reels';
import { Session } from './session';
import { resolveSpin } from './slotEngine';
import { exactStats, simulate } from './stats';
import type { SymbolId } from './types';

describe('rng', () => {
  it('is deterministic for a seed and stays in [0, 1)', () => {
    const a = createRng(42), b = createRng(42);
    for (let i = 0; i < 100; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('reels', () => {
  it('wraps indices in both directions', () => {
    expect(mod(-1, 16)).toBe(15);
    expect(symbolAt(0, -1)).toBe(symbolAt(0, 15));
    expect(symbolAt(1, 16)).toBe(symbolAt(1, 0));
  });
});

describe('evaluator', () => {
  it.each(Object.entries(PAYTABLE))('pays three %s', (symbol, pay) => {
    const line = [symbol, symbol, symbol] as SymbolId[];
    expect(payoutMultiplier(line)).toBe(pay);
    expect(winningReels(line)).toEqual([0, 1, 2]);
  });

  it('pays two leading cherries only', () => {
    expect(payoutMultiplier(['cherry', 'cherry', 'bell'])).toBe(1);
    expect(winningReels(['cherry', 'cherry', 'bell'])).toEqual([0, 1]);
    expect(payoutMultiplier(['bell', 'cherry', 'cherry'])).toBe(0);
    expect(payoutMultiplier(['bar', 'bell', 'seven'])).toBe(0);
  });
});

describe('resolveSpin', () => {
  it('is reproducible and consistent with the reel strips', () => {
    const first = resolveSpin(5, createRng(7));
    expect(resolveSpin(5, createRng(7))).toEqual(first);
    first.stops.forEach((stop, reel) => expect(first.line[reel]).toBe(REEL_STRIPS[reel][stop]));
    expect(first.win).toBe(first.multiplier * 5);
  });

  it('forces a triple for debugging', () => {
    const result = resolveSpin(10, createRng(1), 'seven');
    expect(result.line).toEqual(['seven', 'seven', 'seven']);
    expect(result.win).toBe(PAYTABLE.seven * 10);
  });
});

describe('stats', () => {
  it('has the documented exact RTP and hit frequency', () => {
    const { rtp, hitFrequency, combinations } = exactStats();
    expect(combinations).toBe(4096);
    expect(rtp).toBeCloseTo(3763 / 4096, 10);
    expect(hitFrequency).toBeCloseTo(937 / 4096, 10);
  });

  it('simulation converges on the exact RTP', () => {
    expect(Math.abs(simulate(300_000, 2024).rtp - exactStats().rtp)).toBeLessThan(0.05);
  });
});

describe('Session', () => {
  it('charges, awards and refuses unaffordable spins', () => {
    const session = new Session(10);
    session.charge();
    expect(session.credits).toBe(5);
    session.award(20);
    expect(session.credits).toBe(25);
    expect(() => new Session(0).charge()).toThrow();
  });

  it('keeps the bet within credits and bet limits', () => {
    const session = new Session(3);
    expect(session.bet).toBe(1);
    expect(session.canBetUp).toBe(false);
    session.changeBet(-1);
    expect(session.bet).toBe(BETS[0]);
    session.reset();
    expect(session.credits).toBe(STARTING_CREDITS);
  });
});
