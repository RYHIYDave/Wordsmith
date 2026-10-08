// A long fast-forwarded bot run through several dungeons and town visits, watching for errors.
//   node tools/playtest.mjs --hash "bot=ranger&seed=3" --scenario tools/scenarios/soak.mjs --out shots/soak
export default async function (page, snap) {
  await page.evaluate(() => { window.__dbg.god = true; window.__dbg.speed = 20; });
  const st = () => page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return { depth: g.depth, cleared: g.cleared, level: h.level, kills: g.kills, town: g.level.town, t: Math.round(g.runTime), gold: h.gold, bag: h.bag.filter(Boolean).length, words: Object.values(h.words).reduce((a, b) => a + b, 0), zones: g.zones.length, monsters: g.monsters.length }; });
  let last = -1;
  for (let i = 0; i < 400; i++) {
    await page.waitForTimeout(250);
    const s = await st();
    if (s.cleared !== last) { last = s.cleared; console.log(`  cleared ${s.cleared}: level ${s.level}, kills ${s.kills}, run time ${s.t}s, gold ${s.gold}, bag ${s.bag}, spare words ${s.words}`); }
    if (s.cleared >= 6) break;
  }
  const s = await st();
  console.log('soak ended', JSON.stringify(s));
  await page.evaluate(() => { window.__dbg.speed = 1; });
  await page.waitForTimeout(500);
  await snap('end');
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
