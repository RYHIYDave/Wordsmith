// THE HEADSMAN'S YARD in the game (render/yard.ts; YARD on in the page built for it): stills of floor 2's boss hall outdoors.
//   SEED=7919 node tools/playtest.mjs --file dist/yard_look.html --scenario tools/scenarios/yard_look.mjs --out shots/yard
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 7919);
  await page.evaluate((seed) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', seed); d.seasoned(5); d.autoLevel = false; d.autoWords = false; d.god = true; }, seed);
  await page.evaluate(() => { window.__dbg.high(false, 2); });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => { const g = window.__dbg.game(); const Y = g.level.floor.yard; return { depth: g.depth, yard: Y ? { x: Y.x, y: Y.y, n: Y.n, door: Y.door } : null, boss: g.level.floor.boss }; });
  console.log(JSON.stringify(info));
  if (!info.yard) { console.log('!! no yard'); return; }
  await page.evaluate(() => { const g = window.__dbg.game(); g.level.explored.fill(1); window.__dbg.bot(false); for (const m of g.monsters) if (!m.boss) m.dead = true; g.waveT = 1e9; });
  const Y = info.yard;
  const at = async (x, y, fx, fy, name, wait = 1500) => {
    await page.evaluate(([x, y, fx, fy]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.fx = fx; h.fy = fy; }, [x, y, fx, fy]);
    await page.waitForTimeout(wait);
    const st = await page.evaluate(() => { const g = window.__dbg.game(); const Y = g.level.floor.yard; const h = g.hero; const big = g.level.props.filter((p) => p.name === 'the scaffold, draped' || p.name === 'the long gallows').map((p) => `${p.name}@${(p.x - Y.x).toFixed(1)},${(p.y - Y.y).toFixed(1)}`); return `hero ${(h.x - Y.x).toFixed(2)},${(h.y - Y.y).toFixed(2)} ${big.join(' ')}`; });
    console.log(name, st);
    await snap(name);
  };
  // (coming in at the doorway, looking down into the yard)
  await at(Y.x + Y.door + 1.5, Y.y + 0.6, 0.7, 0.7, 'a_doorway');
  // (in the middle of the yard, before the scaffold, the Headsman at its steps)
  await at(Y.x + 6.5, Y.y + 11.0, -0.7, -0.7, 'b_before_scaffold');
  // (by the far wall, the gallows and the tower behind)
  await at(Y.x + 9.5, Y.y + 6.5, -0.7, -0.7, 'c_far_walls');
  // (behind the scaffold: seen through)
  await at(Y.x + 6.0, Y.y + 2.6, 0.7, 0.7, 'd_behind_scaffold');
  // (beside the scaffold, to its left)
  await at(Y.x + 3.6, Y.y + 6.0, 0.7, -0.7, 'e_left_of_scaffold');
}
