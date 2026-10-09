// The inventory on half the screen (Version 14.2), played with a real mouse or real fingers.
//
// The owner, 5 Oct 2026: "I like the new menus but there is a lot of empty space. Can we have it
// only cover half of the screen? Pause the game when the inventory is open to the right side of
// the screen and recenter the camera on the player in the left side of the screen. Then you can
// tap on the game side and the inventory automatically closes and you're back in the game." And:
// "the helmet being alone at the top above the sprite is kinda weird."
//
// Checked here, in a dungeon with monsters awake: the inventory takes the right half (the bottom
// half on a phone held upright in the narrow layout) and the game is seen in the other; the hero
// stands in the middle of the game's half; the game stands still; none of the game's own buttons
// is drawn under it; what is read is on a card on the game's side, a press on the card is not a
// press on the game, and its buttons work; a press on the game's side closes the inventory and
// is neither an attack nor a step; the picture comes back with the hero in the middle of the
// screen; the slots stand in two columns beside the hero with nothing over the head.
//   node tools/playtest.mjs --scenario tools/scenarios/half.mjs --out shots/half
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/half.mjs --out shots/half_phone
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const hands = await makeHands(page);
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const u = d.invUi;
    const rects = {};
    for (const [k, r] of d.ui.marks) rects[k] = { x: r.x, y: r.y, w: r.w, h: r.h };
    const at = d.at(h.x, h.y);
    return {
      open: d.panels.open, page: u.page, sel: u.sel, word: u.word, W: d.ui.w, H: d.ui.h, rects,
      hero: { x: h.x, y: h.y, sx: at.x, sy: at.y }, time: g.time, uses: h.skills.map((k) => k.uses),
      gear: Object.fromEntries(Object.entries(h.gear).map(([k, v]) => [k, v ? v.uid : 0])), bag: h.bag.map((it) => (it ? it.uid : 0)),
      awake: g.monsters.filter((m) => !m.dead && m.state !== 'sleep').length,
      mons: g.monsters.filter((m) => !m.dead).slice(0, 6).map((m) => `${m.x.toFixed(3)},${m.y.toFixed(3)}`).join(' '),
    };
  });
  const press = async (name) => { const m = await hands.press(name); await page.waitForTimeout(140); return m; };
  // (the game's own buttons: INVENTORY is written "INVENTORY (I)" where there is a keyboard)
  const hudOn = (q) => Object.keys(q.rects).some((k) => k.startsWith('button:INVENTORY')) && !!q.rects['skill:0'];
  const hudAny = (q) => Object.keys(q.rects).some((k) => k.startsWith('button:INVENTORY') || k.startsWith('skill:') || k === 'potion' || k === 'minimap');
  const until = async (pred, ms = 2500) => { for (let t = 0; t < ms; t += 80) { const s = await st(); if (pred(s)) return s; await page.waitForTimeout(80); } return null; };

  // ---- a character in a dungeon, a few steps from a pack that is awake, with things in the bag -------
  await page.evaluate((c) => {
    const d = window.__dbg; d.saving(false); d.run(c, 11); d.autoLevel = false; d.autoWords = false; d.god = true;
    // (THE FIRST LEVELS, the game's own since Version 19.5: the wordsmith's ring lit, as it is once the MASTER RUNE-STONE is brought)
    d.seasoned(1);
    const g = d.game(); const h = g.hero;
    for (let i = 0; i < 6 && i < g.shop.length; i++) h.bag[i] = g.shop[i];
    Object.assign(h.words, { fire: 1, power: 1 });
    g.depth = 2; g.cleared = 2; g.enterDungeon();
  }, cls);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level; const f = L.floor; const h = g.hero;
    let best = null;
    for (const m of g.monsters) if (!m.boss && !m.dead && !best) best = m;
    for (let r = 5; r <= 8 && best; r++) for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
      if (L.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && g.sees(x, y, best.x, best.y)) { h.x = x; h.y = y; return; }
    }
  });
  await page.waitForTimeout(900);
  let s = await st();
  log('screen (game pixels)', `${s.W} x ${s.H}, ${hands.touch ? 'fingers' : 'mouse'}; monsters awake: ${s.awake}`);
  const mid0 = { x: s.W / 2, y: s.H / 2 + 12 };
  check('in play, the hero stands in the middle of the screen', Math.abs(s.hero.sx - mid0.x) <= 1.5 && Math.abs(s.hero.sy - mid0.y) <= 1.5, `${s.hero.sx.toFixed(1)}, ${s.hero.sy.toFixed(1)}`);
  check('and the game\'s own buttons are on the screen', hudOn(s));
  await snap('01_in_play');

  // ---- it opens on half the screen ----------------------------------------------------------------------
  await press('button:INVENTORY');
  await page.waitForTimeout(450);
  s = await st();
  check('the INVENTORY button opens it', s.open === 'inv', s.open);
  const inv = s.rects.inventory; const game = s.rects.game;
  check('the inventory and the game each have their part of the screen', !!inv && !!game);
  if (!inv || !game) { console.log('half: cannot go on'); return; }
  const upright = s.H > s.W;
  if (upright) {
    check('on a phone held upright it lies along the bottom: half the screen at the most', inv.x === 0 && inv.w === s.W && inv.y + inv.h === s.H && inv.h <= s.H / 2 + 1 && inv.h >= 234, JSON.stringify(inv));
    check('and the game has the rest, above it', game.x === 0 && game.y === 0 && game.w === s.W && game.h === inv.y, JSON.stringify(game));
  } else {
    check('it is the right half of the screen', inv.y === 0 && inv.h === s.H && inv.x + inv.w === s.W && Math.abs(inv.w - s.W / 2) <= 1, JSON.stringify(inv));
    check('and the game is the left half', game.x === 0 && game.y === 0 && game.h === s.H && game.w === inv.x, JSON.stringify(game));
  }
  const mid = { x: game.x + game.w / 2, y: game.y + game.h / 2 + 12 };
  // (the picture glides there: a third of a second, and longer on a machine that is busy)
  const inMid = (q) => Math.abs(q.hero.sx - mid.x) <= 1.5 && Math.abs(q.hero.sy - mid.y) <= 1.5;
  s = (await until(inMid)) ?? (await st());
  check('the hero stands in the middle of the game\'s half', inMid(s), `${s.hero.sx.toFixed(1)}, ${s.hero.sy.toFixed(1)}; the middle is ${mid.x}, ${mid.y}`);
  check('none of the game\'s own buttons is drawn under it', !hudAny(s), Object.keys(s.rects).filter((k) => k.startsWith('skill') || k === 'potion' || k === 'minimap' || k.startsWith('button:INVENTORY')).join(' '));
  // everything of the inventory lies inside its half
  const mine = Object.entries(s.rects).filter(([k]) => /^(bag:|gear:|word:|tab:|page:|button:(GEAR|ATTACKS|STATS|DONE)|glance)/.test(k));
  const out = mine.filter(([, r]) => r.x < inv.x || r.y < inv.y || r.x + r.w > inv.x + inv.w || r.y + r.h > inv.y + inv.h).map(([k]) => k);
  check('everything of the inventory lies inside its half', mine.length > 30 && out.length === 0, out.join(' '));
  await snap('02_open');

  // ---- the game stands still ----------------------------------------------------------------------------
  const a = await st();
  await page.waitForTimeout(700);
  const b = await st();
  check('the game stands still while it is open', a.time === b.time && a.mons === b.mons && a.awake > 0, `clock ${a.time.toFixed(3)} then ${b.time.toFixed(3)}; ${a.awake} awake`);

  // ---- the slots beside the hero: two columns, nothing over the head ------------------------------------
  {
    const g = (k) => s.rects[`gear:${k}`];
    const all = ['helm', 'amulet', 'chest', 'belt', 'mainhand', 'offhand', 'gloves', 'boots', 'ring1', 'ring2'];
    check('GEAR has a slot for each thing worn', all.every((k) => g(k)));
    if (all.every((k) => g(k))) {
      const xs = [...new Set(all.map((k) => g(k).x))].sort((p, q) => p - q);
      check('the slots stand in two columns', xs.length === 2, xs.join(' '));
      check('five to a column', all.filter((k) => g(k).x === xs[0]).length === 5 && all.filter((k) => g(k).x === xs[1]).length === 5);
      check('the helmet is not alone over the hero: it is the top of a column, with the amulet across from it', g('helm').x === xs[0] && g('amulet').x === xs[1] && g('helm').y === g('amulet').y && all.every((k) => g(k).y >= g('helm').y));
      check('and the hero stands between the columns', xs[1] - (xs[0] + g('helm').w) >= 50, `${xs[1] - (xs[0] + g('helm').w)} game pixels between them`);
    }
  }

  // ---- what is read is on a card on the game's side -----------------------------------------------------
  const piece = s.bag.findIndex((u) => u !== 0);
  await press(`bag:${piece}`);
  s = await st();
  const card = s.rects.card;
  check('a piece pressed is read on a card', !!card && !!s.sel && s.sel.kind === 'bag', JSON.stringify(s.sel));
  if (card) {
    const onGame = card.x >= game.x && card.y >= game.y && card.x + card.w <= game.x + game.w && card.y + card.h <= game.y + game.h;
    check('the card lies on the game\'s side', onGame, JSON.stringify(card));
    check('against the inventory\'s edge', upright ? inv.y - (card.y + card.h) <= 4 : inv.x - (card.x + card.w) <= 4);
    check('with EQUIP and DROP on it', !!s.rects['button:EQUIP'] && !!s.rects['button:DROP']);
    await snap('03_card');
    // a press on the card (its text, not a button) is not a press on the game
    await hands.pressAt(card.x + card.w - 6, card.y + 6);
    await page.waitForTimeout(160);
    s = await st();
    check('a press on the card does not close the inventory', s.open === 'inv', s.open);
    check('and the piece is still being read', !!s.sel && !!s.rects.card);
    const uid = s.bag[piece];
    await press('button:EQUIP');
    s = await st();
    check('EQUIP on the card puts the piece on', Object.values(s.gear).includes(uid), `piece ${uid}`);
  }

  // ---- a press on the game's side closes it -------------------------------------------------------------
  s = await st();
  const before = s;
  // (a point of the game's half well away from the card and from the edge)
  const gx = upright ? Math.round(game.w * 0.5) : Math.round(game.w * 0.3);
  const gy = upright ? Math.round(game.h * 0.25) : Math.round(game.h * 0.3);
  await hands.pressAt(gx, gy);
  await page.waitForTimeout(120);
  s = await st();
  check('a press on the game\'s side closes the inventory', s.open === 'none', s.open);
  await page.waitForTimeout(700);
  s = await st();
  check('that press was not an attack', s.uses.every((u, i) => u === before.uses[i]), `${before.uses.join(',')} then ${s.uses.join(',')}`);
  check('and the game is going again', s.time > before.time, `${before.time.toFixed(2)} then ${s.time.toFixed(2)}`);
  const inMid0 = (q) => Math.abs(q.hero.sx - mid0.x) <= 1.5 && Math.abs(q.hero.sy - mid0.y) <= 1.5;
  s = (await until(inMid0)) ?? (await st());
  check('the hero is back in the middle of the screen', inMid0(s), `${s.hero.sx.toFixed(1)}, ${s.hero.sy.toFixed(1)}`);
  check('and the game\'s own buttons are back', hudOn(s));
  await snap('04_closed');

  // ---- from an attack: ATTACKS, the words as sockets ----------------------------------------------------
  // (the monsters are taken away first: in a fight the attacks along the bottom are not buttons)
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.projectiles.length = 0; });
  await page.waitForTimeout(300);
  await press('skill:0');
  await page.waitForTimeout(400);
  s = await st();
  check('pressing an attack on the game screen opens it on ATTACKS', s.open === 'inv' && s.page === 'attacks', `${s.open}, ${s.page}`);
  if (s.open === 'inv') {
    const sock = s.rects['socket:0:front:0'];
    check('a word slot is a socket the size of a bag\'s cell', !!sock && sock.w === 20 && sock.h === 20, JSON.stringify(sock));
    await press('word:fire');
    s = await st();
    check('a word pressed is read on a card on the game\'s side', s.word === 'fire' && !!s.rects.card, `${s.word}`);
    await snap('05_word_read');
    await press('socket:0:front:0');
    s = await st();
    check('and a press on a socket sets it', s.word === null, `${s.word}`);
    await snap('06_word_set');
    await press('button:DONE');
    s = await st();
    check('DONE still closes it', s.open === 'none', s.open);
  }

  // ---- a shake caught half way does not hold the picture off its place ----------------------------------
  // (Found by this playtest in Version 14.2's regression, one run in a dozen: the effects are not
  // stepped while a panel is open, so the shake's last offset stood for as long as it was.)
  await page.evaluate(() => { const d = window.__dbg; d.fx.shake = 6; d.fx.shakeX = 4; d.fx.shakeY = 2; d.inv(); });
  s = (await until(inMid)) ?? (await st());
  check('a shake caught half way by the opening does not hold the picture off the middle', s.open === 'inv' && inMid(s), `${s.hero.sx.toFixed(1)}, ${s.hero.sy.toFixed(1)}; the middle is ${mid.x}, ${mid.y}`);
  await press('button:DONE');
  console.log('half: done');
}
