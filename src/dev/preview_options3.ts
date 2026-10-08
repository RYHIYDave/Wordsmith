// Dev page: DESIGNS TO CHOOSE FROM for the heroes painted over the bones (dev/options3.ts; the
// owner, 6 Oct 2026, 23:11: "i need 10 new mages ... and maybe 10 ranger faces.  and 10 full faced
// helmets for the warrior"). Each in a numbered pane, standing, facing the eye; the first pane is
// the hero as they are now. NOT IN THE GAME: pictures for him to choose from.
//   node tools/preview.mjs src/dev/preview_options3.ts previews/mage_options.png 100 100 "mage:6:3"
//   hash = <mage | ranger | knight | sizes>:<screen pixels to a picture pixel>:<panes in a row>[:close]
//     sizes: three of the mages with heads of three sizes;  close: only the head and shoulders of each, big
import { paintMove3 } from '../art/heroes3';
import type { Painted } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import type { Move3 } from '../art/moves3';
import { bonesAt, buildOf, solve } from '../art/skeleton';
import { CANVAS3 } from '../art/skin';
import { MAGE_TAILS } from '../art/hero_mage';
import { RANGER_TAILS } from '../art/hero_ranger';
import { WARRIOR_TAILS } from '../art/hero_warrior';
import { Tails } from '../engine/tails';
import type { TailDef } from '../engine/tails';
import { KNIGHT_HELMS, MAGES, RANGER_HEADS, glowing, hatted, paintHeadOption, paintMageOption, plainly } from './options3';

const [what = 'mage', scaleArg = '6', colsArg = '3', lookArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 6;
const COLS = Number(colsArg) || 3;

interface Pane {
  n: string;
  name: string;
  f: Painted;
  /** What flies from the figure (a scarf's ends, a feather), if the painting says where it is fixed: the game moves those, and so does this page. */
  flies?: Record<string, TailDef>;
}

const standOf = (move: Move3): Painted => paintMove3(move, 0, 'front');
const panes: Pane[] = [];
let heading = '';
/** The part of the painter's canvas that a pane shows, about the figure's place on the floor: to either side, above, below. */
let HALF = 34;
let UP = 84;
let DOWN = 12;
/** Heads only: a second, closer look at the head in each pane, this many times bigger again. */
let CLOSE = 0;
if (what === 'sizes') {
  // THE SAME MAGES WITH BIGGER HEADS: what a face has room for at each size (the heads of the heroes are 1.3 of life: art/moves3.ts, HEAD_B)
  heading = 'The same three with bigger heads · rough sketches · not in the game';
  const move = MOVES3.mstand;
  const q = bonesAt(move.motion.keys, move.rest, 0);
  for (const k of [3, 6, 8]) {
    for (const [size, say] of [[1.3, 'head as now'], [1.6, 'head a quarter bigger'], [1.9, 'head half as big again']] as [number, string][]) {
      const build = buildOf(54.5, size, { shoulders: 0.9, chest: 0.94, waist: 0.86, hips: 1.1, limbs: 0.9, skirt: [2.4, 2.2] });
      panes.push({ n: String(k + 1), name: say, f: paintMageOption(k, solve(build, q), q, 'front', build) });
    }
  }
} else if (what === 'two') {
  // NUMBER 2, THREE WAYS (the owner, 6 Oct 2026, 23:41: "can i get 2 from the original drawing but move the hair so i see both eyes")
  heading = 'Mage 2, hair off her face · rough sketches · not in the game';
  const move = MOVES3.mstand;
  const q = bonesAt(move.motion.keys, move.rest, 0);
  const big = buildOf(54.5, 1.6, { shoulders: 0.9, chest: 0.94, waist: 0.86, hips: 1.1, limbs: 0.9, skirt: [2.4, 2.2] });
  plainly(true);
  if (lookArg === 'glow' || colsArg === '4') {
    glowing(true);
    panes.push({ n: 'A', name: 'Glowing eyes', f: paintMageOption(1, solve(move.build, q), q, 'front', move.build) });
    glowing(false);
  }
  panes.push({ n: 'A', name: 'Dark eyes, as first drawn', f: paintMageOption(1, solve(move.build, q), q, 'front', move.build) });
  plainly(false);
  panes.push({ n: 'B', name: 'Fuller face and hair', f: paintMageOption(1, solve(move.build, q), q, 'front', move.build) });
  panes.push({ n: 'C', name: 'B with a bigger head', f: paintMageOption(1, solve(big, q), q, 'front', big) });
} else if (what === 'nine') {
  // THE BATTLE MAGE IN THE POINTED HAT, WITH A BELT (the owner, 7 Oct 2026, 00:10 and 00:11: "can i see the battle mage with the original hat?"; "wait no give me the pointy hat"; "and a belt")
  heading = 'The battle mage (9): pointy hat and a belt · rough sketches · not in the game';
  const move = MOVES3.mstand;
  const q = bonesAt(move.motion.keys, move.rest, 0);
  const s = solve(move.build, q);
  plainly(true);
  for (const [hat, n, say] of [['point', 'A', 'Pointy hat and a belt'], ['none', 'B', 'As first sketched']] as const) {
    hatted(hat);
    panes.push({ n, name: say, f: paintMageOption(8, s, q, 'front', move.build) });
  }
  hatted('none');
  plainly(false);
} else if (what === 'mage') {
  heading = 'Ten mages to choose from · rough sketches · not in the game';
  const move = MOVES3.mstand;
  const q = bonesAt(move.motion.keys, move.rest, 0);
  const s = solve(move.build, q);
  panes.push({ n: 'NOW', name: 'As she is', f: standOf(move), flies: MAGE_TAILS });
  MAGES.forEach((m, k) => panes.push({ n: String(k + 1), name: m.name, f: paintMageOption(k, s, q, 'front', move.build) }));
} else {
  const knight = what === 'knight';
  heading = knight ? 'Ten full-face helmets for the warrior · rough sketches · not in the game' : 'Ten faces for the ranger · rough sketches · not in the game';
  const move = knight ? MOVES3.ktown : MOVES3.rtown;
  const list = knight ? KNIGHT_HELMS : RANGER_HEADS;
  HALF = 30;
  UP = knight ? 80 : 84;
  DOWN = 10;
  CLOSE = 2;
  const flies = knight ? WARRIOR_TAILS : RANGER_TAILS;
  // (faces drawn as the mage he chose is drawn: "yep a is good", 6 Oct 2026, 23:51. `full` in the hash for the fuller ones.)
  plainly(lookArg !== 'full');
  panes.push({ n: 'NOW', name: 'As he is', f: standOf(move), flies });
  list.forEach((h, k) => panes.push({ n: String(k + 1), name: h.name, f: paintHeadOption(move, k, knight ? 'knight' : 'ranger'), flies }));
}

// A CLOSER LOOK: only the head and shoulders of each, big (the owner, 6 Oct 2026, 23:33: "can we do
// a little better on the faces?  theres really no detail there.  or in the hair").
if (lookArg === 'close') {
  heading = heading.replace(' · rough sketches', ', close up · rough sketches');
  CLOSE = 0;
  HALF = what === 'sizes' ? 25 : 23;
  UP = what === 'sizes' || what === 'two' || what === 'nine' ? 90 : what === 'mage' ? 80 : 84;
  DOWN = what === 'sizes' ? -40 : what === 'mage' || what === 'two' || what === 'nine' ? -38 : -42;
}
const CW = HALF * 2;
const CH = UP + DOWN;
const CX0 = CANVAS3.ax - HALF;
const CY0 = CANVAS3.ay - UP;
// (the closer look: a square about the head)
const HEAD = 30;
const closeW = CLOSE ? HEAD * S * CLOSE : 0;
const PAD = 10;
const HEADING = 46;
const NAME = 34;
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
const paneW = CW * S + closeW;
const paneH = Math.max(CH * S, closeW);
const rows = Math.ceil(panes.length / COLS);
cv.width = PAD + COLS * (paneW + PAD);
cv.height = PAD + HEADING + rows * (NAME + paneH + PAD);
const g = cv.getContext('2d') as CanvasRenderingContext2D;

/** Where the head is in a painting: the middle of the topmost fifth of what is painted, about (found from the picture: a sketch does not say). */
function headOf(f: Painted): [number, number] {
  const p = f.px;
  let top = -1;
  for (let y = 0; y < p.h && top < 0; y++) for (let x = CANVAS3.ax - 16; x < CANVAS3.ax + 16; x++) if (p.has(x, y)) top = y;
  return [CANVAS3.ax, Math.max(0, top) + HEAD / 2 - 3];
}

g.fillStyle = BG;
g.fillRect(0, 0, cv.width, cv.height);
g.fillStyle = '#ffd866';
g.font = '700 22px system-ui, sans-serif';
g.textAlign = 'left';
g.textBaseline = 'middle';
g.fillText(heading, PAD + 4, PAD + HEADING / 2);
panes.forEach((pane, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = PAD + col * (paneW + PAD);
  const top = PAD + HEADING + row * (NAME + paneH + PAD);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillStyle = '#ffd866';
  g.font = '800 26px system-ui, sans-serif';
  g.fillText(pane.n, x + 4, top + NAME / 2);
  const nw = g.measureText(pane.n).width;
  g.fillStyle = '#cfc8ff';
  g.font = '600 17px system-ui, sans-serif';
  g.fillText(pane.name, x + 14 + nw, top + NAME / 2 + 1);
  const y = top + NAME;
  g.fillStyle = PANEL[(row + col) % 2];
  g.fillRect(x, y, paneW, paneH);
  const feetX = x + HALF * S;
  const feetY = y + UP * S;
  g.save();
  g.beginPath();
  g.rect(x, y, CW * S, paneH);
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
  g.imageSmoothingEnabled = false;
  const img = pane.f.px.toCanvas();
  // (what flies from them, hanging as it does on one who stands: let fall for a while first)
  const tails = pane.flies && pane.f.tails && pane.f.tails.length > 0 ? new Tails(pane.flies) : null;
  const roots = (pane.f.tails ?? []).map((root) => ({ ...root, x: root.x / 2, y: root.y / 2 }));
  if (tails) for (let k = 0; k < 90; k++) tails.step(1 / 30, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
  if (tails) tails.draw(g, feetX, feetY, false, S * 2);
  g.drawImage(img, CX0, CY0, CW, CH, x, y, CW * S, CH * S);
  if (tails) tails.draw(g, feetX, feetY, true, S * 2);
  g.restore();
  if (CLOSE) {
    const [hx, hy] = headOf(pane.f);
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#1b1840';
    g.fillRect(x + CW * S, y, closeW, closeW);
    g.drawImage(img, hx - HEAD / 2, hy - HEAD / 2, HEAD, HEAD, x + CW * S, y, closeW, closeW);
  }
});

(window as unknown as { __ready: boolean }).__ready = true;
