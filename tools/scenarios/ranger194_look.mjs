// THE RANGER'S NEW STANCES IN THE GAME (Version 19.4, the art chat's art/ranger-stances): stills of
// him as today and with them on, in a dungeon (standing, and shooting) and in town, for the
// owner's yes in the main chat. Not part of tools/regress.sh.
//   node tools/playtest.mjs --file dist/<page>.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/ranger194_look.mjs --out shots/r194/look
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands in each.
export default async function (page, snap) {
  const where = {};
  const at = async (name) => {
    where[name] = await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); });
    await snap(name);
  };
  /** Somewhere quiet in the first dungeon: the hero where he comes in, every monster asleep and far off. */
  const quiet = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    for (const m of g.monsters) if (Math.hypot(m.x - h.x, m.y - h.y) < 9) m.dead = true;
    h.fx = 0.7071; h.fy = 0.7071;
  });
  const shoot = () => page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    h.swingT = 0;
    g.useBasic(h.x + 3, h.y + 3);
  });
  for (const on of [false, true]) {
    const tag = on ? 'new' : 'today';
    await page.evaluate((on) => { const d = window.__dbg; d.saving(false); d.rangerStances(on); d.run('ranger', 11); d.god = true; d.autoLevel = false; }, on);
    await page.waitForTimeout(1500);
    await at(`town_${tag}`);
    await page.evaluate(() => { window.__dbg.game().enterDungeon(); });
    await page.waitForTimeout(400);
    await quiet();
    await page.waitForTimeout(2500);
    await at(`dungeon_${tag}`);
    await page.evaluate(() => { window.__dbg.slowmo = 0.1; });
    await shoot();
    await page.waitForTimeout(1600);
    await at(`shot_${tag}`);
    await page.waitForTimeout(1600);
    await at(`shot2_${tag}`);
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    await page.waitForTimeout(800);
  }
  snap.note('where', where);
}
