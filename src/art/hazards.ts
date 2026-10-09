// THE TRAPS: their pictures (game/traps.ts has the rules; the sealed door's leaf is with the other
// doors', art/gates.ts).
//
//   THE SPIKE FLOOR. In every tile of the patch, nine holes in the flagstones, always to be seen.
//   In the moment's warning before the spikes come up, the holes GLINT. Up, a spike of iron stands
//   in every hole, catching the light: iron, not a glow (glows are cyan for a friend and pink and
//   gold for an enemy; this is the dungeon's).
//   THE DART WALL. The PLATE: a square stone a hair raised in the corridor's floor, its own gap
//   round it; pressed, it sinks flush. The SLOT: a dark slit with an iron rim in the face of the
//   wall at the corridor's end, the tips of darts glinting in it. A DART in flight: a short iron
//   shaft with a pale point (render.ts, with the other shots).
//
// The grid on the screen, in PICTURE pixels (two to a game pixel): a tile is a diamond 64 wide and
// 32 high; along +x in the world is 32 right and 16 down, along +y 32 left and 16 down, and a game
// pixel of height is 2 up.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { VAULT } from './ground';
import type { Theme } from './ground';
import { GRAIN } from './kit';
import { IRON } from './mkit';

const DARK = IRON[0];
const BODY = IRON[2];
const LIT = IRON[3];
const GLINT = '#d8d4ff';

/** The nine places of a spike floor's spikes on a tile: (u, v) in tiles from the tile's middle, along x and along y. */
export const SPIKE_SPOTS: ReadonlyArray<readonly [number, number]> = [-1 / 3, 0, 1 / 3].flatMap((u) => [-1 / 3, 0, 1 / 3].map((v) => [u, v] as const));

/** How tall a spike stands, all the way up, in game pixels; and in how many steps its rise is painted. */
export const SPIKE_HIGH = 9;
export const SPIKE_STEPS = 7;

/** Where (u, v) on a tile is in the tile's picture, from its middle: picture pixels. */
function onTile(u: number, v: number): [number, number] {
  return [Math.round((u - v) * 32), Math.round((u + v) * 16)];
}

/** THE HOLES OF ONE TILE OF A SPIKE FLOOR: nine of them; `glint`: the warning, a light in each. Anchored at the tile's middle. */
export function makeHoles(theme: Theme, glint: boolean): Sprite {
  const p = new Px(64, 32);
  const lip = theme.slab[3];
  for (const [u, v] of SPIKE_SPOTS) {
    const [dx, dy] = onTile(u, v);
    const x = 32 + dx;
    const y = 16 + dy;
    // (a hole: a ring of mortar, black within, its near rim catching the light)
    p.ellipse(x, y, 4, 2, theme.mortar);
    p.ellipse(x, y, 3, 1, '#05040e');
    p.hline(x - 2, y + 2, 5, lip);
    p.set(x - 3, y + 1, lip);
    p.set(x + 3, y + 1, lip);
    if (glint) {
      // (the points, a moment from coming up, catch the light down in the holes)
      p.hline(x - 1, y, 3, LIT);
      p.set(x, y - 1, GLINT);
      p.set(x, y, GLINT);
    }
  }
  return p.sprite(32, 16, GRAIN);
}

/** ONE SPIKE, `k` steps of SPIKE_STEPS up (1 to SPIKE_STEPS): a cone of iron lit on the left, its point catching the light. Anchored at its foot. */
export function makeSpike(k: number): Sprite {
  const high = Math.max(2, Math.round((SPIKE_HIGH * 2 * k) / SPIKE_STEPS));
  const p = new Px(11, high + 4);
  const cx = 5;
  const foot = high + 1;
  for (let r = 0; r < high; r++) {
    const half = Math.max(0, Math.round(3.2 * (1 - r / high)));
    const y = foot - r;
    for (let dx = -half; dx <= half; dx++) {
      // (lit on its left, in shade on its right, its edge dark; a line of light down its lit side)
      const c = dx === -half ? LIT : dx < 0 ? (dx === -1 && r > 1 ? GLINT : LIT) : dx === 0 ? LIT : dx === half ? DARK : BODY;
      p.set(cx + dx, y, c);
    }
  }
  p.set(cx, foot - high, '#ffffff');
  // (its foot in the hole's shadow)
  p.hline(cx - 3, foot + 1, 7, DARK);
  return p.sprite(cx, foot, GRAIN);
}

/**
 * THE PLATE OF A DART WALL, on its tile: a square stone a hair raised, with its own gap round it
 * (lit along its two far edges, in shade along its two near ones); `pressed`: sunk flush, its
 * edges the other way round. Anchored at the tile's middle.
 */
export function makePlate(theme: Theme, pressed: boolean): Sprite {
  const p = new Px(64, 34);
  // (a plate of iron set in the floor, a little smaller than the tile; raised a hair until it is trodden on)
  const up = pressed ? 0 : 2;
  const top: [number, number] = [32, 7 - up];
  const right: [number, number] = [50, 16 - up];
  const bottom: [number, number] = [32, 25 - up];
  const left: [number, number] = [14, 16 - up];
  // its gap in the floor
  p.poly([[32, 5], [54, 16], [32, 27], [10, 16]], theme.mortar);
  // the edge it stands up by, toward the eye
  if (!pressed) p.poly([left, bottom, right, [50, 16], [32, 25], [14, 16]], DARK);
  p.poly([top, right, bottom, left], pressed ? IRON[1] : BODY);
  // its rim: the far edges catch the light; four studs; a cross-hatch of grooves
  p.line(left[0], left[1], top[0], top[1], pressed ? BODY : LIT);
  p.line(top[0], top[1], right[0], right[1], pressed ? BODY : LIT);
  p.line(left[0] + 1, left[1] + 1, bottom[0], bottom[1], DARK);
  p.line(bottom[0], bottom[1], right[0] - 1, right[1] + 1, DARK);
  for (const [x, y] of [[32, 10 - up], [45, 16 - up], [32, 22 - up], [19, 16 - up]] as const) {
    p.set(x, y, pressed ? LIT : GLINT);
    p.set(x, y + 1, DARK);
  }
  p.line(24, 12 - up, 40, 20 - up, pressed ? DARK : IRON[1]);
  p.line(40, 12 - up, 24, 20 - up, pressed ? DARK : IRON[1]);
  return p.sprite(32, 16, GRAIN);
}

/**
 * THE SLOT OF A DART WALL, in the face of a wall: a slit a third of a tile long, at the height of a
 * chest, with an iron rim, and the points of the darts glinting in it. `alongX`: the face is a
 * plane along +x (the darts fly toward +y); else along +y (they fly toward +x). Anchored at the
 * foot of the face, under the middle of the slit.
 */
export function makeSlot(alongX: boolean): Sprite {
  const p = new Px(56, 70);
  const ax = 28;
  const ay = 60;
  // (a place u picture pixels along the plane from the slit's middle, v up from the floor)
  const at = (u: number, v: number): [number, number] => [ax + (alongX ? u : -u), ay + Math.floor(u / 2) - v];
  const v0 = 24;
  const v1 = 31;
  const half = 14;
  // a plate of iron let into the stone round it, studded at its corners
  for (let u = -half - 4; u <= half + 4; u++) {
    for (let v = v0 - 5; v <= v1 + 5; v++) {
      const [x, y] = at(u, v);
      const edge = u === -half - 4 || u === half + 4 || v === v0 - 5 || v === v1 + 5;
      p.set(x, y, edge ? (v === v1 + 5 ? LIT : DARK) : BODY);
    }
  }
  for (const [u, v] of [[-half - 2, v1 + 3], [half + 2, v1 + 3], [-half - 2, v0 - 3], [half + 2, v0 - 3]] as const) {
    const [x, y] = at(u, v);
    p.set(x, y, GLINT);
  }
  // the slit in it, black, its lower lip lit
  for (let u = -half; u <= half; u++) {
    for (let v = v0; v <= v1; v++) {
      const [x, y] = at(u, v);
      p.set(x, y, v === v0 ? LIT : '#05040e');
    }
  }
  // the points of the darts, a little in from the mouth
  for (const u of [-8, 0, 8]) {
    const [x, y] = at(u, Math.round((v0 + v1) / 2));
    p.set(x, y, GLINT);
    const [x2, y2] = at(u + (alongX ? 1 : -1), Math.round((v0 + v1) / 2));
    p.set(x2, y2, LIT);
  }
  return p.sprite(ax, ay, GRAIN);
}

/** The pictures of a dungeon's traps, painted when first asked for and kept. */
export interface HazardArt {
  holes(glint: boolean): Sprite;
  /** A spike `k` steps up (1 to SPIKE_STEPS). */
  spike(k: number): Sprite;
  plate(pressed: boolean): Sprite;
  slot(alongX: boolean): Sprite;
}

export function makeHazardArt(theme: Theme = VAULT): HazardArt {
  const holes: (Sprite | null)[] = [null, null];
  const plates: (Sprite | null)[] = [null, null];
  const slots: (Sprite | null)[] = [null, null];
  const spikes = new Map<number, Sprite>();
  return {
    holes(glint) {
      const k = glint ? 1 : 0;
      return holes[k] ?? (holes[k] = makeHoles(theme, glint));
    },
    spike(k) {
      const q = Math.max(1, Math.min(SPIKE_STEPS, Math.round(k)));
      let s = spikes.get(q);
      if (!s) spikes.set(q, (s = makeSpike(q)));
      return s;
    },
    plate(pressed) {
      const k = pressed ? 1 : 0;
      return plates[k] ?? (plates[k] = makePlate(theme, pressed));
    },
    slot(alongX) {
      const k = alongX ? 1 : 0;
      return slots[k] ?? (slots[k] = makeSlot(alongX));
    },
  };
}
