// WORDMELDING'S LOOKS (render/melds3.ts, behind MELD3, off in the game): each melded word at work in
// the practice room, in front and then behind, filmed as the game draws it, a picture every
// thirtieth of a second of the game's time (the game is slowed so that the camera keeps up). His
// words, 16 Oct 2026, 14:21: “I need designs and animations for all the new melded damage words”.
// The switches are thrown for this page only (__dbg.meld, __dbg.melds3.switch); the hero's real
// attacks call up the looks, by the rules' own events.
//   node tools/build_to.mjs dist/meld_looks.html
//   WORD=eruption node tools/playtest.mjs --file dist/meld_looks.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/meld_looks.mjs --out shots/ml/eruption
//   env: WORD = eruption | avalanche | thunder | blight | scald | wildfire | fumes | hailstorm | frostbite | contagion
//        STILLS=1: only the frames named in the plan's `stills`, at the game's own speed (a quick look)
//        OFF=1: the same, with the looks' switch left off (what the melded words look like today)
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands.
export default async function (page, snap) {
  const word = process.env.WORD || 'eruption';
  const stillsOnly = process.env.STILLS === '1';
  const off = process.env.OFF === '1';
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };

  const plans = {
    // in front: a volcano's hit, its molten pool; behind: the hero's heat, and at full heat the eruption
    eruption: {
      cls: 'warrior',
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.3, 0.9], ['cultist', 2.4, -1.3]],
      frames: 150,
      at: {
        0: ['words', ['eruption'], []],
        3: ['attack', 'target'],
        38: ['attack', 'target'],
        70: ['words', [], ['eruption']],
        72: ['heat', 4],
        76: ['attack', 'target'],
        104: ['attack', 'target'],
      },
      stills: [8, 30, 50, 82, 110, 125],
    },
    // in front: snow and ice smash it back; one stopped short freezes; behind: snowdrift ground, and a crushing hit on the chilled
    avalanche: {
      cls: 'warrior',
      layout: [['skeleton', 1.25, -0.2, 'target'], ['cultist', 1.25, 0.9, 'second'], ['brute', 2.05, 1.3, 'wall']],
      frames: 150,
      at: {
        0: ['words', ['avalanche'], []],
        3: ['attack', 'target'],
        40: ['attack', 'second'],
        78: ['words', [], ['avalanche']],
        80: ['chill', 'target'],
        82: ['attack', 'target'],
        112: ['attack', 'target'],
      },
      stills: [6, 12, 46, 52, 88, 116],
    },
    // in front: one great bolt out of the sky, and its stun; behind: the charge, the thunderclap, and the thunderhead it leaves
    thunder: {
      cls: 'warrior',
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.2, 0.8], ['cultist', 2.6, -0.9], ['skeleton', -1.2, 1.0]],
      frames: 165,
      at: {
        0: ['words', ['thunder'], []],
        3: ['attack', 'target'],
        44: ['words', [], ['thunder']],
        46: ['claps', 2],
        48: ['attack', 'target'],
        92: ['attack', 'target'],
      },
      stills: [5, 9, 30, 70, 95, 99, 140],
    },
    // in front: rot, worse as its life runs out; behind: a cloud of rot, and the brand on what it poisons
    blight: {
      cls: 'warrior',
      layout: [['skeleton', 1.25, -0.2, 'target'], ['cultist', 1.9, 0.9, 'second'], ['skeleton', 2.3, -1.0]],
      frames: 150,
      at: {
        0: ['words', ['blight'], []],
        3: ['attack', 'target'],
        34: ['life', 'target', 0.25],
        36: ['attack', 'target'],
        74: ['words', [], ['blight']],
        76: ['life', 'target', 1],
        78: ['attack', 'second'],
        108: ['attack', 'target'],
      },
      stills: [8, 30, 42, 66, 90, 130],
    },
    // in front: fire and ice twisting, and the crack; behind: the scalding steam, the hero hidden in it
    scald: {
      cls: 'warrior',
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.2, 0.8], ['cultist', 2.4, -1.1]],
      frames: 165,
      at: {
        0: ['words', ['scald'], []],
        3: ['attack', 'target'],
        34: ['attack', 'target'],
        74: ['words', [], ['scald']],
        76: ['attack', 'target'],
        104: ['hero', 0.55, -0.1],
        106: ['attack', 'target'],
      },
      stills: [6, 37, 44, 90, 120, 150],
    },
    // in front: burning lightning leaps from what it hits to the rest and sets them burning; behind: the burning ground throws sparks
    wildfire: {
      cls: 'ranger',
      layout: [['skeleton', 3.2, -0.3, 'target'], ['skeleton', 4.4, 0.8], ['cultist', 4.6, -1.2], ['skeleton', 3.6, 1.6]],
      frames: 165,
      at: {
        0: ['words', ['wildfire'], []],
        3: ['attack', 'target'],
        40: ['attack', 'target'],
        80: ['words', [], ['wildfire']],
        82: ['attack', 'target'],
        110: ['attack', 'target'],
      },
      stills: [12, 20, 50, 100, 130, 155],
    },
    // in front: smoke, and the toxic cloud of the burning and poisoned; behind: smouldering ground and a cloud that goes up when fire walks in
    fumes: {
      cls: 'warrior',
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.3, 0.8], ['cultist', 4.2, 1.8, 'walker']],
      frames: 175,
      at: {
        0: ['words', ['fumes'], []],
        3: ['attack', 'target'],
        34: ['attack', 'target'],
        // (behind on its own: the toxic cloud of the front is cleared away, and what it struck no longer burns,
        // so that the cloud laid behind waits for the fire walking into it)
        71: ['clear'],
        72: ['unburn', 'target'],
        74: ['words', [], ['fumes']],
        76: ['attack', 'target'],
        104: ['burn', 'walker'],
        106: ['walk', 'walker', 'target'],
      },
      stills: [8, 30, 60, 96, 130, 150],
    },
    // in front: ice-white lightning that chills, and the frozen pass it on; behind: a storm of hail
    hailstorm: {
      cls: 'ranger',
      layout: [['skeleton', 3.2, -0.3, 'target'], ['skeleton', 4.3, 0.7], ['cultist', 4.4, -1.2], ['skeleton', 5.2, 0.2]],
      frames: 165,
      at: {
        0: ['words', ['hailstorm'], []],
        3: ['attack', 'target'],
        34: ['attack', 'target'],
        78: ['words', [], ['hailstorm']],
        80: ['attack', 'target'],
        108: ['attack', 'target'],
      },
      stills: [12, 20, 44, 100, 130, 155],
    },
    // in front: jaws of ice bite, and go on biting what is chilled; behind: venomous ice and a cold, sick mist
    frostbite: {
      cls: 'warrior',
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.2, 0.8], ['cultist', 2.4, -1.1]],
      frames: 150,
      at: {
        0: ['words', ['frostbite'], []],
        3: ['attack', 'target'],
        36: ['attack', 'target'],
        74: ['words', [], ['frostbite']],
        76: ['attack', 'target'],
        104: ['attack', 'target'],
      },
      stills: [6, 20, 40, 60, 90, 130],
    },
    // in front: sick green lightning that leaves each one it strikes poisoned; behind: a green storm and a cloud that shocks
    contagion: {
      cls: 'ranger',
      layout: [['skeleton', 3.2, -0.3, 'target'], ['skeleton', 4.3, 0.8], ['cultist', 4.4, -1.2], ['skeleton', 3.6, 1.5]],
      frames: 165,
      at: {
        0: ['words', ['contagion'], []],
        3: ['attack', 'target'],
        40: ['attack', 'target'],
        78: ['words', [], ['contagion']],
        80: ['attack', 'target'],
        108: ['attack', 'target'],
      },
      stills: [12, 20, 50, 100, 130, 155],
    },
  };
  const plan = plans[word];
  if (!plan) throw new Error(`no plan for ${word}`);

  await page.evaluate(([cls, off]) => {
    const d = window.__dbg; d.saving(false); d.meld(true);
    d.practice(cls, 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    d.melds3.switch.on = !off; d.melds3.clear();
    // (the melded words' own colours and runes, in place of the placeholders, on this page)
    if (!off) d.melds3.paint();
  }, [plan.cls, off]);
  await page.waitForTimeout(500);
  // who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you)
  const ids = await page.evaluate((layout) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = { all: [] };
    for (const [kind, ax, dn, role] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
      out.all.push(m.id);
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  }, plan.layout);
  check(`${word}: everyone stands where the plan puts them`, ids.all.length === plan.layout.length, JSON.stringify(ids));
  await page.waitForTimeout(stillsOnly ? 300 : 5000);
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }) });

  const act = async (a) => {
    const [what, ...args] = a;
    return page.evaluate(([what, args, ids]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const mon = (role) => g.monsters.find((q) => q.id === ids[role] && !q.dead);
      if (what === 'words') {
        const [front, behind] = args;
        for (const side of ['front', 'behind']) for (let k = 0; k < 3; k++) g.unsocket(0, side, k);
        for (const w of [...front, ...behind]) h.words[w] = Math.max(3, h.words[w] ?? 0);
        const why = [...front.map((w) => g.socket(0, 'front', w)), ...behind.map((w) => g.socket(0, 'behind', w))].filter(Boolean);
        return `${h.skills[0].r.name}${why.length ? `  (refused: ${why.join(', ')})` : ''}`;
      }
      if (what === 'attack') {
        const m = mon(args[0]);
        if (!m) return 'none';
        h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
        const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
        g.useBasic(m.x, m.y);
        return 'ok';
      }
      if (what === 'heat') { g.meldHeat[0] = args[0]; return 'ok'; }
      if (what === 'claps') { g.meldHits[0] = args[0]; return 'ok'; }
      if (what === 'chill') { const m = mon(args[0]); if (m) { m.chill = 0.4; m.chillT = 2.5; } return 'ok'; }
      if (what === 'clear') { g.zones.length = 0; return 'ok'; }
      if (what === 'unburn') { const m = mon(args[0]); if (m) { m.burnT = 0; m.burnDps = 0; } return 'ok'; }
      if (what === 'burn') { const m = mon(args[0]); if (m) { m.burnT = 6; m.burnDps = 1; } return 'ok'; }
      if (what === 'life') { const m = mon(args[0]); if (m) m.life = m.maxLife * args[1]; return 'ok'; }
      if (what === 'hero') { h.x += (args[0] + args[1]) / 2 * 1.4; h.y += (args[1] - args[0]) / 2 * 1.4; return 'ok'; }
      if (what === 'walk') { const m = mon(args[0]); const to = mon(args[1]); if (m && to) { m.walkTo = { x: to.x + 0.3, y: to.y + 0.2 }; m.anim = 'walk'; } return 'ok'; }
      return 'what?';
    }, [what, args, ids]);
  };

  if (stillsOnly) {
    // at the game's own speed: each action in its frame's time, a picture at each still
    const t0 = Date.now();
    const at = (f) => t0 + (f * 1000) / 30;
    const last = Math.max(...plan.stills, ...Object.keys(plan.at).map(Number));
    for (let f = 0; f <= last; f++) {
      const wait = at(f) - Date.now();
      if (plan.at[f] || plan.stills.includes(f)) {
        if (wait > 0) await page.waitForTimeout(wait);
        if (plan.at[f]) console.log(`  f${f}: ${plan.at[f][0]}`, await act(plan.at[f]));
        if (plan.stills.includes(f)) await snap(`s${String(f).padStart(3, '0')}`);
      }
    }
  } else {
    // Each picture a thirtieth of a second of the game's own time after the last: the game runs
    // slowed down until its clock reaches the next picture's moment, and stands still while the
    // picture is taken (a picture takes longer than the game would wait).
    const slow = 0.05;
    const c0 = await page.evaluate(() => window.__dbg.clock());
    for (let i = 0; i < plan.frames; i++) {
      await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
      await page.waitForFunction((at) => {
        const d = window.__dbg;
        if (d.clock() < at) return false;
        d.slowmo = 1e-6;
        return true;
      }, c0 + i / 30, { polling: 'raf', timeout: 20000 });
      if (plan.at[i]) {
        const r = await act(plan.at[i]);
        if (plan.at[i][0] === 'words') console.log(`  f${i}: ${r}`);
      }
      // (walkers walk toward where they were sent, slowly, whatever their own minds say)
      await page.evaluate(() => {
        const g = window.__dbg.game();
        for (const m of g.monsters) {
          if (!m.walkTo || m.dead) continue;
          const dx = m.walkTo.x - m.x; const dy = m.walkTo.y - m.y; const d = Math.hypot(dx, dy);
          if (d < 0.05) { m.walkTo = null; m.anim = 'idle'; continue; }
          const s = Math.min(d, 0.06); m.x += (dx / d) * s; m.y += (dy / d) * s; m.fx = dx / d; m.fy = dy / d;
        }
      });
      await snap(`f${String(i).padStart(3, '0')}`);
    }
    const c1 = await page.evaluate(() => window.__dbg.clock());
    console.log(`  the game's own time over the film: ${(c1 - c0).toFixed(2)} s for ${plan.frames} pictures (${((c1 - c0) / Math.max(1, plan.frames - 1) * 30).toFixed(2)} of a thirtieth each)`);
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  }
  // what the rules did, so the film is known to show the twist it says
  const did = await page.evaluate(() => {
    const g = window.__dbg.game();
    return { zones: [...new Set(g.zones.map((z) => `${z.kind}:${z.look ?? z.meld ?? ''}`))], heat: g.meldHeat[0], claps: g.meldHits[0] };
  });
  console.log('  at the end:', JSON.stringify(did));
}
