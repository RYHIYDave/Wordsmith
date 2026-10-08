// A FINGERPRINT OF EVERY FRAME THE HEROES ON THE BONES CAN SHOW (made with the true-left mock-up of
// 8 Oct 2026, to show that with its switch off the game paints exactly what it painted before):
// all three heroes, in a dungeon, in town and on a class card, both views, every list and clip.
// One line for each list of frames (how many, and a hash of their pixels, anchors, lights, pool
// of light and tails), and a total. Run it in two trees and compare the outputs.
//   node node_modules/tsx/dist/cli.mjs tools/hero_fingerprint.mts > shots/fingerprint.txt
import { createHash } from 'node:crypto';
import { makeHeroArt3 } from '../src/art/heroes3';
import { Px } from '../src/engine/px';

// (frames are painted as plain paintings, with no canvas: tests/helpers.ts does the same)
(Px.prototype as unknown as { toCanvas: () => unknown }).toCanvas = function (this: unknown): unknown {
  return this;
};
type Frame = { img: Px; w: number; h: number; ax: number; ay: number; density?: number; lights?: unknown; tails?: unknown; aura?: unknown };
type Set = Record<string, unknown> & { clips?: Record<string, { frames: Frame[]; fps: number; hit?: number; loop?: number; turns?: boolean }> };
const art = makeHeroArt3();
const total = createHash('sha256');
let frames = 0;
const looks: [string, Record<string, boolean>][] = [['dungeon', { twoHanded: true }], ['town', { twoHanded: true, town: true }], ['card', { twoHanded: true, card: true }]];
for (const cls of ['warrior', 'ranger', 'mage'] as const) {
  for (const [place, look] of looks) {
    const a = art.of(cls, look) as unknown as Record<string, Set>;
    const extra = Object.keys(a).filter((k) => k !== 'front' && k !== 'back');
    if (extra.length) console.log(`${cls} ${place}: MORE THAN THE TWO VIEWS: ${extra.join(', ')}`);
    for (const view of ['front', 'back']) {
      const s = a[view];
      const lists: [string, Frame[]][] = [];
      for (const k of ['idle', 'walk', 'attack', 'heavy', 'leap']) if (Array.isArray(s[k])) lists.push([k, s[k] as Frame[]]);
      for (const [k, c] of Object.entries(s.clips ?? {})) lists.push([`clips.${k}(fps ${c.fps} hit ${c.hit} loop ${c.loop} turns ${c.turns})`, c.frames]);
      for (const [name, list] of lists) {
        const h = createHash('sha256');
        for (const f of list) {
          h.update(Buffer.from(f.img.d.buffer));
          h.update(JSON.stringify([f.img.w, f.img.h, f.w, f.h, f.ax, f.ay, f.density, f.lights, f.tails, f.aura]));
          frames++;
        }
        const d = h.digest('hex').slice(0, 16);
        total.update(d);
        console.log(`${cls} ${place} ${view} ${name}: ${list.length} frames ${d}`);
      }
      console.log(`  fps idle ${s.idleFps} walk ${s.walkFps}`);
    }
  }
}
console.log(`TOTAL ${frames} frames ${total.digest('hex').slice(0, 24)}`);
