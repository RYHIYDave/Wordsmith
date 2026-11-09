// THE SWAMP COLOSSUS'S DEATH IN HIS OWN PICTURES (the art chat's eye_death.ts, baked; COLOSSUS switched on for this page only): floor 10,
// his phases hurried through (their tentacles killed, his pillars put out with the ward-stone's pieces); the killing blow on his eye; his
// eye seizing and bursting, the spray of his ichor, his thrashing and last roar, his grip tearing loose, his melting and his teeth
// dropping, his sinking, the water boiling and still. Pictures every half second from the blow; filmed from it with --video.
//   node tools/build_to.mjs dist/colossus.html
//   node tools/playtest.mjs --file dist/colossus.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_death.mjs --out shots/colossus/death [--video shots/colossus/deathfilm]
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.colossus.on = true; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; h.pieces = 7; });
  await page.waitForTimeout(6000);
  const fight = 'window.__dbg.game().monsters.find((m) => m.boss && m.a1 && m.a1.fight).a1.fight';
  const stand = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; }, [u, v]);
  const until = async (test, secs) => { for (let i = 0; i < secs * 4; i++) { if (await page.evaluate(test)) return true; await page.waitForTimeout(250); } return false; };
  for (let i = 0; i < 60; i++) {
    await stand(8.5, 7);
    const begun = await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return !!f && f.mode !== 'idle'; });
    if (begun) break;
    await page.waitForTimeout(500);
  }
  const killArms = () => page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); });
  // (his waking, then phase 1's tentacles killed; phase 2's; his slide)
  await until(`${fight}.arms.length === 2 && ${fight}.arms.every((a) => a.state === 'stand' || a.state === 'slam')`, 12);
  await killArms();
  console.log('phase 2', await until(`${fight}.ph === 2 && ${fight}.mode === 'fight'`, 30));
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.shovelIn = 1e9; f.waterIn = 1e9; f.body2In = 1e9; });
  await page.waitForTimeout(2600);
  await killArms();
  console.log('phase 3', await until(`${fight}.ph === 3 && ${fight}.mode === 'fight'`, 20));
  // (his pillars put out with the pieces: his ward broken, the bolts stopped)
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const g = window.__dbg.game(); for (const p of g.level.pillars || []) if (p.lit) g.setPillarPiece(p); });
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.eyeIn = 1e9; });
  await until(`!${fight}.eye`, 6);
  await stand(8.5, 1.4);
  await page.waitForTimeout(2500);
  // THE KILLING BLOW on his eye
  if (snap.videoAt) console.log('film from', snap.videoAt().toFixed(1));
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); g.damageMonster(b, b.life + 100, 'phys', true); });
  console.log('killed', await page.evaluate(() => { const g = window.__dbg.game(); const p = g.perils.find((q) => q.a1 === 'eye:fight'); return p ? `peril a=${p.a} c=${p.c.toFixed(1)}` : 'no peril'; }));
  for (let i = 0; i < 26; i++) { await page.waitForTimeout(500); await snap(`d_${String(i).padStart(2, '0')}`); }
  console.log('after', await page.evaluate(() => { const g = window.__dbg.game(); const p = g.perils.find((q) => q.a1 === 'eye:fight'); return p ? `peril t=${(p.t - p.c).toFixed(1)}` : 'peril gone'; }));
}
