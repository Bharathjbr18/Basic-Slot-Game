import Phaser from 'phaser';
import { STRIP_LENGTH } from '../config/game';
import { CELL_HEIGHT, DEPTH, PAYLINE, REEL_WINDOW, SPIN_TIMING, SYMBOL_SIZE } from '../config/layout';
import { mod, symbolAt } from '../engine/reels';
import { tweenAsync } from './tweenAsync';

/** Rows drawn around the centre line: two spare sprites hide the wrap-around outside the mask. */
const ROW_OFFSETS = [-2, -1, 0, 1, 2] as const;
const CENTRE_SPRITE = 2;

/**
 * Visual for one reel: a window onto a looping strip. `position` is the strip
 * index shown on the centre line as a float, so tweening it scrolls the reel.
 */
export class ReelView {
  position = Phaser.Math.Between(0, STRIP_LENGTH - 1);

  private readonly sprites: Phaser.GameObjects.Image[];
  private readonly symbolScale: number;

  constructor(private readonly scene: Phaser.Scene, private readonly index: number) {
    const x = REEL_WINDOW.centersX[index];
    const container = scene.add.container(x, 0).setDepth(DEPTH.reels);

    const maskShape = scene.make.graphics({}, false);
    maskShape.fillRect(x - REEL_WINDOW.width / 2, REEL_WINDOW.top, REEL_WINDOW.width, REEL_WINDOW.height);
    container.setMask(maskShape.createGeometryMask());

    this.symbolScale = SYMBOL_SIZE / scene.textures.get('seven').getSourceImage().width;
    this.sprites = ROW_OFFSETS.map(() => {
      const sprite = scene.add.image(0, 0, 'cherry').setScale(this.symbolScale);
      container.add(sprite);
      return sprite;
    });
  }

  /** Syncs sprites with `position`; called every frame. */
  render(): void {
    const base = Math.floor(this.position);
    const fraction = this.position - base;
    this.sprites.forEach((sprite, i) => {
      const row = ROW_OFFSETS[i];
      sprite.setTexture(symbolAt(this.index, base - row));
      sprite.y = PAYLINE.y + (row + fraction) * CELL_HEIGHT;
    });
  }

  /** Winds up, spins past a few loops, brakes with a small overshoot and settles on `stop`. */
  async spinTo(stop: number): Promise<void> {
    const t = SPIN_TIMING;
    const start = Math.round(this.position);
    const final = start + mod(stop - start, STRIP_LENGTH) + (t.minLoops + this.index) * STRIP_LENGTH;

    await tweenAsync(this.scene, { targets: this, position: start - t.windUpDistance, duration: t.windUpMs, ease: 'Sine.easeOut' });
    await tweenAsync(this.scene, { targets: this, position: final + t.overshoot, duration: t.spinBaseMs + this.index * t.staggerMs, ease: 'Cubic.easeOut' });
    await tweenAsync(this.scene, { targets: this, position: final, duration: t.settleMs, ease: 'Sine.easeInOut' });
    this.position = mod(final, STRIP_LENGTH);
  }

  /** Brief scale pulse on the centre-line symbol. */
  pulse(): Promise<void> {
    return tweenAsync(this.scene, { targets: this.sprites[CENTRE_SPRITE], scale: this.symbolScale * 1.22, duration: 170, yoyo: true, repeat: 5 });
  }
}
