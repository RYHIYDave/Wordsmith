// ENEMIES COMING IN UP OUT OF RIFTS (game/arrivals.ts ARRIVALS, off): his words, 7 Nov 2026, 00:05 (Eastern), “make the enemies
// coming in a little more dramaitc than just spawning into thin air”. Switched on for this page: on floor DEPTH (11 by default) the
// Bells begun and the Hush let rise round him, pictures as the rifts open, as they come up, and once they are out. WHERE=hold: in
// a stronghold's hall on floor 6, its first wave coming up instead. ON=0: as it is in the game now.
//   node tools/build_to.mjs dist/arrive.html
//   node tools/playtest.mjs --file dist/arrive.html --size 844x390 --dpr 2 --scenario tools/scenarios/arrivals.mjs --out shots/arrive/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  const on = process.env.ON !== '0';
  const where = process.env.WHERE || 'bells';
  const depth = Number(process.env.DEPTH || (where === 'hold' ? 6 : 11));
  const info = await page.evaluate(([n, on, where]) => {
    const d = window.__dbg;
    d.saving(false); d.run('warrior', 5); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.seasoned(where === 'hold' ? 14 : 28);
    d.arrivals.on = on;
    if (where === 'hold') {
      const g = d.game();
      g.depth = n; g.cleared = n - 1; g.enterDungeon();
      const L = g.level;
      L.explored.fill(1);
      const q = L.land.holds[0];
      L.holds[0].open = true;
      for (const m of g.monsters) if (m.packId >= 9100) m.dead = true;
      g.hero.x = q.gx - 0.5; g.hero.y = q.gy + 0.4;
      return { hold: q.inside };
    }
    d.act2(true, n);
    const g = d.game();
    const L = g.level;
    g.monsters = g.monsters.filter((m) => m.boss);
    const B = L.bells;
    g.hero.x = B.plan.muffled.x - 1.2;
    g.hero.y = B.plan.muffled.y + 1.6;
    return { bells: B.plan.bells.length };
  }, [depth, on, where]);
  log('set', JSON.stringify(info));
  if (where === 'hold') {
    // (in through the door: the first wave comes up as he comes in)
    for (let k = 0; k < 20; k++) {
      await page.waitForTimeout(100);
      if (await page.evaluate(() => window.__dbg.game().level.holds[0].entered)) break;
    }
    await page.evaluate(() => { const g = window.__dbg.game(); const q = g.level.land.holds[0]; g.hero.x = q.fight.x - 1; g.hero.y = q.fight.y + 3.2; });
  } else {
    await page.waitForTimeout(5000);
    await page.evaluate(() => { const g = window.__dbg.game(); const m = g.level.bells.plan.muffled; g.bellsStruck(m.x, m.y, 0.5); });
    // (the Hush's first rising is a moment and a half on: wait for its rifts)
    for (let k = 0; k < 40; k++) {
      await page.waitForTimeout(100);
      if (await page.evaluate(() => window.__dbg.game().risers.length > 0 || window.__dbg.game().level.bells.risen > 0)) break;
    }
  }
  const state = () => page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return { risers: g.risers.length, ages: g.risers.map((r) => +r.age.toFixed(2)), at: g.risers.map((r) => [+(r.m.x - h.x).toFixed(1), +(r.m.y - h.y).toFixed(1)]), rifts: window.__dbg.fx.rifts.map((f) => [+f.t.toFixed(2), f.r]), monsters: g.monsters.filter((m) => !m.dead && !m.boss).length }; });
  log('coming', JSON.stringify(await state()));
  await page.waitForTimeout(200);
  await snap('1_the_rifts_open');
  await page.waitForTimeout(350);
  log('rising', JSON.stringify(await state()));
  await snap('2_coming_up');
  await page.waitForTimeout(350);
  await snap('3_nearly_out');
  await page.waitForTimeout(700);
  log('out', JSON.stringify(await state()));
  await snap('4_out_and_at_him');
}
