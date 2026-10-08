// A new player's first dungeon, played from the starting screen with real input, the way a person
// would: a mouse and keyboard on a PC, fingers on a phone (run with --touch, sideways or upright).
// NEW GAME, a class card, and straight into dungeon 1, which teaches by prompts (the guide):
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
/** The class's first word, and the attack the first dungeon suggests for it (FIRST_WORD in src/game/defs.ts). */
// (skill: 0 the quick attack, 1 the slow one, 2 the evasive move: the ranger's Poison goes on Trap, which is the swipe since Version 12.2)
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
    return {
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
  // (the two things done by script: see the top of this file)
  await page.evaluate(() => {
    const d = window.__dbg; d.god = true;
    // (a named monster may carry a word of its own, and whoever kills one before reaching the body is
    // prompted about that word instead: this scenario is about the word in the body, so none of them does)
    for (const m of d.game().monsters) if (!m.boss && m.carries && m.carries.length) m.carries = [];
  });
  // (SEED=n plays that dungeon again: the seed of every run is printed, so that one that went wrong can be gone back to)
  if (process.env.SEED) {
    await page.evaluate(([c, n]) => { const d = window.__dbg; d.first(c, n); d.god = true; for (const m of d.game().monsters) if (!m.boss && m.carries && m.carries.length) m.carries = []; }, [cls, Number(process.env.SEED)]);
    await page.waitForTimeout(400);
    s = await st();
  }
  const t0 = Date.now();
  log('  the dungeon\'s seed', String(await page.evaluate(() => window.__dbg.game().seed)));
  log('1 in the first dungeon, the first prompt', s.step);
  if (s.step !== 'move') await fail(`the first prompt should be "move": it is ${s.step}`);
  if (s.held || s.front.some((f) => f.length)) await fail('a new character should start with no word');
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
    for (let r = 5; r <= 7 && best; r += 0.5) for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
      if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && g.free(g.level.walk, x, y, 0.45) && g.sees(x, y, best.x, best.y)) { h.x = x; h.y = y; return true; }
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
  const ticked = (q) => !!q.guide && q.guide.quick && q.guide.slow && q.guide.evade && q.rows.length > 0 && q.rows.every((r) => r.done);
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
    if (n % 4 === 2) await slow(x, y, s.w);
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
    if (n % 5 === 2) await slow(s.near.x, s.near.y - 10, s.w);
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

  // ---- a word before the body? ------------------------------------------------------------------------
  // A named monster can give up a word before the fallen wordsmith is reached. The game then goes
  // straight on to the wordsmithing with that word (the owner: "or once you drop a word of power
  // from a rare mob, you get the prompt to socket the word"), and so does this playtest.
  // EARLY=<word> makes it happen: the word falls at the hero's feet.
  if (process.env.EARLY) {
    await page.evaluate((word) => { const g = window.__dbg.game(); const h = g.hero; g.drops.push({ x: h.x + 0.2, y: h.y + 0.2, kind: 'word', gold: 0, item: null, word, age: 0 }); }, process.env.EARLY);
    await wait((q) => !!q.held, 4000);
  }
  s = await st();
  const early = !!s.held && !!s.body && s.body.state === 0;
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

  // ---- smith: the inventory opens by itself; the word is dragged onto the suggested socket ----------
  // (It opens at the first QUIET moment. A pack that woke far off may be upon the hero just then:
  // the monsters round the body are cleared away before the walk to it, but not a pack that wakes
  // later and comes from further off. A player fights it; so does this; and the inventory must
  // open once that fight is over. AMBUSH=1 makes it happen.)
  if (process.env.AMBUSH && !early) {
    const came = await page.evaluate(() => {
      const g = window.__dbg.game(); const h = g.hero; const walk = g.level.walk;
      let n = 0;
      for (let k = 0; k < 40 && n < 3; k++) {
        const a = (k / 40) * Math.PI * 2 + 0.9; const r = 6 + (k % 3);
        const x = h.x + Math.cos(a) * r; const y = h.y + Math.sin(a) * r;
        if (!g.free(walk, x, y, 0.45)) continue;
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

  // ---- done ---------------------------------------------------------------------------------------
  log('7 steps, as the game recorded them', s.log);
  const steps = s.log.split(' ');
  if (steps[steps.length - 1] !== 'done') await fail(`the guide did not end: its steps were ${s.log}`);
  // (with a word found before the body, there is no "body" step: the body was never needed. And
  // no "take" step either if a monster gave the word up in the thick of the fight and it was
  // picked up there: the fight's prompt was up, and the word's never came. Version 15.0's
  // regression met that: a mage, seed 738615569, on the narrow layout.)
  const order = early ? ORDER.filter((x) => x !== 'body' && (x !== 'take' || steps.includes('take'))) : ORDER;
  let k = 0;
  for (const x of steps) if (x === order[k]) k++;
  if (k < order.length) await fail(`the steps should run ${order.join(' > ')}: they were ${s.log}`);
  log('  taught', String(s.taught));
  if (!s.taught) await fail('meta.taught is not true after the guide');
  if (s.guide || s.step) await fail('prompts are still running after "done"');
  log('  it took (seconds, at this script\'s pace)', Math.round((Date.now() - t0) / 1000));
  log('  attacks at the end', s.names.join(' / '));

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
  log('8 a second NEW GAME', s.title ? 'still on the starting screen' : `town ${s.town}, prompts ${s.guide ? 'on' : 'off'} (${s.step})`);
  if (s.title || !s.town || s.guide || s.step) await fail(`the second character should begin in town with no prompts: ${JSON.stringify({ title: s.title, town: s.town, guide: !!s.guide, step: s.step })}`);
  await snap('16_second_character_in_town');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) await fail('text asked for characters the fonts cannot draw: ' + missing.join(' '));
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* no storage here */ } });
  log('result', failed ? `${failed} problem(s)` : 'the first dungeon taught everything, in order');
}
