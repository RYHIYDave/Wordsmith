import { entered } from './lib.mjs';
// Plays with real touches (two fingers where needed), the way a phone player would, and reports
// what happened. Run with --touch and a phone-sized window, upright or sideways:
//   node tools/playtest.mjs --touch --size 390x844 --dpr 3 --scenario tools/scenarios/touch.mjs --out shots/touch
export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  const pts = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...pts].map(([id, p]) => ({ x: Math.round(p.x), y: Math.round(p.y), id })) });
  const client = (gx, gy) => page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [gx, gy]);
  const down = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchStart'); };
  const move = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchMove'); };
  // In this test interface an "end" event lists the fingers being lifted; the others stay down.
  const up = async (id) => {
    const q = pts.get(id);
    pts.delete(id);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: q ? [{ x: Math.round(q.x), y: Math.round(q.y), id }] : [] });
  };
  // (A tap's coming down is sent and NOT waited for before its going up is: with four playtests
  // sharing the machine the browser has taken a third of a second to answer, and a touch that lasts
  // that long is a HOLD. Versions 13.2 and 14.0: a tap set an orb, a tap spun a whirlwind.)
  const tap = async (gx, gy, ms = 60) => { pts.set(9, await client(gx, gy)); const sent = send('touchStart'); await page.waitForTimeout(ms); await Promise.all([sent, up(9)]); await page.waitForTimeout(120); };
  const mark = (name) => page.evaluate((n) => { const r = window.__dbg.ui.marks.get(n); return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w, h: r.h } : null; }, name);
  const marks = () => page.evaluate(() => [...window.__dbg.ui.marks.keys()]);
  const tapMark = async (name) => {
    const m = await mark(name);
    if (!m) { console.log('  !! nothing on screen called', name, '- have:', (await marks()).join(', ')); return false; }
    await tap(m.x, m.y);
    return true;
  };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const s = d.screen;
    const base = { w: s.w, h: s.h, turned: s.turned, upright: s.upright, scale: s.scale, touch: d.input.touchMode };
    if (!g) return { ...base, title: true };
    const h = g.hero; const c = d.cam();
    const scr = (x, y) => ({ x: c.ox + (x - y) * 16, y: c.oy + (x + y) * 8 });
    const near = g.monsters.filter((m) => !m.dead).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
    // (the way on: in town the gate in the back wall, used from the floor before it; in a dungeon the portal home)
    const way = (g.level.town ? g.level.stations.find((q) => q.kind === 'gate') : g.level.portal) ?? { x: h.x, y: h.y };
    return { ...base, town: g.level.town, x: h.x, y: h.y, life: h.life, maxLife: h.d.maxLife, words: h.words, sockets: h.skills.map((k) => ({ front: k.front, behind: k.behind })), kills: g.kills, proj: g.projectiles.length,
      skills: h.skills.map((k) => k.r.name), panel: d.panels.open, portal: scr(way.x, way.y), hero: scr(h.x, h.y),
      near: near ? { ...scr(near.x, near.y), dist: Math.hypot(near.x - h.x, near.y - h.y), state: near.state } : null, charges: h.skills.map((k) => k.charges),
      potions: h.potions, pending: h.pending, hint: g.interactHint(), stick: d.input.stick.active, held: d.input.aim.held, fx: h.fx, fy: h.fy, uses: h.skills.map((k) => k.uses) };
  });
  const log = (label, v) => console.log(label.padEnd(40), typeof v === 'string' ? v : JSON.stringify(v));
  const cssPx = async (r) => { const a = await client(0, 0); const b = await client(r.w, r.h); return `${Math.abs(b.x - a.x).toFixed(0)}x${Math.abs(b.y - a.y).toFixed(0)}`; };

  let s = await st();
  log('screen', { game: `${s.w}x${s.h}`, scale: s.scale, turned: s.turned, upright: s.upright, touch: s.touch });
  await snap('title');

  // 1. prompts off in the options (the first dungeon has a playtest of its own: guide.mjs), then NEW GAME
  // and the Mage, by tapping
  const bad = (msg) => console.log('  !! ' + msg);
  await tapMark('button:OPTIONS');
  await tapMark('button:PROMPTS: ON');
  log('prompts switched off', String(!!(await mark('button:PROMPTS: OFF'))));
  await snap('options');
  await tapMark('button:BACK');
  await tapMark('button:NEW GAME');
  await page.waitForTimeout(150);
  await snap('classes');
  await tapMark('class:mage');
  // (she makes ready on her card before the run begins: Version 16)
  await entered(page);
  await page.waitForTimeout(200);
  s = await st();
  log('tapped Mage: in town', String(s.town));
  if (s.title || !s.town) { bad('NEW GAME and the Mage card did not lead to the town'); return; }
  // (TOUCH_SEED=n plays the rest as the Mage of that seed, whose dungeons are then known beforehand:
  // for trying a first dungeon that has a pack in sight of the way in. See part 4.)
  if (process.env.TOUCH_SEED) {
    await page.evaluate((sd) => window.__dbg.run('mage', sd), Number(process.env.TOUCH_SEED));
    log('the rest is played as the Mage of seed', process.env.TOUCH_SEED);
  }
  // a new character has no word, so no screen opens by itself
  await page.waitForTimeout(1500);
  s = await st();
  log('no word yet: no screen opens by itself', String(s.panel === 'none'));
  if (s.panel !== 'none') bad(`a panel opened by itself in town: ${s.panel}`);
  await snap('start_town');

  // 2. the stick: left thumb down, pushed up, then right
  const sx = 70, sy = Math.round(s.h * 0.7);
  let p0 = { x: s.x, y: s.y };
  await down(1, sx, sy);
  await move(1, sx, sy - 30);
  await page.waitForTimeout(500);
  s = await st();
  log('stick up: hero moved up-screen by', ((p0.x + p0.y) - (s.x + s.y)).toFixed(2) + ' (world x+y), stick on: ' + s.stick);
  p0 = { x: s.x, y: s.y };
  await move(1, sx + 30, sy);
  await page.waitForTimeout(500);
  s = await st();
  log('stick right: hero moved right by', ((s.x - s.y) - (p0.x - p0.y)).toFixed(2) + ' (world x-y)');

  // 3. steer to the gate with the stick, then tap the prompt that appears
  for (let i = 0; i < 90; i++) {
    s = await st();
    const dx = s.portal.x - s.hero.x, dy = s.portal.y + 12 - s.hero.y;
    const d = Math.hypot(dx, dy);
    // (the way there passes other things that can be used: only the gate's own prompt ends the walk)
    if ((s.hint && /^Gate/.test(s.hint)) || d < 6) break;
    await move(1, sx + (dx / d) * 28, sy + (dy / d) * 28);
    await page.waitForTimeout(200);
  }
  await up(1);
  await page.waitForTimeout(150);
  s = await st();
  log('at the gate, prompt says', String(s.hint));
  await snap('gate');
  const pm = await mark('button:' + s.hint);
  if (pm) log('prompt size on the phone (CSS px)', await cssPx(pm));
  await tapMark('button:' + s.hint);
  await page.waitForTimeout(300);
  s = await st();
  log('tapped the prompt: panel', s.panel);
  await snap('gate_panel');
  const enter = (await marks()).find((k) => k.startsWith('button:ENTER DUNGEON'));
  await tapMark(enter);
  await page.waitForTimeout(400);
  s = await st();
  log('tapped ENTER: in dungeon', String(!s.town));
  if (s.town) { bad('the gate did not lead into the dungeon'); return; }

  // 4. the inventory: its button; then the attack at the bottom of the screen, a word, a slot
  // (Quiet first. The attacks along the bottom are buttons only while no fight is on, and about
  // seven first dungeons in four hundred have a pack in sight of the way in. Version 14.4's
  // regression met one on the tall phone: the tap on the attack went to the world as an attack,
  // which is the rule, and every step after it had no inventory to work in. Whatever has woken,
  // and whatever sleeps near enough to wake while the hero stands here, is taken out of the
  // dungeon; the fight of part 5 is walked to. TOUCH_QUIET=0 leaves them, to see what they do.)
  if (process.env.TOUCH_QUIET !== '0') {
    const out = await page.evaluate(() => {
      const g = window.__dbg.game(); const h = g.hero; const n = g.monsters.length;
      const awake = g.monsters.filter((m) => m.state !== 'sleep').length;
      g.monsters = g.monsters.filter((m) => m.state === 'sleep' && Math.hypot(m.x - h.x, m.y - h.y) > 12);
      g.projectiles.length = 0;
      return { taken: n - g.monsters.length, awake, left: g.monsters.length };
    });
    log('by the way in: taken out of the dungeon', `${out.taken} (${out.awake} of them awake already), ${out.left} left`);
  }
  const ib = await mark('button:INVENTORY');
  if (ib) log('INVENTORY button size on the phone (CSS px)', await cssPx(ib));
  await tapMark('button:INVENTORY');
  s = await st();
  log('tapped INVENTORY: panel', s.panel);
  if (s.panel !== 'inv') bad(`the INVENTORY button should open the inventory: open is ${s.panel}`);
  await snap('inventory');
  await tapMark('button:DONE');
  s = await st();
  if (s.panel !== 'none') bad('DONE should close the inventory');
  const plate = await mark('skill:0');
  if (plate) log('the attack at the bottom of the screen (CSS px)', await cssPx(plate));
  // (a new character has no word: two are handed over here)
  // (THE FIRST LEVELS, the game's own since Version 19.5: and the hero as he is some way in, the
  // wordsmith's ring lit and every move and slot open, level 20 since Version 20.0 (two behind from 20): what follows is about the fingers)
  await page.evaluate(() => { const d = window.__dbg; d.seasoned(20); const g = d.game(); Object.assign(g.hero.words, { fire: 1, twin: 1 }); g.refresh(); });
  await tapMark('skill:0');
  s = await st();
  log('tapped the attack: panel', s.panel);
  if (s.panel !== 'inv') bad(`a tap on the attack should open the inventory: open is ${s.panel}`);
  const tile = await mark('word:twin');
  if (tile) log('a word tile on the phone (CSS px)', await cssPx(tile));
  await tapMark('word:twin');
  await snap('word_selected');
  const slot = await mark('socket:1:front:0');
  if (slot) log('a slot on the phone (CSS px)', await cssPx(slot));
  await tapMark('socket:1:front:0');
  await page.waitForTimeout(200);
  s = await st();
  log('tapped a word, then the slot in front of Nova', s.skills);
  if (s.words.twin !== 0) bad('a tap on a word and then on a slot did not set it');
  await tapMark('word:fire');
  await tapMark('socket:0:front:0');
  await page.waitForTimeout(1400);
  s = await st();
  log('and the other one in front of Orb', s.skills);
  await snap('inventory_after');
  // a word is only lent to its attack: carried by a finger from where it sits to the slot behind, it moves
  const a0 = await mark('socket:0:front:0'); const b0 = await mark('socket:0:behind:0');
  if (a0 && b0) {
    await down(8, a0.x, a0.y);
    await page.waitForTimeout(60);
    for (let i = 1; i <= 4; i++) { await move(8, a0.x + ((b0.x - a0.x) * i) / 4, a0.y + ((b0.y - a0.y) * i) / 4); await page.waitForTimeout(30); }
    await up(8);
    await page.waitForTimeout(1400);
  } else bad('no slots to drag between');
  s = await st();
  log('dragged Flame to the slot behind', s.skills);
  if (!(s.sockets[0].behind[0] === 'fire' && !s.sockets[0].front[0])) bad(`the drag did not move the word behind: ${JSON.stringify(s.sockets[0])}`);
  // two taps on a set word take it back (the first reads it), so the fight below is the plain one
  for (const k of ['socket:0:behind:0', 'socket:1:front:0']) {
    await tapMark(k);
    await tapMark(k);
    await page.waitForTimeout(200);
  }
  s = await st();
  log('two taps on each set word: taken back', `${s.words.fire === 1 && s.words.twin === 1} ${JSON.stringify(s.skills)}`);
  if (!(s.words.fire === 1 && s.words.twin === 1)) bad(`two taps on a set word did not take it back: ${JSON.stringify(s.words)}`);
  await tapMark('button:DONE');
  s = await st();
  log('tapped DONE: panel', s.panel + ', ' + JSON.stringify(s.skills));
  await page.evaluate(() => { const g = window.__dbg.game(); Object.assign(g.hero.words, { fire: 0, twin: 0 }); g.offer = null; g.refresh(); });

  // 5. find a fight (the test bot walks there), then play it by touch
  await page.evaluate(() => { window.__dbg.god = true; window.__dbg.autoLevel = false; window.__dbg.autoWords = false; window.__dbg.bot(true); });
  for (let i = 0; i < 100; i++) { await page.waitForTimeout(250); s = await st(); if (s.near && s.near.dist < 6 && s.near.state !== 'sleep') break; }
  await page.evaluate(() => window.__dbg.bot(false));
  s = await st();
  log('nearest monster', s.near && { dist: s.near.dist.toFixed(1), state: s.near.state, side: s.near.x < s.hero.x ? 'left of hero' : 'right of hero' });

  // TAP = the quick ability (Orb). On empty floor, aim help still finds the monster.
  const rx = Math.round(s.w * 0.82), ry = Math.round(s.h * 0.55);
  const kills0 = s.kills;
  let u0 = s.uses;
  await tap(rx, ry, 60);
  await page.waitForTimeout(450);
  s = await st();
  log('one tap on empty floor: Orb / Nova used', `${s.uses[0] - u0[0]} / ${s.uses[1] - u0[1]}`);
  u0 = s.uses;
  for (let i = 0; i < 5; i++) { await tap(rx, ry, 60); await page.waitForTimeout(260); }
  await page.waitForTimeout(500);
  s = await st();
  log('five taps in rhythm: Orb / Nova used', `${s.uses[0] - u0[0]} / ${s.uses[1] - u0[1]}`);
  await snap('tap_attack');
  // a slow, careful tap (200 ms) is still a tap, not a hold
  u0 = s.uses;
  await tap(rx, ry, 200);
  await page.waitForTimeout(450);
  s = await st();
  log('a slow tap (0.2 s): Orb / Nova used', `${s.uses[0] - u0[0]} / ${s.uses[1] - u0[1]}`);
  // both thumbs: move with the stick and tap to attack
  p0 = { x: s.x, y: s.y };
  u0 = s.uses;
  await down(1, sx, sy);
  await move(1, sx - 28, sy);
  for (let i = 0; i < 3; i++) { await tap(rx, ry, 60); await page.waitForTimeout(300); }
  s = await st();
  log('two thumbs: moved while tapping by', Math.hypot(s.x - p0.x, s.y - p0.y).toFixed(2) + ` tiles, Orb used ${s.uses[0] - u0[0]}`);
  await snap('two_thumbs');
  await up(1);
  await page.waitForTimeout(400);
  s = await st();
  log('kills so far', s.kills - kills0);

  // HOLD = the slow ability (Nova), once per hold
  u0 = s.uses;
  const tx = s.near ? Math.max(s.w * 0.42, Math.min(s.w - 30, s.near.x)) : rx;
  const ty = s.near ? Math.max(60, Math.min(s.h - 60, s.near.y - 10)) : ry;
  await down(2, tx, ty);
  await page.waitForTimeout(150);
  s = await st();
  log('thumb down 0.15 s: counted as a hold yet', String(s.held));
  await page.waitForTimeout(350);
  s = await st();
  log('thumb down 0.5 s: hold / Nova used / charges', `${s.held} / ${s.uses[1] - u0[1]} / ${JSON.stringify(s.charges)}`);
  await snap('hold_nova');
  await page.waitForTimeout(900);
  s = await st();
  log('still holding 0.9 s later: Nova used (once per hold)', String(s.uses[1] - u0[1]));
  await up(2);
  // holding while it cools down: it goes off when ready
  u0 = s.uses;
  await down(2, tx, ty);
  await page.waitForTimeout(600);
  s = await st();
  const early = s.uses[1] - u0[1];
  await page.waitForTimeout(3400);
  s = await st();
  log('held through the cooldown: Nova used at 0.6 s / by 4 s', `${early} / ${s.uses[1] - u0[1]}`);
  await up(2);

  // FLICK = evade
  s = await st();
  p0 = { x: s.x, y: s.y };
  await down(3, rx, ry);
  await move(3, rx + 20, ry);
  await move(3, rx + 44, ry);
  await up(3);
  await page.waitForTimeout(200);
  s = await st();
  log('flick right: hero jumped by', Math.hypot(s.x - p0.x, s.y - p0.y).toFixed(2) + ' tiles, toward screen-right: ' + ((s.x - s.y) - (p0.x - p0.y) > 0));

  // 6. flask, pause, level up
  await page.evaluate(() => { const h = window.__dbg.game().hero; window.__dbg.god = false; h.life = h.d.maxLife * 0.4; });
  const pot0 = (await st()).potions;
  const flask = await mark('potion');
  if (flask) log('flask size on the phone (CSS px)', await cssPx(flask));
  await tapMark('potion');
  s = await st();
  log('tapped the flask: potions ' + pot0 + ' ->', `${s.potions}, life ${(100 * s.life / s.maxLife).toFixed(0)}%`);
  await page.evaluate(() => { window.__dbg.god = true; });
  await tapMark('button:II');
  s = await st();
  log('tapped pause: panel', s.panel);
  await snap('pause');
  await tapMark('button:Resume');
  s = await st();
  log('tapped Resume: panel', s.panel);
  await page.evaluate(() => { window.__dbg.autoLevel = true; window.__dbg.game().hero.pending = 1; });
  await page.waitForTimeout(150);
  s = await st();
  if (s.panel !== 'level') await tapMark('button:LEVEL UP');
  s = await st();
  log('level-up choice open', s.panel);
  await snap('levelup');
  // a press in the first moment must not pick anything (the panel may have appeared under a thumb)
  if (s.panel !== 'level') { await page.waitForTimeout(1200); }
  await page.evaluate(() => { const g = window.__dbg.game(); window.__dbg.panels.open = 'none'; g.hero.pending = 2; });
  await page.waitForTimeout(60);
  await page.evaluate(() => { window.__dbg.panels.open = 'level'; });
  await page.waitForTimeout(80);
  await tapMark('attr:str');
  s = await st();
  log('press 0.1 s after it appears: pending still', String(s.pending));
  await page.waitForTimeout(500);
  await tapMark('attr:int');
  s = await st();
  log('press after half a second: pending', String(s.pending) + ', panel ' + s.panel);
  await page.waitForTimeout(300);
  await snap('end');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
