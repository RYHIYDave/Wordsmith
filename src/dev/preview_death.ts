// Dev page: a monster's death, frame by frame (art: AnimSet.clips.die), for looking at while it
// is painted. Facing you on the top row, facing away on the bottom.
//   node tools/preview.mjs src/dev/preview_death.ts shots/death/skeleton.png 1400 420 "skeleton"
//   hash = <figure>[:<scale>[:<every>]]     every: one frame in so many (default 2)

import { MONSTER_FIGURES, makeBestiary } from '../art/bestiary';
import type { MonsterFigure } from '../art/bestiary';
import { drawLights } from '../engine/px';

const [whoArg = 'skeleton', scaleArg = '', everyArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const who: MonsterFigure = (MONSTER_FIGURES as readonly string[]).includes(whoArg) ? (whoArg as MonsterFigure) : 'skeleton';
const S = Number(scaleArg) || 3;
const EVERY = Number(everyArg) || 2;
const art = makeBestiary().of(who);
const rows = [art.front, art.back].map((set) => {
  const clip = set.clips?.die;
  const frames = clip ? clip.frames : [];
  const pick: number[] = [];
  for (let i = 0; i < frames.length; i += EVERY) pick.push(i);
  if (frames.length && pick[pick.length - 1] !== frames.length - 1) pick.push(frames.length - 1);
  return [set.idle[0], ...pick.map((i) => frames[i])];
});
let left = 8;
let right = 8;
let up = 8;
let down = 4;
for (const row of rows) for (const sp of row) {
  left = Math.max(left, sp.ax);
  right = Math.max(right, sp.w - sp.ax);
  up = Math.max(up, sp.ay);
  down = Math.max(down, sp.h - sp.ay);
}
const CW = Math.ceil(left + right) + 6;
const CH = Math.ceil(up + down) + 6;
const n = Math.max(...rows.map((r) => r.length));
const cv = document.createElement('canvas');
cv.width = n * CW * S;
cv.height = rows.length * CH * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
rows.forEach((row, j) => {
  row.forEach((sp, i) => {
    const x0 = i * CW;
    const y0 = j * CH;
    g.fillStyle = i === 0 ? '#2a2866' : '#201e50';
    g.fillRect(x0 + 1, y0 + 1, CW - 2, CH - 2);
    // (the floor line)
    g.fillStyle = '#191740';
    g.fillRect(x0 + 1, y0 + 3 + Math.ceil(up), CW - 2, 1);
    const fx = x0 + 3 + Math.ceil(left);
    const fy = y0 + 3 + Math.ceil(up);
    g.drawImage(sp.img, fx - sp.ax, fy - sp.ay, sp.w, sp.h);
    if (sp.lights) drawLights(g, sp, fx, fy);
  });
});
console.log(`${who}: ${rows[0].length - 1} frames shown of ${art.front.clips?.die?.frames.length ?? 0}, cell ${CW} x ${CH}`);
(window as unknown as { __ready: boolean }).__ready = true;
