// FLOORS 6 TO 10, THEIR WAYS ON, AND WHERE EACH NEXT FLOOR BEGINS (the art chat's, 22 Oct 2026). A MOCK-UP: NOTHING OF THE
// GAME IMPORTS THIS FILE; it is behind A1_WAYS, off.
//
// His words to the main chat, 22 Oct 2026, 11:21 (Pacific): “Then have exits that lead to the next zone in a natural way
// as opposed to just a waypoint being plopped down.” Told in the art chat what each floor's way on would be (each shut
// until its boss dies, then opening with a bang tied to that boss, and where he comes out on the next floor), asked
// “Paint these ways on for floors 6 to 10? I'd show you floors 6 to 10 first, then 11 to 15.”, by 14:16: “Yes, paint
// them (Recommended)”.
//
// WHERE THEY STAND (the main chat's game/ways.ts, Ways.onward): at the far end of the boss's ground, leading on the way
// from where the boss stood toward it (art/ways_kit.ts WayDir); each painted in that floor's own look, in daylight.
//
// THE RULES THEY KEEP (his art rulebook): crisp pixels, two to a game pixel, light from the upper left; nothing glows
// but what is the enemy's (pink and gold) or a friend's (cyan); the floor's own stone, timber and earth.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Scene, XYZ, body, facetOf, letGo, rot as rotAbout, stepBodies, toneAt } from './floor4';
import type { Body } from './floor4';
import type { V3 } from './floor4';
import { shriekAt } from './floor5';
import { FRESH, IRON, ROCK, ROPE, STONE, TIMBER, add, cross, fr, ironWheel, mul, norm, rope, sub, timber } from './floor6';
import { GRAIN, compose, hash, mix } from './kit';
import type { Ramp } from './kit';
import { G, Rig, block, rodIn, chip, cloud, copyBlock, letBlockGo, paintBlock, paintChips, paintDust, stepBlocks, stepChips } from './ways_kit';
import type { Block, Chip, Cloud, StartArt, WayArt, WayDir, WayFilm } from './ways_kit';

/** THE SWITCH: off, nothing of the game uses any of this. */
export const A1_WAYS = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};

/** The dark of a hole in the ground, deep down (a little warm: daylight's, not the Crypt's). */
const HOLE_DARK = '#140f16';

/** A ROPE from a to b, sagging `sag` at its middle (floor 6's, with the little rods). */
function ropeIn(S: Scene, a: V3, b: V3, sag: number, id: number, r = 0.55): void {
  const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 6));
  let prev = a;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const p: V3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - sag * 4 * t * (1 - t)];
    rodIn(S, prev, p, r, r, ROPE, id);
    prev = p;
  }
}

/** Paint a picture from its under and over rigs (each seamed): the over on the under, the indigo seam round each. */
function whole(under: Px | null, over: Px | null, ax: number, ay: number, w: number, h: number): Sprite {
  const layers = [under, over].filter((p): p is Px => !!p);
  if (!layers.length) return new Px(w, h).sprite(ax, ay, GRAIN);
  return compose(null, layers).sprite(ax, ay, GRAIN);
}

// =================================================================================================
// FLOOR 6, THE QUARRY: THE CUT. A stair hewn down into the bedrock at the far end of the pit, its sides dressed with the
// half-drill holes of the cutting, a low kerb of cut blocks along it and the quarry's hoist over its head; it goes down
// under a bench of the rock, into the dark: the way down to the next terrace. SHUT: the cult's cut blocks dumped across
// its head, two across it and one on them, one fallen before them, the cult's mark chalked on the front one. AS THE
// UNFINISHED FALLS (the stone colossus's own crash shaking the whole pit): the blocks rattle and hop, the hoist's rope
// swings, grit pours off the bench; at the great jolt the top block slides off and tumbles, the front one topples over
// forward and crashes flat, the other is thrown off the kerb to the side and rolls; dust; the stair stands open.

export const QUARRY_CUT = {
  /** The opening: from the floor's edge (a 0) on along the way, and either side of the middle. */
  long: 84,
  half: 28,
  /** The steps: how far each goes on, how far down. */
  run: 10.5,
  rise: 5.6,
  /** The kerb of cut blocks along each side: how wide, how high. */
  kerbW: 11,
  kerbH: 9,
  /** The bench of rock the stair goes down under: from where the opening ends, how far on, how wide either side, how high. */
  benchOn: 64,
  benchHalf: 74,
  benchH: 60,
};
/** The film's frames: the great jolt (the Unfinished's crash), and when each block goes. */
export const QUARRY_FILM = { frames: 112, quakeTo: 24, jolt: 24, top: 25, front: 30, side: 27, fps: 30 } as const;
/** The quarry's dust, pale limestone in the sun, and settled. */
const Q_DUST: Ramp = ['#8a8290', '#a39aa2', '#bab1b0', '#cfc6bf', '#ddd5cc'];
const Q_DUST_LOW: Ramp = ['#9a929c', '#a69ea6', '#b2aaae', '#bdb5b6', '#c6bebd'];
/** The pit's grass on the bench's top. */
const GRASS: Ramp = ['#3e5534', '#4c6640', '#5f7c48', '#6e8d50', '#829f5e'];
const CHALK = '#e9e4dc';
const CUT_IN = '#4a4258';

const QW = 600;
const QH = 440;
const QAX = 300;
const QAY = 250;
const QZ0 = 90;

/** How the face of a cut block is dressed: the pick's marks in rows on its top, the half-drill holes on a split side, its foot dusty. */
function dressed(r: Ramp, n: V3, face: number, u: number, v: number, seed: number, split: boolean, topFace: number): string {
  const base = toneAt(n, r, 0.02);
  if (face === topFace) {
    const row = fr(v * 7 + hash(seed, 1, 910) * 0.5);
    const col = fr(u * 11 + Math.floor(v * 7) * 0.37);
    if (row < 0.14 && col < 0.42) return r[3];
    return base;
  }
  if (split && v < 0.3) {
    const k = fr(u * 8 + hash(seed, face, 911) * 0.5);
    if (k < 0.1) return r[Math.max(0, r.indexOf(base) - 1)] ?? r[1];
  }
  if (hash(Math.floor(u * 9), Math.floor(v * 7), seed + face * 13) < 0.05) return r[Math.max(0, r.indexOf(base) - 1)] ?? base;
  return base;
}

/** The quarry's ground under the way, the way's own: the stair down the opening, the kerbs, the bench, the floor. */
function quarryGround(a: number, b: number): number {
  const Q = QUARRY_CUT;
  if (a >= Q.long && Math.abs(b) <= Q.benchHalf && a <= Q.long + Q.benchOn) return Q.benchH;
  if (a >= 0 && a < Q.long && Math.abs(b) < Q.half) return -Q.rise * (Math.floor(a / Q.run) + 1);
  if (a >= -2 && a < Q.long && Math.abs(b) >= Q.half && Math.abs(b) < Q.half + Q.kerbW) return Q.kerbH;
  return 0;
}

/** THE STAIR DOWN, under the floor: its treads and risers, its dressed sides, on down under the bench into the dark. Kept only as seen through the opening. */
function quarryHole(d: WayDir): Rig {
  const Q = QUARRY_CUT;
  const R = new Rig(QW, QH, QAX, QAY, d, QZ0);
  const deepen = (c: string, z: number, a: number): string => {
    const k = clamp01(-z / 90) * 0.4 + clamp01((a - Q.long + 4) / 30) * 0.6;
    return mix(c, HOLE_DARK, Math.min(0.92, k));
  };
  const steps = 15;
  for (let k = 0; k < steps; k++) {
    const a0 = k * Q.run;
    const a1 = a0 + Q.run;
    const z0 = -k * Q.rise;
    const z1 = -(k + 1) * Q.rise;
    // the tread: worn in its middle, its nosing catching the light
    R.quad([[a0, -Q.half, z1], [a1, -Q.half, z1], [a1, Q.half, z1], [a0, Q.half, z1]], (u, v) => {
      const a = a0 + u * Q.run;
      let c = u < 0.1 ? FRESH[4] : u > 0.86 ? FRESH[2] : Math.abs(v - 0.5) < 0.22 ? FRESH[3] : FRESH[3];
      if (u >= 0.1 && u < 0.86 && hash(Math.floor(u * 6), Math.floor(v * 10), 920 + k) < 0.08) c = FRESH[2];
      return deepen(c, z1, a);
    }, 10 + k);
    // the riser: its face toward the floor behind, in shade
    R.quad([[a0, -Q.half, z0], [a0, Q.half, z0], [a0, Q.half, z1], [a0, -Q.half, z1]], (u) => {
      const c = fr(u * 7 + k * 0.3) < 0.08 ? STONE[0] : FRESH[0];
      return deepen(c, z1, a0);
    }, 40 + k);
  }
  // the sides, dressed: the half-drill holes in rows down them, the courses of the cutting
  const D = steps * Q.rise + 4;
  const L = steps * Q.run;
  for (const s of [-1, 1]) {
    const b = s * Q.half;
    R.quad([[0, b, 0], [L, b, 0], [L, b, -D], [0, b, -D]], (u, v, w) => {
      const a = u * L;
      const z = -v * D;
      // (not below the stair's own treads)
      if (z < -Q.rise * (Math.floor(a / Q.run) + 1) - 0.5) return null;
      let c = s < 0 ? STONE[2] : STONE[1];
      if (fr(a / 7.5 + (s > 0 ? 0.4 : 0)) < 0.14 && fr(z / 22) > 0.25) c = STONE[0];
      if (fr(-z / 22) < 0.06) c = STONE[0];
      if (z > -1.6) c = STONE[3];
      void w;
      return deepen(c, z, a);
    }, 70 + (s > 0 ? 1 : 0));
  }
  return R;
}
/** Whether a point of the floor (the way's own) is the stair's opening. */
const quarryOpen = (a: number, b: number): boolean => a >= 0 && a < QUARRY_CUT.long && Math.abs(b) < QUARRY_CUT.half;

/** THE KERBS, THE BENCH AND THE HOIST: what stands of the way when the blocks are gone. */
function quarryStanding(d: WayDir): Rig {
  const Q = QUARRY_CUT;
  const R = new Rig(QW, QH, QAX, QAY, d, 0);
  // the kerb, a row of cut blocks each side
  let id = 100;
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const a0 = -2 + k * 16.7;
      const a1 = Math.min(Q.long, a0 + 16.2);
      const b0 = s * (Q.half + Q.kerbW / 2);
      R.box([(a0 + a1) / 2, b0, Q.kerbH / 2], XYZ, [(a1 - a0) / 2, Q.kerbW / 2, Q.kerbH / 2], (f, u, v, n) => dressed(STONE, n, f, u, v, 300 + k * 2 + s, false, 4), id++);
    }
  }
  // THE BENCH: the rock the stair goes down under, stepped as the quarry's walls are, its front cut with the stair's mouth
  const a0 = Q.long;
  const a1 = Q.long + Q.benchOn;
  const B = Q.benchHalf;
  const H = Q.benchH;
  const mouth = (b: number, z: number): boolean => Math.abs(b) < Q.half - 2 && (z < 22 || Math.hypot(b, (z - 22) * 1.15) < Q.half - 2);
  R.box([(a0 + a1) / 2, 0, H / 2], XYZ, [(a1 - a0) / 2, B, H / 2], (f, u, v, n) => {
    // f: 0 +a (far), 1 -a (its face to the floor), 2 +b, 3 -b, 4 top, 5 under
    if (f === 4) {
      // its top: the rock's cap, grass and stones on it
      const g = hash(Math.floor(u * 22), Math.floor(v * 30), 931);
      if ((v < 0.06 || v > 0.94 || u > 0.9) && g < 0.5) return GRASS[2 + (g < 0.2 ? 1 : 0)];
      if (g < 0.05) return ROCK[3];
      if (u < 0.05) return STONE[4];
      return toneAt(n, STONE, 0.08);
    }
    // the faces: the courses of the cutting, the drill holes down them (f 0, 1: u across, v up; f 2, 3: u up, v along)
    const b = f < 2 ? (u - 0.5) * 2 * B : 0;
    const z = f < 2 ? v * H : u * H;
    const along = f < 2 ? u : v;
    if (f === 1 && mouth(b, z)) {
      // the stair's mouth: the dark under the rock, its rim of the stone catching the light
      const rimUp = !mouth(b, z + 2.2);
      const rimSide = !mouth(b + 1.6 * Math.sign(b || 1), z);
      if (rimUp) return STONE[3];
      if (rimSide) return STONE[1];
      return mix(HOLE_DARK, STONE[0], clamp01((z - 4) / 30) * 0.18);
    }
    let c = toneAt(n, STONE, -0.02);
    if (fr(z / 13.5) < 0.09) c = STONE[0];
    else if (fr(along * (f < 2 ? 14 : 6) + Math.floor(z / 13.5) * 0.31) < 0.07) c = STONE[1];
    if (z > H - 2) c = STONE[4];
    return c;
  }, 200);
  // a second, smaller bench on it, set back
  R.box([a1 - 18, -8, H + 13], XYZ, [18, B * 0.72, 13], (f, u, v, n) => {
    if (f === 4) {
      const g = hash(Math.floor(u * 14), Math.floor(v * 30), 932);
      if ((u > 0.86 || v < 0.05 || v > 0.95) && g < 0.6) return GRASS[2 + (g < 0.2 ? 1 : 0)];
      if (u < 0.04) return STONE[4];
      return toneAt(n, STONE, 0.1);
    }
    const z = f < 2 ? v * 26 : u * 26;
    let c = toneAt(n, STONE, -0.04);
    if (fr(z / 13.5) < 0.1) c = STONE[0];
    if (z > 24.5) c = STONE[4];
    return c;
  }, 201);
  // boulders of the rock fallen on the bench's edges, so that it is the pit's own rock and not a plinth
  for (const [ba, bb, bz, br, sd] of [[Q.long + 6, -Q.benchHalf + 6, Q.benchH + 4, 7, 1], [Q.long + 30, Q.benchHalf - 5, Q.benchH + 3, 6, 2], [Q.long + Q.benchOn - 4, -20, Q.benchH + 26 + 5, 6.5, 3], [Q.long - 2, Q.benchHalf + 3, 6, 8, 4], [Q.long + 10, -Q.benchHalf - 4, 5, 6, 5]] as const) {
    R.egg([ba, bb, bz], XYZ, [br * 1.25, br, br * 0.75], facetOf(STONE, 0.04 - hash(sd, 1, 933) * 0.08), 210 + sd);
  }
  // THE HOIST: two posts either side of the stair's head, a beam across, a wheel and its rope hanging into the dark
  const S = R.S;
  const P = (a: number, b: number, z: number): V3 => R.P(a, b, z);
  for (const s of [-1, 1]) {
    timber(S, P(-6, s * (Q.half + 5), Q.kerbH), P(-6, s * (Q.half + 5), 96), 3, 300 + (s > 0 ? 1 : 0), [0.08, 0.86]);
    // its brace
    timber(S, P(8, s * (Q.half + 5), Q.kerbH), P(-6, s * (Q.half + 5), 44), 1.8, 302 + (s > 0 ? 1 : 0));
  }
  timber(S, P(-6, -(Q.half + 11), 98), P(-6, Q.half + 11, 98), 3.2, 304, [0.2, 0.8]);
  ironWheel(S, P(-6, 0, 91), R.V([1, 0, 0]), 5.5, 305);
  ropeIn(S, P(-6, 2, 87), P(-5, 3, 30), 0, 306, 0.7);
  // the hook at its end
  S.rod(P(-5, 3, 30), P(-5, 5, 24), 1.1, 0.8, IRON, 307);
  S.rod(P(-5, 5, 24), P(-5, 3, 21), 0.9, 0.7, IRON, 307);
  return R;
}

/** THE CULT'S BLOCKS, jammed into the stair's head and heaped up out of it, one fallen before it. */
function quarryBlocks(): Block[] {
  const turn = (ang: number, tilt = 0, roll = 0): [V3, V3, V3] => {
    let A: [V3, V3, V3] = [[Math.cos(ang), Math.sin(ang), 0], [-Math.sin(ang), Math.cos(ang), 0], [0, 0, 1]];
    if (tilt) A = A.map((v) => rotAbout(v, A[1], tilt)) as [V3, V3, V3];
    if (roll) A = A.map((v) => rotAbout(v, A[0], roll)) as [V3, V3, V3];
    return A;
  };
  return [
    // the front one, on the top steps, tipped back against the rest: the cult's mark on its face
    block([13, -10, 9], [13, 17, 15], turn(0.08, 0.32)),
    // beside it
    block([14, 15, 7], [12, 11, 14], turn(-0.3, 0.2, -0.12)),
    // deeper, across the stair
    block([42, 2, -3], [15, 25, 15], turn(0.1, 0.12)),
    // heaped on them
    block([27, 2, 28], [14, 17, 12], turn(0.42, -0.1, 0.06)),
    // one fallen before it
    block([-22, 18, 12], [12, 13, 12], turn(0.6)),
    // stacked up against the mouth under the rock, two and one on them
    block([70, -13, -18], [12, 13, 16], turn(-0.12, 0.06)),
    block([72, 13, -16], [11, 12, 17], turn(0.2, -0.05)),
    block([62, 0, 16], [12, 20, 10], turn(0.05, -0.2)),
  ];
}
/** How each block is dressed (its look, and the cult's mark chalked on the front one). */
function shadeBlock(k: number) {
  return (f: number, u: number, v: number, n: V3): string => {
    // (the faces: 0 +R0, 1 -R0, 2 +R1, 3 -R1, 4 +R2, 5 -R2; R0 the way, R2 up as they lie)
    if (k === 0 && f === 1) {
      // the front block's face to the floor: the cult's mark, cut in and chalked
      const m = shriekAt((u - 0.5) * 4.2, (v - 0.45) * 2.4);
      if (m === 'dark') return CUT_IN;
      if (m === 'bone') return CHALK;
    }
    return dressed(k === 2 ? FRESH : k === 1 ? STONE : FRESH, n, f, u, v, 400 + k * 7, k !== 2, 4);
  };
}

/** The pebbles that pour off the bench as the pit shakes, and the chips that fly where a block strikes. */
function quarryPebbles(): Chip[] {
  const Q = QUARRY_CUT;
  const out: Chip[] = [];
  for (let i = 0; i < 26; i++) {
    const f0 = 2 + Math.floor(hash(i, 1, 940) * 30);
    const b = (hash(i, 2, 940) - 0.5) * 2 * (Q.benchHalf - 4);
    out.push(chip(f0, [Q.long + 1.5, b, Q.benchH + 1], [-0.4 - hash(i, 3, 940) * 1.2, (hash(i, 4, 940) - 0.5) * 0.6, 0.4], 0.8 + hash(i, 5, 940) * 1.8, i));
  }
  return out;
}

const quarryCache = new Map<WayDir, WayArt>();
/** FLOOR 6'S WAY ON, THE CUT: shut, its film, open; leading `d`. */
export function quarryWay(d: WayDir): WayArt {
  const had = quarryCache.get(d);
  if (had) return had;
  const F = QUARRY_FILM;
  const hole = quarryHole(d);
  const standing = quarryStanding(d);
  const bs = quarryBlocks();
  const shades = bs.map((_, k) => shadeBlock(k));
  const pebbles = quarryPebbles();
  const chips: Chip[] = [];
  const dust: Cloud[] = [];
  /** A frame: what is seen down the opening (the stair, and the blocks in it), and what stands. */
  const paintFrame = (f: number, jog: boolean): { under: Px; over: Px } => {
    const U = hole.copy();
    const R = standing.copy();
    bs.forEach((b, k) => {
      const j: V3 = jog && !b.free ? [(hash(f, k, 950) - 0.5) * 2.6, (hash(f, k, 951) - 0.5) * 2, hash(f, k, 952) * 2.4] : [0, 0, 0];
      paintBlock(U, b, shades[k], 500 + k, j);
      paintBlock(R, b, shades[k], 500 + k, j);
    });
    U.under(quarryOpen);
    U.S.seams();
    paintChips(R, pebbles, f, STONE, 600);
    paintChips(R, chips, f, STONE, 700);
    R.S.seams();
    paintDust(R, dust, f, Q_DUST, Q_DUST_LOW, (1 << 20) + 10);
    return { under: U.S.p, over: R.S.p };
  };
  const shutPx = paintFrame(-1, false);
  const frames: Sprite[] = [];
  const kicks: { f: number; k: number }[] = [{ f: F.jolt, k: 7 }];
  const seen = new Set<string>();
  for (let f = 0; f < F.frames; f++) {
    // THE QUAKE: everything hops at the great jolt; then each block goes its way
    if (f === F.jolt) {
      // dust shaken out of the joints, all along the kerbs and under the blocks
      for (let i = 0; i < 8; i++) dust.push(cloud(f, [-4 + i * 12, (i % 2 ? 1 : -1) * 34, 8], [(hash(i, 1, 960) - 0.5) * 2, (i % 2 ? 1 : -1) * 1.4, 0.6], 11 + 4 * hash(i, 2, 960), 960 + i, 40, 8, 12));
    }
    if (f === F.jolt) {
      // THE GREAT JOLT: the heap is thrown up and out of the stair's head, each its own way (out to the sides more than at him)
      letBlockGo(bs[3], [-0.8, -4.6, 9.6], [0.07, 0.02, -0.03]);
      letBlockGo(bs[0], [-2.2, -3.8, 8.6], [0.03, -0.07, 0.01]);
      letBlockGo(bs[1], [-1.4, 4.6, 8.2], [-0.07, -0.02, 0.03]);
      letBlockGo(bs[4], [-0.6, 2.0, 3.6], [0.02, -0.05, 0.03]);
      letBlockGo(bs[7], [-1.2, 3.4, 10.4], [-0.05, 0.03, 0.02]);
      // a cloud bursting up out of the stair's head
      for (let i = 0; i < 6; i++) dust.push(cloud(f, [10 + i * 12, (hash(i, 7, 961) - 0.5) * 30, 4], [(hash(i, 8, 961) - 0.6) * 2, (hash(i, 9, 961) - 0.5) * 3, 2.6], 16 + 8 * hash(i, 10, 961), 990 + i, 62, 12, 18));
    }
    if (f === F.jolt + 4) letBlockGo(bs[2], [-2.4, -3.0, 12.0], [-0.02, -0.07, 0.02]);
    if (f === F.jolt + 6) {
      letBlockGo(bs[5], [-2.0, -4.2, 12.8], [0.05, -0.04, 0.02]);
      letBlockGo(bs[6], [-2.6, 4.4, 12.2], [-0.05, -0.05, -0.02]);
    }
    stepBlocks(bs, f, quarryGround);
    stepChips(pebbles, f, quarryGround);
    stepChips(chips, f, quarryGround);
    // where a block strikes the ground: a jolt, dust, chips
    bs.forEach((b, k) => {
      for (const s of b.struck) {
        const key = `${k}:${s.f}`;
        if (seen.has(key) || s.f !== f) continue;
        seen.add(key);
        const hard = -s.vz;
        if (hard < 2.4) continue;
        kicks.push({ f, k: Math.min(6, 2 + hard * 0.5) });
        const at: V3 = [b.c[0], b.c[1], 2];
        dust.push(cloud(f, at, [b.v[0] * 0.6, b.v[1] * 0.6, 0.4], 12 + hard * 1.2, 970 + k * 10 + dust.length, 46, 9, 14));
        for (let i = 0; i < 3; i++) {
          const ang = hash(f, i, 971 + k) * Math.PI * 2;
          chips.push(chip(f, add(at, [Math.cos(ang) * 6, Math.sin(ang) * 6, 2]), [Math.cos(ang) * (1 + hash(i, f, 972) * 1.6), Math.sin(ang) * (1 + hash(i, f, 973) * 1.6), 2 + hash(i, k, 974) * 3], 0.6 + hash(i, k, 975) * 1.0, 1000 + chips.length));
        }
      }
    });
    const fr2 = paintFrame(f, f < F.jolt + 4 && f >= 2);
    frames.push(whole(fr2.under, fr2.over, QAX, QAY, QW, QH));
  }
  // the film's jolts: the great one, and the hardest strikes after it, no two within three frames
  kicks.sort((p, q) => q.k - p.k || p.f - q.f);
  const kept: { f: number; k: number }[] = [];
  for (const k of kicks) if (kept.length < 8 && !kept.some((o) => Math.abs(o.f - k.f) < 3)) kept.push(k);
  kicks.length = 0;
  kicks.push(...kept.sort((p, q) => p.f - q.f));
  const film: WayFilm = { frames, fps: F.fps, jolts: kicks.map((k) => k.f), kicks: kicks.map((k) => Math.round(k.k)) };
  const openPx = paintFrame(F.frames + 200, false);
  const shut = { under: whole(shutPx.under, null, QAX, QAY, QW, QH), over: whole(null, shutPx.over, QAX, QAY, QW, QH) };
  const open = { under: whole(openPx.under, null, QAX, QAY, QW, QH), over: whole(null, openPx.over, QAX, QAY, QW, QH) };
  const art: WayArt = { shut, film, open };
  quarryCache.set(d, art);
  void copyBlock;
  void G;
  void smooth;
  void mul;
  void ROPE;
  void TIMBER;
  return art;
}

// =================================================================================================
// FLOOR 7, THE LEDGE ROAD: THE CHIMNEY. A crack in the eyrie's rock, a man's width, going down the mountain's inside: a
// stair of planks pinned across it one under another, a rope hand-line down its wall, two posts of old driftwood at its
// head with a rope between. SHUT: the Queen's nest heaped over it, a great mound of sticks woven with the bones of what
// she ate, feathers, rags of the cult's. AS SHE DIES: the nest heaves; her flock, roosting in it, bursts out of it all at
// once, beating up and away in every direction, and the nest is blown apart, sticks and bones flung over the rock and
// down the crack, feathers drifting down after; the chimney's mouth is open.

export const LEDGE_CHIMNEY = {
  /** The crack: from the floor's edge (a 0) on along the way, how wide either side at its widest. */
  long: 88,
  half: 27,
  /** How deep it is seen to go. */
  deep: 120,
  /** The nest: its middle along the way, how far it reaches along and across, how high. */
  nestA: 40,
  nestRa: 56,
  nestRb: 44,
  nestH: 46,
};
/** The film's frames: the nest heaving, the flock bursting out. */
export const LEDGE_FILM = { frames: 120, heave: 4, burst: 20, fps: 30 } as const;
const LW = 640;
const LH = 520;
const LAX = 320;
const LAY = 320;
const LZ0 = 130;
/** The eyrie's rock, as floor 7's (art/floor7.ts LROCK). */
const LROCK: Ramp = ['#3d3648', '#4f4962', '#6e6680', '#8c8494', '#a39ca8'];
const STICK: Ramp = ['#3b3029', '#544537', '#6e5d49', '#8a775e', '#a39073'];
const LBONE: Ramp = ['#5d5249', '#7f7364', '#a59886', '#c8bca8', '#e0d7c5'];
const FEATHER: Ramp = ['#1d1a20', '#2b2630', '#3d3640', '#544a52', '#6e6468'];
const DRIFT: Ramp = ['#4e4850', '#6d666a', '#8e867f', '#aca397', '#c4bcaf'];
const VHEAD: Ramp = ['#4a4240', '#655a55', '#83766d', '#9d9085', '#b3a79b'];
const RAG: Ramp = ['#2a2034', '#3a2c48', '#4e3c5e', '#5e4a70', '#6e5a80'];
const L_DUST: Ramp = ['#6e6878', '#7e7888', '#8e8898', '#9e98a6', '#aca6b2'];

/** How wide the crack is either side at `a` along it (0 outside it): rounded at its ends, ragged. */
function chimneyHalf(a: number): number {
  const C = LEDGE_CHIMNEY;
  if (a < 0 || a > C.long) return 0;
  const t = a / C.long;
  const shape = Math.sqrt(Math.max(0, Math.sin(Math.PI * t))) * (0.85 + 0.15 * Math.sin(t * 9.4));
  const rag = (hash(Math.floor(a / 3), 1, 980) - 0.5) * 3;
  return Math.max(0, C.half * shape + rag);
}
const chimneyOpen = (a: number, b: number): boolean => Math.abs(b) < chimneyHalf(a) - (b > 0 ? 0 : 0);
/** The rock under the nest, the way's own: down the crack, the floor elsewhere. */
function ledgeGround(a: number, b: number): number {
  return chimneyOpen(a, b) ? -400 : 0;
}

/** THE CHIMNEY under the floor: its ragged walls going down, darker the deeper; its planks one under another; the rope. */
function ledgeHole(d: WayDir): Rig {
  const C = LEDGE_CHIMNEY;
  const R = new Rig(LW, LH, LAX, LAY, d, LZ0);
  const dark = (c: string, z: number): string => mix(c, HOLE_DARK, Math.min(0.97, 1 - Math.exp(z / 11)));
  const darkPlank = (c: string, z: number): string => mix(c, HOLE_DARK, Math.min(0.95, 1 - Math.exp(z / 40)));
  // the walls, in strips along it: each side's face, ledged with the rock's layers
  const step = 3;
  for (let a0 = -2; a0 < C.long + 2; a0 += step) {
    const a1 = a0 + step;
    for (const s of [-1, 1]) {
      const h0 = Math.max(0.5, chimneyHalf(a0)) * s;
      const h1 = Math.max(0.5, chimneyHalf(a1)) * s;
      R.quad([[a0, h0, 0], [a1, h1, 0], [a1, h1 * 0.8, -C.deep], [a0, h0 * 0.8, -C.deep]], (u, v) => {
        const z = -v * C.deep;
        const layer = fr(-z / 17 + hash(Math.floor((a0 + u * step) / 9), s, 981) * 0.3);
        let c = layer < 0.12 ? LROCK[0] : layer > 0.9 ? LROCK[3] : s < 0 ? LROCK[2] : LROCK[1];
        if (z > -2) c = LROCK[3];
        return dark(c, z);
      }, 20 + (s > 0 ? 1 : 0));
    }
  }
  // the ends, closing it
  R.quad([[C.long + 1, -4, 0], [C.long + 1, 4, 0], [C.long + 1, 4, -C.deep], [C.long + 1, -4, -C.deep]], (_u, v) => dark(LROCK[1], -v * C.deep), 22);
  // THE PLANKS: a stair of them pinned across it, one under another, down on into the dark
  for (let k = 0; k < 9; k++) {
    const a = 6 + k * 8.6;
    const z = -9 - k * 10.5;
    const hw = Math.max(2, Math.min(chimneyHalf(a - 3), chimneyHalf(a + 3)) - 0.5);
    R.box([a, 0, z], XYZ, [4.2, hw, 1.2], (f, u, v, n) => {
      if (f === 4) {
        const c = fr(v * 3) < 0.07 ? DRIFT[1] : u < 0.15 ? DRIFT[4] : DRIFT[3];
        return darkPlank(c, z + 6);
      }
      return darkPlank(toneAt(n, DRIFT, -0.2), z);
    }, 40 + k);
    // its pins, iron, driven into the rock under each end
    for (const s of [-1, 1]) R.rod([a, s * (hw - 1), z - 1.4], [a, s * (hw + 2), z - 4], 0.7, 0.6, IRON, 60 + k);
  }
  // the hand-line, down the wall from the head to the dark
  ropeIn(R.S, R.P(-6, 15, 6), R.P(C.long - 4, 9, -C.deep + 10), 6, 70, 0.6);
  return R;
}

/** The driftwood posts at the chimney's head and their rope, and the stones of its lip. */
function ledgeStanding(d: WayDir): Rig {
  const C = LEDGE_CHIMNEY;
  const R = new Rig(LW, LH, LAX, LAY, d, 0);
  for (const s of [-1, 1]) {
    R.rod([-8, s * 21, 0], [-9, s * 22, 36], 2.6, 2, DRIFT, 300 + (s > 0 ? 1 : 0));
    // its knot of rope at the top
    R.egg([-9, s * 22, 31], XYZ, [3, 3, 2], (n) => toneAt(n, ROPE, 0.05), 302 + (s > 0 ? 1 : 0));
    // wedged in stones at its foot
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + s;
      R.egg([-8 + Math.cos(ang) * 4.5, s * 21 + Math.sin(ang) * 4.5, 2], XYZ, [4, 3.2, 2.6], facetOf(LROCK, 0.06), 304 + i + (s > 0 ? 3 : 0));
    }
  }
  ropeIn(R.S, R.P(-9, -22, 31), R.P(-9, 22, 31), 7, 310, 0.65);
  // the lip of the crack: stones broken off its edge
  for (let i = 0; i < 14; i++) {
    const a = 4 + (i / 13) * (C.long - 8);
    const s = i % 2 ? 1 : -1;
    const b = s * (chimneyHalf(a) + 3 + hash(i, 1, 982) * 3);
    R.egg([a, b, 1.6], XYZ, [3 + hash(i, 2, 982) * 2.5, 2.6 + hash(i, 3, 982) * 1.6, 2], facetOf(LROCK, 0.08), 320 + i);
  }
  return R;
}

/** A stick, bone or feather of the nest: as a loose thing (floor 4's), and what it is. */
interface NestBit {
  b: Body;
  kind: 'stick' | 'bone' | 'rag';
  r: number;
}
/** THE NEST'S BITS, as they lie woven into it. */
function nestBits(): NestBit[] {
  const C = LEDGE_CHIMNEY;
  const out: NestBit[] = [];
  const N = 210;
  for (let i = 0; i < N; i++) {
    // a point on its dome, the higher toward its middle
    const th = hash(i, 1, 983) * Math.PI * 2;
    const rr = Math.pow(hash(i, 2, 983), 0.7) * 0.98;
    const a = C.nestA + Math.cos(th) * rr * C.nestRa;
    const bb = Math.sin(th) * rr * C.nestRb;
    const z = C.nestH * Math.pow(Math.max(0, 1 - rr * rr), 0.6) * (0.85 + 0.2 * hash(i, 3, 983)) + 1.5;
    // lying round its slope, every way across it
    const t = th + Math.PI / 2 + (hash(i, 4, 983) - 0.5) * 1.6;
    const kind: NestBit['kind'] = i % 23 === 7 ? 'rag' : i % 9 === 4 ? 'bone' : 'stick';
    const len = kind === 'bone' ? 11 + hash(i, 5, 983) * 7 : kind === 'rag' ? 14 : 16 + hash(i, 5, 983) * 14;
    const F: V3 = [Math.cos(t), Math.sin(t), (hash(i, 6, 983) - 0.5) * 0.8];
    const n = Math.hypot(F[0], F[1], F[2]);
    const bd = body(kind === 'bone' ? 'bone' : 'splinter', [a, bb, z], kind === 'bone' ? 1.5 : 1.2, len, [F[0] / n, F[1] / n, F[2] / n]);
    out.push({ b: bd, kind, r: kind === 'bone' ? 1.5 : 1.15 + hash(i, 7, 983) * 0.7 });
  }
  return out;
}
/** Paint a bit of the nest as it lies or flies. */
function paintNestBit(R: Rig, n: NestBit, id: number, jog: V3): void {
  const p = add(n.b.p, jog);
  const h = mul(n.b.F, n.b.len / 2);
  const a: V3 = [p[0] - h[0], p[1] - h[1], p[2] - h[2]];
  const e: V3 = [p[0] + h[0], p[1] + h[1], p[2] + h[2]];
  if (n.kind === 'stick') R.rod(a, e, n.r, n.r * 0.7, STICK, id);
  else if (n.kind === 'bone') {
    R.rod(a, e, n.r, n.r * 0.85, LBONE, id);
    R.ball(a, n.r * 1.5, LBONE, id, 0.05);
    R.ball(e, n.r * 1.35, LBONE, id, 0.05);
  } else {
    // a rag of the cult's violet cloth, torn, hanging off the sticks
    const side: V3 = norm(cross(n.b.F, [0, 0, 1]));
    R.quad([a, e, add(e, add(mul(side, 4), [0, 0, -4])), add(a, add(mul(side, 4), [0, 0, -5]))], (u, v) => (fr(u * 4 + v) < 0.12 ? null : v > 0.6 ? RAG[1] : RAG[2]), id);
  }
}

/** The nest's hollow at its crown, lined with down, and the skulls in its weave. */
function paintNestCrown(R: Rig, k: number, jog: V3): void {
  const C = LEDGE_CHIMNEY;
  // its body: a mass of old sticks and droppings packed under what lies on it
  R.egg([C.nestA + jog[0], jog[1], 2 + k * 0.5], XYZ, [C.nestRa * 0.9, C.nestRb * 0.9, C.nestH * 0.86 + k], (n, w) => {
    const h = hash(Math.floor(w[0] / 2.2), Math.floor(w[1] / 2.2) + Math.floor(w[2] / 3) * 7, 985);
    if (h < 0.08) return LBONE[1];
    return toneAt(n, h < 0.5 ? STICK : FEATHER, -0.25);
  }, 399);
  R.egg([C.nestA + jog[0], jog[1], C.nestH - 3 + jog[2] + k], XYZ, [18, 15, 4], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 984) > 0.68 ? FEATHER[3] : toneAt(n, FEATHER, -0.08)), 400);
}

/** A VULTURE OF HER FLOCK in flight: its body along its way, its wings beating (`beat` 0..1 round), its bare grey head out before it. */
function vulture(R: Rig, p: V3, dir: V3, beat: number, id: number): void {
  const F = norm([dir[0], dir[1], Math.max(-0.4, Math.min(0.4, dir[2]))]);
  const side = norm(cross([0, 0, 1], F[0] || F[1] ? F : [1, 0, 0]));
  const up = norm(cross(F, side));
  const A: [V3, V3, V3] = [F, side, up];
  R.egg(p, A, [11, 6, 5.4], (n) => toneAt(n, FEATHER, 0.1), id);
  // its ruff, its neck and head
  const ruff = add(p, mul(F, 7));
  R.egg(ruff, A, [3.4, 4.2, 3.4], (n) => toneAt(n, LBONE, 0.05), id + 1);
  R.rod(add(ruff, mul(F, 2)), add(ruff, add(mul(F, 7), mul(up, 1.5))), 1.5, 1.3, VHEAD, id + 2);
  R.egg(add(ruff, add(mul(F, 9), mul(up, 1.6))), A, [2.8, 2, 2], (n) => toneAt(n, VHEAD, 0.05), id + 2);
  // its tail
  R.quad([add(p, mul(F, -7)), add(add(p, mul(F, -7)), mul(side, 3)), add(add(p, mul(F, -15)), mul(side, 5)), add(add(p, mul(F, -15)), mul(side, -5))], (u) => (fr(u * 4) < 0.15 ? FEATHER[0] : FEATHER[2]), id + 3);
  // its wings: up and down about its shoulders, fingered at their tips
  const ang = Math.sin(beat * Math.PI * 2) * 0.95;
  for (const s of [-1, 1]) {
    const out = norm(add(mul(side, s * Math.cos(ang)), mul(up, Math.sin(ang))));
    const root = add(p, mul(F, 3));
    const rootB = add(p, mul(F, -4));
    const tip = add(root, add(mul(out, 34), mul(F, -2)));
    const tipB = add(rootB, add(mul(out, 31), mul(F, -6)));
    R.quad([root, tip, tipB, rootB], (u, v) => {
      if (u > 0.76 && fr(v * 5) < 0.4) return null;
      if (Math.abs(fr(u * 9 + v * 0.4) - 0.5) < 0.06) return FEATHER[0];
      return v > 0.6 ? FEATHER[4] : v > 0.3 ? FEATHER[3] : FEATHER[2];
    }, id + 4 + (s > 0 ? 1 : 0));
  }
}
/** Her flock: where each bursts out from, its way and speed up and out, how fast it beats. */
interface Flier {
  p0: V3;
  v: V3;
  rate: number;
  ph: number;
}
function ledgeFlock(): Flier[] {
  const C = LEDGE_CHIMNEY;
  const out: Flier[] = [];
  for (let i = 0; i < 7; i++) {
    const th = (i / 7) * Math.PI * 2 + hash(i, 1, 985) * 0.6;
    const sp = 2.6 + hash(i, 2, 985) * 1.6;
    out.push({ p0: [C.nestA + Math.cos(th) * 8, Math.sin(th) * 8, C.nestH * 0.6], v: [Math.cos(th) * sp, Math.sin(th) * sp, 3.4 + hash(i, 3, 985) * 2.4], rate: 0.16 + hash(i, 4, 985) * 0.06, ph: hash(i, 5, 985) });
  }
  return out;
}
/** Where a flier is `k` frames after it burst out: flung up and out, beating on up and away. */
function flierAt(fl: Flier, k: number): { p: V3; v: V3 } {
  const up = 1 - Math.exp(-k / 14);
  const p: V3 = [fl.p0[0] + fl.v[0] * k * (0.6 + 0.4 * up), fl.p0[1] + fl.v[1] * k * (0.6 + 0.4 * up), fl.p0[2] + fl.v[2] * 14 * up + k * 1.2];
  return { p, v: [fl.v[0], fl.v[1], fl.v[2] * Math.exp(-k / 14) + 1.2] };
}

/** A feather drifting down: where it starts, its sway. */
interface Drift {
  p0: V3;
  v: V3;
  f0: number;
  seed: number;
}
function driftAt(d: Drift, f: number): V3 | null {
  const k = f - d.f0;
  if (k < 0) return null;
  const fall = Math.min(k, 8);
  let z = d.p0[2] + d.v[2] * fall - 0.5 * 0.6 * fall * fall - Math.max(0, k - 8) * 0.55;
  const sway = Math.sin(k * 0.21 + d.seed * 6) * 5;
  const x = d.p0[0] + d.v[0] * Math.min(k, 20) * 0.6 + sway * 0.5;
  const y = d.p0[1] + d.v[1] * Math.min(k, 20) * 0.6 + sway;
  z = Math.max(z, chimneyOpen(x, y) ? -300 : 0.6);
  return [x, y, z];
}
function paintFeather(R: Rig, c: V3, dir: number, len: number, id: number, up = 0.1): void {
  const A: V3 = norm([Math.cos(dir), Math.sin(dir), up]);
  const B: V3 = norm(cross([0, 0, 1], A));
  const Cc: V3 = norm(cross(A, B));
  R.egg(c, [A, B, Cc], [len, len * 0.24, 0.5], (n, w) => {
    const q = R.un(w[0] - R.P(c[0], c[1], c[2])[0], w[1] - R.P(c[0], c[1], c[2])[1]);
    const along = (q[0] * A[0] + q[1] * A[1]) / len;
    const across = (q[0] * B[0] + q[1] * B[1]) / (len * 0.24);
    if (Math.abs(across) < 0.14 && along > -0.9) return LBONE[3];
    return toneAt(n, FEATHER, across < 0 ? 0.1 : -0.05);
  }, id);
}

const ledgeCache = new Map<WayDir, WayArt>();
/** FLOOR 7'S WAY ON, THE CHIMNEY: shut, its film, open; leading `d`. */
export function ledgeWay(d: WayDir): WayArt {
  const had = ledgeCache.get(d);
  if (had) return had;
  const F = LEDGE_FILM;
  const hole = ledgeHole(d);
  const standing = ledgeStanding(d);
  const bits = nestBits();
  const flock = ledgeFlock();
  const drifts: Drift[] = [];
  for (let i = 0; i < 16; i++) {
    const th = hash(i, 1, 986) * Math.PI * 2;
    drifts.push({ p0: [LEDGE_CHIMNEY.nestA + Math.cos(th) * 10, Math.sin(th) * 10, 30 + hash(i, 2, 986) * 20], v: [Math.cos(th) * (1 + hash(i, 3, 986) * 2), Math.sin(th) * (1 + hash(i, 3, 986) * 2), 2 + hash(i, 4, 986) * 2], f0: F.burst + Math.floor(hash(i, 5, 986) * 10), seed: hash(i, 6, 986) });
  }
  const dust: Cloud[] = [];
  const paintFrame = (f: number, heave: number): { under: Px; over: Px } => {
    const U = hole.copy();
    const R = standing.copy();
    const swell = heave > 0 ? Math.sin(f * 1.7) * heave : 0;
    bits.forEach((n, i) => {
      // (fallen into the crack's dark: gone)
      if (n.b.p[2] < -36) return;
      const jog: V3 = !n.b.free && heave > 0 ? [(hash(f, i, 987) - 0.5) * heave, (hash(f, i, 988) - 0.5) * heave, swell * (n.b.p[2] / LEDGE_CHIMNEY.nestH)] : [0, 0, 0];
      paintNestBit(U, n, 500 + (i % 50), jog);
      paintNestBit(R, n, 500 + (i % 50), jog);
    });
    if (f < F.burst) {
      paintNestCrown(R, swell, [0, 0, 0]);
      paintNestCrown(U, swell, [0, 0, 0]);
    }
    U.under(chimneyOpen);
    U.S.seams();
    // the flock
    if (f >= F.burst) {
      flock.forEach((fl, i) => {
        const k = f - F.burst;
        const at = flierAt(fl, k);
        if (at.p[2] > 420) return;
        vulture(R, at.p, at.v, fl.ph + k * fl.rate, 800 + i * 8);
      });
    }
    // the feathers drifting down
    drifts.forEach((dd, i) => {
      const c = driftAt(dd, f);
      if (!c || c[2] < -2) return;
      paintFeather(R, c, dd.seed * 6 + f * 0.05, 5, 900 + i, c[2] > 1 ? 0.3 * Math.sin(f * 0.2 + i) : 0.05);
    });
    R.S.seams();
    paintDust(R, dust, f, L_DUST, L_DUST, (1 << 20) + 10);
    return { under: U.S.p, over: R.S.p };
  };
  const shutPx = paintFrame(-1, 0);
  const frames: Sprite[] = [];
  const kicks: { f: number; k: number }[] = [{ f: F.burst, k: 6 }];
  for (let f = 0; f < F.frames; f++) {
    if (f === F.burst) {
      // THE BURST: every bit of the nest flung up and out from its middle, turning
      bits.forEach((n, i) => {
        const o = sub(n.b.p, [LEDGE_CHIMNEY.nestA, 0, -6]);
        const L = Math.hypot(o[0], o[1], o[2]) || 1;
        const sp = 2.0 + hash(i, 1, 989) * 2.2;
        letGo(n.b, [(o[0] / L) * sp, (o[1] / L) * sp, 4 + hash(i, 2, 989) * 7], 990 + i, 0.15 + hash(i, 3, 989) * 0.3);
      });
      for (let i = 0; i < 5; i++) dust.push(cloud(f, [LEDGE_CHIMNEY.nestA + (hash(i, 1, 991) - 0.5) * 40, (hash(i, 2, 991) - 0.5) * 30, 10], [(hash(i, 3, 991) - 0.5) * 4, (hash(i, 4, 991) - 0.5) * 4, 1.6], 18 + 8 * hash(i, 5, 991), 992 + i, 50, 10, 14));
    }
    stepBodies(bits.map((n) => n.b), f, -Infinity, 0.9, ledgeGround);
    const heave = f >= F.heave && f < F.burst ? 1 + ((f - F.heave) / (F.burst - F.heave)) * 3 : 0;
    const p = paintFrame(f, heave);
    frames.push(whole(p.under, p.over, LAX, LAY, LW, LH));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: kicks.map((k) => k.f), kicks: kicks.map((k) => k.k) };
  const openPx = paintFrame(F.frames + 300, 0);
  const art: WayArt = {
    shut: { under: whole(shutPx.under, null, LAX, LAY, LW, LH), over: whole(null, shutPx.over, LAX, LAY, LW, LH) },
    film,
    open: { under: whole(openPx.under, null, LAX, LAY, LW, LH), over: whole(null, openPx.over, LAX, LAY, LW, LH) },
  };
  ledgeCache.set(d, art);
  return art;
}

// =================================================================================================
// FLOOR 8, ECHO CANYON: THE SLOT. At the gorge's end two great fins of the banded rock stand up out of the sand with a slot
// between them a man's width, a boulder wedged high across it, the sand of its floor going on into the shadow between
// them: the way on, down through the rock. SHUT: rockfall jammed in it, boulders and rubble heaped up to a man's height
// and more, a dead juniper caught in them. AS THE CANTOR DIES (everything he does comes back off the walls a beat
// later): a beat after he falls his last cry comes back off the canyon: the fins shudder, dust and pebbles shaken off
// them in a wave running toward the mouth; then the echo strikes the plug and blasts it out, boulders flung out of the
// slot, bouncing and rolling over the sand, a cloud of red dust blown out after them; the slot stands open.

export const CANYON_SLOT = {
  /** The fins: how far along the way they run, how far apart (the slot), how thick, how high. */
  long: 84,
  slot: 19,
  thick: 30,
  high: 112,
  /** The plug: how far along it reaches, how high it is heaped. */
  plugTo: 46,
  plugH: 52,
};
export const CANYON_FILM = { frames: 124, echoFrom: 6, blast: 34, fps: 30 } as const;
const CW = 640;
const CH = 560;
const CAX = 320;
const CAY = 360;
const RROCK: Ramp = ['#4c3832', '#6a4838', '#8a5c48', '#a4725a', '#bc8a6c'];
const RBAND: Ramp = ['#56423a', '#785848', '#98745c', '#b68c72', '#ccaa8e'];
const CAPROCK: Ramp = ['#5a4a44', '#7e6858', '#a48a74', '#c4aa90', '#dcc6ac'];
const C_SAND: Ramp = ['#9c6c52', '#b88462', '#cc9a74', '#dcb08a', '#ecc8a6'];
const C_BARK: Ramp = ['#3a302c', '#54463c', '#6e5e50', '#8a7a68', '#a49480'];
const C_DUST: Ramp = ['#9a6e58', '#ad7e64', '#c08f72', '#cfa182', '#dcb492'];

/** The fins: each in tiers, sheer as the canyon's own walls, set back as they go up. (a middle, b out from the slot, z bottom, half along, half across, height) */
const FIN_BEDS: ReadonlyArray<readonly [number, number, number, number, number, number]> = [
  [42, 0, 0, 50, 17, 58],
  [40, 2, 58, 44, 15, 34],
  [44, 3, 92, 30, 12, 20],
];
/** The rock's colour at height z on a face turned `n`: its beds in bands, pale caprock on top. */
function bandAt(n: V3, z: number, seed: number, top: boolean): string {
  if (top) return toneAt(n, CAPROCK, 0.1);
  const band = Math.floor(z / 9 + hash(seed, 1, 1001) * 0.4);
  const ramp = band % 3 === 1 ? RBAND : RROCK;
  let c = toneAt(n, ramp, 0.02);
  if (fr(z / 9) < 0.1) c = ramp[Math.max(0, ramp.indexOf(c) - 1)] ?? ramp[0];
  return c;
}
/** The canyon's ground under the slot, the way's own: the fins (their tops), the sand. */
function canyonGround(a: number, b: number): number {
  const C = CANYON_SLOT;
  if (a > -4 && a < C.long + 4 && Math.abs(b) > C.slot && Math.abs(b) < C.slot + 2 * C.thick) return C.high;
  return 0;
}

/** THE FINS, the chockstone, and the shadow of the slot going on between them. */
function canyonStanding(d: WayDir): Rig {
  const C = CANYON_SLOT;
  const R = new Rig(CW, CH, CAX, CAY, d, 0);
  // the slot's floor going on into its shadow
  R.quad([[0, -C.slot, 0.4], [C.long + 10, -C.slot, 0.4], [C.long + 10, C.slot, 0.4], [0, C.slot, 0.4]], (u, v) => {
    const k = clamp01((u - 0.2) / 0.7);
    const rip = fr(u * 14 + v * 0.6) < 0.12 ? C_SAND[1] : C_SAND[2];
    return mix(rip, HOLE_DARK, Math.min(0.92, k * 1.15));
  }, 90);
  let id = 100;
  for (const s of [-1, 1]) {
    FIN_BEDS.forEach(([am, bo, z0, ha, hb, hh], k) => {
      const bm = s * (C.slot + hb + Math.max(0, bo));
      R.box([am + (s > 0 ? 3 : -2) * k, bm, z0 + hh / 2], XYZ, [ha, hb, hh / 2], (f, u, v, n) => {
        const z = f < 2 ? z0 + v * hh : f < 4 ? z0 + u * hh : z0 + hh;
        const along = f < 2 ? u : f < 4 ? v : u;
        let c = bandAt(n, z, k + (s > 0 ? 10 : 0), f === 4);
        // its faces cut by the rain into flutes, and its edges worn
        if (f !== 4 && fr(along * (f < 2 ? 5 : 11) + hash(k, f, 1014) * 0.5) < 0.08) c = RROCK[Math.max(0, RROCK.indexOf(c) - 1)] ?? RROCK[0];
        if (f !== 4 && z > z0 + hh - 2.5) c = CAPROCK[3];
        // the slot's own side, in the shadow of the other fin
        const inner = (f === 2 && s < 0) || (f === 3 && s > 0);
        return inner ? mix(c, HOLE_DARK, 0.45 + clamp01(along) * 0.35) : c;
      }, id++);
    });
    // boulders fallen at its foot, so that it stands in the canyon as its walls do
    for (let i = 0; i < 3; i++) R.egg([10 + i * 30 + hash(i, s, 1015) * 10, s * (C.slot + 36 + hash(i, s, 1016) * 4), 4], XYZ, [7, 6, 5], facetOf(RROCK, 0.05), id++);
    // a juniper clinging to its top
    R.egg([30 + s * 6, s * (C.slot + 18), C.high + 6], XYZ, [11, 9, 8], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 1002) < 0.25 ? '#1f2a24' : toneAt(n, ['#1f2a24', '#2c3c32', '#3e5244', '#556a56', '#6e8268'], 0.05)), id++);
  }
  // THE CHOCKSTONE, wedged across the slot high up
  R.egg([60, 0, C.high * 0.66], XYZ, [13, C.slot + 8, 12], facetOf(CAPROCK, 0.02), id++);
  return R;
}

/** The plug's boulders, as loose round things (floor 4's), and the sizes of each. */
function canyonPlug(): Body[] {
  const C = CANYON_SLOT;
  const out: Body[] = [];
  const spots: ReadonlyArray<readonly [number, number, number, number]> = [
    // jammed in the slot, heaped up
    [14, -4, 15, 15], [16, 8, 13, 13], [36, 0, 15, 15], [24, 1, 40, 14], [42, -3, 42, 12], [30, 4, 62, 10],
    // spilled out of its mouth in a fan
    [-12, -10, 9, 9], [-10, 10, 8, 8], [-22, 2, 6, 6], [-4, 18, 6, 6], [-6, -20, 5, 5], [-28, -12, 4, 4], [-20, 16, 4, 4],
  ];
  spots.forEach(([a, b, z, r]) => out.push(body('ore', [a, a > 0 ? Math.max(-C.slot + r * 0.6, Math.min(C.slot - r * 0.6, b)) : b, z], r)));
  return out;
}

const canyonCache = new Map<WayDir, WayArt>();
/** FLOOR 8'S WAY ON, THE SLOT: shut, its film, open; leading `d`. */
export function canyonWay(d: WayDir): WayArt {
  const had = canyonCache.get(d);
  if (had) return had;
  const F = CANYON_FILM;
  const C = CANYON_SLOT;
  const standing = canyonStanding(d);
  const rocks = canyonPlug();
  const pebbles: Chip[] = [];
  const dust: Cloud[] = [];
  const paintFrame = (f: number, shake: number): Px => {
    const R = standing.copy();
    rocks.forEach((b, i) => {
      const j: V3 = shake > 0 && !b.free ? [(hash(f, i, 1003) - 0.5) * shake, (hash(f, i, 1004) - 0.5) * shake, hash(f, i, 1005) * shake] : [0, 0, 0];
      R.egg(add(b.p, j), [b.F, b.U, norm(cross(b.F, b.U))], [b.r * 1.15, b.r * 0.9, b.r * 0.78], facetOf(i % 3 === 1 ? RBAND : RROCK, 0.06), 400 + i);
    });
    // the dead juniper caught in the rockfall, and gone with it
    if (!rocks[5].free) {
      R.rod([28, -3, 58], [34, 8, 80], 1.8, 1.1, C_BARK, 450);
      R.rod([32, 4, 70], [22, 12, 86], 1.1, 0.6, C_BARK, 450);
      R.rod([33, 6, 74], [44, 0, 88], 1.1, 0.6, C_BARK, 450);
    }
    paintChips(R, pebbles, f, RROCK, 600);
    R.S.seams();
    paintDust(R, dust, f, C_DUST, C_DUST, (1 << 20) + 10);
    return R.S.p;
  };
  const shutPx = paintFrame(-1, 0);
  const frames: Sprite[] = [];
  const kicks: { f: number; k: number }[] = [];
  const seen = new Set<string>();
  for (let f = 0; f < F.frames; f++) {
    // THE ECHO COMING BACK: the fins shaken from their far end toward the mouth, dust and pebbles off them in a wave
    if (f >= F.echoFrom && f < F.blast && (f - F.echoFrom) % 3 === 0) {
      const k = (f - F.echoFrom) / (F.blast - F.echoFrom);
      const a = C.long - k * C.long;
      for (const s of [-1, 1]) {
        dust.push(cloud(f, [a, s * (C.slot + 2), 30 + hash(f, s, 1006) * 50], [-0.6, -s * 0.9, -0.4], 7 + 4 * hash(f, s, 1007), 1010 + f * 2 + (s > 0 ? 1 : 0), 34, 6, 10));
        for (let i = 0; i < 3; i++) pebbles.push(chip(f, [a + (hash(f, i, 1008) - 0.5) * 12, s * (C.slot + 1), 60 + hash(f, i, 1009) * 50], [-0.3, -s * (0.6 + hash(i, f, 1010)), 0.5], 0.8 + hash(i, s, 1011) * 1.6, 1100 + pebbles.length));
      }
    }
    if (f === F.blast) {
      kicks.push({ f, k: 8 });
      // THE ECHO STRIKES: the plug blasted out of the slot, toward the floor it guarded
      rocks.forEach((b, i) => {
        const out = b.p[0] > 0;
        const sp = (out ? 3.2 : 1.6) + hash(i, 1, 1012) * 2.6;
        const across = out ? b.p[1] * 0.04 + (hash(i, 3, 1012) - 0.5) * 0.6 : (hash(i, 3, 1012) - 0.5) * sp * 1.4;
        letGo(b, [-sp * (0.9 + 0.4 * hash(i, 2, 1012)), across, (out ? 2.5 : 2) + hash(i, 4, 1012) * 3], 1020 + i, 0.08 + hash(i, 5, 1012) * 0.16);
      });
      for (let i = 0; i < 7; i++) dust.push(cloud(f, [10 + i * 7, (hash(i, 1, 1013) - 0.5) * 20, 12 + i * 4], [-3.4 - hash(i, 2, 1013) * 2, (hash(i, 3, 1013) - 0.5) * 3, 0.8], 18 + 8 * hash(i, 4, 1013), 1030 + i, 64, 12, 18));
    }
    stepBodies(rocks, f, -Infinity, 0.94, canyonGround);
    stepChips(pebbles, f, canyonGround);
    rocks.forEach((b, i) => {
      for (const st of b.struck) {
        const key = `${i}:${st.f}`;
        if (st.f !== f || seen.has(key) || st.vz > -3) continue;
        seen.add(key);
        kicks.push({ f, k: Math.min(5, 1.5 + -st.vz * 0.4) });
        dust.push(cloud(f, [b.p[0], b.p[1], 2], [b.v[0] * 0.4, b.v[1] * 0.4, 0.3], 8 + b.r * 0.6, 1040 + i * 7 + dust.length, 40, 8, 12));
      }
    });
    const shake = f >= F.echoFrom && f < F.blast ? 0.6 + ((f - F.echoFrom) / (F.blast - F.echoFrom)) * 2.4 : 0;
    frames.push(whole(null, paintFrame(f, shake), CAX, CAY, CW, CH));
  }
  kicks.sort((p, q) => q.k - p.k || p.f - q.f);
  const kept: { f: number; k: number }[] = [];
  for (const k of kicks) if (kept.length < 8 && !kept.some((o) => Math.abs(o.f - k.f) < 3)) kept.push(k);
  kept.sort((p, q) => p.f - q.f);
  const film: WayFilm = { frames, fps: F.fps, jolts: kept.map((k) => k.f), kicks: kept.map((k) => Math.round(k.k)) };
  const openPx = paintFrame(F.frames + 300, 0);
  const empty = new Px(CW, CH);
  const art: WayArt = {
    shut: { under: whole(empty, null, CAX, CAY, CW, CH), over: whole(null, shutPx, CAX, CAY, CW, CH) },
    film,
    open: { under: whole(empty, null, CAX, CAY, CW, CH), over: whole(null, openPx, CAX, CAY, CW, CH) },
  };
  canyonCache.set(d, art);
  return art;
}

// =================================================================================================
// FLOOR 9, THE PINEWOOD: THE TWISTED WAY. Two great trees gone wrong with the swamp's sickness lean together over a trail
// into the wood toward the fen, their bark grey and split, their limbs twisted, a few clumps of needles gone violet;
// the trail runs on between them into the gloom under more of them. SHUT: the swamp's roots burst up out of the earth
// across the trail between them, a tangle of thick violet tendrils arching up and plunging back, veins of the Eye's
// pink in them. AS THE HOLLOW STAG DIES: the roots convulse, thrashing, their veins flaring; then they wither, greying
// and shrinking, and draw back down into the earth they came out of, leaving it torn; the trail is open.

export const PINE_WAY = {
  /** The trail: how far along it is seen, how wide either side. */
  trail: 120,
  half: 17,
  /** The two trees: where they stand, either side of the trail. */
  treeA: 16,
  treeB: 44,
};
export const PINE_FILM = { frames: 126, thrash: 4, wither: 34, gone: 96, fps: 30 } as const;
const PW = 640;
const PH = 560;
const PAX = 320;
const PAY = 420;
const SICKBARK: Ramp = ['#24222a', '#363440', '#4a4854', '#5e5c68', '#74727c'];
const SICKV: Ramp = ['#2a2034', '#3a2c48', '#4e3c5e', '#665078', '#7c6890'];
const DEADROOT: Ramp = ['#2a2420', '#3e342c', '#544638', '#6a5a48', '#7e6c58'];
const P_EARTH: Ramp = ['#44342a', '#5e4834', '#7a5e44', '#927656', '#ac926c'];
const P_NEEDLE: Ramp = ['#2a2017', '#3e3022', '#56432f', '#70583e', '#8c704d'];
const VEIN = '#c0206a';
const VEIN_HOT = '#ff4f8a';
const P_DUST: Ramp = ['#4a3a2c', '#5a4836', '#6c5842', '#7c684e', '#8c785a'];

/** A twisted trunk: from its foot up a wandering, twisting line, thinning; its limbs off it. */
function twistedTree(R: Rig, foot: V3, lean: V3, high: number, r0: number, seed: number, id: number): void {
  const n = 14;
  let prev = foot;
  let prevR = r0;
  const pts: V3[] = [foot];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const wob = Math.sin(t * 7 + seed) * 6 * t;
    const wob2 = Math.cos(t * 5 + seed * 2) * 5 * t;
    const p: V3 = [foot[0] + lean[0] * t * t * high + wob, foot[1] + lean[1] * t * t * high + wob2, foot[2] + high * (t - 0.18 * t * t)];
    const r = r0 * (1 - 0.72 * t);
    R.rod(prev, p, prevR, r, SICKBARK, id);
    pts.push(p);
    prev = p;
    prevR = r;
  }
  // its roots at its foot, flared out over the earth
  for (let k = 0; k < 5; k++) {
    const ang = (k / 5) * Math.PI * 2 + seed;
    R.rod([foot[0], foot[1], 6], [foot[0] + Math.cos(ang) * r0 * 2.4, foot[1] + Math.sin(ang) * r0 * 2.4, 0.5], r0 * 0.5, r0 * 0.18, SICKBARK, id);
  }
  // its limbs, bare and twisted, out from its upper half, each forking into twigs
  for (let k = 0; k < 7; k++) {
    const at = pts[5 + k];
    if (!at) continue;
    const ang = seed * 3 + k * 2.1;
    const L = 24 + hash(seed * 10, k, 1101) * 22;
    const mid: V3 = [at[0] + Math.cos(ang) * L * 0.5, at[1] + Math.sin(ang) * L * 0.5, at[2] + L * 0.18];
    const tip: V3 = [at[0] + Math.cos(ang + 0.6) * L, at[1] + Math.sin(ang + 0.6) * L, at[2] + L * (0.05 + hash(seed, k, 1102) * 0.45)];
    R.rod(at, mid, r0 * 0.3, r0 * 0.18, SICKBARK, id + 1);
    R.rod(mid, tip, r0 * 0.18, r0 * 0.07, SICKBARK, id + 1);
    for (let j = 0; j < 3; j++) {
      const ta = ang + 0.6 + (j - 1) * 0.9 + hash(k, j, 1103) * 0.4;
      const tl = 8 + hash(j, k, 1104) * 8;
      R.rod(tip, [tip[0] + Math.cos(ta) * tl, tip[1] + Math.sin(ta) * tl, tip[2] + (hash(k, j, 1105) - 0.3) * tl], r0 * 0.07, 0.4, SICKBARK, id + 1);
    }
    // grey moss hanging off a few
    if (k % 3 === 1) R.rod(mid, [mid[0], mid[1], mid[2] - 14 - hash(k, 1, 1106) * 8], 1.6, 0.5, ['#262c22', '#363e2e', '#4a523c', '#5e6650', '#747c64'], id + 2);
  }
}

/** The trees, the trail, and the wood going on into the gloom. */
function pineStanding(d: WayDir): Rig {
  const P = PINE_WAY;
  const R = new Rig(PW, PH, PAX, PAY, d, 0);
  // the trail, its ruts, on into the shadow under the trees
  R.quad([[-12, -P.half, 0.3], [P.trail, -P.half * 0.8, 0.3], [P.trail, P.half * 0.8, 0.3], [-12, P.half, 0.3]], (u, v) => {
    const rut = Math.abs(v - 0.3) < 0.05 || Math.abs(v - 0.7) < 0.05;
    let c = rut ? P_EARTH[1] : hash(Math.floor(u * 40), Math.floor(v * 8), 1104) < 0.12 ? P_NEEDLE[2] : P_EARTH[2];
    if (v < 0.06 || v > 0.94) c = P_NEEDLE[1];
    // (it runs on into the wood's own ground and is lost in it, its edges ragged)
    const fade = clamp01((u - 0.55) / 0.42) + (Math.min(v, 1 - v) < 0.08 ? 0.3 : 0);
    if (hash(Math.floor(u * 120), Math.floor(v * 40), 1107) < fade) return null;
    return mix(c, HOLE_DARK, Math.min(0.5, clamp01((u - 0.4) / 0.6) * 0.5));
  }, 90);
  // the two trees leaning together over it, and two more beyond in the gloom
  twistedTree(R, [P.treeA, -P.treeB, 0], [0.04, 0.42, 0], 150, 12, 1.3, 100);
  twistedTree(R, [P.treeA + 6, P.treeB, 0], [-0.04, -0.44, 0], 156, 13, 4.1, 110);
  twistedTree(R, [P.treeA + 96, -P.treeB - 8, 0], [0.1, 0.24, 0], 128, 9, 2.7, 120);
  twistedTree(R, [P.treeA + 104, P.treeB + 6, 0], [-0.1, -0.26, 0], 134, 9.5, 5.9, 130);
  return R;
}

/** A root of the swamp's: from where it comes up to where it goes back down, how high it arches, how thick. */
interface SickRoot {
  p0: V3;
  p1: V3;
  h: number;
  r: number;
  seed: number;
}
function sickRoots(): SickRoot[] {
  const out: SickRoot[] = [];
  for (let i = 0; i < 17; i++) {
    const a0 = -2 + hash(i, 1, 1105) * 50;
    const b0 = (hash(i, 2, 1105) - 0.5) * 2 * 30;
    const ang = hash(i, 3, 1105) * Math.PI * 2;
    const L = 26 + hash(i, 4, 1105) * 26;
    out.push({ p0: [a0, b0, 0], p1: [a0 + Math.cos(ang) * L, b0 + Math.sin(ang) * L * 0.8, 0], h: 16 + hash(i, 5, 1105) * 30, r: 2.4 + hash(i, 6, 1105) * 2.4, seed: hash(i, 7, 1105) * 10 });
  }
  return out;
}
/** A root as it is on frame `f`: thrashing (`thrash` 0..), withering (`w` 0..1: greyed, thinned, drawn down into the earth). */
function paintRoot(R: Rig, rt: SickRoot, f: number, thrash: number, w: number, id: number): void {
  const n = 12;
  let prev: V3 | null = null;
  let prevR = 0;
  const ramp = w > 0 ? (w < 0.5 ? SICKV : DEADROOT) : SICKV;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const base = add(mul(rt.p0, 1 - t), mul(rt.p1, t));
    const lift = Math.sin(Math.PI * t) * rt.h;
    const writhe = thrash * Math.sin(t * Math.PI * 3 + f * 0.9 + rt.seed) * (0.4 + 0.6 * Math.sin(Math.PI * t));
    const across: V3 = norm([-(rt.p1[1] - rt.p0[1]), rt.p1[0] - rt.p0[0], 0]);
    // withering: drawn down into the earth, the arch sinking below it
    const sink = w * (rt.h + 14);
    const p: V3 = add(base, add(mul(across, writhe), [0, 0, lift - sink + Math.sin(t * 9 + rt.seed) * 2]));
    const r = rt.r * (1 - 0.35 * Math.abs(t - 0.5) * 2) * (1 - 0.5 * w);
    if (prev) {
      // (a little of each root, so that its veins show)
      R.rod(prev, p, prevR, r, w > 0.6 ? DEADROOT : ramp, id);
      if (w < 0.55 && i % 3 === 1) {
        const hot = thrash > 1 && Math.sin(f * 0.8 + rt.seed + i) > 0.2;
        const mid = mul(add(prev, p), 0.5);
        const [x, y] = R.S.at(R.P(mid[0], mid[1], mid[2] + r * 0.7));
        const ww = R.P(mid[0], mid[1], mid[2] + r);
        if (ww[2] >= 0) R.S.put(Math.round(x), Math.round(y), ww[0] * 0.61 + ww[1] * 0.61 + ww[2] * 0.5 + r, hot ? VEIN_HOT : VEIN, id, ww[2]);
      }
    }
    prev = p;
    prevR = r;
  }
}

const pineCache = new Map<WayDir, WayArt>();
/** FLOOR 9'S WAY ON, THE TWISTED WAY: shut, its film, open; leading `d`. */
export function pinewoodWay(d: WayDir): WayArt {
  const had = pineCache.get(d);
  if (had) return had;
  const F = PINE_FILM;
  const standing = pineStanding(d);
  const roots = sickRoots();
  const clods: Chip[] = [];
  const dust: Cloud[] = [];
  /** The torn earth where each root went back down: dark, turned up. */
  const torn = (R: Rig, k: number): void => {
    if (k <= 0) return;
    roots.forEach((rt, i) => {
      for (const p of [rt.p0, rt.p1]) {
        R.egg([p[0], p[1], 0.2], XYZ, [rt.r * 2.2 * k, rt.r * 1.8 * k, 1.2], (n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 1106 + i) < 0.4 ? P_EARTH[0] : toneAt(n, P_EARTH, -0.2)), 300 + i);
      }
    });
  };
  const paintFrame = (f: number, thrash: number, w: number): Px => {
    const R = standing.copy();
    torn(R, Math.min(1, w * 2));
    if (w < 1) roots.forEach((rt, i) => paintRoot(R, rt, f, thrash, Math.max(0, Math.min(1, w * (1.2 - hash(i, 9, 1107) * 0.4))), 400 + i));
    paintChips(R, clods, f, P_EARTH, 600);
    R.S.seams();
    paintDust(R, dust, f, P_DUST, P_DUST, (1 << 20) + 10);
    return R.S.p;
  };
  const shutPx = paintFrame(0, 0.3, 0);
  const frames: Sprite[] = [];
  const kicks: { f: number; k: number }[] = [];
  for (let f = 0; f < F.frames; f++) {
    const thrash = f < F.thrash ? 0.3 : f < F.wither ? 0.3 + ((f - F.thrash) / (F.wither - F.thrash)) * 6 : Math.max(0, 6 - (f - F.wither) * 0.4);
    const w = f < F.wither ? 0 : Math.min(1, (f - F.wither) / (F.gone - F.wither));
    if (f === F.wither) {
      kicks.push({ f, k: 5 });
      // the earth heaved as they go: clods thrown up where each comes out of it, a pall of dust
      roots.forEach((rt, i) => {
        for (const p of [rt.p0, rt.p1]) for (let k = 0; k < 2; k++) clods.push(chip(f + (i % 5), [p[0], p[1], 2], [(hash(i, k, 1108) - 0.5) * 3, (hash(k, i, 1108) - 0.5) * 3, 2.5 + hash(i, k, 1109) * 3], 1 + hash(i, k, 1110) * 1.6, 1200 + clods.length));
      });
      for (let i = 0; i < 6; i++) dust.push(cloud(f + i * 3, [5 + i * 8, (hash(i, 1, 1111) - 0.5) * 40, 4], [(hash(i, 2, 1111) - 0.5) * 2, (hash(i, 3, 1111) - 0.5) * 2, 0.8], 14 + 6 * hash(i, 4, 1111), 1120 + i, 60, 12, 16));
    }
    if (f === F.wither + 22) kicks.push({ f, k: 3 });
    stepChips(clods, f, () => 0);
    frames.push(whole(null, paintFrame(f, thrash, w), PAX, PAY, PW, PH));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: kicks.map((k) => k.f), kicks: kicks.map((k) => k.k) };
  const openPx = paintFrame(F.frames + 300, 0, 1);
  const empty = new Px(PW, PH);
  const art: WayArt = {
    shut: { under: whole(empty, null, PAX, PAY, PW, PH), over: whole(null, shutPx, PAX, PAY, PW, PH) },
    film,
    open: { under: whole(empty, null, PAX, PAY, PW, PH), over: whole(null, openPx, PAX, PAY, PW, PH) },
  };
  pineCache.set(d, art);
  return art;
}

// =================================================================================================
// FLOOR 10, THE SUNKEN FEN: THE CAUSEWAY. An old paved causeway, older than the fen, running on from the ruin's ring out
// over the black water toward the city, broken stone posts along its sides. SHUT: sunk under the water, only the posts'
// heads showing, the paving a pale ghost under the murk. AS THE DROWNED EYE DIES: the water over it heaves, rings
// running out across it and bubbles breaking; then the causeway rises up out of the fen, its stones streaming water off
// their sides in sheets, weed hanging from them, and settles with a slap and a wave rolling out from it; it drips; the
// way to the city stands above the water.

export const FEN_CAUSEWAY = {
  /** From the ring (a 0) on along the way, how far it is seen; how wide either side; how far under the water it lies, and how high over it once risen. */
  long: 200,
  half: 30,
  sunk: -11,
  risen: 5,
};
export const FEN_FILM = { frames: 130, heave: 0, rise: 22, up: 74, fps: 30 } as const;
const FW = 760;
const FH = 480;
const FAX = 380;
const FAY = 240;
const FZ0 = 30;
const RUIN: Ramp = ['#29272e', '#3a3741', '#4e4a56', '#64606c', '#7c7884'];
const FEN_W: Ramp = ['#101814', '#16211b', '#1c2a22', '#23332a', '#2b3d32'];
const FEN_SHINE = '#506252';
const SLIME: Ramp = ['#202a18', '#2c3820', '#3a4828', '#4a5a32', '#5a6a3c'];
const WEED: Ramp = ['#28331c', '#344224', '#42532c', '#53663a', '#62763f'];
const FOAM: Ramp = ['#3c4a44', '#4e5c56', '#64726a', '#7c8a80', '#96a298'];

/** The posts along the causeway: where along, which side, how high, how far broken and leaning. */
const FEN_POSTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [8, -1, 30, 0.05], [8, 1, 26, 0.25], [56, -1, 16, 0.35], [56, 1, 32, 0.0], [104, -1, 28, 0.12], [104, 1, 12, 0.4], [152, -1, 22, 0.2], [152, 1, 30, 0.08], [196, -1, 18, 0.15], [196, 1, 24, 0.1],
];

/** The causeway at height `e` (its top over the floor's water): its paving, its kerbs, its posts; streaming (`wet` 0..1: water running off it, weed hanging). */
function paintCauseway(R: Rig, e: number, wet: number, f: number): void {
  const C = FEN_CAUSEWAY;
  const top = e;
  const foot = -40;
  // its paving: great slabs in courses across it, worn, slimed toward its edges
  R.quad([[-6, -C.half, top], [C.long, -C.half, top], [C.long, C.half, top], [-6, C.half, top]], (u, v) => {
    const a = -6 + u * (C.long + 6);
    const b = (v - 0.5) * 2 * C.half;
    const course = Math.floor(a / 15);
    const joint = fr(a / 15) < 0.06 || fr((b + C.half + (course % 2) * 9) / 18) < 0.05;
    const h = hash(course, Math.floor((b + C.half + (course % 2) * 9) / 18), 1201);
    let c = joint ? RUIN[1] : h < 0.3 ? RUIN[3] : RUIN[2];
    if (Math.abs(b) > C.half - 5 && hash(Math.floor(a / 2), Math.floor(b / 2), 1202) < 0.5) c = SLIME[2];
    // wet, it shines; and the water still running off it in rills
    if (wet > 0 && hash(Math.floor(a / 3) + f, Math.floor(b / 3), 1203) < wet * 0.25) c = FEN_SHINE;
    return c;
  }, 50);
  // its sides, down into the water, dark and slimed, weed hanging off them
  for (const s of [-1, 1]) {
    R.quad([[-6, s * C.half, top], [C.long, s * C.half, top], [C.long, s * C.half, foot], [-6, s * C.half, foot]], (u, v) => {
      const z = top + (foot - top) * v;
      const a = -6 + u * (C.long + 6);
      if (z < -0.5 && e > C.sunk + 1) return null;
      let c = fr(z / 9) < 0.12 ? RUIN[0] : s < 0 ? RUIN[2] : RUIN[1];
      if (z < top - 3) c = hash(Math.floor(a / 3), Math.floor(z / 2), 1204) < 0.55 ? SLIME[1] : c;
      // the water streaming off it in sheets
      if (wet > 0 && hash(Math.floor(a / 4), Math.floor((z + f * 2.5) / 3), 1205) < wet * 0.7) c = FOAM[2 + (hash(Math.floor(a), Math.floor(z + f * 3), 1206) < 0.3 ? 1 : 0)];
      return c;
    }, 51 + (s > 0 ? 1 : 0));
    // weed trailing off its edge
    for (let i = 0; i < 12; i++) {
      const a = 4 + i * 16 + hash(i, s, 1207) * 6;
      const L = 6 + hash(i, s, 1208) * 9;
      R.rod([a, s * (C.half + 0.5), top - 0.5], [a + 1, s * (C.half + 1.5), top - L * (0.6 + 0.4 * wet)], 1.1, 0.4, WEED, 60 + i);
    }
  }
  // its posts, broken, leaning
  FEN_POSTS.forEach(([a, s, h, lean], i) => {
    const b = s * (C.half - 3);
    const foot2: V3 = [a, b, top];
    const head: V3 = [a + lean * 4, b + s * lean * h, top + h];
    R.rod(foot2, head, 5.6, 4.8, RUIN, 70 + i);
    R.egg(head, XYZ, [5.4, 5.4, 3.2], facetOf(RUIN, 0.1), 70 + i);
    if (wet > 0) R.rod([a, b + s * 3, top + h * 0.6], [a, b + s * 3.4, top + h * 0.6 - 5 - wet * 6], 1, 0.5, WEED, 80 + i);
  });
}

/** The fen's water over and round the causeway: black, a little light on it; `rings` running out from it as it heaves. */
function paintFenWater(R: Rig, f: number, rings: number, k: number): void {
  const C = FEN_CAUSEWAY;
  R.quad([[-8, -C.half - 10, 0], [C.long + 2, -C.half - 10, 0], [C.long + 2, C.half + 10, 0], [-8, C.half + 10, 0]], (u, v) => {
    const a = -8 + u * (C.long + 10);
    const b = (v - 0.5) * 2 * (C.half + 10);
    const edge = Math.min(u, 1 - u, v, 1 - v);
    // (its edges lost in the fen's own water)
    if (hash(Math.floor(a), Math.floor(b), 1209) > edge * 9) return null;
    let c = hash(Math.floor(a / 5), Math.floor(b / 2), 1210) < 0.1 ? FEN_W[3] : FEN_W[2];
    if (rings > 0) {
      const r = Math.hypot((a - C.long * 0.4) * 0.5, b);
      if (Math.abs(fr(r / 14 - f * 0.08) - 0.5) < 0.06 * rings) c = FEN_SHINE;
    }
    return c;
  }, 10 + k);
}

const fenCache = new Map<WayDir, WayArt>();
/** FLOOR 10'S WAY ON, THE CAUSEWAY: shut, its film, open; leading `d`. */
export function fenWay(d: WayDir): WayArt {
  const had = fenCache.get(d);
  if (had) return had;
  const F = FEN_FILM;
  const C = FEN_CAUSEWAY;
  const splash: Chip[] = [];
  const dust: Cloud[] = [];
  const paintFrame = (f: number, e: number, wet: number, rings: number): Px => {
    const R = new Rig(FW, FH, FAX, FAY, d, FZ0);
    paintCauseway(R, e, wet, f);
    if (e < 0) {
      // under the water: the murk over it, the paving a ghost through it
      const depth = -e;
      const W = new Rig(FW, FH, FAX, FAY, d, FZ0);
      paintFenWater(W, f, rings, 0);
      for (let y = 0; y < FH; y++) {
        for (let x = 0; x < FW; x++) {
          const i = y * FW + x;
          const wc = W.S.p.get(x, y);
          // (what stands up out of the water, the posts' heads, is seen as it is)
          if (R.S.p.get(x, y) && R.S.hz[i] > FZ0 + 0.5) continue;
          if (!wc) {
            // (under the water, nothing is seen past its own sheet)
            if (R.S.p.get(x, y)) {
              R.S.p.erase(x, y);
              R.S.id[i] = -1;
              R.S.z[i] = -Infinity;
            }
            continue;
          }
          const under = R.S.p.get(x, y);
          R.S.p.set(x, y, under && R.S.id[i] >= 50 ? mix(under, wc, Math.min(0.9, 0.42 + depth * 0.03)) : wc);
          R.S.id[i] = 10;
        }
      }
    } else paintFenWater(R, f, rings, 1);
    paintChips(R, splash, f, FOAM, 600);
    R.S.seams();
    paintDust(R, dust, f, FOAM, FOAM, (1 << 20) + 10);
    return R.S.p;
  };
  const rise = (f: number): number => {
    if (f < F.rise) return C.sunk;
    const t = clamp01((f - F.rise) / (F.up - F.rise));
    // up out of it, a little past, and back down onto its bed with a slap
    const ov = Math.sin(Math.PI * clamp01((f - F.up) / 10)) * (f > F.up ? 2 : 0);
    return C.sunk + (C.risen - C.sunk) * smooth(t) + ov;
  };
  const shutPx = paintFrame(-1, C.sunk, 0, 0);
  const frames: Sprite[] = [];
  const kicks: { f: number; k: number }[] = [{ f: F.rise, k: 4 }, { f: F.up, k: 6 }];
  for (let f = 0; f < F.frames; f++) {
    const e = rise(f);
    const wet = f < F.rise ? 0 : f < F.up ? 1 : Math.max(0, 1 - (f - F.up) / 50);
    const rings = f < F.up + 30 ? Math.min(1, f / 8) : Math.max(0, 1 - (f - F.up - 30) / 20);
    // bubbles and then the water thrown off its sides as it breaks the surface; the slap as it settles
    if (f >= 4 && f < F.rise && f % 2 === 0) for (let i = 0; i < 2; i++) splash.push(chip(f, [hash(f, i, 1211) * C.long, (hash(i, f, 1211) - 0.5) * 2 * C.half, 0.5], [0, 0, 1.2 + hash(f, i, 1212)], 1, 1300 + splash.length));
    if (f >= F.rise + 20 && f < F.up && f % 2 === 0) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) splash.push(chip(f, [hash(f, i + s, 1213) * C.long, s * (C.half + 1), e], [0, s * (0.6 + hash(i, f, 1214)), 1 + hash(f, i, 1215) * 2], 1 + hash(i, s, 1216) * 0.8, 1400 + splash.length));
    if (f === F.up) {
      for (let i = 0; i < 13; i++) for (const s of [-1, 1]) splash.push(chip(f, [i * 15, s * (C.half + 2), 1], [(hash(i, s, 1217) - 0.5), s * (1.5 + hash(i, s, 1218) * 2), 3 + hash(i, s, 1219) * 3], 1.2 + hash(i, s, 1220), 1500 + splash.length));
      for (let i = 0; i < 7; i++) dust.push(cloud(f, [10 + i * 30, (i % 2 ? 1 : -1) * (C.half + 4), 3], [0, (i % 2 ? 1 : -1) * 1.5, 0.5], 12 + 4 * hash(i, 1, 1221), 1230 + i, 30, 6, 10));
    }
    stepChips(splash, f, (a, b) => (Math.abs(b) < C.half && a > -6 && a < C.long ? Math.max(0, e) : -60));
    frames.push(whole(null, paintFrame(f, e, wet, rings), FAX, FAY, FW, FH));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: kicks.map((k) => k.f), kicks: kicks.map((k) => k.k) };
  const openPx = paintFrame(F.frames + 300, C.risen, 0, 0);
  const empty = new Px(FW, FH);
  const art: WayArt = {
    shut: { under: whole(shutPx, null, FAX, FAY, FW, FH), over: whole(empty, null, FAX, FAY, FW, FH) },
    film,
    open: { under: whole(openPx, null, FAX, FAY, FW, FH), over: whole(empty, null, FAX, FAY, FW, FH) },
  };
  fenCache.set(d, art);
  return art;
}

// =================================================================================================
// WHERE EACH FLOOR BEGINS: what he came down out of, behind him where he stands (`d`: the way back, from the floor toward
// where he begins: the piece lies that way of him, its mouth toward the floor). Each in its floor's own look.

const SW = 560;
const SH = 440;
const SAX = 280;
const SAY = 300;
/** A start piece as the game stands it, from one rig: nothing under, all of it standing. */
function startOf(R: Rig): StartArt {
  R.S.seams();
  return { under: new Px(R.w, R.h).sprite(R.ax, R.ay, GRAIN), over: compose(null, [R.S.p]).sprite(R.ax, R.ay, GRAIN) };
}
const startCache = new Map<string, StartArt>();
function cachedStart(key: string, make: () => StartArt): StartArt {
  const had = startCache.get(key);
  if (had) return had;
  const s = make();
  startCache.set(key, s);
  return s;
}

/** A RAMP of the way's own: from (a0, z0) up to (a1, z1), `half` wide either side, its top by `top(u, v)`, its sides of rubble. */
function ramp(R: Rig, a0: number, a1: number, z1: number, half: number, top: (u: number, v: number) => string | null, side: Ramp, id: number): void {
  R.quad([[a0, -half, 0.3], [a1, -half, z1], [a1, half, z1], [a0, half, 0.3]], top, id);
  for (const s of [-1, 1]) {
    // its side, sloping out to the floor
    R.quad([[a0, s * half, 0.3], [a1, s * half, z1], [a1, s * (half + z1 * 0.7), 0], [a0 + 4, s * (half + 2), 0]], (u, v) => {
      const h = hash(Math.floor(u * 30), Math.floor(v * 10), id + s);
      return h < 0.18 ? side[1] : h > 0.85 ? side[3] : side[2];
    }, id + 1 + (s > 0 ? 1 : 0));
  }
  // its far end: the road going on up out of sight, in shadow
  R.quad([[a1, -half, z1], [a1 + 20, -half, z1 + 12], [a1 + 20, half, z1 + 12], [a1, half, z1]], (u) => mix(side[3], HOLE_DARK, 0.3 + u * 0.4), id + 3);
}

/** FLOOR 6 BEGINS: THE ROAD DOWN FROM THE TOWN'S GATE, the cart road coming down a ramp of the quarry's spoil into the pit, its ruts, timber kerbs along it, a cairn of cut stone at its foot. */
export function quarryStart(d: WayDir): StartArt {
  return cachedStart('q' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const L0 = 12;
    const L1 = 130;
    const Z1 = 56;
    const half = 26;
    ramp(R, L0, L1, Z1, half, (u, v) => {
      const rut = Math.abs(v - 0.32) < 0.04 || Math.abs(v - 0.68) < 0.04;
      if (rut) return Q_DUST[1];
      return hash(Math.floor(u * 50), Math.floor(v * 12), 1301) < 0.1 ? STONE[1] : Q_DUST[3];
    }, STONE, 100);
    // timber kerbs along its edges
    for (const s of [-1, 1]) timber(R.S, R.P(L0 + 2, s * (half - 2), 2.5), R.P(L1, s * (half - 2), Z1 + 2.5), 2.2, 110 + (s > 0 ? 1 : 0));
    // the cairn at its foot, cut stones piled, a chalked stone on top
    const cairn: ReadonlyArray<readonly [number, number, number, number]> = [[0, 0, 6, 9], [4, -3, 16, 7], [-2, 2, 25, 6], [1, 0, 33, 5]];
    cairn.forEach(([a, b, z, r], i) => R.box([L0 - 4 + a, half + 14 + b, z], XYZ, [r, r * 0.9, r * 0.7], (f, u, v, n) => (i === 3 && f === 1 && Math.abs(u - 0.5) < 0.1 ? CHALK : dressed(STONE, n, f, u, v, 1310 + i, false, 4)), 120 + i));
    return startOf(R);
  });
}

/** FLOOR 7 BEGINS: THE FOOT OF THE STAIR FROM THE QUARRY, cut down the face of a spur of the mountain's rock onto the road. */
export function ledgeStart(d: WayDir): StartArt {
  return cachedStart('l' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const A0 = 14;
    const A1 = 96;
    const H = 74;
    const half = 52;
    const cut = 15;
    // the spur: a mass of the rock either side of the stair's cut, and behind its head
    const spur = (cb: number, hb: number, a0: number, id: number): void => {
      R.box([(a0 + A1) / 2 + 6, cb, H / 2], XYZ, [(A1 - a0) / 2, hb, H / 2], (f, u, v, n) => {
        const z = f < 2 ? v * H : f < 4 ? u * H : H;
        let c = facetOf(LROCK, 0.04)(n);
        if (f !== 4 && fr(z / 15 + (f < 2 ? u : v) * 0.3) < 0.1) c = LROCK[0];
        if (f === 4) c = hash(Math.floor(u * 20), Math.floor(v * 26), 1320 + id) < 0.2 ? '#4a6a46' : toneAt(n, LROCK, 0.1);
        return c;
      }, id);
    };
    spur(-(cut + (half - cut) / 2), (half - cut) / 2, A0, 100);
    spur(cut + (half - cut) / 2, (half - cut) / 2, A0, 101);
    spur(0, cut, A0 + 84, 102);
    // the steps, down the cut from the top to the road
    const n = 11;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const a = A0 + 4 + (1 - t) * 0 + t * (A1 - A0 - 10);
      const z = (k + 1) * (H / n);
      R.box([A0 + 4 + k * 7.6, 0, z / 2], XYZ, [3.9, cut, z / 2], (f, u, v, nn) => (f === 4 ? (u < 0.18 ? LROCK[4] : LROCK[3]) : f === 1 ? LROCK[1] : toneAt(nn, LROCK, -0.1)), 110 + k);
      void a;
    }
    // a rope rail on iron stakes down its side
    for (let k = 0; k < 4; k++) R.rod([A0 + 4 + k * 24, -cut + 2, (k * 24 / 7.6 + 1) * (H / n)], [A0 + 4 + k * 24, -cut + 2, (k * 24 / 7.6 + 1) * (H / n) + 14], 0.9, 0.8, IRON, 130 + k);
    ropeIn(R.S, R.P(A0 + 4, -cut + 2, H / n + 14), R.P(A0 + 76, -cut + 2, (76 / 7.6 + 1) * (H / n) + 14), 3, 135, 0.6);
    return startOf(R);
  });
}

/** FLOOR 8 BEGINS: THE FOOT OF THE PLANK STAIR, pinned down the face of a pillar of the canyon's rock from the eyrie above. */
export function canyonStart(d: WayDir): StartArt {
  return cachedStart('c' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const A0 = 22;
    const H = 150;
    // the pillar: in tiers, banded, its face toward the floor
    const tiers: ReadonlyArray<readonly [number, number, number, number]> = [[56, 36, 0, 64], [54, 32, 64, 50], [52, 26, 114, 36]];
    tiers.forEach(([am, hb, z0, hh], k) => R.box([am, 0, z0 + hh / 2], XYZ, [am - A0 - k * 3, hb, hh / 2], (f, u, v, n) => {
      const z = f < 2 ? z0 + v * hh : f < 4 ? z0 + u * hh : z0 + hh;
      return bandAt(n, z, k + 20, f === 4);
    }, 100 + k));
    // the planks, pinned across its face one under another in a zigzag, a rope along them
    const n = 12;
    let prev: V3 | null = null;
    for (let k = 0; k < n; k++) {
      const z = H - 8 - k * ((H - 10) / n);
      const b = (k % 2 ? 1 : -1) * 10 + (k / n - 0.5) * 8;
      R.box([A0 - 5, b, z], XYZ, [5, 9, 1.3], (f, u, v, nn) => (f === 4 ? (fr(v * 3) < 0.08 ? DRIFT[1] : DRIFT[3]) : toneAt(nn, DRIFT, -0.2)), 110 + k);
      R.rod([A0 - 1, b + 6, z - 1.5], [A0 + 1, b + 6, z - 4], 0.7, 0.6, IRON, 125);
      const p: V3 = [A0 - 9, b + 8, z + 10];
      if (prev) ropeIn(R.S, R.P(prev[0], prev[1], prev[2]), R.P(p[0], p[1], p[2]), 2, 130, 0.55);
      prev = p;
    }
    // the last of them at the foot, on stones
    R.egg([A0 - 8, 0, 3], XYZ, [8, 7, 4], facetOf(RROCK, 0.05), 140);
    return startOf(R);
  });
}

/** FLOOR 9 BEGINS: THE SLOT'S OTHER END, a cleft between two great mossy boulders of granite, the stream out of the canyon running out of it with him. */
export function pinewoodStart(d: WayDir): StartArt {
  return cachedStart('p' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const GRANITE: Ramp = ['#3c3e3c', '#545854', '#6e726c', '#8a8e86', '#a6a89e'];
    const MOSS: Ramp = ['#26301f', '#34422a', '#465a34', '#5a7040', '#728a52'];
    const WATER: Ramp = ['#26303e', '#2f3b4c', '#3a485c', '#4a5a70', '#6c7e96'];
    // the stream, out of the cleft and away over the floor, lost in it
    R.quad([[-40, -9, 0.4], [100, -8, 0.4], [100, 8, 0.4], [-40, 9, 0.4]], (u, v) => {
      if (hash(Math.floor(u * 90), Math.floor(v * 12), 1330) < clamp01((0.3 - u) / 0.3)) return null;
      const rip = fr(u * 22 + Math.sin(v * 6) * 0.3) < 0.1 ? WATER[4] : WATER[2];
      return mix(rip, HOLE_DARK, clamp01((u - 0.55) / 0.45) * 0.7);
    }, 90);
    // the two boulders, the cleft between them going back into shadow
    let id = 100;
    for (const s of [-1, 1]) {
      const lumps: ReadonlyArray<readonly [number, number, number, number, number, number]> = [[40, 34, 22, 40, 24, 26], [74, 30, 40, 30, 20, 22], [22, 46, 12, 18, 16, 14]];
      for (const [a, bo, z, ra, rb, rz] of lumps) {
        R.egg([a, s * bo, z], XYZ, [ra, rb, rz], (n, w) => {
          const c = facetOf(GRANITE, 0.05)(n);
          return n[2] > 0.45 && hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 1331) < 0.7 ? toneAt(n, MOSS, 0.05) : c;
        }, id++);
      }
    }
    // the cleft's shadow between them
    R.quad([[50, -12, 0.6], [100, -10, 0.6], [100, 10, 0.6], [50, 12, 0.6]], (u) => mix(WATER[1], HOLE_DARK, 0.4 + u * 0.5), 91);
    return startOf(R);
  });
}

/** FLOOR 10 BEGINS: OUT OF THE TWISTED WOOD, the trail coming out between two of its sick trees onto the fen, the roots that choked it lying dead. */
export function fenStart(d: WayDir): StartArt {
  return cachedStart('f' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    R.quad([[-10, -15, 0.3], [110, -13, 0.3], [110, 13, 0.3], [-10, 15, 0.3]], (u, v) => {
      if (hash(Math.floor(u * 100), Math.floor(v * 30), 1340) < clamp01((0.25 - u) / 0.25) + clamp01((u - 0.7) / 0.3)) return null;
      return hash(Math.floor(u * 40), Math.floor(v * 8), 1341) < 0.15 ? P_EARTH[1] : P_EARTH[2];
    }, 90);
    twistedTree(R, [30, -40, 0], [0.04, 0.38, 0], 132, 11, 2.2, 100);
    twistedTree(R, [36, 40, 0], [-0.04, -0.4, 0], 138, 11.5, 5.2, 110);
    // the dead roots, lying across the way's edges, grey and brittle
    for (let i = 0; i < 6; i++) {
      const a0 = 10 + hash(i, 1, 1342) * 60;
      const b0 = (i % 2 ? 1 : -1) * (18 + hash(i, 2, 1342) * 14);
      R.rod([a0, b0, 1], [a0 + 18, b0 + (i % 2 ? 1 : -1) * 10, 3], 2.2, 1, DEADROOT, 130 + i);
    }
    return startOf(R);
  });
}
