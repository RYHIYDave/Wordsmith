// HER TAP: THE CONTRAPTION THROWN DOWN, SET UP, AND LOBBING HER VIALS (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE
// GAME IMPORTS IT.
//
// His brief, 23 Oct: “I think she’ll set turrets on the ground that fire something.  Not an arrow or a bolt.  That’s the
// tap.  We’ll call those “Contraption”.”; what they fire, “Lobbed vials (Recommended)” (little brass mortars that lob her
// potions in arcs, bursting where they land); his pick of the Contraption, “1. Tripod mortar”. Her throw is hers
// (dev/tinkerer_moves.ts tinkerTap); here is what it throws: THE CONTRAPTION, SHUT (a squat brass bell, its legs drawn up
// into it), tumbling through the air from her hand, bouncing once with a puff of dust, and SPRINGING OPEN where it settles:
// its legs telescoping out and down, its claws biting the floor, its body pushed up on them, its mortar sliding up out of
// its dome and tipping over to its aim, its lamp lit with a ring of cyan. Then it fires: a thump, its mortar kicked back
// down, a puff of smoke and a flash of cyan out of its mouth, and a vial of hers LOBBED high, tumbling end over end, down
// onto a cultist, where it BURSTS: glass flying, a splash of her cyan brew flung out in drops that spatter the floor and
// fizz there, the cultist flashing, knocked back, a scrap of robe and a little blood off it (his rulebook's Hits), and
// fizzing where it is splashed, bubbles rising off it and popping. By his art rulebook: Movement 9 (her throw a flash, a
// big wind-up and wind-down; its shot a thump), Effects (big and wild, real shapes), every glow the friend's cyan.

import type { V3 } from '../art/skeleton';
import { Px } from '../engine/px';
import { Light, SMOKE, cloud } from './warlock_fx';

/** What glows: the friend's cyan, darkest to white-hot (her brew, her lamp). */
export const BREW = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'];
/** Its vapour: the brew's fizz, rising. */
export const VAPOUR = ['#0e3e4c', '#145a6a', '#1e8494', '#52c2cc'];
/** Brass, a vial's cap. */
export const CAP = ['#4a3410', '#8a6a24', '#c8a04a', '#f0d88a'];

const hash = (i: number): number => {
  const x = Math.sin(i * 57.31 + 3.7) * 43758.5453;
  return x - Math.floor(x);
};
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
const lerp = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** Its timings, in frames (30 a second) from her tap. */
export const CT = {
  /** It leaves her hand; it comes down; it comes down again after its bounce; it springs open; it is set up and lit. */
  letGo: 15, land: 27, settle: 37, open0: 39, open1: 53,
  /** Its shots: when each is fired; how long each vial flies. */
  shots: [62, 100] as number[], flight: 20,
  long: 140,
};
/** How high its bounce goes, and how far on (its own measure). */
const BOUNCE = { high: 9, on: 9 };

/**
 * THE CONTRAPTION'S FLIGHT, frame `f`: where its middle is (her measure), how far it is turned round (degrees), how far
 * open, its mortar's kick, its lamp; null before it leaves her hand. From `from` (where her hand let go of it) to `land`
 * (a point on the floor), spinning down to face `face` (degrees) as it settles.
 */
export function capsuleAt(f: number, from: V3, land: V3, mid: number, spin0: number, face: number): { at: V3; turn: number; open: number; kick: number; lit: number; down: boolean } | null {
  if (f < CT.letGo) return null;
  // (turned as it was in her hand as it leaves it; tumbling round twice and a bit, slowing, to face its way as it settles)
  const turnAt = (k: number): number => face + (spin0 + 720) * Math.pow(1 - Math.min(1, k), 2);
  if (f < CT.land) {
    // (a lob: up out of her hand and down onto the floor, turning as it goes)
    const u = (f - CT.letGo) / (CT.land - CT.letGo);
    const z = from[2] + (mid - from[2]) * u + 4 * 26 * u * (1 - u);
    const at = lerp(from, land, u);
    return { at: [at[0], at[1], z], turn: turnAt(u * 0.75), open: 0, kick: 0, lit: 0, down: false };
  }
  if (f < CT.settle) {
    // (it bounces once, a little on)
    const u = (f - CT.land) / (CT.settle - CT.land);
    const on = BOUNCE.on * u;
    const way = norm2(land[0] - from[0], land[1] - from[1]);
    return { at: [land[0] + way[0] * on, land[1] + way[1] * on, mid + 4 * BOUNCE.high * u * (1 - u)], turn: turnAt(0.75 + 0.25 * u), open: 0, kick: 0, lit: 0, down: u < 0.08 };
  }
  const way = norm2(land[0] - from[0], land[1] - from[1]);
  const rest: V3 = [land[0] + way[0] * BOUNCE.on, land[1] + way[1] * BOUNCE.on, mid];
  const open = f < CT.open0 ? 0 : Math.min(1, (f - CT.open0) / (CT.open1 - CT.open0));
  // (each shot kicks its mortar down its barrel at once, easing back up)
  let kick = 0;
  for (const s of CT.shots) if (f >= s) kick = Math.max(kick, Math.exp(-(f - s) / 2.5));
  return { at: rest, turn: face, open, kick, lit: f >= CT.open1 ? 1 : 0, down: f === CT.settle };
}
function norm2(x: number, y: number): [number, number] {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}
/** Where it settles (her measure): a little on from where it first came down. */
export function restOf(from: V3, land: V3): V3 {
  const way = norm2(land[0] - from[0], land[1] - from[1]);
  return [land[0] + way[0] * BOUNCE.on, land[1] + way[1] * BOUNCE.on, 0];
}

/** A VIAL in flight, frame `k` of its flight: from `mouth` up in a high lob and down onto `hit`; and how far it has tumbled. */
export function vialAt(k: number, mouth: V3, hit: V3): { at: V3; tumble: number } | null {
  if (k < 0 || k > CT.flight) return null;
  const u = k / CT.flight;
  const at = lerp(mouth, hit, u);
  const high = 62;
  return { at: [at[0], at[1], at[2] + 4 * high * u * (1 - u)], tumble: k * 0.62 + 0.4 };
}
/** A vial on the picture at (x, y), turned `a`: its glass of her cyan brew, its brass cap. */
export function vialSprite(glass: Light, cap: Light, x: number, y: number, a: number): void {
  const c = Math.cos(a);
  const s = Math.sin(a);
  for (let v = -3.5; v <= 3.5; v += 0.5) {
    for (let u = -1.6; u <= 1.6; u += 0.5) {
      const isCap = v < -2.4;
      if (isCap && Math.abs(u) > 1.1) continue;
      const px = x + u * c - v * s;
      const py = y + u * s + v * c;
      if (isCap) cap.put(px, py, u < 0 ? 3 : 2);
      else glass.put(px, py, u < -0.6 ? 3 : u < 0.6 ? 2 : 1);
    }
  }
}

/** The ring of cyan as its lamp is lit, `k` frames on, round (x, y). */
export function lampRing(l: Light, x: number, y: number, k: number): void {
  if (k < 0 || k > 4) return;
  const r = 2 + k * 2.2;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    l.put(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, k < 2 ? 2 : 1);
  }
  if (k < 2) l.put(x, y, 3);
}
/** Glints off its joints as its legs snap out, `k` frames on: a few short sparks of white and cyan. */
export function glints(l: Light, pts: [number, number][], k: number, seed: number): void {
  if (k < 0 || k > 3) return;
  pts.forEach(([x, y], i) => {
    const a = hash(seed + i) * Math.PI * 2;
    const r = 1.5 + k * 1.6;
    l.put(x + Math.cos(a) * r, y + Math.sin(a) * r, k < 2 ? 3 : 1);
    l.put(x + Math.cos(a) * (r + 1), y + Math.sin(a) * (r + 1), k < 2 ? 2 : 1);
    l.put(x - Math.cos(a) * r, y - Math.sin(a) * r, 1);
  });
}
/** Dust kicked out round (x, y) on the floor as it comes down, `k` frames on. */
export function thud(sm: Light, x: number, y: number, k: number, seed: number, size = 1): void {
  if (k < 0 || k > 14) return;
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    const go = (1 - Math.pow(1 - k / 14, 2)) * (7 + 10 * hash(seed + i)) * size;
    const r = (2.4 + k * 0.4) * size;
    cloud(sm, x + side * (2 + go), y - 1 - k * 0.45 * hash(seed * 3 + i), 2.2 * r, 1.5 * r, k / 30 + i, Math.min(1, k / 16), 900 + seed + i);
  }
}
/** Its shot: a flash of cyan out of its mouth (x, y) the way (dx, dy), and a puff of smoke rolling up off it, `k` frames on. */
export function mouthPuff(l: Light, sm: Light, x: number, y: number, dx: number, dy: number, k: number, t: number, seed: number): void {
  if (k < 0) return;
  if (k < 3) {
    const big = k === 0 ? 1 : k === 1 ? 0.65 : 0.35;
    for (let i = 0; i < 7; i++) {
      const a = Math.atan2(dy, dx) + ((i / 6) * 2 - 1) * 0.9;
      const len = (5 + 8 * (1 - Math.abs((i / 6) * 2 - 1)) + 3 * hash(seed + i)) * big;
      for (let r = 0; r <= len; r += 0.5) l.put(x + Math.cos(a) * r, y + Math.sin(a) * r, r < len * 0.35 ? 3 : r < len * 0.7 ? 2 : 1);
    }
  }
  if (k < 24) {
    for (let i = 0; i < 4; i++) {
      const up = k * (0.5 + 0.3 * hash(seed * 5 + i));
      const out = (3 + 5 * hash(seed + i)) * (1 - Math.exp(-k / 4));
      const r = 3 + i * 0.6 + k * 0.35;
      cloud(sm, x + dx * out + (hash(seed * 3 + i) - 0.5) * 6, y + dy * out - up, 2 * r, 1.6 * r, t + i, Math.min(1, 0.05 + k / 24), 600 + seed + i);
    }
  }
}

/** A drop of her brew flung off a burst: where it is `k` frames on (picture), and whether it has come down on the floor. */
function drop(x: number, y: number, floorY: number, k: number, i: number, seed: number, big: number): { x: number; y: number; down: boolean } {
  const a = (hash(seed + i * 3) - 0.5) * Math.PI * 1.6 - Math.PI / 2;
  const sp = (1.6 + 2.6 * hash(seed * 7 + i)) * big;
  const vx = Math.cos(a) * sp * 1.4;
  const vy = Math.sin(a) * sp;
  // (where it comes down: on the floor a little out from where it burst, scattered round it)
  const land = floorY + (hash(seed * 11 + i) - 0.3) * 10 * big;
  let px = x + vx * k;
  let py = y + vy * k + 0.32 * k * k;
  let down = false;
  if (py >= land && k > 1) {
    // (when it came down, it stays where it came down)
    const tk = (-vy + Math.sqrt(Math.max(0, vy * vy + 4 * 0.32 * (land - y)))) / (2 * 0.32);
    px = x + vx * tk;
    py = land;
    down = true;
  }
  return { x: px, y: py, down };
}
/**
 * THE VIAL BURSTS at (x, y) on the picture, over a floor at `floorY`, `k` frames on: a flash; shards of glass flung out
 * glinting; her brew splashed out in drops that arc and spatter the floor round it and fizz there; its vapour rising.
 */
export function vialBurst(l: Light, va: Light, x: number, y: number, floorY: number, k: number, t: number, seed: number): void {
  if (k < 0) return;
  if (k < 2) {
    const r = k === 0 ? 8 : 5;
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
      const d = Math.hypot(xx, yy * 1.2) / r;
      if (d <= 1) l.put(x + xx, y + yy, d < 0.4 ? 3 : d < 0.75 ? 2 : 1);
    }
  }
  // (shards of glass: short glinting dashes flung out fast, falling)
  for (let i = 0; i < 8 && k < 9; i++) {
    const a = hash(seed * 13 + i) * Math.PI * 2;
    const sp = 3.2 + 2.2 * hash(seed * 17 + i);
    const sx = x + Math.cos(a) * sp * k;
    const sy = y + Math.sin(a) * sp * k * 0.8 + 0.3 * k * k;
    l.put(sx, sy, k < 4 ? 3 : 2);
    l.put(sx + Math.cos(a), sy + Math.sin(a) * 0.8, 1);
  }
  // (her brew: drops flung out in arcs and spattered on the floor, fizzing there a while)
  for (let i = 0; i < 16; i++) {
    const d = drop(x, y, floorY, k, i, seed, 1);
    if (!d.down) {
      l.put(d.x, d.y, 2);
      l.put(d.x + 1, d.y, 2);
      l.put(d.x, d.y + 1, 1);
      l.put(d.x + 1, d.y + 1, 1);
    } else if (k < 34) {
      // (a spatter, fizzing: a little pool, a bubble now and then)
      const w = 2 + (i % 3);
      const fade = k < 26 ? 1 : 0;
      for (let xx = -w; xx <= w; xx++) l.put(d.x + xx, d.y, fade ? (Math.abs(xx) < w - 1 ? 2 : 1) : 0);
      if (hash(seed * 5 + i + Math.floor(t * 9)) < 0.35) {
        l.put(d.x, d.y - 1 - (Math.floor(t * 20 + i) % 3), 2);
        l.put(d.x + 1, d.y - 1 - (Math.floor(t * 20 + i) % 3), 1);
      }
    }
  }
  // (a pool where it burst, fizzing, drying away)
  if (k < 40) {
    const w = 10 * Math.min(1, k / 4) * (k < 30 ? 1 : 1 - (k - 30) / 10);
    for (let xx = -Math.ceil(w); xx <= Math.ceil(w); xx++) {
      for (let yy = -2; yy <= 2; yy++) {
        if (Math.hypot(xx / Math.max(1, w), yy / 2.4) > 1) continue;
        l.put(x + xx, floorY + yy, Math.abs(xx) < w * 0.5 && Math.abs(yy) < 1 ? 2 : 1);
      }
    }
  }
  // (its vapour: rising off the splash, thinning)
  if (k < 30) for (let i = 0; i < 3; i++) cloud(va, x + (i - 1) * 7, floorY - 4 - k * 0.9, 9 + k * 0.5, 7 + k * 0.4, t + i, Math.min(1, 0.15 + k / 30), 1300 + seed + i);
}
/**
 * A FIGURE SPLASHED WITH HER BREW, its floor point (gx, gy), `w` across, `h` high: drops of it clinging on it, fizzing,
 * bubbles rising off it and popping; `heat` how much (1 just splashed, dying to 0).
 */
export function fizz(l: Light, gx: number, gy: number, w: number, h: number, t: number, heat: number, seed: number): void {
  if (heat <= 0) return;
  const n = Math.round(9 * heat);
  for (let i = 0; i < n; i++) {
    const ph = (t * (1.4 + hash(seed + i)) + hash(seed * 3 + i)) % 1;
    const bx = gx + (hash(seed * 5 + i) - 0.5) * w * 0.8;
    const by = gy - h * (0.15 + 0.7 * hash(seed * 7 + i)) - ph * 12;
    // (a bubble: a little ring rising, popping at the top in a fleck)
    if (ph < 0.85) {
      l.put(bx, by, 2);
      l.put(bx + 1, by, 1);
      l.put(bx, by - 1, 1);
      l.put(bx + 1, by - 1, 2);
    } else {
      l.put(bx - 1, by, 1);
      l.put(bx + 2, by, 1);
    }
  }
}

/** The picture of it all: its dust and smoke, its vapour, its caps, its light, laid in that order. */
export function layTap(w: number, h: number, sm: Light, va: Light, cap: Light, l: Light): Px {
  const out = new Px(w, h);
  sm.lay(out, SMOKE);
  va.lay(out, VAPOUR);
  cap.lay(out, CAP);
  l.lay(out, BREW);
  return out;
}
