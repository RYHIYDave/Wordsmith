// THE ISLE OF STONES' OWN STALLS (the queue chat, 14 Nov 2026), for its own people (dev/sculpt_isle_folk.ts). His word, asked
// whether the isle's armourer, mystic and stranger should have new looks that fit the isle and their stalls redone to match,
// the wordsmith the same in every town: “Yes, that (Recommended)”.
//
// Each stands where the town's own does and is the same size, so that the people stand at them as they stand at the town's
// (art/town.ts: the forge, the anvil, the rack, the trough; the tent's back, its table, its rug); and the stranger, who leans on
// the town's wall, has a stone of his own to lean on, as there is no wall on the isle:
//   THE FORGE      a beehive of piled fieldstones, its mouth to the anvil with the fire in it, a short stack of stones for a
//                  chimney, blocks of peat stacked beside it
//   THE ANVIL      on a block of rough stone
//   THE RACK       of grey driftwood: a bearded axe, a spear, a sword, a round shield of planks with an iron rim
//   THE TROUGH     a boulder hollowed out, dark water in it, a blade cooling
//   THE SHELTER    the seer's: hides stitched together over poles of whalebone, a roof of hides sloping to the eave, its edge
//                  a fringe of hide; charms of bone and shell hung along it; a lamp of stone alight under it
//   THE TABLE      a slab of stone on two standing stones; on it shells, bone charms, bottles of sea-green glass, a bundle of
//                  dried herbs, a carving of bone, and a sea-stone on a little cairn, its rune the friend's cyan
//   THE PELT       a seal's, grey and spotted, flat on the turf where the seer stands
//   HIS STONE      the stranger's: a broad slab, a fishing net hung over it
// Painted at the heroes' grain (two picture pixels to a game pixel), light from the upper left, as everything in the game.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Iso } from './isokit';
import type { SideShader } from './isokit';
import { GRAIN, ball, compose, hash, limb } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER, tongue } from './props';

// ---------------------------------------------------------------------------------------------------------------------------
// THE ISLE'S STUFFS

/** Its grey-blue granite (the standing stones'). */
const GRANITE = ['#101220', '#1a1c2e', '#24283e', '#2e3450', '#3c4266', '#4e5680', '#646e98', '#8088ac'];
/** Fieldstone, warmer and greyer, for what is piled by hand. */
const FIELD = ['#141418', '#24242a', '#36363e', '#4a4a54', '#62626c', '#7c7c86', '#9a9aa2'];
/** Driftwood: grey, bleached. */
const DRIFT: Ramp = ['#24221e', '#46423a', '#6a6458', '#928a7a', '#b8b0a0'];
/** Hides, two of them: a brown, a greyer sealskin. */
const HIDE_A: Ramp = ['#2a2018', '#4a3a2a', '#6a563e', '#8c7656', '#ae9a74'];
const HIDE_B: Ramp = ['#262420', '#46423a', '#6a6456', '#8e8878', '#b4ae9e'];
/** Bone and shell. */
const BONE_I: Ramp = ['#4a4438', '#7a7262', '#aea48e', '#d6ceb6', '#f2ecd8'];
/** Iron: grey (the isle's people's). */
const IRON_I: Ramp = ['#18181f', '#32323c', '#565662', '#848490', '#b6b6c0'];
/** Sea-green glass. */
const GLASS: Ramp = ['#0a2a22', '#14463a', '#227060', '#46a48a', '#a8e8d0'];
/** The friend's cyan: the rune in the sea-stone. */
const CYAN: Ramp = ['#0c6a80', '#18a0b4', '#22d0e0', '#b8fff8', '#ffffff'];
/** Peat: near black, brown. */
const PEAT: Ramp = ['#140c08', '#24160e', '#3a2618', '#523622', '#6a4a30'];
/** Rope and net. */
const ROPE: Ramp = ['#2a2014', '#4a3a24', '#6e5a38', '#94804e', '#b8a46a'];
const INKY = '#0e0c18';

/** Something built on the grid in a stuff of five tones: its top lit, its side to the left lit, its side to the right in shade. */
const boxOf = (r: Ramp): { top: () => string; left: SideShader; right: SideShader } => ({
  top: () => r[3],
  left: (_u, v, _w, h) => (v === 0 ? r[4] : v >= h - 1 ? r[1] : r[2]),
  right: (_u, v, _w, h) => (v === 0 ? r[3] : v >= h - 1 ? r[0] : r[1]),
});
/** Rough stone on a side: blocks with a joint between, the odd one a tone off, a chip here and there. */
const roughSide = (r: readonly string[], lo: number, seed: number): SideShader => (u, v, _w, h) => {
  const c = Math.floor(v / 7);
  const k = Math.floor((u + (c % 2) * 5) / 10);
  if (v > 0 && v % 7 === 0) return r[lo - 1];
  if ((u + (c % 2) * 5) % 10 === 0 && u > 0) return r[lo - 1];
  if (v === 0) return r[lo + 2];
  if (v >= h - 1) return r[lo - 1];
  const n = hash(c, k, seed);
  return r[lo + (n < 0.25 ? -1 : n > 0.8 ? 1 : 0) + (v % 7 === 1 ? 1 : 0)];
};

// ---------------------------------------------------------------------------------------------------------------------------
// THE FORGE: a beehive of piled fieldstones. 96 x 156; its tile's middle at (48, 132). Four frames: its fire.

const FIRE: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  [[0, 13, 4.6, 2], [-5, 8, 3, -1], [5, 7, 2.4, 1]],
  [[1, 12, 4.4, -2], [5, 9, 2.8, 2], [-5, 6, 2.2, -1]],
  [[0, 14, 4.6, -3], [-4, 8, 2.6, -2], [5, 8, 2.4, 1]],
  [[-1, 11, 4.4, 1], [-5, 9, 2.8, -1], [4, 7, 2.2, 2]],
];

/** The beehive's half-width at height z, in picture pixels (round: the same from every side). */
const HIVE = { r: 31, tall: 46, top: 0.3 };
const hiveR = (z: number): number => HIVE.r * (1 - (1 - HIVE.top) * Math.pow(Math.max(0, z) / HIVE.tall, 1.7));

export function isleForge(frame: number): Sprite {
  const W = 96;
  const H = 156;
  const ox = 48;
  const oy = 132;
  const hive = new Px(W, H);
  const fire = new Px(W, H);
  const peat = new Px(W, H);
  const over = new Px(W, H);
  const mouth = new Set<number>();
  let bed: [number, number] = [ox, oy];
  /** Its mouth, to the anvil (down the screen to the left): where on the hive it is, by the angle round it and the height. */
  const MOUTH_A = 2.2;
  const inMouth = (a: number, z: number): boolean => {
    const d = Math.abs(a - MOUTH_A);
    return d < 0.42 && z < 13 + 9 * Math.cos((d / 0.42) * (Math.PI / 2));
  };
  /** Paint a round thing of piled stone: its back half, then its front, a row of its height at a time. */
  const round = (dst: Px, z0: number, z1: number, rAt: (z: number) => number, cx: number, cy: number, seed: number, withMouth: boolean): void => {
    for (const side of [-1, 1]) {
      for (let z = z0; z <= z1; z += 0.5) {
        const r = rAt(z);
        for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
          const c = Math.max(-1, Math.min(1, (dx + 0.5) / r));
          if (Math.abs((dx + 0.5) / r) > 1) continue;
          const sn = side * Math.sqrt(1 - c * c);
          const x = cx + dx;
          const y = Math.round(cy - z + 0.5 * r * sn);
          const a = Math.atan2(sn, c);
          // (the courses: each a stone's height; each stone its own length round; joints dark, each stone's top lit)
          // (piled by hand: no two courses the same height, no two stones the same length, each a little proud or sunk)
          const jog = 2.2 * hash(Math.floor(a * 4), 0, seed);
          const course = Math.floor((z + jog) / 6.5);
          const around = (a + Math.PI) * r + course * 5.3 + 3 * hash(course, 2, seed);
          const len = 7 + Math.floor(hash(course, 1, seed) * 7);
          const k = Math.floor(around / len);
          const inCourse = (z + jog) - course * 6.5;
          const lit = 0.42 - 0.4 * c + 0.12 * (z / HIVE.tall) - (side < 0 ? 0.2 : 0);
          let t = Math.max(1, Math.min(4, Math.round(0.6 + lit * 3.4 + (hash(k, course, seed + 3) - 0.5) * 1.6)));
          if (inCourse > 5.0 && hash(k, course, seed + 4) > 0.3) t = Math.min(5, t + 1);
          let col = FIELD[t];
          if (inCourse < 0.9 || around - k * len < 0.9) col = FIELD[0];
          if (withMouth && side > 0 && inMouth(a, z)) {
            mouth.add(y * W + x);
            // (inside: the dark of the hearth, coals along its floor)
            if (z < 3.5) {
              const n = hash(dx, frame, 3 + Math.round(z * 2));
              col = n < 0.3 ? EMBER[2] : n < 0.5 ? EMBER[1] : COAL[3];
              if (Math.abs(a - MOUTH_A) < 0.06 && z < 1) bed = [x, y];
            } else col = z < 5.5 && hash(dx, frame, 9) < 0.5 ? COAL[2] : COAL[0];
          } else if (withMouth && side > 0) {
            // (the stones round the mouth are warm with it)
            const d = Math.abs(a - MOUTH_A);
            const zTop = 13 + 9 * Math.cos((Math.min(1, d / 0.42)) * (Math.PI / 2));
            if (d < 0.52 && z < zTop + 3) col = t >= 4 ? EMBER[1] : EMBER[0];
          }
          dst.set(x, y, col);
        }
      }
    }
  };
  // the hive, and its chimney: a short round stack of stones over the hole in its top
  round(hive, 0, HIVE.tall, hiveR, ox, oy, 11, true);
  const CH = 18;
  round(hive, HIVE.tall - 3, HIVE.tall + CH, (z) => 7.4 - 0.08 * (z - HIVE.tall), ox + 1, oy, 17, false);
  // (the dark of the flue in its top)
  hive.ellipse(ox + 1, oy - HIVE.tall - CH, 4.6, 2.0, INKY);
  // the fire: tongues from the bed of coals, nothing of them outside the mouth
  for (const [dx, h, w, lean] of FIRE[frame % FIRE.length]) tongue(fire, bed[0] + dx, bed[1] - 1 + Math.round(dx / 3), h, w, lean, EMBER);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fire.has(x, y) && !mouth.has(y * W + x)) fire.erase(x, y);
  // the peat, stacked beside it to the right: blocks on the grid
  const ip = new Iso(peat, ox, oy);
  const P = boxOf(PEAT);
  for (const [x, y, z] of [[0.52, 0.06, 0], [0.52, 0.3, 0], [0.52, 0.18, 7], [0.74, 0.12, 0]] as const) ip.box(x, y - 0.1, x + 0.2, y + 0.1, z, z + 7, P);
  // smoke, a wisp or two out of the stack
  const wisps: ReadonlyArray<readonly [number, number]> = [[0, -6], [2, -11], [-1, -15], [3, -9]];
  for (let i = 0; i < 2; i++) {
    const [sx, sy] = wisps[(frame + i) % wisps.length];
    over.set(ox + 1 + sx, oy - HIVE.tall - CH + sy, i ? '#5a5a66' : '#6e6e7a');
  }
  over.set(bed[0] - 4, bed[1] - 16 - (frame % 2) * 3, EMBER[3]);
  const s = compose(null, [hive, peat, fire], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: bed[0] / GRAIN, y: (bed[1] - 7) / GRAIN, r: 17 + (frame % 2), color: EMBER[2], a: 0.5 }];
  return s;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE ANVIL, on a block of rough stone. 56 x 60; its tile's middle at (28, 46).

export function isleAnvil(): Sprite {
  const W = 56;
  const H = 60;
  const ox = 28;
  const oy = 46;
  const block = new Px(W, H);
  const iron = new Px(W, H);
  const ib = new Iso(block, ox, oy);
  const TOP = 14;
  ib.box(-0.26, -0.18, 0.26, 0.18, 0, TOP, {
    top: (u, v) => (hash(Math.round(u * 9), Math.round(v * 6), 5) > 0.8 ? FIELD[4] : FIELD[5]),
    left: roughSide(FIELD, 3, 6),
    right: roughSide(FIELD, 2, 7),
  });
  const iso = new Iso(iron, ox, oy);
  const IB = { top: (): string => IRON_I[3], left: (_u: number, v: number, _w: number, h: number): string => (v === 0 ? IRON_I[3] : v >= h - 1 ? IRON_I[1] : IRON_I[2]), right: (_u: number, v: number, _w: number, h: number): string => (v === 0 ? IRON_I[2] : v >= h - 1 ? IRON_I[0] : IRON_I[1]) };
  const L0 = -0.3;
  const L1 = 0.3;
  const HW = 0.1;
  const FACE = TOP + 16;
  iso.box(-0.24, -0.12, 0.24, 0.12, TOP, TOP + 3, IB);
  iso.box(-0.12, -0.075, 0.12, 0.075, TOP + 3, TOP + 9, IB);
  iso.box(L0, -HW, L1, HW, TOP + 9, FACE, { top: () => IRON_I[4], left: IB.left, right: IB.right });
  const pt = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso.at(x, y, z);
    return [Math.round(a), Math.round(b)];
  };
  const tip = pt(L0 - 0.3, 0, FACE - 1);
  iron.poly([pt(L0, HW, FACE), tip, pt(L0, HW, TOP + 10)], IRON_I[2]);
  iron.poly([pt(L0, -HW, FACE), tip, pt(L0, HW, FACE)], IRON_I[3]);
  const e0 = pt(L0, HW, FACE);
  const e1 = pt(L1, HW, FACE);
  iron.line(e0[0], e0[1], e1[0] - 1, e1[1] - 1, '#ffffff');
  return compose(null, [block, iron], null).sprite(ox, oy, GRAIN);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE RACK, of driftwood. 62 x 92; its tile's middle at (22, 80) (the town's rack's place and size).

export function isleRack(): Sprite {
  const W = 62;
  const H = 92;
  const ox = 22;
  const oy = 80;
  const frame = new Px(W, H);
  const arms = new Px(W, H);
  const front = new Px(W, H);
  const iso = new Iso(frame, ox, oy);
  const Y = -0.34;
  const X0 = -0.72;
  const X1 = 0.72;
  const TALL = 56;
  const D = boxOf(DRIFT);
  // (driftwood: its grain a darker line along it here and there; the posts not quite straight)
  const grain: SideShader = (u, v, w, h) => (v === 0 ? DRIFT[4] : v >= h - 1 ? DRIFT[1] : (u + Math.floor(v / 9)) % 3 === 0 ? DRIFT[1] : DRIFT[2]);
  for (const x of [X0, X1 - 0.08]) iso.box(x - 0.02, Y - 0.1, x + 0.1, Y + 0.18, 0, 4, D);
  for (const z of [16, 44]) iso.box(X0 - 0.05, Y - 0.025, X1 + 0.05, Y + 0.025, z, z + 4, { top: D.top, left: grain, right: D.right });
  for (const x of [X0, X1 - 0.08]) iso.box(x, Y - 0.04, x + 0.08, Y + 0.04, 4, TALL + (x < 0 ? 3 : -1), { top: D.top, left: grain, right: D.right });
  // what hangs on it, painted face on, then set in its plane
  const FW = 46;
  const FH = 62;
  const flat = new Px(FW, FH);
  const boss = new Px(FW, FH);
  // a spear, its point up
  for (let y = 0; y < 52; y++) flat.set(6, 4 + y, y < 9 ? IRON_I[3 - (y % 2)] : DRIFT[y % 5 === 0 ? 1 : 3]);
  flat.set(5, 6, IRON_I[3]).set(7, 6, IRON_I[2]).set(5, 7, IRON_I[2]).set(7, 7, IRON_I[1]);
  // a bearded axe, its head hooked down
  for (let y = 0; y < 40; y++) flat.set(15, 10 + y, DRIFT[(y + 1) % 6 === 0 ? 1 : 3]);
  flat.poly([[16, 10], [23, 9], [24, 15], [21, 20], [19, 16], [16, 15]], IRON_I[2]);
  flat.line(23, 9, 24, 15, IRON_I[4]);
  flat.line(16, 10, 23, 9, IRON_I[3]);
  // a sword, point down
  flat.rect(30, 2, 2, 2, IRON_I[3]);
  flat.rect(30, 4, 2, 6, ROPE[2]);
  flat.rect(26, 10, 10, 2, IRON_I[2]);
  for (let y = 0; y < 34; y++) {
    const hw = y > 30 ? (34 - y) / 2 : 2;
    for (let i = -Math.ceil(hw); i < Math.ceil(hw); i++) flat.set(31 + i, 12 + y, i < 0 ? IRON_I[4] : IRON_I[3]);
  }
  // a round shield of planks hung on the lower rail: a ring of sea-green paint, an iron rim and boss
  ball(boss, 22, 44, 8, 9.5, DRIFT);
  for (let y = 34; y <= 54; y++) for (let x = 13; x <= 31; x++) {
    if (!boss.has(x, y)) continue;
    const d = ((x + 0.5 - 22) / 8) ** 2 + ((y + 0.5 - 44) / 9.5) ** 2;
    if (d > 0.78) boss.set(x, y, x < 22 ? IRON_I[3] : IRON_I[2]);
    else if (d > 0.4 && d < 0.58) boss.set(x, y, x < 22 ? GLASS[3] : GLASS[2]);
    else if ((x - 13) % 4 === 0) boss.set(x, y, DRIFT[1]);
  }
  ball(boss, 22, 44, 2.4, 3, IRON_I);
  boss.set(21, 43, IRON_I[4]);
  const hang = (onto: Px, what: Px): void => {
    new Iso(onto, ox, oy).left(X0 + 0.02, X0 + 0.02 + FW / 32, Y + 0.05, 0, FH, (u, v) => what.get(u, v));
  };
  hang(arms, flat);
  hang(front, boss);
  return compose(null, [frame, arms, front], null).sprite(ox, oy, GRAIN);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE TROUGH: a boulder hollowed out. 48 x 36; it stands at (24, 30).

export function isleTrough(): Sprite {
  const W = 48;
  const H = 36;
  const cx = 24;
  const foot = 30;
  const rock = new Px(W, H);
  const over = new Px(W, H);
  // (round, lumpy: a squat boulder, lit on its left, its rim the palest)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - cx) / 19;
      const top = 14 + Math.round(2 * hash(Math.floor(x / 4), 0, 21));
      if (y < top - 4.5 * Math.sqrt(Math.max(0, 1 - dx * dx)) || y > foot - 1 + 3 * Math.sqrt(Math.max(0, 1 - dx * dx)) - 3) continue;
      if (Math.abs(dx) > 1 - 0.08 * hash(0, y, 22)) continue;
      const k = 0.55 - 0.4 * dx - (y - top) / 40;
      const n = hash(Math.floor(x / 3), Math.floor(y / 3), 23);
      rock.set(x, y, FIELD[Math.max(1, Math.min(5, Math.round(1 + k * 4 + (n - 0.5) * 1.2)))]);
    }
  // its hollow, full of dark water, seen from a little above
  rock.ellipse(cx, 14, 17, 4.2, FIELD[5]);
  rock.ellipse(cx, 14.4, 15, 3.2, '#0a1424');
  rock.hline(cx - 8, 13, 6, '#22344e').hline(cx + 4, 15, 4, '#22344e');
  // what is cooling in it
  over.rect(cx + 6, 3, 2, 10, IRON_I[2]).vline(cx + 6, 3, 10, IRON_I[4]);
  over.rect(cx + 4, 2, 6, 2, DRIFT[2]);
  return compose(null, [rock], over).sprite(cx, foot, GRAIN);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SEER'S SHELTER: hides over whalebone. Where the town's tent stands and as big: 168 x 208; its tile's middle at (96, 164).

const TENT_A = 1.4;
const TENT_BACK = -0.3;
const TENT_EAVE = 1.15;
const TENT_HIGH = 112;
const TENT_LOW = 94;
const TENT_OUT = 0.15;
const TENT_DROP = 8;

/** Hides stitched together: which hide a point of a sheet (u, v in pixels) is on, and its colour at a tone. */
function hideAt(u: number, v: number, tone: number, seed: number): string {
  const row = Math.floor(v / 26);
  const col = Math.floor((u + (row % 2) * 11) / 24);
  const r = hash(col, row, seed) > 0.5 ? HIDE_A : HIDE_B;
  // (the stitches along each seam, a pale one every other pixel)
  const su = (u + (row % 2) * 11) % 24;
  const sv = v % 26;
  if (su === 0 || sv === 0) return (u + v) % 2 === 0 ? BONE_I[1] : r[Math.max(0, tone - 1)];
  // (the hide's own mottle)
  const m = hash(Math.floor(u / 6), Math.floor(v / 5), seed + 1);
  const scar = hash(u, v, seed + 2) > 0.985;
  return r[Math.max(0, Math.min(4, tone + (scar ? -1 : m > 0.9 ? 1 : 0)))];
}

export function isleShelterBack(): Sprite {
  const W = 168;
  const H = 208;
  const ox = 96;
  const oy = 164;
  const poles = new Px(W, H);
  const cloth = new Px(W, H);
  const front = new Px(W, H);
  const roof = new Px(W, H);
  const edge = new Px(W, H);
  const over = new Px(W, H);
  const BONEBOX = boxOf(BONE_I);
  const ip = new Iso(poles, ox, oy);
  for (const x of [-TENT_A, TENT_A - 0.07]) ip.box(x, TENT_BACK - 0.035, x + 0.07, TENT_BACK + 0.035, 0, TENT_HIGH - 4, BONEBOX);
  // the back: hides hung from the roof's back to near the floor, its foot ragged
  new Iso(cloth, ox, oy).left(-TENT_A + 0.07, TENT_A - 0.07, TENT_BACK, 4, TENT_HIGH - 6, (u, v, _w, h) => {
    if (h - v <= 3 && hash(u, 0, 31) < 0.5) return null;
    return hideAt(u, v, 1, 30);
  });
  const ifr = new Iso(front, ox, oy);
  for (const x of [-TENT_A, TENT_A - 0.07]) ifr.box(x, TENT_EAVE - 0.1, x + 0.07, TENT_EAVE - 0.03, 0, TENT_LOW - 2, BONEBOX);
  // the roof: hides from the back down to the eave
  const R = TENT_A + TENT_OUT;
  const ir = new Iso(roof, ox, oy);
  const lowY = TENT_EAVE + TENT_OUT;
  const highY = TENT_BACK - TENT_OUT;
  ir.quad(ir.at(-R, lowY, TENT_LOW), ir.at(R, lowY, TENT_LOW), ir.at(R, highY, TENT_HIGH), ir.at(-R, highY, TENT_HIGH), (t, u) => hideAt(Math.round(u * 120), Math.round(t * 70), t > 0.9 ? 3 : 2, 32));
  // its edge hanging along the eave: a fringe of hide strips; and down the side to the right, in shade
  const ie = new Iso(edge, ox, oy);
  ie.left(-R, R, lowY, TENT_LOW - TENT_DROP, TENT_LOW, (u, v, _w, h) => {
    if (v >= h - 5 && u % 3 === 2) return null;
    if (v >= h - 5 && hash(u, 1, 33) < 0.3 && v >= h - 2) return null;
    return hideAt(u, v + 60, v <= 1 ? 3 : 2, 34);
  });
  ie.quad(ie.at(R, lowY, TENT_LOW - TENT_DROP), ie.at(R, highY, TENT_HIGH - TENT_DROP), ie.at(R, highY, TENT_HIGH), ie.at(R, lowY, TENT_LOW), (t, u) => {
    if (t < 0.4 && Math.round(u * 40) % 3 === 2) return null;
    return hideAt(Math.round(u * 40), Math.round(t * 8), 1, 35);
  });
  // charms hung along the eave: cords with a bone or a shell at each end
  for (const [k, long, shell] of [[-1.0, 10, false], [-0.4, 14, true], [0.35, 9, false], [0.95, 12, true]] as const) {
    const [a, b] = ie.at(k, lowY - 0.02, TENT_LOW - TENT_DROP + 1);
    const x = Math.round(a);
    const y = Math.round(b);
    over.vline(x, y, long, ROPE[2]);
    if (shell) over.rect(x - 1, y + long, 3, 2, BONE_I[3]).set(x, y + long + 2, BONE_I[2]);
    else over.vline(x, y + long, 4, BONE_I[3]).set(x + 1, y + long + 3, BONE_I[2]);
  }
  // a cord of charms from the back corner of the roof
  {
    const [a, b] = ir.at(R - 0.1, highY + 0.1, TENT_HIGH);
    const x = Math.round(a);
    const y = Math.round(b);
    edge.vline(x, y - 10, 10, BONE_I[2]);
    edge.set(x - 1, y - 10, BONE_I[3]).set(x + 1, y - 10, BONE_I[3]).set(x - 2, y - 11, BONE_I[3]).set(x + 2, y - 11, BONE_I[3]);
  }
  // a lamp of stone hung under the eave, alight
  const [la, lb] = ie.at(-0.7, lowY - 0.06, TENT_LOW - TENT_DROP - 1);
  const lx = Math.round(la);
  const ly = Math.round(lb);
  over.vline(lx, ly, 7, ROPE[2]);
  over.rect(lx - 3, ly + 8, 7, 3, FIELD[4]).hline(lx - 3, ly + 8, 7, FIELD[5]).hline(lx - 2, ly + 11, 5, FIELD[2]);
  over.set(lx, ly + 7, EMBER[3]).set(lx, ly + 6, EMBER[4]).set(lx + 1, ly + 7, EMBER[2]);
  const s = compose(null, [poles, cloth, front, roof, edge], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: lx / GRAIN, y: (ly + 6) / GRAIN, r: 13, color: EMBER[2], a: 0.4 }];
  return s;
}

// THE TABLE: a slab of stone on two standing stones, the seer's wares on it. 136 x 108; its tile's middle at (54, 68).

export function isleShelterTable(): Sprite {
  const W = 136;
  const H = 108;
  const ox = 54;
  const oy = 68;
  const table = new Px(W, H);
  const wares = new Px(W, H);
  const over = new Px(W, H);
  const TA = 1.25;
  const TB0 = -0.25;
  const TB1 = 0.3;
  const TOP = 28;
  const SLAB = 6;
  const it = new Iso(table, ox, oy);
  // the two standing stones under it, and the slab across them
  for (const x0 of [-1.12, 0.78]) it.box(x0, TB0 + 0.08, x0 + 0.34, TB1 - 0.08, 0, TOP - SLAB, { top: () => GRANITE[4], left: roughSide(GRANITE, 4, 40 + Math.round(x0)), right: roughSide(GRANITE, 2, 41) });
  it.box(-TA, TB0, TA, TB1, TOP - SLAB, TOP, {
    top: (u, v) => {
      const n = hash(Math.round(u * 40), Math.round(v * 9), 42);
      return n > 0.9 ? GRANITE[4] : n < 0.06 ? GRANITE[6] : u < 0.02 || v > 0.96 ? GRANITE[6] : GRANITE[5];
    },
    left: (u, v, _w, h) => (v === 0 ? GRANITE[6] : v >= h - 1 ? GRANITE[2] : hash(u, v, 43) > 0.86 ? GRANITE[3] : GRANITE[4]),
    right: (_u, v, _w, h) => (v === 0 ? GRANITE[4] : v >= h - 1 ? GRANITE[1] : GRANITE[2]),
  });
  const on = (x: number, y = 0.02): [number, number] => {
    const [a, b] = it.at(x, y, TOP);
    return [Math.round(a), Math.round(b)];
  };
  // shells, a little heap of them at the far end
  for (const [x, y] of [[-1.08, -0.05], [-0.98, 0.12], [-0.9, -0.1], [-1.02, 0.02]] as const) {
    const [a, b] = on(x, y);
    wares.rect(a - 2, b - 2, 4, 2, BONE_I[3]).hline(a - 1, b - 3, 2, BONE_I[4]).set(a - 2, b - 1, BONE_I[2]).set(a + 1, b - 1, BONE_I[1]);
  }
  // three bottles of sea-green glass, corked
  for (const [x, y, big] of [[-0.7, 0.0, true], [-0.52, 0.14, false], [-0.4, -0.08, true]] as const) {
    const [a, b] = on(x, y);
    const r = big ? 4 : 3;
    const yy = b - r + 1;
    wares.rect(a - 1, yy - r - 4, 3, 4, GLASS[2]);
    wares.rect(a - 1, yy - r - 6, 3, 2, DRIFT[2]);
    ball(wares, a + 0.5, yy, r, r, GLASS);
    wares.set(a - 1, yy - 2, GLASS[4]);
  }
  // a bundle of dried herbs, tied, lying across
  {
    const a = on(-0.18, 0.18);
    const b = on(0.12, 0.18);
    limb(wares, a[0], a[1] - 2, b[0], b[1] - 2, 2, 1, ['#1e2416', '#2e3a20', '#4a5a30', '#6a7a42', '#8a9a58']);
    wares.vline(Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2) - 4, 4, ROPE[3]);
  }
  // charms of bone laid out: three in a row
  for (const k of [0.2, 0.3, 0.4]) {
    const [a, b] = on(k, -0.06);
    wares.vline(a, b - 6, 5, BONE_I[3]).set(a - 1, b - 6, BONE_I[4]).set(a + 1, b - 2, BONE_I[2]);
    wares.vline(a, b - 9, 3, ROPE[2]);
  }
  // a carving of bone: a fish
  {
    const [a, b] = on(0.6, 0.12);
    wares.hline(a - 4, b - 2, 7, BONE_I[3]).hline(a - 3, b - 3, 5, BONE_I[4]).hline(a - 3, b - 1, 5, BONE_I[2]);
    wares.set(a + 3, b - 3, BONE_I[3]).set(a + 3, b - 1, BONE_I[3]).set(a - 3, b - 2, INKY);
  }
  // a sea-stone on a little cairn, its rune the friend's cyan
  {
    const [a, b] = on(1.0);
    ball(wares, a, b - 2, 4, 2.5, FIELD.slice(2, 7) as unknown as Ramp);
    ball(wares, a + 0.5, b - 7, 3, 2, FIELD.slice(1, 6) as unknown as Ramp);
    ball(wares, a + 0.5, b - 13, 4.5, 4.5, ['#2a3a3a', '#46605c', '#6c8a84', '#9ab4ac', '#c8dcd4']);
    over.vline(a, b - 16, 6, CYAN[2]).hline(a - 1, b - 14, 3, CYAN[3]).set(a, b - 16, CYAN[4]);
  }
  const s = compose(null, [table, wares], over).sprite(ox, oy, GRAIN);
  const [ca, cb] = on(1.0);
  s.lights = [{ x: ca / GRAIN, y: (cb - 13) / GRAIN, r: 9, color: CYAN[2], a: 0.35 }];
  return s;
}

// THE PELT: a seal's, flat on the turf where the seer stands. 150 x 76; anchored at its middle.

export function islePelt(): Sprite {
  const W = 150;
  const H = 76;
  const p = new Px(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      // (along the grid: its length runs down the screen to the right; where on it this pixel is)
      const px = (x + 0.5 - W / 2) / (W / 2);
      const py = (y + 0.5 - H / 2) / (H / 2);
      const along = (px + py) / 2;
      const across = (py - px) / 2;
      const body = (along / 0.92) ** 2 + (across / (0.42 - 0.12 * Math.max(0, along))) ** 2;
      // (its flippers spread at the sides near its foot, its tail split)
      const flip = Math.abs(along + 0.45) < 0.12 && Math.abs(across) < 0.62;
      const tail = along > 0.85 && along < 1.0 && Math.abs(Math.abs(across) - 0.1) < 0.08;
      if (body > 1 && !flip && !tail) continue;
      // (its fur: grey, darker down its middle and at its edge; a few dark spots; a lit fleck here and there)
      const edge = body > 0.86 && !flip;
      const spot = hash(Math.floor(x / 7), Math.floor(y / 4), 51) > 0.86 && body < 0.7;
      const fleck = hash(x, y, 52) > 0.93;
      const mid = Math.abs(across) < 0.08;
      p.set(x, y, edge || flip || tail ? HIDE_B[1] : spot || mid ? HIDE_B[1] : fleck ? HIDE_B[3] : HIDE_B[2]);
    }
  return p.sprite(W / 2, H / 2, GRAIN);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE STRANGER'S STONE: a broad slab to lean on, a net hung over it. Built on the grid: its face to him looks down the screen to
// the right. Anchored at the middle of its foot. 92 x 168.

export function strangerStone(): { s: Sprite; behind: number } {
  const W = 92;
  const H = 168;
  const ox = 46;
  const oy = 132;
  const slab = new Px(W, H);
  const net = new Px(W, H);
  const iso = new Iso(slab, ox, oy);
  const X0 = -0.14;
  const X1 = 0.14;
  const Y0 = -0.72;
  const Y1 = 0.72;
  const TALL = 104;
  // (a broad slab: its top weathered round at the corners; its face toward him in shade, the other lit)
  const top = (u: number, v: number): string | null => (hash(Math.round(u * 6), Math.round(v * 20), 61) > 0.85 ? '#3c4830' : GRANITE[6]);
  iso.box(X0, Y0, X1, Y1, 0, TALL, {
    top,
    left: (u, v, _w, h) => (v === 0 ? GRANITE[6] : v >= h - 1 ? GRANITE[2] : hash(Math.floor(u / 3), Math.floor(v / 4), 62) > 0.88 ? GRANITE[3] : v < h * 0.3 ? GRANITE[5] : GRANITE[4]),
    right: (u, v, _w, h) => {
      if (v >= h - 1) return GRANITE[0];
      // (lichen in patches high on it)
      if (v < h * 0.5 && hash(Math.floor(u / 4), Math.floor(v / 4), 63) > 0.86) return '#3c4830';
      return hash(Math.floor(u / 3), Math.floor(v / 4), 64) > 0.9 ? GRANITE[1] : v < h * 0.25 ? GRANITE[3] : GRANITE[2];
    },
  });
  // (its top corners bitten by the weather)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!slab.has(x, y)) continue;
      if (y > oy - TALL + 6 && y < oy - TALL + 30 && (x < ox - 18 || x > ox + 18)) continue;
      const open = (slab.has(x - 1, y) ? 0 : 1) + (slab.has(x + 1, y) ? 0 : 1) + (slab.has(x, y - 1) ? 0 : 1);
      if (open >= 2 && y < oy - TALL + 34) slab.erase(x, y);
    }
  // the net hung over it, down its face to him: a mesh of diamonds in rope, gathered at its foot
  const inet = new Iso(net, ox, oy);
  inet.right(X1 + 0.01, Y0 + 0.3, Y1 - 0.35, 62, TALL, (u, v, w, h) => {
    const sag = Math.round(3 * Math.sin((u / w) * Math.PI));
    const vv = v - sag;
    if (vv < 0 || vv > h - 6 - Math.round(8 * Math.sin((u / w) * Math.PI))) return null;
    const a = (u + vv) % 9;
    const b = (u - vv + 900) % 9;
    if (a === 0 || b === 0) return (u + vv) % 3 === 0 ? ROPE[0] : ROPE[2];
    return null;
  });
  // a float of cork on it, and a coil of rope at its foot
  {
    const [fa, fb] = inet.at(X1 + 0.02, -0.1, TALL - 22);
    net.rect(Math.round(fa) - 1, Math.round(fb) - 1, 3, 3, '#7a3a24').set(Math.round(fa) - 1, Math.round(fb) - 1, '#a4583a');
    const [ca, cb] = inet.at(X1 + 0.18, 0.3, 0);
    for (let k = 0; k < 3; k++) net.ellipse(Math.round(ca), Math.round(cb) - 1 - k * 2, 7 - k, 2.4 - k * 0.4, ROPE[2 + (k % 2)]);
  }
  return { s: compose(null, [slab, net], null).sprite(ox, oy, GRAIN), behind: 0.36 };
}
