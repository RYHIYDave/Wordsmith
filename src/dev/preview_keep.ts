// Dev page: FLOOR 19, THE KEEP, BUILT FROM ITS GAME-READY PARTS: its ground painted by the game's painter in the Keep's
// look (art/keep.ts) from a corner laid by hand (dev/keep_level.ts), its pieces (art/floor19.ts) set on it as the game sets
// them (dev/keep_lay.ts), far to near, their fires' light, the dungeon's dark as the game lays it, the knight in the
// throne hall. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_keep.ts shots/keep/game_phone.png 1014 468 "phone"
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_keep.ts shots/keep/game.png 1200 840 "overview"
//     phone: one phone screen, the camera on the knight, the game's dark and the fires' light; overview: the middle of the
//     corner, no dark (1200 x 840)
//   ... "whole" (2400 x 1500: the whole corner, no dark), "bare" (the overview, the ground alone), "tiles" (the tiles drawn
//   over it), "rooms" (each room's ground and walls close, in a grid: 1200 x 840), "at:X:Y" (the overview's frame round
//   tile X, Y), "dark" (the overview with the game's dark)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { keepTerrain, paintKeepGround } from '../art/keep';
import { pictureOf } from '../art/terrain';
import { T_FLOOR } from '../game/types';
import { drawText } from '../engine/font';
import { P } from '../art/palette';
import { THEME } from '../ui/ui';
import { K_HERO, KH, KW, keepLevel } from './keep_level';
import { layKeepPieces } from './keep_lay';
import type { Laid } from './keep_lay';

const [mode = 'overview', aArg = '', bArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const PW = mode === 'phone' ? 1014 : mode === 'whole' ? 2400 : 1200;
const PH = mode === 'phone' ? 468 : mode === 'whole' ? 1500 : 840;
const { floor, zone } = keepLevel();
const T = keepTerrain(floor, { zone: (tx, ty) => zone[ty * KW + tx] });

let VX = 0;
let VY = 0;
function camOn(x: number, y: number, up = 0): void {
  const [cx, cy] = pictureOf(x, y);
  VX = Math.round(cx - PW / 2);
  VY = Math.round(cy - PH / 2 - up);
}

const cv = document.createElement('canvas');
cv.width = PW;
cv.height = PH;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#07080d';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

function paintGround(x0: number, y0: number, w: number, h: number, dx = 0, dy = 0): void {
  const PIECE = 256;
  for (let py = 0; py < h; py += PIECE) {
    for (let px = 0; px < w; px += PIECE) {
      const pw = Math.min(PIECE, w - px);
      const ph = Math.min(PIECE, h - py);
      const p = paintKeepGround(T, x0 + px, y0 + py, pw, ph);
      g.putImageData(new ImageData(p.rgba, pw, ph), dx + px, dy + py);
    }
  }
}

function drawTiles(): void {
  g.lineWidth = 1;
  for (let ty = 0; ty < KH; ty++) {
    for (let tx = 0; tx < KW; tx++) {
      if (floor.tiles[ty * KW + tx] !== T_FLOOR) continue;
      g.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      g.beginPath();
      ([[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]] as const).forEach(([x, y], n) => {
        const [sx, sy] = pictureOf(x, y);
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
/** Draw what is laid: on a wall's face at its foot, flat on the floor, or standing with its soft shadow. */
function drawLaid(l: Laid): void {
  const [px, py] = pictureOf(l.x, l.y);
  const sx = (px - VX) / 2;
  const sy = (py - VY) / 2;
  g.setTransform(2, 0, 0, 2, 0, 0);
  if (l.shadow) {
    const w = l.shadow * 22.6 * 1.5;
    const hh = l.shadow * 11.3 * 1.5;
    g.save();
    g.imageSmoothingEnabled = true;
    g.globalAlpha = 0.6;
    g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
    g.restore();
  }
  g.drawImage(l.s.img, Math.round(sx) - l.s.ax, Math.round(sy) - l.s.ay, l.s.w, l.s.h);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
/** Where each light of what is laid falls on the screen. */
function lightsOf(laid: readonly Laid[]): { x: number; y: number; r: number; a: number; color: string }[] {
  const out: { x: number; y: number; r: number; a: number; color: string }[] = [];
  for (const l of laid) {
    if (!l.s.lights) continue;
    const [px, py] = pictureOf(l.x, l.y);
    const d = l.s.density ?? 1;
    for (const L of l.s.lights) out.push({ x: px - VX - l.s.ax * 2 + L.x * 2, y: py - VY - l.s.ay * 2 + L.y * 2, r: L.r * 2, a: L.a ?? 0.5, color: L.color });
    void d;
  }
  return out;
}
/** THE DUNGEON'S DARK as the game lays it (render.ts: FAR_DARK 0.88 over all, the hero's pools and each fire's taken out of it, the vignette). */
function dark(hero: readonly [number, number], ls: ReturnType<typeof lightsOf>): void {
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const d = c.getContext('2d') as CanvasRenderingContext2D;
  d.fillStyle = 'rgba(6,4,14,0.88)';
  d.fillRect(0, 0, PW, PH);
  d.globalCompositeOperation = 'destination-out';
  const spot = (x: number, y: number, r: number, strength: number): void => {
    d.save();
    d.translate(x, y);
    d.scale(1, 0.62);
    const grd = d.createRadialGradient(0, 0, 0, 0, 0, r);
    grd.addColorStop(0, `rgba(0,0,0,${strength})`);
    grd.addColorStop(0.5, `rgba(0,0,0,${0.7 * strength})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = grd;
    d.fillRect(-r, -r, 2 * r, 2 * r);
    d.restore();
  };
  const [hx0, hy0] = pictureOf(hero[0], hero[1]);
  spot(hx0 - VX, hy0 - VY - 16, 380 * 2, 0.36);
  spot(hx0 - VX, hy0 - VY - 16, 165 * 2, 1);
  for (const L of ls) spot(L.x, L.y, L.r * 1.3, Math.min(0.9, L.a * 1.4));
  g.drawImage(c, 0, 0);
  const grd = g.createRadialGradient(PW / 2, PH / 2, (0.5 * Math.hypot(PW, PH)) / 2 / Math.SQRT2, PW / 2, PH / 2, Math.hypot(PW, PH) / 2);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.62)');
  g.fillStyle = grd;
  g.fillRect(0, 0, PW, PH);
}
function glow(ls: ReturnType<typeof lightsOf>): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of ls) {
    const grd = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    grd.addColorStop(0, L.color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = L.a * 0.5;
    g.fillStyle = grd;
    g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
  }
  g.restore();
}
function nameAndMap(hero: readonly [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, 'The Keep', 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
}

function scene(hero: readonly [number, number], opts: { pieces: boolean; dark: boolean; tiles?: boolean }): void {
  paintGround(VX, VY, PW, PH);
  if (opts.tiles) drawTiles();
  const laid: Laid[] = opts.pieces ? layKeepPieces() : [];
  // what is on the walls, then what lies on the floor, then what stands and who, far to near
  const knight = makeHeroArt3().of('warrior', { twoHanded: false }).front.idle[0];
  const all: Laid[] = [...laid, { d: hero[0] + hero[1], s: knight as Sprite, x: hero[0], y: hero[1], shadow: 0.36, name: 'hero' }];
  const order = (l: Laid): number => (l.wall ? 0 : l.under ? 1 : 2);
  all.sort((a, b) => order(a) - order(b) || a.d - b.d);
  for (const l of all) drawLaid(l);
  const ls = lightsOf(laid);
  if (opts.dark) {
    dark(hero, ls);
    glow(ls);
    nameAndMap(hero);
  }
}

if (mode === 'rooms') {
  // EACH ROOM CLOSE: its floor and the walls round it, the ground alone, twice as big
  const spots: [string, number, number][] = [
    ['The throne hall', 20, 11],
    ['The wall walk', 14, 4.5],
    ['The bailey', 14, 32],
    ['The gate passage', 33, 34],
    ['The barracks', 37, 12],
    ['The armoury', 8, 12],
    ['The bedchamber', 3.5, 32],
    ['The gallery', 30, 24.5],
  ];
  const cw = 291;
  const ch = 400;
  g.fillStyle = '#07080d';
  g.fillRect(0, 0, PW, PH);
  spots.forEach(([name, x, y], n) => {
    const w = Math.floor(cw / 2);
    const h = (ch - 20) / 2;
    const [sx, sy] = pictureOf(x, y);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const p = paintKeepGround(T, Math.round(sx - w / 2), Math.round(sy - h / 2 - 30), w, h);
    (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, w, h), 0, 0);
    const cx = (n % 4) * (cw + 12);
    const cy = Math.floor(n / 4) * (ch + 20) + 22;
    g.drawImage(c, cx, cy, w * 2, h * 2);
    g.save();
    g.scale(2, 2);
    drawText(g, name, cx / 2 + 2, (cy - 20) / 2, THEME.text, { shadow: P.ink });
    g.restore();
  });
} else {
  const hero = K_HERO;
  if (mode === 'at') camOn(Number(aArg), Number(bArg), 0);
  else if (mode === 'whole') camOn(23, 23, 40);
  else if (mode === 'phone') camOn(hero[0] - 1.2, hero[1] - 1.2, 10);
  else camOn(19, 19, 20);
  scene(hero, { pieces: mode !== 'bare' && mode !== 'tiles', dark: mode === 'phone' || mode === 'dark', tiles: mode === 'tiles' });
}
(window as unknown as { __ready: boolean }).__ready = true;
