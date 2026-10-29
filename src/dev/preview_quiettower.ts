// Dev page: FLOOR 20, THE QUIET TOWER, BUILT FROM ITS GAME-READY PARTS: its ground painted by the game's painter in the
// tower's looks (art/quiettower.ts) from two stretches laid by hand (dev/tower_level.ts), its pieces (art/floor20.ts) set
// on them as the game sets them (dev/tower_lay.ts), far to near, with the knight. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_quiettower.ts shots/tower/game_top.png 1200 840 "top"
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_quiettower.ts shots/tower/game_top_phone.png 1014 468 "top-phone"
//     top            the Tower Top, the Moth's floor, round the hero
//     top-phone      one phone screen of it, the camera on the hero (507 x 234 game pixels)
//     inside         the tower's inside, four rooms (2000 x 1150), the dungeon's dark left off
//     inside-phone   one phone screen in the scriptorium, the camera on the hero, the dungeon's dark as the game lays it
//     inside-belfry, inside-fog, inside-stair   one phone screen in each of the other rooms, the dark as the game lays it
//     ...-tiles      (top-tiles, inside-tiles) the tiles the game walks by drawn over it
//     close:X:Y      (top-close, inside-close) four times as big round picture pixel X, Y of the overview
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { paintQuietTower, quietTowerTerrain, towerTopTerrain } from '../art/quiettower';
import { pictureOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import { IN_HERO, TOP_HERO, insideFloor, insideLand, topFloor, topLand } from './tower_level';
import { layInside, layTop, shadowOf, spriteOf } from './tower_lay';
import type { Laid } from './tower_lay';

const [mode = 'top', cxArg = '600', cyArg = '400'] = decodeURIComponent(location.hash.slice(1)).split(':');
const inside = mode.startsWith('inside');
const W = mode === 'inside' || mode === 'inside-tiles' ? 2000 : 1200;
const H = mode === 'inside' || mode === 'inside-tiles' ? 1150 : 840;
const floor: Floor = inside ? insideFloor() : topFloor();
const T: Terrain = inside ? quietTowerTerrain(floor, insideLand()) : towerTopTerrain(floor, topLand());
const ROOM_AT: Record<string, readonly [number, number]> = { 'inside-belfry': [24.0, 11.6], 'inside-fog': [11.0, 23.6], 'inside-stair': [25.4, 24.6] };
const hero: readonly [number, number] = ROOM_AT[mode] ?? (inside ? IN_HERO : TOP_HERO);
const [hx, hy] = mode === 'inside' || mode === 'inside-tiles' ? pictureOf(17.5, 16.5) : pictureOf(hero[0], hero[1]);
/** The picture's top left in the world's picture: the hero a little below the middle. */
const VX = Math.round(hx - W / 2);
const VY = Math.round(hy - H / 2 - (mode === 'inside' || mode === 'inside-tiles' ? 0 : 40));

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
    const p = paintQuietTower(T, VX + px, VY + py, pw, ph);
    g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
  }
}
if (mode.endsWith('-tiles')) {
  g.lineWidth = 1;
  g.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  for (let ty = 0; ty < floor.h; ty++) {
    for (let tx = 0; tx < floor.w; tx++) {
      if (floor.tiles[ty * floor.w + tx] !== T_FLOOR) continue;
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
const drawAt = (s: Sprite, x: number, y: number, shadow: number): void => {
  const [px, py] = pictureOf(x, y);
  const sx = (px - VX) / 2;
  const sy = (py - VY) / 2;
  g.setTransform(2, 0, 0, 2, 0, 0);
  if (shadow) {
    const w = shadow * 22.6 * 1.5;
    const hh = shadow * 11.3 * 1.5;
    g.save();
    g.imageSmoothingEnabled = true;
    g.globalAlpha = 0.6;
    g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
    g.restore();
  }
  g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy) - s.ay, s.w, s.h);
  g.setTransform(1, 0, 0, 1, 0, 0);
};
const laid: Laid[] = inside ? layInside() : layTop();
// what hangs on the walls first; then what lies on the floor; then what stands, far to near, the hero among it
for (const l of laid) if (l.on) drawAt(spriteOf(l)!, l.x, l.y, 0);
const knight = makeHeroArt3().of('warrior', { twoHanded: false }).front.idle[0];
type Thing = { d: number; draw: () => void };
const things: Thing[] = [];
for (const l of laid) if (!l.on) things.push({ d: l.flat ? -1e6 + l.x + l.y : l.x + l.y, draw: () => drawAt(spriteOf(l)!, l.x, l.y, shadowOf(l)) });
things.push({ d: hero[0] + hero[1], draw: () => drawAt(knight, hero[0], hero[1], 0.36) });
things.sort((a, b) => a.d - b.d);
for (const t of things) t.draw();

/** Where each light of what is laid is on the picture, its reach and strength. */
const lights = laid.flatMap((l) => {
  const sp = spriteOf(l);
  if (!sp || !sp.lights) return [];
  const [px, py] = pictureOf(l.x, l.y);
  const d = sp.density ?? 1;
  return sp.lights.map((L) => ({ x: px - VX - sp.ax * d + L.x * d, y: py - VY - sp.ay * d + L.y * d, r: L.r * d, a: L.a ?? 0.5, color: L.color }));
});
/** THE DUNGEON'S DARK as the game lays it (render.ts: FAR_DARK 0.88 over all, the hero's pools taken out of it, the lights', the vignette). */
function dark(): void {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const d = c.getContext('2d') as CanvasRenderingContext2D;
  d.fillStyle = 'rgba(6,4,14,0.88)';
  d.fillRect(0, 0, W, H);
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
  const [ex, ey] = pictureOf(hero[0], hero[1]);
  spot(ex - VX, ey - VY - 16, 760, 0.36);
  spot(ex - VX, ey - VY - 16, 330, 1);
  for (const L of lights) spot(L.x, L.y, L.r * 1.3, Math.min(0.9, L.a * 1.4));
  g.drawImage(c, 0, 0);
  const grd = g.createRadialGradient(W / 2, H / 2, (0.5 * Math.hypot(W, H)) / 2 / Math.SQRT2, W / 2, H / 2, Math.hypot(W, H) / 2);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.62)');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
}
/** The lights' glow (the candles' honest flame, the last chapter's own pale light). */
function glow(): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of lights) {
    const grd = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    grd.addColorStop(0, L.color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = L.a * 0.5;
    g.fillStyle = grd;
    g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
  }
  g.restore();
}
if (inside && mode !== 'inside' && mode !== 'inside-tiles' && mode !== 'inside-close') {
  dark();
  glow();
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
  g2.fillStyle = '#07080c';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(cx - sw / k / 2), Math.round(cy - sh / k / 2), sw / k, sh / k, 0, 0, sw, sh);
};
if (mode.endsWith('-phone') || ROOM_AT[mode]) crop(W / 2, H / 2 + 20, 1014, 468, 1);
else if (mode.endsWith('-close')) crop(Number(cxArg), Number(cyArg), 1014, 468, 4);
(window as unknown as { __ready: boolean }).__ready = true;
