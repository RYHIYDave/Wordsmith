// THE GODOT PORT: THE BELLS AS PIECES OF THEIR OWN, for an endless level of any floor (his words, 23 Nov 2026: “I want these random
// encounters, (chained, stronghold, muffled bells, and royal cards) to show up in any level.”). On floors 11 to 15 the Bells are
// part of the floor's recorded look; elsewhere they stand on their own, painted here by the game's own painters (art/floor11.ts
// gateWardPieces: the market bell, the Muffled Bell, and a wayside shrine's bell), each in its four states:
//   npx tsx tools/godot_bells.ts   -> godot/assets/bells/<name>_<state>.png, bells.json
// muffled: gagged, still, swung one way, swung back. shrine: quiet, awake, rung one way, rung back. Each picture in picture pixels
// (two to a game pixel), cut to what is painted, with its floor point (ox, oy) from its top left; its lights as the art gives them.
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gateWardPieces } from '../src/art/floor11';

paintWithoutCanvas();
const OUT = 'godot/assets/bells';
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
function save(s: Sprite, file: string): { file: string; w: number; h: number; ox: number; oy: number; lights: unknown } {
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
  return { file, w, h, ox: s.ax * 2 - x0 * k, oy: s.ay * 2 - y0 * k, lights };
}

const pieces = gateWardPieces();
const want: Record<string, string> = { 'the market bell (the Muffled Bell)': 'muffled', "a wayside shrine's bell": 'shrine' };
const table: Record<string, unknown[]> = {};
for (const pc of pieces) {
  const key = want[pc.name];
  if (!key) continue;
  table[key] = (pc.frames as Sprite[]).map((s, i) => save(s, `${key}_${i}.png`));
  console.log(key, (table[key] as { w: number; h: number; ox: number; oy: number }[]).map((f) => `${f.w}x${f.h} at ${f.ox},${f.oy}`).join('; '));
}
writeFileSync(`${OUT}/bells.json`, JSON.stringify(table, null, 1));
