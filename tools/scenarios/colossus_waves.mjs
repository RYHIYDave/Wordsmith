// THE SWAMP COLOSSUS'S WATER SLAMS CLOSE (render/act1_fx/colossus_fx.ts): phase 2 reached, both at once, a picture every fifth of a second.
//   node tools/playtest.mjs --file dist/colossus.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_waves.mjs --out shots/colossus/w
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.colossus.on = true; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; });
  await page.waitForTimeout(6000);
  const put = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return !!f && f.mode !== 'idle'; }, [u, v]);
  for (let i = 0; i < 60; i++) { if (await put(8.5, 6)) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); });
  for (let i = 0; i < 60; i++) { await page.waitForTimeout(500); const ph = await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; return f.ph === 2 && f.mode === 'fight'; }); if (ph) break; }
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.shovelIn = 1e9; f.body2In = 1e9; f.waterNext = 'both'; f.waterIn = 0; });
  for (let i = 0; i < 30; i++) { await page.waitForTimeout(200); await snap(`w${String(i).padStart(2, '0')}`); }
}
