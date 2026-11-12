// THE EIGHT MELDS ACROSS THE GROUPS AT WORK (render/melds8.ts, behind MELDS8_LOOK, switched on for this page only): the practice
// room's Warrior, a few enemies set by him, each meld's moment sent by hand as its rules will send it (the rules are the main
// chat's, on its branch melds8: here the page does what they will, the poison, the burning, the freeze, the stun, the block, the
// pull), in front and then behind (k 0.5). Filmed frame by frame, 30 a second, the game's clock stepped so that no frame is missed.
//   node tools/build_to.mjs dist/melds8_looks.html
//   LOOK=siphon node tools/playtest.mjs --file dist/melds8_looks.html --size 852x393 --dpr 3 --touch \
//     --scenario tools/scenarios/melds8_looks.mjs --out shots/melds8/siphon
// LOOK: siphon | cauterize | forking | shiver | sunder | fervor | rimeward | implode. Frames: <out>_f0000.png on, cut round him.
export default async function (page, snap) {
  const look = process.env.LOOK || 'siphon';
  const bad = (s) => console.log(`  !! ${s}`);
  const outAt = process.argv.indexOf('--out');
  const out = outAt >= 0 ? process.argv[outAt + 1] : 'shots/melds8/x';
  void snap;

  // who stands where, in tiles across and down the screen from him (+across: right; +down: toward you)
  const layouts = {
    siphon: [['cultist', 2.2, -0.4, 'a'], ['skeleton', 1.4, 1.5, 'b']],
    cauterize: [['cultist', 1.25, -0.2, 'a'], ['skeleton', 1.3, 1.4, 'b']],
    forking: [['skeleton', 1.25, -0.2, 'a'], ['cultist', 2.9, 0.6, 'b'], ['skeleton', 2.4, -1.6, 'c']],
    shiver: [['skeleton', 1.25, -0.2, 'a'], ['cultist', 1.1, 1.5, 'b']],
    sunder: [['brute', 1.4, -0.2, 'a'], ['skeleton', 1.2, 1.6, 'b']],
    fervor: [['skeleton', 1.2, -0.3, 'a'], ['skeleton', 1.0, 1.0, 'b'], ['cultist', -0.2, 1.3, 'c'], ['skeleton', -1.2, 0.6, 'd'], ['skeleton', -1.1, -0.8, 'e']],
    rimeward: [['skeleton', 1.15, -0.1, 'a'], ['cultist', 1.0, 1.4, 'b']],
    implode: [['skeleton', 1.25, -0.2, 'a'], ['skeleton', 2.6, 1.3, 'b'], ['cultist', 2.8, -1.4, 'c'], ['skeleton', 3.4, 0.2, 'd'], ['skeleton', 1.0, 1.9, 'e']],
  };
  const seconds = { siphon: 4.6, cauterize: 4.6, forking: 3.6, shiver: 4.2, sunder: 5.0, fervor: 7.2, rimeward: 5.2, implode: 4.6 };
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.loading.on = false;
    d.practice('warrior', 12);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    const g = d.game();
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    d.melds8.switch.on = true;
  });
  await page.waitForTimeout(600);
  const ids = await page.evaluate((layout) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const o = {};
    for (const [kind, ax, dn, role] of layout) {
      const x = h.x + ((ax + dn) / 2) * 1.4; const y = h.y + ((dn - ax) / 2) * 1.4;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.words = [];
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      o[role] = m.id;
    }
    return o;
  }, layouts[look]);
  if (Object.keys(ids).length !== layouts[look].length) bad(`not everyone is standing: ${JSON.stringify(ids)}`);
  await page.waitForTimeout(2500);

  // THE PLAN, run in the page each frame with the film's time `t`: what the rules would do, and the moments they would send.
  await page.evaluate(({ look, ids }) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const M = (r) => g.monsters.find((q) => q.id === ids[r]);
    const send = (e) => d.melds8.moment(e);
    const did = new Set();
    // where each stood (a monster killed may be gone from the list)
    const at0 = Object.fromEntries(Object.entries(ids).map(([r, id]) => { const m = g.monsters.find((q) => q.id === id); return [r, { x: m.x, y: m.y }]; }));
    const gone = (r) => { const m = g.monsters.find((q) => q.id === ids[r]); return !m || m.dead; };
    const once = (key, t, at, fn) => { if (t >= at && !did.has(key)) { did.add(key); fn(); } };
    const face = (m) => { const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far; };
    const swing = (m) => { h.mana = h.d.maxMana; h.swingT = 0; face(m); g.useBasic(m.x, m.y); };
    // a blow landed on `m` (its life fell), or it died: once each
    const lives = new Map();
    const struck = (m) => { if (!m) return false; const was = lives.get(m.id) ?? m.life; lives.set(m.id, m.life); return m.life < was || (m.dead && !did.has(`dead${m.id}`) && did.add(`dead${m.id}`)); };
    const plans = {
      // its poison ticking on two: each tick drawn off to him (in front, then behind)
      siphon: (t) => {
        once('p', t, 0, () => { for (const r of ['a', 'b']) { const m = M(r); m.poisonT = 99; m.poisonDps = 0; m.poisonN = 1; } });
        for (const [i, at] of [0.4, 0.95, 1.5, 2.05].entries()) once(`f${i}`, t, at, () => send({ id: 'siphon', on: ids.a, k: 1 }));
        for (const [i, at] of [2.8, 3.4].entries()) once(`b${i}`, t, at, () => send({ id: 'siphon', on: ids.b, k: 0.5 }));
      },
      // a burning one killed by his blow; then another, behind
      cauterize: (t) => {
        // (burning: its ticks take 1 each, so its life is made 1 only as the blow is swung)
        once('p', t, 0, () => { for (const r of ['a', 'b']) { const m = M(r); m.burnT = 99; m.burnDps = 0; } });
        once('s1', t, 0.3, () => { M('a').life = 1; swing(M('a')); });
        if (did.has('s1') && gone('a')) once('k1', t, 0, () => send({ id: 'cauterize', x: at0.a.x, y: at0.a.y, k: 1 }));
        once('s2', t, 2.4, () => { M('b').life = 1; swing(M('b')); });
        if (did.has('s2') && gone('b')) once('k2', t, 0, () => send({ id: 'cauterize', x: at0.b.x, y: at0.b.y, k: 0.5 }));
      },
      // each blow's arc to the nearest other
      forking: (t) => {
        once('s1', t, 0.25, () => swing(M('a')));
        once('s2', t, 1.4, () => swing(M('a')));
        once('s3', t, 2.5, () => swing(M('a')));
        const a = M('a');
        if (a && struck(a)) {
          const n = did.has('k1') ? (did.has('k2') ? 3 : 2) : 1;
          did.add(`k${n}`);
          const o = n === 2 ? M('c') : M('b');
          send({ id: 'forking', x: a.x, y: a.y, x1: o.x, y1: o.y, k: n === 3 ? 0.5 : 1 });
        }
      },
      // a critical hit freezes it; later another, behind
      shiver: (t) => {
        once('s1', t, 0.3, () => swing(M('a')));
        const a = M('a');
        if (a && !did.has('f1') && struck(a)) { did.add('f1'); a.frozenT = 0.8; send({ id: 'shiver', on: a.id, k: 1 }); }
        once('s2', t, 2.2, () => swing(M('b')));
        const b = M('b');
        if (b && did.has('s2') && !did.has('f2') && struck(b)) { did.add('f2'); b.frozenT = 0.4; send({ id: 'shiver', on: b.id, k: 0.5 }); }
      },
      // a blow that stuns it (sundered while stunned), a second blow on it while it is (the crack flaring); then another, behind
      sunder: (t) => {
        once('s1', t, 0.3, () => swing(M('a')));
        once('s2', t, 1.25, () => swing(M('a')));
        const a = M('a');
        if (a && struck(a)) {
          if (!did.has('m1')) { did.add('m1'); a.stunT = 1.6; send({ id: 'sunder', on: a.id, secs: 1.6, k: 1 }); } else if (!did.has('h1')) { did.add('h1'); send({ id: 'sunder', what: 'hit', on: a.id, k: 1 }); }
        }
        once('s3', t, 3.1, () => swing(M('b')));
        const b = M('b');
        if (b && did.has('s3') && !did.has('m2') && struck(b)) { did.add('m2'); b.stunT = 1.2; send({ id: 'sunder', on: b.id, secs: 1.2, k: 0.5 }); }
      },
      // five kills one after another, each stoking it, the fifth its most; then it runs out
      fervor: (t) => {
        once('p', t, 0, () => { for (const r of ['a', 'b', 'c', 'd', 'e']) M(r).life = 1; });
        ['a', 'b', 'c', 'd', 'e'].forEach((r, i) => {
          once(`s${i}`, t, 0.3 + i * 0.75, () => { const m = M(r); if (m) swing(m); });
          if (did.has(`s${i}`) && gone(r)) once(`k${i}`, t, 0, () => send({ id: 'fervor', x: at0[r].x, y: at0[r].y, n: i + 1, most: 5, secs: 4 }));
        });
      },
      // its blow blocked: its swing played, the game's own block shown where it lands (its rules' event, 'blocked', and its word);
      // chilled for two seconds; then another's, behind
      rimeward: (t) => {
        const blow = (r, at, secs, k) => {
          const m = M(r);
          once(`a${r}`, t, at, () => { m.anim = 'attack'; m.animT = 0; face(m); });
          once(`b${r}`, t, at + 0.55, () => {
            d.fx.handle([{ t: 'blocked', x: h.x, y: h.y, fromX: m.x, fromY: m.y }, { t: 'text', x: h.x, y: h.y, text: 'Blocked', color: '#9fe8c0' }], () => {});
            m.chillT = secs;
            send({ id: 'rimeward', on: m.id, secs, k });
          });
        };
        blow('a', 0.3, 2, 1);
        blow('b', 3.0, 1.5, 0.5);
      },
      // a blow that drags those near it in and bursts there; then another, behind
      implode: (t) => {
        once('s1', t, 0.3, () => swing(M('a')));
        const a = M('a');
        const pull = (cx, cy, reach, secs, at) => {
          const u = Math.min(1, Math.max(0, (t - at) / secs));
          for (const m of g.monsters) {
            if (m.dead) continue;
            if (!m.from) m.from = { x: m.x, y: m.y, at };
            if (m.from.at !== at) m.from = { x: m.x, y: m.y, at };
            const dd = Math.hypot(m.from.x - cx, m.from.y - cy);
            if (dd > reach || dd < 0.6) continue;
            const k = Math.min(1.6, dd - 0.6) / dd;
            const e = 1 - (1 - u) ** 2;
            m.x = m.from.x + (cx - m.from.x) * k * e;
            m.y = m.from.y + (cy - m.from.y) * k * e;
          }
        };
        if (a && !did.has('i1') && struck(a)) { did.add('i1'); did.pull1 = { x: a.x, y: a.y, at: t }; send({ id: 'implode', x: a.x, y: a.y, reach: 3, r: 2.2, wait: 0.4, k: 1 }); }
        if (did.pull1 && t < did.pull1.at + 0.45) pull(did.pull1.x, did.pull1.y, 3, 0.4, did.pull1.at);
        once('s2', t, 2.4, () => swing(M('e')));
        const e = M('e');
        if (e && did.has('s2') && !did.has('i2') && struck(e)) { did.add('i2'); did.pull2 = { x: e.x, y: e.y, at: t }; send({ id: 'implode', x: e.x, y: e.y, reach: 3, r: 1.5, wait: 0.4, k: 0.5 }); }
        if (did.pull2 && t < did.pull2.at + 0.45) pull(did.pull2.x, did.pull2.y, 3, 0.4, did.pull2.at);
      },
    };
    window.__m8step = plans[look];
  }, { look, ids });

  // THE FILM: the game's clock let on a thirtieth of a second at a time and stopped while each frame is taken
  const mid = await page.evaluate(() => [innerWidth / 2, innerHeight / 2]);
  const clip = { x: Math.round(mid[0] - 105), y: Math.round(mid[1] - 150), width: 400, height: 250 };
  const FPS = 30;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const n = Math.round(seconds[look] * FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.__m8step(t), i / FPS);
    // (the burning and the poisoned here are the film's, at no harm: the ticks of 1 they float are taken off the picture)
    await page.evaluate(() => { const f = window.__dbg.fx; f.floaters = f.floaters.filter((q) => q.text !== '1'); });
    await page.evaluate(() => { window.__dbg.slowmo = 0.3; });
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + (i + 1) / FPS, { polling: 'raf', timeout: 120000 });
    await page.screenshot({ path: `${out}_f${String(i).padStart(4, '0')}.png`, clip });
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  const end = await page.evaluate((ids) => {
    const g = window.__dbg.game();
    return { dead: g.monsters.filter((m) => m.dead).length, of: Object.keys(ids).length };
  }, ids);
  console.log(`  ${look}: ${n} frames; at the end ${JSON.stringify(end)}`);
}
