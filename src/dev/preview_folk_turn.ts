// Dev page: each of the town's people turned each of the four ways (art/townsfolk.ts: Facing),
// for looking at while they are painted.
//   node tools/preview.mjs src/dev/preview_folk_turn.ts shots/folk/turn.png 1000 900
//   hash = [<scale>][,f=<frame of the loop>]

import { FACINGS, makeTownsfolk } from '../art/townsfolk';
import type { Facing, Townsfolk } from '../art/townsfolk';
import { drawLights } from '../engine/px';
import { drawText } from '../engine/font';

const hash = decodeURIComponent(location.hash.slice(1));
const S = Number((/^(\d+)/.exec(hash) ?? [])[1]) || 4;
const F = Number((/f=(\d+)/.exec(hash) ?? [])[1]) || 0;
const folk = makeTownsfolk();
const WHO: (keyof Townsfolk)[] = ['armourer', 'mystic', 'wordsmith', 'stranger'];
const SAYS: Record<Facing, string> = { se: 'YOU ARE DOWN-RIGHT', sw: 'YOU ARE DOWN-LEFT', ne: 'YOU ARE UP-RIGHT', nw: 'YOU ARE UP-LEFT' };
const CW = 62;
const CH = 56;
const cv = document.createElement('canvas');
cv.width = (FACINGS.length * CW + 4) * S;
cv.height = (WHO.length * (CH + 10) + 4) * S;
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
g.fillStyle = '#16131c';
g.fillRect(0, 0, cv.width, cv.height);
WHO.forEach((who, j) => {
  FACINGS.forEach((to, i) => {
    const x0 = 2 + i * CW;
    const y0 = 2 + j * (CH + 10);
    g.fillStyle = '#201e50';
    g.fillRect(x0, y0, CW - 2, CH);
    const loop = folk[who].turned[to];
    const sp = loop[F % loop.length];
    const fx = x0 + Math.floor(CW / 2);
    const fy = y0 + CH - 4;
    g.drawImage(sp.img, fx - sp.ax, fy - sp.ay, sp.w, sp.h);
    if (sp.lights) drawLights(g, sp, fx, fy);
    drawText(g, `${to === folk[who].work ? 'AT WORK, ' : ''}${SAYS[to]}`, x0 + 1, y0 + CH + 2, to === folk[who].work ? '#ffe070' : '#b8acbc', { font: 'small' });
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
