// Dev page: the Ranger's trap, as it was and as it is, for each element, idle and armed.
//   node tools/preview.mjs src/dev/preview_trap.ts shots/trap.png 1500 760
import { makeIconArt, trapFrameBefore } from '../art/icons';
import type { Element } from '../game/types';
import type { Sprite } from '../engine/px';

const art = makeIconArt();
const ELS: readonly Element[] = ['phys', 'fire', 'frost', 'lightning'];
const NAMES: Record<Element, string> = { phys: 'No element', fire: 'Flame', frost: 'Frost', lightning: 'Lightning' };
const S = 10;
const CW = 22 * S;
const CH = 17 * S;
const cv = document.createElement('canvas');
cv.width = 40 + ELS.length * 2 * CW;
cv.height = 70 + 2 * (CH + 50);
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#17131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#17131c';
g.fillRect(0, 0, cv.width, cv.height);
const text = (t: string, x: number, y: number, size: number, color: string): void => {
  g.font = `bold ${size}px sans-serif`;
  g.fillStyle = color;
  g.fillText(t, x, y);
};
text("The Ranger's trap", 20, 40, 30, '#ffe070');
const rows: [string, (el: Element, armed: boolean) => Sprite][] = [
  ['Before', (el, armed) => trapFrameBefore(el, armed)],
  ['Now', (el, armed) => art.trap[el][armed ? 1 : 0]],
];
rows.forEach(([name, of], j) => {
  const y0 = 70 + j * (CH + 50);
  text(name, 20, y0 + 22, 22, '#f0e8f0');
  ELS.forEach((el, i) => {
    for (const armed of [false, true]) {
      const x0 = 20 + (i * 2 + (armed ? 1 : 0)) * CW;
      // the dungeon floor's colour, and a hint of its grid
      g.fillStyle = '#221f55';
      g.fillRect(x0 + 2, y0 + 30, CW - 4, CH);
      const sp = of(el, armed);
      const fx = x0 + CW / 2;
      const fy = y0 + 30 + CH * 0.6;
      g.drawImage(sp.img, fx - sp.ax * S, fy - sp.ay * S, sp.w * S, sp.h * S);
      text(`${NAMES[el]}${armed ? ', armed' : ''}`, x0 + 6, y0 + 30 + CH + 16, 14, '#b8acbc');
    }
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
