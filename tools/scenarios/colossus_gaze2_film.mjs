// THE SWAMP COLOSSUS'S PHASE 2 GAZE, FILMED (game/colossus_fight.ts GAZE2_AIMED; the queue's aim-colossus-phase-2-gaze): phase 2
// reached, the hero stood to one side of the stone (U, V: tiles), his gaze begun, the game slowed (dbg.slowmo) and photographed as
// fast as it will go, each picture named with the gaze's own time (frames of 30 a second), so that a film can be laid at an even 30
// a second from them (tools/gaze2_film.py). GAZE2=1 with the switch on, else as the game is.
//   GAZE2=1 U=2.5 V=2.5 node tools/playtest.mjs --file dist/gaze2.html --serve --touch --size 844x390 --dpr 2 \
//     --scenario tools/scenarios/colossus_gaze2_film.mjs --out shots/gaze2/on
export default async function (page, snap) {
  const on = process.env.GAZE2 === '1';
  const U = Number(process.env.U ?? 2.5);
  const V = Number(process.env.V ?? 2.5);
  await page.evaluate((on) => { const d = window.__dbg; d.colossus.on = true; d.gaze2.on = on; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; }, on);
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; });
  await page.waitForTimeout(6000);
  const put = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return !!f && f.mode !== 'idle'; }, [u, v]);
  for (let i = 0; i < 60; i++) { if (await put(8.5, 6)) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(2500);
  // (his first tentacles cut down as soon as they may be: again until his phase 2 is under way)
  for (let i = 0; i < 160; i++) {
    const ph = await page.evaluate(() => { const g = window.__dbg.game(); const f = g.monsters.find((m) => m.boss).a1.fight; if (f.ph === 1 && f.mode === 'fight') for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); return f.ph === 2 && f.mode === 'fight'; });
    if (ph) break;
    await page.waitForTimeout(500);
  }
  // (to his side of the stone; nothing else of his for a while: his shovel and water slams put off; his gaze next, a few seconds on, so
  // that its pictures are fetched)
  await put(U, V);
  await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; f.shovelIn = 1e9; f.waterIn = 1e9; f.body2Next = 'gaze'; f.body2In = 2.5; f.body2 = null; });
  // (at the game's own pace until about a second before it begins: it begins as his stand comes to frame BODY2.at, 24, once due)
  const before = () => page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; return f.body2 && f.body2.kind === 'gaze' ? 0 : f.body2 || f.body2In > 0 ? 9 : (((24 / 30 - (f.body % 3)) % 3) + 3) % 3; });
  for (let i = 0; i < 400; i++) { await put(U, V); if ((await before()) < 1.0) break; await page.waitForTimeout(40); }
  await page.evaluate(() => { window.__dbg.slowmo = 0.12; });
  const info = () => page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; const B = f.body2; return { gaze: !!B && B.kind === 'gaze', t: B ? B.t : -1, pic: B && B.pic !== undefined ? B.pic : null, a0: B ? B.a0 : 0, a1: B ? B.a1 : 0, time: f.time }; });
  // (each picture named by the fight's clock, thousandths of a second; the time the gaze began kept in a note beside them)
  let t0 = null;
  let shown = null;
  for (let i = 0; i < 3000; i++) {
    await put(U, V);
    const s = await info();
    if (s.gaze && t0 === null) {
      t0 = s.time - s.t;
      shown = s;
    }
    await snap(`t_${String(Math.round(s.time * 1000)).padStart(9, '0')}`);
    if (t0 !== null && s.time - t0 > 3.4 + 0.6) break;
  }
  snap.note('gaze', { t0, ...shown, on, U, V });
  console.log('gaze', JSON.stringify(shown), 'began at', t0);
}
