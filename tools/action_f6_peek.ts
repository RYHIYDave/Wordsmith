// A LOOK AT FRAMES (the floor 6 to 8 helper's own, while drawing): a strip of frames of a figure's clip, three times as big, on a
// plain dark ground. Nothing of the game imports it.
//   npx tsx tools/action_f6_peek.ts <who> <clip> <view> <t,t,...> <out.png>
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { ActorArt, Clip } from '../src/art/actor_types';
import { spriteLaid, lay, scaled } from '../src/dev/king_scene';
import { png } from './king_png';
import { makeBlazeThrowerArt, makeLightningChanterArt } from '../src/art/action_f6_cult';
import { makeBoulderGolemArt } from '../src/art/action_f6_golem';
import { makeSpitScorpionArt, makeTwisterDevilArt } from '../src/art/action_f6_canyon';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [who, clip, view, ts, out] = process.argv.slice(2);
const makers: Record<string, () => ActorArt> = { pots: makeBlazeThrowerArt, chanter: makeLightningChanterArt, golem: makeBoulderGolemArt, scorpion: makeSpitScorpionArt, devil: makeTwisterDevilArt };
const art = makers[who]();
const set = view === 'back' ? art.back : art.front;
const c = (clip === 'attack' ? set.clips?.attack : clip === 'idle' ? { frames: set.idle, fps: set.idleFps ?? 10 } : set.clips?.moves?.[clip]) as Clip;
const times = ts.split(',').map(Number);
const W = 150;
const H = 150;
const strip = new Px(W * times.length, H);
strip.fill?.('#1a1626');
for (let y = 0; y < H; y++) for (let x = 0; x < strip.w; x++) strip.set(x, y, (Math.floor(x / W) % 2) ? '#2a2436' : '#221e2e');
times.forEach((t, i) => {
  const sp = c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
  lay(strip, spriteLaid(sp), i * W + W / 2, H - 22);
});
writeFileSync(out, png(scaled(strip, 3)));
console.log(out, c.frames.length, 'frames');
