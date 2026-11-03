// THE WARLOCK'S PACT ON THE SCREEN (render/render.ts, a bar over his head; a page built with him on): half full, then full
// (his arm blazing, the bar saying how he changes), and as the demon, running down. Each with a note of where he stands. Run with --touch for a phone, without for a mouse.
//   node tools/playtest.mjs --file dist/warlock.html --touch --size 844x390 --scenario tools/scenarios/warlock_hud.mjs --out shots/whud/t
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.practice('warlock', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    const h = g.hero;
    for (const [dx, dy] of [[3, 0], [3.6, 1], [3.8, -0.9]]) {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m); m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9; m.state = 'recover'; m.t = 1e9;
    }
  });
  // (the practice room's lines gone first)
  await page.waitForTimeout(9000);
  await page.evaluate(() => { window.__dbg.game().hero.pact = 15; });
  await page.waitForTimeout(1500);
  await snap('half');
  await page.evaluate(() => { window.__dbg.game().hero.pact = 30; });
  await page.waitForTimeout(3000);
  await snap('full');
  await page.waitForTimeout(400);
  await snap('full2');
  snap.note('hero', await page.evaluate(() => { const h = window.__dbg.game().hero; return window.__dbg.at(h.x, h.y); }));
  await page.evaluate(() => { window.__dbg.game().hero.pact = 30; });
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(500);
  await snap('changing');
  await page.waitForFunction(() => { const h = window.__dbg.game().hero; return h.form === 'demon' && !h.change; }, null, { timeout: 300000, polling: 500 });
  await page.waitForTimeout(3000);
  await snap('demon');
}
