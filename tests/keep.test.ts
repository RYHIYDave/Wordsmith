// FLOOR 19, THE KEEP: ITS GROUND (src/art/keep.ts, painted by src/art/terrain.ts), checked as the Swan Gardens' is
// (tests/swangardens.test.ts), on a stretch of the Keep laid by hand: a wall walk along the back, open to the sky; the
// throne hall; the barracks and the armoury either side of it; a gallery across the front; below it the bailey, open to
// the sky, the gate passage out of it, and the king's bedchamber. The checks:
//   - nothing of the game imports it;
//   - walkable tiles are floor, every other tile's middle is wall (the Keep has no drop);
//   - two pieces side by side are one picture, the same every time; every pixel opaque;
//   - his rulebook: nothing cyan, no pink, every colour under the dullest word's (Colour 3 and 4); its own palette (the doc's
//     "Cold stone, royal blue, old gold"): cold stone the most of what is walked on, royal blue on the throne hall's walls,
//     old gold in their band and stars;
//   - open to the sky over the wall walk and over the bailey's far walls, the night sky (stars in it); indoors, the walls'
//     tops fade into the dark;
//   - each room its own floor: the throne hall's chequer, the barracks' rushes, the armoury's oil, the bedchamber's oak, the
//     bailey's setts and its puddles.
//   run: tsx --test tests/keep.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { KP_OAK, KP_PUDDLE, KP_RUSH, KP_SKY, KP_SLATE, KP_STAR, KP_STONE, KP_ZONE, keepTerrain, paintKeepGround } from '../src/art/keep';
import { quietRGB } from '../src/art/act2_quiet';
import { WORD_COLOR } from '../src/art/icons';
import { TK, pictureOf } from '../src/art/terrain';
import type { RGB } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const W = 44;
const H = 40;
type Rect = readonly [number, number, number, number];
const ROOMS: readonly (readonly [Rect, number])[] = [
  [[4, 2, 40, 4], KP_ZONE.Walk],
  [[14, 7, 28, 18], KP_ZONE.Throne],
  [[4, 8, 12, 17], KP_ZONE.Armoury],
  [[30, 8, 40, 17], KP_ZONE.Barracks],
  [[2, 20, 42, 23], KP_ZONE.Hall],
  [[10, 26, 28, 37], KP_ZONE.Bailey],
  [[28, 30, 40, 33], KP_ZONE.Gate],
  [[1, 26, 8, 35], KP_ZONE.Chamber],
  // the ways between
  [[12, 11, 14, 13], KP_ZONE.Armoury],
  [[28, 11, 30, 13], KP_ZONE.Barracks],
  [[20, 18, 22, 20], KP_ZONE.Hall],
  [[17, 23, 19, 26], KP_ZONE.Hall],
  [[3, 23, 5, 26], KP_ZONE.Chamber],
];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H).fill(KP_ZONE.Hall);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [r, z] of ROOMS) if (inR(r, x, y)) {
  tiles[y * W + x] = T_FLOOR;
  zone[y * W + x] = z;
}
const FLOOR = { depth: 19, seed: 19, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 20, y: 12 } } as unknown as Floor;
const T = keepTerrain(FLOOR, { zone: (tx, ty) => zone[ty * W + tx] });
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -140;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 180;
const WHOLE = paintKeepGround(T, X0, Y0, WW, HH);
const at = (x: number, y: number): [number, number] => {
  const [px, py] = pictureOf(x, y);
  return [Math.floor(px) - X0, Math.floor(py) - Y0];
};
const colAt = (c: number, r: number): RGB => {
  const i = (r * WW + c) * 4;
  return [WHOLE.rgba[i], WHOLE.rgba[i + 1], WHOLE.rgba[i + 2]];
};
const kindAt = (c: number, r: number): number => WHOLE.kind[r * WW + c];
const key = (c: readonly number[]): string => c.map((v) => Math.round(v)).join(',');
const keys = (cs: readonly RGB[]): Set<string> => new Set(cs.flatMap((c) => [key(c), key(quietRGB(c))]));

function hsv([r, g, b]: RGB): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, mx ? d / mx : 0, mx / 255];
}
const hexRgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

test('nothing of the game imports the Keep\'s ground', () => {
  const art = new Set(['art/keep']);
  const atp = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (its own pieces, art/floor19.ts, may take its colours from it: they too are a mock-up nothing of the game imports)
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(keep|floor19)\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(atp(dir, spec)), `src/${f} imports the Keep's ground`);
    }
  }
});

test('every walkable tile\'s middle is floor; every other tile\'s middle is wall; there is no drop', () => {
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const walk = tiles[ty * W + tx] === T_FLOOR;
      assert.equal(T.ground(tx + 0.5, ty + 0.5), walk, `tile ${tx},${ty}: floor ${T.ground(tx + 0.5, ty + 0.5)}`);
      assert.ok(!T.drop(tx + 0.5, ty + 0.5), `tile ${tx},${ty} is a drop`);
    }
  }
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const x0 = X0 + 900;
  const y0 = Y0 + 400;
  const one = paintKeepGround(T, x0, y0, 200, 160);
  const again = paintKeepGround(T, x0, y0, 200, 160);
  assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
  const parts = [paintKeepGround(T, x0, y0, 120, 70), paintKeepGround(T, x0 + 120, y0, 80, 70), paintKeepGround(T, x0, y0 + 70, 200, 90)];
  for (let r = 0; r < 160; r++) {
    for (let c = 0; c < 200; c++) {
      const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
      const pc = r < 70 && c >= 120 ? c - 120 : c;
      const pr = r < 70 ? r : r - 70;
      for (let k = 0; k < 4; k++) if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
    }
  }
});

test('every pixel is opaque', () => {
  for (let i = 0; i < WHOLE.kind.length; i++) {
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
    assert.ok(WHOLE.kind[i] !== TK.Drop, `a drop at ${i}`);
  }
});

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4); cold stone, royal blue, old gold (Colour 1)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  let cold = 0;
  let field = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s, v] = hsv(c);
    if (WHOLE.kind[i] === TK.Floor) {
      field++;
      if (h >= 200 && h < 260) cold++;
    }
    if (v < 0.12) continue;
    most = Math.max(most, s);
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
  }
  assert.ok(most < dullest, `the Keep's richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(cold > 0.5 * field, `cold stone ${cold} of ${field} walked on`);
  // the throne hall's far wall (looking +y, its foot along y = 7): royal blue over its dado, old gold in its band and stars
  let blue = 0;
  let gold = 0;
  let all = 0;
  for (let x = 15; x < 27; x += 0.25) {
    const [c, r] = at(x, 7);
    for (let v = 34; v < 64; v++) {
      if (kindAt(c, r - v) !== TK.Face) continue;
      all++;
      const [h, s] = hsv(colAt(c, r - v));
      if (s > 0.15 && h >= 215 && h < 250) blue++;
      if (s > 0.2 && h >= 28 && h < 55) gold++;
    }
  }
  assert.ok(blue > 0.5 * all, `royal blue on the throne hall's wall: ${blue} of ${all}`);
  assert.ok(gold > 0.02 * all, `old gold on it: ${gold} of ${all}`);
});

test('open to the sky over the wall walk and the bailey\'s far walls, stars in it; indoors the walls fade into the dark', () => {
  const skyK = keys([...KP_SKY, ...KP_STAR]);
  // over the wall walk's far edge (y = 2), all the way up
  let s = 0;
  let n = 0;
  let stars = 0;
  for (let x = 6; x < 38; x += 0.5) {
    const [c, r] = at(x, 2);
    for (let v = 4; v < 100; v++) {
      n++;
      const k = key(colAt(c, r - v));
      if (skyK.has(k)) s++;
      if (keys(KP_STAR).has(k)) stars++;
    }
  }
  assert.ok(s > 0.9 * n, `the sky over the wall walk: ${s} of ${n}`);
  // (stars across the whole of the sky)
  let allStars = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) if (keys(KP_STAR).has(key([WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]]))) allStars++;
  assert.ok(allStars > 5, `stars: ${allStars} (${stars} over the walk)`);
  // over the bailey's far wall (looking +y, its foot along y = 26): merlons, and the sky between them, above its curtain
  let sk = 0;
  let st = 0;
  for (let x = 11; x < 27; x += 0.25) {
    const [c, r] = at(x, 26);
    for (let v = 82; v < 92; v++) {
      if (skyK.has(key(colAt(c, r - v)))) sk++;
      else st++;
    }
  }
  assert.ok(sk > 0.25 * (sk + st) && st > 0.25 * (sk + st), `the bailey's crenels: sky ${sk}, merlons ${st}`);
  // the throne hall's far wall: dark at its top, never the sky
  let dk = 0;
  let m = 0;
  for (let x = 15; x < 27; x += 0.5) {
    const [c, r] = at(x, 7);
    for (let v = 90; v < 96; v++) {
      m++;
      const col = colAt(c, r - v);
      if (hsv(col)[2] < 0.14) dk++;
      assert.ok(!skyK.has(key(col)) || hsv(col)[2] < 0.1, `the sky on the throne hall's wall at ${x}, ${v}`);
    }
  }
  assert.ok(dk > 0.8 * m, `the dark at the top of the throne hall's wall: ${dk} of ${m}`);
});

test('each room its own floor: the chequer, the rushes, the oil, the oak, the setts and the puddles', () => {
  const sample = (r: Rect, f: (c: RGB) => boolean): [number, number] => {
    let k = 0;
    let n = 0;
    for (let y = r[1] + 0.6; y < r[3] - 0.6; y += 0.13) {
      for (let x = r[0] + 0.6; x < r[2] - 0.6; x += 0.13) {
        const [c, rr] = at(x, y);
        if (kindAt(c, rr) !== TK.Floor) continue;
        n++;
        if (f(colAt(c, rr))) k++;
      }
    }
    return [k, n];
  };
  // the chequer: flags of grey stone and of slate, about half and half
  const slate = keys(KP_SLATE.slice(1));
  const stone = keys(KP_STONE.slice(1));
  const [sl, n0] = sample([15, 8, 27, 17], (c) => slate.has(key(c)));
  const [sn] = sample([15, 8, 27, 17], (c) => stone.has(key(c)));
  assert.ok(sl > 0.3 * n0 && sn > 0.3 * n0, `the throne hall's chequer: ${sl} slate and ${sn} stone of ${n0}`);
  const rush = keys(KP_RUSH);
  const [r1, n1] = sample([30, 8, 40, 17], (c) => rush.has(key(c)));
  assert.ok(r1 > 0.04 * n1, `the barracks' rushes: ${r1} of ${n1}`);
  const [o1, n2] = sample([4, 8, 12, 17], (c) => hsv(c)[2] < 0.2 && !stone.has(key(c)) && !slate.has(key(c)));
  assert.ok(o1 > 0.03 * n2, `the armoury's oil: ${o1} of ${n2}`);
  const oak = keys(KP_OAK);
  const [k1, n3] = sample([1, 26, 8, 35], (c) => oak.has(key(c)) || (hsv(c)[0] > 10 && hsv(c)[0] < 40));
  assert.ok(k1 > 0.8 * n3, `the bedchamber's oak: ${k1} of ${n3}`);
  const pud = keys(KP_PUDDLE);
  const [p1, n4] = sample([10, 26, 28, 37], (c) => pud.has(key(c)));
  assert.ok(p1 > 0.01 * n4, `the bailey's puddles: ${p1} of ${n4}`);
});
