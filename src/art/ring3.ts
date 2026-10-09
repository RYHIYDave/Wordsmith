// THE WORDSMITH'S RING, BIG AND WILD (the art chat, 8 Oct 2026). A MOCK-UP BEHIND THE SWITCH OF
// THE WORDSMITH ON BONES (art/smith3.ts, SMITH3), WHICH IS OFF; with it off the ring is art/town.ts's.
//
// The owner's brief, by 22:45, of his ring when it is powered: "Big and wild (Recommended)", which
// was read back to him as: the standing stones blaze, letters of light swirl round, and a column
// of light rises over the slab. So:
//   - THE STANDING STONES are taller, and each has one of his great runes cut deep in it, burning:
//     white at its heart, the friend's cyan round it, light licking up the stone above it and motes
//     rising off its top. A pulse goes round them, stone to stone; between pulses they still burn.
//   - THE CIRCLE IN THE FLOOR is cut wider and burns brighter, with his runes between its two rings
//     laid flat in the floor, and two bright arcs that chase each other round it throwing sparks.
//   - LETTERS OF LIGHT SWIRL ROUND inside the ring at every height, in front of him and behind him
//     (`swirlAt`: the renderer stands each among everything else, so he hides those behind him).
//   - A COLUMN OF LIGHT rises off the slab, runes climbing in it.
//   - WHEN HE WORKS (art/smith3.ts: he writes a great rune on the air and drives it down into the
//     slab) the letters draw in round him and go faster as he writes, and when the rune goes into the
//     slab they burst outward, every stone flares at once, the circle flashes and the column surges.
// By 23:09 he said of it, seen at work with the wordsmith on bones (smith.gif): "Just right
// (Recommended)".
// Everything here that glows is the friend's cyan, white at its heart (the rulebook). Each stone,
// circle and column is painted once, frame by frame, and chosen by the clock (art/townscene.ts).
//
// The dark ring (before the quest item powers it: the next job) is drawn here too, for later:
// `blaze` 0.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { Theme } from './ground';
import { Iso, plainSide } from './isokit';
import { CYAN, GRAIN, TEAL, compose, hash, lazyFrames } from './kit';
import { stoneOf } from './props';
import { STONE_THICK, paintHollow, paintStone, roundFromSlab } from './quest3';
import type { HollowTones } from './quest3';
import { RUNES7, burning } from './smith3';

/** How the ring burns: 0 dark (not yet powered), 1 burning, 2 a pulse on it, 3 flaring (a rune has just gone into the slab). */
export type Blaze = 0 | 1 | 2 | 3;

/** How many frames each standing stone has of each way it burns (the light on it flickers); and the circle in the floor, and the column. */
export const STONE_FRAMES = 6;
export const FLOOR_FRAMES = 16;
export const COLUMN_FRAMES = 8;

export interface Ring3Art {
  /** Each standing stone (six), each way it burns, frame by frame. */
  stones: Sprite[][][];
  /** The circle in the floor, burning (frame by frame), and dark. */
  floor: Sprite[];
  floorDark: Sprite;
  /** The column of light over the slab, frame by frame. */
  column: Sprite[];
  /** The letters that swirl round: each of his runes, small and big, at three heats. */
  letters: Sprite[][];
  big: Sprite[][];
  /**
   * THE SLAB, made for the master rune-stone (art/quest3.ts): dark, an empty hollow in its top;
   * the stone laid into it, its rune catching (in steps, cold to burning); the slab's own four
   * runes catching one by one; and the slab burning, the stone in it, a word lifting off it (frame
   * by frame).
   */
  slabEmpty: Sprite;
  slabSet: Sprite[];
  slabRunes: Sprite[];
  slab: Sprite[];
  /** The circle in the floor while the light runs round it from the slab's side, both ways (in steps: none of it alight, to all of it). */
  fuse: Sprite[];
  /** The column rising off the slab (in steps, from nothing to its whole height). */
  columnRising: Sprite[];
}

/** Where each of the six standing stones stands from the middle of the ring, in tiles (as game/level.ts has them: TOWN.runeStones, by their variant), and the slab. */
export const STONE_AT: ReadonlyArray<readonly [number, number]> = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
export const SLAB_AT: readonly [number, number] = [0, 1];

/** How many steps the light running round the circle is painted in; and the column rising; and the stone's rune catching. */
export const FUSE_STEPS = 16;
export const RISE_STEPS = 8;
export const SET_STEPS = 5;

/** One of his runes, `sx` pixels to each of its pixels across and `sy` down, its top left at (x, y). */
function runeAt(p: Px, k: number, x: number, y: number, color: string, sx = 1, sy = 1): void {
  const rows = RUNES7[((k % RUNES7.length) + RUNES7.length) % RUNES7.length];
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      if (rows[j][i] !== '#') continue;
      for (let b = 0; b < sy; b++) for (let a = 0; a < sx; a++) p.set(x + i * sx + a, y + j * sy + b, color);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// THE STANDING STONES: as art/town.ts builds them (rough, leaning, with sides and a top), taller,
// and with a great rune burning in the lit side. 48 x 112; the middle of its tile at (24, 100).

function makeStone3(theme: Theme, variant: number, blaze: Blaze, frame: number): Sprite {
  const W = 48;
  const H = 112;
  const ox = 24;
  const oy = 100;
  const body = new Px(W, H);
  const over = new Px(W, H);
  const lean = [1.5, -2, 0.5, -1, 2, -1.5][variant % 6];
  const tall = [74, 66, 80, 70, 62, 76][variant % 6];
  const A = [0.22, 0.24, 0.2, 0.23, 0.25, 0.21][variant % 6];
  const B = [0.15, 0.13, 0.16, 0.14, 0.13, 0.15][variant % 6];
  const girth = (t: number): number => Math.max(0.2, 1 - 0.5 * t ** 1.6 - (t > 0.86 ? (t - 0.86) * 2.6 : 0));
  const at = (z: number): Iso => new Iso(body, ox + Math.round((lean * z) / tall), oy);
  // (where the rune is, and how near it a pixel of the lit side is: the light of it spills on the stone)
  const rz = Math.round(tall * 0.58);
  const [rx, ry] = at(rz).at(0, B * girth(rz / tall), rz - 7);
  const spill = blaze === 0 ? 0 : blaze === 1 ? 0.55 : blaze === 2 ? 0.85 : 1;
  const lit = (px: number, py: number, base: string): string => {
    if (spill === 0) return base;
    const d = Math.hypot(px - rx, (py - ry) * 0.7);
    const k = spill * Math.max(0, 1 - d / 22) + (hash(px, py, frame + 11) - 0.5) * 0.15;
    return k > 0.62 ? CYAN[2] : k > 0.4 ? TEAL[2] : k > 0.22 ? TEAL[1] : base;
  };
  const STEP = 2;
  for (let z = 0; z < tall; z += STEP) {
    const k = girth(z / tall);
    const a = A * k;
    const b = B * k;
    const iso = at(z);
    const z1 = Math.min(tall, z + STEP * 2);
    iso.left(-a, a, b, z, z1, (u, _v, w, _h, px, py) => {
      if (u >= w - 1) return lit(px, py, theme.lit[4]);
      if (u === 0) return theme.lit[1];
      return lit(px, py, hash(px >> 2, py >> 2, variant + 3) < 0.16 ? theme.lit[3] : theme.lit[2]);
    });
    iso.right(a, -b, b, z, z1, (u, _v, w, _h, px, py) => (u >= w - 1 ? theme.shade[1] : hash(px >> 2, py >> 2, variant + 5) < 0.18 ? theme.shade[3] : theme.shade[2]));
  }
  {
    const k = girth(1);
    at(tall).top(-A * k, -B * k, A * k, B * k, tall, () => theme.lit[4]);
  }
  // (cracks, and moss at its foot)
  for (let z = 8; z < tall - 10; z++) {
    if (hash(variant, z, 4) < 0.45) {
      const [x, y] = at(z).at(A * 0.3 + Math.sin(z * 0.4) * 0.04, B * girth(z / tall), z);
      if (body.has(Math.round(x), Math.round(y))) body.set(Math.round(x), Math.round(y), theme.lit[0]);
    }
  }
  for (let i = 0; i < 16; i++) {
    const [x, y] = at(0).at(-A + (2 * A * i) / 15, B, 1 + Math.round(hash(i, variant, 7) * 2));
    if (hash(i, variant, 6) < 0.55 && body.has(Math.round(x), Math.round(y))) body.set(Math.round(x), Math.round(y), TEAL[1]);
  }
  // THE RUNE: one of his, cut twice his small size, deep (its groove dark when it is cold) and burning
  const k = variant + 2;
  const x0 = Math.round(rx) - 5;
  const y0 = Math.round(ry) - 7;
  const lights: Light[] = [];
  if (blaze === 0) {
    runeAt(body, k, x0, y0, theme.shade[1], 2, 2);
  } else {
    // (its edge first, a pixel all round in the friend's cyan; then its heart)
    const edge = new Px(W, H);
    runeAt(edge, k, x0, y0, '#ffffff', 2, 2);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (edge.has(x, y)) continue;
      if (edge.has(x - 1, y) || edge.has(x + 1, y) || edge.has(x, y - 1) || edge.has(x, y + 1)) over.set(x, y, blaze >= 2 ? CYAN[2] : TEAL[2]);
    }
    const heart = blaze === 1 ? CYAN[2] : blaze === 2 ? CYAN[3] : '#ffffff';
    runeAt(over, k, x0, y0, heart, 2, 2);
    // (light licking up the stone above it: wisps that flicker from frame to frame)
    const high = blaze === 1 ? 10 : blaze === 2 ? 18 : 30;
    for (let w = 0; w < 7; w++) {
      const lx = x0 + 1 + Math.round(hash(w, frame, variant + 21) * 8);
      const len = Math.round(high * (0.4 + 0.6 * hash(w, frame, variant + 23)));
      for (let j = 0; j < len; j++) {
        const y = y0 - 2 - j;
        const x = lx + Math.round(Math.sin((j + frame * 2 + w * 3) * 0.6) * 1.2);
        if (!body.has(x, y) && j > 3) continue;
        const t = 1 - j / Math.max(1, len);
        if (hash(x, y, frame + w) < 0.35 + 0.4 * t) over.set(x, y, burning(0.3 + 0.6 * t * (blaze / 3)));
      }
    }
    // (motes rising off its top)
    if (blaze >= 2) {
      const [tx, ty] = at(tall).at(0, 0, tall);
      for (let m = 0; m < (blaze === 3 ? 8 : 4); m++) {
        const up = ((frame / STONE_FRAMES + hash(m, variant, 31)) % 1) * (blaze === 3 ? 18 : 12);
        const mx = Math.round(tx + (hash(m, variant, 33) - 0.5) * 10 + Math.sin(up * 0.5 + m) * 1.5);
        const my = Math.round(ty - 2 - up);
        if (my > 0) over.set(mx, my, up < 6 ? '#ffffff' : CYAN[3]);
      }
    }
    lights.push({ x: rx / GRAIN, y: ry / GRAIN, r: blaze === 1 ? 12 : blaze === 2 ? 19 : 27, color: CYAN[2], a: blaze === 1 ? 0.3 : blaze === 2 ? 0.5 : 0.7 });
  }
  const s = compose(null, [body], over).sprite(ox, oy, GRAIN);
  if (lights.length) s.lights = lights;
  return s;
}

// ---------------------------------------------------------------------------------------------
// THE CIRCLE IN THE FLOOR: as art/town.ts's (its outer ring the circle the stones stand on), cut
// wider and burning brighter, his runes laid flat in the floor between its rings, and two bright
// arcs chasing each other round it, throwing sparks. 212 x 106; anchored at its middle.

function makeFloor3(frame: number, burns: boolean, fuse = 1): Sprite {
  const W = 212;
  const H = 106;
  const p = new Px(W, H);
  const cx = W / 2;
  const cy = H / 2;
  const turn = (frame % FLOOR_FRAMES) / FLOOR_FRAMES;
  const cold = TEAL[0];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - cx) / (W / 2);
      const dy = (y + 0.5 - cy) / (H / 2);
      const d = Math.hypot(dx, dy);
      const a = (Math.atan2(dy, dx) / (Math.PI * 2) + 1.25) % 1;
      // (two arcs, half the circle apart, each leading with its bright end; or, while the light
      // is running round it from the slab's side, only what it has reached, its front white)
      const lead = Math.min((a - turn + 2) % 1, (a - turn + 2.5) % 1);
      const from = fuse < 1 ? roundFromSlab(dx + dy, dy - dx) : 0;
      const hot = !burns || from > fuse ? 0 : fuse < 1 ? (fuse - from < 0.05 ? 3 : fuse - from < 0.14 ? 2 : 1) : lead < 0.05 ? 3 : lead < 0.18 ? 2 : 1;
      const tone = hot === 3 ? '#ffffff' : hot === 2 ? CYAN[3] : hot === 1 ? CYAN[2] : cold;
      if (Math.abs(d - 0.965) < 0.03 || Math.abs(d - 0.73) < 0.022) p.set(x, y, tone);
      else if (d < 0.22 && (Math.abs(dx) < 0.014 || Math.abs(dy) < 0.026)) p.set(x, y, burns ? TEAL[2] : cold);
    }
  }
  // (his runes, laid flat between the rings: twice as wide as they are tall, as the floor is seen)
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.31;
    const rx = cx + Math.cos(a) * (W / 2) * 0.848;
    const ry = cy + Math.sin(a) * (H / 2) * 0.848;
    const u = ((a / (Math.PI * 2) + 1.25 - turn) % 1 + 1) % 1;
    const near = Math.min((u + 1) % 1, (u + 0.5) % 1);
    const reached = fuse >= 1 || roundFromSlab(Math.cos(a) + Math.sin(a), Math.sin(a) - Math.cos(a)) <= fuse;
    const c = !burns || !reached ? cold : fuse < 1 ? CYAN[2] : near < 0.08 ? '#ffffff' : near < 0.2 ? CYAN[3] : CYAN[2];
    runeAt(p, i, Math.round(rx - 5), Math.round(ry - 3), c, 2, 1);
  }
  const s = p.sprite(cx, cy, GRAIN);
  if (burns && fuse < 1) {
    // (the light running round: sparks and a light at each of its two fronts)
    if (fuse <= 0) return s;
    const lights: Light[] = [];
    for (const side of [-1, 1]) {
      // (the front, as the world has it: the slab's side turned by the share run, each way)
      const w = Math.PI / 2 + side * fuse * Math.PI;
      const wx = Math.cos(w);
      const wy = Math.sin(w);
      // (the world's way, as the sprite's x and y: across is x - y, down is half of x + y)
      const ex = (wx - wy) / Math.SQRT2;
      const ey = (wx + wy) / Math.SQRT2;
      const hx = cx + ex * (W / 2) * 0.965;
      const hy = cy + ey * (H / 2) * 0.965;
      for (let k = 0; k < 7; k++) {
        const sx = Math.round(hx + (hash(k, frame, 61 + side) - 0.5) * 8);
        const sy = Math.round(hy - 1 - hash(k, frame, 63 + side) * 8);
        if (sx >= 0 && sy >= 0 && sx < W && sy < H) p.set(sx, sy, k % 2 === 0 ? '#ffffff' : CYAN[3]);
      }
      lights.push({ x: hx / GRAIN, y: hy / GRAIN, r: 16, color: CYAN[2], a: 0.55 });
    }
    s.lights = lights;
    return s;
  }
  if (burns) {
    // (sparks thrown up off the head of each arc, and its light)
    const lights: Light[] = [];
    for (const off of [0, 0.5]) {
      const a = (turn + off - 0.25) * Math.PI * 2;
      const hx = cx + Math.cos(a) * (W / 2) * 0.965;
      const hy = cy + Math.sin(a) * (H / 2) * 0.965;
      for (let k = 0; k < 6; k++) {
        const sx = Math.round(hx + (hash(k, frame, 41 + off * 10) - 0.5) * 8);
        const sy = Math.round(hy - 1 - hash(k, frame, 43 + off * 10) * 7);
        if (sx >= 0 && sy >= 0 && sx < W && sy < H) p.set(sx, sy, k % 2 === 0 ? '#ffffff' : CYAN[3]);
      }
      lights.push({ x: hx / GRAIN, y: hy / GRAIN, r: 14, color: CYAN[2], a: 0.45 });
    }
    lights.push({ x: cx / GRAIN, y: cy / GRAIN, r: 48, color: CYAN[2], a: 0.16 });
    s.lights = lights;
  }
  return s;
}

// ---------------------------------------------------------------------------------------------
// THE COLUMN OF LIGHT over the slab: a beam from the slab's top up into the dark, white at its
// heart and the friend's cyan round it, shimmering, with runes climbing in it. 30 x 150; anchored
// at the foot of its middle, which the renderer stands on the slab's top.

function makeColumn3(frame: number, rise = 1): Sprite {
  const W = 30;
  const H = 150;
  const p = new Px(W, H);
  const cx = W / 2;
  for (let y = Math.floor(H * (1 - rise)); y < H; y++) {
    const t = y / H;
    // (it narrows and thins out as it rises)
    const half = 2.2 + 3.4 * (1 - t) ** 1.5;
    for (let x = 0; x < W; x++) {
      const d = Math.abs(x + 0.5 - cx);
      if (d > half) continue;
      const shimmer = hash(x, y >> 1, frame) < 0.25 + 0.6 * t;
      if (d < 0.9) p.set(x, y, t < 0.15 ? CYAN[3] : '#ffffff');
      else if (d < half - 1.6) {
        if (!shimmer) p.set(x, y, CYAN[3]);
      } else if (!shimmer && (y + frame) % 3 !== 0) p.set(x, y, CYAN[2]);
    }
  }
  // (runes climbing in it; and, while it rises, its head bursting white)
  for (let r = 0; r < 4; r++) {
    const y = Math.round(H - 14 - ((frame / COLUMN_FRAMES + r / 4) % 1) * (H - 30));
    if (y > H * (1 - rise)) runeAt(p, r * 2 + 1, Math.round(cx - 2.5), y, '#ffffff');
  }
  if (rise < 1) {
    const top = Math.floor(H * (1 - rise));
    for (let k = 0; k < 10; k++) {
      const x = Math.round(cx + (hash(k, frame, 71) - 0.5) * 12);
      const y = top - Math.round(hash(k, frame, 73) * 6);
      if (y >= 0) p.set(x, y, k % 2 === 0 ? '#ffffff' : CYAN[3]);
    }
  }
  const s = p.sprite(cx, H, GRAIN);
  s.lights = [
    { x: cx / GRAIN, y: (H - 10) / GRAIN, r: 26, color: CYAN[2], a: 0.5 },
    { x: cx / GRAIN, y: (H * 0.45) / GRAIN, r: 22, color: CYAN[2], a: 0.3 },
  ];
  return s;
}

// ---------------------------------------------------------------------------------------------
// THE SLAB, made for the master rune-stone: as art/town.ts builds it (a low table of the walls'
// stone on two feet, its runes along its front), with a hollow in the middle of its top the shape
// of the stone, where the great rune was cut before. 68 x 76; the middle of its tile at (34, 58).

export interface SlabState {
  /** The stone is in the hollow. */
  stone: boolean;
  /** How bright the stone's rune burns, 0 cold to 1. */
  burn: number;
  /** How many of its four runes along its front are alight. */
  runes: number;
  /** It is burning as the ring is: the rune along its front that is brightest goes along, and a word lifts off it (frame by frame). */
  burning: boolean;
  frame: number;
}

/** The empty hollow's colours, in the slab's own stone: its floor a step down from its top, its walls as its sides are, the rune's print and the crease darker. */
const HOLLOW_TONES = (theme: Theme): HollowTones => {
  const stone = stoneOf(theme);
  return { floor: stone[3], crease: theme.lit[1], print: theme.lit[2], lit: theme.lit[2], mid: theme.lit[1], shade: theme.shade[2] };
};

function makeSlab3(theme: Theme, o: SlabState): Sprite {
  const W = 68;
  const H = 76;
  const ox = 34;
  const oy = 58;
  const stone = stoneOf(theme);
  const slab = new Px(W, H);
  const over = new Px(W, H);
  const iso = new Iso(slab, ox, oy);
  const A = 0.6;
  const B = 0.3;
  const FEET = 13;
  const TOP = 22;
  const litSide = plainSide(theme.lit[2], theme.lit[4], theme.lit[1]);
  const shadeSide = plainSide(theme.shade[2], theme.shade[4], theme.shade[1]);
  for (const x of [-A + 0.08, A - 0.3]) iso.box(x, -B + 0.05, x + 0.22, B - 0.05, 0, FEET, { top: () => stone[2], left: litSide, right: shadeSide });
  // (its runes along the front: cut, and those alight burning; burning as the ring is, the brightest goes along)
  const front = new Px(40, TOP - FEET);
  const glowing = new Px(40, TOP - FEET);
  const hottest = o.burning ? o.frame % 4 : -1;
  for (let i = 0; i < 4; i++) {
    const alight = i < o.runes;
    runeAt(front, i + 4, 3 + i * 9, 1, !alight ? theme.shade[1] : i === hottest ? '#ffffff' : CYAN[2]);
    if (alight) runeAt(glowing, i + 4, 3 + i * 9, 1, i === hottest ? '#ffffff' : CYAN[3]);
  }
  iso.box(-A, -B, A, B, FEET, TOP, {
    top: (u, v) => (u < 0.05 || v < 0.07 || u > 0.95 || v > 0.93 ? stone[3] : stone[4]),
    left: (u, v, w, h) => front.get(u, v) ?? litSide(u, v, w, h, 0, 0),
    right: shadeSide,
  });
  if (o.runes > 0) new Iso(over, ox, oy).left(-A, A, B, FEET, TOP, (u, v) => glowing.get(u, v));
  // THE HOLLOW in its top, the stone's shape; and the stone laid in it, flush with the top
  const [mx, my] = iso.at(0, 0, TOP);
  if (!o.stone) {
    // (empty: cut in the slab's own stone, its far walls seen, the great rune's print in its floor)
    paintHollow(slab, mx, my + STONE_THICK / 2, -45, 90, HOLLOW_TONES(theme));
  } else {
    const st = new Px(W, H);
    const on = new Px(W, H);
    paintStone(st, on, mx, my + STONE_THICK / 2, -45, 90, o.burn);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (st.has(x, y)) slab.set(x, y, st.get(x, y) as string);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (on.has(x, y)) over.set(x, y, on.get(x, y) as string);
  }
  const lights: Light[] = [];
  if (o.stone && o.burn > 0.1) lights.push({ x: mx / GRAIN, y: (my - 2) / GRAIN, r: 10 + 10 * o.burn, color: CYAN[2], a: 0.25 + 0.3 * o.burn });
  // (the word that lifts off it, burning as the ring is: forms, rises, thins away)
  if (o.burning) {
    const f = o.frame % 8;
    if (f >= 1) {
      const rise = f <= 1 ? 0 : (f - 1) * 4;
      const tone = f <= 4 ? '#ffffff' : f === 5 ? CYAN[3] : f === 6 ? CYAN[2] : TEAL[1];
      const gy = my - 18 - rise;
      if (gy >= 0) runeAt(over, 3 + f, mx - 2, gy, tone);
    }
  }
  const s = compose(null, [slab], over).sprite(ox, oy, GRAIN);
  if (lights.length) s.lights = lights;
  return s;
}

/** One of his runes alone, as a letter of light in the air: `heat` 0 cyan, 1 pale, 2 white with a cyan edge; `big`: twice the size. */
function makeLetter(k: number, heat: number, big: boolean): Sprite {
  const sc = big ? 2 : 1;
  const W = 5 * sc + 2;
  const H = 7 * sc + 2;
  const p = new Px(W, H);
  const heart = heat >= 2 ? '#ffffff' : heat >= 1 ? CYAN[3] : CYAN[2];
  runeAt(p, k, 1, 1, heart, sc, sc);
  if (heat >= 2) {
    const edge = new Px(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!p.has(x, y) && (p.has(x - 1, y) || p.has(x + 1, y) || p.has(x, y - 1) || p.has(x, y + 1))) edge.set(x, y, CYAN[2]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (edge.has(x, y)) p.set(x, y, CYAN[2]);
  }
  const s = p.sprite(W / 2, H, GRAIN);
  if (big) s.lights = [{ x: W / 2 / GRAIN, y: H / 2 / GRAIN, r: 9, color: CYAN[2], a: heat >= 2 ? 0.45 : 0.3 }];
  return s;
}

/** The ring's pictures. Each is painted the first time it is shown (art/kit.ts, lazyFrames): all of them at once take about a third of a second on a desktop. */
export function makeRing3(theme: Theme): Ring3Art {
  const stones: Sprite[][][] = [];
  for (let v = 0; v < 6; v++) {
    const ways: Sprite[][] = [];
    for (const b of [0, 1, 2, 3] as Blaze[]) ways.push(lazyFrames(b === 0 ? 1 : STONE_FRAMES, (f) => makeStone3(theme, v, b, f)));
    stones.push(ways);
  }
  const letters: Sprite[][] = [];
  const big: Sprite[][] = [];
  for (let h = 0; h < 3; h++) {
    letters.push(RUNES7.map((_, k) => makeLetter(k, h, false)));
    big.push(RUNES7.map((_, k) => makeLetter(k, h, true)));
  }
  return {
    stones,
    floor: lazyFrames(FLOOR_FRAMES, (f) => makeFloor3(f, true)),
    floorDark: makeFloor3(0, false),
    column: lazyFrames(COLUMN_FRAMES, (f) => makeColumn3(f)),
    letters,
    big,
    slabEmpty: makeSlab3(theme, { stone: false, burn: 0, runes: 0, burning: false, frame: 0 }),
    slabSet: lazyFrames(SET_STEPS, (k) => makeSlab3(theme, { stone: true, burn: k / (SET_STEPS - 1), runes: 0, burning: false, frame: 0 })),
    slabRunes: lazyFrames(4, (k) => makeSlab3(theme, { stone: true, burn: 1, runes: k + 1, burning: false, frame: 0 })),
    slab: lazyFrames(8, (f) => makeSlab3(theme, { stone: true, burn: 1, runes: 4, burning: true, frame: f })),
    fuse: lazyFrames(FUSE_STEPS + 1, (k) => makeFloor3(k, true, k / FUSE_STEPS)),
    columnRising: lazyFrames(RISE_STEPS, (k) => makeColumn3(k, (k + 1) / RISE_STEPS)),
  };
}

// ---------------------------------------------------------------------------------------------
// What each shows at a moment (art/townscene.ts asks), and where the letters are

/**
 * Where his work has got to at the moment `act` (from the wordsmith's own clock: art/townsfolk.ts,
 * actAt): -1 when he is not at it, else seconds into it. The rune goes into the slab 2.12 s in.
 */
export const LANDS = 2.12;

/** How hard the ring flares at a moment of his work: 1 as the rune goes into the slab, gone 0.8 s later. */
export function flareOf(act: number): number {
  if (act < LANDS) return 0;
  return Math.max(0, 1 - (act - LANDS) / 0.8);
}

/** Which way a standing stone burns at time `t`: a pulse goes round, stone to stone; all flare when a rune goes into the slab. */
export function stoneBlaze(variant: number, t: number, act: number): Blaze {
  if (flareOf(act) > 0.3) return 3;
  return Math.floor(t * 2.4) % 6 === variant % 6 ? 2 : 1;
}

/** A letter of light in the air: where it is from the middle of the ring (tiles, as the world has them) and how high (game pixels), which rune, how hot, and whether one of the big ones. */
export interface Letter {
  x: number;
  y: number;
  z: number;
  k: number;
  heat: number;
  big: boolean;
}

/**
 * THE LETTERS THAT SWIRL ROUND at time `t`, `act` seconds into his work (or -1). Fourteen of them,
 * at every height, going round him; as he writes they draw in and go faster; as the rune goes
 * into the slab they are thrown out to the stones, and come back.
 */
export function swirlAt(t: number, act: number): Letter[] {
  const out: Letter[] = [];
  const n = 14;
  const writing = act >= 0 && act < LANDS ? Math.min(1, act / 0.6) : 0;
  const flare = flareOf(act);
  const spin = 0.55 + 0.9 * writing + 1.6 * flare;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * spin * (i % 2 === 0 ? 1 : 0.85) + Math.sin(t * 0.3 + i) * 0.2;
    const r = (1.35 + 0.32 * Math.sin(t * 0.7 + i * 1.9)) * (1 - 0.45 * writing) + 1.0 * flare;
    const z = 14 + 16 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.3)) + 10 * writing;
    const flick = hash(i, Math.floor(t * 6), 51);
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z, k: (i + Math.floor(t * 0.4 + i * 0.37)) % RUNES7.length, heat: flare > 0.2 || flick > 0.82 ? 2 : flick > 0.45 || writing > 0.5 ? 1 : 0, big: i % 3 === 0 });
  }
  return out;
}
