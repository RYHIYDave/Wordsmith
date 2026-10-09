// Dev page: STRIKE, A TWO-HIT COMBO, AND A STEP FORWARD WITH EVERY SWING, as a moving picture for
// the owner to look at before it goes in (the owner, 7 Oct 2026, 23:18: "I’d like STRIKE to have
// two animations.  The first is the strike we have now.  That one always plays first.  If the
// player taps again quickly, then the second animation, I downward slash, plays.  Back to the
// first if they tap again.  If it’s not tapped for a set duration, it goes back to the first
// animation.  Like a two hit combo if you tap twice"; 23:18: "And I want him to move forward a
// little every swing"; 23:19: "Not much, but some").
//   node tools/page_gif.mjs src/dev/preview_combo.ts "4" previews/combo.gif 5
//   hash = <screen pixels to a game pixel, 4 if not given>[:<seconds: one still at that moment>]
// WHAT IS SHOWN IS THE GAME'S OWN: each picture is a practice room of the game's own rules with
// the combo's switch on (COMBO.on: on in this page only, OFF in the game), the knight tapped as a
// phone taps him (a tap made in the middle of a swing waits its turn, as it does in the game), and
// drawn with the figure and the paintings the game draws him with. The floor does not move: what
// moves him is his step forward. A chalk mark on the floor is where he began.
//   rows:    TAP, TAP (two quick taps); TAP ... TAP (the second after the set time has run out);
//            HELD (the button kept down: one swing after another)
//   columns: facing you; facing away
// The page draws frame 0 and offers window.__frame(i), which draws frame i and returns it as a PNG.
// Frames must be asked for in order: each moves the games on by one tick.

import { makeHeroArt3 } from '../art/heroes3';
import type { Sprite } from '../engine/px';
import { COMBO, SKILLS, TUNE } from '../game/defs';
import { Game } from '../game/game';
import { emptyControls } from '../game/state';
import type { Controls } from '../game/state';
import { Figure, attackClip } from '../render/figure';

COMBO.on = true;

const [scaleArg = '', stillArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
/** Screen pixels per game pixel. */
const S = Number(scaleArg) || 4;
/** Moving-picture frames a second (a GIF counts in hundredths of a second: 25 a second is 4 each). */
const FPS = 25;
const TICK = 1 / FPS;
/** The rules are stepped this many times a frame. */
const SUB = 5;
/** How long the picture runs before it begins again. */
const SECONDS = 4.4;
const TICKS = Math.round(SECONDS * FPS);
const STILL = stillArg === '' ? -1 : Number(stillArg);

const COLS = 2;
const ROWS = 3;
/** A cell, in game pixels, and where the hero's feet are in it when he begins, facing you and facing away. */
const CW = 88;
const CH = 80;
const FX = 30;
const FY = [50, 64];
const PAD = 8;
const HEAD = 84;
const LABEL = 40;
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

const heroes = makeHeroArt3();
const art = heroes.of('warrior', { twoHanded: true });

type Inner = { waveT: number; updatePractice?: () => void };

/** One picture: a game of its own, a figure of its own, and when the button is touched in it. */
interface Cell {
  label: string;
  /** Facing: as a step in the world. */
  face: [number, number];
  /** The taps, in seconds from the beginning; or, for a button held down, from when it is put down. */
  taps: number[];
  held: number;
  game: Game;
  fig: Figure;
  x0: number;
  y0: number;
  /** A tap that is waiting its turn (as the game's own touch controls keep one: main.ts, `order`). */
  order: { uses: number; t: number } | null;
  /** The swings that have begun, and when: which (0 Strike, 1 the slash) and the time. */
  swings: { which: number; t: number }[];
  lastAge: number;
  tapAt: number;
}

const FACES: [number, number][] = [[1, 0], [0, -1]];

function newGame(face: [number, number]): Game {
  const game = Game.forPractice('warrior', 3);
  const a = game as unknown as Inner;
  a.waveT = 1e9;
  game.monsters.length = 0;
  game.hero.x = 14.5;
  game.hero.y = 15.5;
  game.hero.fx = face[0];
  game.hero.fy = face[1];
  game.events.length = 0;
  return game;
}

function cell(label: string, face: [number, number], taps: number[], held = -1): Cell {
  const game = newGame(face);
  return { label, face, taps, held, game, fig: new Figure(), x0: game.hero.x, y0: game.hero.y, order: null, swings: [], lastAge: 1e9, tapAt: -1 };
}

/** The weapon's time between blows, and the set time after it in which a tap is still the second swing. */
const probe = newGame([1, 0]);
const BETWEEN = 1 / Math.max(0.3, probe.hero.skills[0].r.rate);
const SECOND_UNTIL = BETWEEN + TUNE.comboWindow;
const LATE = 0.3 + SECOND_UNTIL + 0.35;

const cells: Cell[] = [];
for (const face of FACES) cells.push(cell('TAP, TAP: two quick taps', face, [0.3, 0.62]));
for (const face of FACES) cells.push(cell('TAP ... TAP: the second a little late', face, [0.3, LATE]));
for (const face of FACES) cells.push(cell('HELD: the button kept down', face, [], 0.3));

/** Move one picture on by one frame. */
function stepCell(c: Cell, t0: number): void {
  const game = c.game;
  const h = game.hero;
  const dt = TICK / SUB;
  for (let k = 0; k < SUB; k++) {
    const t = t0 + k * dt;
    const ctl: Controls = emptyControls();
    ctl.aimX = h.x + c.face[0] * 2;
    ctl.aimY = h.y + c.face[1] * 2;
    for (const at of c.taps) {
      if (t <= at && t + dt > at) {
        c.order = { uses: h.skills[0].uses, t: 0 };
        c.tapAt = t;
      }
    }
    if (c.order) {
      c.order.t += dt;
      if (h.skills[0].uses > c.order.uses || c.order.t > 3) c.order = null;
      else ctl.fire = true;
    }
    if (c.held >= 0 && t >= c.held && t < SECONDS - 0.9) ctl.fire = true;
    game.update(dt, ctl);
    if (h.anim === 'attack' && h.attackSkill === 0 && h.attackAge < c.lastAge) c.swings.push({ which: h.combo, t });
    c.lastAge = h.anim === 'attack' ? h.attackAge : 1e9;
  }
}

function floor(x0: number, y0: number): void {
  // the deep blue of the style's world and a floor of big flagstones (as in preview_hero_gif.ts); it stays where it is
  g.fillStyle = '#0b0a1e';
  g.fillRect(x0, y0, CW * S, CH * S);
  for (let k = -5; k <= 6; k++) {
    for (let j = -4; j <= 13; j++) {
      const cx = x0 + (FX + k * 26 + (j % 2 === 0 ? 0 : 13)) * S;
      const cy = y0 + (40 + j * 6.5) * S;
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
}

const NAME = ['STRIKE', 'SLASH'];

/** `view`: 0 facing you, 1 facing away (the column the picture is in). */
function drawCell(c: Cell, x0: number, y0: number, sp: Sprite, t: number, view: number): void {
  const h = c.game.hero;
  g.save();
  g.beginPath();
  g.rect(x0, y0, CW * S, CH * S);
  g.clip();
  floor(x0, y0);
  // (where he began: a chalk mark on the floor)
  const bx = x0 + FX * S;
  const by = y0 + FY[view] * S;
  g.strokeStyle = 'rgba(214,208,226,0.55)';
  g.lineWidth = Math.max(1, S * 0.6);
  g.beginPath();
  g.moveTo(bx - 4 * S, by);
  g.lineTo(bx + 4 * S, by);
  g.moveTo(bx, by - 2 * S);
  g.lineTo(bx, by + 2 * S);
  g.stroke();
  const dx = h.x - c.x0;
  const dy = h.y - c.y0;
  const px = x0 + (FX + (dx - dy) * 16) * S;
  const py = y0 + (FY[view] + (dx + dy) * 8) * S;
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath();
  g.ellipse(px, py, 7 * S, 2.8 * S, 0, 0, Math.PI * 2);
  g.fill();
  c.fig.draw(g, sp, px, py, S);
  c.fig.lights(g, px, py, S);
  // (which swing this is, while it is being made; and each tap, as it is made)
  const last = c.swings[c.swings.length - 1];
  if (last && t - last.t < 0.55) {
    g.font = `bold ${Math.round(5.5 * S)}px system-ui, -apple-system, Segoe UI, sans-serif`;
    g.textAlign = 'right';
    g.textBaseline = 'top';
    g.fillStyle = last.which === 1 ? '#ffd866' : '#f2eefa';
    g.fillText(NAME[last.which], x0 + (CW - 4) * S, y0 + 4 * S);
  }
  if (c.tapAt >= 0 && t - c.tapAt < 0.3) {
    g.font = `bold ${Math.round(4 * S)}px system-ui, -apple-system, Segoe UI, sans-serif`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillStyle = '#7fe3ff';
    g.fillText('tap', x0 + 4 * S, y0 + 4 * S);
  }
  g.restore();
  g.fillStyle = '#16131c';
  g.fillRect(x0, y0 + CH * S, CW * S, LABEL);
  g.fillStyle = '#a8a2b8';
  g.font = '13px system-ui, -apple-system, Segoe UI, sans-serif';
  g.textBaseline = 'top';
  g.textAlign = 'center';
  g.fillText(`${c.label}, ${view === 0 ? 'facing you' : 'facing away'}`, x0 + (CW * S) / 2, y0 + CH * S + 4);
  // (the swings so far in this round of the picture, in order)
  g.fillStyle = '#d8d0e8';
  g.fillText(c.swings.map((s) => (s.which === 1 ? 'slash' : 'Strike')).join(', '), x0 + (CW * S) / 2, y0 + CH * S + 21);
  g.textAlign = 'left';
}

let drawn = -1;
function draw(tick: number): void {
  if (tick <= drawn) {
    // starting again: every game and figure back to its beginning
    for (let n = 0; n < cells.length; n++) {
      const c = cells[n];
      cells[n] = cell(c.label, c.face, c.taps, c.held);
    }
    drawn = -1;
  }
  for (let k = drawn + 1; k <= tick; k++) {
    const t = k * TICK;
    cells.forEach((c, n) => {
      stepCell(c, t);
      const h = c.game.hero;
      const s = h.skills[h.attackSkill];
      const sp = c.fig.frame(art, { anim: h.anim, animT: h.animT, fx: h.fx, fy: h.fy, attackSkill: s ? attackClip(h.cls, h.attackSkill, SKILLS[s.id].kind, h.combo) : h.attackSkill, attackAge: h.attackAge, attackWind: h.attackWind, leapK: -1 }, TICK, (h.x - h.y) * 16, (h.x + h.y) * 8, false);
      if (k === tick) {
        const col = n % COLS;
        const row = Math.floor(n / COLS);
        drawCell(c, PAD + col * (CW * S + PAD), HEAD + row * (CH * S + LABEL + PAD), sp, t + TICK, col);
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
  g.fillText('STRIKE: TWO SWINGS, AND A SMALL STEP WITH EACH', PAD, 8);
  g.fillStyle = '#a8a2b8';
  g.font = '13px system-ui, -apple-system, Segoe UI, sans-serif';
  g.fillText(`The first swing is always Strike. Tap again within about ${SECOND_UNTIL.toFixed(1)} seconds of it and the next`, PAD, 32);
  g.fillText(`is the downward slash, then Strike again. Every swing steps him a third of a tile`, PAD, 48);
  g.fillText(`forward. The cross on the floor is where he began. Both swings do the same damage.`, PAD, 64);
}

g.fillStyle = '#16131c';
g.fillRect(0, 0, PW, PH);
header();
if (STILL >= 0) draw(Math.round(STILL * FPS));
else draw(0);
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
win.__frames = TICKS;
win.__tickMs = TICK * 1000;
win.__frame = (i: number): string => {
  draw(i);
  return cv.toDataURL('image/png');
};
win.__ready = true;
