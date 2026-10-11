// THE KIT OF A CRYPT FLOOR'S PIECES: what every floor themed after its boss is laid with (a mock-up;
// nothing of the game imports it). The ways floor 1, the Warden's (art/floor1.ts, with his yes by 12:00
// on 10 Oct 2026), set its pieces in a wall's face, lay them flat on the floor along its lines, cut
// them into a floor tile, and build what stands on the grid; the same measures, so that the main chat
// takes every floor's pieces the same way. Floor 1 keeps its own copies, as he said yes to them; the
// floors after it are laid with these.
//
// Measures as the game's (art/isokit.ts): picture pixels, two to a game pixel; a tile 64 x 32 on the
// screen; along +x 32 right and 16 down, along +y 32 left and 16 down; heights up.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { Theme } from './ground';
import type { Iso, SideShader } from './isokit';
import { GRAIN, hash, mix } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER } from './props';
import type { Spot } from './floor1';

export type { Moment, Piece, PieceKind, Spot, Track } from './floor1';

/** The dark of a hole in stone. */
export const DEEP = '#07060f';
/** The dark the walls fade into at their tops (art/ground.ts, BEYOND). */
export const BEYOND = '#07050a';
/** The colours of what gives off its own light (a fire, embers): never put in a face's shade, nor in the dark the wall fades into. */
export const SHINES = new Set<string>([...EMBER, COAL[2], COAL[3], '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058']);

/** A shade of a ramp's tone on a face turned away from the light. */
export function shaded(c: string): string {
  return mix(c, '#06051a', 0.32);
}
export function darkened(r: Ramp): Ramp {
  return r.map(shaded) as unknown as Ramp;
}
export function recolor(p: Px, f: (c: string) => string): Px {
  const out = new Px(p.w, p.h);
  const memo = new Map<string, string>();
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      let to = memo.get(c);
      if (!to) memo.set(c, (to = f(c)));
      out.set(x, y, to);
    }
  }
  return out;
}

// =================================================================================================
// IN A WALL'S FACE

/** A flat picture painted upright, `u` across from its middle and `v` up from its foot. */
export const PW = 48;
export const PH = 120;
export const PCX = 24;
export const PFOOT = 104;
/** A wall's face: its solid stone 56 high, fading into the dark up to 80 (art/ground.ts). */
export const SOLID = 56;
export const TALL = 80;

/** A blank flat picture for a wall, and where (u, v) is on it. */
export function flat(): Px {
  return new Px(PW, PH);
}
export const fx = (u: number): number => PCX + u;
export const fy = (v: number): number => PFOOT - v;

/**
 * A FLAT PICTURE SET INTO A WALL'S FACE: the face turned to screen-left (`alongX`, a plane along +x,
 * in the light) or the one turned to screen-right (along +y, in shade). As the walls' faces do,
 * each column drops a pixel for every two across (art/ground.ts, bottomRow). Anchored at the foot of
 * the face under the middle of its tile; a tile's face is 32 across (u -16 to 15) and the solid
 * stone of it 56 high: above that the wall fades into the dark in four steps, and so does what is
 * on it there (art/ground.ts, faded), but what gives off light.
 */
export function onFacePx(picture: Px, alongX: boolean): Px {
  const by = alongX ? (x: number): number => Math.floor((x - PCX) / 2) : (x: number): number => Math.floor((PCX - x) / 2);
  const out = new Px(PW, PH);
  const FADE = TALL - SOLID;
  for (let x = 0; x < PW; x++) {
    const k = by(x);
    for (let y = 0; y < PH; y++) {
      let c = picture.get(x, y);
      if (!c) continue;
      if (!SHINES.has(c)) {
        if (!alongX) c = shaded(c);
        const v = PFOOT - y;
        const fromTop = TALL - 1 - v;
        if (fromTop < FADE) c = mix(c, BEYOND, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
      }
      out.set(x, y + k, c);
    }
  }
  return out;
}
export function onFace(picture: Px, alongX: boolean, lights: readonly Light[] = []): Sprite {
  const s = onFacePx(picture, alongX).sprite(PCX, PFOOT, GRAIN);
  if (lights.length) s.lights = lights.map((l) => ({ ...l }));
  return s;
}

/** A wall piece, painted about its own middle and set `du` across the face and `dv` up it, on both faces. */
export function wallPiece(paint: (p: Px) => void, lights: (alongX: boolean) => Light[] = () => [], du = 0, dv = 0): { left: Sprite; right: Sprite } {
  const painted = flat();
  paint(painted);
  const p = flat();
  p.blit(painted, du, -dv);
  return { left: onFace(p, true, lights(true)), right: onFace(p, false, lights(false)) };
}
/** A wall piece's frames on both faces (a piece that moves is `paint(f)` for each frame). */
export function wallSet(paint: (p: Px) => void, frames = 1, light?: (f: number) => (alongX: boolean) => Light[], du = 0, dv = 0): { left: Sprite[]; right: Sprite[] } {
  const left: Sprite[] = [];
  const right: Sprite[] = [];
  for (let f = 0; f < frames; f++) {
    const w = wallPiece(frames > 1 ? (paint as unknown as (f: number) => (p: Px) => void)(f) : paint, light ? light(f) : undefined, du, dv);
    left.push(w.left);
    right.push(w.right);
  }
  return { left, right };
}
/** Every spot a wall piece may be set in, from a table of (across, up), its first the piece's own. */
export function spotsFrom(table: Record<string, ReadonlyArray<readonly [number, number]>>): (name: string, paint: (p: Px) => void, frames?: number, light?: (f: number, du: number, dv: number) => (alongX: boolean) => Light[]) => { left: Sprite[]; right: Sprite[]; spots: Spot[] } {
  return (name, paint, frames = 1, light) => {
    const spots = (table[name] ?? [[0, 0]]).map(([du, dv]) => ({ du, dv, ...wallSet(paint, frames, light ? (f) => light(f, du, dv) : undefined, du, dv) }));
    return { left: spots[0].left, right: spots[0].right, spots };
  };
}

/** A raised shape cut in relief: lit on the edges that face the light (up and to the left), dark on those that face away. */
export function relief(p: Px, r: Ramp, mask: (u: number, v: number) => boolean, u0: number, u1: number, v0: number, v1: number): void {
  for (let v = v0; v <= v1; v++) {
    for (let u = u0; u <= u1; u++) {
      if (!mask(u, v)) continue;
      const hi = !mask(u - 1, v) || !mask(u, v + 1);
      const lo = !mask(u + 1, v) || !mask(u, v - 1);
      p.set(fx(u), fy(v), hi && !lo ? r[3] : lo && !hi ? r[0] : r[2]);
      if (hi && !mask(u - 1, v + 1) && !lo) p.set(fx(u), fy(v), r[4]);
    }
  }
}
/** A shape cut into the stone: in shadow along the edges that face the light (the lip above them hides it), lit along the far ones. */
export function sunk(p: Px, r: Ramp, mask: (u: number, v: number) => boolean, u0: number, u1: number, v0: number, v1: number, floor: string): void {
  for (let v = v0; v <= v1; v++) {
    for (let u = u0; u <= u1; u++) {
      if (!mask(u, v)) continue;
      const nearLit = !mask(u - 1, v) || !mask(u, v + 1);
      const nearDark = !mask(u + 1, v) || !mask(u, v - 1);
      p.set(fx(u), fy(v), nearLit ? r[0] : nearDark ? r[3] : floor);
    }
  }
}

// =================================================================================================
// ON THE FLOOR

/**
 * A FLAT PICTURE LAID ON THE FLOOR ALONG ITS LINES: painted as if lying along the screen, then each
 * column slid down by half as far as it is across from the middle (`way` -1: up, lying along +y).
 * 64 x 56; anchored at the middle of its floor.
 */
export const LW = 64;
export const LH = 56;
export const LCX = LW / 2;
export const LCY = LH / 2;
export function lying(paint: (p: Px, under: Px) => void, way: 1 | -1 = 1): Px {
  const p = new Px(LW, LH);
  const under = new Px(LW, LH);
  paint(p, under);
  const out = new Px(LW, LH);
  for (const src of [under, p]) {
    for (let x = 0; x < LW; x++) {
      const k = way * Math.floor((x - LW / 2) / 2);
      for (let y = 0; y < LH; y++) {
        const c = src.get(x, y);
        if (c) out.set(x, y + k, c);
      }
    }
  }
  return out;
}

/** A point of a tile, from its middle: (u, v) each 0..1 along x and along y. */
export const mid = (u: number, v: number): [number, number] => [u - 0.5, v - 0.5];
/** A rectangle of the tile, (x0..x1, y0..y1) of u and v. */
export const box = (x0: number, x1: number, y0: number, y1: number) => (u: number, v: number): boolean => u >= x0 && u <= x1 && v >= y0 && v <= y1;

/** A FLOOR'S TILES: what is laid in a floor of `theme` (its flagstones round a slab, its mortar). */
export function tilesOf(theme: Theme): {
  around: (u: number, v: number) => string;
  tileOf: (paint: (u: number, v: number) => string | null, inside?: (u: number, v: number) => boolean, outside?: (u: number, v: number) => string) => Px;
  onTile: (paint: (u: number, v: number) => string | null, inside?: (u: number, v: number) => boolean) => Sprite;
} {
  const SLAB = theme.slab;
  /** The flagstones round a laid slab: the floor's own tones, in two stones. */
  const around = (u: number, v: number): string => {
    if (Math.abs(u - 0.5) < 0.012 || Math.abs(v - 0.5) < 0.012 || u < 0.012 || v < 0.012) return theme.mortar;
    return hash(Math.floor(u * 2), Math.floor(v * 2), 3) < 0.5 ? SLAB[1] : SLAB[2];
  };
  /**
   * A FLOOR TILE'S PICTURE (64 x 32, anchored at its top corner, as the floor's own), with a slab
   * laid in it: its gap round it and its two lips found pixel by pixel on the tile's own grid: the
   * gap in mortar, the lip along its far edges lit, along its near edges in shade. `paint` gives the
   * slab's face (or, with no slab, all of the tile); `outside`, the floor round it.
   */
  const tileOf = (paint: (u: number, v: number) => string | null, inside?: (u: number, v: number) => boolean, outside: (u: number, v: number) => string = around): Px => {
    const p = new Px(64, 32);
    const uv = (x: number, y: number): [number, number] => {
      const px = x + 0.5 - 32;
      const py = y + 0.5;
      return [(px / 32 + py / 16) / 2, (py / 16 - px / 32) / 2];
    };
    const inDiamond = (x: number, y: number): boolean => {
      if (y < 0 || y >= 32) return false;
      const hw = y < 16 ? 2 * y + 1 : 2 * (31 - y) + 1;
      return x >= 32 - hw && x < 32 + hw;
    };
    const M = (x: number, y: number): boolean => inDiamond(x, y) && (!inside || inside(...uv(x, y)));
    const gap = (x: number, y: number): boolean => M(x, y) && (!M(x - 1, y) || !M(x + 1, y) || !M(x, y - 1) || !M(x, y + 1));
    const N = (x: number, y: number): boolean => M(x, y) && !gap(x, y);
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 64; x++) {
        if (!inDiamond(x, y)) continue;
        const [u, v] = uv(x, y);
        let c: string | null;
        if (inside && !M(x, y)) c = outside(u, v);
        else if (inside && gap(x, y)) c = theme.mortar;
        else if (inside && !N(x, y - 1)) c = SLAB[3];
        else if (inside && !N(x, y + 1)) c = SLAB[0];
        else c = paint(u, v) ?? outside(u, v);
        p.set(x, y, c);
      }
    }
    return p;
  };
  const onTile = (paint: (u: number, v: number) => string | null, inside?: (u: number, v: number) => boolean): Sprite => tileOf(paint, inside).sprite(32, 0, GRAIN);
  return { around, tileOf, onTile };
}

// =================================================================================================
// WHAT STANDS, ON THE GRID

/** A block of a ramp: its top the high tone, its side to the light lit along its top and its lit edge, its side away in shade. */
export function block(iso: Iso, r: Ramp, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number): void {
  iso.box(x0, y0, x1, y1, z0, z1, { top: () => r[3], left: litSide(r), right: shadeSide(r) });
}
export function litSide(r: Ramp): SideShader {
  return (u, v, _w, h) => (v === 0 ? r[3] : v >= h - 1 ? r[1] : u === 0 ? r[3] : r[2]);
}
export function shadeSide(r: Ramp): SideShader {
  return (_u, v, _w, h) => (v === 0 ? r[2] : v >= h - 1 ? r[0] : mix(r[0], r[2], 0.4));
}

// =================================================================================================
// FIRE

/**
 * A FLAME, `h` rows tall from (x, base) up, `w` half wide at its widest, its tip `lean` pixels over.
 * Its rows are joined, so that leaning hard it bends and never breaks into loose pixels.
 */
export function flame(p: Px, x: number, base: number, h: number, w: number, lean: number): void {
  let prev = x;
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.2 + t * 0.8)) ** 0.8 * (1 - t * 0.3));
    const m = x + lean * t * t;
    let x0 = Math.floor(m - hw);
    let x1 = Math.ceil(m + hw);
    x0 = Math.min(x0, Math.round(prev));
    x1 = Math.max(x1, Math.round(prev) + 1);
    for (let xx = x0; xx < x1; xx++) {
      const d = Math.abs(xx + 0.5 - m) / hw;
      p.set(xx, base - i, d < 0.45 && t < 0.45 ? EMBER[4] : d < 0.8 && t < 0.72 ? EMBER[3] : t > 0.86 ? EMBER[1] : EMBER[2]);
    }
    prev = m;
  }
}

// =================================================================================================
// FOR THE MOMENTS

/** Where (x, y) is in a four-cornered piece (corners a, b, c, d: along a to b, up a to d), as [along, up], each about 0..1. */
export function quadUV(x: number, y: number, a: readonly [number, number], b: readonly [number, number], c: readonly [number, number], d: readonly [number, number]): [number, number] {
  let s = 0.5;
  let t = 0.5;
  for (let i = 0; i < 10; i++) {
    const ex = a[0] + (b[0] - a[0]) * s;
    const ey = a[1] + (b[1] - a[1]) * s;
    const gx = d[0] + (c[0] - d[0]) * s;
    const gy = d[1] + (c[1] - d[1]) * s;
    const px = ex + (gx - ex) * t;
    const py = ey + (gy - ey) * t;
    const dsx = (b[0] - a[0]) * (1 - t) + (c[0] - d[0]) * t;
    const dsy = (b[1] - a[1]) * (1 - t) + (c[1] - d[1]) * t;
    const dtx = gx - ex;
    const dty = gy - ey;
    const det = dsx * dty - dsy * dtx;
    if (Math.abs(det) < 1e-9) break;
    s += ((x - px) * dty - (y - py) * dtx) / det;
    t += (dsx * (y - py) - dsy * (x - px)) / det;
  }
  return [Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, t))];
}

/** Fill a polygon on the canvas, pixel by pixel (as Px.poly does), each pixel's colour from `colour(x, y)`. */
export function fillWith(p: Px, pts: ReadonlyArray<readonly [number, number]>, colour: (x: number, y: number) => string | null): void {
  if (pts.length < 3) return;
  const ys = pts.map((q) => q[1]);
  for (let y = Math.floor(Math.min(...ys)); y < Math.ceil(Math.max(...ys)); y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) {
        const c = colour(x, y);
        if (c) p.set(x, y, c);
      }
    }
  }
}

/** A soft cloud of dust, `r` high and 1.3 times as wide, ragged at its rim (different for each `seed`), lit on its upper left: two tones. */
export function dustCloud(p: Px, x: number, y: number, r: number, body: string, lit_: string, seed = 0): void {
  for (let yy = Math.floor(y - r); yy <= y + r; yy++) {
    for (let xx = Math.floor(x - r * 1.3); xx <= x + r * 1.3; xx++) {
      const q = (((xx + 0.5 - x) / 1.3) ** 2 + (yy + 0.5 - y) ** 2) / (r * r);
      if (q > 1 || (q > 0.55 && hash(xx, yy, 150 + seed) < 0.35 + (q - 0.55) * 1.3)) continue;
      p.set(xx, yy, xx - x + (yy - y) * 1.4 < -r * 0.9 ? lit_ : body);
    }
  }
}

/** Copy what is painted on `src` onto `dst` with its corner at (dx, dy), as Px.blit does, but straight from the pixels (fast, for the moments' big frames). With `dim`, each pixel taken that much of the way to `toward` (an [r, g, b]). */
export function fastBlit(dst: Px, src: Px, dx: number, dy: number, dim = 0, toward: readonly [number, number, number] = [7, 6, 15]): number {
  const s = src.d;
  const d = dst.d;
  let n = 0;
  for (let y = 0; y < src.h; y++) {
    const Y = y + dy;
    if (Y < 0 || Y >= dst.h) continue;
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      if (s[i + 3] === 0) continue;
      const X = x + dx;
      if (X < 0 || X >= dst.w) continue;
      const j = (Y * dst.w + X) * 4;
      d[j] = dim ? Math.round(s[i] + (toward[0] - s[i]) * dim) : s[i];
      d[j + 1] = dim ? Math.round(s[i + 1] + (toward[1] - s[i + 1]) * dim) : s[i + 1];
      d[j + 2] = dim ? Math.round(s[i + 2] + (toward[2] - s[i + 2]) * dim) : s[i + 2];
      d[j + 3] = 255;
      n++;
    }
  }
  return n;
}
/** How many pixels of `p` are painted. */
export function painted(p: Px): number {
  let n = 0;
  for (let i = 3; i < p.d.length; i += 4) if (p.d[i]) n++;
  return n;
}
