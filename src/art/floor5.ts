// THE FLESHMANCER'S LAIR: the Crypt's fifth floor, themed after its boss (a mock-up; nothing of the game
// imports it).
//
// The owner, in the art chat, 11 Oct 2026, 13:00: “floor 5 is mostly dirt as you’re completely under the
// prison.  Full of cult iconography and abandoned mining equipment.  Instead of stairs at the end I’d like
// a mine shaft you ride up.” Asked which way the cage takes you, his pick by 13:05: “Up, out to town”
// (offered as: the Crypt is done, the cage hauls you up to the surface, and the next five floors start
// from town). His rule for every floor (10 Oct, 07:29): “I’d also like each floor to be themed after the
// boss.  Add this to the ruleset.  We need somewhere between 40-50 unique assets on each floor for each
// boss.  That can include wall tiles, floor tiles, breakables, stuff on the walls, on the floor,
// obstacles, the looks of doors and gates, traps, and quests.” (His art rulebook, Places 7.)
//
// THE BOSS, with his yes (11 Oct): the fleshmancer, “Hooded priest, hands of power”, known by “A staff
// topped with a skull”; he raises the dead out of the bone heaps round his room; and never: “Nothing gory
// (Recommended)”.
//
// SO FLOOR 5 IS THE MINE'S DEEPEST WORKINGS, UNDER THE PRISON, AND THE CULT HAS TAKEN THEM: dug earth and
// rock (art/lair.ts, the fifth look); the miners' gear left where they dropped it, timbering, rails, a
// winding drum, a pump, picks and kegs and lamps, all old and still; and over all of it the cult's own
// things: their hangings and robes, their black candles, their idols and their mark, the bone heaps he
// raises his dead from, and the crack in the floor where the ancient power came up (the rift: its light
// the deep end of his pink, kept dim and deep, the one place pink shows but his gate). At the end of it,
// in his hall, the miners' shaft, up which the cage hauls the hero to town (art/shaft.ts).
//
// THE CULT'S MARK, new, its own: THE SHRIEKING SKULL, face on, its jaw dropped wide open (as the skull of
// his staff opens its jaws when he casts): on their banners in bone-pale paint, daubed on the rock in
// chalk, cut in their stone over their gates; over his own gate its mouth burns with his pink. Chosen with
// care: never with bones behind it or crossed under it (a pirate's or poison's flag), never a cross, a
// star in a circle, letters, runes, an eye in a triangle, or a hand sign.
//
// THE RULES IT KEEPS (his art rulebook): crisp pixels, two to a game pixel, light from the upper left,
// three tones a material, the indigo seam between parts; a step quieter than the figures (the bone and
// earth in the walls darker than any word); no glow but an honest fire's orange (no cyan; pink only in his
// gate and, dim, deep in the rift); old, broken and grim but never gory (Places 6); no carved words.
//
// Measures as the game's (art/isokit.ts): picture pixels, two to a game pixel; a tile 64 x 32 on the
// screen; along +x 32 right and 16 down, along +y 32 left and 16 down; heights up. Things built in the
// world are measured in picture pixels across the floor too, KT (40) to a tile (art/floor2.ts); painted
// in depth with floor 4's painter (art/floor4.ts: Scene, skull, longBone, ribCage, and the rest).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { DIRT, OLD_IRON, ROCK, TIMBER } from './crypt';
import { LAIR, LAIR_ROCK } from './lair';
import { makeGateArt } from './gates';
import type { GateArt, Mark } from './gates';
import { GRAIN, INK, compose, hash, lit, mix } from './kit';
import type { Ramp } from './kit';
import { EMBER } from './props';
import { BEYOND, DEEP, PCX, PFOOT, box, flame, fx, fy, flat, mid, recolor, relief, shaded, sunk, tilesOf } from './floorkit';
import type { Piece, PieceKind, Spot } from './floorkit';
import {
  CART, Scene, XYZ, axesOf, boneHand, cartPt, dirOf, facetOf, inFront, longBone, onSeg, paintCart, ribCage, rot, skull, timberFace, toneAt, wallSprite, wheel,
} from './floor4';
import type { CartPose, V3, WallMake } from './floor4';
import { TOWARD } from './floor2';
import { shaftStill } from './shaft';

// =================================================================================================
// The colours

const THEME = LAIR;
/** The cult's stone, of their slabs and arches: from its shade to a lit edge. */
const STONE: Ramp = [THEME.shade[1], THEME.shade[2], THEME.lit[2], THEME.lit[4], mix(THEME.lit[4], '#ffffff', 0.1)];
/** The cult's stone as a face in a wall: its joint, its low tone, its usual, its high, a lit edge. */
const FACE: Ramp = [THEME.lit[0], THEME.lit[1], THEME.lit[2], THEME.lit[4], THEME.lit[4]];
const SLAB = THEME.slab;
/** The earth: the Crypt's dark plum. */
const EARTH = DIRT;
const EARTH_R: Ramp = [DIRT[0], DIRT[0], DIRT[1], DIRT[3], DIRT[3]];
/** The dug earth of a wall's face turned to the light, as the ground paints it (art/ground.ts, dugFace): its dark, low, usual, high, a lit lip. */
const DUG: Ramp = [mix(DIRT[0], THEME.lit[0], 0.2), mix(DIRT[1], THEME.lit[1], 0.34), mix(DIRT[2], THEME.lit[2], 0.34), mix(DIRT[3], THEME.lit[2], 0.34), mix(DIRT[3], THEME.lit[4], 0.42)];
/** Earth as what stands and lies (a heap, a slope): a step lighter where it is lit, so that it reads against the floor. */
const HEAP_EARTH: Ramp = [DIRT[0], DIRT[1], DIRT[2], DIRT[3], '#3e3048'];
/** Rock: the deep workings' own, packed with earth. */
const RAW: Ramp = [LAIR_ROCK[0], LAIR_ROCK[0], LAIR_ROCK[1], LAIR_ROCK[3], LAIR_ROCK[3]];
const ROCKY: Ramp = [LAIR_ROCK[0], LAIR_ROCK[0], LAIR_ROCK[1], LAIR_ROCK[2], LAIR_ROCK[3]];
/** Rock as what stands and lies: a step lighter, so that a stone reads against the earth. */
const BOULDER: Ramp = ['#16122a', LAIR_ROCK[0], LAIR_ROCK[2], LAIR_ROCK[3], '#5e5478'];
/** The Crypt's timber, its lit tones no further toward pink than its own. */
const TIMBER_DIM: Ramp = [TIMBER[0], TIMBER[1], TIMBER[2], TIMBER[3], TIMBER[3]];
/** Iron left in the damp (the Crypt's); small iron things a little brighter, so they read. */
const IRONS: Ramp = OLD_IRON;
const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
const DIM_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#4c4880', '#4c4880'];
/** Rust: a dull grey-brown (never the red of blood). */
const RUST: Ramp = ['#221a24', '#221a24', '#3c2e3a', '#4c3e48', '#4c3e48'];
const GLINT = '#9a96c8';
/** Ore: dark rock, a dull metal glint in it. */
const ORE: Ramp = ['#0e0c1a', '#16142a', '#262340', '#36334f', '#5c5880'];
/** Hemp rope and sacking, grey with age. */
const ROPE: Ramp = ['#1e1820', '#1e1820', '#4a3e48', '#6a5c64', '#7e7078'];
/**
 * BONE, CLEAN AND OLD: the warm grey of the fleshmancer's staff (art/fleshmancer.ts), duller and a step
 * quieter, as a place is; in what stands big in the room a step quieter again; in the walls darker than
 * any word. (Never floor 4's lavender bone, packed in its earth: his are cleaned and kept.)
 */
const BONE: Ramp = ['#201b22', '#363036', '#5e5856', '#827b74', '#968f86'];
const BIG_BONE: Ramp = ['#1b161d', '#2e292e', '#524c4b', '#726b66', '#837c75'];
const WALL_BONE: Ramp = ['#130f16', '#221c22', '#38323a', '#4c4646', '#57514f'];
/** The cult's black candles, and their wax run down. */
const WAX: Ramp = ['#100c18', '#100c18', '#262036', '#3c3452', '#4e4666'];
/** The cult's cloth, their hangings and robes: his robe's plum (art/fleshmancer.ts, FM_ROBE), darker and duller. */
const CLOTH: Ramp = ['#0f0710', '#1a0b1b', '#2b1230', '#3f1c46', '#4a2252'];
/** The pale paint of their mark, bone-coloured, on cloth (dull: never a glow). */
const PAINT = ['#4a4442', '#6a625c', '#7e766c'] as const;
/** Chalk, on the rock: pale and dull. */
const CHALK = ['#3a3448', '#504860', '#625a72'] as const;
/** Fired clay, old and dull. */
const CLAY: Ramp = ['#1c1424', '#2a1e30', '#4a3648', '#66505e', '#7a6270'];
/** Old leather and felt, black-brown. */
const LEATHER: Ramp = ['#0e0a12', '#18121c', '#30242e', '#483842', '#56444e'];
/** BLACK GLASS, where the ancient power came up through the rock and fused it: near black, its facets catching the light grey violet. */
const GLASS: Ramp = ['#07060c', '#0f0c17', '#1b1628', '#2b2440', '#4c4268'];
/** THE RIFT'S LIGHT in the pieces: the deep end of the enemy's pink only, dim (never brighter than FLAME[0], #7a1058). */
const RIFT: Ramp = ['#0e030b', '#1e0618', '#360a2a', '#560e40', '#7a1058'];
/** The enemy's pink, for his own gate. */
const PINK: Ramp = ['#3a0c2a', '#7a1058', '#c0206a', '#ff4f8a', '#ff4f8a'];
/** What gives off its own light: never shaded on a face in shade, nor faded into the dark at a wall's top. */
const SHINE = new Set<string>([...EMBER, '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058']);

const { tileOf, onTile, around } = tilesOf(THEME);

// =================================================================================================
// Little sums of the world

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** The earth of a floor tile: dark plum, mottled, a clod lit here and there. */
function earthAt(u: number, v: number, seed = 0): string {
  const g = hash(Math.floor(u * 22), Math.floor(v * 22), 750 + seed);
  const m = hash(Math.floor(u * 6), Math.floor(v * 6), 751 + seed);
  return g < 0.06 ? EARTH[3] : g < 0.14 ? EARTH[0] : m < 0.4 ? EARTH[2] : EARTH[1];
}
/** Dug earth in a wall's face, as the ground paints it: in layers, clods, the odd stone. (u, v) in the face. */
function dugAt(u: number, v: number, seed = 0): string {
  const w = v + Math.round(1.3 * Math.sin(u * 0.21 + seed));
  const band = Math.floor(w / 6);
  if (((w % 6) + 6) % 6 === 0 && hash(u >> 2, band, 760 + seed) < 0.45) return DUG[3];
  const cl = hash(u >> 1, v >> 1, 761 + seed);
  if (cl > 0.9) return (v & 1) === 0 ? DUG[3] : DUG[2];
  if (cl < 0.05) return DUG[1];
  return hash(band, seed, 762) < 0.4 ? DUG[1] : DUG[2];
}

// =================================================================================================
// THE CULT'S MARK

/**
 * THE SHRIEKING SKULL, face on, as a mark: (x, y) from its middle, in half its width (y up, from about
 * -1.15 at its chin to 1 at its crown): its bone, the dark of its sockets, nose and open mouth, or
 * nothing. Its cranium round; its sockets big; its upper teeth in a row; its jaw dropped far open, the
 * mouth a tall dark hollow between the hinges of the jaw, the lower teeth along its chin.
 */
export function shriekAt(x: number, y: number): 'bone' | 'dark' | null {
  const ax = Math.abs(x);
  const cran = Math.hypot(x / 0.76, (y - 0.42) / 0.62) <= 1;
  const cheek = y >= -0.2 && y <= 0.42 && ax <= 0.76 - (0.42 - y) * 0.32;
  const hinge = y >= -1 && y < -0.14 && ax >= 0.34 && ax <= 0.52 - Math.max(0, -0.82 - y) * 0.5;
  const chin = y >= -1.2 && y < -0.86 && ax <= 0.52 - (-0.86 - y) * 1.1;
  if (!cran && !cheek && !hinge && !chin) return null;
  // the sockets: slanted, their inner ends lower (a scowl, never the round eyes of something cute)
  for (const s of [-1, 1]) {
    const dx = x - s * 0.3;
    const dy = y - 0.2;
    const a = -s * 0.45;
    const u = dx * Math.cos(a) + dy * Math.sin(a);
    const v = -dx * Math.sin(a) + dy * Math.cos(a);
    if ((u / 0.2) ** 2 + (v / 0.13) ** 2 <= 1) return 'dark';
  }
  // the nose: a little hollow, pointed up
  if (y < -0.02 && y > -0.2 && ax < 0.1 * ((-0.02 - y) / 0.18) + 0.01) return 'dark';
  // the mouth: tall, its upper fangs down into it, its lower up
  if (y < -0.24 && y > -0.98 && ax < 0.34) {
    const tri = Math.abs((((x + 0.34) / 0.17) % 1) - 0.5) * 2;
    if (y > -0.24 - 0.16 * (1 - tri)) return 'bone';
    if (y < -0.98 + 0.13 * (1 - tri)) return 'bone';
    return 'dark';
  }
  return 'bone';
}

// =================================================================================================
// WALL PIECES: a flat picture in the face, what stands out of it built in the world, and fire over all

/** A ragged edge: a wobble of its own along `t`, about ±1 (`seed` its own). */
const ragged = (t: number, seed: number): number => 0.55 * Math.sin(t * 0.7 + seed) + 0.3 * Math.sin(t * 1.9 + seed * 2) + (hash(Math.floor(t), seed, 763) - 0.5) * 0.5;

// -------------------------------------------------------------------------------------------------
// WALL TILES

/**
 * THE LAGGED WALL, the wall's height: where the miners held the earth back: two squared posts set
 * against the face up into the dark, and boards laid across between them, one over another; one board
 * gone, the earth bulging out through the gap and spilling down; one split and sagging at its end; earth
 * run out at the foot. (Posts and boards only, no beam across their tops: nothing that reads as a door.)
 */
const LAG_BOARDS: ReadonlyArray<readonly [number, number, number]> = [[3, 0.02, 0], [10, -0.02, 0], [17, 0.03, 0], [31, -0.03, 1], [38, 0.02, 0], [45, -0.02, 0], [52, 0.03, 0]];
/** Earth, packed, as what stands out of a wall or lies: its tone as it is turned, clods lit here and there. */
const clodded = (n: V3, w: V3): string => (hash(Math.floor(w[0] / 1.6), Math.floor(w[2] / 1.6) + Math.floor(w[1] / 1.6) * 5, 764) < 0.14 ? HEAP_EARTH[3] : hash(Math.floor(w[0] / 1.3), Math.floor(w[2] / 1.3), 765) < 0.1 ? HEAP_EARTH[0] : toneAt(n, HEAP_EARTH, 0.02));
/** A board: its face toward the room a little darker than the light would make it (old wood), a line of grain, its top edge lit, its underside dark. */
const boardFace = (z: number) => (f: number, u: number, v: number, n: V3): string => (f === 4 ? TIMBER[3] : f === 5 ? TIMBER[0] : f < 2 ? TIMBER[1] : v > 0.82 ? TIMBER[2] : v < 0.16 ? TIMBER[0] : Math.abs(v - 0.5 - 0.12 * Math.sin(u * 9 + z)) < 0.07 ? TIMBER[1] : toneAt(n, TIMBER_DIM, -0.35));
const laggedWall: WallMake = {
  solid: (S, W, alongX) => {
    const [A, B, U] = axesOf(W);
    const keep = inFront(alongX);
    let id = 100;
    // the earth bulging through where a board is gone, two stones in it
    S.egg(W(-1, 0.6, 24), [A, B, U], [11, 2.4, 3.4], clodded, id++, keep);
    S.egg(W(-5, 2.4, 24.5), [A, B, U], [2.2, 1.2, 1.6], facetOf(BOULDER, 0.02), id++, keep);
    S.egg(W(5, 2.2, 23.6), [A, B, U], [1.8, 1, 1.4], facetOf(BOULDER, 0.02), id++, keep);
    // the boards across, each a little askew, the earth dark between them; one split, its end sagging
    for (const [z, tilt, split] of LAG_BOARDS) {
      const along = norm(add(A, mul(U, tilt)));
      const up = norm(sub(U, mul(A, tilt)));
      if (split) {
        S.box(W(-4.5, 1.2, z), [along, B, up], [9.5, 0.8, 2.2], boardFace(z), id++);
        const sag = norm(add(A, mul(U, -0.36)));
        S.box(W(10, 1.4, z - 2.4), [sag, B, norm(cross(B, sag))], [5.6, 0.8, 2.1], boardFace(z + 3), id++);
      } else S.box(W(0, 1.2, z), [along, B, up], [14, 0.8, 2.2], boardFace(z), id++);
    }
    // the posts, up into the dark, one leaning a little
    S.box(W(-14.5, 3.6, 40), [A, B, U], [2.6, 2.4, 40], timberFace, id++);
    const lean = norm(add(U, mul(A, -0.05)));
    S.box(W(14.5, 3.6, 40), [norm(cross(B, lean)), B, lean], [2.6, 2.4, 40], timberFace, id++);
    // earth run out at the foot, through the gap and down
    S.egg(W(0, 2.6, 0), [A, B, U], [12, 3.4, 3], clodded, id++, keep);
    S.egg(W(-2, 2.2, 13), [A, B, U], [3.6, 1.2, 6.4], clodded, id++, keep);
  },
};

/**
 * THE CAVE-IN, the wall's height: the face fallen in: a great ragged hollow scooped out of it, dark at
 * its back, a lip of earth and stones hanging over it; one of the miners' posts snapped, its foot still
 * standing, its top fallen across; earth and stones poured down the face below. What came down lies
 * heaped on the floor before it (caveHeap).
 */
const CAVE_C: readonly [number, number] = [0, 30];
const caveR = (ang: number): number => 1 + 0.12 * Math.sin(3 * ang + 1.4) + 0.08 * Math.sin(7 * ang) + (hash(Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 14), 0, 765) - 0.5) * 0.24;
const CAVE = (u: number, v: number): boolean => {
  const du = (u - CAVE_C[0]) / 13.5;
  const dv = (v - CAVE_C[1]) / 15;
  return Math.hypot(du, dv) < caveR(Math.atan2(dv, du));
};
/** A STONE in a wall's face, flat: an irregular lump `r` across at (u, v), lit along its upper left, dark along its lower right, its shadow under it. */
function stoneFlat(p: Px, u0: number, v0: number, r: number, seed: number, ramp: Ramp = BOULDER): void {
  const R = Math.ceil(r) + 2;
  const inside = (u: number, v: number): boolean => {
    const a = Math.atan2(v - v0, u - u0);
    return Math.hypot((u - u0) / 1.15, v - v0) < r * (1 + 0.16 * Math.sin(a * 3 + seed) + 0.1 * Math.sin(a * 5 + seed * 2));
  };
  for (let v = v0 - R; v <= v0 + R; v++) for (let u = u0 - R - 1; u <= u0 + R + 1; u++) {
    if (!inside(u, v)) {
      if (inside(u - 1, v + 1) && !inside(u, v + 1)) p.set(fx(u), fy(v), DUG[0]);
      continue;
    }
    const lit_ = !inside(u - 1, v) || !inside(u, v + 1);
    const dark = !inside(u + 1, v) || !inside(u, v - 1);
    const facet = (u - u0) * 0.6 - (v - v0) * 0.8 + (hash(u >> 1, v >> 1, 820 + seed) - 0.5) * 2;
    p.set(fx(u), fy(v), lit_ && !dark ? ramp[3] : dark && !lit_ ? ramp[0] : facet < -r * 0.3 ? ramp[2] : ramp[1]);
  }
}
const caveIn: WallMake = {
  flat: (p) => {
    for (let v = 0; v <= 60; v++) {
      for (let u = -15; u <= 14; u++) {
        if (CAVE(u, v)) {
          // in it: the dark at its back, earth in the light at its foot (its floor), the lip over it in shade
          const floor = !CAVE(u, v - 3);
          const brow = !CAVE(u, v + 3);
          p.set(fx(u), fy(v), floor ? (CAVE(u, v - 1) ? DUG[2] : DUG[3]) : brow ? DEEP : hash(u >> 1, v >> 1, 766) < 0.2 ? EARTH[1] : EARTH[0]);
          continue;
        }
        // earth poured down the face below it, in a fan
        const below = v < CAVE_C[1] - 10 && Math.abs(u) < 9 + (CAVE_C[1] - 10 - v) * 0.15;
        if (below) p.set(fx(u), fy(v), hash(u, v >> 1, 767) < 0.25 ? HEAP_EARTH[3] : hash(u >> 1, v, 768) < 0.4 ? HEAP_EARTH[1] : HEAP_EARTH[2]);
        // the broken rim round it
        else if (CAVE(u - 2, v) || CAVE(u + 2, v) || CAVE(u, v + 2)) p.set(fx(u), fy(v), CAVE(u, v + 2) || CAVE(u + 2, v) ? DUG[0] : DUG[4]);
      }
    }
    // stones in the lip hanging over it, and in the earth poured down below it
    for (const [u, v, r, k] of [[-9, 45, 2.6, 1], [2, 47, 3.2, 2], [10, 42, 2.2, 3], [-6, 10, 2.4, 4], [5, 6, 3, 5], [-1, 15, 1.8, 6], [8, 13, 1.6, 7]] as const) stoneFlat(p, u, v, r, k);
  },
  solid: (S, W) => {
    const [A, B, U] = axesOf(W);
    let id = 120;
    // the snapped post: its foot standing at the hollow's side, its top fallen across the hollow
    S.box(W(-15.5, 3, 14), [A, B, U], [2.4, 2.2, 14], timberFace, id++);
    for (let j = 0; j < 4; j++) S.rod(W(-15.5 + (j - 1.5) * 1.1, 3, 27.5), W(-15.5 + (j - 1.5) * 1.6, 3.4, 30 + hash(j, 0, 769) * 3), 0.8, 0.2, TIMBER, id);
    id++;
    const fall = norm(add(A, mul(U, -0.42)));
    S.box(W(-2, 4.6, 33), [fall, B, norm(cross(B, fall))], [13, 2.2, 2.4], timberFace, id++);
  },
};
/** WHAT CAME DOWN IN THE CAVE-IN, heaped on the floor before it: earth in a fan, stones, the snapped post's top end. At the middle of the tile in front of the wall. */
function caveHeap(): Sprite {
  const W = 84;
  const H = 56;
  const cx = 42;
  const cy = 32;
  const S = new Scene(new Px(W, H), cx, cy);
  const under = new Px(W, H);
  for (let i = 0; i < 700; i++) {
    const a = hash(i, 1, 770) * Math.PI;
    const r = Math.sqrt(hash(i, 2, 770)) * 23;
    under.set(Math.round(cx - 3 + Math.cos(a) * r * 1.25), Math.round(cy - 7 + Math.sin(a) * r * 0.5), hash(i, 3, 770) < 0.22 ? EARTH[3] : r > 16 ? EARTH[1] : EARTH[2]);
  }
  // the earth heaped against the wall, in lumps
  for (const [x, y, rx, ry, h] of [[-8, -8, 15, 11, 6], [4, -10, 10, 8, 4.4], [-14, 2, 8, 7, 3.4]] as const) S.egg([x, y, 0], XYZ, [rx, ry, h], clodded, 1);
  let n = 0;
  for (const [x, y, r, t] of [[-14, -10, 4.2, 0.4], [-2, -15, 4.8, 1.2], [9, -9, 3.4, 2.1], [-9, 2, 2.8, 0.8], [4, -2, 2.4, 1.7], [15, -14, 2.8, 2.6]] as const) {
    const A0 = norm([Math.cos(t), Math.sin(t), 0.15]);
    const B0 = norm(cross([0, 0, 1], A0));
    S.egg([x, y, r * 0.45 + 2], [A0, B0, norm(cross(A0, B0))], [r * 1.15, r * 0.8, r * 0.55], facetOf(BOULDER, 0.02), 10 + n++);
  }
  // the post's top end, lying out of it
  const d = norm([0.9, 0.5, 0.05]);
  S.box([6, 6, 2.6], [d, norm(cross([0, 0, 1], d)), [0, 0, 1]], [10, 2.2, 2.2], timberFace, 30);
  S.seams();
  return compose(under, [S.p], null).sprite(cx, cy, GRAIN);
}

/**
 * THE DRILLED FACE: where the miners went into the rock with their drills: a face of bare rock in the
 * earth, the holes of their drills driven in all over it at every slant (scattered, never two side by
 * side), each dark with its lower lip lit; a length of fuse still hanging out of two; one blown, a ragged
 * crater, the rock about it blackened.
 */
const DRILL_ROCK = (u: number, v: number): boolean => {
  const a = Math.atan2(v - 26, u + 0.5);
  return ((u + 0.5) / 14.5) ** 2 + ((v - 26) / 21) ** 2 <= (1 + 0.08 * Math.sin(a * 5) + (hash(Math.floor((a + 4) * 3), 0, 772) - 0.5) * 0.14) ** 2;
};
const DRILL_HOLES: ReadonlyArray<readonly [number, number]> = [[-9, 38], [3, 42], [9, 33], [-3, 28], [-10, 19], [7, 16], [1, 9]];
function drilledFace(p: Px): void {
  for (let v = 3; v <= 50; v++) {
    for (let u = -15; u <= 14; u++) {
      if (!DRILL_ROCK(u, v)) continue;
      const edgeLit = !DRILL_ROCK(u - 1, v) || !DRILL_ROCK(u, v + 1);
      const edgeDark = !DRILL_ROCK(u + 1, v) || !DRILL_ROCK(u, v - 1);
      // (the rock in great flat facets, as it broke under the blasting)
      const fct = hash(Math.floor((u + 40) / 6 + v / 9), Math.floor((v - u * 0.4) / 7), 773);
      p.set(fx(u), fy(v), edgeLit ? RAW[3] : edgeDark ? RAW[0] : fct < 0.3 ? RAW[1] : fct < 0.8 ? RAW[2] : RAW[3]);
    }
  }
  // the blown hole: a ragged crater, the rock blackened about it
  for (let v = 17; v <= 31; v++) for (let u = -1; u <= 13; u++) {
    const d = Math.hypot((u - 6) / 6, (v - 24) / 6.4) + (hash(u, v, 774) - 0.5) * 0.18;
    if (d < 0.55) p.set(fx(u), fy(v), d < 0.35 ? DEEP : v < 24 ? RAW[3] : RAW[0]);
    else if (d < 1 && DRILL_ROCK(u, v)) p.set(fx(u), fy(v), hash(u, v, 775) < 0.5 ? '#141020' : '#1c1730');
  }
  // the drill holes: dark, their lower lip lit (the light falls into them from the upper left)
  for (const [u, v] of DRILL_HOLES) {
    p.rect(fx(u), fy(v + 1), 2, 2, DEEP);
    p.set(fx(u - 1), fy(v + 1), RAW[0]).set(fx(u), fy(v + 2), RAW[0]).set(fx(u), fy(v - 1), RAW[3]).set(fx(u + 1), fy(v - 1), RAW[3]).set(fx(u + 2), fy(v), RAW[3]);
  }
  // the fuses still hanging out of two, curling down
  for (const [u0, v0, len, way] of [[-9, 38, 9, 1], [1, 9, 5, -1]] as const) {
    for (let k = 0; k <= len; k++) {
      const u = u0 + Math.round(way * (Math.sin(k * 0.45) * 1.6 + k * 0.15));
      p.set(fx(u), fy(v0 - k), ROPE[3]).set(fx(u + 1), fy(v0 - k), ROPE[1]);
    }
  }
}

/**
 * THE PRIEST IN THE STONE, the wall's height: a tall slab of the cult's stone set in the earth, and cut
 * in it in relief their priest as they worship him: hooded, his face lost in the dark of his hood; his
 * robe falling to his feet; one hand up holding the staff with the skull at its head; the other held out,
 * its long fingers clawed; at his feet the dead, skulls, rising. A crack across it. Old, worn, in the
 * stone's own tones (no glow).
 */
const STELE = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 11.5 - (v > 62 ? (v - 62) * 0.3 : 0) && v >= 0 && v <= 76;
function priestAt(u: number, v: number): boolean {
  // his hood: a rounded cowl, a little to the left of the slab's middle
  if (Math.hypot((u + 1.5) / 5.2, (v - 52) / 6.2) <= 1) return true;
  // his robe: from his shoulders, widening to his feet, a little flared
  if (v >= 7 && v <= 48) {
    const t = (48 - v) / 41;
    const half = 4.6 + t * 4.8 + (v < 11 ? (11 - v) * 0.6 : 0);
    if (Math.abs(u + 1.5) <= half) return true;
  }
  // his staff, in his right hand (to the left), up past his hood, and its skull
  if (u >= -10 && u <= -9 && v >= 6 && v <= 62) return true;
  if (Math.hypot((u + 9.5) / 2.6, (v - 65) / 2.6) <= 1) return true;
  // the arm up to it
  if (onSeg(u, v, -5, 40, -9, 46).d < 1.6) return true;
  // the other arm held out, and its clawed fingers
  if (onSeg(u, v, 2, 40, 8, 37).d < 1.5) return true;
  for (const [x1, y1] of [[10.5, 39.5], [11, 37], [10.5, 34.5]] as const) if (onSeg(u, v, 8, 37, x1, y1).d < 0.7) return true;
  return false;
}
const SKULLS_AT_FEET: ReadonlyArray<readonly [number, number]> = [[-6, 4], [2, 3], [8, 6]];
function priestStone(p: Px): void {
  for (let v = 0; v <= 76; v++) for (let u = -13; u <= 12; u++) {
    if (!STELE(u, v)) continue;
    const edgeL = !STELE(u - 1, v);
    const edgeR = !STELE(u + 1, v);
    p.set(fx(u), fy(v), edgeL ? FACE[3] : edgeR ? FACE[0] : hash(u >> 2, v >> 2, 776) < 0.18 ? FACE[1] : FACE[2]);
  }
  // the field round him cut back deep, so that he stands out of it: the field in shadow
  for (let v = 2; v <= 70; v++) for (let u = -11; u <= 10; u++) if (STELE(u, v) && !priestAt(u, v) && Math.abs(u + 0.5) < 10.5) p.set(fx(u), fy(v), hash(u >> 1, v >> 1, 777) < 0.25 ? '#100d16' : FACE[0]);
  relief(p, [FACE[0], FACE[1], FACE[2], FACE[4], mix(FACE[4], '#ffffff', 0.1)], priestAt, -12, 12, 3, 70);
  // the dark of his hood, his face lost in it
  for (let v = 47; v <= 54; v++) for (let u = -5; u <= 2; u++) if (Math.hypot((u + 1.2) / 3.2, (v - 50.5) / 3.8) <= 1) p.set(fx(u), fy(v), DEEP);
  // the folds of his robe, cut in
  for (const [u0, u1] of [[-3, -5], [0, 1], [-1.5, -1.5]] as const) for (let v = 9; v <= 40; v += 1) {
    const t = (40 - v) / 31;
    p.set(fx(Math.round(lerp(u0, u1 * 2.4, t))), fy(v), FACE[0]);
  }
  // the skull at his staff's head: its sockets
  p.set(fx(-10), fy(65), FACE[0]).set(fx(-9), fy(65), FACE[0]);
  // the dead at his feet: skulls rising out of the stone's foot
  for (const [u, v] of SKULLS_AT_FEET) {
    relief(p, FACE, (x, y) => Math.hypot((x - u) / 2.6, (y - v) / 2.4) <= 1, u - 3, u + 3, v - 3, v + 3);
    p.set(fx(u - 1), fy(v), FACE[0]).set(fx(u + 1), fy(v), FACE[0]);
  }
  // a crack down across a corner of the slab, its lower lip lit
  let v = 22;
  for (let u = 5; u <= 10; u++) {
    v -= hash(u, 0, 778) < 0.5 ? 2 : 1;
    if (!STELE(u, v)) continue;
    p.set(fx(u), fy(v), DEEP).set(fx(u), fy(v - 1), FACE[4]);
  }
}

/**
 * THE SHRINE IN THE EARTH: a niche dug into the wall, round-headed, a slab of the cult's stone for its
 * sill; on the sill in the niche a skull looking out, a black candle burning to either side of it (never
 * in its eyes); wax run down over the sill and the earth under it. (No bone laid by the skull: a skull
 * over a bone reads as the pirate's flag.)
 */
const SHRINE_IN = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 8.5 && v >= 12 && (v <= 27 || (u + 0.5) ** 2 + ((v - 27) * 1.3) ** 2 <= 8.5 ** 2);
const SHRINE_CANDLES: ReadonlyArray<readonly [number, number, number]> = [[-7.5, 0.5, 7], [6.8, -0.2, 5]];
function shrine(f: number): WallMake {
  return {
    flat: (p) => {
      // the niche: dark at its back, its sides in the light or shade, earth round its rim
      sunk(p, DUG, SHRINE_IN, -10, 9, 12, 40, DEEP);
      for (let v = 12; v <= 40; v++) for (let u = -10; u <= 9; u++) if (SHRINE_IN(u, v) && !SHRINE_IN(u, v + 2)) p.set(fx(u), fy(v), DUG[0]);
      // the sill, a slab of the cult's stone, and the wax run down over it
      for (let u = -11; u <= 10; u++) for (let v = 9; v <= 12; v++) p.set(fx(u), fy(v), v === 12 ? STONE[3] : u === -11 ? STONE[3] : v === 9 ? STONE[0] : STONE[2]);
      for (const [u, n] of [[-7, 5], [-6, 3], [7, 6], [8, 2]] as const) for (let k = 0; k < n; k++) p.set(fx(u), fy(10 - k), WAX[k === n - 1 ? 1 : 3]);
    },
    solid: (S, W, alongX) => {
      const toW = dirOf(W);
      const keep = inFront(alongX);
      skull(S, { c: W(-0.4, -2.2, 17.4), F: toW([0.12, 1, 0.08]), U: toW([0, 0, 1]), R: 4.6, jaw: 0.12 }, WALL_BONE, 140, keep);
      // the candles, and their wax pooled at their feet
      SHRINE_CANDLES.forEach(([a, b, h], k) => {
        S.rod(W(a, b, 12.6), W(a, b, 12.6 + h), 1.35, 1.35, WAX, 141 + k);
        S.egg(W(a, b, 12.8), [axesOf(W)[0], axesOf(W)[1], [0, 0, 1]], [2.2, 1.8, 0.6], () => WAX[2], 141 + k);
      });
    },
    fire: (p, alongX) => {
      SHRINE_CANDLES.forEach(([a, b, h], k) => {
        const x = Math.round(a * 0.8 + (alongX ? -0.8 : 0.8) * b * 0.8);
        flame(p, fx(x), fy(Math.round(12.6 + h + 0.4 * b + 1)), 5 + ((f + k) % 2), 1.3, [0, 1, 0, -1][(f + k) % 4]);
      });
    },
  };
}

/**
 * THE BOARDED ADIT, the wall's height: the mouth of an old side tunnel dug into the face, its two side
 * posts of timber, boarded shut with planks nailed across at their own slants, none crossing another;
 * dark between them; the cult's mark daubed across the boards in chalk.
 */
const ADIT = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 10.5 && v >= 0 && (v <= 40 || (u + 0.5) ** 2 + ((v - 40) * 1.45) ** 2 <= 10.5 ** 2);
const ADIT_PLANKS: ReadonlyArray<readonly [number, number, number]> = [[1, 0.04, 8], [10.5, -0.05, 9], [21, 0.07, 8], [30.5, -0.06, 9], [41, 0.03, 7]];
function boardedAdit(p: Px): void {
  for (let v = 0; v <= 58; v++) for (let u = -13; u <= 12; u++) {
    if (ADIT(u, v)) p.set(fx(u), fy(v), DEEP);
    else if (ADIT(u - 1, v) || ADIT(u + 1, v) || ADIT(u, v - 1)) p.set(fx(u), fy(v), ADIT(u + 1, v) ? DUG[4] : DUG[0]);
  }
  // the posts either side, squared timber
  for (const u0 of [-11, 9]) for (let v = 0; v <= 46; v++) p.set(fx(u0), fy(v), TIMBER[3]).set(fx(u0 + 1), fy(v), TIMBER[2]).set(fx(u0 + 2), fy(v), TIMBER[0]);
  // the planks, each at its own slant, the dark showing between
  const plankAt = (u: number, v: number): number => {
    for (let i = 0; i < ADIT_PLANKS.length; i++) {
      const [v0, slope, h] = ADIT_PLANKS[i];
      const c = v0 + slope * u;
      if (v >= c && v < c + h) return i;
    }
    return -1;
  };
  for (let v = 0; v <= 50; v++) for (let u = -12; u <= 11; u++) {
    const i = plankAt(u, v);
    // (one plank broken short, the dark showing past its end)
    if (i < 0 || (i === 2 && u > 6)) continue;
    const [v0, slope, h] = ADIT_PLANKS[i];
    const top = v === Math.floor(v0 + slope * u + h - 1);
    const bot = v === Math.floor(v0 + slope * u);
    p.set(fx(u), fy(v), top ? TIMBER[3] : bot ? TIMBER[0] : Math.abs(((u + i * 3.3) / 7) % 1) < 0.08 ? TIMBER[1] : TIMBER[2]);
  }
  // their nails, into the posts
  for (const [v0, slope] of ADIT_PLANKS) for (const u of [-10, 10]) p.set(fx(u), fy(Math.round(v0 + slope * u + 1)), SMALL_IRON[3]);
  // the mark daubed across them, in chalk: its outline and its dark parts left unpainted
  for (let v = 8; v <= 36; v++) for (let u = -9; u <= 8; u++) {
    const x = (u + 0.5) / 8.6;
    const y = (v - 26) / 8.6;
    const k = shriekAt(x, y);
    if (k !== 'bone' || plankAt(u, v) < 0) continue;
    const edge = shriekAt((u + 1.5) / 8.6, y) !== 'bone' || shriekAt((u - 0.5) / 8.6, y) !== 'bone' || shriekAt(x, (v - 25) / 8.6) !== 'bone' || shriekAt(x, (v - 27) / 8.6) !== 'bone';
    if (edge || hash(u, v, 779) < 0.25) p.set(fx(u), fy(v), edge ? CHALK[2] : CHALK[0]);
  }
}

/**
 * BLACK GLASS, the wall's height: where the ancient power came up through the rock and fused it: a
 * jagged vein of black glass up the face from its foot, breaking out wider here and there, its facets
 * catching the light; deep in its cracks the dim of the enemy's pink, barely there.
 */
const GLASS_PATH: ReadonlyArray<readonly [number, number, number]> = [[2, 0, 7.5], [-2, 7, 6], [3, 21, 5.5], [1, 27, 4.5], [-3, 34, 4], [4, 47, 4.5], [2, 56, 3.5], [-1, 62, 3], [2, 76, 2.5]];
const GLASS_FORKS: ReadonlyArray<readonly [number, number, number, number, number]> = [[3, 21, 11, 25, 2.6], [-3, 34, -12, 41, 2.2], [4, 47, 10, 55, 1.6], [-2, 7, -11, 9, 2.4]];
const GLASS_IN = (u: number, v: number): boolean => {
  // (straight runs, broken at angles: a split in the rock, never a stem or a root)
  for (let k = 1; k < GLASS_PATH.length; k++) {
    const [u0, v0, h0] = GLASS_PATH[k - 1];
    const [u1, v1, h1] = GLASS_PATH[k];
    const sg = onSeg(u, v, u0, v0, u1, v1);
    if (sg.d <= h0 + (h1 - h0) * sg.t) return true;
  }
  for (const [u0, v0, u1, v1, h] of GLASS_FORKS) {
    const sg = onSeg(u, v, u0, v0, u1, v1);
    if (sg.d <= h * (1 - sg.t * 0.85)) return true;
  }
  return false;
};
function blackGlass(p: Px): void {
  for (let v = 0; v <= 76; v++) for (let u = -15; u <= 14; u++) {
    if (!GLASS_IN(u, v)) {
      // the earth about it scorched dark
      if (GLASS_IN(u - 2, v) || GLASS_IN(u + 2, v)) p.set(fx(u), fy(v), DUG[0]);
      continue;
    }
    const edgeL = !GLASS_IN(u - 1, v);
    const edgeR = !GLASS_IN(u + 1, v);
    // its facets: flat planes broken at slants, each one tone as it is turned
    const fct = hash(Math.floor((u + 30) / 5 + v / 6), Math.floor((v - u * 0.9) / 7), 781);
    let c = edgeL ? GLASS[3] : edgeR ? GLASS[0] : fct < 0.25 ? GLASS[3] : fct < 0.5 ? GLASS[1] : fct < 0.9 ? GLASS[2] : GLASS[4];
    // the cracks, and the dim of the pink deep in them
    const k = Math.max(1, GLASS_PATH.findIndex((q) => q[1] >= v));
    const [u0, v0] = GLASS_PATH[k - 1];
    const [u1, v1] = GLASS_PATH[Math.min(k, GLASS_PATH.length - 1)];
    const midU = u0 + (u1 - u0) * Math.max(0, Math.min(1, (v - v0) / Math.max(1, v1 - v0)));
    const crack = Math.abs(u - Math.round(midU)) < 1 && hash(0, v >> 2, 782) < 0.6;
    if (crack && !edgeL && !edgeR) c = hash(u, v >> 1, 783) < 0.5 ? RIFT[2] : RIFT[3];
    p.set(fx(u), fy(v), c);
  }
}

// -------------------------------------------------------------------------------------------------
// ON THE WALLS

/**
 * THE CULT'S BANNER: a long hanging of their dark wine cloth from a pole on two pegs, hanging in folds,
 * ragged at its foot in torn strips, burnt along one edge; the shrieking skull painted on it in a pale
 * bone paint, worn.
 */
const BAN = { top: 46, u0: -9, u1: 8, foot: 8 };
function banner(p: Px): void {
  const hemAt = (u: number): number => BAN.foot + Math.round(3 * ragged(u * 0.9, 3) + (Math.abs((u * 7) % 5) < 1 ? 4 : 0));
  for (let u = BAN.u0; u <= BAN.u1; u++) {
    const burnt = u > BAN.u1 - 2 ? Math.round(6 * hash(0, u, 784)) : 0;
    for (let v = hemAt(u) + burnt; v <= BAN.top; v++) {
      // the folds: broad, hanging straight down from where it is gathered on the pole
      const fold = Math.sin((u - BAN.u0) * 0.42 + 0.3);
      const c = v === BAN.top ? CLOTH[3] : fold > 0.5 ? CLOTH[3] : CLOTH[2];
      p.set(fx(u), fy(v), u === BAN.u0 ? CLOTH[3] : u === BAN.u1 ? CLOTH[0] : c);
    }
    p.set(fx(u), fy(hemAt(u) + burnt), CLOTH[0]);
  }
  // the mark, painted on it, worn here and there
  for (let v = 14; v <= 40; v++) for (let u = BAN.u0 + 1; u <= BAN.u1 - 1; u++) {
    const k = shriekAt((u + 0.5) / 7.6, (v - 29.5) / 7.6);
    if (k !== 'bone' || hash(u, v, 785) < 0.06) continue;
    const fold = Math.sin((u - BAN.u0) * 0.42 + 0.3);
    p.set(fx(u), fy(v), fold > 0.8 ? PAINT[2] : fold < -0.8 ? PAINT[0] : PAINT[1]);
  }
  // the pole across its top, on its pegs
  for (let u = BAN.u0 - 2; u <= BAN.u1 + 2; u++) p.set(fx(u), fy(BAN.top + 2), TIMBER[3]).set(fx(u), fy(BAN.top + 1), TIMBER[2]).set(fx(u), fy(BAN.top + 3), TIMBER[0]);
  for (const u of [BAN.u0 - 1, BAN.u1 + 1]) p.set(fx(u), fy(BAN.top + 4), SMALL_IRON[3]).set(fx(u), fy(BAN.top + 3), SMALL_IRON[2]);
}

/**
 * A CULTIST'S ROBE ON A PEG: one of their robes hung up by the loop at the back of its neck: its
 * shoulders out square, its sleeves hanging down beside it, its body falling in folds and widening to
 * a ragged hem, a cord knotted round its middle, its ends hanging. (A garment's shape, shoulders and
 * sleeves: never the round top of a ghost, never a curtain on a pole.)
 */
function robeOnPeg(p: Px): void {
  const NECK = 44;
  // the body: from the neck, widening to its hem, in folds
  for (let v = 6; v <= NECK; v++) {
    const t = (NECK - v) / (NECK - 6);
    const half = 4.2 + t * 2.8;
    const hem = 6 + Math.round(1.6 * ragged(v * 0.3, 4));
    for (let u = Math.round(-half); u <= Math.round(half); u++) {
      if (v < 6 + Math.round(1.5 * ragged(u * 0.9, 5)) + 1) continue;
      const fold = Math.sin(u * 0.9 + 0.4 + t * 0.6);
      const edgeL = u === Math.round(-half);
      const edgeR = u === Math.round(half);
      p.set(fx(u), fy(v), edgeL ? CLOTH[3] : edgeR ? CLOTH[0] : fold > 0.6 ? CLOTH[3] : fold < -0.6 ? CLOTH[1] : CLOTH[2]);
    }
    void hem;
  }
  // the shoulders, out square, a little sloped; the sleeves hanging down beside the body, a gap between
  for (let u = -9; u <= 9; u++) {
    const top = NECK - Math.round(Math.abs(u) * 0.28);
    for (let v = top - 3; v <= top; v++) p.set(fx(u), fy(v), v === top ? CLOTH[3] : CLOTH[2]);
  }
  for (const s0 of [-1, 1]) {
    for (let v = 20; v <= NECK - 3; v++) {
      const u0 = s0 * 8 + Math.round(s0 * (NECK - 3 - v) * 0.04);
      for (let k = -1; k <= 1; k++) p.set(fx(u0 + k), fy(v), k === -1 ? CLOTH[3] : k === 1 ? CLOTH[0] : CLOTH[2]);
      p.set(fx(u0 - s0 * 2), fy(v), '#0a0610');
    }
    // the sleeve's mouth, dark
    p.set(fx(s0 * 8), fy(20), CLOTH[0]).set(fx(s0 * 8 - 1), fy(20), CLOTH[0]);
  }
  // the neck's opening, dark, and the loop up to the peg
  for (let u = -2; u <= 2; u++) p.set(fx(u), fy(NECK), '#0a0610');
  p.set(fx(0), fy(NECK + 1), ROPE[3]).set(fx(0), fy(NECK + 2), ROPE[2]);
  p.set(fx(-1), fy(NECK + 3), TIMBER[3]).set(fx(0), fy(NECK + 3), TIMBER[2]).set(fx(1), fy(NECK + 3), TIMBER[0]);
  // the cord round its middle, its two ends hanging
  for (let u = -5; u <= 5; u++) p.set(fx(u), fy(28 + (u % 2 === 0 ? 0 : 0)), ROPE[3]).set(fx(u), fy(27), ROPE[1]);
  for (let v = 26; v >= 16; v--) p.set(fx(1), fy(v), ROPE[3]);
  for (let v = 26; v >= 19; v--) p.set(fx(3), fy(v), ROPE[2]);
}

/**
 * THE CANDLE LEDGE: a ledge cut into the earth, its edge worn, and on it the cult's black candles of
 * every height burning in a row, their wax run down over the ledge and the earth under it in long runs.
 */
const LEDGE_CANDLES: ReadonlyArray<readonly [number, number, number]> = [[-10, 1.6, 4], [-5.5, 2.8, 8], [-0.5, 1.4, 5.5], [4.5, 2.6, 9.5], [9.5, 1.8, 3.5]];
function candleLedge(f: number): WallMake {
  return {
    flat: (p) => {
      // the ledge's cut: the earth over it cut back and dark, its top lit
      for (let u = -14; u <= 13; u++) {
        for (let v = 22; v <= 30; v++) p.set(fx(u), fy(v), v <= 23 ? DUG[0] : v === 30 ? DUG[1] : '#120d18');
        p.set(fx(u), fy(21), DUG[4]).set(fx(u), fy(20), DUG[3]);
      }
      // the wax run down the earth under it, in long runs
      for (const [u, n] of [[-10, 8], [-9, 4], [-5, 12], [-1, 6], [4, 10], [5, 5], [9, 7]] as const) for (let k = 0; k < n; k++) p.set(fx(u), fy(20 - k), k === n - 1 ? WAX[1] : WAX[3]);
    },
    solid: (S, W) => {
      const [A, B] = axesOf(W);
      LEDGE_CANDLES.forEach(([a, b, h], k) => {
        S.rod(W(a, b, 22), W(a, b, 22 + h), 1.3, 1.3, WAX, 160 + k);
        S.egg(W(a, b, 22.2), [A, B, [0, 0, 1]], [2.2, 1.6, 0.6], () => WAX[2], 160 + k);
      });
    },
    fire: (p, alongX) => {
      LEDGE_CANDLES.forEach(([a, b, h], k) => {
        const x = Math.round(a * 0.8 + (alongX ? -0.8 : 0.8) * b * 0.8);
        flame(p, fx(x), fy(Math.round(22 + h + 0.4 * b + 1)), 5 + ((f + k) % 2), 1.2, [0, 1, 0, -1][(f + k) % 4]);
      });
    },
  };
}

/**
 * THE MARK, DAUBED: the cult's shrieking skull daubed big on the earth in pale chalk, in rough strokes:
 * its outline, its sockets and its open mouth left as the earth, a smear off its jaw and a short run of
 * the chalk down from it (never a filled pale shape, never like tears).
 */
function daubedMark(p: Px): void {
  for (let v = 8; v <= 44; v++) for (let u = -15; u <= 14; u++) {
    const sc = 11.4;
    const x = (u + 0.5) / sc;
    const y = (v - 31) / sc;
    const k = shriekAt(x, y);
    const near = (dx: number, dy: number): boolean => shriekAt((u + 0.5 + dx) / sc, (v - 31 + dy) / sc) === 'bone';
    // a stroke: the bone's edge, a pixel or two in from its outline and round its dark parts
    if (k === 'bone' && (!near(-1.5, 0) || !near(1.5, 0) || !near(0, 1.5) || !near(0, -1.5)) && hash(u, v >> 1, 786) > 0.08) p.set(fx(u), fy(v), !near(0, 1.5) || !near(-1.5, 0) ? CHALK[2] : CHALK[1]);
  }
  // a smear off its jaw, and a short run down
  for (let k = 0; k < 6; k++) p.set(fx(7 + k), fy(18 - Math.round(k * 0.5)), CHALK[0]).set(fx(7 + k), fy(17 - Math.round(k * 0.5)), CHALK[1]);
  for (let k = 0; k < 4; k++) p.set(fx(-4), fy(17 - k), CHALK[k === 3 ? 0 : 1]);
}

/**
 * BONES ON CORDS: an iron spike in the earth, and three cords splayed wide from it, each of its own
 * length, the cult's small bones knotted along each at its own slant, so that they knock together in a
 * draught. (No skull at their head: with one it hung as a little skeleton.)
 */
const chimes: WallMake = {
  flat: (p) => {
    for (let v = 47; v <= 49; v++) for (let u = -1; u <= 1; u++) p.set(fx(u), fy(v), u === -1 || v === 49 ? SMALL_IRON[3] : SMALL_IRON[1]);
  },
  solid: (S, W, alongX) => {
    const toW = dirOf(W);
    const keep = inFront(alongX);
    // the cords, from the spike, splayed wide apart
    S.ball(W(0, 2.4, 47.5), 1.3, ROPE, 180, keep);
    for (const [a1, z1, k] of [[-14, 20, 0], [0.5, 12, 1], [13, 24, 2]] as const) {
      S.rod(W(0, 2.6, 47), W(a1, 3.4, z1), 0.35, 0.35, ROPE, 181 + k);
      // the bones knotted along it, each at its own slant
      for (let j = 0; j < 3; j++) {
        const t = 0.36 + j * 0.25;
        const c = W(a1 * t, 3.6, 47 + (z1 - 47) * t);
        const ang = (hash(j, k, 787) - 0.5) * 1.6;
        const d = toW([Math.cos(ang), 0.15, Math.sin(ang)]);
        longBone(S, sub(c, mul(d, 2.4)), add(c, mul(d, 2.4)), 0.62, BONE, 185 + k * 3 + j);
      }
    }
  },
};

/** How far out from the wall the candle stands, and where its foot is, up the wall. */
const TOMMY = { out: 6, z: 28, h: 6 };
/**
 * A MINER'S CANDLE ON ITS SPIKE: the miners' iron candlestick for working underground, a spike driven
 * slanting into the earth, a ring at its end holding a candle of pale tallow upright (never the cult's
 * black), a hook bent up behind it; the tallow run down the ring: frame `f` of four.
 */
function minersCandle(f: number): WallMake {
  return {
    flat: (p) => {
      // where the spike goes in: a little split in the earth
      p.set(fx(-1), fy(TOMMY.z - 1), DUG[0]).set(fx(0), fy(TOMMY.z - 1), DUG[0]).set(fx(0), fy(TOMMY.z - 2), DUG[4]);
    },
    solid: (S, W) => {
      const [A, B, U] = axesOf(W);
      const o = TOMMY.out;
      // the spike, slanting up out of the earth to the ring
      S.rod(W(0, 0.2, TOMMY.z - 1.5), W(0, o, TOMMY.z), 0.75, 0.6, SMALL_IRON, 200);
      // the hook, bent up behind
      S.rod(W(0, o - 2, TOMMY.z - 0.4), W(0, o - 2.6, TOMMY.z + 4.2), 0.5, 0.45, SMALL_IRON, 200);
      // the ring round the candle's foot
      S.egg(W(0, o, TOMMY.z + 0.4), [A, B, U], [1.9, 1.9, 0.7], (n) => toneAt(n, IRONS, 0.25), 201);
      // the candle: pale tallow, its run down the ring
      const TALLOW: Ramp = ['#2a2418', '#3a3224', '#5a5040', '#7a705a', '#867c64'];
      S.rod(W(0, o, TOMMY.z + 0.6), W(0, o, TOMMY.z + TOMMY.h), 1.2, 1.1, TALLOW, 202);
      S.rod(W(0.9, o + 0.8, TOMMY.z + 1.4), W(1, o + 1, TOMMY.z - 1.2), 0.45, 0.4, TALLOW, 202);
    },
    fire: (p, alongX) => {
      const x = Math.round((alongX ? -0.8 : 0.8) * TOMMY.out * 0.8);
      flame(p, fx(x), fy(Math.round(TOMMY.z + TOMMY.h + 0.4 * TOMMY.out + 1)), 6 + (f % 2), 1.4, [0, 1, 0, -1][f]);
    },
  };
}
const candleLight = (f: number, du: number, dv: number) => (alongX: boolean): Light[] => {
  const x = PCX + du + Math.round((alongX ? -0.8 : 0.8) * TOMMY.out * 0.8);
  const y = PFOOT - dv - TOMMY.z - TOMMY.h - 5;
  return [{ x: x / GRAIN, y: y / GRAIN, r: 13 + (f % 2), color: EMBER[2], a: alongX ? 0.44 : 0.38 }];
};

/** ROPE AND A PULLEY: a coil of the miners' rope hung on a peg, its end hanging; beside it, hung by its hook, a wooden pulley block, its sheave showing, a short length of rope through it. */
const ropeAndPulley: WallMake = {
  flat: (p) => {
    for (const u of [-6, 6]) p.set(fx(u), fy(44), TIMBER[3]).set(fx(u + 1), fy(44), TIMBER[2]);
  },
  solid: (S, W, alongX) => {
    const [A, B, U] = axesOf(W);
    const keep = inFront(alongX);
    // the coil: loops of rope hung over the peg, each a ring a little askew
    for (let k = 0; k < 5; k++) {
      const c = W(-6 + (k - 2) * 0.5, 2 + k * 0.5, 34 - (k % 2) * 0.6);
      const tilt = (k - 2) * 0.08;
      let prev: V3 | null = null;
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 10) {
        const q = add(c, add(mul(norm(add(A, mul(U, tilt))), Math.sin(a) * 6), mul(U, Math.cos(a) * 9.5)));
        if (prev) S.rod(prev, q, 0.75, 0.75, ROPE, 220 + k, keep);
        prev = q;
      }
    }
    // its end hanging down
    S.rod(W(-9, 4, 26), W(-10, 4.4, 12), 0.7, 0.7, ROPE, 226, keep);
    // the pulley block: its cheeks of wood, the sheave between, its hook up to the peg
    S.rod(W(6, 2, 43.6), W(6, 2.6, 38), 0.5, 0.5, SMALL_IRON, 230);
    S.box(W(6, 3, 33), [A, B, U], [2.6, 2, 4.6], (fc, u, v, n) => (fc === 4 ? TIMBER[3] : Math.abs(v - 0.5) < 0.1 && (fc === 2 || fc === 3) ? IRONS[2] : toneAt(n, TIMBER_DIM, 0)), 231);
    S.egg(W(6, 3, 31.6), [B, A, U], [2.3, 2.8, 2.8], (n) => toneAt(n, IRONS, 0.1), 232, keep);
    S.rod(W(4, 3.6, 30), W(3.6, 4, 18), 0.6, 0.6, ROPE, 233, keep);
    S.rod(W(8, 3.6, 30), W(8.6, 4, 22), 0.6, 0.6, ROPE, 233, keep);
  },
};

/** A KIBBLE ON ITS CHAIN: a great iron hook driven into the earth, a chain down from it, and the miners' iron bucket hanging by its bail, dented, its rim lit, rust down its side. */
const hungKibble: WallMake = {
  flat: (p) => {
    for (let v = 47; v <= 50; v++) for (let u = -2; u <= 1; u++) p.set(fx(u), fy(v), u === -2 || v === 50 ? SMALL_IRON[3] : SMALL_IRON[1]);
  },
  solid: (S, W, alongX) => {
    // (on the face in shade, in its shade: a step darker all round)
    const sh = alongX ? 0 : -0.2;
    const [A, B, U] = axesOf(W);
    S.rod(W(0, 0.4, 48.6), W(0, 5.2, 49), 0.9, 0.8, SMALL_IRON, 240);
    for (let k = 0; k < 6; k++) S.egg(W(0, 5.2, 46.4 - k * 2), k % 2 ? [B, A, U] : [A, B, U], [0.5, 1, 1.3], (n) => toneAt(n, IRONS, 0.2), 241);
    // the bail, an arch of iron over the bucket
    let prev: V3 | null = null;
    for (let a = 0; a <= Math.PI + 0.01; a += Math.PI / 10) {
      const q = W(-Math.cos(a) * 5, 5.2, 26 + Math.sin(a) * 8);
      if (prev) S.rod(prev, q, 0.55, 0.55, IRONS, 242);
      prev = q;
    }
    // the bucket: round, a little wider at its rim, two bands, a dent
    const bc = W(0, 5.2, 0);
    for (let z = 12; z <= 26; z += 0.45) {
      const r = 4.4 + (z - 12) * 0.04 - (Math.abs(z - 19) < 2.4 ? 0.5 * (1 - Math.abs(z - 19) / 2.4) : 0);
      for (let a = -Math.PI; a < Math.PI; a += 0.08) {
        const nrm: V3 = add(mul(A, Math.cos(a)), mul(B, Math.sin(a)));
        if (dot(nrm, TOWARD) < -0.15) continue;
        const q = add(add(bc, mul(nrm, r)), [0, 0, z]);
        const band = Math.abs(z - 14) < 0.6 || Math.abs(z - 24.6) < 0.6;
        const rim = z > 25.6;
        const [x, y] = S.at(q);
        S.put(Math.round(x), Math.round(y), dot(q, TOWARD), rim ? (alongX ? SMALL_IRON[3] : SMALL_IRON[2]) : band ? toneAt(nrm, IRONS, 0.3 + sh) : toneAt(nrm, DIM_IRON, -0.1 + sh), 243, q[2]);
      }
    }
    // its mouth, dark inside
    S.egg(add(bc, [0, 0, 26]), [A, B, U], [4.9, 4.9, 0.2], () => '#0c0a18', 244);
  },
};

// =================================================================================================
// FLOOR TILES (a tile's picture, anchored at its top corner, as the floor's own)

/**
 * THE TRODDEN WAY: where the miners went to and fro with their barrows: a path trodden hard across the
 * tile, darker and smoother than the earth about it, the rut of a barrow's wheel worn down its middle
 * (its lips pushed up and lit), a lump or two of ore dropped along it.
 */
function troddenWay(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const c = 0.04 * Math.sin(x * 6 + 0.4);
  const d = y - c;
  // the rut
  const rc = c + 0.03 * Math.sin(x * 11);
  if (Math.abs(y - rc) < 0.022) return DEEP;
  if (y - rc >= 0.022 && y - rc < 0.045) return EARTH[3];
  if (y - rc <= -0.022 && y - rc > -0.04) return EARTH[0];
  // ore dropped along it
  for (const [ox, oy, r] of [[-0.3, 0.1, 0.035], [0.12, -0.12, 0.03], [0.34, 0.08, 0.026]] as const) {
    const dd = Math.hypot(x - ox, (y - oy) * 1.1);
    if (dd < r) return x - ox + y - oy < 0 ? ORE[3] : ORE[1];
    if (dd < r + 0.02 && x - ox + y - oy > 0) return EARTH[0];
  }
  // the path: packed and smooth, darker than the loose earth, its edges ragged, the earth kicked up along its far side
  const half = 0.22 + 0.03 * Math.sin(x * 9 + 1) + (hash(Math.floor(u * 20), 0, 790) - 0.5) * 0.03;
  if (Math.abs(d) < half) return hash(Math.floor(u * 26), Math.floor(v * 26), 791) < 0.08 ? EARTH[1] : '#150f1e';
  if (d <= -half && d > -half - 0.035) return hash(Math.floor(u * 30), 1, 789) < 0.7 ? EARTH[3] : EARTH[2];
  if (d >= half && d < half + 0.025) return EARTH[0];
  return earthAt(u, v, 1);
}

/**
 * THE RAILS' BEND: the miners' rails bending round a quarter turn across the tile, from the middle of
 * one edge to the middle of the next, on timber sleepers set across them, gravel between; the rails'
 * tops worn bright in streaks. (With the rails of floor 4, `the rails`, the main chat can lay a run that
 * turns.)
 */
function railsBend(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // about the tile's corner at (-0.5, -0.5): along the bend `s`, across it `t`
  const dx = x + 0.5;
  const dy = y + 0.5;
  const R = Math.hypot(dx, dy);
  const s = Math.atan2(dy, dx) / (Math.PI / 2);
  const t = R - 0.5;
  if (s < 0 || s > 1) return earthAt(u, v, 2);
  for (const r of [-0.19, 0.19]) {
    const dd = t - r;
    if (Math.abs(dd) < 0.022) return hash(Math.floor(s * 24), 0, 792) < 0.12 ? '#5a5690' : DIM_IRON[3];
    if (dd >= 0.022 && dd < 0.045) return DIM_IRON[0];
  }
  // the sleepers, across the bend, fanned
  const k = s * 4 + 0.5;
  const f = k % 1;
  if (Math.abs(f - 0.5) < 0.18 && Math.abs(t) < 0.33) {
    if (Math.abs(Math.abs(t) - 0.25) < 0.02 && Math.abs(f - 0.5) < 0.07) return DIM_IRON[3];
    return Math.abs(f - 0.5) > 0.13 ? (f - 0.5 < 0 ? TIMBER[3] : TIMBER[0]) : TIMBER[2];
  }
  if (Math.abs(t) < 0.3) return hash(Math.floor(u * 30), Math.floor(v * 30), 793) < 0.3 ? RAW[2] : hash(Math.floor(u * 30), Math.floor(v * 30), 794) < 0.5 ? RAW[1] : EARTH[1];
  return earthAt(u, v, 2);
}

/** THE PLANK WALK: three planks laid side by side over wet earth, along y, a gap between each; one cracked across; the earth at their ends dark and soft, pressed up between them. */
function plankWalk(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  if (Math.abs(x) < 0.33) {
    const k = (x + 0.33) / 0.22;
    const plank = Math.floor(k);
    const f = k - plank;
    if (f < 0.08) return '#0c0914';
    if (plank === 1 && Math.abs(y - 0.08 - 0.04 * Math.sin(x * 40)) < 0.02) return '#0c0914';
    if (f < 0.2) return TIMBER[3];
    if (f > 0.9) return TIMBER[0];
    if (Math.abs(((y + 0.5) * 6 + plank * 0.41) % 1 - 0.5) < 0.05) return TIMBER[0];
    // (the planks' ends sunk in the mud)
    if (Math.abs(y) > 0.44) return EARTH[0];
    return hash(plank, Math.floor((y + 0.5) * 12), 795) < 0.15 ? TIMBER[1] : TIMBER[2];
  }
  // the earth beside them: dark, soft, pressed up along their edges
  if (Math.abs(x) < 0.38) return EARTH[3];
  return hash(Math.floor(u * 20), Math.floor(v * 20), 796) < 0.2 ? EARTH[0] : EARTH[1];
}

/**
 * THE CULT'S RING: a ring burned into the earth, a groove scorched black with its outer lip lit; the
 * earth inside it swept smooth; small bones laid round along it, end to end with gaps, and the stubs of
 * their black candles stuck down at five places round it, unevenly. Nothing inside it (no star, no
 * lines, no mark), nothing out from it (no rays).
 */
const RING_R = 0.36;
const RING_STUBS = [0.3, 1.5, 2.6, 3.9, 5.1];
const RING_BONES: ReadonlyArray<readonly [number, number]> = [[0.9, 0.36], [2.05, 0.34], [3.25, 0.4], [4.5, 0.33], [5.75, 0.3]];
function ritualRing(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const r = Math.hypot(x, y * 1.0);
  const a = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
  // the candle stubs, on the ring
  for (const s of RING_STUBS) {
    const cx = Math.cos(s) * RING_R;
    const cy = Math.sin(s) * RING_R;
    const d = Math.hypot(x - cx, y - cy);
    if (d < 0.032) return x - cx + y - cy < -0.012 ? WAX[4] : WAX[3];
    if (d < 0.062) return x - cx + y - cy > 0.02 ? '#0a0810' : WAX[2];
  }
  // the bones laid along it
  for (const [s, half] of RING_BONES) {
    const da = ((a - s + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const off = r - RING_R - 0.05;
    const w = 0.022 * (Math.abs(da) > half - 0.07 ? 1.6 : 1);
    if (Math.abs(da) < half && Math.abs(off) < w) return off < -w * 0.3 ? WALL_BONE[4] : off > w * 0.5 ? WALL_BONE[1] : WALL_BONE[3];
  }
  // the groove
  if (Math.abs(r - RING_R) < 0.02) return '#08060c';
  if (r - RING_R >= 0.02 && r - RING_R < 0.034) return x + y > 0 ? EARTH[0] : EARTH[3];
  if (r < RING_R) return hash(Math.floor(u * 30), Math.floor(v * 30), 797) < 0.05 ? EARTH[3] : EARTH[2];
  return earthAt(u, v, 3);
}

/**
 * THE CULT'S SLAB: a slab of their stone laid in the earth, its edges broken, and cut into it the
 * shrieking skull, lying on the floor as the eye sees it, its sockets and mouth cut deep and dark.
 */
function carvedSlab(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // (the mark, upright on the screen, lying on the floor: across the screen x - y, up it -(x + y))
  // (cut in as an engraving: the outline of the bone and its hollows cut dark, the stone left between)
  const at = (dx: number, dy: number): 'bone' | 'dark' | null => shriekAt((x - y + dx) / 0.44, (-(x + y) + 0.03 + dy) / 0.36);
  const k = at(0, 0);
  if (k === 'dark') return at(0.025, 0.025) !== 'dark' ? SLAB[3] : '#0c0a14';
  if (k === 'bone' && (at(0.03, 0) === null || at(-0.03, 0) === null || at(0, 0.03) === null || at(0, -0.03) === null)) return '#0c0a14';
  if (k === 'bone') return SLAB[2];
  return hash(Math.floor(u * 12), Math.floor(v * 12), 798) < 0.15 ? SLAB[1] : SLAB[2];
}
const SLAB_IN = (u: number, v: number): boolean => {
  const [x, y] = mid(u, v);
  return Math.abs(x) < 0.4 + 0.03 * Math.sin(y * 17) && Math.abs(y) < 0.4 + 0.03 * Math.sin(x * 13);
};

/** SPOIL: the broken rock the miners threw down: a spread of lumps and chips of every size over the earth, each lit on its upper left and casting a little shadow to its lower right; grit about them. */
const SPOIL: ReadonlyArray<readonly [number, number, number]> = (() => {
  const out: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = hash(i, 1, 799) * Math.PI * 2;
    const r = Math.sqrt(hash(i, 2, 799)) * 0.42;
    out.push([Math.cos(a) * r, Math.sin(a) * r * 0.9, 0.045 + 0.07 * hash(i, 3, 799) * (1 - r * 0.8)]);
  }
  return out.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
})();
function spoil(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  for (let i = SPOIL.length - 1; i >= 0; i--) {
    const [cx, cy, r] = SPOIL[i];
    const dx = x - cx;
    const dy = y - cy;
    const rr = r * (1 + 0.18 * Math.sin(Math.atan2(dy, dx) * 3 + i));
    const d = Math.hypot(dx, dy * 1.1);
    if (d < rr) {
      const toL = dx + dy;
      if (d > rr * 0.8) return toL < 0 ? BOULDER[3] : BOULDER[0];
      return toL < -rr * 0.3 ? BOULDER[3] : toL > rr * 0.4 ? BOULDER[1] : BOULDER[2];
    }
  }
  for (const [cx, cy, r] of SPOIL) if (Math.hypot(x - cx - r * 0.45, (y - cy - r * 0.45) * 1.1) < r) return EARTH[0];
  if (hash(Math.floor(u * 30), Math.floor(v * 30), 800) < 0.14) return RAW[2];
  return earthAt(u, v, 4);
}

// =================================================================================================
// TRAPS

/** A trap's picture: the tile (its diamond `up` pixels down a canvas `up` + 32 high), and what stands up out of it over all; anchored at the middle of the tile. */
function trapSprite(tile: Px, over: Px | null, up: number): Sprite {
  const p = new Px(64, 32 + up);
  p.blit(tile, 0, up);
  if (over) p.blit(over, 0, 0);
  return p.sprite(32, up + 16, GRAIN);
}

/**
 * THE GRASPING EARTH: the earth, three low humps in it, cracked open across their tops; `ready`, the
 * warning: out of each crack a hand of bone thrust up to the wrist, its fingers clawing (his rings of
 * hands, waiting under the floor). Anchored at the middle.
 */
const HUMPS: ReadonlyArray<readonly [number, number, number]> = [[-0.2, -0.12, 0.4], [0.18, -0.04, -0.3], [-0.02, 0.22, 0.9]];
function graspingEarth(ready: boolean): Sprite {
  const UP = 26;
  const t = tileOf((u, v) => {
    const [x, y] = mid(u, v);
    for (const [hx, hy] of HUMPS) {
      const d = Math.hypot((x - hx) * 1.1, y - hy);
      if (d < 0.11) {
        // the crack across its top
        if (Math.abs((x - hx) - (y - hy) * 0.6) < 0.018) return ready ? DEEP : '#0a0712';
        return x - hx + y - hy < -0.03 ? EARTH[3] : x - hx + y - hy > 0.05 ? EARTH[0] : EARTH[2];
      }
      if (d < 0.13 && x - hx + y - hy > 0) return EARTH[0];
    }
    return earthAt(u, v, 5);
  });
  if (!ready) return trapSprite(t, null, UP);
  // the hands, in depth: from each crack, a wrist and a hand of bone, clawing up
  const S = new Scene(new Px(64, 32 + UP), 32, UP + 16);
  HUMPS.forEach(([hx, hy, turn], k) => {
    const base: V3 = [hx * 40, hy * 40, 1];
    const lean = norm([Math.cos(turn) * 0.35, Math.sin(turn) * 0.35, 1]);
    const wr = add(base, mul(lean, 5.5));
    S.rod(base, wr, 1.1, 1, WALL_BONE, 10 + k);
    boneHand(S, wr, lean, norm(cross(lean, [Math.cos(turn), Math.sin(turn), 0])), 0.9, WALL_BONE, 10 + k, 0.82);
  });
  S.seams();
  return trapSprite(t, compose(null, [S.p], null), UP);
}

/**
 * THE CHARGE: a hole drilled down into the floor and tamped with the miners' powder, the earth round its
 * mouth blackened, a fuse snaking out of it across the floor; `ready`, the warning: the fuse lit, its
 * burning end creeping toward the hole and spitting sparks. Anchored at the middle.
 */
const FUSE: ReadonlyArray<readonly [number, number]> = (() => {
  const out: [number, number][] = [];
  for (let k = 0; k <= 30; k++) {
    const t = k / 30;
    out.push([0.02 + t * 0.4, -0.02 + 0.12 * Math.sin(t * 7) * t + t * 0.08]);
  }
  return out;
})();
function theCharge(ready: boolean): Sprite {
  const burnTo = ready ? 12 : FUSE.length;
  const t = tileOf((u, v) => {
    const [x, y] = mid(u, v);
    const d = Math.hypot(x, y * 1.05);
    // the hole, tamped: dark powder in it
    if (d < 0.065) return d < 0.04 ? '#100c14' : '#221c28';
    if (d < 0.085) return x + y < 0 ? EARTH[0] : EARTH[3];
    // the fuse: grey cord, burnt black behind where it has burned
    for (let k = 1; k < FUSE.length; k++) {
      const sg = onSeg(x, y, FUSE[k - 1][0], FUSE[k - 1][1], FUSE[k][0], FUSE[k][1]);
      if (sg.d < 0.02) return k > burnTo ? '#120e14' : sg.side < 0 ? ROPE[3] : ROPE[2];
    }
    // the blackening about the hole
    if (d < 0.22 && hash(Math.floor(u * 30), Math.floor(v * 30), 801) < 0.85 - d * 3.2) return '#120e18';
    return earthAt(u, v, 6);
  });
  if (!ready) return trapSprite(t, null, 12);
  // its burning end, and the sparks it spits (an honest fire's orange)
  const over = new Px(64, 44);
  const [ex, ey] = FUSE[burnTo];
  const at = (x: number, y: number): [number, number] => [Math.round(32 + (x - y) * 32), Math.round(12 + 16 + (x + y) * 16)];
  const [bx, by] = at(ex, ey);
  over.rect(bx - 1, by - 1, 2, 2, EMBER[4]).set(bx + 1, by - 1, EMBER[3]).set(bx - 1, by - 2, EMBER[3]);
  for (const [dx, dy, len] of [[-1, -1, 4], [1, -1.4, 5], [0.4, -1, 6], [-1.4, -0.4, 3], [1.4, -0.3, 3]] as const) {
    for (let k = 1; k <= len; k++) over.set(Math.round(bx + dx * k), Math.round(by - 1 + dy * k + k * k * 0.12), k < 2 ? EMBER[4] : k < len - 1 ? EMBER[3] : EMBER[2]);
  }
  const s = trapSprite(t, over, 12);
  s.lights = [{ x: bx / GRAIN, y: by / GRAIN, r: 9, color: EMBER[2], a: 0.4 }];
  return s;
}

/**
 * THE SHRIEKING SKULL IN THE WALL (the dart slot, on this floor): a great skull set into the earth up to
 * its brow, the cult's mark made real, its jaw dropped wide open, its throat a black hole; bristling in
 * its mouth, the points of bone shards waiting, pale (his shards, from the skull of his staff).
 */
const shardSkull: WallMake = {
  flat: (p) => {
    // the earth round it, dug back
    for (let v = 14; v <= 44; v++) for (let u = -12; u <= 11; u++) if (Math.hypot((u + 0.5) / 11, (v - 29) / 14) < 1 && Math.hypot((u + 0.5) / 9.6, (v - 29) / 12.6) >= 1) p.set(fx(u), fy(v), v < 29 ? DUG[4] : DUG[0]);
  },
  solid: (S, W, alongX) => {
    const toW = dirOf(W);
    const keep = (w: V3): boolean => (alongX ? w[1] : w[0]) >= -2.5;
    const [A, B] = axesOf(W);
    // the throat behind the open jaw: a black hole into the earth
    S.egg(W(0, 0.5, 24.5), [A, B, [0, 0, 1]], [5.2, 1.2, 4.6], () => DEEP, 259);
    skull(S, { c: W(0, 1.2, 34), F: toW([0, 1, 0.12]), U: toW([0, 0, 1]), R: 8, jaw: 1.15, big: 1.15 }, WALL_BONE, 260, keep);
    // the shards' points in it, pale, bristling out of the dark
    for (const [a, z, k] of [[-3, 25.5, 0], [0.4, 23, 1], [3.2, 25.8, 2], [-1.2, 27.4, 3], [1.8, 28, 4]] as const) S.rod(W(a, 1.2, z), W(a * 1.25, 5, z + 0.3), 0.75, 0.15, BONE, 262 + k);
  },
};

// =================================================================================================
// BREAKABLES: standing at the middle of their foot

/** A KEG OF THE MINERS' POWDER: a small stout cask of staves, two iron hoops, its bung of wood, black powder dusted down its side from the bung. 30 x 38 at (15, 32). */
function powderKeg(): Sprite {
  const S = new Scene(new Px(30, 38), 15, 32);
  const R = 7.2;
  for (let z = 0.4; z <= 16; z += 0.4) {
    const t = (z - 0.4) / 15.6;
    const r = R * (0.86 + 0.14 * Math.sin(t * Math.PI));
    for (let a = -Math.PI; a < Math.PI; a += 0.07) {
      const n: V3 = [Math.cos(a), Math.sin(a), 0];
      if (dot(n, TOWARD) < -0.2) continue;
      const q: V3 = [n[0] * r, n[1] * r, z];
      const hoop = Math.abs(z - 3) < 0.7 || Math.abs(z - 13.2) < 0.7;
      const stave = Math.abs(((a * 9) / Math.PI) % 1) < 0.1;
      const powder = a > 0.2 && a < 0.9 && z < 12 && hash(Math.round(a * 8), Math.round(z), 802) < 0.4;
      const [x, y] = S.at(q);
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), hoop ? toneAt(n, IRONS, 0.25) : powder ? '#16121c' : stave ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.05), 1, z);
    }
  }
  S.egg([0, 0, 16], XYZ, [R * 0.86, R * 0.86, 0.4], (_n, w) => (Math.abs(w[0] - w[1]) < 0.6 ? TIMBER[0] : w[0] + w[1] < -4 ? TIMBER[3] : TIMBER[2]), 1);
  S.box([2, 1, 16.6], XYZ, [1.2, 1.2, 0.8], (f, _u, _v, n) => (f === 4 ? TIMBER[3] : toneAt(n, TIMBER, 0)), 2);
  S.seams();
  return compose(null, [S.p], null).sprite(15, 32, GRAIN);
}

/** A BOX OF THE CULT'S CANDLES: a crate of rough boards, open at its top, packed with black candles lying in it, their ends showing over its rim. 36 x 34 at (18, 28). */
function candleBox(): Sprite {
  const S = new Scene(new Px(36, 34), 18, 28);
  const board = (f: number, u: number, v: number, n: V3): string => (f === 4 ? TIMBER[3] : Math.abs(((v * 3) % 1) - 0.5) < 0.06 ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.05));
  // its four sides and its floor (open at its top)
  S.box([0, 0, 0.6], XYZ, [9, 7, 0.6], board, 1);
  S.box([0, 7, 4.4], XYZ, [9, 0.6, 4.4], board, 1);
  S.box([9, 0, 4.4], XYZ, [0.6, 7, 4.4], board, 1);
  S.box([0, -7, 4.4], XYZ, [9, 0.6, 4.4], board, 2);
  S.box([-9, 0, 4.4], XYZ, [0.6, 7, 4.4], board, 2);
  // the candles in it, heaped every way over its rim, their ends showing
  let id = 3;
  for (const [x0, y0, z0, x1, y1, z1] of [[-8, -4, 8.6, 9, -5, 9.4], [-9, -1, 9.4, 8, 1, 9], [-7, 3, 9, 10, 4, 10.4], [-4, -5, 11, 6, 3, 11.6], [3, -6, 10.6, -2, 6, 12.2], [-10, 5, 10.6, 2, -2, 12.8]] as const) S.rod([x0, y0, z0], [x1, y1, z1], 1.2, 1.2, WAX, id++);
  S.seams();
  return compose(null, [S.p], null).sprite(18, 28, GRAIN);
}

/** AN OFFERING JAR: a tall jar of old clay, narrow at its foot and neck, a lid of clay on it; the small bones of hands and feet given to the cult heaped in it under the lid. 28 x 42 at (14, 36). */
function offeringJar(): Sprite {
  const W = 28;
  const H = 42;
  const cx = 14;
  const foot = 36;
  const body = new Px(W, H);
  const lid = new Px(W, H);
  lit(body, CLAY, [1, 3], [1, 4], (l) => {
    for (let y = 9; y <= foot - 1; y++) {
      const t = (y - 9) / (foot - 10);
      const half = t < 0.12 ? 3.2 : 3.2 + Math.sin(Math.min(1, (t - 0.12) / 0.5) * (Math.PI / 2)) * 5.2 - (t > 0.7 ? ((t - 0.7) / 0.3) ** 1.6 * 4.6 : 0);
      l.rect(Math.round(cx - half), y, Math.round(half * 2), 1, INK);
    }
  });
  // a band round its shoulder
  for (let x = cx - 8; x <= cx + 8; x++) if (body.has(x, 16) && hash(x, 0, 803) < 0.8) body.set(x, 16, CLAY[1]);
  // the lid, a little askew, a knob on it; the bones showing under its edge
  lit(lid, CLAY, [1, 2], [1, 2], (l) => l.ellipse(cx + 1, 8, 5, 2, INK));
  lid.rect(cx, 4, 2, 3, CLAY[3]).set(cx + 1, 4, CLAY[4]);
  for (const x of [cx - 4, cx - 2, cx + 3]) lid.set(x, 10, BONE[3]).set(x + 1, 10, BONE[2]);
  return compose(null, [body, lid], null).sprite(cx, foot, GRAIN);
}

/** A BASKET OF ORE: a deep basket of withies, woven, wider at its mouth, two handles of rope, heaped with ore. 34 x 36 at (17, 30). */
function oreBasket(): Sprite {
  const S = new Scene(new Px(34, 36), 17, 30);
  for (let z = 0.4; z <= 12; z += 0.4) {
    const r = 6 + z * 0.22;
    for (let a = -Math.PI; a < Math.PI; a += 0.07) {
      const n: V3 = [Math.cos(a), Math.sin(a), 0];
      if (dot(n, TOWARD) < -0.2) continue;
      const q: V3 = [n[0] * r, n[1] * r, z];
      // (the weave: rows of withies, each over and under its upright)
      const row = Math.floor(z / 1.2);
      const over = (Math.floor((a + Math.PI) * 4) + row) % 2 === 0;
      const [x, y] = S.at(q);
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), z > 11.4 ? TIMBER[3] : toneAt(n, TIMBER_DIM, over ? 0.15 : -0.25), 1, z);
    }
  }
  let n = 0;
  for (const [x, y, z, r] of [[-3, -2, 12.4, 2.6], [2, -3, 12.6, 2.4], [3, 2, 12.4, 2.6], [-2, 3, 12.8, 2.3], [0, 0, 14.4, 2.4], [-4, 2, 12, 2]] as const) S.ball([x, y, z], r, ORE, 2 + n++, undefined, 0.1);
  // its handles, loops of rope at its sides
  for (const s of [-1, 1]) for (let a = 0.3; a < Math.PI - 0.3; a += 0.2) S.ball([s * 8.4 * 0.7, s * 8.4 * 0.7, 11 + Math.sin(a) * 2.4], 0.5, ROPE, 9);
  S.seams();
  return compose(null, [S.p], null).sprite(17, 30, GRAIN);
}

/**
 * WHAT A BREAKABLE LEAVES, on the floor where it stood, spread in an oval twice as wide as deep: the keg
 * (its staves, a sprung hoop, its powder in a dark heap), the box (its boards, its candles rolled out),
 * the jar (its shards, the small bones spilled), the basket (crushed, its ore spilled).
 */
function brokenOf(kind: 'keg' | 'candles' | 'jar' | 'basket'): Sprite {
  const W = 64;
  const H = 40;
  const cx = 32;
  const cy = 22;
  const p = new Px(W, H);
  const under = new Px(W, H);
  const S = new Scene(new Px(W, H), cx, cy);
  const ore = (num: number, seed: number, spread: number): void => {
    for (let i = 0; i < num; i++) {
      const a = hash(i, 1, seed) * Math.PI * 2;
      const r = Math.sqrt(hash(i, 2, seed)) * spread;
      S.ball([Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, 1.6], 1.5 + hash(i, 3, seed) * 1.3, ORE, 10 + i, undefined, 0.1);
    }
  };
  const staves = (list: ReadonlyArray<readonly [number, number, number, 1 | -1]>, r: Ramp): void => {
    for (const [x, y, len, way] of list) for (let k = 0; k < len; k++) {
      const xx = x + (way > 0 ? k : -k);
      const yy = y + Math.floor(k / 2);
      p.set(xx, yy, r[3]).set(xx, yy + 1, r[2]).set(xx, yy + 2, r[0]);
    }
  };
  if (kind === 'keg') {
    under.ellipse(cx + 1, cy + 2, 11, 4, '#120e16');
    under.ellipse(cx, cy + 1, 7, 2.6, '#1a1520');
    staves([[cx - 17, cy - 3, 9, 1], [cx + 4, cy + 3, 9, 1], [cx + 15, cy - 5, 8, -1], [cx - 8, cy + 5, 7, 1]], TIMBER);
    for (let a = 0; a < Math.PI * 1.4; a += 0.1) p.set(Math.round(cx + 5 + Math.cos(a + 2.2) * 7), Math.round(cy - 3 + Math.sin(a + 2.2) * 2.6), a < 1.5 ? IRONS[3] : IRONS[2]);
  } else if (kind === 'candles') {
    staves([[cx - 22, cy - 2, 9, 1], [cx + 8, cy + 6, 9, 1], [cx + 22, cy - 8, 7, -1]], TIMBER);
    // the candles rolled out side by side, each its own slant, none across another
    for (let k = 0; k < 5; k++) {
      const a = 0.5 + (hash(k, 1, 804) - 0.5) * 0.4;
      const c: V3 = [-9 + k * 4.6, -6 + k * 3.2 + (hash(k, 2, 804) - 0.5) * 2, 1.2];
      S.rod(add(c, [-Math.cos(a) * 4.5, Math.sin(a) * 4.5, 0]), add(c, [Math.cos(a) * 4.5, -Math.sin(a) * 4.5, 0]), 1.2, 1.2, WAX, 20 + k);
    }
  } else if (kind === 'jar') {
    for (const [x0, y0, w, h, turn] of [[cx - 17, cy - 4, 10, 6, 1], [cx + 6, cy - 7, 9, 7, -1], [cx - 4, cy + 4, 8, 5, 1]] as const) {
      lit(p, CLAY, [1, 2], [1, 2], (l) => l.poly([[x0, y0 + h], [x0 + 2, y0], [x0 + w, y0 + 1], [x0 + w - 1, y0 + h - 1], [x0 + w / 2, y0 + h + 1]], INK));
      for (let x = x0 + 2; x < x0 + w - 2; x++) p.set(x, turn > 0 ? y0 + 2 : y0 + h - 2, CLAY[1]);
    }
    for (let k = 0; k < 9; k++) {
      const x = cx - 12 + Math.floor(hash(k, 1, 805) * 26);
      const y = cy - 4 + Math.floor(hash(k, 2, 805) * 10);
      p.set(x, y, BONE[3]).set(x + 1, y, BONE[2]).set(x + 2, y + (k % 2), BONE[3]);
    }
  } else {
    S.egg([-4, -2, 1.6], XYZ, [9, 7, 1.6], (n, w) => toneAt(n, TIMBER_DIM, Math.floor(w[0] + w[1]) % 2 ? 0.1 : -0.2), 1);
    ore(10, 806, 8);
  }
  S.seams();
  return compose(under, [p, S.p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// ON THE FLOOR: lying along its lines, at the middle of their floor

/** THE CART ON ITS SIDE: one of the miners' carts (floor 4's, art/floor4.ts), left lying over on its side where it came off its rails, its wheels up toward the wall, its mouth to us, the ore it held spilled out of it in a fan. 88 x 64 at (44, 38). */
function cartOnSide(): Sprite {
  const S = new Scene(new Px(88, 64), 44, 38);
  // over on its side: its own up turned to lie along the floor, toward us; its middle on the floor
  const L: V3 = norm([1, -0.35, 0]);
  const Up: V3 = norm(cross([0, 0, 1], L));
  const Wd: V3 = [0, 0, -1];
  const k: CartPose = { o: [0, 0, 0], L, Wd, Up, spin: 0.4, upSpin: 1.1, load: [], bone: false };
  const z0 = Math.min(...[-1, 1].flatMap((sl) => [-1, 1].flatMap((sw) => [cartPt(k, sl * CART.l1, sw * CART.w1, CART.z1)[2], cartPt(k, sl * CART.l0, sw * CART.w0, CART.z0)[2]])));
  paintCart(S, { ...k, o: [0, -4, -z0 + 0.4] }, 1);
  // the ore spilled out of its mouth
  let n = 0;
  for (const [x, y, r] of [[2, 22, 2.8], [-6, 26, 2.4], [9, 26, 2.2], [-1, 30, 2], [12, 21, 2.4], [-9, 20, 2.2], [4, 27, 2.6], [15, 27, 1.8], [-4, 33, 1.8]] as const) S.ball([x, y, r * 0.9], r, ORE, 50 + n++, undefined, 0.1);
  S.seams();
  return compose(null, [S.p], null).sprite(44, 38, GRAIN);
}

/**
 * A MINER'S BONES: one who stayed, lying on his back where he fell: his skull rolled aside, his ribs
 * (upright, open at the breast, never on their side), his arms and legs in their bones, his boots still
 * on his feet, toes up, his pick fallen by his hand. Clean, old bone. 72 x 48 at (36, 26).
 */
function minersBones(): Sprite {
  const S = new Scene(new Px(72, 48), 36, 26);
  // laid along a slant across the tile: his head to the upper left, his feet to the lower right
  const L = norm([1, 0.55, 0]);
  const Sd = norm(cross([0, 0, 1], L));
  const P = (along: number, side: number, z: number): V3 => add(add(mul(L, along), mul(Sd, side)), [0, 0, z]);
  ribCage(S, P(-7, 0, 3.6), L, [0, 0, 1], 6.4, BONE, 1, undefined, 1);
  // the spine on down to the hips, the hips
  for (let k = 0; k < 4; k++) S.ball(P(-1 + k * 2, 0, 1.4), 1.1, BONE, 2);
  S.egg(P(7, 0, 1.8), [L, Sd, [0, 0, 1]], [2.4, 4.4, 1.6], (n) => toneAt(n, BONE), 2);
  // the legs, out to the boots
  for (const s of [-1, 1]) {
    longBone(S, P(8, s * 2.6, 1.4), P(17, s * 3.6, 1.4), 1.2, BONE, 3);
    longBone(S, P(17, s * 3.6, 1.4), P(25, s * 4.4, 1.3), 1.05, BONE, 3);
    // his boot, on its back, its toe up: the foot, and its shaft back over the shin
    S.rod(P(21, s * 4.3, 2.4), P(25.4, s * 4.5, 2.4), 2.3, 2.4, LEATHER, 4 + (s > 0 ? 1 : 0));
    S.egg(P(26.4, s * 4.6, 3.6), [[0, 0, 1], Sd, L], [3.6, 2.2, 2.1], (n) => toneAt(n, LEATHER, 0.1), 4 + (s > 0 ? 1 : 0));
  }
  // the arms: one down his side, one flung out toward the pick
  longBone(S, P(-11, -5.6, 1.4), P(-3, -7, 1.2), 1, BONE, 6);
  longBone(S, P(-3, -7, 1.2), P(4, -8.4, 1.2), 0.85, BONE, 6);
  longBone(S, P(-11, 5.6, 1.4), P(-13, 13, 1.2), 1, BONE, 7);
  longBone(S, P(-13, 13, 1.2), P(-9, 19, 1.2), 0.85, BONE, 7);
  // his skull, rolled aside, face up to us
  skull(S, { c: P(-17, -2.6, 4), F: norm([0.5, 0.7, 0.5]), U: norm(mul(L, -1)), R: 4.2, jaw: null }, BONE, 8);
  // his pick, fallen by his hand: its haft, and its head across its end (curved, never a T: at a slant)
  S.rod(P(-6, 22, 1.2), P(10, 20, 1.2), 1, 1, TIMBER_DIM, 9);
  for (let k = -6; k <= 6; k++) {
    const t = k / 6;
    S.ball(add(P(11, 20 + k * 0.9, 1.6), [0, 0, (1 - t * t) * 1.4]), 1.1 - Math.abs(t) * 0.5, SMALL_IRON, 10);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(36, 26, GRAIN);
}

/** A LANTERN DROPPED: a miner's lantern lying on its side where it fell, out: its peaked iron cap, the cage of bars round its glass (the glass dark, cracked across), its foot, its ring; the oil run out of it in a dark stain. 52 x 36 at (26, 22). */
function droppedLantern(): Sprite {
  const S = new Scene(new Px(52, 36), 26, 22);
  const p = new Px(52, 36);
  p.ellipse(32, 26, 13, 4.2, '#120e16');
  p.ellipse(30, 25, 7, 2.4, '#1a1520');
  const ax = norm([1, 0.45, 0]);
  const A = norm(cross(ax, [0, 0, 1]));
  const B = norm(cross(ax, A));
  const c: V3 = [-2, -2, 4.8];
  // the glass, dark, cracked; the bars round it
  S.egg(c, [ax, A, B], [6.4, 4.4, 4.4], (n, w) => {
    const q = sub(w, c);
    const ang = Math.atan2(dot(q, B), dot(q, A));
    const bar = Math.abs(((ang * 4) / Math.PI + 8) % 1 - 0.5) > 0.38;
    const crack = Math.abs(dot(q, ax) - 0.6 * dot(q, A)) < 0.35;
    return bar ? toneAt(n, IRONS, 0.15) : crack ? '#3a2e34' : '#1e1820';
  }, 1);
  // its foot and its cap (peaked), at either end
  S.egg(add(c, mul(ax, -7)), [ax, A, B], [1.3, 4.9, 4.9], (n) => toneAt(n, IRONS, 0.05), 2);
  for (let k = 0; k <= 8; k++) S.egg(add(c, mul(ax, 6.8 + k * 0.7)), [ax, A, B], [0.6, 4.9 - k * 0.55, 4.9 - k * 0.55], (n) => toneAt(n, IRONS, 0.1), 3);
  // its ring, at the cap's peak, lying flat
  S.egg(add(c, mul(ax, 13)), [[0, 0, 1], ax, A], [0.5, 2.2, 2.2], (n) => toneAt(n, SMALL_IRON, 0), 4);
  S.seams();
  return compose(p, [S.p], null).sprite(26, 22, GRAIN);
}

/** A KIBBLE SPILLED: the miners' iron bucket over on its side, dented, its bail flung out, its ore spilled out of its mouth in a heap. 60 x 44 at (30, 26). */
function spilledKibble(): Sprite {
  const S = new Scene(new Px(60, 44), 30, 26);
  const ax = norm([1, 0.3, 0]);
  const A = norm(cross(ax, [0, 0, 1]));
  const B = norm(cross(ax, A));
  const c: V3 = [-6, -2, 6.4];
  for (let l = -8; l <= 8; l += 0.45) {
    const r = 6 + (l + 8) * 0.03;
    for (let a = -Math.PI; a < Math.PI; a += 0.07) {
      const n: V3 = add(mul(A, Math.cos(a)), mul(B, Math.sin(a)));
      if (dot(n, TOWARD) < -0.2) continue;
      const q = add(add(c, mul(ax, l)), mul(n, r));
      if (q[2] < 0) continue;
      const band = Math.abs(l + 6) < 0.6 || Math.abs(l - 6.4) < 0.6;
      const [x, y] = S.at(q);
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), l > 7.6 ? SMALL_IRON[3] : band ? toneAt(n, IRONS, 0.3) : toneAt(n, DIM_IRON, -0.1), 1, q[2]);
    }
  }
  S.egg(add(c, mul(ax, -8.2)), [ax, A, B], [0.3, 6, 6], (n) => toneAt(n, IRONS, 0), 1);
  S.egg(add(c, mul(ax, 8)), [ax, A, B], [0.2, 5.6, 5.6], () => '#0c0a18', 2);
  let n = 0;
  for (const [x, y, r] of [[8, 4, 2.6], [11, 0, 2.2], [13, 6, 2.4], [6, 9, 2], [16, 3, 1.8], [10, 9, 1.8], [9, 1, 2.6]] as const) S.ball([x, y, r * 0.9 + (n === 6 ? 2.6 : 0)], r, ORE, 10 + n++, undefined, 0.1);
  // the bail, flung out on the floor
  let prev: V3 | null = null;
  for (let a = 0; a <= Math.PI + 0.01; a += Math.PI / 8) {
    const q: V3 = [-6 + Math.cos(a) * 6.6, 10 + Math.sin(a) * 4, 0.6];
    if (prev) S.rod(prev, q, 0.5, 0.5, IRONS, 3);
    prev = q;
  }
  S.seams();
  return compose(null, [S.p], null).sprite(30, 26, GRAIN);
}

/** SKULLS GIVEN TO HIM: three skulls set out on the floor (not in a row: two together and one a little off), each with a black candle burning on its crown, the wax run down over its brow: frame `f` of four. 56 x 44 at (28, 30). */
const OFFER_SKULLS: ReadonlyArray<readonly [number, number, number, number]> = [[-8, -3, 0.5, 6], [3, -6, 0.9, 4.5], [5, 6, 0.7, 7.5]];
function skullOfferings(f: number): Sprite {
  const S = new Scene(new Px(56, 44), 28, 30);
  const tops: [number, number][] = [];
  OFFER_SKULLS.forEach(([x, y, look, h], k) => {
    skull(S, { c: [x, y, 4.2], F: norm([Math.cos(look), Math.sin(look), 0.1]), U: [0, 0, 1], R: 4.2, jaw: null }, BONE, 1 + k);
    S.rod([x - 0.6, y - 0.4, 7.4], [x - 0.6, y - 0.4, 7.4 + h], 1.2, 1.2, WAX, 10 + k);
    S.rod(add([x, y, 7.2], [Math.cos(look) * 2.4, Math.sin(look) * 2.4, 0]), add([x, y, 5], [Math.cos(look) * 3.6, Math.sin(look) * 3.6, 0]), 0.5, 0.45, WAX, 10 + k);
    const [px, py] = S.at([x - 0.6, y - 0.4, 7.4 + h]);
    tops.push([px, py]);
  });
  S.seams();
  const fire = new Px(56, 44);
  tops.forEach(([x, y], i) => flame(fire, Math.round(x), Math.round(y) - 1, 4 + ((f + i) % 2), 1.2, [0, 1, 0, -1][(f + i) % 4]));
  const s = compose(null, [S.p], fire).sprite(28, 30, GRAIN);
  s.lights = [{ x: 28 / GRAIN, y: (tops[0][1] - 2) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: 0.42 }];
  return s;
}

// =================================================================================================
// STANDING THINGS, built in the world; anchored at the middle of their tile

/**
 * THE WINDING DRUM AT THE WINZE: the miners' winch for hauling ore up a winze (a small shaft sunk in the
 * floor): a heavy frame of squared timber, two uprights each braced from outside, and between them the
 * drum, its cable wound on it in turns; on one end a great cog driven by a small one on the crank's
 * axle, the crank's arm and grip; the brake: an iron band round a wheel on the drum's other end, worked by
 * a long lever standing up at a slant. The cable runs off the drum over a roller at the winze's lip and
 * down into it; the winze a square hole in the earth collared with timber, the kibble hanging just below
 * its lip. `spin`: how far the drum has turned; `lever` how far the brake lever has kicked up (0 set, 1
 * thrown); `drop` how far the kibble has gone down (0 at the lip); `cable` the cable from the roller
 * down, swung or flung (null: straight down to the kibble). Low and broad: never a gallows.
 */
export const WINCH = { drumX: -12, drumZ: 14, drumR: 5.2, drumL: 11, holeX: 16, holeY: 0, holeR: 9, rollerZ: 4 };
export function paintWinch(S: Scene, spin: number, lever: number, drop: number, id0: number, cable: V3[] | null = null, shake = 0): void {
  const { drumX, drumZ, drumR, drumL, holeX, holeY, holeR, rollerZ } = WINCH;
  const sq = (f: number, u: number, v: number, n: V3): string => (f === 4 ? (Math.abs(((v * 3) % 1) - 0.5) < 0.08 ? TIMBER[2] : TIMBER[3]) : f < 2 ? (Math.abs(Math.hypot(u - 0.5, v - 0.5) - 0.25) < 0.08 ? TIMBER[0] : TIMBER[1]) : Math.abs(((v * 3) % 1) - 0.5) < 0.06 ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.08));
  const sh: V3 = [shake * 0.4, 0, Math.abs(shake) * 0.2];
  // the winze: its mouth dark, its collar of timber
  S.quad([[holeX - holeR, holeY - holeR, 0.2], [holeX + holeR, holeY - holeR, 0.2], [holeX + holeR, holeY + holeR, 0.2], [holeX - holeR, holeY + holeR, 0.2]], () => DEEP, id0);
  for (const [c, r] of [[[holeX, holeY - holeR - 1, 1.2], [holeR + 2, 1.6, 1.2]], [[holeX, holeY + holeR + 1, 1.2], [holeR + 2, 1.6, 1.2]], [[holeX - holeR - 1, holeY, 1.2], [1.6, holeR, 1.2]], [[holeX + holeR + 1, holeY, 1.2], [1.6, holeR, 1.2]]] as [V3, V3][]) S.box(c, XYZ, r, timberFace, id0 + 1);
  // the roller at its lip, on two short posts
  for (const y of [-5, 5]) S.box([holeX - holeR + 1, y * 1.2, 3], XYZ, [1.2, 1.2, 3], timberFace, id0 + 2);
  S.rod([holeX - holeR + 1, -6, rollerZ + 1.6], [holeX - holeR + 1, 6, rollerZ + 1.6], 1.3, 1.3, IRONS, id0 + 2);
  // the kibble, hanging in the winze, going down
  const kz = 2 - drop;
  if (kz > -40) {
    const kc: V3 = [holeX, holeY, kz];
    for (let z = 0; z <= 8; z += 0.45) {
      const r = 4.2 + z * 0.06;
      for (let a = -Math.PI; a < Math.PI; a += 0.09) {
        const n: V3 = [Math.cos(a), Math.sin(a), 0];
        if (dot(n, TOWARD) < -0.15) continue;
        const q: V3 = [kc[0] + n[0] * r, kc[1] + n[1] * r, kc[2] + z];
        // (only what is above the floor shows: below it, the hole hides it)
        if (q[2] < 0.2) continue;
        const [x, y] = S.at(q);
        const band = Math.abs(z - 1.4) < 0.5 || Math.abs(z - 6.8) < 0.5;
        S.put(Math.round(x), Math.round(y), dot(q, TOWARD) + 0.3, z > 7.6 ? SMALL_IRON[3] : band ? toneAt(n, IRONS, 0.3) : toneAt(n, IRONS, -0.05), id0 + 3, q[2]);
      }
    }
  }
  // the frame: a sill either side, an upright on each, braced from outside
  for (const s of [-1, 1]) {
    const y = s * (drumL + 2.2);
    S.box(add([drumX, y, 1.2], sh), XYZ, [9, 2, 1.2], sq, id0 + 4);
    S.box(add([drumX, y, 9.6], sh), XYZ, [2, 2, 8.4], sq, id0 + 4);
    const br = norm([0, s * 0.62, 1]);
    S.box(add([drumX, y + s * 4.6, 7], sh), [norm(cross(br, [1, 0, 0])), [1, 0, 0], br], [1.3, 1.3, 7.4], sq, id0 + 4);
  }
  // the drum and its cable wound on it, turned `spin`
  const dc = add([drumX, 0, drumZ], sh);
  for (let y = -drumL; y <= drumL; y += 0.4) {
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const n: V3 = [Math.cos(a), 0, Math.sin(a)];
      if (dot(n, TOWARD) < -0.25) continue;
      const coil = Math.abs(y) < drumL - 1.4;
      const r = coil ? drumR + 0.9 : drumR;
      const q = add(dc, [n[0] * r, y, n[2] * r]);
      const turn = (((y * 0.42 + (a - spin) / (Math.PI * 2)) % 1) + 1) % 1;
      const c = coil ? (turn < 0.12 ? ROPE[1] : toneAt(n, ROPE, turn < 0.4 ? 0.2 : 0)) : Math.abs(((((a - spin) * 4) / Math.PI) % 1 + 1) % 1 - 0.5) < 0.1 ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.05);
      const [x, yy] = S.at(q);
      S.put(Math.round(x), Math.round(yy), dot(q, TOWARD), c, id0 + 5, q[2]);
    }
  }
  // the axle through the uprights
  S.rod(add(dc, [0, -drumL - 5.4, 0]), add(dc, [0, drumL + 6, 0]), 0.9, 0.9, IRONS, id0 + 6);
  // the great cog on its near end (+y), and the small one under it on the crank's axle; their teeth turned with them
  const cog = (c: V3, R: number, teeth: number, turn: number, id: number): void => {
    for (let a = 0; a < Math.PI * 2; a += 0.04) {
      const tooth = Math.abs(((((a - turn) * teeth) / (Math.PI * 2)) % 1 + 1) % 1 - 0.5) < 0.25;
      const rr = tooth ? R + 1.1 : R;
      for (let r = 0.8; r <= rr; r += 0.45) {
        const q = add(c, [Math.cos(a) * r, 0, Math.sin(a) * r]);
        const [x, y] = S.at(q);
        const spoke = Math.abs(((((a - turn) * 4) / (Math.PI * 2)) % 1 + 1) % 1 - 0.5) < 0.05;
        const c2 = r > rr - 0.9 ? (Math.sin(a) > 0.2 ? SMALL_IRON[3] : IRONS[2]) : r < 1.6 ? SMALL_IRON[3] : r > R - 1.4 || spoke ? IRONS[2] : '#0c0a18';
        S.put(Math.round(x), Math.round(y), dot(q, TOWARD) + 0.4, c2, id, q[2]);
      }
    }
  };
  cog(add(dc, [0, drumL + 3.6, 0]), 7, 22, spin, id0 + 7);
  cog(add(dc, [8.6, drumL + 4.8, -4.2]), 2.6, 8, -spin * 2.7, id0 + 8);
  // the crank: its arm and grip, on the small cog's axle
  const ca = -spin * 2.7;
  const crank = add(dc, [8.6, drumL + 6.6, -4.2]);
  const grip = add(crank, [Math.cos(ca) * 5, 0, Math.sin(ca) * 5]);
  S.rod(crank, grip, 0.9, 0.8, IRONS, id0 + 9);
  S.rod(grip, add(grip, [0, 4, 0]), 1, 1, TIMBER_DIM, id0 + 9);
  // the brake: its wheel on the far end, the band round it, the lever up at a slant (kicked up as it is thrown)
  S.egg(add(dc, [0, -drumL - 2.8, 0]), [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [1.2, drumR + 1.4, drumR + 1.4], (n) => toneAt(n, IRONS, 0.1), id0 + 10);
  const piv = add(dc, [3, -drumL - 4.4, -drumZ + 3]);
  const la = -0.5 - lever * 1.15;
  const ltip = add(piv, [Math.sin(la) * 22, 0, Math.cos(la) * 22]);
  S.rod(piv, ltip, 1.1, 0.9, TIMBER_DIM, id0 + 11);
  S.ball(ltip, 1.2, TIMBER_DIM, id0 + 11);
  S.box(piv, XYZ, [1.6, 1.6, 1.6], (f, _u, _v, n) => (f === 4 ? IRONS[3] : toneAt(n, IRONS, 0)), id0 + 11);
  // the cable: off the drum's underside to the roller, and down over it into the winze
  const off = add(dc, [Math.cos(-0.25) * (drumR + 0.9), 1, -drumR]);
  const roll: V3 = [holeX - holeR + 1, 1, rollerZ + 3];
  S.rod(off, roll, 0.55, 0.55, ROPE, id0 + 12);
  const down = cable ?? [roll, [holeX - holeR + 1.6, 1, 2], [holeX, holeY, kz + 10.5]];
  for (let k = 1; k < down.length; k++) {
    const a = down[k - 1];
    const b = down[k];
    // (what is down in the winze is hidden by its lip: only above the floor, or seen down in its mouth)
    S.rod(a, b, 0.55, 0.55, ROPE, id0 + 12, (w) => w[2] > 0.2);
  }
}
function windingDrum(): Sprite {
  const S = new Scene(new Px(104, 96), 50, 60);
  paintWinch(S, 0, 0, 0, 1);
  S.seams();
  return compose(null, [S.p], null).sprite(50, 60, GRAIN);
}

/** THE SUMP PUMP: where the water was drawn off the workings: a wooden pump, a tall barrel of staves banded with iron, standing in its sump (a hole of black water, collared), its long handle on a pivot at its head, its spout over a trough of planks. 72 x 84 at (36, 60). */
function sumpPump(): Sprite {
  const S = new Scene(new Px(72, 84), 36, 60);
  // the sump: black water in a hole, its timber collar
  S.quad([[-8, -8, 0.2], [8, -8, 0.2], [8, 8, 0.2], [-8, 8, 0.2]], (u, v) => (Math.abs(Math.sin(u * 13 + v * 5)) < 0.08 ? '#1a1630' : '#0a0816'), 1);
  for (const [c, r] of [[[0, -9, 1], [10, 1.4, 1]], [[0, 9, 1], [10, 1.4, 1]], [[-9, 0, 1], [1.4, 8, 1]], [[9, 0, 1], [1.4, 8, 1]]] as [V3, V3][]) S.box(c, XYZ, r, timberFace, 2);
  // the barrel, up out of the water
  for (let z = 0; z <= 30; z += 0.45) {
    const r = 3.8;
    for (let a = -Math.PI; a < Math.PI; a += 0.09) {
      const n: V3 = [Math.cos(a), Math.sin(a), 0];
      if (dot(n, TOWARD) < -0.2) continue;
      const q: V3 = [n[0] * r, n[1] * r, z];
      const band = [4, 14, 24].some((b) => Math.abs(z - b) < 0.7);
      const stave = Math.abs(((a * 6) / Math.PI) % 1) < 0.1;
      const [x, y] = S.at(q);
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), band ? toneAt(n, IRONS, 0.25) : stave ? TIMBER[0] : toneAt(n, TIMBER_DIM, -0.05), 3, z);
    }
  }
  S.egg([0, 0, 30], XYZ, [3.8, 3.8, 0.5], () => TIMBER[3], 3);
  // the spout, out over the trough
  S.rod([2.2, 2.2, 25], [8, 8, 24], 1.2, 1, TIMBER_DIM, 4);
  // the trough of planks, along y
  S.box([10, 8, 2.6], XYZ, [3, 9, 2.6], (f, u, v, n) => (f === 4 ? (u > 0.15 && u < 0.85 && v > 0.08 && v < 0.92 ? '#0c0a16' : TIMBER[3]) : toneAt(n, TIMBER_DIM, -0.05)), 5);
  // the handle: a long bar on a pivot at the barrel's head, its end raised
  S.box([0, 0, 32], XYZ, [1.2, 2, 1.6], (f, _u, _v, n) => (f === 4 ? IRONS[3] : toneAt(n, IRONS, 0)), 6);
  S.rod([-2, 0, 33], [-20, -4, 38], 1.1, 0.9, TIMBER_DIM, 7);
  S.rod([2, 0, 32.4], [6, 1, 31], 0.8, 0.8, IRONS, 7);
  S.seams();
  return compose(null, [S.p], null).sprite(36, 60, GRAIN);
}

/**
 * THE EFFIGY OF THE PRIEST: the cult's idol of him, made of what they had: a pole planted in a cairn of
 * stones, a skull for its head under a hood of their robe's cloth, the robe hung on the pole and bound
 * with cord; two arms of bone lashed to it raised up and out in a wide V, their hands clawed; a ring of
 * small bones hung at its neck. Arms up and out, never straight out to the sides (no cross). 72 x 112 at (36, 96).
 */
function effigy(): Sprite {
  const S = new Scene(new Px(72, 112), 36, 96);
  // the cairn
  let n = 0;
  for (const [x, y, z, r, t] of [[-5, -3, 1.8, 4.4, 0.3], [4, -4, 1.8, 3.8, 1.4], [5, 4, 1.6, 3.6, 2.2], [-4, 5, 1.8, 4, 0.9], [0, 0, 4.6, 3.6, 1.8], [-2, -6, 4.4, 2.6, 2.7]] as const) {
    const A0 = norm([Math.cos(t), Math.sin(t), 0.1]);
    const B0 = norm(cross([0, 0, 1], A0));
    S.egg([x, y, z], [A0, B0, norm(cross(A0, B0))], [r * 1.1, r * 0.85, r * 0.5], facetOf(ROCKY, 0), 1 + n++);
  }
  // the pole
  S.rod([0, 0, 4], [0, 0, 50], 1.1, 0.9, TIMBER_DIM, 10);
  // the robe: hung from its shoulders on the pole, falling in folds, its hem ragged, bound with cord
  const top = 44;
  for (let z = 19; z <= top; z += 0.4) {
    const t = (top - z) / (top - 19);
    const r = 3.4 + t * 3.6;
    for (let a = -Math.PI; a < Math.PI; a += 0.07) {
      const nn: V3 = [Math.cos(a), Math.sin(a) * 0.85, 0];
      if (dot(nn, TOWARD) < -0.2) continue;
      const hem = 19 + 1.6 * Math.sin(a * 5 + 1) + (hash(Math.round(a * 8), 0, 808) - 0.5) * 2;
      if (z < hem) continue;
      const fold = Math.sin(a * 6 + 0.4);
      const q: V3 = [nn[0] * r, nn[1] * r, z];
      const cord = Math.abs(z - 30) < 0.5;
      const [x, y] = S.at(q);
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), cord ? toneAt(nn, ROPE, 0.2) : toneAt(nn, CLOTH, fold * 0.18), 11, z);
    }
  }
  // the hood over the skull, and the skull looking out of it
  S.egg([0, -0.6, 50.2], XYZ, [5.2, 5.2, 6.4], (nn, w) => (dot(nn, norm([0.55, 0.8, 0.1])) > 0.62 && w[2] < 53 ? '#0a0610' : toneAt(nn, CLOTH, 0.1)), 12);
  skull(S, { c: [1.4, 2, 48.4], F: norm([0.55, 0.85, 0.05]), U: [0, 0, 1], R: 3.6, jaw: 0.5 }, BIG_BONE, 13);
  // the arms of bone, lashed on and raised up and out, their hands clawed
  for (const s of [-1, 1]) {
    const sh: V3 = [s * 3.2, s * -3.2, 41];
    const el: V3 = [s * 9, s * -8, 50];
    const wr: V3 = [s * 12.5, s * -11, 61];
    longBone(S, sh, el, 1.15, BIG_BONE, 20 + (s > 0 ? 0 : 5));
    S.rod(el, wr, 0.95, 0.85, BIG_BONE, 21 + (s > 0 ? 0 : 5));
    boneHand(S, wr, sub(wr, el), norm([s * 0.6, s * 0.4, -0.5]), 0.7, BIG_BONE, 22 + (s > 0 ? 0 : 5), 0.95);
    S.ball(add(sh, [0, 0, 1]), 1.5, ROPE, 23 + (s > 0 ? 0 : 5));
  }
  // the ring of small bones hung at its neck
  for (let k = 0; k < 7; k++) {
    const a = -0.4 + k * 0.32;
    const c: V3 = [Math.cos(a) * 4.6, Math.sin(a) * 4.6, 39.2 - Math.sin(k * 0.45) * 2.2];
    S.rod(add(c, [0, 0, 1]), add(c, [0.3, 0.3, -1.6]), 0.55, 0.45, BIG_BONE, 30);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(36, 96, GRAIN);
}

/**
 * THE SKULL STANDARD: a pole planted in a heap of stones, a skull fixed on its top with its jaw hung
 * wide open (the cult's mark), strips of their cloth tied under it and hanging, a few small bones tied
 * among them. (No flame on it: a skull on a pole with fire reads as a torch.) 48 x 104 at (24, 92).
 */
function skullStandard(): Sprite {
  const S = new Scene(new Px(48, 104), 24, 92);
  let n = 0;
  for (const [x, y, z, r] of [[-3, -2, 2, 3.4], [3, -2, 2, 3], [1, 3, 2, 3.2], [0, 0, 5, 2.6]] as const) S.egg([x, y, z], XYZ, [r, r * 0.9, r * 0.7], facetOf(BOULDER, 0.03), 1 + n++);
  S.rod([0, 0, 3], [0.4, 0.4, 58], 0.9, 0.8, TIMBER_DIM, 10);
  skull(S, { c: [0.6, 0.8, 61.4], F: norm([0.55, 0.85, 0.08]), U: [0, 0, 1], R: 4.4, jaw: 0.95, big: 1.1 }, BONE, 11);
  // the strips of cloth tied under it, hanging, a little blown
  for (let k = 0; k < 5; k++) {
    const a = -0.9 + k * 0.5;
    const root: V3 = [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 54];
    const len = 14 + hash(k, 1, 809) * 12;
    let prev = root;
    for (let j = 1; j <= 8; j++) {
      const t = j / 8;
      const q = add(root, [Math.cos(a) * 2.4 * t + 2.4 * t * t, Math.sin(a) * 2.4 * t + 1.2 * t * t, -len * t]);
      S.rod(prev, q, 1.5, 1.2 - t * 0.4, CLOTH, 12 + k);
      prev = q;
    }
  }
  for (const [a, z] of [[0.4, 47], [-0.6, 45]] as const) S.rod([Math.cos(a) * 2.6, Math.sin(a) * 2.6, z + 2], [Math.cos(a) * 2.8, Math.sin(a) * 2.8, z - 2.4], 0.6, 0.5, BONE, 20);
  S.seams();
  return compose(null, [S.p], null).sprite(24, 92, GRAIN);
}

/**
 * HIS BONE HEAPS, the dead he raises: the bones of the dead, cleaned and heaped up loose (none packed in
 * earth, as floor 4's are: his are gathered and kept): long bones every way over it, skulls in it, rib
 * cages; a few spilled at its foot. Two: a great round heap, and a long low one along x. Built so that a
 * moment, or his spell, can move every bone of it.
 */
export interface Heap { rx: number; ry: number; h: number; bits: { kind: 'bone' | 'skull' | 'ribs'; a: V3; b: V3; r: number; F: V3; U: V3 }[] }
function makeHeap(rx: number, ry: number, h: number, seed: number, nBones: number, skulls: ReadonlyArray<readonly [number, number, number]>, ribs: ReadonlyArray<readonly [number, number]>): Heap {
  const top = (x: number, y: number): number => h * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2 - (y / ry) ** 2));
  const on = (x: number, y: number, up = 0): V3 => [x, y, top(x, y) + up];
  const bits: Heap['bits'] = [];
  for (let i = 0; i < nBones; i++) {
    const ang = i * 2.4 + 0.3 + seed;
    const r = Math.sqrt((i + 0.5) / nBones) * 0.82;
    const x = Math.cos(ang) * r * rx;
    const y = Math.sin(ang) * r * ry;
    const d = hash(i, 1, 810 + seed) * Math.PI;
    const len = 6 + hash(i, 2, 810 + seed) * 4;
    const rr = 1 + hash(i, 3, 810 + seed) * 0.35;
    bits.push({ kind: 'bone', a: on(x - Math.cos(d) * len, y - Math.sin(d) * len, rr + 0.3), b: on(x + Math.cos(d) * len, y + Math.sin(d) * len, rr + 0.3), r: rr, F: [1, 0, 0], U: [0, 0, 1] });
  }
  for (const [x, y, look] of skulls) bits.push({ kind: 'skull', a: on(x, y, 3.8), b: [0, 0, 0], r: 4.3, F: norm([Math.cos(look), Math.sin(look), 0.3]), U: [0, 0, 1] });
  for (const [x, y] of ribs) bits.push({ kind: 'ribs', a: on(x, y, 4), b: [0, 0, 0], r: 7.4, F: norm([0.4, 0.4, 0.8]), U: norm([hash(x, y, 811) - 0.5, 0.8, 0]) });
  // spilled at its foot
  bits.push({ kind: 'bone', a: [rx * 0.7, ry * 0.75, 1.1], b: [rx * 0.7 + 11, ry * 0.75 - 6, 1.1], r: 1.05, F: [1, 0, 0], U: [0, 0, 1] });
  bits.push({ kind: 'skull', a: [rx * 0.95, ry * 0.25, 3.5], b: [0, 0, 0], r: 4, F: norm([0.6, 0.75, 0.35]), U: [0, 0, 1] });
  return { rx, ry, h, bits };
}
export const GREAT_HEAP: Heap = makeHeap(31, 27, 17, 0, 28, [[6, 14, 0.9], [18, 2, 0.5], [-8, -12, 0.3], [-15, 6, 1.6], [1, -2, 0.8], [-3, 10, 1.1], [14, -12, 0.2], [-20, -4, 1.2], [9, 20, 0.7]], [[-9, -2], [6, -14]]);
export const LONG_HEAP: Heap = makeHeap(40, 15, 11, 3, 22, [[-22, 4, 0.7], [-5, 3, 1], [15, -2, 0.4], [29, 3, 0.9], [-30, -3, 1.3]], [[6, 2], [-14, -3]]);
/** Paint a heap of his: its loose pile of bones under all (a mound of bone, no earth), and each bone on it (moved by `move`, or gone: null). */
export function paintHeap(S: Scene, H: Heap, bits: readonly (Heap['bits'][number] | null)[], id0: number, ramp: Ramp = BIG_BONE): void {
  // (the pile under all: a mound made of bone ends and shafts packed loose, its hollows dark)
  const mass = (n: V3, w: V3): string => {
    const g = hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2) + Math.floor(w[2] / 2) * 7, 812);
    if (g < 0.22) return '#120e16';
    if (g < 0.5) return toneAt(n, ramp, -0.2);
    return toneAt(n, WALL_BONE, 0.15);
  };
  S.egg([0, 0, 0], XYZ, [H.rx, H.ry, Math.max(0.5, H.h * 0.9)], mass, id0);
  bits.forEach((b, i) => {
    if (!b) return;
    if (b.kind === 'bone') longBone(S, b.a, b.b, b.r, ramp, id0 + 1 + i);
    else if (b.kind === 'skull') skull(S, { c: b.a, F: b.F, U: b.U, R: b.r, jaw: null }, ramp, id0 + 1 + i);
    else ribCage(S, b.a, b.U, b.F, b.r, ramp, id0 + 1 + i);
  });
}
function heapSprite(H: Heap): Sprite {
  const W = Math.round((H.rx + H.ry) * 0.8 * 2 + 32);
  const Ht = Math.round((H.rx + H.ry) * 0.4 * 2 + H.h + 30);
  const ax = Math.round(W / 2);
  const ay = Math.round(Ht - (H.rx + H.ry) * 0.4 - 10);
  const S = new Scene(new Px(W, Ht), ax, ay);
  paintHeap(S, H, H.bits, 1);
  S.seams();
  return compose(null, [S.p], null).sprite(ax, ay, GRAIN);
}

/**
 * THE RIFT: where the ancient power came up through the floor: a long jagged chasm torn open in the
 * earth, deep; its lips broken back, the far one catching the light, chunks of earth tilted up along
 * them; its far wall going down out of sight, fused to black glass, darker the deeper it goes; and far
 * down at the bottom of it, a thin line of the enemy's pink, dim (the deep end of it only: his Colour 3),
 * the one light in it. Along x, two tiles long. 136 x 72 at (68, 36).
 */
export const RIFT_LEN = 38;
export const riftHalf = (x: number): number => (Math.abs(x) >= RIFT_LEN ? 0 : Math.max(0, 10 * Math.sin(Math.PI * ((x + RIFT_LEN) / (2 * RIFT_LEN))) ** 0.6 + 1.4 * Math.sin(x * 0.45) + (hash(Math.floor(x / 3), 0, 813) - 0.5) * 1.6));
export const riftMid = (x: number): number => 3 * Math.sin(x * 0.09 + 0.5) + 1.4 * Math.sin(x * 0.27);
/** The rift's floor, pixel by pixel, at the world's point `w` on the floor: its colour, or null where it is not the rift. `glow`, 0 to 1, how far its light is stirred (1: as it lies). */
export function riftAt(w: V3, x: number, y: number, glow = 1, open = 1): string | null {
  const d = w[1] - riftMid(w[0]);
  const half = riftHalf(w[0]) * open;
  if (half <= 0.6) return null;
  const t = (d + half) / (2 * half);
  if (t >= 0 && t <= 1) {
    // looking down into it: its far wall, black glass, darker as it goes down; the line of light far down; the near lip's overhang
    if (t < 0.1) return GLASS[3];
    if (t < 0.24) return hash(x >> 1, y, 814) < 0.3 ? GLASS[3] : GLASS[2];
    if (t < 0.42) return hash(x >> 1, y, 815) < 0.25 ? GLASS[2] : GLASS[1];
    if (t < 0.56) return RIFT[glow > 0.5 ? 1 : 0];
    if (t < 0.66) return glow > 0.85 ? (hash(x, y >> 1, 816) < 0.5 ? RIFT[4] : RIFT[3]) : glow > 0.4 ? RIFT[3] : RIFT[2];
    if (t < 0.74) return RIFT[glow > 0.5 ? 1 : 0];
    return DEEP;
  }
  // its lips: the far one broken back and lit, the near one in shade
  // (the near lip's broken edge turned up to the light, broadest toward the light; the far lip's in its own shadow)
  if (t < 0 && t > (w[0] < 0 ? -0.1 : -0.16)) return EARTH[0];
  if (t > 1 && t < (w[0] < 0 ? 1.2 : 1.12)) return t < 1.08 ? HEAP_EARTH[4] : HEAP_EARTH[3];
  return null;
}
function theRift(): Sprite {
  const W = 136;
  const H = 72;
  const cx = 68;
  const cy = 36;
  const S = new Scene(new Px(W, H), cx, cy);
  const p = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = riftAt(S.ray(x, y), x, y);
    if (c) p.set(x, y, c);
  }
  // chunks of earth tilted up along its lips
  let n = 0;
  for (const [x, side, r, t] of [[-24, -1, 3.6, 0.3], [-9, 1, 3, 1.2], [7, -1, 3.8, 2.2], [20, 1, 2.8, 0.7], [29, -1, 2.4, 1.7], [-31, 1, 2.2, 2.6]] as const) {
    const y = riftMid(x) + side * (riftHalf(x) + r * 0.7);
    const A0 = norm([Math.cos(t), Math.sin(t), side * 0.25]);
    const B0 = norm(cross([0, 0, 1], A0));
    S.egg([x, y, r * 0.35], [A0, B0, norm(cross(A0, B0))], [r * 1.2, r * 0.9, r * 0.55], facetOf(HEAP_EARTH, 0.05), 10 + n++);
  }
  S.seams();
  const s = compose(p, [S.p], null).sprite(cx, cy, GRAIN);
  s.lights = [{ x: cx / GRAIN, y: cy / GRAIN, r: 22, color: RIFT[4], a: 0.2 }];
  return s;
}

/** THE PILE OF PROPS: the miners' pit props, round logs cut to length, stacked as they left them, three, then two, then one, their cut ends toward us showing their rings; one more fallen off the pile, lying askew. 72 x 64 at (36, 44). */
function propPile(): Sprite {
  const S = new Scene(new Px(72, 64), 36, 44);
  let id = 1;
  const log = (a: V3, b: V3, r = 3): void => {
    S.rod(a, b, r, r, TIMBER, id);
    const d = norm(sub(b, a));
    const s1 = norm(cross(d, [0, 0, 1]));
    const s2 = cross(s1, d);
    for (const e of [a, b]) {
      if (dot(sub(e, mul(add(a, b), 0.5)), TOWARD) <= 0) continue;
      S.egg(e, [d, s1, s2], [0.5, r, r], (_n, w) => {
        const q = Math.hypot(dot(sub(w, e), s1), dot(sub(w, e), s2));
        return q > r - 0.7 ? TIMBER[1] : Math.abs(q - r * 0.45) < 0.4 ? TIMBER[1] : TIMBER[3];
      }, id);
    }
    id++;
  };
  for (const [n, z] of [[3, 3], [2, 8.2], [1, 13.4]] as const) for (let i = 0; i < n; i++) {
    const y = (i - (n - 1) / 2) * 6.2;
    log([-15, y, z], [13 + (i % 2) * 1.5, y, z]);
  }
  log([-6, 16, 2.6], [16, 10, 2.6], 2.6);
  S.seams();
  return compose(null, [S.p], null).sprite(36, 44, GRAIN);
}

/**
 * THE CULT'S COFFER (the game's chest): a squat box of black wood, its edges bound in strips of bone,
 * its lid flat with the shrieking skull burnt into it small; opened, its lid thrown back, and in it what
 * they kept: a folded robe and a bundle of black candles. No gold, nothing that glows. 56 x 56 at (28, 42).
 */
const BLACK_WOOD: Ramp = ['#0e0a12', '#18121c', '#2a2030', '#3c2e42', '#4a3a50'];
function coffer(open: boolean): Sprite {
  const S = new Scene(new Px(56, 56), 28, 42);
  const hx = 9.5;
  const hy = 6.5;
  const hz = 5;
  const wood = (f: number, u: number, v: number, n: V3): string => {
    const edge = f < 2 ? u < 0.1 || u > 0.9 || v < 0.1 || v > 0.9 : u < 0.07 || u > 0.93 || v < 0.1 || v > 0.9;
    if (edge) return toneAt(n, BONE, -0.15);
    if (f === 4) return open ? '#0a0810' : BLACK_WOOD[3];
    return Math.abs(((v * 3) % 1) - 0.5) < 0.06 ? BLACK_WOOD[0] : toneAt(n, BLACK_WOOD);
  };
  S.box([0, 0, hz + 0.6], XYZ, [hx, hy, hz], wood, 1);
  const top = 2 * hz + 0.6;
  const lid = (turn: number): void => {
    const pivot: V3 = [0, -hy - 0.3, top];
    const T = (q: V3): V3 => add(pivot, rot(sub(q, pivot), [1, 0, 0], -turn));
    S.quad([T([-hx - 0.4, -hy - 0.4, top + 2]), T([hx + 0.4, -hy - 0.4, top + 2]), T([hx + 0.4, hy + 0.4, top + 2]), T([-hx - 0.4, hy + 0.4, top + 2])], (u, v) => {
      if (u < 0.06 || u > 0.94 || v < 0.08 || v > 0.92) return BONE[2];
      const k = shriekAt((u - 0.5) / 0.16, (0.5 - v) / 0.22);
      return k === 'bone' ? '#120c14' : turn > 0.5 ? BLACK_WOOD[1] : BLACK_WOOD[3];
    }, 2);
    S.quad([T([-hx - 0.4, hy + 0.4, top]), T([hx + 0.4, hy + 0.4, top]), T([hx + 0.4, hy + 0.4, top + 2]), T([-hx - 0.4, hy + 0.4, top + 2])], () => BONE[1], 2);
  };
  if (!open) lid(0);
  else {
    lid(1.9);
    // in it: a folded robe and a bundle of candles
    S.box([-3, 0.5, top - 1], XYZ, [4.4, 4.6, 1.2], (f, u, _v, n) => (f === 4 ? (Math.abs(u - 0.5) < 0.05 ? CLOTH[1] : CLOTH[3]) : toneAt(n, CLOTH)), 3);
    for (let k = 0; k < 4; k++) S.rod([3.4, -3.6 + k * 1.9, top - 0.4], [8, -3.2 + k * 1.9, top - 0.4], 0.85, 0.85, WAX, 4);
  }
  S.seams();
  return compose(null, [S.p], null).sprite(28, 42, GRAIN);
}

// =================================================================================================
// DOORS AND GATES

/**
 * THE DOOR'S LEAF on this floor: the cult's door, crude: split logs stood side by side, their tops cut
 * off at their own heights, lashed together with rope at two bands, one log's top broken. As the game's
 * leaf (art/gates.ts, makeDoorLeaf): from its hinge (the anchor, on the floor) to its free end, (ex, ey)
 * picture pixels away along the floor. (No brace across it: it would read as a letter.)
 */
export function logDoorLeaf(ex: number, ey: number, high = 56, inShade = false): Sprite {
  const pad = 6;
  const w = Math.abs(ex) + pad * 2;
  const h = high + 6 + Math.abs(ey) + pad * 2;
  const p = new Px(w, h);
  const ox = ex >= 0 ? pad : pad - ex;
  const oy = high + 6 + pad + (ey < 0 ? -ey : 0);
  const at = (t: number, up: number): [number, number] => [Math.round(ox + ex * t), Math.round(oy + ey * t - up)];
  const steps = Math.max(Math.abs(ex), 1);
  const LOGS = 5;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k = t * LOGS;
    const log = Math.min(LOGS - 1, Math.floor(k));
    const f = k - log;
    // (each log round: lit toward its left, in shade to its right; a dark gap between two)
    const gap = (f < 0.08 || f > 0.94) && t > 0.02 && t < 0.98;
    const top = high + [3, -2, 5, 0, -4][log] - (log === 2 ? Math.round(Math.max(0, f - 0.4) * 10) : 0);
    for (let up = 0; up < top; up++) {
      let c = gap ? TIMBER[0] : f < 0.26 ? TIMBER[3] : f > 0.78 ? TIMBER[1] : TIMBER[2];
      if (up >= top - 2) c = up === top - 1 ? TIMBER[3] : TIMBER[2];
      // the rope lashings, two bands
      if ([12, high - 14].some((b) => up >= b && up <= b + 3)) c = gap ? ROPE[1] : (up + Math.round(f * 3)) % 2 ? ROPE[3] : ROPE[2];
      if (up === 0) c = TIMBER[0];
      p.set(at(t, 0)[0], at(t, 0)[1] - up, c);
    }
  }
  return (inShade ? recolor(p, shaded) : p).sprite(ox, oy, GRAIN);
}
function leafOf(ex: number, ey: number): Sprite {
  const dx = (ex / 32 + ey / 16) / 2;
  const dy = (ey / 16 - ex / 32) / 2;
  return logDoorLeaf(ex, ey, 56, Math.abs(dy) > Math.abs(dx));
}

/** THE MARK OVER THIS FLOOR'S GATES (art/gates.ts, a Mark): the cult's shrieking skull carved in relief in a roundel on the keystone, big enough to read; in stone, giving off no light. */
const shriekMark: Mark = (x, y, st, _lit, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.6) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const k = shriekAt(x / 8.4, (y + 0.9) / 8.4);
  if (k === 'dark') return st.joint;
  if (k === 'bone') return shriekAt((x - (lightLow ? -1 : 1)) / 8.4, (y - 0.1) / 8.4) === 'bone' ? st.light : st.body;
  return st.dark;
};
/** OVER HIS OWN GATE: the shrieking skull cut in the stone, and in its open mouth and its sockets his fire burning pink (the enemy's: as the game's boss gate has the Warden's), hottest deep in its throat. */
const hisMark: Mark = (x, y, st, lit_, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.6) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const k = shriekAt(x / 8.4, (y + 0.9) / 8.4);
  if (k === 'dark') {
    const mouth = (y + 0.9) / 8.4 < -0.24;
    return mouth ? ((y + 0.9) / 8.4 < -0.5 ? (lit_ ? PINK[3] : PINK[2]) : lit_ ? PINK[2] : PINK[1]) : lit_ ? PINK[2] : PINK[1];
  }
  if (k === 'bone') return shriekAt((x - (lightLow ? -1 : 1)) / 8.4, (y - 0.1) / 8.4) === 'bone' ? st.light : st.body;
  return st.dark;
};
let gates: GateArt | null = null;
/** THIS FLOOR'S DOORS AND GATES, as the game's (art/gates.ts): the cult's stone, their mark over their gates, his over his own, their doors of lashed logs. */
export function lairGates(): GateArt {
  return gates ?? (gates = makeGateArt(THEME, { gateMark: shriekMark, bossMark: hisMark, leaf: leafOf }));
}

// =================================================================================================
// QUESTS

/** HIS BOOK: the fleshmancer's book, thick, bound between plates of bone, a clasp of bone holding it shut, the cult's mark cut in its cover; its page edges dark with age. (No glow, no words.) 44 x 36 at (22, 26). */
function hisBook(): Sprite {
  const S = new Scene(new Px(44, 36), 22, 26);
  const L = norm([1, 0.35, 0]);
  const Wd = norm(cross([0, 0, 1], L));
  const c: V3 = [0, 0, 3.2];
  // its pages
  S.box(c, [L, Wd, [0, 0, 1]], [8.6, 6.4, 2.4], (f, u, v) => (f === 4 ? BONE[2] : Math.abs((((f < 2 ? u : v) * 6) % 1) - 0.5) < 0.22 ? '#2a2622' : '#5a524a'), 1);
  // its covers of bone, a little bigger, the mark cut in the top one
  for (const z of [0.5, 5.9]) {
    S.box(add(c, [0, 0, z - 3.2]), [L, Wd, [0, 0, 1]], [9.2, 7, 0.6], (f, u, v, n) => {
      if (f !== 4 || z < 1) return toneAt(n, BONE, 0);
      const k = shriekAt((u - 0.5) / 0.2, (v - 0.5) / 0.26);
      return k === 'dark' ? '#1c1418' : k === 'bone' ? BONE[3] : u < 0.06 || v > 0.94 ? BONE[3] : '#2a2230';
    }, 2);
  }
  // the clasp, round its free edge
  S.box(add(c, mul(Wd, 6.9)), [L, Wd, [0, 0, 1]], [1.6, 0.6, 3.4], (_f, _u, _v, n) => toneAt(n, BONE, 0.1), 3);
  S.seams();
  return compose(null, [S.p], null).sprite(22, 26, GRAIN);
}

// =================================================================================================
// THE SET

/**
 * WHERE EACH WALL PIECE MAY BE SET: its first spot, then others, (across, up) in picture pixels: low,
 * middle and high on the wall, and across it, each within its own tile's face and below where the wall
 * fades into the dark (his note on floor 1's: "I don’t like the wall panels all being in the exact same
 * spot").
 */
const SPOTS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  'the lagged wall': [[0, 0], [-1, 0], [1, 0]],
  'the cave-in': [[0, 0]],
  'the drilled face': [[1, -2], [-1, 6], [0, 2]],
  'the priest in the stone': [[0, 0], [-3, 0], [4, 0]],
  'the shrine': [[5, -5], [5, 2], [-5, 22]],
  'the boarded adit': [[0, 0], [-4, 0], [3, 0]],
  'black glass': [[0, 0], [-2, 0], [1, 0]],
  "the cult's banner": [[4, -5], [1, 0], [-5, 5]],
  "a cultist's robe": [[5, -6], [5, 1], [-5, 8]],
  'the candle ledge': [[1, -9], [-2, 16], [-2, 23]],
  'the daubed mark': [[3, -14], [3, -6], [-6, 13]],
  'bones on cords': [[5, -8], [-5, -1], [2, 6]],
  "a miner's candle": [[6, -20], [-5, 11], [2, 19]],
  'rope and pulley': [[-2, -5], [7, 3], [-2, 11]],
  'the hung kibble': [[-3, -2], [7, 0], [2, 3]],
  'the shrieking skull': [[0, 0]],
};

let made: Piece[] | null = null;
/** THE FLESHMANCER'S LAIR, every piece, painted the first time they are asked for and kept. */
export function lairPieces(): Piece[] {
  if (made) return made;
  /** A wall piece at each of its spots, on both faces; `frames` of it if it moves, `lights` for each. */
  const wall = (name: string, kind: PieceKind, make: (f: number) => WallMake, frames = 1, light?: (f: number, du: number, dv: number) => (alongX: boolean) => Light[]): Piece => {
    const spots: Spot[] = (SPOTS[name] ?? [[0, 0]]).map(([du, dv]) => {
      const left: Sprite[] = [];
      const right: Sprite[] = [];
      for (let f = 0; f < frames; f++) {
        left.push(wallSprite(make(f), true, du, dv, light ? light(f, du, dv)(true) : []));
        right.push(wallSprite(make(f), false, du, dv, light ? light(f, du, dv)(false) : []));
      }
      return { du, dv, left, right };
    });
    return { name, kind, left: spots[0].left, right: spots[0].right, spots };
  };
  const flatW = (paint: (p: Px) => void): ((f: number) => WallMake) => () => ({ flat: paint });
  const fireLight = (h: number) => (f: number, du: number, dv: number) => (alongX: boolean): Light[] => [{ x: (PCX + du) / GRAIN, y: (PFOOT - h - dv) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: alongX ? 0.5 : 0.42 }];
  const G = lairGates();
  made = [
    // wall tiles
    wall('the lagged wall', 'wall tile', () => laggedWall),
    { ...wall('the cave-in', 'wall tile', () => caveIn), frames: [caveHeap()], shadow: 0.46 },
    wall('the drilled face', 'wall tile', flatW(drilledFace)),
    wall('the priest in the stone', 'wall tile', flatW(priestStone)),
    wall('the shrine', 'wall tile', (f) => shrine(f), 4, fireLight(22)),
    wall('the boarded adit', 'wall tile', flatW(boardedAdit)),
    wall('black glass', 'wall tile', flatW(blackGlass)),
    // on the walls
    wall("the cult's banner", 'on the wall', flatW(banner)),
    wall("a cultist's robe", 'on the wall', flatW(robeOnPeg)),
    wall('the candle ledge', 'on the wall', (f) => candleLedge(f), 4, fireLight(30)),
    wall('the daubed mark', 'on the wall', flatW(daubedMark)),
    wall('bones on cords', 'on the wall', () => chimes),
    wall("a miner's candle", 'on the wall', (f) => minersCandle(f), 4, candleLight),
    wall('rope and pulley', 'on the wall', () => ropeAndPulley),
    wall('the hung kibble', 'on the wall', () => hungKibble),
    // floor tiles
    { name: 'the trodden way', kind: 'floor tile', frames: [onTile(troddenWay)] },
    { name: "the rails' bend", kind: 'floor tile', frames: [onTile(railsBend)] },
    { name: 'the plank walk', kind: 'floor tile', frames: [onTile(plankWalk)] },
    { name: "the cult's ring", kind: 'floor tile', frames: [onTile(ritualRing)] },
    { name: "the cult's slab", kind: 'floor tile', frames: [onTile(carvedSlab, SLAB_IN)] },
    { name: 'spoil', kind: 'floor tile', frames: [onTile(spoil)] },
    // traps
    { name: 'the grasping earth', kind: 'trap', frames: [graspingEarth(false), graspingEarth(true)] },
    { name: 'the charge', kind: 'trap', frames: [theCharge(false), theCharge(true)] },
    wall('the shrieking skull', 'trap', () => shardSkull),
    // breakables: whole, and what each leaves broken
    { name: 'powder keg', kind: 'breakable', frames: [powderKeg(), brokenOf('keg')], shadow: 0.22 },
    { name: 'box of candles', kind: 'breakable', frames: [candleBox(), brokenOf('candles')], shadow: 0.28 },
    { name: 'offering jar', kind: 'breakable', frames: [offeringJar(), brokenOf('jar')], shadow: 0.2 },
    { name: 'basket of ore', kind: 'breakable', frames: [oreBasket(), brokenOf('basket')], shadow: 0.26 },
    // on the floor
    { name: 'the cart on its side', kind: 'on the floor', frames: [cartOnSide()], shadow: 0.42 },
    { name: "a miner's bones", kind: 'on the floor', frames: [minersBones()], shadow: 0.3 },
    { name: 'a dropped lantern', kind: 'on the floor', frames: [droppedLantern()], shadow: 0.2 },
    { name: 'the spilled kibble', kind: 'on the floor', frames: [spilledKibble()], shadow: 0.3 },
    { name: 'skulls given to him', kind: 'on the floor', frames: [0, 1, 2, 3].map(skullOfferings), shadow: 0.24 },
    // obstacles
    { name: 'the winding drum', kind: 'obstacle', frames: [windingDrum()], shadow: 0.62 },
    { name: 'the sump pump', kind: 'obstacle', frames: [sumpPump()], shadow: 0.42 },
    { name: 'the effigy', kind: 'obstacle', frames: [effigy()], shadow: 0.26 },
    { name: 'the skull standard', kind: 'obstacle', frames: [skullStandard()], shadow: 0.17 },
    { name: 'the great bone heap', kind: 'obstacle', frames: [heapSprite(GREAT_HEAP)], shadow: 0.66 },
    { name: 'the long bone heap', kind: 'obstacle', frames: [heapSprite(LONG_HEAP)], shadow: 0.7 },
    { name: 'the rift', kind: 'obstacle', frames: [theRift()], shadow: 0.7 },
    { name: 'the pile of props', kind: 'obstacle', frames: [propPile()], shadow: 0.5 },
    { name: "the cult's coffer", kind: 'obstacle', frames: [coffer(false), coffer(true)], shadow: 0.28 },
    { name: 'the mine shaft', kind: 'obstacle', frames: [shaftStill().empty, shaftStill().down], shadow: 0.7 },
    // doors and gates
    { name: 'the door', kind: 'door', gates: G, frames: [G.leaf(32, 16), G.leaf(-32, 16), G.post] },
    { name: 'the gate', kind: 'gate', gates: G, frames: [...G.arch(true, false, false).map((q) => q.s), G.pillar(false)] },
    { name: "the boss's gate", kind: 'gate', gates: G, frames: [...G.arch(true, true, false).map((q) => q.s), G.pillar(true)] },
    // quests
    { name: 'his book', kind: 'quest', frames: [hisBook()], shadow: 0.18 },
  ];
  return made;
}
