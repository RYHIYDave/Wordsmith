// Dev page: A HERO'S MOVES PLAYED ONE AFTER ANOTHER, as moving pictures for the owner (the art
// chat, 8 Oct 2026: the ranger's moves on his new stance). Each panel plays its moves in turn,
// each from its start to its end, at thirty frames a second, painted by the game's own function
// (art/heroes3.ts, paintMove3) from in front, the scarf's and the feather's flying ends moved on
// as the game moves them. The figure stands in one place on the floor.
//   node tools/page_gif.mjs src/dev/preview_moves.ts "4:ranger!|rstand~0.6+rfall=Falls|..." previews/x.gif
//   hash = <screen pixels to a game pixel>:[ranger!][grip!]<move>[~<seconds>][@<from>-<to>]+<move>...[=<label>]|...
//   (~<seconds>: play a loop that long; @<from>-<to>: only that piece of the move)
import { paintMove3 } from '../art/heroes3';
import { MAGE_TAILS } from '../art/hero_mage';
import { RANGER_TAILS } from '../art/hero_ranger';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import { MOVES3, useGrippingRuns, useRangerStances } from '../art/moves3';
import type { Move3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import { Tails } from '../engine/tails';

const RAW = decodeURIComponent(location.hash.slice(1));
const cut = RAW.indexOf(':');
const S = Number(RAW.slice(0, cut)) || 4;
let list = RAW.slice(cut + 1);
for (;;) {
  const m = list.match(/^(ranger|grip)!\|?/);
  if (!m) break;
  if (m[1] === 'ranger') useRangerStances(true);
  else useGrippingRuns(true);
  list = list.slice(m[0].length);
}
const FPS = 30;
interface Piece {
  move: Move3;
  from: number;
  to: number;
}
interface Panel {
  label: string;
  pieces: Piece[];
  frames: number;
  tails: Tails;
}
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;
const panels: Panel[] = list.split('|').filter(Boolean).map((item) => {
  const [what, label] = item.split('=');
  const pieces = what.split('+').map((p): Piece => {
    const mm = p.match(/^([a-z0-9]+)(?:~([0-9.]+))?(?:@([0-9.]+)-([0-9.]+))?$/i);
    if (!mm || !MOVES3[mm[1]]) throw new Error(`no move ${p}`);
    const move = MOVES3[mm[1]];
    if (mm[2]) return { move, from: 0, to: Number(mm[2]) };
    if (mm[3]) return { move, from: Number(mm[3]), to: Number(mm[4]) };
    return { move, from: 0, to: endOf(move) };
  });
  const frames = pieces.reduce((a, p) => a + Math.max(1, Math.round((p.to - p.from) * FPS)), 0);
  const hero = pieces[0].move.held === 'bow' ? 'ranger' : pieces[0].move.held === 'staff' ? 'mage' : 'knight';
  return { label: label ?? what, pieces, frames, tails: new Tails(hero === 'ranger' ? RANGER_TAILS : hero === 'mage' ? MAGE_TAILS : WARRIOR_TAILS) };
});
/** The move and its moment at frame k of a panel (the last frame of its last piece held after its end). */
function at(p: Panel, k: number): { move: Move3; t: number } {
  let left = k;
  for (const piece of p.pieces) {
    const n = Math.max(1, Math.round((piece.to - piece.from) * FPS));
    if (left < n) {
      const t = piece.from + left / FPS;
      // (a loop played longer than it is goes round)
      const loop = piece.move.motion.loop;
      const end = endOf(piece.move);
      return { move: piece.move, t: loop !== undefined && t > end ? loop + ((t - loop) % (end - loop)) : Math.min(t, end) };
    }
    left -= n;
  }
  const last = p.pieces[p.pieces.length - 1];
  return { move: last.move, t: last.to };
}
// (the box of the painter's canvas shown, in picture pixels)
const X0 = 34;
const Y0 = 34;
const CW = 108;
const CH = 108;
const PAD = 8;
const HEAD = 30;
const LABEL = 20;
const PW = (CW / 2) * S;
const PH = (CH / 2) * S;
const W = PAD + panels.length * (PW + PAD);
const H = HEAD + LABEL + PH + PAD;
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
cv.style.display = 'block';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const frames = Math.max(...panels.map((p) => p.frames)) + 15;
const tailsAt = panels.map(() => -1);

function draw(k: number): string {
  g.fillStyle = '#17142e';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffd866';
  g.font = '700 15px system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.fillText('His moves, at the game’s own speed', PAD, HEAD / 2);
  panels.forEach((p, i) => {
    const x = PAD + i * (PW + PAD);
    const y = HEAD + LABEL;
    // (the flying ends moved on, a sixtieth of a second at a time, up to this frame)
    for (let j = tailsAt[i] + 1; j <= k * 2; j++) {
      const a = at(p, Math.floor(j / 2));
      const f = paintMove3(a.move, a.t, 'front');
      const roots = (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
      if (j === 0) for (let w = 0; w < 60; w++) p.tails.step(1 / 60, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
      p.tails.step(1 / 60, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
    }
    tailsAt[i] = Math.max(tailsAt[i], k * 2);
    const a = at(p, k);
    const f = paintMove3(a.move, a.t, 'front');
    g.fillStyle = '#1d1a40';
    g.fillRect(x, y, PW, PH);
    g.save();
    g.beginPath();
    g.rect(x, y, PW, PH);
    g.clip();
    // the floor's lines through his feet
    const fx = x + ((CANVAS3.ax - X0) / 2) * S;
    const fy = y + ((CANVAS3.ay - Y0) / 2) * S;
    g.strokeStyle = '#2f2b66';
    g.lineWidth = 1;
    for (const way of [1, -1]) {
      g.beginPath();
      g.moveTo(fx - 70 * S, fy - 35 * way * S);
      g.lineTo(fx + 70 * S, fy + 35 * way * S);
      g.stroke();
    }
    g.fillStyle = 'rgba(0, 0, 0, 0.35)';
    g.beginPath();
    g.ellipse(fx, fy, 9 * S, 4.5 * S, 0, 0, Math.PI * 2);
    g.fill();
    g.imageSmoothingEnabled = false;
    p.tails.draw(g, fx, fy, false, S);
    g.drawImage(f.px.toCanvas(), X0, Y0, CW, CH, x, y, PW, PH);
    p.tails.draw(g, fx, fy, true, S);
    g.restore();
    g.fillStyle = '#cfc8ff';
    g.font = '600 14px system-ui, sans-serif';
    g.fillText(p.label, x + 2, HEAD + LABEL / 2);
  });
  return cv.toDataURL('image/png');
}
const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (k: number) => string };
w.__frames = frames;
w.__tickMs = 1000 / FPS;
w.__frame = draw;
draw(0);
w.__ready = true;
