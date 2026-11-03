// THE VETERAN'S FIXES, BEFORE AND AFTER (docs/mockups/brawler_looks/pictures/veteran_fixes.png): his word on the moves, 3
// Nov 2026: “I’m digging it.  I think his elbows are out a little too much in his stance.  And the knee and elbow need a
// little work.” and “And the 3 kick combo seemed like two of the same kicks”. This writes the pictures of one version of
// him (run once in the old version's tree, once in this one): his stance, front and behind; the flying knee and the
// spinning elbow at their key moments; combo 4 at each of its blows. tools/veteran_fixes.py lays the two side by side.
// Nothing of the game imports it.
//   npx tsx tools/veteran_fixes.ts <dir>     then     python3 tools/veteran_fixes.py <before dir> <after dir> <out.png>
import { mkdirSync, writeFileSync } from 'node:fs';
import { scene } from '../src/dev/veteran_scene';
import type { Play } from '../src/dev/veteran_scene';
import { VET_FILM } from '../src/dev/veteran_plays';
import { png } from './king_png';
import { scaled } from '../src/dev/king_scene';

const [dir = 'shots/veteran_fixes'] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
const partOf = (t: string): Play => {
  const p = VET_FILM.find((x) => x.title.startsWith(t));
  if (!p) throw new Error(`no part ${t}`);
  return p.play;
};
const out: Record<string, { file: string; label: string }[]> = {};
const cell = (row: string, play: Play, G: number, label: string, o: { w: number; h: number; k: number; view?: number; sy?: number; ahead?: number }): void => {
  const px = scene(play, G, { w: o.w, h: o.h, view: o.view ?? 0, sy: o.sy ?? 0.8, ahead: o.ahead ?? 12 });
  const file = `${row}_${(out[row] ??= []).length}.png`;
  writeFileSync(`${dir}/${file}`, png(scaled(px, o.k)));
  out[row].push({ file, label });
};
// HIS STANCE, close: from in front and from behind, down in the bounce and up on his toes
{
  const p = partOf('STANDING');
  for (const [G, view, label] of [[0, 0, 'in front, down'], [7, 0, 'in front, up'], [0, 90, 'behind, down']] as const) cell('stance', p, G, label, { w: 92, h: 84, k: 3, view, sy: 0.86, ahead: 2 });
}
// THE FLYING KNEE: the lunge held, the knee in, snapped back, the landing
{
  const p = partOf('THE FLYING KNEE');
  const m = p.steps[0].m;
  const s = m.strikes[0];
  const land = (m.dust ?? []).filter((d) => d.f > s.at + 2)[0]?.f ?? s.at + 8;
  for (const [f, label] of [[s.from, 'the lunge, held'], [s.at, 'the knee in'], [s.at + 3, 'snapped back'], [land + 1, 'landed']] as const) cell('knee', p, p.lead + f, label, { w: 140, h: 112, k: 2, sy: 0.82, ahead: 18 });
}
// THE SPINNING ELBOW: the coil held, the elbow in, the turn, back to his guard
{
  const p = partOf('THE SPINNING ELBOW');
  const m = p.steps[0].m;
  const s = m.strikes[0];
  for (const [f, label] of [[s.from, 'the coil, held'], [s.at, 'the elbow in'], [s.at + 7, 'the turn'], [m.long - 4, 'his guard']] as const) cell('elbow', p, p.lead + f, label, { w: 140, h: 112, k: 2, sy: 0.74, ahead: 14 });
}
// COMBO 4 (hold, hold, swipe and hold): each kick as it lands
{
  const p = partOf('COMBO 4');
  let t = p.lead;
  for (const st of p.steps) {
    const s = st.m.strikes[0];
    const f = s.cone ? s.at + 3 : Math.max(s.at, ...s.hits.map((h) => h.f));
    cell('combo4', p, t + f, st.m.name.replace(/^The /, ''), { w: 186, h: 150, k: 2, sy: 0.64, ahead: 12 });
    t += st.m.long;
  }
}
writeFileSync(`${dir}/fixes.json`, JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k} ${v.length}`).join(', '));
