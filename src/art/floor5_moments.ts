// THE FLESHMANCER'S LAIR: ITS MOMENTS AROUND THE HERO (a mock-up; nothing of the game imports it).
//
// His idea, 10 Oct, 07:52: “I’d also like a couple environmental things happening around you for
// immersion unique for each floor.  Something shifts above you and dust comes down, you spook a pack of
// birds and they fly off,  a root shrivels as you walk by.  That sort of stuff”. Each checked against his
// rulebook's Animations 1 before he sees it: “as big and wild and kinetic and weighty as possible.  I’d
// rather it be a notch too high than a notch too low.”
//
// Three, each of the lair and unlike the twelve of the floors above (floor 1: the wall gives way, rats
// bolt, the candles gutter; floor 2: the ravens, the bell, the gibbet; floor 3: the chains pull, the
// ball falls, the bars shake; floor 4: the skull wall spills, the cart runs, the bones stir):
//   THE ROOF COMES IN: the mine's own danger, and his own example: a pit prop holding up the roof bows,
//     splinters and snaps, and the roof comes down on the floor out of the dark above.
//   THE WINCH RUNS WILD: the miners' winding drum at the winze, left with its kibble hanging: its brake
//     slips, the kibble drops away down the winze, the drum spins wild, and the kibble strikes far below.
//   THE RIFT BREATHES: the ancient power the cult found: the crack in the floor heaves, its lips break
//     and fall into it, and its light flares up pink out of the deep, then sinks.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { DIRT, ROCK, TIMBER } from './crypt';
import { BEYOND, fastBlit } from './floorkit';
import type { Moment, Track } from './floorkit';
import { Scene, XYZ, body, cloud, copyBody, facetOf, letGo, paintClouds, stepBodies, timberFace, toneAt, trackAt } from './floor4';
import type { Body, Cloud, V3 } from './floor4';
import { RIFT_LEN, WINCH, paintWinch, riftAt, riftHalf, riftMid } from './floor5';
import { LAIR_ROCK } from './lair';
import { GRAIN, compose, hash, mix } from './kit';
import type { Ramp } from './kit';
import { EMBER } from './props';

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const norm = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));
const ease = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};
const ID: (a: number, b: number, z: number) => V3 = (a, b, z) => [a, b, z];

const BOULDER: Ramp = ['#16122a', LAIR_ROCK[0], LAIR_ROCK[2], LAIR_ROCK[3], '#5e5478'];
const HEAP_EARTH: Ramp = [DIRT[0], DIRT[1], DIRT[2], DIRT[3], '#3e3048'];
const TIMBER_DIM: Ramp = [TIMBER[0], TIMBER[1], TIMBER[2], TIMBER[3], TIMBER[3]];
/** The enemy's pink, his fire's (art/mkit.ts, FLAME), from its dark to burning. */
const FIRE = ['#7a1058', '#c0206a', '#ff4f8a', '#ffb070'] as const;
/** The rift's light far down in it, never still: each of its tones and the one it flickers to. */
const SHIMMER = new Map<string, string>([['#560e40', '#7a1058'], ['#7a1058', '#560e40'], ['#c0206a', '#7a1058'], ['#ff4f8a', '#c0206a'], ['#ffb070', '#ff4f8a']]);
void ROCK;

/** The dark taking what is high over the floor (as the walls fade, art/ground.ts): over 56 mixed toward it in steps, nothing over 98; what gives off light left as it is. */
function intoTheDark(S: Scene, keep: Set<string> = new Set(EMBER)): void {
  for (let i = 0; i < S.id.length; i++) {
    if (S.id[i] < 0) continue;
    const z = S.hz[i];
    if (z <= 56) continue;
    const x = i % S.p.w;
    const y = Math.floor(i / S.p.w);
    if (z > 98) {
      S.p.erase(x, y);
      S.id[i] = -1;
      continue;
    }
    const c = S.p.get(x, y)!;
    if (keep.has(c)) continue;
    S.p.set(x, y, mix(c, BEYOND, z < 64 ? 0.2 : z < 72 ? 0.42 : z < 80 ? 0.66 : 0.9));
  }
}
/** How much of a thing at height `z` (its reach `r`) is out of the dark: 1 under 56, falling to 0 by 98. */
const outOfDark = (z: number, r: number): number => clamp01((98 - (z - r)) / (98 - 56 + 2 * r));

/** The pixels a sprite was painted from (the kit's sprites keep their picture on `px`, or are drawn from a canvas). */
const PAINTED = new WeakMap<Sprite, Px>();
const pixelsOf = (s: Sprite): Uint8ClampedArray | null => PAINTED.get(s)?.d ?? null;
/** A frame's sprite, its pixels kept for settleEnd. */
function framed(p: Px, ax: number, ay: number): Sprite {
  const s = p.sprite(ax, ay, GRAIN);
  PAINTED.set(s, p);
  return s;
}
/**
 * A MOMENT ENDS WHEN ALL IS STILL: the frames after the last that changes are cut off (they would be a
 * stall), so that it is always moving to its last frame and its last frame is what is left.
 */
function settleEnd(frames: Sprite[], tracks: Track[]): void {
  const same = (a: Sprite, b: Sprite): boolean => {
    const p = pixelsOf(a);
    const q = pixelsOf(b);
    if (!p || !q || p.length !== q.length || a.w !== b.w) return false;
    let d = 0;
    for (let i = 0; i < p.length; i += 4) if (p[i] !== q[i] || p[i + 1] !== q[i + 1] || p[i + 2] !== q[i + 2] || p[i + 3] !== q[i + 3]) d++;
    return d < 6;
  };
  while (frames.length > 20 && same(frames[frames.length - 1], frames[frames.length - 2])) frames.pop();
  for (const t of tracks) t.at.length = Math.min(t.at.length, frames.length);
}

/** A rock, painted: an egg of facets turned as it tumbles. */
function paintRock(S: Scene, b: Body, ramp: Ramp, id: number): void {
  const A = norm(b.F);
  const Bv = norm(Math.abs(A[2]) > 0.9 ? [1, 0, 0] : [A[1], -A[0], 0]);
  const C: V3 = [A[1] * Bv[2] - A[2] * Bv[1], A[2] * Bv[0] - A[0] * Bv[2], A[0] * Bv[1] - A[1] * Bv[0]];
  S.egg(b.p, [A, Bv, C], [b.r * 1.2, b.r * 0.9, b.r * 0.75], facetOf(ramp, 0.03), id);
}

/** A TONGUE OF HIS FIRE: as floorkit's flame, but the enemy's pink, burning to gold at its heart (his Colour 3); its rows joined, so that leaning it bends and never breaks. */
function pinkFlame(p: Px, x: number, base: number, h: number, w: number, lean: number): void {
  let prev = x;
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.2 + t * 0.8)) ** 0.8 * (1 - t * 0.3));
    const m = x + lean * t * t;
    let x0 = Math.floor(m - hw);
    let x1 = Math.ceil(m + hw);
    x0 = Math.min(x0, Math.round(prev));
    x1 = Math.max(x1, Math.round(prev) + 1);
    for (let xx = x0; xx < x1; xx++) {
      const d = Math.abs(xx + 0.5 - m) / hw;
      p.set(xx, base - i, d < 0.45 && t < 0.4 ? FIRE[3] : d < 0.8 && t < 0.7 ? FIRE[2] : t > 0.84 ? FIRE[0] : FIRE[1]);
    }
    prev = m;
  }
}

/** Sparks: short slanting streaks of an honest fire (or his pink), each `life` frames long. */
interface Spark { f0: number; p: V3; v: V3; life: number; pink?: boolean }
const sparkAt = (s: Spark, k: number): V3 => [s.p[0] + s.v[0] * k, s.p[1] + s.v[1] * k, Math.max(0.5, s.p[2] + s.v[2] * k - 0.5 * k * k)];
function paintSparks(fire: Px, sparks: readonly Spark[], f: number, ax: number, ay: number): void {
  const at = (w: V3): [number, number] => [Math.round(ax + (w[0] - w[1]) * 0.8), Math.round(ay + (w[0] + w[1]) * 0.4 - w[2])];
  for (const s of sparks) {
    const k = f - s.f0;
    if (k < 0 || k >= s.life) continue;
    const [x0, y0] = at(sparkAt(s, Math.max(0, k - 0.9)));
    const [x1, y1] = at(sparkAt(s, k));
    if (![x0, y0, x1, y1].every(Number.isFinite)) continue;
    const c = s.pink ? (k < 2 ? FIRE[3] : k < s.life - 2 ? FIRE[2] : FIRE[1]) : k < 2 ? EMBER[4] : EMBER[3];
    fire.line(x0, y0, x1, y1, c);
    if (x0 === x1 && y0 === y1) fire.set(x1, y1 - 1, c);
  }
}

// -------------------------------------------------------------------------------------------------

/**
 * THE ROOF COMES IN. A pit prop stands holding the roof up, up into the dark (`before`). It creaks: grit
 * trickles down beside it out of the dark, it shudders, dust puffing off its head; it bows, bending out
 * at its middle, splinters lifting. IT SNAPS (the first jolt): its foot kicks out and falls, splinters
 * fly, its upper half drops out of the dark with the roof: earth pours down in a torrent, rocks crash out
 * of the dark onto the floor, bouncing and rolling away; a great slab of the roof strikes (the second
 * jolt), bouncing; the earth heaps up and slides; the dust billows out and hangs, settles; a last rock
 * drops long after (the third jolt) and rolls; the trickle thins and stops. What is left: a heap of earth
 * and rocks, the prop's halves lying, rocks rolled out across the floor (`after`). Anchored at the middle
 * of the prop's tile.
 */
function roofComesIn(): Moment {
  const MW = 420;
  const MH = 320;
  const ax = 210;
  const ay = 220;
  const SNAP = 44;
  const N = 170;
  const PROP_H = 130;
  const BREAK = 50;
  // the heap the earth builds, and how high it is at (x, y) on frame f
  const HX = 4;
  const HY = 6;
  const heapH = (f: number): number => 28 * ease((f - SNAP - 2) / 34) + 5 * ease((f - SNAP - 50) / 30);
  const HRX = 48;
  const HRY = 40;
  /** How far the heap spreads, as it builds: from a little mound where the earth first strikes, out to its whole width. */
  const spread = (f: number): number => 0.18 + 0.82 * ease((f - SNAP - 3) / 26);
  const groundOf = (f: number) => (x: number, y: number): number => heapH(f) * Math.sqrt(Math.max(0, 1 - ((x - HX) / (HRX * spread(f))) ** 2 - ((y - HY) / (HRY * spread(f))) ** 2));
  // THE ROCKS: out of the dark, each at its own time and place, a big slab among them, a last one long after
  const rocks: { f0: number; b: Body; ramp: Ramp }[] = [];
  const SLAB = 6;
  const NR = 22;
  for (let i = 0; i < NR; i++) {
    const last = i === NR - 1;
    const f0 = last ? SNAP + 60 : SNAP + 1 + Math.floor(i * 1.8 + hash(i, 1, 950) * 3);
    const r = i === SLAB ? 15 : 4.5 + hash(i, 2, 950) * 6;
    const p: V3 = [(hash(i, 3, 950) - 0.4) * 44, (hash(i, 4, 950) - 0.4) * 40, 104 + r + hash(i, 5, 950) * 24];
    const b = body('ore', p, r, 0, norm([hash(i, 6, 950) - 0.5, hash(i, 7, 950) - 0.5, 0.4]));
    rocks.push({ f0, b, ramp: i % 4 === 3 ? HEAP_EARTH : BOULDER });
  }
  // THE PROP'S UPPER HALF, coming down with the roof; its foot, kicked out; the splinters off the break
  const top = body('bone', [0, 0, BREAK + (PROP_H - BREAK) / 2], 5.6, PROP_H - BREAK, [0.05, 0.05, 1]);
  const splinters: Body[] = [];
  for (let k = 0; k < 9; k++) splinters.push(body('splinter', [Math.cos(k) * 3, Math.sin(k) * 3, BREAK + (hash(k, 1, 951) - 0.5) * 4], 1.2, 4 + hash(k, 2, 951) * 7, norm([hash(k, 3, 951) - 0.5, hash(k, 4, 951) - 0.5, 0.6])));
  const all: Body[] = [...rocks.map((q) => q.b), top, ...splinters];
  const states: Body[][] = [];
  for (let f = 0; f < N; f++) {
    rocks.forEach((q, i) => {
      if (!q.b.free && f >= q.f0) letGo(q.b, [(hash(i, 8, 952) - 0.3) * 1.2, (hash(i, 9, 952) - 0.3) * 1.2, -2 - hash(i, 10, 952) * 2], i, 0.25);
    });
    if (!top.free && f >= SNAP) {
      letGo(top, [0.9, 0.7, -1], 99, 0);
      top.axis = norm([1, -1, 0]);
      top.spin = 0.09;
    }
    if (f === SNAP) splinters.forEach((s, k) => letGo(s, [Math.cos(k * 0.9) * 2.6 + 1, Math.sin(k * 0.9) * 2.6 + 1, 3 + hash(k, 5, 951) * 3], 60 + k, 0.5));
    if (f > 0) stepBodies(all, f, -1, 0.92, groundOf(f), (x, y) => Math.hypot(x, y) < 130);
    states.push(all.map(copyBody));
  }
  const unrest = states[N - 1].filter((b) => b.free && !b.still);
  if (unrest.length) throw new Error('the roof: still moving at the end: ' + unrest.map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))}`).join('; '));
  const slabHit = rocks[SLAB].b.struck.find((s) => s.vz < -3)?.f ?? SNAP + 12;
  const lastHit = rocks[NR - 1].b.struck.find((s) => s.vz < -2)?.f ?? SNAP + 70;
  // THE EARTH POURING down out of the dark onto the heap: clods in a column, thick and then thinning; a trickle before and after
  interface Clod { f0: number; x: number; y: number; r: number; v: number }
  const clods: Clod[] = [];
  for (let f0 = -8; f0 < N; f0++) {
    const n = f0 < 1 ? 0 : f0 < SNAP ? (f0 % 2 === 0 ? 1 : 0) + (f0 > 24 ? 1 : 0) : f0 < SNAP + 34 ? Math.min(10, 2 + Math.floor((f0 - SNAP) * 0.8)) : f0 < SNAP + 60 ? 4 : f0 % 2 === 0 ? 1 : 0;
    for (let j = 0; j < n; j++) {
      const wide = f0 < SNAP ? 4 : 34;
      clods.push({ f0, x: 2 + (hash(f0, j, 953) - 0.5) * wide, y: 3 + (hash(f0, j + 5, 953) - 0.5) * wide, r: f0 < SNAP ? 1.2 : 1.6 + hash(f0, j + 9, 953) * 2.8, v: 2 + hash(f0, j + 13, 953) * 2 });
    }
  }
  const clodAt = (c: Clod, f: number): V3 | null => {
    const k = f - c.f0;
    if (k < 0) return null;
    const z = 104 - c.v * k - 0.5 * k * k;
    const g = groundOf(f)(c.x, c.y) + c.r * 0.5;
    return z <= g ? null : [c.x, c.y, z];
  };
  // (the trickle runs on to the end: none left in the air on the last frame, the last landing on it)
  {
    for (let i = clods.length - 1; i >= 0; i--) if (clodAt(clods[i], N - 1) !== null) clods.splice(i, 1);
    const last: Clod = { f0: N - 1, x: 3, y: 2, r: 1.1, v: 3 };
    while (clodAt(last, N - 1) === null) last.f0--;
    last.f0++;
    clods.push(last);
  }
  // THE PROP: standing, shuddering, bowing out at its middle; its foot kicked out and falling flat
  const bowAt = (f: number): number => (f < 20 ? 1.6 * Math.sin(f * 2.3) * Math.min(1, f / 3) : f < SNAP ? 9 * ease((f - 20) / (SNAP - 20)) + 1.2 * Math.sin(f * 3.1) : 0);
  const footAng = (f: number): number => {
    if (f < SNAP) return 0;
    const u = f - SNAP;
    const a = Math.min(Math.PI / 2, 0.06 * u * u + 0.15 * u);
    return a >= Math.PI / 2 ? Math.PI / 2 - (u < 30 ? 0.12 * Math.abs(Math.sin((u - 6) * 0.9)) * Math.exp(-(u - 6) / 6) : 0) : a;
  };
  const OUT = norm([0.7, 0.6, 0]);
  // THE DUST: off the prop's head as it creaks; out from the break; up off the heap as the earth comes down, and where the slab and the last rock strike
  const clouds: Cloud[] = [
    cloud(1, [0, 0, 90], [0.3, 0.3, -0.6], 5, 1, 40, 8, 14),
    cloud(26, [0, 0, 88], [0.4, 0, -0.8], 6, 2, 46, 8, 14),
    cloud(SNAP, [1, 1, BREAK], [1.6, 1.4, 0.2], 9, 3, 60, 10, 18),
    cloud(SNAP + 10, [HX + 8, HY, 8], [3.2, 1.2, 0.6], 18, 4, N - SNAP - 16, 16, 26),
    cloud(SNAP + 14, [HX - 4, HY + 10, 8], [-1.2, 3.2, 0.6], 17, 5, N - SNAP - 20, 16, 26),
    cloud(slabHit, [states[slabHit][SLAB].p[0], states[slabHit][SLAB].p[1], 4], [2.2, 2.2, 0.5], 16, 6, Math.min(70, N - slabHit - 2), 12, 22),
    cloud(lastHit, [states[lastHit][NR - 1].p[0], states[lastHit][NR - 1].p[1], 3], [1, 0.6, 0.3], 9, 7, Math.min(46, N - lastHit - 1), 8, 16),
  ];
  const tracks: Track[] = [
    { name: 'the prop', at: [] },
    { name: 'the foot', at: [] },
    ...rocks.map((_, i) => ({ name: `rock ${i}`, fromEdge: true, at: [] as Track['at'] })),
    { name: 'the upper half', fromEdge: true, at: [] },
    ...splinters.map((_, k) => ({ name: `splinter ${k}`, at: [] as Track['at'] })),
  ];
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    // the heap
    const hh = heapH(f);
    if (hh > 0.6) S.egg([HX, HY, 0], XYZ, [HRX * spread(f), HRY * spread(f), hh], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 954) < 0.16 ? HEAP_EARTH[3] : hash(Math.floor(w[0] / 1.5), Math.floor(w[1] / 1.5), 955) < 0.08 ? HEAP_EARTH[0] : toneAt(n, HEAP_EARTH, 0.02)), 1);
    // the prop: whole and bowing; or its foot, falling over
    if (f < SNAP) {
      const bend = bowAt(f);
      let prev: V3 = [0, 0, 0];
      for (let k = 1; k <= 12; k++) {
        const z = (k / 12) * PROP_H;
        const q: V3 = add([0, 0, z], mul(OUT, bend * Math.sin((Math.PI * z) / PROP_H)));
        S.rod(prev, q, 6, 5.6, TIMBER, 2);
        prev = q;
      }
    } else {
      const a = footAng(f);
      const tip = add([0, 0, 0], add(mul(OUT, Math.sin(a) * BREAK), [0, 0, Math.cos(a) * BREAK + 3.2 * Math.sin(a)]));
      S.rod([0, 0, 6 * Math.sin(a)], tip, 6, 5.6, TIMBER, 2);
    }
    S.box([0, 0, 1.4], XYZ, [7.4, 5.6, 1.4], timberFace, 3);
    // the rocks, the upper half, the splinters
    const st = states[f];
    rocks.forEach((q, i) => {
      if (st[i].free) paintRock(S, st[i], q.ramp, 10 + i);
    });
    const tb = st[rocks.length];
    if (tb.free) S.rod(sub(tb.p, mul(tb.F, tb.len / 2)), add(tb.p, mul(tb.F, tb.len / 2)), 5.6, 5.4, TIMBER, 40);
    splinters.forEach((_, k) => {
      const b = st[rocks.length + 1 + k];
      if (b.free) S.rod(sub(b.p, mul(b.F, b.len / 2)), add(b.p, mul(b.F, b.len / 2)), b.r, b.r * 0.3, TIMBER_DIM, 50 + k);
    });
    // the earth pouring
    clods.forEach((c, i) => {
      const p = clodAt(c, f);
      if (p) S.egg(p, XYZ, [c.r * 1.1, c.r * 1.1, c.r * (1 + Math.min(1.4, (f - c.f0) * 0.08))], (n) => toneAt(n, HEAP_EARTH, 0.1), 70 + (i % 50));
    });
    paintClouds(S, clouds, f);
    S.seams();
    intoTheDark(S);
    if (record) {
      const pc = (q: number): V3 => (q < SNAP ? add([0, 0, PROP_H / 2], mul(OUT, bowAt(q))) : [0, 0, PROP_H / 2]);
      tracks[0].at.push(f < SNAP ? { ...trackAt(ID, pc(f), pc(Math.max(0, f - 1)), 20), shown: 1 } : null);
      const ft = (q: number): V3 => (q < SNAP ? [0, 0, BREAK / 2] : add(mul(OUT, Math.sin(footAng(q)) * BREAK * 0.5), [0, 0, Math.cos(footAng(q)) * BREAK * 0.5]));
      tracks[1].at.push(f >= SNAP ? trackAt(ID, ft(f), ft(Math.max(SNAP, f - 1)), 16) : null);
      const pv = states[Math.max(0, f - 1)];
      rocks.forEach((q, i) => {
        const b = st[i];
        tracks[2 + i].at.push(b.free ? { ...trackAt(ID, b.p, pv[i].free ? pv[i].p : add(b.p, [0, 0, 2]), b.r * 2), shown: outOfDark(b.p[2], b.r) } : null);
      });
      tracks[2 + rocks.length].at.push(tb.free ? { ...trackAt(ID, tb.p, pv[rocks.length].free ? pv[rocks.length].p : tb.p, 16), shown: outOfDark(tb.p[2] - tb.len * 0.3, 3) } : null);
      splinters.forEach((_, k) => {
        const b = st[rocks.length + 1 + k];
        tracks[3 + rocks.length + k].at.push(b.free ? trackAt(ID, b.p, pv[rocks.length + 1 + k].p, 8) : null);
      });
    }
    return compose(null, [S.p], null).sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  return { name: 'the roof comes in', frames, fps: 30, before: [paint(0, false)], after: [frames[N - 1]], tracks, jolts: [SNAP, slabHit, lastHit], holds: [] };
}

// -------------------------------------------------------------------------------------------------

/**
 * THE WINCH RUNS WILD. The winding drum at the winze, the kibble hanging just under the winze's lip, the
 * brake set (`before`). It creaks: the lever trembles, the drum shivers. THE BRAKE SLIPS: the lever kicks
 * up hard, sparks spray off the brake band, the kibble drops away down the winze, and the drum spins up,
 * faster and faster, the cable racing over the roller and down, the crank whirling round. Then, far down,
 * the kibble strikes the bottom (the first jolt): the drum jerks to a stop and kicks back, a column of
 * dust shoots high up out of the winze, billowing wider as it climbs, stones are flung up out of it high
 * and wide (each stepped on its own, so that none knocks another back down the winze), bouncing and
 * rolling to rest well away, the cable leaps up out of the hole in a loop and slaps down; the lever slams
 * back down (the second jolt). The drum rocks and settles, the dust sinks (`after`: the kibble gone, the
 * cable down the winze). Anchored at the middle of the drum's tile.
 */
function winchRunsWild(): Moment {
  const MW = 300;
  const MH = 320;
  const ax = 150;
  const ay = 230;
  const SLIP = 26;
  const BOTTOM = 58;
  const SLAM = 66;
  const N = 132;
  // the drum's turn: still; shivering; spinning up as the kibble falls (it pays out as far as the kibble has gone); its jerk and kick back; rocking to rest
  const dropAt = (f: number): number => (f < SLIP ? 0 : 0.3 * (Math.min(f, BOTTOM) - SLIP) ** 2);
  const spinAt = (f: number): number => {
    if (f < SLIP) return f > 0 ? 0.16 * Math.sin(f * 1.9) * (0.6 + 0.4 * (f / SLIP)) : 0;
    const s = dropAt(Math.min(f, BOTTOM)) / (WINCH.drumR + 0.9);
    if (f < BOTTOM) return s;
    const u = f - BOTTOM;
    return s - 0.5 * Math.sin(Math.min(Math.PI, u * 0.5)) * Math.exp(-u / 10) - (u > 6 ? 0.18 * Math.sin((u - 6) * 0.5) * Math.exp(-(u - 6) / 14) : 0);
  };
  const leverAt = (f: number): number => {
    if (f < SLIP) return 0.03 + 0.05 * Math.abs(Math.sin(f * 2.2)) * Math.min(1, 0.3 + f / SLIP) - (f === 0 ? 0.03 + 0.05 * 0 : 0);
    if (f < SLAM) return Math.min(1, ease((f - SLIP) / 4) * 1.08) - 0.06 * Math.sin((f - SLIP) * 0.8) * Math.exp(-(f - SLIP) / 8);
    const u = f - SLAM;
    return u < 3 ? 1 - u / 3 : 0.12 * Math.abs(Math.sin((u - 3) * 1.1)) * Math.exp(-(u - 3) / 5);
  };
  const shakeAt = (f: number): number => (f >= BOTTOM && f < BOTTOM + 12 ? 2.4 * Math.exp(-(f - BOTTOM) / 3) * Math.cos((f - BOTTOM) * 2) : f >= SLAM && f < SLAM + 8 ? 1.2 * Math.exp(-(f - SLAM) / 2.5) * Math.cos((f - SLAM) * 2.2) : 0);
  // the cable from the roller down into the winze: taut to the kibble as it falls; leaping up in a loop as it strikes, slapping down
  const { holeX, holeR, rollerZ } = WINCH;
  const lip: V3 = [holeX - holeR + 1.6, 1, 2];
  const roll: V3 = [holeX - holeR + 1, 1, rollerZ + 3];
  const cableAt = (f: number): V3[] => {
    if (f < BOTTOM) return [roll, lip, [holeX, 0, 2 - dropAt(f) + 10.5]];
    const u = f - BOTTOM;
    const up = 44 * Math.sin(Math.min(Math.PI, u * 0.24)) * Math.exp(-u / 16);
    const pts: V3[] = [roll];
    for (let k = 1; k <= 8; k++) {
      const t = k / 8;
      pts.push([roll[0] + 6 + t * 12, 1 + Math.sin(t * Math.PI) * up * 0.4, rollerZ + 3 + Math.sin(t * Math.PI) * up - t * (rollerZ + 3 + 14)]);
    }
    return pts;
  };
  // the sparks off the brake band as it slips, and as it slams back
  const sparks: Spark[] = [];
  const brake: V3 = [WINCH.drumX, -WINCH.drumL - 2.8, WINCH.drumZ - WINCH.drumR];
  for (let f0 = SLIP; f0 < SLIP + 18; f0++) for (let j = 0; j < 3; j++) sparks.push({ f0, p: add(brake, [(hash(f0, j, 960) - 0.5) * 6, -1, (hash(f0, j + 3, 960) - 0.5) * 4]), v: [(hash(f0, j + 6, 960) - 0.3) * 3, -1.5 - hash(f0, j + 9, 960) * 2, 1.5 + hash(f0, j + 12, 960) * 3], life: 4 + ((f0 + j) % 3) });
  for (let j = 0; j < 14; j++) sparks.push({ f0: SLAM + (j % 3), p: add(brake, [0, -1, 2]), v: [(hash(j, 1, 961) - 0.5) * 4, -1 - hash(j, 2, 961) * 2.4, 2 + hash(j, 3, 961) * 3], life: 4 + (j % 3) });
  // the dust: a burst blown up out of the winze as the kibble strikes far below, and off the frame
  const clouds: Cloud[] = [
    cloud(BOTTOM, [holeX, 0, 8], [0, 0, 5.2], 18, 1, N - BOTTOM - 3, 12, 30),
    // (and a column of it shooting high up out of the winze, climbing, then sinking back over it)
    // (billowing wider as it climbs, as dust does)
    ...[0, 1, 2, 3, 4, 5].map((k) => cloud(BOTTOM + (k >> 1) + (k > 3 ? 1 : 0), [holeX + (k % 2 ? 1.5 : -1.5), (k % 3) - 1, 10 + 6 * k], [k % 2 ? 0.7 : -0.6, k % 2 ? -0.4 : 0.4, 6 + 3.6 * k], 8.5 + 1.2 * k, 5 + k, N - BOTTOM - 6 - 2 * k, 10 - k, 30)),
    cloud(BOTTOM + 2, [holeX + 6, 5, 5], [2.4, 1.8, 3], 13, 2, N - BOTTOM - 8, 10, 26),
    cloud(BOTTOM + 1, [holeX - 3, -6, 5], [-1, -2, 3.2], 12, 3, N - BOTTOM - 12, 10, 24),
    cloud(SLAM, [WINCH.drumX, -WINCH.drumL - 4, 3], [0.6, -1, 0.4], 6, 4, 40, 8, 14),
  ];
  // STONES blown up out of the winze as the kibble strikes far below, flung out over the floor, bouncing and rolling to rest
  const stones: Body[] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + hash(k, 6, 962);
    stones.push(body('ore', [holeX + Math.cos(a) * 4, Math.sin(a) * 4, 2 + (k % 4) * 3.4], 2.4 + hash(k, 3, 962) * 2, 0, norm([hash(k, 4, 962) - 0.5, hash(k, 5, 962) - 0.5, 0.3])));
  }
  const stoneStates: Body[][] = [];
  for (let f = 0; f < N; f++) {
    if (f === BOTTOM) stones.forEach((b, k) => {
      const a = (k / stones.length) * Math.PI * 2 + hash(k, 6, 962);
      letGo(b, [Math.cos(a) * (2.6 + hash(k, 7, 962) * 1.6), Math.sin(a) * (2.6 + hash(k, 7, 962) * 1.6), 11.5 + hash(k, 8, 962) * 4.5], 70 + k, 0.3);
    });
    // (each on its own: flung up together out of the narrow winze, they would knock one another back down it)
    if (f > 0) for (const b of stones) stepBodies([b], f, -1, 0.9, (x, y) => (Math.abs(x - holeX) < holeR && Math.abs(y) < holeR ? -30 : 0), (x, y) => Math.hypot(x - holeX, y) < 110);
    stoneStates.push(stones.map(copyBody));
  }
  const tracks: Track[] = [{ name: 'the kibble', at: [] }, { name: 'the lever', at: [] }, { name: 'the crank', at: [] }, { name: 'the cable', at: [] }, ...stones.map((_, k) => ({ name: `stone ${k}`, at: [] as Track['at'] }))];
  const leverTip = (f: number): V3 => {
    const la = -0.5 - leverAt(f) * 1.15;
    return [WINCH.drumX + 3 + Math.sin(la) * 22, -WINCH.drumL - 4.4, 3 + Math.cos(la) * 22];
  };
  const crankAt = (f: number): V3 => {
    const ca = -spinAt(f) * 2.7;
    return [WINCH.drumX + 8.6 + Math.cos(ca) * 5, WINCH.drumL + 6.6, WINCH.drumZ - 4.2 + Math.sin(ca) * 5];
  };
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    const cab = cableAt(f);
    paintWinch(S, spinAt(f), leverAt(f), dropAt(f), 1, cab, shakeAt(f));
    stoneStates[f].forEach((b, k) => {
      if (b.free && b.p[2] > -b.r) paintRock(S, b, BOULDER, 60 + k);
    });
    paintClouds(S, clouds, f);
    S.seams();
    const out = compose(null, [S.p], null);
    const fire = new Px(MW, MH);
    paintSparks(fire, sparks, f, ax, ay);
    fastBlit(out, fire, 0, 0);
    if (record) {
      const kz = (q: number): V3 => [holeX, 0, 2 - dropAt(q) + 4];
      // (the kibble goes down into the winze, cut off by its mouth: as much of it as is still above it)
      const shown = clamp01((9 - dropAt(f)) / 9);
      tracks[0].at.push(shown > 0 ? { ...trackAt(ID, kz(f), kz(Math.max(0, f - 1)), 10), shown } : null);
      tracks[1].at.push(trackAt(ID, leverTip(f), leverTip(Math.max(0, f - 1)), 6));
      tracks[2].at.push(trackAt(ID, crankAt(f), crankAt(Math.max(0, f - 1)), 4));
      const mid = (q: number): V3 => cableAt(q)[Math.floor(cableAt(q).length / 2)];
      tracks[3].at.push(trackAt(ID, mid(f), mid(Math.max(0, f - 1)), 6));
      stoneStates[f].forEach((b, k) => {
        const pv = stoneStates[Math.max(0, f - 1)][k];
        tracks[4 + k].at.push(b.free && b.p[2] > -b.r ? trackAt(ID, b.p, pv.free ? pv.p : b.p, b.r * 2) : null);
      });
    }
    return framed(out, ax, ay);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  settleEnd(frames, tracks);
  return { name: 'the winch runs wild', frames, fps: 30, before: [paint(0, false)], after: [frames[frames.length - 1]], tracks, jolts: [BOTTOM, SLAM], holds: [] };
}

// -------------------------------------------------------------------------------------------------

/**
 * THE RIFT BREATHES. The crack in the floor, its light far down in it dim (`before`, the piece). It
 * stirs: its light swells and sinks, swells again; stones on its lips tremble and roll in. THE GROUND
 * HEAVES (the first jolt): the rift tears wider, its lips breaking: chunks of earth break off them and
 * tip and fall into it, gone into its dark; a gust of his pink sparks bursts up out of it, high, and
 * falls back; its light flares to his burning pink all along it and holds, roaring, the sparks streaming
 * up; at each heave its fire bursts up three times as tall, as tall as a hero, and sinks back to its roar;
 * a second heave (the second jolt) throws up another burst. Then it sinks: the light dims down to its
 * dim, the last sparks fall back in, the rift settles a little narrower than at its widest, its lips
 * broken back (`after`). Along x, as the piece. Anchored at its middle.
 */
function riftBreathes(): Moment {
  const MW = 300;
  const MH = 300;
  const ax = 150;
  const ay = 190;
  const HEAVE = 36;
  const HEAVE2 = 70;
  const N = 150;
  const openAt = (f: number): number => (f < HEAVE ? 1 + 0.04 * Math.sin(f * 0.6) * (f / HEAVE) : f < HEAVE2 ? 1 + 0.5 * ease((f - HEAVE) / 6) + 0.06 * Math.sin((f - HEAVE) * 1.3) * Math.exp(-(f - HEAVE) / 8) : 1.5 + 0.16 * ease((f - HEAVE2) / 5) - 0.3 * ease((f - HEAVE2 - 20) / 40));
  const glowAt = (f: number): number => (f < HEAVE ? 0.55 + 0.35 * Math.sin(f * 0.22) ** 2 : f < 110 ? 1 : 1 - 0.4 * ease((f - 110) / 30));
  const flareAt = (f: number): number => (f < HEAVE ? 0 : f < 104 ? ease((f - HEAVE) / 5) * (0.85 + 0.15 * Math.sin(f * 0.9)) : 1 - ease((f - 104) / 30));
  // (at each heave its fire bursts up high, three times as tall, and sinks back to its roar)
  const burstAt = (f: number): number => 1 + (f >= HEAVE ? 2.2 * Math.exp(-(f - HEAVE) / 6) : 0) + (f >= HEAVE2 ? 1.8 * Math.exp(-(f - HEAVE2) / 6) : 0);
  // the chunks of its lips that break off and tip in, gone into its dark
  interface Chunk { x: number; side: number; r: number; f0: number; t: number }
  const chunks: Chunk[] = [-26, -15, -4, 8, 19, 28, -21, 13, -9, 24].map((x, i) => ({ x, side: i % 2 ? 1 : -1, r: 3.4 + hash(i, 1, 970) * 3, f0: (i < 6 ? HEAVE : HEAVE2) + Math.floor(hash(i, 2, 970) * 6), t: hash(i, 3, 970) * 3 }));
  const chunkAt = (c: Chunk, f: number): { p: V3; turn: number; shown: number } => {
    const k = f - c.f0;
    const edge = c.side * (riftHalf(c.x) * openAt(Math.max(0, Math.min(f, c.f0))) + c.r * 0.8);
    const y0 = riftMid(c.x) + edge;
    if (k < 0) return { p: [c.x + (f > 0 && f < HEAVE ? 0.5 * Math.sin(f * 2.3 + c.x) * (f < HEAVE - 12 ? 0.6 : 1.4) : 0), y0, c.r * 0.35 + (f > 0 && f < HEAVE ? 0.7 * Math.abs(Math.sin(f * 3 + c.x)) * (f < HEAVE - 12 ? 0.6 : 1.4) : 0)], turn: 0, shown: 1 };
    // (it tips toward the rift and slides in, falling into its dark)
    const into = Math.min(1, k / 6);
    const fall = Math.max(0, k - 4);
    const p: V3 = [c.x, y0 - c.side * (c.r * 1.6 * into + fall * 0.4), c.r * 0.35 - 0.18 * fall * fall];
    return { p, turn: into * 1.2 * -c.side, shown: clamp01((p[2] + c.r * 2) / (c.r * 3)) };
  };
  // his sparks: a gust up out of it at each heave, and a stream while it flares; pink (his), falling back in
  const sparks: Spark[] = [];
  for (const [f0, n, up] of [[HEAVE, 60, 10], [HEAVE2, 44, 8.6]] as const) for (let j = 0; j < n; j++) {
    const x = (hash(j, f0, 971) - 0.5) * 64;
    sparks.push({ f0: f0 + (j % 5), p: [x, riftMid(x), 2], v: [(hash(j, 1 + f0, 972) - 0.5) * 2.4, (hash(j, 2 + f0, 972) - 0.5) * 1.8, up * (0.55 + 0.55 * hash(j, 3 + f0, 972))], life: 14 + (j % 8), pink: true });
  }
  for (let f0 = HEAVE + 4; f0 < 104; f0++) {
    const x = (hash(f0, 0, 973) - 0.5) * 60;
    sparks.push({ f0, p: [x, riftMid(x), 2], v: [(hash(f0, 1, 973) - 0.5) * 1.4, (hash(f0, 2, 973) - 0.5) * 0.8, 3.4 + hash(f0, 3, 973) * 3.4], life: 9 + (f0 % 5), pink: true });
  }
  const clouds: Cloud[] = [
    cloud(HEAVE, [-14, riftMid(-14) - 9, 3], [-0.8, -1.6, 0.6], 8, 1, 50, 8, 18),
    cloud(HEAVE + 1, [14, riftMid(14) + 9, 3], [0.8, 1.6, 0.6], 8, 2, 52, 8, 18),
    cloud(HEAVE2, [2, riftMid(2) + 10, 3], [0.4, 1.8, 0.5], 7, 3, 46, 8, 16),
  ];
  const tracks: Track[] = [{ name: 'the lip', at: [] }, ...chunks.map((_, i) => ({ name: `chunk ${i}`, at: [] as Track['at'] }))];
  const paint = (f: number, record: boolean): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    const p = new Px(MW, MH);
    const op = openAt(f);
    const gl = glowAt(f);
    const fl = flareAt(f);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const w = S.ray(x, y);
      if (Math.abs(w[0]) > RIFT_LEN + 4) continue;
      let c = riftAt(w, x, y, gl, op);
      // (as it flares: the line of light far down burns up to his pink, and lights the glass walls over it)
      if (c && fl > 0.05) {
        const d = w[1] - riftMid(w[0]);
        const half = riftHalf(w[0]) * op;
        const t = (d + half) / (2 * half);
        if (t > 0.5 && t < 0.72) c = fl > 0.6 ? (t > 0.56 && t < 0.66 ? (hash(x, y >> 1, 974 + (f >> 2)) < 0.5 ? FIRE[2] : FIRE[3]) : FIRE[1]) : t > 0.56 && t < 0.66 ? FIRE[1] : c;
        else if (t > 0.3 && t <= 0.5 && fl > 0.3) c = fl > 0.7 ? FIRE[0] : mix(c, FIRE[0], 0.5);
      }
      // (the light far down in it never still: it shimmers)
      if (c && SHIMMER.has(c) && hash(x >> 1, y, 975 + f) < 0.35) c = SHIMMER.get(c)!;
      if (c) p.set(x, y, c);
    }
    chunks.forEach((c, i) => {
      const a = chunkAt(c, f);
      if (a.p[2] < -c.r * 2.6) return;
      const A0 = norm([1, 0, a.turn]);
      const C0 = norm([-a.turn, 0, 1]);
      S.egg(a.p, [A0, [0, 1, 0], C0], [c.r * 1.2, c.r * 0.9, c.r * 0.6], facetOf(HEAP_EARTH, 0.05), 10 + i, (w) => w[2] > -0.3 || Math.abs(w[1] - riftMid(w[0])) < riftHalf(w[0]) * openAt(f));
    });
    paintClouds(S, clouds, f);
    S.seams();
    const out = compose(p, [S.p], null);
    const fire = new Px(MW, MH);
    // his fire licking up out of it all along, as it flares: tongues of the enemy's pink, gold at their hearts
    if (fl > 0.08) {
      for (let k = 0; k < 11; k++) {
        const x = -30 + k * 6 + (hash(k, 0, 976) - 0.5) * 3;
        if (riftHalf(x) < 2) continue;
        const bu = burstAt(f);
        const h = Math.round((8 + 16 * hash(k, 1, 976)) * fl * bu * (0.75 + 0.25 * Math.sin(f * 0.9 + k * 1.7)));
        if (h < 3) continue;
        const [sx, sy] = [Math.round(ax + (x - riftMid(x)) * 0.8), Math.round(ay + (x + riftMid(x)) * 0.4)];
        pinkFlame(fire, sx, sy, h, (1.6 + riftHalf(x) * 0.12) * (1 + 0.25 * (bu - 1)), Math.sin(f * 0.7 + k) * 2.4 * Math.sqrt(bu));
      }
    }
    paintSparks(fire, sparks, f, ax, ay);
    fastBlit(out, fire, 0, 0);
    const s = framed(out, ax, ay);
    s.lights = [{ x: ax / GRAIN, y: ay / GRAIN, r: 22 + 12 * fl * Math.min(2, burstAt(f)), color: fl > 0.3 ? FIRE[2] : FIRE[0], a: 0.2 + 0.3 * fl }];
    if (record) {
      const lp = (q: number): V3 => [0, riftMid(0) - riftHalf(0) * openAt(q), 0];
      tracks[0].at.push(trackAt(ID, lp(f), lp(Math.max(0, f - 1)), 8));
      chunks.forEach((c, i) => {
        const a = chunkAt(c, f);
        const b = chunkAt(c, Math.max(0, f - 1));
        tracks[1 + i].at.push(a.shown > 0 ? { ...trackAt(ID, a.p, b.p, c.r * 2), shown: a.shown } : null);
      });
    }
    return s;
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f, true));
  settleEnd(frames, tracks);
  return { name: 'the rift breathes', frames, fps: 30, before: [paint(0, false)], after: [frames[frames.length - 1]], tracks, jolts: [HEAVE, HEAVE2], holds: [] };
}

const each: (Moment | null)[] = [null, null, null];
/** One of the lair's moments (0 the roof, 1 the winch, 2 the rift), made the first time it is asked for and kept. */
export function lairMoment(n: number): Moment {
  return each[n] ?? (each[n] = n === 0 ? roofComesIn() : n === 1 ? winchRunsWild() : riftBreathes());
}
let moments: Moment[] | null = null;
/** The lair's moments around the hero, made the first time they are asked for and kept. */
export function lairMoments(): Moment[] {
  return moments ?? (moments = [0, 1, 2].map(lairMoment));
}
