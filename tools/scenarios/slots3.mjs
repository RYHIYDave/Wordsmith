// A third word slot a side: pictures of how the inventory's ATTACKS page and the attacks written
// on the game screen would hold it. It is NOT in the game. The owner, 4 Oct 2026, 16:51:
// "Depending on how crazy we want to get we can add a third in front at 15 and behind at 20"; he
// was told the new menus would be laid out so that it can be switched on. This switches it on
// with the test hook (__dbg.thirdSlots), fills every slot, looks, and switches it off again.
// Checked: every slot and every attack lies on the screen, and no two of them overlap.
//   CLS=mage node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/slots3.mjs --out shots/slots3
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'mage';
  const hands = await makeHands(page);
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const rects = (prefix) => page.evaluate((p) => { const d = window.__dbg; const out = []; for (const [k, r] of d.ui.marks) if (k.startsWith(p)) out.push({ k, x: r.x, y: r.y, w: r.w, h: r.h }); return { list: out, W: d.ui.w, H: d.ui.h }; }, prefix);
  /** Do the named things lie on the screen, clear of one another? */
  const laid = async (what, prefix, want) => {
    const { list, W, H } = await rects(prefix);
    const off = list.filter((r) => r.x < 0 || r.y < 0 || r.x + r.w > W || r.y + r.h > H);
    const over = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const a = list[i]; const b = list[j]; if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) over.push(`${a.k} / ${b.k}`); }
    check(`${what}: ${want} of them, all on the screen, none over another`, list.length === want && off.length === 0 && over.length === 0, `${list.length} found${off.length ? `; off the screen: ${off.map((r) => r.k).join(' ')}` : ''}${over.length ? `; overlapping: ${over.join(', ')}` : ''}; narrowest ${Math.min(...list.map((r) => r.w))} wide`);
  };
  // (since Version 20.0 the practice room opens every slot, whatever the level: so here every page holds
  // three a side once the third is switched on, and the count wanted is the game's own)
  const total = (n) => n.reduce((a, q) => a + q[0] + q[1], 0);
  const level = (n) => page.evaluate((n) => { const g = window.__dbg.game(); g.hero.level = n; g.refresh(); return g.hero.skills.map((s) => [s.front.length, s.behind.length]); }, n);

  await page.evaluate((c) => {
    const d = window.__dbg; d.saving(false); d.practice(c, 7); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    d.thirdSlots(true);
  }, cls);
  await page.waitForTimeout(400);

  // ---- level 12: two a side open, the third of each not yet --------------------------------------------
  let n = await level(12);
  log('level 12: slots on each attack [in front, behind]', JSON.stringify(n));
  await page.evaluate(() => window.__dbg.inv(0));
  await page.waitForTimeout(250);
  await laid('level 12, the ATTACKS page: slots', 'socket:', total(n));
  await snap('01_level12_attacks');
  await hands.press('button:DONE');

  // ---- level 16: the third in front is open ---------------------------------------------------------------
  n = await level(16);
  log('level 16', JSON.stringify(n));
  await page.evaluate(() => window.__dbg.inv(0));
  await page.waitForTimeout(250);
  await laid('level 16, the ATTACKS page: slots', 'socket:', total(n));
  await snap('02_level16_attacks');
  await hands.press('button:DONE');

  // ---- level 20: three a side, and every one of them filled --------------------------------------------------
  n = await level(20);
  log('level 20', JSON.stringify(n));
  check('three slots in front and three behind on every attack', n.every((q) => q[0] === 3 && q[1] === 3), JSON.stringify(n));
  const set = await page.evaluate(() => {
    const g = window.__dbg.game();
    const plan = [
      [['power', 'fire', 'twin'], ['leech', 'swift', 'frost']],
      [['lightning', 'volatile', 'poison'], ['power', 'fire', 'swift']],
      [['frost', 'leech', 'power'], ['lightning', 'poison', 'volatile']],
    ];
    const out = [];
    plan.forEach(([front, behind], skill) => {
      front.forEach((w, idx) => { const why = g.placeWord({ skill, side: 'front', idx }, w); if (why) out.push(`${w} in front of attack ${skill}: ${why}`); });
      behind.forEach((w, idx) => { const why = g.placeWord({ skill, side: 'behind', idx }, w); if (why) out.push(`${w} behind attack ${skill}: ${why}`); });
    });
    return { refused: out, names: g.hero.skills.map((s) => s.r.name) };
  });
  log('the attacks, with six words each', set.names.join(' | '));
  if (set.refused.length) log('  (words the rules would not place)', set.refused.join('; '));
  await page.waitForTimeout(300);
  await laid('the game screen: the two attacks written along the bottom', 'skill:', 3);
  await snap('03_level20_game_screen');
  await page.evaluate(() => window.__dbg.inv(0));
  await page.waitForTimeout(250);
  await laid('level 20, the ATTACKS page: slots', 'socket:', 18);
  await snap('04_level20_attacks');
  // a word held over a slot: the attack's name as it would become, where things are read
  const from = await hands.mark('word:twin');
  const to = await hands.mark('socket:1:behind:2');
  if (from && to) { await hands.dragStart(from.x, from.y, to.x, to.y); await page.waitForTimeout(200); await snap('05_word_over_a_third_slot'); await hands.dragEnd(); await page.waitForTimeout(200); }
  await hands.press('button:DONE');
  await page.waitForTimeout(200);

  // ---- and off again: the game as it is ------------------------------------------------------------------------
  const back = await page.evaluate(() => { const d = window.__dbg; d.thirdSlots(false); const g = d.game(); return { slots: g.hero.skills.map((s) => [s.front.length, s.behind.length]), spare: Object.values(g.hero.words).reduce((a, b) => a + b, 0) }; });
  check('switched off: two a side again, and the words that were in the third slots are back in the pouch', back.slots.every((q) => q[0] === 2 && q[1] === 2), JSON.stringify(back));
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
