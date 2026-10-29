// THE SHAPES OF THE HUSH, AS PICTURES FOR THE OWNER (art/hush_shapes.ts, art/hush_shapes_moves.ts; a mock-up, not in the
// game): painted here without a browser, as the tests paint (tests/helpers.ts `paintWithoutCanvas`), on a quiet grey
// floor (src/dev/hush_floor.ts), the knight beside them for size.
//   npx tsx tools/hush_shapes_pics.ts look <out dir> [move]   frames of each move, both ways round (for looking at)
//   npx tsx tools/hush_shapes_pics.ts sheet <out dir>          the sheet and the swarm (PNG)
//   npx tsx tools/hush_shapes_pics.ts film <out dir>           the film's frames (PNG) and their captions (film.json);
//                                                              tools/hush_shapes_film.py puts them together
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeZlib from 'node:zlib';
// @ts-ignore
import nodePath from 'node:path';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { GRIP_CANVAS, HS_CANVAS, gripPainted } from '../src/art/hush_shapes';
import { HS_DART, HS_DIES, HS_GRIP, HS_PACE, HS_REEL, HS_STAND_LONG, HUSH_SHAPE, gripAt } from '../src/art/hush_shapes_moves';
import { TILE3, deathOfMob, dyingMoment, momentOf, paintBits, paintMob } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Painted } from '../src/art/kit';
import { towerFloor } from '../src/dev/hush_floor';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const fs = nodeFs as { mkdirSync(p: string, o: { recursive: boolean }): void; writeFileSync(p: string, d: unknown): void };
const zlib = nodeZlib as { deflateSync(b: Uint8Array, o?: { level: number }): Uint8Array; crc32?: (b: Uint8Array) => number };
const path = nodePath as { join(...p: string[]): string };
declare const process: { argv: string[]; exit(n: number): void };
// @ts-ignore
const Buf = Buffer as { alloc(n: number): Uint8Array & { writeUInt32BE(v: number, o: number): void }; concat(l: Uint8Array[]): Uint8Array; from(s: string, e?: string): Uint8Array };

// =============================================================================================
// A PICTURE, AND A PNG OF IT

const CRC = ((): Uint32Array => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const len = Buf.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buf.concat([Buf.from(type, 'latin1'), data]);
  const crc = Buf.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buf.concat([len, td, crc]);
}
class Pic {
  readonly d: Uint8ClampedArray;
  constructor(readonly w: number, readonly h: number) {
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  /** One picture pixel of colour `c` (RGBA), laid over what is there. */
  over(x: number, y: number, r: number, g: number, b: number, a: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = (y * this.w + x) * 4;
    const k = a / 255;
    this.d[i] = this.d[i] * (1 - k) + r * k;
    this.d[i + 1] = this.d[i + 1] * (1 - k) + g * k;
    this.d[i + 2] = this.d[i + 2] * (1 - k) + b * k;
    this.d[i + 3] = 255;
  }
  /** A painting laid with the picture pixel (`px0`, `py0`) of it at (`x`, `y`) here, `k` times as big, turned over if `flip`. */
  lay(p: Px, px0: number, py0: number, x: number, y: number, k = 1, flip = false): void {
    for (let j = 0; j < p.h; j++) {
      for (let i = 0; i < p.w; i++) {
        const s = (j * p.w + i) * 4;
        const a = p.d[s + 3];
        if (!a) continue;
        const X0 = flip ? Math.round(x + (px0 - i - 1) * k) : Math.round(x + (i - px0) * k);
        const Y0 = Math.round(y + (j - py0) * k);
        for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) this.over(X0 + dx, Y0 + dy, p.d[s], p.d[s + 1], p.d[s + 2], a);
      }
    }
  }
  /** A soft dark oval on the floor at (`x`, `y`), `rx` across. */
  shadow(x: number, y: number, rx: number, strong = 0.55): void {
    const ry = rx * 0.5;
    for (let j = Math.floor(y - ry - 2); j <= y + ry + 2; j++) {
      for (let i = Math.floor(x - rx - 2); i <= x + rx + 2; i++) {
        const d = Math.hypot((i + 0.5 - x) / rx, (j + 0.5 - y) / ry);
        if (d < 1) this.over(i, j, 10, 9, 18, 255 * strong * (1 - d * d));
      }
    }
  }
  png(): Uint8Array {
    const raw = new Uint8Array((this.w * 4 + 1) * this.h);
    for (let y = 0; y < this.h; y++) {
      raw[y * (this.w * 4 + 1)] = 0;
      raw.set(this.d.subarray(y * this.w * 4, (y + 1) * this.w * 4), y * (this.w * 4 + 1) + 1);
    }
    const ihdr = Buf.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    return Buf.concat([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))]);
  }
  /** `k` times as big, every pixel a square. */
  scaled(k: number): Pic {
    const o = new Pic(this.w * k, this.h * k);
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      const s = (Math.floor(y / k) * this.w + Math.floor(x / k)) * 4;
      const i = (y * o.w + x) * 4;
      o.d[i] = this.d[s];
      o.d[i + 1] = this.d[s + 1];
      o.d[i + 2] = this.d[s + 2];
      o.d[i + 3] = 255;
    }
    return o;
  }
}
function floorPic(w: number, h: number, ox = 0, oy = 0, dark = true): Pic {
  const p = new Pic(w, h);
  p.d.set(towerFloor(w, h, ox, oy, dark));
  return p;
}

// =============================================================================================
// THE FIGURES

const MOB = HUSH_SHAPE;
type View = 'front' | 'back';
/** A frame of a move of it (its death at its own frames). */
function shapeAt(move: string, t: number, view: View): Painted {
  return move === 'dying' ? deathOfMob(MOB, Math.min(1, t / MOB.dieTime), view) : paintMob(MOB, move, t, view);
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const knightAt = (view: View, i = 0): Sprite => (view === 'front' ? hero.front : hero.back).idle[i % (view === 'front' ? hero.front : hero.back).idle.length];
/** It, with its floor point at (`x`, `y`) on the picture, `k` times as big; its shadow under it. */
function layShape(pic: Pic, p: Painted, x: number, y: number, k: number, flip = false, shadow = true): void {
  if (shadow) pic.shadow(x, y, MOB.shadow * k, 0.5);
  pic.lay(p.px, HS_CANVAS.ax, HS_CANVAS.ay, x, y, k, flip);
}
/** The knight, his floor point at (`x`, `y`). */
function layKnight(pic: Pic, view: View, x: number, y: number, k: number, flip = false, i = 0): void {
  const s = knightAt(view, i);
  const d = s.density ?? 1;
  pic.shadow(x, y, 11 * k, 0.55);
  pic.lay(s.img as unknown as Px, s.ax * d, s.ay * d, x, y, k, flip);
}
/** A point of the floor `fwd` along the way it faces and `left` to its left (the figure's own lengths), seen from in front or behind: where it is on the picture from its floor point. */
function onScreen(view: View, fwd: number, left: number, up = 0): [number, number] {
  const G = Math.sqrt(2 / 3);
  if (view === 'front') return [G * (fwd + left), G * 0.5 * (fwd - left) - up];
  // (from behind as the game truly sees it: 'rear')
  return [G * (fwd - left), G * 0.5 * (-fwd - left) - up];
}

// =============================================================================================
// LOOK: frames of each move, both ways round, twice as big, to look at

function look(out: string, only?: string): void {
  const moves: [string, number[]][] = [
    ['stand', [0, 0.6, 1.2, 1.8]],
    ['walk', [0, 0.3, 0.6, 0.9]],
    ['dart', [0, 0.2, 0.37, 0.4334, 0.4667, 0.5, 0.62, 0.82]],
    ['attack', [0, 0.18, 0.4, 0.62, 0.6667, 0.7, 0.7334, 0.8, 0.98, 1.3, 1.5]],
    ['reel', [0, 0.05, 0.1, 0.2, 0.3]],
    ['dying', [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7]],
  ];
  const K = 2;
  const CW = 150;
  const CH = 150;
  for (const [move, ts] of moves) {
    if (only && move !== only) continue;
    const pic = floorPic(CW * ts.length, CH * 2, 0, 0, false);
    ts.forEach((t, i) => {
      for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
        const p = shapeAt(move, t, view);
        layShape(pic, p, CW * i + CW * 0.55, CH * row + CH - 22, 1);
      }
    });
    fs.writeFileSync(path.join(out, `look_${move}.png`), pic.scaled(K).png());
    console.log('look', move);
  }
}

// =============================================================================================
// THE SHEET: it standing, from in front and from behind, beside the knight, three times as big; and a swarm of them at the
// game's size round the knight

function sheet(out: string): void {
  const W = 400;
  const H = 128;
  const K = 3;
  const pic = floorPic(W, H, 7, 3, false);
  const y = H - 16;
  layKnight(pic, 'front', 38, y, 1);
  layShape(pic, shapeAt('stand', 0, 'front'), 110, y, 1);
  layShape(pic, shapeAt('stand', 0, 'back'), 190, y, 1);
  layKnight(pic, 'back', 252, y, 1);
  const big = pic.scaled(K);
  // (the swarm, at the game's size, on the right)
  const sw = swarm(1);
  for (let j = 0; j < sw.h; j++) for (let i = 0; i < sw.w; i++) {
    const s = (j * sw.w + i) * 4;
    const X = 300 * K - 40 + i;
    const Y = big.h - sw.h - 6 + j;
    big.over(X, Y, sw.d[s], sw.d[s + 1], sw.d[s + 2], 255);
  }
  fs.writeFileSync(path.join(out, 'sheet.png'), big.png());
  // the swarm again, three times as big (as near the size the game is on a phone as a picture shrunk to the phone can show)
  fs.writeFileSync(path.join(out, 'swarm.png'), swarm(3).png());
  console.log('sheet, swarm');
}
/** A swarm of them round the knight: drifting in from all round, one darting, one rearing to grip. At `k` times the game's size. */
function swarm(k: number): Pic {
  const W = 340;
  const H = 260;
  const pic = floorPic(W, H, 11, 5);
  const kx = W * 0.5;
  const ky = H * 0.64;
  // (each: where on the floor from the knight, in tiles across the picture and down it; how it is seen; its move and moment; turned over)
  const them: [number, number, View, string, number, boolean][] = [
    [-2.6, -1.2, 'front', 'walk', 0.1, false],
    [-1.3, -2.2, 'front', 'walk', 0.55, false],
    [1.1, -2.3, 'front', 'walk', 0.85, true],
    [2.6, -1.0, 'front', 'attack', 0.5, true],
    [-2.9, 0.9, 'back', 'walk', 0.3, true],
    [0.1, -3.0, 'front', 'dart', 0.25, false],
    [2.3, 1.2, 'back', 'walk', 0.7, false],
  ];
  const T = 32;
  const all: { x: number; y: number; draw: () => void }[] = [];
  for (const [tx, ty, view, move, t, flip] of them) {
    const x = kx + tx * T;
    const y = ky + ty * T * 0.5 * 2;
    all.push({ x, y, draw: () => layShape(pic, shapeAt(move, t, view), x, y, 1, flip) });
  }
  all.push({ x: kx, y: ky, draw: () => layKnight(pic, 'front', kx, ky, 1, true) });
  all.sort((a, b) => a.y - b.y).forEach((f) => f.draw());
  return k === 1 ? pic : pic.scaled(k);
}

// =============================================================================================
// THE FILM: every move from in front and from behind, the knight in it for size, captioned; each strike again at half speed

interface Card {
  title: string;
  note: string;
}
function film(out: string): void {
  const W = 360;
  const H = 240;
  const frames: Card[] = [];
  let n = 0;
  const save = (pic: Pic, card: Card): void => {
    fs.writeFileSync(path.join(out, `f${String(n).padStart(4, '0')}.png`), pic.png());
    frames.push(card);
    n++;
  };
  const bg = (view: View): Pic => {
    const p = floorPic(W, H, view === 'front' ? 17 : 29, 9);
    return p;
  };
  const clone = (p: Pic): Pic => {
    const c = new Pic(p.w, p.h);
    c.d.set(p.d);
    return c;
  };
  const vName = (v: View): string => (v === 'front' ? 'from in front' : 'from behind');
  const holds = (k: number, f: () => void): void => {
    for (let i = 0; i < k; i++) f();
  };
  // HOVERING
  for (const view of ['front', 'back'] as const) {
    const base = bg(view);
    const mx = view === 'front' ? 150 : 190;
    const my = view === 'front' ? 150 : 175;
    for (let i = 0; i < Math.round(HS_STAND_LONG * 30); i++) {
      const t = Math.floor(i / 3) / 10;
      const pic = clone(base);
      const [kx, ky] = onScreen(view, 0, -1.6 * TILE3);
      layShape(pic, shapeAt('stand', t, view), mx, my, 1);
      layKnight(pic, view, mx + kx, my + ky, 1, false, Math.floor(i / 3));
      save(pic, { title: `HOVERING · ${vName(view)}`, note: 'Hunched, faceless, its long arms hanging; the fog streaming off it' });
    }
  }
  // THE DRIFT
  for (const view of ['front', 'back'] as const) {
    const base = bg(view);
    const mx0 = view === 'front' ? 70 : 90;
    const my0 = view === 'front' ? 110 : 205;
    const kAt = onScreen(view, 2.6 * TILE3, -2.2 * TILE3);
    for (let i = 0; i < 72; i++) {
      const tt = i / 30;
      const t = Math.floor(tt * 10) / 10;
      const [dx, dy] = onScreen(view, HS_PACE * TILE3 * tt, 0);
      const pic = clone(base);
      const draws = [
        { y: my0 + kAt[1], f: () => layKnight(pic, view === 'front' ? 'back' : 'front', mx0 + kAt[0], my0 + kAt[1], 1, true, Math.floor(i / 3)) },
        { y: my0 + dy, f: () => layShape(pic, shapeAt('walk', t, view), Math.round(mx0 + dx), Math.round(my0 + dy), 1) },
      ];
      draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
      save(pic, { title: `THE DRIFT · ${vName(view)}`, note: `Slow, ${HS_PACE} tiles a second, leaning in, its tail trailing` });
    }
  }
  // THE DART, and its strike again at half speed
  for (const view of ['front', 'back'] as const) {
    const base = bg(view);
    const mx0 = view === 'front' ? 62 : 70;
    const my0 = view === 'front' ? 92 : 214;
    const kAt = onScreen(view, HS_DART.carry + 1.5 * TILE3, -0.4 * TILE3);
    const frame = (t: number, half: boolean): void => {
      const [dx, dy] = [0, 0];
      const pic = clone(base);
      const draws = [
        { y: my0 + kAt[1], f: () => layKnight(pic, view === 'front' ? 'back' : 'front', mx0 + kAt[0], my0 + kAt[1], 1, true, 0) },
        { y: my0 + dy, f: () => layShape(pic, shapeAt('dart', t, view), Math.round(mx0 + dx), Math.round(my0 + dy), 1) },
      ];
      draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
      const note = t < HS_DART.warn[0] ? 'It draws in on itself' : t <= HS_DART.strike[0] + 1e-6 ? 'Drawn in, held: the warning' : t <= HS_DART.strike[1] + 1e-6 ? 'FOUR TILES IN TWO FRAMES, smeared' : 'It rears back as it brakes, and settles';
      save(pic, { title: `THE DART · ${vName(view)}${half ? ' · the strike at half speed' : ''}`, note });
    };
    for (let i = 0; i <= Math.round(HS_DART.long * 30); i++) frame(i / 30, false);
    holds(8, () => frame(HS_DART.long, false));
    for (let i = Math.round(0.3 * 30); i <= Math.round(0.62 * 30); i++) {
      frame(i / 30, true);
      frame(i / 30, true);
    }
    holds(6, () => frame(0.62, true));
  }
  // THE GRIP, and its strike again at half speed
  const G = gripAt();
  for (const view of ['front', 'back'] as const) {
    const base = bg(view);
    const mx = view === 'front' ? 120 : 140;
    const my = view === 'front' ? 120 : 196;
    const [gx, gy] = onScreen(view, G[0], G[1]);
    const frame = (t: number, half: boolean): void => {
      const pic = clone(base);
      const fx = t >= HS_GRIP.hit - 1e-6;
      const ft = t - HS_GRIP.hit;
      const knight = (): void => layKnight(pic, view === 'front' ? 'back' : 'front', Math.round(mx + gx), Math.round(my + gy), 1, true, 0);
      const shape = (): void => layShape(pic, shapeAt('attack', t, view), mx, my, 1);
      const far = (): void => {
        if (fx) pic.lay(gripPainted(ft, view, 'far').px, GRIP_CANVAS.ax, GRIP_CANVAS.ay, Math.round(mx + gx), Math.round(my + gy), 1);
      };
      const near = (): void => {
        if (fx) pic.lay(gripPainted(ft, view, 'near').px, GRIP_CANVAS.ax, GRIP_CANVAS.ay, Math.round(mx + gx), Math.round(my + gy), 1);
      };
      // (in front, it is behind whoever it grips; from behind, it is nearer than they are)
      if (view === 'front') {
        shape();
        far();
        knight();
        near();
      } else {
        far();
        knight();
        near();
        shape();
      }
      const note = t < HS_GRIP.warn[0] ? 'It rears up, its arms spreading' : t <= HS_GRIP.strike[0] + 1e-6 ? 'Arms spread wide, mouth gaping: the warning, held' : t <= HS_GRIP.strike[1] + 1e-6 ? 'ITS ARMS SNAP SHUT IN TWO FRAMES, smeared' : t <= HS_GRIP.hold + 1e-6 ? 'The grey grip: it holds you a moment' : 'It lets go and sinks back';
      save(pic, { title: `THE GRIP · ${vName(view)}${half ? ' · the strike at half speed' : ''}`, note });
    };
    for (let i = 0; i <= Math.round(HS_GRIP.long * 30); i++) frame(i / 30, false);
    holds(8, () => frame(HS_GRIP.long, false));
    for (let i = Math.round(0.55 * 30); i <= Math.round(1.0 * 30); i++) {
      frame(i / 30, true);
      frame(i / 30, true);
    }
    holds(6, () => frame(1.0, true));
  }
  // STRUCK
  for (const view of ['front', 'back'] as const) {
    const base = bg(view);
    const mx = view === 'front' ? 160 : 180;
    const my = view === 'front' ? 150 : 175;
    const [kx, ky] = onScreen(view, 1.3 * TILE3, -0.2 * TILE3);
    for (let rep = 0; rep < 3; rep++) {
      for (let i = 0; i <= Math.round(HS_REEL * 30) + 6; i++) {
        const t = Math.min(HS_REEL, i / 30);
        const pic = clone(base);
        const draws = [
          { y: my + ky, f: () => layKnight(pic, view === 'front' ? 'back' : 'front', mx + kx, my + ky, 1, true, 0) },
          { y: my, f: () => layShape(pic, shapeAt('reel', t, view), mx, my, 1) },
        ];
        draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
        save(pic, { title: `STRUCK · ${vName(view)}`, note: 'Jolted back, its fog torn through and closing again' });
      }
    }
  }
  // ITS DEATH
  for (const view of ['front', 'back'] as const) {
    const base = bg(view);
    const mx = view === 'front' ? 150 : 175;
    const my = view === 'front' ? 196 : 205;
    const [kx, ky] = onScreen(view, 1.4 * TILE3, -1.0 * TILE3);
    for (let i = 0; i <= Math.round(HS_DIES.long * 30) + 15; i++) {
      const t = Math.min(HS_DIES.long, Math.floor((i / 30) * 20) / 20);
      const pic = clone(base);
      const draws = [
        { y: my + ky, f: () => layKnight(pic, view === 'front' ? 'back' : 'front', mx + kx, my + ky, 1, true, 0) },
        { y: my, f: () => layShape(pic, shapeAt('dying', t, view), mx, my, 1, false, t < HS_DIES.unravel[1]) },
      ];
      draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
      const note = t < HS_DIES.word[0] ? 'Struck: it arches back, its mouth stretched' : t < HS_DIES.word[2] ? 'A word it had swallowed comes up out of it, taking its own colour again' : 'It unravels into wisps; the word flies home';
      save(pic, { title: `ITS DEATH · ${vName(view)}`, note });
    }
  }
  fs.writeFileSync(path.join(out, 'film.json'), JSON.stringify({ w: W, h: H, frames }));
  console.log('film', n, 'frames', (n / 30).toFixed(1), 's');
}

/** BIG: moments of a move (`move:t,t,...`), both ways round, five times as big, the knight beside the first for size. */
function bigOf(out: string, spec: string): void {
  const [move, list = '0'] = spec.split(':');
  const ts = list.split(',').map(Number);
  const CW = 110;
  const CH = 110;
  const pic = floorPic(CW * (ts.length + 1), CH * 2, 0, 0, false);
  for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
    layKnight(pic, view, CW * 0.5, CH * row + CH - 14, 1);
    ts.forEach((t, i) => layShape(pic, shapeAt(move, t, view), CW * (i + 1) + CW * 0.5, CH * row + CH - 14, 1));
  }
  // (and from its right side, square on, to judge its shape: not a view the game has)
  const side = new Pic(CW * (ts.length + 1), CH);
  side.d.set(floorPic(side.w, side.h, 0, 0, false).d);
  ts.forEach((t, i) => {
    const st = stage('side' as unknown as 'front', HS_CANVAS.ax, HS_CANVAS.ay, HS_CANVAS);
    const m = move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move], t);
    const bits = MOB.bits(st, m);
    paintBits(st, bits, m.s.pelvis);
    side.lay(st.whole('#ff4f8a'), HS_CANVAS.ax, HS_CANVAS.ay, CW * (i + 1) + CW * 0.5, CH - 14, 1);
  });
  const both = new Pic(pic.w, pic.h + side.h);
  both.d.set(pic.d);
  both.d.set(side.d, pic.d.length);
  fs.writeFileSync(path.join(out, `big_${move}.png`), both.scaled(5).png());
  console.log('big', move);
}

/** CLOSE: its head and shoulders at a moment, both ways round, twelve times as big (`move:t`). */
function close(out: string, spec: string): void {
  const [move, t0 = '0'] = spec.split(':');
  const t = Number(t0);
  const pic = floorPic(120, 60, 0, 0, false);
  for (const [i, view] of [[0, 'front'], [1, 'back']] as const) {
    const p = shapeAt(move, t, view);
    // (the head is about 50 over the floor)
    pic.lay(p.px, HS_CANVAS.ax, HS_CANVAS.ay, 22 + 62 * i, 85, 1);
  }
  fs.writeFileSync(path.join(out, `close_${move}.png`), pic.scaled(10).png());
  console.log('close', move);
}

const [mode = 'look', out = 'shots/hush', only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
if (mode === 'look') look(out, only);
else if (mode === 'big') bigOf(out, only ?? 'stand:0');
else if (mode === 'close') close(out, only ?? 'stand:0');
else if (mode === 'sheet') sheet(out);
else if (mode === 'film') film(out);
else {
  console.log('modes: look, sheet, film');
  process.exit(1);
}
