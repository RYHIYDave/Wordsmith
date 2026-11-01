// ACT1_SCENES in the game: a still of each scene of a floor of the descent (game/act1_dress.ts), the hero a few steps before it.
//   DEPTH=6 SEED=9 node tools/playtest.mjs --file dist/act1_scenes.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/act1_scenes_look.mjs --out shots/a1sc
export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 6);
  const seed = Number(process.env.SEED || 9);
  await page.evaluate((s) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', s); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; }, seed);
  await page.waitForTimeout(600);
  const info = await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    for (const m of g.monsters) m.dead = true;
    g.monsters = []; g.waveT = 1e9; window.__dbg.bot(false);
    return { depth: g.depth, scenes: (L.act1 && L.act1.scenes) || [] };
  }, depth);
  console.log(JSON.stringify(info).slice(0, 600));
  await page.waitForTimeout(3000);
  const seen = new Map();
  for (const s of info.scenes) {
    const k = (seen.get(s.name) || 0) + 1;
    seen.set(s.name, k);
    if (k > 2) continue;
    await page.evaluate(([x, y]) => {
      const g = window.__dbg.game();
      const h = g.hero;
      for (const [dx, dy] of [[3, 3], [3.5, 2], [2, 3.5], [4, 4], [2.5, 2.5], [-3, 3], [3, -3]]) {
        if (g.isOpen(x + dx, y + dy)) { h.x = x + dx; h.y = y + dy; break; }
      }
      h.fx = -0.7; h.fy = -0.7;
    }, [s.x, s.y]);
    await page.waitForTimeout(1500);
    await snap(`${s.name.replace(/[^a-z]+/gi, '_')}_${k}`);
  }
}
