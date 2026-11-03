// HER GOLEM'S GROUND POUND, WHAT IT LEAVES (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Its bigger move, his pick of 23 Oct: “Ground pound (Recommended)” (offered as: its fist hammered down, a shockwave and a
// burst of steam). Its move is its own (dev/golem_moves.ts groundPound); here is what the blow does: steam hissing out of
// its stacks as it holds its fist up, straining; then as the fist comes down, the floor CRACKS open round it in a star,
// a ring of dust and its pale steam bursting out over the floor, stone flung up, a great burst of steam out of its stacks
// and its joints; whoever is near is thrown up and back (his rulebook's Hits: flashing, rocked, a scrap of robe and a
// little blood off a cultist). Its glow is the friend's cyan (its furnace heart, its eye), and the cracks show it a moment.

import { Px } from '../engine/px';
import { Light, cloud } from './warlock_fx';

/** Its steam: grey to white. */
export const STEAM = ['#4a5060', '#7a8294', '#aab4c4', '#dce4ee'];
/** The cyan of its heart, in the cracks a moment. */
export const HEART = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'];

const hash = (i: number): number => {
  const x = Math.sin(i * 41.9 + 5.3) * 43758.5453;
  return x - Math.floor(x);
};

/** Steam hissing out of a mouth at (x, y) on the picture, `k` frames since it began, `hard` how hard (0 to 1): a jet up, puffing out and thinning. */
export function hiss(st: Light, x: number, y: number, k: number, t: number, hard: number, seed: number): void {
  if (k < 0 || hard <= 0) return;
  const n = 3 + Math.round(hard * 3);
  for (let i = 0; i < n; i++) {
    // (each puff born at the mouth, rising and widening, gone in a few frames; one born every frame or so)
    const age = (k + i * (6 / n)) % 6;
    const r = (2 + age * 1.1) * (0.6 + 0.6 * hard);
    const up = age * (2.4 + 2.2 * hard);
    cloud(st, x + Math.sin(t * 7 + i + seed) * 1.5, y - up, 2 * r, 1.6 * r, t + i * 0.3, Math.min(1, 0.1 + age / 6.5), 4000 + seed + i);
  }
}
/** A BURST of steam out of a point (x, y) on the picture, `k` frames after the blow: a great puff blown out, rising, thinning away. */
export function burstSteam(st: Light, x: number, y: number, k: number, t: number, size: number, seed: number): void {
  if (k < 0 || k > 40) return;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + hash(seed + i);
    const out = (4 + 10 * hash(seed * 3 + i)) * size * (1 - Math.exp(-k / 4));
    const r = (3 + k * 0.5) * size * (0.8 + 0.4 * hash(seed * 7 + i));
    cloud(st, x + Math.cos(a) * out, y + Math.sin(a) * out * 0.6 - k * 0.6, 2 * r, 1.6 * r, t + i * 0.4, Math.min(1, k / 40), 4500 + seed + i);
  }
}
/** THE SHOCKWAVE over the floor round (x, y), `k` frames after the blow: a ring of its steam and dust racing out, flattened as the floor is. */
export function shock(st: Light, x: number, y: number, k: number, t: number, seed: number): void {
  if (k < 0 || k > 16) return;
  const R = 10 + k * 8;
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.3;
    const r = (2.2 + k * 0.35) * (0.8 + 0.4 * hash(seed * 5 + i));
    cloud(st, x + Math.cos(a) * R, y + Math.sin(a) * R * 0.5, 2 * r, 1.4 * r, t + i * 0.2, Math.min(1, 0.05 + k / 16), 5000 + seed + i);
  }
}

/** The picture of its steam and dust. */
export function laySteam(w: number, h: number, st: Light): Px {
  const out = new Px(w, h);
  st.lay(out, STEAM);
  return out;
}
