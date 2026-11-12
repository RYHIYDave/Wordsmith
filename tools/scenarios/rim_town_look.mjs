// THE ENDLESS TOWN, THE SHAFT'S RIM (game/rim.ts, render/rim.ts; behind ENDLESS_TOWN, switched on here by the test hook,
// __dbg.endlessTown): its pictures from the game, for him.
//   1. a hero for whom endless is open comes home: the Shaft's Rim, before its gate;
//   2. at the gate, the record stone and the trophies wall;
//   3. at the brink, by the way down;
//   4. on the portal's landing;
//   5. at the wordsmith's ring, the bench with the tablet's socket;
//   6. by the bazaar, the front right.
//   node tools/build_to.mjs dist/rim.html
//   node tools/playtest.mjs --file dist/rim.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/rim_town_look.mjs --out shots/rim/phone
import { log } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); });
  await page.waitForTimeout(300);
  const home = await page.evaluate(() => {
    const d = window.__dbg;
    d.run('warrior', 61);
    d.seasoned(30);
    d.autoLevel = false; d.autoWords = false;
    d.endlessTown(true, 7);
    const g = d.game();
    window.__dbg.fx.messages.length = 0;
    return { town: !!g.level.town, rim: !!g.level.rim, notches: g.level.rim && g.level.rim.notches, x: g.hero.x, y: g.hero.y };
  });
  check('1. home is the Shaft\'s Rim', home.town && home.rim && home.notches === 7, JSON.stringify(home));
  await page.waitForTimeout(2500);
  await snap('01_home_before_the_gate');
  const stand = async (x, y, name, wait = 700) => {
    await page.evaluate(([hx, hy]) => { const g = window.__dbg.game(); g.hero.x = hx; g.hero.y = hy; }, [x, y]);
    await page.waitForTimeout(wait);
    await snap(name);
  };
  await stand(9.4, 8.0, '02_gate_record_trophies');
  await stand(13.4, 8.0, '03_brink_by_the_way_down');
  await stand(10.3, 12.25, '04_on_the_landing');
  await stand(12.4, 18.3, '05_wordsmiths_ring');
  await stand(16.5, 15.5, '06_by_the_bazaar');
  await stand(6.5, 12.5, '07_left_side');
  return fails;
}
