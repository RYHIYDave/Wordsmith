// VERSION 19.8: THE MONSTERS' ATTACKS (game/defs.ts MONSTER_ATTACKS, MONSTER_MOVES; the art chat's
// pictures of the new moves, art/bestiary.ts useMonsterAttacks), switched on for this playtest and off
// again at its end, as the game has it.
// 1. The practice room, the warrior (who cannot die here) and the bot: three green trolls, who swing and
//    slam; a red troll from six tiles off, who lays his line, charges down it and pulls up; the Warden,
//    who swings, slams and calls the dead, who crawl out of the ground and then join the fight.
// 2. A dungeon (the fourth), the bot fighting there with the attacks on.
// 3. Switched off: a green troll slams, its red circle first, as before.
// Nothing may go wrong on the page, and the pictures are painted all the while.
//   node tools/playtest.mjs [--file dist/<a build>.html] [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/monster_attacks.mjs --out shots/monster_attacks
import { log } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  await page.evaluate(() => { window.__dbg.saving(false); });
  check('the attacks are switched on for this playtest', await page.evaluate(() => window.__dbg.monsterAttacks(true)) === true);

  /**
   * The practice room, emptied, with what `put` puts in it; then `secs` of the game watched: the moves
   * seen, the lines laid, the dead that came up, and (`fresh`: pictures not shown before) the pictures
   * of them painted as they were first shown.
   */
  const fight = async (label, put, secs, bot, fresh = true) => {
    await page.evaluate(() => {
      const d = window.__dbg; d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
      const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    });
    await page.waitForTimeout(400);
    await page.evaluate(put);
    await page.evaluate((bot) => { const d = window.__dbg; d.bot(bot); d.speed = 2; }, bot);
    const before = await page.evaluate(() => window.__dbg.painting.frames);
    const seen = { moves: new Set(), lanes: 0, charged: 0, risers: 0, joined: 0, over: false };
    for (let i = 0; i < Math.round(secs * 1000 / 120); i++) {
      await page.waitForTimeout(120);
      const s = await page.evaluate(() => {
        const g = window.__dbg.game();
        const moves = (m) => (m.kind === 'warden' ? ['swing', 'bolts', 'slam', 'summon'] : m.champion ? ['swing', 'slam', 'charge'] : ['swing', 'slam']);
        return {
          moves: g.monsters.filter((m) => m.state === 'windup' && m.move !== undefined && m.move >= 0 && (m.kind === 'brute' || m.kind === 'warden')).map((m) => moves(m)[m.move]),
          lanes: g.zones.filter((z) => z.kind === 'lane').length,
          charging: g.monsters.some((m) => m.state === 'charge'),
          risers: g.risers.length,
          skeletons: g.monsters.filter((m) => m.kind === 'skeleton' && !m.dead).length,
          over: g.over,
        };
      });
      for (const mv of s.moves) seen.moves.add(mv);
      seen.lanes += s.lanes;
      if (s.charging) seen.charged++;
      seen.risers = Math.max(seen.risers, s.risers);
      seen.joined = Math.max(seen.joined, s.skeletons);
      if (s.over) seen.over = true;
      if (i === Math.round(secs * 1000 / 240)) await snap(label);
    }
    await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; });
    const painted = (await page.evaluate(() => window.__dbg.painting.frames)) - before;
    log(label, JSON.stringify({ ...seen, moves: [...seen.moves], painted }));
    if (fresh) check(`${label}: their pictures were painted as they were shown`, painted > 20, `${painted} frames`);
    check(`${label}: the warrior is still standing`, !seen.over);
    return seen;
  };

  // ---- 1. the practice room -------------------------------------------------------------------------
  const trolls = await fight('green_trolls', () => {
    const g = window.__dbg.game(); const h = g.hero;
    for (const [dx, dy] of [[-1.4, 0], [0, -1.5], [-1.1, 1.1]]) {
      const m = g.spawn('brute', h.x + dx, h.y + dy, 1, 0, false, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7;
    }
  }, 9, false);
  check('green trolls: they swing', trolls.moves.has('swing'), [...trolls.moves].join(' '));
  check('green trolls: and slam', trolls.moves.has('slam'), [...trolls.moves].join(' '));
  check('green trolls: no charge (it is the red troll\'s)', !trolls.moves.has('charge'));

  const red = await fight('red_troll', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const m = g.spawn('brute', h.x - 6, h.y, 1, 2, false, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7; m.cd = 0.3;
  }, 6, false);
  check('the red troll: he lays his line on the floor', red.lanes > 0, `${red.lanes} looks at it`);
  check('the red troll: and charges down it', red.charged > 0 && red.moves.has('charge'), `${red.charged} looks at him running`);

  const warden = await fight('warden', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const m = g.spawn('warden', h.x - 1.7, h.y + 1.7, 1, 0, true, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7; m.cd = 0.3;
    // (his summon sooner than it would come, for a short playtest)
    m.moveCd = [0, 0, 2.5, 4];
  }, 12, false);
  check('the Warden: he swings', warden.moves.has('swing'), [...warden.moves].join(' '));
  check('the Warden: he slams', warden.moves.has('slam'), [...warden.moves].join(' '));
  check('the Warden: he calls the dead', warden.moves.has('summon'), [...warden.moves].join(' '));
  check('the Warden: they crawl out of the ground', warden.risers > 0, `${warden.risers} at once`);
  check('the Warden: and join the fight', warden.joined > 0, `${warden.joined} standing`);
  // (the bot fights the Warden and what he calls)
  await fight('warden_bot', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const m = g.spawn('warden', h.x - 1.7, h.y + 1.7, 1, 0, true, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7; m.cd = 0.3; m.moveCd = [0, 0, 2.5, 3];
    const r = g.spawn('brute', h.x - 5, h.y - 3, 1, 2, false, g.rng); g.wakeUp(r); r.life = r.maxLife = 1e7;
  }, 8, true, false);

  // ---- 2. a dungeon, the bot fighting there -------------------------------------------------------
  const dungeon = await page.evaluate(() => {
    const d = window.__dbg; d.run('warrior', 41); d.seasoned(12); d.autoLevel = false; d.god = true;
    const g = d.game(); g.depth = 4; g.cleared = 4; g.enterDungeon();
    return { monsters: g.monsters.length, trolls: g.monsters.filter((m) => m.kind === 'brute').length };
  });
  log('dungeon 4', JSON.stringify(dungeon));
  await page.evaluate(() => { const d = window.__dbg; d.bot(true); d.speed = 2; });
  let over = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(120);
    over = await page.evaluate(() => window.__dbg.game().over);
    if (over) break;
    if (i === 30) await snap('dungeon');
  }
  await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; });
  check('a dungeon with the attacks on: the bot fought on', !over);

  // ---- 3. switched off: as before ------------------------------------------------------------------
  check('switched off again', await page.evaluate(() => window.__dbg.monsterAttacks(false)) === false);
  const off = await page.evaluate(async () => {
    const d = window.__dbg; d.practice('warrior', 7); d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    const h = g.hero;
    const m = g.spawn('brute', h.x - 1.2, h.y, 1, 0, false, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7; m.cd = 0.2;
    return m.id;
  });
  let circle = false;
  for (let i = 0; i < 25 && !circle; i++) {
    await page.waitForTimeout(120);
    circle = await page.evaluate((id) => { const g = window.__dbg.game(); const m = g.monsters.find((o) => o.id === id); return g.zones.some((z) => z.kind === 'warn') && !!m && m.move === undefined; }, off);
  }
  check('switched off, a green troll slams, its red circle first, as before', circle);
  await snap('switched_off');
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
