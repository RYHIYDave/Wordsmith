// THE FIRST FIVE FLOORS: THE MINE SHAFT (game/ways.ts; render/dress.ts). The fifth floor, its boss killed
// where he stands: the cage comes crashing down the shaft at the back of his hall; the hero walks into it
// and rides up to town.
//   node tools/build_to.mjs dist/first5.html
//   node tools/playtest.mjs --file dist/first5.html --scenario tools/scenarios/first5_shaft.mjs --out shots/first5/shaft
// FILM=1: a frame every 15th of a second (the game slowed) instead of a few pictures.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const film = !!process.env.FILM;
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(600);
  const at = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 5; g.cleared = 4; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    const sh = L.ways.shaft;
    g.monsters = g.monsters.filter((m) => m.boss);
    const boss = g.monsters[0];
    // (the hero before the shaft's gate, two tiles out, looking at it)
    g.hero.x = sh.x + 0.5; g.hero.y = sh.y + 2.6; g.hero.fx = 0; g.hero.fy = -1;
    return { shaft: sh, boss: boss ? [boss.x, boss.y, boss.kind] : null, portal: !!L.portal, stairs: L.ways.stairs.length };
  });
  log('floor 5', JSON.stringify(at));
  // (the painter makes the cage's two films)
  for (let i = 0; i < 60; i++) {
    const got = await page.evaluate(() => Object.keys(window.__dbg.painter.stats.films));
    if (got.length >= 2) { log('films', JSON.stringify(got)); break; }
    await page.waitForTimeout(500);
  }
  log('painter', JSON.stringify(await page.evaluate(() => window.__dbg.painter.stats)));
  await snap('a_before');
  const state = () => page.evaluate(() => { const g = window.__dbg.game(); const sh = g.level.ways?.shaft; return { town: g.level.town, shaft: sh ? `${sh.state}@${sh.t.toFixed(2)}` : null, leaving: g.leaving ? `${g.leaving.to}@${g.leaving.t.toFixed(2)}` : null, hero: [+g.hero.x.toFixed(2), +g.hero.y.toFixed(2)], depth: g.depth, cleared: g.cleared }; });
  await page.evaluate(() => { const g = window.__dbg.game(); g.kill(g.monsters.find((m) => m.boss)); });
  if (film) await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
  const shots = film ? Array.from({ length: 70 }, (_, i) => i / 15) : [0.6, 1.2, 1.7, 2.1, 3.0, 4.6];
  const t0 = Date.now();
  const slow = film ? 4 : 1;
  for (let i = 0; i < shots.length; i++) {
    const wait = t0 + shots[i] * 1000 * slow - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`b_down_${String(i).padStart(3, '0')}`);
  }
  await page.waitForTimeout(800 * slow);
  log('down', JSON.stringify(await state()));
  // (he walks into the cage: put on its tile, as walking in would)
  await page.evaluate(() => { const g = window.__dbg.game(); const sh = g.level.ways.shaft; g.hero.x = sh.x + 0.5; g.hero.y = sh.y + 0.9; });
  const shots2 = film ? Array.from({ length: 55 }, (_, i) => i / 15) : [0.2, 0.5, 1.0, 1.5, 2.0, 2.6, 3.1];
  const t1 = Date.now();
  for (let i = 0; i < shots2.length; i++) {
    const wait = t1 + shots2[i] * 1000 * slow - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`c_up_${String(i).padStart(3, '0')}`);
    if (i === 0) log('riding', JSON.stringify(await state()));
  }
  if (film) await page.evaluate(() => { window.__dbg.slowmo = 1; });
  await page.waitForTimeout(1500);
  log('after', JSON.stringify(await state()));
  await snap('d_town');
}
