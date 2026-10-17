// THE THINGS ON A FLOOR OF THE DESCENT, AS A PLAN SEEN FROM ABOVE, DRESS_EDGES off and on (the same floor), for his
// pictures: `npx tsx tools/props_map.ts <depth> <out.json>`; tools/props_map.py draws it.
import { writeFileSync } from 'node:fs';
import { DRESS_EDGES } from '../src/game/act1_dress';
import { Game } from '../src/game/game';
const args = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);
const depth = Number(args[0] || 6);
const out: unknown[] = [];
for (const on of [false, true]) {
  DRESS_EDGES.on = on;
  const g = new Game('warrior', 9);
  g.hero.level = 20;
  g.depth = depth; g.cleared = depth - 1; g.enterDungeon();
  const L = g.level; const f = L.floor;
  out.push({
    on, w: f.w, h: f.h,
    tiles: Array.from(f.tiles), walk: Array.from(L.walk),
    props: L.props.map((p) => ({ x: p.x, y: p.y, solid: p.solid, name: p.name ?? p.kind })),
    areas: L.land!.areas.map((a) => ({ x: a.blob.x, y: a.blob.y, role: a.role })),
    start: [f.start.x, f.start.y],
  });
}
writeFileSync(args[1] || 'props.json', JSON.stringify(out));
