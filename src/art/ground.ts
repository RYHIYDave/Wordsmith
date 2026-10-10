// The dungeon's floor and walls at the heroes' grain (Version 14.1).
//
// The owner, 4 Oct 2026: "we need the dungeons and mobs brought up to the level of the character
// models". The monsters were Version 14.0; this is what they stand on and between. Like the
// figures it is painted at two picture pixels to a game pixel, in flat colour, without outlines.
//
// THE FLOOR is the one on the sheet he chose his art style from (previews/art_styles_1_and_6.png;
// `groundPatch` in src/dev/styles.ts): deep blue flagstones, smaller than a tile, each a flat
// tone with a lit lip along its two upper edges and a shaded one along its two lower. The
// flagstones are laid on the world, not on the tiles (eight of them cross five tiles), so the
// grid of the rules does not show in the floor; a tile's picture therefore depends on where the
// tile is, and there is one for every place in a block of PERIOD x PERIOD tiles. Here and there
// a stone is cracked across or has lost a corner, and the floor lies in patches a tone darker or
// lighter where it is damp or worn. Where a wall stands over the floor it lays a shadow on it
// (`shadeLeft` and its fellows: the renderer lays them over the tiles next to a wall).
//
// THE WALLS are blocks of big dressed stones, a little lighter and more violet than the floor,
// WITH THREE DISTINCT FACES (the owner, 6 Oct 2026: "Do not draw walls as flat blocks. Draw them
// with three distinct faces: a lighter Top face (catching light), a medium Left face, and a
// darker Right face (in shadow) to create instant 3D depth."): the top is a capstone, the
// lightest of the three, with a lit lip along its two near edges; the face turned to screen-left
// is the middle tone; the one turned to screen-right is in shade. (Up to Version 16 the top was
// the darkest of them, nearly black with a rim, "so that a room reads as a lit floor in a frame".)
//
// A THEME is the colours of all that, and the size of its stones: another dungeon (a castle of
// black stone, a glacier) is another theme through the same painters.

import { LEDGE_H, LOW_WALL_H, PIT_DEPTH, WALL_H } from '../engine/iso';
import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { GRAIN, hash } from './kit';

/** One tile in picture pixels: a diamond 64 across and 32 down. */
const TW = 32 * GRAIN;
const TH = 16 * GRAIN;
const HALF = TW / 2;

/** Five tones of a wall's face: the joint between stones, a stone's shaded lip, the usual stone, the odd stone, its lit lip. */
export type Face = readonly [string, string, string, string, string];

export interface Theme {
  id: string;
  /** The gap between flagstones. */
  mortar: string;
  /** A flagstone: its shaded lip, then the three tones a stone can be (the last is also its lit lip). */
  slab: readonly [string, string, string, string];
  /** How many flagstones lie along the side of a tile. (1.6: eight to five tiles.) */
  slabs: number;
  /**
   * THE TOP OF A WALL, the lightest of its three faces: a capstone to a tile, in five tones as a
   * face has them (the joint where two capstones meet, along its two far edges; a pit in it; the
   * usual stone; the odd stone; the lit lip along its two near edges, which catch the light). Of a
   * whole wall, and of one cut down low (a tone lower: it is nearer the eye and under it).
   */
  cap: Face;
  capLow: Face;
  /** The face turned to screen-left, the middle tone of the three, and the one turned to screen-right, in shade. */
  lit: Face;
  shade: Face;
  /** What is gone of its stonework, and the earth and rock under it (none: all of it is there, as in the vault). */
  earth?: Earth;
}

/**
 * THE CRYPT LESS FINISHED THE DEEPER IT GOES (the owner, 9 Oct 2026, 22:47: "the deeper you go, the
 * less finished the crypt.  The top floor, while old and crumbling, is all stone.  As you go down,
 * there’s more and more missing and more just dirt around.  By floor 4 it’s about half dirt and
 * rocks"): how much of a floor's flagstones are gone, in patches, and of its walls' stones; the
 * earth under them and the rock in it; how often a stone that is there has lost a corner or is
 * cracked across (the vault's is one in fourteen of each).
 */
export interface Earth {
  /** Of the floor's flagstones, how many are gone (0 none to 1 all), lying in patches. */
  gone: number;
  /** Of the walls' stones, how many have fallen or were never laid: rough rock and earth there (0 to 1). */
  raw: number;
  /** Of the stones that are there, how many have lost a corner, and as many again are cracked across. */
  broken: number;
  /** The earth: its dark (in pits, and under what lies on it), its usual tone, a lighter tone in patches, and the lit top of a clod. */
  dirt: readonly [string, string, string, string];
  /** Rock, lying in the earth and in the walls: its shaded side, its body, an odd one, its lit edge. */
  rock: readonly [string, string, string, string];
}

/** The Warden's vault: the dungeon of the first book. Deep blue flagstones, violet-blue walls. */
export const VAULT: Theme = {
  id: 'vault',
  mortar: '#0d0c24',
  slab: ['#15133a', '#1e1c4e', '#262462', '#33307a'],
  slabs: 1.6,
  cap: ['#2c2868', '#4a449c', '#5e58b6', '#5650aa', '#827cd0'],
  capLow: ['#262260', '#423c8c', '#544eaa', '#4e48a0', '#746ec4'],
  lit: ['#1a1744', '#2c2868', '#3a3480', '#342e76', '#544ea6'],
  shade: ['#0f0d28', '#17143c', '#211d50', '#1d1948', '#2c2866'],
};

/** How many tiles before the floor's pattern of tones comes round again (a multiple of five, with `slabs` 1.6). */
const PERIOD = 10;

// ---------------------------------------------------------------------------------------------
// The raster of a tile, at the finer grain. Row y of the diamond (0..31) is 2, 6, 10 ... 62 pixels
// wide and then narrows again, exactly as the 32 x 16 diamond of the first builds at twice the
// size: neighbours offset by (32, 16) picture pixels meet without a gap or an overlap.

function halfWidth(y: number): number {
  return y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1;
}

/** The lowest row of the diamond that holds column x (1..62). */
function bottomRow(x: number): number {
  const xx = x < HALF ? x : TW - 1 - x;
  return Math.floor((xx + HALF - 1) / 2);
}

/** Where in its tile a pixel of the diamond is: (u, v), each 0..1; u runs to screen right-down, v to screen left-down. */
function onTile(x: number, y: number): [number, number] {
  const px = x + 0.5 - HALF;
  const py = y + 0.5;
  return [(px / HALF + py / (TH / 2)) / 2, (py / (TH / 2) - px / HALF) / 2];
}

// ---------------------------------------------------------------------------------------------
// The floor

/** A number between 0 and 1 that changes smoothly over the floor, and comes round with it: for patches of wear. */
function patch(wu: number, wv: number): number {
  const CELL = 2.5; // tiles to a patch
  const n = PERIOD / CELL;
  const gu = wu / CELL;
  const gv = wv / CELL;
  const iu = Math.floor(gu);
  const iv = Math.floor(gv);
  const fu = gu - iu;
  const fv = gv - iv;
  const at = (a: number, b: number): number => hash(((a % n) + n) % n, ((b % n) + n) % n, 21);
  const su = fu * fu * (3 - 2 * fu);
  const sv = fv * fv * (3 - 2 * fv);
  return (at(iu, iv) * (1 - su) + at(iu + 1, iv) * su) * (1 - sv) + (at(iu, iv + 1) * (1 - su) + at(iu + 1, iv + 1) * su) * sv;
}

/** A smooth number between 0 and 1 over the floor that comes round with it, `cell` tiles to a patch (a multiple that divides PERIOD), its own for each `seed`. */
function smoothAt(wu: number, wv: number, cell: number, seed: number): number {
  const n = Math.round(PERIOD / cell);
  const gu = wu / cell;
  const gv = wv / cell;
  const iu = Math.floor(gu);
  const iv = Math.floor(gv);
  const fu = gu - iu;
  const fv = gv - iv;
  const at = (a: number, b: number): number => hash(((a % n) + n) % n, ((b % n) + n) % n, seed);
  const su = fu * fu * (3 - 2 * fu);
  const sv = fv * fv * (3 - 2 * fv);
  return (at(iu, iv) * (1 - su) + at(iu + 1, iv) * su) * (1 - sv) + (at(iu, iv + 1) * (1 - su) + at(iu + 1, iv + 1) * su) * sv;
}
/** Which flagstones are gone, as a set of their places in the pattern (u * n + v): the theme's share of them, in patches. */
const GONE = new Map<string, Set<number>>();
function goneOf(theme: Theme): Set<number> {
  const e = theme.earth;
  const key = `${theme.id}:${e?.gone ?? 0}`;
  let out = GONE.get(key);
  if (out) return out;
  out = new Set<number>();
  if (e && e.gone > 0) {
    // (patches a few tiles across, and here and there a stone on its own: the share taken exactly, the lowest first)
    const S = theme.slabs;
    const n = Math.round(PERIOD * S);
    const all: [number, number][] = [];
    for (let iu = 0; iu < n; iu++) for (let iv = 0; iv < n; iv++) all.push([iu * n + iv, 0.7 * smoothAt((iu + 0.5) / S, (iv + 0.5) / S, 2.5, 37) + 0.3 * hash(iu, iv, 33)]);
    all.sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < Math.round(e.gone * all.length); i++) out.add(all[i][0]);
  }
  GONE.set(key, out);
  return out;
}

/**
 * EARTH, where the flagstones are gone: dark violet earth in clods, lighter in patches, and rocks
 * lying in it, each lit along its upper-left edge and throwing a little shadow to its lower right
 * (four to a tile side, about half of them there).
 */
function earthAt(e: Earth, wu: number, wv: number, x: number, y: number): string {
  const G = 4;
  const n = PERIOD * G;
  const gu = wu * G;
  const gv = wv * G;
  const cu = Math.floor(gu);
  const cv = Math.floor(gv);
  let shadow = false;
  for (let du = -1; du <= 1; du++) {
    for (let dv = -1; dv <= 1; dv++) {
      const a = (((cu + du) % n) + n) % n;
      const b = (((cv + dv) % n) + n) % n;
      if (hash(a, b, 41) > 0.5) continue;
      const ou = gu - (cu + du + 0.25 + 0.5 * hash(a, b, 42));
      const ov = gv - (cv + dv + 0.25 + 0.5 * hash(a, b, 43));
      const r = 0.16 + 0.2 * hash(a, b, 44);
      // (a lump, not a disc: its edge goes in and out a little round it)
      const ang = Math.atan2(ov, ou);
      const rr = r * (1 + 0.18 * Math.sin(ang * 3 + hash(a, b, 45) * 6));
      const d = Math.hypot(ou, ov);
      if (d < rr) {
        // (light from the upper left of the screen: the rock's side toward -u is lit, toward +u in shade)
        const k = (-ou * 0.95 - ov * 0.3) / rr;
        if (k > 0.5) return e.rock[3];
        if (k < -0.45) return e.rock[0];
        return hash(a, b, 46) < 0.3 ? e.rock[2] : e.rock[1];
      }
      if (d < rr + 0.12 && ou > 0) shadow = true;
    }
  }
  if (shadow) return e.dirt[0];
  // (the earth: clods a few pixels across, lighter in patches; a lit top here and there, a pit here and there)
  const light = smoothAt(wu, wv, 2, 47);
  const clod = hash(Math.floor(wu * 14), Math.floor(wv * 14), 48);
  if (hash(x, y, 49) < 0.02) return e.dirt[0];
  if (clod > 0.86) return e.dirt[3];
  if (clod < 0.08) return e.dirt[0];
  return light > 0.58 ? e.dirt[2] : e.dirt[1];
}

/** The colour of the floor at a place in the world (in tiles). */
function floorAt(theme: Theme, wu: number, wv: number, x: number, y: number): string {
  const S = theme.slabs;
  const su = Math.floor(wu * S);
  const sv = Math.floor(wv * S);
  const fu = wu * S - su;
  const fv = wv * S - sv;
  const edge = Math.min(fu, fv);
  // (the pattern of tones comes round with the pictures: every PERIOD tiles)
  const n = Math.round(PERIOD * S);
  const iu = ((su % n) + n) % n;
  const iv = ((sv % n) + n) % n;
  const e = theme.earth;
  if (e) {
    // WHERE THE STONE IS GONE: earth. And where a stone is there but its neighbour is gone, its edge broken away there, raggedly.
    const gone = goneOf(theme);
    if (gone.has(iu * n + iv)) return earthAt(e, wu, wv, x, y);
    const near = (a: number, b: number): boolean => gone.has(((((iu + a) % n) + n) % n) * n + ((((iv + b) % n) + n) % n));
    const rag = 0.06 + 0.1 * hash(Math.floor((fu + fv) * 9), iu * 31 + iv, 51);
    if ((near(-1, 0) && fu < rag) || (near(1, 0) && fu > 1 - rag) || (near(0, -1) && fv < rag) || (near(0, 1) && fv > 1 - rag)) return earthAt(e, wu, wv, x, y);
  }
  if (edge < 0.075) return theme.mortar;
  const tone = hash(iu, iv, 1);
  const odd = hash(iu, iv, 2);
  // (how often a stone has lost a corner, and is cracked across: the theme's, or the vault's one in fourteen)
  const broken = e?.broken ?? 0.07;
  // a stone that has lost a corner: the gap is filled with the dirt of the joints
  if (odd < broken) {
    const cu = odd < broken / 2 ? fu : 1 - fu;
    const cv = hash(iu, iv, 3) < 0.5 ? fv : 1 - fv;
    if (cu + cv < 0.42) return e ? earthAt(e, wu, wv, x, y) : theme.mortar;
  }
  // a stone cracked across: a dark line that wanders from one side of it to the other
  if (odd > 1 - broken) {
    const along = hash(iu, iv, 5) < 0.5;
    const a = along ? fu : fv;
    const b = along ? fv : fu;
    const line = 0.3 + hash(iu, iv, 6) * 0.4 + (a - 0.5) * (hash(iu, iv, 7) - 0.5) * 0.9 + (hash(Math.floor(a * 6), iu * 31 + iv, 8) - 0.5) * 0.1;
    if (Math.abs(b - line) < 0.035) return theme.mortar;
  }
  // a lit lip along the stone's two upper edges, a shaded one along its two lower
  if (edge < 0.17) return theme.slab[3];
  if (Math.max(fu, fv) > 0.9) return theme.slab[0];
  // a stone is one flat tone; here and there a pit in it
  if (hash(x, y, 4 + ((su * 7 + sv * 13) & 15)) < 0.012) return theme.slab[0];
  // (the floor lies in patches: a stone in a damp one is a tone darker, in a worn one a tone lighter)
  const wear = patch((su + 0.5) / S, (sv + 0.5) / S);
  const t = (tone < 0.3 ? 1 : tone < 0.82 ? 2 : 3) + (wear > 0.68 ? -1 : wear < 0.3 ? 1 : 0);
  return theme.slab[Math.max(1, Math.min(3, t))];
}

function makeFloor(theme: Theme, tx: number, ty: number): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      p.set(x, y, floorAt(theme, tx + u, ty + v, x + tx * 31, y + ty * 17));
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The walls: a block 64 x (32 + its height), the anchor at the top corner of the diamond it stands on

/** Rows of a course of stones, and the height of a whole wall, in picture pixels. */
const COURSE = 16;
let TALL = WALL_H * GRAIN;

// THE WALLS' LOOK. The owner, 7 Oct 2026, 11:32: "Now that we have varying levels of height, the
// walls suddenly increasing or decreasing in height is jarring. Also I don't like being able to
// see the tops of the walls." Of three ways shown to him as a picture (13:29) he chose the third
// (13:39: "3"): taller walls that fade into the dark at the top, and none toward the eye. Its
// pictures in the town, in a corridor across the screen, in an eight-sided hall and beside a
// doorway went to him at 14:46 with the question "Good to put out?", and at 14:55 he said:
// "Good". IN THE GAME SINCE VERSION 18.4: `WALL_LOOK` starts as `WALLS_FADING`.
//
// The look the game had until Version 18.3 is kept as `WALLS_BLOCKS`, with the tests that held
// it, should he want it back. What the painters here and the renderer go by:
export interface WallLook {
  /** How high a whole wall stands, in game pixels (a multiple of 8: a course of stones). */
  tall: number;
  /**
   * 'lit': the top of a wall is a capstone, the lightest of its three faces. 'dark': it is the dark
   * beyond the walls, and is not seen (but hides what lies behind the wall as the capstone did).
   * 'none': a whole wall has no top at all: what lies behind it is seen right down to the top edge of its faces.
   */
  cap: 'lit' | 'dark' | 'none';
  /** How many game pixels at the top of a whole wall's faces are lost in the dark (0: none). */
  fade: number;
  /** One top line: a wall is not built up behind raised floor (the floor rises against it). */
  level: boolean;
  /** The walls toward the eye: cut down 'low' (8 pixels, as in the game), a 'kerb' (3 pixels, dark on top), or 'none'. */
  front: 'low' | 'kerb' | 'none';
  /**
   * WHICH walls are "toward the eye". false: as in the game, a wall with floor right behind it.
   * true: every wall that, standing whole, would hide any floor at all behind it (a block 32
   * pixels high hides the floor two tiles behind it): so that no wall ever stands over floor.
   */
  away: boolean;
  /**
   * A WHOLE WALL IS ITS FACES ALONE (the way he chose, "3", worked out): no top is painted, a block
   * paints only the faces that are not against another whole wall, the flat wall across a cut tile
   * is its one face and the block behind it is not painted at all; and what is lost at the top of
   * a wall is lost by FADING OUT, so that floor behind it shows through the fading part, where
   * `fade` without this turns the stone black. (A black top is the black beyond the walls only
   * where nothing lies behind the wall: over a floor behind it, it is a black shape with a saw edge.)
   */
  faces: boolean;
}
/** The look until Version 18.3: blocks 24 pixels high with a lit capstone, cut down low where floor lies right behind, built up behind raised floor. Kept, and tested, but not the game's. */
export const WALLS_BLOCKS: Readonly<WallLook> = { tall: WALL_H, cap: 'lit', fade: 0, level: false, front: 'low', away: false, faces: false };
/**
 * THE GAME'S LOOK SINCE VERSION 18.4, the one he chose ("3") and said "Good" to: a wall is its
 * faces alone, 40 pixels high, of which the top 12 fade out; one top line; nothing toward the eye;
 * a wall whose solid part would hide floor is left out (render/walls.ts).
 */
export const WALLS_FADING: Readonly<WallLook> = { tall: 40, cap: 'dark', fade: 12, level: true, front: 'none', away: true, faces: true };
/** The look in force. Set it with `setWallLook` (the pictures of the ground are painted by it: make them again after). */
export const WALL_LOOK: WallLook = { ...WALLS_FADING };
/** Set the look in force (all of it, or some of its parts). The ground's pictures made before are of the old look: call `makeGroundArt` again. */
export function setWallLook(look: Partial<WallLook>): void {
  Object.assign(WALL_LOOK, look);
}
/** The dark beyond the walls (the screen's own black: art/palette.ts, P.black). */
const BEYOND = '#07050a';
const ALL_DARK: Face = [BEYOND, BEYOND, BEYOND, BEYOND, BEYOND];

/** The colour of a whole wall's face k rows below its top: lost in the dark toward the top, in four flat steps, if the look says so. */
function faded(c: string, k: number): string {
  const rows = WALL_LOOK.fade * GRAIN;
  if (rows <= 0 || k >= rows) return c;
  return mixHex(c, BEYOND, [0.9, 0.66, 0.42, 0.2][Math.floor((k * 4) / rows)]);
}

/**
 * Paint a pixel of a wall's face, k rows below the top of the wall: as it is, or, in the rows
 * that the look loses at the top of a WHOLE wall, a step darker toward the black beyond the walls
 * (or, with `faces`, a step fainter: fading out), in four flat steps.
 */
function put(p: Px, x: number, y: number, c: string, k: number, whole: boolean): void {
  const rows = WALL_LOOK.fade * GRAIN;
  if (!whole || rows <= 0 || k >= rows) {
    p.set(x, y, c);
    return;
  }
  const band = Math.floor((k * 4) / rows);
  if (!WALL_LOOK.faces) {
    p.set(x, y, mixHex(c, BEYOND, [0.9, 0.66, 0.42, 0.2][band]));
    return;
  }
  p.set(x, y, c);
  if (p.inside(x, y)) p.d[(y * p.w + x) * 4 + 3] = Math.round(255 * [0.14, 0.38, 0.62, 0.84][band]);
}

/** The top of a wall by the look: of a whole wall (null: it has none), and of one cut down low. */
function capOf(theme: Theme, whole: boolean): Face | null {
  if (WALL_LOOK.cap === 'lit') return whole ? theme.cap : theme.capLow;
  // (dark: nothing of a whole wall's top is seen. A kerb's top is seen, since what stands under it is: a dim
  // stone, the tones of a face in shade, with a lip along its near edges; black, it would be a strip of
  // stone hanging in the dark a tile away from the floor)
  if (!whole) return [theme.shade[0], theme.shade[1], theme.shade[2], theme.shade[2], theme.lit[1]];
  return WALL_LOOK.cap === 'dark' ? ALL_DARK : null;
}
/** How high the walls toward the eye stand, in picture pixels. */
function lowHeight(): number {
  return (WALL_LOOK.front === 'kerb' ? 3 : LOW_WALL_H) * GRAIN;
}

interface WallSpec {
  seed: number;
  /** A crack down the lit face, and one down the shaded face: [column, first row, rows]. */
  crackL?: readonly [number, number, number];
  crackR?: readonly [number, number, number];
}

const WALLS: readonly WallSpec[] = [{ seed: 1 }, { seed: 6 }, { seed: 11 }, { seed: 3, crackL: [17, 5, 30], crackR: [11, 14, 24] }, { seed: 8 }];
/** The walls cut down low show the foot of the same stonework. */
const LOW_WALLS: readonly WallSpec[] = [WALLS[0], WALLS[1], WALLS[2]];

/** A crack that wanders down a face: the pixels it runs through, keyed row * 64 + column. */
function crackPath(start: readonly [number, number, number] | undefined, seed: number): Set<number> {
  const out = new Set<number>();
  if (!start) return out;
  let u = start[0];
  for (let i = 0; i < start[2]; i++) {
    out.add((start[1] + i) * 64 + u);
    const n = hash(i, start[0], seed);
    u += n < 0.3 ? -1 : n > 0.7 ? 1 : 0;
    u = Math.max(3, Math.min(27, u));
  }
  return out;
}

/**
 * One face of a wall. u: the column along the face, 0..30, left to right on the screen. v: rows
 * below the face's top edge. The stones are laid in courses, counted from the top of a WHOLE
 * wall (one cut down low shows the bottom course of the same pattern, so the lines meet where the
 * two stand side by side). Every other course has a joint in the middle of the face; the courses
 * between have theirs where two tiles meet, so the joints are staggered along a run of wall.
 */
function wallFace(theme: Theme, spec: WallSpec, left: boolean, height: number): (u: number, v: number) => string {
  const [joint, lo, usual, odd, hi] = left ? theme.lit : theme.shade;
  const seed = spec.seed * 16 + (left ? 0 : 5);
  const skip = TALL - height;
  const e = theme.earth;
  // (OLD AND CRUMBLING, the Crypt's: more of the faces cracked down, the theme's share of them, each its own way)
  const extra: [number, number, number] | undefined = e && hash(spec.seed, left ? 1 : 2, 91) < e.broken * 2.2 ? [5 + Math.floor(hash(spec.seed, left ? 3 : 4, 92) * 20), 2 + Math.floor(hash(spec.seed, left ? 5 : 6, 93) * 26), 12 + Math.floor(hash(spec.seed, left ? 7 : 8, 94) * 34)] : undefined;
  const crack = crackPath((left ? spec.crackL : spec.crackR) ?? extra, seed);
  // (rough rock, in the light of this face: the face turned to screen-left a step lighter than the one in shade)
  const rock = e ? (left ? e.rock.map((c) => mixHex(c, theme.lit[2], 0.25)) : e.rock.map((c) => mixHex(c, theme.shade[1], 0.45))) : null;
  const deep = e ? (left ? e.dirt[0] : mixHex(e.dirt[0], BEYOND, 0.3)) : joint;
  return (u, v) => {
    const row = v + skip;
    const course = Math.floor(row / COURSE);
    const r = row % COURSE;
    // (a crack runs down the dressed stone: in a theme with earth, not through rough rock or a broken corner, which come first)
    if (!e) {
      if (crack.has(row * 64 + u)) return joint;
      if (crack.has(row * 64 + u - 1)) return hi;
    }
    const mid = course % 2 === 0;
    // where this course's upright joint is: in the middle of the face, or at the tile's edge
    // (the left face's last column and the right face's first are the block's front corner)
    const at = mid ? 15 : left ? 0 : 30;
    if (e && rock && e.raw > 0) {
      // A STONE THAT HAS FALLEN, OR WAS NEVER LAID: rough rock and earth where it would be, in lumps
      // a few pixels across, each lit along its upper-left edge, with dark earth between them
      const which = mid ? (u < at ? 0 : 1) : 0;
      if (hash(course * 2 + which, spec.seed, seed + 17) < e.raw) {
        const CELL = 7;
        const gx = u / CELL;
        const gy = row / (CELL * 0.8);
        const cx = Math.floor(gx);
        const cy = Math.floor(gy);
        let best = 9;
        let second = 9;
        let id = 0;
        let ox = 0;
        let oy = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const px = cx + dx + 0.15 + 0.7 * hash(cx + dx, cy + dy, seed + 23);
            const py = cy + dy + 0.15 + 0.7 * hash(cx + dx, cy + dy, seed + 29);
            const d = Math.hypot(gx - px, gy - py);
            if (d < best) {
              second = best;
              best = d;
              id = (cx + dx) * 31 + cy + dy;
              ox = gx - px;
              oy = gy - py;
            } else if (d < second) second = d;
          }
        }
        if (second - best < 0.12) return deep;
        const k = -ox * 0.8 - oy * 0.9;
        if (k > 0.32) return rock[3];
        if (k < -0.3) return rock[0];
        return hash(id, 3, seed + 31) < 0.3 ? rock[2] : rock[1];
      }
    }
    if (e) {
      // A STONE THAT HAS LOST A CORNER (the Crypt's, the theme's share of them): a notch broken out
      // of its top corner by a joint, dark earth in it, its broken edge lit or in shade as it is turned
      const which = mid ? (u < at ? 0 : 1) : 0;
      const k = course * 2 + which;
      if (hash(k, spec.seed, seed + 41) < e.broken) {
        // (which top corner: the one by the joint on its left or on its right; and how big)
        const leftEnd = mid ? (which === 0 ? 0 : at + 1) : left ? 1 : 0;
        const rightEnd = mid ? (which === 0 ? at - 1 : 30) : left ? 30 : 29;
        const onLeft = hash(k, spec.seed, seed + 43) < 0.5;
        const size = 4 + Math.floor(hash(k, spec.seed, seed + 47) * 5);
        const du = onLeft ? u - leftEnd : rightEnd - u;
        const d = du + (r - 1) * 1.3;
        if (du >= 0 && r >= 0 && d < size) return deep;
        // (its broken edge: turned up and to the left, toward the light, where the corner it lost is its left one; else away from it)
        if (du >= 0 && r >= 0 && d < size + 1.4) return onLeft ? hi : lo;
      }
      if (crack.has(row * 64 + u)) return joint;
      if (crack.has(row * 64 + u - 1)) return hi;
    }
    // the line between two courses
    if (r === 0) return joint;
    if (u === at) return joint;
    // (a stone of a course whose joint is in the middle of the face runs on into the next tile,
    // and must be one tone there: only a stone that lies within the tile can be the odd one)
    const tone = !mid && hash(course, 0, seed + 1) < 0.34 ? odd : usual;
    // light from the upper left: a stone's top and left edges are lit, its bottom and right ones shaded
    if (r === 1 || u === at + 1) return hi;
    if (r === COURSE - 1 || u === at - 1) return lo;
    // the foot of the wall is a tone darker, where it meets the floor
    if (row >= TALL - 3) return lo;
    return tone;
  };
}

function makeWall(theme: Theme, spec: WallSpec, height: number, which: 'both' | 'left' | 'right' = 'both'): Sprite {
  // (`which`: both faces under the top, as a wall block is; or ONE FACE ALONE and no top: for the look in which a wall is its faces)
  const p = new Px(TW, TH + height);
  const whole = height === TALL;
  const left = wallFace(theme, spec, true, height);
  const right = wallFace(theme, spec, false, height);
  // the two faces, hung from the diamond's lower edges
  for (let x = 1; x <= TW - 2; x++) {
    const yb = bottomRow(x);
    const isLeft = x < HALF;
    if ((which === 'left' && !isLeft) || (which === 'right' && isLeft)) continue;
    const u = isLeft ? x - 1 : x - HALF;
    for (let k = 0; k < height; k++) put(p, x, yb + 1 + k, isLeft ? left(u, k) : right(u, k), k, whole);
  }
  const cap = which === 'both' ? capOf(theme, whole) : null;
  if (cap) capTop(p, cap, spec.seed, 0);
  return p.sprite(HALF, height, GRAIN);
}

/**
 * THE TOP OF A WALL BLOCK: its capstone, painted on the diamond whose top corner is `dy` rows
 * down the canvas. The lightest face of the three. A joint runs along its two far edges, where it
 * meets the capstone of the tile behind; its two near edges, which stand over the faces and catch
 * the light, are a lip of the lightest tone, two pixels wide; here and there a pit.
 */
function capTop(p: Px, cap: Face, seed: number, dy: number): void {
  const [joint, pit, usual, odd, lip] = cap;
  const stone = hash(seed, 2, 61) < 0.34 ? odd : usual;
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      let c = stone;
      if (u > 0.935 || v > 0.935) c = lip;
      else if (u < 0.05 || v < 0.05) c = joint;
      else if (hash(x, y, 70 + seed) < 0.012) c = pit;
      p.set(x, dy + y, c);
    }
  }
}

// ---------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------
// The shadow a wall lays on the floor at its foot. The light is from the upper left of the
// screen, so a wall up and to the left of a tile throws a broad shadow over it; one up and to the
// right, whose lit face is turned to the tile, only darkens the angle where the two meet. In two
// flat steps, like everything else.

/** `band(u, v)`: how dark (0..1) the shadow is at a place on the tile. */
function makeShade(band: (u: number, v: number) => number): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      const a = band(u, v);
      if (a <= 0) continue;
      const i = (y * TW + x) * 4;
      p.d[i] = 6;
      p.d[i + 1] = 4;
      p.d[i + 2] = 16;
      p.d[i + 3] = Math.round(a * 255);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The town's gate: a great arch built into a run of wall, with a field of light in it.
//
// The owner, 5 Oct 2026: "have the gate be embedded in the back wall like a big glowing gate".
// It is four tiles of wall wide and rises to more than twice the wall's height: twice as tall as
// a hero. Each of the four tiles is
// a whole wall block whose lit face (the one turned to the room, where a wall runs from the
// upper left of the screen to the lower right) carries its part of the arch: so each part is
// drawn in its wall's place in the order of things, and a hero walking along the foot of the
// gate is in front of every part of it.

/** How many tiles of wall the gate takes. */
export const GATE_TILES = 4;
/** How high the arch rises over the floor, in picture pixels (a whole wall is TALL). */
const GATE_RISE = 110;
/** The middle of the gate along the wall, in picture pixels of its face. */
const GATE_MID = (GATE_TILES * HALF - 1) / 2;
/** The light of what is the player's: the dark of it, its body, its bright, its heart (the kit's SPARK). */
const GLOW = ['#0c6a80', '#22d0e0', '#b8fff8', '#ffffff'] as const;

function mixHex(a: string, b: string, t: number): string {
  const n = (s: string, i: number): number => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  const h = (i: number): string => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t).toString(16).padStart(2, '0');
  return `#${h(0)}${h(1)}${h(2)}`;
}

/**
 * What the gate is at a point of the wall's face. U: along the wall, in picture pixels (GATE_TILES
 * tiles of it), left to right on the screen. V: above the foot of the wall. Returns a colour, or null
 * where the wall is as it was.
 *
 * The opening lies back in the wall by DEPTH. The wall's face runs to the lower right of the
 * screen, so what lies back in it is seen up and to the right: the field of light is the
 * opening moved by (DEPTH, DEPTH) on the face, and between the two the left side of the opening
 * and its floor are seen (the right side and the top are hidden, as they would be).
 */
function gateAt(theme: Theme, U: number, V: number, frame: number): string | null {
  const mid = GATE_MID;
  const R = 47; // the arch's outer radius, and half its width at the jambs
  const r = 37; // the opening's
  const spring = 56; // where the round top begins
  const DEPTH = 10;
  const u = U + 0.5 - mid;
  const inArch = (du: number, v: number, rad: number): boolean => v >= 0 && (v <= spring ? Math.abs(du) <= rad : du * du + (v - spring) * (v - spring) <= rad * rad);
  // dressed stone, lighter than the wall it stands in
  const dark = theme.lit[1];
  const body = theme.lit[4];
  const light = mixHex(theme.lit[4], '#ffffff', 0.26);
  const joint = theme.lit[0];
  if (!inArch(u, V, R)) {
    // the sill: a step along its foot, a little wider than the arch
    if (V < 5 && Math.abs(u) <= R + 5) return V === 4 ? light : V === 0 ? dark : body;
    return null;
  }
  if (!inArch(u, V, r)) {
    // the stones of the arch. Their joints: across the jambs, and fanned round the top.
    if (V < 5) return V === 4 ? light : body;
    if (V <= spring) {
      if (V % 12 === 4) return joint;
    } else {
      const a = Math.atan2(V - spring, u); // 0 at the right springing, pi at the left
      const k = (a / Math.PI) * 11;
      if (Math.abs(k - Math.round(k)) < 0.06 && Math.round(k) > 0 && Math.round(k) < 11) return joint;
    }
    // the keystone, with its gem alight
    if (Math.abs(u) < 6 && V > spring) {
      if (Math.abs(u) < 2.6 && V >= spring + r + 2 && V <= spring + r + 7) return (frame & 1) === 0 ? GLOW[2] : GLOW[3];
      return light;
    }
    // light from the upper left: the outer edge of the left jamb and of the left of the round top
    // is bright; the inner edge, next to the field, catches the field's light; the right jamb's
    // outer edge is in shade
    const d = V <= spring ? Math.abs(u) : Math.hypot(u, V - spring); // how far from the arch's own middle line
    if (d > R - 1.6) return u < 0 || V > spring + R * 0.55 ? light : dark;
    if (d < r + 1.6) return mixHex(body, GLOW[1], 0.55);
    return u > R * 0.55 && V <= spring ? mixHex(body, dark, 0.5) : body;
  }
  // the opening
  const bu = u - DEPTH;
  const bv = V - DEPTH;
  if (!inArch(bu, bv, r)) {
    // what is seen of the inside of the arch: its floor, bright with the field's light, and its left side
    if (bv < 0) return mixHex(body, GLOW[1], 0.35 + 0.3 * (V / DEPTH));
    return mixHex(theme.shade[1], GLOW[0], 0.45);
  }
  // the field: bands of light that rise, bent toward the middle, with a bright heart
  const dx = bu / r;
  const wave = Math.sin((bv + frame * 5) * 0.32 + dx * dx * 2.6);
  const heart = 1 - Math.min(1, Math.hypot(dx, (bv - 38) / 48));
  const v = wave * 0.5 + heart * 1.3;
  return v > 1.25 ? GLOW[3] : v > 0.7 ? GLOW[2] : v > 0.1 ? GLOW[1] : GLOW[0];
}

/** One tile's part of the gate: a whole wall block, its lit face and the column at its front corner carrying their part of the arch. */
function makeGateWall(theme: Theme, part: number, frame: number): Sprite {
  const extra = GATE_RISE - TALL;
  const spec = WALLS[0];
  const p = new Px(TW, TH + TALL + extra);
  const left = wallFace(theme, spec, true, TALL);
  const right = wallFace(theme, spec, false, TALL);
  for (let x = 1; x <= TW - 2; x++) {
    const yb = bottomRow(x);
    const isLeft = x < HALF;
    const u = isLeft ? x - 1 : x - HALF;
    for (let k = 0; k < TALL; k++) p.set(x, extra + yb + 1 + k, faded(isLeft ? left(u, k) : right(u, k), k));
  }
  // (THE WALLS' LOOK: the gate's wall is a whole wall like any other, its top as the look has it)
  const gateCap = capOf(theme, true);
  if (gateCap) capTop(p, gateCap, spec.seed, extra);
  // the gate, on the lit face and the corner column (which hangs with the face's last column)
  for (let x = 1; x <= HALF; x++) {
    const foot = extra + bottomRow(x) + TALL;
    for (let V = 0; V < GATE_RISE; V++) {
      const c = gateAt(theme, part * HALF + (x - 1), V, frame);
      if (c && foot - V >= 0) p.set(x, foot - V, c);
    }
  }
  const s = p.sprite(HALF, TALL + extra, GRAIN);
  // the part that has the middle of the arch carries the light: of the field, and what it throws on the floor at its foot
  const mine = GATE_MID - part * HALF;
  if (mine >= 0 && mine < HALF) {
    const fx = (mine + 1) / GRAIN;
    const fy = (extra + bottomRow(Math.round(mine) + 1) + TALL) / GRAIN;
    s.lights = [
      { x: fx, y: fy - 24, r: 40 + (frame % 2), color: GLOW[1], a: 0.42 },
      { x: fx - 8, y: fy + 8, r: 44, color: GLOW[1], a: 0.2 },
    ];
  }
  return s;
}

/** The gate's pictures: for each frame of its light, its GATE_TILES parts from screen-left to screen-right. */
export function makeGateWalls(theme: Theme = VAULT, frames = 4): Sprite[][] {
  const out: Sprite[][] = [];
  for (let f = 0; f < frames; f++) {
    const parts: Sprite[] = [];
    for (let k = 0; k < GATE_TILES; k++) parts.push(makeGateWall(theme, k, f));
    out.push(parts);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// HEIGHT: the face of a ledge, the lit lip of an edge, a flight of stairs, a pit.
//
// The owner, 7 Oct 2026: "Then work on ledges and stairs"; "Gaps and pits to use the swipe ability
// over". Raised floor is the floor's own flagstones, one level up (LEDGE_H game pixels), on a
// block of the walls' stone: where the floor next to it is lower, the block's face is seen, the
// one turned to screen-left in the middle tone and the one turned to screen-right in shade, as a
// wall's are (his rule of the three faces), and the edge of the floor above it carries a lip of
// light. Stairs are four steps to a tile. A pit is a hole: its two far sides are seen going down
// into the dark, and its near edges are the floor's edge against nothing.

const LEDGE = LEDGE_H * GRAIN;
const PIT = PIT_DEPTH * GRAIN;
/** How many steps a flight of stairs has to a tile. */
export const STEPS = 4;
/** The dark at the bottom of a pit. */
const PIT_DARK = '#04030a';

/** The first row of the diamond that holds column x (1..62). */
function topRow(x: number): number {
  return x < HALF ? Math.ceil((HALF - 1 - x) / 2) : Math.ceil((x - HALF) / 2);
}

/**
 * The face of a ledge under one of a raised tile's two near edges: two courses of the walls'
 * stone, their joints staggered along a run of ledge as a wall's are, the top edge bright where
 * it meets the floor's lip. The picture's origin is the top corner of the tile's own diamond.
 */
function makeLedge(theme: Theme, seed: number, left: boolean): Sprite {
  const [joint, lo, usual, odd, hi] = left ? theme.lit : theme.shade;
  const p = new Px(TW, TH + LEDGE);
  const C = LEDGE / 2;
  for (let x = left ? 1 : HALF; x <= (left ? HALF - 1 : TW - 2); x++) {
    const yb = bottomRow(x);
    const u = left ? x - 1 : x - HALF;
    for (let k = 0; k < LEDGE; k++) {
      const course = Math.floor(k / C);
      const r = k % C;
      const mid = course % 2 === 0;
      const at = mid ? 15 : left ? 0 : 30;
      let c = !mid && hash(course, seed, 91) < 0.34 ? odd : usual;
      if (k === 0) c = hi;
      else if (r === 0 || u === at) c = joint;
      else if (r === 1 || u === at + 1) c = k === 1 ? usual : hi;
      else if (r === C - 1 || u === at - 1 || k >= LEDGE - 3) c = lo;
      p.set(x, yb + 1 + k, c);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

/** A line of light or of dark along one edge of a tile's diamond: `pick(u, v)` says which pixels. */
function makeEdge(color: string, pick: (u: number, v: number) => boolean): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      if (pick(u, v)) p.set(x, y, color);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

/**
 * A FLIGHT OF STAIRS on one tile: STEPS steps from the floor at its foot to the floor one level
 * up at its head. `north`: it goes up toward -y (the upper right of the screen), its risers turned
 * to screen-left (the middle tone); else toward -x (the upper left), its risers turned to
 * screen-right (in shade). `side`: the flight's open side is seen (the one toward the eye: the
 * floor beside it there is lower), a wall of stone cut to the steps' outline.
 *
 * Painted as the eye would see it: for each pixel, whichever of the treads, the risers and the
 * side lies nearest. The picture's anchor is the top corner of the tile's diamond ON THE GROUND.
 */
function makeStairs(theme: Theme, north: boolean, side: boolean): Sprite {
  const riser = north ? theme.lit : theme.shade;
  const cheek = north ? theme.shade : theme.lit;
  const lip = mixHex(theme.slab[3], '#ffffff', 0.2);
  const p = new Px(TW, TH + LEDGE);
  const half = TH / 2;
  for (let Y = -LEDGE; Y < TH; Y++) {
    for (let X = 0; X < TW; X++) {
      const px = (X + 0.5 - HALF) / HALF;
      let best = -1;
      let col: string | null = null;
      // the treads
      for (let i = 0; i < STEPS; i++) {
        const h = ((i + 1) * LEDGE) / STEPS;
        const py = (Y + 0.5 + h) / half;
        const u = (px + py) / 2;
        const v = (py - px) / 2;
        if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
        const a = north ? v : u; // along the flight: 1 at its foot, 0 at its head
        const b = north ? u : v; // across it
        const a0 = 1 - (i + 1) / STEPS;
        if (a < a0 || a >= a0 + 1 / STEPS) continue;
        if (u + v <= best) continue;
        best = u + v;
        const t = (a - a0) * STEPS; // 0 at the back of the tread, 1 at its front edge
        // a stone to half a tile, the joints of one step set off from the next; a lit lip at the front edge
        const jointAt = i % 2 === 0 ? 0.5 : 0.02;
        col = t > 0.74 ? lip : Math.abs(b - jointAt) < 0.035 ? theme.mortar : t < 0.16 ? theme.slab[0] : theme.slab[i % 2 === 0 ? 2 : 1];
      }
      // the risers: the upright front of each step
      for (let i = 0; i < STEPS; i++) {
        const a1 = 1 - i / STEPS;
        const b = north ? px + a1 : a1 - px;
        if (b < 0 || b >= 1) continue;
        const h = (b + a1) * half - (Y + 0.5);
        const lo = (i * LEDGE) / STEPS;
        const tall = LEDGE / STEPS;
        if (h <= lo || h > lo + tall) continue;
        if (b + a1 < best) continue;
        best = b + a1;
        const jointAt = i % 2 === 0 ? 0.02 : 0.5;
        col = Math.abs(b - jointAt) < 0.035 ? riser[0] : h - lo < 1.2 ? riser[1] : riser[2];
      }
      // the open side: stone cut to the outline of the steps
      if (side) {
        const a = north ? 1 - px : 1 + px;
        if (a >= 0 && a < 1) {
          const h = (1 + a) * half - (Y + 0.5);
          const i = Math.min(STEPS - 1, Math.floor((1 - a) * STEPS));
          const top = ((i + 1) * LEDGE) / STEPS;
          if (h >= 0 && h <= top && 1 + a >= best) {
            best = 1 + a;
            col = h > top - 1.2 ? cheek[4] : h < 2.2 ? cheek[1] : Math.abs(h - LEDGE / 2) < 0.6 ? cheek[0] : cheek[2];
          }
        }
      }
      if (col) p.set(X, Y + LEDGE, col);
    }
  }
  return p.sprite(HALF, LEDGE, GRAIN);
}

/**
 * One of the two far sides of a pit, as it is seen going down into the dark: `left`, the one
 * under the pit tile's upper-left edge (it is turned to screen-right: in shade); else the one
 * under its upper-right edge (turned to screen-left: the middle tone). The walls' stonework, its
 * top edge bright, lost in the dark by the bottom. It hangs PIT picture pixels down from the edge,
 * over the tiles in front of it: the renderer draws it only where those are pit too.
 */
function makePitWall(theme: Theme, spec: WallSpec, left: boolean): Sprite {
  const tones = left ? theme.shade : theme.lit;
  const face = wallFace(theme, spec, !left, TALL);
  const p = new Px(TW, TH + PIT);
  for (let x = left ? 1 : HALF; x <= (left ? HALF - 1 : TW - 2); x++) {
    const y0 = topRow(x);
    const u = left ? x - 1 : x - HALF;
    for (let k = 0; k < PIT; k++) {
      const d = k / PIT;
      const c = k === 0 ? tones[4] : mixHex(face(u, k), PIT_DARK, d < 0.18 ? 0.2 : d < 0.4 ? 0.5 : d < 0.65 ? 0.76 : 0.92);
      p.set(x, y0 + k, c);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// TRIANGLES: a wall over HALF a tile, the tile cut corner to corner (game/cut.ts has the rules).
//
// The owner, 7 Oct 2026: "What would happen if we added triangles to the tileset?"; "Id like
// see some stills of some rooms with triangles to decide"; and of the stills: "Triangles look
// pretty good I like it". A tile cut along the line that runs
// ACROSS the screen has a far half and a near half; cut along the line that runs UP AND DOWN it,
// a left half and a right half. A wall over the far half shows a face HEAD-ON (the one new piece
// of painting: its tone lies between the face turned to screen-left and the one turned to
// screen-right). A wall over the near half shows the two ordinary faces. A wall over the left or
// the right half shows half of an ordinary wall: its top and the one face on its outer edge; the
// side it turns to the floor is seen edge-on, that is, not at all.

export type WallPart = 'far' | 'near' | 'left' | 'right';

function makeWallPart(theme: Theme, spec: WallSpec, height: number, part: WallPart, fromTop = false): Sprite {
  // (`fromTop`: the TOP of a whole wall, `height` rows of it: what stands over a half tile of
  // raised floor when the walls keep one top line. Else a wall of that height from its foot up.)
  const p = new Px(TW, TH + height);
  const whole = height === TALL || fromTop;
  // (with `faces`, the flat wall across a tile is its one face: no top. The slants that run up and
  // down the screen, and those toward the eye, are not drawn at all in that look: render.ts, cutTile.)
  const bare = WALL_LOOK.faces && whole && part === 'far';
  const cap = bare ? null : capOf(theme, whole);
  const [cJoint, cPit, cUsual, cOdd, cLip] = cap ?? ALL_DARK;
  const stone = hash(spec.seed, 2, 61) < 0.34 ? cOdd : cUsual;
  const mid = TH / 2;
  // the faces
  if (part === 'far') {
    // head-on: a flat wall as wide as the tile, hung from the tile's line across
    const tones = theme.lit.map((c, i) => mixHex(c, theme.shade[i], 0.45));
    const [joint, lo, usual, odd, hi] = tones;
    const skip = fromTop ? 0 : TALL - height;
    // (a flat wall that is its one face is painted the whole width of the tile: nothing stands behind it to fill the seam between two of them)
    for (let x = bare ? 0 : 1; x <= (bare ? TW - 1 : TW - 2); x++) {
      for (let k = 0; k < height; k++) {
        const row = k + skip;
        const course = Math.floor(row / COURSE);
        const r = row % COURSE;
        // (stones a tile wide; every other course has its joint in the middle of the tile, the courses between at its edge)
        const at = course % 2 === 0 ? HALF : 1;
        let c = course % 2 === 1 && hash(course, 3, spec.seed + 40) < 0.34 ? odd : usual;
        if (r === 0 || x === at) c = joint;
        else if (r === 1 || x === at + 1) c = hi;
        else if (r === COURSE - 1 || x === at - 1 || (at === 1 && x === TW - 2) || k >= height - 3) c = lo;
        if (bare) put(p, x, mid + k, c, k, true);
        else p.set(x, mid + k, whole ? faded(c, k) : c);
      }
    }
  } else {
    const left = wallFace(theme, spec, true, fromTop ? TALL : height);
    const right = wallFace(theme, spec, false, fromTop ? TALL : height);
    for (let x = 1; x <= TW - 2; x++) {
      const isLeft = x < HALF;
      if ((part === 'left' && !isLeft) || (part === 'right' && isLeft)) continue;
      const yb = bottomRow(x);
      const u = isLeft ? x - 1 : x - HALF;
      for (let k = 0; k < height; k++) {
        // (the foot of a wall is a tone darker where it meets the floor: of one that shows the top of a whole wall too)
        const c = fromTop && k >= height - 3 ? (isLeft ? theme.lit : theme.shade)[1] : isLeft ? left(u, k) : right(u, k);
        p.set(x, yb + 1 + k, whole ? faded(c, k) : c);
      }
    }
  }
  // the top: the half of the capstone that is this wall's (if the look gives a whole wall a top at all)
  for (let y = 0; cap && y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      if (part === 'far' && y >= mid) continue;
      if (part === 'near' && y < mid) continue;
      if (part === 'left' && x >= HALF) continue;
      if (part === 'right' && x < HALF) continue;
      const [u, v] = onTile(x, y);
      let c = stone;
      if (part === 'far') {
        // (its near edge is the line across: a lip of light over the face)
        if (y >= mid - 2) c = cLip;
        else if (u < 0.05 || v < 0.05) c = cJoint;
      } else if (part === 'near') {
        if (u > 0.935 || v > 0.935) c = cLip;
        else if (y < mid + 1) c = cJoint;
      } else if (part === 'left') {
        if (v > 0.935) c = cLip;
        else if (x >= HALF - 1 || u < 0.05) c = cJoint;
      } else {
        if (u > 0.935 || x < HALF + 2) c = cLip;
        else if (v < 0.05) c = cJoint;
      }
      if (c === stone && hash(x, y, 70 + spec.seed) < 0.012) c = cPit;
      p.set(x, y, c);
    }
  }
  return p.sprite(HALF, height, GRAIN);
}

// ---------------------------------------------------------------------------------------------

export interface GroundArt {
  /** The floor of a tile: by where the tile is (the flagstones are laid on the world, not on the tiles). */
  floor(tx: number, ty: number): Sprite;
  /** Whole walls, and walls cut down low so that they never hide the floor behind them. */
  wallsTall: Sprite[];
  wallsLow: Sprite[];
  /**
   * Laid over a floor tile that has a wall next to it: up and to the left of it on the screen
   * (the tile at x - 1), up and to the right (at y - 1), or only straight above (at x - 1, y - 1).
   */
  shadeLeft: Sprite;
  shadeRight: Sprite;
  shadeCorner: Sprite;
  /** The town's gate, built into a run of wall: for each frame of its light, its GATE_TILES parts from screen-left to screen-right. */
  gate: Sprite[][];
  /**
   * HEIGHT. The face of a ledge under a raised tile's lower-left edge and under its lower-right
   * one (each LEDGE_H high, drawn from the top corner of the tile's own diamond, wherever that
   * is lifted to), and the lip of light on the floor's edge above each.
   */
  ledgeLeft: Sprite[];
  ledgeRight: Sprite[];
  lipLeft: Sprite;
  lipRight: Sprite;
  /** The floor's edge against a pit behind it: along a tile's upper-left edge, and its upper-right one. */
  rimLeft: Sprite;
  rimRight: Sprite;
  /** Stairs up to the upper right of the screen (toward -y) and to the upper left (toward -x): closed at the side, and with the open side seen. */
  stairsN: Sprite;
  stairsNSide: Sprite;
  stairsW: Sprite;
  stairsWSide: Sprite;
  /** A pit: the dark of it, and its two far sides going down (under a pit tile's upper-left edge, and under its upper-right one). */
  pit: Sprite;
  pitLeft: Sprite[];
  pitRight: Sprite[];
  /** TRIANGLES: a wall over half a tile, whole and cut down low; and the shadow of a wall that runs across the screen on the half tile of floor at its foot. */
  part: Record<WallPart, { tall: Sprite; low: Sprite; mid: Sprite }>;
  shadeAcross: Sprite;
  /** (THE WALLS' LOOK) The floor's edge where no wall is drawn toward the eye: along a tile's lower-left edge, and its lower-right one. */
  edgeLeft: Sprite;
  edgeRight: Sprite;
  /** (and along the line across a tile cut corner to corner, on its far half) */
  edgeAcross: Sprite;
  /** (THE WALLS' LOOK, `faces`) One face of a whole wall alone, with no top: the one turned to screen-left, and the one turned to screen-right. */
  faceLeft: Sprite[];
  faceRight: Sprite[];
  /** (and the floor's edge along a cut that runs up and down the screen: on the half tile to the left of the cut, and on the one to its right) */
  edgeUpLeft: Sprite;
  edgeUpRight: Sprite;
}

export function makeGroundArt(theme: Theme = VAULT): GroundArt {
  TALL = WALL_LOOK.tall * GRAIN;
  const LOW = lowHeight();
  // (the top of a whole wall, as much of it as stands over floor raised one level)
  const MID = TALL - LEDGE_H * GRAIN;
  const parts = (part: WallPart): { tall: Sprite; low: Sprite; mid: Sprite } => ({
    tall: makeWallPart(theme, WALLS[0], TALL, part),
    low: makeWallPart(theme, WALLS[0], LOW, part),
    mid: makeWallPart(theme, WALLS[0], MID, part, true),
  });
  const floors: Sprite[] = [];
  for (let ty = 0; ty < PERIOD; ty++) for (let tx = 0; tx < PERIOD; tx++) floors.push(makeFloor(theme, tx, ty));
  return {
    floor: (tx, ty) => floors[(((ty % PERIOD) + PERIOD) % PERIOD) * PERIOD + (((tx % PERIOD) + PERIOD) % PERIOD)],
    wallsTall: WALLS.map((w) => makeWall(theme, w, TALL)),
    wallsLow: LOW_WALLS.map((w) => makeWall(theme, w, LOW)),
    shadeLeft: makeShade((u) => (u < 0.16 ? 0.5 : u < 0.36 ? 0.26 : 0)),
    shadeRight: makeShade((_u, v) => (v < 0.09 ? 0.4 : v < 0.2 ? 0.18 : 0)),
    shadeCorner: makeShade((u, v) => (u < 0.2 && v < 0.2 ? 0.26 : 0)),
    gate: makeGateWalls(theme),
    ledgeLeft: [0, 1, 2].map((k) => makeLedge(theme, k, true)),
    ledgeRight: [0, 1, 2].map((k) => makeLedge(theme, k, false)),
    lipLeft: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.22), (_u, v) => v > 0.935),
    lipRight: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.12), (u) => u > 0.935),
    rimLeft: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.1), (u) => u < 0.06),
    rimRight: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.1), (_u, v) => v < 0.06),
    stairsN: makeStairs(theme, true, false),
    stairsNSide: makeStairs(theme, true, true),
    stairsW: makeStairs(theme, false, false),
    stairsWSide: makeStairs(theme, false, true),
    pit: makeEdge(PIT_DARK, () => true),
    pitLeft: [WALLS[0], WALLS[1], WALLS[2]].map((w) => makePitWall(theme, w, true)),
    pitRight: [WALLS[0], WALLS[1], WALLS[2]].map((w) => makePitWall(theme, w, false)),
    part: { far: parts('far'), near: parts('near'), left: parts('left'), right: parts('right') },
    shadeAcross: makeShade((u, v) => (u + v < 1 ? 0 : u + v < 1.22 ? 0.42 : u + v < 1.42 ? 0.2 : 0)),
    edgeLeft: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.16), (_u, v) => v > 0.935),
    edgeRight: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.08), (u) => u > 0.935),
    edgeAcross: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.12), (u, v) => u + v < 1 && u + v > 0.9),
    faceLeft: WALLS.map((w) => makeWall(theme, w, TALL, 'left')),
    faceRight: WALLS.map((w) => makeWall(theme, w, TALL, 'right')),
    edgeUpLeft: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.12), (u, v) => u - v <= 0 && u - v > -0.07),
    edgeUpRight: makeEdge(mixHex(theme.slab[3], '#ffffff', 0.12), (u, v) => u - v >= 0 && u - v < 0.07),
  };
}
