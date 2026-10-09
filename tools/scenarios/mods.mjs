// Room for four properties on every piece of gear (Version 13.2), played with a real mouse or
// real fingers.
//
// The owner, 4 Oct 2026, 13:25: "All items have room for 4 mods. White starts with 0, blue 1-2,
// yellow 3-4". Read back to him: a white piece takes four words, a blue one two or three, a
// yellow one a single word or none; and two additions he was told he could object to: the colour
// follows the count as a piece is crafted (a white with one word is blue, with three it is
// yellow), and a piece cannot carry the same property twice.
//
// Checked here, by dragging words onto pieces in the inventory and pressing BURN IT: a word is
// added to what a piece has (until this version it took the place of the word before); the colour
// follows; the same word a second time gives the other of its two outcomes, and a third time is
// refused and stays in the pouch; a full piece refuses every word; a yellow piece with three
// properties takes one word; a worn piece takes a word like any other; and a game saved before
// this version, whose pieces held one word each, is carried on with nothing lost.
//   node tools/playtest.mjs --scenario tools/scenarios/mods.mjs --out shots/mods
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/mods.mjs --out shots/mods_phone
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  let hands = await makeHands(page);
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const u = d.invUi;
    const item = (it) => (it ? {
      name: it.name, rarity: it.rarity, affixes: it.affixes.length, words: it.imbues.map((x) => x.word), old: 'imbue' in it,
      stats: [...it.affixes.flatMap((a) => a.mods.map((m) => m.stat)), ...it.imbues.flatMap((x) => x.mods.map((m) => m.stat))],
    } : null);
    return {
      open: d.panels.open, page: u.page, pending: u.pending ? u.pending.word : null, note: u.noteT > 0 ? u.note : '', result: u.result ? u.result.text : null,
      words: { ...h.words }, bag: h.bag.map(item), worn: item(h.gear.mainhand), W: d.ui.w, H: d.ui.h,
    };
  });
  const COLOUR = ['white', 'blue', 'yellow', 'orange'];
  /** Drag a word from the pouch onto a piece. If the game asks, say yes. Returns what happened. */
  const burn = async (word, cell, yes = true) => {
    const a = await hands.mark(`word:${word}`); const b = await hands.mark(cell);
    if (!a || !b) { bad(`cannot drag ${word} onto ${cell}: ${!a ? 'the word' : 'the piece'} is not on screen`); return { asked: false, note: '', s: await st() }; }
    await hands.dragAt(a.x, a.y, b.x, b.y);
    await page.waitForTimeout(220);
    let s = await st();
    const asked = s.pending === word;
    const note = s.note;
    if (asked && yes) { await hands.press('button:BURN IT'); await page.waitForTimeout(300); s = await st(); }
    return { asked, note, s };
  };

  // ---- a character with a white, a blue and two yellow pieces in the bag, and words to spare ----------------
  const made = await page.evaluate((cls) => {
    const d = window.__dbg; d.saving(false); d.run(cls, 11); d.autoLevel = false; d.autoWords = false;
    // (THE FIRST LEVELS, the game's own since Version 19.5: the wordsmith's ring lit, as it is once the MASTER RUNE-STONE is brought; the level as below)
    d.seasoned(1);
    const g = d.game(); const h = g.hero;
    while (h.level < 8) g.gainXp(200);
    while (h.pending > 0) g.chooseAttr('str');
    const pick = (slot, rarity, want) => { for (let seed = 1; seed < 400; seed++) { const it = d.item(slot, rarity, 6, seed); if (want(it)) return it; } return null; };
    h.bag.fill(null);
    h.bag[0] = pick('chest', 0, () => true);
    h.bag[1] = pick('ring', 1, (it) => it.affixes.length === 2);
    h.bag[2] = pick('helm', 2, (it) => it.affixes.length === 4);
    h.bag[3] = pick('gloves', 2, (it) => it.affixes.length === 3);
    h.bag[4] = pick('belt', 1, (it) => it.affixes.length === 1);
    Object.assign(h.words, { power: 3, fire: 2, swift: 2, leech: 2, twin: 1, volatile: 1, frost: 1, poison: 1, lightning: 1 });
    for (const w of Object.keys(h.words)) if (h.words[w] > 0) g.meta.known[w].found = true;
    h.gold = 500;
    g.refresh();
    return h.bag.slice(0, 5).map((it) => (it ? `${it.name} (${it.affixes.length})` : 'none'));
  }, cls);
  await page.waitForTimeout(500);
  log('in the bag (properties each came with)', made.join(', '));
  await hands.press('button:INVENTORY');
  await page.waitForTimeout(200);
  let s = await st();
  log('screen (game pixels)', `${s.W} x ${s.H}, ${hands.touch ? 'fingers' : 'mouse'}`);
  check('the inventory is open on GEAR', s.open === 'inv' && s.page === 'gear', `${s.open}, ${s.page}`);
  check('found as they are, a piece is the colour of its count: white 0, blue 1 or 2, yellow 3 or 4', s.bag.slice(0, 5).every((it) => it && it.rarity === (it.affixes >= 3 ? 2 : it.affixes >= 1 ? 1 : 0)), s.bag.slice(0, 5).map((it) => `${COLOUR[it.rarity]} ${it.affixes}`).join(', '));
  await hands.press('bag:0');
  await page.waitForTimeout(200);
  await snap('01_white_piece_read');

  // ---- 1. a white piece takes four words; its colour follows -----------------------------------------------------
  let r = await burn('power', 'bag:0', false);
  check('a word held over a white piece is asked about before it is burned', r.asked, r.note);
  await snap('02_asked');
  await hands.press('button:BURN IT');
  await page.waitForTimeout(300);
  s = await st();
  check('the first word: one property, and the piece is blue', s.bag[0].words.join() === 'power' && s.bag[0].rarity === 1 && s.words.power === 2, `${s.bag[0].words.join()}; ${COLOUR[s.bag[0].rarity]}; ${s.words.power} POWER left`);
  await snap('03_one_word');
  r = await burn('power', 'bag:0');
  s = r.s;
  check('the same word again is ADDED, as the other of its two outcomes', s.bag[0].words.join() === 'power,power' && new Set(s.bag[0].stats).size === 2 && s.words.power === 1, `${s.bag[0].stats.join(', ')}; still ${COLOUR[s.bag[0].rarity]}`);
  r = await burn('power', 'bag:0');
  s = r.s;
  check('a third time it has nothing new to give: it is refused, and stays in the pouch', !r.asked && r.note === 'It already has what this word gives' && s.words.power === 1 && s.bag[0].words.length === 2, `"${r.note}"; ${s.words.power} POWER left`);
  await snap('04_nothing_new');
  r = await burn('leech', 'bag:0');
  s = r.s;
  check('the third property turns it yellow', s.bag[0].words.length === 3 && s.bag[0].rarity === 2, `${s.bag[0].words.join()}; ${COLOUR[s.bag[0].rarity]}`);
  r = await burn('twin', 'bag:0');
  s = r.s;
  check('the fourth word fills it', s.bag[0].words.length === 4 && s.bag[0].rarity === 2 && new Set(s.bag[0].stats).size === 4, s.bag[0].stats.join(', '));
  r = await burn('fire', 'bag:0');
  s = r.s;
  check('a fifth is refused, and stays in the pouch', !r.asked && r.note === 'That piece is full' && s.bag[0].words.length === 4 && s.words.fire === 2, `"${r.note}"; ${s.words.fire} FLAME left`);
  await snap('05_full_refuses');
  // (the refused word is still in hand: it is put down by pressing it again, and then the piece can be read)
  await hands.press('word:fire');
  await page.waitForTimeout(2600);
  await hands.press('bag:0');
  await page.waitForTimeout(200);
  s = await st();
  await snap('05b_full_piece_read');

  // ---- 2. yellow: four properties take nothing, three take one word ----------------------------------------------
  r = await burn('swift', 'bag:2');
  s = r.s;
  check('a yellow piece with four properties takes no word', !r.asked && r.note === 'That piece is full' && s.bag[2].words.length === 0 && s.words.swift === 2, `"${r.note}"`);
  r = await burn('volatile', 'bag:3');
  s = r.s;
  check('a yellow piece with three takes one', s.bag[3].words.join() === 'volatile' && s.bag[3].rarity === 2 && s.words.volatile === 0, `${s.bag[3].words.join()}; ${s.bag[3].affixes} + ${s.bag[3].words.length} properties`);
  r = await burn('frost', 'bag:3');
  s = r.s;
  check('and then no more', !r.asked && r.note === 'That piece is full' && s.words.frost === 1, `"${r.note}"`);

  // ---- 3. blue: two properties leave room for two words, one for three -------------------------------------------
  let took = 0;
  for (const w of ['frost', 'poison', 'lightning']) { r = await burn(w, 'bag:1'); if (r.asked) took++; }
  s = await st();
  check('a blue piece with two properties takes two words, and the third makes it yellow', took === 2 && s.bag[1].words.length === 2 && s.bag[1].rarity === 2, `${took} taken: ${s.bag[1].words.join()}; ${COLOUR[s.bag[1].rarity]}`);
  took = 0;
  for (const w of ['swift', 'fire', 'leech', 'lightning']) { r = await burn(w, 'bag:4'); if (r.asked) took++; }
  s = await st();
  check('a blue piece with one property takes three', took === 3 && s.bag[4].words.length === 3 && s.bag[4].rarity === 2, `${took} taken: ${s.bag[4].words.join()}; ${COLOUR[s.bag[4].rarity]}`);
  for (let i = 0; i < 5; i++) check(`piece ${i + 1}: no more than four properties, none of them twice`, s.bag[i].stats.length <= 4 && new Set(s.bag[i].stats).size === s.bag[i].stats.length, `${s.bag[i].name}: ${s.bag[i].stats.join(', ')}`);
  await snap('06_all_crafted');

  // ---- 4. a piece that is worn takes a word like any other --------------------------------------------------------
  s = await st();
  const worn0 = s.worn;
  const spare = Object.keys(s.words).find((w) => s.words[w] > 0);
  if (worn0 && spare) {
    r = await burn(spare, 'gear:mainhand');
    s = r.s;
    check('a word burned into the weapon in hand is added to it', r.asked && s.worn.words.length === worn0.words.length + 1 && s.worn.rarity === (worn0.affixes + s.worn.words.length >= 3 ? 2 : 1), `${s.worn.name}: ${s.worn.words.join()}; ${COLOUR[s.worn.rarity]}`);
    await page.waitForTimeout(900);
    await snap('07_weapon_worded');
  } else bad('no word left, or no weapon in hand, to try a worn piece with');

  // ---- 5. the vendor's and the stash's cells show the room too (pictures) ------------------------------------------
  await hands.press('button:DONE');
  await page.waitForTimeout(200);
  await page.evaluate(() => window.__dbg.open('vendor'));
  await page.waitForTimeout(300);
  await snap('08_vendor');
  await page.evaluate(() => { const d = window.__dbg; d.panels.open = 'none'; });
  await page.waitForTimeout(150);

  // ---- 6. a game saved before this version: one word to a piece, in a field of its own -----------------------------
  s = await st();
  const before = { worn: s.worn, chest: s.bag[0] };
  const old = await page.evaluate(() => {
    const d = window.__dbg; d.saving(true); d.save();
    const f = JSON.parse(localStorage.getItem('arpg.save'));
    // as Version 13.1 stored a piece: the one word in `imbue`, no list, and a word did not change a piece's colour
    const w = f.run.gear.mainhand;
    const word = w.imbues[0];
    w.imbue = word; delete w.imbues; w.rarity = 0;
    // (and a piece with no word at all)
    const b = f.run.bag[2]; b.imbue = null; delete b.imbues;
    localStorage.setItem('arpg.save', JSON.stringify(f));
    return { word: word.word, stat: word.mods[0].stat, value: word.mods[0].value };
  });
  await page.reload();
  await page.waitForFunction('window.__ready === true');
  await page.waitForTimeout(300);
  hands = await makeHands(page);
  check('the old save offers CONTINUE', !!(await hands.mark('button:CONTINUE')));
  await hands.press('button:CONTINUE');
  await page.waitForTimeout(500);
  const loaded = await page.evaluate(() => {
    const g = window.__dbg.game(); if (!g) return null;
    const w = g.hero.gear.mainhand; const b = g.hero.bag[2]; const c = g.hero.bag[0];
    return { name: w.name, words: w.imbues.map((x) => `${x.word}:${x.mods[0].stat}:${x.mods[0].value}`), rarity: w.rarity, old: 'imbue' in w, helm: b ? { words: b.imbues.length, old: 'imbue' in b, rarity: b.rarity } : null, chest: c ? c.imbues.map((x) => x.word) : null };
  });
  check('carried on: the weapon still has its word, exactly as it was', !!loaded && loaded.words.join() === `${old.word}:${old.stat}:${old.value}` && !loaded.old, loaded ? `${loaded.name}: ${loaded.words.join()}` : 'no game');
  check('and, having a word, it is blue now', !!loaded && loaded.rarity === 1, loaded ? COLOUR[loaded.rarity] : '');
  check('a piece that had no word is as it was', !!loaded && !!loaded.helm && loaded.helm.words === 0 && !loaded.helm.old && loaded.helm.rarity === 2, loaded ? JSON.stringify(loaded.helm) : '');
  check('a piece crafted in this version came back with all four words', !!loaded && !!loaded.chest && loaded.chest.join() === before.chest.words.join(), loaded && loaded.chest ? loaded.chest.join() : '');
  await hands.press('button:INVENTORY');
  await page.waitForTimeout(250);
  await hands.press('gear:mainhand');
  await page.waitForTimeout(200);
  await snap('09_old_save_carried_on');
  await hands.press('button:DONE');
  // (leave nothing behind for whatever runs next in this browser)
  await page.evaluate(() => { window.__dbg.saving(false); localStorage.removeItem('arpg.save'); });
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
