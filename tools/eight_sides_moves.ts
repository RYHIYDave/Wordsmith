// THE BRAWLER'S AND THE TINKERER'S MOVES FROM EIGHT SIDES, for looking each new side over (the Tinkerer chat, 11 Nov 2026).
// Raw pictures, not in the game: each move at a chosen frame from each side, the Brawler's with his action lines laid as the
// game lays them (art/veteran_fx_art.ts: on the floor, behind him, over him).
//   npx tsx tools/eight_sides_moves.ts brawler <out dir> [move ids, comma-separated] [frames after the blow: 2]
//   npx tsx tools/eight_sides_moves.ts tinkerer <out dir>
import fs from 'node:fs';
import path from 'node:path';
import { encodePng } from './png.mjs';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { GRAIN } from '../src/art/kit';
import { GRID } from '../src/art/skeleton';
import { MORE_TURN } from '../src/art/sides_more';
import { VET_FX_LAYERS, paintVetFx } from '../src/art/veteran_fx_art';
import { VET_LISTS } from '../src/art/veteran_art';
import { WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { VET_CANVAS, paintVeteran } from '../src/dev/sculpt_veteran';
import { motionById, placeOf, spinAt, vetAt } from '../src/dev/veteran_moves';
import { BJ, FR, TAP_LET_GO, drawTinkerAt, tinkerMoves } from '../src/dev/tinkerer_moves';
import { HOLD, drawTinkerHoldAt, tinkerHold } from '../src/dev/tinkerer_hold';
import { tinkerLurch, tinkerReel } from '../src/dev/tinkerer_hits';
import { drawTinkerFallAt, tinkerFall } from '../src/dev/tinkerer_fall';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';

paintWithoutCanvas();
const [who = 'brawler', out = 'shots/eight/moves', pick = '', afterArg = '2'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const save = (px: Px, name: string): void => fs.writeFileSync(path.join(out, name), encodePng(px.w, px.h, Buffer.from(px.d.buffer, px.d.byteOffset, px.d.byteLength)));
/** `src` laid on `dst` with its top left corner at (x, y): what is painted of it over what is there. */
function lay(dst: Px, src: Px, x: number, y: number): void {
  for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
    const a = src.d[(j * src.w + i) * 4 + 3];
    if (!a) continue;
    const X = x + i;
    const Y = y + j;
    if (X < 0 || Y < 0 || X >= dst.w || Y >= dst.h) continue;
    const k = (Y * dst.w + X) * 4;
    const s = (j * src.w + i) * 4;
    const t = a / 255;
    for (let c = 0; c < 3; c++) dst.d[k + c] = Math.round(src.d[s + c] * t + dst.d[k + c] * (1 - t));
    dst.d[k + 3] = Math.max(dst.d[k + 3], a);
  }
}
/** A sprite laid with its anchor at (ax, ay) of `dst` (picture pixels). */
function laySprite(dst: Px, s: Sprite, ax: number, ay: number): void {
  if (!s || !s.img || s.w <= 0) return;
  const p = paintingOf(s);
  lay(dst, p, Math.round(ax - s.ax * GRAIN), Math.round(ay - s.ay * GRAIN));
}

if (who === 'brawler') {
  const ids = pick ? pick.split(',') : [...VET_LISTS, 'hurt', 'fall'];
  const after = Number(afterArg);
  const W = 420;
  const H = 320;
  const AX = 210;
  const AY = 210;
  for (const id of ids) {
    const m = motionById(id);
    const F = m.strikes.length ? Math.min(m.long - 1, Math.min(...m.strikes.map((s) => s.at)) + after) : Math.round(m.long * 0.5);
    for (const side of WU_SIDES) {
      const px = new Px(W, H);
      const V = (MORE_TURN[side] * Math.PI) / 180;
      const at = placeOf(m, F).at;
      const a = at[0] * Math.cos(V) - at[1] * Math.sin(V);
      const b = at[0] * Math.sin(V) + at[1] * Math.cos(V);
      const hx = AX + GRID * (a + b);
      const hy = AY + GRID * 0.5 * (a - b);
      const fig = paintVeteran(vetAt(m, F), MORE_TURN[side] + spinAt(m, F)).px;
      for (const layer of VET_FX_LAYERS) {
        if (layer === 'front') lay(px, fig, Math.round(hx - VET_CANVAS.ax), Math.round(hy - VET_CANVAS.ay));
        if (m.strikes.length || m.dust || m.quake) laySprite(px, paintVetFx(m, F, side as WuSide, layer), AX, AY);
      }
      save(px, `${id}_${side}.png`);
    }
    console.log(id, F);
  }
} else {
  const moves = tinkerMoves();
  const by = (s: string) => moves.find((m) => m.name.startsWith(s))!;
  const tap = by('Tap');
  const toss = { ...tap, hold: (t: number) => ({ wrench: 0, twirl: false, spin: 0, vial: t >= 0.18 && t < TAP_LET_GO ? 1 : 0, held: null }) };
  const jump = by('Swipe');
  const hold = tinkerHold();
  const fall = tinkerFall();
  const shots: [string, () => (turn: number) => Px][] = [
    ['toss_wound', () => (turn) => drawTinkerAt('front', toss, TAP_LET_GO - 3 * FR, turn).px],
    ['toss_let_go', () => (turn) => drawTinkerAt('front', toss, TAP_LET_GO + 1 * FR, turn).px],
    ['throw_down', () => (turn) => drawTinkerAt('front', tap, TAP_LET_GO - 2 * FR, turn).px],
    ['whistle', () => (turn) => drawTinkerHoldAt('front', hold, (HOLD.whistle + 4) * FR, turn).px],
    ['hop', () => (turn) => drawTinkerHoldAt('front', hold, HOLD.blow * FR, turn).px],
    ['jump_crouch', () => (turn) => drawTinkerAt('front', jump, BJ.crouch * FR, turn).px],
    ['jump_air', () => (turn) => drawTinkerAt('front', jump, BJ.apex * FR, turn).px],
    ['jump_land', () => (turn) => drawTinkerAt('front', jump, BJ.low * FR, turn).px],
    ['reel', () => { const m = tinkerReel(); return (turn) => drawTinkerAt('front', m, m.long * 0.4, turn).px; }],
    ['lurch', () => { const m = tinkerLurch(); return (turn) => drawTinkerAt('front', m, m.long * 0.4, turn).px; }],
    ['fall_mid', () => (turn) => drawTinkerFallAt('front', fall, fall.long * 0.45, turn).px],
    ['fall_end', () => (turn) => drawTinkerFallAt('front', fall, fall.long, turn).px],
  ];
  for (const [name, make] of shots) {
    if (pick && !pick.split(',').includes(name)) continue;
    const at = make();
    for (const side of WU_SIDES) save(at(MORE_TURN[side]), `${name}_${side}.png`);
    console.log(name);
  }
}
