// THE STRONGHOLDS' FRONTS, A FLOOR'S OWN EACH, IN THE GAME (behind OWN_FRONTS, game/act1_dress.ts; art/hold_fronts.ts): floor N
// entered as an endless level with the switch on, its front stood in it with the cult's altar, braziers and banners before it (on 6 to 10 its own
// stronghold's yard, as the game lays it; elsewhere at the foot of a wall near where he comes in, as endless mode will put one),
// the hero before it; a picture of it sealed, and of it open. Pictures for his yes.
//   node tools/build_to.mjs dist/fronts.html
//   DEPTHS=1,2,3 node tools/playtest.mjs --file dist/fronts.html --size 844x390 --dpr 2 --scenario tools/scenarios/hold_fronts.mjs --out shots/fronts/f
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depths = String(process.env.DEPTHS || '1').split(',').map(Number);
  const seed = Number(process.env.SEED || 9);
  await page.evaluate(([s, LEAN]) => {
    const d = window.__dbg; d.saving(false); d.ownFronts.on = true; d.pictureLean.y = Number(LEAN); d.run('warrior', s); d.autoLevel = false; d.god = true; d.seasoned(12);
  }, [seed, process.env.LEAN || -60]);
  await page.waitForTimeout(600);
  for (const n of depths) {
    const info = await page.evaluate(([n, opts]) => {
      const d = window.__dbg;
      const g = d.game();
      // (as an endless level of that floor: no story on it, as endless mode has its strongholds)
      g.cleared = 20; g.endless = 1; g.endlessFloor = n; g.enterEndless();
      const L = g.level;
      L.explored.fill(1);
      g.monsters = g.monsters.filter((m) => m.boss && Math.hypot(m.x - g.hero.x, m.y - g.hero.y) > 30);
      const F = L.floor;
      const W = F.w;
      const floorAt = (x, y) => x >= 0 && y >= 0 && x < W && y < F.h && F.tiles[y * W + x] === 1 && !(F.cut && F.cut[y * W + x]);
      const wallAt = (x, y) => x >= 0 && y >= 0 && x < W && y < F.h && F.tiles[y * W + x] === 2;
      const q = L.land?.holds?.[0];
      let gx, gy, own = false;
      if (q) { gx = q.gx; gy = q.gy; own = true; }
      else {
        // (a wall's foot near where he comes in: the court's six by four floor, the wall behind it along x, nothing standing there)
        let best = null;
        const DEEP = 5;
        // (WALL: how much of the wall behind it; PICK: which of the places found, nearest first)
        const WALL = Number(opts.wall);
        const PICK = Number(opts.pick);
        const spots = [];
        for (let y = 2; y < F.h - 5; y++) for (let x = 4; x < W - 4; x++) {
          let ok = true;
          for (let ty = y; ty < y + DEEP && ok; ty++) for (let tx = x - 3; tx < x + 3 && ok; tx++) if (!floorAt(tx, ty)) ok = false;
          for (let tx = x - WALL; tx < x + WALL && ok; tx++) if (!wallAt(tx, y - 1)) ok = false;
          if (!ok) continue;
          const dd = Math.hypot(x - g.hero.x, y - g.hero.y);
          if (dd > 4) spots.push({ x, y, d: dd });
        }
        spots.sort((a, b) => a.d - b.d);
        best = spots[PICK] ?? null;
        if (!best) return { n, none: true };
        gx = best.x; gy = best.y;
        // (what stood there taken away: the court clear)
        L.props = L.props.filter((p) => !(p.tx >= gx - 3 && p.tx < gx + 3 && p.ty >= gy - 1 && p.ty < gy + 3));
        const put = (name, tx, ty, x, y, variant) => L.props.push({ kind: 'piece', name, tx, ty, x, y, solid: true, state: 0, variant });
        put(d.frontName(n), gx, gy, gx, gy, 0);
        L.props[L.props.length - 1].solid = false;
        put('the altar of the words', gx, gy + 1, gx, gy + 1.55, 0);
        put("the cult's brazier", gx - 3, gy + 1, gx - 2.3, gy + 1.1, 1);
        put("the cult's brazier", gx + 2, gy + 1, gx + 2.3, gy + 1.1, 3);
        put("the cult's banner", gx - 3, gy + 2, gx - 2.6, gy + 2.7, 0);
        put("the cult's banner", gx + 2, gy + 2, gx + 2.6, gy + 2.7, 2);
      }
      g.hero.x = gx + 2.3; g.hero.y = gy + 2.8; g.hero.fx = -0.7; g.hero.fy = -0.7;
      const gate = L.props.find((p) => p.tx === gx && p.ty === gy && p.kind === 'piece');
      return { n, own, at: [gx, gy], gate: gate?.name };
    }, [n, { wall: process.env.WALL || 2, pick: process.env.PICK || 0 }]);
    log('front', JSON.stringify(info));
    if (info.none) continue;
    await page.waitForTimeout(13000);
    await snap(`${String(n).padStart(2, '0')}_sealed`);
    await page.evaluate(([gx, gy]) => { const L = window.__dbg.game().level; for (const p of L.props) if (p.tx === gx && p.ty === gy && p.kind === 'piece') p.state = 1; }, info.at);
    await page.waitForTimeout(600);
    await snap(`${String(n).padStart(2, '0')}_open`);
  }
}
