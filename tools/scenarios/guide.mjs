// A new player's first dungeon, played from the starting screen with real input, the way a person
// would: a mouse and keyboard on a PC, fingers on a phone (run with --touch, sideways or upright).
// NEW GAME, a class card, and straight into dungeon 1, which teaches by prompts (the guide).
//
// THE FIRST LEVELS (game/defs.ts, FIRST_LEVELS; the game's own since Version 19.5, on the owner's
// yes of 8 Oct 2026, 23:06): the hero starts with the quick attack alone; the first pack is a
// softball; no word falls in the first dungeon and no monster there carries one; the fallen
// wordsmith has the MASTER RUNE-STONE by him (since Version 19.6, beside his hand), which is carried home through the boss's portal and
// brought to the wordsmith in town; his ring is lit by it, he gives the first word, and it is set
// there, on the quick attack: that is the end of the lesson ("No special moment").
//   move > fight > body > carry > ring > smith > done
// Tap and hold opens at level 2 and the swipe at 5: the levels are given by script (a new player
// reaches the second a minute or so into the first dungeon, the fifth in the second), and each
// move is then used with real input, the first in the first dungeon as its prompt asks, the other
// in the second dungeon after the lesson. LATE=<word> there: a word that falls at the hero's feet
// once the first is set is only picked up (see below). EARLY and AMBUSH have nothing to do with
// it on (no word falls before the ring is lit, and in town no pack comes): they say so and play on.
// Switched off (the game before Version 19.5) it plays the lesson as it was:
//   move > fight > body > take > smith > use > done
// Every input the guide teaches is made with real input: walking (W A S D, or the left thumb),
// the quick attack, the slow one and the evasive move (left click, right click, Space; or tap,
// hold, swipe), the walk up to the body and onto the word, the drag of the word onto the attack,
// DONE, and the worded attack on the dead that rise. Only these things are done by script, to keep
// it short and steady: the hero is unkillable, and is put NEAR the first pack and NEAR the body
// instead of walking the whole dungeon (the monsters round the body are cleared away, so that the
// quiet moment the inventory waits for is sure to come; and no monster but the boss carries a word
// of its own, so that the first word is the one in the body).
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/guide.mjs --out shots/guide
//   CLS=mage node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/guide.mjs --out shots/guide_phone
// Environment:
//   CLS    warrior | ranger | mage (default warrior)
//   SEED   play this dungeon (every run prints its seed, so that one that went wrong can be gone back to)
//   EARLY  a word (frost, swift...) that a monster gives up before the body is reached
//   LATE   a word that falls at the hero's feet as the dead rise. The first word is set by then,
//          so it is only picked up: the game must NOT stop and open the inventory for it (the
//          owner, 5 Oct 2026: "After you get your first power word and equip it, the game doesn't
//          need to stop and open the inventory again whenever a word is picked up"). Until then
//          the game offered it a place at the first quiet moment (see `shut`).
//   AMBUSH three bats set on the hero as the first word is picked up. The game opens the inventory
//          for a first word at the first QUIET moment: so the pack is fought first, as a player
//          would, and the inventory must open when that fight is over. (Version 18.4's regression
//          met this by chance: a ranger, seed 535760094, bats in at the room's back doorway as
//          the word was found; this playtest stood and waited, and called it a fault.)
import { makeHands, log } from './lib.mjs';

const ORDER = ['move', 'fight', 'body', 'take', 'smith', 'use', 'done'];
// (THE FIRST LEVELS)
const ORDER_FL = ['move', 'fight', 'body', 'carry', 'ring', 'smith', 'done'];
/** The class's first word, and the attack the first dungeon suggests for it (FIRST_WORD in src/game/defs.ts). */
// (skill: 0 the quick attack, 1 the slow one, 2 the evasive move: the ranger's Poison goes on Trap, which is the swipe since Version 12.2.
// THE FIRST LEVELS: on the quick attack for all three, the only one open when it is given: firstWordSkill)
const FIRST = { warrior: { word: 'power', skill: 0 }, ranger: { word: 'poison', skill: 2 }, mage: { word: 'fire', skill: 0 } };

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const hands = await makeHands(page);
  const touch = hands.touch;
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const client = hands.client;
  const pts = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...pts].map(([id, p]) => ({ x: Math.round(p.x), y: Math.round(p.y), id })) });
  const down = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchStart'); };
  const move = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchMove'); };
  const up = async (id) => {
    const q = pts.get(id);
    pts.delete(id);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: q ? [{ x: Math.round(q.x), y: Math.round(q.y), id }] : [] });
  };
  let failed = 0;
  const fail = async (msg) => { failed++; console.log('  !! ' + msg); await page.evaluate((m) => console.error(m), 'guide: ' + msg); };

  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    if (!g) return { title: true, w: d.screen.w, h: d.screen.h, panel: d.panels.open, page: d.titleUi.page };
    const h = g.hero; const G = g.guide; const L = g.level;
    const at = (x, y) => d.at(x, y);
    const far = (o) => Math.hypot(o.x - h.x, o.y - h.y);
    const live = g.monsters.filter((m) => !m.dead).sort((a, b) => far(a) - far(b));
    const risen = live.filter((m) => m.packId === -7);
    // (the word nearest the hero: an ordinary monster gives one up now and then, and a mage kills
    // from afar and may leave it lying a room away. This scenario once walked off toward such a
    // word, away from the one the fallen wordsmith had just given, and never came back.)
    const words = g.drops.filter((x) => x.kind === 'word').sort((p, q) => far(p) - far(q));
    const drop = words[0];
    const b = L.body;
    const goal = window.__goal;
    // (THE FIRST LEVELS: the wordsmith in town, the portal in a dungeon; what is open; the NEW MOVE banner)
    const smith = L.town ? L.stations.find((q) => q.kind === 'wordsmith') : null;
    const po = !L.town ? L.portal : null;
    return {
      quest: h.quest ?? null, ring: h.ring !== false, open: [0, 1, 2].map((i) => (g.moveOpen ? g.moveOpen(i) : true)),
      smith: smith ? at(smith.x, smith.y) : null, smithDist: smith ? Math.hypot(smith.x - h.x, smith.y - h.y) : 99,
      portal: po ? at(po.x, po.y) : null, portalOn: po ? po.state === 1 : false,
      toast: d.moveToast ? d.moveToast() : null,
      carriers: g.monsters.filter((m) => !m.dead && m.carries && m.carries.length).length,
      metaRing: d.meta().ring === true,
      title: false, step: g.guideStep(), rows: g.guideRows(), town: !!L.town, depth: g.depth, panel: d.panels.open, w: d.screen.w, h: d.screen.h,
      guide: G ? { walked: +G.walked.toFixed(1), met: G.met, hits: G.hits, quick: G.quick, slow: G.slow, evade: G.evade, set: G.set, risen: G.risen } : null,
      hero: at(h.x, h.y), pos: { x: h.x, y: h.y },
      // (the one to go for: an enemy that is awake and near before any other. A sleeper rooms away may
      // be anywhere on the screen, under the small map for one, and a tap there is not an attack.)
      near: live.length ? at((live.find((m) => m.state !== 'sleep' && far(m) < 10) ?? live[0]).x, (live.find((m) => m.state !== 'sleep' && far(m) < 10) ?? live[0]).y) : null, nearDist: live.length ? far(live[0]) : 99,
      awake: live.filter((m) => m.state !== 'sleep' && far(m) < 10).length,
      risen: risen.length, risenAt: risen.length ? at(risen[0].x, risen[0].y) : null,
      body: b ? { at: at(b.x, b.y), state: b.state, dist: far(b) } : null,
      drop: drop ? at(drop.x, drop.y) : null, drops: words.length,
      goal: goal ? at(goal.x, goal.y) : null,
      held: Object.keys(h.words).find((k) => h.words[k] > 0) ?? null,
      // (how many words are in the pouch, all told: the first pack can give up more than one)
      spare: Object.values(h.words).reduce((a, n) => a + n, 0),
      names: h.skills.map((k) => k.r.name), uses: h.skills.map((k) => k.uses),
      front: h.skills.map((k) => k.front.filter(Boolean)), potions: h.potions,
      life: Math.round(h.life), maxLife: h.d.maxLife, over: g.over, level: h.level,
      taught: d.meta().taught, log: d.guideLog.join(' '),
    };
  });

  // ---- how a person does each thing --------------------------------------------------------------
  /** The level-up choice opens by itself in a quiet moment: a person picks something and plays on. */
  const settle = async (s) => {
    if (s && s.panel === 'level') {
      const m = (await hands.marks()).find((k) => k.startsWith('attr:'));
      if (m) await hands.press(m);
      await page.waitForTimeout(200);
      return true;
    }
    return false;
  };
  const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
  const keysDown = new Set();
  /** Hold the keys that walk in this direction on screen (and let go of the others). */
  const steer = async (dx, dy) => {
    const d = Math.hypot(dx, dy) || 1;
    const want = new Set();
    if (dy / d < -0.38) want.add('KeyW');
    if (dy / d > 0.38) want.add('KeyS');
    if (dx / d < -0.38) want.add('KeyA');
    if (dx / d > 0.38) want.add('KeyD');
    for (const k of KEYS) {
      if (want.has(k) && !keysDown.has(k)) { await page.keyboard.down(k); keysDown.add(k); }
      if (!want.has(k) && keysDown.has(k)) { await page.keyboard.up(k); keysDown.delete(k); }
    }
  };
  const letGo = async () => { for (const k of [...keysDown]) { await page.keyboard.up(k); keysDown.delete(k); } };
  /**
   * Walk toward a place on screen until `done`: the keyboard on a PC, the left thumb's stick on a
   * phone. (The place is asked for again each moment, as the view follows the hero.)
   */
  const walk = async (where, done, ms = 9000) => {
    const t0 = Date.now();
    let s = await st();
    let stick = null;
    while (Date.now() - t0 < ms) {
      s = await st();
      if (done(s)) break;
      if (s.panel !== 'none') {
        // (a panel is up: hands off the stick, deal with it, and take the stick up again)
        if (stick) { await up(1); stick = null; } else await letGo();
        if (!(await settle(s))) await page.waitForTimeout(150);
        continue;
      }
      const to = where(s);
      if (to) {
        const dx = to.x - s.hero.x; const dy = to.y - s.hero.y; const d = Math.hypot(dx, dy) || 1;
        if (touch) {
          if (!stick) { stick = { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) }; await down(1, stick.x, stick.y); }
          await move(1, stick.x + (dx / d) * 26, stick.y + (dy / d) * 26);
        } else await steer(dx, dy);
      }
      await page.waitForTimeout(90);
    }
    if (stick) await up(1); else await letGo();
    await page.waitForTimeout(120);
    return st();
  };
  /**
   * A point to attack at that is not on one of the game screen's own buttons. A monster may stand
   * under the attacks along the bottom of the screen (or under the small map, or the INVENTORY
   * button), and a press there is a press on that button: on an attack it opens the inventory, in
   * the middle of the fight, and the game waits behind it. (Version 13.1's regression: a ranger's
   * risen dead gathered under SHOT, the tap meant for them opened the inventory, and the two
   * minutes ran out with four of them standing.) A person taps beside the button; so does this.
   */
  const clear = async (x, y) => {
    const { rects, h } = await page.evaluate(() => ({ rects: [...window.__dbg.ui.marks.values()].map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })), h: window.__dbg.screen.h }));
    for (let i = 0; i < 4; i++) {
      const r = rects.find((q) => x >= q.x - 3 && x <= q.x + q.w + 3 && y >= q.y - 3 && y <= q.y + q.h + 3);
      if (!r) break;
      y = r.y + r.h / 2 > h / 2 ? r.y - 6 : r.y + r.h + 6;
    }
    return { x, y };
  };
  /** One use of the quick attack on a point of the screen: a left click held a moment, or a tap. */
  const quick = async (x0, y0) => {
    const { x, y } = await clear(x0, y0);
    // (a tap is the library's: it does not wait for the browser to answer the finger's coming down
    // before lifting it, so a busy machine cannot stretch it into a hold)
    if (touch) { await hands.pressAt(x, y); await page.waitForTimeout(30); }
    else { const c = await client(x, y); await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.waitForTimeout(220); await page.mouse.up(); }
  };
  /** One use of the slow attack: a right click, or a hold (the right thumb's: the left of the screen is the walking thumb's). */
  const slow = async (x0, y0, w) => {
    const { x, y } = await clear(touch ? Math.max(x0, w * 0.5) : x0, y0);
    if (touch) { await down(9, x, y); await page.waitForTimeout(420); await up(9); await page.waitForTimeout(170); }
    else { const c = await client(x, y); await page.mouse.move(c.x, c.y); await page.mouse.click(c.x, c.y, { button: 'right' }); await page.waitForTimeout(200); }
  };
  /**
   * In a fight the inventory should be shut. If it is open (it should not be: `clear` keeps the
   * taps off the attacks), say so, close it and fight on: the game waits behind it, and without
   * this the rest of the run would say nothing but that time ran out.
   */
  // (One way it opens is the game's own doing and no fault: a word found BEFORE the first word has
  // been set (EARLY) is offered a place at the first quiet moment, and the inventory opens by
  // itself with that word in hand. Version 14.4's regression: a ranger picked up TWIN as the dead
  // rose, the inventory came up for it twice, and this playtest called both a press gone astray.
  // Since 5 Oct 2026 a word found AFTER the first is set is not offered at all: see LATE, below.
  // A press on an attack or on INVENTORY opens it with nothing in hand: that is still the fault
  // it always was.)
  let offered = 0;
  const shut = async (q) => {
    if (!q || q.panel !== 'inv') return false;
    const now = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; return { hand: d.invUi.word, page: d.invUi.page, spare: Object.keys(h.words).filter((k) => h.words[k] > 0).join(' ') || 'none' }; });
    if (now.hand) {
      offered++;
      log('  a word found in the fight was offered a place', `${now.hand}: the inventory opened by itself (spare words: ${now.spare}); closed, and the fight goes on`);
      // (for a third of a second after it opens by itself the game lets no press land on it, so that
      // one already on its way does nothing: a DONE pressed at once is lost, and in Version 14.4's
      // regression the one opening was found open twice. A person takes longer than that to see it.)
      await page.waitForTimeout(450);
    } else await fail(`the inventory was open in the middle of a fight (a press meant for a monster landed on a button?): nothing in hand, page ${now.page}, spare words: ${now.spare}`);
    await press('button:DONE');
    await page.waitForTimeout(200);
    return true;
  };
  /**
   * The evasive move: Space, or a swipe. Each swipe goes a different way: a Leap or a Warp
   * straight into a wall is refused ("No room"), and the hero may be standing against one.
   */
  let swipes = 0;
  const evade = async (s) => {
    if (touch) {
      const [dx, dy] = [[1, 0], [-1, 0], [0, -1], [0, 1]][swipes++ % 4];
      // (sent all at once, so that a busy machine cannot stretch it into a hold: see flickAt in lib.mjs)
      await hands.flickAt(Math.round(s.w * 0.66), Math.round(s.h * 0.55), dx * 44, dy * 44, 9);
    } else await page.keyboard.press('Space');
    await page.waitForTimeout(250);
  };
  /**
   * The evasive move, away from a place on the screen: what the ranger's Trap wants (roll away
   * from what is coming, and it walks onto the trap). A swipe that way, or Space with the pointer
   * on the far side of the hero.
   */
  const evadeFrom = async (s, at) => {
    let dx = s.hero.x - at.x; let dy = s.hero.y - at.y;
    const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    if (touch) await hands.flickAt(Math.round(s.w * 0.66), Math.round(s.h * 0.55), dx * 44, dy * 44, 9);
    else {
      const c = await client(s.hero.x + dx * 80, s.hero.y + dy * 80);
      await page.mouse.move(c.x, c.y);
      await page.keyboard.press('Space');
    }
    await page.waitForTimeout(250);
  };
  /** Wait (hands off) until something is so; null if it never was. A level-up choice in the way is made. */
  const wait = async (pred, ms) => {
    const t0 = Date.now();
    for (;;) {
      const s = await st();
      if (pred(s)) return s;
      if (Date.now() - t0 > ms) return null;
      if (!(await settle(s))) await page.waitForTimeout(100);
    }
  };
  const press = async (name) => {
    const r = await hands.press(name);
    if (!r) await page.evaluate((m) => console.error(m), `guide: nothing on screen called ${name}`);
    return r;
  };

  // ---- the starting screen ------------------------------------------------------------------------
  let s = await st();
  log('screen', `${s.w}x${s.h}, ${touch ? 'touch' : 'mouse'}, ${cls}`);
  if (!(await hands.until(() => window.__dbg.ui.marks.has('button:NEW GAME'), 8000))) await fail('the starting screen has no NEW GAME');
  log('a new player: no CONTINUE, prompts on', `${!(await hands.mark('button:CONTINUE'))}, taught ${await page.evaluate(() => window.__dbg.meta().taught)}`);
  await snap('00_title');
  await press('button:NEW GAME');
  await page.waitForTimeout(300);
  await snap('01_classes');
  await press(`class:${cls}`);
  await page.waitForTimeout(700);
  s = await st();
  if (s.title || s.town || s.depth !== 1 || !s.guide) { await fail(`NEW GAME did not start in the first dungeon with its prompts: ${JSON.stringify({ title: s.title, town: s.town, depth: s.depth, guide: !!s.guide })}`); return; }
  const fl = await page.evaluate(() => !!(window.__dbg.firstLevelsOn && window.__dbg.firstLevelsOn()));
  log('THE FIRST LEVELS (Version 19.5)', fl ? 'on, as the game has them' : 'OFF: the lesson as it was before');
  // THE FIRST LEVELS: no monster of the first dungeon carries a word, the boss with them (his note of 21:05)
  const noCarriers = async () => {
    if (!fl) return;
    const c = (await st()).carriers;
    log('  monsters of the first dungeon carrying a word', String(c));
    if (c) await fail(`${c} monster(s) of the first dungeon carry a word`);
  };
  await noCarriers();
  // (the two things done by script: see the top of this file)
  await page.evaluate(() => {
    const d = window.__dbg; d.god = true;
    // (a named monster may carry a word of its own, and whoever kills one before reaching the body is
    // prompted about that word instead: this scenario is about the word in the body, so none of them does)
    for (const m of d.game().monsters) if (!m.boss && m.carries && m.carries.length) m.carries = [];
  });
  // (SEED=n plays that dungeon again: the seed of every run is printed, so that one that went wrong can be gone back to)
  if (process.env.SEED) {
    await page.evaluate(([c, n]) => { const d = window.__dbg; d.first(c, n); }, [cls, Number(process.env.SEED)]);
    await page.waitForTimeout(400);
    await noCarriers();
    await page.evaluate(() => { const d = window.__dbg; d.god = true; for (const m of d.game().monsters) if (!m.boss && m.carries && m.carries.length) m.carries = []; });
    s = await st();
  }
  const t0 = Date.now();
  log('  the dungeon\'s seed', String(await page.evaluate(() => window.__dbg.game().seed)));
  log('1 in the first dungeon, the first prompt', s.step);
  if (s.step !== 'move') await fail(`the first prompt should be "move": it is ${s.step}`);
  if (s.held || s.front.some((f) => f.length)) await fail('a new character should start with no word');
  if (fl) {
    // tap alone at level 1; the others not shown until they open (his answers, 22:21); the ring dark
    log('  open at level 1: quick / slow / swipe', s.open.join(' / '));
    if (s.open.join() !== 'true,false,false') await fail(`at level 1 only the quick attack should be open: ${s.open.join(', ')}`);
    const shown = { slow: !!(await hands.mark('skill:1')), swipe: !!(await hands.mark('skill:2')) };
    log('  shown on the game screen: the slow attack / the swipe', `${shown.slow} / ${shown.swipe}`);
    if (shown.slow || shown.swipe) await fail('a move that is not open yet is shown on the game screen');
    if (s.ring) await fail('a new player\'s first hero should find the wordsmith\'s ring dark');
    if (s.front.some((f) => f.length)) await fail('word slots before the ring is lit');
    // the first pack, a softball (his note of 22:25): a few slow skeletons that barely hurt
    const soft = await page.evaluate(() => window.__dbg.game().monsters.filter((m) => !m.dead && !m.boss && m.kind === 'skeleton' && m.speed === 2).map((m) => ({ life: Math.round(m.maxLife), hit: +m.dmgMax.toFixed(2) })));
    log('  the first pack, the softball: slow skeletons', soft);
    if (!soft.length || soft.length > 3) await fail(`the first pack should be a softball of up to three slow skeletons: ${soft.length}`);
  }
  await snap('02_move');

  // ---- move: the keyboard, or the left thumb ------------------------------------------------------
  for (let i = 0; i < 6 && s.step === 'move'; i++) {
    // somewhere a few steps off with nothing in the way (another place each try)
    await page.evaluate((i) => {
      const g = window.__dbg.game(); const h = g.hero; const walk = g.level.walk;
      const clear = (x, y) => { for (let t = 0; t <= 1; t += 0.08) if (!g.free(walk, h.x + (x - h.x) * t, h.y + (y - h.y) * t, 0.45)) return false; return true; };
      const found = [];
      for (const r of [5, 4, 3.2]) for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2; const x = h.x + Math.cos(a) * r; const y = h.y + Math.sin(a) * r;
        if (clear(x, y)) found.push({ x, y });
      }
      window.__goal = found.length ? found[(i * 5) % found.length] : { x: h.x + 3, y: h.y };
    }, i);
    s = await walk((q) => q.goal, (q) => q.step !== 'move', 3500);
  }
  log('  walked', `${s.guide ? s.guide.walked : '?'} tiles (prompt now: ${s.step})`);
  if (s.step === 'move') await fail('walking did not take the first prompt away');
  await snap('03_walked');

  // ---- fight: near the first pack (by script), then every way of fighting with real input ----------
  const nearPack = () => page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero; const f = g.level.floor;
    let best = null; let bd = 1e9;
    for (const m of g.monsters) { if (m.dead || m.elite || m.boss) continue; const dd = Math.hypot(m.x - f.start.x, m.y - f.start.y); if (dd < bd) { bd = dd; best = m; } }
    // (five to seven tiles off, in sight of it; and if there is no such place, nearer. Since Version
    // 18.7 sight stops at a shut door: a pack in a small room, whose door is shut since the hero is
    // set down here and has not walked in, has no place that far off that sees it. The pre-flight
    // of 18.7 met that: a ranger, seed 869691369, whose first two packs died before the rain of
    // arrows had landed; the third stood in a room of eight tiles by seven.)
    // (and where a player could stand: not behind the shut door of the room it is in. Version 19.7's
    // regression met that: a mage, seed 1277235665, the nearest pack four archers in a room whose
    // door was shut and whose other way out goes only to a vault, so is reached through that door;
    // set down in that passage, the hero was shot at by archers still "shut in" (game.ts, shutIn),
    // which no fight counts, so that the fight prompt never came.)
    const was = { x: h.x, y: h.y };
    for (const r of [5, 5.5, 6, 6.5, 7, 4, 3, 2.5]) for (let k = 0; k < 16 && best; k++) {
      const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
      if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && g.free(g.level.walk, x, y, 0.45) && g.sees(x, y, best.x, best.y)) {
        h.x = x; h.y = y;
        if (!g.shutIn(best)) return true;
        h.x = was.x; h.y = was.y;
      }
    }
    return false;
  });
  const placed = await nearPack();
  if (!placed) await fail('no place to stand near the first pack');
  await page.waitForTimeout(500);
  s = await st();
  log('2 near the first pack', `nearest monster ${s.nearDist.toFixed(1)} tiles off`);
  let shot = false;
  let n = 0;
  let packs = 1;
  // (THE FIRST LEVELS: the lines the prompt shows are those of the moves that are open; at level 1 the quick attack's alone)
  const ticked = (q) => (fl ? !!q.guide && q.rows.length > 0 && q.rows.every((r) => r.done) : !!q.guide && q.guide.quick && q.guide.slow && q.guide.evade && q.rows.length > 0 && q.rows.every((r) => r.done));
  for (const t1 = Date.now(); Date.now() - t1 < 40000; n++) {
    s = await st();
    if (ticked(s) || !s.guide) break;
    if (await settle(s) || (await shut(s))) continue;
    if (!shot && s.step === 'fight') { shot = true; await snap('04_fight_prompt'); }
    // (the flask is only asked for when life has been low: an unkillable hero rarely sees it)
    if (s.rows.some((r) => r.id === 'flask' && !r.done)) { if (touch) await hands.press('potion'); else await page.keyboard.press('KeyQ'); }
    // (a pack that is dead before every line is ticked: since Version 12 a mage's wave and orb can
    // clear the soft first pack in a moment. On to the next pack, as a player would be, and not a
    // tap on whatever sleeps nearest, wherever on the screen that is.)
    if (s.awake === 0 && packs < 5) { packs++; if (!(await nearPack())) break; await page.waitForTimeout(500); continue; }
    if (!s.near) { await page.waitForTimeout(100); continue; }
    const x = s.near.x; const y = s.near.y - 10;
    if (fl) {
      // (as the prompt asks: a move whose line is showing and not yet ticked; otherwise the quick attack)
      const want = s.rows.find((r) => !r.done && (r.id === 'slow' || r.id === 'evade'));
      if (want && want.id === 'slow') await slow(x, y, s.w);
      else if (want && want.id === 'evade') await evade(s);
      else await quick(x, y);
    } else if (n % 4 === 2) await slow(x, y, s.w);
    else if (n % 4 === 3) await evade(s);
    else await quick(x, y);
  }
  s = await st();
  log('  the fight lines', s.rows.map((r) => `${r.id}:${r.done ? 'done' : 'NOT done'}`).join(' ') + `  (blows taken ${s.guide ? s.guide.hits : '?'})`);
  log('  quick / slow / evasive used', s.uses.join(' / '));
  if (!ticked(s)) await fail(`the fight lines were not all ticked: ${JSON.stringify(s.rows)} ${JSON.stringify(s.guide)}`);
  await snap('05_fight_ticked');
  // the rest of the pack
  for (const t1 = Date.now(); Date.now() - t1 < 40000; n++) {
    s = await st();
    if (s.awake === 0) break;
    if (await settle(s) || (await shut(s))) continue;
    if (!s.near) { await page.waitForTimeout(100); continue; }
    if (n % 5 === 2 && s.open[1]) await slow(s.near.x, s.near.y - 10, s.w);
    else await quick(s.near.x, s.near.y - 10);
  }
  s = await st();
  log('  the pack is dead', `${s.awake === 0} (level ${s.level})`);
  // (this playtest's own aim, tried on purpose: a tap meant for the middle of an attack's plate is
  // moved off the plate, and so does not open the inventory)
  {
    const plate = await hands.mark('skill:0');
    if (plate && s.panel === 'none') {
      await quick(plate.x, plate.y);
      await page.waitForTimeout(150);
      if ((await st()).panel === 'inv') await fail('a tap aimed at an attack\'s plate was not moved off it: the inventory opened');
    }
  }

  // ---- THE FIRST LEVELS: tap and hold opens at level 2 (the level given by script) ----------------
  // The moment it opens (his note of 22:23): the NEW MOVE banner; the quick attack's plate slides
  // over, the slow one's is revealed. Then the prompt asks for it, and it is used with real input.
  if (fl) {
    if (s.level >= 2) log('  (level 2 was reached in the fight: its banner came and went then)', `level ${s.level}`);
    else {
      await page.evaluate(() => { const g = window.__dbg.game(); while (g.hero.level < 2) g.gainXp(10); });
      const banner = await wait((q) => !!q.toast, 3000);
      log('  level 2: the NEW MOVE banner', banner ? `for move ${banner.toast.skill}` : 'NOT SHOWN');
      if (!banner) await fail('reaching level 2 showed no NEW MOVE banner');
      else if (banner.toast.skill !== 1) await fail(`level 2 should open tap and hold (move 1): the banner is for move ${banner.toast.skill}`);
      await page.waitForTimeout(350);
      await snap('05b_new_move_level2');
    }
    // (the level-up choice opens at the first quiet moment, and a person picks something: `settle`)
    s = (await wait((q) => q.panel === 'none' && !q.toast, 9000)) ?? (await st());
    const slowPlate = !!(await hands.mark('skill:1'));
    log('  open at level 2: quick / slow / swipe; the slow attack shown', `${s.open.join(' / ')}; ${slowPlate}`);
    if (s.open.join() !== 'true,true,false') await fail(`at level 2 tap and hold should be open, and the swipe not yet: ${s.open.join(', ')}`);
    if (!slowPlate) await fail('at level 2 the slow attack is not shown on the game screen');
    if (await hands.mark('skill:2')) await fail('at level 2 the swipe is shown on the game screen');
    // the next pack, and the prompt's new line
    packs++;
    if (!(await nearPack())) await fail('no pack left to try tap and hold on');
    await page.waitForTimeout(500);
    for (const t1 = Date.now(); Date.now() - t1 < 40000; n++) {
      s = await st();
      if (ticked(s) || !s.guide) break;
      if (await settle(s) || (await shut(s))) continue;
      if (s.awake === 0 && packs < 8) { packs++; if (!(await nearPack())) break; await page.waitForTimeout(500); continue; }
      if (!s.near) { await page.waitForTimeout(100); continue; }
      if (s.rows.some((r) => r.id === 'slow' && !r.done)) await slow(s.near.x, s.near.y - 10, s.w);
      else await quick(s.near.x, s.near.y - 10);
    }
    s = await st();
    log('  the fight lines at level 2', s.rows.map((r) => `${r.id}:${r.done ? 'done' : 'NOT done'}`).join(' ') + `  (slow attacks made: ${s.uses[1]})`);
    if (!s.rows.some((r) => r.id === 'slow')) await fail('at level 2 the prompt does not ask for tap and hold');
    if (!ticked(s) || s.uses[1] < 1) await fail(`tap and hold was not used at level 2, as the prompt asked: ${JSON.stringify(s.rows)}`);
    await snap('05c_hold_used');
    // (whatever is still awake round the hero is put down, as before the walk to the body)
    await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.dead && m.state !== 'sleep') m.dead = true; });
    s = await st();
    // no word anywhere: none fell from what was killed, none in the pouch
    log('  words fallen in the first dungeon / in the pouch', `${s.drops} / ${s.spare}`);
    if (s.drops || s.spare) await fail('a word fell in the first dungeon, before the ring is lit');
    if (process.env.EARLY || process.env.AMBUSH) log('  (EARLY and AMBUSH have nothing to do with the first levels: no word falls before the ring is lit, and in town no pack comes)', 'played on as it is');
  }

  // ---- a word before the body? ------------------------------------------------------------------------
  // A named monster can give up a word before the fallen wordsmith is reached. The game then goes
  // straight on to the wordsmithing with that word (the owner: "or once you drop a word of power
  // from a rare mob, you get the prompt to socket the word"), and so does this playtest.
  // EARLY=<word> makes it happen: the word falls at the hero's feet.
  if (process.env.EARLY && !fl) {
    await page.evaluate((word) => { const g = window.__dbg.game(); const h = g.hero; g.drops.push({ x: h.x + 0.2, y: h.y + 0.2, kind: 'word', gold: 0, item: null, word, age: 0 }); }, process.env.EARLY);
    await wait((q) => !!q.held, 4000);
  }
  s = await st();
  const early = !fl && !!s.held && !!s.body && s.body.state === 0;
  let w = null;
  if (early) {
    w = s.held;
    log('3 a monster gave up a word before the body was reached', `${w} (prompt: ${s.step}; the body is left unsearched)`);
    if (s.step !== 'smith' && s.step !== 'take') await fail(`with a word in the pouch and none set the prompt should be "smith": it is ${s.step}`);
    // (the inventory waits for a quiet moment)
    await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.dead && m.state !== 'sleep') m.dead = true; });
    await snap('06_early_word');
  }

  // ---- the body: near it (by script), then the walk up to it is real -------------------------------
  if (!early) {
  const nearBody = await page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.level.body; const h = g.hero; const walk = g.level.walk;
    if (!b) return null;
    // (nothing may be awake near the hero when the word is found: the inventory waits for a quiet moment)
    for (const m of g.monsters) if (!m.dead && (m.state !== 'sleep' || Math.hypot(m.x - b.x, m.y - b.y) < 14)) m.dead = true;
    const clear = (x, y) => { for (let t = 0; t <= 0.72; t += 0.06) if (!g.free(walk, x + (b.x - x) * t, y + (b.y - y) * t, 0.45)) return false; return true; };
    for (const r of [3.5, 4, 3, 4.5, 2.5]) for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2 + 0.4; const x = b.x + Math.cos(a) * r; const y = b.y + Math.sin(a) * r;
      if (clear(x, y) && g.sees(x, y, b.x, b.y)) { h.x = x; h.y = y; return { r, state: b.state }; }
    }
    h.x = b.x + 3.2; h.y = b.y + 1.4;
    return { r: 0, state: b.state };
  });
  if (!nearBody) { await fail('the first dungeon has no body'); return; }
  s = (await wait((q) => q.step === 'body', 3000)) ?? (await st());
  log('3 near the body: the prompt', `${s.step} (the body is ${s.body.dist.toFixed(1)} tiles off)`);
  if (s.step !== 'body') await fail(`in sight of the body the prompt should be "body": it is ${s.step}`);
  await page.waitForTimeout(400);
  await snap('06_body');
  s = await walk((q) => q.body.at, (q) => q.body.state !== 0, 7000);
  if (s.body.state === 0) {
    // (something was in the way of a straight walk: a person would click or tap the body instead)
    log('  (the straight walk did not get there: the body is pressed instead)', '');
    await hands.pressAt(s.body.at.x, s.body.at.y);
    s = (await wait((q) => q.body.state !== 0, 8000)) ?? (await st());
  }
  log('  searched', `${s.body.state !== 0} (flasks ${s.potions})`);
  if (s.body.state === 0) { await fail('the body was never searched'); return; }

  // ---- THE FIRST LEVELS: by the fallen wordsmith, the MASTER RUNE-STONE, and no word -----------------
  if (fl) {
    s = (await wait((q) => !!q.quest, 3000)) ?? (await st());
    log('4 by the fallen wordsmith', `${s.quest === 'heart' ? 'the MASTER RUNE-STONE' : 'NO QUEST ITEM'}; words on the floor ${s.drops}, in the pouch ${s.spare}; the prompt ${s.step}`);
    if (s.quest !== 'heart') { await fail('the fallen wordsmith\'s satchel held no MASTER RUNE-STONE'); return; }
    if (s.drops || s.spare) await fail('the fallen wordsmith gave a word before the ring is lit');
    if (s.step !== 'carry') await fail(`carrying the MASTER RUNE-STONE the prompt should be "carry": it is ${s.step}`);
    await page.waitForTimeout(900);
    await snap('07_the_rune_heart');
  } else {
  // ---- take: the word, walked onto -----------------------------------------------------------------
  s = (await wait((q) => !!q.drop || !!q.held, 3000)) ?? (await st());
  if (!s.drop && !s.held) { await fail('searching the body dropped no word'); return; }
  await snap('07_word_on_the_floor');
  log('4 the word is on the floor: the prompt', s.step + (s.drops > 1 ? ` (${s.drops} words lie about: the nearest is walked to)` : ''));
  s = await walk((q) => q.drop, (q) => !!q.held, 8000);
  w = s.held;
  log('  picked up', String(w));
  if (!w) { await fail('the word was never picked up'); return; }
  if (w !== FIRST[cls].word) await fail(`the ${cls}'s first word should be ${FIRST[cls].word}: it is ${w}`);
  await page.waitForTimeout(900);
  await snap('08_word_found');
  }
  }

  if (fl) {
    // ---- carry: the MASTER RUNE-STONE home. The way home is the portal the boss leaves behind: the boss and
    // the rest are put down by script and the portal lit (as towntap.mjs does), the hero set down a
    // few steps from it with nothing between; the press on it is real -----------------------------
    const by = await page.evaluate(() => {
      const g = window.__dbg.game(); const L = g.level; const f = L.floor; const po = L.portal; const h = g.hero;
      if (!po) return null;
      for (const m of g.monsters) m.dead = true;
      po.state = 1;
      const clear = (x, y) => { for (let t = 0; t <= 0.7; t += 0.07) if (!g.free(L.walk, x + (po.x - x) * t, y + (po.y - y) * t, 0.45)) return false; return true; };
      for (const r of [3.5, 4, 3, 4.5, 2.6]) for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2 + 0.3; const x = po.x + Math.cos(a) * r; const y = po.y + Math.sin(a) * r;
        if (L.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && clear(x, y) && g.sees(x, y, po.x, po.y)) { h.x = x; h.y = y; return r; }
      }
      return 0;
    });
    if (by === null) { await fail('the first dungeon has no portal'); return; }
    await page.waitForTimeout(700);
    s = await st();
    log('5 by the portal, the boss down (by script)', `${by ? by.toFixed(1) + ' tiles off' : 'NO PLACE IN SIGHT OF IT'}; lit ${s.portalOn}; the prompt ${s.step}`);
    if (s.step !== 'carry') await fail(`with the MASTER RUNE-STONE in the dungeon the prompt should be "carry": it is ${s.step}`);
    await snap('08_the_portal');
    // (a press on it: the hero walks to it and steps through, as in towntap.mjs; failing that, the walk up and its prompt)
    if (s.portal) await hands.pressAt(s.portal.x, s.portal.y - 20);
    s = (await wait((q) => q.town, 8000)) ?? (await st());
    if (!s.town) {
      log('  (the press did not take the hero home: walked up to it and its prompt pressed instead)', '');
      s = await walk((q) => q.portal, (q) => q.town || !q.portal || Math.hypot(q.portal.x - q.hero.x, q.portal.y - q.hero.y) < 14, 6000);
      if (!s.town) { if (touch) await press('button:Return to town'); else await page.keyboard.press('KeyE'); }
      s = (await wait((q) => q.town, 6000)) ?? (await st());
    }
    log('  home', `town ${s.town}, the MASTER RUNE-STONE ${s.quest === 'heart' ? 'carried' : 'GONE'}; the prompt ${s.step}`);
    if (!s.town) { await fail('the portal did not take the hero home'); return; }
    if (s.quest !== 'heart') await fail('the MASTER RUNE-STONE was lost on the way home');
    if (s.step !== 'ring') await fail(`in town with the MASTER RUNE-STONE the prompt should be "ring": it is ${s.step}`);
    await page.waitForTimeout(800);
    await snap('09_town_bring_it');

    // ---- ring: near the wordsmith (by script), the walk up to him is real --------------------------
    const stood = await page.evaluate(() => {
      const g = window.__dbg.game(); const L = g.level; const h = g.hero;
      const q = L.stations.find((k) => k.kind === 'wordsmith');
      if (!q) return null;
      const clear = (x, y) => { for (let t = 0; t <= 0.75; t += 0.05) if (!g.free(L.walk, x + (q.x - x) * t, y + (q.y - y) * t, 0.45)) return false; return true; };
      for (const r of [4, 3.5, 4.5, 3, 5, 2.6]) for (let k = 0; k < 32; k++) {
        const a = (k / 32) * Math.PI * 2 + 0.2; const x = q.x + Math.cos(a) * r; const y = q.y + Math.sin(a) * r;
        if (g.free(L.walk, x, y, 0.45) && clear(x, y)) { h.x = x; h.y = y; return r; }
      }
      return 0;
    });
    if (stood === null) { await fail('the town has no wordsmith'); return; }
    await page.waitForTimeout(500);
    s = await walk((q) => q.smith, (q) => q.ring || !q.quest, 9000);
    if (!s.ring) {
      log('  (the straight walk did not get there: he is pressed instead)', '');
      if (s.smith) await hands.pressAt(s.smith.x, s.smith.y - 8);
      s = (await wait((q) => q.ring, 8000)) ?? (await st());
    }
    log('6 walked up to the wordsmith with it', `ring lit ${s.ring} (on this device ${s.metaRing}); the MASTER RUNE-STONE ${s.quest ? 'STILL CARRIED' : 'given'}; his word ${s.held}`);
    if (!s.ring) { await fail('walking up to the wordsmith with the MASTER RUNE-STONE did not light his ring'); return; }
    if (!s.metaRing) await fail('the ring is lit for the hero but not on this device');
    if (s.quest) await fail('the MASTER RUNE-STONE is still carried once the ring is lit');
    w = s.held;
    if (w !== FIRST[cls].word) await fail(`the wordsmith should give the ${cls} ${FIRST[cls].word}: he gave ${w}`);
    await page.waitForTimeout(600);
    await snap('10_the_ring_lit');

    // ---- smith: the inventory opens by itself; the word is dragged before the quick attack ----------
    s = (await wait((q) => q.panel === 'inv', 9000)) ?? (await st());
    log('7 the inventory opened by itself', String(s.panel === 'inv'));
    if (s.panel !== 'inv') { await fail(`the inventory never opened for the first word (open: ${s.panel})`); return; }
    if (s.step !== 'smith') await fail(`with the first word in the pouch the prompt should be "smith": it is ${s.step}`);
    await page.waitForTimeout(700);
    await snap('11_inventory_coach');
    const slot = 'socket:0:front:0';
    const had = (await st()).spare;
    const from = await hands.mark(`word:${w}`);
    const to = await hands.mark(slot);
    if (!from || !to) { await fail(`cannot drag word:${w} to ${slot}: on screen are ${(await hands.marks()).join(', ')}`); return; }
    if (await hands.mark('socket:0:behind:0')) await fail('a slot behind is shown before it opens (level 7)');
    if (await hands.mark('socket:0:front:1')) await fail('a second slot in front is shown before it opens (level 5)');
    await hands.dragStart(from.x, from.y, to.x, to.y);
    await page.waitForTimeout(200);
    await snap('12_dragging');
    await hands.dragEnd();
    await page.waitForTimeout(500);
    s = await st();
    log('  dragged onto ' + slot, `${s.names[0]}  (the lesson ${s.guide ? 'STILL ON, prompt ' + s.step : 'over'})`);
    if (s.front[0][0] !== w || s.spare !== had - 1) await fail(`the drag did not set ${w} on ${slot}: ${JSON.stringify({ front: s.front, held: s.held, spare: s.spare, had })}`);
    // (his answer, 22:19: "No special moment": set in town, that is the end of the lesson)
    if (s.guide) await fail('the lesson should end once the first word is set in town');
    await page.waitForTimeout(800);
    await snap('13_word_set');
    await press('button:DONE');
    s = (await wait((q) => q.panel === 'none', 2000)) ?? (await st());
    if (s.panel !== 'none') await fail(`DONE did not close the inventory (open: ${s.panel})`);
    await page.waitForTimeout(400);
    await snap('14_done');
  } else {

  // ---- smith: the inventory opens by itself; the word is dragged onto the suggested socket ----------
  // (It opens at the first QUIET moment. A pack that woke far off may be upon the hero just then:
  // the monsters round the body are cleared away before the walk to it, but not a pack that wakes
  // later and comes from further off. A player fights it; so does this; and the inventory must
  // open once that fight is over. AMBUSH=1 makes it happen.)
  if (process.env.AMBUSH && !early) {
    const came = await page.evaluate(() => {
      const g = window.__dbg.game(); const h = g.hero; const walk = g.level.walk;
      let n = 0;
      // (six to eight tiles off; and if the room is too small to have three such places in sight, three to five)
      for (const base of [6, 3]) for (let k = 0; k < 40 && n < 3; k++) {
        const a = (k / 40) * Math.PI * 2 + 0.9; const r = base + (k % 3);
        const x = h.x + Math.cos(a) * r; const y = h.y + Math.sin(a) * r;
        // (IN SIGHT OF THE HERO: since Version 18.7 no monster opens a door, and a bat set down
        // beyond a shut one is held there, awake, for as long as this playtest cares to wait. The
        // hero is set down in this room by the script and has not walked in: its own door is shut
        // behind him. Version 18.7's regression met that: a ranger, seed 104877239, 183 attacks at
        // a bat behind a door, and the quiet moment never came.)
        if (!g.free(walk, x, y, 0.45) || !g.sees(h.x, h.y, x, y)) continue;
        const m = g.spawn('bat', x, y, 950, 0, false, g.rng); m.xp = 0; m.seen = true; g.wakeUp(m); n++;
      }
      return n;
    });
    log('  (AMBUSH: bats set on the hero as the word is found)', String(came));
    if (came === 0) await fail('AMBUSH: there was no room for a bat near the hero');
  }
  s = null;
  {
    let fought = 0;
    let quietSince = Date.now();
    for (const t1 = Date.now(); Date.now() - t1 < 60000;) {
      const q = await st();
      if (q.panel === 'inv') { s = q; break; }
      if (await settle(q)) continue;
      if (q.awake > 0) {
        quietSince = Date.now();
        if (!q.near) { await page.waitForTimeout(100); continue; }
        fought++;
        if (fought % 5 === 3) await slow(q.near.x, q.near.y - 10, q.w);
        else await quick(q.near.x, q.near.y - 10);
        continue;
      }
      // (nothing is awake: the quiet moment. Nine seconds of it without the inventory is the fault this step is here for.)
      if (Date.now() - quietSince > 9000) break;
      await page.waitForTimeout(100);
    }
    if (fought) log('  a pack was upon the hero as the word was found: it was fought first', `${fought} attacks`);
    if (process.env.AMBUSH && !early && !fought) await fail('AMBUSH: the bats never came to be fought');
  }
  log('5 the inventory opened by itself', String(!!s));
  if (!s) { await fail('the inventory never opened for the first word'); return; }
  await page.waitForTimeout(700);
  await snap('09_inventory_coach');
  const slot = `socket:${FIRST[cls].skill}:front:0`;
  const had = (await st()).spare;
  const from = await hands.mark(`word:${w}`);
  const to = await hands.mark(slot);
  if (!from || !to) { await fail(`cannot drag word:${w} to ${slot}: on screen are ${(await hands.marks()).join(', ')}`); return; }
  await hands.dragStart(from.x, from.y, to.x, to.y);
  await page.waitForTimeout(200);
  await snap('10_dragging');
  await hands.dragEnd();
  await page.waitForTimeout(400);
  s = await st();
  log('  dragged onto ' + slot, `${s.names[FIRST[cls].skill]}  (prompt now: ${s.step})`);
  // (set means: it is on the attack, and the pouch holds one word fewer. A pouch that is not empty
  // afterwards is no fault: now and then the first pack gives up two words, as it did in Version
  // 12.1's regression, where this check used to ask for an empty pouch.)
  if (s.front[FIRST[cls].skill][0] !== w || s.spare !== had - 1) await fail(`the drag did not set ${w} on ${slot}: ${JSON.stringify({ front: s.front, held: s.held, spare: s.spare, had })}`);
  await page.waitForTimeout(1000);
  await snap('11_word_set');
  await press('button:DONE');
  s = (await wait((q) => q.panel === 'none', 2000)) ?? (await st());
  if (s.panel !== 'none') await fail(`DONE did not close the inventory (open: ${s.panel})`);

  // ---- use: the dead stir, and the worded attack puts them down ------------------------------------
  s = (await wait((q) => q.risen > 0, 5000)) ?? (await st());
  log('6 the dead stir', `${s.risen} risen (prompt: ${s.step})`);
  if (s.risen === 0) await fail('nothing rose when the word was set');
  if (s.step !== 'use') await fail(`with the word on, the prompt should be "use": it is ${s.step}`);
  await page.waitForTimeout(300);
  await snap('12_the_dead_stir');
  // LATE=<word>: one more word falls at the hero's feet as the dead rise (as TWIN did by chance in
  // Version 14.4's regression). The first word is at work by now: this one is only picked up.
  if (process.env.LATE) {
    const had = s.spare;
    await page.evaluate((word) => { const g = window.__dbg.game(); const h = g.hero; g.drops.push({ x: h.x + 0.2, y: h.y + 0.2, kind: 'word', gold: 0, item: null, word, age: 0 }); }, process.env.LATE);
    // (it is taken up before the hero moves off: a ranger's first act here is a roll away)
    const got = await wait((q) => q.spare > had, 4000);
    log('  a word falls at the hero\'s feet as the dead rise', `${process.env.LATE}${got ? ', and is taken up' : ', AND IS NOT TAKEN UP'}`);
    if (!got) await fail('the word that fell at the hero\'s feet was not taken up');
  }
  const offeredBefore = offered;
  const worded = FIRST[cls].skill;
  const usesBefore = s.uses[worded];
  let hitShot = false;
  n = 0;
  // (two minutes by the clock on the wall. One was enough until Version 13.0's regression, where
  // four playtests shared the machine, the game ran at a third of its speed, and a ranger who
  // shoots the way they face still had two of six up when the minute ended: 92 s then, 25 s alone.)
  for (const t1 = Date.now(); Date.now() - t1 < 120000; n++) {
    s = await st();
    if (!s.guide) break;
    if (await settle(s) || (await shut(s))) continue;
    const used = s.uses[worded] > usesBefore;
    if (s.risen === 0 && used) { await page.waitForTimeout(150); continue; }
    // (with nothing left to aim at, the attack is made toward open ground in front of the hero)
    const x = s.risenAt ? s.risenAt.x : s.hero.x + 40; const y = s.risenAt ? s.risenAt.y - 10 : s.hero.y;
    // the worded attack first, and again and again. A slow one with a quick one between two. The
    // ranger's is the swipe (Trap): a roll away from the dead, who walk onto it, and shots between.
    if (worded === 1) { if (n % 3 === 0 || !used) await slow(x, y, s.w); else await quick(x, y); }
    else if (worded === 2) { if (n % 4 === 0 || !used) await evadeFrom(s, s.risenAt ?? { x: s.hero.x + 40, y: s.hero.y }); else await quick(x, y); }
    else await quick(x, y);
    if (!hitShot && n >= 2) { hitShot = true; await snap('13_using_it'); }
  }
  s = (await wait((q) => !q.guide, 6000)) ?? (await st());
  // (The rest of this playtest is about the starting screen. A word found in that last fight may
  // still be waiting for its quiet moment: it is not offered a place in the middle of what follows,
  // and if the inventory has just opened for it, it is closed.)
  await page.evaluate(() => { window.__dbg.autoWords = false; });
  s = await st();
  if (await shut(s)) s = await st();
  log('  the worded attack was used', `${s.uses[worded] - usesBefore} time(s); risen left: ${s.risen}`);
  if (s.risen > 0) await fail(`${s.risen} of the risen dead were still up after two minutes`);
  if (process.env.LATE) {
    log('  the inventory opened by itself for a word found in this fight', `${offered - offeredBefore} time(s)`);
    if (offered > offeredBefore) await fail('the first word was set, and the game still stopped to open the inventory for a word found after it');
  }
  await page.waitForTimeout(400);
  await snap('14_done');
  }

  // ---- done ---------------------------------------------------------------------------------------
  log('8 steps, as the game recorded them', s.log);
  const steps = s.log.split(' ');
  if (steps[steps.length - 1] !== 'done') await fail(`the guide did not end: its steps were ${s.log}`);
  // (with a word found before the body, there is no "body" step: the body was never needed. And
  // no "take" step either if a monster gave the word up in the thick of the fight and it was
  // picked up there: the fight's prompt was up, and the word's never came. Version 15.0's
  // regression met that: a mage, seed 738615569, on the narrow layout.)
  const order = fl ? ORDER_FL : early ? ORDER.filter((x) => x !== 'body' && (x !== 'take' || steps.includes('take'))) : ORDER;
  let k = 0;
  for (const x of steps) if (x === order[k]) k++;
  if (k < order.length) await fail(`the steps should run ${order.join(' > ')}: they were ${s.log}`);
  log('  taught', String(s.taught));
  if (!s.taught) await fail('meta.taught is not true after the guide');
  if (s.guide || s.step) await fail('prompts are still running after "done"');
  log('  it took (seconds, at this script\'s pace)', Math.round((Date.now() - t0) / 1000));
  log('  attacks at the end', s.names.join(' / '));

  // ---- THE FIRST LEVELS, after the lesson: the second dungeon, and the swipe opens at level 5 ----------
  if (fl) {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      g.enterDungeon();
      // (a quiet start: nothing awake within reach, so that what follows is not a fight)
      for (const m of g.monsters) if (Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 14) m.dead = true;
    });
    await page.waitForTimeout(600);
    s = await st();
    log('9 the second dungeon', `depth ${s.depth}; level ${s.level}; open ${s.open.join(' / ')}`);
    if (s.town || s.depth !== 2) await fail(`after the first dungeon the gate should lead to the second: depth ${s.depth}`);
    if (await hands.mark('skill:2')) await fail('the swipe is shown before level 5');
    await page.evaluate(() => { const g = window.__dbg.game(); while (g.hero.level < 5) g.gainXp(40); });
    const banner = await wait((q) => !!q.toast && q.toast.skill === 2, 3000);
    log('  level 5: the NEW MOVE banner', banner ? 'for the swipe' : 'NOT SHOWN');
    if (!banner) await fail('reaching level 5 showed no NEW MOVE banner for the swipe');
    await page.waitForTimeout(350);
    await snap('17_new_move_level5');
    s = (await wait((q) => q.panel === 'none' && !q.toast, 12000)) ?? (await st());
    const swipeShown = !!(await hands.mark('skill:2'));
    log('  open at level 5: quick / slow / swipe; the swipe shown', `${s.open.join(' / ')}; ${swipeShown}`);
    if (s.open.join() !== 'true,true,true') await fail(`at level 5 all three moves should be open: ${s.open.join(', ')}`);
    if (!swipeShown) await fail('at level 5 the swipe is not shown on the game screen');
    // the swipe, with real input
    const before = s.uses[2];
    for (let i = 0; i < 4 && s.uses[2] <= before; i++) {
      await evade(s);
      s = (await wait((q) => q.uses[2] > before, 1500)) ?? (await st());
    }
    log('  the swipe used, with real input', `${s.uses[2] - before} time(s)`);
    if (s.uses[2] <= before) await fail('at level 5 the swipe did nothing');
    await snap('18_swipe_used');
    // LATE=<word>: a word falls at the hero's feet with the first word set: it is picked up, and the
    // game does not stop to open the inventory for it (the owner, 5 Oct 2026: "After you get your
    // first power word and equip it, the game doesn't need to stop and open the inventory again
    // whenever a word is picked up")
    if (process.env.LATE) {
      const had = s.spare;
      await page.evaluate((word) => { const g = window.__dbg.game(); const h = g.hero; g.drops.push({ x: h.x + 0.2, y: h.y + 0.2, kind: 'word', gold: 0, item: null, word, age: 0 }); }, process.env.LATE);
      const got = await wait((q) => q.spare > had, 4000);
      log('  a word falls at the hero\'s feet in the second dungeon', `${process.env.LATE}${got ? ', and is taken up' : ', AND IS NOT TAKEN UP'}`);
      if (!got) await fail('the word that fell at the hero\'s feet was not taken up');
      await page.waitForTimeout(3000);
      s = await st();
      log('  and the inventory opened by itself for it', String(s.panel === 'inv'));
      if (s.panel === 'inv') { await fail('the first word was set, and the game still stopped to open the inventory for a word found after it'); await press('button:DONE'); }
    }
  }

  // ---- back to the starting screen: the next character begins in town, with no prompts --------------
  await press('button:II');
  await page.waitForTimeout(250);
  await press('button:End run');
  s = (await wait((q) => q.title, 3000)) ?? (await st());
  if (!s.title) { await fail('End run did not lead back to the starting screen'); await page.evaluate(() => window.__dbg.toTitle()); }
  await page.waitForTimeout(400);
  await snap('15_title_again');
  await press('button:NEW GAME');
  await page.waitForTimeout(300);
  await press(`class:${cls}`);
  await page.waitForTimeout(800);
  s = await st();
  log('10 a second NEW GAME', s.title ? 'still on the starting screen' : `town ${s.town}, prompts ${s.guide ? 'on' : 'off'} (${s.step})`);
  if (s.title || !s.town || s.guide || s.step) await fail(`the second character should begin in town with no prompts: ${JSON.stringify({ title: s.title, town: s.town, guide: !!s.guide, step: s.step })}`);
  if (fl && !s.title) {
    // (his answer, 22:19: "No, the ring stays lit (Recommended)": the next hero needs no MASTER RUNE-STONE; and he too starts with the quick attack alone)
    log('  the second hero: the ring / open at level 1', `${s.ring ? 'lit' : 'DARK'} / ${s.open.join(' / ')}`);
    if (!s.ring) await fail('the ring should stay lit for the next hero');
    if (s.open.join() !== 'true,false,false') await fail(`the next hero too should start with the quick attack alone: ${s.open.join(', ')}`);
  }
  await snap('16_second_character_in_town');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) await fail('text asked for characters the fonts cannot draw: ' + missing.join(' '));
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* no storage here */ } });
  log('result', failed ? `${failed} problem(s)` : 'the first dungeon taught everything, in order');
}
