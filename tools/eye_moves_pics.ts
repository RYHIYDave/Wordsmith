// THE SWAMP COLOSSUS'S MOVES, PART 1, AS PICTURES AND A FILM FOR THE OWNER (art/eye_moves.ts, art/eye_colossus.ts; a mock-up, not in
// the game). Painted here without a browser: each layer of him (his jaws, his spittle, his tongue and eye, each tentacle) painted once
// (art/eye_colossus.ts `paintColossus`, raw) and kept in shots/eye_moves/cache; then each frame laid together as the player sees it in
// the arena (the fen's own stone and black water, art/fen.ts by art/terrain.ts; the fen's pieces, art/floor10.ts; the Warrior at his
// spot, as the game paints him, art/heroes3.ts, breathing), with the water round him (its rings, its foam, splashes, the swell, the
// bubbles and slicks over him while he lurks, the water pouring off him as he rises, the ring slammed flat by his roar, the water
// bursting round his tentacles), the spray and goo he blasts out, the screen's rumble and shakes and darkening (art/eye_moves.ts
// EYE_SCREEN), and the lights.
//   npx tsx tools/eye_moves_pics.ts paint <i> <n> [move ...]   paint the layers (worker i of n), those of the moves named or all
//   npx tsx tools/eye_moves_pics.ts frames <out dir> <move> [from to]   the frames (PNG, the phone's screen, 1014 x 468)
//   (tools/eye_moves_sheet.py makes the sheet and the film from the frames.)
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeZlib from 'node:zlib';
// @ts-ignore
import nodePath from 'node:path';
// @ts-ignore
import nodeCrypto from 'node:crypto';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { fenLook } from '../src/art/fen';
import { fenPieces } from '../src/art/floor10';
import { paintTerrain, terrainOf } from '../src/art/terrain';
import type { Terrain } from '../src/art/terrain';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { CO_MELT, CO_SHEEN, CO_SLIME, CO_SPIT, CO_IRIS, EYE_UNDER, FALL_G, LEANED, STONE, meltLandings, meltSplashes, paintColossus } from '../src/art/eye_colossus';
import type { ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { EYE_ENTRANCE, EYE_FPS, EYE_LURK, EYE_STAND, entranceAt, eyeFrame } from '../src/art/eye_moves';
import type { EyeFrame, EyeLayer } from '../src/art/eye_moves';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { RIM_ALPHA } from '../src/art/kit';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const fs = nodeFs as { mkdirSync(p: string, o: { recursive: boolean }): void; writeFileSync(p: string, d: unknown): void; readFileSync(p: string): Uint8Array & { buffer: ArrayBuffer; byteOffset: number }; existsSync(p: string): boolean; renameSync(a: string, b: string): void };
const zlib = nodeZlib as { deflateSync(b: Uint8Array, o?: { level: number }): Uint8Array; inflateSync(b: Uint8Array): Uint8Array };
const path = nodePath as { join(...p: string[]): string };
declare const process: { argv: string[]; exit(n: number): void; stdout: { write(s: string): void }; pid: number; env: Record<string, string | undefined> };
// @ts-ignore
const Buf = Buffer as { alloc(n: number): Uint8Array & { writeUInt32BE(v: number, o: number): void }; concat(l: Uint8Array[]): Uint8Array; from(s: string, e?: string): Uint8Array };
const crypto = nodeCrypto as { createHash(a: string): { update(d: Uint8Array | string): { digest(e: string): string } } };

type RGB = readonly [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const TAU = Math.PI * 2;
const SEEN = 2 / Math.sqrt(3);
const R3 = Math.sqrt(3);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (a: number, b: number, v: number): number => {
  const u = clamp01((v - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const frac = (v: number): number => v - Math.floor(v);
function h3(x: number, y: number, z: number, s: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1440670441) + Math.imul(s | 0, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vn(x: number, y: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let fx = x - xi;
  let fy = y - yi;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = h3(xi, yi, 0, s) + (h3(xi + 1, yi, 0, s) - h3(xi, yi, 0, s)) * fx;
  const b = h3(xi, yi + 1, 0, s) + (h3(xi + 1, yi + 1, 0, s) - h3(xi, yi + 1, 0, s)) * fx;
  return a + (b - a) * fy;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const bayer = (x: number, y: number): number => BAYER[(y & 3) * 4 + (x & 3)];

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
  constructor(readonly w: number, readonly h: number, clear = true) {
    this.d = new Uint8ClampedArray(w * h * 4);
    if (clear) for (let i = 0; i < w * h; i++) this.d[i * 4 + 3] = 255;
  }
  over(x: number, y: number, r: number, g: number, b: number, a: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = (y * this.w + x) * 4;
    const k = a / 255;
    const ka = this.d[i + 3] / 255;
    // (over what is there; a picture with nothing on it yet takes the colour and the alpha)
    const out = k + ka * (1 - k);
    if (out <= 0) return;
    this.d[i] = (r * k + this.d[i] * ka * (1 - k)) / out;
    this.d[i + 1] = (g * k + this.d[i + 1] * ka * (1 - k)) / out;
    this.d[i + 2] = (b * k + this.d[i + 2] * ka * (1 - k)) / out;
    this.d[i + 3] = out * 255;
  }
  lay(p: { w: number; h: number; d: Uint8ClampedArray }, px0: number, py0: number, x: number, y: number): void {
    for (let j = 0; j < p.h; j++) {
      for (let i = 0; i < p.w; i++) {
        const s = (j * p.w + i) * 4;
        const a = p.d[s + 3];
        if (!a) continue;
        this.over(Math.round(x + i - px0), Math.round(y + j - py0), p.d[s], p.d[s + 1], p.d[s + 2], a);
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
  light(x: number, y: number, r: number, c: RGB, a: number): void {
    for (let j = Math.floor(y - r); j <= y + r; j++) {
      for (let i = Math.floor(x - r); i <= x + r; i++) {
        const d = Math.hypot(i + 0.5 - x, j + 0.5 - y) / r;
        if (d < 1) this.over(i, j, c[0], c[1], c[2], 255 * a * (1 - d) * (1 - d));
      }
    }
  }
  copy(): Pic {
    const o = new Pic(this.w, this.h, false);
    o.d.set(this.d);
    return o;
  }
  crop(x0: number, y0: number, w: number, h: number): Pic {
    const o = new Pic(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const sx = x + x0;
      const sy = y + y0;
      if (sx < 0 || sy < 0 || sx >= this.w || sy >= this.h) continue;
      const s = (sy * this.w + sx) * 4;
      o.d.set(this.d.subarray(s, s + 4), (y * w + x) * 4);
    }
    return o;
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
    return Buf.concat([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 4 })), chunk('IEND', new Uint8Array(0))]);
  }
}
const imgOf = (s: Sprite): Px => s.img as unknown as Px;
function laySprite(pic: Pic, s: Sprite, x: number, y: number): void {
  const d = s.density ?? 1;
  pic.lay(imgOf(s), s.ax * d, s.ay * d, Math.round(x), Math.round(y));
}

// =============================================================================================
// THE ARENA (as tools/eye_redo_pics.ts has it): the fen's old paving, a big rectangle; the black water across the top, where he lies

const C: [number, number] = [30, 30];
const UC = C[0] - C[1];
const VC = C[0] + C[1];
const ARENA = { half: (STONE.across * Math.SQRT2) / 2, quay: (STONE.edge * 0.5773502691896258) / 16, deep: STONE.deep * Math.SQRT2 } as const;
const onStone = (x: number, y: number): boolean => Math.abs(x - y - UC) <= ARENA.half && x + y - VC >= ARENA.quay && x + y - VC <= ARENA.quay + ARENA.deep;
const poolD = (x: number, y: number): number => (x + y - VC >= ARENA.quay ? 9 : 0.5);
function layTiles(shape: (x: number, y: number) => boolean, w: number, h: number): Floor {
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  const options: [number, (u: number, v: number) => boolean][] = [
    [-1, () => false],
    [0, () => true],
    [CUT_RIGHT, (u, v) => v > u],
    [CUT_LEFT, (u, v) => u > v],
    [CUT_NEAR, (u, v) => u + v < 1],
    [CUT_FAR, (u, v) => u + v > 1],
  ];
  const N = 6;
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      let best = 0;
      let least = Infinity;
      options.forEach(([, inside], k) => {
        let wrong = 0;
        for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) if (inside((a + 0.5) / N, (b + 0.5) / N) !== shape(tx + (a + 0.5) / N, ty + (b + 0.5) / N)) wrong++;
        if (wrong < least - 0.5) {
          least = wrong;
          best = k;
        }
      });
      const c = options[best][0];
      if (c >= 0) {
        tiles[ty * w + tx] = T_FLOOR;
        cut[ty * w + tx] = c;
      }
    }
  }
  return { depth: 10, seed: 10, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}
let TERRAIN: Terrain | null = null;
const terrain = (): Terrain => (TERRAIN ??= terrainOf(layTiles(onStone, 64, 64), fenLook({ paved: onStone, pool: poolD, sick: () => 0.35 })));
interface Cam { ox: number; oy: number }
const P = (cam: Cam, x: number, y: number): [number, number] => [cam.ox + (x - y) * 32, cam.oy + (x + y) * 16];
const camAt = (sx: number, sy: number): Cam => ({ ox: sx - UC * 32, oy: sy - VC * 16 });
const W = (du: number, dv: number): [number, number] => [(UC + du + VC + dv) / 2, (VC + dv - UC - du) / 2];
function groundPic(w: number, h: number, cam: Cam): Pic {
  const pic = new Pic(w, h);
  const T = terrain();
  const PIECE = 256;
  for (let py = 0; py < h; py += PIECE) {
    for (let px = 0; px < w; px += PIECE) {
      const pw = Math.min(PIECE, w - px);
      const ph = Math.min(PIECE, h - py);
      const p = paintTerrain(T, px - cam.ox, py - cam.oy, pw, ph);
      for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
        const s = (y * pw + x) * 4;
        const i = ((py + y) * w + px + x) * 4;
        pic.d[i] = p.rgba[s];
        pic.d[i + 1] = p.rgba[s + 1];
        pic.d[i + 2] = p.rgba[s + 2];
        pic.d[i + 3] = 255;
      }
    }
  }
  return pic;
}
const PIECES = fenPieces();
const piece = (name: string, f = 0): Sprite => {
  const p = PIECES.find((q) => q.name === name);
  if (!p) throw new Error(name);
  const fr = p.frames ?? [];
  return fr[f % fr.length];
};
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

// =============================================================================================
// THE PHONE'S SCREEN: 507 x 234 game pixels, two picture pixels to each; a margin round it for the shakes

const SW = LEANED.w * 2;
const SH = LEANED.h * 2;
const M = 16;
const CW = SW + 2 * M;
const CH = SH + 2 * M;
/** His middle at the water on the canvas (the camera leaned toward him, as the stills have it). */
const HX = SW / 2 + M;
const HY = LEANED.waterAt * 2 + M;
const CAM = camAt(HX, HY);
const HERO_AT: [number, number] = [-1.5, ARENA.quay + 1.4];
/** A point of his space on the canvas. */
const onCanvas = (x: number, y: number, z: number): [number, number] => [HX + x * SEEN, HY + y / R3 - z];
/** The water under a canvas pixel, in his space. */
const waterAt = (i: number, j: number): [number, number] => [(i + 0.5 - HX) / SEEN, (j + 0.5 - HY) * R3];

interface Scenery { back: Pic; front: Pic; water: Uint8Array }
let SCENERY: Scenery | null = null;
function scenery(): Scenery {
  if (SCENERY) return SCENERY;
  const back = groundPic(CW, CH, CAM);
  const front = new Pic(CW, CH, false);
  const put = (name: string, du: number, dv: number, f = 0, sh = 0): void => {
    const [x, y] = W(du, dv);
    const pic = x + y < VC ? back : front;
    const [sx, sy] = P(CAM, x, y);
    if (sh) pic.shadow(sx, sy, sh, 0.4);
    laySprite(pic, piece(name, f), sx, sy);
  };
  put('a broken column', -ARENA.half + 1.2, ARENA.quay + 0.9, 0, 18);
  put('a broken column', ARENA.half - 1.2, ARENA.quay + 0.9, 0, 18);
  put('cattails', -ARENA.half - 1.5, ARENA.quay + 1.5, 0);
  put('cattails', ARENA.half + 1.8, ARENA.quay + 2.5, 1);
  put('cattails', -ARENA.half - 2.6, ARENA.quay + 6, 1);
  put('sedge tussock', ARENA.half + 2.6, ARENA.quay + 7, 0);
  put('mossy stones', -8, ARENA.quay + 9.5, 0);
  put('fallen column drums', 9, ARENA.quay + 11, 0, 22);
  put('mossy stones', 4, ARENA.quay + 1.4, 0);
  put('lily pads', -12, ARENA.quay - 1.5, 0);
  put('lily pads', 13, ARENA.quay - 2.2, 0);
  // (the water: everything that is not the stone)
  const water = new Uint8Array(CW * CH);
  for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) {
    const X = i + 0.5 - CAM.ox;
    const Y = j + 0.5 - CAM.oy;
    water[j * CW + i] = onStone((X / 32 + Y / 16) / 2, (Y / 16 - X / 32) / 2) ? 0 : 1;
  }
  SCENERY = { back, front, water };
  return SCENERY;
}

// =============================================================================================
// HIS LAYERS, EACH PAINTED ONCE

/** Each layer painted on this frame: wide enough for all of him and his arms, deep enough for him lying low (in his picture's pixels). */
const LAYER = { w: 1100, h: 520, ax: 550, ay: 300, raw: true } as const;
// (kept on the machine's memory disk, packed: only what of him there is, in the box round it)
const CACHE = process.env.EYE_CACHE || '/dev/shm/eye_moves/cache';
fs.mkdirSync(CACHE, { recursive: true });
// (what paints him: art/eye_colossus.ts up to its checks, which paint nothing)
const SRC = ((): string => {
  const all = new TextDecoder().decode(fs.readFileSync('src/art/eye_colossus.ts'));
  const cut = all.indexOf('// HIS ARMS CLEAR OF HIM AND OF THE STONE; HIS PARTS');
  return crypto.createHash('sha1').update(cut > 0 ? all.slice(0, cut) : all).digest('hex');
})();
const fileOf = (L: EyeLayer): string => path.join(CACHE, `${L.key.replace(/[^A-Za-z0-9.]/g, '_')}_${crypto.createHash('sha1').update(SRC + JSON.stringify(L.pose) + JSON.stringify(LAYER)).digest('hex').slice(0, 14)}.bin`);
/** A layer: the box round what of him there is (x0, y0, w, h, on his picture), and in it each pixel's kind, colour, nearness, height
 *  over the water, fire, outline and material; his lights. */
interface Layer { x0: number; y0: number; w: number; h: number; px: Uint8Array; kind: Uint8Array; mat: Uint8Array; near: Float32Array; zh: Float32Array; fire: Uint8Array; seam: Uint8Array; lights: ColossusPicture['lights'] }
function save(file: string, c: ColossusPicture): void {
  const W0: number = LAYER.w;
  let x0: number = W0;
  let y0: number = LAYER.h;
  let x1 = -1;
  let y1 = -1;
  for (let j = 0; j < LAYER.h; j++) for (let i = 0; i < W0; i++) {
    const kd = c.kind[j * W0 + i];
    if (kd !== 1 && kd !== 4) continue;
    if (i < x0) x0 = i;
    if (i > x1) x1 = i;
    if (j < y0) y0 = j;
    if (j > y1) y1 = j;
  }
  if (x1 < 0) {
    x0 = 0;
    y0 = 0;
    x1 = 0;
    y1 = 0;
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const kind = new Uint8Array(w * h);
  const rest: number[] = [];
  const nearI = new Int16Array(w * h);
  const zhI = new Int16Array(w * h);
  let m = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const s = (j + y0) * W0 + i + x0;
    const kd = c.kind[s];
    if (kd !== 1 && kd !== 4) continue;
    kind[j * w + i] = kd;
    rest.push(c.px.d[s * 4], c.px.d[s * 4 + 1], c.px.d[s * 4 + 2], (c.fire as Uint8Array)[s] | ((c.seam as Uint8Array)[s] << 1), c.mat[s]);
    nearI[m] = Math.max(-32767, Math.min(32767, Math.round(c.near[s] * 8)));
    zhI[m] = Math.max(-32767, Math.min(32767, Math.round((c.zh as Float32Array)[s] * 8)));
    m++;
  }
  const meta = new TextEncoder().encode(JSON.stringify({ lights: c.lights, x0, y0, w, h, m }));
  const body = new Uint8Array(w * h + rest.length + m * 4);
  body.set(kind, 0);
  body.set(Uint8Array.from(rest), w * h);
  body.set(new Uint8Array(nearI.buffer, 0, m * 2), w * h + rest.length);
  body.set(new Uint8Array(zhI.buffer, 0, m * 2), w * h + rest.length + m * 2);
  const packed = zlib.deflateSync(body, { level: 6 });
  const all = new Uint8Array(4 + meta.length + packed.length);
  new DataView(all.buffer).setUint32(0, meta.length, true);
  all.set(meta, 4);
  all.set(packed, 4 + meta.length);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, all);
  fs.renameSync(tmp, file);
}
function load(file: string): Layer {
  const b = fs.readFileSync(file);
  const u8 = new Uint8Array(b.buffer, b.byteOffset, b.length);
  const hl = new DataView(u8.buffer, u8.byteOffset).getUint32(0, true);
  const meta = JSON.parse(new TextDecoder().decode(u8.subarray(4, 4 + hl))) as { lights: ColossusPicture['lights']; x0: number; y0: number; w: number; h: number; m: number };
  const body = new Uint8Array(zlib.inflateSync(u8.subarray(4 + hl)));
  const { x0, y0, w, h, m } = meta;
  const n = w * h;
  const kind = body.slice(0, n);
  const px = new Uint8Array(n * 3);
  const mat = new Uint8Array(n);
  const fire = new Uint8Array(n);
  const seam = new Uint8Array(n);
  const near = new Float32Array(n);
  const zh = new Float32Array(n);
  const nearI = new Int16Array(body.slice(n + m * 5, n + m * 5 + m * 2).buffer);
  const zhI = new Int16Array(body.slice(n + m * 7, n + m * 7 + m * 2).buffer);
  let q = 0;
  for (let k = 0; k < n; k++) {
    if (!kind[k]) continue;
    const o = n + q * 5;
    px[k * 3] = body[o];
    px[k * 3 + 1] = body[o + 1];
    px[k * 3 + 2] = body[o + 2];
    fire[k] = body[o + 3] & 1;
    seam[k] = (body[o + 3] >> 1) & 1;
    mat[k] = body[o + 4];
    near[k] = nearI[q] / 8;
    zh[k] = zhI[q] / 8;
    q++;
  }
  return { x0, y0, w, h, px, kind, mat, near, zh, fire, seam, lights: meta.lights };
}
const MEMO = new Map<string, Layer>();
function layer(L: EyeLayer): Layer {
  const file = fileOf(L);
  let r = MEMO.get(file);
  if (r) return r;
  if (!fs.existsSync(file)) {
    const t0 = Date.now();
    save(file, paintColossus(L.pose as ColossusPose, LAYER));
    process.stdout.write(`  painted ${L.key} in ${((Date.now() - t0) / 1000).toFixed(1)} s\n`);
  }
  r = load(file);
  if (MEMO.size > 40) MEMO.clear();
  MEMO.set(file, r);
  return r;
}

// =============================================================================================
// THE FRAMES OF EACH MOVE

const MOVES = { lurk: EYE_LURK.frames, entrance: EYE_ENTRANCE.frames, stand: EYE_STAND.frames } as const;
type Move = keyof typeof MOVES;
function layersOf(F: EyeFrame): EyeLayer[] {
  return [F.jaws, F.spit, F.tongue, ...F.arms, ...F.smear].filter((L): L is EyeLayer => !!L);
}

// =============================================================================================
// THE WATER AND THE AIR ROUND HIM

const WATER: RGB = hex('#0e1612');
const FOAM: RGB[] = ['#1c2a22', '#2b3d32', '#3e5244', '#5a6e5c', '#7a8c76'].map(hex);
const SPRAY: RGB = hex('#a8b8a2');
const SCUM: RGB = hex('#4a4a2a');
const RIM: RGB = hex(ENEMY_RIM);
const FIRE3: RGB = hex(FLAME[3]);
const FIRE2: RGB = hex(FLAME[2]);
const MELT = CO_MELT as unknown as RGB[];
const SPIT = CO_SPIT as unknown as RGB[];
const SLIME = CO_SLIME as unknown as RGB[];
const IRIS = CO_IRIS as unknown as RGB[];
const SHEEN = CO_SHEEN as unknown as RGB;

/** The exact distance (his lengths, on the water) from each pixel to the nearest seed: a pixel across is 1/SEEN of his lengths, one
 *  down R3 of them (the water seen from above at 30 degrees). */
function distanceOnWater(seed: Uint8Array, w: number, h: number): Float32Array {
  const INF = 1e12;
  const g = new Float64Array(w * h);
  for (let k = 0; k < w * h; k++) g[k] = seed[k] ? 0 : INF;
  const pass = (n: number, s: number, get: (q: number) => number, set: (q: number, v: number) => void): void => {
    const f = new Float64Array(n);
    for (let q = 0; q < n; q++) f[q] = get(q);
    const v = new Int32Array(n);
    const z = new Float64Array(n + 1);
    let k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (let q = 1; q < n; q++) {
      let sx = ((f[q] + (q * s) ** 2) - (f[v[k]] + (v[k] * s) ** 2)) / (2 * s * s * (q - v[k]));
      while (sx <= z[k]) {
        k--;
        sx = ((f[q] + (q * s) ** 2) - (f[v[k]] + (v[k] * s) ** 2)) / (2 * s * s * (q - v[k]));
      }
      k++;
      v[k] = q;
      z[k] = sx;
      z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      set(q, ((q - v[k]) * s) ** 2 + f[v[k]]);
    }
  };
  for (let i = 0; i < w; i++) pass(h, R3, (q) => g[q * w + i], (q, val) => (g[q * w + i] = val));
  for (let j = 0; j < h; j++) pass(w, 1 / SEEN, (q) => g[j * w + q], (q, val) => (g[j * w + q] = val));
  const out = new Float32Array(w * h);
  for (let k = 0; k < w * h; k++) out[k] = Math.sqrt(g[k]);
  return out;
}

/** A thing flying through the air (spray, goo, droplets), its path from where and when it was thrown. */
interface Flyer { x: number; y: number; z: number; vx: number; vy: number; vz: number; t0: number; kind: 0 | 1 | 2; size: number }
/** Where a flyer is `s` seconds after it was thrown (and whether it has met the water). */
function flyAt(f: Flyer, s: number): [number, number, number] {
  return [f.x + f.vx * s, f.y + f.vy * s, f.z + f.vz * s - 0.5 * FALL_G * s * s];
}
function landOf(f: Flyer): number {
  // (z + vz s - g s^2 / 2 = 0)
  const a = 0.5 * FALL_G;
  return (f.vz + Math.sqrt(f.vz * f.vz + 4 * a * f.z)) / (2 * a);
}
/** THE ROAR'S BLAST: spray and goo out of his maw, forward and out, arcing down into the water. */
function roarFlyers(): Flyer[] {
  const out: Flyer[] = [];
  for (let n = 0; n < 280; n++) {
    // (out of his maw toward you and out to both sides, up and arcing down: spray in a burst, goo in gobs and strings)
    const a = (h3(n, 1, 0, 400) - 0.5) * 2.0;
    const up = 0.25 + 0.7 * h3(n, 2, 0, 401);
    const sp = 260 + 460 * h3(n, 3, 0, 402);
    const kind = (h3(n, 4, 0, 403) < 0.35 ? 1 : 0) as 0 | 1;
    out.push({
      x: (h3(n, 5, 0, 404) - 0.5) * 70, y: 10 + 60 * h3(n, 6, 0, 405), z: 30 + 80 * h3(n, 7, 0, 406),
      vx: Math.sin(a) * sp * (1 - up * 0.45), vy: Math.cos(a) * sp * 0.85 * (1 - up * 0.45), vz: sp * up,
      t0: (h3(n, 8, 0, 407) * 6) / EYE_FPS, kind, size: kind ? 2 + Math.floor(h3(n, 9, 0, 408) * 2.2) : 1 + (h3(n, 9, 0, 408) < 0.35 ? 1 : 0),
    });
  }
  return out;
}
/** A TENTACLE'S BURST: the crown of water thrown up round it, droplets arcing out and back. */
function burstFlyers(x: number, y: number, seed: number): Flyer[] {
  const out: Flyer[] = [];
  for (let n = 0; n < 160; n++) {
    // (a crown: a wall of water thrown nearly straight up all round it, breaking into drops; and drops flung further out)
    const a = h3(n, seed, 1, 410) * TAU;
    const crown = n < 100;
    const r = crown ? 34 + 10 * h3(n, seed, 2, 411) : 26 + 22 * h3(n, seed, 2, 411);
    const sp = crown ? 40 + 60 * h3(n, seed, 3, 412) : 120 + 260 * h3(n, seed, 3, 412);
    const vz = crown ? 280 + 120 * h3(n, seed, 4, 413) : 220 + 300 * h3(n, seed, 4, 413);
    out.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.8, z: 2, vx: Math.cos(a) * sp * 0.5, vy: Math.sin(a) * sp * 0.4, vz, t0: ((crown ? 1 : 3) * h3(n, seed, 5, 414)) / EYE_FPS, kind: 2, size: 1 + (h3(n, seed, 6, 415) < 0.25 ? 1 : 0) });
  }
  return out;
}
const ROAR = roarFlyers();

// =============================================================================================
// A FRAME LAID TOGETHER

interface Top { col: Float32Array; near: Float32Array; z: Float32Array; fire: Uint8Array; seam: Uint8Array; kind: Uint8Array; mat: Uint8Array; who: Int8Array; jp: Int16Array }
/** Each layer where he is now, nearest wins; the smeared after-images behind. */
function merge(F: EyeFrame): { top: Top; lights: Array<{ x: number; y: number; r: number; c: RGB; a: number; fire: boolean }>; ghost: Float32Array } {
  const n = CW * CH;
  const top: Top = { col: new Float32Array(n * 3), near: new Float32Array(n).fill(-Infinity), z: new Float32Array(n), fire: new Uint8Array(n), seam: new Uint8Array(n), kind: new Uint8Array(n), mat: new Uint8Array(n), who: new Int8Array(n).fill(-1), jp: new Int16Array(n) };
  const lights: Array<{ x: number; y: number; r: number; c: RGB; a: number; fire: boolean }> = [];
  const ghost = new Float32Array(n * 4);
  const lay = (L: EyeLayer, who: number, smear = false): void => {
    const p = layer(L);
    const dj = Math.round(L.drop - L.back / R3);
    const dz = -L.drop;
    const dn = -L.back * 0.8660254 - L.drop * 0.5;
    const ox = HX - LAYER.ax;
    const oy = HY - LAYER.ay + dj;
    for (let jb = 0; jb < p.h; jb++) {
      const j = jb + p.y0;
      const cj = j + oy;
      if (cj < 0 || cj >= CH) continue;
      for (let ib = 0; ib < p.w; ib++) {
        const ci = ib + p.x0 + ox;
        if (ci < 0 || ci >= CW) continue;
        const s = jb * p.w + ib;
        const kd = p.kind[s];
        if (kd !== 1 && kd !== 4) continue;
        const k = cj * CW + ci;
        const nr = p.near[s] + dn;
        if (smear) {
          if (nr > top.near[k] || top.who[k] < 0) {
            ghost[k * 4] = p.px[s * 3];
            ghost[k * 4 + 1] = p.px[s * 3 + 1];
            ghost[k * 4 + 2] = p.px[s * 3 + 2];
            ghost[k * 4 + 3] = 1;
          }
          continue;
        }
        if (nr <= top.near[k]) continue;
        top.near[k] = nr;
        top.col[k * 3] = p.px[s * 3];
        top.col[k * 3 + 1] = p.px[s * 3 + 1];
        top.col[k * 3 + 2] = p.px[s * 3 + 2];
        top.z[k] = p.zh[s] + dz;
        top.fire[k] = p.fire[s];
        top.seam[k] = p.seam[s];
        top.kind[k] = kd;
        top.mat[k] = p.mat[s];
        top.who[k] = who;
        top.jp[k] = j;
      }
    }
    if (!smear) for (const l of p.lights) lights.push({ x: l.x + ox, y: l.y + oy, r: l.r, c: hex(l.color), a: l.a ?? 0.5, fire: true });
  };
  lay(F.jaws, 0);
  if (F.spit) lay(F.spit, 1);
  if (F.tongue) lay(F.tongue, 2);
  F.arms.forEach((L, i) => L && lay(L, 3 + i));
  F.smear.forEach((L) => L && lay(L, 9, true));
  return { top, lights, ghost };
}

/** THE FRAME: the phone's screen (SW x SH picture pixels), thrown by the shake. `tf` the film's own clock (for the hero's breath). */
function frameOf(F: EyeFrame, tf: number): Pic {
  const S = scenery();
  const pic = S.back.copy();
  const D = pic.d;
  const { top, lights, ghost } = merge(F);
  const n = CW * CH;
  const t = F.t;
  const k = F.k;
  const ent = F.move === 'entrance';
  const Wt = F.water;
  // (where he breaks the water: the seeds of its rings and its foam; and where he is over it)
  const seed = new Uint8Array(n);
  let seeds = 0;
  for (let q = 0; q < n; q++) {
    if (top.who[q] < 0 || top.kind[q] === 0) continue;
    if (Math.abs(top.z[q]) < 1.8) {
      seed[q] = 1;
      seeds++;
    }
  }
  const wd = seeds ? distanceOnWater(seed, CW, CH) : new Float32Array(n).fill(1e9);
  // (his rise: how far down he was at each frame, for when each part of him came up out of the water)
  const rose = ent && F.k >= EYE_ENTRANCE.rise[0];
  const emerged = (zp: number): number => {
    // (the first frame his painted height zp was out of the water)
    for (let q = EYE_ENTRANCE.rise[0]; q <= EYE_ENTRANCE.rise[1] + 2; q++) if (entranceAt(q).drop <= zp) return q;
    return 1e9;
  };
  const EMERGE = new Map<number, number>();
  const emergedQ = (zp: number): number => {
    const key = Math.round(zp);
    let v = EMERGE.get(key);
    if (v === undefined) {
      v = emerged(key);
      EMERGE.set(key, v);
    }
    return v;
  };
  const sunk = Wt.sunk;
  const ringsK = rose ? sm(EYE_ENTRANCE.rise[1] - 12, EYE_ENTRANCE.rise[1] + 18, k) : 1;
  // (lurking, the dark shape of him seen further down)
  const keepDen = 15 + 37 * sunk;
  const seenDeep = 70 + 95 * sunk;
  // (the roar's ring, slammed out over the water: how far it has gone)
  const roarS = Wt.roar !== null && ent ? (k - Wt.roar) / EYE_FPS : -1;
  const ringR = roarS >= 0 ? 40 + 330 * roarS : -1;
  // THE WATER AND WHAT IS SEEN UNDER IT
  for (let j = 0; j < CH; j++) {
    for (let i = 0; i < CW; i++) {
      const q = j * CW + i;
      if (!S.water[q]) continue;
      const [X, Y] = waterAt(i, j);
      const under = top.who[q] >= 0 && top.z[q] < -0.5;
      if (under) {
        // (him under the water: darker and greener the deeper; only fire seen deep down)
        const deep = -top.z[q];
        const fire = top.fire[q];
        const keep = fire ? Math.exp(-deep / 220) : Math.exp(-deep / keepDen);
        const vis = fire ? Math.min(1, Math.exp(-deep / 280) * 1.5) * Wt.pulse : Math.max(0, 1 - deep / seenDeep);
        const qd = Math.max(0, Math.min(4, Math.floor(vis * 4 + bayer(i, j) + 0.5)));
        if (qd > 0) {
          const a = [0, 80, 140, 200, 240][qd];
          pic.over(i, j, WATER[0] + (top.col[q * 3] - WATER[0]) * keep, WATER[1] + (top.col[q * 3 + 1] - WATER[1]) * keep, WATER[2] + (top.col[q * 3 + 2] - WATER[2]) * keep, a);
        }
      }
      if (top.who[q] >= 0 && !under) continue;
      // (the water's face: its marks over what is under it)
      const w = wd[q];
      const sh = h3(i, j, 5, 0);
      let c: RGB | null = null;
      let a = 255;
      // the roar's ring: the water slammed flat inside it, a wall of foam at its edge
      const flat = ringR > 0 && w < ringR - 6 ? 1 - sm(0.6, 1.4, roarS) : 0;
      const crest = ringR > 0 && roarS < 1.2 ? Math.abs(w - ringR) / (3 + 6 * roarS) : 9;
      if (crest < 1 && vn(X * 0.05, Y * 0.05 + roarS * 3, 31) > 0.2 + roarS * 0.35) {
        // (the wave it pushes out: its crest a line of foam, brightest at its leading edge, broken; the dark trough behind it)
        const lead = (w - ringR) / (3 + 6 * roarS);
        c = lead > 0.35 ? (sh < 0.55 ? SPRAY : FOAM[4]) : lead > -0.3 ? (sh < 0.4 ? FOAM[4] : FOAM[3]) : WATER;
        a = lead > -0.3 ? Math.round(255 * (1 - sm(0.7, 1.2, roarS))) : 200;
      } else if (w < 3.4 + 3.4 * vn(X * 0.06 + t * 1.3, Y * 0.06, 8) && seeds) {
        // foam where he breaks it, churning, bubbles in it
        const bb = vn(X * 0.4 + t * 2, Y * 0.4, 9);
        c = bb > 0.78 ? FOAM[1] : bb > 0.7 ? FOAM[4] : sh < 0.5 ? FOAM[4] : sh < 0.8 ? FOAM[3] : FOAM[1];
      } else if (w < 12 && sh < 0.08 && seeds) c = SCUM;
      else if (!flat && seeds) {
        // his rings spreading out from him, further apart further out, each one broken
        for (let r = 0; r < 6; r++) {
          const u = frac(t / 1.5 + r / 6);
          const R = 7 + 86 * u ** 1.35;
          if (Math.abs(w - R) < 0.6 && vn(X * 0.045 + r * 3.1, Y * 0.02, 6 + r) > 0.4 - 0.25 * (1 - u)) {
            const pinkK = Math.max(0, 1 - Math.abs(X) / 240) * (u < 0.5 ? 1 : 0);
            c = pinkK > 0.35 && h3(i, j, 7, 0) < pinkK * 0.5 ? IRIS[u < 0.25 ? 1 : 0] : u < 0.3 ? FOAM[3] : FOAM[2];
            // (while he rises, the swells rolling off him instead; his rings come back as he stands)
            a = Math.round(255 * (1 - sm(0.6, 1, u)) * sm(0, 0.08, u) * ringsK);
            break;
          }
        }
      }
      // (rings off him as he rises: a swell rolling off him, again and again, weaker each time)
      if (!c && rose && seeds && k < EYE_ENTRANCE.rise[1] + 20) {
        for (let r = 0; r < 4; r++) {
          const s0 = EYE_ENTRANCE.breaks + r * 14;
          const s = (k - s0) / EYE_FPS;
          if (s < 0 || s > 1.4) continue;
          const R = 10 + 150 * s;
          if (Math.abs(w - R) < 2.2 + 2 * s && vn(X * 0.04 + r, Y * 0.03, 40 + r) > 0.35 + 0.4 * s) {
            c = s < 0.4 ? FOAM[4] : FOAM[3];
            a = Math.round(255 * (1 - s / 1.4));
          }
        }
      }
      if (!c && seeds && w < 46) {
        c = WATER;
        a = 70;
      }
      if (c) pic.over(i, j, c[0], c[1], c[2], a);
      // the swell (rolling slowly over him while he lurks; heaving as he stirs)
      if (Wt.swell > 0.05) {
        const s1 = Math.sin(X * 0.011 + Y * 0.017 - (TAU * t) / 3);
        const s2 = Math.sin(X * -0.017 + Y * 0.009 - (TAU * 2 * t) / 3 + 1.3);
        const v = s1 * 0.6 + s2 * 0.4;
        // (only along the top of each swell, a thin broken line catching the light)
        const band = 0.035 * Math.min(1.6, Wt.swell);
        if (Math.abs(v - 0.9) < band && vn(X * 0.09, Y * 0.05, 77) > 0.45 && vn(X * 0.4, Y * 0.2, 78) > 0.35) pic.over(i, j, FOAM[2][0], FOAM[2][1], FOAM[2][2], 150);
      }
      if (flat > 0 && w < ringR - 6) {
        // (inside the ring the water lies flat and black, its rings knocked out of it; streaks of foam drawn out from him)
        pic.over(i, j, WATER[0], WATER[1], WATER[2], 150 * flat);
        const ang = Math.atan2(Y, X);
        if (vn(ang * 26, w * 0.02 - roarS * 4, 33) > 0.82 && vn(X * 0.3, Y * 0.3, 34) > 0.4) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 170 * flat);
      }
    }
  }
  // SLICKS OF HIS GOO RISING (while he lurks): patches spreading over the black water, a sheen at their far edge
  if (Wt.slicks > 0.02) {
    for (let s = 0; s < 7; s++) {
      const p = frac(t / 3 + s / 7);
      const cx = (h3(s, 1, 0, 500) - 0.5) * 520;
      const cy = 40 + 220 * h3(s, 2, 0, 501);
      const R = (14 + 26 * h3(s, 3, 0, 502)) * sm(0, 0.5, p) * Wt.slicks;
      const fade = 1 - sm(0.65, 1, p);
      if (R < 2) continue;
      const [ci, cj] = onCanvas(cx, cy, 0);
      for (let j = Math.floor(cj - R / R3 - 3); j <= cj + R / R3 + 3; j++) {
        for (let i = Math.floor(ci - R * SEEN - 3); i <= ci + R * SEEN + 3; i++) {
          if (i < 0 || j < 0 || i >= CW || j >= CH || !S.water[j * CW + i] || (top.who[j * CW + i] >= 0 && top.z[j * CW + i] > -0.5)) continue;
          const [X, Y] = waterAt(i, j);
          const d = Math.hypot(X - cx, Y - cy) / R;
          const edge = 1 + (vn(X * 0.08 + s, Y * 0.08, 503) - 0.5) * 0.7;
          if (d > edge) continue;
          // (dull goo on the black water, thicker in its middle; the light caught along its far edge and in long streaks across it)
          const rim = d > edge - 0.1 && Y < cy - R * 0.25 && vn(X * 0.3, Y * 0.3, 505) > 0.35;
          const streak = Math.abs(vn(X * 0.02 + Y * 0.035, s * 3.7, 506) - 0.5) < 0.025 && d < edge - 0.15;
          if (rim || streak) pic.over(i, j, SHEEN[0], SHEEN[1], SHEEN[2], (rim ? 150 : 90) * fade);
          else if (bayer(i, j) < 0.45 - 0.5 * d) {
            const col = vn(X * 0.15, Y * 0.15, 504) > 0.6 ? MELT[1] : SLIME[1];
            pic.over(i, j, col[0], col[1], col[2], 120 * fade);
          }
        }
      }
    }
  }
  // BUBBLES rising and breaking over him (and, as he stirs, boiling)
  const nb = Math.round(10 + 60 * Wt.boil);
  if (Wt.bubbles > 0.02) {
    for (let b = 0; b < nb; b++) {
      if (b >= 10 && h3(b, 0, 0, 520) > Wt.boil) continue;
      if (b < 10 && h3(b, 0, 0, 521) > Wt.bubbles + 0.4) continue;
      const per = [1, 1.5, 3][Math.floor(h3(b, 1, 0, 522) * 3)];
      const p = frac(t / per + h3(b, 2, 0, 523));
      const spread = b < 10 ? 130 : 260;
      const cx = (EYE_UNDER[0] + (h3(b, 3, 0, 524) - 0.5) * spread * 2) * 1;
      const cy = (b < 10 ? 140 : 40) + (h3(b, 4, 0, 525) - 0.2) * spread;
      const rr = 1.5 + 3.5 * h3(b, 5, 0, 526) + (b >= 10 ? 2 : 0);
      const [ci, cj] = onCanvas(cx - (ent ? 0 : 0), cy - (F.jaws.back - 330) * 0, 0);
      const ii = Math.round(ci);
      const jj = Math.round(cj);
      if (ii < 4 || jj < 4 || ii >= CW - 4 || jj >= CH - 4 || !S.water[jj * CW + ii]) continue;
      if (top.who[jj * CW + ii] >= 0 && top.z[jj * CW + ii] > -0.5) continue;
      if (p < 0.7) {
        // (a dome of a bubble swelling: dark film, its rim lit on the upper left, a glint)
        const r = Math.max(1, Math.round(rr * sm(0, 0.6, p)));
        // (a clear dome: only its skin seen, lit along its upper left, faint round its lower right; a glint)
        for (let dj = -r; dj <= 0; dj++) for (let di = -r; di <= r; di++) {
          const d = Math.hypot(di, dj * 1.6);
          if (d > r + 0.3 || d < r - 0.9) continue;
          const lit2 = di - dj * 0.6 < 0;
          pic.over(ii + di, jj + dj, (lit2 ? FOAM[4] : FOAM[2])[0], (lit2 ? FOAM[4] : FOAM[2])[1], (lit2 ? FOAM[4] : FOAM[2])[2], lit2 ? 220 : 120);
        }
        if (r >= 2) pic.over(ii - Math.ceil(r / 2), jj - Math.ceil(r / 2), 220, 232, 214, 240);
        // (a ring of the water round it)
        for (let a2 = 0; a2 < 16; a2++) {
          const ang = (a2 / 16) * TAU;
          pic.over(Math.round(ii + Math.cos(ang) * (r + 2)), Math.round(jj + Math.sin(ang) * (r + 2) * 0.5), FOAM[2][0], FOAM[2][1], FOAM[2][2], 120);
        }
      } else {
        // (it breaks: a ring of droplets thrown out, a ring spreading)
        const s = (p - 0.7) / 0.3;
        const R = rr + 2 + 7 * s;
        for (let a2 = 0; a2 < 24; a2++) {
          const ang = (a2 / 24) * TAU;
          if (h3(b, a2, 9, 527) < 0.3) continue;
          pic.over(Math.round(ii + Math.cos(ang) * R), Math.round(jj + Math.sin(ang) * R * 0.5), FOAM[3][0], FOAM[3][1], FOAM[3][2], 200 * (1 - s));
        }
        for (let d2 = 0; d2 < 5; d2++) {
          const ang = h3(b, d2, 3, 528) * TAU;
          const up = 6 * s * (1 - s) * 4;
          pic.over(Math.round(ii + Math.cos(ang) * (rr + 4 * s)), Math.round(jj - up + Math.sin(ang) * 2), SPRAY[0], SPRAY[1], SPRAY[2], 230 * (1 - s));
        }
      }
    }
  }
  // THE BOIL: the water over him churning to foam as he comes up, a hump of it heaving over where he will break it
  if (Wt.boil > 0.02) {
    const hump = ent ? sm(EYE_ENTRANCE.rise[0], EYE_ENTRANCE.breaks, k) * (1 - sm(EYE_ENTRANCE.breaks, EYE_ENTRANCE.breaks + 12, k)) : 0;
    const at = ent ? entranceAt(k) : { back: 0 };
    for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) {
      const q = j * CW + i;
      if (!S.water[q] || (top.who[q] >= 0 && top.z[q] > -0.5)) continue;
      const [X, Y] = waterAt(i, j);
      const dx = X / 300;
      const dy = (Y + at.back - 20) / 200;
      const r = Math.hypot(dx, dy);
      if (r > 1.2) continue;
      // (where it churns, coarse; in it, the crests of little waves running every way, thin broken lines of foam, their tops catching
      // the light; between them the black water)
      const churn = vn(X * 0.05 + t * 2.1, Y * 0.04 - t * 1.6, 600) * (1 - r / 1.2) * Wt.boil;
      if (churn > 0.16) {
        const w1 = vn(X * 0.055 + t * 1.7, Y * 0.12 - t * 1.3, 601);
        const w2 = vn(X * 0.09 - t * 2.3, Y * 0.17 + t * 1.9, 602);
        const band = 0.012 + 0.03 * churn;
        const on1 = Math.abs(w1 - 0.5) < band;
        const on2 = Math.abs(w2 - 0.5) < band * 0.8;
        if ((on1 || on2) && vn(X * 0.3, Y * 0.5 + t * 3, 603) > 0.3) {
          const lit = on1 ? vn(X * 0.055 + t * 1.7, (Y - 4) * 0.12 - t * 1.3, 601) > w1 : vn(X * 0.09 - t * 2.3, (Y - 4) * 0.17 + t * 1.9, 602) > w2;
          const c2 = lit ? SPRAY : FOAM[3];
          pic.over(i, j, c2[0], c2[1], c2[2], lit ? 235 : 180);
        } else if (churn > 0.4 && vn(X * 0.4 + t * 6, Y * 0.6, 604) > 0.86) pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 200);
      }
      // (the water heaving up over him before he breaks it: its swell's crest catching the light, broken)
      if (hump > 0 && Math.abs(r - 0.5 * (1 - hump * 0.3) - (vn(X * 0.02, Y * 0.02, 607) - 0.5) * 0.12) < 0.03 && vn(X * 0.1, Y * 0.08 + t, 608) > 0.45 && Math.sin(Math.atan2(dy, dx)) < 0.3) pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 200 * hump);
    }
  }
  // HIS TENTACLES' BURSTS: the water bulging over each before it, a crown of it thrown up as it bursts, a ring of foam spreading
  if (ent) {
    Wt.bursts.forEach((B, idx) => {
      const s = k - B.k;
      const [ci, cj] = onCanvas(B.x, B.y, 0);
      if (s >= -EYE_ENTRANCE.bulge && s < 0) {
        const u = (s + EYE_ENTRANCE.bulge) / EYE_ENTRANCE.bulge;
        // (the water heaving up over it in a dome: rings running off it, the dome's top catching the light, foam breaking on it)
        const dome = 16 + 22 * u;
        for (let j = Math.floor(cj - 48); j <= cj + 48; j++) for (let i = Math.floor(ci - 100); i <= ci + 100; i++) {
          if (i < 0 || j < 0 || i >= CW || j >= CH || !S.water[j * CW + i]) continue;
          if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] > -0.5) continue;
          const [X, Y] = waterAt(i, j);
          const d = Math.hypot(X - B.x, Y - B.y);
          // (its rings, spreading)
          for (let r = 0; r < 3; r++) {
            const R = dome + 8 + frac(s / 5 + r / 3) * 60;
            if (Math.abs(d - R) < 0.8 && vn(X * 0.06 + r, Y * 0.04, 612 + idx) > 0.35) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 200 * u * (1 - frac(s / 5 + r / 3)));
          }
          // (the dome's top, lit on its upper left; foam breaking over it, more as it swells)
          const ang = Math.atan2(Y - B.y, X - B.x);
          if (Math.abs(d - dome * 0.6) < 1.4 && Math.cos(ang + 2.3) > 0.2) pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 230 * u);
          else if (d < dome && vn(X * 0.35 + t * 5, Y * 0.25, 611) > 0.8 - 0.25 * u) pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 220);
        }
      } else if (s >= 0 && s < 50) {
        const ss = s / EYE_FPS;
        const R = 36 + 160 * ss;
        for (let j = Math.floor(cj - R / R3 - 4); j <= cj + R / R3 + 4; j++) for (let i = Math.floor(ci - R * SEEN - 4); i <= ci + R * SEEN + 4; i++) {
          if (i < 0 || j < 0 || i >= CW || j >= CH || !S.water[j * CW + i]) continue;
          if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] > -0.5) continue;
          const [X, Y] = waterAt(i, j);
          const d = Math.hypot(X - B.x, Y - B.y);
          const lead = (d - R) / (2 + 3 * ss);
          if (Math.abs(lead) < 1 && vn(X * 0.07, Y * 0.07 + ss, 620 + idx) > 0.28 + 0.4 * ss) {
            const c3 = lead > 0.2 ? FOAM[4] : lead > -0.4 ? FOAM[3] : WATER;
            pic.over(i, j, c3[0], c3[1], c3[2], 230 * (1 - ss / 1.7));
          } else if (d < R - 4 && d > 30 && vn(Math.atan2(Y - B.y, X - B.x) * 9, d * 0.04 - ss * 3, 621) > 0.84) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 150 * (1 - ss / 1.7));
        }
      }
    });
  }
  // HIM OVER THE WATER, and the after-images of a strike
  for (let q = 0; q < n; q++) {
    if (ghost[q * 4 + 3] && !(top.who[q] >= 0 && top.z[q] >= -0.5)) {
      const i = q % CW;
      const j = (q / CW) | 0;
      if (bayer(i, j) > -0.1) pic.over(i, j, ghost[q * 4], ghost[q * 4 + 1], ghost[q * 4 + 2], 120);
    }
    if (top.who[q] < 0 || top.z[q] < -0.5) continue;
    D[q * 4] = top.col[q * 3];
    D[q * 4 + 1] = top.col[q * 3 + 1];
    D[q * 4 + 2] = top.col[q * 3 + 2];
    D[q * 4 + 3] = 255;
  }
  // WATER POURING OFF HIM as he rises: sheets of it running down him, streams falling off his overhangs into the water
  if (rose && k < EYE_ENTRANCE.rise[1] + 40) {
    const streams: Array<[number, number, number]> = [];
    for (let q = 0; q < n; q++) {
      if (top.who[q] !== 0 || top.z[q] < -0.5) continue;
      const i = q % CW;
      const j = (q / CW) | 0;
      const zp = top.z[q] + F.jaws.drop;
      const ke = emergedQ(zp);
      const age = (k - ke) / EYE_FPS;
      if (age < 0 || age > 2.2) continue;
      const wet = Math.exp(-age / 0.8);
      const jp = top.jp[q];
      const col = h3(i, 0, 0, 704);
      // (runs of it: each its own column and speed, in short lengths sliding down him, a bright head and a fading tail; thickest
      // on what has only just come up out of the water, a sheet of it sliding off)
      const fresh = age < 0.4 ? 1 - age / 0.4 : 0;
      if (col < 0.2 * wet + 0.5 * fresh) {
        const sp = 6 + 6 * h3(i, 1, 0, 705);
        const u = (jp - k * sp) * 0.07 + col * 50;
        const run = vn(u, i * 0.7, 700);
        const th = 0.64 - 0.14 * fresh;
        if (run > th) {
          const head = vn(u + 0.07, i * 0.7, 700) < th;
          const c = head ? SPRAY : run > th + 0.1 ? FOAM[3] : FOAM[2];
          pic.over(i, j, c[0], c[1], c[2], head ? 240 : 150 * wet + 30);
        } else if (wet > 0.25) pic.over(i, j, WATER[0], WATER[1], WATER[2], 70 * wet);
      } else if (wet > 0.25) pic.over(i, j, WATER[0], WATER[1], WATER[2], 70 * wet);
      // (streams off where he overhangs the water)
      const below = q + CW;
      if (j + 1 < CH && top.who[below] < 0 && S.water[below] && h3(i, 0, 0, 701) < 0.35 * wet && top.z[q] > 3) streams.push([i, j, top.z[q]]);
    }
    for (const [i, j, z] of streams) {
      const len = Math.round(z);
      for (let s = 1; s <= len; s++) {
        const y = j + s;
        if (y >= CH) break;
        const q = y * CW + i;
        if (top.who[q] >= 0 && top.z[q] >= -0.5 && top.near[q] > top.near[j * CW + i] + 1) continue;
        // (broken into drops as it falls)
        if (vn(i * 0.5, (s - k * 9) * 0.12, 702) < 0.3) continue;
        const c = (s + k) % 5 === 0 ? SPRAY : FOAM[3];
        pic.over(i, y, c[0], c[1], c[2], 200);
      }
      // (and where it meets the water, a splash of foam)
      for (let d = -2; d <= 2; d++) pic.over(i + d, j + len + (h3(i, d, k, 703) < 0.5 ? 0 : 1), FOAM[4][0], FOAM[4][1], FOAM[4][2], 180);
    }
  }
  // THE PINK EDGE round him where he is over the water (outside his outline, never round what is under it)
  for (let j = 1; j < CH - 1; j++) for (let i = 1; i < CW - 1; i++) {
    const q = j * CW + i;
    if (top.who[q] >= 0 && top.z[q] >= -0.5) continue;
    let by = false;
    for (const nq of [q + 1, q - 1, q + CW, q - CW]) if (top.who[nq] >= 0 && top.z[nq] >= 0 && top.seam[nq] && top.kind[nq] === 1) by = true;
    if (by) pic.over(i, j, RIM[0], RIM[1], RIM[2], RIM_ALPHA);
  }
  // GOBS OFF HIM SPLASHING into the water
  if (!(ent && k < EYE_ENTRANCE.tear[0])) {
    const an = F.jaws.pose.anim;
    if (an) {
      const SP = meltSplashes(an);
      for (let s = 0; s < SP.length; s += 4) {
        const [ci, cj] = onCanvas(SP[s], SP[s + 1] - F.jaws.back, 0);
        const age = SP[s + 2];
        const R = SP[s + 3] * (0.8 + 5 * age);
        for (let a2 = 0; a2 < 20; a2++) {
          const ang = (a2 / 20) * TAU;
          if (h3(s, a2, 1, 710) < 0.35) continue;
          const i = Math.round(ci + Math.cos(ang) * R * SEEN);
          const j = Math.round(cj + Math.sin(ang) * R / R3);
          if (i < 0 || j < 0 || i >= CW || j >= CH) continue;
          const q = j * CW + i;
          if (top.who[q] >= 0 && top.z[q] >= -0.5) continue;
          pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 220 * (1 - age / 0.6));
        }
        if (age < 0.25) {
          for (let d2 = 0; d2 < 4; d2++) {
            const ang = h3(s, d2, 2, 711) * TAU;
            const up = 120 * age - 0.5 * FALL_G * age * age;
            const [di, dj] = onCanvas(SP[s] + Math.cos(ang) * 8 * age * 10, SP[s + 1] - F.jaws.back + Math.sin(ang) * 6, Math.max(0, up));
            pic.over(Math.round(di), Math.round(dj), SPRAY[0], SPRAY[1], SPRAY[2], 230);
          }
        }
      }
    }
  }
  // GOBS OFF HIM SPLATTING on what lies slumped round him at the water: a flattened splash of his goo, flecks thrown out, sinking in
  if (!(ent && k < EYE_ENTRANCE.tear[0])) {
    const an = F.jaws.pose.anim;
    if (an) {
      const LD = meltLandings(an);
      for (let s = 0; s < LD.length; s += 5) {
        const age = LD[s + 3];
        const u = age / 0.4;
        const r = LD[s + 4];
        const [ci, cj] = onCanvas(LD[s], LD[s + 1] - F.jaws.back, LD[s + 2] - F.jaws.drop);
        const nr = (LD[s + 1] - F.jaws.back) * 0.8660254 + (LD[s + 2] - F.jaws.drop) * 0.5;
        const wide = r * (1.2 + 1.6 * Math.sqrt(u)) * SEEN;
        for (let di = -Math.ceil(wide); di <= Math.ceil(wide); di++) {
          for (let dj = -2; dj <= 1; dj++) {
            const i = Math.round(ci + di);
            const j = Math.round(cj + dj);
            if (i < 0 || j < 0 || i >= CW || j >= CH) continue;
            const q = j * CW + i;
            if (top.who[q] >= 0 && top.near[q] > nr + 6) continue;
            const e = Math.abs(di) / wide;
            if (e > 1 || (dj < 0 && e > 0.6 - 0.3 * u) || (dj === -2 && e > 0.3)) continue;
            const c = dj < 0 ? MELT[3] : e > 0.7 ? MELT[1] : MELT[2];
            pic.over(i, j, c[0], c[1], c[2], 255 * (1 - sm(0.5, 1, u)));
          }
        }
        if (u < 0.5) {
          for (let f2 = 0; f2 < 4; f2++) {
            const ang = h3(s, f2, 4, 712) * Math.PI;
            const fl = 3 + 10 * u;
            const i = Math.round(ci + Math.cos(ang) * fl * (f2 % 2 ? 1 : -1));
            const j = Math.round(cj - Math.sin(ang) * fl * 0.8 * (1 - u) * 2);
            if (i >= 0 && j >= 0 && i < CW && j < CH) pic.over(i, j, MELT[3][0], MELT[3][1], MELT[3][2], 230);
          }
        }
      }
    }
  }
  // DROPS OFF HIM FALLING INTO THE WATER at his foot: each its own round, a bead dropping, a splash, a little ring
  if (seeds && !(ent && k < EYE_ENTRANCE.tear[0])) {
    const cells = new Map<number, number>();
    for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) {
      const q = j * CW + i;
      if (!S.water[q] || (top.who[q] >= 0 && top.z[q] >= -0.5) || wd[q] < 2.5 || wd[q] > 8) continue;
      const c = (i >> 3) * 4096 + (j >> 2);
      if (!cells.has(c)) cells.set(c, q);
    }
    for (const [c, q] of cells) {
      if (h3(c, 0, 0, 720) > 0.2) continue;
      const per = [1, 1.5, 3][Math.floor(h3(c, 1, 0, 721) * 3)];
      const p = frac(t / per + h3(c, 2, 0, 722));
      const i0 = q % CW;
      const j0 = (q / CW) | 0;
      const age = p * per;
      if (age < 0.4) {
        // (the splash: a ring opening, two drops jumping)
        const R = 1 + 9 * age;
        for (let a2 = 0; a2 < 12; a2++) {
          const ang = (a2 / 12) * TAU;
          if (h3(c, a2, 3, 723) < 0.3) continue;
          pic.over(Math.round(i0 + Math.cos(ang) * R), Math.round(j0 + Math.sin(ang) * R * 0.5), FOAM[4][0], FOAM[4][1], FOAM[4][2], 220 * (1 - age / 0.4));
        }
        if (age < 0.2) {
          const up = Math.round(70 * age - 0.5 * FALL_G * 0.5 * age * age);
          pic.over(i0 - 1, j0 - Math.max(0, up), SPRAY[0], SPRAY[1], SPRAY[2], 240);
          pic.over(i0 + 2, j0 - Math.max(0, Math.round(up * 0.7)), SPRAY[0], SPRAY[1], SPRAY[2], 220);
        }
      } else if (age > per - 0.12) {
        // (a bead of him dropping into it)
        const fall = Math.round((per - age) * 90);
        pic.over(i0, j0 - fall, MELT[2][0], MELT[2][1], MELT[2][2], 255);
        pic.over(i0, j0 - fall - 1, MELT[3][0], MELT[3][1], MELT[3][2], 255);
      }
    }
  }
  // WHAT FLIES: the roar's spray and goo; the crowns of water thrown up round his tentacles
  const flyers: Array<[Flyer, number]> = [];
  if (ent && roarS >= 0 && roarS < 1.6) for (const f of ROAR) flyers.push([f, roarS - f.t0]);
  if (ent) Wt.bursts.forEach((B, idx) => {
    const s = (k - B.k) / EYE_FPS;
    if (s >= 0 && s < 1.6) for (const f of burstFlyers(B.x, B.y, idx + 1)) flyers.push([f, s - f.t0]);
  });
  for (const [f, s] of flyers) {
    if (s < 0) continue;
    const land = landOf(f);
    if (s > land) {
      // (landed: a splash where it met the water)
      const a2 = s - land;
      if (a2 > 0.35) continue;
      const [x, y] = flyAt(f, land);
      const [ci, cj] = onCanvas(x, y, 0);
      const R = 1.5 + 9 * a2;
      for (let b = 0; b < 8; b++) {
        const ang = (b / 8) * TAU;
        const i = Math.round(ci + Math.cos(ang) * R);
        const j = Math.round(cj + Math.sin(ang) * R * 0.5);
        if (i < 0 || j < 0 || i >= CW || j >= CH || !S.water[j * CW + i]) continue;
        if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] >= -0.5) continue;
        pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 200 * (1 - a2 / 0.35));
      }
      continue;
    }
    const [x, y, z] = flyAt(f, s);
    const [x0, y0, z0] = flyAt(f, Math.max(0, s - 1.6 / EYE_FPS));
    const [ci, cj] = onCanvas(x, y, z);
    const [pi, pj] = onCanvas(x0, y0, z0);
    const nr = y * 0.8660254 + z * 0.5;
    const hidden = (i: number, j: number): boolean => {
      if (i < 0 || j < 0 || i >= CW || j >= CH) return true;
      const q = j * CW + i;
      return top.who[q] >= 0 && top.z[q] >= -0.5 && top.near[q] > nr;
    };
    // (its trail: back along where it came from, fading)
    const steps = Math.max(1, Math.round(Math.hypot(ci - pi, cj - pj)));
    const trail = f.kind === 1 ? MELT[1] : FOAM[2];
    for (let st = 1; st <= steps; st++) {
      const i = Math.round(ci + ((pi - ci) * st) / steps);
      const j = Math.round(cj + ((pj - cj) * st) / steps);
      if (!hidden(i, j)) pic.over(i, j, trail[0], trail[1], trail[2], 170 * (1 - st / (steps + 1)));
    }
    const i0 = Math.round(ci);
    const j0 = Math.round(cj);
    if (f.kind === 1) {
      // (a gob of goo: lit on its upper left, dark underneath, a glint)
      const r = f.size;
      for (let dj = 0; dj <= r; dj++) for (let di = 0; di <= r; di++) {
        if (hidden(i0 + di, j0 + dj) || (r > 1 && (di + dj === 0 || di + dj === 2 * r))) continue;
        const c = di + dj <= r - 1 ? MELT[3] : di + dj >= r + 1 ? MELT[0] : MELT[2];
        pic.over(i0 + di, j0 + dj, c[0], c[1], c[2], 255);
      }
      if (!hidden(i0, j0)) pic.over(i0, j0, SHEEN[0], SHEEN[1], SHEEN[2], 255);
    } else {
      // (a drop of water: pale, a glint)
      const c = f.kind === 2 ? SPRAY : SPIT[3];
      if (!hidden(i0, j0)) pic.over(i0, j0, c[0], c[1], c[2], 255);
      if (f.size > 1 && !hidden(i0 + 1, j0)) pic.over(i0 + 1, j0, FOAM[3][0], FOAM[3][1], FOAM[3][2], 255);
    }
  }
  // THE PIECES BEFORE HIM, AND THE WARRIOR AT HIS SPOT, breathing
  pic.lay(S.front, 0, 0, 0, 0);
  {
    const [x, y] = W(HERO_AT[0], HERO_AT[1]);
    const [sx, sy] = P(CAM, x, y);
    pic.shadow(sx, sy, 13, 0.5);
    const idle = hero.back.idle;
    laySprite(pic, idle[Math.floor(tf * (hero.back.idleFps ?? 10)) % idle.length], sx, sy);
    pic.light(sx, sy - 20, 60, [200, 190, 220], 0.08);
  }
  // THE DARK (the game's darkening of the screen: his fire never darkens)
  if (F.dark > 0.005) {
    for (let q = 0; q < n; q++) {
      if (top.who[q] >= 0 && top.fire[q] && top.z[q] > -40) continue;
      D[q * 4] *= 1 - F.dark;
      D[q * 4 + 1] *= 1 - F.dark;
      D[q * 4 + 2] *= 1 - F.dark;
    }
  }
  // HIS LIGHTS (his eye's fire pulsing through the water; his throat's, flaring as he roars)
  for (const l of lights) pic.light(l.x, l.y, l.r, l.c, Math.min(0.6, l.a * (F.move === 'lurk' || (ent && k < 22) ? Wt.pulse : 1)));
  if (ent && roarS >= -0.05 && roarS < 1) {
    const fl = Math.exp(-Math.max(0, roarS) / 0.25);
    const [mi, mj] = onCanvas(0, -20, 50);
    pic.light(mi, mj, 150, FIRE3, 0.42 * fl);
    pic.light(mi, mj, 70, [255, 240, 200], 0.3 * fl);
  }
  void FIRE2;
  // (the screen, thrown by the shake: whole game pixels)
  return pic.crop(M - F.shake[0] * 2, M - F.shake[1] * 2, SW, SH);
}

// =============================================================================================
// THE MODES

const mode = process.argv[2];
if (mode === 'paint') {
  // (each worker paints its share of the layers not yet painted: worker i of n)
  const wi = Number(process.argv[3]);
  const wn = Number(process.argv[4]);
  const only = process.argv.slice(5);
  const want = new Map<string, EyeLayer>();
  for (const mv of Object.keys(MOVES) as Move[]) {
    if (only.length && !only.some((o) => o === mv || o.startsWith(`${mv}:`))) continue;
    const pick = only.find((o) => o.startsWith(`${mv}:`));
    const [a, b] = pick ? pick.split(':')[1].split('-').map(Number) : [0, MOVES[mv] - 1];
    for (let k = a; k <= b; k++) for (const L of layersOf(eyeFrame(mv, k))) want.set(fileOf(L), L);
  }
  const files = [...want.keys()].sort();
  // (the heavy ones, his jaws, shared out evenly first)
  const order = files.filter((f) => /[\\/]J/.test(f)).concat(files.filter((f) => !/[\\/]J/.test(f)));
  let done = 0;
  const mine = order.filter((_, i) => i % wn === wi);
  const t0 = Date.now();
  for (const f of mine) {
    if (!fs.existsSync(f)) layer(want.get(f) as EyeLayer);
    MEMO.clear();
    done++;
    if (done % 10 === 0) process.stdout.write(`worker ${wi}: ${done} of ${mine.length} (${((Date.now() - t0) / 1000).toFixed(0)} s)\n`);
  }
  process.stdout.write(`worker ${wi} done: ${mine.length} layers of ${files.length} in ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
} else if (mode === 'frames') {
  const out = process.argv[3];
  const mv = process.argv[4] as Move;
  const a = Number(process.argv[5] ?? 0);
  const b = Number(process.argv[6] ?? MOVES[mv] - 1);
  fs.mkdirSync(out, { recursive: true });
  const t0 = Date.now();
  for (let k = a; k <= b; k++) {
    const F = eyeFrame(mv, k);
    const pic = frameOf(F, k / EYE_FPS);
    fs.writeFileSync(path.join(out, `${mv}_${String(k).padStart(3, '0')}.png`), pic.png());
  }
  process.stdout.write(`${mv} ${a}-${b}: ${b - a + 1} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
} else if (mode === 'count') {
  const want = new Set<string>();
  const byKind = new Map<string, number>();
  for (const mv of Object.keys(MOVES) as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(eyeFrame(mv, k))) {
    const f = fileOf(L);
    if (want.has(f)) continue;
    want.add(f);
    const kd = L.key.split('.')[0];
    byKind.set(kd, (byKind.get(kd) ?? 0) + 1);
  }
  process.stdout.write(`${want.size} layers: ${[...byKind].map(([a, b]) => `${a} ${b}`).join(', ')}; painted ${[...want].filter((f) => fs.existsSync(f)).length}\n`);
}
