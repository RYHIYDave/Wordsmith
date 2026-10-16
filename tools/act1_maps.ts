// The descent's floors as text maps, for the main chat to look at: `npx tsx tools/act1_maps.ts [depth] [seed]`.
import { generateAct1 } from '../src/game/act1_layout';
import { T_FLOOR, T_PIT } from '../src/game/types';
const depths = process.argv[2] ? [+process.argv[2]] : [6, 7, 8, 9, 10];
const seeds = process.argv[3] ? [+process.argv[3]] : [1, 2, 3];
for (const d of depths) for (const s of seeds) {
  const t0 = performance.now();
  const { floor: f, land } = generateAct1(d, s);
  const ms = Math.round(performance.now() - t0);
  let fl = 0, cut = 0;
  for (let i = 0; i < f.w * f.h; i++) if (f.tiles[i] === T_FLOOR) { fl++; if (f.cut![i]) cut++; }
  console.log(`floor ${d} seed ${s}: ${f.w}x${f.h}, ${fl} floor (${cut} halves), ${f.rooms.length} rooms, ${f.packs.length} packs (${f.packs.reduce((a, p) => a + p.size, 0)} monsters), ${f.props.length} props, ${land.holds.length} holds, ${ms} ms`);
  if (process.argv[4] === 'map') {
    const S = 2;
    for (let y = 0; y < f.h; y += S) {
      let row = '';
      for (let x = 0; x < f.w; x += S) {
        const i = y * f.w + x;
        const near = (k: (j: number) => boolean) => { for (let b = 0; b < S; b++) for (let a = 0; a < S; a++) { const j = (y + b) * f.w + x + a; if (y + b < f.h && x + a < f.w && k(j)) return true; } return false; };
        const at = (px: number, py: number) => Math.floor(px) >= x && Math.floor(px) < x + S && Math.floor(py) >= y && Math.floor(py) < y + S;
        row += at(f.start.x, f.start.y) ? 'S' : at(f.boss.x, f.boss.y) ? 'B' : land.holds.some((h) => at(h.gx, h.gy)) ? 'G' : f.packs.some((p) => at(p.x, p.y)) ? 'm' : near((j) => f.tiles[j] === T_FLOOR) ? '.' : near((j) => f.tiles[j] === T_PIT) ? '~' : ' ';
      }
      if (row.trim()) console.log(row);
    }
  }
}
