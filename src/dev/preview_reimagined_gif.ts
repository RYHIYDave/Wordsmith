// Dev page: THE RANGER, REIMAGINED, MOVING (the art chat, 9 Oct 2026): a moving picture for the
// owner of today's ranger (left) beside the Wind-runner (right; art/hero3_ranger2.ts), each row the
// same moment of the same thing: his battle stance, breathing; a run and a stop; and a Shot. NOT IN
// THE GAME: the switch (art/reimagined.ts) is off; this page turns it on only while it paints the
// right-hand figures.
//   As the game plays it: the game's own rules move the hero and the game's own chooser picks
// each frame (tools/review_heroes/sim.ts, as src/dev/preview_play.ts uses it), and each frame is
// painted by the game's own painter (art/heroes3.ts, paintMove3). The tail of the hood and the
// feather are moved a sixtieth of a second at a time by the game's own tails (engine/tails.ts), and
// the Shot's arrow flies as the game draws it (render/render.ts). The view follows the hero, so the
// floor slides under him as he runs.
//   node tools/page_gif.mjs src/dev/preview_reimagined_gif.ts "5" previews/reimagined/ranger_moving.gif
//   hash = <screen pixels to a game pixel; 5 if not given>
import { makeGroundArt } from '../art/ground';
import { HERO_TAILS } from '../art/heroes';
import { paintMove3 } from '../art/heroes3';
import type { Painted } from '../art/kit';
import { REIMAGINED } from '../art/reimagined';
import { CANVAS3 } from '../art/skin';
import { P } from '../art/palette';
import { drawGlow } from '../engine/px';
import { Tails } from '../engine/tails';
import { RANGER_ARROW } from '../game/defs';
import { pline } from '../render/fx';
import { moveOf, play } from '../../tools/review_heroes/sim';
import type { Ctx, Scenario, Shown } from '../../tools/review_heroes/sim';

const [scaleArg = '5'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 5;
/** How long the picture runs before it loops (two of his breaths in the battle stance, so that it goes round without a jump), and its frames a second (a GIF counts in hundredths: 4 each is 25 a second). */
const SECONDS = 4.8;
const FPS = 25;
const FRAMES = Math.round(SECONDS * FPS);

/** The hero shoots straight ahead of him, as a tap on the screen does. */
function shootAt(x: Ctx, when: number): void {
  if (x.t < when || x.t >= when + 1 / 60) return;
  const h = x.game.hero;
  x.c.aimX = h.x + h.fx * 2;
  x.c.aimY = h.y + h.fy * 2;
  x.c.castX = x.c.aimX;
  x.c.castY = x.c.aimY;
  x.c.fire = true;
}
const ROWS: { name: string; sc: Scenario }[] = [
  { name: 'His battle stance, breathing', sc: { name: 'stands', cls: 'ranger', seconds: SECONDS, face: [1, 0], step: () => {} } },
  {
    name: 'Running, then stopping',
    sc: {
      name: 'runs and stops', cls: 'ranger', seconds: SECONDS, face: [1, 0],
      step: (x) => {
        // (as long as takes him six tiles along, to the step: the floor under him is laid six tiles round, so that it goes round with the picture)
        if (x.t >= 0.4 && x.t < 1.62) {
          x.c.mx = 1;
          x.c.my = 0;
        }
      },
    },
  },
  { name: 'Shot', sc: { name: 'shoots', cls: 'ranger', seconds: SECONDS, face: [1, 0], step: (x) => { shootAt(x, 0.6); shootAt(x, 3.0); } } },
];

/** A cell, in game pixels, and where the hero's feet are in it. */
const CW = 74;
const CH = 64;
const FX = 42;
const FY = 54;
const PAD = 10;
const HEAD = 78;
const COLHEAD = 30;
const LABEL = 30;
const BG = '#17142e';
const ground = makeGroundArt();

interface Cell {
  on: boolean;
  shown: Shown[];
  tails: Tails;
  tailsAt: number;
  last: Painted | null;
}
const cells: Cell[][] = ROWS.map((r) => {
  const shown = play(r.sc);
  return [false, true].map((on) => ({ on, shown, tails: new Tails(HERO_TAILS), tailsAt: -1, last: null }));
});

/** A frame, with the reimagined outfit or without it. */
function paint(on: boolean, sh: Shown): Painted {
  const was = REIMAGINED.ranger;
  REIMAGINED.ranger = on;
  try {
    return paintMove3(moveOf(sh.key), sh.mt, sh.view);
  } finally {
    REIMAGINED.ranger = was;
  }
}

const cv = document.createElement('canvas');
cv.width = PAD + 2 * (CW * S + PAD);
cv.height = HEAD + COLHEAD + ROWS.length * (CH * S + LABEL) + PAD;
cv.style.display = 'block';
document.body.style.margin = '0';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;

/** The dungeon's own floor round the hero, the dark beyond his light, his pool of light and his shadow: the view follows him, so the floor slides under him (its stones are laid six tiles round, as far as he runs). */
function floor(x0: number, y0: number, hx: number, hy: number): void {
  const cx = x0 + FX * S;
  const cy = y0 + FY * S;
  g.fillStyle = '#07061a';
  g.fillRect(x0, y0, CW * S, CH * S);
  g.imageSmoothingEnabled = false;
  // (a tile's picture is anchored at its top corner: tile (i, j) has that corner at ((i - j) 16, (i + j) 8) on the screen, as the hero's feet are at ((x - y) 16, (x + y) 8))
  const ti = Math.floor((hx / 16 + hy / 8) / 2);
  const tj = Math.floor((hy / 8 - hx / 16) / 2);
  for (let i = ti - 5; i <= ti + 5; i++) {
    for (let j = tj - 5; j <= tj + 5; j++) {
      const sp = ground.floor(20 + (((i % 6) + 6) % 6), j);
      const px = cx + ((i - j) * 16 - hx) * S;
      const py = cy + ((i + j) * 8 - hy) * S;
      g.drawImage(sp.img, px - sp.ax * S, py - sp.ay * S, (sp.img.width / 2) * S, (sp.img.height / 2) * S);
    }
  }
  const dark = g.createRadialGradient(cx, cy - 10 * S, 5 * S, cx, cy - 10 * S, 55 * S);
  dark.addColorStop(0, 'rgba(6,4,14,0)');
  dark.addColorStop(0.6, 'rgba(6,4,14,0.35)');
  dark.addColorStop(1, 'rgba(6,4,14,0.8)');
  g.fillStyle = dark;
  g.fillRect(x0, y0, CW * S, CH * S);
  // (the pool of light behind a hero: art/heroes3.ts, AURA3)
  drawGlow(g, cx - 2 * S, cy - 15 * S, 23 * S, '#28dcf0', 0.2);
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath();
  g.ellipse(cx, cy, 6.3 * S, 3.2 * S, 0, 0, Math.PI * 2);
  g.fill();
}

function drawCell(c: Cell, x0: number, y0: number, i: number): void {
  const sh = c.shown[i];
  // (the flying ends moved on a step at a time, as the game moves them, up to this step)
  for (let j = c.tailsAt + 1; j <= i; j++) {
    const sj = c.shown[j];
    const fj = paint(c.on, sj);
    const roots = (fj.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    // (before the first: a couple of seconds standing there, so that they have settled into the wind)
    if (j === 0) for (let w = 0; w < 150; w++) c.tails.step(1 / 60, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, sj.x, sj.y - sj.lift);
    c.tails.step(1 / 60, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, sj.x, sj.y - sj.lift);
    if (j === i) c.last = fj;
  }
  c.tailsAt = Math.max(c.tailsAt, i);
  const f = c.last ?? paint(c.on, sh);
  g.save();
  g.beginPath();
  g.rect(x0, y0, CW * S, CH * S);
  g.clip();
  floor(x0, y0, sh.x, sh.y);
  const fx = x0 + FX * S;
  const fy = y0 + (FY - sh.lift) * S;
  c.tails.draw(g, fx, fy, false, S);
  g.imageSmoothingEnabled = false;
  g.drawImage(f.px.toCanvas(), fx - (CANVAS3.ax / 2) * S, fy - (CANVAS3.ay / 2) * S, (CANVAS3.w / 2) * S, (CANVAS3.h / 2) * S);
  c.tails.draw(g, fx, fy, true, S);
  // (what glows: the frame's own lights, and the feather's)
  for (const l of f.lights) drawGlow(g, fx + ((l.x - CANVAS3.ax) / 2) * S, fy + ((l.y - CANVAS3.ay) / 2) * S, (l.r / 2) * S, l.color, l.a ?? 0.5);
  for (const l of c.tails.lights()) drawGlow(g, fx + l.x * S, fy + l.y * S, l.r * S, l.color, l.a);
  // THE GAME'S OWN ARROWS, as render/render.ts draws a hero's (and src/dev/preview_play.ts): a
  // shaft of light wood and a pale steel head, and its shadow on the floor, from where RANGER_ARROW says
  for (const a of sh.arrows) {
    const lifted = RANGER_ARROW.on && !a.hostile;
    if (lifted && 0.4 + a.age * Math.hypot(a.vx, a.vy) < RANGER_ARROW.from) continue;
    const up = lifted ? Math.round(RANGER_ARROW.height) : 10;
    const dx = (a.vx - a.vy) * 16;
    const dy = (a.vx + a.vy) * 8;
    const len = Math.hypot(dx, dy) || 1;
    const body = lifted ? RANGER_ARROW.long : 6;
    g.save();
    g.translate(x0 + (FX - sh.x) * S, y0 + (FY - sh.y) * S);
    g.scale(S, S);
    pline(g, a.x - (dx / len) * body, a.y - up - (dy / len) * body, a.x, a.y - up, P.wd5);
    g.fillStyle = P.sl5;
    g.fillRect(Math.round(a.x), Math.round(a.y - up), 2, 2);
    g.fillStyle = P.black;
    g.globalAlpha = 0.35;
    g.fillRect(Math.round(a.x - 2), Math.round(a.y), 4, 1);
    g.restore();
  }
  g.restore();
}

function draw(k: number): string {
  // (starting again from the first frame: every figure back to its beginning)
  if (k === 0) {
    for (const row of cells) {
      for (const c of row) {
        c.tails = new Tails(HERO_TAILS);
        c.tailsAt = -1;
        c.last = null;
      }
    }
  }
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillStyle = '#ffd866';
  g.font = '700 26px system-ui, sans-serif';
  g.fillText('The ranger, reimagined, moving', PAD + 2, PAD + 18);
  g.fillStyle = '#cfc8ff';
  g.font = '600 17px system-ui, sans-serif';
  g.fillText('a mock-up: not in the game', PAD + 2, PAD + 50);
  g.fillStyle = '#ffd866';
  g.font = '700 19px system-ui, sans-serif';
  g.fillText('Today', PAD + 4, HEAD + COLHEAD / 2);
  g.fillText('Reimagined', PAD + CW * S + PAD + 4, HEAD + COLHEAD / 2);
  const i = Math.min(...cells.map((row) => row[0].shown.length - 1), Math.round((k * 60) / FPS));
  cells.forEach((row, r) => {
    const y = HEAD + COLHEAD + r * (CH * S + LABEL);
    row.forEach((c, n) => drawCell(c, PAD + n * (CW * S + PAD), y, i));
    g.fillStyle = '#cfc8ff';
    g.font = '600 16px system-ui, sans-serif';
    g.textAlign = 'left';
    g.fillText(ROWS[r].name, PAD + 4, y + CH * S + LABEL / 2);
  });
  return cv.toDataURL('image/png');
}

const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (k: number) => string };
w.__frames = FRAMES;
w.__tickMs = 1000 / FPS;
w.__frame = draw;
draw(0);
w.__ready = true;
