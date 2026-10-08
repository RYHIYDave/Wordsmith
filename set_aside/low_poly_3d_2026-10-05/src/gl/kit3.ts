// What a place is built of and furnished with, in low-poly 3D: cut stone (slabs, blocks, steps),
// and the things that stand in a tomb. The colours are the pixel art's own (art/ground.ts,
// art/props.ts, art/kit.ts), a little lighter: here the light is real and does the darkening.
//
// Sizes are in tiles. A hero is about one and a half tiles tall.

import { Mesh, ball, blend, box, hex, lathe, rnd, tone } from './mesh';
import type { Paint, RGB } from './mesh';
import { mats, rotX, rotY, rotZ, scale, translate } from './vec';
import type { M4 } from './vec';

export const C = {
  // the vault's stone: floor, wall, dressed stone (pillars, steps, tombs), the dark between stones
  floor: [hex('#35327f'), hex('#3f3c8e'), hex('#4a479c'), hex('#5653aa')] as RGB[],
  wall: [hex('#463f96'), hex('#5049a4'), hex('#5a53b0'), hex('#655ebc')] as RGB[],
  dressed: [hex('#6660bf'), hex('#746ecb'), hex('#827cd6')] as RGB[],
  gap: hex('#100e2a'),
  earth: hex('#1c1630'),
  // iron, wood (the plum of the heroes' leather), gold, bone, clay
  iron: hex('#4a4a66'),
  ironDark: hex('#2c2c44'),
  wood: hex('#6a3a5c'),
  woodDark: hex('#4a2644'),
  gold: hex('#e0a828'),
  goldLight: hex('#ffd866'),
  bone: hex('#e8e0d0'),
  boneShade: hex('#b0a4b8'),
  clay: hex('#8a7abc'),
  // fire: its bed, its body, its heart
  coal: hex('#5a1c1c'),
  ember: hex('#ff7a22'),
  flame: hex('#ffc24a'),
  heart: hex('#fff0a8'),
  // cloth
  crimson: hex('#a02a4a'),
  crimsonDark: hex('#6a1a38'),
  teal: hex('#22b0a0'),
  tealDark: hex('#13706e'),
  // what is the player's glows cyan; what is an enemy's, pink
  spark: hex('#5fe8f0'),
  sparkWhite: hex('#d8fffa'),
  foe: hex('#ff4a90'),
  moss: hex('#3f8a5a'),
  water: hex('#3a78c8'),
};

export const at = (x: number, y: number, z = 0, turn = 0): M4 => (turn ? mats(translate(x, y, z), rotZ(turn)) : translate(x, y, z));

/** A cut stone: a box whose top edges are taken off (`bevel` wide), so that every stone catches the light along its rim. */
export function stone(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, bevel: number, paint: Paint): Mesh {
  const m = new Mesh();
  const b = Math.min(bevel, (x1 - x0) / 3, (y1 - y0) / 3);
  const zt = z1 - b;
  const top = paint.top ?? paint.side;
  const lip = blend(top, [1, 1, 1], 0.08);
  m.quad([x0 + b, y0 + b, z1], [x1 - b, y0 + b, z1], [x1 - b, y1 - b, z1], [x0 + b, y1 - b, z1], top);
  m.quad([x0, y0, zt], [x1, y0, zt], [x1 - b, y0 + b, z1], [x0 + b, y0 + b, z1], lip);
  m.quad([x1, y1, zt], [x0, y1, zt], [x0 + b, y1 - b, z1], [x1 - b, y1 - b, z1], lip);
  m.quad([x1, y0, zt], [x1, y1, zt], [x1 - b, y1 - b, z1], [x1 - b, y0 + b, z1], lip);
  m.quad([x0, y1, zt], [x0, y0, zt], [x0 + b, y0 + b, z1], [x0 + b, y1 - b, z1], lip);
  m.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, zt], [x0, y0, zt], paint.side);
  m.quad([x1, y1, z0], [x0, y1, z0], [x0, y1, zt], [x1, y1, zt], paint.side);
  m.quad([x1, y0, z0], [x1, y1, z0], [x1, y1, zt], [x1, y0, zt], paint.side);
  m.quad([x0, y1, z0], [x0, y0, z0], [x0, y0, zt], [x0, y1, zt], paint.side);
  return m;
}

/** Which tone of a stone's few a place gets: steady for the same place. */
const pick = (tones: readonly RGB[], a: number, b: number, c = 0): RGB => tones[Math.floor(rnd(a, b, c) * tones.length) % tones.length];

export interface FloorOpts {
  /** Tiles that have no floor at all (a pit, a stair, what stands on its own base). */
  skip?: (x: number, y: number) => boolean;
  /** How high the floor lies. */
  z?: number;
  seed?: number;
  /** How many stones in ten are broken or gone (0..1 each). */
  cracked?: number;
  gone?: number;
  tones?: readonly RGB[];
  /** No bed under the stones (whoever asks lays one, where the floor is not a plain rectangle). */
  bare?: boolean;
  /** Tiles whose stone is always whole (something stands on it). */
  whole?: (x: number, y: number) => boolean;
}

/**
 * A floor of flagstones over the tiles from (x0, y0) to (x1, y1): laid in runs of unequal
 * length, no two quite level, here and there one cracked across, sunk, or gone (the earth shows,
 * and what is left of the stone lies about).
 */
export function floor(x0: number, y0: number, x1: number, y1: number, o: FloorOpts = {}): Mesh {
  const m = new Mesh();
  const z = o.z ?? 0;
  const seed = o.seed ?? 1;
  const tones = o.tones ?? C.floor;
  const GAP = 0.035;
  for (let y = y0; y < y1; y++) {
    let x = x0;
    while (x < x1) {
      // a stone is one tile deep and one or two long (two, only where both tiles are there to be covered)
      const two = x + 1 < x1 && rnd(x, y, seed) < 0.34 && !(o.skip && (o.skip(x, y) || o.skip(x + 1, y)));
      const w = two ? 2 : 1;
      if (o.skip && o.skip(x, y)) {
        x += 1;
        continue;
      }
      const r = o.whole && (o.whole(x, y) || (two && o.whole(x + 1, y))) ? 1 : rnd(x, y, seed + 11);
      const col = pick(tones, x, y, seed + 3);
      const lift = (rnd(x, y, seed + 5) - 0.5) * 0.05;
      if (r < (o.gone ?? 0)) {
        // gone: bare earth a hand lower, and a piece or two of the stone left in the hole
        m.add(box(x + GAP, y + GAP, z - 0.3, x + w - GAP, y + 1 - GAP, z - 0.12, { side: C.earth, top: C.earth }));
        m.add(rock(0.2, col, x * 7 + y), mats(translate(x + 0.3 + rnd(x, y, 21) * 0.3, y + 0.3 + rnd(x, y, 22) * 0.4, z - 0.12), rotZ(rnd(x, y, 23) * 360)));
        if (w === 2 || rnd(x, y, 24) < 0.5) m.add(rock(0.14, tone(col, 0.9), x * 3 + y * 5), mats(translate(x + w - 0.4, y + 0.6, z - 0.12), rotZ(rnd(x, y, 25) * 360)));
      } else if (r < (o.gone ?? 0) + (o.cracked ?? 0)) {
        // cracked across: two pieces, one sunk and tipped
        const cut = 0.35 + rnd(x, y, seed + 13) * 0.3;
        m.add(stone(x + GAP, y + GAP, z - 0.3, x + w * cut - GAP * 0.4, y + 1 - GAP, z + lift, 0.03, { side: tone(col, 0.6), top: col }));
        const sunk = stone(-w * (1 - cut) * 0.5 + GAP * 0.4, -0.5 + GAP, -0.3, w * (1 - cut) * 0.5 - GAP, 0.5 - GAP, 0, 0.03, { side: tone(col, 0.6), top: tone(col, 0.92) });
        m.add(sunk, mats(translate(x + w * cut + w * (1 - cut) * 0.5, y + 0.5, z - 0.05), rotY((rnd(x, y, 31) - 0.5) * 9), rotX((rnd(x, y, 32) - 0.5) * 9)));
      } else {
        m.add(stone(x + GAP, y + GAP, z - 0.3, x + w - GAP, y + 1 - GAP, z + lift, 0.03, { side: tone(col, 0.6), top: col }));
      }
      x += w;
    }
  }
  // the bed the stones lie in: the dark seen between them
  if (!o.bare) m.add(box(x0, y0, z - 0.34, x1, y1, z - 0.07, { side: C.gap, top: C.gap }));
  return m;
}

/** A broken piece of stone: a few facets, lying on the ground at the origin. */
export function rock(r: number, col: RGB, seed: number): Mesh {
  const m = new Mesh();
  m.add(ball(r * (0.8 + rnd(seed, 1) * 0.5), r * (0.7 + rnd(seed, 2) * 0.5), r * (0.45 + rnd(seed, 3) * 0.3), { side: col, vary: 0.14, seed }), translate(0, 0, r * 0.3));
  return m;
}

export interface WallOpts {
  seed?: number;
  /** How thick, and how high. */
  thick?: number;
  high?: number;
  tones?: readonly RGB[];
  /** No coping stones along the top (a wall that carries something). */
  plain?: boolean;
}

/**
 * A wall of coursed stone along the x axis, from x = 0 to `long`, its face at y = 0 and its body
 * behind that (toward -y): stones of unequal length, each standing a finger in or out of line,
 * the joints of one course over the middles of the one below, a footing course that stands
 * forward, and coping stones on top. Move it into place with a matrix.
 */
export function wall(long: number, o: WallOpts = {}): Mesh {
  const m = new Mesh();
  const seed = o.seed ?? 1;
  const thick = o.thick ?? 0.7;
  const high = o.high ?? 2.3;
  const tones = o.tones ?? C.wall;
  // (courses about 0.46 high, as many as make up the wall's height exactly)
  const rows = Math.max(1, Math.round(high / 0.46));
  const course = high / rows;
  for (let r = 0; r < rows; r++) {
    const z0 = r * course;
    const z1 = Math.min(high, z0 + course);
    let x = 0;
    let first = true;
    while (x < long - 0.01) {
      // (the first stone of every other course is a short one, so that the joints do not line up)
      let w = first && r % 2 === 1 ? 0.45 + rnd(r, seed, 2) * 0.2 : 0.75 + rnd(Math.round(x * 10), r, seed) * 0.6;
      if (x + w > long - 0.3) w = long - x;
      first = false;
      const out = (r === 0 ? 0.07 : 0) + (rnd(Math.round(x * 10), r, seed + 5) - 0.5) * 0.05;
      const col = pick(tones, Math.round(x * 10), r, seed + 9);
      const g = 0.018;
      // (a wall's stones are bevelled toward the room: built lying down and stood up)
      m.add(block(w - g * 2, z1 - z0 - g * 2, thick + out, 0.03, col), translate(x + g, out, z0 + g));
      x += w;
    }
  }
  // the dark in the joints
  m.add(box(0, -thick + 0.02, 0, long, -0.03, high - 0.02, { side: C.gap }));
  if (!o.plain) {
    let x = 0;
    while (x < long - 0.01) {
      let w = 0.9 + rnd(Math.round(x * 10), 77, seed) * 0.5;
      if (x + w > long - 0.4) w = long - x;
      const col = pick(C.dressed, Math.round(x * 10), 78, seed);
      m.add(stone(x + 0.015, -thick - 0.04, high, x + w - 0.015, 0.09, high + 0.16, 0.04, { side: tone(col, 0.8), top: tone(col, 0.55) }));
      x += w;
    }
  }
  return m;
}

/** One stone of a wall: `w` long (x), `h` high (z), `d` deep (it lies from y = -d to y = 0), its face toward +y, bevelled round that face. */
function block(w: number, h: number, d: number, bevel: number, col: RGB): Mesh {
  const m = new Mesh();
  const b = bevel;
  const lip = blend(col, [1, 1, 1], 0.07);
  const dark = tone(col, 0.72);
  // the face, and the four bevels round it
  m.quad([b, 0, b], [w - b, 0, b], [w - b, 0, h - b], [b, 0, h - b], col);
  m.quad([0, -b, h], [b, 0, h - b], [w - b, 0, h - b], [w, -b, h], lip);
  m.quad([0, -b, 0], [w, -b, 0], [w - b, 0, b], [b, 0, b], dark);
  m.quad([0, -b, 0], [b, 0, b], [b, 0, h - b], [0, -b, h], lip);
  m.quad([w, -b, 0], [w, -b, h], [w - b, 0, h - b], [w - b, 0, b], dark);
  // its other sides (they are seen at a wall's end and along its top)
  m.quad([0, -d, h], [0, -b, h], [w, -b, h], [w, -d, h], tone(col, 0.5));
  m.quad([0, -d, 0], [0, -d, h], [0, -b, h], [0, -b, 0], tone(col, 0.85));
  m.quad([w, -b, 0], [w, -b, h], [w, -d, h], [w, -d, 0], tone(col, 0.7));
  m.quad([w, -d, 0], [w, -d, h], [0, -d, h], [0, -d, 0], tone(col, 0.6));
  return m.outward([w / 2, -d / 2, h / 2]);
}

/** A flight of steps up the y axis: `n` treads from z = 0, each `rise` high and `run` deep, `wide` across (x from 0), ending at y = n * run. */
export function steps(n: number, wide: number, rise: number, run: number, seed = 1): Mesh {
  const m = new Mesh();
  for (let i = 0; i < n; i++) {
    const col = pick(C.dressed, i, seed, 3);
    // (each tread is two or three stones side by side, and runs back under the next)
    let x = 0;
    while (x < wide - 0.01) {
      let w = 0.9 + rnd(i, Math.round(x * 10), seed) * 0.7;
      if (x + w > wide - 0.4) w = wide - x;
      const c = tone(col, 0.94 + rnd(i, Math.round(x * 10), seed + 1) * 0.12);
      m.add(stone(x + 0.012, i * run, 0, x + w - 0.012, n * run, (i + 1) * rise, 0.035, { side: tone(c, 0.7), top: c }));
      x += w;
    }
  }
  return m;
}

// ---------------------------------------------------------------------------------------------
// What stands in a tomb

/** A fire: tongues of three colours, each shining by itself. `r`: how wide its bed is; `h`: how tall. Its foot is at the origin. */
export function fire(r: number, h: number, seed = 1): Mesh {
  const m = new Mesh();
  const tongue = (dx: number, dy: number, rr: number, hh: number, col: RGB, glow: number, turn: number, tip: number): void => {
    // (a tongue swells above its foot and leans as it rises to its tip)
    m.add(lathe([[rr * 0.7, 0], [rr, hh * 0.2], [rr * 0.72, hh * 0.5], [rr * 0.3, hh * 0.8], [0, hh]], 6, { side: col, glow, vary: 0.12, seed: seed + turn }, turn), mats(translate(dx, dy, 0), rotX((rnd(seed, turn) - 0.5) * tip), rotY((rnd(seed, turn + 1) - 0.5) * tip)));
  };
  tongue(0, 0, r, h, C.ember, 1.3, 10, 16);
  tongue(r * 0.62, r * 0.25, r * 0.5, h * 0.62, C.ember, 1.3, 100, 30);
  tongue(-r * 0.6, -r * 0.3, r * 0.46, h * 0.52, C.ember, 1.3, 130, 30);
  tongue(-r * 0.2, r * 0.6, r * 0.4, h * 0.44, C.ember, 1.3, 160, 30);
  // the bright body in front of the red, and the white heart in front of that (toward the camera's side: +x +y)
  tongue(r * 0.42, r * 0.42, r * 0.7, h * 0.74, C.flame, 2.6, 40, 12);
  tongue(r * 0.72, r * 0.72, r * 0.42, h * 0.44, C.heart, 4.2, 70, 8);
  return m;
}

/** A brazier: an iron dish on three legs, coals, and a fire (unless `lit` is false: then the fire is drawn by whoever makes it move). It stands on the origin; its fire burns from z = 0.88. */
export function brazier(seed = 1, lit = true): Mesh {
  const m = new Mesh();
  for (let i = 0; i < 3; i++) {
    const leg = lathe([[0.035, 0], [0.04, 0.62]], 4, { side: C.iron, vary: 0.1 });
    m.add(leg, mats(rotZ(i * 120 + 30), translate(0.3, 0, 0), rotY(-22)));
  }
  m.add(lathe([[0.2, 0.3], [0.21, 0.33]], 8, { side: C.ironDark }), undefined);
  m.add(lathe([[0.1, 0.55], [0.3, 0.68], [0.4, 0.82], [0.42, 0.86]], 8, { side: C.iron, top: C.coal, vary: 0.08 }));
  m.add(lathe([[0.34, 0.86], [0.2, 0.92]], 8, { side: C.coal, top: C.ember, glow: 0.7, vary: 0.2 }));
  if (lit) m.add(fire(0.24, 0.62, seed), translate(0, 0, 0.88));
  return m;
}

/** A pillar: a square foot, a round shaft in drums, a head. `broken`: it stands to this height and no higher (0 = whole). */
export function pillar(high = 2.9, broken = 0, seed = 1): Mesh {
  const m = new Mesh();
  const col = pick(C.dressed, seed, 1);
  m.add(stone(-0.46, -0.46, 0, 0.46, 0.46, 0.2, 0.05, { side: tone(col, 0.8), top: col }));
  m.add(lathe([[0.4, 0.2], [0.4, 0.3], [0.33, 0.36]], 8, { side: col, vary: 0.06, seed }, 22.5));
  const top = broken > 0 ? broken : high - 0.4;
  // the shaft, in drums with a dark joint between
  const drum = 0.62;
  let z = 0.36;
  let k = 0;
  while (z < top - 0.01) {
    const z1 = Math.min(top, z + drum);
    const r0 = 0.3 - 0.03 * ((z - 0.36) / high);
    m.add(lathe([[r0, z + 0.012], [r0 - 0.008, z1 - 0.012]], 8, { side: tone(col, 0.96 + rnd(seed, k) * 0.1), vary: 0.07, seed: seed + k }, 22.5));
    m.add(lathe([[r0 - 0.03, z1 - 0.012], [r0 - 0.03, z1 + 0.012]], 8, { side: C.gap }, 22.5));
    z = z1;
    k++;
  }
  if (broken > 0) {
    // broken off: a slant of rough stone where it gave
    m.add(lathe([[0.28, broken - 0.01], [0.2, 0.25, broken + 0.16], [0, broken + 0.2]], 6, { side: tone(col, 0.85), vary: 0.2, seed }, 10), mats(translate(0.04, 0, 0), rotX(7)));
  } else {
    m.add(lathe([[0.3, high - 0.4], [0.42, high - 0.26], [0.42, high - 0.2]], 8, { side: col, vary: 0.06, seed }, 22.5));
    m.add(stone(-0.48, -0.48, high - 0.2, 0.48, 0.48, high, 0.04, { side: tone(col, 0.85), top: tone(col, 0.6) }));
  }
  return m;
}

/** A drum of a fallen pillar, lying on its side at the origin, along the x axis. */
export function drum(long = 0.6, seed = 1): Mesh {
  const col = pick(C.dressed, seed, 2);
  const m = new Mesh();
  m.add(lathe([[0.29, 0], [0.28, long]], 8, { side: col, vary: 0.08, seed, top: tone(col, 0.8), bottom: tone(col, 0.8) }, 22.5), mats(translate(-long / 2, 0, 0.27), rotY(90)));
  return m;
}

/** A stone coffin on a low base, a rune cut in its lid (alight, if `lit`). It lies along the x axis, its middle on the origin. `ajar`: the lid is pushed aside. */
export function sarcophagus(lit = true, ajar = false, seed = 1): Mesh {
  const m = new Mesh();
  const col = pick(C.dressed, seed, 4);
  m.add(stone(-1.15, -0.62, 0, 1.15, 0.62, 0.16, 0.05, { side: tone(col, 0.75), top: tone(col, 0.9) }));
  m.add(stone(-1.0, -0.48, 0.16, 1.0, 0.48, 0.78, 0.03, { side: col, top: C.gap }));
  // bands round the chest, and a plate at its foot
  for (const x of [-0.62, 0, 0.62]) m.add(box(x - 0.05, -0.5, 0.2, x + 0.05, 0.5, 0.74, { side: tone(col, 1.18) }));
  const lid = new Mesh();
  lid.add(stone(-1.06, -0.54, 0, 1.06, 0.54, 0.12, 0.04, { side: tone(col, 0.9), top: tone(col, 1.05) }));
  lid.add(lathe([[0.98, 0.42, 0.12], [0.8, 0.26, 0.24]], 4, { side: tone(col, 1.1), top: tone(col, 1.2) }, 45), scale(1.05, 1, 1));
  // the rune: a line down the lid and two across it
  const glow = lit ? 2.2 : 0;
  const rc = lit ? C.spark : tone(col, 0.5);
  lid.add(box(-0.5, -0.025, 0.24, 0.5, 0.025, 0.255, { side: rc, glow }));
  lid.add(box(-0.3, -0.16, 0.24, -0.25, 0.16, 0.255, { side: rc, glow }));
  lid.add(box(0.15, -0.12, 0.24, 0.2, 0.12, 0.255, { side: rc, glow }));
  m.add(lid, ajar ? mats(translate(0.12, 0.3, 0.78), rotZ(14), rotX(-6)) : translate(0, 0, 0.78));
  return m;
}

/** A chest: plum wood in gold bands. It stands on the origin, its front toward +y. */
export function chest(): Mesh {
  const m = new Mesh();
  m.add(box(-0.4, -0.27, 0.04, 0.4, 0.27, 0.42, { side: C.wood, vary: 0.08 }));
  // the lid: half a barrel
  const lid = lathe([[0.3, 0.27, -0.42], [0.3, 0.27, 0.42]], 8, { side: C.wood, top: C.woodDark, bottom: C.woodDark, vary: 0.06 }, 22.5);
  m.add(lid, mats(translate(0, 0, 0.42), rotY(90), scale(0.62, 1, 1)));
  for (const x of [-0.3, 0.3]) {
    m.add(box(x - 0.05, -0.285, 0.02, x + 0.05, 0.285, 0.44, { side: C.gold }));
    m.add(lathe([[0.31, 0.285, -0.05], [0.31, 0.285, 0.05]], 8, { side: C.gold, top: C.gold, bottom: C.gold }, 22.5), mats(translate(x, 0, 0.42), rotY(90), scale(0.63, 1, 1)));
  }
  m.add(box(-0.07, 0.27, 0.34, 0.07, 0.31, 0.5, { side: C.goldLight }));
  for (const [x, y] of [[-0.36, -0.23], [0.36, -0.23], [-0.36, 0.23], [0.36, 0.23]] as const) m.add(box(x - 0.05, y - 0.05, 0, x + 0.05, y + 0.05, 0.06, { side: C.gold }));
  return m;
}

export function urn(seed = 1): Mesh {
  const col = tone(C.clay, 0.9 + rnd(seed, 3) * 0.25);
  const m = lathe([[0.1, 0], [0.2, 0.12], [0.24, 0.3], [0.18, 0.5], [0.09, 0.6], [0.13, 0.68]], 7, { side: col, vary: 0.07, seed, top: C.gap });
  m.add(lathe([[0.245, 0.27], [0.245, 0.31]], 7, { side: tone(col, 1.35) }));
  return m;
}

export function barrel(): Mesh {
  const m = lathe([[0.21, 0], [0.27, 0.22], [0.27, 0.42], [0.21, 0.64]], 9, { side: C.wood, vary: 0.1, top: C.woodDark });
  for (const z of [0.14, 0.5]) m.add(lathe([[0.262, z - 0.03], [0.262, z + 0.03]], 9, { side: C.iron }));
  return m;
}

/** Bones on the floor: a skull and a few long ones. */
export function bones(seed = 1): Mesh {
  const m = new Mesh();
  for (let i = 0; i < 3; i++) {
    const b = lathe([[0.035, 0], [0.02, 0.05], [0.02, 0.3], [0.035, 0.35]], 4, { side: C.bone, vary: 0.08 });
    m.add(b, mats(translate((rnd(seed, i) - 0.5) * 0.5, (rnd(seed, i + 9) - 0.5) * 0.5, 0.03), rotZ(rnd(seed, i + 5) * 360), rotY(90)));
  }
  m.add(skull(0.13), mats(translate(0.12, -0.1, 0.1), rotZ(40 + rnd(seed, 30) * 200)));
  return m;
}

/** A skull, its middle at the origin, looking along +y: for the floor, a niche, or a skeleton's neck. `eyes`: they shine. */
export function skull(r: number, eyes: RGB | null = null): Mesh {
  const m = new Mesh();
  m.add(ball(r, r * 1.08, r * 0.95, { side: C.bone, vary: 0.05 }, true));
  // the jaw, set forward and down; the dark of the eyes and the nose
  m.add(box(-r * 0.6, r * 0.2, -r * 1.35, r * 0.6, r * 1.0, -r * 0.62, { side: C.boneShade, top: C.boneShade }));
  for (const sx of [-1, 1]) {
    m.add(box(sx * r * 0.2, r * 0.82, -r * 0.3, sx * r * 0.68, r * 1.03, r * 0.16, { side: C.gap }));
    if (eyes) m.add(box(sx * r * 0.34, r * 0.98, -r * 0.16, sx * r * 0.54, r * 1.06, r * 0.04, { side: eyes, glow: 3 }));
  }
  m.add(box(-r * 0.09, r * 0.9, -r * 0.6, r * 0.09, r * 1.06, -r * 0.36, { side: C.gap }));
  for (let i = -2; i <= 2; i++) m.add(box(i * r * 0.22 - r * 0.07, r * 0.98, -r * 0.98, i * r * 0.22 + r * 0.07, r * 1.04, -r * 0.7, { side: C.bone }));
  return m;
}

/**
 * A hanging: cloth on a rod, a device on it, its foot in tatters. It hangs in the x-z plane from
 * z = 0 down, facing +y, `wide` across and `long` down. `torn`: 0..1, how much of the foot is gone.
 */
export function hanging(wide: number, long: number, col: RGB, dark: RGB, device: RGB, torn = 0.4, seed = 1): Mesh {
  const m = new Mesh();
  m.add(lathe([[0.03, -wide / 2 - 0.1], [0.03, wide / 2 + 0.1]], 5, { side: C.iron }), mats(translate(0, 0.05, 0.02), rotY(90)));
  const strips = 6;
  const sw = wide / strips;
  for (let i = 0; i < strips; i++) {
    const xa = -wide / 2 + i * sw;
    const xb = xa + sw;
    // (each strip hangs to its own length, and bellies a little out from the wall)
    const la = long * (1 - torn * rnd(seed, i) * 0.55);
    const lb = long * (1 - torn * rnd(seed, i + 1) * 0.55);
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      const t0 = r / rows;
      const t1 = (r + 1) / rows;
      const wave = (t: number, x: number): number => 0.04 + Math.sin(t * 3.1 + x * 4 + seed) * 0.025 * t;
      const c = r === 0 ? dark : i === 0 || i === strips - 1 ? dark : col;
      m.sheet([[xa, wave(t1, xa), -la * t1], [xb, wave(t1, xb), -lb * t1], [xb, wave(t0, xb), -lb * t0], [xa, wave(t0, xa), -la * t0]], tone(c, 0.92 + rnd(seed, i * 9 + r) * 0.16));
    }
  }
  // the device: a diamond with a bar over it, in a paler thread
  const mid = -long * 0.42;
  m.sheet([[0, 0.075, mid + wide * 0.3], [-wide * 0.2, 0.075, mid], [0, 0.075, mid - wide * 0.3], [wide * 0.2, 0.075, mid]], device);
  m.sheet([[-wide * 0.26, 0.075, mid + wide * 0.44], [-wide * 0.26, 0.075, mid + wide * 0.38], [wide * 0.26, 0.075, mid + wide * 0.38], [wide * 0.26, 0.075, mid + wide * 0.44]], device);
  return m;
}

/** A stone beast's head, built out from a wall (the wall is the x-z plane, the head looks along +y). `water`: it spouts. */
export function gargoyle(water = false, seed = 1): Mesh {
  const m = new Mesh();
  const col = pick(C.dressed, seed, 8);
  m.add(stone(-0.3, -0.05, -0.28, 0.3, 0.1, 0.3, 0.04, { side: tone(col, 0.8), top: tone(col, 0.7) }));
  // the head: brow, snout, lower jaw dropped
  m.add(ball(0.25, 0.24, 0.22, { side: col, vary: 0.08, seed }), translate(0, 0.26, 0.02));
  m.add(box(-0.13, 0.36, -0.1, 0.13, 0.62, 0.06, { side: tone(col, 1.06), top: tone(col, 1.15) }));
  m.add(box(-0.11, 0.34, -0.22, 0.11, 0.56, -0.15, { side: tone(col, 0.9) }));
  m.add(box(-0.09, 0.4, -0.15, 0.09, 0.56, -0.1, { side: C.gap }));
  m.add(box(-0.24, 0.3, 0.1, 0.24, 0.46, 0.16, { side: tone(col, 1.12) }));
  for (const sx of [-1, 1]) {
    // horns swept back, an ear, an eye in the shade of the brow
    m.add(lathe([[0.06, 0], [0.035, 0.16], [0, 0.3]], 4, { side: tone(col, 0.92) }), mats(translate(sx * 0.17, 0.18, 0.16), rotY(sx * 24), rotX(38)));
    m.add(box(sx * 0.08, 0.44, 0.03, sx * 0.17, 0.47, 0.09, { side: C.gap }));
    // fangs
    m.add(lathe([[0.02, 0], [0, 0.07]], 3, { side: C.bone }), mats(translate(sx * 0.085, 0.58, -0.1), rotX(180)));
  }
  if (water) {
    for (let i = 0; i < 5; i++) m.add(box(-0.03, 0.56 + i * 0.012, -0.12 - (i + 1) * 0.22, 0.03, 0.6 + i * 0.012, -0.12 - i * 0.22, { side: C.water, glow: 0.5 }));
  }
  return m;
}

/** Where a sconce's flame burns from, in the sconce's own measure. */
export const SCONCE_FLAME: readonly [number, number, number] = [0, 0.29, 0.24];

/** A torch in an iron holder on a wall (the wall is the x-z plane; it leans out along +y). Its flame is at SCONCE_FLAME (unless `lit` is false: then the fire is drawn by whoever makes it move). */
export function sconce(seed = 1, lit = true): Mesh {
  const m = new Mesh();
  m.add(box(-0.06, 0, -0.16, 0.06, 0.05, 0.1, { side: C.ironDark }));
  m.add(lathe([[0.04, 0], [0.05, 0.42]], 5, { side: C.wood }), mats(translate(0, 0.06, -0.14), rotX(-32)));
  m.add(lathe([[0.07, 0], [0.09, 0.08]], 6, { side: C.iron }), mats(translate(0, 0.26, 0.17), rotX(-32)));
  if (lit) m.add(fire(0.09, 0.3, seed), translate(SCONCE_FLAME[0], SCONCE_FLAME[1], SCONCE_FLAME[2]));
  else m.add(lathe([[0.06, 0], [0.03, 0.04]], 6, { side: C.coal, top: C.ember, glow: 0.8 }), translate(SCONCE_FLAME[0], SCONCE_FLAME[1] - 0.01, SCONCE_FLAME[2] - 0.02));
  return m;
}

/** A few candles on the floor, each alight. */
export function candles(seed = 1): Mesh {
  const m = new Mesh();
  const n = 3 + Math.floor(rnd(seed, 1) * 3);
  for (let i = 0; i < n; i++) {
    const a = rnd(seed, i + 2) * 6.28;
    const d = i === 0 ? 0 : 0.1 + rnd(seed, i + 12) * 0.14;
    const h = 0.12 + rnd(seed, i + 22) * 0.22;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    m.add(lathe([[0.045, 0], [0.04, h]], 5, { side: C.bone, top: tone(C.bone, 0.8), vary: 0.05 }), translate(x, y, 0));
    m.add(lathe([[0.02, 0], [0.028, 0.03], [0, 0.09]], 4, { side: C.flame, glow: 3 }), translate(x, y, h + 0.01));
  }
  // the wax that has run down and set
  m.add(lathe([[0.2, 0], [0.12, 0.02]], 7, { side: tone(C.bone, 0.85) }));
  return m;
}

/** Rubble: a heap of broken stone. `r`: how far it spreads. */
export function rubble(r: number, n: number, seed = 1): Mesh {
  const m = new Mesh();
  for (let i = 0; i < n; i++) {
    const a = rnd(seed, i) * 6.28;
    const d = Math.sqrt(rnd(seed, i + 40)) * r;
    const s = 0.07 + rnd(seed, i + 80) * 0.16;
    m.add(rock(s, pick(C.wall, seed, i, 5), seed * 13 + i), mats(translate(Math.cos(a) * d, Math.sin(a) * d, 0), rotZ(rnd(seed, i + 120) * 360)));
  }
  return m;
}

/** Moss in a joint or a corner: a few low green tufts. */
export function moss(r: number, n: number, seed = 1): Mesh {
  const m = new Mesh();
  for (let i = 0; i < n; i++) {
    const a = rnd(seed, i) * 6.28;
    const d = Math.sqrt(rnd(seed, i + 40)) * r;
    const s = 0.05 + rnd(seed, i + 80) * 0.09;
    m.add(ball(s * 1.3, s * 1.3, s * 0.5, { side: tone(C.moss, 0.7 + rnd(seed, i + 3) * 0.6), vary: 0.15, seed: seed + i }), translate(Math.cos(a) * d, Math.sin(a) * d, s * 0.2));
  }
  return m;
}
