// Dev page: THE HEADSMAN'S YARD BUILT FROM ITS GAME-READY PIECES (art/yard.ts, behind YARD, off), laid tile by tile as the
// game lays a room: the backdrop, the tower, the wall a tile at a time, the floor a tile at a time, what stands, the figures;
// then the dark laid over it with holes where the lights are, as the renderer does (render.ts, light), a moonlit dark.
// Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_yard_game.ts shots/yard/game.png 1200 840 "overview"
//   node tools/preview.mjs src/dev/preview_yard_game.ts shots/yard/game_phone.png 1014 468 "phone"
import type { Sprite } from '../engine/px';
import { drawLights } from '../engine/px';
import { headsmanPieces } from '../art/floor2';
import type { Piece } from '../art/floorkit';
import { makeHeroArt3 } from '../art/heroes3';
import { makeHeadsman2Art } from '../art/headsman2_moves';
import { makeYardArt } from '../art/yard';

const [mode = 'overview', frameArg = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const F = Number(frameArg) || 0;
const Y = makeYardArt();
const N = 13;
const W = 1200;
const H = 840;
/** Where the yard's far corner (tile (0, 0)'s top corner) is, in game pixels. */
const OX = 300;
const OY = 165;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z / 2];
const HERO: [number, number] = mode === 'phone' ? [4.5, 8.1] : [7.6, 9.0];

const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#04040a';
g.fillRect(0, 0, W, H);
g.setTransform(2, 0, 0, 2, 0, 0);
const draw = (s: Sprite, x: number, y: number): void => {
  g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
};

// THE BACKDROP, then THE TOWER and THE WALL far to near
const [bx, by] = at(0, 0);
draw(Y.beyond, bx, by);
draw(Y.tower, ...at(0, 0));
const ARCH_AT = 3;
for (let s = 0; s < N; s++) {
  // (the wall along y, at x = -1, and the wall along x, at y = -1: each tile at its top corner's floor point)
  draw(Y.faceRight[(s * 3 + 1) % 4], ...at(-1, s));
  const left = s === ARCH_AT ? Y.arch[0] : s === ARCH_AT + 1 ? Y.arch[1] : Y.faceLeft[(s * 5 + 2) % 4];
  draw(left, ...at(s, -1));
}
// THE TORCHES on the wall: on a face turned to screen-left, at the foot of its middle; and on one turned to screen-right
const torch = Y.pieces.find((p) => p.name === "the yard's torch")!;
const torches: [number, number, boolean][] = [[1.5, 0, true], [5.5, 0, true], [7.5, 0, true], [0, 3.5, false], [0, 7.5, false], [0, 11.5, false]];
for (const [x, y, alongX] of torches) {
  const s = (alongX ? torch.left! : torch.right!)[F % 4];
  draw(s, ...at(x, y));
}
// THE FLOOR: the cobbles, and here and there a tile of the yard's laid in their place
const tile = (n: string): Sprite => Y.tiles.find((p) => p.name === n)!.frames![0];
const laid = new Map<string, Sprite>([
  ['11,11', tile('a little puddle')], ['8,11', tile('a puddle')],
  ['6,8', tile('yard sawdust')], ['5,8', tile('yard sawdust')], ['6,9', tile('yard sawdust')],
  ['3,1', tile('beaten earth')], ['3,2', tile('beaten earth')], ['4,2', tile('beaten earth')], ['4,3', tile('beaten earth')], ['9,3', tile('beaten earth')], ['10,3', tile('beaten earth')], ['11,2', tile('beaten earth')],
]);
for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
  const s = x === 0 ? tile('gutter along y') : laid.get(`${x},${y}`) ?? Y.floor(x, y);
  draw(s, ...at(x, y));
}
// WHAT LIES ON THE FLOOR: the wide puddles
for (const [n, x, y] of [['a wide puddle', 2.6, 6.0], ['a great puddle', 10.8, 6.6], ['a wide puddle', 4.6, 11.2]] as const) draw(Y.pieces.find((p) => p.name === n)!.frames![0], ...at(x, y));
// WHAT STANDS, far to near, and the figures
const own = headsmanPieces();
const P = (n: string): Piece => own.find((p) => p.name === n) ?? Y.pieces.find((p) => p.name === n)!;
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
interface Stand { d: number; s: Sprite; x: number; y: number; z: number; shadow: number }
const stands: Stand[] = [];
const put = (n: string, x: number, y: number, frame = 0, z = 0, d = x + y): void => {
  const p = P(n);
  stands.push({ d, s: p.frames![Math.min(frame, p.frames!.length - 1)], x, y, z, shadow: p.shadow ?? 0 });
};
put('the scaffold, draped', 6.5, 5.4, 0, 0, 10.4);
put('the long gallows', 10.5, 1.05);
put('the great bell', 1.6, 2.8);
put('sawdust barrel', 2.0, 1.2);
put('crate', 1.25, 1.15);
put('the stocks', 2.0, 9.0);
put('the gibbet', 1.1, 11.4);
put('the grindstone', 11.9, 3.9);
put('pail', 7.7, 8.2);
put('brazier of irons', 3.9, 8.7, F % 4);
put('brazier of irons', 10.1, 8.3, (F + 2) % 4);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const headsman = makeHeadsman2Art();
stands.push({ d: 10.41, s: headsman.front.idle[0], x: 6.7, y: 4.7, z: 40, shadow: 0.5 });
stands.push({ d: HERO[0] + HERO[1], s: hero.front.idle[0], x: HERO[0], y: HERO[1], z: 0, shadow: 0.36 });
stands.sort((a, b) => a.d - b.d);
for (const st of stands) {
  const [sx, sy] = at(st.x, st.y, st.z);
  if (st.shadow) {
    const w = st.shadow * 22.6 * 1.5;
    const hh = st.shadow * 11.3 * 1.5;
    g.save();
    g.imageSmoothingEnabled = true;
    g.globalAlpha = 0.7;
    g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
    g.restore();
  }
  draw(st.s, sx, sy);
}

// THE DARK, as the renderer lays it (render.ts, light): over everything, a hole cut by each light; under the open sky a moonlit
// dark, thinner than the Crypt's (the main chat's to set)
const dark = document.createElement('canvas');
dark.width = W / 2;
dark.height = H / 2;
const dg = dark.getContext('2d') as CanvasRenderingContext2D;
dg.fillStyle = 'rgba(6,4,14,0.42)';
dg.fillRect(0, 0, W / 2, H / 2);
dg.globalCompositeOperation = 'destination-out';
const pool = document.createElement('canvas');
pool.width = 128;
pool.height = 128;
{
  const q = pool.getContext('2d') as CanvasRenderingContext2D;
  const grd = q.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.7)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  q.fillStyle = grd;
  q.fillRect(0, 0, 128, 128);
}
const spot = (x: number, y: number, r: number, strength: number): void => {
  dg.globalAlpha = Math.min(1, strength);
  dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
};
const [hx, hy] = at(HERO[0], HERO[1]);
spot(hx, hy - 8, 165, 1);
for (const [x, y] of [[3.9, 8.7], [10.1, 8.3]]) {
  const [px, py] = at(x, y);
  spot(px, py - 14, 62, 0.9);
}
for (const [x, y] of torches) {
  const [px, py] = at(x, y, 92);
  spot(px, py + 10, 48, 0.85);
}
g.setTransform(1, 0, 0, 1, 0, 0);
g.drawImage(dark, 0, 0, W, H);
// (what gives off light, drawn again over the dark: the torches' and the braziers' fire)
g.setTransform(2, 0, 0, 2, 0, 0);
for (const [x, y, alongX] of torches) {
  const s = (alongX ? torch.left! : torch.right!)[F % 4];
  const [px, py] = at(x, y);
  drawLights(g, s, Math.round(px), Math.round(py));
}
for (const st of stands) {
  const [sx, sy] = at(st.x, st.y, st.z);
  drawLights(g, st.s, Math.round(sx), Math.round(sy));
}
g.setTransform(1, 0, 0, 1, 0, 0);

if (mode === 'phone') {
  const sw = 1014;
  const sh = 468;
  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cv, 0, 0);
  cv.width = sw;
  cv.height = sh;
  const g2 = cv.getContext('2d') as CanvasRenderingContext2D;
  g2.imageSmoothingEnabled = false;
  g2.fillStyle = '#04040a';
  g2.fillRect(0, 0, sw, sh);
  g2.drawImage(src, Math.round(sw / 2 - hx * 2), Math.round(sh / 2 - hy * 2));
}
(window as unknown as { __ready: boolean }).__ready = true;
