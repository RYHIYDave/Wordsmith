// Dev page: the ten endless-town sketches (src/dev/endless_town_options.ts), two to a picture, one above the other, each four
// times its size with its stations' words lettered over it, and under it its number, its name, where it is from and its line.
//   tools/endless_town_options.mjs builds this page and photographs each (#k=<1..5>).
import { drawText, textWidth } from '../engine/font';
import { SH, SW, Sk } from './endless_town_options';
import { TOWN_OPTIONS } from './endless_town_options';

const S = 4;
const CAP = 150;
const k = Number((/k=(\d+)/.exec(location.hash) ?? [])[1]) || 1;
const cv = document.createElement('canvas');
cv.width = SW * S;
cv.height = (SH * S + CAP) * 2;
cv.style.cssText = 'display:block;position:absolute;left:0;top:0';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#05040f';
g.fillRect(0, 0, cv.width, cv.height);

for (let i = 0; i < 2; i++) {
  const opt = TOWN_OPTIONS[(k - 1) * 2 + i];
  if (!opt) continue;
  const top = i * (SH * S + CAP);
  const p = new Sk();
  const labels = opt.paint(p);
  const small = document.createElement('canvas');
  small.width = SW;
  small.height = SH;
  const sg = small.getContext('2d') as CanvasRenderingContext2D;
  const img = sg.createImageData(SW, SH);
  for (let j = 0; j < SW * SH; j++) {
    const c = p.d[j];
    img.data[j * 4] = (c >> 16) & 255;
    img.data[j * 4 + 1] = (c >> 8) & 255;
    img.data[j * 4 + 2] = c & 255;
    img.data[j * 4 + 3] = 255;
  }
  sg.putImageData(img, 0, 0);
  g.drawImage(small, 0, top, SW * S, SH * S);
  // the stations' words: small, plain, on a dark plate
  // (a word that would lie on one already placed is moved a little up or down, or aside, until it is clear)
  const placed: [number, number, number, number][] = [];
  const hits = (x: number, y: number, w: number): boolean => placed.some(([a, b, c, d]) => x - 6 < a + c && x + w + 6 > a && y - 4 < b + d && y + 25 > b);
  for (const l of labels) {
    const sc = 3;
    const w = textWidth(l.text) * sc;
    const fit = (dx: number, dy: number): [number, number] => [
      Math.round(Math.max(4, Math.min(cv.width - w - 4, l.x * S - w / 2 + dx))),
      Math.round(Math.max(top + 4, Math.min(top + SH * S - 28, top + l.y * S - 12 + dy))),
    ];
    let [x, y] = fit(0, 0);
    for (const [dx, dy] of [[0, 0], [0, 26], [0, -26], [w / 2 + 10, 0], [-w / 2 - 10, 0], [0, 52], [0, -52], [w / 2 + 10, 26], [-w / 2 - 10, 26], [w / 2 + 10, -26], [-w / 2 - 10, -26]]) {
      const [fx, fy] = fit(dx, dy);
      if (!hits(fx, fy, w)) {
        [x, y] = [fx, fy];
        break;
      }
    }
    placed.push([x, y, w, 7 * sc + 6]);
    g.fillStyle = 'rgba(6,5,16,0.72)';
    g.fillRect(x - 4, y - 3, w + 8, 7 * sc + 6);
    drawText(g, l.text, x, y, '#f2ecd8', { scale: sc });
  }
  // its number, its name, where it is from, its line
  const cy = top + SH * S;
  g.fillStyle = '#0d1030';
  g.fillRect(0, cy, cv.width, CAP);
  drawText(g, `${opt.n}`, 18, cy + 14, '#28dcf0', { scale: 6 });
  drawText(g, opt.name.toUpperCase(), 18 + (opt.n > 9 ? 90 : 56), cy + 14, '#e9ecff', { scale: 6 });
  const from = opt.from === 'new' ? 'A NEW DESIGN' : opt.from.toUpperCase();
  drawText(g, from, cv.width - 18 - textWidth(from) * 3, cy + 26, '#9a90c8', { scale: 3 });
  let line = '';
  let ly = cy + 68;
  for (const word of opt.line.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next) * 3 > cv.width - 36) {
      drawText(g, line, 18, ly, '#b8bfe6', { scale: 3 });
      ly += 30;
      line = word;
    } else line = next;
  }
  if (line) drawText(g, line, 18, ly, '#b8bfe6', { scale: 3 });
}
(window as unknown as { __ready: boolean }).__ready = true;
