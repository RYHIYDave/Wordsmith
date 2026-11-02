// THE HEADSMAN'S YARD'S OWN GATE in the game (art/yard_gate.ts, YARD_GATE; YARD and YARD_GATE on in the page built for it):
// stills from inside the yard looking back at the doorway: the gate up, held juddering, the landing (its dust and sparks), and
// down for good with his mark alight. The fall is shown frame by frame by setting when it began (the game's own beat).
//   SEED=7919 node tools/playtest.mjs --file dist/yard_gate.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/yard_gate_look.mjs --out shots/ygate
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 7919);
  await page.evaluate((seed) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', seed); d.seasoned(5); d.autoLevel = false; d.autoWords = false; d.god = true; }, seed);
  await page.evaluate(() => { window.__dbg.high(false, 2); });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => { const g = window.__dbg.game(); const Y = g.level.floor.yard; return Y ? { x: Y.x, y: Y.y, door: Y.door } : null; });
  console.log(JSON.stringify(info));
  if (!info) { console.log('!! no yard'); return; }
  await page.evaluate(() => { const g = window.__dbg.game(); g.level.explored.fill(1); window.__dbg.bot(false); g.monsters = []; g.waveT = 1e9; });
  const Y = info;
  // (the hero inside, two tiles in from the doorway and to its side, the doorway up the screen from him)
  await page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.fx = -0.7; h.fy = -0.7; }, [Y.x + Y.door + 2.4, Y.y + 2.6]);
  // (the boss's name gone from the screen)
  await page.waitForTimeout(Number(process.env.SETTLE || 9000));
  await page.evaluate(() => { const g = window.__dbg.game(); const d = g.level.doors.find((q) => q.spot.kind === 'bossgate'); d.want = 1; d.open = 1; delete d.fell; });
  await page.waitForTimeout(300);
  await snap('a_up');
  const at = async (frame, name) => {
    await page.evaluate((k) => {
      const g = window.__dbg.game();
      const d = g.level.doors.find((q) => q.spot.kind === 'bossgate');
      d.want = 0; d.open = 0; d.fell = g.time - k / 30;
    }, frame);
    await snap(name);
  };
  await at(6, 'b_judder');
  await at(11, 'c_landing');
  await at(14, 'd_dust');
  await at(60, 'e_down');
}
