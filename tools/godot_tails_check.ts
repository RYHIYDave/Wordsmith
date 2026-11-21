// THE GODOT PORT: A CHECK OF THE SCARF, THE FEATHER AND THE BRAIDS (scripts/tails.gd against engine/tails.ts): the game's own Tails
// is walked through a few seconds of a figure running, stopping, turning and striking (its fixed ends moved about, its feet carried
// across the screen, the frames' times uneven), and what it paints at some moments is kept; checks/tails_check.gd walks Godot's
// through the same and says how many picture pixels differ.
//   npx tsx tools/godot_tails_check.ts   -> godot/assets/heroes/tails_check.json (not kept)
import { writeFileSync } from 'node:fs';
import { Tails, TAIL_PATCH } from '../src/engine/tails';
import { HERO_TAILS } from '../src/art/heroes';
import type { TailRoot } from '../src/engine/tails';

const CASES: { name: string; roots: (f: number) => TailRoot[] }[] = [
  { name: 'scarf', roots: (f) => [{ id: 'w-scarf-b', x: 10 + Math.sin(f / 7), y: 9.5, over: f % 120 < 60 }, { id: 'w-scarf-a', x: 10 + Math.sin(f / 7), y: 8.75, over: f % 120 < 60 }] },
  { name: 'feather', roots: (f) => [{ id: 'r-feather', x: 8 + Math.cos(f / 9), y: 3 + (f % 50 < 4 ? 1 : 0), over: true }] },
  { name: 'braids', roots: (f) => [{ id: 'm-braid-a', x: 7, y: 12 + Math.sin(f / 5) * 0.5, over: true }, { id: 'm-braid-b', x: 11, y: 12, over: f > 100, ...(f > 140 && f < 160 ? { blast: 1 } : {}) }] },
];
const KEEP = [20, 75, 130, 199];
const out: Record<string, unknown> = { patch: TAIL_PATCH, cases: [] as unknown[] };
for (const c of CASES) {
  const t = new Tails(HERO_TAILS);
  const frames: unknown[] = [];
  const kept: unknown[] = [];
  let x = 0;
  let y = 0;
  for (let f = 0; f < 200; f++) {
    const dt = f % 13 === 5 ? 1 / 30 : f % 29 === 0 ? 0.0071 : 1 / 60;
    // (running right for a second, standing, running back up-left, a warp at 150)
    if (f < 60) x += 2.2;
    else if (f >= 100 && f < 140) {
      x -= 1.6;
      y -= 0.8;
    }
    if (f === 150) x += 300;
    const facing = f >= 100 && f < 150 ? -1 : 1;
    const roots = c.roots(f);
    const ax = 9 + (f % 40 === 0 ? 0.5 : 0);
    const ay = 35;
    t.step(dt, roots, ax, ay, facing, x, y);
    frames.push({ dt, roots, ax, ay, facing, x, y });
    if (KEEP.includes(f)) {
      const both: unknown[] = [];
      for (const over of [false, true]) {
        const buf = new Uint8ClampedArray(TAIL_PATCH.w * TAIL_PATCH.h * 4);
        const box = t.paint(buf, over);
        if (!box) {
          both.push(null);
          continue;
        }
        const px: number[] = [];
        for (let py = box.y0; py <= box.y1; py++) for (let qx = box.x0; qx <= box.x1; qx++) {
          const o = (py * TAIL_PATCH.w + qx) * 4;
          px.push(buf[o + 3] ? (buf[o] << 16) | (buf[o + 1] << 8) | buf[o + 2] : -1);
        }
        both.push({ box, px });
      }
      kept.push({ f, shapes: t.shapes(), paint: both });
    }
  }
  (out.cases as unknown[]).push({ name: c.name, frames, kept });
}
writeFileSync('godot/assets/heroes/tails_check.json', JSON.stringify(out));
console.log('tails check: ' + CASES.map((c) => c.name).join(', ') + `; kept at frames ${KEEP.join(', ')}`);
