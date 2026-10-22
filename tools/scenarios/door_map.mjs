// (THE WALL BESIDE A DOOR) A map round each door of floors 1 to 5: # wall drawn, x wall left out, . floor, D the doorway's three tiles, d its one walked tile.
import { log } from './lib.mjs';
export default async function (page) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.god = true; });
  await page.waitForTimeout(500);
  for (const depth of (process.env.DEPTHS || '1,2,3,4,5').split(',').map(Number)) {
    const out = await page.evaluate((n) => {
      const g = window.__dbg.game();
      g.depth = n; g.cleared = n - 1; g.enterDungeon();
      const L = g.level; const f = L.floor; const W = f.w;
      const away = window.__dbg.renderer.lowWalls(L);
      const lines = [];
      let count = 0, gone = 0;
      for (const D of L.doors) {
        const d = D.spot;
        if (d.kind !== 'door') continue;
        count++;
        const line = d.out > 0 ? d.plane : d.plane - 1;
        const tiles = []; for (let k = 0; k < 3; k++) tiles.push(d.alongX ? line * W + d.a + k : (d.a + k) * W + line);
        if (count > 3) { continue; }
        const cx = tiles[1] % W, cy = Math.floor(tiles[1] / W);
        lines.push(`door ${count} alongX=${d.alongX} near=${d.near} out=${d.out} at ${cx},${cy}`);
        for (let y = cy - 4; y <= cy + 4; y++) {
          let r = '';
          for (let x = cx - 6; x <= cx + 6; x++) {
            const i = y * W + x;
            if (x < 0 || y < 0 || x >= W || y >= f.h) { r += ' '; continue; }
            const t = f.tiles[i];
            let c = t === 2 ? (away[i] ? 'x' : '#') : (t === 1 ? '.' : String(t));
            if (tiles.includes(i)) c = i === tiles[1] ? 'd' : (away[i] ? 'X' : 'D');
            r += c;
          }
          lines.push('   ' + r);
        }
      }
      return { lines, count };
    }, depth);
    log('floor', depth, 'doors', out.count);
    for (const l of out.lines) console.log(l);
  }
}
