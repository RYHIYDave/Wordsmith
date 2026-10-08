// Dev page: the frames of a moving picture of one hero, for tools/hero_gif.mjs to collect and
// join into a GIF. It uses the same Figure the game does, so what it shows is what the game
// shows: the frame for what the hero is doing, with the scarf and the feather that fly from it.
//   node tools/hero_gif.mjs warrior previews/hero_warrior.gif
//   hash = <hero>[:<what>[:<scale>]]
//     hero  = warrior | warrior2 (the great sword) | ranger | mage
//     what  = moves (default): standing, running, the quick attack, the slow attack; facing the
//             camera (top row) and facing away (bottom row)
//             idle: the two things the hero does when left standing, side by side
//             turn: the hero turning (left and right, to face away and back, running one way and
//             then the other), at its own speed (top row) and four times slower (bottom row)
//     scale = screen pixels per game pixel (default 3)
// The page draws frame 0 and offers window.__frame(i), which draws frame i and returns it as a PNG.
// Frames must be asked for in order: each moves the figures on by one tick.

import type { ActorArt } from '../art/actor_types';
import { makeMageArt } from '../art/hero_mage';
import { makeRangerArt } from '../art/hero_ranger';
import { makeWarriorArt } from '../art/hero_warrior';
import type { Sprite } from '../engine/px';
import { Figure } from '../render/figure';
import type { FigureState } from '../render/figure';

const [who = 'warrior', what = 'moves', scaleArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
function artOf(name: string): ActorArt {
  if (name === 'warrior2') return makeWarriorArt({ twoHanded: true });
  if (name === 'ranger') return makeRangerArt();
  if (name === 'mage') return makeMageArt();
  return makeWarriorArt({ twoHanded: false });
}
const art = artOf(who);
const NAME: Record<string, string> = { warrior: 'THE WARRIOR', warrior2: 'THE WARRIOR, GREAT SWORD', ranger: 'THE RANGER', mage: 'THE MAGE' };
/** What the quick and the slow attack are called, and the rules' [wind-up, follow-through] for each (game/defs.ts). */
const ATTACKS: Record<string, [string, string]> = { warrior: ['Strike', 'Slam'], warrior2: ['Strike', 'Slam'], ranger: ['Shot', 'Trap'], mage: ['Orb', 'Nova'] };
const TIMES: Record<string, [[number, number], [number, number]]> = {
  warrior: [[0.12, 0.3], [0.22, 0.38]], warrior2: [[0.12, 0.3], [0.22, 0.38]], ranger: [[0.16, 0.32], [0.17, 0.33]], mage: [[0.16, 0.32], [0.26, 0.38]],
};
const IDLES: Record<string, [string, string]> = {
  warrior: ['tests the edge of the sword', 'leans on the planted sword'], warrior2: ['tests the edge of the sword', 'rests on the planted sword'],
  ranger: ['a squirrel runs round the shoulders', 'sights down an arrow'], mage: ['snaps up a mage light', 'reads a page'],
};

/** Moving-picture frames a second (a GIF counts in hundredths of a second: 25 a second is 4 each). */
const FPS = 25;
const TICK = 1 / FPS;
const idleMode = what === 'idle';
const turnMode = what === 'turn';
/** How long the picture runs before it loops. */
const SECONDS = idleMode || turnMode ? 4.8 : 3.6;
const TICKS = Math.round(SECONDS * FPS);
/** Screen pixels per game pixel. */
const S = Number(scaleArg) || 3;
const COLS = idleMode ? 2 : turnMode ? 3 : 4;
const ROWS = idleMode ? 1 : 2;
/** A cell, in game pixels, and where the hero's feet are in it. */
const CW = idleMode ? 84 : 70;
const CH = 66;
const FX = idleMode ? 42 : 38;
const FY = 56;
const PAD = 8;
const HEAD = 34;
const LABEL = 22;
const PW = COLS * CW * S + (COLS + 1) * PAD;
const PH = HEAD + ROWS * (CH * S + LABEL) + (ROWS + 1) * PAD;

const cv = document.createElement('canvas');
cv.width = PW;
cv.height = PH;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.overflow = 'auto';
document.documentElement.style.overflow = 'auto';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** One cell of the picture: a figure doing one thing. */
interface Cell {
  fig: Figure;
  label: string;
  /** What the hero is doing at a time, and where their feet are in the world (for the tails). */
  state: (t: number) => FigureState;
  where: (t: number) => [number, number];
  /** The floor slides under a running hero: how far it has gone, in game pixels. */
  scroll: (t: number) => [number, number];
  /** How fast time passes for this figure (absent = 1; a quarter = shown four times slower). */
  rate?: number;
}

const still = (): [number, number] => [0, 0];
/** Facing the camera and screen-right, or away and screen-right: the two views the art has. */
const FACE: [number, number][] = [[1, 0], [0, -1]];
/** A running hero covers this many tiles a second. */
const SPEED = 4.2;

function standing(back: number): Cell {
  const [fx, fy] = FACE[back];
  return { fig: new Figure(), label: `standing, ${back ? 'facing away' : 'facing you'}`, state: (t) => ({ anim: 'idle', animT: t, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }), where: still, scroll: still };
}
function running(back: number): Cell {
  const [fx, fy] = FACE[back];
  // (run for most of the loop, then stop dead: the scarf swings on)
  const run = SECONDS - 1.3;
  const gone = (t: number): number => Math.min(t, run) * SPEED;
  const at = (t: number): [number, number] => [(fx - fy) * 16 * gone(t), (fx + fy) * 8 * gone(t)];
  return { fig: new Figure(), label: `running, then stopping, ${back ? 'facing away' : 'facing you'}`, state: (t) => ({ anim: t < run ? 'walk' : 'idle', animT: t, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }), where: at, scroll: at };
}
function attacking(back: number, skill: 0 | 1, every: number, from: number): Cell {
  const [fx, fy] = FACE[back];
  const [wind, follow] = (TIMES[who] ?? TIMES.warrior)[skill];
  const name = (ATTACKS[who] ?? ['attack', 'slow attack'])[skill];
  return {
    fig: new Figure(),
    label: `${name}, ${back ? 'facing away' : 'facing you'}`,
    state: (t) => {
      const age = (((t - from) % every) + every) % every;
      const busy = t >= from && age < wind + follow;
      return { anim: busy ? 'attack' : 'idle', animT: busy ? age : t, fx, fy, attackSkill: skill, attackAge: age, attackWind: wind, leapK: -1 };
    },
    where: still,
    scroll: still,
  };
}
/** A hero who turns from one facing to the other and back, every `every` seconds: standing, or running (then the floor goes back and forth under them). */
function turner(label: string, a: [number, number], b: [number, number], every: number, run: boolean, rate: number): Cell {
  const face = (t: number): [number, number] => (Math.floor(t / every) % 2 === 0 ? a : b);
  // (how far along the first facing the hero has got: out for one spell, back for the next)
  const out = (t: number): number => {
    const k = Math.floor(t / every);
    const u = t - k * every;
    return (k % 2 === 0 ? u : every - u) * SPEED;
  };
  const at = (t: number): [number, number] => (run ? [(a[0] - a[1]) * 16 * out(t), (a[0] + a[1]) * 8 * out(t)] : [0, 0]);
  return {
    fig: new Figure(),
    label: rate === 1 ? label : `${label}, ${Math.round(1 / rate)} times slower`,
    state: (t) => ({ anim: run ? 'walk' : 'idle', animT: t, fx: face(t)[0], fy: face(t)[1], attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }),
    where: at,
    scroll: at,
    rate,
  };
}
function turns(rate: number): Cell[] {
  return [
    turner('turns left and right', [1, 0], [0, 1], 0.6, false, rate),
    turner('turns away and back', [1, 0], [0, -1], 0.6, false, rate),
    turner('runs one way, then the other', [1, 0], [-1, 0], 0.6, true, rate),
  ];
}

function doing(which: 1 | 2): Cell {
  const c = standing(0);
  c.label = (IDLES[who] ?? ['', ''])[which - 1];
  return c;
}

const cells: Cell[] = idleMode
  ? [doing(1), doing(2)]
  : turnMode
  ? [...turns(1), ...turns(0.25)]
  : [standing(0), running(0), attacking(0, 0, 1.2, 0.3), attacking(0, 1, 1.8, 0.5), standing(1), running(1), attacking(1, 0, 1.2, 0.3), attacking(1, 1, 1.8, 0.5)];

function floor(x0: number, y0: number, sx: number, sy: number): void {
  // the deep blue of the style's world and a floor of big flagstones, sliding under a running hero
  g.fillStyle = '#0b0a1e';
  g.fillRect(x0, y0, CW * S, CH * S);
  const ox = ((sx % 26) + 26) % 26;
  const oy = ((sy % 13) + 13) % 13;
  for (let k = -4; k <= 5; k++) {
    for (let j = -3; j <= 4; j++) {
      const cx = x0 + (FX + k * 26 + (j % 2 === 0 ? 0 : 13) - ox) * S;
      const cy = y0 + (FY - 2 + j * 6.5 - oy) * S;
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
  fade.addColorStop(0, 'rgba(11,10,30,1)');
  fade.addColorStop(0.6, 'rgba(11,10,30,0.86)');
  fade.addColorStop(0.8, 'rgba(11,10,30,0.2)');
  fade.addColorStop(1, 'rgba(11,10,30,0.45)');
  g.fillStyle = fade;
  g.fillRect(x0, y0, CW * S, CH * S);
}

function drawCell(c: Cell, x0: number, y0: number, sp: Sprite, t: number): void {
  g.save();
  g.beginPath();
  g.rect(x0, y0, CW * S, CH * S);
  g.clip();
  const [sx, sy] = c.scroll(t);
  floor(x0, y0, sx, sy);
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath();
  g.ellipse(x0 + FX * S, y0 + FY * S, 7 * S, 2.8 * S, 0, 0, Math.PI * 2);
  g.fill();
  const px = x0 + FX * S;
  const py = y0 + FY * S;
  c.fig.draw(g, sp, px, py, S);
  c.fig.lights(g, px, py, S);
  g.restore();
  g.fillStyle = '#a8a2b8';
  g.font = '13px system-ui, -apple-system, Segoe UI, sans-serif';
  g.textBaseline = 'top';
  g.textAlign = 'center';
  g.fillText(c.label, x0 + (CW * S) / 2, y0 + CH * S + 4);
  g.textAlign = 'left';
}

/** Move every figure on to tick `i` (they must be visited in order) and draw the picture. */
let drawn = -1;
function draw(tick: number): void {
  if (tick <= drawn) {
    // starting again: every figure back to its beginning
    for (const c of cells) c.fig.reset();
    drawn = -1;
  }
  // (let the tails settle into the wind before the first frame, and loop cleanly after the last)
  const lead = drawn < 0 ? Math.round(2.4 * FPS) : 0;
  const first = drawn + 1 - lead;
  for (let k = first; k <= tick; k++) {
    cells.forEach((c, n) => {
      const rate = c.rate ?? 1;
      const t = Math.max(0, k) * TICK * rate;
      if (idleMode && k === Math.round(0.4 * FPS)) c.fig.play(n === 0 ? 1 : 2);
      const [ox, oy] = c.where(t);
      // (in the picture of what a hero does when left standing, the figure is told when: see `play` above;
      // elsewhere it is kept from doing anything of its own)
      const sp = c.fig.frame(art, c.state(t), lead > 0 && k === first ? 0 : TICK * rate, ox, oy, idleMode);
      if (k === tick) {
        const col = n % COLS;
        const row = Math.floor(n / COLS);
        drawCell(c, PAD + col * (CW * S + PAD), HEAD + row * (CH * S + LABEL + PAD), sp, t);
      }
    });
    if (k === tick) drawn = tick;
  }
}

function header(): void {
  g.fillStyle = '#16131c';
  g.fillRect(0, 0, PW, HEAD);
  g.fillStyle = '#ffd866';
  g.font = 'bold 18px system-ui, -apple-system, Segoe UI, sans-serif';
  g.textBaseline = 'top';
  g.fillText((NAME[who] ?? who) + (idleMode ? ', LEFT STANDING' : turnMode ? ', TURNING' : ''), PAD, 8);
}

g.fillStyle = '#16131c';
g.fillRect(0, 0, PW, PH);
header();
draw(0);
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
win.__frames = TICKS;
win.__tickMs = TICK * 1000;
win.__frame = (i: number): string => {
  draw(i);
  return cv.toDataURL('image/png');
};
win.__ready = true;
