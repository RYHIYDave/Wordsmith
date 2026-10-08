// Uses every service in town the way a player would (mouse, or fingers with --touch), checks the
// result of each, and photographs each.
//
// Since Version 14.3 a service has half the screen and the inventory the other (the owner, 5 Oct
// 2026: "Vendors, stash, and lexicon would take up the left side so you would have access to
// your inventory on the right side"). So everything here goes between the two halves: a piece
// in the bag is pressed and its card has the service's button (SELL, STASH); a piece of the
// service's is pressed and its card has BUY or TAKE; either may be carried across instead; a
// word is pressed among YOUR WORDS and goes to the Lexicon (KEEP, on its card) or onto the gate
// (the gate's socket, the card's button, or dragged there).
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => { window.__dbg.run('warrior', 31); });
  await page.waitForTimeout(300);
  const hands = await makeHands(page);
  const bad = (msg) => console.log('  !! ' + msg);
  const check = (what, ok, detail = '') => console.log(`  ${ok ? 'ok' : '!!'} ${what}${detail ? '   (' + detail + ')' : ''}`);
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const m = g.meta;
    const count = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    return { town: g.level.town, panel: d.panels.open, hint: g.interactHint(), gold: h.gold, bag: h.bag.filter(Boolean).length, stash: m.stash.filter(Boolean).length,
      carried: count(h.words), lex: count(m.lexicon), keepCost: g.keepCost(), plan: g.plan, dungeonWords: g.dungeonWords, shop: g.shop.filter(Boolean).length, depth: g.depth,
      weapon: h.gear.mainhand ? { name: h.gear.mainhand.name, imbues: h.gear.mainhand.imbues, rarity: h.gear.mainhand.rarity } : null, str: h.d.str,
      worn: Object.values(h.gear).filter(Boolean).length, note: d.invUi.noteT > 0 ? d.invUi.note : '', page: d.invUi.page, hand: d.invUi.word };
  });
  const standAt = (kind) => page.evaluate((k) => {
    const g = window.__dbg.game(); const s = g.level.stations.find((x) => x.kind === k); const f = g.level.floor;
    if (!s) return -1;
    let best = null; let bd = 1e9;
    for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
      if (g.level.walk[ty * f.w + tx] !== 1) continue;
      // prefer standing below the thing on screen, as a player would
      const d = Math.hypot(tx + 0.5 - (s.x + 0.6), ty + 0.5 - (s.y + 0.6));
      if (d < bd) { bd = d; best = { x: tx + 0.5, y: ty + 0.5 }; }
    }
    g.hero.x = best.x; g.hero.y = best.y;
    return +bd.toFixed(2);
  }, kind);
  const open = async (kind) => {
    await standAt(kind);
    await page.waitForTimeout(200);
    let s = await st();
    const prompt = hands.touch ? `button:${s.hint}` : `button:${s.hint} (E)`;
    if (hands.touch) await hands.press(prompt); else await hands.key('KeyE');
    await page.waitForTimeout(250);
    s = await st();
    log(`at the ${kind}: prompt "${prompt.slice(7)}" opens`, s.panel);
    return s;
  };
  /** The two halves of the screen while a service is open: the service's, and the inventory's. */
  const halves = async (kind) => {
    const side = await hands.mark('side'); const inv = await hands.mark('inventory');
    const scr = await page.evaluate(() => ({ w: window.__dbg.ui.w, h: window.__dbg.ui.h }));
    if (!side || !inv) { bad(`at the ${kind} the screen should be in two halves: the service's and the inventory's`); return null; }
    const upright = scr.h > scr.w;
    const sideR = { x: side.x - side.w / 2, y: side.y - side.h / 2, w: side.w, h: side.h };
    const invR = { x: inv.x - inv.w / 2, y: inv.y - inv.h / 2, w: inv.w, h: inv.h };
    check(`the ${kind} has the ${upright ? 'top' : 'left'} of the screen and the inventory the ${upright ? 'bottom' : 'right'}`,
      upright ? sideR.y === 0 && invR.y === sideR.h && invR.y + invR.h === scr.h : sideR.x === 0 && invR.x === sideR.w && invR.x + invR.w === scr.w, `${JSON.stringify(sideR)} ${JSON.stringify(invR)}`);
    // everything the service draws for pressing lies in its own half, and the inventory's in its
    const names = await page.evaluate(() => [...window.__dbg.ui.marks.entries()].map(([k, r]) => ({ k, ...r })));
    const inR = (m, r) => m.x >= r.x - 0.5 && m.y >= r.y - 0.5 && m.x + m.w <= r.x + r.w + 0.5 && m.y + m.h <= r.y + r.h + 0.5;
    const theirs = names.filter((m) => /^(shop|sold|stash|plan|lex|kept):/.test(m.k) || m.k.startsWith('button:ENTER'));
    const ours = names.filter((m) => /^(bag|gear|word|tab|socket):/.test(m.k) || m.k === 'button:DONE');
    const out1 = theirs.filter((m) => !inR(m, sideR)).map((m) => m.k);
    const out2 = ours.filter((m) => !inR(m, invR)).map((m) => m.k);
    check(`what is the ${kind}'s lies in its half, and the inventory's in its own`, theirs.length > 0 && ours.length > 0 && !out1.length && !out2.length, `${theirs.length} and ${ours.length} things${out1.length + out2.length ? '; outside: ' + [...out1, ...out2].join(' ') : ''}`);
    check('the game\'s own buttons are not drawn under them', !names.some((m) => m.k.startsWith('skill:') || m.k === 'potion' || m.k === 'minimap' || m.k.startsWith('button:INVENTORY')));
    // (Nothing of the town is seen under a service, so the picture is not moved as it is for the
    // inventory alone: when the service closes the town is where it was, and is not seen sliding
    // back into the middle.)
    // (Whatever was open before may still be gliding shut under this one: it is let stand first.)
    await hands.settle();
    const hero = await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); });
    check('under them the town has not moved: the hero is still in the middle of the whole screen', Math.abs(hero.x - scr.w / 2) <= 1, `at ${hero.x} of ${scr.w}`);
    return { sideR, invR };
  };
  /** The first cell of the bag that has something in it. */
  const firstInBag = () => page.evaluate(() => window.__dbg.game().hero.bag.findIndex(Boolean));
  /** A card is being read, with these buttons (by the start of their labels) and no others. */
  // (COMPARE is on the card of every piece that is not worn, since 5 Oct 2026: tools/scenarios/pages.mjs, 3b, presses it)
  const cardHas = async (what, wanted) => {
    const names = (await hands.marks()).filter((m) => m.startsWith('button:') && !/^button:(DONE|GEAR|ATTACKS|STATS|ENTER|TAKE IT OUT)/.test(m)).map((m) => m.slice(7));
    const card = await hands.mark('card');
    check(what, !!card && names.length === wanted.length && wanted.every((w) => names.some((n) => n.startsWith(w))), names.join(' | ') || 'no buttons');
  };

  // things to work with
  await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    h.gold = 400; h.words.power = 2; h.words.fire = 2; h.words.swift = 1; h.words.twin = 1; h.words.volatile = 1;
    // (a word that is carried has been found: the Lexicon has a page for it; and two of them have been tried)
    for (const w of ['power', 'fire', 'swift', 'twin', 'volatile']) g.meta.known[w].found = true;
    Object.assign(g.meta.known.fire, { front: true, behind: true, gear: true, dungeon: true });
    Object.assign(g.meta.known.power, { front: true, gear: true });
    // some gear in the bag: buy four things in the shop for free
    for (let i = 2; i < 6; i++) { h.gold += 9999; g.buy(i); h.gold -= 9999; }
    // (keeping a word in the Lexicon costs gold: that much more is handed over)
    h.gold = 400 + g.keepCost();
    g.refresh();
  });
  await page.waitForTimeout(200);
  await snap('hall');

  // ---- Lexicon: a spare word is kept for gold, and taken out again for nothing ----
  let s = await open('lexicon');
  if (s.panel !== 'lexicon') bad(`the Lexicon stand should open the Lexicon: open is ${s.panel}`);
  await snap('lexicon');
  await halves('Lexicon');
  const before = s;
  await hands.press('lex:fire');
  await page.waitForTimeout(150);
  await snap('lexicon_word_read');
  // one of the words the hero carries, pressed on the inventory's side: its card offers to keep it
  await hands.press('word:power');
  await page.waitForTimeout(200);
  await snap('lexicon_card');
  s = await st();
  check('a word pressed among YOUR WORDS is in hand, and its page is the one the Lexicon has open', s.hand === 'power' && (await page.evaluate(() => window.__dbg.lexUi.sel)) === 'power');
  await cardHas('its card offers to keep it, for the price', ['KEEP']);
  const keep = await hands.press('button:KEEP');
  s = await st();
  log(`pressed "${keep}": carried / in Lexicon / gold`, `${s.carried} / ${s.lex} / ${before.gold} -> ${s.gold}`);
  if (!(s.lex === before.lex + 1 && s.carried === before.carried - 1 && s.gold === before.gold - before.keepCost)) bad(`keeping a word should move one into the Lexicon for ${before.keepCost} gold`);
  log('the next one costs', `${s.keepCost} (it doubles)`);
  if (s.keepCost !== before.keepCost * 2) bad('the cost of keeping a word should double each time');
  // (without the gold for another, the button is dead)
  const purse = s.gold;
  await page.evaluate(() => { window.__dbg.game().hero.gold = 10; });
  await page.waitForTimeout(150);
  await hands.press('button:KEEP');
  s = await st();
  check('and without the gold for the next, KEEP does nothing', s.lex === before.lex + 1 && s.gold === 10, `${s.gold} gold, the next costs ${s.keepCost}`);
  await page.evaluate((n) => { window.__dbg.game().hero.gold = n; }, purse);
  await hands.press('kept:power');
  await page.waitForTimeout(150);
  await snap('lexicon_take_asked');
  await hands.press('button:TAKE IT OUT');
  s = await st();
  log('taken out again: carried / in Lexicon', `${s.carried} / ${s.lex}`);
  if (!(s.lex === before.lex && s.carried === before.carried)) bad('taking a word out should bring it back to the spare words');
  await hands.press('button:DONE');
  s = await st();
  if (s.panel !== 'none') bad('DONE should close the Lexicon');

  // ---- stash ----
  s = await open('stash');
  if (s.panel !== 'stash') bad(`the stash should open the stash: open is ${s.panel}`);
  await snap('stash');
  const sh = await halves('stash');
  const bag0 = s.bag; const stash0 = s.stash;
  await hands.press('bag:0');
  await page.waitForTimeout(200);
  await snap('stash_card');
  await cardHas('a piece in the bag, pressed at the stash: its card offers STASH, EQUIP and COMPARE', ['STASH', 'EQUIP', 'COMPARE']);
  await hands.press('button:STASH');
  s = await st();
  log('put one item away: bag / stash', `${s.bag} / ${s.stash}`);
  check('STASH puts it away', s.bag === bag0 - 1 && s.stash === stash0 + 1);
  await hands.press('stash:0');
  await page.waitForTimeout(200);
  await snap('stash_piece_read');
  await cardHas('a piece in the stash, pressed: its card offers TAKE, and COMPARE', ['TAKE', 'COMPARE']);
  await hands.press('button:TAKE');
  s = await st();
  check('TAKE brings it back to the bag', s.bag === bag0 && s.stash === stash0, `${s.bag} / ${s.stash}`);
  // pressed twice: it goes across
  await hands.press('bag:0');
  await hands.press('bag:0');
  s = await st();
  check('a piece in the bag pressed twice goes into the stash', s.bag === bag0 - 1 && s.stash === stash0 + 1, `${s.bag} / ${s.stash}`);
  await hands.press('stash:0');
  await hands.press('stash:0');
  s = await st();
  check('and a piece in the stash pressed twice comes out', s.bag === bag0 && s.stash === stash0, `${s.bag} / ${s.stash}`);
  if (!hands.touch) {
    await hands.press('bag:0', 2);
    s = await st();
    check('the right button on a piece in the bag puts it away', s.bag === bag0 - 1 && s.stash === stash0 + 1, `${s.bag} / ${s.stash}`);
    await hands.press('stash:0', 2);
    s = await st();
    check('and on a piece in the stash takes it out', s.bag === bag0 && s.stash === stash0, `${s.bag} / ${s.stash}`);
  }
  // carried across, both ways
  if (sh) {
    let a = await hands.mark(`bag:${await firstInBag()}`);
    await hands.dragStart(a.x, a.y, sh.sideR.x + sh.sideR.w / 2, sh.sideR.y + sh.sideR.h * 0.7);
    await page.waitForTimeout(150);
    await snap('stash_carried_over');
    await hands.dragEnd();
    s = await st();
    check('a piece carried from the bag over to the stash\'s half and let go is put away', s.bag === bag0 - 1 && s.stash === stash0 + 1, `${s.bag} / ${s.stash}`);
    a = await hands.mark('stash:0');
    const b = await hands.mark('bag:5');
    await hands.dragAt(a.x, a.y, b.x, b.y);
    s = await st();
    check('and one carried from the stash over to the inventory comes out', s.bag === bag0 && s.stash === stash0, `${s.bag} / ${s.stash}`);
  }
  await hands.press('button:DONE');

  // ---- the armourer: one of the two vendors (Version 14.4), who deals in arms and armour ----
  /** Whose shelf the vendor's screen is showing, and what kinds of thing are on it. */
  const shelf = () => page.evaluate(() => { const g = window.__dbg.game(); return { vendor: g.vendor, kinds: g.shop.filter(Boolean).map((it) => it.weapon || it.offhand || it.slot), sold: g.sold.length }; });
  s = await open('armourer');
  if (s.panel !== 'vendor') bad(`the armourer should open a vendor's screen: open is ${s.panel}`);
  await snap('vendor');
  const vh = await halves('armourer');
  let on = await shelf();
  const MARTIAL = ['sword', 'greatsword', 'bow', 'shield', 'quiver', 'helm', 'chest', 'gloves', 'belt', 'boots'];
  check('it is the armourer\'s shelf: swords, two-handed swords, bows, shields, quivers and armour', on.vendor === 'armourer' && on.kinds.length > 0 && on.kinds.every((k) => MARTIAL.includes(k)), on.kinds.join(' '));
  const gold0 = s.gold;
  await hands.press('shop:0');
  await page.waitForTimeout(200);
  await snap('vendor_card');
  await cardHas('a piece for sale, pressed: its card offers BUY and the price, and COMPARE', ['BUY', 'COMPARE']);
  const bought = await hands.press('button:BUY');
  s = await st();
  log(`pressed "${bought}"`, `gold ${gold0} -> ${s.gold}, bag ${s.bag}, shop ${s.shop}`);
  check('it is bought: the gold is paid and it is in the bag', !!bought && s.gold === gold0 - Number(bought.split(' ').pop()) && s.bag === bag0 + 1, `bag ${s.bag}`);
  const gold1 = s.gold;
  await hands.press('bag:1');
  await page.waitForTimeout(200);
  await snap('vendor_bag_card');
  await cardHas('a piece in the bag, pressed at the vendor: its card offers SELL with the price, EQUIP and COMPARE', ['SELL', 'EQUIP', 'COMPARE']);
  const sold = await hands.press('button:SELL');
  s = await st();
  log(`pressed "${sold}"`, `gold ${gold1} -> ${s.gold}, bag ${s.bag}`);
  check('it is sold for what the button said', !!sold && s.gold === gold1 + Number(sold.split(' ').pop()) && s.bag === bag0, `bag ${s.bag}`);
  // what was sold lies with the vendor for the rest of the visit, and can be had back for the same
  const gold1b = s.gold;
  await hands.press('sold:0');
  await page.waitForTimeout(200);
  await snap('vendor_sold_card');
  await cardHas('what was sold lies on the vendor\'s second shelf, and its card offers to buy it back, and COMPARE', ['BUY BACK', 'COMPARE']);
  const back = await hands.press('button:BUY BACK');
  s = await st();
  check('it comes back for what was paid for it', !!back && s.gold === gold1 && s.bag === bag0 + 1, `gold ${gold1b} -> ${s.gold}, bag ${s.bag}`);
  // EQUIP still wears a piece, here as anywhere (a piece of armour: what is held in a hand may put down what the other hand holds)
  const worn0 = s.worn;
  const wearable = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return h.bag.findIndex((it) => it && it.slot !== 'mainhand' && it.slot !== 'offhand' && g.useProblem(it) === null && !h.gear[g.slotFor(it)]); });
  if (wearable >= 0) {
    await hands.press(`bag:${wearable}`);
    await hands.press('button:EQUIP');
    s = await st();
    check('EQUIP on that card still puts a piece on', s.worn === worn0 + 1, `worn ${worn0} -> ${s.worn}`);
  }
  // carried across, both ways
  if (vh) {
    s = await st();
    const g2 = s.gold; const b2 = s.bag;
    let a = await hands.mark(`bag:${await firstInBag()}`);
    await hands.dragStart(a.x, a.y, vh.sideR.x + vh.sideR.w / 2, vh.sideR.y + vh.sideR.h * 0.7);
    await page.waitForTimeout(150);
    await snap('vendor_carried_over');
    await hands.dragEnd();
    s = await st();
    check('a piece carried from the bag over to the vendor\'s half and let go is sold', s.bag === b2 - 1 && s.gold > g2, `bag ${b2} -> ${s.bag}, gold ${g2} -> ${s.gold}`);
    await page.evaluate(() => { window.__dbg.game().hero.gold += 5000; });
    const g3 = (await st()).gold;
    const free = await page.evaluate(() => window.__dbg.game().shop.findIndex(Boolean));
    a = await hands.mark(`shop:${free}`);
    const b = await hands.mark('bag:9');
    await hands.dragAt(a.x, a.y, b.x, b.y);
    s = await st();
    check('and one carried from the vendor over to the inventory is bought', s.bag === b2 && s.gold < g3, `bag ${s.bag}, gold ${g3} -> ${s.gold}`);
  }
  on = await shelf();
  const soldThere = on.sold;
  await hands.press('button:DONE');
  s = await st();
  if (s.panel !== 'none') bad('DONE should close the vendor');

  // ---- the mystic: the other vendor, with a shelf of his own; his service is used from his table of wares ----
  s = await open('mystic');
  if (s.panel !== 'vendor') bad(`the mystic should open a vendor's screen: open is ${s.panel}`);
  await snap('mystic');
  await halves('mystic');
  on = await shelf();
  const MAGICAL = ['staff', 'wand', 'focus', 'ring', 'amulet'];
  check('it is the mystic\'s shelf: staffs, wands, focuses, rings and amulets', on.vendor === 'mystic' && on.kinds.length > 0 && on.kinds.every((k) => MAGICAL.includes(k)), on.kinds.join(' '));
  check('what was sold to the armourer can be had back here too: it is the one shelf', on.sold === soldThere && (soldThere === 0 || !!(await hands.mark('sold:0'))), `${on.sold} sold, ${soldThere} at the armourer's`);
  await page.evaluate(() => { const h = window.__dbg.game().hero; h.gold += 5000; if (!h.bag.includes(null)) h.bag[h.bag.length - 1] = null; });
  s = await st();
  const mg = s.gold; const mb = s.bag;
  await hands.press('shop:0');
  await page.waitForTimeout(200);
  await snap('mystic_card');
  await cardHas('a piece of his, pressed: its card offers BUY and the price, and COMPARE', ['BUY', 'COMPARE']);
  const got = await hands.press('button:BUY');
  s = await st();
  const mine = await page.evaluate(() => { const g = window.__dbg.game(); return { staff: g.hero.bag.some((it) => it && it.weapon === 'staff'), gap: g.shops.mystic[0] === null, other: g.shops.armourer.filter(Boolean).length }; });
  check('his plain staff is bought: from his shelf, not the armourer\'s', !!got && s.gold === mg - Number(got.split(' ').pop()) && s.bag === mb + 1 && mine.staff && mine.gap, `gold ${mg} -> ${s.gold}, bag ${mb} -> ${s.bag}`);
  await hands.press('button:DONE');
  s = await st();
  if (s.panel !== 'none') bad('DONE should close the mystic\'s screen');

  // ---- wordsmith: it opens the inventory (with his trade in words in the other half, once the trades are open); a word carried onto a piece of gear is burned into it ----
  const trades = await page.evaluate(() => window.__dbg.game().level.stations.some((q) => q.kind === 'stranger'));
  s = await open('wordsmith');
  if (s.panel !== (trades ? 'wordsmith' : 'inv')) bad(`the wordsmith should open ${trades ? 'his own screen' : 'the inventory'}: open is ${s.panel}`);
  await snap('wordsmith');
  if (trades) {
    // his trade: a word of his is read and bought with its button; a spare word is sold from its card, and bought back
    const shelf = () => page.evaluate(() => { const g = window.__dbg.game(); return { stock: g.wordStock.slice(), sold: g.wordsSold.slice(), gold: g.hero.gold, price: g.wordPrice(), pays: g.wordSellValue(), words: { ...g.hero.words } }; });
    let w0 = await shelf();
    check('his shelf has three words, all different', w0.stock.length === 3 && new Set(w0.stock).size === 3 && w0.stock.every(Boolean), w0.stock.join(' '));
    await hands.press('word:0');
    await page.waitForTimeout(200);
    await snap('wordsmith_word');
    const buy = `button:BUY: ${w0.price} GOLD`;
    check('a word of his, pressed: its button says BUY and the price', !!(await hands.mark(buy)), buy);
    await hands.press(buy);
    await page.waitForTimeout(200);
    let w1 = await shelf();
    check('bought: the gold is paid, the word is a spare one, its place is empty', w1.gold === w0.gold - w0.price && w1.stock[0] === null && w1.words[w0.stock[0]] === w0.words[w0.stock[0]] + 1, `gold ${w0.gold} -> ${w1.gold}, ${w0.stock[0]} ${w0.words[w0.stock[0]]} -> ${w1.words[w0.stock[0]]}`);
    // (a spare word of the hero's: pressed, its card offers SELL)
    const mine = `word:${w0.stock[0]}`;
    if (await hands.mark(mine)) {
      await hands.press(mine);
      await page.waitForTimeout(200);
      await snap('wordsmith_sell');
      const sell = `button:SELL: ${w1.pays} GOLD`;
      check('a spare word, pressed: its card offers SELL and what he pays', !!(await hands.mark(sell)), sell);
      await hands.press(sell);
      await page.waitForTimeout(200);
      const w2 = await shelf();
      check('sold: he pays, and keeps it to be bought back', w2.gold === w1.gold + w1.pays && w2.sold.length === 1 && w2.sold[0] === w0.stock[0], `gold ${w1.gold} -> ${w2.gold}, he holds ${w2.sold.join(' ')}`);
      await hands.press('wsold:0');
      await page.waitForTimeout(200);
      const back = `button:BUY BACK: ${w1.pays} GOLD`;
      check('the word he was sold, pressed: BUY BACK for the same', !!(await hands.mark(back)), back);
      await hands.press(back);
      await page.waitForTimeout(200);
      const w3 = await shelf();
      check('bought back for what he paid', w3.gold === w1.gold && w3.sold.length === 0 && w3.words[w0.stock[0]] === w1.words[w0.stock[0]], `gold ${w3.gold}`);
    } else bad(`the word just bought (${mine}) is not among the hero's spare words on the screen`);
    // (whatever is picked or in hand is put down, and the hero's words are counted afresh for what follows)
    await hands.key('Escape');
    s = await open('wordsmith');
  }
  const str0 = s.str; const carried0 = s.carried;
  const pw = await hands.mark('word:power'); const gm = await hands.mark('gear:mainhand');
  if (pw && gm) {
    await hands.dragStart(pw.x, pw.y, gm.x, gm.y);
    await page.waitForTimeout(200);
    await snap('wordsmith_over_gear');
    await hands.dragEnd();
    await page.waitForTimeout(200);
  } else bad('no word or weapon to burn one into');
  await snap('wordsmith_choice');
  log('asked before it is burned', String(!!(await hands.mark('button:BURN IT')) && !!(await hands.mark('button:CANCEL'))));
  await hands.press('button:BURN IT');
  await page.waitForTimeout(300);
  s = await st();
  log('burned Power into the weapon', { imbues: s.weapon && s.weapon.imbues, strength: `${str0} -> ${s.str}`, carried: s.carried });
  if (!(s.weapon && s.weapon.imbues.length === 1) || s.carried !== carried0 - 1) bad('burning should use the word up and mark the weapon');
  await snap('wordsmith_done');
  await hands.press('button:DONE');
  s = await st();
  if (s.panel !== 'none') bad('DONE should close the inventory');

  // ---- gate ----
  s = await open('gate');
  if (s.panel !== 'gate') bad(`the gate should open the gate: open is ${s.panel}`);
  await snap('gate');
  const gh = await halves('gate');
  // a word is pressed among YOUR WORDS (it is in hand), and then the gate's socket
  await hands.press('word:fire');
  await page.waitForTimeout(200);
  await snap('gate_word_in_hand');
  await cardHas('a word in hand at the gate: its card offers to lay it there', ['TO THE GATE']);
  await hands.press('plan:0');
  s = await st();
  check('pressed and then the gate\'s socket, it lies on the gate', JSON.stringify(s.plan) === '["fire"]', JSON.stringify(s.plan));
  // or the button on its card
  await hands.press('word:swift');
  await hands.press('button:TO THE GATE');
  s = await st();
  log('laid two words on the gate', s.plan);
  check('or by the button on its card', JSON.stringify(s.plan) === '["fire","swift"]', JSON.stringify(s.plan));
  await hands.press('word:fire');
  await hands.press('plan:2');
  s = await st();
  log('the same word again is refused', `${JSON.stringify(s.plan)} "${s.note}"`);
  check('the same word a second time is refused, and it is said why', s.plan.length === 2 && s.note !== '', s.note);
  await hands.press('plan:1');
  s = await st();
  log('pressing a burning word takes it back', s.plan);
  check('a word on the gate, pressed, comes back', JSON.stringify(s.plan) === '["fire"]', JSON.stringify(s.plan));
  // or dragged there
  const sw = await hands.mark('word:swift');
  if (sw && gh) {
    await hands.dragStart(sw.x, sw.y, gh.sideR.x + gh.sideR.w / 2, gh.sideR.y + gh.sideR.h * 0.5);
    await page.waitForTimeout(200);
    await snap('gate_word_carried_over');
    await hands.dragEnd();
    s = await st();
    check('a word carried over to the gate\'s half and let go lies on the gate', JSON.stringify(s.plan) === '["fire","swift"]', JSON.stringify(s.plan));
  } else bad('no word to carry to the gate');
  await page.waitForTimeout(200);
  await snap('gate_planned');
  await hands.press('button:ENTER DUNGEON');
  await page.waitForTimeout(400);
  s = await st();
  log('entered: in dungeon / burned in', `${!s.town} / ${JSON.stringify(s.dungeonWords)}`);
  if (s.town || s.panel !== 'none') bad('ENTER DUNGEON should go in, with nothing left open');
  await snap('dungeon');
  const carry = await page.evaluate(() => { const g = window.__dbg.game(); return g.monsters.every((m) => m.words.includes('fire') && m.words.includes('swift')); });
  log('every monster carries both words', String(carry));
  if (!carry) bad('the words laid on the gate are not on every monster');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
