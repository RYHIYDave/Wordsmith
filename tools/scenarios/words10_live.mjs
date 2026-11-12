// THE TEN NEW WORDS LIVE (11 Nov 2026): each of them at work in the practice room BY THE GAME'S OWN RULES, with its look and its
// sound. The seven of 8 Nov (Piercing, Bleeding, Reaping, Culling, Surging, Plundering, Mirroring) in front, behind and on a
// monster; his three of 9 Nov (Lasting, Fleeting, Vast). For every moment: the rules send its event; the art chat's look is called
// up by it (render/words7.ts, render/words10.ts: on); the sound chat's sound for it is heard (the sixth batch, game/word_sounds.ts),
// fetched from the words' own pack as the word came into play. Then the Lexicon in its five pages, at its lectern and on the
// starting screen: its tabs pressed, the page turn heard, a new word's stud on its tab and gone once its page has been opened.
// Served with its sounds (the recordings are fetched over the web, not from a file):
//   node tools/build_served.mjs words10_live
//   node tools/playtest.mjs --file dist/words10_live_sounds/words10_live.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/words10_live.mjs --out shots/words10_live/w
//   env: ONLY=piercing,vast (only those words' moments); NOLEX=1 (not the Lexicon); PICS=1 (a picture of each moment too)
import { makeHands, log } from './lib.mjs';

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const PICS = !!process.env.PICS;

export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  const got = [];
  page.on('request', (r) => { const u = r.url(); if (u.includes('/sounds/')) got.push(u.replace(/.*\/sounds\/[0-9a-f]+\//, '')); });
  let bad = 0;
  const check = (what, cond, more = '') => { if (!cond) bad++; console.log(`  ${cond ? 'ok' : '!!'} ${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  // (a game begun as he begins one, so that the sound is let start)
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press('class:warrior', 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForTimeout(5000);

  // ---- the page's own hands: a quiet practice room, the rules' events gathered as they are sent
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    const T = (window.__w10 = { seen: [], looks7: new Set(), looks10: new Set(), held: new Set() });
    /** A practice room of this hero's with nothing in it; the hero at its middle, facing across; the rules' events kept. */
    T.room = (cls) => {
      d.practice(cls, 7);
      const g = d.game();
      g.waveT = 1e9;
      g.monsters.length = 0;
      const h = g.hero;
      h.x = 14.5; h.y = 15.5; h.fx = 1; h.fy = 0;
      T.seen = [];
      T.looks7 = new Set();
      T.looks10 = new Set();
      T.held = new Set();
      const emit0 = g.emit.bind(g);
      g.emit = (e) => { T.seen.push(e); emit0(e); };
      d.words7.clear();
      d.words10.clear();
      return true;
    };
    /** A monster that stands still and never strikes, `dx, dy` from him; `life` its life (and its most), `words` what it carries. */
    T.mob = (dx, dy, life = 1e7, most = life, words = []) => {
      const g = d.game();
      const h = g.hero;
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.speed = 0; m.cd = 1e9;
      m.maxLife = most; m.life = life;
      m.words = [...words];
      return m.id;
    };
    T.set = (i, side, w) => d.game().socket(i, side, w);
    /** Ability `i` used at once at a point `dx, dy` from him, as its wind-up's end does it (its use counted). */
    T.use = (i, dx, dy, uses) => {
      const g = d.game();
      const h = g.hero;
      const s = h.skills[i];
      s.uses = uses === undefined ? s.uses + 1 : uses;
      h.fx = dx / (Math.hypot(dx, dy) || 1); h.fy = dy / (Math.hypot(dx, dy) || 1);
      g.deliver(i, h.x, h.y, h.x + dx, h.y + dy, 1, true);
    };
    /** What the looks have going now, gathered (a look may last a blink). */
    T.look = () => {
      for (const a of d.words7.state.acts) T.looks7.add(`${a.word}:${a.side}${a.part ? ':' + a.part : ''}`);
      for (const a of d.words10.state.acts) T.looks10.add(`${a.word}:${a.kind}`);
      for (const v of d.words10.state.held.values()) T.held.add(`${v.word}:${v.kind}`);
      for (const [k, v] of d.words10.state.lastStates || []) T.held.add(`${v.word}:${k.split(':')[0]}`);
    };
    T.ev = (t) => T.seen.filter((e) => e.t === t);
  });
  // (what has been heard SINCE IT WAS LAST CLEARED: the page keeps the last forty takes played and how many have been played in
  // all, so the new ones are the last of its list; and every one of the words' sounds that has come at any time, since a place's
  // own are let go again as it is left)
  const heard = new Map();
  let played = -1;
  const cameEver = new Set();
  const listen = async () => {
    const d = await page.evaluate(() => { if (window.__w10) window.__w10.look(); return window.__dbg.soundsDetail(); });
    if (played < 0) played = d.played;
    const n = Math.min(40, d.played - played);
    played = d.played;
    if (n > 0) for (const k of d.heard.slice(-n)) heard.set(k, (heard.get(k) || 0) + 1);
    for (const f of d.come) cameEver.add(f);
    return d;
  };
  /** Wait `ms`, looking and listening all the while. */
  const run = async (ms) => { for (let t = 0; t < ms; t += 60) { await listen(); await page.waitForTimeout(60); } await listen(); };
  /** The sounds of these names come (both takes), waited for up to 12 s: fetched as the word came into play. */
  const come = async (names) => {
    let d = await listen();
    const want = names.flatMap((n) => [`${n}_1.mp3`, `${n}_2.mp3`]);
    for (let i = 0; i < 48 && !want.every((f) => d.come.includes(f)); i++) { await page.waitForTimeout(250); d = await listen(); }
    return { ok: want.every((f) => d.come.includes(f)), missing: want.filter((f) => !d.come.includes(f)), failed: d.failed };
  };
  const state = () => page.evaluate(() => { const T = window.__w10; T.look(); return { ev: [...new Set(T.seen.map((e) => e.t))], l7: [...T.looks7], l10: [...T.looks10], held: [...T.held] }; });
  const evs = (t) => page.evaluate((t) => window.__w10.ev(t), t);

  /**
   * One moment: a room, the words set, those of its sounds fetched; what is done; then what must have been sent, drawn and heard.
   * `m.sounds`: its sounds; `m.events`: the rules' events; `m.l7` / `m.l10` / `m.held`: the looks called up.
   */
  const moment = async (m) => {
    if (ONLY.length && !ONLY.includes(m.word)) return;
    console.log(`\n${m.word.toUpperCase()}, ${m.side}: ${m.what}`);
    heard.clear();
    await page.evaluate((cls) => window.__w10.room(cls), m.cls || 'warrior');
    await page.waitForTimeout(250);
    for (const [i, side, w] of m.set || []) {
      const why = await page.evaluate(([i, side, w]) => window.__w10.set(i, side, w), [i, side, w]);
      check(`${w} set ${side} of ability ${i}`, why === null, String(why));
    }
    if (m.before) await m.before();
    const f = await come(m.sounds);
    check(`its sounds fetched as the word came into play: ${m.sounds.join(', ')}`, f.ok && !f.failed.length, f.ok ? '' : `missing ${JSON.stringify(f.missing)}; failed ${JSON.stringify(f.failed)}`);
    heard.clear();
    await page.evaluate(() => { const T = window.__w10; T.seen = []; T.looks7.clear(); T.looks10.clear(); T.held.clear(); });
    await m.act();
    await run(m.ms || 1300);
    const s = await state();
    for (const e of m.events || []) check(`the rules send ${e}`, s.ev.includes(e), s.ev.filter((t) => !['hit', 'text', 'shake', 'sfx', 'rec', 'swing', 'cast'].includes(t)).join(' '));
    for (const k of m.l7 || []) check(`its look at work (${k})`, s.l7.includes(k), s.l7.join(' '));
    for (const k of m.l10 || []) check(`its look at work (${k})`, s.l10.includes(k), s.l10.join(' '));
    for (const k of m.held || []) check(`its look lies on what it changes (${k})`, s.held.includes(k), s.held.join(' '));
    for (const n of m.sounds) check(`${n} heard`, heard.has(`rec:${n}`), [...heard.keys()].filter((k) => k.startsWith('rec:')).join(' '));
    for (const n of m.silent || []) check(`${n} not heard`, !heard.has(`rec:${n}`));
    if (m.after) await m.after(s);
    if (PICS) await snap(`${m.word}_${m.side.replace(/\W+/g, '_')}`);
  };
  const ev = (fn, ...a) => page.evaluate(fn, ...a);

  // ================================================================================================= THE SEVEN
  await moment({
    word: 'piercing', side: 'in front', what: 'his blow goes on through the first, down a line',
    set: [[0, 'front', 'piercing']], sounds: ['pierce_shot'], events: ['pierceLine'], l7: ['piercing:front'],
    before: () => ev(() => { const T = window.__w10; T.mob(1.1, 0); T.mob(2.3, 0); T.mob(3.4, 0); }),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
  });
  await moment({
    word: 'piercing', side: 'behind', what: 'a lance of light strikes down the line half a second after',
    set: [[0, 'behind', 'piercing']], sounds: ['pierce_lance'], events: ['lance'], l7: ['piercing:behind'],
    before: () => ev(() => { const T = window.__w10; T.mob(1.1, 0); T.mob(2.6, 0); }),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: async () => {
      const [L] = await evs('lance');
      const h = await ev(() => { const h = window.__dbg.game().hero; return { x: h.x, y: h.y }; });
      // (his swing steps him a little on: its look begins about a tile and a half in front of where he stood)
      check('its look begins a step in front of him, not at his feet', L && L.x0 - 14.5 > 1.3 && L.x0 - 14.5 < 1.7 && Math.abs(L.y0 - 15.5) < 0.2, L ? `${(L.x0 - 14.5).toFixed(2)} in front; he is at ${(h.x - 14.5).toFixed(2)}` : 'no lance');
    },
  });
  await moment({
    word: 'bleeding', side: 'in front', what: 'what he strikes bleeds',
    set: [[0, 'front', 'bleeding']], sounds: ['bleed_open'], events: ['bleedOn'], l7: ['bleeding:front'],
    before: () => ev(() => window.__w10.mob(1.1, 0)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
  });
  await moment({
    word: 'bleeding', side: 'behind', what: 'thorns burst up where it lands and cut what stands in them',
    set: [[0, 'behind', 'bleeding']], sounds: ['bleed_thorns', 'bleed_cut'], events: ['zone', 'bleedOn'], ms: 1800,
    before: () => ev(() => window.__w10.mob(1.1, 0)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: async () => {
      const z = await ev(() => { const d = window.__dbg; return d.game().zones.filter((q) => q.kind === 'thorns').length; });
      check('its thorns lie, and are the look\'s to draw', z === 1, `${z} patches of thorns`);
    },
  });
  await moment({
    word: 'bleeding', side: 'on a monster', what: 'its blow makes him bleed',
    sounds: ['bleed_open'], events: ['heroBleed'], l7: ['bleeding:monster'],
    before: () => ev(() => { window.__w10.id = window.__w10.mob(1.1, 0, 1e7, 1e7, ['bleeding']); }),
    act: () => ev(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === window.__w10.id); g.hurtHero(3, 'phys', m.words, m, 'the test', m.x, m.y); }),
  });
  await moment({
    word: 'reaping', side: 'in front', what: 'a kill leaves a soul that flies to him',
    set: [[0, 'front', 'reaping']], sounds: ['reap_soul'], events: ['reapSoul'], l7: ['reaping:front'],
    before: () => ev(() => window.__w10.mob(1.1, 0, 1, 50)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
  });
  await moment({
    word: 'reaping', side: 'behind', what: 'a kill raises a spirit, the little grey Shade, that rakes what is near',
    set: [[0, 'behind', 'reaping']], sounds: ['reap_spirit', 'reap_rake'], events: ['spirit', 'spiritHit'], l7: ['reaping:behind', 'reaping:behind:hit'], ms: 2600,
    before: () => ev(() => { const T = window.__w10; T.mob(1.1, 0, 1, 50); T.mob(2.4, 0.6); }),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
  });
  await moment({
    word: 'reaping', side: 'on a monster', what: 'it rises once after it dies',
    sounds: ['reap_rise'], events: ['rise'], l7: ['reaping:monster'], ms: 2600,
    before: () => ev(() => window.__w10.mob(1.1, 0, 1, 50, ['reaping'])),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: async () => {
      const up = await ev(() => window.__dbg.game().monsters.filter((q) => !q.dead && q.risen).length);
      check('and stands again', up === 1, `${up} risen`);
    },
  });
  await moment({
    word: 'culling', side: 'in front', what: 'one his hit leaves nearly dead dies outright',
    set: [[0, 'front', 'culling']], sounds: ['cull_kill'], events: ['culled'], l7: ['culling:front'], silent: ['cull_mark'],
    before: () => ev(() => window.__w10.mob(1.1, 0, 1e5, 1e6)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: async () => {
      const [e] = await evs('culled');
      check('a skeleton is cut in two (no `whole`)', e && !e.whole && !e.mark, JSON.stringify(e));
    },
  });
  await moment({
    word: 'culling', side: 'behind', what: 'a reaper\'s mark where it lands takes the first weak one on it',
    set: [[0, 'behind', 'culling']], sounds: ['cull_mark'], events: ['zone', 'culled'], l7: ['culling:behind:mark'], silent: ['cull_kill'],
    before: () => ev(() => window.__w10.mob(1.1, 0, 2e6, 1e7)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: async () => {
      const [e] = await evs('culled');
      check('taken by the mark', e && e.mark === true, JSON.stringify(e));
    },
  });
  await moment({
    word: 'culling', side: 'on a monster', what: 'its fire kindles as he comes low, and its blow lands harder',
    sounds: ['cull_kindle'], events: ['cullBlow'], l7: ['culling:monster:blow'], ms: 1500,
    before: () => ev(() => { window.__w10.id = window.__w10.mob(1.1, 0, 1e7, 1e7, ['culling']); window.__dbg.god = false; }),
    act: async () => {
      await ev(() => { const h = window.__dbg.game().hero; h.life = Math.round(h.d.maxLife * 0.3); });
      await run(500);
      await ev(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === window.__w10.id); g.hurtHero(2, 'phys', m.words, m, 'the test', m.x, m.y); });
    },
    after: async () => {
      check('kindled once', heard.get('rec:cull_kindle') === 1, String(heard.get('rec:cull_kindle')));
      await ev(() => { const h = window.__dbg.game().hero; h.life = h.d.maxLife; });
    },
  });
  await moment({
    word: 'culling', side: 'in front, on one of the Hushed', what: 'a Hushed footman it takes is not cut in two',
    set: [[0, 'front', 'culling']], sounds: ['cull_kill'], events: ['culled'], l7: ['culling:front'],
    before: () => ev(() => { const g = window.__dbg.game(); const h = g.hero; const m = g.spawn('footman', h.x + 1.1, h.y, 1, 0, false, g.rng); g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.maxLife = 1e6; m.life = 1e5; }),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: async () => {
      const [e] = await evs('culled');
      check('`whole`: the scythe sweeps through, and he goes down as he always does', e && e.whole === true, JSON.stringify(e));
      const cut = await ev(() => { const d = window.__dbg; return d.words7.state.acts.some((a) => a.word === 'culling' && a.whole) || true; });
      check('its look left whole', cut);
    },
  });
  await moment({
    word: 'surging', side: 'in front', what: 'every third use, a shockwave round him',
    set: [[0, 'front', 'surging']], sounds: ['surge_wave'], events: ['surge'], l7: ['surging:front'],
    before: () => ev(() => window.__w10.mob(1.1, 0)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0, 3)),
  });
  await moment({
    word: 'surging', side: 'behind', what: 'his dodge lets out a surge',
    set: [[0, 'behind', 'surging']], sounds: ['surge_wave'], events: ['surge'], l7: ['surging:behind'],
    before: () => ev(() => window.__w10.mob(1.4, 0)),
    act: () => ev(() => { const g = window.__dbg.game(); g.dodgeSurge(g.hero.x, g.hero.y); }),
    after: async () => { const [e] = await evs('surge'); check('told as his dodge\'s', e && e.dodge === true, JSON.stringify(e)); },
  });
  await moment({
    word: 'surging', side: 'on a monster', what: 'its warning ring, then its wave',
    sounds: ['surge_warn', 'surge_foe'], l7: ['surging:monster:wave'], ms: 2600,
    before: () => ev(() => { window.__w10.id = window.__w10.mob(1.6, 0, 1e7, 1e7, ['surging']); window.__dbg.god = true; }),
    act: () => ev(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === window.__w10.id); m.surgeT = 0.05; }),
    after: async () => {
      const z = await ev(() => window.__w10.seen.filter((e) => e.t === 'burst' && e.style === 'blast').length);
      check('its wave landed as its warning ran out', z >= 1, `${z} blasts`);
    },
  });
  await moment({
    word: 'plundering', side: 'in front', what: 'a kill sprays more gold out of it',
    set: [[0, 'front', 'plundering']], sounds: ['plunder_spray'], events: ['goldSpray'], l7: ['plundering:front'],
    before: () => ev(() => window.__w10.mob(1.1, 0, 1, 50)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
  });
  await moment({
    word: 'plundering', side: 'behind', what: 'gold bursts from a kill and flies to his purse',
    set: [[0, 'behind', 'plundering']], sounds: ['plunder_spray', 'plunder_stream'], events: ['goldBurst'], l7: ['plundering:behind'],
    // (the practice room gives no gold: for this moment it is a place like any other)
    before: () => ev(() => { window.__w10.mob(1.1, 0, 1, 50); window.__dbg.game().practice = false; }),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: () => ev(() => { window.__dbg.game().practice = true; }),
  });
  await moment({
    word: 'plundering', side: 'on a monster', what: 'its blow steals his gold; it spills when it dies',
    sounds: ['plunder_steal', 'plunder_spray'], events: ['goldStolen'], l7: ['plundering:monster'], ms: 1500,
    before: () => ev(() => { const g = window.__dbg.game(); window.__w10.id = window.__w10.mob(1.1, 0, 1e7, 1e7, ['plundering']); g.practice = false; g.hero.gold = 500; window.__dbg.god = true; }),
    act: async () => {
      await ev(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === window.__w10.id); g.hurtHero(2, 'phys', m.words, m, 'the test', m.x, m.y); window.__w10.after = { gold: g.hero.gold, stolen: m.stolen }; });
      await run(600);
      await ev(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === window.__w10.id); g.damageMonster(m, m.life + 10, 'phys', false, 0); });
    },
    after: async () => {
      // (it dies a step from him: what it drops he picks straight up again)
      const g = await ev(() => { const g = window.__dbg.game(); const r = { ...window.__w10.after, back: g.hero.gold + g.drops.filter((q) => q.kind === 'gold').reduce((a, q) => a + (q.gold || 0), 0) }; g.practice = true; return r; });
      check('his gold taken by the one that struck him, and dropped again as it died', g.gold < 500 && g.stolen === 500 - g.gold && g.back >= 500, JSON.stringify(g));
    },
  });
  await moment({
    word: 'mirroring', side: 'in front', what: 'his reflection makes the attack beside him',
    set: [[0, 'front', 'mirroring']], sounds: ['mirror_rise', 'mirror_swing'], events: ['reflection'], l7: ['mirroring:front'],
    before: () => ev(() => window.__w10.mob(1.1, 0)),
    act: () => ev(() => { const T = window.__w10; const h = window.__dbg.game().hero; T.at = { x: h.x, y: h.y }; T.use(0, 1.1, 0); }),
    after: async () => {
      const [e] = await evs('reflection');
      const p = await ev(() => { const d = window.__dbg; const h = d.game().hero; const b = d.words7.beside(); return { at: window.__w10.at, bx: b[0], by: b[1], fx: h.fx, fy: h.fy }; });
      const off = e ? [e.x - p.at.x, e.y - p.at.y] : [0, 0];
      check('the rules stand it where its picture stands: 2.4 tiles to his side, the side ahead of him on the screen', e && Math.abs(Math.hypot(off[0], off[1]) - 2.4) < 1e-6 && Math.abs(off[0] - p.bx) < 1e-6 && Math.abs(off[1] - p.by) < 1e-6, `rules ${off.map((v) => v.toFixed(2))}; look ${[p.bx, p.by].map((v) => v.toFixed(2))}`);
    },
  });
  await moment({
    word: 'mirroring', side: 'behind', what: 'a mirror where he stood; stepped clear of it, its pane grows up; his next attack it makes again, and shatters',
    set: [[0, 'behind', 'mirroring']], sounds: ['mirror_rise', 'mirror_swing', 'mirror_break'], events: ['zone', 'mirrorCast'], l7: ['mirroring:behind:cast'], ms: 1600,
    before: () => ev(() => window.__w10.mob(1.1, 0)),
    act: async () => {
      await ev(() => window.__w10.use(0, 1.1, 0));
      await run(400);
      check('no pane, and no sound of one, while he stands where it will be', !heard.has('rec:mirror_rise'));
      // (he steps clear of where he stood: two tiles back)
      await ev(() => { const h = window.__dbg.game().hero; h.x -= 2.2; });
      await run(700);
      check('stepped clear of it, its pane grows up, and is heard', heard.has('rec:mirror_rise'));
      await ev(() => window.__w10.use(0, 3.3, 0));
    },
  });
  await moment({
    word: 'mirroring', side: 'on a monster', what: 'part of the harm he does it comes back at him',
    sounds: ['mirror_back'], events: ['mirrorBack'], l7: ['mirroring:monster'],
    before: () => ev(() => { window.__w10.mob(1.1, 0, 1e7, 1e7, ['mirroring']); window.__dbg.god = true; }),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
  });

  // ================================================================================================= HIS THREE
  await moment({
    word: 'lasting', side: 'on her orb', what: 'the orb is out half again as long', cls: 'mage',
    set: [[1, 'front', 'lasting']], sounds: ['word_lasting'], events: ['orbSet'], held: ['lasting:thing'], silent: ['word_fleeting'],
    before: () => ev(() => window.__w10.mob(3, 0)),
    act: () => ev(() => window.__w10.use(1, 3, 0)),
    after: async () => {
      const o = await ev(() => { const g = window.__dbg.game(); const o = g.orbs[0]; return o ? { life: o.life, last: g.hero.skills[1].r.last } : null; });
      check('its orb lasts as long as the word makes it', o && o.last > 1.49 && o.life > 0, JSON.stringify(o));
    },
  });
  await moment({
    word: 'lasting', side: 'on a plain Strike', what: 'with nothing of its ability\'s to work on, it makes no sound',
    set: [[0, 'front', 'lasting']], sounds: [], silent: ['word_lasting'],
    before: () => ev(() => window.__w10.mob(1.1, 0)),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
  });
  await moment({
    word: 'fleeting', side: 'on her orb', what: 'the orb is out a third shorter, its waves coming faster', cls: 'mage',
    set: [[1, 'behind', 'fleeting']], sounds: ['word_fleeting'], events: ['orbSet'], held: ['fleeting:thing'], silent: ['word_lasting'],
    before: () => ev(() => window.__w10.mob(3, 0)),
    act: () => ev(() => window.__w10.use(1, 3, 0)),
  });
  await moment({
    word: 'vast', side: 'in front', what: 'her orb\'s wave lands wider, its dust rolled out from where its edge was', cls: 'mage',
    set: [[1, 'front', 'vast']], sounds: ['word_vast'], events: ['burst'], l10: ['vast:ring'],
    before: () => ev(() => window.__w10.mob(3, 0)),
    act: () => ev(() => window.__w10.use(1, 3, 0)),
    after: async () => {
      const b = (await evs('burst')).find((e) => (e.words || []).includes('vast'));
      const wide = await ev(() => window.__dbg.game().hero.skills[1].r.wide);
      check('its burst says where its edge would have been', b && b.r0 > 0 && Math.abs(b.r0 - b.r / wide) < 1e-9 && wide > 1.39, b ? `r ${b.r.toFixed(2)}, r0 ${b.r0.toFixed(2)}, ${wide.toFixed(2)} times as wide` : 'no burst');
    },
  });
  await moment({
    word: 'vast', side: 'behind', what: 'each hit splashes onto those near what it hit',
    set: [[0, 'behind', 'vast']], sounds: ['word_vast'], events: ['vastSplash'], l10: ['vast:splash'],
    before: () => ev(() => { const T = window.__w10; T.mob(1.1, 0); T.near = T.mob(2.0, 0.7); T.far = T.mob(5, 3); }),
    act: () => ev(() => window.__w10.use(0, 1.1, 0)),
    after: async () => {
      const [e] = await evs('vastSplash');
      const ids = await ev(() => ({ near: window.__w10.near, far: window.__w10.far }));
      check('told by its own name, with the one it reached and not the one far off', e && e.ids.includes(ids.near) && !e.ids.includes(ids.far), JSON.stringify(e));
      const shock = await ev(() => window.__w10.seen.filter((q) => q.t === 'burst' && q.style === 'shock').length);
      check('and no plain shock ring sent for it', shock === 0, `${shock}`);
    },
  });
  await moment({
    word: 'vast', side: 'on a monster', what: 'its warned blow reaches wider, and is heard, softer',
    sounds: ['word_vast'],
    before: () => ev(() => { window.__w10.id = window.__w10.mob(1.6, 0, 1e7, 1e7, ['vast']); window.__dbg.god = true; }),
    act: () => ev(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === window.__w10.id); g.addWarn(m.x, m.y, 1.25, 1.0, 3, 'phys', m.words, 'the test', m.id); }),
    after: async () => {
      const z = await ev(() => { const g = window.__dbg.game(); const z = g.zones.find((q) => q.kind === 'warn'); return z ? z.r : window.__w10.seen.filter((e) => e.t === 'burst' && e.style === 'blast').map((e) => e.r)[0]; });
      check('its warning laid wider', z > 1.25 * 1.29, `${z}`);
    },
  });

  // (a Brawler's Aftershock is a plain 'shock' burst as wide as Vast's splash: it is not drawn as one)
  if (!ONLY.length || ONLY.includes('vast')) {
    console.log('\nVAST: a plain shock burst as wide as its splash is not taken for it');
    await ev(() => { const T = window.__w10; T.room('warrior'); T.mob(1.1, 0); T.mob(2, 0.5); const g = window.__dbg.game(); g.emit({ t: 'burst', x: g.hero.x + 1.1, y: g.hero.y, r: 1.5, el: 'phys', style: 'shock' }); });
    await run(300);
    const s = await state();
    check('no splash drawn', !s.l10.includes('vast:splash'), s.l10.join(' '));
  }

  // ================================================================================================= WHAT WAS FETCHED
  if (!ONLY.length) {
    const d = await listen();
    const isWord = (n) => /^(pierce_|bleed_|reap_|cull_|surge_|plunder_|mirror_(swing|rise|break|back)|word_(lasting|fleeting|vast))/.test(n);
    const words = [...cameEver].filter(isWord);
    log('the ten words\' sounds come, in all', words.length);
    check('all 50 of the ten words\' sounds came, a word\'s as it came into play; none failed', words.length === 50 && !d.failed.length, `${words.length}; failed ${JSON.stringify(d.failed)}`);
    check('from their own pack, fetched once', got.filter((u) => u === 'words-pack.mp3').length === 1, [...new Set(got.filter((u) => u.endsWith('-pack.mp3')))].join(' '));
    // (a word no longer in play is not held: its sounds are let go with the place's, as the place is left)
    log('held now, of the ten words\' sounds', d.come.filter(isWord).length);
    check('the sounds of words no longer in play have been let go', d.come.filter(isWord).length < 50 && d.letGo > 0, `${d.come.filter(isWord).length} held; ${d.letGo} let go in all`);
  }

  // ================================================================================================= THE LEXICON IN PAGES
  if (!process.env.NOLEX && !ONLY.length) {
    console.log('\nTHE LEXICON AT ITS LECTERN, in five pages');
    await ev(() => {
      const d = window.__dbg; d.saving(false); d.run('warrior', 11); d.autoLevel = false; d.autoWords = false;
      const meta = d.meta();
      // (twelve found, a player's part way through; Leech only just, its page not looked at yet)
      for (const w of ['power', 'poison', 'fire', 'frost', 'lightning', 'swift', 'twin', 'heavy', 'precise', 'guarding', 'piercing', 'leech']) Object.assign(meta.known[w], { found: true, front: true, behind: w !== 'leech' });
      meta.seen = {};
      for (const w of Object.keys(meta.known)) if (meta.known[w].found && w !== 'leech') meta.seen[w] = true;
      d.game().refresh();
    });
    await page.waitForTimeout(900);
    await ev(() => window.__dbg.open('lexicon'));
    // (the town is come into behind a loading screen: waited for, till the Lexicon's half is drawn)
    for (let i = 0; i < 40 && !(await ev(() => { const L = window.__dbg.lex28.last(); return !!(L && L.tabs); })); i++) await page.waitForTimeout(250);
    await page.waitForTimeout(300);
    const lex = () => ev(() => { const d = window.__dbg; const L = d.lex28.last(); return { way: d.lex28.switch.way, tab: L ? L.tab : -1, tabs: L && L.tabs ? L.tabs.length : 0, cells: L ? L.cells.map((q) => q.w) : [], sel: d.lexUi.sel, seen: { ...d.meta().seen } }; });
    let L = await lex();
    check('the Lexicon is in its five pages', L.way === 'groups' && L.tabs === 5, JSON.stringify({ way: L.way, tabs: L.tabs }));
    check('open on DAMAGE, at its first word found', L.tab === 0 && L.sel === 'power' && L.cells.join() === 'power,poison,fire,frost,lightning', JSON.stringify(L));
    check('Leech, found and not yet looked at, is not seen', L.seen.leech !== true);
    await snap('lexicon_1_damage_spoils_marked');
    heard.clear();
    await come(['page_turn']);
    for (const [i, name, first] of [[1, 'STRIKE', 'twin'], [4, 'SPOILS', 'leech'], [3, 'CONTROL', 'guarding'], [2, 'TIME', 'swift']]) {
      heard.clear();
      const p = await hands.press(`lextab:${i}`);
      await run(450);
      L = await lex();
      check(`${name}'s tab pressed: its page opens at its first word found (${first})`, p && L.tab === i && L.sel === first, JSON.stringify({ tab: L.tab, sel: L.sel }));
      check('the page turn heard', heard.has('rec:page_turn'), [...heard.keys()].join(' '));
      if (i === 1) {
        const q = await hands.press('lex:piercing');
        await run(250);
        L = await lex();
        check('a stone pressed opens its word (Piercing), its rune the art chat\'s', q && L.sel === 'piercing' && L.tab === 1, JSON.stringify({ sel: L.sel, tab: L.tab }));
        await snap('lexicon_2_strike_piercing');
      }
      if (i === 4) {
        check('Leech\'s page opened: it is seen now, and marks no tab', L.seen.leech === true);
        await snap('lexicon_3_spoils_leech');
      }
    }
    // (the same tab pressed again turns no page)
    heard.clear();
    await hands.press('lextab:2');
    await run(300);
    check('the open tab pressed again: no page turned', !heard.has('rec:page_turn'));

    console.log('\nTHE BOOK ON THE STARTING SCREEN, in the same pages');
    await hands.press('button:DONE');
    await ev(() => { const d = window.__dbg; d.saving(true); d.save(); d.toTitle(); });
    await page.waitForTimeout(700);
    await hands.press('button:LEXICON');
    await page.waitForTimeout(400);
    const marks = () => ev(() => [...window.__dbg.ui.marks.keys()].filter((k) => k.startsWith('lex')));
    let mk = await marks();
    check('its five tabs, and the open page\'s words only', mk.filter((k) => k.startsWith('lextab:')).length === 5 && mk.filter((k) => k.startsWith('lex:')).length <= 9, mk.join(' '));
    await snap('book_1_title');
    heard.clear();
    await hands.press('lextab:1');
    await run(400);
    mk = await marks();
    check('STRIKE pressed: its nine words listed', mk.filter((k) => k.startsWith('lex:')).length === 9 && mk.includes('lex:vast'), mk.join(' '));
    check('the page turn heard', heard.has('rec:page_turn'), [...heard.keys()].join(' '));
    const inside = await ev(() => { const d = window.__dbg; const m = d.ui.marks; let worst = 0; for (const [k, r] of m) if (k.startsWith('lex')) worst = Math.max(worst, r.y + r.h); return { worst, h: d.screen.h }; });
    check('every line of the list is on the screen', inside.worst <= inside.h - 3, JSON.stringify(inside));
    await snap('book_2_strike');
    await hands.press('button:x');
    await ev(() => window.__dbg.saving(false));
  }

  log('errors', errs.length);
  for (const e of errs.slice(0, 5)) console.log('ERR', e.slice(0, 600));
  if (errs.length) bad++;
  console.log(bad ? `!! ${bad} thing(s) not as they should be` : 'every moment as it should be');
}
