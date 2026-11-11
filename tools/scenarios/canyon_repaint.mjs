// THE CANYON REPAINTED AGAINST THE 3D MODEL (docs/mockups/canyon_repaint/README.md; art/canyon.ts CANYON_RIM, off): floor 8
// pictured where the hero stands in six of its open areas, from the game itself at his phone's size, for a picture of the game as
// it is beside the same place with the switch on (a page built with it on: the README says how). The places are those of
// tools/scenarios/canyon_model.mjs (the 3D model's), so each picture has its model. Nothing in the game changes.
//   node tools/playtest.mjs --file <page> --touch --size 852x393 --dpr 3 --scenario tools/scenarios/canyon_repaint.mjs --out shots/canyon_repaint/now
// DEPTH: the floor (8). SEED: the run's (9). AREAS: which of the six (all).
export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 8);
  const seed = Number(process.env.SEED || 9);
  const picks = (process.env.AREAS || '0,1,2,3,4,5').split(',').map(Number);
  await page.evaluate((s) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    // (no talent waiting: its button would stand over the picture)
    d.game().talentsLeft = () => 0;
  }, seed);
  await page.waitForTimeout(600);
  const areas = await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    g.monsters = g.monsters.filter((m) => m.boss);
    const all = (L.land ? L.land.areas : []).filter((a) => a.role === 'path' || a.role === 'side' || a.role === 'lair');
    const k = Math.min(6, all.length);
    return Array.from({ length: k }, (_, i) => all[Math.floor(((i + 0.5) * all.length) / k)]).map((a) => [a.blob.x, a.blob.y]);
  }, depth);
  // (the floor's name gone from the screen before the first picture)
  await page.waitForTimeout(Number(process.env.SETTLE || 9000));
  for (const k of picks) {
    const at = areas[k];
    if (!at) continue;
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; }, at);
    await page.waitForTimeout(1500);
    await snap(`area${k}`);
  }
}
