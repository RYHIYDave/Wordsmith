// THE STRONGHOLDS' HALLS GIVEN MORE TO THEM (game/act1_dress.ts, behind HALL_LOOK): the hall of floor DEPTH's first stronghold (6 by
// default), as it is now and with the switch on, the hero standing in it a little toward its door; and from its door as he comes in.
// Pictures for his yes.
//   DEPTH=6 node tools/playtest.mjs --file dist/look.html --size 844x390 --dpr 2 --scenario tools/scenarios/hall_look.mjs --out shots/hall/h6
export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 6);
  const seed = Number(process.env.SEED || 9);
  for (const on of [false, true]) {
    const info = await page.evaluate(([n, s, on]) => {
      const d = window.__dbg;
      d.saving(false);
      d.hallLook.on = on;
      d.run('warrior', s);
      d.autoLevel = false; d.god = true;
      d.seasoned(12);
      const g = d.game();
      g.depth = n; g.cleared = n - 1; g.enterDungeon();
      const L = g.level;
      L.explored.fill(1);
      g.monsters = g.monsters.filter((m) => m.boss);
      const q = L.land.holds[0];
      const r = q.inside;
      g.hero.x = r.x + r.w / 2 + 0.3; g.hero.y = r.y + r.h - 2.2;
      g.hero.fx = -0.7; g.hero.fy = -0.7;
      return { inside: r, pieces: L.props.filter((p) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h).map((p) => p.name) };
    }, [depth, seed, on]);
    console.log('  hall', on, JSON.stringify(info));
    await page.waitForTimeout(5000);
    await snap(on ? '2_new' : '1_now');
    if (on) {
      await page.evaluate(() => { const g = window.__dbg.game(); const q = g.level.land.holds[0]; g.hero.x = q.entry.x; g.hero.y = q.entry.y; });
      await page.waitForTimeout(1500);
      await snap('3_new_from_the_door');
      // (from its back, by the obelisk: the idols and the cages, the hangings on the back walls)
      await page.evaluate(() => { const g = window.__dbg.game(); const r = g.level.land.holds[0].inside; g.hero.x = r.x + 4.5; g.hero.y = r.y + 2.5; g.hero.fx = 0.7; g.hero.fy = 0.7; });
      await page.waitForTimeout(1500);
      await snap('4_new_at_the_back');
    }
  }
}
