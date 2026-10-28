// Dev page: FLOOR 16, THE SWAN GARDENS, BUILT FROM ITS GAME-READY PARTS: its ground painted by the game's painter in the
// gardens' look (art/swangardens.ts) from a level laid by hand (dev/swan_level.ts), its pieces (art/floor16.ts) set on it
// as the game sets them, far to near, with the knight on the lake walk. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_swangardens.ts shots/swans/game.png 1200 840 "overview"
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_swangardens.ts shots/swans/game_phone.png 1014 468 "phone"
//   ... "tiles" (the tiles drawn over it), "close:X:Y" (four times as big round picture pixel X, Y of the overview)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { paintSwanGardens, swanGardensTerrain } from '../art/swangardens';
import { pictureOf } from '../art/terrain';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR } from '../game/types';
import { L_HERO, L_SWANS, swanFloor, swanLand } from './swan_level';
import { swanSprite } from './garden_paint';
import { LAKE_DOWN } from '../art/swangardens';
import { laySwanPieces } from './swan_lay';

const [mode = 'overview', cxArg = '600', cyArg = '400'] = decodeURIComponent(location.hash.slice(1)).split(':');
const W = 1200;
const H = 840;
const floor = swanFloor();
const T = swanGardensTerrain(floor, swanLand());
const [hx, hy] = pictureOf(L_HERO[0], L_HERO[1]);
/** The picture's top left in the world's picture: the hero a little below the middle. */
const VX = Math.round(hx - W / 2);
const VY = Math.round(hy - H / 2 - 40);

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
    const p = paintSwanGardens(T, VX + px, VY + py, pw, ph);
    g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
  }
}
if (mode === 'tiles') {
  g.lineWidth = 1;
  for (let ty = 0; ty < floor.h; ty++) {
    for (let tx = 0; tx < floor.w; tx++) {
      const i = ty * floor.w + tx;
      if (floor.tiles[i] !== T_FLOOR) continue;
      const c = floor.cut ? floor.cut[i] : 0;
      const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
      const keep = c === CUT_FAR ? [1, 2, 3] : c === CUT_NEAR ? [0, 1, 3] : c === CUT_LEFT ? [0, 1, 2] : c === CUT_RIGHT ? [0, 2, 3] : [0, 1, 2, 3];
      g.strokeStyle = c ? 'rgba(255, 220, 90, 0.75)' : 'rgba(255, 255, 255, 0.3)';
      g.beginPath();
      keep.forEach((k, n) => {
        const [sx, sy] = pictureOf(pts[k][0], pts[k][1]);
        if (n) g.lineTo(sx - VX + 0.5, sy - VY + 0.5);
        else g.moveTo(sx - VX + 0.5, sy - VY + 0.5);
      });
      g.closePath();
      g.stroke();
    }
  }
}

/** THE SOFT SHADOW the game draws under what stands (render.ts): a soft oval, darkest under it, gone at its rim. */
const blot = ((): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = q.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.4, 'rgba(0,0,0,0.85)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  q.fillStyle = grd;
  q.fillRect(0, 0, 64, 64);
  return c;
})();
interface Stand { d: number; s: Sprite; x: number; y: number; shadow: number; under?: boolean; flip?: boolean; name?: string }
const stands: Stand[] = laySwanPieces();
// THE SWANS (the first look's, not yet made enemies): on the lake, each with its likeness under it
for (const [x, y, f] of L_SWANS) {
  const sw = swanSprite(f);
  const s: Sprite = { img: sw.px.toCanvas(), w: sw.px.w, h: sw.px.h, ax: sw.ax, ay: sw.ay };
  stands.push({ d: x + y, s, x, y, shadow: 0, flip: true });
  stands.push({ d: x + y + 0.001, s, x, y, shadow: 0 });
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
stands.push({ d: L_HERO[0] + L_HERO[1], s: hero.front.idle[0], x: L_HERO[0], y: L_HERO[1], shadow: 0.36, name: 'hero' } as Stand & { name: string });
// (what lies on the floor first, then what stands, far to near)
stands.sort((a, b) => (a.under === b.under ? a.d - b.d : a.under ? -1 : 1));
for (const st of stands) {
  const [px, py] = pictureOf(st.x, st.y);
  const sx = (px - VX) / 2;
  const sy = (py - VY) / 2;
  g.setTransform(2, 0, 0, 2, 0, 0);
  if (st.shadow) {
    const w = st.shadow * 22.6 * 1.5;
    const hh = st.shadow * 11.3 * 1.5;
    g.save();
    g.imageSmoothingEnabled = true;
    g.globalAlpha = 0.6;
    g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
    g.restore();
  }
  if (st.flip) {
    // (a swan's likeness in the still water: upside down about its waterline, darker)
    const wy = Math.round(sy + LAKE_DOWN / 2);
    g.save();
    g.globalAlpha = 0.3;
    g.translate(Math.round(sx) - st.s.ax, wy);
    g.scale(1, -1);
    g.drawImage(st.s.img, 0, -st.s.ay, st.s.w, st.s.h);
    g.restore();
  } else {
    const dz = st.name ? 0 : LAKE_DOWN / 2;
    g.drawImage(st.s.img, Math.round(sx) - st.s.ax, Math.round(sy + dz) - st.s.ay, st.s.w, st.s.h);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
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
  g2.fillStyle = '#07080d';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(cx - sw / k / 2), Math.round(cy - sh / k / 2), sw / k, sh / k, 0, 0, sw, sh);
};
if (mode === 'phone') crop(W / 2, H / 2 + 20, 1014, 468, 1);
else if (mode === 'close') crop(Number(cxArg), Number(cyArg), 1014, 468, 4);
(window as unknown as { __ready: boolean }).__ready = true;
