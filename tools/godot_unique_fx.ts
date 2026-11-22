// THE GODOT PORT: WHAT THE UNIQUE ITEMS SHOW IN PLAY, the game's own pictures (art/unique_play_art.ts, art/unique_play_art2.ts, as
// render/unique_fx.ts lays them), for godot/scripts/fx_uniques.gd:
//   godot/assets/uniques/fx.png + fx.json
//     pics: { key: [x, y, w, h, ax, ay] } each picture in the sheet, in picture pixels (two to a game pixel, as the game's own
//       sprites of them are), trimmed to what is painted; ax, ay its anchor in it:
//       arm|f (36), armpool|f; bird|dive|i|front, bird|fly|i|back ...; stuck|f; tome|heading|flap; flame|size|frame|lean;
//       touch|age|seed; cracks|grow|cool|seed; blow|age|seed
//     tune: ARM, TALONS, STICKY, TOME, TOME_FLAME, TOME_TOUCH_FRAMES, RISE_CRACKS, RISEN_BLOW_FRAMES, BRAND, and the looks'
//       own (render/unique_fx.ts TOME_FLIES, RISEN_SHOWN, BLADE, DROP_BEAM), the colours (RISEN_CYAN, ARM_WATER, BIRD_RAVEN,
//       STICKY_BREW, TOME_GLOW, HUSH, AIR) and the bird's frames' list.
//   npx tsx tools/godot_unique_fx.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
import { pngRGBA } from './mage_up_sheet';
import { Px } from '../src/engine/px';
import { gameSwitches } from './godot_switches';
import {
  BRAND, RISEN_BLOW_FRAMES, RISEN_CYAN, RISE_CRACKS, TOME, TOME_FLAME, TOME_GLOW, TOME_TOUCH_FRAMES,
  paintRiseCracks, paintRisenBlow, paintTome, paintTomeFlame, paintTomeTouch,
} from '../src/art/unique_play_art';
import { ARM, ARM_WATER, BIRD_CANVAS, BIRD_RAVEN, STICKY, STICKY_BREW, TALONS, paintArm, paintArmPool, paintStuckVial, paintTalonsBird } from '../src/art/unique_play_art2';
import { BLADE, DROP_BEAM, RISEN_SHOWN, TOME_FLIES } from '../src/render/unique_fx';
import { HUSH } from '../src/art/crier';
import { AIR } from '../src/render/wild';

paintWithoutCanvas();
gameSwitches();

const pics: [string, Px, number, number][] = [];
const add = (key: string, px: Px, ax: number, ay: number): void => void pics.push([key, px, ax, ay]);

// THE DROWNED ARM: the tentacle and its black water, frame by frame (30 a second)
for (let f = 0; f < ARM.frames; f++) {
  add(`arm|${f}`, paintArm(f), ARM.ax, ARM.ay);
  const p = paintArmPool(f);
  add(`armpool|${f}`, p.px, p.ax, p.ay);
}
// THE QUEEN'S TALONS: her bird's dive from its stoop to its pull-out and its flight away, from in front and behind
const birdFrames: [string, number][] = [
  ...Array.from({ length: Math.round((TALONS.end - TALONS.from) * TALONS.fps) + 1 }, (_, i) => ['dive', Math.round(TALONS.from * TALONS.fps) + i] as [string, number]),
  ...Array.from({ length: Math.ceil(TALONS.away * TALONS.fps) + 1 }, (_, i) => ['fly', i] as [string, number]),
];
for (const view of ['front', 'back'] as const) for (const [move, i] of birdFrames) add(`bird|${move}|${i}|${view}`, paintTalonsBird(move as 'dive' | 'fly', i / TALONS.fps, view), BIRD_CANVAS.ax, BIRD_CANVAS.ay);
// THE STICKY WRENCH: her vial stuck, blinking
for (let f = 0; f < STICKY.frames; f++) add(`stuck|${f}`, paintStuckVial(f), STICKY.ax, STICKY.ay);
// THE RESTLESS TOME: the book at each heading and flap; its fire's tongues; its fire on the one it touches
for (let hd = 0; hd < TOME.headings; hd++) for (let fl = 0; fl < TOME.flaps; fl++) add(`tome|${hd}|${fl}`, paintTome(hd, fl), TOME.ax, TOME.ay);
for (let i = 0; i < TOME_FLAME.sizes.length; i++) for (let fr = 0; fr < TOME_FLAME.frames; fr++) for (const lean of [-1, 0, 1]) {
  const p = paintTomeFlame(TOME_FLAME.sizes[i], fr, lean);
  add(`flame|${i}|${fr}|${lean}`, p.px, p.ax, p.ay);
}
for (let age = 0; age < TOME_TOUCH_FRAMES; age++) for (let seed = 0; seed < 3; seed++) {
  const p = paintTomeTouch(age, seed);
  add(`touch|${age}|${seed}`, p.px, p.ax, p.ay);
}
// THE FLESHMANCER'S BRAND: the cracks where it rose, the burst of its blow (the brand itself is painted as it turns: fx_uniques.gd)
for (let grow = 0; grow < RISE_CRACKS.grow; grow++) for (let cool = 0; cool < RISE_CRACKS.cool; cool++) for (let seed = 0; seed < 4; seed++) {
  const p = paintRiseCracks(grow, cool, seed);
  add(`cracks|${grow}|${cool}|${seed}`, p.px, p.ax, p.ay);
}
for (let age = 0; age < RISEN_BLOW_FRAMES; age++) for (let seed = 0; seed < 4; seed++) {
  const p = paintRisenBlow(age, seed);
  add(`blow|${age}|${seed}`, p.px, p.ax, p.ay);
}

// --- each trimmed to what is painted, and packed into a sheet
const W = 2048;
const out: Record<string, number[]> = {};
const placed: { px: Px; sx: number; sy: number; x: number; y: number; w: number; h: number }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, px, ax, ay] of [...pics].sort((a, b) => b[1].h - a[1].h)) {
  let x0 = px.w;
  let y0 = px.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] > 0) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  if (x1 < 0) {
    out[key] = [0, 0, 0, 0, 0, 0];
    continue;
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  if (cx + w > W) {
    cx = 0;
    cy += rowH + 1;
    rowH = 0;
  }
  placed.push({ px, sx: x0, sy: y0, x: cx, y: cy, w, h });
  out[key] = [cx, cy, w, h, ax - x0, ay - y0];
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const sheet = new Px(W, cy + rowH);
for (const q of placed) for (let j = 0; j < q.h; j++) for (let i = 0; i < q.w; i++) {
  const o = ((q.sy + j) * q.px.w + q.sx + i) * 4;
  const d = ((q.y + j) * W + q.x + i) * 4;
  for (let c = 0; c < 4; c++) sheet.d[d + c] = q.px.d[o + c];
}
const OUT = 'godot/assets/uniques';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/fx.png`, pngRGBA(sheet));
writeFileSync(`${OUT}/fx.json`, JSON.stringify({
  pics: out,
  birdFrames,
  tune: {
    ARM: { ...ARM, from: [...ARM.from] }, TALONS, STICKY: { ...STICKY, blinks: [...STICKY.blinks] }, TOME, TOME_FLAME: { ...TOME_FLAME, sizes: [...TOME_FLAME.sizes] },
    TOME_TOUCH_FRAMES, RISE_CRACKS, RISEN_BLOW_FRAMES, BRAND, TOME_FLIES, RISEN_SHOWN, BLADE, DROP_BEAM,
  },
  colors: { RISEN_CYAN: [...RISEN_CYAN], ARM_WATER: [...ARM_WATER], BIRD_RAVEN: [...BIRD_RAVEN], STICKY_BREW: [...STICKY_BREW], TOME_GLOW, HUSH: [...HUSH], AIR: [...AIR] },
}) + '\n');
console.log(`the uniques' looks: ${pics.length} pictures in a ${W}x${sheet.h} sheet`);
