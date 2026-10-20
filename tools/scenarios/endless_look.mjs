// ENDLESS MODE (game/endless.ts, behind ENDLESS: switched on here by the test hook, __dbg.endless), its pictures and its
// playtest. His words, 20 Oct 2026, 14:18 Pacific: “I’d like once you beat whatever the last level we have built, it picks a
// random leveled scaled up so you can go in an endless mode of harder and harder levels until you want to stop.  Or until you
// die?  We’ll call it endless mode and if you die it’s over.”
//   1. a Normal warrior beats the last floor built: home to town, and the line that the endless levels are open;
//   2. on the town's waypoint: "Waypoint: to Endless 1";
//   3. the use button: onto the first endless level, its card (the floor's own name, ENDLESS 1 under it, the warning in pink);
//   4. a few levels on (Endless 3 on floor 12, Endless 7 on floor 2): the card and the line at the top of the screen;
//   5. he falls there: YOU DIED, fallen in that endless level, a new run (his pick: the hero too).
//   node tools/build_to.mjs dist/endless.html
//   node tools/playtest.mjs --file dist/endless.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/endless_look.mjs --out shots/endless/phone
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  const touch = await page.evaluate(() => window.__dbg.screen.touch);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.modes.on = true; d.meta().mode = 'normal'; });
  await page.waitForTimeout(300);

  // ---- 1. the last floor built beaten ------------------------------------------------------------
  const opened = await page.evaluate(() => {
    const d = window.__dbg;
    d.run('warrior', 61);
    d.seasoned(30);
    d.autoLevel = false; d.autoWords = false;
    d.endless(true);
    const g = d.game();
    g.mode = 'normal';
    g.depth = 15; g.cleared = 14; g.wayDepth = 15;
    g.enterDungeon();
    window.__dbg.fx.messages.length = 0;
    g.takeWay('on');
    return { town: !!g.level.town, endless: g.endless, floor: g.endlessFloor };
  });
  // (the last floor's own card, come up as he went in a moment before, gone: as in play)
  await page.waitForTimeout(5200);
  if (!touch) await page.mouse.move(4, 4);
  await snap('01_town_endless_open');
  check('1. the last floor beaten: home, the endless levels open', opened.town && opened.endless === 1 && opened.floor >= 1 && opened.floor <= 14, JSON.stringify(opened));

  // ---- 2. the town's waypoint ----------------------------------------------------------------------
  const hint = await page.evaluate(() => {
    const g = window.__dbg.game();
    const w = g.level.ways.way;
    g.hero.x = w.x; g.hero.y = w.y + 0.05;
    return null;
  });
  void hint;
  await page.waitForTimeout(900);
  await snap('02_town_waypoint');
  const said = await page.evaluate(() => window.__dbg.game().interactHint());
  check('2. on the town\'s waypoint: to Endless 1', said === 'Waypoint: to Endless 1', String(said));

  // ---- 3. onto the first endless level ------------------------------------------------------------
  if (touch) await hands.press('button:Waypoint');
  else await page.keyboard.press('KeyE');
  for (let i = 0; i < 40 && (await page.evaluate(() => !!window.__dbg.game().level.town)); i++) await page.waitForTimeout(100);
  await page.waitForTimeout(1300);
  await snap('03_endless_1_card');
  const first = await page.evaluate(() => { const g = window.__dbg.game(); return { inEndless: g.inEndless, endless: g.endless, depth: g.depth, floor: g.endlessFloor, place: g.floorLevel }; });
  check('3. on the first endless level, the floor it is', first.inEndless && first.endless === 1 && first.depth === first.floor && first.place === 'Endless 1', JSON.stringify(first));

  // ---- 4. a few levels on ------------------------------------------------------------------------
  for (const [level, floor] of [[3, 12], [7, 2]]) {
    await page.evaluate(([n, f]) => { window.__dbg.fx.messages.length = 0; window.__dbg.endless(true, n, f); }, [level, floor]);
    await page.waitForTimeout(1300);
    await snap(`04_endless_${level}_floor_${floor}_card`);
    await page.waitForTimeout(3600);
    await snap(`05_endless_${level}_floor_${floor}_hud`);
    const now = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, place: g.floorLevel, tough: g.tough, power: g.power, boss: (g.monsters.find((m) => m.boss) || {}).maxLife }; });
    check(`4. Endless ${level}, on floor ${floor}`, now.depth === floor && now.place === `Endless ${level}` && Math.abs(now.tough - Math.pow(1.1, level - 1)) < 1e-9, JSON.stringify(now));
  }

  // ---- 5. he falls there -----------------------------------------------------------------------------
  await page.evaluate(() => {
    window.__dbg.fx.messages.length = 0;
    const g = window.__dbg.game();
    const m = g.monsters.find((q) => !q.dead && !q.boss) || null;
    g.hero.invuln = 0;
    g.hurtHero(1e9, 'phys', [], m, 'a test');
  });
  for (let i = 0; i < 40 && !(await hands.mark('button:New run')); i++) await page.waitForTimeout(100);
  await page.waitForTimeout(200);
  await snap('06_you_died_endless');
  const died = await page.evaluate(() => { const g = window.__dbg.game(); return { over: g.over, wakes: g.wakes, mode: g.mode }; });
  check('5. a Normal hero fallen on an endless level: lost, a new run', died.over && !died.wakes && died.mode === 'normal' && !!(await hands.mark('button:New run')), JSON.stringify(died));

  log('endless', fails ? `${fails} FAILED` : 'all as it should be');
}
