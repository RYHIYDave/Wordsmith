// THE MAGE'S HABITS IN A FIGHT, FROM HER GUARD, BIG AND WILD (art/moves3.ts MAGE_STANCES and WILD;
// a mock-up: not in the game): her light, and the power getting away from her, filmed in the
// practice room as the game draws them, a picture every thirtieth of a second of the game's time.
// She stands in her guard facing you, nobody near, and does each (__dbg.habit), one after the other.
//   node tools/build_to.mjs dist/wild.html
//   node tools/playtest.mjs --file dist/wild.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/mage_habits_wild.mjs --out shots/wild/habits_on
//   env: OFF=1: the same with WILD off (as he saw them at 19:33, 8 Oct)
export default async function (page, snap) {
  const off = process.env.OFF === '1';
  await page.evaluate((off) => {
    const d = window.__dbg; d.saving(false); d.practice('mage', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.mageStances(true);
    d.wild(!off);
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    if (g.weapon() !== 'staff') { const i = h.bag.findIndex((it) => it && it.weapon === 'staff'); if (i >= 0) g.equipFromBag(i); }
    // (facing you, a little to the right: the way the camera sees her best)
    h.fx = 0.7; h.fy = 0.7;
  }, off);
  await page.waitForTimeout(Number(process.env.WAIT || 6000));
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }), scale: await page.evaluate(() => window.__dbg.screen.scale ?? null) });
  const plan = { frames: 150, at: { 6: 1, 70: 2 } };
  const slow = 0.08;
  const step = 1000 / 30 / slow;
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < plan.frames; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (plan.at[i]) await page.evaluate((w) => window.__dbg.habit(w), plan.at[i]);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
