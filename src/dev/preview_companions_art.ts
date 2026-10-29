// Dev page: THE RANGER'S SIX COMPANIONS (art/companions_art.ts), beside the Ranger for size. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_companions_art.ts shots/comp_strip.png 1600 900 strip:<kind>:<move>[:<scale>[:<every>]]
//   node tools/preview.mjs src/dev/preview_companions_art.ts shots/comp_close.png 1200 700 close:<kind>:<move>:<seconds>[:<scale>]

import { COMP_CANVAS, KINDS, companionFrame, companionIcon, moveFps, moveLong } from '../art/companions_art';
import { COMP_ATTACK, moveFrames } from '../art/companions_art_moves';
import type { Kind } from '../art/companions_art';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { drawText } from '../engine/font';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { GameView } from '../art/skin';
import { P } from '../art/palette';
import { THEME } from '../ui/ui';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'strip';
const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  win.__ready = true;
}
function label(s: string, x: number, y: number, scale = 2): void {
  g.save();
  g.scale(scale, scale);
  drawText(g, s, x / scale, y / scale, THEME.text, { shadow: P.ink });
  g.restore();
}
/** A figure laid down `S` times, its floor point at (fx, fy): its soft shadow, its pool of light, it, its lights. */
function figure(sp: Sprite, fx: number, fy: number, S: number, shadow: number): void {
  g.save();
  g.fillStyle = 'rgba(8,6,20,0.5)';
  g.beginPath();
  g.ellipse(fx, fy, shadow * S, shadow * 0.45 * S, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  drawAura(g, sp, fx, fy, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx - sp.ax * 2 * S), Math.round(fy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx, fy, 2 * S);
}
const RANGER = (t = 0, view: GameView = 'front'): Sprite => spriteOf3(MOVES3.rstand, t, view);

if (mode === 'strip') {
  const kind = (parts[1] || 'wolf') as Kind;
  const which = parts[2] || 'stand';
  const S = Number(parts[3]) || 3;
  const every = Number(parts[4]) || (which === 'stand' ? 3 : 1);
  const fps = moveFps(kind, which);
  const n = Math.round(moveLong(kind, which) * fps);
  const ts: number[] = [];
  for (let i = 0; i <= n; i += every) ts.push(i / fps);
  const cellW = 50 * S;
  const cellH = 56 * S;
  const cols = Math.min(ts.length, Math.floor(1580 / cellW));
  const rows = Math.ceil(ts.length / cols);
  cv.width = 20 + cols * cellW;
  cv.height = 40 + rows * 2 * cellH;
  g.fillStyle = '#1a1830';
  g.fillRect(0, 0, cv.width, cv.height);
  ts.forEach((t, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    for (const [vi, view] of (['front', 'back'] as const).entries()) {
      const x = 10 + c * cellW + cellW / 2;
      const y = 40 + (r * 2 + vi) * cellH + cellH * 0.78;
      g.fillStyle = vi ? '#22203a' : '#26243e';
      g.fillRect(10 + c * cellW + 2, 40 + (r * 2 + vi) * cellH + 2, cellW - 4, cellH - 4);
      figure(companionFrame(kind, which, t, view), x, y, S, 6);
      label(`${t.toFixed(2)}`, 10 + c * cellW + 6, 40 + (r * 2 + vi) * cellH + 6, 1);
    }
  });
  label(`${kind} ${which}, front and back, ${S} times`, 10, 8);
  show();
} else if (mode === 'close') {
  const kind = (parts[1] || 'wolf') as Kind;
  const which = parts[2] || 'stand';
  const t = Number(parts[3]) || 0;
  const S = Number(parts[4]) || 8;
  const sps = (['front', 'back'] as const).map((v) => companionFrame(kind, which, t, v));
  cv.width = sps.reduce((a, sp) => a + sp.img.width * S + 40, 20);
  cv.height = Math.max(...sps.map((sp) => sp.img.height * S)) + 60;
  g.fillStyle = '#3a3448';
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  let x = 20;
  for (const sp of sps) {
    g.drawImage(sp.img, x, 44, sp.img.width * S, sp.img.height * S);
    x += sp.img.width * S + 40;
  }
  label(`${kind} ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'all') {
  // all six standing, front and back, with the Ranger, `S` times
  const S = Number(parts[1]) || 3;
  const which = parts[2] || 'stand';
  const t = Number(parts[3]) || 0;
  const cellW = 50 * S;
  cv.width = 40 + cellW * (KINDS.length + 1);
  cv.height = 2 * 76 * S + 60;
  g.fillStyle = '#1a1830';
  g.fillRect(0, 0, cv.width, cv.height);
  for (const [vi, view] of (['front', 'back'] as const).entries()) {
    const fy = 40 + (vi + 1) * 76 * S - 8 * S;
    figure(RANGER(0, view), 20 + cellW / 2, fy, S, 9);
    KINDS.forEach((k, i) => figure(companionFrame(k, which, t, view), 20 + cellW * (i + 1.5), fy, S, 7));
  }
  label(`all six, ${which} at ${t}, ${S} times`, 10, 8);
  show();
}
else if (mode === 'contact') {
  // every one of them: its stand, its moving, the beats of its attack, from in front and behind; and its icon
  const S = Number(parts[1]) || 3;
  const A = COMP_ATTACK;
  const cols: [string, number, GameView][] = [
    ['stand', 0, 'front'], ['stand', 0, 'back'], ['walk', 0.25, 'front'], ['walk', 0.6, 'back'],
    ['attack', 0.27, 'front'], ['attack', A.strike + 1 / 30, 'front'], ['attack', A.hit, 'front'], ['attack', 0.5, 'front'], ['attack', A.hit, 'back'],
  ];
  const cellW = 50 * S;
  const cellH = 62 * S;
  cv.width = 20 + cellW * cols.length + 40 * S;
  cv.height = 40 + cellH * KINDS.length;
  g.fillStyle = '#1a1830';
  g.fillRect(0, 0, cv.width, cv.height);
  KINDS.forEach((k, r) => {
    cols.forEach(([which, t0, view], c) => {
      const t = which === 'walk' ? t0 * moveFrames(k) / 30 : t0;
      g.fillStyle = (r + c) % 2 ? '#22203a' : '#26243e';
      g.fillRect(10 + c * cellW, 30 + r * cellH, cellW - 2, cellH - 2);
      figure(companionFrame(k, which, t, view), 10 + c * cellW + cellW * 0.42, 30 + r * cellH + cellH * 0.86, S, 6);
      label(`${k} ${which} ${t.toFixed(2)} ${view}`, 12 + c * cellW, 32 + r * cellH, 1);
    });
    const ic = companionIcon(k);
    const icv = document.createElement('canvas');
    icv.width = 32;
    icv.height = 32;
    (icv.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(new Uint8ClampedArray(ic.d), 32, 32), 0, 0);
    g.fillStyle = '#14122a';
    g.fillRect(16 + cols.length * cellW, 40 + r * cellH, 32 * S, 32 * S);
    g.imageSmoothingEnabled = false;
    g.drawImage(icv, 16 + cols.length * cellW, 40 + r * cellH, 32 * S, 32 * S);
  });
  label(`the six: stand, moving, attack (held, striking, the blow, through), front and back; icons (${S} times)`, 10, 8);
  show();
}
void COMP_CANVAS;
