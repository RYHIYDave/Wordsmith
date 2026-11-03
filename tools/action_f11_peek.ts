// A LOOK AT FRAMES (the floors 11 to 15 helper's own, while drawing): a strip of frames of a figure's clip, twice as big, on a plain
// dark ground. Nothing of the game imports it.
//   npx tsx tools/action_f11_peek.ts <who> <clip> <view> <t,t,...> <out.png> [cell]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { ActorArt, Clip } from '../src/art/actor_types';
import { spriteLaid, lay, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [who, clip, view, ts, out, cell = '170'] = process.argv.slice(2);
void (async (): Promise<void> => {
  let art: ActorArt;
  if (who === 'watch') art = (await import('../src/art/action_f11_watch')).makeLanternWatchArt();
  else if (who === 'field') art = (await import('../src/art/action_f11_field')).makeHarvestArt();
  else if (who === 'orderly') art = (await import('../src/art/action_f11_orderly')).makeGurneyOrderlyArt();
  else art = (await import('../src/art/action_f11_warden')).makeBarrageWardenArt();
  const set = view === 'back' ? art.back : art.front;
  const c = (clip === 'attack' ? set.clips?.attack : clip === 'idle' ? { frames: set.idle, fps: set.idleFps ?? 10 } : clip === 'walk' ? { frames: set.walk, fps: set.walkFps ?? 8 } : clip === 'die' ? set.clips?.die : set.clips?.moves?.[clip]) as Clip;
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
})();
