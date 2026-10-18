// THE SKILL TREES REMADE (game/talents.ts TALENTS2), IN THE GAME: the bot plays the descent fast-forwarded with every one of
// its class's fifteen talents taken at once (more than ten points would give: every new rule at work together), watching
// for errors, and samples what the new rules leave about (bleeding, thrown monsters, Kindling's ground, Charged's charge).
//   node tools/playtest.mjs --file <page> --hash "bot=ranger&seed=3" --scenario tools/scenarios/talents2_soak.mjs --out shots/talents2/ranger
// FLOORS: how many floors to clear (2). DEPTH: the floor to begin on (6).
const ALL = {
  warrior: ['honededge', 'cadence', 'sweepingcut', 'footwork', 'drilledleap', 'giantslayer', 'masterstroke', 'thickskin', 'shieldwall', 'resolute', 'secondwind', 'bulwark', 'thorns', 'unbreakable', 'earthshaker'],
  ranger: ['fleet', 'windrunner', 'keeneye', 'venom', 'quickdraw', 'longshot', 'lightstep', 'huntersmark', 'widetraps', 'minefield', 'splitshot', 'hail', 'piercing', 'farsight', 'steadyaim'],
  mage: ['kindling', 'searing', 'flamewarp', 'fuel', 'inferno', 'charged', 'forking', 'stormwarp', 'overload', 'stormcaller', 'bittercold', 'deepfreeze', 'frostwarp', 'rime', 'shatter'],
};

export default async function (page, snap) {
  const floors = Number(process.env.FLOORS || 2);
  const depth = Number(process.env.DEPTH || 6);
  const cls = await page.evaluate(([all, depth]) => {
    const d = window.__dbg;
    d.god = true;
    const g = d.game();
    d.seasoned(30);
    g.hero.talents = [...all[g.hero.cls]];
    g.refresh();
    g.depth = depth;
    g.cleared = depth - 1;
    g.enterDungeon();
    d.speed = 10;
    return { cls: g.hero.cls, talents: g.hero.talents.length, on: d.talents2.on };
  }, [ALL, depth]);
  console.log('talents2', JSON.stringify(cls));
  if (!cls.on) console.log('  !! TALENTS2 is off');
  const seen = { bleeding: 0, thrown: 0, cracked: 0, kindling: 0, venom: 0, shocked: 0, frozen: 0, charged: 0 };
  const st = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const ms = g.monsters.filter((m) => !m.dead);
    return {
      depth: g.depth, cleared: g.cleared, town: g.level.town, kills: g.kills, t: Math.round(g.runTime), over: g.over,
      // (the talents' own lists keep their own talents: refresh, a new floor and a save leave them be)
      talents: g.hero.talents.length,
      bleeding: ms.filter((m) => m.bleedT > 0).length, thrown: ms.filter((m) => m.thrown).length, cracked: ms.filter((m) => m.cracks).length,
      kindling: g.zones.filter((z) => z.from === 'kindling').length, venom: g.zones.filter((z) => z.kind === 'venom').length,
      shocked: ms.filter((m) => m.shockT > 0).length, frozen: ms.filter((m) => m.frozenT > 0).length, charged: g.charge >= 1 ? 1 : 0,
    };
  });
  const start = await st();
  let last = start.cleared;
  for (let i = 0; i < 1600; i++) {
    await page.waitForTimeout(250);
    const s = await st();
    for (const k of Object.keys(seen)) if (s[k] > 0) seen[k]++;
    if (s.cleared !== last) {
      last = s.cleared;
      console.log(`  cleared ${s.cleared}: kills ${s.kills}, run time ${s.t}s`);
    }
    if (s.over) {
      console.log('  !! the hero fell, in god mode');
      break;
    }
    if (s.cleared >= start.cleared + floors) break;
  }
  const end = await st();
  console.log('talents2 soak ended', JSON.stringify(end));
  console.log('seen (samples a quarter of a second apart)', JSON.stringify(seen));
  if (end.cleared < start.cleared + floors) console.log(`  !! cleared ${end.cleared - start.cleared} of ${floors} floors`);
  await page.evaluate(() => { window.__dbg.speed = 1; });
  await page.waitForTimeout(500);
  await snap('end');
}
