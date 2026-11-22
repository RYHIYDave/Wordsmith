// EVERY WORD ON A DUNGEON, THE EIGHT NEW MELDS (game/foe_melds.ts, FOE_WORDS, switched on for this page only): each one's twist on a
// monster as the game plays it, one after another in the practice room, for his yes. Filmed in real time (--video); each part's start
// noted (<out>_parts.json) for the captions. (Shiver's critical made sure here, `__dbg.foeTune`, so that its freeze is seen: in the
// game it is one blow in about five.)
//   node tools/build_to.mjs dist/foe8.html
//   node tools/playtest.mjs --file dist/foe8.html --size 844x390 --dpr 2 --video shots/foe8/video --scenario tools/scenarios/foe_melds8_look.mjs --out shots/foe8/a
export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.foeWords.on = true;
    d.saving(false);
    d.practice('warrior', 12);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    const g = d.game();
    g.waveT = 1e9;
  });
  await page.waitForTimeout(2500);

  // each part: who stands where (tiles right and down the screen from him), carrying what (and whether it may walk); what is done, when
  const parts = [
    { name: 'Siphon', say: 'While its poison is on you, you heal less', secs: 4.2, who: [['skeleton', 1.1, 0.1, ['leech', 'poison', 'siphon']]], at: [[0.2, 'swing', 0], [1.8, 'heal'], [3.0, 'heal']] },
    { name: 'Cauterize', say: 'Low on life, it sears its wounds shut, once', secs: 3.6, who: [['skeleton', 1.8, 0.2, ['leech', 'fire', 'cauterize']]], at: [[0.4, 'low', 0]] },
    { name: 'Forking', say: 'Its lightning forks: a second bolt where you were', secs: 4.2, who: [['skeleton', 1.1, 0.1, ['twin', 'lightning', 'forking']]], at: [[0.2, 'swing', 0], [1.0, 'step'], [2.2, 'back', 0], [2.4, 'swing', 0], [3.1, 'step']] },
    { name: 'Shiver', say: 'Its critical hits freeze you for a moment', secs: 3.6, who: [['skeleton', 1.1, 0.1, ['precise', 'frost', 'shiver']]], at: [[0.1, 'sure'], [0.2, 'swing', 0], [1.8, 'swing', 0], [3.2, 'unsure']] },
    { name: 'Sunder', say: 'Its next blow after knocking you back hits much harder', secs: 4.0, who: [['brute', 1.2, 0.1, ['heavy', 'power', 'sunder']]], at: [[0.2, 'swing', 0], [1.2, 'back', 0], [1.3, 'swing', 0]] },
    { name: 'Fervor', say: 'Each enemy dying near it makes it faster and hotter', secs: 4.6, who: [['skeleton', 2.6, 0.4, ['frenzied', 'fire', 'fervor'], 'walks'], ['skeleton', 3.4, -0.6, []], ['skeleton', 3.6, 1.2, []]], at: [[0.4, 'kill', 1], [1.2, 'kill', 2], [1.6, 'go', 0]] },
    { name: 'Rime Ward', say: 'Hitting its shield chills you', secs: 3.4, who: [['skeleton', 1.1, 0.1, ['guarding', 'frost', 'rimeward']]], at: [[0.1, 'shield', 0], [0.3, 'strike', 0], [1.3, 'strike', 0], [2.3, 'strike', 0]] },
    { name: 'Implode', say: 'When it dies it pulls you in, then bursts', secs: 3.6, who: [['skeleton', 2.8, 0.2, ['pulling', 'volatile', 'implode']]], at: [[0.3, 'kill', 0]] },
  ];
  const noted = [];
  snap.note('start', { at: snap.videoAt() });
  for (const p of parts) {
    const ids = await page.evaluate((who) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
      d.fx.messages.length = 0; if (d.fx.fallen) d.fx.fallen.length = 0;
      h.burnT = 0; h.chillT = 0; h.poisonT = 0; h.shockT = 0; h.blightMore = 0; h.frostbiteDps = 0; h.siphonLess = 0; h.iceT = 0;
      h.x = 15.5; h.y = 15.5;
      const out = [];
      for (const [kind, ax, dn, words, walks] of who) {
        const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
        const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
        g.wakeUp(m);
        m.life = m.maxLife = 1e7;
        m.words = [...words];
        m.hailT = 1e9;
        m.cd = 1e9;
        if (walks !== 'walks') m.speed = 0;
        else { m.home = { x, y }; m.speed0 = m.speed; m.speed = 0; }
        const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
        out.push(m.id);
      }
      const t = g.monsters[0];
      if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
      return out;
    }, p.who);
    noted.push({ name: p.name, say: p.say, from: snap.videoAt(), secs: p.secs });
    const t0 = Date.now();
    for (const [at, what, i] of p.at) {
      const wait = t0 + at * 1000 - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      const r = await page.evaluate(([what, i, ids]) => {
        const d = window.__dbg; const g = d.game(); const h = g.hero;
        const m = i === undefined ? null : g.monsters.find((q) => q.id === ids[i]);
        if (what === 'heal') { h.life = Math.round(h.d.maxLife * 0.5); const n = h.d.maxLife * 0.15; const was = h.life; g.healHero(n); g.emit({ t: 'heal', amount: Math.round(h.life - was) }); return 'ok'; }
        if (what === 'step') { h.x += 1.1; h.y -= 0.4; return 'ok'; }
        if (what === 'sure') { d.foeTune.shiver.chance = 1; return 'ok'; }
        if (what === 'unsure') { d.foeTune.shiver.chance = 0.22; return 'ok'; }
        if (!m) return 'none';
        if (what === 'swing') { m.cd = 0; return 'ok'; }
        if (what === 'back') { const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.x = m.x - ((m.x - h.x) / far) * 1.0; h.y = m.y - ((m.y - h.y) / far) * 1.0; h.iceT = 0; return 'ok'; }
        if (what === 'low') { m.life = m.maxLife * 0.2; m.barT = 6; return 'ok'; }
        if (what === 'kill') { g.kill(m); return 'ok'; }
        if (what === 'go') { m.speed = m.speed0 || 2; m.cd = 0; return 'ok'; }
        if (what === 'shield') { m.shield = 1e6; return 'ok'; }
        if (what === 'strike') { g.damageMonster(m, 40, 'phys', false, 0); return 'ok'; }
        return 'what?';
      }, [what, i, ids]);
      if (r !== 'ok') bad(`${p.name} ${what}: ${r}`);
      if (what === 'swing') setTimeout(() => page.evaluate((ids) => { const g = window.__dbg.game(); for (const q of g.monsters) if (ids.includes(q.id) && q.speed === 0) q.cd = 1e9; }, ids).catch(() => {}), 700);
    }
    const rest = t0 + p.secs * 1000 - Date.now();
    if (rest > 0) await page.waitForTimeout(rest);
    const seen = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return { zones: g.zones.map((z) => `${z.kind}:${z.foe ?? ''}:${(z.from || '').split("'s ")[1] ?? ''}`), siphon: h.siphonLess, fervor: g.monsters.map((m) => m.fervorN || 0) }; });
    console.log(`  ${p.name}: ${JSON.stringify(seen)}`);
  }
  snap.note('parts', noted);
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
