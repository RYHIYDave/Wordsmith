// THE GODOT PORT: THE WARLOCK'S EFFECTS' PIECES (render/warlock_fx.ts, made of the art chat's own: dev/warlock_fx.ts, dev/demon_fx.ts),
// each painted once at the heroes' grain as the game paints them, kept here as pictures: the smoke's puffs (6), the ground erupting
// (24), the burn licking up a figure (16), the cursed one's smoke (16), a burst of his fire's flecks (8), a ball of his fire (4), and
// his bolt in flight for each of 16 ways round the screen (6 each). Each at two picture pixels to a game pixel, its anchor kept.
//   npx tsx tools/godot_warlock_fx.ts   -> godot/assets/heroes/warlock_fx.png + warlock_fx.json
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { Light, SMOKE, bolt, burn, burst, cloud, fire, smolder } from '../src/dev/warlock_fx';
import { HELL } from '../src/dev/sculpt_warlock';
import { STUFF, crackStar, drawCrack, drawHole, jet } from '../src/dev/demon_fx';

paintWithoutCanvas();
gameSwitches();
const G = 2;
function piece(w: number, h: number, ax: number, ay: number, paint: (fl: Light, sm: Light, dk: Light) => void): Sprite {
  const px = new Px(w, h);
  const fl = new Light();
  const sm = new Light();
  const dk = new Light();
  paint(fl, sm, dk);
  dk.lay(px, STUFF);
  sm.lay(px, SMOKE);
  fl.lay(px, HELL);
  return px.sprite(ax, ay, G);
}
const BURN_LOOP = 1.6;
const ERUPT = 0.9;
const BOLT_WAYS = 16;
const pics = new Map<string, Sprite>();
for (let i = 0; i < 6; i++) pics.set(`puff:${i}`, piece(60, 46, 30, 40, (_fl, sm) => cloud(sm, 30, 40, 26, 22, i * 0.17, 0.15, 11 + i)));
for (let i = 0; i < 24; i++) {
  const u = i / 23;
  pics.set(`erupt:${i}`, piece(140, 150, 70, 110, (fl, _sm, dk) => {
    const S = (p: readonly [number, number, number] | number[]): [number, number] => [70 + p[0], 110 + p[1] * 0.5];
    const heat = u < 0.15 ? 3 : u < 0.5 ? 3 - (u - 0.15) * 3 : Math.max(0, 1.95 - (u - 0.5) * 4);
    for (const c of crackStar(0, 0, 6, 34, 6, 5)) drawCrack(dk, fl, c, Math.min(1, u * 5), heat, S);
    drawHole(dk, fl, 0, 0, 9, heat, 5, S);
    const size = u < 0.1 ? u * 60 : Math.max(0, 6 * (1 - (u - 0.1) / 0.6));
    jet(fl, 70, 110, size, u * ERUPT, 0, 112);
  }));
}
for (let i = 0; i < 16; i++) pics.set(`burn:${i}`, piece(96, 140, 48, 120, (fl) => burn(fl, 48, 120, 36, 62, (i / 16) * BURN_LOOP, 1)));
for (let i = 0; i < 16; i++) pics.set(`smolder:${i}`, piece(96, 150, 48, 128, (fl, sm) => smolder(fl, sm, 48, 128, 36, 62, (i / 16) * BURN_LOOP, 1, 3)));
for (let i = 0; i < 8; i++) pics.set(`burst:${i}`, piece(64, 50, 32, 25, (fl) => burst(fl, 32, 25, 14, i / 8, 7)));
for (let i = 0; i < 4; i++) pics.set(`ball:${i}`, piece(40, 44, 20, 30, (fl) => fire(fl, 20, 30, 2.4, i * 0.09, 0)));
for (let way = 0; way < BOLT_WAYS; way++) {
  const a = (way / BOLT_WAYS) * Math.PI * 2;
  const [ux, uy] = [Math.cos(a), Math.sin(a)];
  for (let i = 0; i < 6; i++) pics.set(`bolt${way}:${i}`, piece(76, 76, 38, 38, (fl) => bolt(fl, 38, 38, ux, uy, 3.4, i * 0.07, [38 - ux * 999, 38 - uy * 999])));
}

function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}
// (each trimmed to what is painted in it, its anchor moved with it)
const SHEET_W = 2048;
const placed: Record<string, [number, number, number, number, number, number]> = {};
const trims = new Map<string, { x0: number; y0: number; w: number; h: number }>();
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, s] of pics) {
  const p = paintingOf(s);
  let x0 = p.w;
  let y0 = p.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3] > 0) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = 0; y1 = 0; }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  trims.set(key, { x0, y0, w, h });
  if (cx + w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
  // (density 2: a picture pixel of the painting is one of the sheet's; the anchor in picture pixels, from the trimmed corner)
  placed[key] = [cx, cy, w, h, s.ax * 2 - x0, s.ay * 2 - y0];
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const H = cy + rowH;
const sheet = new Uint8ClampedArray(SHEET_W * H * 4);
for (const [key, s] of pics) {
  const [sx, sy, w, h] = placed[key];
  const t = trims.get(key)!;
  const p = paintingOf(s);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const o = ((t.y0 + j) * p.w + t.x0 + i) * 4;
    const d = ((sy + j) * SHEET_W + sx + i) * 4;
    for (let c = 0; c < 4; c++) sheet[d + c] = p.d[o + c];
  }
}
writeFileSync('godot/assets/heroes/warlock_fx.png', png(SHEET_W, H, sheet));
writeFileSync('godot/assets/heroes/warlock_fx.json', JSON.stringify({ pics: placed, hell: HELL, smoke: SMOKE, burnLoop: BURN_LOOP, erupt: ERUPT, boltWays: BOLT_WAYS }));
console.log(`warlock fx: ${pics.size} pictures in a ${SHEET_W}x${H} sheet`);
