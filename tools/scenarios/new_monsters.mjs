// VERSION 19.9, IN PLAY: THE NEW MONSTERS (game/defs.ts NEW_MONSTERS, MONSTERS, MONSTER_MOVES, LEADERS;
// the art chat's pictures of them and the rings that tell blue and yellow packs apart, art/bestiary.ts
// useNewMonsters), on in the game.
// 1. The practice room, the warrior (who cannot die here):
//    - a blue pack of Shades round him, who rake;
//    - a Boneward six tiles off, who throws its spear, fights with its shield while the spear lies on the
//      floor, stoops for it and thrusts;
//    - an Ossuary Golem six tiles off, who throws skulls that come down where he stood, and swings its club;
//    - a yellow pack of skeletons led by the skeleton champion, who cleaves and cries: his minions' words
//      are whole while the cry holds;
//    - a yellow pack of bone archers led by the bone marksman: his great shot, its line of aim, his shots;
//    - a yellow pack of cultists led by the high priest: his censer's burning smoke, his fire bolts;
//    - a yellow pack of green trolls led by the troll chieftain: his swing and his slam;
//    - the bot fighting a Boneward, a Golem and the marksman's pack.
// 2. Dungeons 1 to 6, laid as the game lays them: each new monster only from its own dungeon on; a yellow
//    pack of skeletons, archers, cultists or green trolls led by its new leader; no pack of bats yellow.
//    Then the bot fighting in the fourth.
// 3. Switched off: no new monster in a dungeon laid, and a yellow pack's leader one of its own kind; and on
//    again, as the game has it.
// Nothing may go wrong on the page, and the pictures are painted all the while.
//   node tools/playtest.mjs [--file dist/<a build>.html] [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/new_monsters.mjs --out shots/new_monsters
import { log } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  await page.evaluate(() => { window.__dbg.saving(false); });
  check('the new monsters are on in the game', await page.evaluate(() => window.__dbg.newMonsters()) === true);
  check('and the monsters\' attacks with them', await page.evaluate(() => window.__dbg.monsterAttacks()) === true);

  /**
   * The practice room, emptied, with what `put` puts in it; then `secs` of the game watched (at twice its
   * speed): the moves the new monsters wind up, the zones laid, the shots in flight, a Boneward bare or
   * stooping, minions rallied; and (`fresh`: pictures not shown before) the pictures of them painted.
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
    const seen = { moves: new Set(), zones: new Set(), shots: new Set(), states: new Set(), spears: 0, bare: false, rallied: 0, over: false };
    for (let i = 0; i < Math.round(secs * 1000 / 120); i++) {
      await page.waitForTimeout(120);
      const s = await page.evaluate(() => {
        const g = window.__dbg.game();
        const MOVES = { boneward: ['swing', 'bash', 'throw'], golem: ['swing', 'throw'], champion: ['swing', 'rally'], marksman: ['shoot', 'pierce'], priest: ['shoot', 'censer'], chieftain: ['swing', 'slam'] };
        const live = g.monsters.filter((m) => !m.dead);
        const NEW = ['shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'];
        return {
          moves: live.filter((m) => m.state === 'windup' && NEW.includes(m.kind)).map((m) => `${m.kind}:${MOVES[m.kind] && m.move !== undefined && m.move >= 0 ? MOVES[m.kind][m.move] : 'blow'}`),
          states: live.filter((m) => NEW.includes(m.kind)).map((m) => `${m.kind}:${m.state}`),
          zones: g.zones.map((z) => z.kind),
          shots: g.projectiles.map((p) => p.look),
          spears: g.spears.length,
          bare: live.some((m) => m.bare),
          rallied: live.filter((m) => m.rarity === 'minion' && m.rallyT > 0).length,
          over: g.over,
        };
      });
      for (const mv of s.moves) seen.moves.add(mv);
      for (const st of s.states) seen.states.add(st);
      for (const z of s.zones) seen.zones.add(z);
      for (const p of s.shots) seen.shots.add(p);
      seen.spears = Math.max(seen.spears, s.spears);
      if (s.bare) seen.bare = true;
      seen.rallied = Math.max(seen.rallied, s.rallied);
      if (s.over) seen.over = true;
      if (i === Math.round(secs * 1000 / 240)) await snap(label);
    }
    await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; });
    const painted = (await page.evaluate(() => window.__dbg.painting.frames)) - before;
    log(label, JSON.stringify({ moves: [...seen.moves], states: [...seen.states], zones: [...seen.zones], shots: [...seen.shots], spears: seen.spears, bare: seen.bare, rallied: seen.rallied, over: seen.over, painted }));
    if (fresh) check(`${label}: their pictures were painted as they were shown`, painted > 20, `${painted} frames`);
    check(`${label}: the warrior is still standing`, !seen.over);
    return seen;
  };
  const has = (seen, mv) => seen.moves.has(mv);
  const list = (seen) => [...seen.moves].join(' ');

  // ---- 1. the practice room -------------------------------------------------------------------------
  const shades = await fight('shades', () => {
    const g = window.__dbg.game(); const h = g.hero;
    for (const [dx, dy] of [[-1.2, 0], [0, -1.3], [1.1, 0.4], [-0.8, 1.1], [0.6, -1.1]]) {
      const m = g.spawn('shade', h.x + dx, h.y + dy, 1, 0, false, g.rng, null, { rarity: 'blue', words: ['frost'] }); g.wakeUp(m); m.life = m.maxLife = 1e7;
    }
  }, 5, false);
  check('the Shades: they rake', has(shades, 'shade:blow'), list(shades));

  const boneward = await fight('boneward', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const m = g.spawn('boneward', h.x - 6, h.y, 1, 0, false, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7; m.cd = 0.2; m.moveCd = [0, 0, 0];
  }, 9, false);
  check('the Boneward: it throws its spear', has(boneward, 'boneward:throw') && (boneward.shots.has('spear') || boneward.spears > 0), list(boneward));
  check('the Boneward: its spear lies on the floor', boneward.spears > 0, `${boneward.spears} at once`);
  check('the Boneward: it is bare while the spear lies there', boneward.bare);
  check('the Boneward: it stoops for its spear', boneward.states.has('boneward:pickup'), [...boneward.states].join(' '));
  check('the Boneward: it thrusts or bashes', has(boneward, 'boneward:swing') || has(boneward, 'boneward:bash'), list(boneward));

  const golem = await fight('golem', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const m = g.spawn('golem', h.x - 6, h.y, 1, 0, false, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7; m.cd = 0.2; m.moveCd = [0, 0];
  }, 9, false);
  check('the Golem: it throws a skull', has(golem, 'golem:throw'), list(golem));
  check('the Golem: the skull comes down where it was aimed', golem.zones.has('skull'), [...golem.zones].join(' '));
  check('the Golem: it swings its club', has(golem, 'golem:swing'), list(golem));

  const champion = await fight('champion', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const words = ['fire'];
    const c = g.spawn('champion', h.x - 1.8, h.y, 1, 1, false, g.rng, null, { rarity: 'leader', words }); g.wakeUp(c); c.life = c.maxLife = 1e7; c.cd = 0.3;
    for (const [dx, dy] of [[-0.6, -1.2], [0.4, 1.2], [1.2, -0.4], [-1.4, 1.3]]) {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng, null, { rarity: 'minion', words }); g.wakeUp(m); m.life = m.maxLife = 1e7;
    }
  }, 8, false);
  check('the champion: he cleaves', has(champion, 'champion:swing'), list(champion));
  check('the champion: he cries', has(champion, 'champion:rally'), list(champion));
  check('the champion: his minions\' words are whole while it holds', champion.rallied > 0, `${champion.rallied} at once`);

  const marksman = await fight('marksman', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const words = ['frost'];
    const c = g.spawn('marksman', h.x - 7, h.y, 1, 1, false, g.rng, null, { rarity: 'leader', words }); g.wakeUp(c); c.life = c.maxLife = 1e7; c.cd = 0.2; c.moveCd = [0, 0];
    for (const [dx, dy] of [[-7.6, -2], [-7.6, 2], [-8.6, 0.4]]) {
      const m = g.spawn('archer', h.x + dx, h.y + dy, 1, 0, false, g.rng, null, { rarity: 'minion', words }); g.wakeUp(m); m.life = m.maxLife = 1e7;
    }
  }, 9, false);
  check('the marksman: his great shot', has(marksman, 'marksman:pierce'), list(marksman));
  check('the marksman: its line of aim on the floor', marksman.zones.has('aim'), [...marksman.zones].join(' '));
  check('the marksman: the great arrow flies', marksman.shots.has('great'), [...marksman.shots].join(' '));
  check('the marksman: his shots', has(marksman, 'marksman:shoot'), list(marksman));

  const priest = await fight('priest', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const words = ['fire'];
    const c = g.spawn('priest', h.x - 2.4, h.y, 1, 1, false, g.rng, null, { rarity: 'leader', words }); g.wakeUp(c); c.life = c.maxLife = 1e7; c.cd = 0.2; c.moveCd = [0, 0];
    for (const [dx, dy] of [[-4, -1.6], [-4.4, 1.4], [-5, 0]]) {
      const m = g.spawn('cultist', h.x + dx, h.y + dy, 1, 0, false, g.rng, null, { rarity: 'minion', words }); g.wakeUp(m); m.life = m.maxLife = 1e7;
    }
  }, 9, false);
  check('the high priest: he swings his censer', has(priest, 'priest:censer'), list(priest));
  check('the high priest: its burning smoke on the floor', priest.zones.has('smoke'), [...priest.zones].join(' '));
  check('the high priest: his fire bolts', has(priest, 'priest:shoot') && priest.shots.has('bolt'), `${list(priest)}; ${[...priest.shots].join(' ')}`);

  const chieftain = await fight('chieftain', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const words = ['power'];
    const c = g.spawn('chieftain', h.x - 1.6, h.y, 1, 1, false, g.rng, null, { rarity: 'leader', words }); g.wakeUp(c); c.life = c.maxLife = 1e7; c.cd = 0.2;
    for (const [dx, dy] of [[1.4, -1.4], [1.6, 1.2]]) {
      const m = g.spawn('brute', h.x + dx, h.y + dy, 1, 0, false, g.rng, null, { rarity: 'minion', words }); g.wakeUp(m); m.life = m.maxLife = 1e7;
    }
  }, 9, false);
  check('the chieftain: he swings', has(chieftain, 'chieftain:swing'), list(chieftain));
  check('the chieftain: he slams, its red circle first', has(chieftain, 'chieftain:slam') && chieftain.zones.has('warn'), `${list(chieftain)}; ${[...chieftain.zones].join(' ')}`);

  // (the bot fights a Boneward, a Golem and the marksman's pack: it steps aside from the line of aim and
  // out of where a skull will come down)
  await fight('bot', () => {
    const g = window.__dbg.game(); const h = g.hero;
    const b = g.spawn('boneward', h.x - 5, h.y + 2, 1, 0, false, g.rng); g.wakeUp(b); b.life = b.maxLife = 1e7;
    const o = g.spawn('golem', h.x + 4, h.y - 4, 2, 0, false, g.rng); g.wakeUp(o); o.life = o.maxLife = 1e7; o.moveCd = [0, 0];
    const words = ['frost'];
    const c = g.spawn('marksman', h.x - 6, h.y - 4, 3, 1, false, g.rng, null, { rarity: 'leader', words }); g.wakeUp(c); c.life = c.maxLife = 1e7; c.moveCd = [0, 0];
    for (const [dx, dy] of [[-6.5, -5.5], [-7.4, -3.4]]) {
      const m = g.spawn('archer', h.x + dx, h.y + dy, 3, 0, false, g.rng, null, { rarity: 'minion', words }); g.wakeUp(m); m.life = m.maxLife = 1e7;
    }
  }, 8, true, false);

  // ---- 2. dungeons, as the game lays them -----------------------------------------------------------
  const laid = await page.evaluate(() => {
    const d = window.__dbg;
    const out = [];
    for (const depth of [1, 2, 3, 4, 5, 6]) {
      for (const seed of [11, 23, 37, 41, 59]) {
        d.run('warrior', seed + 100 * depth); d.seasoned(12); d.autoLevel = false;
        const g = d.game(); g.depth = depth; g.cleared = depth; g.enterDungeon();
        const packs = {};
        for (const m of g.monsters) (packs[m.packId] ||= []).push({ kind: m.kind, rarity: m.rarity || '' });
        out.push({ depth, packs: Object.values(packs) });
      }
    }
    return out;
  });
  const FROM = { shade: 2, boneward: 3, golem: 4 };
  const LEADS = { skeleton: 'champion', archer: 'marksman', cultist: 'priest', brute: 'chieftain' };
  const early = [];
  const misled = [];
  const yellowBats = [];
  const seenKinds = new Set();
  const leaders = new Set();
  for (const { depth, packs } of laid) {
    for (const pack of packs) {
      for (const m of pack) {
        seenKinds.add(m.kind);
        if (FROM[m.kind] && depth < FROM[m.kind]) early.push(`${m.kind} in dungeon ${depth}`);
        if (m.kind === 'bat' && (m.rarity === 'leader' || m.rarity === 'minion')) yellowBats.push(`dungeon ${depth}`);
      }
      const leader = pack.find((m) => m.rarity === 'leader');
      const minion = pack.find((m) => m.rarity === 'minion');
      if (leader) leaders.add(leader.kind);
      if (leader && minion && LEADS[minion.kind] && leader.kind !== LEADS[minion.kind]) misled.push(`${minion.kind}s led by a ${leader.kind} in dungeon ${depth}`);
    }
  }
  log('dungeons 1 to 6', JSON.stringify({ kinds: [...seenKinds], leaders: [...leaders] }));
  check('dungeons: no new monster before its own dungeon (Shades from 2, Bonewards from 3, Golems from 4)', early.length === 0, early.slice(0, 5).join('; '));
  check('dungeons: the Shade, the Boneward and the Golem all come', ['shade', 'boneward', 'golem'].every((k) => seenKinds.has(k)), [...seenKinds].join(' '));
  check('dungeons: a yellow pack of skeletons, archers, cultists or green trolls is led by its new leader', misled.length === 0, misled.slice(0, 5).join('; '));
  check('dungeons: the new leaders lead', ['champion', 'marksman', 'priest', 'chieftain'].some((k) => leaders.has(k)), [...leaders].join(' '));
  check('dungeons: no pack of bats is yellow', yellowBats.length === 0, yellowBats.slice(0, 5).join('; '));

  // (the bot fights on in the fourth)
  const dungeon = await page.evaluate(() => {
    const d = window.__dbg; d.run('warrior', 41); d.seasoned(12); d.autoLevel = false; d.god = true;
    const g = d.game(); g.depth = 4; g.cleared = 4; g.enterDungeon();
    const NEW = ['shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'];
    return { monsters: g.monsters.length, new: g.monsters.filter((m) => NEW.includes(m.kind)).length };
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
  await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; d.god = false; });
  check('a dungeon with the new monsters: the bot fought on', !over);

  // ---- 3. switched off: as before ------------------------------------------------------------------
  check('switched off', await page.evaluate(() => window.__dbg.newMonsters(false)) === false);
  const off = await page.evaluate(() => {
    const d = window.__dbg;
    const NEW = ['shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'];
    let fresh = 0;
    const misled = [];
    for (const depth of [2, 4, 6]) {
      for (const seed of [11, 37]) {
        d.run('warrior', seed + 100 * depth); d.seasoned(12); d.autoLevel = false;
        const g = d.game(); g.depth = depth; g.cleared = depth; g.enterDungeon();
        fresh += g.monsters.filter((m) => NEW.includes(m.kind)).length;
        const packs = {};
        for (const m of g.monsters) (packs[m.packId] ||= []).push(m);
        for (const pack of Object.values(packs)) {
          const leader = pack.find((m) => m.rarity === 'leader');
          const minion = pack.find((m) => m.rarity === 'minion');
          if (leader && minion && leader.kind !== minion.kind) misled.push(`${minion.kind}s led by a ${leader.kind}`);
        }
      }
    }
    return { fresh, misled };
  });
  check('switched off, no new monster in a dungeon', off.fresh === 0, `${off.fresh}`);
  check('switched off, a yellow pack is led by one of its own', off.misled.length === 0, off.misled.slice(0, 5).join('; '));
  await snap('switched_off');
  check('and on again, as the game has it', await page.evaluate(() => window.__dbg.newMonsters(true)) === true);
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
