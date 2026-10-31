// FLOOR 19, THE KEEP, filmed in play for the owner (behind HIGH_CITY, switched on here alone): a hero of level 24 on the floor
// itself, the test bot fighting for him where there is a fight (nothing can kill him): the bailey and the keep's great doors; the
// gate passage and its murder holes; a portcullis slamming down across a hall; the crossbowmen planted on the wall walk, their
// red lanes and bolts; the Order's armed last and their fan of three; the battlements; the throne hall, his songbird lying broken
// before the throne. A picture every thirtieth of a second of the game's time (python3 film_cut.py <dir> <out.mp4>). The King's
// fight is tools/scenarios/high19_king.mjs (STILLS=0).
//   node tools/playtest.mjs --file dist/floor19.html --size 1280x720 --scenario tools/scenarios/floor19_film.mjs --out shots/f19film/k
const FPS = 30;
export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 4);
  await page.evaluate(([cls, seed]) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, seed); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 19);
    window.__dbg.game().level.explored.fill(1);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
  }, [cls, seed]);
  await page.waitForTimeout(2500);
  const scenes = [
    [0, 'THE KEEP', 'Floor 19. The old castle at the hill’s crown, where the king lies dying.', 'start'],
    [4, 'THE GATE PASSAGE', 'Murder holes in its roof drop burning pitch.', 'holes'],
    [10, 'THE PORTCULLISES', 'They slam down to cut a hall in two.', 'portcullis'],
    [18, 'THE CROSSBOWMEN', 'Planted on the walls, they stand and shoot. The red lane is where the bolt flies.', 'xbow'],
    [28, 'THE ORDER’S ARMED LAST', 'Cloaks over mail. They throw a fan of three knives.', 'order'],
    [36, 'THE WALL WALK', 'Battlements, and the night sky beyond them.', 'walk'],
    [40, 'THE THRONE HALL', 'His throne, and his clockwork songbird lying broken before it.', 'throne'],
  ];
  const seconds = 45;
  snap.note('film', { fps: FPS, from: 0, parts: scenes.map(([t, a, b]) => [t, a, b]), size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const go = (what) => page.evaluate((what) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const L = g.level; const K = L.land.keep;
    const clear = () => { for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss); g.projectiles.length = 0; g.perils = g.perils.filter((p) => !p.a1 || p.a1.startsWith('gking:hush')); };
    const room = (role, k = 0) => K.rooms.filter((r) => r.role === role)[k];
    const mid = (q) => ({ x: (q.r[0] + q.r[2]) / 2, y: (q.r[1] + q.r[3]) / 2 });
    const along = (q) => q.r[2] - q.r[0] >= q.r[3] - q.r[1];
    const spawn = (kind, x, y) => { const m = g.spawn(kind, x, y, 970, 0, false, g.rng); m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 260; m.state = 'chase'; return m; };
    if (what === 'start') {
      // (in the bailey, toward its far wall and the great doors open in it)
      const q = room('bailey'); const c = mid(q);
      h.x = c.x; h.y = c.y + 2;
      d.bot(false);
    } else if (what === 'holes') {
      clear();
      const z = (L.floor.hazards ?? [])[0];
      if (z) { h.x = z.x + 0.5 + 1.6; h.y = z.y + 0.5 + 1.6; }
      d.bot(false);
    } else if (what === 'portcullis') {
      clear();
      const p = K.portcullises[0];
      if (p) { h.x = p.alongX ? p.x + p.n / 2 : p.x + 2.5; h.y = p.alongX ? p.y + 2.5 : p.y + p.n / 2; }
      d.bot(false);
    } else if (what === 'xbow') {
      clear();
      // (on the wall walk, three of them planted up it, the hero coming at them)
      const q = room('walk'); const ax = along(q);
      const len = ax ? q.r[2] - q.r[0] : q.r[3] - q.r[1];
      const at = (k, side) => (ax ? { x: q.r[0] + k + 0.5, y: q.r[1] + 1.5 + side } : { x: q.r[0] + 1.5 + side, y: q.r[1] + k + 0.5 });
      const hp = at(Math.max(2, Math.floor(len / 2) - 6), 1.5);
      h.x = hp.x; h.y = hp.y;
      for (const [k, s] of [[Math.floor(len / 2) + 3, 0.5], [Math.floor(len / 2) + 5, 2], [Math.floor(len / 2) + 7, 1]]) { const p = at(Math.min(len - 2, k), s); spawn('xbow', p.x, p.y); }
      d.bot(true);
    } else if (what === 'order') {
      clear();
      const q = room('hall', 1) ?? room('hall'); const c = mid(q); const ax = along(q);
      h.x = c.x - (ax ? 4 : 0); h.y = c.y - (ax ? 0 : 4);
      for (const k of [-1, 0, 1]) spawn('order', c.x + (ax ? 3 : k * 1.5), c.y + (ax ? k * 1.5 : 3));
      d.bot(true);
    } else if (what === 'walk') {
      clear();
      const q = room('walk'); const c = mid(q);
      h.x = c.x; h.y = c.y + (along(q) ? 1 : 0);
      d.bot(false);
    } else if (what === 'throne') {
      clear();
      const q = room('throne');
      h.x = (q.r[0] + q.r[2]) / 2 + 1; h.y = q.r[3] - 2.5;
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
    if (i % 90 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); return g.monsters.filter((m) => !m.dead && !m.boss).map((m) => `${m.kind}:${m.act ? m.act.id.split(':')[1] : m.anim}`).join(' '); }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
