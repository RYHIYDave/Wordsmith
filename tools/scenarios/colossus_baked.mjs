// THE SWAMP COLOSSUS'S FIGHT IN HIS OWN PICTURES (render/colossus_baked.ts; COLOSSUS switched on for this page only): floor 10, the hero
// carried across onto his stone; phase 1 (his lurk, his two tentacles standing and slamming), his tentacles killed, his entrance, phase 2
// (his stand, three tentacles, a water slam from each side and both at once, slams on the stone). The hero kept alive. Pictures at its
// beats; filmed with --video.
//   node tools/build_to.mjs dist/colossus.html      (with his bake packed: tools/colossus_ship.mjs)
//   node tools/playtest.mjs --file dist/colossus.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_baked.mjs --out shots/colossus/b [--video shots/colossus/film]
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.colossus.on = true; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; });
  await page.waitForTimeout(6000);
  const info = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight;
    return f ? { t: +f.time.toFixed(1), ph: f.ph, mode: f.mode, arms: f.arms.map((a) => `${a.state}${a.state === 'slam' ? a.turn : ''}`).join(','), waves: f.waves.length } : { none: true };
  });
  // onto the stone, a little in from its middle (again until his fight has begun: the crossing may still be carrying him)
  for (let i = 0; i < 60; i++) {
    const begun = await page.evaluate(() => { const g = window.__dbg.game(); const S = g.level.land.stone; const u = 8.5, v = 7; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return !!f && f.mode !== 'idle'; });
    if (begun) break;
    await page.waitForTimeout(500);
  }
  console.log('begun', JSON.stringify(await info()));
  if (snap.videoAt) snap.videoAt();
  // PHASE 1: his lurk; his two tentacles' bursts, stands and slams
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(1000); await snap(`p1_${String(i).padStart(2, '0')}`); }
  console.log('phase 1', JSON.stringify(await info()));
  // his tentacles killed: their deaths; between; his entrance
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); });
  for (let i = 0; i < 16; i++) { await page.waitForTimeout(1000); await snap(`ch_${String(i).padStart(2, '0')}`); }
  console.log('phase 2?', JSON.stringify(await info()));
  // PHASE 2: a water slam from each side, and both at once; slams on the stone between
  for (const side of ['l', 'r', 'both']) {
    await page.evaluate((s) => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.waterNext = s; f.waterIn = 0; f.shovelIn = 1e9; }, side);
    for (let i = 0; i < 5; i++) { await page.waitForTimeout(1000); await snap(`w${side}_${i}`); }
  }
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.waterIn = 1e9; });
  for (let i = 0; i < 4; i++) { await page.waitForTimeout(1000); await snap(`p2_${i}`); }
  // HIS BODY'S OWN ATTACKS: the bile arc, then the gaze (each as his stand comes round to its frame)
  for (const kind of ['bile', 'gaze']) {
    await page.evaluate((k) => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.body2Next = k; f.body2In = 0; }, kind);
    for (let i = 0; i < 7; i++) { await page.waitForTimeout(1000); await snap(`${kind}_${i}`); }
  }
  // HIS SHOVEL, at each end (the hero near the left end the first time: his snap)
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.body2In = 1e9; f.shovelIn = 0; });
  for (let i = 0; i < 26; i++) { await page.waitForTimeout(600); await snap(`sh_${String(i).padStart(2, '0')}`); }
  console.log('end', JSON.stringify(await info()));
}
