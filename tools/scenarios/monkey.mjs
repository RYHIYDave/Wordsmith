// Presses things at random for a while (the starting screen, the inventory, the Lexicon, town
// services, the world) and checks after every press that nothing has broken: no errors, no negative
// counts, no duplicated items.
//   STEPS=600 SEED=1 node tools/playtest.mjs --scenario tools/scenarios/monkey.mjs --out shots/monkey [--touch ...]
//   GUIDE=1 ...   the same, thrown at a new player's first dungeon (its prompts, the body, the first word)
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const steps = Number(process.env.STEPS || 500);
  let seed = Number(process.env.SEED || 1);
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  // (the class goes by the seed, so the runs in the regression cover all three)
  const cls = ['warrior', 'ranger', 'mage'][seed % 3];
  // GUIDE=1: the first character is a new player's, in the first dungeon with its prompts (and so are
  // most of the ones after it): random input is thrown at the prompts, the body, the first word and
  // the inventory that opens by itself for it
  const guided = !!process.env.GUIDE;
  const begin = (k, sd, g) => page.evaluate(([k, sd, g]) => { const d = window.__dbg; if (g) d.first(k, sd); else d.run(k, sd); }, [k, sd, g]);
  await begin(cls, 99, guided);
  await page.waitForTimeout(200);
  const hands = await makeHands(page);
  const check = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); if (!g) return { ok: true, title: true };
    const h = g.hero; const m = g.meta; const bad = [];
    for (const [w, n] of Object.entries(h.words)) if (!Number.isInteger(n) || n < 0) bad.push(`carried ${w}=${n}`);
    for (const [w, n] of Object.entries(m.lexicon)) if (!Number.isInteger(n) || n < 0) bad.push(`lexicon ${w}=${n}`);
    if (!Number.isFinite(h.gold) || h.gold < 0) bad.push(`gold ${h.gold}`);
    if (h.bag.length !== 24) bad.push(`bag length ${h.bag.length}`);
    if (m.stash.length !== 36) bad.push(`stash length ${m.stash.length}`);
    const ids = new Set();
    for (const it of [...Object.values(h.gear), ...h.bag, ...m.stash, ...g.shop, ...g.drops.map((x) => x.item)]) {
      if (!it) continue;
      if (ids.has(it.uid)) bad.push(`item id ${it.uid} twice (${it.name})`);
      ids.add(it.uid);
    }
    for (const v of [h.x, h.y, h.life, h.mana, h.d.maxLife, h.d.dmgMin, h.d.dmgMax, h.d.aps]) if (!Number.isFinite(v)) bad.push('hero number not finite');
    if (g.plan.length > 3) bad.push(`plan ${g.plan}`);
    // no ability ever holds the same word twice on a side, or two elements on a side, or a word in a place it has not got
    for (const sk of h.skills) for (const grp of [sk.front, sk.behind]) {
      const ws = grp.filter((w) => w);
      if (new Set(ws).size !== ws.length) bad.push(`a word twice on one side: ${ws}`);
      if (ws.filter((w) => ['fire', 'frost', 'lightning'].includes(w)).length > 1) bad.push(`two elements on one side: ${ws}`);
    }
    // the first dungeon's prompts: the step is one the game knows, and a word that was set was set on an attack
    const step = g.guideStep();
    if (![null, 'move', 'fight', 'body', 'take', 'smith', 'use'].includes(step)) bad.push(`an unknown prompt: ${step}`);
    // (0 and 1 the two attacks, 2 the evasive move, which takes words since Version 12.2)
    if (g.guide && g.guide.set && ![0, 1, 2].includes(g.guide.set.skill)) bad.push(`the first word is on attack ${g.guide.set.skill}`);
    if (!g.guide && step) bad.push('a prompt with no prompts running');
    if (['words', 'char', 'bag', 'lesson'].includes(d.panels.open)) bad.push(`a panel that no longer exists is open: ${d.panels.open}`);
    return { ok: bad.length === 0, bad, panel: d.panels.open, town: g.level.town, over: g.over, guide: !!g.guide, searched: g.bodySearched === true, log: d.guideLog.join(' ') };
  });
  const counts = {};
  /** Every kind of thing pressed, by the first part of its name ("socket", "word", "lex", ...; buttons by their label). */
  const kinds = {};
  const pressed = (name) => { const k = name.startsWith('button:') ? name.replace(/[:(]? ?\d.*$/, '').trim() : name.split(':')[0]; kinds[k] = (kinds[k] || 0) + 1; };
  let failures = 0;
  let sawGuide = guided;
  let bodyDone = false;
  let searched = false;
  const prompts = new Set();
  /** (first dungeon) Up to the body: it is searched, its word falls, and in a quiet moment the inventory opens by itself. */
  const toBody = () => page.evaluate(() => {
        const d = window.__dbg; const g = d.game();
        if (!g || g.over || g.level.town || d.panels.open !== 'none') return '';
        const b = g.level.body; const h = g.hero;
        if (!b || b.state !== 0) return '';
        for (const m of g.monsters) if (!m.dead && Math.hypot(m.x - b.x, m.y - b.y) < 12) m.dead = true;
        for (const r of [1.0, 0.8, 1.2]) for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2; const x = b.x + Math.cos(a) * r; const y = b.y + Math.sin(a) * r;
          if (g.free(g.level.walk, x, y, 0.45)) { h.x = x; h.y = y; return 'walk:body'; }
        }
        return '';
      });
  // Three calls are certain, whatever the dice say (each made once, as soon as it can be): the
  // inventory (a word, a socket, a piece of gear, DONE), the Lexicon in town, the starting screen's menu.
  const tap = async (name) => { const m = name ? await hands.mark(name) : null; if (!m) return false; await hands.pressAt(m.x, m.y); pressed(m.name); return true; };
  const listed = async (...starts) => (await hands.marks()).filter((n) => starts.some((p) => n.startsWith(p)));
  /**
   * The same, once the screen has them: a page that has just been turned to is drawn a frame or
   * more later, and with four browsers on two processors that can be later than a press's own
   * wait. (Version 14.5's second regression: the tour below turned to ATTACKS and found no slot
   * listed yet, and in 400 steps the dice pressed none either. Alone, the same run pressed two
   * and three.)
   */
  const listedSoon = async (...starts) => {
    for (let k = 0; k < 30; k++) {
      const l = await listed(...starts);
      if (l.length) return l;
      await page.waitForTimeout(50);
    }
    return [];
  };
  const tours = {
    inv: async () => {
      const ok = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); if (!g || g.over) return false; d.panels.open = 'none'; g.hero.words.swift += 1; d.inv(); return true; });
      if (!ok) return '';
      await page.waitForTimeout(150);
      // (the inventory is three pages since Version 13.1: more often than not this turns to one of them first)
      if (rnd() < 0.7) await tap(pick(await listed('tab:')));
      await tap(pick(await listed('word:')));
      // (the slots are on the ATTACKS page and what is worn on GEAR: the tour turns to each, so
      // that every run presses a slot and a piece whatever the dice say. Until Version 13.2 it
      // pressed whatever the page it happened to be on had, and one run in a dozen met no slot.)
      await tap('tab:attacks');
      if (!(await tap(pick(await listedSoon('socket:'))))) {
        // (said plainly, so that a run that ends without a slot pressed explains itself)
        const seen = await page.evaluate(() => { const d = window.__dbg; return `panel ${d.panels.open}, page ${d.invUi.page}, town ${!!(d.game() && d.game().level.town)}`; });
        console.log(`  (the inventory tour found no slot to press: ${seen}; on the screen: ${(await hands.marks()).slice(0, 14).join(' ')})`);
      }
      await tap('tab:gear');
      await tap(pick(await listedSoon('gear:', 'bag:')));
      if (rnd() < 0.5) await tap(pick(await listed('tab:')));
      await tap(pick(await listed('button:EQUIP', 'button:TAKE OFF', 'button:DROP', 'button:BURN IT', 'button:CANCEL')));
      await tap('button:DONE');
      return 'tour:inventory';
    },
    lex: async () => {
      const ok = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); if (!g || g.over || !g.level.town) return false; d.panels.open = 'none'; d.open('lexicon'); return true; });
      if (!ok) return '';
      await page.waitForTimeout(150);
      await tap(pick(await listed('lex:')));
      // (the words the hero carries are the inventory's, beside the book, since Version 14.3)
      await tap(pick(await listed('word:', 'kept:')));
      await tap(pick(await listed('button:KEEP', 'button:TAKE IT OUT', 'button:DONE')));
      await tap('button:DONE');
      return 'tour:lexicon';
    },
    title: async () => {
      const ok = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); if (!g || g.over || g.practice) return false; d.panels.open = 'none'; d.saving(true); d.save(); d.toTitle(); return true; });
      if (!ok) return '';
      await page.waitForTimeout(150);
      for (const n of ['button:OPTIONS', 'button:BACK', 'button:LEXICON', 'button:x']) await tap(n);
      return 'tour:title';
    },
  };
  const toured = {};
  const due = { inv: 20, lex: 40, title: 60 };
  for (let i = 0; i < steps; i++) {
    const r = rnd();
    let did = '';
    for (const k of Object.keys(tours)) if (!did && !toured[k] && i >= due[k]) { did = await tours[k](); if (did) toured[k] = true; }
    // (a first dungeon is not left before its body has been visited once)
    if (!did && guided && !bodyDone && i >= 10) { did = await toBody(); if (did) bodyDone = true; }
    if (did) {
      // (that was this step)
    } else if (r < 0.03) {
      did = await toBody();
    } else if (r < 0.09) {
      // hand the hero some things to play with
      await page.evaluate((k) => { const g = window.__dbg.game(); if (!g) return; const h = g.hero; const ws = Object.keys(h.words); h.words[ws[k % ws.length]] += 1 + (k % 3); h.gold += 50 * (k % 7); }, Math.floor(rnd() * 1000));
      did = 'gift';
    } else if (r < 0.16) {
      // walk up to a town service (or do nothing in a dungeon)
      const kind = pick(['gate', 'wordsmith', 'armourer', 'mystic', 'lexicon', 'stash']);
      await page.evaluate((k) => { const g = window.__dbg.game(); if (!g || !g.level.town || window.__dbg.panels.open !== 'none') return; const s = g.level.stations.find((x) => x.kind === k); if (!s) return; const f = g.level.floor; let best = null, bd = 1e9;
        for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) { if (g.level.walk[ty * f.w + tx] !== 1) continue; const dd = Math.hypot(tx + 0.5 - s.x, ty + 0.5 - s.y); if (dd < bd) { bd = dd; best = { x: tx + 0.5, y: ty + 0.5 }; } }
        g.hero.x = best.x; g.hero.y = best.y; }, kind);
      did = 'walk:' + kind;
    } else if (r < 0.225) {
      // open a screen the way the game does: the inventory (anywhere), the Lexicon and the other stations (in town)
      const what = pick(['inv', 'inv', 'inv0', 'inv1', 'lexicon', 'lexicon', 'gate', 'armourer', 'mystic', 'stash', 'wordsmith']);
      did = await page.evaluate((w) => {
        const d = window.__dbg; const g = d.game();
        if (!g || g.over) return '';
        // (whatever was open is put away first, as Escape would)
        d.panels.open = 'none';
        if (w.startsWith('inv')) { d.inv(w === 'inv' ? -1 : Number(w.slice(3))); return 'open:inv'; }
        if (!g.level.town) return '';
        d.open(w);
        return 'open:' + w;
      }, what);
    } else if (r < 0.245) {
      // the starting screen, with this character saved (CONTINUE is offered there)
      did = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); if (!g || g.over || g.practice) return ''; d.saving(true); d.save(); d.toTitle(); return 'title:saved'; });
    } else if (r < 0.31 && !hands.touch) {
      const k = pick(['KeyE', 'Tab', 'KeyI', 'Escape', 'KeyL', 'Enter', 'Digit1', 'KeyQ', 'Space', 'KeyW', 'KeyD']);
      await hands.key(k);
      did = 'key:' + k;
    } else if (r < 0.36) {
      // carry something from one named place to another (or to nowhere in particular)
      const names = (await hands.marks()).filter((n) => n.startsWith('word:') || n.startsWith('socket:') || n.startsWith('bag:') || n.startsWith('gear:') || n.startsWith('tab:'));
      if (names.length) {
        // (a word or a socket at one end more often than not: those are the things that are carried)
        const wordy = names.filter((n) => n.startsWith('word:') || n.startsWith('socket:'));
        const a = await hands.mark(pick(wordy.length && rnd() < 0.7 ? wordy : names));
        const size = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
        const b = rnd() < 0.7 ? await hands.mark(pick(names)) : { x: rnd() * size.w, y: rnd() * size.h };
        if (a && b) await hands.dragAt(a.x, a.y, b.x, b.y);
        did = 'drag';
      }
    } else if (r < 0.42) {
      // a press somewhere on the world or the panel background
      const size = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
      await hands.pressAt(rnd() * size.w, rnd() * size.h, !hands.touch && rnd() < 0.3 ? 2 : 0);
      did = 'press:anywhere';
    } else {
      const names = await hands.marks();
      // never end the run or leave the page of interest by accident too often
      const usable = names.filter((n) => (n !== 'button:End run' && n !== 'button:Leave' && n !== 'button:PRACTICE ROOM') || rnd() < 0.05);
      if (usable.length) {
        // (one kind of thing first, then one of that kind: or the twenty-four places in the bag would take most of the presses)
        const groups = {};
        for (const n of usable) { const k = n.startsWith('button:') ? n : n.split(':')[0]; (groups[k] = groups[k] || []).push(n); }
        const n = pick(groups[pick(Object.keys(groups))]);
        // (looked up again at the moment of the press: a screen may have changed since the list was read, and then there is nothing to press)
        const at = await hands.mark(n);
        if (at && at.name === n) { await hands.pressAt(at.x, at.y, !hands.touch && rnd() < 0.25 ? 2 : 0); pressed(n); }
        did = n.replace(/\d+/g, '#').replace(/:.*(for|dungeon).*/, ':$1');
      }
    }
    counts[did.split(':')[0]] = (counts[did.split(':')[0]] || 0) + 1;
    const c = await check();
    if (!c.ok) { failures++; console.log(`  !! after step ${i} (${did}): ${c.bad.join('; ')}`); if (failures > 5) break; }
    if (c.guide) sawGuide = true;
    if (c.searched) searched = true;
    for (const x of (c.log || '').split(' ')) if (x) prompts.add(x);
    // at the starting screen its own menu is pressed for a while (NEW GAME, CONTINUE, LEXICON, OPTIONS, the class cards); now and then a character is simply started
    if (c.title) { if (rnd() < 0.3) { await begin(pick(['warrior', 'ranger', 'mage']), 5, guided && rnd() < 0.7); await page.waitForTimeout(80); } }
    else if (c.over) { if (await hands.mark('button:New run')) await hands.press('button:New run'); }
    else if (!c.town && rnd() < 0.5) { await page.evaluate(() => { const g = window.__dbg.game(); if (g && !g.level.town && !g.over && !g.guide && !g.practice) g.enterTown(); }); }
  }
  const end = await page.evaluate(() => { const d = window.__dbg; return { log: d.guideLog.join(' '), taught: d.meta().taught, missing: d.missing() }; });
  console.log(`monkey: ${steps} steps as ${cls}${guided ? ' (first dungeon)' : ''}, ${failures} broken checks. Presses: ${JSON.stringify(counts)}`);
  console.log(`  pressed, by kind: ${JSON.stringify(kinds)}`);
  console.log(`  the first dungeon's prompts seen: ${[...prompts].join(' ') || '(none)'}; body searched: ${searched}; taught: ${end.taught}`);
  if (end.missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + end.missing.join(' '));
  // a long enough run must have had its hands on the new screens
  if (steps >= 300) {
    const want = { 'a socket': ['socket'], 'a spare word': ['word'], 'gear or the bag': ['gear', 'bag'], 'the starting screen\'s menu': ['button:NEW GAME', 'button:OPTIONS', 'button:LEXICON', 'button:CONTINUE'], 'the inventory\'s DONE': ['button:DONE'] };
    if (!guided) want['the Lexicon'] = ['lex', 'carry', 'kept'];
    for (const [what, ks] of Object.entries(want)) if (!ks.some((k) => kinds[k] > 0)) console.log(`  !! in ${steps} steps the monkey never pressed ${what}`);
    // (a named monster can give up a word before the fallen wordsmith is reached, and the prompts
    // then go straight to the wordsmithing: that is the game working, so it counts as well)
    const wordFirst = end.taught && prompts.has('smith');
    if (guided && !searched && !wordFirst) console.log(`  !! the monkey never searched the body in the first dungeon (prompts seen: ${[...prompts].join(' ')})`);
    if (guided && !searched && wordFirst) console.log('  (the monkey found a word before it found the body, and was shown the wordsmithing from that)');
    if (guided && !sawGuide) console.log('  !! no prompts were ever running');
  }
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); try { localStorage.clear(); } catch (e) { /* no storage here */ } });
  await snap('end');
  if (failures) throw new Error('monkey found broken state');
}
