// THE GODOT PORT: THE MAGE'S SPELLS' PICTURES (art/spells.ts makeSpellArt): the orb the staff sets down, turning, in each element's
// colours (the mage's violet with no element word, fire, frost, lightning), each frame at two picture pixels to a game pixel with
// its anchor (its middle) kept; and the colours the game draws the Mage's moves in: SPELL_TONES (shade, body, light, heart), her
// power's crackle (render/wild.ts CRACKLE, and SPARKS with the violet of her magic).
//   npx tsx tools/godot_spells.ts   -> godot/assets/heroes/spells.png + spells.json
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { ORB_FRAMES, SPELL_TONES, makeSpellArt } from '../src/art/spells';
import { CRACKLE } from '../src/render/wild';
import { P } from '../src/art/palette';
import type { Element } from '../src/game/types';

paintWithoutCanvas();
gameSwitches();
const art = makeSpellArt();
const pics = new Map<string, Sprite>();
for (const el of Object.keys(SPELL_TONES) as Element[]) art.orb[el].forEach((s, i) => pics.set(`orb:${el}:${i}`, s));

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
const SHEET_W = 512;
const placed: Record<string, [number, number, number, number, number, number]> = {};
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, s] of pics) {
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  const w = p.w * k;
  const h = p.h * k;
  if (cx + w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
  placed[key] = [cx, cy, w, h, s.ax * 2, s.ay * 2];
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const H = cy + rowH;
const sheet = new Uint8ClampedArray(SHEET_W * H * 4);
for (const [key, s] of pics) {
  const [x0, y0, w, h] = placed[key];
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(i / k)) * 4;
    const d = ((y0 + j) * SHEET_W + x0 + i) * 4;
    for (let c = 0; c < 4; c++) sheet[d + c] = p.d[o + c];
  }
}
writeFileSync('godot/assets/heroes/spells.png', png(SHEET_W, H, sheet));
writeFileSync('godot/assets/heroes/spells.json', JSON.stringify({ orbFrames: ORB_FRAMES, pics: placed, tones: SPELL_TONES, crackle: CRACKLE, sparks: [...CRACKLE.slice(0, 3), P.pu5, P.pu4] }));
console.log(`spells: ${pics.size} pictures in a ${SHEET_W}x${H} sheet`);
