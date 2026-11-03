// A LOOK AT FRAMES (the floor 9 and 10 helper's own, while drawing): a strip of frames of a figure's clip, three times as big, on a
// plain dark ground. Nothing of the game imports it.
//   npx tsx tools/action_f9_peek.ts <who> <clip> <view> <t,t,...> <out.png> [cell]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { ActorArt, Clip } from '../src/art/actor_types';
import { spriteLaid, lay, scaled } from '../src/dev/king_scene';
import { png } from './king_png';
import { makeBrambleDeerArt, makePackWolfArt } from '../src/art/action_f9_pinewood';
import { makeDeerArt } from '../src/art/twisted_deer';
import { makeWolfArt } from '../src/art/fog_wolves';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [who, clip, view, ts, out, cell = '150'] = process.argv.slice(2);
const makers: Record<string, () => ActorArt> = { deer: makeBrambleDeerArt, wolf: makePackWolfArt, deer0: makeDeerArt, wolf0: makeWolfArt };
const extra = async (): Promise<void> => {
  try {
    const m = await import('../src/art/action_f9_fen');
    makers.drowned = (m as unknown as { makeFrostDrownedArt: () => ActorArt }).makeFrostDrownedArt;
  } catch {
    /* not yet */
  }
};
void extra().then(() => {
  const art = makers[who]();
  const set = view === 'back' ? art.back : art.front;
  const c = (clip === 'attack' ? set.clips?.attack : clip === 'idle' ? { frames: set.idle, fps: set.idleFps ?? 10 } : set.clips?.moves?.[clip]) as Clip;
  const times = ts.split(',').map(Number);
  const W = Number(cell);
  const H = Number(cell);
  const strip = new Px(W * times.length, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < strip.w; x++) strip.set(x, y, Math.floor(x / W) % 2 ? '#2a2436' : '#221e2e');
  times.forEach((t, i) => {
    const sp = c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
    lay(strip, spriteLaid(sp), i * W + W / 2, H - 30);
  });
  writeFileSync(out, png(scaled(strip, 2)));
  console.log(out, c.frames.length, 'frames');
});
