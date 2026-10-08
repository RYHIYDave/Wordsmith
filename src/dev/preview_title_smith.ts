// Dev page: the picture behind the new start screen (art/title_smith.ts), for looking at while it
// is painted.
//   node tools/preview.mjs src/dev/preview_title_smith.ts shots/smith.png 1280 720           the whole picture, twice its size
//   node tools/preview.mjs src/dev/preview_title_smith.ts shots/smith.png 1014 468 "507x234" the part of it a screen of that size shows
//   hash = [<w>x<h>][,s=<scale>][,t=<seconds>][,safe]
//     <w>x<h>   the screen, in game pixels (the picture's middle column is the screen's, and the
//               table's edge is put where the start screen puts it: see ui/panels.ts)
//     s         screen pixels to a game pixel (default 2)
//     t         the moment of the picture's life to show (default 0)
//     still     the picture alone, with none of its life
//     take      which of the four moments: keeper (default), smith, looming, singer
//     safe      rule off what must stay on the screen

import { SMITH_H, SMITH_LIP, SMITH_SAFE, SMITH_TAKES, SMITH_W, makeSmithTitle } from '../art/title_smith';
import type { SmithTake } from '../art/title_smith';

const hash = decodeURIComponent(location.hash.slice(1));
const size = /(\d+)x(\d+)/.exec(hash);
const S = Number((/s=(\d+)/.exec(hash) ?? [])[1]) || 2;
const asked = (/take=(\w+)/.exec(hash) ?? [])[1] as SmithTake | undefined;
const art = makeSmithTitle(asked && SMITH_TAKES.includes(asked) ? asked : 'keeper');

/** The screen, in game pixels: all of the picture, unless a size was asked for. */
const VW = size ? +size[1] : SMITH_W;
const VH = size ? +size[2] : SMITH_H;
/** How far above the bottom of the screen the table's edge is put (the menu is under it). */
const LIFT = 38;

const cv = document.createElement('canvas');
cv.width = VW * S;
cv.height = VH * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${cv.width}px`;
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
g.fillStyle = '#05040f';
g.fillRect(0, 0, VW, VH);

const ox = Math.floor((VW - SMITH_W) / 2);
const oy = size ? VH - LIFT - SMITH_LIP : 0;
g.drawImage(art.still, ox, oy);
const T = Number((/t=([\d.]+)/.exec(hash) ?? [])[1]) || 0;
if (!hash.includes('still')) g.drawImage(art.life(T), ox, oy);

if (hash.includes('safe')) {
  g.strokeStyle = 'rgba(255,224,112,0.8)';
  g.lineWidth = 1;
  g.strokeRect(ox + SMITH_W / 2 - SMITH_SAFE.halfW + 0.5, oy + SMITH_SAFE.top + 0.5, SMITH_SAFE.halfW * 2 - 1, SMITH_SAFE.bottom - SMITH_SAFE.top - 1);
}

(window as unknown as { __ready: boolean }).__ready = true;
