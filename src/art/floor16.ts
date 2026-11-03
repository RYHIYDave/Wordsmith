// FLOOR 16, THE SWAN GARDENS (THE SWAN PAVILION): ITS OWN PIECES, themed after its boss, the Princess (a mock-up;
// nothing of the game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of the 5
// levels, then 25 for each boss.” This floor's boss is the Princess (his doc "Wordsmith Act 2, Part Two: The High City",
// planned with him in the main chat, 28 Oct): "A pale girl in a gown gone grey, her fingers raw from the nettles, a
// half-woven nettle shirt trailing from her hands. She never makes a sound." Her floor, the Swan Pavilion; the level's
// layout "open, like the Millrace: terraces stepping up the hill joined by stairs, clipped hedges and a hedge maze, rose
// arbours, still fountains, and a long lake with a pavilion on an island"; its hazards "nettle beds that sting and slow
// whoever walks through them; the lake's deep water"; its palette "Dawn rose, swan white, deep hedge green"; its story
// from Andersen's "The Wild Swans" (1838), only from the book: her eleven brothers turned to swans, the shirts of nettles
// she must weave in silence to free them. The first look, painted (src/dev/garden_paint.ts), to the art chat, 28 Oct:
// “Yes, go on (Recommended)”, offered as: next, the ground and its pieces made game-ready.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says (built in depth in floor 4's Scene, a step quieter than any word through
// art/act2_quiet.ts, seams of ink where one thing ends before another). Nothing glows but the lantern's candle (an honest
// orange, burning on into the dawn) and the quest's own pale light (the shirt half woven); nothing cyan, no pink.
//
// HOW THE TERRACES GO IN (the game walks on one level): a terrace's wall is a row of tiles that are floor, each with a
// `a terrace wall` on it, its face standing on the tile's near edge and filling the row, its coping and balustrade over
// the row behind. THE STAIR up it is built true: its foot on the tile in front of the wall's row, it climbs one tile and
// a man's waist, and on the picture its head lands on the row behind the wall one tile toward -x (the way a climb looks
// in this camera: up the screen). So a stair two wide laid with its feet on tiles (tx, R + 1) and (tx + 1, R + 1) of a
// wall's row R wants the wall's row open from tx - 1 to tx + 1, a `a stair's pier` on (tx - 2, R) and on (tx + 2, R), and
// the walk off it on (tx - 1, R - 1) and (tx, R - 1). Along y the same, turned. (src/dev/swan_lay.ts lays it so.)

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Piece } from './floorkit';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { TOWARD } from './floor2';
import { hash } from './kit';
import type { Ramp } from './kit';
import { EMBER } from './props';
import { IRON, OAK, checker, cylinder, done, local, lying, scene, turned } from './act2_kit';
import { bright } from './act2_quiet';
import { lakeWater } from './swangardens';
import { VINE_LEAF, VINE_THORN, VINE_WOOD_PALE, herVine, leafFace, leafShape } from './princess_vine';
import type { VineBrush } from './princess_vine';
import { norm, sub } from './skeleton';

const fr = (t: number): number => t - Math.floor(t);
const AXES: readonly [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// =================================================================================================
// THE GARDENS' MATERIALS (each from its deep shade to its lit top), as the ground's (art/swangardens.ts)

/** Dressed limestone, its lit edge rose in the dawn. */
export const LIMESTONE: Ramp = ['#2c2838', '#574e62', '#807385', '#ab9aa0', '#d8bdb3'];
/** Yew, deep hedge green. */
export const YEW: Ramp = ['#0c1614', '#13201b', '#1a2c22', '#26392b', '#474e3e'];
/** Box, clipped, a lighter green. */
export const BOX: Ramp = ['#141f19', '#1e2e1e', '#2a3d25', '#384f2d', '#58654a'];
/** Roses, a dusty dawn rose (never the enemy's pink: every hue past 350 degrees). */
export const ROSE: Ramp = ['#5e3436', '#7a4648', '#a3606a', '#c08682', '#d6a89e'];
/** Lead, the pavilion's dome. */
export const LEAD: Ramp = ['#1d1e2f', '#303145', '#45465b', '#5e5d73', '#8a8194'];
/** Nettles, dark and cold. */
export const NETTLE: Ramp = ['#0d1510', '#17241a', '#223322', '#30452b', '#4a5c3a'];
const STEM = '#3a2b37';
const HAIR = '#a3a697';
/** Swan white: the feathers, the down. */
export const SWANW: Ramp = ['#4c4762', '#7d7591', '#aca4b3', '#d5cfd1', '#ece6df'];
/** A tub's paint, a dull green-grey. */
const TUB: Ramp = ['#1c241f', '#2a352c', '#3c4a3e', '#56645a', '#748072'];
/** Bay, clipped into a ball. */
const BAY: Ramp = ['#152016', '#22301f', '#304229', '#405535', '#5a6a46'];
/** Reeds and sticks, a swan's nest. */
const REED: Ramp = ['#2e2a1e', '#463f2a', '#625838', '#7e7248', '#9a8c5c'];
/** Bark. */
const BARK: Ramp = ['#1a1416', '#2a2022', '#3c2e2e', '#50403c', '#66544c'];
/** Nettle flax, spun and woven: a grey-green, rough. */
export const FLAX: Ramp = ['#2a2f26', '#3f4636', '#575f49', '#71795d', '#8d9474'];
/** The shirt's flax, bleached pale. */
const SHIRT: Ramp = ['#3f4636', '#6a705c', '#8d9478', '#a9ae92', '#c4c6ac'];
/** Bronze, the sundial's. */
const BRONZE: Ramp = ['#2a2220', '#43362c', '#62503a', '#857048', '#a89060'];
/** The lantern's candle: an honest flame (Colour 3), left bright. */
const CANDLE = ['#ffc860', '#fff3b0'];
bright(CANDLE);

/** A tone of a ramp as it faces, with clumps a step lighter or darker (clipped leaves). */
function clumpy(n: V3, r: Ramp, w: V3, seed: number, bias = 0): string {
  const c = hash(Math.floor(w[0] / 3 + w[2] / 4), Math.floor(w[1] / 3 - w[2] / 4), seed);
  return toneAt(n, r, bias + (c < 0.25 ? -0.28 : c > 0.85 ? 0.22 : 0));
}

/** Lay a picture of its own (picture pixels, `k` to a pixel of it) into a scene: its pixel (0, 0) at (x0, y0), as near the eye as `depth`. */
function paste(S: Scene, p: Px, x0: number, y0: number, depth: number, id: number, k = 1, h = 0): void {
  for (let j = 0; j < p.h; j++) {
    for (let i = 0; i < p.w; i++) {
      const c = p.get(i, j);
      if (!c) continue;
      for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) S.put(x0 + i * k + a, y0 + j * k + b, depth, c, id, h);
    }
  }
}
const depthOf = (w: V3): number => dot(w, TOWARD);

// =================================================================================================
// THE TERRACES: a wall, a stair's pier, a stair

/** Dressed stone in courses on a wall's face: `z` up it and `a` along it (picture pixels), the courses 8 high. */
function coursed(n: V3, z: number, a: number, seed: number): string {
  const course = Math.floor(z / 8);
  const off = hash(course, 0, seed) * 24;
  const len = 14 + hash(course, 1, seed) * 8;
  const jz = fr(z / 8) < 0.13;
  const ja = fr((a + off) / len) < 0.07;
  if (jz || ja) return toneAt(n, LIMESTONE, -0.75);
  const b = Math.floor((a + off) / len);
  let bias = (hash(b, course, seed + 2) - 0.5) * 0.3;
  // (rain run down from the coping here and there; damp at its foot)
  if (hash(Math.floor(a / 2), 0, seed + 3) < 0.07 && z > 18) bias -= 0.25;
  if (z < 3) bias -= 0.3;
  return toneAt(n, LIMESTONE, bias);
}
/**
 * A TERRACE WALL, a tile of it: its face of dressed stone standing on the tile's near edge a man's waist high (32: it
 * fills its row), a coping along its top, and on that a balustrade, vase-shaped balusters under a rail. Along x (`k` 0,
 * its face looking down to the left, in the light) or along y (1). 110 x 130 at (55, 92).
 */
function terraceWall(k: number, pier = false): Sprite {
  const S = turned(scene(110, 140, 55, 100), k);
  terraceWallIn(S, pier);
  return done(S, 55, 100);
}
function terraceWallIn(S: Scene, pier: boolean): void {
  // the face (its +y side the one seen), the coping
  S.box([0, 16, 16], AXES, [20, 4, 16], (f, u, v, n) => (f === 2 ? coursed(n, u * 32, v * 32, 7101) : f === 0 ? coursed(n, v * 32, u * 6, 7101) : toneAt(n, LIMESTONE, 0)), 1);
  S.box([0, 15.75, 34], AXES, [20, 5.25, 2], (f, _u, v, n) => (f === 4 && v > 0.88 ? LIMESTONE[4] : toneAt(n, LIMESTONE, f === 4 ? 0.1 : 0)), 2);
  if (!pier) {
    // the balustrade: its plinth, four balusters a tile, its rail
    S.box([0, 15.5, 37.5], AXES, [20, 3.5, 1.5], (f, _u, _v, n) => toneAt(n, LIMESTONE, f === 4 ? 0.2 : 0), 3);
    for (const x of [-15, -5, 5, 15]) {
      S.rod([x, 15.5, 39], [x, 15.5, 41.5], 1.7, 1.4, LIMESTONE, 4);
      S.egg([x, 15.5, 46], AXES, [2.6, 2.6, 4.8], (n) => toneAt(n, LIMESTONE, 0.05), 4);
      S.rod([x, 15.5, 50], [x, 15.5, 54], 1.1, 1.3, LIMESTONE, 4);
    }
    S.box([0, 15.5, 57], AXES, [20, 4, 2], (f, _u, v, n) => (f === 4 && v > 0.8 ? LIMESTONE[4] : toneAt(n, LIMESTONE, f === 4 ? 0.15 : 0)), 5);
  } else {
    // A STAIR'S PIER: a block of stone over the coping, its cap, an urn on it with a ball of clipped box
    S.box([0, 14, 49], AXES, [10, 7, 13], (f, u, v, n) => (f === 2 ? coursed(n, u * 26, v * 16, 7103) : f === 0 ? coursed(n, v * 26, u * 11, 7103) : toneAt(n, LIMESTONE, 0.1)), 3);
    S.box([0, 14, 63.5], AXES, [12, 9, 1.5], (f, _u, v, n) => (f === 4 && v > 0.85 ? LIMESTONE[4] : toneAt(n, LIMESTONE, 0.1)), 4);
    urn(S, [0, 14, 65], 5);
  }
}
/** A stone urn standing at `at`: a foot, a full belly, a neck and lip; a ball of clipped box in it. */
function urn(S: Scene, at: V3, id: number, roses = false): void {
  const [x, y, z] = at;
  cylinder(S, x, y, 4.5, z, z + 3, (n) => toneAt(n, LIMESTONE, 0), id, () => LIMESTONE[3]);
  cylinder(S, x, y, 2.6, z + 3, z + 6, (n) => toneAt(n, LIMESTONE, -0.1), id);
  S.egg([x, y, z + 12], AXES, [7, 7, 7], (n) => toneAt(n, LIMESTONE, 0.05), id);
  cylinder(S, x, y, 6.5, z + 17, z + 20, (n) => toneAt(n, LIMESTONE, 0.1), id, (_a, rr) => (rr > 0.8 ? LIMESTONE[4] : '#14111f'));
  if (!roses) S.egg([x, y, z + 25], AXES, [5.5, 5.5, 6], (n, w) => clumpy(n, BOX, w, 7111), id + 1);
}

/**
 * THE TERRACE STAIR, a tile wide: four steps up a terrace's wall, built true, its foot on the tile in front of the wall's
 * row and its head a man's waist up at the wall's line; treads worn and lit at their noses, risers in shade. Along x (`k`
 * 0: climbing toward -y) or along y (1: toward -x). Laid as what lies on the floor (walked on, drawn before what stands). 90 x 90
 * at (45, 66).
 */
function terraceStair(k: number): Sprite {
  const S = turned(scene(90, 90, 45, 66), k);
  for (let s = 0; s < 4; s++) {
    const y0 = 20 - 10 * (s + 1);
    const top = 8 * (s + 1);
    S.box([0, y0 + 5, top / 2], AXES, [20, 5, top / 2], (f, u, v, n) => {
      if (f === 4) {
        // the tread: its nose (its +y edge) worn and lit; a seam where two slabs meet
        if (v > 0.84) return LIMESTONE[4];
        if (Math.abs(u - 0.5) < 0.02) return LIMESTONE[1];
        return toneAt(n, LIMESTONE, 0.1 + (hash(Math.floor(u * 9), s, 7121) - 0.5) * 0.2);
      }
      if (f === 2) return toneAt(n, LIMESTONE, -0.25 + (u > 0.85 ? 0.3 : 0));
      return toneAt(n, LIMESTONE, 0);
    }, 1);
  }
  return done(S, 45, 66);
}

// =================================================================================================
// CLIPPED THINGS: a yew cone, box edging, a topiary swan; a rose bush; a bay in its tub

/** A YEW CONE, clipped close, taller than a man. 56 x 104 at (28, 86). */
function yewCone(): Sprite {
  const S = scene(56, 104, 28, 86);
  yewConeIn(S);
  return done(S, 28, 86);
}
function yewConeIn(S: Scene): void {
  cylinder(S, 0, 0, (z) => Math.max(0.4, 17 * (1 - z / 66)), 0, 66, (n, a, z) => {
    const c = hash(Math.floor(a * 5), Math.floor(z / 4), 7131);
    return toneAt(n, YEW, (c < 0.25 ? -0.28 : c > 0.85 ? 0.22 : 0) + (z < 4 ? -0.3 : 0));
  }, 1);
}
/** BOX EDGING, a tile of it: a low clipped hedge of box along the tile's middle. Along x (`k` 0) or along y (1). 84 x 56 at (42, 36). */
function boxEdging(k: number): Sprite {
  const S = turned(scene(84, 56, 42, 36), k);
  boxEdgingIn(S);
  return done(S, 42, 36);
}
function boxEdgingIn(S: Scene): void {
  S.box([0, 0, 6], AXES, [20, 4, 6], (f, _u, v, n) => {
    const w: V3 = [v * 40, 0, 0];
    if (f === 4 && v > 0.85) return BOX[4];
    return clumpy(n, BOX, w, 7141 + f, f === 4 ? 0.1 : 0);
  }, 1);
}
/** A TOPIARY SWAN: yew clipped into a swan on a low mound, its neck in an S, looking to the screen's left. 90 x 100 at (45, 86). */
function topiarySwan(): Sprite {
  const S = scene(90, 100, 45, 86);
  // (the swan faces the screen's left: forward along (-1, +1))
  const F: V3 = [-0.7071, 0.7071, 0];
  const Sd: V3 = [0.7071, 0.7071, 0];
  const P = (f: number, s: number, z: number): V3 => [F[0] * f + Sd[0] * s, F[1] * f + Sd[1] * s, z];
  const yew = (seed: number) => (n: V3, w: V3): string => clumpy(n, YEW, w, seed);
  S.egg(P(0, 0, 6), [F, Sd, [0, 0, 1]], [18, 15, 8], yew(7151), 1);
  S.egg(P(-1, 0, 22), [F, Sd, [0, 0, 1]], [15, 10, 10], yew(7152), 2);
  // the wings folded, raised a little over the back; the tail
  S.egg(P(-5, 0, 28), [F, Sd, [0, 0, 1]], [10, 9, 6], yew(7153), 2);
  S.egg(P(-14, 0, 27), [F, Sd, [0, 0, 1]], [6, 4, 5], yew(7154), 2);
  // the neck: up from the breast, back, and forward to the head
  const neck: V3[] = [P(10, 0, 24), P(12, 0, 34), P(10, 0, 44), P(11, 0, 52), P(14, 0, 57)];
  for (let i = 0; i + 1 < neck.length; i++) S.rod(neck[i], neck[i + 1], 3.6, 3.2, YEW, 3);
  S.egg(P(15, 0, 58), [F, Sd, [0, 0, 1]], [5, 3.6, 3.6], yew(7155), 4);
  S.egg(P(20, 0, 56.5), [F, Sd, [0, 0, 1]], [3.4, 1.8, 1.6], yew(7156), 4);
  return done(S, 45, 86);
}
/** A ROSE BUSH: a low mound of leaves, its roses out on its lit side; or trampled flat, stems snapped, its petals about. 70 x 56 at (35, 40). */
function roseBush(broken: boolean): Sprite {
  const S = scene(70, 56, 35, 40);
  const rose = (seed: number) => (n: V3, w: V3): string => {
    const l = dot(n, [-0.55, 0.45, 0.7]);
    const b = hash(Math.floor(w[0] / 1.6 + 50), Math.floor(w[1] / 1.6 + w[2] / 2 + 50), seed);
    if (l > 0.05 && b > 0.74) return ROSE[b > 0.92 ? 4 : l > 0.45 ? 3 : 2];
    if (l <= 0.05 && b > 0.88) return ROSE[1];
    return clumpy(n, BOX, w, seed + 1, -0.05);
  };
  if (!broken) {
    const lumps: [number, number, number, number][] = [[0, 0, 9, 10], [-8, 4, 7, 8], [7, -5, 8, 8], [5, 7, 6, 7], [-6, -7, 6, 7]];
    lumps.forEach(([x, y, z, r], i) => S.egg([x, y, z], AXES, [r, r, r * 0.95], rose(7161 + i), 1));
  } else {
    // trampled: the bush pressed flat, two stems snapped and standing, petals strewn round it
    S.egg([0, 0, 3], AXES, [13, 11, 3.5], rose(7166), 1);
    S.rod([-4, -3, 0], [-6, -4, 9], 0.8, 0.6, BARK, 2);
    S.rod([5, 2, 0], [8, 1, 7], 0.8, 0.6, BARK, 2);
    for (let i = 0; i < 9; i++) {
      const a = hash(i, 1, 7167) * Math.PI * 2;
      const d = 12 + hash(i, 2, 7167) * 9;
      const [px, py] = S.at([Math.cos(a) * d, Math.sin(a) * d, 0.3]);
      S.put(Math.round(px), Math.round(py), -50, ROSE[i % 3 === 0 ? 3 : 2], 3);
      S.put(Math.round(px) + 1, Math.round(py), -50, ROSE[2], 3);
    }
  }
  return done(S, 35, 40);
}
/** A BAY TREE IN ITS TUB: a box of painted wood banded with iron, a clean stem, a ball of bay clipped round. 60 x 100 at (30, 86). */
function bayTub(): Sprite {
  const S = scene(60, 100, 30, 86);
  S.box([0, 0, 10], AXES, [9, 9, 10], (f, u, v, n) => {
    const band = f === 4 ? false : (f === 2 ? u : v) < 0.12 || (f === 2 ? u : v) > 0.82;
    if (f === 4) return v > 0.2 && u > 0.2 && v < 0.8 && u < 0.8 ? '#1c161c' : toneAt(n, TUB, 0.2);
    return band ? toneAt(n, IRON, 0) : toneAt(n, TUB, 0);
  }, 1);
  for (const [x, y] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) S.ball([x, y, 21], 1.6, TUB, 2);
  S.rod([0, 0, 19], [0, 0, 40], 1.5, 1.2, BARK, 3);
  S.egg([0, 0, 52], AXES, [13, 13, 13], (n, w) => clumpy(n, BAY, w, 7171), 4);
  return done(S, 30, 86);
}

// =================================================================================================
// THE FOUNTAIN, THE STONE SWAN, THE SUNDIAL, THE BENCH, AN URN OF ROSES

/**
 * THE STONE SWAN (picture pixels, finer than a figure: it is part of the place): rearing on its rock, its near wing raised
 * in a fan, the far one behind, its neck up in an S, its head turned to the left; weathered, lichen in its hollows. Its
 * anchor the middle of its foot: (20, 46) of 44 x 48.
 */
export function stoneSwanPicture(): { px: Px; ax: number; ay: number } {
  const L = { lit: '#d0c1ba', body: '#a99ca3', shade: '#7d7385', deep: '#564f62', lichen: '#6e7465' };
  const s = new Px(44, 48);
  const ax = 20;
  const ay = 46;
  const poly = (pts: number[][], f: (x: number, y: number) => string): void => {
    const P = pts.map(([x, y]) => [ax + x, ay + y]);
    const ys = P.map((q) => q[1]);
    for (let y = Math.floor(Math.min(...ys)); y < Math.ceil(Math.max(...ys)); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < P.length; i++) {
        const a = P[i];
        const b = P[(i + 1) % P.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((m, n) => m - n);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) s.set(x, y, f(x, y));
    }
  };
  poly([[-8, 0], [-9, -2], [-6, -4], [3, -4], [9, -3], [10, 0]], (x, y) => (y < ay - 2 ? (x < ax ? L.body : L.shade) : L.deep));
  poly([[7, -14], [11, -23], [15, -31], [19, -37], [22, -39], [22, -35], [24, -33], [22, -30], [24, -27], [22, -24], [24, -21], [21, -18], [22, -14], [16, -11]], (x, y) => ((y - ay + 38) % 5 === 0 && x - ax > 14 ? L.deep : x - ax > 20 ? L.deep : L.shade));
  poly([[-10, -9], [-9, -6], [-6, -4], [0, -3], [8, -4], [13, -6], [17, -10], [16, -12], [11, -12], [3, -14], [-4, -14], [-8, -12]], (x, y) => (y - ay < -11 ? L.lit : y - ay < -7 ? (x - ax < 4 ? L.body : L.shade) : x - ax < -4 ? L.shade : L.deep));
  poly([[-5, -13], [-4, -19], [-2, -26], [1, -33], [5, -39], [9, -43], [12, -42], [11, -39], [14, -37], [13, -34], [16, -32], [15, -29], [18, -27], [16, -24], [18, -21], [15, -18], [16, -15], [8, -12]], (x, y) => {
    const lx = x - ax;
    const ly = y - ay;
    const lead = lx + 5 - (-(ly + 13) * 14) / 30;
    if (lead < 2.2) return L.lit;
    if (lead > 11) return (ly + 44) % 3 === 0 ? L.deep : L.shade;
    if ((ly + 44) % 4 === 0 && lead > 3.5) return L.shade;
    return lead > 7.5 ? L.shade : lead < 4 ? L.lit : L.body;
  });
  const neck: [number, number][] = [[-9, -12], [-11, -17], [-12, -22], [-11, -27], [-9, -31], [-9, -34]];
  for (let i = 0; i + 1 < neck.length; i++) {
    for (let t = 0; t <= 1; t += 0.1) {
      const X = Math.round(ax + neck[i][0] + (neck[i + 1][0] - neck[i][0]) * t);
      const Y = Math.round(ay + neck[i][1] + (neck[i + 1][1] - neck[i][1]) * t);
      s.set(X - 1, Y, L.lit).set(X, Y, L.body).set(X + 1, Y, L.shade);
      if (i === 0) s.set(X + 2, Y, L.shade);
    }
  }
  for (let dy = -3; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) if ((dx / 3.4) ** 2 + (dy / 2.6) ** 2 <= 1) s.set(ax - 10 + dx, ay - 36 + dy, dx + dy < -1 ? L.lit : dx + dy < 2 ? L.body : L.shade);
  poly([[-13, -38], [-18, -35.5], [-17, -34.5], [-13, -34.5]], (_x, y) => (y < ay - 36 ? L.body : L.shade));
  s.set(ax - 11, ay - 37, L.deep);
  for (let k = 0; k < 14; k++) {
    const x = Math.floor(hash(k, 1, 651) * 44);
    const y = Math.floor(hash(k, 2, 651) * 48);
    const c = s.get(x, y);
    if (c && (c === L.shade || c === L.body) && s.get(x + 1, y)) s.set(x, y, L.lichen).set(x + 1, y, L.lichen);
  }
  return { px: s, ax, ay };
}
/**
 * THE STILL FOUNTAIN: a round basin of stone, its water still (the Hush: it no longer plays), a pedestal in it, the stone
 * swan rearing on top. Three tiles across. 174 x 176 at (87, 134).
 */
function fountain(): Sprite {
  const S = scene(174, 176, 87, 134);
  const R = 68;
  cylinder(S, 0, 0, R, 0, 16, (n, a, z) => coursed(n, z, a * R * 0.8, 7181), 1);
  cylinder(S, 0, 0, R - 8, 4, 16, (n) => toneAt(n, LIMESTONE, -0.2), 1);
  // its rim, lit
  for (let i = 0; i < 64; i++) {
    const a0 = (i / 64) * Math.PI * 2;
    const a1 = ((i + 1) / 64) * Math.PI * 2;
    const P = (a: number, r: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, 16];
    S.quad([P(a0, R - 8), P(a1, R - 8), P(a1, R), P(a0, R)], (_u, v) => (v > 0.7 ? LIMESTONE[4] : LIMESTONE[3]), 1);
  }
  // its water, still: the sky's one colour in it, a line of light here and there; the pedestal's likeness under it
  cylinder(S, 0, 0, R - 8, 0, 12, () => null, 2, (a, rr) => {
    const w: V3 = [Math.cos(a) * rr * (R - 8), Math.sin(a) * rr * (R - 8), 12];
    const [px, py] = S.at(w);
    const [cx] = S.at([0, 0, 0]);
    if (rr > 0.9) return '#3b3a55';
    if (Math.abs(px - cx) < 8 && w[0] + w[1] > 0 && w[0] + w[1] < 44) return '#5d5868';
    const run = Math.floor((px + 13 * (Math.floor(py) % 5)) / 14);
    if (hash(run, Math.floor(py), 7183) > 0.9 && (Math.floor(py) & 1) === 0) return '#655c78';
    return '#4e4a67';
  });
  cylinder(S, 0, 0, 13, 12, 18, (n) => toneAt(n, LIMESTONE, 0), 3, () => LIMESTONE[3]);
  cylinder(S, 0, 0, 8, 18, 48, (n, _a, z) => toneAt(n, LIMESTONE, z > 44 ? 0.1 : 0), 3);
  cylinder(S, 0, 0, 12, 48, 53, (n) => toneAt(n, LIMESTONE, 0.1), 3, (_a, rr) => (rr > 0.75 ? LIMESTONE[4] : LIMESTONE[3]));
  const sw = stoneSwanPicture();
  const [sx, sy] = S.at([0, 0, 53]);
  paste(S, sw.px, Math.round(sx) - sw.ax, Math.round(sy) - sw.ay + 2, depthOf([0, 0, 80]), 4);
  return done(S, 87, 134);
}
/** A STONE SWAN ON ITS PLINTH: the fountain's swan again, rearing on a plinth of its own. 70 x 110 at (35, 92). */
function stoneSwan(): Sprite {
  const S = scene(70, 110, 35, 92);
  S.box([0, 0, 12], AXES, [10, 10, 12], (f, u, v, n) => (f === 4 ? LIMESTONE[3] : f === 2 ? coursed(n, u * 24, v * 16, 7191) : coursed(n, v * 24, u * 16, 7191)), 1);
  S.box([0, 0, 25.5], AXES, [12, 12, 1.5], (f, _u, v, n) => (f === 4 && v > 0.85 ? LIMESTONE[4] : toneAt(n, LIMESTONE, 0.1)), 2);
  const sw = stoneSwanPicture();
  const [sx, sy] = S.at([0, 0, 27]);
  paste(S, sw.px, Math.round(sx) - sw.ax, Math.round(sy) - sw.ay + 1, depthOf([0, 0, 60]), 3);
  return done(S, 35, 92);
}
/** A SUNDIAL: a baluster of stone, a round dial on it, its hours cut, a bronze gnomon. 50 x 70 at (25, 58). */
function sundial(): Sprite {
  const S = scene(50, 70, 25, 58);
  cylinder(S, 0, 0, 7, 0, 3, (n) => toneAt(n, LIMESTONE, 0), 1, () => LIMESTONE[3]);
  S.egg([0, 0, 12], AXES, [4.5, 4.5, 9], (n) => toneAt(n, LIMESTONE, 0.05), 1);
  cylinder(S, 0, 0, 3, 19, 25, (n) => toneAt(n, LIMESTONE, 0), 1);
  cylinder(S, 0, 0, 9, 25, 28, (n) => toneAt(n, LIMESTONE, 0.1), 2, (a, rr) => {
    // the dial: its hours cut round its edge
    const hour = Math.abs(Math.sin(a * 6)) < 0.12 && rr > 0.7;
    return rr > 0.92 ? LIMESTONE[4] : hour ? LIMESTONE[1] : LIMESTONE[3];
  });
  S.quad([[-6, 0, 28], [6, 0, 28], [6, 0, 29], [-6, 0, 36]], (u) => toneAt([0, 1, 0], BRONZE, u > 0.5 ? -0.2 : 0.2), 3);
  return done(S, 25, 58);
}
/** A STONE BENCH: a slab seat on two scrolled ends. Along x (`k` 0) or along y (1). 80 x 56 at (40, 40). */
function bench(k: number): Sprite {
  const S = turned(scene(80, 56, 40, 40), k);
  for (const x of [-13, 13]) {
    S.box([x, 0, 5.5], AXES, [3, 5, 5.5], (_f, _u, _v, n) => toneAt(n, LIMESTONE, 0), 1);
    S.egg([x, 0, 9.5], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [5.5, 3, 2.6], (n) => toneAt(n, LIMESTONE, 0.05), 1);
  }
  S.box([0, 0, 13], AXES, [18, 6, 2], (f, _u, v, n) => (f === 4 && v > 0.82 ? LIMESTONE[4] : toneAt(n, LIMESTONE, f === 4 ? 0.1 : 0)), 2);
  return done(S, 40, 40);
}
/** AN URN OF ROSES on a low plinth, a rose spilling over its lip; or knocked from it and broken, the roses in the gravel. 70 x 100 at (35, 78). */
function urnOfRoses(broken: boolean): Sprite {
  const S = scene(70, 100, 35, 78);
  S.box([0, 0, 4], AXES, [9, 9, 4], (f, _u, v, n) => (f === 4 && v > 0.85 ? LIMESTONE[4] : toneAt(n, LIMESTONE, 0)), 1);
  const rose = (seed: number) => (n: V3, w: V3): string => {
    const l = dot(n, [-0.55, 0.45, 0.7]);
    const b = hash(Math.floor(w[0] / 1.6 + 50), Math.floor(w[1] / 1.6 + w[2] / 2 + 50), seed);
    if (l > 0.05 && b > 0.7) return ROSE[b > 0.92 ? 4 : l > 0.45 ? 3 : 2];
    return clumpy(n, BOX, w, seed + 1, -0.05);
  };
  if (!broken) {
    urn(S, [0, 0, 8], 2, true);
    S.egg([0, 0, 31], AXES, [8, 8, 6], rose(7201), 3);
    S.egg([5, 4, 25], AXES, [4, 4, 5], rose(7202), 3);
    S.egg([7, 6, 18], AXES, [3, 3, 4], rose(7203), 3);
  } else {
    // its belly broken open on the plinth, its lip in the gravel, the roses spilled
    S.egg([0, 0, 12], AXES, [7, 7, 5], (n) => toneAt(n, LIMESTONE, 0.05), 2, (w) => w[0] - w[1] < 3);
    cylinder(S, 13, 10, 6.5, 0, 3, (n) => toneAt(n, LIMESTONE, 0.1), 3, (_a, rr) => (rr > 0.8 ? LIMESTONE[4] : '#14111f'));
    S.egg([-12, 8, 3], AXES, [7, 6, 3.5], rose(7204), 4);
    S.egg([3, 14, 2], AXES, [4, 3, 2], (n) => toneAt(n, LIMESTONE, 0), 5);
  }
  return done(S, 35, 78);
}

// =================================================================================================
// THE ROSE ARBOUR

/**
 * A ROSE ARBOUR over a walk: three iron hoops across it a little under a tile apart, each a post either side and an arch
 * over, climbing roses twined thin up the posts and thick over the arches and the top between; roses out on its lit side.
 * Along x (`k` 0: the walk runs along x) or along y (1); whole, or half there while someone is under it (as the Millrace's
 * drying lines). 140 x 150 at (70, 112).
 */
function arbour(k: number, half: boolean): Sprite {
  const S = turned(scene(140, 150, 70, 112), k);
  const keep = half ? (w: V3): boolean => checker(S, w) : undefined;
  const HALF = 30;
  const POST = 46;
  const ARCH = (HALF / 40) * 39.2;
  const hoopAt = (t: number): [number, number] => {
    if (t < 1) return [-HALF, t * POST];
    if (t > 2) return [HALF, (3 - t) * POST];
    const ang = Math.PI - (t - 1) * Math.PI;
    return [Math.cos(ang) * HALF, POST + Math.sin(ang) * ARCH];
  };
  const hoops = [-30, 0, 30];
  const leaf = (seed: number) => (n: V3, w: V3): string => {
    const l = dot(n, [-0.55, 0.45, 0.7]);
    const b = hash(Math.floor(w[0] / 1.5 + 80), Math.floor(w[1] / 1.5 + w[2] / 1.7 + 80), seed);
    if (l > 0.1 && b > 0.8) return ROSE[b > 0.93 ? 4 : l > 0.5 ? 3 : 2];
    if (l <= 0.1 && b > 0.9) return ROSE[1];
    return clumpy(n, BOX, w, seed + 1, -0.08);
  };
  let id = 1;
  for (const a of hoops) {
    for (let i = 0; i < 30; i++) {
      const [b0, z0] = hoopAt((i / 30) * 3);
      const [b1, z1] = hoopAt(((i + 1) / 30) * 3);
      S.rod([a, b0, z0], [a, b1, z1], 0.9, 0.9, IRON, id, keep);
    }
  }
  id++;
  hoops.forEach((a, i) => {
    for (const side of [0, 2]) {
      for (let j = 0; j < 12; j++) {
        const t = side === 0 ? 0.08 + j * 0.077 : 2.0 + j * 0.077;
        if (hash(i * 9 + side, j, 7211) < (t < 0.35 || t > 2.65 ? 0.6 : 0.15)) continue;
        const [b, z] = hoopAt(t);
        const r = 2.4 + 1.1 * hash(i, j, 7212);
        S.egg([a + (hash(i, j, 7213) - 0.5) * 4, b + (j % 2 ? 2 : -2), z], AXES, [r, r, r], leaf(7214 + i), id, keep);
      }
    }
    for (let j = 0; j <= 12; j++) {
      const [b, z] = hoopAt(1 + j / 12);
      const r = 4 + 1.4 * hash(i, j, 7215);
      S.egg([a, b, z], AXES, [r, r, r], leaf(7216 + i), id, keep);
    }
  });
  for (let i = 0; i < 2; i++) {
    for (const f of [1 / 3, 2 / 3]) {
      const a = hoops[i] + 30 * f;
      for (let j = 2; j <= 10; j++) {
        if (hash(i * 3 + Math.round(f * 3), j, 7217) < 0.2) continue;
        const [b, z] = hoopAt(1 + j / 12);
        const r = 3.8 + 1.2 * hash(i, j, 7218);
        S.egg([a, b, z + 2], AXES, [r, r, r], leaf(7219), id, keep);
      }
    }
  }
  return done(S, 70, 112);
}

// =================================================================================================
// THE SWAN PAVILION ON ITS ISLAND

/**
 * THE SWAN PAVILION ON ITS ISLAND: a round island, a lawn ringed with gravel and a kerb of stone standing out of the water;
 * on it a round temple, a stepped plinth, eight columns, a ring of stone over them, a dome of lead ribbed eight ways, a
 * lantern; under the dome, its floor in the dome's shade; and the whole of it again, upside down and darker, in the still
 * water before it (the lake must reach two tiles past the island toward the eye). It stands in the lake (on tiles of the
 * lake: the island is its own). 260 x 380 at (130, 222).
 */
function pavilion(): Sprite {
  // (built with the water at z 0 and the lawn's height at LIFT, so the kerb's face out of the water is drawn; anchored at
  // the lawn's height under its middle)
  const LIFT = 10;
  const S = scene(260, 390, 130, 232);
  const IR = 104;
  const Z = (z: number): number => z + LIFT;
  // the island: its kerb's face out of the water, its top: a lawn, a ring of gravel, the kerb
  cylinder(S, 0, 0, IR, 0, Z(0), (n, a, z) => (z < 2 ? toneAt(n, LIMESTONE, -0.7) : coursed(n, z, a * IR * 0.8, 7221)), 1, (a, rr) => {
    const d = rr * IR;
    const w: V3 = [Math.cos(a) * d, Math.sin(a) * d, 0];
    if (d > IR - 10) {
      const seam = fr(a * 12) < 0.05;
      return seam ? LIMESTONE[1] : d > IR - 2 ? LIMESTONE[4] : LIMESTONE[3];
    }
    if (d > 92) {
      const g = hash(Math.floor(w[0] / 1.2), Math.floor(w[1] / 1.2), 7223);
      return g < 0.15 ? '#77666c' : g > 0.9 ? '#b9a098' : '#968182';
    }
    const g = hash(Math.floor(w[0] / 1.4), Math.floor(w[1] / 1.4), 7224);
    return g < 0.12 ? '#2e3e30' : g > 0.94 ? '#6b6a56' : '#40503a';
  });
  // the plinth, two steps; its floor a ring of darker flags
  cylinder(S, 0, 0, 90, Z(0), Z(6), (n) => toneAt(n, LIMESTONE, 0), 2, (_a, rr) => (rr > 0.94 ? LIMESTONE[4] : LIMESTONE[3]));
  cylinder(S, 0, 0, 82, Z(6), Z(12), (n) => toneAt(n, LIMESTONE, 0.05), 3, (_a, rr) => {
    if (rr > 0.95) return LIMESTONE[4];
    if (rr > 0.9) return LIMESTONE[3];
    return Math.abs(rr - 0.5) < 0.03 ? LIMESTONE[0] : LIMESTONE[2];
  });
  // eight columns, each with its base and its capital
  for (let c = 0; c < 8; c++) {
    const a = (c / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(a) * 70;
    const y = Math.sin(a) * 70;
    cylinder(S, x, y, 6.8, Z(12), Z(16), (n) => toneAt(n, LIMESTONE, 0), 4 + c);
    cylinder(S, x, y, 4.8, Z(16), Z(99), (n, aa) => toneAt(n, LIMESTONE, Math.abs(Math.sin(aa * 4)) < 0.2 ? -0.15 : 0.05), 4 + c);
    cylinder(S, x, y, 6.8, Z(99), Z(104), (n) => toneAt(n, LIMESTONE, 0.15), 4 + c);
  }
  // the ring over them: its cornice lit, its frieze, the band of shade under
  cylinder(S, 0, 0, 79, Z(104), Z(122), (n, _a, z) => toneAt(n, LIMESTONE, z > Z(119) ? 0.4 : z < Z(108) ? -0.35 : 0), 20, (_a, rr) => (rr > 0.76 ? LIMESTONE[4] : null));
  cylinder(S, 0, 0, 60, Z(104), Z(120), (n) => toneAt(n, LIMESTONE, -0.4), 20);
  // the dome of lead, ribbed eight ways to the lantern
  S.egg([0, 0, Z(121)], AXES, [74, 74, 52], (n, w) => {
    const a = Math.atan2(w[1], w[0]);
    const rib = Math.abs(fr((a / (Math.PI * 2)) * 8 + 0.0625) - 0.5) < 0.035;
    return toneAt(n, LEAD, rib ? 0.25 : 0);
  }, 21, (w) => w[2] >= Z(120.5));
  cylinder(S, 0, 0, 13, Z(168), Z(184), (n) => toneAt(n, LIMESTONE, 0.05), 22);
  S.egg([0, 0, Z(183.5)], AXES, [16, 16, 9], (n) => toneAt(n, LEAD, 0.05), 23, (w) => w[2] >= Z(183));
  S.ball([0, 0, Z(196)], 4, LIMESTONE, 24);
  // (the dome's shade over its floor, under it)
  const { w: PW, h: PH } = S.p;
  for (let y = 0; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      const i = y * PW + x;
      if (S.id[i] !== 3 || S.hz[i] < Z(11.5)) continue;
      const [wx, wy] = rayToFloor(S, x, y, Z(12));
      if (Math.hypot(wx, wy) < 76) {
        const c = S.p.get(x, y);
        if (c) S.p.set(x, y, shadeOf(c));
      }
    }
  }
  // ITS LIKENESS in the water before it: upside down about the water's line, darker, broken in rows as it goes; only on
  // the water (not the island)
  const [, wl] = S.at([0, 0, 0]);
  const src = new Px(PW, PH);
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (S.id[y * PW + x] >= 1) {
    const c = S.p.get(x, y);
    if (c) src.set(x, y, c);
  }
  for (let y = 0; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      const c = src.get(x, y);
      if (!c) continue;
      const ty = Math.round(2 * wl - y);
      if (ty < 0 || ty >= PH - 2 || S.id[ty * PW + x] >= 0) continue;
      const down = ty - wl;
      if (down > 130) continue;
      if (down > 60 && ty % 3 === 0) continue;
      if (down > 96 && (ty & 1)) continue;
      const sx = down > 30 && hash(Math.floor(ty / 2), 0, 7225) > 0.75 ? 1 : 0;
      if (x + sx < PW && S.id[ty * PW + x + sx] < 0) S.put(x + sx, ty, -1e4, reflected(c), -2, 0);
    }
  }
  return done(S, 130, 232 - LIFT);
}
/** The world's point at height `hz` that the eye sees through the middle of pixel (x, y). */
function rayToFloor(S: Scene, x: number, y: number, hz: number): [number, number] {
  const r = S.ray(x, y);
  // (along EYE (1, 1, 0.8) from the floor's point to the height hz)
  const t = hz / 0.8;
  return [r[0] + t, r[1] + t];
}
const hex3 = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const toHex = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/** A colour in the dome's shade. */
function shadeOf(c: string): string {
  const [r, g, b] = hex3(c);
  return toHex(r * 0.62 + 4, g * 0.6 + 4, b * 0.66 + 10);
}
/** A colour as the still water gives it back: toward the water's own, darker. */
function reflected(c: string): string {
  const [r, g, b] = hex3(c);
  const [wr, wg, wb] = hex3('#4e4a67');
  return toHex((r * 0.5 + wr * 0.5) * 0.8, (g * 0.5 + wg * 0.5) * 0.8, (b * 0.5 + wb * 0.5) * 0.84);
}

// =================================================================================================
// NETTLES, AND WHAT THE PRINCESS MADE OF THEM

/** A NETTLE (game pixels): a stem of dark wine, three pairs of toothed leaves drooping off it, smaller toward its top; lit on the left. `stir`: shaken, its leaves turned up and its hairs catching the light. */
function nettlePlant(v: number, stir: boolean): { px: Px; ax: number; ay: number } {
  const s = new Px(11, 14);
  const ax = 5;
  const ay = 13;
  const tall = 7 + (v % 4);
  const lean = stir ? (v % 2 ? 1 : -1) : 0;
  for (let y = 0; y < tall; y++) s.set(ax + (y > tall - 3 ? lean : 0), ay - y, y < 2 ? NETTLE[1] : STEM);
  const LEAF: Record<number, string[]> = { 1: ['LL'], 2: ['.LL', 'LBB', '.D.'], 3: ['..LL', '.LBB', 'LBB.', '.D..'] };
  const tone = (ch: string, lit: boolean): string | null => (ch === 'L' ? (lit ? NETTLE[4] : NETTLE[2]) : ch === 'B' ? (lit ? NETTLE[3] : NETTLE[1]) : ch === 'D' ? (lit ? NETTLE[2] : NETTLE[0]) : null);
  const pairs: [number, number][] = [[tall, 1], [tall - 2, 2], [tall - 5, 3]];
  for (const [hgt, size] of pairs) {
    if (hgt < 3) continue;
    const rows = LEAF[size];
    const shift = stir && size < 3 ? lean : 0;
    rows.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) {
        const dx = row.length - i;
        for (const side of [-1, 1]) {
          // (stirred: the leaves turned up, their paler undersides showing)
          const c = tone(row[i], side < 0);
          if (c) s.set(ax + side * dx + shift, ay - hgt + r - (stir && r === rows.length - 1 ? 1 : 0), stir && row[i] === 'D' ? NETTLE[3] : c);
        }
      }
    });
  }
  s.set(ax + lean, ay - tall, NETTLE[4]);
  const hairs = stir ? [[-2, 2], [3, 4], [-3, 5], [2, 1]] : v % 3 === 0 ? [[-2, 2]] : v % 3 === 1 ? [[-3, 5]] : [];
  for (const [dx, dy] of hairs) if (s.has(ax + dx, ay - tall + dy) || stir) s.set(ax + dx, ay - tall + dy, HAIR);
  return { px: s, ax, ay };
}
/**
 * NETTLES, a tile of them (the hazard: they sting and slow whoever walks through): a dozen plants close together, dark
 * and toothed, knee high; still, or stirred where someone goes through them, shaken, their stinging hairs flashing. A
 * trap, laid as a floor tile. 90 x 70 at (45, 48).
 */
function nettles(stir: boolean): Sprite {
  const S = scene(90, 70, 45, 48);
  const P = 10;
  const plants: [number, number, number][] = [];
  for (let j = -2; j < 2; j++) for (let i = -2; i < 2; i++) {
    const x = (i + 0.2 + 0.6 * hash(i, j, 7231)) * P;
    const y = (j + 0.2 + 0.6 * hash(i, j, 7232)) * P;
    plants.push([x, y, Math.floor(hash(i, j, 7233) * 8)]);
  }
  plants.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const [x, y, v] of plants) {
    const pl = nettlePlant(v, stir);
    const [sx, sy] = S.at([x, y, 0]);
    paste(S, pl.px, Math.round(sx) - pl.ax * 2, Math.round(sy) - pl.ay * 2, depthOf([x, y, 6]), 1, 2);
  }
  return done(S, 45, 48);
}
/** TRODDEN NETTLES, FOR THEIR FLAX: nettle stalks crushed flat under bare feet and laid in a heap, their fibres pale where they split. On the floor. 90 x 56 at (45, 30). */
function troddenNettles(): Sprite {
  const S = scene(100, 60, 50, 32);
  for (let i = 0; i < 46; i++) {
    const a = 0.45 + (hash(i, 1, 7241) - 0.5) * 0.5;
    const cx = (hash(i, 2, 7241) - 0.5) * 26;
    const cy = (hash(i, 3, 7241) - 0.5) * 16;
    const L = 10 + hash(i, 4, 7241) * 9;
    const z = 0.8 + (i / 46) * 3.5;
    const A: V3 = [cx - Math.cos(a) * L, cy - Math.sin(a) * L, z];
    const B: V3 = [cx + Math.cos(a) * L, cy + Math.sin(a) * L, z];
    const split = i % 3 === 0;
    S.rod(A, B, 1.1, 0.8, split ? FLAX : NETTLE, 1);
  }
  return done(S, 50, 32);
}
/**
 * A NETTLE SHIRT, HALF WOVEN (the quest): laid out on the grass where she left it, a shirt of rough grey-green nettle flax,
 * its weave in rows, its neck and its one made sleeve; where the other sleeve should be, only the threads, running out to
 * a hank of flax and a bundle of nettle stalks. Its own pale light. On the floor. 110 x 64 at (55, 32).
 */
function nettleShirt(): Sprite {
  // (laid square to the eye: across the picture `s` and up it `t`, in tiles)
  const inPoly = (s: number, t: number, P: number[][]): boolean => {
    let inside = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i];
      const [xj, yj] = P[j];
      if (yi > t !== yj > t && s < ((xj - xi) * (t - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const K = 1.6;
  const BODY = [[-0.2, -0.17], [-0.07, -0.2], [0, -0.16], [0.07, -0.2], [0.2, -0.17], [0.22, 0.2], [-0.22, 0.2]].map(([a, b]) => [a * K, b * K]);
  const SLEEVE = [[-0.2, -0.17], [-0.44, -0.04], [-0.4, 0.05], [-0.21, -0.04]].map(([a, b]) => [a * K, b * K]);
  const FL = SHIRT;
  const threads = (s: number, t: number): boolean => {
    if (s < 0.2 * K || s > 0.5 * K) return false;
    for (let k = 0; k < 4; k++) {
      const t0 = (-0.15 + k * 0.035) * K;
      const tt = t0 + (s - 0.2 * K) * (0.5 + k * 0.12);
      if (Math.abs(t - tt) < 0.016) return true;
    }
    return false;
  };
  return lying(150, 80, 75, 40, (u, v, _px, py) => {
    const s = (u - v) * 0.707 * 1.0;
    const t = (u + v) * 0.707 * 0.5 * 2;
    const wt = (py & 1) === 0 ? 1 : 0;
    if (inPoly(s, t, BODY) || inPoly(s, t, SLEEVE)) {
      // the weave in rows, a fold of shade, its lit upper left edge
      const edge = !inPoly(s - 0.012, t - 0.012, BODY) && !inPoly(s - 0.012, t - 0.012, SLEEVE);
      if (edge) return FL[4];
      if (Math.abs(s - 0.06) < 0.016 && t > -0.16) return FL[1];
      if (Math.abs(s) < 0.05 && t < -0.2) return FL[0];
      return wt ? FL[3] : FL[2];
    }
    if (threads(s, t)) return FL[3];
    // the hank of flax, the bundle of stalks
    if (Math.hypot((s - 0.84) / 0.1, (t - 0.18) / 0.065) < 1) return Math.hypot((s - 0.81) / 0.1, (t - 0.15) / 0.065) < 0.6 ? FL[4] : FL[2];
    for (let k = 0; k < 4; k++) if (Math.abs(t - (0.38 + k * 0.026) - (s + 0.1) * 0.15) < 0.012 && s > -0.5 && s < 0.2) return k % 2 ? NETTLE[3] : STEM;
    return null;
  }, [{ x: 75 / 2, y: 38 / 2, r: 28, color: '#e8e2d2', a: 0.3 }]);
}

// =================================================================================================
// THE GATE, THE LANTERN, THE LANDING, THE NEST, THE GARDENERS' THINGS

/** A GARDEN GATE: two stone piers with balls on them, an iron gate of two leaves between, a scroll over it; shut, or open; across x (`k` 0) or across y (1). 120 x 130 at (60, 100). */
function gardenGate(open: boolean, k: number): Sprite {
  const S = turned(scene(120, 130, 60, 100), k);
  for (const x of [-26, 26]) {
    S.box([x, 0, 26], AXES, [5, 5, 26], (f, u, v, n) => (f === 4 ? LIMESTONE[3] : f === 2 ? coursed(n, u * 52, v * 8, 7251) : coursed(n, v * 52, u * 8, 7251)), 1);
    S.box([x, 0, 53], AXES, [6, 6, 1.5], (_f, _u, _v, n) => toneAt(n, LIMESTONE, 0.15), 1);
    S.ball([x, 0, 60], 4.5, LIMESTONE, 1, undefined, 0.05);
  }
  // the leaves: each hung on its pier, its bars upright, a rail top and bottom, swung open or shut
  const ang = open ? 1.25 : 0;
  for (const side of [-1, 1]) {
    const hx = side * 21;
    const P = (a: number, z: number): V3 => [hx - side * Math.cos(ang) * a, -Math.sin(ang) * a * side * side, z];
    S.rod(P(0, 4), P(21, 4), 0.8, 0.8, IRON, 2);
    S.rod(P(0, 40), P(21, 42), 0.8, 0.8, IRON, 2);
    for (let b = 1; b <= 6; b++) S.rod(P(b * 3.3, 2), P(b * 3.3, 41 + b * 0.4), 0.6, 0.6, IRON, 2);
    // (its spear points)
    for (let b = 1; b <= 6; b++) S.rod(P(b * 3.3, 41 + b * 0.4), P(b * 3.3, 45 + b * 0.4), 0.7, 0.2, IRON, 2);
  }
  if (!open) {
    // the scroll over the shut gate: an arch of iron
    for (let i = 0; i < 16; i++) {
      const a0 = (i / 16) * Math.PI;
      const a1 = ((i + 1) / 16) * Math.PI;
      S.rod([Math.cos(a0) * -21, 0, 46 + Math.sin(a0) * 10], [Math.cos(a1) * -21, 0, 46 + Math.sin(a1) * 10], 0.7, 0.7, IRON, 3);
    }
  }
  return done(S, 60, 100);
}
/** A LANTERN ON A POST: a post of stone, an iron lantern on it, its candle still burning on into the dawn (an honest flame). 50 x 100 at (25, 86). */
function lantern(): Sprite {
  const S = scene(50, 100, 25, 86);
  return done(S, 25, 86, lanternIn(S));
}
/** (its light, a world point) */
function lanternIn(S: Scene): { at: V3; r: number; color: string; a: number }[] {
  S.box([0, 0, 18], AXES, [4.5, 4.5, 18], (f, u, v, n) => (f === 4 ? LIMESTONE[3] : f === 2 ? coursed(n, u * 36, v * 7, 7261) : coursed(n, v * 36, u * 7, 7261)), 1);
  S.box([0, 0, 37], AXES, [5.5, 5.5, 1], (_f, _u, _v, n) => toneAt(n, LIMESTONE, 0.15), 1);
  // the lantern: a frame of iron, panes of glass with the candle in them, a little roof, a ring
  for (const [x, y] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) S.rod([x, y, 38], [x, y, 52], 0.6, 0.6, IRON, 2);
  S.box([0, 0, 45], AXES, [3.6, 3.6, 7], (f, _u, v) => (f === 4 ? null : v > 0.25 && v < 0.75 ? (f === 2 ? '#c89048' : '#8a5a32') : '#2a2430'), 3);
  S.rod([0, 0, 40], [0, 0, 45], 0.9, 0.9, ['#d8ccb4', '#d8ccb4', '#e8e0cc', '#efe8d8', '#f6f0e4'], 4);
  for (const [x, y, c] of [[0, 1, 0], [0, 0, 1]] as const) {
    const [px, py] = S.at([x, y, 47]);
    S.put(Math.round(px), Math.round(py), 1e4, CANDLE[c], 5);
    S.put(Math.round(px), Math.round(py) - 1, 1e4, CANDLE[1], 5);
  }
  for (let i = 0; i < 4; i++) S.quad([[-5, -5, 52], [5, -5, 52], [0, 0, 58], [0, 0, 58]].map((p) => {
    const a = (i * Math.PI) / 2;
    return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]] as V3;
  }) as unknown as [V3, V3, V3, V3], (_u, _v, w) => toneAt([w[0] / 8, w[1] / 8, 0.8], IRON, 0.1), 6);
  S.ball([0, 0, 59], 1.4, IRON, 6);
  return [{ at: [0, 0, 47], r: 16, color: EMBER[2], a: 0.32 }];
}
/**
 * A BOAT AT THE LANDING: a landing stage of planks on posts out over the lake's edge, a little rowing boat moored at it,
 * its oars shipped. It stands at the water's edge: its back half on the lawn's kerb, its front over the lake. 130 x 90 at (65, 50).
 */
function boatLanding(): Sprite {
  const LIFT = 10;
  const S = scene(130, 96, 65, 60);
  // the stage: planks along y over posts, out from the shore (at -y) over the water (+y)
  for (const [x, y] of [[-13, 14], [13, 14], [-13, 30], [13, 30]]) S.rod([x, y, 0], [x, y, LIFT + 1], 2, 2, ['#120e10', '#1e1618', '#2c2224', '#3c3030', '#4c3e3a'], 1);
  S.box([0, 10, LIFT + 1.5], AXES, [15, 22, 1.5], (f, u, v, n) => (f === 4 ? (fr(v * 9) < 0.1 ? OAK[0] : toneAt(n, OAK, 0.15 + (hash(Math.floor(v * 9), 0, 7271) - 0.5) * 0.2)) : toneAt(n, OAK, -0.1)), 2);
  // the boat beside it on the water, lying along y: its hull out of the water, its open inside, a thwart, the oars shipped
  const bx = 32;
  S.egg([bx, 22, 1], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [26, 9, 8], (n) => toneAt(n, OAK, -0.05), 3, (w) => w[2] <= 6);
  S.quad([[bx - 8, 0, 6], [bx + 8, 0, 6], [bx + 8, 44, 6], [bx - 8, 44, 6]], (u, v) => {
    const e = ((u - 0.5) / 0.5) ** 2 + ((v - 0.5) / 0.5) ** 2;
    if (e > 1) return null;
    if (e > 0.74) return OAK[3];
    return Math.abs(v - 0.55) < 0.05 ? OAK[2] : fr(u * 5) < 0.12 ? '#1a1214' : OAK[1];
  }, 4);
  S.rod([bx - 4, 10, 8], [bx - 3, 40, 8], 0.8, 0.7, OAK, 5);
  S.rod([bx + 4, 12, 8], [bx + 3, 38, 8], 0.8, 0.7, OAK, 5);
  S.rod([14, 18, LIFT + 4], [bx - 5, 14, 7], 0.4, 0.4, ['#3a3226', '#4e4430', '#625840', '#7a6e52', '#948866'], 6);
  return done(S, 65, 60 - LIFT);
}
/** A SWAN'S NEST by the water: a great mound of reeds and sticks, lined with white down, three pale eggs in it. 80 x 56 at (40, 40). */
function swanNest(): Sprite {
  const S = scene(90, 64, 45, 44);
  S.egg([0, 0, 3], AXES, [21, 18, 7], (n, w) => {
    const g = fr(Math.atan2(w[1], w[0]) * 3.2 + Math.hypot(w[0], w[1]) * 0.45) < 0.32;
    return toneAt(n, REED, g ? -0.4 : 0.1);
  }, 1);
  // (sticks and reeds laid round its rim)
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + hash(i, 1, 7282) * 0.3;
    const r0 = 13 + hash(i, 2, 7282) * 4;
    S.rod([Math.cos(a) * r0, Math.sin(a) * r0, 6], [Math.cos(a + 0.7) * (r0 + 5), Math.sin(a + 0.7) * (r0 + 5), 3], 0.8, 0.6, REED, 2);
  }
  // its hollow lined with down, three eggs in it
  S.egg([0, 0, 8], AXES, [11, 9, 2.2], (n, w) => (hash(Math.floor(w[0] / 1.4), Math.floor(w[1] / 1.4), 7281) < 0.35 ? SWANW[4] : toneAt(n, SWANW, -0.15)), 3);
  for (const [x, y] of [[-3.5, -2], [3.5, -1.5], [0, 3.5]]) S.egg([x, y, 10.5], AXES, [3.2, 2.5, 2.4], (n) => toneAt(n, ['#5a564e', '#7e786c', '#a8a090', '#c8c0ae', '#ddd6c4'], 0.15), 4);
  return done(S, 45, 44);
}
/** A GARDENER'S BARROW: a wooden barrow, its wheel, its handles, a load of yew clippings; or tipped over and broken, the wheel off, the clippings spilled. 90 x 70 at (45, 50). */
function barrow(broken: boolean): Sprite {
  const S = scene(90, 70, 45, 50);
  if (!broken) {
    S.box([0, 0, 11], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [12, 9, 4], (f, u, v, n) => (f === 4 ? null : toneAt(n, OAK, fr((f === 2 ? v : u) * 4) < 0.08 ? -0.6 : 0)), 1);
    S.quad([[-12, -9, 7.5], [12, -9, 7.5], [12, 9, 7.5], [-12, 9, 7.5]], () => '#1a1214', 1);
    for (let i = 0; i < 7; i++) S.egg([-8 + i * 2.6, (hash(i, 1, 7291) - 0.5) * 10, 15 + hash(i, 2, 7291) * 2], AXES, [4, 4, 3], (n, w) => clumpy(n, YEW, w, 7292), 2);
    S.egg([16, 0, 6], [[1, 0, 0], [0, 0, 1], [0, 1, 0]], [6, 6, 1.4], (n) => toneAt(n, OAK, -0.1), 3);
    S.rod([-10, -6, 9], [-26, -7, 13], 1, 1, OAK, 4);
    S.rod([-10, 6, 9], [-26, 7, 13], 1, 1, OAK, 4);
    S.rod([-8, -6, 7], [-9, -6, 0], 0.9, 0.9, OAK, 4);
    S.rod([-8, 6, 7], [-9, 6, 0], 0.9, 0.9, OAK, 4);
  } else {
    // tipped on its side, a board split off, the wheel rolled away, the clippings strewn
    S.box([0, 0, 8], [[1, 0, 0], [0, 0, 1], [0, -1, 0]], [12, 8, 4], (f, u, v, n) => toneAt(n, OAK, fr((f === 2 ? v : u) * 4) < 0.08 ? -0.6 : 0), 1);
    S.egg([22, 14, 1.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6, 6, 1.4], (n) => toneAt(n, OAK, -0.1), 3);
    S.rod([-16, 10, 1], [-2, 14, 1], 1.2, 1.2, OAK, 4);
    for (let i = 0; i < 9; i++) S.egg([-14 + hash(i, 1, 7293) * 30, 4 + hash(i, 2, 7293) * 14, 1.5], AXES, [3.4, 3, 1.8], (n, w) => clumpy(n, YEW, w, 7294), 2);
  }
  return done(S, 45, 50);
}
/** CLIPPINGS AND SHEARS: a heap of yew clippings, the shears lying open by it, a wicker basket. On the floor. 90 x 56 at (45, 34). */
function clippings(): Sprite {
  const S = scene(90, 56, 45, 34);
  for (let i = 0; i < 10; i++) S.egg([-6 + (hash(i, 1, 7301) - 0.5) * 18, (hash(i, 2, 7301) - 0.5) * 12, 2 + hash(i, 3, 7301) * 2.5], AXES, [4.5, 4, 2.8], (n, w) => clumpy(n, YEW, w, 7302), 1);
  // the shears: two long blades crossed at their pivot, two wooden handles
  S.rod([10, 8, 0.6], [26, 2, 0.6], 0.7, 0.4, IRON, 2);
  S.rod([10, 8, 0.6], [25, 12, 0.6], 0.7, 0.4, IRON, 2);
  S.rod([10, 8, 0.6], [2, 12, 0.6], 0.9, 0.9, OAK, 3);
  S.rod([10, 8, 0.6], [3, 16, 0.6], 0.9, 0.9, OAK, 3);
  cylinder(S, -16, -8, (z) => 6 + z * 0.2, 0, 7, (n, a, z) => toneAt(n, REED, fr(a * 6 + z * 0.3) < 0.3 ? -0.3 : 0.05), 4, (_a, rr) => (rr > 0.82 ? REED[3] : '#1a1412'));
  return done(S, 45, 34);
}

/** SWAN FEATHERS, fallen on the grass: long white quills, a few small ones, scattered. On the floor. 80 x 44 at (40, 22). */
function swanFeathers(): Sprite {
  const F: [number, number, number, number][] = [];
  for (let i = 0; i < 6; i++) F.push([(hash(i, 1, 7311) - 0.5) * 1.2, (hash(i, 2, 7311) - 0.5) * 0.9, hash(i, 3, 7311) * Math.PI, i < 3 ? 0.38 : 0.2]);
  return lying(80, 44, 40, 22, (u, v) => {
    for (const [cx, cy, a, L] of F) {
      const du = u - cx;
      const dv = v - cy;
      const along = du * Math.cos(a) + dv * Math.sin(a);
      const across = -du * Math.sin(a) + dv * Math.cos(a);
      if (Math.abs(along) > L / 2) continue;
      const t = (along + L / 2) / L;
      const wdt = 0.045 * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (L / 0.38);
      if (Math.abs(across) < 0.007) return SWANW[2];
      if (Math.abs(across) < wdt) return across < 0 ? SWANW[4] : SWANW[3];
    }
    return null;
  });
}

// =================================================================================================
// HER VINES IN THE GARDENS (his, to the art chat, 28 Oct: “Can you put some of these vines into the map as well?  Around
// where the hushed gardeners are at.  So you’re like “huh those vines are weird” then the boss has the big vine”; “Once
// we lock in the look.  So they match”; the look locked: “Yes, lock it (Recommended)”). Her vine as her whip and
// her cage are drawn (art/princess_vine.ts, one recipe), grown through the gardeners' corner: over a terrace wall, through the
// box edging, up a lantern's post, across the walk, and out of a yew, reaching, that draws back into it as you pass. Its thorns are
// pale and untipped: the dull pink is hers alone, on her (his rulebook, Colour 3: no pink in a place). Beyond the
// Princess's twenty-five: his ask.

const TONES: Ramp = ['0', '1', '2', '3', '4'];
const v3 = (p: readonly number[]): V3 => [p[0], p[1], p[2]];
/** A smooth line through `ctrl` (a curve through each), a point every `step` units along it. */
function through(ctrl: readonly V3[], step: number): V3[] {
  const dense: V3[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let k = 0; k < 24; k++) {
      const t = k / 24;
      dense.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t)) as V3);
    }
  }
  dense.push(ctrl[ctrl.length - 1]);
  const out: V3[] = [dense[0]];
  let acc = 0;
  for (let i = 1; i < dense.length; i++) {
    acc += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1], dense[i][2] - dense[i - 1][2]);
    if (acc >= step) {
      out.push(dense[i]);
      acc = 0;
    }
  }
  if (acc > step * 0.4) out.push(dense[dense.length - 1]);
  else out[out.length - 1] = dense[dense.length - 1];
  return out;
}
/** HER VINE through `pts`, `ra` thick at its root, built in the scene; what of it is below the floor is in the floor (its leaves too). */
function herVineIn(S: Scene, pts: readonly V3[], ra: number, seed: number, id: number): void {
  const keep = (w: V3): boolean => w[2] >= 0;
  const brush: VineBrush = {
    wood: (a, b, r, ramp) => S.rod(v3(a), v3(b), r, r, ramp, id, keep),
    knot: (c, r) => S.ball(v3(c), r, VINE_WOOD_PALE, id, keep),
    leaf: (at, out, size, sd) => {
      if (at[2] < 0.5) return;
      const { c, A, r } = leafShape(at, out, [0, 0, -1], size, 0, sd);
      S.egg(v3(c), [v3(A[0]), v3(A[1]), v3(A[2])], v3(r), (n, w) => {
        const q = sub(local(S, w), c);
        return leafFace([dot(q, A[0]) / r[0], dot(q, A[1]) / r[1], dot(q, A[2]) / r[2]], Number(toneAt(n, TONES)), sd, VINE_LEAF);
      }, id + 1, keep);
    },
    tendril: (a, b, r0, r1) => S.rod(v3(a), v3(b), r0, r1, VINE_LEAF, id, keep),
    thorn: (a, b) => S.rod(v3(a), v3(b), 0.75, 0.15, VINE_THORN, id, keep),
  };
  // (the way across the picture, in the piece's own frame: a tendril curls across it)
  const acr = local(S, [Math.SQRT1_2, -Math.SQRT1_2, 0]);
  herVine(pts, ra, seed, brush, norm(acr, [1, 0, 0]));
}

/** BOX EDGING, HER VINE THROUGH IT: up out of the lawn on its near side, over its top and along it, and down into the lawn behind. Along x (`k` 0) or along y (1). 124 x 92 at (62, 58). */
function boxVined(k: number): Sprite {
  const S = turned(scene(124, 92, 62, 58), k);
  boxEdgingIn(S);
  herVineIn(S, through([[-30, 16, -3], [-26, 12, 4], [-20, 7, 9], [-14, 3, 13.5], [-8, -1, 14.5], [-1, 1, 15], [6, -2, 14.5], [12, 0, 15.5], [18, -4, 12], [22, -8, 6], [27, -13, 2], [32, -17, -3]], 9), 2.3, 7801, 11);
  // (a second, younger runner off it, along the hedge's near foot)
  herVineIn(S, through([[-14, 8, -2], [-9, 7, 3], [-2, 7, 4.5], [5, 7, 3], [11, 8, -2]], 9), 1.3, 7802, 13);
  return done(S, 62, 58);
}
/**
 * A TERRACE WALL, HER VINE OVER IT: up out of the lawn at its foot, up its face, over the coping, round a baluster and along
 * the rail, and hanging back down its face. Along x (`k` 0) or along y (1). 110 x 140 at (55, 100), as the wall.
 */
function wallVined(k: number): Sprite {
  const S = turned(scene(110, 140, 55, 100), k);
  terraceWallIn(S, false);
  herVineIn(S, through([[-17, 27, -3], [-16, 23, 6], [-14, 21.6, 14], [-11, 21.6, 23], [-8, 21.8, 31], [-6, 19, 37.5], [-5, 17.5, 41], [-5.5, 18.5, 48], [-4, 18, 56], [0, 16, 60.5], [7, 16, 61], [13, 17, 60], [16, 20, 55], [17, 21.8, 46], [17.5, 22, 36], [18.5, 22.2, 27]], 8), 2.3, 7841, 11);
  return done(S, 55, 100);
}
/** A LANTERN ON A POST, HER VINE UP IT: wound twice round its post up out of the lawn, under its cap, and over the lip, hanging. 76 x 108 at (38, 92). */
function lanternVined(): Sprite {
  const S = scene(76, 108, 38, 92);
  const lights = lanternIn(S);
  const coil: V3[] = [];
  for (let i = 0; i <= 28; i++) {
    const u = i / 28;
    const a = Math.PI / 4 + u * Math.PI * 2 * 1.75;
    coil.push([Math.cos(a) * 6.5, Math.sin(a) * 6.5, -3 + u * 37]);
  }
  const top = coil[coil.length - 1];
  const out = norm([top[0], top[1], 0], [1, 0, 0]);
  coil.push([top[0] + out[0] * 3, top[1] + out[1] * 3, 37.5], [top[0] + out[0] * 6.5, top[1] + out[1] * 6.5, 35], [top[0] + out[0] * 8, top[1] + out[1] * 8, 29], [top[0] + out[0] * 8.5, top[1] + out[1] * 8.5, 22]);
  herVineIn(S, through(coil, 8), 2.0, 7811, 11);
  return done(S, 38, 92, lights);
}
/** HER VINE ACROSS THE WALK: up out of the gravel two tiles apart, low across the walk in humps, and down; a young one beside it. Lying on the floor. Along x (`k` 0) or along y (1). 150 x 80 at (75, 44). */
function walkVined(k: number): Sprite {
  const S = turned(scene(150, 80, 75, 44), k);
  herVineIn(S, through([[-40, 6, -4], [-34, 5, 5], [-25, 3, 10], [-16, 1, 4], [-8, -1, 6], [1, -2, 11], [10, -1, 7], [18, 1, 3], [27, 3, 9], [35, 5, 5], [40, 6, -4]], 10), 2.3, 7821, 11);
  herVineIn(S, through([[-18, 13, -3], [-12, 12, 3], [-4, 11, 5], [4, 12.5, -3]], 10), 1.2, 7822, 13);
  return done(S, 75, 44);
}
/**
 * A YEW CONE, HER VINE REACHING OUT OF IT: out of the yew at a man's knee, down to the lawn and along it toward the walk,
 * its tip lifted, feeling the air. Its frames: reaching (still); its tip twitching up and curling; drawn back half into
 * the yew; gone into it, a few leaves left at its foot. The game shows the first, and as someone comes near plays the
 * rest once and keeps the last (as the nettles stir). 150 x 140 at (94, 100).
 */
function yewVined(f: number): Sprite {
  const S = scene(150, 140, 94, 100);
  yewConeIn(S);
  // (its whole length, from deep in the yew to its tip; each frame shows it from its root out to as far as it reaches)
  const lift = f === 1 ? 1 : 0;
  const path = through([[0, 2, 26], [1, 10, 23], [2, 16, 17], [1, 22, 9], [-1, 30, 4], [-5, 40, 4], [-7, 51, 5], [-5, 62, 5], [-1, 71 - 3 * lift, 10 + 8 * lift], [3, 74 - 6 * lift, 16 + 13 * lift], [6, 70 - 5 * lift, 18 + 14 * lift]], 9);
  const reach = [1, 1, 0.55, 0.3][f];
  const n = Math.max(4, Math.round(path.length * reach));
  // (drawn back, it slides back along its own length into the yew: what is still out is the part nearest its root)
  herVineIn(S, path.slice(0, n), 2.3, 7831, 11);
  return done(S, 94, 100);
}

// =================================================================================================
// THE SET

let made: Piece[] | null = null;
/** THE SWAN GARDENS' OWN PIECES, the Princess's twenty-five, made the first time they are asked for and kept. */
export function swanGardensPieces(): Piece[] {
  if (made) return made;
  made = [
    // (frames: along x, along y)
    { name: 'a terrace wall', kind: 'obstacle', frames: [terraceWall(0), terraceWall(1)], shadow: 0 },
    { name: "a stair's pier", kind: 'obstacle', frames: [terraceWall(0, true), terraceWall(1, true)], shadow: 0 },
    // (walked on, and laid as what lies on the floor: drawn before all that stands; it rises, so it is not a flat floor tile)
    { name: 'the terrace stair', kind: 'on the floor', frames: [terraceStair(0), terraceStair(1)] },
    { name: 'a yew cone', kind: 'obstacle', frames: [yewCone()], shadow: 0.45 },
    { name: 'box edging', kind: 'obstacle', frames: [boxEdging(0), boxEdging(1)], shadow: 0.3 },
    { name: 'a rose bush', kind: 'breakable', frames: [roseBush(false), roseBush(true)], shadow: 0.35 },
    { name: 'a bay tree in its tub', kind: 'obstacle', frames: [bayTub()], shadow: 0.35 },
    { name: 'a topiary swan', kind: 'obstacle', frames: [topiarySwan()], shadow: 0.5 },
    { name: 'the still fountain', kind: 'obstacle', frames: [fountain()], shadow: 1.4 },
    { name: 'a stone swan on its plinth', kind: 'obstacle', frames: [stoneSwan()], shadow: 0.35 },
    { name: 'a sundial', kind: 'obstacle', frames: [sundial()], shadow: 0.25 },
    { name: 'a stone bench', kind: 'obstacle', frames: [bench(0), bench(1)], shadow: 0.4 },
    { name: 'an urn of roses', kind: 'breakable', frames: [urnOfRoses(false), urnOfRoses(true)], shadow: 0.3 },
    // (frames: whole along x, half there along x (someone under it), whole along y, half there along y)
    { name: 'a rose arbour', kind: 'obstacle', frames: [arbour(0, false), arbour(0, true), arbour(1, false), arbour(1, true)], shadow: 0.9 },
    { name: 'the Swan Pavilion on its island', kind: 'obstacle', frames: [pavilion()], shadow: 0 },
    // (frames: still, stirred)
    { name: 'nettles', kind: 'trap', frames: [nettles(false), nettles(true)] },
    { name: 'trodden nettles, for their flax', kind: 'on the floor', frames: [troddenNettles()] },
    { name: 'a nettle shirt, half woven', kind: 'quest', frames: [nettleShirt()], shadow: 0.3 },
    // (frames: shut and open across x, shut and open across y)
    { name: 'a garden gate', kind: 'gate', frames: [0, 1].flatMap((k) => [gardenGate(false, k), gardenGate(true, k)]), shadow: 0.6 },
    { name: 'a lantern on a post', kind: 'obstacle', frames: [lantern()], shadow: 0.25 },
    { name: 'a boat at the landing', kind: 'obstacle', frames: [boatLanding()], shadow: 0 },
    { name: "a swan's nest", kind: 'obstacle', frames: [swanNest()], shadow: 0.4 },
    { name: "a gardener's barrow", kind: 'breakable', frames: [barrow(false), barrow(true)], shadow: 0.4 },
    { name: 'clippings and shears', kind: 'on the floor', frames: [clippings()] },
    { name: 'swan feathers', kind: 'on the floor', frames: [swanFeathers()] },
  ];
  return made;
}

let vined: Piece[] | null = null;
/** HER VINES IN THE GARDENS, beyond the twenty-five (his ask, 28 Oct): made the first time they are asked for and kept. */
export function herVinesPieces(): Piece[] {
  if (vined) return vined;
  vined = [
    // (frames: along x, along y)
    { name: 'a terrace wall, her vine over it', kind: 'obstacle', frames: [wallVined(0), wallVined(1)], shadow: 0 },
    { name: 'box edging, her vine through it', kind: 'obstacle', frames: [boxVined(0), boxVined(1)], shadow: 0.3 },
    { name: 'a lantern on a post, her vine up it', kind: 'obstacle', frames: [lanternVined()], shadow: 0.25 },
    { name: 'her vine across the walk', kind: 'on the floor', frames: [walkVined(0), walkVined(1)] },
    // (frames: reaching, twitching, drawing back, gone back into the yew)
    { name: 'a yew cone, her vine reaching out of it', kind: 'obstacle', frames: [0, 1, 2, 3].map(yewVined), shadow: 0.45 },
  ];
  return vined;
}

/** The water a piece stands in, at a picture pixel of the world (for the dev pages: the lake under the pavilion). */
export const waterAt = lakeWater;
