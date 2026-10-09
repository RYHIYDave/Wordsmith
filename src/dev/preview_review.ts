// Dev page: EVERY FRAME OF ONE OF THE HEROES' MOVES ON ONE SHEET, for the review of the heroes'
// animations against the art rulebook (tools/review_heroes/; the art chat, 8 Oct 2026). Painted by the
// game's own function (art/heroes3.ts, paintMove3), from in front and from behind, the scarf's and
// the feather's flying ends moved on from frame to frame as the game moves them.
//   node tools/preview.mjs src/dev/preview_review.ts shots/rv_strike.png 1800 900 "strike:3:8:1"
//   hash = <move>:<screen pixels to a picture pixel>:<frames to a row>:<every how many frames>[:<first>-<last>[:<x0>,<y0>,<x1>,<y1>]]
import { paintMove3 } from '../art/heroes3';
import { MAGE_TAILS } from '../art/hero_mage';
import { RANGER_TAILS } from '../art/hero_ranger';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { Tails } from '../engine/tails';

const [name = 'rear', sArg = '3', colsArg = '8', everyArg = '1', range = '', cropArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const move = MOVES3[name] ?? MOVES3.rear;
const FRAME = 1 / 30;
const END = move.motion.keys[move.motion.keys.length - 1].at;
const S = Number(sArg) || 3;
const COLS = Number(colsArg) || 8;
const EVERY = Number(everyArg) || 1;
const last = Math.round(END / FRAME);
const [f0, f1] = range ? range.split('-').map(Number) : [0, last];
const frames: number[] = [];
for (let f = f0; f <= Math.min(last, f1); f += EVERY) frames.push(f);
const HERO = move.held === 'bow' ? 'ranger' : move.held === 'staff' ? 'mage' : 'knight';
const TAILS = HERO === 'ranger' ? RANGER_TAILS : HERO === 'mage' ? MAGE_TAILS : WARRIOR_TAILS;
// (the box of the painter's canvas shown: room above the head for a raised weapon)
// (`<first>-<last>:<x0>,<y0>,<x1>,<y1>` at the end of the hash: those frames only, and that box only)
const CROP = cropArg ? cropArg.split(',').map(Number) : [22, 6, 154, 154];
const X0 = CROP[0];
const Y0 = CROP[1];
const CW = CROP[2] - CROP[0];
const CH = CROP[3] - CROP[1];
const KAX = CANVAS3.ax - X0;
const KAY = CANVAS3.ay - Y0;
const PAD = 6;
const LABEL = 18;
const HEAD = 34;
const ROWS = Math.ceil(frames.length / COLS);
const VIEWS: GameView[] = ['front', 'back'];
const cv = document.createElement('canvas');
cv.width = PAD + Math.min(COLS, frames.length) * (CW * S + PAD);
cv.height = HEAD + VIEWS.length * (ROWS * (CH * S + LABEL + PAD) + 22);
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#17142e';
cv.style.display = 'block';
document.body.appendChild(cv);
// (the size of the sheet, for whoever photographs it)
(window as unknown as { __size: [number, number] }).__size = [cv.width, cv.height];
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.fillStyle = '#17142e';
g.fillRect(0, 0, cv.width, cv.height);
g.fillStyle = '#ffd866';
g.font = '700 17px system-ui, sans-serif';
g.textBaseline = 'middle';
g.fillText(`${name}: ${move.name}. Frames at 30 a second${EVERY > 1 ? `, every ${EVERY}th shown` : ''}${move.motion.hit !== undefined ? `; the blow at frame ${(move.motion.hit / FRAME).toFixed(1)}` : ''}${move.motion.loop !== undefined ? `; goes round from ${(move.motion.loop / FRAME).toFixed(1)}` : ''}`, PAD, HEAD / 2);
VIEWS.forEach((view, vi) => {
  const top = HEAD + vi * (ROWS * (CH * S + LABEL + PAD) + 22);
  g.fillStyle = '#9a94c8';
  g.font = '600 14px system-ui, sans-serif';
  g.fillText(view === 'front' ? 'Facing you' : 'Facing away', PAD, top + 10);
  // the flying ends, moved on from frame to frame (settled first on the first)
  const tails = new Tails(TAILS);
  frames.forEach((f, i) => {
    const t = f * FRAME;
    const p = paintMove3(move, t, view);
    const roots = (p.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    const steps = i === 0 ? 60 : EVERY * 2;
    for (let k = 0; k < steps; k++) tails.step(FRAME / 2, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    const x = PAD + c * (CW * S + PAD);
    const y = top + 22 + r * (CH * S + LABEL + PAD);
    g.fillStyle = (c + r) % 2 ? '#211e4b' : '#262354';
    g.fillRect(x, y, CW * S, CH * S + LABEL);
    g.save();
    g.beginPath();
    g.rect(x, y + LABEL, CW * S, CH * S);
    g.clip();
    g.strokeStyle = '#34306c';
    g.lineWidth = 1;
    for (const way of [1, -1]) {
      g.beginPath();
      g.moveTo(x + (KAX - 60) * S, y + LABEL + (KAY - 30 * way) * S);
      g.lineTo(x + (KAX + 60) * S, y + LABEL + (KAY + 30 * way) * S);
      g.stroke();
    }
    g.imageSmoothingEnabled = false;
    tails.draw(g, x + KAX * S, y + LABEL + KAY * S, false, S * 2);
    g.drawImage(p.px.toCanvas(), X0, Y0, CW, CH, x, y + LABEL, CW * S, CH * S);
    tails.draw(g, x + KAX * S, y + LABEL + KAY * S, true, S * 2);
    g.restore();
    const hit = move.motion.hit !== undefined && Math.abs(t - move.motion.hit) < 1e-6;
    g.fillStyle = hit ? '#ffd866' : '#cfc8ff';
    g.font = '600 13px system-ui, sans-serif';
    g.fillText(`f ${f}${hit ? '  the blow' : ''}`, x + 6, y + LABEL / 2 + 1);
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
