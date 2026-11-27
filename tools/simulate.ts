import { exactStats, simulate } from '../src/engine/stats';

const spins = Number(process.argv[2] ?? 1_000_000);
const seed = Number(process.argv[3] ?? 12345);

const exact = exactStats();
const started = performance.now();
const estimate = simulate(spins, seed);
const elapsed = Math.round(performance.now() - started);
const pct = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`;

console.log(`Exact     RTP ${pct(exact.rtp)}  hit rate ${pct(exact.hitFrequency, 1)}  (${exact.combinations} combinations)`);
console.log(`Simulated RTP ${pct(estimate.rtp)}  hit rate ${pct(estimate.hitFrequency, 1)}  (${spins.toLocaleString()} spins, seed ${seed}, ${elapsed} ms)`);
