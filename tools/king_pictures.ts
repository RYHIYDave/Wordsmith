// THE KING'S PICTURES, made outside a browser (Node): the sheet, the stills, and the film's frames, as PNG files.
// Nothing of the game imports it.
//   npx tsx tools/king_pictures.ts look <move> <t,t,...> [out.png] [k]   (front above, behind below, k times as big)
//   npx tsx tools/king_pictures.ts sheet <out dir>                        (the sheet, the game's size, the Hush, the bird)
//   npx tsx tools/king_pictures.ts film <out dir>                         (the film's frames; tools/king_film.py makes the MP4)
import { Px } from '../src/engine/px';
import { png } from './king_png';
import { mkdirSync, writeFileSync } from 'node:fs';
import { canvasOf } from '../src/art/new_mobs3';
import { HUSH, KING, KING_ALONE } from '../src/art/king_moves';
import { BIRD_CANVAS, FX_CANVAS, birdPainted, crownPainted, curtainsPainted, decreePainted, sweepPainted } from '../src/art/king_fx';
import type { BirdState } from '../src/art/king_fx';
import { birdPicture, frameOf, gameSizePicture, hallFloor, hushPicture, lay, laidOf, shadow, sheetPicture } from '../src/dev/king_scene';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

function look(move: string, ts: number[], out: string, k: number, mobName: string): void {
  const mob = mobName === 'alone' ? KING_ALONE : mobName === 'hush' ? HUSH : KING;
  const can = canvasOf(mob);
  const cw = can.w * k;
  const ch = can.h * k;
  const W = cw * ts.length;
  const H = ch * 2;
  const scene = new Px(W, H);
  const floor = hallFloor(Math.ceil(W / k), Math.ceil(H / k), Math.ceil(W / k / 2), Math.ceil(H / k / 2), false);
  lay(scene, laidOf(floor, 0, 0), 0, 0, k);
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const f = frameOf(mob, move, t, view);
      shadow(scene, cw * i + can.ax * k, ch * row + can.ay * k, 22, k);
      lay(scene, f, cw * i + can.ax * k, ch * row + can.ay * k, k);
    }
  });
  writeFileSync(out, png(scene));
  console.log('wrote', out, W, H);
}

const [mode = 'look', a1 = 'stand', a2 = '0', a3 = '', a4 = '2', a5 = 'king'] = process.argv.slice(2);
if (mode === 'look') look(a1, a2.split(',').map(Number), a3 || `/tmp/king_${a1}.png`, Number(a4), a5);
// (an effect at moments, on the hall's floor, the King standing where it begins: "fx sweep 0.1,0.3 out.png")
if (mode === 'fx') {
  const ts = a2.split(',').map(Number);
  const W = FX_CANVAS.w;
  const H = FX_CANVAS.h;
  const scene = new Px(W, H * ts.length);
  ts.forEach((t, i) => {
    const floor = hallFloor(W, H, FX_CANVAS.ax, FX_CANVAS.ay, false);
    lay(scene, laidOf(floor, 0, 0), 0, H * i, 1);
    const f = a1 === 'sweep' ? sweepPainted(t) : a1 === 'crown' ? crownPainted(t) : a1 === 'decree' ? decreePainted(t) : curtainsPainted(t);
    const kingAt = frameOf(KING, 'stand', 0, 'front');
    lay(scene, kingAt, FX_CANVAS.ax, FX_CANVAS.ay + H * i, 1);
    lay(scene, laidOf(f, 0, 0), 0, H * i, 1);
  });
  writeFileSync(a3 || `/tmp/fx_${a1}.png`, png(scene));
}
if (mode === 'bird') {
  const states: [BirdState, number][] = [['broken', 0], ['winding', 0.4], ['winding', 0.9], ['winding', 1.4], ['singing', 0], ['singing', 0.3], ['singing', 0.6]];
  const k = 6;
  const scene = new Px(BIRD_CANVAS.w * k * states.length, BIRD_CANVAS.h * k * 2);
  for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
    states.forEach(([st, t], i) => {
      const floor = hallFloor(BIRD_CANVAS.w, BIRD_CANVAS.h, BIRD_CANVAS.ax, BIRD_CANVAS.ay, false);
      lay(scene, laidOf(floor, 0, 0), BIRD_CANVAS.w * k * i, BIRD_CANVAS.h * k * row, k);
      lay(scene, laidOf(birdPainted(st, t, view), 0, 0), BIRD_CANVAS.w * k * i, BIRD_CANVAS.h * k * row, k);
    });
  }
  writeFileSync(a2 || '/tmp/bird.png', png(scene));
}
// (many at once: "move:t,t;move:t" into a folder)
if (mode === 'looks') for (const spec of a1.split(';')) {
  const [mv, ts, who = 'king'] = spec.split(':');
  look(mv, ts.split(',').map(Number), `${a2}/${who}_${mv}.png`, Number(a4), who);
}
void mkdirSync;
if (mode === 'sheet') {
  mkdirSync(a1, { recursive: true });
  const t = Number(a2) || 0;
  for (const [name, make] of [['sheet', () => sheetPicture(t)], ['game_size', () => gameSizePicture(t)], ['hush', () => hushPicture(t)], ['songbird', () => birdPicture()]] as const) {
    writeFileSync(`${a1}/raw_${name}.png`, png(make()));
    console.log('wrote', name);
  }
}
