// THE SWAMP COLOSSUS'S FIGHT IN THE GAME (game/colossus_fight.ts, COLOSSUS switched on for this page only): floor 10 laid with his
// stone, the hero carried across from the landing onto it, his fight stepped; pictures at its beats (phase 1's slams, phase 2's
// water slams and shovel, phase 3's rain), the hero kept alive. Stand-ins for his pictures (render/act1_fx/colossus.ts).
//   node tools/build_to.mjs dist/colossus.html
//   node tools/playtest.mjs --file dist/colossus.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_look.mjs --out shots/colossus/a
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.colossus.on = true; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; });
  await page.waitForTimeout(6000);
  const info = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight;
    return f ? { t: +f.time.toFixed(1), ph: f.ph, mode: f.mode, arms: f.arms.map((a) => a.state).join(','), waves: f.waves.length, shovel: f.shovel ? +f.shovel.t.toFixed(1) : null, life: Math.round(b.life) } : { none: true, hero: [g.hero.x, g.hero.y] };
  });
  console.log('across', JSON.stringify(await info()));
  // onto the stone, a little in
  await page.evaluate(() => { const g = window.__dbg.game(); const S = g.level.land.stone; const u = 8.5, v = 8; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; });
  for (let i = 0; i < 8; i++) { await page.waitForTimeout(700); await snap(`p1_${i}`); }
  console.log('phase 1', JSON.stringify(await info()));
  const killArms = () => page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); });
  await killArms();
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(2200); await snap(`ch2_${i}`); }
  console.log('phase 2?', JSON.stringify(await info()));
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.waterNext = 'both'; f.waterIn = 0; });
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(600); await snap(`w_${i}`); }
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.waterIn = 1e9; f.shovelIn = 0; });
  for (let i = 0; i < 12; i++) { await page.waitForTimeout(900); await snap(`s_${i}`); }
  console.log('shovel', JSON.stringify(await info()));
}
