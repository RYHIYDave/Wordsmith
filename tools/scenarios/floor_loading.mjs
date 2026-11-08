// THE LOADING SCREEN BETWEEN FLOORS (main.ts LOADING.between): a hero in town goes down into the first dungeon, then by the
// stairs to the next floor: each time the screen comes up as the level changes, stays its least, and goes; he plays on after.
// A line starting "!!" is something wrong.
//   node tools/playtest.mjs --file <page> [--serve] --touch --size 844x390 --scenario tools/scenarios/floor_loading.mjs --out shots/floor_loading
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 7); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const d = window.__dbg; d.seasoned(8); d.loadedHere(); });
  const watch = async (label, go) => {
    await page.evaluate(go);
    const t0 = Date.now();
    let seen = null; let shot = false; let gone = null;
    while (Date.now() - t0 < 20000) {
      const l = await page.evaluate(() => window.__dbg.loadingNow());
      if (l && !seen) seen = Date.now() - t0;
      if (l && !shot && l.t > 0.05) { await snap(`${label}_loading`); shot = true; }
      if (!l && seen !== null) { gone = Date.now() - t0; break; }
      await page.waitForTimeout(30);
    }
    const where = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, town: !!g.level.town }; });
    console.log(`  ${label}: up after ${seen} ms, gone after ${gone} ms; now ${JSON.stringify(where)}`);
    if (seen === null) console.log(`  !! ${label}: no loading screen`);
    if (gone === null) console.log(`  !! ${label}: the loading screen did not go`);
    await page.waitForTimeout(400);
    await snap(`${label}_after`);
  };
  await watch('a_into_floor1', () => window.__dbg.game().enterDungeon());
  await watch('b_down_to_floor2', () => { const g = window.__dbg.game(); g.depth++; g.enterDungeon(); });
  const moves = await page.evaluate(async () => { const g = window.__dbg.game(); const x = g.hero.x; return { x }; });
  console.log(`  hero at ${JSON.stringify(moves)}`);
  console.log(`  errors ${await page.evaluate(() => (window.__errors || []).length)}`);
}
