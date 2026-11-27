import './style.css';
import Phaser from 'phaser';
import { CANVAS } from './config/layout';
import { createRng } from './engine/rng';
import { Session } from './engine/session';
import { DebugState } from './game/debug';
import { SlotScene } from './game/SlotScene';
import { SoundFx } from './game/sound';
import { Hud } from './ui/hud';
import { mountMathPanel } from './ui/mathPanel';

/** `?seed=123` makes every spin reproducible, handy for demos and bug reports. */
function readSeed(): number {
  const raw = new URLSearchParams(window.location.search).get('seed');
  const seed = raw === null ? NaN : Number(raw);
  return Number.isFinite(seed) ? seed : Date.now();
}

const session = new Session();
const sound = new SoundFx();
const debug = new DebugState();

const hud = new Hud({
  onSpin: () => void scene.spin(),
  onBetChange: (delta) => scene.changeBet(delta),
  onMuteToggle: () => sound.toggleMute(),
});
const scene = new SlotScene({ session, hud, sound, debug, rng: createRng(readSeed()) });

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: CANVAS.width,
  height: CANVAS.height,
  transparent: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene,
});

mountMathPanel(document.getElementById('math-panel')!, debug);
