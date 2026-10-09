// Dev page: A FEW MOMENTS OF THE HEROES' MOVES SIDE BY SIDE, from in front and from behind, each at
// the size the game shows it on a phone and again larger (the art chat, 8 Oct 2026: the ranger's
// stances). Painted by the game's own function (art/heroes3.ts, paintMove3), the scarf's and the
// feather's flying ends settled as the game moves them.
//   node tools/preview.mjs src/dev/preview_poses.ts shots/x.png 1800 900 "ranger!|rstand@0=Battle|rtown@0=Town"
//   hash = [ranger!][mage!][wild!][grip!]<move>@<seconds>[=<what it is called>]|...   (ranger!: art/moves3.ts RANGER_STANCES on; grip!: GRIP on)
import { paintMove3 } from '../art/heroes3';
import { MAGE_TAILS } from '../art/hero_mage';
import { RANGER_TAILS } from '../art/hero_ranger';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import { MOVES3, useGrippingRuns, useMageStances, useRangerStances, useWild } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { Tails } from '../engine/tails';

let list = decodeURIComponent(location.hash.slice(1)) || 'ranger!|rstand@0=Battle';
for (;;) {
  const m = list.match(/^(ranger|mage|grip|wild)!\|?/);
  if (!m) break;
  if (m[1] === 'ranger') useRangerStances(true);
  else if (m[1] === 'mage') useMageStances(true);
  else if (m[1] === 'wild') useWild(true);
  else useGrippingRuns(true);
  list = list.slice(m[0].length);
}
interface Item {
  key: string;
  t: number;
  label: string;
}
const items: Item[] = list.split('|').filter(Boolean).map((s) => {
  const [what, label] = s.split('=');
  const [key, t] = what.split('@');
  if (!MOVES3[key]) throw new Error(`no move ${key}`);
  return { key, t: Number(t) || 0, label: label ?? `${key} at ${t}` };
});
/** Screen pixels to a picture pixel: as a phone shows the game (five to a game pixel, two picture pixels to that), and larger. */
const SMALL = 2.5;
const BIG = 5;
// (the box of the painter's canvas shown)
const X0 = 30;
const Y0 = 30;
const CW = 116;
const CH = 116;
const KAX = CANVAS3.ax - X0;
const KAY = CANVAS3.ay - Y0;
const PAD = 10;
const LABEL = 22;
const COLW = CW * BIG + PAD + CW * SMALL;
const VIEWS: GameView[] = ['front', 'back'];
const ROWH = LABEL + CH * BIG + PAD;
const cv = document.createElement('canvas');
cv.width = PAD + items.length * (COLW + PAD);
cv.height = VIEWS.length * ROWH + PAD;
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
cv.style.display = 'block';
document.body.appendChild(cv);
(window as unknown as { __size: [number, number] }).__size = [cv.width, cv.height];
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.fillStyle = '#17142e';
g.fillRect(0, 0, cv.width, cv.height);
VIEWS.forEach((view, vi) => {
  items.forEach((it, i) => {
    const move = MOVES3[it.key];
    const hero = move.held === 'bow' ? 'ranger' : move.held === 'staff' ? 'mage' : 'knight';
    const tails = new Tails(hero === 'ranger' ? RANGER_TAILS : hero === 'mage' ? MAGE_TAILS : WARRIOR_TAILS);
    const p = paintMove3(move, it.t, view);
    const roots = (p.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    for (let k = 0; k < 90; k++) tails.step(1 / 60, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
    const x = PAD + i * (COLW + PAD);
    const y = vi * ROWH + PAD;
    g.fillStyle = '#1d1a40';
    g.fillRect(x, y + LABEL, CW * BIG, CH * BIG);
    // the floor's lines through his feet
    g.save();
    g.beginPath();
    g.rect(x, y + LABEL, CW * BIG, CH * BIG);
    g.clip();
    g.strokeStyle = '#2f2b66';
    g.lineWidth = 1;
    for (const way of [1, -1]) {
      g.beginPath();
      g.moveTo(x + (KAX - 70) * BIG, y + LABEL + (KAY - 35 * way) * BIG);
      g.lineTo(x + (KAX + 70) * BIG, y + LABEL + (KAY + 35 * way) * BIG);
      g.stroke();
    }
    g.imageSmoothingEnabled = false;
    // large
    tails.draw(g, x + KAX * BIG, y + LABEL + KAY * BIG, false, BIG * 2);
    g.drawImage(p.px.toCanvas(), X0, Y0, CW, CH, x, y + LABEL, CW * BIG, CH * BIG);
    tails.draw(g, x + KAX * BIG, y + LABEL + KAY * BIG, true, BIG * 2);
    g.restore();
    // and as a phone shows it, beside it
    g.save();
    const sx = x + CW * BIG + PAD;
    const sy = y + LABEL + CH * BIG - CH * SMALL;
    g.fillStyle = '#17142e';
    g.fillRect(sx - 2, sy - 2, CW * SMALL + 4, CH * SMALL + 4);
    g.fillStyle = '#1d1a40';
    g.fillRect(sx, sy, CW * SMALL, CH * SMALL);
    tails.draw(g, sx + KAX * SMALL, sy + KAY * SMALL, false, SMALL * 2);
    g.drawImage(p.px.toCanvas(), X0, Y0, CW, CH, sx, sy, CW * SMALL, CH * SMALL);
    tails.draw(g, sx + KAX * SMALL, sy + KAY * SMALL, true, SMALL * 2);
    g.restore();
    g.fillStyle = '#cfc8ff';
    g.font = '600 16px system-ui, sans-serif';
    g.textBaseline = 'middle';
    g.fillText(`${it.label}${vi === 0 ? '' : ', from behind'}`, x + 2, y + LABEL / 2);
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
