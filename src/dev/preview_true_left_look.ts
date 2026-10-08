// Dev page, for looking (the true-left mock-up of 8 Oct 2026, NOT IN THE GAME: art/heroes3.ts,
// TRUE_LEFT): the knight at one moment of a move, from every side the skeleton can be seen from,
// painted bare (no floor, no scarf, no lights). Row 1: the four ways as the game shows them today
// (two of them turned over), then `frontL` and `backL`. Row 2: the figure itself turned to face
// each of eight ways.
//   node tools/preview.mjs src/dev/preview_true_left_look.ts shots/tl_look.png 2900 1000 "rear:0:3"
//   hash = <move>:<seconds>:<scale>[:<views>]
//     views = a list of views to show in one row instead (skeleton.ts, `View`), `~` before one
//     turned over as the game turns a picture over: "rear:0:3:~front,frontL,turn-112.5"
import { paintMove3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';

const [moveArg = 'rear', tArg = '0', sArg = '3', listArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const move = MOVES3[moveArg];
const T = Number(tArg) || 0;
const S = Number(sArg) || 3;
const CW = 120;
const CH = 150;
const custom: { label: string; view: GameView; flip: boolean }[] = listArg
  ? listArg.split(',').map((v) => ({ label: v, view: v.replace(/^~/, '') as GameView, flip: v.startsWith('~') }))
  : [];
const cells: { label: string; view: GameView; flip: boolean }[][] = custom.length ? [custom] : [
  [
    { label: 'today down-right (front)', view: 'front', flip: false },
    { label: 'today up-right (back)', view: 'back', flip: false },
    { label: 'today down-left (front flipped)', view: 'front', flip: true },
    { label: 'today up-left (back flipped)', view: 'back', flip: true },
    { label: 'frontL', view: 'frontL', flip: false },
    { label: 'backL', view: 'backL', flip: false },
  ],
  [
    { label: 'SE turn0', view: 'turn0', flip: false },
    { label: 'S turn-45', view: 'turn-45', flip: false },
    { label: 'SW turn-90', view: 'turn-90', flip: false },
    { label: 'W turn-135', view: 'turn-135', flip: false },
    { label: 'NW turn180', view: 'turn180', flip: false },
    { label: 'N turn135', view: 'turn135', flip: false },
    { label: 'NE turn90', view: 'turn90', flip: false },
    { label: 'E turn45', view: 'turn45', flip: false },
  ],
];
const cols = Math.max(...cells.map((r) => r.length));
const cv = document.createElement('canvas');
cv.width = cols * CW * S;
cv.height = cells.length * (CH * S + 30);
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#17142e';
g.fillRect(0, 0, cv.width, cv.height);
cells.forEach((row, r) => {
  row.forEach((c, i) => {
    const x = i * CW * S;
    const y = r * (CH * S + 30);
    g.fillStyle = i % 2 ? '#201e50' : '#2a2866';
    g.fillRect(x, y, CW * S, CH * S);
    const f = paintMove3(move, T, c.view);
    const img = f.px.toCanvas();
    // the floor point of the canvas at the middle bottom of the cell
    const fx = x + (CW / 2) * S;
    const fy = y + (CH - 22) * S;
    g.save();
    if (c.flip) {
      g.translate(fx, 0);
      g.scale(-1, 1);
      g.translate(-fx, 0);
    }
    g.drawImage(img, fx - CANVAS3.ax * S, fy - CANVAS3.ay * S, CANVAS3.w * S, CANVAS3.h * S);
    g.restore();
    g.fillStyle = '#ffd866';
    g.font = '600 16px system-ui, sans-serif';
    g.fillText(c.label, x + 6, y + CH * S + 20);
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
