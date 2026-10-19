// ACT 2, THE BELLS (game/bells.ts; behind ACT2, off: switched on by __dbg.act2): the event as it looks, on floor DEPTH (11 by
// default). Where the floor's own map-maker has laid no plan yet (Land.bells), one is laid here by hand near the start, with its
// pieces. Pictures: before; the Hush poured out; two bells rung (one at hand, the others off the screen: their arrows); the map;
// all rung, the explosion.
//   DEPTH=11 node tools/playtest.mjs --file dist/act2.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_bells.mjs --out shots/bells/b
export default async function (page, snap) {
  const depth = Number(process.env.DEPTH ?? 11);
  const info = await page.evaluate((depth) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', 5);
    D.seasoned(25);
    D.god = true;
    D.act2(true, depth);
    const g = D.game();
    const L = g.level;
    const f = L.floor;
    g.monsters = g.monsters.filter((m) => m.boss);
    if (!L.land.bells) {
      const near = (x, y) => {
        let best = null, bd = 1e9;
        for (let ty = 1; ty < f.h - 1; ty++) for (let tx = 1; tx < f.w - 1; tx++) {
          const i = ty * f.w + tx;
          if (f.tiles[i] !== 1 || L.walk[i] !== 1) continue;
          const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
          if (d < bd) { bd = d; best = { x: tx + 0.5, y: ty + 0.5 }; }
        }
        return best;
      };
      const mid = near(f.start.x + 10, f.start.y + 4);
      const bells = [0, 1, 2, 3, 4].map((k) => near(mid.x + Math.cos(k * 1.256 + 0.3) * 11, mid.y + Math.sin(k * 1.256 + 0.3) * 11));
      L.land.bells = { muffled: mid, bells, hush: { x: mid.x, y: mid.y, r: 17 } };
      const names = { 11: ['the market bell (the Muffled Bell)', "a wayside shrine's bell"], 12: ["the diver's bell (the Muffled Bell)", 'an alarm bell at a sluice'], 13: ['the mill bell on its gable (the Muffled Bell)', 'a farm bell on its post'], 14: ['the chapel bell (the Muffled Bell)', 'a hand bell'], 15: ["the library's closing bell (the Muffled Bell)", 'a hand bell'] }[depth];
      const put = (name, at) => { L.props.push({ kind: 'piece', name, tx: Math.floor(at.x), ty: Math.floor(at.y), x: at.x, y: at.y, solid: true, state: 0, variant: 0 }); L.walk[Math.floor(at.y) * f.w + Math.floor(at.x)] = 0; };
      put(names[0], mid);
      for (const b of bells) put(names[1], b);
      g.bellsMade();
    }
    const B = L.bells;
    g.hero.x = B.plan.muffled.x - 1.2;
    g.hero.y = B.plan.muffled.y + 1.6;
    return { bells: B.plan.bells.length, first: B.first, muffled: B.plan.muffled };
  }, depth);
  console.log('  bells', JSON.stringify(info));
  await page.waitForTimeout(6000);
  await snap('1_before');
  await page.evaluate(() => { const g = window.__dbg.game(); const m = g.level.bells.plan.muffled; g.bellsStruck(m.x, m.y, 0.5); });
  await page.waitForTimeout(2500);
  await snap('2_the_hush');
  await page.evaluate(() => {
    const g = window.__dbg.game(); const B = g.level.bells;
    const b = B.plan.bells[0];
    g.hero.x = b.x - 1.4; g.hero.y = b.y + 1.0;
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.level.bells.plan.bells[0]; g.bellsStruck(b.x, b.y, 0.6); });
  await page.waitForTimeout(250);
  await snap('3_a_bell_rung');
  await page.waitForTimeout(3000);
  await snap('4_the_arrows');
  await page.evaluate(() => { const g = window.__dbg.game(); const B = g.level.bells; for (let i = 1; i < B.plan.bells.length; i++) { const b = B.plan.bells[i]; g.bellsStruck(b.x, b.y, 0.6); } });
  await page.waitForTimeout(300);
  await snap('5_every_bell');
  await page.waitForTimeout(1500);
  await snap('6_the_explosion');
}
