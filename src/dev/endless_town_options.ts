// Concept art, not part of the game: TEN IDEAS FOR THE ENDLESS TOWN, as quick painted sketches for the owner to pick from
// (the art chat, 11 Nov 2026). Nothing of the game imports this file (tests/endless_town_options.test.ts holds that).
//
// His queue item, 11 Nov 2026, 10:31, “Draw a new “Endless” town for endgame purposes”: a town unlike the two the game has,
// with everything an endless run needs; about five in all (one the endless town, the rest to unlock or buy); mock-ups until
// they are locked in. The words for it: docs/mockups/endless_town/README.md.
//
// Each sketch is the whole town as a phone held sideways would show it, in the game's slant (tiles twice as wide as deep), at
// night by torch and lamp, rougher than the game. Every station of THE LIST (the README) stands somewhere in each and is marked
// by a small plain word (`labels`, lettered by the page over the picture). What glows on a friend is cyan; pink and gold glows
// are the enemy's (only far down the way down, where the enemy is); an honest flame is orange.

import { bay, fbm, h, mix, rnd, scale } from './title_options_kit';
import type { C, Pt } from './title_options_kit';

/** A sketch's size in game pixels (the page shows each four times over). */
export const SW = 300;
export const SH = 140;

const BAND = (v: number, n: number): number => Math.max(0, Math.min(1, Math.ceil(v * n - 1e-9) / n));
const R = (c: C): number => (c >> 16) & 255;
const G = (c: C): number => (c >> 8) & 255;
const B = (c: C): number => c & 255;
const pack = (r: number, g: number, b: number): C =>
  (Math.max(0, Math.min(255, Math.round(r))) << 16) | (Math.max(0, Math.min(255, Math.round(g))) << 8) | Math.max(0, Math.min(255, Math.round(b)));

/** The picture: SW x SH colours (the title sketches' Pic, at this size). */
export class Sk {
  readonly d = new Int32Array(SW * SH);
  set(x: number, y: number, c: C): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= SW || y >= SH || c < 0) return;
    this.d[y * SW + x] = c;
  }
  get(x: number, y: number): C {
    return this.d[Math.max(0, Math.min(SH - 1, Math.floor(y))) * SW + Math.max(0, Math.min(SW - 1, Math.floor(x)))];
  }
  over(x: number, y: number, c: C, a: number): void {
    if (a > 0) this.set(x, y, a >= 1 ? c : mix(this.get(x, y), c, a));
  }
  add(x: number, y: number, c: C, a: number): void {
    if (a <= 0) return;
    const o = this.get(x, y);
    this.set(x, y, pack(R(o) + R(c) * a, G(o) + G(c) * a, B(o) + B(c) * a));
  }
  rect(x0: number, y0: number, w: number, hh: number, c: C): void {
    for (let y = Math.floor(y0); y < Math.floor(y0 + hh); y++) for (let x = Math.floor(x0); x < Math.floor(x0 + w); x++) this.set(x, y, c);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: C): void {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.set(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
  }
  poly(pts: readonly Pt[], c: C | ((x: number, y: number) => C)): void {
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [, y] of pts) {
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(SH - 1, Math.ceil(y1)); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(SW, Math.round(xs[k + 1])); x++) this.set(x, y, typeof c === 'function' ? c(x, y) : c);
    }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: C | ((x: number, y: number, n: number) => C)): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / Math.max(rx, 0.5), (y + 0.5 - cy) / Math.max(ry, 0.5));
        if (n <= 1) this.set(x, y, typeof c === 'function' ? c(x, y, n) : c);
      }
  }
  glow(cx: number, cy: number, rx: number, ry: number, c: C, a: number, bands = 4): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
        if (n < 1) this.add(x, y, c, a * BAND(1 - n, bands) * BAND(1 - n, bands));
      }
  }
  haze(cx: number, cy: number, rx: number, ry: number, c: C, a: number, bands = 4): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
        if (n < 1) this.over(x, y, c, a * BAND(1 - n, bands));
      }
  }
  /** The sky or the dark behind: rows y0..y1 through `cols`, dithered where they meet. */
  vgrad(y0: number, y1: number, cols: C[]): void {
    for (let y = Math.floor(y0); y < Math.floor(y1); y++) {
      const s = ((y - y0) / Math.max(1, y1 - y0 - 1)) * (cols.length - 1);
      const i = Math.min(cols.length - 2, Math.floor(s));
      for (let x = 0; x < SW; x++) this.set(x, y, bay(x, y) < s - i ? cols[i + 1] : cols[i]);
    }
  }
  stars(y0: number, y1: number, seed: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const x = Math.floor(rnd(i, 1, seed) * SW);
      const y = Math.floor(y0 + rnd(i, 2, seed) * (y1 - y0));
      const k = rnd(i, 3, seed);
      this.add(x, y, k > 0.8 ? 0xd8e0ff : 0x6870a8, k > 0.8 ? 0.8 : 0.5);
    }
  }
  /** The corners and edges a little darker (the game's vignette, in bands). */
  vignette(a: number): void {
    for (let y = 0; y < SH; y++)
      for (let x = 0; x < SW; x++) {
        const n = Math.hypot((x - SW / 2) / (SW * 0.62), (y - SH / 2) / (SH * 0.66));
        if (n > 0.7) this.set(x, y, scale(this.get(x, y), 1 - a * BAND((n - 0.7) / 0.5, 3)));
      }
  }
}

export interface Label {
  x: number;
  y: number;
  text: string;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SLANT: a tile (tx, ty) on the screen, x to the right and down, y to the left and down, z straight up, in game pixels.

type Ramp = readonly [C, C, C];
const ramp = (a: string, b: string, c: string): Ramp => [h(a), h(b), h(c)];

class Scene {
  readonly labels: Label[] = [];
  private q: { d: number; f: () => void }[] = [];
  /** How high the ground stands at a tile (0 but where a town is built in steps). */
  hf: (tx: number, ty: number) => number = () => 0;
  constructor(readonly p: Sk, readonly ox: number, readonly oy: number, readonly T: number) {}
  at(tx: number, ty: number, z = 0): Pt {
    return [this.ox + (tx - ty) * this.T, this.oy + ((tx + ty) * this.T) / 2 - z - this.hf(tx, ty)];
  }
  /** As `ground`, for ground standing z high. */
  groundAt(z: number, fn: (tx: number, ty: number, x: number, y: number) => C): void {
    for (let y = 0; y < SH; y++)
      for (let x = 0; x < SW; x++) {
        const u = (x + 0.5 - this.ox) / this.T;
        const v = (y + 0.5 + z - this.oy) / (this.T / 2);
        const c = fn((u + v) / 2, (v - u) / 2, x, y);
        if (c >= 0) this.p.set(x, y, c);
      }
  }
  /** Paint every pixel the ground covers: fn gets the tile under the pixel (as numbers) and gives a colour, or -1 for none. */
  ground(fn: (tx: number, ty: number, x: number, y: number) => C): void {
    for (let y = 0; y < SH; y++)
      for (let x = 0; x < SW; x++) {
        const u = (x + 0.5 - this.ox) / this.T;
        const v = (y + 0.5 - this.oy) / (this.T / 2);
        const c = fn((u + v) / 2, (v - u) / 2, x, y);
        if (c >= 0) this.p.set(x, y, c);
      }
  }
  /** To be drawn in order of nearness (tx + ty), nearest last. */
  put(tx: number, ty: number, f: () => void): void {
    this.q.push({ d: tx + ty, f });
  }
  flush(): void {
    this.q.sort((a, b) => a.d - b.d).forEach((e) => e.f());
    this.q = [];
  }
  /** A block from (tx, ty) w along x and d along y, hgt high, standing on z0: its top, its face toward the left (+y) and toward the right (+x). */
  box(tx: number, ty: number, w: number, d: number, hgt: number, r: Ramp, z0 = 0): void {
    const a = this.at(tx, ty, z0 + hgt);
    const b = this.at(tx + w, ty, z0 + hgt);
    const c = this.at(tx + w, ty + d, z0 + hgt);
    const e = this.at(tx, ty + d, z0 + hgt);
    const c0 = this.at(tx + w, ty + d, z0);
    const e0 = this.at(tx, ty + d, z0);
    const b0 = this.at(tx + w, ty, z0);
    this.p.poly([e, c, c0, e0], r[1]);
    this.p.poly([c, b, b0, c0], r[0]);
    this.p.poly([a, b, c, e], r[2]);
    this.p.line(e[0], e[1], c[0], c[1], mix(r[2], 0xffffff, 0.15));
  }
  /** A round post or tower: r tiles across its radius, hgt high, from z0. */
  cyl(tx: number, ty: number, r: number, hgt: number, rp: Ramp, z0 = 0): void {
    const [cx, cy] = this.at(tx, ty, z0);
    const rx = r * this.T * 1.414;
    const ry = rx / 2;
    const side = (x: number): C => {
      const k = (x - (cx - rx)) / (2 * rx);
      return k < 0.35 ? rp[1] : k < 0.8 ? mix(rp[1], rp[0], 0.5) : rp[0];
    };
    this.p.ellipse(cx, cy, rx, ry, (x) => side(x));
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) for (let y = Math.floor(cy - hgt); y <= cy; y++) if (Math.abs(x + 0.5 - cx) <= rx) this.p.set(x, y, side(x));
    this.p.ellipse(cx, cy - hgt, rx, ry, rp[2]);
  }
  /** A flat ring or disc on the ground. */
  disc(tx: number, ty: number, r: number, c: C | ((x: number, y: number, n: number) => C), z = 0): void {
    const [cx, cy] = this.at(tx, ty, z);
    const rx = r * this.T * 1.414;
    this.p.ellipse(cx, cy, rx, rx / 2, c);
  }
  light(tx: number, ty: number, z: number, c: C, r: number, a: number): void {
    const [x, y] = this.at(tx, ty, z);
    this.p.glow(x, y, r * this.T * 1.4, r * this.T * 0.8, c, a);
  }
  shade(tx: number, ty: number, r: number, a: number): void {
    const [x, y] = this.at(tx, ty);
    this.p.haze(x, y, r * this.T * 1.4, r * this.T * 0.7, 0x05040c, a);
  }
  label(tx: number, ty: number, z: number, text: string): void {
    const [x, y] = this.at(tx, ty, z);
    this.labels.push({ x, y, text });
  }
  /** An honest flame on a post top or a wall, and its light. */
  flame(tx: number, ty: number, z: number, big = 1): void {
    const [x, y] = this.at(tx, ty, z);
    this.p.glow(x, y, 26 * big, 14 * big, h('#ff8a2a'), 0.32);
    this.p.rect(x - 1, y - 2, 2, 3, h('#ff8a2a'));
    this.p.set(x, y - 3, h('#ffd070'));
    this.p.set(x - 1, y - 1, h('#ffd070'));
  }
  torch(tx: number, ty: number, post: Ramp, hgt = 12): void {
    const [x, y] = this.at(tx, ty);
    this.p.rect(x - 1, y - hgt, 2, hgt, post[1]);
    this.p.set(x, y - hgt, post[0]);
    this.flame(tx, ty, hgt + 2);
  }
  /** One of the town's people: a body, a head; a hood if `hood`. */
  fig(tx: number, ty: number, body: C, hood = false, z = 0): void {
    const [x, y] = this.at(tx, ty, z);
    const skin = h('#c89a78');
    const dk = scale(body, 0.65);
    this.p.ellipse(x, y, 3, 1.4, 0x05040c);
    this.p.rect(x - 2, y - 7, 4, 6, body);
    this.p.rect(x + 1, y - 7, 1, 6, dk);
    this.p.rect(x - 2, y - 1, 1, 1, dk);
    this.p.rect(x + 1, y - 1, 1, 1, dk);
    this.p.rect(x - 1, y - 10, 3, 3, hood ? dk : skin);
    if (hood) this.p.set(x, y - 9, skin);
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE STATIONS, the same in every town, each in the town's own stone, wood and cloth.

interface Look {
  stone: Ramp;
  wood: Ramp;
  cloth: readonly [C, C];
  iron: Ramp;
}
const CY = h('#22d0e0');
const CY_HI = h('#b8fff8');
const CY_LO = h('#0c6a80');
const FIRE = h('#ff8a2a');
const GOLD = h('#e0a040');
const IRON: Ramp = ramp('#24262e', '#3c404c', '#5a606e');

function smithy(S: Scene, x: number, y: number, L: Look): void {
  S.put(x, y, () => {
    S.box(x, y, 1.3, 1, 14, L.stone);
    S.box(x + 0.3, y + 0.2, 0.5, 0.5, 10, L.stone, 14);
    const [mx, my] = S.at(x + 0.65, y + 1, 4);
    S.p.rect(mx - 3, my - 3, 6, 4, h('#2a1008'));
    S.p.rect(mx - 2, my - 2, 4, 3, FIRE);
    S.p.rect(mx - 1, my - 1, 2, 2, h('#ffd070'));
  });
  S.put(x + 1, y + 2, () => {
    S.box(x + 0.7, y + 1.8, 0.5, 0.3, 4, IRON);
    S.fig(x + 1.6, y + 1.6, h('#7a5040'));
  });
  S.light(x + 0.65, y + 1.4, 4, FIRE, 2.2, 0.45);
  S.label(x + 0.6, y + 0.5, 30, 'smith');
}
function bazaar(S: Scene, x: number, y: number, L: Look): void {
  S.put(x + 1, y + 1, () => {
    const ap = S.at(x + 1, y + 1, 20);
    const b = S.at(x + 2, y);
    const c = S.at(x + 2, y + 2);
    const e = S.at(x, y + 2);
    const stripe = (k: number) => (xx: number) => (Math.floor(xx / 3) & 1 ? L.cloth[0] : scale(L.cloth[1], k));
    S.p.poly([ap, e, c], stripe(1));
    S.p.poly([ap, c, b], stripe(0.6));
    S.p.line(ap[0], ap[1] - 3, ap[0], ap[1], L.wood[1]);
  });
  S.put(x + 1.5, y + 2.6, () => {
    S.fig(x + 1.6, y + 2.2, h('#5a3a70'));
    S.box(x + 0.6, y + 2.5, 1.4, 0.5, 4, L.wood);
    const [tx, ty] = S.at(x + 1.3, y + 2.75, 4);
    S.p.set(tx - 4, ty, GOLD);
    S.p.set(tx - 1, ty - 1, h('#c03040'));
    S.p.set(tx + 2, ty, h('#4a8a50'));
    S.p.set(tx + 4, ty - 1, GOLD);
  });
  S.label(x + 1, y + 1, 26, 'bazaar');
}
/** The wordsmith's bench in its ring of runes: the slab with its round socket for the tablet (a hollow cut in four, empty). */
function wordsmith(S: Scene, x: number, y: number, L: Look, r = 1.6): void {
  S.disc(x, y, r, (xx, yy, n) => (n > 0.86 ? (bay(xx, yy) < 0.5 ? CY_LO : scale(L.stone[1], 0.8)) : n > 0.78 ? scale(L.stone[0], 0.9) : -1));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.4;
    const sx = x + Math.cos(a) * r;
    const sy = y + Math.sin(a) * r;
    S.put(sx, sy, () => {
      S.box(sx - 0.18, sy - 0.18, 0.36, 0.36, 10, ramp('#191a44', '#262a62', '#3a4088'));
      const [rx, ry] = S.at(sx, sy + 0.18, 6);
      S.p.set(rx - 1, ry, CY);
      S.p.set(rx - 1, ry - 1, CY_HI);
    });
  }
  S.put(x, y, () => {
    S.fig(x - 0.2, y - 0.8, h('#2e5a66'));
    S.box(x - 0.5, y - 0.3, 1, 0.6, 5, L.stone);
    const [cx, cy] = S.at(x, y, 5);
    S.p.ellipse(cx, cy, 4, 2, h('#0a0a18'));
    S.p.line(cx - 4, cy, cx + 4, cy, scale(L.stone[1], 0.7));
    S.p.line(cx, cy - 2, cx, cy + 2, scale(L.stone[1], 0.7));
  });
  S.light(x, y, 4, CY, r + 0.6, 0.2);
  S.label(x, y, 26, 'wordsmith');
  S.label(x + 0.9, y + 0.9, -3, 'socket');
}
function lexicon(S: Scene, x: number, y: number, L: Look): void {
  S.put(x, y, () => {
    const [px, py] = S.at(x, y);
    S.p.ellipse(px, py, 3, 1.5, 0x05040c);
    S.p.rect(px - 1, py - 8, 2, 8, L.wood[1]);
    S.p.poly([[px - 5, py - 9], [px + 5, py - 11], [px + 5, py - 9], [px - 5, py - 7]], h('#d8d0b8'));
    S.p.set(px - 3, py - 9, CY);
    S.p.set(px - 1, py - 9, CY);
    S.p.set(px + 2, py - 10, CY);
  });
  S.light(x, y, 10, CY, 1.1, 0.25);
  S.label(x, y, 20, 'lexicon');
}
function stash(S: Scene, x: number, y: number, L: Look): void {
  S.put(x, y, () => {
    S.box(x - 0.45, y - 0.3, 0.9, 0.6, 7, L.wood);
    const [cx, cy] = S.at(x, y + 0.3, 4);
    S.p.rect(cx - 1, cy - 1, 2, 2, CY);
    S.p.set(cx, cy - 1, CY_HI);
  });
  S.label(x, y, 18, 'stash');
}
function stranger(S: Scene, x: number, y: number): void {
  S.shade(x, y, 1.6, 0.6);
  S.put(x, y, () => S.fig(x, y, h('#2c2a36'), true));
  S.label(x, y, 18, 'stranger');
}
/** The gate, with the three sockets of the next dungeon's words on its lintel. `ys`: its arch faces the left (+y) when true, the right (+x) when false. */
function gate(S: Scene, x: number, y: number, L: Look, alongX = true): void {
  S.put(x, y, () => {
    if (alongX) {
      S.box(x, y, 0.5, 0.5, 22, L.stone);
      S.box(x + 2, y, 0.5, 0.5, 22, L.stone);
      S.box(x, y, 2.5, 0.5, 6, L.stone, 22);
      S.p.poly([S.at(x + 0.5, y + 0.5, 0), S.at(x + 2, y + 0.5, 0), S.at(x + 2, y + 0.5, 22), S.at(x + 0.5, y + 0.5, 22)], h('#06050e'));
      for (let k = 0; k < 3; k++) {
        const [sx, sy] = S.at(x + 0.8 + k * 0.45, y + 0.5, 25);
        S.p.rect(sx - 1, sy - 1, 2, 2, CY_LO);
      }
    } else {
      S.box(x, y, 0.5, 0.5, 22, L.stone);
      S.box(x, y + 2, 0.5, 0.5, 22, L.stone);
      S.box(x, y, 0.5, 2.5, 6, L.stone, 22);
      S.p.poly([S.at(x + 0.5, y + 0.5, 0), S.at(x + 0.5, y + 2, 0), S.at(x + 0.5, y + 2, 22), S.at(x + 0.5, y + 0.5, 22)], h('#06050e'));
      for (let k = 0; k < 3; k++) {
        const [sx, sy] = S.at(x + 0.5, y + 0.8 + k * 0.45, 25);
        S.p.rect(sx - 1, sy - 1, 2, 2, CY_LO);
      }
    }
  });
  S.label(alongX ? x + 1.25 : x + 0.25, alongX ? y + 0.25 : y + 1.25, 36, 'gate');
}
/** The waypoint: a low round dais, its ring and disc awake in the friend's cyan. */
function waypoint(S: Scene, x: number, y: number, L: Look, z = 0): void {
  S.put(x, y, () => {
    S.cyl(x, y, 0.75, 3, L.stone, z);
    S.disc(x, y, 0.62, (xx, yy, n) => (n > 0.8 ? CY : n > 0.55 ? CY_LO : n < 0.25 ? CY_HI : scale(L.stone[1], 0.6)), z + 3);
  });
  S.light(x, y, z + 3, CY, 1.8, 0.35);
}
/** Where the portal is to open: a round of floor kept clear, ringed by low dark posts, nothing in it yet. */
function portalPlace(S: Scene, x: number, y: number, r: number, L: Look, z = 0): void {
  S.disc(x, y, r, (xx, yy, n) => (n > 0.9 ? scale(L.stone[0], 0.8) : n > 0.84 ? scale(L.stone[2], 0.7) : -1), z);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    S.put(px, py, () => S.box(px - 0.1, py - 0.1, 0.2, 0.2, 5, L.stone, z));
  }
  S.label(x, y, z + 8, 'portal');
}
/** PROPOSED: how deep he has gone, a tall stone notched at every level. */
function record(S: Scene, x: number, y: number, L: Look): void {
  S.put(x, y, () => {
    S.box(x - 0.3, y - 0.3, 0.6, 0.6, 26, L.stone);
    for (let k = 0; k < 9; k++) {
      const [nx, ny] = S.at(x, y + 0.3, 3 + k * 2.4);
      S.p.line(nx - 3, ny, nx + 1, ny, k < 6 ? h('#e8e0d0') : scale(L.stone[1], 0.6));
    }
  });
  S.label(x, y, 34, 'record');
}
/** PROPOSED: the fallen bosses' trophies, four mounts on a low wall, two filled. */
function trophies(S: Scene, x: number, y: number, L: Look, alongX = true): void {
  S.put(x, y, () => {
    if (alongX) S.box(x, y, 2.4, 0.4, 14, L.stone);
    else S.box(x, y, 0.4, 2.4, 14, L.stone);
    for (let k = 0; k < 4; k++) {
      const [mx, my] = alongX ? S.at(x + 0.35 + k * 0.6, y + 0.4, 8) : S.at(x + 0.4, y + 0.35 + k * 0.6, 8);
      S.p.ellipse(mx, my, 2, 2, L.wood[1]);
      if (k < 2) {
        S.p.rect(mx - 1, my - 2, 3, 3, h('#d8d0bc'));
        S.p.set(mx, my - 1, 0x101018);
      }
    }
  });
  S.label(alongX ? x + 1.2 : x + 0.2, alongX ? y + 0.2 : y + 1.2, 22, 'trophies');
}
const paving = (r: Ramp, s: number, seed: number) => (tx: number, ty: number): C => {
  const fx = tx * s;
  const fy = ty * s;
  const i = Math.floor(fx);
  const j = Math.floor(fy);
  if (fx - i < 0.1 || fy - j < 0.1) return r[0];
  const k = rnd(i, j, seed);
  return k < 0.25 ? scale(r[1], 0.88) : k > 0.85 ? mix(r[1], r[2], 0.5) : r[1];
};

// ---------------------------------------------------------------------------------------------------------------------------

export interface TownOption {
  n: number;
  name: string;
  /** Floor N's or 'new'. */
  from: string;
  line: string;
  paint: (p: Sk) => Label[];
}

// 1. THE SHAFT'S RIM (new): the town round the head of the stair with no bottom.
function paintRim(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#07061a'), h('#0b0a1e'), h('#0e0c1e')]);
  const S = new Scene(p, 150, 18, 10.5);
  const L: Look = { stone: ramp('#3a3446', '#5a5064', '#7e7488'), wood: ramp('#3a2030', '#5a3040', '#7a4a50'), cloth: [h('#6e2a2a'), h('#c8b890')], iron: IRON };
  const pave = paving(L.stone, 1.4, 3);
  S.ground((tx, ty) => {
    const r = Math.hypot(tx - 6, ty - 6);
    if (r > 6.4) return r > 7.4 ? -1 : scale(L.stone[0], 0.7);
    if (r < 2.7) return -1;
    if (r < 2.95) return L.stone[2];
    return pave(tx, ty);
  });
  // (the shaft: ring under ring of every floor's stone, each lower and smaller, the stair on its wall)
  const stones = ['#4e4a5a', '#be8262', '#5a5661', '#c4bebc', '#8a8094', '#958474'].map(h);
  const [cx, cy] = S.at(6, 6);
  for (let k = 0; k < 12; k++) {
    const rx = 2.7 * 10.5 * 1.414 * Math.pow(0.83, k);
    const c = scale(stones[k % 6], Math.max(0.12, 0.6 - k * 0.05));
    p.ellipse(cx, cy + k * 2.6 * Math.pow(0.9, k), rx, rx / 2, (x, y, n) => (n > 0.93 ? scale(c, 0.55) : (Math.floor((x - cx) / 3 + k) & 3) === 0 && n > 0.75 ? scale(c, 1.35) : c));
  }
  p.glow(cx, cy + 22, 8, 4, h('#ff4f8a'), 0.7, 3);
  p.set(cx, cy + 22, h('#ffb070'));
  // (the portal's place: a round of stone out over the middle of the shaft on one span)
  S.put(6.5, 3.2, () => S.box(5.75, 2.4, 0.5, 1.5, 3, L.stone, -1));
  S.put(6, 6, () => S.cyl(6, 5.2, 1.0, 4, L.stone, -1));
  portalPlace(S, 6, 5.2, 0.85, L, 3);
  // (the rim's things round it, like the hours on a clock)
  const pos = (deg: number, r: number): [number, number] => [6 + Math.cos((deg * Math.PI) / 180) * r, 6 + Math.sin((deg * Math.PI) / 180) * r];
  gate(S, ...pos(-112, 5.2), L);
  waypoint(S, ...pos(-104, 3.6), L);
  S.label(...pos(-104, 3.6), 10, 'way down');
  smithy(S, ...pos(-40, 4.9), L);
  bazaar(S, ...pos(10, 4.0), L);
  wordsmith(S, ...pos(55, 4.4), L, 1.1);
  lexicon(S, ...pos(110, 4.0), L);
  stash(S, ...pos(140, 4.6), L);
  stranger(S, ...pos(178, 5.4));
  trophies(S, ...pos(-160, 5.6), L, false);
  record(S, ...pos(-140, 4.0), L);
  for (let k = 0; k < 10; k++) {
    const [tx, ty] = pos(k * 36 + 18, 3.05);
    S.put(tx, ty, () => S.box(tx - 0.08, ty - 0.08, 0.16, 0.16, 4, L.stone));
  }
  S.flush();
  for (const d of [-75, -5, 85, 160]) S.flame(...pos(d, 6.1), 14);
  p.vignette(0.5);
  return S.labels;
}

// 2. THE QUARRY TERRACES (floor 6, the Quarry): three steps of hewn stone up to the back, a crane over the top one.
function paintQuarry(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#0a0a20'), h('#141634'), h('#1c1a34')]);
  p.stars(0, 50, 6, 70);
  const S = new Scene(p, 150, 30, 9.5);
  const L: Look = { stone: ramp('#4d465c', '#8a8094', '#aaa1a6'), wood: ramp('#3e2a26', '#6a4a3a', '#8a6a52'), cloth: [h('#4a5a7a'), h('#c8c0a8')], iron: IRON };
  // (the cliff behind: the cut face, sheer, in courses)
  p.poly([[0, 74], [50, 40], [110, 22], [190, 20], [260, 34], [300, 56], [300, 74]], (x, y) => ((y + Math.floor(x / 14)) % 9 < 1 ? L.stone[0] : scale(L.stone[1], 0.4 + 0.08 * fbm(x / 20, y / 9, 6))));
  // (the three terraces, each a step of hewn stone 10 high, the top one at the back)
  const STEP = 10;
  const lvl = (ty: number): number => (ty < 3.6 ? 2 : ty < 7.2 ? 1 : 0);
  const inside = (tx: number, ty: number): boolean => tx > -0.5 && ty > -0.5 && tx < 11 && ty < 11;
  for (const k of [2, 1, 0]) {
    const y0 = k === 2 ? -0.5 : k === 1 ? 3.6 : 7.2;
    S.groundAt(k * STEP, (tx, ty) => (inside(tx, ty) && lvl(ty) === k ? scale(paving(L.stone, 1, 6 + k)(tx, ty), 0.6 + k * 0.1) : -1));
    // (the riser below its front edge, down to the ground under it)
    const y1 = k === 2 ? 3.6 : k === 1 ? 7.2 : 11;
    const a = S.at(-0.5, y1, k * STEP);
    const b = S.at(11, y1, k * STEP);
    p.poly([a, b, [b[0], b[1] + STEP + 30], [a[0], a[1] + STEP + 30]], (x, y) => ((y - a[1] + Math.floor(x / 9)) % 5 < 1 ? L.stone[0] : scale(L.stone[1], 0.5)));
    void y0;
  }
  S.hf = (tx, ty) => lvl(ty) * STEP;
  // (the way down: a ramp cut down into the dark of the lower pit, front right)
  S.groundAt(0, (tx, ty) => (tx > 8.2 && tx < 10.4 && ty > 7.4 && ty < 11 ? mix(h('#08070e'), L.stone[0], Math.max(0, (11 - ty) / 5)) : -1));
  waypoint(S, 9.3, 7.9, L);
  S.label(9.3, 9.8, 0, 'way down');
  // (the crane over the top terrace, a block hung from it)
  S.put(10, 1, () => {
    S.box(9.8, 0.6, 0.3, 0.3, 36, L.wood);
    const a = S.at(9.95, 0.75, 36);
    const b = S.at(6.6, 0.75, 36);
    p.line(a[0], a[1], b[0], b[1], L.wood[2]);
    p.line(a[0], a[1] + 1, b[0], b[1] + 1, L.wood[1]);
    p.line(b[0], b[1], b[0], b[1] + 12, IRON[2]);
    S.box(6.3, 0.45, 0.6, 0.6, 7, L.stone, 17);
  });
  portalPlace(S, 2.0, 2.2, 1.1, L);
  gate(S, 3.6, -0.4, L);
  trophies(S, -0.4, 0.4, L, false);
  record(S, 0.4, 4.6, L);
  smithy(S, 7.6, 1.4, L);
  wordsmith(S, 3.4, 5.4, L, 1.2);
  lexicon(S, 6.6, 5.6, L);
  bazaar(S, 0.6, 7.6, L);
  stash(S, 4.6, 8.4, L);
  stranger(S, 7.3, 9.4);
  S.flush();
  S.torch(4.7, 3.3, L.wood);
  S.torch(8.2, 7.6, L.wood);
  S.torch(2.6, 8.4, L.wood);
  p.vignette(0.45);
  return S.labels;
}

// 3. THE STILT TOWN (floor 10, the Sunken Fen): each station on its own platform over black water, boardwalks between.
function paintStilts(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#06080e'), h('#0a1016'), h('#0c1418')]);
  const S = new Scene(p, 150, 16, 9.5);
  const L: Look = { stone: ramp('#2e3a22', '#5a5661', '#837e88'), wood: ramp('#2c2016', '#4e3a26', '#6e563a'), cloth: [h('#3e5a3a'), h('#b8a880')], iron: IRON };
  S.ground((tx, ty, x, y) => {
    const m = fbm(tx * 0.8, ty * 1.6, 10);
    const c = mix(h('#0a1414'), h('#16241e'), BAND(m, 4));
    return (y + Math.floor(m * 6)) % 7 === 0 ? scale(c, 1.4) : c;
  });
  const decks: [number, number, number, number][] = [
    [0.5, 0.5, 3, 2.6], [5, 0, 3.4, 2.4], [9, 1.5, 2.6, 3], [0, 5, 3, 3], [4.2, 4, 3.4, 3.4], [9.2, 6.5, 2.8, 2.6], [2.5, 9.5, 3, 2.3], [7, 10, 3, 2],
  ];
  const walks: [number, number, number, number][] = [
    [3.5, 1.4, 1.5, 0.5], [8.4, 1.6, 0.6, 0.5], [1.6, 3.1, 0.5, 1.9], [5.8, 2.4, 0.5, 1.6], [7.6, 5.3, 1.6, 0.5], [3, 6, 1.2, 0.5], [3.6, 8, 0.5, 1.5], [5.8, 7.4, 0.5, 2.6], [10, 9.1, 0.5, 0.9],
  ];
  for (const [x, y, w, d] of [...decks, ...walks]) {
    for (const [px, py] of [[x, y + d], [x + w, y + d], [x + w, y]] as const) {
      S.put(px, py, () => {
        const [a, b] = S.at(px, py);
        p.rect(a - 1, b - 2, 1, 6, L.wood[0]);
      });
    }
    S.put(x + w / 2, y + d / 2 - 1, () => S.box(x, y, w, d, 3, L.wood, 2));
  }
  // (reed beds)
  for (let i = 0; i < 60; i++) {
    const tx = rnd(i, 1, 10) * 13 - 1;
    const ty = rnd(i, 2, 10) * 13 - 1;
    const [x, y] = S.at(tx, ty);
    p.line(x, y, x + (rnd(i, 3, 10) - 0.5) * 3, y - 6, h('#3a4a2a'));
  }
  waypoint(S, 1.9, 6.4, L, 5);
  S.put(1.6, 7.6, () => S.box(0.8, 7.6, 1.6, 0.6, 0.5, ramp('#0a1210', '#142420', '#20342c'), 1));
  S.label(1.6, 6.5, 14, 'way down');
  smithy(S, 5.6, 0.2, L);
  bazaar(S, 9.2, 1.7, L);
  wordsmith(S, 5.9, 5.7, L, 1.2);
  lexicon(S, 1.6, 1.4, L);
  stash(S, 3.0, 10.4, L);
  stranger(S, 10.6, 7.8);
  portalPlace(S, 8.5, 11, 0.9, L, 5);
  trophies(S, 0.7, 0.6, L, false);
  record(S, 0.5, 7.5, L);
  gate(S, 9.6, 3.0, L, false);
  S.flush();
  for (const [tx, ty] of [[3, 2.6], [7.4, 2], [7.2, 7], [11.2, 8.8], [2.6, 11.4], [0.2, 7.6]]) {
    S.torch(tx, ty, L.wood, 15);
    const [x, y] = S.at(tx, ty);
    p.glow(x, y + 12, 6, 10, FIRE, 0.18, 3);
  }
  for (let y = 60; y < SH; y += 9) for (let x = 0; x < SW; x++) if (fbm(x / 30, y / 9, 3) > 0.62) p.over(x, y, h('#5a6a70'), 0.25);
  p.vignette(0.5);
  return S.labels;
}

// 4. THE READING HALL (floor 15, the Great Library): a hall walled in shelves, the Lexicon on a great desk in the middle.
function paintLibrary(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#08060c'), h('#0c0910'), h('#0e0a10')]);
  const S = new Scene(p, 150, 46, 9);
  const L: Look = { stone: ramp('#3a2e2a', '#5e4a3e', '#7e6652'), wood: ramp('#2a1814', '#4a2c20', '#6a4430'), cloth: [h('#5a2a3a'), h('#b0a080')], iron: IRON };
  S.ground((tx, ty) => {
    if (tx < 0 || ty < 0 || tx > 12 || ty > 12) return -1;
    const k = (Math.floor(tx * 2) + Math.floor(ty * 2)) & 1;
    return k ? h('#3a2a24') : h('#2e221e');
  });
  // (the two walls of shelves behind, tall, book on book)
  const books = ['#6a2a2a', '#2a4a5a', '#5a5a2a', '#4a2a5a', '#7a5a3a', '#2a3a2a'].map(h);
  const shelf = (alongX: boolean): void => {
    for (let t = 0; t < 12; t += 0.25) {
      for (let s = 0; s < 5; s++) {
        const z0 = 4 + s * 12;
        const a = alongX ? S.at(t, 0, z0) : S.at(0, t, z0);
        const b = alongX ? S.at(t + 0.25, 0, z0) : S.at(0, t + 0.25, z0);
        const c = books[Math.floor(rnd(Math.floor(t * 4), s, alongX ? 1 : 2) * 6)];
        const hh = 7 + Math.floor(rnd(Math.floor(t * 4), s, 9) * 3);
        p.poly([[a[0], a[1]], [b[0], b[1]], [b[0], b[1] - hh], [a[0], a[1] - hh]], scale(c, alongX ? 0.8 : 0.55));
        p.line(a[0], a[1] + 1, b[0], b[1] + 1, L.wood[2]);
      }
    }
  };
  shelf(true);
  shelf(false);
  // (the way down: a round stair down through the floor, its iron rail)
  S.disc(9, 9, 1.3, (x, y, n) => mix(h('#3a2a24'), h('#05040a'), Math.min(1, n < 0.9 ? 1 - n * 0.5 : 0.4)));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const [x, y] = S.at(9 + Math.cos(a) * 1.0, 9 + Math.sin(a) * 1.0);
    p.rect(x - 2, y - 1, 4, 1, h('#5e4a3e'));
  }
  waypoint(S, 7.3, 10.6, L);
  S.label(9, 9, 6, 'way down');
  // (the long reading tables and their candles)
  for (const [tx, ty] of [[4, 8.5], [8.8, 3.6]] as const) {
    S.put(tx + 1, ty, () => S.box(tx, ty, 2.4, 0.8, 5, L.wood));
    S.put(tx + 1.2, ty + 0.4, () => S.flame(tx + 1.2, ty + 0.4, 9, 0.7));
  }
  // (the great desk with the Lexicon on it, the eye's place)
  S.put(5.6, 5.6, () => S.cyl(5.6, 5.6, 1.1, 6, L.wood));
  lexicon(S, 5.6, 5.6, L);
  S.light(5.6, 5.6, 14, CY, 2.0, 0.25);
  gate(S, 3.6, 0, L);
  portalPlace(S, 8.6, 1.6, 0.9, L);
  smithy(S, 0.1, 3.3, L);
  wordsmith(S, 2.6, 6.6, L, 1.1);
  bazaar(S, 0.2, 8.6, L);
  stash(S, 5.2, 10.4, L);
  stranger(S, 11.1, 0.8);
  trophies(S, 10.6, 5.6, L, false);
  record(S, 6.4, 1.3, L);
  S.flush();
  for (const [tx, ty] of [[0.3, 1.0], [6.5, 0.3], [0.3, 11], [11.4, 3]]) S.torch(tx, ty, L.wood, 14);
  p.vignette(0.55);
  return S.labels;
}

// 5. THE TOWER TOP (floor 20, the Quiet Tower): a round roof of stone in the clouds, the moon over it, the stair down in its middle.
function paintTower(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#0a0c22'), h('#161a3a'), h('#242848')]);
  p.stars(0, 70, 20, 120);
  p.ellipse(250, 26, 16, 16, (x, y, n) => (n > 0.85 ? h('#a8acc8') : fbm(x / 6, y / 6, 4) > 0.6 ? h('#c8cce0') : h('#e2e4f0')));
  p.glow(250, 26, 50, 40, h('#6870a8'), 0.15);
  // (clouds below)
  for (let y = 95; y < SH; y++) for (let x = 0; x < SW; x++) if (fbm(x / 40, y / 10, 21) > 0.48 - (y - 95) * 0.004) p.set(x, y, mix(h('#2a2e50'), h('#4a4e70'), BAND(fbm(x / 20, y / 6, 22), 3)));
  const S = new Scene(p, 150, 14, 10);
  const L: Look = { stone: ramp('#3e3c4c', '#64606c', '#8a8692'), wood: ramp('#2a2026', '#463440', '#5e4a52'), cloth: [h('#3a3a6a'), h('#c0c0d0')], iron: IRON };
  // (the tower's wall going down into the clouds)
  const [cx, cy] = S.at(6, 6);
  const rx = 6.2 * 10 * 1.414;
  for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
    const k = (x - (cx - rx)) / (2 * rx);
    const yy = cy + (rx / 2) * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
    for (let y = Math.floor(yy); y < yy + 26; y++) p.set(x, y, mix(k < 0.4 ? L.stone[1] : L.stone[0], h('#2a2e50'), (y - yy) / 30));
  }
  S.ground((tx, ty) => {
    const r = Math.hypot(tx - 6, ty - 6);
    if (r > 6.2) return -1;
    if (r < 1.1) return h('#05040a');
    const a = Math.atan2(ty - 6, tx - 6);
    const ring = Math.floor(r * 1.2);
    return (r * 1.2) % 1 < 0.1 || ((a * 8) / Math.PI + ring * 0.5) % 1 < 0.08 ? L.stone[0] : scale(L.stone[1], 0.85 + 0.1 * rnd(ring, Math.floor(a * 4), 2));
  });
  // (the battlements)
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    const tx = 6 + Math.cos(a) * 6;
    const ty = 6 + Math.sin(a) * 6;
    if (Math.sin(a) + Math.cos(a) > 0.2) continue;
    S.put(tx, ty, () => S.box(tx - 0.3, ty - 0.3, 0.6, 0.6, k & 1 ? 10 : 6, L.stone));
  }
  waypoint(S, 6, 6, L, -1);
  S.label(6, 6, 12, 'way down');
  portalPlace(S, 1.9, 1.9, 1.1, L);
  const pos = (deg: number, r: number): [number, number] => [6 + Math.cos((deg * Math.PI) / 180) * r, 6 + Math.sin((deg * Math.PI) / 180) * r];
  gate(S, ...pos(-80, 4.6), L, false);
  smithy(S, ...pos(-30, 4.0), L);
  bazaar(S, ...pos(15, 3.0), L);
  wordsmith(S, ...pos(60, 3.8), L, 1.1);
  lexicon(S, ...pos(115, 3.4), L);
  stash(S, ...pos(150, 4.0), L);
  stranger(S, ...pos(-165, 5.0));
  record(S, ...pos(-112, 3.4), L);
  trophies(S, ...pos(170, 3.8), L, false);
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    const tx = 6 + Math.cos(a) * 6;
    const ty = 6 + Math.sin(a) * 6;
    if (Math.sin(a) + Math.cos(a) <= 0.2) continue;
    S.put(tx, ty, () => S.box(tx - 0.3, ty - 0.3, 0.6, 0.6, k & 1 ? 7 : 4, L.stone));
  }
  S.flush();
  for (const d of [-120, -45, 30, 100, 170]) S.torch(...pos(d, 5.3), L.wood, 13);
  p.vignette(0.4);
  return S.labels;
}

// 6. THE STONE BRIDGE (new): a town built along a great bridge over a chasm, a gate at its far end.
function paintBridge(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#06060e'), h('#0a0a16'), h('#100c1a')]);
  const S = new Scene(p, 92, 2, 10);
  const L: Look = { stone: ramp('#3a3440', '#625866', '#86788a'), wood: ramp('#3a2424', '#5a3a34', '#7a5848'), cloth: [h('#2a4a5a'), h('#c8b890')], iron: IRON };
  // (mist far below in the chasm, and the chasm's far wall)
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) if (fbm(x / 50, y / 14, 31) > 0.55) p.over(x, y, h('#2a2840'), 0.3 * BAND(fbm(x / 50, y / 14, 31), 3));
  const on = (tx: number, ty: number): boolean => ty > 3 && ty < 8 && tx > -2 && tx < 16;
  S.ground((tx, ty) => (on(tx, ty) ? paving(L.stone, 1.3, 31)(tx, ty) : -1));
  // (the bridge's side toward us, sheer, its arches going down into the dark)
  for (let t = -2; t < 16; t += 0.1) {
    const [x, y] = S.at(t, 8);
    for (let k = 0; k < 60; k++) {
      const arch = Math.abs(((t + 100) % 4) - 2) < 1.2 && k > 14 + 20 * (1 - Math.abs(((t + 100) % 4) - 2) / 1.2);
      if (!arch) p.set(x, y + k, mix(L.stone[1], h('#06060e'), k / 60));
      if (!arch) p.set(x + 1, y + k, mix(L.stone[1], h('#06060e'), k / 60));
    }
  }
  // (the parapets)
  for (let t = -2; t < 16; t += 0.5) {
    S.put(t, 3.2, () => S.box(t, 3.1, 0.5, 0.2, 5, L.stone));
  }
  // (houses built along the bridge's far side; stations on its bays)
  for (const t of [0, 3.4, 7.0, 10.6]) S.put(t + 1, 2, () => {
    S.box(t, 1.2, 2.2, 1.6, 18, L.stone, 0);
    S.box(t, 1.2, 2.2, 1.6, 4, ramp('#2a1a1a', '#4a2a26', '#6a3a30'), 18);
    const [wx, wy] = S.at(t + 1.1, 2.8, 10);
    p.rect(wx - 1, wy - 2, 3, 4, h('#e08a3a'));
  });
  gate(S, 13.6, 3.4, L, false);
  smithy(S, 0.6, 3.4, L);
  bazaar(S, 3.6, 3.6, L);
  wordsmith(S, 7.8, 5.6, L, 1.1);
  lexicon(S, 10.4, 4.5, L);
  stash(S, 11.8, 6.6, L);
  stranger(S, -1.2, 6.8);
  record(S, 2.4, 7.0, L);
  trophies(S, 4.4, 7.4, L);
  // (the way down: a cage on a jib off the bridge's near side)
  S.put(9.6, 8.2, () => {
    const a = S.at(10, 7.6, 22);
    const b = S.at(10, 9.6, 22);
    S.box(9.8, 7.4, 0.3, 0.3, 22, L.wood);
    p.line(a[0], a[1], b[0], b[1], L.wood[2]);
    p.line(b[0], b[1], b[0], b[1] + 30, IRON[2]);
    p.rect(b[0] - 4, b[1] + 30, 8, 9, IRON[0]);
    for (let k = 0; k < 4; k++) p.line(b[0] - 4 + k * 2.5, b[1] + 30, b[0] - 4 + k * 2.5, b[1] + 39, IRON[2]);
  });
  waypoint(S, 9.6, 7.0, L);
  S.label(10, 9.6, -10, 'way down');
  portalPlace(S, 15.0, 6.2, 0.9, L);
  S.flush();
  for (const t of [1.6, 5.6, 9.2, 12.8]) S.torch(t, 7.8, L.wood, 12);
  p.vignette(0.5);
  return S.labels;
}

// 7. THE ISLE OF STONES (new): a small round isle in a still black sea under the northern lights, all of it inside a ring of standing stones.
function paintIsle(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#04060e'), h('#08101a'), h('#060a12')]);
  p.stars(0, 50, 7, 90);
  // (the northern lights: green to violet curtains, never cyan)
  for (let x = 0; x < SW; x++) {
    const top = 6 + 14 * Math.sin(x / 40) + 8 * Math.sin(x / 17 + 1);
    for (let y = Math.max(0, Math.floor(top)); y < top + 26; y++) {
      const k = (y - top) / 26;
      p.add(x, y, k < 0.5 ? h('#30a060') : h('#6a3aa0'), 0.35 * (1 - k) * BAND(fbm(x / 6, 0, 7), 3));
    }
  }
  const S = new Scene(p, 150, 24, 9.5);
  const L: Look = { stone: ramp('#2a2c36', '#4a4c58', '#6c6e7c'), wood: ramp('#2e2420', '#4e3c30', '#6e5640'), cloth: [h('#5a3a2a'), h('#c0b090')], iron: IRON };
  S.ground((tx, ty, x, y) => {
    const r = Math.hypot(tx - 6, ty - 6) + (fbm(tx, ty, 7) - 0.5) * 1.2;
    if (r < 5.4) return mix(h('#2a3424'), h('#3a4630'), BAND(fbm(tx * 0.7, ty * 0.7, 8), 3));
    if (r < 6.0) return h('#5a5450');
    const c = mix(h('#04080e'), h('#0a1420'), BAND(fbm(tx * 0.5, ty * 2, 9), 3));
    return y < 40 ? -1 : (y + Math.floor(tx)) % 6 === 0 ? scale(c, 1.5) : c;
  });
  // (the great ring of stones round the whole isle, a gap left at the back for the portal)
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    if (Math.abs(a - Math.PI * 1.25) < 0.3) continue;
    const tx = 6 + Math.cos(a) * 4.9;
    const ty = 6 + Math.sin(a) * 4.9;
    S.put(tx, ty, () => {
      S.box(tx - 0.3, ty - 0.25, 0.6, 0.5, 22 + (k % 3) * 4, ramp('#191a44', '#262a62', '#3a4088'));
      const [x, y] = S.at(tx, ty + 0.25, 12);
      p.set(x - 2, y, CY);
      p.set(x - 2, y - 1, CY_HI);
    });
  }
  portalPlace(S, 2.3, 2.3, 0.9, L);
  // (the way down: steps going down into the sea at the front, the water lit over them)
  for (let k = 0; k < 4; k++) S.put(10.6 + k * 0.4, 10.6 + k * 0.4, () => S.box(9.9 + k * 0.45, 10.2 + k * 0.45, 1.2, 0.45, 2, ramp('#2a2c36', '#3a3c48', '#52546a'), -k * 2));
  waypoint(S, 9.3, 9.3, L);
  S.label(10.6, 10.8, 2, 'way down');
  wordsmith(S, 6, 6, L, 1.4);
  gate(S, 7.0, 1.5, L);
  smithy(S, 9.2, 3.4, L);
  bazaar(S, 2.0, 7.2, L);
  lexicon(S, 4.2, 8.8, L);
  stash(S, 6.6, 9.6, L);
  stranger(S, 10.8, 6.6);
  record(S, 3.6, 2.0, L);
  trophies(S, 1.0, 4.0, L, false);
  S.flush();
  for (const [tx, ty] of [[8.8, 7.2], [3.8, 8.6], [5, 3]]) S.torch(tx, ty, L.wood, 12);
  p.vignette(0.45);
  return S.labels;
}

// 8. THE SWAN GARDEN (floor 16, the Swan Gardens): hedge rooms round a long still pool, a white pavilion at its head.
function paintGarden(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#060a12'), h('#0a1218'), h('#0a1016')]);
  const S = new Scene(p, 150, 16, 9.5);
  const L: Look = { stone: ramp('#5a5868', '#a8a6b4', '#d8d6e0'), wood: ramp('#2a2420', '#4a3e34', '#6a5a4a'), cloth: [h('#4a5a8a'), h('#d8d0c0')], iron: IRON };
  const HEDGE = ramp('#0e2016', '#1a3420', '#2a4a2e');
  S.ground((tx, ty) => {
    if (tx < -0.5 || ty < -0.5 || tx > 12.5 || ty > 12.5) return -1;
    if (tx > 4.6 && tx < 7.4 && ty > 2.5 && ty < 11) {
      if (tx < 4.9 || tx > 7.1 || ty < 2.8) return L.stone[1];
      return mix(h('#0a1424'), h('#142238'), BAND(fbm(tx * 2, ty * 0.5, 16), 3));
    }
    return (Math.floor(tx * 1.5) + Math.floor(ty * 1.5)) & 1 ? h('#4a4858') : h('#3e3c4c');
  });
  // (the moon in the pool)
  const [mx, my] = S.at(6, 8);
  p.ellipse(mx, my, 5, 2.5, h('#c8cce0'));
  p.glow(mx, my, 14, 6, h('#6870a8'), 0.25);
  // (the hedges: walls of clipped green round the rooms)
  const hedges: [number, number, number, number][] = [[-0.5, -0.5, 13, 0.6], [-0.5, -0.5, 0.6, 13], [3.4, 1.0, 0.5, 3.4], [8.1, 1.0, 0.5, 3.4], [3.4, 6.4, 0.5, 3.4], [8.1, 6.4, 0.5, 3.4], [0.2, 4.6, 2.6, 0.5], [9.2, 4.6, 2.8, 0.5]];
  for (const [x, y, w, d] of hedges) S.put(x + w, y + d, () => S.box(x, y, w, d, 12, HEDGE));
  // (the pavilion at the pool's head: its floor kept clear for the portal, white columns, a dome)
  S.put(6, 1.4, () => {
    S.cyl(6, 1.4, 1.4, 2, L.stone);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      if (Math.sin(a) > 0.3) continue;
      S.cyl(6 + Math.cos(a) * 1.2, 1.4 + Math.sin(a) * 1.2, 0.12, 20, L.stone, 2);
    }
  });
  portalPlace(S, 6, 1.4, 0.9, L, 2);
  S.put(6.8, 2.6, () => {
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      if (Math.sin(a) <= 0.3) continue;
      S.cyl(6 + Math.cos(a) * 1.2, 1.4 + Math.sin(a) * 1.2, 0.12, 20, L.stone, 2);
    }
    const [dx, dy] = S.at(6, 1.4, 22);
    p.ellipse(dx, dy, 22, 9, (x, y, n) => (y > dy ? -1 : n > 0.85 ? L.stone[1] : L.stone[2]));
  });
  // (the way down: steps down into a grotto at the pool's foot)
  S.put(6, 11.6, () => {
    S.box(4.8, 11.2, 2.4, 1.2, 2, ramp('#05040a', '#1a1a24', '#302e3c'), -2);
    const [x, y] = S.at(6, 11.8, 0);
    p.ellipse(x, y, 10, 4, h('#05040a'));
  });
  waypoint(S, 6, 10.4, L);
  S.label(6, 11.8, -6, 'way down');
  gate(S, 0.2, 9.8, L, false);
  smithy(S, 9.4, 1.0, L);
  bazaar(S, 0.6, 1.0, L);
  wordsmith(S, 10.4, 8.4, L, 1.1);
  lexicon(S, 2.0, 7.0, L);
  stash(S, 3.0, 11.0, L);
  stranger(S, 11.6, 5.8);
  record(S, 9.0, 11.2, L);
  trophies(S, 9.4, 4.0, L);
  S.flush();
  for (const [tx, ty] of [[4.2, 5.4], [7.8, 5.4], [4.2, 10.4], [7.8, 10.4]]) S.torch(tx, ty, L.stone, 14);
  p.vignette(0.5);
  return S.labels;
}

// 9. THE BELL FOUNDRY (new): a great cavern where a bell bigger than a house hangs from chains over the casting pit.
function paintFoundry(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#0c0606'), h('#140a08'), h('#1a0e0a')]);
  for (let y = 0; y < 60; y++) for (let x = 0; x < SW; x++) if (fbm(x / 18, y / 10, 41) > 0.55) p.set(x, y, h('#1e100c'));
  const S = new Scene(p, 150, 32, 9.5);
  const L: Look = { stone: ramp('#3a2a26', '#5e4438', '#7e5e4a'), wood: ramp('#2a1810', '#4a2c1c', '#6a442c'), cloth: [h('#6a3a1a'), h('#c8a878')], iron: IRON };
  S.ground((tx, ty) => {
    const r = Math.hypot(tx - 5.6, ty - 5.6);
    if (r > 7.6 + (fbm(tx, ty, 42) - 0.5) * 2) return -1;
    return scale(paving(L.stone, 1.1, 42)(tx, ty), 0.8);
  });
  // (the casting pit: a round hole lit from below by honest orange, the stair into it)
  S.disc(5.6, 5.6, 1.9, (x, y, n) => (n > 0.9 ? L.stone[2] : mix(h('#ff8a2a'), h('#2a0e06'), Math.min(1, n * 1.1))));
  S.light(5.6, 5.6, 0, FIRE, 3.2, 0.4);
  // (the bell, hung over the pit from three chains up into the dark)
  const [bx, by] = S.at(5.6, 5.6, 34);
  for (const dx of [-10, 0, 10]) p.line(bx + dx * 0.4, 0, bx + dx, by - 22, IRON[1]);
  p.poly([[bx - 7, by - 24], [bx + 7, by - 24], [bx + 12, by - 8], [bx + 17, by + 2], [bx - 17, by + 2], [bx - 12, by - 8]], (x) => {
    const k = (x - (bx - 17)) / 34;
    return k < 0.3 ? h('#c08040') : k < 0.6 ? h('#8a5a2a') : h('#4a2c18');
  });
  p.ellipse(bx, by + 2, 17, 4, (x, y) => (y < by + 2 ? -1 : h('#1a0c06')));
  p.line(bx - 13, by - 6, bx + 13, by - 6, h('#e0a050'));
  S.label(5.6, 5.6, 2, 'way down');
  waypoint(S, 7.8, 7.6, L);
  portalPlace(S, 1.4, 1.4, 1.0, L);
  gate(S, 5.6, -0.8, L);
  smithy(S, 9.2, 1.6, L);
  bazaar(S, 9.6, 5.6, L);
  wordsmith(S, 1.8, 6.8, L, 1.1);
  lexicon(S, 4.4, 9.6, L);
  stash(S, 7.6, 10.6, L);
  stranger(S, -0.6, 3.6);
  record(S, 3.6, 1.4, L);
  trophies(S, 0.6, 9.4, L, false);
  S.flush();
  for (const [tx, ty] of [[8.4, 3.6], [2.8, 4.0], [10.6, 8.4], [2.6, 10.6]]) S.torch(tx, ty, L.wood, 13);
  p.vignette(0.5);
  return S.labels;
}

// 10. THE FROZEN MERE (new): stalls and tents out on a frozen lake under falling snow, a fire in the middle, the way down a hole cut in the ice.
function paintMere(p: Sk): Label[] {
  p.vgrad(0, SH, [h('#0a0e1a'), h('#121828'), h('#1a2234')]);
  const S = new Scene(p, 150, 18, 9.5);
  const L: Look = { stone: ramp('#3e4656', '#646e80', '#8e98a8'), wood: ramp('#2e2220', '#4e3a30', '#6e5444'), cloth: [h('#7a3a2a'), h('#d0c8b8')], iron: IRON };
  // (the snowy hills behind)
  p.poly([[0, 46], [60, 22], [120, 30], [180, 14], [250, 26], [300, 18], [300, 60], [0, 60]], (x, y) => mix(h('#5a6478'), h('#2a3244'), BAND((y - 14) / 46, 4)));
  S.ground((tx, ty, x, y) => {
    if (y < 40) return -1;
    const r = Math.hypot(tx - 6, ty - 6) + (fbm(tx * 0.4, ty * 0.4, 51) - 0.5) * 3;
    if (r > 7) return mix(h('#7a8498'), h('#5a6478'), BAND(fbm(tx, ty, 52), 3));
    const crack = Math.abs(fbm(tx * 0.9, ty * 0.9, 53) - 0.5) < 0.02;
    return crack ? h('#8ea0b4') : mix(h('#2a3a4e'), h('#3a4c62'), BAND(fbm(tx * 0.3, ty * 1.5, 54), 3));
  });
  // (the hole cut in the ice, a ladder and a rope going down into black water)
  S.disc(8.6, 8.6, 1.0, (x, y, n) => (n > 0.8 ? h('#b0bccc') : h('#04060c')));
  S.put(8.6, 8.6, () => {
    const [x, y] = S.at(8.6, 8.6);
    p.line(x - 3, y - 8, x - 2, y + 2, L.wood[2]);
    p.line(x + 3, y - 8, x + 2, y + 2, L.wood[2]);
    for (let k = 0; k < 4; k++) p.line(x - 3, y - 6 + k * 2.5, x + 3, y - 6 + k * 2.5, L.wood[1]);
  });
  waypoint(S, 10.2, 7.4, L);
  S.label(8.6, 8.6, 12, 'way down');
  // (the fire in the middle, on a hearth of stones)
  S.put(5.4, 5.4, () => S.cyl(5.4, 5.4, 0.6, 2, L.stone));
  S.put(5.5, 5.5, () => S.flame(5.4, 5.4, 6, 1.6));
  S.light(5.4, 5.4, 2, FIRE, 3.6, 0.35);
  portalPlace(S, 2.2, 2.4, 1.1, L);
  gate(S, 6.4, 0.4, L);
  smithy(S, 9.4, 2.0, L);
  bazaar(S, 0.6, 5.2, L);
  wordsmith(S, 4.4, 9.0, L, 1.1);
  lexicon(S, 7.4, 5.2, L);
  stash(S, 2.2, 10.4, L);
  stranger(S, 11.6, 4.4);
  record(S, 4.6, 2.0, L);
  trophies(S, -0.2, 7.8, L, false);
  S.flush();
  for (const [tx, ty] of [[8, 3.6], [3, 7.4], [7, 10.6]]) S.torch(tx, ty, L.wood, 13);
  // (snow falling)
  for (let i = 0; i < 160; i++) {
    const x = rnd(i, 1, 55) * SW;
    const y = rnd(i, 2, 55) * SH;
    p.over(x, y, h('#e0e8f4'), 0.7);
  }
  p.vignette(0.4);
  return S.labels;
}

export const TOWN_OPTIONS: readonly TownOption[] = [
  { n: 1, name: "The Shaft's Rim", from: 'new', line: 'The town round the head of the stair with no bottom: every floor lies under it, and the portal waits out over the drop.', paint: paintRim },
  { n: 2, name: 'Quarry Terraces', from: 'Floor 6, the Quarry', line: 'Three steps of hewn stone climbing to a crane under the stars: the deeper he goes, the higher the cut.', paint: paintQuarry },
  { n: 3, name: 'The Stilt Town', from: 'Floor 10, the Sunken Fen', line: 'Each station on its own platform over black water, lanterns doubled in it: a town that should have sunk long ago.', paint: paintStilts },
  { n: 4, name: 'The Reading Hall', from: 'Floor 15, the Great Library', line: 'Indoors at last: walls of books to the dark, the Lexicon on a great desk in the middle, a stair down through the floor.', paint: paintLibrary },
  { n: 5, name: 'The Tower Top', from: 'Floor 20, the Quiet Tower', line: 'A round roof in the clouds under a huge moon, the way down a stair in its very middle: the top of everything.', paint: paintTower },
  { n: 6, name: 'The Stone Bridge', from: 'new', line: 'A street of houses built along a bridge over a chasm, the gate at its far end, a cage let down off its side.', paint: paintBridge },
  { n: 7, name: 'The Isle of Stones', from: 'new', line: 'A small isle in a still sea under the northern lights, all of it inside a ring of standing stones: the wordsmith’s own place.', paint: paintIsle },
  { n: 8, name: 'The Swan Garden', from: 'Floor 16, the Swan Gardens', line: 'Hedge rooms round a long pool with the moon in it, a white pavilion at its head kept clear for the portal.', paint: paintGarden },
  { n: 9, name: 'The Bell Foundry', from: 'new', line: 'A cavern lit from the casting pit, a bell bigger than a house hung over it: the way down is into the fire’s light.', paint: paintFoundry },
  { n: 10, name: 'The Frozen Mere', from: 'new', line: 'Stalls and tents out on a frozen lake in falling snow round one fire; the way down is a hole cut in the ice.', paint: paintMere },
];
