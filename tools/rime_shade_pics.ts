// THE RIME SHADE, AS PICTURES FOR THE OWNER (art/rime_shade*.ts; a mock-up, not in the game): painted here without a browser,
// as the tests paint (tests/helpers.ts `paintWithoutCanvas`), on floor 20's own ground (art/quiettower.ts, the Tower Top laid
// by src/dev/tower_level.ts: the stand-in the pictures stand on), the knight beside it for size.
//   npx tsx tools/rime_shade_pics.ts look <out dir> [move]   frames of each move, both ways round (for looking at)
//   npx tsx tools/rime_shade_pics.ts sheet <out dir>          the sheet's pieces (PNG) and sheet.json; tools/rime_shade_sheet.py
//                                                             puts it together with its captions
//   npx tsx tools/rime_shade_pics.ts film <out dir> [parts]   the film's frames (PNG) and their captions (film.json);
//                                                             tools/hush_shapes_film.py puts them together
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeZlib from 'node:zlib';
// @ts-ignore
import nodePath from 'node:path';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { RS_CANVAS, RS_FROST } from '../src/art/rime_shade';
import { RIME_SHADE, RS_BREATH, RS_DIES, RS_PACE, RS_REEL, RS_STAND_LONG } from '../src/art/rime_shade_moves';
import { FROZEN, FX_CANVAS, FROZEN_CANVAS, LINE_GONE, RIME_LINE, frozenPainted, fxAt, linePainted, markPainted, reachesAt } from '../src/art/rime_shade_fx';
import { TILE3, deathOfMob, paintMob } from '../src/art/new_mobs3';
import type { Painted } from '../src/art/kit';
import { hash } from '../src/art/kit';
import { paintQuietTower, towerTopTerrain } from '../src/art/quiettower';
import { pictureOf } from '../src/art/terrain';
import { topFloor, topLand } from '../src/dev/tower_level';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const fs = nodeFs as { mkdirSync(p: string, o: { recursive: boolean }): void; writeFileSync(p: string, d: unknown): void };
const zlib = nodeZlib as { deflateSync(b: Uint8Array, o?: { level: number }): Uint8Array };
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
  over(x: number, y: number, r: number, g: number, b: number, a: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = (y * this.w + x) * 4;
    const k = a / 255;
    this.d[i] = this.d[i] * (1 - k) + r * k;
    this.d[i + 1] = this.d[i + 1] * (1 - k) + g * k;
    this.d[i + 2] = this.d[i + 2] * (1 - k) + b * k;
    this.d[i + 3] = 255;
  }
  /** A painting laid with its picture pixel (`px0`, `py0`) at (`x`, `y`) here, `k` times as big, turned over if `flip`. */
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
  shadow(x: number, y: number, rx: number, strong = 0.55): void {
    const ry = rx * 0.5;
    for (let j = Math.floor(y - ry - 2); j <= y + ry + 2; j++) {
      for (let i = Math.floor(x - rx - 2); i <= x + rx + 2; i++) {
        const d = Math.hypot((i + 0.5 - x) / rx, (j + 0.5 - y) / ry);
        if (d < 1) this.over(i, j, 10, 10, 14, 255 * strong * (1 - d * d));
      }
    }
  }
  /** A soft light (the game's: drawn over the dark), at (`x`, `y`), `r` round. */
  light(x: number, y: number, r: number, c: readonly [number, number, number], a: number): void {
    for (let j = Math.floor(y - r); j <= y + r; j++) {
      for (let i = Math.floor(x - r); i <= x + r; i++) {
        const d = Math.hypot(i + 0.5 - x, j + 0.5 - y) / r;
        if (d < 1) this.over(i, j, c[0], c[1], c[2], 255 * a * (1 - d) * (1 - d));
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
  clone(): Pic {
    const c = new Pic(this.w, this.h);
    c.d.set(this.d);
    return c;
  }
}

// =============================================================================================
// FLOOR 20'S GROUND: the Tower Top as the game paints it (its flags in rings), a patch of it round its middle

const TOP = towerTopTerrain(topFloor(), topLand());
/** A patch of the Tower Top `w` by `h` (picture pixels), the platform's middle at (`cx`, `cy`) on it, shifted `sx`, `sy` tiles. */
function groundPic(w: number, h: number, cx: number, cy: number, sx = 0, sy = 0): Pic {
  const [mx, my] = pictureOf(15 + sx, 15 + sy);
  const p = paintQuietTower(TOP, Math.round(mx - cx), Math.round(my - cy), w, h);
  const pic = new Pic(w, h);
  pic.d.set(p.rgba);
  // (the game's dark, lightly: the hero's light in the middle, falling away to the edges)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (x - w / 2) / (w / 2);
    const dy = (y - h / 2) / (h / 2);
    const k = Math.max(0.42, 0.8 - 0.4 * (dx * dx * 0.8 + dy * dy));
    const i = (y * w + x) * 4;
    pic.d[i] *= k;
    pic.d[i + 1] *= k;
    pic.d[i + 2] *= k;
  }
  return pic;
}
function plainPic(w: number, h: number): Pic {
  const p = new Pic(w, h);
  for (let i = 0; i < w * h; i++) p.d.set([46, 46, 52, 255], i * 4);
  return p;
}

// =============================================================================================
// THE FIGURES

const MOB = RIME_SHADE;
type View = 'front' | 'back';
function shadeAt(move: string, t: number, view: View): Painted {
  return move === 'dying' ? deathOfMob(MOB, Math.min(1, t / MOB.dieTime), view) : paintMob(MOB, move, t, view);
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const setOf = (view: View) => (view === 'front' ? hero.front : hero.back);
const knightIdle = (view: View, i = 0): Sprite => setOf(view).idle[i % setOf(view).idle.length];
const knightWalk = (view: View, i = 0): Sprite => setOf(view).walk[i % setOf(view).walk.length];
function layShade(pic: Pic, p: Painted, x: number, y: number, k: number, flip = false, shadow = true): void {
  if (shadow) pic.shadow(x, y, MOB.shadow * k, 0.5);
  pic.lay(p.px, RS_CANVAS.ax, RS_CANVAS.ay, x, y, k, flip);
}
function laySprite(pic: Pic, s: Sprite, x: number, y: number, k: number, flip = false, shadow = true): void {
  const d = s.density ?? 1;
  if (shadow) pic.shadow(x, y, 11 * k, 0.55);
  pic.lay(s.img as unknown as Px, s.ax * d, s.ay * d, x, y, k, flip);
}
/** A point of the floor `fwd` along the way it faces and `left` to its left (its own lengths), seen from in front or behind (as the game truly sees a figure from behind): where it is on the picture from its floor point. */
function onScreen(view: View, fwd: number, left: number, up = 0): [number, number] {
  const G = Math.sqrt(2 / 3);
  if (view === 'front') return [G * (fwd + left), G * 0.5 * (fwd - left) - up];
  return [G * (fwd - left), G * 0.5 * (-fwd - left) - up];
}

// =============================================================================================
// LOOK: frames of each move, both ways round, twice as big, to look at

function look(out: string, only?: string): void {
  const moves: [string, number[]][] = [
    ['stand', [0, 0.6, 1.2, 1.8]],
    ['walk', [0, 0.3, 0.6, 0.9]],
    ['attack', [0, 0.16, 0.3, 0.4, 0.6, 0.7333, 0.7667, 0.8, 0.8333, 0.9, 1.1, 1.3, 1.75, 2.1]],
    ['reel', [0, 0.05, 0.1, 0.2, 0.3]],
    ['dying', [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.2]],
  ];
  const CW = 150;
  const CH = 170;
  for (const [move, ts] of moves) {
    if (only && move !== only) continue;
    const pic = plainPic(CW * (ts.length + 1), CH * 2);
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      laySprite(pic, knightIdle(view), CW * 0.5, CH * row + CH - 22, 1);
      ts.forEach((t, i) => layShade(pic, shadeAt(move, t, view), CW * (i + 1) + CW * 0.5, CH * row + CH - 22, 1));
    }
    fs.writeFileSync(path.join(out, `look_${move}.png`), pic.scaled(2).png());
    console.log('look', move);
  }
}

/** BIG: moments of a move (`move:t,t,...`), both ways round, four times as big, the knight beside them for size. */
function big(out: string, spec: string): void {
  const [move, list = '0'] = spec.split(':');
  const ts = list.split(',').map(Number);
  const CW = 120;
  const CH = 130;
  const pic = plainPic(CW * (ts.length + 1), CH * 2);
  for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
    laySprite(pic, knightIdle(view), CW * 0.5, CH * row + CH - 14, 1);
    ts.forEach((t, i) => layShade(pic, shadeAt(move, t, view), CW * (i + 1) + CW * 0.5, CH * row + CH - 14, 1));
  }
  fs.writeFileSync(path.join(out, `big_${move}.png`), pic.scaled(4).png());
  console.log('big', move);
}

/** CLOSE: its head and shoulders at a moment (`move:t`), both ways round, eight times as big. */
function close(out: string, spec: string): void {
  const [move, t0 = '0'] = spec.split(':');
  const t = Number(t0);
  const pic = plainPic(170, 100);
  for (const [i, view] of [[0, 'front'], [1, 'back']] as const) pic.lay(shadeAt(move, t, view).px, RS_CANVAS.ax, RS_CANVAS.ay, 45 + 85 * i, 120, 1);
  fs.writeFileSync(path.join(out, `close_${move}_${t0}.png`), pic.scaled(8).png());
  console.log('close', move, t0);
}

// =============================================================================================
// A SCENE: the Rime Shade at its floor point (`sx`, `sy`) on the picture, facing as the view shows it; its breath's mark and
// line on the floor before it; the knight standing on the line (`kd` tiles before it, `ks` to its side), frozen when the line
// reaches him; everything stood up laid in the order of its foot down the picture

interface Scene {
  view: View;
  /** Its move and the moment of it (seconds); and, if it has breathed out, how long ago (seconds; null if it has not). */
  move: string;
  t: number;
  since: number | null;
  /** How far into its breath (for the mark), or null. */
  breath: number | null;
  /** The knight: where (tiles before it, to its side), and what he is doing: standing, walking (his frame), or frozen since `frozen` seconds. */
  kd: number;
  ks: number;
  kFrame: number;
  kWalk: boolean;
  kFace: View;
  kFlip: boolean;
  frozen: number | null;
}
/** The knight, rimed from his feet up (the film's stand-in: how a hero looks frozen is the main chat's to make). */
function rimed(s: Sprite, k: number): Px {
  const src = s.img as unknown as Px;
  const p = new Px(src.w, src.h);
  p.d.set(src.d);
  const d = s.density ?? 1;
  const hex = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const i = (y * p.w + x) * 4;
    if (p.d[i + 3] !== 255) continue;
    const up = (s.ay * d - y) / 60;
    if (up > 0.46 * k || hash(x, y, 6931) > 0.95 - up) continue;
    const v = (p.d[i] + p.d[i + 1] + p.d[i + 2]) / 3;
    const c = hex(v > 150 ? RS_FROST[4] : v > 100 ? RS_FROST[3] : v > 60 ? RS_FROST[2] : RS_FROST[1]);
    p.d[i] = c[0];
    p.d[i + 1] = c[1];
    p.d[i + 2] = c[2];
  }
  return p;
}
function scene(base: Pic, sx: number, sy: number, sc: Scene, withKnight = true): Pic {
  const pic = base.clone();
  const { view } = sc;
  const lights: { x: number; y: number; r: number; c: [number, number, number]; a: number }[] = [];
  const hexOf = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const layFx = (p: Px, ax: number, ay: number, x: number, y: number): void => pic.lay(p, ax, ay, Math.round(x), Math.round(y), 1);
  // ON THE FLOOR: the mark, the rime's crust
  if (sc.breath !== null) layFx(markPainted(sc.breath, view), FX_CANVAS.ax, FX_CANVAS.ay, sx, sy);
  if (sc.since !== null) {
    const f = linePainted(sc.since, view, 'floor');
    layFx(f.px, FX_CANVAS.ax, FX_CANVAS.ay, sx, sy);
    for (const l of f.lights) lights.push({ x: l.x - FX_CANVAS.ax + sx, y: l.y - FX_CANVAS.ay + sy, r: l.r, c: hexOf(l.color), a: l.a });
  }
  const [kx, ky] = fxAt(view, sc.kd, sc.ks, 0, sx, sy);
  const draws: { y: number; f: () => void }[] = [];
  // the Rime Shade
  draws.push({ y: sy, f: () => {
    const p = shadeAt(sc.move, sc.t, view);
    layShade(pic, p, sx, sy, 1, false, sc.move !== 'dying' || sc.t < RS_DIES.unravel[1]);
    for (const l of p.lights) lights.push({ x: l.x - RS_CANVAS.ax + sx, y: l.y - RS_CANVAS.ay + sy, r: l.r, c: hexOf(l.color), a: l.a });
  } });
  // the crystals of the line, either side of the knight
  if (sc.since !== null) {
    for (const [near, dy] of [['behind', -0.5], ['before', 0.5]] as const) {
      draws.push({ y: ky + dy, f: () => layFx(linePainted(sc.since as number, view, 'air', near, sc.kd).px, FX_CANVAS.ax, FX_CANVAS.ay, sx, sy) });
    }
  }
  // the knight, and the frost closing over him
  if (withKnight) {
    draws.push({ y: ky, f: () => {
      const fz = sc.frozen;
      if (fz !== null && fz >= 0) pic.lay(frozenPainted(fz, view, 'far').px, FROZEN_CANVAS.ax, FROZEN_CANVAS.ay, Math.round(kx), Math.round(ky), 1);
      const spr = sc.kWalk ? knightWalk(sc.kFace, sc.kFrame) : knightIdle(sc.kFace, sc.kFrame);
      const held = fz !== null && fz >= 0 && fz < FROZEN.hold;
      pic.shadow(kx, ky, 11, 0.55);
      if (held) {
        const d = spr.density ?? 1;
        pic.lay(rimed(spr, Math.min(1, fz / FROZEN.close)), spr.ax * d, spr.ay * d, Math.round(kx), Math.round(ky), 1, sc.kFlip);
      } else laySprite(pic, spr, Math.round(kx), Math.round(ky), 1, sc.kFlip, false);
      if (fz !== null && fz >= 0) {
        const fp = frozenPainted(fz, view, 'near');
        pic.lay(fp.px, FROZEN_CANVAS.ax, FROZEN_CANVAS.ay, Math.round(kx), Math.round(ky), 1);
        for (const l of fp.lights) lights.push({ x: l.x - FROZEN_CANVAS.ax + kx, y: l.y - FROZEN_CANVAS.ay + ky, r: l.r, c: hexOf(l.color), a: l.a });
      }
    } });
  }
  draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
  for (const l of lights) pic.light(l.x, l.y, l.r, l.c, l.a * 0.6);
  return pic;
}

// =============================================================================================
// THE FILM: every move from in front and from behind on floor 20's ground with the knight, captioned; the breath creeping and
// the knight frozen; once outrunning it; the breath at half speed

interface Card {
  title: string;
  note: string;
}
const FW = 400;
const FH = 250;
function film(out: string, only?: string): void {
  const want = (name: string): boolean => !only || only.split(',').includes(name);
  const frames: Card[] = [];
  let n = 0;
  const save = (pic: Pic, card: Card): void => {
    fs.writeFileSync(path.join(out, `f${String(n).padStart(4, '0')}.png`), pic.png());
    frames.push(card);
    n++;
  };
  const vName = (v: View): string => (v === 'front' ? 'from in front' : 'from behind');
  // (where it stands on the picture, and the ground under it: the Tower Top's flags in rings round its middle)
  const placeOf = (view: View): [number, number] => (view === 'front' ? [96, 112] : [96, 226]);
  const bases = new Map<string, Pic>();
  const bg = (view: View, key = ''): Pic => {
    const k = view + key;
    if (!bases.has(k)) bases.set(k, groundPic(FW, FH, FW * 0.5, FH * 0.55, view === 'front' ? -1.5 : 1.2, view === 'front' ? 0.5 : -0.8));
    return bases.get(k) as Pic;
  };
  const still = (view: View): Omit<Scene, 'move' | 't'> => ({ view, since: null, breath: null, kd: 2.2, ks: -1.4, kFrame: 0, kWalk: false, kFace: view === 'front' ? 'back' : 'front', kFlip: true, frozen: null });
  // ITS STAND
  for (const view of want('stand') ? (['front', 'back'] as const) : []) {
    const [sx, sy] = view === 'front' ? [150, 150] : [150, 205];
    for (let i = 0; i < Math.round(RS_STAND_LONG * 30); i++) {
      const t = Math.floor(i / 3) / 10;
      save(scene(bg(view), sx, sy, { ...still(view), move: 'stand', t, kd: 0.2, ks: -1.9, kFrame: Math.floor(i / 3), kFace: view, kFlip: false }), { title: `THE RIME SHADE · ${vName(view)}`, note: 'Hunched, breathing: its fog rising and falling, its icicle fingers clinking' });
    }
  }
  // ITS DRIFT
  for (const view of want('drift') ? (['front', 'back'] as const) : []) {
    const [sx0, sy0] = view === 'front' ? [70, 80] : [80, 236];
    for (let i = 0; i < 75; i++) {
      const tt = i / 30;
      const t = Math.floor(tt * 10) / 10;
      const [dx, dy] = onScreen(view, RS_PACE * TILE3 * tt, 0);
      // (the knight stands still, the Rime Shade drifting past him)
      const [kx, ky] = onScreen(view, 2.4 * TILE3, -2.0 * TILE3);
      const sc: Scene = { ...still(view), move: 'walk', t, kd: (2.4 - RS_PACE * tt), ks: -3.0, kFrame: Math.floor(i / 3) };
      void kx;
      void ky;
      save(scene(bg(view), Math.round(sx0 + dx), Math.round(sy0 + dy), sc), { title: `ITS DRIFT · ${vName(view)}`, note: `Low, half walking, its feet never down: ${RS_PACE} tiles a second` });
    }
  }
  // THE RIME BREATH, the knight on the line, frozen; and from behind
  const KD = 3.3;
  const breathFrames = (view: View, half: boolean, from: number, to: number, title: string, kd = KD): void => {
    const [sx, sy] = placeOf(view);
    const lead = 0.3;
    const reach = reachesAt(kd) as number;
    const step = half ? 1 / 60 : 1 / 30;
    for (let T = from; T <= to + 1e-9; T += step) {
      const t = T - lead;
      const since = t >= RS_BREATH.hit ? t - RS_BREATH.hit : null;
      const fz = since !== null ? since - reach : null;
      const free = fz !== null && fz > FROZEN.hold;
      // (let go, he steps back off the rime)
      const back = free ? Math.min(0.9, (fz - FROZEN.hold) * 1.6) : 0;
      const move = t < 0 ? 'stand' : t <= RS_BREATH.long ? 'attack' : 'stand';
      const mt = t < 0 ? (t + lead) : t <= RS_BREATH.long ? t : t - RS_BREATH.long;
      const sc: Scene = {
        view, move, t: mt, since, breath: t >= 0 ? t : null,
        kd: kd + back, ks: 0, kFrame: free && back < 0.9 ? Math.floor(T * 10) : 0, kWalk: free && back < 0.9,
        kFace: view === 'front' ? 'back' : 'front', kFlip: true, frozen: fz,
      };
      const note = t < 0 ? 'Hunched, breathing' : t < RS_BREATH.gather ? 'It sinks, gathering itself' : t < RS_BREATH.warn[0] ? 'It straightens to its full height, taller than the knight' : t <= RS_BREATH.strike[0] + 1e-6 ? 'Drawing in, HELD: the frost forming over it, the line marked on the floor' : t <= RS_BREATH.hit + 1e-6 ? 'IT BREATHES OUT IN TWO FRAMES, smeared' : fz !== null && fz >= 0 && fz < FROZEN.hold ? `The rime reaches him: FROZEN IN PLACE ${FROZEN.hold} s` : fz !== null && fz >= FROZEN.hold && fz < FROZEN.hold + 0.5 ? 'The ice shatters: he is free' : since !== null && since < RIME_LINE.long / RIME_LINE.pace ? `The rime creeps down the line, ${RIME_LINE.pace} tiles a second, crystals spiking up` : since !== null && since < RIME_LINE.long / RIME_LINE.pace + RIME_LINE.lies - RIME_LINE.melt ? `The rime lies on the floor ${RIME_LINE.lies} s` : 'It melts away';
      save(scene(bg(view), sx, sy, sc), { title, note });
    }
  };
  for (const view of want('breath') ? (['front', 'back'] as const) : []) {
    breathFrames(view, false, 0, 0.3 + RS_BREATH.hit + LINE_GONE + 0.15, `THE RIME BREATH · ${vName(view)}`);
  }
  if (want('half')) breathFrames('front', true, 0.3 + 0.62, 0.3 + RS_BREATH.hit + (reachesAt(1.9) as number) + FROZEN.hold + 0.2, 'THE RIME BREATH · the strike at half speed', 1.9);
  // OUTRUNNING IT: he runs away down the line as it breathes out; the rime creeps after him and stops short at its end
  if (want('outrun')) {
    const view: View = 'front';
    const [sx, sy] = [70, 86];
    const lead = 0.3;
    for (let T = 0; T <= lead + RS_BREATH.hit + RIME_LINE.long / RIME_LINE.pace + 0.9; T += 1 / 30) {
      const t = T - lead;
      const since = t >= RS_BREATH.hit ? t - RS_BREATH.hit : null;
      // (he starts running as it breathes out)
      const run = since === null ? 0 : Math.min(since * 4.6, 7.4 - 2.4);
      const sc: Scene = {
        view, move: t < 0 ? 'stand' : t <= RS_BREATH.long ? 'attack' : 'stand', t: t < 0 ? T : t <= RS_BREATH.long ? t : t - RS_BREATH.long,
        since, breath: t >= 0 ? t : null, kd: 2.4 + run, ks: 0, kFrame: Math.floor(T * 12), kWalk: since !== null && run < 5, kFace: since !== null && run < 5 ? 'front' : 'back', kFlip: true, frozen: null,
      };
      const note = since === null ? 'The line is marked: get off it, or outrun it' : run < 5 ? `He runs (4.6 tiles a second); the rime creeps after him (${RIME_LINE.pace}) and never reaches him` : `It stops at its end, ${RIME_LINE.long} tiles on: he is clear`;
      save(scene(bg(view, 'run'), sx, sy, sc), { title: 'OUTRUNNING IT · from in front', note });
    }
  }
  // STRUCK
  for (const view of want('reel') ? (['front', 'back'] as const) : []) {
    const [sx, sy] = view === 'front' ? [160, 150] : [170, 205];
    for (let rep = 0; rep < 2; rep++) {
      for (let i = 0; i <= Math.round(RS_REEL * 30) + 6; i++) {
        const t = Math.min(RS_REEL, i / 30);
        save(scene(bg(view), sx, sy, { ...still(view), move: 'reel', t, kd: 1.4, ks: 0.3 }), { title: `STRUCK · ${vName(view)}`, note: 'Jolted back, its frost cracking, shards of it flung off, its fog torn and closing' });
      }
    }
  }
  // ITS DEATH
  for (const view of want('death') ? (['front', 'back'] as const) : []) {
    const [sx, sy] = view === 'front' ? [160, 170] : [170, 215];
    for (let i = 0; i <= Math.round(RS_DIES.long * 30) + 12; i++) {
      const t = Math.min(RS_DIES.long, i / 30);
      const note = t < 0.4 ? 'Struck down: it arches back, a last cold breath going out of it' : t < 1.2 ? 'Its frost cracks and falls away, gone before it reaches the floor' : 'It comes apart into fog: nothing left lying';
      save(scene(bg(view), sx, sy, { ...still(view), move: 'dying', t, kd: 1.9, ks: -1.3 }), { title: `ITS DEATH · ${vName(view)}`, note });
    }
  }
  fs.writeFileSync(path.join(out, 'film.json'), JSON.stringify({ w: FW, h: FH, frames }));
  console.log('film', n, 'frames', (n / 30).toFixed(1), 's');
}

// =============================================================================================
// THE SHEET'S PIECES (tools/rime_shade_sheet.py lays them one under another with their captions)

interface Piece {
  file: string;
  title: string;
  note: string;
  /** Words laid on the picture: where (picture pixels of the piece as saved), and what. */
  labels?: { x: number; y: number; text: string }[];
}
function sheet(out: string): void {
  const pieces: Piece[] = [];
  const save = (pic: Pic, piece: Piece): void => {
    fs.writeFileSync(path.join(out, piece.file), pic.png());
    pieces.push(piece);
  };
  // 1. standing, from in front and from behind, beside the knight, three times as big
  {
    const W = 400;
    const H = 132;
    const pic = groundPic(W, H, W / 2, H * 0.62, 3, -2);
    const y = H - 18;
    laySprite(pic, knightIdle('front'), 44, y, 1);
    layShade(pic, shadeAt('stand', 0, 'front'), 128, y, 1);
    layShade(pic, shadeAt('stand', 0, 'back'), 250, y, 1);
    laySprite(pic, knightIdle('back'), 350, y, 1);
    save(pic.scaled(3), { file: 's1_stand.png', title: 'THE RIME SHADE, THREE TIMES AS BIG', note: 'From in front and from behind, beside the knight. Hunched, it is about his height; it straightens taller.' });
  }
  // 2. straightened, at its full height, beside the knight (its breath's held warning), three times as big
  {
    const W = 400;
    const H = 150;
    const pic = groundPic(W, H, W / 2, H * 0.62, 3, -2);
    const y = H - 16;
    laySprite(pic, knightIdle('front'), 44, y, 1);
    layShade(pic, shadeAt('attack', 0.6, 'front'), 140, y, 1);
    layShade(pic, shadeAt('attack', 0.6, 'back'), 268, y, 1);
    laySprite(pic, knightIdle('back'), 360, y, 1);
    save(pic.scaled(3), { file: 's2_risen.png', title: 'STRAIGHTENED TO ITS FULL HEIGHT', note: 'Drawing in its breath: the frost forming over it, the cold gathering pale in its hollow.' });
  }
  // 3. a crowd at the game's size on the Tower Top, one breathing its line at the knight
  {
    const W = 1200;
    const H = 520;
    const pic = groundPic(W, H, W * 0.5, H * 0.5, 0, 0);
    const kx = 640;
    const ky = 300;
    // (one breathing at him: its line creeping toward him from up and to the left)
    const bx = kx - Math.round(Math.sqrt(2 / 3) * 4.2 * TILE3);
    const by = ky - Math.round(Math.sqrt(2 / 3) * 0.5 * 4.2 * TILE3);
    const sc: Scene = { view: 'front', move: 'attack', t: 1.35, since: 1.35 - RS_BREATH.hit, breath: 1.35, kd: 4.2, ks: 0, kFrame: 0, kWalk: false, kFace: 'back', kFlip: true, frozen: null };
    const withLine = scene(pic, bx, by, sc);
    const them: [number, number, View, string, number, boolean][] = [
      [380, 200, 'front', 'walk', 0.2, false],
      [470, 420, 'back', 'walk', 0.7, true],
      [860, 210, 'front', 'attack', 0.55, true],
      [930, 400, 'back', 'stand', 1.1, false],
      [250, 380, 'front', 'stand', 0.5, false],
      [1060, 300, 'front', 'attack', 1.8, true],
    ];
    const draws = them.map(([x, y, v, m, t, f]) => ({ y, f: () => layShade(withLine, shadeAt(m, t, v), x, y, 1, f) }));
    draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
    save(withLine, { file: 's3_crowd.png', title: 'A CROWD OF THEM AT THE GAME’S SIZE, ON THE TOWER TOP', note: 'About one phone screen across. One has breathed out: its line of rime creeps along the floor at the knight.' });
  }
  // 4. the breath's key moments, from in front and from behind, twice as big
  {
    const ts: [number, string][] = [[0, 'hunched'], [0.4, 'straightens'], [0.6, 'HELD'], [0.8, 'STRIKE'], [0.95, 'breathes out'], [1.75, 'spent']];
    const CW = 100;
    const CH = 128;
    const pic = groundPic(CW * ts.length, CH * 2, CW * 3, CH, 2, 2);
    const labels: { x: number; y: number; text: string }[] = [];
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      ts.forEach(([t, say], i) => {
        layShade(pic, shadeAt('attack', t, view), CW * i + CW * 0.45, CH * row + CH - 12, 1);
        if (row === 0) labels.push({ x: 2 * (CW * i + 4), y: 4, text: say });
      });
    }
    save(pic.scaled(2), { file: 's4_moments.png', title: 'THE RIME BREATH, ITS KEY MOMENTS', note: 'From in front (above) and from behind (below), twice as big. Its whole move 2.5 s; it breathes out at 0.83 s.', labels });
  }
  // 5. the line: marked, creeping (crystals spiking up at its front), the knight frozen; and lying, melting
  {
    const W = 400;
    const H = 236;
    const base = groundPic(W, H, W / 2, H * 0.55, -1.5, 0.5);
    const [sx, sy] = [92, 110];
    const shots: [number, string, string][] = [
      [0.6, 'THE LINE MARKED ON THE FLOOR', `While it is held, drawing in: ${RIME_LINE.long} tiles long, ${RIME_LINE.half * 2} wide, from it toward the knight. Plain to read before anything comes.`],
      [RS_BREATH.hit + 0.55, 'THE RIME CREEPS ALONG IT', `${RIME_LINE.pace} tiles a second (the hero runs 4.6): ice crystals spiking up at its front, a crust of rime behind.`],
      [RS_BREATH.hit + (reachesAt(3.3) as number) + 0.3, 'IT REACHES THE KNIGHT: FROZEN IN PLACE', `Frost closes over his feet and legs in two frames; he is held ${FROZEN.hold} s, then the ice shatters.`],
      [RS_BREATH.hit + 3.3, 'THE RIME LIES, AND MELTS AWAY', `Each stretch of it lies ${RIME_LINE.lies} s after the front passes, then melts away (from where it began).`],
    ];
    shots.forEach(([t, title, note], i) => {
      const since = t >= RS_BREATH.hit ? t - RS_BREATH.hit : null;
      const fz = since !== null ? since - (reachesAt(3.3) as number) : null;
      const move = t <= RS_BREATH.long ? 'attack' : 'stand';
      const sc: Scene = { view: 'front', move, t: t <= RS_BREATH.long ? t : t - RS_BREATH.long, since, breath: t, kd: fz !== null && fz > FROZEN.hold ? 3.3 + Math.min(0.9, (fz - FROZEN.hold) * 1.6) : 3.3, ks: 0, kFrame: 0, kWalk: false, kFace: 'back', kFlip: true, frozen: fz };
      save(scene(base, sx, sy, sc).scaled(3), { file: `s5_line${i}.png`, title, note });
    });
  }
  // 6. the knight frozen, close, both ways round; the ice cracking; shattering
  {
    const C = 100;
    const pic = groundPic(C * 4, C, C * 2, C * 0.7, 4, 3);
    const cells: [View, number, string][] = [['front', 0.15, 'frozen, from in front'], ['back', 0.15, 'frozen, from behind'], ['front', FROZEN.hold - 0.08, 'the ice cracking'], ['front', FROZEN.hold + 0.1, 'shattered: free']];
    const labels: { x: number; y: number; text: string }[] = [];
    cells.forEach(([view, fz, say], i) => {
      const x = C * i + C / 2;
      const y = C - 12;
      pic.lay(frozenPainted(fz, view, 'far').px, FROZEN_CANVAS.ax, FROZEN_CANVAS.ay, x, y, 1);
      const spr = knightIdle(view);
      const d = spr.density ?? 1;
      pic.shadow(x, y, 11, 0.55);
      if (fz < FROZEN.hold) pic.lay(rimed(spr, 1), spr.ax * d, spr.ay * d, x, y, 1);
      else laySprite(pic, spr, x, y, 1, false, false);
      pic.lay(frozenPainted(fz, view, 'near').px, FROZEN_CANVAS.ax, FROZEN_CANVAS.ay, x, y, 1);
      labels.push({ x: 3 * (C * i + 4), y: 4, text: say });
    });
    save(pic.scaled(3), { file: 's6_frozen.png', title: 'THE KNIGHT FROZEN IN PLACE, THREE TIMES AS BIG', note: 'Ice shot up round his feet and legs, leaning in over his shins. (His own frozen look is the main chat’s: here his colours are whitened from the feet up.)', labels });
  }
  fs.writeFileSync(path.join(out, 'sheet.json'), JSON.stringify({ pieces }));
  console.log('sheet', pieces.length, 'pieces');
}

// =============================================================================================

const mode = process.argv[2];
const out = process.argv[3] ?? '.';
fs.mkdirSync(out, { recursive: true });
if (mode === 'look') look(out, process.argv[4]);
else if (mode === 'big') big(out, process.argv[4] ?? 'stand:0');
else if (mode === 'close') close(out, process.argv[4] ?? 'stand:0');
else if (mode === 'film') film(out, process.argv[4]);
else if (mode === 'sheet') sheet(out);
else {
  console.log('modes: look, big, close, film, sheet');
  process.exit(1);
}
