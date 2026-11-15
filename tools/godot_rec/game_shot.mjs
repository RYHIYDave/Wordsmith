// A picture of the game itself where a new Warrior comes into a floor (DEPTH), to hold beside the Godot version's.
export default async function (page, snap) {
  const depth = Number(process.env.DEPTH ?? 2);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 1); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(1500);
  for (let i = 0; i < 200 && (await page.evaluate(() => !!window.__dbg.loadingNow())); i++) await page.waitForTimeout(100);
  await page.evaluate((dp) => { const g = window.__dbg.game(); g.depth = dp; g.enterDungeon(dp === 1 ? 'gate' : undefined); window.__dbg.god = true; }, depth);
  await page.waitForTimeout(600);
  for (let i = 0; i < 400 && (await page.evaluate(() => !!window.__dbg.loadingNow())); i++) await page.waitForTimeout(100);
  await page.waitForTimeout(2500);
  await snap(`game_f${depth}_in`);
  const at = process.env.AT ? process.env.AT.split(',').map(Number) : null;
  if (at) {
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, at);
    await page.waitForTimeout(2500);
    await snap(`game_f${depth}_at`);
  }
}
