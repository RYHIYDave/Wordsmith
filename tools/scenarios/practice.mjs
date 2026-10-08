// The practice room: reach it from the title screen as a player would, check what it hands out,
// fight a little, leave, and make sure the saved run was not touched.
//   node tools/playtest.mjs --scenario tools/scenarios/practice.mjs --out shots/prac
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label}`); };
  // a saved run to protect
  await page.evaluate(() => { const d = window.__dbg; d.saving(true); d.run('ranger', 5); d.saving(true); d.save(); d.toTitle(); });
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => localStorage.getItem('arpg.save'));
  await snap('title');
  // (the practice room is in the options)
  await hands.press('button:OPTIONS');
  await page.waitForTimeout(200);
  await snap('options');
  await hands.press('button:PRACTICE ROOM');
  await page.waitForTimeout(200);
  await snap('title_on');
  await hands.press('class:warrior');
  await page.waitForTimeout(600);
  const st = () => page.evaluate(() => {
    const g = window.__dbg.game(); if (!g) return null; const h = g.hero;
    return { practice: g.practice, level: h.level, words: h.words, sockets: h.skills.map((s) => [s.front.length, s.behind.length]), gear: Object.values(h.gear).filter(Boolean).length,
      monsters: g.monsters.filter((m) => !m.dead).length, life: Math.round(h.life), max: h.d.maxLife, town: g.level.town, over: g.over, dmg: [Math.round(h.d.dmgMin), Math.round(h.d.dmgMax)] };
  });
  let s = await st();
  if (!s) { check('in the practice room', false, 'no game started'); return; }
  check('in the practice room', !!s && s.practice && !s.town, JSON.stringify({ level: s.level, sockets: s.sockets, gear: s.gear, dmg: s.dmg }));
  // (six: one for each side of each of the three abilities, the swipe among them since Version 12.2)
  check('every word, six of each', Object.values(s.words).every((n) => n === 6), JSON.stringify(s.words));
  check('two sockets in front and behind on both attacks', s.sockets[0].join() === '2,2' && s.sockets[1].join() === '2,2');
  await snap('arrived');
  await page.waitForTimeout(2500);
  s = await st();
  check('a pack has walked in', s.monsters >= 4, `${s.monsters} monsters`);
  await snap('pack');
  // let the bot fight for a while: packs must keep coming and the hero must not die
  await page.evaluate(() => { const d = window.__dbg; d.autoLevel = false; d.bot(true); d.speed = 4; });
  let waves = 0; let low = 1e9; let last = s.monsters;
  for (let i = 0; i < 80; i++) {
    await page.waitForTimeout(150);
    s = await st();
    if (s.monsters > last) waves++;
    last = s.monsters;
    low = Math.min(low, s.life);
    if (s.over) break;
  }
  check('more packs kept coming', waves >= 2, `${waves} refills seen`);
  check('the hero is still standing', !s.over, `lowest life seen ${low}/${s.max}`);
  await snap('fight');
  await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; });
  // the inventory (every word, four of each)
  await hands.key('Tab');
  await page.waitForTimeout(200);
  check('Tab opens the inventory', (await page.evaluate(() => window.__dbg.panels.open)) === 'inv');
  // (the practice room is there for trying words: its inventory opens where the words go, not on GEAR)
  check('in the practice room it opens on ATTACKS', (await page.evaluate(() => window.__dbg.invUi.page)) === 'attacks');
  check('every word is there to be set', (await hands.marks()).filter((m) => m.startsWith('word:')).length === Object.keys(s.words).length);
  await snap('inventory');
  await hands.key('Escape');
  // leave through the menu
  await hands.key('Escape');
  await page.waitForTimeout(150);
  await snap('pause');
  await hands.press('button:Leave');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ save: localStorage.getItem('arpg.save'), game: !!window.__dbg.game() }));
  check('back at the title', !after.game);
  check('the saved run is untouched', after.save === before, before ? `${before.length} bytes` : 'no save');
  await snap('title_after');
  const missing = await page.evaluate(() => window.__dbg.missing());
  check('every character asked for can be drawn', missing.length === 0, missing.join(' '));
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
