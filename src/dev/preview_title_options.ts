// Dev page: the ten title-screen sketches (src/dev/title_options.ts).
//   node tools/preview.mjs src/dev/preview_title_options.ts shots/t1.png 1024 472 "n=1"        one, four times its size, the game's name over it
//   node tools/preview.mjs src/dev/preview_title_options.ts shots/a.png 1024 2600 "sheet=1-5"  a column of them, numbered and named
//   hash: n=<k> | sheet=<a>-<b>; s=<scale> (default 4); bare (no name drawn over it)

import { drawText } from '../engine/font';
import { THEME } from '../ui/ui';
import { TITLE_OPTIONS } from './title_options';
import { Pic, TH, TW } from './title_options_kit';

const hash = decodeURIComponent(location.hash.slice(1));
const S = Number((/s=(\d+)/.exec(hash) ?? [])[1]) || 4;
const one = /n=(\d+)/.exec(hash);
const sheet = /sheet=(\d+)-(\d+)/.exec(hash);
const bare = hash.includes('bare');

for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#05040f';

function picture(n: number): HTMLCanvasElement {
  const opt = TITLE_OPTIONS.find((o) => o.n === n);
  if (!opt) throw new Error(`no option ${n}`);
  const p = new Pic();
  const t0 = performance.now();
  opt.paint(p);
  console.log(`${n} ${opt.name}: ${(performance.now() - t0).toFixed(0)} ms`);
  const small = p.canvas();
  const cv = document.createElement('canvas');
  cv.width = TW * S;
  cv.height = TH * S;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.drawImage(small, 0, 0, cv.width, cv.height);
  // the game's name, as the game draws it over the picture (on a phone, about 1.5 of these pixels to one of its)
  if (!bare && !opt.ownTitle) drawText(g, 'WORDSMITH', Math.floor(cv.width / 2), Math.round(S * 2.5), THEME.text, { align: 'center', scale: Math.round(S * 1.5), shadow: THEME.call });
  return cv;
}

const LABEL = 44;
const GAP = 14;
if (one) {
  const cv = picture(+one[1]);
  cv.style.display = 'block';
  document.body.appendChild(cv);
} else if (sheet) {
  const a = +sheet[1];
  const b = +sheet[2];
  const ns = TITLE_OPTIONS.filter((o) => o.n >= a && o.n <= b);
  const W = TW * S;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = ns.length * (LABEL + TH * S + GAP);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  ns.forEach((o, i) => {
    const y = i * (LABEL + TH * S + GAP);
    drawText(g, `${o.n}`, 14, y + 10, '#28dcf0', { scale: 4 });
    drawText(g, o.name, 70, y + 10, THEME.text, { scale: 4 });
    g.drawImage(picture(o.n), 0, y + LABEL);
  });
  cv.style.display = 'block';
  document.body.appendChild(cv);
}

(window as unknown as { __ready: boolean }).__ready = true;
