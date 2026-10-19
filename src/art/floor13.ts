// FLOOR 13, THE MILLRACE (THE PULPING FLOOR): ITS OWN PIECES, themed after its boss (a mock-up; nothing of the game
// imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of
// the 5 levels, then 25 for each boss.” This floor's boss is the Palimpsest (his doc "Wordsmith Act 2: The Hush", the
// planning chat's, with his yes as ideas): "A giant of wet, layered pages, written and scraped and written over", on
// the Pulping Floor. The floor: "fields left overgrown through the siege, the river with little bridges, a water
// wheel, and a paper mill. Rows of sheets hang on drying lines and go see-through, like the mystic's tent, while
// someone is behind them"; its hazards "the mill race's fast water, and the turning wheel"; its story "carts bring the
// jars of voices here. The Silent Order pulps the stolen words into ink and paper, and the pages go back into the
// city"; its Muffled Bell "The mill bell on its gable", its Bells "Farm bells on posts across the fields". Made on his
// word to this chat, 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says. Pink burning to gold only on what is the enemy's (the voices in the
// pulp, the Order's hooded lantern on its cart); a lamp in the mill's window an honest orange; the Bells awake or rung
// the hero's cyan (his to ring); the quest's own pale light; nothing else gives light.

import type { Sprite } from '../engine/px';
import type { Piece } from './floorkit';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { CANDLE, SWING, bell, bellGlow, metalOf } from './floor11';
import { rope, timber } from './floor6';
import { DEAL, IRON, OAK, PAPER, ROPE, SOFT_ID, STONE, checker, cylinder, done, facing, local, lying, scene, slab, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// =================================================================================================
// THE MILLRACE'S MATERIALS (each from its deep shade to its lit top)

/** Limewash over the mill's timbers, gone grey with the weather. */
export const LIME: Ramp = ['#4a463e', '#68635a', '#8a8476', '#a8a190', '#c2baa6'];
/** Field stone, the mill's footings and walls: warm grey. */
export const FIELDSTONE: Ramp = ['#2e2a2a', '#46403c', '#625a52', '#7e756a', '#9a8f80'];
/** Stone slates on the roofs, dull brown-grey, lichened. */
export const SLATE: Ramp = ['#24201e', '#383230', '#4e4642', '#665c54', '#7e7266'];
/** Timber, the mill's and the wheel's, wet and dark. */
export const TIMBER: Ramp = ['#1c1412', '#30231c', '#463428', '#5e4834', '#765c42'];
/** The race's water, river blue, white where it is churned. */
export const RACE: Ramp = ['#1c2a3e', '#24364e', '#2e4560', '#3c5674', '#587494'];
export const FOAM: Ramp = ['#5e7084', '#8ea2b6', '#b2c0cc', '#d0d8de', '#e6eaec'];
/** Pulp: wet, grey-white, the ink of the words beaten into it. */
export const PULP: Ramp = ['#45443f', '#62615a', '#817f76', '#a19e93', '#bebbae'];
/** Rag, the old linen beaten to pulp. */
export const RAG: Ramp = ['#3c3832', '#57524a', '#746d62', '#918878', '#aca290'];
/** Linen and paper sheets, white in the low light. */
export const SHEET: Ramp = ['#6c6862', '#8e897e', '#b0a999', '#cbc4b2', '#e0dac8'];
/** The Order's ink. */
export const INKY: Ramp = ['#060509', '#0e0c14', '#18151f', '#24202c', '#302a38'];
/** Straw and corn, gold. */
export const CORN: Ramp = ['#3e3220', '#5c4a28', '#7c6634', '#9c8442', '#bca456'];
/** The voices in the pulp: the enemy's pink burning toward gold. */
const VOICE = FLAME;

// =================================================================================================
// HELPERS

/** Coursed field stone on a slab's sides: irregular blocks in rough courses, dark joints. */
function rubble(H: number, seed: number) {
  return (f: number, u: number, v: number): number => {
    if (f === 4 || f === 5) return 0;
    const z = v * H;
    const row = Math.floor(z / 6);
    const off = hash(row, 0, seed) * 7;
    const len = 7 + 5 * hash(row, 1, seed);
    const x = u * 60 + off;
    const col = Math.floor(x / len);
    if (fr(z / 6) < 0.16 || fr(x / len) < 0.07) return -0.75;
    return (hash(col, row, seed + 1) - 0.5) * 0.5;
  };
}
/** Water drips, falling: short soft streaks below a point. */
function drips(S: Scene, x: number, y: number, z: number, n: number, seed: number, frame = 0, ramp: Ramp = FOAM): void {
  for (let i = 0; i < n; i++) {
    const t = fr(hash(i, seed, 6301) + frame * 0.25);
    const zz = z - 3 - t * 24;
    if (zz < 1) continue;
    S.ball([x + (hash(i, seed, 6302) - 0.5) * 6, y + (hash(i, seed, 6303) - 0.5) * 4, zz], 0.7, ramp, SOFT_ID + 3, undefined, 0.5);
  }
}

// =================================================================================================
// THE MILL AND ITS WORKS

/**
 * THE PAPER MILL: a ground storey of field stone; over it the drying loft, timber-framed and limewashed, its sides
 * all louvres (the boards set slantwise to let the air through to the hanging sheets); a roof of stone slates from a
 * ridge along x; a loft door in its gable with a hoist beam and its pulley, a rope down; its door, a lamp burning in
 * the window by it. Built a quarter bigger than it is measured: 350 x 370 at (175, 268).
 */
function paperMill(): Sprite {
  const S = turned(scene(350, 370, 175, 268), 0, 1.25);
  const L = 60;
  const D = 38;
  const G = 40;
  const E = 82;
  const RIDGE = 126;
  // the ground storey: field stone, its quoins bigger
  slab(S, -L, -D, L, D, 0, G, FIELDSTONE, 1, -0.05, rubble(G, 6311));
  for (const [x, y] of [[L, D], [L, -D], [-L, D]] as const) {
    for (let z = 0; z < G; z += 8) slab(S, x - 4, y - 4, x + 4, y + 4, z, z + 7.5, FIELDSTONE, 2, 0.15 + (z % 16 ? 0.1 : -0.1));
  }
  // its door (in the long wall toward the eye, +y): a dark doorway, its leaf ajar, a stone lintel
  const FRONT = facing(S, [0, 1, 0]);
  S.quad([[-30, D + 0.4, 0], [-16, D + 0.4, 0], [-16, D + 0.4, 28], [-30, D + 0.4, 28]], (u) => (u < 0.7 ? '#100c10' : fr(u * 9) < 0.15 ? TIMBER[0] : toneAt(FRONT, TIMBER, 0.2)), 3);
  slab(S, -32, D - 1, -14, D + 1.5, 28, 32, FIELDSTONE, 4, 0.3);
  // the window by it, a lamp burning within (an honest orange)
  S.quad([[2, D + 0.4, 12], [16, D + 0.4, 12], [16, D + 0.4, 26], [2, D + 0.4, 26]], (u, v) => (fr(u * 2) < 0.12 || fr(v * 2) < 0.12 ? TIMBER[1] : v < 0.5 ? CANDLE[2] : CANDLE[3]), 5);
  slab(S, 0, D - 1, 18, D + 2, 10, 12, FIELDSTONE, 6, 0.3);
  // THE DRYING LOFT: timber frame, limewashed, its long sides all louvres
  slab(S, -L + 1, -D + 1, L - 1, D - 1, G, E, LIME, 7, 0, (f, u, v) => {
    if (f === 4 || f === 5) return 0;
    // posts every so far, a rail at the loft's foot and head
    const across = u * (f === 0 || f === 1 ? 2 * D : 2 * L);
    const post = fr(across / 20) < 0.08;
    if (post || v < 0.07 || v > 0.93) return -0.35;
    // the louvres: slanting boards, a dark slot under each (the long walls only)
    if (f === 2 || f === 3) return fr(v * 9) < 0.28 ? -0.9 : fr(v * 9) > 0.86 ? 0.35 : 0;
    return 0;
  });
  for (let x = -L + 1; x <= L - 1; x += 20) {
    slab(S, x - 1.4, D - 1.6, x + 1.4, D + 0.4, G, E, TIMBER, 8, 0);
  }
  // the roof: two pitches of stone slates from the ridge along x, overhanging; lichen on them
  const OV = 7;
  for (const sy of [1, -1]) {
    const a: V3 = [-L - OV, 0, RIDGE];
    const b: V3 = [L + OV, 0, RIDGE];
    const c: V3 = [L + OV, sy * (D + OV), E - 3];
    const d: V3 = [-L - OV, sy * (D + OV), E - 3];
    S.quad([a, b, c, d], (u, v, w) => {
      const row = Math.floor(v * 12);
      const col = Math.floor(u * 26 + (row % 2) * 0.5);
      if (hash(Math.floor(w[0] / 6), Math.floor(w[1] / 5), 6312) > 0.86) return sy > 0 ? '#6e6a4a' : '#45422e';
      if (fr(v * 12) < 0.16) return SLATE[0];
      return SLATE[(sy > 0 ? 3 : 1) + (hash(col, row, 6313) > 0.75 ? -1 : 0)];
    }, 9 + (sy > 0 ? 0 : 1));
  }
  // the gables: the loft's end walls up to the ridge, limewashed boards, a loft door in the near one (+x), the hoist
  const GABLE = facing(S, [1, 0, 0]);
  for (const sx of [1, -1]) {
    S.quad([[sx * (L - 1), -D + 1, E], [sx * (L - 1), D - 1, E], [sx * (L - 1), 0.01, RIDGE - 1], [sx * (L - 1), -0.01, RIDGE - 1]], (u, v, w) => {
      const [, y, z] = local(S, w);
      if (sx > 0 && Math.abs(y) < 9 && z < E + 26) return z < E + 1 ? TIMBER[0] : '#100c10';
      return fr(y / 5) < 0.12 ? toneAt(GABLE, LIME, -0.5) : toneAt(GABLE, LIME, 0.05);
    }, 11 + (sx > 0 ? 0 : 1));
  }
  // the hoist beam out of the gable's peak, its pulley, a rope hanging down to a hook
  S.box([L + 8, 0, RIDGE - 10], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [10, 2, 2], (_f, _u, _v, n) => toneAt(n, TIMBER, 0.1), 13);
  S.ball([L + 15, 0, RIDGE - 14], 2.6, IRON, 14);
  for (let i = 0; i < 16; i++) S.ball([L + 17.4, 0, RIDGE - 16 - i * 3.2], 0.55, ROPE, 15);
  S.rod([L + 17.4, 0, RIDGE - 68], [L + 17.4, 0, RIDGE - 72], 0.8, 0.5, IRON, 15);
  // sacks of rags stacked by the door
  for (let i = 0; i < 3; i++) S.egg([-40 + i * 7, D + 6, 5 + (i === 1 ? 6 : 0)], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [4.2, 3.6, 5], (n) => toneAt(n, RAG, 0.05), 16 + i);
  // the mill's lamp (an honest orange)
  return done(S, 175, 268, [{ at: [9, D + 4, 19], r: 30, color: CANDLE[2], a: 0.35 }]);
}

/**
 * THE WATER WHEEL, turning (a trap: its paddles strike what is in the race beside it): an undershot wheel in the race,
 * two rims of timber segments, eight spokes to each, sixteen paddles between them, its iron-bound axle on two trestles;
 * water thrown off its paddles, white at its foot. Looking along +y (`k` 0) or +x (1); its frames one sixteenth of a
 * turn apart, so that four go round to the next paddle. 200 x 220 at (100, 160).
 */
function waterWheel(frame: number, k: number): Sprite {
  const S = turned(scene(200, 220, 100, 160), k);
  const R = 40;
  const C: V3 = [0, 0, R + 2];
  const W2 = 11;
  const turn = (frame / 4) * ((Math.PI * 2) / 16);
  const P = (a: number, r: number, y: number): V3 => [C[0] + Math.cos(a) * r, y, C[2] + Math.sin(a) * r];
  // the trestles either side: a pair of legs and a cap, the axle's bearing
  for (const sy of [-1, 1]) {
    const y = sy * (W2 + 7);
    S.rod([-14, y, 0], [0, y, C[2] + 2], 2, 1.8, TIMBER, 1);
    S.rod([14, y, 0], [0, y, C[2] + 2], 2, 1.8, TIMBER, 1);
    S.rod([-8, y, C[2] - 12], [8, y, C[2] - 12], 1.4, 1.4, TIMBER, 1);
    S.box([0, y, C[2] + 3], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [5, 2.6, 2.4], (_f, _u, _v, n) => toneAt(n, IRON, 0), 2);
  }
  S.rod([0, -W2 - 10, C[2]], [0, W2 + 10, C[2]], 3, 3, TIMBER, 3);
  for (const y of [-W2 - 4, W2 + 4]) S.rod([0, y - 1.5, C[2]], [0, y + 1.5, C[2]], 3.6, 3.6, IRON, 3);
  // its two rims: segments of timber
  for (const sy of [-1, 1]) {
    for (let i = 0; i < 32; i++) {
      const a0 = turn + (i / 32) * Math.PI * 2;
      const a1 = turn + ((i + 1) / 32) * Math.PI * 2;
      S.rod(P(a0, R, sy * W2), P(a1, R, sy * W2), 1.8, 1.8, i % 4 ? TIMBER : OAK, 4);
    }
    for (let i = 0; i < 8; i++) {
      const a = turn + (i / 8) * Math.PI * 2;
      S.rod(P(a, 3, sy * W2), P(a, R - 1, sy * W2), 1.3, 1.1, TIMBER, 5);
    }
  }
  // the paddles between the rims, each a board out past them; wet, darker at their tips
  for (let i = 0; i < 16; i++) {
    const a = turn + (i / 16) * Math.PI * 2 + 0.1;
    const n: V3 = [-Math.sin(a), 0, Math.cos(a)];
    const r0 = R - 7;
    const r1 = R + 7;
    const q: [V3, V3, V3, V3] = [P(a, r0, -W2 - 1), P(a, r0, W2 + 1), P(a, r1, W2 + 1), P(a, r1, -W2 - 1)];
    if (q.some((p) => p[2] < 0.5)) {
      for (const p of q) p[2] = Math.max(0.5, p[2]);
    }
    S.quad(q, (u, v) => (fr(u * 3) < 0.1 ? TIMBER[0] : v > 0.7 ? toneAt(facing(S, n), TIMBER, -0.3) : toneAt(facing(S, n), TIMBER, 0.15)), 6);
    // water thrown off the paddles rising out of the race
    if (Math.sin(a) < -0.2 && Math.cos(a) < 0.4) drips(S, Math.cos(a) * (R + 6), 0, C[2] + Math.sin(a) * (R + 6), 4, i, frame);
  }
  // white water churned up at its foot
  for (let i = 0; i < 26; i++) {
    const x = -R * 0.8 + (i / 25) * R * 1.6 + (hash(i, frame, 6321) - 0.5) * 4;
    const y = (hash(i, 7, 6321) - 0.5) * (2 * W2 + 8);
    S.ball([x, y, 1 + hash(i, frame + 3, 6322) * 3], 1.4 + hash(i, 2, 6321), FOAM, SOFT_ID + 4, undefined, 0.4);
  }
  return done(S, 100, 160);
}

/**
 * THE RACE'S HEADGATE (a gate across the race, where it leaves the river): two cheeks of dressed stone, a gate of oak
 * planks strapped with iron sliding in their grooves, a frame over it and a rack-and-pinion post to lift it, its
 * capstan wheel. Shut, or open (lifted, the water pouring under it). Looking along +y (`k` 0) or +x (1).
 * 170 x 190 at (85, 140).
 */
function headgate(open: boolean, k: number): Sprite {
  const S = turned(scene(170, 190, 85, 140), k);
  const FRONT = facing(S, [0, 1, 0]);
  const H = 52;
  for (const sx of [-1, 1]) {
    slab(S, sx * 30 - 7, -8, sx * 30 + 7, 8, 0, H, FIELDSTONE, 1 + (sx > 0 ? 1 : 0), 0.05, rubble(H, 6331 + sx));
    slab(S, sx * 30 - 8, -9, sx * 30 + 8, 9, H, H + 4, STONE, 3 + (sx > 0 ? 1 : 0), 0.1);
    S.quad([[sx * 23, -1.6, 0], [sx * 23, 1.6, 0], [sx * 23, 1.6, H], [sx * 23, -1.6, H]], () => '#0a0810', 5 + (sx > 0 ? 1 : 0));
  }
  // the frame over it: a beam on posts from the cheeks' tops
  for (const sx of [-1, 1]) S.rod([sx * 30, 0, H + 4], [sx * 30, 0, H + 34], 2.4, 2.2, TIMBER, 7);
  S.box([0, 0, H + 36], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [36, 3, 3], (_f, _u, _v, n) => toneAt(n, TIMBER, 0.1), 8);
  // THE GATE: oak planks, upright, two iron straps across
  const lift = open ? 34 : 0;
  const z0 = 0.5 + lift;
  const z1 = H - 4 + lift;
  S.quad([[-23, 1.2, z0], [23, 1.2, z0], [23, 1.2, z1], [-23, 1.2, z1]], (u, v, w) => {
    const [x, , z] = local(S, w);
    if (Math.abs(z - z0 - 8) < 2.2 || Math.abs(z - z1 + 8) < 2.2) return fr(x / 6) < 0.2 ? toneAt(FRONT, IRON, 0.6) : toneAt(FRONT, IRON, 0);
    if (fr((x + 23) / 7.6) < 0.08) return toneAt(FRONT, OAK, -0.7);
    if (z - z0 < 10 + 6 * hash(Math.floor(x / 7.6), 0, 6332)) return toneAt(FRONT, OAK, -0.35);
    return toneAt(FRONT, OAK, (hash(Math.floor(x / 7.6), 1, 6332) - 0.5) * 0.3);
  }, 9);
  // the rack: a toothed iron bar up from the gate through the beam; the capstan wheel turning it
  S.rod([0, 0, z1], [0, 0, H + 50 + lift * 0.4], 1.4, 1.4, IRON, 10);
  for (let z = z1 + 2; z < H + 48 + lift * 0.4; z += 3) S.ball([1.4, 0, z], 0.7, IRON, 10);
  const wc: V3 = [0, -4, H + 44];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + (open ? 0.4 : 0);
    S.rod(wc, [wc[0] + Math.cos(a) * 10, wc[1], wc[2] + Math.sin(a) * 10], 0.8, 0.6, TIMBER, 11);
    S.ball([wc[0] + Math.cos(a) * 10, wc[1], wc[2] + Math.sin(a) * 10], 1.1, TIMBER, 11);
  }
  S.ball(wc, 2.4, IRON, 12);
  // open: the river pouring under it in a white sheet
  if (open) {
    for (let i = 0; i < 30; i++) {
      const x = -22 + (i / 29) * 44;
      S.ball([x, 3 + hash(i, 1, 6333) * 6, 1 + hash(i, 2, 6333) * (lift - 2) * 0.4], 1.5, FOAM, SOFT_ID + 5, undefined, 0.3);
    }
  }
  return done(S, 85, 140);
}

/**
 * DRYING LINES: three posts in a row along x, two lines strung between them, and the sheets pegged over them to dry,
 * blank, the faint grey ghost of writing still in some (the words not quite gone); sagging, stirring. `see`: as the
 * game shows it while someone is behind it, the sheets half there (a fine checker). 280 x 210 at (140, 158).
 */
function dryingLines(see: boolean): Sprite {
  const S = scene(280, 210, 140, 158);
  const POSTS = [-64, 0, 64];
  for (const x of POSTS) {
    S.rod([x, 0, 0], [x, 0, 56], 1.6, 1.4, TIMBER, 1);
    S.rod([x, -5, 52], [x, 5, 52], 1, 1, TIMBER, 1);
  }
  const sag = (x: number, z: number): number => {
    const a = POSTS.find((p) => p <= x && x <= p + 64) ?? 0;
    const t = (x - a) / 64;
    return z - 5 * Math.sin(Math.PI * t);
  };
  for (const y of [-5, 5]) {
    for (let x = -64; x < 64; x += 2) S.rod([x, y, sag(x, 52)], [x + 2, y, sag(x + 2, 52)], 0.35, 0.35, ROPE, 2);
  }
  // the sheets: each hung over a line, pegged, its corners lifting a little
  let id = 3;
  for (const y of [-5, 5]) {
    for (let i = 0; i < 5; i++) {
      const x0 = -60 + i * 25 + (y > 0 ? 6 : 0) + (hash(i, y, 6341) - 0.5) * 3;
      const w = 18 + hash(i, y + 1, 6341) * 3;
      const hgt = 22 + hash(i, y + 2, 6341) * 5;
      const ghost = hash(i, y + 3, 6341) < 0.5;
      const stir = (hash(i, y + 4, 6341) - 0.5) * 3;
      const top0 = sag(x0, 52);
      const top1 = sag(x0 + w, 52);
      const FR = facing(S, [0, 1, 0]);
      S.quad([[x0, y + 0.4, top0], [x0 + w, y + 0.4, top1], [x0 + w + stir, y + 0.4 + stir * 0.5, top1 - hgt], [x0 + stir * 0.6, y + 0.4 + stir * 0.3, top0 - hgt]], (u, v, wp) => {
        if (see && !checker(S, wp)) return null;
        // (the faint grey script of the words not quite pulped away)
        if (ghost && u > 0.12 && u < 0.88 && v > 0.15 && v < 0.85 && fr(v * 9) < 0.18 && hash(Math.floor(u * 22), Math.floor(v * 9), 6342) < 0.55) return toneAt(FR, SHEET, -0.9);
        if (v < 0.06) return toneAt(FR, SHEET, 0.5);
        return toneAt(FR, SHEET, 0.12 - 0.25 * v);
      }, id++);
      // two pegs on it
      for (const px of [x0 + 3, x0 + w - 3]) S.rod([px, y + 1.2, sag(px, 52) + 2], [px, y + 1.2, sag(px, 52) - 3], 0.6, 0.5, DEAL, id);
      id++;
    }
  }
  return done(S, 140, 158);
}

/**
 * A VAT OF PULP: a great tub of oak staves bound with iron hoops, full to near the brim with the grey pulp the words
 * were beaten into; the ink of them swirling in it, and here and there the pink of a voice not yet drowned (the
 * enemy's); a paddle across it; a slop of pulp down its side. 140 x 120 at (70, 92).
 */
function pulpVat(): Sprite {
  const S = scene(160, 140, 80, 104);
  cylinder(S, 0, 0, (z) => 24 + z * 0.05, 0, 28, (n, a, z) => {
    if (Math.abs(z - 4) < 1.4 || Math.abs(z - 22) < 1.4) return toneAt(n, IRON, 0.1);
    if (fr(a * 5.7) < 0.12) return toneAt(n, OAK, -0.6);
    // a slop of pulp down its side toward the eye
    if (Math.abs(a - Math.PI * 0.3) < 0.25 && z > 28 - 20 * (1 - Math.abs(a - Math.PI * 0.3) / 0.25)) return toneAt(n, PULP, 0);
    return toneAt(n, OAK, 0);
  }, 1, (a, rr) => {
    if (rr > 0.94) return OAK[3];
    // the pulp's skin: swirls of ink, the voices' pink
    const sw = fr(a * 1.6 + rr * 4.2);
    if (sw < 0.1) return INKY[2];
    if (Math.abs(sw - 0.5) < 0.03 && rr > 0.3 && rr < 0.6 && fr(a * 3) < 0.4) return VOICE[1];
    return rr < 0.3 ? PULP[4] : sw > 0.7 ? PULP[2] : PULP[3];
  });
  // the paddle across it
  S.rod([-28, -6, 34], [26, 8, 26], 1.2, 1.2, DEAL, 2);
  S.box([24, 7.4, 27], [[0.95, 0.3, 0], [-0.3, 0.95, 0], [0, 0, 1]], [5, 2.6, 0.6], (_f, _u, _v, n) => toneAt(n, DEAL, 0.1), 3);
  // a wisp of a voice rising off it
  for (let i = 0; i < 4; i++) S.ball([4 + Math.sin(i) * 2, -3, 31 + i * 3.4], 0.7, VOICE, SOFT_ID + 6, undefined, 0.4);
  return done(S, 80, 104, [{ at: [0, 0, 30], r: 22, color: VOICE[1], a: 0.2 }]);
}

/**
 * THE STAMPING MILL (a trap: its hammers come down on what is under them): a frame of heavy timber, three stampers
 * (upright beams shod with iron) lifted by the cams on a shaft turned from the wheel and let fall into a trough of
 * rags and pulp. Frames: at rest (all down); the warning (all three lifted high, the cams at their tips); falling;
 * struck (down, the pulp splashed out). 190 x 200 at (95, 150).
 */
function stampers(frame: number): Sprite {
  const S = scene(190, 200, 95, 150);
  // the trough: a long box of oak, rag and pulp in it
  S.box([0, 0, 6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [30, 9, 6], (f, u, v, n) => (f === 4 ? (u > 0.06 && u < 0.94 && v > 0.12 && v < 0.88 ? (hash(Math.floor(u * 30), Math.floor(v * 8), 6361) < 0.3 ? RAG[3] : PULP[2]) : OAK[3]) : toneAt(n, OAK, fr(u * 4) < 0.05 ? -0.7 : 0)), 1);
  // the frame: two uprights at each end, a head beam, a back beam carrying the shaft
  // (its uprights at the back and ends only, so the stampers show; braces down to the floor behind)
  for (const sx of [-1, 1]) {
    S.rod([sx * 34, -8, 0], [sx * 34, -8, 84], 2.6, 2.4, TIMBER, 2);
    S.rod([sx * 34, -8, 60], [sx * 34, -26, 0], 1.6, 1.6, TIMBER, 2);
  }
  S.box([0, -3, 86], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [38, 6, 2.6], (_f, _u, _v, n) => toneAt(n, TIMBER, 0.1), 3);
  S.box([0, -6, 52], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [36, 1.6, 1.8], (_f, _u, _v, n) => toneAt(n, TIMBER, 0), 3);
  // the camshaft behind, its cams
  S.rod([-36, -12, 40], [36, -12, 40], 2.8, 2.8, OAK, 4);
  const lifts = frame === 0 ? [0, 0, 0] : frame === 1 ? [26, 26, 26] : frame === 2 ? [10, 12, 8] : [0, 0, 0];
  [-20, 0, 20].forEach((x, i) => {
    const a = frame === 1 ? -0.6 : frame === 2 ? 0.3 : 1.4 + i;
    S.rod([x, -11, 40], [x, -11 + Math.cos(a) * 7, 40 + Math.sin(a) * 7], 1.6, 1.2, IRON, 5);
    // the stamper: an upright beam through the guides, shod with iron at its foot, a tappet out the back
    const z0 = 8 + lifts[i];
    S.box([x, 0, z0 + 34], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.4, 3.4, 34], (f, u, v, n) => (v < 0.12 ? toneAt(n, IRON, 0.1) : toneAt(n, OAK, fr(v * 5) < 0.05 ? -0.5 : 0.05)), 6 + i);
    S.box([x, -5, z0 + 30], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6, 2.4, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0), 6 + i);
  });
  // struck: the pulp thrown up out of the trough
  if (frame === 3) {
    for (let i = 0; i < 24; i++) {
      const x = -24 + hash(i, 1, 6362) * 48;
      S.ball([x, (hash(i, 2, 6362) - 0.5) * 22, 12 + hash(i, 3, 6362) * 12], 1.3, PULP, SOFT_ID + 7, undefined, 0.3);
    }
  }
  if (frame === 1) for (let i = 0; i < 3; i++) drips(S, -20 + i * 20, 0, 34, 3, i);
  return done(S, 95, 150);
}

/**
 * THE SCREW PRESS: two great oak posts and a head beam, a wooden screw down through it turned by a bar, the platen
 * pressed down on a post of wet sheets between felts, the water squeezed out running off its bed into a gutter.
 * 150 x 180 at (75, 140).
 */
function screwPress(): Sprite {
  const S = scene(150, 180, 75, 140);
  // the bed: a heavy slab of oak on blocks, a lip round it
  S.box([0, 0, 8], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [24, 16, 4], (f, u, v, n) => toneAt(n, OAK, f === 4 ? (fr(u * 5) < 0.06 ? -0.6 : 0.1) : fr(u * 3) < 0.05 ? -0.6 : 0), 1);
  for (const [x, y] of [[-18, -10], [18, -10], [-18, 10], [18, 10]] as const) slab(S, x - 3, y - 3, x + 3, y + 3, 0, 4, FIELDSTONE, 2, 0);
  // the posts and the head beam
  for (const sx of [-1, 1]) S.box([sx * 20, 0, 40], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.6, 5, 30], (f, u, v, n) => toneAt(n, OAK, fr(v * 4) < 0.04 ? -0.6 : 0), 3);
  S.box([0, 0, 72], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [27, 6, 4], (_f, _u, _v, n) => toneAt(n, OAK, 0.12), 4);
  // the post of sheets between felts: pale paper and dark felt, layer on layer, wet
  for (let i = 0; i < 9; i++) {
    const z = 12 + i * 2.2;
    S.box([0, 0, z + 1], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [13 - (i % 2) * 0.6, 10 - (i % 2) * 0.6, 1], (_f, _u, _v, n) => toneAt(n, i % 2 ? RAG : SHEET, i % 2 ? -0.3 : 0), 5 + i);
  }
  // the platen on it, the screw up from it through the beam, the bar through the screw's head
  S.box([0, 0, 34], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [15, 12, 2.4], (_f, _u, _v, n) => toneAt(n, OAK, 0), 15);
  S.rod([0, 0, 36], [0, 0, 84], 3.6, 3.6, OAK, 16);
  for (let z = 38; z < 82; z += 3) S.rod([-3.7, 0, z], [3.7, 0, z + 1.5], 0.6, 0.6, TIMBER, 16);
  S.ball([0, 0, 86], 4.4, OAK, 17);
  S.rod([-26, -9, 86], [26, 9, 86], 1.6, 1.6, TIMBER, 18);
  // the water pressed out, running off the bed's lip in threads and pooling
  for (let i = 0; i < 7; i++) S.rod([-20 + i * 6, 16.5, 11], [-20 + i * 6, 17, 4 - hash(i, 1, 6371) * 2], 0.4, 0.3, FOAM, SOFT_ID + 8);
  return done(S, 75, 140);
}

/**
 * REAMS BOUND FOR THE CITY (breakable): stacks of new paper in reams, wrapped and tied with the Order's black cord, its
 * blank mask stamped on the wrappers; knocked down, the reams burst and the sheets fanned out over the ground.
 * 130 x 110 at (65, 82).
 */
function reams(broken: boolean): Sprite {
  const S = scene(130, 110, 65, 82);
  const ream = (c: V3, a: number, id: number): void => {
    const A: [V3, V3, V3] = [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
    S.box(c, A, [9, 6.5, 2.8], (f, u, v, n) => {
      // the wrapper: brown paper; the cord crossing it; the mask stamped on its top
      if ((f === 4 && (Math.abs(u - 0.5) < 0.05 || Math.abs(v - 0.5) < 0.06)) || (f !== 4 && f !== 5 && Math.abs(u - 0.5) < 0.05)) return INKY[2];
      if (f === 4 && Math.hypot((u - 0.28) / 0.1, (v - 0.3) / 0.14) < 1) return toneAt(n, SHEET, 0.4);
      if (f !== 4 && f !== 5 && fr(v * 5) < 0.18) return toneAt(n, SHEET, 0.1);
      return toneAt(n, CORN, -0.25);
    }, id);
  };
  if (!broken) {
    let id = 1;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) ream([-10 + i * 19 + r * 9, (r % 2) * 2, 2.8 + r * 5.7], 0.05 * (i - 1), id++);
    ream([2, 15, 2.8], 0.4, id++);
  } else {
    ream([-14, 2, 2.8], 0.3, 1);
    ream([12, -6, 2.8], -0.5, 2);
    // the sheets fanned out over the ground
    for (let i = 0; i < 14; i++) {
      const a = hash(i, 1, 6372) * Math.PI * 2;
      const d = 6 + hash(i, 2, 6372) * 26;
      const c: V3 = [Math.cos(a) * d, Math.sin(a) * d, 0.4 + i * 0.05];
      const b = hash(i, 3, 6372) * Math.PI;
      S.box(c, [[Math.cos(b), Math.sin(b), 0], [-Math.sin(b), Math.cos(b), 0], [0, 0, 1]], [6, 4.4, 0.3], (_f, _u, _v, n) => toneAt(n, SHEET, 0.2), 3 + i);
    }
  }
  return done(S, 65, 82);
}

/** BALES OF RAGS (breakable): old linen and cloth gathered for the pulping, baled in sacking and roped; burst, the rags spilled out in a heap. 120 x 100 at (60, 76). */
function ragBales(broken: boolean): Sprite {
  const S = scene(120, 100, 60, 76);
  const bale = (c: V3, id: number): void => {
    S.egg(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [9, 7, 6.5], (n, w) => {
      const [x, , z] = w;
      if (Math.abs(x - c[0] - 3) < 0.9 || Math.abs(z - c[2]) < 0.8) return toneAt(n, ROPE, 0);
      return hash(Math.floor(x), Math.floor(z * 1.5), 6381 + id) < 0.15 ? toneAt(n, RAG, 0.3) : toneAt(n, CORN, -0.45);
    }, id);
  };
  if (!broken) {
    bale([-8, -4, 6.5], 1);
    bale([10, 2, 6.5], 2);
    bale([0, -1, 18], 3);
  } else {
    bale([-12, -6, 6.5], 1);
    for (let i = 0; i < 18; i++) {
      const a = hash(i, 1, 6382) * Math.PI * 2;
      const d = 4 + hash(i, 2, 6382) * 18;
      S.egg([6 + Math.cos(a) * d, 4 + Math.sin(a) * d * 0.7, 1.4], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [4 + hash(i, 3, 6382) * 3, 2.4, 1.5], (n) => toneAt(n, [RAG, SHEET, OXRAG][i % 3], 0), 2 + i);
    }
  }
  return done(S, 60, 76);
}
const OXRAG: Ramp = ['#2e1c1c', '#46292a', '#603834', '#7a4a42', '#925c50'];

/** BARRELS OF THE ORDER'S INK (breakable): black-tarred barrels, the mask chalked on one; staved in, the ink run out over the ground in a glossy black pool. 120 x 110 at (60, 84). */
function inkBarrels(broken: boolean): Sprite {
  const S = scene(120, 110, 60, 84);
  const barrel = (cx: number, cy: number, id: number, mask: boolean): void => {
    cylinder(S, cx, cy, (z) => 9 + 1.4 * Math.sin((z / 22) * Math.PI), 0, 22, (n, a, z) => {
      if (Math.abs(z - 4) < 1 || Math.abs(z - 18) < 1) return toneAt(n, IRON, 0);
      if (mask && Math.abs(a - Math.PI * 0.35) < 0.35 && z > 7 && z < 15) {
        const mx = (a - Math.PI * 0.35) / 0.35;
        const my = (z - 11) / 4;
        if (Math.abs(Math.abs(mx) - 0.35) < 0.14 && Math.abs(my - 0.2) < 0.18) return INKY[2];
        if (mx * mx + my * my < 1) return toneAt(n, SHEET, -0.1);
      }
      return fr(a * 6) < 0.1 ? INKY[0] : toneAt(n, INKY, 0.4);
    }, id, (_a, rr) => (rr > 0.85 ? INKY[3] : INKY[2]));
  };
  if (!broken) {
    barrel(-10, -6, 1, true);
    barrel(12, 4, 2, false);
  } else {
    barrel(-10, -6, 1, true);
    // the other staved in on its side; its ink spread in a pool, a sheen on it
    S.egg([16, 6, 0.3], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [22, 15, 0.3], (_n, w) => (hash(Math.floor(w[0] / 3), Math.floor(w[1] / 2), 6391) < 0.1 ? INKY[4] : INKY[1]), 2);
    for (let i = 0; i < 7; i++) {
      const a = 0.5 + i * 0.45;
      S.rod([12 + Math.cos(a) * 3, 2 + Math.sin(a) * 3, 1], [12 + Math.cos(a) * 12, 2 + Math.sin(a) * 12, 3 + (i % 2) * 2], 1.4, 1.2, INKY, 3);
    }
  }
  return done(S, 60, 84);
}

/** SPILLED PULP, slopped over the ground from the vats: grey slurry in a spreading splash, the ink of words smeared through it, drips round its edge. On the floor. 120 x 70 at (60, 35). */
function spilledPulp(): Sprite {
  return lying(120, 70, 60, 35, (u, v, px, py) => {
    const a = Math.atan2(v, u);
    const d = Math.hypot(u * 1.1, v) + 0.08 * Math.sin(a * 5 + 1) + 0.05 * Math.sin(a * 11);
    if (d > 0.62) {
      // a few drops thrown past its edge
      const k = Math.floor(a * 6);
      if (d < 0.74 && hash(k, Math.floor(d * 30), 6401) < 0.05) return PULP[2];
      return null;
    }
    if (d > 0.55) return PULP[1];
    const sw = fr(a * 0.8 + d * 3.4);
    if (sw < 0.08 && d < 0.5) return INKY[3];
    return hash(px >> 1, py, 6402) < 0.06 ? PULP[4] : d < 0.3 ? PULP[3] : PULP[2];
  });
}

/** EMPTIED JARS: the voice jars the carts brought, poured out into the vats and thrown down in a heap, their corks out, their glass green and dull, a few cracked; nothing left in them (breakable: kicked, they scatter and smash). 120 x 100 at (60, 76). */
function emptiedJars(broken: boolean): Sprite {
  const S = scene(120, 100, 60, 76);
  const GLASS: Ramp = ['#14201a', '#22342a', '#344a3c', '#4a6450', '#6c8668'];
  const n = broken ? 7 : 12;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, 6411) * Math.PI * 2;
    const d = broken ? 8 + hash(i, 2, 6411) * 20 : hash(i, 2, 6411) * 12;
    const c: V3 = [Math.cos(a) * d, Math.sin(a) * d, broken ? 3 : 3 + (i > 7 ? 5 : 0)];
    const b = hash(i, 3, 6411) * Math.PI * 2;
    const A: V3 = [Math.cos(b), Math.sin(b), 0];
    if (broken && i % 2) {
      // shards
      for (let k = 0; k < 4; k++) S.egg(add(c, [k * 2 - 3, (k % 2) * 2, -2]), [[Math.cos(b + k), Math.sin(b + k), 0], [-Math.sin(b + k), Math.cos(b + k), 0], [0, 0, 1]], [2, 1.2, 0.6], (nn) => toneAt(nn, GLASS, 0.3), 10 + i * 4 + k);
      continue;
    }
    // a jar lying: its body along A, its neck, no cork
    S.egg(c, [A, [-A[1], A[0], 0], [0, 0, 1]], [5.4, 3.4, 3.4], (nn) => toneAt(nn, GLASS, 0.1), 1 + i);
    S.rod(add(c, [A[0] * 5, A[1] * 5, 0.4]), add(c, [A[0] * 8, A[1] * 8, 0.6]), 1.6, 1.4, GLASS, 1 + i);
  }
  return done(S, 60, 76);
}

/** A FOOTBRIDGE over the race: a deck of planks across two logs, worn, a nail or two; along x (frame 0) or along y (1). A floor tile. */
function footbridge(alongY: boolean): Sprite {
  return lying(64, 34, 32, 17, (u, v, px, py) => {
    if (Math.abs(u) > 0.5 || Math.abs(v) > 0.5) return null;
    const along = (alongY ? v : u) + 0.5;
    const across = (alongY ? u : v) + 0.5;
    // the two logs under its edges, round, lit along their tops
    for (const c of [0.24, 0.76]) {
      const d = across - c;
      if (Math.abs(d) < 0.055 && along > 0.02 && along < 0.98) return d < -0.03 ? TIMBER[3] : d > 0.03 ? TIMBER[0] : TIMBER[2];
    }
    const k = Math.floor(along * 9);
    const inPlank = fr(along * 9) < 0.8 && along > 0.03 && along < 0.97;
    const skew = (hash(k, 1, 6421) - 0.5) * 0.05;
    if (!inPlank || across < 0.2 + skew || across > 0.8 + skew) return null;
    const t = hash(k, 2, 6421);
    const edge = fr(along * 9) < 0.16 ? 3 : fr(along * 9) > 0.66 ? 1 : 2;
    if (Math.abs(across - 0.24) < 0.012 && fr(along * 9) > 0.3 && fr(along * 9) < 0.5) return IRON[1];
    if (hash(px >> 1, py, 6422 + k) < 0.03) return '#4e5f36';
    return TIMBER[Math.max(0, Math.min(4, edge + (t > 0.7 ? 1 : t < 0.2 ? -1 : 0)))];
  });
}

/** THE CART BRIDGE over the river: heavy planks laid across, kerb beams along both edges, the carts' wheels worn two ruts into it; along x (frame 0) or along y (1). A floor tile. */
function cartBridge(alongY: boolean): Sprite {
  return lying(64, 34, 32, 17, (u, v, px, py) => {
    if (Math.abs(u) > 0.5 || Math.abs(v) > 0.5) return null;
    const along = (alongY ? v : u) + 0.5;
    const across = (alongY ? u : v) + 0.5;
    if (across < 0.07 || across > 0.93) return across < 0.03 || across > 0.97 ? TIMBER[0] : TIMBER[3];
    const k = Math.floor(along * 7);
    if (fr(along * 7) < 0.08) return TIMBER[0];
    // the ruts, darker, worn smooth
    for (const c of [0.32, 0.68]) if (Math.abs(across - c) < 0.05) return Math.abs(across - c) < 0.02 ? TIMBER[1] : OAK[1];
    const t = hash(k, 3, 6431);
    if (hash(px >> 1, py, 6432) < 0.025) return CORN[2];
    return (fr(along * 7) < 0.2 ? OAK : TIMBER)[t > 0.6 ? 3 : 2];
  });
}

// =================================================================================================
// THE BELLS

/**
 * THE MILL BELL ON ITS GABLE (the Bells' Muffled Bell on this floor): a gable of field stone the height of the mill's
 * eaves, an arch through its head where the bell hangs, a little roof of stone slates over it; gagged by the Silent
 * Order (black cloth bound round it, chains over it), or rung, swinging `swing`. 130 x 230 at (65, 200).
 */
function millBell(gagged: boolean, swing = 0): Sprite {
  const S = scene(130, 230, 65, 200);
  const H = 104;
  // the gable's foot, solid; two piers up from it, the bell hung in the open between them; a lintel over
  slab(S, -24, -7, 24, 7, 0, 58, FIELDSTONE, 1, 0, rubble(58, 6441));
  for (const sx of [-1, 1]) slab(S, sx * 18 - 6, -7, sx * 18 + 6, 7, 58, H, FIELDSTONE, 2 + (sx > 0 ? 1 : 0), 0.05, rubble(H - 58, 6442 + sx));
  slab(S, -25, -8, 25, 8, 56, 60, STONE, 4, 0.25);
  slab(S, -25, -8, 25, 8, H - 4, H, STONE, 5, 0.25);
  // its slate roof, a cross of iron on its peak
  for (const sy of [1, -1]) S.quad([[-28, 0, H + 16], [28, 0, H + 16], [28, sy * 11, H - 2], [-28, sy * 11, H - 2]], (u, v) => (fr(v * 5) < 0.2 ? SLATE[0] : SLATE[sy > 0 ? 3 : 1]), 6 + (sy > 0 ? 0 : 1));
  S.rod([0, 0, H + 16], [0, 0, H + 26], 0.8, 0.8, IRON, 8);
  S.rod([-3, 0, H + 22], [3, 0, H + 22], 0.7, 0.7, IRON, 8);
  timber(S, [-12, 0, 96], [12, 0, 96], 2, 9);
  bell(S, [0, 0, 94], 11, 24, swing, 10, gagged);
  return done(S, 65, 200);
}

/**
 * A FARM BELL ON ITS POST (one of the Bells on this floor): a stout post at a field's edge, a little gabled hood over
 * the bell to keep the rain off it, its rope down; a horseshoe nailed to the post for luck. Quiet; awake; rung.
 * 160 x 200 at (80, 156).
 */
function farmBell(state: number): Sprite {
  const S = scene(160, 200, 80, 156);
  S.rod([0, 0, 0], [0, 0, 70], 2.4, 2.2, TIMBER, 1);
  S.rod([0, 0, 64], [0, 14, 64], 1.4, 1.4, TIMBER, 2);
  S.rod([0, 0, 52], [0, 10, 64], 1, 1, TIMBER, 2);
  for (const sx of [1, -1]) S.quad([[-6, 6, 78], [6, 6, 78], [6, 6 + sx * 7, 70], [-6, 6 + sx * 7, 70]], (_u, v) => (fr(v * 3) < 0.2 ? TIMBER[0] : TIMBER[sx > 0 ? 3 : 1]), 3 + (sx > 0 ? 0 : 1));
  // the horseshoe
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * (0.1 + 0.8 * (i / 8));
    S.ball([Math.cos(a) * 2.4, 2.4, 40 - Math.sin(a) * 2.4 + 2.4], 0.6, IRON, 5);
  }
  const c: V3 = [0, 12, 62];
  bell(S, c, 8.5, 16, SWING[state], 6, false, metalOf(state));
  rope(S, [0, 12 + 16 * Math.sin(SWING[state]), 62 - 16 * Math.cos(SWING[state])], [0, 10, 20], 0.4, 8, 0.45);
  const glow = bellGlow(S, c, 8.5, 16, state, [0, 12, 0]);
  return done(S, 80, 156, glow);
}

// =================================================================================================
// THE FIELDS

/**
 * A SCARECROW, GAGGED: a cross of poles in the corn, an old coat stuffed with straw hung on it, straw out of its cuffs,
 * a sacking head under a battered hat, its face stitched on; and over its mouth the Order's black cloth, bound round,
 * as if even it might speak. A crow on its arm. 130 x 190 at (65, 160).
 */
function scarecrow(): Sprite {
  const S = scene(130, 190, 65, 160);
  S.rod([0, 0, 0], [0, 0, 74], 1.6, 1.4, TIMBER, 1);
  S.rod([0, -24, 58], [0, 24, 58], 1.3, 1.3, TIMBER, 2);
  // the coat: a body of oxblood cloth, sleeves along the arms, ragged
  S.egg([0, 0, 46], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6, 9, 15], (n, w) => (fr(w[2] / 5) < 0.12 ? toneAt(n, OXRAG, -0.5) : toneAt(n, OXRAG, 0)), 3);
  for (const sy of [-1, 1]) S.rod([0, sy * 6, 58], [0, sy * 20, 57], 3.2, 2.6, OXRAG, 4);
  for (const sy of [-1, 1]) for (let i = 0; i < 5; i++) S.rod([0, sy * 21, 57], [(i - 2) * 1.2, sy * (24 + i * 0.6), 52 - i * 1.5], 0.4, 0.3, CORN, 5);
  for (let i = 0; i < 6; i++) S.rod([(i - 2.5) * 1.6, (i % 2) * 2, 32], [(i - 2.5) * 2.2, (i % 2) * 2.6, 24 - (i % 3) * 2], 0.45, 0.3, CORN, 5);
  // the sacking head, its stitched face, the gag
  S.egg([0, 0, 70], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6, 6, 7], (n, w) => {
    const [x, y, z] = w;
    if (x > 3 && Math.abs(y) > 1.2 && Math.abs(y) < 3.2 && Math.abs(z - 72) < 0.9) return INKY[2];
    if (Math.abs(z - 67.5) < 2.2) return toneAt(n, INKY, 0.3);
    return toneAt(n, CORN, -0.35);
  }, 6);
  for (const sy of [-1, 1]) S.rod([-4, sy * 1.2, 67.5], [-7, sy * 2.4, 61], 0.7, 0.5, INKY, 7);
  // the hat
  S.egg([0, 0, 76.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [9.5, 9.5, 1], (n) => toneAt(n, TIMBER, 0.1), 8);
  S.egg([0, 0, 79.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [5, 5, 4], (n) => toneAt(n, TIMBER, 0.15), 8);
  // a crow on its arm
  S.egg([0, -18, 62], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [4, 2.4, 2.6], (n) => toneAt(n, INKY, 0.5), 9);
  S.ball([2.6, -16, 65], 1.8, INKY, 9, undefined, 0.5);
  S.rod([3.8, -15, 65], [6.2, -14, 64.5], 0.6, 0.3, TIMBER, 9);
  return done(S, 65, 160);
}

/** STOOKS OF CORN (breakable): sheaves stood up leaning together in tents of six, tied at their waists, their ears gone over; knocked flat, the sheaves strewn. 140 x 110 at (70, 84). */
function stooks(flat: boolean): Sprite {
  const S = scene(140, 110, 70, 84);
  // (a sheaf: a bundle of stalks, splayed at the foot, drawn in tight at the band, and its ears fanned over the
  // top; every stalk its own tone of the corn, so it reads as straw; all one soft thing, ink only round it)
  let seed = 0;
  // (the ears paler than the straw, catching the light)
  const EAR: Ramp = [CORN[1], CORN[2], CORN[3], CORN[4], '#d4bc70'];
  const sheaf = (base: V3, lean: V3, id: number): void => {
    seed++;
    const top = add(base, lean);
    const L = Math.hypot(lean[0], lean[1], lean[2]);
    const ax: V3 = [lean[0] / L, lean[1] / L, lean[2] / L];
    // (two directions across the sheaf)
    const up: V3 = Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
    const u0: V3 = [ax[1] * up[2] - ax[2] * up[1], ax[2] * up[0] - ax[0] * up[2], ax[0] * up[1] - ax[1] * up[0]];
    const ul = Math.hypot(u0[0], u0[1], u0[2]);
    const u: V3 = [u0[0] / ul, u0[1] / ul, u0[2] / ul];
    const v: V3 = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]];
    const across = (c: V3, a: number, r: number): V3 => add(c, [(u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r, (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r, (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r]);
    const mid: V3 = [base[0] + lean[0] * 0.45, base[1] + lean[1] * 0.45, base[2] + lean[2] * 0.45];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + hash(i, seed, 6450);
      const tone = hash(i, seed, 6452) * 0.9 - 0.45;
      const ramp: Ramp = [CORN[0], CORN[1], CORN[2], CORN[3], CORN[4]].map((_, k) => CORN[Math.max(0, Math.min(4, k + (tone > 0.2 ? 1 : tone < -0.2 ? -1 : 0)))]) as unknown as Ramp;
      const foot = across(base, a, 3.6 + hash(i, seed, 6453));
      const waist = across(mid, a, 1.9);
      const head = across(top, a, 3.2 + hash(i, seed, 6454) * 1.5);
      S.rod(foot, waist, 0.7, 0.6, ramp, id);
      S.rod(waist, head, 0.6, 0.6, ramp, id);
      // (its ear, heavy, nodding over and out)
      const ear = add(head, [(head[0] - top[0]) * 0.9 + ax[0] * 2.5, (head[1] - top[1]) * 0.9 + ax[1] * 2.5, ax[2] * 2.5 - hash(i, seed, 6455) * 2.4]);
      S.rod(head, ear, 1.3, 0.9, EAR, id);
    }
    S.rod(across(mid, 0, 0).map((x, k) => x - ax[k] * 0.7) as V3, across(mid, 0, 0).map((x, k) => x + ax[k] * 0.7) as V3, 2.5, 2.5, ROPE, id);
  };
  if (!flat) {
    // (two stooks, each six sheaves leaned in to a ridge along x: a little tent of corn)
    let n = 0;
    for (const [cx, cy] of [[-14, -4], [20, 4]] as const) {
      n++;
      for (let k = 0; k < 6; k++) {
        const along = (k % 3) * 6 - 6;
        const side = k < 3 ? -1 : 1;
        sheaf([cx + along, cy + side * 8, 0], [hash(k, n, 6456) * 1.6 - 0.8, -side * 7, 22], SOFT_ID + 20 + n);
      }
    }
  } else {
    for (let k = 0; k < 7; k++) {
      const a = hash(k, 1, 6451) * Math.PI * 2;
      const d = hash(k, 2, 6451) * 26;
      sheaf([Math.cos(a) * d, Math.sin(a) * d, 3.4], [Math.cos(a + 1) * 22, Math.sin(a + 1) * 22, 0.4], SOFT_ID + 20 + k);
    }
  }
  return done(S, 70, 84);
}

/**
 * A HAY WAIN, ABANDONED: a big farm wagon with its ladder sides, left in the field when the siege came, half loaded
 * with hay gone grey; a front wheel off and lying by it, its shafts down on the ground. 230 x 180 at (115, 126).
 */
function hayWain(): Sprite {
  const S = scene(230, 180, 115, 126);
  // its bed, tipped a little toward its lost wheel
  const tip = (w: V3): V3 => [w[0], w[1], w[2] - (w[0] > 0 && w[1] > 0 ? (w[0] / 40) * 6 : 0)];
  S.box(tip([0, 0, 20]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [40, 16, 2.4], (f, u, v, n) => toneAt(n, TIMBER, f === 4 ? (fr(u * 9) < 0.08 ? -0.6 : 0.1) : 0), 1);
  // its ladder sides: rails and staves
  for (const sy of [-1, 1]) {
    S.rod(tip([-42, sy * 17, 24]), tip([42, sy * 20, 38]), 1.1, 1.1, TIMBER, 2);
    S.rod(tip([-40, sy * 16, 22]), tip([40, sy * 16, 22]), 1.2, 1.2, TIMBER, 2);
    for (let x = -36; x <= 36; x += 9) S.rod(tip([x, sy * 16, 22]), tip([x, sy * (17.6 + (x + 42) * 0.03), 24 + (x + 42) * 0.16]), 0.7, 0.7, TIMBER, 2);
  }
  // its wheels: big spoked, iron-tyred; the near front one off and lying
  const wheel = (c: V3, axis: V3, up: V3, R: number, id: number): void => {
    for (let i = 0; i < 20; i++) {
      const a0 = (i / 20) * Math.PI * 2;
      const a1 = ((i + 1) / 20) * Math.PI * 2;
      const P = (a: number): V3 => [c[0] + Math.cos(a) * R * axis[0] + Math.sin(a) * R * up[0], c[1] + Math.cos(a) * R * axis[1] + Math.sin(a) * R * up[1], c[2] + Math.cos(a) * R * axis[2] + Math.sin(a) * R * up[2]];
      S.rod(P(a0), P(a1), 1.4, 1.4, i % 2 ? IRON : TIMBER, id);
      if (i % 2 === 0) S.rod(c, P(a0), 0.6, 0.6, TIMBER, id);
    }
    S.ball(c, 2.4, TIMBER, id);
  };
  wheel([-28, -18, 14], [1, 0, 0], [0, 0, 1], 13, 3);
  wheel([-28, 18, 14], [1, 0, 0], [0, 0, 1], 13, 4);
  wheel([30, -18, 12], [1, 0, 0], [0, 0, 1], 11, 5);
  wheel([46, 34, 1.6], [1, 0, 0], [0, 1, 0], 11, 6);
  // the hay, gone grey, heaped in it and slipping off its side
  for (let i = 0; i < 9; i++) S.egg(tip([-30 + i * 7, (hash(i, 1, 6461) - 0.5) * 10, 28 + Math.sin(i) * 3]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [9, 14, 7], (n, w) => (hash(Math.floor(w[0]), Math.floor(w[2] * 2), 6462) < 0.2 ? toneAt(n, CORN, 0.4) : toneAt(n, CORN, -0.3)), 7);
  // its shafts down on the ground before it
  for (const sy of [-1, 1]) S.rod([40, sy * 9, 18], [80, sy * 12, 1.4], 1.3, 1.1, TIMBER, 8);
  return done(S, 115, 126);
}

/** A POLLARD WILLOW by the water: a short, thick, gnarled trunk split and hollow, a crown of thin upright withies with narrow grey-green leaves. 170 x 230 at (85, 196). */
function willow(): Sprite {
  const S = scene(170, 230, 85, 196);
  const BARK: Ramp = ['#1e1a16', '#2e2822', '#423a30', '#58503e', '#6e6550'];
  const LEAF: Ramp = ['#26301e', '#38462c', '#4c5c3a', '#62734a', '#7a8a5e'];
  // the trunk: lumpy, leaning
  for (let i = 0; i < 9; i++) {
    const z = i * 5;
    // (the bark in long, twisting ridges, not rings)
    S.egg([1 + i * 0.4, 0, z + 4], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [12 - i * 0.3 + hash(i, 1, 6471) * 1.5, 11 - i * 0.25 + hash(i, 2, 6471) * 1.5, 7.5], (n, w) => {
      const ridge = Math.atan2(w[1], w[0] - 1) * 3 + w[2] * 0.12;
      return hash(Math.floor(ridge * 1.6), Math.floor(w[2] / 9), 6472) < 0.3 ? toneAt(n, BARK, -0.6) : toneAt(n, BARK, 0);
    }, 1);
  }
  // the split in it, toward the eye
  S.egg([5, 10.6, 18], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6, 0.6, 7], () => '#0e0c0e', 2);
  // the crown's knuckle and the withies up out of it, each with its leaves
  S.egg([4, 0, 46], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [14, 13, 6], (n, w) => (hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), 6470) < 0.3 ? toneAt(n, BARK, -0.4) : toneAt(n, BARK, 0.1)), 3);
  // (the withies: many, straight, thin, springing up out of its head and a little out, into a mop as round as it is
  // tall; their narrow leaves grey-green, in streaks up and out, the willow's silver catching here and there; a few
  // bare withies and leaf-blades stand out past the mop at its top)
  const SILVER: Ramp = ['#3e4436', '#545c4a', '#6c7462', '#868e7a', '#9ea692'];
  const WITHY: Ramp = ['#2a2418', '#3e3424', '#56482e', '#6e5e3a', '#86744a'];

  // (behind them all a dark heart to the mop, so what shows between the withies is shade, not the field)
  const LEAFY = SOFT_ID + 9;
  for (let j = 0; j < 3; j++) S.egg([4, 0, 58 + j * 9], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6 + j * 4, 6 + j * 4, 7], (n) => toneAt(n, LEAF, -0.9), LEAFY);
  // (the withies themselves, leaved all along, the leaves thickest toward the tips; all one soft thing, no ink
  // between them, only round the whole mop)
  for (let i = 0; i < 64; i++) {
    const a = hash(i, 1, 6473) * Math.PI * 2;
    const r = 2 + hash(i, 2, 6473) * 8;
    const out = 4 + hash(i, 3, 6473) * 20;
    const base: V3 = [4 + Math.cos(a) * r, Math.sin(a) * r, 48];
    const tip: V3 = add(base, [Math.cos(a) * out, Math.sin(a) * out, 36 + hash(i, 4, 6473) * 26 - out * 0.35]);
    S.rod(base, tip, 0.55, 0.3, WITHY, LEAFY);
    for (let k = 2; k <= 16; k++) {
      const t = k / 16;
      if (hash(i, k, 6475) > 0.35 + t * 0.6) continue;
      const p: V3 = [base[0] + (tip[0] - base[0]) * t, base[1] + (tip[1] - base[1]) * t, base[2] + (tip[2] - base[2]) * t];
      const bb = hash(i, k, 6476) * Math.PI * 2;
      const len = 3 + hash(i, k, 6477) * 2.5;
      const end: V3 = add(p, [Math.cos(bb) * len * 0.6 + Math.cos(a) * 1.2, Math.sin(bb) * len * 0.6 + Math.sin(a) * 1.2, -len * 0.55]);
      S.rod(p, end, 0.6, 0.4, hash(i, k, 6474) < 0.22 ? SILVER : LEAF, LEAFY);
    }
  }
  // (the withies' feet, bare, where they spring from the knuckle under the mop)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    S.rod([4 + Math.cos(a) * 6, Math.sin(a) * 6, 49], [4 + Math.cos(a) * 11, Math.sin(a) * 11, 60], 0.7, 0.5, WITHY, 4);
  }
  return done(S, 85, 196);
}

/** A HEDGE of hawthorn gone wild along a field's edge: dark and bristling, a few red haws in it (a dull red, never pink); along x (`k` 0) or along y (1). 190 x 130 at (95, 96). */
function hedge(k: number): Sprite {
  const S = turned(scene(190, 130, 95, 96), k);
  const THORN: Ramp = ['#1c2416', '#2a3620', '#3a4a2a', '#4c5e34', '#5e7040'];
  for (let i = 0; i < 34; i++) {
    const x = -42 + hash(i, 1, 6481) * 84;
    const z = 7 + hash(i, 2, 6481) * 14;
    S.egg([x, (hash(i, 3, 6481) - 0.5) * 10, z], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [4 + hash(i, 5, 6481) * 4, 5 + hash(i, 6, 6481) * 3, 5 + hash(i, 4, 6481) * 6], (n, w) => {
      if (hash(Math.floor(w[0] * 1.5), Math.floor(w[2] * 1.5), 6482) < 0.03) return '#7a3428';
      return hash(Math.floor(w[0] * 2), Math.floor(w[2] * 2) + Math.floor(w[1] * 2) * 7, 6483) < 0.3 ? toneAt(n, THORN, -0.4) : toneAt(n, THORN, 0);
    }, 1 + (i % 5));
  }
  return done(S, 95, 96);
}

/** A FIELD GATE: a five-barred gate of oak hung on a stout post, its latch on another; shut, or swung open; across x (`k` 0) or across y (1). 170 x 120 at (85, 90). */
function fieldGate(open: boolean, k: number): Sprite {
  const S = turned(scene(170, 120, 85, 90), k);
  for (const x of [-26, 26]) S.rod([x, 0, 0], [x, 0, 38], 2.4, 2.2, TIMBER, 1);
  const L = 48;
  const ang = open ? 1.3 : 0;
  const P = (a: number, z: number): V3 => [-24 + Math.cos(ang) * a, Math.sin(ang) * a, z];
  for (let i = 0; i < 5; i++) S.rod(P(0, 6 + i * 6.4), P(L, 6 + i * 6.4), 0.9, 0.9, OAK, 2);
  S.rod(P(0, 6), P(L * 0.9, 32), 0.9, 0.9, OAK, 2);
  for (const a of [0.5, L - 0.5]) S.rod(P(a, 4), P(a, 34), 1.2, 1.2, OAK, 2);
  S.ball([26, 0, 30], 1.2, IRON, 3);
  return done(S, 85, 90);
}

/** SHEETS BLOWN INTO THE CORN: blank pages off the drying lines, lying where the wind left them, one crumpled, one with the grey ghost of words in it. On the floor. 120 x 70 at (60, 35). */
function blownSheets(): Sprite {
  const S = scene(120, 70, 60, 35);
  for (let i = 0; i < 6; i++) {
    const a = hash(i, 1, 6491) * Math.PI * 2;
    const d = 4 + hash(i, 2, 6491) * 22;
    const b = hash(i, 3, 6491) * Math.PI;
    const ghost = i === 2;
    S.box([Math.cos(a) * d, Math.sin(a) * d * 0.8, 0.4], [[Math.cos(b), Math.sin(b), 0.08], [-Math.sin(b), Math.cos(b), 0], [0, 0, 1]], [6, 4.4, 0.3], (f, u, v, n) => (ghost && f === 4 && fr(v * 6) < 0.25 && u > 0.15 && u < 0.85 ? SHEET[1] : toneAt(n, SHEET, 0.15)), 1 + i);
  }
  S.egg([18, -10, 2.2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 2.6, 2.2], (n, w) => (hash(Math.floor(w[0] * 2), Math.floor(w[2] * 2), 6492) < 0.3 ? toneAt(n, SHEET, -0.4) : toneAt(n, SHEET, 0.1)), 9);
  return done(S, 60, 35);
}

/**
 * THE QUEST: THE MOULD AND DECKLE, A PAGE HALF MADE: the paper-maker's frame of oak with its fine wire screen, lifted
 * from the vat and left propped against a stone, a sheet half formed on it; and in the wet pulp of it, faint, the
 * words of the city swimming (the first page the Order made of its voices). Its own pale light. 120 x 120 at (60, 96).
 */
function mouldAndDeckle(): Sprite {
  const S = scene(120, 120, 60, 96);
  S.egg([-2, -8, 5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [10, 8, 6], (n) => toneAt(n, FIELDSTONE, 0.1), 1);
  // the frame, leaning back against the stone
  const lean = 0.42;
  const P = (x: number, h: number): V3 => [x, -Math.sin(lean) * h, Math.cos(lean) * h + 0.5];
  const W = 15;
  const Hh = 28;
  S.quad([P(-W, 0), P(W, 0), P(W, Hh), P(-W, Hh)], (u, v) => {
    if (u < 0.07 || u > 0.93 || v < 0.06 || v > 0.94) return fr(u * 20) < 0.1 ? OAK[1] : OAK[3];
    if (fr(u * 8) < 0.06) return OAK[1];
    // the sheet half formed: pulp over the screen's lower part, the words faint in it
    if (v < 0.62 + 0.08 * Math.sin(u * 9)) {
      if (fr(v * 8) < 0.16 && hash(Math.floor(u * 20), Math.floor(v * 8), 6501) < 0.6) return PULP[1];
      return PULP[4];
    }
    // the bare screen: fine wire over the dark
    return fr(u * 30) < 0.4 || fr(v * 30) < 0.4 ? IRON[2] : '#14121a';
  }, 2);
  return done(S, 60, 96, [{ at: [0, 0, 14], r: 34, color: '#e8e2d2', a: 0.35 }]);
}

/** A CRACKED MILLSTONE, lying flat in the yard: a great round of grey stone, its face dressed in radiating grooves, its eye at its middle, a crack across it, moss in the cracks. 150 x 100 at (75, 64). */
function millstone(): Sprite {
  const S = scene(150, 100, 75, 64);
  cylinder(S, 0, 0, 30, 0, 9, (n, a) => (fr(a * 3.1) < 0.06 ? toneAt(n, STONE, -0.6) : toneAt(n, STONE, 0)), 1, (a, rr) => {
    if (rr < 0.16) return '#0e0c12';
    if (rr < 0.22) return STONE[1];
    // the crack across it
    if (Math.abs(Math.sin(a - 0.7)) * rr < 0.02) return '#14121a';
    if (Math.abs(Math.sin(a - 0.7)) * rr < 0.05 && hash(Math.floor(a * 10), Math.floor(rr * 10), 6511) < 0.5) return '#4e5f36';
    // its dressing: grooves in quarters
    const q = fr(a / (Math.PI / 5) + rr * 0.6);
    if (q < 0.1) return STONE[1];
    return rr > 0.92 ? STONE[2] : STONE[3];
  });
  return done(S, 75, 64);
}

// =================================================================================================

let made: Piece[] | null = null;
/** FLOOR 13'S PIECES, the Palimpsest's: 25. */
export function millracePieces(): Piece[] {
  if (made) return made;
  made = [
    { name: 'the paper mill', kind: 'obstacle', frames: [paperMill()], shadow: 2.0 },
    // (frames: four turning, looking along +y; the same along +x)
    { name: 'the water wheel', kind: 'trap', frames: [0, 1].flatMap((k) => [0, 1, 2, 3].map((f) => waterWheel(f, k))), shadow: 1.0 },
    // (frames: shut and open along +y, shut and open along +x)
    { name: "the race's headgate", kind: 'gate', frames: [0, 1].flatMap((k) => [headgate(false, k), headgate(true, k)]), shadow: 0.9 },
    // (frames: whole; half there, while someone is behind it)
    { name: 'drying lines', kind: 'obstacle', frames: [dryingLines(false), dryingLines(true)], shadow: 1.0 },
    { name: 'a vat of pulp', kind: 'obstacle', frames: [pulpVat()], shadow: 0.55 },
    // (frames: at rest, the warning, falling, struck)
    { name: 'the stamping mill', kind: 'trap', frames: [0, 1, 2, 3].map(stampers), shadow: 0.8 },
    { name: 'the screw press', kind: 'obstacle', frames: [screwPress()], shadow: 0.6 },
    { name: 'reams bound for the city', kind: 'breakable', frames: [reams(false), reams(true)], shadow: 0.45 },
    { name: 'bales of rags', kind: 'breakable', frames: [ragBales(false), ragBales(true)], shadow: 0.4 },
    { name: "barrels of the Order's ink", kind: 'breakable', frames: [inkBarrels(false), inkBarrels(true)], shadow: 0.4 },
    { name: 'spilled pulp', kind: 'on the floor', frames: [spilledPulp()] },
    { name: 'emptied jars', kind: 'breakable', frames: [emptiedJars(false), emptiedJars(true)], shadow: 0.35 },
    { name: 'a footbridge over the race', kind: 'floor tile', frames: [footbridge(false), footbridge(true)] },
    { name: 'the cart bridge', kind: 'floor tile', frames: [cartBridge(false), cartBridge(true)] },
    { name: 'the mill bell on its gable (the Muffled Bell)', kind: 'obstacle', frames: [millBell(true), millBell(false, 0), millBell(false, 0.35), millBell(false, -0.35)], shadow: 0.7 },
    // (the Bells: quiet, awake, rung one way, rung back)
    { name: 'a farm bell on its post', kind: 'obstacle', frames: [0, 1, 2, 3].map(farmBell), shadow: 0.3 },
    { name: 'a scarecrow, gagged', kind: 'obstacle', frames: [scarecrow()], shadow: 0.35 },
    { name: 'stooks of corn', kind: 'breakable', frames: [stooks(false), stooks(true)], shadow: 0.55 },
    { name: 'a hay wain, abandoned', kind: 'obstacle', frames: [hayWain()], shadow: 1.3 },
    { name: 'a pollard willow', kind: 'obstacle', frames: [willow()], shadow: 0.7 },
    // (frames: along x, along y)
    { name: 'a hedge', kind: 'obstacle', frames: [hedge(0), hedge(1)], shadow: 1.0 },
    // (frames: shut and open across x, shut and open across y)
    { name: 'a field gate', kind: 'gate', frames: [0, 1].flatMap((k) => [fieldGate(false, k), fieldGate(true, k)]), shadow: 0.8 },
    { name: 'sheets blown into the corn', kind: 'on the floor', frames: [blownSheets()] },
    { name: 'the mould and deckle, a page half made', kind: 'quest', frames: [mouldAndDeckle()], shadow: 0.3 },
    { name: 'a cracked millstone', kind: 'obstacle', frames: [millstone()], shadow: 0.7 },
  ];
  return made;
}
