// FLOOR 20, THE QUIET TOWER: ITS GROUND (src/art/quiettower.ts, painted by src/art/terrain.ts), checked as the Swan
// Gardens' is (tests/swangardens.test.ts), on two stretches laid by hand: the tower's inside (four rooms, one of each kind:
// the scriptorium, the bell-less belfry, a room the fog has filled, the stair's landing) and its top (a round platform,
// the parapet the ring of tiles round it, the drop past that). The checks:
//   - nothing of the game imports it;
//   - inside, walkable tiles are floor and every other tile's middle is wall; on the top, walkable tiles floor, the
//     parapet's tiles neither floor nor the drop, every tile past them the drop;
//   - two pieces side by side are one picture, the same every time, both looks; every pixel opaque, the fog sea in the drop;
//   - his rulebook: nothing cyan, no pink, every colour under the dullest word's (Colour 3 and 4); the doc's palette ("Grey
//     fog, bone white, no colour at all."): nearly every pixel all but colourless, and yet strong values, so it reads
//     (the flags' joints dark against their faces, never mud);
//   - the walls fade into the dark at their tops (into the fog in a fogged room); each room shows what it is (the
//     scriptorium's dry ink, the belfry's boards, the fogged room's fog);
//   - the parapet is crenellated: through each embrasure the fog sea, over each merlon its coping; under the near parapet
//     the tower's outer wall, its stone lost in the fog as it goes down.
//   run: tsx --test tests/quiettower.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { PARAPET_H, QT_BOARD, QT_DEEP, QT_FOG, QT_INK, QT_RISE, QT_ZONE, embrasure, fogSea, paintQuietTower, quietTowerTerrain, towerTopTerrain } from '../src/art/quiettower';
import { WORD_COLOR } from '../src/art/icons';
import { TK, pictureOf } from '../src/art/terrain';
import type { RGB, Terrain, TerrainPiece } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const W = 40;
const H = 40;
const floorOf = (tiles: Uint8Array): Floor => ({ depth: 20, seed: 20, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 5 } } as unknown as Floor);

// THE INSIDE: four rooms, 14 tiles square, a wall of 4 between them
type Rect = [number, number, number, number];
const ROOMS: [Rect, number][] = [
  [[3, 3, 17, 17], QT_ZONE.Scriptorium],
  [[21, 3, 35, 17], QT_ZONE.Belfry],
  [[3, 21, 17, 35], QT_ZONE.Fogged],
  [[21, 21, 35, 35], QT_ZONE.Stair],
];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const inTiles = new Uint8Array(W * H).fill(T_WALL);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ROOMS.some(([r]) => inR(r, x, y))) inTiles[y * W + x] = T_FLOOR;
const IN_FLOOR = floorOf(inTiles);
const IN = quietTowerTerrain(IN_FLOOR, { zone: (tx, ty) => ROOMS.find(([r]) => inR(r, tx, ty))?.[1] ?? QT_ZONE.Stair });

// THE TOP: a round platform 12 tiles from its middle
const C: [number, number] = [20, 20];
const topTiles = new Uint8Array(W * H).fill(T_WALL);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.hypot(x + 0.5 - C[0], y + 0.5 - C[1]) < 12) topTiles[y * W + x] = T_FLOOR;
const TOP_FLOOR = floorOf(topTiles);
const TOP = towerTopTerrain(TOP_FLOOR, { centre: C });
const isTop = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && topTiles[y * W + x] === T_FLOOR;
const nextToTop = (x: number, y: number): boolean => {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (isTop(x + dx, y + dy)) return true;
  return false;
};

/** The whole of a stretch, painted. */
function whole(T: Terrain): { P: TerrainPiece; X0: number; Y0: number; WW: number } {
  const [ax] = pictureOf(0, H);
  const [bx] = pictureOf(W, 0);
  const X0 = Math.floor(ax) - 40;
  const Y0 = -200;
  const WW = Math.ceil(bx - ax) + 80;
  const HH = Math.ceil(pictureOf(W, H)[1]) + 400;
  return { P: paintQuietTower(T, X0, Y0, WW, HH), X0, Y0, WW };
}
const INW = whole(IN);
const TOPW = whole(TOP);
const colOf = (w: { P: TerrainPiece }, i: number): RGB => [w.P.rgba[i * 4], w.P.rgba[i * 4 + 1], w.P.rgba[i * 4 + 2]];
/** The picture's pixel (in a stretch painted whole) under the world's (x, y), raised `up` picture pixels. */
const idx = (w: { X0: number; Y0: number; WW: number }, x: number, y: number, up = 0): number => {
  const [px, py] = pictureOf(x, y);
  return (Math.floor(py) - up - w.Y0) * w.WW + (Math.floor(px) - w.X0);
};

test('nothing of the game imports the Quiet Tower\'s ground', () => {
  const art = new Set(['art/quiettower']);
  const atp = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (its own pieces, art/floor20.ts, take the belfry's boards from it: they too are a mock-up nothing of the game imports)
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(quiettower|floor20)\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(atp(dir, spec)), `src/${f} imports the Quiet Tower's ground`);
    }
  }
});

test('inside, every walkable tile\'s middle is floor and every other\'s is wall; on the top, the parapet the ring round the floor and the drop past it', () => {
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const walk = inTiles[ty * W + tx] === T_FLOOR;
      assert.equal(IN.ground(tx + 0.5, ty + 0.5), walk, `inside: tile ${tx},${ty}`);
      assert.ok(!IN.drop(tx + 0.5, ty + 0.5), `inside: tile ${tx},${ty} falls away`);
      const top = isTop(tx, ty);
      assert.equal(TOP.ground(tx + 0.5, ty + 0.5), top, `the top: tile ${tx},${ty}`);
      if (!top) assert.equal(TOP.drop(tx + 0.5, ty + 0.5), !nextToTop(tx, ty), `the top: tile ${tx},${ty}: the drop ${TOP.drop(tx + 0.5, ty + 0.5)}`);
    }
  }
});

test('two pieces side by side are one picture, and it is the same every time (the inside and the top)', () => {
  for (const T of [IN, TOP]) {
    const x0 = INW.X0 + 700;
    const y0 = 300;
    const one = paintQuietTower(T, x0, y0, 200, 160);
    const again = paintQuietTower(T, x0, y0, 200, 160);
    assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
    const parts = [paintQuietTower(T, x0, y0, 120, 70), paintQuietTower(T, x0 + 120, y0, 80, 70), paintQuietTower(T, x0, y0 + 70, 200, 90)];
    for (let r = 0; r < 160; r++) {
      for (let c = 0; c < 200; c++) {
        const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
        const pc = r < 70 && c >= 120 ? c - 120 : c;
        const pr = r < 70 ? r : r - 70;
        for (let k = 0; k < 4; k++) if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
      }
    }
  }
});

test('every pixel is opaque, the fog sea painted into the drop', () => {
  let drop = 0;
  for (const w of [INW, TOPW]) {
    for (let i = 0; i < w.P.kind.length; i++) {
      assert.equal(w.P.rgba[i * 4 + 3], 255);
      if (w.P.kind[i] === TK.Drop) drop++;
    }
  }
  assert.ok(drop > 20000, `the drop: ${drop} pixels`);
});

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
const key = (c: readonly number[]): string => c.map(Math.round).join(',');

test('no cyan and no pink, duller than every word\'s colour (Colour 3 and 4); no colour at all, and yet strong values (the doc\'s palette)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const [name, w] of [['inside', INW], ['the top', TOPW]] as const) {
    let most = 0;
    let grey = 0;
    let all = 0;
    const lum: number[] = [];
    for (let i = 0; i < w.P.kind.length; i++) {
      const c = colOf(w, i);
      const [h, s, v] = hsv(c);
      if (w.P.kind[i] === TK.Floor) lum.push(0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]);
      if (v < 0.12) continue;
      // (colourless: what is light enough to have a colour at all has next to none)
      if (v >= 0.2) {
        all++;
        if (s < 0.2) grey++;
      }
      most = Math.max(most, s);
      if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `${name}: cyan at ${i}: ${c}`);
      if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `${name}: pink at ${i}: ${c}`);
    }
    assert.ok(most < dullest, `${name}: its richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
    assert.ok(grey > 0.95 * all, `${name}: all but colourless: ${grey} of ${all}`);
    lum.sort((a, b) => a - b);
    const lo = lum[Math.floor(lum.length * 0.1)];
    const hi = lum[Math.floor(lum.length * 0.9)];
    assert.ok(hi - lo > 40, `${name}: the floor's values from ${lo.toFixed(0)} to ${hi.toFixed(0)} (strong enough to read)`);
  }
});

test('the walls fade into the dark at their tops; into the fog in a fogged room', () => {
  // (a far wall's face over a room's far edge, low and high: the scriptorium's along its back, the fogged room's)
  const lumAt = (x: number, y: number, up: number): number => {
    const c = colOf(INW, idx(INW, x, y, up));
    return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  };
  for (const [r, z] of ROOMS) {
    if (z === QT_ZONE.Fogged) continue;
    let low = 0;
    let high = 0;
    for (let x = r[0] + 1.5; x < r[2] - 1; x += 0.5) {
      low += lumAt(x, r[1] + 0.02, 30);
      high += lumAt(x, r[1] + 0.02, QT_RISE - 4);
    }
    assert.ok(high < 0.5 * low, `the wall over ${r}: ${high.toFixed(0)} at its top against ${low.toFixed(0)} low`);
  }
  const deep = key(QT_DEEP);
  const fogged = ROOMS.find(([, z]) => z === QT_ZONE.Fogged)![0];
  const c = colOf(INW, idx(INW, fogged[0] + 6, fogged[1] + 0.02, QT_RISE - 2));
  assert.ok(key(c) !== deep && c[2] > QT_DEEP[2] + 8, `the fogged room's wall fades into the fog: ${c}`);
});

test('each room shows what it is: the scriptorium\'s dry ink, the belfry\'s boards, the fog lying in a fogged room', () => {
  const count = (r: Rect, is: (c: RGB) => boolean): [number, number] => {
    let n = 0;
    let all = 0;
    for (let y = r[1] + 1.5; y < r[3] - 1.5; y += 0.1) for (let x = r[0] + 1.5; x < r[2] - 1.5; x += 0.1) {
      all++;
      if (is(colOf(INW, idx(INW, x, y)))) n++;
    }
    return [n, all];
  };
  const ink = new Set(QT_INK.map(key));
  const [sc, scAll] = count(ROOMS[0][0], (c) => ink.has(key(c)));
  assert.ok(sc > 0.003 * scAll, `the scriptorium's ink: ${sc} of ${scAll}`);
  const board = new Set(QT_BOARD.map(key));
  const [bf, bfAll] = count(ROOMS[1][0], (c) => board.has(key(c)));
  assert.ok(bf > 0.6 * bfAll, `the belfry's boards: ${bf} of ${bfAll}`);
  const fog = new Set([QT_FOG[2], QT_FOG[3], QT_FOG[4]].map(key));
  const [fg, fgAll] = count(ROOMS[2][0], (c) => fog.has(key(c)));
  const [st, stAll] = count(ROOMS[3][0], (c) => fog.has(key(c)));
  assert.ok(fg > 0.25 * fgAll && fg / fgAll > 4 * (st / stAll), `the fog lying in the fogged room: ${fg} of ${fgAll} (the stair's landing ${st} of ${stAll})`);
});

test('the parapet is crenellated: the fog sea through each embrasure, the coping over each merlon; the outer wall under the near parapet, lost in the fog', () => {
  // (along the far parapet, the tiles round the platform's far side: what is over the face's top, column by column)
  let through = 0;
  let throughAll = 0;
  let coped = 0;
  let copedAll = 0;
  const fogKeys = new Set<string>();
  for (let x = 14; x <= 26; x += 0.05) {
    const y = C[1] - Math.sqrt(Math.max(0, 12 * 12 - (x - C[0]) ** 2)) - 0.3;
    const i = idx(TOPW, x, y, PARAPET_H + 4);
    if (TOPW.P.kind[i] !== TK.Top) continue;
    const [px] = pictureOf(x, y);
    const py = Math.floor(i / TOPW.WW) + TOPW.Y0;
    const c = key(colOf(TOPW, i));
    const sea = key(fogSea(Math.floor(px), py));
    fogKeys.add(sea);
    if (embrasure(Math.floor(px))) {
      throughAll++;
      if (c === sea) through++;
    } else {
      copedAll++;
      if (c !== sea) coped++;
    }
  }
  assert.ok(throughAll > 10 && through > 0.8 * throughAll, `the fog sea through the embrasures: ${through} of ${throughAll}`);
  assert.ok(copedAll > 10 && coped > 0.9 * copedAll, `the coping over the merlons: ${coped} of ${copedAll}`);
  // under the near parapet (the platform's nearest point, toward +x +y): the hang, stone, then lost in the fog
  let hang = 0;
  const near = C[0] + 12 / Math.SQRT2 + 1.2;
  for (let up = -100; up < 0; up++) if (TOPW.P.kind[idx(TOPW, near, near, up)] === TK.Hang) hang++;
  assert.ok(hang > 40, `the outer wall under the near parapet: ${hang} picture pixels of it`);
});
