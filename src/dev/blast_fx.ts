// HER SWIPE: THE BLAST JUMP, WHAT IT LEAVES (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Her pick of her swipe, 27 Oct: “Blast jump (Recommended)”. Her move is hers (dev/tinkerer_moves.ts blastJump); here is
// the bang: her bomb set down at her feet, its fuse spitting cyan sparks; then it GOES OFF under her (the strike, a flash):
// a white-hot flash and a ball of her cyan fire boiling up, a ring of it racing out over the floor, stone chips flung,
// a great column of black smoke rolling up, and a scorch left on the floor, its cracks glowing and cooling; whoever stands
// by is blown away (flashing, thrown, a scrap of robe and a little blood off it, his rulebook's Hits) and left fizzing with
// her brew. She rides it: a trail of smoke and sparks behind her, cyan after-images of her as she is flung off (Movement
// 9); she comes down in a puff of dust, her feet skidding two short scuffs into the floor. Every glow the friend's cyan.

import { Px } from '../engine/px';
import { BREW } from './contraption_fx';
import { noise2 } from './sculpt_warlock';
import { Light, SMOKE, cloud, fire } from './warlock_fx';

export { BREW, SMOKE };
/** Stone: a chip of the floor flung up, dark to lit. */
export const CHIP = ['#141018', '#2a2532', '#4a4256', '#6e6680'];
/** A scorch: the floor burnt black. */
export const SCORCH = ['#0c0a10', '#18141e', '#221c2a', '#2e2836'];

const hash = (i: number): number => {
  const x = Math.sin(i * 73.17 + 11.3) * 43758.5453;
  return x - Math.floor(x);
};

/** Its fuse spitting, at (x, y), `k` frames after she set it down: little cyan sparks flicked up off its end. */
export function fuseSparks(l: Light, x: number, y: number, k: number, seed: number): void {
  if (k < 0) return;
  for (let i = 0; i < 4; i++) {
    const ph = ((k + i * 1.7) % 4) / 4;
    const a = -Math.PI / 2 + (hash(seed + i + Math.floor((k + i * 1.7) / 4) * 7) - 0.5) * 2.2;
    const r = ph * 6;
    l.put(x + Math.cos(a) * r, y + Math.sin(a) * r + ph * ph * 3, ph < 0.4 ? 3 : 2);
    l.put(x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1) + ph * ph * 3, 1);
  }
  l.put(x, y, 3);
  l.put(x + 1, y, 2);
}

/**
 * THE BLAST at (x, y) on the floor, `k` frames after it goes off: a white-hot flash; a ball of her cyan fire boiling up
 * and out, torn ragged, burning down; a ring of it racing out over the floor; a column of black smoke rolling up.
 */
export function blast(l: Light, sm: Light, x: number, y: number, k: number, t: number, seed: number): void {
  if (k < 0) return;
  // (the flash: a disc of white over everything, the first two frames)
  if (k < 2) {
    const r = k === 0 ? 22 : 15;
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
      const d = Math.hypot(xx, yy * 1.25) / r;
      if (d <= 1) l.put(x + xx, y - 8 + yy, d < 0.55 ? 3 : d < 0.8 ? 2 : 1);
    }
  }
  // (the fireball: boiling up and out, its edge torn by noise, white at its heart, the first few frames)
  if (k < 5) {
    const R = 9 + 7 * (1 - Math.exp(-k / 1.5));
    const cy = y - 8 - k * 2;
    for (let yy = -Math.ceil(R * 1.3); yy <= Math.ceil(R); yy++) {
      for (let xx = -Math.ceil(R * 1.2); xx <= Math.ceil(R * 1.2); xx++) {
        const n = noise2((x + xx) * 0.18 + seed, (cy + yy + t * 40) * 0.18) - 0.5;
        const d = Math.hypot(xx / 1.15, yy) / R + n * 0.6;
        if (d > 1) continue;
        if (k > 2 && d < (k - 2) / 4) continue;
        const v = 1 - d;
        l.put(x + xx, cy + yy, v > 0.6 ? 3 : v > 0.3 ? 2 : 1);
      }
    }
  }
  // (and its fire: tongues of her cyan fire licking up out of the blast, leaning out, burning down)
  if (k >= 2 && k < 20) {
    const left = 1 - (k - 2) / 18;
    const tongues: [number, number, number][] = [[0, 0, 6.5], [-9, 2, 4.2], [9, 2, 4.2], [-4, -3, 3.5], [5, -2, 3.2]];
    tongues.forEach(([dx, dy, size], i) => fire(l, x + dx, y + dy - 2, size * left * (0.85 + 0.3 * hash(seed + i)), t + i * 0.37, dx * 0.04));
  }
  // (the ring racing out over the floor, flattened as the floor is)
  if (k < 9) {
    const R = 6 + k * 6.5;
    const n = Math.round(R * 4);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wob = 1 + (hash(seed * 3 + i) - 0.5) * 0.15;
      const px = x + Math.cos(a) * R * wob;
      const py = y + Math.sin(a) * R * 0.5 * wob;
      const lv = k < 3 ? 2 : 1;
      l.put(px, py, lv);
      l.put(px, py - 1, k < 3 ? 3 : 1);
    }
  }
  // (its smoke: a column rolling up and out over it, thinning as it goes)
  if (k >= 1 && k < 50) {
    for (let i = 0; i < 7; i++) {
      const up = 6 + i * 6 + k * (0.9 + 0.12 * i);
      const wide = 8 + i * 2.5 + k * 0.55;
      const sway = Math.sin(t * 2 + i) * 3 + (hash(seed + i) - 0.5) * 10;
      cloud(sm, x + sway, y - up, 2 * wide, 1.5 * wide, t + i * 0.3, Math.min(1, 0.02 + (k - 1) / 50 + i * 0.03), 2000 + seed + i);
    }
  }
}

/** A chip of the floor flung out of the blast: where it is `k` frames on (picture), and whether it has come down. */
function chipAt(x: number, y: number, k: number, i: number, seed: number): { x: number; y: number; down: boolean; r: number } {
  const a = hash(seed * 7 + i) * Math.PI * 2;
  const sp = 1.5 + 1.7 * hash(seed * 11 + i);
  const vx = Math.cos(a) * sp * 1.3;
  const vy0 = -4.0 - 3.5 * hash(seed * 13 + i);
  const land = y + Math.sin(a) * sp * 6 * 0.5;
  const g = 0.55;
  // (when it comes back down to the floor, out from where it went up)
  const tk = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * Math.max(0, land - y))) / g;
  const kk = Math.min(k, tk);
  return { x: x + vx * kk, y: y + vy0 * kk + 0.5 * g * kk * kk, down: k >= tk, r: 1 + Math.round(hash(seed * 17 + i) * 1.4) };
}
/** Stone chips flung up and out of the blast, falling back and lying where they come down; each lit cyan on its underside a moment. */
export function chips(st: Light, l: Light, x: number, y: number, k: number, seed: number): void {
  if (k < 0) return;
  for (let i = 0; i < 12; i++) {
    const c = chipAt(x, y - 3, k, i, seed);
    for (let yy = -c.r; yy <= c.r; yy++) for (let xx = -c.r; xx <= c.r; xx++) {
      if (Math.abs(xx) + Math.abs(yy) > c.r + 0.5) continue;
      st.put(c.x + xx, c.y + yy, yy < 0 ? 3 : yy === 0 ? 2 : 1);
    }
    if (!c.down && k < 8) l.put(c.x, c.y + c.r + 1, 1);
  }
}
/** The scorch it leaves on the floor at (x, y): black, ragged; its cracks glowing cyan, cooling over `k` frames. */
export function scorch(sc: Light, l: Light, x: number, y: number, k: number, seed: number): void {
  if (k < 0) return;
  const R = 15;
  for (let yy = -Math.ceil(R * 0.5); yy <= Math.ceil(R * 0.5); yy++) {
    for (let xx = -R - 2; xx <= R + 2; xx++) {
      const d = Math.hypot(xx / R, yy / (R * 0.5)) + (noise2((x + xx) * 0.3 + seed, (y + yy) * 0.3) - 0.5) * 0.5;
      if (d > 1) continue;
      sc.put(x + xx, y + yy, d < 0.45 ? 0 : d < 0.75 ? 1 : 2);
    }
  }
  // (its cracks: out from its middle, glowing, cooling)
  const heat = k < 6 ? 2 : k < 30 ? 1 : 0;
  if (heat === 0) return;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + hash(seed + i) * 0.6;
    const len = R * (0.6 + 0.35 * hash(seed * 3 + i));
    for (let r = 2; r < len; r += 0.6) {
      const jag = (noise2(r * 0.3 + i * 5, seed) - 0.5) * 3;
      l.put(x + Math.cos(a) * r + -Math.sin(a) * jag, y + (Math.sin(a) * r + Math.cos(a) * jag) * 0.5, r < len * 0.5 ? heat : 1);
    }
  }
}
/** Her trail as the blast throws her: puffs of its smoke behind her along the way she went, and sparks shed off it. */
export function trail(sm: Light, l: Light, pts: [number, number][], t: number, seed: number): void {
  pts.forEach(([x, y], i) => {
    const age = i;
    if (age > 22) return;
    const r = 4.5 + age * 0.6;
    cloud(sm, x, y - age * 0.4, 2 * r, 1.5 * r, t + i * 0.2, Math.min(1, 0.05 + age / 24), 3000 + seed + i);
    if (age < 8 && hash(seed * 5 + i + Math.floor(t * 30)) < 0.6) {
      l.put(x + (hash(seed + i * 3) - 0.5) * 6, y + (hash(seed + i * 7) - 0.5) * 6, age < 3 ? 2 : 1);
    }
  });
}
/** Two short scuffs into the floor where her feet came down and skidded, `k` frames on: dark, fading. */
export function scuffs(sc: Light, feet: [number, number, number, number][], k: number): void {
  if (k < 0) return;
  for (const [x0, y0, x1, y1] of feet) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const y = y0 + ((y1 - y0) * i) / n;
      sc.put(x, y, 1);
      sc.put(x, y + 1, 2);
    }
  }
}

/** The picture of it all: its scorch, its stone, its smoke, its light, laid in that order. */
export function layBlast(w: number, h: number, sc: Light, st: Light, sm: Light, l: Light): Px {
  const out = new Px(w, h);
  sc.lay(out, SCORCH);
  st.lay(out, CHIP);
  sm.lay(out, SMOKE);
  l.lay(out, BREW);
  return out;
}
