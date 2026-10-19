// ACT 1, THE DESCENT: THE WAYS BETWEEN ITS FLOORS (game/ways.ts Ways.onward; game.ts): the boss of a floor met
// out in the open (his line said as the hero comes into his ground), struck down; the way on waking at the far end
// of his ground; walked into, the next floor (from the tenth, home: the siege broken). And the Prison's last floor
// cleared up its shaft: the town's waypoint takes him on to the first floor of the descent.
//   node tools/build_to.mjs dist/act1.html
//   DEPTH=6 node tools/playtest.mjs --file dist/act1.html --size 1014x468 --scenario tools/scenarios/act1_ways.mjs --out shots/act1/ways6
// DEPTH: the floor (6 to 15; 5: the shaft up, and the town's waypoint on; 10 and 15, home, and from 10 the waypoint on to 11).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 6);
  // (from the last floor there is, home: the tenth with Act 2 off, the fifteenth with it on)
  const ACT2 = await page.evaluate(() => window.__dbg.lastFloor ? window.__dbg.lastFloor() === 15 : true);
  const home = depth === 15 || (depth === 10);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(600);
  if (depth === 5) {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      g.depth = 5; g.cleared = 4; g.enterDungeon();
      g.bossReady();
      const b = g.boss; g.kill(b);
    });
    // (waited for, not timed: under a full regression's load the page is slow)
    const until = async (what, ms) => {
      for (let t = 0; t < ms; t += 500) { if (await page.evaluate(what)) return true; await page.waitForTimeout(500); }
      return false;
    };
    await page.waitForTimeout(6000);
    await until(() => !!window.__dbg.game().level.ways?.shaft, 15000);
    await page.evaluate(() => {
      const g = window.__dbg.game(); const sh = g.level.ways.shaft;
      g.hero.x = sh.x + 0.5; g.hero.y = sh.y + 0.5;
    });
    await page.waitForTimeout(5500);
    await until(() => window.__dbg.game().level.town, 40000);
    await page.waitForTimeout(1000);
    const town = await page.evaluate(() => { const g = window.__dbg.game(); const w = g.level.ways.way; g.hero.x = w.x; g.hero.y = w.y; return { town: g.level.town, wayDepth: g.wayDepth, hint: null }; });
    await page.waitForTimeout(400);
    log('town', JSON.stringify({ ...town, hint: await page.evaluate(() => window.__dbg.game().interactHint()) }));
    await snap('a_town_way');
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(2500);
    await until(() => { const g = window.__dbg.game(); return g.depth === 6 && !g.level.town; }, 15000);
    const warped = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, town: g.level.town, land: !!g.level.land }; });
    log('warped', JSON.stringify(warped));
    if (!town.town) log('!! not back in town up the shaft');
    if (warped.depth !== 6 || warped.town || !warped.land) log('!! the town\'s waypoint did not take him to The Quarry');
    await snap('b_floor6');
    return;
  }
  const info = await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    g.monsters = g.monsters.filter((m) => m.boss);
    const b = g.boss;
    const area = L.land.areas.find((a) => a.role === 'boss');
    return { boss: [b.kind, b.name, +b.x.toFixed(1), +b.y.toFixed(1)], area: [area.blob.x, area.blob.y], onward: L.ways.onward, met: g.bossMet };
  }, depth);
  log('floor', JSON.stringify(info));
  // (into his ground)
  await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y + 3; }, info.area);
  await page.waitForTimeout(700);
  const met = await page.evaluate(() => { const g = window.__dbg.game(); return { met: g.bossMet, intro: g.introT, waits: g.bossWaits(g.boss) }; });
  log('met', JSON.stringify(met));
  if (!met.met) log('!! he was not met coming into his ground');
  await snap('a_intro');
  await page.evaluate(() => { const g = window.__dbg.game(); g.bossReady(); g.kill(g.boss); });
  await page.waitForTimeout(1200);
  const on = await page.evaluate(() => window.__dbg.game().level.ways.onward);
  log('onward', JSON.stringify(on));
  if (!on || !on.awake) log('!! the way on did not wake as he died');
  await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x - 1.6; g.hero.y = y + 1.2; }, [on.x, on.y]);
  await page.waitForTimeout(900);
  await snap('b_way_on');
  await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [on.x, on.y]);
  await page.waitForTimeout(1600);
  // (through the curtain: the next floor, or from the tenth, home)
  let after = null;
  for (let i = 0; i < 12; i++) {
    after = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, town: g.level.town, cleared: g.cleared, wayDepth: g.wayDepth }; });
    if (home ? after.town : after.depth === depth + 1) break;
    await page.waitForTimeout(500);
  }
  log('after', JSON.stringify(after));
  if (home ? !after.town : after.depth !== depth + 1 || after.town) log('!! the way on did not take him on');
  await snap('c_next');
  // (ACT 2, THE HUSH, on since Version 23.0: home from the tenth, the siege broken, the town's waypoint takes him on to the
  // Gate Ward, floor 11)
  if (depth === 10 && ACT2) {
    await page.waitForTimeout(1500);
    await page.evaluate(() => { const g = window.__dbg.game(); const w = g.level.ways.way; g.hero.x = w.x; g.hero.y = w.y; });
    await page.waitForTimeout(400);
    log('town way', JSON.stringify({ wayDepth: await page.evaluate(() => window.__dbg.game().wayDepth), hint: await page.evaluate(() => window.__dbg.game().interactHint()) }));
    await page.keyboard.press('KeyE');
    let on11 = null;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(500);
      on11 = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, town: g.level.town, land: !!g.level.land }; });
      if (on11.depth === 11 && !on11.town) break;
    }
    log('warped', JSON.stringify(on11));
    if (!on11 || on11.depth !== 11 || on11.town || !on11.land) log("!! the town's waypoint did not take him on to floor 11");
    await snap('d_floor11');
  }
}
