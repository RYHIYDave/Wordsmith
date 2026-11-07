// THE QUEST LINE OF FLOORS 6 TO 10 (game/quests610.ts QUESTS610, off): THE EYRIE'S SCENE. Switched on for this page, a hero sent for
// the Queen's feather on floor 7, set in her ground; she is struck down, and the scene plays: he walks to the edge, the picture pans
// out over the drop to the town far below under the cult's dome, his line, and back. Pictures through it. CLS: which hero.
//   node tools/build_to.mjs dist/q610.html
//   node tools/playtest.mjs --file dist/q610.html --size 844x390 --dpr 2 --scenario tools/scenarios/eyrie_scene.mjs --out shots/q610/e
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.seasoned(20); d.god = true; d.quests610.on = true; }, cls);
  await page.waitForTimeout(600);
  const at = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.hero.feather = 'asked';
    g.depth = 7; g.cleared = 6; g.enterDungeon();
    const L = g.level; L.explored.fill(1);
    const b = L.land.areas.find((a) => a.role === 'boss').blob;
    g.monsters = g.monsters.filter((m) => m.boss);
    const q = g.monsters.find((m) => m.boss);
    g.hero.x = b.x - 1; g.hero.y = b.y + 1.5;
    g.bossReady();
    return { boss: q && q.kind, blob: [b.x, b.y] };
  });
  log('set', JSON.stringify(at));
  await page.waitForTimeout(1200);
  const hit = await page.evaluate(() => {
    const g = window.__dbg.game();
    const q = g.monsters.find((m) => m.boss && !m.dead);
    if (!q) return 'no queen';
    const before = { life: q.life, shield: q.shield, state: q.state };
    g.kill(q);
    return { before, dead: q.dead, life: q.life, boss: g.boss && g.boss.kind };
  });
  log('hit', JSON.stringify(hit));
  const scene = () => page.evaluate(() => { const g = window.__dbg.game(); const S = g.scene; return { scene: S && { phase: S.phase, t: +S.t.toFixed(2), to: S.to, side: S.side }, hero: [+g.hero.x.toFixed(1), +g.hero.y.toFixed(1)], feather: g.hero.feather, seen: !!g.hero.citySeen }; });
  log('down', JSON.stringify(await scene()));
  await page.waitForTimeout(1500);
  await snap('1_she_falls');
  // (to its walk, its pan out, its hold with his line, its pan back)
  const until = async (phase, more = 0) => {
    for (let k = 0; k < 80; k++) {
      const s = await scene();
      if (!s.scene || s.scene.phase === phase) break;
      await page.waitForTimeout(100);
    }
    if (more) await page.waitForTimeout(more);
  };
  await until('walk', 900);
  log('walking', JSON.stringify(await scene()));
  await snap('2_to_the_edge');
  await until('out', 800);
  await snap('3_panning_out');
  await until('hold', 1400);
  log('holding', JSON.stringify(await scene()));
  await snap('4_the_town');
  await until('back', 1500);
  await page.waitForTimeout(500);
  log('done', JSON.stringify(await scene()));
  await snap('5_back');
}
