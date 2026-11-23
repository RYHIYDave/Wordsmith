// THE GODOT PORT: THE CULT'S ALTAR ROOM, a stronghold on an endless level of any floor without one of its own (his words, 23 Nov
// 2026: “In endless mode I want multiple chained and stronghold encounters per level.  And I want these random encounters, (chained,
// stronghold, muffled bells, and royal cards) to show up in any level.”; the altar room, his “Yes and yes” of 22 Nov 2026, 21:23
// Eastern). Its pieces are the cult's own, painted by the game's own painters (art/act1_cult.ts): the ALTAR OF THE WORDS
// (wordAltar, its three hollows), the cult's BRAZIERS of pink fire (pinkBrazier, 4 frames) and BANNERS (cultBanner, 4 frames); and
// THE WARD, the cult's pink fire standing in a doorway once the altar wakes (three tongues of pinkFlame on a tile's middle, leaping
// by turns, 4 frames), lighting what is round it in the enemy's pink:
//   npx tsx tools/godot_altar_room.ts   -> godot/assets/altar_room/<name>_<frame>.png, altar_room.json
// Each picture in picture pixels (two to a game pixel), cut to what is painted, with its floor point (ox, oy) from its top left;
// its lights as the art gives them.
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import type { Light, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { ALTAR_HOLLOWS, cultBanner, pinkBrazier, pinkFlame, wordAltar } from '../src/art/act1_cult';
import { compose, GRAIN } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';

paintWithoutCanvas();
const OUT = 'godot/assets/altar_room';
mkdirSync(OUT, { recursive: true });

function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    const out = new Uint8Array(12 + data.length);
    out.set(be(data.length), 0);
    out.set(td, 4);
    out.set(be(crc32(td) >>> 0), 8 + data.length);
    return out;
  };
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array(0))];
  const all = new Uint8Array(parts.reduce((n, q) => n + q.length, 0));
  let o = 0;
  for (const q of parts) { all.set(q, o); o += q.length; }
  return all;
}

/** A sprite as a picture at two picture pixels to a game pixel, cut to what is painted, its floor point from its corner. */
function save(s: Sprite, file: string): { file: string; w: number; h: number; ox: number; oy: number; lights: unknown; x0: number; y0: number; k: number } {
  const p = paintingOf(s);
  const k = 2 / (s.density ?? 1);
  let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (p.d[(y * p.w + x) * 4 + 3] === 0) continue;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const w = (x1 - x0 + 1) * k;
  const h = (y1 - y0 + 1) * k;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = x0 + Math.floor(x / k), sy = y0 + Math.floor(y / k);
    out.set(p.d.subarray((sy * p.w + sx) * 4, (sy * p.w + sx) * 4 + 4), (y * w + x) * 4);
  }
  writeFileSync(`${OUT}/${file}`, png(w, h, out));
  const lights = (s as unknown as { lights?: unknown }).lights ?? [];
  return { file, w, h, ox: s.ax * 2 - x0 * k, oy: s.ay * 2 - y0 * k, lights, x0, y0, k };
}

/** THE WARD: the cult's pink fire standing on a doorway's tile, three tongues leaping by turns over a bed of it. 40 x 64 at (20, 58). */
function ward(f: number): Sprite {
  const p = new Px(40, 64);
  const X = 20;
  const Y = 58;
  const lean = [1, -2, 2, -1][f % 4];
  pinkFlame(p, X, Y, 10, 9, lean * 0.4);
  pinkFlame(p, X - 1, Y - 2, 22 + [3, 7, 0, 5][f % 4], 5, lean);
  pinkFlame(p, X + 6, Y - 1, 14 + [6, 0, 5, 2][f % 4], 3.4, lean + 1.5);
  pinkFlame(p, X - 7, Y, 12 + [0, 5, 3, 6][f % 4], 3, lean - 1.5);
  for (let k = 0; k < 3; k++) {
    const sy = Y - 30 - ((f * 7 + k * 11) % 18);
    const sx = Math.round(X + Math.sin(f + k * 2.1) * 6);
    p.set(sx, sy, FLAME[3]).set(sx, sy - 1, FLAME[4]);
  }
  const s = compose(null, [p], null).sprite(X, Y, GRAIN);
  const lights: Light[] = [{ x: 0, y: -14 / GRAIN, r: 30 + (f % 2) * 2, color: FLAME[2], a: 0.4 }];
  s.lights = lights;
  return s;
}

const table: Record<string, unknown> = {};
const altar = save(wordAltar(), 'altar_0.png');
table.altar = [altar];
// (where the three hollows lie on the altar's picture, from its floor point, in picture pixels: a word given is set in each)
table.hollows = ALTAR_HOLLOWS.map(([x, y]) => [x * altar.k, y * altar.k]);
table.brazier = [0, 1, 2, 3].map((f) => save(pinkBrazier(f), `brazier_${f}.png`));
table.banner = [0, 1, 2, 3].map((f) => save(cultBanner(f), `banner_${f}.png`));
table.ward = [0, 1, 2, 3].map((f) => save(ward(f), `ward_${f}.png`));
for (const k of ['altar', 'brazier', 'banner', 'ward']) {
  console.log(k, (table[k] as { w: number; h: number; ox: number; oy: number }[]).map((f) => `${f.w}x${f.h} at ${f.ox},${f.oy}`).join('; '));
}
console.log('hollows', JSON.stringify(ALTAR_HOLLOWS), 'grain', GRAIN);
writeFileSync(`${OUT}/altar_room.json`, JSON.stringify(table, null, 1));
