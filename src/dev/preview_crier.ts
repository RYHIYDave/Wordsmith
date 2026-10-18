// Dev page: FLOOR 11'S BOSS, THE CRIER (art/crier.ts, art/crier_moves.ts), on the flags of the Crier's Square
// (art/gateward.ts), beside the knight for size, at dusk. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_crier.ts shots/crier_sheet.png 1014 640 sheet[:<scale>]
//     standing, facing you and facing away, beside the knight
//   node tools/preview.mjs src/dev/preview_crier.ts shots/crier_pose.png 1014 640 pose:<move>:<seconds>[:<scale>]
//     one moment of a move, facing you and away

import { GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { CRIER_MOB } from '../art/crier_moves';
import { CR_OFF } from '../art/crier';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { canvasOf, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { P } from '../art/palette';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { GameView } from '../art/skin';
import { THEME } from '../ui/ui';

const [HASH, OFF] = decodeURIComponent(location.hash.slice(1)).split('|');
const parts = HASH.split(':');
// `|a,b`: leave those parts off
for (const k of (OFF ?? '').split(',').filter(Boolean)) CR_OFF[k] = true;
const mode = parts[0] || 'sheet';

// a patch of the Crier's Square to stand them on
const W = 30;
const H = 30;
const FLOOR = { depth: 11, seed: 11, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => GW_ZONE.Square };
const T = terrainOf(gateWardPaintFloor(LAND, 'open'), gateWardLook(LAND, 'open'));

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;

function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  (window as unknown as { __ready: boolean }).__ready = true;
}

/** The ground under a pane, `S` times, its middle on the square's middle. */
function groundPane(x: number, y: number, w: number, h: number, S: number): void {
  const [cx, cy] = pictureOf(15, 15);
  const gw = Math.ceil(w / S);
  const gh = Math.ceil(h / S);
  const p = paintTerrain(T, Math.round(cx - gw / 2), Math.round(cy - gh / 2), gw, gh);
  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, gw, gh), 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(c, x, y, gw * S, gh * S);
  // the dusk over it
  g.fillStyle = 'rgba(26,16,40,0.18)';
  g.fillRect(x, y, w, h);
}

const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite => toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');

/** A figure at (fx, fy), its floor point, `S` times: its shadow, its aura, itself, its lights. */
function figure(sp: Sprite, fx: number, fy: number, S: number, shadow: number): void {
  g.save();
  g.fillStyle = 'rgba(14,10,24,0.45)';
  g.beginPath();
  g.ellipse(fx, fy, shadow * S, shadow * 0.45 * S, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  drawAura(g, sp, fx, fy, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx - sp.ax * 2 * S), Math.round(fy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx, fy, 2 * S);
}

function label(s: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, s, x / 2, y / 2, THEME.text, { shadow: P.ink });
  g.restore();
}

if (mode === 'game') {
  // game: as a phone shows it (the game's size), on the square at dusk, the knight before him
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const grd = g.createRadialGradient(507, 234, 300, 507, 234, 600);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.3)');
  g.fillStyle = grd;
  g.fillRect(0, 0, cv.width, cv.height);
  figure(spOf(CRIER_MOB, 'stand', 0, 'front'), 560, 230, 1, CRIER_MOB.shadow);
  figure(KNIGHT(), 440, 300, 1, 9);
  label('The Crier, at the game\'s size', 10, 8);
  show();
} else if (mode === 'big') {
  // big:<move>:<seconds>:<scale>: facing you and away, big, on the ground
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 7;
  cv.width = 1014;
  cv.height = 700;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  groundPane(0, 0, cv.width, cv.height, S);
  const fy = cv.height - 40;
  figure(spOf(CRIER_MOB, which, t, 'front'), 260, fy, S, CRIER_MOB.shadow);
  figure(spOf(CRIER_MOB, which, t, 'back'), 760, fy, S, CRIER_MOB.shadow);
  show();
} else if (mode === 'sheet' || mode === 'pose') {
  const S = Number(mode === 'sheet' ? parts[1] : parts[3]) || 3;
  const which = mode === 'pose' ? parts[1] : 'stand';
  const t = mode === 'pose' ? Number(parts[2]) : 0;
  cv.width = 1014;
  cv.height = 640;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 540;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 70;
  const front = spOf(CRIER_MOB, which, t, 'front');
  const back = spOf(CRIER_MOB, which, t, 'back');
  const xs = [260, 560, 860];
  figure(front, xs[0], fy, S, CRIER_MOB.shadow);
  figure(back, xs[1], fy, S, CRIER_MOB.shadow);
  figure(KNIGHT(), xs[2], fy, S, 9);
  label(mode === 'sheet' ? `The Crier, standing (${S} times)` : `The Crier: ${which} at ${t.toFixed(2)} s (${S} times)`, 14, 10);
  label('facing you', xs[0] - 50, paneY + paneH + 14);
  label('facing away', xs[1] - 56, paneY + paneH + 14);
  label('the knight', xs[2] - 50, paneY + paneH + 14);
  show();
}
