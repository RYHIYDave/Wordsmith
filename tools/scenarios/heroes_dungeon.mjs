// THE WARRIOR AND THE RANGER BROUGHT UP, IN A DUNGEON (floor 2): each standing facing the eight ways, running two ways, and in
// his attack (the Warrior's Strike and the Ranger's Shot) at its held wind-up and at its blow, aimed up and to the left and down
// and to the right; pictures for him.
//   node tools/playtest.mjs --serve --file dist/page.html --size 844x390 --dpr 2 --scenario tools/scenarios/heroes_dungeon.mjs --out shots/heroes_d/a
import { log } from './lib.mjs';

const WAYS = [[1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71], [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71]];

export default async function (page, snap) {
  for (const cls of ['warrior', 'ranger']) {
    await page.evaluate((cls) => { const d = window.__dbg; d.saving(false); d.run(cls, 4); d.seasoned(6); d.autoLevel = false; d.autoWords = false; d.god = true; }, cls);
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const g = window.__dbg.game();
      g.guide = null;
      g.depth = 2; g.cleared = 1; g.enterDungeon();
      g.hero.invuln = 1e9;
      for (const m of g.monsters) m.dead = true;
      g.level.explored.fill(1);
    });
    await page.waitForTimeout(7000);
    for (let k = 0; k < WAYS.length; k++) {
      await page.evaluate(([fx, fy]) => { const h = window.__dbg.game().hero; h.fx = fx; h.fy = fy; }, WAYS[k]);
      await page.waitForTimeout(700);
      await snap(`${cls}_face${k}`);
    }
    // (in his attack, aimed: the press, then a picture in the held wind-up and one at the blow)
    for (const [ax, ay, name] of [[-3, -1, 'upleft'], [2, 3, 'downright']]) {
      const wind = await page.evaluate(([ax, ay]) => {
        const g = window.__dbg.game();
        const h = g.hero;
        h.swingT = 0;
        g.useBasic(h.x + ax, h.y + ay);
        return h.attackWind;
      }, [ax, ay]);
      await page.waitForTimeout(Math.round(wind * 1000 * 0.7));
      await snap(`${cls}_${name}_wind`);
      await page.waitForTimeout(Math.round(wind * 1000 * 0.3) + 30);
      await snap(`${cls}_${name}_blow`);
      await page.waitForTimeout(900);
      log(`${cls} ${name}`, `wind-up ${wind.toFixed(3)} s`);
    }
  }
}
