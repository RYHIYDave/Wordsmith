// THE FLOOR 2 ACTION SHEET (docs/mockups/action_f2/pictures/action_f2_sheet.png): key frames of the cultist's fire sigil, the
// Shade's frost rake and its rime, and the Headsman before and after his axe was mended. Raw panels are written here;
// tools/action_f2_captions.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/action_f2_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { Clip } from '../src/art/actor_types';
import { KAX, KAY } from '../src/art/kit';
import { SIGIL_SLAM } from '../src/art/monster_cultist';
import { RIME_CANVAS, SIGIL_CANVAS, rimePainted, sigilPainted } from '../src/art/action_f2_fx';
import { SHADE_HIT } from '../src/art/new_mobs3';
import { tombFloor, laid } from '../src/dev/action_f1_scene';
import { figures, headsmanFrame } from '../src/dev/action_f2_scene';
import { knight, lay, scaled, shadow, spriteLaid } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const { cultist, shade } = figures();

/** A row of cells side by side, each `w` by `h` picture pixels, made `k` times as big. */
function row(cells: Px[], k: number): Px {
  const w = cells[0].w * k;
  const r = new Px(w * cells.length, cells[0].h * k);
  cells.forEach((c, i) => r.blit(scaled(c, k), i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
/** A cell of floor `w` by `h`, with a figure at (x, y) and, if asked, things laid first. */
function cell(w: number, h: number, x: number, y: number, fig: Laid | null, under: { l: Laid; x: number; y: number }[] = [], over: { l: Laid; x: number; y: number }[] = [], sh = 9): Px {
  const p = new Px(w, h);
  p.d.set(tombFloor(w, h, x, y + 40).d);
  for (const u of under) lay(p, u.l, u.x, u.y);
  if (fig) {
    shadow(p, x, y, sh);
    lay(p, fig, x, y);
  }
  for (const o of over) lay(p, o.l, o.x, o.y);
  return p;
}
const clipFrame = (art: typeof cultist, view: 'front' | 'back', t: number): Laid => {
  const c = (view === 'front' ? art.front : art.back).clips?.attack as Clip;
  return spriteLaid(c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))]);
};

// THE CULTIST'S CAST: raised; tracing; traced; held (the warning); the slam (one frame); bent over it (three times as big)
const CAST = [0.16, 0.36, 0.6, 0.95, SIGIL_SLAM, SIGIL_SLAM + 0.12];
for (const view of ['front', 'back'] as const) writeFileSync(`${out}/cultist_${view}.png`, png(row(CAST.map((t) => cell(66, 100, 26, 88, clipFrame(cultist, view, t))), 3)));
void KAX;
void KAY;

// THE SIGIL UNDER THE KNIGHT, twice as big: half traced; traced, held, pink-edged; the eruption's first frame (a streak)
const S = SIGIL_CANVAS;
const sig = (t: number): Px => {
  const w = 200;
  const h = 290;
  const x = 100;
  const y = 230;
  return cell(w, h, x, y, knight('back', 0), [{ l: laid(sigilPainted(t, 'floor'), S.ax, S.ay), x, y }], [
    { l: laid(sigilPainted(t, 'air', undefined, 'behind'), S.ax, S.ay), x, y },
    { l: laid(sigilPainted(t, 'air', undefined, 'before'), S.ax, S.ay), x, y },
  ]);
};
// (the knight is laid before the air's back half here: so lay the back half under him)
const sigCell = (t: number): Px => {
  const w = 200;
  const h = 290;
  const x = 100;
  const y = 230;
  return cell(w, h, x, y, knight('back', 0), [
    { l: laid(sigilPainted(t, 'floor'), S.ax, S.ay), x, y },
    { l: laid(sigilPainted(t, 'air', undefined, 'behind'), S.ax, S.ay), x, y },
  ], [{ l: laid(sigilPainted(t, 'air', undefined, 'before'), S.ax, S.ay), x, y }]);
};
void sig;
const sigAt = (t: number, h: number, y: number): Px => cell(300, h, 150, y, knight('back', 0), [
  { l: laid(sigilPainted(t, 'floor'), S.ax, S.ay), x: 150, y },
  { l: laid(sigilPainted(t, 'air', undefined, 'behind'), S.ax, S.ay), x: 150, y },
], [{ l: laid(sigilPainted(t, 'air', undefined, 'before'), S.ax, S.ay), x: 150, y }]);
writeFileSync(`${out}/sigil_1.png`, png(row([sigAt(-0.84, 150, 95), sigAt(-0.2, 150, 95)], 2)));
writeFileSync(`${out}/sigil_2.png`, png(row([sigAt(0, 290, 238), sigAt(0.1, 290, 238)], 2)));
writeFileSync(`${out}/sigil_3.png`, png(row([sigAt(1.0, 150, 95), sigAt(2.6, 150, 95)], 2)));
void sigCell;

// THE COLD SHADE: claws raised, frost gathering; held; the rake (one frame); the cold falling after (four times as big)
const RAKE = [0.2, 0.4, SHADE_HIT, SHADE_HIT + 0.15, SHADE_HIT + 0.3];
for (const view of ['front', 'back'] as const) writeFileSync(`${out}/shade_${view}.png`, png(row(RAKE.map((t) => cell(80, 100, 34, 86, clipFrame(shade, view, t), [], [], 6)), 3)));
// THE RIME, three times as big: spreading (0.1 s after the blow); lying (1 s); melting (3.6 s)
const R = RIME_CANVAS;
const rime = (t: number, withKnight: boolean): Px => cell(132, 100, 66, 64, withKnight ? knight('back', 0) : null, [{ l: laid(rimePainted(t), R.ax, R.ay), x: 66, y: 64 }]);
writeFileSync(`${out}/rime.png`, png(row([rime(0.1, false), rime(1, true), rime(3.6, false)], 3)));

// THE HEADSMAN, BEFORE AND AFTER, twice as big: two moments as he was, then the same two as he is, his floor point placed so his axe fits
const hcell = (was: boolean, move: string, t: number, x: number, w = 150, h = 200, y = 188): Px => cell(w, h, x, y, headsmanFrame(was, move, t, 'front'), [], [], 24);
const PAIRS: [string, [string, number][], number][] = [
  ['walk', [['setOff', 0.2], ['walk', 0.067]], 92],
  ['flurry', [['flurry', 0.133], ['flurry', 0.867]], 70],
  ['wheel', [['wheel', 0.967], ['wheel', 1.1]], 62],
];
for (const [name, beats, x] of PAIRS) {
  const [h, y] = name === 'flurry' ? [226, 214] : [200, 188];
  writeFileSync(`${out}/headsman_${name}.png`, png(row([...beats.map(([m, t]) => hcell(true, m, t, x, 150, h, y)), ...beats.map(([m, t]) => hcell(false, m, t, x, 150, h, y))], 2)));
}
// (the lunge's wind-down: the axe out to his side at full reach, so each moment a cell twice as wide)
for (const was of [true, false]) writeFileSync(`${out}/headsman_lunge_${was ? 'before' : 'after'}.png`, png(row([1.0, 1.033].map((t) => hcell(was, 'attack', t, 120, 300, 216, 176)), 2)));
console.log('panels in', out);
