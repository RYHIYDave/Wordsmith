// Dev page: FLOOR 19'S BOSS, THE KING (art/king.ts, art/king_moves.ts, art/king_fx.ts), in a browser: the same pictures
// tools/king_pictures.ts writes outside one (the scenes are src/dev/king_scene.ts). Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_king.ts shots/king/sheet.png 1200 600 "sheet"
//   ... "game" (at the game's size, in his hall) 1200 620; "hush" (his last phase, the Hush at his side) 1200 640;
//   ... "bird" (the clockwork songbird); "big:<move>:<t>" (front and behind, four times as big);
//   ... "grid:<move>:<t>,<t>,..." (a move at several moments, both ways round, twice as big);
//   ... "fx:<sweep|crown|decree|curtains>:<t>" (what a blow leaves across the hall, the King where it begins)
import { Px } from '../engine/px';
import { KING, KING_ALONE, HUSH } from '../art/king_moves';
import { FX_CANVAS, crownPainted, curtainsPainted, decreePainted, sweepPainted } from '../art/king_fx';
import { birdPicture, frameOf, gameSizePicture, hallFloor, hushPicture, lay, laidOf, shadow, sheetPicture } from './king_scene';

const [mode = 'sheet', a1 = 'stand', a2 = '0', a3 = 'king'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
const show = (px: Px): void => {
  g.putImageData(new ImageData(new Uint8ClampedArray(px.d), px.w, px.h), 0, 0);
};
const mobOf = (who: string) => (who === 'alone' ? KING_ALONE : who === 'hush' ? HUSH : KING);

if (mode === 'sheet') show(sheetPicture(Number(a2) || 0));
else if (mode === 'game') show(gameSizePicture());
else if (mode === 'hush') show(hushPicture());
else if (mode === 'bird') show(birdPicture());
else if (mode === 'big' || mode === 'grid') {
  const K = mode === 'big' ? 4 : 2;
  const ts = mode === 'big' ? [Number(a2) || 0] : a2.split(',').map(Number);
  const mob = mobOf(a3);
  const px = new Px(cv.width, cv.height);
  const floor = hallFloor(Math.ceil(cv.width / K), Math.ceil(cv.height / K), Math.ceil(cv.width / K / 2), Math.ceil(cv.height / K / 2), false);
  lay(px, laidOf(floor, 0, 0), 0, 0, K);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - 30;
      shadow(px, w * (i + 0.5), y, 22, K);
      lay(px, frameOf(mob, a1, t, view), w * (i + 0.5), y, K);
    }
  });
  show(px);
} else if (mode === 'fx') {
  const t = Number(a2) || 0;
  const px = new Px(FX_CANVAS.w, FX_CANVAS.h);
  lay(px, laidOf(hallFloor(FX_CANVAS.w, FX_CANVAS.h, FX_CANVAS.ax, FX_CANVAS.ay, false), 0, 0), 0, 0);
  lay(px, frameOf(KING, 'stand', 0, 'front'), FX_CANVAS.ax, FX_CANVAS.ay);
  const f = a1 === 'sweep' ? sweepPainted(t) : a1 === 'crown' ? crownPainted(t) : a1 === 'decree' ? decreePainted(t) : curtainsPainted(t);
  lay(px, laidOf(f, 0, 0), 0, 0);
  show(px);
}
(window as unknown as { __ready: boolean }).__ready = true;
