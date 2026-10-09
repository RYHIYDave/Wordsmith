// The town's own things, at the heroes' grain (Version 14.4).
//
// The owner, 5 Oct 2026: "give the vendors little areas. Like a shop stall or a bazaar tent area
// with goods laid out on a table. Maybe the martial vendor has an anvil and forge, the magic guy
// has some jewelry and potions laid out, and the wordsmith I'm not sure about but I want him to
// be very runic. The shady guy being the exception, he's just leaned up against a wall in the
// shadows."
//
// So each of the town's people has a place, and each place is a few things painted here:
//   the smithy     a forge of the walls' stone with its fire, an anvil on a round of wood, a rack
//                  of arms, a quenching trough
//   the bazaar     a striped tent (its back: cloth and poles; its front: a table of wares under
//                  the awning's edge) on a rug
//   the ring       the wordsmith's: a slab of stone cut with runes, in a ring of standing stones
//                  each with a rune alight in it, on a circle of runes cut in the floor
//   and the Lexicon on its lectern, and the stash.
//
// Painted like the dungeon's things (art/props.ts), with the same tools and in the same colours:
// wood is plum, iron is iron, a fire burns orange, gold is treasure. One colour is the town's
// own: the teal-to-cyan of what OUTLASTS a character (the gate's light, the Lexicon's script, the
// stone in the stash's lock, every rune of the wordsmith's). A thing's anchor is the middle of
// its foot, where it touches the floor; what lies flat on the floor is anchored at its middle.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Iso, plainSide } from './isokit';
import { VAULT } from './ground';
import type { Theme } from './ground';
import { BONE, GRAIN, HI, INDIGO, INK, LO, PINK, PLUM, ROBE, SPARK, STEEL, TEAL, ball, compose, dim, hash, limb, lit } from './kit';
import type { Ramp } from './kit';
import { IRON } from './mkit';
import { COAL, EMBER, GOLD, ROUND_HI, ROUND_LO, column, hoop, stoneOf, tongue, trunk } from './props';
import type { TrunkLook } from './props';
import { makeRing3 } from './ring3';
import type { Ring3Art } from './ring3';
import { SMITH3 } from './smith3';

/** A rune: a few strokes on a 5 x 9 grid. `k` picks which. Painted at (x, y), its top left. */
const RUNES: ReadonlyArray<ReadonlyArray<string>> = [
  ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '.#.#.', '#...#', '.....'],
  ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#', '#....', '#....'],
  ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#....', '#...#', '.###.'],
  ['#.#.#', '#.#.#', '.###.', '..#..', '..#..', '.###.', '#.#.#', '#...#', '.....'],
  ['..#..', '..#..', '#####', '..#..', '.#.#.', '#...#', '#...#', '.#.#.', '..#..'],
  ['#####', '....#', '...#.', '.###.', '...#.', '....#', '....#', '#...#', '.###.'],
];

export function rune(p: Px, k: number, x: number, y: number, color: string, tall = 9): void {
  const rows = RUNES[((k % RUNES.length) + RUNES.length) % RUNES.length];
  for (let j = 0; j < Math.min(tall, rows.length); j++) for (let i = 0; i < 5; i++) if (rows[j][i] === '#') p.set(x + i, y + j, color);
}

// ---------------------------------------------------------------------------------------------
// THE SMITHY

// The forge: a hearth of the walls' stone on a step, an arched mouth in the side that looks down
// the screen to the left (toward the anvil and the armourer) with a bed of coals and a fire in it,
// a slab across its top, and a hood of iron drawn in to a flue that carries the smoke up. It is
// built on the grid (art/isokit.ts): the owner, 5 Oct 2026, "any sprite or doodad or whatever
// should always be seen at an angle. The forge near the blacksmith being the prime example".
// Until Version 14.5 it was a drawing of its own front. 80 x 156; its tile's middle is at (40, 132).
// Four frames.

const FORGE_FIRE: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  // each tongue: [where along the bed, height, half width, lean]
  [[0, 15, 5, 2], [-6, 9, 3, -1], [6, 7, 2.6, 1]],
  [[1, 13, 4.8, -2], [6, 10, 3, 2], [-6, 6, 2.4, -1]],
  [[0, 16, 5, -3], [-5, 8, 2.8, -2], [6, 9, 2.6, 1]],
  [[-1, 12, 4.8, 1], [-6, 10, 3, -1], [5, 7, 2.4, 2]],
];

/**
 * Coursed stone on a side of something built on the grid: `tones` are a wall's five (the joint, a
 * stone's shaded lip, the usual stone, the odd stone, its lit lip), `course` the rows to a course,
 * `long` the columns to a stone; every other course is set half a stone along.
 */
function coursed(tones: readonly [string, string, string, string, string], course: number, long: number, seed: number): (u: number, v: number, w: number, h: number) => string {
  const [joint, lo, usual, odd, hi] = tones;
  return (u, v, _w, h) => {
    const c = Math.floor(v / course);
    const r = v % course;
    const uu = u + (c % 2 === 0 ? 0 : Math.floor(long / 2));
    const k = uu % long;
    if (r === 0 && v > 0) return joint;
    if (k === 0 && u > 0) return joint;
    if (v === 0 || r === 1 || k === 1) return hi;
    if (r === course - 1 || k === long - 1 || v >= h - 1) return lo;
    return hash(c, Math.floor(uu / long), seed) < 0.3 ? odd : usual;
  };
}

function makeForge(theme: Theme, frame: number): Sprite {
  const W = 80;
  const H = 156;
  const ox = 40;
  const oy = 132;
  const stone = stoneOf(theme);
  const hearth = new Px(W, H);
  const hood = new Px(W, H);
  const fire = new Px(W, H);
  const A = 0.42; // half the hearth, in tiles
  const B = 0.47; // half its step and its slab
  const Z0 = 5; // the step
  const Z1 = 46; // the hearth
  const Z2 = 51; // the slab
  const iso = new Iso(hearth, ox, oy);
  // ---- the stonework: a step, the hearth, a slab across its top
  const step = { top: () => stone[3], left: plainSide(theme.lit[2], theme.lit[4], theme.lit[1]), right: plainSide(theme.shade[2], theme.shade[4], theme.shade[1]) };
  iso.box(-B, -B, B, B, 0, Z0, step);
  // the mouth, in the side that looks left: an arch, with the dark of the hearth in it
  const MX = 13; // the column of the side the arch stands on
  const HW = 9;
  const SPRING = 20; // the row its round begins at
  const SILL = 38; // the first row under it
  const inMouth = (u: number, v: number): boolean => v < SILL && (v >= SPRING ? Math.abs(u + 0.5 - MX) <= HW : (u + 0.5 - MX) ** 2 + (v + 0.5 - SPRING) ** 2 <= HW * HW);
  const mouth = new Set<number>();
  let bed: [number, number] = [ox, oy];
  const lit = coursed(theme.lit, 14, 14, 3);
  iso.top(-A, -A, A, A, Z1, () => stone[2]);
  iso.left(-A, A, A, Z0, Z1, (u, v, w, h, px, py) => {
    if (inMouth(u, v)) {
      mouth.add(py * W + px);
      if (u === MX && v === SILL - 3) bed = [px, py];
      // (the thickness of the wall shows down the mouth's left side, and the coals lie along its foot)
      if (u + 0.5 - MX < -HW + 3 && v >= SPRING - 4) return theme.shade[2];
      if (v >= SILL - 3) {
        const n = hash(u, frame, 3 + v);
        return n < 0.3 ? EMBER[2] : n < 0.5 ? EMBER[1] : COAL[3];
      }
      return v >= SILL - 5 && hash(u, frame, 9) < 0.5 ? COAL[2] : COAL[0];
    }
    // (the stone round the mouth is warm with it)
    if (inMouth(u - 1, v) || inMouth(u + 1, v) || inMouth(u, v + 1) || inMouth(u, v - 1)) return EMBER[0];
    return lit(u, v, w, h);
  });
  iso.right(A, -A, A, Z0, Z1, coursed(theme.shade, 14, 14, 8));
  iso.box(-B, -B, B, B, Z1, Z2, { top: () => stone[3], left: plainSide(theme.lit[3], theme.lit[4], theme.lit[1]), right: plainSide(theme.shade[3], theme.shade[4], theme.shade[1]) });
  // ---- the fire: tongues from the bed of coals, and nothing of them outside the mouth
  for (const [dx, h, w, lean] of FORGE_FIRE[frame % FORGE_FIRE.length]) tongue(fire, bed[0] + dx, bed[1] + Math.round(dx / 2), h, w, lean, EMBER);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fire.has(x, y) && !mouth.has(y * W + x)) fire.erase(x, y);
  // ---- the hood: iron, wide over the hearth and drawn in to the flue; the flue, banded, and its lip
  const ih = new Iso(hood, ox, oy);
  const C = 0.44;
  const D = 0.16;
  const Z3 = 82;
  const Z4 = 120;
  // (the side turned to the light is lit along its upper edge and down the edge it shares with the wall's side)
  ih.slopeLeft(-C, C, C, Z2, -D, D, D, Z3, (t, k) => (t < 0.07 ? IRON[1] : t > 0.88 || k < 0.09 ? IRON[3] : IRON[2]));
  ih.slopeRight(C, -C, C, Z2, D, -D, D, Z3, (t, k) => (t < 0.07 || k > 0.9 ? IRON[0] : IRON[1]));
  // (the edge between its two sides catches the light; rivets along its foot)
  const e0 = ih.at(C, C, Z2);
  const e1 = ih.at(D, D, Z3);
  hood.line(Math.round(e0[0]) - 1, Math.round(e0[1]) - 1, Math.round(e1[0]) - 1, Math.round(e1[1]), IRON[3]);
  for (const k of [0.15, 0.4, 0.65, 0.9]) {
    const q = ih.at(-C + 2 * C * k, C, Z2 + 3);
    hood.set(Math.round(q[0]), Math.round(q[1]), IRON[3]);
  }
  const band = (v: number): boolean => v === 9 || v === 10 || v === 24 || v === 25;
  ih.box(-D, -D, D, D, Z3, Z4, { top: () => IRON[1], left: (_u, v) => (band(v) ? IRON[3] : IRON[2]), right: (_u, v) => (band(v) ? IRON[2] : IRON[1]) });
  const E = 0.21;
  ih.box(-E, -E, E, E, Z4, Z4 + 4, { top: (u, v) => (u > 0.2 && u < 0.8 && v > 0.2 && v < 0.8 ? INK : IRON[3]), left: plainSide(IRON[3]), right: plainSide(IRON[2]) });
  // a spark or two out of the mouth
  const sparks: ReadonlyArray<readonly [number, number]> = [[-9, -22], [5, -27], [-3, -30], [9, -20]];
  const [sx, sy] = sparks[frame % sparks.length];
  const over = new Px(W, H);
  over.set(bed[0] + sx, bed[1] + sy, EMBER[3]);
  const s = compose(null, [hearth, fire, hood], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: bed[0] / GRAIN, y: (bed[1] - 8) / GRAIN, r: 17 + (frame % 2), color: EMBER[2], a: 0.5 }];
  return s;
}

// The anvil: on a round of wood, its face worn bright; a hammer lies across it. It stands on the
// grid (Version 14.5): its length runs along the wall behind the smithy (up the screen to the
// left, where its horn points, and down it to the right), so the side we see of it looks down the
// screen to the left, toward the armourer's customers. 56 x 56; its tile's middle is at (28, 44).

/** Iron, as the two sides and the top of something built on the grid show it. */
const IRON_BOX = { top: (): string => IRON[3], left: plainSide(IRON[2], IRON[3], IRON[1]), right: plainSide(IRON[1], IRON[2], IRON[0]) };
/** Plum wood, likewise. */
const WOOD_BOX = { top: (): string => PLUM[3], left: plainSide(PLUM[2], PLUM[3], PLUM[1]), right: plainSide(PLUM[1], PLUM[2], PLUM[0]) };

function makeAnvil(): Sprite {
  const W = 56;
  const H = 56;
  const ox = 28;
  const oy = 44;
  const wood = new Px(W, H);
  const iron = new Px(W, H);
  const tool = new Px(W, H);
  // the round of wood (round: it looks the same from every side): bark down its side, rings on its top
  const TOP = 13;
  lit(wood, PLUM, ROUND_HI, ROUND_LO, (l) => {
    l.rect(ox - 11, oy - TOP, 22, TOP - 1, INK);
    l.ellipse(ox, oy - 1, 11, 2.8, INK);
  });
  for (const x of [ox - 7, ox - 1, ox + 6]) for (let y = oy - TOP + 4; y < oy - 1; y++) if (hash(x, y, 3) > 0.25 && wood.has(x, y)) wood.set(x, y, PLUM[0]);
  wood.ellipse(ox, oy - TOP, 11, 3.2, PLUM[3]);
  wood.ellipse(ox, oy - TOP, 7, 2, PLUM[2]);
  wood.ellipse(ox, oy - TOP, 2.6, 0.9, PLUM[3]);
  // the anvil: a spreading foot, a waist, the body with its face, and the horn drawn out to a point
  const iso = new Iso(iron, ox, oy);
  const L0 = -0.3; // where the body ends and the horn begins
  const L1 = 0.3; // its heel
  const HW = 0.1; // half its width
  const FACE = TOP + 16;
  iso.box(-0.24, -0.12, 0.24, 0.12, TOP, TOP + 3, IRON_BOX);
  iso.box(-0.12, -0.075, 0.12, 0.075, TOP + 3, TOP + 9, IRON_BOX);
  iso.box(L0, -HW, L1, HW, TOP + 9, FACE, { top: () => STEEL[3], left: plainSide(IRON[2], IRON[3], IRON[1]), right: IRON_BOX.right });
  // the horn: its side toward us, then its top (worn bright like the face)
  const tip = iso.at(L0 - 0.3, 0, FACE - 1);
  const pt = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso.at(x, y, z);
    return [Math.round(a), Math.round(b)];
  };
  iron.poly([pt(L0, HW, FACE), [Math.round(tip[0]), Math.round(tip[1])], pt(L0, HW, TOP + 10)], IRON[2]);
  iron.poly([pt(L0, -HW, FACE), [Math.round(tip[0]), Math.round(tip[1])], pt(L0, HW, FACE)], STEEL[2]);
  // (a bright edge where the face meets the side toward us)
  const e0 = pt(L0, HW, FACE);
  const e1 = pt(L1, HW, FACE);
  iron.line(e0[0], e0[1], e1[0] - 1, e1[1] - 1, '#ffffff');
  // the hammer laid across its face: the head on the face, the handle out toward us over the edge
  const th = new Iso(tool, ox, oy);
  th.box(0.03, -0.1, 0.17, 0.03, FACE, FACE + 5, { top: () => STEEL[2], left: plainSide(IRON[2], STEEL[2]), right: plainSide(IRON[1]) });
  th.box(0.08, 0.03, 0.12, 0.42, FACE + 1, FACE + 3, WOOD_BOX);
  return compose(null, [wood, iron, tool], null).sprite(ox, oy, GRAIN);
}

// The rack of arms: two posts and two rails of plum wood; on it a greatsword, two swords, a bow
// and a round shield. It stands along the wall behind it (Version 14.5: it was a drawing of its
// own front): its rails run down the screen to the right as the wall does, and what hangs on it
// hangs in that plane. A little longer than its tile. 62 x 92; its tile's middle is at (22, 80).

function makeRack(): Sprite {
  const W = 62;
  const H = 92;
  const ox = 22;
  const oy = 80;
  const frame = new Px(W, H);
  const arms = new Px(W, H);
  const front = new Px(W, H);
  const iso = new Iso(frame, ox, oy);
  /** The line it stands on (how far up its tile, toward the wall), and its two ends along the wall. */
  const Y = -0.34;
  const X0 = -0.72;
  const X1 = 0.72;
  const TALL = 58;
  // a foot under each post, out toward us; the rails; the posts
  for (const x of [X0, X1 - 0.07]) iso.box(x, Y - 0.08, x + 0.07, Y + 0.17, 0, 3, WOOD_BOX);
  for (const z of [14, 46]) iso.box(X0 - 0.03, Y - 0.02, X1 + 0.03, Y + 0.02, z, z + 4, WOOD_BOX);
  for (const x of [X0, X1 - 0.07]) iso.box(x, Y - 0.035, x + 0.07, Y + 0.035, 3, TALL, WOOD_BOX);
  // --- what hangs on it: painted as it hangs, face on, then set in the rack's plane ---
  const FW = 46;
  const FH = 62;
  const flat = new Px(FW, FH);
  const boss = new Px(FW, FH);
  /** A sword standing point down against the rails: pommel, grip, guard, blade. */
  const sword = (x: number, top: number, len: number, wide: number): void => {
    flat.rect(x - 1, top, 2, 2, GOLD[3]);
    flat.rect(x - 1, top + 2, 2, 6, PLUM[1]);
    flat.rect(x - wide - 2, top + 8, wide * 2 + 4, 2, STEEL[2]);
    flat.hline(x - wide - 2, top + 8, wide * 2 + 4, STEEL[3]);
    for (let y = 0; y < len; y++) {
      const hw = y > len - wide * 2 ? Math.max(0, (len - y) / 2) : wide;
      for (let i = -Math.ceil(hw); i < Math.ceil(hw); i++) flat.set(x + i, top + 10 + y, i < 0 ? STEEL[3] : STEEL[2]);
    }
    flat.vline(x - 1, top + 10, len - 2, '#ffffff');
  };
  sword(8, 2, 48, 2);
  sword(17, 12, 36, 2);
  sword(24, 12, 36, 2);
  // a bow, unstrung side out
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = 35 + Math.round(4 * Math.sin(t * Math.PI));
    flat.set(x, 8 + i, PLUM[3]).set(x + 1, 8 + i, PLUM[1]);
  }
  flat.vline(35, 8, 41, BONE[2]);
  // a round shield hung on the lower rail: teal, with an iron boss and rim (seen along the wall it is narrower than it is tall)
  ball(boss, 22, 43, 7.5, 9, TEAL);
  for (const [x, y] of ring(22, 43, 7.5, 9)) boss.set(x, y, x < 22 ? IRON[3] : IRON[2]);
  ball(boss, 22, 43, 2.4, 3, IRON);
  boss.set(21, 42, STEEL[3]);
  const hang = (onto: Px, what: Px): void => {
    new Iso(onto, ox, oy).left(X0 + 0.02, X0 + 0.02 + FW / 32, Y + 0.05, 0, FH, (u, v) => what.get(u, v));
  };
  hang(arms, flat);
  hang(front, boss);
  return compose(null, [frame, arms, front], null).sprite(ox, oy, GRAIN);
}

/** The pixels on the rim of an ellipse. */
function ring(cx: number, cy: number, rx: number, ry: number): [number, number][] {
  const out: [number, number][] = [];
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
      if (d <= 1 && d > 0.74) out.push([x, y]);
    }
  }
  return out;
}

// The quenching trough: half a barrel on its side, full of dark water, a blade's tang standing
// out of it. 44 x 34; it stands at (22, 28).

function makeTrough(): Sprite {
  const W = 44;
  const H = 34;
  const cx = 22;
  const foot = 28;
  const tub = new Px(W, H);
  const iron = new Px(W, H);
  const over = new Px(W, H);
  lit(tub, PLUM, HI, LO, (l) => column(l, cx, 14, foot - 1, (t) => 18 - 4 * t ** 2));
  for (const x of [cx - 10, cx - 2, cx + 7]) for (let y = 16; y < foot - 1; y++) if (tub.has(x, y)) tub.set(x, y, PLUM[0]);
  // the water, seen from a little above
  tub.ellipse(cx, 14, 18, 4.2, PLUM[3]);
  tub.ellipse(cx, 14.4, 16, 3.2, INDIGO[0]);
  tub.hline(cx - 9, 13, 7, INDIGO[2]).hline(cx + 4, 15, 5, INDIGO[2]);
  hoop(iron, cx, 18, 17.2, 2, 1.4, IRON);
  hoop(iron, cx, 24, 15.2, 2, 1.2, IRON);
  // what is cooling in it
  over.rect(cx + 7, 3, 2, 10, STEEL[2]).vline(cx + 7, 3, 10, STEEL[3]);
  over.rect(cx + 5, 2, 6, 2, PLUM[2]);
  return compose(null, [tub, iron], over).sprite(cx, foot, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// THE BAZAAR

const STRIPE_A: readonly [string, string, string] = [TEAL[1], TEAL[2], TEAL[3]];
const STRIPE_B: readonly [string, string, string] = [BONE[2], BONE[3], '#ffffff'];

/** Striped cloth: which stripe a column is in, and its colour at a tone (0 shade, 1 body, 2 lit). */
function stripe(x: number, tone: 0 | 1 | 2): string {
  return (Math.floor(x / 8) % 2 === 0 ? STRIPE_A : STRIPE_B)[tone];
}

// The tent stands on the grid (Version 14.5: it was drawn square to the screen, the one thing in
// the hall that faced straight down it). It opens down the screen to the left. A cloth hung
// across its back, four poles, and a roof of striped cloth that slopes down from the back to an
// eave over the trader's head, with a scalloped edge hanging along the two sides we see; the
// trader stands under the eave, and the table of wares stands in front of him, in the open.
// (The roof stops at the trader: a roof that came forward over the table would hang, on the
// screen, across his face. Seen from above and to one side, the near corner of a roof is the
// lowest thing in the picture.) Two pictures, so that the trader can stand between them.

/** How far the tent reaches along the grid either side of its middle, in tiles. */
const TENT_A = 1.4;
/** Where its back cloth hangs and where its eave is, in tiles from the middle of the back's own tile; the heights of the roof at the two. */
const TENT_BACK = -0.3;
const TENT_EAVE = 1.15;
const TENT_HIGH = 118;
const TENT_LOW = 98;
/** How far the roof hangs out past the poles, and how deep its scalloped edge is. */
const TENT_OUT = 0.15;
const TENT_DROP = 9;

// The tent: the poles, the cloth of its back (in the roof's shade), the roof and its edge, a
// pennant, and a lantern hung under the eave. The trader stands in front of the cloth, under the
// eave. 168 x 208; its tile's middle is at (96, 164).

function makeTentBack(): Sprite {
  const W = 168;
  const H = 208;
  const ox = 96;
  const oy = 164;
  const poles = new Px(W, H);
  const cloth = new Px(W, H);
  const roof = new Px(W, H);
  const edge = new Px(W, H);
  const over = new Px(W, H);
  const ip = new Iso(poles, ox, oy);
  for (const x of [-TENT_A, TENT_A - 0.07]) ip.box(x, TENT_BACK - 0.035, x + 0.07, TENT_BACK + 0.035, 0, TENT_HIGH - 4, WOOD_BOX);
  // the cloth: hangs from the back of the roof to a little above the floor. Its stripes are the
  // dim ones (it is in the tent's own shadow, which is laid on it as a weave of dark), its hem cut in points.
  new Iso(cloth, ox, oy).left(-TENT_A + 0.07, TENT_A - 0.07, TENT_BACK, 6, TENT_HIGH - 6, (u, v, _w, h, px, py) => {
    const k = ((u % 8) + 8) % 8;
    if (h - v <= 4 && h - v <= Math.abs(k - 3.5)) return null;
    if ((px + py) % 3 === 0) return INK;
    return stripe(u, 0);
  });
  // the two front poles, under the eave
  const front = new Px(W, H);
  const ifr = new Iso(front, ox, oy);
  for (const x of [-TENT_A, TENT_A - 0.07]) ifr.box(x, TENT_EAVE - 0.1, x + 0.07, TENT_EAVE - 0.03, 0, TENT_LOW - 2, WOOD_BOX);
  // the roof: striped cloth from the back down to the eave, its stripes running with the slope
  const R = TENT_A + TENT_OUT;
  const STRIPES = 13;
  const band = (u: number, tone: 0 | 1 | 2): string => (Math.floor(u * STRIPES) % 2 === 0 ? STRIPE_A : STRIPE_B)[tone];
  const ir = new Iso(roof, ox, oy);
  const lowY = TENT_EAVE + TENT_OUT;
  const highY = TENT_BACK - TENT_OUT;
  ir.quad(ir.at(-R, lowY, TENT_LOW), ir.at(R, lowY, TENT_LOW), ir.at(R, highY, TENT_HIGH), ir.at(-R, highY, TENT_HIGH), (t, u) => band(u, t > 0.92 ? 2 : t < 0.08 ? 0 : 1));
  // its edge, hanging: scalloped along the eave, and down the side that looks to the right
  const ie = new Iso(edge, ox, oy);
  ie.left(-R, R, lowY, TENT_LOW - TENT_DROP, TENT_LOW, (u, v, w, h) => {
    const k = u % 8;
    if (v >= h - 4 && Math.min(k, 7 - k) < v - (h - 5)) return null;
    return band((u + 0.5) / w, v <= 1 ? 2 : 1);
  });
  ie.quad(ie.at(R, lowY, TENT_LOW - TENT_DROP), ie.at(R, highY, TENT_HIGH - TENT_DROP), ie.at(R, highY, TENT_HIGH), ie.at(R, lowY, TENT_LOW), (t, u) => {
    // (across this side the stripes are seen end on, as bands; the scallops are cut along its foot)
    const k = (u * 7) % 1;
    if (t < 0.45 && Math.abs(k - 0.5) > 0.5 - (0.45 - t) * 0.8) return null;
    return (Math.floor(u * 7) % 2 === 0 ? STRIPE_A : STRIPE_B)[0];
  });
  // a pennant on the back corner of the roof
  {
    const [a, b] = ir.at(R - 0.1, highY + 0.1, TENT_HIGH);
    const x = Math.round(a);
    const y = Math.round(b);
    edge.vline(x, y - 9, 9, PLUM[2]);
    edge.poly([[x + 1, y - 9], [x + 8, y - 7], [x + 1, y - 5]], PINK[2]);
  }
  // a lantern hung under the eave, alight
  const [la, lb] = ie.at(-0.95, lowY - 0.06, TENT_LOW - TENT_DROP - 1);
  const lx = Math.round(la);
  const ly = Math.round(lb);
  over.vline(lx, ly, 6, IRON[3]);
  over.rect(lx - 2, ly + 6, 5, 6, EMBER[2]);
  over.rect(lx - 1, ly + 7, 3, 4, EMBER[4]);
  over.hline(lx - 3, ly + 5, 7, IRON[2]).hline(lx - 3, ly + 12, 7, IRON[2]);
  const s = compose(null, [poles, cloth, front, roof, edge], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: lx / GRAIN, y: (ly + 9) / GRAIN, r: 13, color: EMBER[2], a: 0.4 }];
  return s;
}

// The table of wares, in front of the trader: a cloth of the mage's purple over trestles,
// hanging to the floor, a pale runner along its top; and on it flasks of three colours, a bust
// with two amulets, rings on a stand, a crystal on a foot, a wand. It runs along the grid, two and
// a half tiles long. 136 x 108; its tile's middle is at (54, 68).

function makeTentTable(): Sprite {
  const W = 136;
  const H = 108;
  const ox = 54;
  const oy = 68;
  const table = new Px(W, H);
  const wares = new Px(W, H);
  const over = new Px(W, H);
  const TA = 1.25; // half its length
  const TB0 = -0.25;
  const TB1 = 0.3;
  const TOP = 30;
  const it = new Iso(table, ox, oy);
  it.box(-TA, TB0, TA, TB1, 0, TOP, {
    top: (u, v) => (v > 0.2 && v < 0.8 && u > 0.03 && u < 0.97 ? BONE[2] : ROBE[3]),
    left: (u, v, _w, h) => (v === 0 ? ROBE[4] : v >= h - 1 ? (u % 2 === 0 ? BONE[2] : ROBE[1]) : u % 12 === 6 && v > 5 ? ROBE[0] : v < 3 ? ROBE[3] : ROBE[2]),
    right: (_u, v, _w, h) => (v >= h - 1 ? ROBE[0] : ROBE[1]),
  });
  // --- the wares, along the table from its far end to its near one ---
  const on = (x: number, y = 0.02): [number, number] => {
    const [a, b] = it.at(x, y, TOP);
    return [Math.round(a), Math.round(b)];
  };
  /** A flask: a round belly, a neck, a stopper. `at`: where it stands. */
  const flask = (at: [number, number], ramp: Ramp, big = false): void => {
    const r = big ? 5 : 4;
    const [x, y0] = at;
    const y = y0 - r + 1;
    wares.rect(x - 1, y - r - 5, 3, 5, BONE[2]);
    wares.rect(x - 1, y - r - 7, 3, 2, PLUM[2]);
    ball(wares, x + 0.5, y, r, r, ramp);
    wares.set(x - 2, y - 2, '#ffffff');
  };
  flask(on(-1.0), PINK, true);
  flask(on(-0.72, 0.1), LEAFY);
  flask(on(-0.5, -0.05), INDIGO, true);
  // a bust of dark wood with two amulets on it
  {
    const [x, y] = on(-0.08);
    lit(wares, dim(PLUM), HI, LO, (l) => {
      l.ellipse(x, y - 18, 4, 4.5, INK);
      l.poly([[x - 5, y], [x - 2, y - 14], [x + 2, y - 14], [x + 5, y]], INK);
    });
    for (let a = 0; a <= 10; a++) {
      const t = a / 10;
      wares.set(Math.round(x - 4 + 8 * t), Math.round(y - 13 + 7 * Math.sin(t * Math.PI)), GOLD[3]);
    }
    wares.rect(x - 1, y - 6, 2, 3, SPARK[2]).set(x - 1, y - 6, SPARK[4]);
  }
  // a stand of rings: a little rail along the table with four rings on it
  {
    const iw = new Iso(wares, ox, oy);
    iw.box(0.28, 0, 0.74, 0.05, TOP + 8, TOP + 10, WOOD_BOX);
    for (const x of [0.28, 0.7]) iw.box(x, 0, x + 0.04, 0.05, TOP, TOP + 8, WOOD_BOX);
    const stones = [PINK[3], SPARK[3], LEAFY[3], ROBE[4]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = iw.at(0.36 + i * 0.1, 0.06, TOP + 6);
      const rx = Math.round(a);
      const ry = Math.round(b);
      wares.set(rx, ry - 1, GOLD[3]).set(rx, ry + 1, GOLD[2]).set(rx - 1, ry, GOLD[2]).set(rx + 1, ry, GOLD[2]);
      over.set(rx, ry - 2, stones[i]);
    }
  }
  // a crystal on a foot: the mage's focus
  {
    const [x, y] = on(1.0);
    ball(wares, x + 0.5, y - 10, 5, 5, SPARK);
    wares.set(x - 2, y - 12, '#ffffff');
    wares.rect(x - 1, y - 5, 3, 2, GOLD[2]);
    wares.poly([[x - 3, y], [x - 1, y - 3], [x + 2, y - 3], [x + 4, y]], GOLD[2]);
    wares.hline(x - 3, y, 8, GOLD[0]);
  }
  // a wand lying along the front of the table
  {
    const a = on(-0.36, 0.2);
    const b = on(0.2, 0.2);
    limb(wares, a[0], a[1], b[0], b[1], 1, 1, PLUM);
    over.set(b[0] + 1, b[1], SPARK[4]).set(b[0] + 2, b[1] + 1, SPARK[3]);
  }
  return compose(null, [table, wares], over).sprite(ox, oy, GRAIN);
}

/** Green glass. */
const LEAFY: Ramp = ['#0e4a2c', '#0e4a2c', '#22b060', '#8af078', '#8af078'];

// The rug the bazaar stands on: flat on the floor, a diamond of plum with a teal border and a
// pale pattern. 160 x 80 (a diamond two and a half tiles a side); anchored at its middle.

function makeRug(): Sprite {
  const W = 160;
  const H = 80;
  const p = new Px(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // where on the rug this pixel is: (u, v) each -1..1 along its two sides
      const px = (x + 0.5 - W / 2) / (W / 2);
      const py = (y + 0.5 - H / 2) / (H / 2);
      const u = px + py;
      const v = py - px;
      const m = Math.max(Math.abs(u), Math.abs(v));
      if (m > 1) continue;
      if (m > 0.93) p.set(x, y, (Math.floor((u + v) * 20) & 1) === 0 ? BONE[2] : PLUM[1]);
      else if (m > 0.8) p.set(x, y, TEAL[2]);
      else if (m > 0.76) p.set(x, y, BONE[2]);
      else {
        // a field of plum with a lattice of small pale diamonds
        const a = Math.abs(((u * 4 + 8) % 1) - 0.5) + Math.abs(((v * 4 + 8) % 1) - 0.5);
        p.set(x, y, a < 0.12 ? BONE[2] : a < 0.2 ? TEAL[2] : Math.abs(u) < 0.3 && Math.abs(v) < 0.3 ? PLUM[1] : PLUM[2]);
      }
    }
  }
  return p.sprite(W / 2, H / 2, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// THE WORDSMITH'S RING

// The slab: a low table of the walls' stone, a great rune cut in its top and small ones along
// its front, all holding light; and now and then a word lifts off it. It stands on the grid
// (Version 14.5): its length runs up the screen to the left and down it to the right, the
// wordsmith behind it, so its runes are along the side that looks down the screen to the left.
// 68 x 76; its tile's middle is at (34, 58). Eight frames: the word forms on the slab, rises, and
// thins away.

function makeRuneSlab(theme: Theme, frame: number): Sprite {
  const W = 68;
  const H = 76;
  const ox = 34;
  const oy = 58;
  const stone = stoneOf(theme);
  const slab = new Px(W, H);
  const over = new Px(W, H);
  const iso = new Iso(slab, ox, oy);
  /** Half its length and half its depth, in tiles; the height of its feet and of its top. */
  const A = 0.6;
  const B = 0.3;
  const FEET = 13;
  const TOP = 22;
  const litSide = plainSide(theme.lit[2], theme.lit[4], theme.lit[1]);
  const shadeSide = plainSide(theme.shade[2], theme.shade[4], theme.shade[1]);
  // two feet, and the slab across them
  for (const x of [-A + 0.08, A - 0.3]) iso.box(x, -B + 0.05, x + 0.22, B - 0.05, 0, FEET, { top: () => stone[2], left: litSide, right: shadeSide });
  // the runes along its front: one of them brighter in each frame, going along. Cut face on, then set in the side.
  const lit1 = frame % 4;
  const front = new Px(40, TOP - FEET);
  const glowing = new Px(40, TOP - FEET);
  for (let i = 0; i < 4; i++) rune(front, i, 3 + i * 9, 1, i === lit1 ? SPARK[3] : TEAL[2], 7);
  rune(glowing, lit1, 3 + lit1 * 9, 1, SPARK[3], 7);
  iso.box(-A, -B, A, B, FEET, TOP, {
    top: (u, v) => (u < 0.05 || v < 0.07 || u > 0.95 || v > 0.93 ? stone[3] : stone[4]),
    left: (u, v, w, h) => front.get(u, v) ?? litSide(u, v, w, h, 0, 0),
    right: shadeSide,
  });
  new Iso(over, ox, oy).left(-A, A, B, FEET, TOP, (u, v) => glowing.get(u, v));
  // the great rune in its top, lying flat: a stroke down its length, one across, and four short ones between
  const glow = frame % 2 === 0 ? SPARK[2] : SPARK[3];
  const on = (x: number, y: number): [number, number] => {
    const [a, b] = iso.at(x, y, TOP);
    return [Math.round(a), Math.round(b)];
  };
  const strokes: ReadonlyArray<readonly [number, number, number, number]> = [
    [-0.42, 0, 0.42, 0], [0, -0.2, 0, 0.2], [-0.28, -0.16, -0.14, 0], [0.28, -0.16, 0.14, 0], [-0.28, 0.16, -0.14, 0], [0.28, 0.16, 0.14, 0],
  ];
  for (const [x0, y0, x1, y1] of strokes) {
    const a = on(x0, y0);
    const b = on(x1, y1);
    slab.line(a[0], a[1], b[0], b[1], glow);
  }
  // the word that lifts off it: forms (frames 0-1), rises (2-5), thins away (6-7)
  const f = frame % 8;
  const mid = on(0, 0);
  if (f >= 1) {
    const rise = f <= 1 ? 0 : (f - 1) * 4;
    const tone = f <= 4 ? SPARK[4] : f === 5 ? SPARK[3] : f === 6 ? SPARK[2] : SPARK[0];
    const gy = mid[1] - 16 - rise;
    if (gy >= 0) {
      rune(over, 3 + Math.floor(frame / 8), mid[0] - 2, gy, tone);
      if (f <= 5) over.set(mid[0] - 5, gy + 9, SPARK[3]).set(mid[0] + 5, gy + 7, SPARK[3]);
    }
  }
  const s = compose(null, [slab], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: mid[0] / GRAIN, y: (mid[1] - 2) / GRAIN, r: 13 + (frame % 2), color: SPARK[2], a: 0.32 }];
  return s;
}

// A standing stone: rough, taller than a man, leaning a little, with a rune cut in it that holds
// light (dim, and bright when the ring's pulse comes round to it). A stone has sides (Version
// 14.5: it was a flat shape): the one that looks down the screen to the left is in the light and
// has the rune in it, the one that looks down to the right is in shade, and they meet in an edge
// that catches the light. 40 x 88; its tile's middle is at (20, 78).

function makeRuneStone(theme: Theme, variant: number, alight: boolean): Sprite {
  const W = 40;
  const H = 88;
  const ox = 20;
  const oy = 78;
  const body = new Px(W, H);
  const over = new Px(W, H);
  const lean = [1.5, -2, 0.5, -1, 2][variant % 5];
  const tall = [62, 54, 66, 58, 50][variant % 5];
  /** Half its width along each side at the foot, in tiles. */
  const A = [0.2, 0.22, 0.18, 0.21, 0.23][variant % 5];
  const B = [0.14, 0.12, 0.15, 0.13, 0.12][variant % 5];
  /** How much of its foot's width it has at a height (0 the foot, 1 the top): broad, a shoulder, a blunt point; never quite straight. */
  const girth = (t: number): number => Math.max(0.2, 1 - 0.5 * t ** 1.6 - (t > 0.86 ? (t - 0.86) * 2.6 : 0));
  const at = (z: number): Iso => new Iso(body, ox + Math.round((lean * z) / tall), oy);
  // (built in thin courses from the foot up, each lapping over the one below so that no gap shows where it narrows)
  const STEP = 2;
  for (let z = 0; z < tall; z += STEP) {
    const k = girth(z / tall);
    const a = A * k;
    const b = B * k;
    const iso = at(z);
    const z1 = Math.min(tall, z + STEP * 2);
    iso.left(-a, a, b, z, z1, (u, _v, w, _h, px, py) => {
      // (the edge it shares with the shaded side catches the light; a darker lip at the far edge; the odd patch mottled)
      if (u >= w - 1) return theme.lit[4];
      if (u === 0) return theme.lit[1];
      return hash(px >> 2, py >> 2, variant + 3) < 0.16 ? theme.lit[3] : theme.lit[2];
    });
    iso.right(a, -b, b, z, z1, (u, _v, w, _h, px, py) => (u >= w - 1 ? theme.shade[1] : hash(px >> 2, py >> 2, variant + 5) < 0.18 ? theme.shade[3] : theme.shade[2]));
  }
  // its top: a small flat, lighter
  {
    const k = girth(1);
    at(tall).top(-A * k, -B * k, A * k, B * k, tall, () => theme.lit[4]);
  }
  // a crack down the lit side, and moss at its foot
  for (let z = 8; z < tall - 10; z++) {
    if (hash(variant, z, 4) < 0.5) {
      const [x, y] = at(z).at(A * 0.25 + Math.sin(z * 0.4) * 0.04, B * girth(z / tall), z);
      if (body.has(Math.round(x), Math.round(y))) body.set(Math.round(x), Math.round(y), theme.lit[0]);
    }
  }
  for (let i = 0; i < 14; i++) {
    const [x, y] = at(0).at(-A + (2 * A * i) / 13, B, 1 + Math.round(hash(i, variant, 7) * 2));
    if (hash(i, variant, 6) < 0.55 && body.has(Math.round(x), Math.round(y))) body.set(Math.round(x), Math.round(y), TEAL[1]);
  }
  // the rune: cut face on, then set in the lit side
  const rz = Math.round(tall * 0.66);
  const k = girth(rz / tall);
  const cut = new Px(5, 9);
  rune(cut, variant, 0, 0, alight ? SPARK[3] : TEAL[2]);
  const x0 = -2.5 / 32 - 0.01;
  const set = (onto: Px): void => {
    new Iso(onto, ox + Math.round((lean * rz) / tall), oy).left(x0, x0 + 5 / 32, B * k, rz - 9, rz, (u, v) => cut.get(u, v));
  };
  set(body);
  if (alight) set(over);
  const s = compose(null, [body], over).sprite(ox, oy, GRAIN);
  if (alight) {
    const [lx, ly] = at(rz).at(0, B * k, rz - 4.5);
    s.lights = [{ x: lx / GRAIN, y: ly / GRAIN, r: 9, color: SPARK[2], a: 0.36 }];
  }
  return s;
}

// The circle cut in the floor: two rings and eight runes between them, flat, in the light of
// what outlasts a character; a brighter arc goes round it. Its outer ring is the circle the
// standing stones stand on: the root of five tiles from the middle (game/level.ts), which the
// floor shows 101 game pixels across. 212 x 106; anchored at its middle. Eight frames.

function makeRuneRing(frame: number): Sprite {
  const W = 212;
  const H = 106;
  const p = new Px(W, H);
  const cx = W / 2;
  const cy = H / 2;
  const turn = (frame % 8) / 8;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - cx) / (W / 2);
      const dy = (y + 0.5 - cy) / (H / 2);
      const d = Math.hypot(dx, dy);
      const a = (Math.atan2(dy, dx) / (Math.PI * 2) + 1.25) % 1;
      // (how near the bright arc: it is a fifth of the way round, and leads with its bright end)
      const lead = (a - turn + 1) % 1;
      const hot = lead < 0.2;
      if (Math.abs(d - 0.96) < 0.018 || Math.abs(d - 0.74) < 0.014) p.set(x, y, hot ? SPARK[2] : TEAL[2]);
      else if (d > 0.76 && d < 0.94) {
        // eight marks between the rings: a short stroke each, with a serif
        const k = a * 8;
        const f = k - Math.floor(k);
        if (Math.abs(f - 0.5) < 0.06 && d > 0.79 && d < 0.91) p.set(x, y, hot ? SPARK[3] : TEAL[2]);
        else if (Math.abs(f - 0.5) < 0.16 && Math.abs(d - (Math.floor(k) % 2 === 0 ? 0.8 : 0.9)) < 0.012) p.set(x, y, hot ? SPARK[3] : TEAL[2]);
      } else if (d < 0.2 && (Math.abs(dx) < 0.012 || Math.abs(dy) < 0.022)) p.set(x, y, TEAL[2]);
    }
  }
  return p.sprite(cx, cy, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// THE LEXICON on its lectern: a great book open on a stand of the town's stone. Its script
// glows, a line of it brighter in each frame, as if it were being read; and light lifts off the
// pages. It stands on the grid (Version 14.5: it was a drawing of its own front): two square
// steps, a round shaft, and a desk that slopes down toward whoever reads at it, who stands down
// the screen to the left; so the book lies along the grid and its lines of script run with it.
// 64 x 90; its tile's middle is at (32, 72). Four frames.

function makeLexicon(theme: Theme, frame: number): Sprite {
  const W = 64;
  const H = 90;
  const ox = 32;
  const oy = 72;
  const stone = stoneOf(theme);
  const lectern = new Px(W, H);
  const book = new Px(W, H);
  const over = new Px(W, H);
  const iso = new Iso(lectern, ox, oy);
  const litSide = plainSide(theme.lit[2], theme.lit[4], theme.lit[1]);
  const shadeSide = plainSide(theme.shade[2], theme.shade[4], theme.shade[1]);
  const block = { top: (): string => stone[3], left: litSide, right: shadeSide };
  // the lectern: two steps, a shaft, a head
  iso.box(-0.42, -0.42, 0.42, 0.42, 0, 4, block);
  iso.box(-0.31, -0.31, 0.31, 0.31, 4, 8, block);
  const shaftFoot = oy - 8;
  const HEAD = 30;
  lit(lectern, stone, ROUND_HI, ROUND_LO, (l) => l.rect(ox - 6, oy - HEAD, 12, HEAD - 8, INK));
  lit(lectern, stone, [1, 3], [1, 4], (l) => column(l, ox, shaftFoot - 3, shaftFoot + 1, (t) => 8 + 1.5 * Math.sin(t * Math.PI)));
  lit(lectern, stone, [1, 3], [1, 4], (l) => column(l, ox, oy - HEAD - 4, oy - HEAD + 1, (t) => 11 - 4 * t));
  // the desk: a slab that slopes from its high edge at the back down to the reader's side
  const A = 0.44; // half its width
  const NEAR = 0.3; // its low edge, toward the reader
  const FAR = -0.22; // its high edge
  const LOW = HEAD + 4;
  const HIGH = HEAD + 15;
  const THICK = 3;
  const pt = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso.at(x, y, z);
    return [Math.round(a), Math.round(b)];
  };
  // (its end, the side that looks down the screen to the right: a wedge; and its lip along the low edge)
  lectern.poly([pt(A, NEAR, LOW - THICK), pt(A, NEAR, LOW), pt(A, FAR, HIGH), pt(A, FAR, HIGH - THICK - 4)], theme.shade[2]);
  iso.left(-A, A, NEAR, LOW - THICK, LOW, litSide);
  const desk = (onto: Px, shade: (t: number, u: number) => string | null): void => {
    const d = new Iso(onto, ox, oy);
    d.quad(d.at(-A, NEAR, LOW), d.at(A, NEAR, LOW), d.at(A, FAR, HIGH), d.at(-A, FAR, HIGH), shade);
  };
  desk(lectern, () => stone[3]);
  // the book: a cover of the mage's purple, two pages, the gutter between them, and lines of script, one of them alight
  /** The lines: how far up the page each is, and the words in it as [from, to] across the open book. */
  const ROWS = [0.74, 0.52, 0.3];
  const WORDS: ReadonlyArray<readonly [number, number]> = [[0.13, 0.25], [0.29, 0.44], [0.56, 0.68], [0.72, 0.87]];
  const lineAt = (t: number, u: number): number => {
    for (let i = 0; i < ROWS.length; i++) if (Math.abs(t - ROWS[i]) < 0.05 && WORDS.some(([a, b]) => u >= a && u < b)) return i;
    return -1;
  };
  const alight = (row: number, u: number): boolean => row === frame % 3 || (frame === 3 && u > 0.29 && u < 0.44);
  desk(book, (t, u) => {
    if (t < 0.06 || t > 0.95 || u < 0.05 || u > 0.95) return null;
    if (t < 0.11 || t > 0.9 || u < 0.09 || u > 0.91) return u > 0.91 || t < 0.11 ? ROBE[1] : ROBE[2];
    if (Math.abs(u - 0.5) < 0.022) return BONE[1];
    const row = lineAt(t, u);
    if (row >= 0) return alight(row, u) ? SPARK[2] : TEAL[2];
    return u < 0.5 ? BONE[3] : BONE[4];
  });
  desk(over, (t, u) => {
    const row = lineAt(t, u);
    return row >= 0 && alight(row, u) && t > 0.11 && t < 0.9 ? SPARK[3] : null;
  });
  // light lifting off the pages
  const mid = pt(0, (NEAR + FAR) / 2, (LOW + HIGH) / 2);
  const motes: ReadonlyArray<readonly [number, number, number]> = [[-11, -4, 0], [-3, -1, 2], [6, 2, 1], [13, 5, 3]];
  for (const [dx, dy, phase] of motes) {
    const step = (frame + phase) % 4;
    const x = mid[0] + dx;
    const y = mid[1] + dy - 9 - step * 2;
    over.set(x, y, step < 2 ? SPARK[4] : SPARK[3]);
    if (step > 0) over.set(x, y + 2, SPARK[2]);
  }
  const s = compose(null, [lectern, book], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: mid[0] / GRAIN, y: (mid[1] - 2) / GRAIN, r: 13 + (frame % 2), color: SPARK[2], a: 0.3 }];
  return s;
}

// ---------------------------------------------------------------------------------------------
// THE STASH: a long trunk of dark wood bound in iron, with a stone in its lock of the colour of
// what outlasts a character. (A chest is treasure, and gold; this is a strongbox, and iron.) It is
// built on the grid as the chest is (art/props.ts, `trunk`), longer and lower. 68 x 62; its tile's
// middle is at (34, 44).

const STASH: TrunkLook = { a: 0.56, b: 0.29, rim: 15, rise: 8, wood: dim(PLUM), lid: PLUM, metal: IRON, stone: TEAL, planks: [5, 10] };

function makeStash(): Sprite {
  return trunk(68, 62, 34, 44, STASH, false).sprite(34, 44, GRAIN);
}

// ---------------------------------------------------------------------------------------------

/** The town's own things, by the names the game knows them by. */
export interface TownProps {
  /** The smithy: the forge (four frames: its fire), the anvil, the rack of arms, the trough. */
  forge: Sprite[];
  anvil: Sprite;
  rack: Sprite;
  trough: Sprite;
  /** The bazaar: the tent's back and its front (the table of wares), and the rug they stand on (flat). */
  tentBack: Sprite;
  tentTable: Sprite;
  rug: Sprite;
  /** The wordsmith's ring: the slab (eight frames), the standing stones (five, each dim and alight), the circle in the floor (flat, eight frames). */
  runeSlab: Sprite[];
  runeStone: { dim: Sprite; alight: Sprite }[];
  runeRing: Sprite[];
  /** The Lexicon: four frames (the script being read, the light lifting off it). */
  lexicon: Sprite[];
  stash: Sprite;
  /** THE RING MADE NEW, BIG AND WILD (art/ring3.ts): painted only with the wordsmith on bones switched on (art/smith3.ts, SMITH3). */
  ring3?: Ring3Art;
}

export function makeTownProps(theme: Theme = VAULT): TownProps {
  return {
    forge: [0, 1, 2, 3].map((f) => makeForge(theme, f)),
    anvil: makeAnvil(),
    rack: makeRack(),
    trough: makeTrough(),
    tentBack: makeTentBack(),
    tentTable: makeTentTable(),
    rug: makeRug(),
    runeSlab: [0, 1, 2, 3, 4, 5, 6, 7].map((f) => makeRuneSlab(theme, f)),
    runeStone: [0, 1, 2, 3, 4].map((v) => ({ dim: makeRuneStone(theme, v, false), alight: makeRuneStone(theme, v, true) })),
    runeRing: [0, 1, 2, 3, 4, 5, 6, 7].map(makeRuneRing),
    lexicon: [0, 1, 2, 3].map((f) => makeLexicon(theme, f)),
    stash: makeStash(),
    ...(SMITH3.on ? { ring3: makeRing3(theme) } : {}),
  };
}
