// EACH FLOOR AS IT LOOKS, for the art chat: floor N entered and a picture where the hero comes in (DEPTHS, a comma list; 1 to 20).
// On floors 6 to 10 its first stronghold's yard too, and the gatehouse's piece as the level holds it (logged).
//   DEPTHS=1,2,3 node tools/playtest.mjs --file dist/fronts.html --size 844x390 --dpr 2 --scenario tools/scenarios/floors_look.mjs --out shots/floors/f
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depths = String(process.env.DEPTHS || '1').split(',').map(Number);
  const seed = Number(process.env.SEED || 9);
  await page.evaluate((s) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.autoLevel = false; d.god = true; d.seasoned(12);
  }, seed);
  await page.waitForTimeout(600);
  for (const n of depths) {
    const info = await page.evaluate((n) => {
      const g = window.__dbg.game();
      g.depth = n; g.cleared = n - 1; g.enterDungeon();
      const L = g.level;
      L.explored.fill(1);
      g.monsters = g.monsters.filter((m) => m.boss);
      const q = L.land?.holds?.[0];
      const gate = q ? L.props.find((p) => /gatehouse|waystation's gate/.test(p.name)) : null;
      return { n, hero: [g.hero.x, g.hero.y], rooms: (L.floor.rooms || []).length, gate, hold: q ? { gx: q.gx, gy: q.gy, altar: q.altar } : null };
    }, n);
    log('floor', JSON.stringify(info));
    await page.waitForTimeout(2500);
    await snap(`${String(n).padStart(2, '0')}_in`);
    if (info.hold) {
      await page.evaluate(() => { const g = window.__dbg.game(); const q = g.level.land.holds[0]; g.hero.x = q.altar.x + 1.2; g.hero.y = q.altar.y + 1.4; });
      await page.waitForTimeout(1500);
      await snap(`${String(n).padStart(2, '0')}_hold`);
    }
  }
}
