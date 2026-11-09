// THE SWAMP COLOSSUS, THE NEW DROWNED EYE, AS PICTURES FOR THE OWNER (art/eye_colossus.ts; a mock-up, not in the game): painted here
// without a browser, as the tests paint, on the fen's own ground and water (art/fen.ts, by the game's terrain painter, art/terrain.ts),
// with the fen's own pieces (art/floor10.ts) and the Warrior as the game paints him (art/heroes3.ts), at the game's size (two
// picture pixels to a game pixel). Each piece is written as a PNG with a line of sheet.json; tools/eye_redo_sheet.py puts the
// pieces together with their captions.
//   npx tsx tools/eye_redo_pics.ts look <out dir>      the pieces of eye_look.png
//   npx tsx tools/eye_redo_pics.ts arena <out dir>     the pieces of eye_arena.png (today's layout: tools/scenarios/eye_today.mjs)
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
import { ARMS_UNDER, COLOSSUS, EYE_RISEN, EYE_UNDER, LEANED, PEAKS, STONE, TONGUE_RISEN, armClearances, costOf, mawParts, meltParts, paintColossus, poseRisen, poseUnder } from '../src/art/eye_colossus';
import type { ColossusPicture, ColossusPose, Frame } from '../src/art/eye_colossus';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const fs = nodeFs as { mkdirSync(p: string, o: { recursive: boolean }): void; writeFileSync(p: string, d: unknown): void; readFileSync(p: string): Uint8Array & { buffer: ArrayBuffer; byteOffset: number }; existsSync(p: string): boolean };
const zlib = nodeZlib as { deflateSync(b: Uint8Array, o?: { level: number }): Uint8Array };
const path = nodePath as { join(...p: string[]): string };
declare const process: { argv: string[]; exit(n: number): void; stdout: { write(s: string): void } };
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
    for (let i = 0; i < w * h; i++) this.d[i * 4 + 3] = 255;
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
  /** A painting laid with its picture pixel (`px0`, `py0`) at (`x`, `y`) here, `k` times as big. */
  lay(p: { w: number; h: number; d: Uint8ClampedArray }, px0: number, py0: number, x: number, y: number, k = 1): void {
    for (let j = 0; j < p.h; j++) {
      for (let i = 0; i < p.w; i++) {
        const s = (j * p.w + i) * 4;
        const a = p.d[s + 3];
        if (!a) continue;
        const X0 = Math.round(x + (i - px0) * k);
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
  scaled(k: number): Pic {
    const o = new Pic(this.w * k, this.h * k);
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      const s = (Math.floor(y / k) * this.w + Math.floor(x / k)) * 4;
      o.d.set(this.d.subarray(s, s + 4), (y * o.w + x) * 4);
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
    return Buf.concat([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))]);
  }
}
const rgb = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const imgOf = (s: Sprite): Px => s.img as unknown as Px;
function laySprite(pic: Pic, s: Sprite, x: number, y: number, k = 1): void {
  const d = s.density ?? 1;
  pic.lay(imgOf(s), s.ax * d, s.ay * d, Math.round(x), Math.round(y), k);
}

// =============================================================================================
// THE NEW ARENA: a big rectangle of the fen's old paving; the black water across the top of it, where he lies; the fen beyond.
// In the world: his middle at the water is at C; across the screen u = x - y, down it v = x + y (a picture pixel across is 1/32
// of u, one down is 1/16 of v).

const C: [number, number] = [30, 30];
const UC = C[0] - C[1];
const VC = C[0] + C[1];
/** The arena, in u and v from his middle: the stone from the water's edge (`quay`) down `deep`, `half` either way across. */
// (the main chat's stone, 17 tiles across and 11 deep, a tile being √2 of u or v; its edge STONE.edge of his lengths before his
// middle: a length toward the camera is 0.577 of a picture pixel down, 16 of which are one of v)
export const ARENA = { half: (STONE.across * Math.SQRT2) / 2, quay: (STONE.edge * 0.5773502691896258) / 16, deep: STONE.deep * Math.SQRT2 } as const;
const onStone = (x: number, y: number): boolean => Math.abs(x - y - UC) <= ARENA.half && x + y - VC >= ARENA.quay && x + y - VC <= ARENA.quay + ARENA.deep;
// (the Eye's pool look over all the water before the stone: deep and near black; its own painted rings left out, his ripples are his)
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
        for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
          const u = (a + 0.5) / N;
          const v = (b + 0.5) / N;
          if (inside(u, v) !== shape(tx + u, ty + v)) wrong++;
        }
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
function terrain(): Terrain {
  if (!TERRAIN) TERRAIN = terrainOf(layTiles(onStone, 64, 64), fenLook({ paved: onStone, pool: poolD, sick: () => 0.35 }));
  return TERRAIN;
}
/** A camera: where world (0, 0) is on the picture. */
interface Cam { ox: number; oy: number }
const P = (cam: Cam, x: number, y: number): [number, number] => [cam.ox + (x - y) * 32, cam.oy + (x + y) * 16];
/** The camera that puts his middle at the water at (`sx`, `sy`) on a picture. */
const camAt = (sx: number, sy: number): Cam => ({ ox: sx - UC * 32, oy: sy - VC * 16 });
/** A world point `du` across and `dv` down from his middle. */
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
  return p.frames[f % p.frames.length];
};
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

interface Stand { d: number; f: () => void }
/** The fen's pieces round the arena: broken columns at the water's corners, reeds in the water, stones and drums on the paving. */
function dressing(pic: Pic, cam: Cam): Stand[] {
  const out: Stand[] = [];
  const put = (name: string, du: number, dv: number, f = 0, sh = 0): void => {
    const [x, y] = W(du, dv);
    out.push({ d: x + y, f: () => {
      const [sx, sy] = P(cam, x, y);
      if (sh) pic.shadow(sx, sy, sh, 0.4);
      laySprite(pic, piece(name, f), sx, sy);
    } });
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
  return out;
}

/** Him laid on a picture: his middle at the water at (`sx`, `sy`); his eye's light over it. */
function layHim(pic: Pic, c: ColossusPicture, sx: number, sy: number): void {
  // (what of him is under the water, and the water's ripples, only where there is water: never over the stone)
  const d = new Uint8ClampedArray(c.px.d);
  const cam = camAt(sx, sy);
  for (let j = 0; j < c.px.h; j++) for (let i = 0; i < c.px.w; i++) {
    const k = j * c.px.w + i;
    if (c.kind[k] !== 2 && c.kind[k] !== 3) continue;
    const X = sx + i - c.ax + 0.5 - cam.ox;
    const Y = sy + j - c.ay + 0.5 - cam.oy;
    const wx = (X / 32 + Y / 16) / 2;
    const wy = (Y / 16 - X / 32) / 2;
    if (onStone(wx, wy)) d[k * 4 + 3] = 0;
  }
  pic.lay({ w: c.px.w, h: c.px.h, d }, c.ax, c.ay, sx, sy);
  for (const l of c.lights) pic.light(sx + l.x - c.ax, sy + l.y - c.ay, l.r, rgb(l.color), l.a);
}

/** The Warrior on the stone at (`du`, `dv`) from his middle, facing him (from behind) or the camera. */
function layHero(pic: Pic, cam: Cam, du: number, dv: number, back = true): Stand {
  const [x, y] = W(du, dv);
  return { d: x + y, f: () => {
    const [sx, sy] = P(cam, x, y);
    pic.shadow(sx, sy, 13, 0.5);
    laySprite(pic, (back ? hero.back : hero.front).idle[0], sx, sy);
    pic.light(sx, sy - 20, 60, [200, 190, 220], 0.08);
  } };
}

// =============================================================================================
// THE PIECES

const out = process.argv[3] || 'shots/eye_redo';
fs.mkdirSync(out, { recursive: true });
const sheet: { file: string; title: string; note: string; k?: number }[] = [];
function save(name: string, pic: Pic, title: string, note: string, k = 1): void {
  fs.writeFileSync(path.join(out, name), (k > 1 ? pic.scaled(k) : pic).png());
  sheet.push({ file: name, title, note, k });
  process.stdout.write(`${name} ${pic.w * k}x${pic.h * k}\n`);
}
const t0 = Date.now();
const timed = <T>(what: string, f: () => T): T => {
  const a = Date.now();
  const r = f();
  process.stdout.write(`  ${what}: ${((Date.now() - a) / 1000).toFixed(1)} s\n`);
  return r;
};

// (a painting of him is kept, so that the look and the arena paint each pose once; made again whenever his file changes)
const crypto = nodeCrypto as { createHash(a: string): { update(d: Uint8Array): { digest(e: string): string } } };
const SRC = crypto.createHash('sha1').update(fs.readFileSync('src/art/eye_colossus.ts')).digest('hex').slice(0, 12);
const CACHE = 'shots/eye_redo/cache';
fs.mkdirSync(CACHE, { recursive: true });
function painted(key: string, pose: ColossusPose, fr: Frame): ColossusPicture {
  const file = path.join(CACHE, `${key}_${SRC}.bin`);
  const n = fr.w * fr.h;
  if (fs.existsSync(file)) {
    const b = fs.readFileSync(file);
    const u8 = new Uint8Array(b.buffer, b.byteOffset, b.length);
    const hl = new DataView(u8.buffer, u8.byteOffset).getUint32(0, true);
    const meta = JSON.parse(new TextDecoder().decode(u8.subarray(4, 4 + hl))) as { lights: ColossusPicture['lights'] };
    let o = 4 + hl;
    const px = new Px(fr.w, fr.h);
    px.d.set(u8.subarray(o, o + n * 4));
    o += n * 4;
    const kind = u8.slice(o, o + n);
    o += n;
    const mat = u8.slice(o, o + n);
    o += n;
    const near = new Float32Array(u8.slice(o, o + n * 4).buffer);
    return { px, ax: fr.ax, ay: fr.ay, lights: meta.lights, kind, mat, near };
  }
  const c = timed(key, () => paintColossus(pose, fr));
  const meta = new TextEncoder().encode(JSON.stringify({ lights: c.lights }));
  const all = new Uint8Array(4 + meta.length + n * 4 + n * 2 + n * 4);
  new DataView(all.buffer).setUint32(0, meta.length, true);
  all.set(meta, 4);
  let o = 4 + meta.length;
  all.set(c.px.d, o);
  o += n * 4;
  all.set(c.kind, o);
  o += n;
  all.set(c.mat, o);
  o += n;
  all.set(new Uint8Array(c.near.buffer.slice(0)), o);
  fs.writeFileSync(file, all);
  return c;
}

/** His risen picture: a window on him big enough for all of him, his arms, and his tongue towering out of his V, the eye on top. */
const RISEN_FRAME = { w: 1100, h: 660, ax: 550, ay: 300 };
function measureOf(c: ColossusPicture, head = false, solid = false): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let j = 0; j < c.px.h; j++) for (let i = 0; i < c.px.w; i++) {
    const k = j * c.px.w + i;
    if (c.px.d[k * 4 + 3] < 200) continue;
    // (him alone: not his tentacles (11), nor what hangs off him, nor the water's rings)
    if (head && (c.kind[k] !== 1 || c.mat[k] === 11)) continue;
    // (him and his arms and what hangs off them, not the water's rings)
    if (solid && c.kind[k] !== 1 && c.kind[k] !== 4) continue;
    x0 = Math.min(x0, i);
    x1 = Math.max(x1, i);
    y0 = Math.min(y0, j);
    y1 = Math.max(y1, j);
  }
  return { x0, y0, x1, y1 };
}
/** Him on the stone at the game's size, the Warrior before him twice (from behind and from in front): the picture, `w` by `h`, his middle at the water at (`sx`, `sy`). */
function withStone(c: ColossusPicture, w: number, h: number, sx: number, sy: number, heroes: boolean): Pic {
  const cam = camAt(sx, sy);
  const pic = groundPic(w, h, cam);
  const stands = dressing(pic, cam);
  stands.push({ d: VC, f: () => layHim(pic, c, sx, sy) });
  if (heroes) {
    stands.push(layHero(pic, cam, 4.2, ARENA.quay + 2.2, true));
    stands.push(layHero(pic, cam, -4.6, ARENA.quay + 2.0, false));
  }
  stands.sort((a, b) => a.d - b.d).forEach((s) => s.f());
  return pic;
}
/** Where a point of his own space is on a picture with his middle at the water at (`sx`, `sy`), `k` times the game's size. */
const onPic = (q: readonly number[], sx: number, sy: number, k = 1): [number, number] => [sx + q[0] * (2 / Math.sqrt(3)) * k, sy - (q[2] - q[1] * (1 / Math.sqrt(3))) * k];

const mode = process.argv[2];
const RISEN = () => painted('risen', poseRisen(), RISEN_FRAME);
if (mode === 'look') {
  const risen = RISEN();
  const m = measureOf(risen);
  const mh = measureOf(risen, true);
  const mp = mawParts();
  const meltN = meltParts();
  process.stdout.write(`  with his arms: ${(m.x1 - m.x0 + 1) / 2} x ${(m.y1 - m.y0 + 1) / 2} game pixels; him alone ${(mh.x1 - mh.x0 + 1) / 2} x ${(mh.y1 - mh.y0 + 1) / 2}, his top ${(RISEN_FRAME.ay - mh.y0) / 2} over his middle at the water\n`);
  process.stdout.write(`  the V: ${mp.tiltDeg.map((t) => t.toFixed(0)).join(' and ')} degrees, ${mp.vAtWater.toFixed(0)} across at the water, his peaks ${mp.vAtPeaks.toFixed(0)} apart (at ${PEAKS.map((q) => q.map((v) => v.toFixed(0)).join(', ')).join(' and ')}); his eye at ${EYE_RISEN.join(', ')}, ${COLOSSUS.eyeW * 2} by ${COLOSSUS.eyeH * 2}; ${mp.teeth} teeth, the nearest ${mp.toothToTongue.toFixed(1)} clear of his tongue; melt ${JSON.stringify(meltN)}\n`);
  const W = 1200;
  const SX = 600;
  const SY = 262;
  const headW = Math.round((mh.x1 - mh.x0 + 1) / 2);
  const headH = Math.round((RISEN_FRAME.ay - mh.y0) / 2);
  // 0. THE STILL, beside his drawing (the sheet puts them side by side, the same height): him alone on the black water, a little
  // under the game's size, painted at that size so that every pixel is crisp
  {
    const Zs = 0.9;
    const still = painted('still', poseRisen(), { w: Math.round(1100 * Zs), h: Math.round(500 * Zs), ax: Math.round(550 * Zs), ay: Math.round(282 * Zs), zoom: Zs });
    const ms = measureOf(still, false, true);
    const pad = 10;
    const cw = ms.x1 - ms.x0 + 1 + pad * 2;
    const ch = ms.y1 - ms.y0 + 1 + pad * 2;
    const pic = new Pic(cw, ch);
    for (let i = 0; i < cw * ch; i++) {
      pic.d[i * 4] = 14;
      pic.d[i * 4 + 1] = 22;
      pic.d[i * 4 + 2] = 18;
    }
    pic.lay(still.px, still.ax, still.ay, still.ax - ms.x0 + pad, still.ay - ms.y0 + pad);
    for (const l of still.lights) pic.light(l.x - ms.x0 + pad, l.y - ms.y0 + pad, l.r, rgb(l.color), l.a);
    save('look_still.png', pic, 'HIS DRAWING (LEFT, THE IDEA HE SKETCHED) AND HIM AS NOW PAINTED (RIGHT)', 'Left, the idea he sketched, 7 Nov: split open from the water up in a V, teeth down both edges, the tongue twisting up out of it, the eye on its tip, tentacles curling out on both sides. Right, him: the same idea painted, his own flesh melting and dripping, on the black water.');
  }
  // 1. AT THE GAME'S SIZE, the Warrior before him for size
  const a = withStone(risen, W, 520, SX, SY, true);
  save('look_risen.png', a, 'AT THE GAME\'S SIZE, THE WARRIOR BEFORE HIM FOR SIZE', `The Warrior on the stone before him twice, as the game paints him (from behind and from in front). Him alone, ${headW} game pixels across, his eye's top ${headH} over his middle at the water; with his arms ${(m.x1 - m.x0 + 1) / 2} across. The knight stands 29.`);
  // 2. TWICE THE SIZE: his maw, his tongue and his eye
  save('look_2x.png', a.crop(300, SY - 252, 600, 330), 'TWICE THE SIZE', 'Split open from the water up: the two jaws pried apart, his left the lower and further out, his right the taller and sharper, both melting; hooked teeth down both edges of the V; his dark wet throat inside; spittle strung across; his tongue rising out of the bottom of it in an S, the eye on its tip over everything.', 2);
  // 3. THE EYE ON THE TONGUE, three times the size
  {
    const [ex, ey] = onPic(EYE_RISEN, SX, SY);
    save('look_eye.png', a.crop(Math.round(ex) - 190, Math.round(ey) - 52, 380, 220), 'THE EYE ON HIS TONGUE, THREE TIMES THE SIZE', 'His eye lying on its side, wider than tall, at the tip of his tongue: yellowed and bloodshot, the iris the enemy\'s pink burning to gold round a tall black slit, raw lids parted round it in an almond, the tongue\'s flesh swollen round it to a point at each corner. His tongue below it, smooth and wet, supple as a tentacle, drool hanging off it.', 3);
  }
  // 4. THE JAWS' TEETH, close
  {
    const [lx] = onPic(PEAKS[0], SX, SY);
    const [rx] = onPic(PEAKS[1], SX, SY);
    const [, py] = onPic(PEAKS[1], SX, SY);
    const x0 = Math.round(lx) - 8;
    const w = Math.round(rx) + 8 - x0;
    save('look_teeth.png', a.crop(x0, Math.round(py) - 8, w, Math.min(206, SY + 34 - Math.round(py) + 8)), 'HIS JAWS\' TEETH, THREE TIMES THE SIZE', 'Down both inner edges of the V, rows of crooked hooked fangs set in raw wet gum, of every size, some long, some broken, each hooked back toward his throat; none through his tongue. Spittle strung between the jaws; drool off the teeth; his throat dark behind, glowing faintly pink-gold low down.', 3);
  }
  // 5. UNDER THE WATER (phase 1)
  {
    const under = painted('under', { ...poseUnder(), arms: [] }, RISEN_FRAME);
    const w = 1200;
    const h = 480;
    const cam = camAt(600, 230);
    const pic = groundPic(w, h, cam);
    const stands = dressing(pic, cam);
    stands.push({ d: VC, f: () => layHim(pic, under, 600, 230) });
    stands.push(layHero(pic, cam, 3.2, ARENA.quay + 2.2, true));
    stands.sort((p, q) => p.d - q.d).forEach((s) => s.f());
    save('look_under.png', pic, 'UNDER THE WATER (PHASE 1)', `Only his eye's fire and the dark of his jaws seen through the black water: his peaks ${COLOSSUS.sunk - PEAKS[1][2]} of his lengths under it, his eye on his tongue ${Math.round(COLOSSUS.sunk - EYE_UNDER[2])} down, reared forward in the water before him, looking up at you; he lies further out than he rises.`);
  }
  // 6. FROM BEHIND, small (half the game's size)
  {
    const back = painted('back', poseRisen('back'), { w: 560, h: 340, ax: 280, ay: 160, zoom: 0.5 });
    const pic = groundPic(600, 300, camAt(300, 170));
    layHim(pic, back, 300, 170);
    save('look_back.png', pic, 'FROM BEHIND (HALF SIZE)', 'The backs of his two jaws, melting and running into the water, the back of his throat between them; his tongue rising over them, the eye on its tip looking away from you; his three arms rising beyond him.');
  }
} else if (mode === 'arena') {
  // THE PHONE'S SCREEN: 507 x 234 game pixels (engine/screen.ts on a phone held sideways), two picture pixels to each
  const SW = LEANED.w * 2;
  const SH = LEANED.h * 2;
  // (where his middle at the water is on the screen: the camera leaned toward him so that the hero stands at the foot of the screen,
  // as the Moth's does, and his eye, the highest of all of him, is on it)
  const HX = SW / 2;
  const HY = LEANED.waterAt * 2;
  const heroAt: [number, number] = [-1.5, ARENA.quay + 1.4];
  const shot = (c: ColossusPicture, name: string, title: string, note: string): void => {
    const cam = camAt(HX, HY);
    const pic = groundPic(SW, SH, cam);
    const stands = dressing(pic, cam);
    stands.push({ d: VC, f: () => layHim(pic, c, HX, HY) });
    stands.push(layHero(pic, cam, heroAt[0], heroAt[1], true));
    stands.sort((a, b) => a.d - b.d).forEach((s) => s.f());
    save(`${name}.png`, pic, title, note);
    // twice the size: its left half, its right half
    save(`${name}_2a.png`, pic.crop(0, 0, SW / 2, SH), `${title}: TWICE THE SIZE, LEFT HALF`, '', 2);
    save(`${name}_2b.png`, pic.crop(SW / 2, 0, SW / 2, SH), `${title}: TWICE THE SIZE, RIGHT HALF`, '', 2);
  };
  const [hx, hy] = P(camAt(HX, HY), ...W(heroAt[0], heroAt[1]));
  process.stdout.write(`  the hero's feet at (${hx}, ${hy}) of ${SW} x ${SH}; the middle of the screen is ${SH / 2 + 24}: the camera leaned ${(hy - SH / 2 - 24) / 2} game pixels\n`);
  const p1 = painted('p1', { ...poseUnder(), arms: ARMS_UNDER }, RISEN_FRAME);
  shot(p1, 'arena_p1', 'PHASE 1: HE LIES UNDER THE BLACK WATER; TWO TENTACLES BURST UP', 'The stone a big rectangle across the screen and on down past its foot; the black water across the top, still but for his two arms, his eye\'s fire under it. Kill both.');
  const p2 = RISEN();
  // (how high he is on the screen, leaned: his eye's top, from the top of the screen)
  {
    const mh = measureOf(p2, true);
    const top = HY - (p2.ay - mh.y0);
    const [, ey] = onPic(EYE_RISEN, HX, HY);
    process.stdout.write(`  leaned: his top (his eye's) ${top / 2} game pixels down from the top of the screen; his eye's middle ${(ey / 2).toFixed(0)} down; his middle at the water ${HY / 2} down; his peaks ${PEAKS.map((q) => (onPic(q, HX, HY)[1] / 2).toFixed(0)).join(' and ')} down\n`);
  }
  shot(p2, 'arena_p2', 'PHASE 2: HE HAS RISEN, SPLIT OPEN, THREE TENTACLES', 'He rises out of the black water split open in his V, his jaws melting, teeth down both edges; his tongue towering out of it, the eye on its tip high on the screen watching you; his three arms out of the water before him.');
  // THE CAMERA WHERE IT SITS WHEN THE HERO STANDS IN THE MIDDLE OF THE STONE (no lean): the hero in the middle of the screen
  {
    const mid: [number, number] = [0, ARENA.quay + ARENA.deep / 2];
    const cam0 = camAt(0, 0);
    const [hx0, hy0] = P(cam0, ...W(mid[0], mid[1]));
    const sx = SW / 2 - hx0;
    const sy = SH / 2 + 24 - hy0;
    const cam = camAt(sx, sy);
    const pic = groundPic(SW, SH, cam);
    const stands = dressing(pic, cam);
    stands.push({ d: VC, f: () => layHim(pic, p2, sx, sy) });
    stands.push(layHero(pic, cam, mid[0], mid[1], true));
    stands.sort((a, b) => a.d - b.d).forEach((s) => s.f());
    save('arena_mid.png', pic, 'THE CAMERA AS IT SITS WHEN THE HERO STANDS IN THE MIDDLE OF THE STONE (PHASE 2, NO LEAN)', 'The game\'s own camera, the hero in the middle of the screen: all this stone is his to fight on; across the top, the black water, the foot of his jaws and his three arms rising out of it.');
  }
  process.stdout.write(`  plan: the stone ${ARENA.half * 2} across (u) by ${ARENA.deep} down (v): ${(ARENA.half * 2 / Math.SQRT2).toFixed(1)} x ${(ARENA.deep / Math.SQRT2).toFixed(1)} floor tiles; quay ${ARENA.quay} below his middle\n`);
  for (const [n, pose] of [['risen', poseRisen()], ['under', poseUnder()]] as const) {
    const cl = armClearances(pose);
    process.stdout.write(`  arms ${n}: ${cl.body.toFixed(1)} clear of him, ${cl.stone.toFixed(1)} clear of the stone, roots in the water: ${cl.rootsInWater}\n`);
  }
  process.stdout.write(`  his eye at ${EYE_RISEN.join(', ')}; the tongue ${TONGUE_RISEN.length} points\n`);
  const c = costOf(30, 1);
  process.stdout.write(`  cost: a frame 800 x 480: ${c.frameMB.toFixed(2)} MB; at 30 a second ${c.perSecondMB.toFixed(1)} MB a second\n`);
}
fs.writeFileSync(path.join(out, 'sheet.json'), JSON.stringify(sheet, null, 1));
process.stdout.write(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
