import Phaser from 'phaser';
import { BIG_WIN_MULTIPLIER } from '../config/game';
import { ASSET_FILES, DEPTH, LEVER_HIT_AREA, PAYLINE, REEL_WINDOW, SPIN_TIMING, WIN_TEXT_POSITION } from '../config/layout';
import type { Session } from '../engine/session';
import { resolveSpin } from '../engine/slotEngine';
import type { Rng, SpinResult } from '../engine/types';
import type { Hud } from '../ui/hud';
import type { DebugState } from './debug';
import { ReelView } from './ReelView';
import type { SoundFx } from './sound';
import { tweenAsync } from './tweenAsync';

export interface SlotSceneDeps {
  session: Session;
  hud: Hud;
  sound: SoundFx;
  debug: DebugState;
  rng: Rng;
}

/** Orchestrates one spin: engine result first, then lever, reels and win presentation. */
export class SlotScene extends Phaser.Scene {
  private reels: ReelView[] = [];
  private paylineFx!: Phaser.GameObjects.Graphics;
  private winText!: Phaser.GameObjects.Text;
  private leverUp!: Phaser.GameObjects.Image;
  private leverDown!: Phaser.GameObjects.Image;
  private busy = false;

  constructor(private readonly deps: SlotSceneDeps) {
    super('slot');
  }

  preload(): void {
    for (const [key, file] of Object.entries(ASSET_FILES)) {
      this.load.image(key, `${import.meta.env.BASE_URL}assets/${file}`);
    }
  }

  create(): void {
    this.add.image(0, 0, 'background').setOrigin(0).setDepth(DEPTH.background);
    this.reels = REEL_WINDOW.centersX.map((_, index) => new ReelView(this, index));
    this.add.image(0, 0, 'frame').setOrigin(0).setDepth(DEPTH.frame);

    this.paylineFx = this.add.graphics().setDepth(DEPTH.effects);
    this.winText = this.add
      .text(WIN_TEXT_POSITION.x, WIN_TEXT_POSITION.y, '', {
        fontFamily: 'system-ui, sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#ffb347', stroke: '#1a1038', strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.text);

    this.leverUp = this.add.image(0, 0, 'leverUp').setOrigin(0).setDepth(DEPTH.lever);
    this.leverDown = this.add.image(0, 0, 'leverDown').setOrigin(0).setDepth(DEPTH.lever).setVisible(false);
    this.add
      .zone(LEVER_HIT_AREA.x, LEVER_HIT_AREA.y, LEVER_HIT_AREA.width, LEVER_HIT_AREA.height)
      .setDepth(DEPTH.particles)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => void this.spin());

    this.refreshHud();
  }

  update(): void {
    this.reels.forEach((reel) => reel.render());
  }

  changeBet(delta: -1 | 1): void {
    if (this.busy) return;
    this.deps.session.changeBet(delta);
    this.refreshHud();
  }

  async spin(): Promise<void> {
    const { session, sound, debug, rng } = this.deps;
    if (this.busy || this.reels.length === 0) return;

    if (session.isBroke) {
      session.reset();
      this.refreshHud();
      return;
    }

    this.busy = true;
    session.charge();
    this.clearPresentation();
    this.refreshHud();

    const result = resolveSpin(session.bet, rng, debug.take());
    sound.spinStart();
    await Promise.all([this.pullLever(), this.runReels(result)]);
    if (result.win > 0) await this.celebrate(result);

    this.busy = false;
    this.refreshHud();
  }

  private refreshHud(): void {
    const { session, hud } = this.deps;
    hud.render({
      credits: session.credits,
      bet: session.bet,
      busy: this.busy,
      broke: session.isBroke,
      canBetDown: session.canBetDown,
      canBetUp: session.canBetUp,
    });
  }

  private clearPresentation(): void {
    this.paylineFx.clear().setAlpha(1);
    this.winText.setText('');
    this.deps.hud.showWin(0);
  }

  private async pullLever(): Promise<void> {
    this.leverUp.setVisible(false);
    this.leverDown.setVisible(true);
    await new Promise<void>((resolve) => this.time.delayedCall(SPIN_TIMING.leverMs, resolve));
    this.leverUp.setVisible(true);
    this.leverDown.setVisible(false);
  }

  private runReels(result: SpinResult): Promise<unknown> {
    return Promise.all(
      this.reels.map(async (reel, i) => {
        await reel.spinTo(result.stops[i]);
        this.deps.sound.reelStop(i);
      }),
    );
  }

  private async celebrate(result: SpinResult): Promise<void> {
    const { session, hud, sound } = this.deps;
    const isBig = result.multiplier >= BIG_WIN_MULTIPLIER;

    this.paylineFx.lineStyle(4, 0xff5a36, 1).lineBetween(PAYLINE.x1, PAYLINE.y, PAYLINE.x2, PAYLINE.y);
    this.winText.setText(`WIN ${result.win}`);
    sound.win(isBig);
    if (isBig) this.cameras.main.shake(450, 0.01);
    this.burstCoins(isBig ? 40 : 14);

    const counter = { value: 0 };
    await Promise.all([
      tweenAsync(this, { targets: this.paylineFx, alpha: 0.2, duration: 200, yoyo: true, repeat: 5 }),
      ...result.winningReels.map((reel) => this.reels[reel].pulse()),
      tweenAsync(this, {
        targets: counter,
        value: result.win,
        duration: Math.min(1800, 500 + result.win * 8),
        onUpdate: () => hud.showWin(Math.floor(counter.value)),
      }),
    ]);

    hud.showWin(result.win);
    session.award(result.win);
  }

  private burstCoins(count: number): void {
    for (let i = 0; i < count; i++) {
      const coin = this.add.circle(WIN_TEXT_POSITION.x, PAYLINE.y, 5, 0xffc233).setDepth(DEPTH.particles);
      this.tweens.add({
        targets: coin,
        x: WIN_TEXT_POSITION.x + Phaser.Math.Between(-300, 300),
        y: PAYLINE.y + Phaser.Math.Between(-260, 160),
        alpha: 0,
        duration: 900,
        onComplete: () => coin.destroy(),
      });
    }
  }
}
