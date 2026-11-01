// THE SHAPES OF THE HUSH: A HASH OF EVERY FRAME OF THEIR MOVES THAT DID NOT CHANGE (a mock-up's tool, not the game's).
// Each frame painted both ways round, cut to what is in it and hashed with where that is from its floor point (so that a
// bigger picture paints the same frame the same); with the lights. To show that their rhythm changed and nothing else.
//   npx tsx tools/hush_shapes_hash.ts <out.json>          write the hashes
//   npx tsx tools/hush_shapes_hash.ts <out.json> check    compare with them
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';
import { framesOf } from '../src/art/boss_checks';
import { GRIP_CANVAS, HS_CANVAS, gripPainted } from '../src/art/hush_shapes';
import { HUSH_SHAPE } from '../src/art/hush_shapes_moves';
import { deathOfMob, paintMob } from '../src/art/new_mobs3';
import type { Painted } from '../src/art/kit';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[]; exit(n: number): void };
const fs = nodeFs as { writeFileSync(p: string, d: string): void; readFileSync(p: string, e: string): string };
const crypto = nodeCrypto as { createHash(a: string): { update(d: Uint8Array | string): { digest(e: string): string } } };
paintWithoutCanvas();

/** A frame cut to what is in it: its box from (`ax`, `ay`), its pixels, its lights. */
function hashOf(p: Painted, ax: number, ay: number): string {
  const { w, h, d } = p.px;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const hs = crypto.createHash('sha1');
  hs.update(`${x0 - ax},${y0 - ay},${x1 - ax},${y1 - ay};`);
  for (let y = y0; y <= y1; y++) hs.update(d.subarray((y * w + x0) * 4, (y * w + x1 + 1) * 4));
  // (its lights, from its floor point, to a millionth of a pixel)
  const r6 = (v: number): string => (Math.round(v * 1e6) / 1e6).toFixed(6);
  hs.update(JSON.stringify(p.lights.map((l) => [r6(l.x - ax), r6(l.y - ay), r6(l.r), l.color, r6(l.a ?? 0.5)])));
  return hs.digest('hex');
}

const out: Record<string, string> = {};
for (const view of ['front', 'back'] as const) {
  for (const move of ['stand', 'walk', 'attack', 'reel', 'dying']) {
    for (const t of framesOf(HUSH_SHAPE, move)) {
      const p = move === 'dying' ? deathOfMob(HUSH_SHAPE, t / HUSH_SHAPE.dieTime, view) : paintMob(HUSH_SHAPE, move, t, view);
      out[`${move} ${view} ${t.toFixed(4)}`] = hashOf(p, HS_CANVAS.ax, HS_CANVAS.ay);
    }
  }
  for (let t = 0; t <= 0.8 + 1e-9; t += 1 / 30) for (const half of ['far', 'near'] as const) out[`grip ${half} ${view} ${t.toFixed(4)}`] = hashOf(gripPainted(t, view, half), GRIP_CANVAS.ax, GRIP_CANVAS.ay);
}
const [file, mode] = process.argv.slice(2);
if (mode === 'check') {
  const was = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
  const keys = Object.keys(was);
  const differ = keys.filter((k) => out[k] !== was[k]);
  console.log(`${keys.length} frames before; ${Object.keys(out).length} now; ${differ.length} differ`);
  for (const k of differ.slice(0, 20)) console.log('  differs:', k);
  process.exit(differ.length ? 1 : 0);
} else {
  fs.writeFileSync(file, JSON.stringify(out, null, 0));
  console.log(`${Object.keys(out).length} frames hashed`);
}
