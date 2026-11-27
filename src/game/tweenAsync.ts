import type Phaser from 'phaser';

/** Promise wrapper around a Phaser tween so animation flows read top to bottom with async/await. */
export function tweenAsync(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  return new Promise((resolve) => {
    scene.tweens.add({ ...config, onComplete: () => resolve() });
  });
}
