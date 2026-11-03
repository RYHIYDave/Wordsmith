// ACT1_SCENES in the game: a still of each scene of a floor of the descent (game/act1_dress.ts), the hero a few steps before it
// (NEAR: how many, 5).
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
    // (the hero on the scene's own ground, a few steps before it: walked to from it, as far toward the eye as six steps go)
    await page.evaluate(([x, y, near]) => {
      const g = window.__dbg.game();
      const L = g.level;
      const f = L.floor;
      const h = g.hero;
      const start = Math.floor(y) * f.w + Math.floor(x);
      const dist = new Map([[start, 0]]);
      const q = [start];
      for (let k = 0; k < q.length; k++) {
        const i = q[k];
        const d = dist.get(i);
        if (d >= 7) continue;
        for (const j of [i - 1, i + 1, i - f.w, i + f.w]) {
          if (dist.has(j) || L.walk[j] !== 1) continue;
          dist.set(j, d + 1);
          q.push(j);
        }
      }
      let best = null;
      let score = -1e9;
      for (const [i] of dist) {
        const tx = i % f.w;
        const ty = Math.floor(i / f.w);
        const dx = tx - Math.floor(x);
        const dy = ty - Math.floor(y);
        const sc = dx + dy - Math.abs(dx - dy) * 0.6 - Math.abs(dx + dy - near) * 1.5;
        if (sc > score) { score = sc; best = [tx + 0.5, ty + 0.5]; }
      }
      if (best) { h.x = best[0]; h.y = best[1]; }
      h.fx = -0.7; h.fy = -0.7;
    }, [s.x, s.y, Number(process.env.NEAR || 5)]);
    await page.waitForTimeout(1500);
    await snap(`${s.name.replace(/[^a-z]+/gi, '_')}_${k}`);
  }
}
