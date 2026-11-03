// THE SHAPES OF THE HUSH, AS PICTURES FOR THE OWNER (art/hush_shapes.ts, art/hush_shapes_moves.ts; a mock-up, not in the
// game): painted here without a browser, as the tests paint (tests/helpers.ts `paintWithoutCanvas`), on a quiet grey
// floor (src/dev/hush_floor.ts), the knight beside them for size.
//   npx tsx tools/hush_shapes_pics.ts look <out dir> [move]   frames of each move, both ways round (for looking at)
//   npx tsx tools/hush_shapes_pics.ts sheet <out dir>          the sheet and the swarm (PNG)
//   npx tsx tools/hush_shapes_pics.ts film <out dir>           the film's frames (PNG) and their captions (film.json);
//                                                              tools/hush_shapes_film.py puts them together
//   npx tsx tools/hush_shapes_pics.ts spiral <out dir> [parts] THEIR RHYTHM (30 Oct): the spiral film's frames, 1200 wide
//                                                              (swarm, glides, swoop; film.json: hush_shapes_film.py)
//   npx tsx tools/hush_shapes_pics.ts spiralsheet <out dir>    its sheet (sheet_base.png, and sheet.json for what is written
//                                                              on it: tools/hush_shapes_spiral_sheet.py)
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeZlib from 'node:zlib';
// @ts-ignore
import nodePath from 'node:path';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { GRIP_CANVAS, GRIP_FX, HS_CANVAS, gripPainted } from '../src/art/hush_shapes';
import { HS_CIRCLE, HS_DART, HS_DIES, HS_GLIDES, HS_GRIP, HS_PACE, HS_REEL, HS_STAND_LONG, HS_SWOOP, HUSH_SHAPE, circlePace, dartCarry, glidePace, gripAt, swoopCarry, swoopPace } from '../src/art/hush_shapes_moves';
import type { GlideName } from '../src/art/hush_shapes_moves';
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
    ['circleLeft', [0, 0.3, 0.6, 0.9]],
    ['circleRight', [0, 0.3, 0.6, 0.9]],
    ['circleLeftFast', [0, 0.3, 0.6, 0.9]],
    ['circleRightFast', [0, 0.3, 0.6, 0.9]],
    ['swoopLeft', [0, 0.1, 0.2, 0.3, 0.36, 0.5, 0.6667, 0.7, 0.7333, 0.9, 1.2, 1.35, 1.5, 1.7]],
    ['swoopRight', [0, 0.1, 0.2, 0.3, 0.36, 0.5, 0.6667, 0.7, 0.7333, 0.9, 1.2, 1.35, 1.5, 1.7]],
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
function film(out: string, only?: string): void {
  const want = (name: string): boolean => !only || only.split(',').includes(name);
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
  for (const view of want('stand') ? (['front', 'back'] as const) : []) {
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
  for (const view of want('drift') ? (['front', 'back'] as const) : []) {
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
  for (const view of want('dart') ? (['front', 'back'] as const) : []) {
    const base = bg(view);
    const mx0 = view === 'front' ? 62 : 70;
    const my0 = view === 'front' ? 92 : 214;
    const kAt = onScreen(view, HS_DART.carry + 1.5 * TILE3, -0.4 * TILE3);
    const frame = (t: number, half: boolean): void => {
      const [dx, dy] = [0, 0];
      const pic = clone(base);
      const draws = [
        { y: my0 + kAt[1], f: () => layKnight(pic, view === 'front' ? 'back' : 'front', mx0 + kAt[0], my0 + kAt[1], 1, true, 0) },
        { y: my0 + dy, f: () => {
          // (its shadow goes with it as it darts: dartCarry)
          const [cx, cy] = onScreen(view, dartCarry(t), 0);
          pic.shadow(Math.round(mx0 + cx), Math.round(my0 + cy), MOB.shadow, 0.5);
          layShape(pic, shapeAt('dart', t, view), Math.round(mx0 + dx), Math.round(my0 + dy), 1, false, false);
        } },
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
  for (const view of want('grip') ? (['front', 'back'] as const) : []) {
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
  for (const view of want('reel') ? (['front', 'back'] as const) : []) {
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
  for (const view of want('death') ? (['front', 'back'] as const) : []) {
    const base = bg(view);
    const mx = view === 'front' ? 150 : 175;
    const my = view === 'front' ? 196 : 205;
    const [kx, ky] = onScreen(view, 1.7 * TILE3, -2.1 * TILE3);
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

// =============================================================================================
// THEIR RHYTHM (30 Oct): never still, swirling round you in a tightening spiral, faster as they close, then wrapping you.
// THE SPIRAL FILM (1200 wide, captioned) and ITS SHEET. They are steered here as the game is asked to steer them (their
// README, "Their rhythm"): round you on a ring, facing you, the ring closing, the pace rising as it closes; the swoop from
// the near ring, its last turn ending square before you.

const GG = Math.sqrt(2 / 3);
/** A point of the floor (the figure's own lengths: X and Y as a figure seen from in front has its forward and its left) on the picture, from the floor point of the middle. */
const isoOf = (X: number, Y: number): [number, number] => [GG * (X + Y), GG * 0.5 * (X - Y)];
interface Facing {
  view: View;
  flip: boolean;
  fwd: [number, number];
  left: [number, number];
}
/** The four ways the game's pictures of it face: from in front, turned over, from behind, turned over (each its forward and its left on the floor). */
const FACINGS: Facing[] = [
  { view: 'front', flip: false, fwd: [1, 0], left: [0, 1] },
  { view: 'front', flip: true, fwd: [0, -1], left: [-1, 0] },
  { view: 'back', flip: false, fwd: [0, 1], left: [-1, 0] },
  { view: 'back', flip: true, fwd: [-1, 0], left: [0, 1] },
];
/** The picture nearest to facing this way (as the game picks it). */
function facingOf(dx: number, dy: number): Facing {
  let best = FACINGS[0];
  let b = -Infinity;
  for (const f of FACINGS) {
    const d = f.fwd[0] * dx + f.fwd[1] * dy;
    if (d > b) {
      b = d;
      best = f;
    }
  }
  return best;
}
/** A picture made `W` by `H`, each pixel the nearest of the one it is made from. */
function resample(p: Pic, W: number, H: number): Pic {
  const o = new Pic(W, H);
  for (let y = 0; y < H; y++) {
    const sy = Math.min(p.h - 1, Math.floor((y * p.h) / H));
    for (let x = 0; x < W; x++) {
      const s = (sy * p.w + Math.min(p.w - 1, Math.floor((x * p.w) / W))) * 4;
      const i = (y * W + x) * 4;
      o.d[i] = p.d[s];
      o.d[i + 1] = p.d[s + 1];
      o.d[i + 2] = p.d[s + 2];
      o.d[i + 3] = 255;
    }
  }
  return o;
}
type RGBA = readonly [number, number, number, number];
const PALE: RGBA = [236, 232, 244, 200];
const PINKY: RGBA = [255, 79, 138, 220];
/** A line `w` wide. */
function stroke(pic: Pic, x0: number, y0: number, x1: number, y1: number, w: number, c: RGBA): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  const r = w / 2;
  const seen = new Set<number>();
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = y0 + ((y1 - y0) * i) / n;
    for (let dy = Math.floor(-r); dy <= Math.ceil(r); dy++) {
      for (let dx = Math.floor(-r); dx <= Math.ceil(r); dx++) {
        if (dx * dx + dy * dy > r * r + 0.25) continue;
        const X = Math.round(x + dx);
        const Y = Math.round(y + dy);
        const k = Y * pic.w + X;
        if (seen.has(k)) continue;
        seen.add(k);
        pic.over(X, Y, c[0], c[1], c[2], c[3]);
      }
    }
  }
}
/** An arrow `w` wide, its head at (`x1`, `y1`). */
function arrowOn(pic: Pic, x0: number, y0: number, x1: number, y1: number, w: number, c: RGBA): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const hl = 4.5 * w;
  stroke(pic, x0, y0, x1 - Math.cos(a) * w, y1 - Math.sin(a) * w, w, c);
  stroke(pic, x1, y1, x1 - Math.cos(a - 0.5) * hl, y1 - Math.sin(a - 0.5) * hl, w, c);
  stroke(pic, x1, y1, x1 - Math.cos(a + 0.5) * hl, y1 - Math.sin(a + 0.5) * hl, w, c);
}
/** A ring round (`cx`, `cy`) on the floor, `r` (the figure's own lengths) out, dotted, `k` times as big. */
function ringOn(pic: Pic, cx: number, cy: number, r: number, k: number, c: RGBA, gap = 9): void {
  const n = Math.round((r * k) / 1.4);
  for (let i = 0; i < n; i++) {
    if (Math.floor(i / gap) % 2) continue;
    const a = (i / n) * TAU2;
    const [x, y] = isoOf(r * Math.cos(a), r * Math.sin(a));
    stroke(pic, cx + x * k, cy + y * k, cx + x * k, cy + y * k, Math.max(2, k), c);
  }
}
const TAU2 = Math.PI * 2;

/** One of them as the game steers it round you: its ring (tiles) and where round it (radians), the way it goes round (1: as the angle grows), and what it is doing. */
interface Swirler {
  th: number;
  r: number;
  dir: number;
  phase: 'in' | 'near' | 'swoop' | 'out';
  ts: number;
  at: number;
  clock: number;
}
/** How far round you (radians) a swoop's last turn takes it, from the near ring to the grip's. */
const SWOOP_TURN = ((): number => {
  let a = 0;
  const dt = 1 / 600;
  for (let t = 0; t < HS_SWOOP.off[0]; t += dt) a += (swoopPace(t + dt / 2) / (HS_CIRCLE.fast.ring - swoopCarry(t + dt / 2).inward)) * dt;
  return a;
})();
/** The game steering it on by `dt`: closing in, faster as it closes; on the near ring until its swoop, begun so that its last turn ends square before you; out again after it. */
function stepSwirler(h: Swirler, t: number, dt: number): void {
  const C = HS_CIRCLE;
  if (h.phase === 'in') {
    h.r = Math.max(C.fast.ring, h.r - C.closing * dt);
    h.th += (h.dir * circlePace(h.r) * dt) / h.r;
    if (h.r <= C.fast.ring + 1e-9) h.phase = 'near';
  } else if (h.phase === 'near') {
    const q = Math.PI / 2;
    const before = h.th + h.dir * SWOOP_TURN;
    h.th += (h.dir * C.fast.pace * dt) / C.fast.ring;
    const after = h.th + h.dir * SWOOP_TURN;
    if (t >= h.at && Math.floor(before / q) !== Math.floor(after / q)) {
      h.phase = 'swoop';
      h.ts = 0;
      // (begun just where its last turn ends square: the turn's end on the way its picture faces)
      h.th = Math.round(after / q) * q - h.dir * SWOOP_TURN;
      return;
    }
  } else if (h.phase === 'swoop') {
    h.ts += dt;
    const ts = Math.min(h.ts, HS_SWOOP.long);
    h.r = C.fast.ring - swoopCarry(ts).inward + (ts > HS_SWOOP.off[0] ? 1.2 * (ts - HS_SWOOP.off[0]) : 0);
    h.th += (h.dir * swoopPace(ts) * dt) / h.r;
    if (h.ts >= HS_SWOOP.long - 1e-9) {
      h.phase = 'out';
      h.clock = 0;
      h.at = Infinity;
    }
  } else {
    h.r = Math.min(4.6, h.r + 1.2 * dt);
    h.th += (h.dir * C.slow.pace * dt) / h.r;
    if (h.r >= 4.6) h.phase = 'in';
  }
  h.clock += dt;
}
/** Where it is on the floor, how its picture faces, and which picture at which moment the game shows. */
function swirlerSeen(h: Swirler): { X: number; Y: number; f: Facing; move: string; t: number; fast: boolean } {
  const X = h.r * TILE3 * Math.cos(h.th);
  const Y = h.r * TILE3 * Math.sin(h.th);
  const f = facingOf(-X, -Y);
  const vx = -h.dir * Math.sin(h.th);
  const vy = h.dir * Math.cos(h.th);
  const left = f.left[0] * vx + f.left[1] * vy > 0;
  if (h.phase === 'swoop') return { X, Y, f, move: left ? 'swoopLeft' : 'swoopRight', t: Math.min(HS_SWOOP.long, Math.round(h.ts * 30) / 30), fast: true };
  const fast = h.phase === 'near' || (h.phase === 'in' && h.r <= HS_CIRCLE.switchAt);
  const move = `${left ? 'circleLeft' : 'circleRight'}${fast ? 'Fast' : ''}`;
  return { X, Y, f, move, t: (Math.floor(h.clock * 10 + 1e-6) / 10) % 1.2, fast };
}
/** The knight, and them round him, laid nearest last (and the grip of any that has caught him, round him), `k` times as big; the knight at (`cx`, `cy`). */
function layRound(pic: Pic, cx: number, cy: number, them: Swirler[], k = 1, knightI = 0): void {
  const draws: { y: number; f: () => void }[] = [];
  const grips: number[] = [];
  for (const h of them) {
    const s = swirlerSeen(h);
    const [x, y] = isoOf(s.X, s.Y);
    const X = Math.round(cx + x * k);
    const Y = Math.round(cy + y * k);
    draws.push({ y: Y, f: () => layShape(pic, shapeAt(s.move, s.t, s.f.view), X, Y, k, s.f.flip) });
    if (h.phase === 'swoop' && h.ts >= HS_SWOOP.hit - 1e-6 && h.ts < HS_SWOOP.hit + GRIP_FX.long) grips.push(Math.round((h.ts - HS_SWOOP.hit) * 30) / 30);
  }
  draws.push({
    y: cy,
    f: () => {
      for (const g of grips) pic.lay(gripPainted(g, 'front', 'far').px, GRIP_CANVAS.ax, GRIP_CANVAS.ay, cx, cy, k);
      layKnight(pic, 'front', cx, cy, k, false, knightI);
      for (const g of grips) pic.lay(gripPainted(g, 'front', 'near').px, GRIP_CANVAS.ax, GRIP_CANVAS.ay, cx, cy, k);
    },
  });
  draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
}

/** THE SPIRAL FILM: 1200 by 562 frames (and a band for the caption over each), at thirty a second. */
function spiralFilm(out: string, only?: string): void {
  const want = (name: string): boolean => !only || only.split(',').includes(name);
  const W = 1200;
  const H = 562;
  const frames: Card[] = [];
  let n = 0;
  const save = (pic: Pic, card: Card): void => {
    fs.writeFileSync(path.join(out, `f${String(n).padStart(4, '0')}.png`), pic.png());
    frames.push(card);
    n++;
  };
  const dt = 1 / 30;
  // 1. THE SWARM AT THE GAME'S SIZE (a phone's whole view across: 960 picture pixels, 480 game pixels, in 1200): six of
  // them spiralling in round the knight, faster as they close; one after another, the swoop
  if (want('swarm')) {
    const PW = 960;
    const PH = 450;
    const base = floorPic(PW, PH, 480 % 64, 236 % 32);
    const cx = 480;
    const cy = 236;
    const them: Swirler[] = Array.from({ length: 5 }, (_, i) => ({ th: (i / 5) * TAU2 + 0.12 * Math.sin(i * 2.3), r: 5.0 + 0.12 * Math.cos(i * 1.7), dir: 1, phase: 'in', ts: 0, at: 3.3 + [0, 3, 1, 4, 2][i] * 1.35, clock: i * 0.37 }));
    const LONG = 11.4;
    for (let i = 0; i < Math.round(LONG * 30); i++) {
      const t = i * dt;
      const pic = new Pic(PW, PH);
      pic.d.set(base.d);
      layRound(pic, cx, cy, them, 1, Math.floor(i / 6));
      const anyNear = them.some((h) => h.phase !== 'in');
      const swooping = them.some((h) => h.phase === 'swoop');
      const card = !anyNear
        ? { title: 'NEVER STILL · at the game\'s size', note: `Spiralling in round you: ${HS_CIRCLE.slow.pace} tiles a second on ${HS_CIRCLE.slow.ring} tiles out, faster as they close` }
        : swooping
          ? { title: 'THE SWOOP · one after another', note: 'A last fast turn, arms wide, held; the wrap in two frames; swirling off' }
          : { title: 'ON THE NEAR RING · at the game\'s size', note: `${HS_CIRCLE.fast.pace} tiles a second, ${HS_CIRCLE.fast.ring} tiles out: the fog streaming round the curve` };
      save(resample(pic, W, H), card);
      for (const h of them) stepSwirler(h, t, dt);
    }
  }
  // 2. THE CIRCLING GLIDES CLOSE UP (three times as big): to its left and to its right, side by side; slow, then fast; from
  // in front and from behind; the floor going by, the way to you and the way it goes marked on the floor
  if (want('glides')) {
    const K = 3;
    const CW = 200;
    const CH = 187;
    const big = floorPic(1600, 1000, 0, 0, false);
    for (const fast of [false, true]) {
      for (const view of ['front', 'back'] as const) {
        const f = FACINGS.find((x) => x.view === view && !x.flip) as Facing;
        for (let i = 0; i < 48; i++) {
          const t = i * dt;
          const pic = new Pic(CW * 2, CH);
          for (const [c, side] of [[0, 1], [1, -1]] as const) {
            const move = (`${side > 0 ? 'circleLeft' : 'circleRight'}${fast ? 'Fast' : ''}`) as GlideName;
            const d = glidePace(move) * TILE3 * t * side;
            const [fx, fy] = isoOf(f.left[0] * d, f.left[1] * d);
            // (the floor under it going by the other way: a window on the big floor, moving with it)
            const wx = Math.round(700 + fx);
            const wy = Math.round(450 + fy);
            for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
              const s = ((wy + y) * big.w + wx + x) * 4;
              const o = (y * pic.w + c * CW + x) * 4;
              pic.d[o] = big.d[s];
              pic.d[o + 1] = big.d[s + 1];
              pic.d[o + 2] = big.d[s + 2];
              pic.d[o + 3] = 255;
            }
            const ax = c * CW + 100;
            const ay = view === 'front' ? 112 : 122;
            layShape(pic, shapeAt(move, (Math.floor(t * 10 + 1e-6) / 10) % 1.2, view), ax, ay, 1);
          }
          const bigPic = pic.scaled(K);
          // (on the floor: the way to you, and the way it goes)
          for (const [c, side] of [[0, 1], [1, -1]] as const) {
            const ax = (c * CW + 100) * K;
            const ay = (view === 'front' ? 112 : 122) * K;
            // (both on the floor before it, clear of it)
            const on = (fw: number, l: number): [number, number] => {
              const [x, y] = isoOf(f.fwd[0] * fw + f.left[0] * l, f.fwd[1] * fw + f.left[1] * l);
              return [ax + x * K, ay + y * K];
            };
            // (from behind, the floor before it is behind it on the picture: the way it goes drawn on the floor behind it, nearer)
            const wf = view === 'front' ? 26 : -22;
            const [y0x, y0y] = on(view === 'front' ? 22 : 30, 0);
            const [y1x, y1y] = on(view === 'front' ? 56 : 62, 0);
            const [g0x, g0y] = on(wf, 14 * side);
            const [g1x, g1y] = on(wf, 46 * side);
            arrowOn(bigPic, y0x, y0y, y1x, y1y, 5, PINKY);
            arrowOn(bigPic, g0x, g0y, g1x, g1y, 5, PALE);
          }
          const vName2 = view === 'front' ? 'from in front' : 'from behind';
          save(bigPic, { title: `THE CIRCLING GLIDES · ${fast ? 'fast, the near ring' : 'slow, the far ring'} · ${vName2}`, note: `Left: to its left. Right: to its right. ${fast ? HS_CIRCLE.fast.pace : HS_CIRCLE.slow.pace} tiles a second. Pink: the way to you` });
        }
      }
    }
  }
  // 3. THE SWOOP AT HALF SPEED, three times as big, round the knight: from in front (round to its left), from behind (round
  // to its right); a moment of its fast glide first
  if (want('swoop')) {
    const K = 3;
    const PW = 400;
    const PH = 187;
    const cx = 200;
    const cy = 122;
    const base = floorPic(PW, PH, cx % 64, cy % 32);
    for (const [view, dir] of [['front', 1], ['back', -1]] as const) {
      const end = view === 'front' ? Math.PI : 1.5 * Math.PI;
      const PRE = 0.5;
      const h: Swirler = { th: end - dir * SWOOP_TURN - (dir * HS_CIRCLE.fast.pace * PRE) / HS_CIRCLE.fast.ring, r: HS_CIRCLE.fast.ring, dir, phase: 'near', ts: 0, at: Infinity, clock: 0 };
      const steps = Math.round((PRE + HS_SWOOP.long + 0.3) * 60);
      for (let i = 0; i < steps; i++) {
        const t = i / 60;
        if (h.phase === 'near' && t >= PRE - 1e-9) {
          h.phase = 'swoop';
          h.ts = 0;
        }
        const pic = new Pic(PW, PH);
        pic.d.set(base.d);
        layRound(pic, cx, cy, [h], 1, Math.floor(i / 12));
        const ts = h.ts;
        const note = h.phase !== 'swoop' ? 'Circling you fast on the near ring'
          : ts < HS_SWOOP.turn[1] ? 'Its last fast turn: a burst round you, arms flung wide, braking square before you'
          : ts <= HS_SWOOP.strike[0] + 1e-6 ? 'Held, shivering, the pink burning in its throat: the warning'
          : ts <= HS_SWOOP.strike[1] + 1e-6 ? 'THE WRAP IN TWO FRAMES, smeared'
          : ts <= HS_SWOOP.hold + 1e-6 ? 'The grey grip: it holds you'
          : 'It lets go and swirls off round you again';
        save(pic.scaled(K), { title: `THE SWOOP · ${view === 'front' ? 'from in front' : 'from behind'} · half speed`, note });
        if (h.phase === 'swoop') stepSwirler(h, t, 1 / 60);
        else h.th += (dir * HS_CIRCLE.fast.pace) / HS_CIRCLE.fast.ring / 60;
        h.clock += h.phase === 'swoop' ? 0 : 1 / 60;
      }
    }
  }
  fs.writeFileSync(path.join(out, 'film.json'), JSON.stringify({ w: W, h: H, k: 1, frames }));
  console.log('spiral film', n, 'frames', (n / 30).toFixed(1), 's; the swoop\'s last turn', ((SWOOP_TURN * 180) / Math.PI).toFixed(0), 'degrees');
}

/** THE SPIRAL SHEET: its picture (1200 wide) and where to write on it (sheet.json); tools/hush_shapes_spiral_sheet.py writes on it. */
function spiralSheet(out: string): void {
  const W = 1200;
  const labels: { x: number; y: number; text: string; size: number; color?: string; anchor?: string }[] = [];
  const parts: Pic[] = [];
  const partLabels: (typeof labels)[] = [];
  // A. THE SPIRAL FROM ABOVE (the game's own slant), twice the game's size: its rings, one of them spiralling in round the
  // knight, slow out on the far ring, fast on the near one, then its swoop
  {
    const K = 2;
    const PW = 600;
    const PH = 372;
    const cx = 300;
    const cy = 210;
    const small = floorPic(PW, PH, cx % 64, cy % 32);
    const pic = small.scaled(K);
    const C = HS_CIRCLE;
    ringOn(pic, cx * K, cy * K, C.slow.ring * TILE3, K, [236, 232, 244, 120]);
    ringOn(pic, cx * K, cy * K, C.switchAt * TILE3, K, [176, 172, 188, 100], 5);
    ringOn(pic, cx * K, cy * K, C.fast.ring * TILE3, K, [236, 232, 244, 140]);
    ringOn(pic, cx * K, cy * K, C.grip * TILE3, K, [255, 79, 138, 150], 4);
    // (its way in: the spiral, steered as the game would, from the far ring round and in to its swoop)
    const h: Swirler = { th: 3.55, r: C.slow.ring, dir: 1, phase: 'in', ts: 0, at: 0, clock: 0 };
    const path: [number, number][] = [];
    const marks: Swirler[] = [];
    const markAt = [0, 1.5, 2.8];
    let t = 0;
    let swoopMark = false;
    let swoopFrom = Infinity;
    while (t < 12 && !(h.phase === 'swoop' && h.ts >= HS_SWOOP.turn[1])) {
      const [x, y] = isoOf(h.r * TILE3 * Math.cos(h.th), h.r * TILE3 * Math.sin(h.th));
      path.push([cx * K + x * K, cy * K + y * K]);
      if (markAt.some((m) => Math.abs(m - t) < 1e-6 + 1 / 60)) marks.push({ ...h });
      if (h.phase === 'swoop' && !swoopMark) {
        swoopMark = true;
        swoopFrom = path.length - 1;
        marks.push({ ...h });
      }
      stepSwirler(h, t, 1 / 30);
      t += 1 / 30;
    }
    const last = { ...h };
    for (let i = 1; i < path.length; i++) stroke(pic, path[i - 1][0], path[i - 1][1], path[i][0], path[i][1], 3, i > swoopFrom ? [255, 79, 138, 200] : [236, 232, 244, 150]);
    for (let i = 8; i < Math.min(path.length, swoopFrom); i += 14) arrowOn(pic, path[i - 3][0], path[i - 3][1], path[i][0], path[i][1], 3, [236, 232, 244, 200]);
    // (the swoop's last turn in pink, to where it brakes square before you)
    const e = path.length - 1;
    arrowOn(pic, path[e - 3][0], path[e - 3][1], path[e][0], path[e][1], 3, [255, 79, 138, 230]);
    layRound(pic, cx * K, cy * K, [...marks, last], K, 0);
    // (each ring named where it is nearest you, at its foot on the picture)
    const tag = (r: number, text: string, color = '#ece8f4'): void => {
      const [x, y] = isoOf((r * TILE3) / Math.SQRT2, (-r * TILE3) / Math.SQRT2);
      labels.push({ x: cx * K + x * K + 8, y: cy * K + y * K - 12, text, size: 18, color });
    };
    tag(C.grip, `${C.grip}`, '#ff6f9f');
    tag(C.fast.ring, `${C.fast.ring}`);
    tag(C.switchAt, `${C.switchAt}`, '#b0acbc');
    tag(C.slow.ring, `${C.slow.ring} tiles`);
    labels.push({ x: 18, y: 14, text: `far ring ${C.slow.ring} tiles: ${C.slow.pace} tiles a second round you, the slow glide`, size: 20, color: '#ece8f4' });
    labels.push({ x: 18, y: 44, text: `closing ${C.closing} tiles a second; faster as it closes; the fast glide inside ${C.switchAt}`, size: 20, color: '#b0acbc' });
    labels.push({ x: 18, y: 74, text: `near ring ${C.fast.ring} tiles: ${C.fast.pace} tiles a second; then the swoop`, size: 20, color: '#ece8f4' });
    labels.push({ x: 18, y: 104, text: `its last turn a burst to ${C.burst}, braking square on the grip's ring, ${C.grip} tiles`, size: 20, color: '#ff6f9f' });
    parts.push(pic);
    partLabels.push(labels.splice(0, labels.length));
  }
  // B. THE CIRCLING GLIDES, three times the game's size: to its left and to its right, slow and fast, from in front and
  // from behind; on the floor, pink the way to you, pale the way it goes
  {
    const K = 3;
    const CW = 100;
    const CH = 100;
    const pic = floorPic(CW * 4, CH * 2 + 16, 0, 0, false).scaled(K);
    const cells: [GlideName, View][] = [];
    for (const view of ['front', 'back'] as const) for (const g of ['circleLeft', 'circleRight', 'circleLeftFast', 'circleRightFast'] as const) cells.push([g, view]);
    cells.forEach(([g, view], i) => {
      const c = i % 4;
      const r = Math.floor(i / 4);
      const ax = c * CW + 52;
      const ay = r * CH + (view === 'front' ? 72 : 80);
      const p = shapeAt(g, 0.3, view);
      pic.shadow(ax * K, ay * K, MOB.shadow * K, 0.5);
      pic.lay(p.px, HS_CANVAS.ax, HS_CANVAS.ay, ax * K, ay * K, K, false);
      const f = FACINGS.find((x) => x.view === view && !x.flip) as Facing;
      const side = HS_GLIDES[g].side;
      // (both on the floor before it, clear of it)
      const on = (fw: number, l: number): [number, number] => {
        const [x, y] = isoOf(f.fwd[0] * fw + f.left[0] * l, f.fwd[1] * fw + f.left[1] * l);
        return [(ax + x) * K, (ay + y) * K];
      };
      const wf = view === 'front' ? 26 : -20;
      arrowOn(pic, ...on(view === 'front' ? 22 : 30, 0), ...on(view === 'front' ? 52 : 58, 0), 5, PINKY);
      arrowOn(pic, ...on(wf, 12 * side), ...on(wf, 40 * side), 5, PALE);
      const fast = HS_GLIDES[g].fast;
      labels.push({ x: c * CW * K + 12, y: r * CH * K + 10, text: `${side > 0 ? 'to its left' : 'to its right'} · ${fast ? 'fast' : 'slow'}${c === 0 ? (view === 'front' ? ' · in front' : ' · behind') : ''}`, size: 20, color: '#ece8f4' });
    });
    parts.push(pic);
    partLabels.push(labels.splice(0, labels.length));
  }
  // C. THE SWOOP, twice the game's size: its key moments from in front, the knight where its grip closes
  {
    const K = 2;
    const CW = 150;
    const CH = 130;
    const keys: [number, string][] = [
      [0, '0 s · circling fast'],
      [0.13, '0.13 · the burst round you'],
      [0.27, '0.27 · turning in, arms rising'],
      [HS_SWOOP.turn[1], `${HS_SWOOP.turn[1]} · square, arms wide`],
      [0.5, '0.50 · held: the warning'],
      [HS_SWOOP.strike[0] + 1 / 30, '0.70 · the wrap, smeared'],
      [0.98, '0.98 · the grip held'],
      [1.46, '1.46 · letting go, swirling off'],
    ];
    const pic = floorPic(CW * 4, CH * 2, 0, 0, false).scaled(K);
    const G0 = gripAt();
    keys.forEach(([t, text], i) => {
      const c = i % 4;
      const r = Math.floor(i / 4);
      const ax = c * CW + 46;
      const ay = r * CH + 92;
      const [gx, gy] = isoOf(G0[0], G0[1]);
      const gripping = t >= HS_SWOOP.hit - 1e-6 && t - HS_SWOOP.hit < GRIP_FX.long;
      const showKnight = t >= HS_SWOOP.turn[1] - 1e-6 && t < 1.3;
      // (in front: it is behind whoever it grips)
      layShape(pic, shapeAt('swoopLeft', t, 'front'), ax * K, ay * K, K);
      if (showKnight) {
        const X = Math.round((ax + gx) * K);
        const Y = Math.round((ay + gy) * K);
        if (gripping) pic.lay(gripPainted(t - HS_SWOOP.hit, 'front', 'far').px, GRIP_CANVAS.ax, GRIP_CANVAS.ay, X, Y, K);
        layKnight(pic, 'back', X, Y, K, true, 0);
        if (gripping) pic.lay(gripPainted(t - HS_SWOOP.hit, 'front', 'near').px, GRIP_CANVAS.ax, GRIP_CANVAS.ay, X, Y, K);
      }
      if (t < HS_SWOOP.turn[1]) {
        // (the way it is going round you: to its left)
        const [lx, ly] = isoOf(0, 34);
        arrowOn(pic, (ax + lx * 0.3) * K, (ay + ly * 0.3) * K, (ax + lx) * K, (ay + ly) * K, 4, PALE);
      }
      labels.push({ x: c * CW * K + 12, y: r * CH * K + 10, text, size: 19, color: t >= HS_SWOOP.turn[1] - 1e-6 && t <= HS_SWOOP.hit + 1e-6 ? '#ff6f9f' : '#ece8f4' });
    });
    parts.push(pic);
    partLabels.push(labels.splice(0, labels.length));
  }
  // (one above the next, each with a band over it for its heading)
  const BAND = 66;
  const heads = ['THE SPIRAL: round you, closing in, faster as they close', 'THE CIRCLING GLIDES: facing you, leaning into the turn', 'THE SWOOP: the last fast turn, then the grip'];
  const subs = ['twice the game\'s size, from above as the game sees it', 'three times the game\'s size · pink: the way to you · white: the way it goes', 'twice the game\'s size, from in front, round to its left'];
  const H = parts.reduce((a, p) => a + p.h + BAND, 0);
  const sheet = new Pic(W, H);
  let y = 0;
  const all: typeof labels = [];
  parts.forEach((p, i) => {
    for (let j = 0; j < BAND * W; j++) {
      sheet.d[(y * W) * 4 + j * 4] = 20;
      sheet.d[(y * W) * 4 + j * 4 + 1] = 19;
      sheet.d[(y * W) * 4 + j * 4 + 2] = 26;
      sheet.d[(y * W) * 4 + j * 4 + 3] = 255;
    }
    all.push({ x: 24, y: y + 6, text: heads[i], size: 26, color: '#ece8f4' });
    all.push({ x: 24, y: y + 38, text: subs[i], size: 17, color: '#b0acbc' });
    y += BAND;
    for (let j = 0; j < p.h; j++) sheet.d.set(p.d.subarray(j * p.w * 4, (j * p.w + Math.min(p.w, W)) * 4), ((y + j) * W) * 4);
    for (const l of partLabels[i]) all.push({ ...l, y: l.y + y });
    y += p.h;
  });
  fs.writeFileSync(path.join(out, 'sheet_base.png'), sheet.png());
  fs.writeFileSync(path.join(out, 'sheet.json'), JSON.stringify({ labels: all }));
  console.log('spiral sheet', W, 'x', H);
}

const [mode = 'look', out = 'shots/hush', only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
if (mode === 'look') look(out, only);
else if (mode === 'big') bigOf(out, only ?? 'stand:0');
else if (mode === 'close') close(out, only ?? 'stand:0');
else if (mode === 'sheet') sheet(out);
else if (mode === 'film') film(out, only);
else if (mode === 'spiral') spiralFilm(out, only);
else if (mode === 'spiralsheet') spiralSheet(out);
else {
  console.log('modes: look, sheet, film');
  process.exit(1);
}
