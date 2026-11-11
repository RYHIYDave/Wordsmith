// Dev page: the ten sketches for endless mode's splash (src/dev/endless_options.ts), one at a time, each four times its size with
// the word lettered on it as the game would, and under it its number, its name and what would move in it.
//   tools/endless_options.mjs builds this page and photographs each (#n=<k>).
import { drawText, textWidth } from '../engine/font';
import { drawEndlessSplashArt } from '../ui/endless_splash_draw';
import { ENDLESS_SPLASH } from '../art/endless_splash';
import { ENDLESS_OPTIONS } from './endless_options';
import { Pic, TH, TW } from './title_options_kit';

const S = 4;
const CAP = 160;
const n = Number((/n=(\d+)/.exec(location.hash) ?? [])[1]) || 1;
const opt = ENDLESS_OPTIONS.find((o) => o.n === n);
if (!opt) throw new Error(`no option ${n}`);
const cv = document.createElement('canvas');
cv.width = TW * S;
cv.height = TH * S + CAP;
cv.style.cssText = 'display:block;position:absolute;left:0;top:0';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#05040f';
g.fillRect(0, 0, cv.width, cv.height);
if (opt.paint) {
  const p = new Pic();
  opt.paint(p);
  g.drawImage(p.canvas(), 0, 0, TW * S, TH * S);
  // (the word as the game letters it: its dark edge, its pale face; the line under it)
  const cx = (TW * S) / 2;
  const y = opt.wordY * S;
  const sc = 3 * S;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) drawText(g, 'ENDLESS', cx + dx * (sc / 2), y + dy * (sc / 2), '#2a2466', { align: 'center', scale: sc });
  drawText(g, 'ENDLESS', cx, y, '#ece8ff', { align: 'center', scale: sc });
  const wa = textWidth('THE WAY GOES ON') * 2;
  const wb = textWidth('HARDCORE') * 2;
  const x0 = cx - (wa + 20 + wb) / 2;
  drawText(g, 'THE WAY GOES ON', x0, y + 7 * sc + sc, '#b0a4e0', { scale: 2, shadow: '#2a2466' });
  drawText(g, 'HARDCORE', x0 + wa + 20, y + 7 * sc + sc, '#ff4f8a', { scale: 2, shadow: '#2a2466' });
} else {
  // (the hall of gates as it is painted, on a phone held sideways)
  const full = document.createElement('canvas');
  full.width = 1014;
  full.height = 468;
  const fg = full.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
  fg.setTransform(2, 0, 0, 2, 0, 0);
  fg.imageSmoothingEnabled = false;
  ENDLESS_SPLASH.picture = 'hall';
  drawEndlessSplashArt(fg, 3, 507, 234);
  g.drawImage(full, 5, 2);
}
// its number, its name, what would move
g.fillStyle = '#0d1030';
g.fillRect(0, TH * S, cv.width, CAP);
drawText(g, `${opt.n}`, 16, TH * S + 14, '#28dcf0', { scale: 6 });
drawText(g, opt.name, 16 + (opt.n > 9 ? 86 : 52), TH * S + 14, '#e9ecff', { scale: 6 > 0 && textWidth(opt.name) * 6 > cv.width - 110 ? 5 : 6 });
let line = '';
let ly = TH * S + 68;
for (const word of opt.life.split(' ')) {
  const next = line ? `${line} ${word}` : word;
  if (line && textWidth(next) * 3 > cv.width - 32) {
    drawText(g, line, 16, ly, '#a3abd8', { scale: 3 });
    ly += 28;
    line = word;
  } else line = next;
}
if (line) drawText(g, line, 16, ly, '#a3abd8', { scale: 3 });
(window as unknown as { __ready: boolean }).__ready = true;
