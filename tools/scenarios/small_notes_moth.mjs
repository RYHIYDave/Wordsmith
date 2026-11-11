// THE SMALL OLDER ART NOTES: THE MOTH ON A PHONE (art/small_notes.ts `mothView`): stills of its fight on the Tower Top as a phone
// held sideways shows it: hovering, the Eyes (its wings spread flat to you), the Swarm, the Beat. Pictures for him, not a test.
//   node tools/playtest.mjs --file dist/notes.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/small_notes_moth.mjs --out shots/notes/m
//   env: SEED (4), EVAL (js run in the page first: switches)
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 4);
  await page.evaluate((seed) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', seed); d.seasoned(25); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 20);
    const g = d.game(); g.level.explored.fill(1); g.waveT = 1e9; d.bot(false);
    for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    const T = g.level.land.tower; const h = g.hero;
    h.x = T.stair.x + (T.stair.back.x - T.stair.x) * 0.55; h.y = T.stair.y + (T.stair.back.y - T.stair.y) * 0.55;
  }, seed);
  if (process.env.EVAL) await page.evaluate(process.env.EVAL);
  await page.waitForTimeout(9000);
  const go = (what) => page.evaluate((what) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const T = g.level.land.tower;
    const m = g.monsters.find((q) => q.kind === 'moth'); if (!m) return 'no moth';
    m.life = m.maxLife = 2e5;
    const only = (id) => { const acts = ['moth:buffet', 'moth:dust', 'moth:swarm', 'moth:eyes', 'moth:beat', 'moth:land']; if (!m.moveCd) return; acts.forEach((a, i) => { if (i < m.moveCd.length && a !== 'moth:land') m.moveCd[i] = a === id ? 0 : 99; }); m.cd = 0; };
    if (what === 'hover') { h.x = T.top.cx + 1; h.y = T.top.cy + 4; only('none'); }
    else if (what === 'west') { h.x = T.top.cx - 5; h.y = T.top.cy + 1; only('none'); }
    else if (what === 'eyes') { h.x = T.top.cx + 1; h.y = T.top.cy + 4; only('moth:eyes'); }
    else if (what === 'swarm') { h.x = T.top.cx - 3; h.y = T.top.cy + 4; only('moth:swarm'); }
    return `${what}: moth ${m.x.toFixed(1)},${m.y.toFixed(1)} ${m.act ? m.act.id : m.anim} hero ${h.x.toFixed(1)},${h.y.toFixed(1)} zoom ${d.zoom().toFixed(3)}`;
  }, what);
  const act = () => page.evaluate(() => { const m = window.__dbg.game().monsters.find((q) => q.kind === 'moth'); return m && m.act ? `${m.act.id} ${(m.act.t ?? 0).toFixed(2)}` : m ? m.anim : '-'; });
  console.log(await go('hover'));
  await page.waitForTimeout(3000); await snap('1_hover'); console.log('  ', await act(), await page.evaluate(() => window.__dbg.zoom().toFixed(3)));
  console.log(await go('west'));
  await page.waitForTimeout(3000); await snap('2_west');
  console.log(await go('eyes'));
  // (the Eyes: its wings spread flat, held from 0.5 s; its move begins at the top of its beat, at most 2.4 s on)
  for (let k = 0; k < 40; k++) { await page.waitForTimeout(150); const a = await act(); if (a.startsWith('moth:eyes')) { await page.waitForTimeout(900); break; } }
  await snap('3_eyes'); console.log('  ', await act());
  console.log(await go('swarm'));
  for (let k = 0; k < 40; k++) { await page.waitForTimeout(150); const a = await act(); if (a.startsWith('moth:swarm')) { await page.waitForTimeout(1500); break; } }
  await snap('4_swarm'); console.log('  ', await act());
}
