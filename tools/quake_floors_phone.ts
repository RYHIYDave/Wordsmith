// THE EARTHQUAKE'S GROUND ON THREE FLOORS (docs/mockups/warrior_weapons/pictures/quake_floors_phone.png; step 3d): the same heave,
// at the ring's edge, each on a floor of the game painted straight from its own Theme (art/ground.ts makeGroundArt), the quake's
// lists painted for that Theme (art/warrior_up_quake_ground.ts quakeGround), and the Warrior over it at that moment of his
// Earthquake. Each at the game's own size in picture pixels (two to a game pixel); tools/quake_floors_phone.py makes the picture.
// Also measures how long a quake's 84 pictures take to paint for a floor.
//   npx tsx tools/quake_floors_phone.ts <dir>
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { writePng } from './px_png';
import { VAULT, makeGroundArt } from '../src/art/ground';
import type { Theme } from '../src/art/ground';
import { CRYPT_FLOORS } from '../src/art/crypt';
import { GW_DEEP, GW_FLAG } from '../src/art/gateward';
import { quakeGround, QUAKE_FRAMES, QUAKE_CRACK_FRAMES, QUAKES } from '../src/art/warrior_up_quake_ground';
import { HAMMER_QUAKE, HAMMER_QUAKE_BLOW } from '../src/art/warrior_up_hammer_moves';
import { axeSprite } from '../src/art/warrior_up_axe_moves';
import { WU_SIDES } from '../src/art/warrior_up';

declare const process: { argv: string[] };
paintWithoutCanvas();
const [dir] = process.argv.slice(2);
const hex = (c: readonly number[]): string => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** FLOOR 11, THE GATE WARD: it has no Theme of its own (its ground is its own setts, art/gateward.ts); this is the game's
 * flagstone floor in the Gate Ward's own flag stone and its deep, for the quake to take. */
const GATEWARD: Theme = { ...VAULT, id: 'gateward', mortar: hex(GW_DEEP as unknown as number[]), slab: [1, 2, 3, 4].map((i) => hex(GW_FLAG[i] as unknown as number[])) as unknown as Theme['slab'] };
const FLOORS: [string, Theme][] = [['practice', VAULT], ['crypt3', CRYPT_FLOORS[2]], ['gateward', GATEWARD]];
const W = 640;
const H = 300;
const FRAME = 10;
const lay = (out: Px, s: Sprite, x: number, y: number): void => {
  const p = paintingOf(s);
  const k = 2 / (s.density ?? 1);
  const ax = s.ax * k;
  const ay = s.ay * k;
  for (let j = 0; j < p.h * k; j++) for (let i = 0; i < p.w * k; i++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(i / k)) * 4;
    if (!p.d[o + 3]) continue;
    const X = Math.round(x - ax + i);
    const Y = Math.round(y - ay + j);
    if (X < 0 || Y < 0 || X >= out.w || Y >= out.h) continue;
    for (let c = 0; c < 4; c++) out.d[(Y * out.w + X) * 4 + c] = c < 3 ? Math.round(p.d[o + c] * (p.d[o + 3] / 255) + out.d[(Y * out.w + X) * 4 + c] * (1 - p.d[o + 3] / 255)) : 255;
  }
};
for (const [name, theme] of FLOORS) {
  const out = new Px(W, H);
  const g = makeGroundArt(theme);
  // (the mark in the middle; the floor's tiles laid round it, back to front; a tile's anchor its diamond's top vertex)
  const mx = W / 2;
  const my = H / 2 + 20;
  for (let s = -24; s <= 24; s++) for (let tx = -12; tx <= 12; tx++) {
    const ty = s - tx;
    if (ty < -12 || ty > 12) continue;
    lay(out, g.floor(tx + 40, ty + 40), mx + (tx - ty) * 32, my + (tx + ty) * 16 - 16);
  }
  const t0 = Date.now();
  const q = quakeGround(0, theme);
  // (every picture painted, to time it)
  for (let i = 0; i < QUAKE_FRAMES; i++) { void q.under[i].w; void q.over[i].w; }
  for (const side of WU_SIDES) for (let i = 0; i < QUAKE_CRACK_FRAMES; i++) void q.cracks[side][i].w;
  const ms = Date.now() - t0;
  lay(out, q.cracks.front[QUAKE_CRACK_FRAMES - 1], mx, my);
  lay(out, q.under[FRAME], mx, my);
  // (the Warrior 1.46 tiles back from the mark, facing it: front, down and to the right on the screen)
  lay(out, axeSprite(HAMMER_QUAKE, (HAMMER_QUAKE_BLOW + FRAME) / 30, 'front'), mx - 1.46 * 32, my - 1.46 * 16);
  lay(out, q.over[FRAME], mx, my);
  writePng(out, `${dir}/${name}.png`);
  console.log(name, `a quake's ${QUAKE_FRAMES * 2 + QUAKE_CRACK_FRAMES * 8} pictures painted in ${ms} ms`, QUAKES[0].round);
}
