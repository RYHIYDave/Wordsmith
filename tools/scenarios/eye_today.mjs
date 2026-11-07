// THE DROWNED EYE'S FIGHT AS THE GAME HAS IT TODAY (for docs/mockups/eye_redo: "today's layout", beside the new arena):
// floor 10, the hero on his ring a little in front of his pool, as a phone held sideways shows it (844x390 at dpr 3: the
// game's 507 x 234 game pixels), a picture under the water (phase 1) and one risen (phase 2, after his surfacing). Not a test.
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/eye_today.mjs --out shots/eye_today/x
// Logs the view's size in game pixels and where he and the hero are on it ('VIEW {...}').
import { log } from './lib.mjs';

export default async function (page, snap) {
  const info = await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false); d.run('warrior', 5); d.seasoned(12);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game();
    g.hero.ring = true; g.hero.pending = 0; g.guide = null;
    g.depth = 10; g.cleared = 9; g.wayDepth = 10; g.enterDungeon();
    g.hero.invuln = 1e9;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    const b = g.monsters.find((m) => m.boss);
    g.hero.x = b.x + 3.6; g.hero.y = b.y + 3.6;
    g.hero.fx = -Math.SQRT1_2; g.hero.fy = -Math.SQRT1_2;
    g.bossMet = true; g.level.explored.fill(1);
    if (b.state === 'sleep') g.wakeUp(b);
    d.fx.messages.length = 0;
    return { w: d.screen.w, h: d.screen.h, scale: d.screen.scale, boss: [b.x, b.y], hero: [g.hero.x, g.hero.y] };
  });
  log('VIEW', JSON.stringify(info));
  // (his pictures painted first; his moves held off so that he stands)
  const hold = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss);
    if (b.moveCd) for (let k = 0; k < b.moveCd.length; k++) b.moveCd[k] = 1e9;
    g.perils.length = 0;
    g.hero.x = b.x + 3.6; g.hero.y = b.y + 3.6;
  });
  for (let i = 0; i < 40; i++) { await hold(); await page.waitForTimeout(1000); }
  await snap('under');
  // (his surfacing: his bar brought down past the first phase's share)
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss);
    b.life = b.maxLife * 0.6;
  });
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const ph = await page.evaluate(() => {
      const g = window.__dbg.game();
      const b = g.monsters.find((m) => m.boss);
      g.hero.x = b.x + 3.6; g.hero.y = b.y + 3.6;
      return { ph: b.phase, act: b.act ? b.act.id : null };
    });
    if (i === 3) await snap('rising');
    if (ph.ph >= 1 && !ph.act && i > 8) break;
  }
  await hold();
  await page.waitForTimeout(1500);
  await snap('risen');
}
