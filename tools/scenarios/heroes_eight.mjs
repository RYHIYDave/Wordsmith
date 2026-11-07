// THE WARRIOR AND THE RANGER BROUGHT UP, IN THE GAME (art/warrior_up.ts, art/ranger_up.ts; their eight sides chosen by the figure,
// render/figure.ts): each hero on floor 1, standing facing each of the eight ways in turn, then running, then striking or
// shooting to the left and up; a picture of each. '!!' where a picture comes out mirrored or missing.
//   node tools/build_to.mjs dist/heroes.html
//   node tools/playtest.mjs --file dist/heroes.html --size 844x390 --dpr 2 --scenario tools/scenarios/heroes_eight.mjs --out shots/heroes8/a
import { log } from './lib.mjs';

const WAYS = [[1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71], [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71]];

export default async function (page, snap) {
  for (const cls of ['warrior', 'ranger']) {
    await page.evaluate((cls) => { const d = window.__dbg; d.saving(false); d.run(cls, 1); d.autoLevel = false; d.autoWords = false; d.god = true; }, cls);
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const g = window.__dbg.game();
      g.guide = null;
      for (const m of g.monsters) m.dead = true;
      g.hero.invuln = 1e9;
    });
    // (his pictures painted live here, as the page is not baked: time for them)
    await page.waitForTimeout(6000);
    for (let k = 0; k < WAYS.length; k++) {
      await page.evaluate(([fx, fy]) => { const h = window.__dbg.game().hero; h.fx = fx; h.fy = fy; h.anim = 'idle'; }, WAYS[k]);
      await page.waitForTimeout(900);
      await snap(`${cls}_${k}_face`);
    }
    const run = await page.evaluate(() => {
      const g = window.__dbg.game();
      const fig = window.__dbg.renderer?.figure;
      return { has8: !!fig, side: fig ? fig.side8 : null };
    });
    log(`${cls}`, JSON.stringify(run));
  }
}
