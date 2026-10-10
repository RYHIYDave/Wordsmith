// A FINGERPRINT OF EVERY FRAME of the monsters on the heroes' bones (art/monster_bones3.ts): each
// frame's size, anchor, lights, pool of light and every pixel, hashed; one line a list of frames.
// For checking that a change to the painter leaves a monster he has said yes to as it was.
//   node node_modules/tsx/dist/cli.mjs tools/bones3_prints.ts skeleton > /tmp/before.txt
import { createHash } from 'node:crypto';
import type { AnimSet } from '../src/art/actor_types';
import * as bones3 from '../src/art/monster_bones3';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';

paintWithoutCanvas();
const who = process.argv[2] || 'skeleton';
const make = (bones3 as unknown as Record<string, () => { front: AnimSet; back: AnimSet }>)[who === 'skeleton' ? 'makeSkeletonArt3' : 'makeArcherArt3'];
const art = make();
const print = (s: Sprite): string => {
  const p = paintingOf(s);
  const h = createHash('sha1');
  h.update(JSON.stringify([s.w, s.h, s.ax, s.ay, s.density, s.lights ?? [], s.aura ?? null]));
  h.update(Buffer.from(p.d.buffer, p.d.byteOffset, p.d.byteLength));
  return h.digest('hex').slice(0, 12);
};
for (const view of ['front', 'back'] as const) {
  const set = art[view];
  const lists: [string, Sprite[]][] = [['idle', set.idle], ['walk', set.walk], ['attack3', set.attack]];
  for (const [k, c] of Object.entries(set.clips ?? {})) if (c) lists.push([k, c.frames]);
  for (const [name, frames] of lists) console.log(view, name, Array.from(frames).map(print).join(' '));
}
