// Dev page: one figure seen from all four sides at once, on the dungeon's own floor, each facing
// outward along its diagonal of the grid. For checking that a figure is drawn TURNED TO THE GRID
// (art/kit.ts, "Turned to the grid"): the owner, 5 Oct 2026: "I'd like the character models to
// move and turn in those four cardinal directions as well."
//   node tools/preview.mjs src/dev/preview_turn.ts shots/turn.png 900 700 "warrior"
//   hash = <who>[:<doing>[:<scale>[:<seconds>]]]
//     who     = warrior | warrior2 (the great sword) | ranger | mage
//               (the knight in other colours: warrior@<tabard>-<scarf>, tabard = teal | red,
//               scarf = pink | gold | pale | red | wine)
//     doing   = idle (default) | walk | attack | heavy | pace | spin
//     scale   = screen pixels per game pixel (default 6; 4 for pace)
//     seconds = how far into what it is doing (default: 0 standing, 0.1 walking, the blow itself attacking)
// It uses the Figure the game does, so the scarf and the feather fly as they do in the game.
//
// `pace` is a moving picture (tools/turn_gif.mjs collects its frames): two of the figure, one
// going down-right and back up-left, the other down-left and back up-right. Each runs out, stops,
// strikes, turns and runs back, so all four ways are seen running, standing and striking, and the
// turns between them. It offers window.__frame(i) as preview_hero_gif.ts does.
// `spin` is another: one figure standing on the spot and turning to face each of the four ways
// in turn, round and round, with an arrow on the floor for the way it faces.

import type { ActorArt } from '../art/actor_types';
import { makeGroundArt } from '../art/ground';
import { makeMageArt } from '../art/hero_mage';
import { makeRangerArt } from '../art/hero_ranger';
import { KNIGHT_WAS, RED, SCARF_GOLD, SCARF_PALE, SCARF_RED, SCARF_WINE, makeWarriorArt, scarfTails } from '../art/hero_warrior';
import type { KnightLook } from '../art/hero_warrior';
import { Tails } from '../engine/tails';
import { Figure } from '../render/figure';
import type { FigureState } from '../render/figure';

const [whoArg = 'warrior', doing = 'idle', scaleArg = '', tArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const [who, lookArg = ''] = whoArg.split('@');
/** The knight's colours, where the picture is to show a choice of them. */
const look: KnightLook | null = lookArg
  ? { tabard: lookArg.startsWith('red') ? RED : KNIGHT_WAS.tabard, scarf: lookArg.endsWith('gold') ? SCARF_GOLD : lookArg.endsWith('pale') ? SCARF_PALE : lookArg.endsWith('-red') ? SCARF_RED : lookArg.endsWith('wine') ? SCARF_WINE : KNIGHT_WAS.scarf }
  : null;
function artOf(name: string): ActorArt {
  if (name === 'warrior2') return makeWarriorArt(look ? { twoHanded: true, look } : { twoHanded: true });
  if (name === 'ranger') return makeRangerArt();
  if (name === 'mage') return makeMageArt();
  return makeWarriorArt(look ? { twoHanded: false, look } : { twoHanded: false });
}
const art = artOf(who);
/** A figure as the game makes it; with a scarf of the look's colour where there is a look. */
function figure(): Figure {
  const f = new Figure();
  if (look) (f as unknown as { tails: Tails }).tails = new Tails(scarfTails(look.scarf));
  return f;
}
const ground = makeGroundArt();
const pace = doing === 'pace';
const spin = doing === 'spin';
const S = Number(scaleArg) || (pace ? 4 : 6);
/** The rules' wind-up of the quick and of the slow attack (game/defs.ts), for the picture's timing. */
const WIND = doing === 'heavy' ? 0.22 : 0.12;
const T = tArg !== '' ? Number(tArg) : doing === 'walk' ? 0.1 : doing === 'idle' ? 0 : WIND + 0.02;

/** The picture, in game pixels, and where the middle of the four figures is on it. */
const GW = pace ? 160 : spin ? 96 : 150;
const GH = pace ? 98 : spin ? 74 : 104;
const MX = pace ? 80 : spin ? 48 : 75;
const MY = pace ? 64 : spin ? 52 : 60;
/** How far each figure stands from the middle, in tiles. */
const OUT = 2.5;

const cv = document.createElement('canvas');
cv.width = GW * S;
cv.height = GH * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${cv.width}px`;
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
g.fillStyle = '#05040c';
g.fillRect(0, 0, GW, GH);

/** Where a point of the floor is on the picture: tile (0, 0) is the middle. */
const at = (x: number, y: number): [number, number] => [MX + (x - y) * 16, MY + (x + y) * 8];

// the floor (kept, so that a moving picture can lay it down again for every frame)
const floor = document.createElement('canvas');
floor.width = cv.width;
floor.height = cv.height;
{
  const fg = floor.getContext('2d') as CanvasRenderingContext2D;
  fg.imageSmoothingEnabled = false;
  fg.scale(S, S);
  fg.fillStyle = '#05040c';
  fg.fillRect(0, 0, GW, GH);
  for (let s = -16; s <= 16; s++) {
    for (let tx = -10; tx <= 10; tx++) {
      const ty = s - tx;
      if (ty < -10 || ty > 10) continue;
      const [x, y] = at(tx, ty);
      if (x < -40 || x > GW + 40 || y < -30 || y > GH + 30) continue;
      const f = ground.floor(tx + 40, ty + 40);
      fg.drawImage(f.img, x - f.ax, y - f.ay, f.w, f.h);
    }
  }
}
const layFloor = (): void => {
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(floor, 0, 0);
  g.restore();
};
layFloor();

/** The four ways a figure can face, as steps in the world: down-right, down-left, up-right, up-left. */
const WAYS: [number, number][] = [[1, 0], [0, 1], [0, -1], [-1, 0]];
const TICK = 1 / 25;
const SPEED = 4.2;

interface Shown {
  d: number;
  draw: () => void;
  lights: () => void;
}

function still(): void {
  // an arrow on the floor in front of each: the way it faces
  for (const [fx, fy] of WAYS) {
    const a = at(fx * (OUT + 0.55), fy * (OUT + 0.55));
    const b = at(fx * (OUT + 1.5), fy * (OUT + 1.5));
    const sx = fx - fy;
    const sy = (fx + fy) * 0.5;
    g.strokeStyle = 'rgba(122,248,240,0.55)';
    g.fillStyle = 'rgba(122,248,240,0.55)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
    g.stroke();
    // (the head of the arrow, flat on the floor)
    g.beginPath();
    g.moveTo(b[0] + sx * 4, b[1] + sy * 4);
    g.lineTo(b[0] - sy * 4 * 1.2, b[1] + sx * 4 * 0.3);
    g.lineTo(b[0] + sy * 4 * 1.2, b[1] - sx * 4 * 0.3);
    g.closePath();
    g.fill();
  }
  const shown: Shown[] = [];
  for (const [fx, fy] of WAYS) {
    const fig = figure();
    const state = (t: number): FigureState => {
      if (doing === 'walk') return { anim: 'walk', animT: t, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
      if ((doing === 'attack' || doing === 'heavy') && t >= 0) return { anim: 'attack', animT: t, fx, fy, attackSkill: doing === 'heavy' ? 1 : 0, attackAge: t, attackWind: WIND, leapK: -1 };
      return { anim: 'idle', animT: Math.max(0, t), fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
    };
    // (let the scarf settle into the wind, and into the figure's own movement, before the frame that is shown)
    const lead = 60;
    let sp = fig.frame(art, state(T - lead * TICK), 0, 0, 0, false);
    for (let k = lead - 1; k >= 0; k--) {
      const t = T - k * TICK;
      const gone = doing === 'walk' ? t * SPEED : 0;
      sp = fig.frame(art, state(t), TICK, (fx - fy) * 16 * gone, (fx + fy) * 8 * gone, false);
    }
    const [px, py] = at(fx * OUT, fy * OUT);
    const frame = sp;
    shown.push({
      d: fx + fy,
      draw: () => {
        g.fillStyle = 'rgba(0,0,0,0.42)';
        g.beginPath();
        g.ellipse(px, py, 7, 3, 0, 0, Math.PI * 2);
        g.fill();
        fig.draw(g, frame, px, py, 1);
      },
      lights: () => fig.lights(g, px, py, 1),
    });
  }
  shown.sort((a, b) => a.d - b.d);
  for (const s of shown) s.draw();
  for (const s of shown) s.lights();
}

// --- the moving picture ---
/** How far a walker goes, in tiles, and how long each part of its round takes. */
const REACH = 2.8;
const RUN = REACH / SPEED;
const WAIT = 0.28;
const BLOW = WIND + 0.3;
const LEG = RUN + WAIT + BLOW + WAIT;
const ROUND = LEG * 2;
const TICKS = Math.round(ROUND / TICK);

interface Walker {
  fig: Figure;
  /** Where it sets out from, and the way it first goes. */
  from: [number, number];
  way: [number, number];
}
const walkers: Walker[] = [
  { fig: figure(), from: [-0.6, -1.5], way: [1, 0] },
  { fig: figure(), from: [-1.5, -0.6], way: [0, 1] },
];
/** What a walker is doing at a moment of its round, and where it is. */
function doingAt(w: Walker, t: number): { st: FigureState; x: number; y: number } {
  const u = ((t % ROUND) + ROUND) % ROUND;
  const back = u >= LEG;
  const v = back ? u - LEG : u;
  const [wx, wy] = w.way;
  const fx = back ? -wx : wx;
  const fy = back ? -wy : wy;
  // how far out along its way it is
  const gone = v < RUN ? v * SPEED : REACH;
  const out = back ? REACH - gone : gone;
  const x = w.from[0] + wx * out;
  const y = w.from[1] + wy * out;
  let st: FigureState;
  if (v < RUN) st = { anim: 'walk', animT: t, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
  else if (v >= RUN + WAIT && v < RUN + WAIT + BLOW) st = { anim: 'attack', animT: t, fx, fy, attackSkill: 0, attackAge: v - RUN - WAIT, attackWind: WIND, leapK: -1 };
  else st = { anim: 'idle', animT: t, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
  return { st, x, y };
}

let drawn = -1;
function drawTick(tick: number): void {
  if (tick <= drawn) {
    for (const w of walkers) w.fig.reset();
    drawn = -1;
  }
  // (a round and a bit before the first frame, so that the scarves are flying as they will be when the picture loops)
  const lead = drawn < 0 ? TICKS : 0;
  const shown: Shown[] = [];
  for (let k = drawn + 1 - lead; k <= tick; k++) {
    shown.length = 0;
    for (const w of walkers) {
      // (two rounds on: the figure's own clock must never run backwards past nothing)
      const t = (k + TICKS * 2) * TICK;
      const { st, x, y } = doingAt(w, t);
      const [px, py] = at(x, y);
      const sp = w.fig.frame(art, st, TICK, px - MX, py - MY, false);
      shown.push({
        d: x + y,
        draw: () => {
          g.fillStyle = 'rgba(0,0,0,0.42)';
          g.beginPath();
          g.ellipse(px, py, 7, 3, 0, 0, Math.PI * 2);
          g.fill();
          w.fig.draw(g, sp, px, py, 1);
        },
        lights: () => w.fig.lights(g, px, py, 1),
      });
    }
  }
  drawn = tick;
  layFloor();
  shown.sort((a, b) => a.d - b.d);
  for (const s of shown) s.draw();
  for (const s of shown) s.lights();
}

// --- the figure turning on the spot ---
/** How long it faces each way, and the ways in the order it turns through them (round to its own right). */
const FACE_FOR = 0.9;
const ROUND_OF: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const SPIN_TICKS = Math.round((FACE_FOR * ROUND_OF.length) / TICK);
const spinner = figure();
let spun = -1;
function drawSpin(tick: number): void {
  if (tick <= spun) {
    spinner.reset();
    spun = -1;
  }
  const lead = spun < 0 ? SPIN_TICKS : 0;
  let sp = null as ReturnType<Figure['frame']> | null;
  let way: [number, number] = ROUND_OF[0];
  for (let k = spun + 1 - lead; k <= tick; k++) {
    const t = (k + SPIN_TICKS * 2) * TICK;
    way = ROUND_OF[Math.floor(t / FACE_FOR) % ROUND_OF.length];
    sp = spinner.frame(art, { anim: 'idle', animT: t, fx: way[0], fy: way[1], attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }, TICK, 0, 0, false);
  }
  spun = tick;
  layFloor();
  // the way it faces, on the floor
  const [fx, fy] = way;
  const a = at(fx * 0.6, fy * 0.6);
  const b = at(fx * 1.7, fy * 1.7);
  const sx = fx - fy;
  const sy = (fx + fy) * 0.5;
  g.strokeStyle = 'rgba(122,248,240,0.6)';
  g.fillStyle = 'rgba(122,248,240,0.6)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
  g.beginPath();
  g.moveTo(b[0] + sx * 4, b[1] + sy * 4);
  g.lineTo(b[0] - sy * 4 * 1.2, b[1] + sx * 4 * 0.3);
  g.lineTo(b[0] + sy * 4 * 1.2, b[1] - sx * 4 * 0.3);
  g.closePath();
  g.fill();
  if (!sp) return;
  g.fillStyle = 'rgba(0,0,0,0.42)';
  g.beginPath();
  g.ellipse(MX, MY, 7, 3, 0, 0, Math.PI * 2);
  g.fill();
  spinner.draw(g, sp, MX, MY, 1);
  spinner.lights(g, MX, MY, 1);
}

if (spin) {
  drawSpin(0);
  const w = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  w.__frames = SPIN_TICKS;
  w.__tickMs = TICK * 1000;
  w.__frame = (i: number): string => {
    drawSpin(i);
    return cv.toDataURL('image/png');
  };
} else if (pace) {
  drawTick(0);
  const w = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  w.__frames = TICKS;
  w.__tickMs = TICK * 1000;
  w.__frame = (i: number): string => {
    drawTick(i);
    return cv.toDataURL('image/png');
  };
} else still();

(window as unknown as { __ready: boolean }).__ready = true;
