// Dev page: FLOOR 14'S MOMENT, THE SCREEN FALLS (art/floor14_moments.ts), laid in a ward of the House of Quiet
// (art/housequiet.ts), the knight on the boards beside it. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_floor14_moments.ts shots/f14m.png 1100 560 still:<frame>[:<scale>]
//   node tools/page_gif.mjs src/dev/preview_floor14_moments.ts "film[:<scale>]" previews/floor14/screen.gif

import { HQ_ZONE, houseOfQuietLook } from '../art/housequiet';
import { houseOfQuietMoments } from '../art/floor14_moments';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import { drawAura, drawLights, drawSprite } from '../engine/px';
import type { Sprite } from '../engine/px';
import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'still';

// a ward's open boards
const W = 44;
const H = 24;
const FLOOR = { depth: 14, seed: 14, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const T = terrainOf(FLOOR, houseOfQuietLook({ floor: FLOOR, zone: () => HQ_ZONE.Ward }));
const ANCHOR: [number, number] = [22, 11];

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  win.__ready = true;
}
function label(s: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, s, x / 2, y / 2, THEME.text, { shadow: P.ink });
  g.restore();
}
const [M] = houseOfQuietMoments();
const S = Number(mode === 'film' ? parts[1] : parts[2]) || 2;
// the picture: S picture pixels to a canvas pixel... in game pixels (a picture pixel is half a game pixel)
const PW = 540;
const PH = 260;
cv.width = PW * S;
cv.height = PH * S + 40;
const ground = ((): HTMLCanvasElement => {
  const [cx, cy] = pictureOf(ANCHOR[0], ANCHOR[1]);
  const gw = PW * 2;
  const gh = PH * 2;
  const p = paintTerrain(T, Math.round(cx - gw / 2), Math.round(cy - gh / 2), gw, gh);
  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, gw, gh), 0, 0);
  return c;
})();
const KNIGHT: Sprite = spriteOf3(MOVES3.rear, 0, 'front');
function draw(sp: Sprite | null): void {
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  g.save();
  g.translate(0, 40);
  g.imageSmoothingEnabled = false;
  g.drawImage(ground, 0, 0, PW * S, PH * S);
  g.scale(S, S);
  // (the anchor, in game pixels, at the middle of the picture)
  const ox = PW / 2;
  const oy = PH / 2;
  if (sp) drawSprite(g, sp, ox, oy);
  // the knight on the boards beside it
  const [kx, ky] = pictureOf(ANCHOR[0] + 1.9, ANCHOR[1] + 1.0);
  const [ax0, ay0] = pictureOf(ANCHOR[0], ANCHOR[1]);
  drawAura(g, KNIGHT, ox + (kx - ax0) / 2, oy + (ky - ay0) / 2, 1);
  drawSprite(g, KNIGHT, ox + (kx - ax0) / 2, oy + (ky - ay0) / 2);
  drawLights(g, KNIGHT, ox + (kx - ax0) / 2, oy + (ky - ay0) / 2, 1);
  g.restore();
}

if (mode === 'still') {
  const f = Math.min(M.frames.length - 1, Number(parts[1]) || 0);
  draw(M.frames[f]);
  label(`Floor 14's moment, the screen falls: frame ${f} of ${M.frames.length}`, 10, 8);
  show();
} else {
  const lead = 15;
  const tail = 15;
  const N = lead + M.frames.length + tail;
  const frame = (i: number): void => {
    const k = i - lead;
    draw(k < 0 ? (M.before ?? [])[(i % 4)] ?? null : k < M.frames.length ? M.frames[k] : (M.after ?? [])[0] ?? null);
    label('Floor 14\'s moment: the screen falls', 10, 8);
  };
  frame(0);
  win.__frames = N;
  win.__tickMs = 1000 / 30;
  win.__frame = (i: number): string => {
    frame(i);
    return cv.toDataURL('image/png');
  };
  show();
}
