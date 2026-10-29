// Dev page: THE SILENT ORDER (art/silent_order.ts, art/silent_order_moves.ts, art/silent_order_fx.ts): the guest, the
// armed last and the masks, standing, from in front and from behind, beside the knight for size; at the game's size; a
// move close up; a move at many moments; and THE FILM, every move on a ballroom floor with the knight in it for size.
// Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_silent_order.ts shots/order/sheet.png 1200 900 "sheet"
//   ... "crowd" (at the game's size, and twice it)
//   ... "big:<guest|armed|mask>:<move>:<t>" (front and behind, four times as big)
//   ... "grid:<who>:<move>:<t>,<t>,..." (a move at several moments, both ways round, three times as big)
//   node tools/order_film.mjs (THE FILM: window.__frames, window.__frame(k))
import type { Mob } from '../art/new_mobs3';
import { draw, floor, hero, shadow, spOf } from './order_kit';
import { ORDER_ALL, ORDER_ARMED, ORDER_GUEST, ORDER_MASK, orderOf } from '../art/silent_order_moves';
import type { OrderWho } from '../art/silent_order';
import { filmFrames } from './order_film_plan';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'guest', a2 = 'stand', a3 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

function label(text: string, x: number, y: number, size = 18): void {
  g.font = `bold ${size}px sans-serif`;
  g.fillStyle = '#e8e4ee';
  g.strokeStyle = '#000';
  g.lineWidth = 4;
  g.strokeText(text, x, y);
  g.fillText(text, x, y);
}

if (mode === 'sheet') {
  // THE SHEET: the three dressings, from in front and from behind, between the knight from in front and from behind, three times as big
  const K = 3;
  floor(g, cv.width, cv.height, cv.width / 2, cv.height / 2, K, 'front');
  const y = cv.height - 70;
  const row: [Mob | null, GameView, string][] = [
    [null, 'front', 'the knight'], [ORDER_GUEST, 'front', 'the guest (17)'], [ORDER_GUEST, 'back', ''], [ORDER_ARMED, 'front', 'the armed last (19)'], [ORDER_ARMED, 'back', ''],
    [ORDER_MASK, 'front', 'the masks (20)'], [ORDER_MASK, 'back', ''], [null, 'back', 'the knight'],
  ];
  const margin = 70;
  const cw = (cv.width - 2 * margin) / row.length;
  row.forEach(([mob, view, name], i) => {
    const x = margin + cw * (i + 0.5);
    shadow(g, x, y, mob ? 12 : 11, K);
    if (mob) draw(g, spOf(mob, 'stand', 0, view), x, y, K);
    else draw(g, view === 'front' ? hero.front.idle[0] : hero.back.idle[0], x, y, K);
    if (name) label(name, x - (mob ? 30 : 40), cv.height - 22, 17);
  });
  label('The Silent Order: from in front and from behind, beside the knight, three times as big', 14, 30, 20);
} else if (mode === 'crowd') {
  // AT THE GAME'S SIZE: the guests among the dancers' floor, the armed last, the masks; and the same twice as big
  for (const [K, y0, h] of [[1, 0, cv.height * 0.38], [2, cv.height * 0.38, cv.height * 0.62]] as const) {
    const sub = document.createElement('canvas');
    sub.width = cv.width;
    sub.height = Math.round(h);
    const sg = sub.getContext('2d') as CanvasRenderingContext2D;
    sg.imageSmoothingEnabled = false;
    floor(sg, sub.width, sub.height, sub.width / 2, sub.height / 2, K, 'front');
    const base = sub.height * 0.72;
    const put = (mob: Mob, move: string, t: number, view: GameView, x: number, y: number, flip = false): void => {
      shadow(sg, x, y, 12, K);
      draw(sg, spOf(mob, move, t, view), x, y, K, flip);
    };
    const kx = K === 1 ? 140 : 160;
    shadow(sg, kx, base, 11, K);
    draw(sg, hero.front.idle[0], kx, base, K);
    const S = K;
    const crowd: [Mob, string, number, GameView, number, number, boolean][] = [
      [ORDER_GUEST, 'stand', 0, 'front', 90, -30, false], [ORDER_GUEST, 'stand', 1.1, 'back', 130, -4, true], [ORDER_GUEST, 'stand', 2.0, 'front', 165, -40, true],
      [ORDER_GUEST, 'walk', 0.1, 'front', 200, -12, false],
      [ORDER_ARMED, 'stand', 0.5, 'front', 270, -24, false], [ORDER_ARMED, 'stand', 1.6, 'back', 305, 0, false], [ORDER_ARMED, 'attack', 0.6, 'front', 345, -30, false],
      [ORDER_MASK, 'stand', 0.3, 'front', 420, -26, false], [ORDER_MASK, 'stand', 1.4, 'back', 455, -2, true], [ORDER_MASK, 'knife', 0.6, 'front', 495, -32, false],
    ];
    for (const [mob, move, t, view, x, dy, flip] of crowd) put(mob, move, t, view, (kx + x * S * 0.9) | 0, base + dy * S, flip);
    g.drawImage(sub, 0, y0);
    label(K === 1 ? "At the game's size: guests (17), the armed last (19), the masks (20), the knight on the left" : 'Twice as big', 12, y0 + 22, 18);
  }
} else if (mode === 'big') {
  const K = 4;
  floor(g, cv.width, cv.height, cv.width / 2, cv.height / 2, K, 'front');
  const mob = orderOf(a1 as OrderWho);
  const t = Number(a3) || 0;
  draw(g, spOf(mob, a2, t, 'front'), cv.width * 0.28, cv.height - 70, K);
  draw(g, spOf(mob, a2, t, 'back'), cv.width * 0.72, cv.height - 70, K);
  label(`${a1} ${a2} @${t.toFixed(2)} s: from in front, from behind`, 12, 26);
} else if (mode === 'grid') {
  const K = 3;
  floor(g, cv.width, cv.height, cv.width / 2, cv.height / 2, K, 'front');
  const mob = orderOf(a1 as OrderWho);
  const ts = a3.split(',').map(Number);
  const cw = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [view, row] of [['front', 0], ['back', 1]] as const) {
      const y = (cv.height / 2) * (row + 1) - 40;
      shadow(g, cw * (i + 0.5), y, 12, K);
      draw(g, spOf(mob, a2, t, view), cw * (i + 0.5), y, K);
    }
    label(t.toFixed(2), cw * i + 8, 22, 16);
  });
  label(`${a1} ${a2}`, 8, cv.height - 10, 16);
} else if (mode === 'filmframe') {
  // (one frame of the film, to look at)
  const frames = filmFrames(g, cv.width, cv.height, (a1 as OrderWho | 'all') ?? 'all');
  for (const k of a2.split(',').map(Number)) frames.draw(k);
} else if (mode === 'film') {
  const frames = filmFrames(g, cv.width, cv.height, (a1 as OrderWho | 'all') ?? 'all');
  (window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string }).__frames = frames.n;
  (window as unknown as { __tickMs: number }).__tickMs = 1000 / 30;
  (window as unknown as { __frame: (k: number) => string }).__frame = (k: number) => {
    frames.draw(k);
    return cv.toDataURL('image/png');
  };
}
void ORDER_ALL;
void ORDER_ARMED;
void ORDER_MASK;
(window as unknown as { __ready: boolean }).__ready = true;
