// Dev page: FLOOR 20'S SHAPES OF THE HUSH (art/hush_shapes.ts, art/hush_shapes_moves.ts), hovering, from in front and from
// behind, beside the knight for size, on a quiet grey floor (dev/hush_floor.ts: not floor 20's ground, which is not made);
// a swarm of them at the game's size; a move close up; their grip round the knight. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_hush_shapes.ts shots/hush/sheet.png 1200 400 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big), "grid:<move>:<t>,<t>,..." (a move at several moments,
//   both ways round, twice as big), "grip:<t>" (the grip round the knight, `t` seconds into the attack, three times as big)
// (the film and the pictures for the owner are made without a browser: tools/hush_shapes_pics.ts)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { GRIP_CANVAS, gripPainted } from '../art/hush_shapes';
import { HS_GRIP, HUSH_SHAPE, gripAt } from '../art/hush_shapes_moves';
import type { GameView } from '../art/skin';
import { towerFloor } from './hush_floor';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** The floor, `k` times as big, filling the page. */
function floor(k: number): void {
  const w = Math.ceil(cv.width / k);
  const h = Math.ceil(cv.height / k);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const data = new Uint8ClampedArray(w * h * 4);
  data.set(towerFloor(w, h, 7, 3));
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(data, w, h), 0, 0);
  g.drawImage(c, 0, 0, w * k, h * k);
}
function draw(s: Sprite, x: number, y: number, k: number, flip = false): void {
  const d = s.density ?? 1;
  if (!flip) {
    g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
    return;
  }
  g.save();
  g.translate(Math.round(x), 0);
  g.scale(-1, 1);
  g.drawImage(s.img, Math.round(-s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
  g.restore();
}
const MOB: Mob = HUSH_SHAPE;
const spOf = (which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(MOB, t / MOB.dieTime, view), null, canvasOf(MOB).ax, canvasOf(MOB).ay) : toSprite(paintMob(MOB, which, t, view), MOB.aura, canvasOf(MOB).ax, canvasOf(MOB).ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
/** A point of the floor `fwd` along the way it faces and `left` to its left, on the page from its floor point (picture pixels). */
const onScreen = (view: GameView, fwd: number, left: number): [number, number] => {
  const G = Math.sqrt(2 / 3);
  return view === 'front' ? [G * (fwd + left), G * 0.5 * (fwd - left)] : [G * (fwd - left), G * 0.5 * (-fwd - left)];
};

if (mode === 'sheet') {
  // THE SHEET: it hovering, from in front and from behind, beside the knight, three times as big; a swarm of them at the
  // game's size round the knight
  const K = 3;
  floor(K);
  const y = cv.height - 40;
  draw(hero.front.idle[0], 110, y, K);
  draw(spOf('stand', 0, 'front'), 330, y, K);
  draw(spOf('stand', 0, 'back'), 570, y, K);
  draw(hero.back.idle[0], 760, y, K);
  const x0 = 1010;
  const y0 = y - 70;
  const them: [number, number, GameView, string, number, boolean][] = [
    [-70, -45, 'front', 'walk', 0.1, false],
    [-30, -75, 'front', 'walk', 0.55, false],
    [40, -70, 'front', 'walk', 0.85, true],
    [80, -35, 'front', 'attack', 0.5, true],
    [-90, 12, 'back', 'walk', 0.3, true],
    [70, 30, 'back', 'walk', 0.7, false],
  ];
  const all: { y: number; f: () => void }[] = them.map(([dx, dy, view, move, t, flip]) => ({ y: y0 + dy, f: () => draw(spOf(move, t, view), x0 + dx, y0 + dy, 1, flip) }));
  all.push({ y: y0, f: () => draw(hero.front.idle[0], x0, y0, 1, true) });
  all.sort((a, b) => a.y - b.y).forEach((d) => d.f());
} else if (mode === 'big') {
  const K = 4;
  floor(K);
  const t = Number(a2) || 0;
  draw(spOf(a1, t, 'front'), cv.width * 0.3, cv.height - 70, K);
  draw(spOf(a1, t, 'back'), cv.width * 0.72, cv.height - 70, K);
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS, twice as big: from in front along the top, from behind below
  const K = 2;
  floor(K);
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - 24;
      draw(spOf(a1, t, view), w * (i + 0.3), y, K);
      g.fillStyle = '#ffffff';
      g.font = '14px monospace';
      g.fillText(`${t.toFixed(3)} s`, w * i + 6, y + 18);
    }
  });
} else if (mode === 'grip') {
  // THE GRIP ROUND THE KNIGHT, `t` seconds into its attack, from in front (left) and from behind (right), three times as big
  const K = 3;
  floor(K);
  const t = Number(a1) || HS_GRIP.hit + 0.15;
  const G = gripAt();
  const ft = t - HS_GRIP.hit;
  for (const [view, x] of [['front', cv.width * 0.25], ['back', cv.width * 0.7]] as const) {
    const y = cv.height - 120;
    const [gx, gy] = onScreen(view, G[0], G[1]);
    const shape = (): void => draw(spOf('attack', t, view), x, y, K);
    const fx = (half: 'far' | 'near'): void => {
      if (ft >= 0) draw(toSprite(gripPainted(ft, view, half), null, GRIP_CANVAS.ax, GRIP_CANVAS.ay), x + gx * K, y + gy * K, K);
    };
    const knight = (): void => draw((view === 'front' ? hero.back : hero.front).idle[0], x + gx * K, y + gy * K, K, true);
    if (view === 'front') {
      shape();
      fx('far');
      knight();
      fx('near');
    } else {
      fx('far');
      knight();
      fx('near');
      shape();
    }
  }
}
(window as unknown as { __ready: boolean }).__ready = true;
