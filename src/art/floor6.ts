// FLOOR 6, THE QUARRY: ITS PIECES, the first of them (a mock-up; nothing of the game imports it).
//
// The owner, 13 Oct 2026, to the Quarry's ground (art/quarry.ts) at 10:19, asked "Is this the Quarry's
// ground?": "Yes, keep it (Recommended)", offered as: the ground stays as shown, slabs and all, and the
// art chat moves on to its pieces: the obelisk, crane, rails, cart, blocks and the dressed tops.
//
// THE QUARRY AS HE SAID YES TO IT (13 Oct, by 08:48, to the planning chat's mock-up; the project's
// claude/act1_descent.md): one great pit floor with the next opening broadly off it; the giant obelisk
// lying where it was split from the rock (chisel marks, the cult's mark); a wooden crane with a block on
// its chain; minecart rails through to the other pit, a cart of rubble; the cult's overseers; the tops
// dressed (pines, rocks, stacked blocks, scaffolding, a banner). His rule for a set of floors from the
// second on (10 Oct, 14:54): "Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for
// each boss." This floor's boss is the Unfinished, the stone colossus the cult half-carved out of the
// quarry wall: so its floor's pieces are the quarry's own, the stone and the cutting of it.
//
// THE STORY IN THEM: the cult's captives cut the giant obelisks here, that will stand round the Drowned
// Eye's pool on floor 10 burning pink. Here they are only cut and chalked: the cult's mark (the
// shrieking skull, face on, its jaw dropped wide: floor 5's) is cut into the obelisk and chalked, and
// nothing glows. (His rulebook, Colour 3: nothing in a place glows pink.)
//
// THE RULES THEY KEEP: crisp pixels, two to a game pixel; light from the upper left (floor 4's painter in
// depth, Scene, lit as every piece of the Crypt was); the indigo seam where one thing ends before another
// (compose); in daylight, so a step brighter than the Crypt's pieces, and still a step quieter than the
// figures and duller than any word; each thing's soft shadow the game's (a piece's `shadow`).
//
// Measures as floor 4's Scene: across the floor 40 units to a tile (x down the screen to the right, y
// down it to the left), heights in picture pixels; each picture anchored at the middle of its foot.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CLOTH, PAINT, PAINT_SHADE, SLATE, pinkBrazier, cultBanner, wordAltar } from './act1_cult';
import { shriekAt } from './floor5';
import { FLAME } from './mkit';
import { Scene, XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { TOWARD } from './floor2';
import type { Piece } from './floorkit';
import { GRAIN, compose, hash, mix } from './kit';
import type { Ramp } from './kit';

// =================================================================================================
// The colours: the quarry's own, in daylight

/** THE CUT LIMESTONE, the walls' own (art/quarry.ts Q_WALL): its deep shade, shade, body, lit, top in the sun. */
export const STONE: Ramp = ['#6f6680', '#8f8598', '#b1a497', '#d4c7b7', '#ebe1d3'];
/** Stone freshly cut: a little warmer and paler (the obelisk, the blocks just lifted). */
export const FRESH: Ramp = ['#746a7e', '#94899a', '#b7ab9e', '#d6cbbb', '#e8dfd1'];
/** Weathered pine timber, warm and grey (never toward pink). */
export const TIMBER: Ramp = ['#3a2b28', '#55402f', '#765a42', '#937455', '#ad8e6c'];
/** Iron, dark and blue-grey, its edges catching the light. */
export const IRON: Ramp = ['#24222e', '#353342', '#4e4c5e', '#727083', '#9a98aa'];
/** Hemp rope, pale. */
export const ROPE: Ramp = ['#56493b', '#6d5d4a', '#8b7a61', '#a99678', '#c2b192'];
/** The mountain's grey rock (art/quarry.ts Q_ROCK), as what stands and lies. */
export const ROCK: Ramp = ['#45404f', '#5e5866', '#78717e', '#928b96', '#a8a1aa'];
/** The pines of the mountain, deep green, darker than any word. */
export const PINE: Ramp = ['#142519', '#1c3322', '#27452c', '#355a37', '#4a7245'];
/** Chalk, bone-pale: the cult's marks drawn on the stone before it is cut. */
const CHALK = '#e9e4dc';
/** The deep dark of a cut into the stone. */
const CUT = '#4a4258';

// =================================================================================================
// Little helpers in the world's own measure

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
export const fr = (t: number): number => t - Math.floor(t);

/** The way a flat piece of the world turned to the eye looks: the normal of q, seen side out. */
export function seenNormal(q: readonly [V3, V3, V3, V3]): V3 {
  const n = norm(cross(sub(q[1], q[0]), sub(q[3], q[0])));
  return dot(n, TOWARD) >= 0 ? n : mul(n, -1);
}

/** Axes for a beam from a to b: along it, then two across it. */
export function beamAxes(a: V3, b: V3): [V3, V3, V3] {
  const A = norm(sub(b, a));
  const up: V3 = Math.abs(A[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const B = norm(cross(up, A));
  const C = norm(cross(A, B));
  return [A, B, C];
}

/** A SQUARED TIMBER from a to b, `t` half as thick: its grain along it, its end grain dark, an iron band where `bands` say (0..1 along it). */
export function timber(S: Scene, a: V3, b: V3, t: number, id: number, bands: readonly number[] = []): void {
  const ax = beamAxes(a, b);
  const len = Math.hypot(...sub(b, a));
  S.box(mul(add(a, b), 0.5), ax, [len / 2, t, t], (f, u, v, n) => {
    if (f < 2) return TIMBER[0]; // its ends
    const along = f === 2 || f === 3 ? v : u; // (a side's own measures: along the beam is its second on +-A1, its first on +-A2)
    for (const k of bands) if (Math.abs(along - k) < 0.025) return toneAt(n, IRON, 0.2);
    if (Math.abs(fr(along * 3 + hash(f, id, 900) * 0.7) - 0.5) < 0.04) return TIMBER[1]; // a crack along its grain
    return toneAt(n, TIMBER, -0.05);
  }, id);
}

/** A ROPE from a to b, sagging `sag` at its middle: a line of the rope's tones, thin. */
export function rope(S: Scene, a: V3, b: V3, sag: number, id: number, r = 0.55): void {
  const n = Math.max(2, Math.ceil(Math.hypot(...sub(b, a)) / 6));
  let prev = a;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const p = add(add(a, mul(sub(b, a), t)), [0, 0, -sag * 4 * t * (1 - t)]);
    S.rod(prev, p, r, r, ROPE, id);
    prev = p;
  }
}

/** A WHEEL of iron, small and solid: its rim lit on its upper side, its hub and bolts. `face` the way its outer side looks. */
export function ironWheel(S: Scene, c: V3, face: V3, R: number, id: number): void {
  const F = norm(face);
  const Au = norm(cross(F, [0, 0, 1]));
  const Bu = norm(cross(F, Au));
  S.egg(sub(c, mul(F, 0.9)), [F, Au, Bu], [0.5, R + 0.7, R + 0.7], () => IRON[0], id);
  S.egg(c, [F, Au, Bu], [0.75, R, R], (n, w) => {
    const q = sub(w, c);
    const a = dot(q, Au);
    const b = dot(q, Bu);
    const r = Math.hypot(a, b);
    const up = b / (r || 1);
    if (Math.abs(dot(n, F)) < 0.55) return up < -0.2 ? IRON[3] : IRON[1];
    if (r > R - 1) return up < 0 ? IRON[3] : IRON[2];
    if (r < 1.1) return IRON[4];
    return toneAt(n, IRON, 0.1);
  }, id);
}

/** Finish a scene: its seams, and the indigo seam round it, anchored at (ox, oy). */
export function finish(S: Scene, ox: number, oy: number, under: Px | null = null): Sprite {
  S.seams();
  return compose(under, [S.p], null).sprite(ox, oy, GRAIN);
}

// =================================================================================================
// THE STONE AND THE CUTTING OF IT

/**
 * How the face of a block is dressed: the tool marks of the cutting in rows across its top, the
 * half-drill holes along its edges where it was split from the bed (on the sides that were split), a
 * chip off a corner. `u`, `v` 0..1 across the face; `w`, `h` its size in picture pixels, roughly.
 */
function dressed(r: Ramp, n: V3, face: number, u: number, v: number, seed: number, split: boolean): string {
  const base = toneAt(n, r, 0.02);
  if (face === 4) {
    // its top: the marks of the pick in rows, all one way, the lit tone and the body's
    const row = fr(v * 7 + hash(seed, 1, 910) * 0.5);
    const col = fr(u * 11 + Math.floor(v * 7) * 0.37);
    if (row < 0.14 && col < 0.42) return r[3];
    return base;
  }
  if (split && v < 0.32) {
    // the half-drill holes down from its top edge on a side it was split along
    const k = fr(u * 9 + hash(seed, face, 911) * 0.5);
    if (k < 0.1) return r[Math.max(0, r.indexOf(base) - 1)] ?? r[1];
  }
  if (v > 0.9) return mix(base, r[0], 0.35); // its foot in the dust
  return base;
}

/** A CUT BLOCK of the limestone, about waist high, `k` its look (0: plain; 1: split from the bed, its drill holes on two sides; 2: with a chalk line where it is to be split again). 64 x 64 at (32, 46). */
function cutBlock(k: number): Sprite {
  const S = new Scene(new Px(64, 66), 32, 46);
  const h = 15 + (k === 2 ? 2 : 0);
  S.box([0, 0, h], XYZ, [16, 15, h], (f, u, v, n) => {
    let c = dressed(k === 0 ? STONE : FRESH, n, f, u, v, 30 + k, k === 1);
    if (k === 2 && f === 4 && Math.abs(u - 0.52) < 0.035) c = CHALK; // the chalk line across its top
    return c;
  }, 1);
  return finish(S, 32, 46);
}

/** TWO CUT BLOCKS STACKED, the upper set back and turned on it, wooden wedges under its corner. 72 x 92 at (36, 70). */
function stackedBlocks(): Sprite {
  const S = new Scene(new Px(72, 92), 36, 70);
  S.box([0, 0, 15], XYZ, [17, 15, 15], (f, u, v, n) => dressed(STONE, n, f, u, v, 41, true), 1);
  S.box([-2, 2, 30 + 14], XYZ, [14, 12, 14], (f, u, v, n) => dressed(FRESH, n, f, u, v, 42, false), 2);
  S.box([11, 12, 31], XYZ, [2.6, 2, 1.2], (_f, _u, _v, n) => toneAt(n, TIMBER, 0.1), 3);
  return finish(S, 36, 70);
}

/**
 * THE GREAT OBELISK, lying where it was split from the rock: a long tapering shaft of the fresh stone
 * along x, its point (the pyramidion) toward +x, still rough at its base end; the marks of the picks
 * down its top in rows; the cult's mark cut into its top near the base and chalked, its first runes
 * scored after it (nothing glows: they are lit at the Fen); the half-drill holes along its foot where
 * it came off the bed. 3 tiles and a half long. 184 x 124 at (88, 76).
 */
function obelisk(): Sprite {
  const S = new Scene(new Px(184, 124), 88, 76);
  const X0 = -66;
  const X1 = 58;
  const TIP = 84;
  const W0 = 15;
  const W1 = 10;
  const H0 = 28;
  const H1 = 18;
  const top: [V3, V3, V3, V3] = [[X0, -W0, H0], [X1, -W1, H1], [X1, W1, H1], [X0, W0, H0]];
  const side: [V3, V3, V3, V3] = [[X0, W0, 0], [X1, W1, 0], [X1, W1, H1], [X0, W0, H0]];
  const nTop = seenNormal(top);
  const nSide = seenNormal(side);
  const LEN = X1 - X0;
  // its top: rows of pick marks, the mark and the runes
  S.quad(top, (u, v) => {
    const a = (u - 0.14) * LEN;
    const b = (v - 0.5) * (2 * (W0 + (W1 - W0) * u));
    const m = shriekAt(b / 11, -a / 12);
    if (m === 'dark') return CUT;
    if (m === 'bone') return FRESH[2];
    // the chalk lines where the next faces are to be dressed, along it
    if (u > 0.3 && Math.abs(v - 0.16) < 0.02) return CHALK;
    // the base end still rough, not yet dressed
    if (u < 0.05) return hash(Math.floor(u * 90), Math.floor(v * 20), 921) > 0.5 ? FRESH[2] : FRESH[3];
    const row = fr(u * 26);
    const col = fr(v * 6 + Math.floor(u * 26) * 0.45);
    if (row < 0.16 && col < 0.5) return FRESH[3];
    return toneAt(nTop, FRESH, 0.04);
  }, 1);
  // its side toward the eye: the drill holes along its foot, the pick marks fainter
  S.quad(side, (u, v) => {
    if (v < 0.22) {
      const k = fr(u * 30);
      if (k < 0.12) return FRESH[1];
    }
    if (v > 0.93) return FRESH[3]; // its top edge catching the light
    if (u < 0.04) return FRESH[2];
    const row = fr(u * 26 + 0.5);
    if (row < 0.1 && v > 0.35 && v < 0.85) return FRESH[2];
    return toneAt(nSide, FRESH, 0);
  }, 1);
  // its point: four faces to the tip; the two seen
  const A: V3 = [TIP, 0, H1 * 0.5];
  const P2: V3 = [X1, W1, 0];
  const P3: V3 = [X1, W1, H1];
  const P4: V3 = [X1, -W1, H1];
  const tf: [V3, V3, V3, V3] = [P4, P3, A, A];
  const sf: [V3, V3, V3, V3] = [P2, P3, A, A];
  S.quad(tf, (u, v) => (v < 0.08 ? FRESH[4] : toneAt(seenNormal(tf), FRESH, 0.05)), 2);
  S.quad(sf, (u, v) => (v < 0.06 ? FRESH[3] : toneAt(seenNormal(sf), FRESH, -0.04)), 2);
  return finish(S, 88, 76);
}

/**
 * WEDGES AND A SLEDGE: the tools of the splitting left on the bed: a long-handled sledgehammer lying,
 * its iron head; three iron wedges and their feathers; a chisel. Lying on the floor. 64 x 40 at (32, 22).
 */
function splittingTools(): Sprite {
  const S = new Scene(new Px(64, 40), 32, 22);
  // the sledgehammer: its haft along, its head across at the end
  S.rod([-18, -6, 1.4], [14, 6, 1.4], 1.1, 1.1, TIMBER, 1);
  S.box([16, 7, 3], beamAxes([16, 2, 3], [16, 12, 3]), [6, 2.6, 2.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.15), 2);
  // the wedges, small and dark, in a row, their struck heads lit
  for (let i = 0; i < 3; i++) {
    const c: V3 = [-14 + i * 7, 10 + i * 2, 1.4];
    S.box(c, XYZ, [2.6, 1.3, 1.4], (f, _u, _v, n) => (f === 0 ? IRON[4] : toneAt(n, IRON, 0.1)), 3 + i);
  }
  // a chisel
  S.rod([-4, -12, 1], [8, -9, 1], 0.7, 0.5, IRON, 7);
  return finish(S, 32, 22);
}

/**
 * A HEAP OF CHIPPINGS: the spoil of the cutting, swept up against the wall or by the cart: a low mound
 * of dust and broken stone, lumps of the fresh stone in it and on it. 72 x 44 at (36, 30).
 */
function chippings(k: number): Sprite {
  const S = new Scene(new Px(80, 44), 40, 30);
  // the heap: a few low lobes run together, the broken stone's grey with flakes of the fresh in it
  const lobes: [number, number, number, number, number][] = [[0, 0, 22 + k * 3, 16, 7 + k], [-14, 6, 13, 10, 4], [15, -4, 12, 10, 4.5], [5, 10, 10, 8, 3.5]];
  lobes.forEach(([x, y, rx, ry, rz], i) => {
    S.egg([x, y, 0], beamAxes([0, 0, 0], [1, (i - 1.5) * 0.3, 0]), [rx, ry, rz], (n, w) => {
      const g = hash(Math.floor(w[0] / 1.6), Math.floor(w[1] / 1.6), 930 + k);
      if (g > 0.84) return n[2] > 0.5 ? FRESH[4] : FRESH[3];
      if (g < 0.05) return STONE[1];
      return toneAt(n, STONE, -0.02);
    }, 1);
  });
  // lumps on it and round its foot, each faceted
  for (let i = 0; i < 6; i++) {
    const a = hash(i, 1, 931 + k) * Math.PI * 2;
    const r = 4 + hash(i, 2, 931 + k) * 22;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.7;
    const top = (7 + k) * Math.sqrt(Math.max(0, 1 - (x / (22 + k * 3)) ** 2 - (y / 16) ** 2));
    const sz = 1.8 + hash(i, 3, 931) * 2.4;
    S.egg([x, y, Math.max(0.6, top - 0.8)], beamAxes([0, 0, 0], [1, hash(i, 6, 931) - 0.5, 0.3]), [sz * 1.2, sz, sz * 0.8], facetOf(i % 2 ? FRESH : STONE, 0.05), 1);
  }
  return finish(S, 40, 30);
}

// =================================================================================================
// THE WORKINGS: crane, cart, rails, sledge, scaffold

/**
 * THE CRANE: a wooden derrick over the pit: its mast up from a cross of sills on the bed, two stays to
 * the sills' ends, its boom leaning out up the screen to the right from the mast's foot, the topping rope
 * from the mast's head to the boom's end, the hoist rope down from there to a chain, a hook, and a block
 * of the stone slung on it, hanging; a windlass at the mast's foot with the rope wound on it. Tall: the
 * game sees it through while someone is behind it (the tent's way, his rule). 132 x 196 at (52, 168).
 */
function crane(): Sprite {
  const S = new Scene(new Px(132, 196), 52, 168);
  // the sills, crossed on the bed
  timber(S, [-30, 0, 2.4], [30, 0, 2.4], 2.4, 1, [0.08, 0.92]);
  timber(S, [0, -28, 2.4], [0, 28, 2.4], 2.4, 2, [0.08, 0.92]);
  // the mast, its head bound in iron
  timber(S, [0, 0, 4], [0, 0, 150], 3, 3, [0.32, 0.96]);
  // its stays, back to the sills' ends
  timber(S, [-1, 1, 120], [-28, 0, 5], 1.8, 4);
  timber(S, [1, 1, 120], [0, 26, 5], 1.8, 5);
  // the boom, out and up toward -y
  const tip: V3 = [0, -74, 132];
  timber(S, [0, -3, 18], tip, 2.4, 6, [0.5, 0.97]);
  // the topping rope, mast head to boom end
  rope(S, [0, -1.5, 148], add(tip, [0, 0, 1]), 2, 7);
  // the hoist rope down, a chain, the hook, the slings and the block
  const hang = 62;
  rope(S, tip, [0, -74, hang + 14], 0, 8, 0.6);
  for (let z = hang + 14; z > hang + 4; z -= 2.4) S.ball([0, -74, z], 0.9, IRON, 9, undefined, 0.1);
  S.rod([0, -74, hang + 4], [0, -74, hang + 1], 0.9, 0.6, IRON, 10);
  const B: V3 = [0, -74, hang - 14];
  for (const [dx, dy] of [[-11, -10], [11, -10], [-11, 10], [11, 10]] as const) rope(S, [0, -74, hang + 1], [dx, -74 + dy, hang - 2], 0, 11, 0.5);
  S.box(B, XYZ, [12, 11, 12], (f, u, v, n) => dressed(FRESH, n, f, u, v, 50, true), 12);
  // the windlass at its foot: a drum of rope between two posts, a handle each end
  timber(S, [10, 14, 0], [10, 14, 20], 1.6, 13);
  timber(S, [24, 14, 0], [24, 14, 20], 1.6, 14);
  S.rod([11, 14, 14], [23, 14, 14], 4.2, 4.2, ROPE, 15);
  S.rod([8, 14, 14], [26, 14, 14], 1, 1, IRON, 16);
  S.rod([26, 14, 14], [26, 20, 9], 0.8, 0.8, IRON, 17);
  S.rod([8, 14, 14], [8, 8, 19], 0.8, 0.8, IRON, 18);
  return finish(S, 52, 168);
}

/**
 * THE CART OF RUBBLE: a wooden tub on an iron chassis, wider at its top than its foot, iron straps down
 * its corners, four small iron wheels flanged for the rails; heaped with the broken stone of the
 * cutting. Along x, as the rails run. 84 x 76 at (42, 54).
 */
function rubbleCart(heaped: boolean, alongY = false): Sprite {
  const S = new Scene(new Px(84, 76), 42, 54);
  // its own axes: along it, across it (along x, or turned to run along y)
  const L: V3 = alongY ? [0, 1, 0] : [1, 0, 0];
  const Wd: V3 = alongY ? [1, 0, 0] : [0, 1, 0];
  const P = (l: number, w: number, z: number): V3 => add(add(mul(L, l), mul(Wd, w)), [0, 0, z]);
  const l0 = 13;
  const w0 = 8;
  const l1 = 16;
  const w1 = 11;
  const z0 = 7;
  const z1 = 28;
  const b = (sl: number, sw: number): V3 => P(sl * l0, sw * w0, z0);
  const t = (sl: number, sw: number): V3 => P(sl * l1, sw * w1, z1);
  const mid: V3 = [0, 0, (z0 + z1) / 2];
  const side = (q: [V3, V3, V3, V3], id: number): void => {
    const n0 = norm(cross(sub(q[1], q[0]), sub(q[3], q[0])));
    const out = dot(n0, sub(q[0], mid)) > 0 ? n0 : mul(n0, -1);
    const seen = dot(out, TOWARD) > 0;
    S.quad(q, (u, v) => {
      if (!seen) return v > 0.92 ? TIMBER[3] : toneAt(mul(out, -1), TIMBER, -0.3);
      if (v > 0.92) return toneAt(out, TIMBER, 0.45); // its rim
      if (u < 0.07 || u > 0.93) return toneAt(out, IRON, u < 0.07 ? 0.3 : 0.15); // the corner straps
      if (Math.abs(fr(v * 4) - 0.5) < 0.05) return TIMBER[1]; // the boards
      if (Math.abs(v - 0.5) < 0.06) return toneAt(out, IRON, 0.25); // a band of iron round it
      return toneAt(out, TIMBER, 0);
    }, id);
  };
  S.quad([b(-1, -1), b(1, -1), b(1, 1), b(-1, 1)], () => TIMBER[1], 1);
  side([b(-1, 1), b(1, 1), t(1, 1), t(-1, 1)], 1);
  side([b(1, -1), b(-1, -1), t(-1, -1), t(1, -1)], 1);
  side([b(1, 1), b(1, -1), t(1, -1), t(1, 1)], 1);
  side([b(-1, -1), b(-1, 1), t(-1, 1), t(-1, -1)], 1);
  // the chassis and the axles
  S.box([0, 0, 5], alongY ? [Wd, L, [0, 0, 1]] : XYZ, alongY ? [6, 12, 1.6] : [12, 6, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0), 2);
  for (const sl of [-1, 1]) {
    S.rod(P(sl * 9, -8.5, 5), P(sl * 9, 8.5, 5), 0.9, 0.9, IRON, 3);
    for (const sw of [-1, 1]) ironWheel(S, P(sl * 9, sw * 8.4, 5), mul(Wd, sw), 4.8, 4 + (sl + 1) + (sw + 1) / 2);
  }
  // the load: the broken stone heaped over its rim
  if (heaped) {
    for (let i = 0; i < 14; i++) {
      const x = -12 + (i % 5) * 6 + hash(i, 1, 940) * 3;
      const y = -8 + Math.floor(i / 5) * 7 + hash(i, 2, 940) * 3;
      const z = z1 - 1 + (Math.abs(x) < 8 && Math.abs(y) < 6 ? 5 : 1) + hash(i, 3, 940) * 3;
      S.egg(P(x, y, z), XYZ, [3.4 + hash(i, 4, 940) * 1.5, 3 + hash(i, 5, 940), 2.6 + hash(i, 6, 940)], facetOf(i % 3 ? FRESH : STONE, 0.05), 10 + i);
    }
  }
  return finish(S, 42, 54);
}

/** A tile's pixel (in a 64 x 32 diamond, its top corner at (32, 0)) in the tile's own measure, 64 to a tile along x (U) and y (V); null off it. */
export function tileUV(px: number, py: number): [number, number] | null {
  const U = px - 32 + 2 * py + 1.5;
  const V = 2 * py - (px - 32) + 0.5;
  if (U < 0 || V < 0 || U >= 64 || V >= 64) return null;
  return [U, V];
}

/**
 * THE RAILS, a floor tile: two iron rails on timber sleepers bedded in the dust, along x (`alongY`
 * false) or along y; one tile of them, laid end to end by the game (each rail one picture pixel thick,
 * crisp: its top lit, its side under it in shade). `end`: the last tile, its sleepers stopping and the
 * rails' ends. 64 x 33 at (32, 0).
 */
function railsTile(alongY: boolean, end: boolean): Sprite {
  const p = new Px(64, 33);
  for (let py = 0; py < 33; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const along = alongY ? uv[1] : uv[0];
      const across = alongY ? uv[0] : uv[1];
      if (end && along > 46) continue;
      // the sleepers: one every quarter tile, each a little crooked, their lit top row and shaded foot
      const s = along % 16;
      const k = Math.floor(along / 16);
      const jog = Math.floor(hash(k, 1, 950) * 3) - 1;
      if (s >= 2 && s < 8 && across >= 11 + jog && across < 53 + jog) {
        const row = s < 4 ? 3 : s >= 6.5 ? 1 : 2;
        p.set(px, py, TIMBER[row]);
      }
      // the ballast showing between them: a little darker grit, in clumps
      else if (across >= 13 && across < 51 && hash(px >> 1, py, 951) > 0.8) p.set(px, py, STONE[1]);
      // the rails
      for (const r of [17, 45]) {
        if (across >= r && across < r + 2) p.set(px, py, IRON[4]);
        else if (across >= r + 2 && across < r + 4) p.set(px, py, IRON[1]);
      }
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/**
 * A SLEDGE ON ROLLERS: how the great stones are moved: a block of the fresh stone on a sledge of two
 * squared runners, the runners on three logs laid across, a rope made fast to the sledge's front and
 * lying out along the bed toward whoever will haul it. 96 x 76 at (48, 52).
 */
function sledge(): Sprite {
  const S = new Scene(new Px(96, 76), 48, 52);
  for (let i = 0; i < 3; i++) S.rod([-16 + i * 16, -16, 3.2], [-16 + i * 16, 16, 3.2], 3.2, 3.2, TIMBER, 1 + i);
  for (const y of [-9, 9]) timber(S, [-26, y, 8.6], [26, y, 8.6], 2.4, 5 + (y > 0 ? 1 : 0));
  timber(S, [24, -12, 9], [24, 12, 9], 2, 7);
  S.box([0, 0, 11 + 13], XYZ, [20, 14, 13], (f, u, v, n) => dressed(FRESH, n, f, u, v, 60, true), 8);
  rope(S, [26, 0, 9], [44, 6, 0.8], 0, 9, 0.7);
  rope(S, [44, 6, 0.8], [54, -2, 0.8], 0, 9, 0.7);
  return finish(S, 48, 52);
}

/**
 * SCAFFOLDING against a face: three poles, two ledgers lashed across them, planks laid on the upper, a
 * brace across, the lashings of rope at the joints; for a far wall's foot, or a top (where it stands
 * clear of the floor). 88 x 128 at (44, 104).
 */
function scaffold(): Sprite {
  const S = new Scene(new Px(88, 128), 44, 104);
  const poles: V3[] = [[-26, 2, 0], [0, 0, 0], [26, -2, 0]];
  poles.forEach((q, i) => S.rod(q, add(q, [0, 0, 92 - i * 4]), 1.6, 1.4, TIMBER, 1 + i));
  for (const z of [30, 62]) S.rod([-30, 2.4, z], [30, -2.4, z], 1.3, 1.3, TIMBER, 5);
  // the planks on the upper ledger, a little out toward the eye
  S.box([0, 4, 64.5], XYZ, [28, 5, 1.2], (f, u, _v, n) => (f === 4 && Math.abs(fr(u * 4) - 0.5) < 0.05 ? TIMBER[1] : toneAt(n, TIMBER, 0.1)), 6);
  // a brace across
  S.rod([-26, 2.4, 6], [0, 0.6, 58], 1.1, 1.1, TIMBER, 7);
  // the lashings
  for (const q of poles) for (const z of [30, 62]) S.egg(add(q, [0, 0.4, z]), XYZ, [2.4, 2.4, 1.4], (n) => toneAt(n, ROPE, 0.1), 8);
  return finish(S, 44, 104);
}

// =================================================================================================
// THE MOUNTAIN: pines and rocks (for the tops, and for every floor of the set where the mountain is)

/**
 * A PINE OF THE MOUNTAIN: a straight dark trunk, its branches in tiers that droop and taper to its top,
 * each tier lit on its upper left and shaded under and to the right, ragged at its foot; `size` 0..1.
 * Painted flat, as a tree is seen. 72 x (64 to 132) at (36, foot).
 */
export function pine(size: number, seed: number): Sprite {
  const H = Math.round(70 + size * 66);
  const W = 76;
  const cx = 38;
  const foot = H - 6;
  const p = new Px(W, H);
  // its trunk, showing under the lowest boughs
  for (let y = foot - 14; y <= foot; y++) for (let x = cx - 2; x <= cx + 1; x++) p.set(x, y, x < cx - 1 ? TIMBER[2] : x > cx ? TIMBER[0] : TIMBER[1]);
  const tiers = 5 + Math.round(size * 2);
  const top = 5;
  const bottom = foot - 10;
  const wide = (W / 2 - 4) * (0.78 + 0.22 * size);
  // from the lowest tier up, so that each tier lies over the one below it
  for (let t = tiers - 1; t >= 0; t--) {
    const k = (t + 1) / tiers;
    const ty = top + (bottom - top) * Math.pow(t / tiers, 1.05);
    const by = top + (bottom - top) * Math.pow(k, 1.05);
    const half = 5 + wide * Math.pow(k, 0.9);
    for (let y = Math.floor(ty); y <= Math.ceil(by) + 2; y++) {
      const f = Math.max(0, (y - ty) / (by - ty || 1));
      for (let x = Math.floor(cx - half - 3); x <= Math.ceil(cx + half + 3); x++) {
        const dx = x + 0.5 - cx;
        const ad = Math.abs(dx);
        // its sides: branch tips in a saw, pointing down and out
        const saw = fr((y - ty) / 3.2 + (dx < 0 ? 0.37 : 0) + seed * 0.13);
        const reach = half * Math.min(1, f * 1.05) * (0.86 + 0.14 * saw);
        if (ad > reach) continue;
        // its foot: the boughs hanging lowest at their tips, lifting between them toward the trunk
        const tip = 0.5 + 0.5 * Math.cos(dx * 0.62 + seed);
        const lowest = by + 2 * tip * (ad / (half + 1)) - (1 - ad / (half + 1)) * 1.5;
        if (y > lowest) continue;
        const side = dx / (half + 1);
        const under = lowest - y; // how far above its own foot
        let tone = 2;
        if (side < -0.25) tone = 3; // the upper left of the tier, in the sun
        if (side > 0.35) tone = 1; // its right, in shade
        if (under < 1.5 && side > -0.1) tone = Math.max(0, tone - 1); // the shade under its boughs
        if (side < -0.45 && f < 0.6 && hash(x >> 1, y >> 1, seed) > 0.55) tone = 4; // needles catching the light
        if (side > 0.6 && under < 2.5) tone = 0;
        p.set(x, y, PINE[tone]);
      }
    }
  }
  // its leader, a spire at the top
  p.set(cx - 1, top - 3, PINE[2]).set(cx - 1, top - 2, PINE[3]).set(cx - 1, top - 1, PINE[3]).set(cx, top - 1, PINE[2]);
  return compose(null, [p], null).sprite(cx, foot, GRAIN);
}

/** A BOULDER of the mountain's grey rock, faceted, a lichen of the grass's green on its top here and there; `size` 0..2. 72 x 58 at (36, 42). */
export function boulder(size: number, seed: number): Sprite {
  const S = new Scene(new Px(72, 58), 36, 42);
  const r = 10 + size * 5;
  const facet = facetOf(ROCK, 0.05);
  S.egg([0, 0, r * 0.55], beamAxes([0, 0, 0], [1, 0.4, 0]), [r * 1.15, r * 0.9, r * 0.75], (n, w) => {
    const c = facet(n);
    if (n[2] > 0.8 && hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), seed) > 0.86) return '#5f7c48';
    return c;
  }, 1);
  S.egg([r * 0.6, r * 0.5, r * 0.32], XYZ, [r * 0.6, r * 0.55, r * 0.42], facet, 2);
  return finish(S, 36, 42);
}

// =================================================================================================
// THE OVERSEERS' REDOUBT: THE QUARRY'S CULT STRONGHOLD, AT ITS DOOR
//
// As the planning chat painted it with his yes (13 Oct, by 09:52: "Yes, this is it (Recommended)"): an
// overseers' redoubt cut into an old terrace; its gate set into the terrace's face between two towers
// of the quarry's own stone, the cult's keep behind; the cult's violet banners and braziers of its pink
// fire; the door sealed with the cult's mark burning pink; before it an altar with three hollows for the
// words given (art/act1_cult.ts, `wordAltar`), the court paved with the quarry's dressed stone.

/** The redoubt's dressed stone: the quarry's limestone squared and coursed, a little greyer than the fresh-cut, weathered. */
export const DRESSED: Ramp = ['#655c74', '#837a8f', '#a39a9f', '#c4bbb4', '#d9d0c6'];
/** The court's flagstones: the same stone, laid. */
export const FLAG: Ramp = ['#5f5868', '#8a8290', '#9c94a1', '#aea6b1', '#c4bcc4'];

/**
 * COURSED ASHLAR: the colour of a dressed wall at the world's point `w`, its face turned `n`: courses
 * 12 picture pixels high, blocks of 20 to 32 units along the course, their joints dark, each block a
 * shade of its own, now and then one weathered darker, the course's top edge lit where the face is in
 * the light.
 */
function ashlar(w: V3, n: V3, seed: number, r: Ramp = DRESSED): string {
  const along = Math.abs(n[1]) > Math.abs(n[0]) ? w[0] : w[1];
  const z = w[2];
  const course = Math.floor(z / 12);
  const zin = z - course * 12;
  const len = 22 + Math.floor(hash(course, 1, seed) * 3) * 4;
  const off = hash(course, 2, seed) * len;
  const block = Math.floor((along + off) / len);
  const ain = along + off - block * len;
  if (zin < 1.05 || ain < 1.3) return r[0]; // the joints
  const base = toneAt(n, r, (hash(block, course, seed + 1) - 0.5) * 0.24);
  if (zin > 10.9 && dot(n, [-0.55, 0.45, 0.7]) > 0) return r[Math.min(4, r.indexOf(base) + 1)]; // its top edge, lit
  if (hash(block, course, seed + 2) > 0.93) return mix(base, r[0], 0.3); // a stone weathered
  return base;
}

/** The arch of the redoubt's gate: its opening's half width, the height its sides go up to, its round top. */
const GATE = { half: 17, spring: 50, recess: 6 };
const inOpening = (x: number, z: number): boolean => Math.abs(x) < GATE.half && (z < GATE.spring || Math.hypot(x, z - GATE.spring) < GATE.half);

/**
 * THE REDOUBT'S GATEHOUSE, its door shut and sealed (`open` false: the cult's mark burning pink on the
 * door, `f` its flicker, 4 frames) or open (the door gone down, the dark of the way in, steps going
 * back). Built on the grid as the terrace's face runs, along x, looking out down the screen to the left:
 * the gate wall with its round arch of voussoirs and its battlements, a tower either side standing out
 * from the face with its merlons and arrow slits, the cult's banner hung down each tower's front, and
 * the keep rising behind on the terrace's top, its own banner flying. 212 x 312 at (72, 282).
 */
function gatehouse(open: boolean, f: number): Sprite {
  const S = new Scene(new Px(290, 424), 98, 382);
  /** It is built a third again as big as it is measured here, its stones with it. */
  const K = 1.35;
  const big = (v: V3): V3 => [v[0] * K, v[1] * K, v[2] * K];
  const face = (q: [V3, V3, V3, V3], id: number, paint: (w: V3, n: V3) => string | null): void => {
    const n = seenNormal(q);
    S.quad([big(q[0]), big(q[1]), big(q[2]), big(q[3])], (_u, _v, w) => paint([w[0] / K, w[1] / K, w[2] / K], n), id);
  };
  const blockOf = (x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, id: number, seed: number, skip?: (w: V3, n: V3) => boolean): void => {
    // its top, its front (+y) and its side to the right (+x): what the eye sees of a box
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], id, (w, n) => (hash(Math.floor(w[0] / 9), Math.floor(w[1] / 9), seed) > 0.7 ? DRESSED[3] : toneAt(n, DRESSED, 0.05)));
    face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], id, (w, n) => (skip && skip(w, n) ? null : ashlar(w, n, seed)));
    face([[x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1]], id, (w, n) => (skip && skip(w, n) ? null : ashlar(w, n, seed + 5)));
  };
  /** Merlons along a box's front and right edges at its top. */
  const merlons = (x0: number, y0: number, x1: number, y1: number, z: number, id: number, seed: number): void => {
    for (let x = x0; x + 6 <= x1 + 0.1; x += 12) blockOf(x, y1 - 5, Math.min(x + 7, x1), y1, z, z + 9, id, seed);
    for (let y = y1 - 12; y - 7 >= y0 - 0.1; y -= 12) blockOf(x1 - 5, y - 7, x1, y, z, z + 9, id, seed);
  };

  // THE KEEP, behind, on the terrace's top (its foot at the terrace's height)
  const TOP = 110 / K;
  blockOf(-40, -92, 40, -44, TOP, 176, 1, 970);
  merlons(-40, -92, 40, -44, 176, 1, 970);
  // its window, dark, and its banner flying from a pole on its top
  face([[-6, -44.1, 140], [6, -44.1, 140], [6, -44.1, 158], [-6, -44.1, 158]], 2, (w) => (Math.hypot(w[0], w[2] - 154) < 6 || w[2] < 154 ? '#120e1a' : null));
  S.rod(big([30, -50, 185]), big([30, -50, 214]), 0.9, 0.9, TIMBER, 3);
  for (let k = 0; k < 14; k++) {
    const tail = k / 13;
    face([[30, -50 - k * 2, 212 - tail * 2], [30, -52 - k * 2, 212 - tail * 2], [30, -52 - k * 2, 203 + tail * 4], [30, -50 - k * 2, 203 + tail * 4]], 4, (_w, n) => toneAt(n, CLOTH, 0.1));
  }

  // THE GATE WALL between the towers, its arch, its battlements
  const W0 = -30;
  const W1 = 30;
  const WALL_Z = 98;
  blockOf(W0, -24, W1, 0, 0, WALL_Z, 5, 971, (w, n) => n[1] > 0.5 && inOpening(w[0], w[2]));
  merlons(W0, -24, W1, 0, WALL_Z, 5, 971);
  // the voussoirs round the arch, a paler ring, cut radially
  face([[W0, 0.05, 0], [W1, 0.05, 0], [W1, 0.05, 90], [W0, 0.05, 90]], 6, (w, n) => {
    const x = w[0];
    const z = w[2];
    if (inOpening(x, z)) return null;
    const r = Math.hypot(x, z - GATE.spring);
    if (z >= GATE.spring - 2 && r < GATE.half + 7) {
      const a = Math.atan2(z - GATE.spring, x);
      const k = fr(a / (Math.PI / 9));
      if (k < 0.08 || r > GATE.half + 6) return DRESSED[0];
      return toneAt(n, FRESH, k > 0.5 ? 0.08 : 0);
    }
    if (Math.abs(x) < GATE.half + 4 && Math.abs(x) >= GATE.half && z < GATE.spring) return toneAt(n, FRESH, 0); // the jambs' dressed edges
    return null;
  });
  // the left jamb, seen in shade, from the face back to the door
  face([[-GATE.half, 0, 0], [-GATE.half, -GATE.recess, 0], [-GATE.half, -GATE.recess, GATE.spring + 12], [-GATE.half, 0, GATE.spring + 12]], 7, (w, n) => (inOpening(-GATE.half + 0.01, w[2]) || w[2] < GATE.spring ? ashlar(w, n, 972) : null));
  // THE DOOR, set back in the arch
  const lights: Light[] = [];
  face([[-GATE.half, -GATE.recess, 0], [GATE.half, -GATE.recess, 0], [GATE.half, -GATE.recess, GATE.spring + GATE.half], [-GATE.half, -GATE.recess, GATE.spring + GATE.half]], 8, (w, n) => {
    const x = w[0];
    const z = w[2];
    if (!inOpening(x, z)) return null;
    if (open) {
      // the way in, dark; the first steps down going back, their lips catching what light there is
      const step = Math.floor(z / 6);
      if (z < 18 && fr(z / 6) > 0.8) return step % 2 ? '#2a2434' : '#221d2c';
      return '#0c0a12';
    }
    // a slab of the cult's slate, the mark cut huge in it and burning
    const m = shriekAt(x / 13, (z - 34) / 15);
    const flick = [0, 1, 0, 2][f % 4];
    if (m === 'dark') return FLAME[Math.min(4, 3 + (flick === 2 ? 1 : 0))];
    if (m === 'bone') return FLAME[1 + (flick ? 1 : 0)];
    // the slab's own stone, a band of iron across it, studs
    if (Math.abs(z - 12) < 1.5 || Math.abs(z - 58) < 1.5) return toneAt(n, IRON, 0.2);
    return toneAt(n, SLATE, (hash(Math.floor(x / 6), Math.floor(z / 6), 973) - 0.5) * 0.2);
  });
  if (!open) {
    const [lx, ly] = S.at(big([0, -GATE.recess, 34]));
    lights.push({ x: lx / GRAIN, y: ly / GRAIN, r: 30 + (f % 2) * 3, color: FLAME[2], a: 0.38 });
  }

  // THE TOWERS, standing out from the face either side
  for (const [x0, x1, seed] of [[-72, -30, 974], [30, 72, 975]] as const) {
    const TZ = 152;
    blockOf(x0, -28, x1, 12, 0, TZ, 10 + (x0 > 0 ? 1 : 0), seed, (w, n) => {
      // its arrow slits, dark, two to a face
      const along = Math.abs(n[1]) > 0.5 ? w[0] - (x0 + x1) / 2 : w[1] + 8;
      return (Math.abs(along) < 1.4 && ((w[2] > 96 && w[2] < 114) || (w[2] > 40 && w[2] < 56)));
    });
    merlons(x0, -28, x1, 12, TZ, 10 + (x0 > 0 ? 1 : 0), seed);
    // the slits behind the masks, dark
    face([[x0 + (x1 - x0) / 2 - 1.5, 11.9, 96], [x0 + (x1 - x0) / 2 + 1.5, 11.9, 96], [x0 + (x1 - x0) / 2 + 1.5, 11.9, 114], [x0 + (x1 - x0) / 2 - 1.5, 11.9, 114]], 12, () => '#100c18');
    face([[x0 + (x1 - x0) / 2 - 1.5, 11.9, 40], [x0 + (x1 - x0) / 2 + 1.5, 11.9, 40], [x0 + (x1 - x0) / 2 + 1.5, 11.9, 56], [x0 + (x1 - x0) / 2 - 1.5, 11.9, 56]], 12, () => '#100c18');
    // the cult's banner hung down its front, the skull painted on it, its foot cut into tails
    const bx0 = x0 + 7;
    const bx1 = x1 - 7;
    face([[bx0, 12.6, 58], [bx1, 12.6, 58], [bx1, 12.6, 138], [bx0, 12.6, 138]], 13, (w, n) => {
      const u = (w[0] - bx0) / (bx1 - bx0);
      const tail = Math.abs(fr(u * 3) - 0.5) * 2;
      if (w[2] < 58 + 8 * (1 - tail)) return null;
      const m = shriekAt((u - 0.5) * 2.4, (w[2] - 108) / 13);
      if (m === 'bone') return u > 0.62 ? PAINT_SHADE : PAINT;
      if (w[2] > 135) return IRON[3]; // its iron rod
      const fold = Math.sin(u * 12);
      return CLOTH[fold > 0.5 ? 3 : fold < -0.5 ? 1 : 2] ?? toneAt(n, CLOTH, 0);
    });
  }

  S.seams();
  const sp = compose(null, [S.p], null).sprite(98, 382, GRAIN);
  if (lights.length) sp.lights = lights;
  return sp;
}

/**
 * THE COURT'S FLAGSTONES, a floor tile: two great slabs of the quarry's dressed stone to a tile, laid
 * in rows, their joints dark, each stone's edge worn pale; worn paler down the middle of the way to the
 * door (`worn`). 64 x 33 at (32, 0).
 */
function flagstones(worn: boolean, seed: number): Sprite {
  const p = new Px(64, 33);
  for (let py = 0; py < 33; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const [U, V] = uv;
      const half = U < 32 ? 0 : 1;
      const k = hash(half, seed, 976);
      let c = FLAG[k > 0.66 ? 3 : k > 0.25 ? 2 : 1];
      if (worn && Math.abs(U - 32) < 18) c = mix(c, FLAG[4], 0.25 * (1 - Math.abs(U - 32) / 18));
      if (V < 1.5 || U < 1.5 || Math.abs(U - 32) < 1) c = FLAG[0]; // the joints
      else if (V < 3.5 || (U >= 32 && U < 34.5) || U < 3.5) c = mix(c, FLAG[4], 0.35); // the worn edge, in the light
      if (hash(px >> 1, py, seed + 977) > 0.97) c = FLAG[1];
      p.set(px, py, c);
    }
  }
  return p.sprite(32, 0, GRAIN);
}

// =================================================================================================
// THE FAR CLIFFS' OWN: what stands against a quarried face, and what was begun in it
//
// The far faces are the ground's (art/terrain.ts), round and ragged; what stands against one is anchored
// at its foot on the floor and stands upright, as a ladder or a rope hangs whichever way the face runs.

/** A LADDER of timber leaned against a quarried face, its foot on the bed, rungs lashed, its top over a bench's tread. 48 x 132 at (24, 122). */
function ladder(): Sprite {
  const S = new Scene(new Px(48, 132), 24, 122);
  // its two rails, leaning back up the face (toward -y, away from the eye), and its rungs
  for (const x of [-7, 7]) S.rod([x, 2, 0], [x, -14, 100], 1.4, 1.2, TIMBER, 1);
  for (let k = 1; k < 9; k++) {
    const t = k / 9;
    S.rod([-7, 2 - 16 * t, 100 * t], [7, 2 - 16 * t, 100 * t], 0.9, 0.9, TIMBER, 2);
    S.egg([-7, 2 - 16 * t, 100 * t], XYZ, [1.6, 1.6, 1.2], (n) => toneAt(n, ROPE, 0.1), 3);
  }
  return finish(S, 24, 122);
}

/** A ROPE DOWN A FACE, from a stake at the cliff's top to a bucket of the chippings on the bed below it: the rope taut, the bucket of staves bound in iron. 40 x 132 at (20, 122). */
function ropeAndBucket(): Sprite {
  const S = new Scene(new Px(40, 132), 20, 122);
  rope(S, [0, -6, 110], [0, -1, 18], 0, 1, 0.6);
  // the bucket, its staves and hoops, its bail
  for (let z = 0; z <= 14; z += 0.5) {
    const r = 5.6 - z * 0.06;
    for (let a = -Math.PI; a < Math.PI; a += 0.12) {
      const n: V3 = [Math.cos(a), Math.sin(a), 0];
      if (dot(n, TOWARD) < -0.2) continue;
      const q: V3 = [n[0] * r, n[1] * r, z];
      const [x, y] = S.at(q);
      const hoop = Math.abs(z - 2) < 0.7 || Math.abs(z - 12) < 0.7;
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), hoop ? toneAt(n, IRON, 0.25) : Math.abs(fr((a * 7) / Math.PI) - 0.5) < 0.08 ? TIMBER[1] : toneAt(n, TIMBER, 0), 2, z);
    }
  }
  S.egg([0, 0, 14.4], XYZ, [5, 5, 1.2], (_n, w) => (hash(Math.floor(w[0] / 1.5), Math.floor(w[1] / 1.5), 990) > 0.5 ? FRESH[3] : STONE[2]), 3);
  S.rod([-5.4, 0, 14], [0, -1, 18.4], 0.5, 0.5, IRON, 4);
  S.rod([5.4, 0, 14], [0, -1, 18.4], 0.5, 0.5, IRON, 4);
  return finish(S, 20, 122);
}

/**
 * A CLIFF'S PICTURE IN RELIEF, upright, facing the eye: `paint` gives what the stone is at (x, y) (x
 * across from its middle, y up from its foot, in picture pixels) as a height out of the face (0: the
 * face itself, nothing painted) and its stone; it is lit as the walls are, from the upper left, by how
 * its height falls away, and what stands out throws its shade down and to the right, onto itself and
 * onto the face.
 */
function relief(W: number, H: number, paint: (x: number, y: number) => { h: number; r: Ramp; tone?: number } | null): Sprite {
  const p = new Px(W, H);
  const cx = W / 2;
  const foot = H - 2;
  const at = (x: number, y: number): number => {
    const q = paint(x, y);
    return q ? q.h : 0;
  };
  /** in the shade of what stands out up and to the left of it (the light at about 45 degrees) */
  const shaded = (x: number, y: number, h: number): boolean => {
    for (let k = 1; k <= 5; k++) if (at(x - k, y + k) - h > k * 1.3) return true;
    return false;
  };
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const x = px + 0.5 - cx;
      const y = foot - (py + 0.5);
      const q = paint(x, y);
      if (!q || q.h <= 0) {
        if (shaded(x, y, 0)) p.set(px, py, '#857879'); // (the face's own shade, opaque: crisp)
        continue;
      }
      if (q.tone !== undefined) {
        p.set(px, py, q.r[q.tone]);
        continue;
      }
      // the slope of its height, to the light from the upper left: rising to the right, or falling away upward, is lit
      const gx = at(x + 1, y) - at(x - 1, y);
      const gy = at(x, y + 1) - at(x, y - 1);
      const l = (gx - gy) * 0.7;
      let t = l > 1.2 ? 4 : l > 0.35 ? 3 : l > -0.35 ? 2 : l > -1.2 ? 1 : 0;
      if (shaded(x, y, q.h)) t = Math.min(t, 1);
      p.set(px, py, q.r[t]);
    }
  }
  return p.sprite(cx, foot, GRAIN);
}

/** The stone of the faces, in the light (art/quarry.ts Q_WALL's middle row, as a ramp): its deep shade to its lit edge. */
const FACE: Ramp = ['#76696a', '#a29587', '#b1a497', '#c9bdb0', '#ddd2c6'];
/** The same stone dressed and rubbed smooth, paler than the raw face (what the carvers finished). */
const POLISHED: Ramp = ['#857a7c', '#b0a59b', '#c6bbaf', '#dcd2c5', '#ede6da'];

const bell = (d: number): number => (d >= 1 ? 0 : 1 - d * d);

/**
 * The finished face, as its carvers meant it, at `ax` across from its middle (either side the same) and
 * `y` up from its foot: a statue's calm face, crowned with a plain band, heavy-browed, its eyes blank,
 * the long nose, the full closed mouth, the chin; its height out of the face, or null outside it.
 */
function faceHeight(ax: number, y: number): number | null {
  const ny = (y - 52) / 48;
  if (ny < -1 || ny > 1) return null;
  let w = ny > -0.2 ? 34 : 34 - ((-0.2 - ny) / 0.8) * 14;
  if (ny > 0.62) w = 34 * Math.sqrt(Math.max(0, 1 - ((ny - 0.62) / 0.38) ** 2));
  if (ax > w) return null;
  let h = 9 * Math.min(1, (w - ax) / 5) * Math.min(1, (y - 4) / 5);
  h += 2.5 * bell(Math.abs(y - 86) / 3.2) * (ax < w - 2 ? 1 : 0); // the crown's band
  h += 3 * bell(Math.abs(y - 69) / 3.5) * (ax < 27 ? 1 : 0); // the brow
  const socket = Math.hypot((ax - 13) / 10, (y - 60) / 6);
  h -= 7 * bell(socket);
  h += 4 * bell(Math.hypot((ax - 13) / 5.5, (y - 59.5) / 3)); // the blank eye
  if (y > 34 && y < 67) {
    const nw = 3 + ((67 - y) / 33) * 4.5;
    if (ax < nw) h += (1 - (ax / nw) ** 2) * (3 + ((67 - y) / 33) * 6);
  }
  h -= 2 * bell(Math.hypot((ax - 5) / 2.6, (y - 35.5) / 1.6)); // a nostril
  h += 2 * bell(Math.hypot((ax - 19) / 10, (y - 46) / 9)); // the cheekbone
  if (ax < 13) {
    h += 2.2 * bell(Math.abs(y - 28) / 2) * (1 - ax / 13); // the upper lip
    h += 2.6 * bell(Math.abs(y - 22.5) / 2.4) * (1 - ax / 14); // the lower lip
  }
  h += 2.5 * bell(Math.hypot(ax / 12, (y - 12) / 8)); // the chin
  return Math.max(0.6, h);
}

/**
 * A GREAT FACE HALF CARVED INTO THE CLIFF, the Unfinished's kin, begun and given up: its left half
 * finished (crowned, heavy-browed, a blank eye, the long nose, the full mouth, the chin, dressed smooth
 * and paler), its right half still the block it was coming out of, roughed into flat planes, pocked by
 * the point and scored by the claw chisel; the drill holes down the line where the carvers stopped, and
 * down the block's far edge where it was to be split from the cliff. Stands against a far face, its
 * foot at the face's foot, as high as the cliff. 104 x 112 at (52, 110).
 */
function carvedFace(): Sprite {
  return relief(104, 112, (x, y) => {
    if (y < 1 || y > 104) return null;
    if (x <= 1.5) {
      // the finished half, and the groove the carvers cut round it
      const h = faceHeight(-x, y);
      if (h === null) return faceHeight(-x - 2, y) !== null || faceHeight(-x, y - 2) !== null ? { h: 0.5, r: FACE, tone: 1 } : null;
      if (x > -0.5 && Math.floor(y) % 6 < 2) return { h: 1, r: FACE, tone: 0 }; // the drill holes down the line
      if (Math.abs(y - 25.4) < 0.7 && -x < 10) return { h, r: POLISHED, tone: 0 }; // the line of the closed mouth
      return { h, r: POLISHED };
    }
    // the raw half: a squared block, its edge broken
    const edge = 38 + (hash(0, Math.floor(y / 4), 994) - 0.5) * 4;
    if (x > edge || y > 102 - hash(Math.floor(x / 4), 1, 994) * 3) return null;
    if (x > edge - 2.5 && Math.floor(y) % 7 < 2) return { h: 1, r: FACE, tone: 0 }; // where it was to be split from the cliff
    const meant = faceHeight(x, y);
    let h = meant === null ? 8 : 8 + Math.round((meant - 8) / 3.5) * 3; // roughed out in flat planes
    h += (hash(Math.floor(x / 3), Math.floor(y / 3), 995) - 0.5) * 2.2;
    if (fr((x + y) / 5) < 0.2) h -= 0.8; // the claw chisel's scoring
    if (hash(Math.floor(x), Math.floor(y), 996) > 0.94) return { h, r: FACE, tone: 1 }; // the point's pocks
    return { h: Math.max(1, h), r: FACE };
  });
}

/**
 * A GREAT HAND HALF CARVED, raised out of a rough block at the cliff's foot: the colossus's that never
 * was, its open hand finished (the palm toward the eye, four fingers and the thumb spread, dressed
 * smooth), its forearm still roughed out of the raw block, the block's drill holes where it was
 * to be split free, along the block's front. An obstacle on the floor before a far face. 96 x 124 at (48, 114).
 */
function carvedHand(): Sprite {
  const S = new Scene(new Px(96, 124), 48, 114);
  const H: V3 = norm([1, -1, 0]); // across the eye's view
  const T: V3 = norm([1, 1, 0]); // toward the eye
  const Z: V3 = [0, 0, 1];
  const P = (a: number, t: number, z: number): V3 => add(add(mul(H, a), mul(T, t)), mul(Z, z));
  // the raw rock: the squared block it was coming out of, pocked, a row of drill holes along its front
  // where it was to be split free; the forearm roughed out of its top
  const ang = 0.35;
  const Hb: V3 = add(mul(H, Math.cos(ang)), mul(T, Math.sin(ang)));
  const Tb: V3 = add(mul(T, Math.cos(ang)), mul(H, -Math.sin(ang)));
  S.box(P(0, -5, 9), [Hb, Tb, Z], [19, 13, 9], (f, u, v, n) => {
    if (f === 2 && Math.abs(u - 0.55) < 0.1 && Math.abs(fr(v * 6) - 0.5) < 0.13) return '#3a3242';
    const k = hash(Math.floor(u * 9), Math.floor(v * 9) + f * 31, 998);
    return toneAt(n, STONE, (k - 0.5) * 0.3);
  }, 1);
  S.rod(P(0, -3, 17), P(0, -0.5, 47), 9, 6.8, STONE, 2);
  // the palm toward the eye, and the heel of the hand
  S.egg(P(0, 0, 60), [H, T, Z], [14, 5, 17], (n) => toneAt(n, POLISHED, 0.08), 4);
  // the fingers, spread, the middle longest, their tips leaning a little toward the eye
  const fingers: [number, number][] = [[-10, 22], [-3.4, 27], [3.4, 25], [10, 19]];
  fingers.forEach(([a, L], k) => {
    const base = P(a, 0.5, 72);
    const mid = P(a * 1.18, 1.5, 72 + L * 0.55);
    const tip = P(a * 1.32, 3.5, 72 + L);
    S.rod(base, mid, 3.3, 3.1, POLISHED, 5 + k);
    S.rod(mid, tip, 3.1, 2.5, POLISHED, 5 + k);
  });
  // the thumb, out to the side
  S.rod(P(-12, 1, 54), P(-20, 2.5, 64), 3.6, 3.2, POLISHED, 9);
  S.rod(P(-20, 2.5, 64), P(-25, 4, 74), 3.2, 2.6, POLISHED, 9);
  return finish(S, 48, 114);
}

/** A WATER BARREL of staves bound in iron, a dipper hung on its rim; and broken, its staves sprung and lying, a hoop, the water gone dark into the dust. 44 x 54 at (22, 46). */
function waterBarrel(broken: boolean): Sprite {
  const S = new Scene(new Px(44, 54), 22, 46);
  if (!broken) {
    for (let z = 0; z <= 30; z += 0.5) {
      const r = 8.5 + Math.sin((z / 30) * Math.PI) * 1.8;
      for (let a = -Math.PI; a < Math.PI; a += 0.08) {
        const n: V3 = [Math.cos(a), Math.sin(a), 0];
        if (dot(n, TOWARD) < -0.25) continue;
        const q: V3 = [n[0] * r, n[1] * r, z];
        const [x, y] = S.at(q);
        const hoop = [3.5, 15, 26.5].some((b) => Math.abs(z - b) < 1);
        S.put(Math.round(x), Math.round(y), dot(q, TOWARD), hoop ? toneAt(n, IRON, 0.25) : Math.abs(fr((a * 8) / Math.PI) - 0.5) < 0.07 ? TIMBER[1] : toneAt(n, TIMBER, 0), 1, z);
      }
    }
    S.egg([0, 0, 30], XYZ, [8.5, 8.5, 0.6], (_n, w) => (Math.hypot(w[0], w[1]) > 7.2 ? TIMBER[3] : '#3e4a5a'), 2);
    S.rod([6, -3, 31], [13, -5, 27], 0.7, 0.7, TIMBER, 3);
    S.egg([13.5, -5.2, 26], XYZ, [2, 2, 1.4], (n) => toneAt(n, TIMBER, 0), 3);
  } else {
    // the dark of the spilt water in the dust, the staves sprung and lying every way, a hoop, the head
    S.egg([1, 1, 0], XYZ, [16, 13, 0.4], (_n, w) => (Math.hypot((w[0] - 1) / 16, (w[1] - 1) / 13) > 0.8 ? '#6c6674' : '#5d5868'), 1);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.3 + hash(k, 1, 997) * 0.4;
      const r0 = 3 + hash(k, 2, 997) * 3;
      const r1 = r0 + 9 + hash(k, 3, 997) * 4;
      const tw = (hash(k, 4, 997) - 0.5) * 0.6;
      S.rod([Math.cos(a) * r0, Math.sin(a) * r0, 1.2], [Math.cos(a + tw) * r1, Math.sin(a + tw) * r1, 1.2], 1.3, 1.3, TIMBER, 2 + k);
    }
    S.egg([-5, 5, 1], XYZ, [8.5, 8.5, 0.8], (_n, w) => (Math.hypot(w[0] + 5, w[1] - 5) > 7.4 ? IRON[3] : null), 11);
    S.egg([6, -5, 1.2], XYZ, [6.5, 6.5, 0.8], (n) => toneAt(n, TIMBER, 0.2), 12);
  }
  return finish(S, 22, 46);
}

/** A BASKET of the chippings, wicker, its rim lit, heaped; and broken, tipped on its side, its mouth toward the eye, the chippings spilt out of it. 44 x 38 at (22, 30). */
function chipBasket(broken: boolean): Sprite {
  const S = new Scene(new Px(44, 38), 22, 30);
  const weave = (n: V3, w: V3, along: number): string => {
    const k = (Math.floor(along / 2) + Math.floor(Math.atan2(w[1], w[0]) * 4)) & 1;
    return toneAt(n, ROPE, k ? 0.1 : -0.15);
  };
  if (!broken) {
    for (let z = 0; z <= 12; z += 0.5) {
      const r = 6 + z * 0.18;
      for (let a = -Math.PI; a < Math.PI; a += 0.12) {
        const n: V3 = [Math.cos(a), Math.sin(a), 0];
        if (dot(n, TOWARD) < -0.25) continue;
        const q: V3 = [n[0] * r, n[1] * r, z];
        const [x, y] = S.at(q);
        S.put(Math.round(x), Math.round(y), dot(q, TOWARD), z > 11.4 ? ROPE[4] : weave(n, q, z), 1, z);
      }
    }
    for (let i = 0; i < 7; i++) S.egg([-4 + (i % 3) * 4 + hash(i, 1, 992) * 2, -3 + Math.floor(i / 3) * 3, 13 + hash(i, 2, 992) * 2], XYZ, [2.4, 2, 1.6], facetOf(i % 2 ? FRESH : STONE, 0.05), 2);
  } else {
    // lying along A, its foot back up the screen, its mouth toward the eye and to the right
    const A: V3 = norm([1, 0.25, 0]);
    const U: V3 = [0, 0, 1];
    const B: V3 = norm(cross(A, U));
    const c: V3 = [-12, -3, 0];
    for (let t = 0; t <= 12; t += 0.5) {
      const r = 6 + t * 0.18;
      for (let a = -Math.PI; a < Math.PI; a += 0.1) {
        const n: V3 = add(mul(U, Math.cos(a)), mul(B, Math.sin(a)));
        if (dot(n, TOWARD) < -0.3) continue;
        const q: V3 = add(add(c, mul(A, t)), add(mul(n, r), [0, 0, 6.6]));
        const [x, y] = S.at(q);
        S.put(Math.round(x), Math.round(y), dot(q, TOWARD), t > 11.4 ? ROPE[4] : weave(n, q, t), 1, q[2]);
      }
    }
    // the dark inside it, through its mouth
    S.egg(add(add(c, mul(A, 12)), [0, 0, 6.6]), [A, B, U], [0.4, 7.4, 7.4], () => '#3e3546', 2);
    // the chippings spilt from its mouth in a fan along the floor
    for (let i = 0; i < 14; i++) {
      const s = 2 + hash(i, 1, 993) * 14;
      const off = (hash(i, 2, 993) - 0.5) * (4 + s * 0.9);
      const q = add(add(c, mul(A, 13 + s)), mul(B, off));
      S.egg([q[0], q[1], 1], XYZ, [1.6 + hash(i, 3, 993) * 1.2, 1.4 + hash(i, 4, 993), 1.2], facetOf(i % 2 ? FRESH : STONE, 0.05), 3 + i);
    }
  }
  return finish(S, 22, 30);
}

/**
 * THE TRAP OF THE QUARRY: THE DRILL HOLES, a floor tile: the bed drilled for splitting in rows, each
 * hole dark, its lip lit (`glint`: the light catching the points waiting down them); from them the
 * stone's own spikes come up (`drillSpike`, k steps of 4). 64 x 33 at (32, 0).
 */
function drillHoles(glint: boolean): Sprite {
  const p = new Px(64, 33);
  for (let py = 0; py < 33; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const [U, V] = uv;
      // the holes in a grid of four by four, each an ellipse on the floor
      const hu = fr((U - 8) / 16);
      const hv = fr((V - 8) / 16);
      const du = (hu - 0.5) * 16;
      const dv = (hv - 0.5) * 16;
      const d = Math.hypot(du / 4, dv / 4);
      if (d < 0.75) p.set(px, py, glint && d < 0.42 ? FRESH[4] : '#2a2432');
      else if (d < 1.05 && du + dv > 0) p.set(px, py, FRESH[3]);
      else if (d < 1.05) p.set(px, py, STONE[1]);
    }
  }
  return p.sprite(32, 0, GRAIN);
}
/** A spike of the stone, up out of a drill hole, `k` steps of 4 up (1 to 4): a sharp splinter of the fresh stone, lit on its left. 16 x 28 at (8, 26). */
function drillSpike(k: number): Sprite {
  const p = new Px(16, 28);
  const h = 4 + k * 5;
  for (let y = 0; y < h; y++) {
    const w = Math.max(0.5, 3.2 * (1 - y / h));
    for (let x = Math.floor(8 - w); x < Math.ceil(8 + w); x++) p.set(x, 26 - y, x < 8 ? FRESH[3] : x < 9 ? FRESH[2] : STONE[1]);
  }
  p.set(7, 26 - h, FRESH[4]);
  return compose(null, [p], null).sprite(8, 26, GRAIN);
}

/**
 * THE MASTER MASON'S MALLET (a quest piece, with no quest yet): the great mallet of the quarry's master,
 * its head of oak bound in iron at both ends, its haft long and worn dark where his hands held it. Lying
 * on the floor. 72 x 44 at (36, 30).
 */
function masonsMallet(): Sprite {
  const S = new Scene(new Px(72, 44), 36, 30);
  S.rod([-26, 7, 2.6], [10, -3, 4.4], 1.8, 2.1, TIMBER, 1);
  S.rod([-26, 7, 2.6], [-17, 4.6, 3], 2, 2, ['#2a201c', '#3a2b28', '#4a3830', '#5a4636', '#6a5442'], 2);
  const ax = beamAxes([14, -12, 8], [16, 6, 8]);
  S.box([15, -4, 8], ax, [11, 6.6, 6.6], (_f, u, _v, n) => (u < 0.1 || u > 0.9 ? toneAt(n, IRON, 0.2) : toneAt(n, TIMBER, 0.1)), 3);
  return finish(S, 36, 30);
}

// =================================================================================================
// THE LIST

let made: Piece[] | null = null;
/** THE QUARRY'S PIECES SO FAR (the first of its 25), by name, made once. */
export function quarryPieces(): Piece[] {
  if (made) return made;
  made = [
    // obstacles
    { name: 'cut block', kind: 'obstacle', frames: [cutBlock(0)], shadow: 0.45 },
    { name: 'block split from the bed', kind: 'obstacle', frames: [cutBlock(1)], shadow: 0.45 },
    { name: 'block marked to split', kind: 'obstacle', frames: [cutBlock(2)], shadow: 0.45 },
    { name: 'stacked blocks', kind: 'obstacle', frames: [stackedBlocks()], shadow: 0.5 },
    { name: 'the great obelisk', kind: 'obstacle', frames: [obelisk()], shadow: 0.9 },
    { name: 'the crane', kind: 'obstacle', frames: [crane()], shadow: 0.6 },
    { name: 'cart of rubble', kind: 'obstacle', frames: [rubbleCart(true), rubbleCart(true, true)], shadow: 0.42 },
    { name: 'empty cart', kind: 'obstacle', frames: [rubbleCart(false), rubbleCart(false, true)], shadow: 0.42 },
    { name: 'sledge on rollers', kind: 'obstacle', frames: [sledge()], shadow: 0.6 },
    { name: 'scaffolding', kind: 'obstacle', frames: [scaffold()], shadow: 0.5 },
    // floor tiles
    { name: 'rails', kind: 'floor tile', frames: [railsTile(false, false), railsTile(true, false), railsTile(false, true), railsTile(true, true)] },
    // on the floor
    { name: 'splitting tools', kind: 'on the floor', frames: [splittingTools()] },
    { name: 'chippings', kind: 'on the floor', frames: [chippings(0), chippings(1)], shadow: 0.3 },
    // the far cliffs' own
    { name: 'ladder against the face', kind: 'on the wall', frames: [ladder()], shadow: 0.25 },
    { name: 'rope and bucket', kind: 'on the wall', frames: [ropeAndBucket()], shadow: 0.2 },
    { name: 'the great face, half carved', kind: 'on the wall', frames: [carvedFace()] },
    { name: 'the great hand, half carved', kind: 'obstacle', frames: [carvedHand()], shadow: 0.6 },
    // breakables: whole, and broken
    { name: 'water barrel', kind: 'breakable', frames: [waterBarrel(false), waterBarrel(true)], shadow: 0.22 },
    { name: 'basket of chippings', kind: 'breakable', frames: [chipBasket(false), chipBasket(true)], shadow: 0.2 },
    // the trap: the drill holes and the stone's spikes up out of them
    { name: 'the drill holes', kind: 'trap', frames: [drillHoles(false), drillHoles(true), drillSpike(1), drillSpike(2), drillSpike(3), drillSpike(4)] },
    // the quest's (no quest yet)
    { name: "the master mason's mallet", kind: 'quest', frames: [masonsMallet()], shadow: 0.2 },
    // the overseers' redoubt, the Quarry's stronghold
    { name: "the redoubt's gatehouse", kind: 'gate', frames: [0, 1, 2, 3].map((f) => gatehouse(false, f)).concat([gatehouse(true, 0)]), shadow: 1.2 },
    { name: "the court's flagstones", kind: 'floor tile', frames: [flagstones(false, 1), flagstones(false, 2), flagstones(true, 3)] },
    // the cult's (the set's, art/act1_cult.ts: at every stronghold of the five floors)
    { name: 'the altar of the words', kind: 'obstacle', frames: [wordAltar()], shadow: 0.7 },
    { name: "the cult's brazier", kind: 'obstacle', frames: [0, 1, 2, 3].map(pinkBrazier), shadow: 0.3 },
    { name: "the cult's banner", kind: 'obstacle', frames: [0, 1, 2, 3].map(cultBanner), shadow: 0.2 },
    // the mountain's (for the tops and the set)
    { name: 'pine', kind: 'obstacle', frames: [pine(0.2, 3), pine(0.55, 11), pine(0.9, 17)], shadow: 0.4 },
    { name: 'boulder', kind: 'obstacle', frames: [boulder(0, 5), boulder(1, 9), boulder(2, 13)], shadow: 0.36 },
  ];
  return made;
}
