// THE GODOT PORT: THE GAME'S OWN PICTURES OF WHAT ITS MOVES MARK ON THE FLOOR AND THROW UP, as films (the cloud chat, 15 Nov
// 2026). Each is painted here by the game's own painter (art/*_fx.ts), frame by frame, as render/act1_fx/*.ts asks for them,
// and packed into sheets for godot/scripts/perils.gd to play in place of a stand-in drawing:
//   npx tsx tools/godot_fx.ts        -> godot/assets/fx/fx.json, fx-0.png, ...
// A FILM: its frames at `fps`, in layers as the game lays them: `floor` (on the floor, under the figures), `behind` and
// `before` (among the figures, just behind and just before one standing at its middle). Every picture in picture pixels (two
// to a game pixel), cut to what is painted of it, the same picture kept once; `pics`: [sheet, x, y, w, h, ox, oy], (ox, oy)
// where its top left corner lies from the film's floor point.
//   brute_ring   the green troll's slam (art/action_f3_fx.ts ringPainted; render/act1_fx/brute.ts): the dent and its cracks,
//                the ring going out over the floor; the flash, the dust and the chips flung up. 1.6 s.
//   co_ring_<r>  the Chained One's rings (art/chained_action_fx.ts ringPainted; render/act1_fx/chained.ts): the whirl's (3.5
//                tiles), the ball's (2.5), the hammer's (1.5). 1.6 s each.
//   co_crack_<w> his lash's crack, run along way w of the sixteen round (crackPainted). 1.8 s each.
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { toSprite } from '../src/art/kit';
import { RING as F3_RING, RING_CANVAS, ringPainted as f3Ring } from '../src/art/action_f3_fx';
import { CRACK, CRACK_CANVAS, RING as CO_RING, crackPainted, ringCanvas, ringPainted as coRing } from '../src/art/chained_action_fx';

paintWithoutCanvas();
gameSwitches();
const OUT = 'godot/assets/fx';
mkdirSync(OUT, { recursive: true });
const FPS = 30;

interface Film { fps: number; n: number; layers: Record<string, number[]> }
const films: Record<string, Film> = {};
/** The pictures, each once: its pixels (picture pixels), and where its top left lies from the floor point. */
const pics: { w: number; h: number; d: Uint8ClampedArray; ox: number; oy: number }[] = [];
const seen = new Map<string, number>();

/** A sprite as a picture: in picture pixels, cut to what is painted; -1 if nothing is. */
function pic(s: Sprite | null): number {
  if (!s) return -1;
  const p = paintingOf(s);
  const k = 2 / (s.density ?? 1);
  let x0 = p.w;
  let y0 = p.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (p.d[(y * p.w + x) * 4 + 3] === 0) continue;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) return -1;
  const w = (x1 - x0 + 1) * k;
  const h = (y1 - y0 + 1) * k;
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = ((y0 + Math.floor(y / k)) * p.w + x0 + Math.floor(x / k)) * 4;
    d.set(p.d.subarray(o, o + 4), (y * w + x) * 4);
  }
  const ox = x0 * k - s.ax * 2;
  const oy = y0 * k - s.ay * 2;
  let hash = 0;
  for (let i = 0; i < d.length; i++) hash = (Math.imul(hash, 31) + d[i]) | 0;
  const key = `${w}x${h}@${ox},${oy}#${hash}`;
  const had = seen.get(key);
  if (had !== undefined) return had;
  pics.push({ w, h, d, ox, oy });
  seen.set(key, pics.length - 1);
  return pics.length - 1;
}

/** A film of `secs` seconds: each layer's frame `k` as the game paints it. */
function film(name: string, secs: number, layers: Record<string, (k: number) => Sprite | null>): void {
  const n = Math.floor(secs * FPS) + 1;
  const out: Record<string, number[]> = {};
  for (const [layer, at] of Object.entries(layers)) out[layer] = Array.from({ length: n }, (_, k) => pic(at(k)));
  films[name] = { fps: FPS, n, layers: out };
}

type Layer = 'floor' | 'behind' | 'before';
const LAYERS: Layer[] = ['floor', 'behind', 'before'];
const three = (at: (what: Layer, k: number) => Sprite): Record<string, (k: number) => Sprite | null> => Object.fromEntries(LAYERS.map((what) => [what, (k: number) => at(what, k)]));

// the green troll's slam (render/act1_fx/brute.ts)
film('brute_ring', F3_RING.long, three((what, k) => toSprite(f3Ring(k / FPS, what === 'floor' ? 'floor' : 'air', F3_RING.radius, what === 'floor' ? 'all' : what), null, RING_CANVAS.ax, RING_CANVAS.ay)));
// the Chained One's rings and his crack (render/act1_fx/chained.ts)
for (const r of [CO_RING.whirl, CO_RING.ball, CO_RING.hammer]) {
  const C = ringCanvas(r);
  film(`co_ring_${r}`, CO_RING.long, three((what, k) => toSprite(coRing(k / FPS, what === 'floor' ? 'floor' : 'air', r, what === 'floor' ? 'all' : what), null, C.ax, C.ay)));
}
const WAYS = 16;
for (let w = 0; w < WAYS; w++) {
  const a = (w / WAYS) * 2 * Math.PI;
  film(`co_crack_${w}`, CRACK.long, three((what, k) => toSprite(crackPainted(k / FPS, what === 'floor' ? 'floor' : 'air', [Math.cos(a), Math.sin(a)], what === 'floor' ? 'all' : what), null, CRACK_CANVAS.ax, CRACK_CANVAS.ay)));
}

// --- the sheets: the tallest pictures first, shelf by shelf, 2048 wide and at most 4096 tall each ---
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
const SHEET_W = 2048;
const SHEET_MAX = 4096;
const order = pics.map((_, i) => i).sort((a, b) => pics[b].h - pics[a].h || pics[b].w - pics[a].w);
const placed: [number, number, number, number, number, number, number][] = pics.map(() => [0, 0, 0, 0, 0, 0, 0]);
const sheets: { h: number; at: { i: number; x: number; y: number }[] }[] = [];
let cur = { h: 0, at: [] as { i: number; x: number; y: number }[] };
let cx = 0;
let cy = 0;
let rowH = 0;
for (const i of order) {
  const p = pics[i];
  if (cx + p.w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
  if (cy + p.h > SHEET_MAX) { cur.h = cy; sheets.push(cur); cur = { h: 0, at: [] }; cx = 0; cy = 0; rowH = 0; }
  cur.at.push({ i, x: cx, y: cy });
  placed[i] = [sheets.length, cx, cy, p.w, p.h, p.ox, p.oy];
  cx += p.w + 1;
  rowH = Math.max(rowH, p.h);
}
cur.h = cy + rowH;
sheets.push(cur);
const names: string[] = [];
sheets.forEach((S, n) => {
  const img = new Uint8ClampedArray(SHEET_W * S.h * 4);
  for (const q of S.at) {
    const p = pics[q.i];
    for (let y = 0; y < p.h; y++) img.set(p.d.subarray(y * p.w * 4, (y + 1) * p.w * 4), ((q.y + y) * SHEET_W + q.x) * 4);
  }
  names.push(`fx-${n}.png`);
  writeFileSync(`${OUT}/fx-${n}.png`, png(SHEET_W, S.h, img));
});
writeFileSync(`${OUT}/fx.json`, JSON.stringify({ sheets: names, pics: placed, films }));
const frames = Object.values(films).reduce((n, f) => n + f.n * Object.keys(f.layers).length, 0);
console.log(`fx: ${Object.keys(films).length} films, ${frames} frames, ${pics.length} pictures in ${sheets.length} sheet(s): ${sheets.map((S) => `${SHEET_W}x${S.h}`).join(', ')}`);
