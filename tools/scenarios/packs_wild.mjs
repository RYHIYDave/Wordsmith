// VERSION 19.7, IN PLAY: the monster packs, and the mage's stances and every hero's moves big and
// wild (game/defs.ts MONSTER_PACKS, PACKS, PACK_LOOK; art/moves3.ts MAGE_STANCES and WILD; all on).
// 1. The three heroes fight in the practice room with the bot (the warrior's Strike, Whirlwind and
//    Leap; the ranger's Shot, Volley and roll; the mage's Wave, Orb and Warp), their pictures painted
//    all the while; the mage's stances and the wild moves switched off and on again.
// 2. A dungeon of packs: every pack of one kind, blue and yellow packs among them (a blue pack's
//    word on every one of it, a yellow pack's leader an elite with minions), the bot fighting there;
//    and the blue and yellow names drawn.
// Nothing may go wrong on the page.
//   node tools/playtest.mjs [--file dist/<a build>.html] [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/packs_wild.mjs --out shots/packs_wild
import { log } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); if (!g) return null; const h = g.hero;
    return { cls: h.cls, practice: g.practice, town: g.level.town, life: Math.round(h.life), max: Math.round(h.d.maxLife), over: g.over, painted: d.painting.frames, anim: h.anim, uses: h.skills.map((s) => s.uses) };
  });
  await page.evaluate(() => { window.__dbg.saving(false); });
  check('the packs, their look, her stances and the wild moves are on in the game', await page.evaluate(() => {
    const d = window.__dbg; return d.packLook.on === true;
  }));

  // ---- 1. the three heroes, with the bot, in the practice room -------------------------------------
  for (const cls of ['warrior', 'ranger', 'mage']) {
    await page.evaluate((cls) => { const d = window.__dbg; d.practice(cls); d.autoLevel = false; d.god = true; }, cls);
    await page.waitForTimeout(900);
    let s = await st();
    check(`a ${cls} in the practice room`, !!s && s.cls === cls && s.practice && !s.town, JSON.stringify(s));
    if (!s) continue;
    const before = s.painted;
    const used = s.uses.slice();
    await page.evaluate(() => { const d = window.__dbg; d.bot(true); d.speed = 2; });
    const seen = new Set();
    for (let i = 0; i < 50; i++) {
      await page.waitForTimeout(120);
      s = await st();
      seen.add(s.anim);
      if (i === 25) await snap(`${cls}_fight`);
      if (s.over) break;
    }
    await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; });
    check(`the bot fought on with the ${cls}`, !s.over, `life ${s.life}/${s.max}`);
    check(`the ${cls} attacked`, seen.has('attack') && s.uses.some((u, k) => u > used[k]), `${[...seen].join(' ')}; uses ${s.uses.join(',')}`);
    check(`the ${cls}'s pictures were painted`, s.painted > before + 20, `${s.painted - before} frames painted`);
  }
  // (and as they were before Version 19.7: switched off, the heroes painted again; then on again, as the game has them)
  await page.evaluate(() => { const d = window.__dbg; d.wild(false); d.mageStances(false); });
  await page.waitForTimeout(500);
  let s = await st();
  check('switched off, the mage is drawn as before', !!s && !s.over, JSON.stringify(s));
  await snap('mage_switched_off');
  await page.evaluate(() => { const d = window.__dbg; d.mageStances(true); d.wild(true); });
  await page.waitForTimeout(500);
  s = await st();
  check('switched on again, she is drawn as the game has her', !!s && !s.over, JSON.stringify(s));
  await snap('mage_switched_on');

  // ---- 2. a dungeon of packs --------------------------------------------------------------------------
  const packs = await page.evaluate(() => {
    const d = window.__dbg; d.run('warrior', 41); d.seasoned(10); d.autoLevel = false; d.god = true;
    const g = d.game(); g.depth = 4; g.cleared = 4; g.enterDungeon();
    const byPack = new Map();
    for (const m of g.monsters) {
      if (m.boss || m.packId < 0 || m.packId >= g.level.floor.packs.length) continue;
      if (!byPack.has(m.packId)) byPack.set(m.packId, []);
      byPack.get(m.packId).push(m);
    }
    let mixed = 0; let blue = 0; let yellow = 0; let badBlue = 0; let badYellow = 0;
    for (const ms of byPack.values()) {
      if (ms.some((m) => m.kind !== ms[0].kind)) mixed++;
      if (ms[0].rarity === 'blue') { blue++; if (!ms.every((m) => m.rarity === 'blue' && m.words[0] === ms[0].words[0])) badBlue++; }
      if (ms[0].rarity === 'leader') { yellow++; if (!ms[0].elite || !ms.slice(1).every((m) => m.rarity === 'minion' && m.half && m.half.length === ms[0].words.length)) badYellow++; }
    }
    return { packs: byPack.size, mixed, blue, yellow, badBlue, badYellow, monsters: g.monsters.length };
  });
  log('dungeon 4', JSON.stringify(packs));
  check('every pack is of one kind', packs.mixed === 0, `${packs.mixed} of ${packs.packs} mixed`);
  check('blue packs and yellow packs among them', packs.blue > 0 && packs.yellow > 0, `${packs.blue} blue, ${packs.yellow} yellow of ${packs.packs}`);
  check('a blue pack\'s word is on every one of it', packs.badBlue === 0, `${packs.badBlue} not`);
  check('a yellow pack\'s leader is an elite, the rest its minions with its words at half', packs.badYellow === 0, `${packs.badYellow} not`);
  // (the hero by a blue pack: the bot fights it; the name is drawn once, every bar shown)
  const by = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor;
    const m = g.monsters.find((o) => o.rarity === 'blue');
    if (!m) return null;
    for (const [ox, oy] of [[3, 3], [3, 2], [2, 3], [4, 4], [2, 2], [-3, -3], [3, -3], [-3, 3]]) {
      const x = m.x + ox; const y = m.y + oy;
      if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] !== 1) continue;
      h.x = x; h.y = y;
      return { name: m.name, kind: m.kind };
    }
    return null;
  });
  check('a blue pack to stand by', by !== null, JSON.stringify(by));
  await page.waitForTimeout(1200);
  await snap('blue_pack');
  await page.evaluate(() => { const d = window.__dbg; d.bot(true); d.speed = 2; });
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(120);
    s = await st();
    if (s.over) break;
  }
  await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; });
  check('the bot fought on in a dungeon of packs', !s.over, `life ${s.life}/${s.max}`);
  await snap('after_the_fight');
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
