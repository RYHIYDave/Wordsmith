// WHAT HAPPENS AT EVERY NEW SCREEN (made 11 Nov 2026 for his “Explain to me why the game lags at literally every new screen
// regardless of introducing loading screens?”, 21:30, to the chat that brought the eight sides in). The frames from the moment
// a place is asked for, under its loading screen, in the three seconds after it and then; what the game itself paints in
// them (art/kit.ts PAINTING: pictures painted the first time they are shown, on the thread that draws the game), with who
// asked for them (a readable build names them: node tools/build.mjs --dev, then Play.html checked out again); and how many
// pictures the side painter hands over meanwhile. A new game's town, then each floor come into and stood on, then 15 seconds
// of the bot's play at the game's own speed, then back to town.
//   node tools/playtest.mjs --file <a baked page> --serve --touch --size 844x390 --dpr 3 --scenario tools/scenarios/new_screen.mjs
//   CLS=warrior   FLOORS=1,2,6,11
// WHAT IT FOUND (a readable build of main at 95eefb7 with the eight sides on, the Warrior, in a browser here, not a phone):
// the making of a level is one frame of 0.85 to 1.25 s and the loading screen hides it; stood on, a new floor is smooth. IN THE
// FIRST 15 s OF PLAY: floor 1, no frame over 50 ms; floor 2, 3 (the side painter handing over 263 pictures); FLOOR 6, 29 FRAMES
// OVER 50 ms AND 123 OVER 33, 3.7 s LOST, THE GAME ITSELF PAINTING 494 PICTURES, 5.4 s OF PAINTING; FLOOR 11, 44 AND 204, 6.0 s
// LOST, 548 PICTURES, 5.6 s. Every one a monster's frame painted the first time it is shown (Renderer.monsterSprite, gaitFrame,
// clipFrame and stand: the floors' own kinds), 10 to 15 ms each. The loading screen waits for the hero's pictures only.
export default async function (page) {
  const cls = process.env.CLS || 'warrior';
  const floors = (process.env.FLOORS || '1,2,6,11').split(',').map(Number);
  await page.evaluate(() => {
    const d = window.__dbg;
    const R = (window.__rec = { t: [] });
    const tick = (now) => { R.t.push([now, d.loadingNow() ? 1 : 0, d.painting.frames, d.painting.ms]); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    d.painting.trace = new Map();
  });
  const mark = () => page.evaluate(() => ({ at: performance.now(), n: window.__rec.t.length, painter: { ...window.__dbg.painter.stats, films: undefined, failed: undefined } }));
  const who = (k = 6) => page.evaluate((k) => { const t = window.__dbg.painting.trace; const rows = [...t.entries()].sort((a, b) => b[1].ms - a[1].ms).slice(0, k).map(([w, e]) => `${e.ms.toFixed(0)} ms x${e.n}  ${w.slice(0, 150)}`); t.clear(); return rows; }, k);
  const tell = async (label, from, to) => {
    const rows = await page.evaluate(([a, b]) => window.__rec.t.slice(a, b), [from.n, to.n]);
    const part = (rs, name) => {
      if (rs.length < 2) return `${name}: none`;
      const gaps = []; for (let i = 1; i < rs.length; i++) gaps.push(rs[i][0] - rs[i - 1][0]);
      const over = (x) => gaps.filter((g) => g > x).length;
      const lost = gaps.reduce((s, g) => s + Math.max(0, g - 17), 0);
      return `${name}: ${((rs[rs.length - 1][0] - rs[0][0]) / 1000).toFixed(1)} s, ${gaps.length} frames; over 33 ms ${over(33)}, over 50 ms ${over(50)}, over 100 ms ${over(100)}, longest ${Math.max(...gaps).toFixed(0)} ms; ${lost.toFixed(0)} ms lost to long frames; painted by the game itself ${rs[rs.length - 1][2] - rs[0][2]} frames, ${(rs[rs.length - 1][3] - rs[0][3]).toFixed(0)} ms`;
    };
    const under = rows.filter((r) => r[1] === 1);
    const firstAfter = rows.findIndex((r, i) => i > 0 && r[1] === 0 && rows[i - 1][1] === 1);
    const after = firstAfter >= 0 ? rows.slice(firstAfter) : rows.filter((r) => r[1] === 0);
    const first3 = after.filter((r) => r[0] - after[0][0] <= 3000);
    const rest = after.filter((r) => r[0] - after[0][0] > 3000);
    console.log(`== ${label}`);
    console.log('   ' + part(under, 'under the loading screen'));
    console.log('   ' + part(first3, 'the first 3 s after it'));
    console.log('   ' + part(rest, 'then'));
    console.log(`   the side painter handed over ${to.painter.frames - from.painter.frames} pictures meanwhile`);
    for (const w of await who()) console.log('      ' + w);
  };
  const settle = async () => { for (let i = 0; i < 600; i++) { if (!(await page.evaluate(() => window.__dbg.loadingNow()))) break; await page.waitForTimeout(50); } };

  let a = await mark();
  await page.evaluate((cls) => { const d = window.__dbg; d.saving(false); d.run(cls, 5); d.autoLevel = false; d.autoWords = false; d.seasoned(10); d.god = true; }, cls);
  await page.waitForTimeout(400); await settle(); await page.waitForTimeout(7000);
  // (the loading screen between floors from here on, as in the game: a playtest's own start has none)
  await page.evaluate(() => window.__dbg.loadedHere());
  let b = await mark();
  await tell(`a new game: the town (standing)`, a, b);
  for (const k of floors) {
    a = await mark();
    await page.evaluate((k) => { const d = window.__dbg; d.bot(false); d.speed = 1; const g = d.game(); g.depth = k; g.cleared = k - 1; g.enterDungeon(); }, k);
    await page.waitForTimeout(400); await settle(); await page.waitForTimeout(6000);
    b = await mark();
    await tell(`floor ${k}, come into (standing)`, a, b);
    a = await mark();
    await page.evaluate(() => { const d = window.__dbg; d.bot(true); d.speed = 1; });
    await page.waitForTimeout(15000);
    await page.evaluate(() => { const d = window.__dbg; d.bot(false); });
    b = await mark();
    await tell(`floor ${k}, 15 s of play (the bot, at the game's own speed)`, a, b);
  }
  a = await mark();
  await page.evaluate(() => { const g = window.__dbg.game(); g.enterTown(null); });
  await page.waitForTimeout(400); await settle(); await page.waitForTimeout(6000);
  b = await mark();
  await tell('back to town', a, b);
}
