// A QUICK LOOK at the Warrior's moves with the battle axe (src/art/warrior_axe_moves.ts), for whoever makes them: a move's
// frames side by side (across) from his eight sides (down), `scale` times as big, with what the checks find printed (his helm
// seen, the edge's way, nothing through him, his hands on the haft). Nothing of the game imports it.
//   npx tsx tools/warrior_axe_peek.ts <move> <out.png> [scale] [sides|all] [frames: all | every2 | 0,3,6,...] [quiet]
import { Px } from '../src/engine/px';
import { paintWithoutCanvas } from '../tests/helpers';
import { writePng } from './px_png';
import { AXE_FRAME, AXE_MOVES, axeFaults, axePosed, helmSeen, paintAxe, workingEdge } from '../src/art/warrior_axe_moves';
import { WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';

declare const process: { argv: string[] };
paintWithoutCanvas();

const [name, out, k0, sides0, frames0, quiet] = process.argv.slice(2);
const m = AXE_MOVES[name];
if (!m) throw new Error(`no move ${name}: ${Object.keys(AXE_MOVES).join(', ')}`);
const k = Number(k0 ?? 2);
const sides = (!sides0 || sides0 === 'all' ? WU_SIDES : sides0.split(',')) as WuSide[];
const end = m.keys[m.keys.length - 1].at;
const total = Math.round(end / AXE_FRAME) + (m.loop !== undefined ? 0 : 1);
let frames: number[] = [];
if (!frames0 || frames0 === 'all') frames = Array.from({ length: total }, (_, i) => i);
else if (frames0.startsWith('every')) frames = Array.from({ length: total }, (_, i) => i).filter((i) => i % Number(frames0.slice(5)) === 0);
else frames = frames0.split(',').map(Number);
const t0 = Date.now();
const pics: Px[][] = [];
let worstHelm = 1;
let faults = 0;
for (const side of sides) {
  const row: Px[] = [];
  for (const i of frames) {
    const t = i * AXE_FRAME;
    const f = paintAxe(m, t, side);
    const p = axePosed(m, t);
    const bad = axeFaults(m, t, f, p);
    const helm = helmSeen(f);
    worstHelm = Math.min(worstHelm, helm.share);
    if (bad.length) {
      faults++;
      if (!quiet) console.log(`${side} f${i}: ${bad.join('; ')}`);
    }
    row.push(f.px);
  }
  pics.push(row);
}
// (the edge's way through the move, once: the same from every side)
if (!quiet) console.log('edge (fwd,left,up) by frame: ' + frames.map((i) => { const p = axePosed(m, i * AXE_FRAME); return `${i}:${p.holding.axe ? workingEdge(p.placed).map((v) => v.toFixed(1)).join('/') : '-'}`; }).join(' '));
let x0 = 999, y0 = 999, x1 = -1, y1 = -1;
for (const row of pics) for (const p of row) for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) {
  x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
}
const w = x1 - x0 + 3;
const h = y1 - y0 + 3;
const sheet = new Px(w * frames.length, h * sides.length);
// (a dark ground, so that his cyan edge and the smears read)
for (let i = 0; i < sheet.w * sheet.h; i++) { sheet.d[i * 4] = 30; sheet.d[i * 4 + 1] = 26; sheet.d[i * 4 + 2] = 44; sheet.d[i * 4 + 3] = 255; }
pics.forEach((row, r) => row.forEach((p, c) => sheet.blit(p.crop(x0 - 1, y0 - 1, w, h), c * w, r * h)));
writePng(sheet, out, k);
console.log(`${name}: ${frames.length} frames x ${sides.length} sides, ${faults} with faults, least helm ${Math.round(worstHelm * 100)}%, ${((Date.now() - t0) / 1000).toFixed(1)} s; cell ${w}x${h} (x${k})`);
