// A second look at the screens: a character some way in. The inventory with words and gear (read
// a word, hold it over gear, burn it, swap words on an attack), the Lexicon in town (keep, take),
// the gate, the pause menu and its cooldowns/mana switch, the trap in the air, CONTINUE.
//   node tools/playtest.mjs --scenario tools/scenarios/look2.mjs --out shots/look2
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const hands = await makeHands(page);
  await page.evaluate((cls) => {
    const d = window.__dbg; d.saving(false); d.run(cls, 11); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); const h = g.hero;
    while (h.level < 8) g.gainXp(200);
    const prim = { warrior: 'str', ranger: 'dex', mage: 'int' }[cls];
    while (h.pending > 0) g.chooseAttr(prim);
    for (let i = 0; i < 7 && i < g.shop.length; i++) h.bag[i] = g.shop[i];
    Object.assign(h.words, { fire: 2, swift: 1, power: 1, leech: 1, poison: 1, twin: 1 });
    for (const w of Object.keys(h.words)) if (h.words[w] > 0) g.meta.known[w].found = true;
    h.gold = 900;
    g.refresh();
  }, cls);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(300);
  await snap('01_inventory');
  log('marks', (await hands.marks()).filter((m) => !m.startsWith('bag:') && !m.startsWith('gear:')).join(' '));

  // read a word
  const fire = await hands.mark('word:fire');
  await hands.pressAt(fire.x, fire.y);
  await page.waitForTimeout(200);
  await snap('02_word_read');
  // hold it over a piece of gear: what it could become there
  const bag0 = await hands.mark('bag:0');
  if (hands.touch) await hands.dragStart(fire.x, fire.y, bag0.x, bag0.y);
  else await hands.hoverAt(bag0.x, bag0.y);
  await page.waitForTimeout(250);
  await snap('03_word_over_gear');
  if (hands.touch) await hands.dragEnd();
  else await hands.pressAt(bag0.x, bag0.y);
  await page.waitForTimeout(250);
  await snap('04_burn_asked');
  await hands.press('button:BURN IT');
  await page.waitForTimeout(350);
  await snap('05_burned');
  log('burned', await page.evaluate(() => { const g = window.__dbg.game(); const it = g.hero.bag[0]; return { imbues: it && it.imbues, fire: g.hero.words.fire, known: g.meta.known.fire }; }));

  // set words on the attacks; then one word in another's place (it comes back)
  const put = async (word, slot) => {
    const a = await hands.mark(`word:${word}`); const b = await hands.mark(slot);
    if (!a || !b) { console.log(`  !! cannot put ${word} on ${slot}`); return; }
    await hands.dragAt(a.x, a.y, b.x, b.y);
    await page.waitForTimeout(1350);
  };
  // (the inventory opened on GEAR: the attacks and their word slots are a page of their own since Version 13.1)
  await hands.press('tab:attacks');
  await page.waitForTimeout(200);
  await put('fire', 'socket:0:front:0');
  await put('swift', 'socket:0:front:1');
  await put('leech', 'socket:1:behind:0');
  await snap('06_attacks_worded');
  const pw = await hands.mark('word:power'); const s00 = await hands.mark('socket:0:front:0');
  await hands.dragStart(pw.x, pw.y, s00.x, s00.y);
  await page.waitForTimeout(250);
  await snap('07_over_a_word_that_is_set');
  await hands.dragEnd();
  await page.waitForTimeout(1400);
  await snap('08_swapped');
  log('after the swap', await page.evaluate(() => { const g = window.__dbg.game(); return { names: g.hero.skills.map((k) => k.r.name), words: g.hero.words }; }));
  // a piece of gear, looked at
  const bag1 = await hands.mark('bag:1');
  await hands.pressAt(bag1.x, bag1.y);
  await page.waitForTimeout(250);
  await snap('09_gear_card');
  // (a piece pressed on ATTACKS turns the page to GEAR, where it is read)
  if ((await page.evaluate(() => window.__dbg.invUi.page)) !== 'gear') console.log('  !! a piece pressed on ATTACKS should turn the page to GEAR');
  await hands.press('button:EQUIP');
  await page.waitForTimeout(250);
  await snap('10_gear_worn');
  await hands.press('button:DONE');
  await page.waitForTimeout(300);

  // the Lexicon, in town
  await page.evaluate(() => window.__dbg.open('lexicon'));
  await page.waitForTimeout(300);
  await snap('11_lexicon_town');
  await hands.press('lex:fire');
  await page.waitForTimeout(200);
  await snap('12_lexicon_fire');
  // (a word the hero carries is pressed on the inventory's side: its card offers to keep it)
  await hands.press('word:poison');
  await page.waitForTimeout(200);
  await snap('13_lexicon_keep_asked');
  await hands.press('button:KEEP');
  await page.waitForTimeout(250);
  await snap('14_lexicon_kept');
  await hands.press('kept:poison');
  await page.waitForTimeout(200);
  await snap('15_lexicon_take_asked');
  log('lexicon', await page.evaluate(() => { const d = window.__dbg; const g = d.game(); return { kept: d.meta().lexicon, gold: g.hero.gold, cost: g.keepCost() }; }));
  await hands.press('button:DONE');
  await page.waitForTimeout(250);

  // the gate
  await page.evaluate(() => window.__dbg.open('gate'));
  await page.waitForTimeout(300);
  await snap('16_gate');
  // (a word is pressed among YOUR WORDS, and then the button on its card lays it on the gate)
  const gw = (await hands.marks()).find((m) => m.startsWith('word:'));
  if (gw) {
    await hands.press(gw);
    await page.waitForTimeout(250);
    await snap('17_gate_word_in_hand');
    await hands.press('button:TO THE GATE');
    await page.waitForTimeout(250);
    await snap('17b_gate_word_in');
  }
  log('gate marks', (await hands.marks()).filter((m) => !m.startsWith('skill') && m !== 'potion').join(' '));
  await hands.key('Escape');
  await page.waitForTimeout(250);

  // pause, and the switch between cooldowns and mana
  await hands.press('button:II');
  await page.waitForTimeout(250);
  await snap('18_pause');
  await hands.press('button:ABILITIES');
  await page.waitForTimeout(250);
  await snap('19_pause_mana');
  await hands.key('Escape');
  await page.waitForTimeout(400);
  await snap('20_town_hud_mana');
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(300);
  const bag2 = await hands.mark('bag:2');
  await hands.pressAt(bag2.x, bag2.y);
  await page.waitForTimeout(250);
  await snap('21_inventory_mana');
  await hands.press('button:DONE');
  await page.evaluate(() => window.__dbg.flipLimit());
  await page.waitForTimeout(200);

  // CONTINUE on the starting screen
  await page.evaluate(() => { const d = window.__dbg; d.saving(true); d.save(); d.toTitle(); });
  await page.waitForTimeout(500);
  await snap('22_title_continue');
  await hands.press('button:LEXICON');
  await page.waitForTimeout(250);
  await snap('23_title_lexicon');
  await hands.press('button:x');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* no storage here */ } window.__dbg.saving(false); });
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
