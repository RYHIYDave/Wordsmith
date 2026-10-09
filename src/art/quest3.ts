// THE MASTER RUNE-STONE (the art chat, 8 Oct 2026). A MOCK-UP BEHIND A SWITCH THAT IS OFF: QUEST3.
//
// The owner, to the main chat (as it posted his words on the board): 20:39, "I'd like the fallen
// wordsmith to drop a quest item that you give to the wordsmith in town to unlock the ability to
// wordsmith."; 20:41, "And I'd like the quest item to power up the runes around the wordsmith.
// Like a battery being put in.  These animations should go to the art team". In the art chat, at
// 22:41, the wordsmith and his ring were made new first (art/smith3.ts, art/ring3.ts: his yes by
// 23:09). Then, asked what the item should be, by 23:52: "A master rune-stone" (the pick put to him:
// "A carved tablet with one great rune, laid into the slab's top like a key"). To its pictures, by
// 23:52: "Yes, keep it (Recommended)"; to the ring powering up, "Looks great except for the hole in
// the table.  Just a big black hole?"; and at 00:01 on 9 Oct, to the hollow carved (paintHollow),
// "Yes, keep it (Recommended)".
//
// So THE MASTER RUNE-STONE: a tablet of dark slate, its edges worn, cut with ONE GREAT RUNE, the
// same rune the wordsmith writes on the air (art/smith3.ts, GREAT_RUNE), which holds the light:
//   - it lies beside the fallen wordsmith in the first dungeon, its rune faintly alight and
//     throbbing, motes rising off it;
//   - picked up, it rises, stands up and flares, and flies into the hero; while it is carried it
//     shows on the screen (its icon);
//   - in town the ring is dark (art/ring3.ts: the stones' runes cut and cold, the circle cold, no
//     letters, no column), the wordsmith's own runes are cold, and his slab has an empty hollow cut
//     in its top, the stone's shape, the great rune's print in its floor (paintHollow); when the
//     hero gives him the stone it rises out of the hero, floats over the slab,
//     lies down and is laid into the hollow like a key; its rune lights, the slab's runes light one
//     by one, the light runs out round the circle in the floor both ways, each standing stone
//     catches as it reaches it, and when it has gone all round every stone flares, the letters
//     burst out, the column rises and the wordsmith's runes catch fire: the ring as he said yes to.
// The rules (what drops it, carrying it, giving it, what it opens) are the main chat's: here are
// only the pictures, and a demo for the films (`QUEST3`, set by main.ts's __dbg.quest3).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CYAN, GRAIN, hash, lazyFrames } from './kit';
import type { Ramp } from './kit';
import { GRID } from './skeleton';
import { GREAT_RUNE } from './smith3';

/**
 * The switch, and what the pictures read: whether the ring is still dark; when (on the town's
 * clock) the stone was given (-1: not yet); where the stone is in the first dungeon (by the fallen
 * wordsmith, or gone), and the moment on the clock it was taken up; and whether the hero carries it.
 * THE GAME'S OWN SINCE VERSION 19.6 (his yes to the art chat at 00:01 on 9 Oct 2026, "Yes, keep it
 * (Recommended)", and to the main chat at 00:22, "K add the art"): the rules set the rest each
 * frame (main.ts, `questFromRules`, from the first levels: game/defs.ts, FIRST_LEVELS); the films
 * set it by hand (`__dbg.quest3`). Switched off, the ring is as it was.
 */
export const QUEST3 = { on: true, dark: false, givenAt: -1, stone: 'gone' as 'lying' | 'gone', takenAt: -1, carried: false };

/** The slate it is cut from: dark, a little teal, so that the cyan of its rune is the brightest thing on it. */
export const SLATE: Ramp = ['#141a2e', '#141a2e', '#24304a', '#36506a', '#4a6e86'];

// ---------------------------------------------------------------------------------------------
// The stone in the round: a tablet, its corners rounded off, painted in three dimensions and seen
// from the game's one camera (as skeleton.ts projects a figure: a length along the floor is GRID
// of a pixel across and half that down, a height one for one).

/** Its size, in picture pixels: across its face, up its face, and how thick it is. */
const ACROSS = 16;
const UP = 21;
export const STONE_THICK = 4;
const THICK = STONE_THICK;

type P3 = readonly [number, number, number];
const add3 = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul3 = (a: P3, k: number): P3 => [a[0] * k, a[1] * k, a[2] * k];
const dot3 = (a: P3, b: P3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** Where a point is seen: across and down the picture. (World x is down the screen to the right, world y down it to the left, z up.) */
const seen = (p: P3): [number, number] => [GRID * (p[0] - p[1]), GRID * 0.5 * (p[0] + p[1]) - p[2]];
/** The way to the eye. */
const EYE: P3 = [1 / Math.hypot(1, 1, GRID), 1 / Math.hypot(1, 1, GRID), GRID / Math.hypot(1, 1, GRID)];
/** The light: from above, a little from the left of the screen (world +y is down it to the left). */
const LIGHT: P3 = (() => {
  const v: P3 = [0.12, 0.5, 0.86];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

/** Its outline, across and up its face, each from -1 to 1: a tablet whose top corners are cut off. */
const OUTLINE: ReadonlyArray<readonly [number, number]> = [[-1, -1], [1, -1], [1, 0.5], [0.55, 1], [-0.55, 1], [-1, 0.5]];

/**
 * The stone turned `yaw` and laid back `lie` (degrees, as paintStone takes them): where a point of
 * it is (`at3`: across its face, up it and through it, each from -1 to 1; 0 its middle), the way
 * its face looks, and for each edge of its outline the way the side there faces, out from it.
 */
function placed(yaw: number, lie: number): { at3: (i: number, j: number, k: number) => P3; n: P3; sides: P3[] } {
  const Y = (yaw * Math.PI) / 180;
  const L = (lie * Math.PI) / 180;
  // (its own axes: `across` its face, `u` up its face, `n` out of its face, toward the eye when yaw is 0 and it stands)
  const face: P3 = [Math.cos(Y + Math.PI / 4), Math.sin(Y + Math.PI / 4), 0];
  const across: P3 = [Math.cos(Y + Math.PI / 4 - Math.PI / 2), Math.sin(Y + Math.PI / 4 - Math.PI / 2), 0];
  // (laid back: its up tips away from the eye, its face turns up)
  const u: P3 = add3(mul3([0, 0, 1], Math.cos(L)), mul3(face, -Math.sin(L)));
  const n: P3 = add3(mul3(face, Math.cos(L)), mul3([0, 0, 1], Math.sin(L)));
  const at3 = (i: number, j: number, k: number): P3 => add3(add3(mul3(across, (i * ACROSS) / 2), mul3(u, (j * UP) / 2)), mul3(n, (k * THICK) / 2));
  const cross3 = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sides: P3[] = [];
  for (let e = 0; e < OUTLINE.length; e++) {
    const [ai, aj] = OUTLINE[e];
    const [bi, bj] = OUTLINE[(e + 1) % OUTLINE.length];
    const a0 = at3(ai, aj, -1);
    const b0 = at3(bi, bj, -1);
    const along = [b0[0] - a0[0], b0[1] - a0[1], b0[2] - a0[2]] as P3;
    let side = cross3(along, n);
    const l = Math.hypot(...side) || 1;
    side = [side[0] / l, side[1] / l, side[2] / l];
    const midE = at3((ai + bi) / 2, (aj + bj) / 2, 0);
    if (dot3(side, midE) < 0) side = mul3(side, -1);
    sides.push(side);
  }
  return { at3, n, sides };
}

/**
 * THE STONE, its middle at (cx, cy) of a painting `p`: turned `yaw` degrees from facing the eye
 * (0) round its upright, and laid back `lie` degrees from standing (0) to lying flat on its back
 * (90). `burn`: how bright its rune is, 0 cold to 1 white-hot. Paints into `over` the rune's
 * glow that goes over everything. (art/ring3.ts lays it into the slab with this too.)
 */
export function paintStone(p: Px, over: Px, cx: number, cy: number, yaw: number, lie: number, burn: number): void {
  const { at3, n, sides } = placed(yaw, lie);
  const outline = OUTLINE;
  // (its face and its back; and a side for each edge of the outline, facing out from it)
  const faces: { c: P3[]; n: P3; front: boolean }[] = [
    { c: outline.map(([i, j]) => at3(i, j, 1)), n, front: true },
    { c: [...outline].reverse().map(([i, j]) => at3(i, j, -1)), n: mul3(n, -1), front: false },
  ];
  for (let e = 0; e < outline.length; e++) {
    const [ai, aj] = outline[e];
    const [bi, bj] = outline[(e + 1) % outline.length];
    faces.push({ c: [at3(ai, aj, -1), at3(bi, bj, -1), at3(bi, bj, 1), at3(ai, aj, 1)], n: sides[e], front: false });
  }
  const centre = (f: { c: P3[] }): P3 => mul3(f.c.reduce((q, r) => add3(q, r), [0, 0, 0] as P3), 1 / f.c.length);
  const shown = faces.filter((f) => dot3(f.n, EYE) > 0.02).sort((a, b) => dot3(centre(a), EYE) - dot3(centre(b), EYE));
  for (const f of shown) {
    const lit = dot3(f.n, LIGHT);
    const tone = f.front ? (lit > 0.75 ? 4 : lit > 0.4 ? 3 : 2) : lit > 0.6 ? 3 : lit > 0.25 ? 2 : 1;
    const pts = f.c.map((q) => seen(q)).map(([x, y]) => [cx + x, cy + y] as const);
    fillQuad(p, pts, (x, y) => {
      // (its corners are rounded off, and its edges worn: a darker pixel here and there along them)
      if (!f.front) return SLATE[tone];
      return hash(x, y, 77) < 0.08 ? SLATE[Math.max(1, tone - 1)] : SLATE[tone];
    });
    if (f.front) {
      // THE GREAT RUNE, cut in its face: dark when cold; its light when it burns
      const heart = burn > 0.8 ? '#ffffff' : burn > 0.45 ? CYAN[3] : burn > 0.15 ? CYAN[2] : SLATE[0];
      for (const [x, y] of runeCut(at3, cx, cy, 1 + 0.4 / THICK)) {
        if (burn > 0.15) {
          over.set(x, y, heart);
          // (its glow, either side of the cut)
          if (burn > 0.45) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) if (!over.has(x + dx, y + dy) && p.has(x + dx, y + dy)) over.set(x + dx, y + dy, CYAN[2]);
        } else p.set(x, y, heart);
      }
    }
  }
}

/** The pixels of the great rune's strokes, laid out on the stone's face as it is cut there, at depth `k` through it (1 its face, -1 its back). */
function runeCut(at3: (i: number, j: number, k: number) => P3, cx: number, cy: number, k: number): [number, number][] {
  const at = (sx: number, sy: number): [number, number] => {
    const [x, y] = seen(at3(sx * 0.68, sy * 0.72, k));
    return [cx + x, cy + y];
  };
  const out: [number, number][] = [];
  for (const [x0, y0, x1, y1] of GREAT_RUNE) {
    const a = at(x0, y0);
    const b = at(x1, y1);
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.6));
    for (let i = 0; i <= steps; i++) out.push([Math.round(a[0] + ((b[0] - a[0]) * i) / steps - 0.5), Math.round(a[1] + ((b[1] - a[1]) * i) / steps - 0.5)]);
  }
  return out;
}

/** The colours a hollow is painted in: those of the stone it is cut in (art/ring3.ts gives them). */
export interface HollowTones {
  /** Its floor, and the darker line along it where the far walls meet it. */
  floor: string;
  crease: string;
  /** The great rune's print, cut in its floor. */
  print: string;
  /** Its walls, by which way they face: to the light, between, and away from it. */
  lit: string;
  mid: string;
  shade: string;
}

/**
 * THE HOLLOW THE STONE LIES IN, cut in a top for it to lie flush with (art/ring3.ts, the
 * wordsmith's slab), as `paintStone` lays it there (the same middle, turn and lie: on its back).
 * Seen from above, as everything in the game is: its floor, where the stone's back lies; the
 * walls on its far side, lit or in shade by which way they face (the near ones are out of sight
 * under its lip); and the great rune's print cut in its floor, cold, so that it is plain what
 * goes there.
 */
export function paintHollow(p: Px, cx: number, cy: number, yaw: number, lie: number, tone: HollowTones): void {
  const { at3, sides } = placed(yaw, lie);
  const on = (q: P3): readonly [number, number] => {
    const [x, y] = seen(q);
    return [cx + x, cy + y] as const;
  };
  // (its rim, where the stone's face lies, flush with the top; and its foot, where its back lies)
  const rim = OUTLINE.map(([i, j]) => on(at3(i, j, 1)));
  const foot = OUTLINE.map(([i, j]) => on(at3(i, j, -1)));
  const inRim = (x: number, y: number): boolean => insidePoly(rim, x + 0.5, y + 0.5);
  // (the walls that face the eye: those on its far side)
  const wall = new Px(p.w, p.h);
  for (let e = 0; e < OUTLINE.length; e++) {
    const inward = mul3(sides[e], -1);
    if (dot3(inward, EYE) <= 0.02) continue;
    const l = dot3(inward, LIGHT);
    const c = l > 0.4 ? tone.lit : l > 0.2 ? tone.mid : tone.shade;
    const f = (e + 1) % OUTLINE.length;
    fillQuad(wall, [rim[e], rim[f], foot[f], foot[e]], (x, y) => (inRim(x, y) ? c : null));
  }
  const floor = new Px(p.w, p.h);
  fillQuad(floor, foot, (x, y) => (inRim(x, y) ? tone.floor : null));
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (!inRim(x, y)) continue;
      // (the floor, darker where a wall meets it; and where a wall is seen edge on, a sliver of the darkest)
      if (floor.has(x, y)) p.set(x, y, wall.has(x, y - 1) ? tone.crease : tone.floor);
      else p.set(x, y, wall.get(x, y) ?? tone.shade);
    }
  }
  // THE GREAT RUNE'S PRINT, cut in its floor where the stone's rune will lie
  for (const [x, y] of runeCut(at3, cx, cy, -1)) if (floor.has(x, y)) p.set(x, y, tone.print);
}

/** Whether a point is inside a shape with straight sides that bulges everywhere (its corners in order round it). */
function insidePoly(pts: ReadonlyArray<readonly [number, number]>, px: number, py: number): boolean {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const c = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
    if (Math.abs(c) < 1e-9) continue;
    const s = c > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

/** A shape with straight sides that bulges everywhere (its corners in order round it) filled, pixel by pixel; where `colour` gives none, left as it was. */
function fillQuad(p: Px, pts: ReadonlyArray<readonly [number, number]>, colour: (x: number, y: number) => string | null): void {
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (!insidePoly(pts, x + 0.5, y + 0.5)) continue;
      const c = colour(x, y);
      if (c !== null) p.set(x, y, c);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Its pictures

export interface StoneArt {
  /** Lying by the fallen wordsmith, its rune throbbing (frame by frame), as the floor's things are anchored: at its middle. */
  lying: Sprite[];
  /** Standing in the air, turning a little to and fro, its rune alight (frame by frame); anchored at its middle. */
  standing: Sprite[];
  /** From standing to lying on its back, in steps (to be laid into the slab): anchored at its middle. */
  laying: Sprite[];
  /** Carried: a small picture of it, for the screen (anchored at its middle). */
  icon: Sprite;
  /** A burst of its light (as it is taken up, and as it is laid into the slab): a ring of light, and a light; anchored at its middle. */
  flash: Sprite;
}

export const STONE_LYING_FRAMES = 8;
export const STONE_STANDING_FRAMES = 12;
export const STONE_LAYING_STEPS = 6;

/** One picture of the stone: turned, laid back and burning so; with a light at its rune, and (lying) motes rising off it. */
function stoneSprite(yaw: number, lie: number, burn: number, motes: number, frame: number): Sprite {
  const W = 48;
  const H = 48;
  const p = new Px(W, H);
  const over = new Px(W, H);
  paintStone(p, over, W / 2, H / 2, yaw, lie, burn);
  for (let m = 0; m < motes; m++) {
    const up = ((frame / STONE_LYING_FRAMES + hash(m, 3, 91)) % 1) * 16;
    const x = Math.round(W / 2 + (hash(m, 5, 93) - 0.5) * 14 + Math.sin(up * 0.6 + m) * 1.5);
    const y = Math.round(H / 2 - 3 - up);
    if (y > 0) over.set(x, y, up < 6 ? '#ffffff' : CYAN[3]);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (over.has(x, y)) p.set(x, y, over.get(x, y) as string);
  const s = p.sprite(W / 2, H / 2, GRAIN);
  const lights: Light[] = [{ x: W / 2 / GRAIN, y: H / 2 / GRAIN, r: 6 + 10 * burn, color: CYAN[2], a: 0.2 + 0.35 * burn }];
  s.lights = lights;
  return s;
}

export function makeStoneArt(): StoneArt {
  return {
    // (its rune throbs as it lies there: from faint to bright and back, eight frames round)
    lying: lazyFrames(STONE_LYING_FRAMES, (f) => stoneSprite(28, 90, 0.3 + 0.35 * (0.5 - 0.5 * Math.cos((f / STONE_LYING_FRAMES) * Math.PI * 2)), 3, f)),
    standing: lazyFrames(STONE_STANDING_FRAMES, (f) => stoneSprite(Math.sin((f / STONE_STANDING_FRAMES) * Math.PI * 2) * 24, 0, 0.85, 0, f)),
    laying: lazyFrames(STONE_LAYING_STEPS, (k) => stoneSprite(0, (90 * k) / (STONE_LAYING_STEPS - 1), 0.85, 0, 0)),
    icon: stoneSprite(-12, 8, 0.7, 0, 0),
    flash: flashSprite(),
  };
}

function flashSprite(): Sprite {
  const W = 64;
  const H = 40;
  const p = new Px(W, H);
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const x = Math.round(W / 2 + Math.cos(a) * 26);
    const y = Math.round(H / 2 + Math.sin(a) * 13);
    p.set(x, y, i % 3 === 0 ? '#ffffff' : CYAN[3]);
    if (i % 2 === 0) p.set(Math.round(W / 2 + Math.cos(a) * 22), Math.round(H / 2 + Math.sin(a) * 11), CYAN[2]);
  }
  for (const [dx, dy] of [[0, -14], [10, -9], [-10, -9], [14, 0], [-14, 0]] as const) p.set(W / 2 + dx, H / 2 + dy, '#ffffff');
  const s = p.sprite(W / 2, H / 2, GRAIN);
  s.lights = [{ x: W / 2 / GRAIN, y: H / 2 / GRAIN, r: 34, color: CYAN[2], a: 0.75 }];
  return s;
}

// ---------------------------------------------------------------------------------------------
// THE GIVING, and the ring powering up: what each part is doing a moment `g` seconds after the
// hero gave the stone (on the town's clock: QUEST3.givenAt).

/** When each thing happens, in seconds from the giving. */
export const POWER = {
  /** It rises out of the hero ... */
  risen: 0.5,
  /** ... floats over the slab ... */
  over: 1.3,
  /** ... lies down over its hollow ... */
  lain: 1.6,
  /** ... and is laid in. */
  set: 1.9,
  /** Its rune is alight. */
  lit: 2.3,
  /** The slab's own runes have lit one by one. */
  slab: 2.9,
  /** The light has run all round the circle in the floor, both ways from the slab. */
  round: 4.1,
  /** Every stone flares, the letters burst out, the column rises, the wordsmith's runes catch. */
  flare: 4.1,
  /** And it is the ring he said yes to. */
  done: 4.7,
} as const;

/** How far the light has run round the circle (0 to 1: the share of it alight, from the slab's side, both ways) at `g`. */
export function fuseOf(g: number): number {
  return Math.max(0, Math.min(1, (g - POWER.slab) / (POWER.round - POWER.slab)));
}

/** How many of the slab's four runes are alight at `g`. */
export function slabRunesOf(g: number): number {
  if (g < POWER.lit) return 0;
  return Math.min(4, Math.floor(((g - POWER.lit) / (POWER.slab - POWER.lit)) * 4 + 1e-9));
}

/** Where the floating stone is at `g`, between the hero (where it comes out of them) and the slab's hollow, and how it is turned: null when it is not in the air. */
export function floatingOf(g: number, hero: readonly [number, number], slab: readonly [number, number], slabTop: number): { x: number; y: number; z: number; lie: number } | null {
  if (g < 0 || g >= POWER.set) return null;
  const ease = (k: number): number => k * k * (3 - 2 * k);
  if (g < POWER.risen) {
    const k = ease(g / POWER.risen);
    return { x: hero[0], y: hero[1], z: 8 + 20 * k, lie: 0 };
  }
  if (g < POWER.over) {
    const k = ease((g - POWER.risen) / (POWER.over - POWER.risen));
    return { x: hero[0] + (slab[0] - hero[0]) * k, y: hero[1] + (slab[1] - hero[1]) * k, z: 28 + (slabTop + 14 - 28) * k + Math.sin(k * Math.PI) * 6, lie: 0 };
  }
  if (g < POWER.lain) return { x: slab[0], y: slab[1], z: slabTop + 14, lie: 90 * ease((g - POWER.over) / (POWER.lain - POWER.over)) };
  const k = (g - POWER.lain) / (POWER.set - POWER.lain);
  return { x: slab[0], y: slab[1], z: slabTop + 14 - 14 * k * k, lie: 90 };
}

/** Where on the circle in the floor a thing stands, as `fuse` measures it (0 at the slab's side, 1 half way round, both ways), from where it is beside the middle of the ring (tiles). */
export function roundFromSlab(dx: number, dy: number): number {
  // (the slab is down the screen and to the left of the middle: world +y)
  const a = Math.atan2(dy, dx);
  const slab = Math.PI / 2;
  let d = Math.abs(a - slab) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d / Math.PI;
}

/** When the stone at `at` (tiles from the middle of the ring) catches: as the light running round the circle reaches it. */
export function catchesAt(dx: number, dy: number): number {
  return POWER.slab + roundFromSlab(dx, dy) * (POWER.round - POWER.slab);
}

