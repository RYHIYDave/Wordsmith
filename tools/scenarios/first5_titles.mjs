// THE FIRST FIVE FLOORS: THE TITLES (game/defs.ts FLOOR_NAMES, BOSS_INTRO, BOSS_LINES; ui/cards.ts). The
// owner, 11 Oct 2026, 20:37: "Don’t forget the level titles when you enter the level and the boss titles
// when you enter the boss room". For each floor, 1 to 5: its name as he comes into it; then, in its boss's
// hall, his gate down behind him, the boss's name and his line.
//   node tools/build_to.mjs dist/first5.html
//   node tools/playtest.mjs --file dist/first5.html --scenario tools/scenarios/first5_titles.mjs --out shots/first5/titles
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(600);
  for (let n = 1; n <= 5; n++) {
    await page.evaluate((k) => { const g = window.__dbg.game(); g.depth = k; g.cleared = k - 1; g.enterDungeon(); }, n);
    await page.waitForTimeout(1300);
    await snap(`floor${n}`);
    const who = await page.evaluate(() => {
      const g = window.__dbg.game();
      const L = g.level;
      g.monsters = g.monsters.filter((m) => m.boss);
      L.explored.fill(1);
      const boss = g.monsters[0];
      const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
      const gx = s.alongX ? s.a + 1.5 : s.plane;
      const gy = s.alongX ? s.plane : s.a + 1.5;
      const k = Math.hypot(gx - boss.x, gy - boss.y);
      g.hero.x = boss.x + ((gx - boss.x) / k) * 4;
      g.hero.y = boss.y + ((gy - boss.y) / k) * 4;
      g.hero.fx = -(gx - boss.x) / k; g.hero.fy = -(gy - boss.y) / k;
      return { name: boss.name, kind: boss.kind };
    });
    await page.waitForTimeout(1500);
    await snap(`boss${n}`);
    log(`floor ${n}`, JSON.stringify(who));
  }
}
