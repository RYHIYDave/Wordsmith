// The test bot (kept alive) fast-forwards to the boss, then the fight is photographed at normal speed.
//   node tools/playtest.mjs --hash "bot=warrior&seed=7" --scenario tools/scenarios/boss.mjs --out shots/boss
export default async function (page, snap) {
  const st = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.boss; const h = g.hero;
    return { town: g.level.town, depth: g.depth, kills: g.kills, lvl: h.level, t: Math.round(g.runTime), boss: b ? { state: b.state, life: Math.round(b.life), max: Math.round(b.maxLife), dist: +Math.hypot(b.x - h.x, b.y - h.y).toFixed(1), dead: b.dead, name: b.name } : null,
      zones: g.zones.length, proj: g.projectiles.length, monsters: g.monsters.filter((m) => !m.dead).length, portal: g.level.portal ? g.level.portal.state : null, cleared: g.cleared, words: h.words, skills: h.skills.map((k) => k.r.name) };
  });
  await page.evaluate(() => { window.__dbg.god = true; window.__dbg.speed = 12; });
  let s = await st();
  for (let i = 0; i < 400; i++) {
    await page.waitForTimeout(250);
    s = await st();
    if (!s.town && s.boss && s.boss.state !== 'sleep') break;
  }
  await page.evaluate(() => { window.__dbg.speed = 1; });
  console.log('reached the boss', JSON.stringify(s));
  let n = 0;
  let last = '';
  for (let i = 0; i < 240; i++) {
    await page.waitForTimeout(250);
    s = await st();
    if (!s.boss || s.boss.dead) break;
    const key = s.boss.state + (s.proj > 2 ? 'P' : '') + (s.monsters > 1 ? 'M' : '');
    if ((key !== last || i % 16 === 0) && n < 14) { last = key; await snap(`f${String(n++).padStart(2, '0')}_${s.boss.state}`); console.log('  ', JSON.stringify(s.boss), 'zones', s.zones, 'proj', s.proj, 'monsters', s.monsters); }
  }
  s = await st();
  console.log('after the fight', JSON.stringify(s));
  await page.waitForTimeout(1200);
  await snap('after');
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
