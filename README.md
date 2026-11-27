# Jackpot Slots

A 3-reel slot game built with **Phaser 3 + TypeScript + Vite**. Virtual credits only.

The goal of this project is a clean separation between **game math** and **presentation**, with the math testable on its own.

## Run it

```bash
npm install
npm run dev        # play at http://localhost:5173
npm test           # unit tests (Vitest)
npm run simulate   # RTP simulation in Node: npm run simulate -- 5000000 42
npm run build      # typecheck + production bundle
```

Add `?seed=123` to the URL for reproducible spins.

## Architecture

```
src/
  config/    game.ts (strips, paytable, bets)  layout.ts (pixel geometry, timings, asset list)
  engine/    Pure TypeScript, no Phaser or DOM: rng, reels, evaluator, slotEngine, session, stats
  game/      Phaser layer: SlotScene (orchestration), ReelView, sound, debug hook
  ui/        DOM layer: hud (controls), mathPanel (paytable, RTP, simulator, debug tools)
tools/       simulate.ts, the same engine run from Node
```

Dependencies point one way: `ui` and `game` depend on `engine` and `config`; `engine` depends on nothing visual.

### Key decisions

- **Outcome first, animation second.** `resolveSpin()` decides stops, win and payout up front. The scene only plays the result back, as regulated slot games do.
- **Seedable RNG (Mulberry32)** makes spins reproducible in tests, bug reports and demos.
- **Config-driven.** Changing a strip, payout or bet touches `src/config/game.ts` only. The exact RTP is recomputed by enumerating every stop combination, so the math can never drift from the config.
- **Async animation flow.** Phaser tweens are wrapped in promises, so a spin reads top to bottom: lever, reels, celebration.
- **Thin UI layer.** `Hud` only reads and writes the DOM; `Session` owns wallet and bet rules.

## Math

| Combination (centre line) | Pays |
|---|---|
| 3 × 7 | 150× |
| 3 × BAR | 25× |
| 3 × Bell | 9× |
| 3 × Cherry | 4× |
| Cherry, Cherry, anything else | 1× |

16-stop reels, 4,096 combinations: **RTP 91.87%**, hit frequency **22.9%**. A 1M-spin simulation lands within about 0.3 percentage points of the exact value, and the tests check this.

## Reviewer tools

Open **Under the hood** below the game to see the paytable, the reel strips, the exact RTP and a 1,000,000-spin simulator. Tick **Debug mode** to force a triple on the next spin, so a big win takes seconds to see.

## Possible next steps

Wilds and a free-spins bonus, multiple paylines, anticipation effect when two 7s land, and a C# port of `engine/` for Unity.
