// THE ENEMY REWORK, PLAYED THROUGH BY THE BOT (every action switch on in the page built for it: ACTION_F1 to ACTION_F4, CO_ACTION,
// AM_ACTION): the test bot, kept alive, fast-forwarded through the first floors, its bosses and their packs, every page error
// counted (tools/playtest.mjs). A picture at each floor.
//   node tools/playtest.mjs --file dist/action_all.html --hash "bot=warrior&seed=7" --scenario tools/scenarios/action_bot.mjs --out shots/abot
export default async function (page, snap) {
  const st = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const kinds = {};
    for (const m of g.monsters) if (!m.dead) kinds[m.kind] = (kinds[m.kind] || 0) + 1;
    return { town: g.level.town, depth: g.depth, kills: g.kills, t: Math.round(g.runTime), cleared: g.cleared, perils: g.perils.length, zones: g.zones.length, kinds };
  });
  await page.evaluate(() => { window.__dbg.god = true; window.__dbg.speed = 12; });
  const until = Number(process.env.DEPTH || 5);
  const secs = Number(process.env.SECS || 600);
  let last = -1;
  for (let i = 0; i < secs * 2; i++) {
    await page.waitForTimeout(500);
    const s = await st();
    if (s.depth !== last) {
      last = s.depth;
      console.log('floor', s.depth, JSON.stringify(s));
      await snap(`d${s.depth}`);
    }
    if (i % 60 === 0) console.log('  ', JSON.stringify(s));
    if (s.depth > until) break;
  }
  console.log('end', JSON.stringify(await st()));
}
