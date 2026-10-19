// THE GREAT LIBRARY'S MOMENT AROUND THE HERO (the art chat for floors 11 to 15, 19 Oct 2026; a mock-up, nothing of the
// game imports it).
//
// His rulebook's Places 8, his words of 10 Oct: “I’d also like a couple environmental things happening around you for
// immersion unique for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and they
// fly off,  a root shrivels as you walk by.  That sort of stuff”. Made on his word to this chat of 18 Oct, 21:24
// Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”: the pick this chat would have marked recommended, sent him as a film. His doc's library has “candle
// chandeliers”; this is one of them. Checked against his Animations 1 before he sees it: “as big and wild and kinetic and
// weighty as possible.  I’d rather it be a notch too high than a notch too low.”
//
//   THE CHANDELIER FALLS: a candle chandelier hangs over the floor near you, its candles burning (`before`). Its chain
//     creaks: it starts to swing, wax dripping off it; a link gives and it drops a hand's breadth with a jerk, bouncing
//     on its chain; it swings harder; then THE CHAIN SNAPS and it falls, and CRASHES on the floor (a jolt): it lands on
//     its finial and topples onto its hoop's edge, rocking; candles snap out of their cups and fly, rolling away across
//     the floor; wax splashes; most of the flames go out in puffs of smoke; dust rolls out; the broken chain comes down
//     after it in a heap. It lies there after (`after`), wrecked, two candles still burning on the floor, guttering.
//
// Laid on open floor (a hall's marble or the Reading Room's carpet, art/library.ts), away from walls: its anchor is the
// floor under the chandelier's middle; it hangs about 42 game pixels up, its chain running up out of the picture into
// the dark; the candles roll out up to about 1.6 tiles from the anchor, so leave that clear. Built as floor 14's screen
// is (art/floor2.ts onPic, picture pixels, KT to a tile).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { Moment, Track } from './floorkit';
import { onPic } from './floor2';
import { CANDLE } from './floor11';
import { WAX } from './floor15';
import { IRON } from './act2_kit';
import { GRAIN, hash } from './kit';

type V3 = [number, number, number];
const sm = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};
const D = Math.PI / 180;

/** The dust of the floor, and the smoke of a candle put out. */
const DUST = ['#6a6656', '#8a8572', '#aaa48e', '#c4beaa'] as const;
const SMOKE = ['#4a4652', '#625e6a', '#7e7a86'] as const;
const WICK = '#1a1614';
/** Its iron, a little lighter than the pieces' so that it reads as it falls through the dark. */
const IRONS = [IRON[1], IRON[2], IRON[3], IRON[4], '#b4b2c2'] as const;

/** The chandelier as it hangs (as art/floor15.ts `chandelier`): its lower hoop at `Z` over the floor, its two hoops, how many candles on each. */
const Z = 84;
const HOOPS = [
  { r: 27, z: 0, n: 12 },
  { r: 14, z: 12, n: 6 },
] as const;
/** Where the chain is fixed above, out of the picture (its swing's pivot), and where it snaps (above the stem's top). */
const PIVOT = 260;
const SNAP = 40;

/** When things happen (frames at 30 a second): it starts to creak and swing; a link gives at `slip`; the chain snaps at `snap`; it strikes the floor at `crash`; it has stopped rocking by `still`; it ends at `end`. */
const T = { slip: 26, snap: 52, crash: 63, still: 92, end: 128 } as const;
/** How fast it falls once the chain snaps (picture pixels a frame, each frame): so that it strikes the floor at `crash` (set below, from where it hangs as the chain snaps). */
let G = 0.6;

/** A candle on it: which hoop, where round, how tall; whether it flies when it crashes (and where to), whether its flame lives through it. */
interface Candle {
  hoop: number;
  a: number;
  h: number;
  flies: boolean;
  /** Where it ends up lying, from the anchor (x, y), the way it lies (radians round), how high it is thrown. */
  to: [number, number];
  lie: number;
  up: number;
  /** Its flame burns on after the crash. */
  burns: boolean;
  seed: number;
}
const CANDLES: Candle[] = ((): Candle[] => {
  const out: Candle[] = [];
  let k = 0;
  HOOPS.forEach((hp, hi) => {
    for (let i = 0; i < hp.n; i++) {
      const a = (i / hp.n) * Math.PI * 2 + 0.2;
      const seed = k++;
      const flies = hi === 0 ? i % 3 !== 1 : i % 2 === 0;
      const reach = (hp.r + 16 + 34 * hash(seed, 1, 8151)) * (hi === 0 ? 1 : 1.4);
      const turn = a + (hash(seed, 2, 8151) - 0.5) * 0.9;
      out.push({ hoop: hi, a, h: 5 + 2.5 * hash(i, hi === 0 ? 10 : 60, 8131), flies, to: [Math.cos(turn) * reach, Math.sin(turn) * reach], lie: hash(seed, 3, 8151) * Math.PI, up: 10 + 14 * hash(seed, 4, 8151), burns: seed === 3 || seed === 8, seed });
    }
  });
  return out;
})();
/** The two flames still burning in their cups after it lands. */
const CUP_BURNS = new Set([5, 14]);

/** How it swings on its chain (degrees, toward +x), and how far it has dropped as the link gives (picture pixels), at a frame before the snap. */
function swingAt(f: number): number {
  if (f < 0) return 0;
  const grow = 1.2 + 4.8 * sm(f / T.snap);
  const kick = f >= T.slip ? 3 * Math.exp(-(f - T.slip) / 10) * Math.sin((f - T.slip) * 0.9) : 0;
  return grow * Math.sin(f * 0.19) * sm(f / 10) + kick;
}
function slipAt(f: number): number {
  if (f < T.slip) return 0;
  const b = f - T.slip;
  return -6 + 2.6 * Math.exp(-b / 6) * Math.cos(b * 1.1);
}
/** Its body's place and turn at a frame: the middle of its lower hoop, and its tilt (degrees about the axis `axis` on the floor). */
interface Body {
  c: V3;
  tilt: number;
  axis: V3;
  spin: number;
}
/** Which way it topples as it lands: its hoop's edge coming down toward the hero and to the left. */
const TOPPLE: V3 = (() => {
  const a = 0.35;
  return [Math.cos(a), Math.sin(a), 0];
})();
const TOPPLE_AXIS: V3 = [-TOPPLE[1], TOPPLE[0], 0];
/** How far it tips as it rests on its finial and its hoop's edge (degrees). */
const REST_TILT = 15;
function bodyAt(f: number): Body {
  const hang = (sw: number, drop: number): Body => {
    // (swung about the pivot far above: shifted along x, tipped the same)
    const L = PIVOT - Z;
    return { c: [L * Math.sin(sw * D), 0, Z + drop + L * (1 - Math.cos(sw * D))], tilt: sw, axis: [0, 1, 0], spin: 0 };
  };
  if (f < T.snap) return hang(swingAt(f), slipAt(f));
  const b0 = hang(swingAt(T.snap), slipAt(T.snap));
  if (f < T.crash) {
    // (falling: straight down, gathering speed, still swinging a little on)
    const u = f - T.snap;
    const z = Math.max(LOWEST, b0.c[2] - G * u * u);
    return { ...b0, c: [b0.c[0] * (1 + u * 0.02), 0, z], tilt: b0.tilt * (1 - u / (T.crash - T.snap)) };
  }
  // (landed: on its finial, toppling onto its hoop's edge, rocking, still)
  const u = f - T.crash;
  const tilt = u < 5 ? REST_TILT * 1.35 * sm(u / 5) : REST_TILT + REST_TILT * 0.35 * Math.exp(-(u - 5) / 6) * Math.cos(((u - 5) * Math.PI) / 5) * (1 - sm((u - 5) / (T.still - T.crash - 5)));
  const sit = u < 3 ? -2.5 * Math.sin((u * Math.PI) / 3) : 0;
  return { c: [b0.c[0] * (1 + (T.crash - T.snap) * 0.02), 0, LOWEST + sit + 2.2 * Math.sin(tilt * D)], tilt: Math.min(90, tilt), axis: TOPPLE_AXIS, spin: 0 };
}
/** How high its middle is as it lands on its finial. */
const LOWEST = 7;
G = (bodyAt(T.snap - 1e-9).c[2] - LOWEST) / ((T.crash - T.snap) * (T.crash - T.snap));
/** Turn a point of the chandelier (its own: x, y round, z up from its lower hoop) to where it is. */
function place(p: V3, b: Body): V3 {
  const th = b.tilt * D;
  const [ax, ay, az] = b.axis;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const d = ax * p[0] + ay * p[1] + az * p[2];
  // (Rodrigues: turned about the axis through its middle)
  const cr: V3 = [ay * p[2] - az * p[1], az * p[0] - ax * p[2], ax * p[1] - ay * p[0]];
  const r: V3 = [p[0] * c + cr[0] * s + ax * d * (1 - c), p[1] * c + cr[1] * s + ay * d * (1 - c), p[2] * c + cr[2] * s + az * d * (1 - c)];
  return [b.c[0] + r[0], b.c[1] + r[1], b.c[2] + r[2]];
}
/** Where a candle is on its hoop (its cup), and its way up, on the body as it is. */
function cupOf(cd: Candle, b: Body): { base: V3; up: V3 } {
  const hp = HOOPS[cd.hoop];
  const local: V3 = [Math.cos(cd.a) * hp.r, Math.sin(cd.a) * hp.r, hp.z + 1.6];
  const base = place(local, b);
  const top = place([local[0], local[1], local[2] + 1], b);
  return { base, up: [top[0] - base[0], top[1] - base[1], top[2] - base[2]] };
}
/** A flying candle at a frame after the crash: where its foot and its tip are, and whether it has come to rest. */
function flyingAt(cd: Candle, f: number): { a: V3; b: V3; rest: boolean } {
  const land = bodyAt(T.crash);
  const { base } = cupOf(cd, land);
  const u = f - T.crash;
  const fly = 9 + 6 * hash(cd.seed, 5, 8151);
  const roll = 14 + 10 * hash(cd.seed, 6, 8151);
  const k = Math.min(1, u / fly);
  // (thrown up and out, then rolling on along the floor, slowing)
  const out = sm(Math.min(1, u / (fly + roll))) * 0.25 + 0.75 * (1 - (1 - k) ** 2);
  const x = base[0] + (cd.to[0] - base[0]) * Math.min(1, out + 0.25 * sm((u - fly) / roll));
  const y = base[1] + (cd.to[1] - base[1]) * Math.min(1, out + 0.25 * sm((u - fly) / roll));
  const z = Math.max(1.3, base[2] * (1 - k) + cd.up * 4 * k * (1 - k) + 1.3 * k);
  const lieNow = cd.lie + (u * 0.45 + 2.2 * sm((u - fly) / roll)) * (hash(cd.seed, 7, 8151) > 0.5 ? 1 : -1);
  const stand = Math.max(0, 1 - k * 1.6);
  const dir: V3 = [Math.cos(lieNow) * (1 - stand), Math.sin(lieNow) * (1 - stand), stand + (k < 1 ? 0.6 * Math.sin(u * 0.9) : 0)];
  const dl = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const L = cd.h;
  const b: V3 = [x + (dir[0] / dl) * L, y + (dir[1] / dl) * L, Math.max(1.3, z + (dir[2] / dl) * L)];
  return { a: [x, y, z], b, rest: u >= fly + roll };
}

/** A drop of wax: falling from a candle before the crash, or thrown out by it. */
interface Drop {
  born: number;
  from: number;
  out: [number, number];
  up: number;
  seed: number;
}
const DRIPS: Drop[] = Array.from({ length: 9 }, (_, i) => ({ born: 6 + Math.floor(i * 5.3 + 3 * hash(i, 1, 8161)), from: (i * 7) % CANDLES.length, out: [0, 0] as [number, number], up: 0, seed: i }));
const SPLASH: Drop[] = Array.from({ length: 34 }, (_, i) => {
  const a = i * 2.39996;
  const r = 30 + 40 * hash(i, 2, 8162);
  return { born: T.crash + Math.floor(2 * hash(i, 3, 8162)), from: i % CANDLES.length, out: [Math.cos(a) * r, Math.sin(a) * r] as [number, number], up: 6 + 12 * hash(i, 4, 8162), seed: i };
});
/** The dust thrown out from under it as it lands. */
const PUFFS = Array.from({ length: 90 }, (_, i) => ({ a: i * 2.39996 + hash(i, 1, 8171), speed: 1.6 + 2.6 * hash(i, 2, 8171), born: T.crash + Math.floor(4 * hash(i, 3, 8171)), seed: i }));

function theChandelier(): Moment {
  const W = 420;
  const H = 340;
  const ax = 210;
  const ay = 250;
  const tracks: Track[] = [
    { name: 'the chandelier', at: [] },
    { name: 'the chain', fromEdge: true, at: [] },
    { name: 'a candle', at: [] },
    { name: 'the dust', at: [] },
  ];
  const paint = (f: number, flick: number, record: boolean): { q: Px; lights: [number, number, number][] } => {
    const q = new Px(W, H);
    const zbuf = new Float32Array(W * H).fill(-Infinity);
    const lights: [number, number, number][] = [];
    const put = (sx: number, sy: number, c: string, depth: number): void => {
      const X = Math.round(ax + sx);
      const Y = Math.round(ay + sy);
      if (X < 0 || Y < 0 || X >= W || Y >= H) return;
      const i = Y * W + X;
      if (depth < zbuf[i]) return;
      zbuf[i] = depth;
      q.set(X, Y, c);
    };
    const depthOf = (p: V3): number => 0.61 * (p[0] + p[1]) + 0.5 * p[2];
    /** A ball, lit from above and to the left. */
    const ball = (p: V3, r: number, ramp: ReadonlyArray<string>, bias = 0): void => {
      const [sx, sy] = onPic(p[0], p[1], p[2]);
      const R = Math.max(0.6, r);
      const n = Math.ceil(R);
      for (let dy = -n; dy <= n; dy++) {
        for (let dx = -n; dx <= n; dx++) {
          const d2 = (dx * dx + dy * dy) / (R * R);
          if (d2 > 1) continue;
          const nz = Math.sqrt(1 - d2);
          const shade = (-0.5 * dx) / R + (-0.6 * dy) / R + 0.62 * nz;
          const tone = Math.max(0, Math.min(ramp.length - 1, Math.round(1.2 + shade * 2.4)));
          put(sx + dx, sy + dy, ramp[tone], depthOf(p) + nz * R + bias);
        }
      }
    };
    const rod = (a: V3, b: V3, r: number, ramp: ReadonlyArray<string>, bias = 0): void => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const n = Math.max(1, Math.ceil(L / 0.7));
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        ball([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u], r, ramp, bias);
      }
    };
    /** A candle's flame at its tip (an honest flame), flickering; and its light. */
    const flame = (tip: V3, up: V3, k: number, size = 1): void => {
      const fl = hash(k, flick, 8181);
      const lean = (hash(k, flick, 8182) - 0.5) * 0.8;
      const u = Math.hypot(up[0], up[1], up[2]) || 1;
      const ux = up[0] / u;
      const uy = up[1] / u;
      const uz = Math.max(0.4, up[2] / u);
      const at = (h: number): V3 => [tip[0] + ux * h + lean * h * 0.3, tip[1] + uy * h, tip[2] + uz * h];
      ball(at(1.0 * size), 1.2 * size, [CANDLE[2], CANDLE[3], CANDLE[3], CANDLE[4]], 50);
      ball(at((2.3 + fl * 0.6) * size), 0.75 * size, [CANDLE[3], CANDLE[4]], 51);
      const [sx, sy] = onPic(...at(1.5 * size));
      lights.push([sx, sy, size]);
    };
    const smoke = (at: V3, age: number, k: number): void => {
      if (age < 0 || age > 26) return;
      const life = age / 26;
      for (let i = 0; i < 3; i++) {
        if (hash(k, i + Math.floor(age / 2) * 5, 8183) < life * 0.8) continue;
        const p: V3 = [at[0] + Math.sin(age * 0.3 + i * 2 + k) * (1 + life * 4), at[1], at[2] + 2 + age * 1.1 + i * 3];
        ball(p, life < 0.5 ? 1.4 : 1.0, [SMOKE[2], SMOKE[1], SMOKE[0]], 40);
      }
    };
    const body = bodyAt(f);
    const broke = f >= T.snap;
    // THE CHAIN: up from the stem into the dark; once it snaps, its upper end swinging, its lower end falling after
    const chainTop: V3 = [0, 0, PIVOT];
    const stemTop = place([0, 0, 22], body);
    const links = Math.round((PIVOT - Z - 22) / 2.4);
    let chainShown = 0;
    if (!broke) {
      for (let i = 0; i <= links; i++) {
        const u = i / links;
        ball([stemTop[0] + (chainTop[0] - stemTop[0]) * u, stemTop[1] + (chainTop[1] - stemTop[1]) * u, stemTop[2] + (chainTop[2] - stemTop[2]) * u], i % 2 ? 1.0 : 1.3, IRONS);
      }
      chainShown = 1;
    } else {
      // (the upper end, left swinging from above, its broken end jerking up)
      const b = f - T.snap;
      const sw = swingAt(T.snap) * Math.exp(-b / 30) * Math.cos(b * 0.25) - 4 * Math.exp(-b / 8) * Math.sin(b * 0.6);
      const len = PIVOT - (Z + 22 + SNAP) + 4 * Math.exp(-b / 5) * Math.sin(b * 0.9);
      const end: V3 = [len * Math.sin(sw * D), 0, PIVOT - len * Math.cos(sw * D)];
      const n = Math.round(len / 2.4);
      for (let i = 0; i <= n; i++) ball([end[0] * (1 - i / n), 0, end[2] + (PIVOT - end[2]) * (i / n)], i % 2 ? 1.0 : 1.3, IRONS);
      // (the lower piece falling after it and heaping on it)
      const fall = Math.max(0, b - 2);
      for (let i = 0; i < 17; i++) {
        const base = place([0, 0, 22], body);
        const z0 = Z + 22 + i * 2.4 + slipAt(T.snap);
        const zFall = z0 - G * 0.9 * fall * fall;
        const heap = base[2] + 1 + (i % 4) * 1.4;
        const settled = zFall <= heap;
        const p: V3 = settled ? [base[0] + Math.cos(i * 1.7) * (2 + i * 0.5), base[1] + Math.sin(i * 1.7) * (2 + i * 0.5), heap] : [base[0] + Math.sin(i + b) * 0.4, base[1], zFall];
        ball(p, i % 2 ? 1.0 : 1.3, IRONS, 2);
      }
      chainShown = 1;
    }
    // THE STEM, its finial and boss; THE HOOPS, their arms, their cups
    rod(place([0, 0, -6], body), place([0, 0, 22], body), 1.8, IRONS);
    ball(place([0, 0, -7], body), 2.2, IRONS);
    for (const [hi, hp] of HOOPS.entries()) {
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        ball(place([Math.cos(a) * hp.r, Math.sin(a) * hp.r, hp.z], body), 0.95, IRONS);
      }
      for (let i = 0; i < hp.n; i++) {
        const a = (i / hp.n) * Math.PI * 2 + 0.2;
        rod(place([Math.cos(a) * hp.r * 0.95, Math.sin(a) * hp.r * 0.95, hp.z], body), place([0, 0, hp.z + 6], body), 0.5, IRONS);
        rod(place([Math.cos(a) * hp.r, Math.sin(a) * hp.r, hp.z], body), place([Math.cos(a) * hp.r, Math.sin(a) * hp.r, hp.z + 1.6], body), 1.2, IRONS);
      }
      void hi;
    }
    // THE CANDLES: in their cups, burning; once it lands, most thrown out and rolling, put out
    let flyX = 0;
    let flyY = 0;
    let flyN = 0;
    let flyShown = 0;
    for (const cd of CANDLES) {
      const k = cd.seed;
      if (!cd.flies || f < T.crash) {
        const { base, up } = cupOf(cd, body);
        if (cd.flies) {
          const [sx, sy] = onPic(...base);
          flyX += sx;
          flyY += sy;
          flyN++;
          flyShown = 1;
        }
        const tip: V3 = [base[0] + up[0] * cd.h, base[1] + up[1] * cd.h, base[2] + up[2] * cd.h];
        rod(base, tip, 1.15, WAX);
        const lit = f < T.crash || CUP_BURNS.has(k);
        if (lit) flame(tip, up, k);
        else {
          rod(tip, [tip[0] + up[0], tip[1] + up[1], tip[2] + up[2]], 0.3, [WICK]);
          smoke(tip, f - T.crash, k);
        }
        continue;
      }
      const c = flyingAt(cd, f);
      rod(c.a, c.b, 1.15, WAX);
      ball(c.b, 0.5, [WICK]);
      const [sx, sy] = onPic(...c.a);
      flyX += sx;
      flyY += sy;
      flyN++;
      flyShown = 1;
      if (cd.burns) {
        // (still burning where it lies, guttering low)
        const up: V3 = [0, 0, 1];
        flame(c.b, up, k, 0.75 + 0.15 * hash(k, flick, 8184));
      } else smoke(c.b, f - T.crash - 2, k + 40);
    }
    // THE WAX: dripping off it as it swings; splashed out as it lands, lying where it fell
    for (const d of DRIPS) {
      const u = f - d.born;
      if (u < 0 || d.born >= T.snap) continue;
      const cd = CANDLES[d.from];
      const { base } = cupOf(cd, bodyAt(d.born));
      const z = base[2] - 0.5 * G * u * u;
      if (z > 0.6) ball([base[0], base[1], z], 0.6, WAX);
      else ball([base[0], base[1], 0.6], 0.9, [WAX[1], WAX[2]], -2);
    }
    if (f >= T.crash) {
      for (const d of SPLASH) {
        const u = f - d.born;
        if (u < 0) continue;
        const k = Math.min(1, u / 10);
        const z = Math.max(0.6, d.up * 4 * k * (1 - k));
        const p: V3 = [body.c[0] + d.out[0] * sm(k * 1.2) * 0.9, body.c[1] + d.out[1] * sm(k * 1.2) * 0.9, z];
        if (k < 1) ball(p, 0.7, WAX, 3);
        else ball([p[0], p[1], 0.6], 1.0, [WAX[1], WAX[2], WAX[3]], -2);
      }
    }
    // THE DUST, rolling out from under it as it lands, rising a little, thinning away
    let dustShown = 0;
    if (f >= T.crash) {
      let n = 0;
      for (const p of PUFFS) {
        const t = f - p.born;
        if (t < 0 || t > 30) continue;
        const life = t / 30;
        if (hash(p.seed, Math.floor(f / 2), 8172) < life * life) continue;
        n++;
        const r = 24 + p.speed * t * (1 - 0.4 * life);
        const x = body.c[0] + Math.cos(p.a) * r;
        const y = body.c[1] + Math.sin(p.a) * r;
        const z = 1 + 14 * Math.sqrt(life) * hash(p.seed, 4, 8171);
        const [sx, sy] = onPic(x, y, z);
        const c = DUST[life < 0.3 ? 3 : life < 0.6 ? 2 : 1];
        const size = life < 0.35 ? 3 : 2;
        for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) put(sx + dx, sy + dy, c, depthOf([x, y, z]) - (Math.sin(p.a) < 0 && Math.cos(p.a) < 0 ? 40 : -40));
      }
      dustShown = Math.min(1, n / 60);
    }
    if (record) {
      const [cx, cy] = onPic(...place([0, 0, 6], body));
      tracks[0].at.push({ x: cx, y: cy, shown: 1, size: 60 });
      const [tx, ty] = onPic(stemTop[0], stemTop[1], stemTop[2] + 30);
      tracks[1].at.push({ x: tx, y: ty, shown: chainShown, size: 70 });
      tracks[2].at.push(flyN ? { x: flyX / flyN, y: flyY / flyN, shown: flyShown, size: 60 } : null);
      tracks[3].at.push(dustShown > 0 ? { x: cx, y: onPic(body.c[0], body.c[1], 0)[1], shown: dustShown, size: 80 } : null);
    }
    return { q, lights };
  };
  const cut = (q: Px, lights: [number, number, number][]): Sprite => {
    const lone: [number, number][] = [];
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      if (!q.has(x, y)) continue;
      let n = 0;
      for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
      if (!n) lone.push([x, y]);
    }
    for (const [x, y] of lone) q.d[(y * q.w + x) * 4 + 3] = 0;
    const bb = q.bounds(GRAIN)!;
    const c = new Px(bb.w, bb.h);
    for (let y = 0; y < bb.h; y++) for (let x = 0; x < bb.w; x++) {
      const v = q.get(bb.x + x, bb.y + y);
      if (v) c.set(x, y, v);
    }
    const s = c.sprite(ax - bb.x, ay - bb.y, GRAIN);
    const ls: Light[] = lights.map(([sx, sy, size]) => ({ x: (ax + sx - bb.x) / GRAIN, y: (ay + sy - bb.y) / GRAIN, r: 10 * size + (hash(Math.round(sx), Math.round(sy), 8185) > 0.5 ? 1 : 0), color: CANDLE[3], a: 0.32 }));
    if (ls.length) s.lights = ls;
    return s;
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < T.end; f++) {
    const { q, lights } = paint(f, f % 4, true);
    frames.push(cut(q, lights));
  }
  // (before: hanging still, its flames flickering; after: lying wrecked, its last two flames flickering)
  const before = [0, 1, 2, 3].map((k) => {
    const { q, lights } = paint(0, k, false);
    return cut(q, lights);
  });
  const after = [0, 1, 2, 3].map((k) => {
    const { q, lights } = paint(T.end - 1, (T.end - 1 + k) % 4, false);
    return cut(q, lights);
  });
  frames[0] = before[0];
  return { name: 'the chandelier falls', frames, fps: 30, before, after, tracks, jolts: [T.snap, T.crash], holds: [] };
}

/** When it happens (frames at 30 a second), for the checks and the notes. */
export const CHANDELIER_AT = T;

let moments: Moment[] | null = null;
/** The Great Library's moment around the hero: the chandelier falls. */
export function greatLibraryMoments(): Moment[] {
  return (moments ??= [theChandelier()]);
}
