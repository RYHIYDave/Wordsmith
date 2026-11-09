// HIS THREE NEW WORDS' LOOKS (render/words10.ts, behind WORDS10_LOOK, off in the game): a still of each word at work in the
// practice room, as the game draws it, for the sheet (tools/words10_sheet.py). The rules are the main chat's (words10): each
// scene sets the words in the hero's own abilities, uses them (or lays what they leave, as the rules lay it), then stops the
// world and holds the look at its moment.
//   node tools/build_to.mjs dist/words10_looks.html
//   node tools/playtest.mjs --file dist/words10_looks.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words10_looks.mjs --out /dev/shm/w10/s
//   env: ONLY=lasting:orb,... (only those scenes)
// Beside each picture a note (<out>_<scene>.json) says where on the screen, in game pixels, the hero and the look are.
// Places are in tiles across and down the screen from the hero (+across: right; +down: toward you).
const SCENES = [];
for (const word of ['lasting', 'fleeting']) {
  SCENES.push(
    { key: `${word}:orb`, cls: 'mage', words: [[1, 'front', word]], mobs: [['skeleton', 3.6, 0.2, 'a', 'idle', [-1, 1]]], orb: [2.2, 0.1], stretch: 0.55, focus: [1.6, -0.5], close: [2.2, -0.9] },
    { key: `${word}:whirl`, cls: 'warrior', words: [[1, 'front', word]], mobs: [['skeleton', 2.2, 0.5, 'a', 'idle', [-1, 1]]], whirl: true, stretch: 0.45, focus: [0.4, -0.4], close: [0.9, -0.6] },
    { key: `${word}:ground`, cls: 'warrior', words: [[1, 'behind', 'fire'], [1, 'front', word]], mobs: [['cultist', 2.6, 0.3, 'a', 'walk', [-1, 1]]], ground: [2.4, 0.2, 1.3], stretch: 0.5, focus: [1.6, -0.55], close: [2.2, -0.3] },
    { key: `${word}:boost`, cls: 'warrior', words: [[1, 'front', 'guarding'], [1, 'front', word]], mobs: [], boost: true, trail: [[-0.5, 0.25], [-1.0, 0.45], [-1.5, 0.5], [-2.0, 0.4], [-2.5, 0.2], [-3.0, 0.1]], focus: [-0.9, -0.65], close: [-0.5, -0.6] },
    { key: `${word}:poison`, cls: 'warrior', words: [[0, 'front', 'poison'], [0, 'front', word]], mobs: [['skeleton', 1.6, 0.1, 'a', 'idle', [-1, 1]]], poisoned: 'a', focus: [0.9, -0.4], close: [1.5, -0.7] },
    { key: `${word}:monster`, cls: 'warrior', words: [], mobs: [['cultist', 1.4, -0.1, 'a', 'attack', [-1, 1], [word, 'poison']]], heroSick: true, focus: [0.6, -0.4], close: [0.2, -0.6] },
  );
}
SCENES.push(
  { key: 'vast:whirl', cls: 'warrior', words: [[1, 'front', 'vast']], mobs: [['skeleton', 3.0, 0.6, 'a', 'idle', [-1, 1]]], whirl: true, ring: { at: [0, 0], z: 0 }, ringAt: 0.24, focus: [0.4, -0.5], close: [1.4, -0.3] },
  { key: 'vast:orb', cls: 'mage', words: [[1, 'front', 'vast']], mobs: [['skeleton', 4.6, 0.4, 'a', 'idle', [-1, 1]]], orb: [2.4, 0.1], ring: { at: [2.4, 0.1] }, ringAt: 0.22, focus: [2.0, -0.55], close: [3.3, -0.3] },
  { key: 'vast:ground', cls: 'warrior', words: [[1, 'behind', 'fire'], [1, 'front', 'vast']], mobs: [['cultist', 3.6, 0.2, 'a', 'walk', [-1, 1]]], ground: [2.4, 0.2, 1.3 * 1.4], ring: { at: [2.4, 0.2] }, ringAt: 0.2, focus: [1.9, -0.45], close: [3.0, -0.1] },
  { key: 'vast:strike', cls: 'warrior', words: [[0, 'behind', 'vast']], mobs: [['skeleton', 1.25, 0, 'a', 'idle', [-1, 1]], ['skeleton', 2.3, -0.75, 'b', 'idle', [-1, 1]], ['cultist', 2.45, 0.8, 'c', 'idle', [-1, 1]]], swing: 'a', splash: 'a', splashAt: 0.2, focus: [1.3, -0.6], close: [1.8, -0.5] },
  { key: 'vast:land', cls: 'mage', words: [[1, 'behind', 'vast']], mobs: [['skeleton', 2.6, 0.1, 'a', 'idle', [-1, 1]], ['skeleton', 3.6, -0.7, 'b', 'idle', [-1, 1]], ['skeleton', 3.7, 0.9, 'c', 'idle', [-1, 1]]], orb: [1.9, 0.5], splash: 'a', splashAt: 0.4, focus: [2.4, -0.55], close: [3.1, -0.4] },
  { key: 'vast:monster', cls: 'warrior', words: [], mobs: [['skeleton', 1.9, 0.1, 'a', 'attack', [-1, 1], ['vast']]], warn: { r: 1.25, at: 0.55 }, focus: [1.1, -0.55], close: [1.2, -0.4] },
);

export default async function (page, snap) {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const bad = (s) => console.log(`  !! ${s}`);
  let cls = '';
  // the rune stones, as pictures
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.practice('warrior', 12); });
  await page.waitForTimeout(800);
  const runes = await page.evaluate(() => Object.fromEntries(window.__dbg.words10.words.map((w) => [w, window.__dbg.words10.runePng(w)])));
  for (const [w, url] of Object.entries(runes)) snap.note(`rune_${w}`, { png: url });

  for (const sc of SCENES) {
    if (only.length && !only.includes(sc.key)) continue;
    // the practice room, the hero of the class the scene wants
    if (sc.cls !== cls) {
      await page.evaluate((c) => {
        const d = window.__dbg; d.slowmo = 1; d.saving(false);
        d.practice(c, 12); d.autoLevel = false; d.autoWords = false; d.god = true;
        d.words10.switch.on = true;
      }, sc.cls);
      cls = sc.cls;
      await page.waitForTimeout(1600);
    }
    const res = await page.evaluate((sc) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const fx = d.fx; const w10 = d.words10;
      d.slowmo = 1; window.__held = null;
      // (a spin left from the scene before is ended as the rules end it, so that its wind goes with it)
      if (h.channel) g.endChannel(true);
      g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0; g.drops.length = 0; g.orbs.length = 0;
      for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
      w10.clear(); w10.trail(null);
      h.move = null; h.swingT = 0; h.life = h.d.maxLife; h.channel = null; h.windup = null;
      h.poisonT = 0; h.burnT = 0; h.chillT = 0; h.shieldT = 0; h.shield = 0; h.mightT = 0; h.hasteT = 0; h.frenzyT = 0;
      for (let i = 0; i < 3; i++) for (const side of ['front', 'behind']) for (let k = 0; k < 3; k++) g.unsocket(i, side, k);
      const put = [];
      for (const [i, side, w] of sc.words) { h.words[w] = (h.words[w] || 0) + 1; put.push(`${w}:${g.socket(i, side, w) ?? 'ok'}`); }
      g.refresh();
      const hx = 15; const hy = 15; h.x = hx; h.y = hy; h.fx = 0.7071; h.fy = -0.7071;
      const at = (ax, dn) => [hx + (ax + dn) / 2 * 1.4, hy + (dn - ax) / 2 * 1.4];
      const ids = {};
      for (const [kind, ax, dn, role, anim, face, words] of sc.mobs) {
        const [x, y] = at(ax, dn);
        const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
        g.wakeUp(m);
        m.life = m.maxLife = 1e7; m.words = words ?? [];
        m.state = 'recover'; m.t = 1e9; m.anim = anim; m.animT = anim === 'walk' ? 0.25 : anim === 'attack' ? 0.18 : 0; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
        const l = Math.hypot(face[0], face[1]); m.fx = face[0] / l; m.fy = face[1] / l;
        ids[role] = m.id;
      }
      const r = h.skills.map((s) => ({ id: s.id, last: s.r.last, pace: s.r.pace, vast: s.r.vast, size: s.r.size, front: s.front.join(','), behind: s.behind.join(',') }));
      return { ids, hx, hy, put, r };
    }, sc);
    if (Object.keys(res.ids).length !== sc.mobs.length) bad(`${sc.key}: only ${Object.keys(res.ids).length} of ${sc.mobs.length} stood`);
    if (res.put.some((p) => !p.endsWith(':ok'))) bad(`${sc.key}: socketing ${res.put.join(' ')}`);
    console.log(sc.key, JSON.stringify(res.r));
    await page.waitForTimeout(500);
    // what the scene's ability does, by the rules
    const done = await page.evaluate(([sc, ids, hx, hy]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const w10 = d.words10; const fx = d.fx;
      const at = (ax, dn) => [hx + (ax + dn) / 2 * 1.4, hy + (dn - ax) / 2 * 1.4];
      // (the rings the game throws up as a word is set in an attack, and anything else left in the air, gone before the scene)
      for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
      for (const k of Object.keys(fx.wild || {})) if (Array.isArray(fx.wild[k])) fx.wild[k].length = 0;
      h.mana = h.d.maxMana; for (const s of h.skills) { s.cd = 0; s.charges = s.maxCharges; }
      const out = {};
      if (sc.orb) {
        const [x, y] = at(sc.orb[0], sc.orb[1]);
        const far = Math.hypot(x - h.x, y - h.y) || 1; h.fx = (x - h.x) / far; h.fy = (y - h.y) / far;
        g.useSkill(1, x, y);
        out.orb = [x, y];
      }
      if (sc.whirl) {
        window.__held = { left: 1e9, x: h.x + 1, y: h.y };
        if (!g.__heldWrap) {
          const run = g.update.bind(g);
          g.update = (dt, c) => { const f = window.__held; if (f && f.left > 0) { f.left -= dt; c.hold = true; c.castX = f.x; c.castY = f.y; } return run(dt, c); };
          g.__heldWrap = true;
        }
        g.useSkill(1, h.x + 1, h.y);
      } else window.__held = null;
      if (sc.ground) {
        const [x, y] = at(sc.ground[0], sc.ground[1]);
        g.addGround(1, x, y, sc.ground[2], 1);
        out.ground = g.zones.map((z) => [z.kind, z.r, z.dur, z.skill]);
      }
      if (sc.boost) {
        // (as Guarding's shield is given by a use of it: the rules' own numbers, the time its words make it)
        const s = h.skills[1];
        h.shield = Math.max(1, s.r.shield * h.d.maxLife || 10); h.shieldT = 3 * s.r.last;
        w10.trail(sc.trail.map(([ax, dn]) => { const [x, y] = at(ax, dn); return { x, y }; }));
      }
      if (sc.poisoned) {
        const m = g.monsters.find((q) => q.id === ids[sc.poisoned]);
        m.poisonT = 4 * h.skills[0].r.last; m.poisonDps = 3; m.poisonN = 2; m.lastSkill = 0;
      }
      if (sc.heroSick) { h.poisonT = 4; h.poisonDps = 1; }
      if (sc.warn) {
        const m = g.monsters.find((q) => q.id === ids.a);
        g.addWarn(m.x - 0.55, m.y + 0.55, sc.warn.r, 1.1, 5, 'phys', m.words, m.name, m.id);
        out.warn = g.zones.map((z) => [z.kind, z.r]);
      }
      return out;
    }, [sc, res.ids, res.hx, res.hy]);
    if (sc.whirl || sc.orb) await page.waitForTimeout(sc.whirl ? 650 : 900);
    // the hero's swing, let run to the middle of it
    if (sc.swing) {
      await page.evaluate(([role, ids]) => {
        const d = window.__dbg; const g = d.game(); const h = g.hero;
        const m = g.monsters.find((q) => q.id === ids[role]); if (!m) return;
        h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
        const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
        d.slowmo = 0.15; g.useBasic(m.x, m.y);
      }, [sc.swing, res.ids]);
      const c0 = await page.evaluate(() => window.__dbg.clock());
      await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + 0.11, { polling: 'raf', timeout: 20000 });
    }
    // the moment held
    const focus = await page.evaluate(([sc, ids, hx, hy, done]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const fx = d.fx; const w10 = d.words10;
      const at = (ax, dn) => [hx + (ax + dn) / 2 * 1.4, hy + (dn - ax) / 2 * 1.4];
      d.slowmo = 1e-6;
      const info = {};
      if (sc.orb && !sc.splash) {
        for (const k of Object.keys(fx)) if (Array.isArray(fx[k]) && k !== 'fallen') fx[k].length = 0;
        for (const k of Object.keys(fx.wild || {})) if (Array.isArray(fx.wild[k])) fx.wild[k].length = 0;
      }
      // a thing Lasting gave more time held in that time (its `stretch` of the way through it); Fleeting's at the same point of its own
      for (const o of g.orbs) {
        const own = o.life / Math.max(1, h.skills[o.skill].r.last);
        o.t = sc.stretch !== undefined && h.skills[o.skill].r.last > 1 ? own + (o.life - own) * sc.stretch : Math.min(o.life * 0.6, o.t);
        info.orb = [o.t, o.life];
      }
      const ch = h.channel;
      if (ch && sc.stretch !== undefined) {
        const def = 2.4; const last = h.skills[ch.skill].r.last;
        ch.t = last > 1 ? def + def * (last - 1) * sc.stretch : def * last * 0.5;
        info.spin = [ch.t, def * last];
      }
      for (const z of g.zones) {
        if (z.kind === 'burn' && sc.stretch !== undefined) {
          const last = h.skills[1].r.last; const own = z.dur / Math.max(1, last);
          z.t = last > 1 ? own + (z.dur - own) * sc.stretch : z.dur * 0.4;
          info.ground = [z.t, z.dur, z.r];
        }
        if (z.kind === 'warn' && sc.warn) { z.t = z.dur * sc.warn.at; info.warn = [z.r, z.t, z.dur]; }
      }
      // (only the moment the still is of: what the rules' own events began on the way here is let go)
      w10.state.acts.length = 0;
      if (sc.ring) {
        const [x, y] = sc.ring.at[0] === 0 && sc.ring.at[1] === 0 ? [h.x, h.y] : at(sc.ring.at[0], sc.ring.at[1]);
        const s = h.skills[sc.cls === 'mage' || sc.ground ? 1 : 1];
        const base = sc.whirl ? 2.0 : sc.ground ? 1.3 : 2.2;
        const r = sc.ground ? sc.ground[2] : base * s.r.size;
        w10.play('vast', 'ring', { x, y, r, r0: base, z: 0, dur: 30, seed: 17 });
        info.ring = [r, base];
      }
      if (sc.splash) {
        const m = g.monsters.find((q) => q.id === ids[sc.splash]);
        w10.play('vast', 'splash', { x: m.x, y: m.y, r: 1.5, seed: 23 });
        info.splash = w10.state.acts.map((a) => a.to.length);
      }
      w10.at(sc.ringAt ?? sc.splashAt ?? 0, 3.7);
      fx.floaters.length = 0;
      for (const m of g.monsters) m.life = m.maxLife;
      const pt = (ax, dn) => { const [x, y] = at(ax, dn); return d.at(x, y); };
      return { hero: d.at(h.x, h.y), focus: pt(sc.focus[0], sc.focus[1]), close: pt(sc.close[0], sc.close[1]), scale: d.screen.scale, w: d.screen.w, h: d.screen.h, info, done };
    }, [sc, res.ids, res.hx, res.hy, done]);
    console.log('  ', JSON.stringify(focus.info), JSON.stringify(done));
    await page.waitForTimeout(450);
    snap.note(sc.key.replace(':', '_'), focus);
    await snap(sc.key.replace(':', '_'));
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; window.__held = null; });
}
