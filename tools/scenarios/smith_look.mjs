// THE WORDSMITH ON BONES AND HIS RING (art/smith3.ts, SMITH3; a mock-up: not in the game): pictures
// of him in the town at a phone's size, for the owner. The hero stands off to one side, so that the
// whole ring is seen; first a picture of it, then, from a moment before the wordsmith begins what he
// does now and then, a picture every tenth of a second of the town's time (it is slowed so that the
// camera keeps up) until he has done it; then the hero walks up to him and he turns to face her.
//   node tools/build_to.mjs dist/smith.html
//   node tools/playtest.mjs --file dist/smith.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/smith_look.mjs --out shots/smith/on
//   env: OFF=1: the same with the switch off (the wordsmith and his ring as they are in the game)
export default async function (page, snap) {
  const off = process.env.OFF === '1';
  await page.evaluate((off) => { const d = window.__dbg; d.saving(false); d.run('warrior', 31); d.smith3(!off); }, off);
  await page.waitForTimeout(800);
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 12.6; g.hero.y = 17.2; g.hero.fx = -0.7; g.hero.fy = -0.7; });
  await page.waitForTimeout(1500);
  await snap('still');
  // (when he next acts: so many rounds of his loop, then the act; his clock is set 6.4 s apart: art/townscene.ts)
  const plan = await page.evaluate(() => {
    const w = window.__dbg.renderer.art.folk.wordsmith;
    const rest = (w.loops * w.idle.length) / 10;
    const every = rest + w.act.length / 20;
    const u = (((window.__dbg.clock() + 6.4) % every) + every) % every;
    return { rest, every, act: w.act.length / 20, wait: ((rest - 0.6 - u) % every + every) % every };
  });
  console.log('plan', JSON.stringify(plan));
  await page.waitForTimeout(plan.wait * 1000);
  const slow = 0.2;
  await page.evaluate((s) => { window.__dbg.slowmo = s; }, slow);
  const step = 100 / slow;
  const n = Math.ceil((plan.act + 1.4) * 10);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  // (and close: he turns to whoever comes up to him)
  for (const [name, x, y] of [['near_se', 10.2, 14.4], ['near_ne', 9.2, 12.8]]) {
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [x, y]);
    await page.waitForTimeout(900);
    await snap(name);
  }
  snap.note('where', { smith: await page.evaluate(() => window.__dbg.at(9, 14)) });
}
