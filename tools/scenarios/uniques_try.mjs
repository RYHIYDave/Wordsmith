// THE UNIQUE ITEMS' TEST PAGE, PLAYED AS IT IS PUBLISHED (tools/uniques_try_page.mjs: dist/try_uniques/index.html, served from its
// folder with its four folders beside it). With a finger, as he would: its starting screen (the stamp TEST UNIQUES on it), Options,
// the level select, a floor, a hero; the test hero on the floor with his fifteen uniques in his bag, each with its own picture;
// one read, one put on; the waypoint touched, the town, the stash touched: the bosses' own and the final boss's two on its
// shelves. Nothing is switched on by the playtest: the page is built so.
//   node tools/uniques_try_page.mjs
//   node tools/playtest.mjs --file dist/try_uniques/index.html --serve --touch --size 852x393 --dpr 3 \
//     --scenario tools/scenarios/uniques_try.mjs --out shots/try_uniques/warrior
// FLOOR: which floor (8). CLS: which hero (warrior).
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const want = Number(process.env.FLOOR || 8);
  const cls = process.env.CLS || 'warrior';
  const hands = await makeHands(page);
  await page.waitForTimeout(800);
  const built = await page.evaluate(() => { const d = window.__dbg; return { uniques: d.uniques.on, art: d.uniqueArt.on, stamp: d.build ?? null }; });
  log('the page as built', JSON.stringify(built));
  if (!built.uniques || !built.art) bad('the page does not have both switches on');
  await snap('1_starting_screen');
  await hands.press('button:OPTIONS');
  await page.waitForTimeout(300);
  await hands.press('button:LEVEL SELECT');
  await page.waitForTimeout(300);
  await hands.press(`floor:${want}`);
  await page.waitForTimeout(400);
  await hands.press(`class:${cls}`);
  // (the loading screen, then the floor)
  await page.waitForFunction(() => { const g = window.__dbg.game(); return !!g && !g.level.town && g.trial === true; }, null, { timeout: 30000 });
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    const u = (it) => !!it && it.rarity === 3 && !!it.unique;
    return {
      depth: g.depth, trial: g.trial, level: h.level,
      bag: h.bag.filter(u).map((it) => it.unique), stash: g.meta.stash.filter(u).map((it) => it.unique),
      cannot: [...h.bag, ...g.meta.stash].filter(u).filter((it) => g.useProblem(it) !== null).map((it) => it.unique),
    };
  });
  log('the test hero', `floor ${st.depth}, level ${st.level}, trial=${st.trial}; ${st.bag.length} uniques in his bag, ${st.stash.length} in his stash; ${st.cannot.length} he cannot wear`);
  if (st.depth !== want || !st.trial) bad('not the level select\'s test hero on the floor asked for');
  if (st.bag.length !== 15) bad(`his bag has ${st.bag.length} uniques, not his fifteen`);
  if (st.stash.length !== 22) bad(`his stash has ${st.stash.length} uniques, not the twenty-two`);
  if (st.cannot.length) bad(`he cannot wear ${st.cannot.join(', ')}`);
  await snap('2_on_the_floor');
  // the bag, with a finger: INVENTORY, then the first piece read
  if (!(await hands.press('button:INVENTORY'))) await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(500);
  await page.evaluate(() => { const d = window.__dbg; d.invUi.page = 'gear'; d.invUi.sel = null; });
  await page.waitForTimeout(400);
  await snap('3_his_bag');
  await page.evaluate(() => { window.__dbg.invUi.sel = { kind: 'bag', i: 0 }; });
  await page.waitForTimeout(300);
  await snap('4_one_read');
  // one put on: his weapon's first (the rule that works for him), and it counts as worn
  const worn = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const i = h.bag.findIndex((it) => it && it.unique && it.slot === 'mainhand');
    const id = i >= 0 ? h.bag[i].unique : null;
    const why = i >= 0 ? g.equipFromBag(i) : 'no weapon of his among them';
    d.invUi.sel = null;
    return { id, why, worn: g.worn };
  });
  log('one put on', JSON.stringify(worn));
  if (worn.why !== null || !worn.worn.includes(worn.id)) bad(`${worn.id} was not put on and counted as worn`);
  await page.waitForTimeout(400);
  await snap('5_one_put_on');
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  await page.waitForTimeout(300);
  // to town by the waypoint beside where he came in (every floor but the first has one), then the stash, both touched
  if (want >= 2) {
    const town = () => page.evaluate(() => { const g = window.__dbg.game(); return !!g && g.level.town === true; });
    let p = await page.evaluate(() => { const d = window.__dbg; const w = d.game().level.ways?.way; return w ? d.at(w.x, w.y) : null; });
    if (!p) bad('no waypoint on this floor');
    else {
      await hands.pressAt(p.x, p.y - 4);
      const t0 = Date.now();
      while (!(await town()) && Date.now() - t0 < 12000) await page.waitForTimeout(200);
      if (!(await town())) bad('touching the waypoint did not bring him to town');
      await page.waitForTimeout(1500);
      await snap('6_in_town');
      // (where the stash is to a finger: a point on it that the game takes for the stash, in view and clear of the buttons)
      const stashAt = () => page.evaluate(() => {
        const d = window.__dbg; const s = d.game().level.stations.find((q) => q.kind === 'stash');
        if (!s) return null;
        const at = d.at(s.x, s.y);
        for (const dy of [-10, -15, -5, 0, -20]) {
          const y = at.y + dy;
          if (at.x > 8 && y > 8 && at.x < d.screen.w - 8 && y < d.screen.h - 8 && d.spot(at.x, y) === 'stash') return { x: at.x, y, seen: true };
        }
        return { x: at.x, y: at.y - 10, seen: false };
      });
      p = await stashAt();
      // (in the towns where the stash is not in view from the waypoint he would walk to it: the playtest sets him down a few
      // steps to its side instead, on open floor and not in front of it, and says so; the touch is still a finger's)
      if (p && !p.seen) {
        const set = await page.evaluate(() => {
          const g = window.__dbg.game(); const s = g.level.stations.find((q) => q.kind === 'stash');
          for (const [dx, dy] of [[2.6, -1.4], [-1.4, 2.6], [3, 0], [0, 3], [2.4, 2.4]]) {
            if (g.isOpen(s.x + dx, s.y + dy)) { g.hero.x = s.x + dx; g.hero.y = s.y + dy; return [dx, dy]; }
          }
          return null;
        });
        log('the stash is out of view from the waypoint', set ? `he is set down beside it (${set.join(', ')} from it)` : 'no open floor found beside it');
        await hands.settle();
        p = await stashAt();
        if (p && !p.seen) bad('the stash is not to be touched from beside it either');
      }
      if (!p) bad('no stash in this town');
      else {
        await hands.pressAt(p.x, p.y - 10);
        const open = () => page.evaluate(() => window.__dbg.panels.open);
        const t1 = Date.now();
        while ((await open()) !== 'stash' && Date.now() - t1 < 12000) await page.waitForTimeout(200);
        if ((await open()) !== 'stash') bad(`touching the stash did not open it (${await open()})`);
        await page.waitForTimeout(600);
        await snap('7_the_stash');
      }
    }
  }
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
