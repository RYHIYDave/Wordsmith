// Dev page: THE THREE HEROES AS THEY ARE IN TOWN, their weapons on their backs (the owner, 6 Oct
// 2026, 21:33: "id like a town sprite for everyone where their weapons are on their backs?  this
// would also go in the class selection screen"; "except maybe the mage as her using he staff as
// a walking stick kinda works both ways"). A row a hero: facing you, and facing away. NOT IN THE
// GAME: pictures for him to look at.
//   node tools/preview.mjs src/dev/preview_town3.ts previews/town_look_three.png 1000 1900 "6"
//   node tools/page_gif.mjs src/dev/preview_town3.ts "5:run" previews/town_runs.gif 0
//   hash = <screen pixels to a picture pixel; 6 if not given>:<stand | run | cards>
//     stand: the three standing, a still (they breathe, in a film of it)
//     run:   the knight and the ranger running in town, a film
//     cards: the three as the class selection screen would show them: facing you, side by side
import { paintMove3 } from '../art/heroes3';
import { MAGE_TAILS } from '../art/hero_mage';
import { RANGER_TAILS } from '../art/hero_ranger';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import type { Painted } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import type { Move3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { Tails } from '../engine/tails';
import type { TailDef } from '../engine/tails';

const [scaleArg = '6', mode = 'stand'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 6;
const FRAME = 1 / 30;

interface Who {
  say: string;
  move: Move3;
  hero: 'knight' | 'ranger' | 'mage';
  tails: Record<string, TailDef>;
}
const STAND: Who[] = [
  { say: 'The knight: sword on his back', move: MOVES3.ktown, hero: 'knight', tails: WARRIOR_TAILS },
  { say: 'The ranger: bow on his back', move: MOVES3.rtown, hero: 'ranger', tails: RANGER_TAILS },
  { say: 'The mage: as she is everywhere, staff in hand', move: MOVES3.mstand, hero: 'mage', tails: MAGE_TAILS },
];
const RUN: Who[] = [
  { say: 'The knight runs in town', move: MOVES3.ktownrun ?? MOVES3.ktown, hero: 'knight', tails: WARRIOR_TAILS },
  { say: 'The ranger runs in town', move: MOVES3.rtownrun ?? MOVES3.rtown, hero: 'ranger', tails: RANGER_TAILS },
];
const WHO = mode === 'run' ? RUN : STAND;
const VIEWS: { view: GameView; label: string }[] = mode === 'cards' ? [{ view: 'front', label: '' }] : [{ view: 'front', label: 'Facing you' }, { view: 'back', label: 'Facing away' }];

// (the part of the painter's canvas that is shown: the figure's place on the floor is at CANVAS3.ax, CANVAS3.ay)
const HALF = mode === 'cards' ? 36 : 40;
const UP = 100;
const DOWN = 14;
const CW = HALF * 2;
const CH = UP + DOWN;
const CX0 = CANVAS3.ax - HALF;
const CY0 = CANVAS3.ay - UP;
const PAD = 8;
const HEADING = 40;
const NAME = 28;
const LABEL = mode === 'cards' ? 0 : 22;
const BG = '#17142e';
const PANEL = ['#262354', '#211e4b'];

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
// (cards: the three side by side, one view; otherwise a row a hero, a column a view)
const cols = mode === 'cards' ? WHO.length : VIEWS.length;
const rows = mode === 'cards' ? 1 : WHO.length;
cv.width = PAD + cols * (CW * S + PAD);
cv.height = PAD + HEADING + rows * (NAME + LABEL + CH * S + PAD);
const g = cv.getContext('2d') as CanvasRenderingContext2D;

/** One frame, painted as the game would paint it (art/heroes3.ts). */
function paintedAt(who: Who, t: number, view: GameView): Painted {
  return paintMove3(who.move, t, view);
}

// What flies from each (a scarf's ends, a feather), moved as the game moves them: one set for each pane.
const flying = WHO.map((w) => VIEWS.map(() => new Tails(w.tails)));
let settled = false;

function draw(t: number, dt: number): void {
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#ffd866';
  g.font = '700 18px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(mode === 'cards' ? 'As the class selection screen would show them · not in the game' : mode === 'run' ? 'Running in town · not in the game' : 'In town: weapons on their backs · not in the game', PAD + 4, PAD + HEADING / 2);
  WHO.forEach((who, r) => {
    VIEWS.forEach(({ view, label }, c) => {
      const col = mode === 'cards' ? r : c;
      const row = mode === 'cards' ? 0 : r;
      const x = PAD + col * (CW * S + PAD);
      const top = PAD + HEADING + row * (NAME + LABEL + CH * S + PAD);
      if (c === 0 || mode === 'cards') {
        g.fillStyle = '#ffd866';
        g.font = '700 16px system-ui, sans-serif';
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText(mode === 'cards' ? who.say.split(':')[0] : who.say, x + 2, top + NAME / 2);
      }
      const y = top + NAME;
      g.fillStyle = PANEL[(r + c) % 2];
      g.fillRect(x, y, CW * S, LABEL + CH * S);
      if (label) {
        g.fillStyle = '#cfc8ff';
        g.font = '600 14px system-ui, sans-serif';
        g.fillText(label, x + 8, y + LABEL / 2 + 1);
      }
      const f = paintedAt(who, t, view);
      const feetX = x + HALF * S;
      const feetY = y + LABEL + UP * S;
      g.save();
      g.beginPath();
      g.rect(x, y + LABEL, CW * S, CH * S);
      g.clip();
      // the floor they stand on: the grid's lines through their place
      g.strokeStyle = '#34306c';
      g.lineWidth = 1;
      for (const way of [1, -1]) {
        g.beginPath();
        g.moveTo(feetX - 60 * S, feetY - 30 * way * S);
        g.lineTo(feetX + 60 * S, feetY + 30 * way * S);
        g.stroke();
      }
      const tails = flying[r][c];
      const roots = (f.tails ?? []).map((root) => ({ ...root, x: root.x / 2, y: root.y / 2 }));
      // (a runner is carried over the floor, at the speed the game carries a hero: what flies from him streams back as it does there; one who stands lets it hang)
      const far = mode === 'run' ? t * 4.6 : 0;
      const ox = far * 16;
      const oy = far * 8 * (view === 'front' ? 1 : -1);
      if (!settled) {
        for (let k = 70; k >= 1; k--) tails.step(FRAME, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, ox - (mode === 'run' ? k * FRAME * 4.6 * 16 : 0), oy - (mode === 'run' ? k * FRAME * 4.6 * 8 * (view === 'front' ? 1 : -1) : 0));
      }
      tails.step(dt, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, ox, oy);
      g.imageSmoothingEnabled = false;
      tails.draw(g, feetX, feetY, false, S * 2);
      g.drawImage(f.px.toCanvas(), CX0, CY0, CW, CH, x, y + LABEL, CW * S, CH * S);
      tails.draw(g, feetX, feetY, true, S * 2);
      g.restore();
    });
  });
  settled = true;
}

// A still is the first frame; a film (tools/page_gif.mjs) asks for frame after frame.
const period = Math.max(...WHO.map((w) => w.move.motion.keys[w.move.motion.keys.length - 1].at));
const laps = mode === 'run' ? 6 : 2;
const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (k: number) => string };
draw(0, FRAME);
w.__frames = Math.round((period * laps) / FRAME);
w.__tickMs = 1000 * FRAME;
w.__frame = (k: number): string => {
  draw(k * FRAME, FRAME);
  return cv.toDataURL('image/png');
};
w.__ready = true;
