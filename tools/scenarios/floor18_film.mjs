// FLOOR 18, THE GLASS GALLERY, filmed in play for the owner (behind HIGH_CITY, switched on here alone): a hero of level 24 on the
// floor itself, the test bot fighting for him (nothing can kill him): a gallery of mirrors; blows near the mirrors cracking them
// and bursting them; his reflections stepping out of the mirrors and fighting with his own moves; a skylight giving way; the
// chapel and the glasshouse. A picture every thirtieth of a second of the game's time (python3 tools/princess_film.py <dir>
// <out.mp4>). The Queen's fight is tools/scenarios/high18_queen.mjs (STILLS=0).
//   node tools/playtest.mjs --file dist/floor18.html --size 1280x720 --scenario tools/scenarios/floor18_film.mjs --out shots/f18film/g
const FPS = 30;
export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  const cls = process.env.CLS || 'warrior';
  await page.evaluate((cls) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, 3); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 18);
    window.__dbg.game().level.explored.fill(1);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
  }, cls);
  await page.waitForTimeout(2000);
  const scenes = [
    [0, 'THE GLASS GALLERY', 'Floor 18. The queen’s wing: long galleries of mirrors.', 'start'],
    [4, 'THE MIRRORS', 'A blow near a mirror cracks it; the next bursts it.', 'mirrors'],
    [14, 'YOUR REFLECTIONS', 'Glass copies of you step out and fight with your moves.', 'reflections'],
    [26, 'THE SKYLIGHTS', 'A skylight cracks underfoot and gives way.', 'skylight'],
    [32, 'THE CHAPEL', 'A chapel of stained glass, and Snow White’s glass coffin.', 'chapel'],
    [36, 'THE GLASSHOUSE', 'The glasshouse of dead orchids under a roof of panes.', 'glasshouse'],
  ];
  const seconds = 40;
  snap.note('film', { fps: FPS, from: 0, parts: scenes.map(([t, a, b]) => [t, a, b]), size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const go = (what) => page.evaluate((what) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const L = g.level; const G = L.land.gallery;
    const clear = () => { for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss); g.projectiles.length = 0; g.perils = g.perils.filter((p) => p.a1 === 'gqueen:hall'); };
    const room = (role, k = 0) => G.rooms.filter((r) => r.role === role)[k];
    const mirrors = L.props.filter((p) => p.name === 'a tall mirror' && (p.variant >> 1) === 0);
    // (a mirror in a gallery past the first, and the floor before it)
    const inRoom = (p, q) => p.tx >= q.r[0] && p.ty >= q.r[1] && p.tx < q.r[2] && p.ty < q.r[3];
    const galleries = G.rooms.filter((r) => r.role === 'gallery' && r.path > 1);
    const pick = (k) => { const q = galleries[k % galleries.length]; const ms = mirrors.filter((p) => inRoom(p, q)); return ms[Math.floor(ms.length / 2)] ?? mirrors[k]; };
    const before = (p, out) => { const f = p.variant & 1; return f === 0 ? { x: p.tx + 0.5, y: p.ty + out, fx: 0, fy: 1 } : { x: p.tx + out, y: p.ty + 0.5, fx: 1, fy: 0 }; };
    if (what === 'start') {
      const q = galleries[0];
      h.x = (q.r[0] + q.r[2]) / 2; h.y = (q.r[1] + q.r[3]) / 2;
      d.bot(false);
    } else if (what === 'mirrors') {
      clear();
      const p = pick(0); const at = before(p, 1.4);
      h.x = at.x + at.fy * 2.2; h.y = at.y + at.fx * 2.2; h.fx = -at.fy; h.fy = -at.fx;
      // (a copy that stands to be struck, before the mirror: his blows land by its glass)
      const m = g.spawn('reflection', at.x, at.y, 960, 0, false, g.rng);
      m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 1e6; m.cd = 1e9; m.speed = 0; m.state = 'chase';
      m.a1 = { outDone: 1 };
      d.bot(true);
    } else if (what === 'reflections') {
      clear();
      const p = pick(1); const at = before(p, 3.2);
      h.x = at.x; h.y = at.y;
      for (const k of [-1.6, 1.6]) {
        const m = g.spawn('reflection', at.x + at.fy * k, at.y + at.fx * k - 1.5 * at.fy, 960, 0, false, g.rng);
        m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 900; m.state = 'chase';
      }
      d.bot(true);
    } else if (what === 'skylight') {
      clear();
      const z = (L.floor.hazards ?? [])[0];
      if (z) { h.x = z.x + 0.5; h.y = z.y + 0.5; }
      d.bot(false);
    } else if (what === 'chapel' || what === 'glasshouse') {
      clear();
      const q = room(what);
      h.x = (q.r[0] + q.r[2]) / 2; h.y = (q.r[1] + q.r[3]) / 2 + 1;
      d.bot(false);
    }
  }, what);
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  let next = 0;
  for (let i = 0; i < total; i++) {
    while (next < scenes.length && scenes[next][0] * FPS <= i) await go(scenes[next++][3]);
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 90 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const L = g.level; const mir = L.props.filter((p) => p.name === 'a tall mirror'); const st = [0, 0, 0]; for (const p of mir) st[p.variant >> 1]++; return `mirrors ${st.join('/')} ` + g.monsters.filter((m) => !m.dead && !m.boss).map((m) => `${m.kind[0]}:${m.act ? m.act.id.split(':')[1] : m.anim}`).join(' '); }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
