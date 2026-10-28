// Dev page: THE HEADSMAN'S YARD, OUTDOORS (dev/yard_paint.ts), three looks for the owner to pick from. Nothing of the
// game imports it.
//   node tools/preview.mjs src/dev/preview_yard.ts shots/yard/dawn.png 1200 840 "overview:dawn"
//   node tools/preview.mjs src/dev/preview_yard.ts shots/yard/dawn_phone.png 1014 468 "phone:dawn"
//     overview  the whole yard, the knight and the Headsman in it (600 x 420 game pixels at two picture pixels each)
//     phone     one phone screen of it as the game would show it, the camera on the hero (507 x 234 game pixels)
//   look: dawn, night or storm
import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { drawLights } from '../engine/px';
import { Iso } from '../art/isokit';
import { hash } from '../art/kit';
import { headsmanPieces } from '../art/floor2';
import type { Piece } from '../art/floorkit';
import { SHINES } from '../art/floorkit';
import { makeHeroArt3 } from '../art/heroes3';
import { makeHeadsman2Art } from '../art/headsman2_moves';
import { HEADSMAN_AT, HERO_AT, LOOKS, N, PALS, SCAFFOLD, lamps, mixC, paintBeyond, paintGallows, paintGround, paintNearWalls, paintScaffold, paintSky, paintWalls, warm } from './yard_paint';
import type { Look } from './yard_paint';

const [mode = 'overview', lookArg = 'dawn'] = decodeURIComponent(location.hash.slice(1)).split(':');
/** Where the hero stands: for a phone screen, nearer the scaffold, so the screen (the camera on him) takes in the far walls. */
const HERO: [number, number] = mode === 'phone' ? [4.5, 8.1] : HERO_AT;
const look: Look = (LOOKS as string[]).includes(lookArg) ? (lookArg as Look) : 'dawn';
const P = PALS[look];

/** The whole picture in picture pixels, and where the floor's (0, 0) is on it. */
const W = 1200;
const H = 840;
const OX = 600;
const OY = 330;

// ---- the place, painted in layers: the back (sky, what is beyond, the wall, the ground), the gallows, the scaffold
const back = new Px(W, H);
paintSky(back, look, OY - 40);
const iso = new Iso(back, OX, OY);
// (below the yard on the near side, where the crag falls away: the dark that lies beyond everything, as the game's)
iso.top(0, 0, N + 40, N + 40, 0, () => P.beyond);
paintBeyond(iso, look);
paintWalls(iso, look);
paintGround(iso, look);
paintNearWalls(iso, look);

// THE TORCHES on the walls (night, and the storm's two by the arch): an iron bracket, the torch, its fire; the wall round it warmed
const onWall = (px: number, py: number): boolean => {
  const baseX = OY + (px - OX) / 2; // the foot of the wall along x, at this column
  const baseY = OY + (OX - px) / 2; // the foot of the wall along y
  return px >= OX ? py < baseX : py < baseY;
};
for (const l of lamps(look)) {
  if (l.z < 60) continue;
  const [fx, fy] = iso.at(l.x, l.y, l.z);
  const X = Math.round(fx);
  const Y = Math.round(fy);
  // (the wall round it, warmed in two bands)
  for (let dy = -40; dy <= 40; dy++) for (let dx = -52; dx <= 52; dx++) {
    const e = Math.hypot(dx / 52, (dy + 4) / 40) + (hash((X + dx) >> 1, (Y + dy) >> 1, 7) - 0.5) * 0.12;
    if (e > 1 || !onWall(X + dx, Y + dy)) continue;
    const c = back.get(X + dx, Y + dy);
    if (c) back.set(X + dx, Y + dy, warm(c, e < 0.5 ? 2 : 1));
  }
  // the bracket and the torch
  for (let k = 0; k < 4; k++) back.set(X - 1, Y + 6 + k, P.iron[1]).set(X, Y + 6 + k, P.iron[3]);
  for (let k = 0; k < 10; k++) back.set(X - 1, Y + k, P.timber[1]).set(X, Y + k, P.timber[3]).set(X + 1, Y + k, P.timber[2]);
  // its fire: tongues of an honest orange, white-yellow at its heart
  const flame = ['#7a2a14', '#c4521e', '#f08a2a', '#ffd070', '#fff0b0'];
  for (let dy = -14; dy <= 0; dy++) for (let dx = -4; dx <= 5; dx++) {
    const up = -dy;
    const wdt = 4.5 - up * 0.28 + Math.sin(up * 0.9 + X) * 0.8;
    if (Math.abs(dx - 0.5) > wdt) continue;
    const core = Math.abs(dx - 0.5) < wdt * 0.45 && up < 9;
    back.set(X + dx, Y + dy, core ? (up < 5 ? flame[4] : flame[3]) : up > 10 ? flame[1] : flame[2]);
  }
}
// THE DAWN'S MIST, low along the foot of the walls: the haze over every other pair of pixels, in drifts (off: it read as noise)
if (look === 'dawn' && location.hash.includes('mist')) {
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    if (((px >> 1) + (py >> 1)) % 2) continue;
    const dx = (px + 0.5 - OX) / 32;
    const dy = (py + 0.5 - OY) / 16;
    const wx = (dx + dy) / 2;
    const wy = (dy - dx) / 2;
    const near = Math.min(wx, wy);
    if (near < -0.8 || near > 1.3 || wx > N + 0.5 || wy > N + 0.5) continue;
    const drift = Math.sin((wx - wy) * 0.9) * 0.3 + 0.55;
    if (near > drift) continue;
    const c = back.get(px, py);
    if (c) back.set(px, py, mixC(c, P.haze, 0.4));
  }
}

const gallowsL = new Px(W, H);
paintGallows(new Iso(gallowsL, OX, OY), look);
const scaffoldL = new Px(W, H);
paintScaffold(new Iso(scaffoldL, OX, OY), look);

// ---- the pieces of the floor's own that stand in the yard, their colours brought into this light
const pieces = headsmanPieces();
const piece = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};
/** A colour of the Crypt's brought into the yard's light (fire is fire, and stays as it is). */
function graded(c: string): string {
  if (SHINES.has(c)) return c;
  const n = parseInt(c.slice(1), 16);
  let r = (n >> 16) & 255;
  let gr = (n >> 8) & 255;
  let b = n & 255;
  const l = 0.3 * r + 0.55 * gr + 0.15 * b;
  if (look === 'dawn') {
    r = l + (r - l) * 0.6 + 8;
    gr = l + (gr - l) * 0.6 + 6;
    b = l + (b - l) * 0.6 + 10;
  } else if (look === 'storm') {
    r = l + (r - l) * 0.4 - 4;
    gr = l + (gr - l) * 0.4 + 4;
    b = l + (b - l) * 0.4 + 2;
  } else {
    r *= 0.92;
    gr *= 0.94;
    b *= 1.0;
  }
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(gr)}${f(b)}`;
}
function gradeSprite(s: Sprite): Sprite {
  const c = document.createElement('canvas');
  c.width = s.img.width;
  c.height = s.img.height;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  q.drawImage(s.img, 0, 0);
  const im = q.getImageData(0, 0, c.width, c.height);
  const d = im.data;
  const memo = new Map<number, [number, number, number]>();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    let out = memo.get(key);
    if (!out) {
      const g2 = graded(`#${key.toString(16).padStart(6, '0')}`);
      const m = parseInt(g2.slice(1), 16);
      out = [(m >> 16) & 255, (m >> 8) & 255, m & 255];
      memo.set(key, out);
    }
    d[i] = out[0];
    d[i + 1] = out[1];
    d[i + 2] = out[2];
  }
  q.putImageData(im, 0, 0);
  return { ...s, img: c };
}

const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const headsman = makeHeadsman2Art();

// ---- the canvas: picture pixels, the pieces and figures drawn in game pixels (two to one)
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.drawImage(back.toCanvas(), 0, 0);

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
/** Where a point of the world is, in game pixels. */
const at = (x: number, y: number, z = 0): [number, number] => [(OX + (x - y) * 32) / 2, (OY + (x + y) * 16 - z) / 2];

interface Item { d: number; draw: () => void }
const items: Item[] = [];
const layer = (d: number, l: Px): void => {
  const c = l.toCanvas();
  items.push({ d, draw: () => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, 0, 0); } });
};
const stand = (d: number, s: Sprite, x: number, y: number, z = 0, shadow = 0): void => {
  items.push({
    d,
    draw: () => {
      g.setTransform(2, 0, 0, 2, 0, 0);
      const [sx, sy] = at(x, y, z);
      if (shadow) {
        const w = shadow * 22.6 * 1.5;
        const hh = shadow * 11.3 * 1.5;
        g.save();
        g.imageSmoothingEnabled = true;
        g.globalAlpha = 0.7;
        g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
        g.restore();
      }
      g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy) - s.ay, s.w, s.h);
      drawLights(g, s, Math.round(sx), Math.round(sy));
    },
  });
};
const fr = (n: string, k = 0): Sprite => gradeSprite(piece(n).frames![k]);
const sh = (n: string): number => piece(n).shadow ?? 0;

layer(9.0, gallowsL);
layer(11.5, scaffoldL);
const S = SCAFFOLD;
stand(11.52, fr('the block'), 6.0, 5.5, S.h, sh('the block'));
stand(11.53, fr('basket', 1), 6.55, 6.05, S.h, 0);
stand(11.51, headsman.front.idle[0], HEADSMAN_AT[0], HEADSMAN_AT[1], S.h, 0.5);
stand(4.4, fr('the great bell'), 1.6, 2.8, 0, sh('the great bell'));
stand(3.2, fr('sawdust barrel'), 2.0, 1.2, 0, sh('sawdust barrel'));
stand(2.4, fr('crate'), 1.25, 1.15, 0, sh('crate'));
stand(11.0, fr('the stocks'), 2.0, 9.0, 0, sh('the stocks'));
stand(12.5, fr('the gibbet'), 1.1, 11.4, 0, sh('the gibbet'));
stand(15.8, fr('the grindstone'), 11.9, 3.9, 0, sh('the grindstone'));
stand(15.8, fr('pail'), 7.7, 8.2, 0, sh('pail'));
if (look === 'night') {
  for (const l of lamps(look)) if (l.z < 60) stand(l.x + l.y, piece('brazier of irons').frames![0], l.x, l.y, 0, sh('brazier of irons'));
}
stand(HERO[0] + HERO[1], hero.front.idle[0], HERO[0], HERO[1], 0, 0.36);
items.sort((a, b) => a.d - b.d);
for (const it of items) it.draw();
g.setTransform(1, 0, 0, 1, 0, 0);

// THE STORM'S RAIN, over everything: short slanting streaks in pairs of pixels, a splash where some land
if (look === 'storm') {
  for (let i = 0; i < 520; i++) {
    const x = Math.floor(hash(i, 1, 201) * W) & ~1;
    const y = Math.floor(hash(i, 2, 201) * H) & ~1;
    const long = 3 + Math.floor(hash(i, 3, 201) * 4);
    g.fillStyle = hash(i, 4, 201) > 0.7 ? '#9aa8a8' : '#62706f';
    for (let k = 0; k < long; k++) g.fillRect(x - k * 2, y + k * 4, 2, 4);
  }
}

if (mode === 'phone') {
  // ONE PHONE SCREEN, the camera on the hero: 507 x 234 game pixels, drawn from the whole picture at two to one
  const [hx, hy] = at(HERO[0], HERO[1]);
  const sw = 1014;
  const shh = 468;
  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cv, 0, 0);
  cv.width = sw;
  cv.height = shh;
  const g2 = cv.getContext('2d') as CanvasRenderingContext2D;
  g2.imageSmoothingEnabled = false;
  g2.fillStyle = P.beyond;
  g2.fillRect(0, 0, sw, shh);
  g2.drawImage(src, Math.round(sw / 2 - hx * 2), Math.round(shh / 2 - hy * 2));
}
(window as unknown as { __ready: boolean }).__ready = true;
