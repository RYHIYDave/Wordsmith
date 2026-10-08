// Dev page: the frames of a moving picture of the monsters (Version 14), for tools/monster_gif.mjs
// to collect and join into a GIF. Each figure is shown as the game shows it: its standing loop and
// its walk at their own paces, its attack played by the rules' wind-up (render/figure.ts:
// attackFrame, as Renderer.monsterSprite does), its pool of light under it and its lights over it.
//   node tools/monster_gif.mjs all previews/v14_monsters.gif
//   node tools/monster_gif.mjs warden previews/v14_warden.gif
//   hash = <which>[:<scale>[:<carry>]]
//     which = all (default): the seven of them in a row, facing you; each stands, walks, strikes
//             <figure> (skeleton | archer | cultist | bat | brute | guardian | warden): that one
//             alone, facing you and facing away: standing, walking, its attack (the Warden: both)
//     scale = screen pixels per game pixel (default 4 for one figure, 2 for all of them; an even
//             number keeps the pixels of the finer art square)
//     carry = how brutes and guardians carry their clubs when they are not striking (art/monster_brute.ts:
//             Carry): drag | side | high. Left out: as the game has it.
// The page draws frame 0 and offers window.__frame(i), which draws frame i and returns it as a PNG.

import type { AnimSet, Clip } from '../art/actor_types';
import { FIGURE_SIZE, MONSTER_FIGURES, makeBestiary } from '../art/bestiary';
import type { MonsterFigure } from '../art/bestiary';
import { setClubCarry } from '../art/monster_brute';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { MONSTERS, TUNE } from '../game/defs';
import type { MonsterKind } from '../game/types';
import { attackFrame } from '../render/figure';

const [whichArg = 'all', scaleArg = '', carryArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
if (carryArg === 'drag' || carryArg === 'side' || carryArg === 'high') setClubCarry(carryArg);
const all = whichArg === 'all' || whichArg === '';
const one: MonsterFigure = (MONSTER_FIGURES as readonly string[]).includes(whichArg) ? (whichArg as MonsterFigure) : 'skeleton';
const S = Number(scaleArg) || (all ? 2 : 4);
const beasts = makeBestiary();

const KIND: Record<MonsterFigure, MonsterKind> = { skeleton: 'skeleton', archer: 'archer', cultist: 'cultist', bat: 'bat', brute: 'brute', guardian: 'brute', warden: 'warden' };
const NAME: Record<MonsterFigure, string> = { skeleton: 'Skeleton', archer: 'Bone Archer', cultist: 'Cultist', bat: 'Cave Bat', brute: 'Brute', guardian: 'Guardian', warden: 'The Warden' };
/** What each one's attack is, in a word or two. */
const DOES: Record<MonsterFigure, string> = { skeleton: 'chops', archer: 'shoots', cultist: 'throws fire', bat: 'bites', brute: 'smashes the ground', guardian: 'smashes the ground', warden: 'slams' };

/** Moving-picture frames a second (a GIF counts in hundredths of a second: 25 a second is 4 each). */
const FPS = 25;
const TICK = 1 / FPS;

type Mode = 'stand' | 'walk' | 'attack' | 'heavy' | 'round';
interface Cell {
  figure: MonsterFigure;
  back: boolean;
  mode: Mode;
  label: string;
}

const windup = (f: MonsterFigure, heavy: boolean): number => (heavy ? TUNE.wardenVolleyWindup : MONSTERS[KIND[f]].windup);
/** How long one attack keeps a monster busy: its wind-up, and the rest after the blow. */
const busy = (f: MonsterFigure, heavy: boolean): number => windup(f, heavy) + TUNE.monsterRecover;

/** `round`: stands, walks, strikes, stands, strikes again (the Warden: his other attack), stands. */
const ROUND = { walkAt: 0.9, walkFor: 1.3, strikeAt: 2.3, againAt: 4.0, all: 5.6 };
/** One attack over and over, with this much standing between. */
const PAUSE = 0.9;

const cells: Cell[] = [];
if (all) for (const f of MONSTER_FIGURES) cells.push({ figure: f, back: false, mode: 'round', label: NAME[f] });
else {
  for (const back of [false, true]) {
    const way = back ? 'facing away' : 'facing you';
    cells.push({ figure: one, back, mode: 'stand', label: `standing, ${way}` });
    cells.push({ figure: one, back, mode: 'walk', label: `${one === 'bat' ? 'flying' : 'walking'}, ${way}` });
    cells.push({ figure: one, back, mode: 'attack', label: `${DOES[one]}, ${way}` });
    if (one === 'warden') cells.push({ figure: one, back, mode: 'heavy', label: `looses a volley, ${way}` });
  }
}
const COLS = all ? cells.length : cells.length / 2;
const ROWS = all ? 1 : 2;

/** How long the picture runs before it loops: the row of seven its round; one figure, two of its attacks. */
const SECONDS = all ? ROUND.all : Math.round(2 * (Math.max(busy(one, false), one === 'warden' ? busy(one, true) : 0) + PAUSE) * FPS) / FPS;
const TICKS = Math.round(SECONDS * FPS);
/**
 * A loop of `period` seconds, played a hair faster or slower so that a whole number of them fits
 * the moving picture: it then joins up with itself where the picture starts again.
 */
const fitted = (period: number): number => (Math.max(1, Math.round(SECONDS / period)) * period) / SECONDS;

function clipOf(set: AnimSet, heavy: boolean): Clip {
  const c = (heavy ? set.clips?.heavy : undefined) ?? set.clips?.attack;
  if (!c) throw new Error('no attack clip');
  return c;
}

/** The frame a cell shows at a moment, and how far the floor has slid under it (game pixels). */
function shown(c: Cell, t: number): { sp: Sprite; slide: number } {
  const art = beasts.of(c.figure);
  const set = c.back ? art.back : art.front;
  const idleFps = set.idleFps ?? 10;
  const walkFps = set.walkFps ?? 16;
  const idle = (at: number): Sprite => set.idle[Math.floor(at * fitted(set.idle.length / idleFps) * idleFps + 1e-6) % set.idle.length];
  const walk = (at: number): Sprite => set.walk[Math.floor(at * (c.mode === 'walk' ? fitted(set.walk.length / walkFps) : 1) * walkFps + 1e-6) % set.walk.length];
  const speed = MONSTERS[KIND[c.figure]].speed * 16;
  const strike = (age: number, heavy: boolean): Sprite | null => (age >= 0 && age < busy(c.figure, heavy) ? attackFrame(clipOf(set, heavy), age, windup(c.figure, heavy)) : null);
  if (c.mode === 'stand') return { sp: idle(t), slide: 0 };
  if (c.mode === 'walk') return { sp: walk(t), slide: t * speed };
  if (c.mode === 'attack' || c.mode === 'heavy') {
    const heavy = c.mode === 'heavy';
    // (twice in the picture, after a third of a second of standing)
    const every = SECONDS / 2;
    const age = (t % every) - 0.3;
    return { sp: strike(age, heavy) ?? idle(t), slide: 0 };
  }
  // round
  const walked = Math.max(0, Math.min(ROUND.walkFor, t - ROUND.walkAt));
  if (t >= ROUND.walkAt && t < ROUND.walkAt + ROUND.walkFor) return { sp: walk(t - ROUND.walkAt), slide: walked * speed };
  const first = strike(t - ROUND.strikeAt, false);
  const second = strike(t - ROUND.againAt, c.figure === 'warden');
  return { sp: first ?? second ?? idle(t), slide: walked * speed };
}

// ---- how big each cell must be: the box that holds every frame it will show --------------------
interface Box {
  left: number;
  right: number;
  up: number;
  down: number;
}
function boxOf(c: Cell): Box {
  const b: Box = { left: 6, right: 6, up: 6, down: 3 };
  for (let i = 0; i < TICKS; i++) {
    const { sp } = shown(c, i * TICK);
    b.left = Math.max(b.left, sp.ax);
    b.right = Math.max(b.right, sp.w - sp.ax);
    b.up = Math.max(b.up, sp.ay);
    b.down = Math.max(b.down, sp.h - sp.ay);
  }
  return b;
}
const boxes = cells.map(boxOf);
const MARGIN = 5;
/** Every cell of a row stands on one floor line: as much room above it and below it as the tallest needs. */
const up = Math.ceil(Math.max(...boxes.map((b) => b.up))) + MARGIN + 2;
const down = Math.ceil(Math.max(...boxes.map((b) => b.down))) + MARGIN + 3;
/** One width for all the cells of a single figure; each its own in the row of seven. */
const widths = boxes.map((b) => Math.ceil(b.left) + Math.ceil(b.right) + MARGIN * 2);
const lefts = boxes.map((b) => Math.ceil(b.left) + MARGIN);
const cw = (n: number): number => (all ? widths[n] : Math.max(...widths));
const fx = (n: number): number => (all ? lefts[n] : Math.max(...lefts));
const CH = up + down;

const PAD = all ? 0 : 8;
const HEAD = 34;
const LABEL = 22;
let PW = PAD;
for (let n = 0; n < COLS; n++) PW += cw(n) * S + PAD;
PW = Math.max(PW, 320);
const PH = HEAD + ROWS * (CH * S + LABEL) + (ROWS + 1) * PAD + (all ? 6 : 0);

const cv = document.createElement('canvas');
cv.width = PW;
cv.height = PH;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** The deep blue of the style's world and a floor of big flagstones, sliding under whatever walks. */
function floor(x0: number, y0: number, w: number, footX: number, slide: number): void {
  g.fillStyle = '#0b0a1e';
  g.fillRect(x0, y0, w * S, CH * S);
  // (a figure faces screen-right and toward you: the floor goes by to the left and up the screen)
  const ox = ((slide % 26) + 26) % 26;
  const oy = (((slide / 2) % 13) + 13) % 13;
  const across = Math.ceil(w / 26) + 3;
  for (let k = -across; k <= across; k++) {
    for (let j = -8; j <= 4; j++) {
      const cx = x0 + (footX + k * 26 + (j % 2 === 0 ? 0 : 13) - ox) * S;
      const cy = y0 + (up - 2 + j * 6.5 - oy) * S;
      g.fillStyle = (k + j) % 2 === 0 ? '#201e50' : '#191740';
      g.beginPath();
      g.moveTo(cx, cy - 6 * S);
      g.lineTo(cx + 12.4 * S, cy);
      g.lineTo(cx, cy + 6 * S);
      g.lineTo(cx - 12.4 * S, cy);
      g.closePath();
      g.fill();
    }
  }
  const fade = g.createLinearGradient(0, y0, 0, y0 + CH * S);
  const horizon = Math.max(0.05, (up - 30) / CH);
  fade.addColorStop(0, 'rgba(11,10,30,1)');
  fade.addColorStop(horizon, 'rgba(11,10,30,0.9)');
  fade.addColorStop(Math.min(0.97, (up - 6) / CH), 'rgba(11,10,30,0.2)');
  fade.addColorStop(1, 'rgba(11,10,30,0.45)');
  g.fillStyle = fade;
  g.fillRect(x0, y0, w * S, CH * S);
}

function drawCell(c: Cell, n: number, x0: number, y0: number, t: number): void {
  const w = cw(n);
  const { sp, slide } = shown(c, t);
  g.save();
  g.beginPath();
  g.rect(x0, y0, w * S, CH * S);
  g.clip();
  floor(x0, y0, w, fx(n), c.back ? -slide : slide);
  const px = x0 + fx(n) * S;
  const py = y0 + up * S;
  // its shadow on the floor (the game draws one under every monster, by how big it is in the rules)
  const r = MONSTERS[KIND[c.figure]].radius * (c.figure === 'guardian' ? TUNE.guardianSize : 1) * 16 * 0.75 * 1.3;
  g.fillStyle = 'rgba(0,0,0,0.42)';
  g.beginPath();
  g.ellipse(px, py, r * S, r * 0.45 * S, 0, 0, Math.PI * 2);
  g.fill();
  drawAura(g, sp, px, py, S);
  g.drawImage(sp.img, px - sp.ax * S, py - sp.ay * S, sp.w * S, sp.h * S);
  drawLights(g, sp, px, py, S);
  g.restore();
  g.fillStyle = all ? '#d8d0f8' : '#a8a2b8';
  g.font = `${all ? 'bold 14px' : '13px'} system-ui, -apple-system, Segoe UI, sans-serif`;
  g.textBaseline = 'top';
  g.textAlign = 'center';
  g.fillText(c.label, x0 + (w * S) / 2, y0 + CH * S + 5);
  g.textAlign = 'left';
}

function draw(tick: number): void {
  const t = tick * TICK;
  let x = PAD;
  cells.forEach((c, n) => {
    const col = n % COLS;
    if (col === 0) x = PAD;
    const row = Math.floor(n / COLS);
    drawCell(c, n, x, HEAD + row * (CH * S + LABEL + PAD), t);
    x += cw(n) * S + PAD;
  });
}

g.fillStyle = '#16131c';
g.fillRect(0, 0, PW, PH);
g.fillStyle = '#ffd866';
g.font = 'bold 18px system-ui, -apple-system, Segoe UI, sans-serif';
g.textBaseline = 'top';
g.fillText(all ? 'THE MONSTERS: each stands, walks and strikes' : NAME[one].toUpperCase(), 8, 8);
// (how tall each stands, for whoever reads the tool's output)
console.log(MONSTER_FIGURES.map((f) => `${f} ${FIGURE_SIZE[f].top}`).join(', '));
draw(0);
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
win.__frames = TICKS;
win.__tickMs = TICK * 1000;
win.__frame = (i: number): string => {
  draw(i);
  return cv.toDataURL('image/png');
};
win.__ready = true;
