// Dev page: THE STAIRWELL OPENS (art/stairwell_open.ts), on each of the Crypt's floors, each way.
//   node tools/preview.mjs src/dev/preview_stairwell_open.ts shots/stair/moment.png 6000 6000 "moment:2:0"
//   hash = <mode>:<scale>[:<n>[:<frame>]]   n: (floor - 1) * 2, + 1 for the way down to the lower left ('y')
//   The stairwell's anchor is on the corner of a tile of the floor (floor 4: where the floor is earth
//   under it, more one way and less the other), and the moment breaks the game's own floor there.
//     moment  every frame in a grid of cells on a patch of that floor, the warrior standing by for size:
//             before it (the floor alone), the moment, what is left (the stairwell). The page logs
//             "cells <before> <frames> <after> <columns> <cell w> <cell h>" for the film's maker.
//     strip   sixteen frames close, picked evenly and every jolt, labelled
//     still   one frame, big (the fourth number)
// The screen's kick at each jolt (each its own strength, stairwellKicks: the great burst's 10 game pixels
// dying away over half a second) and its tremor from the shock to the heave are drawn as the game would
// do them (the main chat's to do in the game). Scales are whole numbers only.
import { CRYPT_FLOORS, cryptGround } from '../art/crypt';
import { makeHeroArt3 } from '../art/heroes3';
import { stairwellKicks, stairwellNotes, stairwellOpens } from '../art/stairwell_open';
import type { Sprite } from '../engine/px';

const [mode = 'moment', scaleArg = '', nArg = '', fArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Math.max(1, Math.round(Number(scaleArg) || 2));
const N = Number(nArg) || 0;
const k = Math.min(4, Math.floor(N / 2) + 1);
const way: 'x' | 'y' = N % 2 ? 'y' : 'x';

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
function size(w: number, h: number): void {
  cv.width = w * S;
  cv.height = h * S;
  cv.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(cv);
  g.imageSmoothingEnabled = false;
  g.setTransform(S, 0, 0, S, 0, 0);
  g.fillStyle = '#07050a';
  g.fillRect(0, 0, w, h);
}
const draw = (s: Sprite, x: number, y: number): void => {
  g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
};
const label = (t: string, x: number, y: number): void => {
  g.fillStyle = '#e9ecff';
  g.font = '7px monospace';
  g.fillText(t, x, y);
};

/** The tile the anchor is on: floor 4 where there is earth under the opening. */
const AT: [number, number] = k === 4 ? (way === 'x' ? [15, 15] : [10, 15]) : [10, 10];
const t0 = performance.now();
const m = stairwellOpens(CRYPT_FLOORS[k - 1], way, AT);
const notes = stairwellNotes(m);
const kicks = stairwellKicks(m);
console.log(`painted in ${Math.round(performance.now() - t0)} ms: ${m.frames.length} frames, jolts ${m.jolts.join(' ')}, kicks ${kicks.join(' ')}, great ${notes.great}, swap ${notes.swap}`);
const ground = cryptGround(k);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

/** The screen's kick: down at each jolt by its strength and back, dying away (the great burst's over half a second); a tremor from the shock to the heave. */
function shakeAt(f: number): [number, number] {
  let dx = 0;
  let dy = 0;
  m.jolts.forEach((j, i) => {
    const s = kicks[i];
    const D = s >= 10 ? 15 : 4;
    const kk = f - j;
    if (kk < 0 || kk >= D) return;
    const a = s * (1 - kk / D);
    const y = Math.round(a * (kk % 2 ? -0.6 : 1));
    if (Math.abs(y) > Math.abs(dy)) {
      dy = y;
      dx = Math.round(a * 0.3 * (kk % 2 ? 1 : -1));
    }
  });
  if (!dy && f > m.jolts[0] && f < m.jolts[1]) return [f % 2 ? 1 : -1, f % 3 === 0 ? 1 : 0];
  return [dx, dy];
}

/**
 * One cell: a patch of the floor, the moment's frame `fr` (or the stairwell, or nothing) at the
 * opening's corner, the warrior standing beside it; shaken by frame `f`'s kick.
 */
function cell(fr: Sprite | null, f: number, x: number, y: number, w: number, h: number, ox: number, oy: number): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  const [dx, dy] = shakeAt(f);
  g.translate(dx, dy);
  const at = (tx: number, ty: number): [number, number] => [ox + (tx - ty) * 16, oy + (tx + ty) * 8];
  for (let tx = -10; tx < 13; tx++) for (let ty = -10; ty < 13; ty++) draw(ground.floor(AT[0] + tx, AT[1] + ty), ...at(tx, ty));
  if (fr) draw(fr, ox, oy);
  // (the warrior a tile and a half off the near side: the skirt of dust rushes past his feet)
  const [hx, hy] = way === 'x' ? at(1.0, 3.0) : at(3.0, 1.0);
  draw(hero.front.idle[0], hx, hy);
  g.restore();
}

if (mode === 'moment') {
  const before = 4;
  const after = 2;
  const cells: (Sprite | null)[] = [...Array<null>(before).fill(null), ...m.frames, ...Array<Sprite>(after).fill(m.after![0])];
  const CW = 290;
  const CH = 280;
  const COLS = 10;
  size(CW * COLS, CH * Math.ceil(cells.length / COLS));
  console.log(`cells ${before} ${m.frames.length} ${after} ${COLS} ${CW * S} ${CH * S}`);
  cells.forEach((fr, i) => {
    const x = (i % COLS) * CW;
    const y = Math.floor(i / COLS) * CH;
    cell(fr, i - before, x, y, CW, CH, x + CW / 2 + (way === 'x' ? -24 : 24), y + 186);
  });
} else if (mode === 'strip') {
  const n = m.frames.length;
  const pick = [...new Set([...Array.from({ length: 16 }, (_, i) => Math.round((i * (n - 1)) / 15)), ...m.jolts])].sort((a, b) => a - b).slice(0, 20);
  const CW = 290;
  const CH = 280;
  const COLS = 5;
  size(CW * COLS, CH * Math.ceil(pick.length / COLS));
  pick.forEach((f, i) => {
    const x = (i % COLS) * CW;
    const y = Math.floor(i / COLS) * CH;
    cell(m.frames[f], f, x, y, CW, CH, x + CW / 2 + (way === 'x' ? -24 : 24), y + 186);
    label(`${f}${m.jolts.includes(f) ? ' jolt' : ''}`, x + 4, y + 10);
  });
} else if (mode === 'close' || mode === 'tall') {
  // frames <a>-<b>, labelled (the fourth number, "a-b", or a list "a,b,c"): close, the stairwell's patch only; or tall, as the grid's cells
  const [a, b] = (fArg || '0-19').split('-').map(Number);
  const picks = (fArg.includes(',') ? fArg.split(',').map(Number) : Array.from({ length: b - a + 1 }, (_, i) => a + i)).filter((f) => f < m.frames.length);
  const [CW, CH, TOP] = mode === 'close' ? [120, 90, 30] : [290, 280, 186];
  const COLS = 5;
  size(CW * COLS, CH * Math.ceil(picks.length / COLS));
  picks.forEach((f, i) => {
    const x = (i % COLS) * CW;
    const y = Math.floor(i / COLS) * CH;
    cell(m.frames[f], f, x, y, CW, CH, x + CW / 2 + (way === 'x' ? -30 : 30), y + TOP);
    label(`${f}${m.jolts.includes(f) ? ' jolt' : ''}`, x + 3, y + 8);
  });
} else if (mode === 'still') {
  const f = Math.min(m.frames.length - 1, Number(fArg) || 0);
  size(290, 280);
  cell(m.frames[f], f, 0, 0, 290, 280, 145 + (way === 'x' ? -24 : 24), 186);
}
(window as unknown as { __ready: boolean }).__ready = true;
