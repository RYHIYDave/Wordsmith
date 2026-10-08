// Floor and wall tiles, and the dungeon / town props. Everything here is painted in code at
// start-up with the Px painter, using only palette colours.
//
// - Tiles go through the shared iso raster (isoDiamond / isoBlock) so they tile seamlessly.
//   They are backdrop: low contrast, no outline.
// - Props are small front-facing pictures with a 1-pixel ink outline. Their anchor is the centre
//   of the base, where the prop touches the floor.
// - Bones and rubble are flat floor decals: no outline, anchor at their centre.

import { Px, isoBlock, isoDiamond } from '../engine/px';
import type { FaceShader, Sprite, TopShader } from '../engine/px';
import { LOW_WALL_H, WALL_H } from '../engine/iso';
import { hash2 } from '../engine/rng';
import { P } from './palette';

export interface TileArt {
  floors: Sprite[]; // 8 variants, ordered plainest first
  wallsTall: Sprite[]; // 4 variants
  wallsLow: Sprite[]; // 3 variants
}

export interface PropArt {
  brazier: Sprite[]; // 4 looping flame frames
  chest: Sprite;
  chestOpen: Sprite;
  barrel: Sprite;
  urn: Sprite;
  pillar: Sprite;
  bones: Sprite[]; // 3 variants, flat decal
  rubble: Sprite[]; // 3 variants, flat decal
  portal: Sprite[]; // 4 looping frames: active gate
  portalOff: Sprite; // the same arch, dark and inert
  anvil: Sprite; // the wordsmith's anvil with a small forge (town)
  stall: Sprite; // the merchant's stall (town)
  lexicon: Sprite[]; // 4 looping frames: the great book of power words on its lectern (town)
  stash: Sprite; // the iron-bound trunk that keeps gear between characters (town)
}

// ---------------------------------------------------------------------------------------------
// Small helpers

/** One step down the stone ramp: used for grime, damp patches and shaded edges. */
const STONE_DARKER: Readonly<Record<string, string>> = {
  [P.st7]: P.st6,
  [P.st6]: P.st5,
  [P.st5]: P.st4,
  [P.st4]: P.st3,
  [P.st3]: P.st2,
  [P.st2]: P.st1,
};

function darker(c: string): string {
  return STONE_DARKER[c] ?? c;
}

type Key = Readonly<Record<string, string>>;

/**
 * Paint a small picture from rows of text. Each character is looked up in `key`; characters that
 * are not in the key (use '.') stay transparent. Row 0 lands on canvas row `oy`.
 */
function stamp(p: Px, ox: number, oy: number, rows: readonly string[], key: Key): void {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = key[row.charAt(i)];
      if (c !== undefined) p.set(ox + i, oy + j, c);
    }
  });
}

/**
 * Rows of a round object (bowl, column), shaded like a cylinder lit from the upper left.
 * spans = [first x, last x] for each row, starting at row `top`.
 * ramp = [highlight, mid, shade, deep shade].
 */
function turned(
  p: Px,
  top: number,
  spans: ReadonlyArray<readonly [number, number]>,
  ramp: readonly [string, string, string, string],
): void {
  spans.forEach(([x0, x1], i) => {
    const w = x1 - x0 + 1;
    for (let x = x0; x <= x1; x++) {
      const f = (x - x0 + 0.5) / w;
      p.set(x, top + i, f <= 0.12 ? ramp[1] : f <= 0.42 ? ramp[0] : f <= 0.7 ? ramp[1] : f <= 0.88 ? ramp[2] : ramp[3]);
    }
  });
}

/** One tongue of fire: where it stands, how wide and tall it is, and how far its tip leans. */
interface Tongue {
  dx: number;
  w: number;
  h: number;
  lean: number;
}

const FLAME_COLS = [P.fr3, P.fr4, P.fr5, P.fr6] as const;
const FLAME_SCALE = [1, 0.72, 0.48, 0.26] as const;

/**
 * Paint a fire as nested layers (orange outside, pale yellow core). (cx, baseY) is the middle of
 * the bottom row; cx is in pixel-edge coordinates. Each layer is the same tongues, scaled down.
 */
function flame(p: Px, cx: number, baseY: number, tongues: readonly Tongue[]): void {
  FLAME_COLS.forEach((col, layer) => {
    const s = FLAME_SCALE[layer];
    for (const t of tongues) {
      const h = t.h * s;
      const w = t.w * s;
      for (let k = 0; k < h; k++) {
        const f = (k + 0.5) / h; // 0 at the base, 1 at the tip of this layer
        if (f >= 1) break;
        const pinch = f < 0.2 ? 0.75 + f * 1.25 : 1; // slightly narrower where it leaves the coals
        const hw = w * Math.pow(1 - f, 0.8) * pinch;
        const mid = cx + t.dx + t.lean * Math.pow(k / t.h, 1.5); // inner layers follow the outer centre line
        let x0 = Math.round(mid - hw);
        let x1 = Math.round(mid + hw);
        if (x1 <= x0) {
          if (layer > 0 || hw < 0.25) continue;
          x0 = Math.floor(mid);
          x1 = x0 + 1; // keep the outer tip at least one pixel wide
        }
        p.rect(x0, baseY - k, x1 - x0, 1, col);
      }
    }
  });
}

// ---------------------------------------------------------------------------------------------
// Floor tiles (32x16, anchor = top vertex of the diamond)

/**
 * True on the thin iso line that starts at world coordinate `at` and runs across the tile
 * (two pixels per screen row). at = 0 is the tile's own top edge: the same test as "c < 0.07".
 */
function onLine(c: number, at: number): boolean {
  const d = (c - at) * 32;
  return d >= 0 && d < 2.24;
}

type Pt = readonly [number, number];
type Blob = readonly [number, number, number, number]; // ellipse: cx, cy, rx, ry in diamond pixels

/** What makes one floor variant different from the others. */
interface FloorSpec {
  seed: number;
  /** Extra mortar through the middle of the slab: along u, along v, or both (2x2 small stones). */
  splitU?: boolean;
  splitV?: boolean;
  /** Crack strokes, as polylines in diamond pixel coordinates. */
  cracks?: ReadonlyArray<ReadonlyArray<Pt>>;
  /** Warm, dirty patches. */
  dirt?: ReadonlyArray<Blob>;
  /** A dark stain: one or more overlapping blobs, and a darker core inside them. */
  stain?: ReadonlyArray<Blob>;
  stainCore?: Blob;
}

const FLOORS: readonly FloorSpec[] = [
  // 0-3: nearly plain; they differ in speckle and in how the slab is cut
  { seed: 11 },
  { seed: 23 },
  { seed: 37, splitV: true },
  { seed: 41, splitU: true, splitV: true },
  // 4-5: cracked
  {
    seed: 53,
    cracks: [
      [[8, 7], [12, 8], [15, 7], [19, 9], [22, 9]],
      [[15, 7], [16, 4]],
    ],
  },
  { seed: 67, splitU: true, cracks: [[[21, 4], [23, 6], [22, 8], [25, 9]]] },
  // 6: warm and dirty
  { seed: 71, dirt: [[11, 8, 3.5, 1.8], [21, 6, 2.5, 1.3], [18, 11.5, 2.5, 1.3]] },
  // 7: a small dark stain
  { seed: 83, stain: [[14.5, 8, 4.5, 2], [19, 9.5, 3, 1.5]], stainCore: [14.5, 8, 2.2, 1] },
];

function makeFloor(spec: FloorSpec): Sprite {
  const p = new Px(32, 16);
  // Scratch masks: draw the shapes with the painter, then ask "is this pixel inside?" per pixel.
  const crack = new Px(32, 16);
  for (const stroke of spec.cracks ?? []) {
    for (let i = 0; i + 1 < stroke.length; i++) {
      crack.line(stroke[i][0], stroke[i][1], stroke[i + 1][0], stroke[i + 1][1], P.white);
    }
  }
  const dirt = new Px(32, 16);
  for (const b of spec.dirt ?? []) dirt.ellipse(b[0], b[1], b[2], b[3], P.white);
  const stain = new Px(32, 16);
  const core = new Px(32, 16);
  for (const b of spec.stain ?? []) stain.ellipse(b[0], b[1], b[2], b[3], P.white);
  if (spec.stainCore) {
    const b = spec.stainCore;
    core.ellipse(b[0], b[1], b[2], b[3], P.white);
  }

  isoDiamond(p, 0, 0, (u, v, x, y) => {
    const n = hash2(x, y, spec.seed);
    // Mortar along the two TOP edges only; the neighbouring tiles supply the other two.
    const edge = onLine(u, 0) || onLine(v, 0);
    const cut = (spec.splitU === true && onLine(u, 0.5)) || (spec.splitV === true && onLine(v, 0.5));
    if (edge || cut) return n < 0.25 ? P.st3 : P.st2; // worn in places so the grid stays faint
    if (crack.has(x, y)) return n < 0.3 ? P.st3 : P.st2; // a hairline that fades in places
    if (core.has(x, y)) return n < 0.25 ? P.st3 : P.st2;
    if (stain.has(x, y)) return n < 0.12 ? P.st4 : P.st3;
    if (dirt.has(x, y)) {
      // mostly er3 (same brightness as the stone, only warmer) with a rare lighter crumb
      const m = hash2(x, y, spec.seed + 7);
      if (m < 0.72) return P.er3;
      if (m < 0.8) return P.er4;
    }
    // the stone itself: flat, with sparse speckle
    return n < 0.045 ? P.st3 : n > 0.97 ? P.st5 : P.st4;
  });
  return p.sprite(16, 0);
}

// ---------------------------------------------------------------------------------------------
// Wall blocks (32 x (16 + height), anchor = top vertex of the ground diamond)
//
// Brickwork notes, for whoever edits this next:
//  * Courses are counted from the top of the TALL wall. A low wall shows the bottom rows of the
//    same pattern, so course lines meet where low and tall walls stand side by side.
//  * In a straight run of walls the renderer only ever shows 16 columns per tile: one whole face
//    plus the first column of the other face (the block's front corner is two columns wide).
//    Those two corner columns therefore always use P.st4, the one tone both faces share, and any
//    brick that runs on into the next tile uses it too. Only bricks that begin and end inside
//    the face get the per-brick tone variation.
//  * Even courses end with a joint at the corner, odd courses run through it: that staggers the
//    vertical joints across tile boundaries as well as inside a tile.

const COURSE = 6; // rows per brick course, including its mortar row

interface WallSpec {
  seed: number;
  /** A jagged crack down each face: [first column, first row, length]. */
  crackL?: readonly [number, number, number];
  crackR?: readonly [number, number, number];
  /** Damp streaks and a little moss. */
  mossy?: boolean;
}

const WALLS: readonly WallSpec[] = [
  { seed: 1 }, // plain
  { seed: 6 }, // plain, joints in other places
  { seed: 3, crackL: [9, 2, 15], crackR: [5, 7, 11] },
  { seed: 8, mossy: true },
];

/** Low walls reuse the tall patterns (the cracked one mostly cracks above the cut, so skip it). */
const LOW_WALLS: readonly WallSpec[] = [WALLS[0], WALLS[1], WALLS[3]];

/** A crack that wanders down a face. Returns the set of face pixels, keyed row * 16 + column. */
function crackPath(start: readonly [number, number, number] | undefined, seed: number): Set<number> {
  const out = new Set<number>();
  if (!start) return out;
  let u = start[0];
  for (let i = 0; i < start[2]; i++) {
    out.add((start[1] + i) * 16 + u);
    const n = hash2(i, start[0], seed);
    u += n < 0.3 ? -1 : n > 0.7 ? 1 : 0;
    u = Math.max(2, Math.min(12, u)); // never touch the corner columns
  }
  return out;
}

function wallFace(spec: WallSpec, side: 'left' | 'right', height: number): FaceShader {
  const isLeft = side === 'left';
  const mortar = isLeft ? P.st2 : P.st1;
  const usual = isLeft ? P.st5 : P.st4; // most bricks
  const odd = isLeft ? P.st4 : P.st3; // the occasional different brick
  const oddChance = isLeft ? 0.3 : 0.5;
  const shared = P.st4; // bricks that continue in the neighbouring tile, and the corner columns
  const seed = spec.seed * 16 + (isLeft ? 0 : 5);
  const skip = WALL_H - height; // rows of the tall pattern hidden above a low wall
  const crack = crackPath(isLeft ? spec.crackL : spec.crackR, seed);
  const shift = (course: number, k: number): number => Math.floor(hash2(course, k, seed) * 3) - 1;

  return (u, v) => {
    const row = v + skip;
    const course = Math.floor(row / COURSE);
    const r = row % COURSE;
    const corner = isLeft ? u === 14 : u === 0; // the column beside the block's front corner
    const n = hash2(u, row, seed + 9);
    let c: string;
    let isBrick = false;

    if (r === 0) {
      c = mortar; // the line between two courses
    } else {
      const ends = course % 2 === 0; // this course has a joint at the tile boundary
      // vertical joints inside the face (-1 = none)
      const jA = (ends ? (isLeft ? 7 : 8) : isLeft ? 3 : 4) + shift(course, 0);
      const jB = ends ? -1 : (isLeft ? 11 : 12) + shift(course, 1);
      if (u === jA || u === jB) {
        c = mortar;
      } else if (corner) {
        // right face, column 0 is the boundary joint itself; everywhere else the shared tone
        c = ends && !isLeft ? P.st2 : shared;
        isBrick = c === shared;
      } else {
        isBrick = true;
        const idx = u < jA ? 0 : jB < 0 || u < jB ? 1 : 2;
        // A brick may vary only if both its ends are inside this face.
        const free = ends ? isLeft || idx === 0 : idx === 1;
        if (!free) {
          c = shared;
        } else {
          c = hash2(course, idx, seed + 1) < oddChance ? odd : usual;
          const first = ends ? (idx === 0 ? (isLeft ? 0 : 1) : jA + 1) : jA + 1;
          // (on the left face the second brick of an "ends" course finishes in the corner column)
          const last = ends ? (idx === 0 ? jA - 1 : 14) : jB - 1;
          // lit bricks get a shaded right end; a few bricks have a chipped corner
          if (isLeft && c === P.st5 && u === last) c = P.st4;
          if (u === first && r === 1 && hash2(course, idx, seed + 2) < 0.3) c = mortar;
          if (u === last && r === COURSE - 1 && hash2(course, idx, seed + 3) < 0.25) c = mortar;
          isBrick = c !== mortar;
        }
      }
    }

    if (crack.has(row * 16 + u)) {
      c = mortar;
      isBrick = false;
    }
    if (spec.mossy === true && !corner) {
      // a damp streak running down from the top of the wall...
      const streak = isLeft ? u >= 4 && u <= 7 && row < 16 : u >= 8 && u <= 10 && row < 11;
      if (streak && isBrick && n < 0.85) c = darker(c);
      // ...and moss in the lower course lines and at the foot
      if (r === 0 && row >= 12 && n < 0.45) c = P.gn1;
      else if (r === COURSE - 1 && row >= 11 && row < WALL_H - 1 && n < 0.2) c = P.gn2;
      else if (row >= WALL_H - 3 && n < 0.3) c = n < 0.12 ? P.gn2 : P.gn1;
    }
    // grime: the two rows nearest the floor are a step darker
    if (isBrick && row >= WALL_H - 2 && c !== P.gn1 && c !== P.gn2) c = darker(c);
    return c;
  };
}

/** Top face: dark, with a lighter 1-pixel rim along its two lower (near) edges. */
function wallTop(base: string, rim: string, speck: string, seed: number): TopShader {
  return (u, v, x, y) => {
    if (u > 0.93 || v > 0.93) return rim;
    return hash2(x, y, seed) < 0.04 ? speck : base;
  };
}

function makeWall(spec: WallSpec, height: number): Sprite {
  const p = new Px(32, 16 + height);
  const top =
    height === WALL_H
      ? wallTop(P.st2, P.st4, P.st3, spec.seed + 40)
      : wallTop(P.st1, P.st3, P.st2, spec.seed + 40); // darker: the wall reads as sliced off
  isoBlock(p, 0, 0, height, top, wallFace(spec, 'left', height), wallFace(spec, 'right', height));
  return p.sprite(16, height);
}

export function makeTileArt(): TileArt {
  return {
    floors: FLOORS.map(makeFloor),
    wallsTall: WALLS.map((w) => makeWall(w, WALL_H)),
    wallsLow: LOW_WALLS.map((w) => makeWall(w, LOW_WALL_H)),
  };
}

// ---------------------------------------------------------------------------------------------
// Props. Letters used in the text pictures:

const WOOD: Key = { W: P.wd5, w: P.wd4, m: P.wd3, d: P.wd2, k: P.wd1 };
const GOLD: Key = { Y: P.gd5, G: P.gd4, g: P.gd3, o: P.gd2, O: P.gd1 };
const STEEL: Key = { S: P.sl5, a: P.sl4, s: P.sl3, t: P.sl2, T: P.sl1 };

// --- brazier: 16x26, anchor (8, 23) -----------------------------------------------------------

const BRAZIER_FLAMES: ReadonlyArray<ReadonlyArray<Tongue>> = [
  [
    { dx: 0, w: 4.6, h: 10, lean: 1.2 },
    { dx: -2.6, w: 2.2, h: 5.5, lean: -0.8 },
  ],
  [
    { dx: 0.3, w: 4.4, h: 8.5, lean: -0.6 },
    { dx: 2.6, w: 2.3, h: 6.5, lean: 1 },
  ],
  [
    { dx: 0, w: 4.6, h: 10, lean: -1.4 },
    { dx: 2.8, w: 2, h: 4.5, lean: 0.6 },
  ],
  [
    { dx: -0.3, w: 4.4, h: 8, lean: 0.8 },
    { dx: -2.8, w: 2.3, h: 7, lean: -1.2 },
  ],
];

/** One loose spark per frame, drawn after the outline so it stays a single pixel. */
const BRAZIER_SPARKS: ReadonlyArray<Pt> = [[4, 3], [11, 2], [3, 5], [12, 4]];

function makeBrazier(frame: number): Sprite {
  const p = new Px(16, 26);
  // tripod stand
  p.line(6, 20, 3, 24, P.sl3); // left leg, lit
  p.line(9, 20, 12, 24, P.sl2); // right leg
  p.rect(7, 19, 2, 6, P.sl2); // middle leg
  p.rect(6, 19, 4, 1, P.sl3); // collar
  p.rect(7, 17, 2, 2, P.sl2); // stem
  // iron bowl: a bright rim, then the darker belly
  turned(p, 12, [[1, 14]], [P.sl4, P.sl3, P.sl2, P.sl1]);
  turned(p, 13, [[1, 14], [2, 13], [3, 12], [5, 10]], [P.sl3, P.sl2, P.sl2, P.sl1]);
  // coals, then the fire standing on them
  for (let x = 2; x <= 13; x++) {
    const n = hash2(x, frame, 5);
    p.set(x, 11, n < 0.35 ? P.fr2 : n < 0.8 ? P.fr3 : P.fr4);
  }
  flame(p, 8, 11, BRAZIER_FLAMES[frame]);
  p.outline(P.ink);
  const sp = BRAZIER_SPARKS[frame];
  p.set(sp[0], sp[1], P.fr5);
  return p.sprite(8, 23);
}

// --- chest: 20x20, anchor (10, 16); the open one shares canvas and anchor ---------------------

const CHEST_KEY: Key = { ...WOOD, ...GOLD, K: P.ink };

/** The body of the chest: canvas rows 11..18, the same for open and closed. */
const CHEST_BODY: readonly string[] = [
  '.mmgommmgKKommmgomd.',
  '.mmgommmoooommmgomd.',
  '.mmgommmmmmmmmmgomd.',
  '.ddgoddddddddddgodd.',
  '.mmgommmmmmmmmmgomd.',
  '.mmgommmmmmmmmmgomd.',
  '.ddgoddddddddddgodk.',
  '.kkoOkkkkkkkkkkoOkk.',
];

/** Closed lid: canvas rows 5..10 (rounded top, gold band, lock plate over the seam). */
const CHEST_LID: readonly string[] = [
  '..WGgWWWWWWWWWWGgw..',
  '.WwGgwwwwwwwwwwGgwm.',
  '.wwgowwwwwwwwwwgomm.',
  '.mmgommmmmmmmmmgomd.',
  '.gggggggGGGGgggggoo.',
  '.kkkkkkkGggokkkkkkk.',
];

/** Open: the lid stands up behind (rows 1..6), gold shows inside (7..9), rim of the body (10). */
const CHEST_OPEN_TOP: readonly string[] = [
  '...oggggggggggggo...',
  '..gddddddddddddddo..',
  '..gdkkkkkkkkkkkkdo..',
  '..gdkkkkkkkkkkkkdo..',
  '..gdkkkkkkkkkkkkdo..',
  '..gddddddddddddddo..',
  '.mkkkkkkkgGkkkkkkkd.',
  '.mkkkgGgGYGggGgkkkd.',
  '.mkgGYGgGGgGYGgGgkd.',
  '.gggggggGGGGgggggoo.',
];

function makeChest(open: boolean): Sprite {
  const p = new Px(20, 20);
  stamp(p, 0, 11, CHEST_BODY, CHEST_KEY);
  if (open) stamp(p, 0, 1, CHEST_OPEN_TOP, CHEST_KEY);
  else stamp(p, 0, 5, CHEST_LID, CHEST_KEY);
  p.outline(P.ink);
  if (open) p.set(9, 8, P.white); // one glint on the gold
  return p.sprite(10, 16);
}

// --- barrel: 14x18, anchor (7, 14) ------------------------------------------------------------

const BARREL: readonly string[] = [
  '..............',
  '....wWWWWw....',
  '..WwwwmwwwwW..',
  '..mWWWWWWWWm..',
  '..mwmwmmdmdk..',
  '.tsSsstttTTTT.',
  '.mwwmwmmdmddk.',
  '.mwwmwmmdmddk.',
  '.mwwmwmmdmddk.',
  '.mwwmwmmdmddk.',
  '.mwwmwmmdmddk.',
  '.mwwmwmmdmddk.',
  '.tsSsstttTTTT.',
  '..mwmwmmdmdk..',
  '..dmdmddkdkk..',
  '...dmddkdkk...',
  '.....dkkk.....',
  '..............',
];

function makeBarrel(): Sprite {
  const p = new Px(14, 18);
  stamp(p, 0, 0, BARREL, { ...WOOD, ...STEEL });
  p.outline(P.ink);
  return p.sprite(7, 14);
}

// --- urn: 12x16, anchor (6, 13) ---------------------------------------------------------------

const URN_KEY: Key = { L: P.er5, c: P.er4, e: P.er3, r: P.er2, x: P.er1, R: P.bl4, B: P.bl3, b: P.bl2, y: P.bn3 };

const URN: readonly string[] = [
  '............',
  '....cccc....',
  '...Lxxxxc...',
  '...LLLLce...',
  '....Lcee....',
  '..LLLLccee..',
  '.LLLLLcccee.',
  '.BRyBByBbyb.',
  '.BRBBBBBbbb.',
  '.LLLLccceer.',
  '..LLLcceer..',
  '..cLLcceer..',
  '...ccceer...',
  '....ceer....',
  '...cceerr...',
  '............',
];

function makeUrn(): Sprite {
  const p = new Px(12, 16);
  stamp(p, 0, 0, URN, URN_KEY);
  p.outline(P.ink);
  return p.sprite(6, 13);
}

// --- pillar: 16x38, anchor (8, 34) ------------------------------------------------------------

function makePillar(): Sprite {
  const p = new Px(16, 38);
  const lit = [P.st7, P.st6, P.st5, P.st4] as const;
  const mid = [P.st6, P.st5, P.st4, P.st3] as const;
  const dim = [P.st5, P.st4, P.st3, P.st2] as const;
  // capital: a lit top edge, a slab, then a collar stepping in to the shaft
  p.rect(2, 1, 12, 1, P.st7);
  turned(p, 2, [[1, 14]], lit);
  turned(p, 3, [[1, 14]], mid);
  turned(p, 4, [[2, 13]], dim);
  turned(p, 5, [[3, 12]], mid);
  turned(p, 6, [[4, 11]], dim);
  // shaft, built from drums with a darker joint between them
  for (let y = 7; y <= 29; y++) turned(p, y, [[4, 11]], y === 14 || y === 22 ? dim : mid);
  // base: a ring, then a round plinth
  turned(p, 30, [[3, 12]], lit);
  turned(p, 31, [[3, 12]], dim);
  turned(p, 32, [[1, 14]], lit);
  turned(p, 33, [[1, 14], [1, 14]], mid);
  turned(p, 35, [[2, 13], [4, 11]], dim);
  // a few chips so it does not look machined
  p.set(6, 10, P.st5).set(9, 18, P.st3).set(5, 25, P.st5).set(10, 27, P.st2);
  p.outline(P.ink);
  return p.sprite(8, 34);
}

// --- bones and rubble: flat decals, no outline, anchor at the centre --------------------------

const BONE_KEY: Key = { h: P.bn3, b: P.bn2, s: P.bn1, k: P.st1 };

const BONES: ReadonlyArray<readonly string[]> = [
  // a skull and a thigh bone
  [
    '...hhhhb............',
    '..hhbbbbb.......hb..',
    '..hkkbkkb.....bbbb..',
    '..bbbkbbs...bb......',
    '...bsbsb.hbb........',
    '.........bs....b....',
    '....b.........bb....',
  ],
  // a rib cage (three pairs of ribs on a spine) and a loose bone
  [
    '..................',
    '..hbb.bbb.........',
    '.b...b...b.....hb.',
    '..hbb.bbb....bbb..',
    '.b...b...b.bbb....',
    '..hb..bb...bs.....',
    '.....b............',
  ],
  // two bones fallen across each other
  [
    '................',
    '...........hb...',
    '.hb......bbbb...',
    '.bbbb..bb.......',
    '.....bbbb...b...',
    '.......bs..bb...',
    '...b............',
  ],
];

const RUBBLE_KEY: Key = { l: P.st6, m: P.st5, s: P.st3 };

const RUBBLE: ReadonlyArray<readonly string[]> = [
  [
    '................',
    '....lm..........',
    '...lmmm....l....',
    '...mmmss..lmm...',
    '....sss..lmmms..',
    '.lm......mmmss..',
    '.mss..lm..sss...',
    '..s...ss........',
  ],
  [
    '..............',
    '.....llm......',
    '....lmmmm.lm..',
    '..l.mmmss.ms..',
    '.lms.sss......',
    '.mss....lm....',
    '........ss....',
  ],
  [
    '..................',
    '.......lm.........',
    '..lm...ms...llm...',
    '..ms.......lmmms..',
    '......lm....mss...',
    '.....lmms.........',
    '.lm...sss....lm...',
    '.ss..........ss...',
  ],
];

function makeDecal(rows: readonly string[], key: Key): Sprite {
  const w = rows[0].length;
  const p = new Px(w, rows.length);
  stamp(p, 0, 0, rows, key);
  return p.sprite(Math.floor(w / 2), Math.floor(rows.length / 2));
}

// --- portal: 30x40, anchor (15, 37). frame -1 = the inert arch --------------------------------

const PORTAL_CX = 15; // centre line of the arch (pixel-edge coordinates)
const PORTAL_CY = 15; // height at which the round top meets the straight jambs
const PORTAL_R_OUT = 14;
const PORTAL_R_IN = 9;
const PORTAL_SILL = 37; // first row of the stone threshold

/** True for pixels of the gateway's opening. */
function portalOpening(x: number, y: number): boolean {
  if (y < 1 || y >= PORTAL_SILL) return false;
  const dx = x + 0.5 - PORTAL_CX;
  const dy = y + 0.5 - PORTAL_CY;
  if (y < PORTAL_CY) return dx * dx + dy * dy <= PORTAL_R_IN * PORTAL_R_IN;
  return Math.abs(dx) < PORTAL_R_IN;
}

/** True for pixels of the stone arch, jambs and threshold. */
function portalStone(x: number, y: number): boolean {
  if (x < 1 || x > 28 || y < 1 || y > 38 || portalOpening(x, y)) return false;
  const dx = x + 0.5 - PORTAL_CX;
  const dy = y + 0.5 - PORTAL_CY;
  return y >= PORTAL_CY || dx * dx + dy * dy <= PORTAL_R_OUT * PORTAL_R_OUT;
}

function portalStoneColor(x: number, y: number): string {
  const dx = x + 0.5 - PORTAL_CX;
  const dy = y + 0.5 - PORTAL_CY;
  if (y >= PORTAL_SILL) return y === PORTAL_SILL ? P.st5 : P.st4; // threshold
  if (y >= PORTAL_CY) {
    // straight jambs: lit outer-left edge, shaded outer-right edge, a joint every 6 rows
    const left = dx < 0;
    let c: string = left ? P.st6 : P.st5;
    if (x === 1) c = P.st7;
    if (x === 5) c = P.st5;
    if (x === 28) c = P.st4;
    if ((y - PORTAL_CY) % 6 === 0) c = darker(darker(c));
    return c;
  }
  // round top: wedge-shaped stones with radial joints
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(-dy, dx); // 0 = right ... PI = left
  const step = Math.PI / 7;
  const k = Math.round(a / step);
  const lightSide = Math.cos(a - Math.PI * 0.75) > 0.2; // light comes from the upper left
  let c: string = lightSide ? P.st6 : P.st5;
  if (r > PORTAL_R_OUT - 1.3 && lightSide) c = P.st7; // lit outer edge
  if (r < PORTAL_R_IN + 1.2) c = darker(c); // inner edge turns away from the light
  if (k >= 1 && k <= 6 && Math.abs(a - k * step) * r < 0.55) c = darker(darker(c));
  return c;
}

function makePortal(frame: number): Sprite {
  const active = frame >= 0;
  const p = new Px(30, 40);
  for (let y = 1; y <= 38; y++) {
    for (let x = 1; x <= 28; x++) {
      if (portalStone(x, y)) {
        p.set(x, y, portalStoneColor(x, y));
        continue;
      }
      if (!portalOpening(x, y)) continue;
      // a dark lip where the opening meets the stone
      const lip = portalStone(x - 1, y) || portalStone(x + 1, y) || portalStone(x, y - 1) || portalStone(x, y + 1);
      if (!active) {
        p.set(x, y, lip ? P.ink : hash2(x, y, 3) < 0.04 ? P.st2 : P.st1);
        continue;
      }
      if (lip) {
        p.set(x, y, P.tl2);
        continue;
      }
      // the field: a two-armed spiral of bands that turns a quarter step each frame
      const dx = x + 0.5 - PORTAL_CX;
      const dy = (y + 0.5 - 21.5) * 0.62; // squashed so the spiral fills the tall opening
      const r = Math.hypot(dx, dy);
      const val = Math.sin(2 * Math.atan2(dy, dx) + r * 0.85 - frame * (Math.PI / 2));
      let c: string = val > 0.55 ? P.tl5 : val > -0.25 ? P.tl4 : P.tl3;
      if (r < 1.6) c = P.white;
      else if (r < 2.8) c = P.tl5;
      else if (r > 8.4) c = c === P.tl5 ? P.tl4 : c === P.tl4 ? P.tl3 : P.tl2; // dimmer toward the rim
      p.set(x, y, c);
    }
  }
  // keystone gem: lit while the gate is open
  if (active) p.set(14, 3, P.tl5).set(15, 3, P.tl4).set(14, 4, P.tl4).set(15, 4, P.tl3);
  else p.set(14, 3, P.st4).set(15, 3, P.st3).set(14, 4, P.st3).set(15, 4, P.st3);
  if (active) {
    // white sparks circling in the field
    for (let i = 0; i < 6; i++) {
      const ang = i * 2.4 + frame * 0.9;
      const rad = 2.5 + ((i * 1.7 + frame * 1.3) % 5.5);
      const x = Math.floor(PORTAL_CX + Math.cos(ang) * rad);
      const y = Math.floor(21.5 + (Math.sin(ang) * rad) / 0.62);
      if (portalOpening(x, y) && p.get(x, y) !== P.tl2) p.set(x, y, P.white);
    }
  }
  p.outline(P.ink);
  return p.sprite(15, 37);
}

// --- anvil with a small forge: 24x20, anchor (12, 17) -----------------------------------------

const ANVIL_KEY: Key = { ...WOOD, ...STEEL, '2': P.fr2, '3': P.fr3, '4': P.fr4, '5': P.fr5 };

/** Left: an anvil on a tree stump. Right: an iron fire bowl on a foot; its flame is added in code. */
const ANVIL: readonly string[] = [
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '..SSaaaaaaaas...........',
  '.asssssssssst...........',
  '...sttttttttT...........',
  '......ttttT....2343432..',
  '......stttT...asstttTTT.',
  '....asstttTTT.sttttTTTT.',
  '...wwwwwwwwmm..ttttTTT..',
  '...mwmmwmmdmd...ttTTT...',
  '...mwmmwmmdmd....tTT....',
  '...mwmmwmmdmd....tTT....',
  '...mwmmwmmdmd...sttTT...',
  '...dmddmddkdk..sttttTT..',
  '....ddddkkkk...TTTTTTT..',
  '........................',
];

function makeAnvil(): Sprite {
  const p = new Px(24, 20);
  stamp(p, 0, 0, ANVIL, ANVIL_KEY);
  flame(p, 18.5, 9, [
    { dx: 0, w: 3.2, h: 7, lean: 0.8 },
    { dx: -1.6, w: 1.5, h: 3.5, lean: -0.5 },
  ]);
  p.outline(P.ink);
  return p.sprite(12, 17);
}

// --- merchant's stall: 30x28, anchor (15, 24) -------------------------------------------------

/** Goods on the counter: two potions, a heap of coins, a sealed scroll. Canvas x 4..25, rows 11..15. */
const STALL_GOODS: readonly string[] = [
  '..c...c...............',
  '..R...B...............',
  '.hRr.iBb...YG.........',
  '.RRr.BBb..gGYg..ppppq.',
  '.rrr.bbb.gGgGgo.pxppq.',
];

const GOODS_KEY: Key = {
  ...GOLD,
  c: P.bn2,
  h: P.bl5,
  R: P.bl4,
  r: P.bl3,
  i: P.bu5,
  B: P.bu4,
  b: P.bu3,
  p: P.bn3,
  q: P.bn2,
  x: P.bl3,
};

/** One of the two crates the counter stands on (10 wide, 8 tall). */
const CRATE: readonly string[] = [
  'wwwwwwwwwd',
  'wmmdmmdmmd',
  'wmmdmmdmmd',
  'wmmdmmdmmd',
  'wmmdmmdmmd',
  'wmmdmmdmmd',
  'wmmdmmdmmd',
  'dddddddddk',
];

function makeStall(): Sprite {
  const p = new Px(30, 28);
  // the shadowed inside of the stall, behind the goods
  p.rect(4, 9, 22, 7, P.wd1);
  // two posts carry the awning
  for (const x of [2, 26]) {
    p.rect(x, 9, 1, 17, P.wd4);
    p.rect(x + 1, 9, 1, 17, P.wd2);
  }
  // striped cloth awning: lit along the top, darker on the hanging edge, scalloped at the bottom
  const spans: ReadonlyArray<Pt> = [[4, 25], [3, 26], [3, 26], [2, 27], [2, 27], [1, 28], [1, 28], [1, 28], [1, 28]];
  spans.forEach(([x0, x1], i) => {
    for (let x = x0; x <= x1; x++) {
      const red = Math.floor((x - 1) / 4) % 2 === 0;
      const inStripe = (x - 1) % 4;
      if (i === 8 && (inStripe === 0 || inStripe === 3)) continue; // gaps between the scallops
      const shade = i === 0 ? 0 : i < 6 ? 1 : 2;
      p.set(x, 1 + i, red ? [P.bl4, P.bl3, P.bl2][shade] : [P.bn4, P.bn3, P.bn2][shade]);
    }
  });
  // counter: a plank on two crates
  stamp(p, 4, 18, CRATE, WOOD);
  stamp(p, 16, 18, CRATE, WOOD);
  p.rect(14, 18, 2, 8, P.wd1);
  p.rect(4, 16, 22, 1, P.wd5);
  p.rect(4, 17, 22, 1, P.wd3);
  stamp(p, 4, 11, STALL_GOODS, GOODS_KEY);
  p.outline(P.ink);
  return p.sprite(15, 24);
}

// --- the Lexicon: 24x32, anchor (12, 26) ------------------------------------------------------
// A great open book on a stone lectern. Its script glows teal, the colour of everything that
// outlasts a character (the gate, the Lexicon, the lock on the stash).

function makeLexicon(frame: number): Sprite {
  const p = new Px(24, 32);
  // lectern: stepped base, column, desk slab
  p.rect(4, 27, 16, 2, P.st4);
  p.rect(4, 27, 13, 1, P.st5);
  p.rect(16, 27, 4, 2, P.st3);
  p.rect(6, 25, 12, 2, P.st5);
  p.rect(6, 25, 10, 1, P.st6);
  p.rect(15, 25, 3, 2, P.st4);
  const col: Array<readonly [number, number]> = [];
  for (let i = 0; i < 7; i++) col.push([8, 15]);
  turned(p, 18, col, [P.st6, P.st5, P.st4, P.st3]);
  p.rect(5, 16, 14, 2, P.st5);
  p.rect(5, 16, 11, 1, P.st6);
  p.rect(16, 16, 3, 2, P.st4);
  // the book: cover, two pages, gutter
  p.rect(2, 9, 20, 7, P.pu2);
  p.rect(2, 15, 20, 1, P.pu1);
  p.rect(3, 8, 8, 7, P.bn4);
  p.rect(13, 8, 8, 7, P.bn4);
  p.rect(3, 14, 8, 1, P.bn2);
  p.rect(13, 14, 8, 1, P.bn2);
  p.rect(11, 8, 2, 7, P.bn2);
  p.rect(10, 9, 1, 5, P.bn3);
  p.rect(13, 9, 1, 5, P.bn3);
  // lines of script: one of them is lit each frame, as if being read
  const script: ReadonlyArray<readonly [number, number, number]> = [
    [4, 10, 2], [7, 10, 3], [14, 10, 3], [18, 10, 2],
    [4, 12, 3], [8, 12, 2], [14, 12, 2], [17, 12, 3],
  ];
  script.forEach(([x, y, w], i) => p.rect(x, y, w, 1, i % 4 === frame ? P.tl5 : P.tl3));
  p.outline(P.ink);
  // light lifting off the pages (after the outline, so the motes stay single pixels)
  const motes: ReadonlyArray<readonly [number, number]> = [[6, 0], [12, 2], [17, 1], [9, 3]];
  motes.forEach(([x, phase]) => {
    const step = (frame + phase) % 4;
    p.set(x, 6 - step, step < 2 ? P.tl5 : P.tl4);
    if (step === 3) p.set(x, 6, P.tl3);
  });
  return p.sprite(12, 26);
}

// --- the stash: 26x20, anchor (13, 15) ---------------------------------------------------------

function makeStash(): Sprite {
  const p = new Px(26, 20);
  // body: three dark planks
  p.rect(1, 8, 24, 8, P.wd3);
  p.rect(1, 11, 24, 1, P.wd2);
  p.rect(1, 14, 24, 1, P.wd2);
  p.rect(21, 8, 4, 8, P.wd2);
  // lid: rounded, lighter wood, lit from above
  p.rect(4, 2, 18, 1, P.wd5);
  p.rect(2, 3, 22, 1, P.wd5);
  p.rect(1, 4, 24, 1, P.wd4);
  p.rect(1, 5, 24, 2, P.wd3);
  p.rect(21, 3, 3, 4, P.wd2);
  // iron: the rim under the lid, a band along the bottom, two straps, the end plates
  p.rect(1, 7, 24, 1, P.sl3);
  p.rect(1, 7, 9, 1, P.sl4);
  p.rect(1, 15, 24, 1, P.sl2);
  for (const x of [6, 19]) {
    p.rect(x, 2, 1, 14, P.sl3);
    p.set(x, 2, P.sl5);
    p.set(x, 3, P.sl4);
  }
  p.rect(1, 8, 1, 7, P.sl2);
  p.rect(24, 8, 1, 7, P.sl1);
  p.rect(2, 16, 3, 1, P.sl1);
  p.rect(21, 16, 3, 1, P.sl1);
  // lock plate with a teal stone
  p.rect(11, 6, 4, 5, P.sl4);
  p.rect(14, 6, 1, 5, P.sl2);
  p.rect(11, 10, 4, 1, P.sl2);
  p.rect(12, 7, 2, 2, P.tl4);
  p.set(12, 7, P.tl5);
  p.outline(P.ink);
  return p.sprite(13, 14);
}

export function makePropArt(): PropArt {
  return {
    brazier: [0, 1, 2, 3].map(makeBrazier),
    chest: makeChest(false),
    chestOpen: makeChest(true),
    barrel: makeBarrel(),
    urn: makeUrn(),
    pillar: makePillar(),
    bones: BONES.map((rows) => makeDecal(rows, BONE_KEY)),
    rubble: RUBBLE.map((rows) => makeDecal(rows, RUBBLE_KEY)),
    portal: [0, 1, 2, 3].map(makePortal),
    portalOff: makePortal(-1),
    anvil: makeAnvil(),
    stall: makeStall(),
    lexicon: [0, 1, 2, 3].map(makeLexicon),
    stash: makeStash(),
  };
}
