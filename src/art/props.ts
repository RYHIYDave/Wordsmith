// What stands in a dungeon, at the heroes' grain (Version 14.1): the brazier, the chest, the
// barrel, the urn, the pillar, the portal; what lies on its floor (bones, rubble, what is left of
// a barrel or an urn that was broken); and the wordsmith who came this way before.
//
// Painted like the figures (art/kit.ts): two picture pixels to a game pixel, flat colour in three
// tones, light from the upper left, the deep indigo seam round each part and no outline. A prop's
// anchor is the middle of its foot, where it touches the floor. What lies flat on the floor has
// no seam and is anchored at its middle.
//
// TURNED TO THE GRID (Version 14.5; art/isokit.ts). The owner, 5 Oct 2026: "any sprite or doodad
// or whatever should always be seen at an angle". What is round here (the brazier, the barrel,
// the urn, the pillar's shaft) looks the same from every side and is as it was. What has sides was
// a drawing of its own front, and is now built on the grid: the chest (a box and a round lid, its
// lock on the side that looks down the screen to the left), the foot and the head of the pillar,
// the portal (an arch that stands along the grid, as thick as a wall), and the fallen wordsmith,
// who lies along the grid and not across the screen. For these the anchor is the middle of the
// tile they stand on.
//
// The colours say what a thing is, as the menus' do: GOLD is treasure (a chest's fittings, what
// glints in an open one), the portal's light is the cyan of what is the player's, wood is the
// plum of the heroes' leather, and a brazier burns the orange of an honest fire: not the pink of
// an enemy's (mkit.ts, FLAME).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { VAULT } from './ground';
import type { Theme } from './ground';
import { Iso, plainSide } from './isokit';
import { BONE, GRAIN, HI, INK, LO, PLUM, SKIN4, SPARK, TEAL, along, ball, compose, dim, hash, limb, lit, shear } from './kit';
import type { Ramp, Reach } from './kit';
import { IRON } from './mkit';

/** An honest fire: a brazier, a torch, a forge. Lit from inside, so five tones. */
export const EMBER: Ramp = ['#8a2a14', '#d0501a', '#ff8a2a', '#ffc860', '#fff3b0'];
/** The bed a fire lies on. */
export const COAL: Ramp = ['#1c0f1c', '#1c0f1c', '#5a1c1c', '#b03a18', '#b03a18'];
/** Treasure. */
export const GOLD: Ramp = ['#7a5210', '#7a5210', '#d09a20', '#ffd866', '#fff3b0'];
/** Fired clay with a pale glaze. */
const CLAY: Ramp = ['#4a3a6e', '#4a3a6e', '#8272b4', '#c0b4ea', '#c0b4ea'];

/** A colour part of the way from one to another. */
function blend(a: string, b: string, t: number): string {
  const n = (s: string, i: number): number => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  const h = (i: number): string => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t).toString(16).padStart(2, '0');
  return `#${h(0)}${h(1)}${h(2)}`;
}

/** Dressed stone in a theme's own tones: from the walls' shaded face to the edge of a lit stone, and one lighter. */
export function stoneOf(theme: Theme): Ramp {
  return [theme.shade[1], theme.shade[2], theme.lit[2], theme.lit[4], blend(theme.lit[4], '#ffffff', 0.24)];
}

/** Light and shade for something round and upright (a shaft, a barrel): a bright edge, then a band of each tone. */
export const ROUND_HI: Reach = [1, 4];
export const ROUND_LO: Reach = [1, 5];

/** Rows of a shape whose half width changes down it: laid on `l` for lit() to shade. */
export function column(l: Px, cx: number, top: number, bottom: number, half: (t: number) => number): void {
  for (let y = top; y <= bottom; y++) {
    const hw = half((y - top) / Math.max(1, bottom - top));
    l.rect(Math.round(cx - hw), y, Math.round(hw * 2), 1, INK);
  }
}

/** A tongue of flame: a teardrop with a bright heart, its tip leaning. */
export function tongue(p: Px, cx: number, base: number, h: number, w: number, lean: number, ramp: Ramp): void {
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.2 + t * 0.8)) ** 0.8 * (1 - t * 0.3));
    const mid = cx + lean * t * t;
    for (let x = Math.floor(mid - hw); x < Math.ceil(mid + hw); x++) {
      const d = Math.abs(x + 0.5 - mid) / hw;
      if (d > 1) continue;
      p.set(x, base - i, d < 0.45 && t < 0.45 ? ramp[4] : d < 0.75 && t < 0.72 ? ramp[3] : t > 0.86 ? ramp[1] : ramp[2]);
    }
  }
}

/** A band round something round, seen from a little above: it dips in the middle. `hw`: its half width. */
export function hoop(p: Px, cx: number, y: number, hw: number, rows: number, dip: number, ramp: Ramp): void {
  for (let x = Math.round(cx - hw); x < Math.round(cx + hw); x++) {
    const d = (x + 0.5 - cx) / hw;
    const yy = y + Math.round(dip * (1 - d * d));
    for (let k = 0; k < rows; k++) p.set(x, yy + k, d < -0.25 ? ramp[3] : d > 0.62 ? ramp[0] : ramp[2]);
  }
}

// ---------------------------------------------------------------------------------------------
// The brazier: an iron dish on three legs, a bed of coals, and a fire. 36 x 60; it stands at (18, 52).

const BRAZIER_FIRE: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  // each tongue: [where along the dish, height, half width, lean]
  [[0, 22, 6.5, 3], [-6, 12, 3.6, -2], [6, 9, 3, 2]],
  [[1, 19, 6.2, -2], [6, 14, 3.8, 3], [-6, 8, 3, -1]],
  [[0, 23, 6.4, -4], [-5, 10, 3.4, -3], [7, 12, 3.2, 1]],
  [[-1, 18, 6.2, 2], [-7, 14, 3.6, -1], [5, 9, 3.2, 3]],
];

function makeBrazier(frame: number): Sprite {
  const W = 36;
  const H = 60;
  const cx = 18;
  const foot = 52;
  const far = new Px(W, H);
  const legs = new Px(W, H);
  const dish = new Px(W, H);
  const fire = new Px(W, H);
  // three legs: one behind, two in front, and a ring that ties them
  limb(far, cx + 1, 34, cx + 2, foot - 6, 1.6, 1.4, dim(IRON));
  limb(legs, cx - 4, 34, cx - 10, foot - 1, 2, 1.6, IRON);
  limb(legs, cx + 4, 34, cx + 10, foot - 1, 2, 1.6, dim(IRON));
  hoop(legs, cx, 41, 7, 2, 1, IRON);
  legs.hline(cx - 13, foot - 1, 5, IRON[3]).hline(cx + 8, foot - 1, 5, IRON[2]);
  // the dish: wide at the rim, drawn in under it
  lit(dish, IRON, HI, LO, (l) => column(l, cx, 25, 36, (t) => 14 - 10 * t ** 1.5));
  // its rim, and the bed of coals seen over it; the iron under the rim is warm with the fire
  dish.ellipse(cx, 25, 14, 3.8, IRON[3]);
  dish.ellipse(cx, 25.4, 12, 2.8, COAL[0]);
  for (let x = cx - 10; x <= cx + 10; x++) {
    const n = hash(x, frame, 3);
    if (n < 0.7) dish.set(x, 25, n < 0.3 ? EMBER[2] : COAL[3]);
    if (hash(x, frame, 5) < 0.45) dish.set(x, 26, COAL[2]);
  }
  for (let x = cx - 9; x <= cx + 5; x++) if (dish.has(x, 29)) dish.set(x, 29, hash(x, 1, 7) < 0.8 ? COAL[2] : COAL[3]);
  for (const [dx, h, w, lean] of BRAZIER_FIRE[frame % BRAZIER_FIRE.length]) tongue(fire, cx + dx, 25, h, w, lean, EMBER);
  // a spark or two above it
  const sparks: ReadonlyArray<readonly [number, number]> = [[-6, 4], [7, 2], [-3, 1], [5, 5]];
  const [sx, sy] = sparks[frame % sparks.length];
  fire.set(cx + sx, sy + 1, EMBER[3]);
  const px = compose(far, [legs, dish], fire);
  const s = px.sprite(cx, foot, GRAIN);
  const lights: Light[] = [{ x: cx / GRAIN, y: 16 / GRAIN, r: 13 + (frame % 2), color: EMBER[2], a: 0.5 }];
  s.lights = lights;
  return s;
}

// ---------------------------------------------------------------------------------------------
// A trunk built on the grid: a box of planks and a round lid, bound in metal, its lock in the long
// side that looks down the screen to the left. The chest is one (plum wood bound in gold) and the
// town's stash another (dark wood bound in iron, longer).

export interface TrunkLook {
  /** Half its length and half its depth, in tiles. */
  a: number;
  b: number;
  /** The height of the box, and of the round of the lid above it, in picture pixels. */
  rim: number;
  rise: number;
  /** The wood of the box and of the lid; the metal it is bound in. */
  wood: Ramp;
  lid: Ramp;
  metal: Ramp;
  /** What is in the lock: a keyhole (null), or a stone of this colour. */
  stone: Ramp | null;
  /** Rows of the box's sides where one plank meets the next, counted down from its top. */
  planks: ReadonlyArray<number>;
}

/**
 * Paint a trunk on a canvas W x H whose tile's middle is at (ox, oy). Open, the lid is thrown back
 * (its inside turned to us) and the box is heaped with coin.
 */
export function trunk(W: number, H: number, ox: number, oy: number, k: TrunkLook, open: boolean): Px {
  const { a, b, rim, rise, wood, metal } = k;
  const box = new Px(W, H);
  const lid = new Px(W, H);
  const iron = new Px(W, H);
  const coin = new Px(W, H);
  const over = new Px(W, H);
  const ib = new Iso(box, ox, oy);
  const il = new Iso(lid, ox, oy);
  const im = new Iso(iron, ox, oy);
  const joint = (v: number): boolean => k.planks.includes(v);
  // the box: planks along its two sides
  ib.box(-a, -b, a, b, 0, rim, {
    top: () => INK,
    left: (u, v, _w, h) => (joint(v) ? INK : v >= h - 1 ? wood[0] : u === 0 || v === 0 ? wood[3] : wood[2]),
    right: (_u, v, _w, h) => (joint(v) ? INK : v >= h - 1 ? wood[0] : wood[1]),
  });
  /** A strap near each end: where along the trunk each lies, as a part of its length. */
  const E = 0.02; // the lid and the band stand this far proud of the box
  const along0 = (x: number): number => (x + a + E) / (2 * a + 2 * E);
  const straps: ReadonlyArray<readonly [number, number]> = [[-a + 0.1, -a + 0.22], [a - 0.22, a - 0.1]];
  const onStrap = (t: number): boolean => straps.some(([s0, s1]) => t >= along0(s0) && t < along0(s1));
  for (const [s0, s1] of straps) im.left(s0, s1, b, open ? 2 : 0, rim, (u, _v, w) => (u === 0 ? metal[3] : u >= w - 1 ? metal[0] : metal[2]));
  if (open) {
    // the lid stands behind, thrown back, its inside turned to us: dark wood in an edge of metal
    const tall = Math.round(2 * b * 34);
    il.slopeLeft(-a, a, -b, rim, -a, a, -b - 0.07, rim + tall, (t, u) => {
      if (t < 0.1 || t > 0.9 || u < 0.05 || u > 0.95) return t > 0.9 || u < 0.05 ? metal[3] : metal[2];
      return Math.abs(((u * 5) % 1) - 0.5) > 0.44 ? INK : wood[0];
    });
    // the dark inside, and coin heaped past the brim: a mound, laid in rounds from the brim up
    const ic = new Iso(coin, ox, oy);
    const ROUNDS = 7;
    for (let n = 0; n < ROUNDS; n++) {
      const g = 0.9 * Math.sqrt(1 - (n / ROUNDS) ** 2);
      ic.top(-a * g, -b * g, a * g, b * g, rim - 1 + n, (u, v) => {
        const r = hash(Math.floor(u * 14), Math.floor(v * 9), 5 + n);
        // (coins: each a lit top and a dark edge under it)
        return n === ROUNDS - 1 ? (r < 0.5 ? GOLD[4] : GOLD[3]) : r < 0.2 ? GOLD[0] : r < 0.62 ? GOLD[2] : GOLD[3];
      });
    }
    // the brim: a band of metal along the two sides we see
    im.left(-a - E, a + E, b, rim - 2, rim, plainSide(metal[2], metal[3]));
    im.right(a, -b, b, rim - 2, rim, plainSide(metal[1], metal[2]));
    // what glints above the heap
    for (const [gx, gy] of [ic.at(-a * 0.35, 0, rim + 12), ic.at(a * 0.4, -b * 0.3, rim + 10)]) {
      const x = Math.round(gx);
      const y = Math.round(gy);
      over.set(x, y, '#ffffff').set(x - 1, y, GOLD[4]).set(x + 1, y, GOLD[4]).set(x, y - 1, GOLD[4]).set(x, y + 1, GOLD[4]);
    }
  } else {
    // the lid: a low barrel of a top, a little wider than the box. What is seen of it is its nearer
    // half and a little past its crown, in bands from the brim up; and its end, a half round.
    const SWEEP = 128;
    const BANDS = 6;
    const tones = [k.lid[2], k.lid[2], k.lid[3], k.lid[3], k.lid[2], k.lid[1]];
    const bound = [metal[2], metal[2], metal[3], metal[4], metal[2], metal[0]];
    for (let n = 0; n < BANDS; n++) {
      const t0 = ((n / BANDS) * SWEEP * Math.PI) / 180;
      const t1 = (((n + 1) / BANDS) * SWEEP * Math.PI) / 180;
      const y0 = (b + E) * Math.cos(t0);
      const y1 = (b + E) * Math.cos(t1);
      const z0 = rim + rise * Math.sin(t0);
      const z1 = rim + rise * Math.sin(t1);
      il.slopeLeft(-a - E, a + E, y0, z0, -a - E, a + E, y1, z1, (_t, u) => (onStrap(u) ? null : tones[n]));
      im.slopeLeft(-a - E, a + E, y0, z0, -a - E, a + E, y1, z1, (_t, u) => (onStrap(u) ? bound[n] : null));
    }
    il.right(a + E, -b - E, b + E, rim, rim + rise, (u, v, w, h) => {
      const yy = 1 - ((u + 0.5) / w) * 2;
      const zz = (h - v - 0.5) / h;
      return zz <= Math.sqrt(Math.max(0, 1 - yy * yy)) ? (zz > Math.sqrt(Math.max(0, 1 - yy * yy)) - 0.16 ? k.lid[2] : k.lid[1]) : null;
    });
    // a band of metal along the lid's edge, and the lock
    im.left(-a - E, a + E, b + E, rim - 1, rim + 2, plainSide(metal[2], metal[3], metal[0]));
    im.right(a + E, -b - E, b + E, rim - 1, rim + 2, plainSide(metal[1], metal[2], metal[0]));
    im.left(-0.1, 0.1, b + E, rim - 7, rim + 4, (u, v, w, h) => (u === 0 || v === 0 ? metal[3] : u >= w - 1 || v >= h - 1 ? metal[0] : metal[2]));
    if (k.stone) {
      const st = k.stone;
      im.left(-0.045, 0.045, b + E, rim - 4, rim + 1, (u, v, w, h) => (u >= w - 1 || v >= h - 1 ? st[2] : st[3]));
      const [gx, gy] = im.at(-0.03, b + E, rim);
      over.set(Math.round(gx), Math.round(gy), '#ffffff').set(Math.round(gx) + 1, Math.round(gy), SPARK[3]);
    } else {
      im.left(-0.03, 0.03, b + E, rim - 4, rim + 1, (u, v, w) => (v < 2 || (u > 0 && u < w - 1) ? INK : null));
      const [gx, gy] = im.at(-0.08, b + E, rim + 3);
      over.set(Math.round(gx), Math.round(gy), metal[4]);
    }
  }
  // its feet: the two that are seen, under the corners of the long side
  im.left(-a, -a + 0.09, b, 0, 2, () => metal[2]);
  im.left(a - 0.09, a, b, 0, 2, () => metal[0]);
  return open ? compose(lid, [box, coin, iron], over) : compose(null, [box, lid, iron], over);
}

// The chest: plum wood bound in gold. Open, the lid is thrown back and it is heaped with coin.
// 56 x 64; its tile's middle is at (28, 48).

const CHEST: TrunkLook = { a: 0.42, b: 0.27, rim: 14, rise: 8, wood: PLUM, lid: PLUM, metal: GOLD, stone: null, planks: [7] };

function makeChest(open: boolean): Sprite {
  return trunk(56, 64, 28, 48, CHEST, open).sprite(28, 48, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The barrel: plum staves in two iron hoops. 32 x 46; it stands at (16, 40).

function makeBarrel(): Sprite {
  const W = 32;
  const H = 46;
  const cx = 16;
  const foot = 40;
  const top = 8;
  const body = new Px(W, H);
  const iron = new Px(W, H);
  const half = (t: number): number => 9.5 + 3.2 * Math.sin(t * Math.PI);
  lit(body, PLUM, ROUND_HI, ROUND_LO, (l) => {
    column(l, cx, top, foot - 3, half);
    l.ellipse(cx, foot - 3, 9.5, 2.8, INK);
  });
  // the gaps between staves follow its belly
  for (const f of [-0.56, -0.12, 0.34]) {
    for (let y = top + 3; y < foot - 2; y++) {
      const x = Math.round(cx + f * half((y - top) / (foot - 3 - top)) - 0.5);
      if (body.has(x, y)) body.set(x, y, PLUM[0]);
    }
  }
  // its head, seen from a little above
  body.ellipse(cx, top + 0.5, 9.5, 3.2, PLUM[0]);
  body.ellipse(cx, top, 9, 2.8, PLUM[3]);
  body.ellipse(cx, top + 0.3, 6.6, 1.7, PLUM[2]);
  for (const t of [0.2, 0.76]) hoop(iron, cx, Math.round(top + t * (foot - 3 - top)), half(t) + 0.5, 3, 1.6, IRON);
  return compose(null, [body, iron], null).sprite(cx, foot, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The urn: pale glazed clay with a teal band. 28 x 40; it stands at (14, 34).

function makeUrn(): Sprite {
  const W = 28;
  const H = 40;
  const cx = 14;
  const foot = 34;
  const top = 6;
  const body = new Px(W, H);
  const band = new Px(W, H);
  // lip, neck, shoulder, belly, foot
  const half = (t: number): number =>
    t < 0.08 ? 5.4 : t < 0.2 ? 3.4 : t < 0.5 ? 3.4 + 6.4 * Math.sin(((t - 0.2) / 0.3) * (Math.PI / 2)) : t > 0.94 ? 5.6 : 9.8 - 5.4 * ((t - 0.5) / 0.44) ** 1.6;
  lit(body, CLAY, [0, 3], [0, 4], (l) => column(l, cx, top, foot - 1, half));
  body.ellipse(cx, top + 0.4, 3.6, 1.2, INK);
  hoop(band, cx, top + 13, half(0.48), 2, 1.2, TEAL);
  hoop(band, cx, top + 17, half(0.62) - 0.4, 1, 1.2, [TEAL[0], TEAL[0], TEAL[2], TEAL[2], TEAL[2]]);
  // (the bands are part of the glaze: only where there is clay)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (band.has(x, y) && body.has(x, y)) body.set(x, y, band.get(x, y));
  return compose(null, [body], null).sprite(cx, foot, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The pillar: a round shaft of three drums between a foot and a head, in the stone of the walls.
// The shaft is round and looks the same from every side; its foot and the slab of its head are
// square, and stand on the grid (Version 14.5: they were flat oblongs). 40 x 100; its tile's
// middle is at (20, 84).

function makePillar(theme: Theme): Sprite {
  const W = 40;
  const H = 100;
  const cx = 20;
  const oy = 84;
  const stone = stoneOf(theme);
  const shaft = new Px(W, H);
  const blocks = new Px(W, H);
  const head = new Px(W, H);
  /** Half the side of the foot and of the head's slab, in tiles; and how high each thing is. */
  const SQ = 0.22;
  const FOOT = 9;
  const TOP = 64; // where the shaft ends
  const SLAB = 69;
  const litSide = plainSide(theme.lit[2], theme.lit[4], theme.lit[1]);
  const shadeSide = plainSide(theme.shade[2], theme.shade[4], theme.shade[1]);
  // the foot: a block, and a ring on it
  new Iso(blocks, cx, oy).box(-SQ, -SQ, SQ, SQ, 0, FOOT, { top: () => stone[3], left: litSide, right: shadeSide });
  lit(blocks, stone, [1, 3], [1, 4], (l) => column(l, cx, oy - FOOT - 5, oy - FOOT, (t) => 10.5 + 2 * Math.sin(t * Math.PI)));
  // the shaft
  lit(shaft, stone, ROUND_HI, ROUND_LO, (l) => l.rect(cx - 9, oy - TOP, 18, TOP - FOOT - 3, INK));
  // the joints between its drums; and the head's shadow on it
  for (let y = oy - TOP + 17; y < oy - FOOT - 9; y += 17) {
    for (let x = cx - 9; x < cx + 9; x++) shaft.set(x, y + Math.round(1.2 * (1 - ((x + 0.5 - cx) / 9) ** 2)), theme.lit[0]);
  }
  shaft.rect(cx - 9, oy - TOP, 18, 3, stone[0]);
  // the head: the swelling that carries it, and a slab
  lit(head, stone, [1, 3], [1, 4], (l) => column(l, cx, oy - SLAB - 1, oy - TOP + 1, (t) => 13 - 3 * t));
  new Iso(head, cx, oy).box(-SQ, -SQ, SQ, SQ, SLAB, SLAB + 6, { top: (u, v) => (u < 0.1 || v < 0.1 ? stone[3] : stone[4]), left: litSide, right: shadeSide });
  return compose(null, [blocks, shaft, head], null).sprite(cx, oy, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The portal: an arch of the walls' stone, and in it (when it is open) a field of light. It
// stands along the grid (Version 14.5: it was a drawing of its own front, set down square to the
// screen): its face looks down the screen to the left, it is as thick as a wall, and what is seen
// of that thickness is its right-hand side, the top of its round, and the inside of its left
// jamb. A little wider than its tile. 64 x 96; its tile's middle is at (32, 78).

function makePortal(theme: Theme, frame: number): Sprite {
  const W = 64;
  const H = 96;
  const ox = 32;
  const oy = 78;
  const stone = stoneOf(theme);
  const open = frame >= 0;
  // --- its face, drawn square on: an arch on a sill. (Seen along the grid it is narrower than it is drawn here by the floor's own measure.) ---
  const FW = 46;
  const FH = 76;
  const fcx = 23;
  const SILL = 4;
  const SPRING = 48; // how high the round begins
  const R = 21;
  const r = 14;
  const fcy = FH - SPRING;
  const inArch = (x: number, y: number, rad: number): boolean => (y >= fcy ? Math.abs(x + 0.5 - fcx) <= rad : (x + 0.5 - fcx) ** 2 + (y + 0.5 - fcy) ** 2 <= rad * rad);
  const face = new Px(FW, FH);
  lit(face, stone, [0, 3], [0, 3], (l) => {
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (inArch(x, y, R) && !inArch(x, y, r)) l.set(x, y, INK);
    // the sill it stands on
    l.rect(fcx - R - 2, FH - SILL, R * 2 + 4, SILL, INK);
  });
  // the joints between its stones: across the jambs, and fanned round the top
  for (let y = fcy + 8; y < FH - SILL - 1; y += 11) for (let x = 0; x < FW; x++) if (face.has(x, y) && Math.abs(x + 0.5 - fcx) > r) face.set(x, y, theme.lit[0]);
  for (let k = 0; k <= 6; k++) {
    const a = Math.PI + (k / 6) * Math.PI;
    for (let d = r; d <= R; d += 0.5) {
      const x = Math.round(fcx + Math.cos(a) * d - 0.5);
      const y = Math.round(fcy + Math.sin(a) * d - 0.5);
      if (face.has(x, y) && y < fcy) face.set(x, y, theme.lit[0]);
    }
  }
  // what is seen through it: light that climbs, or the dark
  const light = new Px(FW, FH);
  for (let y = 0; y < FH - SILL; y++) {
    for (let x = 0; x < FW; x++) {
      if (!inArch(x, y, r)) continue;
      if (!open) {
        light.set(x, y, hash(x >> 1, y >> 1, 4) < 0.08 ? theme.shade[1] : INK);
        continue;
      }
      // bands that rise, bent toward the middle, with a bright heart
      const dx = (x + 0.5 - fcx) / r;
      const wave = Math.sin((y + frame * 4) * 0.42 + dx * dx * 2.6);
      const heart = 1 - Math.min(1, Math.hypot(dx, (y - (fcy + 14)) / 30));
      const v = wave * 0.5 + heart * 1.3;
      light.set(x, y, v > 1.25 ? SPARK[4] : v > 0.7 ? SPARK[3] : v > 0.1 ? SPARK[2] : SPARK[0]);
    }
  }
  // the stone at the crown of the arch carries a gem: alight when the way is open
  const gem = new Px(FW, FH);
  gem.rect(fcx - 2, fcy - R + 2, 4, 5, open ? SPARK[2] : theme.shade[0]);
  if (open) gem.rect(fcx - 1, fcy - R + 3, 2, 2, SPARK[4]);
  // --- set on the grid ---
  const arch = new Px(W, H);
  const field = new Px(W, H);
  const over = new Px(W, H);
  /** Half its thickness, in tiles; where its face begins along the grid; and a column of the face as a place along it. */
  const D = 0.13;
  const X0 = -FW / 64;
  const xOf = (col: number): number => X0 + col / 32;
  const iso = new Iso(arch, ox, oy);
  // the light, in the middle of its thickness
  new Iso(field, ox, oy).left(X0, X0 + FW / 32, 0, 0, FH, (u, v) => light.get(u, v));
  // the inside of the left jamb, this side of the light; and the inside of the round above it, as far as it faces us
  iso.right(xOf(fcx - r), 0, D, SILL, SPRING, plainSide(theme.shade[2], null, theme.shade[1]));
  for (let a = 180; a > 132; a -= 12) {
    const a0 = (a * Math.PI) / 180;
    const a1 = ((a - 12) * Math.PI) / 180;
    const p0: [number, number] = [xOf(fcx + r * Math.cos(a0)), SPRING + r * Math.sin(a0)];
    const p1: [number, number] = [xOf(fcx + r * Math.cos(a1)), SPRING + r * Math.sin(a1)];
    iso.quad(iso.at(p0[0], D, p0[1]), iso.at(p0[0], 0, p0[1]), iso.at(p1[0], 0, p1[1]), iso.at(p1[0], D, p1[1]), () => theme.shade[1]);
  }
  // its right-hand side, from the floor to where the round begins
  iso.right(xOf(fcx + R), -D, D, 0, SPRING, plainSide(theme.shade[2], null, theme.shade[1]));
  iso.right(xOf(fcx + R + 2), -D, D, 0, SILL, plainSide(theme.shade[3], theme.shade[4], theme.shade[1]));
  // the top of the round, as far over as it can be seen: lightest at its crown
  for (let a = 0; a < 128; a += 8) {
    const a0 = (a * Math.PI) / 180;
    const a1 = ((a + 8) * Math.PI) / 180;
    const p0: [number, number] = [xOf(fcx + R * Math.cos(a0)), SPRING + R * Math.sin(a0)];
    const p1: [number, number] = [xOf(fcx + R * Math.cos(a1)), SPRING + R * Math.sin(a1)];
    const tone = a < 24 ? theme.shade[2] : a < 56 ? theme.shade[3] : a < 104 ? stone[3] : stone[2];
    iso.quad(iso.at(p0[0], D, p0[1]), iso.at(p0[0], -D, p0[1]), iso.at(p1[0], -D, p1[1]), iso.at(p1[0], D, p1[1]), () => tone);
  }
  // its face
  iso.left(X0, X0 + FW / 32, D, 0, FH, (u, v) => face.get(u, v));
  new Iso(over, ox, oy).left(X0, X0 + FW / 32, D, 0, FH, (u, v) => gem.get(u, v));
  const s = compose(field, [arch], over).sprite(ox, oy, GRAIN);
  if (open) {
    const [lx, ly] = iso.at(0, 0, SPRING - 16);
    s.lights = [{ x: lx / GRAIN, y: ly / GRAIN, r: 26 + (frame % 2), color: SPARK[2], a: 0.42 }];
  }
  return s;
}

// ---------------------------------------------------------------------------------------------
// What lies on the floor. No seam; anchored at the middle. 36 x 20 each.

const FW = 36;
const FH = 20;

/** Bone that has lain in the dark: the skeletons' bone, without its brightest tone. */
const OLD_BONE: Ramp = [BONE[0], BONE[0], '#8f82c4', '#c4bae8', '#e4dcfa'];

/** A long bone, two pixels thick, knobbed at both ends, with its shadow under it. */
function longBone(p: Px, shadow: string, x0: number, y0: number, x1: number, y1: number): void {
  p.line(x0, y0 + 2, x1, y1 + 2, shadow);
  p.line(x0, y0 + 1, x1, y1 + 1, OLD_BONE[2]);
  p.line(x0, y0, x1, y1, OLD_BONE[3]);
  for (const [x, y] of [[x0, y0], [x1, y1]] as const) {
    p.rect(x - 1, y - 1, 3, 3, OLD_BONE[3]);
    p.set(x - 1, y - 1, OLD_BONE[4]).set(x + 1, y + 1, OLD_BONE[2]);
  }
}

function skull(p: Px, shadow: string, x: number, y: number): void {
  p.ellipse(x + 1, y + 3, 5, 3.4, shadow);
  ball(p, x, y, 4.6, 4.2, OLD_BONE);
  p.rect(x - 2, y + 3, 5, 3, OLD_BONE[2]);
  p.rect(x - 3, y, 2, 2, INK).rect(x + 1, y, 2, 2, INK);
  p.set(x - 1, y + 3, INK).set(x + 1, y + 5, INK).set(x - 1, y + 5, INK);
}

function makeBones(theme: Theme, variant: number): Sprite {
  const p = new Px(FW, FH);
  const sh = theme.mortar;
  if (variant === 0) {
    // a skull, and two long bones fallen across each other
    longBone(p, sh, 16, 13, 31, 6);
    longBone(p, sh, 18, 5, 30, 14);
    skull(p, sh, 8, 8);
  } else if (variant === 1) {
    // a rib cage fallen in on itself
    longBone(p, sh, 5, 12, 30, 7);
    for (let k = 0; k < 5; k++) {
      const x = 9 + k * 4;
      const y = 11 - Math.round(k * 0.9);
      p.line(x, y + 1, x + 2, y - 5, OLD_BONE[2]);
      p.line(x + 1, y + 1, x + 3, y - 5, OLD_BONE[3]);
      p.line(x, y + 3, x - 1, y + 6, OLD_BONE[2]);
      p.set(x + 3, y - 6, OLD_BONE[4]);
    }
  } else {
    longBone(p, sh, 4, 8, 15, 12);
    longBone(p, sh, 19, 5, 30, 4);
    longBone(p, sh, 17, 14, 27, 11);
  }
  return p.sprite(FW / 2, FH / 2, GRAIN);
}

/** A lump of something broken: a shape with corners, lit and shaded like the figures, its shadow under it. (Exported for the mock-up of decorations, art/decor.ts: the bits about a broken flagstone.) */
export function lump(p: Px, ramp: Ramp, shadow: string, x: number, y: number, w: number, h: number, k: number): void {
  const a = 1 + Math.round(hash(k, 1, 3) * (w / 3));
  const b = 1 + Math.round(hash(k, 2, 3) * (w / 4));
  const c = Math.round(hash(k, 3, 3) * (h / 3));
  p.ellipse(x + w / 2 + 1, y + h, w / 2 + 1, 1.6, shadow);
  lit(p, ramp, [1, 2], [0, 2], (l) => l.poly([[x, y + 1 + c], [x + a, y], [x + w - b, y], [x + w, y + 2], [x + w - 1, y + h], [x + 1, y + h]], INK));
}

/** [x, y, width, height] of each lump. */
type Lumps = ReadonlyArray<readonly [number, number, number, number]>;

const RUBBLE: ReadonlyArray<Lumps> = [
  [[5, 5, 11, 8], [19, 3, 7, 5], [22, 10, 9, 6], [14, 14, 4, 3]],
  [[8, 3, 8, 6], [16, 8, 12, 8], [27, 5, 5, 4], [4, 11, 6, 5]],
  [[11, 4, 14, 10], [26, 10, 6, 5], [4, 6, 5, 4], [7, 13, 4, 3]],
];

function makeRubble(theme: Theme, variant: number): Sprite {
  const p = new Px(FW, FH);
  const stone = stoneOf(theme);
  RUBBLE[variant % RUBBLE.length].forEach(([x, y, w, h], k) => lump(p, stone, theme.mortar, x, y, w, h, k + variant * 7));
  return p.sprite(FW / 2, FH / 2, GRAIN);
}

/** What is left of a barrel: staves, and a hoop sprung open. */
function makeStaves(theme: Theme, variant: number): Sprite {
  const p = new Px(FW, FH);
  // each stave: [x, y] of one end, [x, y] of the other
  const planks: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
    [[4, 12, 17, 7], [12, 3, 25, 7], [16, 15, 30, 11], [7, 5, 11, 13]],
    [[3, 6, 16, 4], [13, 14, 27, 8], [20, 3, 32, 8], [8, 16, 19, 14]],
  ];
  for (const [x0, y0, x1, y1] of planks[variant % planks.length]) {
    p.line(x0 + 1, y0 + 3, x1 + 1, y1 + 3, theme.mortar);
    lit(p, PLUM, [1, 1], [0, 1], (l) => l.poly([[x0, y0], [x1, y1], [x1, y1 + 3], [x0, y0 + 3]], INK));
    p.set(x0, y0 + 1, PLUM[0]).set(x0, y0 + 2, PLUM[0]);
  }
  // the hoop: an arc of iron
  for (let a = 0; a < Math.PI * 1.3; a += 0.1) {
    const x = (variant ? 9 : 27) + Math.cos(a + 2.4) * 5.5;
    const y = (variant ? 10 : 8) + Math.sin(a + 2.4) * 3;
    p.set(x, y + 2, theme.mortar);
    p.set(x, y + 1, IRON[2]);
    p.set(x, y, a < 1.5 ? IRON[3] : IRON[2]);
  }
  return p.sprite(FW / 2, FH / 2, GRAIN);
}

/** What is left of an urn: shards of pale clay, one with the band still on it. */
function makeShards(theme: Theme, variant: number): Sprite {
  const p = new Px(FW, FH);
  const shards: ReadonlyArray<Lumps> = [
    [[7, 7, 8, 6], [17, 4, 6, 4], [19, 11, 9, 5], [13, 14, 4, 2]],
    [[10, 4, 7, 5], [16, 10, 10, 6], [6, 11, 6, 4], [25, 7, 4, 3]],
  ];
  shards[variant % shards.length].forEach(([x, y, w, h], k) => {
    lump(p, CLAY, theme.mortar, x, y, w, h, k + 20 + variant * 5);
    if (k === 0) for (let i = 1; i < w - 1; i++) if (p.has(x + i, y + 3)) p.set(x + i, y + 3, TEAL[3]);
  });
  return p.sprite(FW / 2, FH / 2, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The wordsmith who came this way before: face down on the floor, one arm reaching for a book.
// Not yet searched, the book is shut and a glint sits on it; searched, it lies open, its pages
// bare, and the teal is duller. They lie ALONG THE GRID (Version 14.5), head up the screen to the
// left and feet down it to the right: painted lying level, as before, and then every column of the
// picture slid down the screen by half as far as it is across, which is how a thing that lies on
// this floor along one of its lines is seen. 64 x 72; anchored at (32, 38), the middle of the
// floor it lies on.

const SKIN: Ramp = [SKIN4[0], SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3]];

function makeFallen(theme: Theme, searched: boolean): Sprite {
  const W = 64;
  const H = 72;
  /** How far down the taller canvas the level painting sits (it was 40 high, anchored at row 22). */
  const DY = 16;
  const robe = PLUM;
  const hood: Ramp = searched ? dim(TEAL) : TEAL;
  const under = new Px(W, H - DY * 2);
  const legs = new Px(W, H - DY * 2);
  const body = new Px(W, H - DY * 2);
  const head = new Px(W, H - DY * 2);
  const arm = new Px(W, H - DY * 2);
  const book = new Px(W, H - DY * 2);
  const over = new Px(W, H - DY * 2);
  // the shadow it lies in
  under.ellipse(33, 24, 27, 8, theme.mortar);
  under.ellipse(13, 32, 9, 4, theme.mortar);
  // boots, and the legs under the robe's hem: sprawled
  limb(legs, 48, 17, 57, 14, 3, 2.6, dim(robe));
  limb(legs, 48, 25, 56, 28, 3, 2.6, robe);
  ball(legs, 58, 13, 3, 3.4, IRON);
  ball(legs, 57, 28, 3, 3.4, IRON);
  // the arm flung out past the head on the far side
  limb(legs, 22, 15, 14, 9, 2.4, 2, dim(robe));
  ball(legs, 12, 8, 2, 2, SKIN);
  // the robe: narrow at the waist, spread at the hem, a sash round it
  lit(body, robe, HI, LO, (l) => l.poly([[20, 15], [25, 12], [34, 15], [49, 10], [52, 21], [49, 32], [34, 28], [25, 30], [19, 22]], INK));
  for (let y = 10; y < 33; y++) for (const x of [33, 34]) if (body.has(x, y)) body.set(x, y, x === 33 ? hood[3] : hood[2]);
  for (let y = 10; y < 33; y++) {
    const x = 49 + Math.round(2.4 * (1 - ((y - 21) / 11) ** 2));
    if (body.has(x, y)) body.set(x, y, hood[2]);
    if (body.has(x - 1, y)) body.set(x - 1, y, hood[3]);
  }
  // (folds down the skirt)
  for (const [x0, y0, x1, y1] of [[37, 17, 47, 14], [37, 25, 46, 28]] as const) body.line(x0, y0, x1, y1, robe[0]);
  // the hood, and the mantle over the shoulders
  ball(head, 21, 21, 6, 7.5, hood, 0.1);
  ball(head, 12, 20, 6.6, 6.2, hood);
  head.set(5, 17, hood[3]).set(4, 16, hood[2]);
  // the arm that reaches past the head, and its hand on the book
  limb(arm, 22, 27, 15, 32, 2.6, 2.2, robe);
  ball(arm, 13, 32, 2.2, 2, SKIN);
  // the book
  if (searched) {
    book.poly([[2, 29], [9, 27], [17, 29], [17, 36], [9, 35], [2, 37]], OLD_BONE[2]);
    book.line(9, 27, 9, 35, OLD_BONE[0]);
    book.line(2, 37, 9, 35, hood[0]).line(9, 35, 17, 36, hood[0]);
    book.line(3, 30, 8, 29, OLD_BONE[3]).line(10, 29, 16, 30, OLD_BONE[3]);
  } else {
    lit(book, TEAL, HI, LO, (l) => l.poly([[2, 29], [11, 27], [12, 34], [3, 36]], INK));
    book.line(3, 36, 12, 34, OLD_BONE[3]).line(3, 37, 12, 35, OLD_BONE[2]);
    book.rect(6, 30, 2, 3, GOLD[3]);
    // a small bright glint on its corner: there is something here to find
    over.set(3, 28, '#ffffff').set(2, 28, SPARK[3]).set(4, 28, SPARK[3]).set(3, 27, SPARK[3]).set(3, 29, SPARK[3]);
  }
  // set along the grid: each layer moved down the taller canvas and its columns slid
  const lie = along(32, 1);
  const set = (level: Px): Px => {
    const moved = new Px(W, H);
    moved.blit(level, 0, DY);
    return shear(moved, lie, new Px(W, H));
  };
  return compose(set(under), [legs, body, head, book, arm].map(set), set(over)).sprite(32, 22 + DY, GRAIN);
}

// ---------------------------------------------------------------------------------------------

/** The dungeon's own props, by the names the game knows them by (render.ts: PropArt). */
export interface DungeonProps {
  brazier: Sprite[];
  chest: Sprite;
  chestOpen: Sprite;
  barrel: Sprite;
  urn: Sprite;
  pillar: Sprite;
  bones: Sprite[];
  rubble: Sprite[];
  /** What a broken barrel leaves, and a broken urn. */
  staves: Sprite[];
  shards: Sprite[];
  portal: Sprite[];
  portalOff: Sprite;
  /** The wordsmith who fell here: not yet searched, and searched. */
  fallen: Sprite;
  fallenSearched: Sprite;
}

export function makeDungeonProps(theme: Theme = VAULT): DungeonProps {
  return {
    brazier: [0, 1, 2, 3].map(makeBrazier),
    chest: makeChest(false),
    chestOpen: makeChest(true),
    barrel: makeBarrel(),
    urn: makeUrn(),
    pillar: makePillar(theme),
    bones: [0, 1, 2].map((v) => makeBones(theme, v)),
    rubble: [0, 1, 2].map((v) => makeRubble(theme, v)),
    staves: [0, 1].map((v) => makeStaves(theme, v)),
    shards: [0, 1].map((v) => makeShards(theme, v)),
    portal: [0, 1, 2, 3].map((f) => makePortal(theme, f)),
    portalOff: makePortal(theme, -1),
    fallen: makeFallen(theme, false),
    fallenSearched: makeFallen(theme, true),
  };
}
