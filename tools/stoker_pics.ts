// THE STOKER, AS PICTURES FOR THE OWNER (art/stoker*.ts; a mock-up, not in the game): painted here without a browser, as the tests
// paint (tests/helpers.ts `paintWithoutCanvas`), on floor 3's own ground (art/prison.ts, the black iron prison, look B: the stand-in
// furnace room the pictures stand in), the knight beside him for size.
//   npx tsx tools/stoker_pics.ts look <out dir> [move]      frames of each move, both ways round (for looking at)
//   npx tsx tools/stoker_pics.ts big <out dir> <move:t,t>   moments of a move, both ways round, three times as big
//   npx tsx tools/stoker_pics.ts sheet <out dir>            the sheet's pieces (PNG) and sheet.json; tools/rime_shade_sheet.py
//                                                          puts it together with its captions
//   npx tsx tools/stoker_pics.ts film <out dir> [parts]     the film's frames (PNG) and their captions (film.json);
//                                                          tools/hush_shapes_film.py puts them together
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeZlib from 'node:zlib';
// @ts-ignore
import nodePath from 'node:path';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { ST_CANVAS } from '../src/art/stoker';
import { GEAR_REST, STOKER, ST_BURST, ST_COALS, ST_DIES, ST_PACE, ST_RAKE, ST_REEL, ST_STAND_LONG, stokerBonesOf, stokerShovelAt } from '../src/art/stoker_moves';
import { COALS, COAL_FIRE, FX_CANVAS, RAKE_FIRE, RING, coalAt, coalInAir, coalLands, coalsFloor, fxAt, fxPainted, rakeFloor, ringFloor } from '../src/art/stoker_fx';
import { CRANK_CANVAS, CRANK_TURN, FIRE_WALL, FURNACE, FURNACE_OUT, FURNACE_ROAR, STOKER_ROOM } from '../src/art/stoker_room';
import { TILE3, deathOfMob, momentOf, paintBits, paintMob } from '../src/art/new_mobs3';
import type { Shape } from '../src/art/new_mobs3';
import { ENEMY_RIM } from '../src/art/mkit';
import { stage } from '../src/art/skin';
import type { Ring } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';
import type { Painted } from '../src/art/kit';
import { makePrisonArt } from '../src/art/prison';
import { makePrisonGateArt } from '../src/art/prison_gate';
import { GATE_UP, PILLAR, STRIP } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { EMBER } from '../src/art/props';

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

const MOB = STOKER;
type View = 'front' | 'back';
function stokerAt(move: string, t: number, view: View): Painted {
  return move === 'dying' ? deathOfMob(MOB, Math.min(1, t / MOB.dieTime), view) : paintMob(MOB, move, t, view);
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const setOf = (view: View) => (view === 'front' ? hero.front : hero.back);
const knightIdle = (view: View, i = 0): Sprite => setOf(view).idle[i % setOf(view).idle.length];
function plainPic(w: number, h: number): Pic {
  const p = new Pic(w, h);
  for (let i = 0; i < w * h; i++) p.d.set([40, 38, 44, 255], i * 4);
  return p;
}
function layStoker(pic: Pic, p: Painted, x: number, y: number, k: number, shadow = true): void {
  if (shadow) pic.shadow(x, y, MOB.shadow * k, 0.5);
  pic.lay(p.px, ST_CANVAS.ax, ST_CANVAS.ay, x, y, k);
}
function laySprite(pic: Pic, s: Sprite, x: number, y: number, k: number, flip = false, shadow = true): void {
  const d = s.density ?? 1;
  if (shadow) pic.shadow(x, y, 11 * k, 0.55);
  pic.lay(s.img as unknown as Px, s.ax * d, s.ay * d, x, y, k, flip);
}

/** LOOK: moments of each move, both ways round, as big as the game paints them (twice in the file). */
function look(out: string, only?: string): void {
  const moves: [string, number[]][] = [
    ['stand', [0, 0.6, 1.2, 1.8]],
    ['walk', [0, 0.2, 0.4, 0.6, 0.8, 1.0]],
    ['attack', [0, 0.2, 0.38, 0.62, 0.86, 1.12, 1.32, 1.7, 1.767, 1.8, 1.833, 2.0, 2.15, 2.5]],
    ['rake', [0, 0.2, 0.42, 0.9, 0.967, 1.0, 1.1, 1.27, 1.5, 1.8, 2.4]],
    ['burst', [0, 0.24, 0.55, 1.0, 1.4, 1.433, 1.467, 1.75, 2.2, 2.6]],
    ['reel', [0, 0.1, 0.2, 0.3]],
    ['dying', [0, 0.2, 0.45, 0.7, 1.0, 1.3, 1.6, 1.8, 2.0, 2.4, 2.8, 3.2]],
  ];
  const CW = 210;
  const CH = 250;
  for (const [move, ts] of moves) {
    if (only && move !== only) continue;
    const pic = plainPic(CW * (ts.length + 1), CH * 2);
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      laySprite(pic, knightIdle(view), CW * 0.5, CH * row + CH - 50, 1);
      ts.forEach((t, i) => layStoker(pic, stokerAt(move, t, view), CW * (i + 1) + CW * 0.45, CH * row + CH - 50, 1));
    }
    fs.writeFileSync(path.join(out, `look_${move}.png`), pic.png());
    console.log('look', move);
  }
}
/** BIG: moments of a move (`move:t,t,...`), both ways round, three times as big, the knight beside them for size. */
function big(out: string, spec: string, k = 3): void {
  const [move, list = '0'] = spec.split(':');
  const ts = list.split(',').map(Number);
  const CW = 200;
  const CH = 240;
  const pic = plainPic(CW * (ts.length + 1), CH * 2);
  for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
    laySprite(pic, knightIdle(view), CW * 0.5, CH * row + CH - 40, 1);
    ts.forEach((t, i) => layStoker(pic, stokerAt(move, t, view), CW * (i + 1) + CW * 0.45, CH * row + CH - 40, 1));
  }
  fs.writeFileSync(path.join(out, `big_${move}_${list.replace(/,/g, '_')}.png`), pic.scaled(k).png());
  console.log('big', move);
}


// =============================================================================================
// THE FURNACE ROOM (a stand-in, laid as the game lays floor 3: art/prison.ts's floor and walls, look B), with the furnace in its
// back wall and the crank beside it; and the Chained One's gateway with the fire in it

const A = makePrisonArt();
const G = makePrisonGateArt();
/** A sprite's picture (painted without a browser: its painting). */
const imgOf = (s: Sprite): Px => s.img as unknown as Px;
const layS = (pic: Pic, s: Sprite, x: number, y: number, k = 1): void => {
  const d = s.density ?? 1;
  pic.lay(imgOf(s), s.ax * d, s.ay * d, Math.round(x), Math.round(y), k);
};
/** A camera: where world tile (0, 0)'s top corner is on the picture. */
interface Cam { ox: number; oy: number }
const P = (cam: Cam, x: number, y: number): [number, number] => [cam.ox + (x - y) * 32, cam.oy + (x + y) * 16];
const ROOM = { x0: 0, x1: 11, y0: 0, y1: 10 };
/** Where the furnace stands in the back wall (along x, at the room's back edge), and the crank before the wall beside it. */
const FURN_AT = 3;
const CRANK_AT: [number, number] = [8.3, 0.9];
interface Draw { d: number; f: () => void }
/** The room's floor and its back walls, the furnace (`furnace`: its strips) set in them; and what stands, sorted with `more`. */
function roomPic(pic: Pic, cam: Cam, furnace: Strip[], crank: Sprite | null, more: Draw[] = [], floorMore?: (pic: Pic) => void): Pic {
  const { w, h } = pic;
  for (let i = 0; i < w * h; i++) pic.d.set([4, 4, 6, 255], i * 4);
  for (let x = ROOM.x0; x < ROOM.x1; x++) for (let y = ROOM.y0; y < ROOM.y1; y++) {
    const [px, py] = P(cam, x, y);
    layS(pic, A.floor(x, y), px, py);
  }
  // (a few of the prison's own tiles: a grate glowing, soot and rust before the furnace)
  const tile = (n: string, x: number, y: number, f = 0): void => {
    const t = A.tiles.find((q) => q.name === n);
    if (t?.frames) layS(pic, t.frames[f % t.frames.length], ...P(cam, x, y));
  };
  tile('soot', 4, 0); tile('soot', 5, 0); tile('soot', 5, 1); tile('rust stains', 9, 2); tile('a grate, glowing', 2, 6); tile('a grate', 8, 7); tile('a drain', 6, 8);
  floorMore?.(pic);
  const draws: Draw[] = [...more];
  for (let x = ROOM.x0; x < ROOM.x1; x++) {
    if (x >= FURN_AT && x < FURN_AT + FURNACE.wide / 32) continue;
    draws.push({ d: x - 1 + 1, f: () => layS(pic, A.face(true, x, -1), ...P(cam, x, -1)) });
  }
  for (let y = ROOM.y0; y < ROOM.y1; y++) draws.push({ d: y - 1 + 1, f: () => layS(pic, A.face(false, -1, y), ...P(cam, -1, y)) });
  for (const q of furnace) draws.push({ d: FURN_AT + q.t + 0.01, f: () => layS(pic, q.s, ...P(cam, FURN_AT + q.t, 0)) });
  if (crank) draws.push({ d: CRANK_AT[0] + CRANK_AT[1], f: () => layS(pic, crank, ...P(cam, CRANK_AT[0], CRANK_AT[1])) });
  draws.sort((a, b) => a.d - b.d).forEach((q) => q.f());
  return pic;
}
/** The prison's dark laid over a picture, with holes where the lights are (as the renderer does), and their glow over that. */
function lit(pic: Pic, lights: { x: number; y: number; r: number; c: readonly [number, number, number]; a: number }[], dark = 0.62): void {
  const { w, h, d } = pic;
  const k = new Float32Array(w * h).fill(1 - dark);
  for (const l of lights) {
    const R = l.r * 1.6;
    for (let y = Math.max(0, Math.floor(l.y - R)); y < Math.min(h, l.y + R); y++) for (let x = Math.max(0, Math.floor(l.x - R)); x < Math.min(w, l.x + R); x++) {
      const q = Math.hypot(x - l.x, (y - l.y) * 1.4) / R;
      if (q < 1) k[y * w + x] = Math.min(1.05, k[y * w + x] + (1 - q) * (1 - q) * Math.min(1, l.a * 3));
    }
  }
  for (let i = 0; i < w * h; i++) {
    d[i * 4] *= k[i];
    d[i * 4 + 1] *= k[i];
    d[i * 4 + 2] *= k[i];
  }
  for (const l of lights) pic.light(l.x, l.y, l.r, l.c, l.a * 0.5);
}
const rgb = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

/** A SHOT: the Stoker at world (`at`), seen `view` (his forward world +x from in front, world −y from behind), doing `move` at `t`; the knight; his fire on the floor; the room. */
interface Shot {
  view: View;
  move: string;
  t: number;
  at: [number, number];
  knight: [number, number] | null;
  kFrame?: number;
  /** His fire on the floor: which, and how far into his move. */
  fx?: { which: 'coals' | 'rake' | 'ring'; t: number; aim?: readonly [number, number] };
  furnace?: Strip[];
  crank?: Sprite | null;
  gear?: boolean;
}
/** World tiles from his own (along his forward, to his left), as he faces in this view. */
const worldOf = (view: View, at: [number, number], fwd: number, left: number): [number, number] => (view === 'front' ? [at[0] + fwd, at[1] - left] : [at[0] - left, at[1] - fwd]);
function shot(w: number, h: number, cam: Cam, sh: Shot): Pic {
  const lights: { x: number; y: number; r: number; c: readonly [number, number, number]; a: number }[] = [];
  const [sx, sy] = P(cam, sh.at[0], sh.at[1]);
  const draws: Draw[] = [];
  const fxl: { x: number; y: number; r: number; color: string; a: number }[] = [];
  // HIM
  draws.push({ d: sh.at[0] + sh.at[1], f: () => {
    const p = stokerAt(sh.move, sh.t, sh.view);
    layStoker(pic0, p, sx, sy, 1, sh.move !== 'dying' || sh.t < ST_DIES.long);
    for (const l of p.lights) lights.push({ x: l.x - ST_CANVAS.ax + sx, y: l.y - ST_CANVAS.ay + sy, r: l.r, c: rgb(l.color), a: l.a });
    // (his own light, as a boss's: the game's aura)
    if (sh.move !== 'dying') lights.push({ x: sx, y: sy - 60, r: 90, c: rgb(EMBER[2]), a: 0.25 });
  } });
  // THE KNIGHT, facing him
  if (sh.knight) {
    const [kx, ky] = P(cam, sh.knight[0], sh.knight[1]);
    const faceBack = sh.view === 'front';
    draws.push({ d: sh.knight[0] + sh.knight[1], f: () => {
      const spr = faceBack ? setOf('back').idle[(sh.kFrame ?? 0) % setOf('back').idle.length] : setOf('front').idle[(sh.kFrame ?? 0) % setOf('front').idle.length];
      laySprite(pic0, spr, kx, ky, 1, true);
      lights.push({ x: kx, y: ky - 20, r: 60, c: [200, 190, 220], a: 0.12 });
    } });
  }
  // THE COALS in the air (sorted with the figures by where they are over the floor)
  if (sh.fx?.which === 'coals') {
    const since = sh.fx.t - ST_COALS.hit;
    if (since >= 0) {
      const s = stokerBonesOf('attack', ST_COALS.hit);
      const sv = stokerShovelAt('attack', ST_COALS.hit, s);
      const from: [number, number, number] = [sv.lip[0] / TILE3, sv.lip[1] / TILE3, sv.lip[2]];
      for (let i = 0; i < COALS.n; i++) {
        const c = coalAt(i, since, from, sh.fx.aim ?? [4, 0]);
        if (!c) continue;
        const c0 = coalAt(i, Math.max(0, since - 1 / 30), from, sh.fx.aim ?? [4, 0]) ?? c;
        const [wx, wy] = worldOf(sh.view, sh.at, c[0], c[1]);
        const [x, y] = fxAt(sh.view, c[0], c[1], c[2] * TILE3 * 0.82);
        const [x0, y0] = fxAt(sh.view, c0[0], c0[1], c0[2] * TILE3 * 0.82);
        draws.push({ d: wx + wy, f: () => {
          const cp = new Px(40, 40);
          coalInAir(cp, 20 + ((sx + x) % 1), 20 + ((sy + y) % 1), since, i, [x0 - x, y0 - y]);
          pic0.lay(cp, 20, 20, Math.floor(sx + x), Math.floor(sy + y), 1);
          lights.push({ x: sx + x, y: sy + y, r: 26, c: rgb(EMBER[3]), a: 0.4 });
        } });
      }
    }
  }
  // the room, everything standing sorted
  const pic0 = new Pic(w, h);
  roomPic(pic0, cam, sh.furnace ?? STOKER_ROOM.furnace(true, 'lit', Math.floor(sh.t * 10) % FURNACE_ROAR.frames), sh.crank === undefined ? STOKER_ROOM.crank('missing') : sh.crank, draws, (pic) => {
    // ON THE FLOOR: his fire's marks and its fires (laid under what stands; the flames' tongues with them, good enough at this size)
    if (sh.fx) {
      const px = new Px(w, h);
      if (sh.fx.which === 'coals') coalsFloor(px, sx, sy, sh.fx.t, sh.view, sh.fx.aim ?? [4, 0], fxl);
      else if (sh.fx.which === 'rake') rakeFloor(px, sx, sy, sh.fx.t, sh.view, fxl);
      else ringFloor(px, sx, sy, sh.fx.t, sh.view, undefined, fxl);
      pic.lay(px, 0, 0, 0, 0, 1);
    }
    if (sh.gear) {
      const [gx, gy] = worldOf(sh.view, sh.at, GEAR_REST[0] / TILE3, GEAR_REST[1] / TILE3);
      layS(pic, STOKER_ROOM.gearDropped(Math.floor(sh.t * 8)), ...P(cam, gx, gy));
    }
  });
  // (the furnace's light, while it burns)
  const [fx0, fy0] = P(cam, FURN_AT + 2, 0);
  if (!sh.furnace || sh.furnace === STOKER_ROOM.furnace(true, 'lit', Math.floor(sh.t * 10) % FURNACE_ROAR.frames)) lights.push({ x: fx0, y: fy0 - 40, r: 150, c: rgb(EMBER[2]), a: 0.3 });
  for (const l of fxl) lights.push({ x: l.x, y: l.y, r: l.r, c: rgb(l.color), a: l.a });
  lit(pic0, lights);
  return pic0;
}

/** THE CHAINED ONE'S GATEWAY with the fire in it (his gate, its portcullis drawn up; the fire `fire`'s strips at the back of its arch). */
function gatePic(w: number, h: number, cam: Cam, fire: Strip[], knight: [number, number] | null, t: number): Pic {
  const pic = new Pic(w, h);
  for (let i = 0; i < w * h; i++) pic.d.set([4, 4, 6, 255], i * 4);
  for (let x = -2; x < 8; x++) for (let y = 0; y < 7; y++) layS(pic, A.floor(x, y), ...P(cam, x, y));
  for (let x = 2; x < 5; x++) for (let y = -3; y < 0; y++) layS(pic, A.floor(x, y), ...P(cam, x, y));
  const draws: Draw[] = [];
  for (let x = -2; x < 8; x++) if (x < 2 || x > 4) draws.push({ d: x - 1 + 1, f: () => layS(pic, A.face(true, x, -1), ...P(cam, x, -1)) });
  const a = 2;
  const face = 0;
  const wide = PILLAR / 32;
  const pAt = (tt: number, back = 0): [number, number] => [a + tt, face - back];
  const strips = (list: Strip[], t0: number, back: number, dd = 0): void => {
    for (const q of list) {
      const [x, y] = pAt(t0 + q.t, back);
      draws.push({ d: x + y + STRIP / 64 + dd, f: () => layS(pic, q.s, ...P(cam, x, y)) });
    }
  };
  for (const [x, y] of [pAt(0), pAt(3 + wide)]) draws.push({ d: x + y - wide, f: () => layS(pic, G.pillar(true), ...P(cam, x, y)) });
  strips(G.portcullis(true, true, GATE_UP), -wide, wide);
  strips(fire, -wide, wide * 0.5, 0.001);
  strips(G.arch(true, true, false), -wide, 0);
  const lights: { x: number; y: number; r: number; c: readonly [number, number, number]; a: number }[] = [];
  if (knight) draws.push({ d: knight[0] + knight[1], f: () => {
    const [kx, ky] = P(cam, knight[0], knight[1]);
    laySprite(pic, setOf('back').idle[Math.floor(t * 10) % setOf('back').idle.length], kx, ky, 1, true);
    lights.push({ x: kx, y: ky - 20, r: 60, c: [200, 190, 220], a: 0.14 });
  } });
  draws.sort((p, q) => p.d - q.d).forEach((q) => q.f());
  return pic;
}

// =============================================================================================
// THE FILM: every move from in front and from behind in the furnace room with the knight, captioned; the coals and the rake over
// the whole room; each strike at half speed; his death and the gear; the gear set in, the crank turned, the furnace and the fire out

interface Card { title: string; note: string }
const FW = 600;
const FH = 380;
const CAM_F: Cam = { ox: 278, oy: 130 };
const CAM_B: Cam = { ox: 300, oy: 70 };
const CAM_ALL: Cam = { ox: 560, oy: 214 };
const AT_F: [number, number] = [3.2, 4.5];
const AT_B: [number, number] = [5, 7.6];
function film(out: string, only?: string): void {
  const want = (name: string): boolean => !only || only.split(',').includes(name);
  const frames: Card[] = [];
  let n = 0;
  const save = (pic: Pic, card: Card, k = 2): void => {
    fs.writeFileSync(path.join(out, `f${String(n).padStart(4, '0')}.png`), (k === 1 ? pic : pic.scaled(k)).png());
    frames.push(card);
    n++;
  };
  const vName = (v: View): string => (v === 'front' ? 'from in front' : 'from behind');
  const close = (view: View, sh: Omit<Shot, 'view' | 'at' | 'knight'> & { knight?: [number, number] | null }): Pic =>
    shot(FW, FH, view === 'front' ? CAM_F : CAM_B, { view, at: view === 'front' ? AT_F : AT_B, knight: sh.knight === undefined ? (view === 'front' ? [AT_F[0] + 4, AT_F[1]] : [AT_B[0], AT_B[1] - 4]) : sh.knight, ...sh });
  // HIS STAND
  for (const view of want('stand') ? (['front', 'back'] as const) : []) {
    const N = Math.round((view === 'front' ? ST_STAND_LONG : 1.2) * 30);
    for (let i = 0; i < N; i++) save(close(view, { move: 'stand', t: Math.floor(i / 3) / 10, kFrame: Math.floor(i / 3) }), { title: `THE STOKER · ${vName(view)}`, note: 'Breathing: the fire in his belly swelling and sinking, smoke and sparks out of his flue' });
  }
  // HIS WALK (he walks toward the knight, who stands)
  for (const view of want('walk') ? (['front', 'back'] as const) : []) {
    const N = view === 'front' ? 48 : 36;
    for (let i = 0; i < N; i++) {
      const tt = i / 30;
      const go = ST_PACE * tt;
      const at: [number, number] = view === 'front' ? [AT_F[0] - 1 + go, AT_F[1]] : [AT_B[0], AT_B[1] + 1 - go];
      save(shot(FW, FH, view === 'front' ? CAM_F : CAM_B, { view, move: 'walk', t: Math.floor(tt * 10) / 10, at, knight: view === 'front' ? [AT_F[0] + 4.5, AT_F[1]] : [AT_B[0], AT_B[1] - 4.5] }), { title: `HIS WALK · ${vName(view)}`, note: `Heavy, each foot stamped down (soot puffed up, the floor shaken), the shovel dragged: ${ST_PACE} tiles a second` });
    }
  }
  // THE SHOVEL OF COALS
  const coalsNote = (t: number): string => {
    const C = ST_COALS;
    if (t < 0) return 'Breathing';
    if (t < C.plunge) return 'His fire-door flung open; the shovel swung round';
    if (t < C.out) return 'THE SHOVEL DRIVEN INTO HIS OWN FIREBOX, HELD: scooping the coals white-hot';
    if (t < C.warn[0]) return 'Torn out heaped; the door slammed; swung up over his shoulder';
    if (t <= C.strike[0] + 1e-6) return 'HELD HIGH, the coals blazing; where they will come down marked on the floor';
    if (t <= C.hit + 1e-6) return 'FLUNG IN TWO FRAMES, smeared';
    if (t < C.hit + 0.75) return `${COALS.n} burning coals arc out and come down where the knight stood`;
    return `Each a fire burning ${COAL_FIRE.burns} s`;
  };
  for (const view of want('coals') ? (['front', 'back'] as const) : []) {
    const end = ST_COALS.long + (view === 'front' ? 1.0 : 0.3);
    for (let T = -0.2; T <= end + 1e-9; T += 1 / 30) {
      const t = Math.max(0, T);
      const move = T < 0 ? 'stand' : t <= ST_COALS.long ? 'attack' : 'stand';
      save(close(view, { move, t: move === 'attack' ? t : Math.max(0, t - ST_COALS.long), fx: { which: 'coals', t: T, aim: [4, 0] } }), { title: `THE SHOVEL OF COALS · ${vName(view)}`, note: coalsNote(T) });
    }
  }
  // THE FIRE RAKE
  const rakeNote = (t: number): string => {
    const K = ST_RAKE;
    if (t < 0) return 'Breathing';
    if (t < K.warn[0]) return 'Turned away, the shovel heaved up high over his right shoulder';
    if (t <= K.strike[0] + 1e-6) return 'HELD: the arc marked on the floor before him';
    if (t <= K.hit + 1e-6) return 'SLAMMED DOWN IN TWO FRAMES, smeared';
    if (t <= K.drag[1] + 0.05) return 'DRAGGED ROUND: a sheet of fire raked up off the floor';
    return `The fire burns on ${RAKE_FIRE.burns} s: that floor is taken away`;
  };
  for (const view of want('rake') ? (['front', 'back'] as const) : []) {
    const end = ST_RAKE.long + (view === 'front' ? 0.8 : 0.2);
    for (let T = -0.2; T <= end + 1e-9; T += 1 / 30) {
      const t = Math.max(0, T);
      const move = T < 0 ? 'stand' : t <= ST_RAKE.long ? 'rake' : 'stand';
      save(close(view, { move, t: move === 'rake' ? t : Math.max(0, t - ST_RAKE.long), fx: { which: 'rake', t: T } }), { title: `THE FIRE RAKE · ${vName(view)}`, note: rakeNote(T) });
    }
  }
  // THE FURNACE BURSTS
  const burstNote = (t: number): string => {
    const K = ST_BURST;
    if (t < 0) return 'His finisher, when he is low on life';
    if (t < K.warn[0]) return 'His arms flung wide; his fire-door bursts open';
    if (t <= K.strike[0] + 1e-6) return 'HELD, ROARING: a ring marked round him, its three gaps marked out';
    if (t <= K.hit + 1e-6) return 'HURLED FORWARD IN TWO FRAMES: the fire belches out of him';
    if (t < K.hit + (RING.r1 - RING.r0) / RING.pace + 0.1) return `A RING OF FIRE ROLLS OUT, ${RING.pace} tiles a second, to ${RING.r1} tiles: get to a gap`;
    return 'Spent, heaving, his fire burnt low: the moment to hit him';
  };
  for (const view of want('burst') ? (['front', 'back'] as const) : []) {
    const end = ST_BURST.long + 0.1;
    for (let T = -0.2; T <= end + 1e-9; T += 1 / 30) {
      const t = Math.max(0, T);
      const move = T < 0 ? 'stand' : t <= ST_BURST.long ? 'burst' : 'stand';
      save(close(view, { move, t: move === 'burst' ? t : 0, fx: { which: 'ring', t: T }, knight: view === 'front' ? [AT_F[0] + 3, AT_F[1] - 0.6] : [AT_B[0] + 0.6, AT_B[1] - 3] }), { title: `THE FURNACE BURSTS · ${vName(view)}`, note: burstNote(T) });
    }
  }
  // OVER THE WHOLE ROOM: the coals and the rake
  if (want('above')) {
    const at: [number, number] = [3.5, 4];
    for (let T = 1.2; T <= ST_COALS.hit + 2.2; T += 1 / 30) {
      const move = T <= ST_COALS.long ? 'attack' : 'stand';
      save(shot(1200, 760, CAM_ALL, { view: 'front', move, t: move === 'attack' ? T : T - ST_COALS.long, at, knight: [at[0] + 4.5, at[1] + 0.3], fx: { which: 'coals', t: T, aim: [4.5, 0.3] } }), { title: 'THE SHOVEL OF COALS · over the whole room', note: coalsNote(T) }, 1);
    }
    for (let T = 0.6; T <= ST_RAKE.hit + 2.0; T += 1 / 30) {
      const move = T <= ST_RAKE.long ? 'rake' : 'stand';
      save(shot(1200, 760, CAM_ALL, { view: 'front', move, t: move === 'rake' ? T : T - ST_RAKE.long, at, knight: [at[0] + 1.0, at[1] + 4.6], fx: { which: 'rake', t: T } }), { title: 'THE FIRE RAKE · over the whole room', note: rakeNote(T) }, 1);
    }
  }
  // EACH STRIKE AT HALF SPEED
  if (want('half')) {
    const halves: [string, number, 'coals' | 'rake' | 'ring', string][] = [['attack', ST_COALS.hit, 'coals', 'THE SHOVEL OF COALS'], ['rake', ST_RAKE.hit, 'rake', 'THE FIRE RAKE'], ['burst', ST_BURST.hit, 'ring', 'THE FURNACE BURSTS']];
    for (const [move, hit, which, name] of halves) {
      for (let T = hit - 0.3; T <= hit + 0.35 + 1e-9; T += 1 / 60) save(close('front', { move, t: Math.round(T * 30) / 30, fx: { which, t: T, aim: [4, 0] } }), { title: `${name} · the strike at half speed`, note: T < hit - 2 / 30 ? 'Held' : T <= hit + 1e-6 ? 'The strike: two frames' : 'Carried through' });
    }
  }
  // STRUCK
  for (const view of want('reel') ? (['front', 'back'] as const) : []) {
    for (let i = 0; i < 3; i++) for (let T = 0; T <= ST_REEL + 1e-9; T += 1 / 30) save(close(view, { move: 'reel', t: T }), { title: `STRUCK · ${vName(view)}`, note: 'Jolted back, his door banged open, sparks burst out' });
  }
  // HIS DEATH, and the gear
  for (const view of want('death') ? (['front', 'back'] as const) : []) {
    const end = view === 'front' ? ST_DIES.long + 0.8 : ST_DIES.long;
    for (let T = 0; T <= end + 1e-9; T += 1 / 30) {
      const t = Math.min(T, ST_DIES.long);
      const note = t < 0.6 ? 'His fire flares, his door bursts open' : t < ST_DIES.knees ? 'The shovel flung down; to his knees' : t < ST_DIES.gear ? 'His fire going out' : t < ST_DIES.gearStill ? 'THE GEAR clatters out of his grate' : 'Cold, black iron and ash: the crank’s gear lies before him';
      save(close(view, { move: 'dying', t, gear: T >= ST_DIES.long }), { title: `HIS DEATH · ${vName(view)}`, note });
    }
  }
  // THE GEAR SET IN, THE CRANK TURNED, THE FURNACE GOING OUT; THE FIRE IN THE CHAINED ONE'S WAY GOING OUT
  if (want('crank')) {
    const cam: Cam = { ox: 70, oy: 128 };
    const kn: [number, number] = [7.4, 2.4];
    const room = (furnace: Strip[], crank: Sprite, t: number, lights: boolean): Pic => {
      const pic = new Pic(FW, FH);
      const draws: Draw[] = [{ d: kn[0] + kn[1], f: () => laySprite(pic, setOf('back').idle[Math.floor(t * 10) % setOf('back').idle.length], ...P(cam, kn[0], kn[1]), 1, false) }];
      roomPic(pic, cam, furnace, crank, draws);
      const [fx0, fy0] = P(cam, FURN_AT + 2, 0);
      const [cx0, cy0] = P(cam, CRANK_AT[0], CRANK_AT[1]);
      lit(pic, [...(lights ? [{ x: fx0, y: fy0 - 40, r: 150, c: rgb(EMBER[2]), a: 0.4 }] : []), { x: cx0, y: cy0 - 30, r: 70, c: [210, 200, 220] as const, a: 0.18 }, ...P(cam, kn[0], kn[1]).length ? [{ x: P(cam, kn[0], kn[1])[0], y: P(cam, kn[0], kn[1])[1] - 20, r: 60, c: [200, 190, 220] as const, a: 0.14 }] : []]);
      return pic;
    };
    const lit1 = (t: number): Strip[] => STOKER_ROOM.furnace(true, 'lit', Math.floor(t * 10) % FURNACE_ROAR.frames);
    for (let i = 0; i < 36; i++) save(room(lit1(i / 30), STOKER_ROOM.crank('missing'), i / 30, true), { title: 'THE FORGE CRANK · its gear missing', note: 'Beside the roaring furnace: the middle gear of its train gone, a plain gap' });
    for (let i = 0; i < 30; i++) save(room(lit1(i / 30), STOKER_ROOM.crank('set'), i / 30, true), { title: 'THE FORGE CRANK · the gear set in', note: 'The gear in its place; the wheel’s handle glows, ready to turn' });
    for (let i = 0; i < 36; i++) save(room(lit1(i / 30), STOKER_ROOM.crank('turning', Math.min(CRANK_TURN.frames - 1, Math.floor((i / 36) * CRANK_TURN.frames))), i / 30, true), { title: 'THE FORGE CRANK · turned', note: 'The wheel turned, the gears turning, the rod to the furnace’s damper turning' });
    for (let i = 0; i < 54; i++) {
      const f = Math.min(FURNACE_OUT.frames - 1, Math.floor((i / 48) * FURNACE_OUT.frames));
      save(room(STOKER_ROOM.furnace(true, 'going', f), STOKER_ROOM.crank('turned'), i / 30, f < FURNACE_OUT.frames * 0.6), { title: 'THE FURNACE GOES OUT', note: 'Its fire dying down to dark, a thread of smoke' });
    }
    const gcam: Cam = { ox: 300, oy: 150 };
    const gate = (fire: Strip[], t: number, burning: number): Pic => {
      const pic = gatePic(FW, FH, gcam, fire, [3.5, 4.2], t);
      const [gx, gy] = P(gcam, 3.5, 0);
      lit(pic, [{ x: gx, y: gy - 50, r: 150, c: rgb(EMBER[2]), a: 0.45 * burning }, { x: P(gcam, 3.5, 4.2)[0], y: P(gcam, 3.5, 4.2)[1] - 20, r: 70, c: [200, 190, 220], a: 0.16 }], 0.6);
      return pic;
    };
    for (let i = 0; i < 30; i++) save(gate(STOKER_ROOM.fireWall(true, 'burning', i % FIRE_WALL.frames), i / 30, 1), { title: 'THE CHAINED ONE’S WAY · while the furnace burns', note: 'A wall of fire filling his gateway' });
    for (let i = 0; i < 54; i++) {
      const f = Math.min(FIRE_WALL.out - 1, Math.floor((i / 45) * FIRE_WALL.out));
      save(gate(STOKER_ROOM.fireWall(true, i < 45 ? 'going' : 'gone', f), i / 30, 1 - f / FIRE_WALL.out), { title: 'THE CHAINED ONE’S WAY · the fire goes out', note: 'Dying down to embers and smoke: his hall is open' });
    }
  }
  fs.writeFileSync(path.join(out, 'film.json'), JSON.stringify({ w: 1200, h: 760, k: 1, frames }));
  console.log('film', frames.length, 'frames', (frames.length / 30).toFixed(1), 's');
}

// =============================================================================================
// THE SHEET'S PIECES (tools/rime_shade_sheet.py lays them one under another with their captions)

interface Piece { file: string; title: string; note: string; labels?: { x: number; y: number; text: string }[] }
function sheet(out: string): void {
  const pieces: Piece[] = [];
  const save = (pic: Pic, p: Piece): void => {
    fs.writeFileSync(path.join(out, p.file), pic.png());
    pieces.push(p);
  };
  const dark = (w: number, h: number): Pic => {
    const p = new Pic(w, h);
    for (let i = 0; i < w * h; i++) p.d.set([26, 24, 30, 255], i * 4);
    return p;
  };
  const crop = (p: Pic, x0: number, y0: number, w: number, h: number): Pic => {
    const c = new Pic(w, h);
    for (let y = 0; y < h; y++) c.d.set(p.d.subarray(((y + y0) * p.w + x0) * 4, ((y + y0) * p.w + x0 + w) * 4), y * w * 4);
    return c;
  };
  const side = (a: Pic, b: Pic): Pic => {
    const c = new Pic(a.w + b.w, Math.max(a.h, b.h));
    for (let y = 0; y < c.h; y++) {
      if (y < a.h) c.d.set(a.d.subarray(y * a.w * 4, (y + 1) * a.w * 4), y * c.w * 4);
      if (y < b.h) c.d.set(b.d.subarray(y * b.w * 4, (y + 1) * b.w * 4), (y * c.w + a.w) * 4);
    }
    return c;
  };
  // 1. HIM, FROM IN FRONT AND FROM BEHIND, BESIDE THE KNIGHT, THREE TIMES AS BIG
  {
    const pic = dark(400, 240);
    laySprite(pic, knightIdle('front'), 42, 190, 1);
    layStoker(pic, stokerAt('stand', 0, 'front'), 136, 190, 1);
    layStoker(pic, stokerAt('stand', 0, 'back'), 278, 190, 1);
    laySprite(pic, knightIdle('back'), 376, 190, 1, true);
    save(pic.scaled(3), { file: 's1_stoker.png', title: 'THE STOKER, THREE TIMES AS BIG', note: 'Twice the knight’s height, fused with his furnace: an iron firebox for a chest, coals glowing through its grate; a flue out of his back; a furnace mask, fire behind its grille; the great shovel.' });
  }
  // 2. IN HIS FURNACE ROOM, AS BIG AS THE GAME SHOWS HIM (one phone screen)
  {
    const pic = shot(1014, 380, { ox: 470, oy: 88 }, { view: 'front', move: 'stand', t: 0.4, at: [3.4, 4.6], knight: [7.4, 4.6], furnace: STOKER_ROOM.furnace(true, 'lit', 2) });
    save(pic, { file: 's2_room.png', title: 'IN HIS FURNACE ROOM, AS BIG AS THE GAME SHOWS HIM', note: 'One phone screen across, on floor 3’s own floor and walls: the furnace roaring in the back wall, the forge crank beside it, its gear missing.' });
  }
  // 3-5. EACH ATTACK'S KEY MOMENTS, FROM IN FRONT AND FROM BEHIND
  const moments = (file: string, title: string, note: string, move: string, list: [number, string][]): void => {
    const CW = 200;
    const CH = 220;
    const pic = dark(CW * 3, CH * 2);
    const labels: { x: number; y: number; text: string }[] = [];
    list.forEach(([t, say], i) => {
      for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
        layStoker(pic, stokerAt(move, t, view), CW * i + CW * (move === 'rake' && i === 0 && view === 'front' ? 0.62 : 0.5), CH * row + CH - (view === 'back' ? 34 : 22), 1);
        if (row === 0) labels.push({ x: 2 * (CW * i + 4), y: 4, text: say });
      }
    });
    save(pic.scaled(2), { file, title, note, labels });
  };
  moments('s3_coals.png', 'THE SHOVEL OF COALS', `In front (above), behind (below). Driven into his own firebox, held; held high; flung in two frames at ${ST_COALS.hit.toFixed(2)} s of ${ST_COALS.long} s.`, 'attack', [[0.6, 'into his firebox, held'], [1.6, 'held high'], [ST_COALS.hit, 'flung (two frames)']]);
  moments('s4_rake.png', 'THE FIRE RAKE', `Heaved up and held; slammed down in two frames at ${ST_RAKE.hit.toFixed(2)} s of ${ST_RAKE.long} s; dragged round, fire springing up behind it.`, 'rake', [[0.7, 'held up'], [ST_RAKE.hit, 'slammed down'], [1.3, 'dragged round']]);
  moments('s5_burst.png', 'THE FURNACE BURSTS (HIS FINISHER)', `His door burst open, held, roaring; hurled forward in two frames at ${ST_BURST.hit.toFixed(2)} s of ${ST_BURST.long} s; spent.`, 'burst', [[1.0, 'held, roaring'], [ST_BURST.hit, 'the burst'], [1.75, 'spent']]);
  // 6. OVER THE WHOLE ROOM: where the coals come down, the rake's sheet, the ring and its gaps
  {
    const at: [number, number] = [3.5, 4];
    const one = (t: number, which: 'coals' | 'rake' | 'ring', move: string, knight: [number, number], aim?: [number, number]): Pic => shot(1200, 640, { ox: 560, oy: 130 }, { view: 'front', move, t, at, knight, fx: { which, t, aim } });
    save(side(crop(one(1.6, 'coals', 'attack', [8, 4.3], [4.5, 0.3]), 300, 130, 600, 320), crop(one(ST_COALS.hit + coalLands(6) + 0.6, 'coals', 'attack', [8, 4.3], [4.5, 0.3]), 300, 130, 600, 320)), { file: 's6_coals.png', title: 'THE COALS, OVER THE WHOLE ROOM', note: `Held high, where his ${COALS.n} coals will come down is marked round the knight (left); they come down, each a fire ${COAL_FIRE.r * 2} tiles across burning ${COAL_FIRE.burns} s (right). The gaps between are the way out.` });
    save(side(crop(one(ST_RAKE.drag[1] + 0.4, 'rake', 'rake', [4.6, 8.6]), 300, 130, 600, 320), crop(one(ST_BURST.hit + 0.35, 'ring', 'burst', [6.6, 2.0]), 300, 130, 600, 320)), { file: 's7_rake_ring.png', title: 'THE RAKE’S FIRE, AND THE FURNACE’S RING', note: `The rake (left): a band of fire ${RAKE_FIRE.r0} to ${RAKE_FIRE.r1} tiles before him, burning ${RAKE_FIRE.burns} s. The burst (right): a ring rolling out to ${RING.r1} tiles at ${RING.pace} a second, three gaps in it the way through.` });
  }
  // 7. STRUCK, AND HIS DEATH; the gear before him
  {
    const CW = 200;
    const CH = 178;
    const list: [string, number, string][] = [['reel', 0.1, 'struck'], ['dying', 0.45, 'his fire flares'], ['dying', 1.3, 'to his knees'], ['dying', 1.75, 'the gear falls out'], ['dying', ST_DIES.long, 'cold; the gear']];
    const pic = dark(CW * 3, CH * 2);
    const labels: { x: number; y: number; text: string }[] = [];
    list.forEach(([move, t, say], i) => {
      const ox = CW * (i % 3) + CW * 0.36;
      const oy = CH * Math.floor(i / 3) + CH - 22;
      if (i === 4) {
        const [gx, gy] = fxAt('front', GEAR_REST[0] / TILE3, GEAR_REST[1] / TILE3);
        layS(pic, STOKER_ROOM.gearDropped(2), ox + gx, oy + gy, 1);
      }
      layStoker(pic, stokerAt(move, t, 'front'), ox, oy, 1, move !== 'dying' || t < 1);
      labels.push({ x: 2 * (CW * (i % 3) + 4), y: 2 * CH * Math.floor(i / 3) + 4, text: say });
    });
    layS(pic, STOKER_ROOM.gearDropped(2), CW * 2.5, CH * 1.55, 3);
    labels.push({ x: 2 * (CW * 2 + 4), y: 2 * CH + 4, text: 'the gear, close' });
    save(pic.scaled(2), { file: 's8_death.png', title: 'STRUCK, AND HIS DEATH', note: `Struck: jolted back, sparks out of his door. His death (${ST_DIES.long} s): his fire flares, the shovel flung down, to his knees; his fire goes out, cooling to black iron and ash; THE GEAR clatters out of his grate and lies before him.`, labels });
  }
  // 8. THE FURNACE, LIT AND OUT; THE FIRE IN THE CHAINED ONE'S WAY, BURNING AND GOING OUT
  {
    const W = 300;
    const H = 156;
    const pic = dark(W * 2, H * 2);
    const fur = (x0: number, y0: number, state: 'lit' | 'out'): void => {
      const p = dark(W, H);
      const c2: Cam = { ox: 60, oy: 110 };
      for (let x = -1; x < 6; x++) for (let y = 0; y < 3; y++) layS(p, A.floor(x, y), ...P(c2, x, y));
      for (const q of STOKER_ROOM.furnace(true, state, 2)) layS(p, q.s, ...P(c2, q.t, 0));
      lit(p, state === 'lit' ? [{ x: P(c2, 2, 0)[0], y: P(c2, 2, 0)[1] - 30, r: 140, c: rgb(EMBER[2]), a: 0.4 }] : [{ x: P(c2, 2, 0)[0], y: P(c2, 2, 0)[1] - 30, r: 140, c: [180, 170, 190], a: 0.25 }], 0.45);
      for (let y = 0; y < H; y++) pic.d.set(p.d.subarray(y * W * 4, (y + 1) * W * 4), ((y + y0) * pic.w + x0) * 4);
    };
    const fire = (x0: number, y0: number, strips: Strip[], burning: number): void => {
      const cam: Cam = { ox: 70, oy: 110 };
      const g = gatePic(W, H, cam, strips, null, 0);
      lit(g, [{ x: P(cam, 3.5, 0)[0], y: P(cam, 3.5, 0)[1] - 50, r: 150, c: burning > 0.5 ? rgb(EMBER[2]) : [180, 170, 190], a: burning > 0.5 ? 0.45 : 0.25 }], 0.5);
      for (let y = 0; y < H; y++) pic.d.set(g.d.subarray(y * W * 4, (y + 1) * W * 4), ((y + y0) * pic.w + x0) * 4);
    };
    fur(0, 0, 'lit');
    fur(W, 0, 'out');
    fire(0, H, STOKER_ROOM.fireWall(true, 'burning', 3), 1);
    fire(W, H, STOKER_ROOM.fireWall(true, 'going', 13), 0.2);
    save(pic.scaled(2), { file: 's9_furnace_fire.png', title: 'THE FURNACE, AND THE FIRE IN THE CHAINED ONE’S WAY', note: 'The furnace in its wall, lit and out. His gateway filled with fire while it burns, and the fire going out.', labels: [{ x: 10, y: 6, text: 'lit' }, { x: 2 * W + 10, y: 6, text: 'out' }, { x: 10, y: 2 * H + 6, text: 'the fire in his way' }, { x: 2 * W + 10, y: 2 * H + 6, text: 'going out' }] });
  }
  // 9. THE FORGE CRANK, AND THE GEAR AS AN ITEM
  {
    const pic = dark(600, 200);
    const states: ['missing' | 'set' | 'turning', number, string][] = [['missing', 0, 'its gear missing'], ['set', 0, 'the gear set in'], ['turning', 8, 'turned']];
    states.forEach(([st, f], i) => layS(pic, STOKER_ROOM.crank(st, f), 150 * i + 72, 172, 1));
    layS(pic, STOKER_ROOM.gearIcon(), 525, 70, 2);
    layS(pic, STOKER_ROOM.gearDropped(2), 525, 150, 2);
    save(pic.scaled(2), { file: 's10_crank_gear.png', title: 'THE FORGE CRANK, AND THE GEAR', note: 'Its middle gear missing; set in (the handle glows the player’s cyan, as floor 3’s levers do); turned. The gear as an item (a quest item, a plain white rim), and where it fell.', labels: [...states.map(([, , say], i) => ({ x: 2 * (150 * i + 6), y: 6, text: say })), { x: 2 * 456, y: 6, text: 'the item' }] });
  }
  fs.writeFileSync(path.join(out, 'sheet.json'), JSON.stringify({ pieces }));
  console.log('sheet', pieces.length, 'pieces');
}

// =============================================================================================
// HIS BODY, BEFORE AND NOW (his pick of 6 Nov 2026, “Reshape his body first (Recommended)”): the pieces of
// stoker_body.png, as big as the game paints him, each on its own dark picture with his floor point at the same place: him
// standing from in front, from behind and FROM THE SIDE (his solids truly turned about the floor point under him, not his
// picture flipped), and moments of his moves from in front. Painted once on the body as it was (before) and once as it is
// (now); tools/stoker_body_sheet.py puts the two side by side with their captions.

/** A point or a line of him turned `deg` to his left about the upright through his floor point. */
const turnV = (v: V3, deg: number): V3 => {
  const a = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
};
function turnShape(sh: Shape, deg: number): Shape {
  const T = (v: V3): V3 => turnV(v, deg);
  const R = (r: Ring): Ring => ({ c: T(r.c), u: T(r.u), v: T(r.v), ...(r.pts ? { pts: r.pts.map(T) } : {}) });
  switch (sh.k) {
    case 'rod': return { ...sh, a: T(sh.a), b: T(sh.b) };
    case 'ball': return { ...sh, c: T(sh.c), ax: [T(sh.ax[0]), T(sh.ax[1]), T(sh.ax[2])] };
    case 'cloth': return { ...sh, rings: sh.rings.map(R) };
    case 'band': return { ...sh, ring: R(sh.ring) };
    case 'panel': return { ...sh, c: T(sh.c), u: T(sh.u), v: T(sh.v) };
    case 'thread': return { ...sh, a: T(sh.a), b: T(sh.b) };
    case 'dot': return { ...sh, p: T(sh.p), facing: T(sh.facing) };
    case 'teeth': return { ...sh, pts: sh.pts.map(T), facing: sh.facing.map(T) };
    case 'mote': return { ...sh, p: T(sh.p) };
    case 'glow': return { ...sh, p: T(sh.p) };
    case 'greatsword': return { ...sh, grip: T(sh.grip), point: T(sh.point) };
  }
}
/** HIM TRULY TURNED `deg` to his left (45: his right side square to the eye, -135 his left), painted from in front, his pink edge round him. */
function stokerTurned(move: string, t: number, deg: number): Px {
  const st = stage('front', ST_CANVAS.ax, ST_CANVAS.ay, ST_CANVAS);
  const mv = move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move];
  const m = momentOf(MOB, mv as NonNullable<typeof mv>, t, move === 'attack' ? MOB.hit : mv?.blurAt);
  const bits = MOB.bits(st, m).map((b) => ({ ...b, shape: turnShape(b.shape, deg) }));
  paintBits(st, bits, turnV(m.s.pelvis, deg));
  const px = st.whole(ENEMY_RIM);
  for (const [p, c, size] of MOB.grains?.(st, m) ?? []) {
    const [x, y] = st.at(turnV(p, deg));
    const xi = Math.round(x - size / 2);
    const yi = Math.round(y - size / 2);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
  }
  return px;
}
/** The pieces: `stand_front`, `stand_back`, `stand_side` (his right side square to the eye, the shovel's: turned 45, the game's eye being 45 to his right), and each moment from in front. */
const BODY_MOMENTS: [string, number, string][] = [
  ['walk', 0.3, 'walking'],
  ['attack', 0.6, 'the coals: into his firebox'],
  ['attack', 1.6, 'the coals: held high'],
  ['rake', 0.7, 'the rake: held up'],
  ['burst', 1.0, 'the burst: held, roaring'],
  ['dying', 1.3, 'to his knees'],
];
function body(out: string): void {
  const W = 360;
  const H = 300;
  const FX = 180;
  const FY = 232;
  const one = (px: Px | null, painted: Painted | null, file: string): void => {
    const pic = new Pic(W, H);
    for (let i = 0; i < W * H; i++) pic.d.set([26, 24, 30, 255], i * 4);
    pic.shadow(FX, FY, MOB.shadow, 0.5);
    pic.lay(px ?? (painted as Painted).px, ST_CANVAS.ax, ST_CANVAS.ay, FX, FY, 1);
    fs.writeFileSync(path.join(out, file), pic.png());
  };
  one(null, stokerAt('stand', 0, 'front'), 'stand_front.png');
  one(null, stokerAt('stand', 0, 'back'), 'stand_back.png');
  one(stokerTurned('stand', 0, 45), null, 'stand_side.png');
  one(stokerTurned('stand', 0, -135), null, 'stand_side_left.png');
  BODY_MOMENTS.forEach(([move, t], i) => one(null, stokerAt(move, t, 'front'), `m${i}_${move}.png`));
  // (and the knight, for size, on the same picture)
  const k = new Pic(W, H);
  for (let i = 0; i < W * H; i++) k.d.set([26, 24, 30, 255], i * 4);
  laySprite(k, knightIdle('front'), FX, FY, 1);
  fs.writeFileSync(path.join(out, 'knight.png'), k.png());
  fs.writeFileSync(path.join(out, 'body.json'), JSON.stringify({ W, H, FX, FY, moments: BODY_MOMENTS }));
  console.log('body', out);
}

const [mode = 'look', out = 'shots/stoker', arg] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
if (mode === 'look') look(out, arg);
else if (mode === 'big') big(out, arg ?? 'stand:0');
else if (mode === 'sheet') sheet(out);
else if (mode === 'film') film(out, arg);
else if (mode === 'body') body(out);
else console.log('modes: look, big, sheet, film, body');
