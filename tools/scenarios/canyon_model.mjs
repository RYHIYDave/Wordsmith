// THE CANYON'S PERSPECTIVE (his 7 Nov 2026, 11:52: the plateau tops and the canyon floor hard to tell apart, the walls not where
// they should be seen): a floor of the descent pictured where the hero stands in a few of its open areas, and with each picture what
// a rough 3D model of the same place needs (tools/canyon_model.py): the floor's walkable tiles round him, the camera, the rock's
// height. Nothing in the game changes.
//   DEPTH=8 node tools/playtest.mjs --file <page> --touch --size 844x390 --dpr 2 --scenario tools/scenarios/canyon_model.mjs --out shots/canyon/m8
export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 8);
  const seed = Number(process.env.SEED || 9);
  const picks = (process.env.AREAS || '1,3').split(',').map(Number);
  await page.evaluate((s) => { const d = window.__dbg; d.saving(false); d.run('warrior', s); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; }, seed);
  await page.waitForTimeout(600);
  const areas = await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    g.monsters = g.monsters.filter((m) => m.boss);
    const all = (L.land ? L.land.areas : []).filter((a) => a.role === 'path' || a.role === 'side' || a.role === 'lair');
    const k = Math.min(6, all.length);
    return Array.from({ length: k }, (_, i) => all[Math.floor(((i + 0.5) * all.length) / k)]).map((a) => [a.blob.x, a.blob.y]);
  }, depth);
  await page.waitForTimeout(Number(process.env.SETTLE || 4000));
  const out = [];
  for (const k of picks) {
    const at = areas[k];
    if (!at) continue;
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; }, at);
    await page.waitForTimeout(1200);
    const info = await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const L = g.level; const f = L.floor; const c = d.cam();
      const R = 34;
      const x0 = Math.max(0, Math.floor(g.hero.x) - R); const y0 = Math.max(0, Math.floor(g.hero.y) - R);
      const x1 = Math.min(f.w, Math.floor(g.hero.x) + R); const y1 = Math.min(f.h, Math.floor(g.hero.y) + R);
      const rows = [];
      for (let y = y0; y < y1; y++) { let s = ''; for (let x = x0; x < x1; x++) s += L.open[y * f.w + x] === 1 ? '1' : '0'; rows.push(s); }
      return { hero: [g.hero.x, g.hero.y], cam: { ox: c.ox, oy: c.oy, zoom: c.zoom ?? 1 }, x0, y0, rows, screen: [window.innerWidth, window.innerHeight] };
    });
    const name = `area${k}`;
    await snap(name);
    out.push({ name, ...info });
  }
  console.log('MODEL ' + JSON.stringify({ depth, seed, places: out }));
}
