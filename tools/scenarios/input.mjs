import { entered } from './lib.mjs';
// Plays with a real mouse and keyboard, the way a person would, and reports what happened.
export default async function (page, snap) {
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    if (!g) return null;
    const h = g.hero; const c = d.cam(); const s = d.screen;
    const css = s.canvas.getBoundingClientRect().width / s.w;
    const toCss = (x, y) => ({ x: (c.ox + (x - y) * 16) * css, y: (c.oy + (x + y) * 8) * css });
    const near = g.monsters.filter((m) => !m.dead).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
    // (the way on: in town the gate in the back wall, used from the floor before it; in a dungeon the portal home)
    const way = (g.level.town ? g.level.stations.find((q) => q.kind === 'gate') : g.level.portal) ?? { x: h.x, y: h.y };
    return { town: g.level.town, x: h.x, y: h.y, life: h.life, uses: h.skills.map((k) => k.uses), kills: g.kills, proj: g.projectiles.length, zones: g.zones.length,
      skills: h.skills.map((k) => k.r.name), words: h.words, panel: d.panels.open, portal: toCss(way.x, way.y),
      hero: toCss(h.x, h.y), near: near ? { ...toCss(near.x, near.y), dist: Math.hypot(near.x - h.x, near.y - h.y), state: near.state } : null, cd: h.skills.map((k) => k.charges), css };
  });
  const log = (label, v) => console.log(label.padEnd(34), typeof v === 'string' ? v : JSON.stringify(v));

  // 1. the starting screen: prompts off in the options (the first dungeon has a playtest of its own:
  // guide.mjs), then NEW GAME and the Mage card
  const markAt = (name) => page.evaluate((n) => {
    const d = window.__dbg; const m = d.ui.marks; let key = m.has(n) ? n : null;
    if (!key) for (const k of m.keys()) if (k.startsWith(n)) { key = k; break; }
    if (!key) return null;
    const r = m.get(key); return d.screen.toClient(r.x + r.w / 2, r.y + r.h / 2);
  }, name);
  const clickMark = async (name, button = 'left') => { const c = await markAt(name); if (!c) { console.log('  !! nothing on screen called', name); return false; } await page.mouse.click(c.x, c.y, { button }); await page.waitForTimeout(150); return true; };
  const bad = (msg) => console.log('  !! ' + msg);
  // (The page says it is ready before its first frame is drawn, and the starting screen's buttons are
  // there from that frame on. On a busy machine this playtest once began a moment too early, and found
  // no OPTIONS button: the published page of Version 18.5, 7 Oct 2026. It waits for the button now.)
  await page.waitForFunction(() => [...window.__dbg.ui.marks.keys()].some((k) => k.startsWith('button:OPTIONS')), null, { timeout: 8000 }).catch(() => {});
  await clickMark('button:OPTIONS');
  await clickMark('button:PROMPTS: ON');
  log('prompts switched off', String(!!(await markAt('button:PROMPTS: OFF'))));
  await clickMark('button:BACK');
  await clickMark('button:NEW GAME');
  await clickMark('class:mage');
  // (she makes ready on her card before the run begins: Version 16)
  await entered(page);
  await page.waitForTimeout(300);
  let s = await st();
  if (!s) { bad('NEW GAME and the Mage card started nothing'); return; }
  log('started (town expected)', { town: s.town, skills: s.skills });
  if (!s.town) bad('with prompts off a new character should begin in town');
  // a new character has no word, so no screen opens by itself
  await page.waitForTimeout(1500);
  s = await st();
  log('no word yet: no screen opens by itself', `${s.panel === 'none'} (words: ${Object.values(s.words).reduce((a, n) => a + n, 0)})`);
  if (s.panel !== 'none') bad(`a panel opened by itself in town: ${s.panel}`);
  await snap('start_town');

  // 2. WASD
  const x0 = s.x, y0 = s.y;
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyW');
  s = await st();
  log('W moved hero up-screen by', (Math.hypot(s.x - x0, s.y - y0)).toFixed(2) + ' tiles');

  // 3. hold the left button on the portal: walk there, then press E
  await page.mouse.move(s.portal.x, s.portal.y + 10);
  await page.mouse.down();
  for (let i = 0; i < 12; i++) { await page.waitForTimeout(250); s = await st(); await page.mouse.move(s.portal.x, s.portal.y + 10); }
  await page.mouse.up();
  s = await st();
  log('distance to gate after click-move', Math.hypot(s.hero.x - s.portal.x, s.hero.y - s.portal.y).toFixed(0) + ' css px');
  // (a click on the gate is an order to go there and use it: by now its panel may be open already)
  log('at the gate after the click-move: panel', s.panel);
  await snap('gate');
  if (s.panel !== 'gate') {
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(300);
    s = await st();
    log('pressed E at the gate: panel', s.panel);
  }
  if (s.panel !== 'gate') bad(`the gate's panel is not open: open is ${s.panel}`);
  await snap('gate_panel');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(400);
  s = await st();
  log('pressed E in the panel: in dungeon', String(!s.town));
  // (everything after this is in the dungeon: without it there is nothing more to learn here)
  if (s.town) { bad('E in the gate panel did not lead into the dungeon'); return; }

  // 4. Tab opens the inventory; a spare word is set by clicking it, then the slot
  // (a new character has no word: two are handed over here)
  await page.evaluate(() => { const g = window.__dbg.game(); Object.assign(g.hero.words, { fire: 1, twin: 1 }); g.refresh(); });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  s = await st();
  log('Tab: panel', s.panel);
  if (s.panel !== 'inv') bad(`Tab should open the inventory: open is ${s.panel}`);
  await snap('inventory_before');
  // (Tab opens it on GEAR, as the INVENTORY button does: the word slots are on the ATTACKS page)
  s = await st();
  if ((await page.evaluate(() => window.__dbg.invUi.page)) !== 'gear') bad('Tab should open the inventory on GEAR');
  await clickMark('tab:attacks');
  await page.waitForTimeout(150);
  await clickMark('word:fire');
  await snap('word_selected');
  await clickMark('socket:0:front:0');
  await page.waitForTimeout(200);
  s = await st();
  log('clicked Flame, then the slot in front', s.skills);
  if (s.words.fire !== 0) bad('clicking a word and then a slot did not set it');
  // a word on an attack is only lent: one click reads it, a second takes it back
  await clickMark('socket:0:front:0');
  await snap('set_word_read');
  s = await st();
  log('one click on the set word: still set', String(s.words.fire === 0));
  await clickMark('socket:0:front:0');
  await page.waitForTimeout(200);
  s = await st();
  log('a second click takes it back', `${s.words.fire === 1} ${JSON.stringify(s.skills)}`);
  if (s.words.fire !== 1) bad('a second click on a set word did not take it back');
  // set again, and a right click takes it back too
  await clickMark('word:fire');
  await clickMark('socket:0:front:0');
  await page.waitForTimeout(1400);
  await clickMark('socket:0:front:0', 'right');
  await page.waitForTimeout(200);
  s = await st();
  log('a right click takes it back', String(s.words.fire === 1));
  if (s.words.fire !== 1) bad('a right click on a set word did not take it back');
  await clickMark('word:twin');
  await clickMark('socket:0:front:0');
  await page.waitForTimeout(200);
  s = await st();
  log('the other word, set in its place', s.skills);
  await snap('inventory_after');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  s = await st();
  log('Tab again: panel', s.panel);
  if (s.panel !== 'none') bad('Tab should close the inventory');
  // I opens it too
  await page.keyboard.press('KeyI');
  await page.waitForTimeout(150);
  s = await st();
  log('I: panel', s.panel);
  if (s.panel !== 'inv') bad(`I should open the inventory: open is ${s.panel}`);
  await snap('inventory_i');
  await page.keyboard.press('KeyI');
  await page.waitForTimeout(150);

  // 5. fight: invulnerable, walk toward the nearest monster with the test bot, then use real input
  await page.evaluate(() => { window.__dbg.god = true; window.__dbg.autoWords = false; window.__dbg.bot(true); });
  for (let i = 0; i < 80; i++) { await page.waitForTimeout(250); s = await st(); if (s.near && s.near.dist < 6 && s.near.state !== 'sleep') break; }
  await page.evaluate(() => window.__dbg.bot(false));
  // (The bot may have BEGUN an attack as it was switched off: an attack has a wind-up, and is paid
  // for only when it goes off. One that went off after the slow attack was made ready below would
  // take its charge again, and the right click would then find it spent: seen once, 6 Oct 2026,
  // in a full run on a busy machine. So whatever the bot began is let finish first.)
  for (let i = 0; i < 40; i++) { if (!(await page.evaluate(() => { const h = window.__dbg.game().hero; return !!h.windup || !!h.channel; }))) break; await page.waitForTimeout(50); }
  // (the bot may have used the slow attack on its way here: it is made ready again, so that what is
  // tested is the right click and not how long the weapon's slow attack waits)
  await page.evaluate(() => { const k = window.__dbg.game().hero.skills[1]; k.charges = k.maxCharges; k.cd = 0; });
  s = await st();
  log('nearest monster', s.near);
  const used0 = s.uses[1];
  await page.keyboard.down('ShiftLeft');
  await page.mouse.move(s.near.x, s.near.y - 12);
  await page.mouse.down();
  await page.waitForTimeout(900);
  let s2 = await st();
  log('shots in flight while holding LMB', s2.proj);
  await snap('firing');
  await page.mouse.up();
  await page.keyboard.up('ShiftLeft');
  await page.mouse.click(s.near.x, s.near.y - 12, { button: 'right' });
  // (since Version 11 an attack has a wind-up: the slow attack is paid for when it goes off, a
  // quarter of a second after the press, and later still if it had to wait for a quick attack's
  // own wind-up to finish)
  let waited = 0;
  for (; waited < 1500; waited += 60) { await page.waitForTimeout(60); s2 = await st(); if (s2.uses[1] > used0) break; }
  log('right click, the slow attack: used ' + used0 + ' ->', s2.uses[1] + ` after about ${waited + 60} ms, charges ` + JSON.stringify(s2.cd));
  if (!(s2.uses[1] > used0)) bad('a right click did not use the slow attack');
  // (generous: four browsers share two processors while the whole set of playtests runs)
  else if (waited + 60 > 1000) bad(`the slow attack took ${waited + 60} ms to go off after the right click: far more than a wind-up and a wait`);
  await snap('nova');
  const before = { x: s2.x, y: s2.y };
  // aim the evasive move along open floor, as a player would
  const clear = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor; const c = d.cam();
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) {
      let ok = true;
      for (let k = 0.5; k <= 3.5 && ok; k += 0.5) ok = g.level.walk[Math.floor(h.y + dy * k) * f.w + Math.floor(h.x + dx * k)] === 1;
      if (ok) { const x = h.x + dx * 3.5, y = h.y + dy * 3.5; return d.screen.toClient(c.ox + (x - y) * 16, c.oy + (x + y) * 8); }
    }
    return null;
  });
  if (clear) await page.mouse.move(clear.x, clear.y); else console.log('  (no open floor around the hero to warp along)');
  await page.keyboard.press('Space');
  await page.waitForTimeout(150);
  s2 = await st();
  log('Space warped the hero by', Math.hypot(s2.x - before.x, s2.y - before.y).toFixed(2) + ' tiles');
  await page.waitForTimeout(600);
  await snap('after');
  s2 = await st();
  log('kills so far', s2.kills);
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
