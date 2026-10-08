// Dev page: the dungeon's floor and walls (art/ground.ts) and what stands in it (art/props.ts), as a
// room with figures in it.
//   node tools/preview.mjs src/dev/preview_ground.ts shots/art/ground.png 600 400
//   hash = <scale>[:dark]   scale = screen pixels per game pixel (default 4); "dark" lays the
//   dungeon's darkness over it with a pool of light round the knight, as the game does
import { makeBestiary } from '../art/bestiary';
import { makeGroundArt } from '../art/ground';
import { makeWarriorArt } from '../art/hero_warrior';
import { makeDungeonProps } from '../art/props';
import { WALL_H } from '../engine/iso';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { hash } from '../art/kit';

const [scaleArg = '', mode = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
const ground = makeGroundArt();
const props = makeDungeonProps();
const beasts = makeBestiary();
const knight = makeWarriorArt({ twoHanded: false });

/** The room: 0 floor, 1 wall. Walls all round, a stub of wall inside, a doorway in the far wall. */
const N = 11;
const wall = (tx: number, ty: number): boolean => {
  if (tx < 0 || ty < 0 || tx >= N || ty >= N) return false;
  if (tx === 0 && ty >= 4 && ty <= 5) return false; // a doorway
  if (tx === 0 || ty === 0 || tx === N - 1 || ty === N - 1) return true;
  if (tx === 6 && ty >= 2 && ty <= 4) return true; // a stub of wall inside the room
  return false;
};
const inside = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < N && ty < N && !wall(tx, ty);
/** A wall is cut down low when floor lies behind it (up the screen), as the game does it. */
const low = (tx: number, ty: number): boolean => inside(tx - 1, ty) || inside(tx, ty - 1) || inside(tx - 1, ty - 1);

const PAD = 10;
const GW = N * 32 + PAD * 2;
const GH = WALL_H + N * 16 + PAD * 2 + 8;
const cv = document.createElement('canvas');
cv.width = GW * S;
cv.height = GH * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${cv.width}px`;
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
g.fillStyle = '#000';
g.fillRect(0, 0, GW, GH);

const ox = PAD + (N - 1) * 16 + 16;
const oy = PAD + WALL_H;
const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
const draw = (s: Sprite, x: number, y: number): void => {
  g.drawImage(s.img, x - s.ax, y - s.ay, s.w, s.h);
};

interface Stand {
  d: number;
  s: Sprite;
  x: number;
  y: number;
  figure: boolean;
  lit?: boolean;
}
const stands: Stand[] = [];
for (let s = 0; s <= 2 * (N - 1); s++) {
  for (let tx = 0; tx < N; tx++) {
    const ty = s - tx;
    if (ty < 0 || ty >= N) continue;
    const [x, y] = at(tx, ty);
    const v = Math.floor(hash(tx, ty, 9) * 256);
    if (wall(tx, ty)) {
      const list = low(tx, ty) ? ground.wallsLow : ground.wallsTall;
      stands.push({ d: s + 1, s: list[v % list.length], x, y, figure: false });
    } else {
      draw(ground.floor(tx, ty), x, y);
      // the shadow of a wall that stands over it (render.ts does the same)
      const wl = wall(tx - 1, ty);
      const wr = wall(tx, ty - 1);
      if (wl) draw(ground.shadeLeft, x, y);
      if (wr) draw(ground.shadeRight, x, y);
      if (!wl && !wr && wall(tx - 1, ty - 1)) draw(ground.shadeCorner, x, y);
    }
  }
}
const who: [Sprite, number, number][] = [
  [knight.front.idle[0], 5.5, 6.5],
  [beasts.of('skeleton').front.idle[0], 3.5, 3.5],
  [beasts.of('cultist').front.idle[0], 8.6, 3.8],
  [beasts.of('brute').front.idle[0], 8.2, 7.2],
  [beasts.of('archer').back.idle[0], 6.6, 8.7],
  [beasts.of('bat').front.idle[0], 4.5, 1.6],
];
for (const [s, x, y] of who) {
  const [px, py] = at(x, y);
  stands.push({ d: x + y, s, x: px, y: py, figure: true });
}
// what lies on the floor, and what stands on it
const flat: [Sprite, number, number][] = [
  [props.bones[0], 3.6, 6.4],
  [props.rubble[1], 7.5, 5.6],
  [props.bones[2], 8.6, 8.8],
  [props.staves[0], 2.4, 5.2],
];
for (const [s, x, y] of flat) draw(s, ...at(x, y));
const things: [Sprite, number, number][] = [
  [props.brazier[0], 1.5, 1.5],
  [props.brazier[2], 9.5, 9.5],
  [props.pillar, 3.5, 7.5],
  [props.chest, 8.4, 1.6],
  [props.barrel, 1.5, 7.4],
  [props.barrel, 1.6, 8.5],
  [props.urn, 2.5, 9.3],
  [props.urn, 9.3, 5.5],
  [props.portal[0], 4.5, 9.4],
  [props.pillar, 7.5, 6.5],
];
for (const [s, x, y] of things) {
  const [px, py] = at(x, y);
  stands.push({ d: x + y, s, x: px, y: py, figure: false, lit: true });
}
stands.sort((a, b) => a.d - b.d);
for (const st of stands) {
  if (st.figure) {
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.beginPath();
    g.ellipse(st.x, st.y, 7, 3, 0, 0, Math.PI * 2);
    g.fill();
    drawAura(g, st.s, st.x, st.y);
  }
  draw(st.s, st.x, st.y);
}
if (mode === 'dark') {
  // the dungeon's darkness, with a pool of light round the knight (render.ts: light)
  const d = document.createElement('canvas');
  d.width = GW;
  d.height = GH;
  const dg = d.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = 'rgba(6,4,14,0.8)';
  dg.fillRect(0, 0, GW, GH);
  dg.globalCompositeOperation = 'destination-out';
  const [hx, hy] = at(5.5, 6.5);
  const r = 165;
  const grd = dg.createRadialGradient(0, 0, 0, 0, 0, 64);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.7)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  dg.save();
  dg.translate(hx, hy - 8);
  dg.scale(r / 64, (r * 0.62) / 64);
  dg.fillStyle = grd;
  dg.fillRect(-64, -64, 128, 128);
  dg.restore();
  g.imageSmoothingEnabled = true;
  g.drawImage(d, 0, 0);
  g.imageSmoothingEnabled = false;
}
for (const st of stands) if (st.figure || st.lit) drawLights(g, st.s, st.x, st.y);
(window as unknown as { __ready: boolean }).__ready = true;
