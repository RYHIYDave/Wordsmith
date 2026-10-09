// THE MASTER RUNE-STONE GIVEN, AND THE RING POWERING UP (art/quest3.ts, art/ring3.ts, art/smith3.ts;
// a mock-up: not in the game): pictures for the owner. In town with the ring dark (the stones' runes
// cold, the circle cold, the wordsmith's runes cold, the slab's hollow empty), the hero, carrying the
// stone, stands at the slab; then gives it (here the demo says so), and the ring powers up. The
// town's clock is slowed so that the camera keeps up: a picture every tenth of a second of its time.
//   node tools/build_to.mjs dist/quest.html
//   node tools/playtest.mjs --file dist/quest.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/quest_town.mjs --out shots/quest/town
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 31); d.smith3(true); d.quest3({ on: true, dark: true, carried: true }); });
  await page.waitForTimeout(900);
  // (beside the slab, at its right-hand end as the screen has it, facing along it to the wordsmith)
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 11.0; g.hero.y = 15.2; g.hero.fx = -0.95; g.hero.fy = -0.3; });
  await page.waitForTimeout(1800);
  for (let k = 0; k < 6; k++) {
    await snap(`dark_${String(k).padStart(2, '0')}`);
    await page.waitForTimeout(200);
  }
  const slow = 0.2;
  await page.evaluate((s) => { window.__dbg.slowmo = s; window.__dbg.quest3({ give: true }); }, slow);
  const step = 100 / slow;
  const t0 = Date.now();
  for (let i = 0; i < 64; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
