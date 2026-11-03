// FLOOR 16'S STAIRS (game/act2/swangardens.ts SG_OPEN): the hero set below each terrace wall's stairs in turn, a picture of each.
//   node tools/playtest.mjs --file dist/x.html --scenario tools/scenarios/f16_stairs.mjs --out shots/f16st   (HIGH_CITY on in the page)
// SEED: the run's (9). SETTLE: milliseconds let pass first.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED || 9);
  await page.evaluate((s) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, seed);
  await page.waitForTimeout(600);
  const walls = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 16; g.cleared = 15; g.enterDungeon();
    g.level.explored.fill(1);
    g.monsters = g.monsters.filter((m) => m.boss);
    return g.level.land.garden.walls.map((q) => ({ y: q.y, tx: q.tx, more: q.more ?? [] }));
  });
  log('walls', JSON.stringify(walls));
  if (process.env.SETTLE) await page.waitForTimeout(Number(process.env.SETTLE));
  for (let k = 0; k < walls.length; k++) {
    const q = walls[k];
    const xs = [q.tx, ...q.more].sort((a, b) => a - b);
    const mid = xs[Math.floor(xs.length / 2)];
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [mid + 1, q.y + 4.5]);
    await page.waitForTimeout(900);
    await snap(`wall${k}`);
  }
}
