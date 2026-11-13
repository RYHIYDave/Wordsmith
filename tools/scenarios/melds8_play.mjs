// THE EIGHT MELDS IN PLAY (game/melds8.ts MELDS8 and render/melds8.ts MELDS8_LOOK, on since 25.3.17): the practice room's Warrior
// with the meld on his attack, in front and then behind, a few enemies set by him, and THE RULES doing the work (the poison, the
// burning kill, the arc, the freeze on a critical hit, the stun, the kills, the block, the pull): only his swings are pressed, and
// what each needs set (a burning enemy, a stunned one, his critical hits, a blow on him). Each moment the rules send is counted.
// Filmed frame by frame, 30 a second, the game's clock stepped so that no frame is missed (as tools/scenarios/melds8_looks.mjs).
//   node tools/build_to.mjs dist/melds8_play.html
//   LOOK=siphon node tools/playtest.mjs --file dist/melds8_play.html --size 852x393 --dpr 3 --touch \
//     --scenario tools/scenarios/melds8_play.mjs --out shots/melds8_play/siphon
// LOOK: siphon | cauterize | forking | shiver | sunder | fervor | rimeward | implode. FRAMES=0: no pictures, only the count.
export default async function (page, snap) {
  const look = process.env.LOOK || 'siphon';
  const frames = process.env.FRAMES !== '0';
  const bad = (s) => console.log(`  !! ${s}`);
  const outAt = process.argv.indexOf('--out');
  const out = outAt >= 0 ? process.argv[outAt + 1] : 'shots/melds8_play/x';
  void snap;
  const layouts = {
    siphon: [['cultist', 2.2, -0.4, 'a'], ['skeleton', 1.4, 1.5, 'b']],
    cauterize: [['cultist', 1.25, -0.2, 'a'], ['skeleton', 1.0, 1.2, 'b']],
    forking: [['skeleton', 1.25, -0.2, 'a'], ['cultist', 2.9, 0.6, 'b'], ['skeleton', 2.4, -1.6, 'c']],
    shiver: [['skeleton', 1.25, -0.2, 'a'], ['cultist', 1.1, 1.5, 'b']],
    sunder: [['brute', 1.4, -0.2, 'a'], ['skeleton', 1.0, 1.2, 'b']],
    fervor: [['skeleton', 1.2, -0.3, 'a'], ['skeleton', 1.0, 1.0, 'b'], ['cultist', -0.2, 1.3, 'c'], ['skeleton', -1.2, 0.6, 'd'], ['skeleton', -1.1, -0.8, 'e']],
    rimeward: [['skeleton', 1.15, -0.1, 'a'], ['cultist', 1.0, 1.4, 'b']],
    implode: [['skeleton', 1.25, -0.2, 'a'], ['skeleton', 2.6, 1.3, 'b'], ['cultist', 2.8, -1.4, 'c'], ['skeleton', 3.4, 0.2, 'd'], ['skeleton', 1.0, 1.9, 'e']],
  };
  const seconds = { siphon: 5.4, cauterize: 5.0, forking: 4.4, shiver: 4.6, sunder: 5.4, fervor: 7.6, rimeward: 5.4, implode: 5.0 };
  const set = await page.evaluate((look) => {
    const d = window.__dbg;
    d.saving(false);
    d.loading.on = false;
    d.practice('warrior', 12);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    const g = d.game();
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    // (the meld on his attack, in front: the rules' own, MELDS8 on in the game)
    for (const side of ['front', 'behind']) {
      const grp = side === 'front' ? g.hero.skills[0].front : g.hero.skills[0].behind;
      for (let i = grp.length - 1; i >= 0; i--) if (grp[i]) g.unsocket(0, side, i);
    }
    g.hero.words[look] = Math.max(2, g.hero.words[look] || 0);
    const why = g.socket(0, 'front', look);
    // (every moment the rules send, counted)
    window.__m8seen = [];
    const emit = g.emit.bind(g);
    g.emit = (e) => { if (e && e.t === 'meld8') window.__m8seen.push(`${e.id}${e.what ? ':' + e.what : ''}:${e.k ?? 1}`); emit(e); };
    return { why, on: d.melds8.switch.on };
  }, look);
  if (set.why) bad(`${look} would not go on his attack: ${set.why}`);
  if (!set.on) bad('MELDS8_LOOK is off');
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

  // THE PLAN: his swings, and what each meld needs set; the rules do the rest. Halfway, the meld goes behind (k 0.5).
  await page.evaluate(({ look, ids, half }) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const M = (r) => g.monsters.find((q) => q.id === ids[r] && !q.dead);
    const did = new Set();
    const once = (key, t, at, fn) => { if (t >= at && !did.has(key)) { did.add(key); fn(); } };
    const face = (m) => { const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far; };
    const swing = (r) => { const m = M(r); if (!m) return; h.mana = h.d.maxMana; h.swingT = 0; h.skills[0].cd = 0; face(m); g.useBasic(m.x, m.y); };
    const behind = () => {
      const grp = h.skills[0].front;
      for (let i = grp.length - 1; i >= 0; i--) if (grp[i]) g.unsocket(0, 'front', i);
      h.words[look] = Math.max(2, h.words[look] || 0);
      g.socket(0, 'behind', look);
    };
    const plans = {
      siphon: (t) => {
        once('s1', t, 0.3, () => swing('a'));
        once('h', t, half, behind);
        once('s2', t, half + 0.3, () => swing('b'));
      },
      cauterize: (t) => {
        // (burning: life enough, 10, that its burning and the burning ground do not kill it before the blow lands)
        once('p', t, 0, () => { for (const r of ['a', 'b']) { const m = M(r); m.burnT = 99; m.burnDps = 0; } });
        once('s1', t, 0.3, () => { M('a').life = 10; swing('a'); });
        once('h', t, half, behind);
        once('s2', t, half + 0.3, () => { M('b').life = 10; swing('b'); });
      },
      forking: (t) => {
        once('s1', t, 0.25, () => swing('a'));
        once('s2', t, 1.3, () => swing('a'));
        once('h', t, half, behind);
        once('s3', t, half + 0.3, () => swing('a'));
      },
      shiver: (t) => {
        once('c', t, 0, () => { h.d.critChance = 100; });
        once('s1', t, 0.3, () => swing('a'));
        once('h', t, half, behind);
        once('s2', t, half + 0.3, () => { h.d.critChance = 100; swing('b'); });
      },
      sunder: (t) => {
        once('st1', t, 0.2, () => { M('a').stunT = 2.0; });
        once('s1', t, 0.3, () => swing('a'));
        once('s2', t, 1.2, () => swing('a'));
        once('h', t, half, behind);
        once('st2', t, half + 0.2, () => { M('b').stunT = 1.6; });
        once('s3', t, half + 0.3, () => swing('b'));
      },
      fervor: (t) => {
        once('p', t, 0, () => { for (const r of ['a', 'b', 'c', 'd', 'e']) M(r).life = 1; });
        ['a', 'b', 'c'].forEach((r, i) => once(`s${i}`, t, 0.3 + i * 0.75, () => swing(r)));
        once('h', t, half, behind);
        ['d', 'e'].forEach((r, i) => once(`t${i}`, t, half + 0.3 + i * 0.75, () => swing(r)));
      },
      rimeward: (t) => {
        const blow = (r, at) => {
          once(`a${r}`, t, at, () => { const m = M(r); m.anim = 'attack'; m.animT = 0; face(m); });
          once(`b${r}`, t, at + 0.55, () => {
            const m = M(r);
            h.d.stats.blockChance = 100;
            // (a blow on him, blocked: the rules chill its maker; a block is a chance, so a few until one is)
            for (let k = 0; k < 40 && !(m.chillT > 0); k++) { h.invuln = 0; g.hurtHero(5, 'phys', [], m); }
          });
        };
        blow('a', 0.3);
        once('h', t, half, behind);
        blow('b', half + 0.3);
      },
      implode: (t) => {
        once('s1', t, 0.3, () => swing('a'));
        once('h', t, half, behind);
        once('s2', t, half + 0.3, () => swing('e'));
      },
    };
    window.__m8step = plans[look];
  }, { look, ids, half: seconds[look] / 2 });

  const mid = await page.evaluate(() => [innerWidth / 2, innerHeight / 2]);
  const clip = { x: Math.round(mid[0] - 105), y: Math.round(mid[1] - 150), width: 400, height: 250 };
  const FPS = 30;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const n = Math.round(seconds[look] * FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.__m8step(t), i / FPS);
    await page.evaluate(() => { window.__dbg.slowmo = 0.3; });
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + (i + 1) / FPS, { polling: 'raf', timeout: 120000 });
    if (frames) await page.screenshot({ path: `${out}_f${String(i).padStart(4, '0')}.png`, clip });
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  const seen = await page.evaluate(() => window.__m8seen);
  console.log(`moments sent by the rules: ${JSON.stringify(seen)}`);
  const front = seen.filter((s) => s.startsWith(`${look}:1`) || s.startsWith(`${look}:hit:`)).length;
  const back = seen.filter((s) => s.startsWith(`${look}:0.5`)).length;
  if (front < 1) bad(`${look}: no moment from the rules in front`);
  if (back < 1) bad(`${look}: no moment from the rules behind`);
  console.log(`${look}: ${front} in front, ${back} behind`);
}
