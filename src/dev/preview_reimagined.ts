// Dev page: THE RANGER, REIMAGINED (the art chat, 9 Oct 2026): a picture for the owner of the
// Wind-runner (art/hero3_ranger2.ts), the new outfit over the ranger's same bones and moves, beside
// the ranger as the game has him today. NOT IN THE GAME: the switch (art/reimagined.ts) is off; this
// page turns it on only while it paints the new one. Each figure is painted by the game's own
// painter (art/heroes3.ts, paintMove3) and stood on the dungeon's own floor with the pool of light
// the game puts behind a hero; what flies from him (the tail of the hood, the feather) is moved by
// the game's own tails (engine/tails.ts), as it would have moved by that moment, and the feather
// glows as the game makes it. The last row is the two of them at about the size a phone shows them.
//   node tools/preview.mjs src/dev/preview_reimagined.ts previews/reimagined/ranger_sheet.png 900 2640 "4"
//   hash = <screen pixels to a picture pixel; 4 if not given>
import { makeGroundArt } from '../art/ground';
import { HERO_TAILS } from '../art/heroes';
import { paintMove3 } from '../art/heroes3';
import type { Painted } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import type { Move3 } from '../art/moves3';
import { REIMAGINED } from '../art/reimagined';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { bonesAt, solve } from '../art/skeleton';
import { drawGlow } from '../engine/px';
import { Tails } from '../engine/tails';
import { TUNE } from '../game/defs';

const [scaleArg = '4'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
/** On a phone the game shows a picture pixel about two and a half of the screen's own pixels across: the size of the last row. */
const SMALL = 2;

/** A pane, in picture pixels: how far it reaches to either side of the figure's place on the floor, above it and below it. */
const HALF = 54;
const HALF_SMALL = 46;
const UP = 98;
const DOWN = 26;
const PH = UP + DOWN;
const PAD = 12;
const HEADING = 92;
const ROWHEAD = 34;
const LABEL = 30;
const BG = '#17142e';
const ground = makeGroundArt();

/** A frame of a move, with the reimagined outfit or without it. */
function paint(on: boolean, move: Move3, t: number, view: GameView): Painted {
  const was = REIMAGINED.ranger;
  REIMAGINED.ranger = on;
  try {
    return paintMove3(move, t, view);
  } finally {
    REIMAGINED.ranger = was;
  }
}

/** One picture: a figure, a frame of a move, and what flies from it as it would be by then. */
interface Pane {
  label: string;
  f: Painted;
  tails: Tails;
}

/** Where its tails are tied in a frame, in game pixels, as the game is told (half the picture's pixels). */
const roots = (f: Painted): { id: string; x: number; y: number; over: boolean }[] => (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));

/**
 * A figure doing a move from `t0` to `t`, a sixtieth of a second at a time, going `speed` game
 * pixels a second along the screen as a hero facing that way does (down-right facing you, up-right
 * facing away): its tails are moved all the way, and the frame at `t` is the picture. It has stood
 * a couple of seconds in `before` first, so that the tails have settled.
 */
function pane(label: string, on: boolean, move: Move3, t: number, view: GameView, opts: { t0?: number; speed?: number; before?: Move3 } = {}): Pane {
  const tails = new Tails(HERO_TAILS);
  const ax = CANVAS3.ax / 2;
  const ay = CANVAS3.ay / 2;
  const before = opts.before ?? move;
  const dt = 1 / 60;
  // (standing first: the first frame of what comes before, a couple of seconds)
  const first = paint(on, before, 0, view);
  for (let k = 0; k < 150; k++) tails.step(dt, roots(first), ax, ay, 1, 0, 0);
  const t0 = opts.t0 ?? Math.max(0, t - 1.2);
  const speed = opts.speed ?? 0;
  const way: [number, number] = view === 'front' ? [0.894, 0.447] : [0.894, -0.447];
  let f = first;
  let ox = 0;
  let oy = 0;
  for (let k = 0; t0 + k * dt <= t + 1e-9; k++) {
    const now = Math.min(t, t0 + k * dt);
    f = paint(on, move, now, view);
    ox += way[0] * speed * dt;
    oy += way[1] * speed * dt;
    tails.step(dt, roots(f), ax, ay, 1, ox, oy);
  }
  return { label, f, tails };
}

/** The moment of a move when something is greatest: the stride at its longest, the string drawn back furthest. */
function most(move: Move3, of: (t: number) => number, from = 0, to?: number): number {
  const keys = move.motion.keys;
  const end = to ?? keys[keys.length - 1].at;
  let best = from;
  let top = -Infinity;
  for (let t = from; t <= end + 1e-9; t += 1 / 60) {
    const v = of(t);
    if (v > top) {
      top = v;
      best = t;
    }
  }
  return best;
}

const run = MOVES3.rrun;
const shot = MOVES3.shot;
const stand = MOVES3.rstand;
const town = MOVES3.rtown;
// (mid-run: the stride at its longest; the shot: the string drawn back furthest, before it is loosed)
const stride = most(run, (t) => {
  const s = solve(run.build, bonesAt(run.motion.keys, run.rest, t));
  return Math.hypot(s.ankleL[0] - s.ankleR[0], s.ankleL[1] - s.ankleR[1]) + (s.ankleL[0] > s.ankleR[0] ? 0.5 : 0);
});
const hit = shot.motion.hit ?? 0.2;
const drawn = most(shot, (t) => bonesAt(shot.motion.keys, shot.rest, t).draw, 0, hit - 1 / 60);
// (a run long enough to be at full speed, ending at that moment of the stride; a loop folds into itself)
const runLoop = run.motion.loop ?? 0;
const runEnd = run.motion.keys[run.motion.keys.length - 1].at;
const runT = stride + (runEnd - runLoop) * 2;
// (the speed the game runs him at, in tiles a second; a tile is 32 game pixels across and 16 down)
const RUN_SPEED = TUNE.heroSpeed * Math.hypot(16, 8);

const ROWS: { title: string; panes: Pane[]; k: number; half: number }[] = [
  { title: 'TODAY: the Feather-cap Scout', k: S, half: HALF, panes: [pane('Today, facing you', false, stand, 0, 'front'), pane('Today, facing away', false, stand, 0, 'back')] },
  { title: 'REIMAGINED: the Wind-runner', k: S, half: HALF, panes: [pane('Reimagined, facing you', true, stand, 0, 'front'), pane('Reimagined, facing away', true, stand, 0, 'back')] },
  {
    title: 'REIMAGINED: on the move',
    k: S,
    half: HALF,
    panes: [pane('Running', true, run, runT, 'front', { t0: 0, speed: RUN_SPEED }), pane('Shot: the string drawn back', true, shot, drawn, 'front', { t0: 0, before: stand })],
  },
  {
    title: 'REIMAGINED: in town, and running away from you',
    k: S,
    half: HALF,
    panes: [pane('In town', true, town, 0, 'front'), pane('Running, facing away', true, run, runT, 'back', { t0: 0, speed: RUN_SPEED })],
  },
  {
    title: 'At about the size your phone shows them',
    k: SMALL,
    half: HALF_SMALL,
    panes: [pane('Today', false, stand, 0, 'front'), pane('Today, away', false, stand, 0, 'back'), pane('Reimagined', true, stand, 0, 'front'), pane('Reimagined, away', true, stand, 0, 'back')],
  },
];

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
cv.width = PAD + Math.max(...ROWS.map((r) => r.panes.length * (r.half * 2 * r.k + PAD)));
cv.height = HEADING + ROWS.reduce((a, r) => a + ROWHEAD + PH * r.k + LABEL, 0) + PAD;
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.fillStyle = BG;
g.fillRect(0, 0, cv.width, cv.height);
g.textBaseline = 'middle';
g.textAlign = 'left';
g.fillStyle = '#ffd866';
g.font = '700 30px system-ui, sans-serif';
g.fillText('The ranger, reimagined', PAD + 2, PAD + 20);
g.fillStyle = '#cfc8ff';
g.font = '600 19px system-ui, sans-serif';
g.fillText('a mock-up: not in the game', PAD + 2, PAD + 56);

/**
 * A piece of the dungeon's floor, `k` screen pixels to a picture pixel, under a figure whose place
 * on the floor is at (fx, fy); the dark beyond the hero's light, and the pool of light the game
 * puts behind a hero (as src/dev/preview_heroes3.ts lays them).
 */
function floor(x: number, y: number, w: number, h: number, fx: number, fy: number, k: number): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, w, h);
  g.imageSmoothingEnabled = false;
  for (let ty = -3; ty <= 3; ty++) {
    for (let tx = -3; tx <= 3; tx++) {
      if (Math.abs(tx) + Math.abs(ty) > 4) continue;
      const sp = ground.floor(tx + 20, ty + 20);
      const px = fx + (tx - ty) * 32 * k;
      const py = fy + (tx + ty) * 16 * k - 16 * k;
      g.drawImage(sp.img, px - sp.ax * 2 * k, py - sp.ay * 2 * k, sp.img.width * k, sp.img.height * k);
    }
  }
  const dark = g.createRadialGradient(fx, fy - 20 * k, 10 * k, fx, fy - 20 * k, 110 * k);
  dark.addColorStop(0, 'rgba(6,4,14,0)');
  dark.addColorStop(0.6, 'rgba(6,4,14,0.35)');
  dark.addColorStop(1, 'rgba(6,4,14,0.8)');
  g.fillStyle = dark;
  g.fillRect(x, y, w, h);
  const pool = g.createRadialGradient(fx - 4 * k, fy - 30 * k, 0, fx - 4 * k, fy - 30 * k, 46 * k);
  pool.addColorStop(0, 'rgba(40,220,240,0.2)');
  pool.addColorStop(0.45, 'rgba(40,220,240,0.09)');
  pool.addColorStop(1, 'rgba(40,220,240,0)');
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = pool;
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath();
  g.ellipse(fx, fy, 0.28 * 22.6 * 2 * k, 0.28 * 11.3 * 2 * k, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function draw(x: number, y: number, p: Pane, k: number, half: number): void {
  const w = half * 2 * k;
  const h = PH * k;
  const fx = x + half * k;
  const fy = y + UP * k;
  floor(x, y, w, h, fx, fy, k);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.imageSmoothingEnabled = false;
  p.tails.draw(g, fx, fy, false, k * 2);
  g.drawImage(p.f.px.toCanvas(), fx - CANVAS3.ax * k, fy - CANVAS3.ay * k, CANVAS3.w * k, CANVAS3.h * k);
  p.tails.draw(g, fx, fy, true, k * 2);
  // (what glows: the frame's own lights, and the feather's, as the game lays them over the dark)
  for (const l of p.f.lights) drawGlow(g, fx + (l.x - CANVAS3.ax) * k, fy + (l.y - CANVAS3.ay) * k, l.r * k, l.color, l.a ?? 0.5);
  for (const l of p.tails.lights()) drawGlow(g, fx + l.x * 2 * k, fy + l.y * 2 * k, l.r * 2 * k, l.color, l.a);
  g.restore();
  g.fillStyle = '#cfc8ff';
  g.font = k === S ? '600 18px system-ui, sans-serif' : '600 15px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(p.label, x + 4, y + h + LABEL / 2 + 1);
}

let top = HEADING;
for (const row of ROWS) {
  g.fillStyle = '#ffd866';
  g.font = '700 21px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(row.title, PAD + 2, top + ROWHEAD / 2);
  row.panes.forEach((p, c) => draw(PAD + c * (row.half * 2 * row.k + PAD), top + ROWHEAD, p, row.k, row.half));
  top += ROWHEAD + PH * row.k + LABEL;
}
(window as unknown as { __ready: boolean }).__ready = true;
