// Dev page: the skeleton and the Shieldbearer with the sword raised (as now) and lowered.
//   node tools/preview.mjs src/dev/preview_sword_low.ts shots/sword_low.png 1700 560
import { makeShieldbearerArt, makeSkeletonArt } from '../art/monster_bones';
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const S = 5;
const CW = 42 * S;
const CH = 48 * S;
const cells: [string, Sprite][] = [];
for (const low of [false, true]) {
  const sk = makeSkeletonArt(low);
  const sh = makeShieldbearerArt(low);
  const tag = low ? 'lowered' : 'raised';
  cells.push([`Skeleton, ${tag}`, sk.front.idle[0]], [`from behind`, sk.back.idle[0]], [`Shieldbearer, ${tag}`, sh.front.idle[0]], [`from behind`, sh.back.idle[0]]);
}
const cv = document.createElement('canvas');
cv.width = 20 + 8 * CW;
cv.height = 60 + CH + 30;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#17131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#17131c';
g.fillRect(0, 0, cv.width, cv.height);
g.font = 'bold 28px sans-serif';
g.fillStyle = '#ffe070';
g.fillText('Swords: raised as now, and lowered', 14, 36);
cells.forEach(([label, sp], i) => {
  const x0 = 10 + i * CW;
  g.fillStyle = i < 4 ? '#221f55' : '#2a2866';
  g.fillRect(x0 + 2, 54, CW - 4, CH);
  const fx = x0 + CW / 2;
  const fy = 54 + CH - 6 * S;
  g.save();
  g.translate(fx, fy);
  g.scale(S, S);
  g.drawImage(sp.img, -sp.ax, -sp.ay, sp.w, sp.h);
  if (sp.lights) drawLights(g, sp, 0, 0);
  g.restore();
  g.font = '15px sans-serif';
  g.fillStyle = '#d8d0e0';
  g.fillText(label, x0 + 8, 54 + CH + 20);
});
(window as unknown as { __ready: boolean }).__ready = true;
