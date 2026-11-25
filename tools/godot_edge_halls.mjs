// THE GODOT PORT: THE CULT'S HALLS FOR THE GATES AT THE MAP'S EDGE (his pick, 25 Nov 2026, "Gate at the edge (Recommended)",
// after his “Why wouldn’t you just put the door on the edge of the map?  Why is it in the middle of the area?”). On an endless
// level of a floor with no strongholds of its own, the cult's gate stands in a wall at the map's edge and its hall lies beyond:
// one of the Wilds' own halls (floors 6 to 10, as the game's map-maker laid them and the game draws them from in them:
// assets/looks/floor<N>_hold<n>), laid in rows added past the floor's south edge (act1/altar_rooms.gd). This takes each hall's
// ground off its own floor: the box of its hall and its hallway and two tiles of wall round them, each tile's kind, whether it
// is walked on and how it is cut; and where in it one comes in, where the fight is.
//   node tools/godot_edge_halls.mjs   -> godot/assets/altar_room/halls.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const A = 'godot/assets';
const out = [];
for (const depth of [6, 7, 8, 9, 10]) {
  const holds = JSON.parse(readFileSync(`${A}/floor${depth}/holds.json`, 'utf8'));
  const L = JSON.parse(readFileSync(`${A}/floor${depth}/layout.json`, 'utf8'));
  for (const q of holds.holds) {
    const place = `floor${depth}_hold${q.n}`;
    if (!existsSync(`${A}/looks/${place}.json`)) continue;
    const I = q.inside;
    const W = q.way;
    const x0 = Math.min(I.x, W.x) - 2;
    const y0 = Math.min(I.y, W.y) - 2;
    const x1 = Math.max(I.x + I.w, W.x + W.w) + 2;
    const y1 = Math.max(I.y + I.h, W.y + W.h) + 2;
    const box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    const take = (grid) => {
      if (!Array.isArray(grid) || grid.length === 0) return null;
      const g = [];
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) g.push(grid[y * L.w + x] ?? 0);
      return g;
    };
    out.push({ place, depth, n: q.n, box, tiles: take(L.tiles), walk: take(L.walk), cut: take(L.cut), inside: I, way: W, entry: q.entry, fight: q.fight });
  }
}
writeFileSync(`${A}/altar_room/halls.json`, JSON.stringify(out));
console.log(out.map((h) => `${h.place} ${h.box.w}x${h.box.h} at ${h.box.x},${h.box.y}; walked ${h.walk.filter((v) => v).length}`).join('\n'));
