// THE FLOORS' MONSTERS BAKED (render/monsters_baked.ts), in a real browser, the page served over the web as the published game
// is, its bake beside it (dist/monsters/<mark>/):
//   node tools/build_to.mjs dist/mobs_bake.html --heroes --monsters     (or the release: node tools/build.mjs, then the wrapped page)
//   node tools/playtest.mjs --serve --file dist/mobs_bake.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/monsters_baked.mjs
//   CLS=warrior   FLOORS=1,2,6,11,16   PLAY=15 (seconds of the bot's play a floor)
// A game begun, then each floor come into as he comes into it, by its loading screen: the screen waits for the floor's monsters'
// pictures; as it lifts every figure standing on the floor has come whole from its files, and every place of each holds a
// picture not painted on this page; some of each held against the game's own painting of them, pixel by pixel; then the bot
// plays at the game's own speed and the game itself paints no monster's frame (what it does paint is named: a readable build);
// then on to the next floor, the last one's pictures let go of. Lines marked !! are problems.
//   FILE=1: the page opened as a file (no --serve): nothing is fetched, and the monsters are painted as before.
export default async function (page) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  let problems = 0;
  const bad = (msg) => { problems++; console.log('  !!', msg); };
  const cls = process.env.CLS || 'warrior';
  const floors = (process.env.FLOORS || '1,2,6,11,16').split(',').map(Number);
  const play = Number(process.env.PLAY || 15);
  const asFile = process.env.FILE === '1';
  const fetched = [];
  page.on('requestfinished', (r) => { const u = r.url(); if (u.includes('/monsters/')) fetched.push(u.replace(/.*\/monsters\/[0-9a-f]+\//, '')); });
  const failedReq = [];
  page.on('requestfailed', (r) => { if (r.url().includes('/monsters/')) failedReq.push(r.url()); });
  const settle = async () => { for (let i = 0; i < 1200; i++) { if (!(await page.evaluate(() => window.__dbg.loadingNow()))) return true; await page.waitForTimeout(25); } return false; };

  await page.evaluate((cls) => { const d = window.__dbg; d.saving(false); d.run(cls, 5); d.autoLevel = false; d.autoWords = false; d.seasoned(10); d.god = true; }, cls);
  await page.waitForTimeout(400);
  await settle();
  await page.waitForTimeout(1500);
  // (the loading screen between floors from here on, as in the game: a playtest's own start has none)
  await page.evaluate(() => window.__dbg.loadedHere());
  const st0 = await page.evaluate(() => window.__dbg.bakedMobs());
  console.log(`the monsters' files on this page: ${st0 ? 'to be had' : 'none to be had'}`);
  if (asFile ? !!st0 : !st0) bad(asFile ? 'a page opened as a file has no files to take in' : 'no bake on this page: build it with --monsters and serve it');

  for (const k of floors) {
    const before = await page.evaluate(() => ({ painted: window.__dbg.painting.frames, st: window.__dbg.bakedMobs(), painter: window.__dbg.painter.stats.frames }));
    const n0 = fetched.length;
    const t0 = Date.now();
    await page.evaluate((k) => { const d = window.__dbg; d.bot(false); d.speed = 1; d.painting.trace = new Map(); const g = d.game(); g.depth = k; g.cleared = k - 1; g.enterDungeon(); }, k);
    await page.waitForTimeout(120);
    if (!(await settle())) bad(`floor ${k}: the loading screen did not lift within 30 s`);
    const up = Date.now() - t0;
    const at = await page.evaluate(() => {
      const d = window.__dbg;
      const st = d.bakedMobs();
      const figs = st ? Object.keys(st.here) : [...new Set(d.game().monsters.filter((m) => !m.dead).map((m) => m.kind))];
      const checks = {};
      if (st) for (const f of figs) checks[f] = d.bakedMobsCheck(f, 10);
      return { st, figs, checks, painted: d.painting.frames, alive: d.game().monsters.filter((m) => !m.dead).length, depth: d.game().depth };
    });
    const files = fetched.slice(n0);
    console.log(`== floor ${k}: the loading screen up ${(up / 1000).toFixed(2)} s; ${at.alive} monsters of ${at.figs.length} figures (${at.figs.join(', ')}); ${files.length} files fetched (${files.filter((f) => f.endsWith('.png')).length} sheets)`);
    if (at.depth !== k) bad(`floor ${k}: the game is on floor ${at.depth}`);
    if (at.st) {
      const given = at.st.given - before.st.given;
      console.log(`   taken in under it: ${given} pictures; each figure, ms: ${at.figs.map((f) => `${f} ${at.st.ms[f] ?? '?'}`).join(', ')}`);
      if (at.st.failed.length) bad(`failed: ${at.st.failed.join('; ')}`);
      for (const f of at.figs) {
        const c = at.checks[f];
        // (one that is not baked: the Drowned Eye's kind while the Colossus is floor 10's, the Moth: as before)
        if (at.st.here[f] === null) {
          console.log(`   (${f}: not baked, as before: ${c.unpainted} of its ${c.places} places hold no picture)`);
          continue;
        }
        if (!at.st.here[f]) bad(`${f}: its pictures had not come whole as the loading screen lifted`);
        if (c.unpainted) bad(`${f}: ${c.unpainted} of its ${c.places} places hold no picture yet`);
        if (c.fromFiles !== c.places - c.unpainted) console.log(`   (${f}: ${c.places - c.unpainted - c.fromFiles} of its ${c.places} places hold a picture painted on this page)`);
        if (c.differ) bad(`${f}: ${c.differ} of ${c.checked} places checked are not as the game paints them (${c.worst})`);
      }
      const checked = at.figs.reduce((n, f) => n + at.checks[f].checked, 0);
      const places = at.figs.reduce((n, f) => n + at.checks[f].places, 0);
      console.log(`   ${places} places in all; ${checked} of them painted afresh here and held against the pictures in hand: ${at.figs.every((f) => !at.checks[f].differ) ? 'the same, every pixel' : 'NOT the same'}`);
    } else if (files.length) bad(`fetched ${files.join(', ')}`);
    // (the bot plays at the game's own speed: what the game itself paints meanwhile)
    const p0 = await page.evaluate(() => { const d = window.__dbg; d.painting.trace = new Map(); d.bot(true); d.speed = 1; return { painted: d.painting.frames, ms: d.painting.ms, painter: d.painter.stats.frames, side: d.painter.sideFrames ?? 0 }; });
    await page.waitForTimeout(play * 1000);
    const p1 = await page.evaluate(() => {
      const d = window.__dbg;
      d.bot(false);
      const rows = [...d.painting.trace.entries()].sort((a, b) => b[1].ms - a[1].ms).slice(0, 6).map(([w, e]) => `${e.ms.toFixed(0)} ms x${e.n}  ${w.slice(0, 170)}`);
      const mob = [...d.painting.trace.entries()].filter(([w]) => /monsterSprite|fallenSprite|gaitFrame|moveFrame/.test(w)).reduce((n, [, e]) => n + e.n, 0);
      d.painting.trace = null;
      return { painted: d.painting.frames, ms: d.painting.ms, painter: d.painter.stats.frames, rows, mob, st: d.bakedMobs(), kills: d.game().kills, depth: d.game().depth };
    });
    console.log(`   ${play} s of play (${p1.kills} kills so far): the game itself painted ${p1.painted - p0.painted} pictures (${(p1.ms - p0.ms).toFixed(0)} ms), ${p1.mob} of them a monster's as it was shown; the painter's workers handed over ${p1.painter - p0.painter}`);
    for (const r of p1.rows) console.log('      ' + r);
    if (p1.st && p1.mob > 0) bad(`floor ${k}: ${p1.mob} monster's frames painted as they were shown`);
    if (p1.st && p1.st.failed.length) bad(`failed: ${p1.st.failed.join('; ')}`);
  }
  // (back to town: the floors' monsters let go of; nothing of them asked for there)
  const n1 = fetched.length;
  await page.evaluate(() => { const g = window.__dbg.game(); g.enterTown(null); });
  await page.waitForTimeout(300);
  await settle();
  await page.waitForTimeout(1500);
  const end = await page.evaluate(() => window.__dbg.bakedMobs());
  if (fetched.length > n1) bad(`the town fetched ${fetched.slice(n1).join(', ')}`);
  if (end) console.log(`== back in town: ${end.loads} figures taken in in all, ${end.given} pictures given, ${end.unwanted} not wanted, ${end.stopped} stopped as they came, ${end.failed.length} failed`);
  if (failedReq.length) bad(`requests that failed: ${failedReq.join(', ')}`);
  for (const e of errs) bad(`page error: ${e.split('\n')[0]}`);
  console.log(problems ? `${problems} PROBLEMS` : 'no problems');
}
