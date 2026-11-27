export interface HudState {
  credits: number;
  bet: number;
  busy: boolean;
  broke: boolean;
  canBetDown: boolean;
  canBetUp: boolean;
}

export interface HudHandlers {
  onSpin(): void;
  onBetChange(delta: -1 | 1): void;
  /** Returns the new muted state. */
  onMuteToggle(): boolean;
}

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id} in index.html`);
  return element as T;
}

/** Thin wrapper over the DOM controls; it holds no game logic. */
export class Hud {
  private readonly credits = byId('credits');
  private readonly bet = byId('bet');
  private readonly win = byId('win');
  private readonly spinButton = byId<HTMLButtonElement>('spin');
  private readonly betDown = byId<HTMLButtonElement>('bet-down');
  private readonly betUp = byId<HTMLButtonElement>('bet-up');

  constructor(handlers: HudHandlers) {
    const muteButton = byId<HTMLButtonElement>('mute');
    this.spinButton.addEventListener('click', () => handlers.onSpin());
    this.betDown.addEventListener('click', () => handlers.onBetChange(-1));
    this.betUp.addEventListener('click', () => handlers.onBetChange(1));
    muteButton.addEventListener('click', () => { muteButton.textContent = handlers.onMuteToggle() ? '🔇' : '🔊'; });
    window.addEventListener('keydown', (event) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      handlers.onSpin();
    });
  }

  render(state: HudState): void {
    this.credits.textContent = String(state.credits);
    this.bet.textContent = String(state.bet);
    this.spinButton.textContent = state.broke ? 'RESET' : 'SPIN';
    this.spinButton.disabled = state.busy;
    this.betDown.disabled = state.busy || !state.canBetDown;
    this.betUp.disabled = state.busy || !state.canBetUp;
  }

  showWin(amount: number): void { this.win.textContent = String(amount); }
}
