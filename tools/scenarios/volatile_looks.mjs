// THE FIVE VOLATILE MELDS' LOOKS (render/volatile3.ts, behind VOLATILE3, off in the game): each in the
// practice room, in front and then behind, filmed as the game draws it, a picture every thirtieth of a
// second of the game's time (the game is slowed so that the camera keeps up). His words to the art
// chat, 21 Oct 2026, 19:31 Pacific: “I’ll need animations for the volatile melds I’m adding to the
// damage melds”. There are no rules for them yet (the main chat's), so the page does by hand what the
// rules will (__dbg.volatile3: which kills go off, the runes laid and going off, the twists), and the
// looks answer as they will to the rules' events. The switch is thrown for this page only.
//   node tools/build_to.mjs dist/volatile_looks.html
//   WORD=demolition node tools/playtest.mjs --file dist/volatile_looks.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/volatile_looks.mjs --out shots/vl/demolition/demolition
//   env: WORD = demolition | powderkeg | shatter | chainreaction | rupture
//        STILLS=1: only the frames named in the plan's `stills`, at the game's own speed (a quick look)
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands.
export default async function (page, snap) {
  const word = process.env.WORD || 'demolition';
  const stillsOnly = process.env.STILLS === '1';
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };

  // who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you); a 4th, `rank` 1 for an elite
  const plans = {
    // in front: the kill's blast, the biggest; an elite going off at half its life. Behind: one huge rune, slow to go off
    demolition: {
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.5, 0.9, 'a'], ['cultist', 2.6, -1.3, 'b'], ['brute', 2.0, 1.7, 'elite', 1], ['skeleton', 3.3, -0.2, 'c']],
      frames: 255,
      at: {
        0: [['carry', 'demolition'], ['prime', 'target', 'demolition']],
        3: [['mortal', 'target'], ['attack', 'target']],
        64: [['attack', 'elite']],
        71: [['half', 'elite']],
        118: [['carry', null], ['rules', true], ['attack', 'a']],
        125: [['rune', 'a', 'demolition', 2.6, 2.4]],
      },
      stills: [12, 18, 30, 74, 80, 132, 170, 196, 200, 206, 220],
    },
    // in front: a burning one killed: the fireball, and the blast setting others alight. Behind: the fuse round the rune, and the burning ground it leaves
    powderkeg: {
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.4, 0.8, 'a'], ['cultist', 2.5, -1.2, 'b'], ['skeleton', 0.6, 1.4, 'c'], ['cultist', 3.2, 0.1, 'd']],
      frames: 240,
      at: {
        0: [['carry', 'powderkeg'], ['burn', 'target'], ['prime', 'target', 'powderkeg']],
        3: [['mortal', 'target'], ['attack', 'target']],
        96: [['carry', null], ['rules', true], ['attack', 'a']],
        103: [['rune', 'a', 'powderkeg', 1.9, 1.4]],
      },
      stills: [12, 16, 24, 34, 60, 110, 125, 146, 152, 170, 210],
    },
    // in front: a frozen one killed bursts into shards, striking those about it. Behind: the rune freezes what is near, then bursts
    shatter: {
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.4, 0.8, 'a'], ['cultist', 2.5, -1.2, 'b'], ['skeleton', 0.6, 1.4, 'c'], ['cultist', 3.2, 0.1, 'd']],
      frames: 220,
      at: {
        0: [['carry', 'shatter'], ['freeze', 'target'], ['prime', 'target', 'shatter']],
        3: [['mortal', 'target'], ['attack', 'target']],
        90: [['carry', null], ['rules', true], ['attack', 'a']],
        97: [['rune', 'a', 'shatter', 2.0, 1.4]],
      },
      stills: [12, 15, 19, 26, 50, 105, 118, 130, 140, 152, 160, 175],
    },
    // in front: the blast of lightning, arcs to the nearest, and those they kill going off in turn. Behind: three runes, linked; one going off sets off the rest
    chainreaction: {
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.6, 0.7, 'a'], ['cultist', 2.3, -1.4, 'b'], ['skeleton', 3.9, -0.4, 'c'], ['cultist', 4.0, 1.6, 'd'], ['skeleton', 0.4, 1.6, 'e']],
      frames: 250,
      at: {
        0: [['carry', 'chainreaction'], ['prime', 'target', 'chainreaction'], ['mortal', 'a'], ['prime', 'a', 'chainreaction'], ['mortal', 'b'], ['prime', 'b', 'chainreaction'], ['prime', 'c', 'chainreaction'], ['mortal', 'c']],
        3: [['mortal', 'target'], ['attack', 'target']],
        110: [['carry', null], ['rules', true], ['attack', 'd']],
        117: [['rune', 'd', 'chainreaction', 1.4, 1.2]],
        124: [['attack', 'e']],
        131: [['rune', 'e', 'chainreaction', 1.4, 1.2]],
        134: [['runeAt', 2.2, 0.0, 'chainreaction', 1.4, 1.2]],
      },
      stills: [12, 16, 22, 28, 36, 60, 140, 150, 152, 156, 160, 175],
    },
    // in front: a poisoned one killed bursts, splashing its poison on those about it. Behind: the rune swells and bursts into a cloud
    rupture: {
      layout: [['skeleton', 1.25, -0.2, 'target'], ['skeleton', 2.4, 0.8, 'a'], ['cultist', 2.5, -1.2, 'b'], ['skeleton', 0.6, 1.4, 'c'], ['cultist', 3.2, 0.1, 'd']],
      frames: 240,
      at: {
        0: [['carry', 'rupture'], ['poison', 'target'], ['prime', 'target', 'rupture']],
        3: [['mortal', 'target'], ['attack', 'target']],
        92: [['carry', null], ['rules', true], ['attack', 'a']],
        99: [['rune', 'a', 'rupture', 1.9, 1.3]],
      },
      stills: [12, 16, 22, 30, 50, 108, 125, 138, 142, 150, 180, 220],
    },
  };
  const plan = plans[word];
  if (!plan) throw new Error(`no plan for ${word}`);

  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false);
    d.practice('warrior', 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    for (const side of ['front', 'behind']) for (let k = 0; k < 3; k++) g.unsocket(0, side, k);
    d.volatile3.switch.on = true; d.volatile3.clear();
  });
  await page.waitForTimeout(500);
  const ids = await page.evaluate((layout) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = { all: [] };
    for (const [kind, ax, dn, role, rank] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, rank || 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7;
      m.words = [];
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
  await page.waitForTimeout(stillsOnly ? 300 : 4000);
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }) });

  const act = async (a) => page.evaluate(([what, args, ids]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const v = d.volatile3;
    const mon = (role) => g.monsters.find((q) => q.id === ids[role] && !q.dead);
    if (what === 'carry') { v.carry(args[0]); return 'ok'; }
    if (what === 'rules') { v.rules(args[0]); return 'ok'; }
    if (what === 'mortal') { const m = mon(args[0]); if (m) m.life = 1; return m ? 'ok' : 'none'; }
    if (what === 'prime') { const m = mon(args[0]); if (m) v.prime(m.id, args[1]); return m ? 'ok' : 'none'; }
    if (what === 'burn') { const m = mon(args[0]); if (m) { m.burnT = 99; m.burnDps = 0; } return 'ok'; }
    if (what === 'poison') { const m = mon(args[0]); if (m) { m.poisonT = 99; m.poisonDps = 0; m.poisonN = 1; } return 'ok'; }
    if (what === 'freeze') { const m = mon(args[0]); if (m) m.frozenT = 99; return 'ok'; }
    if (what === 'attack') {
      const m = mon(args[0]);
      if (!m) return 'none';
      h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
      const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
      g.useBasic(m.x, m.y);
      return 'ok';
    }
    if (what === 'half') { const m = mon(args[0]); if (m) v.fx({ t: 'volFx', meld: 'demolition', what: 'half', id: m.id, x: m.x, y: m.y, r: 2.4 }); return m ? 'ok' : 'none'; }
    if (what === 'rune') { const m = g.monsters.find((q) => q.id === ids[args[0]]); if (m) v.lay(args[1], 'rune', m.x, m.y, args[2], args[3]); return m ? 'ok' : 'none'; }
    if (what === 'runeAt') { const x = h.x + (args[0] + args[1]) / 2 * 1.4; const y = h.y + (args[1] - args[0]) / 2 * 1.4; v.lay(args[2], 'rune', x, y, args[3], args[4]); return 'ok'; }
    return 'what?';
  }, [a[0], a.slice(1), ids]);
  const doAll = async (f) => { for (const a of plan.at[f] || []) { const r = await act(a); if (r !== 'ok') bad(`f${f} ${a[0]}: ${r}`); } };

  if (stillsOnly) {
    const t0 = Date.now();
    const at = (f) => t0 + (f * 1000) / 30;
    const last = Math.max(...plan.stills, ...Object.keys(plan.at).map(Number));
    for (let f = 0; f <= last; f++) {
      if (plan.at[f] || plan.stills.includes(f)) {
        const wait = at(f) - Date.now();
        if (wait > 0) await page.waitForTimeout(wait);
        await doAll(f);
        if (plan.stills.includes(f)) await snap(`s${String(f).padStart(3, '0')}`);
      }
    }
  } else {
    // each picture a thirtieth of a second of the game's own time after the last (the game runs slowed
    // until its clock reaches the next picture's moment, and stands still while the picture is taken)
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
      await doAll(i);
      // (the burning and the poisoned here are the film's, at no harm: the rules' ticks of 1 they float are taken off the picture)
      await page.evaluate(() => { const f = window.__dbg.fx; f.floaters = f.floaters.filter((q) => q.text !== '1'); });
      await snap(`f${String(i).padStart(3, '0')}`);
    }
    const c1 = await page.evaluate(() => window.__dbg.clock());
    console.log(`  the game's own time over the film: ${(c1 - c0).toFixed(2)} s for ${plan.frames} pictures`);
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  }
  const did = await page.evaluate((ids) => {
    const g = window.__dbg.game();
    return { dead: g.monsters.filter((m) => m.dead).length, alive: g.monsters.filter((m) => !m.dead).length, zones: g.zones.map((z) => `${z.kind}:${z.look ?? ''}`), primed: window.__dbg.volatile3.state.demo.primed.size };
  }, ids);
  console.log('  at the end:', JSON.stringify(did));
}
