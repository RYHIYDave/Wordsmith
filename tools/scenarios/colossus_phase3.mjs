// THE SWAMP COLOSSUS'S PHASE 3 IN HIS OWN PICTURES (the art chat's eye_phase3.ts, baked; COLOSSUS switched on for this page only): floor
// 10, the hero on his stone; phases 1 and 2 hurried through (their tentacles killed); his slide forward and his grip on the stone's edge;
// the pillars blazing and his ward coming on; his eye slam, his gaze, a blow turned by his ward, the bolts; a piece set into the left
// pillar, the right broken by blows, a piece set into the near one, his ward breaking; his eye struck. The hero kept alive. Pictures at
// its beats; filmed from his slide with --video.
//   node tools/build_to.mjs dist/colossus.html
//   node tools/playtest.mjs --file dist/colossus.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_phase3.mjs --out shots/colossus/p3 [--video shots/colossus/p3film]
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.colossus.on = true; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; h.pieces = 7; });
  await page.waitForTimeout(6000);
  const fight = () => 'window.__dbg.game().monsters.find((m) => m.boss).a1.fight';
  const info = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight;
    return f ? { t: +f.time.toFixed(1), ph: f.ph, mode: f.mode, eye: f.eye ? `${f.eye.kind}${f.eye.pic}` : '', shielded: f.shielded, siege: f.siege, rains: f.rains.length, pillars: (g.level.pillars || []).map((p) => (p.lit ? 'lit' : p.by)).join(',') } : { none: true };
  });
  // (where the hero stands on the stone: u along it, v in from its back edge)
  const stand = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; }, [u, v]);
  const until = async (test, secs) => { for (let i = 0; i < secs * 4; i++) { if (await page.evaluate(test)) return true; await page.waitForTimeout(250); } return false; };
  // onto the stone (again until his fight has begun: the crossing may still be carrying him)
  for (let i = 0; i < 60; i++) {
    await stand(8.5, 7);
    const begun = await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return !!f && f.mode !== 'idle'; });
    if (begun) break;
    await page.waitForTimeout(500);
  }
  console.log('begun', JSON.stringify(await info()));
  const killArms = () => page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); });
  // PHASES 1 AND 2, hurried: their tentacles killed as they stand (phase 1's after his waking)
  await until(`(() => { const f = ${fight()}; return f.arms.length === 2 && f.arms.every((a) => a.state !== 'rise'); })()`, 12);
  await killArms();
  console.log('phase 2 come', await until(`(() => { const f = ${fight()}; return f.ph === 2 && f.mode === 'fight'; })()`, 30));
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.shovelIn = 1e9; f.waterIn = 1e9; f.body2In = 1e9; });
  await page.waitForTimeout(2600);
  await killArms();
  await until(`${fight()}.mode === 'change'`, 20);
  if (snap.videoAt) console.log('film from', snap.videoAt().toFixed(1));
  console.log('change', JSON.stringify(await info()));
  // HIS SLIDE FORWARD (his stand to its frame 24, then 4.0 s), his grip on the stone's edge
  for (let i = 0; i < 11; i++) { await page.waitForTimeout(500); await snap(`slide_${String(i).padStart(2, '0')}`); }
  await until(`${fight()}.ph === 3`, 6);
  console.log('phase 3', JSON.stringify(await info()));
  // THE PILLARS BLAZE, HIS WARD COMES ON
  for (let i = 0; i < 3; i++) { await page.waitForTimeout(400); await snap(`blaze_${i}`); }
  // (his eye's attacks held back, and what is under way let finish: the next ones forced below)
  const hold = `(() => { const f = ${fight()}; f.eyeIn = 1e9; return !f.eye; })()`;
  await until(hold, 6);
  await page.evaluate(hold);
  // HIS EYE SLAM at the hero (begun as his stand comes round)
  await stand(10.5, 4.5);
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.eyeNext = 'slam'; f.eyeIn = 0; });
  await until(`!!${fight()}.eye`, 4);
  console.log('slam', JSON.stringify(await info()));
  for (let i = 0; i < 9; i++) { await page.waitForTimeout(330); await snap(`slam_${i}`); }
  await until(hold, 6);
  await page.evaluate(hold);
  // A BLOW AT HIM, TURNED BY HIS WARD
  await stand(8.5, 1.2);
  await page.evaluate(() => { const g = window.__dbg.game(); g.damageMonster(g.monsters.find((m) => m.boss), 20, 'phys', true); });
  for (let i = 0; i < 2; i++) { await page.waitForTimeout(150); await snap(`warded_${i}`); }
  // HIS GAZE from his new place, toward the hero off to his left
  await stand(4, 6);
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.eyeNext = 'gaze'; f.eyeIn = 0; });
  await until(`!!${fight()}.eye`, 4);
  console.log('gaze', JSON.stringify(await info()));
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(330); await snap(`gaze_${i}`); }
  await until(hold, 6);
  await page.evaluate(hold);
  // THE PILLARS PUT OUT: a piece set into the left; the right broken by blows; a piece set into the near one, and his ward breaks
  await stand(0.4, 6);
  await page.evaluate(() => { const g = window.__dbg.game(); g.setPillarPiece(g.level.pillars[0]); });
  for (let i = 0; i < 4; i++) { await page.waitForTimeout(250); await snap(`left_${i}`); }
  await stand(16.6, 6);
  await page.evaluate(() => { const g = window.__dbg.game(); const p = g.level.pillars[1]; p.hits = 11; p.last = -99; g.pillarsStruck(p.x, p.y, 0.5); });
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(250); await snap(`right_${i}`); }
  await stand(8.5, 10.6);
  await page.evaluate(() => { const g = window.__dbg.game(); g.setPillarPiece(g.level.pillars[2]); });
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(250); await snap(`near_${i}`); }
  console.log('siege broken', JSON.stringify(await info()));
  // HIS EYE STRUCK, now his ward is gone (at rest)
  await stand(8.5, 1.2);
  await until(hold, 6);
  await page.evaluate(hold);
  await page.waitForTimeout(300);
  await page.evaluate(() => { const g = window.__dbg.game(); g.damageMonster(g.monsters.find((m) => m.boss), 20, 'phys', true); });
  for (let i = 0; i < 4; i++) { await page.waitForTimeout(170); await snap(`struck_${i}`); }
  console.log('end', JSON.stringify(await info()));
}
