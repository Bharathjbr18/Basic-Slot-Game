/** Pixel geometry of the machine artwork (816x624 source images). */
export const CANVAS = { width: 816, height: 624 } as const;
export const REEL_WINDOW = { centersX: [283, 413, 543], top: 246, width: 108, height: 210 } as const;
export const PAYLINE = { y: 351, x1: 229, x2: 597 } as const;
export const CELL_HEIGHT = 70;
export const SYMBOL_SIZE = 64;
export const WIN_TEXT_POSITION = { x: 417, y: 600 } as const;
export const LEVER_HIT_AREA = { x: 719, y: 430, width: 110, height: 300 } as const;

export const DEPTH = { background: 0, reels: 1, frame: 2, effects: 3, lever: 4, text: 5, particles: 6 } as const;

export const SPIN_TIMING = {
  windUpMs: 140,
  windUpDistance: 0.25,
  spinBaseMs: 900,
  staggerMs: 450,
  minLoops: 2,
  overshoot: 0.2,
  settleMs: 150,
  leverMs: 220,
} as const;

export const ASSET_FILES = {
  background: 'reel-background.png',
  frame: 'machine-frame.png',
  leverUp: 'lever-up.png',
  leverDown: 'lever-down.png',
  seven: 'symbol-seven.png',
  cherry: 'symbol-cherry.png',
  bell: 'symbol-bell.png',
  bar: 'symbol-bar.png',
} as const;
