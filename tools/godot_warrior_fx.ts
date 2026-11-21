// THE GODOT PORT: THE WARRIOR'S WEAPONS' PICTURES, each painted once as the game paints them (art/warrior_up_axe_moves.ts,
// art/warrior_up_quake_ground.ts; render/render.ts and render/warrior_fx.ts draw them), kept here as pictures:
//   THE THROWN AXE spinning flat (axeFlying: AXE_FLY_FRAMES, a turn in AXE_FLIGHT.turn seconds, its anchor the floor under it).
//   THE GLINT: his thrown axe come back to hands that hold one, gone into it (axeGlint, AXE_GLINT_FRAMES at 30 a second).
//   THE QUAKING GROUND (quakeGround): the Earthquake's quake and Tremors' second and third, in the stone of every floor he can
//   fight on (main.ts placeFrame: floor 1 to 3 the Crypt's own floors, floor 4 and every floor below but the fifth the Crypt's
//   fourth, floor 5 the lair's, anywhere else the vault's): what heaves under everyone (`under`), what stands up into the air
//   (`over`), QUAKE_FRAMES each at 30 a second; the cracks for each of his eight sides, torn open over QUAKE_CRACK_FRAMES.
// Each at two picture pixels to a game pixel, its anchor kept, trimmed to what is painted in it.
//   npx tsx tools/godot_warrior_fx.ts   -> godot/assets/heroes/warrior_fx-0.png, quake_<stone>-N.png + warrior_fx.json
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { AXE_FLIGHT, AXE_FLY_FRAMES, AXE_GLINT_FRAMES, axeFlying, axeGlint } from '../src/art/warrior_up_axe_moves';
import { QUAKES, QUAKE_CRACKS_LAST, QUAKE_CRACK_FRAMES, QUAKE_FRAMES, quakeGround } from '../src/art/warrior_up_quake_ground';
import { WU_SIDES } from '../src/art/warrior_up';
import { VAULT } from '../src/art/ground';
import type { Theme } from '../src/art/ground';
import { CRYPT_FLOORS } from '../src/art/crypt';
import { LAIR } from '../src/art/lair';

paintWithoutCanvas();
gameSwitches();

// (the axe's own; and each stone's quakes on sheets of their own, so that a floor loads only its stone's)
const pics = new Map<string, Sprite>();
const quakes = new Map<string, Map<string, Sprite>>();
const fly = axeFlying();
for (let i = 0; i < AXE_FLY_FRAMES; i++) pics.set(`fly:${i}`, fly[i]);
const glint = axeGlint();
for (let i = 0; i < AXE_GLINT_FRAMES; i++) pics.set(`glint:${i}`, glint[i]);
// (the stones, by the name the port gives each: crypt1 to crypt4, lair, vault)
const STONES: Record<string, Theme> = { crypt1: CRYPT_FLOORS[0], crypt2: CRYPT_FLOORS[1], crypt3: CRYPT_FLOORS[2], crypt4: CRYPT_FLOORS[3], lair: LAIR, vault: VAULT };
for (const [name, theme] of Object.entries(STONES)) {
  const mine = new Map<string, Sprite>();
  quakes.set(name, mine);
  for (let q = 0; q < QUAKES.length; q++) {
    const g = quakeGround(q, theme);
    for (let f = 0; f < QUAKE_FRAMES; f++) {
      mine.set(`${q}:under:${f}`, g.under[f]);
      mine.set(`${q}:over:${f}`, g.over[f]);
    }
    for (const side of WU_SIDES) for (let k = 0; k < QUAKE_CRACK_FRAMES; k++) mine.set(`${q}:cracks:${side}:${k}`, g.cracks[side][k]);
  }
}

// ---- THE SHEETS (as tools/godot_tinkerer.ts lays its own) ----
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
/** Every picture trimmed to what is painted in it, laid on sheets SHEET_W wide and at most SHEET_H tall: [x, y, w, h, ax, ay, sheet]. */
const SHEET_W = 2048;
const SHEET_H = 4096;
function pack(all: Map<string, Sprite>, name: string): Record<string, number[]> {
  const placed: Record<string, number[]> = {};
  const trims = new Map<string, { x0: number; y0: number; w: number; h: number }>();
  const heights: number[] = [];
  let sheet = 0;
  let cx = 0;
  let cy = 0;
  let rowH = 0;
  for (const [key, s] of all) {
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
    if (x1 < 0) {
      placed[key] = [];
      continue;
    }
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    trims.set(key, { x0, y0, w, h });
    if (cx + w > SHEET_W) {
      cx = 0;
      cy += rowH + 1;
      rowH = 0;
    }
    if (cy + h > SHEET_H) {
      heights.push(cy);
      sheet++;
      cx = 0;
      cy = 0;
      rowH = 0;
    }
    const dn = s.density ?? 1;
    placed[key] = [cx, cy, w, h, s.ax * dn - x0, s.ay * dn - y0, sheet];
    cx += w + 1;
    rowH = Math.max(rowH, h);
  }
  heights.push(cy + rowH);
  const sheets = heights.map((H) => new Uint8ClampedArray(SHEET_W * Math.max(1, H) * 4));
  for (const [key, s] of all) {
    const at = placed[key];
    if (!at.length) continue;
    const [sx, sy, w, h, , , n] = at;
    const t = trims.get(key)!;
    const p = paintingOf(s);
    const out = sheets[n];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const o = ((t.y0 + j) * p.w + t.x0 + i) * 4;
      const d = ((sy + j) * SHEET_W + sx + i) * 4;
      for (let c = 0; c < 4; c++) out[d + c] = p.d[o + c];
    }
  }
  sheets.forEach((d, n) => writeFileSync(`godot/assets/heroes/${name}-${n}.png`, png(SHEET_W, Math.max(1, heights[n]), d)));
  console.log(`${name}: ${all.size} pictures on ${sheets.length} sheet(s) ${SHEET_W} wide, ${heights.join(', ')} tall`);
  return placed;
}
const densities = [...new Set([...pics.values(), ...[...quakes.values()].flatMap((m) => [...m.values()])].map((s) => s.density ?? 1))];
writeFileSync('godot/assets/heroes/warrior_fx.json', JSON.stringify({
  pics: pack(pics, 'warrior_fx'),
  stonePics: Object.fromEntries([...quakes].map(([name, m]) => [name, pack(m, `quake_${name}`)])),
  density: densities,
  flyN: AXE_FLY_FRAMES,
  flight: AXE_FLIGHT,
  glintN: AXE_GLINT_FRAMES,
  quakeN: QUAKE_FRAMES,
  crackN: QUAKE_CRACK_FRAMES,
  cracksLast: QUAKE_CRACKS_LAST,
  quakes: QUAKES,
  sides: WU_SIDES,
  stones: Object.keys(STONES),
}));
