// EVERY WORD ON A DUNGEON (game/foe_melds.ts, FOE_WORDS, switched on for this page only): the melded words' twists on monsters, as
// the game plays them, one after another in the practice room, for his yes. Filmed in real time (--video); each part's start is
// noted (<out>_parts.json) for the captions (tools/foe_melds_film.sh).
//   node tools/build_to.mjs dist/foe_melds.html
//   node tools/playtest.mjs --file dist/foe_melds.html --size 844x390 --dpr 2 --video shots/foe/video --scenario tools/scenarios/foe_melds_look.mjs --out shots/foe/a
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

  // each part: who stands where (tiles right and down the screen from him), carrying what; what is done, at what second
  const parts = [
    { name: 'Hailstorm', say: 'Hail falls on a marked circle around you', secs: 4.2, who: [['cultist', 3.2, 0.2, ['frost', 'lightning', 'hailstorm']]], at: [[0.3, 'hail', 0], [2.4, 'hail', 0]] },
    { name: 'Eruption', say: 'Builds heat; at full heat it erupts around it', secs: 3.6, who: [['skeleton', 1.1, 0.1, ['power', 'fire', 'eruption'], 3]], at: [[0.2, 'swing', 0]] },
    { name: 'Thunder', say: 'Every few blows, a thunderclap around it', secs: 3.4, who: [['skeleton', 1.1, 0.1, ['power', 'lightning', 'thunder'], 2]], at: [[0.2, 'swing', 0]] },
    { name: 'Wildfire', say: 'Its blows leave small fires that spark at you', secs: 4.4, who: [['skeleton', 1.1, 0.1, ['fire', 'lightning', 'wildfire']]], at: [[0.2, 'swing', 0], [1.4, 'swing', 0], [2.6, 'swing', 0]] },
    { name: 'Scald', say: 'Fire on you while chilled cracks for more', secs: 3.0, who: [['skeleton', 1.1, 0.1, ['fire', 'frost', 'scald']]], at: [[0.1, 'chill'], [0.2, 'swing', 0], [1.6, 'chill'], [1.7, 'swing', 0]] },
    { name: 'Fumes', say: 'Dies in a poison cloud; anything burning sets it off', secs: 4.6, who: [['skeleton', 2.4, 0.3, ['fire', 'poison', 'fumes']], ['skeleton', 3.8, 1.6, []]], at: [[0.3, 'kill', 0], [2.0, 'walkIn', 1, 0]] },
    { name: 'Contagion', say: 'A poison cloud where it dies that shocks you', secs: 3.6, who: [['skeleton', 0.9, 0.2, ['lightning', 'poison', 'contagion']]], at: [[0.3, 'kill', 0]] },
    { name: 'Demolition', say: 'Its dying blast is huge, but slow to go off', secs: 3.6, who: [['brute', 2.0, 0.2, ['power', 'volatile', 'demolition']]], at: [[0.3, 'kill', 0]] },
    { name: 'Powderkeg', say: 'Its dying blast leaves the ground burning', secs: 3.8, who: [['skeleton', 1.8, 0.2, ['fire', 'volatile', 'powderkeg']]], at: [[0.3, 'kill', 0]] },
    { name: 'Shatter', say: 'Bursts into a ring of ice shards', secs: 3.0, who: [['skeleton', 2.6, 0.2, ['frost', 'volatile', 'shatter']]], at: [[0.3, 'kill', 0]] },
    { name: 'Chain Reaction', say: 'Its dying blast throws lightning at you', secs: 3.0, who: [['skeleton', 2.6, 0.2, ['lightning', 'volatile', 'chainreaction']]], at: [[0.3, 'kill', 0]] },
    { name: 'Rupture', say: 'Bursts, splashing poison on the ground', secs: 3.4, who: [['skeleton', 1.9, 0.2, ['poison', 'volatile', 'rupture']]], at: [[0.3, 'kill', 0]] },
  ];
  const noted = [];
  snap.note('start', { at: snap.videoAt() });
  for (const p of parts) {
    const ids = await page.evaluate((who) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
      h.burnT = 0; h.chillT = 0; h.poisonT = 0; h.shockT = 0; h.blightMore = 0; h.frostbiteDps = 0;
      const out = [];
      for (const [kind, ax, dn, words, n] of who) {
        const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
        const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
        g.wakeUp(m);
        m.life = m.maxLife = 1e7;
        m.words = [...words];
        m.foeN = n || 0;
        m.hailT = 1e9;
        m.cd = 1e9; m.speed = 0;
        const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
        out.push(m.id);
      }
      const t = g.monsters[0];
      if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
      return out;
    }, p.who);
    noted.push({ name: p.name, say: p.say, from: snap.videoAt(), secs: p.secs });
    const t0 = Date.now();
    for (const [at, what, i, j] of p.at) {
      const wait = t0 + at * 1000 - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      const r = await page.evaluate(([what, i, j, ids]) => {
        const d = window.__dbg; const g = d.game(); const h = g.hero;
        const m = g.monsters.find((q) => q.id === ids[i]);
        if (what === 'chill') { h.chill = 0.3; h.chillT = 2; return 'ok'; }
        if (!m) return 'none';
        if (what === 'hail') { m.hailT = 0.01; return 'ok'; }
        if (what === 'swing') { m.cd = 0; return 'ok'; }
        if (what === 'kill') { g.kill(m); return 'ok'; }
        if (what === 'walkIn') {
          const z = g.zones.find((q) => q.foe);
          if (!z) return 'no cloud';
          m.burnT = 99; m.burnDps = 0;
          m.x = z.x + 0.9; m.y = z.y + 0.9;
          return 'ok';
        }
        return 'what?';
      }, [what, i, j, ids]);
      if (r !== 'ok') bad(`${p.name} ${what}: ${r}`);
      // (a swing: let it strike once, then wait again)
      if (what === 'swing') setTimeout(() => page.evaluate((ids) => { const g = window.__dbg.game(); for (const q of g.monsters) if (ids.includes(q.id)) q.cd = 1e9; }, ids).catch(() => {}), 900);
    }
    const rest = t0 + p.secs * 1000 - Date.now();
    if (rest > 0) await page.waitForTimeout(rest);
    const seen = await page.evaluate(() => { const g = window.__dbg.game(); return { zones: g.zones.map((z) => `${z.kind}:${z.foe ?? ''}`), shots: g.projectiles.length }; });
    console.log(`  ${p.name}: ${JSON.stringify(seen)}`);
  }
  snap.note('parts', noted);
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
