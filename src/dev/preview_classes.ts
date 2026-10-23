// Dev page: THREE NEW CLASSES, TEN LOOKS EACH (dev/options_classes.ts; the owner, 23 Oct 2026, 15:27 Pacific). Each in a
// numbered pane, standing as the class stands, facing the eye; the first pane the knight as he is, for size. NOT IN THE GAME:
// pictures for him to choose from.
//   node tools/preview.mjs src/dev/preview_classes.ts previews/brawler.png 100 100 "brawler:5:4"
//   hash = <brawler | warlock | apothecary>:<screen pixels to a picture pixel>:<panes in a row>[:close]
import { paintMove3 } from '../art/heroes3';
import type { Painted } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import { Tails } from '../engine/tails';
import type { TailDef } from '../engine/tails';
import { CLASSES, paintClassLook } from './options_classes';
import type { ClassId } from './options_classes';

const [whatArg = 'brawler', scaleArg = '5', colsArg = '4', lookArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const what = (whatArg in CLASSES ? whatArg : 'brawler') as ClassId;
const S = Number(scaleArg) || 5;
const COLS = Number(colsArg) || 4;

interface Pane {
  n: string;
  name: string;
  f: Painted;
  flies?: Record<string, TailDef>;
}
const panes: Pane[] = [];
const cl = CLASSES[what];
let heading = what.endsWith('2') ? `${cl.title} · sketches · not in the game` : `${cl.title}: ten looks to choose from · sketches · not in the game`;
let HALF = 30;
let UP = 80;
let DOWN = 8;
let CLOSE = 0;
panes.push({ n: '', name: 'The knight, for size', f: paintMove3(MOVES3.ktown, 0, 'front'), flies: WARRIOR_TAILS });
cl.looks.forEach((l, k) => panes.push({ n: l.n ?? String(k + 1), name: l.name, f: paintClassLook(what, k) }));
if (lookArg === 'close') {
  heading = heading.replace(' · sketches', ', close up · sketches');
  HALF = 24;
  UP = 90;
  DOWN = -40;
}
const CW = HALF * 2;
const CH = UP + DOWN;
const CX0 = CANVAS3.ax - HALF;
const CY0 = CANVAS3.ay - UP;
// (the closer look: a square about the head)
const HEAD = 30;
const closeW = CLOSE ? HEAD * S * CLOSE : 0;
const PAD = 10;
const HEADING = 46;
const NAME = 34;
const BG = '#17142e';
const PANEL = ['#262354', '#211e4b'];

const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = BG;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.appendChild(cv);
const paneW = CW * S + closeW;
const paneH = Math.max(CH * S, closeW);
const rows = Math.ceil(panes.length / COLS);
cv.width = PAD + COLS * (paneW + PAD);
cv.height = PAD + HEADING + rows * (NAME + paneH + PAD);
const g = cv.getContext('2d') as CanvasRenderingContext2D;

/** Where the head is in a painting: the middle of the topmost fifth of what is painted, about (found from the picture: a sketch does not say). */
function headOf(f: Painted): [number, number] {
  const p = f.px;
  let top = -1;
  for (let y = 0; y < p.h && top < 0; y++) for (let x = CANVAS3.ax - 16; x < CANVAS3.ax + 16; x++) if (p.has(x, y)) top = y;
  return [CANVAS3.ax, Math.max(0, top) + HEAD / 2 - 3];
}

g.fillStyle = BG;
g.fillRect(0, 0, cv.width, cv.height);
g.fillStyle = '#ffd866';
g.font = '700 22px system-ui, sans-serif';
g.textAlign = 'left';
g.textBaseline = 'middle';
g.fillText(heading, PAD + 4, PAD + HEADING / 2);
panes.forEach((pane, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = PAD + col * (paneW + PAD);
  const top = PAD + HEADING + row * (NAME + paneH + PAD);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillStyle = '#ffd866';
  g.font = '800 26px system-ui, sans-serif';
  g.fillText(pane.n, x + 4, top + NAME / 2);
  const nw = g.measureText(pane.n).width;
  g.fillStyle = '#cfc8ff';
  g.font = '600 17px system-ui, sans-serif';
  g.fillText(pane.name, x + 14 + nw, top + NAME / 2 + 1);
  const y = top + NAME;
  g.fillStyle = PANEL[(row + col) % 2];
  g.fillRect(x, y, paneW, paneH);
  const feetX = x + HALF * S;
  const feetY = y + UP * S;
  g.save();
  g.beginPath();
  g.rect(x, y, CW * S, paneH);
  g.clip();
  // the floor they stand on: the grid's lines through their place
  g.strokeStyle = '#34306c';
  g.lineWidth = 1;
  for (const way of [1, -1]) {
    g.beginPath();
    g.moveTo(feetX - 60 * S, feetY - 30 * way * S);
    g.lineTo(feetX + 60 * S, feetY + 30 * way * S);
    g.stroke();
  }
  g.imageSmoothingEnabled = false;
  const img = pane.f.px.toCanvas();
  // (what flies from them, hanging as it does on one who stands: let fall for a while first)
  const tails = pane.flies && pane.f.tails && pane.f.tails.length > 0 ? new Tails(pane.flies) : null;
  const roots = (pane.f.tails ?? []).map((root) => ({ ...root, x: root.x / 2, y: root.y / 2 }));
  if (tails) for (let k = 0; k < 90; k++) tails.step(1 / 30, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
  if (tails) tails.draw(g, feetX, feetY, false, S * 2);
  g.drawImage(img, CX0, CY0, CW, CH, x, y, CW * S, CH * S);
  if (tails) tails.draw(g, feetX, feetY, true, S * 2);
  g.restore();
  if (CLOSE) {
    const [hx, hy] = headOf(pane.f);
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#1b1840';
    g.fillRect(x + CW * S, y, closeW, closeW);
    g.drawImage(img, hx - HEAD / 2, hy - HEAD / 2, HEAD, HEAD, x + CW * S, y, closeW, closeW);
  }
});

(window as unknown as { __ready: boolean }).__ready = true;
