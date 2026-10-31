// HER CONTRAPTION'S TWO NEW KINDS, THEIR THROWS AND WHAT THEY THROW OFF (the art chat's helper, 31 Oct 2026). A MOCK-UP;
// NOTHING OF THE GAME IMPORTS IT.
//
// His words, 31 Oct, 00:04: “And have the same option when swapping vial to contraption” (the Golem's choice of arm, a
// solid shot for Dexterity or energy for Intelligence, for the Contraption that takes the place of her Vial Toss on her
// tree); asked what its energy kind should do: “Energy bolts, and let’s make the contraption throw little bombs.  She’s
// marketed as a demolitionist and we need to fit that in better”. Her own Vial Toss stays vials.
//
// THE BOMB CONTRAPTION (dev/sculpt_contraption.ts, ammo 'bombs'): the tripod mortar as he picked it, a pile of little bombs
// on its back in place of her vials. Each throw, by his rulebook's Movement 9 (a big wind-up held and readable, the throw a
// flash, a big wind-down): a bomb fed up its bore into its mouth, its fuse lit and spitting; it SQUATS down on its legs, its
// knees splayed, its mortar tipped back, its crank wound round, and holds there trembling; then in a flash it SPRINGS UP and
// THUMPS the bomb out (its mortar kicked down its barrel, a flash of cyan and smoke out of its mouth); it rocks down and up
// and settles, smoke curling out of its mouth. THE BOMB: round black iron, a brass cap, a short fuse spitting the friend's
// cyan sparks; lobbed high, tumbling, it comes down a little short, hops on to where it was thrown and sits there fizzing a
// beat; then IT GOES OFF: a white flash, a ball of the friend's cyan fire, a ring racing out over the floor to its full
// radius, cyan sparks and shards flung out, stone and scraps of its iron flung up and falling, a column of smoke, a scorch
// left with its cracks glowing and cooling. A friend's blast: no pink, no gold.
//
// THE ENERGY CONTRAPTION (ammo 'energy'): the same tripod, its mortar a little TESLA COIL (brass, copper windings, a steel
// ring round a ball of the friend's cyan, as the Golem's), a dynamo on its back in place of her vials. Each shot: it crouches
// a little and tips back, its crank wound round, its windings lighting from its foot to its tip, arcs crawling up the coil,
// light drawn into its ball; a GLINT at its full; then in a flash a CYAN BOLT out (its coil kicked back, its body jolted up);
// the bolt flies straight and fast to what it is aimed at and hits it CRACKLING; it settles, its windings dimming, its ball
// spitting and smoking. One at a time.

import { Px } from '../engine/px';
import type { V3 } from '../art/skeleton';
import { UNITS_PER_TILE } from '../art/moves3';
import type { ShotPose } from './sculpt_contraption';
import { BREW, mouthPuff, thud } from './contraption_fx';
import { CHIP, SCORCH, chips, fuseSparks } from './blast_fx';
import { bolt, crackle, impactBurst } from './golem_gun_fx';
import { Light, SMOKE, cloud, fire } from './warlock_fx';
import { noise2 } from './sculpt_warlock';


// ---- THE NUMBERS ----------------------------------------------------------------------------------------------------

/**
 * A BOMB THROW's frames (30 a second, from when it begins): its bomb fed up into its mouth by `loaded`, its fuse lit at
 * `lit`; it squats from `squat` to `low` and holds there trembling; it throws at `fire` (THE STRIKE: `fire` and the frame
 * after); it rocks and settles, done at `end`. A throw every `end` frames at the most (the game's TINKER_TUNE.contraption
 * `every` is 38).
 */
export const CBOMB = { loaded: 6, lit: 5, squat: 2, low: 13, fire: 19, end: 36 };
/**
 * THE BOMB: how long it flies (frames, however far: as her vials do), how high its lob goes over the line (tiles); how far
 * short of where it is thrown it first comes down and hops on (tiles), and how long its hop is (frames); how long after its
 * throw it goes off (frames: its flight, its hop and its fizzing beat); THE BLAST's radius (tiles) and how long the blast
 * lasts, flash to gone (frames); and how far the Contraption can throw it (tiles, as its vials).
 */
export const BOMB_FX = { flight: 16, high: 1.8, short: 0.35, hop: 6, boom: 28, blast: 2.0, long: 36, reach: 7 };
/** AN ENERGY SHOT's frames: it charges from 0 to `full`, glints, fires at `fire` (THE STRIKE: `fire` and the frame after), and settles by `end`. */
export const CBOLT = { full: 9, fire: 11, end: 24 };
/** THE BOLT: how fast it flies (tiles a second), how far it reaches (tiles), and how long what it hits crackles (frames). */
export const BOLT_FX = { speed: 30, reach: 8, crackle: 14 };
/** Each throw's strike, a flash (Movement 9): not judged frame by frame for slickness. */
export const CBOMB_STRIKE: [number, number][] = [[CBOMB.fire, CBOMB.fire + 1]];
export const CBOLT_STRIKE: [number, number][] = [[CBOLT.fire, CBOLT.fire + 1]];

// ---- THE THROWS (its pose, frame by frame) ---------------------------------------------------------------------------

/** Its pose as dev/sculpt_contraption.ts takes it: CONTRAPTION_POSE's, and the shot's own. */
export interface ShotFrame {
  pose: { open: number; kick: number; lit: number; broke: number };
  shot: ShotPose;
}
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
/** A value through keys (frame, value), eased from each to the next. */
function keyed(keys: [number, number][], f: number): number {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) return v0 + (v1 - v0) * ease((f - f0) / (f1 - f0));
  }
  return keys[keys.length - 1][1];
}

/** THE BOMB THROW at frame `f` (0 to CBOMB.end; the same at both ends: it stands as it always stood). */
export function bombShot(f: number): ShotFrame {
  const C = CBOMB;
  const k = f - C.fire;
  // (trembling while it holds, low, its spring wound)
  const shiver = f > C.low && f < C.fire ? 0.05 * (f % 2 ? 1 : -1) : 0;
  const squat = k < 0
    ? keyed([[C.squat, 0], [C.low, 1]], f) + shiver
    : keyed([[C.fire, -0.36], [C.fire + 1, -0.3], [C.fire + 7, 0.24], [C.fire + 12, -0.06], [C.end, 0]], f);
  const tip = k < 0
    ? keyed([[C.squat, 0], [C.low, 1]], f) + shiver * 0.5
    : keyed([[C.fire, -0.32], [C.fire + 1, -0.26], [C.fire + 8, 0.12], [C.end - 3, 0]], f);
  const kick = k < 0 ? 0 : k === 0 ? 1 : f >= C.end - 4 ? 0 : Math.max(0, Math.exp(-k / 2.5) - Math.exp(-(C.end - 4 - C.fire) / 2.5));
  return {
    pose: { open: 1, kick, lit: 1, broke: 0 },
    shot: {
      squat,
      tip,
      load: k < 0 ? ease(f / C.loaded) : 0,
      fuse: k < 0 && f >= C.lit ? 1 : 0,
      charge: 0,
      // (its crank wound round once as it squats, its spring taking the load)
      wind: k < 0 ? ease((f - C.squat) / (C.low - C.squat)) : 0,
    },
  };
}
/** THE ENERGY SHOT at frame `f` (0 to CBOLT.end; the same at both ends). */
export function boltShot(f: number): ShotFrame {
  const C = CBOLT;
  const k = f - C.fire;
  const shiver = f >= C.full && f < C.fire ? 0.04 * (f % 2 ? 1 : -1) : 0;
  const squat = k < 0 ? keyed([[0, 0], [C.full, 0.4]], f) + shiver : keyed([[C.fire, -0.22], [C.fire + 1, -0.16], [C.fire + 5, 0.12], [C.end, 0]], f);
  const tip = k < 0 ? keyed([[0, 0], [C.full, 0.32]], f) : keyed([[C.fire, -0.18], [C.fire + 1, -0.12], [C.fire + 6, 0.06], [C.end - 2, 0]], f);
  const charge = k < 0 ? keyed([[0, 0], [C.full, 1]], f) : keyed([[C.fire, 0.55], [C.fire + 7, 0]], f);
  const kick = k < 0 ? 0 : k === 0 ? 1 : f >= C.end - 3 ? 0 : Math.max(0, Math.exp(-k / 2.2) - Math.exp(-(C.end - 3 - C.fire) / 2.2));
  return {
    pose: { open: 1, kick, lit: 1, broke: 0 },
    shot: { squat, tip, load: 0, fuse: 0, charge: charge < 0.01 ? 0 : charge, wind: k < 0 ? ease(f / C.full) : 0 },
  };
}

// ---- WHAT THEY THROW OFF ----------------------------------------------------------------------------------------------

/** What a shot paints, each laid in its own colours: on the floor (its scorch, its light), and in the air. */
export interface ShotLayers {
  floor: Light;
  floorLit: Light;
  sm: Light;
  stone: Light;
  iron: Light;
  cap: Light;
  l: Light;
}
export function shotLayers(): ShotLayers {
  return { floor: new Light(), floorLit: new Light(), sm: new Light(), stone: new Light(), iron: new Light(), cap: new Light(), l: new Light() };
}
/** Brass on a bomb in flight: its cap (darker than the Contraption's, and its fuse the darkest of it). */
export const BOMB_BRASS = ['#3a2c14', '#66522a', '#8a7040', '#c8b484'];
/** What is on the floor, under what stands: its scorch, and the light of it. */
export function layShotFloor(w: number, h: number, ly: ShotLayers): Px {
  const out = new Px(w, h);
  ly.floor.lay(out, SCORCH);
  ly.floorLit.lay(out, BREW);
  return out;
}
/** Her bombs' black iron in flight, and the scraps of it flung off a blast (dark to its gleam). */
export const BOMB_IRON = ['#0a0910', '#1e1c2a', '#3a3850', '#8a88a8'];
/** What is in the air, over what stands: smoke, stone, iron, brass, light, laid in that order. */
export function layShotAir(w: number, h: number, ly: ShotLayers): Px {
  const out = new Px(w, h);
  ly.sm.lay(out, SMOKE);
  ly.stone.lay(out, CHIP);
  ly.iron.lay(out, BOMB_IRON);
  ly.cap.lay(out, BOMB_BRASS);
  ly.l.lay(out, BREW);
  return out;
}

/** Where a shot is at a frame of it: on the picture through `S`, from where things are in the world (the floor's measure). */
export interface ShotAt {
  /** A point of the world to the picture. */
  S: (p: V3) => [number, number];
  /** Its mouth (or its coil's ball) and the way it points, as drawn this frame. */
  mouth: V3;
  way: V3;
  /** Its loaded bomb's fuse, as drawn this frame (or null); its coil's foot and tip (or null). */
  fuse: V3 | null;
  coil: [V3, V3] | null;
  /** Its mouth as it threw (the bomb or bolt flies from there). */
  fired: V3;
  /** Where the bomb goes off (on the floor); or what the bolt hits (a point of it, its chest). */
  aim: V3;
}

const hash = (i: number): number => {
  const x = Math.sin(i * 41.77 + 9.1) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
function line(l: Light, x0: number, y0: number, x1: number, y1: number, k: number, w = 1): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = y0 + ((y1 - y0) * i) / n;
    for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) l.put(x + a - (w >> 1), y + b - (w >> 1), k);
  }
}
function disc(l: Light, x: number, y: number, r: number, top = 3, squash = 1): void {
  for (let yy = Math.floor(-r * squash); yy <= Math.ceil(r * squash); yy++) {
    for (let xx = Math.floor(-r); xx <= Math.ceil(r); xx++) {
      const d = Math.hypot(xx, yy / squash) / Math.max(0.5, r);
      if (d > 1) continue;
      l.put(x + xx, y + yy, Math.max(0, Math.min(top, Math.round(top - d * top * 0.9))));
    }
  }
}
function onPicture(S: (p: V3) => [number, number], p: V3, w: V3): [number, number] {
  const a = S(p);
  const b = S([p[0] + w[0] * 10, p[1] + w[1] * 10, p[2] + w[2] * 10]);
  const n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / n, (b[1] - a[1]) / n];
}

// ---- THE BOMB ---------------------------------------------------------------------------------------------------------

/** How big a bomb is drawn in flight (its half across, in the picture's pixels). */
export const BOMB_PX = 3.6;
/**
 * A LITTLE BOMB at (x, y) on the picture, tumbled round `a`: round black iron lit from above, a brass cap on it, a short fuse
 * out of the cap, its end spitting (`lit`).
 */
export function bombSprite(ly: ShotLayers, x: number, y: number, a: number, lit: boolean): [number, number] {
  const R = BOMB_PX;
  for (let yy = -5; yy <= 5; yy++) {
    for (let xx = -5; xx <= 5; xx++) {
      const d = Math.hypot(xx, yy) / R;
      if (d > 1) continue;
      // (lit from above and to the left: a gleam, its lit side, its round, its shadow)
      const lt = (-xx * 0.55 - yy * 0.83) / R;
      const k = lt > 0.55 && d < 0.75 ? 3 : lt > 0.1 ? 2 : lt > -0.45 ? 1 : 0;
      ly.iron.put(x + xx, y + yy, k);
    }
  }
  // (a thin edge of the friend's cyan round it, as round all that is hers: seen over any floor)
  for (let i = 0; i < 28; i++) {
    const q = (i / 28) * Math.PI * 2;
    ly.l.put(x + Math.cos(q) * (R + 1), y + Math.sin(q) * (R + 1), 0);
  }
  const cx = Math.cos(a);
  const cy = Math.sin(a);
  // (its cap, sat on it where it is turned; its fuse out of it)
  for (let s = -1.4; s <= 1.4; s += 0.5) for (let o = R - 0.8; o <= R + 0.9; o += 0.5) ly.cap.put(x + cx * o - cy * s, y + cy * o + cx * s, o > R + 0.3 ? 2 : s < 0 ? 3 : 2);
  const tip: [number, number] = [x + cx * (R + 3.6) - cy * 1.2, y + cy * (R + 3.6) + cx * 1.2];
  line(ly.cap, x + cx * (R + 1.2), y + cy * (R + 1.2), tip[0], tip[1], 0, 1);
  if (lit) {
    ly.l.put(tip[0], tip[1], 3);
    ly.l.put(tip[0] + 1, tip[1], 2);
  }
  return tip;
}
/** Where it first comes down: a little short of where it was thrown, along the way it flies. */
function touchOf(at: ShotAt): V3 {
  const dx = at.aim[0] - at.fired[0];
  const dy = at.aim[1] - at.fired[1];
  const d = Math.hypot(dx, dy) || 1;
  const s = Math.min(BOMB_FX.short * UNITS_PER_TILE, d * 0.3);
  return [at.aim[0] - (dx / d) * s, at.aim[1] - (dy / d) * s, 0];
}
/**
 * WHERE THE BOMB IS, `k` frames after it is thrown (null once it has gone off): in its lob (a high arc, from its mouth to just
 * short of where it was thrown), then its hop on to there, then sat there fizzing; how far it has tumbled; and whether it is
 * on the floor.
 */
export function bombAt(at: ShotAt, k: number): { p: V3; turn: number; down: boolean } | null {
  if (k < 0 || k >= BOMB_FX.boom) return null;
  const F = BOMB_FX.flight;
  const touch = touchOf(at);
  const r = 2.4;
  if (k <= F) {
    const u = k / F;
    const p = lerp(at.fired, [touch[0], touch[1], r], u);
    return { p: [p[0], p[1], p[2] + 4 * BOMB_FX.high * UNITS_PER_TILE * u * (1 - u)], turn: -0.5 + k * 0.62, down: k === F };
  }
  const h = k - F;
  if (h <= BOMB_FX.hop) {
    const u = h / BOMB_FX.hop;
    const p = lerp(touch, at.aim, 1 - (1 - u) * (1 - u));
    return { p: [p[0], p[1], r + 0.32 * UNITS_PER_TILE * 4 * u * (1 - u) * 0.6], turn: -0.5 + F * 0.62 + h * 0.4, down: u >= 1 };
  }
  // (sat there, fizzing, rocking a little)
  const sit = k - F - BOMB_FX.hop;
  return { p: [at.aim[0], at.aim[1], r], turn: -0.5 + F * 0.62 + BOMB_FX.hop * 0.4 + Math.sin(sit * 1.7) * 0.12, down: true };
}
/** How long after it is thrown a bomb's effects are all gone (frames): its flight, its beat, its blast. */
export function bombFxLong(): number {
  return BOMB_FX.boom + BOMB_FX.long;
}
/**
 * THE BLAST where a bomb goes off (`c`, on the floor), `k` frames on: a white flash; a ball of the friend's cyan fire boiling
 * up; a ring of light racing out over the floor to its full radius (BOMB_FX.blast tiles) in four frames, its dust rolling
 * after it; cyan shards and sparks flung out; stone and scraps of its iron flung up, falling and lying; a column of smoke; a
 * scorch left, its cracks glowing and cooling. All gone at BOMB_FX.long.
 */
export function bombBlast(ly: ShotLayers, S: (p: V3) => [number, number], c: V3, k: number, t: number, seed: number): void {
  if (k < 0 || k >= BOMB_FX.long) return;
  const R = BOMB_FX.blast * UNITS_PER_TILE;
  const [x, y] = S([c[0], c[1], 0]);
  const ring = (r: number): [number, number][] => {
    const pts: [number, number][] = [];
    const n = Math.max(24, Math.round(r * 0.9));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(S([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 0]));
    }
    return pts;
  };
  // (the scorch: ragged and black, its cracks glowing and cooling; fading away at the end)
  if (k >= 1) {
    const gone = Math.max(0, (k - (BOMB_FX.long - 10)) / 10);
    const sr = R * 0.4;
    for (let yy = -sr; yy <= sr; yy += 1) {
      for (let xx = -sr; xx <= sr; xx += 1) {
        const d = Math.hypot(xx, yy) / sr + (noise2((c[0] + xx) * 0.09 + seed, (c[1] + yy) * 0.09) - 0.5) * 0.55;
        if (d > 1 - gone) continue;
        const [px, py] = S([c[0] + xx, c[1] + yy, 0]);
        ly.floor.put(px, py, d < 0.45 ? 0 : d < 0.75 ? 1 : 2);
      }
    }
    const heat = k < 6 ? 3 : k < 14 ? 2 : k < BOMB_FX.long - 8 ? 1 : 0;
    if (heat > 0) {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + hash(seed + i) * 0.6;
        const len = sr * (0.75 + 0.5 * hash(seed * 3 + i)) * (1 - gone);
        for (let r = 2; r < len; r += 1) {
          const jag = (noise2(r * 0.14 + i * 5, seed) - 0.5) * 7;
          const [px, py] = S([c[0] + Math.cos(a) * r - Math.sin(a) * jag, c[1] + Math.sin(a) * r + Math.cos(a) * jag, 0]);
          ly.floorLit.put(px, py, r < len * 0.45 ? heat : Math.max(1, heat - 1));
        }
      }
    }
  }
  // (THE FLASH: a white round over it all, the first two frames)
  if (k < 2) {
    disc(ly.l, x, y - 10, k === 0 ? 24 : 17, 3, 0.75);
    const pts = ring(R * (k === 0 ? 0.55 : 0.8));
    pts.forEach(([ax, ay], i) => {
      const [bx, by] = pts[(i + 1) % pts.length];
      line(ly.l, ax, ay, bx, by, 3, 2);
    });
  }
  // (the ball of her cyan fire, boiling up and out, torn by noise, white at its heart, hollowing as it burns out)
  if (k < 8) {
    const Rd = 17 + 14 * (1 - Math.exp(-k / 1.4));
    const cy = y - 11 - k * 2.4;
    for (let yy = -Math.ceil(Rd * 1.3); yy <= Math.ceil(Rd * 0.8); yy++) {
      for (let xx = -Math.ceil(Rd * 1.3); xx <= Math.ceil(Rd * 1.3); xx++) {
        const n = noise2((x + xx) * 0.15 + seed, (cy + yy + t * 40) * 0.15) - 0.5;
        const d = Math.hypot(xx / 1.2, yy) / Rd + n * 0.6;
        if (d > 1) continue;
        if (k > 2 && d < (k - 2) / 5) continue;
        const v = 1 - d;
        ly.l.put(x + xx, cy + yy, v > 0.55 ? 3 : v > 0.28 ? 2 : 1);
      }
    }
  }
  // (tongues of her cyan fire licking up out of it, burning down)
  if (k >= 2 && k < 18) {
    const left = 1 - (k - 2) / 16;
    const tongues: [number, number, number][] = [[0, 0, 8], [-18, 4, 5.5], [18, 4, 5.5], [-9, -4, 4.5], [10, -3, 4.5], [-32, 9, 3.5], [32, 9, 3.5]];
    tongues.forEach(([dx, dy, size], i) => fire(ly.l, x + dx, y + dy - 3, size * left * (0.85 + 0.3 * hash(seed + i)), t + i * 0.37, dx * 0.015));
  }
  // (THE RING racing out over the floor to the blast's edge in four frames, light, and its dust rolling after it)
  if (k < 9) {
    const u = Math.min(1, (k + 1) / 4);
    const r = R * (1 - (1 - u) * (1 - u));
    const lv = k < 2 ? 3 : k < 5 ? 2 : 1;
    if (k < 7) {
      const pts = ring(r);
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        line(ly.l, ax, ay - 1, bx, by - 1, Math.max(1, lv - 1), 3);
        line(ly.l, ax, ay, bx, by, lv, 2);
      }
    }
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.2;
      const [px, py] = S([c[0] + Math.cos(a) * r * 0.96, c[1] + Math.sin(a) * r * 0.96, 0]);
      const rr = (3.5 + k * 0.8) * (0.8 + 0.4 * hash(seed * 5 + i));
      cloud(ly.sm, px, py, 2 * rr, 1.4 * rr, t + i * 0.2, Math.min(1, 0.1 + k / 9), 7100 + seed + i);
    }
  }
  // (THE FRIEND'S CYAN SPARKS AND SHARDS flung out of it; stone flung up, and scraps of its iron)
  impactBurst(ly.l, x, y - 12, k, seed, 2.4);
  impactBurst(ly.l, x, y - 4, k - 1, seed + 5, 1.6);
  if (k < 24) {
    chips(ly.stone, ly.l, x - 8, y, k, seed);
    chips(ly.stone, ly.l, x + 9, y + 1, k, seed + 3);
    for (let i = 0; i < 9; i++) {
      // (a scrap of its iron casing: a curved shard, flung and spinning, falling and lying)
      const a = hash(seed * 23 + i) * Math.PI * 2;
      const sp = 2.2 + 2.0 * hash(seed * 29 + i);
      const vx = Math.cos(a) * sp * 1.3;
      const vy = -3.6 - 3.0 * hash(seed * 31 + i);
      const land = y + Math.sin(a) * sp * 5 * 0.5;
      const g = 0.55;
      const tk = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, land - y))) / g;
      const kk = Math.min(k, tk);
      const sx = x + vx * kk;
      const sy = y - 6 + vy * kk + 0.5 * g * kk * kk;
      const spin = k < tk ? k * 0.9 + i : tk * 0.9 + i;
      const dx = Math.cos(spin) * 1.5;
      const dy = Math.sin(spin) * 1.5;
      line(ly.iron, sx - dx, sy - dy, sx + dx, sy + dy, k < tk ? 2 : 1, 1);
      ly.iron.put(sx, sy - 1, 3);
    }
  }
  // (its smoke: a column rolling up and out over it, thinning, gone by its end)
  if (k >= 2) {
    const left = (k - 2) / (BOMB_FX.long - 3);
    for (let i = 0; i < 6; i++) {
      const up = 7 + i * 6 + k * (0.85 + 0.12 * i);
      const wide = 9 + i * 2.3 + k * 0.45;
      const sway = Math.sin(t * 2 + i) * 3 + (hash(seed + i) - 0.5) * 12;
      cloud(ly.sm, x + sway, y - up, 2 * wide, 1.5 * wide, t + i * 0.3, Math.min(1, 0.02 + left * 1.05 + i * 0.03), 7600 + seed + i);
    }
  }
}

/**
 * EVERYTHING A BOMB THROW THROWS OFF at frame `f` of it (0 its start; on past CBOMB.end until its blast is gone), `t` the
 * scene's time: its fuse lit and spitting in its mouth; the thump of its throw; the bomb in flight, its hop, its fizzing
 * beat; and its blast.
 */
export function bombFx(ly: ShotLayers, at: ShotAt, f: number, t: number, seed = 0): void {
  const C = CBOMB;
  const k = f - C.fire;
  if (k < 0) {
    // (its fuse lit in its mouth, spitting her cyan sparks)
    if (at.fuse && f >= C.lit) {
      const [x, y] = at.S(at.fuse);
      fuseSparks(ly.l, x, y, f - C.lit, 11 + seed);
    }
    return;
  }
  // THE THROW: a flash of cyan and a puff of smoke out of its mouth; dust kicked up round its feet as it springs
  const m = at.S(at.fired);
  const [dx, dy] = onPicture(at.S, at.fired, at.way);
  mouthPuff(ly.l, ly.sm, m[0], m[1], dx, dy, k, t, 41 + seed);
  if (k < 3) disc(ly.l, m[0] + dx * 3, m[1] + dy * 3, k === 0 ? 7 : 4, 3);
  // (smoke curling out of its mouth as it settles)
  for (let j = 0; j < 3; j++) {
    const age = k - 6 - j * 5;
    if (age < 0 || age > 20 || f > C.end + 8) continue;
    const r = 1.6 + age * 0.25;
    const mm = at.S(at.mouth);
    cloud(ly.sm, mm[0] + Math.sin(age * 0.35 + j) * 2, mm[1] - 2 - age * 0.9, 2 * r, 1.6 * r, t + j, Math.min(1, 0.2 + age / 21), 9300 + j + seed);
  }
  // THE BOMB: smeared out of its mouth in a flash, then lobbed tumbling; its hop; sat fizzing
  const b = bombAt(at, k);
  if (b) {
    const [x, y] = at.S(b.p);
    if (k < 2) {
      // (THE SMEAR: after-images of it back along its way, the furthest dimmest)
      for (const back of [3, 2, 1]) {
        const p = bombAt(at, Math.max(0, k - back * 0.4));
        if (!p) continue;
        const [ax, ay] = at.S(p.p);
        disc(ly.l, ax, ay, BOMB_PX + 0.5, back === 1 ? 2 : 1);
      }
    }
    // (a thin trail of its fuse's smoke behind it)
    for (let j = 1; j <= 5 && k <= BOMB_FX.flight; j++) {
      const p = bombAt(at, Math.max(0, k - j * 1.2));
      if (!p) continue;
      const [ax, ay] = at.S(p.p);
      const r = 1.2 + j * 0.45;
      cloud(ly.sm, ax, ay - 2, 2 * r, 1.6 * r, t + j * 0.2, Math.min(1, 0.25 + j / 6), 9400 + j + seed);
    }
    const tip = bombSprite(ly, x, y, b.turn, true);
    // (its fuse spitting, harder as it burns down)
    fuseSparks(ly.l, tip[0], tip[1], k, 13 + seed);
    if (k > BOMB_FX.flight) fuseSparks(ly.l, tip[0], tip[1] - 1, k + 2, 17 + seed);
  }
  // (dust where it first comes down)
  {
    const [tx, ty] = at.S(touchOf(at));
    thud(ly.sm, tx, ty, k - BOMB_FX.flight, 3 + seed, 0.45);
  }
  // THE BLAST
  bombBlast(ly, at.S, at.aim, k - BOMB_FX.boom, t, 61 + seed);
}

// ---- THE ENERGY BOLT -------------------------------------------------------------------------------------------------

/** How many frames the bolt flies from its ball to what it hits. */
export function boltFlight(at: ShotAt): number {
  const d = Math.hypot(at.aim[0] - at.fired[0], at.aim[1] - at.fired[1]) / UNITS_PER_TILE;
  return Math.max(1, Math.round((d / BOLT_FX.speed) * 30));
}
/** How long after it fires a bolt's effects are all gone (frames): its flight, its crackle; its ball's smoke. */
export function boltFxLong(at: ShotAt): number {
  return Math.max(boltFlight(at) + BOLT_FX.crackle + 2, CBOLT.end - CBOLT.fire + 8);
}
/**
 * THE BOLT at (x, y), flying the way (dx, dy) on the picture: a spindle of light, white-hot at its heart, cyan round it,
 * pointed at both ends, little jags of lightning flicking off it; `seed` breaks them anew.
 */
export function boltSprite(l: Light, x: number, y: number, dx: number, dy: number, seed: number): void {
  const len = 9;
  const half = 3.4;
  for (let yy = -12; yy <= 12; yy++) {
    for (let xx = -12; xx <= 12; xx++) {
      const a = xx * dx + yy * dy;
      const s = -xx * dy + yy * dx;
      if (Math.abs(a) > len) continue;
      const w = half * Math.sqrt(1 - (a / len) * (a / len)) * (a > 0 ? 1 : 0.85);
      const q = Math.abs(s) / Math.max(0.5, w);
      if (q > 1) continue;
      l.put(x + xx, y + yy, q < 0.45 && Math.abs(a) < len * 0.7 ? 3 : q < 0.8 ? 2 : 1);
    }
  }
  for (let i = 0; i < 2; i++) {
    const at = (hash(seed * 3 + i) - 0.5) * len;
    const side = i ? 1 : -1;
    const x0 = x + dx * at - dy * half * side;
    const y0 = y + dy * at + dx * half * side;
    bolt(l, x0, y0, x0 - dx * (6 + 5 * hash(seed + i)) - dy * 4 * side, y0 - dy * (6 + 5 * hash(seed + i)) + dx * 4 * side, seed * 7 + i, 1);
  }
}
/**
 * EVERYTHING AN ENERGY SHOT THROWS OFF at frame `f` of it (0 its start; on past CBOLT.end until all is gone), `t` the
 * scene's time: arcs crawling up its coil and light drawn into its ball as it charges; the glint at its full; the flash as
 * it fires; the bolt, smeared, flying; its crackling hit; its ball spitting and smoking as it cools.
 */
export function boltFx(ly: ShotLayers, at: ShotAt, f: number, t: number, seed = 0): void {
  const C = CBOLT;
  const k = f - C.fire;
  const ball = at.S(at.mouth);
  if (k < 0) {
    const c = Math.min(1, f / C.full);
    // (arcs crawling up its coil, up as far as it is charged, broken anew each frame)
    if (at.coil && c > 0) {
      const a = at.S(at.coil[0]);
      const b = at.S(at.coil[1]);
      const n = 1 + Math.round(2 * c);
      for (let i = 0; i < n; i++) {
        const q = ((f * 0.23 + i / n) % 1) * c;
        const px = a[0] + (b[0] - a[0]) * q;
        const py = a[1] + (b[1] - a[1]) * q;
        const nx = -(b[1] - a[1]);
        const ny = b[0] - a[0];
        const nl = Math.hypot(nx, ny) || 1;
        const side = (i + f) % 2 ? 1 : -1;
        bolt(ly.l, px + (nx / nl) * 3 * side, py + (ny / nl) * 3 * side, px - (nx / nl) * 2 * side + (b[0] - a[0]) * 0.2, py - (ny / nl) * 2 * side + (b[1] - a[1]) * 0.2, 300 + f * 7 + i + seed, 1);
      }
    }
    // (light drawn into its ball: a halo growing, motes spiralling in, crackling round it)
    if (c > 0.15) {
      disc(ly.l, ball[0], ball[1], 1.5 + 2.2 * c, c > 0.6 ? 3 : 2);
      const m = Math.round(2 + 5 * c);
      for (let i = 0; i < m; i++) {
        const q = ((f / C.full) * 1.5 + i / m) % 1;
        const a0 = hash(seed + i * 5) * Math.PI * 2 + q * 2;
        const r = (7 + 11 * hash(seed * 3 + i)) * (1 - q);
        const px = ball[0] + Math.cos(a0) * r;
        const py = ball[1] + Math.sin(a0) * r * 0.8;
        ly.l.put(px, py, q > 0.5 ? 2 : 1);
        ly.l.put(px + 1, py, q > 0.5 ? 2 : 1);
      }
      if (c > 0.6) crackle(ly.l, ball[0], ball[1], 4 + 4 * c, 1 + Math.round(c), 900 + f + seed);
    }
    // (THE GLINT at its full: a star of light, its long arms across and up and down)
    const g = f - C.full;
    if (g >= 0) {
      const big = g === 0 ? 1 : 0.7;
      disc(ly.l, ball[0], ball[1], 4.5 * big, 3);
      for (const [ax, ay, L] of [[1, 0, 16], [-1, 0, 16], [0, 1, 11], [0, -1, 11], [0.7, 0.7, 6], [-0.7, 0.7, 6], [0.7, -0.7, 6], [-0.7, -0.7, 6]] as const) {
        line(ly.l, ball[0], ball[1], ball[0] + ax * L * big, ball[1] + ay * L * big, 2, 1);
        line(ly.l, ball[0], ball[1], ball[0] + ax * L * 0.5 * big, ball[1] + ay * L * 0.5 * big, 3, 1);
      }
    }
    return;
  }
  // THE SHOT: a flash at its ball, a ring of light blown out round it
  const fired = at.S(at.fired);
  const [dx0, dy0] = onPicture(at.S, at.fired, at.way);
  if (k < 3) {
    const big = [1, 0.7, 0.4][k];
    disc(ly.l, fired[0] + dx0 * 2, fired[1] + dy0 * 2, 7 * big, 3);
    for (let i = 0; i < 7; i++) {
      const a = Math.atan2(dy0, dx0) + ((i / 6) * 2 - 1) * 1.1;
      const L = (8 + 10 * (1 - Math.abs((i / 6) * 2 - 1))) * big;
      line(ly.l, fired[0], fired[1], fired[0] + Math.cos(a) * L, fired[1] + Math.sin(a) * L, 2, 1);
    }
    if (k < 2) {
      const R = 6 + k * 6;
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2;
        ly.l.put(fired[0] + dx0 * 4 + Math.cos(a) * R * 0.4 * dx0 - Math.sin(a) * R * dy0, fired[1] + dy0 * 4 + Math.cos(a) * R * 0.4 * dy0 + Math.sin(a) * R * dx0, k ? 1 : 2);
      }
    }
  }
  // THE BOLT: straight and fast to what it is aimed at, smeared back along its way, a fading trail behind it
  const n = boltFlight(at);
  const end = at.S(at.aim);
  const ux = end[0] - fired[0];
  const uy = end[1] - fired[1];
  const ul = Math.hypot(ux, uy) || 1;
  const dx = ux / ul;
  const dy = uy / ul;
  if (k < n) {
    const u = Math.min(1, (k + 1) / (n + 0.5));
    const x = fired[0] + ux * u;
    const y = fired[1] + uy * u;
    // (its trail: from where it was two frames ago to it, thinning)
    const u0 = Math.max(0, (k - 1) / (n + 0.5));
    line(ly.l, fired[0] + ux * u0, fired[1] + uy * u0, x, y, 1, 3);
    line(ly.l, fired[0] + ux * (u0 + u) * 0.5, fired[1] + uy * (u0 + u) * 0.5, x, y, 2, 1);
    // (THE SMEAR: after-images of it back along its way)
    for (const [back, lv] of [[0.55, 1], [0.3, 2]] as const) {
      const ub = Math.max(0, u - back / (n + 0.5));
      disc(ly.l, fired[0] + ux * ub, fired[1] + uy * ub, 3, lv);
    }
    boltSprite(ly.l, x, y, dx, dy, 70 + k + seed);
  }
  // WHAT IT HITS: a flash, shards and sparks flung off it, and it crawls with lightning a while
  const h = k - n;
  if (h >= 0) {
    if (h < 2) disc(ly.l, end[0], end[1], h === 0 ? 8 : 5, 3);
    impactBurst(ly.l, end[0], end[1], h, 31 + seed, 1.2);
    if (h < BOLT_FX.crackle) crackle(ly.l, end[0], end[1] + 4, 16, h < 6 ? 4 : 2, 500 + h * 3 + seed);
    if (h < 4) for (let i = 0; i < 3; i++) bolt(ly.l, end[0], end[1], end[0] + dx * (10 + 8 * hash(h + i)) + (hash(h * 3 + i) - 0.5) * 24, end[1] + 14 + (hash(h * 5 + i) - 0.5) * 10, 610 + h * 9 + i + seed, h < 2 ? 0 : 1);
  }
  // (its ball spitting and smoking as it cools)
  if (k > 1 && k < 14 && k % 3 === 0) crackle(ly.l, ball[0], ball[1], 5, 1, 1200 + f + seed);
  for (let j = 0; j < 2; j++) {
    const age = k - 2 - j * 5;
    if (age < 0 || age > 16) continue;
    const r = 1.4 + age * 0.22;
    cloud(ly.sm, ball[0] + Math.sin(age * 0.4 + j) * 2, ball[1] - 2 - age * 0.8, 2 * r, 1.6 * r, t + j, Math.min(1, 0.25 + age / 17), 9500 + j + seed);
  }
}
