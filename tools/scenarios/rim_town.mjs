// THE ENDLESS TOWN, THE SHAFT'S RIM (game/rim.ts, render/rim.ts; behind ENDLESS_TOWN, switched on here by the test hook,
// __dbg.endlessTown): played in the browser, its pictures taken.
//   1. a hero beats the last floor built: endless opens, and home is the Shaft's Rim: he stands before its gate, its record
//      stone cut once, its name at the top of the screen, its waypoint awake;
//   2. each service touched where it stands: he walks there (round the pit, between the stones, past the tent's torch) and its
//      panel opens; the wordsmith from the Lexicon's side by the short way, between the standing stones;
//   3. out on the portal's landing and back; with the keys, walked at the pit from every side: never over the drop;
//   4. the gate: a word laid on it shows in its first socket; ENTER takes him down to the endless level he has reached, the
//      word burned into it;
//   5. the waypoint home: on the rim's, no notch cut for a level he had already; a level further on, one more notch;
//   6. the waypoint touched: he walks onto it and it takes him down;
//   7. the switch off: home is the game's own town, as it was.
//   node tools/build_to.mjs dist/rim.html
//   node tools/playtest.mjs --file dist/rim.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/rim_town.mjs --out shots/rim/phone
//   node tools/playtest.mjs --file dist/rim.html --size 960x540 --scenario tools/scenarios/rim_town.mjs --out shots/rim/desk
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  const touch = hands.touch;
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.modes) d.modes.on = true; });
  await page.waitForTimeout(300);
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const R = g.level.rim;
    return { town: !!g.level.town, rim: !!R, panel: d.panels.open, vendor: g.vendor, errand: d.errand(), x: +h.x.toFixed(2), y: +h.y.toFixed(2), endless: g.endless, inEndless: g.inEndless, depth: g.depth, notches: R ? R.notches : -1, fresh: R ? R.fresh : false, words: R ? [...R.words] : [], place: g.level.town ? null : g.floorLevel };
  });
  const waitFor = async (test, ms = 9000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const s = await st();
      if (test(s)) return { s, ms: Date.now() - t0 };
      await page.waitForTimeout(100);
    }
    return { s: await st(), ms: -1 };
  };
  /** (a hero as one who has come this far is: his quests done, nothing asked of him in town) */
  const settled = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    h.ring = true; h.feather = 'given'; h.furnace = 'done'; h.meldAsk = true; h.meld = 'open'; g.questGiven = true; g.speakTo = null;
    h.pending = 0;
    d.fx.messages.length = 0;
  });

  // ---- 1. the last floor beaten: home is the Shaft's Rim ---------------------------------------------------------------
  const opened = await page.evaluate(() => {
    const d = window.__dbg;
    d.run('warrior', 61);
    d.seasoned(30);
    d.autoLevel = false; d.autoWords = false;
    d.endless(true);
    d.endlessTown(true);
    if (d.fanfare) d.fanfare.on = false;
    const g = d.game();
    g.mode = 'normal';
    const last = d.lastFloor();
    g.depth = last; g.cleared = last - 1; g.wayDepth = last;
    g.enterDungeon();
    g.events.length = 0;
    g.takeWay('on');
    const R = g.level.rim;
    return { town: !!g.level.town, rim: !!R, endless: g.endless, notches: R && R.notches, fresh: R && R.fresh, x: g.hero.x, y: g.hero.y, awake: g.level.ways.way.awake, said: g.events.filter((e) => e.t === 'msg').map((e) => e.text), cut: g.events.filter((e) => e.t === 'notch').map((e) => e.n) };
  });
  check('1. the last floor beaten: home is the Shaft\'s Rim, one notch cut', opened.town && opened.rim && opened.endless === 1 && opened.notches === 1 && opened.fresh && opened.awake, JSON.stringify(opened));
  check('1. told of the notch', opened.said.some((t) => /notch is cut in the record stone: Endless 1/.test(t)) && opened.cut.join() === '1', JSON.stringify([opened.said, opened.cut]));
  const view = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  log('view (game pixels), touch', `${view.w}x${view.h}, ${touch}`);
  await page.waitForTimeout(3000);
  await snap('01_home_endless_opens');
  await settled();
  // (a hero a few levels on, for the rest: seven notches)
  await page.evaluate(() => { window.__dbg.endlessTown(true, 7); });
  await settled();
  await page.waitForTimeout(1200);
  if (!touch) await page.mouse.move(4, 4);
  await snap('02_home_before_the_gate');
  const home = await st();
  check('1. seven levels on: seven notches, before the gate', home.rim && home.notches === 7 && Math.hypot(home.x - 8.5, home.y - 8.4) < 0.01, JSON.stringify(home));

  // ---- 2. each service touched where it stands -------------------------------------------------------------------------
  const where = (kind) => page.evaluate((k) => {
    const d = window.__dbg; const g = d.game();
    const s = g.level.stations.find((q) => q.kind === k);
    return s ? d.at(s.x, s.y) : null;
  }, kind);
  const panelOf = (kind) => (kind === 'armourer' || kind === 'mystic' ? 'vendor' : kind);
  const close = async () => {
    const s = await st();
    if (s.panel === 'none') return;
    const shut = (await hands.mark('button:x')) ? 'button:x' : (await hands.mark('button:DONE')) ? 'button:DONE' : null;
    if (!shut || !(await hands.press(shut))) await hands.key('Escape');
    await page.waitForTimeout(150);
    await hands.settle();
  };
  const stations = await page.evaluate(() => window.__dbg.game().level.stations.map((q) => q.kind));
  log('its services', stations.join(', '));
  check('2. its services: the gate and the town\'s six', ['gate', 'armourer', 'mystic', 'wordsmith', 'lexicon', 'stash', 'stranger'].every((k) => stations.includes(k)), stations.join(','));
  // (round the town in an order that takes him past every tight way: the stranger, the stash, the Lexicon, into the ring from
  // their side, on to the bazaar by the front, up past the tent's torch to the smithy, home to the gate)
  let last = await st();
  for (const kind of ['stranger', 'stash', 'lexicon', 'wordsmith', 'mystic', 'armourer', 'gate']) {
    await hands.settle();
    const at = await where(kind);
    if (!at) { check(`2. ${kind}`, false, 'no such service'); continue; }
    // (its picture or its name must be on the screen to be touched: the town is about a screen across)
    const on = at.x > 8 && at.x < view.w - 8 && at.y > 30 && at.y < view.h - 40;
    if (!on) {
      // (not on this screen from here: walked there by the keys' own way, the nearest floor to it)
      await page.evaluate((k) => { const g = window.__dbg.game(); const s = g.level.stations.find((q) => q.kind === k); const h = g.hero; const dx = h.x - s.x; const dy = h.y - s.y; const d = Math.hypot(dx, dy) || 1; h.x = s.x + (dx / d) * 4; h.y = s.y + (dy / d) * 4; g.popOut(h, 0.3, 3); }, kind);
      await page.waitForTimeout(400);
      await hands.settle();
    }
    const at2 = await where(kind);
    // (touched a little up its body, as a finger would; where its body is under the buttons at the foot of the screen, on its name)
    const lift = await page.evaluate((k) => { const d = window.__dbg; const s = d.game().level.stations.find((q) => q.kind === k); return s.lift ?? d.nameLift(k); }, kind);
    const low = at2.y > view.h - 80;
    await hands.pressAt(at2.x, low ? at2.y - lift + 3 : at2.y - (kind === 'gate' ? 30 : kind === 'mystic' ? 6 : 12));
    const from = await st();
    const r = await waitFor((s) => s.panel === panelOf(kind) && (panelOf(kind) !== 'vendor' || s.vendor === kind), 12000);
    const walked = Math.hypot(r.s.x - from.x, r.s.y - from.y);
    check(`2. the ${kind} touched: he walks there, its panel opens`, r.ms >= 0, `after ${r.ms} ms, from (${from.x}, ${from.y}) to (${r.s.x}, ${r.s.y}), ${walked.toFixed(1)} tiles as the crow flies; panel=${r.s.panel} errand=${r.s.errand}`);
    if (kind === 'wordsmith') {
      // (from the Lexicon's side: in between the standing stones, a few tiles, not round the pit)
      check('2. the wordsmith from the Lexicon\'s side: the short way, between the stones', r.ms >= 0 && r.ms < 4500, `${r.ms} ms`);
      await close();
      await snap('03_in_the_ring_from_the_lexicon');
    }
    if (kind === 'gate') await snap('04_at_the_gate_its_panel');
    await close();
    last = r.s;
  }
  void last;

  // ---- 3. the landing; the pit from every side ---------------------------------------------------------------------------
  const brink = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero; const R = g.level.rim;
    const pit = R.rounds[0];
    // (walked at the pit's middle from sixteen places round it, a step at a time, as the keys walk him: where he ends, how far from its middle)
    const out = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + 0.1;
      h.x = pit.x + Math.cos(a) * 5.4; h.y = pit.y + Math.sin(a) * 5.4;
      if (!g.free(g.level.walk, h.x, h.y, 0.3)) continue;
      let least = 99;
      let wrong = 0;
      for (let i = 0; i < 240; i++) {
        const dx = pit.x - h.x; const dy = pit.y - h.y; const d = Math.hypot(dx, dy) || 1;
        // (a little aside of straight at it, so that he is turned along its round)
        const sx = (dx / d) * 0.05 - (dy / d) * 0.02; const sy = (dy / d) * 0.05 + (dx / d) * 0.02;
        const wasX = h.x; const wasY = h.y;
        g.slide(h, 0.3, sx, sy, g.level.walk);
        if (h.x === wasX && h.y === wasY) { const to = window.__dbg.roundStep ? window.__dbg.roundStep(R.rounds, h.x, h.y, 0.3, sx, sy) : null; if (to && g.free(g.level.walk, to.x, to.y, 0.3)) { h.x = to.x; h.y = to.y; } }
        const far = Math.hypot(h.x - pit.x, h.y - pit.y);
        least = Math.min(least, far);
        // (nearer its middle than the brink only out on the tongue and its landing, the one way out over the drop)
        if (far < pit.r - 1e-6 && !window.__dbg.onWayOut(h.x, h.y)) wrong++;
      }
      out.push({ k, least: +least.toFixed(3), wrong });
    }
    return { r: pit.r, out };
  });
  const over = brink.out.filter((q) => q.wrong > 0);
  log('3. walked at the pit from round it', `${brink.out.length} places, the nearest he came ${Math.min(...brink.out.map((q) => q.least))} (the brink ${brink.r.toFixed(2)})`);
  const land = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    // (out along the tongue from the rim to the landing's middle, a step at a time)
    h.x = 7.6; h.y = 12.55;
    const ok0 = g.free(g.level.walk, h.x, h.y, 0.3);
    let moved = 0;
    for (let i = 0; i < 200; i++) {
      const dx = 10.27 - h.x; const dy = 12.24 - h.y; const d = Math.hypot(dx, dy);
      if (d < 0.1) break;
      const wasX = h.x;
      g.slide(h, 0.3, (dx / d) * 0.05, (dy / d) * 0.05, g.level.walk);
      moved += Math.abs(h.x - wasX);
    }
    return { ok0, x: +h.x.toFixed(2), y: +h.y.toFixed(2), moved: +moved.toFixed(2) };
  });
  check('3. out on the portal\'s landing', land.ok0 && Math.hypot(land.x - 10.27, land.y - 12.24) < 0.2, JSON.stringify(land));
  check('3. never over the drop: nearer the pit\'s middle than its brink only on the tongue and its landing', brink.out.length >= 10 && over.length === 0, JSON.stringify(brink.out));
  await page.waitForTimeout(500);
  await hands.settle();
  await snap('05_on_the_landing');

  // ---- 4. the gate: a word laid on it; in at it --------------------------------------------------------------------------
  const laid = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    g.enterTown();
    g.hero.words.power = (g.hero.words.power || 0) + 1;
    const why = g.planWord('power');
    return { why, plan: [...g.plan], words: [...g.level.rim.words], hint: null };
  });
  await settled();
  check('4. a word laid on the gate is in its first socket', laid.why === null && laid.words.length === 1 && laid.words[0] === 'power', JSON.stringify(laid));
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 9.1; g.hero.y = 8.0; });
  await page.waitForTimeout(700);
  const hint = await page.evaluate(() => window.__dbg.game().interactHint());
  check('4. before the gate: its words for the level he has reached', hint === 'Gate: words for Endless 7', String(hint));
  if (!touch) await page.mouse.move(4, 4);
  await snap('06_gate_a_word_in_its_socket');
  if (touch) await hands.press('button:Gate');
  else await hands.key('KeyE');
  const gp = await waitFor((s) => s.panel === 'gate', 3000);
  check('4. the gate\'s panel', gp.ms >= 0, gp.s.panel);
  await page.waitForTimeout(400);
  await snap('07_gate_panel');
  const entered = (await hands.mark('button:ENTER ENDLESS 7')) ? await hands.press('button:ENTER ENDLESS 7') : null;
  const down = await waitFor((s) => !s.town, 6000);
  const burned = await page.evaluate(() => { const g = window.__dbg.game(); return { words: [...g.dungeonWords], plan: [...g.plan] }; });
  check('4. ENTER: down to the endless level he has reached, the word burned into it', !!entered && down.ms >= 0 && down.s.inEndless && down.s.endless === 7 && down.s.place === 'Endless 7' && burned.words.join() === 'power' && burned.plan.length === 0, `${JSON.stringify(down.s)} ${JSON.stringify(burned)}`);
  await page.waitForTimeout(600);

  // ---- 5. the waypoint home -----------------------------------------------------------------------------------------------
  const back = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    g.events.length = 0;
    g.takeWay('warpTown');
    const R = g.level.rim; const w = g.level.ways.way;
    const a = { rim: !!R, notches: R && R.notches, fresh: R && R.fresh, onWay: Math.hypot(g.hero.x - w.x, g.hero.y - w.y) < 0.01, said: g.events.filter((e) => e.t === 'msg').map((e) => e.text) };
    // (a level further on, and home again: one more notch, the newest glowing)
    g.endless = 8; g.endlessFloor = 3;
    g.events.length = 0;
    g.enterTown('way');
    const R2 = g.level.rim;
    const b = { notches: R2.notches, fresh: R2.fresh, reached: R2.reached, said: g.events.filter((e) => e.t === 'msg').map((e) => e.text), save: g.save().rimSeen };
    return { a, b };
  });
  check('5. home by the waypoint: on the rim\'s, no notch for a level he had', back.a.rim && back.a.notches === 7 && !back.a.fresh && back.a.onWay && !back.a.said.some((t) => /notch/.test(t)), JSON.stringify(back.a));
  check('5. a level further on: one more notch, glowing, kept in the save', back.b.notches === 8 && back.b.fresh && back.b.reached === 8 && back.b.said.some((t) => /Endless 8/.test(t)) && back.b.save === 8, JSON.stringify(back.b));
  await settled();
  await page.waitForTimeout(1500);
  if (!touch) await page.mouse.move(4, 4);
  await snap('08_home_by_the_waypoint_a_new_notch');
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 6.9; g.hero.y = 10.3; });
  await page.waitForTimeout(700);
  await snap('09_the_record_stone');

  // ---- 6. the waypoint touched ---------------------------------------------------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 8.5; g.hero.y = 8.4; });
  await page.waitForTimeout(500);
  await hands.settle();
  const wayAt = await page.evaluate(() => { const d = window.__dbg; const w = d.game().level.ways.way; return d.at(w.x, w.y); });
  await hands.pressAt(wayAt.x, wayAt.y - 4);
  const wd = await waitFor((s) => !s.town, 12000);
  check('6. the waypoint touched: he walks onto it, and it takes him down', wd.ms >= 0 && wd.s.inEndless && wd.s.endless === 8, `${wd.ms} ms ${JSON.stringify(wd.s)}`);
  await page.waitForTimeout(500);

  // ---- 7. the switch off: the game's own town ------------------------------------------------------------------------------
  const off = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    d.endlessTown(false);
    g.enterTown();
    return { town: !!g.level.town, rim: !!g.level.rim, stations: g.level.stations.map((q) => q.kind), save: 'rimSeen' in g.save() };
  });
  check('7. the switch off: home is the game\'s own town, nothing of the rim in the save', off.town && !off.rim && !off.save, JSON.stringify(off));
  await page.waitForTimeout(1500);
  await snap('10_switch_off_the_games_own_town');
  log('the Shaft\'s Rim', fails ? `${fails} FAILED` : 'all as it should be');
}
