// THE STRONGHOLDS' FRONTS, A FLOOR'S OWN EACH: THE KIT THEY ARE BUILT WITH (art/hold_fronts.ts builds them). The owner, 25 Nov
// 2026, 08:58 (Eastern), as endless mode puts strongholds on every level: “Endless mode is adding strongholds to every level, and I
// need the facades of the strongholds that you go into to match each of the levels.” His picks, by 10:04: “The cult's, in each
// level's building (Recommended)” and “Yes, story and endless alike (Recommended)”.
//
// Each front is built in the world as the Quarry's gatehouse is (art/floor6.ts `gatehouse`): on the grid, its face along x looking
// out down the screen to the left (+y), the door's foot at the world's (0, 0, 0), built a third again as big as it is measured
// (K), the eye seeing what faces it (the top, the front, the side to the right), lit from the upper left, the seams between its
// parts inked. What every front shares is here: the door with the cult's mark cut in it and burning (four frames of its flicker)
// or open (the dark of the way in, steps going down), its arches, its banners, the pink fire in its sconces, and the patterns of
// the floors' stone, brick, timber, plaster, iron, bone, leaves and glass, each in the floor's own colours.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CLOTH, PAINT, PAINT_SHADE, SLATE } from './act1_cult';
import { shriekAt } from './floor5';
import { Scene, toneAt } from './floor4';
import type { V3 } from './floor4';
import { fr, seenNormal } from './floor6';
import { GRAIN, compose, hash, mix } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';

/** A face's colour at the world's point `w` (as measured, before K), the face turned `n`; null: nothing there. */
export type Paint = (w: V3, n: V3) => string | null;

/** A ramp's tone `i` (0 to 4), held to it. */
export const at = (r: Ramp, i: number): string => r[Math.max(0, Math.min(4, Math.round(i)))];
/** Which tone of the ramp a face turned `n` takes in the light (0 to 4), `bias` lighter. */
export function toneIndex(n: readonly number[], r: Ramp, bias = 0): number {
  return r.indexOf(toneAt(n, r, bias));
}
/** The tone the face's light gives, moved `by` tones (a block a little lighter or darker than its neighbours). */
export const lit = (n: V3, r: Ramp, by = 0, bias = 0): string => at(r, toneIndex(n, r, bias) + by);
/** How far along its face a point is: along x on a face turned to y, along y on one turned to x. */
export const along = (w: V3, n: V3): number => (Math.abs(n[1]) > Math.abs(n[0]) ? w[0] : w[1]);
/** A face turned up (a top, a sill). */
export const isTop = (n: V3): boolean => n[2] > 0.7;

// =================================================================================================
// THE BUILDER

/**
 * A FRONT BEING BUILT: its scene (the gatehouse's canvas and anchor, 300 x 440 picture pixels with the door's foot at (100, 392)),
 * its scale, the parts' ids for their seams, its lights.
 */
export class Front {
  readonly S: Scene;
  readonly lights: Light[] = [];
  private next = 1;
  constructor(readonly K = 1.35, readonly W = 300, readonly H = 440, readonly OX = 100, readonly OY = 392) {
    this.S = new Scene(new Px(W, H), OX, OY);
  }
  /** A new part's id (each its own, for the seams). */
  id(): number {
    return this.next++;
  }
  big(v: V3): V3 {
    return [v[0] * this.K, v[1] * this.K, v[2] * this.K];
  }
  /** A four-cornered face, painted by the world point as measured (before K). */
  face(q: readonly [V3, V3, V3, V3], paint: Paint, id = this.id()): void {
    const n = seenNormal(q as [V3, V3, V3, V3]);
    const K = this.K;
    this.S.quad([this.big(q[0]), this.big(q[1]), this.big(q[2]), this.big(q[3])], (_u, _v, w) => paint([w[0] / K, w[1] / K, w[2] / K], n), id);
  }
  /** A three-cornered face (a gable's end, a pediment). */
  tri(a: V3, b: V3, c: V3, paint: Paint, id = this.id()): void {
    this.face([a, b, c, c], paint, id);
  }
  /**
   * A BOX from (x0, y0, z0) to (x1, y1, z1): what the eye sees of it, its top, its front (+y) and its side to the right (+x), each
   * painted by `paint` (or by `top`, `front`, `side` where given). `cut(w, n)`: a hole in its front or side (a door, a window).
   */
  box(x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, paint: Paint | { top?: Paint; front?: Paint; side?: Paint; all?: Paint }, cut?: (w: V3, n: V3) => boolean, id = this.id()): number {
    const p = typeof paint === 'function' ? { all: paint } : paint;
    const top = p.top ?? p.all!;
    const front = p.front ?? p.all!;
    const side = p.side ?? p.all!;
    const holed = (f: Paint): Paint => (w, n) => (cut && cut(w, n) ? null : f(w, n));
    this.face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], top, id);
    this.face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], holed(front), id);
    this.face([[x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1]], holed(side), id);
    return id;
  }
  /** Merlons along a box's front and right edges at height `z` (`w` wide, `gap` between, `h` high, `d` deep). */
  merlons(x0: number, y0: number, x1: number, y1: number, z: number, paint: Paint, w = 7, gap = 5, h = 9, d = 5): void {
    const id = this.id();
    for (let x = x0; x + w - 1 <= x1 + 0.1; x += w + gap) this.box(x, y1 - d, Math.min(x + w, x1), y1, z, z + h, paint, undefined, id);
    for (let y = y1 - w - gap; y - w >= y0 - 0.1; y -= w + gap) this.box(x1 - d, y - w, x1, y, z, z + h, paint, undefined, id);
  }
  /** A COLUMN (a rod, round), from (x, y, z0) up to z1, `r` thick (as measured), in `ramp`. */
  column(x: number, y: number, z0: number, z1: number, r: number, ramp: Ramp, r1 = r): void {
    this.S.rod(this.big([x, y, z0]), this.big([x, y, z1]), r * this.K, r1 * this.K, ramp, this.id());
  }
  /** A ROD between two points (a pole, a beam, a chain's run, a bone). */
  rod(a: V3, b: V3, r: number, ramp: Ramp, r1 = r, id = this.id()): void {
    this.S.rod(this.big(a), this.big(b), r * this.K, r1 * this.K, ramp, id);
  }
  /** A ROUND THING (a finial, a knob, a skull's crown) of one ramp. */
  ball(c: V3, r: number, ramp: Ramp, bias = 0, id = this.id()): void {
    this.S.ball(this.big(c), r * this.K, ramp, id, undefined, bias);
  }
  /** An EGG-SHAPED THING, its own colour by the way it faces. */
  egg(c: V3, r: V3, shade: (n: V3, w: V3) => string | null, id = this.id()): void {
    this.S.egg(this.big(c), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [r[0] * this.K, r[1] * this.K, r[2] * this.K], (n, w) => shade(n, [w[0] / this.K, w[1] / this.K, w[2] / this.K]), id);
  }
  /** A light at the world's point `w` (as measured): `r` its reach in game pixels. */
  light(w: V3, r: number, color: string, a: number): void {
    const [x, y] = this.S.at(this.big(w));
    this.lights.push({ x: x / GRAIN, y: y / GRAIN, r, color, a });
  }
  /** The front, inked at its seams, at the game's size, its lights with it. */
  finish(): Sprite {
    this.S.seams();
    const sp = compose(null, [this.S.p], null).sprite(this.OX, this.OY, GRAIN);
    if (this.lights.length) sp.lights = this.lights;
    return sp;
  }
}

// =================================================================================================
// ITS DOOR: AN ARCH, THE CULT'S MARK BURNING IN ITS SLAB, OR THE WAY IN OPEN

/** An opening's shape, about its middle (x 0), its foot at z 0. */
export interface Arch {
  half: number;
  /** How high its sides go before its top begins. */
  spring: number;
  shape: 'round' | 'pointed' | 'flat' | 'ogee' | 'segment';
}
/** Whether (x, z) is in the opening. */
export function inArch(a: Arch, x: number, z: number): boolean {
  const ax = Math.abs(x);
  if (ax >= a.half || z < 0) return false;
  if (z < a.spring) return true;
  const h = a.half;
  switch (a.shape) {
    case 'flat':
      return false;
    case 'round':
      return Math.hypot(x, z - a.spring) < h;
    case 'segment':
      // (a low arc: a circle's top, its middle below the spring)
      return Math.hypot(x, z - a.spring + h * 1.4) < h * Math.hypot(1, 1.4);
    case 'pointed': {
      // (two arcs meeting at a point: each centred on the far side's spring, its radius the opening's width less a little)
      const R = h * 1.7;
      return Math.hypot(ax + (R - h), z - a.spring) < R;
    }
    case 'ogee': {
      const t = (z - a.spring) / (h * 1.5);
      if (t > 1) return false;
      const w = t < 0.5 ? Math.cos(t * Math.PI) * 0.5 + 0.5 : 0.5 - 0.5 * Math.sin((t - 0.5) * Math.PI) * 0.9;
      return ax < h * Math.max(0.04, w);
    }
  }
}
/** How high an opening reaches at its middle. */
export function archTop(a: Arch): number {
  switch (a.shape) {
    case 'flat':
      return a.spring;
    case 'round':
      return a.spring + a.half;
    case 'segment':
      return a.spring - a.half * 1.4 + a.half * Math.hypot(1, 1.4);
    case 'pointed': {
      const R = a.half * 1.7;
      return a.spring + Math.sqrt(R * R - (R - a.half) ** 2);
    }
    case 'ogee':
      return a.spring + a.half * 1.5;
  }
}

/** The slab of a sealed door: its own stuff (`slab`), and over it the cult's mark cut huge and burning (frame `f`'s flicker). */
export interface DoorLook {
  /** The slab's own colour where the mark is not (by its place on the door: x across, z up). */
  slab: (x: number, z: number, n: V3) => string;
  /** The mark's size: its width across the door (default 0.62 of it) and its middle's height (default 0.6 of the arch's top). */
  markW?: number;
  markZ?: number;
}

/**
 * THE DOOR in an arch `a` of a face at y = `y0`, set back `recess`: sealed (`open` false: the slab, the cult's mark burning pink on
 * it, `f` its flicker, its light) or open (the dark of the way in, the first steps going down catching what light there is). And
 * the jamb on the left, from the face back to the door (the eye sees it; the right one faces away).
 */
export function door(F: Front, a: Arch, y0: number, recess: number, open: boolean, f: number, look: DoorLook, jamb: Paint, x0 = 0): void {
  const top = archTop(a);
  const id = F.id();
  // the left jamb, in shade, from the face back to the door
  F.face([[x0 - a.half, y0, 0], [x0 - a.half, y0 - recess, 0], [x0 - a.half, y0 - recess, top], [x0 - a.half, y0, top]], (w, n) => (inArch(a, -a.half + 0.01, w[2]) || w[2] < a.spring ? jamb(w, n) : null), id);
  const mw = (look.markW ?? 0.62) * a.half;
  const mz = (look.markZ ?? 0.58) * top;
  const ms = Math.min(mw / 0.76, top * 0.26);
  const flick = [0, 1, 0, 2][f % 4];
  F.face([[x0 - a.half, y0 - recess, 0], [x0 + a.half, y0 - recess, 0], [x0 + a.half, y0 - recess, top], [x0 - a.half, y0 - recess, top]], (w, n) => {
    const x = w[0] - x0;
    const z = w[2];
    if (!inArch(a, x, z)) return null;
    if (open) {
      // the way in, dark; the first steps going back, their lips catching what light there is
      if (z < 16 && fr(z / 5.5) > 0.8) return Math.floor(z / 5.5) % 2 ? '#2a2434' : '#221d2c';
      return '#0c0a12';
    }
    const m = shriekAt(x / ms, (z - mz) / (ms * 1.15));
    if (m === 'dark') return FLAME[Math.min(4, 3 + (flick === 2 ? 1 : 0))];
    if (m === 'bone') return FLAME[1 + (flick ? 1 : 0)];
    // the mark's glow on the slab round it
    const g = shriekAt(x / (ms * 1.12), (z - mz) / (ms * 1.29));
    const own = look.slab(x, z, n);
    return g ? mix(own, FLAME[0], 0.45) : own;
  }, F.id());
  if (!open) F.light([x0, y0 - recess, mz], 30 + (f % 2) * 3, FLAME[2], 0.4);
}

/** A slab of the cult's slate, bound with two bands of iron (the Quarry's door). */
export const slateSlab = (iron: Ramp) => (x: number, z: number, n: V3): string => {
  if (Math.abs(z - 12) < 1.5) return toneAt(n, iron, 0.2);
  return toneAt(n, SLATE, (hash(Math.floor(x / 6), Math.floor(z / 6), 973) - 0.5) * 0.2);
};

/** VOUSSOIRS: a ring of cut stones round an arch on the face at y, `ring` wide, cut radially (and the jambs' dressed edges below). */
export function voussoirs(F: Front, a: Arch, y: number, ring: number, ramp: Ramp, joint: string, x0 = 0, keystone?: Paint): void {
  const top = archTop(a);
  F.face([[x0 - a.half - ring, y + 0.06, 0], [x0 + a.half + ring, y + 0.06, 0], [x0 + a.half + ring, y + 0.06, top + ring + 2], [x0 - a.half - ring, y + 0.06, top + ring + 2]], (w, n) => {
    const x = w[0] - x0;
    const z = w[2];
    if (inArch(a, x, z)) return null;
    // (outside the ring: nothing)
    const outer: Arch = { ...a, half: a.half + ring, spring: a.spring };
    if (!inArch(outer, x, z) && !(z < a.spring && Math.abs(x) < a.half + ring)) return null;
    if (z < a.spring) {
      // the jambs: blocks a course high
      const c = Math.floor(z / 10);
      if (fr(z / 10) < 0.1) return joint;
      return lit(n, ramp, hash(c, x > 0 ? 1 : 0, 51) > 0.5 ? 0 : -1, 0.08);
    }
    if (keystone && Math.abs(x) < ring * 0.7) {
      const k = keystone(w, n);
      if (k) return k;
    }
    const ang = Math.atan2(z - a.spring, x);
    const k = fr(ang / (Math.PI / 9));
    if (k < 0.08) return joint;
    return lit(n, ramp, k > 0.5 ? 0 : -1, 0.08);
  }, F.id());
}

// =================================================================================================
// THE CULT'S THINGS ON IT

/** THE CULT'S BANNER hung down a face at y from (x0, zTop) to (x1, zBot): its violet cloth folded, the shrieking skull on it, its foot cut in tails, its iron rod. */
export function banner(F: Front, x0: number, x1: number, zBot: number, zTop: number, y: number, rod: Ramp): void {
  F.face([[x0, y + 0.6, zBot], [x1, y + 0.6, zBot], [x1, y + 0.6, zTop], [x0, y + 0.6, zTop]], (w, n) => {
    const u = (w[0] - x0) / (x1 - x0);
    const tail = Math.abs(fr(u * 3) - 0.5) * 2;
    if (w[2] < zBot + 8 * (1 - tail)) return null;
    if (w[2] > zTop - 3) return rod[3];
    const m = shriekAt((u - 0.5) * 2.4, (w[2] - (zTop - (zTop - zBot) * 0.38)) / ((x1 - x0) * 0.42));
    if (m === 'bone') return u > 0.62 ? PAINT_SHADE : PAINT;
    if (m === 'dark') return CLOTH[0];
    const fold = Math.sin(u * 12);
    return CLOTH[fold > 0.5 ? 3 : fold < -0.5 ? 1 : 2] ?? toneAt(n, CLOTH, 0);
  });
}
/** THE CULT'S BANNER on a face turned to the right (at x), from y0 to y1 along it. */
export function bannerSide(F: Front, y0: number, y1: number, zBot: number, zTop: number, x: number, rod: Ramp): void {
  F.face([[x + 0.6, y1, zBot], [x + 0.6, y0, zBot], [x + 0.6, y0, zTop], [x + 0.6, y1, zTop]], (w) => {
    const u = (y1 - w[1]) / (y1 - y0);
    const tail = Math.abs(fr(u * 3) - 0.5) * 2;
    if (w[2] < zBot + 8 * (1 - tail)) return null;
    if (w[2] > zTop - 3) return rod[2];
    const m = shriekAt((u - 0.5) * 2.4, (w[2] - (zTop - (zTop - zBot) * 0.38)) / ((y1 - y0) * 0.42));
    if (m === 'bone') return PAINT_SHADE;
    if (m === 'dark') return CLOTH[0];
    const fold = Math.sin(u * 12);
    return CLOTH[fold > 0.5 ? 2 : fold < -0.5 ? 0 : 1];
  });
}

/** A SCONCE of iron on a face at y, holding a bowl of the cult's pink fire at (x, z): frame `f` its flicker. */
export function sconce(F: Front, x: number, y: number, z: number, f: number, iron: Ramp): void {
  const id = F.id();
  F.rod([x, y, z - 10], [x, y + 5, z - 3], 0.9, iron, 0.9, id);
  F.egg([x, y + 5, z - 1], [3.4, 3.4, 2.2], (n) => (n[2] > 0.6 ? iron[1] : toneAt(n, iron, 0.1)), id);
  // the fire: tongues licking up, flickering by the frame
  const fid = F.id();
  for (let k = 0; k < 3; k++) {
    const sway = [0, 1, -1, 0.5][(f + k) % 4] * 0.8;
    const hgt = 7 + ((f + k * 2) % 3) * 1.6 - k * 1.2;
    F.egg([x + (k - 1) * 1.6 + sway * 0.4, y + 5, z + 2 + hgt * 0.42], [1.8 - k * 0.2, 1.8, hgt * 0.5], (_n, w) => {
      const t = (w[2] - z) / (hgt + 2);
      return FLAME[t > 0.7 ? 1 : t > 0.45 ? 2 : t > 0.2 ? 3 : 4];
    }, fid);
  }
  F.light([x, y + 5, z + 4], 22 + (f % 2) * 2, FLAME[2], 0.34);
}

/** THE CULT'S SIGIL painted on a face (a lintel, a shield): the shrieking skull in its paint, `s` its size, centred at (x, z). */
export function sigil(F: Front, x: number, z: number, s: number, y: number, under: Paint): void {
  F.face([[x - s, y + 0.08, z - s * 1.2], [x + s, y + 0.08, z - s * 1.2], [x + s, y + 0.08, z + s * 1.1], [x - s, y + 0.08, z + s * 1.1]], (w, n) => {
    const m = shriekAt((w[0] - x) / s, (w[2] - z) / s);
    if (m === 'bone') return PAINT;
    if (m === 'dark') return under(w, n) ? mix(under(w, n)!, '#120e1a', 0.6) : null;
    return null;
  });
}

// =================================================================================================
// THE FLOORS' STUFFS: patterns of the world's point, each in a floor's own colours

/** COURSED ASHLAR (as the Quarry's): courses `course` high, blocks 22 to 30 along, the joints `joint`, a block weathered now and then. */
export function ashlar(r: Ramp, joint: string, seed: number, course = 12, len = 22): Paint {
  return (w, n) => {
    if (isTop(n)) return lit(n, r, hash(Math.floor(w[0] / 9), Math.floor(w[1] / 9), seed) > 0.7 ? 0 : -1, 0.05);
    const a = along(w, n);
    const z = w[2];
    const c = Math.floor(z / course);
    const zin = z - c * course;
    const L = len + Math.floor(hash(c, 1, seed) * 3) * 4;
    const off = hash(c, 2, seed) * L;
    const b = Math.floor((a + off) / L);
    const ain = a + off - b * L;
    if (zin < 1.05 || ain < 1.3) return joint;
    const by = hash(b, c, seed + 1) > 0.7 ? 1 : hash(b, c, seed + 1) < 0.2 ? -1 : 0;
    if (zin > course - 1.1 && n[1] > 0.3) return lit(n, r, by + 1);
    if (hash(b, c, seed + 2) > 0.94) return mix(lit(n, r, by), r[0], 0.3);
    return lit(n, r, by);
  };
}

/** BRICK: courses `h` high, bricks `len` along, laid in a bond, the mortar `mortar`; a brick darker now and then. */
export function brick(r: Ramp, mortar: string, seed: number, h = 5, len = 13): Paint {
  return (w, n) => {
    if (isTop(n)) return lit(n, r, -1);
    const a = along(w, n);
    const c = Math.floor(w[2] / h);
    const zin = w[2] - c * h;
    const off = c % 2 ? len / 2 : 0;
    const b = Math.floor((a + off) / len);
    const ain = a + off - b * len;
    if (zin < 0.9 || ain < 1.1) return mortar;
    const k = hash(b, c, seed);
    return lit(n, r, k > 0.82 ? -1 : k < 0.1 ? 1 : 0);
  };
}

/** RUBBLE: rough stones of any size fitted together, `size` about each, the gaps dark (a field wall, a fort's lower courses). */
export function rubble(r: Ramp, gap: string, seed: number, size = 11): Paint {
  return (w, n) => {
    const a = along(w, n);
    const z = isTop(n) ? w[1] : w[2];
    // (a jittered grid's nearest two points: the stone is the nearest, its edge where the two are nearly as near)
    const gx = Math.floor(a / size);
    const gz = Math.floor(z / (size * 0.72));
    let d1 = Infinity;
    let d2 = Infinity;
    let k1 = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const cx = (gx + i + 0.15 + hash(gx + i, gz + j, seed) * 0.7) * size;
        const cz = (gz + j + 0.15 + hash(gx + i, gz + j, seed + 1) * 0.7) * size * 0.72;
        const d = Math.hypot((a - cx) * 0.8, z - cz);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          k1 = hash(gx + i, gz + j, seed + 2);
        } else if (d < d2) d2 = d;
      }
    }
    if (d2 - d1 < 1.1) return gap;
    // (each stone rounded: lit along its upper edge)
    const edge = d2 - d1 < 2.4;
    return lit(n, r, (k1 > 0.75 ? 1 : k1 < 0.2 ? -1 : 0) + (edge && k1 > 0.4 ? 1 : 0));
  };
}

/** PLANKS: boards `width` wide, up and down (`up`) or along, their joints dark, a grain of their own, now and then a knot. */
export function planks(r: Ramp, seed: number, width = 7, up = true): Paint {
  return (w, n) => {
    const a = up ? along(w, n) : w[2];
    const b = Math.floor(a / width);
    const ain = a - b * width;
    if (ain < 0.9) return r[0];
    const k = hash(b, 7, seed);
    const grainAt = up ? w[2] : along(w, n);
    const g = Math.sin(grainAt * 0.9 + k * 20 + Math.sin(grainAt * 0.21 + b) * 2);
    if (g > 0.93) return lit(n, r, -1);
    if (hash(b, Math.floor(grainAt / 9), seed + 3) > 0.97) return r[0];
    return lit(n, r, k > 0.7 ? 1 : k < 0.25 ? -1 : 0);
  };
}

/** LOGS laid along (a stockade's, a blockhouse's): each round, lit on its upper side, its bark's ridges, `d` thick. */
export function logs(r: Ramp, seed: number, d = 8, up = false): Paint {
  return (w, n) => {
    const a = up ? along(w, n) : w[2];
    const b = Math.floor(a / d);
    const t = (a - b * d) / d;
    if (t < 0.08) return r[0];
    const round = up ? (t < 0.35 ? 1 : t > 0.75 ? -1 : 0) : t > 0.65 ? 1 : t < 0.25 ? -1 : 0;
    const ridge = hash(Math.floor((up ? w[2] : along(w, n)) / 3), b, seed) > 0.82 ? -1 : 0;
    return lit(n, r, round + ridge);
  };
}

/** PLASTER or LIMEWASH: smooth, stained here and there toward the foot, cracked now and then. */
export function plaster(r: Ramp, seed: number): Paint {
  return (w, n) => {
    const a = along(w, n);
    const stain = Math.sin(a * 0.11 + seed) * 0.5 + Math.sin(w[2] * 0.07 + a * 0.03) * 0.5;
    const low = w[2] < 14 + 6 * Math.sin(a * 0.2 + seed) ? -1 : 0;
    if (hash(Math.floor(a / 2), Math.floor(w[2] / 2), seed) > 0.985) return lit(n, r, -2);
    return lit(n, r, low + (stain > 0.75 ? -1 : 0));
  };
}

/** IRON PLATES riveted: plates `pw` by `ph`, their edges dark, a rivet at each corner and along; rust now and then (`rust`). */
export function plates(r: Ramp, seed: number, pw = 16, ph = 14, rust?: Ramp): Paint {
  return (w, n) => {
    const a = along(w, n);
    const z = w[2];
    const ia = Math.floor(a / pw);
    const iz = Math.floor(z / ph);
    const ua = a - ia * pw;
    const uz = z - iz * ph;
    if (ua < 0.9 || uz < 0.9) return r[0];
    if ((ua < 3 || ua > pw - 2.2) && (Math.abs(uz - 3) < 1 || Math.abs(uz - ph + 2.5) < 1 || Math.abs(uz - ph / 2) < 0.9)) return r[4];
    if (rust && hash(Math.floor(a / 3), Math.floor(z / 3), seed) > 0.9) return lit(n, rust, 0);
    return lit(n, r, hash(ia, iz, seed) > 0.7 ? 1 : 0);
  };
}

/** SHINGLES or TILES on a roof (rows along x, each overlapping the one below): `row` deep, `len` along. */
export function tiles(r: Ramp, seed: number, row = 6, len = 8): Paint {
  return (w, n) => {
    const a = w[0];
    const v = w[2] * 0.7 + Math.abs(w[1]) * 0.7;
    const c = Math.floor(v / row);
    const vin = v - c * row;
    const off = c % 2 ? len / 2 : 0;
    const b = Math.floor((a + off) / len);
    const ain = a + off - b * len;
    if (vin < 1) return r[0];
    if (ain < 0.9) return r[1];
    const k = hash(b, c, seed);
    return lit(n, r, (vin > row - 1.6 ? 1 : 0) + (k > 0.8 ? -1 : 0));
  };
}

/** SKULLS AND LONG BONES set in a wall (the Ossuary's): rows of skulls, their sockets dark, between rows of bones laid end on. */
export function boneWall(r: Ramp, dark: string, seed: number): Paint {
  return (w, n) => {
    const a = along(w, n);
    const z = w[2];
    const row = Math.floor(z / 9);
    const zin = z - row * 9;
    if (row % 2 === 0) {
      // a row of bones' ends: little rounds
      const b = Math.floor((a + (row % 4 ? 2 : 0)) / 4.2);
      const u = (a + (row % 4 ? 2 : 0)) - b * 4.2;
      const d = Math.hypot(u - 2.1, zin - 4.5);
      if (d > 2.2) return dark;
      return lit(n, r, d < 1 ? 1 : 0);
    }
    // a row of skulls
    const s = Math.floor((a + row * 3) / 9);
    const u = (a + row * 3) - s * 9 - 4.5;
    const v = zin - 4.5;
    if (Math.hypot(u / 4.2, v / 4.5) > 1) return dark;
    if (v < 0.6 && v > -1.8 && Math.abs(Math.abs(u) - 1.6) < 1.1) return dark; // the sockets
    if (v < -2.4 && Math.abs(u) < 0.6) return dark;
    return lit(n, r, (v > 2 ? 1 : 0) + (hash(s, row, seed) > 0.8 ? -1 : 0));
  };
}

/** LEAVES (a hedge, ivy): a dense clump-pattern, its upper edges lit. */
export function leaves(r: Ramp, seed: number, grain = 3): Paint {
  return (w, n) => {
    const a = along(w, n);
    const z = isTop(n) ? w[1] * 0.7 : w[2];
    const k = hash(Math.floor(a / grain), Math.floor(z / grain), seed);
    const k2 = hash(Math.floor(a / grain) + 1, Math.floor(z / grain) - 1, seed);
    return lit(n, r, (k > 0.66 ? 1 : k < 0.2 ? -1 : 0) + (k2 > 0.85 ? -1 : 0), isTop(n) ? 0.1 : 0);
  };
}

/** PANES OF GLASS in leading (`pw` by `ph`), each a sheen across it from the upper left, its lead dark. */
export function panes(glass: Ramp, lead: string, pw = 7, ph = 10): Paint {
  return (w, n) => {
    const a = along(w, n);
    const z = w[2];
    const ua = a - Math.floor(a / pw) * pw;
    const uz = z - Math.floor(z / ph) * ph;
    if (ua < 0.8 || uz < 0.8) return lead;
    const sheen = ua * 0.6 - uz * 0.4;
    return lit(n, glass, Math.abs(sheen - 1) < 0.9 ? 2 : sheen > 2.2 ? 0 : 1);
  };
}

/** MARBLE: smooth, a vein running through it now and then. */
export function marble(r: Ramp, vein: string, seed: number): Paint {
  return (w, n) => {
    const a = along(w, n);
    const v = Math.sin(a * 0.13 + w[2] * 0.21 + Math.sin(a * 0.05 + seed) * 3);
    if (Math.abs(v) < 0.04) return vein;
    return lit(n, r, v > 0.6 ? 1 : 0);
  };
}

/** A plain stuff: its tone by the light alone (a sill, a cornice, a moulding), `by` tones moved. */
export const plain = (r: Ramp, by = 0, bias = 0): Paint => (_w, n) => lit(n, r, by, bias);

/** Paint `a` where `test` says, `b` elsewhere. */
export const where = (test: (w: V3, n: V3) => boolean, a: Paint, b: Paint): Paint => (w, n) => (test(w, n) ? a(w, n) : b(w, n));

/** MOSS or GRIME creeping up a stuff from its foot (`high` its reach), in `r`. */
export function creeping(under: Paint, r: Ramp, high: number, seed: number): Paint {
  return (w, n) => {
    const a = along(w, n);
    const reach = high * (0.5 + 0.5 * Math.sin(a * 0.17 + seed) * Math.sin(a * 0.05 + seed * 2)) + hash(Math.floor(a / 2), 0, seed) * 4;
    if (w[2] < reach && hash(Math.floor(a / 2), Math.floor(w[2] / 2), seed + 1) > w[2] / Math.max(1, reach) - 0.15) return lit(n, r, hash(Math.floor(a), Math.floor(w[2]), seed) > 0.6 ? 0 : -1);
    return under(w, n);
  };
}

/** The pieces' frames: the door sealed, its mark's four frames of flicker, then open. */
export function frames(make: (open: boolean, f: number) => Sprite): Sprite[] {
  return [0, 1, 2, 3].map((f) => make(false, f)).concat([make(true, 0)]);
}

/** ROOFING (slates, tiles, shingles) in rows by height, `along` the axis its ridge runs on (0 x, 1 y): rows `row` high, each piece `len` along, the rows' lower edges lit. */
export function roofing(r: Ramp, seed: number, alongAxis: 0 | 1, row = 5, len = 7): Paint {
  return (w, n) => {
    const a = w[alongAxis];
    const c = Math.floor(w[2] / row);
    const vin = w[2] - c * row;
    const off = c % 2 ? len / 2 : 0;
    const b = Math.floor((a + off) / len);
    const ain = a + off - b * len;
    if (vin < 0.9) return r[0];
    if (ain < 0.8) return at(r, toneIndex(n, r) - 1);
    const k = hash(b, c, seed);
    return lit(n, r, (vin < 2 ? 1 : 0) + (k > 0.82 ? -1 : k < 0.08 ? 1 : 0));
  };
}

/** BARS of iron across an opening: upright rods from (x0..x1) at y, z0 to z1, `every` apart. */
export function bars(F: Front, x0: number, x1: number, y: number, z0: number, z1: number, every: number, iron: Ramp, r = 0.9): void {
  const id = F.id();
  for (let x = x0 + every / 2; x < x1; x += every) F.rod([x, y, z0], [x, y, z1], r, iron, r, id);
  F.rod([x0, y, (z0 + z1) / 2], [x1, y, (z0 + z1) / 2], r * 0.8, iron, r * 0.8, id);
}

/** A WINDOW in a face at y: its dark, or its glow (`glow`, warm light within), from (x0, z0) to (x1, z1), round-topped if `round`; a light with it. */
export function window(F: Front, x0: number, x1: number, y: number, z0: number, z1: number, inside: string, round = false, glow?: string): void {
  const cx = (x0 + x1) / 2;
  const hw = (x1 - x0) / 2;
  F.face([[x0, y + 0.05, z0], [x1, y + 0.05, z0], [x1, y + 0.05, z1], [x0, y + 0.05, z1]], (w) => {
    if (round && w[2] > z1 - hw && Math.hypot(w[0] - cx, w[2] - (z1 - hw)) > hw) return null;
    return inside;
  });
  if (glow) F.light([cx, y + 2, (z0 + z1) / 2], 16, glow, 0.3);
}

/**
 * A ROUND TOWER (or a turret), `sides` faces about (cx, cy), `r` out, from z0 to z1: each face painted by `paint` at the point
 * (u, u, z), u its way round (so the floors' patterns run round it), lit as that face is turned; a cone of `roof` on it to `apex`.
 */
export function tower(F: Front, cx: number, cy: number, r: number, z0: number, z1: number, paint: Paint, roof?: Paint, apex = 0, sides = 12, eave = 3): void {
  const id = F.id();
  for (let k = 0; k < sides; k++) {
    const a0 = (k / sides) * Math.PI * 2;
    const a1 = ((k + 1) / sides) * Math.PI * 2;
    const p0: V3 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r, z0];
    const p1: V3 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, z0];
    const u0 = a0 * r;
    F.face([p0, p1, [p1[0], p1[1], z1], [p0[0], p0[1], z1]], (w, n) => {
      const u = u0 + Math.hypot(w[0] - p0[0], w[1] - p0[1]);
      return paint([u, u, w[2]], n);
    }, id);
  }
  if (roof && apex > z1) {
    const rid = F.id();
    const R = r + eave;
    for (let k = 0; k < sides; k++) {
      const a0 = (k / sides) * Math.PI * 2;
      const a1 = ((k + 1) / sides) * Math.PI * 2;
      F.tri([cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, z1 - eave * 0.6], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, z1 - eave * 0.6], [cx, cy, apex], (w, n) => {
        const u = (Math.atan2(w[1] - cy, w[0] - cx) + Math.PI) * r;
        return roof([u, u, w[2]], n);
      }, rid);
    }
  }
}

/** A WHEEL standing on the plane x = `x` (turned to the right), its hub at (y, z), `R` round: rim, spokes, paddles. */
export function wheel(F: Front, x: number, y: number, z: number, R: number, wood: Ramp, spokes = 8, paddle = 0): void {
  const id = F.id();
  const N = 24;
  for (let k = 0; k < N; k++) {
    const a0 = (k / N) * Math.PI * 2;
    const a1 = ((k + 1) / N) * Math.PI * 2;
    F.rod([x, y + Math.cos(a0) * R, z + Math.sin(a0) * R], [x, y + Math.cos(a1) * R, z + Math.sin(a1) * R], 1.6, wood, 1.6, id);
    F.rod([x + 4, y + Math.cos(a0) * R, z + Math.sin(a0) * R], [x + 4, y + Math.cos(a1) * R, z + Math.sin(a1) * R], 1.4, wood, 1.4, id);
  }
  for (let k = 0; k < spokes; k++) {
    const a = (k / spokes) * Math.PI * 2;
    F.rod([x + 2, y, z], [x + 2, y + Math.cos(a) * R, z + Math.sin(a) * R], 1.1, wood, 1.1, id);
  }
  if (paddle) {
    for (let k = 0; k < spokes * 2; k++) {
      const a = (k / (spokes * 2)) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      F.face([[x - 0.5, y + c * R, z + s * R], [x + 4.5, y + c * R, z + s * R], [x + 4.5, y + c * (R + paddle), z + s * (R + paddle)], [x - 0.5, y + c * (R + paddle), z + s * (R + paddle)]], (_w, n) => lit(n, wood, 0), id);
    }
  }
  F.ball([x + 2, y, z], 2.6, wood, 0.2);
}

/** SHELVES OF BOOKS on a face: rows `row` high, the books' spines each its own leather (`leathers`), their bands of gilt, the shelf's board between. */
export function books(leathers: readonly Ramp[], board: Ramp, back: string, gilt: string, seed: number, row = 14): Paint {
  return (w, n) => {
    const a = along(w, n);
    const r = Math.floor(w[2] / row);
    const zin = w[2] - r * row;
    if (zin < 2) return lit(n, board, zin > 1.2 ? 1 : 0);
    // (the books along the row: widths of their own, some leaning short)
    let x = -400 + hash(r, 1, seed) * 3;
    let k = 0;
    while (x < a) {
      x += 2.2 + Math.floor(hash(k, r, seed) * 3) * 0.8;
      k++;
    }
    const tall = row - 2.5 - hash(k, r, seed + 1) * 3.5;
    if (zin > tall) return back;
    if (x - a < 0.45) return back;
    const L = leathers[Math.floor(hash(k, r, seed + 2) * leathers.length)];
    if (Math.abs(zin - tall + 2) < 0.5 || Math.abs(zin - 4) < 0.5) return gilt;
    return lit(n, L, 0);
  };
}
