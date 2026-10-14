// FLOOR 7, THE LEDGE ROAD (THE QUEEN'S EYRIE): ITS PIECES, the first of them (a mock-up; nothing of the game
// imports it).
//
// The owner, 13 Oct 2026, to the Ledge Road's ground and sky (art/ledge.ts), drawn his way, by 21:03: “You got
// it that’s perfect”; asked which way the road goes: “Mostly one way, views at turns (Recommended)”, offered
// as: the trail runs mostly one way, cliff above and below as drawn; a few turns round the mountain open a view
// like this one; the boss's peak looks out over the city.
//
// THE FLOOR'S BOSS is the Carrion Queen, a huge cult-bound vulture nesting on an outcrop over the drop (plan's
// doc, his yes of 12 Oct, 18:07); his rule for a set of floors from the second on (10 Oct): “Going forward,
// let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” So this floor's pieces are the cliff
// trail's and the Queen's: the rope rail along the drop and the planks over its clefts; the rock that falls on
// it; the travellers' cairns; and the carrion: what her flock has picked clean, their nests, their bones and
// feathers, the cult's perches where its vultures are chained, its feather standards, its supply cart gone over.
//
// THE RULES THEY KEEP: crisp pixels, two to a game pixel; light from the upper left (floor 4's painter in depth,
// Scene); the indigo seam where one thing ends before another; in daylight on the mountain, a step quieter than
// the figures and duller than any word; nothing of a place glows (his Colour 3), and nothing pink or red: what
// the flock has picked is bone and dry hide, never raw. Each thing's soft shadow the game's (a piece's `shadow`).
//
// Measures as floor 4's Scene: across the floor 40 units to a tile (x down the screen to the right, y down it
// to the left), heights in picture pixels; each picture anchored at the middle of its foot. A piece "on the
// wall" stands at a wall's foot against its face, the face behind it (toward -x and -y).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { CLOTH } from './act1_cult';
import { Scene, XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { IRON, ROPE, TIMBER, add, beamAxes, cross, dot, finish, fr, mul, norm, rope, sub, tileUV, timber } from './floor6';
import type { Piece } from './floorkit';
import { GRAIN, hash } from './kit';
import type { Ramp } from './kit';

// =================================================================================================
// The colours: the mountain's and the flock's, in daylight

/** THE MOUNTAIN'S ROCK (art/ledge.ts L_ROCK), as what stands and lies: deep shade to lit. */
export const LROCK: Ramp = ['#3d3648', '#4f4962', '#6e6680', '#8c8494', '#a39ca8'];
/** Bone, picked clean and bleached by the wind: never pink. */
export const BONE: Ramp = ['#5d5249', '#7f7364', '#a59886', '#c8bca8', '#e0d7c5'];
/** The flock's feathers, near black, a little brown in the sun. */
export const FEATHER: Ramp = ['#1d1a20', '#2b2630', '#3d3640', '#544a52', '#6e6468'];
/** Sticks of a nest, grey-brown and dry. */
export const STICK: Ramp = ['#3b3029', '#544537', '#6e5d49', '#8a775e', '#a39073'];
/** Wood the wind has stripped and bleached. */
export const DRIFT: Ramp = ['#4e4850', '#6d666a', '#8e867f', '#aca397', '#c4bcaf'];
/** Dry hide, what is left on the bones. */
export const HIDE: Ramp = ['#3f3229', '#584536', '#735a45', '#8d7155', '#a58a6b'];
/** Sacking, the cult's stores. */
export const SACKING: Ramp = ['#3a3330', '#544a42', '#6e6253', '#8a7c68', '#a2937c'];
/** Snow lying in the shade of the rock. */
export const SNOWY: Ramp = ['#8e93a8', '#aab0c2', '#c6cad8', '#dfe1ea', '#eeeff4'];
/** The trail's own (art/ledge.ts L_ROAD): cracks, shade, body, lit, worn, grit. */
const L_ROAD = ['#4e4656', '#625a6a', '#766d7c', '#8a818e', '#a0979f', '#b8afb2'] as const;
/** Ice, grey-blue and pale (never the friend's cyan). */
export const ICE: Ramp = ['#7d8498', '#9aa1b4', '#b8bece', '#d4d9e4', '#eaedf3'];
/** Clay, the cult's jars. */
export const CLAY: Ramp = ['#4a3a33', '#665044', '#836856', '#9e8168', '#b5987c'];
/** A vulture's bare head and feet, dull grey-tan (never pink). */
export const HEAD: Ramp = ['#4a4240', '#655a55', '#83766d', '#9d9085', '#b3a79b'];

// =================================================================================================
// Little things: a bone, a feather, a stone

/** A BONE from a to b, its knobbed ends. */
function bone(S: Scene, a: V3, b: V3, r: number, id: number): void {
  S.rod(a, b, r, r * 0.85, BONE, id);
  S.ball(a, r * 1.45, BONE, id, undefined, 0.05);
  S.ball(b, r * 1.3, BONE, id, undefined, 0.05);
}

/** A FEATHER lying at `c` along `dir` (on the floor, or lying on something), `len` long: its vane dark, its quill pale. */
function feather(S: Scene, c: V3, dir: number, len: number, id: number, up = 0.1): void {
  const A: V3 = norm([Math.cos(dir), Math.sin(dir), up]);
  const B: V3 = norm(cross([0, 0, 1], A));
  const C: V3 = norm(cross(A, B));
  S.egg(c, [A, B, C], [len, len * 0.24, 0.5], (n, w) => {
    const q = sub(w, c);
    const along = dot(q, A) / len;
    const across = dot(q, B) / (len * 0.24);
    if (Math.abs(across) < 0.12 && along > -0.9) return BONE[3]; // the quill
    if (Math.abs(fr(along * 5 + across * 0.8) - 0.5) < 0.08) return FEATHER[0]; // a split in the vane
    return toneAt(n, FEATHER, across < 0 ? 0.1 : -0.05);
  }, id);
}

/** A FLAT STONE of the mountain, as stacked or fallen: faceted. */
function stone(S: Scene, c: V3, turn: number, r: V3, id: number, ramp: Ramp = LROCK): void {
  S.egg(c, beamAxes([0, 0, 0], [Math.cos(turn), Math.sin(turn), 0]), r, facetOf(ramp, 0.06), id);
}

// =================================================================================================
// THE TRAIL: its rope rail along the drop, its planks over a cleft, the rock fallen on it, a cairn

/**
 * THE ROPE RAIL along the drop, as the game lays it: a post wherever it likes along the trail's edge, about a
 * tile apart, and between each two a span of rope (`railSpan`). A POST: squared, wedged in a few stones, the
 * rope lashed round its head. Broken: the post leaning out over the drop, its ropes torn and dangling over
 * the edge. 64 x 64 at (32, 50).
 */
function railPost(broken: boolean): Sprite {
  const S = new Scene(new Px(64, 66), 32, 52);
  const out: V3 = norm([1, 1, 0]); // toward the eye, out over the drop
  const top: V3 = broken ? add(mul(out, 10), [0, 0, 23]) : [0, 0, 26];
  timber(S, [0, 0, 0], top, 1.5, 1);
  S.egg(add(top, [0, 0, -3]), XYZ, [2.2, 2.2, 1.6], (n) => toneAt(n, ROPE, 0.1), 2);
  for (let k = 0; k < 3; k++) stone(S, [Math.cos(k * 2.1) * 3, Math.sin(k * 2.1) * 3, 1.2], k, [2.6, 2, 1.4], 3);
  if (broken) {
    // the torn ropes, hanging off its head and down over the edge
    const head = add(top, [0, 0, -3]);
    rope(S, head, add(head, add(mul(out, 4), [-3, 3, -14])), 0, 4, 0.6);
    rope(S, add(head, [0, 0, -9]), add(head, add(mul(out, 6), [4, -2, -24])), 0, 5, 0.6);
  }
  return finish(S, 32, 52);
}

/**
 * A SPAN OF THE ROPE RAIL between two posts, the second `dx`, `dy` from the first (in the floor's units, 40 to
 * a tile): two ropes from post head to post head, sagging; anchored at the first post's foot. The game makes
 * one for each pair of posts it lays.
 */
export function railSpan(dx: number, dy: number): Sprite {
  const ox = Math.ceil(Math.max(0, -(dx - dy) * 0.8)) + 4;
  const w = Math.ceil(Math.abs(dx - dy) * 0.8) + 8;
  const oy = 30 + Math.ceil(Math.max(0, -(dx + dy) * 0.4));
  const h = oy + Math.ceil(Math.max(0, (dx + dy) * 0.4)) + 6;
  const S = new Scene(new Px(w, h), ox, oy);
  rope(S, [0, 0, 23], [dx, dy, 23], 2.4, 1, 0.6);
  rope(S, [0, 0, 13], [dx, dy, 13], 2, 2, 0.6);
  return finish(S, ox, oy);
}

/**
 * PLANKS OVER A CLEFT, a floor tile: a crack across the trail, dark and deep, and three planks laid over it
 * along the way the trail runs (along x, or along y), their ends on the rock, a stone on one to hold it.
 * 64 x 33 at (32, 0).
 */
function plankTile(alongY: boolean): Sprite {
  const p = new Px(64, 34);
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const along = alongY ? uv[1] : uv[0];
      const across = alongY ? uv[0] : uv[1];
      // the cleft, across the way, wandering; its near lip lit, its depth dark
      const mid = 32 + 5 * Math.sin(across / 9 + 1);
      const d = along - mid;
      const half = 9 + 2 * Math.sin(across / 5);
      if (Math.abs(d) < half && across > 2 && across < 62) p.set(px, py, Math.abs(d) > half - 2 ? (d < 0 ? LROCK[1] : LROCK[3]) : '#1a1622');
      // the planks along the way, three, each a little crooked, over the cleft's middle
      for (let k = 0; k < 3; k++) {
        const c0 = 18 + k * 11 + Math.floor(hash(k, 1, 960) * 2);
        const skew = (hash(k, 2, 960) - 0.5) * 0.12;
        const a = across - c0 - skew * along;
        if (a >= 0 && a < 9 && along > 8 + k * 2 && along < 56 - k) {
          const edge = a < 1.5 ? 3 : a >= 7.5 ? 1 : 2;
          const grain = Math.abs(fr(along / 13 + k * 0.3) - 0.5) < 0.04 ? 1 : edge;
          p.set(px, py, TIMBER[grain]);
        }
      }
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** A ROCKFALL: rock come down off the wall onto the trail: boulders heaped and split, scree spread round them, dust pale on the fresh breaks. 96 x 72 at (48, 50). */
function rockfall(): Sprite {
  const S = new Scene(new Px(96, 72), 48, 50);
  const rocks: [number, number, number, number][] = [[-6, -4, 11, 1], [10, 4, 8, 2], [-16, 8, 7, 3], [4, -14, 9, 4], [16, -10, 5, 5], [-4, 14, 5, 6], [-20, -8, 6, 7]];
  for (const [x, y, r, k] of rocks) {
    const turn = hash(k, 1, 961) * Math.PI;
    S.egg([x, y, r * 0.62], beamAxes([0, 0, 0], [Math.cos(turn), Math.sin(turn), 0.2]), [r * 1.2, r * 0.95, r * 0.75], (n) => {
      const c = facetOf(LROCK, -0.12)(n);
      return n[2] > 0.7 && hash(k, 2, 961) > 0.5 ? LROCK[4] : c; // a fresh break on top, pale
    }, k);
  }
  // the scree round it
  for (let i = 0; i < 26; i++) {
    const a = hash(i, 1, 962) * Math.PI * 2;
    const r = 14 + hash(i, 2, 962) * 18;
    const s = 1.2 + hash(i, 3, 962) * 1.6;
    stone(S, [Math.cos(a) * r, Math.sin(a) * r * 0.8, s * 0.5], a, [s * 1.2, s, s * 0.7], 20 + (i % 3));
  }
  return finish(S, 48, 50);
}

/** A CAIRN: flat stones of the mountain stacked to waist height by those who went this way before, a feather of the flock pushed in at its top. 44 x 68 at (22, 58). */
function cairn(): Sprite {
  const S = new Scene(new Px(44, 70), 22, 60);
  let z = 0;
  for (let i = 0; i < 7; i++) {
    const r = 9 - i * 0.9 + hash(i, 1, 963) * 1.4;
    const h = 2.6 + hash(i, 2, 963) * 1.2;
    const dx = (hash(i, 3, 963) - 0.5) * 2;
    const dy = (hash(i, 4, 963) - 0.5) * 2;
    stone(S, [dx, dy, z + h], hash(i, 5, 963) * Math.PI, [r * 1.1, r * 0.9, h], 1 + i);
    z += h * 1.75;
  }
  feather(S, [0.5, 0, z + 5], -0.6, 6, 10, 2.2);
  return finish(S, 22, 60);
}

// =================================================================================================
// THE CARRION: what the flock has picked clean; their nests, bones and feathers

/**
 * A PACK MULE, PICKED CLEAN: its ribs arched over the trail along x, its spine, its long skull, its legs'
 * bones sprawled; rags of dry hide on it; its pack saddle fallen off, a split sack beside it. 104 x 64 at
 * (52, 42).
 */
function muleCarcass(): Sprite {
  const S = new Scene(new Px(132, 80), 66, 52);
  // the spine, along x, low; the ribs arched up and over from it, on its near side
  const spine = (t: number): V3 => [-28 + t * 52, -2 + Math.sin(t * 3) * 1.4, 5 + Math.sin(t * Math.PI) * 3];
  for (let k = 0; k < 16; k++) S.ball(spine(k / 15), 2, BONE, 1, undefined, 0.05);
  // the ribs: hoops arched up from the spine and over, down to the ground on its near side
  for (let k = 0; k < 8; k++) {
    const s = spine(0.24 + k * 0.07);
    const len = 15 - Math.abs(k - 3.5) * 1.3;
    let prev = s;
    for (let j = 1; j <= 8; j++) {
      const a = (j / 8) * Math.PI * 0.95;
      const q: V3 = [s[0] + j * 0.25, s[1] + (1 - Math.cos(a)) * len * 0.55, s[2] + Math.sin(a) * len * 0.62];
      S.rod(prev, q, 0.9, 0.85, BONE, 2 + (k % 2));
      prev = q;
    }
  }
  // the skull, long, at the head end, lying on its side; its eye hole dark
  const sk: V3 = [33, 3, 4.4];
  S.egg(sk, beamAxes([0, 0, 0], [1, 0.3, 0]), [12, 4.6, 4.2], (n, w) => {
    const q = sub(w, sk);
    if (Math.hypot(q[0] + 3, q[2] - 1.2) < 1.6 && n[1] > 0.2) return '#2a2430';
    if (q[0] > 6 && n[2] > 0.1) return BONE[3];
    return toneAt(n, BONE, 0.05);
  }, 4);
  // the legs' bones, sprawled
  bone(S, [-22, 8, 1.6], [-40, 20, 1.4], 1.3, 5);
  bone(S, [-16, 10, 1.6], [-12, 30, 1.4], 1.3, 6);
  bone(S, [16, 8, 1.6], [26, 26, 1.4], 1.3, 7);
  bone(S, [12, -10, 1.6], [22, -26, 1.4], 1.3, 8);
  // rags of hide on the ribs and the hips
  S.egg([-18, 6, 11], beamAxes([0, 0, 0], [1, 0.2, 0.3]), [8, 5, 1.4], (n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 964) > 0.82 ? null : toneAt(n, HIDE, 0)), 9);
  // the pack saddle fallen off behind it, and a split sack, its grain spilt
  timber(S, [-8, -24, 3], [12, -21, 3], 1.6, 10);
  timber(S, [-5, -28, 5], [-2, -16, 8], 1.4, 11);
  S.egg([-26, -18, 4.5], beamAxes([0, 0, 0], [1, -0.4, 0]), [8, 5.4, 4.4], (n, w) => (w[0] < -30 && n[2] > 0.3 ? SACKING[1] : Math.abs(w[0] + 22) < 0.7 ? ROPE[2] : toneAt(n, SACKING, 0)), 12);
  for (let i = 0; i < 12; i++) S.ball([-40 + hash(i, 1, 965) * 10, -14 + hash(i, 2, 965) * 10, 0.8], 1, ['#5c5140', '#776a52', '#95866a', '#ad9e80', '#c2b394'], 13);
  return finish(S, 66, 52);
}

/** BONES AND FEATHERS, strewn: what drops from the flock's perches: small bones, a jaw, dark feathers lying every way. Two lookings. 68 x 40 at (34, 22). */
function bonesAndFeathers(k: number): Sprite {
  const S = new Scene(new Px(84, 50), 42, 28);
  for (let i = 0; i < 5; i++) {
    const a = hash(i, 1, 966 + k) * Math.PI * 2;
    const r = hash(i, 2, 966 + k) * 22;
    const c: V3 = [Math.cos(a) * r, Math.sin(a) * r * 0.8, 1.1];
    const t = hash(i, 3, 966 + k) * Math.PI;
    const l = 4 + hash(i, 4, 966 + k) * 5;
    bone(S, add(c, [Math.cos(t) * -l, Math.sin(t) * -l, 0]), add(c, [Math.cos(t) * l, Math.sin(t) * l, 0]), 0.95, 1 + i);
  }
  for (let i = 0; i < 6; i++) {
    const a = hash(i, 5, 966 + k) * Math.PI * 2;
    const r = 4 + hash(i, 6, 966 + k) * 24;
    feather(S, [Math.cos(a) * r, Math.sin(a) * r * 0.8, 0.6], hash(i, 7, 966 + k) * Math.PI * 2, 6 + hash(i, 8, 966 + k) * 4, 10 + i);
  }
  return finish(S, 42, 28);
}

/**
 * A VULTURE'S NEST on the trail's edge: a great ragged ring of sticks heaped wide and low, bones of what was
 * brought woven in, its hollow lined with dark down and feathers. 100 x 64 at (50, 40).
 */
function nest(): Sprite {
  const S = new Scene(new Px(100, 64), 50, 40);
  // the sticks, round and round the ring, each leaning in, a few sticking out
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2 + hash(i, 1, 967) * 0.4;
    const r = 15 + hash(i, 2, 967) * 6;
    const z = 1.5 + (i % 3) * 2.2 + hash(i, 3, 967);
    const t = a + Math.PI / 2 + (hash(i, 4, 967) - 0.5) * 1.2;
    const l = 6 + hash(i, 5, 967) * 6;
    const c: V3 = [Math.cos(a) * r, Math.sin(a) * r, z];
    const d: V3 = [Math.cos(t) * l, Math.sin(t) * l, (hash(i, 6, 967) - 0.5) * 3];
    S.rod(sub(c, d), add(c, d), 0.75, 0.6, STICK, 1 + (i % 4));
  }
  // its hollow, lined with down
  S.egg([0, 0, 2.5], XYZ, [15, 13, 2.2], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 968) > 0.7 ? FEATHER[3] : toneAt(n, FEATHER, -0.1)), 5);
  // bones woven in
  bone(S, [-18, 6, 6], [-8, 16, 5], 0.9, 6);
  bone(S, [12, -16, 6], [20, -6, 7], 0.8, 7);
  feather(S, [6, 4, 4.4], 0.8, 6, 8, 0.2);
  feather(S, [-6, -4, 4.2], 2.4, 5, 9, 0.2);
  return finish(S, 50, 40);
}

/** THE GREAT EGG, a quest piece: one of the Queen's, pale and heavy, speckled dark, lying in a scrape of down. 44 x 44 at (22, 34). */
function greatEgg(): Sprite {
  const S = new Scene(new Px(44, 44), 22, 34);
  S.egg([0, 0, 0.6], XYZ, [11, 9, 1], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 969) > 0.6 ? FEATHER[3] : FEATHER[2]), 1);
  const c: V3 = [0, 0, 7];
  S.egg(c, beamAxes([0, 0, 0], [1, 0.4, 0.15]), [9, 6.5, 6.5], (n, w) => {
    const q = sub(w, c);
    if (hash(Math.floor(q[0] * 0.8), Math.floor(q[1] * 0.8 + q[2]), 970) > 0.86) return BONE[1]; // its speckles
    return toneAt(n, BONE, 0.12);
  }, 2);
  return finish(S, 22, 34);
}

// =================================================================================================
// THE CULT'S: its perch for its chained vultures, its feather standard, its supply cart gone over

/**
 * THE CULT'S PERCH: a tall pole, a crossbar lashed at its head where the cult's vultures are chained; the
 * chain hanging, a hood of dark leather on its end; a strip of the cult's violet cloth tied round the pole;
 * bones heaped at its foot. Tall: see it through. 72 x 132 at (36, 118).
 */
function cultPerch(): Sprite {
  const S = new Scene(new Px(72, 134), 36, 120);
  timber(S, [0, 0, 0], [0, 0, 96], 2, 1, [0.95]);
  timber(S, [0, -14, 90], [0, 14, 90], 1.5, 2);
  S.egg([0, 0, 90], XYZ, [2.8, 2.8, 2.2], (n) => toneAt(n, ROPE, 0.1), 3);
  // the chain from the crossbar's end, and the hood on it
  for (let z = 87; z > 64; z -= 2.2) S.ball([0, 12, z], 0.9, IRON, 4, undefined, 0.1);
  S.egg([0, 12, 60], beamAxes([0, 0, 0], [0.2, 0.3, 1]), [3.6, 3, 4.6], (n, w) => (w[2] < 57 ? null : toneAt(n, HIDE, -0.1)), 5);
  // the cult's cloth round the pole, its ends hanging
  S.egg([0, 0, 70], XYZ, [2.6, 2.6, 3], (n) => toneAt(n, CLOTH, 0.1), 6);
  S.quad([[1.6, 1.6, 70], [3, 3.4, 70], [3.4, 4, 54], [2.4, 2.6, 56]], (_u, v) => (v > 0.85 ? CLOTH[1] : CLOTH[3]), 7);
  // bones heaped at its foot
  for (let i = 0; i < 7; i++) {
    const a = hash(i, 1, 971) * Math.PI * 2;
    const r = 4 + hash(i, 2, 971) * 9;
    const c: V3 = [Math.cos(a) * r, Math.sin(a) * r, 1 + (i % 3)];
    const t = hash(i, 3, 971) * Math.PI;
    bone(S, add(c, [Math.cos(t) * -4, Math.sin(t) * -4, 0]), add(c, [Math.cos(t) * 4, Math.sin(t) * 4, 1]), 0.8, 8 + i);
  }
  S.egg([6, 6, 3], XYZ, [3.4, 3, 3], (n, w) => (w[0] > 8.4 && n[2] < 0.5 ? '#2a2430' : toneAt(n, BONE, 0.05)), 20); // a skull among them
  return finish(S, 36, 120);
}

/**
 * THE CULT'S FEATHER STANDARD: a pole topped with a crossbar, the flock's black feathers hung from it in
 * bunches on cords and a strip of the cult's violet cloth between them. Tall: see it through. 60 x 128 at
 * (30, 116).
 */
function featherStandard(): Sprite {
  const S = new Scene(new Px(60, 130), 30, 118);
  timber(S, [0, 0, 0], [0, 0, 100], 1.6, 1);
  timber(S, [0, -12, 92], [0, 12, 92], 1.2, 2);
  for (const y of [-10, -4, 4, 10]) {
    S.rod([0, y, 92], [0, y, 84 - Math.abs(y) * 0.3], 0.4, 0.4, ROPE, 3);
    for (let k = 0; k < 3; k++) {
      const a = Math.PI / 2 + (k - 1) * 0.35;
      const c: V3 = [0.6 * k, y + (k - 1) * 1.5, 80 - Math.abs(y) * 0.3 - k];
      const A: V3 = norm([Math.cos(a) * 0.2, Math.sin(a) * 0.15, -1]);
      const B: V3 = norm(cross(A, [1, 0, 0]));
      S.egg(c, [A, B, norm(cross(A, B))], [6, 1.6, 0.5], (n) => toneAt(n, FEATHER, 0.05), 4 + k);
    }
  }
  S.quad([[1, -3, 91], [1, 3, 91], [1, 2.6, 70], [1, -2.8, 72]], (u, v) => (v > 0.9 ? CLOTH[1] : Math.abs(u - 0.5) < 0.06 ? CLOTH[2] : CLOTH[3]), 8);
  return finish(S, 30, 118);
}

/**
 * THE CULT'S SUPPLY CART, GONE OVER: a two-wheeled cart tipped on its side across the trail, one wheel in
 * the air, the other broken off and lying; its sacks and a crate spilt out of it. 116 x 88 at (58, 60).
 */
function supplyCart(): Sprite {
  const S = new Scene(new Px(116, 90), 58, 62);
  // its bed on its side: the floor of it upright, facing the eye along +y, its sides along the trail
  const bed: V3 = [0, -4, 13];
  S.box(bed, XYZ, [24, 3, 13], (f, u, v, n) => {
    if (f === 2 && Math.abs(fr(v * 4) - 0.5) < 0.05) return TIMBER[1];
    if (f === 2 && (u < 0.05 || u > 0.95)) return toneAt(n, IRON, 0.2);
    return toneAt(n, TIMBER, 0);
  }, 1);
  timber(S, [-24, 0, 1.5], [24, 0, 1.5], 1.6, 2); // its side board along the ground
  // the shafts, sticking out sideways
  timber(S, [24, -2, 6], [46, -2, 9], 1.2, 3);
  timber(S, [24, -2, 20], [46, -2, 23], 1.2, 3);
  // the wheel in the air, flat to the eye: rim, spokes, hub
  const wc: V3 = [4, -8, 27];
  const Wn: V3 = [0, 0, 1];
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    S.ball(add(wc, [Math.cos(a) * 11, Math.sin(a) * 11, 0]), 1.3, TIMBER, 4, undefined, 0.1);
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    S.rod(wc, add(wc, [Math.cos(a) * 10, Math.sin(a) * 10, 0]), 0.6, 0.6, TIMBER, 5);
  }
  S.ball(add(wc, mul(Wn, 1)), 2.2, IRON, 6, undefined, 0.1);
  // the other wheel, off and lying flat beside it, two spokes gone
  const lw: V3 = [-30, 14, 1.4];
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    if (k > 30 && k < 35) continue;
    S.ball(add(lw, [Math.cos(a) * 10, Math.sin(a) * 10, 0]), 1.2, TIMBER, 7, undefined, 0.1);
  }
  for (let k = 0; k < 6; k++) if (k !== 2) S.rod(lw, add(lw, [Math.cos(k + 0.2) * 9, Math.sin(k + 0.2) * 9, 0]), 0.6, 0.6, TIMBER, 8);
  // the sacks and a crate, spilt toward the eye
  const sacks: [number, number, number][] = [[-8, 12, 1], [8, 14, 0.4], [20, 10, 2.1]];
  sacks.forEach(([x, y, t], i) => {
    const c: V3 = [x, y, 5];
    S.egg(c, beamAxes([0, 0, 0], [Math.cos(t), Math.sin(t), 0]), [8, 5.6, 5], (n, w) => {
      const q = sub(w, c);
      if (Math.abs(q[2] - 1.5) < 0.6 && n[2] > 0) return SACKING[1]; // the cord round it
      return toneAt(n, SACKING, 0);
    }, 9 + i);
  });
  S.box([-14, 26, 7], beamAxes([0, 0, 0], [1, 0.3, 0]), [7, 6, 7], (f, u, v, n) => (Math.abs(fr(v * 3) - 0.5) < 0.07 && f !== 4 ? TIMBER[1] : toneAt(n, TIMBER, 0.05)), 12);
  return finish(S, 58, 62);
}

// =================================================================================================
// THE MOUNTAIN'S: a dead snag the wind has twisted

/** A DEAD SNAG: a pine the wind killed long ago, bark gone, its trunk twisted and bleached, a few broken limbs reaching away from the wind. For the trail's edge or the mountainside. Tall: see it through. 88 x 124 at (44, 116). */
function deadSnag(): Sprite {
  const S = new Scene(new Px(88, 126), 44, 118);
  const trunk = (t: number): V3 => [Math.sin(t * 2.6) * 4 + t * 6, Math.cos(t * 2) * 2 - t * 4, t * 92];
  for (let k = 0; k < 14; k++) {
    const a = trunk(k / 14);
    const b = trunk((k + 1) / 14);
    S.rod(a, b, 4.2 - k * 0.24, 4 - (k + 1) * 0.24, DRIFT, 1);
  }
  const limbs: [number, number, number, number][] = [[0.42, -0.8, 22, 10], [0.6, 2.4, 18, 6], [0.76, -0.4, 16, 12], [0.88, 2.0, 12, 8]];
  limbs.forEach(([t, a, l, up], i) => {
    const s = trunk(t);
    const m = add(s, [Math.cos(a) * l * 0.55, Math.sin(a) * l * 0.55, up * 0.6]);
    const e = add(s, [Math.cos(a + 0.4) * l, Math.sin(a + 0.4) * l, up]);
    S.rod(s, m, 1.6, 1.1, DRIFT, 2 + i);
    S.rod(m, e, 1.1, 0.6, DRIFT, 2 + i);
  });
  // its roots gripping the rock
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.5;
    S.rod([0, 0, 2], [Math.cos(a) * 10, Math.sin(a) * 10, 0.4], 2.4, 1.2, DRIFT, 8);
  }
  return finish(S, 44, 118);
}

// =================================================================================================
// ON THE WALL: against the mountain's wall over the trail

/** IRON RINGS IN THE WALL: pitons driven into the face, a ring in each, chains hanging from them where the cult tethers its beasts and captives. 56 x 100 at (28, 92). */
function wallChains(): Sprite {
  const S = new Scene(new Px(56, 100), 28, 92);
  for (const [x, z, len] of [[-10, 62, 26], [10, 70, 40]] as const) {
    const at: V3 = [x * 0.7, -x * 0.7 - 2, z];
    S.rod(add(at, [-1, -1, 0]), add(at, [1.4, 1.4, 0]), 1.1, 0.8, IRON, 1);
    for (let a = 0; a < Math.PI * 2; a += 0.35) S.ball(add(at, [1.6 + Math.cos(a) * 0.4, 1.6 + Math.cos(a) * 0.4, Math.sin(a) * 2.4 - 2.4]), 0.55, IRON, 2, undefined, 0.15);
    for (let d = 5; d < len; d += 2.2) S.ball(add(at, [1.8 + d * 0.04, 1.8 + d * 0.04, -d]), 0.85, IRON, 3, undefined, 0.1);
  }
  return finish(S, 28, 92);
}

/** A NEST IN THE WALL: a shelf of rock jutting from the face, a nest of sticks on it, a feather caught. 72 x 120 at (36, 110). */
function wallNest(): Sprite {
  const S = new Scene(new Px(72, 122), 36, 112);
  const z = 64;
  // the shelf
  S.box([-2, -4, z], XYZ, [14, 7, 3.4], (f, _u, _v, n) => (f === 4 ? LROCK[3] : toneAt(n, LROCK, 0)), 2);
  // the nest on it
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const c: V3 = [-2 + Math.cos(a) * 8, -4 + Math.sin(a) * 4.4, z + 4 + (i % 2) * 1.6];
    const t = a + Math.PI / 2 + (hash(i, 1, 973) - 0.5);
    const d: V3 = [Math.cos(t) * 4.5, Math.sin(t) * 3, (hash(i, 2, 973) - 0.5) * 2];
    S.rod(sub(c, d), add(c, d), 0.7, 0.55, STICK, 3);
  }
  feather(S, [6, 2, z + 4], 0.4, 5, 4, -0.6);
  return finish(S, 36, 112);
}

/** ICICLES UNDER A LIP OF THE WALL: where water seeps out of a crack in the face and freezes, a lip of rock and a fringe of icicles hanging from it, the face glazed under them. 72 x 104 at (36, 96). */
function wallIcicles(): Sprite {
  const S = new Scene(new Px(72, 106), 36, 98);
  const z = 78;
  S.box([-2, -6, z], XYZ, [16, 4, 2.4], (f, _u, _v, n) => (f === 4 ? SNOWY[3] : toneAt(n, LROCK, -0.05)), 1);
  for (let k = 0; k < 9; k++) {
    const u = -15 + k * 3.6 + hash(k, 1, 974) * 1.5;
    const len = 6 + hash(k, 2, 974) * 18 * (1 - Math.abs(k - 4) / 6);
    const top: V3 = [u * 0.7 - 2 + 1.6, -u * 0.7 - 6 + 1.6, z - 2.2];
    S.rod(top, add(top, [0, 0, -len]), 1.3, 0.3, ICE, 2 + (k % 2));
  }
  // the glaze down the face under them
  S.quad([[-12, -8, z - 3], [10, -8, z - 3], [8, -8, z - 34], [-8, -8, z - 30]], (u, v) => (hash(Math.floor(u * 12), Math.floor(v * 10), 975) > 0.55 ? ICE[2] : null), 4);
  return finish(S, 36, 98);
}

// =================================================================================================
// WHAT BREAKS: the cult's water jar and its basket of the flock's feathers

/** A WATER JAR of the cult's, clay, round-bellied, a stone on its mouth; broken: its shards every way and the dark of the spilt water. 44 x 54 at (22, 46). */
function waterJar(broken: boolean): Sprite {
  const S = new Scene(new Px(44, 54), 22, 46);
  if (!broken) {
    const R = (z: number): number => (z < 22 ? 5 + 5.4 * Math.sin((z / 22) * Math.PI * 0.95) : 3.2);
    for (let z = 0; z <= 27; z += 0.5) {
      const r = R(z);
      for (let a = -Math.PI; a < Math.PI; a += 0.09) {
        const n: V3 = norm([Math.cos(a), Math.sin(a), z < 22 ? -Math.cos((z / 22) * Math.PI) * 0.6 : 0]);
        if (dot(n, [0.61, 0.61, 0.5]) < -0.25) continue;
        const q: V3 = [Math.cos(a) * r, Math.sin(a) * r, z];
        const [x, y] = S.at(q);
        const band = Math.abs(z - 15) < 0.8;
        S.put(Math.round(x), Math.round(y), dot(q, [0.61, 0.61, 0.5]), band ? CLAY[1] : z > 26 ? CLAY[3] : toneAt(n, CLAY, 0), 1, z);
      }
    }
    stone(S, [0, 0, 28.4], 0.6, [3.8, 3.4, 1.6], 2);
  } else {
    S.egg([1, 1, 0], XYZ, [15, 12, 0.4], (_n, w) => (Math.hypot((w[0] - 1) / 15, (w[1] - 1) / 12) > 0.8 ? '#6c6674' : '#5d5868'), 1);
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + hash(k, 1, 976);
      const r = 4 + hash(k, 2, 976) * 9;
      const c: V3 = [Math.cos(a) * r, Math.sin(a) * r, 1.2];
      const t = hash(k, 3, 976) * Math.PI;
      S.egg(c, beamAxes([0, 0, 0], [Math.cos(t), Math.sin(t), 0.2]), [3 + hash(k, 4, 976) * 2, 2, 0.9], (n) => toneAt(n, CLAY, 0.05), 2 + k);
    }
    stone(S, [-6, 6, 1.6], 0.6, [3.8, 3.4, 1.6], 12);
  }
  return finish(S, 22, 46);
}

/** A BASKET OF THE FLOCK'S FEATHERS, wicker, that the cult gathers for its standards and its fletching, black feathers standing up out of it; broken: tipped on its side, the feathers spilt across the trail. 48 x 50 at (24, 40). */
function featherBasket(broken: boolean): Sprite {
  const S = new Scene(new Px(52, 52), 26, 42);
  const weave = (n: V3, w: V3, c: V3): string => {
    const q = sub(w, c);
    const a = Math.atan2(q[1], q[0]);
    const row = Math.floor(q[2] / 2.2);
    if (Math.abs(fr(a * 2 + row * 0.5) - 0.5) < 0.12) return toneAt(n, STICK, -0.3);
    return toneAt(n, STICK, 0.05);
  };
  if (!broken) {
    const c: V3 = [0, 0, 9];
    S.egg(c, XYZ, [9, 9, 9], (n, w) => (w[2] > 16 ? null : weave(n, w, c)), 1);
    S.egg([0, 0, 16], XYZ, [8.4, 8.4, 0.8], (_n, w) => (Math.hypot(w[0], w[1]) > 7.2 ? STICK[3] : FEATHER[1]), 2);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const base: V3 = [Math.cos(a) * 4, Math.sin(a) * 4, 15];
      const A: V3 = norm([Math.cos(a) * 0.4, Math.sin(a) * 0.4, 1]);
      const B: V3 = norm(cross(A, [Math.sin(a), -Math.cos(a), 0]));
      S.egg(add(base, mul(A, 5)), [A, B, norm(cross(A, B))], [6, 1.6, 0.5], (n) => toneAt(n, FEATHER, 0.05), 3 + k);
    }
  } else {
    const c: V3 = [-4, -4, 7];
    S.egg(c, beamAxes([0, 0, 0], [0.7, 0.7, 0]), [9, 8, 8], (n, w) => (dot(sub(w, c), norm([0.7, 0.7, 0])) > 6 ? null : weave(n, w, c)), 1);
    S.egg(add(c, [4.6, 4.6, 0]), beamAxes([0, 0, 0], [0.7, 0.7, 0]), [1, 7.4, 7.4], () => FEATHER[0], 2);
    for (let k = 0; k < 9; k++) {
      const a = hash(k, 1, 977) * 1.6 - 0.1;
      const r = 6 + hash(k, 2, 977) * 14;
      feather(S, [Math.cos(a) * r, Math.sin(a) * r, 0.6], hash(k, 3, 977) * 6.3, 5 + hash(k, 4, 977) * 2, 3 + k);
    }
  }
  return finish(S, 26, 42);
}

// =================================================================================================
// THE TRAP: where the ledge crumbles under you

/** The ring where the ledge will break, in a tile's own measure (64 to a tile): how far out of it (under 0 inside). */
const breakRing = (U: number, V: number): number => {
  const a = Math.atan2(V - 32, U - 32);
  const r = 21 + 3 * Math.sin(a * 3 + 1) + 2 * Math.sin(a * 7);
  return Math.hypot(U - 32, V - 32) - r;
};
/** A CRACK in a tile's own measure: a wandering line from one side to the other; how far from it. */
const crackAt = (U: number, V: number, k: number): number => {
  const along = k % 2 ? V : U;
  const across = k % 2 ? U : V;
  return Math.abs(across - (20 + k * 9 + 6 * Math.sin(along / 7 + k * 2) + 3 * Math.sin(along / 2.6 + k)));
};

/**
 * THE CRUMBLING LEDGE, a trap: a tile of the trail that gives way under whoever stands on it. Laid over the
 * trail's own ground (only what changes is painted). 0: the trail, a few hairline cracks (as any); 1 its
 * warning: the cracks open round the place, grit trickling into them; 2: it gives, the rock inside sinking,
 * dark between; 3: gone, a ragged hole down into the drop. 64 x 33 at (32, 0).
 */
function crumblingLedge(f: number): Sprite {
  const p = new Px(64, 34);
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const [U, V] = uv;
      const ring = breakRing(U, V);
      // the hairline cracks, as any of the trail's
      if (f === 0) {
        if ((crackAt(U, V, 0) < 0.8 || crackAt(U, V, 1) < 0.8) && U > 6 && U < 58 && V > 6 && V < 58) p.set(px, py, L_ROAD[0]);
        continue;
      }
      if (f >= 1 && Math.abs(ring) < (f === 1 ? 1.1 : 1.8)) {
        p.set(px, py, ring < 0 ? L_ROAD[4] : '#1a1622');
        continue;
      }
      if (ring < 0) {
        if (f === 1) {
          if (crackAt(U, V, 2) < 0.9) p.set(px, py, L_ROAD[0]);
          if (hash(px >> 1, py, 978) > 0.93) p.set(px, py, L_ROAD[5]); // grit, two pixels at a time
        } else if (f === 2) {
          // the rock inside sunk and tilted: darker, split across, the gaps dark
          const split = crackAt(U, V, 2) < 1.6 || crackAt(U, V, 3) < 1.4;
          p.set(px, py, split ? '#1a1622' : (U + V) % 9 < 1 ? L_ROAD[0] : L_ROAD[ring < -17 ? 1 : 2]);
        } else {
          // gone: down into the drop; the near rim's broken edge lit, the far side's in shade
          const rim = ring > -4;
          p.set(px, py, rim ? (V + U > 64 ? L_ROAD[4] : '#2a2434') : '#120e18');
        }
      }
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** CRACKS ACROSS THE TRAIL, a floor tile: the rock split where the mountain shifted, the cracks dark, their near lips lit, grit in them; across x, or across y. Laid over the trail's ground. 64 x 33 at (32, 0). */
function trailCracks(alongY: boolean): Sprite {
  const p = new Px(64, 34);
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const U = alongY ? uv[1] : uv[0];
      const V = alongY ? uv[0] : uv[1];
      const main = crackAt(U, V + 8, 0);
      const branch = crackAt(U * 0.7 + 10, V, 3);
      const wide = 2.6 + 1.2 * Math.sin(U / 6);
      if (main < wide && U > 2 && U < 62) p.set(px, py, main < wide - 1.2 ? '#1a1622' : L_ROAD[main > 0 ? 4 : 1]);
      else if (main < wide + 2.5 && U > 4 && U < 60 && hash(px >> 1, py, 984) > 0.8) p.set(px, py, L_ROAD[5]); // grit along it, two pixels at a time
      else if (branch < 1 && U > 18 && U < 52 && V > 8 && V < 44) p.set(px, py, L_ROAD[0]);
    }
  }
  return p.sprite(32, 0, GRAIN);
}

// =================================================================================================
// THE CULT'S BARRICADE across the trail, its gate

/**
 * THE CULT'S BARRICADE, the trail's gate: sharpened stakes leaning out toward whoever comes, lashed to a beam,
 * hides stretched between them, a skull on the tallest, a strip of the cult's violet; along x or along y
 * (across the trail). Open: its middle stakes dragged aside, the hide hanging torn. 120 x 96 at (60, 70).
 */
function barricade(alongY: boolean, open: boolean): Sprite {
  const S = new Scene(new Px(124, 98), 62, 72);
  const L: V3 = alongY ? [0, 1, 0] : [1, 0, 0];
  const out: V3 = alongY ? [1, 0, 0] : [0, 1, 0];
  const at = (l: number, o: number, z: number): V3 => add(add(mul(L, l), mul(out, o)), [0, 0, z]);
  timber(S, at(-30, 0, 18), at(30, 0, 18), 1.4, 1);
  for (let k = 0; k < 9; k++) {
    const l = -28 + k * 7;
    if (open && k >= 3 && k <= 5) continue;
    const h = 30 + hash(k, 1, 979) * 8 + (k === 4 ? 8 : 0);
    const foot = at(l, -3, 0);
    const tip = at(l + (hash(k, 2, 979) - 0.5) * 3, 9, h);
    S.rod(foot, tip, 1.5, 0.4, TIMBER, 2 + (k % 2));
  }
  // the hides between, lashed to the beam
  for (const [a, b] of open ? [[-28, -9], [9, 28]] : [[-28, -9], [-7, 7], [9, 28]]) {
    S.quad([at(a, 2.6, 26), at(b, 2.6, 26), at(b, 4.6, 8), at(a, 4.6, 8)], (u, v) => (hash(Math.floor(u * 12), Math.floor(v * 8), 980) > 0.92 ? HIDE[1] : v > 0.92 ? HIDE[3] : HIDE[2]), 10);
  }
  if (open) {
    // the middle stakes dragged aside, lying; the torn hide
    for (let k = 0; k < 3; k++) S.rod(at(-4 + k * 3, 10 + k * 3, 1.5), at(14 + k * 2, 22 + k * 2, 1.5), 1.4, 0.5, TIMBER, 11 + k);
    S.quad([at(-7, 2.6, 26), at(-2, 2.6, 26), at(-1, 6, 4), at(-6, 5, 10)], () => HIDE[1], 14);
  } else {
    // a skull on the tallest, and the cult's violet tied under it
    const t = at(0, 9, 46);
    S.egg(t, XYZ, [3.6, 3.2, 3.4], (n, w) => (w[2] < t[2] - 0.5 && n[1] + n[0] > 0.6 && Math.abs(w[0] - w[1]) < 2.6 ? '#2a2430' : toneAt(n, BONE, 0.05)), 15);
    S.egg(at(0, 6, 36), XYZ, [2.2, 2.2, 2.4], (n) => toneAt(n, CLOTH, 0.1), 16);
  }
  return finish(S, 62, 72);
}

// =================================================================================================
// THE HEIGHTS: snow, and the flock's own

/** SNOW LYING in the lee of the rock: a low drift, its wind-carved ridge lit, a stone or two showing through. Two lookings. 80 x 40 at (40, 26). */
function snowDrift(k: number): Sprite {
  const S = new Scene(new Px(84, 42), 42, 28);
  const lobes: [number, number, number, number, number][] = k ? [[0, 0, 22, 12, 8], [-14, 6, 12, 8, 5]] : [[0, 0, 18, 14, 9], [12, -6, 12, 9, 6], [-10, 10, 9, 7, 4]];
  lobes.forEach(([x, y, rx, ry, rz], i) => {
    S.egg([x, y, 0], beamAxes([0, 0, 0], [1, (i - 0.5) * 0.4, 0]), [rx, ry, rz], (n, w) => {
      // its wind-carved ridge: lit sharply on the side to the light
      if (n[2] > 0.9 && hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), 981 + k) > 0.75) return SNOWY[4];
      return toneAt(n, SNOWY, -0.18);
    }, 1);
  });
  stone(S, [6 - k * 12, 4, 2.4], 0.8, [3.4, 2.8, 2.6], 2);
  return finish(S, 42, 28);
}

/** A DEAD VULTURE of the flock, lying on its back where it fell, its great wings spread on the rock, the paler feathers under them, its bare grey head and pale ruff, its hooked beak, its feet curled. 120 x 64 at (60, 40). */
function deadVulture(): Sprite {
  const S = new Scene(new Px(124, 66), 62, 42);
  // its wings, spread out to either side across the body (along y), swept back a little, fingered at their tips
  for (const side of [-1, 1]) {
    const root: V3 = [2, side * 5, 2.4];
    const tip: V3 = [-6, side * 36, 1.2];
    const tipBack: V3 = [-14, side * 33, 1];
    const rootBack: V3 = [-10, side * 5, 2];
    S.quad([root, tip, tipBack, rootBack], (u, v) => {
      if (u > 0.74 && fr(v * 5) < 0.4) return null; // the fingered primaries
      if (Math.abs(fr(u * 10 + v * 0.4) - 0.5) < 0.06) return FEATHER[0];
      return v > 0.55 ? FEATHER[4] : v > 0.3 ? FEATHER[3] : FEATHER[2]; // the paler feathers under the wing, toward its trailing edge
    }, 2 + (side > 0 ? 1 : 0));
  }
  // its body, on its back, between them; its tail fanned behind
  S.egg([-2, 0, 4.8], beamAxes([0, 0, 0], [1, 0, 0]), [10, 6.6, 4.6], (n) => toneAt(n, FEATHER, 0.1), 1);
  S.quad([[-11, -4, 2], [-11, 4, 2], [-20, 6, 1], [-20, -6, 1]], (u, v) => (Math.abs(fr(u * 5) - 0.5) < 0.1 ? FEATHER[0] : v > 0.7 ? FEATHER[3] : FEATHER[2]), 4);
  // its pale ruff, its bare grey neck lolling to one side, its head and hooked beak
  S.egg([9, 0, 4.4], XYZ, [3.4, 5, 3.2], (n) => toneAt(n, BONE, 0.1), 5);
  S.rod([11, 1, 4], [17, 7, 1.8], 1.7, 1.5, HEAD, 6);
  S.egg([19.4, 8.6, 2], beamAxes([0, 0, 0], [0.8, 0.6, 0]), [3.2, 2.4, 2.1], (n) => toneAt(n, HEAD, 0.05), 7);
  S.rod([22, 10.4, 1.8], [24.4, 12, 0.9], 1, 0.45, BONE, 8);
  // its feet, curled, up in the air
  for (const y of [-2.4, 2.4]) S.rod([-2, y, 8.6], [-4, y * 1.4, 13], 0.8, 0.6, HEAD, 9);
  return finish(S, 62, 42);
}

/** A PERCHING ROCK at the trail's edge: a pinnacle of the mountain's rock where the flock sits to watch the road, its top whitened by them, a feather or two at its foot. Tall: see it through. 64 x 112 at (32, 100). */
function perchRock(): Sprite {
  const S = new Scene(new Px(68, 114), 34, 102);
  // a crag of the mountain's rock in blocks, each turned and set back on the one under it, tapering up
  const tiers: [number, number, number, number][] = [[0, 12, 10, 16], [16, 10, 8.5, 14], [30, 8.5, 7, 13], [43, 7, 6, 12], [55, 5.5, 4.6, 10], [65, 4, 3.4, 8]];
  let at: V3 = [0, 0, 0];
  tiers.forEach(([z, a, b, h], i) => {
    const turn = hash(i, 1, 985) * 1.2 - 0.6;
    const A = beamAxes([0, 0, 0], [Math.cos(turn), Math.sin(turn), 0]);
    at = [at[0] + (hash(i, 2, 985) - 0.5) * 2.4, at[1] + (hash(i, 3, 985) - 0.5) * 2.4, z + h / 2];
    S.box(at, A, [a, b, h / 2], (f, u, v, n) => {
      const top = f === 4;
      // whitened by the flock where they sit, at its top and on its upper ledges
      if ((top && i >= 2) || (i >= 4 && v > 0.6 && hash(Math.floor(u * 8), Math.floor(v * 8), 986) > 0.45)) return hash(Math.floor(u * 6), Math.floor(v * 6), 987) > 0.3 ? '#d4d0cc' : '#b3afb1';
      if (!top && Math.abs(fr(v * 3 + u * 0.4) - 0.5) < 0.06) return LROCK[1]; // a crack in it
      return toneAt(n, LROCK, -0.06);
    }, 1 + (i % 2));
  });
  feather(S, [10, 8, 0.6], 0.5, 5, 3);
  feather(S, [-8, 12, 0.6], 2.2, 4.5, 4);
  return finish(S, 34, 102);
}

/** THE CULT'S CAGE for the flock: a big cage of lashed poles they carry their chained vultures in, broken open and empty, its door hanging, feathers and a chain in it. 84 x 88 at (42, 66). */
function flockCage(): Sprite {
  const S = new Scene(new Px(88, 90), 44, 68);
  const W = 14;
  const D = 12;
  const H = 30;
  const corner = (sx: number, sy: number, z: number): V3 => [sx * W, sy * D, z];
  // its floor of slats
  S.box([0, 0, 1.2], XYZ, [W, D, 1.2], (f, u, _v, n) => (f === 4 && Math.abs(fr(u * 6) - 0.5) < 0.08 ? STICK[1] : toneAt(n, STICK, 0)), 1);
  // the corner poles and the top frame
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod(corner(sx, sy, 0), corner(sx, sy, H), 1.1, 1, STICK, 2);
  for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[-1, -1], [-1, 1]]] as const) S.rod(corner(a[0], a[1], H), corner(b[0], b[1], H), 0.9, 0.9, STICK, 3);
  // the bars of its far sides
  for (let k = 1; k < 5; k++) {
    S.rod(corner(-1 + k * 0.4, -1, 2), corner(-1 + k * 0.4, -1, H), 0.6, 0.6, STICK, 4);
    S.rod(corner(-1, -1 + k * 0.4, 2), corner(-1, -1 + k * 0.4, H), 0.6, 0.6, STICK, 4);
  }
  // the side toward the eye: its door torn off one lashing, hanging open out toward +x
  for (let k = 1; k < 5; k++) S.rod(corner(1, -1 + k * 0.4, 2), corner(1, -1 + k * 0.4, H), 0.6, 0.6, STICK, 5);
  const hinge: V3 = corner(-1, 1, 0);
  for (let k = 0; k < 4; k++) {
    const t = (k + 1) / 4.5;
    const fx = -W + t * W * 1.6;
    const fy = D + t * W * 0.9;
    S.rod([fx, fy, 3 - t], [fx + 1, fy + 1.5, H - 6 - t * 4], 0.6, 0.6, STICK, 6);
  }
  S.rod(add(hinge, [0, 0, 6]), [W * 0.6, D + W * 0.8, 6], 0.7, 0.7, STICK, 6);
  S.rod(add(hinge, [0, 0, H - 2]), [W * 0.6, D + W * 0.8, H - 10], 0.7, 0.7, STICK, 6);
  // inside: a chain, feathers
  for (let x = -8; x < 6; x += 2.2) S.ball([x, -2 + x * 0.2, 3.2], 0.8, IRON, 7, undefined, 0.1);
  feather(S, [2, 4, 3], 0.6, 5, 8);
  feather(S, [-6, -4, 3], 2.5, 4.5, 9);
  return finish(S, 44, 68);
}

// =================================================================================================

/** THE LEDGE ROAD'S 25 PIECES: the trail's, the carrion's, the cult's, the heights', on the wall; what breaks, its trap, its gate. */
export function ledgePieces(): Piece[] {
  return [
    { name: 'rope rail', kind: 'on the floor', frames: [railPost(false), railSpan(28, -28)], shadow: 0.12 },
    { name: 'rope rail, broken', kind: 'on the floor', frames: [railPost(true)], shadow: 0.12 },
    { name: 'planks over a cleft', kind: 'floor tile', frames: [plankTile(false), plankTile(true)] },
    { name: 'rockfall', kind: 'obstacle', frames: [rockfall()], shadow: 0.7 },
    { name: 'cairn', kind: 'obstacle', frames: [cairn()], shadow: 0.3 },
    { name: 'a pack mule, picked clean', kind: 'obstacle', frames: [muleCarcass()], shadow: 0.6 },
    { name: 'bones and feathers', kind: 'on the floor', frames: [bonesAndFeathers(0), bonesAndFeathers(1)] },
    { name: "a vulture's nest", kind: 'obstacle', frames: [nest()], shadow: 0.7 },
    { name: 'the great egg', kind: 'quest', frames: [greatEgg()], shadow: 0.2 },
    { name: "the cult's perch", kind: 'obstacle', frames: [cultPerch()], shadow: 0.3 },
    { name: "the cult's feather standard", kind: 'obstacle', frames: [featherStandard()], shadow: 0.2 },
    { name: "the cult's supply cart, gone over", kind: 'obstacle', frames: [supplyCart()], shadow: 0.8 },
    { name: 'a dead snag', kind: 'obstacle', frames: [deadSnag()], shadow: 0.35 },
    { name: 'iron rings in the wall', kind: 'on the wall', frames: [wallChains()], shadow: 0.1 },
    { name: 'a nest in the wall', kind: 'on the wall', frames: [wallNest()] },
    { name: 'icicles in the wall', kind: 'on the wall', frames: [wallIcicles()] },
    { name: 'water jar', kind: 'breakable', frames: [waterJar(false), waterJar(true)], shadow: 0.22 },
    { name: "basket of the flock's feathers", kind: 'breakable', frames: [featherBasket(false), featherBasket(true)], shadow: 0.2 },
    { name: 'the crumbling ledge', kind: 'trap', frames: [0, 1, 2, 3].map((f) => crumblingLedge(f)) },
    { name: 'cracks across the trail', kind: 'floor tile', frames: [trailCracks(false), trailCracks(true)] },
    { name: "the cult's barricade", kind: 'gate', frames: [barricade(false, false), barricade(true, false), barricade(false, true), barricade(true, true)], shadow: 0.9 },
    { name: 'snow drift', kind: 'on the floor', frames: [snowDrift(0), snowDrift(1)] },
    { name: 'a dead vulture', kind: 'on the floor', frames: [deadVulture()], shadow: 0.4 },
    { name: 'a perching rock', kind: 'obstacle', frames: [perchRock()], shadow: 0.45 },
    { name: "the cult's cage for the flock", kind: 'obstacle', frames: [flockCage()], shadow: 0.6 },
  ];
}
