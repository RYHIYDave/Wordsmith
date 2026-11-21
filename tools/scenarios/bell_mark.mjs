// THE MUFFLED BELL MADE EASIER TO SEE (render/bell_mark.ts, behind BELL_MARK): the Muffled Bell on floor DEPTH (11 by default) as the
// floor's own map-maker lays it, seen from a few tiles off and from further, as it is now and with the switch on; then struck, the
// mark gone. Pictures for his yes.
//   DEPTH=11 node tools/playtest.mjs --file dist/look.html --size 844x390 --dpr 2 --scenario tools/scenarios/bell_mark.mjs --out shots/bell/b
export default async function (page, snap) {
  const depth = Number(process.env.DEPTH ?? 11);
  const info = await page.evaluate((depth) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', 5);
    D.seasoned(25);
    D.god = true;
    D.act2(true, depth);
    const g = D.game();
    g.monsters = g.monsters.filter((m) => m.boss);
    const L = g.level;
    L.explored.fill(1);
    const B = L.bells;
    if (!B) return null;
    g.hero.x = B.plan.muffled.x - 2.6;
    g.hero.y = B.plan.muffled.y + 3.0;
    g.hero.fx = 0.7; g.hero.fy = -0.7;
    return { muffled: B.plan.muffled, name: L.props[B.muffled]?.name };
  }, depth);
  console.log('  bell', JSON.stringify(info));
  if (!info) return;
  await page.waitForTimeout(5000);
  await snap('1_now');
  await page.evaluate(() => { window.__dbg.bellMark.on = true; });
  await page.waitForTimeout(1200);
  await snap('2_marked');
  await page.evaluate(() => { const g = window.__dbg.game(); const m = g.level.bells.plan.muffled; g.hero.x = m.x - 5.5; g.hero.y = m.y + 6.0; });
  await page.waitForTimeout(1500);
  await snap('3_marked_from_further');
  await page.evaluate(() => { window.__dbg.bellMark.on = false; });
  await page.waitForTimeout(600);
  await snap('4_now_from_further');
  await page.evaluate(() => { window.__dbg.bellMark.on = true; const g = window.__dbg.game(); const m = g.level.bells.plan.muffled; g.hero.x = m.x - 1.2; g.hero.y = m.y + 1.4; });
  await page.waitForTimeout(900);
  await snap('5_marked_near');
  await page.evaluate(() => { const g = window.__dbg.game(); const m = g.level.bells.plan.muffled; g.bellsStruck(m.x, m.y, 0.5); });
  await page.waitForTimeout(1500);
  await snap('6_struck');
}
