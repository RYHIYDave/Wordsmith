// FLOOR 17, THE MASQUE, filmed in play for the owner (behind HIGH_CITY, switched on here alone): a hero of level 23 on the floor
// itself, the test bot fighting for him (nothing can kill him): the gates' hall; a pack of masked dancers waltzing in pairs, then
// noticing him and whirling at him; the ebony clock chiming (they stop dead and look, then all come); the footmen; the Silent
// Order. A picture every thirtieth of a second of the game's time (python3 tools/princess_film.py <dir> <out.mp4>). The Prince's
// fight is tools/scenarios/high17_prince.mjs (STILLS=0).
//   node tools/playtest.mjs --file dist/floor17.html --size 1280x720 --scenario tools/scenarios/floor17_film.mjs --out shots/f17film/g
const FPS = 30;
export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 3); d.seasoned(23); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 17);
    window.__dbg.game().level.explored.fill(1);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
  });
  await page.waitForTimeout(2000);
  const room = (role) => page.evaluate((role) => { const q = window.__dbg.game().level.land.masque.rooms.find((r) => r.role === role); return { x0: q.r[0], y0: q.r[1], x1: q.r[2], y1: q.r[3] }; }, role);
  const violet = await room('violet');
  const white = await room('white');
  const green = await room('green');
  // scenes: [from (s), title, line, what to do]
  const scenes = [
    [0, 'THE MASQUE', 'Floor 17. Into the palace, where the prince’s masked ball has gone on for weeks.', 'start'],
    [4, 'THE MASKED DANCERS', 'They waltz in pairs, in their room’s colours, until they notice you.', 'waltz'],
    [8, 'THE MASKED DANCERS', 'Then they break off and whirl at you. Their spin strikes a tile and a half round.', 'whirl'],
    [16, 'THE EBONY CLOCK CHIMES', 'Every dancer stops dead and turns to look at you; then they all come at once.', 'chime'],
    [25, 'THE FOOTMEN', 'The tray flung out and back; the candelabrum’s fan of fire.', 'footmen'],
    [36, 'THE SILENT ORDER', 'Still, then sudden. The thrown knife; the hushing palm darkens your words.', 'order'],
  ];
  const seconds = 47;
  snap.note('film', { fps: FPS, from: 0, parts: scenes.map(([t, a, b]) => [t, a, b]), size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const go = (what) => page.evaluate(([what, violet, white, green]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const clear = () => { for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss); g.projectiles.length = 0; g.perils.length = 0; };
    const lay = (kind, n, cx, cy, awake) => {
      for (let i = 0; i < n; i++) {
        const a = (i >> (kind === 'dancer' ? 1 : 0)) * 2.1; const r = kind === 'dancer' ? 2.2 : 1.6;
        const m = g.spawn(kind, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 960, 0, false, g.rng);
        m.words = []; m.carries = []; m.shield = 0;
        if (awake) { m.state = 'chase'; m.cd = 0.4; }
      }
    };
    if (what === 'waltz') {
      clear();
      const cx = (violet.x0 + violet.x1) / 2; const cy = (violet.y0 + violet.y1) / 2;
      h.x = violet.x0 + 1.5; h.y = violet.y1 - 1.5;
      lay('dancer', 6, cx + 1, cy - 1, false);
      for (const m of g.monsters) if (m.kind === 'dancer') m.life = m.maxLife = 1e6;
      d.bot(false);
    } else if (what === 'whirl') {
      const cx = (violet.x0 + violet.x1) / 2; const cy = (violet.y0 + violet.y1) / 2;
      h.x = cx - 2.5; h.y = cy + 1.5;
      for (const m of g.monsters) if (m.kind === 'dancer') m.life = m.maxLife = 400;
      d.bot(true);
    } else if (what === 'chime') {
      // (more of them about him, and the clock made to chime a moment in)
      const cx = (violet.x0 + violet.x1) / 2; const cy = (violet.y0 + violet.y1) / 2;
      lay('dancer', 6, cx + 3, cy + 2, true);
      for (const m of g.monsters) if (m.kind === 'dancer') m.life = m.maxLife = 600;
    } else if (what === 'footmen') {
      clear();
      const cx = (white.x0 + white.x1) / 2; const cy = (white.y0 + white.y1) / 2;
      h.x = cx - 3.5; h.y = cy + 2;
      lay('footman', 3, cx + 2, cy - 1.5, true);
      for (const m of g.monsters) if (m.kind === 'footman') m.life = m.maxLife = 1500;
      d.bot(true);
    } else if (what === 'order') {
      clear();
      const cx = (green.x0 + green.x1) / 2; const cy = (green.y0 + green.y1) / 2;
      h.x = cx - 4; h.y = cy + 3;
      lay('order', 3, cx + 3, cy - 3, true);
      for (const m of g.monsters) if (m.kind === 'order') m.life = m.maxLife = 1500;
      d.bot(true);
    }
  }, [what, violet, white, green]);
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  let next = 0;
  for (let i = 0; i < total; i++) {
    while (next < scenes.length && scenes[next][0] * FPS <= i) await go(scenes[next++][3]);
    if (i === 17 * FPS) await page.evaluate(() => window.__dbg.masqueChime());
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 90 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); return g.monsters.filter((m) => !m.dead && !m.boss).map((m) => `${m.kind[0]}:${m.state === 'sleep' ? 'z' : m.act ? m.act.id.split(':')[1] : m.anim}`).join(' '); }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
