// Things drawn TURNED TO THE GRID (Version 14.5).
//
// The owner, 5 Oct 2026: "I think the issue with the flatness is that the game doesn't run on
// normal north-east-south-west directions. It's always at an angle. The dungeon never goes
// straight down or up, it's always northeast-southeast-southwest-northwest. So any sprite or
// doodad or whatever should always be seen at an angle. The forge near the blacksmith being the
// prime example".
//
// The floor and the walls are drawn that way and always were (art/ground.ts): a tile is a
// diamond, a wall a block with two faces that run along the diagonals. What STOOD on the floor was
// not: a forge, a tent, a chest were painted facing the screen straight on, as a drawing of their
// front, and set down on a floor that runs away at an angle. That is what read as flat.
//
// So a thing with sides is built here as the walls are: out of boxes that stand on the grid. A box
// shows its top and the two sides that face down the screen, to the left and to the right, and
// whatever is on a side (a hearth's mouth, a chest's lock, the runes on a slab) is drawn in the
// plane of that side and leans with it. What is round (a pillar, a barrel, an urn, a brazier's
// dish) looks the same from every side, and needs none of this.
//
// Measures: across the floor in TILES (x runs down the screen to the right, y down to the left:
// the game's own axes), heights in PICTURE pixels (two to a game pixel: a wall is 48 high). The
// light is from the upper left, as everywhere: a side that faces left is lit, one that faces right
// is in shade.

import { Px } from '../engine/px';

type Col = string | null | undefined;

/** Picture pixels across and down the screen for one tile along x (to the right) or along y (to the left). */
export const ISO_X = 32;
export const ISO_Y = 16;

/**
 * What paints a side. `u`: the column along it, 0 at its left end on the screen; `v`: the row
 * below its top edge (0 is the edge); `w`, `h`: how many columns and rows it has; `px`, `py`: the
 * pixel of the canvas that is being painted (for whoever must know where on the picture a part of
 * the side came to lie: a mouth that a fire is to burn in).
 */
export type SideShader = (u: number, v: number, w: number, h: number, px: number, py: number) => Col;
/** What paints a top. `u`, `v`: how far across it along x and along y, each 0..1. */
export type TopShader = (u: number, v: number) => Col;

export class Iso {
  /** `ox`, `oy`: where the point (0, 0) of the floor is on the canvas. */
  constructor(readonly p: Px, readonly ox: number, readonly oy: number) {}

  /** Where a point of the world is on the canvas. */
  at(x: number, y: number, z = 0): [number, number] {
    return [this.ox + (x - y) * ISO_X, this.oy + (x + y) * ISO_Y - z];
  }

  /** The flat top of a box: the part of the floor from (x0, y0) to (x1, y1), raised `z`. */
  top(x0: number, y0: number, x1: number, y1: number, z: number, shade: TopShader): this {
    const xs = [this.at(x0, y0, z), this.at(x1, y0, z), this.at(x1, y1, z), this.at(x0, y1, z)];
    const minX = Math.floor(Math.min(...xs.map((q) => q[0])));
    const maxX = Math.ceil(Math.max(...xs.map((q) => q[0])));
    const minY = Math.floor(Math.min(...xs.map((q) => q[1])));
    const maxY = Math.ceil(Math.max(...xs.map((q) => q[1])));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const dx = px + 0.5 - this.ox;
        const dy = py + 0.5 - this.oy + z;
        const wx = (dx / ISO_X + dy / ISO_Y) / 2;
        const wy = (dy / ISO_Y - dx / ISO_X) / 2;
        if (wx < x0 || wx >= x1 || wy < y0 || wy >= y1) continue;
        const c = shade((wx - x0) / (x1 - x0), (wy - y0) / (y1 - y0));
        if (c) this.p.set(px, py, c);
      }
    }
    return this;
  }

  /**
   * The side of a box that looks down the screen to the LEFT (its +y side): along x from x0 to
   * x1 at this y, from z0 up to z1. It hangs from the lower left edge of a top at z1 with no gap.
   */
  left(x0: number, x1: number, y: number, z0: number, z1: number, shade: SideShader): this {
    const first = Math.ceil(this.ox + (x0 - y) * ISO_X - 0.5);
    const last = Math.ceil(this.ox + (x1 - y) * ISO_X - 0.5) - 1;
    const w = last - first + 1;
    const h = Math.round(z1 - z0);
    for (let px = first; px <= last; px++) {
      const dx = px + 0.5 - this.ox;
      const r0 = Math.ceil(this.oy - z1 - 0.5 + 2 * ISO_Y * y + dx / 2);
      for (let v = 0; v < h; v++) {
        const c = shade(px - first, v, w, h, px, r0 + v);
        if (c) this.p.set(px, r0 + v, c);
      }
    }
    return this;
  }

  /** The side that looks down the screen to the RIGHT (its +x side): along y from y0 to y1 at this x. Its left end on the screen is at y1. */
  right(x: number, y0: number, y1: number, z0: number, z1: number, shade: SideShader): this {
    const first = Math.ceil(this.ox + (x - y1) * ISO_X - 0.5);
    const last = Math.ceil(this.ox + (x - y0) * ISO_X - 0.5) - 1;
    const w = last - first + 1;
    const h = Math.round(z1 - z0);
    for (let px = first; px <= last; px++) {
      const dx = px + 0.5 - this.ox;
      const r0 = Math.ceil(this.oy - z1 - 0.5 + 2 * ISO_Y * x - dx / 2);
      for (let v = 0; v < h; v++) {
        const c = shade(px - first, v, w, h, px, r0 + v);
        if (c) this.p.set(px, r0 + v, c);
      }
    }
    return this;
  }

  /** A whole box: its top, and the two sides that are seen. */
  box(x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, paint: { top: TopShader; left: SideShader; right: SideShader }): this {
    return this.top(x0, y0, x1, y1, z1, paint.top).left(x0, x1, y1, z0, z1, paint.left).right(x1, y0, y1, z0, z1, paint.right);
  }

  /**
   * A side that leans: a four-cornered piece between two edges that both run along x (so it
   * looks to the left), the lower from (xa0, ya, za) to (xa1, ya, za) and the upper from (xb0, yb,
   * zb) to (xb1, yb, zb). For a hood that draws in as it rises, a roof, a lid. `shade(t, s)`: how
   * far up it (0 at the lower edge) and how far along it (0 at the left).
   */
  slopeLeft(xa0: number, xa1: number, ya: number, za: number, xb0: number, xb1: number, yb: number, zb: number, shade: (t: number, s: number) => Col): this {
    return this.quad(this.at(xa0, ya, za), this.at(xa1, ya, za), this.at(xb1, yb, zb), this.at(xb0, yb, zb), shade);
  }

  /** The same, looking to the right: its edges run along y, at xa below and xb above. */
  slopeRight(xa: number, ya0: number, ya1: number, za: number, xb: number, yb0: number, yb1: number, zb: number, shade: (t: number, s: number) => Col): this {
    return this.quad(this.at(xa, ya1, za), this.at(xa, ya0, za), this.at(xb, yb0, zb), this.at(xb, yb1, zb), shade);
  }

  /** A four-cornered piece given by its corners on the canvas: lower left, lower right, upper right, upper left. */
  quad(a: readonly [number, number], b: readonly [number, number], c: readonly [number, number], d: readonly [number, number], shade: (t: number, s: number) => Col): this {
    const minX = Math.floor(Math.min(a[0], b[0], c[0], d[0]));
    const maxX = Math.ceil(Math.max(a[0], b[0], c[0], d[0]));
    const minY = Math.floor(Math.min(a[1], b[1], c[1], d[1]));
    const maxY = Math.ceil(Math.max(a[1], b[1], c[1], d[1]));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const st = unbilinear(px + 0.5, py + 0.5, a, b, c, d);
        if (!st) continue;
        const col = shade(st[1], st[0]);
        if (col) this.p.set(px, py, col);
      }
    }
    return this;
  }
}

/** Where a point is inside a four-cornered piece: [how far along (a to b), how far up (a to d)], each 0..1, or null if it is outside. */
function unbilinear(x: number, y: number, a: readonly [number, number], b: readonly [number, number], c: readonly [number, number], d: readonly [number, number]): [number, number] | null {
  // (by halving: the piece is never so bent that this fails)
  let s = 0.5;
  let t = 0.5;
  for (let i = 0; i < 12; i++) {
    const ex = a[0] + (b[0] - a[0]) * s;
    const ey = a[1] + (b[1] - a[1]) * s;
    const fx = d[0] + (c[0] - d[0]) * s;
    const fy = d[1] + (c[1] - d[1]) * s;
    const px = ex + (fx - ex) * t;
    const py = ey + (fy - ey) * t;
    // how the point moves with s and with t, and the step that would bring it to (x, y)
    const dsx = (b[0] - a[0]) * (1 - t) + (c[0] - d[0]) * t;
    const dsy = (b[1] - a[1]) * (1 - t) + (c[1] - d[1]) * t;
    const dtx = fx - ex;
    const dty = fy - ey;
    const det = dsx * dty - dsy * dtx;
    if (Math.abs(det) < 1e-9) return null;
    const rx = x - px;
    const ry = y - py;
    s += (rx * dty - ry * dtx) / det;
    t += (dsx * ry - dsy * rx) / det;
  }
  return s >= 0 && s < 1 && t >= 0 && t < 1 ? [s, t] : null;
}

/** A side of one flat colour with a lit line along its top edge and a darker one along its foot. */
export function plainSide(body: string, hi: string | null = null, lo: string | null = null): SideShader {
  return (_u, v, _w, h) => (hi && v === 0 ? hi : lo && v >= h - 1 ? lo : body);
}
