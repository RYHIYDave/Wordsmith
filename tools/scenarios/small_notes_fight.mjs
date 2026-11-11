// THE SMALL OLDER ART NOTES: floor 20's royal shadows and the Order's last masks IN A FIGHT (the test bot fighting for him, nothing can
// kill him): their blows, their big moves and their deaths played through with the switches as EVAL sets them. A picture every second;
// it ends saying how many of each fell. Not a test of numbers: that nothing breaks, and pictures to look at.
//   node tools/playtest.mjs --file dist/notes.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/small_notes_fight.mjs --out shots/notes/k
//   env: SEED (4), KIND (rshadow | order), AT (x,y: where the hero is put), SECS (12), EVAL
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 4);
  const kind = process.env.KIND || 'rshadow';
  const [x, y] = (process.env.AT || (kind === 'order' ? '30.9,36.9' : '40.9,74.9')).split(',').map(Number);
  await page.evaluate((seed) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', seed); d.seasoned(25); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 20);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); g.level.explored.fill(1); g.waveT = 1e9;
  }, seed);
  if (process.env.EVAL) await page.evaluate(process.env.EVAL);
  await page.waitForTimeout(2000);
  const before = await page.evaluate(([kind, x, y]) => { const d = window.__dbg; const g = d.game(); g.hero.x = x; g.hero.y = y; d.bot(true); return g.monsters.filter((m) => m.kind === kind && !m.dead).length; }, [kind, x, y]);
  const secs = Number(process.env.SECS || 12);
  for (let k = 0; k < secs; k++) { await page.waitForTimeout(1000); await snap(`${kind}_${String(k).padStart(2, '0')}`); }
  const after = await page.evaluate((kind) => window.__dbg.game().monsters.filter((m) => m.kind === kind && !m.dead).length, kind);
  console.log(`${kind}: ${before} before, ${after} left, ${before - after} fell`);
}
