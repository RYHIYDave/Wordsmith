// Dev page: THE WARLOCK'S DEMON, THE CLASSIC KIND (dev/options_classes.ts CLASSIC_DEMONS; the owner, 23 Oct 2026). Big, facing
// you and away; and as small as in the game beside the knight and the warlock. NOT IN THE GAME.
//   node tools/preview.mjs src/dev/preview_demon.ts previews/demon_classic.png 100 100 "4"
//   hash = <screen pixels to a picture pixel for the big ones>[:<which, comma between>]
import { paintMove3 } from '../art/heroes3';
import type { Painted } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import { CLASSIC_DEMONS, DEBUG_DEMON, DEMON_CANVAS, paintClassicDemon, paintClassLook } from './options_classes';

const [scaleArg = '4', whichArg = '', dbg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
if (dbg.includes('nohorns')) DEBUG_DEMON.horns = false;
if (dbg.includes('nowings')) DEBUG_DEMON.wings = false;
const S = Number(scaleArg) || 4;
const which = whichArg ? whichArg.split(',').map(Number) : CLASSIC_DEMONS.map((_, k) => k);
const BG = '#17142e';
const PANEL = ['#262354', '#211e4b'];
const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = BG;
document.body.appendChild(cv);

// the big panes: each demon facing you and away; a window of its canvas round it
const HALF = 66;
const UP = 156;
const DOWN = 10;
const PW = HALF * 2 * S;
const PH = (UP + DOWN) * S;
const PAD = 10;
const NAME = 32;
const HEAD = 46;
// the small strip: as in the game (a picture pixel = half a game pixel; drawn at 2 screen pixels a game pixel here: 1 to 1)
const SM = 2;
const strip: { name: string; f: Painted; canvas: { ax: number; ay: number } }[] = [
  { name: 'knight', f: paintMove3(MOVES3.ktown, 0, 'front'), canvas: CANVAS3 },
  { name: 'warlock', f: paintClassLook('warlock3', 0), canvas: CANVAS3 },
  ...which.map((k) => ({ name: `demon ${k + 1}`, f: paintClassicDemon(k, 'front'), canvas: DEMON_CANVAS })),
];
const SW = 90 * SM;
const SH = 130 * SM;
const cols = 2;
cv.width = PAD + cols * (PW + PAD);
cv.height = PAD + HEAD + which.length * (NAME + PH + PAD) + NAME + SH + PAD;
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = BG;
g.fillRect(0, 0, cv.width, cv.height);
g.fillStyle = '#ffd866';
g.font = '700 22px system-ui, sans-serif';
g.textBaseline = 'middle';
g.fillText("The warlock's demon: the classic kind · sketches · not in the game", PAD + 4, PAD + HEAD / 2);
const floor = (x: number, y: number, w: number): void => {
  g.strokeStyle = '#34306c';
  g.lineWidth = 1;
  for (const way of [1, -1]) {
    g.beginPath();
    g.moveTo(x - w, y - (w / 2) * way);
    g.lineTo(x + w, y + (w / 2) * way);
    g.stroke();
  }
};
which.forEach((k, row) => {
  const top = PAD + HEAD + row * (NAME + PH + PAD);
  g.fillStyle = '#ffd866';
  g.font = '800 24px system-ui, sans-serif';
  g.fillText(String(k + 1), PAD + 4, top + NAME / 2);
  g.fillStyle = '#cfc8ff';
  g.font = '600 17px system-ui, sans-serif';
  g.fillText(CLASSIC_DEMONS[k].name, PAD + 30, top + NAME / 2 + 1);
  (['front', 'back'] as const).forEach((view, col) => {
    const x = PAD + col * (PW + PAD);
    const y = top + NAME;
    g.fillStyle = PANEL[(row + col) % 2];
    g.fillRect(x, y, PW, PH);
    g.save();
    g.beginPath();
    g.rect(x, y, PW, PH);
    g.clip();
    floor(x + HALF * S, y + UP * S, 70 * S);
    const f = paintClassicDemon(k, view);
    g.drawImage(f.px.toCanvas(), DEMON_CANVAS.ax - HALF, DEMON_CANVAS.ay - UP, HALF * 2, UP + DOWN, x, y, PW, PH);
    g.restore();
  });
});
const sTop = PAD + HEAD + which.length * (NAME + PH + PAD);
g.fillStyle = '#cfc8ff';
g.font = '600 17px system-ui, sans-serif';
g.fillText('As big as in the game, beside the knight and the warlock', PAD + 4, sTop + NAME / 2);
strip.forEach((it, i) => {
  const x = PAD + i * SW;
  const y = sTop + NAME;
  g.fillStyle = PANEL[i % 2];
  g.fillRect(x, y, SW, SH);
  g.save();
  g.beginPath();
  g.rect(x, y, SW, SH);
  g.clip();
  const img = it.f.px.toCanvas();
  // (picture pixels at half size, as the game draws them, then doubled so a game pixel is two screen pixels)
  g.drawImage(img, it.canvas.ax - 90, it.canvas.ay - 120, 180, 130, x + SW / 2 - 90, y, 180, 130 * 2 / 2);
  g.restore();
});
(window as unknown as { __ready: boolean }).__ready = true;
