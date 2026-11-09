// THE SWAMP COLOSSUS'S PHASE 1 IN HIS OWN PICTURES, CLOSE: his two tentacles' slams, a picture every quarter second, the hero standing in
// different places so that the slams come at many turns (each lying along its warning's line?).
//   node tools/playtest.mjs --file dist/colossus.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_slams.mjs --out shots/colossus/s
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.colossus.on = true; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; });
  await page.waitForTimeout(6000);
  const put = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return !!f && f.mode !== 'idle'; }, [u, v]);
  for (let i = 0; i < 60; i++) { if (await put(8.5, 7)) break; await page.waitForTimeout(500); }
  const spots = [[8.5, 7], [3, 3], [14, 9], [2, 9], [15, 2]];
  let n = 0;
  for (const [u, v] of spots) {
    for (let i = 0; i < 24; i++) {
      await put(u, v);
      await page.waitForTimeout(250);
      const st = await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; return f.arms.map((a) => `${a.state}${a.state === 'slam' ? a.turn + '@' + Math.floor(a.t * 30) : ''}`).join(','); });
      if (/slam/.test(st)) { await snap(`s${String(n++).padStart(3, '0')}`); console.log(n - 1, u, v, st); }
    }
  }
}
