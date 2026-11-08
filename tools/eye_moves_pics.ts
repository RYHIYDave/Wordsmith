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
import { ARM_COLOURS, ARM_SHAKE, CAM_ARMS, CAM_WAVES, CRASH, LINE, SHOTS, STONE_BOX, WAVE, fightFrame, waveFront, waveHigh } from '../src/art/eye_arms';
import { HERO_SPOT, EYE_ENTRANCE, EYE_FPS, EYE_LURK, EYE_STAND, entranceAt, eyeFrame } from '../src/art/eye_moves';
import { SHOVEL, SHOVEL_COLOURS, SHOVEL_FRAMES, SNAP, SCRAPERS, pourRope, pourSheet, scoreMarks, scraperAt, scrapeAt, shovelFrame, sideOf } from '../src/art/eye_shovel';
import type { End } from '../src/art/eye_shovel';
import type { ArmFx, EyeFrame, EyeLayer } from '../src/art/eye_moves';
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
/** Room either side of the screen for the camera to follow the Warrior to an end of the stone (his shovel). */
const XM = 330;
const CW = SW + 2 * M + 2 * XM;
/** Below the screen, room for the camera lowered over the stone for the tentacles (picture pixels). */
const EXTRA = 320;
const CH = SH + 2 * M + EXTRA;
/** His middle at the water on the canvas: the camera leaned toward him as the stills have it, but `EASE` game pixels less, so that his eye
 *  at the top of its weave stays on the screen (for the main chat: his middle at the water 131 game pixels down the screen in phase 2). */
export const EASE = 6;
const HX = SW / 2 + M + XM;
const HY = (LEANED.waterAt + EASE) * 2 + M;
const CAM = camAt(HX, HY);
const HERO_AT: [number, number] = [-1.5, ARENA.quay + 1.4];
/** A point of his space on the canvas. */
const onCanvas = (x: number, y: number, z: number): [number, number] => [HX + x * SEEN, HY + y / R3 - z];
/** The water under a canvas pixel, in his space. */
const waterAt = (i: number, j: number): [number, number] => [(i + 0.5 - HX) / SEEN, (j + 0.5 - HY) * R3];

/** The scenery: the ground and what is behind him; what is before him; the water. And for his shovel, where he comes up among the
 *  pieces: each piece but those on the stone (the broken columns, the mossy stones, the fallen drums: the sweeps cross where each lies)
 *  with how near each of its pixels is (`near`, as his own layers' nearness), so that he and his tentacles hide them where they are in
 *  front; without the reeds in the water off the end where he has come up, under him (`shovel.left`, `shovel.right`). */
interface Pieces { pic: Pic; near: Float32Array }
interface Scenery { back: Pic; front: Pic; shovel: Record<'none' | 'left' | 'right', Pieces>; water: Uint8Array }
let SCENERY: Scenery | null = null;
function scenery(): Scenery {
  if (SCENERY) return SCENERY;
  const back = groundPic(CW, CH, CAM);
  const front = new Pic(CW, CH, false);
  const pieces = (): Pieces => ({ pic: new Pic(CW, CH, false), near: new Float32Array(CW * CH).fill(-Infinity) });
  const shovel = { none: pieces(), left: pieces(), right: pieces() };
  const put = (name: string, du: number, dv: number, f = 0, sh = 0): void => {
    const [x, y] = W(du, dv);
    const behind = x + y < VC;
    const [sx, sy] = P(CAM, x, y);
    for (const pic of [behind ? back : front]) {
      if (sh) pic.shadow(sx, sy, sh, 0.4);
      laySprite(pic, piece(name, f), sx, sy);
    }
    // (his shovel's: but what lies on the stone; and but the reeds off the end he has come up at)
    if (behind || onStone(x, y)) return;
    const off = du < -ARENA.half + 1 ? 'left' : du > ARENA.half - 1 ? 'right' : null;
    const one = new Pic(CW, CH, false);
    laySprite(one, piece(name, f), sx, sy);
    const yHis = dv * (32 / SEEN);
    for (const end of ['none', 'left', 'right'] as const) {
      if (off === end) continue;
      const P0 = shovel[end];
      for (let q = 0; q < CW * CH; q++) {
        if (one.d[q * 4 + 3] === 0) continue;
        const nr = yHis * 0.8660254 + Math.max(0, Math.round(sy) - Math.floor(q / CW)) * 0.5;
        if (nr < P0.near[q] && P0.pic.d[q * 4 + 3] > 0) continue;
        P0.near[q] = nr;
        for (let c = 0; c < 4; c++) P0.pic.d[q * 4 + c] = one.d[q * 4 + c];
      }
    }
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
  SCENERY = { back, front, shovel, water };
  return SCENERY;
}

// =============================================================================================
// HIS LAYERS, EACH PAINTED ONCE

/** Each layer painted on this frame: wide enough for all of him and his arms, deep enough for him lying low (in his picture's pixels). */
const LAYER = { w: 1100, h: 520, ax: 550, ay: 300, raw: true } as const;
/** A tentacle's layer: taller, for one lying slammed out across the stone toward the camera. */
const LAYER_ARM = { w: 1100, h: 660, ax: 550, ay: 300, raw: true } as const;
/** A tentacle layer's box: round its tube (as thick as it is at its root, and a margin), from its top down to the water under each part
 *  of it (its drips and what falls off it fall straight down): outside it no ray is cast, for there is nothing of it there. */
function armBox(L: EyeLayer, F: { w: number; h: number; ax: number; ay: number } = LAYER_ARM): [number, number, number, number] {
  let i0 = Infinity;
  let j0 = Infinity;
  let i1 = -Infinity;
  let j1 = -Infinity;
  for (const a of (L.pose as ColossusPose).arms ?? []) {
    const R = (a.r + 3) * SEEN;
    for (const q of a.path) {
      const i = F.ax + q[0] * SEEN;
      const j = F.ay + (q[1] * 0.5 - q[2] * (Math.sqrt(3) / 2)) * SEEN;
      const jw = F.ay + q[1] * 0.5 * SEEN;
      i0 = Math.min(i0, i - R);
      i1 = Math.max(i1, i + R);
      j0 = Math.min(j0, j - R);
      j1 = Math.max(j1, j + R, jw + 4);
    }
  }
  const P = 24;
  return [Math.max(0, Math.floor(i0 - P)), Math.max(0, Math.floor(j0 - P)), Math.min(F.w, Math.ceil(i1 + P)), Math.min(F.h, Math.ceil(j1 + P))];
}
const BOXES = new Map<EyeLayer, [number, number, number, number]>();
/** His shovel: him at an end, turned (`V` layers); a scraping tentacle's head and its body (`AH`, `AB`), painted where they lie across the
 *  stone's depth, at the front of the stone. */
const LAYER_SIDE = { w: 760, h: 800, ax: 360, ay: 460, raw: true } as const;
const LAYER_HEAD = { w: 1100, h: 540, ax: 550, ay: -60, raw: true } as const;
const LAYER_BODY_L = { w: 1300, h: 560, ax: -230, ay: -60, raw: true } as const;
const LAYER_BODY_R = { w: 1300, h: 560, ax: 1530, ay: -60, raw: true } as const;
const frameFor = (L: EyeLayer): { w: number; h: number; ax: number; ay: number; raw: true; box?: readonly [number, number, number, number] } => {
  if (L.key.startsWith('V')) return LAYER_SIDE;
  if (!L.key.startsWith('A')) return LAYER;
  let b = BOXES.get(L);
  const FR = L.key.startsWith('AH') ? LAYER_HEAD : L.key.startsWith('AB.l') ? LAYER_BODY_L : L.key.startsWith('AB.r') ? LAYER_BODY_R : LAYER_ARM;
  if (!b) {
    b = armBox(L, FR);
    if (BOXES.size > 4000) BOXES.clear();
    BOXES.set(L, b);
  }
  return { ...FR, box: b };
};
// (kept on the machine's memory disk, packed: only what of him there is, in the box round it)
const CACHE = process.env.EYE_CACHE || '/dev/shm/eye_moves/cache';
fs.mkdirSync(CACHE, { recursive: true });
// (what paints him: art/eye_colossus.ts up to its checks, which paint nothing; for every layer but his tongue's, without the painting
// of his tongue and eye, `tongueAt`, which only his tongue's layer asks)
const painterOf = (file: string): { all: string; rest: string } => {
  const all0 = new TextDecoder().decode(fs.readFileSync(file));
  const cut = all0.indexOf('// HIS ARMS CLEAR OF HIM AND OF THE STONE; HIS PARTS');
  const all = cut > 0 ? all0.slice(0, cut) : all0;
  const a = all.indexOf('  tongueAt(x: number');
  const b = all.indexOf('  /** His spittle and drool (`exact`');
  const rest = a > 0 && b > a ? all.slice(0, a) + all.slice(b) : all;
  return { all: crypto.createHash('sha1').update(all).digest('hex'), rest: crypto.createHash('sha1').update(rest).digest('hex') };
};
const PAINTER = painterOf('src/art/eye_colossus.ts');
const fileOf = (L: EyeLayer, src = L.key.startsWith('T') || L.key.startsWith('VT') ? PAINTER.all : PAINTER.rest): string => path.join(CACHE, `${L.key.replace(/[^A-Za-z0-9.]/g, '_')}_${crypto.createHash('sha1').update(src + JSON.stringify(L.pose) + JSON.stringify(frameFor(L))).digest('hex').slice(0, 14)}.bin`);
/** A layer: the box round what of him there is (x0, y0, w, h, on his picture), and in it each pixel's kind, colour, nearness, height
 *  over the water, fire, outline and material; his lights. */
interface Layer { x0: number; y0: number; w: number; h: number; px: Uint8Array; kind: Uint8Array; mat: Uint8Array; near: Float32Array; zh: Float32Array; fire: Uint8Array; seam: Uint8Array; lights: ColossusPicture['lights'] }
function save(file: string, c: ColossusPicture, FR: { w: number; h: number } = LAYER): void {
  const W0: number = FR.w;
  let x0: number = W0;
  let y0: number = FR.h;
  let x1 = -1;
  let y1 = -1;
  for (let j = 0; j < FR.h; j++) for (let i = 0; i < W0; i++) {
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
    save(file, paintColossus(L.pose as ColossusPose, frameFor(L)), frameFor(L));
    process.stdout.write(`  painted ${L.key} in ${((Date.now() - t0) / 1000).toFixed(1)} s\n`);
  }
  r = load(file);
  if (MEMO.size > 40) MEMO.clear();
  MEMO.set(file, r);
  return r;
}

// =============================================================================================
// THE FRAMES OF EACH MOVE

const MOVES = { lurk: EYE_LURK.frames, entrance: EYE_ENTRANCE.frames, stand: EYE_STAND.frames, p1: SHOTS.p1, p2: SHOTS.p2, fan: SHOTS.fan, s1: SHOVEL_FRAMES.s1, s2: SHOVEL_FRAMES.s2 } as const;
type Move = keyof typeof MOVES;
/** A frame of a move or of a tentacles' shot. */
const frameAt = (mv: Move, k: number): EyeFrame => (mv === 's1' || mv === 's2' ? shovelFrame(mv, k) : mv === 'p1' || mv === 'p2' || mv === 'fan' ? fightFrame(mv, k) : eyeFrame(mv, k));
function layersOf(F: EyeFrame): EyeLayer[] {
  return [F.jaws, F.spit, F.tongue, ...F.arms, ...F.smear].filter((L): L is EyeLayer => !!L);
}

// =============================================================================================
// THE WATER AND THE AIR ROUND HIM

const WATER: RGB = hex('#0e1612');
const FOAM: RGB[] = ['#1c2a22', '#2b3d32', '#3e5244', '#5a6e5c', '#7a8c76'].map(hex);
const SPRAY: RGB = hex('#a8b8a2');
const SCUM: RGB = hex('#4a4a2a');
/** Foam: wet, pale and creamy, from where it lies in shadow to where it catches the light. */
const CREAM: RGB[] = ['#4c5446', '#7c816c', '#a8a78c', '#cfc9aa', '#e6dfc2'].map(hex);

/** How far a point is out of the nearest of the round holes of a jittered grid of them (a cell across is 1; each hole's radius `r`
 *  times its own share): less than 0 inside one. */
function holes(x: number, y: number, r: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let m = 9;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = xi + dx;
      const cy = yi + dy;
      const d = Math.hypot(cx + 0.1 + 0.8 * h3(cx, cy, 0, s) - x, (cy + 0.1 + 0.8 * h3(cx, cy, 1, s) - y) * 1.15) - r * (0.55 + 0.9 * h3(cx, cy, 2, s));
      if (d < m) m = d;
    }
  }
  return m;
}
/** FOAM ON THE WATER at a point of it (his lengths, on the water; `dens` 0 none to 1 thick): wet foam, a mass of bubbles: thick, a
 *  clot of it with the round holes of its bubbles in it; thinner, the holes grown till the foam is a lace of curved strands between
 *  them; thinnest, bits of it adrift; never even (clumps and gaps); lit toward his far side, shadowed in the holes' rims. 0 nothing
 *  there, else 1 to 4: how pale (CREAM). */
function lace(X: number, Y: number, dens: number, s: number): number {
  if (dens <= 0.02) return 0;
  // (cells as big on the water across as along it: seen at a slant, each twice as wide as it is tall on the screen, about 12 pixels)
  const C = 10;
  const clump = vn(X * 0.022 + s * 7, Y * 0.03, s + 3);
  const d = Math.min(1, dens * (0.35 + 1.1 * clump));
  if (d < 0.12) return 0;
  const r = 0.22 + 0.72 * (1 - d);
  // (big bubbles and small among them; the foam drawn out a little along the way it drifts)
  const both = (x: number, y: number): number => holes(x / C, y / C, r, s);
  const m = both(X, Y);
  if (m < 0) return 0;
  // (the light from his far side: is the foam just beyond (up the screen) thicker than here?)
  const mu = both(X, Y - 2.5);
  const lit = mu > m + 0.01;
  if (m < 0.05) return lit ? 2 : 1;
  if (m < 0.14) return lit ? 3 : 2;
  return lit ? 4 : 3;
}
/** A BUBBLE on the water (canvas pixel of its foot, its radius in pixels across, how far through its life): a clear glossy dome
 *  swelling, the water's skin over it catching the light along its upper left, a glint, its lower edge dark; bursting, a ring of
 *  foam thrown out and spreading, drops jumping up and falling back. */
function bubble(pic: Pic, ii: number, jj: number, R: number, p: number, seed: number, glowK: number): void {
  if (p < 0.78) {
    const u = p / 0.78;
    const r = R * (0.35 + 0.65 * Math.sqrt(u)) * (1 + 0.06 * Math.sin(u * 19 + seed));
    const rx = r;
    const ry = r * 0.82;
    // (its foot: the water dimpled dark round it)
    for (let di = -Math.ceil(rx + 2); di <= Math.ceil(rx + 2); di++) {
      const e = Math.abs(di) / (rx + 2);
      if (e <= 1) pic.over(ii + di, jj + 1, WATER[0], WATER[1], WATER[2], 160 * (1 - e));
    }
    for (let dj = -Math.ceil(ry); dj <= 0; dj++) {
      for (let di = -Math.ceil(rx); di <= Math.ceil(rx); di++) {
        const d = Math.hypot(di / rx, dj / ry);
        if (d > 1.04) continue;
        const rim = d > 1 - 1.3 / Math.max(2, rx);
        // (which way it faces: toward the upper left is the light)
        const lit = -(di / rx) * 0.7 - (dj / ry) * 0.7;
        let c: RGB;
        let a: number;
        if (rim) {
          c = lit > 0.2 ? CREAM[3] : lit > -0.4 ? FOAM[4] : FOAM[3];
          a = lit > 0.2 ? 240 : 200;
        } else if (lit > 0.6 && d > 0.6 && d < 0.82) {
          // (the crescent of light inside its upper left)
          c = CREAM[2];
          a = 190;
        } else if (lit < -0.5 && d > 0.6) {
          c = glowK > 0.1 ? IRIS[1] : FOAM[2];
          a = glowK > 0.1 ? 120 * glowK : 150;
        } else {
          // (the clear film: the dark water seen through it)
          c = FOAM[0];
          a = 110;
        }
        pic.over(ii + di, jj + dj, c[0], c[1], c[2], a);
      }
    }
    if (rx >= 2) {
      const gi = Math.round(ii - rx * 0.4);
      const gj = Math.round(jj - ry * 0.6);
      pic.over(gi, gj, 236, 240, 222, 255);
      if (rx >= 4) pic.over(gi + 1, gj, 214, 220, 200, 220);
    }
  } else {
    // (it bursts: a ring of foam thrown out and spreading, broken; drops jumping up and falling back)
    const s = (p - 0.78) / 0.22;
    const Rr = R * (1 + 2.2 * Math.sqrt(s));
    for (let a2 = 0; a2 < 32; a2++) {
      if (h3(seed, a2, 9, 527) < 0.25 + 0.4 * s) continue;
      const ang = (a2 / 32) * TAU;
      const c = s < 0.4 ? CREAM[3] : CREAM[2];
      pic.over(Math.round(ii + Math.cos(ang) * Rr), Math.round(jj + Math.sin(ang) * Rr * 0.45), c[0], c[1], c[2], 230 * (1 - s));
    }
    for (let d2 = 0; d2 < 6; d2++) {
      const ang = h3(seed, d2, 3, 528) * TAU;
      const v = 0.6 + 0.8 * h3(seed, d2, 4, 529);
      const out = R * (0.5 + 1.4 * s) * v;
      const up = R * 2.6 * v * s * (1 - s) * 4;
      pic.over(Math.round(ii + Math.cos(ang) * out), Math.round(jj - up + Math.sin(ang) * out * 0.4), CREAM[4][0], CREAM[4][1], CREAM[4][2], 240 * (1 - s * 0.6));
    }
  }
}
const RIM: RGB = hex(ENEMY_RIM);
const FIRE3: RGB = hex(FLAME[3]);
const FIRE2: RGB = hex(FLAME[2]);
const MELT = CO_MELT as unknown as RGB[];
const SPIT = CO_SPIT as unknown as RGB[];
const SLIME = CO_SLIME as unknown as RGB[];
const IRIS = CO_IRIS as unknown as RGB[];
const SHEEN = CO_SHEEN as unknown as RGB;
/** His ichor: dark, the blood of a thing of the deep: maroon to black, wet (never the friend's cyan). */
const ICHOR: RGB[] = ARM_COLOURS.ichor.map(hex);
/** A chip of the stone, and the stone's cracks. */
const STONE_LIT: RGB = hex(ARM_COLOURS.stoneLit);
const STONE_DARK: RGB = hex(ARM_COLOURS.stoneDark);
const STONE_MID: RGB = hex(ARM_COLOURS.stoneMid);
const MOSS6: RGB = hex(ARM_COLOURS.moss);
const CRACK_C: RGB = hex(ARM_COLOURS.crack);
const SPARK_C: RGB[] = SHOVEL_COLOURS.spark.map(hex);

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
/** What flies: 0 a drop of his spittle, 1 a gob of his slime, 2 a drop of water, 3 a sheet of his slime, tumbling. */
interface Flyer { x: number; y: number; z: number; vx: number; vy: number; vz: number; t0: number; kind: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; size: number; seed?: number }
/** A CHUNK OF THE PAVING (kind 6) flung up by a slam: where it is `s` seconds after it was thrown, tumbling, arcing, bouncing twice on
 *  the stone (each bounce a third as high, sliding on), settling and lying; how far it has turned; whether it has come to rest. */
function chunkAt(f: Flyer, s: number): { x: number; y: number; z: number; turn: number; rest: boolean } {
  let x = f.x;
  let y = f.y;
  let z = f.z;
  let vx = f.vx;
  let vy = f.vy;
  let vz = f.vz;
  let t = s;
  let spin = 7 + 6 * h3(f.seed ?? 0, 1, 1, 7871);
  let turn = (f.seed ?? 0) * 1.1;
  for (let b = 0; b < 3; b++) {
    const land = (vz + Math.sqrt(vz * vz + 2 * FALL_G * Math.max(0, z))) / FALL_G;
    if (t < land || b === 2) {
      if (b === 2) return { x, y, z: 0, turn, rest: true };
      return { x: x + vx * t, y: y + vy * t, z: Math.max(0, z + vz * t - 0.5 * FALL_G * t * t), turn: turn + spin * t, rest: false };
    }
    x += vx * land;
    y += vy * land;
    turn += spin * land;
    const vLand = vz - FALL_G * land;
    vz = -vLand * 0.35;
    vx *= 0.5;
    vy *= 0.5;
    spin *= 0.4;
    z = 0;
    t -= land;
  }
  return { x, y, z: 0, turn, rest: true };
}
/** Where a flyer is `s` seconds after it was thrown (and whether it has met the water). */
function flyAt(f: Flyer, s: number): [number, number, number] {
  return [f.x + f.vx * s, f.y + f.vy * s, f.z + f.vz * s - 0.5 * FALL_G * s * s];
}
function landOf(f: Flyer): number {
  // (z + vz s - g s^2 / 2 = 0)
  const a = 0.5 * FALL_G;
  return (f.vz + Math.sqrt(f.vz * f.vz + 4 * a * f.z)) / (2 * a);
}
/** THE ROAR: all through his opening, slime and spittle flung everywhere out of his maw and off his jaws as they peel apart. A fan of
 *  spittle spray blown out of his throat by the roar, toward you and up, in gusts with its pulses; gobs and sheets of slime flung every
 *  way, arcing high across the screen and raining down into the water; a few landing on the stone before the hero. */
function roarFlyers(): Flyer[] {
  const out: Flyer[] = [];
  // (when each is thrown, seconds from the first parting: thickest as he tears open, in gusts with his roar's pulses)
  const when = (n: number, s: number): number => {
    const u = h3(n, 0, 0, s) ** 1.6 * 0.85;
    return u + 0.03 * Math.sin(u * 37);
  };
  for (let n = 0; n < 460; n++) {
    // (spray out of his throat: a fan toward you, up and out)
    const a = (h3(n, 1, 0, 400) - 0.5) * 2.4;
    const up = 0.1 + 0.85 * h3(n, 2, 0, 401);
    const sp = 380 + 520 * h3(n, 3, 0, 402);
    out.push({
      x: (h3(n, 5, 0, 404) - 0.5) * 40, y: -10 + 40 * h3(n, 6, 0, 405), z: 50 + 60 * h3(n, 7, 0, 406),
      vx: Math.sin(a) * sp * Math.cos(up), vy: Math.cos(a) * sp * Math.cos(up), vz: sp * Math.sin(up) + 60,
      t0: when(n, 407), kind: 0, size: h3(n, 9, 0, 408) < 0.3 ? 2 : 1, seed: n,
    });
  }
  for (let n = 0; n < 150; n++) {
    // (gobs of slime off his jaws' inner edges and out of his maw: every way, arcing high)
    const side = h3(n, 1, 1, 410) < 0.5 ? -1 : 1;
    const a = h3(n, 2, 1, 411) < 0.6 ? (h3(n, 3, 1, 412) - 0.5) * 2.6 : h3(n, 3, 1, 412) * TAU;
    const up = 0.45 + 0.8 * h3(n, 4, 1, 413);
    const sp = 260 + 360 * h3(n, 5, 1, 414);
    const hgt = 20 + 150 * h3(n, 6, 1, 415);
    out.push({
      x: side * (8 + 40 * h3(n, 7, 1, 416) + hgt * 0.35), y: -20 + 50 * h3(n, 8, 1, 417), z: hgt,
      vx: Math.sin(a) * sp * Math.cos(up) + side * 60, vy: Math.cos(a) * sp * Math.cos(up), vz: sp * Math.sin(up),
      t0: when(n, 418), kind: 1, size: 2 + 3 * h3(n, 9, 1, 419), seed: 1000 + n,
    });
  }
  for (let n = 0; n < 26; n++) {
    // (sheets of slime torn off him, tumbling)
    const side = n % 2 ? -1 : 1;
    const a = (h3(n, 1, 2, 420) - 0.5) * 3.2;
    const up = 0.6 + 0.7 * h3(n, 2, 2, 421);
    const sp = 240 + 260 * h3(n, 3, 2, 422);
    const hgt = 40 + 130 * h3(n, 4, 2, 423);
    out.push({
      x: side * (20 + 30 * h3(n, 5, 2, 424) + hgt * 0.3), y: -10 + 40 * h3(n, 6, 2, 425), z: hgt,
      vx: Math.sin(a) * sp * Math.cos(up) + side * 80, vy: Math.cos(a) * sp * Math.cos(up), vz: sp * Math.sin(up),
      t0: when(n, 426) * 0.7, kind: 3, size: 7 + 8 * h3(n, 7, 2, 427), seed: 2000 + n,
    });
  }
  for (let n = 0; n < 14; n++) {
    // (some landing on the stone before the hero: thrown high, coming down on it round him)
    const tx = HERO_SPOT[0] + (h3(n, 1, 3, 430) - 0.5) * 300;
    const ty = STONE.edge + 10 + 45 * h3(n, 2, 3, 431);
    const tau = 1.0 + 0.6 * h3(n, 3, 3, 432);
    const x0 = (h3(n, 4, 3, 433) - 0.5) * 60;
    const y0 = 10;
    const z0 = 60 + 60 * h3(n, 5, 3, 434);
    out.push({
      x: x0, y: y0, z: z0, vx: (tx - x0) / tau, vy: (ty - y0) / tau, vz: (0.5 * FALL_G * tau * tau - z0) / tau,
      t0: 0.08 + 0.4 * h3(n, 6, 3, 435), kind: n % 3 === 0 ? 3 : 1, size: n % 3 === 0 ? 8 + 5 * h3(n, 7, 3, 436) : 2.5 + 2.5 * h3(n, 7, 3, 436), seed: 3000 + n,
    });
  }
  return out;
}
/** A TENTACLE'S BURST: the crown of water thrown up round it, droplets arcing out and back. */
function burstFlyers(x: number, y: number, seed: number, big = 1): Flyer[] {
  const out: Flyer[] = [];
  for (let n = 0; n < 220 * big; n++) {
    // (a crown: a wall of water thrown nearly straight up all round it, breaking into drops; and drops flung further out; him bursting
    // up, `big`: wider and higher, and slime and gobs of him in it)
    const a = h3(n, seed, 1, 410) * TAU;
    const crown = n < 140 * big;
    const r = (crown ? 50 + 16 * h3(n, seed, 2, 411) : 46 + 24 * h3(n, seed, 2, 411)) * (big > 1 ? 2.6 : 1);
    const sp = (crown ? 40 + 70 * h3(n, seed, 3, 412) : 120 + 260 * h3(n, seed, 3, 412)) * (big > 1 ? 1.4 : 1);
    const vz = (crown ? 320 + 160 * h3(n, seed, 4, 413) : 240 + 320 * h3(n, seed, 4, 413)) * (big > 1 ? 1.25 : 1);
    const kind = big > 1 && n % 9 === 0 ? 1 : 2;
    out.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.8, z: 2, vx: Math.cos(a) * sp * 0.5, vy: Math.sin(a) * sp * 0.4, vz, t0: ((crown ? 1 : 3) * h3(n, seed, 5, 414)) / EYE_FPS, kind, size: kind === 1 ? 2 + 2.5 * h3(n, seed, 6, 415) : 1 + (h3(n, seed, 6, 415) < 0.5 ? 1 : 0), seed: seed * 991 + n });
  }
  return out;
}
const ROAR = roarFlyers();

// =============================================================================================
// THE TENTACLES' EFFECTS (the game's, drawn over the stone and the water as his water is): art/eye_arms.ts says where and when

/** A point of a tentacle's line (his space): from its root (x, y) along `ang`, `a` along, `b` across. */
const onLine = (x: number, y: number, ang: number, a: number, b: number): [number, number] => [x + a * Math.sin(ang) - b * Math.cos(ang), y + a * Math.cos(ang) + b * Math.sin(ang)];
/** The game's warning dot (2 by 1 game pixels). */
function warnDot(pic: Pic, i: number, j: number, c: RGB, a: number): void {
  const x = Math.round(i / 2) * 2;
  const y = Math.round(j / 2) * 2;
  for (let dx = 0; dx < 4; dx++) for (let dy = 0; dy < 2; dy++) pic.over(x + dx, y + dy, c[0], c[1], c[2], a);
}
const WARN_SHADE: RGB = hex(ARM_COLOURS.warnShade);
const FL2: RGB = hex(ARM_COLOURS.warnEdge[0]);
const FL3: RGB = hex(ARM_COLOURS.warnEdge[1]);
/**
 * THE GAME'S WARNING ON THE FLOOR (render/act1_fx/garden_warn.ts, the Hush's warnings' own): the edge of what will be struck a dashed
 * line of the enemy's pink, its dashes marching on as the blow comes, brightening; the floor inside darkening, a sparse dither growing
 * thicker. `corner(u, v)` the floor point (his space) at u, v of it (each 0 to 1); `area` in the arena's tiles; on the stone only.
 */
function drawWarn(pic: Pic, water: Uint8Array, corner: (u: number, v: number) => [number, number], lenU: number, lenV: number, k: number, t: number): void {
  const shown = sm(0, 0.25, k);
  const tileL = 32 / SEEN;
  const area = (lenU / tileL) * (lenV / tileL);
  const n = Math.round(area * 60);
  const onStoneAt = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < CW && j < CH && water[Math.round(j) * CW + Math.round(i)] === 0;
  for (let q = 0; q < n; q++) {
    if (h3(q, 1, 0, 7721) > 0.3 + 0.5 * k) continue;
    const [x, y] = corner(h3(q, 2, 0, 7722), h3(q, 3, 0, 7723));
    const [i, j] = onCanvas(x, y, 0);
    if (!onStoneAt(i, j)) continue;
    warnDot(pic, i, j, WARN_SHADE, 255 * 0.35 * shown * (0.5 + 0.5 * k));
  }
  // (its edge, dashed and marching)
  const STEP = 0.07 * tileL;
  const pts: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1]];
  let jj = 0;
  for (let e = 0; e < 4; e++) {
    const [u0, v0] = pts[e];
    const [u1, v1] = pts[(e + 1) % 4];
    const len = Math.hypot((u1 - u0) * lenU, (v1 - v0) * lenV);
    const m = Math.max(1, Math.round(len / STEP));
    for (let q = 0; q < m; q++, jj++) {
      if ((Math.floor(jj / 3 - t * 9) & 1) === 0) continue;
      const w = q / m;
      const [x, y] = corner(u0 + (u1 - u0) * w, v0 + (v1 - v0) * w);
      const [i, j] = onCanvas(x, y, 0);
      if (!onStoneAt(i, j)) continue;
      warnDot(pic, i, j, k > 0.75 ? FL3 : FL2, 255 * shown * (0.45 + 0.55 * k));
    }
  }
}
/** A crack in the stone from a point (his space), the way `ang`, `len` long as far as it has run, jagged, a branch off it. */
function crack(pic: Pic, water: Uint8Array, top: Top, x: number, y: number, ang: number, len: number, seed: number, a: number): void {
  let px = x;
  let py = y;
  let dir = ang;
  const step = 2.2;
  for (let s2 = 0; s2 < len; s2 += step) {
    dir += (h3(seed, Math.floor(s2 / 6), 1, 7801) - 0.5) * 0.9;
    const nx = px + Math.sin(dir) * step;
    const ny = py + Math.cos(dir) * step;
    const [i0, j0] = onCanvas(px, py, 0);
    const [i1, j1] = onCanvas(nx, ny, 0);
    const m = Math.max(1, Math.round(Math.hypot(i1 - i0, j1 - j0)));
    for (let q = 0; q <= m; q++) {
      const i = Math.round(i0 + ((i1 - i0) * q) / m);
      const j = Math.round(j0 + ((j1 - j0) * q) / m);
      if (i < 1 || j < 1 || i >= CW - 1 || j >= CH - 1 || water[j * CW + i]) continue;
      if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] >= -0.5) continue;
      // (the crack dark, its lower lip catching the light)
      const w = s2 < len * 0.35 ? 2 : 1;
      for (let d = 0; d < w; d++) pic.over(i + d, j, CRACK_C[0], CRACK_C[1], CRACK_C[2], 230 * a);
      pic.over(i, j + 1, STONE_LIT[0], STONE_LIT[1], STONE_LIT[2], 110 * a);
    }
    if (Math.floor(s2 / step) === 4 && h3(seed, 9, 2, 7802) < 0.7) crack(pic, water, top, nx, ny, dir + (h3(seed, 8, 3, 7803) < 0.5 ? 0.9 : -0.9), len * 0.4, seed + 101, a);
    px = nx;
    py = ny;
  }
}
/** WHAT HIS SHOVEL THROWS (the game's, drawn over): grit hopping on the stone's end as it shudders (the tell); the crown of water and
 *  slime as he bursts up; spittle, spray and gobs bursting out of his maw as his jaws clash (the snap); grit, slime and pale chips of the
 *  stone thrown off each scraping tip, behind it; slime off the Warrior where he is struck. Each with how long since it was thrown. */
function shovelFlyers(F: EyeFrame): Array<[Flyer, number]> {
  const out: Array<[Flyer, number]> = [];
  const fx = F.sfx;
  if (!fx) return out;
  const e: End = F.move === 's1' ? 'left' : 'right';
  const s = sideOf(e);
  const k = F.k;
  const t = k / EYE_FPS;
  const xEnd = s * STONE_BOX.x1;
  if (fx.tell !== null) {
    // (grit hopping on the stone's end as it shudders, more and higher as the tell goes on)
    for (let n = 0; n < 46; n++) {
      if (h3(n, 1, 0, 7901) > 0.25 + 0.75 * fx.tell) continue;
      const per = 0.22 + 0.2 * h3(n, 2, 0, 7902);
      const ph = t / per + h3(n, 3, 0, 7903);
      const rn = Math.floor(ph);
      const x = xEnd - s * 70 * h3(n, rn, 4, 7904) ** 1.4;
      const y = STONE_BOX.y0 + 8 + (STONE_BOX.y1 - STONE_BOX.y0 - 16) * h3(n, rn, 5, 7905);
      out.push([{ x, y, z: 0.5, vx: 0, vy: 0, vz: 40 + 70 * fx.tell * h3(n, rn, 6, 7906), t0: 0, kind: 5, size: 1, seed: n * 13 + rn }, (ph - rn) * per * 0.55]);
    }
  }
  if (fx.burst !== null && fx.burst < 2.2) for (const f of burstFlyers(fx.at[0], fx.at[1], 7 + (e === 'left' ? 0 : 1), 2)) out.push([f, fx.burst - f.t0]);
  if (fx.snap !== null && fx.snap < 2) {
    // (out of his maw as his jaws clash: spittle in strings and drops, spray, gobs and sheets of slime, flung along the stone and up)
    // (where his teeth clash: at the front of his jaws, out over the stone's end)
    const x0 = s * STONE_BOX.x1 - s * 80;
    for (let n = 0; n < 180; n++) {
      const kind = (n % 17 === 0 ? 3 : n % 5 === 0 ? 1 : n % 2 ? 0 : 2) as 0 | 1 | 2 | 3;
      const yy = fx.at[1] + (h3(n, 1, 0, 7911) - 0.5) * 160;
      const sp = 90 + 300 * h3(n, 2, 0, 7912);
      const a = (h3(n, 3, 0, 7913) - 0.5) * 2.4;
      out.push([{ x: x0, y: yy, z: 110 + 80 * h3(n, 4, 0, 7914), vx: -s * Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, vz: 60 + 260 * h3(n, 5, 0, 7915), t0: (3 * h3(n, 6, 0, 7916)) / EYE_FPS, kind, size: kind === 3 ? 5 + 5 * h3(n, 7, 0, 7917) : kind === 1 ? 2 + 2.5 * h3(n, 7, 0, 7917) : 1 + (h3(n, 7, 0, 7917) < 0.4 ? 1 : 0), seed: 7900 + n }, fx.snap]);
    }
    // (splinters of his teeth, snapped off as they clash, flung out and falling on the stone)
    for (let n = 0; n < 12; n++) {
      const a = (h3(n, 1, 0, 7918) - 0.5) * 2;
      const sp = 120 + 220 * h3(n, 2, 0, 7919);
      out.push([{ x: x0 - s * 20, y: fx.at[1] + (h3(n, 3, 0, 7920) - 0.5) * 120, z: 120 + 60 * h3(n, 4, 0, 7921), vx: -s * Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.5, vz: 80 + 200 * h3(n, 5, 0, 7922), t0: 0, kind: 8, size: 1 + Math.floor(2 * h3(n, 6, 0, 7923)), seed: 7940 + n }, fx.snap]);
    }
  }
  // (off each scraping tip, behind it: thrown up and back, grit, slime, pale chips of the stone)
  SCRAPERS.forEach((Sc, i) => {
    for (let back = 0; back < 14; back++) {
      const A = scraperAt(e, i, k - back);
      if (!A || A.is !== 'sweep') continue;
      const tp = scrapeAt(e, Sc.edge, ((k - back) % 30) / 30, A.X);
      if (Math.abs(tp[0]) > STONE_BOX.x1) continue;
      for (let n = 0; n < 5; n++) {
        const seed = (k - back) * 31 + n * 7 + i * 101;
        const kind = (n === 0 ? 1 : n < 3 ? 5 : 0) as 0 | 1 | 5;
        const sp = 60 + 160 * h3(seed, 1, 0, 7921);
        out.push([{ x: tp[0], y: tp[1] + (h3(seed, 2, 0, 7922) - 0.5) * 16, z: 3, vx: -s * sp, vy: (h3(seed, 3, 0, 7923) - 0.5) * 120, vz: 60 + 170 * h3(seed, 4, 0, 7924), t0: 0, kind, size: kind === 1 ? 1.4 + 1.6 * h3(seed, 5, 0, 7925) : kind === 5 ? 1 + Math.floor(1.6 * h3(seed, 5, 0, 7925)) : 1, seed }, back / EYE_FPS]);
      }
      // (sparks struck off the stone: fast, low, short-lived streaks, fanning back from the tip)
      if (back < 10) for (let n = 0; n < 4; n++) {
        const seed = (k - back) * 37 + n * 11 + i * 211;
        const sp = 220 + 300 * h3(seed, 1, 0, 7926);
        const a = (h3(seed, 2, 0, 7927) - 0.5) * 1.6;
        out.push([{ x: tp[0], y: tp[1] + (h3(seed, 3, 0, 7928) - 0.5) * 10, z: 2, vx: -s * Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, vz: 30 + 140 * h3(seed, 4, 0, 7929), t0: 0, kind: 7, size: 1, seed }, back / EYE_FPS]);
      }
    }
  });
  if (fx.hit && fx.hit.s < 1.4) {
    for (let n = 0; n < 40; n++) {
      const a = h3(n, 1, 0, 7931) * TAU;
      const sp = 60 + 160 * h3(n, 2, 0, 7932);
      out.push([{ x: fx.hit.x, y: fx.hit.y, z: 30, vx: Math.cos(a) * sp - s * 120, vy: Math.sin(a) * sp * 0.6, vz: 80 + 200 * h3(n, 3, 0, 7933), t0: 0, kind: n % 3 ? 2 : 1, size: n % 3 ? 1 : 2 + 2 * h3(n, 4, 0, 7934), seed: 7930 + n }, fx.hit.s]);
    }
  }
  return out;
}
/** THE WATER POURING OFF HIM AS HE BURSTS UP AT THE END (his shovel; art/eye_shovel.ts `pourSheet`, `pourRope`): sheets of black swamp
 *  water sliding down him, their lips catching the light; ropes of it pouring off where he overhangs the water, wavering, breaking into
 *  gobs and drops, slime and weed among them, crashing into foam round his base; thinning as he roars. */
function shovelPour(pic: Pic, F: EyeFrame, top: Top, water: Uint8Array): void {
  const fx = F.sfx as NonNullable<EyeFrame['sfx']>;
  const k = F.k;
  const p = fx.pour;
  const age = (k - SHOVEL.burst[0]) / EYE_FPS;
  const n = CW * CH;
  // (the sheets, over him above the water)
  for (let q = 0; q < n; q++) {
    if (top.who[q] < 0 || top.who[q] > 2 || top.z[q] < -0.5) continue;
    const i = q % CW;
    const sh = pourSheet(i, top.jp[q], k);
    if (!sh) continue;
    const j = (q / CW) | 0;
    // (a film of black water darkening him; its leading lip a bead of light here and there, not a line)
    pic.over(i, j, WATER[0], WATER[1], WATER[2], (sh === 1 ? 70 : 120) * (0.4 + 0.6 * p));
    if (sh === 3) {
      const b = h3(i, top.jp[q], 0, 7961);
      if (b < 0.22) pic.over(i, j, SPRAY[0], SPRAY[1], SPRAY[2], 170 * p + 40);
      else if (b < 0.5) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 110 * p + 20);
    }
  }
  // (the ropes: off his overhangs, where water is under him, every so often along them)
  const used = new Uint8Array(CW);
  for (let j = 1; j < CH - 1; j++) for (let i = 2; i < CW - 2; i++) {
    const q = j * CW + i;
    if (top.who[q] < 0 || top.who[q] > 1 || top.z[q] < 4) continue;
    const below = q + CW;
    if (top.who[below] >= 0 || !water[below]) continue;
    if (used[i] || h3(i, j, 0, 7960) > 0.12 * (0.3 + 0.7 * p)) continue;
    for (let d = -4; d <= 4; d++) if (i + d >= 0 && i + d < CW) used[i + d] = 1;
    const len = Math.round(top.z[q]);
    const seed = i * 7 + j * 13;
    const nr = top.near[q];
    for (const B of pourRope(seed, len, age, p)) {
      const ci = i + B.di;
      const cj = j + 1 + B.dj;
      const c = B.kind === 'lit' ? FOAM[3] : B.kind === 'slime' ? SLIME[3] : B.kind === 'weed' ? MOSS6 : B.kind === 'foam' ? FOAM[4] : WATER;
      const rr = Math.max(0.5, B.r);
      for (let dj = -Math.ceil(rr); dj <= Math.ceil(rr); dj++) for (let di = -Math.ceil(rr); di <= Math.ceil(rr); di++) {
        if (di * di + dj * dj * 0.6 > rr * rr + 0.3) continue;
        const x = Math.round(ci + di);
        const y = Math.round(cj + dj);
        if (x < 0 || y < 0 || x >= CW || y >= CH) continue;
        const qq = y * CW + x;
        // (behind what of him is in front of it)
        if (top.who[qq] >= 0 && top.z[qq] >= -0.5 && top.near[qq] > nr + 1) continue;
        // (a water drop dark, its lit side to the light)
        const cc = B.kind === 'water' && di < 0 && dj < 0 ? FOAM[2] : c;
        pic.over(x, y, cc[0], cc[1], cc[2], B.kind === 'foam' ? 200 * p + 40 : 235);
      }
    }
  }
}
/** UNDER HIS SHOVEL, on the stone and the water: the lines the scraping tips score in the stone (grooves, slime in them, fading once each
 *  is off the stone); the ring of foam thrown out over the water as he bursts up. */
function shovelUnder(pic: Pic, F: EyeFrame, top: Top, water: Uint8Array, t: number): void {
  const fx = F.sfx as NonNullable<EyeFrame['sfx']>;
  // (each tip's gouges in the stone along its own path: short ragged scratches side by side, dark in the stone with a lit lower lip, grit
  // out of them, a wet smear of slime over them, fading)
  const onStoneFree = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < CW - 1 && j < CH - 1 && !water[j * CW + i] && !(top.who[j * CW + i] >= 0 && top.z[j * CW + i] >= -0.5);
  for (const sc of fx.scores) for (const M of scoreMarks(sc.seed, sc.pts)) {
    if (M.a <= 0) continue;
    const [i0, j0] = onCanvas(M.x0, M.y0, 0);
    const [i1, j1] = onCanvas(M.x1, M.y1, 0);
    if (M.kind === 'grit') {
      const i = Math.round(i0);
      const j = Math.round(j0);
      if (onStoneFree(i, j)) pic.over(i, j, STONE_LIT[0], STONE_LIT[1], STONE_LIT[2], 200 * M.a);
      continue;
    }
    const m = Math.max(1, Math.round(Math.hypot(i1 - i0, j1 - j0)));
    for (let q = 0; q <= m; q++) {
      const i = Math.round(i0 + ((i1 - i0) * q) / m);
      const j = Math.round(j0 + ((j1 - j0) * q) / m);
      if (M.kind === 'slime') {
        // (the smear: a wet sheen, a few pixels across, broken)
        for (let d = -Math.round(M.w / 2); d <= Math.round(M.w / 2); d++) {
          if (!onStoneFree(i, j + d) || vn(i * 0.25, (j + d) * 0.4, sc.seed + 7951) < 0.45) continue;
          const c = SLIME[d < 0 ? 3 : 2];
          pic.over(i, j + d, c[0], c[1], c[2], 90 * M.a);
        }
        continue;
      }
      // (a gouge: ragged, thicker in its middle, its ends thin)
      const mid = 1 - Math.abs(q / m - 0.5) * 2;
      if (!onStoneFree(i, j) || (q > 0 && q < m && vn(i * 0.6, j * 0.6, sc.seed + 7952) < 0.12)) continue;
      pic.over(i, j, CRACK_C[0], CRACK_C[1], CRACK_C[2], 220 * M.a);
      if (M.w > 1 && mid > 0.4 && onStoneFree(i, j - 1)) pic.over(i, j - 1, CRACK_C[0], CRACK_C[1], CRACK_C[2], 160 * M.a);
      if (onStoneFree(i, j + 1)) pic.over(i, j + 1, STONE_LIT[0], STONE_LIT[1], STONE_LIT[2], 100 * M.a);
    }
  }
  if (fx.burst !== null && fx.burst < 1.8) {
    const sB = fx.burst;
    const R = 150 + 300 * sB;
    const [ci, cj] = onCanvas(fx.at[0], fx.at[1], 0);
    for (let j = Math.floor(cj - R / R3 - 6); j <= cj + R / R3 + 6; j++) for (let i = Math.floor(ci - R * SEEN - 6); i <= ci + R * SEEN + 6; i++) {
      if (i < 0 || j < 0 || i >= CW || j >= CH || !water[j * CW + i]) continue;
      // (on the water round him: hidden wherever he is, over it or under it)
      if (top.who[j * CW + i] >= 0) continue;
      const [X, Y] = waterAt(i, j);
      const d = Math.hypot(X - fx.at[0], Y - fx.at[1]);
      const lead = (d - R) / (3 + 7 * sB);
      if (Math.abs(lead) < 1 && vn(X * 0.05, Y * 0.05 + sB * 2, 7943) > 0.25 + 0.35 * sB) {
        const c = lead > 0.3 ? SPRAY : lead > -0.4 ? FOAM[4] : FOAM[2];
        pic.over(i, j, c[0], c[1], c[2], 230 * (1 - sB / 1.8));
      } else if (d < R - 6 && vn(Math.atan2(Y - fx.at[1], X - fx.at[0]) * 11, d * 0.03 - sB * 3, 7944) > 0.8) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 160 * (1 - sB / 1.8));
    }
  }
  void t;
}
/** THE STONE BROKEN ALONG A SLAM'S LINE (the game's, drawn over): cracks split along both sides of where it lay, broken across it
 *  every so often; slabs of the paving lifted at an edge and tipped, their lit edges up, a dark gap under them. */
function brokenAlong(pic: Pic, water: Uint8Array, top: Top, h: ArmFx['hits'][number], a: number, grow: number): void {
  const len = h.a1 - h.a0;
  for (const side of [-1, 1]) for (let c = 0; c < Math.ceil(len / 60); c++) {
    const along = h.a0 + c * 60 + 6 * h3(c, h.seed + side, 1, 7881);
    const [x, y] = onLine(h.x, h.y, h.ang, along, side * (LINE.wid / 2 + 3));
    crack(pic, water, top, x, y, h.ang + side * 0.12, 64 * grow, h.seed * 13 + c * 2 + (side > 0 ? 1 : 0), a);
  }
  for (let c = 0; c < Math.ceil(len / 45); c++) {
    const along = h.a0 + 20 + c * 45 + 10 * h3(c, h.seed, 2, 7882);
    const [x, y] = onLine(h.x, h.y, h.ang, along, -(LINE.wid / 2 + 6));
    crack(pic, water, top, x, y, h.ang + Math.PI / 2 + (h3(c, h.seed, 3, 7883) - 0.5) * 0.5, (LINE.wid + 12) * grow, h.seed * 17 + c, a);
  }
  // (slabs lifted and tipped beside it)
  for (let c = 0; c < Math.ceil(len / 50); c++) {
    const along = h.a0 + 24 + c * 50 + 20 * h3(c, h.seed, 4, 7884);
    const side = h3(c, h.seed, 5, 7885) < 0.5 ? -1 : 1;
    const [x, y] = onLine(h.x, h.y, h.ang, along, side * (LINE.wid / 2 + 9));
    const [ci, cj] = onCanvas(x, y, 0);
    const w = Math.round(7 + 6 * h3(c, h.seed, 6, 7886));
    const lift = Math.round(3 + 3 * h3(c, h.seed, 7, 7887));
    for (let di = -w; di <= w; di++) for (let dj = -Math.ceil(w * 0.5); dj <= Math.ceil(w * 0.5); dj++) {
      if (Math.abs(di) / w + Math.abs(dj) / (w * 0.5) > 1.05) continue;
      const i = Math.round(ci + di);
      const j = Math.round(cj + dj - lift * (0.5 + 0.5 * di / w) * grow);
      if (i < 1 || j < 1 || i >= CW - 1 || j >= CH - 1 || water[j * CW + i]) continue;
      if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] >= -0.5) continue;
      const rim = Math.abs(di) / w + Math.abs(dj) / (w * 0.5) > 0.8;
      const c2 = rim ? (dj < 0 ? STONE_LIT : CRACK_C) : di < 0 ? STONE_LIT : STONE_DARK;
      pic.over(i, j, c2[0], c2[1], c2[2], 235 * a);
      if (dj === Math.ceil(w * 0.5) && !water[(j + 1) * CW + i]) pic.over(i, j + 1, CRACK_C[0], CRACK_C[1], CRACK_C[2], 220 * a);
    }
  }
}
/** WHAT A SLAM THROWS (the game's, drawn over): chunks of the paving it broke, gobs and strings of goo flung off it, drops of water,
 *  grit. And a water slam's smash. */
const HIT_THROWS = { chunks: 34, gobs: 40, strings: 12, drops: 24, all: 124 } as const;
const SMASH_THROWS = 320;
/** WHAT A TENTACLE THROWS: chunks of the paving, goo, water and grit off a slam; a crown of water and slime off a smash; his ichor out
 *  of a wound; the spray off a wave's crest; the crash's water and slime thrown up. Each with how long since it was thrown. */
function armFlyers(fx: ArmFx): Array<[Flyer, number]> {
  const out: Array<[Flyer, number]> = [];
  for (const h of fx.hits) {
    if (h.s < 0 || h.s > 3.4) continue;
    for (let n = 0; n < HIT_THROWS.all; n++) {
      // (from all along where it struck, out to both sides and up: chunks of the paving it broke, gobs and strings of goo flung off
      // it, water, grit)
      const a = h.a0 + (h.a1 - h.a0) * h3(n, h.seed, 1, 7811);
      const side = h3(n, h.seed, 2, 7812) < 0.5 ? -1 : 1;
      const [x, y] = onLine(h.x, h.y, h.ang, a, side * 10);
      const T = HIT_THROWS;
      const kind = (n < T.chunks ? 6 : n < T.chunks + T.gobs ? 1 : n < T.chunks + T.gobs + T.strings ? 3 : n < T.chunks + T.gobs + T.strings + T.drops ? 2 : 5) as 1 | 2 | 3 | 5 | 6;
      const sp = (kind === 6 ? 50 : 70) + (kind === 6 ? 150 : 230) * h3(n, h.seed, 3, 7813);
      const up = (kind === 6 ? 140 : 120) + (kind === 6 ? 220 : 300) * h3(n, h.seed, 4, 7814);
      const across = [-Math.cos(h.ang) * side, Math.sin(h.ang) * side];
      const size = kind === 6 ? 4.5 + 6 * h3(n, h.seed, 7, 7817) ** 1.5 : kind === 1 ? 2.4 + 3.4 * h3(n, h.seed, 7, 7817) : kind === 3 ? 6 + 7 * h3(n, h.seed, 7, 7817) : kind === 5 ? 1 + Math.floor(2 * h3(n, h.seed, 7, 7817)) : 1;
      out.push([{ x, y, z: kind === 1 || kind === 3 ? 14 : 4, vx: across[0] * sp + (h3(n, h.seed, 5, 7815) - 0.5) * 70, vy: across[1] * sp + (h3(n, h.seed, 6, 7816) - 0.5) * 70, vz: up, t0: kind === 6 ? 0 : (2 * h3(n, h.seed, 8, 7818)) / EYE_FPS, kind, size, seed: h.seed * 97 + n }, h.s]);
    }
  }
  for (const m of fx.smashes) {
    if (m.s < 0 || m.s > 2) continue;
    for (let n = 0; n < SMASH_THROWS; n++) {
      // (a crown of water thrown up high all round where it went in, heavy, sheets and gobs of slime off it, drops flung far)
      const a = h3(n, m.seed, 1, 7821) * TAU;
      const r = 20 + 34 * h3(n, m.seed, 2, 7822);
      const crown = n < SMASH_THROWS * 0.6;
      const sp = crown ? 50 + 100 * h3(n, m.seed, 3, 7823) : 140 + 320 * h3(n, m.seed, 3, 7823);
      const kind = (n % 23 === 0 ? 3 : n % 7 === 0 ? 1 : 2) as 1 | 2 | 3;
      out.push([{ x: m.x + Math.cos(a) * r, y: m.y + Math.sin(a) * r * 0.8, z: 2, vx: Math.cos(a) * sp * 0.6, vy: Math.sin(a) * sp * 0.45, vz: crown ? 480 + 300 * h3(n, m.seed, 4, 7824) : 300 + 360 * h3(n, m.seed, 4, 7824), t0: (3 * h3(n, m.seed, 5, 7825)) / EYE_FPS, kind, size: kind === 3 ? 5 + 5 * h3(n, m.seed, 6, 7826) : kind === 1 ? 2 + 3 * h3(n, m.seed, 6, 7826) : 1 + (h3(n, m.seed, 6, 7826) < 0.5 ? 1 : 0), seed: m.seed * 89 + n }, m.s]);
    }
  }
  for (const c of fx.ichor) {
    if (c.s < 0 || c.s > 1.6) continue;
    for (let n = 0; n < 34; n++) {
      // (a spurt of it out of the wound, toward the camera and up, in gouts)
      const a = (h3(n, c.seed, 1, 7831) - 0.5) * 2.2;
      const sp = 90 + 200 * h3(n, c.seed, 2, 7832);
      out.push([{ x: c.x, y: c.y + 4, z: c.z, vx: Math.sin(a) * sp, vy: Math.cos(a) * sp * 0.8, vz: 120 + 240 * h3(n, c.seed, 3, 7833), t0: (h3(n, c.seed, 4, 7834) * 5) / EYE_FPS, kind: 4, size: 1.4 + 2.4 * h3(n, c.seed, 5, 7835), seed: c.seed * 83 + n }, c.s]);
    }
  }
  for (const w of fx.waves) {
    // (spray torn off its crest as it rolls, thrown forward and up)
    for (let n = 0; n < 160; n++) {
      const tb = (n / 160) * 3.2;
      if (tb > w.s || w.s - tb > 1.2) continue;
      const y = STONE_BOX.y0 - 10 + WAVE.reach * 0.8 * h3(n, w.dir + 5, 1, 7841) ** 1.6;
      const hgt = waveHigh(y);
      if (hgt < 6) continue;
      out.push([{ x: waveFront(w.dir, tb), y, z: hgt * 0.95, vx: w.dir * WAVE.speed * (0.4 + 0.5 * h3(n, w.dir + 5, 2, 7842)), vy: (h3(n, w.dir + 5, 3, 7843) - 0.5) * 60, vz: 60 + 160 * h3(n, w.dir + 5, 4, 7844), t0: 0, kind: n % 11 === 0 ? 1 : 2, size: 1 + (h3(n, w.dir + 5, 5, 7845) < 0.3 ? 1 : 0), seed: 7000 + n * 3 + w.dir }, w.s - tb]);
    }
  }
  if (fx.crash !== null && fx.crash >= 0 && fx.crash < 3) {
    for (let n = 0; n < 420; n++) {
      // (thrown up out of the middle, high, and falling back across it: water in sheets of drops, slime in gobs and sheets)
      const y = STONE_BOX.y0 + WAVE.reach * 0.75 * h3(n, 1, 1, 7851) ** 1.4;
      const g = waveHigh(y) / WAVE.high;
      // (arcs of drops flung out of it to both sides, high, falling back; now and then a gob or a torn sheet of slime)
      const kind = (n % 31 === 0 ? 3 : n % 12 === 0 ? 1 : 2) as 1 | 2 | 3;
      const side = h3(n, 3, 2, 7858) < 0.5 ? -1 : 1;
      out.push([{ x: side * (6 + 30 * h3(n, 2, 1, 7852)), y, z: 20 + 120 * h3(n, 8, 1, 7859) * g, vx: side * (90 + 300 * h3(n, 3, 1, 7853)), vy: (h3(n, 4, 1, 7854) - 0.3) * 140, vz: (240 + 380 * h3(n, 5, 1, 7855)) * (0.5 + 0.5 * g), t0: (h3(n, 6, 1, 7856) * 10) / EYE_FPS, kind, size: kind === 3 ? 5 + 5 * h3(n, 7, 1, 7857) : kind === 1 ? 2 + 2 * h3(n, 7, 1, 7857) : 1 + (h3(n, 7, 1, 7857) < 0.4 ? 1 : 0), seed: 9000 + n }, fx.crash]);
    }
  }
  return out;
}
/** UNDER THE TENTACLES, on the stone and the water: the warnings, a slam's cracks, its slime trail, the stone wet behind a wave, a
 *  smash's rings, and a dying one's bubbles and the slick of its ichor as the water closes over it. */
function armFxUnder(pic: Pic, F: EyeFrame, top: Top, water: Uint8Array, t: number): void {
  const fx = F.fx as ArmFx;
  // (the wave's warning: the back of the stone, where it will run, out to where it dies)
  const deepW = Math.min(WAVE.reach, STONE_BOX.y1 - STONE_BOX.y0);
  if (fx.waveWarn !== null) drawWarn(pic, water, (u, v) => [STONE_BOX.x0 + (STONE_BOX.x1 - STONE_BOX.x0) * u, STONE_BOX.y0 + deepW * v], STONE_BOX.x1 - STONE_BOX.x0, deepW, fx.waveWarn, t);
  for (const L of fx.lines) drawWarn(pic, water, (u, v) => onLine(L.x, L.y, L.ang, L.len * u, (v - 0.5) * L.wid), L.len, L.wid, L.k, t);
  // (a slam's cracks, running out from where it struck, staying a while)
  for (const h of fx.hits) {
    if (h.s < 0) continue;
    const a = 1 - sm(4, 7, h.s);
    if (a <= 0) continue;
    const grow = sm(0, 0.12, h.s);
    // (the stone broken all along where it lay: its paving split along both sides of it and across, slabs lifted and tipped)
    brokenAlong(pic, water, top, h, a, grow);
    for (let c = 0; c < 9; c++) {
      const along = h.a0 + 6 + (h.a1 - h.a0 - 6) * h3(c, h.seed, 1, 7861);
      const side = c % 2 ? 1 : -1;
      const [x, y] = onLine(h.x, h.y, h.ang, along, side * 9);
      const dir = h.ang + side * (Math.PI / 2) * (0.6 + 0.5 * h3(c, h.seed, 2, 7862)) + (c > 6 ? Math.PI * 0.5 * side : 0);
      crack(pic, water, top, x, y, dir, (14 + 30 * h3(c, h.seed, 3, 7863)) * grow, h.seed * 7 + c, a);
    }
    // (its line's end, where the tip struck: a star of cracks)
    const [ex, ey] = onLine(h.x, h.y, h.ang, h.a1 - 6, 0);
    for (let c = 0; c < 5; c++) crack(pic, water, top, ex, ey, h.ang + (c - 2) * 0.7, (12 + 16 * h3(c, h.seed, 4, 7864)) * grow, h.seed * 11 + c, a);
  }
  // (its slime trail, where it was dragged back: glossy, streaked along the way it went, fading)
  for (const tr of fx.trails) {
    const a = 1 - sm(1.2, 3.2, tr.s);
    if (a <= 0) continue;
    for (let along = tr.a0; along < tr.a1; along += 0.8) {
      const reach = sm(0, 0.8, tr.s);
      // (laid as it was dragged: from its end back, as far as it has come)
      if (along < tr.a1 - (tr.a1 - tr.a0) * reach) continue;
      for (let b = -9; b <= 9; b += 0.8) {
        const [x, y] = onLine(tr.x, tr.y, tr.ang, along, b);
        const [ci, cj] = onCanvas(x, y, 0);
        const i = Math.round(ci);
        const j = Math.round(cj);
        if (i < 0 || j < 0 || i >= CW || j >= CH || water[j * CW + i]) continue;
        const edge = Math.abs(b) / 9;
        const streak = vn(b * 0.7 + tr.seed, along * 0.04, 7871);
        if (edge > 0.7 + 0.3 * vn(along * 0.08, tr.seed, 7872)) continue;
        const c = streak > 0.72 ? SHEEN : streak > 0.45 ? SLIME[2] : SLIME[1];
        pic.over(i, j, c[0], c[1], c[2], (streak > 0.72 ? 150 : 110) * a * (1 - edge * 0.5));
      }
    }
  }
  // (where a wave has passed, the stone left wet and streaming: darker, a sheen on it, water running back off it to the water)
  for (const w of fx.waves) wetBehind(pic, water, w.dir, w.s, t, 1);
  if (fx.crash !== null && fx.crash >= 0) wetCrash(pic, water, fx.crash, t);
  // (a smash's rings on the water, spreading, and its foam)
  for (const m of fx.smashes) {
    if (m.s < 0 || m.s > 3) continue;
    const [ci, cj] = onCanvas(m.x, m.y, 0);
    const R0 = 30 + 200 * m.s;
    for (let j = Math.floor(cj - R0 / R3 - 6); j <= cj + R0 / R3 + 6; j++) for (let i = Math.floor(ci - R0 * SEEN - 6); i <= ci + R0 * SEEN + 6; i++) {
      if (i < 0 || j < 0 || i >= CW || j >= CH || !water[j * CW + i]) continue;
      if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] > -0.5) continue;
      const [X, Y] = waterAt(i, j);
      const d = Math.hypot(X - m.x, Y - m.y);
      for (let r = 0; r < 3; r++) {
        const R = 30 + 200 * Math.max(0, m.s - r * 0.25);
        if (m.s < r * 0.25) continue;
        if (Math.abs(d - R) < 1.2 + r * 0.3 && vn(Math.atan2(Y - m.y, X - m.x) * 5 + r, m.s, 7881) > 0.3) pic.over(i, j, CREAM[3 - Math.min(2, r)][0], CREAM[3 - Math.min(2, r)][1], CREAM[3 - Math.min(2, r)][2], 220 * (1 - m.s / 3));
      }
      const fl = d < 40 + 30 * m.s ? lace(X + m.s * 9, Y, (1 - d / (40 + 30 * m.s)) * (1 - m.s / 3), 61) : 0;
      if (fl) pic.over(i, j, CREAM[fl - 1][0], CREAM[fl - 1][1], CREAM[fl - 1][2], 150 + 20 * fl);
    }
  }
  // (a dying one sinking: bubbles gurgling up, a slick of its ichor spreading, rings as the water closes over it)
  for (const sk of fx.sinks) {
    if (sk.s < 0) continue;
    const [ci, cj] = onCanvas(sk.x, sk.y, 0);
    const R = Math.min(60, 12 + 30 * sk.s);
    for (let j = Math.floor(cj - R / R3 - 8); j <= cj + R / R3 + 8; j++) for (let i = Math.floor(ci - R * SEEN - 8); i <= ci + R * SEEN + 8; i++) {
      if (i < 0 || j < 0 || i >= CW || j >= CH || !water[j * CW + i]) continue;
      if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] > -0.5) continue;
      const [X, Y] = waterAt(i, j);
      const d = Math.hypot(X - sk.x, (Y - sk.y) * 1.2);
      const edge = R * (0.85 + 0.3 * vn(Math.atan2(Y - sk.y, X - sk.x) * 3, sk.seed, 7891));
      if (d < edge) {
        // (his ichor on the water, oily: dark, a sheen on its far side)
        const sheen = Y < sk.y - R * 0.3 && d > edge * 0.75 && vn(X * 0.3, Y * 0.3, 7892) > 0.45;
        const c = sheen ? SHEEN : vn(X * 0.12, Y * 0.12, 7893) > 0.55 ? ICHOR[2] : ICHOR[1];
        pic.over(i, j, c[0], c[1], c[2], (sheen ? 120 : 170) * (1 - sm(3.5, 6, sk.s)));
      }
      for (let r = 0; r < 4; r++) {
        const rs = sk.s - 0.6 - r * 0.5;
        if (rs < 0) continue;
        const RR = 14 + 70 * rs;
        if (Math.abs(Math.hypot(X - sk.x, Y - sk.y) - RR) < 0.9 && vn(Math.atan2(Y - sk.y, X - sk.x) * 4 + r, rs, 7894) > 0.35) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 200 * (1 - sm(0.5, 1.6, rs)));
      }
    }
    // (its bubbles, gurgling up: big and glossy, bursting)
    for (let b = 0; b < 9; b++) {
      const per = 0.5 + 0.4 * h3(b, sk.seed, 1, 7895);
      const q = sk.s / per + h3(b, sk.seed, 2, 7896);
      if (sk.s > 4) continue;
      const rn = Math.floor(q);
      const p2 = q - rn;
      const bx = sk.x + (h3(b, rn, 3, 7897) - 0.5) * 50;
      const by = sk.y + (h3(b, rn, 4, 7898) - 0.5) * 30;
      const [bi, bj] = onCanvas(bx, by, 0);
      if (!water[Math.round(bj) * CW + Math.round(bi)]) continue;
      bubble(pic, Math.round(bi), Math.round(bj), (3 + 4 * h3(b, rn, 5, 7899)) * SEEN, p2, b + rn * 13, 0);
    }
  }
}
/** The stone wet where a wave has passed (`dir`, `s` seconds since its smash): darker, a sheen, water running back off it. */
function wetBehind(pic: Pic, water: Uint8Array, dir: number, s: number, t: number, k: number): void {
  const front = waveFront(dir, s);
  const [, j0] = onCanvas(0, STONE_BOX.y0, 0);
  const [, j1] = onCanvas(0, STONE_BOX.y0 + WAVE.reach + 30, 0);
  for (let j = Math.floor(j0); j <= j1; j++) for (let i = 0; i < CW; i++) {
    if (j < 0 || j >= CH || water[j * CW + i]) continue;
    const [X, Y] = waterAt(i, j);
    const behind = (front - X) * dir;
    if (behind < 12) continue;
    const since = behind / WAVE.speed;
    const reachHere = 1 - (Y - STONE_BOX.y0) / WAVE.reach;
    if (reachHere < -0.1) continue;
    const wet = Math.exp(-since / 1.8) * clamp01(reachHere * 1.6 + 0.2) * k;
    if (wet < 0.05) continue;
    const q = (j * CW + i) * 4;
    pic.d[q] *= 1 - 0.38 * wet;
    pic.d[q + 1] *= 1 - 0.33 * wet;
    pic.d[q + 2] *= 1 - 0.3 * wet;
    // (water running back off it toward the water, in thin runs; a sheen here and there)
    const run = vn(X * 0.35, Y * 0.04 + t * 3.5, 7901);
    if (run > 0.8 - 0.1 * wet) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 160 * wet);
    else if (vn(X * 0.2, Y * 0.3, 7902) > 0.86) pic.over(i, j, SHEEN[0], SHEEN[1], SHEEN[2], 140 * wet);
  }
}
/** After the crash: the middle of the stone awash, foam on it, draining back off it: a spreading pool, its edge ragged, nothing ruled. */
function wetCrash(pic: Pic, water: Uint8Array, s: number, t: number): void {
  const spread = 60 + 200 * sm(0, 1.2, s);
  const fade = 1 - sm(2.5, 5, s);
  if (fade <= 0) return;
  const deep = WAVE.reach * (0.7 + 0.4 * sm(0, 1.2, s));
  const [, jA] = onCanvas(0, STONE_BOX.y0 - 4, 0);
  const [, jB] = onCanvas(0, STONE_BOX.y0 + deep * 1.4, 0);
  for (let j = Math.max(0, Math.floor(jA)); j <= Math.min(CH - 1, Math.ceil(jB)); j++) for (let i = 0; i < CW; i++) {
    if (water[j * CW + i]) continue;
    const [X, Y] = waterAt(i, j);
    if (Y < STONE_BOX.y0) continue;
    // (how far into the pool, its rim wandering)
    const rim = 0.8 + 0.4 * vn(Math.atan2(Y - STONE_BOX.y0, X) * 3 + s * 0.5, s * 0.3, 7951);
    const d = Math.hypot(X / spread, (Y - STONE_BOX.y0) / deep) / rim;
    if (d >= 1) continue;
    const e = (1 - d * d) * fade;
    const q = (j * CW + i) * 4;
    pic.d[q] *= 1 - 0.4 * e;
    pic.d[q + 1] *= 1 - 0.35 * e;
    pic.d[q + 2] *= 1 - 0.3 * e;
    const fl = lace(X + t * 4, Y - s * 20 - t * 6, e * 0.9, 63);
    if (fl) pic.over(i, j, CREAM[fl - 1][0], CREAM[fl - 1][1], CREAM[fl - 1][2], 140 + 20 * fl);
    else if (vn(X * 0.3, Y * 0.05 + t * 3, 7952) > 0.82) pic.over(i, j, SHEEN[0], SHEEN[1], SHEEN[2], 120 * e);
  }
}
/**
 * THE WAVES AND THE CRASH (the game's effects, drawn over the stone as his water is), real rolling water. Each is drawn in slices
 * across the stone's depth, from the front back (each pixel once: what is nearer hides what is behind it), each slice the wave's own
 * shape across it as the camera sees it straight on: its long back slope rising to the crest, the crest rolling forward and pitching
 * over in a lip that curls down, the hollow under the lip, the face under it falling to its toe. Black swamp water, lit by its curve
 * (a glossy highlight running along it behind the crest), foam on the lip, spilling down the face, streaming off the back in streaks,
 * weed and slime rolled in it, spray torn off the lip; the lip surging and changing every frame. The crash: the two walls slamming
 * together and erupting in a plume (dark water at its core, white foam and torn sheets at its edges, a crown of spouts at its top),
 * then collapsing into a surge of foam spreading over the stone and draining off. Every measure as WAVE and CRASH set them.
 */
function armWaves(pic: Pic, fx: ArmFx, top: Top, water: Uint8Array, t: number): void {
  void water;
  const cov = new Uint8Array(CW * CH);
  // (a pixel of water, if nothing nearer is there: a tentacle in front of it, or water already drawn)
  const free = (i: number, j: number, nr: number): boolean => {
    if (i < 0 || j < 0 || i >= CW || j >= CH) return false;
    const q = j * CW + i;
    if (cov[q]) return false;
    return !(top.who[q] >= 0 && top.z[q] >= -0.5 && top.near[q] > nr);
  };
  const put = (i: number, j: number, c: RGB, a: number): void => {
    cov[j * CW + i] = 1;
    pic.over(i, j, c[0], c[1], c[2], a);
  };
  // (each wave's slice at a depth: how tall it is there, where its crest is across, how far its lip reaches)
  interface Slice { H: number; xf: number; dir: number; lip: number; seed: number }
  const sliceOf = (w: { dir: number; s: number }, Y: number): Slice | null => {
    const lag = Math.max(0, Y - STONE_BOX.y0) * 0.35;
    const surge = 22 * (vn(Y * 0.035 + w.s * 1.7, w.s * 0.9, 7915 + w.dir) - 0.5) + 9 * (vn(Y * 0.12 - t * 2, t * 1.3, 7917 + w.dir) - 0.5);
    const xf = waveFront(w.dir, w.s) - w.dir * (lag - surge);
    const grow = sm(0, WAVE.form, w.s);
    const die = 1 - sm(STONE_BOX.x1, STONE_BOX.x1 + 140, waveFront(w.dir, w.s) * w.dir);
    const behindStone = Y < STONE_BOX.y0 ? clamp01(1 - (STONE_BOX.y0 - Y) / 45) : 1;
    const H = waveHigh(Math.max(Y, STONE_BOX.y0)) * grow * die * behindStone * (0.92 + 0.16 * vn(xf * 0.02, Y * 0.03, 7911));
    if (H < 0.8) return null;
    // (the lip pitching forward and drawing back, never the same two frames running)
    const lip = H * (0.5 + 0.18 * Math.sin(t * 7.3 + Y * 0.045 + w.dir) + 0.12 * (vn(Y * 0.07, t * 3.1, 7916 + w.dir) - 0.5));
    return { H, xf, dir: w.dir, lip, seed: 7920 + w.dir * 7 };
  };
  const drawWaveSlice = (S: Slice, Y: number): void => {
    const { H, xf, dir, lip } = S;
    const base = HY + Y / R3;
    const thin = clamp01(H / (WAVE.high * 0.12));
    const toe = lip * 0.95;
    const back = 34;
    const iA = Math.floor(HX + Math.min(xf - dir * 150, xf + dir * (lip + 6)) * SEEN);
    const iB = Math.ceil(HX + Math.max(xf - dir * 150, xf + dir * (lip + 6)) * SEEN);
    for (let i = Math.max(0, iA); i <= Math.min(CW - 1, iB); i++) {
      const X = (i + 0.5 - HX) / SEEN;
      const u = (X - xf) * dir;
      // (its top, never ruled: the water heaving a little along it)
      const heave = H * 0.05 * (vn(X * 0.09, Y * 0.06 + t * 4, S.seed) - 0.5);
      // THE LIP: rolling over the crest and pitching forward, curling down, foam on it, its underside dark and glassy
      if (u > -4 && u < lip) {
        const p = clamp01((u + 4) / (lip + 4));
        const zt = H * (1 - 0.62 * p ** 2.2) + heave + H * 0.04 * (vn(X * 0.3, t * 9 + Y * 0.1, S.seed + 4) - 0.5);
        const zl = zt - H * (0.36 * (1 - p) + 0.08);
        for (let z = Math.floor(zt); z >= Math.max(0, Math.ceil(zl)); z--) {
          const j = Math.round(base - z);
          const nr = Y * 0.8660254 + z * 0.5;
          if (!free(i, j, nr)) continue;
          const v = (zt - z) / Math.max(1, zt - zl);
          // (foam riding its top; under it the lip's black water, glassy, its rim catching the light where it curls over)
          const crest = p < 0.3 || p > 0.86;
          const fl = v < 0.3 || p > 0.86 ? lace(X * 1.7 + t * 14 * dir, z * 1.6 + Y * 0.9, crest ? 0.95 - v * 1.5 : 0.5 - v * 1.5, S.seed + 5) : 0;
          const c = v < 0.06 && crest ? SPRAY : fl ? CREAM[Math.min(4, fl + (crest ? 1 : 0))] : v > 0.75 && p > 0.6 ? FOAM[2] : v > 0.45 ? FOAM[0] : WATER;
          let a = v < 0.12 && bayer(i, j) > 0.45 ? 170 : 255;
          a = Math.round(a * (0.4 + 0.6 * thin));
          put(i, j, c, a);
        }
        // (spray torn off its lip, thrown up and forward)
        for (let n = 0; n < 2; n++) {
          if (p < 0.55 || h3(i, Math.floor(t * 30) + n * 7, Math.floor(Y), S.seed + 6) > 0.012 * thin) continue;
          const zs = zt + H * (0.05 + 0.3 * h3(i, n, Math.floor(Y), S.seed + 7));
          const js = Math.round(base - zs);
          if (free(i, js, Y * 0.8660254 + zs * 0.5)) put(i, js, SPRAY, 200);
        }
      }
      // THE BODY: the back slope up to the crest; ahead of it the face, under the lip, down to its toe
      let zb: number;
      let slope: number;
      if (u <= 0) {
        const e = Math.exp(-((u / back) ** 2));
        zb = H * e + heave;
        slope = (H * e * (-2 * u)) / (back * back);
      } else {
        const v = clamp01(1 - u / toe);
        zb = H * 0.6 * v ** 1.4 + heave * v;
        slope = -H * 0.6 * 1.4 * v ** 0.4 / toe;
      }
      // (lit by its curve: the light from the upper left, the back of a wave rolling right facing it)
      const nx = -slope * dir;
      const lit = (-0.55 * nx + 0.85) / Math.hypot(nx, 1);
      // (the glossy highlight running along the curve behind the crest, broken)
      const glossBand = u < 0 && u > -back * 1.2 && Math.abs((slope / Math.max(1, H)) * back - 0.75) < 0.05;
      // (streaks along the crest, following its curve: lines of light and foam lying parallel to it)
      const streakX = vn(u * 0.22 + t * 0.8, Y * 0.022, 7931);
      // (where it has thinned to nothing, no water: its tail along the stone thins to a film the stone shows through)
      if (zb < 0.6) continue;
      const film = clamp01(zb / Math.max(1, H * 0.04));
      for (let z = Math.max(0, Math.floor(zb)); z >= 0; z--) {
        const j = Math.round(base - z);
        const nr = Y * 0.8660254 + z * 0.5;
        if (!free(i, j, nr)) continue;
        const fz = z / Math.max(1, H);
        let c: RGB;
        let a = 255;
        if (u > 0) {
          // (the face under the lip: dark in its shadow, foam spilling down it, a line of white water at its toe)
          const fl = lace(X * 1.4 + t * 8, z * 2.1 + Y * 0.6 - t * 30, 0.05 + 0.75 * (u / toe) ** 2 + 0.25 * (1 - fz) ** 4, S.seed + 1);
          c = fl ? CREAM[Math.min(4, fl)] : vn(X * 0.2, z * 0.3 + t * 5, S.seed + 2) > 0.72 ? FOAM[0] : WATER;
        } else {
          // (its back: black water lit by its curve; the gloss; foam streaming back off the crest in streaks; weed and slime rolled in)
          const near = Math.exp(u / 13);
          const fl = lace(X * 0.55 - t * 6 * dir, Y * 1.5 + z * 0.4, 0.8 * near + 0.2 * streakX * Math.exp(u / 50), S.seed + 3);
          // (water running down off it toward you, in streaks)
          const run = vn(X * 0.12 - u * 0.05, Y * 0.02 - t * 0.5, 7934);
          const weed = vn(X * 0.08 - u * 0.05, Y * 0.12 + z * 0.15, 7923);
          if (weed > 0.83) c = SLIME[2];
          else if (weed > 0.79) c = SLIME[0];
          else if (fl) c = CREAM[Math.max(0, Math.min(4, fl - (near < 0.3 ? 3 : near < 0.6 ? 1 : 0)))];
          else if (glossBand && streakX > 0.35) c = streakX > 0.66 ? SHEEN : FOAM[2];
          else if (run > 0.78) c = FOAM[0];
          else c = lit > 1.0 ? FOAM[1] : lit > 0.96 ? FOAM[0] : WATER;
        }
        if (z >= zb - 1.2 && bayer(i, j) > 0.5) a = 180;
        // (thinning toward the front to a sheet of water and foam the wet stone shows through)
        a = Math.round(a * (0.4 + 0.6 * thin) * (0.3 + 0.7 * film));
        put(i, j, c, a);
      }
    }
  };
  // THE CRASH. Where the two walls meet and slam together (toward the back of the stone, where they are tallest) THE PLUME erupts:
  // narrow at its foot, fanning out as it rises, dark water at its core with sheets of it streaming, white foam and torn sheets at its
  // edges, a crown of spouts at its top; along the rest of the line where they meet, a lower wall of spray; then it collapses into a
  // surge of foamy water spreading over the stone in a pool, its rim ragged, draining off.
  const crashK = (): { s: number; up: number; fallS: number; W: number } | null => {
    if (fx.crash === null || fx.crash < -0.15) return null;
    const s = Math.max(0, fx.crash);
    const C = CRASH;
    const up = s < C.rise ? Math.sin((Math.PI / 2) * (s / C.rise)) : Math.max(0, 1 - ((s - C.rise) / C.fall) ** 0.7);
    const fallS = Math.max(0, s - C.rise);
    return { s, up, fallS, W: C.wide * (1 + 1.6 * clamp01(fallS / C.fall)) };
  };
  const CK = crashK();
  const YC = STONE_BOX.y0 + 34;
  const plumeAt = (Y: number): void => {
    if (!CK || Math.abs(Y - YC) > 0.5) return;
    const { s, up, fallS, W } = CK;
    const Hb = CRASH.high * up;
    if (Hb < 3) return;
    const base = HY + YC / R3;
    const fan = W * (1.25 + 0.25 * sm(0, CRASH.fall, fallS));
    for (let i = Math.max(0, Math.floor(HX - fan * 1.3 * SEEN)); i <= Math.min(CW - 1, Math.ceil(HX + fan * 1.3 * SEEN)); i++) {
      const X = (i + 0.5 - HX) / SEEN;
      const ax = Math.abs(X);
      // (its crown: spouts and jets torn up out of it, never level)
      const spout = Math.sqrt(Math.max(0, vn(X * 0.075, s * 2.5, 7942) - 0.5) * 2) * (1 - sm(0, 0.8, fallS));
      const ztop = Hb * (0.66 + 0.2 * vn(X * 0.05, s * 2, 7941) + 0.3 * spout + 0.04 * (vn(X * 0.4, s * 6, 7940) - 0.5)) * Math.sqrt(clamp01(1 - (ax / (fan * 1.15)) ** 2));
      for (let z = Math.floor(ztop); z >= 0; z--) {
        const fz = z / Math.max(1, Hb);
        const torn = 0.78 + 0.44 * vn(z * 0.05 + s * 3, X > 0 ? 3 : 0, 7943);
        const hw = fan * (0.34 + 0.75 * fz ** 1.2) * torn;
        // (its crown a little wider than the column under it, torn; never a level line across)
        if (ax > hw * (z > ztop - 10 ? 1.3 : 1)) continue;
        const e = ax / Math.max(1, hw);
        const j = Math.round(base - z);
        const nr = YC * 0.8660254 + z * 0.5;
        if (!free(i, j, nr)) continue;
        // (sheets of it streaming up as it erupts, falling back down it as it collapses)
        const sheet = vn(X * 0.09 + z * 0.015, (z - s * 120 + fallS * 260) * 0.045, 7944);
        const slime = vn(X * 0.1, z * 0.08 - fallS * 6, 7945);
        let c: RGB;
        let a = 255;
        if (z > ztop - 9) {
          // (its crown: white water, spray off it)
          if (bayer(i, j) > 0.55 + 0.3 * (z - (ztop - 9)) / 9) continue;
          c = z > ztop - 3 ? SPRAY : CREAM[4];
          a = 210;
        } else if (e > 0.72) {
          // (its edges: torn sheets of foam, holes through them)
          const fl = lace(X * 2.4, z * 2.2 - fallS * 160 + s * 70, 0.8 + 0.4 * (1 - e), 7946);
          if (!fl && e > 0.92) continue;
          c = fl ? CREAM[Math.min(4, fl + 1)] : CREAM[1];
        } else if (slime > 0.84) c = SLIME[1];
        else if (e > 0.5) {
          const fl = lace(X * 2.2, z * 2.0 + s * 60, 0.66, 7950);
          c = fl ? CREAM[Math.min(4, fl + 1)] : sheet > 0.5 ? FOAM[3] : FOAM[1];
        } else c = sheet > 0.68 ? CREAM[3] : sheet > 0.55 ? CREAM[1] : sheet > 0.4 ? FOAM[2] : sheet > 0.25 ? FOAM[0] : WATER;
        put(i, j, c, a);
      }
    }
  };
  const crashSlice = (Y: number): void => {
    if (!CK) return;
    const { s, up } = CK;
    plumeAt(Y);
    const base = HY + Y / R3;
    const g = Y < STONE_BOX.y0 ? clamp01(1 - (STONE_BOX.y0 - Y) / 50) * 0.8 : Math.pow(clamp01(1 - (Y - STONE_BOX.y0) / (WAVE.reach * 0.9)), 0.6);
    // (the lower wall of spray along the line where they meet, in front of the plume)
    // (the lower wall of spray where they meet in front of the plume, lower and more broken toward the near edge)
    const gw = Y < STONE_BOX.y0 ? g : Math.pow(clamp01(1 - (Y - STONE_BOX.y0) / ((STONE_BOX.y1 - STONE_BOX.y0) * 0.65)), 1.3);
    const Hw = CRASH.high * 0.12 * up * gw * (Y > YC ? 1 : 0.5) * (0.6 + 0.8 * vn(Y * 0.05, s * 3, 7956));
    // (the surge: a pool of foamy water spreading over the stone, its rim ragged)
    const surgeK = sm(0.15, 0.6, s) * (1 - sm(1.8, 3.2, s));
    const Ws = 40 + 230 * sm(0.1, 1.6, s);
    const Dy = WAVE.reach * (0.5 + 0.5 * sm(0.1, 1.6, s));
    const across = Y >= STONE_BOX.y0 - 6 ? Math.sqrt(clamp01(1 - ((Y - (STONE_BOX.y0 + Dy * 0.35)) / Dy) ** 2)) : 0;
    const span = Math.max(Hw > 1 ? 30 : 0, Ws * across * 1.3);
    if (span <= 0) return;
    for (let i = Math.max(0, Math.floor(HX - span * SEEN)); i <= Math.min(CW - 1, Math.ceil(HX + span * SEEN)); i++) {
      const X = (i + 0.5 - HX) / SEEN;
      const ax = Math.abs(X);
      const wz = Hw > 1 ? Hw * (0.5 + 0.7 * vn(X * 0.1, Y * 0.05 + s * 4, 7953)) * clamp01(1 - (ax / (16 + 30 * vn(Y * 0.04, s * 2, 7955))) ** 2) : 0;
      if (wz >= 1) {
        for (let z = Math.floor(wz); z >= 0; z--) {
          const j = Math.round(base - z);
          const nr = Y * 0.8660254 + z * 0.5;
          if (!free(i, j, nr)) continue;
          const fl = lace(X * 2.2, z * 2.0 + Y * 0.8 - s * 70, 0.85 - 0.4 * (z / Math.max(1, wz)), 7954);
          if (!fl && z > wz * 0.6) continue;
          put(i, j, fl ? CREAM[Math.min(4, fl)] : FOAM[1], fl ? 230 : 200);
        }
      }
      if (surgeK > 0.02 && across > 0) {
        // (its rim ragged both ways, tongues of it running out over the stone; its top heaving, never level)
        const edge = Ws * across * (0.7 + 0.35 * vn(X * 0.03, Y * 0.045 + s, 7947) + 0.3 * vn(Y * 0.09 + X * 0.01, s * 1.5, 7957));
        if (ax < edge) {
          const k = 1 - ax / edge;
          const hz = 9 * surgeK * k ** 0.7 * Math.max(0.3, g) * (0.4 + 1.2 * vn(X * 0.08, Y * 0.06 + t * 2, 7958));
          for (let z = Math.floor(hz); z >= 0; z--) {
            const j = Math.round(base - z);
            if (!free(i, j, Y * 0.8660254 + z * 0.5)) continue;
            const fl = lace(X * 1.1 + t * 5 * Math.sign(X), Y * 1.0 - s * 20, 0.3 + 0.6 * k, 7948);
            if (!fl && vn(X * 0.2, Y * 0.2 + t * 3, 7949) < 0.45) continue;
            const c = fl ? CREAM[Math.max(0, fl - 1)] : FOAM[1];
            put(i, j, c, Math.round((fl ? 230 : 130) * (0.5 + 0.5 * k) * Math.min(1, surgeK * 1.5)));
          }
        }
      }
    }
  };
  // (front to back: each pixel drawn once, by what is nearest)
  const yFront = STONE_BOX.y0 + WAVE.reach + 24;
  const yBack = STONE_BOX.y0 - 50;
  for (let Y = yFront; Y >= yBack; Y -= 1) {
    crashSlice(Y);
    for (const w of fx.waves) {
      const S = sliceOf(w, Y);
      if (S) drawWaveSlice(S, Y);
    }
  }
}

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
    const FR = frameFor(L);
    const ox = HX - FR.ax + Math.round((L.dx ?? 0) * SEEN);
    const oy = HY - FR.ay + dj;
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
    // (his shovel: his lights dimming as he goes down out of sight under the water; none on the stone from deep under it)
    const deep = F.sfx ? 1 - sm(330, 450, L.drop) : 1;
    const Sw = scenery().water;
    if (!smear && deep > 0) for (const l of p.lights) {
      const lx = Math.round(l.x + ox);
      const ly = Math.round(l.y + oy);
      if (F.sfx && L.drop > 300 && lx >= 0 && ly >= 0 && lx < CW && ly < CH && !Sw[ly * CW + lx]) continue;
      lights.push({ x: l.x + ox, y: l.y + oy, r: l.r, c: hex(l.color), a: (l.a ?? 0.5) * deep, fire: true });
    }
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
  // (as he rises: the foam off him spreading out round him over the water, in streaks and clots, thinning as it spreads)
  const riseS = rose ? (k - EYE_ENTRANCE.breaks) / EYE_FPS : -1;
  const riseFade = rose ? 1 - sm(EYE_ENTRANCE.tear[0], EYE_ENTRANCE.stalk[1], k) : 0;
  const riseR = riseS > 0 ? 10 + 70 * (1 - Math.exp(-riseS / 1.3)) : 0;
  const riseFoam = (w: number, X: number, Y: number): number => {
    if (riseR <= 0 || riseFade <= 0) return 0;
    const u = w / riseR;
    if (u > 1.2) return 0;
    // (drawn out from him in streaks, gathered in clots, the black water between; thinning as it spreads)
    const ang = Math.atan2(Y, X);
    const streak = sm(0.45, 0.72, vn(ang * 22, w * 0.012 - riseS * 0.35, 35));
    const clot = sm(0.5, 0.8, vn(X * 0.028 + 7, Y * 0.04, 36));
    return (1 - u) ** 1.3 * Math.max(streak * 0.85, clot) * riseFade;
  };
  const foamOut = (w: number, X: number, Y: number): number => (riseFoam(w, X, Y) > 0.02 ? riseR : 0);
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
      } else if (seeds && w < 9 + 8 * vn(X * 0.05 + t * 0.4, Y * 0.06, 8) + foamOut(w, X, Y)) {
        // foam where he breaks it: a lace of wet foam, thickest against him, thinning out over the black water (and as he rises,
        // spreading out round him in streaks and clots)
        const band = Math.max(0, 1 - w / (9 + 8 * vn(X * 0.05 + t * 0.4, Y * 0.06, 8)));
        const dens = Math.max(band * (0.45 + 0.6 * vn(X * 0.035 + 2, Y * 0.05, 9)), riseFoam(w, X, Y));
        const fl = lace(X + t * 1.5, Y - t * 2.2, dens, 31);
        if (fl) {
          c = CREAM[fl - 1];
          a = 130 + 25 * fl;
        }
      } else if (w < 12 && sh < 0.04 && seeds) c = SCUM;
      else if (!flat && seeds && !(F.sfx && top.who[q] >= 0)) {
        // his rings spreading out from him, further apart further out, each one broken (his shovel: on the water round him only, hidden
        // wherever he is, over it or under it)
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
      if (Wt.swell > 0.05 && !(F.sfx && top.who[q] >= 0)) {
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
          // (dull oily goo on the black water, thicker in its middle, thinning raggedly to its edge; glints of the light on it, and
          // along its far edge)
          const rim = d > edge - 0.12 && Y < cy - R * 0.3 && vn(X * 0.25, Y * 0.25, 505) > 0.5;
          const glint = d < edge - 0.25 && vn(X * 0.3 + s, Y * 0.5, 506) > 0.78;
          if (rim || glint) pic.over(i, j, SHEEN[0], SHEEN[1], SHEEN[2], (rim ? 120 : 100) * fade);
          else if (bayer(i, j) < 0.3 - 0.55 * (d / edge)) {
            const col = vn(X * 0.15, Y * 0.15, 504) > 0.55 ? SLIME[2] : SLIME[1];
            pic.over(i, j, col[0], col[1], col[2], 150 * fade);
          }
        }
      }
    }
  }
  // BUBBLES rising and breaking over him (and, as he stirs, boiling)
  const nb = Math.round(10 + 40 * Wt.boil);
  if (Wt.bubbles > 0.02) {
    for (let b = 0; b < nb; b++) {
      if (b >= 10 && h3(b, 0, 0, 520) > Wt.boil) continue;
      if (b < 10 && h3(b, 0, 0, 521) > Wt.bubbles + 0.4) continue;
      const per = [1, 1.5, 3][Math.floor(h3(b, 1, 0, 522) * 3)];
      const p = frac(t / per + h3(b, 2, 0, 523));
      // (one of his rounds: where it comes up moves on each time)
      const rn = Math.floor(t / per + h3(b, 2, 0, 523));
      const spread = b < 10 ? 130 : 260;
      // (his own over him; as he boils, over where he boils, under his top: the boil's middle)
      // (his shovel: over where he is, at an end of the stone)
      const WA = Wt.at ?? [0, 0];
      const cx = WA[0] + (b < 10 ? (Wt.at ? 0 : EYE_UNDER[0]) + (h3(b, 3, rn, 524) - 0.5) * spread * 2 : (h3(b, 3, rn, 524) - 0.5) * (Wt.at ? 300 : 420));
      const cy = WA[1] + (b < 10 ? (Wt.at ? -40 : 140) + (h3(b, 4, rn, 525) - 0.2) * spread : 20 - (ent ? entranceAt(k).back : 0) + (h3(b, 4, rn, 525) - 0.5) * 260);
      const rr = 2.5 + 4 * h3(b, 5, rn, 526) + (b >= 10 ? 3 : 0);
      const [ci, cj] = onCanvas(cx - (ent ? 0 : 0), cy - (F.jaws.back - 330) * 0, 0);
      const ii = Math.round(ci);
      const jj = Math.round(cj);
      if (ii < 4 || jj < 4 || ii >= CW - 4 || jj >= CH - 4 || !S.water[jj * CW + ii]) continue;
      if (top.who[jj * CW + ii] >= 0 && top.z[jj * CW + ii] > -0.5) continue;
      // (radius in pixels across: his lengths at SEEN a pixel)
      bubble(pic, ii, jj, rr * SEEN * (b >= 10 ? 1.25 : 1), p, b, ent ? 0 : Wt.pulse * 0.6);
    }
  }
  // THE BOIL: the water over him churning to foam as he comes up, a hump of it heaving over where he will break it
  if (Wt.boil > 0.02) {
    const hump = ent ? sm(EYE_ENTRANCE.rise[0], EYE_ENTRANCE.breaks, k) * (1 - sm(EYE_ENTRANCE.breaks, EYE_ENTRANCE.breaks + 12, k)) : 0;
    const at = ent ? entranceAt(k) : { back: 0 };
    for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) {
      const q = j * CW + i;
      if (!S.water[q] || (top.who[q] >= 0 && top.z[q] > -0.5)) continue;
      const [X0, Y0] = waterAt(i, j);
      const X = X0 - (Wt.at ? Wt.at[0] : 0);
      const Y = Y0 - (Wt.at ? Wt.at[1] : 0);
      const dx = X / (Wt.at ? 230 : 300);
      const dy = (Y + at.back - 20) / (Wt.at ? 230 : 200);
      const r = Math.hypot(dx, dy);
      if (r > 1.2) continue;
      // (the water heaving over him: lumps of it swelling and sinking, each lit on its side toward the light and dark on the other,
      // foam riding their tops in lace and clots, thicker the harder it boils)
      let hgt = 0;
      let gx = 0;
      let gy = 0;
      for (let m = 0; m < 12; m++) {
        const per = 0.7 + 0.6 * h3(m, 0, 0, 640);
        const ph = t / per + h3(m, 1, 0, 641);
        const rn = Math.floor(ph);
        const bx = (h3(m, rn, 2, 642) - 0.5) * 460;
        const by = (h3(m, rn, 3, 643) - 0.5) * 300 - at.back + 20;
        const br = 30 + 40 * h3(m, rn, 4, 644);
        const amp = Math.sin(frac(ph) * Math.PI) ** 1.5 * (1 - r / 1.2);
        const ex = (X - bx) / br;
        const ey = (Y - by) / br;
        const g = Math.exp(-(ex * ex + ey * ey)) * amp;
        hgt += g;
        gx += (-2 * ex * g) / br;
        gy += (-2 * ey * g) / br;
      }
      const B = Wt.boil;
      // (the light from his far left: up the screen is away from you)
      const shade = (-gx * 0.6 - gy * 0.8) * 110 * B;
      const dq = shade + bayer(i, j) * 0.3;
      if (dq > 0.75) pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 150);
      else if (dq > 0.4) pic.over(i, j, FOAM[3][0], FOAM[3][1], FOAM[3][2], 140);
      else if (dq > 0.15) pic.over(i, j, FOAM[2][0], FOAM[2][1], FOAM[2][2], 130);
      else if (dq < -0.3) pic.over(i, j, 0, 0, 0, Math.min(170, 70 + 120 * (-dq - 0.3)));
      // (its foam: in clumps and streaks riding the lumps, torn by the churn, never one even patch; parted over him where he is just
      // under the water, his dark lumps showing through it)
      const near = top.who[q] >= 0 && top.z[q] < -0.5 ? sm(-50, -8, top.z[q]) : 0;
      const clump = sm(0.38, 0.68, vn(X * 0.018 + t * 0.6, Y * 0.026 - t * 0.45, 646));
      const fdens = (sm(0.2, 0.85, hgt) * 0.75 + 0.3 * vn(X * 0.05 - t, Y * 0.07, 645)) * B * clump * (1 - 0.9 * near);
      const fl = lace(X - t * 6 + gx * 900, Y + t * 3 + gy * 900, fdens, 37);
      if (fl) pic.over(i, j, CREAM[fl - 1][0], CREAM[fl - 1][1], CREAM[fl - 1][2], 140 + 25 * fl);
      // (the water heaving up over him before he breaks it: its swell's crest catching the light, broken)
      if (hump > 0 && Math.abs(r - 0.5 * (1 - hump * 0.3) - (vn(X * 0.02, Y * 0.02, 607) - 0.5) * 0.12) < 0.03 && vn(X * 0.1, Y * 0.08 + t, 608) > 0.45 && Math.sin(Math.atan2(dy, dx)) < 0.3) pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 200 * hump);
    }
  }
  // HIS TENTACLES' BURSTS: the water bulging over each before it, a crown of it thrown up as it bursts, a ring of foam spreading
  if (ent || F.move === 'p1') {
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
          else if (d < dome && vn(X * 0.35 + t * 5, Y * 0.25, 611) > 0.9 - 0.12 * u) pic.over(i, j, FOAM[4][0], FOAM[4][1], FOAM[4][2], 220);
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
  // WHAT THE GAME DRAWS ON THE STONE AND THE WATER FOR THE TENTACLES, under them: the warnings, the cracks and splats of a slam, its
  // slime trail, the stone wet where a wave has passed, a smash's rings, a dying one's ichor and bubbles
  if (F.fx) armFxUnder(pic, F, top, S.water, t);
  if (F.sfx) shovelUnder(pic, F, top, S.water, t);
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
  // WATER POURING OFF HIM as he rises: sheets of it running down him, streams falling off his overhangs into the water (his shovel: as
  // he bursts up at the end, all of him out at once)
  if (F.sfx && F.sfx.pour > 0.02) shovelPour(pic, F, top, S.water);
  const pourK = -1;
  if (rose && k < EYE_ENTRANCE.rise[1] + 40) {
    const streams: Array<[number, number, number]> = [];
    for (let q = 0; q < n; q++) {
      if (top.who[q] !== 0 || top.z[q] < -0.5) continue;
      const i = q % CW;
      const j = (q / CW) | 0;
      const zp = top.z[q] + F.jaws.drop;
      const ke = pourK >= 0 ? pourK : emergedQ(zp);
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
  // FOAM DRAINING OFF WHAT LIES SLUMPED ROUND HIM AT THE WATER as it comes up: the wet foam it brings up with it, in clots and lace,
  // sliding down off it into the water, thinning as it drains
  if (rose && k < EYE_ENTRANCE.stalk[1]) {
    for (let q = 0; q < n; q++) {
      if (top.who[q] !== 0 || top.z[q] < -0.5 || top.z[q] > 46) continue;
      const zp = top.z[q] + F.jaws.drop;
      const age = (k - emergedQ(zp)) / EYE_FPS;
      if (age < 0 || age > 3.6) continue;
      const i = q % CW;
      const j = (q / CW) | 0;
      // (in streaks down it, sliding down as it drains)
      const ys = (j - HY) * R3 - age * 14;
      const run = sm(0.42, 0.7, vn(i * 0.07, ys * 0.012, 42));
      const dens = (1 - age / 3.6) ** 1.1 * (1 - top.z[q] / 46) * 0.9 * run;
      const fl = lace((i - HX) / SEEN, ys, dens, 41);
      if (fl) pic.over(i, j, CREAM[fl - 1][0], CREAM[fl - 1][1], CREAM[fl - 1][2], 130 + 25 * fl);
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
  // THE WATER SLAMS' WAVES AND THEIR CRASH, over the stone (in front of what is behind them)
  if (F.fx && (F.fx.waves.length || F.fx.crash !== null)) armWaves(pic, F.fx, top, S.water, t);
  // WHAT FLIES: the roar's slime and spittle; the crowns of water thrown up round his tentacles
  const flyers: Array<[Flyer, number]> = [];
  if (ent && roarS >= 0 && roarS < 3.4) for (const f of ROAR) flyers.push([f, roarS - f.t0]);
  if (ent || F.move === 'p1') Wt.bursts.forEach((B, idx) => {
    const s = (k - B.k) / EYE_FPS;
    if (s >= 0 && s < 1.6) for (const f of burstFlyers(B.x, B.y, idx + 1)) flyers.push([f, s - f.t0]);
  });
  // (the tentacles' own: what a slam on the stone throws, a smash into the water, his ichor, the crash)
  if (F.fx) for (const [f, s2] of armFlyers(F.fx)) flyers.push([f, s2]);
  if (F.sfx) for (const [f, s2] of shovelFlyers(F)) flyers.push([f, s2]);
  const hiddenAt = (i: number, j: number, nr: number): boolean => {
    if (i < 0 || j < 0 || i >= CW || j >= CH) return true;
    const q = j * CW + i;
    return top.who[q] >= 0 && top.z[q] >= -0.5 && top.near[q] > nr;
  };
  for (const [f, s] of flyers) {
    if (s < 0) continue;
    const land = landOf(f);
    const slime = f.kind === 1 || f.kind === 3 || f.kind === 4;
    const seed = f.seed ?? 0;
    // (A CHUNK OF THE PAVING: a broken piece, its top worn and lit, its broken sides dark, tumbling as it flies, bouncing on the stone,
    // settling and lying a while)
    if (f.kind === 6) {
      const C6 = chunkAt(f, s);
      if (C6.rest && s > 3.2) continue;
      const fadeC = 1 - sm(2.6, 3.2, s);
      const [ci, cj] = onCanvas(C6.x, C6.y, C6.z);
      const nr = C6.y * 0.8660254 + C6.z * 0.5;
      const sz = f.size;
      const ca = Math.cos(C6.turn);
      const sa = Math.sin(C6.turn);
      // (how much of its broken side shows as it tumbles: lying, a sliver)
      const side = C6.rest ? 0.25 : 0.25 + 0.75 * Math.abs(Math.sin(C6.turn * 1.3));
      // (its shadow on the stone under it)
      const [si, sj] = onCanvas(C6.x, C6.y, 0);
      for (let di = -sz; di <= sz; di++) {
        const i = Math.round(si + di);
        const j = Math.round(sj + 1);
        if (!hiddenAt(i, j, nr) && !S.water[j * CW + i]) pic.over(i, j, CRACK_C[0], CRACK_C[1], CRACK_C[2], 120 * fadeC * (1 - Math.abs(di) / (sz + 1)));
      }
      for (let dj = -sz - 3; dj <= sz + 3; dj++) for (let di = -sz - 1; di <= sz + 1; di++) {
        // (its top: an irregular broken shape, turned)
        const u = di * ca + dj * sa;
        const v = (-di * sa + dj * ca) * 1.6;
        const lobe = 1 + 0.25 * Math.sin(Math.atan2(v, u) * 3 + seed);
        const inTop = Math.hypot(u, v) < sz * 0.8 * lobe;
        // (its broken side, under its top: dark, rough)
        const v2 = (-di * sa + (dj - side * sz * 0.7) * ca) * 1.6;
        const inSide = !inTop && Math.hypot(u, v2) < sz * 0.8 * lobe;
        if (!inTop && !inSide) continue;
        const i = Math.round(ci + di);
        const j = Math.round(cj + dj);
        if (hiddenAt(i, j, nr)) continue;
        const c = inTop ? (u + v < -sz * 0.3 ? STONE_LIT : h3(i, j, seed, 7872) > 0.85 ? MOSS6 : STONE_MID) : h3(i, j, seed, 7873) > 0.5 ? STONE_DARK : CRACK_C;
        pic.over(i, j, c[0], c[1], c[2], 255 * fadeC);
      }
      continue;
    }
    // (a spark struck off the stone: a short bright streak along the way it flies, white-hot, cooling to gold and an ember, gone in a third
    // of a second)
    if (f.kind === 7) {
      if (s > 0.3) continue;
      const c = SPARK_C[s < 0.06 ? 0 : s < 0.13 ? 1 : s < 0.21 ? 2 : 3];
      const [x1, y1, z1] = flyAt(f, s);
      const [x0, y0, z0] = flyAt(f, Math.max(0, s - 0.03));
      const [i1, j1] = onCanvas(x1, y1, Math.max(0, z1));
      const [i0, j0] = onCanvas(x0, y0, Math.max(0, z0));
      const m = Math.max(1, Math.round(Math.hypot(i1 - i0, j1 - j0)));
      const nr = y1 * 0.8660254 + Math.max(0, z1) * 0.5;
      for (let q = 0; q <= m; q++) {
        const i = Math.round(i0 + ((i1 - i0) * q) / m);
        const j = Math.round(j0 + ((j1 - j0) * q) / m);
        if (hiddenAt(i, j, nr)) continue;
        pic.over(i, j, c[0], c[1], c[2], 255 * (0.45 + 0.55 * (q / m)));
      }
      continue;
    }
    // (a chip of the stone, or a splinter of his teeth: it lands and lies a moment)
    if (f.kind === 5 || f.kind === 8) {
      const [x, y, z] = s > land ? flyAt(f, land) : flyAt(f, s);
      const [ci, cj] = onCanvas(x, y, Math.max(0, z));
      if (s > land + 1.2) continue;
      const nr = y * 0.8660254 + Math.max(0, z) * 0.5;
      const i0 = Math.round(ci);
      const j0 = Math.round(cj);
      const ang = seed * 1.3 + Math.min(s, land) * 9;
      const sz = f.size;
      for (let dj = -sz; dj <= sz; dj++) for (let di = -sz; di <= sz; di++) {
        if (Math.abs(di * Math.cos(ang) + dj * Math.sin(ang)) + Math.abs(-di * Math.sin(ang) + dj * Math.cos(ang)) * 1.6 > sz + 0.3) continue;
        if (hiddenAt(i0 + di, j0 + dj, nr)) continue;
        const c = f.kind === 8 ? CREAM[di + dj < 0 ? 4 : 2] : di + dj < 0 ? STONE_LIT : STONE_DARK;
        pic.over(i0 + di, j0 + dj, c[0], c[1], c[2], 255 * (s > land ? 1 - sm(0.6, 1.2, s - land) : 1));
      }
      continue;
    }
    if (s > land) {
      const a2 = s - land;
      const [x, y] = flyAt(f, land);
      const [ci, cj] = onCanvas(x, y, 0);
      const i0 = Math.round(ci);
      const j0 = Math.round(cj);
      if (i0 < 2 || j0 < 2 || i0 >= CW - 2 || j0 >= CH - 2) continue;
      const onWater = S.water[j0 * CW + i0] === 1;
      const sz = f.kind === 3 ? f.size * 0.45 : f.kind === 1 || f.kind === 4 ? f.size : f.kind === 0 ? 0.8 : 1;
      if (onWater) {
        // (into the water: a crown of it thrown up round where it went in, drops jumping, a ring of foam spreading)
        const life = 0.3 + 0.12 * sz;
        if (a2 > life) continue;
        const u = a2 / life;
        const R = (1.5 + 3 * sz) * (0.4 + 1.6 * Math.sqrt(u));
        // (as many points as its rim has pixels, and more: a line, not dots)
        const nb2 = Math.max(24, Math.ceil(R * 2 * TAU * 1.6));
        for (let b = 0; b < nb2; b++) {
          const ang = (b / nb2) * TAU;
          // (its ring of water spreading, in broken arcs)
          if (vn(ang * 2.2 + seed, u * 2, 447) < 0.35) continue;
          const i = Math.round(ci + Math.cos(ang) * R);
          const j = Math.round(cj + Math.sin(ang) * R * 0.45);
          if (i < 0 || j < 0 || i >= CW || j >= CH || !S.water[j * CW + i]) continue;
          if (top.who[j * CW + i] >= 0 && top.z[j * CW + i] >= -0.5) continue;
          const c = u < 0.4 ? CREAM[3] : FOAM[4];
          pic.over(i, j, c[0], c[1], c[2], 220 * (1 - u));
        }
        if (sz > 1.2 && u < 0.6) {
          // (its crown: the rim of a little cup of water thrown up round it, its far side higher, and drops off its top)
          const h = sz * 1.6 * Math.sin((u / 0.6) * Math.PI);
          const rx = R * 0.7;
          const na3 = Math.max(24, Math.ceil(rx * TAU * 2));
          for (let a3 = 0; a3 < na3; a3++) {
            const ang = (a3 / na3) * TAU;
            // (only its far side and its ends stand up out of the water; its near side is lost in the splash)
            if (Math.sin(ang) > 0.35) continue;
            const far = Math.max(0, -Math.sin(ang));
            const i = Math.round(ci + Math.cos(ang) * rx);
            const j = Math.round(cj + Math.sin(ang) * rx * 0.4 - h * (0.4 + 0.6 * far));
            const c = far > 0.3 ? CREAM[3] : FOAM[4];
            pic.over(i, j, c[0], c[1], c[2], 220);
          }
          for (let d2 = 0; d2 < 3; d2++) {
            const ang = h3(seed, d2, 6, 441) * Math.PI;
            const out2 = R * 0.7 + 10 * u * h3(seed, d2, 7, 442);
            const up2 = sz * 6 * (u / 0.6) * (1 - u / 0.6) * 4;
            pic.over(Math.round(ci + Math.cos(ang) * out2 * (d2 % 2 ? -1 : 1)), Math.round(cj - up2 - h), SPRAY[0], SPRAY[1], SPRAY[2], 240);
          }
        }
        // (slime goes in dark, a slick of it on the water a moment)
        if (slime && u < 0.9) for (let di = -Math.round(sz); di <= Math.round(sz); di++) pic.over(i0 + di, j0, SLIME[1][0], SLIME[1][1], SLIME[1][2], 180 * (1 - u));
        continue;
      }
      // (onto the stone: a splat of it, flattened, flecks thrown out round it; lying a moment, then soaking away)
      if (!slime && f.kind !== 0) continue;
      const fade = 1 - sm(0.55, 1.4, a2);
      if (fade <= 0) continue;
      const w0 = f.kind === 0 ? 1.5 : sz * 3.4 * (0.6 + 0.4 * sm(0, 0.08, a2));
      const h0 = Math.max(1, w0 * 0.42);
      for (let dj = -Math.ceil(h0) - 1; dj <= Math.ceil(h0) + 1; dj++) {
        for (let di = -Math.ceil(w0) - 2; di <= Math.ceil(w0) + 2; di++) {
          const ang = Math.atan2(dj / h0, di / w0);
          const lobe = 1 + 0.28 * Math.sin(ang * 3 + seed) + 0.18 * Math.sin(ang * 5 + seed * 2);
          const d = Math.hypot(di / w0, dj / h0) / lobe;
          if (d > 1) continue;
          const R6 = f.kind === 4 ? ICHOR : seed % 5 < 2 ? MELT : SLIME;
          const c = f.kind === 0 ? SPIT[3] : d > 0.8 ? R6[0] : dj < -h0 * 0.2 && di < w0 * 0.2 ? R6[4] : d < 0.5 ? R6[3] : R6[2];
          pic.over(i0 + di, j0 + dj, c[0], c[1], c[2], 255 * fade);
        }
      }
      if (f.kind !== 0) {
        pic.over(i0 - Math.round(w0 * 0.3), j0 - Math.round(h0 * 0.4), SHEEN[0], SHEEN[1], SHEEN[2], 255 * fade);
        for (let fl = 0; fl < 5; fl++) {
          const ang = h3(seed, fl, 8, 443) * TAU;
          const rr = w0 * (1.3 + 0.8 * h3(seed, fl, 9, 444)) * sm(0, 0.06, a2);
          pic.over(Math.round(ci + Math.cos(ang) * rr), Math.round(cj + Math.sin(ang) * rr * 0.42), SLIME[2][0], SLIME[2][1], SLIME[2][2], 255 * fade);
        }
      }
      continue;
    }
    const [x, y, z] = flyAt(f, s);
    const [x0, y0, z0] = flyAt(f, Math.max(0, s - 1 / EYE_FPS));
    const [ci, cj] = onCanvas(x, y, z);
    const [pi, pj] = onCanvas(x0, y0, z0);
    const nr = y * 0.8660254 + z * 0.5;
    const vi = ci - pi;
    const vj = cj - pj;
    const vl = Math.hypot(vi, vj) || 1;
    const ui = vi / vl;
    const uj = vj / vl;
    const i0 = Math.round(ci);
    const j0 = Math.round(cj);
    if (f.kind === 0 || f.kind === 2) {
      // (a drop: a short streak along the way it flies, its head pale and lit, a glint)
      const len = Math.min(9, 1 + vl * 0.45);
      for (let st = 0; st <= len; st++) {
        const i = Math.round(ci - ui * st);
        const j = Math.round(cj - uj * st);
        if (hiddenAt(i, j, nr)) continue;
        const c = f.kind === 2 ? (st === 0 ? SPRAY : FOAM[3]) : st === 0 ? CREAM[4] : st < 3 ? SPIT[4] : SPIT[3];
        pic.over(i, j, c[0], c[1], c[2], st === 0 ? 255 : 210 * (1 - st / (len + 1)));
        if (f.size > 1 && st === 0 && !hiddenAt(i + 1, j, nr)) pic.over(i + 1, j, c[0], c[1], c[2], 220);
      }
      continue;
    }
    if (f.kind === 1 || f.kind === 4) {
      // (a gob of slime: a drop drawn out along the way it flies, round at its head, lit on its upper left, dark beneath, a glint; a
      // thread of it trailing)
      const r = f.size;
      const stretch = 1 + Math.min(1.6, vl * 0.08);
      for (let dj = -Math.ceil(r * stretch) - 1; dj <= Math.ceil(r * stretch) + 1; dj++) {
        for (let di = -Math.ceil(r * stretch) - 1; di <= Math.ceil(r * stretch) + 1; di++) {
          // (along its flight and across it)
          const al = di * ui + dj * uj;
          const ac = -di * uj + dj * ui;
          const back = al < 0 ? -al / stretch : al;
          const rr = r * (al < 0 ? 1 - 0.35 * Math.min(1, -al / (r * stretch)) : 1);
          if (Math.hypot(back, ac) > rr) continue;
          const i = i0 + di;
          const j = j0 + dj;
          if (hiddenAt(i, j, nr)) continue;
          // (slime, or the melt of his flesh; wet: its lit side pale, its rim dark)
          const lit = -(di + dj) / (r + 1);
          const R5 = f.kind === 4 ? ICHOR : seed % 5 < 2 ? MELT : SLIME;
          const edge = Math.hypot(back, ac) > rr - 0.9;
          const c = lit > 0.5 ? R5[4] : lit > 0.15 ? R5[3] : edge || lit < -0.45 ? R5[0] : R5[2];
          pic.over(i, j, c[0], c[1], c[2], 255);
        }
      }
      if (!hiddenAt(i0 - 1, j0 - 1, nr)) pic.over(i0 - Math.round(r * 0.4), j0 - Math.round(r * 0.45), 236, 240, 220, 255);
      const tl = Math.min(10, 2 + vl * 0.5);
      for (let st = Math.ceil(r * stretch); st <= tl + r * stretch; st++) {
        const i = Math.round(ci - ui * st + Math.sin(st * 0.7 + seed) * 0.6);
        const j = Math.round(cj - uj * st);
        if (!hiddenAt(i, j, nr)) pic.over(i, j, SLIME[1][0], SLIME[1][1], SLIME[1][2], 200 * (1 - (st - r * stretch) / (tl + 1)));
      }
      continue;
    }
    // (a sheet of slime, tumbling: a ribbon of it twisting as it flies, curling at its ends, its upper edge lit, holes torn in it)
    const L = f.size;
    const ang = seed * 1.7 + s * (5 + 4 * h3(seed, 1, 0, 445));
    const twist = Math.abs(Math.cos(s * 7 + seed));
    const thick = 1 + 2.2 * twist;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    for (let st = -L; st <= L; st += 0.5) {
      const bend = Math.sin((st / L) * 1.6 + s * 6) * L * 0.25;
      const cx = ci + ca * st - sa * bend;
      const cy = cj + (sa * st + ca * bend) * 0.8;
      const wth = thick * (1 - 0.6 * (Math.abs(st) / L) ** 2);
      for (let w2 = -Math.ceil(wth); w2 <= Math.ceil(wth); w2++) {
        if (Math.abs(w2) > wth) continue;
        if (vn(st * 0.6 + seed, w2 * 0.8, 446) < 0.18) continue;
        const i = Math.round(cx - sa * w2 * 0.6);
        const j = Math.round(cy + ca * w2);
        if (hiddenAt(i, j, nr)) continue;
        const c = w2 <= -wth + 1 ? SLIME[4] : w2 >= wth - 1 ? SLIME[0] : twist > 0.6 ? SLIME[3] : SLIME[2];
        pic.over(i, j, c[0], c[1], c[2], 255);
      }
    }
  }
  // THE PIECES BEFORE HIM, AND THE WARRIOR AT HIS SPOT, breathing (his shovel: but those on the stone, and the reeds off the end where
  // he is up; each where nothing of him or his tentacles is in front of it)
  if (!F.sfx) pic.lay(S.front, 0, 0, 0, 0);
  else {
    const P0 = S.shovel[F.sfx.up ?? 'none'];
    for (let q = 0; q < n; q++) {
      if (P0.pic.d[q * 4 + 3] === 0) continue;
      if (top.who[q] >= 0 && top.z[q] >= -0.5 && top.near[q] > P0.near[q]) continue;
      pic.over(q % CW, Math.floor(q / CW), P0.pic.d[q * 4], P0.pic.d[q * 4 + 1], P0.pic.d[q * 4 + 2], P0.pic.d[q * 4 + 3]);
    }
  }
  {
    // (the Warrior: at his spot, breathing; or, in the tentacles' films, where he has gone: running, striking)
    const Hh = F.hero;
    const [x, y] = Hh ? W(Hh.du, ARENA.quay + Hh.dv) : W(HERO_AT[0], HERO_AT[1]);
    const [sx, sy0] = P(CAM, x, y);
    pic.shadow(sx, sy0, 13 * (1 - Math.min(0.5, (Hh?.lift ?? 0) / 140)), 0.5);
    // (knocked flying: thrown up off the stone)
    const sy = sy0 - Math.round((Hh?.lift ?? 0) * 1.0);
    const set = Hh && Hh.view === 'front' ? hero.front : hero.back;
    let spr = set.idle[Math.floor(tf * (set.idleFps ?? 10)) % set.idle.length];
    if (Hh && Hh.act === 'run') spr = set.walk[Math.floor((Hh.f * (set.walkFps ?? 30)) / 30) % set.walk.length];
    if (Hh && Hh.act === 'attack' && set.clips?.attack) {
      const c = set.clips.attack;
      spr = c.frames[Math.min(c.frames.length - 1, Math.floor((Hh.f / 30) * c.fps))];
    }
    // (a dodge: his roll, or his leap if he has no roll; knocked flying: reeling, struck; down: his fall, lying, and getting back up out
    // of it)
    const C = set.clips;
    if (Hh && Hh.act === 'knock' && C?.reel) spr = C.reel.frames[Math.min(C.reel.frames.length - 1, Math.floor((Hh.f / 10) * C.reel.frames.length))];
    else if (Hh && Hh.act === 'down' && C?.fall) {
      const nf = C.fall.frames.length;
      const u = Hh.f < 6 ? 0.55 + 0.45 * (Hh.f / 6) : Hh.f < 14 ? 1 : Math.max(0, 1 - (Hh.f - 14) / 11);
      spr = C.fall.frames[Math.min(nf - 1, Math.round(u * (nf - 1) * 0.8))];
    } else if (Hh && Hh.act === 'roll' && (C?.roll || C?.leap)) {
      const c = (C.roll ?? C.leap) as NonNullable<typeof C.roll>;
      spr = c.frames[Math.min(c.frames.length - 1, Math.floor((Hh.f / 7) * c.frames.length))];
    } else if (Hh && (Hh.act === 'roll' || Hh.act === 'knock' || Hh.act === 'down') && C?.roll) {
      const c = C.roll;
      const fi = Hh.act === 'down' ? Math.min(c.frames.length - 1, Math.floor(c.frames.length * 0.55)) : Hh.act === 'knock' ? Math.floor(Hh.f * 0.9) % c.frames.length : Math.min(c.frames.length - 1, Math.floor((Hh.f / 30) * c.fps * 1.6));
      spr = c.frames[fi];
    }
    if (!F.sfx || !Hh) laySprite(pic, spr, sx, sy);
    else {
      // (his shovel: the Warrior hidden where a tentacle or he is in front of him; how near each pixel of him is, as his own layers'
      // nearness, each as high as it is over his feet)
      const one = new Pic(CW, CH, false);
      laySprite(one, spr, sx, sy);
      const yHis = (Hh.dv + ARENA.quay) * (32 / SEEN);
      const j0 = Math.max(0, Math.round(sy) - 140);
      const j1 = Math.min(CH, Math.round(sy) + 40);
      const i0 = Math.max(0, Math.round(sx) - 90);
      const i1 = Math.min(CW, Math.round(sx) + 90);
      for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
        const q = j * CW + i;
        if (one.d[q * 4 + 3] === 0) continue;
        const nr = yHis * 0.8660254 + Math.max(0, Math.round(sy0) - j) * 0.5;
        if (top.who[q] >= 0 && top.z[q] >= -0.5 && top.near[q] > nr) continue;
        pic.over(i, j, one.d[q * 4], one.d[q * 4 + 1], one.d[q * 4 + 2], one.d[q * 4 + 3]);
      }
    }
    // (struck: a flash of him, white and the enemy's red, for a few frames)
    if (Hh && Hh.act === 'knock' && Hh.f < 6 && Hh.f % 2 === 0) pic.light(sx, sy - 18, 34, [255, 230, 230], 0.5);
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
  return pic.crop(M + XM + (F.camX ?? 0) - F.shake[0] * 2, M + (F.camY ?? 0) - F.shake[1] * 2, SW, SH);
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
    for (let k = a; k <= b; k++) for (const L of layersOf(frameAt(mv, k))) want.set(fileOf(L), L);
  }
  // (EYE_ONLY: only layers whose keys begin so, e.g. J,S,T)
  const onlyKinds = (process.env.EYE_ONLY || '').split(',').filter((x) => x);
  if (onlyKinds.length) for (const [f, L] of [...want]) if (!onlyKinds.some((o) => L.key.startsWith(o))) want.delete(f);
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
  // (a range a b, or a list of frames a,b,c)
  const list = (process.argv[5] ?? '').includes(',') ? process.argv[5].split(',').map(Number) : null;
  const a = list ? list[0] : Number(process.argv[5] ?? 0);
  const b = list ? list[list.length - 1] : Number(process.argv[6] ?? MOVES[mv] - 1);
  fs.mkdirSync(out, { recursive: true });
  const t0 = Date.now();
  for (const k of list ?? Array.from({ length: b - a + 1 }, (_, i) => a + i)) {
    const F = frameAt(mv, k);
    const pic = frameOf(F, k / EYE_FPS);
    fs.writeFileSync(path.join(out, `${mv}_${String(k).padStart(3, '0')}.png`), pic.png());
  }
  process.stdout.write(`${mv} ${a}-${b}: ${list ? list.length : b - a + 1} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
} else if (mode === 'rekey') {
  // (layers painted before the marks were split: each but his tongue's moved to its new name; its painting is the same)
  let moved = 0;
  for (const mv of Object.keys(MOVES) as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    if (L.key.startsWith('T')) continue;
    const from = fileOf(L, PAINTER.all);
    const to = fileOf(L);
    if (from !== to && fs.existsSync(from) && !fs.existsSync(to)) {
      fs.renameSync(from, to);
      moved++;
    }
  }
  process.stdout.write(`moved ${moved}\n`);
} else if (mode === 'rekey2') {
  // (after a change to the painter that only paints his jaws pressed shut and his lids shut: each layer painted before it that is
  // neither (his jaws open 0.9 or more, his eye's lids open) moved to its new name; its painting is the same)
  const OLD = painterOf(process.argv[3]);
  let moved = 0;
  let kept = 0;
  for (const mv of Object.keys(MOVES) as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    const an = L.pose.anim;
    if (an && (an.open < 0.9 || (L.key.startsWith('T') && an.lids < 1))) continue;
    const from = fileOf(L, L.key.startsWith('T') ? OLD.all : OLD.rest);
    const to = fileOf(L);
    if (from !== to && fs.existsSync(from) && !fs.existsSync(to)) {
      fs.renameSync(from, to);
      moved++;
    } else if (fs.existsSync(to)) kept++;
  }
  process.stdout.write(`moved ${moved}, already there ${kept}\n`);
} else if (mode === 'rekey3') {
  // (after a change to the painter that only paints his tentacles: every layer but theirs painted before it moved to its new name)
  const OLD = painterOf(process.argv[3]);
  let moved = 0;
  for (const mv of ['stand', 'lurk', 'entrance'] as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    if (L.key.startsWith('A')) continue;
    const from = fileOf(L, L.key.startsWith('T') ? OLD.all : OLD.rest);
    const to = fileOf(L);
    if (from !== to && fs.existsSync(from) && !fs.existsSync(to)) {
      fs.renameSync(from, to);
      moved++;
    }
  }
  process.stdout.write(`moved ${moved}\n`);
} else if (mode === 'rekey4') {
  // (after a change to the painter that only paints a tentacle squashed flat (`ArmPose.squash`): every layer painted before it with
  // nothing squashed in it moved to its new name; its painting is the same)
  const OLD = painterOf(process.argv[3]);
  let moved = 0;
  for (const mv of Object.keys(MOVES) as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    if (((L.pose as ColossusPose).arms ?? []).some((a) => a.squash)) continue;
    const from = fileOf(L, L.key.startsWith('T') ? OLD.all : OLD.rest);
    const to = fileOf(L);
    if (from !== to && fs.existsSync(from) && !fs.existsSync(to)) {
      fs.renameSync(from, to);
      moved++;
    }
  }
  process.stdout.write(`moved ${moved}\n`);
} else if (mode === 'rekeyAll') {
  // (after a change to the painter that paints every layer before it the same (checked pixel for pixel): every layer moved to its new
  // name)
  const OLD = painterOf(process.argv[3]);
  let moved = 0;
  for (const mv of Object.keys(MOVES) as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    const from = fileOf(L, L.key.startsWith('T') || L.key.startsWith('VT') ? OLD.all : OLD.rest);
    const to = fileOf(L);
    if (from !== to && fs.existsSync(from) && !fs.existsSync(to)) {
      fs.renameSync(from, to);
      moved++;
    }
  }
  process.stdout.write(`moved ${moved}\n`);
} else if (mode === 'dump') {
  // (a frame's layers whose keys begin so, each on its own, black behind: to look at; and the heights in each)
  const [, , , mv, kS, pre, out] = process.argv;
  for (const L of layersOf(frameAt(mv as Move, Number(kS)))) {
    if (!L.key.startsWith(pre)) continue;
    const p = layer(L);
    const png = new Pic(p.w, p.h);
    let zl = Infinity;
    let zu = -Infinity;
    let n4 = 0;
    for (let s = 0; s < p.w * p.h; s++) {
      if (!p.kind[s]) continue;
      png.d[s * 4] = p.px[s * 3];
      png.d[s * 4 + 1] = p.px[s * 3 + 1];
      png.d[s * 4 + 2] = p.px[s * 3 + 2];
      zl = Math.min(zl, p.zh[s]);
      zu = Math.max(zu, p.zh[s]);
      if (p.kind[s] === 4) n4++;
    }
    const f = path.join(out, `${L.key.replace(/[^A-Za-z0-9.]/g, '_')}.png`);
    fs.writeFileSync(f, png.png());
    process.stdout.write(`${L.key}: ${p.w}x${p.h} at ${p.x0},${p.y0}; heights ${zl.toFixed(0)} to ${zu.toFixed(0)}; kind 4: ${n4}\n`);
  }
} else if (mode === 'count') {
  const want = new Set<string>();
  const byKind = new Map<string, number>();
  const only = process.argv.slice(3);
  for (const mv of Object.keys(MOVES) as Move[]) if (!only.length || only.includes(mv)) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    const f = fileOf(L);
    if (want.has(f)) continue;
    want.add(f);
    const kd = L.key.split('.')[0];
    byKind.set(kd, (byKind.get(kd) ?? 0) + 1);
  }
  const missing = new Map<string, number>();
  for (const f of want) if (!fs.existsSync(f)) {
    const kd = path.basename(f).split('.')[0];
    missing.set(kd, (missing.get(kd) ?? 0) + 1);
  }
  process.stdout.write(`${want.size} layers: ${[...byKind].map(([a, b]) => `${a} ${b}`).join(', ')}; painted ${[...want].filter((f) => fs.existsSync(f)).length}; to paint: ${[...missing].map(([a, b]) => `${a} ${b}`).join(', ')}\n`);
}
if (mode === 'cost3') {
  // (what his shovel costs, as painted here: each layer's box (two picture pixels to a game pixel, 4 bytes a pixel) and its packed file;
  // by what it is: his jaws, his drool, his tongue-eye at the ends; a tentacle's hook and its body; his stand's layers as he sinks and
  // rises at his place)
  const seen = new Set<string>();
  const by = new Map<string, { n: number; raw: number; packed: number }>();
  for (const mv of ['s1', 's2'] as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    const f = fileOf(L);
    if (seen.has(f) || !fs.existsSync(f)) continue;
    seen.add(f);
    const b = fs.readFileSync(f);
    const hl = b.readUInt32LE(0);
    const meta = JSON.parse(b.subarray(4, 4 + hl).toString()) as { w: number; h: number };
    const kd = L.key.startsWith('VJ') ? 'his jaws at an end' : L.key.startsWith('VS') ? 'his drool at an end' : L.key.startsWith('VT') ? 'his tongue-eye at an end' : L.key.startsWith('AH') ? 'a tentacle\'s hook' : L.key.startsWith('AB') ? 'a tentacle\'s body' : 'his stand at his place';
    const e = by.get(kd) ?? { n: 0, raw: 0, packed: 0 };
    e.n++;
    e.raw += meta.w * meta.h * 4;
    e.packed += b.length;
    by.set(kd, e);
  }
  let n = 0;
  let raw = 0;
  let packed = 0;
  for (const [k, e] of by) {
    process.stdout.write(`${k}: ${e.n} layers, ${(e.raw / 1e6).toFixed(1)} MB raw (${(e.raw / e.n / 1e6).toFixed(2)} MB a layer), ${(e.packed / 1e6).toFixed(1)} MB packed\n`);
    n += e.n;
    raw += e.raw;
    packed += e.packed;
  }
  process.stdout.write(`all: ${n} layers, ${(raw / 1e6).toFixed(1)} MB raw, ${(packed / 1e6).toFixed(1)} MB packed\n`);
}
if (mode === 'cost') {
  // (what the tentacles cost, as painted here: each layer's box (two picture pixels to a game pixel, 4 bytes a pixel), and its packed
  // file; by what it is: standing, a slam or a water slam, struck, dying, bursting, the fan's)
  const seen = new Set<string>();
  const by = new Map<string, { n: number; raw: number; packed: number; px: number }>();
  for (const mv of ['p1', 'p2', 'fan'] as Move[]) for (let k = 0; k < MOVES[mv]; k++) for (const L of layersOf(frameAt(mv, k))) {
    if (!L.key.startsWith('A')) continue;
    const f = fileOf(L);
    if (seen.has(f) || !fs.existsSync(f)) continue;
    seen.add(f);
    const b = fs.readFileSync(f);
    const hl = b.readUInt32LE(0);
    const meta = JSON.parse(b.subarray(4, 4 + hl).toString()) as { w: number; h: number };
    const part = L.key.split('.')[1];
    const kd = part === 's' ? 'stand' : part === 'fan' ? 'fan' : part[0] === 'b' ? 'burst' : part[0] === 'f' ? 'struck' : part[0] === 'd' ? 'death' : L.key[1] === '0' || L.key[1] === '2' ? 'water slam' : 'slam';
    const e = by.get(kd) ?? { n: 0, raw: 0, packed: 0, px: 0 };
    e.n++;
    e.raw += meta.w * meta.h * 4;
    e.px += meta.w * meta.h;
    e.packed += b.length;
    by.set(kd, e);
  }
  for (const [k, e] of by) process.stdout.write(`${k}: ${e.n} layers, ${(e.raw / 1e6).toFixed(1)} MB raw (${(e.raw / e.n / 1e6).toFixed(2)} MB a layer, ${(e.px / e.n / 1000).toFixed(0)}k pixels), ${(e.packed / 1e6).toFixed(1)} MB packed\n`);
}
