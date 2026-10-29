// Dev page: FLOOR 17, THE MASQUE, BUILT FROM ITS GAME-READY PARTS: its ground painted by the game's painter in the Masque's
// look (art/masque.ts) from a level laid by hand (dev/masque_level.ts). Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_masque.ts shots/masque/ground.png 1200 840 "ground"
import { masqueLook } from '../art/masque';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { M_HERO, masqueLand } from './masque_level';

const [mode = 'ground'] = decodeURIComponent(location.hash.slice(1)).split(':');
const W = 1200;
const H = 840;
const land = masqueLand();
const T = terrainOf(land.floor, masqueLook(land));
const [hx, hy] = pictureOf(M_HERO[0], M_HERO[1]);
const VX = Math.round(hx - W / 2 + 40);
const VY = Math.round(hy - H / 2 - 60);

const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
const PIECE = 256;
for (let py = 0; py < H; py += PIECE) {
  for (let px = 0; px < W; px += PIECE) {
    const pw = Math.min(PIECE, W - px);
    const ph = Math.min(PIECE, H - py);
    const p = paintTerrain(T, VX + px, VY + py, pw, ph);
    g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
  }
}
const crop = (cx: number, cy: number, sw: number, sh: number, k: number): void => {
  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cv, 0, 0);
  cv.width = sw;
  cv.height = sh;
  const g2 = cv.getContext('2d') as CanvasRenderingContext2D;
  g2.imageSmoothingEnabled = false;
  g2.fillStyle = '#08070c';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(cx - sw / k / 2), Math.round(cy - sh / k / 2), sw / k, sh / k, 0, 0, sw, sh);
};
const args = decodeURIComponent(location.hash.slice(1)).split(':');
if (mode === 'close') crop(Number(args[1]), Number(args[2]), 1200, 840, Number(args[3] ?? 2));
(window as unknown as { __ready: boolean }).__ready = true;
