// The inventory in pages (Version 13.1), played with a real mouse or real fingers.
//
// The owner, 4 Oct 2026: "The inventory should have a few different pages, stats on one to show
// attributes and defenses. Your attacks and damage info on another, and gear on a third. Your gear
// should be arranged as they would be placed on the character, like Diablo or path of exile. Your
// inventory should be persistent at the bottom as you flip through the different pages".
//
// Checked here: where it opens (GEAR from the INVENTORY button, ATTACKS from an attack); that the
// bag and the words are in the same place on every page and the pages' own things are only on
// their page; that everything lies on the screen and nothing of a page lies on the bottom; gear
// put on by dragging it onto the hero (a ring, onto the finger it is let go over), taken off by
// dragging it to the bag, moved about in the bag, and worn by a second press; a word pressed on
// STATS and a piece pressed on ATTACKS turning the page to where they are read; a word carried
// over a page's name turning to that page; a word burned into a piece that is worn; and a new
// player's first word keeping the page on ATTACKS.
//   node tools/playtest.mjs --scenario tools/scenarios/pages.mjs --out shots/pages
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/pages.mjs --out shots/pages_phone
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const hands = await makeHands(page);
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const u = d.invUi;
    const rects = {};
    for (const [k, r] of d.ui.marks) rects[k] = { x: r.x, y: r.y, w: r.w, h: r.h };
    return {
      open: d.panels.open, page: u.page, word: u.word, sel: u.sel, pending: u.pending, note: u.noteT > 0 ? u.note : '',
      compare: u.compare ? { uid: u.compare.item.uid, n: u.compare.n } : null,
      gear: Object.fromEntries(Object.entries(h.gear).map(([k, v]) => [k, v ? v.uid : 0])),
      bag: h.bag.map((it) => (it ? it.uid : 0)), kinds: h.bag.map((it) => (it ? it.slot : '')),
      words: h.words, names: h.skills.map((s) => s.r.name), W: d.ui.w, H: d.ui.h, rects,
      imbue: h.gear.mainhand && h.gear.mainhand.imbues.length ? h.gear.mainhand.imbues[h.gear.mainhand.imbues.length - 1].word : null,
    };
  });
  const press = async (name) => { const m = await hands.press(name); await page.waitForTimeout(120); return m; };
  const tab = async (p) => { await press(`tab:${p}`); await page.waitForTimeout(120); };
  const drag = async (from, to) => {
    const a = await hands.mark(from); const b = await hands.mark(to);
    if (!a || !b) { bad(`cannot drag ${from} to ${to}: ${!a ? from : to} is not on screen`); return false; }
    await hands.dragAt(a.x, a.y, b.x, b.y);
    await page.waitForTimeout(200);
    return true;
  };

  // ---- a character some way in, with things to wear in the bag --------------------------------------
  await page.evaluate((cls) => {
    const d = window.__dbg; d.saving(false); d.run(cls, 11); d.autoLevel = false; d.autoWords = false;
    // (THE FIRST LEVELS, the game's own since Version 19.5: the wordsmith's ring lit, as it is once the MASTER RUNE-STONE is brought; the level as below)
    d.seasoned(1);
    const g = d.game(); const h = g.hero;
    while (h.level < 8) g.gainXp(200);
    const prim = { warrior: 'str', ranger: 'dex', mage: 'int' }[cls];
    while (h.pending > 0) g.chooseAttr(prim);
    // (things to wear, off the two vendors' shelves: the armourer's rolled pieces, a weapon, an off
    // hand and a piece of armour for each place, and the mystic's two rings)
    [...g.shops.armourer.slice(3, 10), ...g.shops.mystic.slice(6, 8)].forEach((it, i) => { h.bag[i] = it; });
    Object.assign(h.words, { fire: 2, swift: 1, power: 1, leech: 1, poison: 1, twin: 1 });
    for (const w of Object.keys(h.words)) if (h.words[w] > 0) g.meta.known[w].found = true;
    h.gold = 900;
    g.refresh();
  }, cls);
  await page.waitForTimeout(600);
  let s = await st();
  log('screen (game pixels)', `${s.W} x ${s.H}, ${hands.touch ? 'fingers' : 'mouse'}`);
  log('in the bag', s.kinds.filter(Boolean).join(' '));

  // ---- 1. where it opens ------------------------------------------------------------------------------
  await press('button:INVENTORY');
  s = await st();
  check('the INVENTORY button opens it on GEAR', s.open === 'inv' && s.page === 'gear', `${s.open}, ${s.page}`);
  await snap('01_gear');
  const strip = (q) => ['bag:0', 'bag:23'].map((k) => (q.rects[k] ? `${q.rects[k].x},${q.rects[k].y}` : 'none')).join(' ');
  const stripGear = strip(s);
  check('GEAR has a slot for each thing worn', ['mainhand', 'offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring1', 'ring2'].every((k) => s.rects[`gear:${k}`]));
  check('and no word slots', !Object.keys(s.rects).some((k) => k.startsWith('socket:')));
  await press('button:DONE');
  s = await st();
  check('DONE closes it', s.open === 'none', s.open);
  await press('skill:1');
  s = await st();
  check('pressing an attack on the game screen opens it on ATTACKS', s.open === 'inv' && s.page === 'attacks', `${s.open}, ${s.page}`);
  check('ATTACKS has the word slots of all three attacks', [0, 1, 2].every((k) => s.rects[`socket:${k}:front:0`] && s.rects[`socket:${k}:behind:0`]));
  check('and no slots for things worn', !Object.keys(s.rects).some((k) => k.startsWith('gear:')));
  check('the bag is where it was on GEAR', strip(s) === stripGear, `${strip(s)} / ${stripGear}`);
  await snap('02_attacks');
  await press('button:DONE');
  await press('button:INVENTORY');
  s = await st();
  check('and the INVENTORY button opens it on GEAR again', s.page === 'gear', s.page);

  // ---- 2. the pages, and what never moves ---------------------------------------------------------------
  const inScreen = (q) => Object.entries(q.rects).filter(([k]) => /^(tab|gear|bag|word|socket|page):|^button:(DONE|GEAR|ATTACKS|STATS|TALENTS)/.test(k)).filter(([, r]) => r.x < 0 || r.y < 0 || r.x + r.w > q.W || r.y + r.h > q.H).map(([k]) => k);
  const onBottom = (q) => {
    // nothing of a page may lie on the bag or on the words
    const pg = q.rects[`page:${q.page}`];
    const tops = Object.entries(q.rects).filter(([k]) => k.startsWith('bag:') || k.startsWith('word:')).map(([, r]) => r.y);
    const top = Math.min(...tops);
    const own = Object.entries(q.rects).filter(([k]) => k.startsWith('gear:') || k.startsWith('socket:')).filter(([, r]) => r.y + r.h > top).map(([k]) => k);
    return { ok: !!pg && pg.y + pg.h <= top && own.length === 0, top, page: pg ? pg.y + pg.h : -1, own };
  };
  for (const p of ['gear', 'attacks', 'stats']) {
    await tab(p);
    s = await st();
    check(`the name ${p.toUpperCase()} turns to that page`, s.page === p, s.page);
    const out = inScreen(s);
    check('everything on it lies on the screen', out.length === 0, out.join(' '));
    const b = onBottom(s);
    check('and nothing of the page lies on the bag or the words', b.ok, `page ends ${b.page}, bottom begins ${b.top} ${b.own.join(' ')}`);
    check('the bag and the words are where they were', strip(s) === stripGear && Object.keys(s.rects).filter((k) => k.startsWith('word:')).length === 6, strip(s));
  }
  await snap('03_stats');

  // ---- 3. gear: put on by dragging it onto the hero, taken off by dragging it to the bag ----------------
  await tab('gear');
  s = await st();
  const ring = s.kinds.indexOf('ring');
  const ring2 = s.kinds.indexOf('ring', ring + 1);
  if (ring < 0 || ring2 < 0) bad(`this bag should hold two rings: ${s.kinds.join(' ')}`);
  else {
    const uid = s.bag[ring];
    // (let go over the helmet's slot: anywhere on the hero will do, and a ring finds a finger)
    await drag(`bag:${ring}`, 'gear:helm');
    s = await st();
    check('a ring dragged from the bag onto the hero is put on', s.gear.ring1 === uid && s.bag[ring] === 0, `ring1 ${s.gear.ring1}, wanted ${uid}`);
    const uid2 = s.bag[ring2];
    await drag(`bag:${ring2}`, 'gear:ring2');
    s = await st();
    check('a second, let go over the other finger, is put on that finger', s.gear.ring2 === uid2 && s.gear.ring1 === uid, `ring2 ${s.gear.ring2}`);
    await snap('04_rings_on');
    // off again: dragged to an empty cell of the bag, it lies in that cell
    await drag('gear:ring1', 'bag:20');
    s = await st();
    check('a piece dragged from the hero to the bag is taken off, into the cell it was let go over', s.gear.ring1 === 0 && s.bag[20] === uid, `ring1 ${s.gear.ring1}, bag:20 ${s.bag[20]}`);
    // moved about in the bag
    await drag('bag:20', 'bag:23');
    s = await st();
    check('a piece dragged to another cell of the bag is moved there', s.bag[23] === uid && s.bag[20] === 0);
    const first = s.bag[0];
    await drag('bag:23', 'bag:0');
    s = await st();
    check('and onto a cell that is taken, the two change places', s.bag[0] === uid && s.bag[23] === first);
    await drag('bag:0', 'bag:23');
  }
  // pressed twice: worn; and the buttons beside the hero
  s = await st();
  const gloves = s.kinds.indexOf('gloves');
  if (gloves < 0) bad('this bag should hold gloves');
  else {
    const uid = s.bag[gloves];
    await press(`bag:${gloves}`);
    s = await st();
    check('a piece pressed is looked at', !!s.sel && s.sel.kind === 'bag' && s.sel.i === gloves, JSON.stringify(s.sel));
    check('with EQUIP and DROP beside it', !!s.rects['button:EQUIP'] && !!s.rects['button:DROP']);
    await snap('05_piece_read');
    await press(`bag:${gloves}`);
    s = await st();
    check('pressed again, it is worn', s.gear.gloves === uid, `gloves ${s.gear.gloves}`);
    await press('gear:gloves');
    s = await st();
    check('a piece worn, pressed, has TAKE OFF beside it', !!s.rects['button:TAKE OFF']);
    await press('button:TAKE OFF');
    s = await st();
    check('and TAKE OFF takes it off', s.gear.gloves === 0 && s.bag.includes(uid));
    const at = s.bag.indexOf(uid);
    await press(`bag:${at}`);
    await press('button:EQUIP');
    s = await st();
    check('EQUIP puts it on', s.gear.gloves === uid);
  }
  if (!hands.touch) {
    // with a mouse: the right button wears a piece or takes it off, and the pointer over a piece shows its card
    s = await st();
    const uid = s.gear.gloves;
    const m = await hands.mark('gear:gloves');
    await hands.pressAt(m.x, m.y, 2);
    s = await st();
    check('the right button takes a worn piece off', s.gear.gloves === 0 && s.bag.includes(uid));
    const b = await hands.mark(`bag:${s.bag.indexOf(uid)}`);
    await hands.pressAt(b.x, b.y, 2);
    s = await st();
    check('and puts it on from the bag', s.gear.gloves === uid);
    const sw = await hands.mark('bag:0');
    await hands.hoverAt(sw.x, sw.y);
    await snap('05b_hover_card');
  }

  // ---- 3b. COMPARE: the third button on the card of a piece that is not worn ----------------------------
  // The owner, 5 Oct 2026: "add a third option to pieces of gear when you examine them. Compare.
  // And this should bring up your currently equipped piece."
  {
    // a chest worn and another in the bag; a helm in the bag and nothing on the head; a ring on each hand and a third in the bag
    const at = await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      for (let i = 20; i < 26; i++) h.bag[i] = null;
      h.gear.chest = d.item('chest', 1, 6, 31);
      h.gear.helm = null;
      h.gear.ring1 = d.item('ring', 1, 6, 32);
      h.gear.ring2 = d.item('ring', 2, 6, 33);
      h.bag[20] = d.item('chest', 2, 6, 34);
      h.bag[21] = d.item('helm', 1, 6, 35);
      h.bag[22] = d.item('ring', 2, 6, 36);
      g.refresh();
      return { chest: h.bag[20].uid, wornChest: h.gear.chest.uid, ring: h.bag[22].uid };
    });
    await tab('gear');
    const inside = (a, b) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
    const apart = (a, b) => a.x + a.w <= b.x || b.x + b.w <= a.x;
    const same = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
    await press('bag:20');
    s = await st();
    const three = ['EQUIP', 'DROP', 'COMPARE'].map((n) => s.rects[`button:${n}`]);
    const card0 = s.rects.card;
    check('a piece in the bag, read: EQUIP, DROP and COMPARE', three.every(Boolean));
    if (three.every(Boolean)) {
      check('the three are inside its card, side by side', three.every((r) => inside(r, card0)) && apart(three[0], three[1]) && apart(three[1], three[2]), JSON.stringify(three.map((r) => [r.x, r.w])));
    }
    check('the worn piece is not brought up until it is asked for', s.compare === null);
    await press('button:COMPARE');
    s = await st();
    check('COMPARE brings up the piece worn in its place', !!s.compare && s.compare.uid === at.chest && s.compare.n === 0, JSON.stringify(s.compare));
    check('the card grows to hold the two', !!s.rects.card && s.rects.card.w > card0.w, `${card0.w} -> ${s.rects.card && s.rects.card.w}`);
    check('and is on the screen', !!s.rects.card && s.rects.card.x >= 0 && s.rects.card.y >= 0 && s.rects.card.x + s.rects.card.w <= s.W && s.rects.card.y + s.rects.card.h <= s.H, JSON.stringify(s.rects.card));
    check('its three buttons are where they were', ['EQUIP', 'DROP', 'COMPARE'].every((n, i) => same(s.rects[`button:${n}`], three[i])), JSON.stringify(['EQUIP', 'DROP', 'COMPARE'].map((n) => s.rects[`button:${n}`])));
    await snap('05c_compare');
    await press('button:COMPARE');
    s = await st();
    check('COMPARE again puts it away', s.compare === null && same(s.rects.card, card0), JSON.stringify(s.rects.card));
    // read another piece: its card is its own
    await press('button:COMPARE');
    await press('bag:21');
    s = await st();
    check('another piece read: its card is its own again', s.compare === null && !!s.sel && s.sel.i === 21, JSON.stringify(s.compare));
    // nothing on the head: there is nothing to bring up, and it says so
    check('a helm, with nothing on the head: COMPARE is on its card', !!s.rects['button:COMPARE']);
    await press('button:COMPARE');
    s = await st();
    check('and pressed, says there is nothing equipped there', s.compare === null && /Nothing equipped/.test(s.note), `"${s.note}"`);
    // a ring, with a ring on each hand: one, then the other, then put away
    await press('bag:22');
    await press('button:COMPARE');
    s = await st();
    const one = s.compare;
    await press('button:COMPARE');
    s = await st();
    const two = s.compare;
    await snap('05d_compare_ring');
    await press('button:COMPARE');
    s = await st();
    check('a ring, with a ring on each hand: COMPARE brings up one, then the other, then puts them away', !!one && one.n === 0 && !!two && two.n === 1 && one.uid === at.ring && s.compare === null, JSON.stringify([one, two, s.compare]));
    // a piece that is worn has nothing to be compared with
    await press('gear:chest');
    s = await st();
    check('a piece that is worn has TAKE OFF and no COMPARE', !!s.rects['button:TAKE OFF'] && !s.rects['button:COMPARE']);
    // EQUIP while the two are up: the piece goes on, and nothing is left up
    await press('bag:20');
    await press('button:COMPARE');
    await press('button:EQUIP');
    s = await st();
    check('EQUIP with the two up puts the piece on, and the card is put away', s.gear.chest === at.chest && s.compare === null, `chest ${s.gear.chest}, ${JSON.stringify(s.compare)}`);
    await page.evaluate(() => { const d = window.__dbg; d.invUi.sel = null; });
  }

  // ---- 4. a word or a piece pressed on a page that cannot show it turns the page ------------------------
  await tab('stats');
  await press('word:fire');
  s = await st();
  check('a word pressed on STATS turns to ATTACKS, the word in hand', s.page === 'attacks' && s.word === 'fire', `${s.page}, ${s.word}`);
  await press('socket:0:front:0');
  await page.waitForTimeout(1300);
  s = await st();
  check('and a press on a slot sets it', /Flame/.test(s.names[0]), s.names[0]);
  await snap('06_attacks_worded');
  await press('bag:0');
  s = await st();
  check('a piece pressed on ATTACKS turns to GEAR, the piece looked at', s.page === 'gear' && !!s.sel && s.sel.kind === 'bag' && s.sel.i === 0, `${s.page} ${JSON.stringify(s.sel)}`);

  // ---- 5. a word carried over the name of a page turns to it ------------------------------------------------
  {
    const w = await hands.mark('word:power'); const t = await hands.mark('tab:attacks');
    await hands.dragStart(w.x, w.y, t.x, t.y);
    await page.waitForTimeout(700);
    s = await st();
    check('a word held over ATTACKS turns the page to ATTACKS', s.page === 'attacks', s.page);
    const slot = await hands.mark('socket:1:behind:0');
    if (slot) {
      await hands.dragOn(slot.x, slot.y);
      await snap('07_carried_to_attacks');
      await hands.dragEnd();
      await page.waitForTimeout(1300);
      s = await st();
      check('and let go over a slot there, it is set', /of Power/.test(s.names[1]), s.names[1]);
    } else { await hands.dragEnd(); bad('no slot behind the slow attack to carry the word to'); }
  }

  // ---- 6. a word burned into a piece that is worn ---------------------------------------------------------
  await tab('gear');
  await drag('word:leech', 'gear:mainhand');
  s = await st();
  check('a word let go over a worn piece asks before it is burned in', !!s.pending && s.pending.word === 'leech', JSON.stringify(s.pending));
  check('BURN IT and CANCEL are there', !!s.rects['button:BURN IT'] && !!s.rects['button:CANCEL']);
  await snap('08_burn_asked');
  await press('button:BURN IT');
  await page.waitForTimeout(300);
  s = await st();
  check('BURN IT burns it in, and the word is spent', s.imbue === 'leech' && s.words.leech === 0, `${s.imbue}, ${s.words.leech} left`);
  await snap('09_burned');
  await press('button:DONE');

  // ---- 7. a new player's first word: the page stays on ATTACKS ----------------------------------------------
  await page.evaluate((cls) => {
    const d = window.__dbg; d.first(cls, 5);
    const g = d.game(); g.guide.walked = 99; g.guide.quick = g.guide.slow = g.guide.evade = true;
    for (const m of g.monsters) m.dead = true;
    // (THE FIRST LEVELS: a new player's first word comes in town, from the wordsmith, once the MASTER RUNE-STONE has lit his ring)
    if (d.firstLevelsOn()) { g.enterTown(); d.seasoned(1); }
    g.hero.words.poison = 1; g.meta.known.poison.found = true;
    d.inv();
  }, cls);
  await page.waitForTimeout(500);
  s = await st();
  check('with a first word waiting, the inventory is on ATTACKS however it was opened', s.open === 'inv' && s.page === 'attacks', `${s.open}, ${s.page}`);
  await press('tab:gear');
  s = await st();
  check('and the other pages wait until the word is set', s.page === 'attacks' && s.note !== '', `${s.page}: "${s.note}"`);
  await snap('10_first_word');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad(`letters the font cannot draw: ${missing.join(' ')}`);
}
