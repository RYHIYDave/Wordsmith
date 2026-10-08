// Every screen, photographed once, for whoever is restyling them (Version 13: the font and the
// menus in the heroes' look). Pictures only: it checks nothing but that the fonts can draw every
// letter asked of them. Not part of tools/regress.sh.
//   node tools/playtest.mjs --scenario tools/scenarios/look13.mjs --out shots/v13/pc
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/look13.mjs --out shots/v13/ph
//   ONLY=inv,town node ...   (a comma list: title, town, inv, shops, pause, fight, map, level, death)
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const want = (k) => only.length === 0 || only.includes(k);
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(400);
  if (want('title')) {
    await snap('01_title');
    await hands.press('button:OPTIONS');
    await page.waitForTimeout(200);
    await snap('02_options');
    await hands.press('button:BACK');
    await page.waitForTimeout(150);
    await hands.press('button:NEW GAME');
    await page.waitForTimeout(1900);
    await snap('03_classes');
    await hands.press('button:BACK');
    await page.waitForTimeout(150);
  }
  // a character some way in, in town
  await page.evaluate((cls) => {
    const d = window.__dbg; d.saving(false); d.run(cls, 11); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); const h = g.hero;
    while (h.level < 8) g.gainXp(200);
    const prim = { warrior: 'str', ranger: 'dex', mage: 'int' }[cls];
    while (h.pending > 0) g.chooseAttr(prim);
    [...g.shops.armourer.slice(3, 10), ...g.shops.mystic.slice(6, 8)].forEach((it, i) => { h.bag[i] = it; });
    Object.assign(h.words, { fire: 2, swift: 1, power: 1, leech: 1, poison: 1, twin: 1, frost: 1, lightning: 3, volatile: 1 });
    for (const w of Object.keys(h.words)) if (h.words[w] > 0) g.meta.known[w].found = true;
    h.gold = 900;
    g.refresh();
  }, cls);
  await page.waitForTimeout(700);
  if (want('town')) await snap('04_town');
  if (want('inv')) {
    // the inventory in its three pages (Version 13.1): GEAR first, as it opens
    await page.evaluate(() => { const g = window.__dbg.game(); g.equipFromBag(2); g.equipFromBag(3); });
    await page.evaluate(() => window.__dbg.inv());
    await page.waitForTimeout(400);
    await snap('05_inv_gear');
    const bag1 = await hands.mark('bag:1');
    if (bag1) {
      await hands.pressAt(bag1.x, bag1.y);
      await page.waitForTimeout(300);
      await snap('05b_inv_gear_piece');
    }
    // a piece of a kind that is already worn: the two are read side by side
    const bag4 = await hands.mark('bag:4');
    if (bag4) {
      await hands.pressAt(bag4.x, bag4.y);
      await page.waitForTimeout(300);
      await snap('05b2_inv_gear_compare');
    }
    const worn = await hands.mark('gear:mainhand');
    if (worn) {
      await hands.pressAt(worn.x, worn.y);
      await page.waitForTimeout(300);
      await snap('05c_inv_gear_worn_piece');
    }
    await hands.press('tab:attacks');
    await page.waitForTimeout(300);
    await snap('06_inv_attacks');
    const fire = await hands.mark('word:fire');
    if (fire) {
      await hands.pressAt(fire.x, fire.y);
      await page.waitForTimeout(250);
      await snap('06b_inv_word_in_hand');
      const s0 = await hands.mark('socket:0:front:0');
      if (s0) {
        await hands.dragStart(fire.x, fire.y, s0.x, s0.y);
        await page.waitForTimeout(300);
        await snap('06c_inv_word_over_slot');
        await hands.dragEnd();
        await page.waitForTimeout(300);
        await snap('06d_inv_word_set');
        await page.waitForTimeout(1200);
      }
      const lg = await hands.mark('word:lightning');
      const s1 = await hands.mark('socket:1:behind:0');
      if (lg && s1) {
        await hands.dragAt(lg.x, lg.y, s1.x, s1.y);
        await page.waitForTimeout(1500);
      }
      const set = await hands.mark('socket:1:behind:0');
      if (set) { await hands.pressAt(set.x, set.y); await page.waitForTimeout(250); }
      await snap('07_inv_attacks_worded');
    }
    await hands.press('tab:stats');
    await page.waitForTimeout(300);
    await snap('08_inv_stats');
    const pw = await hands.mark('word:power');
    const bag0 = await hands.mark('bag:0');
    if (pw && bag0) {
      await hands.dragAt(pw.x, pw.y, bag0.x, bag0.y);
      await page.waitForTimeout(400);
      await snap('09_inv_burn_asked');
      await hands.press('button:CANCEL');
    }
    await hands.press('button:DONE');
    await page.waitForTimeout(300);
  }
  if (want('shops')) {
    for (const [kind, name] of [['lexicon', '10_lexicon'], ['gate', '11_gate'], ['vendor', '12_vendor'], ['stash', '13_stash']]) {
      await page.evaluate((k) => window.__dbg.open(k), kind);
      await page.waitForTimeout(300);
      await snap(name);
      if (kind === 'lexicon') {
        await hands.press('lex:fire');
        await page.waitForTimeout(200);
        await snap('10b_lexicon_word');
      }
      if (kind === 'vendor') {
        const c = (await hands.marks()).find((m) => m.startsWith('shop:') || m.startsWith('sell:') || m.startsWith('buy:'));
        if (c) { await hands.press(c); await page.waitForTimeout(200); await snap('12b_vendor_card'); }
      }
      await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
      await page.waitForTimeout(200);
    }
  }
  if (want('pause')) {
    await hands.press('button:II');
    await page.waitForTimeout(250);
    await snap('14_pause');
    await hands.key('Escape');
    await page.waitForTimeout(300);
  }
  if (want('fight') || want('map') || want('level') || want('death')) {
    await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const f = () => g.level.floor;
      g.enterDungeon();
      let best = null; let bd = 1e9;
      for (const m of g.monsters) { if (m.dead || m.elite || m.boss) continue; const dd = Math.hypot(m.x - h.x, m.y - h.y); if (dd < bd) { bd = dd; best = m; } }
      for (let r = 2.6; r <= 4 && best; r += 0.6) for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
        if (g.level.walk[Math.floor(y) * f().w + Math.floor(x)] === 1 && g.sees(x, y, best.x, best.y)) { h.x = x; h.y = y; return; }
      }
    });
    await page.waitForTimeout(1200);
    if (want('fight')) {
      await page.evaluate(() => { const h = window.__dbg.game().hero; h.life = Math.round(h.d.maxLife * 0.6); });
      await page.waitForTimeout(300);
      await snap('15_fight');
    }
    if (want('map')) {
      await page.evaluate(() => { window.__dbg.panels.open = 'map'; });
      await page.waitForTimeout(400);
      await snap('16_map');
      await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
    }
    if (want('level')) {
      await page.evaluate(() => { const d = window.__dbg; const g = d.game(); g.gainXp(4000); d.panels.open = 'level'; });
      await page.waitForTimeout(700);
      await snap('17_level_up');
      await page.evaluate(() => { const g = window.__dbg.game(); while (g.hero.pending > 0) g.chooseAttr('dex'); window.__dbg.panels.open = 'none'; });
    }
    if (want('death')) {
      await page.evaluate(() => { const g = window.__dbg.game(); g.hurtHero(99999, 'phys', [], null, 'a test'); });
      await page.waitForTimeout(1800);
      await snap('18_death');
    }
  }
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
