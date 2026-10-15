// FLOOR 8'S SMALL MOBS, THE DUST DEVILS OF ECHO CANYON: a mock-up (nothing of the game imports this file; `DEVIL_ON`
// is off).
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (15 Oct, the first four by 08:51, the rest by
// 09:00, each his pick, the labels as he tapped them): what it is, “Red sand whirlwind, a cult bell inside
// (Recommended)”; how big, “Waist-high, thin and tall (Recommended)”; how it moves, “Weaving, never still
// (Recommended)”; its one attack, “Lashes you with a whip of sand (Recommended)”; how it dies, “The wind dies, the bell
// drops and cracks (Recommended)”; when it is hit, “Flickers and stutters” (not the recommended pick); what it must not
// look like, “Not a cartoon tornado with a face (Recommended)”; its sound (sound rule 7), “Howling wind, hissing sand,
// its bell (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its bell's glow and its edge are the enemy's pink
// while it lives, and nothing cyan; its sand the canyon's red rock, but darker and bolder than the pale floor it spins
// on (Colour 5: “Neon on dark”), so it reads against it; no face and no eyes: its bell's glow is all the face it has;
// it has no feet, so it glides, and it weaves in its own swaying as well as in how the game steers it.
//
// NOT ON THE HEROES' BONES: a whirlwind has none. It is painted from its own solids, as the scorpion is
// (art/canyon_scorpions.ts), in the same painter (art/new_mobs3.ts's paintBits): bands of its sand wound round it,
// rising as they go round; its bell tumbling in the hollow at its heart; grit flung round it.
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its stand: never still, spinning, its sand rising, swaying and weaving where it stands.

import type { Px, Sprite } from '../engine/px';
import type { ActorArt, AnimSet } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const DEVIL_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const u = cl01(v);
  return u * u * (3 - 2 * u);
};
const fr = (t: number): number => t - Math.floor(t);
const TAU = Math.PI * 2;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: the canyon's red rock ground to dust, but darker and hotter than the pale sand of the floor (Colour 5:
// “Neon on dark”; never mud-brown all over): the near side of its sand a deep rust-red lit to hot orange where the
// light falls; the far side, seen through the gaps, nearly black-red, and where its bell lights it from inside, the
// cult's pink; its bell old bronze, its mouth burning the cult's pink to gold (FLAME); grit dark and pale. Nothing cyan.

const DUST: Ramp = ['#2a0a10', '#5a1414', '#9a2a1a', '#d4502a', '#ff8a40'];
const DEEP: Ramp = ['#10050a', '#1e0910', '#33111a', '#4c1a22', '#66282a'];
const HEART: Ramp = ['#2a0818', '#4a0e2c', '#7c1846', '#b42a60', '#e64c86'];
const BRONZE: Ramp = ['#3a1c08', '#7a4410', '#c07a1a', '#f0b030', '#fff0a0'];
const GRIT = ['#2a0c0e', '#5a1e16', '#e8a868', '#ffdca0'] as const;

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high; his waist is about 30 up). x forward, y left, z up; its foot
// on the floor at the origin.

/** How high its funnel stands: waist-high to the knight, and thin. */
const DD_HIGH = 32;
/** Its funnel's girth: a thin neck on the floor, widening as it rises; its top spilling out. */
const R_FOOT = 1.2;
const R_TOP = 8.2;
/** How many bands of its sand are wound round it at once. */
/** How far up its funnel its bell tumbles (a share of its height). */
const BELL_UP = 0.46;
/** Its bell: how long from its crown to its mouth, and how wide its mouth. */
const BELL_LONG = 9.6;
const BELL_MOUTH = 4.8;

/** Its stand: sixteen frames a second, a round of 1.5 s; never still. */
export const DD_STAND = { frames: 24, fps: 16, period: 1.5 } as const;

/** The canvas it is painted on, and its floor point on it. */
export const DD_CANVAS = { w: 180, h: 150, ax: 90, ay: 110 };
/** Its pool of light while it lives (the enemy's pink, faint, round its bell). */
const DD_AURA = { x: DD_CANVAS.ax, y: DD_CANVAS.ay - 14, r: 26, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

/** One moment of it. */
interface DdPose {
  /** Its foot on the floor, forward and to its left. */
  x: number;
  y: number;
  /** How high its funnel stands, and its girth (1 as it stands). */
  high: number;
  girth: number;
  /** Where its top has swayed to (forward, left), and the snaking up its length: how far, and where along it. */
  top: [number, number];
  snake: number;
  snakeAt: number;
  /** How far round its sand has spun (radians, its left way round, seen from above), and how far up it has flowed (in heights). */
  spin: number;
  rise: number;
  /** How much of its sand there is (1 all; 0 none). */
  sand: number;
  /** Its bell: where it is from its funnel's middle at its height, which way its mouth faces, and how bright it burns (0 out). */
  bellOff: V3;
  bellDown: V3;
  burn: number;
  /** Still living: its pink edge is painted round it. */
  alive: boolean;
  /** Grit and flung sand laid over its picture (each its place, colour and size); lights of its bell. */
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

/** The middle of its funnel at `h` (a share of its height). */
function middleAt(P: DdPose, h: number): V3 {
  const k = Math.pow(cl01(h), 1.4);
  const s = P.snake * Math.sin(TAU * 1.1 * h - P.snakeAt) * h;
  const c = P.snake * Math.cos(TAU * 1.1 * h - P.snakeAt) * h;
  return [P.x + P.top[0] * k + s, P.y + P.top[1] * k + 0.7 * c, h * P.high];
}
/** Its funnel's girth at `h`: a thin neck on the floor widening as it rises, its top spilling out. */
function girthAt(P: DdPose, h: number): number {
  const spill = 1.4 * Math.pow(sm((h - 0.8) / 0.25), 2);
  return P.girth * (R_FOOT + (R_TOP - R_FOOT) * Math.pow(cl01(h), 1.1) + spill);
}

/** Its stand: it never stops spinning, its sand rising up it; it sways, its top wandering and a snake running up it; its foot weaves on the spot; its bell tumbles in its heart. */
function standPose(t: number): DdPose {
  const ph = fr(t / DD_STAND.period);
  const a = TAU * ph;
  return {
    x: 1.0 * Math.sin(a),
    y: 1.4 * Math.sin(2 * a),
    high: DD_HIGH * (1 + 0.03 * Math.sin(2 * a + 0.6)),
    girth: 1 - 0.035 * Math.sin(2 * a + 0.6),
    top: [2.4 * Math.sin(a + 1.3), 3.0 * Math.sin(2 * a + 0.4)],
    snake: 1.3,
    snakeAt: 2 * a,
    spin: TAU * 2 * ph,
    rise: ph,
    sand: 1,
    bellOff: [0.9 * Math.cos(a), 0.9 * Math.sin(a), 0.6 * Math.sin(2 * a)],
    bellDown: norm([0.45 * Math.sin(2 * a), 0.45 * Math.cos(a + 0.5), -1]),
    burn: 1 + 0.25 * Math.sin(3 * a),
    alive: true,
    chips: [],
    flares: [],
  };
}

function poseOf(which: string, t: number): DdPose {
  return standPose(t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

/** A ring of its sand: where its streaks start round, how far round each goes, how thick they are, and how much they climb as they go. */
function bandOf(i: number): { from: number; arc: number; thick: number; climb: number } {
  return {
    from: i * 2.39996 + hash(i, 1, 51) * 0.8,
    arc: (LOOK.arc[0] + LOOK.arc[1] * hash(i, 2, 51)) * (Math.PI / 180),
    thick: LOOK.thick[0] + LOOK.thick[1] * hash(i, 3, 51),
    climb: LOOK.climb[0] + LOOK.climb[1] * hash(i, 4, 51),
  };
}
/** How its sand is wound (for trying looks): rings up it, streaks to a ring, each streak's arc (degrees), thickness, climb (in heights), and whether its far wall is painted. */
export const LOOK = { rings: 8, streaks: 2, arc: [170, 60], thick: [1.3, 0.4], climb: [0.14, 0.06], wall: false, farTop: 0.2 };

/** THE DUST DEVIL AS SOLIDS: the streaks of its sand (the near side, a ring to a part; the far side as one, dark, lit pink by its bell), the light of its bell behind it, its bell. `eye`: the way to the eye. */
function devilBits(P: DdPose, put: Put, eye: V3): void {
  const flat = norm([eye[0], eye[1], 0], [1, 0, 0]);
  // its sand: rings of streaks up it, each streak sweeping round its left way (seen from above), rising a little as
  // it goes; the rings flowing up it and spilling off its top; thinnest at their ends, thinned to nothing at its foot
  // and its top
  const bellH = BELL_UP;
  for (let i = 0; i < LOOK.rings; i++) {
    const b = bandOf(i);
    const h0 = fr(i / LOOK.rings + P.rise);
    for (let a = 0; a < LOOK.streaks; a++) {
      const K = 12;
      let prev: { p: V3; r: number; near: boolean } | null = null;
      for (let k = 0; k <= K; k++) {
        const s = k / K;
        const h = h0 + s * b.climb;
        const th = P.spin + b.from + (a * TAU) / LOOK.streaks + s * b.arc;
        const out: V3 = [Math.cos(th), Math.sin(th), 0];
        const g = girthAt(P, h);
        const p0 = add(middleAt(P, h), mul(out, g));
        const facing = dot(out, flat);
        const near = facing > -0.05;
        // (thin at its ends, and fading in off the floor and out at its top)
        let r = b.thick * Math.pow(Math.sin(Math.PI * s), 0.55) * sm(h / 0.07) * (1 - sm((h - 0.82) / 0.16)) * P.sand;
        // (a window before its bell: the streaks passing before it there are thinned away, so the bell is seen)
        if (near) r *= 1 - (1 - sm((Math.abs(h - bellH) - 0.1) / 0.08)) * sm((facing - 0.1) / 0.35);
        // (its far side thinner toward its top, so that its open top is not a lid)
        else r *= 1 - (1 - LOOK.farTop) * sm((h - 0.55) / 0.3);
        // (never into the rock)
        const p: V3 = [p0[0], p0[1], Math.max(p0[2], r)];
        if (prev && prev.r > 0.25 && r > 0.25) {
          const bothNear = prev.near && near;
          const ramp = bothNear ? DUST : Math.abs(h - bellH) < 0.2 && P.burn > 0.2 ? HEART : DEEP;
          put(bothNear ? `band${i}` : 'far', bothNear ? `band${i}.${a}.${k}` : `far${i}.${a}.${k}`, { k: 'rod', a: prev.p, b: p, ra: prev.r, rb: r, ramp });
        }
        prev = { p, r, near };
      }
    }
  }
  // the far wall of its hollow, dark, seen between its bands, and lit the cult's pink by its bell inside it: rings of
  // it up its length, set back from its middle away from the eye (so that its bell is before it)
  const side = norm(cross([0, 0, 1], flat), [0, 1, 0]);
  const W = 12;
  for (let k = 0; k < (LOOK.wall ? W : 0); k++) {
    const h = (k + 0.5) / W;
    if (h > 0.74) break;
    const g = girthAt(P, h) * 0.8 * Math.min(1, P.sand * 1.4);
    if (g < 0.6) continue;
    const c = sub(middleAt(P, h), mul(flat, g * 0.6));
    const lit = P.burn > 0.2 && Math.abs(h - bellH) < 0.26;
    const wall: Skin = (u, tone) => (lit && u[2] < 0.45 ? HEART : DEEP)[Math.max(0, Math.min(4, tone - (u[2] > 0.45 ? 1 : 0)))];
    put('wall', `wall${k}`, { k: 'ball', c: [c[0], c[1], Math.max(c[2], 1.6)], ax: [mul(flat, g * 0.45), mul(side, g * 0.98), [0, 0, (P.high / W) * 0.9]], skin: wall });
  }
  // the light of its bell on the far side of its hollow, behind it: a glow of the cult's pink round it
  if (P.burn > 0.2) {
    const side = norm(cross([0, 0, 1], flat), [0, 1, 0]);
    const g = girthAt(P, bellH);
    const c = sub(add(middleAt(P, bellH), P.bellOff), mul(flat, g * 0.75));
    const hot: Skin = (u, tone) => HEART[Math.max(2, Math.min(4, tone + (P.burn > 0.9 ? 1 : 0)))];
    put('heart', 'heart', { k: 'ball', c, ax: [mul(flat, g * 0.3), mul(side, g * 0.95), [0, 0, BELL_LONG * 0.95]], skin: hot });
  }
  // its bell: old bronze, tumbling in the hollow at its heart, its mouth burning the cult's pink
  bellBits(P, put);
}

/** ITS BELL: a crown and its loop, the bell flaring to its mouth, the mouth's rim, the pink burning inside it, and its clapper. */
function bellBits(P: DdPose, put: Put): void {
  const c = add(middleAt(P, BELL_UP), P.bellOff);
  const down = norm(P.bellDown, [0, 0, -1]);
  const e1 = norm(cross(down, [1, 0, 0]), [0, 1, 0]);
  const e2 = norm(cross(down, e1));
  const crown = add(c, mul(down, -BELL_LONG * 0.5));
  // the loop it hung by
  put('bell', 'loop', { k: 'rod', a: add(crown, mul(down, -0.4)), b: add(crown, mul(down, -1.6)), ra: 0.7, rb: 0.7, ramp: BRONZE });
  const burning: Skin = () => (P.burn > 0.3 ? FLAME[P.burn > 1.2 ? 3 : 2] : '#120a14');
  for (let k = 0; k <= 7; k++) {
    const t = k / 7;
    const at = add(crown, mul(down, t * BELL_LONG));
    const r = BELL_MOUTH * (0.42 + 0.22 * t + 0.36 * Math.pow(t, 4));
    put('bell', `bell${k}`, { k: 'ball', c: at, ax: [mul(e1, r), mul(e2, r), mul(down, 0.8)], skin: k === 7 ? burning : BRONZE });
  }
  // its clapper, hanging just out of its mouth
  put('bell', 'clapper', { k: 'ball', c: add(crown, mul(down, BELL_LONG + 0.7)), ax: [[0.9, 0, 0], [0, 0.9, 0], [0, 0, 0.9]], skin: BRONZE });
  if (P.burn > 0.3) put('glow', 'glow', { k: 'glow', p: add(crown, mul(down, BELL_LONG)), c: FLAME[2], r: 12 + 6 * Math.min(1.5, P.burn), a: 0.3 + 0.2 * Math.min(1, P.burn) });
}

/** GRIT flung round it as it spins: dark specks and pale ones, rising with its sand, a few pebbles among them. */
function gritOf(P: DdPose): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const n = Math.round(22 * P.sand);
  for (let j = 0; j < n; j++) {
    const h = fr(j / 22 + P.rise * (0.8 + 0.4 * hash(j, 1, 57)) + hash(j, 2, 57));
    const th = P.spin * (1.1 + 0.3 * hash(j, 3, 57)) + hash(j, 4, 57) * TAU;
    const g = girthAt(P, h) + 1.4 + 2.6 * hash(j, 5, 57);
    const m = middleAt(P, h);
    const pebble = j % 4 === 0 && hash(j, 6, 57) < 0.3;
    out.push([[m[0] + Math.cos(th) * g, m[1] + Math.sin(th) * g, Math.max(1, m[2])], GRIT[j % 4], pebble ? 4 : 2]);
  }
  // (the dust it whirls along the floor round its foot: a ring of grains skimming the sand, wider than its neck)
  const foot = middleAt(P, 0);
  const m = Math.round(16 * P.sand);
  for (let j = 0; j < m; j++) {
    const th = P.spin * 1.25 + (j / 16) * TAU + 0.3 * hash(j, 1, 59);
    const g = (4.5 + 4 * hash(j, 2, 59)) * P.girth;
    const z = 0.6 + 2.2 * hash(j, 3, 59);
    out.push([[foot[0] + Math.cos(th) * g, foot[1] + Math.sin(th) * g, z], j % 3 === 0 ? GRIT[2] : j % 3 === 1 ? DUST[2] : DUST[3], 2]);
  }
  return out;
}

/** One frame of the dust devil: `which` (stand, for now), `t` seconds in, from in front or behind. */
export function devilPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, DD_CANVAS.ax, DD_CANVAS.ay, DD_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  devilBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, st.eye);
  const lights = paintBits(st, bits, [P.x, P.y, 12]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  // its grit: laid over it where it flies before it; behind it, only where nothing of it is
  const mid = middleAt(P, 0.5);
  const flat = norm([st.eye[0], st.eye[1], 0], [1, 0, 0]);
  for (const [pt, col, size] of gritOf(P)) {
    const before = dot(sub(pt, mid), flat) > 0;
    laid(px, st, pt, col, size, !before);
  }
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size, false);
  return { px, lights };
}
/** A grain laid on a finished picture (after its pink edge, so that it stays its own colour), on whole game pixels; `behind`: only where nothing is painted. */
function laid(px: Px, st: Stage, p: V3, col: string, size: number, behind: boolean): void {
  const [x, y] = st.at(p);
  const xi = 2 * Math.round((x - size / 2) / 2);
  const yi = 2 * Math.round((y - size / 2) / 2);
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const X = xi + dx;
      const Y = yi + dy;
      if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
      if (behind && px.d[(Y * px.w + X) * 4 + 3] > 0) continue;
      px.set(X, Y, col);
    }
  }
}
/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function devilFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(devilPainted(which, t, view), which === 'dying' ? null : DD_AURA, DD_CANVAS.ax, DD_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function devilSolids(which: string, t: number, eye: V3 = [1, -1, 1]): Bit[] {
  const bits: Bit[] = [];
  devilBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, norm(eye));
  return bits;
}

/** THE DUST DEVIL, as the game holds a monster's pictures (for now its stand, for its look). */
export function makeDevilArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => devilFrame(which, t, view);
    const idle = lazyFrames(DD_STAND.frames, (i) => frame('stand', i / DD_STAND.fps));
    return { idle, walk: idle, attack: idle.slice(0, 3), idleFps: DD_STAND.fps, walkFps: DD_STAND.fps };
  };
  return { front: set('front'), back: set('back') };
}
