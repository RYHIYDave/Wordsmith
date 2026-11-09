// THE SWAMP COLOSSUS WAKING (his 8 Nov 22:34: nothing as the hero steps onto the stone, then bubbles, then his two tentacles and his eye
// lurking; game/colossus_fight.ts WAKE), and phase 1's slams at their pace (one at most every 3 s: his “Half as often”). COLOSSUS
// switched on for this page only; the hero kept alive. Pictures every half second; filmed with --video.
//   node tools/build_to.mjs dist/colossus.html
//   node tools/playtest.mjs --file dist/colossus.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_wake.mjs --out shots/colossus/wake [--video shots/colossus/wakefilm]
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.colossus.on = true; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; });
  await page.waitForTimeout(6000);
  const info = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight;
    return f ? { t: +f.time.toFixed(1), mode: f.mode, wake: f.wakeT === null ? null : +f.wakeT.toFixed(1), arms: f.arms.map((a) => a.state).join(',') } : { none: true };
  });
  // (on the jetty's head, then onto the stone: his fight begins as the hero steps on)
  const stand = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; }, [u, v]);
  for (let i = 0; i < 40; i++) {
    await stand(8.5, 11.6);
    const ok = await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); return !!(b && b.a1); });
    if (ok) break;
    await page.waitForTimeout(500);
  }
  if (snap.videoAt) console.log('film from', snap.videoAt().toFixed(1));
  await snap('before');
  await page.waitForTimeout(800);
  await stand(8.5, 8.5);
  for (let i = 0; i < 30; i++) {
    const m = await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((q) => q.boss); return b.a1.fight ? b.a1.fight.mode : 'none'; });
    if (m !== 'idle' && m !== 'none') break;
    await stand(8.5, 8.5);
    await page.waitForTimeout(200);
  }
  console.log('begun', JSON.stringify(await info()));
  for (let i = 0; i < 14; i++) { await page.waitForTimeout(500); await snap(`wake_${String(i).padStart(2, '0')}`); }
  console.log('risen', JSON.stringify(await info()));
  // PHASE 1 AT ITS PACE: a slam at most every 3 s
  const warns = [];
  for (let i = 0; i < 24; i++) {
    await page.waitForTimeout(500);
    const w = await page.evaluate(() => { const f = window.__dbg.game().monsters.find((m) => m.boss).a1.fight; return f.arms.filter((a) => a.state === 'slam').map((a) => `${a.id}@${(f.time - a.t).toFixed(1)}`); });
    for (const x of w) if (!warns.includes(x)) warns.push(x);
    if (i % 4 === 0) await snap(`p1_${String(i).padStart(2, '0')}`);
  }
  console.log('slams begun', warns.join(' '));
}
