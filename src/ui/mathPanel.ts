import { CHERRY_PAIR_PAYOUT, PAYTABLE, REEL_STRIPS, SYMBOL_IDS, SYMBOL_LABEL } from '../config/game';
import { exactStats, simulate } from '../engine/stats';
import type { DebugState } from '../game/debug';
import type { SymbolId } from '../engine/types';

const SIMULATION = { spins: 1_000_000, seed: 12345 } as const;
const percent = (value: number, digits = 2): string => `${(value * 100).toFixed(digits)}%`;

const paytableRows = (): string =>
  [
    ...SYMBOL_IDS.map((id) => `<tr><td>3 × ${SYMBOL_LABEL[id]}</td><td>${PAYTABLE[id]}× bet</td></tr>`),
    `<tr><td>2 × Cherry (reels 1–2)</td><td>${CHERRY_PAIR_PAYOUT}× bet</td></tr>`,
  ].join('');

const stripRows = (): string =>
  REEL_STRIPS.map((strip, i) => `<p><b>Reel ${i + 1}</b><br><code>${strip.map((id) => SYMBOL_LABEL[id]).join(' · ')}</code></p>`).join('');

/** Renders the paytable, reel strips, exact RTP, the 1M-spin simulator and the debug controls. */
export function mountMathPanel(root: HTMLElement, debug: DebugState): void {
  const exact = exactStats();
  root.innerHTML = `
    <p class="muted">Each spin is resolved by a pure engine first (seeded RNG, reel stops, win evaluation). Phaser only plays the result back.</p>
    <div class="scroll"><table><tr><th>Combination (centre line)</th><th>Pays</th></tr>${paytableRows()}</table></div>
    <p class="muted">Reel strips (${REEL_STRIPS[0].length} stops each)</p>
    ${stripRows()}
    <p>Exact RTP over all ${exact.combinations} stop combinations: <b>${percent(exact.rtp)}</b> · hit frequency <b>${percent(exact.hitFrequency, 1)}</b></p>
    <button data-action="simulate">Simulate ${SIMULATION.spins.toLocaleString()} spins</button>
    <p class="muted" data-role="simulation"></p>
    <label><input type="checkbox" data-action="debug" /> Debug mode (force outcomes)</label>
    <div class="debug" data-role="debug" hidden>
      ${SYMBOL_IDS.map((id) => `<button data-force="${id}">Force ${SYMBOL_LABEL[id]}</button>`).join('')}
      <span class="muted" data-role="debug-message"></span>
    </div>`;

  const query = <T extends HTMLElement>(selector: string): T => root.querySelector<T>(selector)!;
  const simulationOutput = query('[data-role="simulation"]');
  const debugPanel = query('[data-role="debug"]');
  const debugMessage = query('[data-role="debug-message"]');

  query('[data-action="simulate"]').addEventListener('click', () => {
    const started = performance.now();
    const { rtp, hitFrequency } = simulate(SIMULATION.spins, SIMULATION.seed);
    const elapsed = Math.round(performance.now() - started);
    simulationOutput.textContent = `${SIMULATION.spins.toLocaleString()} spins (seed ${SIMULATION.seed}) in ${elapsed} ms → RTP ${percent(rtp)}, hit rate ${percent(hitFrequency, 1)}`;
  });

  query<HTMLInputElement>('[data-action="debug"]').addEventListener('change', (event) => {
    debugPanel.hidden = !(event.target as HTMLInputElement).checked;
    if (debugPanel.hidden) debug.force(null);
  });

  debugPanel.addEventListener('click', (event) => {
    const symbol = (event.target as HTMLElement).dataset.force as SymbolId | undefined;
    if (!symbol) return;
    debug.force(symbol);
    debugMessage.textContent = `Next spin: triple ${SYMBOL_LABEL[symbol]}`;
  });
}
