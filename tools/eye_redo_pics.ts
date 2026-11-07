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
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { fenLook } from '../src/art/fen';
import { fenPieces } from '../src/art/floor10';
import { paintTerrain, terrainOf } from '../src/art/terrain';
import type { Terrain } from '../src/art/terrain';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { ARMS_UNDER, COLOSSUS, costOf, paintColossus, poseArm, poseRisen, poseUnder } from '../src/art/eye_colossus';
import type { ColossusPicture, ColossusPose } from '../src/art/eye_colossus';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const fs = nodeFs as { mkdirSync(p: string, o: { recursive: boolean }): void; writeFileSync(p: string, d: unknown): void };
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
export const ARENA = { half: 15, quay: 8.4, deep: 17 } as const;
const onStone = (x: number, y: number): boolean => Math.abs(x - y - UC) <= ARENA.half && x + y - VC >= ARENA.quay && x + y - VC <= ARENA.quay + ARENA.deep;
const poolD = (x: number, y: number): number => (x + y - VC >= ARENA.quay ? 9 : Math.hypot((x - y - UC) / 44, (x + y - VC) / 30));

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
  put('mossy stones', -9, ARENA.quay + 9.5, 0);
  put('fallen column drums', 11.5, ARENA.quay + 11, 0, 22);
  put('mossy stones', 7, ARENA.quay + 1.4, 0);
  put('lily pads', -12, ARENA.quay - 1.5, 0);
  put('lily pads', 13, ARENA.quay - 2.2, 0);
  return out;
}

/** Him laid on a picture: his middle at the water at (`sx`, `sy`); his eye's light over it. */
function layHim(pic: Pic, c: ColossusPicture, sx: number, sy: number): void {
  pic.lay(c.px, c.ax, c.ay, sx, sy);
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

/** His risen picture: a window on him big enough for all of him and his arms. */
const RISEN_FRAME = { w: 1060, h: 600, ax: 530, ay: 360 };
function measureOf(c: ColossusPicture): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let j = 0; j < c.px.h; j++) for (let i = 0; i < c.px.w; i++) {
    if (c.px.d[(j * c.px.w + i) * 4 + 3] < 200) continue;
    x0 = Math.min(x0, i);
    x1 = Math.max(x1, i);
    y0 = Math.min(y0, j);
    y1 = Math.max(y1, j);
  }
  return { x0, y0, x1, y1 };
}

const mode = process.argv[2];
if (mode === 'look') {
  const risen = timed('risen', () => paintColossus(poseRisen(0), RISEN_FRAME));
  const m = measureOf(risen);
  process.stdout.write(`  risen spans ${m.x1 - m.x0 + 1} x ${m.y1 - m.y0 + 1} picture pixels (${(m.x1 - m.x0 + 1) / 2} x ${(m.y1 - m.y0 + 1) / 2} game pixels); top ${m.y0 - RISEN_FRAME.ay} from the water\n`);
  // 1. RISEN, FRONT, the Warrior before him for size
  {
    const w = 1200;
    const h = 640;
    const cam = camAt(600, 392);
    const pic = groundPic(w, h, cam);
    const stands = dressing(pic, cam);
    stands.push({ d: VC, f: () => layHim(pic, risen, 600, 392) });
    stands.push(layHero(pic, cam, 4.2, ARENA.quay + 2.2, true));
    stands.push(layHero(pic, cam, -4.6, ARENA.quay + 2.0, false));
    stands.sort((a, b) => a.d - b.d).forEach((s) => s.f());
    save('look_risen.png', pic, 'HIM RISEN, FROM IN FRONT, AT THE GAME\'S SIZE', `The Warrior on the stone before him, twice, as the game paints him (from behind and from in front). He is ${Math.round((m.x1 - m.x0 + 1) / 2)} game pixels across with his arms and ${Math.round((risen.ay - m.y0) / 2)} tall over the water: the knight is 29.`);
  }
  // 2. FROM BEHIND, small (half the game's size)
  {
    const back = timed('back', () => paintColossus(poseRisen(0, 'back'), { w: 560, h: 320, ax: 280, ay: 190, zoom: 0.5 }));
    const pic = groundPic(600, 300, camAt(300, 180));
    layHim(pic, back, 300, 180);
    save('look_back.png', pic, 'FROM BEHIND (HALF SIZE)', 'His back: the hill of him, moss and weed over it, the beast\'s skull and the great ribs grown into his shoulders, the stones sunk in his crown; his three arms rising either side.');
  }
  // 3. HIS EYE AND MAW, close: shut, and torn open
  {
    const faceWin = { w: 300, h: 290, ax: 150, ay: 190 };
    const shut = risen;
    const open = timed('open', () => paintColossus(poseRisen(1), { ...faceWin }));
    const g = groundPic(300, 290, camAt(150, 190));
    const a = new Pic(300, 290);
    a.d.set(g.d);
    a.lay(shut.px, shut.ax, shut.ay, 150, 190);
    const b = new Pic(300, 290);
    b.d.set(g.d);
    b.lay(open.px, open.ax, open.ay, 150, 190);
    const both = new Pic(600, 290);
    both.lay(a, 0, 0, 0, 0);
    both.lay(b, 0, 0, 300, 0);
    save('look_face.png', both, 'HIS EYE AND MAW, TWICE THE SIZE: SHUT, AND TORN OPEN', 'His eye under his brow, looking at you: bloodshot, its iris the enemy\'s pink burning to gold round a black slit, between raw red lids. His maw split down the middle: shut, its teeth locked across the split; torn open, its lips pulled apart sideways and the rows of teeth along both.', 2);
  }
  // 4. ONE TENTACLE, close
  {
    const arm = timed('arm', () => paintColossus(poseArm(), { w: 260, h: 340, ax: 150, ay: 300 }));
    const cam = camAt(150, 300);
    const pic = groundPic(260, 340, cam);
    pic.lay(arm.px, arm.ax, arm.ay, 150, 300);
    const two = new Pic(600, 360);
    const g2 = groundPic(600, 360, camAt(300, 330));
    two.d.set(g2.d);
    save('look_arm.png', pic, 'ONE TENTACLE, TWICE THE SIZE', 'Each tentacle an enemy of its own: thick, slick, mottled and scarred along its back; pale beneath, suckers in two rows along the inside of its curl; weed and slime hanging off it; foam where it breaks the water.', 2);
  }
  // 5. UNDER THE WATER (phase 1)
  {
    const under = timed('under', () => paintColossus({ ...poseUnder(), arms: [] }, RISEN_FRAME));
    const w = 1200;
    const h = 460;
    const cam = camAt(600, 300);
    const pic = groundPic(w, h, cam);
    const stands = dressing(pic, cam);
    stands.push({ d: VC, f: () => layHim(pic, under, 600, 300) });
    stands.push(layHero(pic, cam, 3.2, ARENA.quay + 2.2, true));
    stands.sort((a, b) => a.d - b.d).forEach((s) => s.f());
    save('look_under.png', pic, 'UNDER THE WATER (PHASE 1)', `Only his eye's fire and the dark hill of him seen through the black water: his crown ${COLOSSUS.sunk - COLOSSUS.tall} under it, his eye ${COLOSSUS.sunk - COLOSSUS.eye.z} down, looking up at you; he lies further out than he rises.`);
  }
} else if (mode === 'arena') {
  // THE PHONE'S SCREEN: 507 x 234 game pixels (engine/screen.ts on a phone held sideways), two picture pixels to each
  const SW = 1014;
  const SH = 468;
  // (where his middle at the water is on the screen: the camera leaned toward him so that the hero stands low, as the Moth's does)
  const HX = 507;
  const HY = 214;
  const heroAt: [number, number] = [-1.5, ARENA.quay + 3.0];
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
  const p1 = timed('phase 1', () => paintColossus({ ...poseUnder(), arms: ARMS_UNDER }, RISEN_FRAME));
  shot(p1, 'arena_p1', 'PHASE 1: HE LIES UNDER THE BLACK WATER; TWO TENTACLES BURST UP', 'The stone a big rectangle across the screen and on down past its foot; the black water across the top, still but for his two arms, his eye\'s fire under it. Kill both.');
  const p2 = timed('phase 2', () => paintColossus(poseRisen(0), RISEN_FRAME));
  shot(p2, 'arena_p2', 'PHASE 2: HE HAS RISEN, FILLING THE TOP OF THE SCREEN, THREE TENTACLES', 'He fills the top of the screen and looms over the hero; his three arms out of the water before him, his body attacking too.');
  const c = costOf(30, 1);
  process.stdout.write(`  cost: a frame 860 x 540: ${c.frameMB.toFixed(2)} MB; at 30 a second ${c.perSecondMB.toFixed(1)} MB a second\n`);
}
fs.writeFileSync(path.join(out, 'sheet.json'), JSON.stringify(sheet, null, 1));
process.stdout.write(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
