// Dev page: THE WARLOCK'S DEMON, HULKING (dev/demon_hulk.ts). Big, facing you and away; and as big as in the game beside the
// knight and the warlock. NOT IN THE GAME.
//   node tools/preview.mjs src/dev/preview_hulk.ts previews/hulk.png 100 100 "4"
//   hash = <screen pixels to a picture pixel>[:<which, comma between>]
import { paintMove3 } from '../art/heroes3';
import type { Painted } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import { AURAS, HULKS, HULK_CANVAS, paintHulk } from './demon_hulk';
import { paintClassLook } from './options_classes';

const [scaleArg = '4', whichArg = '', mode = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
const which = whichArg ? whichArg.split(',').map(Number) : HULKS.map((_, k) => k);
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
const HALF = 80;
const UP = 150;
const DOWN = 12;
const PW = HALF * 2 * S;
const PH = (UP + DOWN) * S;
const PAD = 10;
const NAME = 32;
const HEAD = 46;
const SM = 2;
const SW = 120 * SM / 2;
const SH = 150;
const strip: { f: Painted; canvas: { ax: number; ay: number } }[] = [
  { f: paintMove3(MOVES3.ktown, 0, 'front'), canvas: CANVAS3 },
  { f: paintClassLook('warlock3', 0), canvas: CANVAS3 },
  ...which.map((k) => ({ f: paintHulk(HULKS[k], 'front'), canvas: HULK_CANVAS })),
];
cv.width = Math.max(PAD + 2 * (PW + PAD), PAD + strip.length * SW + PAD);
cv.height = PAD + HEAD + which.length * (NAME + PH + PAD) + NAME + SH + PAD;
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = BG;
g.fillRect(0, 0, cv.width, cv.height);
g.fillStyle = '#ffd866';
g.font = '700 22px system-ui, sans-serif';
g.textBaseline = 'middle';
g.fillText("The warlock's demon, hulking · sketches · not in the game", PAD + 4, PAD + HEAD / 2);
if (mode === 'auras') {
  // EVERY AURA: the first look, front view, smoke and each damage word's
  const cols = 3;
  const sw = HALF * 2 * S;
  const sh = (UP + DOWN) * S;
  const looks = [{ k: which[0], aura: 'smoke' as const, label: 'No word on it: black smoke' }, ...AURAS.slice(1).map((a) => ({ k: which[0], aura: a, label: a === 'poison' ? 'The poison word: green stink' : `A ${a} word: ${a === 'fire' ? 'flames' : a === 'frost' ? 'frost and cold mist' : 'crackling lightning'}` }))];
  looks.push({ k: which[1] ?? 1, aura: 'smoke', label: 'Horns swept back, smoke' });
  cv.width = PAD + cols * (sw + PAD);
  cv.height = PAD + HEAD + Math.ceil(looks.length / cols) * (NAME + sh + PAD);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#ffd866';
  g.font = '700 22px system-ui, sans-serif';
  g.fillText("The warlock's demon: what pours off it, by the word on it · sketches · not in the game", PAD + 4, PAD + HEAD / 2);
  looks.forEach((it, i) => {
    const x = PAD + (i % cols) * (sw + PAD);
    const top = PAD + HEAD + Math.floor(i / cols) * (NAME + sh + PAD);
    g.fillStyle = '#cfc8ff';
    g.font = '600 17px system-ui, sans-serif';
    g.fillText(it.label, x + 4, top + NAME / 2 + 1);
    g.fillStyle = PANEL[i % 2];
    g.fillRect(x, top + NAME, sw, sh);
    const f = paintHulk({ ...HULKS[it.k], aura: it.aura }, 'front');
    g.drawImage(f.px.toCanvas(), HULK_CANVAS.ax - HALF, HULK_CANVAS.ay - UP, HALF * 2, UP + DOWN, x, top + NAME, sw, sh);
  });
}
if (mode !== 'auras') which.forEach((k, row) => {
  const top = PAD + HEAD + row * (NAME + PH + PAD);
  g.fillStyle = '#ffd866';
  g.font = '800 24px system-ui, sans-serif';
  g.fillText(String(k + 1), PAD + 4, top + NAME / 2);
  g.fillStyle = '#cfc8ff';
  g.font = '600 17px system-ui, sans-serif';
  g.fillText(HULKS[k].name, PAD + 30, top + NAME / 2 + 1);
  (['front', 'back'] as const).forEach((view, col) => {
    const x = PAD + col * (PW + PAD);
    const y = top + NAME;
    g.fillStyle = PANEL[(row + col) % 2];
    g.fillRect(x, y, PW, PH);
    g.save();
    g.beginPath();
    g.rect(x, y, PW, PH);
    g.clip();
    g.strokeStyle = '#34306c';
    for (const way of [1, -1]) {
      g.beginPath();
      g.moveTo(x + HALF * S - 90 * S, y + UP * S - 45 * S * way);
      g.lineTo(x + HALF * S + 90 * S, y + UP * S + 45 * S * way);
      g.stroke();
    }
    const f = paintHulk(HULKS[k], view);
    g.drawImage(f.px.toCanvas(), HULK_CANVAS.ax - HALF, HULK_CANVAS.ay - UP, HALF * 2, UP + DOWN, x, y, PW, PH);
    g.restore();
  });
});
const sTop = PAD + HEAD + which.length * (NAME + PH + PAD);
if (mode !== 'auras') g.fillStyle = '#cfc8ff';
if (mode !== 'auras') g.font = '600 17px system-ui, sans-serif';
if (mode !== 'auras') g.fillText('As big as in the game, beside the knight and the warlock', PAD + 4, sTop + NAME / 2);
if (mode !== 'auras') strip.forEach((it, i) => {
  const x = PAD + i * SW;
  const y = sTop + NAME;
  g.fillStyle = PANEL[i % 2];
  g.fillRect(x, y, SW, SH);
  const img = it.f.px.toCanvas();
  // (a picture pixel is half a game pixel: drawn here at half its size)
  g.drawImage(img, it.canvas.ax - 120, it.canvas.ay - 280, 240, 290, x + SW / 2 - 60, y + SH - 145, 120, 145);
});
(window as unknown as { __ready: boolean }).__ready = true;
