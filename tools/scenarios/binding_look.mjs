// BINDING AT WORK (render/binding3.ts, behind BINDING3, off in the game): in the practice room, in
// front, behind and on a monster, filmed as the game draws it, a picture every thirtieth of a second of
// the game's own time (the game is slowed so that the camera keeps up). His pick, 21 Oct 2026: “Bands of
// written words (Recommended)”. With no rules for it yet, the page does by hand what the rules will
// (__dbg.binding3: its hits bind, its snare springs on the first to cross it, a monster roots the hero).
//   node tools/build_to.mjs dist/binding_look.html
//   node tools/playtest.mjs --file dist/binding_look.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/binding_look.mjs --out shots/bl/binding/binding
//   env: STILLS=1: only the frames named in `stills`, at the game's own speed (a quick look)
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands.
export default async function (page, snap) {
  const stillsOnly = process.env.STILLS === '1';
  const bad = (s) => console.log(`  !! ${s}`);
  // who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you)
  const layout = [['skeleton', 1.25, -0.2, 'target'], ['cultist', 1.1, 1.7, 'second'], ['skeleton', 4.6, 1.6, 'walker'], ['cultist', 3.4, -1.6, 'caster']];
  const plan = {
    frames: 285,
    at: {
      0: [['hits', 2.6]],
      3: [['attack', 'target']],
      38: [['attack', 'second']],
      108: [['hits', 0], ['snares', true], ['snare', 2.6, 1.0, 1.0]],
      122: [['walk', 'walker', 1.6, 0.8]],
      206: [['face', 'caster'], ['cast', 'caster']],
      216: [['root', 'caster', 2.2]],
    },
    stills: [8, 14, 22, 40, 70, 112, 150, 158, 166, 200, 214, 222, 232, 260],
    behind: 108,
    monster: 206,
  };
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false);
    d.practice('warrior', 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    for (const side of ['front', 'behind']) for (let k = 0; k < 3; k++) g.unsocket(0, side, k);
    d.binding3.switch.on = true; d.binding3.clear();
  });
  await page.waitForTimeout(500);
  const ids = await page.evaluate((layout) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = { all: [] };
    for (const [kind, ax, dn, role] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.words = [];
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      out[role] = m.id; out.all.push(m.id);
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  }, layout);
  if (ids.all.length !== layout.length) bad(`only ${ids.all.length} of ${layout.length} stood: ${JSON.stringify(ids)}`);
  else console.log('  ok everyone stands where the plan puts them', JSON.stringify(ids));
  await page.waitForTimeout(stillsOnly ? 300 : 4000);
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }), behind: plan.behind, monster: plan.monster });

  const act = async (a) => page.evaluate(([what, args, ids]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const b = d.binding3;
    const mon = (role) => g.monsters.find((q) => q.id === ids[role] && !q.dead);
    const at = (ax, dn) => [h.x + (ax + dn) / 2 * 1.4, h.y + (dn - ax) / 2 * 1.4];
    if (what === 'hits') { b.hits(args[0]); return 'ok'; }
    if (what === 'snares') { b.snares(args[0]); return 'ok'; }
    if (what === 'snare') { const [x, y] = at(args[0], args[1]); b.lay(x, y, args[2]); return 'ok'; }
    if (what === 'attack') {
      const m = mon(args[0]); if (!m) return 'none';
      h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
      const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
      g.useBasic(m.x, m.y); return 'ok';
    }
    if (what === 'walk') { const m = mon(args[0]); if (!m) return 'none'; const [x, y] = at(args[1], args[2]); m.walkTo = { x, y }; m.anim = 'walk'; return 'ok'; }
    if (what === 'face') { const m = mon(args[0]); if (!m) return 'none'; const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far; return 'ok'; }
    if (what === 'cast') { const m = mon(args[0]); if (!m) return 'none'; m.anim = 'attack'; m.animT = 0; return 'ok'; }
    if (what === 'root') { const m = mon(args[0]); if (!m) return 'none'; b.root(args[1], m.x, m.y); return 'ok'; }
    return 'what?';
  }, [a[0], a.slice(1), ids]);
  const doAll = async (f) => { for (const a of plan.at[f] || []) { const r = await act(a); if (r !== 'ok') bad(`f${f} ${a[0]}: ${r}`); } };
  const walk = () => page.evaluate(() => {
    const g = window.__dbg.game();
    for (const m of g.monsters) {
      if (!m.walkTo || m.dead) continue;
      const dx = m.walkTo.x - m.x; const dy = m.walkTo.y - m.y; const d = Math.hypot(dx, dy);
      if (d < 0.05) { m.walkTo = null; m.anim = 'idle'; continue; }
      const s = Math.min(d, 0.045); m.x += (dx / d) * s; m.y += (dy / d) * s; m.fx = dx / d; m.fy = dy / d;
    }
  });

  if (stillsOnly) {
    const t0 = Date.now();
    const last = Math.max(...plan.stills, ...Object.keys(plan.at).map(Number));
    for (let f = 0; f <= last; f++) {
      const wait = t0 + (f * 1000) / 30 - Date.now();
      if (wait > 0) await page.waitForTimeout(Math.min(wait, 33));
      await doAll(f);
      await walk();
      if (plan.stills.includes(f)) await snap(`s${String(f).padStart(3, '0')}`);
    }
  } else {
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
      await walk();
      await snap(`f${String(i).padStart(3, '0')}`);
    }
    const c1 = await page.evaluate(() => window.__dbg.clock());
    console.log(`  the game's own time over the film: ${(c1 - c0).toFixed(2)} s for ${plan.frames} pictures`);
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  }
  const did = await page.evaluate(() => { const s = window.__dbg.binding3.state; return { holds: s.holds.length, burns: s.burns.length, snares: window.__dbg.game().zones.filter((z) => z.look === 'binding').length }; });
  console.log('  at the end:', JSON.stringify(did));
}
