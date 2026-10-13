// Dev page: THE OVERSEERS' REDOUBT'S LAST ROOM, as one phone screen of the game, in the real art: the
// redoubt's floor and walls as the game paints a dungeon's (art/redoubt.ts, its Theme through
// art/ground.ts), the walls stood as the game stands them (render/walls.ts: a wall is its faces, the
// near ones cut away), the half-cut obelisk in the cult's ring of magic, its braziers and hangings.
// Nothing of the game imports it. The planning chat's mock-up he said yes to by 10:19 on 13 Oct is
// src/dev/preview_act1.ts, hash `holdin`.
//   node tools/preview.mjs src/dev/preview_holdin.ts shots/hold_in.png 1014 468

import { quarryPieces } from '../art/floor6';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { redoubtGround, redoubtPieces } from '../art/redoubt';
import { pictureOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { FACE_LEFT, FACE_RIGHT, wallFaces } from '../render/walls';
import { THEME } from '../ui/ui';
import { PH, PW, drawAt } from './act1_stage';

const pieceOf = (name: string, frame = 0): Sprite => {
  const pc = [...redoubtPieces(), ...quarryPieces()].find((q) => q.name === name);
  if (!pc) throw new Error(`no piece ${name}`);
  return (pc.frames ?? pc.left ?? [])[frame];
};

// THE ROOM: a hall 12 tiles by 8, walled round
const W = 32;
const H = 28;
const X0 = 9;
const Y0 = 9;
const X1 = 23;
const Y1 = 19;
const tiles = new Uint8Array(W * H);
for (let y = Y0 - 1; y <= Y1; y++) for (let x = X0 - 1; x <= X1; x++) tiles[y * W + x] = x >= X0 && x < X1 && y >= Y0 && y < Y1 ? T_FLOOR : T_WALL;
const variant = new Uint8Array(W * H).map((_v, i) => (i * 2654435761) >>> 24);
const floor = { depth: 6, seed: 6, w: W, h: H, tiles, variant, rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const ground = redoubtGround();

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
const [cxp, cyp] = pictureOf(15.4, 14.6);
const VX = cxp - PW / 2;
const VY = cyp - PH / 2 - 10;
const screen = (x: number, y: number): [number, number] => {
  const [sx, sy] = pictureOf(x, y);
  return [sx - VX, sy - VY];
};

g.fillStyle = '#07060c';
g.fillRect(0, 0, PW, PH);
const isWall = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && tiles[y * W + x] === T_WALL;
// the floor, and the shade of a wall over it, and the line of light where it ends toward the eye
for (let y = Y0; y < Y1; y++) {
  for (let x = X0; x < X1; x++) {
    const [sx, sy] = screen(x, y);
    drawAt(g, ground.floor(x, y), sx, sy);
    const wl = isWall(x - 1, y);
    const wr = isWall(x, y - 1);
    if (wl) drawAt(g, ground.shadeLeft, sx, sy);
    if (wr) drawAt(g, ground.shadeRight, sx, sy);
    if (!wl && !wr && isWall(x - 1, y - 1)) drawAt(g, ground.shadeCorner, sx, sy);
    if (isWall(x + 1, y) && x + 1 === X1) drawAt(g, ground.edgeRight, sx, sy);
    if (isWall(x, y + 1) && y + 1 === Y1) drawAt(g, ground.edgeLeft, sx, sy);
  }
}
// the cult's ring, on the floor
const RING = { x: 15.6, y: 13.3 };
{
  const [sx, sy] = screen(RING.x, RING.y);
  drawAt(g, pieceOf("the cult's ring of magic", 1), sx, sy);
}

interface Stood { d: number; sp: Sprite; x: number; y: number; lights?: boolean }
const stood: Stood[] = [];
const standAt = (wx: number, wy: number, sp: Sprite): void => {
  const [sx, sy] = screen(wx, wy);
  stood.push({ d: wx + wy, sp, x: sx, y: sy });
};
// the walls: only the back ones, as the game stands them (the near ones are cut away)
for (let y = Y0 - 1; y <= Y1; y++) {
  for (let x = X0 - 1; x <= X1; x++) {
    if (!isWall(x, y)) continue;
    if (x >= X0 && y >= Y0) continue; // a near wall: cut away
    const idx = y * W + x;
    const which = wallFaces(floor, idx);
    const [sx, sy] = screen(x, y);
    const n = ground.faceLeft.length;
    if (which & FACE_LEFT) stood.push({ d: x + y + 1, sp: ground.faceLeft[variant[idx] % n], x: sx, y: sy });
    if (which & FACE_RIGHT) stood.push({ d: x + y + 1, sp: ground.faceRight[variant[idx] % n], x: sx, y: sy });
    // the cult's hangings, every third face
    const hang = pieceOf("the cult's hanging");
    const hangR = ([...redoubtPieces()].find((q) => q.name === "the cult's hanging")!.right ?? [])[0];
    if (which & FACE_LEFT && x % 3 === 0) stood.push({ d: x + y + 1.01, sp: hang, x: sx - 16, y: sy + 24 });
    if (which & FACE_RIGHT && y % 3 === 1) stood.push({ d: x + y + 1.01, sp: hangR, x: sx + 16, y: sy + 24 });
  }
}
// what stands in the room
standAt(15.4, 12.7, pieceOf('the half-cut obelisk', 1));
standAt(10.0, 10.2, pieceOf("the cult's brazier", 0));
standAt(22.0, 10.2, pieceOf("the cult's brazier", 2));
standAt(10.0, 18.0, pieceOf("the cult's brazier", 1));
standAt(22.0, 17.8, pieceOf("the cult's brazier", 3));
standAt(11.6, 10.8, pieceOf('chippings', 1));
standAt(19.8, 16.2, pieceOf('splitting tools'));
standAt(21.0, 13.4, pieceOf('cut block', 0));
const HERO: [number, number] = [12.2, 16.6];
standAt(HERO[0], HERO[1], spriteOf3(MOVES3.rear, 0, 'front'));
stood.sort((a, b) => a.d - b.d);
for (const s of stood) drawAt(g, s.sp, s.x, s.y);
// the dark, as a dungeon's: the hero's pool of light, the room dimmer away from it, black beyond
{
  const [hx, hy] = screen(HERO[0], HERO[1]);
  const dark = g.createRadialGradient(hx, hy - 20, 70, hx, hy - 20, 620);
  dark.addColorStop(0, 'rgba(7, 6, 12, 0.08)');
  dark.addColorStop(0.5, 'rgba(7, 6, 12, 0.42)');
  dark.addColorStop(1, 'rgba(7, 6, 12, 0.7)');
  g.fillStyle = dark;
  g.fillRect(0, 0, PW, PH);
}
// the lights of the cult's fire, after the dark
g.save();
g.globalCompositeOperation = 'lighter';
for (const s of stood) {
  for (const L of s.sp.lights ?? []) {
    const x = s.x + (L.x - s.sp.ax) * 2;
    const y = s.y + (L.y - s.sp.ay) * 2;
    const r = L.r * 2;
    const gr = g.createRadialGradient(x, y, 1, x, y, r);
    const n = parseInt(L.color.slice(1, 7), 16);
    gr.addColorStop(0, `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${(L.a ?? 0.5) * 0.5})`);
    gr.addColorStop(1, `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0)`);
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}
{
  const ring = pieceOf("the cult's ring of magic", 1);
  const [sx, sy] = screen(RING.x, RING.y);
  for (const L of ring.lights ?? []) {
    const x = sx + (L.x - ring.ax) * 2;
    const y = sy + (L.y - ring.ay) * 2;
    const r = L.r * 2;
    const gr = g.createRadialGradient(x, y, 1, x, y, r);
    gr.addColorStop(0, `rgba(255, 79, 138, ${(L.a ?? 0.5) * 0.4})`);
    gr.addColorStop(1, 'rgba(255, 79, 138, 0)');
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}
g.restore();
g.save();
g.scale(2, 2);
drawText(g, "Overseers' Redoubt", 4, 3, THEME.text, { shadow: P.ink });
g.restore();
document.body.style.margin = '0';
document.body.style.background = '#0d1030';
document.body.appendChild(cvs);
(window as unknown as { __ready: boolean }).__ready = true;
