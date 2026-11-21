// THE GODOT PORT: THE WORDSMITH'S RING'S MOMENTS (art/ring3.ts, art/quest3.ts; render.ts standRing3), for godot/scripts/town.gd:
//   godot/assets/town/ring_fx.png + ring_fx.json  the pictures, two picture pixels to a game pixel, each with its anchor and the
//     lights it gives off (game pixels from its anchor): the column of light over the slab (`col f`, COLUMN_FRAMES) and rising
//     off it (`rise k`, RISE_STEPS); the letters that swirl round, his runes small and big at three heats (`letter h k`,
//     `big h k`); the master rune-stone standing as it floats (`stone f`, STONE_STANDING_FRAMES), lying down over the hollow
//     (`lay k`, STONE_LAYING_STEPS), and the burst of its light as it is laid in (`flash`).
//   and in ring_fx.json's `tune`: how many runes, frames and steps, where the slab is from the ring's middle (SLAB_AT), the moment in
//     his work the rune goes into the slab (LANDS).
//   npx tsx tools/godot_ring.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { pngRGBA } from './mage_up_sheet';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { gameSwitches } from './godot_switches';
import { makeTownProps } from '../src/art/town';
import { COLUMN_FRAMES, LANDS, RISE_STEPS, SLAB_AT } from '../src/art/ring3';
import { STONE_LAYING_STEPS, STONE_STANDING_FRAMES, makeStoneArt } from '../src/art/quest3';
import { RUNES7 } from '../src/art/smith3';

paintWithoutCanvas();
gameSwitches();
const R = makeTownProps().ring3!;
const Q = makeStoneArt();
const named: [string, Sprite][] = [];
for (let f = 0; f < COLUMN_FRAMES; f++) named.push([`col ${f}`, R.column[f]]);
for (let k = 0; k < RISE_STEPS; k++) named.push([`rise ${k}`, R.columnRising[k]]);
R.letters.forEach((row, h) => row.forEach((s, k) => named.push([`letter ${h} ${k}`, s])));
R.big.forEach((row, h) => row.forEach((s, k) => named.push([`big ${h} ${k}`, s])));
for (let f = 0; f < STONE_STANDING_FRAMES; f++) named.push([`stone ${f}`, Q.standing[f]]);
for (let k = 0; k < STONE_LAYING_STEPS; k++) named.push([`lay ${k}`, Q.laying[k]]);
named.push(['flash', Q.flash]);

const W = 1024;
const placed: { name: string; x: number; y: number; w: number; h: number; ax: number; ay: number; lights: { x: number; y: number; r: number; color: string; a: number }[] }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [n, s] of named) {
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  const w = p.w * k;
  const h = p.h * k;
  if (cx + w > W) { cx = 0; cy += rowH + 1; rowH = 0; }
  placed.push({ name: n, x: cx, y: cy, w, h, ax: s.ax * 2, ay: s.ay * 2, lights: (s.lights ?? []).map((l) => ({ x: l.x - s.ax, y: l.y - s.ay, r: l.r, color: l.color, a: l.a })) });
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const sheet = new Px(W, cy + rowH);
named.forEach(([, s], i) => {
  const at = placed[i];
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  for (let j = 0; j < at.h; j++) for (let x = 0; x < at.w; x++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(x / k)) * 4;
    const d = ((at.y + j) * W + at.x + x) * 4;
    for (let c = 0; c < 4; c++) sheet.d[d + c] = p.d[o + c];
  }
});
const OUT = 'godot/assets/town';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/ring_fx.png`, pngRGBA(sheet));
writeFileSync(`${OUT}/ring_fx.json`, JSON.stringify({ pics: placed, tune: { runes: RUNES7.length, column: COLUMN_FRAMES, rise: RISE_STEPS, standing: STONE_STANDING_FRAMES, laying: STONE_LAYING_STEPS, slab: SLAB_AT, lands: LANDS } }) + '\n');
console.log(`ring fx: ${named.length} pictures in a ${W}x${sheet.h} sheet; ${RUNES7.length} runes`);
