// The attacks written along the bottom of the game screen, in a fight and out of one (Version 13.2).
//
// A press on one of them opens the inventory at that attack. Until Version 13.2 it did so in the
// middle of a fight as well, and the game waited behind the inventory: a monster standing under
// them could not be attacked, and a thumb that strayed onto them stopped the fight. (Found by
// Version 13.1's regression, where two playtests' own taps did exactly that.) Now, while something
// awake can be seen on the screen, they are not buttons: a press there is an attack like a press
// anywhere else. The INVENTORY button and the keys open the inventory as ever; and the first
// dungeon's prompt can still ask for the press ("Tap STRIKE at the bottom of the screen").
//   CLS=ranger node tools/playtest.mjs --scenario tools/scenarios/plates.mjs --out shots/plates
//   CLS=mage node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/plates.mjs --out shots/plates_phone
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const hands = await makeHands(page);
  const touch = hands.touch;
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    return {
      panel: d.panels.open, page: d.invUi.page, focus: d.invUi.focus, uses: h.skills.map((k) => k.uses), names: h.skills.map((k) => k.r.name),
      mons: g.monsters.filter((m) => !m.dead).map((m) => ({ id: m.id, hurt: Math.round(m.maxLife - m.life), at: d.at(m.x, m.y), seen: m.seen, state: m.state, far: Math.hypot(m.x - h.x, m.y - h.y) })),
      hero: d.at(h.x, h.y), w: d.screen.w, h: d.screen.h, step: g.guideStep ? g.guideStep() : null,
    };
  });
  const until = async (pred, ms = 3000) => { for (let t = 0; t < ms; t += 60) { const s = await st(); if (pred(s)) return s; await page.waitForTimeout(60); } return null; };
  /** Stand a monster so that its body is under a point of the screen. It is awake, stands still, never strikes. Returns its id, or null if there is no floor there. */
  const under = (gx, gy) => page.evaluate(([px, py]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const here = d.at(h.x, h.y);
    const dx = px - here.x; const dy = py + 8 - here.y;
    const x = h.x + (dx / 16 + dy / 8) / 2; const y = h.y + (dy / 8 - dx / 16) / 2;
    if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) return null;
    const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
    g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
    return m.id;
  }, [gx, gy]);
  /**
   * The quick attack on a point: a tap; or, with a mouse, Shift and the left button (attack from
   * where you stand: without Shift the hero first walks toward a monster that is out of reach,
   * the view follows, and the pointer is no longer on it), held until the attack has been made
   * or the inventory has opened.
   */
  const quick = async (gx, gy, ms = 6000) => {
    const was = (await st()).uses[0];
    const done = (q) => q.uses[0] > was || q.panel !== 'none';
    if (touch) { await hands.pressAt(gx, gy); return (await until(done, ms)) ?? (await st()); }
    const c = await hands.client(gx, gy);
    await page.mouse.move(c.x, c.y);
    await page.keyboard.down('ShiftLeft');
    await page.mouse.down();
    const got = await until(done, ms);
    await page.mouse.up();
    await page.keyboard.up('ShiftLeft');
    await page.waitForTimeout(80);
    return got ?? (await st());
  };
  /**
   * Stand a monster on a tile the hero can see, on the screen, between `lo` and `hi` tiles away.
   * Awake, standing still, never striking. Returns { id, far }, or null if there is no such tile.
   */
  const somewhere = (lo, hi) => page.evaluate(([lo, hi]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const L = g.level; const f = L.floor;
    let best = null;
    for (let ty = Math.floor(h.y - hi); ty <= h.y + hi; ty++) {
      for (let tx = Math.floor(h.x - hi); tx <= h.x + hi; tx++) {
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
        const i = ty * f.w + tx;
        if (L.open[i] !== 1 || L.visible[i] !== 1) continue;
        const x = tx + 0.5; const y = ty + 0.5; const far = Math.hypot(x - h.x, y - h.y);
        if (far < lo || far > hi || !g.sees(h.x, h.y, x, y)) continue;
        const at = d.at(x, y);
        if (at.x < 24 || at.x > d.screen.w - 24 || at.y < 40 || at.y > d.screen.h - 6) continue;
        if (!best || far < best.far) best = { x, y, far };
      }
    }
    if (!best) return null;
    const m = g.spawn('skeleton', best.x, best.y, 1, 0, false, g.rng);
    g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
    return { id: m.id, far: best.far };
  }, [lo, hi]);
  /** The slow attack on a point: a right click, or a thumb held there. */
  const hold = async (gx, gy) => {
    const c = await hands.client(gx, gy);
    if (!touch) { await page.mouse.click(c.x, c.y, { button: 'right' }); await page.waitForTimeout(200); return; }
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(c.x), y: Math.round(c.y), id: 5 }] });
    await page.waitForTimeout(520);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(150);
  };

  // ---- a practice room with nothing in it ---------------------------------------------------------------
  await page.evaluate((c) => {
    const d = window.__dbg; d.saving(false); d.practice(c, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, cls);
  await page.waitForTimeout(500);
  let s = await st();
  log('screen (game pixels)', `${s.w} x ${s.h}, ${touch ? 'fingers' : 'mouse'}, ${cls}: ${s.names.join(', ')}`);

  // ---- 1. out of a fight: a press on an attack opens the inventory at that attack ---------------------
  for (const i of [0, 1]) {
    await hands.press(`skill:${i}`);
    s = await until((q) => q.panel === 'inv', 1500) ?? await st();
    check(`with nothing to fight, a press on ${s.names[i]} opens the inventory on ATTACKS, at that attack`, s.panel === 'inv' && s.page === 'attacks' && s.focus === i, `${s.panel}, ${s.page}, attack ${s.focus}`);
    await hands.press('button:DONE');
    await until((q) => q.panel === 'none', 1500);
    await hands.settle();
  }

  // ---- 2. a fight: a monster stands under the quick attack -------------------------------------------------
  const p0 = await hands.mark('skill:0');
  const p1 = await hands.mark('skill:1');
  let id0 = await under(p0.x, p0.y);
  // (a phone held upright in the narrow layout is so tall that the attacks lie twenty tiles down
  // the screen from the hero, past the practice room's wall: there the monster stands nearer, in
  // plain sight, and the press on the attack is still a press in a fight)
  const beneath = id0 !== null;
  if (!beneath) {
    const q = await somewhere(4, 8);
    if (!q) { bad('no place in sight to stand a monster on'); return; }
    id0 = q.id;
    log('  (no floor under the attack on this screen: the monster stands in sight instead)', `${q.far.toFixed(1)} tiles off`);
  }
  s = await until((q) => q.mons.some((m) => m.id === id0 && m.seen), 2000) ?? await st();
  const m0 = s.mons.find((m) => m.id === id0);
  check(beneath ? 'a monster stands under the quick attack, awake and in sight' : 'a monster stands on the screen, awake and in sight', !!m0 && m0.seen && m0.state !== 'sleep' && (!beneath || Math.abs(m0.at.x - p0.x) < 6), m0 ? `${m0.far.toFixed(1)} tiles off, at ${Math.round(m0.at.x)},${Math.round(m0.at.y)}; the attack's middle is ${Math.round(p0.x)},${Math.round(p0.y)}` : 'not there');
  await page.waitForTimeout(150);
  await snap('01_monster_under_the_attack');
  let before = s.uses.slice();
  s = await quick(p0.x, p0.y);
  check('a press on it there does not open the inventory', s.panel === 'none', s.panel);
  check('it is the quick attack', s.uses[0] > before[0], `${s.names[0]} used ${s.uses[0] - before[0]} time(s)`);
  if (beneath && (cls === 'ranger' || (cls === 'mage' && touch))) {
    // (an arrow flies as far as it is sent; with fingers the mage walks into her wave's reach first. A
    // wave loosed from where a mouse's mage stands fades before it gets that far, and a sword is a sword.)
    s = await until((q) => q.mons.some((m) => m.id === id0 && m.hurt > 0), 5000) ?? await st();
    check('and it hits the monster that stood there', s.mons.some((m) => m.id === id0 && m.hurt > 0), `hurt ${(s.mons.find((m) => m.id === id0) ?? { hurt: 'gone' }).hurt}`);
  }
  await snap('02_pressed_in_a_fight');

  // ---- 3. the slow attack's plate likewise: a hold (or the right button) there is the slow attack ----------
  s = await st();
  before = s.uses.slice();
  await page.evaluate(() => { const h = window.__dbg.game().hero; for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; } });
  await hold(p1.x, p1.y);
  s = await until((q) => q.uses[1] > before[1] || q.panel !== 'none', 5000) ?? await st();
  check('a hold (or the right button) on the slow attack is the slow attack, and the inventory stays shut', s.panel === 'none' && s.uses[1] > before[1], `${s.panel}; ${s.names[1]} used ${s.uses[1] - before[1]} time(s)`);
  // (a held attack may still be going on: let it end)
  await page.waitForTimeout(700);

  // ---- 4. in the fight the INVENTORY button and the key still open it ---------------------------------------
  await hands.press('button:INVENTORY');
  s = await until((q) => q.panel === 'inv', 1500) ?? await st();
  check('the INVENTORY button opens it in a fight as out of one', s.panel === 'inv', s.panel);
  await hands.press('button:DONE');
  await until((q) => q.panel === 'none', 1500);
  await hands.settle();
  if (!touch) {
    await hands.key('Tab');
    s = await until((q) => q.panel === 'inv', 1500) ?? await st();
    check('and so does Tab', s.panel === 'inv', s.panel);
    await hands.key('Tab');
    await until((q) => q.panel === 'none', 1500);
    await hands.settle();
  }

  // ---- 5. the fight over: the attacks are buttons again -------------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.projectiles.length = 0; g.volleys.length = 0; g.orbs.length = 0; g.traps.length = 0; });
  await page.waitForTimeout(300);
  await hands.press('skill:0');
  s = await until((q) => q.panel === 'inv', 1500) ?? await st();
  check('with the monster gone, a press on the attack opens the inventory again', s.panel === 'inv' && s.focus === 0, `${s.panel}, attack ${s.focus}`);
  await snap('03_inventory_again');
  await hands.press('button:DONE');
  await until((q) => q.panel === 'none', 1500);
  await hands.settle();

  // ---- 6. something asleep, or something awake that cannot be seen, is no fight ------------------------------
  const id1 = beneath ? await under(p0.x, p0.y) : ((await somewhere(4, 8)) ?? { id: null }).id;
  await page.evaluate((id) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === id); if (m) { m.state = 'sleep'; m.speed = 0; } }, id1);
  await page.waitForTimeout(250);
  s = await st();
  const asleep = s.mons.find((m) => m.id === id1);
  if (asleep && asleep.state === 'sleep') {
    await hands.press('skill:0');
    s = await until((q) => q.panel === 'inv', 1500) ?? await st();
    check('a sleeper under the attack is no fight: the press opens the inventory', s.panel === 'inv', s.panel);
    await hands.press('button:DONE');
    await until((q) => q.panel === 'none', 1500);
    await hands.settle();
  } else log('  (the sleeper woke at once: not tried)', asleep ? asleep.state : 'gone');

  // ---- 7. a new player's first word: the prompt asks for the press, and gets it --------------------------------
  // The prompt says "Tap STRIKE at the bottom of the screen" unless a fight is on, and for the
  // prompt a fight is something awake within ten tiles. The screen reaches further than that, so
  // something awake can be in sight while the prompt still asks for the press: it must get it.
  let tried = false;
  for (const seed of [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]) {
    await page.evaluate((seed) => {
      const d = window.__dbg; d.saving(false); d.first('warrior', seed); d.autoLevel = false; d.autoWords = false; d.god = true;
      const g = d.game(); g.monsters.length = 0;
      // (the walking lesson is done, and the first word is in the pouch: the prompt is now about wordsmithing)
      if (g.guide) g.guide.walked = 99;
      g.hero.words.power = 1; g.refresh();
    }, seed);
    await page.waitForTimeout(500);
    const far = await somewhere(10.4, 13);
    if (!far) continue;
    await page.waitForTimeout(300);
    s = await st();
    const fm = s.mons.find((m) => m.id === far.id);
    if (!fm || !fm.seen || s.step !== 'smith') continue;
    tried = true;
    log('  dungeon ' + seed + ': something awake in sight', `${fm.far.toFixed(1)} tiles off; the prompt is "${s.step}"`);
    await snap('04_prompt_asks_for_the_press');
    const q0 = await hands.mark('skill:0');
    await hands.pressAt(q0.x, q0.y);
    s = await until((q) => q.panel === 'inv', 2000) ?? await st();
    check('the press the prompt asks for opens the inventory, though something awake is in sight', s.panel === 'inv' && s.page === 'attacks', `${s.panel}, ${s.page}`);
    await snap('05_first_word');
    await hands.press('button:DONE');
    await until((q) => q.panel === 'none', 1500);
    await hands.settle();
    // and with the fight come near, the prompt waits for it to be over, and the press is an attack again
    const near = await somewhere(3, 8);
    if (near) {
      await page.waitForTimeout(400);
      s = await st();
      s = await quick(q0.x, q0.y, 1500);
      check('with the fight come near, the same press no longer opens it', s.panel === 'none', `${s.panel}; the prompt is "${s.step}"`);
    }
    break;
  }
  if (!tried) log('  (the first word\'s prompt was not tried: no dungeon of twelve had a far tile in sight)', '');
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
