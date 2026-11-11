// THE SMALL OLDER ART NOTES (art/small_notes.ts): a floor's packs standing as the floor laid them, before they have noticed him, on a
// phone held sideways: the Silent Order's guests on floor 17 (FLOOR=17 KIND=order), floor 20's royal shadows (FLOOR=20 KIND=rshadow)
// and the Order's last masks (FLOOR=20 KIND=order). Pictures for him, not a test.
//   node tools/playtest.mjs --file dist/notes.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/small_notes_packs.mjs --out shots/notes/g
//   his pictures: SEED=4 FLOOR=20 KIND=rshadow AT=40.9,74.9 WAIT=6500 and SEED=4 FLOOR=20 KIND=order AT=30.9,36.9 WAIT=6500, each with
//   EVAL unset (before) and EVAL="window.__dbg.smallNotes.shadows=true;window.__dbg.smallNotes.masks=true" (after); FLOOR=17 KIND=order
//   env: SEED (3), FLOOR (17), KIND (order), EVAL (js run in the page first: switches), WAIT (ms before each picture), AT (x,y: the hero put there, one picture)
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 3);
  const floor = Number(process.env.FLOOR || 17);
  const kind = process.env.KIND || 'order';
  await page.evaluate(([seed, floor]) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', seed); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, floor);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); g.level.explored.fill(1); g.waveT = 1e9; d.bot(false);
    // (nothing wakes: each stands as it stands before it has noticed him)
    g.wakeUp = () => {};
  }, [seed, floor]);
  if (process.env.EVAL) await page.evaluate(process.env.EVAL);
  // (the floor's name goes by first)
  await page.waitForTimeout(7500);
  console.log(await page.evaluate(() => { const g = window.__dbg.game(); const n = {}; for (const m of g.monsters) n[m.kind] = (n[m.kind] || 0) + 1; return JSON.stringify(n); }));
  // (AT=x,y: one picture with the hero put there, the pack he stands by as the floor laid it)
  if (process.env.AT) {
    const [x, y] = process.env.AT.split(',').map(Number);
    await page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.fx = -0.7; h.fy = -0.7; }, [x, y]);
    await page.waitForTimeout(Number(process.env.WAIT || 4500));
    await page.evaluate(() => { window.__dbg.slowmo = 1e-6; });
    await page.waitForTimeout(250);
    await snap(`${kind}${floor}_at`);
    return;
  }
  for (let k = 0; k < 4; k++) {
    const ok = await page.evaluate(([kind, k]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const ms = g.monsters.filter((m) => m.kind === kind && !m.dead && !m.boss);
      const m = ms[Math.floor((ms.length * (k + 0.5)) / 4)];
      if (!m) return null;
      const tries = [[2.4, 2.4], [3.2, 1.0], [1.0, 3.2], [-2.4, 2.4], [2.4, -2.4], [-2.4, -2.4]];
      for (const [ax, ay] of tries) if (g.isOpen(m.x + ax, m.y + ay) && g.isOpen(m.x + ax / 2, m.y + ay / 2)) { h.x = m.x + ax; h.y = m.y + ay; break; }
      h.fx = m.x - h.x; h.fy = m.y - h.y;
      return `${kind} form ${m.form ?? '-'} at ${m.x.toFixed(1)},${m.y.toFixed(1)} of ${ms.length}`;
    }, [kind, k]);
    if (!ok) continue;
    // (the room's name goes by; then held still)
    await page.waitForTimeout(Number(process.env.WAIT || 4500));
    await page.evaluate(() => { window.__dbg.slowmo = 1e-6; });
    await page.waitForTimeout(250);
    await snap(`${kind}${floor}_${k}`);
    console.log(' ', ok);
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    await page.waitForTimeout(200);
  }
}
