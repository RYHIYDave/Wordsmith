// THE VETERAN'S REACH, BEFORE AND NOW (docs/mockups/brawler_looks/pictures/veteran_reach.png): his word, 3 Nov 2026: “Okay,
// I don’t like his range.  I get that’s as far as his arms and legs go but I’d like all of his moves to have more reach.”
// This writes pictures of one version of him (run once in the old version's tree, once in this one): the hook, the round
// kick, the push kick and the spinning jump kick from the game's view (from in front), each at the moment its blow reaches
// furthest, with a faint ruler laid on the floor round where he stood: rings at 1, 2, 2½, 3 and 3½ tiles (the game's tiles)
// and a line out along his forward. The rings are painted only on the floor, under him and his foes. Only what both versions
// have is used. tools/veteran_reach.py lays the two out, before above now. Nothing of the game imports it.
//   npx tsx tools/veteran_reach.ts <dir>     then     python3 tools/veteran_reach.py <before dir> <now dir> <out.png>
import { mkdirSync, writeFileSync } from 'node:fs';
import { scene } from '../src/dev/veteran_scene';
import { VET_FILM } from '../src/dev/veteran_plays';
import { carryAt } from '../src/dev/veteran_moves';
import type { VetMotion } from '../src/dev/veteran_moves';
import { GRID } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { png } from './king_png';
import { scaled } from '../src/dev/king_scene';

const [dir = 'shots/veteran_reach'] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
/** The game's tile, his measure (art/new_mobs3.ts TILE3). */
const TILE = 32 / GRID;
const W = 592;
const H = 236;
const K = 2;
/** The floor's own colours (a ruler is painted only over these: under him, his foes and his blows). */
const FLOOR = new Set(['#1c1a26', '#22202e', '#292636', '#302c3e', '#373247', '#3f3a50', '#0c0b14', '#0c0a18'].map((c) => rgba(c).slice(0, 3).join(',')));
const out: Record<string, { file: string; f: number; labels: { t: string; x: number; y: number }[] }> = {};
for (const [key, title, X0, Y0] of [['hook', 'THE HOOK ·', 190, 120], ['roundkick', 'THE ROUND KICK ·', 190, 120], ['push', 'THE PUSH KICK ·', 170, 110], ['spinkick', 'THE SPINNING JUMP KICK ·', 296, 142]] as const) {
  const part = VET_FILM.find((p) => p.title.startsWith(title));
  if (!part) throw new Error(`no part ${title}`);
  const play = part.play;
  const m = play.steps[0].m as VetMotion & { strikes: { force?: { long: number; from?: number } }[] };
  const s = m.strikes[0];
  // (the moment it reaches furthest: its force out at its reach; the old blows', as they land)
  const f = s.force ? (s.force.from ?? s.at) + s.force.long : s.cone ? s.at + 4 : Math.max(s.at, ...s.hits.map((h) => h.f)) + 1;
  const G = play.lead + f;
  // (the camera put so that where he stood is at X0, Y0: as the scene places it, shake and all)
  const cr = carryAt(m, f);
  const shake = m.shake?.some(([a, b]) => f >= a && f <= b);
  const jx = shake ? (Math.floor(f) % 2 === 0 ? 2 : -2) : 0;
  const jy = shake ? (Math.floor(f) % 2 === 0 ? -1 : 1) : 0;
  const cam = [cr[0] * 0.8, cr[1] * 0.8];
  const sx = (X0 + GRID * (cam[0] + cam[1]) - jx) / W;
  const sy = (Y0 + GRID * 0.5 * (cam[0] - cam[1]) - jy) / H;
  const px = scene(play, G, { w: W, h: H, view: 0, sx, sy, ahead: 0 });
  // THE RULER: rings round where he stood, and a line out along his forward, on the floor only
  const scr = (x: number, y: number): [number, number] => [X0 + GRID * (x + y), Y0 + GRID * 0.5 * (x - y)];
  const paint = (x: number, y: number, c: string): void => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 0 || Y < 0 || X >= W || Y >= H) return;
    const i = (Y * W + X) * 4;
    if (!FLOOR.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) return;
    const v = rgba(c);
    px.d[i] = v[0];
    px.d[i + 1] = v[1];
    px.d[i + 2] = v[2];
  };
  const labels: { t: string; x: number; y: number }[] = [];
  for (const [t, c, name] of [[1, '#5e587e', '1'], [2, '#5e587e', '2'], [2.5, '#d8d0ff', '2½'], [3, '#5e587e', '3'], [3.5, '#ffe6a8', '3½']] as const) {
    const r = t * TILE;
    const n = Math.ceil(r * 8);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      // (dashed: three pixels on, two off, round the ring)
      if (Math.floor((k / n) * r * 1.6) % 5 >= 3) continue;
      paint(...scr(Math.cos(a) * r, Math.sin(a) * r), c);
    }
    // (its label, out to the right of where the ring crosses his forward, a little down)
    const [lx, ly] = scr(r, 0);
    labels.push({ t: name, x: lx * K + 4, y: ly * K + 2 });
  }
  for (let r = 0; r <= 3.5 * TILE; r += 0.5) if (Math.floor(r) % 4 < 2) paint(...scr(r, 0), '#8a84b0');
  // (where he stood: a small cross on the floor)
  for (let d = -3; d <= 3; d++) {
    paint(X0 + d, Y0, '#f0eaff');
    paint(X0, Y0 + d * 0.5, '#f0eaff');
  }
  const file = `${key}.png`;
  writeFileSync(`${dir}/${file}`, png(scaled(px, K)));
  out[key] = { file, f, labels };
}
writeFileSync(`${dir}/reach.json`, JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}@${v.f}`).join(', '));
