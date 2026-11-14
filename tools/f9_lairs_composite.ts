// THE TWO SIDE BOSSES' STANDING PICTURES (dev/sculpt_f9_bosses.ts) as pixels, for laying into the game's own pictures of their side
// areas (tools/f9_lairs_composite.py; the spots from tools/scenarios/f9_lairs.mjs with CANVAS_OUT):
//   node node_modules/tsx/dist/cli.mjs tools/f9_lairs_composite.ts > /tmp/f9b.json
import { CHIEF9_CANVAS, WOLF9_CANVAS, sculptChief9, sculptWolf9 } from '../src/dev/sculpt_f9_bosses';
import type { Px } from '../src/engine/px';
const take = (p: Px, ax: number, ay: number): { w: number; h: number; ax: number; ay: number; px: (string | null)[] } => {
  const px: (string | null)[] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) px.push(p.get(x, y));
  return { w: p.w, h: p.h, ax, ay, px };
};
console.log(JSON.stringify({ chief: take(sculptChief9('front', {}, -40).px, CHIEF9_CANVAS.ax, CHIEF9_CANVAS.ay), wolf: take(sculptWolf9('front', 0.4).px, WOLF9_CANVAS.ax, WOLF9_CANVAS.ay) }));
