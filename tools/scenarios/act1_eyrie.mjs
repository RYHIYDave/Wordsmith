// ACT 1: THE QUEEN'S EYRIE, looking out: the hero at the eyrie's edge nearest its middle, the town far below under
// the cult's dome past it (render/outdoor.ts, the town in the sky's land).
//   DEPTH=7 node tools/playtest.mjs --file dist/act1.html --size 1014x468 --scenario tools/scenarios/act1_eyrie.mjs --out shots/act1/eyrie
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.god = true; });
  await page.waitForTimeout(600);
  const at = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 7; g.cleared = 6; g.enterDungeon();
    const L = g.level; L.explored.fill(1);
    g.monsters = [];
    const land = L.land; const f = L.floor;
    const b = land.areas.find((a) => a.role === 'boss').blob;
    let best = 1e9, ex = b.x, ey = b.y;
    for (let ty = Math.floor(b.y - 14); ty <= b.y + 14; ty++) for (let tx = Math.floor(b.x - 14); tx <= b.x + 14; tx++) {
      if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h || land.drop[ty * f.w + tx] !== 1) continue;
      const d = Math.hypot(tx + 0.5 - b.x, ty + 0.5 - b.y);
      if (d < best) { best = d; ex = tx + 0.5; ey = ty + 0.5; }
    }
    const k = Math.hypot(b.x - ex, b.y - ey) || 1;
    g.hero.x = ex + ((b.x - ex) / k) * 1.6; g.hero.y = ey + ((b.y - ey) / k) * 1.6;
    return { edge: [ex, ey], hero: [g.hero.x, g.hero.y] };
  });
  log('at', JSON.stringify(at));
  await page.waitForTimeout(1500);
  await snap('edge');
}
